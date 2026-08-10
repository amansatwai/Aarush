const DB_NAME = 'aarush-offline';
const DB_VERSION = 1;
const STORE = 'offline_store';
const QUEUE = 'offline_queue';

let databasePromise = null;

function openDatabase() {
  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE);
      }

      if (!database.objectStoreNames.contains(QUEUE)) {
        database.createObjectStore(QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return databasePromise;
}

async function put(storeName, key, value) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      storeName,
      'readwrite'
    );

    transaction.objectStore(storeName).put(value, key);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

async function get(storeName, key) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      storeName,
      'readonly'
    );

    const request = transaction
      .objectStore(storeName)
      .get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAll(storeName) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      storeName,
      'readonly'
    );

    const request = transaction
      .objectStore(storeName)
      .getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function clearStore(storeName) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      storeName,
      'readwrite'
    );

    transaction.objectStore(storeName).clear();
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

export function isOffline() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return !navigator.onLine;
}

export async function initializeOfflineMode() {
  await openDatabase();

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      'aarush_offline_ready',
      'true'
    );
  }

  return {
    ready: true,
    offline: isOffline(),
  };
}

export async function queueOfflineAction({
  type,
  payload = {},
  priority = 'normal',
} = {}) {
  if (!type) {
    throw new Error('Offline action type is required.');
  }

  const item = {
    type,
    payload,
    priority,
    status: 'pending',
    attempts: 0,
    created_at: new Date().toISOString(),
  };

  await put(QUEUE, undefined, item);

  return item;
}

export async function getOfflineQueue() {
  return getAll(QUEUE);
}

export async function processOfflineQueue(
  processor
) {
  if (isOffline()) {
    return {
      processed: 0,
      pending: (await getOfflineQueue()).length,
      offline: true,
    };
  }

  const items = await getOfflineQueue();
  let processed = 0;

  for (const item of items) {
    try {
      await processor?.(item);

      const database = await openDatabase();

      await new Promise((resolve, reject) => {
        const transaction = database.transaction(
          QUEUE,
          'readwrite'
        );

        transaction.objectStore(QUEUE).delete(item.id);
        transaction.oncomplete = resolve;
        transaction.onerror = () =>
          reject(transaction.error);
      });

      processed += 1;
    } catch {
      item.attempts += 1;
      item.status = 'failed';
      await put(QUEUE, item.id, item);
    }
  }

  return {
    processed,
    pending: (await getOfflineQueue()).length,
    offline: false,
  };
}

export async function clearOfflineQueue() {
  await clearStore(QUEUE);
  return true;
}

export async function cacheFeed(value) {
  return put(STORE, 'feed', {
    value,
    cached_at: new Date().toISOString(),
  });
}

export async function cacheChats(value) {
  return put(STORE, 'chats', {
    value,
    cached_at: new Date().toISOString(),
  });
}

export async function cacheStories(value) {
  return put(STORE, 'stories', {
    value,
    cached_at: new Date().toISOString(),
  });
}

export async function cacheExplore(value) {
  return put(STORE, 'explore', {
    value,
    cached_at: new Date().toISOString(),
  });
}

export async function getCachedData(key) {
  return get(STORE, key);
}

export async function clearCache() {
  await clearStore(STORE);
  return true;
}