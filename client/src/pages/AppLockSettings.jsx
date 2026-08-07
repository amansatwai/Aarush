import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  Eye,
  Fingerprint,
  KeyRound,
  Lock,
  ScanFace,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  Watch,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useAppLock from '../hooks/useAppLock';
import {
  isBiometricAvailable,
  setBiometricPermissionState,
} from '../utils/deviceBiometric';

const autoLockOptions = [
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

const primaryMethods = [
  ['face', 'Face Unlock', 'Unlock Aarush using facial recognition when supported by the device.', ScanFace],
  ['fingerprint', 'Fingerprint Unlock', 'Unlock Aarush using fingerprint authentication.', Fingerprint],
  ['pin', 'PIN Lock', 'Protect Aarush with a secure numeric PIN.', KeyRound],
  ['pattern', 'Pattern Lock', 'Protect Aarush using a screen pattern.', Lock],
  ['password', 'Password Lock', 'Use a full password to unlock Aarush.', ShieldCheck],
];

const privacyLockOptions = [
  ['lockChats', 'Lock Chats', 'Require verification before opening private chats.'],
  ['lockMemories', 'Lock Memories', 'Protect private memories and saved media.'],
  ['lockProfile', 'Lock Profile Settings', 'Protect profile changes.'],
  ['lockSecurity', 'Lock Security Center', 'Protect security configuration changes.'],
  ['lockPrivacy', 'Lock Privacy Dashboard', 'Protect privacy activity and analytics.'],
  ['lockSessions', 'Lock Session Management', 'Protect session controls.'],
  ['lockExports', 'Lock Data Export', 'Require verification before requesting exports.'],
];

const backgroundSystems = [
  ['App Lock Engine', 'Active', Lock],
  ['Biometric Permission Manager', 'Active', Fingerprint],
  ['PIN Security Engine', 'Active', KeyRound],
  ['Pattern Security Engine', 'Future', Shield],
  ['Auto Lock Monitor', 'Active', Timer],
  ['Foreground Detection', 'Active', Eye],
  ['Background Detection', 'Active', ShieldAlert],
  ['Secure Unlock Manager', 'Active', ShieldCheck],
  ['Progressive Lockout Engine', 'Active', AlertTriangle],
  ['Privacy Lock Manager', 'Active', Lock],
  ['Emergency Lock Service', 'Syncing', ShieldAlert],
  ['Authentication Sync', 'Active', Sparkles],
];

const futureFeatures = [
  ['Eye Signature', 'Unlock using a personalized eye movement signature.', Eye],
  ['Heartbeat Unlock', 'Authenticate using wearable heartbeat verification.', Watch],
  ['Face Presence Verification', 'Ensure a real live face is present before unlocking.', ScanFace],
  ['Continuous Presence Protection', 'Re-lock the app when the verified user leaves the screen.', Shield],
  ['Smart Unlock Prediction', 'Predict the safest unlock method for the current context.', Sparkles],
  ['Behavioral Authentication', 'Recognize trusted interaction patterns.', ShieldCheck],
  ['Suspicious Unlock Detection', 'Identify unusual unlock attempts.', ShieldAlert],
  ['Shoulder Surf Detection', 'Detect visual privacy risks during unlocking.', Eye],
  ['AI Lock Recommendation', 'Recommend safer lock settings.', Sparkles],
  ['Risk-Based Authentication', 'Adjust verification based on account risk.', Shield],
  ['Adaptive Lock Security', 'Adapt protection to device and environment changes.', Lock],
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
      {status === 'Syncing' ? <Sparkles size={10} /> : <span>●</span>}
      {status}
    </span>
  );
}

export default function AppLockSettings() {
  const navigate = useNavigate();
  const appLock = useAppLock({ autoStart: false });
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(null);
  const [message, setMessage] = useState('');
  const [secondary, setSecondary] = useState({
    requireBiometricAfterBackground: true,
    requirePinAfterFailedBiometric: true,
    sensitiveActions: true,
  });
  const [privacyLocks, setPrivacyLocks] = useState({
    lockChats: true,
    lockMemories: false,
    lockProfile: false,
    lockSecurity: true,
    lockPrivacy: true,
    lockSessions: true,
    lockExports: true,
  });
  const [panicProtection, setPanicProtection] = useState({
    panicPin: false,
    emergencyGesture: true,
    secureLogout: false,
  });
  const [failedAttempts, setFailedAttempts] = useState('3');
  const [lockoutDuration, setLockoutDuration] = useState('30');

  const score = useMemo(() => {
    let value = 76;

    if (appLock.settings.enabled) value += 8;
    if (secondary.requireBiometricAfterBackground) value += 3;
    if (secondary.requirePinAfterFailedBiometric) value += 3;
    if (secondary.sensitiveActions) value += 3;
    if (Object.values(privacyLocks).filter(Boolean).length >= 5) value += 4;

    return Math.min(value, 100);
  }, [appLock.settings.enabled, privacyLocks, secondary]);

  const level =
    score >= 90 ? 'Excellent' : score >= 75 ? 'Strong' : score >= 55 ? 'Moderate' : 'Weak';

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

  const chooseMethod = async (method) => {
    if (method === 'face' || method === 'fingerprint') {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
      setPermissionOpen(true);
      return;
    }

    appLock.updateSettings({
      enabled: true,
      method,
    });

    showMessage(`${method[0].toUpperCase()}${method.slice(1)} lock selected.`);
  };

  const allowBiometric = () => {
    setBiometricPermissionState('allowed');

    appLock.updateSettings({
      enabled: true,
      method: 'biometric',
    });

    setPermissionOpen(false);
    showMessage('Biometric permission saved for this device.');
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
        pageTitle="App Lock & Biometrics"
        onChatClick={() => navigate('/chats')}
        onOneTapLock={() => appLock.lock()}
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
                color: '#fff',
                boxShadow: '0 0 30px rgba(77,215,255,0.25)',
                flexShrink: 0,
              }}
            >
              <Fingerprint size={29} />
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
                App Lock &amp; Biometric Security
              </h1>

              <p
                style={{
                  margin: '0.45rem 0 0',
                  color: '#c1cce2',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                }}
              >
                Protect Aarush with biometric authentication, PIN, pattern,
                and advanced privacy locks.
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
                <Check size={14} />
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
                Your protection strength is based on enabled lock methods,
                secondary verification, and privacy locks.
              </p>
            </div>
          </div>
        </section>

        <GlassSection>
          <SectionHeader
            icon={ShieldCheck}
            title="Primary Lock Methods"
            description="Only one primary lock method should be active at a time."
          />

          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {primaryMethods.map(([id, title, description, Icon]) => {
              const active =
                id === 'face' || id === 'fingerprint'
                  ? appLock.settings.method === 'biometric'
                  : appLock.settings.method === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => chooseMethod(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.8rem',
                    borderRadius: '1rem',
                    border: active
                      ? '1px solid rgba(124,92,255,0.34)'
                      : '1px solid rgba(255,255,255,0.07)',
                    background: active
                      ? 'linear-gradient(135deg, rgba(124,92,255,0.15), rgba(77,215,255,0.06))'
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
                      background: 'rgba(124,92,255,0.13)',
                      color: '#c9c0ff',
                      flexShrink: 0,
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
                      {title}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.2rem',
                        color: '#8d9ab6',
                        fontSize: '0.66rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {description}
                    </span>
                  </span>

                  {active ? <Check size={17} color="#83e9c1" /> : null}
                </button>
              );
            })}
          </div>

          {biometricAvailable === false ? (
            <p
              style={{
                margin: '0.7rem 0 0',
                color: '#ffd28d',
                fontSize: '0.68rem',
              }}
            >
              Browser biometric authentication is not available on this
              device. PIN and password protection remain available.
            </p>
          ) : null}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Shield}
            title="Secondary Protection"
            description="Add extra verification around backgrounding and sensitive actions."
          />

          {[
            [
              'requireBiometricAfterBackground',
              'Require Biometric After App Background',
              'Ask for biometric authentication when Aarush returns from the background.',
            ],
            [
              'requirePinAfterFailedBiometric',
              'Require PIN After Failed Biometric',
              'Fall back to a PIN after biometric verification fails.',
            ],
            [
              'sensitiveActions',
              'Re-authenticate Before Sensitive Actions',
              'Require verification before account deletion, session revoke, security, privacy, and export actions.',
            ],
          ].map(([id, title, description]) => (
            <div
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.7rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <ShieldCheck size={15} color="#aebcda" />

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

              <Toggle
                checked={secondary[id]}
                onChange={() =>
                  setSecondary((current) => ({
                    ...current,
                    [id]: !current[id],
                  }))
                }
                label={`Toggle ${title}`}
              />
            </div>
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Timer}
            title="Automatic Lock"
            description="Automatically lock Aarush after inactivity or when the app leaves the foreground."
          />

          <select
            value={appLock.settings.autoLock}
            onChange={(event) =>
              appLock.updateSettings({ autoLock: event.target.value })
            }
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
            {autoLockOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <p
            style={{
              margin: '0.6rem 0 0',
              color: '#8997b3',
              fontSize: '0.67rem',
              lineHeight: 1.5,
            }}
          >
            Automatically lock Aarush after the selected inactivity period or
            when the app leaves the foreground.
          </p>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Lock}
            title="Privacy Lock"
            description="Require biometric or PIN verification before opening protected areas."
          />

          {privacyLockOptions.map(([id, title, description]) => (
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
              <Lock size={15} color="#aebcda" />

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
                checked={privacyLocks[id]}
                onChange={() =>
                  setPrivacyLocks((current) => ({
                    ...current,
                    [id]: !current[id],
                  }))
                }
                label={`Toggle ${title}`}
              />
            </div>
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ShieldAlert}
            title="Panic Protection"
            description="Prepare immediate lock and safe-environment controls."
          />

          {[
            ['panicPin', 'Panic PIN', 'Entering a special PIN opens a safe decoy environment.'],
            ['emergencyGesture', 'Emergency Lock Gesture', 'Instantly lock the app from any screen.'],
            ['secureLogout', 'Secure Logout', 'Immediately revoke active sessions and return to the login screen.'],
          ].map(([id, title, description]) => (
            <div
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.7rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <AlertTriangle size={15} color="#ffbe7d" />

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
                checked={panicProtection[id]}
                onChange={() =>
                  setPanicProtection((current) => ({
                    ...current,
                    [id]: !current[id],
                  }))
                }
                label={`Toggle ${title}`}
              />
            </div>
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={AlertTriangle}
            title="Progressive Lockout Protection"
            description="Every cycle allows three failed attempts. Each completed cycle increases the lockout duration."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.55rem',
            }}
          >
            <label
              style={{
                display: 'grid',
                gap: '0.35rem',
                color: '#cbd6ea',
                fontSize: '0.7rem',
                fontWeight: 750,
              }}
            >
              Attempts per cycle
              <select
                value={failedAttempts}
                onChange={(event) => setFailedAttempts(event.target.value)}
                style={{
                  minHeight: '2.6rem',
                  padding: '0 0.65rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#151b2b',
                  color: '#edf3ff',
                }}
              >
                <option value="3">3 attempts</option>
              </select>
            </label>

            <label
              style={{
                display: 'grid',
                gap: '0.35rem',
                color: '#cbd6ea',
                fontSize: '0.7rem',
                fontWeight: 750,
              }}
            >
              Initial lockout
              <select
                value={lockoutDuration}
                onChange={(event) => setLockoutDuration(event.target.value)}
                style={{
                  minHeight: '2.6rem',
                  padding: '0 0.65rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#151b2b',
                  color: '#edf3ff',
                }}
              >
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
                <option value="900">15 minutes</option>
              </select>
            </label>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '0.35rem',
              marginTop: '0.75rem',
            }}
          >
            {[
              ['Cycle 1', '3 failed attempts', '30 seconds'],
              ['Cycle 2', '3 failed attempts', '1 minute'],
              ['Cycle 3', '3 failed attempts', '5 minutes'],
              ['Cycle 4', '3 failed attempts', '15 minutes'],
              ['Cycle 5', '3 failed attempts', '30 minutes'],
              ['Cycle 6', '3 failed attempts', '1 hour'],
              ['Cycle 7', '3 failed attempts', 'Until verified'],
            ].map(([cycle, attempts, duration]) => (
              <div
                key={cycle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  padding: '0.5rem 0.6rem',
                  borderRadius: '0.65rem',
                  background: 'rgba(255,255,255,0.035)',
                  color: '#aab7d0',
                  fontSize: '0.63rem',
                }}
              >
                <strong style={{ color: '#e3eaf9' }}>{cycle}</strong>
                <span>{attempts}</span>
                <span style={{ color: '#ffd28d' }}>{duration}</span>
              </div>
            ))}
          </div>

          <p
            style={{
              margin: '0.7rem 0 0',
              color: '#8997b3',
              fontSize: '0.67rem',
              lineHeight: 1.5,
            }}
          >
            After repeated failed cycles, Aarush requires Face Unlock,
            Fingerprint Unlock, the account password, or OTP verification.
            Every completed cycle is recorded in the local security log and is
            ready for Supabase audit synchronization.
          </p>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Background Lock Systems"
            description="Internal services that continuously protect the application."
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
            title="Aarush AI Lock (Coming Soon)"
            description="Future AI-powered protection features are prepared for the lock architecture."
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
                  minHeight: '5.1rem',
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  opacity: 0.7,
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
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        ) : null}
      </main>

      <BottomNav />

      {permissionOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
            background: 'rgba(4,7,13,0.76)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              width: 'min(100%, 420px)',
              padding: '1.2rem',
              borderRadius: '1.35rem',
              background: '#111827',
              border: '1px solid rgba(124,92,255,0.28)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
            }}
          >
            <ShieldCheck size={27} color="#8edfff" />

            <h2
              style={{
                margin: '0.7rem 0 0',
                color: '#f4f7ff',
                fontSize: '1.05rem',
              }}
            >
              Enable biometric protection?
            </h2>

            <p
              style={{
                margin: '0.55rem 0 0',
                color: '#a5b2cb',
                fontSize: '0.74rem',
                lineHeight: 1.55,
              }}
            >
              Aarush uses the operating system’s biometric verification. Your
              biometric data stays on the device and is not sent to Aarush.
              Aarush stores only permission state and security preferences.
            </p>

            <ul
              style={{
                margin: '0.8rem 0',
                paddingLeft: '1rem',
                color: '#c5d0e5',
                fontSize: '0.7rem',
                lineHeight: 1.65,
              }}
            >
              <li>Biometric data is handled by the operating system.</li>
              <li>Aarush does not receive or store biometric images.</li>
              <li>Permission can be revoked in device settings.</li>
            </ul>

            {biometricAvailable === false ? (
              <p
                style={{
                  color: '#ffd28d',
                  fontSize: '0.68rem',
                  lineHeight: 1.4,
                }}
              >
                No compatible browser biometric authenticator was detected.
                You can choose Not Now and use a PIN or password.
              </p>
            ) : null}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                marginTop: '0.9rem',
              }}
            >
              <button
                type="button"
                onClick={() => setPermissionOpen(false)}
                style={{
                  minHeight: '2.7rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#dce5f8',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Not Now
              </button>

              <button
                type="button"
                onClick={allowBiometric}
                disabled={biometricAvailable === false}
                style={{
                  minHeight: '2.7rem',
                  border: 0,
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                  color: '#fff',
                  fontSize: '0.74rem',
                  fontWeight: 850,
                  cursor: biometricAvailable === false ? 'not-allowed' : 'pointer',
                  opacity: biometricAvailable === false ? 0.5 : 1,
                }}
              >
                Allow
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                showMessage(
                  'Biometric verification is performed by the operating system and remains on the device.'
                )
              }
              style={{
                width: '100%',
                minHeight: '2.2rem',
                marginTop: '0.45rem',
                border: 0,
                borderRadius: '999px',
                background: 'transparent',
                color: '#93a0bb',
                fontSize: '0.68rem',
                cursor: 'pointer',
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      ) : null}

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