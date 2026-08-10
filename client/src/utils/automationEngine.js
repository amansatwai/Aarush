import { supabase } from '../lib/supabase';

const RULES_TABLE = 'automation_rules';
const HISTORY_TABLE = 'automation_history';

const TRIGGERS = [
  'app_opened',
  'app_closed',
  'device_locked',
  'device_unlocked',
  'new_notification',
  'new_message',
  'new_follower',
  'new_login',
  'new_device',
  'suspicious_activity',
  'battery_low',
  'offline',
  'online',
  'wifi_connected',
  'time_based',
  'location_placeholder',
];

const ACTIONS = [
  'lock_chats',
  'enable_privacy_mode',
  'enable_emergency_privacy',
  'mute_notifications',
  'hide_profile',
  'logout_other_devices',
  'create_backup',
  'sync_now',
  'clear_cache',
  'run_security_scan',
  'enable_app_lock',
  'disable_app_lock',
  'notify_user',
  'export_report',
];

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
      'Sign in to manage automation rules.'
    );
  }

  return user;
}

export async function initializeAutomation() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    triggers: TRIGGERS,
    actions: ACTIONS,
  };
}

export async function createAutomationRule({
  name,
  trigger,
  action,
  conditions = {},
  enabled = true,
} = {}) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create automation rules.'
    );
  }

  if (!TRIGGERS.includes(trigger)) {
    throw new Error('Unsupported automation trigger.');
  }

  if (!ACTIONS.includes(action)) {
    throw new Error('Unsupported automation action.');
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(RULES_TABLE)
    .insert({
      user_id: user.id,
      name: name || `${trigger} automation`,
      trigger,
      action,
      conditions,
      enabled,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateAutomationRule(
  ruleId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(RULES_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ruleId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteAutomationRule(
  ruleId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(RULES_TABLE)
    .delete()
    .eq('id', ruleId)
    .eq('user_id', user.id);

  if (error) throw error;

  return true;
}

export async function enableAutomationRule(
  ruleId
) {
  return updateAutomationRule(ruleId, {
    enabled: true,
  });
}

export async function disableAutomationRule(
  ruleId
) {
  return updateAutomationRule(ruleId, {
    enabled: false,
  });
}

export async function getAutomationRules() {
  if (guestMode()) return [];

  const user = await requireUser();

  const { data, error } = await supabase
    .from(RULES_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function executeAutomationRule(
  rule,
  context = {}
) {
  if (!rule?.enabled) {
    return {
      executed: false,
      reason: 'disabled',
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(HISTORY_TABLE)
    .insert({
      user_id: user.id,
      rule_id: rule.id,
      trigger: rule.trigger,
      action: rule.action,
      context,
      status: 'prepared',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    executed: true,
    action: rule.action,
    history: data,
  };
}

export async function testAutomationRule(
  rule,
  context = {}
) {
  if (!rule) {
    throw new Error('Automation rule is required.');
  }

  return {
    matched: true,
    rule,
    context,
    action: rule.action,
    dry_run: true,
  };
}

export async function getAutomationHistory({
  page = 0,
  pageSize = 30,
} = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(HISTORY_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export {
  TRIGGERS as AUTOMATION_TRIGGERS,
  ACTIONS as AUTOMATION_ACTIONS,
};