import {
  getQueueStatus,
  processQueue,
} from './offlineQueueEngine';

let timer = null;
let paused = false;
let status = {
  state: 'stopped',
  network: 'unknown',
  last_sync_at: null,
};

const listeners = new Set();

function emit(next) {
  status = {
    ...status,
    ...next,
  };

  listeners.forEach((listener) => listener(status));
}

function networkState() {
  if (!navigator.onLine) return 'offline';

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const type = connection?.effectiveType;

  if (type === 'slow-2g' || type === '2g') {
    return 'slow';
  }

  if (type === '3g') {
    return 'limited';
  }

  return 'online';
}

async function process(processor) {
  if (paused || !navigator.onLine) {
    emit({
      state: paused ? 'paused' : 'offline',
      network: networkState(),
    });

    return;
  }

  emit({
    state: 'syncing',
    network: networkState(),
  });

  try {
    const result = await processQueue(processor);

    emit({
      state: result.pending
        ? 'pending'
        : 'synced',
      network: networkState(),
      last_sync_at: new Date().toISOString(),
    });

    return result;
  } catch (error) {
    emit({
      state: 'failed',
      network: networkState(),
      error: error?.message,
    });

    throw error;
  }
}

export async function initializeBackgroundSync() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', syncWhenOnline);
    window.addEventListener('offline', () => {
      emit({
        state: 'offline',
        network: 'offline',
      });
    });
  }

  emit({
    state: 'ready',
    network: networkState(),
  });

  return status;
}

export function startBackgroundSync({
  interval = 30000,
  processor,
} = {}) {
  stopBackgroundSync();

  paused = false;

  timer = window.setInterval(() => {
    process(processor).catch(() => {});
  }, interval);

  process(processor).catch(() => {});

  emit({
    state: 'running',
    network: networkState(),
  });

  return stopBackgroundSync;
}

export function stopBackgroundSync() {
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }

  emit({
    state: 'stopped',
    network: networkState(),
  });
}

export function syncWhenOnline(processor) {
  if (navigator.onLine) {
    return process(processor);
  }

  emit({
    state: 'offline',
    network: 'offline',
  });

  return null;
}

export function syncWhenWifi(processor) {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const wifi =
    connection?.type === 'wifi' ||
    connection?.effectiveType === '4g';

  if (wifi) {
    return process(processor);
  }

  return null;
}

export function syncWhenCharging(processor) {
  if (!navigator.getBattery) {
    return process(processor);
  }

  return navigator
    .getBattery()
    .then((battery) =>
      battery.charging
        ? process(processor)
        : null
    );
}

export async function syncLowPriorityTasks(
  processor
) {
  const queue = await getQueueStatus();

  if (queue.pending > 0) {
    return process(processor);
  }

  return null;
}

export async function syncHighPriorityTasks(
  processor
) {
  return process(processor);
}

export function pauseBackgroundSync() {
  paused = true;

  emit({
    state: 'paused',
  });

  return true;
}

export function resumeBackgroundSync(
  processor
) {
  paused = false;

  emit({
    state: 'running',
  });

  return process(processor);
}

export function getBackgroundSyncStatus() {
  return {
    ...status,
    paused,
    network: networkState(),
  };
}

export function subscribeToBackgroundSync(
  callback
) {
  listeners.add(callback);
  callback?.(getBackgroundSyncStatus());

  return () => {
    listeners.delete(callback);
  };
}