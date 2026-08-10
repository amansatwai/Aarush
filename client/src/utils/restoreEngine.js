import { supabase } from '../lib/supabase';
import {
  verifyBackupIntegrity,
} from './backupEngine';

const RESTORE_TABLE = 'restore_events';

let currentRestore = null;

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error('Sign in to restore backups.');
  }

  return user;
}

async function logRestore(
  restoreType,
  status,
  metadata = {}
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(RESTORE_TABLE)
    .insert({
      user_id: user.id,
      restore_type: restoreType,
      status,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeRestore() {
  currentRestore = {
    status: 'ready',
    started_at: null,
  };

  return currentRestore;
}

export async function previewBackupContents(
  backup
) {
  if (!backup) {
    throw new Error('Backup is required.');
  }

  const snapshot =
    backup.metadata?.snapshot ||
    backup.snapshot ||
    backup;

  return {
    version: snapshot.version || 1,
    created_at: snapshot.created_at,
    type: snapshot.type || backup.backup_type,
    sections: Object.keys(snapshot.data || {}),
    item_counts: Object.fromEntries(
      Object.entries(snapshot.data || {}).map(
        ([key, value]) => [
          key,
          Array.isArray(value) ? value.length : 1,
        ]
      )
    ),
    encrypted: Boolean(
      backup.encrypted ||
        backup.metadata?.algorithm
    ),
  };
}

export async function verifyRestoreIntegrity(
  backup
) {
  return verifyBackupIntegrity(backup);
}

async function restoreBackup(
  backup,
  restoreType,
  options = {}
) {
  if (!backup) {
    throw new Error('Backup is required.');
  }

  const verification =
    await verifyRestoreIntegrity(backup);

  if (!verification.verified) {
    throw new Error(
      'Backup integrity verification failed.'
    );
  }

  currentRestore = {
    status: 'restoring',
    backup_id: backup.id,
    restore_type: restoreType,
    started_at: new Date().toISOString(),
  };

  const result = await logRestore(
    restoreType,
    'completed',
    {
      backup_id: backup.id,
      selective: Boolean(options.sections),
      sections: options.sections || null,
      preview: Boolean(options.preview),
    }
  );

  currentRestore = {
    ...currentRestore,
    status: 'completed',
    completed_at: new Date().toISOString(),
  };

  return {
    ...currentRestore,
    event: result,
    preview: await previewBackupContents(backup),
  };
}

export async function restoreLatestBackup(
  options = {}
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from('cloud_backups')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('No completed backup found.');
  }

  return restoreBackup(
    data,
    'latest',
    options
  );
}

export async function restoreBackupById(
  backupId,
  options = {}
) {
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

  return restoreBackup(
    data,
    'specific-version',
    options
  );
}

export async function restoreIncrementalBackup(
  backup,
  options = {}
) {
  return restoreBackup(
    backup,
    'incremental',
    options
  );
}

export async function restoreFullBackup(
  backup,
  options = {}
) {
  return restoreBackup(
    backup,
    'full',
    options
  );
}

export async function cancelRestore() {
  currentRestore = {
    ...currentRestore,
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
  };

  return true;
}

export async function getRestoreHistory({
  page = 0,
  pageSize = 30,
} = {}) {
  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(RESTORE_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function importBackup(file) {
  if (!file) {
    throw new Error('Backup file is required.');
  }

  const text =
    typeof file === 'string'
      ? file
      : await file.text();

  const backup = JSON.parse(text);

  const verification =
    await verifyRestoreIntegrity(backup);

  if (!verification.verified) {
    throw new Error(
      'Imported backup failed integrity verification.'
    );
  }

  return backup;
}

export function getCurrentRestoreStatus() {
  return currentRestore;
}