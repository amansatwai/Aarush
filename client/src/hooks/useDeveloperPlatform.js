import { useCallback, useEffect, useState } from 'react';

import {
  getAPIPlatformStatus,
  subscribeToAPIPlatformEvents,
} from '../utils/apiPlatformEngine';
import {
  getApplications,
  getDeveloperAnalytics,
  getDeveloperProfile,
  initializeDeveloperPlatform,
  subscribeToDeveloperPlatform,
} from '../utils/developerPlatformEngine';

export default function useDeveloperPlatform() {
  const [platform, setPlatform] =
    useState(null);
  const [api, setAPI] = useState(null);
  const [profile, setProfile] =
    useState(null);
  const [applications, setApplications] =
    useState([]);
  const [analytics, setAnalytics] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        platformStatus,
        apiStatus,
        developerProfile,
        appList,
        developerAnalytics,
      ] = await Promise.all([
        initializeDeveloperPlatform(),
        getAPIPlatformStatus(),
        getDeveloperProfile(),
        getApplications(),
        getDeveloperAnalytics(),
      ]);

      setPlatform(platformStatus);
      setAPI(apiStatus);
      setProfile(developerProfile);
      setApplications(appList || []);
      setAnalytics(developerAnalytics);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load developer platform.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeAPI =
      subscribeToAPIPlatformEvents(refresh);
    const unsubscribeDeveloper =
      subscribeToDeveloperPlatform(refresh);

    return () => {
      unsubscribeAPI();
      unsubscribeDeveloper();
    };
  }, [refresh]);

  return {
    platform,
    api,
    profile,
    applications,
    analytics,
    loading,
    error,
    refresh,
  };
}