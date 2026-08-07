import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudDownload,
  Eye,
  Globe2,
  Laptop,
  Lock,
  MapPin,
  MonitorSmartphone,
  Navigation,
  Radio,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
  Users,
  Video,
  Wifi,
  X,
} from 'lucide-react';

const timerOptions = [
  '15 minutes',
  '30 minutes',
  '1 hour',
  '6 hours',
  '12 hours',
  '24 hours',
  '3 days',
  '7 days',
  'Never',
];

const activeSessions = [
  {
    id: 'session-1',
    name: 'Windows Laptop',
    type: 'Laptop',
    operatingSystem: 'Windows 11',
    browser: 'Chrome',
    current: true,
    trusted: true,
    lastActivity: 'Active now',
    loginTime: 'Today, 10:42 AM',
    location: 'Ghaziabad, India',
    score: 100,
    duration: '2h 14m',
    country: 'India',
    city: 'Ghaziabad',
    status: 'Online',
    icon: Laptop,
  },
  {
    id: 'session-2',
    name: 'Android Phone',
    type: 'Mobile',
    operatingSystem: 'Android 14',
    browser: 'Chrome Mobile',
    current: false,
    trusted: true,
    lastActivity: '12 minutes ago',
    loginTime: 'Yesterday, 8:18 PM',
    location: 'New Delhi, India',
    score: 82,
    duration: '14h 38m',
    country: 'India',
    city: 'New Delhi',
    status: 'Online',
    icon: Smartphone,
  },
  {
    id: 'session-3',
    name: 'iPhone',
    type: 'Mobile',
    operatingSystem: 'iOS 18',
    browser: 'Safari',
    current: false,
    trusted: false,
    lastActivity: '2 hours ago',
    loginTime: 'Monday, 6:04 PM',
    location: 'Mumbai, India',
    score: 54,
    duration: '1d 3h',
    country: 'India',
    city: 'Mumbai',
    status: 'Syncing',
    icon: Smartphone,
  },
];

const sessionHistory = [
  {
    id: 'history-1',
    event: 'Login',
    time: '10:42 AM',
    date: 'Today',
    device: 'Windows Laptop',
    location: 'Ghaziabad, India',
    status: 'Successful',
    color: '#72e9b8',
  },
  {
    id: 'history-2',
    event: 'Device Trusted',
    time: 'Yesterday, 8:22 PM',
    date: 'Yesterday',
    device: 'Android Phone',
    location: 'New Delhi, India',
    status: 'Approved',
    color: '#8edfff',
  },
  {
    id: 'history-3',
    event: 'Remote Logout',
    time: 'Monday, 11:02 PM',
    date: 'Monday',
    device: 'Older iPhone',
    location: 'Mumbai, India',
    status: 'Completed',
    color: '#ffd07d',
  },
  {
    id: 'history-4',
    event: 'Password Changed',
    time: 'Sunday, 4:25 PM',
    date: 'Sunday',
    device: 'Windows Laptop',
    location: 'Ghaziabad, India',
    status: 'Protected',
    color: '#72e9b8',
  },
];

const securityAlerts = [
  {
    id: 'alert-1',
    title: 'New device detected',
    description: 'An iPhone session requires verification.',
    time: 'Monday, 6:04 PM',
    date: 'Monday',
    severity: 'Yellow',
    status: 'Review',
  },
  {
    id: 'alert-2',
    title: 'Trusted device added',
    description: 'Android Phone was approved for this account.',
    time: 'Yesterday, 8:22 PM',
    date: 'Yesterday',
    severity: 'Green',
    status: 'Resolved',
  },
  {
    id: 'alert-3',
    title: 'Remote logout performed',
    description: 'An older session was revoked remotely.',
    time: 'Sunday, 4:25 PM',
    date: 'Sunday',
    severity: 'Green',
    status: 'Completed',
  },
];

const backgroundSystems = [
  ['Session Security Engine', 'Active', ShieldCheck],
  ['Device Trust Engine', 'Active', MonitorSmartphone],
  ['Realtime Session Sync', 'Syncing', RefreshCw],
  ['Device Activity Tracking', 'Active', ActivityIcon],
  ['Login Activity Monitoring', 'Active', Radio],
  ['Remote Session Control', 'Active', Lock],
  ['Location Synchronization', 'Syncing', Navigation],
  ['Trusted Device Verification', 'Active', UserCheck],
  ['Session Analytics', 'Active', BarChart3],
  ['Threat Monitoring', 'Syncing', ShieldAlert],
  ['Security Notification Service', 'Active', Bell],
];

const aiSessionItems = [
  ['Attack Detection', 'Identify possible attacks against active sessions.', ShieldAlert],
  ['Device Risk Prediction', 'Predict device trust and access risk.', BarChart3],
  ['Suspicious Session Detection', 'Detect unusual session behavior.', Eye],
  ['Location Anomaly Detection', 'Identify unusual login locations.', MapPin],
  ['Automatic Session Isolation', 'Separate risky sessions automatically.', Lock],
  ['AI Security Advisor', 'Explain session security recommendations.', Sparkles],
  ['Smart Device Trust', 'Continuously improve device trust decisions.', ShieldCheck],
];

function ActivityIcon(props) {
  return <Radio {...props} />;
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

function DeviceCard({ session, onAction }) {
  const Icon = session.icon;

  return (
    <article
      style={{
        padding: '0.85rem',
        borderRadius: '1rem',
        background: session.current
          ? 'linear-gradient(135deg, rgba(124,92,255,0.14), rgba(77,215,255,0.06))'
          : 'rgba(255,255,255,0.04)',
        border: session.current
          ? '1px solid rgba(124,92,255,0.26)'
          : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}
      >
        <span
          style={{
            width: '2.5rem',
            height: '2.5rem',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '0.85rem',
            background: 'rgba(77,215,255,0.1)',
            color: '#a5eaff',
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </span>

        <span style={{ minWidth: 0, flex: 1 }}>
          <strong
            style={{
              display: 'block',
              color: '#edf2ff',
              fontSize: '0.78rem',
              fontWeight: 850,
            }}
          >
            {session.name}
          </strong>

          <span
            style={{
              display: 'block',
              marginTop: '0.2rem',
              color: '#8d9ab6',
              fontSize: '0.64rem',
            }}
          >
            {session.type} · {session.operatingSystem} · {session.browser}
          </span>
        </span>

        {session.current ? (
          <span
            style={{
              color: '#83e9c1',
              fontSize: '0.61rem',
              fontWeight: 850,
            }}
          >
            Current device
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.35rem',
          marginTop: '0.75rem',
          color: '#8997b3',
          fontSize: '0.63rem',
          lineHeight: 1.45,
        }}
      >
        <span>Last activity: {session.lastActivity}</span>
        <span>Login: {session.loginTime}</span>
        <span>Location: {session.location}</span>
        <span>Duration: {session.duration}</span>
        <span>
          Trust: {session.trusted ? 'Trusted' : 'Unknown'}
        </span>
        <span>Score: {session.score} / 100</span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginTop: '0.75rem',
        }}
      >
        <ActionButton
          icon={ChevronRight}
          onClick={() => onAction(`${session.name} details are ready for backend integration.`)}
        >
          View Details
        </ActionButton>

        {!session.trusted && !session.current ? (
          <ActionButton
            icon={ShieldCheck}
            onClick={() => onAction(`${session.name} trust approval is ready for Supabase integration.`)}
          >
            Trust Device
          </ActionButton>
        ) : null}

        {!session.current ? (
          <>
            <ActionButton
              icon={X}
              danger
              onClick={() => onAction(`${session.name} removal is ready for remote session integration.`)}
            >
              Remove Device
            </ActionButton>

            <ActionButton
              icon={Lock}
              danger
              onClick={() => onAction(`${session.name} remote logout is ready for session integration.`)}
            >
              Remote Logout
            </ActionButton>

            <ActionButton
              icon={UserCheck}
              onClick={() => onAction(`${session.name} can be marked as current after secure verification.`)}
            >
              Mark As Current
            </ActionButton>
          </>
        ) : null}

        <ActionButton
          icon={PencilIcon}
          onClick={() => onAction(`${session.name} rename is ready for device metadata integration.`)}
        >
          Rename Device
        </ActionButton>
      </div>
    </article>
  );
}

function PencilIcon(props) {
  return <Sparkles {...props} />;
}

export default function LogoutSessionPage() {
  const navigate = useNavigate();
  const [autoLogoutTimer, setAutoLogoutTimer] = useState('Never');
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState({
    newDevice: true,
    trustedDevice: true,
    remoteLogout: true,
    autoLogout: true,
    suspiciousLogin: true,
    deviceLocation: false,
    sessionExpiry: true,
  });

  const sessionScore = useMemo(() => {
    const enabledNotifications = Object.values(notifications).filter(Boolean).length;
    return Math.min(100, 89 + enabledNotifications);
  }, [notifications]);

  const sessionLevel =
    sessionScore >= 90
      ? 'Excellent'
      : sessionScore >= 75
        ? 'Strong'
        : sessionScore >= 55
          ? 'Moderate'
          : 'Weak';

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

  const toggleNotification = (id) => {
    setNotifications((current) => ({
      ...current,
      [id]: !current[id],
    }));
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
        pageTitle="Session Management"
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
              <MonitorSmartphone size={29} />
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
                Session &amp; Device Control
              </h1>

              <p
                style={{
                  margin: '0.45rem 0 0',
                  color: '#c1cce2',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                }}
              >
                Manage active devices, trusted sessions, and remote security
                controls from one place.
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
                background: `conic-gradient(#61e8b4 ${sessionScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
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
                  {sessionScore}
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
                {sessionLevel}
              </span>

              <p
                style={{
                  margin: '0.38rem 0 0',
                  color: '#aab7d0',
                  fontSize: '0.72rem',
                  lineHeight: 1.5,
                }}
              >
                Your current session security is well protected. Review
                unknown devices and refresh activity regularly.
              </p>
            </div>
          </div>
        </section>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Quick Session Actions"
            description="Common session controls are available without leaving this page."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            <ActionButton
              icon={LogOutIcon}
              danger
              onClick={() => showMessage('Logout from other devices is ready for Supabase session integration.')}
            >
              Logout All Other Devices
            </ActionButton>

            <ActionButton
              icon={Lock}
              danger
              onClick={() => showMessage('Lock all sessions is ready for remote session integration.')}
            >
              Lock All Sessions
            </ActionButton>

            <ActionButton
              icon={ShieldCheck}
              onClick={() => navigate('/security-center')}
            >
              Open Security Center
            </ActionButton>

            <ActionButton
              icon={Eye}
              onClick={() => navigate('/privacy-dashboard')}
            >
              Open Privacy Dashboard
            </ActionButton>

            <ActionButton
              icon={ShieldAlert}
              danger
              onClick={() => navigate('/emergency-privacy')}
            >
              Emergency Session Revoke
            </ActionButton>

            <ActionButton
              icon={RefreshCw}
              onClick={() => showMessage('Device activity refresh is ready for realtime session integration.')}
            >
              Refresh Device Activity
            </ActionButton>
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={MonitorSmartphone}
            title="Active Sessions"
            description="Every active session currently connected to your Aarush account."
          />

          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {activeSessions.map((session) => (
              <DeviceCard
                key={session.id}
                session={session}
                onAction={showMessage}
              />
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Globe2}
            title="Live Device Map"
            description="A secure map view prepared for realtime device locations and routes."
          />

          <div
            style={{
              position: 'relative',
              minHeight: '15rem',
              overflow: 'hidden',
              borderRadius: '1rem',
              background:
                'radial-gradient(circle at 30% 35%, rgba(77,215,255,0.2), transparent 20%), radial-gradient(circle at 70% 65%, rgba(124,92,255,0.24), transparent 24%), linear-gradient(145deg, #111a2a, #0b101c)',
              border: '1px solid rgba(77,215,255,0.16)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '15% 5%',
                opacity: 0.3,
                backgroundImage:
                  'linear-gradient(rgba(128,170,220,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(128,170,220,0.2) 1px, transparent 1px)',
                backgroundSize: '2rem 2rem',
                transform: 'perspective(400px) rotateX(48deg)',
                transformOrigin: 'center',
              }}
            />

            {[
              ['Windows Laptop', 'Ghaziabad', 'Online', '28%', '34%', '#72e9b8'],
              ['Android Phone', 'New Delhi', 'Online', '38%', '26%', '#8edfff'],
              ['iPhone', 'Mumbai', 'Syncing', '67%', '68%', '#ffd07d'],
            ].map(([name, city, status, top, left, color]) => (
              <div
                key={name}
                style={{
                  position: 'absolute',
                  top,
                  left,
                  display: 'grid',
                  justifyItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span
                  style={{
                    width: '0.85rem',
                    height: '0.85rem',
                    borderRadius: '999px',
                    background: color,
                    boxShadow: `0 0 0 6px ${color}22, 0 0 18px ${color}`,
                  }}
                />

                <span
                  style={{
                    padding: '0.3rem 0.42rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(8,13,23,0.86)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#dfe8fb',
                    fontSize: '0.58rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                  <br />
                  <span style={{ color }}>{city} · {status}</span>
                </span>
              </div>
            ))}

            <div
              style={{
                position: 'absolute',
                right: '0.7rem',
                bottom: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.5rem',
                borderRadius: '999px',
                background: 'rgba(8,13,23,0.82)',
                color: '#9eb0cd',
                fontSize: '0.6rem',
              }}
            >
              <MapPin size={11} />
              Live map foundation
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              marginTop: '0.7rem',
            }}
          >
            <ActionButton
              icon={RefreshCw}
              onClick={() => showMessage('Location refresh is ready for realtime device integration.')}
            >
              Refresh Locations
            </ActionButton>

            <ActionButton
              icon={Navigation}
              onClick={() => showMessage('Device routes are prepared for location history integration.')}
            >
              View Device Route
            </ActionButton>

            <ActionButton
              icon={CloudDownload}
              onClick={() => showMessage('Device activity export is ready for backend integration.')}
            >
              Export Device Activity
            </ActionButton>
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ShieldCheck}
            title="Trusted Devices"
            description="Devices approved by the user for lower-friction secure access."
          />

          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {activeSessions
              .filter((session) => session.trusted)
              .map((session) => {
                const Icon = session.icon;

                return (
                  <div
                    key={session.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.95rem',
                      background: 'rgba(82,232,170,0.05)',
                      border: '1px solid rgba(82,232,170,0.12)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                      }}
                    >
                      <Icon size={17} color="#8deec5" />

                      <span style={{ minWidth: 0, flex: 1 }}>
                        <strong
                          style={{
                            display: 'block',
                            color: '#eaf0ff',
                            fontSize: '0.75rem',
                          }}
                        >
                          {session.name}
                        </strong>

                        <span
                          style={{
                            display: 'block',
                            marginTop: '0.18rem',
                            color: '#8c99b5',
                            fontSize: '0.63rem',
                          }}
                        >
                          Trust level · Trusted since account verification
                        </span>
                      </span>

                      <span
                        style={{
                          color: '#83e9c1',
                          fontSize: '0.65rem',
                          fontWeight: 850,
                        }}
                      >
                        {session.score} / 100
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.35rem',
                        marginTop: '0.65rem',
                      }}
                    >
                      <ActionButton
                        icon={X}
                        onClick={() => showMessage(`${session.name} trust removal is ready for device integration.`)}
                      >
                        Remove Trust
                      </ActionButton>

                      <ActionButton
                        icon={Shield}
                        onClick={() => showMessage(`${session.name} security history is ready for audit integration.`)}
                      >
                        View Security History
                      </ActionButton>

                      <ActionButton
                        icon={Sparkles}
                        onClick={() => showMessage(`${session.name} rename is ready for device metadata integration.`)}
                      >
                        Rename Trusted Device
                      </ActionButton>
                    </div>
                  </div>
                );
              })}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={AlertTriangle}
            title="Unknown Devices"
            description="Devices requiring verification before they receive trusted access."
          />

          <div
            style={{
              display: 'grid',
              gap: '0.55rem',
            }}
          >
            {activeSessions
              .filter((session) => !session.trusted)
              .map((session) => (
                <div
                  key={session.id}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '0.95rem',
                    background: 'rgba(255,179,71,0.06)',
                    border: '1px solid rgba(255,179,71,0.16)',
                  }}
                >
                  <strong
                    style={{
                      display: 'block',
                      color: '#f0e6cf',
                      fontSize: '0.76rem',
                    }}
                  >
                    {session.name}
                  </strong>

                  <p
                    style={{
                      margin: '0.3rem 0',
                      color: '#a7977e',
                      fontSize: '0.65rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {session.type} · {session.location}
                    <br />
                    First seen at {session.loginTime} · Last activity{' '}
                    {session.lastActivity}
                  </p>

                  <span
                    style={{
                      display: 'inline-flex',
                      padding: '0.28rem 0.45rem',
                      borderRadius: '999px',
                      background: 'rgba(255,179,71,0.12)',
                      color: '#ffd28d',
                      fontSize: '0.61rem',
                      fontWeight: 800,
                    }}
                  >
                    Risk level: Warning
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      marginTop: '0.65rem',
                    }}
                  >
                    <ActionButton
                      icon={UserCheck}
                      onClick={() => showMessage(`${session.name} verification is ready for secure device enrollment.`)}
                    >
                      Verify Device
                    </ActionButton>

                    <ActionButton
                      icon={Lock}
                      danger
                      onClick={() => showMessage(`${session.name} blocking is ready for remote session integration.`)}
                    >
                      Block Device
                    </ActionButton>

                    <ActionButton
                      icon={AlertTriangle}
                      danger
                      onClick={() => showMessage('Suspicious activity reporting is ready for security service integration.')}
                    >
                      Report Suspicious Activity
                    </ActionButton>
                  </div>
                </div>
              ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Clock3}
            title="Automatic Logout"
            description="Automatically sign out inactive devices after the selected period."
          />

          <select
            value={autoLogoutTimer}
            onChange={(event) => setAutoLogoutTimer(event.target.value)}
            style={{
              width: '100%',
              minHeight: '2.8rem',
              padding: '0 0.75rem',
              borderRadius: '0.8rem',
              border: '1px solid rgba(255,255,255,0.1)',
              outline: 0,
              background: '#151b2b',
              color: '#edf3ff',
              fontSize: '0.76rem',
              cursor: 'pointer',
            }}
          >
            {timerOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <p
            style={{
              margin: '0.65rem 0 0',
              color: '#8997b3',
              fontSize: '0.68rem',
              lineHeight: 1.5,
            }}
          >
            Inactive devices will be signed out automatically after{' '}
            <span style={{ color: '#dfe8fb', fontWeight: 800 }}>
              {autoLogoutTimer}
            </span>
            . The current device remains active. This control is prepared for
            future server-side session enforcement.
          </p>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={BarChart3}
            title="Device Trust Level"
            description="Trust scores summarize verification, history, location, and session consistency."
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {activeSessions.map((session) => (
              <div
                key={session.id}
                style={{
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <strong
                    style={{
                      color: '#eaf0ff',
                      fontSize: '0.74rem',
                    }}
                  >
                    {session.name}
                  </strong>

                  <span
                    style={{
                      color:
                        session.score >= 80
                          ? '#83e9c1'
                          : session.score >= 50
                            ? '#ffd28d'
                            : '#ff9eb8',
                      fontSize: '0.66rem',
                      fontWeight: 850,
                    }}
                  >
                    {session.score} {session.score >= 80 ? 'Trusted' : session.score >= 50 ? 'Warning' : 'Unknown'}
                  </span>
                </div>

                <div
                  style={{
                    height: '0.35rem',
                    marginTop: '0.55rem',
                    overflow: 'hidden',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    style={{
                      width: `${session.score}%`,
                      height: '100%',
                      borderRadius: 'inherit',
                      background:
                        session.score >= 80
                          ? 'linear-gradient(90deg, #61e8b4, #4dd7ff)'
                          : session.score >= 50
                            ? 'linear-gradient(90deg, #ffd07d, #ffb347)'
                            : 'linear-gradient(90deg, #ff7f9e, #ff4f7a)',
                    }}
                  />
                </div>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.4rem',
                    color: '#8997b3',
                    fontSize: '0.62rem',
                  }}
                >
                  Recent verification · Login consistency · Device history ·
                  Location consistency · Security verification
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Activity}
            title="Session History"
            description="A timeline of important session and device events."
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {sessionHistory.map((event) => (
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
                <span
                  style={{
                    width: '0.55rem',
                    height: '0.55rem',
                    marginTop: '0.3rem',
                    borderRadius: '999px',
                    background: event.color,
                    boxShadow: `0 0 9px ${event.color}`,
                    flexShrink: 0,
                  }}
                />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#eaf0ff',
                      fontSize: '0.74rem',
                    }}
                  >
                    {event.event}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.2rem',
                      color: '#8b99b5',
                      fontSize: '0.63rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {event.device} · {event.location}
                    <br />
                    {event.date} · {event.time}
                  </span>
                </span>

                <span
                  style={{
                    color: event.color,
                    fontSize: '0.61rem',
                    fontWeight: 800,
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
            icon={ShieldAlert}
            title="Session Security Alerts"
            description="Alerts related to device access, remote control, and session risk."
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {securityAlerts.map((alert) => {
              const color =
                alert.severity === 'Green'
                  ? '#72e9b8'
                  : alert.severity === 'Yellow'
                    ? '#ffd07d'
                    : '#ff7f9e';

              return (
                <div
                  key={alert.id}
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
                  <span
                    style={{
                      width: '0.55rem',
                      height: '0.55rem',
                      marginTop: '0.3rem',
                      borderRadius: '999px',
                      background: color,
                      boxShadow: `0 0 9px ${color}`,
                    }}
                  />

                  <span style={{ minWidth: 0, flex: 1 }}>
                    <strong
                      style={{
                        display: 'block',
                        color: '#eaf0ff',
                        fontSize: '0.74rem',
                      }}
                    >
                      {alert.title}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.2rem',
                        color: '#8b99b5',
                        fontSize: '0.63rem',
                      }}
                    >
                      {alert.description}
                      <br />
                      {alert.date} · {alert.time}
                    </span>
                  </span>

                  <span
                    style={{
                      color,
                      fontSize: '0.61rem',
                      fontWeight: 800,
                    }}
                  >
                    {alert.status}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Bell}
            title="Session Notifications"
            description="Choose which device and session events should be reported to you."
          />

          {[
            ['newDevice', 'New Device Alerts', 'Notify me when a new device signs in.', MonitorSmartphone],
            ['trustedDevice', 'Trusted Device Alerts', 'Notify me when device trust changes.', ShieldCheck],
            ['remoteLogout', 'Remote Logout Alerts', 'Notify me when a session is remotely logged out.', Lock],
            ['autoLogout', 'Auto Logout Alerts', 'Notify me when an inactive session expires.', Clock3],
            ['suspiciousLogin', 'Suspicious Login Alerts', 'Notify me about unusual logins.', AlertTriangle],
            ['deviceLocation', 'Device Location Alerts', 'Notify me when device location changes.', MapPin],
            ['sessionExpiry', 'Session Expiry Alerts', 'Notify me before a session expires.', Clock3],
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
                aria-checked={notifications[id]}
                aria-label={`Toggle ${title}`}
                onClick={() => toggleNotification(id)}
                style={{
                  width: '2.45rem',
                  height: '1.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: notifications[id] ? 'flex-end' : 'flex-start',
                  padding: '0.15rem',
                  border: 0,
                  borderRadius: '999px',
                  background: notifications[id]
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
            title="Background Session Systems"
            description="Internal services that continuously protect active sessions and devices."
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
            title="Aarush AI Session Security (Coming Soon)"
            description="Future AI-powered session protection features are prepared for the security platform."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {aiSessionItems.map(([title, description, Icon]) => (
              <div
                key={title}
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
                  {title}
                </strong>

                <p
                  style={{
                    margin: '0.25rem 0 0',
                    color: '#8794b0',
                    fontSize: '0.67rem',
                    lineHeight: 1.4,
                  }}
                >
                  {description}
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
            ))}
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

        select option {
          background: #151b2b;
          color: #edf3ff;
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