const INNOVATION_STATE_KEY = 'aarush_privacy_innovation_state';

const DEFAULT_STATE = {
  score: 100,
  microSessionLock: {
    chats: true,
    memories: true,
    securityPages: true,
    paymentAreas: false,
    settings: false,
    aiConversations: true,
    hiddenVault: true,
    profile: false,
  },
  microTimeouts: {
    chats: '30',
    memories: '60',
    securityPages: '300',
    paymentAreas: '60',
    settings: '300',
    aiConversations: '30',
    hiddenVault: 'immediately',
    profile: '300',
  },
  clipboard: {
    autoClear: true,
    clearAfter10: true,
    clearAfter30: false,
    clearAfter60: false,
    clearAfter300: false,
    clearOnExit: true,
    preventHistory: true,
    encryptTemporarily: true,
    warnBeforeCopy: true,
    detectPasswordCopy: true,
  },
  automation: {
    autoBlurSensitive: true,
    autoHideNotifications: true,
    autoLockPublicMode: true,
    autoEmergencyPrivacy: false,
    autoProtectClipboard: true,
    autoHideProfileActivity: true,
    autoInvisibleMode: false,
    autoMicroLock: true,
    autoRemoveTemporaryData: true,
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readState() {
  if (typeof window === 'undefined') {
    return clone(DEFAULT_STATE);
  }

  try {
    const saved = window.localStorage.getItem(INNOVATION_STATE_KEY);

    if (!saved) {
      return clone(DEFAULT_STATE);
    }

    const parsed = JSON.parse(saved);

    return {
      ...clone(DEFAULT_STATE),
      ...parsed,
      microSessionLock: {
        ...DEFAULT_STATE.microSessionLock,
        ...(parsed.microSessionLock || {}),
      },
      microTimeouts: {
        ...DEFAULT_STATE.microTimeouts,
        ...(parsed.microTimeouts || {}),
      },
      clipboard: {
        ...DEFAULT_STATE.clipboard,
        ...(parsed.clipboard || {}),
      },
      automation: {
        ...DEFAULT_STATE.automation,
        ...(parsed.automation || {}),
      },
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function saveState(state) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      INNOVATION_STATE_KEY,
      JSON.stringify(state)
    );
  }
}

export function getInnovationState() {
  return readState();
}

export function getInnovationScore(state = readState()) {
  const enabled =
    Object.values(state.microSessionLock).filter(Boolean).length +
    Object.values(state.clipboard).filter(Boolean).length +
    Object.values(state.automation).filter(Boolean).length;

  return Math.min(100, Math.max(70, 70 + enabled));
}

export function getInnovationLevel(score) {
  if (score >= 95) return 'Revolutionary';
  if (score >= 85) return 'Advanced';
  if (score >= 70) return 'Strong';
  return 'Standard';
}

export function updateInnovationSetting(section, id, value) {
  const current = readState();

  const next = {
    ...current,
    [section]: {
      ...current[section],
      [id]: value,
    },
  };

  saveState(next);
  return next;
}

export function setMicroTimeout(id, value) {
  return updateInnovationSetting('microTimeouts', id, value);
}

export function getPrivacyTimeline() {
  return [
    ['Login event', 'Today, 10:42 AM', 'Protected', 'Account access reviewed.'],
    ['Privacy setting changed', 'Today, 9:18 AM', 'Active', 'Hidden notifications enabled.'],
    ['Trusted device changed', 'Yesterday, 8:22 PM', 'Protected', 'Android Phone approved.'],
    ['Hidden chat access', 'Yesterday, 7:50 PM', 'Protected', 'Private chat opened after verification.'],
    ['Screenshot event', 'Monday, 5:15 PM', 'Review', 'Protected screen capture detected.'],
    ['Audience change', 'Sunday, 4:25 PM', 'Active', 'Story audience changed to Close Friends.'],
    ['Session revocation', 'Saturday, 3:10 PM', 'Protected', 'Older session revoked remotely.'],
  ];
}

export function getInnovationSystems() {
  return [
    ['Micro Lock Engine', 'Active'],
    ['Clipboard Security Engine', 'Protected'],
    ['Screenshot Verification Engine', 'Syncing'],
    ['Privacy Timeline Engine', 'Active'],
    ['Ambient Privacy Engine', 'Future'],
    ['Hologram Identity Engine', 'Future'],
    ['AI Innovation Engine', 'Learning'],
    ['Sensor Integration Layer', 'Syncing'],
    ['Secure Data Erasure', 'Active'],
    ['Privacy Automation Engine', 'Active'],
    ['Realtime Protection Sync', 'Syncing'],
    ['Identity Verification Layer', 'Protected'],
  ];
}

export default {
  getInnovationState,
  getInnovationScore,
  getInnovationLevel,
  updateInnovationSetting,
  setMicroTimeout,
  getPrivacyTimeline,
  getInnovationSystems,
};