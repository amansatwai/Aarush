import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import BackButton from '../components/BackButton';
import AuthInput from '../components/AuthInput';
import LoadingButton from '../components/LoadingButton';
import { authApi } from '../lib/supabase';
import './AuthPages.css';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!form.username.trim()) next.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) next.username = '3-20 chars, letters/numbers/underscore only';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) next.confirmPassword = 'Confirm your password';
    else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    try {
      setLoading(true);
      await authApi.signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        username: form.username,
      });
      navigate('/login', { replace: true });
    } catch (error) {
      setServerError(error.message || 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    try {
      setLoading(true);
      await authApi.signInWithGoogle();
    } catch (error) {
      setServerError(error.message || 'Google signup failed');
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join Aarush in seconds">
      <BackButton to="/welcome" />
      <form onSubmit={submit}>
        <AuthInput name="fullName" label="Full Name" value={form.fullName} onChange={onChange} placeholder="Your name" autoComplete="name" error={errors.fullName} />
        <AuthInput name="username" label="Username" value={form.username} onChange={onChange} placeholder="your_username" autoComplete="username" error={errors.username} />
        <AuthInput name="email" label="Email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" autoComplete="email" error={errors.email} />
        <AuthInput name="password" label="Password" type="password" value={form.password} onChange={onChange} placeholder="Create a password" autoComplete="new-password" error={errors.password} />
        <AuthInput name="confirmPassword" label="Confirm Password" type="password" value={form.confirmPassword} onChange={onChange} placeholder="Repeat password" autoComplete="new-password" error={errors.confirmPassword} />
        {serverError ? <div className="form-alert">{serverError}</div> : null}
        <LoadingButton type="submit" loading={loading}>Create Account</LoadingButton>
      </form>

      <button className="google-btn full" onClick={google} disabled={loading}>Continue with Google</button>

      <div className="auth-links">
        <Link to="/login">Already have an account?</Link>
      </div>
    </AuthLayout>
  );
}