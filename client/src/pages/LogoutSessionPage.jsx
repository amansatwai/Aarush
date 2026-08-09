import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Ban,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  Download,
  FileDown,
  Fingerprint,
  Globe2,
  Laptop,
  LockKeyhole,
  LogOut,
  Monitor,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Wifi,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const INITIAL_SESSIONS = [
  {
    id: 'session-current',
    name: 'Windows Laptop',
    type: 'Desktop',
    os: 'Windows 11',
    browser: 'Chrome 125',
    location: 'Ghaziabad, India',
    loginTime: 'Today, 08:12 AM',
    lastActivity: 'Active now',
    ip: '103.•••.••.42',
    method: 'Password + device verification',
    trusted: true,
    current: true,
    model: 'Dell Inspiron',
    manufacturer: 'Dell',
    osVersion: 'Windows 11 23H2',
    browserVersion: 'Chrome 125.0',
    resolution: '1920 × 1080',
    created: 'June 01, 2026',
  },
  {
    id: 'session-android',
    name: 'Android Phone',
    type: 'Mobile',
    os: 'Android',
    browser: 'Chrome Mobile',
    location: 'New Delhi, India',
    loginTime: 'Yesterday, 10:42 PM',
    lastActivity: '18 minutes ago',
    ip: '117.•••.••.81',
    method: 'Google sign-in',
    trusted: true,
    current: false,
    model: 'Pixel device',
    manufacturer: 'Google',
    osVersion: 'Android 14',
    browserVersion: 'Chrome Mobile',
    resolution: '1080 × 2400',
    created: 'May 27, 2026',
  },
  {
    id: 'session-iphone',
    name: 'iPhone',
    type: 'Mobile',
    os: 'iOS',
    browser: 'Safari',
    location: 'Mumbai, India',
    loginTime: 'May 18, 2026, 04:18 PM',
    lastActivity: 'May 18, 2026',
    ip: '49.•••.••.19',
    method: 'Password',
    trusted: false,
    current: false,
    model: 'iPhone',
    manufacturer: 'Apple',
    osVersion: 'iOS 17',
    browserVersion: 'Safari 17',
    resolution: '1179 × 2556',
    created: 'May 18, 2026',
  },
];

const LOGIN_HISTORY = [
  ['Windows Laptop', 'Chrome', 'Today', '08:12 AM', 'Ghaziabad, India', '103.•••.••.42', 'Password'],
  ['Android Phone', 'Chrome', 'Yesterday', '10:42 PM', 'New Delhi, India', '117.•••.••.81', 'Google'],
  ['iPhone', 'Safari', 'May 18, 2026', '04:18 PM', 'Mumbai, India', '49.•••.••.19', 'Password'],
  ['Windows Laptop', 'Edge', 'May 14, 2026', '02:22 PM', 'Ghaziabad, India', '103.•••.••.42', 'Password'],
  ['MacBook', 'Firefox', 'May 09, 2026', '11:05 AM', 'Bengaluru, India', '122.•••.••.72', 'Google'],
];

const LOGOUT_HISTORY = [
  ['Android Phone', 'Today', '07:42 AM', 'Manual logout'],
  ['iPhone', 'May 18, 2026', '08:20 PM', 'Device revoked'],
  ['MacBook', 'May 12, 2026', '06:14 PM', 'Session expired'],
  ['Android Phone', 'May 05, 2026', '09:32 AM', 'Emergency Privacy'],
  ['Windows Laptop', 'April 29, 2026', '04:11 PM', 'Password changed'],
];

const SECURITY_EVENTS = [
  ['New login detected', 'green', 'Reviewed', 'Today', '08:12 AM'],
  ['Trusted device added', 'green', 'Verified', 'Yesterday', '10:44 PM'],
  ['Trusted device removed', 'yellow', 'Completed', 'May 18, 2026', '08:21 PM'],
  ['Session revoked', 'yellow', 'Completed', 'May 18, 2026', '08:20 PM'],
  ['Password changed', 'green', 'Completed', 'May 17, 2026', '04:32 PM'],
  ['Two-factor enabled', 'green', 'Active', 'May 16, 2026', '11:42 AM'],
  ['Biometric enabled', 'green', 'Active', 'May 15, 2026', '03:08 PM'],
  ['App Lock enabled', 'green', 'Active', 'May 15, 2026', '03:06 PM'],
  ['Screenshot Shield enabled', 'green', 'Active', 'May 15, 2026', '03:05 PM'],
  ['Emergency Privacy activated', 'red', 'Protected', 'May 11, 2026', '09:18 PM'],
];

const SYSTEMS = [
  ['Session Monitor', 'Active'],
  ['Device Trust Engine', 'Active'],
  ['Login Activity Tracker', 'Active'],
  ['Realtime Session Sync', 'Syncing'],
  ['Authentication Sync', 'Active'],
  ['Encryption Layer', 'Active'],
  ['Security Analytics', 'Active'],
  ['Notification Sync', 'Active'],
  ['Privacy Protection', 'Active'],
  ['Emergency Lock Service', 'Active'],
];

function sessionIcon(type) {
  if (type === 'Desktop') {
    return Laptop;
  }

  if (type === 'Tablet') {
    return Monitor;
  }

  return Smartphone;
}

function severityColor(value) {
  if (value === 'red') {
    return '#ff789d';
  }

  if (value === 'yellow') {
    return '#ffd27d';
  }

  return '#82e9c1';
}

export default function LogoutSessionPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [selectedSession, setSelectedSession] =
    useState(null);
  const [toast, setToast] = useState('');
  const [notifications, setNotifications] = useState({
    login: true,
    device: true,
    trusted: true,
    revoked: true,
    logout: false,
    emergency: true,
  });

  const activeSessions = sessions.length;
  const trustedDevices = sessions.filter(
    (session) => session.trusted
  ).length;

  const currentSession = useMemo(
    () => sessions.find((session) => session.current),
    [sessions]
  );

  const showToast = (value) => {
    setToast(value);
    window.setTimeout(() => setToast(''), 2600);
  };

  const revokeSession = (id) => {
    setSessions((current) =>
      current.filter((session) => session.id !== id)
    );
    setSelectedSession(null);
    showToast('Session revoked successfully.');
  };

  const toggleTrust = (id) => {
    setSessions((current) =>
      current.map((session) =>
        session.id === id
          ? { ...session, trusted: !session.trusted }
          : session
      )
    );
    showToast('Device trust updated.');
  };

  const logoutAllOtherDevices = () => {
    setSessions((current) =>
      current.filter((session) => session.current)
    );
    showToast('All other devices have been logged out.');
  };

  const revokeAllSessions = () => {
    setSessions([]);
    setSelectedSession(null);
    showToast('All sessions have been revoked.');
  };

  const exportReport = (format) => {
    const report = {
      exportedAt: new Date().toISOString(),
      activeSessions: sessions,
      loginHistory: LOGIN_HISTORY,
      logoutHistory: LOGOUT_HISTORY,
      securityEvents: SECURITY_EVENTS,
    };

    if (format === 'JSON') {
      const blob = new Blob(
        [JSON.stringify(report, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'aarush-session-report.json';
      anchor.click();
      URL.revokeObjectURL(url);
    }

    showToast(`${format} session report prepared.`);
  };

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Session Management"
        showBackButton
      />

      <main style={styles.content}>
        <section style={styles.hero}>
          <span style={styles.heroIcon}>
            <ShieldCheck size={26} />
          </span>

          <div style={styles.heroCopy}>
            <h1 style={styles.title}>
              Manage Your Active Sessions
            </h1>
            <p style={styles.subtitle}>
              View every device signed into your Aarush account and
              control access across all devices.
            </p>
          </div>
        </section>

        <section style={styles.scoreCard}>
          <div style={styles.scoreCircle}>
            <div style={styles.scoreInner}>
              <strong>95</strong>
              <span>/ 100</span>
            </div>
          </div>

          <div>
            <h2 style={styles.scoreTitle}>Excellent security</h2>
            <p style={styles.scoreText}>
              Your active sessions and trusted devices are under
              strong protection.
            </p>
          </div>
        </section>

        <section style={styles.card}>
          <SectionTitle icon={ShieldCheck} title="This Device" />

          {currentSession ? (
            <SessionCard
              session={currentSession}
              onDetails={setSelectedSession}
              onRevoke={revokeSession}
              onTrust={toggleTrust}
            />
          ) : (
            <p style={styles.emptyText}>
              No current session was found.
            </p>
          )}
        </section>

        <section style={styles.overviewGrid}>
          <Overview
            icon={Globe2}
            label="Active Sessions"
            value={activeSessions}
          />
          <Overview
            icon={UserCheck}
            label="Trusted Devices"
            value={trustedDevices}
          />
          <Overview
            icon={Smartphone}
            label="Used This Month"
            value="6"
          />
          <Overview
            icon={AlertTriangle}
            label="New This Week"
            value="1"
          />
          <Overview
            icon={Clock3}
            label="Avg. Duration"
            value="4h 18m"
          />
          <Overview
            icon={Activity}
            label="Longest Session"
            value="2d 6h"
          />
          <Overview
            icon={RefreshCw}
            label="Shortest Session"
            value="12m"
          />
          <Overview
            icon={Clock3}
            label="Last Login"
            value="Today"
          />
        </section>

        <section style={styles.card}>
          <SectionTitle icon={Monitor} title="Active Devices" />

          <div style={styles.list}>
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onDetails={setSelectedSession}
                onRevoke={revokeSession}
                onTrust={toggleTrust}
              />
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <SectionTitle
            icon={Globe2}
            title="Recent Login Activity"
          />

          <Timeline>
            {LOGIN_HISTORY.map((event) => (
              <TimelineItem
                key={event.join('-')}
                title={`${event[0]} · ${event[1]}`}
                details={`${event[3]} · ${event[2]} · ${event[4]} · IP ${event[5]} · ${event[6]}`}
                color="#82e9c1"
              />
            ))}
          </Timeline>
        </section>

        <section style={styles.card}>
          <SectionTitle
            icon={LogOut}
            title="Recent Logout Activity"
          />

          <Timeline>
            {LOGOUT_HISTORY.map((event) => (
              <TimelineItem
                key={event.join('-')}
                title={event[0]}
                details={`${event[2]} · ${event[1]} · ${event[3]}`}
                color="#ffd27d"
              />
            ))}
          </Timeline>
        </section>

        <section style={styles.card}>
          <SectionTitle
            icon={UserCheck}
            title="Trusted Devices"
          />

          <div style={styles.list}>
            {sessions
              .filter((session) => session.trusted)
              .map((session) => (
                <div key={session.id} style={styles.trustedRow}>
                  <UserCheck size={17} color="#82e9c1" />

                  <div style={styles.sessionCopy}>
                    <strong>{session.name}</strong>
                    <small>
                      {session.os} · {session.location}
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleTrust(session.id)}
                    style={styles.smallDangerButton}
                  >
                    Remove Trust
                  </button>
                </div>
              ))}
          </div>
        </section>

        <section style={styles.card}>
          <SectionTitle
            icon={ShieldAlert}
            title="Recent Security Events"
          />

          <Timeline>
            {SECURITY_EVENTS.map((event) => (
              <TimelineItem
                key={event.join('-')}
                title={event[0]}
                details={`${event[2]} · ${event[3]} · ${event[4]}`}
                color={severityColor(event[1])}
              />
            ))}
          </Timeline>
        </section>

        <section style={styles.card}>
          <SectionTitle
            icon={Database}
            title="Session Security Systems"
          />

          <div style={styles.systemGrid}>
            {SYSTEMS.map(([name, status]) => (
              <div key={name} style={styles.systemRow}>
                <CheckCircle2 size={14} color="#82e9c1" />
                <span>{name}</span>
                <small
                  style={{
                    color:
                      status === 'Syncing'
                        ? '#ffd27d'
                        : '#82e9c1',
                  }}
                >
                  {status}
                </small>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.emergencyCard}>
          <SectionTitle
            icon={ShieldAlert}
            title="Emergency Session Lockdown"
            emergency
          />

          <Action
            icon={LogOut}
            label="Logout All Other Devices"
            onClick={logoutAllOtherDevices}
            danger
          />

          <Action
            icon={LogOut}
            label="Logout Every Device"
            onClick={revokeAllSessions}
            danger
          />

          <Action
            icon={Ban}
            label="Revoke All Sessions"
            onClick={revokeAllSessions}
            danger
          />

          <Action
            icon={LockKeyhole}
            label="Lock Account"
            onClick={() =>
              showToast('Account lock requested.')
            }
            danger
          />

          <Action
            icon={RefreshCw}
            label="Force Re-authentication"
            onClick={() =>
              showToast('Re-authentication requested.')
            }
            danger
          />

          <Action
            icon={ShieldAlert}
            label="Open Emergency Privacy"
            onClick={() => navigate('/emergency-privacy')}
            danger
          />

          <Action
            icon={ShieldCheck}
            label="Open Security Center"
            onClick={() => navigate('/security-center')}
            danger
          />

          <Action
            icon={Download}
            label="Download Security Report"
            onClick={() => exportReport('PDF')}
            danger
          />
        </section>

        <section style={styles.card}>
          <SectionTitle
            icon={FileDown}
            title="Session Export"
          />

          <div style={styles.exportGrid}>
            {['PDF', 'JSON', 'CSV'].map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => exportReport(format)}
                style={styles.exportButton}
              >
                <FileDown size={16} />
                Export {format}
              </button>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <SectionTitle
            icon={Bell}
            title="Notification Preferences"
          />

          <div style={styles.preferenceList}>
            <Preference
              label="New Login Alerts"
              value={notifications.login}
              onChange={(value) =>
                setNotifications((current) => ({
                  ...current,
                  login: value,
                }))
              }
            />
            <Preference
              label="New Device Alerts"
              value={notifications.device}
              onChange={(value) =>
                setNotifications((current) => ({
                  ...current,
                  device: value,
                }))
              }
            />
            <Preference
              label="Trusted Device Alerts"
              value={notifications.trusted}
              onChange={(value) =>
                setNotifications((current) => ({
                  ...current,
                  trusted: value,
                }))
              }
            />
            <Preference
              label="Session Revoked Alerts"
              value={notifications.revoked}
              onChange={(value) =>
                setNotifications((current) => ({
                  ...current,
                  revoked: value,
                }))
              }
            />
            <Preference
              label="Logout Alerts"
              value={notifications.logout}
              onChange={(value) =>
                setNotifications((current) => ({
                  ...current,
                  logout: value,
                }))
              }
            />
            <Preference
              label="Emergency Privacy Alerts"
              value={notifications.emergency}
              onChange={(value) =>
                setNotifications((current) => ({
                  ...current,
                  emergency: value,
                }))
              }
            />
          </div>
        </section>
      </main>

      <BottomNav />

      {selectedSession ? (
        <DeviceDetails
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onRevoke={revokeSession}
          onTrust={toggleTrust}
        />
      ) : null}

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

function SectionTitle({ icon: Icon, title, emergency }) {
  return (
    <div style={styles.sectionHeader}>
      <span
        style={{
          ...styles.sectionIcon,
          ...(emergency ? styles.emergencyIcon : {}),
        }}
      >
        <Icon size={17} />
      </span>
      <h2 style={styles.sectionTitle}>{title}</h2>
    </div>
  );
}

function SessionCard({
  session,
  onDetails,
  onRevoke,
  onTrust,
}) {
  const Icon = sessionIcon(session.type);

  return (
    <div style={styles.sessionCard}>
      <span style={styles.deviceIcon}>
        <Icon size={19} />
      </span>

      <div style={styles.sessionCopy}>
        <div style={styles.sessionTitleRow}>
          <strong>{session.name}</strong>

          {session.current ? (
            <span style={styles.currentBadge}>
              Current device
            </span>
          ) : null}

          {session.trusted ? (
            <span style={styles.trustedBadge}>
              Trusted
            </span>
          ) : null}
        </div>

        <small>
          {session.type} · {session.os} · {session.browser}
        </small>
        <small>{session.location}</small>
        <small>Login: {session.loginTime}</small>
        <small>Last activity: {session.lastActivity}</small>

        <div style={styles.inlineActions}>
          <button
            type="button"
            onClick={() => onDetails(session)}
            style={styles.smallButton}
          >
            View Details
          </button>

          {!session.current ? (
            <button
              type="button"
              onClick={() => onTrust(session.id)}
              style={styles.smallButton}
            >
              {session.trusted ? 'Untrust' : 'Trust'}
            </button>
          ) : null}

          {!session.current ? (
            <button
              type="button"
              onClick={() => onRevoke(session.id)}
              style={styles.smallDangerButton}
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Timeline({ children }) {
  return <div style={styles.timeline}>{children}</div>;
}

function TimelineItem({ title, details, color }) {
  return (
    <div style={styles.timelineItem}>
      <span
        style={{
          ...styles.timelineDot,
          background: color,
          boxShadow: `0 0 9px ${color}`,
        }}
      />

      <div style={styles.timelineCopy}>
        <strong>{title}</strong>
        <small>{details}</small>
      </div>
    </div>
  );
}

function Overview({ icon: Icon, label, value }) {
  return (
    <div style={styles.overview}>
      <span style={styles.overviewIcon}>
        <Icon size={17} />
      </span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}

function Action({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.action,
        ...(danger ? styles.dangerAction : {}),
      }}
    >
      <Icon size={16} />
      <span>{label}</span>
      <ChevronRight size={15} />
    </button>
  );
}

function Preference({ label, value, onChange }) {
  return (
    <label style={styles.preference}>
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        style={styles.checkbox}
      />
    </label>
  );
}

function DeviceDetails({
  session,
  onClose,
  onRevoke,
  onTrust,
}) {
  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.sectionTitle}>Device Details</h2>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close device details"
          >
            <X size={16} />
          </button>
        </div>

        <div style={styles.detailList}>
          <Detail label="Device ID" value={session.id} />
          <Detail label="Model" value={session.model} />
          <Detail label="Manufacturer" value={session.manufacturer} />
          <Detail label="OS version" value={session.osVersion} />
          <Detail
            label="Browser version"
            value={session.browserVersion}
          />
          <Detail
            label="Screen resolution"
            value={session.resolution}
          />
          <Detail
            label="Login method"
            value={session.method}
          />
          <Detail label="IP address" value={session.ip} />
          <Detail
            label="Last activity"
            value={session.lastActivity}
          />
          <Detail
            label="Created session"
            value={session.created}
          />
          <Detail
            label="Trusted status"
            value={session.trusted ? 'Trusted' : 'Not trusted'}
          />
        </div>

        <div style={styles.modalActions}>
          {!session.current ? (
            <button
              type="button"
              onClick={() => {
                onRevoke(session.id);
                onClose();
              }}
              style={styles.smallDangerButton}
            >
              Logout
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => onTrust(session.id)}
            style={styles.smallButton}
          >
            {session.trusted ? 'Remove Trust' : 'Trust Device'}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={styles.smallButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span>{label}</span>
      <strong>{value || 'Unavailable'}</strong>
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
    maxWidth: '850px',
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

  scoreCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(15,19,30,0.94))',
    border: '1px solid rgba(124,92,255,0.24)',
  },

  scoreCircle: {
    width: '6.2rem',
    height: '6.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    background:
      'conic-gradient(#4dd7ff 95%, rgba(255,255,255,0.08) 95% 100%)',
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

  scoreTitle: {
    margin: 0,
    fontSize: '0.96rem',
  },

  scoreText: {
    margin: '0.35rem 0 0',
    color: '#96a3bf',
    fontSize: '0.72rem',
    lineHeight: 1.5,
  },

  card: {
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  emergencyCard: {
    padding: '1rem',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg, rgba(255,79,122,0.12), rgba(15,19,30,0.94))',
    border: '1px solid rgba(255,79,122,0.22)',
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
    flexShrink: 0,
    borderRadius: '0.7rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))',
    color: '#dce8ff',
  },

  emergencyIcon: {
    background: 'rgba(255,79,122,0.14)',
    color: '#ff9fba',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '0.92rem',
    fontWeight: 850,
  },

  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.55rem',
  },

  overview: {
    minHeight: '5.1rem',
    display: 'grid',
    alignContent: 'center',
    gap: '0.18rem',
    padding: '0.7rem',
    borderRadius: '0.95rem',
    background: 'rgba(15,19,30,0.9)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  overviewIcon: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '0.6rem',
    background: 'rgba(255,255,255,0.05)',
    color: '#9deeff',
  },

  sessionList: {
    display: 'grid',
    gap: '0.55rem',
  },

  sessionCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    padding: '0.75rem',
    borderRadius: '0.95rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
  },

  deviceIcon: {
    width: '2.35rem',
    height: '2.35rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.1))',
    color: '#dce8ff',
  },

  sessionCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.2rem',
    flex: 1,
  },

  sessionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.35rem',
  },

  currentBadge: {
    padding: '0.2rem 0.35rem',
    borderRadius: '999px',
    background: 'rgba(77,215,255,0.12)',
    color: '#9deeff',
    fontSize: '0.55rem',
    fontWeight: 850,
  },

  trustedBadge: {
    padding: '0.2rem 0.35rem',
    borderRadius: '999px',
    background: 'rgba(130,233,193,0.12)',
    color: '#82e9c1',
    fontSize: '0.55rem',
    fontWeight: 850,
  },

  inlineActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginTop: '0.35rem',
  },

  smallButton: {
    minHeight: '1.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 0.55rem',
    border: '1px solid rgba(124,92,255,0.28)',
    borderRadius: '999px',
    background: 'rgba(124,92,255,0.1)',
    color: '#dce5f8',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  smallDangerButton: {
    minHeight: '1.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 0.55rem',
    border: '1px solid rgba(255,79,122,0.22)',
    borderRadius: '999px',
    background: 'rgba(255,79,122,0.08)',
    color: '#ffb1c8',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  trustedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    padding: '0.7rem',
    borderRadius: '0.85rem',
    background: 'rgba(255,255,255,0.04)',
  },

  action: {
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

  dangerAction: {
    borderColor: 'rgba(255,79,122,0.22)',
    background: 'rgba(255,79,122,0.08)',
    color: '#ffb1c8',
  },

  timeline: {
    display: 'grid',
    gap: '0.15rem',
  },

  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.55rem',
    padding: '0.65rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },

  timelineDot: {
    width: '0.5rem',
    height: '0.5rem',
    marginTop: '0.3rem',
    flexShrink: 0,
    borderRadius: '999px',
  },

  timelineCopy: {
    display: 'grid',
    gap: '0.18rem',
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

  exportGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '0.45rem',
  },

  exportButton: {
    minHeight: '2.5rem',
    display: 'grid',
    placeItems: 'center',
    gap: '0.25rem',
    padding: '0.4rem',
    border: '1px solid rgba(124,92,255,0.25)',
    borderRadius: '0.75rem',
    background: 'rgba(124,92,255,0.1)',
    color: '#eaf0ff',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  preferenceList: {
    display: 'grid',
    gap: '0.35rem',
  },

  preference: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    padding: '0.65rem 0.7rem',
    borderRadius: '0.7rem',
    background: 'rgba(255,255,255,0.04)',
    color: '#cbd6ec',
    fontSize: '0.7rem',
  },

  checkbox: {
    width: '1.1rem',
    height: '1.1rem',
    accentColor: '#7c5cff',
  },

  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1300,
    display: 'grid',
    placeItems: 'center',
    padding: '1rem',
    background: 'rgba(2,5,10,0.72)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  modal: {
    width: 'min(100%, 480px)',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(17,22,35,0.98)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    marginBottom: '0.8rem',
  },

  closeButton: {
    width: '2.1rem',
    height: '2.1rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.05)',
    color: '#dce5f8',
    cursor: 'pointer',
  },

  detailList: {
    display: 'grid',
    gap: '0.35rem',
  },

  detailRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    padding: '0.6rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    color: '#96a3bf',
    fontSize: '0.7rem',
  },

  modalActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginTop: '0.9rem',
  },

  emptyText: {
    margin: 0,
    color: '#96a3bf',
    fontSize: '0.74rem',
  },

  toast: {
    position: 'fixed',
    right: '1rem',
    bottom: '6.2rem',
    left: '1rem',
    zIndex: 1400,
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