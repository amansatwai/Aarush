import { useCallback, useEffect, useState } from 'react';

import {
  initializeSessionSecurity,
  refreshSecureSession,
  revokeCurrentSession,
  revokeOtherSessions,
  verifySessionIntegrity,
  subscribeToSessionSecurity,
} from '../utils/sessionSecurityEngine';
import {
  generateSessionFingerprint,
} from '../utils/sessionFingerprintEngine';

export default function useSessionSecurity() {
  const [state, setState] = useState({
    status: 'loading',
    verified: false,
    trusted: false,
    suspicious: false,
    fingerprint: null,
  });

  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');

      const result =
        await initializeSessionSecurity();

      setState({
        status: result.status || 'untrusted',
        verified: Boolean(result.verified),
        trusted: Boolean(result.trusted),
        suspicious: Boolean(result.suspicious),
        fingerprint:
          result.fingerprint ||
          generateSessionFingerprint(),
      });
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load session security.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const verifySession = useCallback(async () => {
    const result =
      await verifySessionIntegrity();

    setState((current) => ({
      ...current,
      status: result.status,
      verified: Boolean(result.verified),
      trusted: Boolean(result.trusted),
      suspicious: Boolean(result.suspicious),
      fingerprint:
        result.fingerprint || current.fingerprint,
    }));

    return result;
  }, []);

  const refreshSession = useCallback(async () => {
    const result = await refreshSecureSession();
    await verifySession();
    return result;
  }, [verifySession]);

  const revokeSession = useCallback(async () => {
    const result = await revokeCurrentSession();

    setState((current) => ({
      ...current,
      status: 'revoked',
      verified: false,
      trusted: false,
    }));

    return result;
  }, []);

  const revokeOthers = useCallback(async () => {
    const result = await revokeOtherSessions();
    await verifySession();
    return result;
  }, [verifySession]);

  useEffect(() => {
    load();

    const unsubscribe =
      subscribeToSessionSecurity(load);

    return unsubscribe;
  }, [load]);

  return {
    ...state,
    loading,
    error,
    verifySession,
    refreshSession,
    revokeSession,
    revokeOtherSessions: revokeOthers,
  };
}