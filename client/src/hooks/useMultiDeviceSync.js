import { useCallback, useEffect, useState } from 'react';

import {
  getConnectedDevices,
  initializeMultiDevice,
  subscribeToDeviceSync,
  syncAllDevices,
} from '../utils/multiDeviceEngine';
import {
  getConflictHistory,
} from '../utils/conflictResolutionEngine';

export default function useMultiDeviceSync() {
  const [devices, setDevices] = useState([]);
  const [conflicts, setConflicts] =
    useState([]);
  const [status, setStatus] =
    useState('pending');
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        initialized,
        connectedDevices,
        conflictHistory,
      ] = await Promise.all([
        initializeMultiDevice(),
        getConnectedDevices(),
        getConflictHistory({
          page: 0,
          pageSize: 30,
        }),
      ]);

      setDevices(connectedDevices || []);
      setConflicts(conflictHistory || []);
      setStatus(
        initialized?.status || 'connected'
      );
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load device sync status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const syncAll = useCallback(async () => {
    setStatus('syncing');

    try {
      const result = await syncAllDevices();
      setStatus('synced');
      await refresh();
      return result;
    } catch (syncError) {
      setStatus('failed');
      setError(
        syncError?.message ||
          'Device synchronization failed.'
      );
      throw syncError;
    }
  }, [refresh]);

  useEffect(() => {
    refresh();

    const unsubscribe =
      subscribeToDeviceSync(() => {
        refresh();
      });

    return unsubscribe;
  }, [refresh]);

  return {
    devices,
    conflicts,
    status,
    loading,
    error,
    refresh,
    syncAll,
  };
}