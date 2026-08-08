const NOTIFICATION_STATE_KEY = 'aarush_notification_state';

const DEFAULT_STATE = {
  healthScore: 97,
  privacyMode: true,
  genericMode: true,
  lockScreenMode: 'App name only',
  focusMode: 'None',
  categories: {},
  filters: {
    unread: true,
    today: false,
    yesterday: false,
    thisWeek: false,
    mentions: false,
    directMessages: false,
    groups: false,
    security: false,
    ai: false,
    workspace: false,
    highPriority: false,
    hidden: false,
    archived: false,
    silent: false,
  },
  privacy: {
    hideMessageContent: true,
    hideSenderName: true,
    hideGroupName: true,
    hideMediaPreview: true,
    hideAiAlerts: false,
    hideSecurityDetails: false,
    genericNotificationMode: true,
    lockScreenPrivacy: true,
    notificationRedaction: true,
    privateNotificationMode: true,
    stealthNotificationMode: false,
  },
  scheduling: {
    quietHours: false,
    sleepSchedule: false,
    workSchedule: false,
    weekendSchedule: false,
    timeBasedDelivery: false,
    batchDelivery: false,
    hourlyDigest: false,
    dailyDigest: true,
    aiSmartTiming: true,
  },
};

export const categories = [
  'Messages',
  'Group Chats',
  'Mentions',
  'Replies',
  'Reactions',
  'Follow Requests',
  'Followers',
  'Posts',
  'Reels',
  'Stories',
  'Memories',
  'Vault',
  'Security',
  'Login Alerts',
  'Device Alerts',
  'AI Alerts',
  'Workspace',
  'Marketplace',
  'System Updates',
];

export const focusModes = [
  'None',
  'Work',
  'Study',
  'Sleep',
  'Travel',
  'Meeting',
  'Driving',
  'Gaming',
  'Family',
  'Custom',
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readState() {
  if (typeof window === 'undefined') {
    return clone(DEFAULT_STATE);
  }

  try {
    const saved = window.localStorage.getItem(NOTIFICATION_STATE_KEY);

    if (!saved) {
      return clone(DEFAULT_STATE);
    }

    const parsed = JSON.parse(saved);

    return {
      ...clone(DEFAULT_STATE),
      ...parsed,
      filters: { ...DEFAULT_STATE.filters, ...(parsed.filters || {}) },
      privacy: { ...DEFAULT_STATE.privacy, ...(parsed.privacy || {}) },
      scheduling: {
        ...DEFAULT_STATE.scheduling,
        ...(parsed.scheduling || {}),
      },
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function saveState(state) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      NOTIFICATION_STATE_KEY,
      JSON.stringify(state)
    );
  }
}

export function getNotificationState() {
  return readState();
}

export function updateNotificationState(updates) {
  const next = {
    ...readState(),
    ...updates,
  };

  saveState(next);
  return next;
}

export function updateNestedNotificationSetting(
  section,
  id,
  value
) {
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

export function getNotificationHealthScore(state = readState()) {
  const enabledPrivacy = Object.values(state.privacy).filter(Boolean).length;
  const enabledScheduling = Object.values(state.scheduling).filter(Boolean).length;

  return Math.min(100, Math.max(70, 82 + enabledPrivacy + enabledScheduling));
}

export function getNotificationHealthLevel(score) {
  if (score >= 92) return 'Fully Protected';
  if (score >= 78) return 'Organized';
  if (score >= 60) return 'Moderate';
  return 'Noisy';
}

export function getNotificationSummary() {
  return {
    messages: 12,
    mentions: 3,
    securityAlerts: 1,
    memoryReminders: 2,
    workspaceUpdates: 1,
  };
}

export function getNotificationEvents() {
  return [
    {
      id: 'notification-1',
      title: 'New message from Aman',
      category: 'Messages',
      body: 'You have a new protected message.',
      time: '10:42 AM',
      date: 'Today',
      priority: 'High',
      unread: true,
      hidden: false,
    },
    {
      id: 'notification-2',
      title: 'Security alert',
      category: 'Security',
      body: 'A new device requires review.',
      time: '9:18 AM',
      date: 'Today',
      priority: 'High',
      unread: true,
      hidden: false,
    },
    {
      id: 'notification-3',
      title: 'You were mentioned',
      category: 'Mentions',
      body: 'You were mentioned in a community post.',
      time: 'Yesterday, 8:20 PM',
      date: 'Yesterday',
      priority: 'Normal',
      unread: false,
      hidden: false,
    },
    {
      id: 'notification-4',
      title: 'Memory reminder',
      category: 'Memories',
      body: 'A private memory is ready to revisit.',
      time: 'Monday, 6:04 PM',
      date: 'Monday',
      priority: 'Normal',
      unread: false,
      hidden: true,
    },
  ];
}

export function redactNotification(notification, state = readState()) {
  if (
    !state.privacy.genericNotificationMode &&
    !state.privacy.hideMessageContent
  ) {
    return notification;
  }

  return {
    ...notification,
    title: state.privacy.hideSenderName
      ? 'Aarush notification'
      : notification.title,
    body: state.privacy.hideMessageContent
      ? 'You have a new notification.'
      : notification.body,
  };
}

export default {
  categories,
  focusModes,
  getNotificationState,
  updateNotificationState,
  updateNestedNotificationSetting,
  getNotificationHealthScore,
  getNotificationHealthLevel,
  getNotificationSummary,
  getNotificationEvents,
  redactNotification,
};