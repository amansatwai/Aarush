import React, { useRef } from "react";
import { House, Search, PlusSquare, Clapperboard, User } from "lucide-react";
import "./BottomNav.css";

export default function BottomNav({
  activeTab,
  navigate,
  onOpenUploadSheet,
  onOpenAccountDrawer,
  onOpenGazeLock,
  onOpenOneTapLock,
}) {
  const pressTimer = useRef(null);

  const tabs = [
    { key: "home", label: "Home", Icon: House, route: "home" },
    { key: "search", label: "Search", Icon: Search, route: "search" },
    { key: "upload", label: "Upload", Icon: PlusSquare, special: true },
    { key: "reels", label: "Reels", Icon: Clapperboard, route: "reels" },
    { key: "profile", label: "Profile", Icon: User, route: "profile" },
  ];

  const bindLongPress = (e) => {
    e.preventDefault();
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => onOpenAccountDrawer?.(), 550);
  };

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {tabs.map(({ key, label, Icon, route, special }) => (
        <button
          key={key}
          type="button"
          className={`bottom-nav-item ${activeTab === key ? "active" : ""} ${special ? "upload-fab" : ""}`}
          onClick={() => {
            if (key === "upload") return onOpenUploadSheet?.();
            if (route) navigate(route);
          }}
          onMouseDown={key === "profile" ? bindLongPress : undefined}
          onTouchStart={key === "profile" ? bindLongPress : undefined}
          onMouseUp={key === "profile" ? () => clearTimeout(pressTimer.current) : undefined}
          onTouchEnd={key === "profile" ? () => clearTimeout(pressTimer.current) : undefined}
          onContextMenu={key === "profile" ? (e) => e.preventDefault() : undefined}
          aria-label={label}
        >
          <span className="bottom-nav-icon-wrap" aria-hidden="true">
            <Icon size={key === "upload" ? 28 : 24} strokeWidth={2.3} />
          </span>
          <span className="bottom-nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}