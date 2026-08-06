import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/welcome', { replace: true }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-logo">A</div>
      <h1>Aarush</h1>
      <p>Connect. Create. Share.</p>
      <div className="splash-loader" />
    </div>
  );
}