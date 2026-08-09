// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import BackButton from '../components/BackButton';
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
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const next = {};

    if (!form.email.trim()) {
      next.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = 'Enter a valid email';
    }

    if (!form.password) {
      next.password = 'Password is required';
    } else if (form.password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      localStorage.removeItem(GUEST_KEYS.isGuest);
      localStorage.removeItem(GUEST_KEYS.guestSession);
      localStorage.removeItem(GUEST_KEYS.guestProfile);

      await authApi.signIn(form);
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    try {
      setLoading(true);

      localStorage.removeItem(GUEST_KEYS.isGuest);
      localStorage.removeItem(GUEST_KEYS.guestSession);
      localStorage.removeItem(GUEST_KEYS.guestProfile);

      await authApi.signInWithGoogle();
    } catch (error) {
      setServerError(error.message || 'Google login failed');
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    const guestProfile = {
      displayName: 'Guest User',
      username: '@guest',
      accountType: 'guest',
      avatar: 'default-guest-avatar',
    };

    localStorage.setItem(GUEST_KEYS.isGuest, 'true');
    localStorage.setItem(
      GUEST_KEYS.guestSession,
      JSON.stringify({
        active: true,
        accountType: 'guest',
        createdAt: new Date().toISOString(),
      })
    );
    localStorage.setItem(
      GUEST_KEYS.guestProfile,
      JSON.stringify(guestProfile)
    );

    navigate('/home', { replace: true });
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Access your Aarush account"
    >
      <BackButton to="/welcome" />

      <form onSubmit={submit}>
        <AuthInput
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />

        <AuthInput
          name="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={onChange}
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
        className="google-btn full"
        onClick={google}
        disabled={loading}
        type="button"
      >
        Continue with Google
      </button>

      <button
        type="button"
        className="google-btn full"
        onClick={continueAsGuest}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
        }}
      >
        <UserRound size={17} />
        Continue as Guest
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          margin: '0.8rem 0',
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
        <Link to="/forgot-password">Forgot Password?</Link>
        <Link to="/signup">Create New Account</Link>
      </div>
    </AuthLayout>
  );
}