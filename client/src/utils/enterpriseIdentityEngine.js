import { supabase } from '../lib/supabase';

const ORGANIZATIONS_TABLE = 'organizations';
const WORKSPACES_TABLE = 'organization_workspaces';
const MEMBERS_TABLE = 'organization_members';
const EVENTS_TABLE = 'enterprise_identity_events';

const WORKSPACE_TYPES = [
  'personal',
  'business',
  'creator',
  'enterprise',
  'shared',
  'archived',
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
      'Sign in to manage enterprise identity.'
    );
  }

  return user;
}

async function logEvent(
  eventType,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      actor_id: user.id,
      event_type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeEnterpriseIdentity() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    workspace_types: WORKSPACE_TYPES,
    sso_ready: true,
    domain_login_ready: true,
  };
}

export async function createOrganization(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create organizations.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(ORGANIZATIONS_TABLE)
    .insert({
      owner_id: user.id,
      name: payload.name || 'New organization',
      description: payload.description || null,
      logo_url: payload.logo_url || null,
      domain: payload.domain || null,
      status: 'active',
      verified: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  await logEvent('organization_created', {
    organization_id: data.id,
  });

  return data;
}

export async function updateOrganization(
  organizationId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(ORGANIZATIONS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteOrganization(
  organizationId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(ORGANIZATIONS_TABLE)
    .delete()
    .eq('id', organizationId)
    .eq('owner_id', user.id);

  if (error) throw error;

  return true;
}

export async function getOrganization(
  organizationId
) {
  const user = await requireUser();

  if (organizationId) {
    const { data, error } = await supabase
      .from(ORGANIZATIONS_TABLE)
      .select('*')
      .eq('id', organizationId)
      .maybeSingle();

    if (error) throw error;

    return data || null;
  }

  const { data, error } = await supabase
    .from(ORGANIZATIONS_TABLE)
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

export async function createWorkspace(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create workspaces.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(WORKSPACES_TABLE)
    .insert({
      organization_id: payload.organization_id || null,
      owner_id: user.id,
      name: payload.name || 'New workspace',
      workspace_type:
        payload.workspace_type || 'personal',
      status: 'active',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateWorkspace(
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

export async function getWorkspaces(
  organizationId
) {
  const user = await requireUser();

  let query = supabase
    .from(WORKSPACES_TABLE)
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (organizationId) {
    query = query.eq(
      'organization_id',
      organizationId
    );
  } else {
    query = query.eq('owner_id', user.id);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

export async function inviteMember({
  organizationId,
  workspaceId,
  memberId,
  email,
  role = 'Member',
} = {}) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot invite members.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .insert({
      organization_id: organizationId || null,
      workspace_id: workspaceId || null,
      user_id: memberId || null,
      email: email || null,
      role,
      invited_by: user.id,
      status: 'invited',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  await logEvent('member_invited', {
    member_id: data.id,
  });

  return data;
}

export async function removeMember(
  memberId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(MEMBERS_TABLE)
    .delete()
    .eq('id', memberId)
    .eq('invited_by', user.id);

  if (error) throw error;

  return true;
}

export async function transferOwnership(
  organizationId,
  newOwnerId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(ORGANIZATIONS_TABLE)
    .update({
      owner_id: newOwnerId,
      previous_owner_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  await logEvent('ownership_transferred', {
    organization_id: organizationId,
    new_owner_id: newOwnerId,
  });

  return data;
}

export async function getOrganizationStatus() {
  if (guestMode()) {
    return {
      enabled: false,
      guest: true,
      organizations: 0,
      workspaces: 0,
      members: 0,
    };
  }

  const organization =
    await getOrganization();
  const workspaces = await getWorkspaces(
    organization?.id
  );

  return {
    enabled: true,
    guest: false,
    organization,
    organizations: organization ? 1 : 0,
    workspaces: workspaces.length,
    verified: Boolean(organization?.verified),
  };
}

export function subscribeToEnterpriseIdentity(
  callback
) {
  const channel = supabase
    .channel('aarush-enterprise-identity')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ORGANIZATIONS_TABLE,
      },
      callback
    )
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
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}