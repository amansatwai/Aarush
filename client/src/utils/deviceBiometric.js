const BIOMETRIC_PERMISSION_KEY = 'aarush_biometric_permission_state';

export function isWebAuthnSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    Boolean(navigator.credentials)
  );
}

export async function isBiometricAvailable() {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    if (
      typeof window.PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }

    return true;
  } catch {
    return false;
  }
}

export function getBiometricPermissionState() {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  return (
    window.localStorage.getItem(BIOMETRIC_PERMISSION_KEY) || 'unknown'
  );
}

export function setBiometricPermissionState(state) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(BIOMETRIC_PERMISSION_KEY, state);
}

export async function requestBiometricAuthentication({
  challenge = `aarush-${Date.now()}-${Math.random()}`,
  timeout = 60000,
} = {}) {
  const available = await isBiometricAvailable();

  if (!available) {
    return {
      success: false,
      available: false,
      error: 'Biometric authentication is not available on this device.',
    };
  }

  try {
    const challengeBytes =
      challenge instanceof Uint8Array
        ? challenge
        : new TextEncoder().encode(String(challenge));

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: challengeBytes,
        timeout,
        userVerification: 'required',
        allowCredentials: [],
      },
    });

    return {
      success: Boolean(credential),
      available: true,
      credential,
    };
  } catch (error) {
    return {
      success: false,
      available: true,
      error:
        error?.name === 'NotAllowedError'
          ? 'Biometric verification was cancelled or not completed.'
          : 'Biometric verification failed.',
    };
  }
}

export default {
  isWebAuthnSupported,
  isBiometricAvailable,
  getBiometricPermissionState,
  setBiometricPermissionState,
  requestBiometricAuthentication,
}; 