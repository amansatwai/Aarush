import { useCallback, useEffect, useState } from 'react';

import {
  exportMemory,
  getMemorySummary,
  initializePersonalMemory,
  resetPersonalMemory,
  importMemory,
} from '../utils/personalAIMemoryEngine';
import {
  generateUnifiedInsight,
  generateUnifiedRecommendation,
  getNetworkStatus,
  initializeIntelligenceNetwork,
} from '../utils/intelligenceNetworkEngine';

export default function usePersonalAI() {
  const [memory, setMemory] = useState(null);
  const [network, setNetwork] =
    useState(null);
  const [insight, setInsight] = useState(null);
  const [recommendations, setRecommendations] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        memoryProfile,
        networkStatus,
        unifiedInsight,
        unifiedRecommendations,
      ] = await Promise.all([
        initializePersonalMemory(),
        Promise.resolve(
          initializeIntelligenceNetwork()
        ),
        generateUnifiedInsight(),
        generateUnifiedRecommendation(),
      ]);

      setMemory(memoryProfile);
      setNetwork({
        ...networkStatus,
        ...getNetworkStatus(),
      });
      setInsight(unifiedInsight);
      setRecommendations(
        unifiedRecommendations.recommendations || []
      );
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load Personal AI.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeEverything = useCallback(
    async () => {
      await refresh();
      return generateUnifiedInsight();
    },
    [refresh]
  );

  const resetMemory = useCallback(() => {
    const next = resetPersonalMemory();
    setMemory(next);
    setInsight(null);
    setRecommendations([]);
  }, []);

  const exportPersonalMemory = useCallback(() => {
    return exportMemory();
  }, []);

  const importPersonalMemory = useCallback(
    (packageData) => {
      const next = importMemory(packageData);
      setMemory(next);
      return next;
    },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    memory,
    memorySummary: memory
      ? getMemorySummary()
      : null,
    network,
    insight,
    recommendations,
    loading,
    error,
    refresh,
    analyzeEverything,
    resetMemory,
    exportPersonalMemory,
    importPersonalMemory,
  };
}