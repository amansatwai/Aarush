import { useMemo, useState } from 'react';
import {
  BarChart3,
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileText,
  Filter,
  Package,
  Plus,
  Receipt,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Truck,
  UserRound,
  Users,
  WalletCards,
  X,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', Briefcase],
  ['sales', 'Sales', Target],
  ['customers', 'Customers', Users],
  ['products', 'Products', Package],
  ['orders', 'Orders', ClipboardList],
  ['inventory', 'Inventory', Package],
  ['invoices', 'Invoices', Receipt],
  ['payments', 'Payments', WalletCards],
  ['employees', 'Employees', Users],
  ['payroll', 'Payroll', CircleDollarSign],
  ['accounting', 'Accounting', BarChart3],
  ['marketing', 'Marketing', Sparkles],
  ['analytics', 'Analytics', TrendingUp],
  ['assistant', 'AI Assistant', Sparkles],
];

const SALES_STAGES = [
  'Lead',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost',
];

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
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

function normalizeProduct(product, index) {
  return {
    ...product,
    id: product?.id || `product-${index}`,
    name: product?.name || product?.title || 'Product',
    sku: product?.sku || `SKU-${index + 1}`,
    price: numeric(product?.price),
    stock: numeric(product?.stock || product?.inventory),
    category: product?.category || 'General',
    status: product?.status || 'Active',
  };
}

function normalizeOrder(order, index) {
  return {
    ...order,
    id: order?.id || `order-${index}`,
    customer:
      order?.customer ||
      order?.customerName ||
      'Customer',
    amount: numeric(order?.amount || order?.total),
    status: order?.status || 'Pending',
    date: order?.date || order?.createdAt || null,
  };
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

export default function BusinessOS({
  business = {},
  customers = [],
  products = [],
  orders = [],
  invoices = [],
  employees = [],
  inventory = [],
  payments = [],
  analytics = {},
  marketing = {},
  onCreateInvoice,
  onCreateOrder,
  onAddProduct,
  onAddEmployee,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [search, setSearch] = useState('');
  const [salesStage, setSalesStage] =
    useState('Lead');
  const [orderStatus, setOrderStatus] =
    useState('All');
  const [notice, setNotice] = useState('');
  const [invoiceModal, setInvoiceModal] =
    useState(false);
  const [invoiceCustomer, setInvoiceCustomer] =
    useState('');
  const [invoiceAmount, setInvoiceAmount] =
    useState('');

  const normalizedProducts = useMemo(
    () => products.map(normalizeProduct),
    [products]
  );

  const normalizedOrders = useMemo(
    () => orders.map(normalizeOrder),
    [orders]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return normalizedProducts;

    return normalizedProducts.filter((product) =>
      [
        product.name,
        product.sku,
        product.category,
        product.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [normalizedProducts, search]);

  const filteredOrders = useMemo(
    () =>
      normalizedOrders.filter(
        (order) =>
          orderStatus === 'All' ||
          order.status === orderStatus
      ),
    [normalizedOrders, orderStatus]
  );

  const totalRevenue =
    numeric(business.totalRevenue) ||
    numeric(analytics.totalRevenue);

  const monthlySales =
    numeric(business.monthlySales) ||
    numeric(analytics.monthlySales);

  const inventoryValue = useMemo(
    () =>
      normalizedProducts.reduce(
        (total, product) =>
          total + product.price * product.stock,
        0
      ),
    [normalizedProducts]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const createInvoice = () => {
    if (!invoiceCustomer.trim() || !invoiceAmount) {
      showNotice('Enter customer and amount.');
      return;
    }

    onCreateInvoice?.({
      customer: invoiceCustomer.trim(),
      amount: Number(invoiceAmount),
      status: 'Draft',
      businessId: business.id || business.businessId,
    });

    setInvoiceCustomer('');
    setInvoiceAmount('');
    setInvoiceModal(false);
    showNotice('Invoice created.');
  };

  const renderOverview = () => (
    <>
      <section style={styles.businessHero}>
        <div style={styles.businessOrb}>
          <Briefcase size={31} />
        </div>
        <div style={styles.businessCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Aarush BusinessOS
          </span>
          <h1>
            {business.name || 'Your business command center'}
          </h1>
          <p>
            Manage sales, customers, products, payments,
            employees, marketing, and financial intelligence in
            one business workspace.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <ShieldCheck size={13} />
              {business.status || 'Business active'}
            </span>
            <span>
              <Sparkles size={13} />
              Health:{' '}
              {business.healthScore || analytics.healthScore || 88}/100
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Total revenue"
          value={money(totalRevenue, business.currency)}
          icon={CircleDollarSign}
          color="#82e9c1"
        />
        <MetricCard
          label="Monthly sales"
          value={money(monthlySales, business.currency)}
          icon={TrendingUp}
          color="#4dd7ff"
        />
        <MetricCard
          label="Active customers"
          value={customers.length}
          icon={Users}
          color="#a895ff"
        />
        <MetricCard
          label="Pending invoices"
          value={invoices.filter(
            (invoice) => invoice.status !== 'Paid'
          ).length}
          icon={Receipt}
          color="#ffd27d"
        />
        <MetricCard
          label="Inventory value"
          value={money(inventoryValue, business.currency)}
          icon={Package}
          color="#9deeff"
        />
        <MetricCard
          label="Employees"
          value={employees.length}
          icon={Users}
          color="#ff4fd8"
        />
        <MetricCard
          label="Profit estimate"
          value={money(
            business.profitEstimate ||
              analytics.profitEstimate,
            business.currency
          )}
          icon={BarChart3}
          color="#82e9c1"
        />
        <MetricCard
          label="Business health"
          value={`${business.healthScore || 88}/100`}
          icon={ShieldCheck}
          color="#ff9f72"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Business Pulse"
          subtitle="Current operational signals."
          icon={ActivityIcon}
        />

        <div style={styles.pulseGrid}>
          <Pulse
            label="Sales pipeline"
            value={business.pipelineStatus || 'Active'}
            color="#4dd7ff"
          />
          <Pulse
            label="Payment success"
            value={
              analytics.paymentSuccessRate
                ? `${analytics.paymentSuccessRate}%`
                : 'Foundation'
            }
            color="#82e9c1"
          />
          <Pulse
            label="Low-stock alerts"
            value={normalizedProducts.filter(
              (product) => product.stock <= 5
            ).length}
            color="#ffd27d"
          />
          <Pulse
            label="AI forecast"
            value={analytics.aiForecast || 'Ready'}
            color="#a895ff"
          />
        </div>
      </section>
    </>
  );

  const renderSales = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Sales"
        subtitle="Track opportunities from lead to close."
        icon={Target}
        action={
          <button
            type="button"
            onClick={() =>
              showNotice('Create deal flow opened.')
            }
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Create deal
          </button>
        }
      />

      <div style={styles.stageTabs}>
        {SALES_STAGES.map((stage) => (
          <button
            type="button"
            key={stage}
            onClick={() => setSalesStage(stage)}
            aria-pressed={salesStage === stage}
            style={{
              ...styles.stageButton,
              ...(salesStage === stage
                ? styles.activeStageButton
                : {}),
            }}
          >
            {stage}
          </button>
        ))}
      </div>

      <div style={styles.salesList}>
        {(business.salesPipeline || [])
          .filter((deal) => deal.stage === salesStage)
          .map((deal, index) => (
            <div
              key={deal.id || index}
              style={styles.salesRow}
            >
              <span style={styles.salesIcon}>
                <Target size={16} />
              </span>
              <span style={styles.salesCopy}>
                <strong>
                  {deal.title || deal.name || 'Sales opportunity'}
                </strong>
                <span>
                  {deal.customer || 'Customer'} ·{' '}
                  {deal.priority || 'Medium'} priority
                </span>
              </span>
              <strong>
                {money(deal.value, business.currency)}
              </strong>
              <ChevronRight size={15} />
            </div>
          ))}
        {!business.salesPipeline?.filter(
          (deal) => deal.stage === salesStage
        ).length ? (
          <Empty label={`No deals in ${salesStage}.`} />
        ) : null}
      </div>

      <div style={styles.forecastNote}>
        <Sparkles size={15} />
        AI sales suggestion:{' '}
        {business.salesSuggestion ||
          'Follow up with qualified opportunities this week.'}
      </div>
    </section>
  );

  const renderCustomers = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Customers CRM"
        subtitle="Customer relationships, spend, notes, and communication history."
        icon={Users}
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search customers"
          aria-label="Search customers"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.customerList}>
        {customers.length ? (
          customers
            .filter((customer) =>
              !search
                ? true
                : [
                    customer.name,
                    customer.email,
                    customer.company,
                    customer.tags?.join?.(' '),
                  ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
            .map((customer, index) => (
              <div
                key={customer.id || index}
                style={styles.customerRow}
              >
                <Avatar item={customer} />
                <span style={styles.customerCopy}>
                  <strong>
                    {customer.name || 'Customer'}
                  </strong>
                  <span>
                    {customer.email || 'Contact foundation'} ·{' '}
                    {customer.company || 'Individual'}
                  </span>
                  <small>
                    Last order:{' '}
                    {formatDate(customer.lastOrder)} ·{' '}
                    {customer.loyaltyLevel || 'Loyalty foundation'}
                  </small>
                </span>
                <strong>
                  {money(customer.totalSpent, business.currency)}
                </strong>
                <ChevronRight size={15} />
              </div>
            ))
        ) : (
          <Empty label="No customers yet." />
        )}
      </div>
    </section>
  );

  const renderProducts = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Products"
        subtitle="Catalog, pricing, stock, and product status."
        icon={Package}
        action={
          <button
            type="button"
            onClick={() => {
              onAddProduct?.();
              showNotice('Add product flow opened.');
            }}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Add product
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
          placeholder="Search products or SKU"
          aria-label="Search products"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.productGrid}>
        {filteredProducts.length ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              style={styles.productCard}
            >
              {product.image || product.thumbnail ? (
                <img
                  src={product.image || product.thumbnail}
                  alt={product.name}
                  loading="lazy"
                  style={styles.productImage}
                />
              ) : (
                <div style={styles.productPlaceholder}>
                  <Package size={26} />
                </div>
              )}
              <strong>{product.name}</strong>
              <span>{product.sku} · {product.category}</span>
              <div style={styles.productMeta}>
                <strong>
                  {money(product.price, business.currency)}
                </strong>
                <span>
                  {product.stock} in stock
                </span>
              </div>
              <small>{product.status}</small>
              <button
                type="button"
                onClick={() =>
                  showNotice('Product actions opened.')
                }
                style={styles.productButton}
              >
                <MoreHorizontal size={13} />
                Manage
              </button>
            </div>
          ))
        ) : (
          <Empty label="No products found." />
        )}
      </div>
    </section>
  );

  const renderOrders = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Orders"
        subtitle="Track fulfillment and customer orders."
        icon={ClipboardList}
        action={
          <button
            type="button"
            onClick={() => {
              onCreateOrder?.();
              showNotice('Create order flow opened.');
            }}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Create order
          </button>
        }
      />

      <div style={styles.filterRow}>
        {['All', ...ORDER_STATUSES].map((status) => (
          <button
            type="button"
            key={status}
            onClick={() => setOrderStatus(status)}
            aria-pressed={orderStatus === status}
            style={{
              ...styles.filterButton,
              ...(orderStatus === status
                ? styles.activeFilterButton
                : {}),
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <div style={styles.orderList}>
        {filteredOrders.length ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              style={styles.orderRow}
            >
              <span style={styles.orderIcon}>
                <ClipboardList size={16} />
              </span>
              <span style={styles.orderCopy}>
                <strong>
                  {order.customer}
                </strong>
                <span>
                  {order.product || 'Order'} ·{' '}
                  {formatDate(order.date)}
                </span>
                <small>
                  {order.status} ·{' '}
                  {order.reference || 'Reference foundation'}
                </small>
              </span>
              <strong>
                {money(order.amount, business.currency)}
              </strong>
              <ChevronRight size={15} />
            </div>
          ))
        ) : (
          <Empty label="No orders in this view." />
        )}
      </div>
    </section>
  );

  const renderInventory = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Inventory"
        subtitle="Stock levels, alerts, movements, and reorder suggestions."
        icon={Package}
      />

      <div style={styles.inventoryList}>
        {(inventory.length ? inventory : normalizedProducts).length ? (
          (inventory.length ? inventory : normalizedProducts).map(
            (item, index) => {
              const stock = numeric(
                item.stock || item.availableStock
              );
              const low = stock > 0 && stock <= 5;
              const out = stock <= 0;

              return (
                <div
                  key={item.id || index}
                  style={styles.inventoryRow}
                >
                  <span style={styles.inventoryIcon}>
                    <Package size={16} />
                  </span>
                  <span style={styles.inventoryCopy}>
                    <strong>
                      {item.name || item.product || 'Inventory item'}
                    </strong>
                    <span>
                      Available {stock} · Reserved{' '}
                      {numeric(item.reservedStock)}
                    </span>
                    <small>
                      {item.warehouse || 'Warehouse foundation'} ·{' '}
                      {item.reorderSuggestion || 'No reorder set'}
                    </small>
                  </span>
                  <span
                    style={{
                      ...styles.stockStatus,
                      color: out
                        ? '#ff7c9f'
                        : low
                          ? '#ffd27d'
                          : '#82e9c1',
                    }}
                  >
                    {out
                      ? 'Out of stock'
                      : low
                        ? 'Low stock'
                        : 'In stock'}
                  </span>
                </div>
              );
            }
          )
        ) : (
          <Empty label="No inventory items." />
        )}
      </div>
    </section>
  );

  const renderInvoices = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Invoices"
        subtitle="Create, send, and track business invoices."
        icon={Receipt}
        action={
          <button
            type="button"
            onClick={() => setInvoiceModal(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Create invoice
          </button>
        }
      />

      <div style={styles.invoiceList}>
        {invoices.length ? (
          invoices.map((invoice, index) => (
            <div
              key={invoice.id || index}
              style={styles.invoiceRow}
            >
              <span style={styles.invoiceIcon}>
                <Receipt size={16} />
              </span>
              <span style={styles.invoiceCopy}>
                <strong>
                  {invoice.number || `INV-${index + 1}`}
                </strong>
                <span>
                  {invoice.customer || invoice.brand || 'Customer'} ·{' '}
                  Due {formatDate(invoice.dueDate)}
                </span>
                <small>
                  {invoice.paymentMethod || 'Payment foundation'} ·{' '}
                  {invoice.status || 'Draft'}
                </small>
              </span>
              <strong>
                {money(invoice.amount, invoice.currency)}
              </strong>
              <button
                type="button"
                onClick={() =>
                  showNotice('Invoice actions opened.')
                }
                style={styles.tinyButton}
                aria-label="Invoice actions"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="No invoices yet." />
        )}
      </div>
    </section>
  );

  const renderPayments = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Payments"
        subtitle="WalletOS-linked payments, settlements, and payout signals."
        icon={WalletCards}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Recent payments"
          value={payments.length}
          icon={CircleDollarSign}
          color="#4dd7ff"
        />
        <MetricCard
          label="Pending payments"
          value={payments.filter(
            (payment) => payment.status === 'Pending'
          ).length}
          icon={Clock3}
          color="#ffd27d"
        />
        <MetricCard
          label="Failed payments"
          value={payments.filter(
            (payment) => payment.status === 'Failed'
          ).length}
          icon={ShieldCheck}
          color="#ff7c9f"
        />
        <MetricCard
          label="Refunds"
          value={money(analytics.refunds, business.currency)}
          icon={ArrowDownIcon}
          color="#a895ff"
        />
      </div>

      <div style={styles.paymentList}>
        {payments.length ? (
          payments.map((payment, index) => (
            <div
              key={payment.id || index}
              style={styles.paymentRow}
            >
              <span style={styles.paymentIcon}>
                <CreditCard size={16} />
              </span>
              <span style={styles.paymentCopy}>
                <strong>
                  {payment.counterparty || 'Payment'}
                </strong>
                <span>
                  {payment.method || 'Payment method'} ·{' '}
                  {payment.status || 'Pending'}
                </span>
              </span>
              <strong>
                {money(payment.amount, payment.currency)}
              </strong>
            </div>
          ))
        ) : (
          <Empty label="No recent payments." />
        )}
      </div>
    </section>
  );

  const renderEmployees = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Employees"
        subtitle="People, roles, departments, and employee operations."
        icon={Users}
        action={
          <button
            type="button"
            onClick={() => {
              onAddEmployee?.();
              showNotice('Add employee flow opened.');
            }}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Add employee
          </button>
        }
      />

      <div style={styles.employeeList}>
        {employees.length ? (
          employees.map((employee, index) => (
            <div
              key={employee.id || index}
              style={styles.employeeRow}
            >
              <Avatar item={employee} />
              <span style={styles.employeeCopy}>
                <strong>
                  {employee.name || 'Employee'}
                </strong>
                <span>
                  {employee.role || 'Role foundation'} ·{' '}
                  {employee.department || 'Department'}
                </span>
                <small>
                  {employee.status || 'Active'} ·{' '}
                  {employee.attendance || 'Attendance foundation'}
                </small>
              </span>
              <button
                type="button"
                onClick={() =>
                  showNotice('Employee actions opened.')
                }
                style={styles.tinyButton}
                aria-label="Employee actions"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="No employees yet." />
        )}
      </div>
    </section>
  );

  const renderPayroll = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Payroll"
        subtitle="Salary, bonuses, deductions, and payment scheduling."
        icon={CircleDollarSign}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Salary total"
          value={money(analytics.salaryTotal, business.currency)}
          icon={CircleDollarSign}
          color="#4dd7ff"
        />
        <MetricCard
          label="Bonuses"
          value={money(analytics.bonuses, business.currency)}
          icon={Sparkles}
          color="#82e9c1"
        />
        <MetricCard
          label="Deductions"
          value={money(analytics.deductions, business.currency)}
          icon={ArrowDownIcon}
          color="#ff9f72"
        />
        <MetricCard
          label="Payment status"
          value={analytics.payrollStatus || 'Foundation'}
          icon={Check}
          color="#a895ff"
        />
      </div>

      <div style={styles.foundationNote}>
        <CircleDollarSign size={15} />
        Taxes and payroll schedule foundations are ready.
      </div>
    </section>
  );

  const renderAccounting = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Accounting"
        subtitle="Financial summaries for business decisions."
        icon={BarChart3}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Income"
          value={money(analytics.income, business.currency)}
          icon={TrendingUp}
          color="#82e9c1"
        />
        <MetricCard
          label="Expenses"
          value={money(analytics.expenses, business.currency)}
          icon={ArrowUpIcon}
          color="#ff9f72"
        />
        <MetricCard
          label="Profit"
          value={money(analytics.profit, business.currency)}
          icon={CircleDollarSign}
          color="#4dd7ff"
        />
        <MetricCard
          label="Cash flow"
          value={analytics.cashFlow || 'Foundation'}
          icon={BarChart3}
          color="#a895ff"
        />
        <MetricCard
          label="Tax estimate"
          value={money(analytics.taxEstimate, business.currency)}
          icon={Receipt}
          color="#ffd27d"
        />
        <MetricCard
          label="Accounts receivable"
          value={money(
            analytics.accountsReceivable,
            business.currency
          )}
          icon={ArrowDownIcon}
          color="#9deeff"
        />
        <MetricCard
          label="Accounts payable"
          value={money(
            analytics.accountsPayable,
            business.currency
          )}
          icon={ArrowUpIcon}
          color="#ff4fd8"
        />
      </div>
    </section>
  );

  const renderMarketing = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Marketing"
        subtitle="Campaign performance and growth opportunities."
        icon={Sparkles}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Campaigns"
          value={marketing.campaigns || 0}
          icon={Target}
          color="#4dd7ff"
        />
        <MetricCard
          label="Conversion rate"
          value={
            marketing.conversionRate
              ? `${marketing.conversionRate}%`
              : 'Foundation'
          }
          icon={TrendingUp}
          color="#82e9c1"
        />
        <MetricCard
          label="ROI"
          value={marketing.roi || 'Foundation'}
          icon={BarChart3}
          color="#a895ff"
        />
        <MetricCard
          label="Creator campaigns"
          value={marketing.creatorCampaigns || 0}
          icon={Users}
          color="#ffd27d"
        />
      </div>

      <div style={styles.marketingGrid}>
        {[
          ['Email campaigns', MailIcon],
          ['SMS campaigns', MessageIcon],
          ['Social campaigns', Sparkles],
          ['Creator campaigns', Users],
          ['AI marketing plan', Target],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} opened.`)
            }
            style={styles.marketingCard}
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

  const renderAnalytics = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Analytics"
        subtitle="Revenue, sales, customer, product, and payment intelligence."
        icon={TrendingUp}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Revenue trend"
          value={analytics.revenueTrend || 'Growing'}
          icon={TrendingUp}
          color="#82e9c1"
        />
        <MetricCard
          label="Sales trend"
          value={analytics.salesTrend || 'Monitoring'}
          icon={BarChart3}
          color="#4dd7ff"
        />
        <MetricCard
          label="Customer growth"
          value={analytics.customerGrowth || 'Foundation'}
          icon={Users}
          color="#a895ff"
        />
        <MetricCard
          label="Product performance"
          value={analytics.productPerformance || 'Ready'}
          icon={Package}
          color="#ffd27d"
        />
        <MetricCard
          label="Inventory turnover"
          value={analytics.inventoryTurnover || 'Foundation'}
          icon={RotateIcon}
          color="#9deeff"
        />
        <MetricCard
          label="Payment success"
          value={
            analytics.paymentSuccessRate
              ? `${analytics.paymentSuccessRate}%`
              : 'Foundation'
          }
          icon={Check}
          color="#82e9c1"
        />
        <MetricCard
          label="AI business forecast"
          value={analytics.aiForecast || 'Ready'}
          icon={Sparkles}
          color="#ff4fd8"
        />
      </div>
    </section>
  );

  const renderAssistant = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Business Assistant"
        subtitle="Analyze, plan, price, and automate business work."
        icon={Sparkles}
      />

      <div style={styles.aiActionGrid}>
        {[
          'Generate Invoice',
          'Analyze Sales',
          'Predict Revenue',
          'Reorder Inventory',
          'Write Proposal',
          'Summarize Business',
          'Create Marketing Plan',
          'Find Growth Opportunities',
          'Optimize Pricing',
          'Forecast Cash Flow',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} prepared.`)
            }
            style={styles.aiAction}
          >
            <Sparkles size={15} />
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

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'sales') return renderSales();
    if (activeModule === 'customers') return renderCustomers();
    if (activeModule === 'products') return renderProducts();
    if (activeModule === 'orders') return renderOrders();
    if (activeModule === 'inventory') return renderInventory();
    if (activeModule === 'invoices') return renderInvoices();
    if (activeModule === 'payments') return renderPayments();
    if (activeModule === 'employees') return renderEmployees();
    if (activeModule === 'payroll') return renderPayroll();
    if (activeModule === 'accounting') return renderAccounting();
    if (activeModule === 'marketing') return renderMarketing();
    if (activeModule === 'analytics') return renderAnalytics();
    if (activeModule === 'assistant') return renderAssistant();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close BusinessOS"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>BusinessOS</strong>
          <span>
            Build, operate, and grow your business
          </span>
        </div>

        <button
          type="button"
          aria-label="Business settings"
          style={styles.iconButton}
        >
          <Settings2 size={18} />
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

      {invoiceModal ? (
        <Modal
          title="Create Invoice"
          onClose={() => setInvoiceModal(false)}
        >
          <label style={styles.field}>
            Customer
            <input
              autoFocus
              value={invoiceCustomer}
              onChange={(event) =>
                setInvoiceCustomer(event.target.value)
              }
              placeholder="Customer or brand name"
              style={styles.textInput}
            />
          </label>

          <label style={styles.field}>
            Amount
            <input
              type="number"
              min="0"
              value={invoiceAmount}
              onChange={(event) =>
                setInvoiceAmount(event.target.value)
              }
              placeholder="Enter amount"
              style={styles.textInput}
            />
          </label>

          <button
            type="button"
            onClick={createInvoice}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create invoice
          </button>
        </Modal>
      ) : null}

      <style>{`
        @keyframes aarush-business-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-business-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-business-card:hover,
        .aarush-business-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-business-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-business-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-business-products,
          .aarush-business-employees {
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

function Pulse({ label, value, color }) {
  return (
    <div style={styles.pulse}>
      <span
        style={{
          ...styles.pulseDot,
          background: color,
          boxShadow: `0 0 14px ${color}`,
        }}
      />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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
      {String(item?.name || 'B')
        .charAt(0)
        .toUpperCase()}
    </span>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Briefcase size={25} />
      <span>{label}</span>
    </div>
  );
}

function ActivityIcon() {
  return (
    <span style={styles.customIcon}>
      <BarChart3 size={16} />
    </span>
  );
}

function ArrowDownIcon() {
  return (
    <span style={styles.customIcon}>
      <ArrowDownLeft size={16} />
    </span>
  );
}

function ArrowUpIcon() {
  return (
    <span style={styles.customIcon}>
      <ArrowUpRight size={16} />
    </span>
  );
}

function RotateIcon() {
  return (
    <span style={styles.customIcon}>
      <TrendingUp size={16} />
    </span>
  );
}

function MailIcon() {
  return (
    <span style={styles.customIcon}>
      <Send size={16} />
    </span>
  );
}

function MessageIcon() {
  return (
    <span style={styles.customIcon}>
      <FileText size={16} />
    </span>
  );
}

function PackageIcon() {
  return (
    <span style={styles.customIcon}>
      <Package size={16} />
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
    width: 'min(100%, 1160px)',
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

  businessHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-business-pulse 3s ease-in-out infinite',
  },

  businessOrb: {
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

  businessCopy: {
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

  businessCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  businessCopyP: {
    maxWidth: '42rem',
    margin: 0,
    color: '#91a0bc',
    fontSize: '.63rem',
    lineHeight: 1.45,
  },

  heroMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.55rem',
    marginTop: '.25rem',
    color: '#9deeff',
    fontSize: '.57rem',
  },

  heroMetaSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
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
    animation: 'aarush-business-in 240ms ease both',
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

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-business-in 240ms ease both',
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

  pulseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  pulse: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    gap: '.3rem',
    minHeight: '2.7rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  pulseDot: {
    width: '.45rem',
    height: '.45rem',
    borderRadius: '999px',
  },

  pulseStrong: {
    gridColumn: '2',
    color: '#fff',
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

  stageTabs: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.35rem',
  },

  stageButton: {
    minHeight: '2.2rem',
    flexShrink: 0,
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.56rem',
    cursor: 'pointer',
  },

  activeStageButton: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background: 'rgba(124,92,255,.16)',
  },

  salesList: {
    display: 'grid',
    gap: '.4rem',
  },

  salesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  salesIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  salesCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  salesCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  forecastNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    marginTop: '.7rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.58rem',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.7rem',
    marginBottom: '.6rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.8rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
  },

  searchInput: {
    minWidth: 0,
    minHeight: '2.55rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.68rem',
  },

  customerList: {
    display: 'grid',
    gap: '.4rem',
  },

  customerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  avatar: {
    width: '2.45rem',
    height: '2.45rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '999px',
  },

  avatarFallback: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  customerCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  customerCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  customerCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  productCard: {
    display: 'grid',
    gap: '.25rem',
    overflow: 'hidden',
    paddingBottom: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  productImage: {
    width: '100%',
    height: '7rem',
    objectFit: 'cover',
  },

  productPlaceholder: {
    height: '7rem',
    display: 'grid',
    placeItems: 'center',
    color: '#9deeff',
    background: 'rgba(77,215,255,.08)',
  },

  productCardStrong: {
    padding: '0 .55rem',
  },

  productCardSpan: {
    padding: '0 .55rem',
    color: '#91a0bc',
  },

  productMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.35rem',
    padding: '0 .55rem',
  },

  productMetaSpan: {
    color: '#82e9c1',
    fontSize: '.54rem',
  },

  productCardSmall: {
    padding: '0 .55rem',
    color: '#91a0bc',
    fontSize: '.53rem',
  },

  productButton: {
    minHeight: '2.1rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.25rem',
    margin: '0 .55rem',
    border: 0,
    borderRadius: '.55rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.55rem',
    cursor: 'pointer',
  },

  filterRow: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.35rem',
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

  orderList: {
    display: 'grid',
    gap: '.4rem',
  },

  orderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  orderIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  orderCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  orderCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  orderCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  inventoryList: {
    display: 'grid',
    gap: '.4rem',
  },

  inventoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  inventoryIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  inventoryCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  inventoryCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  inventoryCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  stockStatus: {
    minWidth: '4.3rem',
    fontSize: '.54rem',
    fontWeight: 850,
    textAlign: 'right',
  },

  invoiceList: {
    display: 'grid',
    gap: '.4rem',
  },

  invoiceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  invoiceIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.1)',
  },

  invoiceCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  invoiceCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  invoiceCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  paymentList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  paymentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  paymentIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
  },

  paymentCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  paymentCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  employeeList: {
    display: 'grid',
    gap: '.4rem',
  },

  employeeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  employeeCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  employeeCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  employeeCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
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

  marketingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  marketingCard: {
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

  aiActionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
  },

  aiAction: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(124,92,255,.16)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.57rem',
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

  customIcon: {
    display: 'grid',
    placeItems: 'center',
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
    width: 'min(100%, 430px)',
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

  field: {
    display: 'grid',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.63rem',
  },

  textInput: {
    minHeight: '2.5rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.68rem',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    width: '100%',
    marginTop: '.6rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },
};