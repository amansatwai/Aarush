import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
  CreditCard,
  DollarSign,
  ExternalLink,
  Gift,
  Landmark,
  Link2,
  Percent,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
  X,
} from 'lucide-react';

const DEFAULT_EARNINGS = {
  total: 0,
  month: 0,
  week: 0,
  today: 0,
  pending: 0,
  available: 0,
  nextPayout: null,
  growth: 0,
};

const REVENUE_SOURCES = [
  ['Story Ads', 'storyAds', DollarSign, '#4dd7ff'],
  ['Creator Fund', 'creatorFund', Gift, '#a895ff'],
  ['Brand Collaborations', 'brandRevenue', Landmark, '#ffd27d'],
  ['Affiliate Sales', 'affiliateRevenue', Link2, '#82e9c1'],
  ['Subscriptions', 'subscriptions', Users, '#ff4fd8'],
  ['Tips', 'tips', Star, '#ff9f72'],
  ['Digital Products', 'digitalProducts', CreditCard, '#9deeff'],
  ['Gifts', 'gifts', Gift, '#ff6d9a'],
];

function number(value) {
  return Number(value) || 0;
}

function money(value, currency = 'INR') {
  const amount = number(value);

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

function formatDate(value) {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizePayout(payout, index) {
  return {
    ...payout,
    id: payout?.id || `payout-${index}`,
    amount: number(payout?.amount),
    date: payout?.date || payout?.createdAt || null,
    status: payout?.status || 'Pending',
    method: payout?.method || 'Bank transfer',
    reference:
      payout?.reference ||
      payout?.transactionReference ||
      'Foundation',
  };
}

function MetricCard({
  label,
  value,
  icon: Icon,
  accent = '#7c5cff',
  detail,
}) {
  return (
    <article style={styles.metricCard}>
      <span
        style={{
          ...styles.metricIcon,
          color: accent,
          background: `${accent}18`,
        }}
      >
        <Icon size={17} />
      </span>

      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>

      {detail ? (
        <span style={styles.metricDetail}>
          {detail}
        </span>
      ) : null}
    </article>
  );
}

function MiniChart({
  data = [],
  color = '#4dd7ff',
  height = 130,
}) {
  const points = Array.isArray(data) ? data : [];
  const maximum = Math.max(
    1,
    ...points.map((point) => number(point?.value))
  );

  const path = points
    .map((point, index) => {
      const x =
        points.length <= 1
          ? 50
          : (index / (points.length - 1)) * 100;
      const y =
        94 - (number(point?.value) / maximum) * 78;

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div style={{ ...styles.chart, height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={styles.chartSvg}
        aria-label="Revenue chart"
        role="img"
      >
        {[20, 40, 60, 80].map((line) => (
          <line
            key={line}
            x1="0"
            x2="100"
            y1={line}
            y2={line}
            stroke="rgba(255,255,255,.08)"
            strokeWidth=".35"
          />
        ))}

        {path ? (
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>

      {!points.length ? (
        <span style={styles.noChartData}>
          Analytics will appear here.
        </span>
      ) : null}
    </div>
  );
}

export default function StoryMonetizationDashboard({
  earnings = {},
  wallet = {},
  payouts = [],
  subscriptions = {},
  affiliateRevenue = {},
  brandRevenue = {},
  analytics = {},
  onWithdraw,
  onOpenWallet,
  onOpenSubscriptions,
  onOpenPayouts,
  onClose,
}) {
  const [currency, setCurrency] = useState(
    earnings.currency ||
      wallet.currency ||
      'INR'
  );
  const [withdrawOpen, setWithdrawOpen] =
    useState(false);
  const [withdrawMethod, setWithdrawMethod] =
    useState('Bank transfer');
  const [withdrawAmount, setWithdrawAmount] =
    useState('');
  const [notice, setNotice] = useState('');

  const normalizedEarnings = useMemo(
    () => ({
      ...DEFAULT_EARNINGS,
      ...earnings,
    }),
    [earnings]
  );

  const normalizedPayouts = useMemo(
    () => payouts.map(normalizePayout),
    [payouts]
  );

  const sourceValues = useMemo(
    () => ({
      storyAds: number(analytics.storyAds),
      creatorFund: number(analytics.creatorFund),
      brandRevenue: number(
        brandRevenue.total ||
          brandRevenue.revenue
      ),
      affiliateRevenue: number(
        affiliateRevenue.revenue
      ),
      subscriptions: number(
        subscriptions.monthlyRecurringRevenue ||
          subscriptions.mrr
      ),
      tips: number(analytics.tips),
      digitalProducts: number(
        analytics.digitalProducts
      ),
      gifts: number(analytics.gifts),
    }),
    [
      affiliateRevenue,
      analytics,
      brandRevenue,
      subscriptions,
    ]
  );

  const totalSourceRevenue = useMemo(
    () =>
      Object.values(sourceValues).reduce(
        (total, value) => total + value,
        0
      ),
    [sourceValues]
  );

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  }, []);

  const submitWithdraw = useCallback(() => {
    const amount = number(withdrawAmount);
    const available = number(
      wallet.available ||
        normalizedEarnings.available
    );

    if (!amount || amount <= 0) {
      showNotice('Enter a valid withdrawal amount.');
      return;
    }

    if (amount > available) {
      showNotice('Amount exceeds available balance.');
      return;
    }

    onWithdraw?.({
      amount,
      currency,
      method: withdrawMethod,
      verification: 'foundation',
    });

    setWithdrawOpen(false);
    setWithdrawAmount('');
    showNotice('Withdrawal request prepared.');
  }, [
    currency,
    normalizedEarnings.available,
    onWithdraw,
    showNotice,
    wallet.available,
    withdrawAmount,
    withdrawMethod,
  ]);

  const insights = [
    'Your evening stories earn 23% more.',
    'Travel stories generate the highest affiliate revenue.',
    'Subscribers are growing faster this month.',
    'Brand collaborations increased 18%.',
  ];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close monetization dashboard"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Story Monetization</strong>
          <span>Creator earnings and revenue insights</span>
        </div>

        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          aria-label="Withdraw earnings"
          style={styles.primaryIconButton}
        >
          <DollarSign size={17} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <section style={styles.currencyRow}>
          <div>
            <strong>Professional Dashboard</strong>
            <span>Revenue foundation for Aarush creators</span>
          </div>

          <select
            value={currency}
            onChange={(event) =>
              setCurrency(event.target.value)
            }
            aria-label="Currency"
            style={styles.currencySelect}
          >
            <option value="INR">INR ₹</option>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
            <option value="GBP">GBP £</option>
          </select>
        </section>

        <section style={styles.metricGrid}>
          <MetricCard
            label="Total earnings"
            value={money(
              normalizedEarnings.total,
              currency
            )}
            icon={DollarSign}
            accent="#82e9c1"
          />
          <MetricCard
            label="This month"
            value={money(
              normalizedEarnings.month,
              currency
            )}
            icon={CalendarClock}
            accent="#4dd7ff"
          />
          <MetricCard
            label="This week"
            value={money(
              normalizedEarnings.week,
              currency
            )}
            icon={BarChart3}
            accent="#a895ff"
          />
          <MetricCard
            label="Today"
            value={money(
              normalizedEarnings.today,
              currency
            )}
            icon={Sparkles}
            accent="#ffd27d"
          />
          <MetricCard
            label="Pending"
            value={money(
              normalizedEarnings.pending,
              currency
            )}
            icon={Clock3}
            accent="#ff9f72"
          />
          <MetricCard
            label="Available"
            value={money(
              normalizedEarnings.available,
              currency
            )}
            icon={Wallet}
            accent="#9deeff"
          />
          <MetricCard
            label="Growth"
            value={`${number(
              normalizedEarnings.growth
            )}%`}
            icon={
              normalizedEarnings.growth >= 0
                ? ArrowUpRight
                : ArrowDownRight
            }
            accent="#ff4fd8"
          />
          <MetricCard
            label="Next payout"
            value={formatDate(
              normalizedEarnings.nextPayout
            )}
            icon={CalendarClock}
            accent="#c9f9ff"
          />
        </section>

        <section style={styles.walletCard}>
          <div style={styles.walletHeader}>
            <div style={styles.walletIcon}>
              <Wallet size={22} />
            </div>

            <div>
              <h2>Wallet</h2>
              <span>Manage your creator balance</span>
            </div>

            <button
              type="button"
              onClick={onOpenWallet}
              style={styles.smallButton}
            >
              Open wallet
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={styles.walletBalances}>
            <span>
              Current balance
              <strong>
                {money(
                  wallet.balance ||
                    normalizedEarnings.available,
                  currency
                )}
              </strong>
            </span>
            <span>
              Pending balance
              <strong>
                {money(
                  wallet.pending ||
                    normalizedEarnings.pending,
                  currency
                )}
              </strong>
            </span>
            <span>
              Withdrawable
              <strong>
                {money(
                  wallet.available ||
                    normalizedEarnings.available,
                  currency
                )}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setWithdrawOpen(true)}
            style={styles.withdrawButton}
          >
            <DollarSign size={16} />
            Withdraw funds
          </button>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Revenue Sources</h2>
              <span>Where your earnings come from.</span>
            </div>
            <BarChart3 size={18} color="#4dd7ff" />
          </div>

          <div style={styles.sourceList}>
            {REVENUE_SOURCES.map(
              ([label, key, Icon, color]) => {
                const value = sourceValues[key];
                const percentage =
                  totalSourceRevenue > 0
                    ? (value / totalSourceRevenue) * 100
                    : 0;

                return (
                  <div
                    key={key}
                    style={styles.sourceRow}
                  >
                    <span
                      style={{
                        ...styles.sourceIcon,
                        color,
                        background: `${color}18`,
                      }}
                    >
                      <Icon size={15} />
                    </span>

                    <div style={styles.sourceCopy}>
                      <span>{label}</span>
                      <div style={styles.progressTrack}>
                        <span
                          style={{
                            ...styles.progressFill,
                            width: `${percentage}%`,
                            background: color,
                          }}
                        />
                      </div>
                    </div>

                    <strong>
                      {money(value, currency)}
                    </strong>
                  </div>
                );
              }
            )}
          </div>
        </section>

        <section style={styles.twoColumn}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Subscriptions</h2>
                <span>Recurring creator income.</span>
              </div>
              <Users size={18} color="#ff4fd8" />
            </div>

            <MetricRow
              label="Active subscribers"
              value={subscriptions.activeSubscribers || 0}
            />
            <MetricRow
              label="Monthly recurring revenue"
              value={money(
                subscriptions.monthlyRecurringRevenue ||
                  subscriptions.mrr,
                currency
              )}
            />
            <MetricRow
              label="New subscribers"
              value={subscriptions.newSubscribers || 0}
            />
            <MetricRow
              label="Churn foundation"
              value={`${number(
                subscriptions.churn
              )}%`}
            />

            <button
              type="button"
              onClick={onOpenSubscriptions}
              style={styles.outlineButton}
            >
              Manage subscriptions
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Tips</h2>
                <span>Supporter contributions.</span>
              </div>
              <Star size={18} color="#ffd27d" />
            </div>

            <MetricRow
              label="Total tips"
              value={money(analytics.tips, currency)}
            />
            <MetricRow
              label="Average tip"
              value={money(
                analytics.averageTip,
                currency
              )}
            />
            <MetricRow
              label="Top supporters"
              value={analytics.topSupporters || 'Foundation'}
            />
            <MetricRow
              label="Tip trend"
              value={analytics.tipTrend || 'Preparing'}
            />
          </div>
        </section>

        <section style={styles.twoColumn}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Affiliate Revenue</h2>
                <span>Links and promo performance.</span>
              </div>
              <Link2 size={18} color="#82e9c1" />
            </div>

            <MetricRow
              label="Clicks"
              value={affiliateRevenue.clicks || 0}
            />
            <MetricRow
              label="Conversions"
              value={affiliateRevenue.conversions || 0}
            />
            <MetricRow
              label="Revenue"
              value={money(
                affiliateRevenue.revenue,
                currency
              )}
            />
            <MetricRow
              label="Top links"
              value={affiliateRevenue.topLinks || 'Foundation'}
            />
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Brand Revenue</h2>
                <span>Sponsored collaboration income.</span>
              </div>
              <LandmarkIcon />
            </div>

            <MetricRow
              label="Active campaigns"
              value={brandRevenue.activeCampaigns || 0}
            />
            <MetricRow
              label="Completed campaigns"
              value={brandRevenue.completedCampaigns || 0}
            />
            <MetricRow
              label="Pending payments"
              value={money(
                brandRevenue.pendingPayments,
                currency
              )}
            />
            <MetricRow
              label="Average deal value"
              value={money(
                brandRevenue.averageDealValue,
                currency
              )}
            />
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Earnings Trend</h2>
              <span>Daily and monthly growth foundation.</span>
            </div>
            <BarChart3 size={18} color="#a895ff" />
          </div>

          <MiniChart
            data={
              analytics.earningsTrend ||
              analytics.dailyEarnings ||
              []
            }
            color="#7c5cff"
          />
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Payouts</h2>
              <span>Recent withdrawal history.</span>
            </div>

            <button
              type="button"
              onClick={onOpenPayouts}
              style={styles.smallButton}
            >
              View all
              <ChevronRight size={14} />
            </button>
          </div>

          {payouts.length ? (
            <div style={styles.payoutList}>
              {payouts.slice(0, 6).map((payout, index) => {
                const item = normalizePayout(
                  payout,
                  index
                );

                return (
                  <div
                    key={item.id}
                    style={styles.payoutRow}
                  >
                    <span style={styles.payoutIcon}>
                      <CreditCard size={15} />
                    </span>

                    <div style={styles.payoutCopy}>
                      <strong>
                        {money(item.amount, currency)}
                      </strong>
                      <span>
                        {item.method} ·{' '}
                        {formatDate(item.date)}
                      </span>
                    </div>

                    <span
                      style={{
                        ...styles.payoutStatus,
                        color: statusColor(item.status),
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty label="No payouts yet." />
          )}
        </section>

        <section style={styles.forecastCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Revenue Forecast</h2>
              <span>AI forecasting metadata foundation.</span>
            </div>
            <Sparkles size={18} color="#4dd7ff" />
          </div>

          <div style={styles.forecastGrid}>
            <Forecast
              label="Projected weekly"
              value={money(
                analytics.projectedWeekly,
                currency
              )}
            />
            <Forecast
              label="Projected monthly"
              value={money(
                analytics.projectedMonthly,
                currency
              )}
            />
            <Forecast
              label="Projected yearly"
              value={money(
                analytics.projectedYearly,
                currency
              )}
            />
            <Forecast
              label="Subscriber growth"
              value={`${number(
                analytics.subscriberGrowthForecast
              )}%`}
            />
            <Forecast
              label="Brand opportunity"
              value="Foundation"
            />
            <Forecast
              label="Affiliate growth"
              value="Foundation"
            />
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Creator Insights</h2>
              <span>Practical revenue observations.</span>
            </div>
            <Sparkles size={18} color="#ffd27d" />
          </div>

          <div style={styles.insightList}>
            {[
              'Your evening stories earn 23% more.',
              'Travel stories generate the highest affiliate revenue.',
              'Subscribers are growing faster this month.',
              'Brand collaborations increased 18%.',
            ].map((insight) => (
              <div
                key={insight}
                style={styles.insight}
              >
                <Sparkles size={14} />
                {insight}
              </div>
            ))}
          </div>
        </section>
      </div>

      {withdrawOpen ? (
        <div style={styles.modalBackdrop}>
          <section style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong>Withdraw Funds</strong>
              <button
                type="button"
                onClick={() => setWithdrawOpen(false)}
                aria-label="Close withdrawal flow"
                style={styles.iconButton}
              >
                <X size={16} />
              </button>
            </div>

            <div style={styles.withdrawBalance}>
              Available balance
              <strong>
                {money(
                  wallet.available ||
                    normalizedEarnings.available,
                  currency
                )}
              </strong>
            </div>

            <label style={styles.field}>
              Amount
              <input
                autoFocus
                type="number"
                min="0"
                value={withdrawAmount}
                onChange={(event) =>
                  setWithdrawAmount(event.target.value)
                }
                placeholder="Enter amount"
                style={styles.textInput}
              />
            </label>

            <label style={styles.field}>
              Withdrawal method
              <select
                value={withdrawMethod}
                onChange={(event) =>
                  setWithdrawMethod(event.target.value)
                }
                style={styles.select}
              >
                <option>Bank transfer</option>
                <option>UPI foundation</option>
                <option>PayPal foundation</option>
                <option>Stripe foundation</option>
              </select>
            </label>

            <div style={styles.verification}>
              <ShieldCheck size={16} />
              Verification and minimum payout rules are
              prepared for payment integration.
            </div>

            <button
              type="button"
              onClick={submitWithdraw}
              style={styles.withdrawButton}
            >
              <Check size={16} />
              Request withdrawal
            </button>
          </section>
        </div>
      ) : null}

      <style>{`
        @keyframes aarush-money-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-money-card:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 580px) {
          .aarush-money-two-column {
            grid-template-columns: 1fr !important;
          }

          .aarush-money-analytics-grid {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </main>
  );
}

function MetricRow({ label, value }) {
  return (
    <div style={styles.metricRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Forecast({ label, value }) {
  return (
    <div style={styles.forecast}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Wallet size={24} />
      <span>{label}</span>
    </div>
  );
}

function LandmarkIcon() {
  return (
    <span style={styles.landmarkIcon}>
      <LandmarkSvg />
    </span>
  );
}

function LandmarkSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" x2="21" y1="22" y2="22" />
      <line x1="6" x2="6" y1="18" y2="10" />
      <line x1="10" x2="10" y1="18" y2="10" />
      <line x1="14" x2="14" y1="18" y2="10" />
      <line x1="18" x2="18" y1="18" y2="10" />
      <polygon points="12 2 20 6 4 6 12 2" />
    </svg>
  );
}

function MiniChart({ data = [], color }) {
  const points = Array.isArray(data) ? data : [];
  const maximum = Math.max(
    1,
    ...points.map((point) => number(point?.value))
  );

  const path = points
    .map((point, index) => {
      const x =
        points.length <= 1
          ? 50
          : (index / (points.length - 1)) * 100;
      const y =
        94 - (number(point?.value) / maximum) * 78;

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div style={styles.chart}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={styles.chartSvg}
        role="img"
        aria-label="Earnings trend chart"
      >
        {[20, 40, 60, 80].map((line) => (
          <line
            key={line}
            x1="0"
            x2="100"
            y1={line}
            y2={line}
            stroke="rgba(255,255,255,.08)"
            strokeWidth=".35"
          />
        ))}

        {path ? (
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>

      {!points.length ? (
        <span style={styles.noChartData}>
          Trend data foundation ready.
        </span>
      ) : null}
    </div>
  );
}

function number(value) {
  return Number(value) || 0;
}

function money(value, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(number(value));
  } catch {
    return `${currency} ${Math.round(number(value))}`;
  }
}

function formatDate(value) {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusColor(status) {
  const colors = {
    Pending: '#ffd27d',
    Processing: '#9deeff',
    Completed: '#82e9c1',
    Failed: '#ffb1c8',
  };

  return colors[status] || '#aab6cf';
}

const REVENUE_SOURCES = [
  ['Story Ads', 'storyAds', DollarSign, '#4dd7ff'],
  ['Creator Fund', 'creatorFund', GiftIcon, '#a895ff'],
  ['Brand Collaborations', 'brandRevenue', LandmarkIcon, '#ffd27d'],
  ['Affiliate Sales', 'affiliateRevenue', Link2, '#82e9c1'],
  ['Subscriptions', 'subscriptions', Users, '#ff4fd8'],
  ['Tips', 'tips', Star, '#ff9f72'],
  ['Digital Products', 'digitalProducts', CreditCard, '#9deeff'],
  ['Gifts', 'gifts', GiftIcon, '#ff6d9a'],
];

function GiftIcon(props) {
  return (
    <svg
      width={props.size || 17}
      height={props.size || 17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13" />
      <path d="M3 12h18" />
      <path d="M12 8H7.5a2.5 2.5 0 1 1 2.5-2.5c0 2.5 2 2.5 2 2.5Z" />
      <path d="M12 8h4.5a2.5 2.5 0 1 0-2.5-2.5C14 8 12 8 12 8Z" />
    </svg>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.52),#07090e 68%)',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.65rem',
    padding: '.75rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  iconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.06)',
    cursor: 'pointer',
  },

  primaryIconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  heading: {
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  content: {
    width: 'min(100%, 980px)',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.8rem',
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    padding: '.65rem',
    border: '1px solid rgba(130,233,193,.22)',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.64rem',
  },

  currencyRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.6rem',
    padding: '.85rem',
    border: '1px solid rgba(124,92,255,.24)',
    borderRadius: '1rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.14),rgba(77,215,255,.06))',
  },

  currencyRowDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  currencyRowSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  currencySelect: {
    minHeight: '2.3rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.63rem',
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
  },

  metricCard: {
    minHeight: '7rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.7rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 14px 35px rgba(0,0,0,.16)',
    animation: 'aarush-money-in 260ms ease both',
  },

  metricIcon: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    marginBottom: '.2rem',
    borderRadius: '.65rem',
  },

  metricLabel: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  metricValue: {
    color: '#f4f7ff',
    fontSize: '.95rem',
  },

  metricDetail: {
    color: '#82e9c1',
    fontSize: '.55rem',
  },

  walletCard: {
    padding: '.9rem',
    border: '1px solid rgba(130,233,193,.2)',
    borderRadius: '1.1rem',
    background:
      'linear-gradient(135deg,rgba(130,233,193,.08),rgba(77,215,255,.04))',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
  },

  walletHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
  },

  walletIcon: {
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.8rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  walletHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
    flex: 1,
  },

  walletHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  smallButton: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  walletBalances: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.5rem',
    marginTop: '.8rem',
    paddingTop: '.7rem',
    borderTop: '1px solid rgba(255,255,255,.08)',
  },

  walletBalancesSpan: {
    display: 'grid',
    gap: '.2rem',
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  walletBalancesStrong: {
    color: '#fff',
    fontSize: '.78rem',
  },

  withdrawButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    marginTop: '.75rem',
    padding: '0 .8rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
  },

  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.8rem',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.7rem',
  },

  sectionHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  sectionHeaderH2: {
    margin: 0,
    fontSize: '.86rem',
  },

  sectionHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  sourceList: {
    display: 'grid',
    gap: '.6rem',
  },

  sourceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
  },

  sourceIcon: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
  },

  sourceCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.3rem',
    flex: 1,
    color: '#cbd6ec',
    fontSize: '.62rem',
  },

  progressTrack: {
    position: 'relative',
    height: '.25rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.1)',
  },

  progressFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: '999px',
    minWidth: '.15rem',
  },

  metricRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.4rem',
    minHeight: '2.15rem',
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  metricRowStrong: {
    color: '#fff',
    fontSize: '.68rem',
  },

  outlineButton: {
    minHeight: '2.45rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    marginTop: '.65rem',
    padding: '0 .65rem',
    border: '1px solid rgba(77,215,255,.22)',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.08)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  payoutList: {
    display: 'grid',
    gap: '.4rem',
  },

  payoutRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  payoutIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  payoutCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  payoutCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  payoutStatus: {
    fontSize: '.58rem',
    fontWeight: 800,
  },

  forecastCard: {
    padding: '.9rem',
    border: '1px solid rgba(124,92,255,.24)',
    borderRadius: '1.1rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.12),rgba(77,215,255,.05))',
  },

  forecastGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  forecast: {
    display: 'grid',
    gap: '.25rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
  },

  forecastStrong: {
    color: '#fff',
    fontSize: '.75rem',
  },

  insightList: {
    display: 'grid',
    gap: '.4rem',
  },

  insight: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '.6rem',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.63rem',
  },

  chart: {
    position: 'relative',
    height: '150px',
    overflow: 'hidden',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.02)',
  },

  chartSvg: {
    width: '100%',
    height: '100%',
    display: 'block',
  },

  noChartData: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    color: '#71809a',
    fontSize: '.62rem',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.64rem',
  },

  textInput: {
    minHeight: '2.5rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.7rem',
  },

  select: {
    minHeight: '2.45rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
  },

  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '.8rem',
    background: 'rgba(2,5,10,.72)',
    backdropFilter: 'blur(10px)',
  },

  modal: {
    width: 'min(100%, 420px)',
    display: 'grid',
    gap: '.7rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  withdrawBalance: {
    display: 'grid',
    gap: '.25rem',
    padding: '.7rem',
    borderRadius: '.75rem',
    color: '#91a0bc',
    background: 'rgba(130,233,193,.07)',
    fontSize: '.63rem',
  },

  withdrawBalanceStrong: {
    color: '#c7ffe4',
    fontSize: '1.05rem',
  },

  verification: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.61rem',
    lineHeight: 1.4,
  },

  empty: {
    minHeight: '6rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.64rem',
    textAlign: 'center',
  },

  spinner: {
    animation: 'aarush-money-spin 800ms linear infinite',
  },

  landmarkIcon: {
    color: '#ffd27d',
  },
};