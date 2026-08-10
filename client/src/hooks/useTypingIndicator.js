import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createTypingChannel } from '../utils/chatEngine';

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

function getSessionId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export function useTypingIndicator({
  channelKey,
  userId,
  enabled = true,
  debounceMs = 700,
  timeoutMs = 2600,
  onTypingChange,
} = {}) {
  const channelRef = useRef(null);
  const timeoutMapRef = useRef(new Map());
  const debounceRef = useRef(null);
  const sessionIdRef = useRef(getSessionId());

  const [typingUsers, setTypingUsers] = useState({});
  const [connected, setConnected] = useState(false);

  const updateTypingUsers = useCallback(
    (userIdValue, value, payload = {}) => {
      setTypingUsers((current) => {
        const next = {
          ...current,
        };

        if (value) {
          next[userIdValue] = {
            ...payload,
            userId: userIdValue,
            typing: true,
            lastTypingAt: Date.now(),
          };
        } else {
          delete next[userIdValue];
        }

        onTypingChange?.(next);
        return next;
      });
    },
    [onTypingChange]
  );

  const clearTypingUser = useCallback(
    (remoteUserId) => {
      const timeout = timeoutMapRef.current.get(
        remoteUserId
      );

      if (timeout) {
        window.clearTimeout(timeout);
        timeoutMapRef.current.delete(remoteUserId);
      }

      updateTypingUsers(remoteUserId, false);
    },
    [updateTypingUsers]
  );

  const receiveTypingEvent = useCallback(
    (payload = {}) => {
      const remoteUserId = payload.userId;

      if (
        !remoteUserId ||
        remoteUserId === userId
      ) {
        return;
      }

      if (!payload.typing) {
        clearTypingUser(remoteUserId);
        return;
      }

      updateTypingUsers(remoteUserId, true, payload);

      const existingTimeout =
        timeoutMapRef.current.get(remoteUserId);

      if (existingTimeout) {
        window.clearTimeout(existingTimeout);
      }

      const timeout = window.setTimeout(() => {
        clearTypingUser(remoteUserId);
      }, timeoutMs);

      timeoutMapRef.current.set(
        remoteUserId,
        timeout
      );
    },
    [
      clearTypingUser,
      timeoutMs,
      updateTypingUsers,
      userId,
    ]
  );

  const subscribeTyping = useCallback(() => {
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

    const channel = createTypingChannel(channelKey);

    if (!channel) {
      return null;
    }

    channelRef.current = channel;

    channel
      .on(
        'broadcast',
        { event: 'typing' },
        ({ payload }) => {
          receiveTypingEvent(payload);
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return channel;
  }, [
    channelKey,
    enabled,
    receiveTypingEvent,
    userId,
  ]);

  const sendTypingEvent = useCallback(
    async (typing) => {
      const channel = channelRef.current;

      if (
        !channel ||
        !userId ||
        isGuestMode()
      ) {
        return false;
      }

      try {
        await channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            userId,
            sessionId: sessionIdRef.current,
            typing,
            timestamp: new Date().toISOString(),
          },
        });

        return true;
      } catch {
        return false;
      }
    },
    [userId]
  );

  const startTyping = useCallback(() => {
    if (
      !enabled ||
      !userId ||
      isGuestMode()
    ) {
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      sendTypingEvent(true);
    }, debounceMs);
  }, [
    debounceMs,
    enabled,
    sendTypingEvent,
    userId,
  ]);

  const stopTyping = useCallback(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    sendTypingEvent(false);
  }, [sendTypingEvent]);

  useEffect(() => {
    const channel = subscribeTyping();

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }

      timeoutMapRef.current.forEach((timeout) => {
        window.clearTimeout(timeout);
      });

      timeoutMapRef.current.clear();
      channelRef.current = null;

      if (channel) {
        channel.unsubscribe();
      }

      setTypingUsers({});
      setConnected(false);
    };
  }, [subscribeTyping]);

  const typingUserIds = useMemo(
    () => Object.keys(typingUsers),
    [typingUsers]
  );

  const isAnyoneTyping = typingUserIds.length > 0;

  return {
    typingUsers,
    typingUserIds,
    isAnyoneTyping,
    connected,
    startTyping,
    stopTyping,
    subscribeTyping,
    sendTypingEvent,
  };
}

export function formatTypingLabel(
  typingUsers,
  profiles = {}
) {
  const userIds = Object.keys(typingUsers || {});

  if (!userIds.length) {
    return '';
  }

  const names = userIds
    .map((userId) => {
      const profile = profiles[userId] || {};
      return (
        profile.full_name ||
        profile.username ||
        'Someone'
      );
    })
    .slice(0, 2);

  if (names.length === 1) {
    return `${names[0]} is typing…`;
  }

  if (userIds.length > 2) {
    return `${names.join(', ')} and others are typing…`;
  }

  return `${names[0]} and ${names[1]} are typing…`;
}