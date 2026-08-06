import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Clapperboard,
  Home,
  PlusSquare,
  Search,
  UserRound,
} from 'lucide-react';

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

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

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
        padding: '0.55rem 0.75rem calc(0.65rem + env(safe-area-inset-bottom))',
        background:
          'linear-gradient(180deg, rgba(8,11,18,0.58) 0%, rgba(8,11,18,0.92) 22%, rgba(8,11,18,0.98) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1.25rem 1.25rem 0 0',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.28)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
      }}
    >
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

          return (
            <NavLink
              key={to}
              to={to}
              onClick={(event) => handleNavigation(event, to)}
              className={active ? 'bottom-nav-link active' : 'bottom-nav-link'}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
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