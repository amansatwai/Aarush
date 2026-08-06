import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import BackButton from '../components/BackButton';
import AuthInput from '../components/AuthInput';
import LoadingButton from '../components/LoadingButton';
import { authApi } from '../lib/supabase';
import './AuthPages.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword(email);
      setSuccess('Password reset link sent. Check your email.');
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password" subtitle="Reset your login password">
      <BackButton to="/login" />
      <form onSubmit={submit}>
        <AuthInput
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          error={error}
        />
        {success ? <div className="form-success">{success}</div> : null}
        <LoadingButton type="submit" loading={loading}>Send Reset Link</LoadingButton>
      </form>

      <div className="auth-links">
        <Link to="/login">Back to Login</Link>
      </div>
    </AuthLayout>
  );
}