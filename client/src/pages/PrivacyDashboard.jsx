import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudDownload,
  Database,
  Download,
  Eye,
  FileText,
  Fingerprint,
  Globe2,
  Laptop,
  Link as LinkIcon,
  Lock,
  MapPin,
  MonitorSmartphone,
  Radio,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Users,
  Video,
  Wifi,
} from 'lucide-react';

const profileActivity = [
  {
    id: 'profile-1',
    username: '@arush.dev',
    source: 'Search',
    time: '10:32 AM',
    date: 'Today',
    followStatus: 'Following',
    icon: Search,
  },
  {
    id: 'profile-2',
    username: '@arush.dev',
    source: 'Story',
    time: '9:18 AM',
    date: 'Today',
    followStatus: 'Following',
    icon: Eye,
  },
  {
    id: 'profile-3',
    username: '@arush.dev',
    source: 'Profile Link',
    time: 'Yesterday, 7:42 PM',
    date: 'Yesterday',
    followStatus: 'Not following',
    icon: LinkIcon,
  },
  {
    id: 'profile-4',
    username: '@arush.dev',
    source: 'Reels',
    time: 'Monday, 5:12 PM',
    date: 'Monday',
    followStatus: 'Following',
    icon: Video,
  },
];

const exportActivity = [
  {
    id: 'export-1',
    type: 'Privacy Report',
    device: 'Windows Laptop',
    time: 'Today, 9:40 AM',
    date: 'Today',
    status: 'Ready',
  },
  {
    id: 'export-2',
    type: 'Media Backup',
    device: 'Android Phone',
    time: 'Yesterday, 8:05 PM',
    date: 'Yesterday',
    status: 'Completed',
  },
  {
    id: 'export-3',
    type: 'Account Export',
    device: 'Windows Laptop',
    time: 'Monday, 4:20 PM',
    date: 'Monday',
    status: 'Completed',
  },
];

const loginHistory = [
  {
    id: 'login-1',
    device: 'Windows Laptop',
    type: 'Laptop',
    operatingSystem: 'Windows 11',
    browser: 'Chrome',
    location: 'Ghaziabad, India',
    ip: '103.***.***.42',
    time: '10:42 AM',
    date: 'Today',
    method: 'Password + trusted device',
    icon: Laptop,
  },
  {
    id: 'login-2',
    device: 'Android Phone',
    type: 'Mobile',
    operatingSystem: 'Android 14',
    browser: 'Chrome Mobile',
    location: 'New Delhi, India',
    ip: '49.***.***.18',
    time: 'Yesterday, 8:18 PM',
    date: 'Yesterday',
    method: 'Fingerprint',
    icon: Smartphone,
  },
  {
    id: 'login-3',
    device: 'iPhone',
    type: 'Mobile',
    operatingSystem: 'iOS 18',
    browser: 'Safari',
    location: 'Mumbai, India',
    ip: '117.***.***.90',
    time: 'Monday, 6:04 PM',
    date: 'Monday',
    method: 'OTP verification',
    icon: Smartphone,
  },
];

const logoutHistory = [
  {
    id: 'logout-1',
    device: 'Android Phone',
    time: 'Yesterday, 11:18 PM',
    date: 'Yesterday',
    reason: 'Manual Logout',
  },
  {
    id: 'logout-2',
    device: 'Windows Laptop',
    time: 'Monday, 11:02 PM',
    date: 'Monday',
    reason: 'Session Expired',
  },
  {
    id: 'logout-3',
    device: 'iPhone',
    time: 'Sunday, 4:25 PM',
    date: 'Sunday',
    reason: 'Remote Logout',
  },
];

const activeDevices = [
  {
    id: 'device-1',
    name: 'Windows Laptop',
    type: 'Laptop',
    operatingSystem: 'Windows 11',
    browser: 'Chrome',
    current: true,
    trusted: true,
    loginTime: 'Today, 10:42 AM',
    lastActivity: 'Active now',
    location: 'Ghaziabad, India',
    icon: Laptop,
  },
  {
    id: 'device-2',
    name: 'Android Phone',
    type: 'Mobile',
    operatingSystem: 'Android 14',
    browser: 'Chrome Mobile',
    current: false,
    trusted: true,
    loginTime: 'Yesterday, 8:18 PM',
    lastActivity: '12 minutes ago',
    location: 'New Delhi, India',
    icon: Smartphone,
  },
  {
    id: 'device-3',
    name: 'iPhone',
    type: 'Mobile',
    operatingSystem: 'iOS 18',
    browser: 'Safari',
    current: false,
    trusted: false,
    loginTime: 'Monday, 6:04 PM',
    lastActivity: '2 hours ago',
    location: 'Mumbai, India',
    icon: Smartphone,
  },
];

const privacyEvents = [
  {
    id: 'event-1',
    title: 'New login detected',
    description: 'A Windows Laptop signed in from Ghaziabad, India.',
    time: '10:42 AM',
    date: 'Today',
    severity: 'Green',
    status: 'Verified',
  },
  {
    id: 'event-2',
    title: 'Trusted device added',
    description: 'Android Phone was approved for this account.',
    time: 'Yesterday, 8:22 PM',
    date: 'Yesterday',
    severity: 'Yellow',
    status: 'Reviewed',
  },
  {
    id: 'event-3',
    title: 'Privacy settings changed',
    description: 'Hidden notification content was enabled.',
    time: 'Yesterday, 7:50 PM',
    date: 'Yesterday',
    severity: 'Green',
    status: 'Protected',
  },
  {
    id: 'event-4',
    title: 'Shoulder Surf Protection activated',
    description: 'Visual privacy protection was enabled.',
    time: 'Monday, 5:15 PM',
    date: 'Monday',
    severity: 'Green',
    status: 'Active',
  },
  {
    id: 'event-5',
    title: 'Session revoked',
    description: 'An older iPhone session was remotely revoked.',
    time: 'Sunday, 4:25 PM',
    date: 'Sunday',
    severity: 'Red',
    status: 'Resolved',
  },
];

const backgroundSystems = [
  ['Login Activity Tracking', 'Active', Activity],
  ['Session Analytics Engine', 'Active', BarChart3],
  ['Device Trust Engine', 'Active', MonitorSmartphone],
  ['Privacy Permission Engine', 'Active', ShieldCheck],
  ['Screenshot Detection', 'Future', Eye],
  ['Screen Recording Detection', 'Future', Video],
  ['Realtime Session Sync', 'Syncing', RefreshCw],
  ['Notification Sync', 'Active', Bell],
  ['Privacy Analytics', 'Active', BarChart3],
  ['Profile Synchronization', 'Active', Users],
  ['Data Export Monitoring', 'Active', CloudDownload],
  ['Threat Monitoring', 'Syncing', ShieldAlert],
];

const aiPrivacyItems = [
  {
    title: 'Privacy Advisor',
    description: 'Recommend safer privacy settings for your account.',
    icon: Sparkles,
  },
  {
    title: 'Risk Prediction',
    description: 'Predict unusual privacy and access risks.',
    icon: ShieldAlert,
  },
  {
    title: 'Fake Account Detection',
    description: 'Identify potentially fake or impersonating accounts.',
    icon: UserRound,
  },
  {
    title: 'Deepfake Alert',
    description: 'Detect manipulated or synthetic media.',
    icon: ScanIcon,
  },
  {
    title: 'Scam Conversation Detection',
    description: 'Warn about suspicious conversations and requests.',
    icon: AlertTriangle,
  },
  {
    title: 'Account Threat Detection',
    description: 'Identify possible attacks against the account.',
    icon: ShieldCheck,
  },
  {
    title: 'Privacy Coach',
    description: 'Explain privacy controls in clear language.',
    icon: Fingerprint,
  },
];

function ScanIcon(props) {
  return <Eye {...props} />;
}

function GlassSection({ children }) {
  return (
    <section
      style={{
        marginTop: '0.9rem',
        padding: '1rem',
        borderRadius: '1.25rem',
        background: 'rgba(15,19,30,0.88)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.24)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {children}
    </section>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.65rem',
        marginBottom: '0.8rem',
      }}
    >
      <span
        style={{
          width: '2rem',
          height: '2rem',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '0.75rem',
          background:
            'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
          color: '#dfe7ff',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </span>

      <div>
        <h2
          style={{
            margin: 0,
            color: '#f4f7ff',
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
              fontSize: '0.75rem',
              lineHeight: 1.45,
            }}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const active = status === 'Active';
  const syncing = status === 'Syncing';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.28rem 0.45rem',
        borderRadius: '999px',
        background: active
          ? 'rgba(82,232,170,0.1)'
          : syncing
            ? 'rgba(77,215,255,0.1)'
            : 'rgba(255,179,71,0.1)',
        color: active ? '#8af0c7' : syncing ? '#8edfff' : '#ffd28d',
        fontSize: '0.61rem',
        fontWeight: 800,
      }}
    >
      {syncing ? <RefreshCw size={10} /> : <span>●</span>}
      {status}
    </span>
  );
}

function SeverityDot({ severity }) {
  const color =
    severity === 'Green'
      ? '#72e9b8'
      : severity === 'Yellow'
        ? '#ffd07d'
        : '#ff7f9e';

  return (
    <span
      aria-label={`${severity} severity`}
      style={{
        width: '0.55rem',
        height: '0.55rem',
        borderRadius: '999px',
        background: color,
        boxShadow: `0 0 10px ${color}`,
        flexShrink: 0,
      }}
    />
  );
}

function OverviewCard({ icon: Icon, label, value, description }) {
  return (
    <div
      style={{
        minHeight: '5.2rem',
        padding: '0.75rem',
        borderRadius: '1rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: '#9caac5',
          fontSize: '0.64rem',
          fontWeight: 750,
        }}
      >
        <Icon size={13} />
        {label}
      </span>

      <strong
        style={{
          display: 'block',
          marginTop: '0.4rem',
          color: '#f3f7ff',
          fontSize: '1rem',
          fontWeight: 900,
        }}
      >
        {value}
      </strong>

      <span
        style={{
          display: 'block',
          marginTop: '0.2rem',
          color: '#7f8ca7',
          fontSize: '0.61rem',
        }}
      >
        {description}
      </span>
    </div>
  );
}

function ActionButton({ icon: Icon, children, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: '2.7rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.35rem',
        border: danger
          ? '1px solid rgba(255,79,122,0.22)'
          : '1px solid rgba(255,255,255,0.09)',
        borderRadius: '999px',
        background: danger
          ? 'rgba(255,79,122,0.09)'
          : 'rgba(255,255,255,0.05)',
        color: danger ? '#ffb2c8' : '#dce5f8',
        fontSize: '0.72rem',
        fontWeight: 800,
        cursor: 'pointer',
      }}
    >
      <Icon size={14} />
      {children}
    </button>
  );
}

export default function PrivacyDashboard() {
  const navigate = useNavigate();
  const [controls, setControls] = useState({
    hideProfile: false,
    lockChats: true,
    incomingMessages: false,
    onlineStatus: true,
    lastSeen: true,
    readReceipts: true,
    loginAlerts: true,
    newDeviceAlerts: true,
    dataExportAlerts: true,
    screenshotAlerts: true,
    recordingAlerts: true,
    reportAlerts: true,
    securityAlerts: true,
  });
  const [message, setMessage] = useState('');

  const privacyScore = useMemo(() => {
    const enabledControls = Object.values(controls).filter(Boolean).length;
    return Math.min(100, 84 + enabledControls);
  }, [controls]);

  const privacyLevel =
    privacyScore >= 90
      ? 'Excellent'
      : privacyScore >= 75
        ? 'Strong'
        : privacyScore >= 55
          ? 'Moderate'
          : 'Weak';

  const updateControl = (id) => {
    setControls((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '7rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.48) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <TopBar
        pageTitle="Privacy Dashboard"
        onChatClick={() => navigate('/chats')}
        onOneTapLock={() => navigate('/lock')}
      />

      <main
        style={{
          width: '100%',
          maxWidth: '760px',
          margin: '0 auto',
          padding: '0.9rem',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '0.8rem',
            padding: '0.35rem 0.55rem',
            border: 0,
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.05)',
            color: '#aebbd5',
            fontSize: '0.72rem',
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={15} />
          Back
        </button>

        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '1.25rem',
            borderRadius: '1.5rem',
            background:
              'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.1), rgba(255,79,216,0.08))',
            border: '1px solid rgba(124,92,255,0.25)',
            boxShadow:
              '0 24px 70px rgba(0,0,0,0.32), 0 0 32px rgba(124,92,255,0.1)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.8rem',
            }}
          >
            <div
              style={{
                width: '3.6rem',
                height: '3.6rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '1.15rem',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                boxShadow: '0 0 30px rgba(77,215,255,0.25)',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <Eye size={29} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  color: '#f8faff',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  letterSpacing: '-0.025em',
                }}
              >
                Privacy &amp; Activity Dashboard
              </h1>

              <p
                style={{
                  margin: '0.45rem 0 0',
                  color: '#c1cce2',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                }}
              >
                Monitor account access, profile activity, devices, and privacy
                events from one secure place.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1.2rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: '6.4rem',
                height: '6.4rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '999px',
                background: `conic-gradient(#61e8b4 ${privacyScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '5.25rem',
                  height: '5.25rem',
                  display: 'grid',
                  placeItems: 'center',
                  alignContent: 'center',
                  borderRadius: '999px',
                  background: '#111827',
                  textAlign: 'center',
                }}
              >
                <strong
                  style={{
                    color: '#f7fbff',
                    fontSize: '1.15rem',
                    lineHeight: 1,
                  }}
                >
                  {privacyScore}
                </strong>

                <span
                  style={{
                    marginTop: '0.22rem',
                    color: '#91a0bd',
                    fontSize: '0.6rem',
                  }}
                >
                  / 100
                </span>
              </div>
            </div>

            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: '#83edc1',
                  fontSize: '0.8rem',
                  fontWeight: 850,
                }}
              >
                <Check size={14} />
                {privacyLevel}
              </span>

              <p
                style={{
                  margin: '0.38rem 0 0',
                  color: '#aab7d0',
                  fontSize: '0.72rem',
                  lineHeight: 1.5,
                }}
              >
                Your privacy controls are well configured. Review activity
                regularly to keep your account protected.
              </p>
            </div>
          </div>
        </section>

        <GlassSection>
          <SectionHeader
            icon={BarChart3}
            title="Quick Overview"
            description="A summary of recent account activity and protection coverage."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
              gap: '0.5rem',
            }}
          >
            <OverviewCard
              icon={Eye}
              label="Profile Views"
              value="1,284"
              description="Last 30 days"
            />
            <OverviewCard
              icon={Download}
              label="Data Exports"
              value="3"
              description="Recent exports"
            />
            <OverviewCard
              icon={ShieldCheck}
              label="Login Events"
              value="18"
              description="This month"
            />
            <OverviewCard
              icon={MonitorSmartphone}
              label="Active Devices"
              value="3"
              description="Current sessions"
            />
            <OverviewCard
              icon={ShieldAlert}
              label="Security Alerts"
              value="2"
              description="1 requires review"
            />
            <OverviewCard
              icon={Lock}
              label="Protected Sessions"
              value="3 / 3"
              description="Session coverage"
            />
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Eye}
            title="Profile Activity"
            description="Shows recent visibility events related to your profile."
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {profileActivity.map((event) => {
              const Icon = event.icon;

              return (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.7rem',
                    borderRadius: '0.9rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span
                    style={{
                      width: '2.2rem',
                      height: '2.2rem',
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '0.75rem',
                      background: 'rgba(124,92,255,0.12)',
                      color: '#c5baff',
                    }}
                  >
                    <Icon size={16} />
                  </span>

                  <span style={{ minWidth: 0, flex: 1 }}>
                    <strong
                      style={{
                        display: 'block',
                        color: '#eaf0ff',
                        fontSize: '0.74rem',
                        fontWeight: 850,
                      }}
                    >
                      {event.username} · {event.source}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.2rem',
                        color: '#8a98b4',
                        fontSize: '0.64rem',
                      }}
                    >
                      {event.date} · {event.time}
                    </span>
                  </span>

                  <span
                    style={{
                      color: event.followStatus === 'Following'
                        ? '#83e9c1'
                        : '#a9b6d0',
                      fontSize: '0.61rem',
                      fontWeight: 800,
                    }}
                  >
                    {event.followStatus}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginTop: '0.7rem',
            }}
          >
            <ActionButton
              icon={Activity}
              onClick={() =>
                showMessage('Full profile activity is ready for backend integration.')
              }
            >
              View Full Activity
            </ActionButton>

            <ActionButton
              icon={Download}
              onClick={() =>
                showMessage('Activity history export is ready for backend integration.')
              }
            >
              Export Activity History
            </ActionButton>
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={CloudDownload}
            title="Data Export Activity"
            description="Displays account and media export activity."
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {exportActivity.map((event) => (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '0.75rem',
                    background: 'rgba(77,215,255,0.1)',
                    color: '#a3eaff',
                  }}
                >
                  <Database size={16} />
                </span>

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#eaf0ff',
                      fontSize: '0.74rem',
                      fontWeight: 850,
                    }}
                  >
                    {event.type}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.2rem',
                      color: '#8a98b4',
                      fontSize: '0.64rem',
                    }}
                  >
                    {event.device} · {event.date} · {event.time}
                  </span>
                </span>

                <span
                  style={{
                    color: '#83e9c1',
                    fontSize: '0.61rem',
                    fontWeight: 800,
                  }}
                >
                  {event.status}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginTop: '0.7rem',
            }}
          >
            <ActionButton
              icon={CloudDownload}
              onClick={() =>
                showMessage('Full data export request is ready for Supabase integration.')
              }
            >
              Request Full Data Export
            </ActionButton>

            <ActionButton
              icon={FileText}
              onClick={() =>
                showMessage('Privacy report download is ready for backend integration.')
              }
            >
              Download Privacy Report
            </ActionButton>
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Fingerprint}
            title="Login History"
            description="Records every successful login across devices."
          />

          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {loginHistory.map((event) => {
              const Icon = event.icon;

              return (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    padding: '0.75rem',
                    borderRadius: '0.95rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span
                    style={{
                      width: '2.2rem',
                      height: '2.2rem',
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '0.75rem',
                      background: 'rgba(124,92,255,0.12)',
                      color: '#c9c0ff',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} />
                  </span>

                  <span style={{ minWidth: 0, flex: 1 }}>
                    <strong
                      style={{
                        display: 'block',
                        color: '#edf2ff',
                        fontSize: '0.75rem',
                        fontWeight: 850,
                      }}
                    >
                      {event.device} · {event.type}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.22rem',
                        color: '#909db8',
                        fontSize: '0.64rem',
                        lineHeight: 1.45,
                      }}
                    >
                      {event.operatingSystem} · {event.browser}
                      <br />
                      {event.location} · IP {event.ip}
                      <br />
                      {event.date} · {event.time} · {event.method}
                    </span>
                  </span>

                  <Check size={14} color="#80e7bb" />
                </div>
              );
            })}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={LogOutIcon}
            title="Logout History"
            description="Review how previous sessions ended."
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {logoutHistory.map((event) => (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Clock3 size={16} color="#a9b7d4" />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#eaf0ff',
                      fontSize: '0.74rem',
                      fontWeight: 850,
                    }}
                  >
                    {event.device}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.2rem',
                      color: '#8a98b4',
                      fontSize: '0.64rem',
                    }}
                  >
                    {event.date} · {event.time}
                  </span>
                </span>

                <span
                  style={{
                    color: '#b6c3dc',
                    fontSize: '0.62rem',
                    fontWeight: 750,
                    textAlign: 'right',
                  }}
                >
                  {event.reason}
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={MonitorSmartphone}
            title="Active Devices"
            description="Shows all devices currently signed into your account."
          />

          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {activeDevices.map((device) => {
              const Icon = device.icon;

              return (
                <div
                  key={device.id}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '1rem',
                    background: device.current
                      ? 'linear-gradient(135deg, rgba(124,92,255,0.13), rgba(77,215,255,0.06))'
                      : 'rgba(255,255,255,0.04)',
                    border: device.current
                      ? '1px solid rgba(124,92,255,0.25)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    <span
                      style={{
                        width: '2.3rem',
                        height: '2.3rem',
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '0.8rem',
                        background: 'rgba(77,215,255,0.1)',
                        color: '#a5eaff',
                      }}
                    >
                      <Icon size={17} />
                    </span>

                    <span style={{ minWidth: 0, flex: 1 }}>
                      <strong
                        style={{
                          display: 'block',
                          color: '#edf2ff',
                          fontSize: '0.76rem',
                          fontWeight: 850,
                        }}
                      >
                        {device.name}
                      </strong>

                      <span
                        style={{
                          display: 'block',
                          marginTop: '0.2rem',
                          color: '#8c99b5',
                          fontSize: '0.63rem',
                        }}
                      >
                        {device.type} · {device.operatingSystem} ·{' '}
                        {device.browser}
                      </span>
                    </span>

                    {device.current ? (
                      <span
                        style={{
                          color: '#83e9c1',
                          fontSize: '0.6rem',
                          fontWeight: 850,
                        }}
                      >
                        Current
                      </span>
                    ) : null}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.35rem',
                      marginTop: '0.7rem',
                      color: '#8997b3',
                      fontSize: '0.62rem',
                      lineHeight: 1.45,
                    }}
                  >
                    <span>Login: {device.loginTime}</span>
                    <span>Activity: {device.lastActivity}</span>
                    <span>
                      {device.trusted ? 'Trusted device' : 'Needs review'}
                    </span>
                    <span style={{ display: 'inline-flex', gap: '0.2rem' }}>
                      <MapPin size={10} />
                      {device.location}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      marginTop: '0.7rem',
                    }}
                  >
                    <ActionButton
                      icon={ChevronRight}
                      onClick={() =>
                        showMessage(`${device.name} details are ready for backend integration.`)
                      }
                    >
                      View Details
                    </ActionButton>

                    {!device.trusted && !device.current ? (
                      <ActionButton
                        icon={ShieldCheck}
                        onClick={() =>
                          showMessage(`${device.name} trust approval is ready for Supabase integration.`)
                        }
                      >
                        Trust Device
                      </ActionButton>
                    ) : null}

                    {!device.current ? (
                      <ActionButton
                        icon={ShieldAlert}
                        danger
                        onClick={() =>
                          showMessage(`${device.name} removal is ready for session integration.`)
                        }
                      >
                        Remove Device
                      </ActionButton>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <ActionButton
            icon={MonitorSmartphone}
            onClick={() => navigate('/session-management')}
          >
            Open Session Management
          </ActionButton>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ShieldAlert}
            title="Recent Privacy Events"
            description="Important privacy and security events across your account."
          />

          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {privacyEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.55rem',
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <SeverityDot severity={event.severity} />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#eaf0ff',
                      fontSize: '0.74rem',
                      fontWeight: 850,
                    }}
                  >
                    {event.title}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.2rem',
                      color: '#8e9bb7',
                      fontSize: '0.64rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {event.description}
                  </span>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.25rem',
                      color: '#75839f',
                      fontSize: '0.6rem',
                    }}
                  >
                    {event.date} · {event.time}
                  </span>
                </span>

                <span
                  style={{
                    color:
                      event.severity === 'Red'
                        ? '#ff9eb8'
                        : event.severity === 'Yellow'
                          ? '#ffd28d'
                          : '#82e9c1',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    textAlign: 'right',
                  }}
                >
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={BarChart3}
            title="Session Analytics"
            description="Summarizes account session behavior across devices."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Total Login Sessions', '18'],
              ['Average Session Duration', '2h 18m'],
              ['Longest Session', '8h 42m'],
              ['Shortest Session', '4m'],
              ['Devices Used This Month', '5'],
              ['New Device This Week', '1'],
              ['Trusted Device Ratio', '67%'],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#8997b3',
                    fontSize: '0.62rem',
                  }}
                >
                  {label}
                </span>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.3rem',
                    color: '#edf2ff',
                    fontSize: '0.95rem',
                    fontWeight: 900,
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Shield}
            title="Quick Privacy Controls"
            description="Common privacy controls for everyday account protection."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.45rem',
            }}
          >
            {[
              ['hideProfile', 'Hide Profile', 'Reduce profile discoverability.', Eye],
              ['lockChats', 'Lock Chats', 'Require protection for private chats.', Lock],
              ['incomingMessages', 'Disable Incoming Messages', 'Limit new message requests.', Users],
              ['onlineStatus', 'Hide Online Status', 'Hide your current presence.', Radio],
              ['lastSeen', 'Hide Last Seen', 'Hide your recent activity time.', Clock3],
              ['readReceipts', 'Hide Read Receipts', 'Control message read signals.', Check],
            ].map(([id, title, description, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => updateControl(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.65rem',
                  borderRadius: '0.85rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dfe7f8',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={15} color="#b9c7e5" />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                    }}
                  >
                    {title}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.18rem',
                      color: '#8997b3',
                      fontSize: '0.61rem',
                      lineHeight: 1.35,
                    }}
                  >
                    {description}
                  </span>
                </span>

                <span
                  style={{
                    width: '0.52rem',
                    height: '0.52rem',
                    borderRadius: '999px',
                    background: controls[id] ? '#73e8b8' : '#56627b',
                    boxShadow: controls[id]
                      ? '0 0 9px rgba(115,232,184,0.7)'
                      : 'none',
                  }}
                />
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.45rem',
              marginTop: '0.65rem',
            }}
          >
            <ActionButton
              icon={ShieldAlert}
              danger
              onClick={() => navigate('/emergency-privacy')}
            >
              Emergency Privacy
            </ActionButton>

            <ActionButton
              icon={Eye}
              onClick={() => navigate('/shoulder-surf')}
            >
              Shoulder Surf
            </ActionButton>

            <ActionButton
              icon={ShieldCheck}
              onClick={() => navigate('/security-center')}
            >
              Security Center
            </ActionButton>
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Bell}
            title="Privacy Notifications"
            description="Choose which privacy events should be reported to you."
          />

          {[
            ['loginAlerts', 'Login Alerts', 'Notify me about account logins.', Bell],
            ['newDeviceAlerts', 'New Device Alerts', 'Notify me when a device signs in.', MonitorSmartphone],
            ['dataExportAlerts', 'Data Export Alerts', 'Notify me about account exports.', CloudDownload],
            ['screenshotAlerts', 'Screenshot Alerts', 'Notify me about protected screenshots.', Eye],
            ['recordingAlerts', 'Screen Recording Alerts', 'Notify me about protected recordings.', Video],
            ['reportAlerts', 'Privacy Report Alerts', 'Notify me when reports are ready.', FileText],
            ['securityAlerts', 'Security Event Alerts', 'Notify me about important security events.', ShieldAlert],
          ].map(([id, title, description, Icon]) => (
            <div
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.68rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Icon size={15} color="#aebcda" />

              <span style={{ minWidth: 0, flex: 1 }}>
                <strong
                  style={{
                    display: 'block',
                    color: '#e9efff',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                  }}
                >
                  {title}
                </strong>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.18rem',
                    color: '#8997b3',
                    fontSize: '0.64rem',
                  }}
                >
                  {description}
                </span>
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={controls[id]}
                aria-label={`Toggle ${title}`}
                onClick={() => updateControl(id)}
                style={{
                  width: '2.45rem',
                  height: '1.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: controls[id] ? 'flex-end' : 'flex-start',
                  padding: '0.15rem',
                  border: 0,
                  borderRadius: '999px',
                  background: controls[id]
                    ? 'linear-gradient(135deg, #7c5cff, #4dd7ff)'
                    : 'rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: '1.05rem',
                    height: '1.05rem',
                    borderRadius: '999px',
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                />
              </button>
            </div>
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={RefreshCw}
            title="Background Privacy Systems"
            description="Internal services that continuously monitor privacy and account activity."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {backgroundSystems.map(([title, status, Icon]) => (
              <div
                key={title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  borderRadius: '0.85rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Icon size={15} color="#a9b8d6" />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#dfe7fa',
                      fontSize: '0.67rem',
                      fontWeight: 800,
                    }}
                  >
                    {title}
                  </strong>

                  <span style={{ display: 'block', marginTop: '0.25rem' }}>
                    <StatusPill status={status} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Aarush AI Privacy (Coming Soon)"
            description="Future AI-powered privacy tools are prepared for the Aarush privacy platform."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {aiPrivacyItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  style={{
                    position: 'relative',
                    minHeight: '5.1rem',
                    padding: '0.8rem',
                    borderRadius: '1rem',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    opacity: 0.72,
                  }}
                >
                  <span
                    style={{
                      width: '2rem',
                      height: '2rem',
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '0.7rem',
                      background: 'rgba(124,92,255,0.12)',
                      color: '#b8aaff',
                    }}
                  >
                    <Icon size={15} />
                  </span>

                  <strong
                    style={{
                      display: 'block',
                      marginTop: '0.55rem',
                      color: '#e1e8f9',
                      fontSize: '0.75rem',
                      fontWeight: 850,
                    }}
                  >
                    {item.title}
                  </strong>

                  <p
                    style={{
                      margin: '0.25rem 0 0',
                      color: '#8794b0',
                      fontSize: '0.67rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.description}
                  </p>

                  <span
                    style={{
                      position: 'absolute',
                      top: '0.7rem',
                      right: '0.7rem',
                      padding: '0.25rem 0.4rem',
                      borderRadius: '999px',
                      background: 'rgba(255,255,255,0.07)',
                      color: '#9aa7c1',
                      fontSize: '0.56rem',
                      fontWeight: 800,
                    }}
                  >
                    Coming soon
                  </span>
                </div>
              );
            })}
          </div>
        </GlassSection>

        {message ? (
          <div
            role="status"
            style={{
              position: 'fixed',
              right: '1rem',
              bottom: '5.7rem',
              left: '1rem',
              zIndex: 1100,
              maxWidth: '520px',
              margin: '0 auto',
              padding: '0.75rem 0.9rem',
              borderRadius: '0.9rem',
              background: 'rgba(22,28,45,0.96)',
              border: '1px solid rgba(124,92,255,0.25)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
              color: '#dce6fa',
              fontSize: '0.74rem',
              lineHeight: 1.45,
              textAlign: 'center',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          >
            {message}
          </div>
        ) : null}
      </main>

      <BottomNav />

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

        @media (min-width: 640px) {
          main {
            padding-left: 1.25rem !important;
            padding-right: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
}

function LogOutIcon(props) {
  return <ShieldAlert {...props} />;
}