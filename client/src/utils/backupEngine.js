import { supabase } from '../lib/supabase';

const BACKUPS_TABLE = 'cloud_backups';
const EVENTS_TABLE = 'backup_events';
const LOCAL_KEY = 'aarush_local_backups';

let statusCache = null;
let statusCacheTime = 0;
let automaticTimer = null;

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

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error('Sign in to manage backups.');
  }

  return user;
}

function getLocalBackups() {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(
      window.localStorage.getItem(LOCAL_KEY) ||
        '[]'
    );
  } catch {
    return [];
  }
}

function saveLocalBackups(backups) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    LOCAL_KEY,
    JSON.stringify(backups)
  );
}

function bytesToBase64(bytes) {
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

async function getSnapshot(type = 'full') {
  return {
    version: 1,
    type,
    created_at: new Date().toISOString(),
    data: {
      profile: null,
      settings: null,
      posts: [],
      stories: [],
      chats: [],
      notifications: [],
      security: null,
      recovery: null,
      media: [],
    },
  };
}

async function logBackupEvent(
  backupId,
  eventType,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      user_id: user.id,
      backup_id: backupId || null,
      event_type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeBackup() {
  if (guestMode()) {
    return {
      guest: true,
      status: 'local-only',
      automatic: false,
    };
  }

  const result = await getBackupStatus();

  return {
    guest: false,
    ...result,
  };
}

export async function createBackup({
  type = 'full',
  encrypted = false,
  metadata = {},
} = {}) {
  const snapshot = await getSnapshot(type);

  if (guestMode()) {
    const localBackup = {
      id: crypto.randomUUID(),
      type,
      encrypted,
      status: 'local-only',
      integrity_status: 'unverified',
      snapshot,
      created_at: new Date().toISOString(),
      metadata,
    };

    const backups = getLocalBackups();
    backups.unshift(localBackup);
    saveLocalBackups(backups);

    return localBackup;
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(BACKUPS_TABLE)
    .insert({
      user_id: user.id,
      backup_type: type,
      encrypted,
      status: 'completed',
      integrity_status: 'unverified',
      metadata: {
        ...metadata,
        snapshot,
      },
      size_bytes: JSON.stringify(snapshot).length,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  statusCache = null;
  await logBackupEvent(data.id, 'created', {
    type,
    encrypted,
  });

  return data;
}

export async function createEncryptedBackup(
  password,
  options = {}
) {
  if (!password || password.length < 8) {
    throw new Error(
      'Backup password must contain at least 8 characters.'
    );
  }

  const snapshot = await getSnapshot(
    options.type || 'full'
  );
  const salt = crypto.getRandomValues(
    new Uint8Array(16)
  );
  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 250000,
      hash: 'SHA-256',
    },
    material,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt']
  );

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    new TextEncoder().encode(
      JSON.stringify(snapshot)
    )
  );

  return createBackup({
    ...options,
    type: options.type || 'full',
    encrypted: true,
    metadata: {
      ...options.metadata,
      algorithm: 'AES-256-GCM',
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(
        new Uint8Array(ciphertext)
      ),
    },
  });
}

export async function createIncrementalBackup(
  options = {}
) {
  return createBackup({
    ...options,
    type: 'incremental',
  });
}

export async function createFullBackup(
  options = {}
) {
  return createBackup({
    ...options,
    type: 'full',
  });
}

export function scheduleAutomaticBackup(
  frequency = 'daily'
) {
  cancelAutomaticBackup();

  const intervals = {
    '15-minutes': 15 * 60 * 1000,
    hourly: 60 * 60 * 1000,
    '6-hours': 6 * 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
  };

  const delay = intervals[frequency];

  if (!delay || guestMode()) {
    return false;
  }

  automaticTimer = window.setInterval(() => {
    createIncrementalBackup({
      metadata: {
        automatic: true,
        frequency,
      },
    }).catch(() => {});
  }, delay);

  return true;
}

export function cancelAutomaticBackup() {
  if (automaticTimer) {
    window.clearInterval(automaticTimer);
    automaticTimer = null;
  }

  return true;
}

export async function getBackupStatus() {
  if (guestMode()) {
    const local = getLocalBackups();

    return {
      status: 'local-only',
      total: local.length,
      last_backup_at: local[0]?.created_at || null,
      encrypted: local.some(
        (backup) => backup.encrypted
      ),
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(BACKUPS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(1);

  if (error) throw error;

  const result = {
    status: data?.[0]?.status || 'pending',
    total: data?.length || 0,
    last_backup_at: data?.[0]?.created_at || null,
    encrypted: Boolean(data?.[0]?.encrypted),
  };

  statusCache = result;
  statusCacheTime = Date.now();

  return result;
}

export async function getBackupHistory({
  page = 0,
  pageSize = 30,
} = {}) {
  if (guestMode()) {
    const local = getLocalBackups();
    return local.slice(
      page * pageSize,
      page * pageSize + pageSize
    );
  }

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(BACKUPS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function deleteBackup(backupId) {
  if (guestMode()) {
    const next = getLocalBackups().filter(
      (backup) => backup.id !== backupId
    );

    saveLocalBackups(next);
    return true;
  }

  const user = await requireUser();

  const { error } = await supabase
    .from(BACKUPS_TABLE)
    .delete()
    .eq('id', backupId)
    .eq('user_id', user.id);

  if (error) throw error;

  statusCache = null;
  return true;
}

export async function verifyBackupIntegrity(
  backup
) {
  if (!backup) {
    throw new Error('Backup is required.');
  }

  const source =
    backup.metadata?.snapshot ||
    backup.snapshot ||
    backup;

  const valid = Boolean(
    source.version &&
      source.created_at &&
      source.data
  );

  if (!guestMode() && backup.id) {
    await supabase
      .from(BACKUPS_TABLE)
      .update({
        integrity_status: valid
          ? 'verified'
          : 'failed',
      })
      .eq('id', backup.id);
  }

  return {
    verified: valid,
    backup,
  };
}

export async function exportBackup(backup) {
  if (!backup) {
    throw new Error('Backup is required.');
  }

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    {
      type: 'application/json',
    }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `aarush-backup-${
    backup.id || Date.now()
  }.json`;
  anchor.click();

  URL.revokeObjectURL(url);

  return true;
}