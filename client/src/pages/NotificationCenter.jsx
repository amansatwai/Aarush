import { useMemo, useState } from 'react';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  FileText,
  Heart,
  LockKeyhole,
  MessageCircle,
  MoreHorizontal,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const CATEGORY_OPTIONS = [
  'All',
  'Messages',
  'Stories',
  'Reels',
  'Posts',
  'Mentions',
  'Follows',
  'Privacy',
  'Security',
  'System',
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notification-1',
    category: 'Messages',
    type: 'message',
    username: '@aman.satwai',
    displayName: 'Aman Satwai',
    avatar: 'https://i.pravatar.cc/120?img=11',
    message: 'sent you a new message.',
    time: '2 min ago',
    date: 'Today',
    read: false,
    action: 'Open Chat',
  },
  {
    id: 'notification-2',
    category: 'Messages',
    type: 'voice',
    username: '@creator.lab',
    displayName: 'Creator Lab',
    avatar: 'https://i.pravatar.cc/120?img=32',
    message: 'sent you a voice message.',
    time: '18 min ago',
    date: 'Today',
    read: false,
    action: 'Listen',
  },
  {
    id: 'notification-3',
    category: 'Stories',
    type: 'story-view',
    username: '@neha.designs',
    displayName: 'Neha Designs',
    avatar: 'https://i.pravatar.cc/120?img=47',
    message: 'viewed your story.',
    time: '35 min ago',
    date: 'Today',
    read: true,
    action: 'View Story',
  },
  {
    id: 'notification-4',
    category: 'Stories',
    type: 'story-reaction',
    username: '@rohan.builds',
    displayName: 'Rohan Builds',
    avatar: 'https://i.pravatar.cc/120?img=14',
    message: 'reacted to your story.',
    time: '1 hr ago',
    date: 'Today',
    read: true,
    action: 'View Story',
  },
  {
    id: 'notification-5',
    category: 'Stories',
    type: 'close-friends',
    username: '@arush.dev',
    displayName: 'Aarush',
    avatar: 'https://i.pravatar.cc/120?img=12',
    message: 'has a new Close Friends story.',
    time: '2 hrs ago',
    date: 'Today',
    read: false,
    action: 'View Story',
  },
  {
    id: 'notification-6',
    category: 'Reels',
    type: 'reel-like',
    username: '@mira.visuals',
    displayName: 'Mira Visuals',
    avatar: 'https://i.pravatar.cc/120?img=44',
    message: 'liked your reel.',
    time: '3 hrs ago',
    date: 'Today',
    read: true,
    action: 'View Reel',
  },
  {
    id: 'notification-7',
    category: 'Posts',
    type: 'comment',
    username: '@sahil.codes',
    displayName: 'Sahil Codes',
    avatar: 'https://i.pravatar.cc/120?img=52',
    message: 'commented on your post.',
    time: 'Yesterday',
    date: 'Yesterday',
    read: false,
    action: 'View Post',
  },
  {
    id: 'notification-8',
    category: 'Mentions',
    type: 'mention',
    username: '@priya.creates',
    displayName: 'Priya Creates',
    avatar: 'https://i.pravatar.cc/120?img=25',
    message: 'mentioned you in a story.',
    time: 'Yesterday',
    date: 'Yesterday',
    read: true,
    action: 'Open Mention',
  },
  {
    id: 'notification-9',
    category: 'Follows',
    type: 'follow',
    username: '@dev.journal',
    displayName: 'Dev Journal',
    avatar: 'https://i.pravatar.cc/120?img=8',
    message: 'started following you.',
    time: 'Yesterday',
    date: 'Yesterday',
    read: false,
    action: 'View Profile',
  },
  {
    id: 'notification-10',
    category: 'Privacy',
    type: 'screenshot',
    username: 'Aarush Privacy',
    displayName: 'Privacy Monitor',
    avatar: '',
    message: 'detected a screenshot attempt.',
    time: '2 days ago',
    date: '2 days ago',
    read: true,
    action: 'Review',
  },
  {
    id: 'notification-11',
    category: 'Security',
    type: 'login',
    username: 'Aarush Security',
    displayName: 'Security Center',
    avatar: '',
    message: 'detected a new login.',
    time: '3 days ago',
    date: '3 days ago',
    read: false,
    action: 'Review Activity',
  },
  {
    id: 'notification-12',
    category: 'System',
    type: 'sync',
    username: 'Aarush System',
    displayName: 'Aarush System',
    avatar: '',
    message: 'completed synchronization.',
    time: '4 days ago',
    date: '4 days ago',
    read: true,
    action: 'View Details',
  },
];

function getNotificationIcon(notification) {
  if (notification.category === 'Messages') {
    return notification.type === 'voice'
      ? BellRing
      : MessageCircle;
  }

  if (notification.category === 'Stories') {
    return Bell;
  }

  if (notification.category === 'Reels') {
    return Play;
  }

  if (notification.category === 'Posts') {
    return notification.type === 'comment'
      ? MessageCircle
      : Heart;
  }

  if (notification.category === 'Mentions') {
    return Send;
  }

  if (notification.category === 'Follows') {
    return UserPlus;
  }

  if (notification.category === 'Privacy') {
    return ShieldCheck;
  }

  if (notification.category === 'Security') {
    return LockKeyhole;
  }

  return RefreshCw;
}

function getCategoryIcon(category) {
  const icons = {
    All: Bell,
    Messages: MessageCircle,
    Stories: Bell,
    Reels: Play,
    Posts: Heart,
    Mentions: Send,
    Follows: UserPlus,
    Privacy: ShieldCheck,
    Security: LockKeyhole,
    System: RefreshCw,
  };

  return icons[category] || Bell;
}

function NotificationAvatar({ notification }) {
  if (notification.avatar) {
    return (
      <img
        src={notification.avatar}
        alt={`${notification.displayName} avatar`}
        style={styles.avatar}
      />
    );
  }

  return (
    <span style={styles.systemAvatar}>
      <ShieldCheck size={18} />
    </span>
  );
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(
    INITIAL_NOTIFICATIONS
  );
  const [activeCategory, setActiveCategory] = useState('All');
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState('');

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'All') {
      return notifications;
    }

    return notifications.filter(
      (notification) =>
        notification.category === activeCategory
    );
  }, [activeCategory, notifications]);

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
    setMessage('All notifications marked as read.');
  };

  const deleteNotification = (id) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  };

  const clearCategory = () => {
    if (activeCategory === 'All') {
      setNotifications([]);
      setMessage('All notifications cleared.');
      return;
    }

    setNotifications((current) =>
      current.filter(
        (notification) =>
          notification.category !== activeCategory
      )
    );

    setMessage(`${activeCategory} notifications cleared.`);
  };

  const clearAll = () => {
    setNotifications([]);
    setMenuOpen(false);
    setMessage('All notifications cleared.');
  };

  const openNotification = (notification) => {
    markAsRead(notification.id);
    setMessage(`${notification.action} selected.`);
  };

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Notifications"
        notificationCount={unreadCount}
        showBackButton
      />

      <main style={styles.content}>
        <section style={styles.heroCard}>
          <span style={styles.heroIcon}>
            <Bell size={22} />
          </span>

          <div style={styles.heroCopy}>
            <h1 style={styles.title}>Notification Center</h1>
            <p style={styles.subtitle}>
              Stay updated with messages, stories, security, and
              activity across Aarush.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Notification actions"
            style={styles.moreButton}
          >
            <MoreHorizontal size={19} />
          </button>

          {menuOpen ? (
            <div style={styles.actionsMenu}>
              <button
                type="button"
                onClick={() => {
                  markAllAsRead();
                  setMenuOpen(false);
                }}
                style={styles.menuButton}
              >
                <CheckCheck size={15} />
                Mark all as read
              </button>

              <button
                type="button"
                onClick={() => {
                  clearCategory();
                  setMenuOpen(false);
                }}
                style={styles.menuButton}
              >
                <X size={15} />
                Clear category
              </button>

              <button
                type="button"
                onClick={clearAll}
                style={styles.menuButton}
              >
                <X size={15} />
                Clear all notifications
              </button>
            </div>
          ) : null}
        </section>

        <section style={styles.filterCard}>
          <div style={styles.filterScroller}>
            {CATEGORY_OPTIONS.map((category) => {
              const Icon = getCategoryIcon(category);
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  style={{
                    ...styles.filterButton,
                    ...(active
                      ? styles.activeFilterButton
                      : {}),
                  }}
                >
                  <Icon size={14} />
                  {category}
                </button>
              );
            })}
          </div>
        </section>

        {filteredNotifications.length === 0 ? (
          <EmptyState
            category={activeCategory}
            onReset={() => setActiveCategory('All')}
          />
        ) : (
          <section style={styles.notificationList}>
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onOpen={openNotification}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </section>
        )}

        {message ? (
          <div role="status" style={styles.toast}>
            {message}

            <button
              type="button"
              onClick={() => setMessage('')}
              style={styles.dismissButton}
              aria-label="Dismiss message"
            >
              <X size={14} />
            </button>
          </div>
        ) : null}
      </main>

      <BottomNav notificationCount={unreadCount} />
    </div>
  );
}

function NotificationCard({
  notification,
  onOpen,
  onMarkRead,
  onDelete,
}) {
  const Icon = getNotificationIcon(notification);

  return (
    <article
      style={{
        ...styles.notificationCard,
        ...(notification.read
          ? styles.readNotification
          : styles.unreadNotification),
      }}
    >
      <NotificationAvatar notification={notification} />

      <div style={styles.notificationBody}>
        <div style={styles.notificationTopLine}>
          <div style={styles.identity}>
            <strong>{notification.username}</strong>
            {!notification.read ? (
              <span
                aria-label="Unread notification"
                style={styles.unreadDot}
              />
            ) : null}
          </div>

          <span style={styles.categoryIcon}>
            <Icon size={14} />
          </span>
        </div>

        <p style={styles.notificationMessage}>
          {notification.message}
        </p>

        <div style={styles.metaRow}>
          <span style={styles.time}>
            <Clock3 size={12} />
            {notification.time}
          </span>

          <span style={styles.date}>
            {notification.date}
          </span>
        </div>

        <div style={styles.cardActions}>
          {notification.action ? (
            <button
              type="button"
              onClick={() => onOpen(notification)}
              style={styles.primaryAction}
            >
              {notification.action}
            </button>
          ) : null}

          {!notification.read ? (
            <button
              type="button"
              onClick={() => onMarkRead(notification.id)}
              style={styles.secondaryAction}
            >
              Mark as read
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => onDelete(notification.id)}
            aria-label="Delete notification"
            style={styles.deleteAction}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ category, onReset }) {
  return (
    <section style={styles.emptyState}>
      <span style={styles.emptyIcon}>
        <Bell size={25} />
      </span>

      <h2 style={styles.emptyTitle}>
        No {category === 'All' ? '' : `${category} `}notifications
      </h2>

      <p style={styles.emptyText}>
        You’re all caught up. New activity will appear here.
      </p>

      {category !== 'All' ? (
        <button
          type="button"
          onClick={onReset}
          style={styles.primaryAction}
        >
          View all notifications
        </button>
      ) : null}
    </section>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '6.8rem',
    background:
      'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
    color: '#f4f7ff',
  },

  content: {
    position: 'relative',
    width: '100%',
    maxWidth: '820px',
    margin: '0 auto',
    padding: '1rem 0.9rem',
    display: 'grid',
    gap: '0.8rem',
  },

  heroCard: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
  },

  heroIcon: {
    width: '2.8rem',
    height: '2.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.9rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.28), rgba(77,215,255,0.14))',
    color: '#dce8ff',
  },

  heroCopy: {
    minWidth: 0,
    flex: 1,
  },

  title: {
    margin: 0,
    color: '#f5f8ff',
    fontSize: '1.05rem',
    fontWeight: 850,
  },

  subtitle: {
    margin: '0.28rem 0 0',
    color: '#96a3bf',
    fontSize: '0.73rem',
    lineHeight: 1.5,
  },

  moreButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.09)',
    background: 'rgba(255,255,255,0.05)',
    color: '#dce5f8',
    cursor: 'pointer',
  },

  actionsMenu: {
    position: 'absolute',
    top: '4.3rem',
    right: '0.8rem',
    zIndex: 5,
    width: 'min(250px, calc(100% - 1.6rem))',
    padding: '0.4rem',
    borderRadius: '0.95rem',
    background: 'rgba(18,23,37,0.98)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 18px 45px rgba(0,0,0,0.42)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  },

  menuButton: {
    width: '100%',
    minHeight: '2.35rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.55rem 0.65rem',
    border: 0,
    borderRadius: '0.65rem',
    background: 'transparent',
    color: '#dce5f8',
    textAlign: 'left',
    fontSize: '0.72rem',
    fontWeight: 750,
    cursor: 'pointer',
  },

  filterCard: {
    padding: '0.45rem',
    borderRadius: '1rem',
    background: 'rgba(15,19,30,0.82)',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },

  filterScroller: {
    display: 'flex',
    gap: '0.4rem',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },

  filterButton: {
    minHeight: '2.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    flexShrink: 0,
    padding: '0 0.7rem',
    border: '1px solid transparent',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.04)',
    color: '#96a3bf',
    fontSize: '0.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  activeFilterButton: {
    borderColor: 'rgba(124,92,255,0.34)',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(77,215,255,0.12))',
    color: '#fff',
  },

  notificationList: {
    display: 'grid',
    gap: '0.6rem',
  },

  notificationCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.7rem',
    padding: '0.8rem',
    borderRadius: '1.05rem',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 14px 34px rgba(0,0,0,0.2)',
    transition:
      'transform 180ms ease, border-color 180ms ease, background 180ms ease',
  },

  unreadNotification: {
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.14), rgba(15,19,30,0.94))',
    borderColor: 'rgba(124,92,255,0.25)',
  },

  readNotification: {
    background: 'rgba(15,19,30,0.86)',
  },

  avatar: {
    width: '2.7rem',
    height: '2.7rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '999px',
    border: '2px solid rgba(124,92,255,0.35)',
  },

  systemAvatar: {
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
  },

  notificationBody: {
    minWidth: 0,
    flex: 1,
  },

  notificationTopLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },

  identity: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },

  identityStrong: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  unreadDot: {
    width: '0.42rem',
    height: '0.42rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: '#4dd7ff',
    boxShadow: '0 0 10px rgba(77,215,255,0.7)',
  },

  categoryIcon: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.6rem',
    background: 'rgba(255,255,255,0.05)',
    color: '#9daaf0',
  },

  notificationMessage: {
    margin: '0.3rem 0 0',
    color: '#d8e2f5',
    fontSize: '0.76rem',
    lineHeight: 1.4,
  },

  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    marginTop: '0.35rem',
    color: '#8290ad',
    fontSize: '0.64rem',
  },

  time: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
  },

  date: {
    color: '#71809e',
  },

  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginTop: '0.6rem',
  },

  primaryAction: {
    minHeight: '2rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.65rem',
    border: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
    fontSize: '0.64rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  secondaryAction: {
    minHeight: '2rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.6rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.05)',
    color: '#cbd6ec',
    fontSize: '0.64rem',
    fontWeight: 750,
    cursor: 'pointer',
  },

  deleteAction: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    marginLeft: 'auto',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    background: 'transparent',
    color: '#8290ad',
    cursor: 'pointer',
  },

  emptyState: {
    display: 'grid',
    justifyItems: 'center',
    padding: '3.2rem 1.2rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.9)',
    border: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'center',
  },

  emptyIcon: {
    width: '4.2rem',
    height: '4.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))',
    color: '#dce8ff',
  },

  emptyTitle: {
    margin: '0.9rem 0 0',
    color: '#f5f8ff',
    fontSize: '1rem',
    fontWeight: 850,
  },

  emptyText: {
    margin: '0.4rem 0 1rem',
    color: '#96a3bf',
    fontSize: '0.76rem',
  },

  toast: {
    position: 'fixed',
    right: '1rem',
    bottom: '6.2rem',
    left: '1rem',
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    width: 'fit-content',
    maxWidth: 'calc(100% - 2rem)',
    margin: '0 auto',
    padding: '0.7rem 0.85rem',
    borderRadius: '999px',
    background: 'rgba(17,22,35,0.96)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
    color: '#eaf0ff',
    fontSize: '0.72rem',
    fontWeight: 750,
  },

  dismissButton: {
    width: '1.6rem',
    height: '1.6rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    color: '#aab6cf',
    cursor: 'pointer',
  },
};