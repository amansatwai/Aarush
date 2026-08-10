import { useCallback, useEffect, useState } from 'react';

import {
  initializeThreatDetection,
  subscribeToThreatEvents,
} from '../utils/threatDetectionEngine';
import {
  getActiveAlerts,
  startSecurityMonitoring,
  subscribeToSecurityAlerts,
} from '../utils/securityMonitoringEngine';

export default function useThreatDetection() {
  const [threat, setThreat] = useState({
    score: 0,
    severity: 'Low',
    threats: [],
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [threatResult, alertResult] =
        await Promise.all([
          initializeThreatDetection(),
          getActiveAlerts(),
        ]);

      setThreat(threatResult);
      setAlerts(alertResult || []);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load threat intelligence.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const stopMonitoringPromise =
      startSecurityMonitoring({
        interval: 60000,
        callback: refresh,
      });

    const unsubscribeThreats =
      subscribeToThreatEvents(refresh);

    const unsubscribeAlerts =
      subscribeToSecurityAlerts(refresh);

    return () => {
      stopMonitoringPromise.then((stop) => stop?.());
      unsubscribeThreats();
      unsubscribeAlerts();
    };
  }, [refresh]);

  return {
    threat,
    alerts,
    loading,
    error,
    refresh,
  };
}