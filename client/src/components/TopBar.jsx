import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  Eye,
  EyeOff,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { useNotificationBadge } from '../hooks/useNotifications';
import NotificationBadge from './NotificationBadge';

const GAZE_LOCK_STORAGE_KEY = 'aarush_gaze_lock_enabled';
const NAVIGATION_DEBOUNCE = 350;
const OVERLAY_ANIMATION_MS = 220;

const ROUTES = Object.freeze({
  home: '/home',
  search: '/search',
  notifications: '/notification-center',
  profile: '/profile',
});

function isBrowser() {
  return typeof window !== 'undefined';
}

export default function TopBar({
  pageTitle = 'Aarush',
  notificationCount = 0,
  initialGazeLock = true,
  profileMode = false,
  username = '',
  onGazeLockChange,
  onNotificationsClick,
  onSearchClick,
  onSecretAccess,
  onOneTapLock,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const overlayRef = useRef(null);
  const lastNavigationRef = useRef({
    path: '',
    time: 0,
  });
  const lastSecretTapRef = useRef(0);

  const {
    unreadNotificationCount = 0,
  } = useNotificationBadge();

  const [gazeLockEnabled, setGazeLockEnabled] =
    useState(initialGazeLock);
  const [gazePanelOpen, setGazePanelOpen] =
    useState(false);
  const [gazePanelVisible, setGazePanelVisible] =
    useState(false);

  const title = profileMode && username
    ? username.startsWith('@')
      ? username
      : `@${username}`
    : pageTitle || 'Aarush';

  const notificationCountValue =
    Number(notificationCount) > 0
      ? Number(notificationCount)
      : Number(unreadNotificationCount) || 0;

  const navigateSafely = useCallback(
    (path) => {
      if (!path || location.pathname === path) {
        return;
      }

      const now = Date.now();
      const previous = lastNavigationRef.current;

      if (
        previous.path === path &&
        now - previous.time < NAVIGATION_DEBOUNCE
      ) {
        return;
      }

      lastNavigationRef.current = {
        path,
        time: now,
      };

      navigate(path);
    },
    [location.pathname, navigate]
  );

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const savedValue = window.localStorage.getItem(
      GAZE_LOCK_STORAGE_KEY
    );

    if (savedValue === 'true' || savedValue === 'false') {
      setGazeLockEnabled(savedValue === 'true');
    }
  }, []);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.setItem(
      GAZE_LOCK_STORAGE_KEY,
      String(gazeLockEnabled)
    );
  }, [gazeLockEnabled]);

  useEffect(() => {
    if (!gazePanelOpen) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      setGazePanelVisible(true);
    });

    const handlePointerDown = (event) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target)
      ) {
        closeGazePanel();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeGazePanel();
      }
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDown
    );
    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener(
        'pointerdown',
        handlePointerDown
      );
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [gazePanelOpen]);

  const closeGazePanel = useCallback(() => {
    setGazePanelVisible(false);

    window.setTimeout(() => {
      setGazePanelOpen(false);
    }, OVERLAY_ANIMATION_MS);
  }, []);

  const openGazePanel = useCallback(() => {
    setGazePanelOpen(true);
  }, []);

  const updateGazeLock = useCallback(
    (nextValue) => {
      setGazeLockEnabled(nextValue);
      onGazeLockChange?.(nextValue);
      onOneTapLock?.(nextValue);
    },
    [onGazeLockChange, onOneTapLock]
  );

  const toggleGazeLock = useCallback(() => {
    updateGazeLock(!gazeLockEnabled);
  }, [gazeLockEnabled, updateGazeLock]);

  const handleNotifications = useCallback(() => {
    if (typeof onNotificationsClick === 'function') {
      onNotificationsClick();
      return;
    }

    navigateSafely(ROUTES.notifications);
  }, [navigateSafely, onNotificationsClick]);

  const handleSearch = useCallback(() => {
    if (typeof onSearchClick === 'function') {
      onSearchClick();
      return;
    }

    navigateSafely(ROUTES.search);
  }, [navigateSafely, onSearchClick]);

  const handleSecretAccess = useCallback(() => {
    if (typeof onSecretAccess !== 'function') {
      return;
    }

    const now = Date.now();
    const elapsed = now - lastSecretTapRef.current;

    if (
      lastSecretTapRef.current > 0 &&
      elapsed > 0 &&
      elapsed <= 300
    ) {
      lastSecretTapRef.current = 0;
      onSecretAccess();
      return;
    }

    lastSecretTapRef.current = now;
  }, [onSecretAccess]);

  const handleProfile = useCallback(
    (event) => {
      event.preventDefault();
      navigateSafely(ROUTES.profile);
    },
    [navigateSafely]
  );

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <div style={styles.leftControls}>
          <button
            type="button"
            onClick={openGazePanel}
            aria-label={`Open Gaze Lock settings. Currently ${
              gazeLockEnabled ? 'enabled' : 'disabled'
            }`}
            aria-pressed={gazePanelOpen}
            style={{
              ...styles.iconButton,
              ...(gazeLockEnabled
                ? styles.activeIconButton
                : {}),
            }}
          >
            {gazeLockEnabled ? (
              <Eye size={19} strokeWidth={2.3} />
            ) : (
              <EyeOff size={19} strokeWidth={2.1} />
            )}
          </button>

          <button
            type="button"
            onClick={handleNotifications}
            aria-label={`Open notifications${
              notificationCountValue > 0
                ? `, ${notificationCountValue} unread`
                : ''
            }`}
            style={styles.iconButton}
          >
            <Bell size={19} strokeWidth={2.2} />
            <NotificationBadge
              type="notification"
              size="small"
            />
          </button>
        </div>

        <div
          title={title}
          role={
            typeof onSecretAccess === 'function'
              ? 'button'
              : undefined
          }
          aria-label={
            typeof onSecretAccess === 'function'
              ? 'Aarush title. Double tap for account access.'
              : undefined
          }
          onPointerUp={handleSecretAccess}
          style={styles.title}
        >
          {title}
        </div>

        <div style={styles.rightControls}>
          <button
            type="button"
            onClick={handleSearch}
            aria-label="Open search"
            style={styles.iconButton}
          >
            <Search size={19} strokeWidth={2.2} />
          </button>

          <button
            type="button"
            onClick={handleProfile}
            aria-label="Open profile"
            style={styles.iconButton}
          >
            <UserRound size={19} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {gazePanelOpen ? (
        <div
          style={{
            ...styles.overlay,
            opacity: gazePanelVisible ? 1 : 0,
            pointerEvents: gazePanelVisible
              ? 'auto'
              : 'none',
          }}
        >
          <section
            ref={overlayRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby="gaze-lock-title"
            style={{
              ...styles.gazePanel,
              transform: gazePanelVisible
                ? 'translateY(0) scale(1)'
                : 'translateY(-8px) scale(0.98)',
            }}
          >
            <div style={styles.panelHeader}>
              <div style={styles.panelHeading}>
                <div
                  style={{
                    ...styles.panelIcon,
                    ...(gazeLockEnabled
                      ? styles.panelIconActive
                      : {}),
                  }}
                >
                  {gazeLockEnabled ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </div>

                <div>
                  <h2
                    id="gaze-lock-title"
                    style={styles.panelTitle}
                  >
                    Gaze Lock
                  </h2>

                  <p style={styles.panelSubtitle}>
                    Privacy protection for your screen
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeGazePanel}
                aria-label="Close Gaze Lock panel"
                style={styles.closeButton}
              >
                <X size={17} />
              </button>
            </div>

            <div
              style={{
                ...styles.statusCard,
                ...(gazeLockEnabled
                  ? styles.statusCardActive
                  : {}),
              }}
            >
              <span
                style={{
                  ...styles.statusDot,
                  background: gazeLockEnabled
                    ? '#7aefbd'
                    : '#8995ad',
                }}
              />

              <div style={styles.statusCopy}>
                <span style={styles.statusLabel}>
                  Current status
                </span>

                <strong style={styles.statusValue}>
                  {gazeLockEnabled
                    ? 'Protection enabled'
                    : 'Protection disabled'}
                </strong>
              </div>

              <span
                style={{
                  ...styles.statusPill,
                  color: gazeLockEnabled
                    ? '#7aefbd'
                    : '#aab5ca',
                }}
              >
                {gazeLockEnabled ? 'ON' : 'OFF'}
              </span>
            </div>

            <p style={styles.explanation}>
              Gaze Lock helps protect private content by
              preparing Aarush for attention-aware screen
              privacy controls.
            </p>

            <div style={styles.controlGroup}>
              <button
                type="button"
                onClick={() => updateGazeLock(true)}
                aria-pressed={gazeLockEnabled}
                style={{
                  ...styles.controlButton,
                  ...(gazeLockEnabled
                    ? styles.enableButton
                    : {}),
                }}
              >
                <Check size={16} />
                Enable Gaze Lock
              </button>

              <button
                type="button"
                onClick={() => updateGazeLock(false)}
                aria-pressed={!gazeLockEnabled}
                style={{
                  ...styles.controlButton,
                  ...(!gazeLockEnabled
                    ? styles.disableButton
                    : {}),
                }}
              >
                <EyeOff size={16} />
                Disable Gaze Lock
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <style>{`
        header button {
          -webkit-tap-highlight-color: transparent;
        }

        header button:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        header button:active {
          transform: scale(0.96);
        }

        header button:focus-visible,
        header [role="button"]:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 2px;
        }

        @media (max-width: 380px) {
          .aarush-topbar-inner {
            gap: 0.25rem !important;
          }

          .aarush-topbar-button {
            width: 2.45rem !important;
            height: 2.45rem !important;
          }

          .aarush-topbar-title {
            font-size: 0.9rem !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          header button,
          .aarush-gaze-panel {
            transition: none !important;
          }
        }
      `}</style>
    </header>
  );
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%',
    padding:
      '0.7rem 0.8rem calc(0.7rem + env(safe-area-inset-top))',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background:
      'linear-gradient(180deg, rgba(7,10,16,0.97) 0%, rgba(7,10,16,0.86) 100%)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.24)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  inner: {
    position: 'relative',
    width: '100%',
    maxWidth: '1120px',
    minHeight: '2.65rem',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.45rem',
  },

  leftControls: {
    minWidth: 0,
    flex: '1 1 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.4rem',
  },

  rightControls: {
    minWidth: 0,
    flex: '1 1 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.4rem',
  },

  iconButton: {
    position: 'relative',
    width: '2.65rem',
    height: '2.65rem',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#edf3ff',
    background:
      'linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035))',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.08), 0 5px 18px rgba(0,0,0,0.16)',
    cursor: 'pointer',
    transition:
      'transform 180ms ease, background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, color 180ms ease',
  },

  activeIconButton: {
    color: '#ffffff',
    borderColor: 'rgba(124,92,255,0.42)',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.32), rgba(77,215,255,0.16))',
    boxShadow:
      '0 0 22px rgba(124,92,255,0.2), 0 0 12px rgba(77,215,255,0.1)',
  },

  title: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 'min(42%, 20rem)',
    minWidth: 0,
    overflow: 'hidden',
    color: '#f5f8ff',
    fontSize: '0.98rem',
    fontWeight: 850,
    lineHeight: 1.2,
    textAlign: 'center',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    touchAction: 'manipulation',
    transform: 'translate(-50%, -50%)',
  },

  overlay: {
    position: 'fixed',
    top: '4.7rem',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
    padding: '0 0.8rem',
    background: 'rgba(3,6,12,0.24)',
    transition: 'opacity 220ms ease',
  },

  gazePanel: {
    width: 'min(390px, 100%)',
    margin: '0 auto',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,0.3)',
    borderRadius: '1.35rem',
    background:
      'linear-gradient(145deg, rgba(22,27,44,0.98), rgba(9,13,24,0.98))',
    boxShadow:
      '0 24px 65px rgba(0,0,0,0.52), 0 0 35px rgba(124,92,255,0.15)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    transition:
      'transform 220ms ease, opacity 220ms ease',
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.75rem',
  },

  panelHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
  },

  panelIcon: {
    width: '2.6rem',
    height: '2.6rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.9rem',
    color: '#aab5ca',
    background: 'rgba(255,255,255,0.06)',
  },

  panelIconActive: {
    color: '#ffffff',
    borderColor: 'rgba(124,92,255,0.42)',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.34), rgba(77,215,255,0.15))',
    boxShadow: '0 0 22px rgba(124,92,255,0.2)',
  },

  panelTitle: {
    margin: 0,
    color: '#f4f7ff',
    fontSize: '1rem',
    fontWeight: 850,
  },

  panelSubtitle: {
    margin: '0.2rem 0 0',
    color: '#96a3bf',
    fontSize: '0.7rem',
  },

  closeButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#c4cee0',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  statusCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginTop: '1rem',
    padding: '0.75rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,0.045)',
  },

  statusCardActive: {
    borderColor: 'rgba(124,92,255,0.24)',
    background: 'rgba(124,92,255,0.09)',
  },

  statusDot: {
    width: '0.55rem',
    height: '0.55rem',
    flexShrink: 0,
    borderRadius: '999px',
    boxShadow: '0 0 12px currentColor',
  },

  statusCopy: {
    minWidth: 0,
    flex: 1,
  },

  statusLabel: {
    display: 'block',
    color: '#8491ad',
    fontSize: '0.65rem',
  },

  statusValue: {
    display: 'block',
    marginTop: '0.15rem',
    color: '#edf3ff',
    fontSize: '0.78rem',
  },

  statusPill: {
    fontSize: '0.65rem',
    fontWeight: 850,
    letterSpacing: '0.08em',
  },

  explanation: {
    margin: '0.85rem 0',
    color: '#9aa7c1',
    fontSize: '0.72rem',
    lineHeight: 1.55,
  },

  controlGroup: {
    display: 'grid',
    gap: '0.5rem',
  },

  controlButton: {
    minHeight: '2.55rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.72rem',
    fontWeight: 800,
    cursor: 'pointer',
    transition:
      'transform 180ms ease, background 180ms ease, border-color 180ms ease',
  },

  enableButton: {
    borderColor: 'rgba(122,239,189,0.35)',
    color: '#c7ffe4',
    background:
      'linear-gradient(135deg, rgba(122,239,189,0.16), rgba(77,215,255,0.1))',
  },

  disableButton: {
    borderColor: 'rgba(255,255,255,0.18)',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.08)',
  },
};