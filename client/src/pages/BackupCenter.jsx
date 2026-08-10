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
  Lock,
  RefreshCw,
  Shield,
  Trash2,
  Upload,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useBackupStatus from '../hooks/useBackupStatus';
import {
  createBackup,
  createEncryptedBackup,
  deleteBackup,
  exportBackup,
  scheduleAutomaticBackup,
  cancelAutomaticBackup,
  verifyBackupIntegrity,
} from '../utils/backupEngine';
import {
  importBackup,
  previewBackupContents,
  restoreBackupById,
  restoreLatestBackup,
} from '../utils/restoreEngine';

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
          ? 'backup-action-row is-danger'
          : 'backup-action-row'
      }
      onClick={onClick}
      disabled={disabled}
    >
      <div className="backup-action-icon">
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

export default function BackupCenter() {
  const navigate = useNavigate();
  const {
    status,
    history,
    loading,
    error,
    refresh,
  } = useBackupStatus();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');
  const [frequency, setFrequency] =
    useState('manual');
  const [selectedBackup, setSelectedBackup] =
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
          'Unable to complete backup action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleEncryptedBackup = async () => {
    const password = window.prompt(
      'Create a password for this encrypted backup:'
    );

    if (!password) return;

    await runAction(
      () => createEncryptedBackup(password),
      'Encrypted backup created.'
    );
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      try {
        setBusy(true);

        const backup = await importBackup(file);
        const preview =
          await previewBackupContents(backup);

        setSelectedBackup({
          ...backup,
          preview,
        });

        setNotice('Backup imported and verified.');
      } catch (importError) {
        setActionError(
          importError?.message ||
            'Unable to import backup.'
        );
      } finally {
        setBusy(false);
      }
    };

    input.click();
  };

  const handleRestoreLatest = () => {
    if (
      !window.confirm(
        'Restore the latest backup? This action should be reviewed before production data writes are enabled.'
      )
    ) {
      return;
    }

    runAction(
      restoreLatestBackup,
      'Latest backup restore prepared.'
    );
  };

  const handleDelete = (backup) => {
    if (
      !window.confirm(
        'Delete this backup version?'
      )
    ) {
      return;
    }

    runAction(
      () => deleteBackup(backup.id),
      'Backup deleted.'
    );
  };

  if (loading) {
    return (
      <div className="social-page backup-center-page">
        <TopBar />

        <main className="backup-content">
          <div className="backup-loading-header" />
          <div className="backup-loading-card" />
          <div className="backup-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  const displayStatus =
    status?.status || 'pending';

  return (
    <div className="social-page backup-center-page">
      <TopBar />

      <main className="backup-content">
        <header className="backup-header">
          <button
            type="button"
            className="backup-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="backup-eyebrow">
              Disaster recovery
            </p>
            <h1>Backup Center</h1>
          </div>

          <button
            type="button"
            className="backup-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh backup status"
          >
            <RefreshCw
              size={18}
              className={
                busy ? 'backup-spin' : undefined
              }
            />
          </button>
        </header>

        {error || actionError ? (
          <div className="backup-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="backup-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="backup-status-card">
          <div className="backup-status-icon">
            <Cloud size={27} />
          </div>

          <div className="backup-status-copy">
            <p>Backup status</p>
            <h2>{displayStatus}</h2>
            <span>
              Last backup{' '}
              {formatDate(status?.last_backup_at)}
            </span>
          </div>

          <button
            type="button"
            className="backup-primary-button"
            onClick={() =>
              runAction(
                () => createBackup(),
                'Backup created.'
              )
            }
            disabled={busy}
          >
            <Cloud size={15} />
            Backup now
          </button>
        </section>

        <section className="backup-metric-grid">
          <article className="backup-metric">
            <Database size={18} />
            <span>Versions</span>
            <strong>{history.length}</strong>
          </article>

          <article className="backup-metric">
            <Lock size={18} />
            <span>Encrypted</span>
            <strong>
              {status?.encrypted ? 'Yes' : 'Ready'}
            </strong>
          </article>

          <article className="backup-metric">
            <Shield size={18} />
            <span>Integrity</span>
            <strong>Prepared</strong>
          </article>

          <article className="backup-metric">
            <History size={18} />
            <span>Recovery</span>
            <strong>Ready</strong>
          </article>
        </section>

        <section className="backup-section">
          <div className="backup-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Automatic backup</h2>
              <p>
                Choose how often incremental backups are scheduled.
              </p>
            </div>
          </div>

          <div className="backup-card backup-schedule-card">
            <select
              value={frequency}
              onChange={(event) => {
                const value = event.target.value;
                setFrequency(value);

                if (value === 'manual') {
                  cancelAutomaticBackup();
                  setNotice(
                    'Automatic backup disabled.'
                  );
                  return;
                }

                scheduleAutomaticBackup(value);
                setNotice(
                  `Automatic backup set to ${value}.`
                );
              }}
              disabled={busy}
            >
              <option value="manual">Manual only</option>
              <option value="15-minutes">
                Every 15 minutes
              </option>
              <option value="hourly">
                Every hour
              </option>
              <option value="6-hours">
                Every 6 hours
              </option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </section>

        <section className="backup-section">
          <div className="backup-section-heading">
            <Lock size={17} />
            <div>
              <h2>Backup actions</h2>
              <p>
                Create encrypted versions and restore safely.
              </p>
            </div>
          </div>

          <div className="backup-card">
            <ActionRow
              icon={<Lock size={18} />}
              title="Create encrypted backup"
              description="Protect backup metadata with AES-256-GCM."
              onClick={handleEncryptedBackup}
              disabled={busy}
            />

            <ActionRow
              icon={<Download size={18} />}
              title="Export backup"
              description="Download a selected backup version."
              onClick={() => {
                if (!history[0]) {
                  setNotice('No backup available.');
                  return;
                }

                exportBackup(history[0])
                  .then(() =>
                    setNotice('Backup exported.')
                  )
                  .catch((exportError) =>
                    setActionError(
                      exportError?.message ||
                        'Unable to export backup.'
                    )
                  );
              }}
              disabled={busy}
            />

            <ActionRow
              icon={<Upload size={18} />}
              title="Import backup"
              description="Load and verify a local backup file."
              onClick={handleImport}
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Restore latest"
              description="Prepare the newest verified version for restore."
              onClick={handleRestoreLatest}
              disabled={busy}
            />
          </div>
        </section>

        <section className="backup-section">
          <div className="backup-section-heading">
            <History size={17} />
            <div>
              <h2>Backup history</h2>
              <p>
                Review versions, integrity, and restore points.
              </p>
            </div>
          </div>

          <div className="backup-card">
            {history.length === 0 ? (
              <div className="backup-empty">
                <Database size={24} />
                <span>No backup versions yet.</span>
              </div>
            ) : (
              history.map((backup) => (
                <article
                  className="backup-history-row"
                  key={backup.id}
                >
                  <div className="backup-history-icon">
                    {backup.encrypted ? (
                      <Lock size={17} />
                    ) : (
                      <Database size={17} />
                    )}
                  </div>

                  <div>
                    <strong>
                      {backup.backup_type ||
                        backup.type ||
                        'Backup'}
                    </strong>
                    <span>
                      {formatDate(backup.created_at)}
                      {' · '}
                      {backup.integrity_status ||
                        'unverified'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="backup-small-button"
                    onClick={() =>
                      runAction(
                        () =>
                          verifyBackupIntegrity(
                            backup
                          ),
                        'Backup integrity verified.'
                      )
                    }
                    disabled={busy}
                  >
                    Verify
                  </button>

                  <button
                    type="button"
                    className="backup-delete-button"
                    onClick={() =>
                      handleDelete(backup)
                    }
                    disabled={busy}
                    aria-label="Delete backup"
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        {selectedBackup ? (
          <section className="backup-section">
            <div className="backup-section-heading">
              <Shield size={17} />
              <div>
                <h2>Restore preview</h2>
                <p>
                  Review imported backup contents before restoring.
                </p>
              </div>
            </div>

            <div className="backup-preview-card">
              <strong>
                {selectedBackup.preview?.type ||
                  'Imported backup'}
              </strong>

              <span>
                {selectedBackup.preview?.sections?.join(
                  ', '
                ) || 'No sections'}
              </span>

              <button
                type="button"
                className="backup-primary-button"
                onClick={() =>
                  setNotice(
                    'Restore preview accepted. Production data writes require final policy integration.'
                  )
                }
                disabled={busy}
              >
                Continue restore
              </button>
            </div>
          </section>
        ) : null}

        <p className="backup-footer">
          Restore operations are prepared with integrity
          verification and preview support before destructive
          production writes are enabled.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .backup-center-page {
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

  .backup-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .backup-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .backup-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .backup-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .backup-icon-button {
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

  .backup-icon-button:last-child {
    justify-self: end;
  }

  .backup-icon-button:disabled,
  .backup-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .backup-error,
  .backup-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .backup-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .backup-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .backup-status-card,
  .backup-card,
  .backup-metric,
  .backup-preview-card {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .backup-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .backup-status-icon {
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

  .backup-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .backup-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .backup-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
    text-transform: capitalize;
  }

  .backup-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .backup-primary-button {
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

  .backup-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .backup-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .backup-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .backup-metric strong {
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .backup-section {
    margin-top: 1.3rem;
  }

  .backup-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .backup-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .backup-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .backup-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .backup-schedule-card {
    padding: 0.85rem;
  }

  .backup-schedule-card select {
    width: 100%;
    min-height: 2.7rem;
    padding: 0.6rem 0.7rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.75rem;
    outline: 0;
    color: #edf2ff;
    background: #171d30;
    font-size: 0.75rem;
  }

  .backup-action-row,
  .backup-history-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .backup-action-row + .backup-action-row,
  .backup-history-row + .backup-history-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .backup-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .backup-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .backup-action-icon,
  .backup-history-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .backup-action-row > span,
  .backup-history-row > div:nth-child(2) {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .backup-action-row strong,
  .backup-history-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .backup-action-row small,
  .backup-history-row span {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .backup-action-row > svg {
    color: #7483a1;
  }

  .backup-action-row.is-danger
    .backup-action-icon {
    color: #ff9bb4;
    background: rgba(255,91,132,0.1);
  }

  .backup-history-row {
    min-height: 4rem;
  }

  .backup-small-button {
    min-height: 2rem;
    padding: 0.45rem 0.6rem;
    border: 1px solid rgba(77,215,255,0.2);
    border-radius: 0.65rem;
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
    font-size: 0.65rem;
    font-weight: 850;
    cursor: pointer;
  }

  .backup-delete-button {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,91,132,0.2);
    border-radius: 0.65rem;
    color: #ffb6c8;
    background: rgba(255,91,132,0.08);
    cursor: pointer;
  }

  .backup-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .backup-preview-card {
    display: grid;
    gap: 0.65rem;
    padding: 1rem;
    border-radius: 1.1rem;
  }

  .backup-preview-card strong {
    color: #edf2ff;
    font-size: 0.82rem;
  }

  .backup-preview-card span {
    color: #8491ad;
    font-size: 0.7rem;
  }

  .backup-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .backup-loading-header,
  .backup-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: backup-skeleton 1.4s infinite;
  }

  .backup-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .backup-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  .backup-spin {
    animation: backup-spin 0.9s linear infinite;
  }

  @keyframes backup-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes backup-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .backup-metric-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .backup-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .backup-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .backup-primary-button {
      margin-left: auto;
    }
  }
`;