import { supabase } from '../lib/supabase';

const DEVICES_TABLE = 'trusted_devices';
const CACHE_KEY = 'aarush_device_id';
const DEVICE_CACHE_TTL = 60000;

let deviceCache = null;
let deviceCacheTime = 0;

function guestMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

function randomId() {
  if (
    typeof crypto !== 'undefined' &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getDeviceId() {
  if (typeof window === 'undefined') {
    return null;
  }

  let id = window.localStorage.getItem(CACHE_KEY);

  if (!id) {
    id = randomId();
    window.localStorage.setItem(CACHE_KEY, id);
  }

  return id;
}

function getBrowser() {
  const userAgent =
    typeof navigator === 'undefined'
      ? ''
      : navigator.userAgent;

  if (/Edg/i.test(userAgent)) return 'Edge';
  if (/Chrome/i.test(userAgent)) return 'Chrome';
  if (/Firefox/i.test(userAgent)) return 'Firefox';
  if (/Safari/i.test(userAgent)) return 'Safari';

  return 'Unknown browser';
}

function getOperatingSystem() {
  const userAgent =
    typeof navigator === 'undefined'
      ? ''
      : navigator.userAgent;

  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Mac OS/i.test(userAgent)) return 'macOS';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iPhone|iPad/i.test(userAgent)) return 'iOS';
  if (/Linux/i.test(userAgent)) return 'Linux';

  return 'Unknown OS';
}

function getDeviceSnapshot() {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    device_id: getDeviceId(),
    browser: getBrowser(),
    operating_system: getOperatingSystem(),
    screen_width: window.screen?.width || null,
    screen_height: window.screen?.height || null,
    timezone:
      Intl.DateTimeFormat().resolvedOptions()
        .timeZone || null,
    language: navigator.language || null,
    platform: navigator.platform || null,
    user_agent: navigator.userAgent || null,
  };
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error('Sign in to manage devices.');
  }

  return user;
}

export async function registerCurrentDevice() {
  if (guestMode()) {
    return {
      ...getDeviceSnapshot(),
      is_guest: true,
      is_trusted: false,
    };
  }

  const user = await requireUser();
  const snapshot = getDeviceSnapshot();

  const payload = {
    user_id: user.id,
    ...snapshot,
    last_activity_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .upsert(payload, {
      onConflict: 'user_id,device_id',
    })
    .select()
    .single();

  if (error) throw error;

  deviceCache = data;
  deviceCacheTime = Date.now();

  return data;
}

export async function getCurrentDevice() {
  if (deviceCache &&
      Date.now() - deviceCacheTime < DEVICE_CACHE_TTL) {
    return deviceCache;
  }

  if (guestMode()) {
    return {
      ...getDeviceSnapshot(),
      is_guest: true,
      is_trusted: false,
    };
  }

  const user = await requireUser();
  const deviceId = getDeviceId();

  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return registerCurrentDevice();
  }

  deviceCache = data;
  deviceCacheTime = Date.now();

  return data;
}

export async function getTrustedDevices() {
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

export async function trustDevice(deviceId) {
  if (guestMode()) {
    throw new Error('Guests cannot trust devices.');
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .update({
      is_trusted: true,
      trusted_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('device_id', deviceId)
    .select()
    .single();

  if (error) throw error;

  deviceCache = null;
  return data;
}

export async function untrustDevice(deviceId) {
  if (guestMode()) {
    throw new Error('Guests cannot modify devices.');
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .update({
      is_trusted: false,
      trusted_at: null,
    })
    .eq('user_id', user.id)
    .eq('device_id', deviceId)
    .select()
    .single();

  if (error) throw error;

  deviceCache = null;
  return data;
}

export async function revokeDevice(deviceId) {
  if (guestMode()) {
    throw new Error('Guests cannot revoke devices.');
  }

  const user = await requireUser();

  const { error } = await supabase
    .from(DEVICES_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('device_id', deviceId);

  if (error) throw error;

  deviceCache = null;
  return true;
}

export async function revokeAllOtherDevices() {
  if (guestMode()) {
    throw new Error('Guests cannot revoke devices.');
  }

  const user = await requireUser();
  const currentDeviceId = getDeviceId();

  const { error } = await supabase
    .from(DEVICES_TABLE)
    .delete()
    .eq('user_id', user.id)
    .neq('device_id', currentDeviceId);

  if (error) throw error;

  return true;
}

export async function isCurrentDeviceTrusted() {
  if (guestMode()) return false;

  const device = await getCurrentDevice();
  return Boolean(device?.is_trusted);
}

export async function updateDeviceActivity() {
  if (guestMode()) return null;

  const user = await requireUser();
  const deviceId = getDeviceId();

  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .update({
      last_activity_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('device_id', deviceId)
    .select()
    .maybeSingle();

  if (error) throw error;

  deviceCache = data || deviceCache;
  deviceCacheTime = Date.now();

  return data;
}

export function subscribeToDeviceChanges(callback) {
  const channel = supabase
    .channel('aarush-device-trust')
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
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function clearDeviceCache() {
  deviceCache = null;
  deviceCacheTime = 0;
}