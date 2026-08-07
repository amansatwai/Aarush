import { useState } from 'react';
import {
  AlertTriangle,
  KeyRound,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import {
  getDecoyVaultContent,
  recordEmergencyEvent,
  validatePanicPin,
} from '../utils/privacyProtection';

export default function PanicOverlay({
  open = false,
  panicPin,
  onClose,
  onVerified,
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [decoyOpen, setDecoyOpen] = useState(false);

  if (!open) {
    return null;
  }

  const decoyContent = getDecoyVaultContent();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validatePanicPin(value, panicPin)) {
      setValue('');
      setError('The panic PIN is incorrect.');
      return;
    }

    recordEmergencyEvent({
      triggerType: 'panic-pin',
      actionsExecuted: ['Decoy Vault opened'],
      sessionStatus: 'Silent panic activation',
    });

    setValue('');
    setError('');
    setDecoyOpen(true);
    onVerified?.();
  };

  if (decoyOpen) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          overflowY: 'auto',
          padding: '1rem',
          background:
            'radial-gradient(circle at top, rgba(34,43,68,0.58), #07090e 68%)',
          color: '#f4f7ff',
        }}
      >
        <div
          style={{
            width: 'min(100%, 560px)',
            margin: '2rem auto',
            padding: '1.1rem',
            borderRadius: '1.35rem',
            background: 'rgba(15,19,30,0.96)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div>
              <strong style={{ fontSize: '1rem' }}>
                {decoyContent.profile.displayName}
              </strong>

              <span
                style={{
                  display: 'block',
                  marginTop: '0.2rem',
                  color: '#96a3bf',
                  fontSize: '0.72rem',
                }}
              >
                {decoyContent.profile.username}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                minHeight: '2.4rem',
                padding: '0 0.8rem',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                color: '#dce5f8',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>

          <p
            style={{
              margin: '1rem 0',
              color: '#aab7d0',
              fontSize: '0.78rem',
              lineHeight: 1.5,
            }}
          >
            {decoyContent.profile.bio}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {[
              ['Chats', decoyContent.chats.length],
              ['Gallery', decoyContent.gallery.length],
              ['Memories', decoyContent.memories.length],
              ['Activity', decoyContent.activity.length],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: '0.8rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#8997b3',
                    fontSize: '0.67rem',
                  }}
                >
                  {label}
                </span>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.35rem',
                    color: '#edf2ff',
                    fontSize: '1.1rem',
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>

          <p
            style={{
              margin: '1rem 0 0',
              color: '#74819c',
              fontSize: '0.67rem',
              lineHeight: 1.45,
            }}
          >
            This safe environment contains dummy content. Real account data
            remains protected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Panic PIN"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        background: 'rgba(4,7,13,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <main
        style={{
          width: 'min(100%, 390px)',
          padding: '1.35rem',
          borderRadius: '1.45rem',
          background: 'rgba(15,19,30,0.96)',
          border: '1px solid rgba(255,79,122,0.2)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
          color: '#f4f7ff',
        }}
      >
        <div
          style={{
            width: '3.7rem',
            height: '3.7rem',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto',
            borderRadius: '1.1rem',
            background: 'linear-gradient(135deg, #ff4f7a, #7c5cff)',
            color: '#fff',
          }}
        >
          <Lock size={27} />
        </div>

        <h1
          style={{
            margin: '0.9rem 0 0',
            textAlign: 'center',
            fontSize: '1.2rem',
          }}
        >
          Emergency Access
        </h1>

        <p
          style={{
            margin: '0.45rem 0 1rem',
            color: '#aab7d0',
            fontSize: '0.76rem',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          Enter your emergency PIN to open the protected safe environment.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: 'block',
              color: '#cbd6ea',
              fontSize: '0.72rem',
              fontWeight: 750,
            }}
          >
            Panic PIN
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              style={{
                width: '100%',
                minHeight: '2.8rem',
                marginTop: '0.4rem',
                padding: '0 0.75rem',
                borderRadius: '0.8rem',
                border: '1px solid rgba(255,255,255,0.12)',
                outline: 0,
                background: '#111827',
                color: '#fff',
                fontSize: '1rem',
                letterSpacing: '0.2em',
              }}
            />
          </label>

          <button
            type="submit"
            style={{
              width: '100%',
              minHeight: '2.8rem',
              marginTop: '0.7rem',
              border: 0,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 850,
              cursor: 'pointer',
            }}
          >
            <KeyRound
              size={15}
              style={{ verticalAlign: 'middle', marginRight: '0.3rem' }}
            />
            Open Safe Environment
          </button>
        </form>

        {error ? (
          <p
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              margin: '0.7rem 0 0',
              color: '#ffadc4',
              fontSize: '0.68rem',
            }}
          >
            <AlertTriangle size={13} />
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            minHeight: '2.4rem',
            marginTop: '0.65rem',
            border: 0,
            borderRadius: '999px',
            background: 'transparent',
            color: '#96a3bf',
            fontSize: '0.7rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            marginTop: '0.8rem',
            color: '#74819c',
            fontSize: '0.62rem',
          }}
        >
          <ShieldCheck size={12} />
          Panic activation is recorded silently.
        </div>
      </main>
    </div>
  );
}