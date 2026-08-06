import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Eye,
  FileText,
  Globe2,
  Laptop,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  MonitorSmartphone,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Users,
  X,
} from 'lucide-react';

const profileVisitors = [
  {
    id: 'visitor-1',
    username: 'arush.dev',
    avatar: 'A',
    time: '8:42 PM',
    date: 'Today',
    source: 'Search',
    following: true,
  },
  {
    id: 'visitor-2',
    username: 'creator.lab',
    avatar: 'C',
    time: '3:12 PM',
    date: 'Yesterday',
    source: 'Reels',
    following: false,
  },
  {
    id: 'visitor-3',
    username: 'design.loop',
    avatar: 'D',
    time: '11:28 AM',
    date: '2 days ago',
    source: 'Story',
    following: true,
  },
  {
    id: 'visitor-4',
    username: 'motion.frame',
    avatar: 'M',
    time: '9:14 PM',
    date: '3 days ago',
    source: 'Direct',
    following: false,
  },
];

const downloadActivity = [
  {
    id: 'download-1',
    username: 'You',
    type: 'Account Export',
    time: '10:20 AM',
    date: 'Today',
    device: 'Windows Laptop',
    status: 'Completed',
  },
  {
    id: 'download-2',
    username: 'You',
    type: 'Media Backup',
    time: '6:45 PM',
    date: 'Yesterday',
    device: 'Android Phone',
    status: 'Completed',
  },
  {
    id: 'download-3',
    username: 'Admin Verification',
    type: 'Security Report',
    time: '2:10 PM',
    date: 'August 2, 2026',
    device: 'Aarush Security',
    status: 'Verified',
  },
];

const loginHistory = [
  {
    id: 'login-1',
    device: 'Windows Laptop',
    type: 'Desktop',
    os: 'Windows 11',
    browser: 'Chrome',
    location: 'Ghaziabad, India',
    ip: '103.***.***.42',
    time: '8:12 AM',
    date: 'Today',
    method: 'Google OAuth',
    current: true,
  },
  {
    id: 'login-2',
    device: 'Android Phone',
    type: 'Mobile',
    os: 'Android 15',
    browser: 'Chrome Mobile',
    location: 'Noida, India',
    ip: '49.***.***.81',
    time: 'Yesterday, 7:44 PM',
    date: 'August 5, 2026',
    method: 'Email login',
    current: false,
  },
  {
    id: 'login-3',
    device: 'iPhone',
    type: 'Mobile',
    os: 'iOS 18',
    browser: 'Safari',
    location: 'Delhi NCR',
    ip: '117.***.***.19',
    time: 'August 2, 10:18 AM',
    date: 'August 2, 2026',
    method: 'Two-factor authentication',
    current: false,
  },
];

const logoutHistory = [
  {
    id: 'logout-1',
    device: 'Android Phone',
    time: '6:24 PM',
    date: 'Yesterday',
    reason: 'Manual logout',
  },
  {
    id: 'logout-2',
    device: 'Unknown Browser',
    time: '9:12 AM',
    date: 'August 3, 2026',
    reason: 'Logout from another device',
  },
  {
    id: 'logout-3',
    device: 'iPhone',
    time: '11:05 PM',
    date: 'July 31, 2026',
    reason: 'Session expired',
  },
];

const initialDevices = [
  {
    id: 'device-1',
    name: 'Windows Laptop',
    type: 'Desktop',
    os: 'Windows 11',
    browser: 'Chrome',
    loginTime: 'Today, 8:12 AM',
    lastActivity: 'Active now',
    location: 'Ghaziabad, India',
    current: true,
    trusted: true,
  },
  {
    id: 'device-2',
    name: 'Android Phone',
    type: 'Mobile',
    os: 'Android 15',
    browser: 'Chrome Mobile',
    loginTime: 'Yesterday, 7:44 PM',
    lastActivity: '18 minutes ago',
    location: 'Noida, India',
    current: false,
    trusted: false,
  },
];

const securityEvents = [
  {
    id: 'event-1',
    title: 'New login detected',
    description: 'A new login was recorded on your Windows Laptop.',
    time: '8:12 AM',
    date: 'Today',
    severity: 'success',
    status: 'Reviewed',
  },
  {
    id: 'event-2',
    title: 'Two-factor authentication enabled',
    description: 'Your account has an additional authentication layer.',
    time: 'Yesterday',
    date: 'August 5, 2026',
    severity: 'success',
    status: 'Secure',
  },
  {
    id: 'event-3',
    title: 'Screenshot detected',
    description: 'Screenshot protection was triggered on a protected screen.',
    time: '4:25 PM',
    date: 'August 4, 2026',
    severity: 'warning',
    status: 'Protected',
  },
  {
    id: 'event-4',
    title: 'Session revoked',
    description: 'An old mobile session was revoked from Security Center.',
    time: '10:04 AM',
    date: 'August 3, 2026',
    severity: 'danger',
    status: 'Completed',
  },
  {
    id: 'event-5',
    title: 'Gaze Lock enabled',
    description: 'Gaze Lock protection was enabled on your account.',
    time: '8:30 PM',
    date: 'August 1, 2026',
    severity: 'success',
    status: 'Active',
  },
];

const systemStatuses = [
  ['Login Activity Tracking', 'Active'],
  ['Session Security Engine', 'Active'],
  ['Device Trust Engine', 'Syncing'],
  ['Privacy Permission Engine', 'Active'],
  ['Screenshot Detection', 'Active'],
  ['Screen Recording Detection', 'Inactive'],
  ['Realtime Session Sync', 'Syncing'],
  ['Notification Preference Sync', 'Active'],
  ['Analytics Collection', 'Active'],
  ['Profile Synchronization', 'Active'],
];

function Avatar({ letter }) {
  return (
    <div
      style={{
        width: '2.85rem',
        height: '2.85rem',
        borderRadius: '999px',
        padding: '2.5px',
        background: 'linear-gradient(135deg, #7c5cff, #ff4fd8 48%, #4dd7ff)',
        boxShadow: '0 0 16px rgba(124,92,255,0.17)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, #151a28, #252d48)',
          color: '#fff',
          fontWeight: 900,
        }}
      >
        {letter}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    Active: {
      color: '#d7ffef',
      background: 'rgba(82,232,170,0.12)',
      border: 'rgba(82,232,170,0.18)',
    },
    Completed: {
      color: '#d7ffef',
      background: 'rgba(82,232,170,0.12)',
      border: 'rgba(82,232,170,0.18)',
    },
    Secure: {
      color: '#d7ffef',
      background: 'rgba(82,232,170,0.12)',
      border: 'rgba(82,232,170,0.18)',
    },
    Reviewed: {
      color: '#c9f5ff',
      background: 'rgba(77,215,255,0.1)',
      border: 'rgba(77,215,255,0.16)',
    },
    Protected: {
      color: '#ffdda4',
      background: 'rgba(255,179,71,0.12)',
      border: 'rgba(255,179,71,0.18)',
    },
    Verified: {
      color: '#c9f5ff',
      background: 'rgba(77,215,255,0.1)',
      border: 'rgba(77,215,255,0.16)',
    },
    Inactive: {
      color: '#ffb1c8',
      background: 'rgba(255,79,122,0.1)',
      border: 'rgba(255,79,122,0.16)',
    },
    Syncing: {
      color: '#dce5ff',
      background: 'rgba(124,92,255,0.14)',
      border: 'rgba(124,92,255,0.18)',
    },
  };

  const current = config[status] || config.Inactive;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        width: 'fit-content',
        padding: '0.34rem 0.52rem',
        borderRadius: '999px',
        background: current.background,
        border: `1px solid ${current.border}`,
        color: current.color,
        fontSize: '0.68rem',
        fontWeight: 850,
        whiteSpace: 'nowrap',
      }}
    >
      {status === 'Syncing' ? <RefreshCw size={11} /> : <Check size={11} />}
      {status}
    </span>
  );
}

function Section({ title, description, icon: Icon, children, action }) {
  return (
    <section
      style={{
        padding: '0.95rem',
        borderRadius: '1.3rem',
        background: 'rgba(15,19,30,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
          <span
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.75rem',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
              color: '#dce8ff',
              flexShrink: 0,
            }}
          >
            <Icon size={15} />
          </span>

          <span>
            <h2
              style={{
                margin: 0,
                color: '#f5f8ff',
                fontSize: '0.98rem',
                fontWeight: 850,
              }}
            >
              {title}
            </h2>

            {description ? (
              <p
                style={{
                  margin: '0.25rem 0 0',
                  color: '#8e9bb7',
                  fontSize: '0.74rem',
                  lineHeight: 1.45,
                }}
              >
                {description}
              </p>
            ) : null}
          </span>
        </div>

        {action || null}
      </div>

      <div style={{ display: 'grid', gap: '0.6rem' }}>{children}</div>
    </section>
  );
}

function OverviewCard({ label, value, icon: Icon, tone = 'default' }) {
  const colors = {
    default: ['rgba(124,92,255,0.2)', '#dce5ff'],
    success: ['rgba(82,232,170,0.14)', '#d7ffef'],
    warning: ['rgba(255,179,71,0.14)', '#ffdda4'],
    danger: ['rgba(255,79,122,0.14)', '#ffb1c8'],
  };

  return (
    <div
      style={{
        padding: '0.8rem',
        borderRadius: '1rem',
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.7rem',
          display: 'grid',
          placeItems: 'center',
          background: colors[tone][0],
          color: colors[tone][1],
        }}
      >
        <Icon size={15} />
      </span>

      <strong
        style={{
          display: 'block',
          marginTop: '0.5rem',
          color: colors[tone][1],
          fontSize: '0.94rem',
        }}
      >
        {value}
      </strong>

      <span
        style={{
          display: 'block',
          marginTop: '0.18rem',
          color: '#8996b2',
          fontSize: '0.7rem',
          lineHeight: 1.35,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.7rem',
        padding: '0.72rem',
        borderRadius: '0.9rem',
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.07)',
        color: '#dce5f8',
        fontSize: '0.8rem',
        fontWeight: 750,
        cursor: 'pointer',
      }}
    >
      <span>{label}</span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />

      <span
        style={{
          width: '2.7rem',
          height: '1.5rem',
          borderRadius: '999px',
          padding: '0.16rem',
          display: 'flex',
          justifyContent: checked ? 'flex-end' : 'flex-start',
          background: checked
            ? 'linear-gradient(90deg, #7c5cff, #4dd7ff)'
            : 'rgba(255,255,255,0.13)',
          transition: 'background 180ms ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: '1.18rem',
            height: '1.18rem',
            borderRadius: '999px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.24)',
          }}
        />
      </span>
    </label>
  );
}

export default function PrivacyDashboard() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState(initialDevices);
  const [showAllVisitors, setShowAllVisitors] = useState(false);
  const [message, setMessage] = useState('');
  const [notificationState, setNotificationState] = useState({
    loginAlerts: true,
    newDeviceAlerts: true,
    dataDownloadAlerts: true,
    screenshotAlerts: true,
    screenRecordingAlerts: false,
    emergencyPrivacyAlerts: true,
  });

  const [privacyScore] = useState(92);

  const visibleVisitors = showAllVisitors
    ? profileVisitors
    : profileVisitors.slice(0, 3);

  const scoreLabel =
    privacyScore >= 90
      ? 'Excellent'
      : privacyScore >= 75
        ? 'Good'
        : privacyScore >= 55
          ? 'Moderate'
          : 'Needs Attention';

  const logoutDevice = (device) => {
    if (device.current) {
      setMessage('The current protected device cannot be logged out here.');
      return;
    }

    setDevices((current) =>
      current.filter((item) => item.id !== device.id)
    );
    setMessage(`${device.name} has been logged out.`);
  };

  const trustDevice = (device) => {
    setDevices((current) =>
      current.map((item) =>
        item.id === device.id ? { ...item, trusted: true } : item
      )
    );
    setMessage(`${device.name} is now trusted.`);
  };

  const styles = {
    page: {
      minHeight: '100vh',
      paddingBottom: '6.8rem',
      background:
        'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
      color: '#f4f7ff',
    },
    main: {
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0.9rem 0.9rem 0',
      display: 'grid',
      gap: '0.9rem',
    },
    topRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.7rem',
    },
    iconButton: {
      width: '2.65rem',
      height: '2.65rem',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
    },
    hero: {
      position: 'relative',
      overflow: 'hidden',
      padding: '1.25rem',
      borderRadius: '1.5rem',
      background:
        'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.1) 52%, rgba(255,79,216,0.08))',
      border: '1px solid rgba(124,92,255,0.24)',
      boxShadow: '0 24px 70px rgba(0,0,0,0.3), 0 0 34px rgba(124,92,255,0.12)',
    },
    heroContent: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    heroIcon: {
      width: '4.8rem',
      height: '4.8rem',
      borderRadius: '1.4rem',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
      color: '#fff',
      boxShadow: '0 0 30px rgba(77,215,255,0.22)',
      flexShrink: 0,
    },
    score: {
      position: 'relative',
      width: '7rem',
      height: '7rem',
      marginLeft: 'auto',
      borderRadius: '999px',
      display: 'grid',
      placeItems: 'center',
      background: `conic-gradient(#4dd7ff ${privacyScore}%, rgba(255,255,255,0.12) ${privacyScore}% 100%)`,
      flexShrink: 0,
    },
    scoreInner: {
      width: '5.8rem',
      height: '5.8rem',
      borderRadius: '999px',
      display: 'grid',
      placeItems: 'center',
      alignContent: 'center',
      background: '#111827',
      color: '#fff',
      textAlign: 'center',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '0.55rem',
    },
    list: {
      display: 'grid',
      gap: '0.55rem',
    },
    visitor: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      padding: '0.75rem',
      borderRadius: '1rem',
      background: 'rgba(255,255,255,0.045)',
      border: '1px solid rgba(255,255,255,0.07)',
    },
    smallButton: {
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.05)',
      color: '#dce5f8',
      padding: '0.55rem 0.7rem',
      fontSize: '0.72rem',
      fontWeight: 800,
      cursor: 'pointer',
    },
    deviceCard: {
      display: 'grid',
      gap: '0.7rem',
      padding: '0.85rem',
      borderRadius: '1rem',
      background: 'rgba(255,255,255,0.045)',
      border: '1px solid rgba(255,255,255,0.07)',
    },
    deviceHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.7rem',
    },
    deviceIcon: {
      width: '2.65rem',
      height: '2.65rem',
      borderRadius: '0.85rem',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
      color: '#dce8ff',
      flexShrink: 0,
    },
    actionRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.45rem',
    },
    event: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.65rem',
      padding: '0.75rem',
      borderRadius: '1rem',
      background: 'rgba(255,255,255,0.045)',
      border: '1px solid rgba(255,255,255,0.07)',
    },
    eventIcon: (severity) => ({
      width: '2.2rem',
      height: '2.2rem',
      borderRadius: '0.75rem',
      display: 'grid',
      placeItems: 'center',
      background:
        severity === 'danger'
          ? 'rgba(255,79,122,0.14)'
          : severity === 'warning'
            ? 'rgba(255,179,71,0.14)'
            : 'rgba(82,232,170,0.12)',
      color:
        severity === 'danger'
          ? '#ff9dbd'
          : severity === 'warning'
            ? '#ffdda4'
            : '#d7ffef',
      flexShrink: 0,
    }),
  };

  return (
    <div style={styles.page}>
      <TopBar pageTitle="Privacy Dashboard" notificationCount={3} />

      <main style={styles.main}>
        <div style={styles.topRow}>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            style={styles.iconButton}
            aria-label="Back to profile"
          >
            <ArrowLeft size={18} />
          </button>

          <span
            style={{
              color: '#aab6cf',
              fontSize: '0.78rem',
              fontWeight: 750,
            }}
          >
            Privacy and security monitoring
          </span>

          <button
            type="button"
            onClick={() => setMessage('Privacy dashboard refreshed.')}
            style={styles.iconButton}
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <section style={styles.hero}>
          <div
            style={{
              position: 'absolute',
              right: '-3rem',
              bottom: '-3.5rem',
              width: '12rem',
              height: '12rem',
              borderRadius: '999px',
              background: 'rgba(77,215,255,0.12)',
              filter: 'blur(2.2rem)',
              pointerEvents: 'none',
            }}
          />

          <div style={styles.heroContent}>
            <div style={styles.heroIcon}>
              <ShieldCheck size={34} />
            </div>

            <div style={{ flex: 1 }}>
              <h1
                style={{
                  margin: 0,
                  color: '#f7f9ff',
                  fontSize: '1.22rem',
                  lineHeight: 1.2,
                }}
              >
                Privacy & Security Dashboard
              </h1>

              <p
                style={{
                  margin: '0.5rem 0 0',
                  color: '#d5e0f5',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                }}
              >
                Monitor who accessed your account, profile, and personal data.
              </p>
            </div>

            <div style={styles.score}>
              <div style={styles.scoreInner}>
                <strong style={{ fontSize: '1.1rem' }}>{privacyScore}</strong>
                <span style={{ color: '#8e9bb7', fontSize: '0.65rem' }}>/ 100</span>
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.42rem 0.6rem',
                borderRadius: '999px',
                background: 'rgba(82,232,170,0.12)',
                border: '1px solid rgba(82,232,170,0.18)',
                color: '#d7ffef',
                fontSize: '0.72rem',
                fontWeight: 850,
              }}
            >
              <CheckCircle2 size={13} />
              {scoreLabel}
            </span>

            <span
              style={{
                color: '#9caac4',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              Your privacy settings are protecting most account surfaces.
            </span>
          </div>
        </section>

        <Section
          title="Quick Overview"
          description="A summary of recent account, session, and privacy activity."
          icon={Activity}
        >
          <div style={styles.grid}>
            <OverviewCard label="Profile Views" value="12,840" icon={Eye} />
            <OverviewCard label="Data Downloads" value="3" icon={Download} tone="success" />
            <OverviewCard label="Login Events" value="27" icon={LogIn} />
            <OverviewCard label="Active Devices" value={String(devices.length)} icon={MonitorSmartphone} />
            <OverviewCard label="Security Alerts" value="1" icon={ShieldAlert} tone="warning" />
            <OverviewCard label="Protected Sessions" value="5" icon={Lock} tone="success" />
          </div>
        </Section>

        <Section
          title="Who Viewed Your Profile"
          description="Shows which accounts viewed your profile recently."
          icon={Eye}
          action={
            <button
              type="button"
              onClick={() => setShowAllVisitors((current) => !current)}
              style={styles.smallButton}
            >
              {showAllVisitors ? 'Show Less' : 'View All'}
            </button>
          }
        >
          <div style={styles.list}>
            {visibleVisitors.map((visitor) => (
              <div key={visitor.id} style={styles.visitor}>
                <Avatar letter={visitor.avatar} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#edf3ff',
                      fontSize: '0.82rem',
                    }}
                  >
                    {visitor.username}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.2rem',
                      color: '#8e9bb7',
                      fontSize: '0.7rem',
                    }}
                  >
                    {visitor.date} · {visitor.time}
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      marginTop: '0.3rem',
                      color: '#91a0bc',
                      fontSize: '0.68rem',
                      fontWeight: 750,
                    }}
                  >
                    <Globe2 size={11} />
                    Viewed from {visitor.source}
                  </span>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.35rem 0.48rem',
                    borderRadius: '999px',
                    background: visitor.following
                      ? 'rgba(82,232,170,0.11)'
                      : 'rgba(255,255,255,0.06)',
                    color: visitor.following ? '#d7ffef' : '#a4b0c7',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {visitor.following ? <Check size={11} /> : <UserRound size={11} />}
                  {visitor.following ? 'Following' : 'Not following'}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMessage('Visitor history export has been requested.')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginTop: '0.2rem',
              padding: '0.75rem',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.045)',
              color: '#dce5f8',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <Download size={15} />
            Export Visitor History
          </button>
        </Section>

        <Section
          title="Who Downloaded Your Data"
          description="Displays account and media export activity."
          icon={Download}
          action={
            <button
              type="button"
              onClick={() => setMessage('Full data export request submitted.')}
              style={styles.smallButton}
            >
              Request Export
            </button>
          }
        >
          <div style={styles.list}>
            {downloadActivity.map((item) => (
              <div key={item.id} style={styles.visitor}>
                <span
                  style={{
                    width: '2.45rem',
                    height: '2.45rem',
                    borderRadius: '0.8rem',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
                    color: '#dce8ff',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={16} />
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#edf3ff',
                      fontSize: '0.82rem',
                    }}
                  >
                    {item.username} · {item.type}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.2rem',
                      color: '#8e9bb7',
                      fontSize: '0.7rem',
                    }}
                  >
                    {item.date} · {item.time} · {item.device}
                  </span>
                </div>

                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMessage('Security report download started.')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.75rem',
              border: 0,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 850,
              cursor: 'pointer',
            }}
          >
            <Download size={15} />
            Download Security Report
          </button>
        </Section>

        <Section
          title="Login History"
          description="Records every successful login across devices."
          icon={LogIn}
        >
          <div style={styles.list}>
            {loginHistory.map((login) => (
              <div key={login.id} style={styles.deviceCard}>
                <div style={styles.deviceHeader}>
                  <span style={styles.deviceIcon}>
                    {login.type === 'Mobile' ? (
                      <Smartphone size={17} />
                    ) : (
                      <Laptop size={17} />
                    )}
                  </span>

                  <div style={{ flex: 1 }}>
                    <strong
                      style={{
                        display: 'block',
                        color: '#edf3ff',
                        fontSize: '0.84rem',
                      }}
                    >
                      {login.device}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.2rem',
                        color: '#8e9bb7',
                        fontSize: '0.7rem',
                      }}
                    >
                      {login.os} · {login.browser}
                    </span>
                  </div>

                  {login.current ? <StatusBadge status="Active" /> : null}
                </div>

                <div style={styles.grid}>
                  {[
                    ['Location', login.location],
                    ['Masked IP', login.ip],
                    ['Time', login.time],
                    ['Login method', login.method],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        padding: '0.6rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          color: '#8996b2',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                        }}
                      >
                        {label}
                      </span>
                      <strong
                        style={{
                          display: 'block',
                          marginTop: '0.22rem',
                          color: '#dce5f8',
                          fontSize: '0.72rem',
                        }}
                      >
                        {value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Logout History"
          description="Review how and when previous sessions ended."
          icon={LogOut}
        >
          <div style={styles.list}>
            {logoutHistory.map((item) => (
              <div key={item.id} style={styles.visitor}>
                <span
                  style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    borderRadius: '0.75rem',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255,255,255,0.07)',
                    color: '#a7b4cc',
                  }}
                >
                  <LogOut size={15} />
                </span>

                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', color: '#edf3ff', fontSize: '0.8rem' }}>
                    {item.device}
                  </strong>
                  <span style={{ display: 'block', marginTop: '0.2rem', color: '#8e9bb7', fontSize: '0.7rem' }}>
                    {item.date} · {item.time}
                  </span>
                </div>

                <span style={{ color: '#a2aec7', fontSize: '0.7rem', fontWeight: 750 }}>
                  {item.reason}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Active Devices"
          description="Shows every device currently signed into your account."
          icon={MonitorSmartphone}
        >
          <div style={styles.list}>
            {devices.map((device) => (
              <div key={device.id} style={styles.deviceCard}>
                <div style={styles.deviceHeader}>
                  <span style={styles.deviceIcon}>
                    {device.type === 'Mobile' ? (
                      <Smartphone size={17} />
                    ) : (
                      <Laptop size={17} />
                    )}
                  </span>

                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', color: '#edf3ff', fontSize: '0.84rem' }}>
                      {device.name}
                    </strong>
                    <span style={{ display: 'block', marginTop: '0.2rem', color: '#8e9bb7', fontSize: '0.7rem' }}>
                      {device.os} · {device.browser}
                    </span>
                  </div>

                  {device.current ? <StatusBadge status="Active" /> : null}
                  {device.trusted ? <StatusBadge status="Trusted" /> : null}
                </div>

                <div style={styles.grid}>
                  <div>
                    <span style={{ display: 'block', color: '#8996b2', fontSize: '0.66rem' }}>Login time</span>
                    <strong style={{ display: 'block', marginTop: '0.2rem', color: '#dce5f8', fontSize: '0.72rem' }}>
                      {device.loginTime}
                    </strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#8996b2', fontSize: '0.66rem' }}>Last activity</span>
                    <strong style={{ display: 'block', marginTop: '0.2rem', color: '#dce5f8', fontSize: '0.72rem' }}>
                      {device.lastActivity}
                    </strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#8996b2', fontSize: '0.66rem' }}>Location</span>
                    <strong style={{ display: 'block', marginTop: '0.2rem', color: '#dce5f8', fontSize: '0.72rem' }}>
                      {device.location}
                    </strong>
                  </div>
                </div>

                <div style={styles.actionRow}>
                  <button
                    type="button"
                    onClick={() => logoutDevice(device)}
                    style={{
                      flex: '1 1 8rem',
                      border: '1px solid rgba(255,79,122,0.18)',
                      borderRadius: '999px',
                      background: 'rgba(255,79,122,0.08)',
                      color: '#ffb1c8',
                      padding: '0.62rem 0.7rem',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Logout Device
                  </button>

                  {!device.trusted ? (
                    <button
                      type="button"
                      onClick={() => trustDevice(device)}
                      style={{
                        flex: '1 1 8rem',
                        border: '1px solid rgba(82,232,170,0.18)',
                        borderRadius: '999px',
                        background: 'rgba(82,232,170,0.1)',
                        color: '#d7ffef',
                        padding: '0.62rem 0.7rem',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Trust Device
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setMessage(`${device.name} details opened.`)}
                    style={{
                      flex: '1 1 8rem',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '999px',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#dce5f8',
                      padding: '0.62rem 0.7rem',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Recent Security Events"
          description="Displays important security and privacy events."
          icon={ShieldAlert}
        >
          <div style={styles.list}>
            {securityEvents.map((event) => (
              <div key={event.id} style={styles.event}>
                <span style={styles.eventIcon(event.severity)}>
                  <ShieldAlert size={16} />
                </span>

                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', color: '#edf3ff', fontSize: '0.82rem' }}>
                    {event.title}
                  </strong>

                  <p style={{ margin: '0.25rem 0', color: '#8e9bb7', fontSize: '0.72rem', lineHeight: 1.45 }}>
                    {event.description}
                  </p>

                  <span style={{ color: '#74819c', fontSize: '0.68rem', fontWeight: 700 }}>
                    {event.date} · {event.time}
                  </span>
                </div>

                <StatusBadge
                  status={
                    event.severity === 'danger'
                      ? 'Inactive'
                      : event.severity === 'warning'
                        ? 'Protected'
                        : event.status
                  }
                />
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Session Analytics"
          description="Summarizes account session behavior across devices."
          icon={BarChart3}
        >
          <div style={styles.grid}>
            <OverviewCard label="Total Login Sessions" value="27" icon={LogIn} />
            <OverviewCard label="Average Session Duration" value="42m" icon={Clock3} />
            <OverviewCard label="Longest Session" value="6h 18m" icon={Activity} />
            <OverviewCard label="Shortest Session" value="2m" icon={Clock3} />
            <OverviewCard label="Devices Used This Month" value="4" icon={MonitorSmartphone} />
            <OverviewCard label="New Device This Week" value="1" icon={Smartphone} tone="warning" />
          </div>
        </Section>

        <Section
          title="Quick Privacy Controls"
          description="Open important account protection tools."
          icon={Shield}
        >
          <div style={styles.actionRow}>
            {[
              ['Hide Profile', UserRound],
              ['Lock Chats', Lock],
              ['Disable Incoming Messages', MessageCircleOff],
              ['Logout All Other Devices', LogOut],
              ['Open Emergency Privacy', ShieldAlert],
              ['Open Shoulder Surf', EyeOff],
              ['Open Decoy Vault', Lock],
            ].map(([label, Icon]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (label === 'Open Emergency Privacy') navigate('/emergency-privacy');
                  else if (label === 'Open Shoulder Surf') navigate('/shoulder-surf');
                  else if (label === 'Open Decoy Vault') navigate('/decoy-vault');
                  else setMessage(`${label} control opened.`);
                }}
                style={{
                  flex: '1 1 10rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.72rem 0.65rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.045)',
                  color: '#dce5f8',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </Section>

        <Section
          title="Security Notifications"
          description="Choose which privacy and account security events should alert you."
          icon={Bell}
        >
          <Toggle
            label="Login Alerts"
            checked={notificationState.loginAlerts}
            onChange={(value) =>
              setNotificationState((current) => ({ ...current, loginAlerts: value }))
            }
          />
          <Toggle
            label="New Device Alerts"
            checked={notificationState.newDeviceAlerts}
            onChange={(value) =>
              setNotificationState((current) => ({ ...current, newDeviceAlerts: value }))
            }
          />
          <Toggle
            label="Data Download Alerts"
            checked={notificationState.dataDownloadAlerts}
            onChange={(value) =>
              setNotificationState((current) => ({ ...current, dataDownloadAlerts: value }))
            }
          />
          <Toggle
            label="Screenshot Alerts"
            checked={notificationState.screenshotAlerts}
            onChange={(value) =>
              setNotificationState((current) => ({ ...current, screenshotAlerts: value }))
            }
          />
          <Toggle
            label="Screen Recording Alerts"
            checked={notificationState.screenRecordingAlerts}
            onChange={(value) =>
              setNotificationState((current) => ({ ...current, screenRecordingAlerts: value }))
            }
          />
          <Toggle
            label="Emergency Privacy Alerts"
            checked={notificationState.emergencyPrivacyAlerts}
            onChange={(value) =>
              setNotificationState((current) => ({ ...current, emergencyPrivacyAlerts: value }))
            }
          />
        </Section>

        <Section
          title="Background Privacy Systems"
          description="Live status of background privacy, security, synchronization, and analytics services."
          icon={Settings}
        >
          <div style={styles.list}>
            {systemStatuses.map(([label, status]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.045)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span
                  style={{
                    width: '0.55rem',
                    height: '0.55rem',
                    borderRadius: '999px',
                    background:
                      status === 'Active'
                        ? '#52e8aa'
                        : status === 'Syncing'
                          ? '#a378ff'
                          : '#ff6f9d',
                    boxShadow:
                      status === 'Active'
                        ? '0 0 10px rgba(82,232,170,0.5)'
                        : status === 'Syncing'
                          ? '0 0 10px rgba(163,120,255,0.5)'
                          : '0 0 10px rgba(255,111,157,0.5)',
                    flexShrink: 0,
                  }}
                />

                <span style={{ flex: 1, color: '#dce5f8', fontSize: '0.78rem', fontWeight: 750 }}>
                  {label}
                </span>

                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </Section>

        <section
          style={{
            padding: '0.85rem',
            borderRadius: '1rem',
            background: 'rgba(77,215,255,0.07)',
            border: '1px solid rgba(77,215,255,0.13)',
            color: '#c9f5ff',
            fontSize: '0.76rem',
            lineHeight: 1.55,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginBottom: '0.35rem',
            }}
          >
            <ShieldCheck size={15} />
            Dashboard system status
          </div>

          This dashboard is structured for Supabase-backed profile visitors,
          data exports, login tracking, active sessions, trusted devices,
          security events, notification preferences, privacy analytics,
          optimistic updates, and realtime session synchronization.
        </section>
      </main>

      <BottomNav />

      {message ? (
        <div
          role="status"
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '6.3rem',
            left: '1rem',
            zIndex: 1400,
            width: 'fit-content',
            maxWidth: 'calc(100% - 2rem)',
            margin: '0 auto',
            padding: '0.75rem 0.9rem',
            borderRadius: '999px',
            background: 'rgba(17,22,35,0.96)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#eaf0ff',
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            fontSize: '0.78rem',
            fontWeight: 750,
          }}
        >
          {message}
          <button
            type="button"
            onClick={() => setMessage('')}
            style={{
              marginLeft: '0.6rem',
              border: 0,
              background: 'transparent',
              color: '#aab6cf',
              cursor: 'pointer',
            }}
            aria-label="Dismiss message"
          >
            <X size={13} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MessageCircleOff({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3 21 21M10.4 4.2A8 8 0 0 1 20 14.7L21 21l-6.3-1A8 8 0 0 1 4.1 9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 17.5 3 21l3.5-1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}