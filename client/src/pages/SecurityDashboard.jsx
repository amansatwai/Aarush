import React, { useEffect, useState } from "react";
import "./SecurityDashboard.css";

const DEFAULT_PIN = "1234";

export default function SecurityDashboard({ navigate }) {
const [lockEnabled, setLockEnabled] = useState(false);
const [privacyEnabled, setPrivacyEnabled] = useState(false);

const [currentPin, setCurrentPin] = useState("");
const [newPin, setNewPin] = useState("");
const [confirmPin, setConfirmPin] = useState("");
const [message, setMessage] = useState("");

useEffect(() => {
setLockEnabled(localStorage.getItem("aarush_lock_enabled") === "true");
setPrivacyEnabled(localStorage.getItem("aarush_privacy") === "true");
}, []);

function toggleLock() {
const value = !lockEnabled;
setLockEnabled(value);
localStorage.setItem("aarush_lock_enabled", value ? "true" : "false");

```
if (!value) {
  localStorage.setItem("aarush_lock", "false");
}

setMessage(value ? "App Lock Enabled" : "App Lock Disabled");
```

}

function togglePrivacy() {
const value = !privacyEnabled;
setPrivacyEnabled(value);
localStorage.setItem("aarush_privacy", value ? "true" : "false");
setMessage(value ? "Emergency Privacy Enabled" : "Emergency Privacy Disabled");
}

function changePin() {
const savedPin = localStorage.getItem("aarush_pin") || DEFAULT_PIN;

```
if (currentPin !== savedPin) {
  setMessage("Current PIN is incorrect");
  return;
}

if (newPin.length !== 4) {
  setMessage("New PIN must be exactly 4 digits");
  return;
}

if (newPin !== confirmPin) {
  setMessage("PIN confirmation does not match");
  return;
}

localStorage.setItem("aarush_pin", newPin);
setCurrentPin("");
setNewPin("");
setConfirmPin("");
setMessage("PIN changed successfully");
```

}

return ( <div className="security-page"> <div className="security-header">
<button className="back-btn" onClick={() => navigate("profile")}>
← </button> <h1>Security Dashboard</h1> </div>

```
  {message && <div className="status-message">{message}</div>}

  <div className="security-card">
    <div className="security-row">
      <div>
        <h3>One Tap All Lock</h3>
        <p>Require PIN before opening Aarush</p>
      </div>
      <button className={lockEnabled ? "toggle on" : "toggle"} onClick={toggleLock}>
        {lockEnabled ? "ON" : "OFF"}
      </button>
    </div>
  </div>

  <div className="security-card">
    <div className="security-row">
      <div>
        <h3>Emergency Privacy</h3>
        <p>Quickly hide profile visibility and activity</p>
      </div>
      <button className={privacyEnabled ? "toggle on" : "toggle"} onClick={togglePrivacy}>
        {privacyEnabled ? "ON" : "OFF"}
      </button>
    </div>
  </div>

  <div className="security-card">
    <h3>Change PIN</h3>
    <input
      type="password"
      placeholder="Current PIN"
      value={currentPin}
      onChange={(e) => setCurrentPin(e.target.value)}
    />
    <input
      type="password"
      placeholder="New 4-digit PIN"
      value={newPin}
      onChange={(e) => setNewPin(e.target.value)}
    />
    <input
      type="password"
      placeholder="Confirm New PIN"
      value={confirmPin}
      onChange={(e) => setConfirmPin(e.target.value)}
    />
    <button className="primary-btn" onClick={changePin}>
      Save New PIN
    </button>
  </div>

  <div className="security-card">
    <h3>Biometric (Coming Soon)</h3>
    <p>Fingerprint and Face Unlock integration will be added later.</p>
  </div>
      <div className="security-card">
        <h3>Active Devices</h3>
        <p>This device: Windows / Chrome</p>
      </div>
    </div>
  );
}
