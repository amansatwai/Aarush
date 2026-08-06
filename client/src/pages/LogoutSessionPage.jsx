import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
  Users,
} from 'lucide-react';

const sessionOptions = [
  {
    id: 'current-device',
    title: 'Logout from this device',
    description: 'End the current Aarush session on this device.',
    icon: LogOut,
  },
  {
    id: 'other-devices',
    title: 'Logout from all other devices',
    description: 'Keep this session active and sign out everywhere else.',
    icon: MonitorSmartphone,
  },
  {
    id: 'active-sessions',
    title: 'View active sessions',
    description: 'Review devices where your Aarush account is signed in.',
    icon: Users,
  },
];

export default function LogoutSessionPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleOptionClick = (option) => {
    setMessage(`${option.title} will be connected to Supabase authentication later.`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.52) 0%, rgba(10,13,20,1) 42%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <header
        style={{
          width: '100%',
          maxWidth: '520px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{
            width: '2.75rem',
            height: '2.75rem',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <span
          style={{
            color: '#aab6cf',
            fontSize: '0.8rem',
            fontWeight: 750,
          }}
        >
          Session management
        </span>
      </header>

      <main
        style={{
          width: '100%',
          maxWidth: '520px',
          margin: '0 auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '2rem 0 1rem',
        }}
      >
        <section
          style={{
            padding: '1.4rem',
            borderRadius: '1.5rem',
            textAlign: 'center',
            background:
              'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.1), rgba(255,79,216,0.08))',
            border: '1px solid rgba(124,92,255,0.22)',
            boxShadow:
              '0 24px 70px rgba(0,0,0,0.32), 0 0 30px rgba(124,92,255,0.1)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              width: '4.25rem',
              height: '4.25rem',
              margin: '0 auto',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '1.25rem',
              background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
              color: '#fff',
              boxShadow: '0 0 28px rgba(77,215,255,0.24)',
            }}
          >
            <ShieldCheck size={31} />
          </div>

          <h1
            style={{
              margin: '1rem 0 0',
              color: '#f7f9ff',
              fontSize: '1.45rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}
          >
            Session management
          </h1>

          <p
            style={{
              margin: '0.45rem 0 0',
              color: '#b4c0d8',
              fontSize: '0.86rem',
              lineHeight: 1.5,
            }}
          >
            Manage the current device session
          </p>
        </section>

        <section
          style={{
            display: 'grid',
            gap: '0.65rem',
            marginTop: '1rem',
          }}
        >
          {sessionOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionClick(option)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  width: '100%',
                  padding: '0.95rem',
                  borderRadius: '1.2rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(15,19,30,0.9)',
                  color: '#f4f7ff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: '0 14px 35px rgba(0,0,0,0.18)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                }}
              >
                <span
                  style={{
                    width: '2.8rem',
                    height: '2.8rem',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '1rem',
                    background:
                      'linear-gradient(135deg, rgba(124,92,255,0.2), rgba(77,215,255,0.14))',
                    color: '#dfe7ff',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </span>

                <span
                  style={{
                    display: 'grid',
                    gap: '0.25rem',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <strong
                    style={{
                      color: '#f3f6ff',
                      fontSize: '0.86rem',
                      fontWeight: 850,
                    }}
                  >
                    {option.title}
                  </strong>

                  <span
                    style={{
                      color: '#96a3bf',
                      fontSize: '0.74rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {option.description}
                  </span>
                </span>

                <ChevronRight
                  size={17}
                  color="#8290ad"
                  style={{ flexShrink: 0 }}
                />
              </button>
            );
          })}
        </section>

        {message ? (
          <div
            role="status"
            style={{
              marginTop: '0.8rem',
              padding: '0.75rem',
              borderRadius: '0.9rem',
              background: 'rgba(255,179,71,0.09)',
              border: '1px solid rgba(255,179,71,0.16)',
              color: '#ffdda4',
              fontSize: '0.76rem',
              lineHeight: 1.45,
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            width: '100%',
            minHeight: '2.9rem',
            marginTop: '1rem',
            border: 0,
            borderRadius: '999px',
            background: 'transparent',
            color: '#96a3bf',
            fontSize: '0.8rem',
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </main>

      <footer
        style={{
          width: '100%',
          maxWidth: '520px',
          margin: '0 auto',
          paddingBottom: 'env(safe-area-inset-bottom)',
          color: '#74819c',
          fontSize: '0.7rem',
          lineHeight: 1.45,
          textAlign: 'center',
        }}
      >
        Session controls are protected by your Aarush account security.
      </footer>

      <style>{`
        button {
          -webkit-tap-highlight-color: transparent;
          transition: transform 180ms ease, filter 180ms ease, background 180ms ease;
        }

        button:not(:disabled):hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        button:not(:disabled):active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}