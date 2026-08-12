import { useCallback, useEffect, useState } from 'react';

import {
  getActiveStreams,
  getStreamingHealth,
  getViewerCount,
  subscribeToLiveEvents,
} from '../utils/liveStreamingEngine';
import {
  getInteractionAnalytics,
  subscribeToViewerInteractions,
} from '../utils/viewerInteractionEngine';

export default function useLiveStreaming(
  streamId
) {
  const [streams, setStreams] = useState([]);
  const [viewerCount, setViewerCount] =
    useState(0);
  const [health, setHealth] = useState(null);
  const [analytics, setAnalytics] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const activeStreams = await getActiveStreams();
      setStreams(activeStreams || []);

      if (streamId) {
        const [
          count,
          streamHealth,
          interactionAnalytics,
        ] = await Promise.all([
          getViewerCount(streamId),
          getStreamingHealth(streamId),
          getInteractionAnalytics(streamId),
        ]);

        setViewerCount(count);
        setHealth(streamHealth);
        setAnalytics(interactionAnalytics);
      }
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load live streaming data.'
      );
    } finally {
      setLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    refresh();

    const unsubscribeLive =
      subscribeToLiveEvents(refresh);

    const unsubscribeInteractions = streamId
      ? subscribeToViewerInteractions(
          streamId,
          refresh
        )
      : () => {};

    return () => {
      unsubscribeLive();
      unsubscribeInteractions();
    };
  }, [refresh, streamId]);

  return {
    streams,
    viewerCount,
    health,
    analytics,
    loading,
    error,
    refresh,
  };
}