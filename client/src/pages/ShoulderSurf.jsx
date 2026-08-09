import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Camera,
  ChevronRight,
  Eye,
  EyeOff,
  Gauge,
  LockKeyhole,
  Monitor,
  RefreshCw,
  ScanFace,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const SETTINGS_KEY = 'aarush_shoulder_surf_settings';

const DEFAULT_SETTINGS = {
  blurIntensity: 70,
  blurRadius: 12,
  blurSpeed: 55,
  sensitivity: 65,
  autoBlur: true,
  blurMessages: true,
  blurStories: true,
  blurNotifications: true,
  blurProfile: true,
  blurMedia: true,
  blurSearch: true,
  blurReels: true,
  faceDetection: true,
  eyeDetection: true,
  multipleFaces: true,
  deviceMovement: true,
  backgroundActivity: false,
  externalCamera: true,
};

const PROTECTED_AREAS = [
  'Chats',
  'Stories',
  'Reels',
  'Profile',
  'Notifications',
  'Privacy Center',
  'Security Center',
  'Memories Vault',
  'Decoy Vault',
];

const SYSTEMS = [
  ['Shoulder Surf Engine', 'Active'],
  ['Blur Renderer', 'Active'],
  ['Detection Engine', 'Monitoring'],
  ['Realtime Monitor', 'Active'],
  ['Privacy Overlay', 'Active'],
  ['Performance Monitor', 'Syncing'],
  ['App Lock Sync', 'Active'],
  ['Gaze Lock Sync', 'Active'],
];

function readSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

    return saved
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  value,
  onChange,
}) {
  return (
    <label style={styles.toggleRow}>
      <span style={styles.smallIcon}>
        <Icon size={17} />
      </span>

      <span style={styles.rowCopy}>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        style={styles.checkbox}
      />
    </label>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}) {
  return (
    <label style={styles.sliderRow}>
      <span style={styles.sliderHeader}>
        <span>{label}</span>
        <strong>{value}%</strong>
      </span>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        style={styles.range}
      />
    </label>
  );
}

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

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.actionButton}
    >
      <Icon size={16} />
      <span>{label}</span>
      <ChevronRight size={15} />
    </button>
  );
}

export default function ShoulderSurf() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(readSettings);
  const [status, setStatus] = useState('Monitoring');
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );
  }, [settings]);

  const update = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const showToast = (value) => {
    setToast(value);
    window.setTimeout(() => setToast(''), 2500);
  };

  const testBlur = () => {
    setStatus('Viewer Detected');

    window.setTimeout(() => {
      setStatus('Protection Activated');
    }, 800);

    window.setTimeout(() => {
      setStatus('Monitoring');
    }, 2600);
  };

  const enableMaximumProtection = () => {
    setSettings((current) => ({
      ...current,
      blurIntensity: 100,
      blurRadius: 28,
      blurSpeed: 100,
      sensitivity: 100,
      autoBlur: true,
      blurMessages: true,
      blurStories: true,
      blurNotifications: true,
      blurProfile: true,
      blurMedia: true,
      blurSearch: true,
      blurReels: true,
      faceDetection: true,
      eyeDetection: true,
      multipleFaces: true,
      deviceMovement: true,
      backgroundActivity: true,
      externalCamera: true,
    }));

    setStatus('Protected');
    showToast('Maximum protection enabled.');
  };

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Shoulder Surf Protection"
        showBackButton
        initialGazeLock
      />

      <main style={styles.content}>
        <section style={styles.hero}>
          <span style={styles.heroIcon}>
            <EyeOff size={27} />
          </span>

          <div style={styles.heroCopy}>
            <h1 style={styles.title}>
              Shoulder Surf Protection
            </h1>
            <p style={styles.subtitle}>
              Protect sensitive information when someone is looking
              at your screen.
            </p>
          </div>
        </section>

        <section style={styles.statusCard}>
          <div
            style={{
              ...styles.statusCircle,
              ...(status === 'Protection Activated'
                ? styles.activeStatus
                : {}),
            }}
          >
            {status === 'Viewer Detected' ? (
              <Eye size={31} />
            ) : status === 'Protection Activated' ? (
              <ShieldCheck size={31} />
            ) : (
              <ScanFace size={31} />
            )}
          </div>

          <h2 style={styles.statusTitle}>{status}</h2>

          <p style={styles.statusText}>
            {status === 'Protection Activated'
              ? 'Private content is currently protected with an active blur overlay.'
              : 'Aarush is monitoring the device and is ready to protect sensitive content.'}
          </p>
        </section>

        <Section title="Live Blur Preview" icon={EyeOff}>
          <div
            style={{
              ...styles.preview,
              filter: `blur(${Math.max(
                1,
                settings.blurIntensity / 13
              )}px)`,
            }}
          >
            <div style={styles.previewTop}>
              <span style={styles.previewAvatar}>A</span>
              <span>
                <strong>Aarush</strong>
                <small>Private content preview</small>
              </span>
            </div>

            <div style={styles.previewLines}>
              <span />
              <span />
              <span />
              <span />
            </div>

            <div style={styles.previewPrivate}>
              <LockKeyhole size={22} />
              <span>Protected content</span>
            </div>
          </div>

          <div style={styles.sliderList}>
            <SliderRow
              label="Blur Intensity"
              value={settings.blurIntensity}
              onChange={(value) =>
                update('blurIntensity', value)
              }
            />

            <SliderRow
              label="Blur Radius"
              value={settings.blurRadius}
              onChange={(value) =>
                update('blurRadius', value)
              }
            />

            <SliderRow
              label="Blur Speed"
              value={settings.blurSpeed}
              onChange={(value) =>
                update('blurSpeed', value)
              }
            />

            <SliderRow
              label="Detection Sensitivity"
              value={settings.sensitivity}
              onChange={(value) =>
                update('sensitivity', value)
              }
            />
          </div>
        </Section>

        <Section title="Automatic Protection" icon={ShieldCheck}>
          <ToggleRow
            icon={Zap}
            title="Auto Blur"
            description="Automatically protect content when a viewer is detected."
            value={settings.autoBlur}
            onChange={(value) => update('autoBlur', value)}
          />

          <ToggleRow
            icon={Activity}
            title="Blur Messages"
            description="Protect chat messages and conversations."
            value={settings.blurMessages}
            onChange={(value) =>
              update('blurMessages', value)
            }
          />

          <ToggleRow
            icon={Eye}
            title="Blur Stories"
            description="Protect story previews and viewers."
            value={settings.blurStories}
            onChange={(value) =>
              update('blurStories', value)
            }
          />

          <ToggleRow
            icon={BellIcon}
            title="Blur Notifications"
            description="Protect notification content."
            value={settings.blurNotifications}
            onChange={(value) =>
              update('blurNotifications', value)
            }
          />

          <ToggleRow
            icon={UserIcon}
            title="Blur Profile"
            description="Protect profile and account information."
            value={settings.blurProfile}
            onChange={(value) =>
              update('blurProfile', value)
            }
          />

          <ToggleRow
            icon={Camera}
            title="Blur Media"
            description="Protect photos and videos."
            value={settings.blurMedia}
            onChange={(value) =>
              update('blurMedia', value)
            }
          />

          <ToggleRow
            icon={Search}
            title="Blur Search"
            description="Protect search results and suggestions."
            value={settings.blurSearch}
            onChange={(value) =>
              update('blurSearch', value)
            }
          />

          <ToggleRow
            icon={Video}
            title="Blur Reels"
            description="Protect reels and video previews."
            value={settings.blurReels}
            onChange={(value) =>
              update('blurReels', value)
            }
          />
        </Section>

        <Section title="Detection Simulation" icon={ScanFace}>
          <div style={styles.simulation}>
            <span style={styles.simulationDot} />
            <span>No Viewer</span>
            <span style={styles.simulationPulse} />
          </div>

          <div style={styles.simulationButtons}>
            {[
              'No Viewer',
              'Possible Viewer',
              'Viewer Detected',
              'Protection Activated',
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                style={{
                  ...styles.simulationButton,
                  ...(status === item
                    ? styles.selectedSimulation
                    : {}),
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Protection Triggers" icon={SettingsIcon}>
          <ToggleRow
            icon={ScanFace}
            title="Face Detection"
            description="Detect faces near the display."
            value={settings.faceDetection}
            onChange={(value) =>
              update('faceDetection', value)
            }
          />

          <ToggleRow
            icon={Eye}
            title="Eye Detection"
            description="Detect attention toward the screen."
            value={settings.eyeDetection}
            onChange={(value) =>
              update('eyeDetection', value)
            }
          />

          <ToggleRow
            icon={Users}
            title="Multiple Faces"
            description="Protect content when multiple faces appear."
            value={settings.multipleFaces}
            onChange={(value) =>
              update('multipleFaces', value)
            }
          />

          <ToggleRow
            icon={Smartphone}
            title="Device Movement"
            description="Use device movement as a protection signal."
            value={settings.deviceMovement}
            onChange={(value) =>
              update('deviceMovement', value)
            }
          />

          <ToggleRow
            icon={Activity}
            title="Background Activity"
            description="Monitor background privacy signals."
            value={settings.backgroundActivity}
            onChange={(value) =>
              update('backgroundActivity', value)
            }
          />

          <ToggleRow
            icon={Camera}
            title="External Camera Detection"
            description="Detect possible camera activity nearby."
            value={settings.externalCamera}
            onChange={(value) =>
              update('externalCamera', value)
            }
          />
        </Section>

        <Section title="Protected Areas" icon={Shield}>
          <div style={styles.areaGrid}>
            {PROTECTED_AREAS.map((area) => (
              <div key={area} style={styles.areaCard}>
                <ShieldCheck size={15} />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Quick Actions" icon={Zap}>
          <ActionButton
            icon={EyeOff}
            label="Test Blur"
            onClick={testBlur}
          />

          <ActionButton
            icon={ShieldCheck}
            label="Enable Maximum Protection"
            onClick={enableMaximumProtection}
          />

          <ActionButton
            icon={ShieldAlert}
            label="Open Emergency Privacy"
            onClick={() => navigate('/emergency-privacy')}
          />

          <ActionButton
            icon={ShieldCheck}
            label="Open Privacy Dashboard"
            onClick={() => navigate('/privacy-dashboard')}
          />

          <ActionButton
            icon={ShieldCheck}
            label="Open Security Center"
            onClick={() => navigate('/security-center')}
          />
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

function BellIcon(props) {
  return <ShieldCheck {...props} />;
}

function UserIcon(props) {
  return <Eye {...props} />;
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
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
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
    padding: '1.3rem',
    borderRadius: '1.3rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.16), rgba(15,19,30,0.95))',
    border: '1px solid rgba(124,92,255,0.24)',
    textAlign: 'center',
  },

  statusCircle: {
    width: '6.4rem',
    height: '6.4rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    background: 'rgba(124,92,255,0.18)',
    border: '3px solid #7c5cff',
    color: '#9deeff',
    transition:
      'background 220ms ease, border-color 220ms ease, color 220ms ease',
  },

  activeStatus: {
    background: 'rgba(255,79,122,0.16)',
    borderColor: '#ff789d',
    color: '#ff9fba',
  },

  statusTitle: {
    margin: '0.85rem 0 0',
    fontSize: '1rem',
  },

  statusText: {
    maxWidth: '34rem',
    margin: '0.4rem 0 0',
    color: '#96a3bf',
    fontSize: '0.74rem',
    lineHeight: 1.5,
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

  preview: {
    minHeight: '11rem',
    display: 'grid',
    alignContent: 'space-between',
    padding: '1rem',
    borderRadius: '1rem',
    background:
      'linear-gradient(135deg, #202b4b, #192035 48%, #30204a)',
    transition: 'filter 220ms ease',
  },

  previewTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  previewAvatar: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
    fontWeight: 900,
  },

  previewLines: {
    display: 'grid',
    gap: '0.4rem',
  },

  previewPrivate: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    minHeight: '2.7rem',
    borderRadius: '0.8rem',
    background: 'rgba(5,8,15,0.45)',
    color: '#dce5f8',
    fontSize: '0.72rem',
    fontWeight: 800,
  },

  sliderList: {
    display: 'grid',
    gap: '0.7rem',
    marginTop: '1rem',
  },

  sliderRow: {
    display: 'grid',
    gap: '0.35rem',
  },

  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#cbd6ec',
    fontSize: '0.7rem',
    fontWeight: 750,
  },

  range: {
    width: '100%',
    accentColor: '#7c5cff',
  },

  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '0.75rem',
    borderRadius: '0.9rem',
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.04)',
  },

  smallIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.1))',
    color: '#dce8ff',
  },

  rowCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.18rem',
    flex: 1,
  },

  checkbox: {
    width: '1.15rem',
    height: '1.15rem',
    flexShrink: 0,
    accentColor: '#7c5cff',
  },

  simulation: {
    position: 'relative',
    minHeight: '4.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    overflow: 'hidden',
    borderRadius: '1rem',
    background:
      'linear-gradient(135deg, rgba(77,215,255,0.1), rgba(124,92,255,0.16))',
    color: '#dce8ff',
    fontSize: '0.8rem',
    fontWeight: 800,
  },

  simulationDot: {
    width: '0.55rem',
    height: '0.55rem',
    borderRadius: '999px',
    background: '#82e9c1',
    boxShadow: '0 0 12px rgba(130,233,193,0.8)',
  },

  simulationPulse: {
    position: 'absolute',
    width: '7rem',
    height: '7rem',
    borderRadius: '999px',
    border: '1px solid rgba(77,215,255,0.25)',
    animation: 'aarush-surf-pulse 2s ease-out infinite',
  },

  simulationButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.45rem',
    marginTop: '0.65rem',
  },

  simulationButton: {
    minHeight: '2.35rem',
    padding: '0.4rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.7rem',
    background: 'rgba(255,255,255,0.04)',
    color: '#96a3bf',
    fontSize: '0.63rem',
    fontWeight: 750,
    cursor: 'pointer',
  },

  selectedSimulation: {
    borderColor: 'rgba(124,92,255,0.35)',
    background: 'rgba(124,92,255,0.16)',
    color: '#fff',
  },

  areaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.45rem',
  },

  areaCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.6rem',
    borderRadius: '0.7rem',
    background: 'rgba(255,255,255,0.04)',
    color: '#cbd6ec',
    fontSize: '0.65rem',
  },

  actionButton: {
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