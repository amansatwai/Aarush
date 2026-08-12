import {
  NativeModules,
  Platform,
} from 'react-native';

const MODULE_NAME = 'AarushBiometricModule';

let moduleInstance = null;
let activeRequest = null;
let biometricState = {
  available: false,
  type: 'Device PIN fallback',
  authenticated: false,
  platform: Platform.OS,
};

function getModule() {
  if (moduleInstance) {
    return moduleInstance;
  }

  moduleInstance =
    NativeModules?.[MODULE_NAME] || null;

  return moduleInstance;
}

function detectType() {
  if (Platform.OS === 'ios') {
    return 'Face ID / Touch ID';
  }

  if (Platform.OS === 'android') {
    return 'Fingerprint / Face Unlock';
  }

  return 'Device PIN fallback';
}

export async function initializeNativeBiometrics() {
  const module = getModule();

  if (!module) {
    biometricState = {
      ...biometricState,
      available: false,
      type: detectType(),
      native_module_ready: false,
    };

    return biometricState;
  }

  try {
    const result =
      typeof module.getStatus === 'function'
        ? await module.getStatus()
        : {};

    biometricState = {
      ...biometricState,
      available: Boolean(
        result.available ?? true
      ),
      type: result.type || detectType(),
      native_module_ready: true,
    };
  } catch {
    biometricState = {
      ...biometricState,
      available: false,
      type: detectType(),
      native_module_ready: false,
    };
  }

  return biometricState;
}

export async function isBiometricAvailable() {
  const status =
    await initializeNativeBiometrics();

  return Boolean(status.available);
}

export async function getBiometricType() {
  const status =
    await initializeNativeBiometrics();

  return status.type;
}

export async function authenticateBiometric(
  reason = 'Verify your identity'
) {
  const module = getModule();

  if (!module?.authenticate) {
    return {
      authenticated: false,
      fallback: true,
      reason:
        'Native biometric module is not installed.',
    };
  }

  activeRequest = module.authenticate({
    reason,
    fallbackLabel: 'Use device PIN',
  });

  try {
    const result = await activeRequest;

    biometricState = {
      ...biometricState,
      authenticated: Boolean(
        result?.authenticated ?? result
      ),
      last_authenticated_at: new Date().toISOString(),
    };

    return {
      authenticated: biometricState.authenticated,
      type: biometricState.type,
    };
  } finally {
    activeRequest = null;
  }
}

export async function authenticateForSensitiveAction(
  action
) {
  return authenticateBiometric(
    `Verify before ${action}`
  );
}

export async function authenticateForPayments() {
  return authenticateSensitiveAction(
    'approving this payment'
  );
}

export async function authenticateForSecurityCenter() {
  return authenticateSensitiveAction(
    'opening Security Center'
  );
}

export async function authenticateForPrivacyCenter() {
  return authenticateSensitiveAction(
    'opening Privacy Center'
  );
}

export async function authenticateForBackupRestore() {
  return authenticateSensitiveAction(
    'restoring a backup'
  );
}

export async function authenticateForAppUnlock() {
  return authenticateBiometric(
    'Unlock Aarush'
  );
}

export function cancelBiometricRequest() {
  const module = getModule();

  if (module?.cancel && activeRequest) {
    module.cancel();
  }

  activeRequest = null;

  return true;
}

export function getBiometricStatus() {
  return {
    ...biometricState,
    supported_platform:
      Platform.OS === 'ios'
        ? 'iOS'
        : Platform.OS === 'android'
          ? 'Android'
          : 'Other',
    pin_fallback: true,
    hardware_security_ready: true,
  };
}