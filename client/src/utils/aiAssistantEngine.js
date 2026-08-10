import { supabase } from '../lib/supabase';

const MESSAGES_TABLE = 'ai_assistant_messages';
const CACHE_TTL = 30000;

let assistantCache = null;
let cacheTime = 0;

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
    throw new Error('Sign in to use AI insights.');
  }

  return user;
}

function localResponse(question) {
  const value = String(question || '').toLowerCase();

  if (
    value.includes('privacy') ||
    value.includes('private')
  ) {
    return 'You can manage profile visibility, messaging, followers, stories, muted users, restricted users, and blocked users from Social Privacy settings.';
  }

  if (
    value.includes('security') ||
    value.includes('safe')
  ) {
    return 'Open Security Center to review trusted devices, active sessions, recent security events, and your current security score.';
  }

  if (
    value.includes('backup') ||
    value.includes('restore')
  ) {
    return 'Backup Center lets you create, verify, export, and restore backup versions. Review a backup before restoring it.';
  }

  if (
    value.includes('offline') ||
    value.includes('sync')
  ) {
    return 'Offline Center manages queued actions and background synchronization when your connection returns.';
  }

  if (
    value.includes('follow') ||
    value.includes('following')
  ) {
    return 'You can manage follow requests, followers, following, close friends, and creator suggestions from the social areas of Aarush.';
  }

  return 'I can help explain Aarush features, privacy controls, security status, backups, synchronization, personalization, and recommendations.';
}

export async function initializeAIAssistant() {
  if (guestMode()) {
    return {
      enabled: true,
      guest: true,
      personalized: false,
      mode: 'basic',
    };
  }

  await requireUser();

  return {
    enabled: true,
    guest: false,
    personalized: true,
    mode: 'context-aware',
  };
}

export async function askAssistant(
  question,
  context = {}
) {
  if (!question?.trim()) {
    throw new Error('Ask a question first.');
  }

  const response = localResponse(question);

  if (guestMode()) {
    return {
      role: 'assistant',
      content: response,
      personalized: false,
      created_at: new Date().toISOString(),
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert([
      {
        user_id: user.id,
        role: 'user',
        content: question,
        context,
        created_at: new Date().toISOString(),
      },
      {
        user_id: user.id,
        role: 'assistant',
        content: response,
        context,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    return {
      role: 'assistant',
      content: response,
      personalized: true,
      created_at: new Date().toISOString(),
    };
  }

  return data?.[1] || {
    role: 'assistant',
    content: response,
    personalized: true,
  };
}

export async function getConversationHistory({
  page = 0,
  pageSize = 50,
} = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: true,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function clearConversationHistory() {
  if (guestMode()) return true;

  const user = await requireUser();

  const { error } = await supabase
    .from(MESSAGES_TABLE)
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;

  return true;
}

export async function summarizeActivity(
  context = {}
) {
  return {
    title: 'Activity summary',
    summary:
      'Your Aarush activity can be summarized from notifications, follows, posts, stories, chats, and personalization signals.',
    context,
  };
}

export async function summarizeSecurityStatus(
  context = {}
) {
  return {
    title: 'Security insight',
    summary:
      'Review Security Center for device trust, session health, suspicious events, and account protection settings.',
    context,
  };
}

export async function summarizePrivacyStatus(
  context = {}
) {
  return {
    title: 'Privacy insight',
    summary:
      'Your privacy controls cover account visibility, messaging, followers, stories, blocked users, muted users, and restricted users.',
    context,
  };
}

export async function summarizeNotifications(
  context = {}
) {
  return {
    title: 'Notification insight',
    summary:
      'Notification privacy and notification settings can be adjusted without changing your account or social graph.',
    context,
  };
}

export async function generateSmartSuggestions(
  context = {}
) {
  const suggestions = [
    {
      id: 'device',
      title: 'Trust your current device',
      description:
        'Review Device Trust before changing sensitive settings.',
      action: '/security-center',
    },
    {
      id: 'backup',
      title: 'Back up your account',
      description:
        'Create a verified backup for disaster recovery.',
      action: '/backup-center',
    },
    {
      id: 'privacy',
      title: 'Review privacy settings',
      description:
        'Check profile, messaging, story, and interaction controls.',
      action: '/social-privacy-settings',
    },
    {
      id: 'offline',
      title: 'Enable offline readiness',
      description:
        'Prepare cached data and queued actions for weak connectivity.',
      action: '/offline-center',
    },
    {
      id: 'personalization',
      title: 'Improve feed personalization',
      description:
        'Adjust interests and recommendation preferences.',
      action: '/personalization-settings',
    },
  ];

  return {
    suggestions,
    context,
    personalized: !guestMode(),
  };
}

export async function explainFeature(
  feature
) {
  return askAssistant(
    `Explain the Aarush feature: ${feature}`,
    {
      feature,
    }
  );
}

export async function explainSecurityEvent(
  event
) {
  return askAssistant(
    `Explain this security event: ${
      event?.title || event?.event_type
    }`,
    {
      event,
    }
  );
}

export async function explainPrivacySetting(
  setting
) {
  return askAssistant(
    `Explain this privacy setting: ${setting}`,
    {
      setting,
    }
  );
}

export async function explainRecommendation(
  recommendation
) {
  return askAssistant(
    `Explain this recommendation: ${recommendation}`,
    {
      recommendation,
    }
  );
}

export async function getAssistantStatus() {
  if (
    assistantCache &&
    Date.now() - cacheTime < CACHE_TTL
  ) {
    return assistantCache;
  }

  const result = await initializeAIAssistant();

  assistantCache = result;
  cacheTime = Date.now();

  return result;
}

export function clearAssistantCache() {
  assistantCache = null;
  cacheTime = 0;
}