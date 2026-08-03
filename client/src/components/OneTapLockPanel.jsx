import React from "react";
import { X, Lock, Fingerprint, Shield, BellOff } from "lucide-react";
import "./LockPanels.css";

export default function OneTapLockPanel({ open, onClose, onToggle }) {
  if (!open) return null;
  return (
    <div className="panel-backdrop" onClick={onClose}>
      <div className="panel-shell" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="One Tap Lock panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">One Tap Lock</div>
            <div className="panel-subtitle">Instant device lock and privacy shield</div>
          </div>
          <button className="panel-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="panel-list">
          {["Instant App Lock", "Biometric Lock", "PIN Lock", "Hide Notifications", "Emergency Privacy Lock"].map((item) => (
            <button key={item} className="panel-item">
              <span className="panel-icon"><Lock size={16} /></span>
              <span>{item}</span>
            </button>
          ))}
        </div>
        <button className="panel-primary" onClick={onToggle}>
          <Shield size={16} />
          Lock Immediately
        </button>
      </div>
    </div>
  );
}