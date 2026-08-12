import { supabase } from '../lib/supabase';

const WORKSPACES_TABLE = 'business_workspaces';
const MEMBERS_TABLE = 'business_team_members';
const STORES_TABLE = 'business_stores';
const ACTIVITY_TABLE = 'business_activity';

export const TEAM_ROLES = [
  'Owner',
  'Admin',
  'Manager',
  'Support',
  'Inventory',
  'Finance',
  'Creator',
  'Marketing',
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
      'Sign in to manage business operations.'
    );
  }

  return user;
}

async function logActivity(
  activityType,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(ACTIVITY_TABLE)
    .insert({
      actor_id: user.id,
      activity_type: activityType,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeBusinessPlatform() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    multi_store_ready: true,
    team_management_ready: true,
    crm_ready: true,
    automation_ready: true,
  };
}

export async function createBusinessWorkspace(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create business workspaces.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(WORKSPACES_TABLE)
    .insert({
      owner_id: user.id,
      name: payload.name || 'My business',
      description: payload.description || null,
      category: payload.category || null,
      status: 'active',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity('workspace_created', {
    workspace_id: data.id,
  });

  return data;
}

export async function updateBusinessWorkspace(
  workspaceId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(WORKSPACES_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workspaceId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getBusinessWorkspace(
  workspaceId
) {
  const user = await requireUser();
  const id = workspaceId;

  if (id) {
    const { data, error } = await supabase
      .from(WORKSPACES_TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  const { data, error } = await supabase
    .from(WORKSPACES_TABLE)
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function addTeamMember({
  workspaceId,
  memberId,
  role = 'Support',
} = {}) {
  const user = await requireUser();

  if (!workspaceId || !memberId) {
    throw new Error(
      'Workspace and member are required.'
    );
  }

  if (!TEAM_ROLES.includes(role)) {
    throw new Error('Invalid team role.');
  }

  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .upsert(
      {
        workspace_id: workspaceId,
        user_id: memberId,
        role,
        invited_by: user.id,
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'workspace_id,user_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function removeTeamMember(
  workspaceId,
  memberId
) {
  const { error } = await supabase
    .from(MEMBERS_TABLE)
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', memberId);

  if (error) throw error;

  return true;
}

export async function updateTeamRole(
  workspaceId,
  memberId,
  role
) {
  if (!TEAM_ROLES.includes(role)) {
    throw new Error('Invalid team role.');
  }

  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq('workspace_id', workspaceId)
    .eq('user_id', memberId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getTeamMembers(
  workspaceId
) {
  if (!workspaceId) return [];

  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select(`
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function createStore({
  workspaceId,
  name,
  description,
  category,
} = {}) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(STORES_TABLE)
    .insert({
      workspace_id: workspaceId,
      owner_id: user.id,
      name: name || 'New store',
      description: description || null,
      category: category || null,
      status: 'active',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateStore(
  storeId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(STORES_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getStores(workspaceId) {
  const { data, error } = await supabase
    .from(STORES_TABLE)
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function getBusinessAnalytics(
  workspaceId
) {
  const workspace = await getBusinessWorkspace(
    workspaceId
  );

  return {
    workspace,
    revenue: 0,
    orders: 0,
    inventory: 0,
    customers: 0,
    retention: 0,
    repeat_purchases: 0,
    support_performance: 0,
    conversion_rate: 0,
    average_order_value: 0,
  };
}

export async function exportBusinessReport(
  workspaceId
) {
  const report = await getBusinessAnalytics(
    workspaceId
  );

  const blob = new Blob(
    [JSON.stringify(report, null, 2)],
    {
      type: 'application/json',
    }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = 'aarush-business-report.json';
  anchor.click();

  URL.revokeObjectURL(url);

  return report;
}

export function subscribeToBusinessPlatform(
  callback
) {
  const channel = supabase
    .channel('aarush-business-platform')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: WORKSPACES_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: MEMBERS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: STORES_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}