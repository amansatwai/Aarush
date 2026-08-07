import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Clapperboard,
  Clock3,
  Home,
  Laptop,
  Plus,
  PlusSquare,
  Search,
  ShieldCheck,
  Smartphone,
  UserRound,
  Users,
} from 'lucide-react';

const LONG_PRESS_DURATION = 700;

const navigationItems = [
  {
    to: '/home',
    label: 'Home',
    Icon: Home,
  },
  {
    to: '/reels',
    label: 'Reels',
    Icon: Clapperboard,
  },
  {
    to: '/search',
    label: 'Search',
    Icon: Search,
  },
  {
    to: '/upload',
    label: 'Upload',
    Icon: PlusSquare,
  },
  {
    to: '/profile',
    label: 'Profile',
    Icon: UserRound,
  },
];

const profileRelatedRoutes = [
  '/profile',
  '/profile/',
  '/shoulder-surf',
  '/emergency-privacy',
  '/privacy-dashboard',
  '/creator-analytics',
  '/profile-settings',
  '/security-settings',
  '/notification-settings',
  '/chat-settings',
  '/control-settings',
  '/help-center',
  '/decoy-vault',
  '/time-limited-profile',
  '/screenshot-shield',
  '/screen-recording',
  '/gaze-lock-settings',
  '/one-tap-lock-settings',
  '/privacy',
  '/privacy-center',
];

const previewAccounts = [
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

function PreviewDeviceIcon({ device }) {
  if (device.toLowerCase().includes('android')) {
    return <Smartphone size={12} />;
  }

  if (device.toLowerCase().includes('laptop')) {
    return <Laptop size={12} />;
  }

  return <ShieldCheck size={12} />;
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const pointerDownRef = useRef(false);

  const [accountPreviewOpen, setAccountPreviewOpen] = useState(false);

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

    document.addEventListener('pointerdown', handleOutsidePointerDown);

    return () => {
      document.removeEventListener(
        'pointerdown',
        handleOutsidePointerDown
      );
    };
  }, [accountPreviewOpen]);

  const isProfileRelatedRoute = profileRelatedRoutes.some((route) => {
    if (route === '/profile') {
      return (
        location.pathname === '/profile' ||
        location.pathname.startsWith('/profile/')
      );
    }

    return (
      location.pathname === route ||
      location.pathname.startsWith(`${route}/`)
    );
  });

  const isItemActive = (item) => {
    if (item.to === '/profile') {
      return isProfileRelatedRoute;
    }

    return location.pathname === item.to;
  };

  const handleNavigation = (event, path) => {
    event.preventDefault();

    if (location.pathname === path) {
      return;
    }

    navigate(path);
  };

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    pointerDownRef.current = false;
  };

  const handleProfilePointerDown = () => {
    pointerDownRef.current = true;
    longPressTriggeredRef.current = false;

    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = window.setTimeout(() => {
      if (!pointerDownRef.current) {
        return;
      }

      longPressTriggeredRef.current = true;
      setAccountPreviewOpen(true);
      longPressTimerRef.current = null;
    }, LONG_PRESS_DURATION);
  };

  const handleProfilePointerUp = () => {
    clearLongPressTimer();
  };

  const handleProfilePointerCancel = () => {
    clearLongPressTimer();
    longPressTriggeredRef.current = false;
  };

  const handleProfileClick = (event, path) => {
    if (longPressTriggeredRef.current) {
      event.preventDefault();
      event.stopPropagation();
      longPressTriggeredRef.current = false;
      return;
    }

    handleNavigation(event, path);
  };

  const openAccountSwitch = () => {
    setAccountPreviewOpen(false);
    navigate('/account-switch');
  };

  const openLogin = () => {
    setAccountPreviewOpen(false);
    navigate('/login');
  };

  const openSignup = () => {
    setAccountPreviewOpen(false);
    navigate('/signup');
  };

  const openSessionManagement = () => {
    setAccountPreviewOpen(false);
    navigate('/session-management');
  };

  return (
    <nav
      className="bottom-nav"
      aria-label="Primary navigation"
      style={{
        position: 'fixed',
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 999,
        padding:
          '0.55rem 0.75rem calc(0.65rem + env(safe-area-inset-bottom))',
        background:
          'linear-gradient(180deg, rgba(8,11,18,0.58) 0%, rgba(8,11,18,0.92) 22%, rgba(8,11,18,0.98) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1.25rem 1.25rem 0 0',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.28)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
      }}
    >
      {accountPreviewOpen ? (
        <section
          ref={popupRef}
          aria-label="Account preview"
          style={{
            position: 'absolute',
            right: '0.75rem',
            bottom: 'calc(100% + 0.75rem)',
            left: '0.75rem',
            width: 'min(420px, calc(100% - 1.5rem))',
            margin: '0 auto',
            padding: '0.85rem',
            borderRadius: '1.35rem',
            background:
              'linear-gradient(145deg, rgba(22,27,44,0.98), rgba(11,15,25,0.97))',
            border: '1px solid rgba(124,92,255,0.28)',
            boxShadow:
              '0 24px 65px rgba(0,0,0,0.52), 0 0 30px rgba(124,92,255,0.14)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '0.7rem',
            }}
          >
            <div>
              <strong
                style={{
                  display: 'block',
                  color: '#f4f7ff',
                  fontSize: '0.9rem',
                  fontWeight: 850,
                }}
              >
                Account preview
              </strong>

              <span
                style={{
                  display: 'block',
                  marginTop: '0.2rem',
                  color: '#96a3bf',
                  fontSize: '0.7rem',
                }}
              >
                {previewAccounts.length} Aarush accounts on this device
              </span>
            </div>

            <button
              type="button"
              onClick={() => setAccountPreviewOpen(false)}
              aria-label="Close account preview"
              style={{
                width: '2rem',
                height: '2rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.09)',
                background: 'rgba(255,255,255,0.06)',
                color: '#dce5f8',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '0.5rem',
              maxHeight: 'min(48vh, 330px)',
              overflowY: 'auto',
            }}
          >
            {previewAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={openAccountSwitch}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem',
                  borderRadius: '1rem',
                  border: account.current
                    ? '1px solid rgba(124,92,255,0.3)'
                    : '1px solid rgba(255,255,255,0.07)',
                  background: account.current
                    ? 'rgba(124,92,255,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  color: '#f4f7ff',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={account.avatarUrl}
                  alt={`${account.displayName} profile`}
                  style={{
                    width: '2.6rem',
                    height: '2.6rem',
                    objectFit: 'cover',
                    borderRadius: '999px',
                    border: account.current
                      ? '2px solid #7c5cff'
                      : '2px solid rgba(255,255,255,0.12)',
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: '#f5f8ff',
                      fontSize: '0.75rem',
                      fontWeight: 850,
                    }}
                  >
                    {account.username}
                    {account.current ? (
                      <Check size={12} color="#7aefbd" />
                    ) : null}
                  </span>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.15rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#9aa7c1',
                      fontSize: '0.68rem',
                    }}
                  >
                    {account.displayName}
                  </span>

                  <span
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '0.45rem',
                      marginTop: '0.28rem',
                      color: '#8290ad',
                      fontSize: '0.6rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <Clock3 size={10} />
                      {account.lastActive}
                    </span>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        color: account.trustedDevice
                          ? '#82e9c1'
                          : '#ffcf8a',
                      }}
                    >
                      <PreviewDeviceIcon device={account.device} />
                      {account.trustedDevice
                        ? 'Trusted'
                        : 'Verify device'}
                    </span>
                  </span>
                </span>

                <ChevronRight
                  size={15}
                  color="#8290ad"
                  style={{ flexShrink: 0 }}
                />
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gap: '0.4rem',
              marginTop: '0.65rem',
              paddingTop: '0.65rem',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <button
              type="button"
              onClick={openLogin}
              style={{
                minHeight: '2.35rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                border: 0,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              Add Another Account
            </button>

            <button
              type="button"
              onClick={openSignup}
              style={{
                minHeight: '2.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Users size={14} />
              Create New Account
            </button>

            <button
              type="button"
              onClick={openSessionManagement}
              style={{
                minHeight: '2.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <ShieldCheck size={14} />
              Manage Sessions
            </button>

            <button
              type="button"
              onClick={() => setAccountPreviewOpen(false)}
              style={{
                minHeight: '2.15rem',
                border: 0,
                borderRadius: '999px',
                background: 'transparent',
                color: '#96a3bf',
                fontSize: '0.7rem',
                fontWeight: 750,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </section>
      ) : null}

      <div
        style={{
          width: '100%',
          maxWidth: '760px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: '0.45rem',
          alignItems: 'stretch',
        }}
      >
        {navigationItems.map(({ to, label, Icon }) => {
          const active = isItemActive({ to, label, Icon });
          const isProfileTab = to === '/profile';

          return (
            <NavLink
              key={to}
              to={to}
              onClick={(event) =>
                isProfileTab
                  ? handleProfileClick(event, to)
                  : handleNavigation(event, to)
              }
              onPointerDown={
                isProfileTab ? handleProfilePointerDown : undefined
              }
              onPointerUp={
                isProfileTab ? handleProfilePointerUp : undefined
              }
              onPointerCancel={
                isProfileTab ? handleProfilePointerCancel : undefined
              }
              onPointerLeave={
                isProfileTab ? handleProfilePointerCancel : undefined
              }
              className={
                active ? 'bottom-nav-link active' : 'bottom-nav-link'
              }
              aria-current={active ? 'page' : undefined}
              aria-label={
                isProfileTab
                  ? 'Profile. Hold for account preview.'
                  : label
              }
              style={{
                position: 'relative',
                minWidth: 0,
                minHeight: '3.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.22rem',
                borderRadius: '1.1rem',
                border: `1px solid ${
                  active ? 'rgba(124,92,255,0.34)' : 'transparent'
                }`,
                background: active
                  ? 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(255,79,216,0.12), rgba(77,215,255,0.12))'
                  : 'rgba(255,255,255,0.015)',
                color: active ? '#ffffff' : '#93a0bb',
                textDecoration: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: isProfileTab ? 'manipulation' : 'auto',
                transition:
                  'transform 180ms ease, background 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                transform: active ? 'translateY(-1px)' : 'translateY(0)',
                boxShadow: active
                  ? '0 10px 24px rgba(124,92,255,0.16), 0 0 0 1px rgba(77,215,255,0.06) inset, 0 0 22px rgba(77,215,255,0.1)'
                  : 'none',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '0.32rem',
                  width: active ? '1.45rem' : '0.42rem',
                  height: '0.25rem',
                  borderRadius: '999px',
                  background: active
                    ? 'linear-gradient(90deg, #7c5cff, #ff4fd8 48%, #4dd7ff)'
                    : 'transparent',
                  boxShadow: active
                    ? '0 0 14px rgba(77,215,255,0.55)'
                    : 'none',
                  transform: active ? 'scaleX(1)' : 'scaleX(0.4)',
                  transition:
                    'width 180ms ease, transform 180ms ease, background 180ms ease, box-shadow 180ms ease',
                }}
              />

              <span
                aria-hidden="true"
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'inherit',
                  filter: active
                    ? 'drop-shadow(0 0 10px rgba(77,215,255,0.38))'
                    : 'drop-shadow(0 0 8px rgba(124,92,255,0.08))',
                  transition: 'filter 180ms ease, transform 180ms ease',
                  transform: active ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.45 : 2.05}
                  fill={active && label === 'Home' ? 'currentColor' : 'none'}
                />
              </span>

              <span
                style={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'inherit',
                  fontSize: '0.72rem',
                  lineHeight: 1,
                  fontWeight: active ? 850 : 700,
                  textAlign: 'center',
                }}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>

      <style>{`
        .bottom-nav-link:hover {
          color: #ffffff !important;
          background: rgba(255,255,255,0.055) !important;
          transform: translateY(-1px);
        }

        .bottom-nav-link:active {
          transform: scale(0.97);
        }

        .bottom-nav-link.active:hover {
          background: linear-gradient(
            135deg,
            rgba(124,92,255,0.3),
            rgba(255,79,216,0.16),
            rgba(77,215,255,0.16)
          ) !important;
        }

        @media (max-width: 420px) {
          .bottom-nav-link {
            min-height: 3.5rem !important;
            border-radius: 1rem !important;
          }

          .bottom-nav-link span:last-child {
            font-size: 0.68rem !important;
          }
        }

        @media (min-width: 600px) {
          .bottom-nav {
            right: 1rem !important;
            bottom: 1rem !important;
            left: 1rem !important;
            max-width: 760px;
            margin: 0 auto;
            border: 1px solid rgba(255,255,255,0.08) !important;
            border-radius: 1.25rem !important;
          }
        }
      `}</style>
    </nav>
  );
}