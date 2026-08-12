import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getPerformanceStatus,
  initializeNativePerformance,
  optimizeCache as optimizeNativeCache,
  optimizeMemory as optimizeNativeMemory,
  optimizeStartup as optimizeNativeStartup,
} from '../utils/nativePerformanceEngine';
import {
  checkForUpdates,
  downloadUpdate as downloadNativeUpdate,
  getCurrentVersion,
  getDeploymentStatus,
  initializeNativeDeployment,
  installUpdate as installNativeUpdate,
} from '../utils/nativeDeploymentEngine';

export default function useNativePerformance() {
  const [performance, setPerformance] =
    useState(null);
  const [deployment, setDeployment] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refreshPerformance = useCallback(
    async () => {
      try {
        setError('');

        const [
          performanceInit,
          performanceStatus,
          deploymentInit,
          deploymentStatus,
          currentVersion,
        ] = await Promise.all([
          initializeNativePerformance(),
          getPerformanceStatus(),
          initializeNativeDeployment(),
          getDeploymentStatus(),
          getCurrentVersion(),
        ]);

        setPerformance({
          ...performanceInit,
          ...performanceStatus,
        });

        setDeployment({
          ...deploymentInit,
          ...deploymentStatus,
          current_version: currentVersion,
        });
      } catch (refreshError) {
        setError(
          refreshError?.message ||
            'Unable to load native performance.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const optimizeMemory = useCallback(
    async () => {
      const result = await optimizeNativeMemory();
      await refreshPerformance();
      return result;
    },
    [refreshPerformance]
  );

  const optimizeCache = useCallback(
    async () => {
      const result = await optimizeNativeCache();
      await refreshPerformance();
      return result;
    },
    [refreshPerformance]
  );

  const optimizeStartup = useCallback(
    async () => {
      const result = await optimizeNativeStartup();
      await refreshPerformance();
      return result;
    },
    [refreshPerformance]
  );

  const checkUpdates = useCallback(
    async () => {
      const result = await checkForUpdates();
      await refreshPerformance();
      return result;
    },
    [refreshPerformance]
  );

  const downloadUpdate = useCallback(
    async () => {
      return downloadNativeUpdate();
    },
    []
  );

  const installUpdate = useCallback(
    async () => {
      return installNativeUpdate();
    },
    []
  );

  useEffect(() => {
    refreshPerformance();
  }, [refreshPerformance]);

  const computed = useMemo(
    () => ({
      performanceReady: Boolean(
        performance?.ready
      ),
      deploymentReady: Boolean(
        deployment?.ready
      ),
      performanceMetrics:
        performance?.metrics || null,
      currentVersion:
        deployment?.current_version || '1.0.0',
      updateAvailable: Boolean(
        deployment?.update_available
      ),
    }),
    [deployment, performance]
  );

  return {
    ...computed,
    performance,
    deployment,
    loading,
    error,
    optimizeMemory,
    optimizeCache,
    optimizeStartup,
    checkForUpdates: checkUpdates,
    downloadUpdate,
    installUpdate,
    refreshPerformance,
  };
}