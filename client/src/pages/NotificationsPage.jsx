import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  AtSign,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  Flag,
  Heart,
  Mail,
  MessageCircle,
  Play,
  ShieldAlert,
  Sparkles,
  Tag,
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react';

const notificationsData = [
  {
    id: 'notification-1',
    group: 'Today',
    category: 'likes',
    type: 'like',
    username: 'design.loop',
    avatar: 'D',
    verified: true,
    text: 'liked your post',
    timestamp: '2m',
    unread: true,
    action: 'Like back',
    target: 'post',
    thumbnail:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'notification-2',
    group: 'Today',
    category: 'comments',
    type: 'comment',
    username: 'pixel.hub',
    avatar: 'P',
    verified: false,
    text: 'commented on your post',
    timestamp: '12m',
    unread: true,
    action: 'Reply',
    target: 'post',
    thumbnail:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'notification-3',
    group: 'Today',
    category: 'follows',
    type: 'follow',
    username: 'creator.lab',
    avatar: 'C',
    verified: false,
    text: 'started following you',
    timestamp: '28m',
    unread: true,
    action: 'Follow back',
    target: 'profile',
    thumbnail: null,
  },
  {
    id: 'notification-4',
    group: 'Today',
    category: 'mentions',
    type: 'mention',
    username: 'arush.team',
    avatar: 'A',
    verified: true,
    text: 'mentioned you in a comment',
    timestamp: '43m',
    unread: false,
    action: 'View post',
    target: 'post',
    thumbnail:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'notification-5',
    group: 'Today',
    category: 'messages',
    type: 'message',
    username: 'arush.dev',
    avatar: 'A',
    verified: true,
    text: 'sent you a new message',
    timestamp: '1h',
    unread: true,
    action: 'Open chat',
    target: 'chat',
    thumbnail: null,
  },
  {
    id: 'notification-6',
    group: 'Today',
    category: 'stories',
    type: 'story',
    username: 'travel.frame',
    avatar: 'T',
    verified: false,
    text: 'reacted to your story',
    timestamp: '2h',
    unread: false,
    action: 'Open story',
    target: 'story',
    thumbnail:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'notification-7',
    group: 'Yesterday',
    category: 'reels',
    type: 'reel',
    username: 'video.studio',
    avatar: 'V',
    verified: true,
    text: 'shared your reel',
    timestamp: 'Yesterday',
    unread: false,
    action: 'Open reel',
    target: 'reel',
    thumbnail:
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'notification-8',
    group: 'Yesterday',
    category: 'follows',
    type: 'followRequest',
    username: 'motion.frame',
    avatar: 'M',
    verified: true,
    text: 'requested to follow you',
    timestamp: 'Yesterday',
    unread: false,
    action: 'Accept request',
    target: 'profile',
    thumbnail: null,
  },
  {
    id: 'notification-9',
    group: 'This week',
    category: 'system',
    type: 'login',
    username: 'Aarush Security',
    avatar: 'S',
    verified: true,
    text: 'new device login detected',
    timestamp: 'Mon',
    unread: true,
    action: 'Review activity',
    target: 'security',
    thumbnail: null,
  },
  {
    id: 'notification-10',
    group: 'This week',
    category: 'live',
    type: 'live',
    username: 'creator.network',
    avatar: 'N',
    verified: true,
    text: 'started a live video',
    timestamp: 'Sun',
    unread: false,
    action: 'Watch live',
    target: 'live',
    thumbnail:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'notification-11',
    group: 'Earlier',
    category: 'messages',
    type: 'call',
    username: 'design.loop',
    avatar: 'D',
    verified: true,
    text: 'missed your video call',
    timestamp: '2 weeks ago',
    unread: false,
    action: 'Open chat',
    target: 'chat',
    thumbnail: null,
  },
];

const categoryOptions = [
  { key: 'all', label: 'Notifications', icon: Bell },
  { key: 'likes', label: 'Likes', icon: Heart },
  { key: 'comments', label: 'Comments', icon: MessageCircle },
  { key: 'mentions', label: 'Mentions', icon: AtSign },
  { key: 'follows', label: 'Follows', icon: UserPlus },
  { key: 'messages', label: 'Messages', icon: Mail },
  { key: 'stories', label: 'Story Activity', icon: Sparkles },
  { key: 'reels', label: 'Reels Activity', icon: Play },
];

const filterOptions = [
  { key: 'all', label: 'All notifications' },
  { key: 'unread', label: 'Unread only' },
  { key: 'read', label: 'Read only' },
  { key: 'mentions', label: 'Mentions only' },
  { key: 'follows', label: 'Follows only' },
  { key: 'messages', label: 'Messages only' },
];

const notificationSettings = [
  ['Push notifications', true],
  ['Email notifications', false],
  ['SMS notifications', false],
  ['Likes', true],
  ['Comments', true],
  ['Mentions', true],
  ['Messages', true],
  ['Stories', true],
  ['Reels', true],
  ['Live', true],
  ['Security alerts', true],
  ['Marketing notifications', false],
];

function Avatar({ item }) {
  return (
    <div
      style={{
        width: '3rem',
        height: '3rem',
        borderRadius: '999px',
        padding: '2.5px',
        background: 'linear-gradient(135deg, #7c5cff, #ff4fd8 48%, #4dd7ff)',
        boxShadow: '0 0 18px rgba(124,92,255,0.17)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, #151a28, #252d48)',
          color: '#fff',
          fontWeight: 900,
          fontSize: '0.94rem',
        }}
      >
        {item.avatar}
      </div>
    </div>
  );
}

function NotificationIcon({ type }) {
  const iconMap = {
    like: Heart,
    comment: MessageCircle,
    mention: AtSign,
    follow: UserPlus,
    followRequest: UserCheck,
    message: Mail,
    story: Sparkles,
    reel: Play,
    live: Video,
    login: ShieldAlert,
  };

  const Icon = iconMap[type] || Bell;

  return (
    <span
      style={{
        position: 'absolute',
        left: '2.25rem',
        bottom: '-0.18rem',
        width: '1.35rem',
        height: '1.35rem',
        borderRadius: '999px',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
        color: '#fff',
        border: '2px solid #111724',
        boxShadow: '0 0 12px rgba(77,215,255,0.22)',
      }}
    >
      <Icon size={10} fill={type === 'like' ? 'currentColor' : 'none'} />
    </span>
  );
}

function QuickAction({ item, onClick }) {
  const [completed, setCompleted] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    setCompleted(true);

    if (typeof onClick === 'function') {
      onClick(item);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        border: 0,
        borderRadius: '999px',
        padding: '0.5rem 0.7rem',
        background: completed
          ? 'rgba(255,255,255,0.1)'
          : 'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(77,215,255,0.12))',
        color: '#fff',
        fontSize: '0.72rem',
        fontWeight: 850,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {completed ? 'Done' : item.action}
    </button>
  );
}

function NotificationItem({ item, onRead, onAction }) {
  return (
    <article
      onClick={() => onRead(item)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        padding: '0.8rem',
        borderRadius: '1.1rem',
        border: `1px solid ${
          item.unread ? 'rgba(124,92,255,0.2)' : 'rgba(255,255,255,0.07)'
        }`,
        background: item.unread
          ? 'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(77,215,255,0.05))'
          : 'rgba(255,255,255,0.04)',
        cursor: 'pointer',
        transition: 'transform 180ms ease, background 180ms ease',
      }}
    >
      {item.unread ? (
        <span
          style={{
            position: 'absolute',
            left: '0.28rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '0.32rem',
            height: '0.32rem',
            borderRadius: '999px',
            background: '#4dd7ff',
            boxShadow: '0 0 10px rgba(77,215,255,0.5)',
          }}
        />
      ) : null}

      <div
        style={{
          position: 'relative',
          marginLeft: item.unread ? '0.25rem' : 0,
        }}
      >
        <Avatar item={item} />
        <NotificationIcon type={item.type} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexWrap: 'wrap',
          }}
        >
          <strong style={{ color: '#f5f8ff', fontSize: '0.86rem' }}>
            {item.username}
          </strong>

          {item.verified ? (
            <span
              style={{
                width: '1rem',
                height: '1rem',
                borderRadius: '999px',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 900,
              }}
            >
              ✓
            </span>
          ) : null}
        </div>

        <p
          style={{
            margin: '0.22rem 0',
            color: '#c4cee2',
            fontSize: '0.8rem',
            lineHeight: 1.35,
          }}
        >
          {item.text}
        </p>

        <span style={{ color: '#8794af', fontSize: '0.72rem', fontWeight: 700 }}>
          {item.timestamp}
        </span>
      </div>

      {item.thumbnail ? (
        <img
          src={item.thumbnail}
          alt=""
          style={{
            width: '3.2rem',
            height: '3.2rem',
            borderRadius: '0.75rem',
            objectFit: 'cover',
            border: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        />
      ) : null}

      <QuickAction item={item} onClick={onAction} />
    </article>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.7rem',
        padding: '0.7rem',
        borderRadius: '0.9rem',
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.07)',
        color: '#dce5f8',
        fontSize: '0.82rem',
        fontWeight: 750,
        cursor: 'pointer',
      }}
    >
      <span>{label}</span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <span
        style={{
          width: '2.7rem',
          height: '1.5rem',
          borderRadius: '999px',
          padding: '0.16rem',
          display: 'flex',
          justifyContent: checked ? 'flex-end' : 'flex-start',
          background: checked
            ? 'linear-gradient(90deg, #7c5cff, #4dd7ff)'
            : 'rgba(255,255,255,0.13)',
          transition: 'background 180ms ease',
        }}
      >
        <span
          style={{
            width: '1.18rem',
            height: '1.18rem',
            borderRadius: '999px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.24)',
          }}
        />
      </span>
    </label>
  );
}

function Section({ title, icon: Icon, children, action }) {
  return (
    <section
      style={{
        padding: '0.95rem',
        borderRadius: '1.25rem',
        background: 'rgba(15,19,30,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.8rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
          }}
        >
          <span
            style={{
              width: '1.9rem',
              height: '1.9rem',
              borderRadius: '999px',
              display: 'grid',
              placeItems: 'center',
              background:
                'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
              color: '#fff',
            }}
          >
            <Icon size={14} />
          </span>

          <h2
            style={{
              margin: 0,
              color: '#f5f8ff',
              fontSize: '0.98rem',
              fontWeight: 850,
            }}
          >
            {title}
          </h2>
        </div>

        {action || null}
      </div>

      {children}
    </section>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(notificationsData);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [settingsState, setSettingsState] = useState(
    Object.fromEntries([
      ['Push notifications', true],
      ['Email notifications', false],
      ['SMS notifications', false],
      ['Likes', true],
      ['Comments', true],
      ['Mentions', true],
      ['Messages', true],
      ['Stories', true],
      ['Reels', true],
      ['Live', true],
      ['Security alerts', true],
      ['Marketing notifications', false],
    ])
  );

  const activeCategoryData =
    categoryOptions.find((category) => category.key === activeCategory) ||
    categoryOptions[0];

  const unreadCount = notifications.filter((item) => item.unread).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const categoryMatches =
        activeCategory === 'all' || item.category === activeCategory;

      const filterMatches =
        activeFilter === 'all' ||
        (activeFilter === 'unread' && item.unread) ||
        (activeFilter === 'read' && !item.unread) ||
        (activeFilter === 'mentions' && item.category === 'mentions') ||
        (activeFilter === 'follows' && item.category === 'follows') ||
        (activeFilter === 'messages' && item.category === 'messages');

      return categoryMatches && filterMatches;
    });
  }, [activeCategory, activeFilter, notifications]);

  const groupedNotifications = useMemo(
    () =>
      filteredNotifications.reduce((groups, item) => {
        if (!groups[item.group]) groups[item.group] = [];
        groups[item.group].push(item);
        return groups;
      }, {}),
    [filteredNotifications]
  );

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, unread: false }))
    );
  };

  const markAsRead = (item) => {
    if (!item.unread) return;

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === item.id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const handleNotificationAction = (item) => {
    markAsRead(item);

    if (item.target === 'chat') navigate('/chats');
    if (item.target === 'profile') navigate('/profile');
    if (item.target === 'reel') navigate('/reels');
    if (item.target === 'post') navigate('/home');
  };

  const handleCategorySelect = (categoryKey) => {
    setActiveCategory(categoryKey);
    setActiveFilter('all');
    setShowFilterMenu(false);
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background:
        'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
      color: '#f4f7ff',
      paddingBottom: '6.9rem',
    },
    main: {
      width: '100%',
      maxWidth: '860px',
      margin: '0 auto',
      padding: '0.9rem 0.9rem 0',
      display: 'grid',
      gap: '0.9rem',
    },
    topRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.7rem',
    },
    iconButton: {
      width: '2.65rem',
      height: '2.65rem',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
    },
    categoryBar: {
      display: 'flex',
      gap: '0.55rem',
      overflowX: 'auto',
      padding: '0.2rem 0.1rem 0.3rem',
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch',
    },
    categoryIconButton: (active) => ({
      position: 'relative',
      flexShrink: 0,
      width: '3rem',
      height: '3rem',
      borderRadius: '999px',
      border: `1px solid ${
        active ? 'rgba(124,92,255,0.42)' : 'rgba(255,255,255,0.08)'
      }`,
      background: active
        ? 'linear-gradient(135deg, rgba(124,92,255,0.32), rgba(77,215,255,0.16))'
        : 'rgba(255,255,255,0.05)',
      color: active ? '#ffffff' : '#9daac4',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      boxShadow: active
        ? '0 0 22px rgba(124,92,255,0.22), 0 0 12px rgba(77,215,255,0.12)'
        : 'none',
      transition:
        'transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease',
    }),
    filterRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.7rem',
    },
    filterButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.05)',
      color: '#dce5f8',
      padding: '0.58rem 0.75rem',
      fontSize: '0.76rem',
      fontWeight: 800,
      cursor: 'pointer',
    },
    filterMenu: {
      position: 'absolute',
      right: 0,
      top: 'calc(100% + 0.45rem)',
      zIndex: 10,
      width: '13rem',
      padding: '0.45rem',
      borderRadius: '1rem',
      background:
        'linear-gradient(180deg, rgba(17,22,35,0.99), rgba(9,13,22,0.99))',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 18px 50px rgba(0,0,0,0.38)',
    },
    filterOption: (active) => ({
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem',
      padding: '0.65rem',
      border: 0,
      borderRadius: '0.7rem',
      background: active ? 'rgba(124,92,255,0.16)' : 'transparent',
      color: active ? '#fff' : '#c4cee2',
      textAlign: 'left',
      fontSize: '0.78rem',
      fontWeight: 750,
      cursor: 'pointer',
    }),
    group: {
      display: 'grid',
      gap: '0.55rem',
    },
    groupTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.45rem',
      color: '#c6d1e6',
      fontSize: '0.8rem',
      fontWeight: 850,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 1300,
      display: 'grid',
      placeItems: 'center',
      padding: '1rem',
      background: 'rgba(2,5,10,0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    },
    modal: {
      width: 'min(100%, 520px)',
      maxHeight: '86vh',
      overflowY: 'auto',
      padding: '1rem',
      borderRadius: '1.35rem',
      background:
        'linear-gradient(180deg, rgba(17,22,35,0.99), rgba(9,13,22,0.99))',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
    },
  };

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle={activeCategory === 'all' ? 'Notifications' : activeCategoryData.label}
        notificationCount={unreadCount}
      />

      <main style={styles.main}>
        <div style={styles.topRow}>
          {activeCategory !== 'all' ? (
            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              style={styles.iconButton}
              aria-label="Back to all notifications"
            >
              <ChevronRight
                size={18}
                style={{ transform: 'rotate(180deg)' }}
              />
            </button>
          ) : (
            <span
              style={{
                color: '#aab6cf',
                fontSize: '0.78rem',
                fontWeight: 750,
              }}
            >
              Activity center
            </span>
          )}

          <span
            style={{
              color: '#aab6cf',
              fontSize: '0.78rem',
              fontWeight: 750,
            }}
          >
            {activeCategory === 'all'
              ? `${unreadCount} unread activity`
              : activeCategoryData.label}
          </span>

          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <button
              type="button"
              onClick={markAllAsRead}
              style={styles.iconButton}
              aria-label="Mark all as read"
            >
              <CheckCheck size={17} />
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(true)}
              style={styles.iconButton}
              aria-label="Open notification settings"
            >
              <Bell size={17} />
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#8f9cb8',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: '0.45rem',
              height: '0.45rem',
              borderRadius: '999px',
              background: '#4dd7ff',
              boxShadow: '0 0 10px rgba(77,215,255,0.5)',
            }}
          />
          {activeCategory === 'all'
            ? 'All activity'
            : `${activeCategoryData.label} activity`}
        </div>

        <div
          style={styles.categoryBar}
          aria-label="Notification categories"
        >
          {categoryOptions.map((category) => {
            const Icon = category.icon;
            const active = activeCategory === category.key;

            return (
              <button
                key={category.key}
                type="button"
                onClick={() => handleCategorySelect(category.key)}
                style={styles.categoryIconButton(active)}
                aria-label={category.label}
                aria-pressed={active}
                title={category.label}
              >
                <Icon size={17} strokeWidth={2.2} />

                {category.key === 'all' && unreadCount > 0 ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-0.12rem',
                      right: '-0.12rem',
                      minWidth: '1.05rem',
                      height: '1.05rem',
                      padding: '0 0.22rem',
                      borderRadius: '999px',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg, #ff4fd8, #7c5cff)',
                      color: '#fff',
                      border: '2px solid #101624',
                      fontSize: '0.58rem',
                      fontWeight: 900,
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div style={styles.filterRow}>
          <div>
            <strong
              style={{
                display: 'block',
                color: '#f5f8ff',
                fontSize: '1rem',
              }}
            >
              {activeCategory === 'all'
                ? 'Notifications'
                : activeCategoryData.label}
            </strong>

            <span
              style={{
                color: '#8f9cb8',
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
            >
              Likes, follows, messages, stories, reels, and security alerts
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowFilterMenu((current) => !current)}
              style={styles.filterButton}
              aria-label="Open notification filters"
            >
              <Eye size={14} />
              {filterOptions.find((item) => item.key === activeFilter)?.label}
              <ChevronDown size={14} />
            </button>

            {showFilterMenu ? (
              <div style={styles.filterMenu}>
                {filterOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setActiveFilter(option.key);
                      setShowFilterMenu(false);
                    }}
                    style={styles.filterOption(activeFilter === option.key)}
                  >
                    <span>{option.label}</span>
                    {activeFilter === option.key ? <Check size={14} /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {Object.keys(groupedNotifications).length ? (
          Object.entries(groupedNotifications).map(([groupName, items]) => (
            <section key={groupName} style={styles.group}>
              <div style={styles.groupTitle}>
                <Clock3 size={14} />
                {groupName}
              </div>

              {items.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  onRead={markAsRead}
                  onAction={handleNotificationAction}
                />
              ))}
            </section>
          ))
        ) : (
          <Section title="No notifications" icon={BellOff}>
            <div
              style={{
                padding: '1.3rem 0.8rem',
                textAlign: 'center',
                color: '#9aa7c1',
                fontSize: '0.85rem',
                lineHeight: 1.55,
              }}
            >
              <BellOff size={28} color="#8290ad" />
              <p style={{ margin: '0.7rem 0 0' }}>
                No notifications match your current filters.
              </p>
            </div>
          </Section>
        )}

        {activeCategory === 'all' ? (
          <>
            <Section title="Suggested accounts" icon={Users} action="Discover">
              <div style={{ display: 'grid', gap: '0.55rem' }}>
                {[
                  { username: 'creator.network', avatar: 'N', verified: true },
                  { username: 'travel.frame', avatar: 'T', verified: false },
                  { username: 'food.story', avatar: 'F', verified: false },
                ].map((account) => (
                  <div
                    key={account.username}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      padding: '0.7rem',
                      borderRadius: '0.95rem',
                      background: 'rgba(255,255,255,0.045)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <Avatar item={account} />

                    <span style={{ flex: 1 }}>
                      <strong
                        style={{
                          display: 'block',
                          color: '#f5f8ff',
                          fontSize: '0.84rem',
                        }}
                      >
                        {account.username}
                      </strong>
                      <span
                        style={{
                          color: '#8f9cb8',
                          fontSize: '0.72rem',
                        }}
                      >
                        Suggested for you
                      </span>
                    </span>

                    <button
                      type="button"
                      style={{
                        border: 0,
                        borderRadius: '999px',
                        padding: '0.52rem 0.7rem',
                        background:
                          'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Popular hashtags" icon={Tag} action="Trending">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                {['#React', '#Supabase', '#Reels', '#Aarush', '#Explore', '#CreatorTools'].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.55rem 0.7rem',
                        borderRadius: '999px',
                        border: '1px solid rgba(124,92,255,0.16)',
                        background: 'rgba(124,92,255,0.1)',
                        color: '#dce5ff',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      <Tag size={12} />
                      {tag}
                    </button>
                  )
                )}
              </div>
            </Section>
          </>
        ) : null}

        <section
          style={{
            padding: '0.85rem',
            borderRadius: '1rem',
            background: 'rgba(77,215,255,0.07)',
            border: '1px solid rgba(77,215,255,0.13)',
            color: '#c9f5ff',
            fontSize: '0.78rem',
            lineHeight: 1.55,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginBottom: '0.35rem',
            }}
          >
            <ShieldAlert size={15} />
            Notification system status
          </div>

          Realtime delivery, read synchronization, unread count synchronization,
          activity aggregation, mention detection, security alerts,
          deduplication, push scheduling, and optimistic updates are ready for
          Supabase integration.
        </section>
      </main>

      {showSettings ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowSettings(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
            background: 'rgba(2,5,10,0.7)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(100%, 520px)',
              maxHeight: '86vh',
              overflowY: 'auto',
              padding: '1rem',
              borderRadius: '1.35rem',
              background:
                'linear-gradient(180deg, rgba(17,22,35,0.99), rgba(9,13,22,0.99))',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBottom: '0.9rem',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: '#f5f8ff',
                    fontSize: '1.02rem',
                  }}
                >
                  Notification settings
                </h2>

                <p
                  style={{
                    margin: '0.25rem 0 0',
                    color: '#96a3bf',
                    fontSize: '0.78rem',
                  }}
                >
                  Choose how Aarush keeps you updated.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                style={styles.iconButton}
                aria-label="Close settings"
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '0.55rem' }}>
              {Object.entries(settingsState).map(([label, checked]) => (
                <Toggle
                  key={label}
                  label={label}
                  checked={checked}
                  onChange={(value) =>
                    setSettingsState((current) => ({
                      ...current,
                      [label]: value,
                    }))
                  }
                />
              ))}
            </div>

            <div
              style={{
                marginTop: '0.85rem',
                padding: '0.8rem',
                borderRadius: '0.95rem',
                background: 'rgba(255,255,255,0.045)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#9aa7c1',
                fontSize: '0.76rem',
                lineHeight: 1.5,
              }}
            >
              Security alerts remain important account notifications and should
              stay enabled for account safety.
            </div>
          </div>
        </div>
      ) : null}

      <BottomNav />
    </div>
  );
}