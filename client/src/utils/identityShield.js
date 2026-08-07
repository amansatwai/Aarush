const STEALTH_STATE_KEY = 'aarush_stealth_privacy_state';
const PERSONAS_KEY = 'aarush_private_personas';

const DEFAULT_STATE = {
  active: false,
  stealthScore: 99,
  stealthChat: {
    hiddenChats: true,
    invisibleChats: false,
    autoHideSensitiveChats: true,
    temporaryHiddenChat: false,
    secretChatFolder: true,
    hiddenChatNotifications: true,
  },
  hiddenIdentity: {
    secretIdentityMode: false,
    aliasDisplayName: false,
    hiddenProfileVisibility: true,
    anonymousCollaboration: false,
    identityMasking: true,
  },
  relationshipPrivacy: {
    hideFollowers: true,
    hideFollowing: true,
    hideMutualFriends: true,
    hideCloseFriends: true,
    hideStoryAudience: true,
    hideInteractionHistory: true,
    hideSharedActivity: true,
    hideRelationshipIndicators: true,
    hideTaggedPhotos: true,
    hideMentions: true,
  },
  invisibleMode: {
    hideOnlineStatus: true,
    hideLastSeen: true,
    hideTypingIndicator: true,
    hideReadReceipts: true,
    hideActiveDevice: true,
    hideCallAvailability: false,
    appearOfflineWhileActive: true,
    scheduleInvisibleHours: false,
  },
  notifications: {
    hideSenderName: true,
    hideMessageContent: true,
    hideChatIdentity: true,
    genericNotificationMode: true,
    silentStealthNotifications: false,
    lockedNotificationPreview: true,
    aiSmartFiltering: true,
  },
  audienceRing: 'Close Friends',
};

const DEFAULT_PERSONAS = [
  {
    id: 'persona-primary',
    name: 'Primary Identity',
    displayName: 'Aarush Developer',
    username: '@arush.dev',
    photo: 'https://i.pravatar.cc/120?img=12',
    bio: 'Primary Aarush identity',
    audience: 'Friends',
    locked: false,
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(key, fallback) {
  if (typeof window === 'undefined') {
    return clone(fallback);
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function writeJson(key, value) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function getStealthState() {
  const saved = readJson(STEALTH_STATE_KEY, DEFAULT_STATE);

  return {
    ...clone(DEFAULT_STATE),
    ...saved,
    stealthChat: {
      ...DEFAULT_STATE.stealthChat,
      ...(saved.stealthChat || {}),
    },
    hiddenIdentity: {
      ...DEFAULT_STATE.hiddenIdentity,
      ...(saved.hiddenIdentity || {}),
    },
    relationshipPrivacy: {
      ...DEFAULT_STATE.relationshipPrivacy,
      ...(saved.relationshipPrivacy || {}),
    },
    invisibleMode: {
      ...DEFAULT_STATE.invisibleMode,
      ...(saved.invisibleMode || {}),
    },
    notifications: {
      ...DEFAULT_STATE.notifications,
      ...(saved.notifications || {}),
    },
  };
}

export function saveStealthState(state) {
  writeJson(STEALTH_STATE_KEY, state);
}

export function updateStealthSetting(section, id, enabled) {
  const current = getStealthState();

  const next = {
    ...current,
    [section]: {
      ...current[section],
      [id]: Boolean(enabled),
    },
  };

  saveStealthState(next);
  return next;
}

export function setStealthMode(enabled) {
  const current = getStealthState();
  const next = {
    ...current,
    active: Boolean(enabled),
  };

  saveStealthState(next);
  return next;
}

export function setAudienceRing(audienceRing) {
  const current = getStealthState();
  const next = {
    ...current,
    audienceRing,
  };

  saveStealthState(next);
  return next;
}

export function getPersonas() {
  return readJson(PERSONAS_KEY, DEFAULT_PERSONAS);
}

export function savePersonas(personas) {
  writeJson(PERSONAS_KEY, personas);
}

export function createPersona(persona = {}) {
  const personas = getPersonas();

  const nextPersona = {
    id: `persona-${Date.now()}`,
    name: persona.name || 'New Persona',
    displayName: persona.displayName || 'Private Identity',
    username: persona.username || '@private.identity',
    photo: persona.photo || 'https://i.pravatar.cc/120?img=47',
    bio: persona.bio || 'Private Aarush persona',
    audience: persona.audience || 'Custom List',
    locked: false,
  };

  const next = [...personas, nextPersona];
  savePersonas(next);
  return next;
}

export function updatePersona(id, updates) {
  const next = getPersonas().map((persona) =>
    persona.id === id ? { ...persona, ...updates } : persona
  );

  savePersonas(next);
  return next;
}

export function deletePersona(id) {
  const next = getPersonas().filter((persona) => persona.id !== id);
  savePersonas(next);
  return next;
}

export function getIdentityRisks() {
  return [
    {
      id: 'impersonation',
      title: 'Impersonation accounts',
      status: '1 account to review',
      risk: 'Moderate',
      recommendation: 'Review and report the suspected profile.',
    },
    {
      id: 'fake-profile',
      title: 'Fake profiles',
      status: 'No strong signal',
      risk: 'Low',
      recommendation: 'Keep identity scanning enabled.',
    },
    {
      id: 'stolen-photo',
      title: 'Stolen profile photos',
      status: 'Protected',
      risk: 'Low',
      recommendation: 'No action required.',
    },
    {
      id: 'username-similarity',
      title: 'Username similarity',
      status: '2 similar names',
      risk: 'Moderate',
      recommendation: 'Review similar accounts.',
    },
    {
      id: 'identity-cloning',
      title: 'Identity cloning',
      status: 'No strong signal',
      risk: 'Low',
      recommendation: 'No action required.',
    },
    {
      id: 'relationship-exposure',
      title: 'Relationship exposure risks',
      status: 'Protected',
      risk: 'Low',
      recommendation: 'Relationship privacy is enabled.',
    },
    {
      id: 'audience-leakage',
      title: 'Audience leakage',
      status: 'Protected',
      risk: 'Low',
      recommendation: 'Review audience rings before sharing.',
    },
    {
      id: 'privacy-conflicts',
      title: 'Privacy conflicts',
      status: 'None detected',
      risk: 'Low',
      recommendation: 'No action required.',
    },
  ];
}

export default {
  getStealthState,
  saveStealthState,
  updateStealthSetting,
  setStealthMode,
  setAudienceRing,
  getPersonas,
  savePersonas,
  createPersona,
  updatePersona,
  deletePersona,
  getIdentityRisks,
};