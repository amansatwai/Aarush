import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accessibility,
  BatteryCharging,
  ChevronRight,
  Download,
  Gauge,
  HardDrive,
  Lock,
  LockKeyhole,
  Moon,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Zap,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const STORAGE_KEYS = {
  gazeLock: 'aarush_gaze_lock_enabled',
  oneTapLock: 'aarush_one_tap_lock_enabled',
  appLock: 'aarush_app_lock_enabled',
  shoulderSurf: 'aarush_shoulder_surf_enabled',
  screenshotShield: 'aarush_screenshot_shield_enabled',
  screenRecording: 'aarush_screen_recording_enabled',
  theme: 'aarush_theme',
  accentColor: 'aarush_accent_color',
  fontSize: 'aarush_font_size',
  animationSpeed: 'aarush_animation_speed',
  largeText: 'aarush_large_text_enabled',
  highContrast: 'aarush_high_contrast_enabled',
  reduceMotion: 'aarush_reduce_motion_enabled',
  hapticFeedback: 'aarush_haptic_feedback_enabled',
  voiceGuidance: 'aarush_voice_guidance_enabled',
  dataSaver: 'aarush_data_saver_enabled',
  batterySaver: 'aarush_battery_saver_enabled',
  autoMediaDownload: 'aarush_auto_media_download_enabled',
  backgroundRefresh: 'aarush_background_refresh_enabled',
};

function readBoolean(key, fallback = false) {
  const value = localStorage.getItem(key);

  if (value === null) {
    return fallback;
  }

  return value === 'true';
}

function saveBoolean(key, value) {
  localStorage.setItem(key, String(value));
}

function Section({ title, children }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.list}>{children}</div>
    </section>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  value,
  onChange,
}) {
  return (
    <label style={styles.row}>
      <span style={styles.rowIcon}>
        <Icon size={18} />
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

function SelectRow({
  icon: Icon,
  title,
  description,
  value,
  onChange,
  options,
}) {
  return (
    <label style={styles.row}>
      <span style={styles.rowIcon}>
        <Icon size={18} />
      </span>

      <span style={styles.rowCopy}>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={title}
        style={styles.select}
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Shortcut({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.shortcut}
    >
      <Icon size={17} />
      <span>{label}</span>
      <ChevronRight size={16} />
    </button>
  );
}

export default function ControlsPage() {
  const navigate = useNavigate();

  const [gazeLock, setGazeLock] = useState(() =>
    readBoolean(STORAGE_KEYS.gazeLock, true)
  );
  const [oneTapLock, setOneTapLock] = useState(() =>
    readBoolean(STORAGE_KEYS.oneTapLock)
  );
  const [appLock, setAppLock] = useState(() =>
    readBoolean(STORAGE_KEYS.appLock)
  );
  const [shoulderSurf, setShoulderSurf] = useState(() =>
    readBoolean(STORAGE_KEYS.shoulderSurf)
  );
  const [screenshotShield, setScreenshotShield] = useState(() =>
    readBoolean(STORAGE_KEYS.screenshotShield, true)
  );
  const [screenRecording, setScreenRecording] = useState(() =>
    readBoolean(STORAGE_KEYS.screenRecording, true)
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_KEYS.theme) || 'dark'
  );
  const [accentColor, setAccentColor] = useState(
    () =>
      localStorage.getItem(STORAGE_KEYS.accentColor) ||
      'purple-blue'
  );
  const [fontSize, setFontSize] = useState(
    () =>
      localStorage.getItem(STORAGE_KEYS.fontSize) || 'normal'
  );
  const [animationSpeed, setAnimationSpeed] = useState(
    () =>
      localStorage.getItem(STORAGE_KEYS.animationSpeed) ||
      'normal'
  );

  const [largeText, setLargeText] = useState(() =>
    readBoolean(STORAGE_KEYS.largeText)
  );
  const [highContrast, setHighContrast] = useState(() =>
    readBoolean(STORAGE_KEYS.highContrast)
  );
  const [reduceMotion, setReduceMotion] = useState(() =>
    readBoolean(STORAGE_KEYS.reduceMotion)
  );
  const [hapticFeedback, setHapticFeedback] = useState(() =>
    readBoolean(STORAGE_KEYS.hapticFeedback, true)
  );
  const [voiceGuidance, setVoiceGuidance] = useState(() =>
    readBoolean(STORAGE_KEYS.voiceGuidance)
  );

  const [dataSaver, setDataSaver] = useState(() =>
    readBoolean(STORAGE_KEYS.dataSaver)
  );
  const [batterySaver, setBatterySaver] = useState(() =>
    readBoolean(STORAGE_KEYS.batterySaver)
  );
  const [autoMediaDownload, setAutoMediaDownload] = useState(() =>
    readBoolean(STORAGE_KEYS.autoMediaDownload, true)
  );
  const [backgroundRefresh, setBackgroundRefresh] = useState(() =>
    readBoolean(STORAGE_KEYS.backgroundRefresh, true)
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.accentColor,
      accentColor
    );
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fontSize, fontSize);
    document.documentElement.dataset.fontSize = fontSize;
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.animationSpeed,
      animationSpeed
    );
  }, [animationSpeed]);

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Controls"
        showBackButton
        initialGazeLock={gazeLock}
        onGazeLockChange={(value) => {
          setGazeLock(value);
          saveBoolean(STORAGE_KEYS.gazeLock, value);
        }}
      />

      <main style={styles.content}>
        <section style={styles.hero}>
          <span style={styles.heroIcon}>
            <Gauge size={22} />
          </span>

          <div>
            <h1 style={styles.title}>Controls</h1>
            <p style={styles.subtitle}>
              Manage Aarush privacy, appearance, accessibility, and
              performance.
            </p>
          </div>
        </section>

        <Section title="Quick Controls">
          <ToggleRow
            icon={ShieldCheck}
            title="Gaze Lock"
            description="Protect your screen when you look away."
            value={gazeLock}
            onChange={(value) => {
              setGazeLock(value);
              saveBoolean(STORAGE_KEYS.gazeLock, value);
            }}
          />

          <ToggleRow
            icon={LockKeyhole}
            title="One Tap Lock"
            description="Lock Aarush immediately with one tap."
            value={oneTapLock}
            onChange={(value) => {
              setOneTapLock(value);
              saveBoolean(STORAGE_KEYS.oneTapLock, value);
            }}
          />

          <ToggleRow
            icon={LockKeyhole}
            title="App Lock"
            description="Require protection before opening Aarush."
            value={appLock}
            onChange={(value) => {
              setAppLock(value);
              saveBoolean(STORAGE_KEYS.appLock, value);
            }}
          />

          <ToggleRow
            icon={ShieldAlert}
            title="Shoulder Surf"
            description="Blur sensitive content around you."
            value={shoulderSurf}
            onChange={(value) => {
              setShoulderSurf(value);
              saveBoolean(STORAGE_KEYS.shoulderSurf, value);
            }}
          />

          <ToggleRow
            icon={Shield}
            title="Screenshot Shield"
            description="Protect sensitive screens from capture."
            value={screenshotShield}
            onChange={(value) => {
              setScreenshotShield(value);
              saveBoolean(
                STORAGE_KEYS.screenshotShield,
                value
              );
            }}
          />

          <ToggleRow
            icon={ShieldCheck}
            title="Screen Recording Protection"
            description="Protect content while the screen is recorded."
            value={screenRecording}
            onChange={(value) => {
              setScreenRecording(value);
              saveBoolean(
                STORAGE_KEYS.screenRecording,
                value
              );
            }}
          />

          <Shortcut
            icon={LockKeyhole}
            label="Open App Lock Settings"
            onClick={() => navigate('/app-lock-settings')}
          />
        </Section>

        <Section title="Appearance">
          <SelectRow
            icon={theme === 'light' ? Sun : Moon}
            title="Theme"
            description="Choose the Aarush appearance."
            value={theme}
            onChange={setTheme}
            options={[
              ['dark', 'Dark Theme'],
              ['light', 'Light Theme'],
              ['system', 'System Theme'],
            ]}
          />

          <SelectRow
            icon={Zap}
            title="Accent Color"
            description="Choose the interface accent."
            value={accentColor}
            onChange={setAccentColor}
            options={[
              ['purple-blue', 'Purple / Blue'],
              ['violet-pink', 'Violet / Pink'],
              ['cyan-purple', 'Cyan / Purple'],
            ]}
          />

          <SelectRow
            icon={Accessibility}
            title="Font Size"
            description="Adjust text size throughout Aarush."
            value={fontSize}
            onChange={setFontSize}
            options={[
              ['small', 'Small'],
              ['normal', 'Normal'],
              ['large', 'Large'],
            ]}
          />

          <SelectRow
            icon={Zap}
            title="Animation Speed"
            description="Control interface animation speed."
            value={animationSpeed}
            onChange={setAnimationSpeed}
            options={[
              ['reduced', 'Reduced'],
              ['normal', 'Normal'],
              ['fast', 'Fast'],
            ]}
          />
        </Section>

        <Section title="Accessibility">
          <ToggleRow
            icon={Accessibility}
            title="Large Text"
            description="Increase important interface text."
            value={largeText}
            onChange={(value) => {
              setLargeText(value);
              saveBoolean(STORAGE_KEYS.largeText, value);
            }}
          />

          <ToggleRow
            icon={ShieldCheck}
            title="High Contrast"
            description="Increase contrast between content layers."
            value={highContrast}
            onChange={(value) => {
              setHighContrast(value);
              saveBoolean(
                STORAGE_KEYS.highContrast,
                value
              );
            }}
          />

          <ToggleRow
            icon={Gauge}
            title="Reduce Motion"
            description="Reduce animated transitions."
            value={reduceMotion}
            onChange={(value) => {
              setReduceMotion(value);
              saveBoolean(
                STORAGE_KEYS.reduceMotion,
                value
              );
            }}
          />

          <ToggleRow
            icon={Zap}
            title="Haptic Feedback"
            description="Use touch feedback where supported."
            value={hapticFeedback}
            onChange={(value) => {
              setHapticFeedback(value);
              saveBoolean(
                STORAGE_KEYS.hapticFeedback,
                value
              );
            }}
          />

          <ToggleRow
            icon={Accessibility}
            title="Voice Guidance"
            description="Enable additional spoken guidance."
            value={voiceGuidance}
            onChange={(value) => {
              setVoiceGuidance(value);
              saveBoolean(
                STORAGE_KEYS.voiceGuidance,
                value
              );
            }}
          />
        </Section>

        <Section title="Performance">
          <ToggleRow
            icon={Download}
            title="Data Saver"
            description="Reduce background media data usage."
            value={dataSaver}
            onChange={(value) => {
              setDataSaver(value);
              saveBoolean(STORAGE_KEYS.dataSaver, value);
            }}
          />

          <ToggleRow
            icon={BatteryCharging}
            title="Battery Saver"
            description="Reduce background processing and effects."
            value={batterySaver}
            onChange={(value) => {
              setBatterySaver(value);
              saveBoolean(
                STORAGE_KEYS.batterySaver,
                value
              );
            }}
          />

          <ToggleRow
            icon={Download}
            title="Auto Media Download"
            description="Automatically download supported media."
            value={autoMediaDownload}
            onChange={(value) => {
              setAutoMediaDownload(value);
              saveBoolean(
                STORAGE_KEYS.autoMediaDownload,
                value
              );
            }}
          />

          <ToggleRow
            icon={RefreshCw}
            title="Background Refresh"
            description="Refresh content when Aarush is inactive."
            value={backgroundRefresh}
            onChange={(value) => {
              setBackgroundRefresh(value);
              saveBoolean(
                STORAGE_KEYS.backgroundRefresh,
                value
              );
            }}
          />

          <Shortcut
            icon={HardDrive}
            label="Cache Management"
            onClick={() =>
              localStorage.setItem(
                'aarush_cache_management_requested',
                new Date().toISOString()
              )
            }
          />
        </Section>

        <Section title="Privacy Shortcuts">
          <Shortcut
            icon={Shield}
            label="Open Privacy Center"
            onClick={() => navigate('/privacy-center')}
          />

          <Shortcut
            icon={ShieldCheck}
            label="Open Security Center"
            onClick={() => navigate('/security-center')}
          />

          <Shortcut
            icon={Gauge}
            label="Open Privacy Dashboard"
            onClick={() => navigate('/privacy-dashboard')}
          />

          <Shortcut
            icon={ShieldAlert}
            label="Open Emergency Privacy"
            onClick={() => navigate('/emergency-privacy')}
          />
        </Section>
      </main>

      <BottomNav />
    </div>
  );
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
    boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
  },

  heroIcon: {
    width: '2.8rem',
    height: '2.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.9rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.28), rgba(77,215,255,0.14))',
    color: '#dce8ff',
  },

  title: {
    margin: 0,
    color: '#f5f8ff',
    fontSize: '1.1rem',
    fontWeight: 850,
  },

  subtitle: {
    margin: '0.28rem 0 0',
    color: '#96a3bf',
    fontSize: '0.76rem',
    lineHeight: 1.5,
  },

  card: {
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.22)',
  },

  sectionTitle: {
    margin: '0 0 0.75rem',
    color: '#f5f8ff',
    fontSize: '0.9rem',
    fontWeight: 850,
  },

  list: {
    display: 'grid',
    gap: '0.55rem',
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem',
    borderRadius: '1rem',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.045)',
  },

  rowIcon: {
    width: '2.35rem',
    height: '2.35rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.8rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))',
    color: '#dce8ff',
  },

  rowCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.2rem',
    flex: 1,
  },

  checkbox: {
    width: '1.2rem',
    height: '1.2rem',
    flexShrink: 0,
    accentColor: '#7c5cff',
  },

  select: {
    maxWidth: '7.5rem',
    minHeight: '2.25rem',
    padding: '0 0.45rem',
    borderRadius: '0.65rem',
    border: '1px solid rgba(255,255,255,0.1)',
    background: '#171d2c',
    color: '#eaf0ff',
    fontSize: '0.68rem',
    fontWeight: 750,
  },

  shortcut: {
    width: '100%',
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.7rem 0.8rem',
    borderRadius: '0.9rem',
    border: '1px solid rgba(124,92,255,0.3)',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.1))',
    color: '#eef4ff',
    fontSize: '0.76rem',
    fontWeight: 800,
    cursor: 'pointer',
  },
};