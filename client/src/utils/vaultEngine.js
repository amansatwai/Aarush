const VAULT_STATE_KEY = 'aarush_vault_state';
const VAULT_TIMELINE_KEY = 'aarush_vault_timeline';

const DEFAULT_STATE = {
  totalBytes: 5 * 1024 * 1024 * 1024,
  usedBytes: 812 * 1024 * 1024,
  encryption: 'AES-256 foundation',
  syncStatus: 'Syncing',
  autoExpiry: 'Never',
  expiryBehavior: 'Move to secure trash',
  requireConfirmation: true,
  aiReminder: true,
  folders: [
    {
      id: 'personal',
      name: 'Personal Vault',
      usedBytes: 210 * 1024 * 1024,
      items: 42,
      encryption: 'Protected',
      lastAccess: 'Today, 10:42 AM',
      trusted: true,
    },
    {
      id: 'family',
      name: 'Family Vault',
      usedBytes: 180 * 1024 * 1024,
      items: 28,
      encryption: 'Protected',
      lastAccess: 'Yesterday',
      trusted: true,
    },
    {
      id: 'work',
      name: 'Work Vault',
      usedBytes: 165 * 1024 * 1024,
      items: 18,
      encryption: 'Protected',
      lastAccess: 'Monday',
      trusted: true,
    },
    {
      id: 'secret',
      name: 'Secret Vault',
      usedBytes: 257 * 1024 * 1024,
      items: 31,
      encryption: 'Protected',
      lastAccess: 'Today',
      trusted: false,
    },
  ],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(key, fallback) {
  if (typeof window === 'undefined') {
    return clone(fallback);
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function writeJson(key, value) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function getVaultState() {
  return readJson(VAULT_STATE_KEY, DEFAULT_STATE);
}

export function saveVaultState(state) {
  writeJson(VAULT_STATE_KEY, state);
}

export function updateVaultState(updates) {
  const next = {
    ...getVaultState(),
    ...updates,
  };

  saveVaultState(next);
  return next;
}

export function getStorageStats(state = getVaultState()) {
  const total = Number(state.totalBytes) || 0;
  const used = Math.min(Number(state.usedBytes) || 0, total);
  const free = Math.max(total - used, 0);

  return {
    total,
    used,
    free,
    percentage: total ? Math.round((used / total) * 100) : 0,
  };
}

export function formatBytes(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function createVaultFolder(name = 'Custom Vault') {
  const state = getVaultState();

  const folder = {
    id: `vault-${Date.now()}`,
    name,
    usedBytes: 0,
    items: 0,
    encryption: 'Protected',
    lastAccess: 'Not accessed',
    trusted: true,
  };

  const next = {
    ...state,
    folders: [...state.folders, folder],
  };

  saveVaultState(next);
  return next;
}

export function getVaultTimeline() {
  return readJson(VAULT_TIMELINE_KEY, [
    {
      id: 'timeline-1',
      event: 'Imported files',
      time: 'Today, 10:42 AM',
      date: 'Today',
      device: 'Windows Laptop',
      status: 'Protected',
    },
    {
      id: 'timeline-2',
      event: 'Vault access',
      time: 'Yesterday, 8:18 PM',
      date: 'Yesterday',
      device: 'Android Phone',
      status: 'Verified',
    },
    {
      id: 'timeline-3',
      event: 'AI privacy action',
      time: 'Monday, 6:04 PM',
      date: 'Monday',
      device: 'Windows Laptop',
      status: 'Completed',
    },
  ]);
}

export function recordVaultEvent(event, status = 'Protected') {
  const timeline = getVaultTimeline();

  const nextEvent = {
    id: `vault-event-${Date.now()}`,
    event,
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    device:
      typeof navigator !== 'undefined' &&
      navigator.userAgent.includes('Mobile')
        ? 'Mobile device'
        : 'Desktop device',
    status,
  };

  const nextTimeline = [nextEvent, ...timeline].slice(0, 100);
  writeJson(VAULT_TIMELINE_KEY, nextTimeline);
  return nextTimeline;
}

export function getMemoryItems() {
  return [
    ['Photos', '124 items', 'Today', 'Protected'],
    ['Videos', '36 items', 'Yesterday', 'Protected'],
    ['Stories Archive', '48 items', 'Monday', 'Protected'],
    ['Reels Archive', '22 items', 'Sunday', 'Protected'],
    ['Saved Posts', '86 items', 'Saturday', 'Protected'],
    ['Saved Reels', '31 items', 'Friday', 'Protected'],
    ['Voice Memories', '14 items', 'Thursday', 'Protected'],
    ['Documents', '18 items', 'Wednesday', 'Protected'],
    ['Screenshots', '64 items', 'Tuesday', 'Review'],
    ['Downloads', '42 items', 'Monday', 'Protected'],
  ];
}

export default {
  getVaultState,
  saveVaultState,
  updateVaultState,
  getStorageStats,
  formatBytes,
  createVaultFolder,
  getVaultTimeline,
  recordVaultEvent,
  getMemoryItems,
};