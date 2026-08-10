import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ChevronRight,
  CloudOff,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import {
  getUnreadCount,
  getUserConversations,
  subscribeToConversations,
} from '../utils/chatEngine';

const PAGE_SIZE = 20;

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
};

function isGuestMode() {
  return (
    window.localStorage.getItem(GUEST_KEYS.isGuest) === 'true' &&
    window.localStorage.getItem(GUEST_KEYS.guestSession) !== null
  );
}

function formatTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const sameDay =
    date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  const difference =
    now.getTime() - date.getTime();

  if (difference < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], {
      weekday: 'short',
    });
  }

  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
  });
}

function getOtherParticipant(conversation, currentUserId) {
  const participants =
    conversation?.conversation_participants || [];

  return (
    participants.find(
      (participant) => participant.user_id !== currentUserId
    ) || participants[0] || null
  );
}

function getParticipantProfile(participant) {
  return (
    participant?.profiles ||
    participant?.profile ||
    {}
  );
}

function getConversationLabel(
  conversation,
  currentUserId
) {
  const participants =
    conversation?.conversation_participants || [];

  if (participants.length > 2) {
    return 'Group conversation';
  }

  const participant = getOtherParticipant(
    conversation,
    currentUserId
  );

  const profile = getParticipantProfile(participant);

  return (
    profile.full_name ||
    profile.username ||
    'Aarush User'
  );
}

function getConversationUsername(
  conversation,
  currentUserId
) {
  const participant = getOtherParticipant(
    conversation,
    currentUserId
  );

  const profile = getParticipantProfile(participant);

  return profile.username
    ? profile.username.startsWith('@')
      ? profile.username
      : `@${profile.username}`
    : '';
}

function getConversationAvatar(
  conversation,
  currentUserId
) {
  const participant = getOtherParticipant(
    conversation,
    currentUserId
  );

  const profile = getParticipantProfile(participant);

  return profile.avatar_url || '';
}

function getLastMessageText(conversation) {
  const message = conversation?.last_message;

  if (!message) {
    return 'No messages yet';
  }

  if (message.deleted_for_everyone) {
    return 'Message deleted';
  }

  if (message.message_type === 'image') {
    return message.content || 'Sent an image';
  }

  if (message.message_type === 'video') {
    return message.content || 'Sent a video';
  }

  if (message.message_type === 'audio') {
    return message.content || 'Sent a voice message';
  }

  if (message.message_type === 'file') {
    return message.content || 'Sent a file';
  }

  return message.content || 'New message';
}

function getLastActivity(conversation) {
  return (
    conversation?.last_message?.created_at ||
    conversation?.updated_at ||
    conversation?.created_at
  );
}

function ConversationAvatar({
  conversation,
  currentUserId,
}) {
  const avatar = getConversationAvatar(
    conversation,
    currentUserId
  );

  if (avatar) {
    return (
      <img
        src={avatar}
        alt=""
        loading="lazy"
        style={styles.avatar}
      />
    );
  }

  const isGroup =
    conversation?.conversation_participants?.length > 2;

  return (
    <span style={styles.placeholderAvatar}>
      {isGroup ? (
        <Users size={22} />
      ) : (
        <UserRound size={22} />
      )}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div style={styles.skeletonRow}>
      <span style={styles.skeletonAvatar} />

      <div style={styles.skeletonCopy}>
        <span style={styles.skeletonLine} />
        <span style={styles.skeletonSmallLine} />
      </div>

      <span style={styles.skeletonTime} />
    </div>
  );
}

function GuestPrompt({ onLogin }) {
  return (
    <section style={styles.guestPrompt}>
      <span style={styles.guestIcon}>
        <MessageCircle size={27} />
      </span>

      <h1>Sign in to use Chats</h1>

      <p>
        Your conversations are private and available only
        after signing in.
      </p>

      <button
        type="button"
        onClick={onLogin}
        style={styles.primaryButton}
      >
        Sign in
        <ChevronRight size={16} />
      </button>
    </section>
  );
}

function EmptyState({ onFindPeople }) {
  return (
    <section style={styles.emptyState}>
      <span style={styles.emptyIcon}>
        <MessageCircle size={27} />
      </span>

      <h1>No conversations yet</h1>

      <p>
        Start a conversation with someone on Aarush.
      </p>

      <button
        type="button"
        onClick={onFindPeople}
        style={styles.primaryButton}
      >
        <Search size={16} />
        Find people
      </button>
    </section>
  );
}

function ErrorState({ onRetry }) {
  return (
    <section style={styles.errorState}>
      <span style={styles.errorIcon}>
        <CloudOff size={27} />
      </span>

      <h1>Chats unavailable</h1>

      <p>
        Check your connection and try loading your
        conversations again.
      </p>

      <button
        type="button"
        onClick={onRetry}
        style={styles.primaryButton}
      >
        <RefreshCw size={16} />
        Retry
      </button>
    </section>
  );
}

export default function ChatsPage() {
  const navigate = useNavigate();
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const pullStartRef = useRef(null);

  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] =
    useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notice, setNotice] = useState('');
  const [pullDistance, setPullDistance] = useState(0);

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2800);
  }, []);

  const loadUser = useCallback(async () => {
    const guestMode = isGuestMode();

    setGuest(guestMode);

    if (guestMode) {
      setUser(null);
      return null;
    }

    const {
      data: { user: currentUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    setUser(currentUser || null);
    return currentUser || null;
  }, []);

  const loadUnread = useCallback(async () => {
    if (isGuestMode()) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await getUnreadCount();

      if (mountedRef.current) {
        setUnreadCount(count);
      }
    } catch {
      if (mountedRef.current) {
        setUnreadCount(0);
      }
    }
  }, []);

  const loadConversations = useCallback(
    async ({
      pageNumber = 0,
      replace = false,
      refresh = false,
    } = {}) => {
      if (loadingRef.current && !refresh) {
        return;
      }

      if (!replace && !hasMore) {
        return;
      }

      loadingRef.current = true;
      setError('');

      if (replace) {
        setLoading(!refresh);
        setRefreshing(refresh);
      } else {
        setLoadingMore(true);
      }

      try {
        const currentUser = await loadUser();

        if (!currentUser) {
          setConversations([]);
          setHasMore(false);
          return;
        }

        const nextConversations =
          await getUserConversations({
            page: pageNumber,
            pageSize: PAGE_SIZE,
          });

        if (!mountedRef.current) {
          return;
        }

        setConversations((current) => {
          const combined = replace
            ? nextConversations
            : [...current, ...nextConversations];

          const unique = new Map();

          combined.forEach((conversation) => {
            unique.set(conversation.id, conversation);
          });

          return [...unique.values()].sort(
            (first, second) =>
              new Date(
                second.last_message?.created_at ||
                  second.updated_at
              ) -
              new Date(
                first.last_message?.created_at ||
                  first.updated_at
              )
          );
        });

        setPage(pageNumber);
        setHasMore(
          nextConversations.length === PAGE_SIZE
        );

        await loadUnread();
      } catch (loadError) {
        if (mountedRef.current) {
          setError(
            loadError.message ||
              'Unable to load conversations.'
          );
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [hasMore, loadUnread, loadUser]
  );

  const refreshConversations = useCallback(() => {
    loadConversations({
      pageNumber: 0,
      replace: true,
      refresh: true,
    });
  }, [loadConversations]);

  useEffect(() => {
    mountedRef.current = true;

    loadConversations({
      pageNumber: 0,
      replace: true,
    });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || guest) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMore &&
          !loadingRef.current
        ) {
          loadConversations({
            pageNumber: page + 1,
          });
        }
      },
      {
        rootMargin: '500px 0px',
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [
    guest,
    hasMore,
    loadConversations,
    page,
  ]);

  useEffect(() => {
    if (guest) {
      return undefined;
    }

    const cleanup = subscribeToConversations(
      async (payload) => {
        if (!mountedRef.current) {
          return;
        }

        if (
          payload.table === 'messages' &&
          payload.eventType === 'INSERT'
        ) {
          const message = payload.new;
          const currentConversation =
            conversations.find(
              (conversation) =>
                conversation.id ===
                message.conversation_id
            );

          if (!currentConversation) {
            await loadConversations({
              pageNumber: 0,
              replace: true,
              refresh: true,
            });
            return;
          }

          const updatedConversation = {
            ...currentConversation,
            last_message: {
              ...message,
              profile: {},
            },
            updated_at:
              message.created_at ||
              currentConversation.updated_at,
          };

          setConversations((current) =>
            [
              updatedConversation,
              ...current.filter(
                (conversation) =>
                  conversation.id !==
                  message.conversation_id
              ),
            ].sort(
              (first, second) =>
                new Date(
                  second.last_message?.created_at ||
                    second.updated_at
                ) -
                new Date(
                  first.last_message?.created_at ||
                    first.updated_at
                )
            )
          );

          if (message.sender_id !== user?.id) {
            setUnreadCount((count) => count + 1);
          }
        }

        if (
          payload.table === 'message_reads' &&
          payload.eventType !== 'DELETE'
        ) {
          loadUnread();
        }

        if (
          payload.table === 'conversation_participants'
        ) {
          loadConversations({
            pageNumber: 0,
            replace: true,
            refresh: true,
          });
        }
      }
    );

    return () => {
      cleanup?.();
    };
  }, [
    conversations,
    guest,
    loadConversations,
    loadUnread,
    user?.id,
  ]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const participant =
        getOtherParticipant(
          conversation,
          user?.id
        );

      const profile = getParticipantProfile(participant);

      const searchableText = [
        profile.username,
        profile.full_name,
        getConversationLabel(
          conversation,
          user?.id
        ),
        getLastMessageText(conversation),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [conversations, search, user?.id]);

  const handlePullStart = useCallback(
    (event) => {
      if (window.scrollY > 0 || refreshing || guest) {
        return;
      }

      pullStartRef.current = event.touches[0].clientY;
    },
    [guest, refreshing]
  );

  const handlePullMove = useCallback(
    (event) => {
      if (
        pullStartRef.current === null ||
        window.scrollY > 0 ||
        refreshing ||
        guest
      ) {
        return;
      }

      const distance =
        event.touches[0].clientY - pullStartRef.current;

      if (distance > 0) {
        setPullDistance(Math.min(90, distance * 0.45));
      }
    },
    [guest, refreshing]
  );

  const handlePullEnd = useCallback(() => {
    if (pullStartRef.current === null) {
      return;
    }

    pullStartRef.current = null;

    if (pullDistance >= 55) {
      setPullDistance(0);
      refreshConversations();
      return;
    }

    setPullDistance(0);
  }, [pullDistance, refreshConversations]);

  const handleOpenConversation = useCallback(
    (conversationId) => {
      navigate(`/chat/${conversationId}`);
    },
    [navigate]
  );

  return (
    <div
      style={styles.page}
      onTouchStart={handlePullStart}
      onTouchMove={handlePullMove}
      onTouchEnd={handlePullEnd}
    >
      <TopBar
        pageTitle="Chats"
        notificationCount={unreadCount}
        onNotificationsClick={() =>
          navigate('/notifications')
        }
      />

      {pullDistance > 0 ? (
        <div
          style={{
            ...styles.pullIndicator,
            height: `${pullDistance}px`,
          }}
        >
          <RefreshCw
            size={16}
            style={{
              transform: `rotate(${pullDistance * 4}deg)`,
            }}
          />
          {pullDistance >= 55
            ? 'Release to refresh'
            : 'Pull to refresh'}
        </div>
      ) : null}

      <main style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <AlertCircle size={15} />
            {notice}
          </div>
        ) : null}

        <section style={styles.hero}>
          <div>
            <h1 style={styles.title}>Chats</h1>
            <p style={styles.subtitle}>
              Private conversations with your Aarush circle.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (guest) {
                showNotice(
                  'Sign in to start a conversation.'
                );
                return;
              }

              navigate('/search');
            }}
            style={styles.newChatButton}
            aria-label="Start a new conversation"
          >
            <Plus size={17} />
          </button>
        </section>

        {guest ? (
          <GuestPrompt
            onLogin={() => navigate('/login')}
          />
        ) : (
          <>
            <div style={styles.searchBox}>
              <Search size={17} />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search username or full name"
                style={styles.searchInput}
                aria-label="Search conversations"
              />

              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={styles.clearSearch}
                  aria-label="Clear search"
                >
                  ×
                </button>
              ) : null}
            </div>

            <div style={styles.listHeader}>
              <div>
                <h2 style={styles.listTitle}>
                  Recent conversations
                </h2>

                <p style={styles.listSubtitle}>
                  {filteredConversations.length} conversation
                  {filteredConversations.length === 1
                    ? ''
                    : 's'}
                </p>
              </div>

              <button
                type="button"
                onClick={refreshConversations}
                disabled={refreshing}
                style={styles.refreshButton}
                aria-label="Refresh conversations"
              >
                <RefreshCw
                  size={16}
                  style={{
                    animation: refreshing
                      ? 'aarush-chat-spin 900ms linear infinite'
                      : 'none',
                  }}
                />
              </button>
            </div>

            {loading ? (
              <div style={styles.list}>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : error && !conversations.length ? (
              <ErrorState
                onRetry={() =>
                  loadConversations({
                    pageNumber: 0,
                    replace: true,
                    refresh: true,
                  })
                }
              />
            ) : !filteredConversations.length ? (
              search ? (
                <section style={styles.emptyState}>
                  <span style={styles.emptyIcon}>
                    <Search size={25} />
                  </span>

                  <h1>No conversations found</h1>

                  <p>
                    Try searching with a different username or
                    full name.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    style={styles.primaryButton}
                  >
                    Clear search
                  </button>
                </section>
              ) : (
                <EmptyState
                  onFindPeople={() => navigate('/search')}
                />
              )
            ) : (
              <>
                <div style={styles.list}>
                  {filteredConversations.map(
                    (conversation) => {
                      const label = getConversationLabel(
                        conversation,
                        user?.id
                      );

                      const username =
                        getConversationUsername(
                          conversation,
                          user?.id
                        );

                      const message =
                        getLastMessageText(conversation);

                      const activity =
                        getLastActivity(conversation);

                      const isGroup =
                        conversation
                          .conversation_participants
                          ?.length > 2;

                      return (
                        <button
                          type="button"
                          key={conversation.id}
                          onClick={() =>
                            handleOpenConversation(
                              conversation.id
                            )
                          }
                          style={styles.conversationRow}
                        >
                          <ConversationAvatar
                            conversation={conversation}
                            currentUserId={user?.id}
                          />

                          <span style={styles.conversationCopy}>
                            <span style={styles.conversationTop}>
                              <strong>{label}</strong>

                              {isGroup ? (
                                <span style={styles.groupBadge}>
                                  Group
                                </span>
                              ) : null}
                            </span>

                            <span style={styles.username}>
                              {username}
                            </span>

                            <span style={styles.lastMessage}>
                              {message}
                            </span>
                          </span>

                          <span style={styles.conversationMeta}>
                            <span style={styles.activityTime}>
                              {formatTime(activity)}
                            </span>

                            {conversation.unread_count > 0 ? (
                              <span style={styles.unreadBadge}>
                                {conversation.unread_count > 99
                                  ? '99+'
                                  : conversation.unread_count}
                              </span>
                            ) : null}

                            <ChevronRight
                              size={16}
                              color="#7786a3"
                            />
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>

                {loadingMore ? (
                  <div style={styles.loadingMore}>
                    <RefreshCw size={16} />
                    Loading more conversations…
                  </div>
                ) : null}

                {!hasMore ? (
                  <div style={styles.endOfList}>
                    You’re all caught up.
                  </div>
                ) : null}

                <div
                  ref={sentinelRef}
                  style={styles.sentinel}
                  aria-hidden="true"
                />
              </>
            )}
          </>
        )}
      </main>

      <BottomNav notificationCount={unreadCount} />

      <style>{`
        @keyframes aarush-chat-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes aarush-chat-skeleton {
          0%, 100% {
            opacity: 0.4;
          }

          50% {
            opacity: 0.9;
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
    maxWidth: '760px',
    margin: '0 auto',
    padding: '0.9rem',
    boxSizing: 'border-box',
  },

  pullIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    overflow: 'hidden',
    color: '#9deeff',
    background: 'rgba(77,215,255,0.06)',
    fontSize: '0.68rem',
    fontWeight: 800,
    transition: 'height 160ms ease',
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.75rem',
    padding: '0.7rem 0.75rem',
    border: '1px solid rgba(77,215,255,0.18)',
    borderRadius: '0.8rem',
    color: '#b8f4ff',
    background: 'rgba(77,215,255,0.07)',
    fontSize: '0.68rem',
  },

  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    marginBottom: '0.85rem',
    padding: '0.95rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.9)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
  },

  title: {
    margin: 0,
    fontSize: '1.08rem',
    fontWeight: 900,
  },

  subtitle: {
    margin: '0.25rem 0 0',
    color: '#96a3bf',
    fontSize: '0.7rem',
  },

  newChatButton: {
    width: '2.55rem',
    height: '2.55rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    boxShadow: '0 8px 22px rgba(124,92,255,0.22)',
    cursor: 'pointer',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.9rem',
    padding: '0.72rem 0.8rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1rem',
    color: '#91a0ba',
    background: 'rgba(255,255,255,0.05)',
  },

  searchInput: {
    minWidth: 0,
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '0.76rem',
  },

  clearSearch: {
    width: '1.45rem',
    height: '1.45rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#c9d4e8',
    background: 'rgba(255,255,255,0.08)',
    fontSize: '1rem',
    cursor: 'pointer',
  },

  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    marginBottom: '0.55rem',
  },

  listTitle: {
    margin: 0,
    fontSize: '0.92rem',
    fontWeight: 850,
  },

  listSubtitle: {
    margin: '0.2rem 0 0',
    color: '#8290ad',
    fontSize: '0.66rem',
  },

  refreshButton: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },

  list: {
    display: 'grid',
    gap: '0.45rem',
  },

  conversationRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    minHeight: '4.65rem',
    padding: '0.72rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '1rem',
    color: '#f4f7ff',
    background: 'rgba(15,19,30,0.9)',
    textAlign: 'left',
    cursor: 'pointer',
    transition:
      'transform 180ms ease, border-color 180ms ease, background 180ms ease',
  },

  avatar: {
    width: '3rem',
    height: '3rem',
    objectFit: 'cover',
    flexShrink: 0,
    border: '2px solid rgba(124,92,255,0.55)',
    borderRadius: '999px',
  },

  placeholderAvatar: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '2px solid rgba(124,92,255,0.5)',
    borderRadius: '999px',
    color: '#dce5f8',
    background:
      'linear-gradient(135deg, #1c2740, #342258)',
  },

  conversationCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.17rem',
    flex: 1,
  },

  conversationTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    minWidth: 0,
  },

  conversationTopStrong: {
    overflow: 'hidden',
    fontSize: '0.78rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  groupBadge: {
    padding: '0.16rem 0.3rem',
    borderRadius: '999px',
    color: '#bfb4ff',
    background: 'rgba(124,92,255,0.13)',
    fontSize: '0.52rem',
    fontWeight: 850,
  },

  username: {
    overflow: 'hidden',
    color: '#8f9cb8',
    fontSize: '0.62rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  lastMessage: {
    overflow: 'hidden',
    color: '#b7c2d7',
    fontSize: '0.68rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  conversationMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flexShrink: 0,
  },

  activityTime: {
    alignSelf: 'flex-start',
    color: '#8290ad',
    fontSize: '0.58rem',
    whiteSpace: 'nowrap',
  },

  unreadBadge: {
    minWidth: '1.2rem',
    height: '1.2rem',
    display: 'grid',
    placeItems: 'center',
    padding: '0 0.25rem',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.55rem',
    fontWeight: 900,
  },

  skeletonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    minHeight: '4.65rem',
    padding: '0.72rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '1rem',
    background: 'rgba(15,19,30,0.85)',
    animation:
      'aarush-chat-skeleton 1.4s ease-in-out infinite',
  },

  skeletonAvatar: {
    width: '3rem',
    height: '3rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.1)',
  },

  skeletonCopy: {
    display: 'grid',
    gap: '0.4rem',
    flex: 1,
  },

  skeletonLine: {
    width: '8.5rem',
    height: '0.65rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.1)',
  },

  skeletonSmallLine: {
    width: '5.8rem',
    height: '0.5rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.07)',
  },

  skeletonTime: {
    width: '2.6rem',
    height: '0.5rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.07)',
  },

  guestPrompt: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.6rem',
    padding: '3rem 1.2rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.3rem',
    background: 'rgba(15,19,30,0.9)',
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

  emptyState: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.6rem',
    padding: '3rem 1.2rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.3rem',
    background: 'rgba(15,19,30,0.9)',
    textAlign: 'center',
  },

  emptyIcon: {
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
    display: 'grid',
    justifyItems: 'center',
    gap: '0.6rem',
    padding: '3rem 1.2rem',
    border: '1px solid rgba(255,79,122,0.16)',
    borderRadius: '1.3rem',
    background: 'rgba(255,79,122,0.05)',
    textAlign: 'center',
  },

  errorIcon: {
    width: '3.7rem',
    height: '3.7rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.12)',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    marginTop: '0.3rem',
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

  loadingMore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '1rem',
    color: '#9deeff',
    fontSize: '0.68rem',
    fontWeight: 750,
  },

  endOfList: {
    padding: '1.2rem',
    color: '#8290ad',
    fontSize: '0.66rem',
    textAlign: 'center',
  },

  sentinel: {
    height: '1px',
    opacity: 0,
  },
};