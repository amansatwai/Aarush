import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe,
  RefreshCw,
  Server,
  Shield,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useGlobalScaling from '../hooks/useGlobalScaling';
import {
  rebalanceGlobalTraffic,
  triggerRegionalFailover,
  predictCapacityDemand,
} from '../utils/globalScalingEngine';
import {
  createAutomationWorkflow,
  executeWorkflow,
} from '../utils/enterpriseAutomationEngine';

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
      className="scaling-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="scaling-action-icon">
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

export default function GlobalScalingCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    scaling,
    regions,
    automation,
    automationAnalytics,
    loading,
    error,
    refresh,
  } = useGlobalScaling();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');
  const [forecast, setForecast] =
    useState(null);

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
          'Unable to complete scaling action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const analyzeCapacity = async () => {
    try {
      setBusy(true);
      setForecast(
        await predictCapacityDemand()
      );
      setNotice('Capacity forecast generated.');
    } catch (forecastError) {
      setActionError(
        forecastError?.message ||
          'Unable to analyze capacity.'
      );
    } finally {
      setBusy(false);
    }
  };

  const createWorkflow = () => {
    if (guest) {
      navigate('/login');
      return;
    }

    runAction(
      () =>
        createAutomationWorkflow({
          name: 'Infrastructure health workflow',
          trigger: 'infrastructure_event',
          conditions: {
            health: 'degraded',
          },
          actions: [
            'notify_admin',
            'scale_region',
          ],
        }),
      'Automation workflow created.'
    );
  };

  if (loading) {
    return (
      <div className="social-page scaling-page">
        <TopBar />

        <main className="scaling-content">
          <div className="scaling-loading-header" />
          <div className="scaling-loading-card" />
          <div className="scaling-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page scaling-page">
      <TopBar />

      <main className="scaling-content">
        <header className="scaling-header">
          <button
            type="button"
            className="scaling-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="scaling-eyebrow">
              Global infrastructure
            </p>
            <h1>Global Scaling Center</h1>
          </div>

          <button
            type="button"
            className="scaling-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh scaling"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="scaling-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="scaling-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="scaling-status-card">
          <div className="scaling-status-icon">
            <Globe size={27} />
          </div>

          <div className="scaling-status-copy">
            <p>Global infrastructure status</p>
            <h2>
              {scaling?.status || 'Operational'}
            </h2>
            <span>
              {regions.length} regions
              {' · '}
              {automation?.active || 0} active workflows
            </span>
          </div>

          <button
            type="button"
            className="scaling-primary-button"
            onClick={analyzeCapacity}
            disabled={busy}
          >
            <Activity size={15} />
            Analyze
          </button>
        </section>

        <section className="scaling-metric-grid">
          <article className="scaling-metric">
            <Globe size={18} />
            <span>Regions</span>
            <strong>{regions.length}</strong>
          </article>

          <article className="scaling-metric">
            <Server size={18} />
            <span>Healthy</span>
            <strong>
              {regions.filter(
                (region) =>
                  region.health === 'healthy'
              ).length}
            </strong>
          </article>

          <article className="scaling-metric">
            <Zap size={18} />
            <span>Workflows</span>
            <strong>
              {automation?.total || 0}
            </strong>
          </article>

          <article className="scaling-metric">
            <Shield size={18} />
            <span>Failures</span>
            <strong>
              {automationAnalytics?.failed || 0}
            </strong>
          </article>
        </section>

        <section className="scaling-section">
          <div className="scaling-section-heading">
            <Globe size={17} />
            <div>
              <h2>Regions</h2>
              <p>
                Health, capacity, latency, traffic, and failover readiness.
              </p>
            </div>
          </div>

          <div className="scaling-region-grid">
            {regions.map((region) => (
              <article
                className="scaling-region"
                key={region.id || region.name}
              >
                <strong>{region.name}</strong>
                <span>
                  {region.health || 'unknown'}
                  {' · '}
                  {region.latency || '—'}ms
                </span>
                <small>
                  {region.traffic_percentage || 0}% traffic
                </small>
              </article>
            ))}
          </div>
        </section>

        <section className="scaling-section">
          <div className="scaling-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Traffic management</h2>
              <p>
                Prepare regional, weighted, latency-based, and failover routing.
              </p>
            </div>
          </div>

          <div className="scaling-card">
            <ActionRow
              icon={<Activity size={18} />}
              title="Analyze capacity"
              description="Forecast users, requests, media, API traffic, and bandwidth."
              onClick={analyzeCapacity}
              disabled={busy}
            />

            <ActionRow
              icon={<Globe size={18} />}
              title="Rebalance global traffic"
              description="Apply latency-aware regional traffic distribution."
              onClick={() =>
                runAction(
                  () => rebalanceGlobalTraffic('latency'),
                  'Global traffic rebalanced.'
                )
              }
              disabled={busy || guest}
            />

            <ActionRow
              icon={<AlertTriangle size={18} />}
              title="Trigger regional failover"
              description="Move traffic away from a selected unhealthy region."
              onClick={() => {
                const region = regions.find(
                  (item) => item.health !== 'healthy'
                );

                if (!region) {
                  setNotice(
                    'No unhealthy region requires failover.'
                  );
                  return;
                }

                runAction(
                  () =>
                    triggerRegionalFailover(
                      region.id,
                      'manual'
                    ),
                  'Regional failover triggered.'
                );
              }}
              disabled={busy || guest}
            />
          </div>
        </section>

        {forecast ? (
          <section className="scaling-section">
            <div className="scaling-section-heading">
              <Activity size={17} />
              <div>
                <h2>Capacity forecast</h2>
                <p>
                  Predicted infrastructure demand.
                </p>
              </div>
            </div>

            <div className="scaling-forecast-card">
              <strong>{forecast.trend}</strong>
              <span>
                Average utilization{' '}
                {Math.round(
                  forecast.average_utilization || 0
                )}
                %
              </span>
              <small>
                Users, media, API, storage, bandwidth,
                streaming, and creator workload forecasting
                prepared.
              </small>
            </div>
          </section>
        ) : null}

        <section className="scaling-section">
          <div className="scaling-section-heading">
            <Zap size={17} />
            <div>
              <h2>Enterprise automation</h2>
              <p>
                Coordinate backups, sync, scale, alerts, keys, and compliance.
              </p>
            </div>
          </div>

          <div className="scaling-card">
            <ActionRow
              icon={<Zap size={18} />}
              title="Create automation"
              description="Create an infrastructure health workflow."
              onClick={createWorkflow}
              disabled={busy || guest}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Execute workflow"
              description={`${automationAnalytics?.executions || 0} workflow executions recorded.`}
              onClick={() =>
                setNotice(
                  'Select a workflow to execute it.'
                )
              }
              disabled={busy || guest}
            />

            <ActionRow
              icon={<Shield size={18} />}
              title="Disaster recovery"
              description="Prepare regional and global recovery orchestration."
              onClick={() =>
                navigate('/reliability-center')
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="scaling-section">
          <div className="scaling-section-heading">
            <Server size={17} />
            <div>
              <h2>Reliability monitoring</h2>
              <p>
                High availability, failover, traffic shaping, and capacity coordination.
              </p>
            </div>
          </div>

          <div className="scaling-feature-grid">
            {[
              'Regional uptime',
              'Automation success rate',
              'Workflow failures',
              'Failover events',
              'Capacity utilization',
              'API health',
              'Media health',
              'Enterprise operations',
            ].map((feature) => (
              <div
                className="scaling-feature"
                key={feature}
              >
                <Check size={15} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="scaling-footer">
          Global scaling actions are prepared for
          multi-region infrastructure, edge deployment,
          traffic shaping, Kubernetes orchestration, and
          server-side enterprise controls.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .scaling-page {
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

  .scaling-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .scaling-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .scaling-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .scaling-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .scaling-icon-button {
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

  .scaling-icon-button:last-child {
    justify-self: end;
  }

  .scaling-error,
  .scaling-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .scaling-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .scaling-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .scaling-status-card,
  .scaling-card,
  .scaling-metric,
  .scaling-region,
  .scaling-forecast-card,
  .scaling-feature {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .scaling-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .scaling-status-icon {
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

  .scaling-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .scaling-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .scaling-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
    text-transform: capitalize;
  }

  .scaling-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .scaling-primary-button {
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

  .scaling-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .scaling-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .scaling-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .scaling-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .scaling-metric strong {
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .scaling-section {
    margin-top: 1.3rem;
  }

  .scaling-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .scaling-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .scaling-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .scaling-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .scaling-action-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .scaling-action-row + .scaling-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .scaling-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .scaling-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .scaling-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .scaling-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .scaling-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .scaling-region-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
  }

  .scaling-region {
    display: grid;
    gap: 0.3rem;
    min-height: 5rem;
    padding: 0.7rem;
    border-radius: 0.85rem;
  }

  .scaling-region strong {
    color: #edf2ff;
    font-size: 0.7rem;
  }

  .scaling-region span {
    color: #55e6a5;
    font-size: 0.64rem;
  }

  .scaling-region small {
    color: #8491ad;
    font-size: 0.62rem;
  }

  .scaling-forecast-card {
    display: grid;
    gap: 0.35rem;
    padding: 1rem;
    border-radius: 1.1rem;
  }

  .scaling-forecast-card strong {
    color: #c9f9ff;
    font-size: 1rem;
    text-transform: capitalize;
  }

  .scaling-forecast-card span,
  .scaling-forecast-card small {
    color: #8491ad;
    font-size: 0.7rem;
  }

  .scaling-feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
  }

  .scaling-feature {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 3rem;
    padding: 0.7rem;
    border-radius: 0.9rem;
    color: #c9f9ff;
    font-size: 0.68rem;
  }

  .scaling-feature span {
    color: #dce5f7;
  }

  .scaling-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .scaling-loading-header,
  .scaling-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: scaling-skeleton 1.4s infinite;
  }

  .scaling-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .scaling-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes scaling-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 720px) {
    .scaling-metric-grid,
    .scaling-region-grid,
    .scaling-feature-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .scaling-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .scaling-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .scaling-primary-button {
      margin-left: auto;
    }
  }
`;