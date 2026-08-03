import React from "react";
import { X, ImageUp, SquarePlay, Clapperboard } from "lucide-react";
import "./UploadSheet.css";

export default function UploadSheet({ open, onClose, onSelect }) {
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet-shell" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Upload options">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <div className="sheet-title">Create New</div>
          <button className="sheet-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="sheet-list">
          <button className="sheet-item" onClick={() => onSelect?.("post")}><ImageUp size={18} /> Upload Post</button>
          <button className="sheet-item" onClick={() => onSelect?.("story")}><SquarePlay size={18} /> Upload Story</button>
          <button className="sheet-item" onClick={() => onSelect?.("reel")}><Clapperboard size={18} /> Upload Reel</button>
        </div>
      </div>
    </div>
  );
}