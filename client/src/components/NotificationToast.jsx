import { memo, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    color: '#82e9c1',
    background: 'rgba(130,233,193,0.1)',
    border: 'rgba(130,233,193,0.24)',
  },

  info: {
    icon: Info,
    color: '#9deeff',
    background: 'rgba(77,215,255,0.1)',
    border: 'rgba(77,215,255,0.24)',
  },

  warning: {
    icon: AlertCircle,
    color: '#ffd27d',
    background: 'rgba(255,210,125,0.1)',
    border: 'rgba(255,210,125,0.24)',
  },

  error: {
    icon: AlertCircle,
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.1)',
    border: 'rgba(255,79,122,0.24)',
  },
};

function NotificationToast({
  open = true,
  type = 'info',
  title,
  message,
  duration = 4000,
  onClose,
  actionLabel,
  onAction,
  position = 'bottom',
}) {
  const config =
    TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const Icon = config.icon;

  useEffect(() => {
    if (!open || !duration || !onClose) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [duration, onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        ...styles.wrapper,
        ...(position === 'top'
          ? styles.topPosition
          : styles.bottomPosition),
      }}
    >
      <div
        style={{
          ...styles.toast,
          color: config.color,
          background: config.background,
          borderColor: config.border,
        }}
      >
        <span style={styles.icon}>
          <Icon size={18} />
        </span>

        <div style={styles.copy}>
          {title ? (
            <strong style={styles.title}>{title}</strong>
          ) : null}

          {message ? (
            <span style={styles.message}>{message}</span>
          ) : null}

          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              style={{
                ...styles.actionButton,
                color: config.color,
              }}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            style={{
              ...styles.closeButton,
              color: config.color,
            }}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      <style>{`
        @keyframes aarush-toast-slide-bottom {
          from {
            opacity: 0;
            transform: translateY(1rem) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes aarush-toast-slide-top {
          from {
            opacity: 0;
            transform: translateY(-1rem) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-notification-toast {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'fixed',
    right: '1rem',
    left: '1rem',
    zIndex: 1600,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },

  topPosition: {
    top: '1rem',
    alignItems: 'flex-start',
  },

  bottomPosition: {
    bottom: '6.4rem',
    alignItems: 'flex-end',
  },

  toast: {
    width: 'min(100%, 430px)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    padding: '0.75rem',
    border: '1px solid',
    borderRadius: '1rem',
    boxShadow: '0 18px 45px rgba(0,0,0,0.38)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    pointerEvents: 'auto',
    animation:
      'aarush-toast-slide-bottom 220ms ease-out',
  },

  icon: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    background: 'rgba(255,255,255,0.08)',
  },

  copy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.2rem',
    flex: 1,
  },

  title: {
    color: '#f4f7ff',
    fontSize: '0.72rem',
    fontWeight: 850,
  },

  message: {
    color: '#cbd6ea',
    fontSize: '0.68rem',
    lineHeight: 1.45,
  },

  actionButton: {
    justifySelf: 'start',
    marginTop: '0.2rem',
    padding: 0,
    border: 0,
    background: 'transparent',
    fontSize: '0.64rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  closeButton: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },
};

export default memo(NotificationToast);