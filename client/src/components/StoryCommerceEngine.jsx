import { useMemo, useState } from 'react';
import {
  BarChart3,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Copy,
  Filter,
  Gift,
  Heart,
  Image as ImageIcon,
  Link2,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  TicketPercent,
  TrendingUp,
  Truck,
  Users,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['storefront', 'Storefront', ShoppingBag],
  ['catalog', 'Catalog', Package],
  ['tagging', 'Story Tagging', Tag],
  ['live', 'Live Shopping', Zap],
  ['affiliates', 'Affiliates', Link2],
  ['coupons', 'Coupons', TicketPercent],
  ['orders', 'Orders', ClipboardList],
  ['inventory', 'Inventory', Package],
  ['analytics', 'Analytics', BarChart3],
];

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Refunded',
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

function formatCompact(value) {
  const amount = numeric(value);

  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }

  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }

  return String(Math.round(amount));
}

function normalizeProduct(product, index) {
  return {
    ...product,
    id: product?.id || `product-${index}`,
    name: product?.name || product?.title || 'Product',
    price: numeric(product?.price),
    compareAtPrice: numeric(
      product?.compareAtPrice || product?.originalPrice
    ),
    stock: numeric(product?.stock || product?.inventory),
    category: product?.category || 'General',
    status: product?.status || 'Available',
    rating: product?.rating || 'Foundation',
    affiliate: Boolean(product?.affiliate),
  };
}

function normalizeOrder(order, index) {
  return {
    ...order,
    id: order?.id || `order-${index}`,
    customer:
      order?.customer || order?.customerName || 'Customer',
    product: order?.product || order?.productName || 'Product',
    amount: numeric(order?.amount || order?.total),
    status: order?.status || 'Pending',
    paymentStatus: order?.paymentStatus || 'Pending',
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

export default function StoryCommerceEngine({
  creator = {},
  store = {},
  products = [],
  cart = [],
  orders = [],
  coupons = [],
  affiliateLinks = [],
  analytics = {},
  onAddProduct,
  onTagProduct,
  onAddToCart,
  onCheckout,
  onCreateCoupon,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('storefront');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Featured');
  const [selectedProduct, setSelectedProduct] =
    useState('');
  const [tagType, setTagType] =
    useState('Product sticker');
  const [notice, setNotice] = useState('');
  const [couponOpen, setCouponOpen] =
    useState(false);
  const [couponCode, setCouponCode] =
    useState('');
  const [couponValue, setCouponValue] =
    useState('');
  const [couponType, setCouponType] =
    useState('Percentage discount');

  const normalizedProducts = useMemo(
    () => products.map(normalizeProduct),
    [products]
  );

  const normalizedOrders = useMemo(
    () => orders.map(normalizeOrder),
    [orders]
  );

  const categories = useMemo(
    () => [
      'All',
      ...Array.from(
        new Set(
          normalizedProducts
            .map((product) => product.category)
            .filter(Boolean)
        )
      ),
    ],
    [normalizedProducts]
  );

  const filteredProducts = useMemo(() => {
    const result = normalizedProducts.filter((product) => {
      const searchable = [
        product.name,
        product.category,
        product.status,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (category === 'All' ||
          product.category === category) &&
        (!search ||
          searchable.includes(search.toLowerCase()))
      );
    });

    return [...result].sort((a, b) => {
      if (sort === 'Price low') return a.price - b.price;
      if (sort === 'Price high') return b.price - a.price;
      if (sort === 'Stock') return b.stock - a.stock;
      return Number(b.featured) - Number(a.featured);
    });
  }, [category, normalizedProducts, search, sort]);

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          numeric(item?.price) * numeric(item?.quantity || 1),
        0
      ),
    [cart]
  );

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + numeric(item?.quantity || 1),
        0
      ),
    [cart]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const addToCart = (product) => {
    onAddToCart?.(product);
    showNotice(`${product.name} added to cart.`);
  };

  const tagProduct = () => {
    const product = normalizedProducts.find(
      (item) => item.id === selectedProduct
    );

    if (!product) {
      showNotice('Select a product to tag.');
      return;
    }

    onTagProduct?.({
      product,
      tagType,
      position: { x: 50, y: 50 },
      quickBuy: true,
    });

    showNotice(`${product.name} tagged in story.`);
  };

  const createCoupon = () => {
    if (!couponCode.trim()) {
      showNotice('Enter a coupon code.');
      return;
    }

    onCreateCoupon?.({
      id: `coupon-${Date.now()}`,
      code: couponCode.trim().toUpperCase(),
      type: couponType,
      value: Number(couponValue) || 0,
      status: 'Active',
    });

    setCouponCode('');
    setCouponValue('');
    setCouponOpen(false);
    showNotice('Coupon created.');
  };

  const renderStorefront = () => (
    <>
      <section style={styles.storeHero}>
        {store.banner ? (
          <img
            src={store.banner}
            alt=""
            loading="lazy"
            style={styles.storeBanner}
          />
        ) : null}

        <div style={styles.storeHeroOverlay}>
          <span style={styles.storeLogo}>
            {store.logo ? (
              <img
                src={store.logo}
                alt=""
                loading="lazy"
                style={styles.logoImage}
              />
            ) : (
              <ShoppingBag size={24} />
            )}
          </span>
          <div>
            <strong>
              {store.name ||
                creator.storeName ||
                'Creator Store'}
            </strong>
            <span>
              {store.category || 'Creator storefront'} ·{' '}
              {store.followers
                ? `${formatCompact(store.followers)} followers`
                : 'Followers foundation'}
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Products"
          value={normalizedProducts.length}
          icon={Package}
          color="#4dd7ff"
        />
        <MetricCard
          label="Cart items"
          value={cartCount}
          icon={ShoppingCart}
          color="#a895ff"
        />
        <MetricCard
          label="Store revenue"
          value={money(analytics.revenue)}
          icon={CircleDollarSign}
          color="#82e9c1"
        />
        <MetricCard
          label="Conversion"
          value={
            analytics.conversionRate
              ? `${analytics.conversionRate}%`
              : 'Foundation'
          }
          icon={TrendingUp}
          color="#ffd27d"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Featured Products"
          subtitle="Curated products ready for story commerce."
          icon={Sparkles}
          action={
            <button
              type="button"
              onClick={() =>
                setActiveModule('catalog')
              }
              style={styles.smallButton}
            >
              View catalog
              <ChevronRight size={14} />
            </button>
          }
        />

        <div style={styles.productGrid}>
          {filteredProducts
            .filter((product) => product.featured)
            .slice(0, 4)
            .map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => addToCart(product)}
              />
            ))}
        </div>
      </section>
    </>
  );

  const renderCatalog = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Product Catalog"
        subtitle="Search, filter, and manage commerce products."
        icon={Package}
        action={
          <button
            type="button"
            onClick={() => onAddProduct?.()}
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
          placeholder="Search products"
          aria-label="Search products"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.filterRow}>
        <div style={styles.categoryTabs}>
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              style={{
                ...styles.filterButton,
                ...(category === item
                  ? styles.activeFilterButton
                  : {}),
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <label style={styles.sortLabel}>
          <Filter size={14} />
          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value)
            }
            aria-label="Sort products"
            style={styles.sortSelect}
          >
            <option>Featured</option>
            <option>Price low</option>
            <option>Price high</option>
            <option>Stock</option>
          </select>
        </label>
      </div>

      <div style={styles.productGrid}>
        {filteredProducts.length ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={() => addToCart(product)}
            />
          ))
        ) : (
          <Empty label="No products found." />
        )}
      </div>
    </section>
  );

  const renderTagging = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Story Product Tagging"
        subtitle="Attach shoppable products to story scenes."
        icon={Tag}
      />

      <div style={styles.storyCanvas}>
        <div style={styles.storyPlaceholder}>
          <ImageIcon size={30} />
          <span>Story editor preview foundation</span>
        </div>

        {selectedProduct ? (
          <span style={styles.productTag}>
            <ShoppingBag size={13} />
            {
              normalizedProducts.find(
                (product) => product.id === selectedProduct
              )?.name
            }
          </span>
        ) : null}
      </div>

      <label style={styles.field}>
        Product
        <select
          value={selectedProduct}
          onChange={(event) =>
            setSelectedProduct(event.target.value)
          }
          style={styles.select}
        >
          <option value="">Choose a product</option>
          {normalizedProducts.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>

      <label style={styles.field}>
        Tag style
        <select
          value={tagType}
          onChange={(event) =>
            setTagType(event.target.value)
          }
          style={styles.select}
        >
          <option>Product sticker</option>
          <option>Price sticker</option>
          <option>Collection sticker</option>
          <option>Quick buy foundation</option>
        </select>
      </label>

      <button
        type="button"
        onClick={tagProduct}
        style={styles.primaryButton}
      >
        <Tag size={16} />
        Tag product in story
      </button>
    </section>
  );

  const renderLive = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Live Shopping"
        subtitle="Product queues for StoryLiveBroadcastStudio."
        icon={Zap}
      />

      <div style={styles.liveHero}>
        <Zap size={22} />
        <div>
          <strong>Live shopping foundation ready</strong>
          <span>
            Pin products, manage flash-sale moments, and
            prepare purchase notifications.
          </span>
        </div>
      </div>

      <div style={styles.productGrid}>
        {normalizedProducts.slice(0, 4).map((product) => (
          <div
            key={product.id}
            style={styles.liveProduct}
          >
            <strong>{product.name}</strong>
            <span>{money(product.price)}</span>
            <small>
              {product.stock > 0
                ? `${product.stock} in stock`
                : 'Out of stock'}
            </small>
            <button
              type="button"
              onClick={() =>
                showNotice(`${product.name} pinned to live.`)
              }
              style={styles.productButton}
            >
              <Pin size={13} />
              Pin product
            </button>
          </div>
        ))}
      </div>

      <div style={styles.liveMeta}>
        <span>Flash sale: Foundation</span>
        <span>Purchase alerts: Ready</span>
        <span>Checkout: Prepared</span>
      </div>
    </section>
  );

  const renderAffiliates = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Affiliate Links"
        subtitle="Track partner products and commission signals."
        icon={Link2}
      />

      <div style={styles.affiliateList}>
        {affiliateLinks.length ? (
          affiliateLinks.map((affiliate, index) => (
            <div
              key={affiliate.id || index}
              style={styles.affiliateRow}
            >
              <span style={styles.affiliateIcon}>
                <Link2 size={16} />
              </span>
              <div style={styles.affiliateCopy}>
                <strong>
                  {affiliate.product || 'Affiliate product'}
                </strong>
                <span>
                  {affiliate.commissionRate || 0}% commission ·{' '}
                  {affiliate.promoCode || 'No promo code'}
                </span>
                <small>
                  {affiliate.clicks || '—'} clicks ·{' '}
                  {affiliate.conversions || '—'} conversions
                </small>
              </div>
              <strong>
                {money(affiliate.revenue)}
              </strong>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    affiliate.url || ''
                  );
                  showNotice('Affiliate link copied.');
                }}
                aria-label="Copy affiliate link"
                style={styles.tinyButton}
              >
                <Copy size={14} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="No affiliate links yet." />
        )}
      </div>
    </section>
  );

  const renderCoupons = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Coupons"
        subtitle="Manage discount campaigns and activation rules."
        icon={TicketPercent}
        action={
          <button
            type="button"
            onClick={() => setCouponOpen(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Create coupon
          </button>
        }
      />

      <div style={styles.couponList}>
        {coupons.length ? (
          coupons.map((coupon, index) => (
            <div
              key={coupon.id || index}
              style={styles.couponRow}
            >
              <span style={styles.couponIcon}>
                <TicketPercent size={16} />
              </span>
              <div style={styles.couponCopy}>
                <strong>
                  {coupon.code || 'PROMO CODE'}
                </strong>
                <span>
                  {coupon.type || 'Percentage discount'} ·{' '}
                  {coupon.value || 0}
                  {coupon.type === 'Fixed discount'
                    ? ''
                    : '%'}
                </span>
                <small>
                  {coupon.expiresAt
                    ? `Expires ${coupon.expiresAt}`
                    : 'Limited time foundation'}
                </small>
              </div>
              <span style={styles.couponStatus}>
                {coupon.status || 'Active'}
              </span>
            </div>
          ))
        ) : (
          <Empty label="No coupons created yet." />
        )}
      </div>
    </section>
  );

  const renderOrders = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Orders"
        subtitle="Track customer fulfillment and payment states."
        icon={ClipboardList}
      />

      <div style={styles.orderList}>
        {normalizedOrders.length ? (
          normalizedOrders.map((order) => (
            <div
              key={order.id}
              style={styles.orderRow}
            >
              <span style={styles.orderIcon}>
                <Package size={16} />
              </span>
              <div style={styles.orderCopy}>
                <strong>{order.customer}</strong>
                <span>
                  {order.product} ·{' '}
                  {order.paymentStatus}
                </span>
                <small>
                  Tracking:{' '}
                  {order.tracking || 'Foundation'}
                </small>
              </div>
              <strong>{money(order.amount)}</strong>
              <span style={styles.orderStatus}>
                {ORDER_STATUSES.includes(order.status)
                  ? order.status
                  : 'Pending'}
              </span>
            </div>
          ))
        ) : (
          <Empty label="No orders yet." />
        )}
      </div>
    </section>
  );

  const renderInventory = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Inventory"
        subtitle="Stock levels, reservations, and alerts."
        icon={Package}
      />

      <div style={styles.inventoryList}>
        {normalizedProducts.length ? (
          normalizedProducts.map((product) => {
            const lowStock =
              product.stock > 0 && product.stock <= 5;
            const outOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                style={styles.inventoryRow}
              >
                <span style={styles.inventoryIcon}>
                  <Package size={16} />
                </span>
                <div style={styles.inventoryCopy}>
                  <strong>{product.name}</strong>
                  <span>{product.category}</span>
                </div>
                <div style={styles.inventoryNumbers}>
                  <span>
                    Available <strong>{product.stock}</strong>
                  </span>
                  <span>
                    Reserved{' '}
                    <strong>
                      {product.reservedStock || 0}
                    </strong>
                  </span>
                </div>
                <span
                  style={{
                    ...styles.stockStatus,
                    color: outOfStock
                      ? '#ff7c9f'
                      : lowStock
                        ? '#ffd27d'
                        : '#82e9c1',
                  }}
                >
                  {outOfStock
                    ? 'Out of stock'
                    : lowStock
                      ? 'Low stock'
                      : 'In stock'}
                </span>
              </div>
            );
          })
        ) : (
          <Empty label="No inventory items." />
        )}
      </div>
    </section>
  );

  const renderAnalytics = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Commerce Analytics"
        subtitle="Sales, conversion, and commerce performance."
        icon={BarChart3}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Revenue"
          value={money(analytics.revenue)}
          icon={CircleDollarSign}
          color="#82e9c1"
        />
        <MetricCard
          label="Orders"
          value={formatCompact(analytics.orders)}
          icon={ClipboardList}
          color="#4dd7ff"
        />
        <MetricCard
          label="Conversion rate"
          value={
            analytics.conversionRate
              ? `${analytics.conversionRate}%`
              : 'Foundation'
          }
          icon={TrendingUp}
          color="#a895ff"
        />
        <MetricCard
          label="Average order value"
          value={money(analytics.averageOrderValue)}
          icon={ShoppingCart}
          color="#ffd27d"
        />
        <MetricCard
          label="Top products"
          value={analytics.topProducts || 'Foundation'}
          icon={Package}
          color="#9deeff"
        />
        <MetricCard
          label="Story-driven sales"
          value={money(analytics.storySales)}
          icon={ImageIcon}
          color="#ff4fd8"
        />
        <MetricCard
          label="Live shopping sales"
          value={money(analytics.liveSales)}
          icon={Zap}
          color="#ff9f72"
        />
        <MetricCard
          label="Affiliate earnings"
          value={money(analytics.affiliateEarnings)}
          icon={Link2}
          color="#82e9c1"
        />
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'storefront') return renderStorefront();
    if (activeModule === 'catalog') return renderCatalog();
    if (activeModule === 'tagging') return renderTagging();
    if (activeModule === 'live') return renderLive();
    if (activeModule === 'affiliates') return renderAffiliates();
    if (activeModule === 'coupons') return renderCoupons();
    if (activeModule === 'orders') return renderOrders();
    if (activeModule === 'inventory') return renderInventory();
    if (activeModule === 'analytics') return renderAnalytics();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close commerce engine"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Commerce Engine</strong>
          <span>
            Turn every story into a storefront
          </span>
        </div>

        <button
          type="button"
          aria-label="Open cart"
          style={styles.cartButton}
          onClick={() => onCheckout?.({ cart, cartTotal })}
        >
          <ShoppingCart size={18} />
          {cartCount ? (
            <span style={styles.cartCount}>
              {cartCount}
            </span>
          ) : null}
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

      {couponOpen ? (
        <Modal
          title="Create Coupon"
          onClose={() => setCouponOpen(false)}
        >
          <label style={styles.field}>
            Coupon code
            <input
              autoFocus
              value={couponCode}
              onChange={(event) =>
                setCouponCode(event.target.value)
              }
              placeholder="AARUSH20"
              style={styles.textInput}
            />
          </label>

          <label style={styles.field}>
            Discount type
            <select
              value={couponType}
              onChange={(event) =>
                setCouponType(event.target.value)
              }
              style={styles.select}
            >
              <option>Percentage discount</option>
              <option>Fixed discount</option>
              <option>Free shipping foundation</option>
            </select>
          </label>

          <label style={styles.field}>
            Value
            <input
              type="number"
              min="0"
              value={couponValue}
              onChange={(event) =>
                setCouponValue(event.target.value)
              }
              placeholder="20"
              style={styles.textInput}
            />
          </label>

          <button
            type="button"
            onClick={createCoupon}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create coupon
          </button>
        </Modal>
      ) : null}

      <style>{`
        @keyframes aarush-commerce-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-commerce-card:hover,
        .aarush-commerce-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-commerce-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-commerce-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-commerce-products {
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

function ProductCard({ product, onAdd }) {
  const discount =
    product.compareAtPrice > product.price &&
    product.compareAtPrice > 0
      ? Math.round(
          ((product.compareAtPrice - product.price) /
            product.compareAtPrice) *
            100
        )
      : 0;

  return (
    <article style={styles.productCard}>
      {product.image || product.thumbnail ? (
        <img
          src={product.image || product.thumbnail}
          alt={product.name}
          loading="lazy"
          style={styles.productImage}
        />
      ) : (
        <div style={styles.productPlaceholder}>
          <Package size={27} />
        </div>
      )}

      <div style={styles.productBody}>
        <strong>{product.name}</strong>
        <span>{product.category}</span>
        <div style={styles.priceRow}>
          <strong>{money(product.price)}</strong>
          {product.compareAtPrice > product.price ? (
            <del>{money(product.compareAtPrice)}</del>
          ) : null}
        </div>
        <small>
          {discount ? `${discount}% off · ` : ''}
          {product.stock > 0
            ? `${product.stock} in stock`
            : 'Out of stock'}
        </small>
        <div style={styles.productActions}>
          <button
            type="button"
            onClick={onAdd}
            disabled={product.stock <= 0}
            style={styles.productButton}
          >
            <ShoppingCart size={13} />
            Add to cart
          </button>
          {product.affiliate ? (
            <span style={styles.affiliateBadge}>
              Affiliate
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.modalBackdrop}>
      <section style={styles.modal}>
        <div style={styles.modalHeader}>
          <strong>{title}</strong>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={styles.iconButton}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <ShoppingBag size={25} />
      <span>{label}</span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.55),#07090e 68%)',
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

  heading: {
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
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

  cartButton: {
    position: 'relative',
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

  cartCount: {
    position: 'absolute',
    top: '-.1rem',
    right: '-.1rem',
    minWidth: '1rem',
    height: '1rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background: '#ff4f82',
    fontSize: '.5rem',
    fontWeight: 850,
  },

  content: {
    width: 'min(100%, 1100px)',
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

  storeHero: {
    position: 'relative',
    minHeight: '11rem',
    overflow: 'hidden',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '1.15rem',
    background:
      'linear-gradient(135deg,#24204e,#10283c)',
    animation: 'aarush-commerce-in 240ms ease both',
  },

  storeBanner: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: .55,
  },

  storeHeroOverlay: {
    position: 'absolute',
    right: '1rem',
    bottom: '1rem',
    left: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.6rem',
    color: '#fff',
    textShadow: '0 2px 14px rgba(0,0,0,.7)',
  },

  storeHeroOverlayDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  storeHeroOverlaySpan: {
    color: '#cbd6ec',
    fontSize: '.59rem',
  },

  storeLogo: {
    width: '3.2rem',
    height: '3.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,.55)',
    borderRadius: '1rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '.85rem',
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
    animation: 'aarush-commerce-in 240ms ease both',
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

  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
  },

  productCard: {
    display: 'grid',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.85rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
  },

  productImage: {
    width: '100%',
    height: '8rem',
    objectFit: 'cover',
  },

  productPlaceholder: {
    height: '8rem',
    display: 'grid',
    placeItems: 'center',
    color: '#9deeff',
    background: 'rgba(77,215,255,.08)',
  },

  productBody: {
    display: 'grid',
    gap: '.25rem',
    padding: '.6rem',
  },

  productBodySpan: {
    color: '#91a0bc',
    fontSize: '.56rem',
  },

  productBodySmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '.35rem',
  },

  priceRowDel: {
    color: '#6f7d98',
    fontSize: '.55rem',
  },

  productActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    marginTop: '.15rem',
  },

  productButton: {
    minHeight: '2.15rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.25rem',
    flex: 1,
    border: 0,
    borderRadius: '.55rem',
    color: '#fff',
    background: 'rgba(124,92,255,.68)',
    fontSize: '.55rem',
    cursor: 'pointer',
  },

  affiliateBadge: {
    padding: '.25rem .3rem',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '.5rem',
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

  filterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.6rem',
  },

  categoryTabs: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
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

  sortLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    flexShrink: 0,
    color: '#91a0bc',
  },

  sortSelect: {
    minHeight: '2.1rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.55rem',
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.56rem',
  },

  storyCanvas: {
    position: 'relative',
    minHeight: '15rem',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    borderRadius: '.9rem',
    background:
      'linear-gradient(135deg,#24204e,#10283c)',
  },

  storyPlaceholder: {
    display: 'grid',
    placeItems: 'center',
    gap: '.4rem',
    color: '#9deeff',
    fontSize: '.61rem',
  },

  productTag: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '.4rem .5rem',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(124,92,255,.9)',
    transform: 'translate(-50%,-50%)',
    fontSize: '.57rem',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    marginTop: '.65rem',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  select: {
    minHeight: '2.4rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
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

  liveHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.75rem',
    border: '1px solid rgba(77,215,255,.16)',
    borderRadius: '.8rem',
    color: '#c9f9ff',
    background:
      'linear-gradient(135deg,rgba(77,215,255,.1),rgba(124,92,255,.06))',
  },

  liveHeroDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  liveHeroSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  liveProduct: {
    display: 'grid',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.59rem',
  },

  liveProductSpan: {
    color: '#82e9c1',
  },

  liveProductSmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  liveMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.5rem',
    marginTop: '.7rem',
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  affiliateList: {
    display: 'grid',
    gap: '.4rem',
  },

  affiliateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  affiliateIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  affiliateCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  affiliateCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  affiliateCopySmall: {
    color: '#6f7d98',
    fontSize: '.54rem',
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

  couponList: {
    display: 'grid',
    gap: '.4rem',
  },

  couponRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  couponIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.1)',
  },

  couponCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  couponCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  couponCopySmall: {
    color: '#6f7d98',
    fontSize: '.54rem',
  },

  couponStatus: {
    padding: '.25rem .4rem',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '.53rem',
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
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
  },

  orderCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  orderCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  orderCopySmall: {
    color: '#6f7d98',
    fontSize: '.54rem',
  },

  orderStatus: {
    padding: '.25rem .4rem',
    borderRadius: '999px',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
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
    gap: '.18rem',
    flex: 1,
  },

  inventoryCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  inventoryNumbers: {
    display: 'grid',
    gap: '.15rem',
    color: '#91a0bc',
    fontSize: '.54rem',
  },

  inventoryNumbersStrong: {
    color: '#fff',
  },

  stockStatus: {
    minWidth: '4.5rem',
    fontSize: '.55rem',
    fontWeight: 850,
    textAlign: 'right',
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
};