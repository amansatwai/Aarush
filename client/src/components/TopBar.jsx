// src/components/TopBar.jsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Camera,
  Check,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  Menu,
  Search,
  Shield,
  ShieldCheck,
  Timer,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useNotificationBadge } from '../hooks/useNotifications';
import NotificationBadge from './NotificationBadge';

const GAZE_KEY = 'aarush_gaze_lock_enabled';
const PANEL_CLOSE_DELAY = 220;
const NAVIGATION_DELAY = 350;

const HOME_ROUTES = {
  search: '/search',
  notifications: '/notification-center',
  profile: '/profile',
};

const PROFILE_ROUTES = [
  ['Edit Profile', '/profile-settings', Edit3],
  ['Account Switch', '/account-switch', Users],
  ['Security Center', '/security-center', ShieldCheck],
  ['Privacy Dashboard', '/privacy-dashboard', Shield],
  ['Social Privacy Settings', '/social-privacy-settings', Shield],
  ['Close Friends', '/close-friends', Users],
  ['Blocked Users', '/blocked-users', Shield],
  ['Follow Requests', '/follow-requests', Users],
  ['Logout Sessions', '/session-management', ShieldCheck],
  ['App Lock', '/app-lock-settings', ShieldCheck],
  ['Settings', '/profile-settings', Shield],
  ['Help & Support', '/help', Users],
];

function browser() {
  return typeof window !== 'undefined';
}

function safeStorageGet(key, fallback) {
  if (!browser()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  if (!browser()) return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private browser contexts.
  }
}

function formatRemaining(milliseconds) {
  if (milliseconds <= 0) return 'Expired';

  const totalMinutes = Math.ceil(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0
    ? `${hours}h ${minutes}m remaining`
    : `${minutes}m remaining`;
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
  const { unreadNotificationCount = 0 } =
    useNotificationBadge();

  const popupRef = useRef(null);
  const closeTimerRef = useRef(null);
  const timerRef = useRef(null);
  const lastNavigationRef = useRef({
    path: '',
    time: 0,
  });

  const [gazeEnabled, setGazeEnabled] =
    useState(initialGazeLock);
  const [panel, setPanel] = useState(null);
  const [panelVisible, setPanelVisible] =
    useState(false);
  const [drawerOpen, setDrawerOpen] =
    useState(false);
  const [drawerVisible, setDrawerVisible] =
    useState(false);
  const [recordingEnabled, setRecordingEnabled] =
    useState(true);
  const [screenshotEnabled, setScreenshotEnabled] =
    useState(true);
  const [timerEnd, setTimerEnd] = useState(null);
  const [remaining, setRemaining] = useState('');

  const title = profileMode
    ? username
      ? username.startsWith('@')
        ? username
        : `@${username}`
      : '@username'
    : pageTitle || 'Aarush';

  const unreadCount =
    Number(notificationCount) > 0
      ? Number(notificationCount)
      : Number(unreadNotificationCount) || 0;

  const navigateSafely = useCallback(
    (path) => {
      if (!path || path === location.pathname) return;

      const now = Date.now();
      const previous = lastNavigationRef.current;

      if (
        previous.path === path &&
        now - previous.time < NAVIGATION_DELAY
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

  const closePanel = useCallback(() => {
    setPanelVisible(false);

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setPanel(null);
      closeTimerRef.current = null;
    }, PANEL_CLOSE_DELAY);
  }, []);

  const openPanel = useCallback(
    (name) => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      setPanel(name);
      setPanelVisible(false);

      window.requestAnimationFrame(() => {
        setPanelVisible(true);
      });
    },
    []
  );

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setDrawerOpen(false);
      closeTimerRef.current = null;
    }, PANEL_CLOSE_DELAY);
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    setDrawerVisible(false);

    window.requestAnimationFrame(() => {
      setDrawerVisible(true);
    });
  }, []);

  useEffect(() => {
    const saved = safeStorageGet(GAZE_KEY, null);

    if (saved === 'true' || saved === 'false') {
      setGazeEnabled(saved === 'true');
    }
  }, []);

  useEffect(() => {
    safeStorageSet(GAZE_KEY, String(gazeEnabled));
  }, [gazeEnabled]);

  useEffect(() => {
    if (!panel && !drawerOpen) return undefined;

    const handlePointerDown = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target)
      ) {
        if (panel) closePanel();
        if (drawerOpen) closeDrawer();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closePanel();
        closeDrawer();
      }
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDown
    );
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown
      );
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [closeDrawer, closePanel, drawerOpen, panel]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!timerEnd) {
      setRemaining('');
      return undefined;
    }

    const update = () => {
      const value = timerEnd - Date.now();

      if (value <= 0) {
        setTimerEnd(null);
        setRemaining('');
        return;
      }

      setRemaining(formatRemaining(value));
    };

    update();
    timerRef.current = window.setInterval(update, 30000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerEnd]);

  const toggleGaze = () => {
    const next = !gazeEnabled;
    setGazeEnabled(next);
    onGazeLockChange?.(next);
    onOneTapLock?.(next);
  };

  const handleNotifications = () => {
    if (typeof onNotificationsClick === 'function') {
      onNotificationsClick();
      return;
    }

    navigateSafely(HOME_ROUTES.notifications);
  };

  const handleSearch = () => {
    if (typeof onSearchClick === 'function') {
      onSearchClick();
      return;
    }

    navigateSafely(HOME_ROUTES.search);
  };

  const startTimer = (minutes) => {
    setTimerEnd(Date.now() + minutes * 60000);
  };

  const titleProps =
    typeof onSecretAccess === 'function'
      ? {
          role: 'button',
          onPointerUp: onSecretAccess,
          tabIndex: 0,
        }
      : {};

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        {profileMode ? (
          <div style={styles.controlsLeft}>
            <button
              type="button"
              aria-label="Screen recording detection"
              onClick={() => openPanel('recording')}
              style={{
                ...styles.iconButton,
                ...(recordingEnabled
                  ? styles.activeButton
                  : {}),
              }}
            >
              <Camera size={19} />
            </button>

            <button
              type="button"
              aria-label="Time-limited profile"
              onClick={() => openPanel('timer')}
              style={{
                ...styles.iconButton,
                ...(timerEnd
                  ? styles.activeButton
                  : {}),
              }}
            >
              <Clock3 size={19} />
            </button>
          </div>
        ) : (
          <div style={styles.controlsLeft}>
            <button
              type="button"
              aria-label="Gaze Lock"
              onClick={() => openPanel('gaze')}
              style={{
                ...styles.iconButton,
                ...(gazeEnabled
                  ? styles.activeButton
                  : {}),
              }}
            >
              {gazeEnabled ? (
                <Eye size={19} />
              ) : (
                <EyeOff size={19} />
              )}
            </button>

            <button
              type="button"
              onClick={handleNotifications}
              aria-label={`Notifications${
                unreadCount > 0
                  ? `, ${unreadCount} unread`
                  : ''
              }`}
              style={styles.iconButton}
            >
              <Bell size={19} />
              <NotificationBadge
                type="notification"
                size="small"
              />
            </button>
          </div>
        )}

        <div
          {...titleProps}
          title={title}
          style={styles.title}
        >
          {title}
        </div>

        {profileMode ? (
          <div style={styles.controlsRight}>
            <button
              type="button"
              aria-label="Screenshot detection"
              onClick={() => openPanel('screenshot')}
              style={{
                ...styles.iconButton,
                ...(screenshotEnabled
                  ? styles.activeButton
                  : {}),
              }}
            >
              <Shield size={19} />
            </button>

            <button
              type="button"
              aria-label="Open profile menu"
              onClick={openDrawer}
              style={styles.iconButton}
            >
              <Menu size={20} />
            </button>
          </div>
        ) : (
          <div style={styles.controlsRight}>
            <button
              type="button"
              onClick={handleSearch}
              aria-label="Search"
              style={styles.iconButton}
            >
              <Search size={19} />
            </button>

            <button
              type="button"
              onClick={() =>
                navigateSafely(HOME_ROUTES.profile)
              }
              aria-label="Profile"
              style={styles.iconButton}
            >
              <UserRound size={19} />
            </button>
          </div>
        )}
      </div>

      {(panel || drawerOpen) && (
        <div
          style={{
            ...styles.layer,
            opacity:
              panelVisible || drawerVisible ? 1 : 0,
            pointerEvents:
              panelVisible || drawerVisible
                ? 'auto'
                : 'none',
          }}
        >
          {panel ? (
            <section
              ref={popupRef}
              role="dialog"
              aria-modal="false"
              style={{
                ...styles.panel,
                transform: panelVisible
                  ? 'translateY(0) scale(1)'
                  : 'translateY(-8px) scale(.98)',
              }}
            >
              <div style={styles.panelHeader}>
                <strong style={styles.panelTitle}>
                  {panel === 'gaze'
                    ? 'Gaze Lock'
                    : panel === 'recording'
                      ? 'Screen Recording Detection'
                      : panel === 'screenshot'
                        ? 'Screenshot Detection'
                        : 'Time-Limited Profile'}
                </strong>

                <button
                  type="button"
                  aria-label="Close panel"
                  onClick={closePanel}
                  style={styles.closeButton}
                >
                  <X size={17} />
                </button>
              </div>

              {panel === 'gaze' ? (
                <>
                  <p style={styles.description}>
                    Protect private content with Aarush
                    attention-aware privacy controls.
                  </p>

                  <Status
                    enabled={gazeEnabled}
                    enabledText="Gaze Lock enabled"
                    disabledText="Gaze Lock disabled"
                  />

                  <Controls
                    enabled={gazeEnabled}
                    enable={() => {
                      setGazeEnabled(true);
                      onGazeLockChange?.(true);
                    }}
                    disable={() => {
                      setGazeEnabled(false);
                      onGazeLockChange?.(false);
                    }}
                  />
                </>
              ) : null}

              {panel === 'recording' ? (
                <>
                  <p style={styles.description}>
                    Prepare Aarush to respond when screen
                    recording is detected.
                  </p>

                  <Status
                    enabled={recordingEnabled}
                    enabledText="Recording protection enabled"
                    disabledText="Recording protection disabled"
                  />

                  <Controls
                    enabled={recordingEnabled}
                    enable={() => setRecordingEnabled(true)}
                    disable={() =>
                      setRecordingEnabled(false)
                    }
                  />
                </>
              ) : null}

              {panel === 'screenshot' ? (
                <>
                  <p style={styles.description}>
                    Prepare privacy responses for screenshots
                    and screen capture events.
                  </p>

                  <Status
                    enabled={screenshotEnabled}
                    enabledText="Screenshot protection enabled"
                    disabledText="Screenshot protection disabled"
                  />

                  <Controls
                    enabled={screenshotEnabled}
                    enable={() => setScreenshotEnabled(true)}
                    disable={() =>
                      setScreenshotEnabled(false)
                    }
                  />
                </>
              ) : null}

              {panel === 'timer' ? (
                <>
                  <p style={styles.description}>
                    Temporarily expose profile visibility for
                    a selected duration.
                  </p>

                  <div style={styles.timerStatus}>
                    <Timer size={16} />
                    {remaining || 'No active timer'}
                  </div>

                  <div style={styles.durationGrid}>
                    {[15, 30, 60, 120].map((minutes) => (
                      <button
                        type="button"
                        key={minutes}
                        onClick={() => startTimer(minutes)}
                        style={styles.durationButton}
                      >
                        {minutes >= 60
                          ? `${minutes / 60}h`
                          : `${minutes}m`}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setTimerEnd(null)}
                    style={styles.disableButton}
                  >
                    Deactivate timer
                  </button>
                </>
              ) : null}
            </section>
          ) : null}

          {drawerOpen ? (
            <aside
              ref={popupRef}
              style={{
                ...styles.drawer,
                transform: drawerVisible
                  ? 'translateX(0)'
                  : 'translateX(100%)',
              }}
            >
              <div style={styles.panelHeader}>
                <strong style={styles.panelTitle}>
                  Profile controls
                </strong>

                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={closeDrawer}
                  style={styles.closeButton}
                >
                  <X size={17} />
                </button>
              </div>

              <div style={styles.drawerList}>
                {PROFILE_ROUTES.map(
                  ([label, route, Icon]) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() => {
                        closeDrawer();
                        navigateSafely(route);
                      }}
                      style={styles.drawerItem}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={closeDrawer}
                  style={styles.drawerItem}
                >
                  <Shield size={16} />
                  <span>About Aarush</span>
                </button>
              </div>
            </aside>
          ) : null}
        </div>
      )}
    </header>
  );
}

function Status({
  enabled,
  enabledText,
  disabledText,
}) {
  return (
    <div style={styles.status}>
      <span
        style={{
          ...styles.statusDot,
          background: enabled ? '#7aefbd' : '#8a96ad',
        }}
      />
      <span>
        {enabled ? enabledText : disabledText}
      </span>
      <strong>{enabled ? 'ON' : 'OFF'}</strong>
    </div>
  );
}

function Controls({ enabled, enable, disable }) {
  return (
    <div style={styles.controlGrid}>
      <button
        type="button"
        onClick={enable}
        aria-pressed={enabled}
        style={{
          ...styles.controlButton,
          ...(enabled ? styles.enableButton : {}),
        }}
      >
        <Check size={15} />
        Enable
      </button>

      <button
        type="button"
        onClick={disable}
        aria-pressed={!enabled}
        style={{
          ...styles.controlButton,
          ...(!enabled ? styles.disableButton : {}),
        }}
      >
        <EyeOff size={15} />
        Disable
      </button>
    </div>
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
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background:
      'linear-gradient(180deg,rgba(7,10,16,.97),rgba(7,10,16,.86))',
    boxShadow: '0 10px 30px rgba(0,0,0,.24)',
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
  },

  controlsLeft: {
    flex: '1 1 0',
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '.4rem',
  },

  controlsRight: {
    flex: '1 1 0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '.4rem',
  },

  iconButton: {
    position: 'relative',
    width: '2.65rem',
    height: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: '999px',
    color: '#edf3ff',
    background:
      'linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.035))',
    cursor: 'pointer',
    transition: 'all 180ms ease',
  },

  activeButton: {
    borderColor: 'rgba(124,92,255,.42)',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.32),rgba(77,215,255,.16))',
    boxShadow: '0 0 22px rgba(124,92,255,.2)',
  },

  title: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 'min(42%,20rem)',
    overflow: 'hidden',
    color: '#f5f8ff',
    fontSize: '.98rem',
    fontWeight: 850,
    textAlign: 'center',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    transform: 'translate(-50%,-50%)',
    userSelect: 'none',
  },

  layer: {
    position: 'fixed',
    inset: 0,
    zIndex: 1100,
    padding: '4.7rem .8rem 1rem',
    background: 'rgba(2,5,10,.28)',
    transition: 'opacity 220ms ease',
  },

  panel: {
    width: 'min(390px,100%)',
    margin: '0 auto',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.3rem',
    background:
      'linear-gradient(145deg,rgba(22,27,44,.98),rgba(9,13,24,.98))',
    boxShadow: '0 24px 65px rgba(0,0,0,.52)',
    transition: 'transform 220ms ease',
  },

  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 'min(360px,92vw)',
    padding: '1rem',
    overflowY: 'auto',
    background:
      'linear-gradient(180deg,rgba(22,27,44,.99),rgba(8,12,21,.99))',
    borderLeft: '1px solid rgba(124,92,255,.3)',
    boxShadow: '-20px 0 60px rgba(0,0,0,.45)',
    transition: 'transform 220ms ease',
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.75rem',
  },

  panelTitle: {
    color: '#f4f7ff',
    fontSize: '1rem',
  },

  closeButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.06)',
    cursor: 'pointer',
  },

  description: {
    margin: '.9rem 0',
    color: '#9aa7c1',
    fontSize: '.72rem',
    lineHeight: 1.5,
  },

  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.75rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.045)',
    fontSize: '.72rem',
  },

  statusDot: {
    width: '.55rem',
    height: '.55rem',
    borderRadius: '999px',
  },

  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.75rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.045)',
    fontSize: '.72rem',
  },

  controlGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '.5rem',
    marginTop: '.75rem',
  },

  controlButton: {
    minHeight: '2.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.7rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  enableButton: {
    borderColor: 'rgba(122,239,189,.35)',
    color: '#c7ffe4',
    background: 'rgba(122,239,189,.12)',
  },

  disableButton: {
    borderColor: 'rgba(255,255,255,.18)',
    background: 'rgba(255,255,255,.09)',
  },

  timerStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '.75rem',
    borderRadius: '.9rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.08)',
    fontSize: '.72rem',
  },

  durationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
    margin: '.75rem 0',
  },

  durationButton: {
    minHeight: '2.25rem',
    border: '1px solid rgba(124,92,255,.24)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(124,92,255,.1)',
    cursor: 'pointer',
  },

  drawerList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '1rem',
  },

  drawerItem: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.65rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.8rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.045)',
    fontSize: '.72rem',
    fontWeight: 750,
    textAlign: 'left',
    cursor: 'pointer',
  },
};