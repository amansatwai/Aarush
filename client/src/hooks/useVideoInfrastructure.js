import { useCallback, useEffect, useState } from 'react';

import {
  getMediaProcessingStatus,
  initializeMediaProcessing,
} from '../utils/mediaProcessingEngine';
import {
  getStreamingStatus,
  initializeVideoInfrastructure,
  subscribeToStreamingEvents,
} from '../utils/videoInfrastructureEngine';

export default function useVideoInfrastructure() {
  const [streaming, setStreaming] =
    useState(null);
  const [processing, setProcessing] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        infrastructure,
        media,
      ] = await Promise.all([
        initializeVideoInfrastructure(),
        Promise.resolve(
          initializeMediaProcessing()
        ),
      ]);

      setStreaming({
        ...infrastructure,
        ...getStreamingStatus(),
      });
      setProcessing({
        ...media,
        ...getMediaProcessingStatus(),
      });
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load video infrastructure.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribe =
      subscribeToStreamingEvents(refresh);

    return unsubscribe;
  }, [refresh]);

  return {
    streaming,
    processing,
    loading,
    error,
    refresh,
  };
}