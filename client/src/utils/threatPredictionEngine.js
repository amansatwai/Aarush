import { supabase } from '../lib/supabase';

const EVENTS_TABLE = 'security_events';
const CACHE_TTL = 30000;

let predictionCache = null;
let predictionCacheTime = 0;

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

async function getEvents() {
  if (guestMode()) return [];

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return [];

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(100);

  if (error) throw error;

  return data || [];
}

function levelFromScore(score) {
  if (score >= 85) return 'Critical';
  if (score >= 65) return 'High';
  if (score >= 40) return 'Elevated';
  if (score >= 20) return 'Moderate';
  if (score > 0) return 'Low';
  return 'Minimal';
}

function prediction(
  category,
  score,
  reason,
  systems,
  action
) {
  const normalized = Math.max(
    0,
    Math.min(100, Math.round(score))
  );

  return {
    category,
    score: normalized,
    level: levelFromScore(normalized),
    confidence: Math.min(
      98,
      Math.max(55, normalized + 20)
    ),
    reason,
    affected_systems: systems,
    suggested_action: action,
    estimated_impact:
      normalized >= 65
        ? 'High protection value'
        : 'Preventive protection value',
    generated_at: new Date().toISOString(),
  };
}

async function countMatching(types) {
  const events = await getEvents();

  return events.filter((event) =>
    types.includes(event.event_type)
  ).length;
}

export async function initializeThreatPrediction() {
  return {
    enabled: true,
    local_ready: true,
    personalized: !guestMode(),
    guest: guestMode(),
  };
}

export async function predictAccountTakeoverRisk() {
  const count = await countMatching([
    'login_failed',
    'rapid_login_attempts',
    'credential_stuffing',
    'new_device',
  ]);

  return prediction(
    'Account Takeover',
    count * 12,
    count
      ? 'Recent authentication or device events indicate increased account risk.'
      : 'No strong takeover indicators were found.',
    ['authentication', 'devices', 'sessions'],
    count
      ? 'Verify identity and review trusted devices.'
      : 'Continue normal monitoring.'
  );
}

export async function predictDeviceCompromiseRisk() {
  const count = await countMatching([
    'new_device',
    'rapid_device_changes',
    'device_untrusted',
  ]);

  return prediction(
    'Device Compromise',
    count * 15,
    count
      ? 'Recent device changes may require verification.'
      : 'No device compromise pattern was detected.',
    ['device trust', 'sessions'],
    count
      ? 'Verify or revoke unfamiliar devices.'
      : 'Keep device trust enabled.'
  );
}

export async function predictSessionHijackRisk() {
  const count = await countMatching([
    'session_hijacking_indicator',
    'token_reuse',
    'token_abuse',
    'impossible_travel',
  ]);

  return prediction(
    'Session Hijacking',
    count * 18,
    count
      ? 'Session or token anomalies were detected.'
      : 'No strong session hijacking indicators were found.',
    ['sessions', 'tokens', 'fingerprints'],
    count
      ? 'Verify the current session and revoke suspicious sessions.'
      : 'Continue session monitoring.'
  );
}

export async function predictPrivacyExposureRisk() {
  const count = await countMatching([
    'privacy_changed',
    'profile_visibility_changed',
    'emergency_privacy_disabled',
  ]);

  return prediction(
    'Privacy Exposure',
    count * 10,
    count
      ? 'Recent privacy changes may increase account exposure.'
      : 'Privacy exposure indicators are currently low.',
    ['privacy', 'profile', 'stories'],
    count
      ? 'Review social privacy settings.'
      : 'Keep current privacy controls.'
  );
}

export async function predictBackupFailureRisk() {
  const count = await countMatching([
    'backup_failed',
    'backup_corruption',
    'backup_missing',
  ]);

  return prediction(
    'Backup Failure',
    count * 18,
    count
      ? 'Backup operations require attention.'
      : 'No backup failure indicators were found.',
    ['backups', 'recovery'],
    count
      ? 'Create and verify a fresh backup.'
      : 'Maintain regular backup checks.'
  );
}

export async function predictSyncFailureRisk() {
  const count = await countMatching([
    'sync_failed',
    'conflict_detected',
    'offline_queue_failed',
  ]);

  return prediction(
    'Sync Failure',
    count * 14,
    count
      ? 'Recent synchronization events may cause continuity issues.'
      : 'Synchronization indicators are stable.',
    ['cloud sync', 'offline queue', 'devices'],
    count
      ? 'Run a sync check and repair pending actions.'
      : 'Continue background synchronization.'
  );
}

export function calculateFutureRiskScore(
  predictions = []
) {
  if (!predictions.length) return 0;

  return Math.round(
    predictions.reduce(
      (total, item) => total + item.score,
      0
    ) / predictions.length
  );
}

export function generatePreventiveRecommendations(
  predictions = []
) {
  return predictions
    .filter((item) => item.score >= 20)
    .map((item) => ({
      id: item.category,
      title: item.suggested_action,
      why: item.reason,
      confidence: item.confidence,
      affected_systems: item.affected_systems,
      impact: item.estimated_impact,
      level: item.level,
    }));
}

export function generateThreatForecast(
  predictions = []
) {
  const score = calculateFutureRiskScore(
    predictions
  );

  return {
    score,
    level: levelFromScore(score),
    predictions,
    recommendations:
      generatePreventiveRecommendations(
        predictions
      ),
    generated_at: new Date().toISOString(),
  };
}

export async function getPredictionStatus() {
  if (
    predictionCache &&
    Date.now() - predictionCacheTime < CACHE_TTL
  ) {
    return predictionCache;
  }

  if (guestMode()) {
    return {
      enabled: true,
      personalized: false,
      level: 'Minimal',
      score: 0,
      predictions: [],
      recommendations: [],
    };
  }

  const predictions = await Promise.all([
    predictAccountTakeoverRisk(),
    predictDeviceCompromiseRisk(),
    predictSessionHijackRisk(),
    predictPrivacyExposureRisk(),
    predictBackupFailureRisk(),
    predictSyncFailureRisk(),
  ]);

  const result = generateThreatForecast(
    predictions
  );

  predictionCache = result;
  predictionCacheTime = Date.now();

  return result;
}

export function clearPredictionCache() {
  predictionCache = null;
  predictionCacheTime = 0;
}