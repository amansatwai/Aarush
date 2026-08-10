import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Laptop,
  LockKeyhole,
  Menu,
  MessageCircle,
  Search,
  ShieldHalf,
  Smartphone,
  UserRound,
  Users,
  Video,
} from 'lucide-react';
import { useNotificationBadge } from '../hooks/useNotifications';
import NotificationBadge from './NotificationBadge';

const GAZE_LOCK_STORAGE_KEY = 'aarush_gaze_lock_enabled';
const SECRET_ACCESS_INTERVAL = 300;
const NAVIGATION_DEBOUNCE = 350;
const LONG_PRESS_DURATION = 700;

const ROUTES = Object.freeze({
  home: '/home',
  search: '/search',
  notifications: '/notification-center',
  chats: '/chats',
  profile: '/profile',
  profileSettings: '/profile-settings',
  privacy: '/privacy-center',
  security: '/security-center',
});

const PREVIEW_ACCOUNTS = [
  {
    id: 'account-1',
    username: '@arush.dev',
    displayName: 'Aarush Developer',
    avatarUrl: 'https://i.pravatar.cc/120?img=12',
    lastActive: 'Active now',
    trustedDevice: true,
    current: true,
    device: 'This device',
  },
  {
    id: 'account-2',
    username: '@aman.satwai',
    displayName: 'Aman Satwai',
    avatarUrl: 'https://i.pravatar.cc/120?img=11',
    lastActive: '18 minutes ago',
    trustedDevice: true,
    current: false,
    device: 'Windows laptop',
  },
  {
    id: 'account-3',
    username: '@creator.lab',
    displayName: 'Creator Lab',
    avatarUrl: 'https://i.pravatar.cc/120?img=32',
    lastActive: 'Yesterday',
    trustedDevice: false,
    current: false,
    device: 'Android device',
  },
];

function isBrowser() {
  return typeof window !== 'undefined';
}

function PreviewDeviceIcon({ device }) {
  const value = String(device || '').toLowerCase();

  if (value.includes('android')) {
    return <Smartphone size={12} />;
  }

  if (
    value.includes('laptop') ||
    value.includes('windows')
  ) {
    return <Laptop size={12} />;
  }

  return <ShieldHalf size={12} />;
}

export default function TopBar({
  pageTitle = 'Aarush',
  notificationCount = 0,
  initialGazeLock = true,
  profileMode = false,
  username = '',
  timeLimitedProfile = false,
  screenRecording = false,
  screenshotShield = false,
  decoyVault = false,
  showBackButton = false,
  onBack,
  onTimeLimitedProfile,
  onScreenRecording,
  onScreenshotShield,
  onDecoyVault,
  onMenuClick,
  onGazeLockChange,
  onNotificationsClick,
  onSearchClick,
  onChatClick,
  onSecretAccess,
  onAccountPreviewOpen,
  onOneTapLock,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    unreadNotificationCount,
    unreadMessageCount,
  } = useNotificationBadge();

  const lastSecretTapRef = useRef(0);
  const lastNavigationRef = useRef({
    path: '',
    time: 0,
  });
  const popupRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const pointerDownRef = useRef(false);

  const [gazeLockEnabled, setGazeLockEnabled] =
    useState(initialGazeLock);
  const [accountPreviewOpen, setAccountPreviewOpen] =
    useState(false);

  const title = useMemo(() => {
    if (profileMode && username) {
      return username.startsWith('@')
        ? username
        : `@${username}`;
    }

    return pageTitle || 'Aarush';
  }, [pageTitle, profileMode, username]);

  const navigateSafely = useCallback(
    (path, options = {}) => {
      if (!path || !isBrowser()) {
        return;
      }

      if (location.pathname === path) {
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

      navigate(path, options);
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

    if (savedValue === 'true') {
      setGazeLockEnabled(true);
    }

    if (savedValue === 'false') {
      setGazeLockEnabled(false);
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
    return () => {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!accountPreviewOpen) {
      return undefined;
    }

    const handleOutsidePointerDown = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target)
      ) {
        setAccountPreviewOpen(false);
      }
    };

    document.addEventListener(
      'pointerdown',
      handleOutsidePointerDown
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handleOutsidePointerDown
      );
    };
  }, [accountPreviewOpen]);

  const handleBack = useCallback(() => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigateSafely(ROUTES.home);
  }, [navigate, navigateSafely, onBack]);

  const handleSecretAccessPointerUp = useCallback(() => {
    if (typeof onSecretAccess !== 'function') {
      return;
    }

    const now = Date.now();
    const elapsed = now - lastSecretTapRef.current;

    if (
      lastSecretTapRef.current > 0 &&
      elapsed > 0 &&
      elapsed <= SECRET_ACCESS_INTERVAL
    ) {
      lastSecretTapRef.current = 0;
      onSecretAccess();
      return;
    }

    lastSecretTapRef.current = now;
  }, [onSecretAccess]);

  const toggleGazeLock = useCallback(() => {
    setGazeLockEnabled((currentValue) => {
      const nextValue = !currentValue;
      onGazeLockChange?.(nextValue);
      onOneTapLock?.(nextValue);
      return nextValue;
    });
  }, [onGazeLockChange, onOneTapLock]);

  const handleNotifications = useCallback(() => {
    if (typeof onNotificationsClick === 'function') {
      onNotificationsClick();
      return;
    }

    navigateSafely(ROUTES.notifications);
  }, [navigateSafely, onNotificationsClick]);

  const handleChats = useCallback(() => {
    if (typeof onChatClick === 'function') {
      onChatClick();
      return;
    }

    navigateSafely(ROUTES.chats);
  }, [navigateSafely, onChatClick]);

  const handleSearch = useCallback(() => {
    if (typeof onSearchClick === 'function') {
      onSearchClick();
      return;
    }

    navigateSafely(ROUTES.search);
  }, [navigateSafely, onSearchClick]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    pointerDownRef.current = false;
  }, []);

  const handleProfilePointerDown = useCallback(() => {
    pointerDownRef.current = true;
    longPressTriggeredRef.current = false;

    clearLongPressTimer();
    pointerDownRef.current = true;

    longPressTimerRef.current = window.setTimeout(() => {
      if (!pointerDownRef.current) {
        return;
      }

      longPressTriggeredRef.current = true;
      setAccountPreviewOpen(true);
      onAccountPreviewOpen?.();
      longPressTimerRef.current = null;
    }, LONG_PRESS_DURATION);
  }, [clearLongPressTimer, onAccountPreviewOpen]);

  const handleProfilePointerUp = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleProfilePointerCancel = useCallback(() => {
    clearLongPressTimer();
    longPressTriggeredRef.current = false;
  }, [clearLongPressTimer]);

  const handleProfileClick = useCallback(
    (event) => {
      if (longPressTriggeredRef.current) {
        event.preventDefault();
        event.stopPropagation();
        longPressTriggeredRef.current = false;
        return;
      }

      event.preventDefault();
      navigateSafely(ROUTES.profile);
    },
    [navigateSafely]
  );

  const openAccountSwitch = useCallback(() => {
    setAccountPreviewOpen(false);
    navigateSafely('/account-switch');
  }, [navigateSafely]);

  const openLogin = useCallback(() => {
    setAccountPreviewOpen(false);
    navigateSafely('/login');
  }, [navigateSafely]);

  const openSignup = useCallback(() => {
    setAccountPreviewOpen(false);
    navigateSafely('/signup');
  }, [navigateSafely]);

  const openSessionManagement = useCallback(() => {
    setAccountPreviewOpen(false);
    navigateSafely('/session-management');
  }, [navigateSafely]);

  const handleTimeLimitedProfile = useCallback(() => {
    if (typeof onTimeLimitedProfile === 'function') {
      onTimeLimitedProfile(!timeLimitedProfile);
      return;
    }

    navigateSafely(ROUTES.profileSettings);
  }, [
    navigateSafely,
    onTimeLimitedProfile,
    timeLimitedProfile,
  ]);

  const handleScreenRecording = useCallback(() => {
    if (typeof onScreenRecording === 'function') {
      onScreenRecording(!screenRecording);
      return;
    }

    navigateSafely(ROUTES.security);
  }, [
    navigateSafely,
    onScreenRecording,
    screenRecording,
  ]);

  const handleScreenshotShield = useCallback(() => {
    if (typeof onScreenshotShield === 'function') {
      onScreenshotShield(!screenshotShield);
      return;
    }

    navigateSafely(ROUTES.security);
  }, [
    navigateSafely,
    onScreenshotShield,
    screenshotShield,
  ]);

  const handleDecoyVault = useCallback(() => {
    if (typeof onDecoyVault === 'function') {
      onDecoyVault(!decoyVault);
      return;
    }

    navigateSafely(ROUTES.privacy);
  }, [decoyVault, navigateSafely, onDecoyVault]);

  const baseButtonStyle = {
    position: 'relative',
    minWidth: '2.65rem',
    height: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    padding: '0 0.7rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#edf3ff',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.7rem',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition:
      'transform 180ms ease, background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, color 180ms ease',
    WebkitTapHighlightColor: 'transparent',
  };

  const iconButtonStyle = {
    ...baseButtonStyle,
    width: '2.65rem',
    padding: 0,
    flexShrink: 0,
  };

  const activeButtonStyle = {
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.28), rgba(77,215,255,0.14))',
    borderColor: 'rgba(124,92,255,0.34)',
    boxShadow:
      '0 0 22px rgba(124,92,255,0.16), 0 0 12px rgba(77,215,255,0.08)',
  };

  const dangerButtonStyle = {
    background: 'rgba(255,79,122,0.1)',
    borderColor: 'rgba(255,79,122,0.22)',
    color: '#ffb1c8',
    boxShadow: '0 0 20px rgba(255,79,122,0.1)',
  };

  const profileMenuStyle = {
    background:
      'linear-gradient(180deg, rgba(255,153,76,0.2) 0%, rgba(255,255,255,0.06) 48%, rgba(74,178,108,0.2) 100%)',
    borderColor: 'rgba(255,255,255,0.14)',
    boxShadow:
      '0 0 20px rgba(255,153,76,0.08), 0 0 20px rgba(74,178,108,0.08)',
  };

  const notificationCountValue =
    Number(notificationCount) > 0
      ? notificationCount
      : unreadNotificationCount;

  return (
    <header style={styles.header}>
      <div
        style={{
          ...styles.inner,
          gridTemplateColumns: profileMode
            ? 'auto auto 1fr auto auto auto auto'
            : showBackButton
              ? 'auto auto 1fr auto auto auto auto'
              : 'auto auto 1fr auto auto auto',
        }}
      >
        {showBackButton ? (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            style={iconButtonStyle}
          >
            <ArrowLeft size={18} />
          </button>
        ) : null}

        {profileMode ? (
          <>
            <button
              type="button"
              onClick={handleTimeLimitedProfile}
              aria-label="Open profile settings"
              aria-pressed={timeLimitedProfile}
              style={{
                ...baseButtonStyle,
                ...(timeLimitedProfile
                  ? activeButtonStyle
                  : {}),
              }}
            >
              <Clock3 size={18} />
              <span className="aarush-topbar-text">
                Time-Limited
              </span>
            </button>

            <button
              type="button"
              onClick={handleScreenRecording}
              aria-label="Open security center"
              aria-pressed={screenRecording}
              style={{
                ...iconButtonStyle,
                ...(screenRecording
                  ? activeButtonStyle
                  : {}),
              }}
            >
              {screenRecording ? (
                <ShieldHalf size={18} />
              ) : (
                <Video size={18} />
              )}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={toggleGazeLock}
            aria-label={`Gaze Lock ${
              gazeLockEnabled ? 'enabled' : 'disabled'
            }`}
            aria-pressed={gazeLockEnabled}
            style={{
              ...baseButtonStyle,
              ...(gazeLockEnabled
                ? activeButtonStyle
                : {}),
            }}
          >
            <ShieldHalf size={18} />
            <span className="aarush-topbar-text">
              Gaze {gazeLockEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        )}

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
          onPointerUp={handleSecretAccessPointerUp}
          style={styles.title}
        >
          {title}
        </div>

        <button
          type="button"
          onClick={handleNotifications}
          aria-label={`Open notifications${
            notificationCountValue > 0
              ? `, ${notificationCountValue} unread`
              : ''
          }`}
          style={iconButtonStyle}
        >
          <Bell size={18} />
          <NotificationBadge
            type="notification"
            size="small"
          />
        </button>

        <button
          type="button"
          onClick={handleChats}
          aria-label={`Open chats${
            unreadMessageCount > 0
              ? `, ${unreadMessageCount} unread`
              : ''
          }`}
          style={iconButtonStyle}
        >
          <MessageCircle size={18} />
          <NotificationBadge
            type="message"
            size="small"
          />
        </button>

        {profileMode ? (
          <button
            type="button"
            onClick={handleScreenshotShield}
            aria-label="Open screenshot shield settings"
            aria-pressed={screenshotShield}
            style={{
              ...iconButtonStyle,
              ...(screenshotShield
                ? activeButtonStyle
                : {}),
            }}
          >
            <Camera size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSearch}
            aria-label="Open search"
            style={iconButtonStyle}
          >
            <Search size={18} />
          </button>
        )}

        {!profileMode ? (
          <button
            type="button"
            onClick={handleProfileClick}
            onPointerDown={handleProfilePointerDown}
            onPointerUp={handleProfilePointerUp}
            onPointerCancel={handleProfilePointerCancel}
            onPointerLeave={handleProfilePointerCancel}
            aria-label="Profile. Hold for account preview."
            style={iconButtonStyle}
          >
            <UserRound size={18} />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleDecoyVault}
              aria-label="Open decoy vault"
              aria-pressed={decoyVault}
              style={{
                ...iconButtonStyle,
                ...(decoyVault
                  ? {
                      ...activeButtonStyle,
                      ...dangerButtonStyle,
                    }
                  : {}),
              }}
            >
              <LockKeyhole size={18} />
            </button>

            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open profile menu"
              style={{
                ...iconButtonStyle,
                ...profileMenuStyle,
              }}
            >
              <Menu size={18} />
            </button>
          </>
        )}
      </div>

      {accountPreviewOpen ? (
        <section
          ref={popupRef}
          aria-label="Account preview"
          style={styles.accountPopup}
        >
          <div style={styles.popupHeader}>
            <div>
              <strong style={styles.popupTitle}>
                Account preview
              </strong>

              <span style={styles.popupSubtitle}>
                {PREVIEW_ACCOUNTS.length} Aarush accounts on
                this device
              </span>
            </div>

            <button
              type="button"
              onClick={() => setAccountPreviewOpen(false)}
              aria-label="Close account preview"
              style={styles.popupClose}
            >
              ×
            </button>
          </div>

          <div style={styles.accountList}>
            {PREVIEW_ACCOUNTS.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={openAccountSwitch}
                style={{
                  ...styles.accountButton,
                  ...(account.current
                    ? styles.currentAccount
                    : {}),
                }}
              >
                <img
                  src={account.avatarUrl}
                  alt={`${account.displayName} profile`}
                  style={{
                    ...styles.accountAvatar,
                    ...(account.current
                      ? styles.currentAccountAvatar
                      : {}),
                  }}
                />

                <span style={styles.accountContent}>
                  <span style={styles.accountUsername}>
                    {account.username}

                    {account.current ? (
                      <Check size={12} color="#7aefbd" />
                    ) : null}
                  </span>

                  <span style={styles.accountName}>
                    {account.displayName}
                  </span>

                  <span style={styles.accountMeta}>
                    <span style={styles.accountMetaItem}>
                      {account.lastActive}
                    </span>

                    <span
                      style={{
                        ...styles.accountMetaItem,
                        color: account.trustedDevice
                          ? '#82e9c1'
                          : '#ffcf8a',
                      }}
                    >
                      <PreviewDeviceIcon
                        device={account.device}
                      />
                      {account.trustedDevice
                        ? 'Trusted'
                        : 'Verify device'}
                    </span>
                  </span>
                </span>

                <ChevronRight
                  size={15}
                  color="#8290ad"
                />
              </button>
            ))}
          </div>

          <div style={styles.popupActions}>
            <button
              type="button"
              onClick={openLogin}
              style={styles.primaryPopupAction}
            >
              <span aria-hidden="true">＋</span>
              Add Another Account
            </button>

            <button
              type="button"
              onClick={openSignup}
              style={styles.secondaryPopupAction}
            >
              <Users size={14} />
              Create New Account
            </button>

            <button
              type="button"
              onClick={openSessionManagement}
              style={styles.secondaryPopupAction}
            >
              <ShieldHalf size={14} />
              Manage Sessions
            </button>

            <button
              type="button"
              onClick={() => setAccountPreviewOpen(false)}
              style={styles.closePopupAction}
            >
              Close
            </button>
          </div>
        </section>
      ) : null}

      <style>{`
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

        @media (max-width: 620px) {
          .aarush-topbar-text {
            display: none;
          }
        }

        @media (max-width: 460px) {
          .aarush-topbar-text {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          header button {
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
    background:
      'linear-gradient(180deg, rgba(7,10,16,0.96) 0%, rgba(7,10,16,0.84) 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.24)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  inner: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'grid',
    alignItems: 'center',
    gap: '0.35rem',
  },

  title: {
    minWidth: 0,
    overflow: 'hidden',
    color: '#f5f8ff',
    fontSize: '0.98rem',
    fontWeight: 850,
    textAlign: 'center',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    touchAction: 'manipulation',
  },

  accountPopup: {
    position: 'absolute',
    top: 'calc(100% + 0.65rem)',
    right: '0.8rem',
    width: 'min(420px, calc(100% - 1.6rem))',
    padding: '0.85rem',
    borderRadius: '1.35rem',
    background:
      'linear-gradient(145deg, rgba(22,27,44,0.98), rgba(11,15,25,0.97))',
    border: '1px solid rgba(124,92,255,0.28)',
    boxShadow:
      '0 24px 65px rgba(0,0,0,0.52), 0 0 30px rgba(124,92,255,0.14)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
  },

  popupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    marginBottom: '0.7rem',
  },

  popupTitle: {
    display: 'block',
    color: '#f4f7ff',
    fontSize: '0.9rem',
    fontWeight: 850,
  },

  popupSubtitle: {
    display: 'block',
    marginTop: '0.2rem',
    color: '#96a3bf',
    fontSize: '0.7rem',
  },

  popupClose: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  accountList: {
    display: 'grid',
    gap: '0.5rem',
    maxHeight: 'min(48vh, 330px)',
    overflowY: 'auto',
  },

  accountButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.65rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '1rem',
    color: '#f4f7ff',
    background: 'rgba(255,255,255,0.04)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  currentAccount: {
    borderColor: 'rgba(124,92,255,0.3)',
    background: 'rgba(124,92,255,0.12)',
  },

  accountAvatar: {
    width: '2.6rem',
    height: '2.6rem',
    objectFit: 'cover',
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.12)',
    borderRadius: '999px',
  },

  currentAccountAvatar: {
    borderColor: '#7c5cff',
  },

  accountContent: {
    minWidth: 0,
    flex: 1,
  },

  accountUsername: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    color: '#f5f8ff',
    fontSize: '0.75rem',
    fontWeight: 850,
  },

  accountName: {
    display: 'block',
    marginTop: '0.15rem',
    overflow: 'hidden',
    color: '#9aa7c1',
    fontSize: '0.68rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  accountMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.45rem',
    marginTop: '0.28rem',
    color: '#8290ad',
    fontSize: '0.6rem',
  },

  accountMetaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
  },

  popupActions: {
    display: 'grid',
    gap: '0.4rem',
    marginTop: '0.65rem',
    paddingTop: '0.65rem',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },

  primaryPopupAction: {
    minHeight: '2.35rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  secondaryPopupAction: {
    minHeight: '2.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.7rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  closePopupAction: {
    minHeight: '2.15rem',
    border: 0,
    borderRadius: '999px',
    color: '#96a3bf',
    background: 'transparent',
    fontSize: '0.7rem',
    fontWeight: 750,
    cursor: 'pointer',
  },
};