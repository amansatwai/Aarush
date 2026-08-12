import { useState } from 'react';
import {
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useEnterpriseAnalytics from '../hooks/useEnterpriseAnalytics';
import {
  exportAnalyticsReport,
} from '../utils/enterpriseAnalyticsEngine';
import {
  generateAuditReport,
  runComplianceCheck,
} from '../utils/complianceEngine';

function isGuestMode() {
  if (typeof window === 'undefined') return false;

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

function ActionRow({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className="analytics-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="analytics-action-icon">
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

export default function EnterpriseAnalyticsCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    status,
    operational,
    usage,
    compliance,
    executive,
    loading,
    error,
    refresh,
  } = useEnterpriseAnalytics();

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
          'Unable to complete analytics action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const exportReport = () => {
    if (guest) {
      setActionError(
        'Guests can view demo analytics only.'
      );
      return;
    }

    runAction(
      exportAnalyticsReport,
      'Analytics report exported.'
    );
  };

  const auditReport = () => {
    if (guest) {
      setActionError(
        'Guests cannot generate audit reports.'
      );
      return;
    }

    runAction(
      generateAuditReport,
      'Audit report generated.'
    );
  };

  if (loading) {
    return (
      <div className="social-page analytics-page">
        <TopBar />

        <main className="analytics-content">
          <div className="analytics-loading-header" />
          <div className="analytics-loading-card" />
          <div className="analytics-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page analytics-page">
      <TopBar />

      <main className="analytics-content">
        <header className="analytics-header">
          <button
            type="button"
            className="analytics-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="analytics-eyebrow">
              Governance and observability
            </p>
            <h1>Enterprise Analytics</h1>
          </div>

          <button
            type="button"
            className="analytics-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh analytics"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="analytics-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="analytics-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="analytics-status-card">
          <div className="analytics-status-icon">
            <BarChart3 size={27} />
          </div>

          <div className="analytics-status-copy">
            <p>Enterprise overview</p>
            <h2>
              {status?.status || 'Operational'}
            </h2>
            <span>
              {status?.events_analyzed || 0} events analyzed
              {' · '}
              Compliance {compliance?.score || 0}%
            </span>
          </div>

          <button
            type="button"
            className="analytics-primary-button"
            onClick={refresh}
            disabled={busy}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </section>

        <section className="analytics-metric-grid">
          <article className="analytics-metric">
            <Users size={18} />
            <span>Active users</span>
            <strong>
              {operational?.active_users || 0}
            </strong>
          </article>

          <article className="analytics-metric">
            <BarChart3 size={18} />
            <span>API requests</span>
            <strong>
              {operational?.api_requests || 0}
            </strong>
          </article>

          <article className="analytics-metric">
            <Shield size={18} />
            <span>Security events</span>
            <strong>
              {operational?.security_events || 0}
            </strong>
          </article>

          <article className="analytics-metric">
            <FileCheck size={18} />
            <span>Compliance</span>
            <strong>
              {compliance?.score || 0}%
            </strong>
          </article>
        </section>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <BarChart3 size={17} />
            <div>
              <h2>Operational dashboard</h2>
              <p>
                Workspaces, APIs, integrations, storage, and platform activity.
              </p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-grid">
              {[
                ['Organizations', operational?.active_organizations || 0],
                ['Workspaces', operational?.active_workspaces || 0],
                ['Integrations', operational?.integrations || 0],
                ['Webhooks', operational?.webhook_deliveries || 0],
                ['Storage', operational?.storage_usage || 0],
                ['Bandwidth', operational?.bandwidth_usage || 0],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Usage analytics</h2>
              <p>
                Activity across login, backup, sync, media, creator, and business systems.
              </p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-grid">
              {[
                ['Login activity', usage?.login_activity || 0],
                ['Backup activity', usage?.backup_activity || 0],
                ['Sync activity', usage?.sync_activity || 0],
                ['Media usage', usage?.media_usage || 0],
                ['Creator activity', usage?.creator_activity || 0],
                ['Business activity', usage?.business_activity || 0],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <Shield size={17} />
            <div>
              <h2>Compliance status</h2>
              <p>
                GDPR, SOC 2, ISO, retention, access, and governance preparation.
              </p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="compliance-score">
              <strong>{compliance?.score || 0}%</strong>
              <span>
                {compliance?.status || 'Review'}
              </span>
            </div>

            <ActionRow
              icon={<FileCheck size={18} />}
              title="Run compliance check"
              description="Review governance and policy readiness."
              onClick={() =>
                runAction(
                  runComplianceCheck,
                  'Compliance check completed.'
                )
              }
              disabled={busy || guest}
            />

            <ActionRow
              icon={<FileCheck size={18} />}
              title="Generate audit report"
              description="Export authentication, access, security, and admin events."
              onClick={auditReport}
              disabled={busy || guest}
            />

            <ActionRow
              icon={<Shield size={18} />}
              title="View audit logs"
              description="Open enterprise security and identity events."
              onClick={() =>
                navigate('/security-center')
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <BarChart3 size={17} />
            <div>
              <h2>Executive insights</h2>
              <p>
                High-level operational, security, compliance, and growth summaries.
              </p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="executive-insight">
              <strong>Operational summary</strong>
              <span>
                {executive?.operational_summary}
              </span>
            </div>

            <div className="executive-insight">
              <strong>Security summary</strong>
              <span>
                {executive?.security_summary}
              </span>
            </div>

            <div className="executive-insight">
              <strong>Compliance summary</strong>
              <span>
                {executive?.compliance_summary}
              </span>
            </div>

            <ActionRow
              icon={<DownloadIcon />}
              title="Export analytics report"
              description="Download operational and executive analytics."
              onClick={exportReport}
              disabled={busy || guest}
            />
          </div>
        </section>

        <p className="analytics-footer">
          Enterprise analytics is prepared for audit
          intelligence, observability, governance controls,
          retention policies, and future compliance
          automation.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

function DownloadIcon() {
  return <FileCheck size={18} />;
}

const styles = `
  .analytics-page {
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

  .analytics-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .analytics-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .analytics-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .analytics-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .analytics-icon-button {
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

  .analytics-icon-button:last-child {
    justify-self: end;
  }

  .analytics-error,
  .analytics-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .analytics-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .analytics-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .analytics-status-card,
  .analytics-card,
  .analytics-metric,
  .analytics-grid > div {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .analytics-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .analytics-status-icon {
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

  .analytics-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .analytics-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .analytics-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .analytics-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .analytics-primary-button {
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

  .analytics-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .analytics-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .analytics-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .analytics-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .analytics-metric strong {
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .analytics-section {
    margin-top: 1.3rem;
  }

  .analytics-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .analytics-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .analytics-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .analytics-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
    padding: 0.9rem;
  }

  .analytics-grid > div {
    display: grid;
    gap: 0.25rem;
    padding: 0.7rem;
    border-radius: 0.85rem;
  }

  .analytics-grid span {
    color: #8491ad;
    font-size: 0.63rem;
  }

  .analytics-grid strong {
    color: #edf2ff;
    font-size: 0.72rem;
  }

  .analytics-action-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
    border: 0;
    border-top: 1px solid rgba(255,255,255,0.07);
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .analytics-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .analytics-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .analytics-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .analytics-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .analytics-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .compliance-score {
    display: grid;
    gap: 0.25rem;
    padding: 1rem;
  }

  .compliance-score strong {
    color: #55e6a5;
    font-size: 1.4rem;
  }

  .compliance-score span {
    color: #8491ad;
    font-size: 0.7rem;
  }

  .executive-insight {
    display: grid;
    gap: 0.3rem;
    padding: 0.9rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .executive-insight strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .executive-insight span {
    color: #8491ad;
    font-size: 0.7rem;
    line-height: 1.45;
  }

  .analytics-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .analytics-loading-header,
  .analytics-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: analytics-skeleton 1.4s infinite;
  }

  .analytics-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .analytics-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes analytics-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 720px) {
    .analytics-metric-grid,
    .analytics-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .analytics-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .analytics-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .analytics-primary-button {
      margin-left: auto;
    }
  }
`;