import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Lock, ShieldCheck, UserRound } from 'lucide-react';
import ControlsPage from './pages/ControlsPage';
import HelpPage from './pages/HelpPage';
import Splash from './pages/Splash';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

import HomeFeed from './pages/HomeFeed';
import ReelsPage from './pages/ReelsPage';
import SearchPage from './pages/SearchPage';
import UploadPage from './pages/UploadPage';

import ProfilePage from './pages/ProfilePage';
import ProfileSettings from './pages/ProfileSettings';
import AccessibilitySettings from './pages/AccessibilitySettings';
import LanguageSettings from './pages/LanguageSettings';
import CreatorAnalytics from './pages/CreatorAnalytics';

import NotificationsPage from './pages/NotificationsPage';
import NotificationCenter from './pages/NotificationCenter';
import NotificationPrivacy from './pages/NotificationPrivacy';

import ChatsPage from './pages/ChatsPage';
import ChatConversation from './pages/ChatConversation';

import PrivacyCenter from './pages/PrivacyCenter';
import PrivacyDashboard from './pages/PrivacyDashboard';
import PrivacyInnovations from './pages/PrivacyInnovations';
import EmergencyPrivacy from './pages/EmergencyPrivacy';
import ShoulderSurf from './pages/ShoulderSurf';
import StealthPrivacy from './pages/StealthPrivacy';
import PrivateSafeSettings from './pages/PrivateSafeSettings';

import SecurityCenter from './pages/SecurityCenter';
import AarushAISecurity from './pages/AarushAISecurity';
import AppLockSettings from './pages/AppLockSettings';
import CallPrivacyCenter from './pages/CallPrivacyCenter';

import MemoriesVault from './pages/MemoriesVault';

import MonetizationCenter from './pages/MonetizationCenter';
import PricingPlans from './pages/PricingPlans';
import PayoutSettings from './pages/PayoutSettings';

import AccountSwitchPage from './pages/AccountSwitchPage';
import LogoutSessionPage from './pages/LogoutSessionPage';

import { supabase } from './lib/supabase';
import './App.css';

const ONE_TAP_LOCK_KEY = 'aarush_one_tap_lock_enabled';
const GAZE_LOCK_KEY = 'aarush_gaze_lock_enabled';

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
  guestProfile: 'aarush_guest_profile',
};

const GUEST_RESTRICTED_ROUTES = [
  '/upload',
  '/chats',
  '/privacy',
  '/privacy-center',
  '/privacy-dashboard',
  '/privacy-innovations',
  '/emergency-privacy',
  '/shoulder-surf',
  '/stealth-privacy',
  '/private-safe-settings',
  '/security-center',
  '/security-settings',
  '/app-lock-settings',
  '/app-lock',
  '/call-privacy-center',
  '/aarush-ai-security',
  '/memories-vault',
  '/workspace',
  '/monetization-center',
  '/pricing-plans',
  '/payout-settings',
  '/account-switch',
  '/session-management',
  '/logout',
  '/profile-settings',
  '/profile/settings',
  '/profile/privacy',
  '/profile/security',
  '/profile/controls',
  '/profile/notifications',
  '/profile/chats',
  '/profile/time-limited',
  '/time-limited-profile',
  '/profile/screen-recording',
  '/screen-recording',
  '/profile/screenshot-shield',
  '/screenshot-shield',
  '/profile/decoy-vault',
  '/decoy-vault',
];

function isGuestSessionActive() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem(GUEST_KEYS.isGuest) === 'true' &&
    window.localStorage.getItem(GUEST_KEYS.guestSession) === 'active'
  );
}

function clearGuestSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(GUEST_KEYS.isGuest);
  window.localStorage.removeItem(GUEST_KEYS.guestSession);
  window.localStorage.removeItem(GUEST_KEYS.guestProfile);
}

function isRestrictedGuestRoute(pathname) {
  return GUEST_RESTRICTED_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.52) 0%, rgba(10,13,20,1) 42%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <div
        style={{
          width: 'min(100%, 380px)',
          padding: '1.5rem',
          borderRadius: '1.5rem',
          background: 'rgba(15,19,30,0.92)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.38)',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            width: '4rem',
            height: '4rem',
            margin: '0 auto 1rem',
            borderRadius: '1.25rem',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
            color: '#fff',
            boxShadow: '0 0 32px rgba(124,92,255,0.28)',
            animation: 'aarush-loading-pulse 1.5s ease-in-out infinite',
          }}
        >
          <ShieldCheck size={28} />
        </div>

        <strong style={{ display: 'block', fontSize: '1.06rem' }}>
          Preparing Aarush
        </strong>

        <span
          style={{
            display: 'block',
            marginTop: '0.35rem',
            color: '#96a3bf',
            fontSize: '0.82rem',
          }}
        >
          Restoring your secure session…
        </span>
      </div>

      <style>{`
        @keyframes aarush-loading-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.82;
          }

          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function GuestAccessRequired() {
  const navigate = useNavigate();

  const logoutGuest = () => {
    clearGuestSession();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.52) 0%, rgba(10,13,20,1) 42%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <main
        style={{
          width: 'min(100%, 430px)',
          padding: '1.5rem',
          borderRadius: '1.5rem',
          background: 'rgba(15,19,30,0.94)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.42)',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            width: '4rem',
            height: '4rem',
            margin: '0 auto 1rem',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '999px',
            background:
              'linear-gradient(135deg, #7c5cff, #4dd7ff)',
            color: '#fff',
          }}
        >
          <UserRound size={26} />
        </div>

        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>
          Sign in to continue
        </h1>

        <p
          style={{
            margin: '0.65rem 0 1.25rem',
            color: '#9aa7c1',
            fontSize: '0.84rem',
            lineHeight: 1.55,
          }}
        >
          Create an Aarush account to use this feature.
        </p>

        <div style={{ display: 'grid', gap: '0.55rem' }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={guestStyles.primary}
          >
            Log In
          </button>

          <button
            type="button"
            onClick={() => navigate('/signup')}
            style={guestStyles.secondary}
          >
            Create Account
          </button>

          <button
            type="button"
            onClick={() => navigate('/home')}
            style={guestStyles.secondary}
          >
            Continue Browsing
          </button>

          <button
            type="button"
            onClick={logoutGuest}
            style={guestStyles.danger}
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}

function ProtectedRoute({
  session,
  locked,
  children,
  allowWhileLocked = false,
}) {
  const location = useLocation();
  const guest = isGuestSessionActive();

  if (!session && !guest) {
    return <Navigate to="/welcome" replace />;
  }

  if (guest && isRestrictedGuestRoute(location.pathname)) {
    return <GuestAccessRequired />;
  }

  if (locked && !allowWhileLocked && !guest) {
    return <Navigate to="/lock" replace />;
  }

  return children;
}

function PublicOnlyRoute({ session, children }) {
  if (session || isGuestSessionActive()) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function LockPage({ onUnlock }) {
  const handleUnlock = () => {
    localStorage.setItem(ONE_TAP_LOCK_KEY, 'false');
    onUnlock();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.52) 0%, rgba(10,13,20,1) 42%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <main
        style={{
          width: 'min(100%, 420px)',
          padding: '1.5rem',
          borderRadius: '1.5rem',
          background: 'rgba(15,19,30,0.92)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.42)',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            width: '4.5rem',
            height: '4.5rem',
            margin: '0 auto 1rem',
            borderRadius: '999px',
            display: 'grid',
            placeItems: 'center',
            background:
              'linear-gradient(135deg, #7c5cff, #ff4fd8 48%, #4dd7ff)',
            color: '#fff',
          }}
        >
          <Lock size={28} />
        </div>

        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>
          Aarush is locked
        </h1>

        <p
          style={{
            margin: '0.6rem 0 1.25rem',
            color: '#9aa7c1',
            fontSize: '0.86rem',
            lineHeight: 1.55,
          }}
        >
          Unlock Aarush to continue to your protected session.
        </p>

        <button
          type="button"
          onClick={handleUnlock}
          style={guestStyles.primary}
        >
          Unlock Aarush
        </button>
      </main>
    </div>
  );
}

function RouteElement({
  session,
  locked,
  component,
  allowWhileLocked = false,
}) {
  return (
    <ProtectedRoute
      session={session}
      locked={locked}
      allowWhileLocked={allowWhileLocked}
    >
      {component}
    </ProtectedRoute>
  );
}

function AppRoutes({ session, locked, onUnlock }) {
  const protectedRoute = (
    path,
    component,
    options = {}
  ) => (
    <Route
      key={path}
      path={path}
      element={
        <RouteElement
          session={session}
          locked={locked}
          component={component}
          allowWhileLocked={options.allowWhileLocked}
        />
      }
    />
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          session || isGuestSessionActive() ? (
            locked && !isGuestSessionActive() ? (
              <Navigate to="/lock" replace />
            ) : (
              <Navigate to="/home" replace />
            )
          ) : (
            <Navigate to="/welcome" replace />
          )
        }
      />
<Route
  path="/controls"
  element={
    <RouteElement
      session={session}
      locked={locked}
      component={<ControlsPage />}
    />
  }
/>

<Route
  path="/help"
  element={
    <RouteElement
      session={session}
      locked={locked}
      component={<HelpPage />}
    />
  }
/>
      <Route
        path="/splash"
        element={
          <PublicOnlyRoute session={session}>
            <Splash />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/welcome"
        element={
          <PublicOnlyRoute session={session}>
            <Welcome />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute session={session}>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicOnlyRoute session={session}>
            <Signup />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute session={session}>
            <ForgotPassword />
          </PublicOnlyRoute>
        }
      />

      {protectedRoute('/home', <HomeFeed />)}
      {protectedRoute('/reels', <ReelsPage />)}
      {protectedRoute('/search', <SearchPage />)}
      {protectedRoute('/upload', <UploadPage />)}

      {protectedRoute('/profile', <ProfilePage />)}
      {protectedRoute('/profile-settings', <ProfileSettings />)}
      {protectedRoute('/profile/time-limited', <ProfileSettings />)}
      {protectedRoute('/time-limited-profile', <ProfileSettings />)}
      {protectedRoute('/creator-analytics', <CreatorAnalytics />)}
      {protectedRoute('/accessibility-settings', <AccessibilitySettings />)}
      {protectedRoute('/accessibility', <AccessibilitySettings />)}
      {protectedRoute('/language-settings', <LanguageSettings />)}
      {protectedRoute('/language', <LanguageSettings />)}

      {protectedRoute('/notifications', <NotificationsPage />)}
      {protectedRoute('/notification-center', <NotificationCenter />)}
      {protectedRoute('/notification-privacy', <NotificationPrivacy />)}
      {protectedRoute('/notification-settings', <NotificationPrivacy />)}

      {protectedRoute('/chats', <ChatsPage />)}
      {protectedRoute('/chats/:chatId', <ChatConversation />)}

      {protectedRoute('/privacy', <PrivacyCenter />)}
      {protectedRoute('/privacy-center', <PrivacyCenter />)}
      {protectedRoute('/privacy-dashboard', <PrivacyDashboard />)}
      {protectedRoute('/privacy-innovations', <PrivacyInnovations />)}
      {protectedRoute('/emergency-privacy', <EmergencyPrivacy />)}
      {protectedRoute('/shoulder-surf', <ShoulderSurf />)}
      {protectedRoute('/stealth-privacy', <StealthPrivacy />)}
      {protectedRoute('/private-safe-settings', <PrivateSafeSettings />)}
      {protectedRoute('/decoy-vault', <PrivateSafeSettings />)}
      {protectedRoute('/profile/decoy-vault', <PrivateSafeSettings />)}

      {protectedRoute('/security-center', <SecurityCenter />)}
      {protectedRoute('/security-settings', <SecurityCenter />)}
      {protectedRoute('/profile/screen-recording', <SecurityCenter />)}
      {protectedRoute('/screen-recording', <SecurityCenter />)}
      {protectedRoute('/profile/screenshot-shield', <SecurityCenter />)}
      {protectedRoute('/screenshot-shield', <SecurityCenter />)}

      {protectedRoute('/app-lock-settings', <AppLockSettings />)}
      {protectedRoute('/app-lock', <AppLockSettings />)}
      {protectedRoute('/call-privacy-center', <CallPrivacyCenter />)}
      {protectedRoute('/call-privacy', <CallPrivacyCenter />)}
      {protectedRoute('/aarush-ai-security', <AarushAISecurity />)}
      {protectedRoute('/aarush-ai', <AarushAISecurity />)}
      {protectedRoute('/memories-vault', <MemoriesVault />)}
      {protectedRoute('/vault', <MemoriesVault />)}

      {protectedRoute('/monetization-center', <MonetizationCenter />)}
      {protectedRoute('/pricing-plans', <PricingPlans />)}
      {protectedRoute('/payout-settings', <PayoutSettings />)}

      {protectedRoute('/account-switch', <AccountSwitchPage />)}
      {protectedRoute('/session-management', <LogoutSessionPage />)}
      {protectedRoute('/logout', <LogoutSessionPage />)}

      {protectedRoute(
        '/lock',
        <LockPage onUnlock={onUnlock} />,
        { allowWhileLocked: true }
      )}

      <Route
        path="*"
        element={
          <Navigate
            to={
              session || isGuestSessionActive()
                ? locked && !isGuestSessionActive()
                  ? '/lock'
                  : '/home'
                : '/welcome'
            }
            replace
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const guest = isGuestSessionActive();
        const { data, error } =
          await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (guest) {
          setSession(null);
          setLocked(false);
        } else {
          setSession(error ? null : data.session || null);
          setLocked(
            localStorage.getItem(ONE_TAP_LOCK_KEY) === 'true'
          );
        }
      } catch {
        if (mounted) {
          setSession(null);
          setLocked(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) {
          return;
        }

        if (isGuestSessionActive()) {
          setSession(null);
          setLocked(false);
          return;
        }

        setSession(nextSession || null);

        if (!nextSession) {
          setLocked(false);
          localStorage.setItem(
            ONE_TAP_LOCK_KEY,
            'false'
          );
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(GAZE_LOCK_KEY)) {
      localStorage.setItem(GAZE_LOCK_KEY, 'true');
    }

    if (!localStorage.getItem(ONE_TAP_LOCK_KEY)) {
      localStorage.setItem(ONE_TAP_LOCK_KEY, 'false');
    }
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <AppRoutes
        session={session}
        locked={locked}
        onUnlock={() => {
          setLocked(false);
          localStorage.setItem(
            ONE_TAP_LOCK_KEY,
            'false'
          );
        }}
      />
    </BrowserRouter>
  );
}

const guestStyles = {
  primary: {
    width: '100%',
    minHeight: '2.75rem',
    border: 0,
    borderRadius: '999px',
    padding: '0.75rem 1rem',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
    fontSize: '0.82rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  secondary: {
    width: '100%',
    minHeight: '2.75rem',
    border: '1px solid rgba(124,92,255,0.3)',
    borderRadius: '999px',
    padding: '0.75rem 1rem',
    background: 'rgba(124,92,255,0.12)',
    color: '#eaf0ff',
    fontSize: '0.82rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  danger: {
    width: '100%',
    minHeight: '2.75rem',
    border: '1px solid rgba(255,79,122,0.22)',
    borderRadius: '999px',
    padding: '0.75rem 1rem',
    background: 'rgba(255,79,122,0.08)',
    color: '#ffb1c8',
    fontSize: '0.82rem',
    fontWeight: 800,
    cursor: 'pointer',
  },
};