import { useCallback, useEffect, useState } from 'react';

import {
  initializeSecurity,
  subscribeToSecurityChanges,
} from '../utils/securityEngine';
import {
  subscribeToDeviceChanges,
} from '../utils/deviceTrustEngine';

export default function useSecurityStatus() {
  const [security, setSecurity] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');
      const result = await initializeSecurity();
      setSecurity(result);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load security status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeSecurity =
      subscribeToSecurityChanges(refresh);

    const unsubscribeDevices =
      subscribeToDeviceChanges(refresh);

    return () => {
      unsubscribeSecurity();
      unsubscribeDevices();
    };
  }, [refresh]);

  return {
    security,
    loading,
    error,
    refresh,
  };
}