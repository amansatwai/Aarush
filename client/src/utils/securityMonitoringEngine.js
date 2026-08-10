import { supabase } from '../lib/supabase';
import {
  detectAccountTakeoverRisk,
  detectBruteForceAttack,
  detectCredentialStuffing,
  detectImpossibleTravel,
  detectRapidDeviceChanges,
  detectMultipleSessionAnomalies,
  detectReplayAttackIndicators,
  detectSuspiciousAutomation,
  detectTokenAbuse,
} from './threatDetectionEngine';

const ALERTS_TABLE = 'security_alerts';
const EVENTS_TABLE = 'security_events';

let monitorTimer = null;

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error(
      'Sign in to monitor account security.'
    );
  }

  return user;
}

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

export async function generateSecurityAlert({
  alertType,
  severity = 'Medium',
  title,
  description,
  metadata = {},
} = {}) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(ALERTS_TABLE)
    .insert({
      user_id: user.id,
      alert_type: alertType,
      severity,
      title,
      description,
      metadata,
      status: 'active',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function monitorSessions() {
  return detectMultipleSessionAnomalies();
}

export async function monitorDevices() {
  return detectRapidDeviceChanges();
}

export async function monitorAuthentication() {
  const [bruteForce, stuffing] =
    await Promise.all([
      detectBruteForceAttack(),
      detectCredentialStuffing(),
    ]);

  return [bruteForce, stuffing].filter(Boolean);
}

export async function monitorPrivacyChanges() {
  return null;
}

export async function monitorEncryptionEvents() {
  return detectReplayAttackIndicators();
}

export async function monitorAccountActivity() {
  const [automation, tokenAbuse, travel] =
    await Promise.all([
      detectSuspiciousAutomation(),
      detectTokenAbuse(),
      detectImpossibleTravel(),
    ]);

  return [automation, tokenAbuse, travel].filter(
    Boolean
  );
}

export async function startSecurityMonitoring({
  interval = 60000,
  callback,
} = {}) {
  if (guestMode()) {
    return () => {};
  }

  await runMonitoringCycle(callback);

  stopSecurityMonitoring();

  monitorTimer = window.setInterval(() => {
    runMonitoringCycle(callback).catch(() => {});
  }, interval);

  return stopSecurityMonitoring;
}

export function stopSecurityMonitoring() {
  if (monitorTimer) {
    window.clearInterval(monitorTimer);
    monitorTimer = null;
  }
}

async function runMonitoringCycle(callback) {
  const result = await detectAccountTakeoverRisk();

  if (result.score >= 45) {
    await generateSecurityAlert({
      alertType: 'account_takeover_risk',
      severity: result.severity,
      title: 'Account takeover risk detected',
      description:
        'Aarush detected multiple suspicious activity signals.',
      metadata: {
        score: result.score,
        threats: result.threats,
      },
    });
  }

  callback?.(result);
  return result;
}

export async function getActiveAlerts() {
  if (guestMode()) return [];

  const user = await requireUser();

  const { data, error } = await supabase
    .from(ALERTS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function dismissAlert(alertId) {
  const user = await requireUser();

  const { error } = await supabase
    .from(ALERTS_TABLE)
    .update({
      status: 'dismissed',
      dismissed_at: new Date().toISOString(),
    })
    .eq('id', alertId)
    .eq('user_id', user.id);

  if (error) throw error;

  return true;
}

export async function acknowledgeAlert(alertId) {
  const user = await requireUser();

  const { error } = await supabase
    .from(ALERTS_TABLE)
    .update({
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', alertId)
    .eq('user_id', user.id);

  if (error) throw error;

  return true;
}

export async function getMonitoringTimeline({
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

export function subscribeToSecurityAlerts(
  callback
) {
  const channel = supabase
    .channel('aarush-security-alerts')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ALERTS_TABLE,
      },
      callback
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