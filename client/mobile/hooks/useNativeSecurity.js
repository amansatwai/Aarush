import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  authenticateBiometric,
  authenticateForBackupRestore,
  authenticateForPrivacyCenter,
  authenticateForSecurityCenter,
  authenticateForSensitiveAction,
  getBiometricStatus,
  initializeNativeBiometrics,
} from '../utils/nativeBiometricEngine';
import {
  clearSecureStorage,
  getSecureValue,
  getSecureStorageStatus,
  initializeSecureStorage,
  removeSecureValue,
  setSecureValue,
} from '../utils/secureStorageEngine';

export default function useNativeSecurity() {
  const [biometric, setBiometric] =
    useState(null);
  const [storage, setStorage] =
    useState(null);
  const [authenticated, setAuthenticated] =
    useState(false);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refreshNativeSecurity = useCallback(
    async () => {
      try {
        setError('');

        const [
          biometricStatus,
          storageStatus,
        ] = await Promise.all([
          initializeNativeBiometrics(),
          initializeSecureStorage(),
        ]);

        setBiometric({
          ...biometricStatus,
          ...getBiometricStatus(),
        });

        setStorage({
          ...storageStatus,
          ...getSecureStorageStatus(),
        });
      } catch (refreshError) {
        setError(
          refreshError?.message ||
            'Unable to load native security.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const authenticate = useCallback(
    async (reason) => {
      const result =
        await authenticateBiometric(reason);

      setAuthenticated(
        Boolean(result.authenticated)
      );

      return result;
    },
    []
  );

  const authenticateSensitive = useCallback(
    async (action) => {
      const result =
        await authenticateForSensitiveAction(
          action
        );

      setAuthenticated(
        Boolean(result.authenticated)
      );

      return result;
    },
    []
  );

  const authenticatePayments = useCallback(
    async () => {
      return authenticateSensitive(
        'approving a payment'
      );
    },
    [authenticateSensitive]
  );

  const authenticateUnlock = useCallback(
    async () => {
      return authenticate(
        'Unlock Aarush'
      );
    },
    [authenticate]
  );

  const saveSecure = useCallback(
    async (key, value, options) => {
      return setSecureValue(
        key,
        value,
        options
      );
    },
    []
  );

  const readSecure = useCallback(
    async (key) => getSecureValue(key),
    []
  );

  const removeSecure = useCallback(
    async (key) => removeSecureValue(key),
    []
  );

  const computed = useMemo(
    () => ({
      biometricAvailable: Boolean(
        biometric?.available
      ),
      biometricType:
        biometric?.type ||
        'Device PIN fallback',
      authenticated,
      secureStorageReady: Boolean(
        storage?.ready
      ),
    }),
    [authenticated, biometric, storage]
  );

  useEffect(() => {
    refreshNativeSecurity();
  }, [refreshNativeSecurity]);

  return {
    ...computed,
    biometric,
    storage,
    loading,
    error,
    authenticate,
    authenticateSensitive,
    authenticatePayments,
    authenticateUnlock,
    authenticateForSecurityCenter,
    authenticateForPrivacyCenter,
    authenticateForBackupRestore,
    saveSecure,
    readSecure,
    removeSecure,
    clearSecureStorage,
    refreshNativeSecurity,
  };
}