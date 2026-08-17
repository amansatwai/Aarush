import { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ShieldCheck, WifiOff } from 'lucide-react';
import { supabase } from './lib/supabase';

import HomeFeed from './pages/HomeFeed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Welcome from './pages/Welcome';
import Splash from './pages/Splash';

import ReelsPage from './pages/ReelsPage';
import SearchPage from './pages/SearchPage';
import UploadPage from './pages/UploadPage';
import ExplorePage from './pages/ExplorePage';
import DiscoverPeople from './pages/DiscoverPeople';

import StoryCamera from './pages/StoryCamera';
import StoryEditor from './pages/StoryEditor';

import ProfilePage from './pages/ProfilePage';
import ProfileSettings from './pages/ProfileSettings';

import FollowRequestsPage from './pages/FollowRequestsPage';
import FollowersPage from './pages/FollowersPage';
import FollowingPage from './pages/FollowingPage';
import BlockedUsersPage from './pages/BlockedUsersPage';
import CloseFriendsPage from './pages/CloseFriendsPage';
import SocialPrivacySettings from './pages/SocialPrivacySettings';

import NotificationsPage from './pages/NotificationsPage';
import NotificationCenter from './pages/NotificationCenter';
import NotificationPrivacy from './pages/NotificationPrivacy';
import NotificationSettings from './pages/NotificationSettings';

import ChatsPage from './pages/ChatsPage';
import ChatConversation from './pages/ChatConversation';

import PrivacyCenter from './pages/PrivacyCenter';
import PrivacyDashboard from './pages/PrivacyDashboard';
import PrivacyInnovations from './pages/PrivacyInnovations';
import EmergencyPrivacy from './pages/EmergencyPrivacy';
import ShoulderSurf from './pages/ShoulderSurf';
import StealthPrivacy from './pages/StealthPrivacy';
import PrivateSafeSettings from './pages/PrivateSafeSettings';
import SmartPrivacyCenter from './pages/SmartPrivacyCenter';

import SecurityCenter from './pages/SecurityCenter';
import SecuritySettings from './pages/SecuritySettings';
import AarushAISecurity from './pages/AarushAISecurity';
import AarushAI from './pages/AarushAI';
import AppLockSettings from './pages/AppLockSettings';
import CallPrivacyCenter from './pages/CallPrivacyCenter';
import CallPrivacy from './pages/CallPrivacy';
import SessionSecurityCenter from './pages/SessionSecurityCenter';
import ThreatCenter from './pages/ThreatCenter';
import ZeroTrustCenter from './pages/ZeroTrustCenter';
import EncryptionCenter from './pages/EncryptionCenter';
import DevicesCenter from './pages/DevicesCenter';

import MemoriesVault from './pages/MemoriesVault';
import Vault from './pages/Vault';

import CreatorAnalytics from './pages/CreatorAnalytics';
import CreatorProductionCenter from './pages/CreatorProductionCenter';
import CreatorStudioCenter from './pages/CreatorStudioCenter';
import MonetizationCenter from './pages/MonetizationCenter';
import PricingPlans from './pages/PricingPlans';
import PayoutSettings from './pages/PayoutSettings';

import AccountSwitchPage from './pages/AccountSwitchPage';
import SessionManagement from './pages/SessionManagement';
import LogoutSessionPage from './pages/LogoutSessionPage';

import ControlsPage from './pages/ControlsPage';
import HelpPage from './pages/HelpPage';

import AarushAISecurityPage from './pages/AarushAISecurity';
import AIAssistantCenter from './pages/AIAssistantCenter';
import AIGuardianCenter from './pages/AIGuardianCenter';
import AIPlatformCenter from './pages/AIPlatformCenter';
import BackupCenter from './pages/BackupCenter';
import BusinessPlatformCenter from './pages/BusinessPlatformCenter';
import DeveloperPlatformCenter from './pages/DeveloperPlatformCenter';
import EnterpriseAnalyticsCenter from './pages/EnterpriseAnalyticsCenter';
import EnterpriseIdentityCenter from './pages/EnterpriseIdentityCenter';
import EnterprisePlatformCenter from './pages/EnterprisePlatformCenter';
import GlobalMediaCenter from './pages/GlobalMediaCenter';
import GlobalScalingCenter from './pages/GlobalScalingCenter';
import IntegrationCenter from './pages/IntegrationCenter';
import LiveStreamingCenter from './pages/LiveStreamingCenter';
import MarketplaceCenter from './pages/MarketplaceCenter';
import MediaPerformanceCenter from './pages/MediaPerformanceCenter';
import OfflineCenter from './pages/OfflineCenter';
import OrdersCenter from './pages/OrdersCenter';
import PaymentsCenter from './pages/PaymentsCenter';
import PersonalizationSettingsPage from './pages/PersonalizationSettingsPage';
import PersonalizedFeedPage from './pages/PersonalizedFeedPage';
import ReliabilityCenter from './pages/ReliabilityCenter';
import VideoInfrastructureCenter from './pages/VideoInfrastructureCenter';
import VoiceAssistantCenter from './pages/VoiceAssistantCenter';

const LOCK_STORAGE_KEY = 'aarush_app_locked';

function safeGetStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Optional persistence only.
  }
}

function safeRemoveStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Optional persistence only.
  }
}

function getInitialLockState() {
  return safeGetStorage(LOCK_STORAGE_KEY) === 'true';
}

function LoadingScreen() {
  return (
    <main style={styles.loadingPage}>
      <div style={styles.loadingOrb}>
        <ShieldCheck size={36} />
      </div>
      <h1>Preparing Aarush</h1>
      <p>Restoring your secure session…</p>
      <span style={styles.loadingDot} />
    </main>
  );
}

function OfflineNotice({ online }) {
  if (online) return null;

  return (
    <div role="status" style={styles.offlineNotice}>
      <WifiOff size={14} />
      You are offline. Aarush will reconnect automatically.
    </div>
  );
}

function RouteShell({ online }) {
  return (
    <>
      <OfflineNotice online={online} />
      <Outlet />
    </>
  );
}

function PublicOnlyRoute({ session }) {
  const location = useLocation();

  if (session) {
    return (
      <Navigate
        to="/home"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

function ProtectedRoute({ session, locked }) {
  const location = useLocation();

  if (!session) {
    return (
      <Navigate
        to="/welcome"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (locked && location.pathname !== '/lock') {
    return (
      <Navigate
        to="/lock"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

function LockRoute({ session, locked, onUnlock }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!session) {
    return <Navigate to="/welcome" replace />;
  }

  if (!locked) {
    return (
      <Navigate
        to={location.state?.from || '/home'}
        replace
      />
    );
  }

  return (
    <Lock
      onUnlock={() => {
        onUnlock();
        navigate(location.state?.from || '/home', {
          replace: true,
        });
      }}
    />
  );
}

function FallbackRoute({ session, locked }) {
  if (!session) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <Navigate
      to={locked ? '/lock' : '/home'}
      replace
    />
  );
}

function AppRoutes({
  session,
  locked,
  online,
  onUnlock,
}) {
  return (
    <Routes>
      <Route element={<RouteShell online={online} />}>
        <Route element={<PublicOnlyRoute session={session} />}>
          <Route path="/splash" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
        </Route>

        <Route
          path="/lock"
          element={
            <LockRoute
              session={session}
              locked={locked}
              onUnlock={onUnlock}
            />
          }
        />

        <Route
          element={
            <ProtectedRoute
              session={session}
              locked={locked}
            />
          }
        >
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/home" element={<HomeFeed />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route
            path="/discover-people"
            element={<DiscoverPeople />}
          />
          <Route path="/controls" element={<ControlsPage />} />
          <Route path="/help" element={<HelpPage />} />

          <Route path="/story-camera" element={<StoryCamera />} />
          <Route path="/story-editor" element={<StoryEditor />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/profile-settings"
            element={<ProfileSettings />}
          />

          <Route
            path="/follow-requests"
            element={<FollowRequestsPage />}
          />
          <Route
            path="/followers/:userId"
            element={<FollowersPage />}
          />
          <Route
            path="/following/:userId"
            element={<FollowingPage />}
          />
          <Route
            path="/blocked-users"
            element={<BlockedUsersPage />}
          />
          <Route
            path="/close-friends"
            element={<CloseFriendsPage />}
          />
          <Route
            path="/social-privacy-settings"
            element={<SocialPrivacySettings />}
          />

          <Route
            path="/notifications"
            element={<NotificationsPage />}
          />
          <Route
            path="/notification-center"
            element={<NotificationCenter />}
          />
          <Route
            path="/notification-privacy"
            element={<NotificationPrivacy />}
          />
          <Route
            path="/notification-settings"
            element={<NotificationSettings />}
          />

          <Route path="/chats" element={<ChatsPage />} />
          <Route
            path="/chat/:conversationId"
            element={<ChatConversation />}
          />
          <Route
            path="/chats/:conversationId"
            element={<ChatConversation />}
          />

          <Route path="/privacy" element={<PrivacyCenter />} />
          <Route
            path="/privacy-center"
            element={<PrivacyCenter />}
          />
          <Route
            path="/privacy-dashboard"
            element={<PrivacyDashboard />}
          />
          <Route
            path="/privacy-innovations"
            element={<PrivacyInnovations />}
          />
          <Route
            path="/emergency-privacy"
            element={<EmergencyPrivacy />}
          />
          <Route
            path="/shoulder-surf"
            element={<ShoulderSurf />}
          />
          <Route
            path="/stealth-privacy"
            element={<StealthPrivacy />}
          />
          <Route
            path="/private-safe-settings"
            element={<PrivateSafeSettings />}
          />
          <Route
            path="/smart-privacy"
            element={<SmartPrivacyCenter />}
          />

          <Route
            path="/security-center"
            element={<SecurityCenter />}
          />
          <Route
            path="/security-settings"
            element={<SecuritySettings />}
          />
          <Route
            path="/aarush-ai-security"
            element={<AarushAISecurity />}
          />
          <Route path="/aarush-ai" element={<AarushAI />} />
          <Route
            path="/app-lock-settings"
            element={<AppLockSettings />}
          />
          <Route path="/app-lock" element={<Lock />} />
          <Route
            path="/call-privacy-center"
            element={<CallPrivacyCenter />}
          />
          <Route
            path="/call-privacy"
            element={<CallPrivacy />}
          />
          <Route
            path="/session-security"
            element={<SessionSecurityCenter />}
          />
          <Route
            path="/threat-center"
            element={<ThreatCenter />}
          />
          <Route
            path="/zero-trust"
            element={<ZeroTrustCenter />}
          />
          <Route
            path="/encryption-center"
            element={<EncryptionCenter />}
          />
          <Route
            path="/devices-center"
            element={<DevicesCenter />}
          />

          <Route
            path="/memories-vault"
            element={<MemoriesVault />}
          />
          <Route path="/vault" element={<Vault />} />

          <Route
            path="/creator-analytics"
            element={<CreatorAnalytics />}
          />
          <Route
            path="/creator-production"
            element={<CreatorProductionCenter />}
          />
          <Route
            path="/creator-studio"
            element={<CreatorStudioCenter />}
          />
          <Route
            path="/monetization-center"
            element={<MonetizationCenter />}
          />
          <Route
            path="/pricing-plans"
            element={<PricingPlans />}
          />
          <Route
            path="/payout-settings"
            element={<PayoutSettings />}
          />

          <Route
            path="/account-switch"
            element={<AccountSwitchPage />}
          />
          <Route
            path="/session-management"
            element={<SessionManagement />}
          />
          <Route
            path="/logout"
            element={<LogoutSessionPage />}
          />

          <Route
            path="/ai-assistant"
            element={<AIAssistantCenter />}
          />
          <Route
            path="/ai-guardian"
            element={<AIGuardianCenter />}
          />
          <Route
            path="/ai-platform"
            element={<AIPlatformCenter />}
          />
          <Route
            path="/voice-assistant"
            element={<VoiceAssistantCenter />}
          />

          <Route
            path="/backup-center"
            element={<BackupCenter />}
          />
          <Route
            path="/business-platform"
            element={<BusinessPlatformCenter />}
          />
          <Route
            path="/developer-platform"
            element={<DeveloperPlatformCenter />}
          />
          <Route
            path="/enterprise-analytics"
            element={<EnterpriseAnalyticsCenter />}
          />
          <Route
            path="/enterprise-identity"
            element={<EnterpriseIdentityCenter />}
          />
          <Route
            path="/enterprise-platform"
            element={<EnterprisePlatformCenter />}
          />
          <Route
            path="/global-media"
            element={<GlobalMediaCenter />}
          />
          <Route
            path="/global-scaling"
            element={<GlobalScalingCenter />}
          />
          <Route
            path="/integration-center"
            element={<IntegrationCenter />}
          />
          <Route
            path="/live-streaming"
            element={<LiveStreamingCenter />}
          />
          <Route
            path="/marketplace"
            element={<MarketplaceCenter />}
          />
          <Route
            path="/media-performance"
            element={<MediaPerformanceCenter />}
          />
          <Route
            path="/offline-center"
            element={<OfflineCenter />}
          />
          <Route
            path="/orders"
            element={<OrdersCenter />}
          />
          <Route
            path="/payments"
            element={<PaymentsCenter />}
          />
          <Route
            path="/personalization-settings"
            element={<PersonalizationSettingsPage />}
          />
          <Route
            path="/personalized-feed"
            element={<PersonalizedFeedPage />}
          />
          <Route
            path="/reliability-center"
            element={<ReliabilityCenter />}
          />
          <Route
            path="/video-infrastructure"
            element={<VideoInfrastructureCenter />}
          />
        </Route>

        <Route
          path="*"
          element={
            <FallbackRoute
              session={session}
              locked={locked}
            />
          }
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [locked, setLocked] = useState(getInitialLockState);
  const [online, setOnline] = useState(
    typeof navigator === 'undefined'
      ? true
      : navigator.onLine
  );

  const unlock = useCallback(() => {
    setLocked(false);
    safeSetStorage(LOCK_STORAGE_KEY, 'false');
  }, []);

  useEffect(() => {
    let mounted = true;
    let subscription = null;

    const restoreSession = async () => {
      try {
        const result = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(result.data?.session || null);
      } catch {
        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setAuthReady(true);
        }
      }
    };

    restoreSession();

    try {
      const result = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!mounted) return;

          setSession(nextSession || null);

          if (!nextSession) {
            setLocked(false);
            safeRemoveStorage(LOCK_STORAGE_KEY);
          }
        }
      );

      subscription = result.data?.subscription || null;
    } catch {
      subscription = null;
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (data?.session) {
            setSession(data.session);
          }
        })
        .catch(() => {
          // Best-effort foreground refresh.
        });
    };

    const handleFocus = () => {
      handleVisibilityChange();
    };

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== LOCK_STORAGE_KEY) return;
      setLocked(event.newValue === 'true');
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (!authReady) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppRoutes
          session={session}
          locked={Boolean(session && locked)}
          online={online}
          onUnlock={unlock}
        />
      </NotificationProvider>
    </BrowserRouter>
  );
}

const styles = {
  loadingPage: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.65rem',
    color: '#111827',
    background:
      'radial-gradient(circle at top,#ffffff,#f1f4f9 70%)',
    textAlign: 'center',
  },

  loadingOrb: {
    width: '5.5rem',
    height: '5.5rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(124,92,255,.28)',
    borderRadius: '1.4rem',
    color: '#7c5cff',
    background:
      'linear-gradient(135deg,#ffffff,#f3f0ff)',
    boxShadow:
      '0 18px 40px rgba(124,92,255,.16)',
  },

  loadingPageH1: {
    margin: 0,
    fontSize: '1rem',
  },

  loadingPageP: {
    margin: 0,
    color: '#64748b',
    fontSize: '.68rem',
  },

  loadingDot: {
    width: '.55rem',
    height: '.55rem',
    borderRadius: '999px',
    background: '#7c5cff',
    boxShadow: '0 0 18px rgba(124,92,255,.55)',
  },

  offlineNotice: {
    position: 'fixed',
    right: '.7rem',
    bottom: '.7rem',
    left: '.7rem',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    minHeight: '2.5rem',
    padding: '0 .65rem',
    border: '1px solid rgba(217,119,6,.22)',
    borderRadius: '.7rem',
    color: '#92400e',
    background: 'rgba(255,247,237,.96)',
    boxShadow: '0 10px 30px rgba(15,23,42,.12)',
    fontSize: '.61rem',
  },
};