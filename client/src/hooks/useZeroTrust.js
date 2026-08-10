import { useCallback, useEffect, useState } from 'react';

import {
  initializeZeroTrust,
  verifyIdentity,
  verifyDevice,
  verifySession,
  subscribeToZeroTrustChanges,
} from '../utils/zeroTrustEngine';
import {
  getRecoveryDevices,
} from '../utils/recoveryEngine';

export default function useZeroTrust() {
  const [trust, setTrust] = useState(null);
  const [recoveryDevices, setRecoveryDevices] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [trustResult, devices] =
        await Promise.all([
          initializeZeroTrust(),
          getRecoveryDevices(),
        ]);

      setTrust(trustResult);
      setRecoveryDevices(devices || []);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load zero-trust status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const verify = useCallback(async () => {
    const [identity, device, session] =
      await Promise.all([
        verifyIdentity(),
        verifyDevice(),
        verifySession(),
      ]);

    await refresh();

    return {
      identity,
      device,
      session,
    };
  }, [refresh]);

  useEffect(() => {
    refresh();

    const unsubscribe =
      subscribeToZeroTrustChanges(refresh);

    return unsubscribe;
  }, [refresh]);

  return {
    trust,
    recoveryDevices,
    loading,
    error,
    verify,
    refresh,
  };
}