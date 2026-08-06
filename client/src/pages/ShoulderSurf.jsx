import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  EyeOff,
  Lock,
  MapPin,
  Maximize,
  MessageCircle,
  MonitorSmartphone,
  ScanFace,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Users,
  Video,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'aarush_shoulder_surf_settings';

const defaultSettings = {
  blurProfile: false,
  blurChats: false,
  blurMedia: false,
  blurNotifications: true,
  blurStories: true,
  blurReels: false,
  blurSearch: false,
  blurUpload: false,
  publicPlaces: false,
  multipleFaces: false,
  screenRecording: false,
  screenshotDetection: true,
};

const protectionFeatures = [
  {
    key: 'blurProfile',
    label: 'Blur Profile',
    description: 'Hide profile information from people nearby.',
    icon: UserRound,
  },
  {
    key: 'blurChats',
    label: 'Blur Chats',
    description: 'Temporarily obscure all conversations from nearby viewers.',
    icon: MessageCircle,
  },
  {
    key: 'blurMedia',
    label: 'Blur Photos & Videos',
    description: 'Blur media previews across the app.',
    icon: Video,
  },
  {
    key: 'blurNotifications',
    label: 'Blur Notifications',
    description: 'Hide notification content while keeping alerts visible.',
    icon: Bell,
  },
  {
    key: 'blurStories',
    label: 'Blur Stories',
    description: 'Blur story previews and viewer information.',
    icon: Sparkles,
  },
  {
    key: 'blurReels',
    label: 'Blur Reels',
    description: 'Blur reel previews and engagement details.',
    icon: Video,
  },
  {
    key: 'blurSearch',
    label: 'Blur Search Results',
    description: 'Hide usernames and search suggestions.',
    icon: EyeOff,
  },
  {
    key: 'blurUpload',
    label: 'Blur Upload Screen',
    description: 'Hide captions, hashtags, tags, and media while uploading.',
    icon: Smartphone,
  },
];

const smartFeatures = [
  {
    key: 'publicPlaces',
    label: 'Auto Blur in Public Places',
    description: 'Automatically enable protection when you appear to be in a public environment.',
    icon: MapPin,
  },
  {
    key: 'multipleFaces',
    label: 'Auto Blur When Multiple Faces Are Detected',
    description: 'Trigger protection when another person is detected nearby.',
    icon: ScanFace,
  },
  {
    key: 'screenRecording',
    label: 'Auto Blur During Screen Recording',
    description: 'Enable blur while recording is active.',
    icon: MonitorSmartphone,
  },
  {
    key: 'screenshotDetection',
    label: 'Auto Blur During Screenshot Detection',
    description: 'Enable blur when screenshots are detected.',
    icon: Smartphone,
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
          ? 'linear-gradient(90deg, #7c5cff, #4dd7ff)'
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

function ProtectionCard({ feature, checked, onChange }) {
  const Icon = feature.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.9rem',
        borderRadius: '1.15rem',
        background: checked
          ? 'linear-gradient(135deg, rgba(124,92,255,0.16), rgba(77,215,255,0.07))'
          : 'rgba(255,255,255,0.045)',
        border: `1px solid ${
          checked ? 'rgba(124,92,255,0.24)' : 'rgba(255,255,255,0.07)'
        }`,
        boxShadow: checked ? '0 0 24px rgba(124,92,255,0.1)' : 'none',
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
            ? 'linear-gradient(135deg, rgba(124,92,255,0.3), rgba(77,215,255,0.16))'
            : 'rgba(255,255,255,0.07)',
          color: checked ? '#e9e5ff' : '#9ba8c3',
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
          {feature.label}
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
          {feature.description}
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

function QuickMode({ title, description, icon: Icon, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minWidth: '10rem',
        flex: '1 1 10rem',
        padding: '0.85rem',
        borderRadius: '1.1rem',
        border: `1px solid ${
          active ? 'rgba(124,92,255,0.32)' : 'rgba(255,255,255,0.08)'
        }`,
        background: active
          ? 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.1))'
          : 'rgba(255,255,255,0.045)',
        color: '#f2f6ff',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: active ? '0 0 24px rgba(124,92,255,0.14)' : 'none',
      }}
    >
      <span
        style={{
          width: '2.1rem',
          height: '2.1rem',
          borderRadius: '0.75rem',
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(255,255,255,0.08)',
          color: '#dce8ff',
        }}
      >
        <Icon size={16} />
      </span>

      <strong
        style={{
          display: 'block',
          marginTop: '0.55rem',
          fontSize: '0.82rem',
        }}
      >
        {title}
      </strong>

      <span
        style={{
          display: 'block',
          marginTop: '0.25rem',
          color: '#8e9bb7',
          fontSize: '0.7rem',
          lineHeight: 1.4,
        }}
      >
        {description}
      </span>
    </button>
  );
}

export default function ShoulderSurf() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [lastActivation, setLastActivation] = useState('Not activated yet');
  const [activeMode, setActiveMode] = useState('');
  const [message, setMessage] = useState('');

  const activeProtectionCount = useMemo(
    () =>
      Object.entries(settings).filter(
        ([key, value]) =>
          value && ['blurProfile', 'blurChats', 'blurMedia', 'blurNotifications', 'blurStories', 'blurReels', 'blurSearch', 'blurUpload'].includes(key)
      ).length,
    [settings]
  );

  const isMaximumProtectionActive = useMemo(
    () =>
      ['blurProfile', 'blurChats', 'blurMedia', 'blurNotifications', 'blurStories', 'blurReels', 'blurSearch', 'blurUpload'].every(
        (key) => settings[key]
      ),
    [settings]
  );

  const updateSetting = (key, value) => {
    const nextSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(nextSettings);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
    setLastActivation(new Date().toLocaleTimeString());
    setMessage(`${key} protection has been ${value ? 'enabled' : 'disabled'}.`);
  };

  const applyMode = (mode) => {
    const base = {
      ...settings,
      blurProfile: false,
      blurChats: false,
      blurMedia: false,
      blurNotifications: false,
      blurStories: false,
      blurReels: false,
      blurSearch: false,
      blurUpload: false,
    };

    if (mode === 'light') {
      base.blurNotifications = true;
      base.blurStories = true;
    }

    if (mode === 'balanced') {
      base.blurProfile = true;
      base.blurChats = true;
      base.blurNotifications = true;
    }

    if (mode === 'maximum') {
      base.blurProfile = true;
      base.blurChats = true;
      base.blurMedia = true;
      base.blurNotifications = true;
      base.blurStories = true;
      base.blurReels = true;
      base.blurSearch = true;
      base.blurUpload = true;
    }

    setSettings(base);
    setActiveMode(mode);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(base));
    setLastActivation(new Date().toLocaleTimeString());
    setMessage(`${mode} protection is active.`);
  };

  const activateInstantPrivacy = () => {
    applyMode('maximum');
    setMessage('Instant Privacy activated. Maximum protection is now enabled.');
  };

  const handleEmergencyRoute = () => {
    navigate('/emergency-privacy');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '6.8rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <TopBar pageTitle="Shoulder Surf" notificationCount={3} />

      <main
        style={{
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0.9rem 0.9rem 0',
          display: 'grid',
          gap: '0.9rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.7rem',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/profile')}
            style={{
              width: '2.65rem',
              height: '2.65rem',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
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
            Privacy protection
          </span>

          <button
            type="button"
            onClick={activateInstantPrivacy}
            style={{
              width: '2.65rem',
              height: '2.65rem',
              borderRadius: '999px',
              border: '1px solid rgba(255,79,216,0.22)',
              background: 'rgba(255,79,216,0.1)',
              color: '#ffb9e1',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
            aria-label="Activate instant privacy"
          >
            <Shield size={17} />
          </button>
        </div>

        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '1.25rem',
            borderRadius: '1.5rem',
            background:
              'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.1) 52%, rgba(255,79,216,0.08))',
            border: '1px solid rgba(124,92,255,0.24)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.3), 0 0 34px rgba(124,92,255,0.12)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: '-2.5rem',
              bottom: '-3rem',
              width: '10rem',
              height: '10rem',
              borderRadius: '999px',
              background: 'rgba(77,215,255,0.12)',
              filter: 'blur(2rem)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '4.8rem',
                height: '4.8rem',
                borderRadius: '1.4rem',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
                boxShadow: '0 0 30px rgba(77,215,255,0.25)',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={34} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  color: '#f8faff',
                  fontSize: '1.25rem',
                  lineHeight: 1.15,
                }}
              >
                Shoulder Surf Protection
              </h1>

              <p
                style={{
                  margin: '0.5rem 0 0',
                  color: '#d5e0f5',
                  fontSize: '0.84rem',
                  lineHeight: 1.55,
                }}
              >
                Protect your screen when someone is looking over your shoulder.
              </p>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginTop: '1rem',
              color: '#d8f8ff',
              fontSize: '0.76rem',
              fontWeight: 800,
            }}
          >
            <Activity size={14} />
            {activeProtectionCount} active protections
          </div>
        </section>

        <Section
          title="Main Protection"
          description="Choose which areas of Aarush should be obscured from nearby viewers."
          icon={Shield}
        >
          {protectionFeatures.map((feature) => (
            <ProtectionCard
              key={feature.key}
              feature={feature}
              checked={settings[feature.key]}
              onChange={(value) => updateSetting(feature.key, value)}
            />
          ))}
        </Section>

        <Section
          title="Quick Privacy Modes"
          description="Use a preset to enable a protection level instantly."
          icon={Sparkles}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
            }}
          >
            <QuickMode
              title="Light Protection"
              description="Blur notifications and stories."
              icon={EyeOff}
              active={activeMode === 'light'}
              onClick={() => applyMode('light')}
            />

            <QuickMode
              title="Balanced Protection"
              description="Blur chats, notifications, and profile."
              icon={Shield}
              active={activeMode === 'balanced'}
              onClick={() => applyMode('balanced')}
            />

            <QuickMode
              title="Maximum Protection"
              description="Enable every blur feature."
              icon={Maximize}
              active={activeMode === 'maximum' || isMaximumProtectionActive}
              onClick={() => applyMode('maximum')}
            />
          </div>

          <button
            type="button"
            onClick={activateInstantPrivacy}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              marginTop: '0.1rem',
              padding: '0.85rem',
              border: 0,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #7c5cff, #ff4fd8 48%, #4dd7ff)',
              color: '#fff',
              fontSize: '0.84rem',
              fontWeight: 850,
              cursor: 'pointer',
              boxShadow: '0 12px 28px rgba(124,92,255,0.2)',
            }}
          >
            <ShieldCheck size={17} />
            Instant Privacy
          </button>

          <p
            style={{
              margin: 0,
              color: '#8996b2',
              fontSize: '0.72rem',
              lineHeight: 1.45,
              textAlign: 'center',
            }}
          >
            Instant Privacy activates maximum screen protection immediately.
          </p>
        </Section>

        <Section
          title="Smart Shoulder Detection"
          description="Automatically activate protection when privacy risks are detected."
          icon={ScanFace}
        >
          {smartFeatures.map((feature) => (
            <ProtectionCard
              key={feature.key}
              feature={feature}
              checked={settings[feature.key]}
              onChange={(value) => updateSetting(feature.key, value)}
            />
          ))}
        </Section>

        <Section
          title="Emergency Privacy Actions"
          description="Use immediate actions when you need to hide sensitive content quickly."
          icon={AlertTriangle}
        >
          <button
            type="button"
            onClick={() => applyMode('maximum')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem',
              padding: '0.85rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255,79,122,0.18)',
              background: 'rgba(255,79,122,0.08)',
              color: '#ffb1c8',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <EyeOff size={18} />
            <span style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '0.84rem' }}>
                Hide All Content
              </strong>
              <span style={{ display: 'block', marginTop: '0.22rem', color: '#b98296', fontSize: '0.72rem' }}>
                Instantly blur everything.
              </span>
            </span>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              updateSetting('blurChats', true);
              updateSetting('blurProfile', true);
              updateSetting('blurUpload', true);
              setMessage('Sensitive screens are now locked.');
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem',
              padding: '0.85rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.045)',
              color: '#eaf0ff',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <Lock size={18} />
            <span style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '0.84rem' }}>
                Lock Sensitive Screens
              </strong>
              <span style={{ display: 'block', marginTop: '0.22rem', color: '#8e9bb7', fontSize: '0.72rem' }}>
                Protect chats, profile, upload, and settings.
              </span>
            </span>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/decoy-vault')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem',
              padding: '0.85rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.045)',
              color: '#eaf0ff',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <Lock size={18} />
            <span style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '0.84rem' }}>
                Activate Decoy Vault
              </strong>
              <span style={{ display: 'block', marginTop: '0.22rem', color: '#8e9bb7', fontSize: '0.72rem' }}>
                Open the Decoy Vault profile mode.
              </span>
            </span>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={handleEmergencyRoute}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.85rem',
              border: 0,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #ff4f7a, #ff4fd8)',
              color: '#fff',
              fontSize: '0.84rem',
              fontWeight: 850,
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={17} />
            Trigger Emergency Privacy
          </button>
        </Section>

        <section
          style={{
            padding: '0.95rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.92)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '0.8rem',
            }}
          >
            <span
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.75rem',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
                color: '#dce8ff',
              }}
            >
              <Activity size={15} />
            </span>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: '#f5f8ff',
                  fontSize: '0.98rem',
                  fontWeight: 850,
                }}
              >
                Protection Status
              </h2>
              <p
                style={{
                  margin: '0.25rem 0 0',
                  color: '#8e9bb7',
                  fontSize: '0.74rem',
                }}
              >
                Review the current state of your privacy protections.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '0.55rem',
            }}
          >
            {[
              ['Active protections', `${activeProtectionCount} enabled`],
              ['Last activation', lastActivation],
              ['Auto protection', settings.publicPlaces ? 'Enabled' : 'Disabled'],
              ['Public mode', settings.publicPlaces ? 'Protected' : 'Normal'],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.045)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#8e9bb7',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {label}
                </span>
                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.3rem',
                    color: '#eaf0ff',
                    fontSize: '0.8rem',
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </section>

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
            Background protection system
          </div>

          Shoulder Surf settings are stored locally and prepared for future
          integration with Aarush privacy overlays, session-aware visibility
          rules, screenshot detection, screen-recording detection, media blur,
          notification protection, and realtime privacy state updates.
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