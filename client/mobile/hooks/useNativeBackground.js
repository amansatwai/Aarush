import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getBackgroundStatus,
  initializeNativeBackground,
  runBackgroundSync,
  runOfflineQueue,
  startBackgroundService,
  stopBackgroundService,
} from '../utils/nativeBackgroundEngine';
import {
  getNotificationStatus,
  initializeNativeNotifications,
  requestNotificationPermission,
  showNotification,
} from '../utils/nativeNotificationEngine';

export default function useNativeBackground() {
  const [background, setBackground] =
    useState(null);
  const [notifications, setNotifications] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refreshBackgroundState =
    useCallback(async () => {
      try {
        setError('');

        const [
          backgroundStatus,
          notificationStatus,
        ] = await Promise.all([
          initializeNativeBackground(),
          initializeNativeNotifications(),
        ]);

        setBackground({
          ...backgroundStatus,
          ...getBackgroundStatus(),
        });

        setNotifications({
          ...notificationStatus,
          ...getNotificationStatus(),
        });
      } catch (refreshError) {
        setError(
          refreshError?.message ||
            'Unable to load background status.'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  const startBackground = useCallback(
    async () => {
      const result =
        await startBackgroundService();

      setBackground(getBackgroundStatus());
      return result;
    },
    []
  );

  const stopBackground = useCallback(
    async () => {
      const result =
        await stopBackgroundService();

      setBackground(getBackgroundStatus());
      return result;
    },
    []
  );

  const scheduleTask = useCallback(
    async (task) => {
      return task;
    },
    []
  );

  const runSync = useCallback(async () => {
    const result = await runBackgroundSync(
      async () => runOfflineQueue()
    );

    setBackground(getBackgroundStatus());
    return result;
  }, []);

  const requestPermissions = useCallback(
    async () => {
      const permission =
        await requestNotificationPermission();

      setNotifications({
        ...getNotificationStatus(),
        permission,
      });

      return permission;
    },
    []
  );

  const notify = useCallback(
    async (payload) => {
      return showNotification(payload);
    },
    []
  );

  useEffect(() => {
    refreshBackgroundState();
  }, [refreshBackgroundState]);

  const computed = useMemo(
    () => ({
      backgroundReady: Boolean(
        background?.ready
      ),
      notificationsReady: Boolean(
        notifications?.ready
      ),
      pushToken: notifications?.push_token || null,
      permissionStatus:
        notifications?.permission || 'unknown',
      backgroundRunning: Boolean(
        background?.running
      ),
    }),
    [background, notifications]
  );

  return {
    ...computed,
    background,
    notifications,
    loading,
    error,
    startBackground,
    stopBackground,
    scheduleTask,
    runSync,
    showNotification: notify,
    requestPermissions,
    refreshBackgroundState,
  };
}