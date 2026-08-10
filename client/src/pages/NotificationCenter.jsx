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
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  CloudOff,
  Heart,
  MessageCircle,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  UserPlus,
  Users,
  X,
  Eye,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  subscribeToNotifications,
} from '../utils/notificationEngine';

const PAGE_SIZE = 25;

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
};

const TYPE_CONFIG = {
  like: {
    label: 'Likes',
    icon: Heart,
    color: '#ff719f',
    background: 'rgba(255,113,159,0.12)',
  },
  comment: {
    label: 'Comments',
    icon: MessageCircle,
    color: '#9deeff',
    background: 'rgba(77,215,255,0.12)',
  },
  follow: {
    label: 'Follows',
    icon: UserPlus,
    color: '#82e9c1',
    background: 'rgba(130,233,193,0.12)',
  },
  story_view: {
    label: 'Story views',
    icon: Eye,
    color: '#c8bcff',
    background: 'rgba(124,92,255,0.14)',
  },
  story_reply: {
    label: 'Story replies',
    icon: MessageSquare,
    color: '#ffb8e5',
    background: 'rgba(255,79,216,0.12)',
  },
  message: {
    label: 'Messages',
    icon: MessageSquare,
    color: '#9deeff',
    background: 'rgba(77,215,255,0.12)',
  },
  mention: {
    label: 'Mentions',
    icon: Users,
    color: '#ffd27d',
    background: 'rgba(255,210,125,0.12)',
  },
  tag: {
    label: 'Tags',
    icon: Tag,
    color: '#ffd27d',
    background: 'rgba(255,210,125,0.12)',
  },
  security: {
    label: 'Security',
    icon: ShieldAlert,
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.12)',
  },
  system: {
    label: 'System',
    icon: Sparkles,
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.08)',
  },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'like', label: 'Likes' },
  { key: 'comment', label: 'Comments' },
  { key: 'message', label: 'Messages' },
  { key: 'security', label: 'Security' },
];

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
  const difference = now.getTime() - date.getTime();
  const seconds = Math.max(0, Math.floor(difference / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year:
      date.getFullYear() === now.getFullYear()
        ? undefined
        : 'numeric',
  });
}

function getActor(notification) {
  return (
    notification.actor ||
    notification.profiles ||
    {}
  );
}

function getActorName(notification) {
  const actor = getActor(notification);

  return (
    actor.full_name ||
    actor.displayName ||
    actor.username ||
    'Aarush User'
  );
}

function getActorUsername(notification) {
  const actor = getActor(notification);

  if (!actor.username) {
    return '';
  }

  return actor.username.startsWith('@')
    ? actor.username
    : `@${actor.username}`;
}

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.system;
}

function NotificationIcon({ type }) {
  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <span
      style={{
        ...styles.typeIcon,
        color: config.color,
        background: config.background,
      }}
    >
      <Icon size={17} />
    </span>
  );
}

function ActorAvatar({ notification }) {
  const actor = getActor(notification);

  if (actor.avatar_url) {
    return (
      <img
        src={actor.avatar_url}
        alt=""
        loading="lazy"
        style={styles.avatar}
      />
    );
  }

  return (
    <span style={styles.placeholderAvatar}>
      <Users size={18} />
    </span>
  );
}

function NotificationSkeleton() {
  return (
    <div style={styles.skeletonCard}>
      <span style={styles.skeletonAvatar} />

      <div style={styles.skeletonCopy}>
        <span style={styles.skeletonLine} />
        <span style={styles.skeletonSmallLine} />
        <span style={styles.skeletonShortLine} />
      </div>

      <span style={styles.skeletonPreview} />
    </div>
  );
}

function GuestPrompt({ onLogin }) {
  return (
    <section style={styles.guestState}>
      <span style={styles.emptyIcon}>
        <Bell size={27} />
      </span>

      <h1>Sign in to view notifications</h1>

      <p>
        Notifications are private and available only after
        signing in.
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

function EmptyState({ filtered }) {
  return (
    <section style={styles.emptyState}>
      <span style={styles.emptyIcon}>
        {filtered ? (
          <Search size={27} />
        ) : (
          <Bell size={27} />
        )}
      </span>

      <h1>
        {filtered
          ? 'No matching notifications'
          : 'No notifications yet'}
      </h1>

      <p>
        {filtered
          ? 'Try a different search or filter.'
          : 'Activity from likes, comments, follows, messages, and stories will appear here.'}
      </p>
    </section>
  );
}

function ErrorState({ onRetry }) {
  return (
    <section style={styles.errorState}>
      <span style={styles.errorIcon}>
        <CloudOff size={27} />
      </span>

      <h1>Notifications unavailable</h1>

      <p>
        Check your connection and try loading notifications
        again.
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

function NotificationCard({
  notification,
  onOpen,
  onMarkRead,
  onDelete,
}) {
  const config = getTypeConfig(notification.type);
  const actorName = getActorName(notification);
  const actorUsername =
    getActorUsername(notification);

  return (
    <article
      style={{
        ...styles.notificationCard,
        ...(notification.read
          ? {}
          : styles.unreadNotification),
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(notification)}
        style={styles.notificationMain}
        aria-label={`Open notification: ${notification.title}`}
      >
        <ActorAvatar notification={notification} />

        <div style={styles.notificationCopy}>
          <div style={styles.notificationTop}>
            <span style={styles.actorName}>
              {actorName}
            </span>

            {actorUsername ? (
              <span style={styles.actorUsername}>
                {actorUsername}
              </span>
            ) : null}

            <span style={styles.notificationTime}>
              {formatTime(notification.created_at)}
            </span>
          </div>

          <strong style={styles.notificationTitle}>
            {notification.title}
          </strong>

          {notification.body ? (
            <span style={styles.notificationBody}>
              {notification.body}
            </span>
          ) : null}
        </div>

        <div style={styles.notificationAside}>
          <NotificationIcon type={notification.type} />

          {notification.image_url ? (
            <img
              src={notification.image_url}
              alt=""
              loading="lazy"
              style={styles.imagePreview}
            />
          ) : null}

          {!notification.read ? (
            <span
              style={styles.unreadDot}
              aria-label="Unread"
            />
          ) : null}
        </div>
      </button>

      <div style={styles.cardActions}>
        {!notification.read ? (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            style={styles.cardAction}
          >
            <Check size={13} />
            Mark read
          </button>
        ) : (
          <span style={styles.readLabel}>
            <CheckCheck size={13} />
            Read
          </span>
        )}

        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          style={styles.deleteAction}
          aria-label="Delete notification"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <span
        aria-hidden="true"
        style={{
          ...styles.typeAccent,
          background: config.color,
        }}
      />
    </article>
  );
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const pullStartRef = useRef(null);

  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);
  const [notifications, setNotifications] =
    useState([]);
  const [activeFilter, setActiveFilter] =
    useState('all');
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
    if (!user || guest) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await getUnreadCount();

      if (mountedRef.current) {
        setUnreadCount(count);
      }
    } catch {
      // Badge refresh is best effort.
    }
  }, [guest, user]);

  const loadPage = useCallback(
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
          setNotifications([]);
          setUnreadCount(0);
          setHasMore(false);
          return;
        }

        const nextNotifications =
          await getNotifications({
            page: pageNumber,
            pageSize: PAGE_SIZE,
          });

        if (!mountedRef.current) {
          return;
        }

        setNotifications((current) => {
          const combined = replace
            ? nextNotifications
            : [...current, ...nextNotifications];

          const unique = new Map();

          combined.forEach((notification) => {
            unique.set(notification.id, notification);
          });

          return [...unique.values()].sort(
            (first, second) =>
              new Date(second.created_at) -
              new Date(first.created_at)
          );
        });

        setPage(pageNumber);
        setHasMore(
          nextNotifications.length === PAGE_SIZE
        );

        await loadUnread();
      } catch (loadError) {
        if (mountedRef.current) {
          setError(
            loadError.message ||
              'Unable to load notifications.'
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

  const refreshNotifications = useCallback(() => {
    loadPage({
      pageNumber: 0,
      replace: true,
      refresh: true,
    });
  }, [loadPage]);

  useEffect(() => {
    mountedRef.current = true;

    loadPage({
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
          loadPage({
            pageNumber: page + 1,
          });
        }
      },
      {
        rootMargin: '600px 0px',
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [guest, hasMore, loadPage, page]);

  useEffect(() => {
    if (!user || guest) {
      return undefined;
    }

    const cleanup = subscribeToNotifications(
      (payload) => {
        if (!mountedRef.current) {
          return;
        }

        if (
          payload.new?.recipient_id &&
          payload.new.recipient_id !== user.id
        ) {
          return;
        }

        if (
          payload.eventType === 'INSERT' &&
          payload.new
        ) {
          setNotifications((current) => {
            const withoutDuplicate = current.filter(
              (notification) =>
                notification.id !== payload.new.id
            );

            return [payload.new, ...withoutDuplicate];
          });

          setUnreadCount((count) => count + 1);
          showNotice('New notification received.');
        }

        if (
          payload.eventType === 'UPDATE' &&
          payload.new
        ) {
          setNotifications((current) =>
            current.map((notification) =>
              notification.id === payload.new.id
                ? {
                    ...notification,
                    ...payload.new,
                  }
                : notification
            )
          );

          if (payload.new.read) {
            setUnreadCount((count) =>
              Math.max(0, count - 1)
            );
          }
        }

        if (
          payload.eventType === 'DELETE' &&
          payload.old
        ) {
          setNotifications((current) =>
            current.filter(
              (notification) =>
                notification.id !== payload.old.id
            )
          );
        }
      }
    );

    return () => {
      cleanup?.();
    };
  }, [guest, showNotice, user]);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'unread' &&
          !notification.read) ||
        notification.type === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const actor = getActor(notification);

      const searchableText = [
        actor.username,
        actor.full_name,
        notification.title,
        notification.body,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    activeFilter,
    notifications,
    search,
  ]);

  const handleMarkRead = useCallback(
    async (notificationId) => {
      const previous = notifications.find(
        (notification) =>
          notification.id === notificationId
      );

      if (!previous || previous.read || guest) {
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await markAsRead(notificationId);
      } catch (markError) {
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === notificationId
              ? previous
              : notification
          )
        );

        setUnreadCount((count) => count + 1);
        showNotice(
          markError.message ||
            'Unable to mark notification as read.'
        );
      }
    },
    [guest, notifications, showNotice]
  );

  const handleMarkAllRead = useCallback(async () => {
    if (guest || unreadCount === 0) {
      return;
    }

    const previous = notifications;

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
    setUnreadCount(0);

    try {
      await markAllAsRead();
      showNotice('All notifications marked as read.');
    } catch (markError) {
      setNotifications(previous);
      setUnreadCount(
        previous.filter(
          (notification) => !notification.read
        ).length
      );

      showNotice(
        markError.message ||
          'Unable to mark all notifications as read.'
      );
    }
  }, [
    guest,
    notifications,
    showNotice,
    unreadCount,
  ]);

  const handleDelete = useCallback(
    async (notificationId) => {
      if (guest) {
        showNotice(
          'Sign in to manage your notifications.'
        );
        return;
      }

      const previous = notifications;
      const deleted = notifications.find(
        (notification) =>
          notification.id === notificationId
      );

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !== notificationId
        )
      );

      if (deleted && !deleted.read) {
        setUnreadCount((count) =>
          Math.max(0, count - 1)
        );
      }

      try {
        await deleteNotification(notificationId);
      } catch (deleteError) {
        setNotifications(previous);
        setUnreadCount(
          previous.filter(
            (notification) => !notification.read
          ).length
        );

        showNotice(
          deleteError.message ||
            'Unable to delete notification.'
        );
      }
    },
    [guest, notifications, showNotice]
  );

  const handleOpen = useCallback(
    async (notification) => {
      if (!notification.read) {
        await handleMarkRead(notification.id);
      }

      const type = notification.type;

      if (
        type === 'like' ||
        type === 'comment' ||
        type === 'mention' ||
        type === 'tag'
      ) {
        if (notification.entity_id) {
          navigate(`/post/${notification.entity_id}`);
        }

        return;
      }

      if (
        type === 'story_view' ||
        type === 'story_reply'
      ) {
        if (notification.entity_id) {
          navigate(`/story/${notification.entity_id}`);
        }

        return;
      }

      if (type === 'message') {
        if (notification.entity_id) {
          navigate(
            `/chat/${notification.entity_id}`
          );
        }

        return;
      }

      if (type === 'follow') {
        if (notification.actor_id) {
          navigate(`/profile/${notification.actor_id}`);
        } else {
          navigate('/profile');
        }

        return;
      }

      if (type === 'security') {
        navigate('/security-center');
        return;
      }

      navigate('/notifications');
    },
    [handleMarkRead, navigate]
  );

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
      refreshNotifications();
      return;
    }

    setPullDistance(0);
  }, [pullDistance, refreshNotifications]);

  return (
    <div
      style={styles.page}
      onTouchStart={handlePullStart}
      onTouchMove={handlePullMove}
      onTouchEnd={handlePullEnd}
    >
      <TopBar
        pageTitle="Notifications"
        notificationCount={unreadCount}
        showBackButton
        onBack={() => navigate(-1)}
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

        {guest ? (
          <GuestPrompt
            onLogin={() => navigate('/login')}
          />
        ) : (
          <>
            <section style={styles.hero}>
              <div>
                <h1 style={styles.title}>
                  Notifications
                </h1>

                <p style={styles.subtitle}>
                  Stay updated with activity across Aarush.
                </p>
              </div>

              <button
                type="button"
                onClick={refreshNotifications}
                disabled={refreshing}
                style={styles.refreshButton}
                aria-label="Refresh notifications"
              >
                <RefreshCw
                  size={16}
                  style={{
                    animation: refreshing
                      ? 'aarush-notification-spin 900ms linear infinite'
                      : 'none',
                  }}
                />
              </button>
            </section>

            <div style={styles.searchBox}>
              <Search size={17} />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search notifications"
                style={styles.searchInput}
                aria-label="Search notifications"
              />

              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={styles.clearButton}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>

            <div style={styles.filterRow}>
              {FILTERS.map((filter) => (
                <button
                  type="button"
                  key={filter.key}
                  onClick={() =>
                    setActiveFilter(filter.key)
                  }
                  style={{
                    ...styles.filterButton,
                    ...(activeFilter === filter.key
                      ? styles.activeFilterButton
                      : {}),
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div style={styles.listHeader}>
              <div>
                <h2 style={styles.listTitle}>
                  Recent activity
                </h2>

                <p style={styles.listSubtitle}>
                  {unreadCount
                    ? `${unreadCount} unread`
                    : 'You are all caught up'}
                </p>
              </div>

              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={styles.markAllButton}
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              ) : null}
            </div>

            {loading ? (
              <div style={styles.list}>
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
              </div>
            ) : error && !notifications.length ? (
              <ErrorState
                onRetry={() =>
                  loadPage({
                    pageNumber: 0,
                    replace: true,
                    refresh: true,
                  })
                }
              />
            ) : !filteredNotifications.length ? (
              <EmptyState
                filtered={
                  Boolean(search) ||
                  activeFilter !== 'all'
                }
              />
            ) : (
              <>
                <div style={styles.list}>
                  {filteredNotifications.map(
                    (notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onOpen={handleOpen}
                        onMarkRead={handleMarkRead}
                        onDelete={handleDelete}
                      />
                    )
                  )}
                </div>

                {loadingMore ? (
                  <div style={styles.loadingMore}>
                    <RefreshCw size={16} />
                    Loading more notifications…
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
        @keyframes aarush-notification-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes aarush-notification-pulse {
          0%, 100% {
            opacity: 0.4;
          }

          50% {
            opacity: 0.95;
          }
        }

        @keyframes aarush-notification-new {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
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
    marginBottom: '0.8rem',
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

  refreshButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.65rem',
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

  clearButton: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#cbd6ea',
    background: 'rgba(255,255,255,0.08)',
    cursor: 'pointer',
  },

  filterRow: {
    display: 'flex',
    gap: '0.4rem',
    overflowX: 'auto',
    marginBottom: '0.9rem',
    scrollbarWidth: 'none',
  },

  filterButton: {
    minHeight: '2.25rem',
    flexShrink: 0,
    padding: '0 0.75rem',
    border: 0,
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.66rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  activeFilterButton: {
    color: '#fff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.3), rgba(77,215,255,0.15))',
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
    fontSize: '0.65rem',
  },

  markAllButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.4rem 0.55rem',
    border: '1px solid rgba(124,92,255,0.22)',
    borderRadius: '999px',
    color: '#c8bcff',
    background: 'rgba(124,92,255,0.09)',
    fontSize: '0.61rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  list: {
    display: 'grid',
    gap: '0.5rem',
  },

  notificationCard: {
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '1rem',
    background: 'rgba(15,19,30,0.9)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
    animation:
      'aarush-notification-new 180ms ease-out',
  },

  unreadNotification: {
    borderColor: 'rgba(124,92,255,0.28)',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.13), rgba(15,19,30,0.94))',
  },

  typeAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '0.18rem',
  },

  notificationMain: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    padding: '0.75rem 0.75rem 0.5rem 0.9rem',
    border: 0,
    color: '#f4f7ff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  avatar: {
    width: '2.65rem',
    height: '2.65rem',
    objectFit: 'cover',
    flexShrink: 0,
    border: '2px solid rgba(124,92,255,0.55)',
    borderRadius: '999px',
  },

  placeholderAvatar: {
    width: '2.65rem',
    height: '2.65rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '2px solid rgba(124,92,255,0.5)',
    borderRadius: '999px',
    color: '#dce5f8',
    background:
      'linear-gradient(135deg, #1c2740, #342258)',
  },

  notificationCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.22rem',
    flex: 1,
  },

  notificationTop: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.28rem',
  },

  actorName: {
    fontSize: '0.72rem',
    fontWeight: 850,
  },

  actorUsername: {
    color: '#8f9cb8',
    fontSize: '0.61rem',
  },

  notificationTime: {
    marginLeft: 'auto',
    color: '#8290ad',
    fontSize: '0.58rem',
  },

  notificationTitle: {
    color: '#eaf0ff',
    fontSize: '0.72rem',
    lineHeight: 1.4,
  },

  notificationBody: {
    color: '#aab6cf',
    fontSize: '0.67rem',
    lineHeight: 1.45,
  },

  notificationAside: {
    display: 'grid',
    justifyItems: 'end',
    gap: '0.35rem',
    flexShrink: 0,
  },

  typeIcon: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
  },

  imagePreview: {
    width: '2.5rem',
    height: '2.5rem',
    objectFit: 'cover',
    borderRadius: '0.55rem',
  },

  unreadDot: {
    width: '0.45rem',
    height: '0.45rem',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #ff4fd8, #4dd7ff)',
    boxShadow: '0 0 10px rgba(77,215,255,0.5)',
  },

  cardActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.45rem',
    padding: '0 0.75rem 0.65rem',
  },

  cardAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.4rem',
    border: 0,
    borderRadius: '999px',
    color: '#9deeff',
    background: 'transparent',
    fontSize: '0.59rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  readLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#8290ad',
    fontSize: '0.59rem',
  },

  deleteAction: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.08)',
    cursor: 'pointer',
  },

  skeletonCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    minHeight: '4.5rem',
    padding: '0.75rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '1rem',
    background: 'rgba(15,19,30,0.85)',
    animation:
      'aarush-notification-pulse 1.4s ease-in-out infinite',
  },

  skeletonAvatar: {
    width: '2.65rem',
    height: '2.65rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.1)',
  },

  skeletonCopy: {
    display: 'grid',
    gap: '0.38rem',
    flex: 1,
  },

  skeletonLine: {
    width: '8.5rem',
    height: '0.62rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.1)',
  },

  skeletonSmallLine: {
    width: '6.2rem',
    height: '0.5rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.07)',
  },

  skeletonShortLine: {
    width: '4.4rem',
    height: '0.45rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
  },

  skeletonPreview: {
    width: '2rem',
    height: '2rem',
    borderRadius: '0.5rem',
    background: 'rgba(255,255,255,0.08)',
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

  guestState: {
    minHeight: '70vh',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.6rem',
    padding: '1rem',
    textAlign: 'center',
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
};