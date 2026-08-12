import { useCallback, useEffect, useState } from 'react';

import {
  getGlobalPlatformStatus,
  initializeGlobalMediaPlatform,
  subscribeToGlobalMediaEvents,
} from '../utils/globalMediaPlatformEngine';
import {
  getCDNAnalytics,
  getOrchestrationStatus,
  subscribeToCDNOrchestration,
} from '../utils/cdnOrchestrationEngine';

export default function useGlobalMediaPlatform() {
  const [platform, setPlatform] =
    useState(null);
  const [cdn, setCDN] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        initialized,
        status,
        analytics,
      ] = await Promise.all([
        initializeGlobalMediaPlatform(),
        getGlobalPlatformStatus(),
        getCDNAnalytics(),
      ]);

      setPlatform({
        ...initialized,
        ...status,
      });
      setCDN({
        ...getOrchestrationStatus(),
        analytics,
      });
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load global media platform.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeGlobal =
      subscribeToGlobalMediaEvents(refresh);
    const unsubscribeCDN =
      subscribeToCDNOrchestration(refresh);

    return () => {
      unsubscribeGlobal();
      unsubscribeCDN();
    };
  }, [refresh]);

  return {
    platform,
    cdn,
    loading,
    error,
    refresh,
  };
}