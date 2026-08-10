import { useCallback, useEffect, useState } from 'react';

import {
  getGuardianStatus,
  initializeAIGuardian,
} from '../utils/aiGuardianEngine';
import {
  getPredictionStatus,
} from '../utils/threatPredictionEngine';

export default function useAIGuardian() {
  const [guardian, setGuardian] =
    useState(null);
  const [prediction, setPrediction] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        initialized,
        status,
        forecast,
      ] = await Promise.all([
        initializeAIGuardian(),
        getGuardianStatus(),
        getPredictionStatus(),
      ]);

      setGuardian({
        ...initialized,
        ...status,
      });
      setPrediction(forecast);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load AI Guardian.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    guardian,
    prediction,
    loading,
    error,
    refresh,
  };
}