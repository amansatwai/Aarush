import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { supabase } from '../lib/supabase';
import {
  getUnreadCount as getUnreadNotificationCount,
  markAllAsRead,
  subscribeToNotifications,
} from '../utils/notificationEngine';
import {
  getUnreadCount as getUnreadMessageCount,
  subscribeToConversations,
} from '../utils/chatEngine';

export const NotificationContext =
  createContext(null);

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
};

function isGuestMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem(GUEST_KEYS.isGuest) ===
      'true' &&
    window.localStorage.getItem(
      GUEST_KEYS.guestSession
    ) === 'active'
  );
}

function isAuthenticatedUser(user) {
  return Boolean(user?.id);
}

export function NotificationProvider({ children }) {
  const mountedRef = useRef(false);
  const refreshTimerRef = useRef(null);
  const refreshRequestRef = useRef(null);
  const realtimeCleanupRef = useRef(null);

  const [user, setUser] = useState(null);
  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(0);
  const [unreadMessageCount, setUnreadMessageCount] =
    useState(0);
  const [loading, setLoading] = useState(true);

  const totalBadgeCount = useMemo(
    () =>
      unreadNotificationCount +
      unreadMessageCount,
    [unreadMessageCount, unreadNotificationCount]
  );

  const clearRealtimeSubscriptions = useCallback(() => {
    if (typeof realtimeCleanupRef.current === 'function') {
      realtimeCleanupRef.current();
      realtimeCleanupRef.current = null;
    }
  }, []);

  const refreshBadges = useCallback(async () => {
    if (isGuestMode()) {
      setUser(null);
      setUnreadNotificationCount(0);
      setUnreadMessageCount(0);
      setLoading(false);
      return;
    }

    if (refreshRequestRef.current) {
      return refreshRequestRef.current;
    }

    const request = (async () => {
      try {
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!isAuthenticatedUser(currentUser)) {
          setUser(null);
          setUnreadNotificationCount(0);
          setUnreadMessageCount(0);
          return;
        }

        setUser(currentUser);

        const [
          notificationCount,
          messageCount,
        ] = await Promise.all([
          getUnreadNotificationCount(),
          getUnreadMessageCount(),
        ]);

        if (!mountedRef.current) {
          return;
        }

        setUnreadNotificationCount(
          Number(notificationCount || 0)
        );
        setUnreadMessageCount(
          Number(messageCount || 0)
        );
      } catch {
        if (!mountedRef.current) {
          return;
        }

        setUnreadNotificationCount(0);
        setUnreadMessageCount(0);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }

        refreshRequestRef.current = null;
      }
    })();

    refreshRequestRef.current = request;

    return request;
  }, []);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = window.setTimeout(() => {
      refreshBadges();
      refreshTimerRef.current = null;
    }, 160);
  }, [refreshBadges]);

  const incrementNotificationBadge = useCallback(
    (amount = 1) => {
      if (isGuestMode()) {
        return;
      }

      setUnreadNotificationCount((current) =>
        Math.max(0, current + Number(amount || 0))
      );
    },
    []
  );

  const incrementMessageBadge = useCallback(
    (amount = 1) => {
      if (isGuestMode()) {
        return;
      }

      setUnreadMessageCount((current) =>
        Math.max(0, current + Number(amount || 0))
      );
    },
    []
  );

  const clearNotificationBadge = useCallback(
    (amount = null) => {
      setUnreadNotificationCount((current) =>
        amount === null
          ? 0
          : Math.max(0, current - Number(amount || 0))
      );
    },
    []
  );

  const clearMessageBadge = useCallback(
    (amount = null) => {
      setUnreadMessageCount((current) =>
        amount === null
          ? 0
          : Math.max(0, current - Number(amount || 0))
      );
    },
    []
  );

  const markNotificationsRead = useCallback(async () => {
    if (isGuestMode()) {
      setUnreadNotificationCount(0);
      return;
    }

    setUnreadNotificationCount(0);

    try {
      await markAllAsRead();
    } catch {
      scheduleRefresh();
    }
  }, [scheduleRefresh]);

  const handleNotificationRealtime = useCallback(
    (payload) => {
      if (!mountedRef.current || isGuestMode()) {
        return;
      }

      const recipientId =
        payload?.new?.recipient_id ||
        payload?.old?.recipient_id;

      if (recipientId && recipientId !== user?.id) {
        return;
      }

      if (
        payload.eventType === 'INSERT' &&
        payload.new
      ) {
        incrementNotificationBadge(1);
        return;
      }

      scheduleRefresh();
    },
    [
      incrementNotificationBadge,
      scheduleRefresh,
      user?.id,
    ]
  );

  const handleConversationRealtime = useCallback(
    (payload) => {
      if (!mountedRef.current || isGuestMode()) {
        return;
      }

      if (
        payload?.table === 'messages' &&
        payload.eventType === 'INSERT' &&
        payload.new?.sender_id !== user?.id
      ) {
        incrementMessageBadge(1);
        return;
      }

      if (
        payload?.table === 'message_reads' ||
        payload?.table === 'message_deletions' ||
        payload?.table ===
          'conversation_participants'
      ) {
        scheduleRefresh();
      }
    },
    [
      incrementMessageBadge,
      scheduleRefresh,
      user?.id,
    ]
  );

  const startRealtimeSubscriptions = useCallback(() => {
    clearRealtimeSubscriptions();

    if (
      !isAuthenticatedUser(user) ||
      isGuestMode()
    ) {
      return;
    }

    const notificationCleanup =
      subscribeToNotifications(
        handleNotificationRealtime
      );

    const conversationCleanup =
      subscribeToConversations(
        handleConversationRealtime
      );

    realtimeCleanupRef.current = () => {
      notificationCleanup?.();
      conversationCleanup?.();
    };
  }, [
    clearRealtimeSubscriptions,
    handleConversationRealtime,
    handleNotificationRealtime,
    user,
  ]);

  useEffect(() => {
    mountedRef.current = true;

    refreshBadges();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mountedRef.current) {
          return;
        }

        if (
          isGuestMode() ||
          !nextSession?.user
        ) {
          setUser(null);
          setUnreadNotificationCount(0);
          setUnreadMessageCount(0);
          clearRealtimeSubscriptions();
          setLoading(false);
          return;
        }

        setUser(nextSession.user);
        scheduleRefresh();
      }
    );

    return () => {
      mountedRef.current = false;

      subscription?.unsubscribe();
      clearRealtimeSubscriptions();

      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      refreshRequestRef.current = null;
    };
  }, [
    clearRealtimeSubscriptions,
    refreshBadges,
    scheduleRefresh,
  ]);

  useEffect(() => {
    if (
      !user ||
      !isAuthenticatedUser(user) ||
      isGuestMode()
    ) {
      clearRealtimeSubscriptions();
      return undefined;
    }

    startRealtimeSubscriptions();

    return () => {
      clearRealtimeSubscriptions();
    };
  }, [
    clearRealtimeSubscriptions,
    startRealtimeSubscriptions,
    user,
  ]);

  const value = useMemo(
    () => ({
      unreadNotificationCount,
      unreadMessageCount,
      totalBadgeCount,
      loading,
      refreshBadges,
      markNotificationsRead,
      incrementNotificationBadge,
      incrementMessageBadge,
      clearNotificationBadge,
      clearMessageBadge,
    }),
    [
      clearMessageBadge,
      clearNotificationBadge,
      incrementMessageBadge,
      incrementNotificationBadge,
      loading,
      markNotificationsRead,
      refreshBadges,
      totalBadgeCount,
      unreadMessageCount,
      unreadNotificationCount,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}