import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Database,
  Download,
  History,
  RefreshCw,
  Shield,
  Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useReliabilityStatus from '../hooks/useReliabilityStatus';
import {
  createRecoveryCheckpoint,
  exportRecoverySnapshot,
  getRecoveryHistory,
  restoreRecoveryCheckpoint,
  importRecoverySnapshot,
  emergencyRecoveryMode,
} from '../utils/disasterRecoveryEngine';
import {
  runFullSystemRepair,
  repairSyncQueue,
  getRepairHistory,
} from '../utils/selfHealingEngine';
import {
  verifyBackupIntegrity,
} from '../utils/backupEngine';

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
          ? 'reliability-action-row is-danger'
          : 'reliability-action-row'
      }
      onClick={onClick}
      disabled={disabled}
    >
      <div className="reliability-action-icon">
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

export default function ReliabilityCenter() {
  const navigate = useNavigate();
  const {
    reliability,
    loading,
    error,
    refresh,
  } = useReliabilityStatus();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');
  const [recoveryHistory, setRecoveryHistory] =
    useState([]);
  const [repairHistory, setRepairHistory] =
    useState([]);

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
          'Unable to complete reliability action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const exportSnapshot = async () => {
    const snapshot =
      await exportRecoverySnapshot();

    const blob = new Blob(
      [JSON.stringify(snapshot, null, 2)],
      {
        type: 'application/json',
      }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download =
      'aarush-recovery-snapshot.json';
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice('Recovery snapshot exported.');
  };

  const importSnapshot = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      try {
        setBusy(true);
        const snapshot = JSON.parse(
          await file.text()
        );

        await importRecoverySnapshot(snapshot);
        setNotice('Recovery snapshot imported.');
      } catch (importError) {
        setActionError(
          importError?.message ||
            'Unable to import recovery snapshot.'
        );
      } finally {
        setBusy(false);
      }
    };

    input.click();
  };

  const loadHistory = async () => {
    try {
      setBusy(true);

      const [recovery, repairs] =
        await Promise.all([
          getRecoveryHistory({
            page: 0,
            pageSize: 30,
          }),
          getRepairHistory({
            page: 0,
            pageSize: 30,
          }),
        ]);

      setRecoveryHistory(recovery);
      setRepairHistory(repairs);
      setNotice('Reliability history loaded.');
    } catch (historyError) {
      setActionError(
        historyError?.message ||
          'Unable to load reliability history.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="social-page reliability-page">
        <TopBar />

        <main className="reliability-content">
          <div className="reliability-loading-header" />
          <div className="reliability-loading-card" />
          <div className="reliability-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  const state =
    reliability?.state || 'Degraded';

  return (
    <div className="social-page reliability-page">
      <TopBar />

      <main className="reliability-content">
        <header className="reliability-header">
          <button
            type="button"
            className="reliability-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="reliability-eyebrow">
              Enterprise reliability
            </p>
            <h1>Reliability Center</h1>
          </div>

          <button
            type="button"
            className="reliability-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh reliability"
          >
            <RefreshCw
              size={18}
              className={
                busy
                  ? 'reliability-spin'
                  : undefined
              }
            />
          </button>
        </header>

        {error || actionError ? (
          <div className="reliability-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="reliability-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="reliability-status-card">
          <div className="reliability-status-icon">
            {state === 'Healthy' ? (
              <Check size={28} />
            ) : (
              <AlertTriangle size={28} />
            )}
          </div>

          <div className="reliability-status-copy">
            <p>System health</p>
            <h2>{state}</h2>
            <span>
              Cloud integrity{' '}
              {reliability?.cloud?.verified
                ? 'verified'
                : 'requires review'}
            </span>
          </div>

          <button
            type="button"
            className="reliability-primary-button"
            onClick={refresh}
            disabled={busy}
          >
            <RefreshCw size={15} />
            Check
          </button>
        </section>

        <section className="reliability-section">
          <div className="reliability-section-heading">
            <Shield size={17} />
            <div>
              <h2>Integrity verification</h2>
              <p>
                Verify cloud and local application state.
              </p>
            </div>
          </div>

          <div className="reliability-card">
            <div className="reliability-info-row">
              <Cloud size={18} />
              <span>
                <strong>Cloud integrity</strong>
                <small>
                  {reliability?.cloud?.verified
                    ? 'Verified'
                    : 'Needs review'}
                </small>
              </span>
              {reliability?.cloud?.verified ? (
                <Check size={18} color="#55e6a5" />
              ) : (
                <AlertTriangle
                  size={18}
                  color="#ffd166"
                />
              )}
            </div>

            <div className="reliability-info-row">
              <Database size={18} />
              <span>
                <strong>Local integrity</strong>
                <small>
                  {reliability?.local?.verified
                    ? 'Storage available'
                    : 'Unavailable'}
                </small>
              </span>
              {reliability?.local?.verified ? (
                <Check size={18} color="#55e6a5" />
              ) : (
                <AlertTriangle
                  size={18}
                  color="#ffd166"
                />
              )}
            </div>

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Run integrity check"
              description="Verify cloud, local, backup, and sync state."
              onClick={() =>
                runAction(
                  refresh,
                  'Integrity check completed.'
                )
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="reliability-section">
          <div className="reliability-section-heading">
            <Wrench size={17} />
            <div>
              <h2>Self-healing</h2>
              <p>
                Repair queues, missing state, and interrupted updates.
              </p>
            </div>
          </div>

          <div className="reliability-card">
            <ActionRow
              icon={<Wrench size={18} />}
              title="Run full system repair"
              description="Run the complete repair pipeline."
              onClick={() =>
                runAction(
                  runFullSystemRepair,
                  'Full system repair completed.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Repair sync queue"
              description="Recover failed and interrupted synchronization."
              onClick={() =>
                runAction(
                  repairSyncQueue,
                  'Sync queue repair completed.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Database size={18} />}
              title="Verify backup integrity"
              description="Verify the most recent backup metadata."
              onClick={() =>
                setNotice(
                  'Select a backup from Backup Center to verify it.'
                )
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="reliability-section">
          <div className="reliability-section-heading">
            <History size={17} />
            <div>
              <h2>Recovery checkpoints</h2>
              <p>
                Create and restore safe recovery points.
              </p>
            </div>
          </div>

          <div className="reliability-card">
            <ActionRow
              icon={<Database size={18} />}
              title="Create recovery checkpoint"
              description="Save the current application state."
              onClick={() =>
                runAction(
                  createRecoveryCheckpoint,
                  'Recovery checkpoint created.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Restore checkpoint"
              description={
                recoveryHistory[0]
                  ? `Restore ${formatDate(
                      recoveryHistory[0].created_at
                    )}`
                  : 'Load recovery history first.'
              }
              onClick={() => {
                if (!recoveryHistory[0]) {
                  loadHistory();
                  return;
                }

                runAction(
                  () =>
                    restoreRecoveryCheckpoint(
                      recoveryHistory[0].id
                    ),
                  'Checkpoint restore prepared.'
                );
              }}
              disabled={busy}
            />

            <ActionRow
              icon={<History size={18} />}
              title="View recovery history"
              description="Review checkpoints and repair events."
              onClick={loadHistory}
              disabled={busy}
            />
          </div>
        </section>

        <section className="reliability-section">
          <div className="reliability-section-heading">
            <Download size={17} />
            <div>
              <h2>Disaster recovery</h2>
              <p>
                Prepare for browser loss, outages, and migration failures.
              </p>
            </div>
          </div>

          <div className="reliability-card">
            <ActionRow
              icon={<Download size={18} />}
              title="Export recovery snapshot"
              description="Download a portable recovery snapshot."
              onClick={() =>
                runAction(
                  exportSnapshot,
                  'Recovery snapshot exported.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Database size={18} />}
              title="Import recovery snapshot"
              description="Load a verified local recovery snapshot."
              onClick={importSnapshot}
              disabled={busy}
            />

            <ActionRow
              icon={<Shield size={18} />}
              title="Enter recovery mode"
              description="Switch the account to recovery-only operation."
              onClick={() =>
                runAction(
                  () => emergencyRecoveryMode(true),
                  'Emergency recovery mode enabled.'
                )
              }
              danger
              disabled={busy}
            />
          </div>
        </section>

        {recoveryHistory.length ||
        repairHistory.length ? (
          <section className="reliability-section">
            <div className="reliability-section-heading">
              <History size={17} />
              <div>
                <h2>Reliability history</h2>
                <p>
                  Recent checkpoints and repair operations.
                </p>
              </div>
            </div>

            <div className="reliability-card">
              {[
                ...recoveryHistory,
                ...repairHistory,
              ]
                .slice(0, 12)
                .map((item) => (
                  <article
                    className="reliability-history-row"
                    key={
                      item.id ||
                      `${item.created_at}-${item.status}`
                    }
                  >
                    <span />
                    <div>
                      <strong>
                        {item.repair_type ||
                          item.status ||
                          'Recovery event'}
                      </strong>
                      <small>
                        {formatDate(item.created_at)}
                      </small>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ) : null}

        <p className="reliability-footer">
          Reliability operations are designed to verify state
          and prepare repairs. Destructive data restoration
          should remain protected by server-side policies.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .reliability-page {
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

  .reliability-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .reliability-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .reliability-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .reliability-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .reliability-icon-button {
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

  .reliability-icon-button:last-child {
    justify-self: end;
  }

  .reliability-icon-button:disabled,
  .reliability-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .reliability-error,
  .reliability-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .reliability-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .reliability-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .reliability-status-card,
  .reliability-card,
  .reliability-info-row {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .reliability-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .reliability-status-icon {
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

  .reliability-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .reliability-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .reliability-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .reliability-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .reliability-primary-button {
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

  .reliability-section {
    margin-top: 1.3rem;
  }

  .reliability-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .reliability-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .reliability-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .reliability-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .reliability-info-row,
  .reliability-action-row,
  .reliability-history-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
    border: 0;
  }

  .reliability-info-row + .reliability-info-row,
  .reliability-action-row + .reliability-action-row,
  .reliability-history-row + .reliability-history-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .reliability-info-row > span,
  .reliability-action-row > span,
  .reliability-history-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .reliability-info-row strong,
  .reliability-action-row strong,
  .reliability-history-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .reliability-info-row small,
  .reliability-action-row small,
  .reliability-history-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .reliability-action-row {
    width: 100%;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .reliability-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .reliability-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .reliability-action-row > svg {
    color: #7483a1;
  }

  .reliability-action-row.is-danger
    .reliability-action-icon {
    color: #ff9bb4;
    background: rgba(255,91,132,0.1);
  }

  .reliability-history-row > span {
    width: 0.6rem;
    height: 0.6rem;
    flex: 0 0 auto;
    border-radius: 50%;
    background: #55e6a5;
  }

  .reliability-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .reliability-loading-header,
  .reliability-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: reliability-skeleton 1.4s infinite;
  }

  .reliability-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .reliability-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  .reliability-spin {
    animation: reliability-spin 0.9s linear infinite;
  }

  @keyframes reliability-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes reliability-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 560px) {
    .reliability-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .reliability-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .reliability-primary-button {
      margin-left: auto;
    }
  }
`;