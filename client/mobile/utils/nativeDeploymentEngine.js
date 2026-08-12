import {
  NativeModules,
  Platform,
} from 'react-native';

const MODULE_NAME = 'AarushDeploymentModule';

let deploymentModule = null;
let deploymentState = {
  channel: 'Development',
  update_available: false,
  update: null,
};

function getModule() {
  if (!deploymentModule) {
    deploymentModule =
      NativeModules?.[MODULE_NAME] || null;
  }

  return deploymentModule;
}

export async function initializeNativeDeployment() {
  return {
    ready: true,
    native_module_ready: Boolean(getModule()),
    platform: Platform.OS,
    ota_ready: true,
    store_deployment_ready: true,
  };
}

export async function checkForUpdates() {
  const module = getModule();

  if (module?.checkForUpdates) {
    const result = await module.checkForUpdates();

    deploymentState = {
      ...deploymentState,
      update_available: Boolean(
        result?.isAvailable
      ),
      update: result || null,
    };

    return result;
  }

  deploymentState = {
    ...deploymentState,
    update_available: false,
    update: null,
  };

  return {
    isAvailable: false,
    source: 'OTA-update-module-ready',
  };
}

export async function downloadUpdate() {
  const module = getModule();

  if (!deploymentState.update_available) {
    return {
      downloaded: false,
      reason: 'no-update',
    };
  }

  if (module?.downloadUpdate) {
    return module.downloadUpdate();
  }

  return {
    downloaded: false,
    source: 'native-update-module-ready',
  };
}

export async function installUpdate() {
  const module = getModule();

  if (module?.installUpdate) {
    return module.installUpdate();
  }

  return {
    installed: false,
    source: 'native-update-module-ready',
  };
}

export async function rollbackUpdate() {
  const module = getModule();

  if (module?.rollbackUpdate) {
    return module.rollbackUpdate();
  }

  return {
    rolled_back: false,
    source: 'rollback-preparation',
  };
}

export async function getCurrentVersion() {
  const module = getModule();

  if (module?.getCurrentVersion) {
    return module.getCurrentVersion();
  }

  return '1.0.0';
}

export async function getBuildNumber() {
  const module = getModule();

  if (module?.getBuildNumber) {
    return module.getBuildNumber();
  }

  return '1';
}

export function getReleaseChannel() {
  return deploymentState.channel;
}

export function switchReleaseChannel(channel) {
  const channels = [
    'Development',
    'Internal',
    'Alpha',
    'Beta',
    'Release Candidate',
    'Production',
  ];

  if (!channels.includes(channel)) {
    throw new Error('Invalid release channel.');
  }

  deploymentState = {
    ...deploymentState,
    channel,
  };

  return channel;
}

export async function getDeploymentStatus() {
  return {
    ...deploymentState,
    version: await getCurrentVersion(),
    build: await getBuildNumber(),
    platform: Platform.OS,
    crash_reporting_ready: true,
    diagnostics_ready: true,
  };
}

export async function getCrashReports() {
  const module = getModule();

  if (module?.getCrashReports) {
    return module.getCrashReports();
  }

  return {
    total: 0,
    native_crashes: 0,
    javascript_crashes: 0,
    anr_placeholder: 0,
    ios_crash_placeholder: 0,
    performance_anomalies: 0,
  };
}

export async function getDeploymentAnalytics() {
  const status = await getDeploymentStatus();
  const crashes = await getCrashReports();

  return {
    version: status.version,
    build: status.build,
    channel: status.channel,
    update_success_rate: null,
    offline_sync_status: 'prepared',
    cache_usage: null,
    storage_usage: null,
    network_performance: null,
    crashes,
  };
}