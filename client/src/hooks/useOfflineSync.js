import { useCallback, useEffect, useState } from 'react';

import {
  initializeOfflineQueue,
  getQueueStatus,
  getQueueHistory,
  processQueue,
  pauseQueue,
  resumeQueue,
  clearQueue,
  retryFailedActions,
} from '../utils/offlineQueueEngine';
import {
  initializeBackgroundSync,
  startBackgroundSync,
  stopBackgroundSync,
  subscribeToBackgroundSync,
  syncWhenOnline,
} from '../utils/backgroundSyncEngine';

export default function useOfflineSync() {
  const [queue, setQueue] = useState({});
  const [history, setHistory] = useState([]);
  const [background, setBackground] =
    useState({});
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        queueStatus,
        queueHistory,
        backgroundStatus,
      ] = await Promise.all([
        getQueueStatus(),
        getQueueHistory(),
        Promise.resolve(
          initializeBackgroundSync()
        ),
      ]);

      setQueue(queueStatus);
      setHistory(queueHistory);
      setBackground(backgroundStatus);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load offline sync status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const syncNow = useCallback(async () => {
    try {
      setError('');
      await syncWhenOnline();
      await refresh();
    } catch (syncError) {
      setError(
        syncError?.message ||
          'Offline synchronization failed.'
      );
    }
  }, [refresh]);

  const retryFailed = useCallback(async () => {
    await retryFailedActions();
    await refresh();
  }, [refresh]);

  const pause = useCallback(async () => {
    pauseQueue();
    await refresh();
  }, [refresh]);

  const resume = useCallback(async () => {
    resumeQueue();
    await refresh();
  }, [refresh]);

  const clearCompleted = useCallback(async () => {
    await clearQueue({
      completedOnly: true,
    });
    await refresh();
  }, [refresh]);

  const clearFailed = useCallback(async () => {
    await clearQueue({
      failedOnly: true,
    });
    await refresh();
  }, [refresh]);

  useEffect(() => {
    initializeOfflineQueue()
      .then(() =>
        startBackgroundSync({
          interval: 30000,
        })
      )
      .then(refresh)
      .catch((loadError) => {
        setError(
          loadError?.message ||
            'Unable to initialize offline sync.'
        );
        setLoading(false);
      });

    const unsubscribe =
      subscribeToBackgroundSync((next) => {
        setBackground(next);
        refresh();
      });

    return () => {
      unsubscribe();
      stopBackgroundSync();
    };
  }, [refresh]);

  return {
    queue,
    history,
    background,
    loading,
    error,
    refresh,
    syncNow,
    retryFailed,
    pause,
    resume,
    clearCompleted,
    clearFailed,
  };
}