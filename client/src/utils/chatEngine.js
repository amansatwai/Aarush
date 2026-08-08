/**
 * Aarush Chat Engine
 *
 * Backend-agnostic messaging service layer.
 *
 * Responsibilities:
 * - Conversations and message lifecycle.
 * - Local persistence and offline queueing.
 * - Drafts, search, presence, notifications, privacy, and AI adapters.
 * - Media and voice service boundaries.
 * - Supabase Realtime-ready adapter integration without hardcoded table names.
 *
 * The engine does not render UI and does not import React.
 * Connect Supabase, Storage, Realtime, Presence, Broadcast, Postgres Changes,
 * or Edge Functions by passing an adapter to createChatEngine().
 */

const STORAGE_KEYS = {
  conversations: 'aarush_chat_engine_conversations_v2',
  messages: 'aarush_chat_engine_messages_v2',
  drafts: 'aarush_chat_engine_drafts_v2',
  recentSearches: 'aarush_chat_engine_recent_searches_v2',
  savedSearches: 'aarush_chat_engine_saved_searches_v2',
  presence: 'aarush_chat_engine_presence_v2',
  notifications: 'aarush_chat_engine_notifications_v2',
  settings: 'aarush_chat_engine_settings_v2',
  queue: 'aarush_chat_engine_offline_queue_v2',
  mediaCache: 'aarush_chat_engine_media_cache_v2',
};

const DEFAULT_PAGE_SIZE = 50;
const MAX_RECENT_SEARCHES = 20;
const MAX_SAVED_SEARCHES = 50;
const MAX_QUEUE_RETRIES = 8;

const DEFAULT_SETTINGS = {
  playbackSpeed: 1,
  lastOpenedConversation: null,
  ghostMode: false,
  stealthMode: false,
  screenshotProtection: false,
  screenRecordingProtection: false,
  shoulderSurfProtection: false,
  emergencyPrivacy: false,
};

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readStorage(key, fallback) {
  const storage = getStorage();

  if (!storage) {
    return fallback;
  }

  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeStorage(key) {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function createId(prefix = 'id') {
  const random =
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${prefix}-${Date.now()}-${random}`;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeUsername(value) {
  return String(value || '').replace(/^@/, '').trim();
}

function toError(error, fallbackCode = 'CHAT_ENGINE_ERROR') {
  if (error && error.code && error.message) {
    return {
      ok: false,
      code: error.code,
      message: error.message,
      cause: error,
    };
  }

  return {
    ok: false,
    code: fallbackCode,
    message:
      error?.message ||
      String(error) ||
      'An unexpected chat error occurred.',
    cause: error,
  };
}

function success(data, meta = {}) {
  return {
    ok: true,
    data,
    ...meta,
  };
}

function failure(error, code) {
  return toError(error, code);
}

function normalizeConversation(input = {}) {
  const username = normalizeUsername(
    input.username || input.handle
  );

  return {
    id: input.id || createId('conversation'),
    username,
    displayName:
      input.displayName ||
      input.name ||
      username ||
      'Unknown user',
    avatarUrl:
      input.avatarUrl ||
      input.avatar ||
      `https://i.pravatar.cc/160?u=${username || input.id}`,
    verified: Boolean(input.verified || input.isVerified),
    online: Boolean(input.online || input.isOnline),
    lastSeen: input.lastSeen || 'recently',
    lastMessage: input.lastMessage || '',
    lastMessageType: input.lastMessageType || 'text',
    lastMessageAt:
      input.lastMessageAt ||
      input.updatedAt ||
      nowIso(),
    unreadCount: Number(input.unreadCount || 0),
    isGroup: Boolean(input.isGroup),
    members: input.members || [],
    admins: input.admins || [],
    pinned: Boolean(input.pinned),
    muted: Boolean(input.muted),
    archived: Boolean(input.archived),
    hidden: Boolean(input.hidden),
    locked: Boolean(input.locked),
    vaulted: Boolean(input.vaulted),
    favorite: Boolean(input.favorite),
    requested: Boolean(input.requested),
    ai: Boolean(input.ai),
    typing: Boolean(input.typing),
    recording: Boolean(input.recording),
    uploading: Boolean(input.uploading),
    category: input.category || 'Friends',
    privacy: input.privacy || {},
    notification: input.notification || {},
    metadata: input.metadata || {},
  };
}

function normalizeMessage(input = {}, currentUserId = 'me') {
  const senderId =
    input.senderId ||
    input.sender?.id ||
    currentUserId;

  return {
    id: input.id || createId('message'),
    clientId: input.clientId || createId('client'),
    chatId: input.chatId || input.conversationId,
    senderId,
    sender: input.sender || null,
    type: input.type || 'text',
    text: input.text || '',
    attachment: input.attachment || input.media || null,
    media: input.media || input.attachment || null,
    voice: input.voice || null,
    replyTo: input.replyTo || null,
    forwardedFrom: input.forwardedFrom || null,
    reactions: input.reactions || [],
    createdAt: input.createdAt || nowIso(),
    updatedAt: input.updatedAt || null,
    timestamp: input.timestamp || input.createdAt || nowIso(),
    status:
      input.status ||
      (senderId === currentUserId ? 'sending' : 'delivered'),
    isEdited: Boolean(input.isEdited),
    editedAt: input.editedAt || null,
    deletedForMe: Boolean(input.deletedForMe),
    deletedForEveryone: Boolean(input.deletedForEveryone),
    pinned: Boolean(input.pinned),
    savedToVault: Boolean(input.savedToVault),
    scheduledAt: input.scheduledAt || null,
    expiresAt: input.expiresAt || null,
    encrypted: Boolean(input.encrypted),
    aiState: input.aiState || '',
    sensitive: Boolean(input.sensitive),
    failed: Boolean(input.failed),
    error: input.error || null,
  };
}

function sortConversations(conversations) {
  return [...conversations].sort((first, second) => {
    if (first.pinned !== second.pinned) {
      return Number(second.pinned) - Number(first.pinned);
    }

    return (
      new Date(second.lastMessageAt).getTime() -
      new Date(first.lastMessageAt).getTime()
    );
  });
}

function matches(value, query) {
  return String(value || '')
    .toLowerCase()
    .includes(String(query || '').toLowerCase());
}

function matchesSearch(item, query) {
  const normalized = String(query || '').trim();

  if (!normalized) {
    return true;
  }

  return [
    item.id,
    item.username,
    item.displayName,
    item.lastMessage,
    item.category,
    item.lastMessageType,
    item.isGroup ? 'group' : 'person',
  ].some((value) => matches(value, normalized));
}

function getDefaultConversations() {
  return [
    normalizeConversation({
      id: '123',
      username: 'aman.satwai',
      displayName: 'Aman Satwai',
      avatarUrl: 'https://i.pravatar.cc/160?u=aman.satwai',
      verified: true,
      online: true,
      lastMessage: 'Let us review the new build.',
      unreadCount: 2,
      pinned: true,
      favorite: true,
    }),
    normalizeConversation({
      id: '124',
      username: 'aarush.team',
      displayName: 'Aarush Team',
      avatarUrl: 'https://i.pravatar.cc/160?u=aarush.team',
      verified: true,
      online: true,
      isGroup: true,
      category: 'Groups',
      lastMessage: 'Build review at 8 PM.',
      unreadCount: 8,
    }),
    normalizeConversation({
      id: '125',
      username: 'design.loop',
      displayName: 'Design Loop',
      avatarUrl: 'https://i.pravatar.cc/160?u=design.loop',
      lastMessage: 'The mockups are ready.',
      lastMessageType: 'image',
      muted: true,
      category: 'Creators',
    }),
  ];
}

function createDefaultPresence(chatId) {
  return {
    chatId,
    state: 'offline',
    online: false,
    lastSeen: null,
    typing: false,
    recording: false,
    uploading: false,
    invisible: false,
    updatedAt: nowIso(),
  };
}

function createLocalEngine(options = {}) {
  const {
    adapter = {},
    currentUserId = 'me',
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  let conversations = readStorage(
    STORAGE_KEYS.conversations,
    getDefaultConversations()
  ).map(normalizeConversation);

  let messages = readStorage(STORAGE_KEYS.messages, {});
  let drafts = readStorage(STORAGE_KEYS.drafts, {});
  let recentSearches = readStorage(
    STORAGE_KEYS.recentSearches,
    []
  );
  let savedSearches = readStorage(
    STORAGE_KEYS.savedSearches,
    []
  );
  let presence = readStorage(STORAGE_KEYS.presence, {});
  let notifications = readStorage(
    STORAGE_KEYS.notifications,
    []
  );
  let settings = {
    ...DEFAULT_SETTINGS,
    ...readStorage(STORAGE_KEYS.settings, {}),
  };
  let queue = readStorage(STORAGE_KEYS.queue, {});
  let mediaCache = readStorage(STORAGE_KEYS.mediaCache, {});

  const listeners = new Set();
  const presenceCleanups = new Map();

  function emit(event, payload) {
    listeners.forEach((listener) => {
      try {
        listener(event, payload);
      } catch {
        // Listener errors must not break the engine.
      }
    });
  }

  function persist() {
    writeStorage(
      STORAGE_KEYS.conversations,
      conversations
    );
    writeStorage(STORAGE_KEYS.messages, messages);
    writeStorage(STORAGE_KEYS.drafts, drafts);
    writeStorage(
      STORAGE_KEYS.recentSearches,
      recentSearches
    );
    writeStorage(STORAGE_KEYS.savedSearches, savedSearches);
    writeStorage(STORAGE_KEYS.presence, presence);
    writeStorage(STORAGE_KEYS.notifications, notifications);
    writeStorage(STORAGE_KEYS.settings, settings);
    writeStorage(STORAGE_KEYS.queue, queue);
    writeStorage(STORAGE_KEYS.mediaCache, mediaCache);
  }

  function subscribe(listener) {
    listeners.add(listener);

    return () => listeners.delete(listener);
  }

  function getConversation(chatId) {
    return (
      conversations.find(
        (conversation) =>
          String(conversation.id) === String(chatId)
      ) || null
    );
  }

  function getConversations(filters = {}) {
    return sortConversations(
      conversations.filter((conversation) => {
        if (
          filters.includeHidden !== true &&
          conversation.hidden
        ) {
          return false;
        }

        if (
          filters.includeArchived !== true &&
          conversation.archived
        ) {
          return false;
        }

        if (filters.groups && !conversation.isGroup) {
          return false;
        }

        if (filters.unread && conversation.unreadCount <= 0) {
          return false;
        }

        if (filters.online && !conversation.online) {
          return false;
        }

        if (filters.verified && !conversation.verified) {
          return false;
        }

        if (filters.locked && !conversation.locked) {
          return false;
        }

        if (filters.vault && !conversation.vaulted) {
          return false;
        }

        return true;
      })
    );
  }

  async function createConversation(input = {}) {
    try {
      const local = normalizeConversation(input);

      conversations = sortConversations([
        local,
        ...conversations.filter(
          (conversation) => conversation.id !== local.id
        ),
      ]);

      persist();
      emit('conversation:created', local);

      if (adapter.createConversation) {
        const remote = await adapter.createConversation(local);

        if (remote) {
          const normalized = normalizeConversation(remote);
          conversations = sortConversations(
            conversations.map((conversation) =>
              conversation.id === normalized.id
                ? normalized
                : conversation
            )
          );
          persist();
          emit('conversation:updated', normalized);
          return success(normalized);
        }
      }

      return success(local, { source: 'local' });
    } catch (error) {
      return failure(error, 'CREATE_CONVERSATION_FAILED');
    }
  }

  async function updateConversation(chatId, patch = {}) {
    const current = getConversation(chatId);

    if (!current) {
      return failure(
        new Error('Conversation not found.'),
        'CONVERSATION_NOT_FOUND'
      );
    }

    try {
      const updated = normalizeConversation({
        ...current,
        ...patch,
        id: chatId,
      });

      conversations = sortConversations(
        conversations.map((conversation) =>
          conversation.id === chatId
            ? updated
            : conversation
        )
      );

      persist();
      emit('conversation:updated', updated);

      if (adapter.updateConversation) {
        await adapter.updateConversation(chatId, patch);
      }

      return success(updated);
    } catch (error) {
      return failure(error, 'UPDATE_CONVERSATION_FAILED');
    }
  }

  async function deleteConversation(chatId) {
    const current = getConversation(chatId);

    if (!current) {
      return failure(
        new Error('Conversation not found.'),
        'CONVERSATION_NOT_FOUND'
      );
    }

    conversations = conversations.filter(
      (conversation) => conversation.id !== chatId
    );
    delete messages[chatId];
    delete drafts[chatId];
    delete presence[chatId];

    persist();
    emit('conversation:deleted', { chatId });

    try {
      if (adapter.deleteConversation) {
        await adapter.deleteConversation(chatId);
      }

      return success({ chatId });
    } catch (error) {
      return failure(error, 'DELETE_CONVERSATION_FAILED');
    }
  }

  const conversationAction = (field, value) =>
    async (chatId) =>
      updateConversation(chatId, {
        [field]: value,
      });

  const archiveConversation = conversationAction(
    'archived',
    true
  );
  const unarchiveConversation = conversationAction(
    'archived',
    false
  );
  const pinConversation = conversationAction('pinned', true);
  const unpinConversation = conversationAction('pinned', false);
  const muteConversation = conversationAction('muted', true);
  const unmuteConversation = conversationAction('muted', false);
  const hideConversation = conversationAction('hidden', true);
  const lockConversation = conversationAction('locked', true);

  async function moveConversationToVault(chatId) {
    return updateConversation(chatId, {
      vaulted: true,
      hidden: true,
    });
  }

  async function restoreConversationFromVault(chatId) {
    return updateConversation(chatId, {
      vaulted: false,
      hidden: false,
    });
  }

  function getMessages(chatId, options = {}) {
    const limit = options.limit || pageSize;
    const source = messages[chatId] || [];

    const filtered = source.filter(
      (message) => !message.deletedForMe
    );

    if (options.before) {
      const before = new Date(options.before).getTime();

      return filtered
        .filter(
          (message) =>
            new Date(message.createdAt).getTime() < before
        )
        .slice(-limit);
    }

    return filtered.slice(-limit);
  }

  function replaceMessage(chatId, message) {
    const source = messages[chatId] || [];
    const index = source.findIndex(
      (item) =>
        item.id === message.id ||
        item.clientId === message.clientId
    );

    if (index === -1) {
      messages[chatId] = [...source, message];
    } else {
      const next = [...source];
      next[index] = {
        ...next[index],
        ...message,
      };
      messages[chatId] = next;
    }

    persist();
    emit('message:updated', message);
  }

  function updateMessage(chatId, messageId, patch) {
    messages[chatId] = (messages[chatId] || []).map(
      (message) =>
        message.id === messageId
          ? {
              ...message,
              ...patch,
            }
          : message
    );

    persist();
    emit('message:updated', {
      chatId,
      messageId,
      patch,
    });
  }

  function updateConversationPreview(chatId, message) {
    conversations = sortConversations(
      conversations.map((conversation) =>
        conversation.id === chatId
          ? {
              ...conversation,
              lastMessage:
                message.text || message.type || '',
              lastMessageType: message.type,
              lastMessageAt: message.createdAt,
              typing: false,
              recording: false,
              uploading: false,
            }
          : conversation
      )
    );

    persist();
  }

  async function sendMessage(chatId, input = {}) {
    if (!getConversation(chatId)) {
      return failure(
        new Error('Conversation not found.'),
        'CONVERSATION_NOT_FOUND'
      );
    }

    const message = normalizeMessage(
      {
        ...input,
        chatId,
        senderId: currentUserId,
        status: 'sending',
        createdAt: nowIso(),
      },
      currentUserId
    );

    messages[chatId] = [
      ...(messages[chatId] || []),
      message,
    ];
    updateConversationPreview(chatId, message);

    queue[message.clientId] = {
      id: message.clientId,
      chatId,
      message,
      attempts: 0,
      createdAt: nowIso(),
    };

    persist();
    emit('message:sending', message);

    if (!adapter.sendMessage) {
      window.setTimeout(() => {
        markAsSent(chatId, message.id);
      }, 250);

      return success(message, {
        source: 'local',
        optimistic: true,
      });
    }

    try {
      const remote = await adapter.sendMessage(
        chatId,
        message
      );

      const resolved = normalizeMessage(
        {
          ...message,
          ...(remote || {}),
          status: 'sent',
        },
        currentUserId
      );

      replaceMessage(chatId, resolved);
      delete queue[message.clientId];
      persist();
      emit('message:sent', resolved);

      return success(resolved);
    } catch (error) {
      updateMessage(chatId, message.id, {
        status: 'failed',
        failed: true,
        error: error.message,
      });
      persist();
      emit('message:failed', {
        message,
        error,
      });

      return failure(error, 'SEND_MESSAGE_FAILED');
    }
  }

  function receiveMessage(chatId, input = {}) {
    const message = normalizeMessage(
      {
        ...input,
        chatId,
        senderId: input.senderId || 'remote-user',
        status: input.status || 'delivered',
      },
      currentUserId
    );

    messages[chatId] = [
      ...(messages[chatId] || []),
      message,
    ];
    updateConversationPreview(chatId, message);

    if (message.senderId !== currentUserId) {
      conversations = conversations.map((conversation) =>
        conversation.id === chatId
          ? {
              ...conversation,
              unreadCount: conversation.muted
                ? conversation.unreadCount
                : conversation.unreadCount + 1,
            }
          : conversation
      );
    }

    persist();
    emit('message:received', message);

    return success(message);
  }

  async function editMessage(chatId, messageId, text) {
    const patch = {
      text: String(text || ''),
      isEdited: true,
      editedAt: nowIso(),
      updatedAt: nowIso(),
    };

    updateMessage(chatId, messageId, patch);

    try {
      if (adapter.editMessage) {
        await adapter.editMessage(chatId, messageId, patch);
      }

      return success({
        chatId,
        messageId,
        ...patch,
      });
    } catch (error) {
      return failure(error, 'EDIT_MESSAGE_FAILED');
    }
  }

  async function deleteForMe(chatId, messageId) {
    updateMessage(chatId, messageId, {
      deletedForMe: true,
    });

    try {
      if (adapter.deleteForMe) {
        await adapter.deleteForMe(chatId, messageId);
      }

      return success({ chatId, messageId });
    } catch (error) {
      return failure(error, 'DELETE_FOR_ME_FAILED');
    }
  }

  async function deleteForEveryone(chatId, messageId) {
    updateMessage(chatId, messageId, {
      deletedForEveryone: true,
      type: 'deleted',
      text: 'Message deleted',
    });

    try {
      if (adapter.deleteForEveryone) {
        await adapter.deleteForEveryone(
          chatId,
          messageId
        );
      }

      return success({ chatId, messageId });
    } catch (error) {
      return failure(error, 'DELETE_FOR_EVERYONE_FAILED');
    }
  }

  async function reactToMessage(chatId, messageId, emoji) {
    const source = getMessages(chatId, {
      limit: Number.MAX_SAFE_INTEGER,
    });
    const target = source.find(
      (message) => message.id === messageId
    );

    if (!target) {
      return failure(
        new Error('Message not found.'),
        'MESSAGE_NOT_FOUND'
      );
    }

    const reactions = Array.isArray(target.reactions)
      ? [...target.reactions]
      : [];

    const existing = reactions.find(
      (reaction) => reaction.emoji === emoji
    );

    if (existing) {
      existing.count = (existing.count || 1) + 1;
    } else {
      reactions.push({
        emoji,
        count: 1,
        userIds: [currentUserId],
      });
    }

    updateMessage(chatId, messageId, {
      reactions,
    });

    try {
      if (adapter.reactToMessage) {
        await adapter.reactToMessage(
          chatId,
          messageId,
          emoji
        );
      }

      return success({
        chatId,
        messageId,
        reactions,
      });
    } catch (error) {
      return failure(error, 'REACTION_FAILED');
    }
  }

  async function removeReaction(chatId, messageId, emoji) {
    const source = getMessages(chatId, {
      limit: Number.MAX_SAFE_INTEGER,
    });
    const target = source.find(
      (message) => message.id === messageId
    );

    if (!target) {
      return failure(
        new Error('Message not found.'),
        'MESSAGE_NOT_FOUND'
      );
    }

    const reactions = (target.reactions || [])
      .map((reaction) =>
        reaction.emoji === emoji
          ? {
              ...reaction,
              count: Math.max(0, (reaction.count || 1) - 1),
            }
          : reaction
      )
      .filter((reaction) => reaction.count > 0);

    updateMessage(chatId, messageId, {
      reactions,
    });

    if (adapter.removeReaction) {
      await adapter.removeReaction(
        chatId,
        messageId,
        emoji
      );
    }

    return success({
      chatId,
      messageId,
      reactions,
    });
  }

  function replyToMessage(chatId, messageId, input = {}) {
    const original = getMessages(chatId, {
      limit: Number.MAX_SAFE_INTEGER,
    }).find((message) => message.id === messageId);

    return {
      ...input,
      chatId,
      replyTo: original || { id: messageId },
    };
  }

  async function forwardMessage(
    sourceChatId,
    messageId,
    targetChatId
  ) {
    const original = getMessages(sourceChatId, {
      limit: Number.MAX_SAFE_INTEGER,
    }).find((message) => message.id === messageId);

    if (!original) {
      return failure(
        new Error('Message not found.'),
        'MESSAGE_NOT_FOUND'
      );
    }

    return sendMessage(targetChatId, {
      ...original,
      id: undefined,
      clientId: undefined,
      forwardedFrom: {
        chatId: sourceChatId,
        messageId,
      },
    });
  }

  async function scheduleMessage(
    chatId,
    input = {},
    scheduledAt
  ) {
    return sendMessage(chatId, {
      ...input,
      status: 'scheduled',
      scheduledAt,
    });
  }

  async function cancelScheduledMessage(chatId, messageId) {
    updateMessage(chatId, messageId, {
      status: 'cancelled',
      scheduledAt: null,
    });

    if (adapter.cancelScheduledMessage) {
      await adapter.cancelScheduledMessage(
        chatId,
        messageId
      );
    }

    return success({ chatId, messageId });
  }

  async function markMessageStatus(
    chatId,
    messageId,
    status,
    adapterMethod
  ) {
    updateMessage(chatId, messageId, { status });

    try {
      if (adapter[adapterMethod]) {
        await adapter[adapterMethod](chatId, messageId);
      }

      return success({ chatId, messageId, status });
    } catch (error) {
      return failure(error, `${status.toUpperCase()}_FAILED`);
    }
  }

  const markAsSent = (chatId, messageId) =>
    markMessageStatus(
      chatId,
      messageId,
      'sent',
      'markAsSent'
    );

  const markAsDelivered = (chatId, messageId) =>
    markMessageStatus(
      chatId,
      messageId,
      'delivered',
      'markAsDelivered'
    );

  const markAsRead = async (chatId, messageId) => {
    if (messageId) {
      updateMessage(chatId, messageId, {
        status: 'read',
      });
    }

    conversations = conversations.map((conversation) =>
      conversation.id === chatId
        ? {
            ...conversation,
            unreadCount: 0,
          }
        : conversation
    );

    persist();

    return markMessageStatus(
      chatId,
      messageId,
      'read',
      'markAsRead'
    );
  };

  const markAsSeen = (chatId, messageId) =>
    markMessageStatus(
      chatId,
      messageId,
      'read',
      'markAsSeen'
    );

  async function retryMessage(chatId, messageId) {
    const original = getMessages(chatId, {
      limit: Number.MAX_SAFE_INTEGER,
    }).find((message) => message.id === messageId);

    if (!original) {
      return failure(
        new Error('Message not found.'),
        'MESSAGE_NOT_FOUND'
      );
    }

    updateMessage(chatId, messageId, {
      status: 'sending',
      failed: false,
      error: null,
    });

    return sendMessage(chatId, {
      ...original,
      id: undefined,
      clientId: undefined,
      status: 'sending',
    });
  }

  async function expireMessage(chatId, messageId) {
    updateMessage(chatId, messageId, {
      status: 'expired',
      type: 'expired',
      text: 'Message expired',
    });

    if (adapter.expireMessage) {
      await adapter.expireMessage(chatId, messageId);
    }

    return success({ chatId, messageId });
  }

  function generateWaveform(input, length = 48) {
    if (Array.isArray(input) && input.length > 0) {
      return input.map((value) =>
        Math.max(0.12, Math.min(1, Number(value) || 0.12))
      );
    }

    return Array.from({ length }, (_, index) => {
      const wave = Math.sin(index * 1.35) * 0.28;
      const variation = ((index * 17) % 31) / 100;

      return Math.max(
        0.15,
        Math.min(1, 0.5 + wave + variation)
      );
    });
  }

  async function createVoiceMessage(chatId, input = {}) {
    return normalizeMessage(
      {
        ...input,
        chatId,
        type: 'voice',
        text: input.text || 'Voice message',
        voice: {
          ...input.voice,
          waveform: generateWaveform(input.waveform),
        },
      },
      currentUserId
    );
  }

  async function uploadVoiceMessage(chatId, file, metadata) {
    const upload = await uploadMedia(
      chatId,
      file,
      metadata
    );

    return success({
      ...upload.data,
      type: 'voice',
    });
  }

  async function playVoiceMessage(messageId, options = {}) {
    if (adapter.playVoiceMessage) {
      return adapter.playVoiceMessage(messageId, options);
    }

    return success({
      messageId,
      state: 'playing',
      ...options,
    });
  }

  async function pauseVoiceMessage(messageId, options = {}) {
    if (adapter.pauseVoiceMessage) {
      return adapter.pauseVoiceMessage(messageId, options);
    }

    return success({
      messageId,
      state: 'paused',
      ...options,
    });
  }

  async function resumeVoiceMessage(messageId, options = {}) {
    if (adapter.resumeVoiceMessage) {
      return adapter.resumeVoiceMessage(messageId, options);
    }

    return success({
      messageId,
      state: 'playing',
      ...options,
    });
  }

  async function seekVoiceMessage(messageId, currentTime) {
    if (adapter.seekVoiceMessage) {
      return adapter.seekVoiceMessage(
        messageId,
        currentTime
      );
    }

    return success({
      messageId,
      currentTime,
    });
  }

  function setPlaybackSpeed(speed) {
    const value = Math.max(
      0.5,
      Math.min(2, Number(speed) || 1)
    );

    settings = {
      ...settings,
      playbackSpeed: value,
    };

    persist();
    emit('voice:speed-changed', value);

    return success(value);
  }

  async function transcribeVoiceMessage(messageId, audio) {
    if (adapter.transcribeVoiceMessage) {
      return adapter.transcribeVoiceMessage(
        messageId,
        audio
      );
    }

    return success({
      messageId,
      text: '',
      state: 'pending',
    });
  }

  async function reduceNoise(audio, options = {}) {
    if (adapter.reduceNoise) {
      return adapter.reduceNoise(audio, options);
    }

    return success({
      audio,
      state: 'adapter-ready',
      options,
    });
  }

  async function enhanceVoice(audio, options = {}) {
    if (adapter.enhanceVoice) {
      return adapter.enhanceVoice(audio, options);
    }

    return success({
      audio,
      state: 'adapter-ready',
      options,
    });
  }

  async function uploadMedia(chatId, file, metadata = {}) {
    try {
      if (adapter.uploadMedia) {
        return success(
          await adapter.uploadMedia(
            chatId,
            file,
            metadata
          )
        );
      }

      const localUrl =
        typeof URL !== 'undefined' && file
          ? URL.createObjectURL(file)
          : '';

      return success({
        id: createId('media'),
        chatId,
        file,
        metadata,
        url: localUrl,
        status: 'local',
      });
    } catch (error) {
      return failure(error, 'UPLOAD_MEDIA_FAILED');
    }
  }

  const uploadTypedMedia = (type) =>
    async (chatId, file, metadata = {}) => {
      const result = await uploadMedia(
        chatId,
        file,
        metadata
      );

      if (!result.ok) {
        return result;
      }

      return success({
        ...result.data,
        type,
      });
    };

  const uploadImage = uploadTypedMedia('image');
  const uploadVideo = uploadTypedMedia('video');
  const uploadAudio = uploadTypedMedia('audio');
  const uploadDocument = uploadTypedMedia('document');
  const uploadLocation = uploadTypedMedia('location');
  const uploadContact = uploadTypedMedia('contact');
  const uploadGIF = uploadTypedMedia('gif');
  const uploadSticker = uploadTypedMedia('sticker');

  async function downloadMedia(media, options = {}) {
    try {
      if (adapter.downloadMedia) {
        return success(
          await adapter.downloadMedia(media, options)
        );
      }

      if (media?.url && typeof document !== 'undefined') {
        const anchor = document.createElement('a');
        anchor.href = media.url;
        anchor.download =
          options.fileName ||
          media.fileName ||
          media.name ||
          `aarush-media-${Date.now()}`;
        anchor.click();
      }

      return success({
        media,
        options,
        status: 'complete',
      });
    } catch (error) {
      return failure(error, 'DOWNLOAD_MEDIA_FAILED');
    }
  }

  async function cacheMedia(key, media) {
    mediaCache[key] = {
      media,
      cachedAt: nowIso(),
    };

    persist();

    if (adapter.cacheMedia) {
      await adapter.cacheMedia(key, media);
    }

    return success(media);
  }

  async function saveMediaToVault(media, metadata = {}) {
    if (adapter.saveMediaToVault) {
      return success(
        await adapter.saveMediaToVault(media, metadata)
      );
    }

    return success({
      media,
      metadata,
      status: 'vault-ready',
    });
  }

  async function restoreMediaFromVault(mediaId) {
    if (adapter.restoreMediaFromVault) {
      return success(
        await adapter.restoreMediaFromVault(mediaId)
      );
    }

    return success({
      mediaId,
      status: 'restore-ready',
    });
  }

  function searchConversations(query, options = {}) {
    const includeHidden = options.includeHidden === true;
    const includeArchived =
      options.includeArchived === true;

    return sortConversations(
      conversations.filter((conversation) => {
        if (!includeHidden && conversation.hidden) {
          return false;
        }

        if (!includeArchived && conversation.archived) {
          return false;
        }

        return matchesSearch(conversation, query);
      })
    );
  }

  function searchMessages(query, chatId) {
    const source = chatId
      ? {
          [chatId]: messages[chatId] || [],
        }
      : messages;

    return Object.entries(source).flatMap(
      ([conversationId, items]) =>
        items
          .filter((message) => {
            if (message.deletedForMe) {
              return false;
            }

            return [
              message.text,
              message.type,
              message.sender?.displayName,
              message.sender?.username,
            ].some((value) => matches(value, query));
          })
          .map((message) => ({
            ...message,
            chatId: conversationId,
          }))
    );
  }

  async function searchUsers(query) {
    if (adapter.searchUsers) {
      return success(await adapter.searchUsers(query));
    }

    return success(
      searchConversations(query).filter(
        (conversation) => !conversation.isGroup
      )
    );
  }

  async function searchGroups(query) {
    if (adapter.searchGroups) {
      return success(await adapter.searchGroups(query));
    }

    return success(
      searchConversations(query).filter(
        (conversation) => conversation.isGroup
      )
    );
  }

  function searchMedia(query, chatId) {
    return searchMessages(query, chatId).filter((message) =>
      [
        'image',
        'video',
        'audio',
        'voice',
        'gif',
        'sticker',
      ].includes(message.type)
    );
  }

  function searchFiles(query, chatId) {
    return searchMessages(query, chatId).filter((message) =>
      ['file', 'document', 'pdf', 'archive'].includes(
        message.type
      )
    );
  }

  function searchLinks(query, chatId) {
    return searchMessages(query, chatId).filter(
      (message) => message.type === 'link'
    );
  }

  function saveSearch(value, label = value) {
    const normalized = String(value || '').trim();

    if (!normalized) {
      return failure(
        new Error('Search value is required.'),
        'INVALID_SEARCH'
      );
    }

    const exists = savedSearches.some(
      (item) => item.value === normalized
    );

    if (!exists) {
      savedSearches = [
        ...savedSearches,
        {
          value: normalized,
          label,
          createdAt: nowIso(),
        },
      ].slice(-MAX_SAVED_SEARCHES);
      persist();
    }

    return success(normalized);
  }

  function removeSearch(value) {
    savedSearches = savedSearches.filter(
      (item) => item.value !== value
    );
    recentSearches = recentSearches.filter(
      (item) => item.value !== value
    );
    persist();

    return success(value);
  }

  function clearSearchHistory() {
    recentSearches = [];
    persist();
    return success(true);
  }

  function getRecentSearches() {
    return [...recentSearches];
  }

  function getSavedSearches() {
    return [...savedSearches];
  }

  function recordSearch(value) {
    const normalized = String(value || '').trim();

    if (!normalized) {
      return success(false);
    }

    recentSearches = [
      {
        value: normalized,
        createdAt: nowIso(),
      },
      ...recentSearches.filter(
        (item) => item.value !== normalized
      ),
    ].slice(0, MAX_RECENT_SEARCHES);

    persist();

    return success(normalized);
  }

  function saveDraft(chatId, value) {
    const text =
      typeof value === 'string'
        ? value
        : value?.text || '';

    drafts[chatId] = {
      chatId,
      text,
      updatedAt: nowIso(),
    };

    persist();
    emit('draft:updated', drafts[chatId]);

    return success(drafts[chatId]);
  }

  function loadDraft(chatId) {
    return success(drafts[chatId] || null);
  }

  function clearDraft(chatId) {
    delete drafts[chatId];
    persist();
    emit('draft:cleared', { chatId });

    return success({ chatId });
  }

  function restoreDraft(chatId) {
    return loadDraft(chatId);
  }

  async function syncDrafts() {
    if (!adapter.syncDrafts) {
      return success(drafts, { source: 'local' });
    }

    try {
      const remote = await adapter.syncDrafts(drafts);
      drafts = {
        ...drafts,
        ...(remote || {}),
      };
      persist();

      return success(drafts);
    } catch (error) {
      return failure(error, 'SYNC_DRAFTS_FAILED');
    }
  }

  function getPresence(chatId) {
    return (
      presence[chatId] ||
      createDefaultPresence(chatId)
    );
  }

  function updatePresence(chatId, patch) {
    presence[chatId] = {
      ...getPresence(chatId),
      ...patch,
      chatId,
      updatedAt: nowIso(),
    };

    persist();
    emit('presence:updated', presence[chatId]);

    return success(presence[chatId]);
  }

  async function setOnline(chatId) {
    const result = updatePresence(chatId, {
      state: 'online',
      online: true,
    });

    await updateConversation(chatId, {
      online: true,
    });

    if (adapter.setOnline) {
      await adapter.setOnline(chatId);
    }

    return result;
  }

  async function setOffline(chatId) {
    const result = updatePresence(chatId, {
      state: 'offline',
      online: false,
      lastSeen: nowIso(),
    });

    await updateConversation(chatId, {
      online: false,
      lastSeen: 'recently',
    });

    if (adapter.setOffline) {
      await adapter.setOffline(chatId);
    }

    return result;
  }

  async function updateLastSeen(chatId, lastSeen = nowIso()) {
    const result = updatePresence(chatId, {
      lastSeen,
    });

    await updateConversation(chatId, {
      lastSeen,
    });

    if (adapter.updateLastSeen) {
      await adapter.updateLastSeen(chatId, lastSeen);
    }

    return result;
  }

  async function setTyping(chatId, value = true) {
    const result = updatePresence(chatId, {
      typing: value,
      state: value ? 'typing' : 'idle',
    });

    await updateConversation(chatId, {
      typing: value,
    });

    if (adapter.setTyping) {
      await adapter.setTyping(chatId, value);
    }

    return result;
  }

  const clearTyping = (chatId) => setTyping(chatId, false);

  async function setRecording(chatId, value = true) {
    const result = updatePresence(chatId, {
      recording: value,
      state: value ? 'recording' : 'idle',
    });

    await updateConversation(chatId, {
      recording: value,
    });

    if (adapter.setRecording) {
      await adapter.setRecording(chatId, value);
    }

    return result;
  }

  const clearRecording = (chatId) =>
    setRecording(chatId, false);

  async function updateActivity(chatId, activity = {}) {
    const result = updatePresence(chatId, {
      ...activity,
      lastActivityAt: nowIso(),
    });

    if (adapter.updateActivity) {
      await adapter.updateActivity(chatId, activity);
    }

    return result;
  }

  function subscribePresence(chatId, callback) {
    if (adapter.subscribePresence) {
      const cleanup = adapter.subscribePresence(
        chatId,
        (nextPresence) => {
          updatePresence(chatId, nextPresence);
          callback?.(nextPresence);
        }
      );

      presenceCleanups.set(chatId, cleanup);
      return cleanup;
    }

    if (typeof window === 'undefined') {
      return () => {};
    }

    const listener = (event) => {
      if (event.detail?.chatId !== chatId) {
        return;
      }

      updatePresence(chatId, event.detail);
      callback?.(event.detail);
    };

    window.addEventListener(
      'aarush:chat-presence',
      listener
    );

    const cleanup = () =>
      window.removeEventListener(
        'aarush:chat-presence',
        listener
      );

    presenceCleanups.set(chatId, cleanup);

    return cleanup;
  }

  function unsubscribePresence(chatId) {
    const cleanup = presenceCleanups.get(chatId);
    cleanup?.();
    presenceCleanups.delete(chatId);

    if (adapter.unsubscribePresence) {
      return adapter.unsubscribePresence(chatId);
    }

    return success({ chatId });
  }

  function notifyMessage(payload) {
    const notification = {
      id: createId('notification'),
      type: 'message',
      createdAt: nowIso(),
      ...payload,
    };

    notifications = [notification, ...notifications].slice(
      0,
      100
    );
    persist();
    emit('notification:message', notification);

    return success(notification);
  }

  const notifyMention = (payload) =>
    notifyMessage({ ...payload, type: 'mention' });

  const notifyReply = (payload) =>
    notifyMessage({ ...payload, type: 'reply' });

  const notifyReaction = (payload) =>
    notifyMessage({ ...payload, type: 'reaction' });

  const notifyVoiceMessage = (payload) =>
    notifyMessage({ ...payload, type: 'voice' });

  const notifyMedia = (payload) =>
    notifyMessage({ ...payload, type: 'media' });

  const notifyPriorityConversation = (payload) =>
    notifyMessage({ ...payload, type: 'priority' });

  async function muteNotifications(chatId) {
    const result = await muteConversation(chatId);

    return result;
  }

  async function unmuteNotifications(chatId) {
    const result = await unmuteConversation(chatId);

    return result;
  }

  function applyGhostMode(value = true, chatId) {
    if (chatId) {
      return updateConversation(chatId, {
        privacy: {
          ...(getConversation(chatId)?.privacy || {}),
          ghostMode: value,
        },
      });
    }

    settings = {
      ...settings,
      ghostMode: value,
    };
    persist();

    return success(value);
  }

  function applyStealthMode(value = true, chatId) {
    if (chatId) {
      return updateConversation(chatId, {
        privacy: {
          ...(getConversation(chatId)?.privacy || {}),
          stealthMode: value,
        },
      });
    }

    settings = {
      ...settings,
      stealthMode: value,
    };
    persist();

    return success(value);
  }

  const applyHiddenChat = (chatId, value = true) =>
    updateConversation(chatId, { hidden: value });

  const applyLockedChat = (chatId, value = true) =>
    updateConversation(chatId, { locked: value });

  const applyVaultChat = (chatId, value = true) =>
    updateConversation(chatId, {
      vaulted: value,
      hidden: value,
    });

  function applyScreenshotProtection(value = true) {
    settings = {
      ...settings,
      screenshotProtection: value,
    };
    persist();

    return success(value);
  }

  function applyScreenRecordingProtection(value = true) {
    settings = {
      ...settings,
      screenRecordingProtection: value,
    };
    persist();

    return success(value);
  }

  function applyShoulderSurfProtection(value = true) {
    settings = {
      ...settings,
      shoulderSurfProtection: value,
    };
    persist();

    return success(value);
  }

  function applyEmergencyPrivacy(value = true) {
    settings = {
      ...settings,
      emergencyPrivacy: value,
    };
    persist();

    return success(value);
  }

  function sanitizeNotification(payload = {}) {
    if (
      settings.stealthMode ||
      settings.ghostMode ||
      settings.emergencyPrivacy
    ) {
      return {
        ...payload,
        title: 'New Aarush message',
        body: 'Open Aarush to view this message.',
        sensitive: true,
      };
    }

    return payload;
  }

  function redactSensitiveContent(value, options = {}) {
    if (
      !value ||
      options.enabled === false
    ) {
      return value;
    }

    if (
      settings.emergencyPrivacy ||
      settings.shoulderSurfProtection ||
      options.force
    ) {
      return String(value).replace(/\S/g, '•');
    }

    return value;
  }

  async function aiCall(method, payload, fallback) {
    if (adapter[method]) {
      try {
        return success(
          await adapter[method](payload)
        );
      } catch (error) {
        return failure(error, `AI_${method.toUpperCase()}_FAILED`);
      }
    }

    return success(
      typeof fallback === 'function'
        ? fallback(payload)
        : fallback
    );
  }

  const summarizeConversation = (chatId) =>
    aiCall(
      'summarizeConversation',
      { chatId, messages: getMessages(chatId) },
      {
        chatId,
        summary: getMessages(chatId)
          .map((message) => message.text)
          .filter(Boolean)
          .slice(-5)
          .join(' '),
        state: 'adapter-ready',
      }
    );

  const generateReply = (chatId, context = {}) =>
    aiCall(
      'generateReply',
      { chatId, context },
      {
        chatId,
        suggestions: [
          'Sounds good.',
          'I will check and get back to you.',
          'Thanks for the update.',
        ],
        state: 'adapter-ready',
      }
    );

  const rewriteMessage = (text, options = {}) =>
    aiCall(
      'rewriteMessage',
      { text, options },
      { text, options, state: 'adapter-ready' }
    );

  const translateMessage = (text, language = 'en') =>
    aiCall(
      'translateMessage',
      { text, language },
      { text, language, state: 'adapter-ready' }
    );

  const changeTone = (text, tone) =>
    aiCall(
      'changeTone',
      { text, tone },
      { text, tone, state: 'adapter-ready' }
    );

  const detectScam = (text) =>
    aiCall(
      'detectScam',
      { text },
      { detected: false, confidence: 0 }
    );

  const detectSpam = (text) =>
    aiCall(
      'detectSpam',
      { text },
      { detected: false, confidence: 0 }
    );

  const detectSensitiveInformation = (text) =>
    aiCall(
      'detectSensitiveInformation',
      { text },
      { detected: false, categories: [] }
    );

  const classifyConversation = (chatId) =>
    aiCall(
      'classifyConversation',
      { chatId, messages: getMessages(chatId) },
      { category: 'unknown', confidence: 0 }
    );

  const suggestPrivacyActions = (chatId, context = {}) =>
    aiCall(
      'suggestPrivacyActions',
      { chatId, context },
      { suggestions: [] }
    );

  const generateConversationInsights = (chatId) =>
    aiCall(
      'generateConversationInsights',
      { chatId, messages: getMessages(chatId) },
      { insights: [] }
    );

  const predictNextReply = (chatId, context = {}) =>
    aiCall(
      'predictNextReply',
      { chatId, context },
      { predictions: [] }
    );

  async function syncConversations() {
    if (!adapter.syncConversations) {
      return success(conversations, { source: 'local' });
    }

    try {
      const remote = await adapter.syncConversations();

      conversations = sortConversations(
        (remote || []).map(normalizeConversation)
      );
      persist();

      return success(conversations);
    } catch (error) {
      return failure(error, 'SYNC_CONVERSATIONS_FAILED');
    }
  }

  async function syncMessages(chatId, options = {}) {
    if (!adapter.syncMessages) {
      return success(getMessages(chatId, options), {
        source: 'local',
      });
    }

    try {
      const remote = await adapter.syncMessages(
        chatId,
        options
      );

      messages[chatId] = (remote || []).map((item) =>
        normalizeMessage(item, currentUserId)
      );
      persist();

      return success(messages[chatId]);
    } catch (error) {
      return failure(error, 'SYNC_MESSAGES_FAILED');
    }
  }

  async function syncMedia(options = {}) {
    if (!adapter.syncMedia) {
      return success(true, { source: 'local' });
    }

    try {
      return success(await adapter.syncMedia(options));
    } catch (error) {
      return failure(error, 'SYNC_MEDIA_FAILED');
    }
  }

  async function syncReadReceipts(chatId) {
    if (!adapter.syncReadReceipts) {
      return success(true, { source: 'local' });
    }

    try {
      return success(
        await adapter.syncReadReceipts(chatId)
      );
    } catch (error) {
      return failure(error, 'SYNC_READ_RECEIPTS_FAILED');
    }
  }

  async function syncPresence(chatId) {
    if (!adapter.syncPresence) {
      return success(getPresence(chatId), {
        source: 'local',
      });
    }

    try {
      const remote = await adapter.syncPresence(chatId);
      presence[chatId] = {
        ...getPresence(chatId),
        ...(remote || {}),
      };
      persist();

      return success(presence[chatId]);
    } catch (error) {
      return failure(error, 'SYNC_PRESENCE_FAILED');
    }
  }

  async function syncReactions(chatId) {
    if (!adapter.syncReactions) {
      return success(true, { source: 'local' });
    }

    try {
      return success(
        await adapter.syncReactions(chatId)
      );
    } catch (error) {
      return failure(error, 'SYNC_REACTIONS_FAILED');
    }
  }

  function mergeLocalAndRemote(local, remote, key = 'id') {
    const merged = new Map();

    [...(local || []), ...(remote || [])].forEach((item) => {
      const itemKey = item?.[key];

      if (!itemKey) {
        return;
      }

      merged.set(itemKey, {
        ...(merged.get(itemKey) || {}),
        ...item,
      });
    });

    return [...merged.values()];
  }

  function resolveConflicts(local, remote, options = {}) {
    const key = options.key || 'id';
    const merged = mergeLocalAndRemote(local, remote, key);

    return {
      items: merged,
      conflicts: [],
      strategy: options.strategy || 'last-write-wins',
    };
  }

  async function syncQueue() {
    const items = Object.values(queue);

    for (const item of items) {
      if (item.attempts >= MAX_QUEUE_RETRIES) {
        continue;
      }

      const result = await sendMessage(
        item.chatId,
        item.message
      );

      if (result.ok) {
        delete queue[item.id];
      } else {
        queue[item.id] = {
          ...item,
          attempts: item.attempts + 1,
          lastError: result,
        };
      }
    }

    persist();

    return success(Object.values(queue));
  }

  const engine = {
    // Lifecycle.
    subscribe,
    persist,
    getState: () => ({
      conversations,
      messages,
      drafts,
      presence,
      queue,
      recentSearches,
      savedSearches,
      settings,
      notifications,
    }),

    // Conversations.
    createConversation,
    getConversation,
    getConversations,
    updateConversation,
    deleteConversation,
    archiveConversation,
    unarchiveConversation,
    pinConversation,
    unpinConversation,
    muteConversation,
    unmuteConversation,
    hideConversation,
    lockConversation,
    moveConversationToVault,
    restoreConversationFromVault,

    // Messages.
    getMessages,
    sendMessage,
    receiveMessage,
    editMessage,
    deleteForMe,
    deleteForEveryone,
    reactToMessage,
    removeReaction,
    replyToMessage,
    forwardMessage,
    scheduleMessage,
    cancelScheduledMessage,
    markAsSent,
    markAsDelivered,
    markAsRead,
    markAsSeen,
    retryMessage,
    expireMessage,

    // Voice.
    createVoiceMessage,
    uploadVoiceMessage,
    playVoiceMessage,
    pauseVoiceMessage,
    resumeVoiceMessage,
    seekVoiceMessage,
    setPlaybackSpeed,
    transcribeVoiceMessage,
    generateWaveform,
    reduceNoise,
    enhanceVoice,

    // Media.
    uploadMedia,
    uploadImage,
    uploadVideo,
    uploadAudio,
    uploadDocument,
    uploadLocation,
    uploadContact,
    uploadGIF,
    uploadSticker,
    downloadMedia,
    cacheMedia,
    saveMediaToVault,
    restoreMediaFromVault,

    // Search.
    searchConversations,
    searchMessages,
    searchUsers,
    searchGroups,
    searchMedia,
    searchFiles,
    searchLinks,
    saveSearch,
    removeSearch,
    clearSearchHistory,
    getRecentSearches,
    getSavedSearches,
    recordSearch,

    // Drafts.
    saveDraft,
    loadDraft,
    clearDraft,
    restoreDraft,
    syncDrafts,

    // Presence.
    setOnline,
    setOffline,
    updateLastSeen,
    setTyping,
    clearTyping,
    setRecording,
    clearRecording,
    getPresence,
    subscribePresence,
    unsubscribePresence,
    updateActivity,

    // Notifications.
    notifyMessage,
    notifyMention,
    notifyReply,
    notifyReaction,
    notifyVoiceMessage,
    notifyMedia,
    notifyPriorityConversation,
    muteNotifications,
    unmuteNotifications,
    sanitizeNotification,

    // Privacy.
    applyGhostMode,
    applyStealthMode,
    applyHiddenChat,
    applyLockedChat,
    applyVaultChat,
    applyScreenshotProtection,
    applyScreenRecordingProtection,
    applyShoulderSurfProtection,
    applyEmergencyPrivacy,
    redactSensitiveContent,

    // AI.
    summarizeConversation,
    generateReply,
    rewriteMessage,
    translateMessage,
    changeTone,
    detectScam,
    detectSpam,
    detectSensitiveInformation,
    classifyConversation,
    suggestPrivacyActions,
    generateConversationInsights,
    predictNextReply,

    // Sync.
    syncConversations,
    syncMessages,
    syncDrafts,
    syncMedia,
    syncReadReceipts,
    syncPresence,
    syncReactions,
    resolveConflicts,
    mergeLocalAndRemote,
    syncQueue,

    // Adapter access.
    adapter,
  };

  return engine;
}

export function createChatEngine(options = {}) {
  return createLocalEngine(options);
}

export const chatEngine = createChatEngine();

export const {
  subscribe,
  persist,
  getState,
  createConversation,
  getConversation,
  getConversations,
  updateConversation,
  deleteConversation,
  archiveConversation,
  unarchiveConversation,
  pinConversation,
  unpinConversation,
  muteConversation,
  unmuteConversation,
  hideConversation,
  lockConversation,
  moveConversationToVault,
  restoreConversationFromVault,
  getMessages,
  sendMessage,
  receiveMessage,
  editMessage,
  deleteForMe,
  deleteForEveryone,
  reactToMessage,
  removeReaction,
  replyToMessage,
  forwardMessage,
  scheduleMessage,
  cancelScheduledMessage,
  markAsSent,
  markAsDelivered,
  markAsRead,
  markAsSeen,
  retryMessage,
  expireMessage,
  createVoiceMessage,
  uploadVoiceMessage,
  playVoiceMessage,
  pauseVoiceMessage,
  resumeVoiceMessage,
  seekVoiceMessage,
  setPlaybackSpeed,
  transcribeVoiceMessage,
  generateWaveform,
  reduceNoise,
  enhanceVoice,
  uploadMedia,
  uploadImage,
  uploadVideo,
  uploadAudio,
  uploadDocument,
  uploadLocation,
  uploadContact,
  uploadGIF,
  uploadSticker,
  downloadMedia,
  cacheMedia,
  saveMediaToVault,
  restoreMediaFromVault,
  searchConversations,
  searchMessages,
  searchUsers,
  searchGroups,
  searchMedia,
  searchFiles,
  searchLinks,
  saveSearch,
  removeSearch,
  clearSearchHistory,
  getRecentSearches,
  getSavedSearches,
  recordSearch,
  saveDraft,
  loadDraft,
  clearDraft,
  restoreDraft,
  syncDrafts,
  setOnline,
  setOffline,
  updateLastSeen,
  setTyping,
  clearTyping,
  setRecording,
  clearRecording,
  getPresence,
  subscribePresence,
  unsubscribePresence,
  updateActivity,
  notifyMessage,
  notifyMention,
  notifyReply,
  notifyReaction,
  notifyVoiceMessage,
  notifyMedia,
  notifyPriorityConversation,
  muteNotifications,
  unmuteNotifications,
  sanitizeNotification,
  applyGhostMode,
  applyStealthMode,
  applyHiddenChat,
  applyLockedChat,
  applyVaultChat,
  applyScreenshotProtection,
  applyScreenRecordingProtection,
  applyShoulderSurfProtection,
  applyEmergencyPrivacy,
  redactSensitiveContent,
  summarizeConversation,
  generateReply,
  rewriteMessage,
  translateMessage,
  changeTone,
  detectScam,
  detectSpam,
  detectSensitiveInformation,
  classifyConversation,
  suggestPrivacyActions,
  generateConversationInsights,
  predictNextReply,
  syncConversations,
  syncMessages,
  syncMedia,
  syncReadReceipts,
  syncPresence,
  syncReactions,
  resolveConflicts,
  mergeLocalAndRemote,
  syncQueue,
} = chatEngine;

export default chatEngine;