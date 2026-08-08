import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const STORAGE_KEYS = {
  conversations: 'aarush_chat_conversations_v2',
  messages: 'aarush_chat_messages_v2',
  drafts: 'aarush_chat_drafts_v2',
  recentSearches: 'aarush_chat_recent_searches_v2',
  savedSearches: 'aarush_chat_saved_searches_v2',
  presence: 'aarush_chat_presence_v2',
  queue: 'aarush_chat_message_queue_v2',
  settings: 'aarush_chat_settings_v2',
};

const MESSAGE_PAGE_SIZE = 50;
const MAX_RECENT_SEARCHES = 20;
const MAX_SAVED_SEARCHES = 30;

function safeRead(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local persistence is best effort.
  }
}

function safeRemove(key) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Local persistence is best effort.
  }
}

function createId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeUsername(value) {
  return String(value || '').replace(/^@/, '').trim();
}

function normalizeConversation(conversation) {
  const username = normalizeUsername(
    conversation.username || conversation.handle
  );

  return {
    id: conversation.id || createId('conversation'),
    username,
    displayName:
      conversation.displayName ||
      conversation.name ||
      username ||
      'Unknown user',
    avatarUrl:
      conversation.avatarUrl ||
      conversation.avatar ||
      `https://i.pravatar.cc/160?u=${username || conversation.id}`,
    verified: Boolean(
      conversation.verified || conversation.isVerified
    ),
    online: Boolean(
      conversation.online || conversation.isOnline
    ),
    lastSeen: conversation.lastSeen || 'recently',
    lastMessage: conversation.lastMessage || '',
    lastMessageType: conversation.lastMessageType || 'text',
    lastMessageAt:
      conversation.lastMessageAt || conversation.updatedAt || nowIso(),
    unreadCount: Number(conversation.unreadCount || 0),
    isGroup: Boolean(conversation.isGroup),
    members: conversation.members || [],
    pinned: Boolean(conversation.pinned),
    muted: Boolean(conversation.muted),
    archived: Boolean(conversation.archived),
    hidden: Boolean(conversation.hidden),
    locked: Boolean(conversation.locked),
    vaulted: Boolean(conversation.vaulted),
    favorite: Boolean(conversation.favorite),
    requested: Boolean(conversation.requested),
    ai: Boolean(conversation.ai),
    typing: Boolean(conversation.typing),
    recording: Boolean(conversation.recording),
    uploading: Boolean(conversation.uploading),
    category: conversation.category || 'Friends',
    privacy: conversation.privacy || {},
    notification: conversation.notification || {},
    metadata: conversation.metadata || {},
  };
}

function normalizeMessage(message, currentUserId) {
  const senderId =
    message.senderId ||
    message.sender?.id ||
    currentUserId;

  return {
    id: message.id || createId('message'),
    clientId: message.clientId || createId('client'),
    chatId: message.chatId || message.conversationId,
    senderId,
    sender: message.sender || null,
    type: message.type || 'text',
    text: message.text || '',
    attachment: message.attachment || message.media || null,
    media: message.media || message.attachment || null,
    voice: message.voice || null,
    replyTo: message.replyTo || null,
    forwardedFrom: message.forwardedFrom || null,
    reactions: message.reactions || [],
    createdAt: message.createdAt || nowIso(),
    updatedAt: message.updatedAt || null,
    timestamp: message.timestamp || message.createdAt || nowIso(),
    status:
      message.status ||
      (senderId === currentUserId ? 'sending' : 'delivered'),
    isEdited: Boolean(message.isEdited),
    editedAt: message.editedAt || null,
    deletedForMe: Boolean(message.deletedForMe),
    deletedForEveryone: Boolean(message.deletedForEveryone),
    pinned: Boolean(message.pinned),
    savedToVault: Boolean(message.savedToVault),
    scheduledAt: message.scheduledAt || null,
    expiresAt: message.expiresAt || null,
    encrypted: Boolean(message.encrypted),
    aiState: message.aiState || '',
    sensitive: Boolean(message.sensitive),
    failed: Boolean(message.failed),
    error: message.error || null,
  };
}

function createDefaultConversations() {
  return [
    normalizeConversation({
      id: '123',
      username: 'aman.satwai',
      displayName: 'Aman Satwai',
      avatarUrl: 'https://i.pravatar.cc/160?u=aman.satwai',
      verified: true,
      online: true,
      lastMessage: 'Let us review the new build.',
      lastMessageAt: nowIso(),
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

function sortConversations(items) {
  return [...items].sort((first, second) => {
    if (first.pinned !== second.pinned) {
      return Number(second.pinned) - Number(first.pinned);
    }

    return (
      new Date(second.lastMessageAt).getTime() -
      new Date(first.lastMessageAt).getTime()
    );
  });
}

function matchesQuery(value, query) {
  return String(value || '')
    .toLowerCase()
    .includes(String(query || '').toLowerCase());
}

function searchItem(item, query) {
  const normalizedQuery = String(query || '')
    .trim()
    .toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    item.id,
    item.username,
    item.displayName,
    item.lastMessage,
    item.category,
    item.isGroup ? 'group' : 'person',
    item.lastMessageType,
  ].some((value) => matchesQuery(value, normalizedQuery));
}

function createDefaultPresence(conversationId) {
  return {
    chatId: conversationId,
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

function useChatSystem(options = {}) {
  const {
    adapter = null,
    currentUserId = 'me',
    pageSize = MESSAGE_PAGE_SIZE,
  } = options;

  const adapterRef = useRef(adapter);
  const mountedRef = useRef(true);
  const realtimeCleanupsRef = useRef(new Map());
  const retryTimerRef = useRef(null);

  const [conversations, setConversations] = useState(() =>
    sortConversations(
      safeRead(
        STORAGE_KEYS.conversations,
        createDefaultConversations()
      ).map(normalizeConversation)
    )
  );

  const [messagesByChatId, setMessagesByChatId] = useState(() =>
    safeRead(STORAGE_KEYS.messages, {})
  );

  const [drafts, setDrafts] = useState(() =>
    safeRead(STORAGE_KEYS.drafts, {})
  );

  const [presenceByChatId, setPresenceByChatId] = useState(() =>
    safeRead(STORAGE_KEYS.presence, {})
  );

  const [messageQueue, setMessageQueue] = useState(() =>
    safeRead(STORAGE_KEYS.queue, [])
  );

  const [recentSearches, setRecentSearches] = useState(() =>
    safeRead(STORAGE_KEYS.recentSearches, [])
  );

  const [savedSearches, setSavedSearches] = useState(() =>
    safeRead(STORAGE_KEYS.savedSearches, [])
  );

  const [settings, setSettings] = useState(() =>
    safeRead(STORAGE_KEYS.settings, {
      invisibleMode: false,
      ghostMode: false,
      stealthMode: false,
      screenshotProtection: false,
      screenRecordingProtection: false,
      shoulderSurfProtection: false,
      emergencyPrivacy: false,
    })
  );

  const [syncState, setSyncState] = useState({
    status: 'local',
    lastSyncedAt: null,
    error: null,
  });

  const [notificationState, setNotificationState] = useState({
    unreadTotal: 0,
    mentions: 0,
    replies: 0,
    voiceMessages: 0,
    aiNotifications: 0,
  });

  useEffect(() => {
    adapterRef.current = adapter;
  }, [adapter]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.conversations, conversations);
  }, [conversations]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.messages, messagesByChatId);
  }, [messagesByChatId]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.drafts, drafts);
  }, [drafts]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.presence, presenceByChatId);
  }, [presenceByChatId]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.queue, messageQueue);
  }, [messageQueue]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.recentSearches, recentSearches);
  }, [recentSearches]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.savedSearches, savedSearches);
  }, [savedSearches]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.settings, settings);
  }, [settings]);

  const getConversation = useCallback(
    (chatId) => {
      if (!chatId) {
        return null;
      }

      return conversations.find(
        (conversation) =>
          String(conversation.id) === String(chatId)
      ) || null;
    },
    [conversations]
  );

  const getConversations = useCallback(
    (filters = {}) => {
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

          if (
            filters.groups === true &&
            !conversation.isGroup
          ) {
            return false;
          }

          if (
            filters.unread === true &&
            conversation.unreadCount <= 0
          ) {
            return false;
          }

          if (
            filters.online === true &&
            !conversation.online
          ) {
            return false;
          }

          if (
            filters.verified === true &&
            !conversation.verified
          ) {
            return false;
          }

          if (
            filters.vault === true &&
            !conversation.vaulted
          ) {
            return false;
          }

          if (
            filters.locked === true &&
            !conversation.locked
          ) {
            return false;
          }

          return true;
        })
      );
    },
    [conversations]
  );

  const createConversation = useCallback(
    async (input = {}) => {
      const conversation = normalizeConversation(input);

      setConversations((current) =>
        sortConversations([
          conversation,
          ...current.filter(
            (item) => item.id !== conversation.id
          ),
        ])
      );

      if (adapterRef.current?.createConversation) {
        try {
          const remote =
            await adapterRef.current.createConversation(
              conversation
            );

          if (remote) {
            const normalized = normalizeConversation(remote);
            setConversations((current) =>
              sortConversations(
                current.map((item) =>
                  item.id === normalized.id
                    ? normalized
                    : item
                )
              )
            );

            return normalized;
          }
        } catch (error) {
          setSyncState({
            status: 'error',
            lastSyncedAt: null,
            error,
          });
        }
      }

      return conversation;
    },
    []
  );

  const deleteConversation = useCallback(async (chatId) => {
    setConversations((current) =>
      current.filter((item) => item.id !== chatId)
    );

    setMessagesByChatId((current) => {
      const next = { ...current };
      delete next[chatId];
      return next;
    });

    setDrafts((current) => {
      const next = { ...current };
      delete next[chatId];
      return next;
    });

    if (adapterRef.current?.deleteConversation) {
      try {
        await adapterRef.current.deleteConversation(chatId);
      } catch (error) {
        setSyncState({
          status: 'error',
          lastSyncedAt: null,
          error,
        });
      }
    }
  }, []);

  const updateConversation = useCallback(
    async (chatId, patch) => {
      setConversations((current) =>
        sortConversations(
          current.map((conversation) =>
            conversation.id === chatId
              ? {
                  ...conversation,
                  ...patch,
                }
              : conversation
          )
        )
      );

      if (adapterRef.current?.updateConversation) {
        try {
          await adapterRef.current.updateConversation(
            chatId,
            patch
          );
        } catch (error) {
          setSyncState({
            status: 'error',
            lastSyncedAt: null,
            error,
          });
        }
      }
    },
    []
  );

  const archiveConversation = useCallback(
    (chatId) => updateConversation(chatId, { archived: true }),
    [updateConversation]
  );

  const unarchiveConversation = useCallback(
    (chatId) => updateConversation(chatId, { archived: false }),
    [updateConversation]
  );

  const pinConversation = useCallback(
    (chatId) => updateConversation(chatId, { pinned: true }),
    [updateConversation]
  );

  const unpinConversation = useCallback(
    (chatId) => updateConversation(chatId, { pinned: false }),
    [updateConversation]
  );

  const muteConversation = useCallback(
    (chatId) => updateConversation(chatId, { muted: true }),
    [updateConversation]
  );

  const unmuteConversation = useCallback(
    (chatId) => updateConversation(chatId, { muted: false }),
    [updateConversation]
  );

  const hideConversation = useCallback(
    (chatId) => updateConversation(chatId, { hidden: true }),
    [updateConversation]
  );

  const lockConversation = useCallback(
    (chatId) => updateConversation(chatId, { locked: true }),
    [updateConversation]
  );

  const moveConversationToVault = useCallback(
    (chatId) =>
      updateConversation(chatId, {
        vaulted: true,
        hidden: true,
      }),
    [updateConversation]
  );

  const restoreConversationFromVault = useCallback(
    (chatId) =>
      updateConversation(chatId, {
        vaulted: false,
        hidden: false,
      }),
    [updateConversation]
  );

  const getMessages = useCallback(
    (chatId, options = {}) => {
      const allMessages = (
        messagesByChatId[chatId] || []
      ).filter((message) => !message.deletedForMe);

      const limit = options.limit || pageSize;
      const before = options.before
        ? new Date(options.before).getTime()
        : null;

      const filtered = before
        ? allMessages.filter(
            (message) =>
              new Date(message.createdAt).getTime() < before
          )
        : allMessages;

      return filtered.slice(-limit);
    },
    [messagesByChatId, pageSize]
  );

  const replaceMessage = useCallback((chatId, message) => {
    setMessagesByChatId((current) => {
      const existing = current[chatId] || [];
      const index = existing.findIndex(
        (item) =>
          item.id === message.id ||
          item.clientId === message.clientId
      );

      if (index === -1) {
        return {
          ...current,
          [chatId]: [...existing, message],
        };
      }

      const next = [...existing];
      next[index] = {
        ...next[index],
        ...message,
      };

      return {
        ...current,
        [chatId]: next,
      };
    });
  }, []);

  const addMessage = useCallback((chatId, message) => {
    setMessagesByChatId((current) => ({
      ...current,
      [chatId]: [
        ...(current[chatId] || []),
        message,
      ],
    }));
  }, []);

  const updateMessage = useCallback(
    (chatId, messageId, patch) => {
      setMessagesByChatId((current) => ({
        ...current,
        [chatId]: (current[chatId] || []).map((message) =>
          message.id === messageId
            ? {
                ...message,
                ...patch,
              }
            : message
        ),
      }));
    },
    []
  );

  const updateConversationPreview = useCallback(
    (chatId, message) => {
      setConversations((current) =>
        sortConversations(
          current.map((conversation) =>
            conversation.id === chatId
              ? {
                  ...conversation,
                  lastMessage: message.text || message.type,
                  lastMessageType: message.type,
                  lastMessageAt: message.createdAt,
                  typing: false,
                  recording: false,
                  uploading: false,
                }
              : conversation
          )
        )
      );
    },
    []
  );

  const sendMessage = useCallback(
    async (chatId, input = {}) => {
      if (!chatId) {
        throw new Error('A valid conversation ID is required.');
      }

      const message = normalizeMessage(
        {
          ...input,
          id: input.id || createId('message'),
          clientId: input.clientId || createId('client'),
          chatId,
          senderId: currentUserId,
          status: 'sending',
          createdAt: nowIso(),
        },
        currentUserId
      );

      addMessage(chatId, message);
      updateConversationPreview(chatId, message);

      const queueItem = {
        id: createId('queue'),
        chatId,
        message,
        attempts: 0,
        createdAt: nowIso(),
      };

      setMessageQueue((current) => [
        ...current,
        queueItem,
      ]);

      if (!adapterRef.current?.sendMessage) {
        window.setTimeout(() => {
          if (!mountedRef.current) {
            return;
          }

          updateMessage(chatId, message.id, {
            status: 'sent',
          });
        }, 250);

        return message;
      }

      try {
        const remoteMessage =
          await adapterRef.current.sendMessage(
            chatId,
            message
          );

        const resolved = normalizeMessage(
          {
            ...message,
            ...(remoteMessage || {}),
            status: 'sent',
          },
          currentUserId
        );

        replaceMessage(chatId, resolved);

        setMessageQueue((current) =>
          current.filter((item) => item.id !== queueItem.id)
        );

        setSyncState({
          status: 'synced',
          lastSyncedAt: nowIso(),
          error: null,
        });

        return resolved;
      } catch (error) {
        updateMessage(chatId, message.id, {
          status: 'failed',
          failed: true,
          error: error.message || 'Message failed',
        });

        setMessageQueue((current) =>
          current.map((item) =>
            item.id === queueItem.id
              ? {
                  ...item,
                  attempts: item.attempts + 1,
                  error: error.message,
                }
              : item
          )
        );

        setSyncState({
          status: 'error',
          lastSyncedAt: null,
          error,
        });

        return {
          ...message,
          status: 'failed',
          failed: true,
        };
      }
    },
    [
      addMessage,
      currentUserId,
      replaceMessage,
      updateConversationPreview,
      updateMessage,
    ]
  );

  const receiveMessage = useCallback(
    (chatId, input = {}) => {
      const message = normalizeMessage(
        {
          ...input,
          chatId,
          senderId: input.senderId || 'remote-user',
          status: input.status || 'delivered',
        },
        currentUserId
      );

      addMessage(chatId, message);
      updateConversationPreview(chatId, message);

      if (message.senderId !== currentUserId) {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === chatId
              ? {
                  ...conversation,
                  unreadCount: conversation.muted
                    ? conversation.unreadCount
                    : conversation.unreadCount + 1,
                }
              : conversation
          )
        );
      }

      return message;
    },
    [addMessage, currentUserId, updateConversationPreview]
  );

  const editMessage = useCallback(
    async (chatId, messageId, text) => {
      const patch = {
        text,
        isEdited: true,
        editedAt: nowIso(),
        updatedAt: nowIso(),
      };

      updateMessage(chatId, messageId, patch);

      if (adapterRef.current?.editMessage) {
        await adapterRef.current.editMessage(
          chatId,
          messageId,
          patch
        );
      }
    },
    [updateMessage]
  );

  const deleteForMe = useCallback(
    async (chatId, messageId) => {
      updateMessage(chatId, messageId, {
        deletedForMe: true,
      });

      if (adapterRef.current?.deleteForMe) {
        await adapterRef.current.deleteForMe(
          chatId,
          messageId
        );
      }
    },
    [updateMessage]
  );

  const deleteForEveryone = useCallback(
    async (chatId, messageId) => {
      updateMessage(chatId, messageId, {
        deletedForEveryone: true,
        text: 'Message deleted',
        type: 'deleted',
      });

      if (adapterRef.current?.deleteForEveryone) {
        await adapterRef.current.deleteForEveryone(
          chatId,
          messageId
        );
      }
    },
    [updateMessage]
  );

  const reactToMessage = useCallback(
    async (chatId, messageId, emoji) => {
      setMessagesByChatId((current) => ({
        ...current,
        [chatId]: (current[chatId] || []).map((message) => {
          if (message.id !== messageId) {
            return message;
          }

          const reactions = Array.isArray(message.reactions)
            ? [...message.reactions]
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

          return {
            ...message,
            reactions,
          };
        }),
      }));

      if (adapterRef.current?.reactToMessage) {
        await adapterRef.current.reactToMessage(
          chatId,
          messageId,
          emoji
        );
      }
    },
    [currentUserId]
  );

  const pinMessage = useCallback(
    async (chatId, messageId) => {
      updateMessage(chatId, messageId, {
        pinned: true,
      });

      if (adapterRef.current?.pinMessage) {
        await adapterRef.current.pinMessage(chatId, messageId);
      }
    },
    [updateMessage]
  );

  const unpinMessage = useCallback(
    async (chatId, messageId) => {
      updateMessage(chatId, messageId, {
        pinned: false,
      });

      if (adapterRef.current?.unpinMessage) {
        await adapterRef.current.unpinMessage(
          chatId,
          messageId
        );
      }
    },
    [updateMessage]
  );

  const replyToMessage = useCallback(
    (chatId, messageId, input = {}) => {
      const original = (
        messagesByChatId[chatId] || []
      ).find((message) => message.id === messageId);

      return {
        ...input,
        replyTo: original || {
          id: messageId,
        },
      };
    },
    [messagesByChatId]
  );

  const forwardMessage = useCallback(
    async (sourceChatId, messageId, targetChatId) => {
      const original = (
        messagesByChatId[sourceChatId] || []
      ).find((message) => message.id === messageId);

      if (!original) {
        throw new Error('Message not found.');
      }

      return sendMessage(targetChatId, {
        ...original,
        id: undefined,
        clientId: undefined,
        forwardedFrom: {
          chatId: sourceChatId,
          messageId,
        },
        status: 'sending',
      });
    },
    [messagesByChatId, sendMessage]
  );

  const scheduleMessage = useCallback(
    async (chatId, input = {}, scheduledAt) => {
      return sendMessage(chatId, {
        ...input,
        status: 'scheduled',
        scheduledAt,
      });
    },
    [sendMessage]
  );

  const markAsRead = useCallback(
    async (chatId, messageId) => {
      if (messageId) {
        updateMessage(chatId, messageId, {
          status: 'read',
        });
      }

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === chatId
            ? {
                ...conversation,
                unreadCount: 0,
              }
            : conversation
        )
      );

      if (adapterRef.current?.markAsRead) {
        await adapterRef.current.markAsRead(
          chatId,
          messageId
        );
      }
    },
    [updateMessage]
  );

  const markAsDelivered = useCallback(
    async (chatId, messageId) => {
      updateMessage(chatId, messageId, {
        status: 'delivered',
      });

      if (adapterRef.current?.markAsDelivered) {
        await adapterRef.current.markAsDelivered(
          chatId,
          messageId
        );
      }
    },
    [updateMessage]
  );

  const markAsSeen = useCallback(
    async (chatId, messageId) => {
      updateMessage(chatId, messageId, {
        status: 'read',
      });

      if (adapterRef.current?.markAsSeen) {
        await adapterRef.current.markAsSeen(
          chatId,
          messageId
        );
      }
    },
    [updateMessage]
  );

  const retryFailedMessage = useCallback(
    async (chatId, messageId) => {
      const message = (
        messagesByChatId[chatId] || []
      ).find((item) => item.id === messageId);

      if (!message) {
        throw new Error('Message not found.');
      }

      updateMessage(chatId, messageId, {
        status: 'sending',
        failed: false,
        error: null,
      });

      return sendMessage(chatId, {
        ...message,
        id: undefined,
        clientId: undefined,
      });
    },
    [messagesByChatId, sendMessage, updateMessage]
  );

  const startRecording = useCallback(
    (chatId) => {
      setPresenceByChatId((current) => ({
        ...current,
        [chatId]: {
          ...(current[chatId] || createDefaultPresence(chatId)),
          recording: true,
          updatedAt: nowIso(),
        },
      }));

      return {
        chatId,
        startedAt: nowIso(),
        state: 'recording',
      };
    },
    []
  );

  const stopRecording = useCallback(
    (chatId) => {
      setPresenceByChatId((current) => ({
        ...current,
        [chatId]: {
          ...(current[chatId] || createDefaultPresence(chatId)),
          recording: false,
          updatedAt: nowIso(),
        },
      }));
    },
    []
  );

  const cancelRecording = useCallback(
    (chatId) => stopRecording(chatId),
    [stopRecording]
  );

  const sendVoiceMessage = useCallback(
    (chatId, payload = {}) =>
      sendMessage(chatId, {
        ...payload,
        type: 'voice',
        text: payload.text || 'Voice message',
        voice: payload.voice || payload,
      }),
    [sendMessage]
  );

  const playVoiceMessage = useCallback(
    (messageId, payload = {}) => {
      if (adapterRef.current?.playVoiceMessage) {
        return adapterRef.current.playVoiceMessage(
          messageId,
          payload
        );
      }

      return {
        messageId,
        state: 'playing',
        ...payload,
      };
    },
    []
  );

  const pauseVoiceMessage = useCallback(
    (messageId, payload = {}) => {
      if (adapterRef.current?.pauseVoiceMessage) {
        return adapterRef.current.pauseVoiceMessage(
          messageId,
          payload
        );
      }

      return {
        messageId,
        state: 'paused',
        ...payload,
      };
    },
    []
  );

  const seekVoiceMessage = useCallback(
    (messageId, currentTime) => {
      if (adapterRef.current?.seekVoiceMessage) {
        return adapterRef.current.seekVoiceMessage(
          messageId,
          currentTime
        );
      }

      return {
        messageId,
        currentTime,
      };
    },
    []
  );

  const setPlaybackSpeed = useCallback(
    (speed) => {
      const safeSpeed = Math.max(
        0.5,
        Math.min(2, Number(speed) || 1)
      );

      safeWrite('aarush_voice_playback_speed', safeSpeed);
      return safeSpeed;
    },
    []
  );

  const transcribeVoiceMessage = useCallback(
    async (messageId, audio) => {
      if (adapterRef.current?.transcribeVoiceMessage) {
        return adapterRef.current.transcribeVoiceMessage(
          messageId,
          audio
        );
      }

      return {
        messageId,
        text: '',
        state: 'pending',
      };
    },
    []
  );

  const uploadMedia = useCallback(
    async (chatId, file, metadata = {}) => {
      if (adapterRef.current?.uploadMedia) {
        return adapterRef.current.uploadMedia(
          chatId,
          file,
          metadata
        );
      }

      return {
        id: createId('media'),
        chatId,
        file,
        metadata,
        status: 'local',
        url:
          typeof URL !== 'undefined'
            ? URL.createObjectURL(file)
            : '',
      };
    },
    []
  );

  const sendMedia = useCallback(
    async (chatId, file, type, metadata = {}) => {
      const upload = await uploadMedia(
        chatId,
        file,
        metadata
      );

      return sendMessage(chatId, {
        type,
        text: metadata.caption || file?.name || type,
        attachment: upload,
        media: upload,
      });
    },
    [sendMessage, uploadMedia]
  );

  const sendImage = useCallback(
    (chatId, file, metadata) =>
      sendMedia(chatId, file, 'image', metadata),
    [sendMedia]
  );

  const sendVideo = useCallback(
    (chatId, file, metadata) =>
      sendMedia(chatId, file, 'video', metadata),
    [sendMedia]
  );

  const sendDocument = useCallback(
    (chatId, file, metadata) =>
      sendMedia(chatId, file, 'document', metadata),
    [sendMedia]
  );

  const sendAudio = useCallback(
    (chatId, file, metadata) =>
      sendMedia(chatId, file, 'audio', metadata),
    [sendMedia]
  );

  const sendLocation = useCallback(
    (chatId, location) =>
      sendMessage(chatId, {
        type: 'location',
        text: location?.placeName || 'Shared location',
        attachment: location,
      }),
    [sendMessage]
  );

  const sendContact = useCallback(
    (chatId, contact) =>
      sendMessage(chatId, {
        type: 'contact',
        text: contact?.displayName || 'Shared contact',
        attachment: contact,
      }),
    [sendMessage]
  );

  const sendGIF = useCallback(
    (chatId, gif) =>
      sendMessage(chatId, {
        type: 'gif',
        text: gif?.title || 'GIF',
        attachment: gif,
      }),
    [sendMessage]
  );

  const sendSticker = useCallback(
    (chatId, sticker) =>
      sendMessage(chatId, {
        type: 'sticker',
        text: sticker?.name || 'Sticker',
        attachment: sticker,
      }),
    [sendMessage]
  );

  const downloadMedia = useCallback(
    async (media, options = {}) => {
      if (adapterRef.current?.downloadMedia) {
        return adapterRef.current.downloadMedia(
          media,
          options
        );
      }

      if (media?.url && typeof document !== 'undefined') {
        const anchor = document.createElement('a');
        anchor.href = media.url;
        anchor.download =
          options.fileName ||
          media.name ||
          `aarush-media-${Date.now()}`;
        anchor.click();
      }

      return {
        status: 'complete',
        media,
        options,
      };
    },
    []
  );

  const saveMediaToVault = useCallback(
    async (media, metadata = {}) => {
      if (adapterRef.current?.saveMediaToVault) {
        return adapterRef.current.saveMediaToVault(
          media,
          metadata
        );
      }

      return {
        status: 'vault-ready',
        media,
        metadata,
      };
    },
    []
  );

  const saveDraft = useCallback((chatId, value) => {
    const text =
      typeof value === 'string'
        ? value
        : value?.text || '';

    setDrafts((current) => ({
      ...current,
      [chatId]: {
        chatId,
        text,
        updatedAt: nowIso(),
      },
    }));

    return text;
  }, []);

  const loadDraft = useCallback(
    (chatId) => drafts[chatId]?.text || '',
    [drafts]
  );

  const restoreDraft = useCallback(
    (chatId) => loadDraft(chatId),
    [loadDraft]
  );

  const clearDraft = useCallback((chatId) => {
    setDrafts((current) => {
      const next = { ...current };
      delete next[chatId];
      return next;
    });
  }, []);

  const searchConversations = useCallback(
    (query, options = {}) => {
      const includeHidden = options.includeHidden === true;
      const includeArchived = options.includeArchived === true;

      return sortConversations(
        conversations.filter((conversation) => {
          if (!includeHidden && conversation.hidden) {
            return false;
          }

          if (!includeArchived && conversation.archived) {
            return false;
          }

          return searchItem(conversation, query);
        })
      );
    },
    [conversations]
  );

  const searchMessages = useCallback(
    (query, chatId) => {
      const source = chatId
        ? {
            [chatId]: messagesByChatId[chatId] || [],
          }
        : messagesByChatId;

      return Object.entries(source).flatMap(
        ([conversationId, messages]) =>
          messages
            .filter((message) => {
              if (message.deletedForMe) {
                return false;
              }

              return [
                message.text,
                message.type,
                message.sender?.displayName,
                message.sender?.username,
              ].some((value) => matchesQuery(value, query));
            })
            .map((message) => ({
              ...message,
              chatId: conversationId,
            }))
      );
    },
    [messagesByChatId]
  );

  const searchUsers = useCallback(
    async (query) => {
      if (adapterRef.current?.searchUsers) {
        return adapterRef.current.searchUsers(query);
      }

      return searchConversations(query).filter(
        (conversation) => !conversation.isGroup
      );
    },
    [searchConversations]
  );

  const searchGroups = useCallback(
    async (query) => {
      if (adapterRef.current?.searchGroups) {
        return adapterRef.current.searchGroups(query);
      }

      return searchConversations(query).filter(
        (conversation) => conversation.isGroup
      );
    },
    [searchConversations]
  );

  const saveSearch = useCallback((value, label = value) => {
    const normalized = String(value || '').trim();

    if (!normalized) {
      return;
    }

    setSavedSearches((current) => {
      const exists = current.some(
        (item) => item.value === normalized
      );

      if (exists) {
        return current;
      }

      return [
        ...current,
        {
          value: normalized,
          label,
          createdAt: nowIso(),
        },
      ].slice(-MAX_SAVED_SEARCHES);
    });
  }, []);

  const removeSearch = useCallback((value) => {
    setSavedSearches((current) =>
      current.filter((item) => item.value !== value)
    );

    setRecentSearches((current) =>
      current.filter((item) => item.value !== value)
    );
  }, []);

  const clearSearchHistory = useCallback(() => {
    setRecentSearches([]);
    safeRemove(STORAGE_KEYS.recentSearches);
  }, []);

  const getRecentSearches = useCallback(
    () => recentSearches,
    [recentSearches]
  );

  const getSavedSearches = useCallback(
    () => savedSearches,
    [savedSearches]
  );

  const recordSearch = useCallback((value) => {
    const normalized = String(value || '').trim();

    if (!normalized) {
      return;
    }

    setRecentSearches((current) => [
      {
        value: normalized,
        createdAt: nowIso(),
      },
      ...current.filter((item) => item.value !== normalized),
    ].slice(0, MAX_RECENT_SEARCHES));
  }, []);

  const setPresence = useCallback((chatId, patch) => {
    setPresenceByChatId((current) => ({
      ...current,
      [chatId]: {
        ...(current[chatId] || createDefaultPresence(chatId)),
        ...patch,
        chatId,
        updatedAt: nowIso(),
      },
    }));
  }, []);

  const setOnline = useCallback(
    (chatId) => {
      setPresence(chatId, {
        state: 'online',
        online: true,
      });
      updateConversation(chatId, {
        online: true,
      });
    },
    [setPresence, updateConversation]
  );

  const setOffline = useCallback(
    (chatId) => {
      setPresence(chatId, {
        state: 'offline',
        online: false,
        lastSeen: nowIso(),
      });
      updateConversation(chatId, {
        online: false,
        lastSeen: 'recently',
      });
    },
    [setPresence, updateConversation]
  );

  const updateLastSeen = useCallback(
    (chatId, lastSeen = nowIso()) => {
      setPresence(chatId, {
        lastSeen,
      });
      updateConversation(chatId, {
        lastSeen,
      });
    },
    [setPresence, updateConversation]
  );

  const setTyping = useCallback(
    (chatId, value = true) => {
      setPresence(chatId, {
        typing: value,
        state: value ? 'typing' : 'idle',
      });
      updateConversation(chatId, {
        typing: value,
      });

      if (adapterRef.current?.setTyping) {
        return adapterRef.current.setTyping(chatId, value);
      }

      return undefined;
    },
    [setPresence, updateConversation]
  );

  const clearTyping = useCallback(
    (chatId) => setTyping(chatId, false),
    [setTyping]
  );

  const setRecording = useCallback(
    (chatId, value = true) => {
      setPresence(chatId, {
        recording: value,
        state: value ? 'recording' : 'idle',
      });
      updateConversation(chatId, {
        recording: value,
      });
    },
    [setPresence, updateConversation]
  );

  const clearRecording = useCallback(
    (chatId) => setRecording(chatId, false),
    [setRecording]
  );

  const getPresence = useCallback(
    (chatId) =>
      presenceByChatId[chatId] ||
      createDefaultPresence(chatId),
    [presenceByChatId]
  );

  const subscribePresence = useCallback(
    (chatId, callback) => {
      if (adapterRef.current?.subscribePresence) {
        const cleanup =
          adapterRef.current.subscribePresence(
            chatId,
            (nextPresence) => {
              setPresence(chatId, nextPresence);
              callback?.(nextPresence);
            }
          );

        realtimeCleanupsRef.current.set(chatId, cleanup);
        return cleanup;
      }

      const listener = (event) => {
        if (event.detail?.chatId !== chatId) {
          return;
        }

        setPresence(chatId, event.detail);
        callback?.(event.detail);
      };

      window.addEventListener(
        'aarush:presence',
        listener
      );

      const cleanup = () =>
        window.removeEventListener(
          'aarush:presence',
          listener
        );

      realtimeCleanupsRef.current.set(chatId, cleanup);
      return cleanup;
    },
    [setPresence]
  );

  const unsubscribePresence = useCallback((chatId) => {
    const cleanup =
      realtimeCleanupsRef.current.get(chatId);

    cleanup?.();
    realtimeCleanupsRef.current.delete(chatId);
  }, []);

  const processQueue = useCallback(async () => {
    if (
      typeof navigator !== 'undefined' &&
      navigator.onLine === false
    ) {
      return;
    }

    const queue = [...messageQueue];

    for (const item of queue) {
      try {
        if (adapterRef.current?.sendMessage) {
          const remoteMessage =
            await adapterRef.current.sendMessage(
              item.chatId,
              item.message
            );

          replaceMessage(
            item.chatId,
            normalizeMessage(
              {
                ...item.message,
                ...(remoteMessage || {}),
                status: 'sent',
              },
              currentUserId
            )
          );
        } else {
          updateMessage(item.chatId, item.message.id, {
            status: 'sent',
            failed: false,
          });
        }

        setMessageQueue((current) =>
          current.filter((queueItem) => queueItem.id !== item.id)
        );
      } catch (error) {
        setMessageQueue((current) =>
          current.map((queueItem) =>
            queueItem.id === item.id
              ? {
                  ...queueItem,
                  attempts: queueItem.attempts + 1,
                  error: error.message,
                }
              : queueItem
          )
        );
      }
    }
  }, [
    currentUserId,
    messageQueue,
    replaceMessage,
    updateMessage,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleOnline = () => {
      processQueue();
    };

    window.addEventListener('online', handleOnline);

    retryTimerRef.current = window.setInterval(
      processQueue,
      15000
    );

    return () => {
      window.removeEventListener('online', handleOnline);

      if (retryTimerRef.current !== null) {
        window.clearInterval(retryTimerRef.current);
      }
    };
  }, [processQueue]);

  const summarizeConversation = useCallback(
    async (chatId) => {
      const messages = getMessages(chatId, {
        limit: 100,
      });

      if (adapterRef.current?.summarizeConversation) {
        return adapterRef.current.summarizeConversation(
          chatId,
          messages
        );
      }

      return {
        chatId,
        summary: messages
          .slice(-5)
          .map((message) => message.text)
          .filter(Boolean)
          .join(' '),
        state: 'local',
      };
    },
    [getMessages]
  );

  const generateConversationSummary = useCallback(
    (chatId) => summarizeConversation(chatId),
    [summarizeConversation]
  );

  const generateReply = useCallback(
    async (chatId, context = {}) => {
      if (adapterRef.current?.generateReply) {
        return adapterRef.current.generateReply(
          chatId,
          context
        );
      }

      return {
        chatId,
        suggestions: [
          'Sounds good.',
          'I will check and get back to you.',
          'Thanks for the update.',
        ],
        state: 'local',
      };
    },
    []
  );

  const rewriteMessage = useCallback(
    async (text, options = {}) => {
      if (adapterRef.current?.rewriteMessage) {
        return adapterRef.current.rewriteMessage(
          text,
          options
        );
      }

      return {
        text,
        state: 'local',
        options,
      };
    },
    []
  );

  const translateMessage = useCallback(
    async (text, language = 'en') => {
      if (adapterRef.current?.translateMessage) {
        return adapterRef.current.translateMessage(
          text,
          language
        );
      }

      return {
        text,
        language,
        state: 'local',
      };
    },
    []
  );

  const changeTone = useCallback(
    async (text, tone) => {
      if (adapterRef.current?.changeTone) {
        return adapterRef.current.changeTone(text, tone);
      }

      return {
        text,
        tone,
        state: 'local',
      };
    },
    []
  );

  const detectScam = useCallback(
    async (text) => {
      if (adapterRef.current?.detectScam) {
        return adapterRef.current.detectScam(text);
      }

      return {
        detected: false,
        confidence: 0,
        state: 'local',
      };
    },
    []
  );

  const detectSpam = useCallback(
    async (text) => {
      if (adapterRef.current?.detectSpam) {
        return adapterRef.current.detectSpam(text);
      }

      return {
        detected: false,
        confidence: 0,
        state: 'local',
      };
    },
    []
  );

  const detectSensitiveInformation = useCallback(
    async (text) => {
      if (adapterRef.current?.detectSensitiveInformation) {
        return adapterRef.current.detectSensitiveInformation(
          text
        );
      }

      return {
        detected: false,
        categories: [],
        state: 'local',
      };
    },
    []
  );

  const suggestPrivacyActions = useCallback(
    async (chatId, context = {}) => {
      if (adapterRef.current?.suggestPrivacyActions) {
        return adapterRef.current.suggestPrivacyActions(
          chatId,
          context
        );
      }

      return {
        chatId,
        suggestions: [],
        state: 'local',
      };
    },
    []
  );

  const suggestFollowUp = useCallback(
    async (chatId) => {
      if (adapterRef.current?.suggestFollowUp) {
        return adapterRef.current.suggestFollowUp(chatId);
      }

      return {
        chatId,
        suggested: false,
        state: 'local',
      };
    },
    []
  );

  const setPrivacySetting = useCallback((key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const filteredConversations = useMemo(
    () =>
      conversations.filter((conversation) => {
        if (settings.emergencyPrivacy) {
          return !conversation.hidden && !conversation.vaulted;
        }

        if (settings.invisibleMode && !conversation.online) {
          return true;
        }

        return true;
      }),
    [conversations, settings.emergencyPrivacy, settings.invisibleMode]
  );

  const currentNotificationState = useMemo(() => {
    const unreadTotal = conversations.reduce(
      (total, conversation) =>
        total + Number(conversation.unreadCount || 0),
      0
    );

    return {
      ...notificationState,
      unreadTotal,
    };
  }, [conversations, notificationState]);

  return useMemo(
    () => ({
      // Core state.
      conversations: filteredConversations,
      currentConversation: null,
      messagesByChatId,
      drafts,
      messageQueue,
      presenceByChatId,
      recentSearches,
      savedSearches,
      settings,
      syncState,
      notificationState: currentNotificationState,

      // Conversation API.
      getConversations,
      getConversation,
      createConversation,
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
      updateConversation,

      // Message API.
      getMessages,
      sendMessage,
      receiveMessage,
      editMessage,
      deleteForMe,
      deleteForEveryone,
      reactToMessage,
      pinMessage,
      unpinMessage,
      replyToMessage,
      forwardMessage,
      scheduleMessage,
      markAsRead,
      markAsDelivered,
      markAsSeen,
      retryFailedMessage,

      // Voice API.
      startRecording,
      stopRecording,
      cancelRecording,
      sendVoiceMessage,
      playVoiceMessage,
      pauseVoiceMessage,
      seekVoiceMessage,
      seekVoiceMessage: seekVoiceMessage,
      setPlaybackSpeed,
      transcribeVoiceMessage,

      // Media API.
      uploadMedia,
      downloadMedia,
      saveMediaToVault,
      sendImage,
      sendVideo,
      sendDocument,
      sendAudio,
      sendLocation,
      sendContact,
      sendGIF,
      sendSticker,

      // Draft API.
      saveDraft,
      loadDraft,
      clearDraft,
      restoreDraft,

      // Search API.
      searchConversations,
      searchMessages,
      searchUsers,
      searchGroups,
      saveSearch,
      removeSearch,
      clearSearchHistory,
      getRecentSearches,
      getSavedSearches,
      recordSearch,

      // Presence and typing API.
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

      // Queue and sync API.
      processQueue,

      // AI API.
      summarizeConversation,
      generateConversationSummary,
      generateReply,
      rewriteMessage,
      translateMessage,
      changeTone,
      detectScam,
      detectSpam,
      detectSensitiveInformation,
      suggestPrivacyActions,
      suggestFollowUp,

      // Privacy API.
      setPrivacySetting,

      // Future adapter access.
      adapter: adapterRef.current,
    }),
    [
      adapter,
      archiveConversation,
      cancelRecording,
      changeTone,
      clearDraft,
      clearSearchHistory,
      clearRecording,
      clearTyping,
      createConversation,
      currentNotificationState,
      deleteConversation,
      deleteForEveryone,
      deleteForMe,
      detectScam,
      detectSensitiveInformation,
      detectSpam,
      downloadMedia,
      drafts,
      editMessage,
      filteredConversations,
      forwardMessage,
      generateConversationSummary,
      generateReply,
      getConversation,
      getConversations,
      getMessages,
      getPresence,
      getRecentSearches,
      getSavedSearches,
      hideConversation,
      lockConversation,
      loadDraft,
      markAsDelivered,
      markAsRead,
      markAsSeen,
      messageQueue,
      messagesByChatId,
      moveConversationToVault,
      muteConversation,
      pauseVoiceMessage,
      pinConversation,
      pinMessage,
      playVoiceMessage,
      processQueue,
      reactToMessage,
      receiveMessage,
      recordSearch,
      removeSearch,
      replyToMessage,
      restoreConversationFromVault,
      restoreDraft,
      retryFailedMessage,
      saveDraft,
      saveMediaToVault,
      saveSearch,
      scheduleMessage,
      searchConversations,
      searchGroups,
      searchMessages,
      searchUsers,
      seekVoiceMessage,
      sendAudio,
      sendContact,
      sendDocument,
      sendGIF,
      sendImage,
      sendLocation,
      sendMedia,
      sendMessage,
      sendSticker,
      sendVideo,
      sendVoiceMessage,
      setOffline,
      setOnline,
      setPlaybackSpeed,
      setPrivacySetting,
      setRecording,
      setTyping,
      settings,
      startRecording,
      stopRecording,
      suggestFollowUp,
      suggestPrivacyActions,
      summarizeConversation,
      syncState,
      transcribeVoiceMessage,
      translateMessage,
      unarchiveConversation,
      unmuteConversation,
      unpinConversation,
      unpinMessage,
      unpinConversation,
      unpinMessage,
      updateConversation,
      updateLastSeen,
      writeSpeed,
    ]
  );
}

export default useChatSystem;