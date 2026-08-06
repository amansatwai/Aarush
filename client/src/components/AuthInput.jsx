import React from 'react';
import './AuthInput.css';

export default function AuthInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  name,
}) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        className={`auth-input ${error ? 'has-error' : ''}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {error ? <div className="auth-error">{error}</div> : null}
    </div>
  );
}