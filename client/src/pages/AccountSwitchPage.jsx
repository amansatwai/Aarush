import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Fingerprint,
  Laptop,
  LogIn,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';

const initialAccounts = [
  {
    id: 'account-1',
    username: '@arush.dev',
    displayName: 'Aarush Developer',
    avatarUrl: 'https://i.pravatar.cc/160?img=12',
    lastActive: 'Active now',
    trustedDevice: true,
    current: true,
    device: 'This device',
  },
  {
    id: 'account-2',
    username: '@aman.satwai',
    displayName: 'Aman Satwai',
    avatarUrl: 'https://i.pravatar.cc/160?img=11',
    lastActive: 'Active 18 minutes ago',
    trustedDevice: true,
    current: false,
    device: 'Windows laptop',
  },
  {
    id: 'account-3',
    username: '@creator.lab',
    displayName: 'Creator Lab',
    avatarUrl: 'https://i.pravatar.cc/160?img=32',
    lastActive: 'Active yesterday',
    trustedDevice: false,
    current: false,
    device: 'Android device',
  },
];

function AccountAvatar({ account }) {
  return (
    <div
      style={{
        width: '3.5rem',
        height: '3.5rem',
        padding: '2px',
        borderRadius: '999px',
        background: account.current
          ? 'linear-gradient(135deg, #7c5cff, #4dd7ff, #ff4fd8)'
          : 'linear-gradient(135deg, rgba(124,92,255,0.65), rgba(77,215,255,0.45))',
        boxShadow: account.current
          ? '0 0 24px rgba(124,92,255,0.3)'
          : '0 0 16px rgba(77,215,255,0.12)',
        flexShrink: 0,
      }}
    >
      <img
        src={account.avatarUrl}
        alt={`${account.displayName} profile`}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          borderRadius: '999px',
          background: '#1a2031',
        }}
      />
    </div>
  );
}

function DeviceIcon({ device }) {
  if (device.toLowerCase().includes('android')) {
    return <Smartphone size={13} />;
  }

  if (device.toLowerCase().includes('laptop')) {
    return <Laptop size={13} />;
  }

  return <ShieldCheck size={13} />;
}

export default function AccountSwitchPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedAccountId, setSelectedAccountId] = useState('account-1');
  const [message, setMessage] = useState('');

  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) ||
    accounts[0];

  const handleSwitchAccount = (account) => {
    if (account.id === selectedAccountId) {
      setMessage(`${account.username} is already the current account.`);
      return;
    }

    setSelectedAccountId(account.id);
    setMessage(
      `Account switching for ${account.username} is ready for the secure authentication session integration.`
    );
  };

  const handleRemoveAccount = (account) => {
    const confirmed = window.confirm(
      `Remove ${account.username} from this device? This will not delete the Aarush account.`
    );

    if (!confirmed) {
      return;
    }

    setAccounts((currentAccounts) =>
      currentAccounts.filter((item) => item.id !== account.id)
    );

    if (selectedAccountId === account.id) {
      const fallbackAccount = accounts.find((item) => item.id !== account.id);
      setSelectedAccountId(fallbackAccount?.id || '');
    }

    setMessage(`${account.username} was removed from this device.`);
  };

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      background:
        'radial-gradient(circle at top, rgba(34,43,68,0.52) 0%, rgba(10,13,20,1) 42%, rgba(7,9,14,1) 100%)',
      color: '#f4f7ff',
    },
    header: {
      width: '100%',
      maxWidth: '560px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      paddingTop: 'env(safe-area-inset-top)',
    },
    backButton: {
      width: '2.75rem',
      height: '2.75rem',
      display: 'grid',
      placeItems: 'center',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#fff',
      cursor: 'pointer',
      flexShrink: 0,
    },
    headerLabel: {
      color: '#aab6cf',
      fontSize: '0.8rem',
      fontWeight: 750,
    },
    main: {
      width: '100%',
      maxWidth: '560px',
      margin: '0 auto',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '1.75rem 0 1rem',
    },
    hero: {
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
    },
    heroIcon: {
      width: '4.25rem',
      height: '4.25rem',
      margin: '0 auto',
      display: 'grid',
      placeItems: 'center',
      borderRadius: '1.25rem',
      background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
      color: '#fff',
      boxShadow: '0 0 28px rgba(77,215,255,0.24)',
    },
    title: {
      margin: '1rem 0 0',
      color: '#f7f9ff',
      fontSize: '1.5rem',
      fontWeight: 900,
      letterSpacing: '-0.025em',
    },
    subtitle: {
      margin: '0.45rem 0 0',
      color: '#b4c0d8',
      fontSize: '0.86rem',
      lineHeight: 1.5,
    },
    accountCount: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      marginTop: '0.8rem',
      padding: '0.42rem 0.7rem',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#e4ebfb',
      fontSize: '0.74rem',
      fontWeight: 800,
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      margin: '1.1rem 0 0.65rem',
    },
    sectionTitle: {
      margin: 0,
      color: '#eef3ff',
      fontSize: '0.86rem',
      fontWeight: 850,
    },
    securityLabel: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      color: '#82e9c1',
      fontSize: '0.7rem',
      fontWeight: 800,
    },
    accountList: {
      display: 'grid',
      gap: '0.65rem',
    },
    accountCard: (active) => ({
      padding: '0.9rem',
      borderRadius: '1.2rem',
      border: `1px solid ${
        active ? 'rgba(124,92,255,0.34)' : 'rgba(255,255,255,0.08)'
      }`,
      background: active
        ? 'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(77,215,255,0.08))'
        : 'rgba(15,19,30,0.9)',
      boxShadow: active
        ? '0 0 24px rgba(124,92,255,0.12)'
        : '0 14px 35px rgba(0,0,0,0.18)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
    }),
    accountTop: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    accountInfo: {
      minWidth: 0,
      flex: 1,
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
      padding: '0.28rem 0.48rem',
      borderRadius: '999px',
      background: 'rgba(82,232,170,0.12)',
      border: '1px solid rgba(82,232,170,0.18)',
      color: '#d7ffef',
      fontSize: '0.63rem',
      fontWeight: 850,
    },
    accountMeta: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '0.75rem',
      paddingTop: '0.7rem',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      color: '#8997b3',
      fontSize: '0.68rem',
    },
    metaItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    trusted: {
      color: '#83e9c1',
    },
    untrusted: {
      color: '#ffcf8a',
    },
    cardActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.45rem',
      marginTop: '0.75rem',
    },
    switchButton: {
      flex: 1,
      minHeight: '2.55rem',
      border: 0,
      borderRadius: '999px',
      background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
      color: '#fff',
      fontSize: '0.76rem',
      fontWeight: 850,
      cursor: 'pointer',
    },
    removeButton: {
      width: '2.55rem',
      height: '2.55rem',
      display: 'grid',
      placeItems: 'center',
      borderRadius: '999px',
      border: '1px solid rgba(255,79,122,0.2)',
      background: 'rgba(255,79,122,0.08)',
      color: '#ffadc5',
      cursor: 'pointer',
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
      minHeight: '2.85rem',
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
    emptyState: {
      padding: '1rem',
      borderRadius: '1rem',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      color: '#96a3bf',
      fontSize: '0.8rem',
      lineHeight: 1.5,
      textAlign: 'center',
    },
    footer: {
      width: '100%',
      maxWidth: '560px',
      margin: '0 auto',
      paddingBottom: 'env(safe-area-inset-bottom)',
      color: '#74819c',
      fontSize: '0.7rem',
      lineHeight: 1.45,
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={styles.backButton}
        >
          <ChevronLeft size={18} />
        </button>

        <span style={styles.headerLabel}>Secure account access</span>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroIcon}>
            <ShieldCheck size={31} />
          </div>

          <h1 style={styles.title}>Switch Account</h1>

          <p style={styles.subtitle}>
            Secure account access for this device
          </p>

          <span style={styles.accountCount}>
            <Users size={13} />
            {accounts.length} account{accounts.length === 1 ? '' : 's'} available
          </span>
        </section>

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Available accounts</h2>

          <span style={styles.securityLabel}>
            <Fingerprint size={13} />
            Protected
          </span>
        </div>

        <section style={styles.accountList} aria-label="Available accounts">
          {accounts.length > 0 ? (
            accounts.map((account) => {
              const isSelected = account.id === selectedAccountId;

              return (
                <article
                  key={account.id}
                  style={styles.accountCard(isSelected)}
                >
                  <div style={styles.accountTop}>
                    <AccountAvatar account={account} />

                    <div style={styles.accountInfo}>
                      <div style={styles.username}>
                        {account.username}
                        {account.current ? (
                          <Check size={14} color="#75efbd" />
                        ) : null}
                      </div>

                      <span style={styles.displayName}>
                        {account.displayName}
                      </span>

                      {isSelected ? (
                        <span style={styles.activeBadge}>
                          <Check size={11} />
                          {account.current
                            ? 'Current account'
                            : 'Selected account'}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div style={styles.accountMeta}>
                    <span style={styles.metaItem}>
                      <Clock3 size={13} />
                      {account.lastActive}
                    </span>

                    <span style={styles.metaItem}>
                      <DeviceIcon device={account.device} />
                      {account.device}
                    </span>

                    <span
                      style={{
                        ...styles.metaItem,
                        ...(account.trustedDevice
                          ? styles.trusted
                          : styles.untrusted),
                      }}
                    >
                      <ShieldCheck size={13} />
                      {account.trustedDevice
                        ? 'Trusted device'
                        : 'Verification required'}
                    </span>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() => handleSwitchAccount(account)}
                      style={{
                        ...styles.switchButton,
                        opacity: isSelected ? 0.62 : 1,
                        cursor: isSelected ? 'default' : 'pointer',
                      }}
                      disabled={isSelected}
                    >
                      {isSelected ? 'Selected' : 'Switch account'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveAccount(account)}
                      aria-label={`Remove ${account.username} from this device`}
                      style={styles.removeButton}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div style={styles.emptyState}>
              No additional accounts are currently available on this device.
            </div>
          )}
        </section>

        {message ? (
          <div role="status" style={styles.message}>
            {message}
          </div>
        ) : null}

        <section style={styles.actions}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={styles.primaryButton}
          >
            <Plus size={17} />
            Add Another Account
          </button>

          <button
            type="button"
            onClick={() => navigate('/signup')}
            style={styles.secondaryButton}
          >
            <UserPlus size={16} />
            Create New Account
          </button>

          <button
            type="button"
            onClick={() => navigate('/session-management')}
            style={styles.secondaryButton}
          >
            <LogIn size={16} />
            Manage Sessions
          </button>

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
        Future biometric, PIN, and face verification can be connected through
        the existing security session layer.
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