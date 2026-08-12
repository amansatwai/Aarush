import {
  NativeModules,
  Platform,
} from 'react-native';

const MODULE_NAME = 'AarushSecureStorageModule';

const memoryFallback = new Map();
let storageState = {
  ready: false,
  native_module_ready: false,
  backend:
    Platform.OS === 'ios'
      ? 'iOS Keychain preparation'
      : Platform.OS === 'android'
        ? 'Android Keystore preparation'
        : 'Secure storage preparation',
};

function getModule() {
  return NativeModules?.[MODULE_NAME] || null;
}

export async function initializeSecureStorage() {
  const module = getModule();

  storageState = {
    ...storageState,
    ready: true,
    native_module_ready: Boolean(module),
  };

  return storageState;
}

export async function setSecureValue(
  key,
  value,
  options = {}
) {
  if (!key) {
    throw new Error('Secure storage key is required.');
  }

  const module = getModule();

  if (module?.setItem) {
    await module.setItem(
      key,
      JSON.stringify(value),
      options
    );
  } else {
    memoryFallback.set(key, value);
  }

  return true;
}

export async function getSecureValue(key) {
  const module = getModule();

  if (module?.getItem) {
    const value = await module.getItem(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return memoryFallback.get(key) ?? null;
}

export async function removeSecureValue(key) {
  const module = getModule();

  if (module?.removeItem) {
    await module.removeItem(key);
  } else {
    memoryFallback.delete(key);
  }

  return true;
}

export async function clearSecureStorage() {
  const module = getModule();

  if (module?.clear) {
    await module.clear();
  }

  memoryFallback.clear();

  return true;
}

export async function setEncryptedPreference(
  key,
  value
) {
  return setSecureValue(
    `encrypted_preference:${key}`,
    value,
    {
      requireAuthentication: false,
    }
  );
}

export async function getEncryptedPreference(
  key
) {
  return getSecureValue(
    `encrypted_preference:${key}`
  );
}

export async function storeSessionToken(
  token
) {
  return setSecureValue(
    'session_token',
    token,
    {
      requireAuthentication: false,
    }
  );
}

export async function getSessionToken() {
  return getSecureValue('session_token');
}

export async function removeSessionToken() {
  return removeSecureValue('session_token');
}

export async function storeEncryptionKey(
  key
) {
  return setSecureValue(
    'encryption_key',
    key,
    {
      requireAuthentication: true,
    }
  );
}

export async function getEncryptionKey() {
  return getSecureValue('encryption_key');
}

export async function storeRecoveryKey(
  key
) {
  return setSecureValue(
    'recovery_key',
    key,
    {
      requireAuthentication: true,
    }
  );
}

export async function getRecoveryKey() {
  return getSecureValue('recovery_key');
}

export function getSecureStorageStatus() {
  return {
    ...storageState,
    keychain_ready: Platform.OS === 'ios',
    keystore_ready: Platform.OS === 'android',
    memory_fallback_active:
      !storageState.native_module_ready,
    warning: storageState.native_module_ready
      ? null
      : 'Install the native secure-storage module before production use.',
  };
}