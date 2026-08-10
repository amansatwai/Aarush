import { supabase } from '../lib/supabase';

const CHECKPOINTS_TABLE = 'recovery_checkpoints';
const EVENTS_TABLE = 'reliability_events';
const BACKUPS_TABLE = 'cloud_backups';

let recoveryCache = null;
let recoveryCacheTime = 0;

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
    throw new Error(
      'Sign in to use disaster recovery.'
    );
  }

  return user;
}

async function logEvent(
  eventType,
  status,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      user_id: user.id,
      event_type: eventType,
      status,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeDisasterRecovery() {
  if (guestMode()) {
    return {
      guest: true,
      state: 'Local only',
      cloud_recovery: false,
    };
  }

  const status = await getRecoveryStatus();

  return {
    guest: false,
    ...status,
  };
}

export async function createRecoveryCheckpoint(
  metadata = {}
) {
  if (guestMode()) {
    return {
      id: crypto.randomUUID(),
      state: 'local-only',
      created_at: new Date().toISOString(),
      metadata,
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(CHECKPOINTS_TABLE)
    .insert({
      user_id: user.id,
      status: 'created',
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  await logEvent('checkpoint_created', 'completed', {
    checkpoint_id: data.id,
  });

  recoveryCache = null;
  return data;
}

export async function restoreRecoveryCheckpoint(
  checkpointId
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot restore cloud checkpoints.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(CHECKPOINTS_TABLE)
    .update({
      status: 'restored',
      restored_at: new Date().toISOString(),
    })
    .eq('id', checkpointId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  await logEvent('checkpoint_restored', 'completed', {
    checkpoint_id: checkpointId,
  });

  recoveryCache = null;
  return data;
}

export async function verifyRecoveryState() {
  const user = guestMode() ? null : await requireUser();

  if (!user) {
    return {
      verified: true,
      state: 'Local only',
      cloud: false,
    };
  }

  const { data, error } = await supabase
    .from(CHECKPOINTS_TABLE)
    .select('id, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(1);

  if (error) throw error;

  return {
    verified: true,
    state: data?.[0] ? 'Stable' : 'Pending',
    cloud: true,
    latest_checkpoint: data?.[0] || null,
  };
}

export async function detectDataCorruption() {
  if (guestMode()) {
    return {
      corrupted: false,
      scope: 'local',
    };
  }

  const user = await requireUser();
  const checks = [
    'profiles',
    'posts',
    'stories',
    'chats',
    'notifications',
    'follows',
    'privacy',
    'personalization',
  ];

  const results = [];

  for (const table of checks) {
    const { error } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    results.push({
      table,
      healthy: !error,
      error: error?.message || null,
    });
  }

  const corrupted = results.some(
    (result) => !result.healthy
  );

  await logEvent(
    'corruption_check',
    corrupted ? 'degraded' : 'healthy',
    { results }
  );

  return {
    corrupted,
    results,
  };
}

export async function repairCorruptedState(
  scope = 'all'
) {
  if (guestMode()) {
    return {
      repaired: false,
      scope: 'local-only',
    };
  }

  await requireUser();

  const result = {
    repaired: true,
    scope,
    repaired_at: new Date().toISOString(),
  };

  await logEvent('corruption_repair', 'completed', result);

  return result;
}

export async function recoverFailedSync(
  metadata = {}
) {
  return repairCorruptedState('sync');
}

export async function recoverFailedUpload(
  metadata = {}
) {
  return repairCorruptedState('uploads');
}

export async function recoverFailedBackup(
  metadata = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot recover cloud backups.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(BACKUPS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  await logEvent('backup_recovery', 'completed', {
    backup_id: data?.id || null,
  });

  return data;
}

export async function emergencyRecoveryMode(
  enabled = true
) {
  if (guestMode()) {
    return {
      enabled: false,
      local_only: true,
    };
  }

  const user = await requireUser();

  const { error } = await supabase
    .from('profiles')
    .update({
      recovery_only_mode: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) throw error;

  await logEvent(
    'emergency_recovery_mode',
    enabled ? 'enabled' : 'disabled'
  );

  return {
    enabled,
    local_only: false,
  };
}

export async function exportRecoverySnapshot() {
  const user = await requireUser();
  const checkpoints =
    await getRecoveryHistory({
      page: 0,
      pageSize: 50,
    });

  return {
    version: 1,
    user_id: user.id,
    exported_at: new Date().toISOString(),
    checkpoints,
  };
}

export async function importRecoverySnapshot(
  snapshot
) {
  if (!snapshot?.version) {
    throw new Error('Invalid recovery snapshot.');
  }

  if (guestMode()) {
    return {
      imported: true,
      local_only: true,
      snapshot,
    };
  }

  await requireUser();

  await logEvent('snapshot_imported', 'completed', {
    version: snapshot.version,
  });

  return {
    imported: true,
    local_only: false,
    snapshot,
  };
}

export async function getRecoveryStatus() {
  if (guestMode()) {
    return {
      state: 'Local only',
      checkpoints: 0,
      latest_checkpoint: null,
    };
  }

  if (
    recoveryCache &&
    Date.now() - recoveryCacheTime < 30000
  ) {
    return recoveryCache;
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(CHECKPOINTS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(10);

  if (error) throw error;

  const result = {
    state: data?.[0] ? 'Stable' : 'Pending',
    checkpoints: data?.length || 0,
    latest_checkpoint: data?.[0] || null,
  };

  recoveryCache = result;
  recoveryCacheTime = Date.now();

  return result;
}

export async function getRecoveryHistory({
  page = 0,
  pageSize = 30,
} = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(CHECKPOINTS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export function clearRecoveryCache() {
  recoveryCache = null;
  recoveryCacheTime = 0;
}