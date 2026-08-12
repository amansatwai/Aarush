import { supabase } from '../lib/supabase';

const EVENTS_TABLE = 'enterprise_analytics_events';

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
      'Sign in to access enterprise analytics.'
    );
  }

  return user;
}

export async function initializeEnterpriseAnalytics() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    observability_ready: true,
    audit_intelligence_ready: true,
    compliance_ready: true,
  };
}

export async function trackEnterpriseEvent(
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

export async function trackWorkspaceActivity(
  metadata = {}
) {
  return trackEnterpriseEvent(
    'workspace_activity',
    metadata
  );
}

export async function trackTeamActivity(
  metadata = {}
) {
  return trackEnterpriseEvent(
    'team_activity',
    metadata
  );
}

export async function trackAPIUsage(
  metadata = {}
) {
  return trackEnterpriseEvent(
    'api_usage',
    metadata
  );
}

export async function trackIntegrationUsage(
  metadata = {}
) {
  return trackEnterpriseEvent(
    'integration_usage',
    metadata
  );
}

export async function trackSecurityActivity(
  metadata = {}
) {
  return trackEnterpriseEvent(
    'security_activity',
    metadata
  );
}

export async function trackPerformanceMetrics(
  metadata = {}
) {
  return trackEnterpriseEvent(
    'performance_metrics',
    metadata
  );
}

async function getEvents(limit = 500) {
  if (guestMode()) return [];

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .select('*')
    .eq('actor_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

function count(events, type) {
  return events.filter(
    (event) => event.event_type === type
  ).length;
}

export async function generateOperationalDashboard() {
  const events = await getEvents();

  return {
    active_organizations: 0,
    active_workspaces: 0,
    active_users: 0,
    api_requests: count(events, 'api_usage'),
    webhook_deliveries: count(
      events,
      'webhook_delivery'
    ),
    integrations: count(
      events,
      'integration_usage'
    ),
    security_events: count(
      events,
      'security_activity'
    ),
    storage_usage: 0,
    bandwidth_usage: 0,
    performance_metrics: events.filter(
      (event) =>
        event.event_type === 'performance_metrics'
    ),
  };
}

export async function generateUsageDashboard() {
  const events = await getEvents();

  return {
    login_activity: count(events, 'login'),
    backup_activity: count(events, 'backup'),
    sync_activity: count(events, 'sync'),
    media_usage: count(events, 'media_usage'),
    creator_activity: count(
      events,
      'creator_activity'
    ),
    business_activity: count(
      events,
      'business_activity'
    ),
    usage_trend: 'stable',
  };
}

export async function generateExecutiveSummary() {
  const [
    operational,
    usage,
  ] = await Promise.all([
    generateOperationalDashboard(),
    generateUsageDashboard(),
  ]);

  return {
    operational_summary:
      'Enterprise operations are being monitored across activity, API, security, and performance events.',
    security_summary:
      `${operational.security_events} security events are available for review.`,
    compliance_summary:
      'Compliance checks are prepared for governance integration.',
    growth_summary:
      'Usage and workspace growth metrics are prepared for aggregation.',
    usage_trends: usage,
    risk_trends: {
      level: 'monitoring',
    },
    performance_trends: operational.performance_metrics,
    recommendations: [
      'Review access governance regularly.',
      'Maintain audit retention policies.',
      'Monitor API and integration error rates.',
    ],
  };
}

export async function exportAnalyticsReport() {
  const report = {
    generated_at: new Date().toISOString(),
    operational: await generateOperationalDashboard(),
    usage: await generateUsageDashboard(),
    executive: await generateExecutiveSummary(),
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
    'aarush-enterprise-analytics-report.json';
  anchor.click();

  URL.revokeObjectURL(url);

  return report;
}

export async function getAnalyticsStatus() {
  const [
    operational,
    usage,
  ] = await Promise.all([
    generateOperationalDashboard(),
    generateUsageDashboard(),
  ]);

  return {
    operational,
    usage,
    events_analyzed:
      operational.security_events +
      operational.api_requests,
    status: 'operational',
  };
}

export function subscribeToEnterpriseAnalytics(
  callback
) {
  const channel = supabase
    .channel('aarush-enterprise-analytics')
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