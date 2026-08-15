import {
  useMemo,
  useState,
} from 'react';
import {
  AlertCircle,
  Check,
  ChevronRight,
  Clock3,
  Facebook,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  MessageCircle,
  Pause,
  Play,
  Send,
  Settings,
  Share2,
  Sparkles,
  Twitter,
  X,
  Youtube,
} from 'lucide-react';

const PLATFORMS = [
  ['instagram', 'Instagram', Instagram],
  ['facebook', 'Facebook', Facebook],
  ['snapchat', 'Snapchat', CameraIcon],
  ['tiktok', 'TikTok', TikTokIcon],
  ['youtube', 'YouTube Shorts', Youtube],
  ['x', 'X', Twitter],
  ['linkedin', 'LinkedIn', Linkedin],
  ['pinterest', 'Pinterest', PinIcon],
  ['telegram', 'Telegram', Send],
  ['whatsapp', 'WhatsApp Channels', MessageCircle],
  ['threads', 'Threads', ThreadsIcon],
  ['discord', 'Discord', DiscordIcon],
];

const QUEUE_STATUSES = [
  'Draft',
  'Scheduled',
  'Preparing',
  'Publishing',
  'Published',
  'Failed',
];

const DEFAULT_OPTIMIZATION = {
  instagram: {
    caption: 'Visual-first caption',
    hashtags: 'Balanced hashtags',
    duration: '15 seconds',
    format: '9:16',
    resolution: '1080x1920',
    cta: 'View profile',
  },
  facebook: {
    caption: 'Conversational caption',
    hashtags: 'Fewer hashtags',
    duration: '30 seconds',
    format: '9:16',
    resolution: '1080x1920',
    cta: 'Learn more',
  },
  snapchat: {
    caption: 'Minimal caption',
    hashtags: 'Limited hashtags',
    duration: '10 seconds',
    format: '9:16',
    resolution: '1080x1920',
    cta: 'Swipe up foundation',
  },
  tiktok: {
    caption: 'Hook-first caption',
    hashtags: 'Trending hashtags',
    duration: '12 seconds',
    format: '9:16',
    resolution: '1080x1920',
    cta: 'Follow for more',
  },
  youtube: {
    caption: 'Search-friendly title',
    hashtags: 'Topic hashtags',
    duration: '30 seconds',
    format: '9:16',
    resolution: '1080x1920',
    cta: 'Subscribe',
  },
};

function normalizeAccounts(accounts = []) {
  return accounts.reduce((result, account) => {
    const id = account?.platform || account?.id;

    if (id) {
      result[id] = account;
    }

    return result;
  }, {});
}

function normalizeQueueItem(item, index) {
  return {
    ...item,
    id: item?.id || `queue-${index}`,
    title: item?.title || item?.caption || 'Untitled publication',
    status: item?.status || 'Draft',
    platforms: Array.isArray(item?.platforms)
      ? item.platforms
      : [],
    publishAt: item?.publishAt || item?.scheduledAt || null,
  };
}

function formatDate(value) {
  if (!value) return 'Not scheduled';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not scheduled';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusColor(status) {
  const colors = {
    Draft: '#aab6cf',
    Scheduled: '#ffd27d',
    Preparing: '#9deeff',
    Publishing: '#4dd7ff',
    Published: '#82e9c1',
    Failed: '#ffb1c8',
  };

  return colors[status] || '#aab6cf';
}

export default function StoryCrossPlatformPublisher({
  story = null,
  draft = null,
  schedule = null,
  connectedAccounts = [],
  publishQueue = [],
  analytics = {},
  onPublish,
  onSchedule,
  onConnectPlatform,
  onDisconnectPlatform,
  onClose,
}) {
  const accounts = useMemo(
    () => normalizeAccounts(connectedAccounts),
    [connectedAccounts]
  );

  const queue = useMemo(
    () => publishQueue.map(normalizeQueueItem),
    [publishQueue]
  );

  const [activeSection, setActiveSection] =
    useState('publish');
  const [selectedPlatforms, setSelectedPlatforms] =
    useState(() => {
      const defaults = connectedAccounts
        .filter((account) => account.connected)
        .map((account) => account.platform || account.id);

      return defaults.length
        ? defaults
        : ['instagram'];
    });
  const [previewPlatform, setPreviewPlatform] =
    useState('instagram');
  const [caption, setCaption] = useState(
    draft?.caption || story?.caption || ''
  );
  const [hashtags, setHashtags] = useState(
    draft?.hashtags?.join?.(' ') ||
      draft?.hashtags ||
      ''
  );
  const [publishDate, setPublishDate] =
    useState('');
  const [publishTime, setPublishTime] =
    useState('20:00');
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
      'Asia/Kolkata'
  );
  const [notice, setNotice] = useState('');
  const [publishing, setPublishing] = useState(false);

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    );
  };

  const selectAll = () => {
    setSelectedPlatforms(
      PLATFORMS.filter(([id]) => accounts[id]?.connected)
        .map(([id]) => id)
    );
  };

  const deselectAll = () => {
    setSelectedPlatforms([]);
  };

  const publishNow = async () => {
    if (!selectedPlatforms.length) {
      showNotice('Select at least one platform.');
      return;
    }

    setPublishing(true);

    try {
      await onPublish?.({
        story,
        draft,
        platforms: selectedPlatforms,
        captions: Object.fromEntries(
          selectedPlatforms.map((platform) => [
            platform,
            caption,
          ])
        ),
        hashtags: Object.fromEntries(
          selectedPlatforms.map((platform) => [
            platform,
            hashtags,
          ])
        ),
        optimization: DEFAULT_OPTIMIZATION,
        publishStatus: 'Publishing',
      });

      showNotice('Cross-platform publishing started.');
    } finally {
      setPublishing(false);
    }
  };

  const schedulePublish = () => {
    if (!selectedPlatforms.length) {
      showNotice('Select at least one platform.');
      return;
    }

    onSchedule?.({
      story,
      draft,
      platforms: selectedPlatforms,
      captions: Object.fromEntries(
        selectedPlatforms.map((platform) => [
          platform,
          caption,
        ])
      ),
      hashtags: Object.fromEntries(
        selectedPlatforms.map((platform) => [
          platform,
          hashtags,
        ])
      ),
      schedule: {
        date: publishDate,
        time: publishTime,
        timeZone,
      },
      queueStatus: 'Scheduled',
    });

    showNotice('Publication scheduled.');
  };

  const sections = [
    ['publish', 'Publish Now', Send],
    ['platforms', 'Platforms', Share2],
    ['optimization', 'Optimization', Sparkles],
    ['schedule', 'Schedule', Clock3],
    ['queue', 'Queue', Play],
    ['analytics', 'Analytics', BarChartIcon],
  ];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close cross-platform publisher"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Cross-Platform Publisher</strong>
          <span>One story, every audience</span>
        </div>

        <button
          type="button"
          aria-label="Publishing settings"
          style={styles.iconButton}
        >
          <Settings size={18} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <div style={styles.tabs}>
          {sections.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveSection(id)}
              aria-pressed={activeSection === id}
              style={{
                ...styles.tab,
                ...(activeSection === id
                  ? styles.activeTab
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {activeSection === 'publish' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Publish Now"
              subtitle="Choose where this story should go."
              icon={Send}
            />

            <Preview
              story={story || draft}
              platform={previewPlatform}
            />

            <div style={styles.previewTabs}>
              {PLATFORMS.slice(0, 5).map(
                ([id, label, Icon]) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setPreviewPlatform(id)}
                    aria-pressed={previewPlatform === id}
                    style={{
                      ...styles.previewTab,
                      ...(previewPlatform === id
                        ? styles.activePreviewTab
                        : {}),
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                )
              )}
            </div>

            <label style={styles.field}>
              Caption
              <textarea
                value={caption}
                onChange={(event) =>
                  setCaption(event.target.value)
                }
                placeholder="Write a platform-ready caption"
                style={styles.textarea}
              />
            </label>

            <label style={styles.field}>
              Hashtags
              <input
                value={hashtags}
                onChange={(event) =>
                  setHashtags(event.target.value)
                }
                placeholder="#AarushStories #CreatorLife"
                style={styles.textInput}
              />
            </label>

            <div style={styles.selectionActions}>
              <button
                type="button"
                onClick={selectAll}
                style={styles.smallButton}
              >
                Select all
              </button>

              <button
                type="button"
                onClick={deselectAll}
                style={styles.smallButton}
              >
                Deselect all
              </button>
            </div>

            <div style={styles.platformGrid}>
              {PLATFORMS.map(([id, label, Icon]) => {
                const connected = Boolean(
                  accounts[id]?.connected
                );
                const selected =
                  selectedPlatforms.includes(id);

                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => {
                      if (!connected) {
                        onConnectPlatform?.(id);
                        showNotice(
                          `${label} connection prepared.`
                        );
                        return;
                      }

                      togglePlatform(id);
                    }}
                    aria-pressed={selected}
                    style={{
                      ...styles.platformCard,
                      ...(selected
                        ? styles.selectedPlatformCard
                        : {}),
                      ...(connected
                        ? {}
                        : styles.disconnectedPlatformCard),
                    }}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                    <small>
                      {connected ? 'Connected' : 'Connect'}
                    </small>
                    {selected ? (
                      <Check
                        size={14}
                        style={{ marginLeft: 'auto' }}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={publishNow}
              disabled={publishing}
              style={styles.primaryButton}
            >
              {publishing ? (
                <span style={styles.spinner} />
              ) : (
                <Send size={16} />
              )}
              {publishing
                ? 'Publishing…'
                : `Publish to ${selectedPlatforms.length} platforms`}
            </button>
          </section>
        ) : null}

        {activeSection === 'platforms' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Connected Platforms"
              subtitle="Manage account connections and sync status."
              icon={Share2}
            />

            <div style={styles.platformList}>
              {PLATFORMS.map(([id, label, Icon]) => {
                const account = accounts[id];
                const connected = Boolean(account?.connected);

                return (
                  <div
                    key={id}
                    style={styles.accountRow}
                  >
                    <span style={styles.accountIcon}>
                      <Icon size={17} />
                    </span>

                    <div style={styles.accountCopy}>
                      <strong>
                        {label}
                        {account?.verified ? (
                          <Check
                            size={13}
                            color="#82e9c1"
                          />
                        ) : null}
                      </strong>
                      <span>
                        {connected
                          ? account.name || 'Connected account'
                          : 'Not connected'}
                      </span>
                      <small>
                        Last sync:{' '}
                        {account?.lastSync || 'Foundation'}
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (connected) {
                          onDisconnectPlatform?.(id);
                          showNotice(`${label} disconnected.`);
                        } else {
                          onConnectPlatform?.(id);
                          showNotice(`${label} connection prepared.`);
                        }
                      }}
                      style={
                        connected
                          ? styles.disconnectButton
                          : styles.connectButton
                      }
                    >
                      {connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {activeSection === 'optimization' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Platform Optimization"
              subtitle="Prepare platform-specific variations."
              icon={Sparkles}
            />

            {selectedPlatforms.length ? (
              selectedPlatforms.map((platform) => {
                const item =
                  DEFAULT_OPTIMIZATION[platform] ||
                  DEFAULT_OPTIMIZATION.instagram;
                const label =
                  PLATFORMS.find(([id]) => id === platform)?.[1] ||
                  platform;

                return (
                  <div
                    key={platform}
                    style={styles.optimizationCard}
                  >
                    <strong>{label}</strong>
                    <OptimizationRow
                      label="Caption"
                      value={item.caption}
                    />
                    <OptimizationRow
                      label="Hashtags"
                      value={item.hashtags}
                    />
                    <OptimizationRow
                      label="Duration"
                      value={item.duration}
                    />
                    <OptimizationRow
                      label="Format"
                      value={`${item.format} · ${item.resolution}`}
                    />
                    <OptimizationRow
                      label="CTA"
                      value={item.cta}
                    />
                  </div>
                );
              })
            ) : (
              <Empty label="Select platforms to see optimization." />
            )}
          </section>
        ) : null}

        {activeSection === 'schedule' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Schedule"
              subtitle="Choose a time zone and publish window."
              icon={Clock3}
            />

            <div style={styles.scheduleHero}>
              <Clock3 size={22} />
              <div>
                <strong>
                  Best AI time:{' '}
                  {schedule?.recommendedTime || '8:00 PM'}
                </strong>
                <span>
                  Smart scheduling and recurring posts foundation.
                </span>
              </div>
            </div>

            <div style={styles.settingGrid}>
              <label style={styles.field}>
                Date
                <input
                  type="date"
                  value={publishDate}
                  onChange={(event) =>
                    setPublishDate(event.target.value)
                  }
                  style={styles.textInput}
                />
              </label>

              <label style={styles.field}>
                Time
                <input
                  type="time"
                  value={publishTime}
                  onChange={(event) =>
                    setPublishTime(event.target.value)
                  }
                  style={styles.textInput}
                />
              </label>
            </div>

            <label style={styles.field}>
              Time zone
              <select
                value={timeZone}
                onChange={(event) =>
                  setTimeZone(event.target.value)
                }
                style={styles.select}
              >
                <option>Asia/Kolkata</option>
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
            </label>

            <button
              type="button"
              onClick={schedulePublish}
              style={styles.primaryButton}
            >
              <Clock3 size={16} />
              Schedule publication
            </button>
          </section>
        ) : null}

        {activeSection === 'queue' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Publishing Queue"
              subtitle="Upcoming cross-platform publications."
              icon={Play}
            />

            {queue.length ? (
              <div style={styles.queueList}>
                {queue.map((item) => (
                  <div
                    key={item.id}
                    style={styles.queueRow}
                  >
                    <span style={styles.queueIcon}>
                      <Play size={15} />
                    </span>

                    <div style={styles.queueCopy}>
                      <strong>{item.title}</strong>
                      <span>
                        {item.platforms.join(', ') ||
                          'No platforms'}{' '}
                        · {formatDate(item.publishAt)}
                      </span>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        color: statusColor(item.status),
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <Empty label="Publishing queue is empty." />
            )}
          </section>
        ) : null}

        {activeSection === 'analytics' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Platform Analytics"
              subtitle="Compare performance across platforms."
              icon={BarChartIcon}
            />

            <div style={styles.analyticsGrid}>
              {PLATFORMS.slice(0, 6).map(
                ([id, label, Icon]) => {
                  const item = analytics?.[id] || {};

                  return (
                    <div
                      key={id}
                      style={styles.analyticsCard}
                    >
                      <Icon size={16} />
                      <strong>{label}</strong>
                      <span>
                        Views {item.views || '—'}
                      </span>
                      <span>
                        Reach {item.reach || '—'}
                      </span>
                      <span>
                        Engagement {item.engagement || '—'}
                      </span>
                    </div>
                  );
                }
              )}
            </div>

            <div style={styles.bestPlatform}>
              <TrendingIcon />
              Best performing platform:{' '}
              <strong>
                {analytics.bestPlatform || 'Foundation'}
              </strong>
            </div>
          </section>
        ) : null}
      </div>

      <style>{`
        @keyframes aarush-publisher-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-publisher-card:hover,
        .aarush-publisher-tab:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 560px) {
          .aarush-publisher-tabs {
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-publisher-platform-grid {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-publisher-analytics {
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

function SectionTitle({ title, subtitle, icon: Icon }) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      <Icon size={18} color="#4dd7ff" />
    </div>
  );
}

function OptimizationRow({ label, value }) {
  return (
    <div style={styles.optimizationRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Preview({ story, platform }) {
  const title =
    PLATFORMS.find(([id]) => id === platform)?.[1] ||
    'Platform';

  const url =
    story?.mediaUrl ||
    story?.media_url ||
    story?.thumbnailUrl ||
    story?.thumbnail_url ||
    '';

  return (
    <div style={styles.preview}>
      {url ? (
        <img
          src={url}
          alt={`${title} preview`}
          style={styles.previewImage}
        />
      ) : (
        <div style={styles.previewPlaceholder}>
          <ImageIcon size={30} />
          <span>{title} preview foundation</span>
        </div>
      )}

      <div style={styles.previewOverlay}>
        <strong>{title}</strong>
        <span>
          {story?.caption || 'Platform-specific preview'}
        </span>
      </div>
    </div>
  );
}

function OptimizationRowPlaceholder() {
  return null;
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Share2 size={25} />
      <span>{label}</span>
    </div>
  );
}

function CameraIcon() {
  return (
    <span style={styles.customIcon}>
      <ImageIcon size={17} />
    </span>
  );
}

function TikTokIcon() {
  return (
    <span style={styles.customIcon}>
      <Music size={17} />
    </span>
  );
}

function PinIcon() {
  return (
    <span style={styles.customIcon}>
      <TargetIcon />
    </span>
  );
}

function ThreadsIcon() {
  return (
    <span style={styles.customIcon}>
      <MessageCircle size={17} />
    </span>
  );
}

function DiscordIcon() {
  return (
    <span style={styles.customIcon}>
      <Users size={17} />
    </span>
  );
}

function TargetIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <span style={styles.customIcon}>
      <BarChartSvg />
    </span>
  );
}

function BarChartSvg() {
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
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <span style={styles.customIcon}>
      <TrendingSvg />
    </span>
  );
}

function TrendingSvg() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

const DEFAULT_OPTIMIZATION = {
  instagram: {
    caption: 'Visual-first caption',
    hashtags: 'Balanced hashtags',
    duration: '15 seconds',
    format: '9:16',
    resolution: '1080x1920',
    cta: 'View profile',
  },
  facebook: {
    caption: 'Conversational caption',
    hashtags: 'Fewer hashtags',
    duration: '30 seconds',
    format: '9:16',
    resolution: '1080x1920',
    cta: 'Learn more',
  },
  snapchat: {
    caption: 'Minimal caption',
    hashtags: 'Limited hashtags',
    duration: '10 seconds',
    format: '9:16',
    resolution: '1080x1920',
    cta: 'Swipe up foundation',
  },
  tiktok: {
    caption: 'Hook-first caption',
    hashtags: 'Trending hashtags',
    duration: '12 seconds',
    format: '9:16',
    resolution: '1080x1920',
    cta: 'Follow for more',
  },
  youtube: {
    caption: 'Search-friendly title',
    hashtags: 'Topic hashtags',
    duration: '30 seconds',
    format: '9:16',
    resolution: '1080x1920',
    cta: 'Subscribe',
  },
};

const PLATFORMS = [
  ['instagram', 'Instagram', Instagram],
  ['facebook', 'Facebook', Facebook],
  ['snapchat', 'Snapchat', CameraIcon],
  ['tiktok', 'TikTok', TikTokIcon],
  ['youtube', 'YouTube Shorts', Youtube],
  ['x', 'X', Twitter],
  ['linkedin', 'LinkedIn', Linkedin],
  ['pinterest', 'Pinterest', PinIcon],
  ['telegram', 'Telegram', Send],
  ['whatsapp', 'WhatsApp Channels', MessageCircle],
  ['threads', 'Threads', ThreadsIcon],
  ['discord', 'Discord', DiscordIcon],
];

const styles = {
  page: {
    minHeight: '100vh',
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

  tabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.35rem',
  },

  tab: {
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  activeTab: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-publisher-in 240ms ease both',
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

  preview: {
    position: 'relative',
    minHeight: '16rem',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    borderRadius: '1rem',
    color: '#9deeff',
    background: '#17233d',
  },

  previewImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  previewPlaceholder: {
    display: 'grid',
    justifyItems: 'center',
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  previewOverlay: {
    position: 'absolute',
    right: '.8rem',
    bottom: '.7rem',
    left: '.8rem',
    zIndex: 1,
    display: 'grid',
    gap: '.2rem',
    color: '#fff',
    textShadow: '0 2px 12px rgba(0,0,0,.7)',
  },

  previewOverlaySpan: {
    color: '#cbd6ec',
    fontSize: '.62rem',
  },

  previewTabs: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    margin: '.6rem 0',
  },

  previewTab: {
    minHeight: '2.15rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    flexShrink: 0,
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activePreviewTab: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    marginTop: '.65rem',
    color: '#aab6cf',
    fontSize: '.62rem',
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

  textarea: {
    minHeight: '5.5rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    resize: 'vertical',
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.68rem',
    lineHeight: 1.45,
  },

  selectionActions: {
    display: 'flex',
    gap: '.35rem',
    marginTop: '.6rem',
  },

  smallButton: {
    minHeight: '2.2rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.59rem',
    cursor: 'pointer',
  },

  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  platformCard: {
    minHeight: '4rem',
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    gap: '.18rem',
    padding: '.45rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  selectedPlatformCard: {
    borderColor: 'rgba(124,92,255,.48)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.22),rgba(77,215,255,.08))',
  },

  disconnectedPlatformCard: {
    opacity: .7,
  },

  platformCardSmall: {
    color: '#91a0bc',
    fontSize: '.52rem',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
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

  platformList: {
    display: 'grid',
    gap: '.45rem',
  },

  accountRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    background: 'rgba(255,255,255,.035)',
  },

  accountIcon: {
    width: '2.35rem',
    height: '2.35rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  accountCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  accountCopyStrong: {
    display: 'flex',
    alignItems: 'center',
    gap: '.25rem',
  },

  accountCopySpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  accountCopySmall: {
    color: '#6f7d98',
    fontSize: '.55rem',
  },

  connectButton: {
    minHeight: '2.2rem',
    padding: '0 .5rem',
    border: 0,
    borderRadius: '.6rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.58rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  disconnectButton: {
    minHeight: '2.2rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,91,132,.2)',
    borderRadius: '.6rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  optimizationCard: {
    display: 'grid',
    gap: '.35rem',
    marginBottom: '.5rem',
    padding: '.65rem',
    border: '1px solid rgba(124,92,255,.16)',
    borderRadius: '.75rem',
    background: 'rgba(124,92,255,.05)',
  },

  optimizationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    minHeight: '2rem',
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  optimizationRowStrong: {
    color: '#dce5f8',
  },

  settingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.5rem',
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

  scheduleHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.7rem',
    borderRadius: '.75rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.06)',
  },

  scheduleHeroDiv: {
    display: 'grid',
    gap: '.18rem',
  },

  scheduleHeroSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  scheduleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.4rem',
    padding: '0 .5rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    color: '#cbd6ec',
    fontSize: '.61rem',
  },

  scheduleRowStrong: {
    marginLeft: 'auto',
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  queueList: {
    display: 'grid',
    gap: '.45rem',
  },

  queueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  queueIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  queueCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  queueCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  statusBadge: {
    padding: '.28rem .4rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.06)',
    fontSize: '.55rem',
    fontWeight: 800,
  },

  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  analyticsCard: {
    minHeight: '5.5rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.2rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  analyticsCardStrong: {
    color: '#fff',
    fontSize: '.67rem',
  },

  bestPlatform: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    marginTop: '.65rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.62rem',
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
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.64rem',
    textAlign: 'center',
  },

  spinner: {
    animation: 'aarush-publisher-spin 800ms linear infinite',
  },
};