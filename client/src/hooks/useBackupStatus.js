import { useCallback, useEffect, useState } from 'react';

import {
  getBackupHistory,
  getBackupStatus,
  initializeBackup,
} from '../utils/backupEngine';

export default function useBackupStatus() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        initialized,
        nextStatus,
        nextHistory,
      ] = await Promise.all([
        initializeBackup(),
        getBackupStatus(),
        getBackupHistory({
          page: 0,
          pageSize: 30,
        }),
      ]);

      setStatus({
        ...initialized,
        ...nextStatus,
      });
      setHistory(nextHistory || []);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load backup status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    status,
    history,
    loading,
    error,
    refresh,
  };
}