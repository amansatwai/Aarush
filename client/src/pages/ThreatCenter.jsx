import { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Fingerprint,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  ScanLine,
  Shield,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useThreatDetection from '../hooks/useThreatDetection';
import {
  dismissAlert,
  acknowledgeAlert,
  getMonitoringTimeline,
} from '../utils/securityMonitoringEngine';
import {
  detectAccountTakeoverRisk,
} from '../utils/threatDetectionEngine';

function formatDate(value) {
  if (!value) return 'Unknown';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function severityClass(severity) {
  return String(severity || 'Low')
    .toLowerCase()
    .replace(/\s/g, '-');
}

function ThreatMetric({
  label,
  value,
  icon,
}) {
  return (
    <article className="threat-metric">
      <div className="threat-metric-icon">
        {icon}
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
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
          ? 'threat-action-row is-danger'
          : 'threat-action-row'
      }
      onClick={onClick}
      disabled={disabled}
    >
      <div className="threat-action-icon">
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

export default function ThreatCenter() {
  const navigate = useNavigate();
  const {
    threat,
    alerts,
    loading,
    error,
    refresh,
  } = useThreatDetection();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');
  const [timeline, setTimeline] = useState([]);

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
          'Unable to complete security action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const runScan = () =>
    runAction(
      detectAccountTakeoverRisk,
      'Threat scan completed.'
    );

  const loadTimeline = async () => {
    try {
      setBusy(true);
      const events =
        await getMonitoringTimeline({
          page: 0,
          pageSize: 30,
        });
      setTimeline(events);
      setNotice('Security timeline loaded.');
    } catch (timelineError) {
      setActionError(
        timelineError?.message ||
          'Unable to load security timeline.'
      );
    } finally {
      setBusy(false);
    }
  };

  const exportReport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      threat,
      alerts,
      timeline,
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      {
        type: 'application/json',
      }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'aarush-security-report.json';
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice('Security report exported.');
  };

  if (loading) {
    return (
      <div className="social-page threat-center-page">
        <TopBar />

        <main className="threat-content">
          <div className="threat-loading-header" />
          <div className="threat-loading-card" />
          <div className="threat-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  const score = Number(threat?.score || 0);
  const severity =
    threat?.severity || 'Low';

  return (
    <div className="social-page threat-center-page">
      <TopBar />

      <main className="threat-content">
        <header className="threat-header">
          <button
            type="button"
            className="threat-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="threat-eyebrow">
              Security intelligence
            </p>
            <h1>Threat Center</h1>
          </div>

          <button
            type="button"
            className="threat-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh intelligence"
          >
            <RefreshCw
              size={18}
              className={
                busy ? 'threat-spin' : undefined
              }
            />
          </button>
        </header>

        {error || actionError ? (
          <div className="threat-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="threat-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice('')}
            >
              <X size={15} />
            </button>
          </div>
        ) : null}

        <section className="threat-score-card">
          <div className="threat-score-ring">
            <div
              style={{
                '--threat-score': `${score * 3.6}deg`,
              }}
            >
              <strong>{score}</strong>
              <span>/100</span>
            </div>
          </div>

          <div className="threat-score-copy">
            <p>Threat score</p>
            <h2 className={`threat-${severityClass(severity)}`}>
              {severity}
            </h2>
            <span>
              {score >= 45
                ? 'Review active security intelligence.'
                : 'No high-confidence threat is active.'}
            </span>
          </div>

          <button
            type="button"
            className="threat-primary-button"
            onClick={runScan}
            disabled={busy}
          >
            <ScanLine size={15} />
            Scan
          </button>
        </section>

        <section className="threat-metric-grid">
          <ThreatMetric
            icon={<AlertTriangle size={18} />}
            label="Active threats"
            value={threat?.threats?.length || 0}
          />

          <ThreatMetric
            icon={<Bell size={18} />}
            label="Alerts"
            value={alerts.length}
          />

          <ThreatMetric
            icon={<Shield size={18} />}
            label="Severity"
            value={severity}
          />

          <ThreatMetric
            icon={<Clock3 size={18} />}
            label="Monitoring"
            value="Live"
          />
        </section>

        <section className="threat-section">
          <div className="threat-section-heading">
            <Bell size={17} />
            <div>
              <h2>Active alerts</h2>
              <p>
                Threats requiring review or acknowledgement.
              </p>
            </div>
          </div>

          <div className="threat-card">
            {alerts.length === 0 ? (
              <div className="threat-empty">
                <Check size={24} />
                <span>No active security alerts.</span>
              </div>
            ) : (
              alerts.map((alert) => (
                <article
                  className="threat-alert-row"
                  key={alert.id}
                >
                  <div
                    className={`threat-alert-icon ${severityClass(
                      alert.severity
                    )}`}
                  >
                    <AlertTriangle size={17} />
                  </div>

                  <div>
                    <strong>
                      {alert.title ||
                        alert.alert_type}
                    </strong>
                    <span>
                      {alert.description ||
                        'Security alert generated.'}
                    </span>
                    <small>
                      {formatDate(alert.created_at)}
                    </small>
                  </div>

                  <div className="threat-alert-actions">
                    <button
                      type="button"
                      onClick={() =>
                        acknowledgeAlert(alert.id)
                          .then(refresh)
                      }
                    >
                      <Check size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        dismissAlert(alert.id)
                          .then(refresh)
                      }
                    >
                      <X size={15} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="threat-section">
          <div className="threat-section-heading">
            <Fingerprint size={17} />
            <div>
              <h2>Monitoring coverage</h2>
              <p>
                Signals continuously evaluated by Aarush.
              </p>
            </div>
          </div>

          <div className="threat-coverage-grid">
            <div>
              <Smartphone size={18} />
              <span>Device monitoring</span>
              <small>Active</small>
            </div>

            <div>
              <Lock size={18} />
              <span>Session monitoring</span>
              <small>Active</small>
            </div>

            <div>
              <KeyRound size={18} />
              <span>Token anomalies</span>
              <small>Prepared</small>
            </div>

            <div>
              <Globe size={18} />
              <span>Location anomalies</span>
              <small>Prepared</small>
            </div>
          </div>
        </section>

        <section className="threat-section">
          <div className="threat-section-heading">
            <Shield size={17} />
            <div>
              <h2>Automated responses</h2>
              <p>
                Response architecture for confirmed threats.
              </p>
            </div>
          </div>

          <div className="threat-card">
            <ActionRow
              icon={<Lock size={18} />}
              title="Lock account"
              description="Prepare a temporary account lock response."
              onClick={() =>
                setNotice(
                  'Account lock workflow is ready for policy integration.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<LogOut size={18} />}
              title="Logout everywhere"
              description="Revoke sessions through Session Security."
              onClick={() =>
                navigate('/session-management')
              }
              danger
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Run security scan"
              description="Analyze authentication, device, and session signals."
              onClick={runScan}
              disabled={busy}
            />

            <ActionRow
              icon={<Trash2 size={18} />}
              title="Export security report"
              description="Download a local report of current intelligence."
              onClick={exportReport}
              disabled={busy}
            />
          </div>
        </section>

        <section className="threat-section">
          <div className="threat-section-heading">
            <Clock3 size={17} />
            <div>
              <h2>Security timeline</h2>
              <p>
                Recent monitoring events from your account.
              </p>
            </div>
          </div>

          <div className="threat-card">
            {timeline.length === 0 ? (
              <ActionRow
                icon={<Clock3 size={18} />}
                title="View threat history"
                description="Load recent security monitoring events."
                onClick={loadTimeline}
                disabled={busy}
              />
            ) : (
              timeline.slice(0, 10).map((event) => (
                <article
                  className="threat-timeline-row"
                  key={event.id}
                >
                  <span />
                  <div>
                    <strong>
                      {event.title ||
                        event.event_type}
                    </strong>
                    <small>
                      {event.description ||
                        'Security activity recorded.'}
                    </small>
                    <time>
                      {formatDate(event.created_at)}
                    </time>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <p className="threat-footer">
          Threat intelligence provides detection signals,
          not a guarantee of account safety. Confirmed
          responses should be connected to server-side
          security policies.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .threat-center-page {
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

  .threat-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .threat-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .threat-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .threat-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .threat-icon-button {
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

  .threat-icon-button:last-child {
    justify-self: end;
  }

  .threat-icon-button:disabled,
  .threat-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .threat-error,
  .threat-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .threat-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .threat-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .threat-notice button {
    margin-left: auto;
    border: 0;
    color: inherit;
    background: transparent;
    cursor: pointer;
  }

  .threat-score-card,
  .threat-card,
  .threat-metric,
  .threat-coverage-grid > div {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .threat-score-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .threat-score-ring {
    width: 5.3rem;
    height: 5.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 50%;
    background: conic-gradient(
      #ff6f91 var(--threat-score),
      rgba(255,255,255,0.1) var(--threat-score)
    );
  }

  .threat-score-ring > div {
    width: 4.3rem;
    height: 4.3rem;
    display: grid;
    place-items: center;
    align-content: center;
    border-radius: 50%;
    background: #111626;
  }

  .threat-score-ring strong {
    font-size: 1.25rem;
  }

  .threat-score-ring span {
    color: #8491ad;
    font-size: 0.6rem;
  }

  .threat-score-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .threat-score-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .threat-score-copy h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  .threat-score-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .threat-critical,
  .threat-emergency {
    color: #ff6f91;
  }

  .threat-high {
    color: #ffad66;
  }

  .threat-medium {
    color: #ffd166;
  }

  .threat-low {
    color: #55e6a5;
  }

  .threat-primary-button {
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

  .threat-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .threat-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
  }

  .threat-metric-icon {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    border-radius: 0.7rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .threat-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .threat-metric strong {
    font-size: 1rem;
  }

  .threat-section {
    margin-top: 1.3rem;
  }

  .threat-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .threat-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .threat-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .threat-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .threat-alert-row,
  .threat-action-row,
  .threat-timeline-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .threat-alert-row + .threat-alert-row,
  .threat-action-row + .threat-action-row,
  .threat-timeline-row + .threat-timeline-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .threat-alert-icon,
  .threat-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .threat-alert-icon.high,
  .threat-alert-icon.critical,
  .threat-alert-icon.emergency {
    color: #ff9bb4;
    background: rgba(255,91,132,0.12);
  }

  .threat-alert-icon.medium {
    color: #ffd166;
    background: rgba(255,209,102,0.12);
  }

  .threat-alert-row > div:nth-child(2),
  .threat-action-row > span,
  .threat-timeline-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .threat-alert-row strong,
  .threat-action-row strong,
  .threat-timeline-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .threat-alert-row span,
  .threat-action-row small,
  .threat-timeline-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .threat-alert-row small,
  .threat-timeline-row time {
    color: #63708b;
    font-size: 0.63rem;
  }

  .threat-alert-actions {
    display: flex;
    gap: 0.25rem;
  }

  .threat-alert-actions button {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.65rem;
    color: #aeb9d0;
    background: rgba(255,255,255,0.05);
    cursor: pointer;
  }

  .threat-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .threat-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .threat-action-row > svg {
    color: #7483a1;
  }

  .threat-action-row.is-danger
    .threat-action-icon {
    color: #ff9bb4;
    background: rgba(255,91,132,0.1);
  }

  .threat-coverage-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
  }

  .threat-coverage-grid > div {
    display: grid;
    gap: 0.3rem;
    padding: 0.75rem;
    border-radius: 0.9rem;
    color: #b8a9ff;
  }

  .threat-coverage-grid span {
    color: #eaf0ff;
    font-size: 0.7rem;
  }

  .threat-coverage-grid small {
    color: #55e6a5;
    font-size: 0.62rem;
  }

  .threat-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .threat-timeline-row {
    align-items: flex-start;
  }

  .threat-timeline-row > span {
    width: 0.6rem;
    height: 0.6rem;
    margin-top: 0.35rem;
    border-radius: 50%;
    background: #7c5cff;
    box-shadow: 0 0 12px rgba(124,92,255,0.7);
  }

  .threat-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .threat-loading-header,
  .threat-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: threat-skeleton 1.4s infinite;
  }

  .threat-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .threat-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  .threat-spin {
    animation: threat-spin 0.9s linear infinite;
  }

  @keyframes threat-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes threat-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .threat-metric-grid,
    .threat-coverage-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .threat-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .threat-score-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .threat-primary-button {
      margin-left: auto;
    }
  }
`;