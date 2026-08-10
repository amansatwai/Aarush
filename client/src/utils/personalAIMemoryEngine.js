const MEMORY_KEY =
  'aarush_personal_ai_memory';

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

function guestMode() {
  if (typeof window === 'undefined') return false;

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

function readMemory() {
  if (guestMode()) {
    return {
      ...DEFAULT_MEMORY,
      guest: true,
    };
  }

  if (typeof window === 'undefined') {
    return { ...DEFAULT_MEMORY };
  }

  try {
    return {
      ...DEFAULT_MEMORY,
      ...JSON.parse(
        localStorage.getItem(MEMORY_KEY) || '{}'
      ),
    };
  } catch {
    return { ...DEFAULT_MEMORY };
  }
}

function writeMemory(memory) {
  if (guestMode()) {
    return {
      ...memory,
      guest: true,
    };
  }

  const next = {
    ...memory,
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem(
    MEMORY_KEY,
    JSON.stringify(next)
  );

  return next;
}

function remember(
  category,
  key,
  value,
  metadata = {}
) {
  const memory = readMemory();

  memory[category][key] = {
    value,
    confidence: Math.min(
      100,
      Number(
        memory[category][key]?.confidence || 0
      ) + 10
    ),
    updated_at: new Date().toISOString(),
    metadata,
  };

  memory.timeline = [
    {
      category,
      key,
      value,
      created_at: new Date().toISOString(),
    },
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
  metadata
) {
  return remember(
    'preferences',
    key,
    value,
    metadata
  );
}

export function rememberBehavior(
  key,
  value,
  metadata
) {
  return remember(
    'behaviors',
    key,
    value,
    metadata
  );
}

export function rememberSecurityChoice(
  key,
  value,
  metadata
) {
  return remember(
    'security_choices',
    key,
    value,
    metadata
  );
}

export function rememberPrivacyChoice(
  key,
  value,
  metadata
) {
  return remember(
    'privacy_choices',
    key,
    value,
    metadata
  );
}

export function rememberAutomationChoice(
  key,
  value,
  metadata
) {
  return remember(
    'automation_choices',
    key,
    value,
    metadata
  );
}

export function rememberConversationContext(
  context
) {
  const memory = readMemory();

  memory.conversation_context = [
    context,
    ...memory.conversation_context,
  ].slice(0, 50);

  return writeMemory(memory);
}

export function getMemorySummary() {
  const memory = readMemory();

  return {
    categories: Object.keys(memory).filter(
      (key) =>
        Array.isArray(memory[key]) ||
        typeof memory[key] === 'object'
    ),
    preference_count: Object.keys(
      memory.preferences
    ).length,
    behavior_count: Object.keys(
      memory.behaviors
    ).length,
    security_count: Object.keys(
      memory.security_choices
    ).length,
    privacy_count: Object.keys(
      memory.privacy_choices
    ).length,
    automation_count: Object.keys(
      memory.automation_choices
    ).length,
    context_count:
      memory.conversation_context.length,
    last_updated: memory.updated_at,
    guest: Boolean(memory.guest),
  };
}

export function getRelevantMemory(
  keywords = []
) {
  const memory = readMemory();
  const terms = keywords.map((item) =>
    String(item).toLowerCase()
  );

  return memory.timeline.filter((item) => {
    const text = [
      item.category,
      item.key,
      item.value,
    ]
      .join(' ')
      .toLowerCase();

    return (
      !terms.length ||
      terms.some((term) => text.includes(term))
    );
  });
}

export function updateMemory(
  category,
  key,
  value,
  metadata
) {
  if (!memoryCategory(category)) {
    throw new Error('Invalid memory category.');
  }

  return remember(
    category,
    key,
    value,
    metadata
  );
}

function memoryCategory(category) {
  return [
    'preferences',
    'behaviors',
    'security_choices',
    'privacy_choices',
    'automation_choices',
  ].includes(category);
}

export function deleteMemory(category, key) {
  const memory = readMemory();

  if (memoryCategory(category)) {
    delete memory[category][key];
  }

  memory.timeline = memory.timeline.filter(
    (item) =>
      item.category !== category ||
      item.key !== key
  );

  return writeMemory(memory);
}

export function clearPersonalMemory() {
  if (!guestMode()) {
    localStorage.removeItem(MEMORY_KEY);
  }

  return {
    ...DEFAULT_MEMORY,
    guest: guestMode(),
  };
}

export function exportMemory() {
  return {
    version: 1,
    exported_at: new Date().toISOString(),
    memory: readMemory(),
  };
}

export function importMemory(packageData) {
  if (!packageData?.memory) {
    throw new Error('Invalid AI memory package.');
  }

  return writeMemory({
    ...DEFAULT_MEMORY,
    ...packageData.memory,
  });
}