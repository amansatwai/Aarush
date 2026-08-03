import React, { useEffect, useState } from "react";
import "./AppLock.css";

const DEFAULT_PIN = "1234";

export default function AppLock({ children }) {
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("aarush_lock");
    setIsLocked(saved === "true");
  }, []);

  function unlock() {
    const savedPin = localStorage.getItem("aarush_pin") || DEFAULT_PIN;

    if (pin === savedPin) {
      localStorage.setItem("aarush_lock", "false");
      setIsLocked(false);
      setPin("");
      setError("");
      return;
    }

    setError("Incorrect PIN");
  }

  function unlockWithEnter(e) {
    if (e.key === "Enter") {
      unlock();
    }
  }

  function emergencyReset() {
    localStorage.setItem("aarush_lock", "false");
    setIsLocked(false);
    setPin("");
    setError("");
  }

  if (!isLocked) {
    return children;
  }

  return (
    <div className="lock-screen">
      <div className="lock-box">
        <div className="lock-icon">🔒</div>
        <h1>Aarush Locked</h1>
        <p>Enter PIN to continue</p>

        <input
          type="password"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={unlockWithEnter}
          placeholder="Enter PIN"
          autoFocus
        />

        {error && <div className="lock-error">{error}</div>}

        <button className="unlock-btn" onClick={unlock}>
          Unlock
        </button>

        <button className="reset-btn" onClick={emergencyReset}>
          Emergency Reset
        </button>

        <div className="pin-hint">Default PIN: 1234</div>
      </div>
    </div>
  );
}