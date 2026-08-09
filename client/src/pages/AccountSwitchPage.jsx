import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Copy,
  Database,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const ACCOUNT_KEY = 'aarush_saved_accounts';

const DEFAULT_ACCOUNTS = [
  {
    id: 'account-1',
    username: '@arush.dev',
    displayName: 'Aarush Developer',
    accountType: 'Personal',
    avatarUrl: 'https://i.pravatar.cc/120?img=12',
    lastActive: 'Active now',
    trusted: true,
    verified: true,
    current: true,
    device: 'This device',
  },
  {
    id: 'account-2',
    username: '@aman.satwai',
    displayName: 'Aman Satwai',
    accountType: 'Personal',
    avatarUrl: 'https://i.pravatar.cc/120?img=11',
    lastActive: '18 minutes ago',
    trusted: true,
    verified: false,
    current: false,
    device: 'Windows laptop',
  },
  {
    id: 'account-3',
    username: '@creator.lab',
    displayName: 'Creator Lab',
    accountType: 'Creator',
    avatarUrl: 'https://i.pravatar.cc/120?img=32',
    lastActive: 'Yesterday',
    trusted: false,
    verified: false,
    current: false,
    device: 'Android device',
  },
];

function readAccounts() {
  try {
    const saved = localStorage.getItem(ACCOUNT_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export default function AccountSwitchPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState(readAccounts);
  const [toast, setToast] = useState('');

  const currentAccount = useMemo(
    () => accounts.find((account) => account.current),
    [accounts]
  );

  const saveAccounts = (nextAccounts) => {
    setAccounts(nextAccounts);
    localStorage.setItem(
      ACCOUNT_KEY,
      JSON.stringify(nextAccounts)
    );
  };

  const notify = (value) => {
    setToast(value);
    window.setTimeout(() => setToast(''), 2500);
  };

  const switchAccount = (id) => {
    const nextAccounts = accounts.map((account) => ({
      ...account,
      current: account.id === id,
      lastActive:
        account.id === id ? 'Active now' : account.lastActive,
    }));

    saveAccounts(nextAccounts);
    notify('Account switched successfully.');
  };

  const removeAccount = (id) => {
    const account = accounts.find((item) => item.id === id);

    if (account?.current) {
      notify('The current account cannot be removed.');
      return;
    }

    saveAccounts(
      accounts.filter((account) => account.id !== id)
    );
    notify('Saved account removed.');
  };

  const addGuest = () => {
    const guest = {
      id: `guest-${Date.now()}`,
      username: '@guest',
      displayName: 'Guest User',
      accountType: 'Guest',
      avatarUrl: '',
      lastActive: 'Active now',
      trusted: false,
      verified: false,
      current: false,
      device: 'This device',
    };

    saveAccounts([...accounts, guest]);
    notify('Guest account added.');
  };

  const logoutCurrent = () => {
    notify('Current account logout requested.');
    navigate('/logout');
  };

  return (
    <div style={styles.page}>
      <TopBar pageTitle="Switch Account" showBackButton />

      <main style={styles.content}>
        <section style={styles.hero}>
          <span style={styles.heroIcon}>
            <Users size={25} />
          </span>

          <div style={styles.heroCopy}>
            <h1 style={styles.title}>Switch Account</h1>
            <p style={styles.subtitle}>
              Manage multiple Aarush accounts on this device.
            </p>
          </div>
        </section>

        {currentAccount ? (
          <section style={styles.currentCard}>
            <span style={styles.currentLabel}>
              Current Account
            </span>

            <div style={styles.accountRow}>
              <Avatar account={currentAccount} />

              <div style={styles.accountCopy}>
                <strong>{currentAccount.displayName}</strong>
                <span>{currentAccount.username}</span>
                <small>
                  {currentAccount.accountType} ·{' '}
                  {currentAccount.device}
                </small>
              </div>

              <span style={styles.currentBadge}>
                <Check size={12} />
                Current
              </span>
            </div>
          </section>
        ) : null}

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Saved Accounts</h2>

          <div style={styles.accountList}>
            {accounts.map((account) => (
              <div key={account.id} style={styles.accountCard}>
                <Avatar account={account} />

                <div style={styles.accountCopy}>
                  <div style={styles.nameLine}>
                    <strong>{account.displayName}</strong>

                    {account.verified ? (
                      <ShieldCheck
                        size={14}
                        color="#72e3ff"
                      />
                    ) : null}
                  </div>

                  <span>{account.username}</span>
                  <small>
                    {account.accountType} · {account.lastActive}
                  </small>

                  <div style={styles.badgeRow}>
                    {account.trusted ? (
                      <span style={styles.trustedBadge}>
                        Trusted device
                      </span>
                    ) : null}

                    {account.current ? (
                      <span style={styles.currentBadge}>
                        <Check size={12} />
                        Current
                      </span>
                    ) : null}
                  </div>
                </div>

                <div style={styles.accountActions}>
                  {!account.current ? (
                    <button
                      type="button"
                      onClick={() =>
                        switchAccount(account.id)
                      }
                      style={styles.smallButton}
                    >
                      Switch
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      notify('Account details opened.')
                    }
                    style={styles.iconButton}
                    aria-label="View account details"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {!account.current ? (
                    <button
                      type="button"
                      onClick={() =>
                        removeAccount(account.id)
                      }
                      style={styles.deleteButton}
                      aria-label="Remove account"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Account Actions</h2>

          <div style={styles.actionGrid}>
            <Action
              icon={Plus}
              label="Add Existing Account"
              onClick={() => navigate('/login')}
            />

            <Action
              icon={UserRound}
              label="Create New Account"
              onClick={() => navigate('/signup')}
            />

            <Action
              icon={Database}
              label="Import Account"
              onClick={() => notify('Import flow opened.')}
            />

            <Action
              icon={UserRound}
              label="Continue as Guest"
              onClick={addGuest}
            />
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>

          <Action
            icon={RefreshCw}
            label="Open Session Management"
            onClick={() => navigate('/session-management')}
          />

          <Action
            icon={ShieldCheck}
            label="Open Security Center"
            onClick={() => navigate('/security-center')}
          />

          <Action
            icon={ShieldCheck}
            label="Open Privacy Dashboard"
            onClick={() => navigate('/privacy-dashboard')}
          />

          <Action
            icon={LogOut}
            label="Logout Current Account"
            onClick={logoutCurrent}
          />

          <Action
            icon={LogOut}
            label="Logout All Accounts"
            onClick={() =>
              notify('All-account logout requested.')
            }
          />

          <button
            type="button"
            onClick={() =>
              navigator.clipboard?.writeText(
                currentAccount?.username || '@guest'
              )
            }
            style={styles.linkButton}
          >
            <Copy size={15} />
            Copy current account identity
          </button>
        </section>
      </main>

      <BottomNav />

      {toast ? (
        <div role="status" style={styles.toast}>
          {toast}
          <button
            type="button"
            onClick={() => setToast('')}
            style={styles.toastClose}
          >
            <X size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Avatar({ account }) {
  if (account.avatarUrl) {
    return (
      <img
        src={account.avatarUrl}
        alt={`${account.displayName} avatar`}
        style={styles.avatar}
      />
    );
  }

  return (
    <span style={styles.guestAvatar}>
      <UserRound size={21} />
    </span>
  );
}

function Action({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.actionButton}
    >
      <Icon size={16} />
      <span>{label}</span>
      <ChevronRight size={15} />
    </button>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '6.8rem',
    background:
      'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
    color: '#f4f7ff',
  },

  content: {
    width: '100%',
    maxWidth: '820px',
    margin: '0 auto',
    padding: '1rem 0.9rem',
    display: 'grid',
    gap: '0.9rem',
  },

  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  heroIcon: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '1rem',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
  },

  heroCopy: {
    minWidth: 0,
    flex: 1,
  },

  title: {
    margin: 0,
    fontSize: '1.08rem',
    fontWeight: 850,
  },

  subtitle: {
    margin: '0.25rem 0 0',
    color: '#96a3bf',
    fontSize: '0.74rem',
    lineHeight: 1.5,
  },

  currentCard: {
    padding: '1rem',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(15,19,30,0.94))',
    border: '1px solid rgba(124,92,255,0.25)',
  },

  currentLabel: {
    display: 'block',
    marginBottom: '0.65rem',
    color: '#9deeff',
    fontSize: '0.68rem',
    fontWeight: 850,
  },

  card: {
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  sectionTitle: {
    margin: '0 0 0.75rem',
    fontSize: '0.92rem',
    fontWeight: 850,
  },

  accountList: {
    display: 'grid',
    gap: '0.55rem',
  },

  accountCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.7rem',
    borderRadius: '0.95rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
  },

  accountRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },

  avatar: {
    width: '2.8rem',
    height: '2.8rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '999px',
    border: '2px solid rgba(124,92,255,0.4)',
  },

  guestAvatar: {
    width: '2.8rem',
    height: '2.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
  },

  accountCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.18rem',
    flex: 1,
  },

  nameLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },

  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
    marginTop: '0.2rem',
  },

  trustedBadge: {
    padding: '0.2rem 0.35rem',
    borderRadius: '999px',
    background: 'rgba(130,233,193,0.12)',
    color: '#82e9c1',
    fontSize: '0.55rem',
    fontWeight: 800,
  },

  currentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0.2rem 0.35rem',
    borderRadius: '999px',
    background: 'rgba(77,215,255,0.12)',
    color: '#9deeff',
    fontSize: '0.55rem',
    fontWeight: 800,
  },

  accountActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },

  smallButton: {
    minHeight: '1.9rem',
    padding: '0 0.55rem',
    border: '1px solid rgba(124,92,255,0.28)',
    borderRadius: '999px',
    background: 'rgba(124,92,255,0.1)',
    color: '#eaf0ff',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  iconButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.05)',
    color: '#cbd6ec',
    cursor: 'pointer',
  },

  deleteButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,79,122,0.22)',
    borderRadius: '999px',
    background: 'rgba(255,79,122,0.08)',
    color: '#ffb1c8',
    cursor: 'pointer',
  },

  actionGrid: {
    display: 'grid',
    gap: '0.5rem',
  },

  actionButton: {
    width: '100%',
    minHeight: '2.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.65rem 0.7rem',
    border: '1px solid rgba(124,92,255,0.25)',
    borderRadius: '0.8rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.17), rgba(77,215,255,0.08))',
    color: '#eaf0ff',
    textAlign: 'left',
    fontSize: '0.7rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  linkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    marginTop: '0.65rem',
    border: 0,
    background: 'transparent',
    color: '#9deeff',
    fontSize: '0.68rem',
    fontWeight: 750,
    cursor: 'pointer',
  },

  toast: {
    position: 'fixed',
    right: '1rem',
    bottom: '6.2rem',
    left: '1rem',
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    width: 'fit-content',
    maxWidth: 'calc(100% - 2rem)',
    margin: '0 auto',
    padding: '0.75rem 0.9rem',
    borderRadius: '999px',
    background: 'rgba(17,22,35,0.97)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#eaf0ff',
    fontSize: '0.72rem',
    fontWeight: 750,
  },

  toastClose: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    color: '#aab6cf',
    cursor: 'pointer',
  },
};