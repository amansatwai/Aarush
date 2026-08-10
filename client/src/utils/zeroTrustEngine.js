import { supabase } from '../lib/supabase';
import {
  getCurrentDevice,
  isCurrentDeviceTrusted,
} from './deviceTrustEngine';
import {
  verifySessionIntegrity,
} from './sessionSecurityEngine';

const EVENTS_TABLE = 'zero_trust_events';
const PROFILES_TABLE = 'profiles';

let trustCache = null;
let trustCacheTime = 0;
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
      'Sign in to use zero-trust protection.'
    );
  }

  return user;
}

function levelFromScore(score) {
  if (score >= 95) return 'Fully Trusted';
  if (score >= 80) return 'Verified';
  if (score >= 60) return 'High';
  if (score >= 35) return 'Medium';
  if (score > 0) return 'Low';
  return 'Unknown';
}

export function calculateTrustLevel(score) {
  return levelFromScore(
    Math.max(0, Math.min(100, Number(score || 0)))
  );
}

export function calculateIdentityConfidence({
  identity = false,
  device = false,
  session = false,
  recoveryDevice = false,
  riskScore = 0,
} = {}) {
  let score = 0;

  if (identity) score += 35;
  if (device) score += 25;
  if (session) score += 25;
  if (recoveryDevice) score += 15;

  score -= Math.min(35, Number(riskScore || 0));

  return Math.max(0, Math.min(100, score));
}

export async function generateZeroTrustEvent({
  eventType,
  severity = 'info',
  title,
  description,
  metadata = {},
} = {}) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      user_id: user.id,
      event_type: eventType,
      severity,
      title,
      description,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) throw error;

  trustCache = null;
  return data;
}

export async function getZeroTrustEvents({
  page = 0,
  pageSize = 30,
} = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function verifyIdentity() {
  if (guestMode()) {
    return {
      verified: false,
      reason: 'guest',
    };
  }

  const user = await requireUser();
  const verified = Boolean(user.email_confirmed_at);

  await generateZeroTrustEvent({
    eventType: 'identity_verification',
    severity: verified ? 'info' : 'warning',
    title: verified
      ? 'Identity verified'
      : 'Identity verification incomplete',
    description: verified
      ? 'The authenticated account identity was verified.'
      : 'The account email is not confirmed.',
  });

  return {
    verified,
    userId: user.id,
  };
}

export async function verifyDevice() {
  if (guestMode()) {
    return {
      verified: false,
      reason: 'guest',
    };
  }

  const device = await getCurrentDevice();
  const trusted = await isCurrentDeviceTrusted();

  await generateZeroTrustEvent({
    eventType: 'device_verification',
    severity: trusted ? 'info' : 'warning',
    title: trusted
      ? 'Device verified'
      : 'Device is not trusted',
    description: trusted
      ? 'The current device is trusted.'
      : 'The current device requires trust verification.',
    metadata: {
      device_id: device?.device_id,
    },
  });

  return {
    verified: trusted,
    trusted,
    device,
  };
}

export async function verifySession() {
  if (guestMode()) {
    return {
      verified: false,
      reason: 'guest',
    };
  }

  const result = await verifySessionIntegrity();

  await generateZeroTrustEvent({
    eventType: 'session_verification',
    severity: result.verified ? 'info' : 'warning',
    title: result.verified
      ? 'Session verified'
      : 'Session verification failed',
    description: result.verified
      ? 'The current session passed integrity checks.'
      : 'The current session requires additional verification.',
  });

  return result;
}

export async function verifyRecoveryDevice(
  deviceId
) {
  if (guestMode()) {
    return {
      verified: false,
      reason: 'guest',
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from('recovery_devices')
    .select('*')
    .eq('id', deviceId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  const verified = Boolean(data);

  if (verified) {
    await supabase
      .from('recovery_devices')
      .update({
        last_verified_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', deviceId)
      .eq('user_id', user.id);
  }

  return {
    verified,
    device: data || null,
  };
}

export async function evaluateRiskContext() {
  if (guestMode()) {
    return {
      riskScore: 0,
      suspicious: false,
    };
  }

  const events = await getZeroTrustEvents({
    page: 0,
    pageSize: 50,
  });

  const recent = events.filter(
    (event) =>
      Date.now() -
        new Date(event.created_at).getTime() <
      7 * 24 * 60 * 60 * 1000
  );

  const warnings = recent.filter((event) =>
    ['warning', 'critical'].includes(
      event.severity
    )
  );

  const riskScore = Math.min(
    100,
    warnings.length * 10
  );

  return {
    riskScore,
    suspicious: riskScore >= 35,
    recentWarnings: warnings,
  };
}

export async function initializeZeroTrust() {
  if (guestMode()) {
    return {
      guest: true,
      trustLevel: 'Unknown',
      identityVerified: false,
      deviceVerified: false,
      sessionVerified: false,
      recoveryDeviceVerified: false,
      identityConfidence: 0,
      riskScore: 0,
    };
  }

  if (
    trustCache &&
    Date.now() - trustCacheTime < CACHE_TTL
  ) {
    return trustCache;
  }

  const [
    identity,
    device,
    session,
    risk,
  ] = await Promise.all([
    verifyIdentity(),
    verifyDevice(),
    verifySession(),
    evaluateRiskContext(),
  ]);

  const identityConfidence =
    calculateIdentityConfidence({
      identity: identity.verified,
      device: device.verified,
      session: session.verified,
      riskScore: risk.riskScore,
    });

  const result = {
    guest: false,
    identityVerified: identity.verified,
    deviceVerified: device.verified,
    sessionVerified: session.verified,
    recoveryDeviceVerified: false,
    identityConfidence,
    riskScore: risk.riskScore,
    suspicious: risk.suspicious,
    trustLevel: calculateTrustLevel(
      identityConfidence
    ),
  };

  trustCache = result;
  trustCacheTime = Date.now();

  return result;
}

export async function authorizeSensitiveAction(
  action
) {
  const state = await initializeZeroTrust();

  const authorized =
    state.identityVerified &&
    state.deviceVerified &&
    state.sessionVerified &&
    state.trustLevel !== 'Unknown' &&
    state.trustLevel !== 'Low' &&
    !state.suspicious;

  await generateZeroTrustEvent({
    eventType: authorized
      ? 'sensitive_action_authorized'
      : 'sensitive_action_blocked',
    severity: authorized ? 'info' : 'warning',
    title: authorized
      ? 'Sensitive action authorized'
      : 'Sensitive action blocked',
    description: action,
    metadata: {
      trust_level: state.trustLevel,
      identity_confidence:
        state.identityConfidence,
    },
  });

  return {
    authorized,
    action,
    state,
  };
}

export async function requireStepUpAuthentication(
  action
) {
  const result = await authorizeSensitiveAction(
    action
  );

  return {
    required: !result.authorized,
    verified: result.authorized,
    ...result,
  };
}

export function clearZeroTrustCache() {
  trustCache = null;
  trustCacheTime = 0;
}

export function subscribeToZeroTrustChanges(
  callback
) {
  const channel = supabase
    .channel('aarush-zero-trust')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: EVENTS_TABLE,
      },
      (payload) => {
        clearZeroTrustCache();
        callback?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'recovery_devices',
      },
      (payload) => {
        clearZeroTrustCache();
        callback?.(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}