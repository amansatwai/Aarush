import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Laptop,
  RefreshCw,
  Smartphone,
  Tablet,
  Trash2,
  UserPlus,
  Wifi,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useMultiDeviceSync from '../hooks/useMultiDeviceSync';
import {
  connectDevice,
  disconnectDevice,
  transferSessionToDevice,
} from '../utils/multiDeviceEngine';
import {
  previewConflict,
  resolveAndSaveConflict,
} from '../utils/conflictResolutionEngine';

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

function DeviceIcon({ type }) {
  if (/phone|android|iphone/i.test(type)) {
    return <Smartphone size={20} />;
  }

  if (/tablet/i.test(type)) {
    return <Tablet size={20} />;
  }

  return <Laptop size={20} />;
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
          ? 'device-action-row is-danger'
          : 'device-action-row'
      }
      onClick={onClick}
      disabled={disabled}
    >
      <div className="device-action-icon">
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

export default function DevicesCenter() {
  const navigate = useNavigate();

  const {
    devices,
    conflicts,
    status,
    loading,
    error,
    syncAll,
    refresh,
  } = useMultiDeviceSync();

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
          'Unable to complete device action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleConnect = async () => {
    const deviceId = window.prompt(
      'Enter the device ID to connect:'
    );

    if (!deviceId) return;

    await runAction(
      () =>
        connectDevice({
          deviceId,
          name: 'Connected device',
          deviceType: 'Web Browser',
        }),
      'Device connection created.'
    );
  };

  const handleTransfer = async (device) => {
    await runAction(
      () =>
        transferSessionToDevice(
          device.device_id
        ),
      'Device transfer started.'
    );
  };

  const handleConflict = async (conflict) => {
    try {
      setBusy(true);

      const preview = previewConflict(
        {
          local: conflict.local_data,
          remote: conflict.remote_data,
          fields: conflict.changed_fields || [],
          conflict: true,
        },
        'newest-wins'
      );

      await resolveAndSaveConflict(
        {
          local: conflict.local_data,
          remote: conflict.remote_data,
          fields: conflict.changed_fields || [],
          conflict: true,
        },
        conflict.category,
        'newest-wins'
      );

      setNotice(
        `Conflict resolved using newest-wins.`
      );

      return preview;
    } catch (conflictError) {
      setActionError(
        conflictError?.message ||
          'Unable to resolve conflict.'
      );
      return null;
    } finally {
      setBusy(false);
      await refresh();
    }
  };

  if (loading) {
    return (
      <div className="social-page devices-center-page">
        <TopBar />

        <main className="devices-content">
          <div className="devices-loading-header" />
          <div className="devices-loading-card" />
          <div className="devices-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page devices-center-page">
      <TopBar />

      <main className="devices-content">
        <header className="devices-header">
          <button
            type="button"
            className="devices-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="devices-eyebrow">
              Continuity
            </p>
            <h1>Devices Center</h1>
          </div>

          <button
            type="button"
            className="devices-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh devices"
          >
            <RefreshCw
              size={18}
              className={
                busy ? 'devices-spin' : undefined
              }
            />
          </button>
        </header>

        {error || actionError ? (
          <div className="devices-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="devices-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="devices-status-card">
          <div className="devices-status-icon">
            <Wifi size={27} />
          </div>

          <div className="devices-status-copy">
            <p>Sync status</p>
            <h2>{status}</h2>
            <span>
              {devices.length} connected devices
            </span>
          </div>

          <button
            type="button"
            className="devices-primary-button"
            onClick={() =>
              runAction(
                syncAll,
                'All devices synchronized.'
              )
            }
            disabled={busy}
          >
            <RefreshCw size={15} />
            Sync all
          </button>
        </section>

        <section className="devices-section">
          <div className="devices-section-heading">
            <Smartphone size={17} />
            <div>
              <h2>Connected devices</h2>
              <p>
                Manage continuity across phones, laptops, and browsers.
              </p>
            </div>
          </div>

          <div className="devices-card">
            {devices.length === 0 ? (
              <div className="devices-empty">
                <Smartphone size={24} />
                <span>No connected devices.</span>
              </div>
            ) : (
              devices.map((device) => (
                <article
                  className="device-row"
                  key={
                    device.device_id || device.id
                  }
                >
                  <div className="device-type-icon">
                    <DeviceIcon
                      type={
                        device.device_type || ''
                      }
                    />
                  </div>

                  <div className="device-copy">
                    <strong>
                      {device.name ||
                        device.device_type ||
                        'Connected device'}
                    </strong>

                    <span>
                      {device.status || 'pending'}
                      {' · '}
                      {device.is_trusted
                        ? 'Trusted'
                        : 'Untrusted'}
                    </span>

                    <small>
                      Last active{' '}
                      {formatDate(
                        device.last_activity_at
                      )}
                    </small>
                  </div>

                  <div className="device-actions">
                    <button
                      type="button"
                      className="device-transfer-button"
                      onClick={() =>
                        handleTransfer(device)
                      }
                      disabled={busy}
                    >
                      Transfer
                    </button>

                    <button
                      type="button"
                      className="device-remove-button"
                      onClick={() =>
                        runAction(
                          () =>
                            disconnectDevice(
                              device.device_id
                            ),
                          'Device disconnected.'
                        )
                      }
                      disabled={busy}
                      aria-label="Disconnect device"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="devices-section">
          <div className="devices-section-heading">
            <UserPlus size={17} />
            <div>
              <h2>Device migration</h2>
              <p>
                Transfer continuity to another trusted device.
              </p>
            </div>
          </div>

          <div className="devices-card">
            <ActionRow
              icon={<UserPlus size={18} />}
              title="Connect new device"
              description="Add a phone, tablet, laptop, or browser."
              onClick={handleConnect}
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Start device migration"
              description="Prepare encrypted state transfer with verification."
              onClick={handleConnect}
              disabled={busy}
            />
          </div>
        </section>

        <section className="devices-section">
          <div className="devices-section-heading">
            <AlertTriangle size={17} />
            <div>
              <h2>Conflict resolution</h2>
              <p>
                Review state conflicts before applying changes.
              </p>
            </div>
          </div>

          <div className="devices-card">
            {conflicts.length === 0 ? (
              <div className="devices-empty">
                <Check size={23} />
                <span>No unresolved conflicts.</span>
              </div>
            ) : (
              conflicts.map((conflict) => (
                <article
                  className="conflict-row"
                  key={conflict.id}
                >
                  <div>
                    <strong>
                      {conflict.category}
                    </strong>
                    <span>
                      {conflict.status}
                      {' · '}
                      {formatDate(conflict.created_at)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="device-transfer-button"
                    onClick={() =>
                      handleConflict(conflict)
                    }
                    disabled={busy}
                  >
                    Resolve
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="devices-section">
          <div className="devices-section-heading">
            <Laptop size={17} />
            <div>
              <h2>Cross-platform continuity</h2>
              <p>
                Sync profile, chats, posts, stories, settings, and security state.
              </p>
            </div>
          </div>

          <div className="devices-feature-grid">
            {[
              'Profile state',
              'Chat continuity',
              'Posts and stories',
              'Privacy settings',
              'Security state',
              'Offline queue',
            ].map((feature) => (
              <div
                className="devices-feature"
                key={feature}
              >
                <Check size={15} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="devices-footer">
          Guest mode supports local device continuity only.
          Cloud device synchronization requires an
          authenticated Aarush account.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .devices-center-page {
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

  .devices-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .devices-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .devices-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .devices-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .devices-icon-button {
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

  .devices-icon-button:last-child {
    justify-self: end;
  }

  .devices-icon-button:disabled,
  .devices-primary-button:disabled,
  .device-transfer-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .devices-error,
  .devices-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .devices-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .devices-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .devices-status-card,
  .devices-card,
  .devices-metric,
  .devices-feature {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .devices-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .devices-status-icon {
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

  .devices-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .devices-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .devices-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
    text-transform: capitalize;
  }

  .devices-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .devices-primary-button {
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

  .devices-section {
    margin-top: 1.3rem;
  }

  .devices-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .devices-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .devices-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .devices-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .device-row,
  .conflict-row,
  .device-action-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .device-row + .device-row,
  .conflict-row + .conflict-row,
  .device-action-row + .device-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .device-type-icon,
  .device-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .device-copy,
  .conflict-row > div:first-child,
  .device-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .device-copy strong,
  .conflict-row strong,
  .device-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .device-copy span,
  .conflict-row span,
  .device-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .device-copy small {
    color: #63708b;
    font-size: 0.63rem;
  }

  .device-actions {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .device-transfer-button {
    min-height: 2.1rem;
    padding: 0.5rem 0.6rem;
    border: 1px solid rgba(77,215,255,0.22);
    border-radius: 0.65rem;
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
    font-size: 0.65rem;
    font-weight: 850;
    cursor: pointer;
  }

  .device-remove-button {
    width: 2.1rem;
    height: 2.1rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,91,132,0.2);
    border-radius: 0.65rem;
    color: #ffb6c8;
    background: rgba(255,91,132,0.08);
    cursor: pointer;
  }

  .device-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .device-action-row > svg {
    color: #7483a1;
  }

  .device-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .devices-feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
  }

  .devices-feature {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 3rem;
    padding: 0.7rem;
    border-radius: 0.9rem;
    color: #c9f9ff;
    font-size: 0.68rem;
  }

  .devices-feature span {
    color: #dce5f7;
  }

  .devices-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .devices-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .devices-loading-header,
  .devices-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: devices-skeleton 1.4s infinite;
  }

  .devices-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .devices-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  .devices-spin {
    animation: devices-spin 0.9s linear infinite;
  }

  @keyframes devices-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes devices-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 720px) {
    .devices-feature-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .devices-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .devices-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .devices-primary-button {
      margin-left: auto;
    }

    .device-row {
      align-items: flex-start;
    }

    .device-actions {
      flex-direction: column;
    }
  }
`;