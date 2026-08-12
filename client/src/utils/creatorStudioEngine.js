import { supabase } from '../lib/supabase';

const CREATOR_TABLE = 'creator_profiles';
const CONTENT_TABLE = 'creator_premium_content';
const EVENTS_TABLE = 'creator_activity';

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
      'Sign in to use Creator Studio.'
    );
  }

  return user;
}

async function logActivity(
  eventType,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      creator_id: user.id,
      event_type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeCreatorStudio() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    monetization_ready: !guestMode(),
    verification_ready: true,
  };
}

export async function createCreatorProfile(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create creator profiles.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(CREATOR_TABLE)
    .upsert(
      {
        user_id: user.id,
        creator_name:
          payload.creator_name || null,
        bio: payload.bio || null,
        category: payload.category || null,
        portfolio_url:
          payload.portfolio_url || null,
        status: 'active',
        verified: false,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  await logActivity('creator_profile_created');
  return data;
}

export async function updateCreatorProfile(
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(CREATOR_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getCreatorProfile(
  creatorId
) {
  const id = creatorId || (await requireUser()).id;

  const { data, error } = await supabase
    .from(CREATOR_TABLE)
    .select('*')
    .eq('user_id', id)
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function getCreatorDashboard() {
  const profile = await getCreatorProfile();

  return {
    profile,
    active: Boolean(profile),
    verified: Boolean(profile?.verified),
    monetization_ready: Boolean(
      profile?.monetization_ready
    ),
  };
}

export async function publishPremiumContent(
  payload = {}
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(CONTENT_TABLE)
    .insert({
      ...payload,
      creator_id: user.id,
      visibility: 'premium',
      status: payload.status || 'published',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity('premium_content_published', {
    content_id: data.id,
  });

  return data;
}

export async function scheduleContent(
  contentId,
  scheduledAt
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(CONTENT_TABLE)
    .update({
      status: 'scheduled',
      scheduled_at: scheduledAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId)
    .eq('creator_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getContentPerformance({
  page = 0,
  pageSize = 30,
} = {}) {
  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('creator_content_analytics')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function getAudienceInsights() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from('creator_audience_insights')
    .select('*')
    .eq('creator_id', user.id)
    .maybeSingle();

  if (error) throw error;

  return (
    data || {
      subscribers: 0,
      subscriber_growth: 0,
      churn_rate: 0,
      engagement_rate: 0,
      conversion_rate: 0,
      average_revenue_per_subscriber: 0,
    }
  );
}

export async function getCreatorAnalytics() {
  const [
    performance,
    audience,
  ] = await Promise.all([
    getContentPerformance({
      page: 0,
      pageSize: 100,
    }),
    getAudienceInsights(),
  ]);

  return {
    performance,
    audience,
    top_content: performance
      .slice()
      .sort(
        (first, second) =>
          Number(second.engagement || 0) -
          Number(first.engagement || 0)
      )
      .slice(0, 5),
  };
}

export async function exportCreatorReport() {
  const analytics = await getCreatorAnalytics();
  const blob = new Blob(
    [JSON.stringify(analytics, null, 2)],
    {
      type: 'application/json',
    }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = 'aarush-creator-report.json';
  anchor.click();

  URL.revokeObjectURL(url);

  return analytics;
}

export function subscribeToCreatorStudio(
  callback
) {
  const channel = supabase
    .channel('aarush-creator-studio')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: CREATOR_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: CONTENT_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}