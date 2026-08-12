import { supabase } from '../lib/supabase';

const PLUGINS_TABLE = 'platform_plugins';
const INSTALLS_TABLE = 'plugin_installations';
const EVENTS_TABLE = 'plugin_ecosystem_events';

export const PLUGIN_CATEGORIES = [
  'Productivity',
  'Security',
  'Privacy',
  'Analytics',
  'Creator',
  'Business',
  'Marketplace',
  'Payments',
  'Automation',
  'AI',
  'Media',
  'Integrations',
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
      'Sign in to manage plugins.'
    );
  }

  return user;
}

export async function initializePluginEcosystem() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    categories: PLUGIN_CATEGORIES,
    approval_ready: true,
    moderation_ready: true,
    dependency_management_ready: true,
  };
}

export async function registerPlugin(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot register plugins.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(PLUGINS_TABLE)
    .insert({
      owner_id: user.id,
      name: payload.name || 'Aarush plugin',
      description: payload.description || null,
      category: payload.category || 'Productivity',
      version: payload.version || '0.1.0',
      manifest: payload.manifest || {},
      status: 'draft',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updatePlugin(
  pluginId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(PLUGINS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', pluginId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function publishPlugin(pluginId) {
  return updatePlugin(pluginId, {
    status: 'published',
    published_at: new Date().toISOString(),
  });
}

export async function unpublishPlugin(pluginId) {
  return updatePlugin(pluginId, {
    status: 'unpublished',
  });
}

export async function installPlugin(pluginId) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot install plugins.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(INSTALLS_TABLE)
    .upsert(
      {
        plugin_id: pluginId,
        user_id: user.id,
        status: 'installed',
        installed_at: new Date().toISOString(),
      },
      {
        onConflict: 'plugin_id,user_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function uninstallPlugin(pluginId) {
  const user = await requireUser();

  const { error } = await supabase
    .from(INSTALLS_TABLE)
    .delete()
    .eq('plugin_id', pluginId)
    .eq('user_id', user.id);

  if (error) throw error;

  return true;
}

export async function enablePlugin(pluginId) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(INSTALLS_TABLE)
    .update({
      status: 'enabled',
      updated_at: new Date().toISOString(),
    })
    .eq('plugin_id', pluginId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function disablePlugin(pluginId) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(INSTALLS_TABLE)
    .update({
      status: 'disabled',
      updated_at: new Date().toISOString(),
    })
    .eq('plugin_id', pluginId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getInstalledPlugins() {
  if (guestMode()) return [];

  const user = await requireUser();

  const { data, error } = await supabase
    .from(INSTALLS_TABLE)
    .select(`
      *,
      platform_plugins (
        id,
        name,
        description,
        category,
        version,
        status
      )
    `)
    .eq('user_id', user.id)
    .order('installed_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function getPluginMarketplace({
  category,
  search,
} = {}) {
  let query = supabase
    .from(PLUGINS_TABLE)
    .select('*')
    .eq('status', 'published')
    .order('published_at', {
      ascending: false,
    });

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

export async function getPluginAnalytics() {
  const { data, error } = await supabase
    .from(INSTALLS_TABLE)
    .select('id, status, installed_at');

  if (error) throw error;

  const installs = data || [];

  return {
    installations: installs.length,
    enabled: installs.filter(
      (item) => item.status === 'enabled'
    ).length,
    disabled: installs.filter(
      (item) => item.status === 'disabled'
    ).length,
    active_tenants: 0,
    ecosystem_health: 'stable',
  };
}

export async function getPluginStatus() {
  const [
    marketplace,
    installed,
    analytics,
  ] = await Promise.all([
    getPluginMarketplace(),
    getInstalledPlugins(),
    getPluginAnalytics(),
  ]);

  return {
    marketplace,
    installed,
    analytics,
    status: 'operational',
  };
}

export function subscribeToPluginEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-plugin-ecosystem')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: PLUGINS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: INSTALLS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}