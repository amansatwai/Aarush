import { useState } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Plus,
  RefreshCw,
  Store,
  Users,
  Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useBusinessPlatform from '../hooks/useBusinessPlatform';
import {
  createBusinessWorkspace,
  createStore,
  exportBusinessReport,
} from '../utils/businessPlatformEngine';
import {
  createSupportTicket,
} from '../utils/customerSupportEngine';

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
      className="business-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="business-action-icon">
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

export default function BusinessPlatformCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    workspace,
    stores,
    members,
    analytics,
    tickets,
    support,
    loading,
    error,
    refresh,
  } = useBusinessPlatform();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const guestGuard = () => {
    if (guest) {
      navigate('/login');
      return true;
    }

    return false;
  };

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
          'Unable to complete business action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleWorkspace = () => {
    if (guestGuard()) return;

    runAction(
      () =>
        createBusinessWorkspace({
          name: 'My business workspace',
          category: 'Commerce',
        }),
      'Business workspace created.'
    );
  };

  const handleStore = () => {
    if (guestGuard()) return;

    runAction(
      () =>
        createStore({
          workspaceId: workspace?.id,
          name: 'New store',
          category: 'General',
        }),
      'Store created.'
    );
  };

  const handleTicket = () => {
    if (guestGuard()) return;

    runAction(
      () =>
        createSupportTicket({
          subject: 'New support request',
          description:
            'Add customer support details.',
          channel: 'Chat',
        }),
      'Support ticket created.'
    );
  };

  const handleExport = async () => {
    if (guestGuard()) return;

    try {
      setBusy(true);
      await exportBusinessReport(workspace?.id);
      setNotice('Business report exported.');
    } catch (exportError) {
      setActionError(
        exportError?.message ||
          'Unable to export business report.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="social-page business-page">
        <TopBar />

        <main className="business-content">
          <div className="business-loading-header" />
          <div className="business-loading-card" />
          <div className="business-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page business-page">
      <TopBar />

      <main className="business-content">
        <header className="business-header">
          <button
            type="button"
            className="business-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="business-eyebrow">
              Enterprise commerce
            </p>
            <h1>Business Platform</h1>
          </div>

          <button
            type="button"
            className="business-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh business platform"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="business-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="business-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="business-status-card">
          <div className="business-status-icon">
            <BriefcaseBusiness size={27} />
          </div>

          <div className="business-status-copy">
            <p>Business overview</p>
            <h2>
              {workspace?.name ||
                'Workspace setup ready'}
            </h2>
            <span>
              {stores.length} stores
              {' · '}
              {members.length} team members
            </span>
          </div>

          <button
            type="button"
            className="business-primary-button"
            onClick={handleWorkspace}
            disabled={guest || busy}
          >
            <Plus size={15} />
            Workspace
          </button>
        </section>

        <section className="business-metric-grid">
          <article className="business-metric">
            <BarChart3 size={18} />
            <span>Revenue</span>
            <strong>
              ₹{analytics?.revenue || 0}
            </strong>
          </article>

          <article className="business-metric">
            <Store size={18} />
            <span>Stores</span>
            <strong>{stores.length}</strong>
          </article>

          <article className="business-metric">
            <Users size={18} />
            <span>Customers</span>
            <strong>
              {analytics?.customers || 0}
            </strong>
          </article>

          <article className="business-metric">
            <Headphones size={18} />
            <span>Open tickets</span>
            <strong>{support?.open || 0}</strong>
          </article>
        </section>

        <section className="business-section">
          <div className="business-section-heading">
            <BarChart3 size={17} />
            <div>
              <h2>Business analytics</h2>
              <p>
                Revenue, orders, retention, customers, and support performance.
              </p>
            </div>
          </div>

          <div className="business-card">
            <div className="business-analytics-grid">
              <div>
                <span>Orders</span>
                <strong>
                  {analytics?.orders || 0}
                </strong>
              </div>

              <div>
                <span>Retention</span>
                <strong>
                  {analytics?.retention || 0}%
                </strong>
              </div>

              <div>
                <span>Repeat purchases</span>
                <strong>
                  {analytics?.repeat_purchases || 0}
                </strong>
              </div>

              <div>
                <span>Conversion</span>
                <strong>
                  {analytics?.conversion_rate || 0}%
                </strong>
              </div>
            </div>

            <ActionRow
              icon={<BarChart3 size={18} />}
              title="View analytics"
              description="Open detailed business performance reports."
              onClick={() =>
                navigate('/business-analytics')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<BriefcaseBusiness size={18} />}
              title="Export business report"
              description="Download revenue, customer, and operations data."
              onClick={handleExport}
              disabled={busy || guest}
            />
          </div>
        </section>

        <section className="business-section">
          <div className="business-section-heading">
            <Store size={17} />
            <div>
              <h2>Stores and operations</h2>
              <p>
                Manage stores, inventory, orders, and enterprise operations.
              </p>
            </div>
          </div>

          <div className="business-card">
            <ActionRow
              icon={<Plus size={18} />}
              title="Create store"
              description="Add another storefront to the workspace."
              onClick={handleStore}
              disabled={busy || guest}
            />

            <ActionRow
              icon={<Store size={18} />}
              title="Manage stores"
              description={`${stores.length} stores connected to this workspace.`}
              onClick={() =>
                navigate('/marketplace')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Wrench size={18} />}
              title="Manage operations"
              description="Open orders and inventory management."
              onClick={() =>
                navigate('/orders-center')
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="business-section">
          <div className="business-section-heading">
            <Headphones size={17} />
            <div>
              <h2>Customer support and CRM</h2>
              <p>
                Prepare customer history, tickets, notes, tags, and segments.
              </p>
            </div>
          </div>

          <div className="business-card">
            <ActionRow
              icon={<Plus size={18} />}
              title="Create support ticket"
              description="Open a support request through Chat or marketplace."
              onClick={handleTicket}
              disabled={busy || guest}
            />

            <ActionRow
              icon={<Headphones size={18} />}
              title="Support tickets"
              description={`${tickets.length} tickets · ${support?.resolved || 0} resolved.`}
              onClick={() =>
                navigate('/support-tickets')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Users size={18} />}
              title="Customer profiles"
              description="Review purchase and communication history."
              onClick={() =>
                navigate('/business-customers')
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="business-section">
          <div className="business-section-heading">
            <Users size={17} />
            <div>
              <h2>Team and automation</h2>
              <p>
                Prepare roles, permissions, audit logs, and business automation.
              </p>
            </div>
          </div>

          <div className="business-card">
            <ActionRow
              icon={<Users size={18} />}
              title="Team members"
              description={`${members.length} members · Owner, Admin, Support, Finance, and more.`}
              onClick={() =>
                navigate('/business-team')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Wrench size={18} />}
              title="Business automation"
              description="Prepare rules for orders, support, inventory, and customers."
              onClick={() =>
                navigate('/automation-center')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<BriefcaseBusiness size={18} />}
              title="Loyalty and coupons"
              description="Prepare rewards, referrals, discounts, and segments."
              onClick={() =>
                navigate('/business-marketing')
              }
              disabled={busy}
            />
          </div>
        </section>

        <p className="business-footer">
          Guests can browse business features. Workspace,
          store, customer, team, support, analytics, and
          automation operations require authentication.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .business-page {
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

  .business-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .business-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .business-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .business-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .business-icon-button {
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

  .business-icon-button:last-child {
    justify-self: end;
  }

  .business-error,
  .business-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .business-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .business-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .business-status-card,
  .business-card,
  .business-metric {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .business-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .business-status-icon {
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

  .business-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .business-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .business-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .business-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .business-primary-button {
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

  .business-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .business-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .business-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .business-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .business-metric strong {
    color: #edf2ff;
    font-size: 0.95rem;
  }

  .business-section {
    margin-top: 1.3rem;
  }

  .business-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .business-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .business-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .business-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .business-analytics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
    padding: 0.9rem;
  }

  .business-analytics-grid div {
    display: grid;
    gap: 0.25rem;
    padding: 0.65rem;
    border-radius: 0.75rem;
    background: rgba(255,255,255,0.045);
  }

  .business-analytics-grid span {
    color: #8491ad;
    font-size: 0.62rem;
  }

  .business-analytics-grid strong {
    color: #c9f9ff;
    font-size: 0.78rem;
  }

  .business-action-row {
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

  .business-action-row + .business-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .business-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .business-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .business-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .business-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .business-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .business-action-row > svg {
    color: #7483a1;
  }

  .business-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .business-loading-header,
  .business-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: business-skeleton 1.4s infinite;
  }

  .business-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .business-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes business-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 720px) {
    .business-metric-grid,
    .business-analytics-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .business-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .business-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .business-primary-button {
      margin-left: auto;
    }
  }
`;