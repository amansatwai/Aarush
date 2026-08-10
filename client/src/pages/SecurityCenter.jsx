import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  ScanLine,
  Shield,
  ShieldAlert,
  Smartphone,
  Trash2,
  Unlock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useSecurityStatus from '../hooks/useSecurityStatus';
import {
  lockSession,
  logoutAllDevices,
  revokeCurrentDevice,
  runSecurityScan,
} from '../utils/securityEngine';
import {
  trustDevice,
  untrustDevice,
} from '../utils/deviceTrustEngine';

function formatDate(value) {
  if (!value) return 'Unknown';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getScoreColor(score) {
  if (score >= 75) return '#55e6a5';
  if (score >= 55) return '#ffd166';
  if (score >= 30) return '#ffad66';
  return '#ff6f91';
}

function DeviceRow({ device, current, onTrust }) {
  return (
    <article className="security-device-row">
      <div className="security-device-icon">
        <Smartphone size={20} />
      </div>

      <div className="security-device-copy">
        <strong>
          {device.browser || 'Unknown browser'}
          {current ? ' · This device' : ''}
        </strong>

        <span>
          {device.operating_system || 'Unknown OS'}
          {' · '}
          {device.timezone || 'Unknown timezone'}
        </span>

        <small>
          Last active {formatDate(
            device.last_activity_at ||
              device.updated_at
          )}
        </small>
      </div>

      <button
        type="button"
        className={
          device.is_trusted
            ? 'security-device-action is-trusted'
            : 'security-device-action'
        }
        onClick={() =>
          onTrust(device)
        }
      >
        {device.is_trusted ? (
          <>
            <Check size={14} />
            Trusted
          </>
        ) : (
          'Trust'
        )}
      </button>
    </article>
  );
}

function SecurityAction({
  icon,
  title,
  description,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      className={
        danger
          ? 'security-action-row is-danger'
          : 'security-action-row'
      }
      onClick={onClick}
    >
      <div className="security-action-icon">
        {icon}
      </div>

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <ChevronRight size={18} />
    </button>
  );
}

export default function SecurityCenter() {
  const navigate = useNavigate();
  const {
    security,
    loading,
    error,
    refresh,
  } = useSecurityStatus();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const runAction = async (
    action,
    successMessage
  ) => {
    try {
      setBusy(true);
      setActionError('');
      await action();
      setNotice(successMessage);
      await refresh();
    } catch (actionException) {
      setActionError(
        actionException?.message ||
          'Unable to complete this security action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleTrust = async (device) => {
    await runAction(
      () =>
        device.is_trusted
          ? untrustDevice(device.device_id)
          : trustDevice(device.device_id),
      device.is_trusted
        ? 'Device trust removed.'
        : 'Device marked as trusted.'
    );
  };

  const handleLogoutAll = () => {
    const confirmed = window.confirm(
      'Log out all other devices?'
    );

    if (!confirmed) return;

    runAction(
      logoutAllDevices,
      'All other devices were logged out.'
    );
  };

  const handleRevokeCurrent = () => {
    const confirmed = window.confirm(
      'Revoke the current device? You may need to sign in again.'
    );

    if (!confirmed) return;

    runAction(
      revokeCurrentDevice,
      'Current device revoked.'
    );
  };

  const handleLock = () => {
    runAction(
      lockSession,
      'Session locked.'
    );
  };

  const handleScan = () => {
    runAction(
      async () => {
        await runSecurityScan();
      },
      'Security scan completed.'
    );
  };

  if (loading) {
    return (
      <div className="social-page security-page">
        <TopBar />

        <main className="security-content">
          <div className="security-loading-header" />
          <div className="security-loading-card" />
          <div className="security-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  const score = security?.score || 0;
  const scoreColor = getScoreColor(score);

  return (
    <div className="social-page security-page">
      <TopBar />

      <main className="security-content">
        <header className="security-header">
          <button
            type="button"
            className="security-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="security-eyebrow">
              Protection
            </p>
            <h1>Security Center</h1>
          </div>

          <button
            type="button"
            className="security-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh security"
          >
            <RefreshCw
              size={18}
              className={
                busy ? 'security-spin' : undefined
              }
            />
          </button>
        </header>

        {error || actionError ? (
          <div className="security-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="security-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="security-score-card">
          <div className="security-score-ring">
            <div
              style={{
                '--score': `${score * 3.6}deg`,
                '--score-color': scoreColor,
              }}
            >
              <strong>{score}</strong>
              <span>/100</span>
            </div>
          </div>

          <div className="security-score-copy">
            <p>Security score</p>
            <h2>{security?.label}</h2>
            <span>
              {security?.suspicious
                ? 'Review recent security events.'
                : 'Your account has no urgent warnings.'}
            </span>
          </div>

          <button
            type="button"
            className="security-scan-button"
            onClick={handleScan}
            disabled={busy}
          >
            <ScanLine size={16} />
            Scan
          </button>
        </section>

        <section className="security-section">
          <div className="security-section-heading">
            <Smartphone size={17} />
            <div>
              <h2>Trusted devices</h2>
              <p>
                Review every device connected to your account.
              </p>
            </div>
          </div>

          <div className="security-card">
            {(security?.devices || []).length === 0 ? (
              <div className="security-empty">
                <Smartphone size={24} />
                <span>No devices registered yet.</span>
              </div>
            ) : (
              security.devices.map((device) => (
                <DeviceRow
                  device={device}
                  current={
                    device.device_id ===
                    security?.device?.device_id
                  }
                  onTrust={handleTrust}
                  key={
                    device.device_id ||
                    device.id
                  }
                />
              ))
            )}
          </div>
        </section>

        <section className="security-section">
          <div className="security-section-heading">
            <ShieldAlert size={17} />
            <div>
              <h2>Recent security events</h2>
              <p>
                Monitor activity that may need attention.
              </p>
            </div>
          </div>

          <div className="security-card">
            {(security?.events || []).length === 0 ? (
              <div className="security-empty">
                <Check size={24} />
                <span>No recent security events.</span>
              </div>
            ) : (
              security.events
                .slice(0, 8)
                .map((event) => (
                  <article
                    className="security-event-row"
                    key={event.id}
                  >
                    <div
                      className={
                        event.severity === 'critical'
                          ? 'security-event-icon critical'
                          : event.severity === 'warning'
                            ? 'security-event-icon warning'
                            : 'security-event-icon'
                      }
                    >
                      {event.severity ===
                      'critical' ? (
                        <ShieldAlert size={17} />
                      ) : (
                        <Shield size={17} />
                      )}
                    </div>

                    <div>
                      <strong>
                        {event.title ||
                          event.event_type}
                      </strong>
                      <span>
                        {event.description ||
                          'Security activity recorded.'}
                      </span>
                      <small>
                        {formatDate(event.created_at)}
                      </small>
                    </div>
                  </article>
                ))
            )}
          </div>
        </section>

        <section className="security-section">
          <div className="security-section-heading">
            <Lock size={17} />
            <div>
              <h2>Account protection</h2>
              <p>
                Strengthen your account and session security.
              </p>
            </div>
          </div>

          <div className="security-card">
            <SecurityAction
              icon={<KeyRound size={18} />}
              title="Login protection"
              description="Manage password and verification safeguards."
              onClick={() =>
                navigate('/security-settings')
              }
            />

            <SecurityAction
              icon={<Fingerprint size={18} />}
              title="Biometric and app lock"
              description="Protect Aarush when the app is not in use."
              onClick={() =>
                navigate('/app-lock-settings')
              }
            />

            <SecurityAction
              icon={<Globe size={18} />}
              title="Privacy protection"
              description="Review profile and social privacy controls."
              onClick={() =>
                navigate('/privacy-dashboard')
              }
            />
          </div>
        </section>

        <section className="security-section">
          <div className="security-section-heading">
            <ShieldAlert size={17} />
            <div>
              <h2>Emergency actions</h2>
              <p>
                Use these actions if you suspect account misuse.
              </p>
            </div>
          </div>

          <div className="security-card">
            <SecurityAction
              icon={<LogOut size={18} />}
              title="Logout all other devices"
              description="Immediately revoke every other active device."
              onClick={handleLogoutAll}
              danger
            />

            <SecurityAction
              icon={<Trash2 size={18} />}
              title="Revoke current device"
              description="Remove this device from your trusted devices."
              onClick={handleRevokeCurrent}
              danger
            />

            <SecurityAction
              icon={<Lock size={18} />}
              title="Lock session"
              description="Temporarily lock this Aarush session."
              onClick={handleLock}
            />
          </div>
        </section>

        <p className="security-footer">
          Zero-trust protection treats every sensitive
          action as unverified until your account and
          device are checked.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .security-page {
    min-height: 100vh;
    color: #f4f7ff;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(124,92,255,0.2),
        transparent 35%
      ),
      radial-gradient(
        circle at 100% 18%,
        rgba(77,215,255,0.1),
        transparent 30%
      ),
      #080b13;
  }

  .security-content {
    width: min(100%, 820px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .security-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .security-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .security-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .security-icon-button {
    width: 2.5rem;
    height: 2.5rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.9rem;
    color: #eaf0ff;
    background: rgba(255,255,255,0.06);
    cursor: pointer;
  }

  .security-icon-button:last-child {
    justify-self: end;
  }

  .security-icon-button:disabled,
  .security-scan-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .security-error,
  .security-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .security-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .security-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .security-score-card,
  .security-card {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .security-score-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .security-score-ring {
    width: 5.2rem;
    height: 5.2rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 50%;
    background: conic-gradient(
      var(--score-color) var(--score),
      rgba(255,255,255,0.1) var(--score)
    );
  }

  .security-score-ring > div {
    width: 4.2rem;
    height: 4.2rem;
    display: grid;
    place-items: center;
    align-content: center;
    border-radius: 50%;
    background: #111626;
  }

  .security-score-ring strong {
    color: #fff;
    font-size: 1.25rem;
  }

  .security-score-ring span {
    color: #8491ad;
    font-size: 0.6rem;
  }

  .security-score-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .security-score-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .security-score-copy h2 {
    margin: 0;
    color: #f4f7ff;
    font-size: 1.1rem;
  }

  .security-score-copy span {
    color: #9aa7c1;
    font-size: 0.72rem;
  }

  .security-scan-button {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    min-height: 2.3rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid rgba(124,92,255,0.3);
    border-radius: 0.75rem;
    color: #e4dcff;
    background: rgba(124,92,255,0.12);
    font-size: 0.7rem;
    font-weight: 850;
    cursor: pointer;
  }

  .security-section {
    margin-top: 1.3rem;
  }

  .security-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .security-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .security-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .security-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .security-device-row,
  .security-event-row,
  .security-action-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .security-device-row + .security-device-row,
  .security-event-row + .security-event-row,
  .security-action-row + .security-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .security-device-icon,
  .security-action-icon,
  .security-event-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .security-event-icon.warning {
    color: #ffd166;
    background: rgba(255,209,102,0.12);
  }

  .security-event-icon.critical {
    color: #ff9bb4;
    background: rgba(255,91,132,0.12);
  }

  .security-device-copy,
  .security-event-row > div:last-child,
  .security-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .security-device-copy strong,
  .security-event-row strong,
  .security-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .security-device-copy span,
  .security-event-row span,
  .security-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .security-device-copy small,
  .security-event-row small {
    color: #63708b;
    font-size: 0.63rem;
  }

  .security-device-action {
    min-height: 2.15rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid rgba(124,92,255,0.3);
    border-radius: 0.7rem;
    color: #e4dcff;
    background: rgba(124,92,255,0.12);
    font-size: 0.67rem;
    font-weight: 850;
    cursor: pointer;
  }

  .security-device-action.is-trusted {
    border-color: rgba(77,215,255,0.25);
    color: #c9f9ff;
    background: rgba(77,215,255,0.1);
  }

  .security-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .security-action-row > svg {
    color: #7483a1;
  }

  .security-action-row.is-danger .security-action-icon {
    color: #ff9bb4;
    background: rgba(255,91,132,0.1);
  }

  .security-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .security-footer {
    margin: 1.2rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .security-loading-header,
  .security-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: security-skeleton 1.4s infinite;
  }

  .security-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .security-loading-card {
    height: 16rem;
    margin-top: 1rem;
  }

  .security-spin {
    animation: security-spin 0.9s linear infinite;
  }

  @keyframes security-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes security-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 560px) {
    .security-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .security-score-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .security-scan-button {
      margin-left: auto;
    }

    .security-device-row {
      align-items: flex-start;
    }
  }
`;