import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Archive,
  ArrowDownToLine,
  Ban,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  Fingerprint,
  Globe2,
  Laptop,
  Lock,
  LockKeyhole,
  LogOut,
  Monitor,
  MoreHorizontal,
  Network,
  Phone,
  RefreshCw,
  ScanLine,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Users,
  Video,
  Wifi,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const PRIVACY_KEYS = {
  screenshotShield: 'aarush_screenshot_shield_enabled',
  screenRecording: 'aarush_screen_recording_enabled',
  shoulderSurf: 'aarush_shoulder_surf_enabled',
  gazeLock: 'aarush_gaze_lock_enabled',
  oneTapLock: 'aarush_one_tap_lock_enabled',
  emergencyPrivacy: 'aarush_emergency_privacy_enabled',
  appLock: 'aarush_app_lock_enabled',
  decoyVault: 'aarush_decoy_vault_enabled',
};

const INITIAL_DEVICES = [
  {
    id: 'device-current',
    name: 'This Android device',
    os: 'Android',
    browser: 'Chrome Mobile',
    location: 'Current location',
    loginTime: 'Today, 08:12 AM',
    lastActivity: 'Active now',
    current: true,
    trusted: true,
  },
  {
    id: 'device-laptop',
    name: 'Windows laptop',
    os: 'Windows 11',
    browser: 'Chrome',
    location: 'New Delhi, IN',
    loginTime: 'Yesterday, 10:42 PM',
    lastActivity: '18 minutes ago',
    current: false,
    trusted: true,
  },
  {
    id: 'device-tablet',
    name: 'Personal tablet',
    os: 'Android',
    browser: 'Aarush Web',
    location: 'Mumbai, IN',
    loginTime: 'May 18, 2026',
    lastActivity: 'May 18, 2026',
    current: false,
    trusted: false,
  },
];

const INITIAL_SESSIONS = [
  {
    id: 'session-1',
    device: 'This Android device',
    browser: 'Chrome Mobile',
    ip: '103.•••.••.42',
    time: '08:12 AM',
    date: 'Today',
    status: 'Current',
  },
  {
    id: 'session-2',
    device: 'Windows laptop',
    browser: 'Chrome 125',
    ip: '117.•••.••.81',
    time: '10:42 PM',
    date: 'Yesterday',
    status: 'Active',
  },
  {
    id: 'session-3',
    device: 'Personal tablet',
    browser: 'Aarush Web',
    ip: '49.•••.••.19',
    time: '04:18 PM',
    date: 'May 18, 2026',
    status: 'Expired',
  },
];

const SECURITY_ALERTS = [
  {
    id: 'alert-1',
    title: 'New login detected',
    severity: 'yellow',
    status: 'Reviewed',
    time: '08:12 AM',
    date: 'Today',
  },
  {
    id: 'alert-2',
    title: 'Trusted device added',
    severity: 'green',
    status: 'Verified',
    time: '10:44 PM',
    date: 'Yesterday',
  },
  {
    id: 'alert-3',
    title: 'Screenshot detected',
    severity: 'red',
    status: 'Protected',
    time: '06:20 PM',
    date: 'May 18, 2026',
  },
  {
    id: 'alert-4',
    title: 'Gaze Lock enabled',
    severity: 'green',
    status: 'Active',
    time: '04:32 PM',
    date: 'May 17, 2026',
  },
];

const SECURITY_SYSTEMS = [
  ['Authentication Engine', 'Active'],
  ['Session Monitor', 'Active'],
  ['Device Trust Engine', 'Active'],
  ['Screenshot Detection', 'Active'],
  ['Recording Detection', 'Active'],
  ['Privacy Sync', 'Syncing'],
  ['Realtime Security Monitor', 'Active'],
  ['Notification Sync', 'Active'],
  ['Encryption Layer', 'Active'],
  ['Recovery System', 'Active'],
];

function readBoolean(key, fallback = false) {
  const value = localStorage.getItem(key);

  if (value === null) {
    return fallback;
  }

  return value === 'true';
}

function severityColor(severity) {
  if (severity === 'red') {
    return '#ff789d';
  }

  if (severity === 'yellow') {
    return '#ffd27d';
  }

  return '#82e9c1';
}

function StatusDot({ severity = 'green' }) {
  return (
    <span
      style={{
        ...styles.statusDot,
        background: severityColor(severity),
        boxShadow: `0 0 10px ${severityColor(severity)}`,
      }}
    />
  );
}

function Section({ title, icon: Icon, children, action }) {
  return (
    <section style={styles.card}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitleWrap}>
          <span style={styles.sectionIcon}>
            <Icon size={17} />
          </span>

          <h2 style={styles.sectionTitle}>{title}</h2>
        </div>

        {action || null}
      </div>

      {children}
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

function OverviewCard({ icon: Icon, label, value, tone = 'blue' }) {
  return (
    <div style={styles.overviewCard}>
      <span
        style={{
          ...styles.overviewIcon,
          color:
            tone === 'green'
              ? '#82e9c1'
              : tone === 'yellow'
                ? '#ffd27d'
                : '#9deeff',
        }}
      >
        <Icon size={18} />
      </span>

      <span style={styles.overviewValue}>{value}</span>
      <span style={styles.overviewLabel}>{label}</span>
    </div>
  );
}

export default function SecurityCenter() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [toast, setToast] = useState('');

  const [twoFactor, setTwoFactor] = useState(() =>
    readBoolean('aarush_two_factor_enabled', true)
  );
  const [backupCodes, setBackupCodes] = useState(() =>
    readBoolean('aarush_backup_codes_enabled', true)
  );
  const [recoveryEmail, setRecoveryEmail] = useState(() =>
    readBoolean('aarush_recovery_email_enabled', true)
  );
  const [recoveryPhone, setRecoveryPhone] = useState(() =>
    readBoolean('aarush_recovery_phone_enabled')
  );
  const [biometric, setBiometric] = useState(() =>
    readBoolean('aarush_biometric_enabled')
  );
  const [faceUnlock, setFaceUnlock] = useState(() =>
    readBoolean('aarush_face_unlock_enabled')
  );
  const [fingerprint, setFingerprint] = useState(() =>
    readBoolean('aarush_fingerprint_enabled')
  );
  const [pinLock, setPinLock] = useState(() =>
    readBoolean('aarush_pin_lock_enabled', true)
  );

  const [privacy, setPrivacy] = useState({
    screenshotShield: readBoolean(
      PRIVACY_KEYS.screenshotShield,
      true
    ),
    screenRecording: readBoolean(
      PRIVACY_KEYS.screenRecording,
      true
    ),
    shoulderSurf: readBoolean(PRIVACY_KEYS.shoulderSurf),
    gazeLock: readBoolean(PRIVACY_KEYS.gazeLock, true),
    oneTapLock: readBoolean(PRIVACY_KEYS.oneTapLock),
    emergencyPrivacy: readBoolean(
      PRIVACY_KEYS.emergencyPrivacy
    ),
    appLock: readBoolean(PRIVACY_KEYS.appLock),
    decoyVault: readBoolean(PRIVACY_KEYS.decoyVault),
  });

  const showToast = (value) => {
    setToast(value);
    window.setTimeout(() => setToast(''), 2600);
  };

  const updateBoolean = (key, setter, value) => {
    setter(value);
    localStorage.setItem(key, String(value));
  };

  const updatePrivacy = (key, value) => {
    setPrivacy((current) => ({
      ...current,
      [key]: value,
    }));

    localStorage.setItem(PRIVACY_KEYS[key], String(value));
  };

  const revokeSession = (id) => {
    setSessions((current) =>
      current.filter((session) => session.id !== id)
    );
    showToast('Session revoked.');
  };

  const logoutAllOtherDevices = () => {
    setSessions((current) =>
      current.filter((session) => session.status === 'Current')
    );

    setDevices((current) =>
      current.filter((device) => device.current)
    );

    showToast('All other devices have been logged out.');
  };

  const removeDeviceTrust = (id) => {
    setDevices((current) =>
      current.map((device) =>
        device.id === id
          ? { ...device, trusted: false }
          : device
      )
    );

    showToast('Device trust removed.');
  };

  const trustDevice = (id) => {
    setDevices((current) =>
      current.map((device) =>
        device.id === id
          ? { ...device, trusted: true }
          : device
      )
    );

    showToast('Device trusted successfully.');
  };

  const activeDevices = devices.filter(
    (device) => device.current || device.lastActivity !== 'Expired'
  ).length;

  const trustedDevices = devices.filter(
    (device) => device.trusted
  ).length;

  const activeSessions = sessions.filter(
    (session) => session.status !== 'Expired'
  ).length;

  const securityScore = useMemo(() => {
    let score = 78;

    if (twoFactor) score += 5;
    if (backupCodes) score += 3;
    if (biometric || fingerprint || faceUnlock) score += 3;
    if (privacy.gazeLock) score += 2;
    if (privacy.screenshotShield) score += 2;
    if (privacy.screenRecording) score += 2;
    if (trustedDevices > 0) score += 1;

    return Math.min(score, 100);
  }, [
    backupCodes,
    biometric,
    faceUnlock,
    fingerprint,
    privacy.gazeLock,
    privacy.screenshotShield,
    privacy.screenRecording,
    trustedDevices,
    twoFactor,
  ]);

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Security Center"
        showBackButton
        initialGazeLock={privacy.gazeLock}
        onGazeLockChange={(value) =>
          updatePrivacy('gazeLock', value)
        }
      />

      <main style={styles.content}>
        <section style={styles.heroCard}>
          <div style={styles.heroShield}>
            <ShieldCheck size={30} />
          </div>

          <div style={styles.heroCopy}>
            <h1 style={styles.title}>Security Center</h1>
            <p style={styles.subtitle}>
              Manage account protection, devices, authentication,
              and privacy security.
            </p>
          </div>

          <span style={styles.excellentBadge}>Excellent</span>
        </section>

        <section style={styles.scoreCard}>
          <div
            style={{
              ...styles.scoreCircle,
              background: `conic-gradient(#4dd7ff ${securityScore}%, rgba(255,255,255,0.08) ${securityScore}% 100%)`,
            }}
          >
            <div style={styles.scoreInner}>
              <strong>{securityScore}</strong>
              <span>/ 100</span>
            </div>
          </div>

          <div style={styles.scoreCopy}>
            <h2 style={styles.scoreTitle}>Strong protection</h2>
            <p style={styles.scoreText}>
              Your account has strong security coverage. Enable
              additional recovery and biometric options for extra
              protection.
            </p>
          </div>
        </section>

        <section style={styles.overviewGrid}>
          <OverviewCard
            icon={Smartphone}
            label="Active Devices"
            value={activeDevices}
            tone="blue"
          />
          <OverviewCard
            icon={Globe2}
            label="Login Sessions"
            value={activeSessions}
            tone="blue"
          />
          <OverviewCard
            icon={UserCheck}
            label="Trusted Devices"
            value={trustedDevices}
            tone="green"
          />
          <OverviewCard
            icon={ShieldAlert}
            label="Security Alerts"
            value={SECURITY_ALERTS.length}
            tone="yellow"
          />
          <OverviewCard
            icon={Clock3}
            label="Password Change"
            value="42d"
            tone="green"
          />
          <OverviewCard
            icon={LockKeyhole}
            label="Two-Factor Auth"
            value={twoFactor ? 'ON' : 'OFF'}
            tone={twoFactor ? 'green' : 'yellow'}
          />
        </section>

        <Section title="Authentication" icon={LockKeyhole}>
          <div style={styles.settingsList}>
            <ActionSetting
              icon={Lock}
              title="Change Password"
              description="Update your Aarush account password."
              onClick={() =>
                showToast('Password settings opened.')
              }
            />

            <ToggleRow
              icon={ShieldCheck}
              title="Two-Factor Authentication"
              description="Require an additional verification step."
              value={twoFactor}
              onChange={(value) =>
                updateBoolean(
                  'aarush_two_factor_enabled',
                  setTwoFactor,
                  value
                )
              }
            />

            <ToggleRow
              icon={Archive}
              title="Backup Codes"
              description="Keep recovery codes available for emergencies."
              value={backupCodes}
              onChange={(value) =>
                updateBoolean(
                  'aarush_backup_codes_enabled',
                  setBackupCodes,
                  value
                )
              }
            />

            <ToggleRow
              icon={MailIcon}
              title="Recovery Email"
              description="Use a verified recovery email."
              value={recoveryEmail}
              onChange={(value) =>
                updateBoolean(
                  'aarush_recovery_email_enabled',
                  setRecoveryEmail,
                  value
                )
              }
            />

            <ToggleRow
              icon={Phone}
              title="Recovery Phone"
              description="Use a verified phone number for recovery."
              value={recoveryPhone}
              onChange={(value) =>
                updateBoolean(
                  'aarush_recovery_phone_enabled',
                  setRecoveryPhone,
                  value
                )
              }
            />

            <ToggleRow
              icon={Fingerprint}
              title="Biometric Authentication"
              description="Use supported biometrics to verify identity."
              value={biometric}
              onChange={(value) =>
                updateBoolean(
                  'aarush_biometric_enabled',
                  setBiometric,
                  value
                )
              }
            />

            <ToggleRow
              icon={Eye}
              title="Face Unlock"
              description="Use face verification where supported."
              value={faceUnlock}
              onChange={(value) =>
                updateBoolean(
                  'aarush_face_unlock_enabled',
                  setFaceUnlock,
                  value
                )
              }
            />

            <ToggleRow
              icon={Fingerprint}
              title="Fingerprint Unlock"
              description="Use fingerprint verification where supported."
              value={fingerprint}
              onChange={(value) =>
                updateBoolean(
                  'aarush_fingerprint_enabled',
                  setFingerprint,
                  value
                )
              }
            />

            <ToggleRow
              icon={LockKeyhole}
              title="PIN Lock"
              description="Require a PIN before protected access."
              value={pinLock}
              onChange={(value) =>
                updateBoolean(
                  'aarush_pin_lock_enabled',
                  setPinLock,
                  value
                )
              }
            />
          </div>
        </Section>

        <Section title="Active Devices" icon={Smartphone}>
          <div style={styles.deviceList}>
            {devices.map((device) => (
              <div key={device.id} style={styles.deviceCard}>
                <span style={styles.deviceIcon}>
                  {device.os === 'Android' ? (
                    <Smartphone size={19} />
                  ) : (
                    <Laptop size={19} />
                  )}
                </span>

                <div style={styles.deviceCopy}>
                  <div style={styles.deviceTitleRow}>
                    <strong>{device.name}</strong>

                    {device.current ? (
                      <span style={styles.currentBadge}>
                        Current device
                      </span>
                    ) : null}
                  </div>

                  <span style={styles.deviceMeta}>
                    {device.os} · {device.browser}
                  </span>
                  <span style={styles.deviceMeta}>
                    {device.location}
                  </span>
                  <span style={styles.deviceMeta}>
                    Login: {device.loginTime} · Last activity:{' '}
                    {device.lastActivity}
                  </span>

                  <div style={styles.inlineActions}>
                    {!device.current && !device.trusted ? (
                      <button
                        type="button"
                        onClick={() => trustDevice(device.id)}
                        style={styles.smallAction}
                      >
                        <UserCheck size={13} />
                        Trust Device
                      </button>
                    ) : null}

                    {!device.current && device.trusted ? (
                      <button
                        type="button"
                        onClick={() =>
                          removeDeviceTrust(device.id)
                        }
                        style={styles.smallAction}
                      >
                        Remove Trust
                      </button>
                    ) : null}

                    {!device.current ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDevices((current) =>
                            current.filter(
                              (item) => item.id !== device.id
                            )
                          );
                          showToast('Device logged out.');
                        }}
                        style={styles.smallDangerAction}
                      >
                        <LogOut size={13} />
                        Logout Device
                      </button>
                    ) : null}
                  </div>
                </div>

                <MoreHorizontal
                  size={17}
                  color="#8290ad"
                  style={{ flexShrink: 0 }}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Login Sessions" icon={Globe2}>
          <div style={styles.timeline}>
            {sessions.map((session) => (
              <div key={session.id} style={styles.sessionItem}>
                <span
                  style={{
                    ...styles.timelineDot,
                    background:
                      session.status === 'Current'
                        ? '#82e9c1'
                        : session.status === 'Active'
                          ? '#ffd27d'
                          : '#8290ad',
                  }}
                />

                <div style={styles.sessionCopy}>
                  <strong>{session.device}</strong>
                  <span style={styles.deviceMeta}>
                    {session.browser} · IP {session.ip}
                  </span>
                  <span style={styles.deviceMeta}>
                    {session.time} · {session.date}
                  </span>
                  <span style={styles.sessionStatus}>
                    {session.status}
                  </span>
                </div>

                {session.status !== 'Current' ? (
                  <button
                    type="button"
                    onClick={() => revokeSession(session.id)}
                    style={styles.smallDangerAction}
                  >
                    Revoke
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={logoutAllOtherDevices}
            style={styles.fullAction}
          >
            <LogOut size={16} />
            Logout All Other Devices
          </button>
        </Section>

        <Section title="Privacy Protection" icon={Shield}>
          <div style={styles.settingsList}>
            <ToggleRow
              icon={ScanLine}
              title="Screenshot Shield"
              description="Protect sensitive screens from screenshots."
              value={privacy.screenshotShield}
              onChange={(value) =>
                updatePrivacy('screenshotShield', value)
              }
            />

            <ToggleRow
              icon={Video}
              title="Screen Recording Protection"
              description="Protect sensitive content during recording."
              value={privacy.screenRecording}
              onChange={(value) =>
                updatePrivacy('screenRecording', value)
              }
            />

            <ToggleRow
              icon={Eye}
              title="Shoulder Surf Protection"
              description="Blur private content when someone is nearby."
              value={privacy.shoulderSurf}
              onChange={(value) =>
                updatePrivacy('shoulderSurf', value)
              }
            />

            <ToggleRow
              icon={ShieldCheck}
              title="Gaze Lock"
              description="Protect your screen when you look away."
              value={privacy.gazeLock}
              onChange={(value) =>
                updatePrivacy('gazeLock', value)
              }
            />

            <ToggleRow
              icon={LockKeyhole}
              title="One Tap Lock"
              description="Lock Aarush immediately."
              value={privacy.oneTapLock}
              onChange={(value) =>
                updatePrivacy('oneTapLock', value)
              }
            />

            <ToggleRow
              icon={ShieldAlert}
              title="Emergency Privacy"
              description="Enable fast emergency protection."
              value={privacy.emergencyPrivacy}
              onChange={(value) =>
                updatePrivacy('emergencyPrivacy', value)
              }
            />

            <ToggleRow
              icon={Lock}
              title="App Lock"
              description="Require verification before protected access."
              value={privacy.appLock}
              onChange={(value) =>
                updatePrivacy('appLock', value)
              }
            />

            <ToggleRow
              icon={Archive}
              title="Decoy Vault"
              description="Protect hidden secure storage."
              value={privacy.decoyVault}
              onChange={(value) =>
                updatePrivacy('decoyVault', value)
              }
            />
          </div>
        </Section>

        <Section title="Security Alerts" icon={Bell}>
          <div style={styles.alertList}>
            {SECURITY_ALERTS.map((alert) => (
              <div key={alert.id} style={styles.alertRow}>
                <StatusDot severity={alert.severity} />

                <div style={styles.alertCopy}>
                  <strong>{alert.title}</strong>
                  <span style={styles.deviceMeta}>
                    {alert.status} · {alert.time} · {alert.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Trusted Devices" icon={UserCheck}>
          <div style={styles.deviceList}>
            {devices
              .filter((device) => device.trusted)
              .map((device) => (
                <div key={device.id} style={styles.trustedRow}>
                  <UserCheck size={17} color="#82e9c1" />

                  <div style={styles.deviceCopy}>
                    <strong>{device.name}</strong>
                    <span style={styles.deviceMeta}>
                      {device.os} · {device.location}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeDeviceTrust(device.id)
                    }
                    style={styles.smallDangerAction}
                  >
                    Remove Trust
                  </button>
                </div>
              ))}
          </div>
        </Section>

        <Section title="Security Systems" icon={Server}>
          <div style={styles.systemGrid}>
            {SECURITY_SYSTEMS.map(([name, status]) => (
              <div key={name} style={styles.systemRow}>
                <span style={styles.systemStatus}>
                  <CheckCircle2 size={14} />
                </span>

                <span style={styles.systemName}>{name}</span>

                <span
                  style={{
                    ...styles.systemLabel,
                    color:
                      status === 'Syncing'
                        ? '#ffd27d'
                        : '#82e9c1',
                  }}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Emergency Security Actions" icon={ShieldAlert}>
          <div style={styles.actionGrid}>
            <button
              type="button"
              onClick={logoutAllOtherDevices}
              style={styles.emergencyButton}
            >
              <LogOut size={17} />
              Logout All Devices
            </button>

            <button
              type="button"
              onClick={() => showToast('Account lock requested.')}
              style={styles.emergencyButton}
            >
              <Ban size={17} />
              Lock Account
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/emergency-privacy')
              }
              style={styles.emergencyButton}
            >
              <ShieldAlert size={17} />
              Open Emergency Privacy
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/privacy-dashboard')
              }
              style={styles.emergencyButton}
            >
              <ShieldCheck size={17} />
              Open Privacy Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/app-lock-settings')
              }
              style={styles.emergencyButton}
            >
              <LockKeyhole size={17} />
              Open App Lock Settings
            </button>

            <button
              type="button"
              onClick={() =>
                showToast('Security report download prepared.')
              }
              style={styles.emergencyButton}
            >
              <ArrowDownToLine size={17} />
              Download Security Report
            </button>
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
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ActionSetting({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.actionSetting}
    >
      <span style={styles.smallIcon}>
        <Icon size={17} />
      </span>

      <span style={styles.rowCopy}>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <ChevronRight size={16} color="#8290ad" />
    </button>
  );
}

function MailIcon(props) {
  return <Archive {...props} />;
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
    maxWidth: '860px',
    margin: '0 auto',
    padding: '1rem 0.9rem',
    display: 'grid',
    gap: '0.9rem',
  },

  heroCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '1rem',
    borderRadius: '1.3rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
  },

  heroShield: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '1rem',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
    boxShadow: '0 0 24px rgba(124,92,255,0.24)',
  },

  heroCopy: {
    minWidth: 0,
    flex: 1,
  },

  title: {
    margin: 0,
    color: '#f5f8ff',
    fontSize: '1.08rem',
    fontWeight: 850,
  },

  subtitle: {
    margin: '0.25rem 0 0',
    color: '#96a3bf',
    fontSize: '0.74rem',
    lineHeight: 1.5,
  },

  excellentBadge: {
    alignSelf: 'flex-start',
    padding: '0.35rem 0.5rem',
    borderRadius: '999px',
    background: 'rgba(130,233,193,0.12)',
    color: '#82e9c1',
    fontSize: '0.62rem',
    fontWeight: 850,
  },

  scoreCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(15,19,30,0.94))',
    border: '1px solid rgba(124,92,255,0.24)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.24)',
  },

  scoreCircle: {
    width: '6.4rem',
    height: '6.4rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    padding: '0.45rem',
  },

  scoreInner: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    borderRadius: '999px',
    background: '#101624',
  },

  scoreCopy: {
    minWidth: 0,
  },

  scoreTitle: {
    margin: 0,
    color: '#f5f8ff',
    fontSize: '0.98rem',
  },

  scoreText: {
    margin: '0.35rem 0 0',
    color: '#96a3bf',
    fontSize: '0.73rem',
    lineHeight: 1.5,
  },

  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.55rem',
  },

  overviewCard: {
    minHeight: '5.5rem',
    display: 'grid',
    alignContent: 'center',
    gap: '0.2rem',
    padding: '0.75rem',
    borderRadius: '1rem',
    background: 'rgba(15,19,30,0.9)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  overviewIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '0.65rem',
    background: 'rgba(255,255,255,0.05)',
  },

  overviewValue: {
    color: '#f5f8ff',
    fontSize: '1rem',
    fontWeight: 850,
  },

  overviewLabel: {
    color: '#96a3bf',
    fontSize: '0.65rem',
    fontWeight: 700,
  },

  card: {
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.2)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    marginBottom: '0.8rem',
  },

  sectionTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
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
    color: '#f5f8ff',
    fontSize: '0.92rem',
    fontWeight: 850,
  },

  settingsList: {
    display: 'grid',
    gap: '0.5rem',
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

  actionSetting: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '0.75rem',
    borderRadius: '0.9rem',
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.04)',
    color: '#f4f7ff',
    textAlign: 'left',
    cursor: 'pointer',
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

  deviceList: {
    display: 'grid',
    gap: '0.55rem',
  },

  deviceCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    padding: '0.75rem',
    borderRadius: '0.9rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
  },

  deviceIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    background: 'rgba(77,215,255,0.1)',
    color: '#9deeff',
  },

  deviceCopy: {
    minWidth: 0,
    flex: 1,
    display: 'grid',
    gap: '0.2rem',
  },

  deviceTitleRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },

  currentBadge: {
    padding: '0.2rem 0.35rem',
    borderRadius: '999px',
    background: 'rgba(130,233,193,0.12)',
    color: '#82e9c1',
    fontSize: '0.55rem',
    fontWeight: 850,
  },

  deviceMeta: {
    color: '#96a3bf',
    fontSize: '0.67rem',
    lineHeight: 1.4,
  },

  inlineActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginTop: '0.35rem',
  },

  smallAction: {
    minHeight: '1.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0 0.5rem',
    border: '1px solid rgba(124,92,255,0.28)',
    borderRadius: '999px',
    background: 'rgba(124,92,255,0.1)',
    color: '#dce5f8',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  smallDangerAction: {
    minHeight: '1.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0 0.5rem',
    border: '1px solid rgba(255,79,122,0.22)',
    borderRadius: '999px',
    background: 'rgba(255,79,122,0.08)',
    color: '#ffb1c8',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  timeline: {
    display: 'grid',
    gap: '0.1rem',
  },

  sessionItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },

  timelineDot: {
    width: '0.6rem',
    height: '0.6rem',
    marginTop: '0.3rem',
    flexShrink: 0,
    borderRadius: '999px',
  },

  sessionCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.2rem',
    flex: 1,
  },

  sessionStatus: {
    width: 'fit-content',
    padding: '0.2rem 0.35rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    color: '#cbd6ec',
    fontSize: '0.57rem',
    fontWeight: 800,
  },

  fullAction: {
    width: '100%',
    minHeight: '2.6rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    marginTop: '0.75rem',
    border: '1px solid rgba(255,79,122,0.22)',
    borderRadius: '999px',
    background: 'rgba(255,79,122,0.08)',
    color: '#ffb1c8',
    fontSize: '0.72rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  alertList: {
    display: 'grid',
    gap: '0.55rem',
  },

  alertRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    padding: '0.7rem',
    borderRadius: '0.85rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
  },

  statusDot: {
    width: '0.55rem',
    height: '0.55rem',
    marginTop: '0.3rem',
    flexShrink: 0,
    borderRadius: '999px',
  },

  alertCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.2rem',
    flex: 1,
  },

  trustedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    padding: '0.7rem',
    borderRadius: '0.85rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
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

  systemStatus: {
    display: 'grid',
    placeItems: 'center',
    color: '#82e9c1',
  },

  systemName: {
    minWidth: 0,
    overflow: 'hidden',
    flex: 1,
    color: '#cbd6ec',
    fontSize: '0.6rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  systemLabel: {
    fontSize: '0.55rem',
    fontWeight: 850,
  },

  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.5rem',
  },

  emergencyButton: {
    minHeight: '3rem',
    display: 'grid',
    placeItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem',
    border: '1px solid rgba(255,79,122,0.2)',
    borderRadius: '0.85rem',
    background:
      'linear-gradient(135deg, rgba(255,79,122,0.1), rgba(124,92,255,0.1))',
    color: '#ffd7e2',
    fontSize: '0.62rem',
    fontWeight: 800,
    textAlign: 'center',
    cursor: 'pointer',
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
    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
    color: '#eaf0ff',
    fontSize: '0.72rem',
    fontWeight: 750,
  },

  toastClose: {
    width: '1.6rem',
    height: '1.6rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    color: '#aab6cf',
    cursor: 'pointer',
  },
};