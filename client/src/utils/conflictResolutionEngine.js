import { supabase } from '../lib/supabase';

const CONFLICTS_TABLE = 'sync_conflicts';

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error(
      'Sign in to resolve sync conflicts.'
    );
  }

  return user;
}

export function detectConflict({
  local,
  remote,
  fields = [],
} = {}) {
  if (!local || !remote) {
    return {
      conflict: false,
      fields: [],
    };
  }

  const keys =
    fields.length > 0
      ? fields
      : [
          ...new Set([
            ...Object.keys(local),
            ...Object.keys(remote),
          ]),
        ];

  const changedFields = keys.filter(
    (field) =>
      local[field] !== undefined &&
      remote[field] !== undefined &&
      JSON.stringify(local[field]) !==
        JSON.stringify(remote[field])
  );

  return {
    conflict: changedFields.length > 0,
    fields: changedFields,
    local,
    remote,
  };
}

export function resolveNewestWins(
  local,
  remote
) {
  const localTime = new Date(
    local?.updated_at || 0
  ).getTime();

  const remoteTime = new Date(
    remote?.updated_at || 0
  ).getTime();

  return localTime >= remoteTime ? local : remote;
}

export function resolveServerWins(
  local,
  remote
) {
  return remote || local;
}

export function resolveLocalWins(
  local,
  remote
) {
  return local || remote;
}

export function mergeConflict(local, remote) {
  return {
    ...remote,
    ...local,
    updated_at:
      local?.updated_at || remote?.updated_at,
  };
}

export function resolveConflict(
  conflict,
  strategy = 'newest-wins'
) {
  if (!conflict?.conflict) {
    return conflict?.local || conflict?.remote;
  }

  if (strategy === 'server-wins') {
    return resolveServerWins(
      conflict.local,
      conflict.remote
    );
  }

  if (strategy === 'local-wins') {
    return resolveLocalWins(
      conflict.local,
      conflict.remote
    );
  }

  if (strategy === 'merge') {
    return mergeConflict(
      conflict.local,
      conflict.remote
    );
  }

  return resolveNewestWins(
    conflict.local,
    conflict.remote
  );
}

export function previewConflict(
  conflict,
  strategy = 'newest-wins'
) {
  return {
    ...conflict,
    strategy,
    resolution: resolveConflict(
      conflict,
      strategy
    ),
  };
}

export async function saveConflict(
  conflict,
  category,
  strategy = 'manual'
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(CONFLICTS_TABLE)
    .insert({
      user_id: user.id,
      category,
      strategy,
      local_data: conflict.local,
      remote_data: conflict.remote,
      changed_fields: conflict.fields,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function resolveAndSaveConflict(
  conflict,
  category,
  strategy = 'newest-wins'
) {
  const resolution = resolveConflict(
    conflict,
    strategy
  );

  const user = await requireUser();

  const { data, error } = await supabase
    .from(CONFLICTS_TABLE)
    .insert({
      user_id: user.id,
      category,
      strategy,
      local_data: conflict.local,
      remote_data: conflict.remote,
      resolved_data: resolution,
      changed_fields: conflict.fields,
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    resolution,
    conflict: data,
  };
}

export async function getConflictHistory({
  page = 0,
  pageSize = 30,
} = {}) {
  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(CONFLICTS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function retryConflictResolution(
  conflictId,
  strategy = 'newest-wins'
) {
  const user = await requireUser();

  const { data: conflict, error } =
    await supabase
      .from(CONFLICTS_TABLE)
      .select('*')
      .eq('id', conflictId)
      .eq('user_id', user.id)
      .maybeSingle();

  if (error) throw error;
  if (!conflict) {
    throw new Error('Conflict not found.');
  }

  const result = await resolveAndSaveConflict(
    {
      local: conflict.local_data,
      remote: conflict.remote_data,
      fields: conflict.changed_fields || [],
      conflict: true,
    },
    conflict.category,
    strategy
  );

  await supabase
    .from(CONFLICTS_TABLE)
    .update({
      status: 'retried',
      retried_at: new Date().toISOString(),
    })
    .eq('id', conflictId)
    .eq('user_id', user.id);

  return result;
}