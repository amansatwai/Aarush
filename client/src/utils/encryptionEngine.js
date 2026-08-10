import {
  createConversationKey,
  createDeviceKey,
  createIdentityKey,
  destroyLocalKeys,
  getConversationKey,
  getDeviceKey,
  getIdentityKey,
  rotateKeys as rotateManagedKeys,
} from './keyManagementEngine';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes) {
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);

  return Uint8Array.from(binary, (char) =>
    char.charCodeAt(0)
  );
}

function guestMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

export async function initializeEncryption() {
  if (guestMode()) {
    return {
      enabled: false,
      initialized: false,
      guest: true,
    };
  }

  let identity = await getIdentityKey();
  let device = await getDeviceKey();

  if (!identity) {
    await createIdentityKey();
    identity = await getIdentityKey();
  }

  if (!device) {
    await createDeviceKey();
    device = await getDeviceKey();
  }

  return {
    enabled: true,
    initialized: Boolean(identity && device),
    identityAvailable: Boolean(identity),
    deviceAvailable: Boolean(device),
    strength:
      identity && device
        ? 'End-to-End Ready'
        : 'Basic',
  };
}

export async function generateKeyPair() {
  return crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    false,
    ['deriveKey', 'deriveBits']
  );
}

export async function generateConversationKey(
  conversationId
) {
  return createConversationKey(conversationId);
}

export async function encryptMessage(
  message,
  conversationId
) {
  const key = await getConversationKey(
    conversationId
  );

  if (!key) {
    throw new Error(
      'Conversation encryption key is unavailable.'
    );
  }

  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(String(message))
  );

  return {
    version: 1,
    algorithm: 'AES-GCM',
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(
      new Uint8Array(encrypted)
    ),
  };
}

export async function decryptMessage(
  payload,
  conversationId
) {
  const key = await getConversationKey(
    conversationId
  );

  if (!key) {
    throw new Error(
      'Conversation encryption key is unavailable.'
    );
  }

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToBytes(payload.iv),
    },
    key,
    base64ToBytes(payload.ciphertext)
  );

  return decoder.decode(decrypted);
}

async function encryptBlob(blob, key) {
  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const bytes = await blob.arrayBuffer();

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    bytes
  );

  return {
    version: 1,
    type: blob.type,
    iv: bytesToBase64(iv),
    ciphertext: new Blob(
      [encrypted],
      {
        type: 'application/octet-stream',
      }
    ),
  };
}

async function decryptBlob(payload, key) {
  const bytes = await payload.ciphertext.arrayBuffer();

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToBytes(payload.iv),
    },
    key,
    bytes
  );

  return new Blob([decrypted], {
    type: payload.type || 'application/octet-stream',
  });
}

export async function encryptMedia(
  file,
  conversationId
) {
  const key = await getConversationKey(
    conversationId
  );

  if (!key) {
    throw new Error('Media encryption key unavailable.');
  }

  return encryptBlob(file, key);
}

export async function decryptMedia(
  payload,
  conversationId
) {
  const key = await getConversationKey(
    conversationId
  );

  if (!key) {
    throw new Error('Media encryption key unavailable.');
  }

  return decryptBlob(payload, key);
}

export async function encryptFile(
  file,
  conversationId
) {
  return encryptMedia(file, conversationId);
}

export async function decryptFile(
  payload,
  conversationId
) {
  return decryptMedia(payload, conversationId);
}

export async function rotateConversationKey(
  conversationId
) {
  return createConversationKey(conversationId);
}

export async function verifyEncryptionIntegrity() {
  if (guestMode()) {
    return {
      verified: false,
      reason: 'guest',
    };
  }

  const state = await initializeEncryption();

  return {
    verified:
      state.initialized &&
      state.identityAvailable &&
      state.deviceAvailable,
    ...state,
  };
}

export async function destroyEncryptionKeys() {
  return destroyLocalKeys();
}

export async function rotateKeys() {
  return rotateManagedKeys();
}