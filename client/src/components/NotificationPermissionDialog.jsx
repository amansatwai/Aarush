import {
  Bell,
  Check,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import usePushNotifications from '../hooks/usePushNotifications';

export default function NotificationPermissionDialog({
  open = true,
  onClose,
  onGranted,
}) {
  const {
    permission,
    supported,
    requesting,
    enableNotifications,
  } = usePushNotifications();

  if (!open) {
    return null;
  }

  const handleAllow = async () => {
    try {
      const enabled = await enableNotifications();

      if (enabled) {
        onGranted?.();
        onClose?.();
      }
    } catch {
      // Permission errors are reflected by the browser state.
    }
  };

  const isDenied = permission === 'denied';
  const isUnsupported = !supported;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aarush-notification-title"
      style={styles.backdrop}
    >
      <section style={styles.dialog}>
        <button
          type="button"
          onClick={onClose}
          style={styles.closeButton}
          aria-label="Close notification permission dialog"
        >
          <X size={17} />
        </button>

        <span style={styles.heroIcon}>
          <Bell size={28} />
        </span>

        <h1
          id="aarush-notification-title"
          style={styles.title}
        >
          Stay connected with Aarush
        </h1>

        <p style={styles.subtitle}>
          Allow notifications to stay updated with important
          activity without keeping the app open.
        </p>

        <div style={styles.features}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>
              <HeartIcon />
            </span>
            <span>Likes, comments, and new followers</span>
          </div>

          <div style={styles.feature}>
            <span style={styles.featureIcon}>
              <MessageCircle size={16} />
            </span>
            <span>Messages and story replies</span>
          </div>

          <div style={styles.feature}>
            <span style={styles.featureIcon}>
              <ShieldCheck size={16} />
            </span>
            <span>Security alerts and account activity</span>
          </div>

          <div style={styles.feature}>
            <span style={styles.featureIcon}>
              <Sparkles size={16} />
            </span>
            <span>Personalized Aarush updates</span>
          </div>
        </div>

        {isDenied ? (
          <div style={styles.warning}>
            Notifications are blocked in your browser. Enable
            them from your browser or device settings.
          </div>
        ) : null}

        {isUnsupported ? (
          <div style={styles.warning}>
            Browser notifications are not supported on this
            device yet.
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleAllow}
          disabled={
            requesting ||
            isDenied ||
            isUnsupported
          }
          style={{
            ...styles.primaryButton,
            opacity:
              requesting ||
              isDenied ||
              isUnsupported
                ? 0.5
                : 1,
          }}
        >
          <Bell size={16} />
          {requesting
            ? 'Requesting permission…'
            : 'Allow Notifications'}
        </button>

        <button
          type="button"
          onClick={onClose}
          style={styles.secondaryButton}
        >
          Not Now
        </button>

        <div style={styles.privacyNote}>
          <LockKeyhole size={13} />
          You can change this permission anytime in your
          browser settings.
        </div>
      </section>

      <style>{`
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

function HeartIcon() {
  return (
    <span style={styles.heartIcon}>
      ♥
    </span>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1400,
    display: 'grid',
    placeItems: 'center',
    padding: '1rem',
    background: 'rgba(2,5,10,0.72)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },

  dialog: {
    position: 'relative',
    width: 'min(100%, 430px)',
    padding: '1.25rem',
    border: '1px solid rgba(124,92,255,0.28)',
    borderRadius: '1.45rem',
    color: '#f4f7ff',
    background:
      'linear-gradient(145deg, rgba(22,27,44,0.99), rgba(11,15,25,0.99))',
    boxShadow:
      '0 28px 90px rgba(0,0,0,0.55), 0 0 35px rgba(124,92,255,0.15)',
  },

  closeButton: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
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

  heroIcon: {
    width: '4.3rem',
    height: '4.3rem',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 0.9rem',
    borderRadius: '1.35rem',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    boxShadow: '0 0 32px rgba(124,92,255,0.28)',
  },

  title: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 900,
    textAlign: 'center',
  },

  subtitle: {
    margin: '0.55rem 0 0',
    color: '#aab6cf',
    fontSize: '0.76rem',
    lineHeight: 1.55,
    textAlign: 'center',
  },

  features: {
    display: 'grid',
    gap: '0.45rem',
    marginTop: '1rem',
  },

  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    padding: '0.6rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.8rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.04)',
    fontSize: '0.68rem',
    fontWeight: 700,
  },

  featureIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.65rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,0.1)',
  },

  heartIcon: {
    color: '#ff719f',
    fontSize: '1.1rem',
  },

  warning: {
    marginTop: '0.8rem',
    padding: '0.65rem',
    border: '1px solid rgba(255,210,125,0.2)',
    borderRadius: '0.75rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,0.08)',
    fontSize: '0.65rem',
    lineHeight: 1.45,
  },

  primaryButton: {
    width: '100%',
    minHeight: '2.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    marginTop: '1rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.76rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  secondaryButton: {
    width: '100%',
    minHeight: '2.6rem',
    marginTop: '0.45rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.72rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  privacyNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    marginTop: '0.8rem',
    color: '#8290ad',
    fontSize: '0.59rem',
    textAlign: 'center',
  },
};