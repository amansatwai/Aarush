import { useState } from 'react';
import {
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useCreatorStudio from '../hooks/useCreatorStudio';
import {
  publishPremiumContent,
  exportCreatorReport,
} from '../utils/creatorStudioEngine';
import {
  createSubscriptionTier,
  requestPayout,
} from '../utils/monetizationEngine';

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
      className="creator-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="creator-action-icon">
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

export default function CreatorStudioCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    dashboard,
    analytics,
    tiers,
    subscriptions,
    revenue,
    payouts,
    loading,
    error,
    refresh,
  } = useCreatorStudio();

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
          'Unable to complete Creator Studio action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const publishPremium = () => {
    if (guestGuard()) return;

    runAction(
      () =>
        publishPremiumContent({
          title: 'Premium content draft',
          content_type: 'premium_post',
          status: 'draft',
        }),
      'Premium content draft created.'
    );
  };

  const createTier = () => {
    if (guestGuard()) return;

    runAction(
      () =>
        createSubscriptionTier({
          name: 'Supporter',
          tier_type: 'Supporter',
          monthly_price: 99,
          yearly_price: 999,
          benefits: {
            exclusive_content: true,
            badges: true,
            priority_messaging: false,
            early_access: true,
            download_access: false,
            community_access: true,
          },
        }),
      'Subscription tier created.'
    );
  };

  const payout = () => {
    if (guestGuard()) return;

    const amount = window.prompt(
      'Enter payout amount:'
    );

    if (!amount) return;

    runAction(
      () => requestPayout(Number(amount)),
      'Payout request submitted.'
    );
  };

  const exportReport = async () => {
    try {
      setBusy(true);

      const report = await exportCreatorReport();
      const blob = new Blob(
        [JSON.stringify(report, null, 2)],
        {
          type: 'application/json',
        }
      );

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = 'aarush-creator-report.json';
      anchor.click();

      URL.revokeObjectURL(url);
      setNotice('Creator report exported.');
    } catch (reportError) {
      setActionError(
        reportError?.message ||
          'Unable to export creator report.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="social-page creator-studio-page">
        <TopBar />

        <main className="creator-content">
          <div className="creator-loading-header" />
          <div className="creator-loading-card" />
          <div className="creator-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page creator-studio-page">
      <TopBar />

      <main className="creator-content">
        <header className="creator-header">
          <button
            type="button"
            className="creator-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="creator-eyebrow">
              Creator economy
            </p>
            <h1>Creator Studio</h1>
          </div>

          <button
            type="button"
            className="creator-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh Creator Studio"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="creator-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="creator-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="creator-status-card">
          <div className="creator-status-icon">
            <Sparkles size={27} />
          </div>

          <div className="creator-status-copy">
            <p>Creator status</p>
            <h2>
              {dashboard?.active
                ? 'Studio active'
                : 'Creator setup ready'}
            </h2>
            <span>
              {dashboard?.verified
                ? 'Verified creator'
                : 'Verification and monetization are prepared.'}
            </span>
          </div>

          <button
            type="button"
            className="creator-primary-button"
            onClick={publishPremium}
            disabled={guest || busy}
          >
            <Plus size={15} />
            Publish
          </button>
        </section>

        <section className="creator-metric-grid">
          <article className="creator-metric">
            <DollarSign size={18} />
            <span>Net earnings</span>
            <strong>
              ₹{Number(revenue?.net || 0).toFixed(0)}
            </strong>
          </article>

          <article className="creator-metric">
            <Users size={18} />
            <span>Subscribers</span>
            <strong>{subscriptions.length}</strong>
          </article>

          <article className="creator-metric">
            <Sparkles size={18} />
            <span>Subscription tiers</span>
            <strong>{tiers.length}</strong>
          </article>

          <article className="creator-metric">
            <BarChart3 size={18} />
            <span>Top content</span>
            <strong>
              {analytics?.top_content?.length || 0}
            </strong>
          </article>
        </section>

        <section className="creator-section">
          <div className="creator-section-heading">
            <DollarSign size={17} />
            <div>
              <h2>Revenue overview</h2>
              <p>
                Subscription, product, service, and sponsorship revenue.
              </p>
            </div>
          </div>

          <div className="creator-card">
            <div className="creator-revenue-grid">
              <div>
                <span>Gross revenue</span>
                <strong>
                  ₹{revenue?.gross || 0}
                </strong>
              </div>

              <div>
                <span>Platform fees</span>
                <strong>
                  ₹{revenue?.platform_fees || 0}
                </strong>
              </div>

              <div>
                <span>Subscriptions</span>
                <strong>
                  ₹{revenue?.subscriptions || 0}
                </strong>
              </div>

              <div>
                <span>Products</span>
                <strong>
                  ₹{revenue?.products || 0}
                </strong>
              </div>
            </div>

            <ActionRow
              icon={<Wallet size={18} />}
              title="Request payout"
              description={`${payouts.length} payout requests`}
              onClick={payout}
              disabled={guest || busy}
            />

            <ActionRow
              icon={<DownloadIcon />}
              title="Export analytics"
              description="Download creator revenue and performance data."
              onClick={exportReport}
              disabled={busy}
            />
          </div>
        </section>

        <section className="creator-section">
          <div className="creator-section-heading">
            <Users size={17} />
            <div>
              <h2>Subscription tiers</h2>
              <p>
                Supporter, Premium, VIP, and custom memberships.
              </p>
            </div>
          </div>

          <div className="creator-card">
            <ActionRow
              icon={<Plus size={18} />}
              title="Create subscription tier"
              description="Add monthly and yearly membership benefits."
              onClick={createTier}
              disabled={guest || busy}
            />

            {tiers.map((tier) => (
              <article
                className="creator-tier-row"
                key={tier.id}
              >
                <div>
                  <strong>
                    {tier.name || tier.tier_type}
                  </strong>
                  <span>
                    ₹{tier.monthly_price || 0}/month
                    {' · '}
                    ₹{tier.yearly_price || 0}/year
                  </span>
                </div>

                <small>
                  {tier.active ? 'Active' : 'Inactive'}
                </small>
              </article>
            ))}
          </div>
        </section>

        <section className="creator-section">
          <div className="creator-section-heading">
            <Sparkles size={17} />
            <div>
              <h2>Creator tools</h2>
              <p>
                Premium content, collaborations, and audience growth.
              </p>
            </div>
          </div>

          <div className="creator-card">
            <ActionRow
              icon={<Sparkles size={18} />}
              title="Publish premium content"
              description="Prepare premium posts, stories, reels, and downloads."
              onClick={publishPremium}
              disabled={guest || busy}
            />

            <ActionRow
              icon={<Users size={18} />}
              title="Manage subscribers"
              description="Review active memberships and subscriber growth."
              onClick={() =>
                navigate('/creator-subscribers')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<BriefcaseIcon />}
              title="View collaborations"
              description="Prepare sponsorships, campaigns, and brand proposals."
              onClick={() =>
                navigate('/brand-collaborations')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<BarChart3 size={18} />}
              title="Audience insights"
              description="Review engagement, conversion, churn, and growth."
              onClick={() =>
                navigate('/creator-analytics')
              }
              disabled={busy}
            />
          </div>
        </section>

        <p className="creator-footer">
          Creator monetization is prepared for secure
          payment-provider integration, payout verification,
          subscriptions, digital products, and brand
          collaboration workflows.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

function DownloadIcon() {
  return <BarChart3 size={18} />;
}

function BriefcaseIcon() {
  return <Sparkles size={18} />;
}

const styles = `
  .creator-studio-page {
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

  .creator-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .creator-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .creator-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .creator-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .creator-icon-button {
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

  .creator-icon-button:last-child {
    justify-self: end;
  }

  .creator-error,
  .creator-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .creator-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .creator-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .creator-status-card,
  .creator-card,
  .creator-metric {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .creator-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .creator-status-icon {
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

  .creator-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .creator-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .creator-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .creator-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .creator-primary-button {
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

  .creator-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .creator-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .creator-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .creator-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .creator-metric strong {
    color: #edf2ff;
    font-size: 0.95rem;
  }

  .creator-section {
    margin-top: 1.3rem;
  }

  .creator-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .creator-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .creator-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .creator-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .creator-revenue-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
    padding: 0.9rem;
  }

  .creator-revenue-grid div {
    display: grid;
    gap: 0.25rem;
    padding: 0.65rem;
    border-radius: 0.75rem;
    background: rgba(255,255,255,0.045);
  }

  .creator-revenue-grid span {
    color: #8491ad;
    font-size: 0.62rem;
  }

  .creator-revenue-grid strong {
    color: #c9f9ff;
    font-size: 0.78rem;
  }

  .creator-action-row {
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

  .creator-action-row + .creator-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .creator-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .creator-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .creator-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .creator-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .creator-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .creator-action-row > svg {
    color: #7483a1;
  }

  .creator-tier-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
    min-height: 3.7rem;
    padding: 0.7rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .creator-tier-row div {
    min-width: 0;
    display: grid;
    gap: 0.2rem;
  }

  .creator-tier-row strong {
    color: #edf2ff;
    font-size: 0.76rem;
  }

  .creator-tier-row span,
  .creator-tier-row small {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .creator-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .creator-loading-header,
  .creator-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: creator-skeleton 1.4s infinite;
  }

  .creator-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .creator-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes creator-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 720px) {
    .creator-metric-grid,
    .creator-revenue-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .creator-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .creator-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .creator-primary-button {
      margin-left: auto;
    }
  }
`;