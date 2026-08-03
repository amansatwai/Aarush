import React from "react";
import {
  Eye,
  EyeOff,
  Shield,
  Clock3,
  Lock,
  Sparkles,
  ScanEye,
  CircleCheck
} from "lucide-react";
import "./LockPanels.css";

export default function GazeLockPanel({ open, onClose, onToggle }) {
  if (!open) return null;
  return (
    <div className="panel-backdrop" onClick={onClose}>
      <div className="panel-shell" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Gaze Lock panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Gaze Lock</div>
            <div className="panel-subtitle">Screen blur and privacy protection</div>
          </div>
          <button className="panel-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="panel-list">
          {["Screen Blur", "Auto Blur", "Privacy Blur", "Blur Strength", "Lock Timer", "Emergency Blur"].map((item) => (
            <button key={item} className="panel-item">
              <span className="panel-icon"><Eye size={16} /></span>
              <span>{item}</span>
            </button>
          ))}
        </div>
        <button className="panel-primary" onClick={onToggle}>
          <Sparkles size={16} />
          Quick Enable / Disable
        </button>
      </div>
    </div>
  );
}