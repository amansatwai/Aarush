const DB_NAME = 'aarush-smart-queue';
const DB_VERSION = 1;
const STORE = 'actions';

let databasePromise = null;
let paused = false;

function openDatabase() {
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE)) {
        const store = database.createObjectStore(
          STORE,
          {
            keyPath: 'id',
            autoIncrement: true,
          }
        );

        store.createIndex(
          'status',
          'status',
          { unique: false }
        );

        store.createIndex(
          'priority',
          'priority',
          { unique: false }
        );
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return databasePromise;
}

async function addAction(action) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE,
      'readwrite'
    );

    const request = transaction
      .objectStore(STORE)
      .add(action);

    request.onsuccess = () => {
      resolve({
        ...action,
        id: request.result,
      });
    };

    request.onerror = () => reject(request.error);
  });
}

async function updateAction(action) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE,
      'readwrite'
    );

    transaction.objectStore(STORE).put(action);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

async function getAllActions() {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE,
      'readonly'
    );

    const request = transaction
      .objectStore(STORE)
      .getAll();

    request.onsuccess = () =>
      resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function deleteAction(id) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE,
      'readwrite'
    );

    transaction.objectStore(STORE).delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

function priorityValue(priority) {
  return {
    high: 1,
    normal: 2,
    low: 3,
  }[priority] || 2;
}

function duplicateKey(action) {
  return [
    action.type,
    action.payload?.entityId,
    action.payload?.postId,
    action.payload?.storyId,
    action.payload?.conversationId,
  ]
    .filter(Boolean)
    .join(':');
}

export async function initializeOfflineQueue() {
  await openDatabase();

  return {
    ready: true,
    paused,
    online:
      typeof navigator === 'undefined'
        ? true
        : navigator.onLine,
  };
}

export async function queueAction({
  type,
  payload = {},
  priority = 'normal',
  dependencies = [],
  maxRetries = 5,
  dedupe = true,
} = {}) {
  if (!type) {
    throw new Error('Queue action type is required.');
  }

  const existing = await getAllActions();
  const key = duplicateKey({
    type,
    payload,
  });

  if (dedupe && key) {
    const duplicate = existing.find(
      (item) =>
        item.dedupe_key === key &&
        ['pending', 'syncing', 'uploading'].includes(
          item.status
        )
    );

    if (duplicate) {
      return duplicate;
    }
  }

  return addAction({
    type,
    payload,
    priority,
    priority_value: priorityValue(priority),
    dependencies,
    dedupe_key: key,
    status: 'pending',
    attempts: 0,
    max_retries: maxRetries,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function queuePostUpload(
  payload,
  options = {}
) {
  return queueAction({
    type: 'post_upload',
    payload,
    priority: 'high',
    ...options,
  });
}

export async function queueStoryUpload(
  payload,
  options = {}
) {
  return queueAction({
    type: 'story_upload',
    payload,
    priority: 'high',
    ...options,
  });
}

export async function queueMessage(
  payload,
  options = {}
) {
  return queueAction({
    type: 'message',
    payload,
    priority: 'high',
    ...options,
  });
}

export async function queueLike(
  payload,
  options = {}
) {
  return queueAction({
    type: 'like',
    payload,
    priority: 'normal',
    ...options,
  });
}

export async function queueComment(
  payload,
  options = {}
) {
  return queueAction({
    type: 'comment',
    payload,
    priority: 'normal',
    ...options,
  });
}

export async function queueFollow(
  payload,
  options = {}
) {
  return queueAction({
    type: 'follow',
    payload,
    priority: 'normal',
    ...options,
  });
}

export async function queueSave(
  payload,
  options = {}
) {
  return queueAction({
    type: 'save',
    payload,
    priority: 'low',
    ...options,
  });
}

function dependenciesCompleted(
  action,
  actions
) {
  return (action.dependencies || []).every(
    (dependencyId) =>
      actions.find(
        (item) => item.id === dependencyId
      )?.status === 'completed'
  );
}

function backoffDelay(attempts) {
  return Math.min(
    30 * 60 * 1000,
    1000 * Math.pow(2, attempts)
  );
}

export async function processQueue(processor) {
  if (paused || !navigator.onLine) {
    return {
      processed: 0,
      pending: (await getAllActions()).length,
      paused,
    };
  }

  const all = await getAllActions();
  const now = Date.now();

  const pending = all
    .filter((action) => {
      if (
        !['pending', 'failed', 'retrying'].includes(
          action.status
        )
      ) {
        return false;
      }

      if (action.status === 'failed') {
        const retryAt =
          new Date(action.updated_at).getTime() +
          backoffDelay(action.attempts);

        return now >= retryAt;
      }

      return dependenciesCompleted(action, all);
    })
    .sort(
      (first, second) =>
        first.priority_value -
        second.priority_value
    );

  let processed = 0;

  for (const action of pending) {
    const next = {
      ...action,
      status:
        action.type.includes('upload')
          ? 'uploading'
          : 'syncing',
      attempts: action.attempts + 1,
      updated_at: new Date().toISOString(),
    };

    await updateAction(next);

    try {
      await processor?.(next);

      await updateAction({
        ...next,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      processed += 1;
    } catch (error) {
      const failed =
        next.attempts >= next.max_retries;

      await updateAction({
        ...next,
        status: failed ? 'failed' : 'retrying',
        error:
          error?.message || 'Queue action failed.',
        updated_at: new Date().toISOString(),
      });
    }
  }

  return {
    processed,
    pending: (
      await getAllActions()
    ).filter((item) =>
      ['pending', 'retrying', 'failed'].includes(
        item.status
      )
    ).length,
    paused,
  };
}

export async function retryFailedActions() {
  const actions = await getAllActions();

  await Promise.all(
    actions
      .filter((action) => action.status === 'failed')
      .map((action) =>
        updateAction({
          ...action,
          status: 'retrying',
          attempts: 0,
          updated_at: new Date().toISOString(),
        })
      )
  );

  return processQueue();
}

export async function getQueueStatus() {
  const actions = await getAllActions();

  return {
    total: actions.length,
    pending: actions.filter(
      (item) => item.status === 'pending'
    ).length,
    uploading: actions.filter(
      (item) => item.status === 'uploading'
    ).length,
    syncing: actions.filter(
      (item) => item.status === 'syncing'
    ).length,
    failed: actions.filter(
      (item) => item.status === 'failed'
    ).length,
    completed: actions.filter(
      (item) => item.status === 'completed'
    ).length,
    paused,
  };
}

export async function getQueueHistory({
  status,
} = {}) {
  const actions = await getAllActions();

  if (!status) return actions;

  return actions.filter(
    (action) => action.status === status
  );
}

export async function clearQueue({
  completedOnly = false,
  failedOnly = false,
} = {}) {
  const actions = await getAllActions();

  const targets = actions.filter((action) => {
    if (completedOnly) {
      return action.status === 'completed';
    }

    if (failedOnly) {
      return action.status === 'failed';
    }

    return true;
  });

  await Promise.all(
    targets.map((action) => deleteAction(action.id))
  );

  return true;
}

export function pauseQueue() {
  paused = true;
  return paused;
}

export function resumeQueue() {
  paused = false;
  return paused;
}