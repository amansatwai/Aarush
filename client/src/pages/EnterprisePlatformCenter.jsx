import { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Download,
  Package,
  RefreshCw,
  Shield,
  Store,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useEnterprisePlatform from '../hooks/useEnterprisePlatform';
import {
  createSDKApplication,
  exportSDKReport,
} from '../utils/sdkPlatformEngine';
import {
  getPluginMarketplace,
  installPlugin,
  registerPlugin,
} from '../utils/pluginEcosystemEngine';

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
      className="platform-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="platform-action-icon">
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

export default function EnterprisePlatformCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    sdk,
    plugins,
    loading,
    error,
    refresh,
  } = useEnterprisePlatform();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');
  const [marketplace, setMarketplace] =
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
          'Unable to complete platform action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const createSDKApp = () => {
    if (guest) {
      navigate('/login');
      return;
    }

    runAction(
      () =>
        createSDKApplication({
          name: 'New Aarush SDK app',
          sdk_type: 'JavaScript SDK',
          scopes: ['read'],
        }),
      'SDK application created.'
    );
  };

  const publishPlugin = () => {
    if (guest) {
      navigate('/login');
      return;
    }

    runAction(
      () =>
        registerPlugin({
          name: 'New Aarush plugin',
          category: 'Productivity',
          version: '0.1.0',
        }),
      'Plugin draft registered.'
    );
  };

  const loadMarketplace = async () => {
    try {
      setBusy(true);
      setMarketplace(
        await getPluginMarketplace()
      );
      setNotice('Plugin marketplace loaded.');
    } catch (marketplaceError) {
      setActionError(
        marketplaceError?.message ||
          'Unable to load plugin marketplace.'
      );
    } finally {
      setBusy(false);
    }
  };

  const exportReport = async () => {
    if (guest) {
      setActionError(
        'Guests cannot export enterprise reports.'
      );
      return;
    }

    await runAction(
      exportSDKReport,
      'Platform report exported.'
    );
  };

  if (loading) {
    return (
      <div className="social-page enterprise-platform-page">
        <TopBar />

        <main className="enterprise-platform-content">
          <div className="enterprise-platform-loading-header" />
          <div className="enterprise-platform-loading-card" />
          <div className="enterprise-platform-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page enterprise-platform-page">
      <TopBar />

      <main className="enterprise-platform-content">
        <header className="enterprise-platform-header">
          <button
            type="button"
            className="enterprise-platform-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="enterprise-platform-eyebrow">
              SaaS ecosystem
            </p>
            <h1>Enterprise Platform</h1>
          </div>

          <button
            type="button"
            className="enterprise-platform-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh platform"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="enterprise-platform-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="enterprise-platform-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="enterprise-platform-status-card">
          <div className="enterprise-platform-status-icon">
            <Code2 size={27} />
          </div>

          <div className="enterprise-platform-status-copy">
            <p>Platform status</p>
            <h2>
              {guest
                ? 'Browse-only mode'
                : 'Ecosystem operational'}
            </h2>
            <span>
              {sdk?.applications?.length || 0} SDK apps
              {' · '}
              {plugins?.installed?.length || 0} installed plugins
            </span>
          </div>

          <button
            type="button"
            className="enterprise-platform-primary-button"
            onClick={createSDKApp}
            disabled={guest || busy}
          >
            <Code2 size={15} />
            SDK app
          </button>
        </section>

        <section className="enterprise-platform-metric-grid">
          <article className="enterprise-platform-metric">
            <Code2 size={18} />
            <span>SDK apps</span>
            <strong>
              {sdk?.analytics?.applications || 0}
            </strong>
          </article>

          <article className="enterprise-platform-metric">
            <Package size={18} />
            <span>Plugins</span>
            <strong>
              {plugins?.analytics?.installations || 0}
            </strong>
          </article>

          <article className="enterprise-platform-metric">
            <Users size={18} />
            <span>Tenants</span>
            <strong>
              {plugins?.analytics?.active_tenants || 0}
            </strong>
          </article>

          <article className="enterprise-platform-metric">
            <Shield size={18} />
            <span>Health</span>
            <strong>
              {plugins?.analytics?.ecosystem_health ||
                'Stable'}
            </strong>
          </article>
        </section>

        <section className="enterprise-platform-section">
          <div className="enterprise-platform-section-heading">
            <Code2 size={17} />
            <div>
              <h2>SDK applications</h2>
              <p>
                JavaScript, React, React Native, server, mobile, and CLI preparation.
              </p>
            </div>
          </div>

          <div className="enterprise-platform-card">
            <ActionRow
              icon={<Code2 size={18} />}
              title="Create SDK app"
              description="Register a new developer SDK application."
              onClick={createSDKApp}
              disabled={guest || busy}
            />

            {sdk?.applications?.map((application) => (
              <article
                className="enterprise-platform-list-row"
                key={application.id}
              >
                <div>
                  <strong>{application.name}</strong>
                  <span>
                    {application.sdk_type}
                    {' · '}
                    {application.status}
                  </span>
                </div>
              </article>
            ))}

            <ActionRow
              icon={<Download size={18} />}
              title="Export platform report"
              description="Download SDK, usage, and ecosystem analytics."
              onClick={exportReport}
              disabled={guest || busy}
            />
          </div>
        </section>

        <section className="enterprise-platform-section">
          <div className="enterprise-platform-section-heading">
            <Package size={17} />
            <div>
              <h2>Plugin marketplace</h2>
              <p>
                Discover productivity, security, AI, media, business, and integration plugins.
              </p>
            </div>
          </div>

          <div className="enterprise-platform-card">
            <ActionRow
              icon={<Store size={18} />}
              title="Load plugin marketplace"
              description="View published extensions available for installation."
              onClick={loadMarketplace}
              disabled={busy}
            />

            <ActionRow
              icon={<PlusIcon />}
              title="Publish plugin"
              description="Register a plugin for approval and review."
              onClick={publishPlugin}
              disabled={guest || busy}
            />

            {marketplace.map((plugin) => (
              <article
                className="enterprise-platform-list-row"
                key={plugin.id}
              >
                <div>
                  <strong>{plugin.name}</strong>
                  <span>
                    {plugin.category}
                    {' · '}
                    v{plugin.version}
                  </span>
                </div>

                <button
                  type="button"
                  className="enterprise-platform-small-button"
                  onClick={() =>
                    runAction(
                      () => installPlugin(plugin.id),
                      'Plugin installation prepared.'
                    )
                  }
                  disabled={guest || busy}
                >
                  Install
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="enterprise-platform-section">
          <div className="enterprise-platform-section-heading">
            <Store size={17} />
            <div>
              <h2>Multi-tenant architecture</h2>
              <p>
                Prepare isolated organizations, workspaces, storage, billing, analytics, and APIs.
              </p>
            </div>
          </div>

          <div className="enterprise-platform-feature-grid">
            {[
              'Isolated organizations',
              'Isolated workspaces',
              'Tenant switching',
              'Tenant governance',
              'Isolated storage',
              'Isolated analytics',
              'Billing placeholders',
              'Custom branding',
              'Custom domains',
              'Regional branding',
              'Enterprise themes',
              'Tenant permissions',
            ].map((feature) => (
              <div
                className="enterprise-platform-feature"
                key={feature}
              >
                <Check size={15} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="enterprise-platform-section">
          <div className="enterprise-platform-section-heading">
            <Shield size={17} />
            <div>
              <h2>Platform governance</h2>
              <p>
                Prepare approval, security review, compliance review, dependencies, and moderation.
              </p>
            </div>
          </div>

          <div className="enterprise-platform-card">
            <ActionRow
              icon={<Shield size={18} />}
              title="Plugin approval"
              description="Review plugin security, policy, and dependency requirements."
              onClick={() =>
                setNotice(
                  'Plugin approval workflow is prepared.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Code2 size={18} />}
              title="SDK governance"
              description="Review API versioning, application approval, and ecosystem policy."
              onClick={() =>
                navigate('/developer-platform')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Users size={18} />}
              title="Manage tenants"
              description="Open enterprise identity and workspace governance."
              onClick={() =>
                navigate('/enterprise-identity')
              }
              disabled={busy}
            />
          </div>
        </section>

        <p className="enterprise-platform-footer">
          Guests can browse SDKs and plugins. Publishing,
          installing, tenant management, credentials, and
          enterprise governance require authentication and
          server-side authorization.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

function PlusIcon() {
  return <Package size={18} />;
}

const styles = `
  .enterprise-platform-page {
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

  .enterprise-platform-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .enterprise-platform-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .enterprise-platform-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .enterprise-platform-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .enterprise-platform-icon-button {
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

  .enterprise-platform-icon-button:last-child {
    justify-self: end;
  }

  .enterprise-platform-error,
  .enterprise-platform-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .enterprise-platform-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .enterprise-platform-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .enterprise-platform-status-card,
  .enterprise-platform-card,
  .enterprise-platform-metric,
  .enterprise-platform-feature {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .enterprise-platform-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .enterprise-platform-status-icon {
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

  .enterprise-platform-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .enterprise-platform-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .enterprise-platform-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .enterprise-platform-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .enterprise-platform-primary-button {
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

  .enterprise-platform-primary-button:disabled,
  .enterprise-platform-small-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .enterprise-platform-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .enterprise-platform-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .enterprise-platform-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .enterprise-platform-metric strong {
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .enterprise-platform-section {
    margin-top: 1.3rem;
  }

  .enterprise-platform-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .enterprise-platform-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .enterprise-platform-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .enterprise-platform-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .enterprise-platform-action-row {
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

  .enterprise-platform-action-row + .enterprise-platform-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .enterprise-platform-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .enterprise-platform-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .enterprise-platform-action-row > span,
  .enterprise-platform-list-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .enterprise-platform-action-row strong,
  .enterprise-platform-list-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .enterprise-platform-action-row small,
  .enterprise-platform-list-row span {
    overflow: hidden;
    color: #8491ad;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.68rem;
  }

  .enterprise-platform-list-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 3.9rem;
    padding: 0.7rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .enterprise-platform-small-button {
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

  .enterprise-platform-feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
  }

  .enterprise-platform-feature {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 3rem;
    padding: 0.7rem;
    border-radius: 0.9rem;
    color: #c9f9ff;
    font-size: 0.68rem;
  }

  .enterprise-platform-feature span {
    color: #dce5f7;
  }

  .enterprise-platform-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .enterprise-platform-loading-header,
  .enterprise-platform-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: enterprise-platform-skeleton 1.4s infinite;
  }

  .enterprise-platform-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .enterprise-platform-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes enterprise-platform-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 720px) {
    .enterprise-platform-metric-grid,
    .enterprise-platform-feature-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .enterprise-platform-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .enterprise-platform-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .enterprise-platform-primary-button {
      margin-left: auto;
    }
  }
`;