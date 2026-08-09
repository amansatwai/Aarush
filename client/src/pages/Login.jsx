import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import LoadingButton from '../components/LoadingButton';
import { authApi } from '../lib/supabase';
import './AuthPages.css';

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
  guestProfile: 'aarush_guest_profile',
};

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const clearGuestSession = () => {
    localStorage.removeItem(GUEST_KEYS.isGuest);
    localStorage.removeItem(GUEST_KEYS.guestSession);
    localStorage.removeItem(GUEST_KEYS.guestProfile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      clearGuestSession();

      await authApi.signIn(form);

      // Reload so App.jsx restores the authenticated session
      window.location.replace('/home');
    } catch (error) {
      setServerError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      clearGuestSession();
      await authApi.signInWithGoogle();
    } catch (error) {
      setServerError(error.message || 'Google login failed');
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestProfile = {
      displayName: 'Guest User',
      username: '@guest',
      accountType: 'guest',
    };

    localStorage.setItem(GUEST_KEYS.isGuest, 'true');
    localStorage.setItem(GUEST_KEYS.guestSession, 'active');
    localStorage.setItem(
      GUEST_KEYS.guestProfile,
      JSON.stringify(guestProfile)
    );

    // Force App.jsx to detect the guest session
    window.location.replace('/home');
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your Aarush journey."
    >
      <form onSubmit={handleSubmit}>
        <AuthInput
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />

        <AuthInput
          name="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password}
        />

        {serverError ? (
          <div className="form-alert">{serverError}</div>
        ) : null}

        <LoadingButton type="submit" loading={loading}>
          Login
        </LoadingButton>
      </form>

      <button
        type="button"
        className="google-btn full"
        onClick={handleGuestLogin}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
          marginTop: '0.75rem',
        }}
      >
        <UserRound size={17} />
        Continue as Guest
      </button>

      <button
        type="button"
        className="google-btn full"
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{ marginTop: '0.75rem' }}
      >
        Continue with Google
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          margin: '1rem 0',
          color: '#8592ad',
          fontSize: '0.72rem',
          fontWeight: 750,
        }}
      >
        <span
          style={{
            flex: 1,
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <span>or</span>
        <span
          style={{
            flex: 1,
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
      </div>

      <div className="auth-links">
        <Link to="/signup">Create New Account</Link>
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
    </AuthLayout>
  );
}