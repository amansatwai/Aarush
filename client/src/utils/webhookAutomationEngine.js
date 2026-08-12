import { supabase } from '../lib/supabase';

const RULES_TABLE = 'webhook_automations';
const HISTORY_TABLE = 'webhook_automation_history';

export const WEBHOOK_EVENTS = [
  'user.created',
  'user.updated',
  'post.created',
  'post.updated',
  'story.created',
  'message.created',
  'notification.created',
  'payment.completed',
  'order.created',
  'order.updated',
  'creator.subscription',
  'business.sale',
  'security.alert',
  'backup.completed',
  'sync.completed',
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
      'Sign in to manage webhook automations.'
    );
  }

  return user;
}

export async function initializeWebhookAutomation() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    events: WEBHOOK_EVENTS,
    retries: true,
    conditional_logic: true,
    branching_ready: true,
  };
}

export async function createWebhookAutomation(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create automations.'
    );
  }

  const user = await requireUser();

  if (!payload.event || !payload.endpoint) {
    throw new Error(
      'Event and endpoint are required.'
    );
  }

  if (!WEBHOOK_EVENTS.includes(payload.event)) {
    throw new Error('Unsupported webhook event.');
  }

  const { data, error } = await supabase
    .from(RULES_TABLE)
    .insert({
      owner_id: user.id,
      name: payload.name || 'Webhook automation',
      event: payload.event,
      endpoint: payload.endpoint,
      conditions: payload.conditions || {},
      actions: payload.actions || [],
      retry_limit: payload.retry_limit || 3,
      enabled: true,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateWebhookAutomation(
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
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteWebhookAutomation(
  ruleId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(RULES_TABLE)
    .delete()
    .eq('id', ruleId)
    .eq('owner_id', user.id);

  if (error) throw error;

  return true;
}

export async function enableWebhookAutomation(
  ruleId
) {
  return updateWebhookAutomation(ruleId, {
    enabled: true,
  });
}

export async function disableWebhookAutomation(
  ruleId
) {
  return updateWebhookAutomation(ruleId, {
    enabled: false,
  });
}

export async function triggerWebhookAutomation(
  ruleId,
  payload = {}
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(HISTORY_TABLE)
    .insert({
      owner_id: user.id,
      rule_id: ruleId,
      status: 'pending',
      payload,
      attempts: 0,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function retryFailedWebhook(
  historyId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(HISTORY_TABLE)
    .update({
      status: 'retrying',
      attempts: 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', historyId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getWebhookAutomationHistory({
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
    .eq('owner_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function getWebhookAutomationStatus() {
  if (guestMode()) {
    return {
      total: 0,
      active: 0,
      executions: 0,
      failures: 0,
    };
  }

  const user = await requireUser();

  const [rulesResult, historyResult] =
    await Promise.all([
      supabase
        .from(RULES_TABLE)
        .select('id, enabled')
        .eq('owner_id', user.id),

      supabase
        .from(HISTORY_TABLE)
        .select('id, status')
        .eq('owner_id', user.id),
    ]);

  if (rulesResult.error) throw rulesResult.error;
  if (historyResult.error) {
    throw historyResult.error;
  }

  const rules = rulesResult.data || [];
  const history = historyResult.data || [];

  return {
    total: rules.length,
    active: rules.filter((rule) => rule.enabled)
      .length,
    executions: history.length,
    failures: history.filter(
      (item) => item.status === 'failed'
    ).length,
  };
}

export function subscribeToWebhookAutomation(
  callback
) {
  const channel = supabase
    .channel('aarush-webhook-automation')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: RULES_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: HISTORY_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}