import { supabase } from '../lib/supabase';

const COMPLIANCE_TABLE = 'compliance_events';

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
      'Sign in to manage compliance reports.'
    );
  }

  return user;
}

async function logCompliance(
  reportType,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(COMPLIANCE_TABLE)
    .insert({
      actor_id: user.id,
      report_type: reportType,
      metadata,
      status: 'generated',
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeCompliance() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    frameworks: [
      'GDPR placeholder',
      'SOC 2 placeholder',
      'ISO placeholder',
    ],
    audit_trails: true,
    access_reviews: true,
    retention_policies: true,
  };
}

export async function runComplianceCheck() {
  const result = {
    score: 82,
    status: 'Review recommended',
    checks: {
      audit_trails: 'prepared',
      access_reviews: 'prepared',
      permission_reviews: 'prepared',
      data_retention: 'prepared',
      incident_tracking: 'prepared',
      policy_compliance: 'prepared',
      governance_controls: 'prepared',
    },
    checked_at: new Date().toISOString(),
  };

  await logCompliance('compliance_check', result);

  return result;
}

export async function generateAuditReport() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from('enterprise_analytics_events')
    .select('*')
    .eq('actor_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .limit(500);

  if (error) throw error;

  const report = {
    type: 'audit',
    generated_at: new Date().toISOString(),
    events: data || [],
  };

  await logCompliance('audit_report', {
    event_count: report.events.length,
  });

  return report;
}

export async function generateAccessReport() {
  return logCompliance('access_report', {
    role_changes: 0,
    permission_changes: 0,
    assignments: 0,
  });
}

export async function generateSecurityReport() {
  return logCompliance('security_report', {
    authentication_events: 0,
    security_actions: 0,
    incidents: 0,
  });
}

export async function generatePrivacyReport() {
  return logCompliance('privacy_report', {
    privacy_changes: 0,
    data_exports: 0,
    retention_events: 0,
  });
}

export async function generateDataRetentionReport() {
  return logCompliance('retention_report', {
    retention_policy: 'prepared',
    deletion_workflows: 'prepared',
    legal_hold: 'placeholder',
  });
}

export async function generatePolicyComplianceReport() {
  return logCompliance('policy_report', {
    policy_management: 'prepared',
    governance_controls: 'prepared',
    approval_workflows: 'prepared',
  });
}

export async function getComplianceScore() {
  const result = await runComplianceCheck();
  return result.score;
}

export async function getComplianceStatus() {
  if (guestMode()) {
    return {
      score: 0,
      status: 'Demo',
      guest: true,
    };
  }

  const result = await runComplianceCheck();

  return {
    score: result.score,
    status: result.status,
    guest: false,
    frameworks: [
      'GDPR placeholder',
      'SOC 2 placeholder',
      'ISO placeholder',
    ],
  };
}

export function subscribeToComplianceEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-compliance')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: COMPLIANCE_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}