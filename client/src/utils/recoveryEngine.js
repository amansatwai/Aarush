import { supabase } from '../lib/supabase';

const CODES_TABLE = 'recovery_codes';
const DEVICES_TABLE = 'recovery_devices';
const RECOVERY_TABLE = 'account_recovery_requests';

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
      'Sign in to manage account recovery.'
    );
  }

  return user;
}

async function hashCode(code) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(code)
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function randomCode() {
  const bytes = crypto.getRandomValues(
    new Uint8Array(8)
  );

  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, '0')
    )
    .join('')
    .toUpperCase()
    .match(/.{1,4}/g)
    .join('-');
}

export async function generateRecoveryCodes(
  count = 10
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot generate recovery codes.'
    );
  }

  const user = await requireUser();
  const codes = Array.from(
    { length: count },
    randomCode
  );

  await supabase
    .from(CODES_TABLE)
    .delete()
    .eq('user_id', user.id);

  const rows = await Promise.all(
    codes.map(async (code) => ({
      user_id: user.id,
      code_hash: await hashCode(code),
      used: false,
      created_at: new Date().toISOString(),
    }))
  );

  const { error } = await supabase
    .from(CODES_TABLE)
    .insert(rows);

  if (error) throw error;

  return codes;
}

export async function validateRecoveryCode(code) {
  if (!code) return false;

  const user = await requireUser();
  const codeHash = await hashCode(
    code.trim().toUpperCase()
  );

  const { data, error } = await supabase
    .from(CODES_TABLE)
    .select('id, used')
    .eq('user_id', user.id)
    .eq('code_hash', codeHash)
    .eq('used', false)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}

export async function consumeRecoveryCode(code) {
  const user = await requireUser();
  const codeHash = await hashCode(
    code.trim().toUpperCase()
  );

  const { data, error } = await supabase
    .from(CODES_TABLE)
    .update({
      used: true,
      used_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('code_hash', codeHash)
    .eq('used', false)
    .select()
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}

export async function regenerateRecoveryCodes(
  count = 10
) {
  return generateRecoveryCodes(count);
}

export async function registerRecoveryDevice({
  name,
  type = 'trusted browser',
  deviceId,
  trustLevel = 'Medium',
} = {}) {
  const user = await requireUser();

  if (!name || !deviceId) {
    throw new Error(
      'Recovery device name and ID are required.'
    );
  }

  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .upsert(
      {
        user_id: user.id,
        name,
        device_type: type,
        device_id: deviceId,
        trust_level: trustLevel,
        first_verified_at: new Date().toISOString(),
        last_verified_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,device_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getRecoveryDevices() {
  if (guestMode()) return [];

  const user = await requireUser();

  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('last_activity_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function removeRecoveryDevice(
  deviceId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(DEVICES_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('id', deviceId);

  if (error) throw error;

  return true;
}

export async function startAccountRecovery() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(RECOVERY_TABLE)
    .insert({
      user_id: user.id,
      status: 'started',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function verifyRecoveryIdentity({
  recoveryCode,
} = {}) {
  const valid = await validateRecoveryCode(
    recoveryCode
  );

  if (!valid) {
    throw new Error('Invalid recovery code.');
  }

  return {
    verified: true,
    recoveryCode,
  };
}

export async function completeAccountRecovery(
  requestId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(RECOVERY_TABLE)
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function cancelAccountRecovery(
  requestId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(RECOVERY_TABLE)
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('user_id', user.id);

  if (error) throw error;

  return true;
}

export async function emergencyAccountLock() {
  const user = await requireUser();

  const { error } = await supabase
    .from('profiles')
    .update({
      account_locked: true,
      account_locked_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) throw error;

  return true;
}

export async function emergencyAccountUnlock() {
  const user = await requireUser();

  const { error } = await supabase
    .from('profiles')
    .update({
      account_locked: false,
      account_locked_at: null,
    })
    .eq('id', user.id);

  if (error) throw error;

  return true;
}

export async function exportRecoveryPackage() {
  const user = await requireUser();
  const devices = await getRecoveryDevices();

  return {
    version: 1,
    user_id: user.id,
    exported_at: new Date().toISOString(),
    recovery_devices: devices,
    note:
      'Recovery codes are never exported from the server after generation.',
  };
}

export async function importRecoveryPackage(
  packageData
) {
  if (!packageData?.version) {
    throw new Error('Invalid recovery package.');
  }

  await requireUser();

  return {
    imported: true,
    version: packageData.version,
    recovery_devices:
      packageData.recovery_devices || [],
  };
}