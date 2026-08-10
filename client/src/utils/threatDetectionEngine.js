import { supabase } from '../lib/supabase';

const EVENTS_TABLE = 'security_events';
const THREATS_TABLE = 'threat_events';
const SESSIONS_TABLE = 'secure_sessions';
const DEVICES_TABLE = 'trusted_devices';

let threatCache = null;
let threatCacheTime = 0;
const CACHE_TTL = 30000;

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

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error(
      'Sign in to use threat detection.'
    );
  }

  return user;
}

function severityFromScore(score) {
  if (score >= 90) return 'Emergency';
  if (score >= 70) return 'Critical';
  if (score >= 45) return 'High';
  if (score >= 20) return 'Medium';
  return 'Low';
}

export function classifyThreatSeverity(score) {
  return severityFromScore(
    Math.max(0, Math.min(100, Number(score || 0)))
  );
}

export function calculateThreatScore({
  failedLogins = 0,
  rapidDeviceChanges = 0,
  suspiciousSessions = 0,
  tokenAnomalies = 0,
  impossibleTravel = false,
  automation = false,
  replayIndicators = 0,
  credentialStuffing = false,
} = {}) {
  let score = 0;

  score += Math.min(30, failedLogins * 5);
  score += Math.min(20, rapidDeviceChanges * 6);
  score += Math.min(20, suspiciousSessions * 5);
  score += Math.min(15, tokenAnomalies * 5);
  score += impossibleTravel ? 20 : 0;
  score += automation ? 20 : 0;
  score += Math.min(20, replayIndicators * 8);
  score += credentialStuffing ? 30 : 0;

  return Math.min(100, score);
}

export async function generateThreatEvent({
  threatType,
  score = 0,
  severity,
  title,
  description,
  metadata = {},
  status = 'active',
} = {}) {
  if (guestMode()) {
    return null;
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(THREATS_TABLE)
    .insert({
      user_id: user.id,
      threat_type: threatType,
      score,
      severity:
        severity || classifyThreatSeverity(score),
      title,
      description,
      metadata,
      status,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  threatCache = null;
  return data;
}

export async function analyzeSecurityEvent(event) {
  const type = event?.event_type || '';
  const metadata = event?.metadata || {};

  const signals = {
    failedLogins:
      type === 'login_failed' ||
      type === 'rapid_login_attempts'
        ? 1
        : 0,
    rapidDeviceChanges:
      type === 'new_device' ? 1 : 0,
    suspiciousSessions:
      type.includes('session') ? 1 : 0,
    tokenAnomalies:
      type.includes('token') ? 1 : 0,
    impossibleTravel:
      type === 'impossible_travel',
    automation:
      type === 'automation_detected',
    replayIndicators:
      type === 'replay_attack' ? 1 : 0,
    credentialStuffing:
      type === 'credential_stuffing',
  };

  const score = calculateThreatScore(signals);

  if (score < 20) {
    return {
      score,
      severity: 'Low',
      actionable: false,
      event,
    };
  }

  return generateThreatEvent({
    threatType: type || 'security_event',
    score,
    title:
      event?.title || 'Suspicious security activity',
    description:
      event?.description ||
      'A security event requires monitoring.',
    metadata: {
      ...metadata,
      signals,
    },
  });
}

async function getRecentSecurityEvents(
  pageSize = 100
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(pageSize);

  if (error) throw error;

  return data || [];
}

export async function detectBruteForceAttack() {
  const events = await getRecentSecurityEvents();
  const cutoff = Date.now() - 15 * 60 * 1000;

  const failures = events.filter(
    (event) =>
      event.event_type === 'login_failed' &&
      new Date(event.created_at).getTime() > cutoff
  );

  if (failures.length < 5) {
    return null;
  }

  return generateThreatEvent({
    threatType: 'brute_force',
    score: Math.min(100, failures.length * 8),
    severity: failures.length >= 10 ? 'Critical' : 'High',
    title: 'Brute-force attack detected',
    description:
      'Repeated failed login attempts were detected.',
    metadata: {
      failed_attempts: failures.length,
    },
  });
}

export async function detectCredentialStuffing() {
  const events = await getRecentSecurityEvents();
  const cutoff = Date.now() - 30 * 60 * 1000;

  const loginEvents = events.filter(
    (event) =>
      [
        'login_failed',
        'login_success',
        'credential_check',
      ].includes(event.event_type) &&
      new Date(event.created_at).getTime() > cutoff
  );

  const uniqueLocations = new Set(
    loginEvents
      .map((event) => event.metadata?.location)
      .filter(Boolean)
  );

  if (
    loginEvents.length >= 8 &&
    uniqueLocations.size >= 3
  ) {
    return generateThreatEvent({
      threatType: 'credential_stuffing',
      score: 82,
      severity: 'Critical',
      title: 'Credential abuse detected',
      description:
        'Login activity resembles credential stuffing.',
      metadata: {
        attempts: loginEvents.length,
        locations: uniqueLocations.size,
      },
    });
  }

  return null;
}

export async function detectImpossibleTravel() {
  const events = await getRecentSecurityEvents();
  const loginEvents = events.filter((event) =>
    [
      'login_success',
      'session_created',
      'new_device',
    ].includes(event.event_type)
  );

  const locations = [
    ...new Set(
      loginEvents
        .map((event) => event.metadata?.location)
        .filter(Boolean)
    ),
  ];

  if (locations.length < 2) {
    return null;
  }

  return generateThreatEvent({
    threatType: 'impossible_travel',
    score: 68,
    severity: 'High',
    title: 'Impossible travel indicator',
    description:
      'Recent access activity came from different locations.',
    metadata: {
      locations,
    },
  });
}

export async function detectRapidDeviceChanges() {
  const user = await requireUser();
  const cutoff = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from(DEVICES_TABLE)
    .select('id, device_id, created_at')
    .eq('user_id', user.id)
    .gte('created_at', cutoff);

  if (error) throw error;

  if ((data || []).length < 4) {
    return null;
  }

  return generateThreatEvent({
    threatType: 'rapid_device_changes',
    score: 62,
    severity: 'High',
    title: 'Rapid device changes detected',
    description:
      'Several devices appeared on the account recently.',
    metadata: {
      device_count: data.length,
    },
  });
}

export async function detectMultipleSessionAnomalies() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(SESSIONS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (error) throw error;

  if ((data || []).length <= 8) {
    return null;
  }

  return generateThreatEvent({
    threatType: 'concurrent_sessions',
    score: 58,
    severity: 'High',
    title: 'Concurrent session anomaly',
    description:
      'An unusually high number of sessions is active.',
    metadata: {
      active_sessions: data.length,
    },
  });
}

export async function detectSuspiciousAutomation() {
  const events = await getRecentSecurityEvents();
  const automationEvents = events.filter(
    (event) =>
      event.metadata?.automation === true ||
      event.metadata?.request_rate > 60
  );

  if (!automationEvents.length) {
    return null;
  }

  return generateThreatEvent({
    threatType: 'suspicious_automation',
    score: 72,
    severity: 'High',
    title: 'Suspicious automation detected',
    description:
      'Activity patterns may be generated by automation.',
    metadata: {
      events: automationEvents.length,
    },
  });
}

export async function detectTokenAbuse() {
  const events = await getRecentSecurityEvents();
  const matches = events.filter((event) =>
    [
      'token_reuse',
      'token_refresh_anomaly',
      'invalid_token',
    ].includes(event.event_type)
  );

  if (!matches.length) {
    return null;
  }

  return generateThreatEvent({
    threatType: 'token_abuse',
    score: 78,
    severity: 'Critical',
    title: 'Token abuse detected',
    description:
      'Invalid or reused session-token indicators were found.',
    metadata: {
      matches: matches.length,
    },
  });
}

export async function detectReplayAttackIndicators() {
  const events = await getRecentSecurityEvents();
  const replay = events.filter(
    (event) =>
      event.event_type === 'replay_attack' ||
      event.metadata?.duplicate_request === true
  );

  if (!replay.length) {
    return null;
  }

  return generateThreatEvent({
    threatType: 'replay_attack',
    score: 84,
    severity: 'Critical',
    title: 'Replay attack indicator',
    description:
      'Repeated security-sensitive requests were detected.',
    metadata: {
      matches: replay.length,
    },
  });
}

export async function detectAccountTakeoverRisk() {
  const results = await Promise.all([
    detectBruteForceAttack(),
    detectCredentialStuffing(),
    detectImpossibleTravel(),
    detectRapidDeviceChanges(),
    detectMultipleSessionAnomalies(),
    detectSuspiciousAutomation(),
    detectTokenAbuse(),
    detectReplayAttackIndicators(),
  ]);

  const active = results.filter(Boolean);

  if (!active.length) {
    return {
      score: 0,
      severity: 'Low',
      threats: [],
    };
  }

  const score = Math.min(
    100,
    active.reduce(
      (total, threat) =>
        total + Number(threat.score || 0),
      0
    )
  );

  return {
    score,
    severity: classifyThreatSeverity(score),
    threats: active,
  };
}

export async function getThreatHistory({
  page = 0,
  pageSize = 30,
  status,
} = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(THREATS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

export async function initializeThreatDetection() {
  if (guestMode()) {
    return {
      score: 0,
      severity: 'Low',
      guest: true,
      threats: [],
    };
  }

  if (
    threatCache &&
    Date.now() - threatCacheTime < CACHE_TTL
  ) {
    return threatCache;
  }

  const result = await detectAccountTakeoverRisk();

  threatCache = result;
  threatCacheTime = Date.now();

  return result;
}

export function clearThreatCache() {
  threatCache = null;
  threatCacheTime = 0;
}

export function subscribeToThreatEvents(callback) {
  const channel = supabase
    .channel('aarush-threat-events')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: THREATS_TABLE,
      },
      (payload) => {
        clearThreatCache();
        callback?.(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}