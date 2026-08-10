import {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { NotificationContext } from '../context/NotificationContext';

const PRIVACY_KEYS = [
  'hideMessageContent',
  'hideSenderName',
  'hideGroupName',
  'hideMediaPreview',
  'hideAiAlerts',
  'hideSecurityDetails',
  'genericNotificationMode',
  'lockScreenPrivacy',
  'notificationRedaction',
  'privateNotificationMode',
  'stealthNotificationMode',
];

const DEFAULT_NOTIFICATION_STATE = {
  privacy: PRIVACY_KEYS.reduce(
    (settings, key) => ({
      ...settings,
      [key]: false,
    }),
    {}
  ),
  lockScreenMode: 'Show Generic Text',
  pushEnabled: true,
  emailEnabled: false,
  inAppEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

function cloneDefaultState() {
  return {
    ...DEFAULT_NOTIFICATION_STATE,
    privacy: {
      ...DEFAULT_NOTIFICATION_STATE.privacy,
    },
  };
}

function getInitialEvents() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(
      'aarush_notification_settings_events'
    );

    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistEvents(events) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      'aarush_notification_settings_events',
      JSON.stringify(events)
    );
  } catch {
    // Local settings persistence is best effort.
  }
}

function updateNestedNotificationSetting(
  state,
  section,
  id,
  value
) {
  return {
    ...state,
    [section]: {
      ...(state[section] || {}),
      [id]: value,
    },
  };
}

function redactNotification(notification, state) {
  const nextNotification = {
    ...notification,
  };

  if (
    state.privacy.hideMessageContent &&
    nextNotification.type === 'message'
  ) {
    nextNotification.body = 'New message';
  }

  if (
    state.privacy.hideSenderName &&
    nextNotification.actor
  ) {
    nextNotification.actor = {
      ...nextNotification.actor,
      username: 'Aarush User',
      full_name: 'Aarush User',
    };
  }

  if (
    state.privacy.hideMediaPreview ||
    state.privacy.genericNotificationMode
  ) {
    nextNotification.image_url = null;
  }

  if (
    state.privacy.hideSecurityDetails &&
    nextNotification.type === 'security'
  ) {
    nextNotification.title = 'Security notification';
    nextNotification.body =
      'Review your account security activity.';
  }

  if (state.privacy.genericNotificationMode) {
    nextNotification.title = 'Aarush notification';
    nextNotification.body =
      'You have a new notification.';
  }

  if (
    state.lockScreenMode === 'Show Nothing' ||
    state.privacy.stealthNotificationMode
  ) {
    nextNotification.title = 'Aarush';
    nextNotification.body = null;
    nextNotification.image_url = null;
  }

  if (
    state.lockScreenMode === 'Show App Name Only'
  ) {
    nextNotification.title = 'Aarush';
    nextNotification.body = null;
    nextNotification.image_url = null;
  }

  if (
    state.lockScreenMode === 'Show Count Only'
  ) {
    nextNotification.title = 'New activity';
    nextNotification.body = null;
    nextNotification.image_url = null;
  }

  return nextNotification;
}

function getNotificationHealthScore(state) {
  let score = 100;

  const enabledPrivacySettings = Object.values(
    state.privacy || {}
  ).filter(Boolean).length;

  score -= Math.min(30, enabledPrivacySettings * 2);

  if (!state.pushEnabled) {
    score -= 8;
  }

  if (!state.inAppEnabled) {
    score -= 8;
  }

  if (state.lockScreenMode === 'Show Full Content') {
    score -= 10;
  }

  if (state.privacy.genericNotificationMode) {
    score += 5;
  }

  if (state.privacy.notificationRedaction) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

function getNotificationHealthLevel(score) {
  if (score >= 80) {
    return 'Protected';
  }

  if (score >= 55) {
    return 'Balanced';
  }

  return 'Needs attention';
}

function getNotificationSummary() {
  return {
    title: 'Notification Privacy',
    description:
      'Notification privacy preferences are stored locally.',
    source: 'local-settings',
  };
}

function getNotificationEvents() {
  return getInitialEvents();
}

export default function useNotifications() {
  const [state, setState] = useState(
    cloneDefaultState
  );
  const [events, setEvents] = useState(
    getNotificationEvents
  );

  const score = useMemo(
    () => getNotificationHealthScore(state),
    [state]
  );

  const level = useMemo(
    () => getNotificationHealthLevel(score),
    [score]
  );

  const toggleNested = useCallback(
    (section, id) => {
      setState((current) => {
        const nextState = updateNestedNotificationSetting(
          current,
          section,
          id,
          !current?.[section]?.[id]
        );

        return nextState;
      });
    },
    []
  );

  const update = useCallback((updates = {}) => {
    setState((current) => ({
      ...current,
      ...updates,
      privacy: updates.privacy
        ? {
            ...current.privacy,
            ...updates.privacy,
          }
        : current.privacy,
    }));
  }, []);

  const markAllRead = useCallback(() => {
    setEvents((current) => {
      const nextEvents = current.map((notification) => ({
        ...notification,
        unread: false,
      }));

      persistEvents(nextEvents);
      return nextEvents;
    });
  }, []);

  const markRead = useCallback((id) => {
    setEvents((current) => {
      const nextEvents = current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: false,
            }
          : notification
      );

      persistEvents(nextEvents);
      return nextEvents;
    });
  }, []);

  const filteredEvents = useMemo(
    () =>
      events.map((event) =>
        redactNotification(event, state)
      ),
    [events, state]
  );

  return {
    state,
    score,
    level,
    summary: getNotificationSummary(),
    events: filteredEvents,
    toggleNested,
    update,
    markAllRead,
    markRead,
  };
}

export function useNotificationBadge() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotificationBadge must be used inside NotificationProvider.'
    );
  }

  return {
    unreadNotificationCount:
      context.unreadNotificationCount || 0,
    unreadMessageCount:
      context.unreadMessageCount || 0,
    totalBadgeCount:
      context.totalBadgeCount || 0,
    loading: Boolean(context.loading),
    refreshBadges: context.refreshBadges,
    markNotificationsRead:
      context.markNotificationsRead,
    incrementNotificationBadge:
      context.incrementNotificationBadge,
    incrementMessageBadge:
      context.incrementMessageBadge,
    clearNotificationBadge:
      context.clearNotificationBadge,
    clearMessageBadge:
      context.clearMessageBadge,
  };
}