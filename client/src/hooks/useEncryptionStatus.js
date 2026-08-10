import { useCallback, useEffect, useState } from 'react';

import {
  initializeEncryption,
  rotateKeys as rotateEncryptionKeys,
  verifyEncryptionIntegrity,
  destroyEncryptionKeys,
} from '../utils/encryptionEngine';

export default function useEncryptionStatus() {
  const [status, setStatus] = useState({
    enabled: false,
    initialized: false,
    deviceVerified: false,
    keysAvailable: false,
    encryptionStrength: 'Disabled',
  });

  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const initialize = useCallback(async () => {
    try {
      setError('');
      setLoading(true);

      const result = await initializeEncryption();

      setStatus((current) => ({
        ...current,
        enabled: Boolean(result.enabled),
        initialized: Boolean(result.initialized),
        keysAvailable: Boolean(
          result.identityAvailable &&
            result.deviceAvailable
        ),
        encryptionStrength:
          result.strength ||
          (result.initialized
            ? 'End-to-End Ready'
            : 'Disabled'),
      }));

      return result;
    } catch (initializeError) {
      setError(
        initializeError?.message ||
          'Unable to initialize encryption.'
      );
      throw initializeError;
    } finally {
      setLoading(false);
    }
  }, []);

  const verify = useCallback(async () => {
    try {
      const result =
        await verifyEncryptionIntegrity();

      setStatus((current) => ({
        ...current,
        deviceVerified: Boolean(result.verified),
        initialized: Boolean(result.initialized),
        keysAvailable: Boolean(
          result.identityAvailable &&
            result.deviceAvailable
        ),
        encryptionStrength: result.verified
          ? 'Fully Verified'
          : current.encryptionStrength,
      }));

      return result;
    } catch (verifyError) {
      setError(
        verifyError?.message ||
          'Unable to verify encryption.'
      );
      throw verifyError;
    }
  }, []);

  const rotateKeys = useCallback(async () => {
    const result = await rotateEncryptionKeys();
    await initialize();
    await verify();
    return result;
  }, [initialize, verify]);

  const revokeKeys = useCallback(async () => {
    const result = await destroyEncryptionKeys();

    setStatus({
      enabled: false,
      initialized: false,
      deviceVerified: false,
      keysAvailable: false,
      encryptionStrength: 'Disabled',
    });

    return result;
  }, []);

  useEffect(() => {
    initialize()
      .then(() => verify())
      .catch(() => {});
  }, [initialize, verify]);

  return {
    ...status,
    loading,
    error,
    initialize,
    rotateKeys,
    revokeKeys,
    verify,
  };
}