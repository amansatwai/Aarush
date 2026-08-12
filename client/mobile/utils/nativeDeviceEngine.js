import {
  AppState,
  Dimensions,
  Platform,
} from 'react-native';

let cachedDevice = null;
let cachedAt = 0;
const CACHE_TTL = 30000;

function safeValue(value, fallback = null) {
  return value === undefined || value === null
    ? fallback
    : value;
}

export async function initializeNativeDevice() {
  const info = await getDeviceInfo();

  return {
    ready: true,
    platform: getPlatform(),
    device: info,
  };
}

export async function getDeviceModel() {
  return (
    Platform.constants?.Model ||
    Platform.constants?.model ||
    'Unknown device'
  );
}

export function getPlatform() {
  return Platform.OS || 'unknown';
}

export function getOSVersion() {
  return (
    Platform.Version?.toString() ||
    'Unknown'
  );
}

export function getAppVersion() {
  return {
    version: '1.0.0',
    build: '1',
    source: 'native-foundation',
  };
}

export async function getBatteryLevel() {
  return {
    level: null,
    charging: null,
    source: 'expo-battery-ready',
  };
}

export async function getNetworkState() {
  return {
    connected: null,
    type: 'unknown',
    effective_type: 'unknown',
    source: 'expo-network-ready',
  };
}

export async function getStorageInfo() {
  return {
    total: null,
    free: null,
    used: null,
    source: 'expo-file-system-ready',
  };
}

export async function getMemoryInfo() {
  return {
    total: null,
    available: null,
    used: null,
    source: 'native-memory-module-ready',
  };
}

export async function getPerformanceInfo() {
  return {
    startup_time: null,
    cpu_usage: null,
    frame_rate: null,
    thermal_state: 'unknown',
    background_state: AppState.currentState,
    screen: Dimensions.get('window'),
  };
}

export async function getDeviceInfo() {
  if (
    cachedDevice &&
    Date.now() - cachedAt < CACHE_TTL
  ) {
    return cachedDevice;
  }

  const [
    battery,
    network,
    storage,
    memory,
    performance,
  ] = await Promise.all([
    getBatteryLevel(),
    getNetworkState(),
    getStorageInfo(),
    getMemoryInfo(),
    getPerformanceInfo(),
  ]);

  cachedDevice = {
    model: await getDeviceModel(),
    platform: getPlatform(),
    os_version: getOSVersion(),
    app_version: getAppVersion(),
    battery,
    network,
    storage,
    memory,
    performance,
    retrieved_at: new Date().toISOString(),
  };

  cachedAt = Date.now();

  return cachedDevice;
}

export async function getNativeStatus() {
  const device = await getDeviceInfo();

  return {
    ready: true,
    platform: device.platform,
    model: device.model,
    os_version: device.os_version,
    capabilities: {
      biometrics: true,
      camera: true,
      microphone: true,
      files: true,
      notifications: true,
      background: true,
      location: true,
      secure_storage: true,
    },
    device,
  };
}

export function clearNativeDeviceCache() {
  cachedDevice = null;
  cachedAt = 0;
}