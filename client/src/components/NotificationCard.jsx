import { memo } from 'react';
import {
  Bell,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Heart,
  Lock,
  MessageCircle,
  MessageSquare,
  Play,
  Reply,
  Shield,
  Sparkles,
  Star,
  UserPlus,
  Users,
  Video,
} from 'lucide-react';

const TYPE_CONFIG = {
  like: {
    icon: Heart,
    color: '#ff668c',
    label: 'Like',
  },
  comment: {
    icon: MessageCircle,
    color: '#4dd7ff',
    label: 'Comment',
  },
  follow: {
    icon: UserPlus,
    color: '#7c5cff',
    label: 'Follow',
  },
  'follow-request': {
    icon: Users,
    color: '#ffcf8a',
    label: 'Follow request',
  },
  mention: {
    icon: MessageSquare,
    color: '#9d8cff',
    label: 'Mention',
  },
  reply: {
    icon: Reply,
    color: '#4dd7ff',
    label: 'Reply',
  },
  'story-view': {
    icon: EyeIcon,
    color: '#ff4fd8',
    label: 'Story view',
  },
  'story-reaction': {
    icon: Heart,
    color: '#ff668c',
    label: 'Story reaction',
  },
  reels: {
    icon: Play,
    color: '#ff4fd8',
    label: 'Reels',
  },
  message: {
    icon: MessageSquare,
    color: '#4dd7ff',
    label: 'Message',
  },
  security: {
    icon: Shield,
    color: '#7c5cff',
    label: 'Security',
  },
  privacy: {
    icon: Lock,
    color: '#4dd7ff',
    label: 'Privacy',
  },
  system: {
    icon: Bell,
    color: '#9aa7c1',
    label: 'System',
  },
  ai: {
    icon: Bot,
    color: '#ff4fd8',
    label: 'Aarush AI',
  },
  workspace: {
    icon: FileText,
    color: '#7c5cff',
    label: 'Workspace',
  },
  reminder: {
    icon: Clock3,
    color: '#ffcf8a',
    label: 'Reminder',
  },
};

function EyeIcon({ size = 16, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M2.1 12s3.6-7 9.9-7 9.9 7 9.9 7-3.6 7-9.9 7-9.9-7-9.9-7Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function formatTime(value) {
  if (!value) {
    return 'Recently';
  }

  if (typeof value === 'string') {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  const now = Date.now();
  const seconds = Math.max(
    0,
    Math.floor((now - date.getTime()) / 1000)
  );

  if (seconds < 10) {
    return 'Just now';
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  }

  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h`;
  }

  if (seconds < 604800) {
    return `${Math.floor(seconds / 86400)}d`;
  }

  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
  });
}

function getNotificationData(props) {
  const source = props.notification || props.data || {};

  const rawType = String(
    props.type ||
      source.type ||
      source.notificationType ||
      'system'
  ).toLowerCase();

  const type = rawType.replace(/[_\s]+/g, '-');

  return {
    id: props.id || source.id || `notification-${Date.now()}`,
    type,
    avatar:
      props.avatar ||
      props.avatarUrl ||
      source.avatar ||
      source.avatarUrl ||
      '',
    displayName:
      props.displayName ||
      source.displayName ||
      source.name ||
      source.username ||
      'Aarush',
    username:
      props.username ||
      source.username ||
      '',
    message:
      props.message ||
      source.message ||
      source.body ||
      source.text ||
      '',
    time:
      props.time ||
      source.time ||
      source.createdAt ||
      source.timestamp,
    unread:
      props.unread ??
      source.unread ??
      source.isUnread ??
      false,
    verified:
      props.verified ??
      source.verified ??
      source.isVerified ??
      false,
    thumbnail:
      props.thumbnail ||
      props.thumbnailUrl ||
      source.thumbnail ||
      source.thumbnailUrl ||
      source.mediaUrl ||
      '',
    actionLabel:
      props.actionLabel ||
      source.actionLabel ||
      '',
    actionType:
      props.actionType ||
      source.actionType ||
      '',
    href: props.href || source.href || '',
    metadata: props.metadata || source.metadata || {},
  };
}

function NotificationCard({
  notification,
  data,
  id,
  type,
  avatar,
  avatarUrl,
  displayName,
  username,
  message,
  time,
  unread,
  verified,
  thumbnail,
  thumbnailUrl,
  actionLabel,
  actionType,
  href,
  onClick,
  onOpen,
  onAction,
  onMarkRead,
  onDismiss,
  className = '',
  style = {},
}) {
  const item = getNotificationData({
    notification,
    data,
    id,
    type,
    avatar,
    avatarUrl,
    displayName,
    username,
    message,
    time,
    unread,
    verified,
    thumbnail,
    thumbnailUrl,
    actionLabel,
    actionType,
    href,
  });

  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
  const Icon = config.icon;
  const normalizedUsername = String(item.username || '').replace(
    /^@/,
    ''
  );

  const handleOpen = () => {
    onClick?.(item);
    onOpen?.(item);

    if (item.unread) {
      onMarkRead?.(item);
    }
  };

  const handleAction = (event) => {
    event.stopPropagation();
    onAction?.(item, {
      type: item.actionType || item.type,
      label: item.actionLabel,
    });
  };

  return (
    <article
      className={className}
      style={{
        ...styles.card,
        ...(item.unread ? styles.unreadCard : {}),
        ...style,
      }}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      aria-label={`${config.label}: ${item.message || item.displayName}`}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpen();
        }
      }}
    >
      <span
        aria-hidden="true"
        style={{
          ...styles.typeAccent,
          background: config.color,
        }}
      />

      <div style={styles.avatarWrapper}>
        {item.avatar ? (
          <img
            src={item.avatar}
            alt={`${item.displayName} profile`}
            loading="lazy"
            decoding="async"
            style={styles.avatar}
          />
        ) : (
          <span style={styles.avatarFallback}>
            {String(item.displayName || 'A')
              .trim()
              .charAt(0)
              .toUpperCase()}
          </span>
        )}

        <span
          style={{
            ...styles.typeIcon,
            background: config.color,
          }}
          aria-label={config.label}
        >
          <Icon size={11} />
        </span>
      </div>

      <div style={styles.content}>
        <div style={styles.identityLine}>
          <strong style={styles.displayName}>
            {item.displayName}
          </strong>

          {item.verified ? (
            <span
              style={styles.verifiedBadge}
              aria-label="Verified account"
            >
              <Check size={10} />
            </span>
          ) : null}

          <span style={styles.typeLabel}>{config.label}</span>
        </div>

        {normalizedUsername ? (
          <span style={styles.username}>
            @{normalizedUsername}
          </span>
        ) : null}

        <p style={styles.message}>
          {item.message || `${config.label} notification`}
        </p>

        <span style={styles.time}>
          <Clock3 size={11} />
          {formatTime(item.time)}
        </span>
      </div>

      <div style={styles.trailing}>
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            style={styles.thumbnail}
          />
        ) : null}

        {item.unread ? (
          <span
            style={styles.unreadDot}
            aria-label="Unread notification"
          />
        ) : null}

        {item.actionLabel ? (
          <button
            type="button"
            onClick={handleAction}
            style={styles.actionButton}
          >
            {item.actionLabel}
            <ChevronRight size={13} />
          </button>
        ) : (
          <ChevronRight
            size={15}
            color="#7d8aa5"
            aria-hidden="true"
          />
        )}

        {typeof onDismiss === 'function' ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDismiss(item);
            }}
            style={styles.dismissButton}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        ) : null}
      </div>

      <style>{`
        .aarush-notification-card {
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease;
        }

        .aarush-notification-card:hover {
          transform: translateY(-1px);
          border-color: rgba(124,92,255,0.3);
          background: rgba(255,255,255,0.065);
          box-shadow: 0 14px 34px rgba(0,0,0,0.2);
        }

        .aarush-notification-card:active {
          transform: scale(0.99);
        }

        .aarush-notification-card:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-notification-card {
            transition: none !important;
          }
        }

        @media (prefers-contrast: more) {
          .aarush-notification-card {
            border-color: rgba(255,255,255,0.35) !important;
          }
        }
      `}</style>
    </article>
  );
}

const styles = {
  card: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '0.65rem',
    width: '100%',
    minHeight: '4.65rem',
    overflow: 'hidden',
    padding: '0.72rem 0.75rem 0.72rem 0.9rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '1rem',
    color: '#f4f7ff',
    background: 'rgba(255,255,255,0.045)',
    boxShadow: '0 10px 28px rgba(0,0,0,0.14)',
    cursor: 'pointer',
    userSelect: 'none',
  },

  unreadCard: {
    borderColor: 'rgba(124,92,255,0.25)',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(77,215,255,0.05))',
    boxShadow: '0 12px 30px rgba(124,92,255,0.1)',
  },

  typeAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '0.18rem',
    opacity: 0.85,
  },

  avatarWrapper: {
    position: 'relative',
    width: '3rem',
    height: '3rem',
    flexShrink: 0,
  },

  avatar: {
    display: 'block',
    width: '3rem',
    height: '3rem',
    objectFit: 'cover',
    border: '2px solid rgba(124,92,255,0.32)',
    borderRadius: '999px',
    background: '#1a2132',
  },

  avatarFallback: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    border: '2px solid rgba(124,92,255,0.32)',
    borderRadius: '999px',
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.8), rgba(77,215,255,0.65))',
    fontSize: '1rem',
    fontWeight: 900,
  },

  typeIcon: {
    position: 'absolute',
    right: '-0.15rem',
    bottom: '-0.15rem',
    width: '1.25rem',
    height: '1.25rem',
    display: 'grid',
    placeItems: 'center',
    border: '2px solid #111622',
    borderRadius: '999px',
    color: '#ffffff',
    boxShadow: '0 0 10px rgba(0,0,0,0.25)',
  },

  content: {
    minWidth: 0,
    display: 'grid',
    gap: '0.13rem',
  },

  identityLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    minWidth: 0,
  },

  displayName: {
    overflow: 'hidden',
    color: '#f5f8ff',
    fontSize: '0.82rem',
    fontWeight: 850,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  verifiedBadge: {
    width: '0.95rem',
    height: '0.95rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
  },

  typeLabel: {
    flexShrink: 0,
    padding: '0.16rem 0.32rem',
    borderRadius: '999px',
    color: '#a9b6cc',
    background: 'rgba(255,255,255,0.06)',
    fontSize: '0.56rem',
    fontWeight: 800,
  },

  username: {
    overflow: 'hidden',
    color: '#8f9db8',
    fontSize: '0.65rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  message: {
    overflow: 'hidden',
    margin: 0,
    color: '#b7c3d8',
    fontSize: '0.73rem',
    lineHeight: 1.35,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  time: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#8290aa',
    fontSize: '0.62rem',
  },

  trailing: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.35rem',
    minWidth: '2rem',
  },

  thumbnail: {
    width: '2.55rem',
    height: '2.55rem',
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.65rem',
  },

  unreadDot: {
    width: '0.58rem',
    height: '0.58rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #ff4fd8, #7c5cff)',
    boxShadow: '0 0 10px rgba(255,79,216,0.55)',
  },

  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    minHeight: '2rem',
    padding: '0.35rem 0.45rem',
    border: '1px solid rgba(124,92,255,0.24)',
    borderRadius: '999px',
    color: '#dcd4ff',
    background: 'rgba(124,92,255,0.1)',
    fontSize: '0.61rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  dismissButton: {
    width: '1.65rem',
    height: '1.65rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#8e9bb4',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

export default memo(NotificationCard);