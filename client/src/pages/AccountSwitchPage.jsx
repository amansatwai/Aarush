import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  Plus,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

const loggedInAccounts = [
  {
    id: 'account-1',
    username: '@arush.dev',
    displayName: 'Aarush Developer',
    avatar: 'A',
    active: true,
    gradient: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },
  {
    id: 'account-2',
    username: '@aman.satwai',
    displayName: 'Aman Satwai',
    avatar: 'A',
    active: false,
    gradient: 'linear-gradient(135deg, #ff4fd8, #7c5cff)',
  },
  {
    id: 'account-3',
    username: '@creator.lab',
    displayName: 'Creator Lab',
    avatar: 'C',
    active: false,
    gradient: 'linear-gradient(135deg, #ffb347, #ff4fd8)',
  },
];

export default function AccountSwitchPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleSwitch = (account) => {
    setMessage(`Account switching for ${account.username} will be connected to authentication later.`);
  };

  const handleAddAccount = () => {
    setMessage('Add another account will open the authentication flow later.');
  };

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      background:
        'radial-gradient(circle at top, rgba(34,43,68,0.5) 0%, rgba(10,13,20,1) 42%, rgba(7,9,14,1) 100%)',
      color: '#f4f7ff',
    },
    header: {
      width: '100%',
      maxWidth: '520px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      paddingTop: 'env(safe-area-inset-top)',
    },
    backButton: {
      width: '2.75rem',
      height: '2.75rem',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      flexShrink: 0,
    },
    main: {
      width: '100%',
      maxWidth: '520px',
      margin: '0 auto',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2rem 0 1rem',
    },
    hero: {
      padding: '1.35rem',
      borderRadius: '1.5rem',
      background:
        'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.1), rgba(255,79,216,0.08))',
      border: '1px solid rgba(124,92,255,0.22)',
      boxShadow: '0 24px 70px rgba(0,0,0,0.32), 0 0 30px rgba(124,92,255,0.1)',
      textAlign: 'center',
    },
    shield: {
      width: '4.25rem',
      height: '4.25rem',
      margin: '0 auto',
      borderRadius: '1.25rem',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
      color: '#fff',
      boxShadow: '0 0 28px rgba(77,215,255,0.24)',
    },
    title: {
      margin: '1rem 0 0',
      color: '#f7f9ff',
      fontSize: '1.45rem',
      fontWeight: 900,
      letterSpacing: '-0.02em',
    },
    subtitle: {
      margin: '0.45rem 0 0',
      color: '#b4c0d8',
      fontSize: '0.86rem',
      lineHeight: 1.5,
    },
    count: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      marginTop: '0.8rem',
      padding: '0.42rem 0.65rem',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#e4ebfb',
      fontSize: '0.74rem',
      fontWeight: 800,
    },
    accountList: {
      display: 'grid',
      gap: '0.65rem',
      marginTop: '1rem',
    },
    accountCard: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.85rem',
      borderRadius: '1.2rem',
      background: active
        ? 'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(77,215,255,0.08))'
        : 'rgba(15,19,30,0.9)',
      border: `1px solid ${
        active ? 'rgba(124,92,255,0.3)' : 'rgba(255,255,255,0.08)'
      }`,
      boxShadow: active ? '0 0 24px rgba(124,92,255,0.12)' : '0 14px 35px rgba(0,0,0,0.18)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
    }),
    avatarRing: (gradient) => ({
      width: '3.2rem',
      height: '3.2rem',
      padding: '2.5px',
      borderRadius: '999px',
      background: gradient,
      boxShadow: '0 0 16px rgba(124,92,255,0.18)',
      flexShrink: 0,
    }),
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: '999px',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #151a28, #252d48)',
      color: '#fff',
      fontSize: '1rem',
      fontWeight: 900,
    },
    accountInfo: {
      flex: 1,
      minWidth: 0,
    },
    username: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.35rem',
      color: '#f5f8ff',
      fontSize: '0.88rem',
      fontWeight: 850,
    },
    displayName: {
      display: 'block',
      marginTop: '0.2rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: '#96a3bf',
      fontSize: '0.75rem',
    },
    activeBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      marginTop: '0.35rem',
      padding: '0.28rem 0.45rem',
      borderRadius: '999px',
      background: 'rgba(82,232,170,0.12)',
      border: '1px solid rgba(82,232,170,0.18)',
      color: '#d7ffef',
      fontSize: '0.64rem',
      fontWeight: 850,
    },
    switchButton: {
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '999px',
      padding: '0.58rem 0.75rem',
      background: 'rgba(255,255,255,0.06)',
      color: '#eaf0ff',
      fontSize: '0.74rem',
      fontWeight: 850,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
    actions: {
      display: 'grid',
      gap: '0.55rem',
      marginTop: '1rem',
    },
    primaryButton: {
      width: '100%',
      minHeight: '3rem',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.45rem',
      border: 0,
      borderRadius: '999px',
      background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
      color: '#fff',
      fontSize: '0.84rem',
      fontWeight: 850,
      cursor: 'pointer',
      boxShadow: '0 12px 28px rgba(124,92,255,0.2)',
    },
    secondaryButton: {
      width: '100%',
      minHeight: '2.9rem',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.45rem',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.05)',
      color: '#dce5f8',
      fontSize: '0.82rem',
      fontWeight: 800,
      cursor: 'pointer',
    },
    cancelButton: {
      width: '100%',
      minHeight: '2.8rem',
      border: 0,
      borderRadius: '999px',
      background: 'transparent',
      color: '#96a3bf',
      fontSize: '0.8rem',
      fontWeight: 750,
      cursor: 'pointer',
    },
    message: {
      marginTop: '0.8rem',
      padding: '0.75rem',
      borderRadius: '0.9rem',
      background: 'rgba(255,179,71,0.09)',
      border: '1px solid rgba(255,179,71,0.16)',
      color: '#ffdda4',
      fontSize: '0.76rem',
      lineHeight: 1.45,
      textAlign: 'center',
    },
    footer: {
      width: '100%',
      maxWidth: '520px',
      margin: '0 auto',
      paddingBottom: 'env(safe-area-inset-bottom)',
      textAlign: 'center',
      color: '#74819c',
      fontSize: '0.7rem',
      lineHeight: 1.45,
    },
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={styles.backButton}
          aria-label="Go back"
        >
          <ChevronLeft size={18} />
        </button>

        <span style={{ color: '#aab6cf', fontSize: '0.8rem', fontWeight: 750 }}>
          Account switch
        </span>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.shield}>
            <ShieldCheck size={31} />
          </div>

          <h1 style={styles.title}>Switch account</h1>

          <p style={styles.subtitle}>
            Accounts currently signed in on this device
          </p>

          <span style={styles.count}>
            <UserRound size={13} />
            Logged in accounts: {loggedInAccounts.length}
          </span>
        </section>

        <section style={styles.accountList}>
          {loggedInAccounts.map((account) => (
            <article key={account.id} style={styles.accountCard(account.active)}>
              <div style={styles.avatarRing(account.gradient)}>
                <div style={styles.avatar}>{account.avatar}</div>
              </div>

              <div style={styles.accountInfo}>
                <div style={styles.username}>
                  {account.username}
                  {account.active ? <Check size={14} color="#72f0bd" /> : null}
                </div>

                <span style={styles.displayName}>{account.displayName}</span>

                {account.active ? (
                  <span style={styles.activeBadge}>
                    <Check size={11} />
                    Current account
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => handleSwitch(account)}
                style={{
                  ...styles.switchButton,
                  opacity: account.active ? 0.58 : 1,
                  cursor: account.active ? 'default' : 'pointer',
                }}
                disabled={account.active}
              >
                {account.active ? 'Active' : 'Switch'}
              </button>
            </article>
          ))}
        </section>

        <section style={styles.actions}>
          <button
            type="button"
            onClick={handleAddAccount}
            style={styles.primaryButton}
          >
            <Plus size={17} />
            Add another account
          </button>

          <button
            type="button"
            onClick={handleAddAccount}
            style={styles.secondaryButton}
          >
            Continue with another account
          </button>

          {message ? <div style={styles.message}>{message}</div> : null}

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </section>
      </main>

      <footer style={styles.footer}>
        Account switching is protected by your Aarush device session.
      </footer>

      <style>{`
        button {
          transition: transform 180ms ease, filter 180ms ease, background 180ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        button:not(:disabled):hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        button:not(:disabled):active {
          transform: scale(0.98);
        }

        @media (max-width: 420px) {
          main {
            padding-top: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}