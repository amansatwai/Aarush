import { useCallback, useEffect, useState } from 'react';

import {
  getSyncStatus,
  initializeCloudSync,
  subscribeToSyncEvents,
  syncNow,
} from '../utils/cloudSyncEngine';
import {
  getOfflineQueue,
  isOffline,
} from '../utils/offlineEngine';

export default function useCloudSync() {
  const [status, setStatus] = useState(
    getSyncStatus()
  );
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      await initializeCloudSync();

      const [nextStatus, nextQueue] =
        await Promise.all([
          Promise.resolve(getSyncStatus()),
          getOfflineQueue(),
        ]);

      setStatus(nextStatus);
      setQueue(nextQueue || []);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load cloud sync status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const sync = useCallback(async () => {
    try {
      setError('');
      setStatus((current) => ({
        ...current,
        status: 'syncing',
      }));

      await syncNow();
      await refresh();
    } catch (syncError) {
      setError(
        syncError?.message ||
          'Cloud synchronization failed.'
      );
      await refresh();
    }
  }, [refresh]);

  useEffect(() => {
    refresh();

    const unsubscribe =
      subscribeToSyncEvents(() => {
        refresh();
      });

    return unsubscribe;
  }, [refresh]);

  return {
    ...status,
    queue,
    offline: isOffline(),
    loading,
    error,
    refresh,
    sync,
  };
}