import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronLeft,
  Eye,
  Fingerprint,
  Globe2,
  Lock,
  MapPin,
  MonitorSmartphone,
  Radio,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Users,
  Video,
  Volume2,
  Watch,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import PanicOverlay from '../components/PanicOverlay';
import useEmergencyPrivacy from '../hooks/useEmergencyPrivacy';
import { setPanicPinEnabled } from '../utils/privacyProtection';

const protectionOptions = [
  ['hideOnlineStatus', 'Hide Online Status', 'Hide your current online presence.', Radio],
  ['hideLastSeen', 'Hide Last Seen', 'Hide your recent activity time.', Fingerprint],
  ['hideReadReceipts', 'Hide Read Receipts', 'Prevent read status from being shown.', Check],
  ['hideTypingStatus', 'Hide Typing Status', 'Hide when you are typing.', Volume2],
  ['hideActiveStatus', 'Hide Active Status', 'Reduce visible activity signals.', Eye],
  ['hideStoryVisibility', 'Hide Story Visibility', 'Restrict story visibility during an emergency.', Eye],
  ['hideProfileActivity', 'Hide Profile Activity', 'Reduce profile activity exposure.', UserRound],
  ['disableIncomingCalls', 'Disable Incoming Calls', 'Temporarily stop incoming calls.', Smartphone],
  ['disableIncomingMessages', 'Disable Incoming Messages', 'Temporarily stop incoming messages.', Users],
  ['disableFriendRequests', 'Disable New Friend Requests', 'Pause new connection requests.', UserRound],
];

const hiddenNotificationOptions = [
  ['hideMessageContent', 'Hide Message Content', 'Hide message text from notifications.', Bell],
  ['hideSenderName', 'Hide Sender Name', 'Remove sender identity from previews.', UserRound],
  ['hidePreview', 'Hide Preview', 'Show only a generic notification.', Eye],
  ['hideMediaPreview', 'Hide Media Preview', 'Prevent media thumbnails from appearing.', Video],
  ['showGenericNotification', 'Show Generic Notification', 'Use “Aarush: You have a new notification.”', Shield],
];

const backgroundSystems = [
  ['Emergency Privacy Engine', 'Active', ShieldAlert],
  ['Panic PIN Engine', 'Active', Fingerprint],
  ['Decoy Vault Engine', 'Active', Lock],
  ['Notification Privacy Engine', 'Active', Bell],
  ['Session Revoke Engine', 'Syncing', MonitorSmartphone],
  ['Device Protection Engine', 'Active', ShieldCheck],
  ['Realtime Emergency Sync', 'Syncing', RefreshCw],
  ['Security Logging Service', 'Active', Radio],
  ['Privacy Shield Engine', 'Active', Shield],
  ['Threat Monitoring', 'Syncing', AlertTriangle],
  ['Authentication Protection', 'Active', Fingerprint],
  ['Safe Mode Manager', 'Future', Lock],
];

const futureFeatures = [
  ['AI Threat Detection', 'Identify possible privacy threats automatically.', ShieldAlert],
  ['Forced Access Detection', 'Detect suspicious attempts to access protected data.', UserRound],
  ['Suspicious Unlock Detection', 'Identify unusual unlock patterns.', Fingerprint],
  ['Intelligent Safe Mode', 'Adapt safe-mode behavior to emergency context.', Shield],
  ['AI Panic Recommendation', 'Recommend the safest emergency action.', Sparkles],
  ['Automatic Decoy Activation', 'Open the decoy environment when risk is detected.', Lock],
  ['Emergency Privacy Guardian', 'Continuously monitor emergency privacy conditions.', ShieldCheck],
];

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

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      style={{
        width: '2.5rem',
        height: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        padding: '0.15rem',
        border: 0,
        borderRadius: '999px',
        background: checked
          ? 'linear-gradient(135deg, #7c5cff, #4dd7ff)'
          : 'rgba(255,255,255,0.12)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: '1.1rem',
          height: '1.1rem',
          borderRadius: '999px',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

function SystemStatus({ status }) {
  const color =
    status === 'Active'
      ? '#83e9c1'
      : status === 'Syncing'
        ? '#8edfff'
        : '#ffd28d';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        color,
        fontSize: '0.6rem',
        fontWeight: 800,
      }}
    >
      {status === 'Syncing' ? <RefreshCw size={10} /> : <span>●</span>}
      {status}
    </span>
  );
}

export default function EmergencyPrivacy() {
  const navigate = useNavigate();
  const [panicOpen, setPanicOpen] = useState(false);
  const [panicPinEnabled, setPanicPinEnabledState] = useState(false);
  const [panicPin, setPanicPin] = useState('');
  const [message, setMessage] = useState('');
  const [hiddenNotifications, setHiddenNotifications] = useState({
    hideMessageContent: true,
    hideSenderName: true,
    hidePreview: true,
    hideMediaPreview: true,
    showGenericNotification: true,
  });

  const {
    state,
    protections,
    activate,
    toggleProtection,
    lockApp,
    secureLogout,
    markDeviceSafe,
  } = useEmergencyPrivacy({
    onSecureLogout: async () => {
      navigate('/login', { replace: true });
    },
  });

  const score = useMemo(() => {
    const enabled = Object.values(protections).filter(Boolean).length;
    return state.active ? 100 : Math.min(76 + enabled * 2, 98);
  }, [protections, state.active]);

  const level =
    score >= 95
      ? 'Fully Protected'
      : score >= 80
        ? 'Strong'
        : score >= 60
          ? 'Moderate'
          : 'Exposed';

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

  const handleActivate = () => {
    activate();
    showMessage('Emergency privacy protections are now active.');
  };

  const handlePanicPinToggle = () => {
    const next = !panicPinEnabled;
    setPanicPinEnabledState(next);
    setPanicPinEnabled(next);
    showMessage(
      next
        ? 'Panic PIN is enabled for this device.'
        : 'Panic PIN is disabled.'
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '7rem',
        background:
          'radial-gradient(circle at top, rgba(52,30,68,0.5) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <TopBar
        pageTitle="Emergency Privacy"
        onChatClick={() => navigate('/chats')}
        onOneTapLock={lockApp}
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
              'linear-gradient(135deg, rgba(255,79,122,0.2), rgba(124,92,255,0.2), rgba(77,215,255,0.08))',
            border: '1px solid rgba(255,79,122,0.2)',
            boxShadow:
              '0 24px 70px rgba(0,0,0,0.32), 0 0 32px rgba(255,79,122,0.08)',
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
                background: 'linear-gradient(135deg, #ff4f7a, #7c5cff)',
                color: '#fff',
                boxShadow: '0 0 30px rgba(255,79,122,0.2)',
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={29} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  color: '#fff7fa',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                }}
              >
                Emergency Privacy Mode
              </h1>

              <p
                style={{
                  margin: '0.45rem 0 0',
                  color: '#e0cbd4',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                }}
              >
                Instantly secure your account, chats, media, sessions, and
                personal privacy.
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
                background: `conic-gradient(#ff86a2 ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
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
                  {score}
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
                  color: state.active ? '#ff9eb8' : '#ffd28d',
                  fontSize: '0.8rem',
                  fontWeight: 850,
                }}
              >
                <AlertTriangle size={14} />
                {state.active ? 'Fully Protected' : level}
              </span>

              <p
                style={{
                  margin: '0.38rem 0 0',
                  color: '#c6b5c0',
                  fontSize: '0.72rem',
                  lineHeight: 1.5,
                }}
              >
                {state.active
                  ? 'Emergency protections are active across selected privacy surfaces.'
                  : 'Activate emergency privacy when you need immediate protection.'}
              </p>
            </div>
          </div>
        </section>

        <GlassSection>
          <SectionHeader
            icon={ShieldAlert}
            title="Instant Emergency Actions"
            description="Apply emergency protections immediately."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {[
              ['Activate Emergency Privacy', 'Immediately enable selected emergency protections.', ShieldAlert, handleActivate],
              ['Lock Entire App', 'Instantly lock Aarush and require authentication.', Lock, lockApp],
              ['Hide Sensitive Chats', 'Hide selected conversations immediately.', Users, () => toggleProtection('hideChats')],
              ['Hide Memories', 'Hide private memories and media.', Eye, () => toggleProtection('hideMemories')],
              ['Disable Notifications', 'Prevent sensitive notification content from appearing.', Bell, () => toggleProtection('hideNotifications')],
              ['Secure Logout', 'Revoke active sessions and return to the login screen.', Shield, secureLogout],
            ].map(([title, description, Icon, onClick]) => (
              <button
                key={title}
                type="button"
                onClick={onClick}
                style={{
                  minHeight: '5.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255,79,122,0.15)',
                  background: 'rgba(255,79,122,0.07)',
                  color: '#fff',
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
                    background: 'rgba(255,79,122,0.14)',
                    color: '#ffb5c8',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} />
                </span>

                <span>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 850,
                    }}
                  >
                    {title}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.22rem',
                      color: '#c3aeba',
                      fontSize: '0.65rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Fingerprint}
            title="Panic PIN"
            description="A separate emergency PIN can open a safe decoy environment instead of the real account."
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <Fingerprint size={18} color="#ffb5c8" />

            <span style={{ minWidth: 0, flex: 1 }}>
              <strong
                style={{
                  display: 'block',
                  color: '#edf2ff',
                  fontSize: '0.75rem',
                }}
              >
                Enable Panic PIN
              </strong>

              <span
                style={{
                  display: 'block',
                  marginTop: '0.2rem',
                  color: '#8997b3',
                  fontSize: '0.65rem',
                  lineHeight: 1.4,
                }}
              >
                Panic activation creates a silent security event and keeps real
                chats, memories, and profile data hidden.
              </span>
            </span>

            <Toggle
              checked={panicPinEnabled}
              onChange={handlePanicPinToggle}
              label="Toggle Panic PIN"
            />
          </div>

          {panicPinEnabled ? (
            <input
              type="password"
              inputMode="numeric"
              placeholder="Set separate panic PIN"
              value={panicPin}
              onChange={(event) => setPanicPin(event.target.value)}
              style={{
                width: '100%',
                minHeight: '2.7rem',
                marginTop: '0.7rem',
                padding: '0 0.75rem',
                borderRadius: '0.8rem',
                border: '1px solid rgba(255,255,255,0.1)',
                outline: 0,
                background: '#151b2b',
                color: '#fff',
                fontSize: '0.78rem',
              }}
            />
          ) : null}

          <button
            type="button"
            onClick={() => setPanicOpen(true)}
            style={{
              width: '100%',
              minHeight: '2.7rem',
              marginTop: '0.7rem',
              border: 0,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #ff4f7a, #7c5cff)',
              color: '#fff',
              fontSize: '0.74rem',
              fontWeight: 850,
              cursor: 'pointer',
            }}
          >
            Test Panic Access
          </button>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Lock}
            title="Decoy Vault"
            description="A normal-looking safe environment containing dummy content."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Decoy Profile', UserRound],
              ['Decoy Chats', Users],
              ['Decoy Gallery', Eye],
              ['Decoy Memories', Sparkles],
              ['Decoy Settings', Shield],
              ['Decoy Activity', Radio],
            ].map(([title, Icon]) => (
              <div
                key={title}
                style={{
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#dce5f8',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                }}
              >
                <Icon size={15} color="#aebcda" />
                <span style={{ display: 'block', marginTop: '0.4rem' }}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Bell}
            title="Hidden Notifications"
            description="Prevent sensitive information from appearing on the lock screen."
          />

          {hiddenNotificationOptions.map(([id, title, description, Icon]) => (
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

              <Toggle
                checked={hiddenNotifications[id]}
                onChange={() =>
                  setHiddenNotifications((current) => ({
                    ...current,
                    [id]: !current[id],
                  }))
                }
                label={`Toggle ${title}`}
              />
            </div>
          ))}

          <p
            style={{
              margin: '0.7rem 0 0',
              color: '#8997b3',
              fontSize: '0.67rem',
              lineHeight: 1.5,
            }}
          >
            Lock Screen Privacy prevents sensitive information from appearing
            when the device is locked.
          </p>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Shield}
            title="Emergency Privacy Controls"
            description="Choose which account surfaces should be protected during an emergency."
          />

          {protectionOptions.map(([id, title, description, Icon]) => (
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

              <Toggle
                checked={protections[id]}
                onChange={() => toggleProtection(id)}
                label={`Toggle ${title}`}
              />
            </div>
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={MonitorSmartphone}
            title="Emergency Session Protection"
            description="Control active devices and temporarily restrict account access."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Logout All Other Devices', 'Revoke active sessions on other devices.', MonitorSmartphone, () => toggleProtection('logoutOtherDevices')],
              ['Lock All Sessions', 'Require verification across sessions.', Lock, () => toggleProtection('lockAllSessions')],
              ['Mark Current Device As Safe', 'Keep this device approved during the emergency.', ShieldCheck, markDeviceSafe],
              ['Revoke Untrusted Devices', 'Remove access from devices requiring verification.', ShieldAlert, () => toggleProtection('revokeUntrustedDevices')],
              ['Freeze Account Access', 'Temporarily prevent new logins until verified.', Shield, () => toggleProtection('freezeAccountAccess')],
            ].map(([title, description, Icon, onClick]) => (
              <button
                key={title}
                type="button"
                onClick={onClick}
                style={{
                  minHeight: '4.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dfe7f8',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={17} color="#b9c7e5" />

                <span>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 850,
                    }}
                  >
                    {title}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.2rem',
                      color: '#8997b3',
                      fontSize: '0.63rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Fingerprint}
            title="Panic Gesture"
            description="Native hardware and hidden triggers are prepared for future platform integration."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Power Button Multiple Press', Lock],
              ['Volume Button Sequence', Volume2],
              ['Secret Gesture', Sparkles],
              ['Shake Device', Smartphone],
              ['Smartwatch Trigger', Watch],
            ].map(([title, Icon]) => (
              <div
                key={title}
                style={{
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  opacity: 0.65,
                }}
              >
                <Icon size={15} color="#aebcda" />
                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.4rem',
                    color: '#dfe7f8',
                    fontSize: '0.67rem',
                  }}
                >
                  {title}
                </strong>
                <span
                  style={{
                    display: 'block',
                    marginTop: '0.25rem',
                    color: '#8997b3',
                    fontSize: '0.58rem',
                  }}
                >
                  Coming soon
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={RefreshCw}
            title="Background Emergency Systems"
            description="Internal systems that continuously protect emergency privacy state."
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
                    }}
                  >
                    {title}
                  </strong>

                  <span style={{ display: 'block', marginTop: '0.25rem' }}>
                    <SystemStatus status={status} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Aarush AI Emergency (Coming Soon)"
            description="Future AI-powered emergency protections are prepared for the Aarush security platform."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {futureFeatures.map(([title, description, Icon]) => (
              <div
                key={title}
                style={{
                  minHeight: '5rem',
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  opacity: 0.7,
                }}
              >
                <Icon size={16} color="#b8aaff" />

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.5rem',
                    color: '#e1e8f9',
                    fontSize: '0.74rem',
                  }}
                >
                  {title}
                </strong>

                <p
                  style={{
                    margin: '0.25rem 0 0',
                    color: '#8794b0',
                    fontSize: '0.65rem',
                    lineHeight: 1.4,
                  }}
                >
                  {description}
                </p>

                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.35rem',
                    padding: '0.22rem 0.4rem',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.07)',
                    color: '#9aa7c1',
                    fontSize: '0.55rem',
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
              border: '1px solid rgba(255,79,122,0.22)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
              color: '#f0dce4',
              fontSize: '0.74rem',
              lineHeight: 1.45,
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        ) : null}
      </main>

      <BottomNav />

      <PanicOverlay
        open={panicOpen}
        panicPin={panicPin}
        onClose={() => setPanicOpen(false)}
        onVerified={() => showMessage('Safe decoy environment opened.')}
      />

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