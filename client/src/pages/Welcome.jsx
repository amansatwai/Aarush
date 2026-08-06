import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/supabase';
import './AuthPages.css';

export default function Welcome() {
  const navigate = useNavigate();

  const handleGoogle = async () => {
    try {
      await authApi.signInWithGoogle();
    } catch (error) {
      alert(error.message || 'Google login failed');
    }
  };

  return (
    <div className="auth-shell-screen">
      <div className="welcome-card">
        <div className="welcome-badge">A</div>
        <h1>Welcome to Aarush</h1>
        <p>Build your profile, connect with people, and share your world.</p>

        <button className="primary-btn" onClick={() => navigate('/login')}>Continue to Login</button>
        <button className="secondary-btn" onClick={() => navigate('/signup')}>Create New Account</button>
        <button className="google-btn" onClick={handleGoogle}>Continue with Google</button>
      </div>
    </div>
  );
}