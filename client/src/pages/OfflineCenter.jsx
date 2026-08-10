import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudOff,
  Database,
  Pause,
  Play,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useOfflineSync from '../hooks/useOfflineSync';
import {
  getQueueHistory,
} from '../utils/offlineQueueEngine';

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
          ? 'offline-action-row is-danger'
          : 'offline-action-row'
      }
      onClick={onClick}
      disabled={disabled}
    >
      <div className="offline-action-icon">
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

export default function OfflineCenter() {
  const navigate = useNavigate();

  const {
    queue,
    history,
    background,
    loading,
    error,
    syncNow,
    retryFailed,
    pause,
    resume,
    clearCompleted,
    clearFailed,
    refresh,
  } = useOfflineSync();

  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const exportQueue = async () => {
    try {
      const items = await getQueueHistory();
      const blob = new Blob(
        [JSON.stringify(items, null, 2)],
        {
          type: 'application/json',
        }
      );

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = 'aarush-offline-queue.json';
      anchor.click();

      URL.revokeObjectURL(url);
      setNotice('Offline queue exported.');
    } catch (exportError) {
      setActionError(
        exportError?.message ||
          'Unable to export offline queue.'
      );
    }
  };

  const safeAction = async (
    action,
    message
  ) => {
    try {
      setActionError('');
      await action();
      setNotice(message);
    } catch (actionException) {
      setActionError(
        actionException?.message ||
          'Offline action failed.'
      );
    }
  };

  if (loading) {
    return (
      <div className="social-page offline-center-page">
        <TopBar />

        <main className="offline-content">
          <div className="offline-loading-header" />
          <div className="offline-loading-card" />
          <div className="offline-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  const network =
    background?.network ||
    (navigator.onLine ? 'online' : 'offline');

  return (
    <div className="social-page offline-center-page">
      <TopBar />

      <main className="offline-content">
        <header className="offline-header">
          <button
            type="button"
            className="offline-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="offline-eyebrow">
              Resilience
            </p>
            <h1>Offline Center</h1>
          </div>

          <button
            type="button"
            className="offline-icon-button"
            onClick={refresh}
            aria-label="Refresh offline status"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="offline-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="offline-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="offline-status-card">
          <div className="offline-status-icon">
            {network === 'offline' ? (
              <WifiOff size={27} />
            ) : (
              <Wifi size={27} />
            )}
          </div>

          <div className="offline-status-copy">
            <p>Offline status</p>
            <h2>{network}</h2>
            <span>
              Queue is {background?.state || 'ready'}
            </span>
          </div>

          <button
            type="button"
            className="offline-primary-button"
            onClick={() =>
              safeAction(
                syncNow,
                'Offline queue synchronized.'
              )
            }
            disabled={network === 'offline'}
          >
            <RefreshCw size={15} />
            Sync now
          </button>
        </section>

        <section className="offline-metric-grid">
          <article className="offline-metric">
            <Clock3 size={18} />
            <span>Pending</span>
            <strong>{queue.pending || 0}</strong>
          </article>

          <article className="offline-metric">
            <CloudOff size={18} />
            <span>Failed</span>
            <strong>{queue.failed || 0}</strong>
          </article>

          <article className="offline-metric">
            <Database size={18} />
            <span>Completed</span>
            <strong>{queue.completed || 0}</strong>
          </article>

          <article className="offline-metric">
            <RefreshCw size={18} />
            <span>Sync state</span>
            <strong>
              {background?.state || 'ready'}
            </strong>
          </article>
        </section>

        <section className="offline-section">
          <div className="offline-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Smart sync queue</h2>
              <p>
                Priority actions waiting for network recovery.
              </p>
            </div>
          </div>

          <div className="offline-card">
            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Retry failed actions"
              description="Retry failed uploads, likes, messages, and follows."
              onClick={() =>
                safeAction(
                  retryFailed,
                  'Failed actions queued for retry.'
                )
              }
              disabled={!queue.failed}
            />

            {background?.state === 'paused' ? (
              <ActionRow
                icon={<Play size={18} />}
                title="Resume queue"
                description="Continue background synchronization."
                onClick={() =>
                  safeAction(
                    resume,
                    'Offline queue resumed.'
                  )
                }
              />
            ) : (
              <ActionRow
                icon={<Pause size={18} />}
                title="Pause queue"
                description="Temporarily stop background synchronization."
                onClick={() =>
                  safeAction(
                    pause,
                    'Offline queue paused.'
                  )
                }
              />
            )}

            <ActionRow
              icon={<Trash2 size={18} />}
              title="Clear completed"
              description="Remove successfully synchronized actions."
              onClick={() =>
                safeAction(
                  clearCompleted,
                  'Completed actions cleared.'
                )
              }
              disabled={!queue.completed}
            />

            <ActionRow
              icon={<Trash2 size={18} />}
              title="Clear failed"
              description="Remove actions that exceeded retry limits."
              onClick={() =>
                safeAction(
                  clearFailed,
                  'Failed actions cleared.'
                )
              }
              danger
              disabled={!queue.failed}
            />

            <ActionRow
              icon={<Database size={18} />}
              title="Export queue"
              description="Download a local queue snapshot."
              onClick={exportQueue}
            />
          </div>
        </section>

        <section className="offline-section">
          <div className="offline-section-heading">
            <CloudOff size={17} />
            <div>
              <h2>Offline capability</h2>
              <p>
                Supported action types are stored locally until sync.
              </p>
            </div>
          </div>

          <div className="offline-feature-grid">
            {[
              'Feed browsing',
              'Cached reels',
              'Cached stories',
              'Draft posts',
              'Draft messages',
              'Queued uploads',
              'Likes and comments',
              'Follows and saves',
            ].map((feature) => (
              <div
                className="offline-feature"
                key={feature}
              >
                <Check size={15} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="offline-section">
          <div className="offline-section-heading">
            <Clock3 size={17} />
            <div>
              <h2>Sync history</h2>
              <p>
                Recent queue activity and retry attempts.
              </p>
            </div>
          </div>

          <div className="offline-card">
            {history.length === 0 ? (
              <div className="offline-empty">
                <Clock3 size={23} />
                <span>No queue history yet.</span>
              </div>
            ) : (
              history
                .slice(0, 12)
                .map((item) => (
                  <article
                    className="offline-history-row"
                    key={item.id}
                  >
                    <span
                      className={
                        item.status === 'failed'
                          ? 'is-failed'
                          : item.status === 'completed'
                            ? 'is-completed'
                            : 'is-pending'
                      }
                    />

                    <div>
                      <strong>{item.type}</strong>
                      <small>
                        {item.status}
                        {' · '}
                        {formatDate(item.updated_at)}
                      </small>
                    </div>
                  </article>
                ))
            )}
          </div>
        </section>

        <p className="offline-footer">
          Guest mode supports local queue storage only.
          Cloud synchronization requires authentication.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .offline-center-page {
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

  .offline-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .offline-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .offline-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .offline-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .offline-icon-button {
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

  .offline-icon-button:last-child {
    justify-self: end;
  }

  .offline-error,
  .offline-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .offline-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .offline-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .offline-status-card,
  .offline-card,
  .offline-metric,
  .offline-feature {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .offline-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .offline-status-icon {
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

  .offline-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .offline-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .offline-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
    text-transform: capitalize;
  }

  .offline-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .offline-primary-button {
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

  .offline-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .offline-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .offline-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .offline-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .offline-metric strong {
    color: #edf2ff;
    font-size: 0.9rem;
    text-transform: capitalize;
  }

  .offline-section {
    margin-top: 1.3rem;
  }

  .offline-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .offline-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .offline-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .offline-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .offline-action-row {
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

  .offline-action-row + .offline-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .offline-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .offline-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .offline-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .offline-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .offline-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .offline-action-row > svg {
    color: #7483a1;
  }

  .offline-action-row.is-danger .offline-action-icon {
    color: #ff9bb4;
    background: rgba(255,91,132,0.1);
  }

  .offline-feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
  }

  .offline-feature {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 3rem;
    padding: 0.7rem;
    border-radius: 0.9rem;
    color: #c9f9ff;
    font-size: 0.68rem;
  }

  .offline-feature span {
    color: #dce5f7;
  }

  .offline-history-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 3.8rem;
    padding: 0.7rem 0.9rem;
  }

  .offline-history-row + .offline-history-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .offline-history-row > span {
    width: 0.6rem;
    height: 0.6rem;
    flex: 0 0 auto;
    border-radius: 50%;
  }

  .offline-history-row > span.is-completed {
    background: #55e6a5;
  }

  .offline-history-row > span.is-failed {
    background: #ff6f91;
  }

  .offline-history-row > span.is-pending {
    background: #ffd166;
  }

  .offline-history-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .offline-history-row strong {
    color: #edf2ff;
    font-size: 0.76rem;
  }

  .offline-history-row small {
    color: #8491ad;
    font-size: 0.66rem;
  }

  .offline-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .offline-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .offline-loading-header,
  .offline-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: offline-skeleton 1.4s infinite;
  }

  .offline-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .offline-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  .offline-spin {
    animation: offline-spin 0.9s linear infinite;
  }

  @keyframes offline-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes offline-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .offline-metric-grid,
    .offline-feature-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .offline-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .offline-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .offline-primary-button {
      margin-left: auto;
    }
  }
`;