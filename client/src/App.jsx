import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';

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

function ProtectedRoute({
  session,
  locked,
  children,
  allowWhileLocked = false,
}) {
  if (!session) {
    return <Navigate to="/welcome" replace />;
  }

  if (locked && !allowWhileLocked) {
    return <Navigate to="/lock" replace />;
  }

  return children;
}

function PublicOnlyRoute({ session, children }) {
  if (session) {
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
            boxShadow: '0 0 34px rgba(124,92,255,0.3)',
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
          style={{
            width: '100%',
            border: 0,
            borderRadius: '999px',
            padding: '0.85rem 1rem',
            background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
            color: '#fff',
            fontSize: '0.86rem',
            fontWeight: 850,
            cursor: 'pointer',
            boxShadow: '0 12px 26px rgba(124,92,255,0.2)',
          }}
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
  return (
    <Routes>
      <Route
        path="/"
        element={
          session ? (
            locked ? (
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

      <Route
        path="/home"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<HomeFeed />}
          />
        }
      />

      <Route
        path="/reels"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<ReelsPage />}
          />
        }
      />

      <Route
        path="/search"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<SearchPage />}
          />
        }
      />

      <Route
        path="/upload"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<UploadPage />}
          />
        }
      />

      <Route
        path="/profile"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<ProfilePage />}
          />
        }
      />

      <Route
        path="/profile-settings"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<ProfileSettings />}
          />
        }
      />

      <Route
        path="/profile/time-limited"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<ProfileSettings />}
          />
        }
      />

      <Route
        path="/time-limited-profile"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<ProfileSettings />}
          />
        }
      />

      <Route
        path="/profile/screen-recording"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<SecurityCenter />}
          />
        }
      />

      <Route
        path="/screen-recording"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<SecurityCenter />}
          />
        }
      />

      <Route
        path="/profile/screenshot-shield"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<SecurityCenter />}
          />
        }
      />

      <Route
        path="/screenshot-shield"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<SecurityCenter />}
          />
        }
      />

      <Route
        path="/profile/decoy-vault"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<PrivateSafeSettings />}
          />
        }
      />

      <Route
        path="/decoy-vault"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<PrivateSafeSettings />}
          />
        }
      />

      <Route
        path="/creator-analytics"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<CreatorAnalytics />}
          />
        }
      />

      <Route
        path="/accessibility-settings"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<AccessibilitySettings />}
          />
        }
      />

      <Route
        path="/accessibility"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<AccessibilitySettings />}
          />
        }
      />

      <Route
        path="/language-settings"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<LanguageSettings />}
          />
        }
      />

      <Route
        path="/language"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<LanguageSettings />}
          />
        }
      />

      <Route
        path="/notifications"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<NotificationsPage />}
          />
        }
      />

      <Route
        path="/notification-center"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<NotificationCenter />}
          />
        }
      />

      <Route
        path="/notification-privacy"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<NotificationPrivacy />}
          />
        }
      />

      <Route
        path="/notification-settings"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<NotificationPrivacy />}
          />
        }
      />

      <Route
        path="/chats"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<ChatsPage />}
          />
        }
      />

      <Route
        path="/chats/:chatId"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<ChatConversation />}
          />
        }
      />

      <Route
        path="/privacy"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<PrivacyCenter />}
          />
        }
      />

      <Route
        path="/privacy-center"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<PrivacyCenter />}
          />
        }
      />

      <Route
        path="/privacy-dashboard"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<PrivacyDashboard />}
          />
        }
      />

      <Route
        path="/privacy-innovations"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<PrivacyInnovations />}
          />
        }
      />

      <Route
        path="/emergency-privacy"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<EmergencyPrivacy />}
          />
        }
      />

      <Route
        path="/shoulder-surf"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<ShoulderSurf />}
          />
        }
      />

      <Route
        path="/stealth-privacy"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<StealthPrivacy />}
          />
        }
      />

      <Route
        path="/private-safe-settings"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<PrivateSafeSettings />}
          />
        }
      />

      <Route
        path="/security-center"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<SecurityCenter />}
          />
        }
      />

      <Route
        path="/security-settings"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<SecurityCenter />}
          />
        }
      />

      <Route
        path="/app-lock-settings"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<AppLockSettings />}
          />
        }
      />

      <Route
        path="/app-lock"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<AppLockSettings />}
          />
        }
      />

      <Route
        path="/call-privacy-center"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<CallPrivacyCenter />}
          />
        }
      />

      <Route
        path="/call-privacy"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<CallPrivacyCenter />}
          />
        }
      />

      <Route
        path="/aarush-ai-security"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<AarushAISecurity />}
          />
        }
      />

      <Route
        path="/aarush-ai"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<AarushAISecurity />}
          />
        }
      />

      <Route
        path="/memories-vault"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<MemoriesVault />}
          />
        }
      />

      <Route
        path="/vault"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<MemoriesVault />}
          />
        }
      />

      <Route
        path="/monetization-center"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<MonetizationCenter />}
          />
        }
      />

      <Route
        path="/pricing-plans"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<PricingPlans />}
          />
        }
      />

      <Route
        path="/payout-settings"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<PayoutSettings />}
          />
        }
      />

      <Route
        path="/account-switch"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<AccountSwitchPage />}
          />
        }
      />

      <Route
        path="/session-management"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<LogoutSessionPage />}
          />
        }
      />

      <Route
        path="/logout"
        element={
          <RouteElement
            session={session}
            locked={locked}
            component={<LogoutSessionPage />}
          />
        }
      />

      <Route
        path="/lock"
        element={
          <RouteElement
            session={session}
            locked={locked}
            allowWhileLocked
            component={<LockPage onUnlock={onUnlock} />}
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={session ? (locked ? '/lock' : '/home') : '/welcome'}
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
        const { data, error } =
          await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        setSession(error ? null : data.session || null);
        setLocked(
          localStorage.getItem(ONE_TAP_LOCK_KEY) === 'true'
        );
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