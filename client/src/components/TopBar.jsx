import React from "react";
import {
  Shield,
  LockKeyhole,
  Sparkles,
  Bell,
  MessageCircle,
  Eye,
} from "lucide-react";
import "./TopBar.css";

export default function TopBar({
  profile,
  onOpenGazeLock,
  onOpenOneTapLock,
  onOpenNotifications,
  onOpenChats,
  dataSaverEnabled,
  setDataSaverEnabled,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-pill" onClick={onOpenGazeLock} aria-label="Gaze Lock">
          <Eye size={16} />
          <span>Gaze Lock</span>
        </button>
        {profile?.is_verified && (
          <span className="verified-badge" title="Verified Account" aria-label="Verified Account">
            <Shield size={13} />
          </span>
        )}
      </div>

      <div className="topbar-center">
        <div className="brand">
          <span className="brand-dot" />
          <span>Aarush</span>
        </div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className={`topbar-icon tone-datasaver ${dataSaverEnabled ? "active" : ""}`}
          onClick={() => setDataSaverEnabled((v) => !v)}
          aria-label="Data Saver"
        >
          <Sparkles size={18} />
        </button>

        <button type="button" className="topbar-icon tone-notifications" onClick={onOpenNotifications} aria-label="Notifications">
          <Bell size={18} />
        </button>

        <button type="button" className="topbar-icon tone-lock" onClick={onOpenOneTapLock} aria-label="One Tap Lock">
          <LockKeyhole size={18} />
        </button>

        <button type="button" className="topbar-icon tone-messages" onClick={onOpenChats} aria-label="Messages">
          <MessageCircle size={18} />
        </button>
      </div>
    </header>
  );
}