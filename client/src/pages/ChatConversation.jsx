import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  File,
  Image as ImageIcon,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Play,
  Send,
  Smile,
  Trash2,
  UserRound,
  Video,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import {
  createPresenceChannel,
  createTypingChannel,
  deleteMessageForEveryone,
  editMessage,
  getConversation,
  getMessages,
  markConversationRead,
  sendMessage,
  subscribeToConversation,
} from '../utils/chatEngine';

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
};

const PAGE_SIZE = 50;
const NEAR_BOTTOM_DISTANCE = 180;

function isGuestMode() {
  return (
    window.localStorage.getItem(GUEST_KEYS.isGuest) === 'true' &&
    window.localStorage.getItem(GUEST_KEYS.guestSession) !== null
  );
}

function getProfile(participant) {
  return participant?.profiles || participant?.profile || {};
}

function getOtherParticipant(conversation, userId) {
  const participants =
    conversation?.conversation_participants || [];

  return (
    participants.find(
      (participant) => participant.user_id !== userId
    ) ||
    participants[0] ||
    null
  );
}

function getConversationName(conversation, userId) {
  const participants =
    conversation?.conversation_participants || [];

  if (participants.length > 2) {
    return 'Group conversation';
  }

  const profile = getProfile(
    getOtherParticipant(conversation, userId)
  );

  return profile.full_name || profile.username || 'Aarush User';
}

function getConversationUsername(conversation, userId) {
  const profile = getProfile(
    getOtherParticipant(conversation, userId)
  );

  if (!profile.username) {
    return '';
  }

  return profile.username.startsWith('@')
    ? profile.username
    : `@${profile.username}`;
}

function getConversationAvatar(conversation, userId) {
  const profile = getProfile(
    getOtherParticipant(conversation, userId)
  );

  return profile.avatar_url || '';
}

function formatTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatLastActive(value) {
  if (!value) {
    return 'Last active unavailable';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Last active unavailable';
  }

  return `Last active ${date.toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

function normalizeMessage(message) {
  return {
    ...message,
    profile: message.profile || message.profiles || {},
  };
}

function MessageMedia({ message }) {
  if (message.message_type === 'image') {
    return (
      <div style={styles.mediaPlaceholder}>
        <ImageIcon size={20} />
        <span>{message.content || 'Image message'}</span>
      </div>
    );
  }

  if (message.message_type === 'video') {
    return (
      <div style={styles.mediaPlaceholder}>
        <Video size={20} />
        <span>{message.content || 'Video message'}</span>
        <Play size={14} fill="currentColor" />
      </div>
    );
  }

  if (message.message_type === 'audio') {
    return (
      <div style={styles.mediaPlaceholder}>
        <Mic size={20} />
        <span>{message.content || 'Voice message'}</span>
      </div>
    );
  }

  return (
    <div style={styles.mediaPlaceholder}>
      <File size={20} />
      <span>{message.content || 'File message'}</span>
    </div>
  );
}

function MessageSkeleton({ own = false }) {
  return (
    <div
      style={{
        ...styles.skeletonRow,
        justifyContent: own ? 'flex-end' : 'flex-start',
      }}
    >
      <span
        style={{
          ...styles.skeletonBubble,
          width: own ? '55%' : '68%',
        }}
      />
    </div>
  );
}

function MessageBubble({
  message,
  own,
  editing,
  editValue,
  menuOpen,
  onEditValue,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onToggleMenu,
}) {
  const isDeleted = message.deleted_for_everyone;

  return (
    <div
      style={{
        ...styles.messageRow,
        justifyContent: own ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          ...styles.messageGroup,
          alignItems: own ? 'flex-end' : 'flex-start',
        }}
      >
        <div
          style={{
            ...styles.messageBubble,
            ...(own
              ? styles.ownMessageBubble
              : styles.otherMessageBubble),
          }}
        >
          {menuOpen && !isDeleted ? (
            <div style={styles.messageMenu}>
              {own && message.message_type === 'text' ? (
                <button
                  type="button"
                  onClick={() => onStartEdit(message)}
                  style={styles.menuButton}
                >
                  <Pencil size={13} />
                  Edit
                </button>
              ) : null}

              {own ? (
                <button
                  type="button"
                  onClick={() => onDelete(message.id)}
                  style={{
                    ...styles.menuButton,
                    color: '#ffb1c8',
                  }}
                >
                  <Trash2 size={13} />
                  Delete for everyone
                </button>
              ) : null}
            </div>
          ) : null}

          {!isDeleted ? (
            <button
              type="button"
              onClick={() => onToggleMenu(message.id)}
              style={styles.messageMenuTrigger}
              aria-label="Message actions"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal size={14} />
            </button>
          ) : null}

          {editing ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSaveEdit(message.id);
              }}
              style={styles.editForm}
            >
              <input
                value={editValue}
                onChange={(event) =>
                  onEditValue(event.target.value)
                }
                autoFocus
                style={styles.editInput}
                aria-label="Edit message"
              />

              <div style={styles.editActions}>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  style={styles.smallButton}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!editValue.trim()}
                  style={styles.smallPrimaryButton}
                >
                  Save
                </button>
              </div>
            </form>
          ) : isDeleted ? (
            <span style={styles.deletedMessage}>
              Message deleted
            </span>
          ) : message.message_type === 'text' ? (
            <p style={styles.messageText}>{message.content}</p>
          ) : (
            <MessageMedia message={message} />
          )}

          <div style={styles.messageFooter}>
            <span>{formatTime(message.created_at)}</span>

            {message.edited_at && !isDeleted ? (
              <span>Edited</span>
            ) : null}

            {own ? (
              <span style={styles.receiptIcon}>
                {message.read ? (
                  <CheckCheck size={13} color="#4dd7ff" />
                ) : message.delivered ? (
                  <CheckCheck size={13} />
                ) : (
                  <Check size={13} />
                )}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatConversation() {
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const typingChannelRef = useRef(null);
  const presenceChannelRef = useRef(null);
  const typingTimerRef = useRef(null);
  const loadingOlderRef = useRef(false);
  const mountedRef = useRef(true);
  const nearBottomRef = useRef(true);

  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);
  const [conversation, setConversation] =
    useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] =
    useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [hasOlder, setHasOlder] = useState(true);
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const [lastActive, setLastActive] = useState(null);
  const [menuMessageId, setMenuMessageId] =
    useState(null);
  const [editingMessageId, setEditingMessageId] =
    useState(null);
  const [editValue, setEditValue] = useState('');
  const [pullDistance, setPullDistance] = useState(0);
  const pullStartRef = useRef(null);

  const conversationName = useMemo(
    () => getConversationName(conversation, user?.id),
    [conversation, user?.id]
  );

  const conversationUsername = useMemo(
    () =>
      getConversationUsername(
        conversation,
        user?.id
      ),
    [conversation, user?.id]
  );

  const conversationAvatar = useMemo(
    () =>
      getConversationAvatar(
        conversation,
        user?.id
      ),
    [conversation, user?.id]
  );

  const otherParticipantId = useMemo(() => {
    const participant = getOtherParticipant(
      conversation,
      user?.id
    );

    return participant?.user_id || null;
  }, [conversation, user?.id]);

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2800);
  }, []);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const node = scrollRef.current;

    if (!node) {
      return;
    }

    node.scrollTo({
      top: node.scrollHeight,
      behavior,
    });
  }, []);

  const isNearBottom = useCallback(() => {
    const node = scrollRef.current;

    if (!node) {
      return true;
    }

    return (
      node.scrollHeight -
        node.scrollTop -
        node.clientHeight <
      NEAR_BOTTOM_DISTANCE
    );
  }, []);

  const markRead = useCallback(async () => {
    if (!user || !conversationId || guest) {
      return;
    }

    try {
      await markConversationRead(conversationId);

      setMessages((current) =>
        current.map((message) =>
          message.sender_id !== user.id
            ? {
                ...message,
                read: true,
              }
            : message
        )
      );
    } catch {
      // Read receipts are best effort.
    }
  }, [conversationId, guest, user]);

  const loadConversation = useCallback(async () => {
    if (guest) {
      setLoading(false);
      return;
    }

    try {
      const data = await getConversation(conversationId);

      if (!data) {
        throw new Error('Conversation not found.');
      }

      setConversation(data);
    } catch (loadError) {
      setError(
        loadError.message ||
          'Unable to load this conversation.'
      );
    }
  }, [conversationId, guest]);

  const loadInitialMessages = useCallback(async () => {
    if (guest) {
      setLoading(false);
      return;
    }

    try {
      const initialMessages = await getMessages(
        conversationId,
        {
          page: 0,
          pageSize: PAGE_SIZE,
        }
      );

      if (!mountedRef.current) {
        return;
      }

      const normalized = initialMessages.map(
        normalizeMessage
      );

      setMessages(normalized);
      setHasOlder(normalized.length === PAGE_SIZE);

      window.requestAnimationFrame(() => {
        scrollToBottom('auto');
      });

      markRead();
    } catch (loadError) {
      setError(
        loadError.message ||
          'Unable to load conversation messages.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    conversationId,
    guest,
    markRead,
    scrollToBottom,
  ]);

  const loadPage = useCallback(async () => {
    const node = scrollRef.current;

    if (
      guest ||
      !hasOlder ||
      loadingOlderRef.current ||
      !node ||
      !messages.length
    ) {
      return;
    }

    loadingOlderRef.current = true;
    setLoadingOlder(true);

    const previousHeight = node.scrollHeight;
    const oldestMessage = messages[0];

    try {
      const olderMessages = await getMessages(
        conversationId,
        {
          pageSize: PAGE_SIZE,
          before: oldestMessage.created_at,
        }
      );

      const normalized = olderMessages.map(
        normalizeMessage
      );

      setMessages((current) => {
        const merged = new Map();

        [...normalized, ...current].forEach((message) => {
          merged.set(message.id, message);
        });

        return [...merged.values()].sort(
          (first, second) =>
            new Date(first.created_at) -
            new Date(second.created_at)
        );
      });

      setHasOlder(normalized.length === PAGE_SIZE);

      window.requestAnimationFrame(() => {
        const nextHeight = node.scrollHeight;
        node.scrollTop += nextHeight - previousHeight;
      });
    } catch (loadError) {
      showNotice(
        loadError.message ||
          'Unable to load older messages.'
      );
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  }, [
    conversationId,
    guest,
    hasOlder,
    messages,
    showNotice,
  ]);

  useEffect(() => {
    mountedRef.current = true;

    const load = async () => {
      const guestMode = isGuestMode();
      setGuest(guestMode);

      if (guestMode) {
        setLoading(false);
        return;
      }

      try {
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !currentUser) {
          navigate('/login', { replace: true });
          return;
        }

        setUser(currentUser);
      } catch (loadError) {
        setError(
          loadError.message ||
            'Unable to authenticate this session.'
        );
        setLoading(false);
      }
    };

    load();

    return () => {
      mountedRef.current = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!user || guest || !conversationId) {
      return;
    }

    loadConversation();
    loadInitialMessages();
  }, [
    conversationId,
    guest,
    loadConversation,
    loadInitialMessages,
    user,
  ]);

  useEffect(() => {
    if (!user || guest || !conversationId) {
      return undefined;
    }

    const cleanup = subscribeToConversation(
      conversationId,
      (payload) => {
        if (!mountedRef.current) {
          return;
        }

        if (
          payload.table === 'messages' &&
          payload.eventType === 'INSERT'
        ) {
          const incoming = normalizeMessage(
            payload.new
          );

          setMessages((current) => {
            if (
              current.some(
                (message) => message.id === incoming.id
              )
            ) {
              return current;
            }

            return [...current, incoming];
          });

          const shouldScroll = isNearBottom();

          if (incoming.sender_id !== user.id) {
            markRead();
          }

          if (shouldScroll || incoming.sender_id === user.id) {
            window.requestAnimationFrame(() => {
              scrollToBottom('smooth');
            });
          }
        }

        if (
          payload.table === 'messages' &&
          payload.eventType === 'UPDATE'
        ) {
          setMessages((current) =>
            current.map((message) =>
              message.id === payload.new.id
                ? {
                    ...message,
                    ...payload.new,
                  }
                : message
            )
          );
        }

        if (
          payload.table === 'messages' &&
          payload.eventType === 'DELETE'
        ) {
          setMessages((current) =>
            current.filter(
              (message) => message.id !== payload.old.id
            )
          );
        }

        if (
          payload.table === 'message_reads' &&
          payload.new?.message_id
        ) {
          setMessages((current) =>
            current.map((message) =>
              message.id === payload.new.message_id
                ? {
                    ...message,
                    read: true,
                  }
                : message
            )
          );
        }
      }
    );

    return () => {
      cleanup?.();
    };
  }, [
    conversationId,
    guest,
    isNearBottom,
    markRead,
    scrollToBottom,
    user,
  ]);

  useEffect(() => {
    if (
      !user ||
      guest ||
      !conversationId
    ) {
      return undefined;
    }

    const typingChannel = createTypingChannel(
      conversationId
    );

    if (!typingChannel) {
      return undefined;
    }

    typingChannelRef.current = typingChannel;

    typingChannel
      .on(
        'broadcast',
        {
          event: 'typing',
        },
        ({ payload }) => {
          if (payload?.userId === user.id) {
            return;
          }

          setTyping(Boolean(payload?.typing));

          window.setTimeout(() => {
            setTyping(false);
          }, 2600);
        }
      )
      .subscribe();

    return () => {
      typingChannelRef.current = null;
      supabase.removeChannel(typingChannel);
    };
  }, [conversationId, guest, user]);

  useEffect(() => {
    if (!user || guest || !otherParticipantId) {
      return undefined;
    }

    const presenceChannel = createPresenceChannel(
      conversationId
    );

    if (!presenceChannel) {
      return undefined;
    }

    presenceChannelRef.current = presenceChannel;

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const otherPresence = state[otherParticipantId];

        setOnline(Boolean(otherPresence?.length));
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === otherParticipantId) {
          setOnline(true);
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === otherParticipantId) {
          setOnline(false);
          setLastActive(new Date());
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            userId: user.id,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      presenceChannelRef.current = null;
      supabase.removeChannel(presenceChannel);
    };
  }, [
    conversationId,
    guest,
    otherParticipantId,
    user,
  ]);

  const broadcastTyping = useCallback(
    (isTyping) => {
      const channel = typingChannelRef.current;

      if (!channel || !user) {
        return;
      }

      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: user.id,
          typing: isTyping,
        },
      });
    },
    [user]
  );

  const handleInputChange = useCallback(
    (event) => {
      const value = event.target.value;
      setMessageText(value);

      if (!value.trim()) {
        broadcastTyping(false);
        return;
      }

      broadcastTyping(true);

      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }

      typingTimerRef.current = window.setTimeout(() => {
        broadcastTyping(false);
      }, 1800);
    },
    [broadcastTyping]
  );

  const handleSend = useCallback(
    async (event) => {
      event?.preventDefault();

      if (guest) {
        showNotice('Sign in to send messages.');
        return;
      }

      const content = messageText.trim();

      if (!content || sending || !user) {
        return;
      }

      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage = {
        id: optimisticId,
        conversation_id: conversationId,
        sender_id: user.id,
        message_type: 'text',
        content,
        created_at: new Date().toISOString(),
        edited_at: null,
        deleted_for_everyone: false,
        optimistic: true,
        delivered: false,
        read: false,
        profile: {
          id: user.id,
          username:
            user.user_metadata?.username ||
            user.email?.split('@')[0] ||
            'you',
          full_name:
            user.user_metadata?.full_name || 'You',
          avatar_url:
            user.user_metadata?.avatar_url || '',
        },
      };

      setSending(true);
      setMessageText('');
      broadcastTyping(false);
      setMessages((current) => [
        ...current,
        optimisticMessage,
      ]);

      window.requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });

      try {
        const sentMessage = await sendMessage({
          conversationId,
          content,
          messageType: 'text',
        });

        setMessages((current) =>
          current.map((message) =>
            message.id === optimisticId
              ? {
                  ...sentMessage,
                  delivered: true,
                  read: false,
                }
              : message
          )
        );
      } catch (sendError) {
        setMessages((current) =>
          current.filter(
            (message) => message.id !== optimisticId
          )
        );

        setMessageText(content);
        showNotice(
          sendError.message || 'Unable to send message.'
        );
      } finally {
        setSending(false);
      }
    },
    [
      broadcastTyping,
      conversationId,
      guest,
      messageText,
      scrollToBottom,
      sending,
      showNotice,
      user,
    ]
  );

  const handleStartEdit = useCallback((message) => {
    setEditingMessageId(message.id);
    setEditValue(message.content || '');
    setMenuMessageId(null);
  }, []);

  const handleSaveEdit = useCallback(
    async (messageId) => {
      if (!editValue.trim()) {
        return;
      }

      const previousMessages = messages;

      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: editValue.trim(),
                edited_at: new Date().toISOString(),
              }
            : message
        )
      );
      setEditingMessageId(null);
      setEditValue('');

      try {
        const updated = await editMessage(
          messageId,
          editValue.trim()
        );

        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  ...updated,
                }
              : message
          )
        );
      } catch (editError) {
        setMessages(previousMessages);
        showNotice(
          editError.message || 'Unable to edit message.'
        );
      }
    },
    [editValue, messages, showNotice]
  );

  const handleDelete = useCallback(
    async (messageId) => {
      const previousMessages = messages;

      setMenuMessageId(null);

      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: null,
                media_url: null,
                deleted_for_everyone: true,
              }
            : message
        )
      );

      try {
        await deleteMessageForEveryone(messageId);
      } catch (deleteError) {
        setMessages(previousMessages);
        showNotice(
          deleteError.message || 'Unable to delete message.'
        );
      }
    },
    [messages, showNotice]
  );

  const handleScroll = useCallback(
    (event) => {
      const node = event.currentTarget;
      nearBottomRef.current = isNearBottom();

      if (node.scrollTop < 100 && !loadingOlderRef.current) {
        loadPage();
      }
    },
    [isNearBottom, loadPage]
  );

  const handlePullStart = useCallback(
    (event) => {
      const node = scrollRef.current;

      if (!node || node.scrollTop > 0) {
        return;
      }

      pullStartRef.current = event.touches[0].clientY;
    },
    []
  );

  const handlePullMove = useCallback((event) => {
    if (pullStartRef.current === null) {
      return;
    }

    const distance =
      event.touches[0].clientY - pullStartRef.current;

    if (distance > 0) {
      setPullDistance(Math.min(80, distance * 0.45));
    }
  }, []);

  const handlePullEnd = useCallback(() => {
    pullStartRef.current = null;
    setPullDistance(0);

    if (pullDistance >= 50) {
      loadInitialMessages();
    }
  }, [loadInitialMessages, pullDistance]);

  if (guest) {
    return (
      <div style={styles.page}>
        <TopBar
          pageTitle="Chat"
          showBackButton
          onBack={() => navigate('/chats')}
        />

        <main style={styles.guestState}>
          <span style={styles.guestIcon}>
            <LockKeyhole size={27} />
          </span>

          <h1>Sign in to open this chat</h1>

          <p>
            Conversations are private and unavailable in
            Guest Mode.
          </p>

          <button
            type="button"
            onClick={() => navigate('/login')}
            style={styles.primaryButton}
          >
            Sign in
            <ChevronDown size={16} />
          </button>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle={conversationName}
        showBackButton
        onBack={() => navigate('/chats')}
      />

      <main style={styles.content}>
        <section style={styles.conversationHeader}>
          <div style={styles.profileBlock}>
            {conversationAvatar ? (
              <img
                src={conversationAvatar}
                alt=""
                style={styles.headerAvatar}
              />
            ) : (
              <span style={styles.headerPlaceholder}>
                <UserRound size={21} />
              </span>
            )}

            <div style={styles.profileCopy}>
              <strong>{conversationName}</strong>

              <span>
                {conversationUsername ||
                  (online ? 'Online' : 'Private conversation')}
              </span>

              <small>
                {online ? (
                  <>
                    <Wifi size={11} />
                    Online
                  </>
                ) : lastActive ? (
                  <>
                    <Clock3 size={11} />
                    {formatLastActive(lastActive)}
                  </>
                ) : (
                  <>
                    <WifiOff size={11} />
                    Offline
                  </>
                )}
              </small>
            </div>
          </div>

          <div style={styles.headerStatus}>
            <LockKeyhole size={13} />
            Private
          </div>
        </section>

        {notice ? (
          <div role="status" style={styles.notice}>
            <AlertCircleIcon />
            {notice}
          </div>
        ) : null}

        {error ? (
          <section style={styles.errorState}>
            <h1>Conversation unavailable</h1>
            <p>{error}</p>

            <button
              type="button"
              onClick={() => {
                setError('');
                setLoading(true);
                loadConversation();
                loadInitialMessages();
              }}
              style={styles.primaryButton}
            >
              Retry
            </button>
          </section>
        ) : (
          <section
            ref={scrollRef}
            onScroll={handleScroll}
            onTouchStart={handlePullStart}
            onTouchMove={handlePullMove}
            onTouchEnd={handlePullEnd}
            style={styles.messagePanel}
          >
            {pullDistance > 0 ? (
              <div
                style={{
                  ...styles.pullIndicator,
                  height: `${pullDistance}px`,
                }}
              >
                <LoaderCircle
                  size={15}
                  style={{
                    transform: `rotate(${pullDistance * 4}deg)`,
                  }}
                />
                Pull to refresh
              </div>
            ) : null}

            {loadingOlder ? (
              <div style={styles.loadingOlder}>
                Loading older messages…
              </div>
            ) : null}

            {loading ? (
              <>
                <MessageSkeleton />
                <MessageSkeleton own />
                <MessageSkeleton />
                <MessageSkeleton own />
              </>
            ) : !messages.length ? (
              <div style={styles.emptyConversation}>
                <span style={styles.emptyConversationIcon}>
                  <MessageCircle size={27} />
                </span>

                <h1>Say hello 👋</h1>

                <p>Start the conversation.</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  own={message.sender_id === user?.id}
                  editing={
                    editingMessageId === message.id
                  }
                  editValue={editValue}
                  menuOpen={menuMessageId === message.id}
                  onEditValue={setEditValue}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={() => {
                    setEditingMessageId(null);
                    setEditValue('');
                  }}
                  onSaveEdit={handleSaveEdit}
                  onDelete={handleDelete}
                  onToggleMenu={(messageId) =>
                    setMenuMessageId((current) =>
                      current === messageId
                        ? null
                        : messageId
                    )
                  }
                />
              ))
            )}

            {typing ? (
              <div style={styles.typingIndicator}>
                <span style={styles.typingDot} />
                <span style={styles.typingDot} />
                <span style={styles.typingDot} />
                <span>Typing…</span>
              </div>
            ) : null}
          </section>
        )}

        <form
          onSubmit={handleSend}
          style={styles.composer}
        >
          <div style={styles.composerTools}>
            <button
              type="button"
              onClick={() =>
                showNotice('Emoji picker coming soon.')
              }
              style={styles.toolButton}
              aria-label="Open emoji picker"
            >
              <Smile size={17} />
            </button>

            <button
              type="button"
              onClick={() =>
                showNotice('Media attachments coming soon.')
              }
              style={styles.toolButton}
              aria-label="Attach media"
            >
              <Paperclip size={17} />
            </button>
          </div>

          <input
            ref={inputRef}
            value={messageText}
            onChange={handleInputChange}
            placeholder="Message…"
            disabled={sending || Boolean(error)}
            style={styles.messageInput}
            aria-label="Message"
          />

          <button
            type="button"
            onClick={() =>
              showNotice('Voice messages coming soon.')
            }
            style={styles.toolButton}
            aria-label="Record voice message"
          >
            <Mic size={17} />
          </button>

          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            style={{
              ...styles.sendButton,
              opacity:
                sending || !messageText.trim() ? 0.45 : 1,
            }}
            aria-label="Send message"
          >
            {sending ? (
              <LoaderCircle
                size={16}
                style={styles.spinIcon}
              />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </main>

      <BottomNav />

      <style>{`
        @keyframes aarush-chat-conversation-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes aarush-chat-typing {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.45;
          }

          40% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </div>
  );
}

function AlertCircleIcon() {
  return <MessageCircle size={15} />;
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '6.8rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
  },

  content: {
    width: '100%',
    maxWidth: '820px',
    height: 'calc(100vh - 9rem)',
    minHeight: '30rem',
    display: 'grid',
    gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
    gap: '0.7rem',
    margin: '0 auto',
    padding: '0.85rem',
    boxSizing: 'border-box',
  },

  conversationHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    padding: '0.75rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,0.9)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.24)',
  },

  profileBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    minWidth: 0,
  },

  headerAvatar: {
    width: '2.75rem',
    height: '2.75rem',
    objectFit: 'cover',
    flexShrink: 0,
    border: '2px solid rgba(124,92,255,0.6)',
    borderRadius: '999px',
  },

  headerPlaceholder: {
    width: '2.75rem',
    height: '2.75rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '2px solid rgba(124,92,255,0.5)',
    borderRadius: '999px',
    color: '#dce5f8',
    background:
      'linear-gradient(135deg, #1c2740, #342258)',
  },

  profileCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.15rem',
  },

  profileCopyStrong: {
    overflow: 'hidden',
    fontSize: '0.8rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  profileCopySpan: {
    overflow: 'hidden',
    color: '#8f9cb8',
    fontSize: '0.63rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  profileCopySmall: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.22rem',
    color: '#82e9c1',
    fontSize: '0.58rem',
  },

  headerStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexShrink: 0,
    padding: '0.3rem 0.42rem',
    borderRadius: '999px',
    color: '#b8f4ff',
    background: 'rgba(77,215,255,0.09)',
    fontSize: '0.58rem',
    fontWeight: 800,
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.65rem 0.75rem',
    border: '1px solid rgba(77,215,255,0.18)',
    borderRadius: '0.8rem',
    color: '#b8f4ff',
    background: 'rgba(77,215,255,0.07)',
    fontSize: '0.68rem',
  },

  messagePanel: {
    position: 'relative',
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
    padding: '0.85rem 0.7rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(180deg, rgba(15,19,30,0.9), rgba(10,14,23,0.94))',
    scrollBehavior: 'smooth',
  },

  pullIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    overflow: 'hidden',
    flexShrink: 0,
    color: '#9deeff',
    fontSize: '0.65rem',
    fontWeight: 750,
  },

  loadingOlder: {
    flexShrink: 0,
    padding: '0.45rem',
    color: '#9deeff',
    fontSize: '0.64rem',
    textAlign: 'center',
  },

  messageRow: {
    display: 'flex',
    width: '100%',
  },

  messageGroup: {
    position: 'relative',
    display: 'flex',
    maxWidth: '83%',
  },

  messageBubble: {
    position: 'relative',
    minWidth: '5rem',
    padding: '0.72rem 0.78rem 0.42rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.15rem',
    boxShadow: '0 8px 22px rgba(0,0,0,0.16)',
  },

  ownMessageBubble: {
    borderBottomRightRadius: '0.35rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.3), rgba(77,215,255,0.14))',
  },

  otherMessageBubble: {
    borderBottomLeftRadius: '0.35rem',
    background: 'rgba(255,255,255,0.06)',
  },

  messageText: {
    margin: 0,
    paddingRight: '1rem',
    color: '#f4f7ff',
    fontSize: '0.78rem',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },

  messageFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.25rem',
    marginTop: '0.25rem',
    color: '#91a0ba',
    fontSize: '0.55rem',
  },

  receiptIcon: {
    display: 'inline-flex',
    alignItems: 'center',
  },

  messageMenuTrigger: {
    position: 'absolute',
    top: '0.28rem',
    right: '0.28rem',
    width: '1.5rem',
    height: '1.5rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(0,0,0,0.12)',
    cursor: 'pointer',
  },

  messageMenu: {
    position: 'absolute',
    top: '2rem',
    right: '0.2rem',
    zIndex: 20,
    minWidth: '10.5rem',
    padding: '0.3rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.75rem',
    background: 'rgba(19,25,40,0.98)',
    boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
  },

  menuButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem',
    border: 0,
    borderRadius: '0.5rem',
    color: '#dce5f8',
    background: 'transparent',
    fontSize: '0.63rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  editForm: {
    display: 'grid',
    gap: '0.4rem',
    minWidth: '12rem',
  },

  editInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.5rem',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: '0.55rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(0,0,0,0.2)',
    fontSize: '0.72rem',
  },

  editActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.35rem',
  },

  smallButton: {
    minHeight: '1.8rem',
    padding: '0 0.5rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: '#b5c1d7',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.6rem',
    cursor: 'pointer',
  },

  smallPrimaryButton: {
    minHeight: '1.8rem',
    padding: '0 0.55rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  deletedMessage: {
    paddingRight: '1rem',
    color: '#91a0ba',
    fontSize: '0.74rem',
    fontStyle: 'italic',
  },

  mediaPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    minWidth: '9rem',
    paddingRight: '1rem',
    color: '#dce5f8',
    fontSize: '0.7rem',
  },

  typingIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.22rem',
    alignSelf: 'flex-start',
    padding: '0.55rem 0.7rem',
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.64rem',
  },

  typingDot: {
    width: '0.35rem',
    height: '0.35rem',
    borderRadius: '999px',
    background: '#4dd7ff',
    animation:
      'aarush-chat-typing 1.1s ease-in-out infinite',
  },

  emptyConversation: {
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    flex: 1,
    gap: '0.5rem',
    minHeight: '16rem',
    color: '#dce5f8',
    textAlign: 'center',
  },

  emptyConversationIcon: {
    width: '3.7rem',
    height: '3.7rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },

  composer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.65rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,0.92)',
  },

  composerTools: {
    display: 'flex',
    gap: '0.2rem',
  },

  toolButton: {
    width: '2.35rem',
    height: '2.35rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#cbd6ea',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },

  messageInput: {
    minWidth: 0,
    flex: 1,
    minHeight: '2.35rem',
    padding: '0 0.7rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.74rem',
  },

  sendButton: {
    width: '2.35rem',
    height: '2.35rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    cursor: 'pointer',
  },

  spinIcon: {
    animation:
      'aarush-chat-conversation-spin 850ms linear infinite',
  },

  guestState: {
    minHeight: '70vh',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.65rem',
    padding: '1rem',
    textAlign: 'center',
  },

  guestIcon: {
    width: '3.7rem',
    height: '3.7rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },

  errorState: {
    minHeight: '15rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.55rem',
    padding: '1.2rem',
    color: '#ffb1c8',
    textAlign: 'center',
  },

  primaryButton: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    padding: '0 0.9rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.72rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  skeletonRow: {
    display: 'flex',
    width: '100%',
  },

  skeletonBubble: {
    height: '3.3rem',
    borderRadius: '1.15rem',
    background: 'rgba(255,255,255,0.08)',
    animation:
      'aarush-chat-typing 1.4s ease-in-out infinite',
  },
};