import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Share2,
  Settings,
  Grid3X3,
  Clapperboard,
  Tag,
  Bookmark,
  Shield,
  Link2,
  Camera,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import TopBar from "../components/TopBar";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import "./Profile.css";

function SimpleModal({ title, description, onClose }) {
  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <div>
            <div className="profile-modal-title">{title}</div>
            <div className="profile-modal-subtitle">{description}</div>
          </div>
          <button type="button" className="profile-modal-close" onClick={onClose} aria-label="Close">
            <ArrowLeft size={18} />
          </button>
        </div>
        <button type="button" className="profile-modal-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage({ goBack, profile, onOpenAccountDrawer, user, supabase, onAuthChange }) {
  const [tab, setTab] = useState("posts");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [actionModal, setActionModal] = useState(null);

  const stats = useMemo(
    () => [
      { label: "Posts", value: profile?.posts_count ?? 128 },
      { label: "Followers", value: profile?.followers_count ?? 24800 },
      { label: "Following", value: profile?.following_count ?? 341 },
    ],
    [profile]
  );

  const highlights = ["Add Highlight", "Travel", "Friends", "Work", "Memories", "Favorites"];

  const mediaItems = [
    { id: 1, type: "image", src: "https://via.placeholder.com/600?text=1" },
    { id: 2, type: "image", src: "https://via.placeholder.com/600?text=2" },
    { id: 3, type: "image", src: "https://via.placeholder.com/600?text=3" },
    { id: 4, type: "video", src: "https://via.placeholder.com/600?text=4" },
    { id: 5, type: "image", src: "https://via.placeholder.com/600?text=5" },
    { id: 6, type: "image", src: "https://via.placeholder.com/600?text=6" },
  ];

  return (
    <div className="profile-page">
      <TopBar
        showBack
        onBack={goBack}
        onOpenAccountDrawer={onOpenAccountDrawer}
        profile={profile}
      />

      <main className="profile-shell">
        <section className="profile-hero glass-panel">
          <div className="profile-top-row">
            <button type="button" className="profile-back-fab" onClick={goBack} aria-label="Back">
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              className="profile-settings-btn"
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="profile-avatar-wrap">
            <div className="profile-avatar-ring">
              <img
                className="profile-avatar"
                src={profile?.avatar_url || "https://via.placeholder.com/240"}
                alt="Profile"
              />
            </div>
            <button
              type="button"
              className="profile-camera-btn"
              onClick={() => setActionModal({
                title: "Change Profile Photo",
                description: "Upload or capture a new profile photo.",
              })}
              aria-label="Change profile photo"
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="profile-name-row">
            <h1 className="profile-username">
              {profile?.username || "guest"}
              {profile?.is_verified && (
                <span className="verified-badge" title="Verified Account" aria-label="Verified Account">
                  <Shield size={12} />
                </span>
              )}
            </h1>

            <button
              type="button"
              className="profile-id-chip"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings size={14} />
              Settings
            </button>
          </div>

          <div className="profile-fullname">{profile?.full_name || "Aarush Creator"}</div>
          <p className="profile-bio">{profile?.bio || "Building a futuristic premium social experience."}</p>

          <a
            className="profile-website"
            href={profile?.website || "#"}
            onClick={(e) => e.preventDefault()}
          >
            <Link2 size={14} />
            {profile?.website || "aarush.app"}
          </a>

          <div className="profile-stats">
            {stats.map((item) => (
              <div key={item.label} className="profile-stat">
                <div className="profile-stat-value">{item.value}</div>
                <div className="profile-stat-label">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className="profile-action primary"
              onClick={() => setActionModal({ title: "Edit Profile", description: "Edit username, bio, website, birthday, and more here." })}
            >
              Edit Profile
            </button>
            <button
              type="button"
              className="profile-action"
              onClick={() => setActionModal({ title: "Share Profile", description: "Share link, QR code, or send profile to friends." })}
            >
              <Share2 size={16} />
              Share Profile
            </button>
            <button type="button" className="profile-action" onClick={() => setSettingsOpen(true)}>
              <Settings size={16} />
              Settings
            </button>
          </div>
        </section>

        <section className="highlights-row glass-panel">
          {highlights.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`highlight-item ${index === 0 ? "add" : ""}`}
              onClick={() => setActionModal({ title: item, description: "Story highlights placeholder screen." })}
            >
              <div className="highlight-ring">
                {index === 0 ? <Plus size={18} /> : <span>{item.slice(0, 1)}</span>}
              </div>
              <span>{item}</span>
            </button>
          ))}
        </section>

        <section className="profile-tabs glass-panel">
          <button type="button" className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>
            <Grid3X3 size={18} />
            Posts
          </button>
          <button type="button" className={tab === "reels" ? "active" : ""} onClick={() => setTab("reels")}>
            <Clapperboard size={18} />
            Reels
          </button>
          <button type="button" className={tab === "tagged" ? "active" : ""} onClick={() => setTab("tagged")}>
            <Tag size={18} />
            Tagged
          </button>
          <button type="button" className={tab === "saved" ? "active" : ""} onClick={() => setTab("saved")}>
            <Bookmark size={18} />
            Saved
          </button>
        </section>

        <section className="profile-grid">
          {mediaItems.length === 0 ? (
            <div className="profile-empty glass-panel">
              <ImageIcon size={22} />
              <div>No posts yet</div>
            </div>
          ) : (
            mediaItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="profile-grid-item glass-panel"
                onClick={() => setActionModal({
                  title: item.type === "video" ? "Open Reel" : "Open Post",
                  description: "Media preview placeholder.",
                })}
              >
                <img src={item.src} alt={`Post ${item.id}`} />
                {item.type === "video" && <span className="media-tag">Reel</span>}
              </button>
            ))
          )}
        </section>
      </main>

      {settingsOpen && (
        <ProfileSettingsModal
          onClose={() => setSettingsOpen(false)}
          supabase={supabase}
          user={user}
          onAuthChange={onAuthChange}
        />
      )}

      {actionModal && (
        <SimpleModal
          title={actionModal.title}
          description={actionModal.description}
          onClose={() => setActionModal(null)}
        />
      )}
    </div>
  );
}