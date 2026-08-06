import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Camera,
  Clock3,
  Lock,
  Menu,
  MessagesSquare,
  ShieldHalf,
  ShieldOff,
  Video,
} from 'lucide-react';

const GAZE_LOCK_STORAGE_KEY = 'aarush_gaze_lock_enabled';

export default function TopBar({
  pageTitle = 'Home',
  notificationCount = 0,
  initialGazeLock = true,
  profileMode = false,
  username = '',
  timeLimitedProfile = false,
  screenRecording = false,
  screenshotShield = false,
  decoyVault = false,
  onTimeLimitedProfile,
  onScreenRecording,
  onScreenshotShield,
  onDecoyVault,
  onMenuClick,
  onGazeLockChange,
  onNotificationsClick,
  onChatClick,
  onOneTapLock,
}) {
  const navigate = useNavigate();
  const [gazeLockEnabled, setGazeLockEnabled] = useState(initialGazeLock);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedValue = window.localStorage.getItem(GAZE_LOCK_STORAGE_KEY);

    if (savedValue === 'true') {
      setGazeLockEnabled(true);
    }

    if (savedValue === 'false') {
      setGazeLockEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(
      GAZE_LOCK_STORAGE_KEY,
      String(gazeLockEnabled)
    );
  }, [gazeLockEnabled]);

  const title = useMemo(() => {
    if (profileMode && username) {
      return username.startsWith('@') ? username : `@${username}`;
    }

    return pageTitle || 'Home';
  }, [pageTitle, profileMode, username]);

  const toggleGazeLock = () => {
    setGazeLockEnabled((currentValue) => {
      const nextValue = !currentValue;

      if (typeof onGazeLockChange === 'function') {
        onGazeLockChange(nextValue);
      }

      return nextValue;
    });
  };

  const handleNotifications = () => {
    if (typeof onNotificationsClick === 'function') {
      onNotificationsClick();
      return;
    }

    navigate('/notifications');
  };

  const handleChat = () => {
    if (typeof onChatClick === 'function') {
      onChatClick();
      return;
    }

    navigate('/chats');
  };

  const handleOneTapLock = () => {
    if (typeof onOneTapLock === 'function') {
      onOneTapLock();
      return;
    }

    navigate('/lock');
  };

  const handleTimeLimitedProfile = () => {
    if (typeof onTimeLimitedProfile === 'function') {
      onTimeLimitedProfile(!timeLimitedProfile);
      return;
    }

    navigate('/profile/time-limited');
  };

  const handleScreenRecording = () => {
    if (typeof onScreenRecording === 'function') {
      onScreenRecording(!screenRecording);
      return;
    }

    navigate('/profile/screen-recording');
  };

  const handleScreenshotShield = () => {
    if (typeof onScreenshotShield === 'function') {
      onScreenshotShield(!screenshotShield);
      return;
    }

    navigate('/profile/screenshot-shield');
  };

  const handleDecoyVault = () => {
    if (typeof onDecoyVault === 'function') {
      onDecoyVault(!decoyVault);
      return;
    }

    navigate('/profile/decoy-vault');
  };

  const baseButtonStyle = {
    position: 'relative',
    minWidth: '2.75rem',
    height: '2.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.38rem',
    padding: '0 0.78rem',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.05)',
    color: '#edf3ff',
    fontSize: '0.72rem',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition:
      'transform 180ms ease, background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, color 180ms ease',
    WebkitTapHighlightColor: 'transparent',
  };

  const iconButtonStyle = {
    ...baseButtonStyle,
    width: '2.75rem',
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

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        padding: '0.7rem 0.8rem calc(0.7rem + env(safe-area-inset-top))',
        background:
          'linear-gradient(180deg, rgba(7,10,16,0.96) 0%, rgba(7,10,16,0.84) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.24)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '980px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: profileMode
            ? 'auto auto 1fr auto auto auto'
            : 'auto auto 1fr auto auto',
          alignItems: 'center',
          gap: '0.45rem',
        }}
      >
        {profileMode ? (
          <>
            <button
              type="button"
              onClick={handleTimeLimitedProfile}
              aria-label="Open Time-Limited Profile"
              aria-pressed={timeLimitedProfile}
              style={{
                ...baseButtonStyle,
                ...(timeLimitedProfile ? activeButtonStyle : {}),
              }}
            >
              <Clock3 size={15} />
              <span className="aarush-profile-topbar-text">Time-Limited</span>
            </button>

            <button
              type="button"
              onClick={handleScreenRecording}
              aria-label="Open Screen Recording Protection"
              aria-pressed={screenRecording}
              style={{
                ...iconButtonStyle,
                ...(screenRecording ? activeButtonStyle : {}),
              }}
            >
              {screenRecording ? (
                <ShieldHalf size={16} />
              ) : (
                <Video size={16} />
              )}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={toggleGazeLock}
              aria-label={`Gaze Lock ${gazeLockEnabled ? 'enabled' : 'disabled'}`}
              aria-pressed={gazeLockEnabled}
              style={{
                ...baseButtonStyle,
                ...(gazeLockEnabled ? activeButtonStyle : {}),
              }}
            >
              <ShieldHalf size={15} />
              <span>Gaze {gazeLockEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={handleNotifications}
              aria-label={`Open notifications${
                notificationCount > 0 ? `, ${notificationCount} unread` : ''
              }`}
              style={{
                ...iconButtonStyle,
              }}
            >
              <Bell size={17} />

              {notificationCount > 0 ? (
                <span
                  style={{
                    position: 'absolute',
                    top: '-0.2rem',
                    right: '-0.2rem',
                    minWidth: '1.05rem',
                    height: '1.05rem',
                    padding: '0 0.2rem',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '999px',
                    background:
                      'linear-gradient(135deg, #ff4fd8, #7c5cff)',
                    border: '2px solid #0c111b',
                    color: '#fff',
                    fontSize: '0.58rem',
                    fontWeight: 900,
                  }}
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              ) : null}
            </button>
          </>
        )}

        <div
          title={title}
          style={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            color: '#f5f8ff',
            fontSize: profileMode ? '0.98rem' : '1rem',
            fontWeight: 850,
            letterSpacing: profileMode ? '0.01em' : 0,
          }}
        >
          {title}
        </div>

        {profileMode ? (
          <button
            type="button"
            onClick={handleScreenshotShield}
            aria-label="Open Screenshot Shield"
            aria-pressed={screenshotShield}
            style={{
              ...iconButtonStyle,
              ...(screenshotShield ? activeButtonStyle : {}),
            }}
          >
            {screenshotShield ? (
              <ShieldHalf size={16} />
            ) : (
              <Camera size={16} />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleChat}
            aria-label="Open chats"
            style={baseButtonStyle}
          >
            <MessagesSquare size={16} />
            <span>Chat</span>
          </button>
        )}

        {profileMode ? (
          <button
            type="button"
            onClick={handleDecoyVault}
            aria-label="Open Decoy Vault"
            aria-pressed={decoyVault}
            style={{
              ...iconButtonStyle,
              ...(decoyVault ? { ...activeButtonStyle, ...dangerButtonStyle } : {}),
            }}
          >
            <Lock size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOneTapLock}
            aria-label="One Tap Lock"
            style={{
              ...iconButtonStyle,
              ...activeButtonStyle,
            }}
          >
            <Lock size={16} />
          </button>
        )}

        {profileMode ? (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open profile menu"
            style={{
              ...iconButtonStyle,
              ...profileMenuStyle,
            }}
          >
            <Menu size={17} />
          </button>
        ) : null}
      </div>

      <style>{`
        header button:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        header button:active {
          transform: scale(0.96);
        }

        @media (max-width: 560px) {
          .aarush-profile-topbar-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}