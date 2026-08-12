import { useCallback, useEffect, useState } from 'react';

import {
  getAudienceInsights,
  getContentPerformance,
  getCreatorDashboard,
  getCreatorProfile,
  getCreatorAnalytics,
  subscribeToCreatorStudio,
} from '../utils/creatorStudioEngine';
import {
  getActiveSubscriptions,
  getRevenueOverview,
  getPayoutHistory,
  getSubscriptionTiers,
  subscribeToMonetization,
} from '../utils/monetizationEngine';

export default function useCreatorStudio() {
  const [dashboard, setDashboard] =
    useState(null);
  const [analytics, setAnalytics] =
    useState(null);
  const [tiers, setTiers] = useState([]);
  const [subscriptions, setSubscriptions] =
    useState([]);
  const [revenue, setRevenue] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        creatorDashboard,
        creatorAnalytics,
        subscriptionTiers,
        activeSubscriptions,
        revenueOverview,
        payoutHistory,
      ] = await Promise.all([
        getCreatorDashboard(),
        getCreatorAnalytics(),
        getSubscriptionTiers(),
        getActiveSubscriptions(),
        getRevenueOverview(),
        getPayoutHistory(),
      ]);

      setDashboard(creatorDashboard);
      setAnalytics(creatorAnalytics);
      setTiers(subscriptionTiers || []);
      setSubscriptions(activeSubscriptions || []);
      setRevenue(revenueOverview);
      setPayouts(payoutHistory || []);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load Creator Studio.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeCreator =
      subscribeToCreatorStudio(refresh);
    const unsubscribeMonetization =
      subscribeToMonetization(refresh);

    return () => {
      unsubscribeCreator();
      unsubscribeMonetization();
    };
  }, [refresh]);

  return {
    dashboard,
    analytics,
    tiers,
    subscriptions,
    revenue,
    payouts,
    loading,
    error,
    refresh,
  };
}