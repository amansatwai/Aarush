import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPresenceChannel } from '../utils/chatEngine';

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
};

function isGuestMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem(GUEST_KEYS.isGuest) === 'true' &&
    window.localStorage.getItem(
      GUEST_KEYS.guestSession
    ) !== null
  );
}

function getDeviceName() {
  if (typeof navigator === 'undefined') {
    return 'Unknown device';
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|android/.test(userAgent)) {
    return 'Mobile device';
  }

  if (/macintosh|mac os/.test(userAgent)) {
    return 'Mac';
  }

  if (/windows/.test(userAgent)) {
    return 'Windows device';
  }

  return 'Browser';
}

function getSessionId() {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function normalizePresenceState(state) {
  const result = {};

  Object.entries(state || {}).forEach(
    ([userId, sessions]) => {
      const normalizedSessions = Array.isArray(sessions)
        ? sessions
        : [];

      result[userId] = normalizedSessions.map(
        (session) => ({
          ...session,
          online: session.online !== false,
          lastActive:
            session.lastActive ||
            session.last_active ||
            null,
          activeSessionCount:
            session.activeSessionCount ||
            session.active_session_count ||
            1,
        })
      );
    }
  );

  return result;
}

export function usePresence({
  channelKey,
  userId,
  enabled = true,
  currentPage = 'chat',
  currentDevice,
  onPresenceChange,
} = {}) {
  const channelRef = useRef(null);
  const sessionIdRef = useRef(getSessionId());

  const [presenceState, setPresenceState] =
    useState({});
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] =
    useState(false);

  const device = useMemo(
    () => currentDevice || getDeviceName(),
    [currentDevice]
  );

  const getPresenceState = useCallback(() => {
    if (!channelRef.current) {
      return presenceState;
    }

    return normalizePresenceState(
      channelRef.current.presenceState()
    );
  }, [presenceState]);

  const updatePresence = useCallback(
    async (updates = {}) => {
      if (
        !channelRef.current ||
        !userId ||
        isGuestMode()
      ) {
        return false;
      }

      const payload = {
        userId,
        sessionId: sessionIdRef.current,
        online: updates.online !== false,
        status: updates.status || 'online',
        lastActive:
          updates.lastActive ||
          new Date().toISOString(),
        activeSessionCount:
          updates.activeSessionCount || 1,
        currentDevice: updates.currentDevice || device,
        currentPage:
          updates.currentPage || currentPage,
        invisible: Boolean(updates.invisible),
      };

      try {
        await channelRef.current.track(payload);
        return true;
      } catch {
        return false;
      }
    },
    [currentPage, device, userId]
  );

  const connectPresence = useCallback(async () => {
    if (
      !enabled ||
      !channelKey ||
      !userId ||
      isGuestMode()
    ) {
      return null;
    }

    if (channelRef.current) {
      return channelRef.current;
    }

    const channel = createPresenceChannel(channelKey);

    if (!channel) {
      return null;
    }

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const nextState = normalizePresenceState(
          channel.presenceState()
        );

        setPresenceState(nextState);
        setConnected(true);
        setReconnecting(false);
        onPresenceChange?.(nextState);
      })
      .on('presence', { event: 'join' }, () => {
        const nextState = normalizePresenceState(
          channel.presenceState()
        );

        setPresenceState(nextState);
        onPresenceChange?.(nextState);
      })
      .on('presence', { event: 'leave' }, () => {
        const nextState = normalizePresenceState(
          channel.presenceState()
        );

        setPresenceState(nextState);
        onPresenceChange?.(nextState);
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setConnected(true);
        setReconnecting(false);

        await updatePresence({
          online: true,
          status: 'online',
        });
      }

      if (
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT'
      ) {
        setConnected(false);
        setReconnecting(true);
      }

      if (status === 'CLOSED') {
        setConnected(false);
      }
    });

    return channel;
  }, [
    channelKey,
    enabled,
    onPresenceChange,
    updatePresence,
    userId,
  ]);

  const disconnectPresence = useCallback(async () => {
    const channel = channelRef.current;

    if (!channel) {
      return;
    }

    try {
      if (userId && !isGuestMode()) {
        await channel.track({
          userId,
          sessionId: sessionIdRef.current,
          online: false,
          status: 'offline',
          lastActive: new Date().toISOString(),
          activeSessionCount: 0,
          currentDevice: device,
          currentPage,
        });
      }
    } catch {
      // Disconnect cleanup is best effort.
    }

    channelRef.current = null;
    setPresenceState({});
    setConnected(false);
    setReconnecting(false);
  }, [currentPage, device, userId]);

  useEffect(() => {
    let active = true;

    if (enabled && channelKey && userId && !isGuestMode()) {
      connectPresence().then((channel) => {
        if (!active || !channel) {
          return;
        }

        updatePresence({
          online: true,
          status: 'online',
        });
      });
    }

    return () => {
      active = false;
      disconnectPresence();
    };
  }, [
    channelKey,
    connectPresence,
    disconnectPresence,
    enabled,
    updatePresence,
    userId,
  ]);

  useEffect(() => {
    const handleOnline = () => {
      updatePresence({
        online: true,
        status: 'online',
        lastActive: new Date().toISOString(),
      });
    };

    const handleOffline = () => {
      updatePresence({
        online: false,
        status: 'offline',
        lastActive: new Date().toISOString(),
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener(
        'offline',
        handleOffline
      );
    };
  }, [updatePresence]);

  return {
    presenceState,
    connected,
    reconnecting,
    connectPresence,
    disconnectPresence,
    subscribePresence: connectPresence,
    updatePresence,
    getPresenceState,
  };
}

export function getPresenceSessions(
  presenceState,
  userId
) {
  if (!userId) {
    return [];
  }

  return presenceState?.[userId] || [];
}

export function isUserOnline(
  presenceState,
  userId
) {
  return getPresenceSessions(
    presenceState,
    userId
  ).some(
    (session) =>
      session.online !== false &&
      session.invisible !== true
  );
}

export function getActiveSessionCount(
  presenceState,
  userId
) {
  return getPresenceSessions(
    presenceState,
    userId
  ).filter((session) => session.online !== false).length;
}