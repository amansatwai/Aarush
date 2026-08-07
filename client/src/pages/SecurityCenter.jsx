import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Fingerprint,
  Globe2,
  KeyRound,
  Laptop,
  Lock,
  MapPin,
  MonitorSmartphone,
  Moon,
  Radio,
  RefreshCw,
  ScanFace,
  ScreenShare,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
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

const loginEvents = [
  {
    id: 'login-1',
    device: 'Windows Laptop',
    operatingSystem: 'Windows 11',
    browser: 'Chrome',
    location: 'Ghaziabad, India',
    time: '10:42 AM',
    date: 'Today',
    status: 'Successful',
    icon: Laptop,
  },
  {
    id: 'login-2',
    device: 'Android Phone',
    operatingSystem: 'Android 14',
    browser: 'Chrome Mobile',
    location: 'New Delhi, India',
    time: 'Yesterday, 8:18 PM',
    date: 'Yesterday',
    status: 'Successful',
    icon: Smartphone,
  },
  {
    id: 'login-3',
    device: 'iPhone',
    operatingSystem: 'iOS 18',
    browser: 'Safari',
    location: 'Mumbai, India',
    time: 'Monday, 6:04 PM',
    date: 'Monday',
    status: 'Verified',
    icon: Smartphone,
  },
];

const deviceItems = [
  {
    id: 'device-1',
    name: 'This device',
    description: 'Current Aarush session',
    detail: 'Windows Laptop · Chrome',
    status: 'Current device',
    trust: 'Trusted',
    icon: Laptop,
  },
  {
    id: 'device-2',
    name: 'Android Phone',
    description: 'Approved mobile device',
    detail: 'Android 14 · Chrome Mobile',
    status: 'Trusted device',
    trust: 'Trusted',
    icon: Smartphone,
  },
  {
    id: 'device-3',
    name: 'iPhone',
    description: 'Verification required',
    detail: 'iOS 18 · Safari',
    status: 'Unknown device',
    trust: 'Review',
    icon: Smartphone,
  },
];

const authenticationItems = [
  {
    id: 'face-unlock',
    title: 'Face Unlock',
    description: 'Unlock Aarush using your face when supported by the device.',
    icon: ScanFace,
  },
  {
    id: 'fingerprint-unlock',
    title: 'Fingerprint Unlock',
    description: 'Use fingerprint authentication to unlock Aarush securely.',
    icon: Fingerprint,
  },
  {
    id: 'pin-lock',
    title: 'PIN Lock',
    description: 'Protect the app with a numeric PIN.',
    icon: KeyRound,
  },
  {
    id: 'pattern-lock',
    title: 'Pattern Lock',
    description: 'Protect the app using a screen pattern.',
    icon: Lock,
  },
  {
    id: 'change-password',
    title: 'Change Password',
    description: 'Update the account password through a secure flow.',
    icon: ShieldCheck,
  },
  {
    id: 'two-factor',
    title: 'Two-Factor Authentication',
    description: 'Require a verification code during login.',
    icon: Shield,
  },
  {
    id: 'login-verification',
    title: 'Login Verification',
    description: 'Ask for additional verification when a new device signs in.',
    icon: UserRound,
  },
];

const privacyItems = [
  {
    id: 'online-status',
    title: 'Hide Online Status',
    description: 'Prevent others from seeing when you are online.',
    icon: Radio,
  },
  {
    id: 'last-seen',
    title: 'Hide Last Seen',
    description: 'Hide the last time you were active on Aarush.',
    icon: Clock3,
  },
  {
    id: 'read-receipts',
    title: 'Hide Read Receipts',
    description: 'Do not reveal when you have read a message.',
    icon: Check,
  },
  {
    id: 'screenshot-protection',
    title: 'Screenshot Protection',
    description: 'Reduce exposure when protected content is captured.',
    icon: ScreenShare,
  },
  {
    id: 'screen-recording',
    title: 'Screen Recording Protection',
    description: 'Detect or restrict recording of sensitive screens.',
    icon: Video,
  },
  {
    id: 'anti-peek',
    title: 'Anti Peek Shield',
    description: 'Reduce shoulder surfing and visual privacy risks.',
    icon: Eye,
  },
  {
    id: 'hidden-notifications',
    title: 'Hidden Notification Content',
    description: 'Hide message content on the device lock screen.',
    icon: Bell,
  },
  {
    id: 'blur-sensitive',
    title: 'Blur Sensitive Content',
    description: 'Automatically blur selected private content.',
    icon: ShieldAlert,
  },
];

const backgroundSystems = [
  ['Authentication Engine', 'Active', ShieldCheck],
  ['Session Security Engine', 'Active', Lock],
  ['Device Trust Engine', 'Active', MonitorSmartphone],
  ['Login Activity Tracking', 'Active', Radio],
  ['Realtime Session Sync', 'Syncing', RefreshCw],
  ['Security Notification Service', 'Active', Bell],
  ['Screenshot Detection', 'Future', ScreenShare],
  ['Screen Recording Detection', 'Future', Video],
  ['Privacy Permission Engine', 'Active', Shield],
  ['Security Analytics', 'Active', Sparkles],
  ['Threat Monitoring', 'Syncing', ShieldAlert],
  ['Backup Synchronization', 'Active', Wifi],
];

const aiSecurityItems = [
  {
    title: 'Risk Prediction',
    description: 'Predict suspicious account behavior.',
    icon: ShieldAlert,
  },
  {
    title: 'Fake Account Detection',
    description: 'Detect potentially fake accounts.',
    icon: UserRound,
  },
  {
    title: 'Scam Conversation Detection',
    description: 'Warn about suspicious conversations.',
    icon: AlertTriangle,
  },
  {
    title: 'Deepfake Alert',
    description: 'Detect manipulated media.',
    icon: ScanFace,
  },
  {
    title: 'AI Privacy Advisor',
    description: 'Suggest privacy improvements.',
    icon: Sparkles,
  },
  {
    title: 'Attack Detection',
    description: 'Identify possible account attacks.',
    icon: ShieldCheck,
  },
];

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

function GlassSection({ children }) {
  return (
    <section
      style={{
        marginTop: '0.9rem',
        padding: '1rem',
        borderRadius: '1.25rem',
        background: 'rgba(15,19,30,0.86)',
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

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      style={{
        width: '2.55rem',
        height: '1.45rem',
        padding: '0.18rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        border: 0,
        borderRadius: '999px',
        background: checked
          ? 'linear-gradient(135deg, #7c5cff, #4dd7ff)'
          : 'rgba(255,255,255,0.12)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 180ms ease, justify-content 180ms ease',
      }}
    >
      <span
        style={{
          width: '1.08rem',
          height: '1.08rem',
          borderRadius: '999px',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

function ActionCard({ icon: Icon, title, description, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: '5.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.8rem',
        borderRadius: '1rem',
        border: danger
          ? '1px solid rgba(255,79,122,0.2)'
          : '1px solid rgba(255,255,255,0.07)',
        background: danger
          ? 'rgba(255,79,122,0.08)'
          : 'rgba(255,255,255,0.04)',
        color: '#f4f7ff',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: '2.35rem',
          height: '2.35rem',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '0.8rem',
          background: danger
            ? 'rgba(255,79,122,0.14)'
            : 'linear-gradient(135deg, rgba(124,92,255,0.2), rgba(77,215,255,0.12))',
          color: danger ? '#ffb2c8' : '#dfe7ff',
          flexShrink: 0,
        }}
      >
        <Icon size={17} />
      </span>

      <span style={{ minWidth: 0, flex: 1 }}>
        <strong
          style={{
            display: 'block',
            color: '#f4f7ff',
            fontSize: '0.76rem',
            fontWeight: 850,
          }}
        >
          {title}
        </strong>

        <span
          style={{
            display: 'block',
            marginTop: '0.22rem',
            color: '#919eba',
            fontSize: '0.67rem',
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>
      </span>

      <ChevronRight size={15} color="#7f8ba6" />
    </button>
  );
}

function SecurityRow({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  trailing,
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.72rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span
        style={{
          width: '2rem',
          height: '2rem',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '0.7rem',
          background: 'rgba(255,255,255,0.06)',
          color: '#b9c7e5',
          flexShrink: 0,
        }}
      >
        <Icon size={15} />
      </span>

      <span style={{ minWidth: 0, flex: 1 }}>
        <strong
          style={{
            display: 'block',
            color: '#e9efff',
            fontSize: '0.77rem',
            fontWeight: 800,
          }}
        >
          {title}
        </strong>

        <span
          style={{
            display: 'block',
            marginTop: '0.2rem',
            color: '#8c99b5',
            fontSize: '0.68rem',
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>
      </span>

      {trailing || (
        <Toggle
          checked={enabled}
          onChange={onToggle}
          label={`Toggle ${title}`}
        />
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const isActive = status === 'Active';
  const isSyncing = status === 'Syncing';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.28rem 0.45rem',
        borderRadius: '999px',
        background: isActive
          ? 'rgba(82,232,170,0.1)'
          : isSyncing
            ? 'rgba(77,215,255,0.1)'
            : 'rgba(255,179,71,0.1)',
        color: isActive
          ? '#8af0c7'
          : isSyncing
            ? '#8edfff'
            : '#ffd28d',
        fontSize: '0.62rem',
        fontWeight: 800,
      }}
    >
      {isSyncing ? <RefreshCw size={10} /> : <span>●</span>}
      {status}
    </span>
  );
}

export default function SecurityCenter() {
  const navigate = useNavigate();
  const [enabledControls, setEnabledControls] = useState({
    'face-unlock': false,
    'fingerprint-unlock': true,
    'pin-lock': true,
    'pattern-lock': false,
    'change-password': false,
    'two-factor': false,
    'login-verification': true,
    'online-status': false,
    'last-seen': false,
    'read-receipts': false,
    'screenshot-protection': true,
    'screen-recording': true,
    'anti-peek': true,
    'hidden-notifications': true,
    'blur-sensitive': true,
  });
  const [autoLogoutTimer, setAutoLogoutTimer] = useState('Never');
  const [message, setMessage] = useState('');

  const securityScore = useMemo(() => {
    const enabledCount = Object.values(enabledControls).filter(Boolean).length;
    return Math.min(100, 80 + enabledCount);
  }, [enabledControls]);

  const securityLevel =
    securityScore >= 90
      ? 'Excellent'
      : securityScore >= 75
        ? 'Strong'
        : securityScore >= 55
          ? 'Moderate'
          : 'Weak';

  const updateControl = (id) => {
    setEnabledControls((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

  const handleAction = (title, path) => {
    if (path) {
      navigate(path);
      return;
    }

    showMessage(`${title} is ready for its secure service integration.`);
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
        pageTitle="Security Center"
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
              position: 'absolute',
              top: '-4rem',
              right: '-3rem',
              width: '12rem',
              height: '12rem',
              borderRadius: '999px',
              background: 'rgba(77,215,255,0.08)',
              filter: 'blur(12px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.8rem',
              position: 'relative',
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
              <ShieldCheck size={29} />
            </div>

            <div style={{ flex: 1 }}>
              <h1
                style={{
                  margin: 0,
                  color: '#f8faff',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  letterSpacing: '-0.025em',
                }}
              >
                Security Center
              </h1>

              <p
                style={{
                  margin: '0.45rem 0 0',
                  color: '#c1cce2',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                }}
              >
                Protect your account, devices, sessions, and personal privacy
                from one secure place.
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
                background: `conic-gradient(#61e8b4 ${securityScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                position: 'relative',
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
                    display: 'block',
                    color: '#f7fbff',
                    fontSize: '1.15rem',
                    lineHeight: 1,
                  }}
                >
                  {securityScore}
                </strong>

                <span
                  style={{
                    display: 'block',
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
                {securityLevel}
              </span>

              <p
                style={{
                  maxWidth: '23rem',
                  margin: '0.38rem 0 0',
                  color: '#aab7d0',
                  fontSize: '0.72rem',
                  lineHeight: 1.5,
                }}
              >
                Your account has strong protection enabled. Add more
                authentication methods to improve this score.
              </p>
            </div>
          </div>
        </section>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Quick Security Actions"
            description="Common security controls are available without leaving this center."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            <ActionCard
              icon={Lock}
              title="Lock App Now"
              description="Immediately lock the current Aarush session."
              onClick={() => navigate('/lock')}
            />

            <ActionCard
              icon={ShieldAlert}
              title="Emergency Privacy"
              description="Open emergency controls for sensitive situations."
              onClick={() =>
                handleAction('Emergency Privacy', '/emergency-privacy')
              }
              danger
            />

            <ActionCard
              icon={Eye}
              title="Shoulder Surf Protection"
              description="Open visual privacy and anti-peek controls."
              onClick={() =>
                handleAction('Shoulder Surf Protection', '/shoulder-surf')
              }
            />

            <ActionCard
              icon={MonitorSmartphone}
              title="Logout All Other Devices"
              description="Review and revoke sessions on other devices."
              onClick={() => navigate('/session-management')}
            />

            <ActionCard
              icon={Shield}
              title="Privacy Dashboard"
              description="Manage account and content privacy settings."
              onClick={() => navigate('/privacy-dashboard')}
            />

            <ActionCard
              icon={Clock3}
              title="Session Management"
              description="Review active sessions and logout controls."
              onClick={() => navigate('/session-management')}
            />
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={KeyRound}
            title="Authentication Security"
            description="Choose how Aarush verifies your identity."
          />

          {authenticationItems.map((item) => (
            <SecurityRow
              key={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
              enabled={enabledControls[item.id]}
              onToggle={() => {
                if (item.id === 'change-password') {
                  navigate('/profile-settings');
                  return;
                }

                updateControl(item.id);
              }}
            />
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={MonitorSmartphone}
            title="Device Security"
            description="Review devices that can access your Aarush account."
          />

          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {deviceItems.map((device) => {
              const Icon = device.icon;
              const isCurrent = device.status === 'Current device';

              return (
                <div
                  key={device.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.75rem',
                    borderRadius: '1rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span
                    style={{
                      width: '2.3rem',
                      height: '2.3rem',
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '0.8rem',
                      background: 'rgba(124,92,255,0.14)',
                      color: '#dce6ff',
                    }}
                  >
                    <Icon size={17} />
                  </span>

                  <span style={{ minWidth: 0, flex: 1 }}>
                    <strong
                      style={{
                        display: 'block',
                        color: '#eef3ff',
                        fontSize: '0.77rem',
                        fontWeight: 850,
                      }}
                    >
                      {device.name}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.18rem',
                        color: '#8997b3',
                        fontSize: '0.66rem',
                      }}
                    >
                      {device.description}
                    </span>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.18rem',
                        color: '#72809d',
                        fontSize: '0.63rem',
                      }}
                    >
                      {device.detail}
                    </span>
                  </span>

                  <span
                    style={{
                      display: 'grid',
                      justifyItems: 'end',
                      gap: '0.28rem',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        color: isCurrent
                          ? '#83e9c1'
                          : device.trust === 'Trusted'
                            ? '#9bdfff'
                            : '#ffcc88',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        textAlign: 'right',
                      }}
                    >
                      {device.status}
                    </span>

                    {!isCurrent ? (
                      <button
                        type="button"
                        onClick={() =>
                          showMessage(
                            `${device.name} device management is ready for Supabase integration.`
                          )
                        }
                        style={{
                          padding: '0.28rem 0.45rem',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '999px',
                          background: 'rgba(255,255,255,0.05)',
                          color: '#b9c7e5',
                          fontSize: '0.6rem',
                          fontWeight: 750,
                          cursor: 'pointer',
                        }}
                      >
                        Manage
                      </button>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginTop: '0.75rem',
              color: '#8f9db8',
              fontSize: '0.68rem',
              lineHeight: 1.4,
            }}
          >
            <ShieldCheck size={13} color="#7fe8bf" />
            Device trust levels are prepared for server-side verification.
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Clock3}
            title="Session Security"
            description="Control how sessions are reviewed and expired."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Active Sessions', '3 sessions currently available'],
              ['Last Login', 'Today at 10:42 AM'],
              ['Last Logout', 'Yesterday at 11:18 PM'],
              ['Session Duration', '2 hours 14 minutes'],
            ].map(([title, value]) => (
              <div
                key={title}
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
                  {title}
                </span>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.28rem',
                    color: '#e9efff',
                    fontSize: '0.72rem',
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gap: '0.55rem',
              marginTop: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/session-management')}
              style={{
                minHeight: '2.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <MonitorSmartphone size={15} />
              Open Active Sessions
            </button>

            <label
              style={{
                display: 'grid',
                gap: '0.38rem',
                color: '#cbd6ea',
                fontSize: '0.72rem',
                fontWeight: 750,
              }}
            >
              Auto Logout Timer
              <select
                value={autoLogoutTimer}
                onChange={(event) => setAutoLogoutTimer(event.target.value)}
                style={{
                  minHeight: '2.7rem',
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
            </label>

            <p
              style={{
                margin: 0,
                color: '#8997b3',
                fontSize: '0.67rem',
                lineHeight: 1.5,
              }}
            >
              Inactive devices will be signed out automatically after the
              selected period. The current device remains active. Server-side
              enforcement will be connected through the session security
              service.
            </p>

            <button
              type="button"
              onClick={() =>
                showMessage('Remote logout is ready for secure session integration.')
              }
              style={{
                minHeight: '2.7rem',
                border: 0,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
                fontSize: '0.74rem',
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              Remote Logout
            </button>
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Bell}
            title="Login Alerts"
            description="Review recent sign-ins and verification events."
          />

          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {loginEvents.map((event) => {
              const Icon = event.icon;

              return (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.7rem',
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
                      background: 'rgba(77,215,255,0.1)',
                      color: '#9be8ff',
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
                      {event.device}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.18rem',
                        color: '#8b99b5',
                        fontSize: '0.63rem',
                      }}
                    >
                      {event.operatingSystem} · {event.browser}
                    </span>

                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginTop: '0.18rem',
                        color: '#7886a2',
                        fontSize: '0.61rem',
                      }}
                    >
                      <MapPin size={10} />
                      {event.location} · {event.time}
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
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => showMessage('Full login history is ready for backend integration.')}
            style={{
              width: '100%',
              minHeight: '2.7rem',
              marginTop: '0.7rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              color: '#dce5f8',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            View Full Login History
            <ChevronRight size={14} />
          </button>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Eye}
            title="Privacy Protection"
            description="Control presence, visual, notification, and sensitive-content privacy."
          />

          {privacyItems.map((item) => (
            <SecurityRow
              key={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
              enabled={enabledControls[item.id]}
              onToggle={() => updateControl(item.id)}
            />
          ))}

          <button
            type="button"
            onClick={() => navigate('/privacy-dashboard')}
            style={{
              width: '100%',
              minHeight: '2.7rem',
              marginTop: '0.75rem',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              color: '#dce5f8',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Open Privacy Dashboard
          </button>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={AlertTriangle}
            title="Emergency Controls"
            description="Fast actions for moments when privacy and safety need immediate attention."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            <ActionCard
              icon={ShieldAlert}
              title="Activate Emergency Privacy"
              description="Apply emergency privacy restrictions immediately."
              danger
              onClick={() =>
                handleAction('Emergency Privacy', '/emergency-privacy')
              }
            />

            <ActionCard
              icon={Lock}
              title="Panic Lock"
              description="Lock Aarush and hide protected content."
              danger
              onClick={() => navigate('/lock')}
            />

            <ActionCard
              icon={Lock}
              title="Instant App Lock"
              description="Require authentication before continuing."
              onClick={() => navigate('/lock')}
            />

            <ActionCard
              icon={Shield}
              title="Lock Chats"
              description="Prepare private conversations for immediate locking."
              onClick={() => navigate('/chat-settings')}
            />

            <ActionCard
              icon={Eye}
              title="Hide Sensitive Media"
              description="Restrict private media from immediate viewing."
              onClick={() => showMessage('Sensitive media controls are ready.')}
            />

            <ActionCard
              icon={LogOutIcon}
              title="Secure Logout"
              description="Review session controls before signing out."
              onClick={() => navigate('/session-management')}
            />

            <ActionCard
              icon={Bell}
              title="Disable Notifications"
              description="Silence notifications during an emergency."
              onClick={() => showMessage('Emergency notification control is ready.')}
            />

            <ActionCard
              icon={MonitorSmartphone}
              title="Emergency Session Revoke"
              description="Prepare to revoke access from other devices."
              danger
              onClick={() => navigate('/session-management')}
            />
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Bell}
            title="Security Notifications"
            description="Choose which security events should be reported to you."
          />

          {[
            ['login-alerts', 'Login Alerts', 'Notify me about account logins.', Bell],
            ['new-device-alerts', 'New Device Alerts', 'Notify me when a device signs in.', MonitorSmartphone],
            ['password-alerts', 'Password Change Alerts', 'Notify me after password changes.', KeyRound],
            ['screenshot-alerts', 'Screenshot Alerts', 'Notify me about protected screenshots.', ScreenShare],
            ['recording-alerts', 'Screen Recording Alerts', 'Notify me about protected recordings.', Video],
            ['expiry-alerts', 'Session Expiry Alerts', 'Notify me when a session expires.', Clock3],
            ['emergency-alerts', 'Emergency Privacy Alerts', 'Notify me when emergency privacy is activated.', ShieldAlert],
            ['report-alerts', 'Security Report Alerts', 'Notify me when a security report is ready.', Sparkles],
          ].map(([id, title, description, Icon]) => (
            <SecurityRow
              key={id}
              icon={Icon}
              title={title}
              description={description}
              enabled={true}
              onToggle={() => showMessage(`${title} preference is ready for persistence.`)}
            />
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={RefreshCw}
            title="Background Security Systems"
            description="Internal systems that continuously protect your Aarush session."
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
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#dfe7fa',
                      fontSize: '0.68rem',
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
            title="Aarush AI Security (Coming Soon)"
            description="Future AI-powered protection features are prepared for the security platform."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {aiSecurityItems.map((item) => {
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