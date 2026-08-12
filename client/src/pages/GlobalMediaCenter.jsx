import { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Database,
  Globe,
  RefreshCw,
  Server,
  Shield,
  Signal,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useGlobalMediaPlatform from '../hooks/useGlobalMediaPlatform';
import {
  invalidateGlobalCache,
  monitorEdgeHealth,
  warmRegionalCache,
} from '../utils/cdnOrchestrationEngine';
import {
  analyzeRegionalPerformance,
  optimizeGlobalDelivery,
  predictTrafficDemand,
  rebalanceMediaTraffic,
} from '../utils/globalMediaPlatformEngine';

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
      className="global-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="global-action-icon">
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

export default function GlobalMediaCenter() {
  const navigate = useNavigate();
  const {
    platform,
    cdn,
    loading,
    error,
    refresh,
  } = useGlobalMediaPlatform();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');
  const [regional, setRegional] =
    useState(null);
  const [demand, setDemand] = useState(null);

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
          'Unable to complete global media action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const analyze = async () => {
    try {
      setBusy(true);

      const [performance, forecast] =
        await Promise.all([
          analyzeRegionalPerformance(),
          predictTrafficDemand(),
        ]);

      setRegional(performance);
      setDemand(forecast);
      setNotice('Global performance analyzed.');
    } catch (analysisError) {
      setActionError(
        analysisError?.message ||
          'Unable to analyze global performance.'
      );
    } finally {
      setBusy(false);
    }
  };

  const exportAnalytics = () => {
    const report = {
      generated_at: new Date().toISOString(),
      platform,
      cdn,
      regional,
      demand,
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
    anchor.download =
      'aarush-global-media-analytics.json';
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice('Global analytics exported.');
  };

  if (loading) {
    return (
      <div className="social-page global-media-page">
        <TopBar />

        <main className="global-content">
          <div className="global-loading-header" />
          <div className="global-loading-card" />
          <div className="global-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page global-media-page">
      <TopBar />

      <main className="global-content">
        <header className="global-header">
          <button
            type="button"
            className="global-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="global-eyebrow">
              Enterprise delivery
            </p>
            <h1>Global Media Center</h1>
          </div>

          <button
            type="button"
            className="global-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh global media"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="global-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="global-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="global-status-card">
          <div className="global-status-icon">
            <Globe size={27} />
          </div>

          <div className="global-status-copy">
            <p>Global platform status</p>
            <h2>
              {platform?.status || 'Operational'}
            </h2>
            <span>
              {platform?.orchestration?.provider ||
                'Multi-CDN ready'}
              {' · '}
              {platform?.orchestration?.region ||
                'Regional routing ready'}
            </span>
          </div>

          <button
            type="button"
            className="global-primary-button"
            onClick={analyze}
            disabled={busy}
          >
            <Signal size={15} />
            Analyze
          </button>
        </section>

        <section className="global-metric-grid">
          <article className="global-metric">
            <Globe size={18} />
            <span>Availability</span>
            <strong>
              {platform?.global_availability ||
                'Prepared'}
            </strong>
          </article>

          <article className="global-metric">
            <Server size={18} />
            <span>Edge health</span>
            <strong>
              {cdn?.edge_health || 'Unknown'}
            </strong>
          </article>

          <article className="global-metric">
            <Cloud size={18} />
            <span>CDN provider</span>
            <strong>
              {cdn?.provider || 'Auto'}
            </strong>
          </article>

          <article className="global-metric">
            <Zap size={18} />
            <span>Traffic forecast</span>
            <strong>
              {demand?.forecast ||
                'Not analyzed'}
            </strong>
          </article>
        </section>

        <section className="global-section">
          <div className="global-section-heading">
            <Server size={17} />
            <div>
              <h2>CDN orchestration</h2>
              <p>
                Coordinate providers, regions, failover, and edge routing.
              </p>
            </div>
          </div>

          <div className="global-card">
            <ActionRow
              icon={<Signal size={18} />}
              title="Analyze global performance"
              description="Measure regional latency and edge health."
              onClick={analyze}
              disabled={busy}
            />

            <ActionRow
              icon={<Zap size={18} />}
              title="Optimize global delivery"
              description="Prepare intelligent CDN and edge routing."
              onClick={() =>
                runAction(
                  () =>
                    optimizeGlobalDelivery(
                      null,
                      {
                        region:
                          cdn?.region || 'India',
                      }
                    ),
                  'Global delivery optimized.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Test failover"
              description="Prepare backup CDN and origin fallback."
              onClick={() =>
                setNotice(
                  'Multi-CDN failover is ready for provider integration.'
                )
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="global-section">
          <div className="global-section-heading">
            <Database size={17} />
            <div>
              <h2>Cache management</h2>
              <p>
                Warm regional caches and invalidate stale media.
              </p>
            </div>
          </div>

          <div className="global-card">
            <ActionRow
              icon={<Database size={18} />}
              title="Warm regional cache"
              description="Prepare predictive caching for high-demand media."
              onClick={() =>
                runAction(
                  () => warmRegionalCache([]),
                  'Regional cache warming prepared.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Invalidate global cache"
              description="Prepare cache invalidation for updated media."
              onClick={() =>
                runAction(
                  () => invalidateGlobalCache(),
                  'Global cache invalidation prepared.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Shield size={18} />}
              title="Monitor edge health"
              description="Check regional edge responsiveness."
              onClick={() =>
                runAction(
                  () => monitorEdgeHealth(),
                  'Edge health check completed.'
                )
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="global-section">
          <div className="global-section-heading">
            <Globe size={17} />
            <div>
              <h2>Regional performance</h2>
              <p>
                Regional latency and delivery optimization preparation.
              </p>
            </div>
          </div>

          <div className="global-region-grid">
            {[
              'India',
              'South Asia',
              'Middle East',
              'Europe',
              'North America',
              'South America',
              'Africa',
              'East Asia',
              'Southeast Asia',
              'Oceania',
            ].map((region) => (
              <div
                className="global-region"
                key={region}
              >
                <span>{region}</span>
                <strong>Prepared</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="global-section">
          <div className="global-section-heading">
            <Zap size={17} />
            <div>
              <h2>Streaming optimization</h2>
              <p>
                Adaptive bitrate, prefetching, startup, and rebuffer preparation.
              </p>
            </div>
          </div>

          <div className="global-card">
            {[
              'Adaptive bitrate',
              'Regional bitrate optimization',
              'Intelligent prefetch',
              'Predictive caching',
              'AI quality selection',
              'Startup optimization',
              'Rebuffer prevention',
              'Edge transcoding placeholder',
            ].map((item) => (
              <div
                className="global-feature"
                key={item}
              >
                <Check size={15} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="global-section">
          <div className="global-section-heading">
            <Signal size={17} />
            <div>
              <h2>Global analytics</h2>
              <p>
                Track delivery quality across the media platform.
              </p>
            </div>
          </div>

          <div className="global-card">
            <div className="global-analytics-grid">
              {[
                ['Cache hit ratio', 'Prepared'],
                ['Startup time', 'Prepared'],
                ['Playback success', 'Prepared'],
                ['Rebuffer rate', 'Prepared'],
                ['Quality distribution', 'Prepared'],
                ['Bandwidth usage', 'Prepared'],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="global-export-button"
              onClick={exportAnalytics}
            >
              Export analytics
            </button>
          </div>
        </section>

        <p className="global-footer">
          Global media orchestration is prepared for
          multi-CDN redundancy, regional failover, edge
          intelligence, traffic shaping, and future SLA
          management.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .global-media-page {
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

  .global-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .global-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .global-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .global-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .global-icon-button {
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

  .global-icon-button:last-child {
    justify-self: end;
  }

  .global-error,
  .global-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .global-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .global-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .global-status-card,
  .global-card,
  .global-metric,
  .global-region {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .global-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .global-status-icon {
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

  .global-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .global-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .global-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
    text-transform: capitalize;
  }

  .global-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .global-primary-button {
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

  .global-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .global-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .global-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .global-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .global-metric strong {
    color: #edf2ff;
    font-size: 0.86rem;
    text-transform: capitalize;
  }

  .global-section {
    margin-top: 1.3rem;
  }

  .global-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .global-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .global-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .global-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .global-action-row {
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

  .global-action-row + .global-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .global-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .global-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .global-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .global-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .global-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .global-region-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
  }

  .global-region {
    display: grid;
    gap: 0.3rem;
    min-height: 4.1rem;
    padding: 0.7rem;
    border-radius: 0.85rem;
  }

  .global-region span {
    color: #edf2ff;
    font-size: 0.7rem;
  }

  .global-region strong {
    color: #55e6a5;
    font-size: 0.63rem;
  }

  .global-feature {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 3rem;
    padding: 0.7rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
    color: #dce5f7;
    font-size: 0.7rem;
  }

  .global-feature svg {
    color: #55e6a5;
  }

  .global-analytics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
    padding: 0.9rem;
  }

  .global-analytics-grid div {
    display: grid;
    gap: 0.25rem;
    padding: 0.7rem;
    border-radius: 0.85rem;
    background: rgba(255,255,255,0.045);
  }

  .global-analytics-grid span {
    color: #8491ad;
    font-size: 0.63rem;
  }

  .global-analytics-grid strong {
    color: #edf2ff;
    font-size: 0.72rem;
  }

  .global-export-button {
    width: calc(100% - 1.8rem);
    min-height: 2.6rem;
    margin: 0 0.9rem 0.9rem;
    border: 1px solid rgba(77,215,255,0.2);
    border-radius: 0.8rem;
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
    font-size: 0.7rem;
    font-weight: 850;
    cursor: pointer;
  }

  .global-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .global-loading-header,
  .global-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: global-skeleton 1.4s infinite;
  }

  .global-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .global-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes global-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .global-metric-grid,
    .global-region-grid,
    .global-analytics-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .global-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .global-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .global-primary-button {
      margin-left: auto;
    }
  }
`;