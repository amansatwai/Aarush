import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Camera,
  CameraOff,
  Check,
  ChevronRight,
  Clock3,
  Eye,
  Gift,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Mic,
  MicOff,
  MoreHorizontal,
  Package,
  Pause,
  Pin,
  Play,
  Radio,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  Video,
  VideoOff,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['preview', 'Preview', Radio],
  ['chat', 'Chat', MessageCircle],
  ['guests', 'Guests', Users],
  ['audience', 'Audience', Eye],
  ['overlays', 'Overlays', ImageIcon],
  ['moderation', 'Moderation', ShieldCheck],
  ['commerce', 'Commerce', ShoppingBag],
  ['analytics', 'Analytics', BarChart3],
];

const OVERLAYS = [
  ['Name Tag', 'nameTag'],
  ['Creator Badge', 'creatorBadge'],
  ['Brand Overlay', 'brandOverlay'],
  ['Product Overlay', 'productOverlay'],
  ['Poll', 'poll'],
  ['Question', 'question'],
  ['Countdown', 'countdown'],
  ['QR Code', 'qrCode'],
  ['Donation Goal', 'donationGoal'],
  ['Follower Goal', 'followerGoal'],
];

const MOCK_GUESTS = [
  {
    id: 'guest-1',
    name: 'Guest creator',
    status: 'Connected',
    micMuted: false,
    cameraOn: true,
  },
];

function numeric(value) {
  return Number(value) || 0;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(numeric(seconds)));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;

  return [hours, minutes, remaining]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
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

function formatMoney(value, currency = 'INR') {
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

export default function StoryLiveBroadcastStudio({
  creator = {},
  stream = {},
  audience = {},
  chat = [],
  guests = [],
  products = [],
  analytics = {},
  onStartLive,
  onEndLive,
  onInviteGuest,
  onMuteGuest,
  onRemoveGuest,
  onPinComment,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('preview');
  const [isLive, setIsLive] = useState(
    Boolean(stream.isLive || stream.status === 'live')
  );
  const [micMuted, setMicMuted] = useState(
    Boolean(stream.micMuted)
  );
  const [cameraOn, setCameraOn] = useState(
    stream.cameraOn !== false
  );
  const [slowMode, setSlowMode] = useState(
    Boolean(stream.slowMode)
  );
  const [subscriberOnly, setSubscriberOnly] =
    useState(Boolean(stream.subscriberOnly));
  const [selectedOverlays, setSelectedOverlays] =
    useState(() =>
      Array.isArray(stream.overlays)
        ? stream.overlays
        : ['nameTag', 'creatorBadge']
    );
  const [featuredProduct, setFeaturedProduct] =
    useState(products[0]?.id || '');
  const [chatInput, setChatInput] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const [elapsed, setElapsed] = useState(
    numeric(stream.duration)
  );
  const [notice, setNotice] = useState('');

  const guestItems = useMemo(
    () => (guests.length ? guests : MOCK_GUESTS),
    [guests]
  );

  const messages = useMemo(
    () => [...chat, ...localMessages],
    [chat, localMessages]
  );

  const viewerCount = useMemo(
    () =>
      numeric(
        analytics.viewers ||
          analytics.liveViewers ||
          audience.liveViewers ||
          stream.viewers
      ),
    [
      analytics.liveViewers,
      analytics.viewers,
      audience.liveViewers,
      stream.viewers,
    ]
  );

  const peakViewers = numeric(
    analytics.peakViewers || audience.peakViewers
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  useEffect(() => {
    if (!isLive) return undefined;

    const timer = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLive]);

  const startLive = async () => {
    setIsLive(true);

    await onStartLive?.({
      ...stream,
      creatorId: creator.id || creator.creatorId,
      streamId: stream.id || stream.streamId,
      startTime: new Date().toISOString(),
      overlays: selectedOverlays,
      moderation: {
        slowMode,
        subscriberOnly,
      },
    });

    showNotice('Live broadcast started.');
  };

  const endLive = async () => {
    setIsLive(false);

    await onEndLive?.({
      ...stream,
      duration: elapsed,
      viewers: viewerCount,
      overlays: selectedOverlays,
      moderation: {
        slowMode,
        subscriberOnly,
      },
    });

    showNotice('Broadcast ended.');
  };

  const toggleOverlay = (key) => {
    setSelectedOverlays((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };

  const sendMessage = () => {
    const value = chatInput.trim();

    if (!value) return;

    setLocalMessages((current) => [
      ...current,
      {
        id: `message-${Date.now()}`,
        author:
          creator.name ||
          creator.username ||
          'You',
        text: value,
        isLocal: true,
      },
    ]);
    setChatInput('');
  };

  const renderPreview = () => (
    <>
      <section style={styles.previewShell}>
        <div style={styles.previewFrame}>
          <div style={styles.previewContent}>
            {stream.previewUrl || stream.thumbnailUrl ? (
              <img
                src={stream.previewUrl || stream.thumbnailUrl}
                alt="Live broadcast preview"
                style={styles.previewImage}
              />
            ) : (
              <div style={styles.cameraPlaceholder}>
                {cameraOn ? (
                  <Camera size={32} />
                ) : (
                  <CameraOff size={32} />
                )}
                <span>
                  {cameraOn
                    ? 'Camera preview foundation'
                    : 'Camera is off'}
                </span>
              </div>
            )}

            <div style={styles.previewTopBar}>
              <span
                style={{
                  ...styles.liveBadge,
                  ...(isLive
                    ? styles.liveBadgeActive
                    : {}),
                }}
              >
                <span style={styles.liveDot} />
                {isLive ? 'LIVE' : 'OFFLINE'}
              </span>
              <span style={styles.viewerBadge}>
                <Eye size={13} />
                {formatCompact(viewerCount)}
              </span>
            </div>

            <div style={styles.previewBottomBar}>
              <span>
                {stream.title ||
                  'Aarush live broadcast preview'}
              </span>
              <span>{formatDuration(elapsed)}</span>
            </div>
          </div>
        </div>

        <div style={styles.streamMeta}>
          <div>
            <strong>
              {stream.title || 'Untitled live broadcast'}
            </strong>
            <span>
              {stream.category || 'Creator livestream'} ·{' '}
              {stream.visibility || 'Public'}
            </span>
          </div>
          <ConnectionQuality
            quality={
              stream.connectionQuality || 'Excellent'
            }
          />
        </div>
      </section>

      <section style={styles.controlPanel}>
        <SectionTitle
          title="Stream Controls"
          subtitle="Broadcast-quality controls and production foundations."
          icon={Settings2}
        />

        <div style={styles.controlGrid}>
          <ControlButton
            active={!micMuted}
            label={micMuted ? 'Unmute Mic' : 'Mute Mic'}
            icon={micMuted ? MicOff : Mic}
            onClick={() => setMicMuted((value) => !value)}
          />
          <ControlButton
            active={cameraOn}
            label={cameraOn ? 'Camera On' : 'Camera Off'}
            icon={cameraOn ? Video : VideoOff}
            onClick={() => setCameraOn((value) => !value)}
          />
          <ControlButton
            label="Switch Camera"
            icon={Camera}
            onClick={() =>
              showNotice('Camera switch foundation ready.')
            }
          />
          <ControlButton
            label="Screen Share"
            icon={ImageIcon}
            onClick={() =>
              showNotice('Screen share foundation ready.')
            }
          />
          <ControlButton
            label="Beauty Mode"
            icon={Sparkles}
            onClick={() =>
              showNotice('Beauty mode prepared.')
            }
          />
          <ControlButton
            label="AI Enhance"
            icon={Zap}
            onClick={() =>
              showNotice('AI enhancement prepared.')
            }
          />
          <ControlButton
            label="Record Stream"
            icon={Activity}
            onClick={() =>
              showNotice('Recording foundation prepared.')
            }
          />
          <ControlButton
            label="Stream Settings"
            icon={Settings2}
            onClick={() =>
              showNotice('Stream settings opened.')
            }
          />
        </div>

        <button
          type="button"
          onClick={isLive ? endLive : startLive}
          style={{
            ...styles.primaryButton,
            ...(isLive ? styles.endButton : {}),
          }}
        >
          {isLive ? <Pause size={17} /> : <Play size={17} />}
          {isLive ? 'End Live' : 'Start Live'}
        </button>
      </section>
    </>
  );

  const renderChat = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Live Chat"
        subtitle="Comments, replies, reactions, and moderation actions."
        icon={MessageCircle}
      />

      <div style={styles.chatToolbar}>
        <button
          type="button"
          onClick={() => setSlowMode((value) => !value)}
          aria-pressed={slowMode}
          style={{
            ...styles.filterButton,
            ...(slowMode
              ? styles.activeFilterButton
              : {}),
          }}
        >
          <Clock3 size={14} />
          Slow mode
        </button>

        <button
          type="button"
          onClick={() =>
            setSubscriberOnly((value) => !value)
          }
          aria-pressed={subscriberOnly}
          style={{
            ...styles.filterButton,
            ...(subscriberOnly
              ? styles.activeFilterButton
              : {}),
          }}
        >
          <BadgeCheck size={14} />
          Subscribers
        </button>
      </div>

      <div
        style={styles.chatList}
        aria-live="polite"
        aria-label="Live chat messages"
      >
        {messages.length ? (
          messages.slice(-30).map((message, index) => (
            <div
              key={message.id || index}
              style={styles.chatRow}
            >
              <Avatar item={message} />
              <div style={styles.chatCopy}>
                <strong>
                  {message.author ||
                    message.username ||
                    'Viewer'}
                </strong>
                <span>
                  {message.text || message.message || ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onPinComment?.(message);
                  showNotice('Comment pinned.');
                }}
                aria-label="Pin comment"
                style={styles.tinyButton}
              >
                <Pin size={14} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="Chat messages will appear here." />
        )}
      </div>

      <div style={styles.chatComposer}>
        <input
          value={chatInput}
          onChange={(event) =>
            setChatInput(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') sendMessage();
          }}
          placeholder="Reply to your audience"
          aria-label="Reply to live chat"
          style={styles.chatInput}
        />
        <button
          type="button"
          onClick={sendMessage}
          aria-label="Send chat reply"
          style={styles.sendButton}
        >
          <Send size={16} />
        </button>
      </div>
    </section>
  );

  const renderGuests = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Guests"
        subtitle="Manage multi-guest live layouts."
        icon={Users}
        action={
          <button
            type="button"
            onClick={() => {
              onInviteGuest?.();
              showNotice('Guest invitation prepared.');
            }}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Invite guest
          </button>
        }
      />

      <div style={styles.layoutOptions}>
        {['Speaker view', 'Grid view', '2 guests', '3 guests', '4 guests'].map(
          (layout) => (
            <button
              type="button"
              key={layout}
              onClick={() =>
                showNotice(`${layout} selected.`)
              }
              style={styles.layoutButton}
            >
              {layout}
            </button>
          )
        )}
      </div>

      <div style={styles.guestList}>
        {guestItems.map((guest, index) => (
          <div
            key={guest.id || index}
            style={styles.guestRow}
          >
            <Avatar item={guest} />
            <div style={styles.guestCopy}>
              <strong>
                {guest.name || 'Guest creator'}
              </strong>
              <span>
                {guest.status || 'Join request'} ·{' '}
                {guest.cameraOn === false
                  ? 'Camera off'
                  : 'Camera on'}
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                onMuteGuest?.(guest)
              }
              style={styles.tinyButton}
              aria-label={`Mute ${guest.name || 'guest'}`}
            >
              {guest.micMuted ? (
                <MicOff size={14} />
              ) : (
                <Mic size={14} />
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                onRemoveGuest?.(guest)
              }
              style={styles.removeButton}
              aria-label={`Remove ${guest.name || 'guest'}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  const renderAudience = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Audience"
        subtitle="Live viewer intelligence and supporter signals."
        icon={Eye}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Live viewers"
          value={formatCompact(viewerCount)}
          icon={Eye}
          color="#4dd7ff"
        />
        <MetricCard
          label="Peak viewers"
          value={formatCompact(peakViewers)}
          icon={Activity}
          color="#a895ff"
        />
        <MetricCard
          label="New joins"
          value={formatCompact(audience.newJoins)}
          icon={Users}
          color="#82e9c1"
        />
        <MetricCard
          label="Retention"
          value={
            audience.retention
              ? `${audience.retention}%`
              : 'Foundation'
          }
          icon={Clock3}
          color="#ffd27d"
        />
        <MetricCard
          label="Watch time"
          value={audience.watchTime || 'Foundation'}
          icon={Play}
          color="#9deeff"
        />
        <MetricCard
          label="Top supporters"
          value={audience.topSupporters || 'Foundation'}
          icon={Heart}
          color="#ff4fd8"
        />
        <MetricCard
          label="Top gifters"
          value={audience.topGifters || 'Foundation'}
          icon={Gift}
          color="#ff9f72"
        />
      </div>
    </section>
  );

  const renderOverlays = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Overlays"
        subtitle="Configure live visual layers and interaction cards."
        icon={ImageIcon}
      />

      <div style={styles.overlayGrid}>
        {OVERLAYS.map(([label, key]) => {
          const active = selectedOverlays.includes(key);

          return (
            <button
              type="button"
              key={key}
              onClick={() => toggleOverlay(key)}
              aria-pressed={active}
              style={{
                ...styles.overlayCard,
                ...(active
                  ? styles.activeOverlayCard
                  : {}),
              }}
            >
              <ImageIcon size={16} />
              <span>{label}</span>
              {active ? <Check size={14} /> : null}
            </button>
          );
        })}
      </div>

      <div style={styles.overlayPreview}>
        <Sparkles size={20} />
        <span>
          {selectedOverlays.length} overlays active in the
          broadcast scene.
        </span>
      </div>
    </section>
  );

  const renderModeration = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Moderation"
        subtitle="Protect the live community with Aarush safety foundations."
        icon={ShieldCheck}
      />

      <div style={styles.moderationGrid}>
        {[
          ['Mute User', MicOff],
          ['Remove User', X],
          ['Block User', ShieldCheck],
          ['Timeout User', Clock3],
          ['Keyword Filter', Search],
          ['AI Moderation', Sparkles],
          ['Spam Detection', Zap],
          ['Auto Hide', Eye],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} enabled for review.`)
            }
            style={styles.moderationButton}
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

  const renderCommerce = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Live Commerce"
        subtitle="Product discovery and conversion foundations."
        icon={ShoppingBag}
      />

      <label style={styles.field}>
        Featured product
        <select
          value={featuredProduct}
          onChange={(event) =>
            setFeaturedProduct(event.target.value)
          }
          style={styles.select}
        >
          <option value="">No product selected</option>
          {products.map((product, index) => (
            <option
              key={product.id || index}
              value={product.id || index}
            >
              {product.name || product.title || 'Product'}
            </option>
          ))}
        </select>
      </label>

      <div style={styles.productGrid}>
        {products.length ? (
          products.map((product, index) => (
            <div
              key={product.id || index}
              style={styles.productCard}
            >
              {product.image || product.thumbnail ? (
                <img
                  src={product.image || product.thumbnail}
                  alt={product.name || 'Product'}
                  loading="lazy"
                  style={styles.productImage}
                />
              ) : (
                <div style={styles.productPlaceholder}>
                  <Package size={24} />
                </div>
              )}
              <strong>
                {product.name || product.title || 'Featured product'}
              </strong>
              <span>
                {formatMoney(product.price)} ·{' '}
                {product.inventory || 'Inventory foundation'}
              </span>
              <button
                type="button"
                onClick={() =>
                  showNotice('Product card prepared.')
                }
                style={styles.productButton}
              >
                Add to live
              </button>
            </div>
          ))
        ) : (
          <Empty label="Products will appear here." />
        )}
      </div>

      <div style={styles.commerceMeta}>
        <span>Affiliate tag: Foundation</span>
        <span>Checkout: Prepared</span>
        <span>Conversion: {analytics.conversion || '—'}</span>
      </div>
    </section>
  );

  const renderAnalytics = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Live Analytics"
        subtitle="Performance signals for the current broadcast."
        icon={BarChart3}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Viewers"
          value={formatCompact(viewerCount)}
          icon={Eye}
          color="#4dd7ff"
        />
        <MetricCard
          label="Peak viewers"
          value={formatCompact(peakViewers)}
          icon={Activity}
          color="#a895ff"
        />
        <MetricCard
          label="Average watch time"
          value={
            analytics.averageWatchTime || 'Foundation'
          }
          icon={Clock3}
          color="#82e9c1"
        />
        <MetricCard
          label="Comments"
          value={formatCompact(analytics.comments)}
          icon={MessageCircle}
          color="#ffd27d"
        />
        <MetricCard
          label="Reactions"
          value={formatCompact(analytics.reactions)}
          icon={Heart}
          color="#ff4fd8"
        />
        <MetricCard
          label="Shares"
          value={formatCompact(analytics.shares)}
          icon={Send}
          color="#9deeff"
        />
        <MetricCard
          label="Follows gained"
          value={formatCompact(analytics.followsGained)}
          icon={Users}
          color="#82e9c1"
        />
        <MetricCard
          label="Revenue"
          value={formatMoney(analytics.revenue)}
          icon={Gift}
          color="#ff9f72"
        />
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'preview') return renderPreview();
    if (activeModule === 'chat') return renderChat();
    if (activeModule === 'guests') return renderGuests();
    if (activeModule === 'audience') return renderAudience();
    if (activeModule === 'overlays') return renderOverlays();
    if (activeModule === 'moderation') return renderModeration();
    if (activeModule === 'commerce') return renderCommerce();
    if (activeModule === 'analytics') return renderAnalytics();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close live broadcast studio"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Live Broadcast Studio</strong>
          <span>
            Produce, engage, and grow in real time
          </span>
        </div>

        <button
          type="button"
          aria-label="Broadcast settings"
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

      <style>{`
        @keyframes aarush-live-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-live-pulse {
          0%, 100% {
            box-shadow: 0 0 16px rgba(255,72,110,.3);
          }
          50% {
            box-shadow: 0 0 32px rgba(255,72,110,.7);
          }
        }

        .aarush-live-card:hover,
        .aarush-live-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-live-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-live-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-live-overlays,
          .aarush-live-moderation {
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

function ControlButton({
  active = true,
  label,
  icon: Icon,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        ...styles.controlButton,
        ...(active ? styles.activeControlButton : {}),
      }}
    >
      <Icon size={17} />
      <span>{label}</span>
    </button>
  );
}

function ConnectionQuality({ quality }) {
  return (
    <span style={styles.connection}>
      <span style={styles.connectionBars}>
        <i />
        <i />
        <i />
        <i />
      </span>
      {quality}
    </span>
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
      {String(item?.name || item?.author || 'A')
        .charAt(0)
        .toUpperCase()}
    </span>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Radio size={24} />
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

  previewShell: {
    padding: '.8rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    animation: 'aarush-live-in 240ms ease both',
  },

  previewFrame: {
    width: '100%',
    maxWidth: '42rem',
    margin: '0 auto',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    border: '1px solid rgba(77,215,255,.2)',
    borderRadius: '.9rem',
    background: '#090d16',
  },

  previewContent: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
  },

  previewImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  cameraPlaceholder: {
    display: 'grid',
    placeItems: 'center',
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.63rem',
  },

  previewTopBar: {
    position: 'absolute',
    top: '.65rem',
    right: '.65rem',
    left: '.65rem',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.4rem',
  },

  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.28rem',
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(0,0,0,.5)',
    fontSize: '.56rem',
    fontWeight: 850,
  },

  liveBadgeActive: {
    color: '#fff',
    background: 'rgba(255,65,106,.85)',
    animation: 'aarush-live-pulse 1.6s ease-in-out infinite',
  },

  liveDot: {
    width: '.38rem',
    height: '.38rem',
    borderRadius: '999px',
    background: 'currentColor',
  },

  viewerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.22rem',
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(0,0,0,.5)',
    fontSize: '.56rem',
  },

  previewBottomBar: {
    position: 'absolute',
    right: '.65rem',
    bottom: '.65rem',
    left: '.65rem',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    color: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,.8)',
    fontSize: '.62rem',
  },

  streamMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.7rem',
    marginTop: '.7rem',
  },

  streamMetaDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  streamMetaSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  connection: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    color: '#82e9c1',
    fontSize: '.58rem',
  },

  connectionBars: {
    display: 'inline-flex',
    alignItems: 'end',
    gap: '.1rem',
    height: '.8rem',
  },

  connectionBarsI: {
    width: '.18rem',
    borderRadius: '.15rem',
    background: '#82e9c1',
  },

  controlPanel: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-live-in 240ms ease both',
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

  controlGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
  },

  controlButton: {
    minHeight: '3rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.25rem',
    padding: '.35rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.56rem',
    cursor: 'pointer',
  },

  activeControlButton: {
    borderColor: 'rgba(77,215,255,.28)',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.08)',
  },

  primaryButton: {
    minHeight: '2.75rem',
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

  endButton: {
    background:
      'linear-gradient(135deg,#ff4f82,#ff9f72)',
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

  chatToolbar: {
    display: 'flex',
    gap: '.35rem',
    marginBottom: '.55rem',
  },

  filterButton: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  activeFilterButton: {
    borderColor: 'rgba(124,92,255,.4)',
    color: '#fff',
    background: 'rgba(124,92,255,.16)',
  },

  chatList: {
    maxHeight: '24rem',
    display: 'grid',
    gap: '.4rem',
    overflowY: 'auto',
    paddingRight: '.2rem',
  },

  chatRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.45rem',
    border: '1px solid rgba(255,255,255,.06)',
    borderRadius: '.65rem',
    background: 'rgba(255,255,255,.03)',
  },

  chatCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  chatCopySpan: {
    color: '#cbd6ec',
    fontSize: '.6rem',
  },

  avatar: {
    width: '2rem',
    height: '2rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '999px',
  },

  avatarFallback: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.7rem',
    fontWeight: 850,
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

  removeButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,91,132,.2)',
    borderRadius: '.5rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    cursor: 'pointer',
  },

  chatComposer: {
    display: 'flex',
    gap: '.35rem',
    marginTop: '.6rem',
  },

  chatInput: {
    minWidth: 0,
    minHeight: '2.5rem',
    flex: 1,
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.66rem',
  },

  sendButton: {
    width: '2.5rem',
    height: '2.5rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '.7rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  layoutOptions: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.45rem',
  },

  layoutButton: {
    minHeight: '2.2rem',
    flexShrink: 0,
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  guestList: {
    display: 'grid',
    gap: '.4rem',
  },

  guestRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  guestCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.16rem',
    flex: 1,
  },

  guestCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  overlayGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
  },

  overlayCard: {
    minHeight: '3.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeOverlayCard: {
    borderColor: 'rgba(124,92,255,.4)',
    color: '#fff',
    background: 'rgba(124,92,255,.15)',
  },

  overlayPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.6rem',
  },

  moderationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  moderationButton: {
    minHeight: '2.65rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.63rem',
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

  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
    marginTop: '.7rem',
  },

  productCard: {
    display: 'grid',
    gap: '.25rem',
    padding: '.5rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  productImage: {
    width: '100%',
    height: '5rem',
    objectFit: 'cover',
    borderRadius: '.5rem',
  },

  productPlaceholder: {
    height: '5rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.5rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.08)',
  },

  productCardSpan: {
    color: '#91a0bc',
    fontSize: '.54rem',
  },

  productButton: {
    minHeight: '2.1rem',
    border: 0,
    borderRadius: '.55rem',
    color: '#fff',
    background: 'rgba(124,92,255,.6)',
    fontSize: '.56rem',
    cursor: 'pointer',
  },

  commerceMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.5rem',
    marginTop: '.7rem',
    color: '#91a0bc',
    fontSize: '.57rem',
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
};