import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Database,
  Download,
  HardDrive,
  History,
  Laptop,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useCloudSync from '../hooks/useCloudSync';
import {
  createBackup,
  getSyncHistory,
  restoreBackup,
} from '../utils/cloudSyncEngine';
import {
  clearCache,
  initializeOfflineMode,
} from '../utils/offlineEngine';

function formatDate(value) {
  if (!value) return 'Never';

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
          ? 'cloud-action-row is-danger'
          : 'cloud-action-row'
      }
      onClick={onClick}
      disabled={disabled}
    >
      <div className="cloud-action-icon">
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

export default function CloudCenter() {
  const navigate = useNavigate();

  const {
    status,
    last_sync_at,
    queue,
    offline,
    loading,
    error,
    sync,
    refresh,
  } = useCloudSync();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');
  const [history, setHistory] = useState([]);

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
          'Unable to complete cloud action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCreateBackup = () =>
    runAction(
      createBackup,
      'Cloud backup created.'
    );

  const handleClearCache = () => {
    if (
      !window.confirm(
        'Clear cached feed, chats, stories, and Explore data?'
      )
    ) {
      return;
    }

    runAction(
      clearCache,
      'Offline cache cleared.'
    );
  };

  const loadHistory = async () => {
    try {
      setBusy(true);

      const result = await getSyncHistory({
        page: 0,
        pageSize: 30,
      });

      setHistory(result);
      setNotice('Sync history loaded.');
    } catch (historyError) {
      setActionError(
        historyError?.message ||
          'Unable to load sync history.'
      );
    } finally {
      setBusy(false);
    }
  };

  const exportCloudData = () => {
    const report = {
      generated_at: new Date().toISOString(),
      sync_status: status,
      pending_actions: queue,
      last_sync_at,
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
    anchor.download = 'aarush-cloud-sync-report.json';
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice('Cloud data report exported.');
  };

  if (loading) {
    return (
      <div className="social-page cloud-center-page">
        <TopBar />

        <main className="cloud-content">
          <div className="cloud-loading-header" />
          <div className="cloud-loading-card" />
          <div className="cloud-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  const displayStatus = offline
    ? 'Offline'
    : status || 'Pending';

  return (
    <div className="social-page cloud-center-page">
      <TopBar />

      <main className="cloud-content">
        <header className="cloud-header">
          <button
            type="button"
            className="cloud-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="cloud-eyebrow">
              Infrastructure
            </p>
            <h1>Cloud Center</h1>
          </div>

          <button
            type="button"
            className="cloud-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh cloud status"
          >
            <RefreshCw
              size={18}
              className={
                busy ? 'cloud-spin' : undefined
              }
            />
          </button>
        </header>

        {error || actionError ? (
          <div className="cloud-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="cloud-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="cloud-status-card">
          <div className="cloud-status-icon">
            {offline ? (
              <WifiOff size={27} />
            ) : (
              <Cloud size={27} />
            )}
          </div>

          <div className="cloud-status-copy">
            <p>Sync status</p>
            <h2>{displayStatus}</h2>
            <span>
              Last sync {formatDate(last_sync_at)}
            </span>
          </div>

          <button
            type="button"
            className="cloud-primary-button"
            onClick={sync}
            disabled={busy || offline}
          >
            <RefreshCw size={15} />
            Sync now
          </button>
        </section>

        <section className="cloud-metric-grid">
          <article className="cloud-metric">
            <Cloud size={18} />
            <span>Cloud state</span>
            <strong>{displayStatus}</strong>
          </article>

          <article className="cloud-metric">
            <Database size={18} />
            <span>Pending actions</span>
            <strong>{queue.length}</strong>
          </article>

          <article className="cloud-metric">
            <HardDrive size={18} />
            <span>Cached data</span>
            <strong>Ready</strong>
          </article>

          <article className="cloud-metric">
            {offline ? (
              <WifiOff size={18} />
            ) : (
              <Wifi size={18} />
            )}
            <span>Connectivity</span>
            <strong>
              {offline ? 'Offline' : 'Online'}
            </strong>
          </article>
        </section>

        <section className="cloud-section">
          <div className="cloud-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Synchronization</h2>
              <p>
                Keep account data consistent across devices.
              </p>
            </div>
          </div>

          <div className="cloud-card">
            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Sync now"
              description="Synchronize profiles, posts, stories, chats, and settings."
              onClick={sync}
              disabled={busy || offline}
            />

            <ActionRow
              icon={<History size={18} />}
              title="View sync history"
              description="Review successful and failed synchronization events."
              onClick={loadHistory}
              disabled={busy}
            />

            <ActionRow
              icon={<Download size={18} />}
              title="Export cloud data"
              description="Download a local status report."
              onClick={exportCloudData}
              disabled={busy}
            />
          </div>
        </section>

        <section className="cloud-section">
          <div className="cloud-section-heading">
            <HardDrive size={17} />
            <div>
              <h2>Offline mode</h2>
              <p>
                Continue using cached data and queue actions.
              </p>
            </div>
          </div>

          <div className="cloud-card">
            <ActionRow
              icon={<Wifi size={18} />}
              title="Enable offline mode"
              description="Prepare local storage for offline actions."
              onClick={() =>
                runAction(
                  initializeOfflineMode,
                  'Offline mode enabled.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Trash2 size={18} />}
              title="Clear cache"
              description="Remove cached feed, chats, stories, and Explore data."
              onClick={handleClearCache}
              danger
              disabled={busy}
            />
          </div>
        </section>

        <section className="cloud-section">
          <div className="cloud-section-heading">
            <Database size={17} />
            <div>
              <h2>Backup and recovery</h2>
              <p>
                Prepare account and settings recovery.
              </p>
            </div>
          </div>

          <div className="cloud-card">
            <ActionRow
              icon={<Cloud size={18} />}
              title="Create backup"
              description="Create a cloud account backup record."
              onClick={handleCreateBackup}
              disabled={busy || offline}
            />

            <ActionRow
              icon={<Download size={18} />}
              title="Restore backup"
              description="Restore from a verified cloud backup."
              onClick={() =>
                setNotice(
                  'Select a verified backup from the recovery workflow.'
                )
              }
              disabled={busy || offline}
            />

            <ActionRow
              icon={<Laptop size={18} />}
              title="Connected devices"
              description="Review devices participating in synchronization."
              onClick={() =>
                navigate('/security-center')
              }
              disabled={busy}
            />
          </div>
        </section>

        {queue.length ? (
          <section className="cloud-section">
            <div className="cloud-section-heading">
              <RefreshCw size={17} />
              <div>
                <h2>Offline queue</h2>
                <p>
                  Actions waiting for the next online sync.
                </p>
              </div>
            </div>

            <div className="cloud-card">
              {queue.slice(0, 10).map((item) => (
                <article
                  className="cloud-queue-row"
                  key={item.id}
                >
                  <RefreshCw size={16} />
                  <div>
                    <strong>{item.type}</strong>
                    <span>
                      {item.status || 'Pending'}
                      {' · '}
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {history.length ? (
          <section className="cloud-section">
            <div className="cloud-section-heading">
              <History size={17} />
              <div>
                <h2>Cloud events</h2>
                <p>
                  Recent cloud synchronization activity.
                </p>
              </div>
            </div>

            <div className="cloud-card">
              {history.slice(0, 10).map((event) => (
                <article
                  className="cloud-history-row"
                  key={event.id}
                >
                  <span
                    className={
                      event.status === 'failed'
                        ? 'is-failed'
                        : 'is-success'
                    }
                  />
                  <div>
                    <strong>
                      {event.category}
                    </strong>
                    <small>
                      {event.status}
                      {' · '}
                      {formatDate(event.created_at)}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <p className="cloud-footer">
          Guest mode uses local offline storage only.
          Cloud synchronization requires an authenticated
          Aarush account.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .cloud-center-page {
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

  .cloud-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .cloud-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .cloud-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .cloud-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .cloud-icon-button {
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

  .cloud-icon-button:last-child {
    justify-self: end;
  }

  .cloud-icon-button:disabled,
  .cloud-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .cloud-error,
  .cloud-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .cloud-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .cloud-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .cloud-status-card,
  .cloud-card,
  .cloud-metric {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .cloud-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .cloud-status-icon {
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

  .cloud-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .cloud-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .cloud-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
    text-transform: capitalize;
  }

  .cloud-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .cloud-primary-button {
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

  .cloud-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .cloud-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .cloud-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .cloud-metric strong {
    color: #edf2ff;
    font-size: 0.9rem;
    text-transform: capitalize;
  }

  .cloud-section {
    margin-top: 1.3rem;
  }

  .cloud-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .cloud-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .cloud-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .cloud-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .cloud-action-row,
  .cloud-queue-row,
  .cloud-history-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .cloud-action-row + .cloud-action-row,
  .cloud-queue-row + .cloud-queue-row,
  .cloud-history-row + .cloud-history-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .cloud-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .cloud-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .cloud-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .cloud-action-row > span,
  .cloud-queue-row > div,
  .cloud-history-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .cloud-action-row strong,
  .cloud-queue-row strong,
  .cloud-history-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .cloud-action-row small,
  .cloud-queue-row span,
  .cloud-history-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .cloud-action-row > svg {
    color: #7483a1;
  }

  .cloud-action-row.is-danger .cloud-action-icon {
    color: #ff9bb4;
    background: rgba(255,91,132,0.1);
  }

  .cloud-queue-row > svg {
    color: #b8a9ff;
  }

  .cloud-history-row > span {
    width: 0.6rem;
    height: 0.6rem;
    flex: 0 0 auto;
    border-radius: 50%;
  }

  .cloud-history-row > span.is-success {
    background: #55e6a5;
  }

  .cloud-history-row > span.is-failed {
    background: #ff6f91;
  }

  .cloud-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .cloud-loading-header,
  .cloud-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: cloud-skeleton 1.4s infinite;
  }

  .cloud-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .cloud-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  .cloud-spin {
    animation: cloud-spin 0.9s linear infinite;
  }

  @keyframes cloud-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes cloud-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .cloud-metric-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .cloud-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .cloud-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .cloud-primary-button {
      margin-left: auto;
    }
  }
`;