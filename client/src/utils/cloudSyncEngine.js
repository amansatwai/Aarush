import { supabase } from '../lib/supabase';
import {
  getOfflineQueue,
  initializeOfflineMode,
  isOffline,
  processOfflineQueue,
} from './offlineEngine';

const SYNC_TABLE = 'cloud_sync_events';
const STATE_KEY = 'aarush_cloud_sync_state';

let syncState = {
  status: 'pending',
  last_sync_at: null,
  error: null,
};

let listeners = new Set();

function guestMode() {
  if (typeof window === 'undefined') return false;

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

function emit(nextState) {
  syncState = {
    ...syncState,
    ...nextState,
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      STATE_KEY,
      JSON.stringify(syncState)
    );
  }

  listeners.forEach((listener) => listener(syncState));
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error('Sign in to synchronize cloud data.');
  }

  return user;
}

async function writeSyncEvent(
  category,
  status,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(SYNC_TABLE)
    .insert({
      user_id: user.id,
      category,
      status,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

async function syncCategory(category) {
  if (guestMode()) {
    return {
      category,
      status: 'local-only',
    };
  }

  if (isOffline()) {
    return {
      category,
      status: 'offline',
    };
  }

  await writeSyncEvent(category, 'synced');

  return {
    category,
    status: 'synced',
  };
}

export async function syncProfiles() {
  return syncCategory('profiles');
}

export async function syncPosts() {
  return syncCategory('posts');
}

export async function syncStories() {
  return syncCategory('stories');
}

export async function syncChats() {
  return syncCategory('chats');
}

export async function syncNotifications() {
  return syncCategory('notifications');
}

export async function syncSettings() {
  return syncCategory('settings');
}

export async function syncSecurityState() {
  return syncCategory('security');
}

export async function syncNow() {
  if (guestMode()) {
    emit({
      status: 'local-only',
      error: null,
    });

    return {
      status: 'local-only',
      guest: true,
    };
  }

  if (isOffline()) {
    emit({
      status: 'offline',
      error: null,
    });

    return {
      status: 'offline',
      pending: (await getOfflineQueue()).length,
    };
  }

  try {
    emit({
      status: 'syncing',
      error: null,
    });

    await initializeOfflineMode();

    const categories = await Promise.all([
      syncProfiles(),
      syncPosts(),
      syncStories(),
      syncChats(),
      syncNotifications(),
      syncSettings(),
      syncSecurityState(),
    ]);

    const queueResult = await processOfflineQueue(
      async (item) => {
        await writeSyncEvent(
          `offline:${item.type}`,
          'synced',
          item.payload
        );
      }
    );

    const lastSync = new Date().toISOString();

    emit({
      status: queueResult.pending
        ? 'pending'
        : 'synced',
      last_sync_at: lastSync,
      error: null,
    });

    return {
      status: queueResult.pending
        ? 'pending'
        : 'synced',
      categories,
      pending: queueResult.pending,
      last_sync_at: lastSync,
    };
  } catch (syncError) {
    emit({
      status: 'failed',
      error:
        syncError?.message ||
        'Cloud synchronization failed.',
    });

    throw syncError;
  }
}

export async function initializeCloudSync() {
  await initializeOfflineMode();

  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(
      STATE_KEY
    );

    if (stored) {
      try {
        syncState = JSON.parse(stored);
      } catch {
        // Ignore invalid local sync state.
      }
    }

    window.addEventListener('online', () => {
      syncNow().catch(() => {});
    });

    window.addEventListener('offline', () => {
      emit({
        status: 'offline',
      });
    });
  }

  return syncState;
}

export function getSyncStatus() {
  if (isOffline()) {
    return {
      ...syncState,
      status: 'offline',
    };
  }

  return syncState;
}

export function getLastSyncTime() {
  return syncState.last_sync_at;
}

export function subscribeToSyncEvents(callback) {
  listeners.add(callback);

  const channel = supabase
    .channel('aarush-cloud-sync')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: SYNC_TABLE,
      },
      (payload) => {
        callback?.(payload);
      }
    )
    .subscribe();

  return () => {
    listeners.delete(callback);
    supabase.removeChannel(channel);
  };
}

export async function getSyncHistory({
  page = 0,
  pageSize = 30,
} = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(SYNC_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function createBackup() {
  if (guestMode()) {
    throw new Error(
      'Guests can only use local offline mode.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from('cloud_backups')
    .insert({
      user_id: user.id,
      backup_type: 'account',
      status: 'created',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function restoreBackup(backupId) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot restore cloud backups.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from('cloud_backups')
    .select('*')
    .eq('id', backupId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error('Backup not found.');
  }

  return data;
}