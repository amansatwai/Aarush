import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Fingerprint,
  KeyRound,
  Lock,
  RefreshCw,
  Shield,
  Smartphone,
  Trash2,
  Unlock,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useZeroTrust from '../hooks/useZeroTrust';
import {
  authorizeSensitiveAction,
  getZeroTrustEvents,
} from '../utils/zeroTrustEngine';
import {
  emergencyAccountLock,
  emergencyAccountUnlock,
  exportRecoveryPackage,
  generateRecoveryCodes,
  getRecoveryDevices,
  removeRecoveryDevice,
  startAccountRecovery,
} from '../utils/recoveryEngine';

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
          ? 'zt-action-row is-danger'
          : 'zt-action-row'
      }
      onClick={onClick}
      disabled={disabled}
    >
      <div className="zt-action-icon">
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

export default function ZeroTrustCenter() {
  const navigate = useNavigate();
  const {
    trust,
    recoveryDevices,
    loading,
    error,
    verify,
    refresh,
  } = useZeroTrust();

  const [events, setEvents] = useState([]);
  const [codes, setCodes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const runAction = async (
    action,
    message
  ) => {
    try {
      setBusy(true);
      setActionError('');
      await action();
      setNotice(message);
      await refresh();
    } catch (actionException) {
      setActionError(
        actionException?.message ||
          'Unable to complete zero-trust action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateCodes = async () => {
    try {
      setBusy(true);
      setActionError('');

      const generated =
        await generateRecoveryCodes(10);

      setCodes(generated);
      setNotice(
        'Recovery codes generated. Save them securely.'
      );
    } catch (codeError) {
      setActionError(
        codeError?.message ||
          'Unable to generate recovery codes.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleExportPackage = async () => {
    try {
      setBusy(true);

      const packageData =
        await exportRecoveryPackage();

      const blob = new Blob(
        [JSON.stringify(packageData, null, 2)],
        {
          type: 'application/json',
        }
      );

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download =
        'aarush-recovery-package.json';
      anchor.click();

      URL.revokeObjectURL(url);
      setNotice('Recovery package exported.');
    } catch (exportError) {
      setActionError(
        exportError?.message ||
          'Unable to export recovery package.'
      );
    } finally {
      setBusy(false);
    }
  };

  const loadEvents = async () => {
    try {
      setBusy(true);

      const result = await getZeroTrustEvents({
        page: 0,
        pageSize: 30,
      });

      setEvents(result);
      setNotice('Zero-trust events loaded.');
    } catch (eventError) {
      setActionError(
        eventError?.message ||
          'Unable to load zero-trust events.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="social-page zero-trust-page">
        <TopBar />

        <main className="zt-content">
          <div className="zt-loading-header" />
          <div className="zt-loading-card" />
          <div className="zt-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  const trustLevel =
    trust?.trustLevel || 'Unknown';
  const confidence =
    trust?.identityConfidence || 0;

  return (
    <div className="social-page zero-trust-page">
      <TopBar />

      <main className="zt-content">
        <header className="zt-header">
          <button
            type="button"
            className="zt-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="zt-eyebrow">
              Identity protection
            </p>
            <h1>Zero-Trust Center</h1>
          </div>

          <button
            type="button"
            className="zt-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh trust status"
          >
            <RefreshCw
              size={18}
              className={
                busy ? 'zt-spin' : undefined
              }
            />
          </button>
        </header>

        {error || actionError ? (
          <div className="zt-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="zt-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="zt-status-card">
          <div className="zt-status-icon">
            {trust?.suspicious ? (
              <AlertTriangle size={28} />
            ) : trustLevel === 'Fully Trusted' ? (
              <Check size={28} />
            ) : (
              <Shield size={28} />
            )}
          </div>

          <div className="zt-status-copy">
            <p>Trust status</p>
            <h2>{trustLevel}</h2>
            <span>
              Identity confidence {confidence}%
              {trust?.suspicious
                ? ' · Risk review required'
                : ''}
            </span>
          </div>

          <button
            type="button"
            className="zt-primary-button"
            onClick={() =>
              runAction(
                verify,
                'Identity, device, and session verified.'
              )
            }
            disabled={busy}
          >
            <UserCheck size={15} />
            Verify
          </button>
        </section>

        <section className="zt-section">
          <div className="zt-section-heading">
            <Fingerprint size={17} />
            <div>
              <h2>Identity verification</h2>
              <p>
                Every sensitive action requires verified context.
              </p>
            </div>
          </div>

          <div className="zt-card">
            <ActionRow
              icon={<UserCheck size={18} />}
              title="Verify identity"
              description={
                trust?.identityVerified
                  ? 'Account identity verified.'
                  : 'Verify your authenticated account.'
              }
              onClick={() =>
                runAction(
                  verify,
                  'Identity verification completed.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Smartphone size={18} />}
              title="Verify device"
              description={
                trust?.deviceVerified
                  ? 'Current device verified.'
                  : 'Current device is not yet verified.'
              }
              onClick={() =>
                runAction(
                  verify,
                  'Device verification completed.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Lock size={18} />}
              title="Verify session"
              description={
                trust?.sessionVerified
                  ? 'Current session verified.'
                  : 'Run session integrity checks.'
              }
              onClick={() =>
                runAction(
                  verify,
                  'Session verification completed.'
                )
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="zt-section">
          <div className="zt-section-heading">
            <KeyRound size={17} />
            <div>
              <h2>Recovery codes</h2>
              <p>
                One-time codes for account recovery.
              </p>
            </div>
          </div>

          <div className="zt-card">
            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Generate recovery codes"
              description="Create a new set of one-time codes."
              onClick={handleGenerateCodes}
              disabled={busy}
            />

            <ActionRow
              icon={<Download size={18} />}
              title="Export recovery package"
              description="Download your recovery-device package."
              onClick={handleExportPackage}
              disabled={busy}
            />

            {codes.length ? (
              <div className="zt-code-box">
                <strong>
                  Save these codes securely
                </strong>

                <div>
                  {codes.map((code) => (
                    <code key={code}>{code}</code>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="zt-section">
          <div className="zt-section-heading">
            <Smartphone size={17} />
            <div>
              <h2>Recovery devices</h2>
              <p>
                Devices that can help verify account recovery.
              </p>
            </div>
          </div>

          <div className="zt-card">
            {recoveryDevices.length === 0 ? (
              <div className="zt-empty">
                <Smartphone size={23} />
                <span>No recovery devices registered.</span>
              </div>
            ) : (
              recoveryDevices.map((device) => (
                <article
                  className="zt-device-row"
                  key={device.id}
                >
                  <div className="zt-action-icon">
                    <Smartphone size={18} />
                  </div>

                  <div>
                    <strong>
                      {device.name ||
                        device.device_type}
                    </strong>
                    <span>
                      {device.trust_level || 'Medium'} trust
                      {' · '}
                      Last verified{' '}
                      {formatDate(
                        device.last_verified_at
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="zt-remove-button"
                    onClick={() =>
                      runAction(
                        () =>
                          removeRecoveryDevice(
                            device.id
                          ),
                        'Recovery device removed.'
                      )
                    }
                    disabled={busy}
                    aria-label="Remove recovery device"
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="zt-section">
          <div className="zt-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Account recovery</h2>
              <p>
                Start a controlled recovery workflow.
              </p>
            </div>
          </div>

          <div className="zt-card">
            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Start account recovery"
              description="Begin recovery-only verification."
              onClick={() =>
                runAction(
                  startAccountRecovery,
                  'Account recovery started.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Shield size={18} />}
              title="Step-up authentication"
              description="Require additional verification for sensitive actions."
              onClick={() =>
                runAction(
                  () =>
                    authorizeSensitiveAction(
                      'zero_trust_settings'
                    ),
                  'Step-up verification evaluated.'
                )
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="zt-section">
          <div className="zt-section-heading">
            <Lock size={17} />
            <div>
              <h2>Emergency protection</h2>
              <p>
                Freeze or restore access during a suspected takeover.
              </p>
            </div>
          </div>

          <div className="zt-card">
            <ActionRow
              icon={<Lock size={18} />}
              title="Emergency lock account"
              description="Freeze account activity immediately."
              onClick={() => {
                if (
                  window.confirm(
                    'Emergency-lock this account?'
                  )
                ) {
                  runAction(
                    emergencyAccountLock,
                    'Account emergency lock enabled.'
                  );
                }
              }}
              danger
              disabled={busy}
            />

            <ActionRow
              icon={<Unlock size={18} />}
              title="Emergency unlock account"
              description="Restore account access after verification."
              onClick={() =>
                runAction(
                  emergencyAccountUnlock,
                  'Account emergency lock disabled.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Clock3 size={18} />}
              title="View zero-trust events"
              description="Review identity and recovery verification history."
              onClick={loadEvents}
              disabled={busy}
            />
          </div>
        </section>

        {events.length ? (
          <section className="zt-section">
            <div className="zt-section-heading">
              <Clock3 size={17} />
              <div>
                <h2>Zero-trust events</h2>
                <p>
                  Recent identity and authorization decisions.
                </p>
              </div>
            </div>

            <div className="zt-card">
              {events.map((event) => (
                <article
                  className="zt-event-row"
                  key={event.id}
                >
                  <div className="zt-event-dot" />

                  <div>
                    <strong>
                      {event.title ||
                        event.event_type}
                    </strong>
                    <span>
                      {event.description ||
                        'Zero-trust event recorded.'}
                    </span>
                    <small>
                      {formatDate(event.created_at)}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <p className="zt-footer">
          Zero-trust decisions are security signals, not
          authentication by themselves. Sensitive recovery
          actions must remain enforced server-side.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .zero-trust-page {
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

  .zt-content {
    width: min(100%, 820px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .zt-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .zt-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .zt-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .zt-icon-button {
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

  .zt-icon-button:last-child {
    justify-self: end;
  }

  .zt-icon-button:disabled,
  .zt-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .zt-error,
  .zt-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .zt-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .zt-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .zt-status-card,
  .zt-card {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .zt-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .zt-status-icon {
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

  .zt-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .zt-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .zt-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .zt-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .zt-primary-button {
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

  .zt-section {
    margin-top: 1.3rem;
  }

  .zt-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .zt-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .zt-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .zt-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .zt-action-row,
  .zt-device-row,
  .zt-event-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .zt-action-row + .zt-action-row,
  .zt-device-row + .zt-device-row,
  .zt-event-row + .zt-event-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .zt-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .zt-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .zt-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .zt-action-row > span,
  .zt-device-row > div:nth-child(2),
  .zt-event-row > div:last-child {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .zt-action-row strong,
  .zt-device-row strong,
  .zt-event-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .zt-action-row small,
  .zt-device-row span,
  .zt-event-row span {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .zt-device-row span,
  .zt-event-row small {
    color: #63708b;
    font-size: 0.63rem;
  }

  .zt-action-row > svg {
    color: #7483a1;
  }

  .zt-action-row.is-danger .zt-action-icon {
    color: #ff9bb4;
    background: rgba(255,91,132,0.1);
  }

  .zt-code-box {
    display: grid;
    gap: 0.7rem;
    padding: 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
    background: rgba(124,92,255,0.07);
  }

  .zt-code-box strong {
    color: #eaf0ff;
    font-size: 0.76rem;
  }

  .zt-code-box > div {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .zt-code-box code {
    padding: 0.45rem 0.55rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.5rem;
    color: #c9f9ff;
    background: rgba(0,0,0,0.2);
    font-size: 0.7rem;
    letter-spacing: 0.06em;
  }

  .zt-remove-button {
    width: 2.2rem;
    height: 2.2rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,91,132,0.2);
    border-radius: 0.7rem;
    color: #ffb6c8;
    background: rgba(255,91,132,0.08);
    cursor: pointer;
  }

  .zt-remove-button:disabled {
    opacity: 0.5;
    cursor: wait;
  }

  .zt-event-row {
    align-items: flex-start;
  }

  .zt-event-dot {
    width: 0.6rem;
    height: 0.6rem;
    margin-top: 0.35rem;
    border-radius: 50%;
    background: #7c5cff;
    box-shadow: 0 0 12px rgba(124,92,255,0.7);
  }

  .zt-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .zt-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .zt-loading-header,
  .zt-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: zt-skeleton 1.4s infinite;
  }

  .zt-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .zt-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  .zt-spin {
    animation: zt-spin 0.9s linear infinite;
  }

  @keyframes zt-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes zt-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 560px) {
    .zt-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .zt-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .zt-primary-button {
      margin-left: auto;
    }
  }
`;