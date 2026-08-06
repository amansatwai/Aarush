import React from 'react';
import './AuthLayout.css';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">A</div>
          <div>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}