import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  LogIn,
  LogOut,
  UserPlus,
  KeyRound,
  CircleUser,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import "./ProfileSettingsModal.css";

const RESET_URL = "https://your-app-url/reset-password";

export default function ProfileSettingsModal({ onClose, supabase, user, onAuthChange }) {
  const [mode, setMode] = useState("menu");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const items = useMemo(() => ([
    { label: "Login", icon: LogIn, key: "login" },
    { label: "Logout", icon: LogOut, key: "logout" },
    { label: "Sign Up", icon: UserPlus, key: "signup" },
    { label: "Forgot Password", icon: KeyRound, key: "reset" },
    { label: "Continue with Google", icon: CircleUser, key: "google" },
  ]), []);

  function closeAndReset() {
    setMode("menu");
    setLoading(false);
    setShowPassword(false);
    setMessage("");
    setError("");
    setForm({ email: user?.email || "", password: "", confirmPassword: "" });
    onClose?.();
  }

  async function refreshAuthState() {
    const { data } = await supabase.auth.getSession();
    const session = data?.session || null;
    onAuthChange?.(session?.user || null, session);
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (authError) {
        setError(authError.message || "Invalid credentials.");
        return;
      }

      onAuthChange?.(data?.user || data?.session?.user || null, data?.session || null);
      closeAndReset();
    } catch {
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.email.trim() || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
      });

      if (authError) {
        setError(authError.message || "Signup failed.");
        return;
      }

      onAuthChange?.(data?.user || data?.session?.user || null, data?.session || null);
      closeAndReset();
    } catch {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) {
        setError(authError.message || "Logout failed.");
        return;
      }

      onAuthChange?.(null, null);
      closeAndReset();
    } catch {
      setError("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
        redirectTo: RESET_URL,
      });

      if (resetError) {
        setError(resetError.message || "Password reset failed.");
        return;
      }

      setMessage("Password reset email sent. Please check your inbox.");
      setMode("menu");
    } catch {
      setError("Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href,
        },
      });

      if (oauthError) {
        setError(oauthError.message || "Google sign in failed.");
        return;
      }

      setMessage("Redirecting to Google...");
    } catch {
      setError("Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div
        className="settings-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Account Settings"
      >
        <div className="settings-modal-header">
          <div>
            <div className="settings-modal-title">Account Settings</div>
            <div className="settings-modal-subtitle">Quick account actions</div>
          </div>

          <button type="button" className="settings-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {mode === "menu" && (
          <div className="settings-modal-list">
            {items.map(({ label, icon: Icon, key }) => (
              <button
                key={label}
                type="button"
                className="settings-modal-item"
                onClick={() => {
                  setError("");
                  setMessage("");
                  if (key === "login") setMode("login");
                  if (key === "logout") handleLogout();
                  if (key === "signup") setMode("signup");
                  if (key === "reset") setMode("reset");
                  if (key === "google") handleGoogleLogin();
                }}
              >
                <span className="settings-modal-icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {mode === "login" && (
          <form className="settings-form" onSubmit={handleLoginSubmit}>
            <label className="settings-field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label className="settings-field">
              <span>Password</span>
              <div className="password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && <div className="settings-feedback error">{error}</div>}
            {message && <div className="settings-feedback success">{message}</div>}

            <button className="settings-action primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : null}
              Login
            </button>
            <button type="button" className="settings-action" onClick={() => setMode("menu")} disabled={loading}>
              Back
            </button>
          </form>
        )}

        {mode === "signup" && (
          <form className="settings-form" onSubmit={handleSignupSubmit}>
            <label className="settings-field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label className="settings-field">
              <span>Password</span>
              <div className="password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <label className="settings-field">
              <span>Confirm Password</span>
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </label>

            {error && <div className="settings-feedback error">{error}</div>}
            {message && <div className="settings-feedback success">{message}</div>}

            <button className="settings-action primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : null}
              Sign Up
            </button>
            <button type="button" className="settings-action" onClick={() => setMode("menu")} disabled={loading}>
              Back
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form className="settings-form" onSubmit={handleResetSubmit}>
            <label className="settings-field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            {error && <div className="settings-feedback error">{error}</div>}
            {message && <div className="settings-feedback success">{message}</div>}

            <button className="settings-action primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : null}
              Send Reset Email
            </button>
            <button type="button" className="settings-action" onClick={() => setMode("menu")} disabled={loading}>
              Back
            </button>
          </form>
        )}

        {mode === "google" && (
          <div className="settings-form">
            {error && <div className="settings-feedback error">{error}</div>}
            {message && <div className="settings-feedback success">{message}</div>}
            <button className="settings-action primary" type="button" onClick={handleGoogleLogin} disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : null}
              Continue with Google
            </button>
            <button type="button" className="settings-action" onClick={() => setMode("menu")} disabled={loading}>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}