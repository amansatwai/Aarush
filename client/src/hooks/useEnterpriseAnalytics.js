import { useCallback, useEffect, useState } from 'react';

import {
  generateExecutiveSummary,
  generateOperationalDashboard,
  generateUsageDashboard,
  getAnalyticsStatus,
  subscribeToEnterpriseAnalytics,
} from '../utils/enterpriseAnalyticsEngine';
import {
  getComplianceStatus,
  subscribeToComplianceEvents,
} from '../utils/complianceEngine';

export default function useEnterpriseAnalytics() {
  const [status, setStatus] = useState(null);
  const [operational, setOperational] =
    useState(null);
  const [usage, setUsage] = useState(null);
  const [compliance, setCompliance] =
    useState(null);
  const [executive, setExecutive] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        analyticsStatus,
        operationalDashboard,
        usageDashboard,
        complianceStatus,
        executiveSummary,
      ] = await Promise.all([
        getAnalyticsStatus(),
        generateOperationalDashboard(),
        generateUsageDashboard(),
        getComplianceStatus(),
        generateExecutiveSummary(),
      ]);

      setStatus(analyticsStatus);
      setOperational(operationalDashboard);
      setUsage(usageDashboard);
      setCompliance(complianceStatus);
      setExecutive(executiveSummary);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load enterprise analytics.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeAnalytics =
      subscribeToEnterpriseAnalytics(refresh);
    const unsubscribeCompliance =
      subscribeToComplianceEvents(refresh);

    return () => {
      unsubscribeAnalytics();
      unsubscribeCompliance();
    };
  }, [refresh]);

  return {
    status,
    operational,
    usage,
    compliance,
    executive,
    loading,
    error,
    refresh,
  };
}