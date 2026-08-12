import { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Link2,
  RefreshCw,
  Send,
  Webhook,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useIntegrations from '../hooks/useIntegrations';
import {
  AVAILABLE_INTEGRATIONS,
  connectIntegration,
  disconnectIntegration,
  testIntegration,
} from '../utils/integrationEngine';
import {
  createWebhookAutomation,
  triggerWebhookAutomation,
  WEBHOOK_EVENTS,
} from '../utils/webhookAutomationEngine';

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
      className="integration-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="integration-action-icon">
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

export default function IntegrationCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    connections,
    integrationStatus,
    webhookStatus,
    history,
    loading,
    error,
    refresh,
  } = useIntegrations();

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
          'Unable to complete integration action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const connect = (provider) => {
    if (guest) {
      navigate('/login');
      return;
    }

    runAction(
      () =>
        connectIntegration({
          provider,
          name: provider,
          config: {
            oauth_ready: true,
          },
        }),
      `${provider} connection created.`
    );
  };

  const createAutomation = () => {
    if (guest) {
      navigate('/login');
      return;
    }

    runAction(
      () =>
        createWebhookAutomation({
          name: 'Security alert workflow',
          event: 'security.alert',
          endpoint:
            'https://example.com/webhooks/aarush',
          actions: ['notify_user', 'log_event'],
        }),
      'Webhook automation created.'
    );
  };

  if (loading) {
    return (
      <div className="social-page integration-page">
        <TopBar />

        <main className="integration-content">
          <div className="integration-loading-header" />
          <div className="integration-loading-card" />
          <div className="integration-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page integration-page">
      <TopBar />

      <main className="integration-content">
        <header className="integration-header">
          <button
            type="button"
            className="integration-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="integration-eyebrow">
              Enterprise workflows
            </p>
            <h1>Integration Center</h1>
          </div>

          <button
            type="button"
            className="integration-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh integrations"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="integration-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="integration-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="integration-status-card">
          <div className="integration-status-icon">
            <Link2 size={27} />
          </div>

          <div className="integration-status-copy">
            <p>Integration status</p>
            <h2>
              {guest
                ? 'Browse-only mode'
                : 'Platform connected'}
            </h2>
            <span>
              {integrationStatus?.connected || 0}{' '}
              connected apps
              {' · '}
              {webhookStatus?.active || 0} active workflows
            </span>
          </div>

          <button
            type="button"
            className="integration-primary-button"
            onClick={() => connect('Custom Webhook')}
            disabled={guest || busy}
          >
            <Link2 size={15} />
            Connect
          </button>
        </section>

        <section className="integration-metric-grid">
          <article className="integration-metric">
            <Link2 size={18} />
            <span>Connections</span>
            <strong>
              {integrationStatus?.connected || 0}
            </strong>
          </article>

          <article className="integration-metric">
            <Webhook size={18} />
            <span>Webhooks</span>
            <strong>
              {integrationStatus?.active_webhooks || 0}
            </strong>
          </article>

          <article className="integration-metric">
            <Zap size={18} />
            <span>Executions</span>
            <strong>
              {webhookStatus?.executions || 0}
            </strong>
          </article>

          <article className="integration-metric">
            <Code2 size={18} />
            <span>Events</span>
            <strong>{history.length}</strong>
          </article>
        </section>

        <section className="integration-section">
          <div className="integration-section-heading">
            <Link2 size={17} />
            <div>
              <h2>Connected apps</h2>
              <p>
                Manage OAuth, API, sync, and enterprise connections.
              </p>
            </div>
          </div>

          <div className="integration-card">
            {connections.length === 0 ? (
              <div className="integration-empty">
                No integrations connected yet.
              </div>
            ) : (
              connections.map((connection) => (
                <article
                  className="integration-list-row"
                  key={connection.id}
                >
                  <div>
                    <strong>
                      {connection.name ||
                        connection.provider}
                    </strong>
                    <span>
                      {connection.provider}
                      {' · '}
                      {connection.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="integration-small-button"
                    onClick={() =>
                      runAction(
                        () =>
                          testIntegration(
                            connection.id
                          ),
                        'Integration test queued.'
                      )
                    }
                    disabled={guest || busy}
                  >
                    Test
                  </button>

                  <button
                    type="button"
                    className="integration-small-button danger"
                    onClick={() =>
                      runAction(
                        () =>
                          disconnectIntegration(
                            connection.id
                          ),
                        'Integration disconnected.'
                      )
                    }
                    disabled={guest || busy}
                  >
                    Disconnect
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="integration-section">
          <div className="integration-section-heading">
            <Code2 size={17} />
            <div>
              <h2>Available integrations</h2>
              <p>
                Connect services when your enterprise workflow is ready.
              </p>
            </div>
          </div>

          <div className="integration-provider-grid">
            {AVAILABLE_INTEGRATIONS.map((provider) => (
              <button
                type="button"
                className="integration-provider"
                onClick={() => connect(provider)}
                disabled={guest || busy}
                key={provider}
              >
                <span>{provider}</span>
                <small>
                  {guest ? 'View only' : 'Connect'}
                </small>
              </button>
            ))}
          </div>
        </section>

        <section className="integration-section">
          <div className="integration-section-heading">
            <Webhook size={17} />
            <div>
              <h2>Webhook automation</h2>
              <p>
                Prepare triggers, conditions, retries, and external actions.
              </p>
            </div>
          </div>

          <div className="integration-card">
            <ActionRow
              icon={<Webhook size={18} />}
              title="Create webhook automation"
              description="Create a security-alert workflow."
              onClick={createAutomation}
              disabled={guest || busy}
            />

            <ActionRow
              icon={<Send size={18} />}
              title="Test workflow"
              description="Prepare a test event delivery."
              onClick={() =>
                setNotice(
                  'Select a workflow to trigger a test delivery.'
                )
              }
              disabled={guest || busy}
            />

            {WEBHOOK_EVENTS.slice(0, 8).map((event) => (
              <div
                className="integration-event-row"
                key={event}
              >
                <Check size={15} />
                <span>{event}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="integration-section">
          <div className="integration-section-heading">
            <Zap size={17} />
            <div>
              <h2>Enterprise connectors</h2>
              <p>
                Prepare CRM, ERP, accounting, analytics, support, and identity integrations.
              </p>
            </div>
          </div>

          <div className="integration-feature-grid">
            {[
              'CRM systems',
              'ERP systems',
              'Accounting',
              'Analytics platforms',
              'Marketing platforms',
              'Customer support',
              'Cloud storage',
              'Identity providers',
              'Enterprise messaging',
              'Custom webhooks',
            ].map((feature) => (
              <div
                className="integration-feature"
                key={feature}
              >
                <Check size={15} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="integration-footer">
          Guests can view available integrations. OAuth,
          API keys, connections, webhooks, and workflow
          execution require authentication and server-side
          authorization.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .integration-page {
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

  .integration-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .integration-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .integration-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .integration-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .integration-icon-button {
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

  .integration-icon-button:last-child {
    justify-self: end;
  }

  .integration-error,
  .integration-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .integration-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .integration-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .integration-status-card,
  .integration-card,
  .integration-metric,
  .integration-provider,
  .integration-feature {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .integration-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .integration-status-icon {
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

  .integration-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .integration-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .integration-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .integration-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .integration-primary-button {
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

  .integration-primary-button:disabled,
  .integration-provider:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .integration-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .integration-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .integration-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .integration-metric strong {
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .integration-section {
    margin-top: 1.3rem;
  }

  .integration-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .integration-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .integration-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .integration-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .integration-action-row {
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

  .integration-action-row + .integration-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .integration-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .integration-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .integration-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .integration-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .integration-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .integration-list-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 3.9rem;
    padding: 0.7rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .integration-list-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .integration-list-row strong {
    color: #edf2ff;
    font-size: 0.76rem;
  }

  .integration-list-row span {
    overflow: hidden;
    color: #8491ad;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.65rem;
  }

  .integration-small-button {
    min-height: 2rem;
    padding: 0.45rem 0.55rem;
    border: 1px solid rgba(77,215,255,0.2);
    border-radius: 0.6rem;
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
    font-size: 0.61rem;
    font-weight: 850;
    cursor: pointer;
  }

  .integration-small-button.danger {
    border-color: rgba(255,91,132,0.2);
    color: #ffb6c8;
    background: rgba(255,91,132,0.08);
  }

  .integration-provider-grid,
  .integration-feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
  }

  .integration-provider {
    display: grid;
    gap: 0.3rem;
    min-height: 4.1rem;
    padding: 0.7rem;
    border-radius: 0.85rem;
    color: #edf2ff;
    text-align: left;
    cursor: pointer;
  }

  .integration-provider span {
    font-size: 0.7rem;
  }

  .integration-provider small {
    color: #55e6a5;
    font-size: 0.62rem;
  }

  .integration-event-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 2.8rem;
    padding: 0.6rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
    color: #dce5f7;
    font-size: 0.68rem;
  }

  .integration-event-row svg {
    color: #55e6a5;
  }

  .integration-feature {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 3rem;
    padding: 0.7rem;
    border-radius: 0.9rem;
    color: #c9f9ff;
    font-size: 0.68rem;
  }

  .integration-feature span {
    color: #dce5f7;
  }

  .integration-empty {
    padding: 1.2rem;
    color: #8491ad;
    font-size: 0.74rem;
    text-align: center;
  }

  .integration-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .integration-loading-header,
  .integration-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: integration-skeleton 1.4s infinite;
  }

  .integration-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .integration-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes integration-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 720px) {
    .integration-metric-grid,
    .integration-provider-grid,
    .integration-feature-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .integration-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .integration-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .integration-primary-button {
      margin-left: auto;
    }

    .integration-list-row {
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }
`;