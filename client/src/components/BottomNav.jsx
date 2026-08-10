import { useEffect, useRef } from 'react';
import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Bell,
  Clapperboard,
  Home,
  Lock,
  MessageCircle,
  PlusSquare,
} from 'lucide-react';
import { useNotificationBadge } from '../hooks/useNotifications';
import NotificationBadge from './NotificationBadge';

const NAVIGATION_DEBOUNCE = 350;

const NAVIGATION_ITEMS = [
  {
    to: '/home',
    label: 'Home',
    Icon: Home,
    matches: ['/home'],
  },
  {
    to: '/lock',
    label: 'One Tap Lock',
    Icon: Lock,
    matches: ['/lock'],
  },
  {
    to: '/reels',
    label: 'Reels',
    Icon: Clapperboard,
    matches: ['/reels'],
  },
  {
    to: '/upload',
    label: 'Upload',
    Icon: PlusSquare,
    matches: ['/upload'],
  },
  {
    to: '/chats',
    label: 'Chats',
    Icon: MessageCircle,
    badgeType: 'message',
    matches: ['/chats', '/chat'],
  },
  {
    to: '/notification-center',
    label: 'Notifications',
    Icon: Bell,
    badgeType: 'notification',
    matches: [
      '/notification-center',
      '/notifications',
    ],
  },
];

function routeMatches(pathname, item) {
  return item.matches.some((route) => {
    if (route === '/home' || route === '/lock') {
      return pathname === route;
    }

    return (
      pathname === route ||
      pathname.startsWith(`${route}/`)
    );
  });
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    unreadMessageCount,
    unreadNotificationCount,
  } = useNotificationBadge();

  const lastNavigationRef = useRef({
    path: '',
    time: 0,
  });

  useEffect(() => {
    return () => {
      lastNavigationRef.current = {
        path: '',
        time: 0,
      };
    };
  }, []);

  const navigateSafely = (path) => {
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
  };

  const handleNavigation = (event, path) => {
    event.preventDefault();
    navigateSafely(path);
  };

  const getBadgeCount = (badgeType) => {
    if (badgeType === 'message') {
      return unreadMessageCount;
    }

    if (badgeType === 'notification') {
      return unreadNotificationCount;
    }

    return 0;
  };

  return (
    <nav
      className="bottom-nav"
      aria-label="Primary navigation"
      style={styles.nav}
    >
      <div style={styles.navigationGrid}>
        {NAVIGATION_ITEMS.map(
          ({ to, label, Icon, badgeType, matches }) => {
            const active = routeMatches(
              location.pathname,
              {
                to,
                matches,
              }
            );

            const badgeCount =
              getBadgeCount(badgeType);

            return (
              <NavLink
                key={to}
                to={to}
                onClick={(event) =>
                  handleNavigation(event, to)
                }
                className={
                  active
                    ? 'bottom-nav-link active'
                    : 'bottom-nav-link'
                }
                aria-current={
                  active ? 'page' : undefined
                }
                aria-label={
                  label === 'One Tap Lock'
                    ? 'One Tap Lock'
                    : label
                }
                style={{
                  ...styles.navigationLink,
                  ...(active
                    ? styles.activeNavigationLink
                    : {}),
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    ...styles.activeIndicator,
                    ...(active
                      ? styles.visibleActiveIndicator
                      : {}),
                  }}
                />

                <span style={styles.navigationIcon}>
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.45 : 2.05}
                    fill={
                      active && label === 'Home'
                        ? 'currentColor'
                        : 'none'
                    }
                  />

                  {badgeType && badgeCount > 0 ? (
                    <NotificationBadge
                      type={badgeType}
                      size="small"
                      style={styles.badgeOverride}
                    />
                  ) : null}
                </span>

                <span style={styles.navigationLabel}>
                  {label === 'One Tap Lock'
                    ? 'Lock'
                    : label === 'Notifications'
                      ? 'Alerts'
                      : label}
                </span>
              </NavLink>
            );
          }
        )}
      </div>

      <style>{`
        .bottom-nav-link {
          transition:
            transform 180ms ease,
            background 180ms ease,
            color 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .bottom-nav-link:hover {
          color: #ffffff !important;
          background: rgba(255,255,255,0.055) !important;
          transform: translateY(-1px);
        }

        .bottom-nav-link:active {
          transform: scale(0.97);
        }

        .bottom-nav-link:focus-visible,
        .bottom-nav button:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 2px;
        }

        @media (max-width: 520px) {
          .bottom-nav-link {
            min-height: 3.5rem !important;
            border-radius: 0.95rem !important;
          }

          .bottom-nav-link span:last-child {
            font-size: 0.62rem !important;
          }
        }

        @media (max-width: 390px) {
          .bottom-nav-link span:last-child {
            max-width: 3.8rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        @media (min-width: 600px) {
          .bottom-nav {
            right: 1rem !important;
            bottom: 1rem !important;
            left: 1rem !important;
            max-width: 920px;
            margin: 0 auto;
            border: 1px solid rgba(255,255,255,0.08) !important;
            border-radius: 1.25rem !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bottom-nav-link {
            transition: none !important;
          }
        }
      `}</style>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
    padding:
      '0.55rem 0.55rem calc(0.65rem + env(safe-area-inset-bottom))',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.25rem 1.25rem 0 0',
    background:
      'linear-gradient(180deg, rgba(8,11,18,0.58) 0%, rgba(8,11,18,0.92) 22%, rgba(8,11,18,0.98) 100%)',
    boxShadow: '0 -10px 30px rgba(0,0,0,0.28)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
  },

  navigationGrid: {
    width: '100%',
    maxWidth: '920px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns:
      'repeat(6, minmax(0, 1fr))',
    gap: '0.3rem',
    alignItems: 'stretch',
  },

  navigationLink: {
    position: 'relative',
    minWidth: 0,
    minHeight: '3.75rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.22rem',
    border: '1px solid transparent',
    borderRadius: '1rem',
    color: '#93a0bb',
    background: 'rgba(255,255,255,0.015)',
    textDecoration: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  },

  activeNavigationLink: {
    borderColor: 'rgba(124,92,255,0.34)',
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(255,79,216,0.12), rgba(77,215,255,0.12))',
    boxShadow:
      '0 10px 24px rgba(124,92,255,0.16), 0 0 22px rgba(77,215,255,0.1)',
    transform: 'translateY(-1px)',
  },

  activeIndicator: {
    position: 'absolute',
    top: '0.32rem',
    width: '0.42rem',
    height: '0.25rem',
    borderRadius: '999px',
    background: 'transparent',
    transform: 'scaleX(0.4)',
    transition:
      'width 180ms ease, transform 180ms ease, background 180ms ease',
  },

  visibleActiveIndicator: {
    width: '1.35rem',
    background:
      'linear-gradient(90deg, #7c5cff, #ff4fd8 48%, #4dd7ff)',
    boxShadow: '0 0 14px rgba(77,215,255,0.55)',
    transform: 'scaleX(1)',
  },

  navigationIcon: {
    position: 'relative',
    width: '1.5rem',
    height: '1.5rem',
    display: 'grid',
    placeItems: 'center',
    color: 'inherit',
    filter: 'drop-shadow(0 0 8px rgba(124,92,255,0.08))',
  },

  badgeOverride: {
    top: '-0.4rem',
    right: '-0.58rem',
  },

  navigationLabel: {
    maxWidth: '100%',
    overflow: 'hidden',
    color: 'inherit',
    fontSize: '0.65rem',
    lineHeight: 1,
    fontWeight: 700,
    textAlign: 'center',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};