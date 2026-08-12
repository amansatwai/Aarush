import { useState } from 'react';
import {
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  KeyRound,
  RefreshCw,
  Send,
  Shield,
  Webhook,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useDeveloperPlatform from '../hooks/useDeveloperPlatform';
import {
  createAPIKey,
  createWebhook,
  rotateAPIKey,
  testWebhook,
} from '../utils/apiPlatformEngine';
import {
  generateClientCredentials,
  registerApplication,
} from '../utils/developerPlatformEngine';

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
      className="developer-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="developer-action-icon">
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

export default function DeveloperPlatformCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    platform,
    api,
    profile,
    applications,
    analytics,
    loading,
    error,
    refresh,
  } = useDeveloperPlatform();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');
  const [secret, setSecret] = useState('');

  const runAction = async (
    action,
    message
  ) => {
    try {
      setBusy(true);
      setActionError('');
      const result = await action();
      setNotice(message);
      await refresh();
      return result;
    } catch (actionException) {
      setActionError(
        actionException?.message ||
          'Unable to complete developer action.'
      );
      return null;
    } finally {
      setBusy(false);
    }
  };

  const createKey = async () => {
    if (guest) {
      navigate('/login');
      return;
    }

    const result = await runAction(
      () =>
        createAPIKey({
          name: 'Aarush API key',
          scopes: ['read'],
          tier: 'Free',
        }),
      'API key created.'
    );

    if (result?.secret) {
      setSecret(result.secret);
    }
  };

  const createApp = () => {
    if (guest) {
      navigate('/login');
      return;
    }

    runAction(
      () =>
        registerApplication({
          name: 'New Aarush application',
          scopes: ['read'],
          redirect_uris: [],
        }),
      'Developer application registered.'
    );
  };

  const createHook = () => {
    if (guest) {
      navigate('/login');
      return;
    }

    runAction(
      () =>
        createWebhook({
          name: 'Aarush events webhook',
          endpoint: 'https://example.com/webhooks/aarush',
          events: ['user.events'],
        }),
      'Webhook created.'
    );
  };

  const rotateKey = async () => {
    const key = api?.keys?.[0];

    if (!key) {
      setActionError('Create an API key first.');
      return;
    }

    const result = await runAction(
      () => rotateAPIKey(key.id),
      'API key rotated.'
    );

    if (result?.secret) {
      setSecret(result.secret);
    }
  };

  if (loading) {
    return (
      <div className="social-page developer-page">
        <TopBar />

        <main className="developer-content">
          <div className="developer-loading-header" />
          <div className="developer-loading-card" />
          <div className="developer-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page developer-page">
      <TopBar />

      <main className="developer-content">
        <header className="developer-header">
          <button
            type="button"
            className="developer-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="developer-eyebrow">
              Developer ecosystem
            </p>
            <h1>Developer Platform</h1>
          </div>

          <button
            type="button"
            className="developer-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh developer platform"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="developer-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="developer-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        {secret ? (
          <div className="developer-secret">
            <strong>Copy this secret now</strong>
            <code>{secret}</code>
            <small>
              It will not be shown again.
            </small>
          </div>
        ) : null}

        <section className="developer-status-card">
          <div className="developer-status-icon">
            <Code2 size={27} />
          </div>

          <div className="developer-status-copy">
            <p>Developer status</p>
            <h2>
              {platform?.enabled
                ? profile?.display_name ||
                  'Developer ready'
                : 'Browse-only mode'}
            </h2>
            <span>
              API v{platform?.api_version || '1'}
              {' · '}
              {applications.length} applications
            </span>
          </div>

          <button
            type="button"
            className="developer-primary-button"
            onClick={createKey}
            disabled={guest || busy}
          >
            <KeyRound size={15} />
            API key
          </button>
        </section>

        <section className="developer-metric-grid">
          <article className="developer-metric">
            <Activity size={18} />
            <span>Requests</span>
            <strong>{analytics?.requests || 0}</strong>
          </article>

          <article className="developer-metric">
            <KeyRound size={18} />
            <span>Active keys</span>
            <strong>{api?.active_keys || 0}</strong>
          </article>

          <article className="developer-metric">
            <Webhook size={18} />
            <span>Webhooks</span>
            <strong>{api?.active_webhooks || 0}</strong>
          </article>

          <article className="developer-metric">
            <Shield size={18} />
            <span>Quota</span>
            <strong>
              {analytics?.quota_usage || 0}%
            </strong>
          </article>
        </section>

        <section className="developer-section">
          <div className="developer-section-heading">
            <KeyRound size={17} />
            <div>
              <h2>API keys</h2>
              <p>
                Manage scoped keys, tiers, rotation, and revocation.
              </p>
            </div>
          </div>

          <div className="developer-card">
            <ActionRow
              icon={<KeyRound size={18} />}
              title="Create API key"
              description="Generate a scoped key for REST API access."
              onClick={createKey}
              disabled={guest || busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Rotate API key"
              description="Generate fresh credentials for the first active key."
              onClick={rotateKey}
              disabled={guest || busy}
            />

            {api?.keys?.slice(0, 8).map((key) => (
              <article
                className="developer-list-row"
                key={key.id}
              >
                <div>
                  <strong>{key.name}</strong>
                  <span>
                    {key.tier}
                    {' · '}
                    {key.status}
                    {' · '}
                    {key.key_prefix}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="developer-section">
          <div className="developer-section-heading">
            <Code2 size={17} />
            <div>
              <h2>Applications and OAuth</h2>
              <p>
                Prepare OAuth clients, redirect URIs, scopes, and consent.
              </p>
            </div>
          </div>

          <div className="developer-card">
            <ActionRow
              icon={<Code2 size={18} />}
              title="Register application"
              description="Create a client application for Aarush APIs."
              onClick={createApp}
              disabled={guest || busy}
            />

            {applications.map((application) => (
              <article
                className="developer-list-row"
                key={application.id}
              >
                <div>
                  <strong>{application.name}</strong>
                  <span>
                    {application.status}
                    {' · '}
                    {application.client_id}
                  </span>
                </div>

                <button
                  type="button"
                  className="developer-small-button"
                  onClick={() =>
                    runAction(
                      () =>
                        generateClientCredentials(
                          application.id
                        ),
                      'Client credentials regenerated.'
                    )
                  }
                  disabled={guest || busy}
                >
                  Regenerate
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="developer-section">
          <div className="developer-section-heading">
            <Webhook size={17} />
            <div>
              <h2>Webhooks</h2>
              <p>
                Receive user, post, payment, order, security, and business events.
              </p>
            </div>
          </div>

          <div className="developer-card">
            <ActionRow
              icon={<Webhook size={18} />}
              title="Create webhook"
              description="Register an event delivery endpoint."
              onClick={createHook}
              disabled={guest || busy}
            />

            {api?.webhooks?.map((webhook) => (
              <article
                className="developer-list-row"
                key={webhook.id}
              >
                <div>
                  <strong>{webhook.name}</strong>
                  <span>
                    {webhook.status}
                    {' · '}
                    {webhook.endpoint}
                  </span>
                </div>

                <button
                  type="button"
                  className="developer-small-button"
                  onClick={() =>
                    runAction(
                      () => testWebhook(webhook.id),
                      'Webhook test queued.'
                    )
                  }
                  disabled={guest || busy}
                >
                  Test
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="developer-section">
          <div className="developer-section-heading">
            <Activity size={17} />
            <div>
              <h2>API analytics</h2>
              <p>
                Requests, bandwidth, latency, errors, and quota preparation.
              </p>
            </div>
          </div>

          <div className="developer-analytics-grid">
            {[
              ['Requests', analytics?.requests || 0],
              ['Bandwidth', analytics?.bandwidth || 0],
              ['Webhook deliveries', analytics?.webhook_deliveries || 0],
              ['Error rate', `${analytics?.error_rate || 0}%`],
              ['Latency', `${analytics?.latency || 0}ms`],
              ['Quota usage', `${analytics?.quota_usage || 0}%`],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="developer-section">
          <div className="developer-section-heading">
            <Shield size={17} />
            <div>
              <h2>Enterprise preparation</h2>
              <p>
                Architecture for organizations, service accounts, audit logs, and permissions.
              </p>
            </div>
          </div>

          <div className="developer-feature-grid">
            {[
              'Organization workspaces',
              'Admin APIs',
              'Service accounts',
              'IP allowlists',
              'Advanced permissions',
              'Audit logs',
              'Compliance placeholders',
              'Future SDKs',
            ].map((feature) => (
              <div
                className="developer-feature"
                key={feature}
              >
                <Check size={15} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <p className="developer-footer">
          Guests can view developer platform information.
          API keys, applications, webhooks, credentials,
          and analytics require authentication.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .developer-page {
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

  .developer-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .developer-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .developer-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .developer-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .developer-icon-button {
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

  .developer-icon-button:last-child {
    justify-self: end;
  }

  .developer-error,
  .developer-notice,
  .developer-secret {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .developer-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .developer-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .developer-secret {
    display: grid;
    align-items: start;
    color: #ffdca8;
    border: 1px solid rgba(255,209,102,0.25);
    background: rgba(255,209,102,0.08);
  }

  .developer-secret code {
    overflow-wrap: anywhere;
    color: #fff;
    font-size: 0.72rem;
  }

  .developer-secret small {
    color: #bcae8b;
    font-size: 0.65rem;
  }

  .developer-status-card,
  .developer-card,
  .developer-metric,
  .developer-feature {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .developer-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .developer-status-icon {
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

  .developer-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .developer-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .developer-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .developer-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .developer-primary-button {
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

  .developer-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .developer-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .developer-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .developer-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .developer-metric strong {
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .developer-section {
    margin-top: 1.3rem;
  }

  .developer-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .developer-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .developer-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .developer-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .developer-action-row {
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

  .developer-action-row + .developer-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .developer-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .developer-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .developer-action-row > span,
  .developer-list-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .developer-action-row strong,
  .developer-list-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .developer-action-row small,
  .developer-list-row span {
    overflow: hidden;
    color: #8491ad;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.68rem;
  }

  .developer-list-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 3.9rem;
    padding: 0.7rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .developer-small-button {
    min-height: 2rem;
    padding: 0.45rem 0.6rem;
    border: 1px solid rgba(77,215,255,0.2);
    border-radius: 0.6rem;
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
    font-size: 0.62rem;
    font-weight: 850;
    cursor: pointer;
  }

  .developer-analytics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
  }

  .developer-analytics-grid > div {
    display: grid;
    gap: 0.25rem;
    padding: 0.7rem;
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 0.85rem;
    background: rgba(17,22,36,0.72);
  }

  .developer-analytics-grid span {
    color: #8491ad;
    font-size: 0.63rem;
  }

  .developer-analytics-grid strong {
    color: #edf2ff;
    font-size: 0.72rem;
  }

  .developer-feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
  }

  .developer-feature {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 3rem;
    padding: 0.7rem;
    border-radius: 0.9rem;
    color: #c9f9ff;
    font-size: 0.68rem;
  }

  .developer-feature span {
    color: #dce5f7;
  }

  .developer-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .developer-loading-header,
  .developer-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: developer-skeleton 1.4s infinite;
  }

  .developer-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .developer-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes developer-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 720px) {
    .developer-metric-grid,
    .developer-feature-grid,
    .developer-analytics-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .developer-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .developer-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .developer-primary-button {
      margin-left: auto;
    }
  }
`;