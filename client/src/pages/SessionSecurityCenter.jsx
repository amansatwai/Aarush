import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Fingerprint,
  Globe,
  Lock,
  LogOut,
  RefreshCw,
  ScanLine,
  Shield,
  Smartphone,
  Trash2,
  Unlock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useSessionSecurity from '../hooks/useSessionSecurity';
import {
  detectConcurrentSessionAbuse,
  detectSessionHijacking,
  detectTokenReuse,
  generateSessionSecurityEvent,
  getSessionSecurityEvents,
} from '../utils/sessionSecurityEngine';
import {
  compareFingerprints,
  generateNewFingerprint,
} from '../utils/sessionFingerprintEngine';

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

function ActionRow({
  icon,
  title,
  description,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className={
        danger
          ? 'session-action-row is-danger'
          : 'session-action-row'
      }
      onClick={onClick}
      disabled={disabled}
    >
      <div className="session-action-icon">
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

export default function SessionSecurityCenter() {
  const navigate = useNavigate();

  const {
    status,
    verified,
    trusted,
    suspicious,
    fingerprint,
    loading,
    error,
    verifySession,
    refreshSession,
    revokeSession,
    revokeOtherSessions,
  } = useSessionSecurity();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');
  const [events, setEvents] = useState([]);

  const runAction = async (
    action,
    message
  ) => {
    try {
      setBusy(true);
      setActionError('');
      await action();
      setNotice(message);
    } catch (actionException) {
      setActionError(
        actionException?.message ||
          'Unable to complete session action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const runVerification = async () => {
    await runAction(async () => {
      await verifySession();
      await detectSessionHijacking();
      await detectTokenReuse();
      await detectConcurrentSessionAbuse();

      const latest =
        await getSessionSecurityEvents({
          page: 0,
          pageSize: 12,
        });

      setEvents(latest);
    }, 'Session verification completed.');
  };

  const handleNewFingerprint = () => {
    generateNewFingerprint();
    setNotice('New trusted fingerprint generated.');
  };

  const similarity =
    fingerprint && typeof fingerprint === 'object'
      ? compareFingerprints(
          fingerprint,
          fingerprint
        ).similarity
      : null;

  if (loading) {
    return (
      <div className="social-page session-security-page">
        <TopBar />

        <main className="session-security-content">
          <div className="session-loading-header" />
          <div className="session-loading-card" />
          <div className="session-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page session-security-page">
      <TopBar />

      <main className="session-security-content">
        <header className="session-security-header">
          <button
            type="button"
            className="session-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="session-eyebrow">
              Zero-trust protection
            </p>
            <h1>Session Security</h1>
          </div>

          <button
            type="button"
            className="session-icon-button"
            onClick={runVerification}
            disabled={busy}
            aria-label="Run security verification"
          >
            <RefreshCw
              size={18}
              className={
                busy ? 'session-spin' : undefined
              }
            />
          </button>
        </header>

        {error || actionError ? (
          <div className="session-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="session-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="session-status-card">
          <div
            className={
              suspicious
                ? 'session-status-icon is-danger'
                : 'session-status-icon'
            }
          >
            {verified ? (
              <Check size={29} />
            ) : suspicious ? (
              <AlertTriangle size={29} />
            ) : (
              <Shield size={29} />
            )}
          </div>

          <div className="session-status-copy">
            <p>Current session</p>
            <h2>
              {suspicious
                ? 'Suspicious'
                : verified
                  ? 'Verified session'
                  : trusted
                    ? 'Trusted session'
                    : 'Untrusted session'}
            </h2>
            <span>
              {status || 'Verification pending'}
            </span>
          </div>

          <button
            type="button"
            className="session-primary-button"
            onClick={runVerification}
            disabled={busy}
          >
            <ScanLine size={15} />
            Verify
          </button>
        </section>

        <section className="session-section">
          <div className="session-section-heading">
            <Fingerprint size={17} />
            <div>
              <h2>Session fingerprint</h2>
              <p>
                Browser-safe signals used to detect session changes.
              </p>
            </div>
          </div>

          <div className="session-card">
            {fingerprint ? (
              <>
                <div className="session-fingerprint-grid">
                  <div>
                    <span>Browser</span>
                    <strong>
                      {fingerprint.browser}
                    </strong>
                  </div>

                  <div>
                    <span>Operating system</span>
                    <strong>
                      {fingerprint.operating_system}
                    </strong>
                  </div>

                  <div>
                    <span>Timezone</span>
                    <strong>
                      {fingerprint.timezone}
                    </strong>
                  </div>

                  <div>
                    <span>Language</span>
                    <strong>
                      {fingerprint.language}
                    </strong>
                  </div>

                  <div>
                    <span>Resolution</span>
                    <strong>
                      {fingerprint.screen_resolution}
                    </strong>
                  </div>

                  <div>
                    <span>Platform</span>
                    <strong>
                      {fingerprint.platform}
                    </strong>
                  </div>
                </div>

                <div className="session-similarity">
                  <span>Fingerprint consistency</span>
                  <strong>
                    {similarity ?? '—'}%
                  </strong>
                </div>
              </>
            ) : (
              <div className="session-empty">
                <Fingerprint size={24} />
                <span>No fingerprint available.</span>
              </div>
            )}

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Generate new fingerprint"
              description="Replace the locally trusted browser fingerprint."
              onClick={handleNewFingerprint}
              disabled={busy}
            />
          </div>
        </section>

        <section className="session-section">
          <div className="session-section-heading">
            <Smartphone size={17} />
            <div>
              <h2>Session integrity</h2>
              <p>
                Controls prepared for token and session anomaly detection.
              </p>
            </div>
          </div>

          <div className="session-card">
            <ActionRow
              icon={<Check size={18} />}
              title="Run security verification"
              description="Check fingerprint, token, and concurrent-session indicators."
              onClick={runVerification}
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Refresh secure session"
              description="Refresh the current Supabase session token."
              onClick={() =>
                runAction(
                  refreshSession,
                  'Secure session refreshed.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Globe size={18} />}
              title="View login history"
              description="Review recent session security events."
              onClick={async () => {
                const result =
                  await getSessionSecurityEvents({
                    page: 0,
                    pageSize: 30,
                  });

                setEvents(result);
              }}
              disabled={busy}
            />
          </div>
        </section>

        <section className="session-section">
          <div className="session-section-heading">
            <Clock3 size={17} />
            <div>
              <h2>Recent session events</h2>
              <p>
                Suspicious and verification activity.
              </p>
            </div>
          </div>

          <div className="session-card">
            {events.length === 0 ? (
              <div className="session-empty">
                <Check size={23} />
                <span>
                  Run verification to load recent events.
                </span>
              </div>
            ) : (
              events.slice(0, 10).map((event) => (
                <article
                  className="session-event-row"
                  key={event.id}
                >
                  <div
                    className={
                      event.severity === 'critical'
                        ? 'session-event-icon critical'
                        : event.severity === 'warning'
                          ? 'session-event-icon warning'
                          : 'session-event-icon'
                    }
                  >
                    {event.severity ===
                    'critical' ? (
                      <AlertTriangle size={17} />
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
                        'Session security activity recorded.'}
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

        <section className="session-section">
          <div className="session-section-heading">
            <Lock size={17} />
            <div>
              <h2>Emergency actions</h2>
              <p>
                Revoke access if you suspect session hijacking.
              </p>
            </div>
          </div>

          <div className="session-card">
            <ActionRow
              icon={<LogOut size={18} />}
              title="Revoke other sessions"
              description="Sign out every other active session."
              onClick={() => {
                if (
                  window.confirm(
                    'Revoke all other active sessions?'
                  )
                ) {
                  runAction(
                    revokeOtherSessions,
                    'Other sessions revoked.'
                  );
                }
              }}
              danger
              disabled={busy}
            />

            <ActionRow
              icon={<Trash2 size={18} />}
              title="Revoke current session"
              description="Remove this session from the secure session registry."
              onClick={() => {
                if (
                  window.confirm(
                    'Revoke the current session?'
                  )
                ) {
                  runAction(
                    revokeSession,
                    'Current session revoked.'
                  );
                }
              }}
              danger
              disabled={busy}
            />

            <ActionRow
              icon={<Unlock size={18} />}
              title="Sensitive action verification"
              description="Required before account and security changes."
              onClick={runVerification}
              disabled={busy}
            />
          </div>
        </section>

        <p className="session-footer">
          Session fingerprints use browser-safe signals only.
          Raw access tokens are never displayed or stored in
          React state.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .session-security-page {
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

  .session-security-content {
    width: min(100%, 820px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .session-security-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .session-security-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .session-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .session-icon-button {
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

  .session-icon-button:last-child {
    justify-self: end;
  }

  .session-icon-button:disabled,
  .session-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .session-error,
  .session-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .session-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .session-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .session-status-card,
  .session-card {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .session-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .session-status-icon {
    width: 3.3rem;
    height: 3.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 1rem;
    color: #fff;
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
  }

  .session-status-icon.is-danger {
    background: linear-gradient(
      135deg,
      #ff5b84,
      #ff9b7c
    );
  }

  .session-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .session-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .session-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .session-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .session-primary-button {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    min-height: 2.35rem;
    padding: 0.55rem 0.75rem;
    border: 0;
    border-radius: 999px;
    color: #fff;
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
    font-size: 0.7rem;
    font-weight: 850;
    cursor: pointer;
  }

  .session-section {
    margin-top: 1.3rem;
  }

  .session-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .session-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .session-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .session-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .session-fingerprint-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.55rem;
    padding: 0.9rem;
  }

  .session-fingerprint-grid div {
    display: grid;
    gap: 0.2rem;
    min-width: 0;
    padding: 0.65rem;
    border-radius: 0.75rem;
    background: rgba(255,255,255,0.045);
  }

  .session-fingerprint-grid span {
    color: #75829e;
    font-size: 0.64rem;
  }

  .session-fingerprint-grid strong {
    overflow: hidden;
    color: #eaf0ff;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.7rem;
  }

  .session-similarity {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .session-similarity span {
    color: #8491ad;
    font-size: 0.7rem;
  }

  .session-similarity strong {
    color: #55e6a5;
    font-size: 0.8rem;
  }

  .session-action-row,
  .session-event-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .session-action-row + .session-action-row,
  .session-event-row + .session-event-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .session-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .session-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .session-action-icon,
  .session-event-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .session-event-icon.warning {
    color: #ffd166;
    background: rgba(255,209,102,0.12);
  }

  .session-event-icon.critical {
    color: #ff9bb4;
    background: rgba(255,91,132,0.12);
  }

  .session-action-row > span,
  .session-event-row > div:last-child {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .session-action-row strong,
  .session-event-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .session-action-row small,
  .session-event-row span {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .session-event-row small {
    color: #63708b;
    font-size: 0.63rem;
  }

  .session-action-row > svg {
    color: #7483a1;
  }

  .session-action-row.is-danger
    .session-action-icon {
    color: #ff9bb4;
    background: rgba(255,91,132,0.1);
  }

  .session-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .session-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .session-loading-header,
  .session-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: session-skeleton 1.4s infinite;
  }

  .session-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .session-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  .session-spin {
    animation: session-spin 0.9s linear infinite;
  }

  @keyframes session-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes session-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 560px) {
    .session-security-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .session-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .session-primary-button {
      margin-left: auto;
    }

    .session-fingerprint-grid {
      grid-template-columns: 1fr;
    }
  }
`;