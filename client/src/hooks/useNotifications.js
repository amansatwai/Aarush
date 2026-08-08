import { useCallback, useMemo, useState } from 'react';
import {
  getNotificationEvents,
  getNotificationHealthLevel,
  getNotificationHealthScore,
  getNotificationState,
  getNotificationSummary,
  redactNotification,
  updateNestedNotificationSetting,
  updateNotificationState,
} from '../utils/notificationEngine';

export default function useNotifications() {
  const [state, setState] = useState(getNotificationState);
  const [events, setEvents] = useState(getNotificationEvents);

  const score = getNotificationHealthScore(state);
  const level = getNotificationHealthLevel(score);

  const toggleNested = useCallback((section, id) => {
    setState((current) =>
      updateNestedNotificationSetting(
        section,
        id,
        !current[section][id]
      )
    );
  }, []);

  const update = useCallback((updates) => {
    setState(() => updateNotificationState(updates));
  }, []);

  const markAllRead = useCallback(() => {
    setEvents((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  }, []);

  const markRead = useCallback((id) => {
    setEvents((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  }, []);

  const filteredEvents = useMemo(() => {
    return events.map((event) => redactNotification(event, state));
  }, [events, state]);

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