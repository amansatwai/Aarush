import { supabase } from '../lib/supabase';

const WORKFLOWS_TABLE = 'enterprise_workflows';
const HISTORY_TABLE = 'enterprise_workflow_history';

export const WORKFLOW_TRIGGERS = [
  'schedule',
  'webhook',
  'api_event',
  'payment_event',
  'order_event',
  'security_event',
  'backup_event',
  'sync_event',
  'infrastructure_event',
  'custom_event',
];

export const WORKFLOW_ACTIONS = [
  'run_backup',
  'run_sync',
  'scale_region',
  'notify_admin',
  'rotate_keys',
  'generate_report',
  'export_data',
  'invalidate_cache',
  'run_compliance_check',
  'execute_webhook',
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
      'Sign in to manage enterprise automation.'
    );
  }

  return user;
}

export async function initializeEnterpriseAutomation() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    triggers: WORKFLOW_TRIGGERS,
    actions: WORKFLOW_ACTIONS,
    retries: true,
    branching_ready: true,
  };
}

export async function createAutomationWorkflow(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create workflows.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(WORKFLOWS_TABLE)
    .insert({
      owner_id: user.id,
      name: payload.name || 'Enterprise workflow',
      trigger: payload.trigger || 'custom_event',
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

export async function updateAutomationWorkflow(
  workflowId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(WORKFLOWS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workflowId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteAutomationWorkflow(
  workflowId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(WORKFLOWS_TABLE)
    .delete()
    .eq('id', workflowId)
    .eq('owner_id', user.id);

  if (error) throw error;

  return true;
}

export async function enableWorkflow(workflowId) {
  return updateAutomationWorkflow(workflowId, {
    enabled: true,
  });
}

export async function disableWorkflow(
  workflowId
) {
  return updateAutomationWorkflow(workflowId, {
    enabled: false,
  });
}

export async function executeWorkflow(
  workflowId,
  payload = {}
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(HISTORY_TABLE)
    .insert({
      owner_id: user.id,
      workflow_id: workflowId,
      payload,
      status: 'pending',
      attempts: 0,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function scheduleWorkflow(
  workflowId,
  scheduledAt
) {
  return updateAutomationWorkflow(workflowId, {
    scheduled_at: scheduledAt,
    trigger: 'schedule',
  });
}

export async function getWorkflowHistory({
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

export async function retryFailedWorkflow(
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

export async function getAutomationAnalytics() {
  const history = await getWorkflowHistory({
    page: 0,
    pageSize: 500,
  });

  return {
    executions: history.length,
    successful: history.filter(
      (item) => item.status === 'completed'
    ).length,
    failed: history.filter(
      (item) => item.status === 'failed'
    ).length,
    retries: history.filter(
      (item) => item.status === 'retrying'
    ).length,
    error_rate: history.length
      ? history.filter(
          (item) => item.status === 'failed'
        ).length / history.length
      : 0,
  };
}

export async function getAutomationStatus() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(WORKFLOWS_TABLE)
    .select('id, enabled')
    .eq('owner_id', user.id);

  if (error) throw error;

  const workflows = data || [];

  return {
    total: workflows.length,
    active: workflows.filter(
      (workflow) => workflow.enabled
    ).length,
  };
}

export function subscribeToAutomationEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-enterprise-automation')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: WORKFLOWS_TABLE,
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