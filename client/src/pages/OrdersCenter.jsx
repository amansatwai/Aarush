import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Package,
  Plus,
  RefreshCw,
  Truck,
  Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useOrders from '../hooks/useOrders';
import {
  createOrder,
  generateInvoice,
  updateOrderStatus,
} from '../utils/orderManagementEngine';
import {
  createProduct,
  updateStock,
} from '../utils/inventoryEngine';

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
      className="orders-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="orders-action-icon">
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

export default function OrdersCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    orders,
    analytics,
    inventory,
    loading,
    error,
    refresh,
  } = useOrders();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');
  const [filter, setFilter] = useState('all');

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
          'Unable to complete commerce action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const guestGuard = () => {
    if (guest) {
      navigate('/login');
      return true;
    }

    return false;
  };

  const createProductDraft = () => {
    if (guestGuard()) return;

    runAction(
      () =>
        createProduct({
          title: 'New product',
          product_type: 'Physical Product',
          category: 'Other',
          status: 'draft',
          stock: 0,
          low_stock_threshold: 5,
        }),
      'Product draft created.'
    );
  };

  const createOrderDraft = () => {
    if (guestGuard()) return;

    const productId = window.prompt(
      'Enter product ID:'
    );

    if (!productId) return;

    runAction(
      () =>
        createOrder({
          product_id: productId,
          amount: 0,
          status: 'Draft',
        }),
      'Order draft created.'
    );
  };

  const visibleOrders = useMemo(() => {
    if (filter === 'all') return orders;

    if (filter === 'active') {
      return orders.filter((order) =>
        [
          'Confirmed',
          'Paid',
          'Processing',
          'Packed',
          'Shipped',
          'In Transit',
        ].includes(order.status)
      );
    }

    return orders.filter(
      (order) => order.status === filter
    );
  }, [filter, orders]);

  if (loading) {
    return (
      <div className="social-page orders-page">
        <TopBar />

        <main className="orders-content">
          <div className="orders-loading-header" />
          <div className="orders-loading-card" />
          <div className="orders-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page orders-page">
      <TopBar />

      <main className="orders-content">
        <header className="orders-header">
          <button
            type="button"
            className="orders-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="orders-eyebrow">
              Commerce operations
            </p>
            <h1>Orders Center</h1>
          </div>

          <button
            type="button"
            className="orders-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh orders"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="orders-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="orders-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="orders-status-card">
          <div className="orders-status-icon">
            <ClipboardList size={27} />
          </div>

          <div className="orders-status-copy">
            <p>Order overview</p>
            <h2>
              {analytics?.active || 0} active orders
            </h2>
            <span>
              {analytics?.total || 0} total orders
              {' · '}
              Revenue ₹{analytics?.revenue || 0}
            </span>
          </div>

          <button
            type="button"
            className="orders-primary-button"
            onClick={createOrderDraft}
            disabled={guest || busy}
          >
            <Plus size={15} />
            New order
          </button>
        </section>

        <section className="orders-metric-grid">
          <article className="orders-metric">
            <ClipboardList size={18} />
            <span>Pending</span>
            <strong>{analytics?.pending || 0}</strong>
          </article>

          <article className="orders-metric">
            <Truck size={18} />
            <span>Shipping</span>
            <strong>{analytics?.active || 0}</strong>
          </article>

          <article className="orders-metric">
            <Check size={18} />
            <span>Completed</span>
            <strong>{analytics?.completed || 0}</strong>
          </article>

          <article className="orders-metric">
            <Package size={18} />
            <span>Low stock</span>
            <strong>{inventory?.low_stock || 0}</strong>
          </article>
        </section>

        <section className="orders-section">
          <div className="orders-section-heading">
            <ClipboardList size={17} />
            <div>
              <h2>Order management</h2>
              <p>
                Track orders, shipping, refunds, and receipts.
              </p>
            </div>
          </div>

          <div className="orders-card">
            <div className="orders-filter-row">
              {[
                ['all', 'All'],
                ['active', 'Active'],
                ['Completed', 'Completed'],
                ['Cancelled', 'Cancelled'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  className={
                    filter === value
                      ? 'is-active'
                      : undefined
                  }
                  onClick={() => setFilter(value)}
                  key={value}
                >
                  {label}
                </button>
              ))}
            </div>

            {visibleOrders.length === 0 ? (
              <div className="orders-empty">
                <ClipboardList size={23} />
                <span>No orders in this view.</span>
              </div>
            ) : (
              visibleOrders.slice(0, 20).map((order) => (
                <article
                  className="order-row"
                  key={order.id}
                >
                  <div className="order-icon">
                    <Package size={17} />
                  </div>

                  <div>
                    <strong>
                      Order {order.id.slice(0, 8)}
                    </strong>
                    <span>
                      {order.status}
                      {' · '}
                      ₹{order.amount || 0}
                    </span>
                    <small>
                      {formatDate(order.created_at)}
                    </small>
                  </div>

                  <select
                    value={order.status}
                    onChange={(event) =>
                      runAction(
                        () =>
                          updateOrderStatus(
                            order.id,
                            event.target.value
                          ),
                        'Order status updated.'
                      )
                    }
                    disabled={busy || guest}
                  >
                    {[
                      'Draft',
                      'Pending',
                      'Confirmed',
                      'Paid',
                      'Processing',
                      'Packed',
                      'Shipped',
                      'In Transit',
                      'Delivered',
                      'Completed',
                      'Cancelled',
                      'Refunded',
                    ].map((state) => (
                      <option
                        value={state}
                        key={state}
                      >
                        {state}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="orders-small-button"
                    onClick={() =>
                      runAction(
                        () =>
                          generateInvoice(order.id),
                        'Invoice generated.'
                      )
                    }
                    disabled={busy || guest}
                  >
                    Invoice
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="orders-section">
          <div className="orders-section-heading">
            <Package size={17} />
            <div>
              <h2>Inventory status</h2>
              <p>
                Track products, stock, reserves, and availability.
              </p>
            </div>
          </div>

          <div className="orders-card">
            <ActionRow
              icon={<Plus size={18} />}
              title="Create product"
              description="Add a physical, digital, service, or appointment product."
              onClick={createProductDraft}
              disabled={busy || guest}
            />

            <ActionRow
              icon={<Package size={18} />}
              title="Update inventory"
              description={`${inventory?.total_products || 0} products · ${inventory?.out_of_stock || 0} out of stock`}
              onClick={() => {
                if (guestGuard()) return;

                const productId = window.prompt(
                  'Enter product ID:'
                );
                const amount = window.prompt(
                  'Enter stock quantity:'
                );

                if (!productId || !amount) return;

                runAction(
                  () =>
                    updateStock(
                      productId,
                      Number(amount)
                    ),
                  'Inventory updated.'
                );
              }}
              disabled={busy || guest}
            />

            <ActionRow
              icon={<AlertTriangle size={18} />}
              title="Low stock alerts"
              description={`${inventory?.low_stock || 0} products need attention.`}
              onClick={() =>
                setNotice(
                  'Low-stock inventory view is ready.'
                )
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="orders-section">
          <div className="orders-section-heading">
            <Wrench size={17} />
            <div>
              <h2>Creator commerce</h2>
              <p>
                Prepare digital products, consultations, bookings, and subscriptions.
              </p>
            </div>
          </div>

          <div className="orders-card">
            <ActionRow
              icon={<Wrench size={18} />}
              title="Manage bookings"
              description="Prepare consultation and appointment time slots."
              onClick={() =>
                navigate('/creator-tools')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Commerce analytics"
              description="Review earnings, sales, and payout readiness."
              onClick={() =>
                navigate('/marketplace-analytics')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Truck size={18} />}
              title="Shipping queue"
              description="Prepare tracking, courier, pickup, and delivery states."
              onClick={() =>
                setNotice(
                  'Shipping queue preparation is ready.'
                )
              }
              disabled={busy}
            />
          </div>
        </section>

        <p className="orders-footer">
          Order and inventory operations are prepared for
          server-side authorization, courier integrations,
          payment verification, and future booking systems.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .orders-page {
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

  .orders-content {
    width: min(100%, 1000px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .orders-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .orders-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .orders-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .orders-icon-button {
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

  .orders-icon-button:last-child {
    justify-self: end;
  }

  .orders-error,
  .orders-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .orders-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .orders-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .orders-status-card,
  .orders-card,
  .orders-metric {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .orders-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .orders-status-icon {
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

  .orders-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .orders-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .orders-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .orders-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .orders-primary-button {
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

  .orders-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .orders-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .orders-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .orders-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .orders-metric strong {
    color: #edf2ff;
    font-size: 0.95rem;
  }

  .orders-section {
    margin-top: 1.3rem;
  }

  .orders-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .orders-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .orders-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .orders-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .orders-filter-row {
    display: flex;
    gap: 0.35rem;
    overflow-x: auto;
    padding: 0.8rem;
    scrollbar-width: none;
  }

  .orders-filter-row::-webkit-scrollbar {
    display: none;
  }

  .orders-filter-row button {
    min-height: 2rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 999px;
    color: #8491ad;
    background: rgba(255,255,255,0.05);
    font-size: 0.66rem;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
  }

  .orders-filter-row button.is-active {
    border-color: rgba(124,92,255,0.35);
    color: #fff;
    background: rgba(124,92,255,0.2);
  }

  .order-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.5rem;
    padding: 0.8rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .order-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .order-row > div:nth-child(2) {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .order-row strong {
    color: #edf2ff;
    font-size: 0.76rem;
  }

  .order-row span,
  .order-row small {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .order-row select {
    max-width: 7rem;
    min-height: 2rem;
    padding: 0.35rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.6rem;
    outline: 0;
    color: #edf2ff;
    background: #171d30;
    font-size: 0.62rem;
  }

  .orders-small-button {
    min-height: 2rem;
    padding: 0.45rem 0.55rem;
    border: 1px solid rgba(77,215,255,0.2);
    border-radius: 0.6rem;
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
    font-size: 0.62rem;
    font-weight: 850;
    cursor: pointer;
  }

  .orders-action-row {
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

  .orders-action-row + .orders-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .orders-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .orders-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .orders-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .orders-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .orders-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .orders-action-row > svg {
    color: #7483a1;
  }

  .orders-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .orders-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .orders-loading-header,
  .orders-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: orders-skeleton 1.4s infinite;
  }

  .orders-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .orders-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes orders-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .orders-metric-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .order-row {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .order-row select {
      margin-left: 3rem;
    }
  }

  @media (max-width: 560px) {
    .orders-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .orders-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .orders-primary-button {
      margin-left: auto;
    }
  }
`;