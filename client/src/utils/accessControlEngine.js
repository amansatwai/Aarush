import { supabase } from '../lib/supabase';

const ROLES_TABLE = 'access_roles';
const PERMISSIONS_TABLE = 'access_permissions';
const ASSIGNMENTS_TABLE = 'role_assignments';

export const DEFAULT_ROLES = [
  'Owner',
  'Super Admin',
  'Admin',
  'Manager',
  'Moderator',
  'Support',
  'Finance',
  'Creator',
  'Developer',
  'Analyst',
  'Member',
  'Guest',
];

export const PERMISSIONS = [
  'posts',
  'stories',
  'reels',
  'chats',
  'notifications',
  'security',
  'privacy',
  'backups',
  'integrations',
  'marketplace',
  'payments',
  'analytics',
  'users',
  'teams',
  'workspaces',
  'api_access',
  'webhooks',
  'admin_actions',
];

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error(
      'Sign in to manage access control.'
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

export async function initializeAccessControl() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    roles: DEFAULT_ROLES,
    permissions: PERMISSIONS,
    hierarchy_ready: true,
  };
}

export async function createRole({
  organizationId,
  name,
  permissions = [],
} = {}) {
  const user = await requireUser();

  if (!name) {
    throw new Error('Role name is required.');
  }

  const { data, error } = await supabase
    .from(ROLES_TABLE)
    .insert({
      organization_id: organizationId || null,
      owner_id: user.id,
      name,
      permissions,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateRole(roleId, patch) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(ROLES_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roleId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteRole(roleId) {
  const user = await requireUser();

  const { error } = await supabase
    .from(ROLES_TABLE)
    .delete()
    .eq('id', roleId)
    .eq('owner_id', user.id);

  if (error) throw error;

  return true;
}

export async function assignRole({
  roleId,
  userId,
  organizationId,
  workspaceId,
} = {}) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(ASSIGNMENTS_TABLE)
    .upsert(
      {
        role_id: roleId,
        user_id: userId,
        organization_id: organizationId || null,
        workspace_id: workspaceId || null,
        assigned_by: user.id,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'role_id,user_id,workspace_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function removeRole(
  assignmentId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(ASSIGNMENTS_TABLE)
    .delete()
    .eq('id', assignmentId)
    .eq('assigned_by', user.id);

  if (error) throw error;

  return true;
}

export async function getPermissions({
  organizationId,
  userId,
} = {}) {
  const user = await requireUser();

  const targetUser = userId || user.id;

  const { data, error } = await supabase
    .from(ASSIGNMENTS_TABLE)
    .select(`
      *,
      access_roles (
        id,
        name,
        permissions
      )
    `)
    .eq('user_id', targetUser)
    .eq(
      'organization_id',
      organizationId
    );

  if (error) throw error;

  return data || [];
}

export async function checkPermission({
  permission,
  organizationId,
  userId,
} = {}) {
  if (!PERMISSIONS.includes(permission)) {
    return false;
  }

  const assignments = await getPermissions({
    organizationId,
    userId,
  });

  return assignments.some((assignment) =>
    assignment.access_roles?.permissions?.includes(
      permission
    )
  );
}

export async function grantPermission({
  roleId,
  permission,
} = {}) {
  const user = await requireUser();

  if (!PERMISSIONS.includes(permission)) {
    throw new Error('Invalid permission.');
  }

  const { data: role, error: roleError } =
    await supabase
      .from(ROLES_TABLE)
      .select('permissions')
      .eq('id', roleId)
      .eq('owner_id', user.id)
      .single();

  if (roleError) throw roleError;

  const permissions = [
    ...new Set([
      ...(role.permissions || []),
      permission,
    ]),
  ];

  return updateRole(roleId, {
    permissions,
  });
}

export async function revokePermission({
  roleId,
  permission,
} = {}) {
  const user = await requireUser();

  const { data: role, error } = await supabase
    .from(ROLES_TABLE)
    .select('permissions')
    .eq('id', roleId)
    .eq('owner_id', user.id)
    .single();

  if (error) throw error;

  return updateRole(roleId, {
    permissions: (role.permissions || []).filter(
      (item) => item !== permission
    ),
  });
}

export async function getRoleHierarchy() {
  return DEFAULT_ROLES.map((role, index) => ({
    role,
    level: DEFAULT_ROLES.length - index,
  }));
}

export async function getAccessControlStatus(
  organizationId
) {
  const user = await requireUser();

  const [roles, assignments] =
    await Promise.all([
      supabase
        .from(ROLES_TABLE)
        .select('*')
        .eq('owner_id', user.id)
        .eq('organization_id', organizationId),

      supabase
        .from(ASSIGNMENTS_TABLE)
        .select('*')
        .eq('organization_id', organizationId),
    ]);

  if (roles.error) throw roles.error;
  if (assignments.error) throw assignments.error;

  return {
    roles: roles.data || [],
    assignments: assignments.data || [],
    permissions: PERMISSIONS,
  };
}

export function subscribeToAccessControl(
  callback
) {
  const channel = supabase
    .channel('aarush-access-control')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ROLES_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ASSIGNMENTS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}