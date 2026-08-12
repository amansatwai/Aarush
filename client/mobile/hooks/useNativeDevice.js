import { useCallback, useEffect, useState } from 'react';

import {
  getNativeStatus,
  getDeviceInfo,
} from '../utils/nativeDeviceEngine';
import {
  getBridgeHealth,
  getBridgeStatus,
} from '../utils/nativeBridgeEngine';

export default function useNativeDevice() {
  const [device, setDevice] = useState(null);
  const [bridge, setBridge] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        deviceStatus,
        deviceInfo,
        bridgeHealth,
        bridgeStatus,
      ] = await Promise.all([
        getNativeStatus(),
        getDeviceInfo(),
        getBridgeHealth(),
        getBridgeStatus(),
      ]);

      setDevice({
        ...deviceStatus,
        info: deviceInfo,
      });

      setBridge({
        ...bridgeHealth,
        ...bridgeStatus,
      });
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load native device information.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    device,
    bridge,
    loading,
    error,
    refresh,
  };
}