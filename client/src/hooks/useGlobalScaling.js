import { useCallback, useEffect, useState } from 'react';

import {
  getScalingStatus,
  getRegions,
  subscribeToScalingEvents,
} from '../utils/globalScalingEngine';
import {
  getAutomationAnalytics,
  getAutomationStatus,
  subscribeToAutomationEvents,
} from '../utils/enterpriseAutomationEngine';

export default function useGlobalScaling() {
  const [scaling, setScaling] = useState(null);
  const [regions, setRegions] = useState([]);
  const [automation, setAutomation] =
    useState(null);
  const [automationAnalytics, setAutomationAnalytics] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        scalingStatus,
        regionList,
        automationStatus,
        analytics,
      ] = await Promise.all([
        getScalingStatus(),
        getRegions(),
        getAutomationStatus(),
        getAutomationAnalytics(),
      ]);

      setScaling(scalingStatus);
      setRegions(regionList || []);
      setAutomation(automationStatus);
      setAutomationAnalytics(analytics);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load global scaling status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeScaling =
      subscribeToScalingEvents(refresh);
    const unsubscribeAutomation =
      subscribeToAutomationEvents(refresh);

    return () => {
      unsubscribeScaling();
      unsubscribeAutomation();
    };
  }, [refresh]);

  return {
    scaling,
    regions,
    automation,
    automationAnalytics,
    loading,
    error,
    refresh,
  };
}