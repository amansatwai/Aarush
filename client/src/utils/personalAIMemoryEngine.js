const MEMORY_KEY = 'aarush_personal_ai_memory';

const DEFAULT_MEMORY = {
  preferences: {},
  behaviors: {},
  security_choices: {},
  privacy_choices: {},
  automation_choices: {},
  conversation_context: [],
  timeline: [],
  updated_at: null,
};

const MEMORY_CATEGORIES = [
  'preferences',
  'behaviors',
  'security_choices',
  'privacy_choices',
  'automation_choices',
];

const SENSITIVE_KEY_PATTERN =
  /(password|token|secret|api[_-]?key|service[_-]?role|biometric|private[_-]?key|refresh[_-]?token|access[_-]?token)/i;

function canUseStorage() {
  return (
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined'
  );
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

function safeGetItem(key) {
  if (!canUseStorage()) return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveItem(key) {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function cloneDefaultMemory() {
  return {
    preferences: {},
    behaviors: {},
    security_choices: {},
    privacy_choices: {},
    automation_choices: {},
    conversation_context: [],
    timeline: [],
    updated_at: null,
  };
}

function sanitizeValue(value, depth = 0) {
  if (depth > 5) {
    return null;
  }

  if (typeof value === 'string') {
    return SENSITIVE_KEY_PATTERN.test(value)
      ? '[redacted]'
      : value;
  }

  if (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 100)
      .map((item) => sanitizeValue(item, depth + 1));
  }

  if (isPlainObject(value)) {
    return Object.entries(value).reduce(
      (result, [key, item]) => {
        if (!SENSITIVE_KEY_PATTERN.test(key)) {
          result[key] = sanitizeValue(item, depth + 1);
        }

        return result;
      },
      {}
    );
  }

  return null;
}

function normalizeEntry(entry) {
  const source = isPlainObject(entry) ? entry : {};

  return {
    value: sanitizeValue(source.value),
    confidence: Math.min(
      100,
      Math.max(0, Number(source.confidence) || 10)
    ),
    updated_at:
      typeof source.updated_at === 'string'
        ? source.updated_at
        : new Date().toISOString(),
    metadata: isPlainObject(source.metadata)
      ? sanitizeValue(source.metadata)
      : {},
  };
}

function normalizeCategory(value) {
  if (!isPlainObject(value)) return {};

  return Object.entries(value).reduce(
    (result, [key, entry]) => {
      if (!SENSITIVE_KEY_PATTERN.test(key)) {
        result[key] = normalizeEntry(entry);
      }

      return result;
    },
    {}
  );
}

function normalizeMemory(value) {
  const source = isPlainObject(value) ? value : {};
  const timeline = Array.isArray(source.timeline)
    ? source.timeline
        .filter((item) => isPlainObject(item))
        .slice(0, 100)
        .map((item) => sanitizeValue(item))
    : [];

  const conversationContext = Array.isArray(
    source.conversation_context
  )
    ? source.conversation_context
        .filter((item) => item !== undefined)
        .slice(-50)
        .map((item) => sanitizeValue(item))
    : [];

  return {
    preferences: normalizeCategory(source.preferences),
    behaviors: normalizeCategory(source.behaviors),
    security_choices: normalizeCategory(
      source.security_choices
    ),
    privacy_choices: normalizeCategory(
      source.privacy_choices
    ),
    automation_choices: normalizeCategory(
      source.automation_choices
    ),
    conversation_context: conversationContext,
    timeline,
    updated_at:
      typeof source.updated_at === 'string'
        ? source.updated_at
        : null,
  };
}

function readMemory() {
  const raw = safeGetItem(MEMORY_KEY);

  if (!raw) {
    return cloneDefaultMemory();
  }

  try {
    return normalizeMemory(JSON.parse(raw));
  } catch {
    return cloneDefaultMemory();
  }
}

function writeMemory(memory) {
  const normalized = normalizeMemory(memory);

  normalized.updated_at = new Date().toISOString();

  safeSetItem(
    MEMORY_KEY,
    JSON.stringify(normalized)
  );

  return normalized;
}

function memoryCategory(category) {
  return MEMORY_CATEGORIES.includes(category);
}

function createTimelineEntry(category, key, value, metadata) {
  return {
    category,
    key,
    value: sanitizeValue(value),
    metadata: isPlainObject(metadata)
      ? sanitizeValue(metadata)
      : {},
    updated_at: new Date().toISOString(),
  };
}

function rememberInCategory(category, key, value, metadata) {
  if (!memoryCategory(category)) {
    throw new Error('Invalid memory category.');
  }

  if (
    typeof key !== 'string' ||
    !key.trim() ||
    SENSITIVE_KEY_PATTERN.test(key)
  ) {
    throw new Error('Invalid or sensitive memory key.');
  }

  const memory = readMemory();
  const existing = memory[category][key];
  const nextConfidence = Math.min(
    100,
    (existing?.confidence || 0) + 10 || 10
  );

  memory[category][key] = {
    value: sanitizeValue(value),
    confidence: nextConfidence,
    updated_at: new Date().toISOString(),
    metadata: isPlainObject(metadata)
      ? sanitizeValue(metadata)
      : {},
  };

  memory.timeline = [
    createTimelineEntry(category, key, value, metadata),
    ...memory.timeline,
  ].slice(0, 100);

  return writeMemory(memory);
}

export function initializePersonalMemory() {
  return readMemory();
}

export function rememberPreference(
  key,
  value,
  metadata = {}
) {
  return rememberInCategory(
    'preferences',
    key,
    value,
    metadata
  );
}

export function rememberBehavior(
  key,
  value,
  metadata = {}
) {
  return rememberInCategory(
    'behaviors',
    key,
    value,
    metadata
  );
}

export function rememberSecurityChoice(
  key,
  value,
  metadata = {}
) {
  return rememberInCategory(
    'security_choices',
    key,
    value,
    metadata
  );
}

export function rememberPrivacyChoice(
  key,
  value,
  metadata = {}
) {
  return rememberInCategory(
    'privacy_choices',
    key,
    value,
    metadata
  );
}

export function rememberAutomationChoice(
  key,
  value,
  metadata = {}
) {
  return rememberInCategory(
    'automation_choices',
    key,
    value,
    metadata
  );
}

export function rememberConversationContext(context) {
  const memory = readMemory();

  memory.conversation_context = [
    ...memory.conversation_context,
    sanitizeValue(context),
  ].slice(-50);

  return writeMemory(memory);
}

export function getMemorySummary() {
  const memory = readMemory();

  return {
    preference_count: Object.keys(
      memory.preferences
    ).length,
    behavior_count: Object.keys(memory.behaviors).length,
    security_count: Object.keys(
      memory.security_choices
    ).length,
    privacy_count: Object.keys(
      memory.privacy_choices
    ).length,
    automation_count: Object.keys(
      memory.automation_choices
    ).length,
    context_count: memory.conversation_context.length,
    last_updated: memory.updated_at,
  };
}

export function getRelevantMemory(keywords = []) {
  const memory = readMemory();

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return memory.timeline;
  }

  const normalizedKeywords = keywords
    .filter((keyword) => typeof keyword === 'string')
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);

  if (normalizedKeywords.length === 0) {
    return memory.timeline;
  }

  return memory.timeline.filter((entry) => {
    const searchable = [
      entry.category,
      entry.key,
      JSON.stringify(entry.value),
      JSON.stringify(entry.metadata),
    ]
      .join(' ')
      .toLowerCase();

    return normalizedKeywords.some((keyword) =>
      searchable.includes(keyword)
    );
  });
}

export function updateMemory(
  category,
  key,
  value,
  metadata = {}
) {
  if (!memoryCategory(category)) {
    throw new Error('Invalid memory category.');
  }

  return rememberInCategory(
    category,
    key,
    value,
    metadata
  );
}

export function deleteMemory(category, key) {
  if (!memoryCategory(category)) {
    throw new Error('Invalid memory category.');
  }

  const memory = readMemory();

  delete memory[category][key];

  memory.timeline = memory.timeline.filter(
    (entry) =>
      !(
        entry.category === category &&
        entry.key === key
      )
  );

  return writeMemory(memory);
}

export function clearPersonalMemory() {
  safeRemoveItem(MEMORY_KEY);
  return cloneDefaultMemory();
}

export function resetPersonalMemory() {
  return clearPersonalMemory();
}

export function exportMemory() {
  return {
    version: 1,
    exported_at: new Date().toISOString(),
    memory: readMemory(),
  };
}

export function importMemory(packageData) {
  if (
    !isPlainObject(packageData) ||
    !isPlainObject(packageData.memory)
  ) {
    throw new Error('Invalid AI memory package.');
  }

  const importedMemory = normalizeMemory(
    packageData.memory
  );

  return writeMemory(importedMemory);
}