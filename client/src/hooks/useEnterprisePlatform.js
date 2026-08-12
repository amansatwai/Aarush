import { useCallback, useEffect, useState } from 'react';

import {
  getSDKPlatformStatus,
  subscribeToSDKPlatformEvents,
} from '../utils/sdkPlatformEngine';
import {
  getPluginStatus,
  subscribeToPluginEvents,
} from '../utils/pluginEcosystemEngine';

export default function useEnterprisePlatform() {
  const [sdk, setSDK] = useState(null);
  const [plugins, setPlugins] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        sdkStatus,
        pluginStatus,
      ] = await Promise.all([
        getSDKPlatformStatus(),
        getPluginStatus(),
      ]);

      setSDK(sdkStatus);
      setPlugins(pluginStatus);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load enterprise platform.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeSDK =
      subscribeToSDKPlatformEvents(refresh);
    const unsubscribePlugins =
      subscribeToPluginEvents(refresh);

    return () => {
      unsubscribeSDK();
      unsubscribePlugins();
    };
  }, [refresh]);

  return {
    sdk,
    plugins,
    loading,
    error,
    refresh,
  };
}