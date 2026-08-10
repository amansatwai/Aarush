import { useCallback, useEffect, useState } from 'react';

import {
  getRecoveryStatus,
  initializeDisasterRecovery,
} from '../utils/disasterRecoveryEngine';
import {
  initializeSelfHealing,
  verifyCloudIntegrity,
  verifyLocalIntegrity,
} from '../utils/selfHealingEngine';

export default function useReliabilityStatus() {
  const [reliability, setReliability] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        recovery,
        cloud,
        local,
        healing,
      ] = await Promise.all([
        initializeDisasterRecovery(),
        verifyCloudIntegrity(),
        verifyLocalIntegrity(),
        initializeSelfHealing(),
      ]);

      const healthy =
        Boolean(cloud.verified) &&
        Boolean(local.verified);

      setReliability({
        state: healthy ? 'Healthy' : 'Degraded',
        recovery,
        cloud,
        local,
        healing,
      });
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load reliability status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    reliability,
    loading,
    error,
    refresh,
  };
}