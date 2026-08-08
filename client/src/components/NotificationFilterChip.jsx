import { memo } from 'react';
import {
  Bell,
  Bot,
  CheckCheck,
  FileText,
  Flame,
  Heart,
  Lock,
  MessageCircle,
  MessageSquare,
  Play,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';

const DEFAULT_ICONS = {
  all: Bell,
  likes: Heart,
  like: Heart,
  comments: MessageCircle,
  comment: MessageCircle,
  followers: UserPlus,
  'follow-requests': Users,
  mentions: MessageSquare,
  replies: MessageSquare,
  stories: Play,
  reels: Play,
  messages: MessageSquare,
  security: Shield,
  privacy: Lock,
  ai: Bot,
  workspace: FileText,
  system: Bell,
  trending: Flame,
};

function resolveIcon(label, icon) {
  if (icon) {
    return icon;
  }

  const key = String(label || 'all')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

  return DEFAULT_ICONS[key] || Bell;
}

function NotificationFilterChip({
  label = 'All',
  icon,
  active = false,
  count = 0,
  onClick,
  disabled = false,
  className = '',
  style = {},
  ariaLabel,
}) {
  const Icon = resolveIcon(label, icon);

  const handleClick = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  return (
    <>
      <button
        type="button"
        className={`aarush-notification-filter-chip ${
          active ? 'active' : ''
        } ${className}`}
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={active}
        aria-label={ariaLabel || `${label} notifications`}
        style={{
          ...styles.chip,
          ...(active ? styles.activeChip : {}),
          ...(disabled ? styles.disabledChip : {}),
          ...style,
        }}
      >
        {Icon ? (
          <span
            aria-hidden="true"
            style={{
              ...styles.iconWrapper,
              ...(active ? styles.activeIconWrapper : {}),
            }}
          >
            <Icon
              size={14}
              strokeWidth={active ? 2.4 : 2}
            />
          </span>
        ) : null}

        <span style={styles.label}>{label}</span>

        {Number(count) > 0 ? (
          <span
            style={{
              ...styles.countBadge,
              ...(active ? styles.activeCountBadge : {}),
            }}
            aria-label={`${count} notifications`}
          >
            {Number(count) > 99 ? '99+' : count}
          </span>
        ) : null}
      </button>

      <style>{`
        .aarush-notification-filter-chip {
          transition:
            transform 180ms ease,
            filter 180ms ease,
            background 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease,
            color 180ms ease;
        }

        .aarush-notification-filter-chip:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        .aarush-notification-filter-chip:active:not(:disabled) {
          transform: scale(0.96);
        }

        .aarush-notification-filter-chip:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-notification-filter-chip {
            transition: none !important;
          }
        }

        @media (prefers-contrast: more) {
          .aarush-notification-filter-chip {
            border-color: rgba(255,255,255,0.4) !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  chip: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    flexShrink: 0,
    minHeight: '2.35rem',
    padding: '0.42rem 0.65rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#aebbd0',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.72rem',
    fontWeight: 800,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },

  activeChip: {
    borderColor: 'rgba(124,92,255,0.34)',
    color: '#ffffff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    boxShadow:
      '0 10px 24px rgba(124,92,255,0.2), 0 0 18px rgba(77,215,255,0.1)',
  },

  disabledChip: {
    opacity: 0.45,
    cursor: 'not-allowed',
    filter: 'none',
    transform: 'none',
  },

  iconWrapper: {
    width: '1.55rem',
    height: '1.55rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#aebbd0',
    background: 'rgba(255,255,255,0.07)',
  },

  activeIconWrapper: {
    color: '#ffffff',
    background: 'rgba(255,255,255,0.16)',
  },

  label: {
    display: 'inline-block',
    overflow: 'hidden',
    maxWidth: '10rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  countBadge: {
    minWidth: '1.15rem',
    height: '1.15rem',
    display: 'grid',
    placeItems: 'center',
    padding: '0 0.24rem',
    borderRadius: '999px',
    color: '#e6edf9',
    background: 'rgba(255,255,255,0.1)',
    fontSize: '0.59rem',
    fontWeight: 900,
  },

  activeCountBadge: {
    color: '#ffffff',
    background: 'rgba(0,0,0,0.2)',
  },
};

export default memo(NotificationFilterChip);