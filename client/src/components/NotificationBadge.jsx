import { memo, useMemo } from 'react';
import { useNotificationBadge } from '../hooks/useNotifications';

const SIZE_STYLES = {
  small: {
    minWidth: '0.95rem',
    height: '0.95rem',
    padding: '0 0.18rem',
    fontSize: '0.5rem',
    borderWidth: '2px',
  },

  medium: {
    minWidth: '1.2rem',
    height: '1.2rem',
    padding: '0 0.25rem',
    fontSize: '0.58rem',
    borderWidth: '2px',
  },

  large: {
    minWidth: '1.5rem',
    height: '1.5rem',
    padding: '0 0.35rem',
    fontSize: '0.68rem',
    borderWidth: '2px',
  },
};

function NotificationBadge({
  type = 'notification',
  size = 'medium',
  className = '',
  style = {},
  showZero = false,
  label,
}) {
  const {
    unreadNotificationCount,
    unreadMessageCount,
  } = useNotificationBadge();

  const normalizedType =
    type === 'message' ? 'message' : 'notification';

  const count = useMemo(
    () =>
      normalizedType === 'message'
        ? Number(unreadMessageCount || 0)
        : Number(unreadNotificationCount || 0),
    [
      normalizedType,
      unreadMessageCount,
      unreadNotificationCount,
    ]
  );

  const safeSize = SIZE_STYLES[size]
    ? size
    : 'medium';

  const displayCount = count > 99 ? '99+' : count;

  if (!showZero && count <= 0) {
    return null;
  }

  const accessibleLabel =
    label ||
    `${count} unread ${
      normalizedType === 'message'
        ? count === 1
          ? 'message'
          : 'messages'
        : count === 1
          ? 'notification'
          : 'notifications'
    }`;

  return (
    <>
      <span
        className={`aarush-notification-badge ${className}`.trim()}
        role="status"
        aria-label={accessibleLabel}
        aria-live="polite"
        style={{
          ...styles.badge,
          ...SIZE_STYLES[safeSize],
          ...(normalizedType === 'message'
            ? styles.messageBadge
            : styles.notificationBadge),
          ...style,
        }}
      >
        {displayCount}
      </span>

      <style>{`
        .aarush-notification-badge {
          position: absolute;
          top: -0.28rem;
          right: -0.3rem;
          z-index: 3;
          display: inline-grid;
          place-items: center;
          box-sizing: border-box;
          border-radius: 999px;
          color: #ffffff;
          font-weight: 900;
          line-height: 1;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          animation:
            aarush-notification-badge-pulse
            2s ease-in-out infinite;
        }

        @keyframes aarush-notification-badge-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow:
              0 0 0 rgba(124,92,255,0),
              0 0 10px rgba(124,92,255,0.2);
          }

          50% {
            transform: scale(1.08);
            box-shadow:
              0 0 0 4px rgba(124,92,255,0.08),
              0 0 16px rgba(77,215,255,0.42);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-notification-badge {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  badge: {
    border: '2px solid #0c111b',
  },

  notificationBadge: {
    background:
      'linear-gradient(135deg, #ff4fd8, #7c5cff)',
  },

  messageBadge: {
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },
};

export default memo(NotificationBadge);