import { supabase } from '../lib/supabase';

const DEVELOPERS_TABLE = 'developer_accounts';
const APPS_TABLE = 'developer_applications';

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
      'Sign in to manage developer tools.'
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

export async function initializeDeveloperPlatform() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    api_version: 'v1',
    oauth_ready: true,
    sdk_ready: true,
    plugin_ready: true,
  };
}

export async function createDeveloperAccount(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create developer accounts.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(DEVELOPERS_TABLE)
    .upsert(
      {
        owner_id: user.id,
        display_name:
          payload.display_name || 'Developer',
        bio: payload.bio || null,
        website: payload.website || null,
        status: 'active',
        verified: false,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'owner_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getDeveloperProfile() {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(DEVELOPERS_TABLE)
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function updateDeveloperProfile(
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(DEVELOPERS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function registerApplication(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot register applications.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(APPS_TABLE)
    .insert({
      owner_id: user.id,
      name: payload.name || 'Aarush application',
      description: payload.description || null,
      redirect_uris: payload.redirect_uris || [],
      scopes: payload.scopes || ['read'],
      status: 'active',
      client_id: randomSecret('client'),
      client_secret: randomSecret('secret'),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateApplication(
  applicationId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(APPS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteApplication(
  applicationId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(APPS_TABLE)
    .delete()
    .eq('id', applicationId)
    .eq('owner_id', user.id);

  if (error) throw error;

  return true;
}

export async function getApplications() {
  if (guestMode()) return [];

  const user = await requireUser();

  const { data, error } = await supabase
    .from(APPS_TABLE)
    .select(`
      id,
      name,
      description,
      redirect_uris,
      scopes,
      status,
      client_id,
      created_at,
      updated_at
    `)
    .eq('owner_id', user.id)
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function generateClientCredentials(
  applicationId
) {
  const user = await requireUser();

  const clientId = randomSecret('client');
  const clientSecret = randomSecret('secret');

  const { data, error } = await supabase
    .from(APPS_TABLE)
    .update({
      client_id: clientId,
      client_secret: clientSecret,
      credentials_rotated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return {
    application: data,
    client_id: clientId,
    client_secret: clientSecret,
  };
}

export async function regenerateClientSecret(
  applicationId
) {
  return generateClientCredentials(applicationId);
}

export async function getDeveloperAnalytics() {
  if (guestMode()) {
    return {
      requests: 0,
      bandwidth: 0,
      webhook_deliveries: 0,
      error_rate: 0,
      latency: 0,
      quota_usage: 0,
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from('api_events')
    .select('*')
    .eq('owner_id', user.id);

  if (error) throw error;

  const events = data || [];
  const failures = events.filter(
    (event) => event.status === 'failed'
  ).length;

  return {
    requests: events.length,
    bandwidth: events.reduce(
      (total, event) =>
        total + Number(event.bytes || 0),
      0
    ),
    webhook_deliveries: events.filter(
      (event) =>
        event.event_type === 'webhook_delivery'
    ).length,
    error_rate: events.length
      ? failures / events.length
      : 0,
    latency: events.length
      ? events.reduce(
          (total, event) =>
            total + Number(event.latency || 0),
          0
        ) / events.length
      : 0,
    quota_usage: 0,
  };
}

export async function exportDeveloperReport() {
  const [
    profile,
    applications,
    analytics,
  ] = await Promise.all([
    getDeveloperProfile(),
    getApplications(),
    getDeveloperAnalytics(),
  ]);

  const report = {
    generated_at: new Date().toISOString(),
    profile,
    applications,
    analytics,
  };

  const blob = new Blob(
    [JSON.stringify(report, null, 2)],
    {
      type: 'application/json',
    }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download =
    'aarush-developer-platform-report.json';
  anchor.click();

  URL.revokeObjectURL(url);

  return report;
}

export function subscribeToDeveloperPlatform(
  callback
) {
  const channel = supabase
    .channel('aarush-developer-platform')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: DEVELOPERS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: APPS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}