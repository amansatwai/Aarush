import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

export default function BackButton({ to }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="back-btn"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      aria-label="Go back"
    >
      <span className="back-arrow">←</span>
      Back
    </button>
  );
}