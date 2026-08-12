import { useState } from 'react';
import {
  BatteryCharging,
  Check,
  ChevronLeft,
  Cloud,
  Database,
  Gauge,
  RefreshCw,
  Save,
  Settings2,
  Signal,
  Trash2,
  Wifi,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useMediaPerformance from '../hooks/useMediaPerformance';
import {
  cacheMedia,
  evictMediaCache,
  getCacheStatus,
} from '../utils/cdnOptimizationEngine';
import {
  disableBatterySaverStreaming,
  disableDataSaver,
  enableBatterySaverStreaming,
  enableDataSaver,
  predictOptimalQuality,
  switchQuality,
} from '../utils/adaptiveStreamingIntelligenceEngine';

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
      className="media-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="media-action-icon">
        {icon}
      </div>

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </button>
  );
}

export default function MediaPerformanceCenter() {
  const navigate = useNavigate();
  const {
    cdn,
    streaming,
    loading,
    error,
    refresh,
  } = useMediaPerformance();

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
          'Unable to complete performance action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const exportReport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      cdn,
      streaming,
      cache: getCacheStatus(),
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
      'aarush-media-performance-report.json';
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice('Performance report exported.');
  };

  if (loading) {
    return (
      <div className="social-page media-performance-page">
        <TopBar />

        <main className="media-content">
          <div className="media-loading-header" />
          <div className="media-loading-card" />
          <div className="media-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  const network = cdn?.network || {};
  const cache = cdn?.cache || {};
  const currentQuality =
    streaming?.predicted_quality || 'auto';

  return (
    <div className="social-page media-performance-page">
      <TopBar />

      <main className="media-content">
        <header className="media-header">
          <button
            type="button"
            className="media-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="media-eyebrow">
              Global delivery
            </p>
            <h1>Media Performance</h1>
          </div>

          <button
            type="button"
            className="media-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh performance"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="media-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="media-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="media-status-card">
          <div className="media-status-icon">
            <Gauge size={27} />
          </div>

          <div className="media-status-copy">
            <p>Network quality</p>
            <h2>{network.quality || 'Unknown'}</h2>
            <span>
              {network.bandwidth || 0} Mbps
              {' · '}
              {network.latency || '—'} ms latency
            </span>
          </div>

          <button
            type="button"
            className="media-primary-button"
            onClick={refresh}
            disabled={busy}
          >
            <Signal size={15} />
            Analyze
          </button>
        </section>

        <section className="media-metric-grid">
          <article className="media-metric">
            <Wifi size={18} />
            <span>Bandwidth</span>
            <strong>
              {network.bandwidth || 0} Mbps
            </strong>
          </article>

          <article className="media-metric">
            <Signal size={18} />
            <span>Latency</span>
            <strong>
              {network.latency || '—'} ms
            </strong>
          </article>

          <article className="media-metric">
            <Database size={18} />
            <span>Cache entries</span>
            <strong>{cache.entries || 0}</strong>
          </article>

          <article className="media-metric">
            <Cloud size={18} />
            <span>Edge</span>
            <strong>
              {cdn?.edge || 'Auto'}
            </strong>
          </article>
        </section>

        <section className="media-section">
          <div className="media-section-heading">
            <Cloud size={17} />
            <div>
              <h2>CDN status</h2>
              <p>
                Multi-region edge selection and origin fallback preparation.
              </p>
            </div>
          </div>

          <div className="media-card">
            <ActionRow
              icon={<Cloud size={18} />}
              title="Optimize playback route"
              description="Select the lowest-latency edge region."
              onClick={() =>
                setNotice(
                  'Latency-aware edge selection is ready.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Refresh performance"
              description="Recalculate network, CDN, and cache signals."
              onClick={refresh}
              disabled={busy}
            />

            <ActionRow
              icon={<Save size={18} />}
              title="Clear media cache"
              description={`${cache.entries || 0} cached media entries.`}
              onClick={() =>
                runAction(
                  () => evictMediaCache(),
                  'Media cache cleared.'
                )
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="media-section">
          <div className="media-section-heading">
            <Settings2 size={17} />
            <div>
              <h2>Adaptive streaming</h2>
              <p>
                Quality switching based on network, buffer, device, and battery.
              </p>
            </div>
          </div>

          <div className="media-card">
            <div className="media-quality-row">
              {[
                '144p',
                '240p',
                '360p',
                '480p',
                '720p',
                '1080p',
                '1440p',
                '4K',
              ].map((quality) => (
                <button
                  type="button"
                  onClick={() => {
                    if (quality === '4K') {
                      setNotice(
                        '4K is reserved for future delivery support.'
                      );
                      return;
                    }

                    switchQuality(quality);
                    setNotice(
                      `Streaming quality set to ${quality}.`
                    );
                  }}
                  key={quality}
                >
                  {quality}
                </button>
              ))}
            </div>

            <div className="media-quality-current">
              <span>Predicted quality</span>
              <strong>{currentQuality}</strong>
            </div>

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Optimize playback"
              description="Select an intelligent quality for current conditions."
              onClick={() => {
                const quality =
                  predictOptimalQuality({
                    bandwidth: network.bandwidth,
                    latency: network.latency,
                  });

                switchQuality(quality);
                setNotice(
                  `Playback optimized to ${quality}.`
                );
              }}
              disabled={busy}
            />
          </div>
        </section>

        <section className="media-section">
          <div className="media-section-heading">
            <BatteryCharging size={17} />
            <div>
              <h2>Data and battery saver</h2>
              <p>
                Reduce bandwidth and battery impact during playback.
              </p>
            </div>
          </div>

          <div className="media-card">
            <ActionRow
              icon={<Wifi size={18} />}
              title="Enable data saver"
              description="Prefer lower-quality streaming renditions."
              onClick={() => {
                enableDataSaver();
                setNotice('Data saver enabled.');
                refresh();
              }}
              disabled={busy}
            />

            <ActionRow
              icon={<BatteryCharging size={18} />}
              title="Enable battery saver streaming"
              description="Reduce playback quality and processing cost."
              onClick={() => {
                enableBatterySaverStreaming();
                setNotice(
                  'Battery saver streaming enabled.'
                );
                refresh();
              }}
              disabled={busy}
            />

            <ActionRow
              icon={<Check size={18} />}
              title="Disable saver modes"
              description="Restore normal adaptive streaming behavior."
              onClick={() => {
                disableDataSaver();
                disableBatterySaverStreaming();
                setNotice('Saver modes disabled.');
                refresh();
              }}
              disabled={busy}
            />
          </div>
        </section>

        <section className="media-section">
          <div className="media-section-heading">
            <Database size={17} />
            <div>
              <h2>Cache status</h2>
              <p>
                Browser media caching and preload preparation.
              </p>
            </div>
          </div>

          <div className="media-card">
            <div className="media-cache-row">
              <span>Cached media</span>
              <strong>{cache.entries || 0}</strong>
            </div>

            <div className="media-cache-row">
              <span>Cache hits</span>
              <strong>{cache.cache_hits || 0}</strong>
            </div>

            <div className="media-cache-row">
              <span>Cache misses</span>
              <strong>{cache.cache_misses || 0}</strong>
            </div>

            <ActionRow
              icon={<Database size={18} />}
              title="Clear stale cache"
              description="Remove cached media and prepare fresh delivery."
              onClick={() =>
                runAction(
                  () => evictMediaCache(),
                  'Media cache cleared.'
                )
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="media-section">
          <div className="media-section-heading">
            <Gauge size={17} />
            <div>
              <h2>Performance analytics</h2>
              <p>
                Startup time, rebuffers, quality switches, and data usage are prepared for telemetry.
              </p>
            </div>
          </div>

          <div className="media-analytics-grid">
            {[
              ['Startup time', 'Prepared'],
              ['Rebuffer count', 'Prepared'],
              ['Average bitrate', 'Prepared'],
              ['Playback failures', 'Prepared'],
              ['Quality switches', 'Prepared'],
              ['Battery impact', 'Prepared'],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="media-export-button"
            onClick={() => {
              const report = {
                generated_at: new Date().toISOString(),
                cdn,
                streaming,
                cache,
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
                'aarush-media-performance.json';
              anchor.click();

              URL.revokeObjectURL(url);
              setNotice('Performance report exported.');
            }}
          >
            Export performance report
          </button>
        </section>

        <p className="media-footer">
          CDN, edge delivery, adaptive streaming, and
          telemetry are prepared for future multi-region
          infrastructure integrations.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .media-performance-page {
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

  .media-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .media-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .media-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .media-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .media-icon-button {
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

  .media-icon-button:last-child {
    justify-self: end;
  }

  .media-error,
  .media-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .media-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .media-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .media-status-card,
  .media-card,
  .media-metric,
  .media-metadata-grid > div,
  .media-analytics-grid > div {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .media-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .media-status-icon {
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

  .media-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .media-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .media-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .media-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .media-primary-button {
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

  .media-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .media-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .media-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .media-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .media-metric strong {
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .media-section {
    margin-top: 1.3rem;
  }

  .media-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .media-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .media-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .media-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .media-action-row {
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

  .media-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .media-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .media-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .media-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .media-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .media-quality-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    padding: 0.85rem;
  }

  .media-quality-row button {
    min-height: 2rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid rgba(124,92,255,0.28);
    border-radius: 999px;
    color: #dcd5ff;
    background: rgba(124,92,255,0.1);
    font-size: 0.66rem;
    font-weight: 800;
    cursor: pointer;
  }

  .media-quality-current,
  .media-cache-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.75rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .media-quality-current span,
  .media-cache-row span {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .media-quality-current strong,
  .media-cache-row strong {
    color: #c9f9ff;
    font-size: 0.76rem;
  }

  .media-analytics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
  }

  .media-analytics-grid > div {
    display: grid;
    gap: 0.25rem;
    padding: 0.7rem;
    border-radius: 0.85rem;
  }

  .media-analytics-grid span {
    color: #8491ad;
    font-size: 0.63rem;
  }

  .media-analytics-grid strong {
    color: #edf2ff;
    font-size: 0.72rem;
  }

  .media-export-button {
    width: 100%;
    min-height: 2.7rem;
    margin-top: 0.65rem;
    border: 1px solid rgba(77,215,255,0.2);
    border-radius: 0.8rem;
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
    font-size: 0.7rem;
    font-weight: 850;
    cursor: pointer;
  }

  .media-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .media-loading-header,
  .media-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: media-skeleton 1.4s infinite;
  }

  .media-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .media-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes media-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .media-metric-grid,
    .media-analytics-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .media-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .media-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .media-primary-button {
      margin-left: auto;
    }
  }
`;