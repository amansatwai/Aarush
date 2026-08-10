import { supabase } from '../lib/supabase';
import {
  compareFingerprints,
  generateSessionFingerprint,
  getTrustedFingerprint,
  storeTrustedFingerprint,
} from './sessionFingerprintEngine';

const SESSIONS_TABLE = 'secure_sessions';
const EVENTS_TABLE = 'session_security_events';

let sessionCache = null;
let sessionCacheTime = 0;
const CACHE_TTL = 30000;

function guestMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user || null;
}

async function requireUser() {
  const user = await getUser();

  if (!user) {
    throw new Error('Sign in to manage sessions.');
  }

  return user;
}

async function getSessionTokenHash() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(session.access_token)
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function generateSessionSecurityEvent({
  eventType,
  severity = 'info',
  title,
  description,
  metadata = {},
} = {}) {
  if (guestMode()) {
    return null;
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      user_id: user.id,
      event_type: eventType,
      severity,
      title,
      description,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) throw error;

  sessionCache = null;
  return data;
}

export async function createSecureSession() {
  if (guestMode()) {
    return {
      verified: false,
      trusted: false,
      guest: true,
    };
  }

  const user = await requireUser();
  const fingerprint =
    generateSessionFingerprint();
  const tokenHash = await getSessionTokenHash();

  const { data, error } = await supabase
    .from(SESSIONS_TABLE)
    .upsert(
      {
        user_id: user.id,
        token_hash: tokenHash,
        fingerprint,
        status: 'active',
        verified: false,
        trusted: false,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,token_hash',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function initializeSessionSecurity() {
  if (guestMode()) {
    return {
      guest: true,
      status: 'untrusted',
      verified: false,
      trusted: false,
      suspicious: false,
      fingerprint: generateSessionFingerprint(),
    };
  }

  let current = await createSecureSession();

  if (!current?.id) {
    current = await validateCurrentSession();
  }

  return current;
}

export async function validateCurrentSession() {
  if (guestMode()) {
    return {
      status: 'untrusted',
      verified: false,
      trusted: false,
      suspicious: false,
    };
  }

  const user = await requireUser();
  const tokenHash = await getSessionTokenHash();
  const fingerprint =
    generateSessionFingerprint();
  const trustedFingerprint =
    getTrustedFingerprint();

  const comparison = compareFingerprints(
    trustedFingerprint,
    fingerprint
  );

  const { data, error } = await supabase
    .from(SESSIONS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    await generateSessionSecurityEvent({
      eventType: 'unknown_session',
      severity: 'warning',
      title: 'Unknown session detected',
      description:
        'The current session was not found in the trusted session registry.',
      metadata: {
        fingerprint,
      },
    });

    return {
      status: 'suspicious',
      verified: false,
      trusted: false,
      suspicious: true,
      fingerprint,
      comparison,
    };
  }

  const suspicious =
    comparison.suspicious ||
    data.status === 'suspicious' ||
    data.status === 'revoked';

  await supabase
    .from(SESSIONS_TABLE)
    .update({
      fingerprint,
      last_seen_at: new Date().toISOString(),
      status: suspicious ? 'suspicious' : data.status,
    })
    .eq('id', data.id);

  return {
    ...data,
    fingerprint,
    comparison,
    suspicious,
    verified: Boolean(data.verified) && !suspicious,
    trusted: Boolean(data.trusted) && !suspicious,
    status: suspicious
      ? 'suspicious'
      : data.trusted
        ? 'trusted'
        : 'untrusted',
  };
}

export async function refreshSecureSession() {
  if (guestMode()) {
    return {
      refreshed: false,
      guest: true,
    };
  }

  const { data, error } =
    await supabase.auth.refreshSession();

  if (error) throw error;

  await generateSessionSecurityEvent({
    eventType: 'session_refreshed',
    severity: 'info',
    title: 'Session refreshed',
    description:
      'The current Aarush session was refreshed.',
  });

  return {
    refreshed: true,
    session: data.session,
  };
}

export async function revokeCurrentSession() {
  if (guestMode()) {
    throw new Error(
      'Guests cannot revoke sessions.'
    );
  }

  const user = await requireUser();
  const tokenHash = await getSessionTokenHash();

  const { error } = await supabase
    .from(SESSIONS_TABLE)
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('token_hash', tokenHash);

  if (error) throw error;

  await generateSessionSecurityEvent({
    eventType: 'current_session_revoked',
    severity: 'critical',
    title: 'Current session revoked',
    description:
      'The current session was revoked.',
  });

  sessionCache = null;
  return true;
}

export async function revokeOtherSessions() {
  if (guestMode()) {
    throw new Error(
      'Guests cannot revoke sessions.'
    );
  }

  const user = await requireUser();
  const tokenHash = await getSessionTokenHash();

  const { error } = await supabase
    .from(SESSIONS_TABLE)
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .neq('token_hash', tokenHash);

  if (error) throw error;

  await generateSessionSecurityEvent({
    eventType: 'other_sessions_revoked',
    severity: 'warning',
    title: 'Other sessions revoked',
    description:
      'All other active sessions were revoked.',
  });

  sessionCache = null;
  return true;
}

export async function revokeAllSessions() {
  if (guestMode()) {
    throw new Error(
      'Guests cannot revoke sessions.'
    );
  }

  const user = await requireUser();

  const { error } = await supabase
    .from(SESSIONS_TABLE)
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) throw error;

  await generateSessionSecurityEvent({
    eventType: 'all_sessions_revoked',
    severity: 'critical',
    title: 'All sessions revoked',
    description:
      'Every active Aarush session was revoked.',
  });

  sessionCache = null;
  return true;
}

export async function requireSensitiveReauthentication(
  action
) {
  if (guestMode()) {
    return {
      required: true,
      verified: false,
      reason: 'guest',
    };
  }

  await generateSessionSecurityEvent({
    eventType: 'reauthentication_required',
    severity: 'info',
    title: 'Re-authentication required',
    description:
      'A sensitive action requires session verification.',
    metadata: {
      action,
    },
  });

  return {
    required: true,
    verified: false,
    action,
  };
}

export async function verifySessionIntegrity() {
  const result = await validateCurrentSession();

  if (
    result.status === 'suspicious' ||
    result.status === 'revoked'
  ) {
    return {
      ...result,
      verified: false,
    };
  }

  const fingerprint =
    generateSessionFingerprint();

  if (!getTrustedFingerprint()) {
    storeTrustedFingerprint(fingerprint);
  }

  const verified = Boolean(
    result.trusted || result.verified
  );

  return {
    ...result,
    verified,
    status: verified
      ? 'verified'
      : 'untrusted',
  };
}

export async function detectSessionHijacking() {
  const result = await validateCurrentSession();

  const suspicious =
    result.suspicious ||
    result.comparison?.suspicious ||
    result.status === 'revoked';

  if (suspicious) {
    await generateSessionSecurityEvent({
      eventType: 'session_hijacking_indicator',
      severity: 'critical',
      title: 'Possible session hijacking',
      description:
        'The current session fingerprint differs from trusted session data.',
      metadata: {
        comparison: result.comparison,
      },
    });
  }

  return suspicious;
}

export async function detectTokenReuse() {
  if (guestMode()) return false;

  const user = await requireUser();
  const tokenHash = await getSessionTokenHash();

  const { data, error } = await supabase
    .from(SESSIONS_TABLE)
    .select('id, status')
    .eq('user_id', user.id)
    .eq('token_hash', tokenHash);

  if (error) throw error;

  const reused =
    (data || []).filter(
      (session) => session.status === 'revoked'
    ).length > 0;

  if (reused) {
    await generateSessionSecurityEvent({
      eventType: 'token_reuse',
      severity: 'critical',
      title: 'Revoked token reuse detected',
      description:
        'A revoked session token appeared again.',
    });
  }

  return reused;
}

export async function detectConcurrentSessionAbuse() {
  if (guestMode()) return false;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(SESSIONS_TABLE)
    .select('id, created_at, last_seen_at')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (error) throw error;

  const suspicious = (data || []).length > 8;

  if (suspicious) {
    await generateSessionSecurityEvent({
      eventType: 'concurrent_session_abuse',
      severity: 'warning',
      title: 'Many concurrent sessions detected',
      description:
        'An unusually high number of active sessions exists.',
      metadata: {
        active_sessions: data.length,
      },
    });
  }

  return suspicious;
}

export async function getSessionSecurityEvents({
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
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export function subscribeToSessionSecurity(
  callback
) {
  const channel = supabase
    .channel('aarush-session-security')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: SESSIONS_TABLE,
      },
      (payload) => {
        sessionCache = null;
        callback?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: EVENTS_TABLE,
      },
      (payload) => {
        sessionCache = null;
        callback?.(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function clearSessionSecurityCache() {
  sessionCache = null;
  sessionCacheTime = 0;
}