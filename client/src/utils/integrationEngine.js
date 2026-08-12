import { supabase } from '../lib/supabase';

const CONNECTIONS_TABLE = 'integration_connections';
const EVENTS_TABLE = 'integration_events';

export const AVAILABLE_INTEGRATIONS = [
  'Google',
  'Microsoft',
  'Slack',
  'Discord',
  'Zapier',
  'Make.com',
  'Stripe',
  'Razorpay',
  'PayPal',
  'Shopify',
  'WooCommerce',
  'Notion',
  'Trello',
  'Jira',
  'GitHub',
  'GitLab',
  'Custom Webhook',
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
      'Sign in to manage integrations.'
    );
  }

  return user;
}

async function logEvent(
  integration,
  eventType,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      owner_id: user.id,
      integration,
      event_type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeIntegrations() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    available: AVAILABLE_INTEGRATIONS,
    oauth_ready: true,
    custom_webhook_ready: true,
  };
}

export async function connectIntegration({
  provider,
  name,
  config = {},
} = {}) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot connect integrations.'
    );
  }

  if (!AVAILABLE_INTEGRATIONS.includes(provider)) {
    throw new Error('Unsupported integration.');
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(CONNECTIONS_TABLE)
    .upsert(
      {
        owner_id: user.id,
        provider,
        name: name || provider,
        config,
        status: 'connected',
        connected_at: new Date().toISOString(),
      },
      {
        onConflict: 'owner_id,provider',
      }
    )
    .select()
    .single();

  if (error) throw error;

  await logEvent(provider, 'connected');
  return data;
}

export async function disconnectIntegration(
  connectionId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(CONNECTIONS_TABLE)
    .update({
      status: 'disconnected',
      disconnected_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function reconnectIntegration(
  connectionId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(CONNECTIONS_TABLE)
    .update({
      status: 'connected',
      last_connected_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getConnectedIntegrations() {
  if (guestMode()) return [];

  const user = await requireUser();

  const { data, error } = await supabase
    .from(CONNECTIONS_TABLE)
    .select(`
      id,
      provider,
      name,
      status,
      connected_at,
      last_sync_at,
      config
    `)
    .eq('owner_id', user.id)
    .order('connected_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export function getAvailableIntegrations() {
  return AVAILABLE_INTEGRATIONS.map(
    (provider) => ({
      provider,
      oauth_ready: true,
      webhook_ready: true,
      connected: false,
    })
  );
}

export async function refreshIntegration(
  connectionId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(CONNECTIONS_TABLE)
    .update({
      last_sync_at: new Date().toISOString(),
      status: 'connected',
    })
    .eq('id', connectionId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function testIntegration(
  connectionId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      owner_id: user.id,
      connection_id: connectionId,
      event_type: 'integration.test',
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function syncIntegrationData(
  connectionId,
  metadata = {}
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      owner_id: user.id,
      connection_id: connectionId,
      event_type: 'integration.sync',
      status: 'pending',
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getIntegrationStatus() {
  const connections =
    await getConnectedIntegrations();

  return {
    connected: connections.filter(
      (item) => item.status === 'connected'
    ).length,
    failed: connections.filter(
      (item) => item.status === 'failed'
    ).length,
    total: connections.length,
    connections,
  };
}

export function subscribeToIntegrationEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-integrations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: CONNECTIONS_TABLE,
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