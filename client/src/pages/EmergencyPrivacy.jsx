import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellOff,
  CheckCircle2,
  EyeOff,
  FileDown,
  Lock,
  LockKeyhole,
  LogOut,
  MessageCircle,
  MonitorDown,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserRound,
  Users,
  VideoOff,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const EMERGENCY_KEY = 'aarush_emergency_privacy_enabled';

const MODULES = [
  ['App Lock', LockKeyhole],
  ['Gaze Lock', EyeOff],
  ['One Tap Lock', Lock],
  ['Shoulder Surf', EyeOff],
  ['Screenshot Shield', ShieldCheck],
  ['Screen Recording Protection', MonitorDown],
  ['Chat Lock', MessageCircle],
  ['Story Lock', Shield],
  ['Profile Lock', UserRound],
  ['Notification Lock', BellOff],
  ['Session Lock', Smartphone],
];

const TIMELINE = [
  ['Emergency activated', 'Today', '08:12 AM', 'Active'],
  ['Screenshot blocked', 'Yesterday', '06:20 PM', 'Protected'],
  ['Recording blocked', 'May 18, 2026', '06:18 PM', 'Protected'],
  ['Shoulder Surf activated', 'May 17, 2026', '04:32 PM', 'Active'],
  ['Session locked', 'May 17, 2026', '04:30 PM', 'Completed'],
  ['Profile hidden', 'May 17, 2026', '04:29 PM', 'Completed'],
  ['Notifications disabled', 'May 17, 2026', '04:29 PM', 'Completed'],
];

const SYSTEMS = [
  ['Emergency Lock Engine', 'Active'],
  ['Privacy Lock Engine', 'Active'],
  ['Session Security Engine', 'Active'],
  ['Screenshot Protection', 'Active'],
  ['Recording Protection', 'Active'],
  ['Device Trust Engine', 'Active'],
  ['Notification Suppression', 'Syncing'],
  ['Profile Visibility Engine', 'Active'],
];

function Section({ title, icon: Icon, children }) {
  return (
    <section style={styles.card}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionIcon}>
          <Icon size={17} />
        </span>
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Action({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} style={styles.action}>
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

export default function EmergencyPrivacy() {
  const navigate = useNavigate();
  const [active, setActive] = useState(() =>
    localStorage.getItem(EMERGENCY_KEY) === 'true'
  );
  const [toast, setToast] = useState('');

  const status = useMemo(() => {
    return active ? 'Active' : 'Ready';
  }, [active]);

  const showToast = (value) => {
    setToast(value);
    window.setTimeout(() => setToast(''), 2500);
  };

  const activate = () => {
    setActive(true);
    localStorage.setItem(EMERGENCY_KEY, 'true');

    localStorage.setItem(
      'aarush_app_lock_enabled',
      'true'
    );
    localStorage.setItem(
      'aarush_gaze_lock_enabled',
      'true'
    );
    localStorage.setItem(
      'aarush_one_tap_lock_enabled',
      'true'
    );
    localStorage.setItem(
      'aarush_shoulder_surf_enabled',
      'true'
    );
    localStorage.setItem(
      'aarush_screenshot_shield_enabled',
      'true'
    );
    localStorage.setItem(
      'aarush_screen_recording_enabled',
      'true'
    );
    localStorage.setItem(
      'aarush_hide_online_status',
      'true'
    );
    localStorage.setItem(
      'aarush_disable_message_requests',
      'true'
    );
    localStorage.setItem(
      'aarush_chat_lock_enabled',
      'true'
    );
    localStorage.setItem(
      'aarush_profile_hidden',
      'true'
    );
    localStorage.setItem(
      'aarush_story_visibility',
      'only-me'
    );
    localStorage.setItem(
      'aarush_notifications_disabled',
      'true'
    );

    showToast('Emergency Privacy is active.');
  };

  const deactivate = () => {
    setActive(false);
    localStorage.setItem(EMERGENCY_KEY, 'false');
    showToast('Emergency Privacy deactivated.');
  };

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Emergency Privacy"
        showBackButton
        initialGazeLock={active}
        onGazeLockChange={() => {}}
      />

      <main style={styles.content}>
        <section style={styles.hero}>
          <span style={styles.heroIcon}>
            <ShieldAlert size={28} />
          </span>

          <div style={styles.heroCopy}>
            <h1 style={styles.title}>Emergency Privacy</h1>
            <p style={styles.subtitle}>
              Instantly protect your account, chats, profile, and
              personal information with one action.
            </p>
          </div>
        </section>

        <section
          style={{
            ...styles.statusCard,
            ...(active ? styles.activeCard : {}),
          }}
        >
          <div
            style={{
              ...styles.statusCircle,
              ...(active ? styles.activeCircle : {}),
            }}
          >
            {active ? (
              <CheckCircle2 size={35} />
            ) : (
              <Shield size={35} />
            )}
          </div>

          <h2 style={styles.statusTitle}>{status}</h2>

          <p style={styles.statusText}>
            {active
              ? 'Emergency protections are enabled across your account and current device.'
              : 'Emergency Privacy is ready to protect your account instantly.'}
          </p>

          <button
            type="button"
            onClick={active ? deactivate : activate}
            style={styles.primaryButton}
          >
            <ShieldAlert size={17} />
            {active
              ? 'Deactivate Emergency Privacy'
              : 'Activate Emergency Privacy'}
          </button>
        </section>

        <Section title="Active Protection Modules" icon={ShieldCheck}>
          <div style={styles.moduleGrid}>
            {MODULES.map(([label, Icon]) => (
              <div key={label} style={styles.moduleCard}>
                <span style={styles.moduleIcon}>
                  <Icon size={17} />
                </span>

                <span style={styles.moduleName}>{label}</span>

                <span
                  style={{
                    ...styles.moduleStatus,
                    color: active ? '#82e9c1' : '#96a3bf',
                  }}
                >
                  {active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Emergency Actions" icon={ShieldAlert}>
          <Action
            icon={Lock}
            label="Lock Everything"
            onClick={activate}
          />
          <Action
            icon={EyeOff}
            label="Hide Profile"
            onClick={() => {
              localStorage.setItem(
                'aarush_profile_hidden',
                'true'
              );
              showToast('Profile hidden.');
            }}
          />
          <Action
            icon={MessageCircle}
            label="Lock Chats"
            onClick={() => {
              localStorage.setItem(
                'aarush_chat_lock_enabled',
                'true'
              );
              showToast('Chats locked.');
            }}
          />
          <Action
            icon={BellOff}
            label="Disable Notifications"
            onClick={() => {
              localStorage.setItem(
                'aarush_notifications_disabled',
                'true'
              );
              showToast('Notifications disabled.');
            }}
          />
          <Action
            icon={VideoOff}
            label="Disable Incoming Calls"
            onClick={() =>
              showToast('Incoming calls disabled.')
            }
          />
          <Action
            icon={MessageCircle}
            label="Disable Incoming Messages"
            onClick={() =>
              showToast('Incoming messages disabled.')
            }
          />
          <Action
            icon={ShieldCheck}
            label="Open Privacy Dashboard"
            onClick={() => navigate('/privacy-dashboard')}
          />
          <Action
            icon={ShieldCheck}
            label="Open Security Center"
            onClick={() => navigate('/security-center')}
          />
          <Action
            icon={LogOut}
            label="Logout All Devices"
            onClick={() =>
              showToast('Logout all devices requested.')
            }
          />
          <Action
            icon={Smartphone}
            label="Secure Current Device"
            onClick={() =>
              showToast('Current device secured.')
            }
          />
        </Section>

        <Section title="Privacy Timeline" icon={Shield}>
          <div style={styles.timeline}>
            {TIMELINE.map(([title, date, time, state]) => (
              <div key={`${title}-${date}-${time}`} style={styles.timelineRow}>
                <span style={styles.timelineDot} />

                <div style={styles.timelineCopy}>
                  <strong>{title}</strong>
                  <small>
                    {time} · {date} · {state}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Background Systems" icon={SettingsIcon}>
          <div style={styles.systemGrid}>
            {SYSTEMS.map(([name, state]) => (
              <div key={name} style={styles.systemRow}>
                <span style={styles.systemDot} />
                <span>{name}</span>
                <small>{state}</small>
              </div>
            ))}
          </div>
        </Section>
      </main>

      <BottomNav />

      {toast ? (
        <div role="status" style={styles.toast}>
          {toast}
          <button
            type="button"
            onClick={() => setToast('')}
            style={styles.toastClose}
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SettingsIcon(props) {
  return <ShieldCheck {...props} />;
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
      'linear-gradient(135deg, #7c5cff, #ff4f7a)',
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

  statusCard: {
    display: 'grid',
    justifyItems: 'center',
    padding: '1.35rem',
    borderRadius: '1.3rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.16), rgba(15,19,30,0.95))',
    border: '1px solid rgba(124,92,255,0.25)',
    textAlign: 'center',
  },

  activeCard: {
    background:
      'linear-gradient(135deg, rgba(255,79,122,0.15), rgba(15,19,30,0.95))',
    borderColor: 'rgba(255,79,122,0.3)',
  },

  statusCircle: {
    width: '6.5rem',
    height: '6.5rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    background: 'rgba(124,92,255,0.2)',
    border: '3px solid #7c5cff',
    color: '#9deeff',
  },

  activeCircle: {
    background: 'rgba(255,79,122,0.16)',
    borderColor: '#ff789d',
    color: '#ff9fba',
  },

  statusTitle: {
    margin: '0.9rem 0 0',
    fontSize: '1rem',
  },

  statusText: {
    maxWidth: '34rem',
    margin: '0.4rem 0 1rem',
    color: '#96a3bf',
    fontSize: '0.74rem',
    lineHeight: 1.5,
  },

  primaryButton: {
    minHeight: '2.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0 1rem',
    border: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #ff4f7a, #7c5cff)',
    color: '#fff',
    fontSize: '0.76rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  card: {
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    marginBottom: '0.8rem',
  },

  sectionIcon: {
    width: '2.15rem',
    height: '2.15rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '0.7rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))',
    color: '#dce8ff',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '0.92rem',
    fontWeight: 850,
  },

  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.45rem',
  },

  moduleCard: {
    display: 'grid',
    gap: '0.25rem',
    padding: '0.65rem',
    borderRadius: '0.8rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
  },

  moduleIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '0.6rem',
    background: 'rgba(124,92,255,0.14)',
    color: '#dce8ff',
  },

  moduleName: {
    color: '#dce5f8',
    fontSize: '0.65rem',
    fontWeight: 750,
  },

  moduleStatus: {
    fontSize: '0.58rem',
    fontWeight: 800,
  },

  action: {
    width: '100%',
    minHeight: '2.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.5rem',
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

  timeline: {
    display: 'grid',
    gap: '0.15rem',
  },

  timelineRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.55rem',
    padding: '0.65rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },

  timelineDot: {
    width: '0.5rem',
    height: '0.5rem',
    marginTop: '0.3rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: '#ff789d',
    boxShadow: '0 0 9px rgba(255,120,157,0.7)',
  },

  timelineCopy: {
    display: 'grid',
    gap: '0.18rem',
  },

  systemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.45rem',
  },

  systemRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.55rem',
    borderRadius: '0.7rem',
    background: 'rgba(255,255,255,0.04)',
  },

  systemDot: {
    width: '0.5rem',
    height: '0.5rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: '#82e9c1',
    boxShadow: '0 0 8px rgba(130,233,193,0.7)',
  },

  toast: {
    position: 'fixed',
    right: '1rem',
    bottom: '6.2rem',
    left: '1rem',
    zIndex: 1200,
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