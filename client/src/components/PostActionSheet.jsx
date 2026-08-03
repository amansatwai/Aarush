import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Link2,
  Share2,
  Bookmark,
  EyeOff,
  VolumeX,
  Flag,
  Ban,
  Download,
  Pencil,
  Trash2,
  ChartNoAxesColumn,
} from "lucide-react";
import "./PostActionSheet.css";

export default function PostActionSheet({ open, onClose, isOwner = false }) {
  const [closing, setClosing] = useState(false);

  const actions = useMemo(() => {
    const base = [
      { label: "Save Post", icon: Bookmark },
      { label: "Share", icon: Share2 },
      { label: "Copy Link", icon: Link2 },
      { label: "Not Interested", icon: EyeOff },
      { label: "Hide Post", icon: EyeOff },
      { label: "Mute User", icon: VolumeX },
      { label: "Report", icon: Flag },
      { label: "Block User", icon: Ban },
      { label: "Download", icon: Download },
    ];

    if (isOwner) {
      base.push(
        { label: "Edit Post", icon: Pencil },
        { label: "Delete Post", icon: Trash2, danger: true },
        { label: "View Analytics", icon: ChartNoAxesColumn }
      );
    }

    return base;
  }, [isOwner]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  function handleClose() {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      onClose?.();
    }, 180);
  }

  function handleAction(label) {
    if (label === "Copy Link") {
      navigator.clipboard?.writeText(window.location.href).catch(() => {});
    }
    handleClose();
  }

  return (
    <div className={`action-sheet-backdrop ${closing ? "closing" : ""}`} onClick={handleClose}>
      <div
        className={`action-sheet ${closing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Post actions"
      >
        <div className="action-sheet-handle" />

        <div className="action-sheet-header">
          <div className="action-sheet-title">Post Actions</div>
          <button type="button" className="action-sheet-close" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="action-sheet-list">
          {actions.map(({ label, icon: Icon, danger }) => (
            <button
              key={label}
              type="button"
              className={`action-sheet-item ${danger ? "danger" : ""}`}
              onClick={() => handleAction(label)}
            >
              <span className="action-sheet-icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}