import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Check,
  ChevronLeft,
  Clipboard,
  Clock3,
  Download,
  Eye,
  FileCheck,
  Fingerprint,
  Globe2,
  Lock,
  MapPin,
  RefreshCw,
  ScanSearch,
  ScreenShare,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
  Video,
  Wifi,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import PrivacyInnovationCard from '../components/PrivacyInnovationCard';
import usePrivacyInnovations from '../hooks/usePrivacyInnovations';

const timeoutOptions = [
  ['immediately', 'Immediately'],
  ['5', '5 seconds'],
  ['15', '15 seconds'],
  ['30', '30 seconds'],
  ['60', '1 minute'],
  ['300', '5 minutes'],
  ['600', '10 minutes'],
  ['1800', '30 minutes'],
  ['3600', '1 hour'],
];

const microLockOptions = [
  ['chats', 'Lock Individual Chats', 'Protect selected conversations.'],
  ['memories', 'Lock Memories', 'Protect private memories and media.'],
  ['securityPages', 'Lock Security Pages', 'Protect security and privacy controls.'],
  ['paymentAreas', 'Lock Payment Areas', 'Protect future payment surfaces.'],
  ['settings', 'Lock Settings', 'Protect account and application settings.'],
  ['aiConversations', 'Lock AI Conversations', 'Protect private AI conversations.'],
  ['hiddenVault', 'Lock Hidden Vault', 'Protect encrypted hidden storage.'],
  ['profile', 'Lock Profile', 'Protect sensitive profile information.'],
];

const clipboardOptions = [
  ['autoClear', 'Auto Clear Clipboard', 'Clear sensitive clipboard data automatically.'],
  ['clearAfter10', 'Clear After 10 Seconds', 'Remove copied data after ten seconds.'],
  ['clearAfter30', 'Clear After 30 Seconds', 'Remove copied data after thirty seconds.'],
  ['clearAfter60', 'Clear After 1 Minute', 'Remove copied data after one minute.'],
  ['clearAfter300', 'Clear After 5 Minutes', 'Remove copied data after five minutes.'],
  ['clearOnExit', 'Clear On App Exit', 'Clear sensitive data when Aarush closes.'],
  ['preventHistory', 'Prevent Clipboard History', 'Reduce exposure through clipboard history.'],
  ['encryptTemporarily', 'Encrypt Clipboard Temporarily', 'Prepare encrypted clipboard storage.'],
  ['warnBeforeCopy', 'Warn Before Copying Sensitive Data', 'Warn before copying sensitive content.'],
  ['detectPasswordCopy', 'Detect Password Copy', 'Identify copied passwords and credentials.'],
];

const automationOptions = [
  ['autoBlurSensitive', 'Auto Blur Sensitive Content', 'Blur sensitive content in risky contexts.', Eye],
  ['autoHideNotifications', 'Auto Hide Notifications', 'Hide notification details automatically.', Bell],
  ['autoLockPublicMode', 'Auto Lock Public Mode', 'Lock when public-mode privacy is active.', Lock],
  ['autoEmergencyPrivacy', 'Auto Enable Emergency Privacy', 'Prepare emergency privacy for severe risk.', ShieldAlert],
  ['autoProtectClipboard', 'Auto Protect Clipboard', 'Apply clipboard protections automatically.', Clipboard],
  ['autoHideProfileActivity', 'Auto Hide Profile Activity', 'Reduce profile activity exposure.', UserRound],
  ['autoInvisibleMode', 'Auto Enable Invisible Mode', 'Appear offline during privacy-sensitive periods.', Eye],
  ['autoMicroLock', 'Auto Activate Micro Lock', 'Lock only sensitive areas of the app.', Lock],
  ['autoRemoveTemporaryData', 'Auto Remove Temporary Data', 'Erase temporary protected data.', Shield],
];

const ambientModules = [
  ['Public Place Detection', 'Detect public environments before showing sensitive content.', Globe2],
  ['Bright Screen Detection', 'Reduce exposure when screen brightness is high.', Eye],
  ['Shoulder Surf Detection', 'Prepare visual privacy protection against nearby viewers.', Eye],
  ['Nearby Unknown Device Detection', 'Detect untrusted devices in the environment.', Wifi],
  ['External Display Detection', 'Adjust privacy when an external screen is connected.', ScreenShare],
  ['Shared Screen Detection', 'Protect content during screen sharing.', Video],
  ['Meeting Mode', 'Reduce interruptions and visible private signals.', Bell],
  ['Travel Mode', 'Apply stronger protections during travel.', MapPin],
  ['Night Privacy Mode', 'Adjust privacy during night-time use.', Clock3],
  ['Automatic Blur', 'Blur selected content automatically.', Eye],
  ['Automatic Lock', 'Lock protected areas when risk increases.', Lock],
  ['Automatic Notification Hiding', 'Hide notification details in public contexts.', Bell],
];

const timelineTypes = [
  ['Login events', Fingerprint],
  ['Logout events', Lock],
  ['Device changes', Wifi],
  ['Privacy setting changes', Shield],
  ['Hidden chat access', Clipboard],
  ['Memory access', Eye],
  ['Screenshot events', ScreenShare],
  ['Screen recording events', Video],
  ['Emergency Privacy activations', ShieldAlert],
  ['AI security actions', Sparkles],
  ['Trusted device changes', ShieldCheck],
  ['Audience changes', UsersIcon],
  ['Profile visibility changes', UserRound],
  ['Session revocations', Lock],
];

const futureLab = [
  ['Quantum Identity Shield', 'Prepare post-quantum identity protection.', Shield],
  ['Neural Unlock', 'Explore future neural authentication interfaces.', Fingerprint],
  ['Context-Aware Privacy', 'Adapt privacy to the complete environment.', Globe2],
  ['AI Environment Detection', 'Use AI to understand privacy context.', Sparkles],
  ['Invisible Collaboration Layer', 'Collaborate without exposing sensitive identity.', UserRound],
  ['Adaptive Security Bubble', 'Create a dynamic protected privacy boundary.', ShieldCheck],
  ['Smart Privacy Mesh', 'Coordinate privacy across trusted devices.', Wifi],
  ['Autonomous Privacy Intelligence', 'Automate privacy decisions with user control.', Sparkles],
];

function UsersIcon(props) {
  return <UserRound {...props} />;
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

function ToggleRow({ id, title, description, icon: Icon, checked, onChange }) {
  return (
    <div
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
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle ${title}`}
        onClick={() => onChange(id)}
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
    </div>
  );
}

function SystemStatus({ status }) {
  const color =
    status === 'Active'
      ? '#83e9c1'
      : status === 'Protected'
        ? '#8edfff'
        : status === 'Syncing'
          ? '#c8b8ff'
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

export default function PrivacyInnovations() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [clipboardMessage, setClipboardMessage] = useState('');
  const {
    state,
    score,
    level,
    toggle,
    setValue,
    setTimeoutValue,
    timeline,
    systems,
  } = usePrivacyInnovations();

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

  const handleInnovationAction = (title) => {
    showMessage(`${title} is ready for its platform integration.`);
  };

  const innovationActions = [
    ['Enable Micro Session Lock', 'Lock only sensitive sections instead of the entire app.', Lock],
    ['Secure Clipboard Now', 'Protect copied text, passwords, OTPs, links, and sensitive data.', Clipboard],
    ['Verify Screenshot', 'Check screenshot authenticity and tampering signals.', ScanSearch],
    ['Open Privacy Timeline', 'Review the complete history of privacy and security events.', Clock3],
    ['Activate Ambient Privacy', 'Prepare privacy behavior for surrounding environmental context.', Globe2],
    ['View Hologram Profile Card', 'Prepare a secure futuristic profile identity card.', Fingerprint],
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '7rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.52) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <TopBar
        pageTitle="Privacy Innovations"
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
              'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(77,215,255,0.1), rgba(255,79,216,0.08))',
            border: '1px solid rgba(124,92,255,0.25)',
            boxShadow:
              '0 24px 70px rgba(0,0,0,0.32), 0 0 32px rgba(124,92,255,0.12)',
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
                color: '#fff',
                boxShadow: '0 0 30px rgba(77,215,255,0.25)',
                flexShrink: 0,
              }}
            >
              <Sparkles size={29} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  color: '#f8faff',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                }}
              >
                Advanced Privacy Innovations
              </h1>

              <p
                style={{
                  margin: '0.45rem 0 0',
                  color: '#c1cce2',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                }}
              >
                Next-generation protection for sessions, clipboard, screenshots,
                identity, and environmental privacy.
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
                background: `conic-gradient(#61e8b4 ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
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
                  color: '#83edc1',
                  fontSize: '0.8rem',
                  fontWeight: 850,
                }}
              >
                <Sparkles size={14} />
                {level}
              </span>

              <p
                style={{
                  margin: '0.38rem 0 0',
                  color: '#aab7d0',
                  fontSize: '0.72rem',
                  lineHeight: 1.5,
                }}
              >
                Your privacy innovation layer is prepared for web, desktop,
                mobile, wearable, and future sensor integrations.
              </p>
            </div>
          </div>
        </section>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Instant Innovation Actions"
            description="Apply or open next-generation privacy controls."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {innovationActions.map(([title, description, Icon]) => (
              <PrivacyInnovationCard
                key={title}
                title={title}
                description={description}
                icon={Icon}
                onClick={() => handleInnovationAction(title)}
              />
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Lock}
            title="Micro Session Lock"
            description="Automatically lock only the sensitive part of the app instead of the entire application."
          />

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            {microLockOptions.map(([id, title, description]) => (
              <div
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.65rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Lock size={15} color="#aebcda" />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#e9efff',
                      fontSize: '0.72rem',
                    }}
                  >
                    {title}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.16rem',
                      color: '#8997b3',
                      fontSize: '0.63rem',
                    }}
                  >
                    {description}
                  </span>
                </span>

                <select
                  value={state.microTimeouts[id]}
                  onChange={(event) =>
                    setTimeoutValue(id, event.target.value)
                  }
                  style={{
                    minHeight: '2rem',
                    maxWidth: '7.2rem',
                    padding: '0 0.35rem',
                    borderRadius: '0.55rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#151b2b',
                    color: '#dce5f8',
                    fontSize: '0.6rem',
                  }}
                >
                  {timeoutOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  role="switch"
                  aria-checked={state.microSessionLock[id]}
                  aria-label={`Toggle ${title}`}
                  onClick={() => toggle('microSessionLock', id)}
                  style={{
                    width: '2.35rem',
                    height: '1.3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: state.microSessionLock[id]
                      ? 'flex-end'
                      : 'flex-start',
                    padding: '0.13rem',
                    border: 0,
                    borderRadius: '999px',
                    background: state.microSessionLock[id]
                      ? 'linear-gradient(135deg, #7c5cff, #4dd7ff)'
                      : 'rgba(255,255,255,0.12)',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '999px',
                      background: '#fff',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Clipboard}
            title="Secure Clipboard"
            description="Protect copied text, passwords, OTPs, links, and sensitive information."
          />

          {clipboardOptions.map(([id, title, description]) => (
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
              <Clipboard size={15} color="#aebcda" />

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
                aria-checked={state.clipboard[id]}
                aria-label={`Toggle ${title}`}
                onClick={() => toggle('clipboard', id)}
                style={{
                  width: '2.5rem',
                  height: '1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: state.clipboard[id]
                    ? 'flex-end'
                    : 'flex-start',
                  padding: '0.15rem',
                  border: 0,
                  borderRadius: '999px',
                  background: state.clipboard[id]
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
                  }}
                />
              </button>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              gap: '0.45rem',
              marginTop: '0.7rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setClipboardMessage('Sensitive clipboard was cleared.');
                showMessage('Secure Clipboard Now completed.');
              }}
              style={{
                minHeight: '2.6rem',
                flex: 1,
                border: 0,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              Secure Clipboard Now
            </button>

            <button
              type="button"
              onClick={() => setClipboardMessage('Clipboard authenticity state is ready for browser integration.')}
              style={{
                minHeight: '2.6rem',
                flex: 1,
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Test Clipboard
            </button>
          </div>

          {clipboardMessage ? (
            <p
              role="status"
              style={{
                margin: '0.6rem 0 0',
                color: '#83e9c1',
                fontSize: '0.65rem',
              }}
            >
              {clipboardMessage}
            </p>
          ) : null}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ScanSearch}
            title="Fake Screenshot Detector"
            description="Help detect manipulated, suspicious, or synthetic screenshots."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Screenshot Authenticity Check', 'Compare screenshot signals.', FileCheck],
              ['Metadata Verification', 'Review available metadata.', Fingerprint],
              ['Watermark Verification', 'Check Aarush ownership markers.', ShieldCheck],
              ['AI Manipulation Detection', 'Detect suspicious visual edits.', Sparkles],
              ['Deepfake Screenshot Detection', 'Prepare synthetic-image checks.', ScanSearch],
              ['Tampering Detection', 'Look for inconsistent image regions.', AlertTriangle],
              ['Share Authenticity Certificate', 'Create a future verification record.', Download],
              ['Verify Incoming Screenshot', 'Review screenshots before trusting them.', Eye],
            ].map(([title, description, Icon]) => (
              <PrivacyInnovationCard
                key={title}
                title={title}
                description={description}
                icon={Icon}
                onClick={() => handleInnovationAction(title)}
              />
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.4rem',
              marginTop: '0.7rem',
            }}
          >
            {['Analyze Screenshot', 'Mark Authentic', 'Mark Suspicious', 'Report Fake'].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleInnovationAction(label)}
                  style={{
                    minHeight: '2.4rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#dce5f8',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Clock3}
            title="Privacy Timeline"
            description="Display a complete history of privacy and security events."
          />

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            {timeline.map(([event, time, status, description]) => (
              <div
                key={event}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.55rem',
                  padding: '0.68rem',
                  borderRadius: '0.85rem',
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
                    background: status === 'Protected' ? '#72e9b8' : '#8edfff',
                    boxShadow: '0 0 9px rgba(114,233,184,0.7)',
                    flexShrink: 0,
                  }}
                />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#eaf0ff',
                      fontSize: '0.72rem',
                    }}
                  >
                    {event}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.18rem',
                      color: '#8997b3',
                      fontSize: '0.63rem',
                    }}
                  >
                    {time} · {description}
                  </span>
                </span>

                <span
                  style={{
                    color: status === 'Protected' ? '#83e9c1' : '#8edfff',
                    fontSize: '0.59rem',
                    fontWeight: 800,
                  }}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.4rem',
              marginTop: '0.7rem',
            }}
          >
            {['Export Timeline', 'Filter Events', 'Search Timeline', 'Share Security Report'].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleInnovationAction(label)}
                  style={{
                    minHeight: '2.4rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#dce5f8',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Globe2}
            title="Ambient Privacy"
            description="Automatically adjust privacy based on the surrounding environment."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {ambientModules.map(([title, description, Icon]) => (
              <PrivacyInnovationCard
                key={title}
                title={title}
                description={description}
                icon={Icon}
                disabled
              />
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Fingerprint}
            title="Hologram Profile Card"
            description="A futuristic interactive identity card for secure profile sharing."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Animated Identity Card', Sparkles],
              ['Verified Identity Layer', ShieldCheck],
              ['Temporary Share Card', Clock3],
              ['QR Identity Projection', ScanSearch],
              ['AI Trust Score', BarChart3],
              ['Device Trust Badge', MonitorIcon],
              ['Privacy Badge', Shield],
              ['Secure Share Link', LinkIcon],
              ['One-Time Profile Card', Fingerprint],
              ['Expiring Identity Card', Clock3],
            ].map(([title, Icon]) => (
              <PrivacyInnovationCard
                key={title}
                title={title}
                description="Future secure identity-card capability."
                icon={Icon}
                disabled
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              marginTop: '0.7rem',
            }}
          >
            {['Generate Card', 'Share Securely', 'Regenerate', 'Disable Sharing'].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleInnovationAction(label)}
                  style={{
                    minHeight: '2.5rem',
                    padding: '0 0.7rem',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#dce5f8',
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Shield}
            title="Privacy Automation"
            description="Configure future AI-powered privacy rules."
          />

          {automationOptions.map(([id, title, description, Icon]) => (
            <ToggleRow
              key={id}
              id={id}
              title={title}
              description={description}
              icon={Icon}
              checked={state.automation[id]}
              onChange={() => toggle('automation', id)}
            />
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={RefreshCw}
            title="Background Innovation Systems"
            description="Internal services prepared for future web, native, wearable, and sensor integration."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {systems.map(([title, status]) => (
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
                <RefreshCw size={15} color="#a9b8d6" />

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
            title="Future Aarush Privacy Lab (Coming Soon)"
            description="Advanced privacy technologies are prepared as disabled architecture-ready modules."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {futureLab.map(([title, description, Icon]) => (
              <PrivacyInnovationCard
                key={title}
                title={title}
                description={description}
                icon={Icon}
                disabled
              />
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
      `}</style>
    </div>
  );
}

function MonitorIcon(props) {
  return <ShieldCheck {...props} />;
}

function LinkIcon(props) {
  return <Wifi {...props} />;
}