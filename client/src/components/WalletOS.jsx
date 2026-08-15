import { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  Gift,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  QrCode,
  Receipt,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  TrendingUp,
  UpiIcon,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', WalletCards],
  ['upi', 'UPI', UpiIcon],
  ['accounts', 'Bank Accounts', Building2],
  ['cards', 'Cards', CreditCard],
  ['payments', 'Send & Request', Send],
  ['creator', 'Creator Wallet', Sparkles],
  ['brands', 'Brand Payments', Receipt],
  ['subscriptions', 'Subscriptions', TicketPercent],
  ['transactions', 'Transactions', BarChart3],
  ['rewards', 'Rewards', Gift],
  ['insights', 'Budget & Insights', TrendingUp],
  ['security', 'Security', ShieldCheck],
];

function numeric(value) {
  return Number(value) || 0;
}

function money(value, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numeric(value));
  } catch {
    return `${currency} ${Math.round(numeric(value))}`;
  }
}

function formatDate(value) {
  if (!value) return 'Not set';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color = '#4dd7ff',
}) {
  return (
    <article style={styles.metricCard}>
      <span
        style={{
          ...styles.metricIcon,
          color,
          background: `${color}18`,
        }}
      >
        <Icon size={17} />
      </span>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </article>
  );
}

function SectionTitle({ title, subtitle, icon: Icon, action }) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      {action || <Icon size={18} color="#4dd7ff" />}
    </div>
  );
}

export default function WalletOS({
  user = {},
  wallet = {},
  accounts = [],
  cards = [],
  upiIds = [],
  transactions = [],
  subscriptions = [],
  payouts = [],
  invoices = [],
  rewards = {},
  security = {},
  onSendMoney,
  onRequestMoney,
  onWithdraw,
  onAddAccount,
  onAddCard,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [search, setSearch] = useState('');
  const [transactionFilter, setTransactionFilter] =
    useState('All');
  const [notice, setNotice] = useState('');

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        [
          transaction?.type,
          transaction?.counterparty,
          transaction?.category,
          transaction?.reference,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        transactionFilter === 'All' ||
        transaction?.type === transactionFilter ||
        transaction?.status === transactionFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, transactionFilter, transactions]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction?.direction === 'credit' ||
            transaction?.type === 'Income'
        )
        .reduce(
          (total, transaction) =>
            total + numeric(transaction.amount),
          0
        ),
    [transactions]
  );

  const totalSpending = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction?.direction === 'debit' ||
            transaction?.type === 'Payment'
        )
        .reduce(
          (total, transaction) =>
            total + numeric(transaction.amount),
          0
        ),
    [transactions]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const renderOverview = () => (
    <>
      <section style={styles.walletHero}>
        <div style={styles.walletOrb}>
          <WalletCards size={31} />
        </div>
        <div style={styles.walletCopy}>
          <span style={styles.aiBadge}>
            <ShieldCheck size={12} />
            Aarush WalletOS
          </span>
          <h1>
            {money(
              wallet.totalBalance ||
                wallet.balance ||
                0,
              wallet.currency
            )}
          </h1>
          <span>
            Available balance ·{' '}
            {money(wallet.availableBalance, wallet.currency)}
          </span>
          <p>
            Your unified financial layer for UPI, payouts,
            commerce, subscriptions, rewards, and payments.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            showNotice('Wallet security details opened.')
          }
          aria-label="Wallet security status"
          style={styles.securityButton}
        >
          <ShieldCheck size={18} />
        </button>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Pending balance"
          value={money(wallet.pendingBalance, wallet.currency)}
          icon={CircleDollarSign}
          color="#ffd27d"
        />
        <MetricCard
          label="Creator earnings"
          value={money(wallet.creatorEarnings, wallet.currency)}
          icon={Sparkles}
          color="#a895ff"
        />
        <MetricCard
          label="Rewards balance"
          value={money(rewards.balance, wallet.currency)}
          icon={Gift}
          color="#ff4fd8"
        />
        <MetricCard
          label="Monthly income"
          value={money(
            wallet.monthlyIncome || totalIncome,
            wallet.currency
          )}
          icon={TrendingUp}
          color="#82e9c1"
        />
        <MetricCard
          label="Monthly spending"
          value={money(
            wallet.monthlySpending || totalSpending,
            wallet.currency
          )}
          icon={ArrowUpRight}
          color="#ff9f72"
        />
        <MetricCard
          label="Wallet health"
          value={`${wallet.healthScore || 86}/100`}
          icon={ShieldCheck}
          color="#4dd7ff"
        />
      </section>

      <section style={styles.quickActions}>
        <SectionTitle
          title="Quick Payments"
          subtitle="Move money with secure payment foundations."
          icon={Send}
        />
        <div style={styles.quickGrid}>
          <QuickAction
            label="Send Money"
            icon={ArrowUpRight}
            onClick={() => {
              onSendMoney?.();
              showNotice('Send money flow opened.');
            }}
          />
          <QuickAction
            label="Request Money"
            icon={ArrowDownLeft}
            onClick={() => {
              onRequestMoney?.();
              showNotice('Request money flow opened.');
            }}
          />
          <QuickAction
            label="Scan & Pay"
            icon={QrCode}
            onClick={() =>
              showNotice('Scan and Pay foundation ready.')
            }
          />
          <QuickAction
            label="Withdraw"
            icon={WalletCards}
            onClick={() => {
              onWithdraw?.();
              showNotice('Withdrawal flow opened.');
            }}
          />
        </div>
      </section>
    </>
  );

  const renderUpi = () => (
    <section style={styles.section}>
      <SectionTitle
        title="UPI"
        subtitle="Linked IDs, QR pay, and collection requests."
        icon={UpiIcon}
      />

      <div style={styles.upiHero}>
        <QrCode size={24} />
        <div>
          <strong>
            {wallet.upiId || upiIds[0]?.id || 'yourname@aarush'}
          </strong>
          <span>
            QR Pay, UPI PIN, and collect request foundations
            are ready.
          </span>
        </div>
      </div>

      <div style={styles.upiActions}>
        <QuickAction
          label="Send via UPI"
          icon={Send}
          onClick={() => {
            onSendMoney?.({ method: 'UPI' });
            showNotice('UPI send flow opened.');
          }}
        />
        <QuickAction
          label="Request Money"
          icon={ArrowDownLeft}
          onClick={() => {
            onRequestMoney?.({ method: 'UPI' });
            showNotice('UPI request flow opened.');
          }}
        />
        <QuickAction
          label="Scan & Pay"
          icon={QrCode}
          onClick={() =>
            showNotice('QR scanner foundation ready.')
          }
        />
      </div>

      <div style={styles.list}>
        {upiIds.length ? (
          upiIds.map((upi, index) => (
            <div
              key={upi.id || index}
              style={styles.listRow}
            >
              <span style={styles.rowIcon}>
                <UpiIcon size={16} />
              </span>
              <span style={styles.rowCopy}>
                <strong>{upi.id || upi.value}</strong>
                <small>
                  {upi.verified ? 'Verified' : 'Verification foundation'}
                </small>
              </span>
              <BadgeCheck
                size={15}
                color={upi.verified ? '#82e9c1' : '#91a0bc'}
              />
            </div>
          ))
        ) : (
          <Empty label="No linked UPI IDs." />
        )}
      </div>
    </section>
  );

  const renderAccounts = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Bank Accounts"
        subtitle="Linked accounts and payout routing."
        icon={Building2}
        action={
          <button
            type="button"
            onClick={() => {
              onAddAccount?.();
              showNotice('Add bank account flow opened.');
            }}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Add account
          </button>
        }
      />

      <div style={styles.list}>
        {accounts.length ? (
          accounts.map((account, index) => (
            <div
              key={account.id || index}
              style={styles.listRow}
            >
              <span style={styles.rowIcon}>
                <Building2 size={16} />
              </span>
              <span style={styles.rowCopy}>
                <strong>
                  {account.bankName || account.bank || 'Bank account'}
                </strong>
                <span>
                  {account.type || 'Savings'} · ••••{' '}
                  {account.lastFour || '0000'}
                </span>
                <small>
                  {account.primary ? 'Primary account' : 'Linked account'} ·{' '}
                  {account.verified ? 'Verified' : 'Verify account'}
                </small>
              </span>
              <button
                type="button"
                onClick={() =>
                  showNotice('Account actions opened.')
                }
                style={styles.tinyButton}
                aria-label="Account actions"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="No bank accounts linked." />
        )}
      </div>

      <div style={styles.foundationNote}>
        <Sparkles size={15} />
        Auto payout and multi-account routing foundations ready.
      </div>
    </section>
  );

  const renderCards = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Cards"
        subtitle="Debit, credit, virtual, and business card controls."
        icon={CreditCard}
        action={
          <button
            type="button"
            onClick={() => {
              onAddCard?.();
              showNotice('Add card flow opened.');
            }}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Add card
          </button>
        }
      />

      <div style={styles.cardGrid}>
        {cards.length ? (
          cards.map((card, index) => (
            <div
              key={card.id || index}
              style={{
                ...styles.paymentCard,
                ...(card.type === 'credit'
                  ? styles.creditCard
                  : {}),
              }}
            >
              <div style={styles.paymentCardTop}>
                <span>
                  {card.brand || 'Aarush Card'}
                </span>
                <CreditCard size={17} />
              </div>
              <strong>
                •••• •••• •••• {card.lastFour || '0000'}
              </strong>
              <div style={styles.paymentCardBottom}>
                <span>
                  {card.type || 'Debit Card'}
                </span>
                <span>
                  {card.expiry || 'MM/YY'}
                </span>
              </div>
              <small>
                {card.status || 'Active'} · Spending controls
                foundation
              </small>
            </div>
          ))
        ) : (
          <Empty label="No cards linked." />
        )}
      </div>
    </section>
  );

  const renderPayments = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Send & Request"
        subtitle="Quick payment actions and scheduled payment foundations."
        icon={Send}
      />

      <div style={styles.paymentActions}>
        {[
          ['Send to Contact', UserRound],
          ['Send to Bank', Building2],
          ['Send via UPI', UpiIcon],
          ['Request Money', ArrowDownLeft],
          ['Split Payment foundation', Users],
          ['Payment Note', Receipt],
          ['Scheduled Payment foundation', Clock3],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() => {
              if (label.includes('Request')) {
                onRequestMoney?.();
              } else if (label.startsWith('Send')) {
                onSendMoney?.({ method: label });
              }
              showNotice(`${label} opened.`);
            }}
            style={styles.actionButton}
          >
            <Icon size={16} />
            <span>{label}</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>
    </section>
  );

  const renderCreator = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Creator Wallet"
        subtitle="Earnings, payouts, and withdrawable balance."
        icon={Sparkles}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Story revenue"
          value={money(wallet.storyRevenue, wallet.currency)}
          icon={Play}
          color="#4dd7ff"
        />
        <MetricCard
          label="Brand revenue"
          value={money(wallet.brandRevenue, wallet.currency)}
          icon={Building2}
          color="#a895ff"
        />
        <MetricCard
          label="Subscription revenue"
          value={money(
            wallet.subscriptionRevenue,
            wallet.currency
          )}
          icon={Users}
          color="#82e9c1"
        />
        <MetricCard
          label="Affiliate revenue"
          value={money(wallet.affiliateRevenue, wallet.currency)}
          icon={TrendingUp}
          color="#ffd27d"
        />
        <MetricCard
          label="Pending payouts"
          value={money(wallet.pendingPayouts, wallet.currency)}
          icon={Clock3}
          color="#ff9f72"
        />
        <MetricCard
          label="Withdrawable"
          value={money(
            wallet.withdrawableBalance,
            wallet.currency
          )}
          icon={WalletCards}
          color="#82e9c1"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          onWithdraw?.({
            amount: wallet.withdrawableBalance,
          });
          showNotice('Withdrawal flow opened.');
        }}
        style={styles.primaryButton}
      >
        <ArrowUpRight size={16} />
        Withdraw earnings
      </button>

      <div style={styles.payoutList}>
        {payouts.length ? (
          payouts.map((payout, index) => (
            <div
              key={payout.id || index}
              style={styles.payoutRow}
            >
              <span>{payout.date || formatDate(payout.createdAt)}</span>
              <strong>{money(payout.amount)}</strong>
              <small>{payout.status || 'Pending'}</small>
            </div>
          ))
        ) : (
          <Empty label="Payout history foundation ready." />
        )}
      </div>
    </section>
  );

  const renderBrands = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Brand Payments"
        subtitle="Invoices, campaigns, escrow, and contract-linked payments."
        icon={Receipt}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Pending invoices"
          value={invoices.filter(
            (invoice) => invoice.status !== 'Paid'
          ).length}
          icon={Receipt}
          color="#ffd27d"
        />
        <MetricCard
          label="Paid invoices"
          value={invoices.filter(
            (invoice) => invoice.status === 'Paid'
          ).length}
          icon={Check}
          color="#82e9c1"
        />
        <MetricCard
          label="Escrow"
          value={wallet.escrow || 'Foundation'}
          icon={LockKeyhole}
          color="#a895ff"
        />
        <MetricCard
          label="Campaign payments"
          value={money(wallet.campaignPayments, wallet.currency)}
          icon={Building2}
          color="#4dd7ff"
        />
      </div>

      <div style={styles.list}>
        {invoices.length ? (
          invoices.map((invoice, index) => (
            <div
              key={invoice.id || index}
              style={styles.listRow}
            >
              <span style={styles.rowIcon}>
                <Receipt size={16} />
              </span>
              <span style={styles.rowCopy}>
                <strong>
                  {invoice.number || `Invoice ${index + 1}`}
                </strong>
                <span>
                  {invoice.brand || 'Brand'} ·{' '}
                  {invoice.status || 'Draft'}
                </span>
                <small>
                  Due {formatDate(invoice.dueDate)}
                </small>
              </span>
              <strong>
                {money(invoice.amount, invoice.currency)}
              </strong>
            </div>
          ))
        ) : (
          <Empty label="No brand invoices yet." />
        )}
      </div>
    </section>
  );

  const renderSubscriptions = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Subscriptions"
        subtitle="Recurring creator, business, and workspace payments."
        icon={TicketPercent}
      />

      <div style={styles.subscriptionList}>
        {subscriptions.length ? (
          subscriptions.map((subscription, index) => (
            <div
              key={subscription.id || index}
              style={styles.subscriptionRow}
            >
              <span style={styles.rowIcon}>
                <TicketPercent size={16} />
              </span>
              <span style={styles.rowCopy}>
                <strong>
                  {subscription.name || 'Subscription'}
                </strong>
                <span>
                  {money(
                    subscription.amount,
                    subscription.currency
                  )}{' '}
                  · {subscription.frequency || 'Monthly'}
                </span>
                <small>
                  Next renewal{' '}
                  {formatDate(subscription.renewalDate)}
                </small>
              </span>
              <button
                type="button"
                onClick={() =>
                  showNotice('Subscription options opened.')
                }
                style={styles.tinyButton}
                aria-label="Subscription options"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="No active subscriptions." />
        )}
      </div>
    </section>
  );

  const renderTransactions = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Transactions"
        subtitle="Search payments, earnings, transfers, and purchases."
        icon={BarChart3}
        action={
          <button
            type="button"
            onClick={() => showNotice('Export prepared.')}
            style={styles.smallButton}
          >
            <DownloadIcon />
            Export
          </button>
        }
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search transactions"
          aria-label="Search transactions"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.filterRow}>
        {['All', 'Income', 'Payment', 'Pending', 'Completed'].map(
          (filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setTransactionFilter(filter)}
              aria-pressed={transactionFilter === filter}
              style={{
                ...styles.filterButton,
                ...(transactionFilter === filter
                  ? styles.activeFilterButton
                  : {}),
              }}
            >
              {filter}
            </button>
          )
        )}
      </div>

      <div style={styles.transactionList}>
        {filteredTransactions.length ? (
          filteredTransactions.map((transaction, index) => (
            <div
              key={transaction.id || index}
              style={styles.transactionRow}
            >
              <span
                style={{
                  ...styles.transactionIcon,
                  color:
                    transaction.direction === 'credit'
                      ? '#82e9c1'
                      : '#ff9f72',
                }}
              >
                {transaction.direction === 'credit' ? (
                  <ArrowDownLeft size={16} />
                ) : (
                  <ArrowUpRight size={16} />
                )}
              </span>
              <span style={styles.transactionCopy}>
                <strong>
                  {transaction.counterparty || 'Transaction'}
                </strong>
                <span>
                  {transaction.category || transaction.type || 'Payment'} ·{' '}
                  {formatDate(transaction.date || transaction.createdAt)}
                </span>
                <small>
                  {transaction.reference || 'Reference foundation'}
                </small>
              </span>
              <strong>
                {transaction.direction === 'credit' ? '+' : '-'}
                {money(transaction.amount, transaction.currency)}
              </strong>
            </div>
          ))
        ) : (
          <Empty label="No transactions found." />
        )}
      </div>
    </section>
  );

  const renderRewards = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Rewards"
        subtitle="Cashback, referrals, creator bonuses, and loyalty."
        icon={Gift}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Cashback"
          value={money(rewards.cashback, wallet.currency)}
          icon={Gift}
          color="#82e9c1"
        />
        <MetricCard
          label="Referral rewards"
          value={money(rewards.referrals, wallet.currency)}
          icon={Users}
          color="#4dd7ff"
        />
        <MetricCard
          label="Creator bonuses"
          value={money(rewards.creatorBonuses, wallet.currency)}
          icon={Sparkles}
          color="#a895ff"
        />
        <MetricCard
          label="Campaign rewards"
          value={money(rewards.campaignRewards, wallet.currency)}
          icon={Target}
          color="#ffd27d"
        />
      </div>

      <div style={styles.rewardActions}>
        <button
          type="button"
          onClick={() => showNotice('Rewards redemption opened.')}
          style={styles.primaryButton}
        >
          <Gift size={16} />
          Redeem rewards
        </button>
        <button
          type="button"
          onClick={() =>
            showNotice('Convert to wallet flow opened.')
          }
          style={styles.secondaryButton}
        >
          Convert to wallet balance
        </button>
      </div>
    </section>
  );

  const renderInsights = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Budget & Insights"
        subtitle="AI financial context for better decisions."
        icon={TrendingUp}
      />

      <div style={styles.insightList}>
        {[
          'Spending by category is ready for analysis.',
          'Income trend is being prepared from wallet activity.',
          'Savings trend foundation is ready.',
          'Subscription analysis can identify recurring costs.',
          'Creator earnings forecast is ready for integration.',
          'AI budget recommendations can be generated.',
        ].map((insight) => (
          <button
            type="button"
            key={insight}
            onClick={() => showNotice('Financial insight opened.')}
            style={styles.insightRow}
          >
            <Sparkles size={15} />
            <span>{insight}</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>
    </section>
  );

  const renderSecurity = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Security"
        subtitle="Protect payments, accounts, cards, and withdrawals."
        icon={ShieldCheck}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Biometric lock"
          value={security.biometric || 'Foundation'}
          icon={FingerprintIcon}
          color="#82e9c1"
        />
        <MetricCard
          label="PIN protection"
          value={security.pin || 'Protected'}
          icon={LockKeyhole}
          color="#4dd7ff"
        />
        <MetricCard
          label="Device verification"
          value={security.deviceVerification || 'Verified'}
          icon={ShieldCheck}
          color="#a895ff"
        />
        <MetricCard
          label="Trusted devices"
          value={security.trustedDevices || 'Foundation'}
          icon={Building2}
          color="#ffd27d"
        />
        <MetricCard
          label="Transaction alerts"
          value={security.transactionAlerts || 'Enabled'}
          icon={Bell}
          color="#9deeff"
        />
        <MetricCard
          label="Suspicious activity"
          value={security.suspiciousActivity || 'Clear'}
          icon={ShieldCheck}
          color="#ff7c9f"
        />
      </div>

      <div style={styles.securityNote}>
        <LockKeyhole size={16} />
        Recovery options and SecurityCenter integration
        foundation are active.
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'upi') return renderUpi();
    if (activeModule === 'accounts') return renderAccounts();
    if (activeModule === 'cards') return renderCards();
    if (activeModule === 'payments') return renderPayments();
    if (activeModule === 'creator') return renderCreator();
    if (activeModule === 'brands') return renderBrands();
    if (activeModule === 'subscriptions') {
      return renderSubscriptions();
    }
    if (activeModule === 'transactions') {
      return renderTransactions();
    }
    if (activeModule === 'rewards') return renderRewards();
    if (activeModule === 'insights') return renderInsights();
    if (activeModule === 'security') return renderSecurity();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close WalletOS"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>WalletOS</strong>
          <span>
            Your unified Aarush financial layer
          </span>
        </div>

        <button
          type="button"
          aria-label="Wallet settings"
          style={styles.iconButton}
        >
          <MoreHorizontal size={18} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <nav style={styles.moduleNav}>
          {MODULES.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveModule(id)}
              aria-pressed={activeModule === id}
              style={{
                ...styles.moduleButton,
                ...(activeModule === id
                  ? styles.activeModuleButton
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {renderModule()}
      </div>

      <style>{`
        @keyframes aarush-wallet-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-wallet-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-wallet-card:hover,
        .aarush-wallet-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-wallet-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-wallet-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-wallet-cards,
          .aarush-wallet-actions {
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

function QuickAction({ label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.quickAction}
    >
      <span style={styles.quickIcon}>
        <Icon size={17} />
      </span>
      <span>{label}</span>
    </button>
  );
}

function Avatar({ item }) {
  const source =
    item?.avatar || item?.image || item?.photo;

  if (source) {
    return (
      <img
        src={source}
        alt=""
        loading="lazy"
        style={styles.avatar}
      />
    );
  }

  return (
    <span style={styles.avatarFallback}>
      {String(item?.name || 'A')
        .charAt(0)
        .toUpperCase()}
    </span>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <WalletCards size={25} />
      <span>{label}</span>
    </div>
  );
}

function DownloadIcon() {
  return (
    <span style={styles.customIcon}>
      <Download size={14} />
    </span>
  );
}

function FingerprintIcon() {
  return (
    <span style={styles.customIcon}>
      <LockKeyhole size={16} />
    </span>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.58),#07090e 68%)',
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

  securityButton: {
    width: '2.55rem',
    height: '2.55rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(130,233,193,.25)',
    borderRadius: '999px',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
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
    width: 'min(100%, 1120px)',
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

  moduleNav: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    paddingBottom: '.2rem',
  },

  moduleButton: {
    minWidth: '5.9rem',
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.28rem',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeModuleButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  walletHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.85rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-wallet-pulse 3s ease-in-out infinite',
  },

  walletOrb: {
    width: '4.8rem',
    height: '4.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(77,215,255,.4)',
    borderRadius: '1.2rem',
    color: '#c9f9ff',
    background:
      'radial-gradient(circle,#3d6d8a,#262257 70%)',
  },

  walletCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.25rem',
    flex: 1,
  },

  aiBadge: {
    width: 'fit-content',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.56rem',
    fontWeight: 800,
  },

  walletCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1.45rem',
  },

  walletCopySpan: {
    color: '#9deeff',
    fontSize: '.61rem',
  },

  walletCopyP: {
    maxWidth: '38rem',
    margin: 0,
    color: '#91a0bc',
    fontSize: '.62rem',
    lineHeight: 1.45,
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
  },

  metricCard: {
    minHeight: '6.4rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    background: 'rgba(15,19,30,.9)',
    animation: 'aarush-wallet-in 240ms ease both',
  },

  metricIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.6rem',
  },

  metricLabel: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  metricValue: {
    color: '#fff',
    fontSize: '.79rem',
  },

  quickActions: {
    padding: '.9rem',
    border: '1px solid rgba(77,215,255,.16)',
    borderRadius: '1.1rem',
    background:
      'linear-gradient(135deg,rgba(77,215,255,.08),rgba(124,92,255,.05))',
  },

  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  quickAction: {
    minHeight: '4.2rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.3rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.8rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.59rem',
    cursor: 'pointer',
  },

  quickIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.7rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-wallet-in 240ms ease both',
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

  smallPrimary: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.59rem',
    fontWeight: 850,
    cursor: 'pointer',
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
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  upiHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.75rem',
    borderRadius: '.8rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
  },

  upiHeroDiv: {
    display: 'grid',
    gap: '.18rem',
  },

  upiHeroSpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  upiActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
    marginTop: '.7rem',
  },

  list: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  listRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  rowIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  rowCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  rowCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  rowCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  tinyButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.5rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    cursor: 'pointer',
  },

  foundationNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    marginTop: '.7rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.05)',
    fontSize: '.58rem',
  },

  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.5rem',
  },

  paymentCard: {
    minHeight: '10rem',
    display: 'grid',
    alignContent: 'space-between',
    gap: '.6rem',
    padding: '.75rem',
    border: '1px solid rgba(77,215,255,.25)',
    borderRadius: '1rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#244b67,#242052 70%)',
  },

  creditCard: {
    background:
      'linear-gradient(135deg,#4c2757,#191b42 70%)',
  },

  paymentCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#c9f9ff',
    fontSize: '.6rem',
  },

  paymentCardStrong: {
    letterSpacing: '.08em',
  },

  paymentCardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#cbd6ec',
    fontSize: '.55rem',
  },

  paymentCardSmall: {
    color: '#91a0bc',
    fontSize: '.52rem',
  },

  paymentActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  actionButton: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  payoutList: {
    display: 'grid',
    gap: '.35rem',
    marginTop: '.7rem',
  },

  payoutRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: '.5rem',
    alignItems: 'center',
    minHeight: '2.25rem',
    padding: '0 .55rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  payoutRowStrong: {
    color: '#82e9c1',
  },

  payoutRowSmall: {
    color: '#6f7d98',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    width: '100%',
    marginTop: '.7rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  secondaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    width: '100%',
    marginTop: '.4rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  invoiceList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  transactionList: {
    display: 'grid',
    gap: '.4rem',
  },

  transactionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  transactionIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    background: 'rgba(255,255,255,.06)',
  },

  transactionCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  transactionCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  transactionCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  filterRow: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    marginBottom: '.6rem',
    paddingBottom: '.2rem',
  },

  filterButton: {
    minHeight: '2.1rem',
    flexShrink: 0,
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.55rem',
    cursor: 'pointer',
  },

  activeFilterButton: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background: 'rgba(124,92,255,.16)',
  },

  rewardActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  insightList: {
    display: 'grid',
    gap: '.4rem',
  },

  insightRow: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .6rem',
    border: '1px solid rgba(124,92,255,.15)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  securityNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.06)',
    fontSize: '.59rem',
  },

  empty: {
    minHeight: '6rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gridColumn: '1 / -1',
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.64rem',
    textAlign: 'center',
  },

  customIcon: {
    display: 'grid',
    placeItems: 'center',
  },
};