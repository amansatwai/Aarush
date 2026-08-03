import React, { useEffect, useMemo, useRef, useState } from "react";
import HomeFeed from "./pages/HomeFeed";
import SearchPage from "./pages/SearchPage";
import ReelsPage from "./pages/ReelsPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import ChatsPage from "./pages/ChatsPage";
import ChatScreen from "./pages/ChatScreen";
import BottomNav from "./components/BottomNav";
import AccountDrawer from "./components/AccountDrawer";
import GazeLockPanel from "./components/GazeLockPanel";
import OneTapLockPanel from "./components/OneTapLockPanel";
import UploadSheet from "./components/UploadSheet";
import "./App.css";

const HOME = "home";

export default function App() {
  const [route, setRoute] = useState(HOME);
  const [historyStack, setHistoryStack] = useState([HOME]);

  const [profile] = useState({
    username: "aarush",
    full_name: "Aarush",
    bio: "Premium social experience.",
    website: "aarush.app",
    avatar_url: "https://via.placeholder.com/240",
    is_verified: true,
    followers_count: 24800,
    following_count: 341,
    posts_count: 128,
  });

  const [currentUser] = useState({ id: 1 });
  const [dataSaverEnabled, setDataSaverEnabled] = useState(false);

  const [gazeLockEnabled, setGazeLockEnabled] = useState(false);
  const [oneTapLockEnabled, setOneTapLockEnabled] = useState(false);

  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatsOpen, setChatsOpen] = useState(false);

  const routeRef = useRef(route);
  const drawerRef = useRef(accountDrawerOpen);
  const uploadRef = useRef(uploadSheetOpen);
  const gazeRef = useRef(gazeLockEnabled);
  const oneTapRef = useRef(oneTapLockEnabled);

  useEffect(() => { routeRef.current = route; }, [route]);
  useEffect(() => { drawerRef.current = accountDrawerOpen; }, [accountDrawerOpen]);
  useEffect(() => { uploadRef.current = uploadSheetOpen; }, [uploadSheetOpen]);
  useEffect(() => { gazeRef.current = gazeLockEnabled; }, [gazeLockEnabled]);
  useEffect(() => { oneTapRef.current = oneTapLockEnabled; }, [oneTapLockEnabled]);

  function pushHistory(next) {
    if (next === routeRef.current) return;
    setHistoryStack((prev) => [...prev, routeRef.current]);
    setRoute(next);
    window.history.pushState({ route: next }, "", window.location.pathname);
  }

  function goBack() {
    if (accountDrawerOpen) return setAccountDrawerOpen(false);
    if (uploadSheetOpen) return setUploadSheetOpen(false);
    if (notificationsOpen) return setNotificationsOpen(false);
    if (chatsOpen) return setChatsOpen(false);
    if (gazeLockEnabled) return setGazeLockEnabled(false);
    if (oneTapLockEnabled) return setOneTapLockEnabled(false);

    setHistoryStack((prev) => {
      if (prev.length <= 1) {
        setRoute(HOME);
        return [HOME];
      }
      const nextStack = prev.slice(0, -1);
      const prevRoute = nextStack[nextStack.length - 1] || HOME;
      setRoute(prevRoute);
      return nextStack;
    });
  }

  useEffect(() => {
    const onPopState = () => {
      if (accountDrawerOpen) return setAccountDrawerOpen(false);
      if (uploadSheetOpen) return setUploadSheetOpen(false);
      if (notificationsOpen) return setNotificationsOpen(false);
      if (chatsOpen) return setChatsOpen(false);
      if (gazeLockEnabled) return setGazeLockEnabled(false);
      if (oneTapLockEnabled) return setOneTapLockEnabled(false);

      setHistoryStack((prev) => {
        if (prev.length <= 1) {
          setRoute(HOME);
          return [HOME];
        }
        const nextStack = prev.slice(0, -1);
        setRoute(nextStack[nextStack.length - 1] || HOME);
        return nextStack;
      });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [accountDrawerOpen, uploadSheetOpen, notificationsOpen, chatsOpen, gazeLockEnabled, oneTapLockEnabled]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") goBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [accountDrawerOpen, uploadSheetOpen, notificationsOpen, chatsOpen, gazeLockEnabled, oneTapLockEnabled]);

  const pageProps = useMemo(() => ({
    profile,
    currentUser,
    route,
    navigate: pushHistory,
    goBack,
    setAccountDrawerOpen,
    setUploadSheetOpen,
    setNotificationsOpen,
    setChatsOpen,
    dataSaverEnabled,
    setDataSaverEnabled,
  }), [profile, currentUser, route, dataSaverEnabled]);

  return (
    <div className={`app-shell ${gazeLockEnabled ? "gaze-blur" : ""} ${oneTapLockEnabled ? "one-tap-blur" : ""}`}>
      {route === "home" && <HomeFeed {...pageProps} />}
      {route === "search" && <SearchPage {...pageProps} />}
      {route === "reels" && <ReelsPage {...pageProps} />}
      {route === "profile" && <ProfilePage {...pageProps} />}
      {route === "notifications" && <NotificationsPage {...pageProps} />}
      {route === "chats" && <ChatsPage {...pageProps} />}
      {route === "chat" && <ChatScreen {...pageProps} />}

      <BottomNav
        activeTab={route}
        profile={profile}
        navigate={pushHistory}
        goBack={goBack}
        onOpenGazeLock={() => setGazeLockEnabled(true)}
        onOpenOneTapLock={() => setOneTapLockEnabled(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenChats={() => setChatsOpen(true)}
        onOpenAccountDrawer={() => setAccountDrawerOpen(true)}
        onOpenUploadSheet={() => setUploadSheetOpen(true)}
      />

      <GazeLockPanel
        open={gazeLockEnabled}
        onClose={() => setGazeLockEnabled(false)}
        onToggle={() => setGazeLockEnabled((v) => !v)}
      />

      <OneTapLockPanel
        open={oneTapLockEnabled}
        onClose={() => setOneTapLockEnabled(false)}
        onToggle={() => setOneTapLockEnabled((v) => !v)}
      />

      <AccountDrawer
        open={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
        profile={profile}
      />

      <UploadSheet
        open={uploadSheetOpen}
        onClose={() => setUploadSheetOpen(false)}
        onSelect={(type) => {
          setUploadSheetOpen(false);
          if (type === "post") pushHistory("upload-post");
          if (type === "story") pushHistory("upload-story");
          if (type === "reel") pushHistory("upload-reel");
        }}
      />
    </div>
  );
}