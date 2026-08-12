import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  History,
  Lock,
  RefreshCw,
  ShoppingBag,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import usePayments from '../hooks/usePayments';
import {
  addFunds,
  exportTransactions,
  withdrawFunds,
} from '../utils/walletEngine';
import {
  generateInvoice,
  processRefund,
} from '../utils/paymentEngine';

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

function formatDate(value) {
  if (!value) return 'Unknown';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
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
      className="payments-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="payments-action-icon">
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

export default function PaymentsCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    wallet,
    orders,
    transactions,
    loading,
    error,
    refresh,
  } = usePayments();

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
          'Unable to complete payment action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAddFunds = () => {
    if (guestGuard()) return;

    const amount = window.prompt(
      'Enter amount to add:'
    );

    if (!amount) return;

    runAction(
      () => addFunds(Number(amount)),
      'Add-funds request created.'
    );
  };

  const handleWithdraw = () => {
    if (guestGuard()) return;

    const amount = window.prompt(
      'Enter amount to withdraw:'
    );

    if (!amount) return;

    runAction(
      () => withdrawFunds(Number(amount)),
      'Withdrawal request created.'
    );
  };

  const handleExport = () => {
    if (guestGuard()) return;

    runAction(
      exportTransactions,
      'Transactions exported.'
    );
  };

  const handleRefund = (order) => {
    if (guestGuard()) return;

    const reason = window.prompt(
      'Enter refund reason:'
    );

    if (!reason) return;

    runAction(
      () => processRefund(order.id, reason),
      'Refund request submitted.'
    );
  };

  if (loading) {
    return (
      <div className="social-page payments-page">
        <TopBar />

        <main className="payments-content">
          <div className="payments-loading-header" />
          <div className="payments-loading-card" />
          <div className="payments-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page payments-page">
      <TopBar />

      <main className="payments-content">
        <header className="payments-header">
          <button
            type="button"
            className="payments-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="payments-eyebrow">
              Transactions
            </p>
            <h1>Payments Center</h1>
          </div>

          <button
            type="button"
            className="payments-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh payments"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="payments-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="payments-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="payments-wallet-card">
          <div className="payments-wallet-icon">
            <Wallet size={28} />
          </div>

          <div className="payments-wallet-copy">
            <p>Wallet balance</p>
            <h2>
              {wallet?.currency || 'INR'}{' '}
              {Number(wallet?.balance || 0).toFixed(2)}
            </h2>
            <span>
              {guest
                ? 'Browse-only guest mode'
                : wallet?.status || 'Active'}
            </span>
          </div>

          <button
            type="button"
            className="payments-primary-button"
            onClick={handleAddFunds}
            disabled={guest || busy}
          >
            Add funds
          </button>
        </section>

        <section className="payments-section">
          <div className="payments-section-heading">
            <Wallet size={17} />
            <div>
              <h2>Wallet actions</h2>
              <p>
                Wallet actions are prepared for future provider integration.
              </p>
            </div>
          </div>

          <div className="payments-card">
            <ActionRow
              icon={<Wallet size={18} />}
              title="Add funds"
              description="Prepare UPI, card, and net-banking top-ups."
              onClick={handleAddFunds}
              disabled={guest || busy}
            />

            <ActionRow
              icon={<CreditCard size={18} />}
              title="Withdraw funds"
              description="Prepare creator and business payout requests."
              onClick={handleWithdraw}
              disabled={guest || busy}
            />

            <ActionRow
              icon={<Download size={18} />}
              title="Export transactions"
              description="Download wallet transaction history."
              onClick={handleExport}
              disabled={guest || busy}
            />
          </div>
        </section>

        <section className="payments-section">
          <div className="payments-section-heading">
            <ShoppingBag size={17} />
            <div>
              <h2>Orders</h2>
              <p>
                Track marketplace order and payment states.
              </p>
            </div>
          </div>

          <div className="payments-card">
            {orders.length === 0 ? (
              <div className="payments-empty">
                <ShoppingBag size={23} />
                <span>No orders yet.</span>
              </div>
            ) : (
              orders.slice(0, 10).map((order) => (
                <article
                  className="payments-order-row"
                  key={order.id}
                >
                  <div className="payments-order-icon">
                    <ShoppingBag size={17} />
                  </div>

                  <div>
                    <strong>
                      Order {order.id.slice(0, 8)}
                    </strong>
                    <span>
                      {order.currency || 'INR'}{' '}
                      {order.amount}
                      {' · '}
                      {order.status}
                    </span>
                    <small>
                      {formatDate(order.created_at)}
                    </small>
                  </div>

                  <div className="payments-order-actions">
                    <button
                      type="button"
                      onClick={() =>
                        runAction(
                          () =>
                            generateInvoice(order.id),
                          'Invoice generated.'
                        )
                      }
                      disabled={busy}
                    >
                      Invoice
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRefund(order)
                      }
                      disabled={
                        busy ||
                        ![
                          'Paid',
                          'Completed',
                          'Delivered',
                        ].includes(order.status)
                      }
                    >
                      Refund
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="payments-section">
          <div className="payments-section-heading">
            <History size={17} />
            <div>
              <h2>Recent transactions</h2>
              <p>
                Wallet, payout, transfer, and refund activity.
              </p>
            </div>
          </div>

          <div className="payments-card">
            {transactions.length === 0 ? (
              <div className="payments-empty">
                <History size={23} />
                <span>No transactions yet.</span>
              </div>
            ) : (
              transactions.slice(0, 12).map((transaction) => (
                <article
                  className="payments-transaction-row"
                  key={transaction.id}
                >
                  <div>
                    <strong>
                      {transaction.type}
                    </strong>
                    <span>
                      {transaction.status}
                      {' · '}
                      {formatDate(
                        transaction.created_at
                      )}
                    </span>
                  </div>

                  <b>
                    {transaction.amount}
                  </b>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="payments-section">
          <div className="payments-section-heading">
            <Lock size={17} />
            <div>
              <h2>Payment security</h2>
              <p>
                Secure verification and fraud-monitoring preparation.
              </p>
            </div>
          </div>

          <div className="payments-card">
            <ActionRow
              icon={<Lock size={18} />}
              title="Payment verification"
              description="Review payment provider verification state."
              onClick={() =>
                navigate('/security-center')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Suspicious transaction monitoring"
              description="Review security and threat signals."
              onClick={() =>
                navigate('/threat-center')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<ShoppingBag size={18} />}
              title="Creator and business earnings"
              description="Prepare payouts, subscriptions, and settlements."
              onClick={() =>
                navigate('/marketplace')
              }
              disabled={busy}
            />
          </div>
        </section>

        <p className="payments-footer">
          Payment provider processing, fund settlement,
          refunds, payouts, and tax handling must be
          completed through a trusted server-side payment
          provider integration.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .payments-page {
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

  .payments-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .payments-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .payments-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .payments-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .payments-icon-button {
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

  .payments-icon-button:last-child {
    justify-self: end;
  }

  .payments-error,
  .payments-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .payments-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .payments-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .payments-wallet-card,
  .payments-card,
  .payments-metric {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .payments-wallet-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .payments-wallet-icon {
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

  .payments-wallet-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .payments-wallet-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .payments-wallet-copy h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .payments-wallet-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
    text-transform: capitalize;
  }

  .payments-primary-button {
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

  .payments-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .payments-section {
    margin-top: 1.3rem;
  }

  .payments-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .payments-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .payments-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .payments-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .payments-action-row,
  .payments-order-row,
  .payments-transaction-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .payments-action-row + .payments-action-row,
  .payments-order-row + .payments-order-row,
  .payments-transaction-row + .payments-transaction-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .payments-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .payments-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .payments-action-icon,
  .payments-order-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .payments-action-row > span,
  .payments-order-row > div:nth-child(2),
  .payments-transaction-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .payments-action-row strong,
  .payments-order-row strong,
  .payments-transaction-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .payments-action-row small,
  .payments-order-row span,
  .payments-order-row small,
  .payments-transaction-row span {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .payments-action-row > svg {
    color: #7483a1;
  }

  .payments-order-actions {
    display: flex;
    gap: 0.3rem;
  }

  .payments-order-actions button {
    min-height: 2rem;
    padding: 0.45rem 0.5rem;
    border: 1px solid rgba(77,215,255,0.2);
    border-radius: 0.6rem;
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
    font-size: 0.62rem;
    font-weight: 850;
    cursor: pointer;
  }

  .payments-order-actions button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .payments-transaction-row b {
    color: #c9f9ff;
    font-size: 0.76rem;
  }

  .payments-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .payments-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .payments-loading-header,
  .payments-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: payments-skeleton 1.4s infinite;
  }

  .payments-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .payments-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes payments-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .payments-order-row {
      align-items: flex-start;
    }

    .payments-order-actions {
      flex-direction: column;
    }
  }

  @media (max-width: 560px) {
    .payments-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .payments-wallet-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .payments-primary-button {
      margin-left: auto;
    }
  }
`;