import { supabase } from '../lib/supabase';

const KEYS_TABLE = 'api_keys';
const WEBHOOKS_TABLE = 'api_webhooks';
const EVENTS_TABLE = 'api_events';

const RATE_LIMIT_TIERS = [
  'Free',
  'Basic',
  'Pro',
  'Business',
  'Enterprise',
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
      'Sign in to manage developer APIs.'
    );
  }

  return user;
}

function randomSecret(prefix) {
  const bytes = crypto.getRandomValues(
    new Uint8Array(24)
  );

  return `${prefix}_${Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, '0')
    )
    .join('')}`;
}

export async function initializeAPIPlatform() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    version: 'v1',
    features: [
      'REST API',
      'GraphQL placeholder',
      'OAuth preparation',
      'Webhooks',
      'Rate limiting',
      'Request signing',
    ],
    rate_limit_tiers: RATE_LIMIT_TIERS,
  };
}

export async function createAPIKey({
  name = 'Aarush API key',
  scopes = ['read'],
  tier = 'Free',
} = {}) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create API keys.'
    );
  }

  const user = await requireUser();
  const secret = randomSecret('aarush');

  const { data, error } = await supabase
    .from(KEYS_TABLE)
    .insert({
      owner_id: user.id,
      name,
      key_prefix: secret.slice(0, 16),
      secret_hash: secret,
      scopes,
      tier,
      status: 'active',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    secret,
  };
}

export async function revokeAPIKey(keyId) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(KEYS_TABLE)
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('id', keyId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function rotateAPIKey(keyId) {
  const user = await requireUser();
  const secret = randomSecret('aarush');

  const { data, error } = await supabase
    .from(KEYS_TABLE)
    .update({
      key_prefix: secret.slice(0, 16),
      secret_hash: secret,
      rotated_at: new Date().toISOString(),
      status: 'active',
    })
    .eq('id', keyId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    secret,
  };
}

export async function getAPIKeys() {
  if (guestMode()) return [];

  const user = await requireUser();

  const { data, error } = await supabase
    .from(KEYS_TABLE)
    .select(
      'id, name, key_prefix, scopes, tier, status, created_at, rotated_at, revoked_at'
    )
    .eq('owner_id', user.id)
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function getAPIUsage({
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
    .eq('owner_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function getRateLimits(tier = 'Free') {
  const limits = {
    Free: {
      requests_per_minute: 60,
      daily_requests: 5000,
    },
    Basic: {
      requests_per_minute: 300,
      daily_requests: 50000,
    },
    Pro: {
      requests_per_minute: 1000,
      daily_requests: 250000,
    },
    Business: {
      requests_per_minute: 5000,
      daily_requests: 1000000,
    },
    Enterprise: {
      requests_per_minute: 25000,
      daily_requests: 10000000,
    },
  };

  return {
    tier,
    ...(limits[tier] || limits.Free),
  };
}

export async function validateAPIKey(secret) {
  if (!secret) return false;

  const { data, error } = await supabase
    .from(KEYS_TABLE)
    .select('id, owner_id, scopes, tier, status')
    .eq('secret_hash', secret)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;

  return data || false;
}

export async function createWebhook({
  name,
  endpoint,
  events = ['user.events'],
  secret,
} = {}) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create webhooks.'
    );
  }

  const user = await requireUser();

  if (!endpoint) {
    throw new Error('Webhook endpoint is required.');
  }

  const { data, error } = await supabase
    .from(WEBHOOKS_TABLE)
    .insert({
      owner_id: user.id,
      name: name || 'Aarush webhook',
      endpoint,
      events,
      secret: secret || randomSecret('whsec'),
      status: 'active',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateWebhook(
  webhookId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(WEBHOOKS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', webhookId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteWebhook(
  webhookId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(WEBHOOKS_TABLE)
    .delete()
    .eq('id', webhookId)
    .eq('owner_id', user.id);

  if (error) throw error;

  return true;
}

export async function getWebhooks() {
  if (guestMode()) return [];

  const user = await requireUser();

  const { data, error } = await supabase
    .from(WEBHOOKS_TABLE)
    .select(
      'id, name, endpoint, events, status, created_at, last_delivery_at'
    )
    .eq('owner_id', user.id)
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function testWebhook(webhookId) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from('webhook_deliveries')
    .insert({
      webhook_id: webhookId,
      owner_id: user.id,
      event_type: 'test',
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getAPIPlatformStatus() {
  const [keys, webhooks, usage] =
    await Promise.all([
      getAPIKeys(),
      getWebhooks(),
      getAPIUsage({
        page: 0,
        pageSize: 100,
      }),
    ]);

  return {
    keys,
    webhooks,
    usage,
    requests: usage.length,
    active_keys: keys.filter(
      (key) => key.status === 'active'
    ).length,
    active_webhooks: webhooks.filter(
      (webhook) => webhook.status === 'active'
    ).length,
  };
}

export function subscribeToAPIPlatformEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-api-platform')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: KEYS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: WEBHOOKS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}