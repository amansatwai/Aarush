import React, { useEffect, useState } from "react";
import {
X,
LogIn,
LogOut,
UserPlus,
CircleUser,
Copy,
Shield,
KeyRound,
Fingerprint,
Lock,
EyeOff,
Palette,
Sparkles,
Monitor,
Moon,
SunMedium,
Globe,
Camera,
UserRound,
Info,
HelpCircle,
FileText,
Bookmark,
Archive,
FileMinus,
History,
MessageSquareWarning,
BadgeCheck,
Settings2,
ShieldAlert,
Trash2,
Smartphone,
Mail,
BellOff,
ToggleLeft,
Clock3,
} from "lucide-react";
import "./AccountDrawer.css";

function FeatureModal({ title, description, onClose }) {
return ( <div className="drawer-modal-backdrop" onClick={onClose}>
<div className="drawer-modal" onClick={(e) => e.stopPropagation()}> <div className="drawer-modal-title">{title}</div> <div className="drawer-modal-text">{description}</div> <button type="button" className="drawer-modal-btn" onClick={onClose}>
Close </button> </div> </div>
);
}

export default function AccountDrawer({ open, onClose, profile }) {
const [activeModal, setActiveModal] = useState(null);

useEffect(() => {
if (!open) return;

```
const previousOverflow = document.body.style.overflow;
document.body.style.overflow = "hidden";

const handleKeyDown = (e) => {
  if (e.key === "Escape") onClose?.();
};

window.addEventListener("keydown", handleKeyDown);

return () => {
  document.body.style.overflow = previousOverflow;
  window.removeEventListener("keydown", handleKeyDown);
};
```

}, [open, onClose]);

if (!open) return null;

const openModal = (title, description) => {
setActiveModal({ title, description });
};

const sections = [
{
title: "Account",
items: [
["Login", LogIn],
["Logout", LogOut],
["Switch Account", UserRound],
["Add New Account", UserPlus],
["Continue with Google", CircleUser],
],
},
{
title: "Account Management",
items: [
["Remove Account from This Device", Smartphone],
["Delete Account", Trash2],
],
},
{
title: "Security",
items: [
["Forgot Password", KeyRound],
["Change Password", Lock],
["Save Password", Fingerprint],
["Save Login Information", Copy],
["OTP Verification", Mail],
["Two-Factor Authentication (2FA)", Shield],
],
},
{
title: "Verification",
items: [
["Request Verification Badge", BadgeCheck],
["Verification Status", ShieldAlert],
],
},
{
title: "Privacy",
items: [
["Private Account", ToggleLeft],
["Hide Online Status", EyeOff],
["Hide Last Seen", Clock3],
["Hide Read Receipts", BellOff],
["Blocked Accounts", Shield],
["Muted Accounts", EyeOff],
],
},
{
title: "Appearance",
items: [
["Dark / Light / System Theme", Monitor],
["Accent Color", Palette],
["Icon Glow Intensity", Sparkles],
["Reduce Animations", Moon],
],
},
{
title: "Profile Editing",
items: [
["Change Profile Photo", Camera],
["Edit Username", UserRound],
["Edit Full Name", UserRound],
["Edit Bio", FileText],
["Edit Website", Globe],
["Edit Gender", Settings2],
["Edit Birthday", SunMedium],
],
},
{
title: "Content",
items: [
["Saved Posts", Bookmark],
["Archived Posts", Archive],
["Hidden Posts", FileMinus],
["Draft Posts", FileText],
["Story Archive", History],
],
},
{
title: "Support",
items: [
["Help Center", HelpCircle],
["Report a Problem", MessageSquareWarning],
["Terms & Privacy", FileText],
["About Aarush", Info],
],
},
];

return ( <div className="drawer-backdrop" onClick={onClose}>
<aside
className="drawer-shell"
onClick={(e) => e.stopPropagation()}
role="dialog"
aria-modal="true"
aria-label="Account drawer"
> <div className="drawer-header"> <div> <div className="drawer-title">Account Drawer</div> <div className="drawer-subtitle">
{profile?.username || "guest"} · manage account and preferences </div> </div>

```
      <button
        type="button"
        className="drawer-close"
        onClick={onClose}
        aria-label="Close drawer"
      >
        <X size={18} />
      </button>
    </div>

    <div className="drawer-scroll">
      {sections.map((section) => (
        <section key={section.title} className="drawer-section">
          <div className="drawer-section-label">{section.title}</div>

          <div className="drawer-list">
            {section.items.map(([label, Icon]) => (
              <button
                key={label}
                type="button"
                className={`drawer-item ${label === "Delete Account" ? "danger" : ""}`}
                onClick={() => {
                  if (label === "Delete Account") {
                    openModal(
                      "Delete Account",
                      "This will permanently delete the account after confirmation."
                    );
                    return;
                  }

                  if (label === "Remove Account from This Device") {
                    openModal(
                      "Remove Account from This Device",
                      "This only clears the local login session on this device."
                    );
                    return;
                  }

                  openModal(label, `${label} placeholder screen or modal.`);
                }}
              >
                <span className="drawer-icon">
                  <Icon size={16} />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>

    {activeModal && (
      <FeatureModal
        title={activeModal.title}
        description={activeModal.description}
        onClose={() => setActiveModal(null)}
      />
    )}
  </aside>
</div>

);
}
