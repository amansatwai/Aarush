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
  EyeOff,
  FileLock2,
  Laptop,
  Lock,
  LogOut,
  MessageCircleOff,
  MonitorSmartphone,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserRoundX,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'aarush_emergency_privacy_settings';

const defaultControls = {
  logoutOtherDevices: false,
  hideProfile: false,
  lockChats: false,
  disableIncomingMessages: false,
  freezeAccountActivity: false,
  emergencyInvisibleMode: false,
};

const initialSecurityActions = [
  {
    id: 'security-1',
    title: 'Security session verified',
    description: 'The current device was identified as the protected device.',
    time: '08:40 AM',
    date: 'Today',
    icon: ShieldCheck,
    tone: 'success',
  },
  {
    id: 'security-2',
    title: 'Privacy review completed',
    description: 'Emergency controls are ready to activate.',
    time: '08:38 AM',
    date: 'Today',
    icon: Activity,
    tone: 'default',
  },
  {
    id: 'security-3',
    title: 'Screenshot Shield checked',
    description: 'Sensitive content protection is available.',
    time: '04:25 PM',
    date: 'Yesterday',
    icon: EyeOff,
    tone: 'warning',
  },
];

const controlDefinitions = [
  {
    key: 'logoutOtherDevices',
    title: 'Logout All Other Devices',
    description: 'Sign out every active device except the one you are currently using.',
    icon: LogOut,
  },
  {
    key: 'hideProfile',
    title: 'Hide Profile',
    description: 'Temporarily hide your profile from public visibility and search.',
    icon: UserRoundX,
  },
  {
    key: 'lockChats',
    title: 'Lock Chats',
    description: 'Protect all conversations with additional authentication.',
    icon: Lock,
  },
  {
    key: 'disableIncomingMessages',
    title: 'Disable Incoming Messages',
    description: 'Temporarily stop new messages and notifications.',
    icon: MessageCircleOff,
  },
  {
    key: 'freezeAccountActivity',
    title: 'Freeze Account Activity',
    description: 'Temporarily prevent posting, uploading, and profile changes.',
    icon: FileLock2,
  },
  {
    key: 'emergencyInvisibleMode',
    title: 'Emergency Invisible Mode',
    description: 'Hide your online presence and activity indicators across Aarush.',
    icon: EyeOff,
  },
];

function Toggle({ checked, onChange }) {
  return (
    <label
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '2.9rem',
        height: '1.6rem',
        padding: '0.18rem',
        borderRadius: '999px',
        background: checked
          ? 'linear-gradient(90deg, #ff4f7a, #ff4fd8)'
          : 'rgba(255,255,255,0.14)',
        cursor: 'pointer',
        transition: 'background 180ms ease',
        flexShrink: 0,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <span
        style={{
          width: '1.24rem',
          height: '1.24rem',
          borderRadius: '999px',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          transform: checked ? 'translateX(1.28rem)' : 'translateX(0)',
          transition: 'transform 180ms ease',
        }}
      />
    </label>
  );
}

function ControlCard({ control, checked, onChange }) {
  const Icon = control.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.9rem',
        borderRadius: '1.15rem',
        background: checked
          ? 'linear-gradient(135deg, rgba(255,79,122,0.14), rgba(124,92,255,0.08))'
          : 'rgba(255,255,255,0.045)',
        border: `1px solid ${
          checked ? 'rgba(255,79,122,0.24)' : 'rgba(255,255,255,0.07)'
        }`,
        boxShadow: checked ? '0 0 24px rgba(255,79,122,0.1)' : 'none',
        transition: 'background 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
      }}
    >
      <span
        style={{
          width: '2.6rem',
          height: '2.6rem',
          borderRadius: '0.85rem',
          display: 'grid',
          placeItems: 'center',
          background: checked
            ? 'linear-gradient(135deg, rgba(255,79,122,0.28), rgba(255,79,216,0.14))'
            : 'rgba(255,255,255,0.07)',
          color: checked ? '#ffb1c8' : '#a1aec8',
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <strong
          style={{
            display: 'block',
            color: '#eef3ff',
            fontSize: '0.86rem',
            fontWeight: 850,
          }}
        >
          {control.title}
        </strong>

        <span
          style={{
            display: 'block',
            marginTop: '0.25rem',
            color: '#8e9bb7',
            fontSize: '0.74rem',
            lineHeight: 1.45,
          }}
        >
          {control.description}
        </span>
      </span>

      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Section({ title, description, icon: Icon, children }) {
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
          gap: '0.65rem',
          marginBottom: '0.85rem',
        }}
      >
        <span
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '0.75rem',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, rgba(255,79,122,0.2), rgba(124,92,255,0.16))',
            color: '#ffb1c8',
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
        </span>
      </div>

      <div style={{ display: 'grid', gap: '0.55rem' }}>{children}</div>
    </section>
  );
}

function RecoveryButton({ icon: Icon, label, description, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        padding: '0.82rem',
        borderRadius: '1rem',
        border: `1px solid ${
          danger ? 'rgba(255,79,122,0.2)' : 'rgba(255,255,255,0.08)'
        }`,
        background: danger ? 'rgba(255,79,122,0.08)' : 'rgba(255,255,255,0.045)',
        color: danger ? '#ffb1c8' : '#eaf0ff',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: '0.75rem',
          display: 'grid',
          placeItems: 'center',
          background: danger
            ? 'rgba(255,79,122,0.14)'
            : 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
          color: danger ? '#ff9dbd' : '#dce8ff',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </span>

      <span style={{ flex: 1 }}>
        <strong style={{ display: 'block', fontSize: '0.82rem' }}>{label}</strong>
        <span
          style={{
            display: 'block',
            marginTop: '0.2rem',
            color: danger ? '#b98296' : '#8e9bb7',
            fontSize: '0.72rem',
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>
      </span>

      <ChevronRight size={16} />
    </button>
  );
}

export default function EmergencyPrivacy() {
  const navigate = useNavigate();

  const [controls, setControls] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      return stored
        ? { ...defaultControls, ...JSON.parse(stored) }
        : defaultControls;
    } catch {
      return defaultControls;
    }
  });

  const [securityActions, setSecurityActions] = useState(initialSecurityActions);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState('');

  const enabledCount = useMemo(
    () => Object.values(controls).filter(Boolean).length,
    [controls]
  );

  const updateControl = (key, value, shouldLog = true) => {
    const nextControls = {
      ...controls,
      [key]: value,
    };

    setControls(nextControls);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));

    if (shouldLog) {
      const control = controlDefinitions.find((item) => item.key === key);

      if (control) {
        const action = {
          id: `security-${Date.now()}`,
          title: `${control.title} ${value ? 'enabled' : 'disabled'}`,
          description: control.description,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          date: 'Today',
          icon: value ? ShieldAlert : CheckCircle2,
          tone: value ? 'danger' : 'success',
        };

        setSecurityActions((current) => [action, ...current]);
      }
    }
  };

  const activateEmergencyPrivacy = () => {
    const nextControls = {
      ...controls,
      hideProfile: true,
      lockChats: true,
      disableIncomingMessages: true,
      freezeAccountActivity: true,
      emergencyInvisibleMode: true,
    };

    setControls(nextControls);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));

    const action = {
      id: `security-${Date.now()}`,
      title: 'Emergency mode activated',
      description:
        'Profile hidden, chats locked, incoming messages disabled, activity frozen, and invisible mode enabled.',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: 'Today',
      icon: ShieldAlert,
      tone: 'danger',
    };

    setSecurityActions((current) => [action, ...current]);
    setShowConfirmation(false);
    setMessage('Emergency Privacy is now active.');
  };

  const restoreNormalProfile = () => {
    const nextControls = {
      ...controls,
      hideProfile: false,
      freezeAccountActivity: false,
    };

    setControls(nextControls);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));
    setMessage('Normal profile visibility has been restored.');
  };

  const unlockAllChats = () => {
    updateControl('lockChats', false);
    setMessage('All conversations are unlocked.');
  };

  const enableIncomingMessages = () => {
    updateControl('disableIncomingMessages', false);
    setMessage('Incoming messages are enabled.');
  };

  const restoreVisibility = () => {
    updateControl('hideProfile', false);
    setMessage('Profile visibility has been restored.');
  };

  const deactivateEmergencyMode = () => {
    const nextControls = {
      ...defaultControls,
      logoutOtherDevices: controls.logoutOtherDevices,
    };

    setControls(nextControls);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextControls));

    const action = {
      id: `security-${Date.now()}`,
      title: 'Emergency mode restored',
      description: 'Emergency privacy controls were deactivated.',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: 'Today',
      icon: CheckCircle2,
      tone: 'success',
    };

    setSecurityActions((current) => [action, ...current]);
    setMessage('Emergency mode has been deactivated.');
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
        'linear-gradient(135deg, rgba(255,79,122,0.22), rgba(124,92,255,0.16) 52%, rgba(77,215,255,0.09))',
      border: '1px solid rgba(255,79,122,0.22)',
      boxShadow: '0 24px 70px rgba(0,0,0,0.3), 0 0 34px rgba(255,79,122,0.1)',
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
      background: 'linear-gradient(135deg, #ff4f7a, #ff4fd8 52%, #7c5cff)',
      color: '#fff',
      boxShadow: '0 0 32px rgba(255,79,122,0.28)',
      flexShrink: 0,
    },
    statusPill: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      width: 'fit-content',
      marginTop: '0.7rem',
      padding: '0.42rem 0.6rem',
      borderRadius: '999px',
      background: 'rgba(5,8,15,0.32)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#ffe2ec',
      fontSize: '0.72rem',
      fontWeight: 800,
    },
    actionTimeline: {
      display: 'grid',
      gap: '0.65rem',
    },
    timelineItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.7rem',
      padding: '0.75rem',
      borderRadius: '1rem',
      background: 'rgba(255,255,255,0.045)',
      border: '1px solid rgba(255,255,255,0.07)',
    },
    timelineIcon: (tone) => ({
      width: '2.2rem',
      height: '2.2rem',
      borderRadius: '0.75rem',
      display: 'grid',
      placeItems: 'center',
      background:
        tone === 'danger'
          ? 'rgba(255,79,122,0.14)'
          : tone === 'warning'
            ? 'rgba(255,179,71,0.14)'
            : 'rgba(77,215,255,0.12)',
      color:
        tone === 'danger'
          ? '#ff9dbd'
          : tone === 'warning'
            ? '#ffdda4'
            : '#c9f5ff',
      flexShrink: 0,
    }),
    devicePanel: {
      display: 'grid',
      gap: '0.65rem',
      padding: '0.85rem',
      borderRadius: '1rem',
      background: 'rgba(255,255,255,0.045)',
      border: '1px solid rgba(255,255,255,0.07)',
    },
    deviceRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.7rem',
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 1300,
      display: 'grid',
      placeItems: 'center',
      padding: '1rem',
      background: 'rgba(2,5,10,0.74)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    },
    modal: {
      width: 'min(100%, 420px)',
      padding: '1rem',
      borderRadius: '1.35rem',
      background:
        'linear-gradient(180deg, rgba(17,22,35,0.99), rgba(9,13,22,0.99))',
      border: '1px solid rgba(255,79,122,0.2)',
      boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
    },
  };

  return (
    <div style={styles.page}>
      <TopBar pageTitle="Emergency Privacy" notificationCount={3} />

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
            Account protection
          </span>

          <button
            type="button"
            onClick={() => setShowConfirmation(true)}
            style={{
              ...styles.iconButton,
              background: 'rgba(255,79,122,0.12)',
              borderColor: 'rgba(255,79,122,0.2)',
              color: '#ffb1c8',
            }}
            aria-label="Activate emergency privacy"
          >
            <ShieldAlert size={17} />
          </button>
        </div>

        <section style={styles.hero}>
          <div
            style={{
              position: 'absolute',
              right: '-2.5rem',
              bottom: '-3rem',
              width: '11rem',
              height: '11rem',
              borderRadius: '999px',
              background: 'rgba(255,79,122,0.13)',
              filter: 'blur(2rem)',
              pointerEvents: 'none',
            }}
          />

          <div style={styles.heroContent}>
            <div style={styles.heroIcon}>
              <ShieldAlert size={34} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  color: '#fff7fa',
                  fontSize: '1.25rem',
                  lineHeight: 1.15,
                }}
              >
                Emergency Privacy Switch
              </h1>

              <p
                style={{
                  margin: '0.5rem 0 0',
                  color: '#ffe2ec',
                  fontSize: '0.84rem',
                  lineHeight: 1.55,
                }}
              >
                Protect your account instantly with one tap.
              </p>

              <span style={styles.statusPill}>
                <Activity size={13} />
                {enabledCount} emergency controls active
              </span>
            </div>
          </div>
        </section>

        <Section
          title="Emergency Protection Controls"
          description="Enable individual emergency protections or activate them together."
          icon={Shield}
        >
          {controlDefinitions.map((control) => (
            <ControlCard
              key={control.key}
              control={control}
              checked={controls[control.key]}
              onChange={(value) => {
                if (control.key === 'logoutOtherDevices' && value) {
                  setMessage('Other device logout has been queued for secure session processing.');
                }

                updateControl(control.key, value);
              }}
            />
          ))}
        </Section>

        <section
          style={{
            padding: '1rem',
            borderRadius: '1.35rem',
            background:
              'linear-gradient(135deg, rgba(255,79,122,0.2), rgba(255,79,216,0.1))',
            border: '1px solid rgba(255,79,122,0.24)',
            boxShadow: '0 18px 50px rgba(255,79,122,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
            <AlertTriangle size={20} color="#ffb1c8" />

            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', color: '#fff7fa', fontSize: '0.94rem' }}>
                One-Tap Emergency Button
              </strong>

              <p style={{ margin: '0.3rem 0 0', color: '#ffc9d9', fontSize: '0.76rem', lineHeight: 1.5 }}>
                Activates profile hiding, chat lock, incoming message blocking,
                invisible mode, and activity freeze after confirmation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmation(true)}
            style={{
              width: '100%',
              marginTop: '0.9rem',
              border: 0,
              borderRadius: '999px',
              padding: '0.9rem 1rem',
              background: 'linear-gradient(135deg, #ff4f7a, #ff4fd8)',
              color: '#fff',
              fontSize: '0.86rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 14px 28px rgba(255,79,122,0.2)',
            }}
          >
            Activate Emergency Privacy
          </button>
        </section>

        <Section
          title="Recovery Controls"
          description="Restore normal account behavior when the emergency has ended."
          icon={RefreshCw}
        >
          <RecoveryButton
            icon={UserRoundX}
            label="Restore Normal Profile"
            description="Return profile visibility and normal account discovery."
            onClick={restoreNormalProfile}
          />

          <RecoveryButton
            icon={Lock}
            label="Unlock All Chats"
            description="Remove the additional authentication requirement from conversations."
            onClick={unlockAllChats}
          />

          <RecoveryButton
            icon={MessageCircleOff}
            label="Enable Incoming Messages"
            description="Allow new messages and notifications again."
            onClick={enableIncomingMessages}
          />

          <RecoveryButton
            icon={EyeOff}
            label="Restore Visibility"
            description="Make your profile visible according to normal privacy settings."
            onClick={restoreVisibility}
          />

          <RecoveryButton
            icon={ShieldCheck}
            label="Deactivate Emergency Mode"
            description="Restore all emergency-controlled features to their normal state."
            onClick={deactivateEmergencyMode}
          />
        </Section>

        <Section
          title="Current Protected Device"
          description="This is the only device that remains logged in during emergency protection."
          icon={MonitorSmartphone}
        >
          <div style={styles.devicePanel}>
            <div style={styles.deviceRow}>
              <span
                style={{
                  width: '2.8rem',
                  height: '2.8rem',
                  borderRadius: '0.85rem',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, rgba(77,215,255,0.2), rgba(124,92,255,0.16))',
                  color: '#c9f5ff',
                  flexShrink: 0,
                }}
              >
                <Laptop size={18} />
              </span>

              <div style={{ flex: 1 }}>
                <strong
                  style={{
                    display: 'block',
                    color: '#f5f8ff',
                    fontSize: '0.86rem',
                  }}
                >
                  Aarush Development Device
                </strong>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.2rem',
                    color: '#8e9bb7',
                    fontSize: '0.72rem',
                  }}
                >
                  Current protected device
                </span>
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.38rem 0.52rem',
                  borderRadius: '999px',
                  background: 'rgba(82,232,170,0.12)',
                  border: '1px solid rgba(82,232,170,0.18)',
                  color: '#d7ffef',
                  fontSize: '0.68rem',
                  fontWeight: 850,
                  whiteSpace: 'nowrap',
                }}
              >
                <Check size={12} />
                Current session
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.5rem',
              }}
            >
              {[
                ['Device type', 'Desktop / Web'],
                ['Operating system', 'Windows'],
                ['Login time', '08:12 AM'],
                ['Session status', 'Protected'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '0.8rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span style={{ display: 'block', color: '#8996b2', fontSize: '0.68rem', fontWeight: 700 }}>
                    {label}
                  </span>
                  <strong style={{ display: 'block', marginTop: '0.25rem', color: '#eaf0ff', fontSize: '0.76rem' }}>
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          title="Recent Security Actions"
          description="Review recent emergency privacy and security activity."
          icon={Clock3}
        >
          <div style={styles.actionTimeline}>
            {securityActions.map((action) => {
              const Icon = action.icon;

              return (
                <div key={action.id} style={styles.timelineItem}>
                  <span style={styles.timelineIcon(action.tone)}>
                    <Icon size={16} />
                  </span>

                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', color: '#eef3ff', fontSize: '0.82rem' }}>
                      {action.title}
                    </strong>

                    <p style={{ margin: '0.25rem 0', color: '#8e9bb7', fontSize: '0.73rem', lineHeight: 1.45 }}>
                      {action.description}
                    </p>

                    <span style={{ color: '#74819c', fontSize: '0.68rem', fontWeight: 700 }}>
                      {action.date} · {action.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <section
          style={{
            padding: '0.85rem',
            borderRadius: '1rem',
            background: 'rgba(255,79,122,0.07)',
            border: '1px solid rgba(255,79,122,0.14)',
            color: '#ffc9d9',
            fontSize: '0.76rem',
            lineHeight: 1.55,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={15} />
            Emergency system status
          </div>

          Emergency controls are stored locally and structured for future
          Supabase integration with session management, device revocation,
          privacy permission rules, message delivery controls, account activity
          freezes, audit logging, optimistic updates, and realtime security events.
        </section>
      </main>

      <BottomNav />

      {showConfirmation ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowConfirmation(false)}
          style={styles.modalOverlay}
        >
          <div onClick={(event) => event.stopPropagation()} style={styles.modal}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '0.7rem',
              }}
            >
              <div>
                <span
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.8rem',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255,79,122,0.14)',
                    color: '#ff9dbd',
                  }}
                >
                  <ShieldAlert size={18} />
                </span>

                <h2 style={{ margin: '0.85rem 0 0', color: '#fff7fa', fontSize: '1.05rem' }}>
                  Activate Emergency Privacy?
                </h2>

                <p style={{ margin: '0.45rem 0 0', color: '#c8a4b1', fontSize: '0.8rem', lineHeight: 1.55 }}>
                  This will hide your profile, lock chats, stop incoming
                  messages, freeze account activity, and hide your presence.
                  Your current device will remain logged in.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                style={styles.iconButton}
                aria-label="Close confirmation"
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.55rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                style={{
                  flex: 1,
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '999px',
                  padding: '0.8rem',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#dce5f8',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={activateEmergencyPrivacy}
                style={{
                  flex: 1,
                  border: 0,
                  borderRadius: '999px',
                  padding: '0.8rem',
                  background: 'linear-gradient(135deg, #ff4f7a, #ff4fd8)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 850,
                  cursor: 'pointer',
                }}
              >
                Activate Now
              </button>
            </div>
          </div>
        </div>
      ) : null}

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