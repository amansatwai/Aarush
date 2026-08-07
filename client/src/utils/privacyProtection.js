const PROTECTION_STATE_KEY = 'aarush_emergency_privacy_state';
const SECURITY_LOG_KEY = 'aarush_emergency_security_log';

const DEFAULT_STATE = {
  active: false,
  panicPinEnabled: false,
  protections: {
    hideChats: true,
    hideMemories: true,
    hideNotifications: true,
    hideOnlineStatus: true,
    hideLastSeen: true,
    hideReadReceipts: true,
    hideTypingStatus: true,
    hideActiveStatus: true,
    hideStoryVisibility: true,
    hideProfileActivity: true,
    disableIncomingCalls: false,
    disableIncomingMessages: false,
    disableFriendRequests: false,
    logoutOtherDevices: false,
    lockAllSessions: false,
    markCurrentDeviceSafe: true,
    revokeUntrustedDevices: false,
    freezeAccountAccess: false,
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getEmergencyPrivacyState() {
  if (typeof window === 'undefined') {
    return clone(DEFAULT_STATE);
  }

  try {
    const saved = window.localStorage.getItem(PROTECTION_STATE_KEY);
    return saved
      ? { ...clone(DEFAULT_STATE), ...JSON.parse(saved) }
      : clone(DEFAULT_STATE);
  } catch {
    return clone(DEFAULT_STATE);
  }
}

export function saveEmergencyPrivacyState(state) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    PROTECTION_STATE_KEY,
    JSON.stringify(state)
  );
}

export function updateEmergencyProtection(id, enabled) {
  const current = getEmergencyPrivacyState();

  const next = {
    ...current,
    protections: {
      ...current.protections,
      [id]: Boolean(enabled),
    },
  };

  saveEmergencyPrivacyState(next);
  return next;
}

export function activateEmergencyPrivacy(actions = {}) {
  const current = getEmergencyPrivacyState();

  const next = {
    ...current,
    active: true,
    protections: {
      ...current.protections,
      ...actions,
    },
  };

  saveEmergencyPrivacyState(next);

  recordEmergencyEvent({
    triggerType: 'manual',
    actionsExecuted: Object.keys(next.protections).filter(
      (key) => next.protections[key]
    ),
    sessionStatus: 'Emergency privacy active',
  });

  return next;
}

export function deactivateEmergencyPrivacy() {
  const current = getEmergencyPrivacyState();
  const next = {
    ...current,
    active: false,
  };

  saveEmergencyPrivacyState(next);

  recordEmergencyEvent({
    triggerType: 'manual-deactivation',
    actionsExecuted: ['Emergency privacy disabled'],
    sessionStatus: 'Normal protection restored',
  });

  return next;
}

export function getEmergencySecurityLog() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(
      window.localStorage.getItem(SECURITY_LOG_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

export function recordEmergencyEvent({
  triggerType = 'unknown',
  actionsExecuted = [],
  sessionStatus = 'Unknown',
}) {
  if (typeof window === 'undefined') {
    return null;
  }

  const event = {
    id: `emergency-${Date.now()}`,
    time: new Date().toISOString(),
    date: new Date().toLocaleDateString(),
    device:
      navigator.userAgent.includes('Mobile')
        ? 'Mobile device'
        : 'Desktop device',
    approximateLocation: 'Available after secure location integration',
    triggerType,
    actionsExecuted,
    sessionStatus,
  };

  const history = getEmergencySecurityLog();
  const nextHistory = [event, ...history].slice(0, 100);

  window.localStorage.setItem(
    SECURITY_LOG_KEY,
    JSON.stringify(nextHistory)
  );

  return event;
}

export function setPanicPinEnabled(enabled) {
  const state = getEmergencyPrivacyState();

  const next = {
    ...state,
    panicPinEnabled: Boolean(enabled),
  };

  saveEmergencyPrivacyState(next);
  return next;
}

export function validatePanicPin(input, panicPin) {
  return Boolean(input && panicPin && String(input) === String(panicPin));
}

export function getDecoyVaultContent() {
  return {
    profile: {
      username: '@aarush.public',
      displayName: 'Aarush Public',
      bio: 'Aarush community profile',
    },
    chats: [
      {
        id: 'decoy-chat-1',
        name: 'Aarush Community',
        preview: 'Welcome to the Aarush community.',
      },
      {
        id: 'decoy-chat-2',
        name: 'Design Notes',
        preview: 'Your design notes are ready.',
      },
    ],
    gallery: [
      {
        id: 'decoy-media-1',
        title: 'Aarush Welcome',
        type: 'image',
      },
      {
        id: 'decoy-media-2',
        title: 'Community Event',
        type: 'image',
      },
    ],
    memories: [
      {
        id: 'decoy-memory-1',
        title: 'Aarush public memory',
        description: 'A safe example memory.',
      },
    ],
    settings: {
      theme: 'Dark',
      language: 'English',
      notifications: 'Generic',
    },
    activity: [
      {
        id: 'decoy-activity-1',
        title: 'Viewed community update',
        time: 'Today',
      },
    ],
  };
}

export default {
  getEmergencyPrivacyState,
  saveEmergencyPrivacyState,
  updateEmergencyProtection,
  activateEmergencyPrivacy,
  deactivateEmergencyPrivacy,
  getEmergencySecurityLog,
  recordEmergencyEvent,
  setPanicPinEnabled,
  validatePanicPin,
  getDecoyVaultContent,
};