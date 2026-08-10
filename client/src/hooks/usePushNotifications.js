import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getNotificationPermission,
  initializePushNotifications,
  registerDevice,
  requestNotificationPermission,
  showLocalNotification,
  unregisterDevice,
} from '../utils/pushNotificationEngine';

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
    ) !== null
  );
}

export default function usePushNotifications() {
  const supported = useMemo(
    () =>
      typeof window !== 'undefined' &&
      'Notification' in window,
    []
  );

  const guest = useMemo(
    () => isGuestMode(),
    []
  );

  const [permission, setPermission] = useState(
    supported ? getNotificationPermission() : 'unsupported'
  );
  const [requesting, setRequesting] =
    useState(false);
  const [enabled, setEnabled] = useState(
    !guest &&
      supported &&
      getNotificationPermission() === 'granted'
  );

  useEffect(() => {
    if (!supported || guest) {
      setPermission(
        supported ? getNotificationPermission() : 'unsupported'
      );
      setEnabled(false);
      return;
    }

    let active = true;

    initializePushNotifications()
      .then((result) => {
        if (!active) {
          return;
        }

        setPermission(result.permission);
        setEnabled(result.permission === 'granted');
      })
      .catch(() => {
        if (active) {
          setEnabled(false);
        }
      });

    return () => {
      active = false;
    };
  }, [guest, supported]);

  const requestPermission = useCallback(async () => {
    if (guest) {
      return 'guest';
    }

    if (!supported) {
      setPermission('unsupported');
      return 'unsupported';
    }

    setRequesting(true);

    try {
      const nextPermission =
        await requestNotificationPermission();

      setPermission(nextPermission);
      setEnabled(nextPermission === 'granted');

      return nextPermission;
    } finally {
      setRequesting(false);
    }
  }, [guest, supported]);

  const enableNotifications = useCallback(async () => {
    if (guest) {
      throw new Error(
        'Sign in to enable notifications.'
      );
    }

    const nextPermission =
      permission === 'granted'
        ? 'granted'
        : await requestPermission();

    if (nextPermission !== 'granted') {
      setEnabled(false);
      return false;
    }

    await registerDevice();
    setEnabled(true);
    return true;
  }, [guest, permission, requestPermission]);

  const disableNotifications = useCallback(async () => {
    if (guest) {
      setEnabled(false);
      return;
    }

    try {
      await unregisterDevice();
    } finally {
      setEnabled(false);
    }
  }, [guest]);

  const sendTestNotification = useCallback(async () => {
    if (guest) {
      throw new Error(
        'Sign in to receive notifications.'
      );
    }

    if (permission !== 'granted') {
      throw new Error(
        'Enable notifications before sending a test.'
      );
    }

    return showLocalNotification('Aarush test notification', {
      body: 'Browser notifications are working.',
      tag: 'aarush-test-notification',
      data: {
        type: 'system',
        source: 'test',
      },
    });
  }, [guest, permission]);

  return {
    permission: guest ? 'guest' : permission,
    supported: guest ? false : supported,
    enabled: guest ? false : enabled,
    requesting,
    requestPermission,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
  };
}