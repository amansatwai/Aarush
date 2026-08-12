import { supabase } from '../lib/supabase';

const APPS_TABLE = 'sdk_applications';
const EVENTS_TABLE = 'sdk_platform_events';

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
      'Sign in to manage SDK applications.'
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

export async function initializeSDKPlatform() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    sdk_types: [
      'JavaScript SDK',
      'React SDK',
      'React Native SDK',
      'Flutter placeholder',
      'Android placeholder',
      'iOS placeholder',
      'Server SDK placeholder',
      'CLI placeholder',
    ],
    governance_ready: true,
  };
}

export async function createSDKApplication(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create SDK applications.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(APPS_TABLE)
    .insert({
      owner_id: user.id,
      name: payload.name || 'Aarush SDK app',
      description: payload.description || null,
      sdk_type: payload.sdk_type || 'JavaScript SDK',
      scopes: payload.scopes || ['read'],
      status: 'draft',
      client_id: randomSecret('sdk_client'),
      client_secret: randomSecret('sdk_secret'),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateSDKApplication(
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

export async function publishSDKApplication(
  applicationId
) {
  return updateSDKApplication(applicationId, {
    status: 'published',
    published_at: new Date().toISOString(),
  });
}

export async function unpublishSDKApplication(
  applicationId
) {
  return updateSDKApplication(applicationId, {
    status: 'unpublished',
  });
}

export async function getSDKApplications() {
  if (guestMode()) return [];

  const user = await requireUser();

  const { data, error } = await supabase
    .from(APPS_TABLE)
    .select(`
      id,
      name,
      description,
      sdk_type,
      scopes,
      status,
      client_id,
      created_at,
      published_at
    `)
    .eq('owner_id', user.id)
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function generateSDKCredentials(
  applicationId
) {
  const user = await requireUser();
  const secret = randomSecret('sdk_secret');

  const { data, error } = await supabase
    .from(APPS_TABLE)
    .update({
      client_id: randomSecret('sdk_client'),
      client_secret: secret,
      credentials_rotated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return {
    application: data,
    client_secret: secret,
  };
}

export async function regenerateSDKSecret(
  applicationId
) {
  return generateSDKCredentials(applicationId);
}

export async function getSDKAnalytics() {
  if (guestMode()) {
    return {
      applications: 0,
      published: 0,
      api_usage: 0,
      developer_growth: 0,
    };
  }

  const applications =
    await getSDKApplications();

  return {
    applications: applications.length,
    published: applications.filter(
      (item) => item.status === 'published'
    ).length,
    api_usage: 0,
    developer_growth: 0,
  };
}

export async function exportSDKReport() {
  const report = {
    generated_at: new Date().toISOString(),
    applications: await getSDKApplications(),
    analytics: await getSDKAnalytics(),
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
  anchor.download = 'aarush-sdk-platform-report.json';
  anchor.click();

  URL.revokeObjectURL(url);

  return report;
}

export async function getSDKPlatformStatus() {
  const [
    applications,
    analytics,
  ] = await Promise.all([
    getSDKApplications(),
    getSDKAnalytics(),
  ]);

  return {
    applications,
    analytics,
    status: 'operational',
  };
}

export function subscribeToSDKPlatformEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-sdk-platform')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: APPS_TABLE,
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