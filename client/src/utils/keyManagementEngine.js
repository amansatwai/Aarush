import { supabase } from '../lib/supabase';

const KEY_CACHE = new Map();
const DB_NAME = 'aarush-encryption';
const STORE_NAME = 'keys';

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

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error('Sign in to manage encryption keys.');
  }

  return user;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveLocalKey(name, value) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      'readwrite'
    );

    transaction.objectStore(STORE_NAME).put(value, name);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

async function readLocalKey(name) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      'readonly'
    );

    const request = transaction
      .objectStore(STORE_NAME)
      .get(name);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteLocalKey(name) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      'readwrite'
    );

    transaction.objectStore(STORE_NAME).delete(name);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

function keyName(type, id = 'current') {
  return `${type}:${id}`;
}

async function generateIdentityPair() {
  return crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([
        1, 0, 1,
      ]),
      hash: 'SHA-256',
    },
    false,
    ['encrypt', 'decrypt']
  );
}

async function generateDevicePair() {
  return crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    false,
    ['deriveKey', 'deriveBits']
  );
}

export async function createIdentityKey() {
  if (guestMode()) {
    throw new Error(
      'Guests cannot initialize encryption.'
    );
  }

  const user = await requireUser();
  const pair = await generateIdentityPair();

  await saveLocalKey(
    keyName('identity-private', user.id),
    pair.privateKey
  );

  await saveLocalKey(
    keyName('identity-public', user.id),
    pair.publicKey
  );

  KEY_CACHE.set(
    keyName('identity-private', user.id),
    pair.privateKey
  );

  KEY_CACHE.set(
    keyName('identity-public', user.id),
    pair.publicKey
  );

  return pair;
}

export async function getIdentityKey() {
  const user = await requireUser();
  const name = keyName(
    'identity-private',
    user.id
  );

  if (KEY_CACHE.has(name)) {
    return KEY_CACHE.get(name);
  }

  const key = await readLocalKey(name);

  if (key) {
    KEY_CACHE.set(name, key);
  }

  return key || null;
}

export async function createDeviceKey() {
  if (guestMode()) {
    throw new Error(
      'Guests cannot initialize encryption.'
    );
  }

  const user = await requireUser();
  const pair = await generateDevicePair();

  await saveLocalKey(
    keyName('device-private', user.id),
    pair.privateKey
  );

  await saveLocalKey(
    keyName('device-public', user.id),
    pair.publicKey
  );

  KEY_CACHE.set(
    keyName('device-private', user.id),
    pair.privateKey
  );

  KEY_CACHE.set(
    keyName('device-public', user.id),
    pair.publicKey
  );

  return pair;
}

export async function getDeviceKey() {
  const user = await requireUser();
  const name = keyName(
    'device-private',
    user.id
  );

  if (KEY_CACHE.has(name)) {
    return KEY_CACHE.get(name);
  }

  const key = await readLocalKey(name);

  if (key) {
    KEY_CACHE.set(name, key);
  }

  return key || null;
}

export async function createConversationKey(
  conversationId
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create conversation keys.'
    );
  }

  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );

  await saveLocalKey(
    keyName('conversation', conversationId),
    key
  );

  KEY_CACHE.set(
    keyName('conversation', conversationId),
    key
  );

  return key;
}

export async function getConversationKey(
  conversationId
) {
  const name = keyName(
    'conversation',
    conversationId
  );

  if (KEY_CACHE.has(name)) {
    return KEY_CACHE.get(name);
  }

  const key = await readLocalKey(name);

  if (key) {
    KEY_CACHE.set(name, key);
  }

  return key || null;
}

async function deriveBackupKey(password, salt) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 250000,
      hash: 'SHA-256',
    },
    material,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

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

export async function backupEncryptedKeys(password) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot back up encryption keys.'
    );
  }

  if (!password || password.length < 8) {
    throw new Error(
      'Use a password with at least 8 characters.'
    );
  }

  await requireUser();

  const identity = await getIdentityKey();
  const device = await getDeviceKey();

  if (!identity && !device) {
    throw new Error('No encryption keys available.');
  }

  const salt = crypto.getRandomValues(
    new Uint8Array(16)
  );

  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const backupKey = await deriveBackupKey(
    password,
    salt
  );

  const payload = JSON.stringify({
    version: 1,
    created_at: new Date().toISOString(),
    identity_available: Boolean(identity),
    device_available: Boolean(device),
  });

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    backupKey,
    new TextEncoder().encode(payload)
  );

  return {
    version: 1,
    algorithm: 'AES-GCM',
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(
      new Uint8Array(encrypted)
    ),
  };
}

export async function restoreEncryptedKeys(
  backup,
  password
) {
  if (!backup || !password) {
    throw new Error(
      'Encrypted backup and password are required.'
    );
  }

  const salt = base64ToBytes(backup.salt);
  const iv = base64ToBytes(backup.iv);
  const ciphertext = base64ToBytes(
    backup.ciphertext
  );

  const backupKey = await deriveBackupKey(
    password,
    salt
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    backupKey,
    ciphertext
  );

  return JSON.parse(
    new TextDecoder().decode(decrypted)
  );
}

export async function rotateKeys() {
  await revokeDeviceKeys();
  await createIdentityKey();
  await createDeviceKey();

  return {
    rotated: true,
    rotatedAt: new Date().toISOString(),
  };
}

export async function revokeDeviceKeys() {
  const user = await requireUser();

  const names = [
    keyName('device-private', user.id),
    keyName('device-public', user.id),
  ];

  await Promise.all(
    names.map((name) => deleteLocalKey(name))
  );

  names.forEach((name) => KEY_CACHE.delete(name));

  return true;
}

export async function destroyLocalKeys() {
  const user = await requireUser();

  const prefixNames = [
    keyName('identity-private', user.id),
    keyName('identity-public', user.id),
    keyName('device-private', user.id),
    keyName('device-public', user.id),
  ];

  await Promise.all(
    prefixNames.map((name) => deleteLocalKey(name))
  );

  KEY_CACHE.clear();
  return true;
}

export async function exportPublicKey(type = 'identity') {
  const user = await requireUser();

  const key = await readLocalKey(
    keyName(`${type}-public`, user.id)
  );

  if (!key) {
    throw new Error('Public key is not available.');
  }

  const exported = await crypto.subtle.exportKey(
    'jwk',
    key
  );

  return exported;
}

export async function importPublicKey(
  jwk,
  type = 'identity'
) {
  if (!jwk) {
    throw new Error('Public key is required.');
  }

  const algorithm =
    type === 'device'
      ? {
          name: 'ECDH',
          namedCurve: 'P-256',
        }
      : {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        };

  return crypto.subtle.importKey(
    'jwk',
    jwk,
    algorithm,
    true,
    type === 'device'
      ? []
      : ['encrypt']
  );
}