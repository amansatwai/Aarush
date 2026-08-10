import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Download,
  KeyRound,
  Lock,
  RefreshCw,
  Shield,
  Smartphone,
  Trash2,
  Upload,
  Verified,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useEncryptionStatus from '../hooks/useEncryptionStatus';
import {
  backupEncryptedKeys,
  restoreEncryptedKeys,
} from '../utils/keyManagementEngine';

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
          ? 'encryption-action-row is-danger'
          : 'encryption-action-row'
      }
      onClick={onClick}
      disabled={disabled}
    >
      <div className="encryption-action-icon">
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

export default function EncryptionCenter() {
  const navigate = useNavigate();

  const {
    enabled,
    initialized,
    deviceVerified,
    keysAvailable,
    encryptionStrength,
    loading,
    error,
    initialize,
    rotateKeys,
    revokeKeys,
    verify,
  } = useEncryptionStatus();

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
    } catch (actionException) {
      setActionError(
        actionException?.message ||
          'Unable to complete encryption action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleBackup = async () => {
    const password = window.prompt(
      'Create a password for your encrypted key backup:'
    );

    if (!password) return;

    try {
      setBusy(true);
      const backup =
        await backupEncryptedKeys(password);

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        {
          type: 'application/json',
        }
      );

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = 'aarush-encrypted-key-backup.json';
      anchor.click();

      URL.revokeObjectURL(url);
      setNotice('Encrypted key backup exported.');
    } catch (backupError) {
      setActionError(
        backupError?.message ||
          'Unable to create encrypted backup.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = () => {
      const file = input.files?.[0];

      if (!file) return;

      const password = window.prompt(
        'Enter your backup password:'
      );

      if (!password) return;

      file.text()
        .then((text) =>
          JSON.parse(text)
        )
        .then(async (backup) => {
          const {
            restoreEncryptedKeys,
          } = await import(
            '../utils/keyManagementEngine'
          );

          await restoreEncryptedKeys(
            backup,
            password
          );

          setNotice(
            'Backup verified. Local key restoration is ready for the next key-management step.'
          );
        })
        .catch((restoreError) => {
          setActionError(
            restoreError?.message ||
              'Unable to restore encrypted backup.'
          );
        });
    };

    input.click();
  };

  if (loading) {
    return (
      <div className="social-page encryption-page">
        <TopBar />

        <main className="encryption-content">
          <div className="encryption-loading-header" />
          <div className="encryption-loading-card" />
          <div className="encryption-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  const statusLabel = enabled
    ? encryptionStrength
    : 'Disabled';

  return (
    <div className="social-page encryption-page">
      <TopBar />

      <main className="encryption-content">
        <header className="encryption-header">
          <button
            type="button"
            className="encryption-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="encryption-eyebrow">
              Private by design
            </p>
            <h1>Encryption Center</h1>
          </div>

          <button
            type="button"
            className="encryption-icon-button"
            onClick={() => verify()}
            disabled={busy}
            aria-label="Verify encryption"
          >
            <RefreshCw
              size={18}
              className={
                busy
                  ? 'encryption-spin'
                  : undefined
              }
            />
          </button>
        </header>

        {error || actionError ? (
          <div className="encryption-error">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="encryption-notice">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="encryption-status-card">
          <div className="encryption-status-icon">
            {deviceVerified ? (
              <Verified size={28} />
            ) : (
              <Lock size={28} />
            )}
          </div>

          <div className="encryption-status-copy">
            <p>Encryption status</p>
            <h2>{statusLabel}</h2>
            <span>
              {deviceVerified
                ? 'Your identity and device keys are verified.'
                : initialized
                  ? 'Keys are initialized but device verification is pending.'
                  : 'Encryption has not been initialized.'}
            </span>
          </div>

          {!initialized ? (
            <button
              type="button"
              className="encryption-primary-button"
              onClick={() =>
                runAction(
                  initialize,
                  'Encryption initialized.'
                )
              }
              disabled={busy}
            >
              Initialize
            </button>
          ) : (
            <button
              type="button"
              className="encryption-primary-button"
              onClick={() =>
                runAction(
                  verify,
                  'Encryption integrity verified.'
                )
              }
              disabled={busy}
            >
              Verify
            </button>
          )}
        </section>

        <section className="encryption-section">
          <div className="encryption-section-heading">
            <KeyRound size={17} />
            <div>
              <h2>Key status</h2>
              <p>
                Private keys stay in protected browser storage.
              </p>
            </div>
          </div>

          <div className="encryption-card">
            <div className="encryption-info-row">
              <div className="encryption-action-icon">
                <KeyRound size={18} />
              </div>

              <span>
                <strong>Identity key</strong>
                <small>
                  {keysAvailable
                    ? 'Available on this device'
                    : 'Not initialized'}
                </small>
              </span>

              {keysAvailable ? (
                <Check size={18} color="#55e6a5" />
              ) : (
                <AlertTriangle
                  size={18}
                  color="#ffd166"
                />
              )}
            </div>

            <div className="encryption-info-row">
              <div className="encryption-action-icon">
                <Smartphone size={18} />
              </div>

              <span>
                <strong>Device key</strong>
                <small>
                  {keysAvailable
                    ? 'Device-specific key available'
                    : 'Not initialized'}
                </small>
              </span>

              {keysAvailable ? (
                <Check size={18} color="#55e6a5" />
              ) : (
                <AlertTriangle
                  size={18}
                  color="#ffd166"
                />
              )}
            </div>

            <div className="encryption-info-row">
              <div className="encryption-action-icon">
                <Shield size={18} />
              </div>

              <span>
                <strong>Conversation keys</strong>
                <small>
                  Generated lazily per encrypted conversation
                </small>
              </span>

              <ChevronRight size={18} />
            </div>
          </div>
        </section>

        <section className="encryption-section">
          <div className="encryption-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Key rotation</h2>
              <p>
                Rotate keys after device or account changes.
              </p>
            </div>
          </div>

          <div className="encryption-card">
            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Rotate encryption keys"
              description="Generate fresh identity and device keys."
              onClick={() =>
                runAction(
                  rotateKeys,
                  'Encryption keys rotated.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Upload size={18} />}
              title="Backup encrypted keys"
              description="Export a password-protected key backup."
              onClick={handleBackup}
              disabled={busy || !keysAvailable}
            />

            <ActionRow
              icon={<Download size={18} />}
              title="Restore encrypted keys"
              description="Verify a protected key backup file."
              onClick={handleRestore}
              disabled={busy}
            />
          </div>
        </section>

        <section className="encryption-section">
          <div className="encryption-section-heading">
            <Cloud size={17} />
            <div>
              <h2>Future-ready protection</h2>
              <p>
                Architecture prepared for stronger protocols.
              </p>
            </div>
          </div>

          <div className="encryption-feature-grid">
            {[
              'Signal Protocol',
              'Double Ratchet',
              'Forward Secrecy',
              'Post-Compromise Security',
              'Encrypted group chats',
              'Encrypted cloud backup',
            ].map((feature) => (
              <div
                className="encryption-feature"
                key={feature}
              >
                <Check size={15} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="encryption-section">
          <div className="encryption-section-heading">
            <Shield size={17} />
            <div>
              <h2>Emergency actions</h2>
              <p>
                Destroy local keys if this device is compromised.
              </p>
            </div>
          </div>

          <div className="encryption-card">
            <ActionRow
              icon={<Trash2 size={18} />}
              title="Destroy local keys"
              description="Remove encryption keys from this browser."
              onClick={() => {
                const confirmed = window.confirm(
                  'Destroy all local encryption keys? Encrypted conversations may become unreadable on this device.'
                );

                if (confirmed) {
                  runAction(
                    revokeKeys,
                    'Local encryption keys destroyed.'
                  );
                }
              }}
              danger
              disabled={busy}
            />
          </div>
        </section>

        <p className="encryption-footer">
          Aarush never sends private keys to React state,
          logs, or unencrypted storage. This foundation is
          prepared for full Signal Protocol integration.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .encryption-page {
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

  .encryption-content {
    width: min(100%, 820px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .encryption-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .encryption-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .encryption-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .encryption-icon-button {
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

  .encryption-icon-button:last-child {
    justify-self: end;
  }

  .encryption-icon-button:disabled,
  .encryption-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .encryption-error,
  .encryption-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .encryption-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .encryption-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .encryption-status-card,
  .encryption-card,
  .encryption-feature {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .encryption-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .encryption-status-icon {
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

  .encryption-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .encryption-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .encryption-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .encryption-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .encryption-primary-button {
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

  .encryption-section {
    margin-top: 1.3rem;
  }

  .encryption-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .encryption-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .encryption-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .encryption-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .encryption-info-row,
  .encryption-action-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .encryption-info-row + .encryption-info-row,
  .encryption-action-row + .encryption-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .encryption-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .encryption-info-row > span,
  .encryption-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .encryption-info-row strong,
  .encryption-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .encryption-info-row small,
  .encryption-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .encryption-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .encryption-action-row > svg {
    color: #7483a1;
  }

  .encryption-action-row.is-danger
    .encryption-action-icon {
    color: #ff9bb4;
    background: rgba(255,91,132,0.1);
  }

  .encryption-feature-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.55rem;
  }

  .encryption-feature {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 3.1rem;
    padding: 0.7rem;
    border-radius: 0.9rem;
    color: #c9f9ff;
    font-size: 0.7rem;
  }

  .encryption-feature span {
    color: #dce5f7;
  }

  .encryption-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .encryption-loading-header,
  .encryption-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: encryption-skeleton 1.4s infinite;
  }

  .encryption-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .encryption-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  .encryption-spin {
    animation: encryption-spin 0.9s linear infinite;
  }

  @keyframes encryption-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes encryption-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 560px) {
    .encryption-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .encryption-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .encryption-primary-button {
      margin-left: auto;
    }
  }
`;