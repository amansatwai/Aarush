import { useCallback, useEffect, useState } from 'react';

import {
  getCacheStatus,
  getCDNStatus,
  getNetworkQuality,
  subscribeToCDNEvents,
} from '../utils/cdnOptimizationEngine';
import {
  getStreamingIntelligenceStatus,
  initializeAdaptiveStreaming,
} from '../utils/adaptiveStreamingIntelligenceEngine';

export default function useMediaPerformance() {
  const [cdn, setCDN] = useState(null);
  const [streaming, setStreaming] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        cdnStatus,
        adaptiveStatus,
      ] = await Promise.all([
        Promise.resolve(getCDNStatus()),
        Promise.resolve(
          initializeAdaptiveStreaming()
        ),
      ]);

      setCDN({
        ...cdnStatus,
        network: getNetworkQuality(),
        cache: getCacheStatus(),
      });

      setStreaming({
        ...adaptiveStatus,
        ...getStreamingIntelligenceStatus(),
      });
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load media performance.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribe =
      subscribeToCDNEvents(refresh);

    return unsubscribe;
  }, [refresh]);

  return {
    cdn,
    streaming,
    loading,
    error,
    refresh,
  };
}