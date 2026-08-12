import { NativeModules, Platform } from 'react-native';

const bridgeEvents = new Set();

function nativeModule(name) {
  return NativeModules?.[name] || null;
}

function emit(event) {
  bridgeEvents.forEach((listener) => listener(event));
}

export async function initializeNativeBridge() {
  return {
    ready: true,
    platform: Platform.OS,
    native_modules_available:
      Object.keys(NativeModules || {}).length,
  };
}

export async function invokeNativeModule(
  moduleName,
  method,
  args = []
) {
  const module = nativeModule(moduleName);

  if (!module || typeof module[method] !== 'function') {
    return {
      supported: false,
      module: moduleName,
      method,
    };
  }

  const result = await module[method](...args);

  emit({
    type: 'native_module_invoked',
    module: moduleName,
    method,
  });

  return {
    supported: true,
    result,
  };
}

export async function invokeSecureModule(
  method,
  args = []
) {
  return invokeNativeModule(
    'SecureStorageModule',
    method,
    args
  );
}

export async function invokeBiometricModule(
  method = 'authenticate',
  args = []
) {
  return invokeNativeModule(
    'BiometricModule',
    method,
    args
  );
}

export async function invokeCameraModule(
  method = 'openCamera',
  args = []
) {
  return invokeNativeModule(
    'CameraModule',
    method,
    args
  );
}

export async function invokeFileModule(
  method = 'pickFile',
  args = []
) {
  return invokeNativeModule(
    'FileModule',
    method,
    args
  );
}

export async function invokeNotificationModule(
  method = 'requestPermission',
  args = []
) {
  return invokeNativeModule(
    'NotificationModule',
    method,
    args
  );
}

export async function invokeBackgroundModule(
  method = 'getStatus',
  args = []
) {
  return invokeNativeModule(
    'BackgroundModule',
    method,
    args
  );
}

export async function invokeLocationModule(
  method = 'requestPermission',
  args = []
) {
  return invokeNativeModule(
    'LocationModule',
    method,
    args
  );
}

export async function getBridgeHealth() {
  const bridge = await initializeNativeBridge();

  return {
    ...bridge,
    healthy: bridge.ready,
    checked_at: new Date().toISOString(),
  };
}

export async function getBridgeStatus() {
  return {
    platform: Platform.OS,
    native_modules: Object.keys(
      NativeModules || {}
    ),
    secure_storage_ready: true,
    biometric_ready: true,
    background_ready: true,
  };
}

export function subscribeToNativeBridge(
  callback
) {
  bridgeEvents.add(callback);

  return () => {
    bridgeEvents.delete(callback);
  };
}