import { supabase } from '../lib/supabase';

const DEVICES_TABLE = 'connected_devices';
const EVENTS_TABLE = 'device_sync_events';

let deviceCache = null;
let cacheTime = 0;
const CACHE_TTL = 30000;

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
      'Sign in to manage connected devices.'
    );
  }

  return user;
}

function localDeviceId() {
  if (typeof window === 'undefined') {
    return 'server';
  }

  let id = localStorage.getItem(
    'aarush_device_id'
  );

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(
      'aarush_device_id',
      id
    );
  }

  return id;
}

function detectType() {
  if (typeof navigator === 'undefined') {
    return 'Web Browser';
  }

  const ua = navigator.userAgent;

  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad|Tablet/i.test(ua)) return 'Tablet';
  if (/Windows/i.test(ua)) return 'Windows Laptop';
  if (/Macintosh/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';

  return 'Web Browser';
}

async function logEvent(
  deviceId,
  eventType,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      user_id: user.id,
      device_id: deviceId || null,
      event_type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeMultiDevice() {
  if (guestMode()) {
    return {
      guest: true,
      status: 'local-only',
      device_id: localDeviceId(),
      device_type: detectType(),
    };
  }

  const user = await requireUser();
  const deviceId = localDeviceId();

  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .upsert(
      {
        user_id: user.id,
        device_id: deviceId,
        device_type: detectType(),
        name: `${detectType()} device`,
        status: 'connected',
        last_activity_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,device_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  deviceCache = data;
  cacheTime = Date.now();

  return data;
}

export async function getConnectedDevices() {
  if (guestMode()) {
    return [
      {
        device_id: localDeviceId(),
        device_type: detectType(),
        status: 'local-only',
        is_trusted: false,
      },
    ];
  }

  if (
    deviceCache &&
    Date.now() - cacheTime < CACHE_TTL
  ) {
    return deviceCache.devices || [];
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('last_activity_at', {
      ascending: false,
    });

  if (error) throw error;

  deviceCache = {
    devices: data || [],
  };
  cacheTime = Date.now();

  return data || [];
}

export async function connectDevice({
  deviceId,
  name,
  deviceType,
} = {}) {
  if (guestMode()) {
    throw new Error(
      'Guests can only use local device continuity.'
    );
  }

  const user = await requireUser();

  if (!deviceId) {
    throw new Error('Device ID is required.');
  }

  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .upsert(
      {
        user_id: user.id,
        device_id: deviceId,
        name: name || `${deviceType} device`,
        device_type: deviceType || 'Web Browser',
        status: 'connected',
        last_activity_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,device_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  deviceCache = null;
  await logEvent(deviceId, 'connected');

  return data;
}

export async function disconnectDevice(deviceId) {
  const user = await requireUser();

  const { error } = await supabase
    .from(DEVICES_TABLE)
    .update({
      status: 'disconnected',
      disconnected_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('device_id', deviceId);

  if (error) throw error;

  deviceCache = null;
  await logEvent(deviceId, 'disconnected');

  return true;
}

export async function revokeDeviceConnection(
  deviceId
) {
  return disconnectDevice(deviceId);
}

async function syncCategory(
  deviceId,
  category,
  payload = {}
) {
  if (guestMode()) {
    return {
      category,
      status: 'local-only',
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      user_id: user.id,
      device_id: deviceId,
      event_type: `sync_${category}`,
      metadata: payload,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) throw error;

  return {
    category,
    status: 'synced',
    event: data,
  };
}

export async function syncDeviceState(
  deviceId,
  payload = {}
) {
  return syncCategory(
    deviceId,
    'device_state',
    payload
  );
}

export async function syncChats(
  deviceId,
  payload = {}
) {
  return syncCategory(deviceId, 'chats', payload);
}

export async function syncPosts(
  deviceId,
  payload = {}
) {
  return syncCategory(deviceId, 'posts', payload);
}

export async function syncStories(
  deviceId,
  payload = {}
) {
  return syncCategory(deviceId, 'stories', payload);
}

export async function syncSettings(
  deviceId,
  payload = {}
) {
  return syncCategory(deviceId, 'settings', payload);
}

export async function syncSecurityState(
  deviceId,
  payload = {}
) {
  return syncCategory(
    deviceId,
    'security',
    payload
  );
}

export async function syncAllDevices(
  payload = {}
) {
  const devices = await getConnectedDevices();

  const connected = devices.filter(
    (device) =>
      device.status === 'connected' ||
      device.status === 'synced'
  );

  const results = [];

  for (const device of connected) {
    results.push(
      await syncDeviceState(
        device.device_id,
        payload
      )
    );
  }

  return results;
}

export async function transferSessionToDevice(
  deviceId
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot transfer cloud sessions.'
    );
  }

  const user = await requireUser();
  const verificationCode = String(
    Math.floor(100000 + Math.random() * 900000)
  );

  const { data, error } = await supabase
    .from('device_transfers')
    .insert({
      user_id: user.id,
      source_device_id: localDeviceId(),
      target_device_id: deviceId,
      verification_code: verificationCode,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function verifyDeviceTransfer(
  transferId,
  verificationCode
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from('device_transfers')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
    })
    .eq('id', transferId)
    .eq('user_id', user.id)
    .eq('verification_code', verificationCode)
    .eq('status', 'pending')
    .select()
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error('Invalid device transfer code.');
  }

  return data;
}

export function subscribeToDeviceSync(
  callback
) {
  const channel = supabase
    .channel('aarush-device-sync')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: DEVICES_TABLE,
      },
      (payload) => {
        deviceCache = null;
        callback?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: EVENTS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}