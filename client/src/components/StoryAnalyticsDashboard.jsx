import {
  useMemo,
  useState,
} from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  Heart,
  MessageCircle,
  MousePointer2,
  Play,
  Reply,
  Share2,
  Users,
  X,
} from 'lucide-react';

const RANGES = [
  ['7d', '7 days'],
  ['30d', '30 days'],
  ['90d', '90 days'],
  ['all', 'All time'],
];

const DEFAULT_ANALYTICS = {
  views: 0,
  uniqueViews: 0,
  completionRate: 0,
  averageWatchTime: 0,
  medianWatchTime: 0,
  watchTime: 0,
  replays: 0,
  replies: 0,
  reactions: 0,
  shares: 0,
  exits: 0,
  tapForward: 0,
  tapBack: 0,
  profileVisits: 0,
  retentionData: [],
  engagementData: [],
  audienceData: {},
  navigationData: {},
};

function number(value) {
  return Number(value) || 0;
}

function storyId(story) {
  return story?.id || story?.storyId;
}

function storyUrl(story) {
  return (
    story?.thumbnailUrl ||
    story?.thumbnail_url ||
    story?.mediaUrl ||
    story?.media_url ||
    ''
  );
}

function storyTitle(story) {
  return (
    story?.caption ||
    story?.title ||
    'Untitled story'
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(number(value));
}

function formatDuration(seconds) {
  const value = Math.max(0, Math.round(number(seconds)));

  if (value < 60) return `${value}s`;

  return `${Math.floor(value / 60)}m ${value % 60}s`;
}

function formatPercent(value) {
  return `${Math.round(number(value))}%`;
}

function normalizeData(value) {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => ({
    label:
      item?.label ||
      item?.time ||
      item?.segment ||
      String(index + 1),
    value: number(
      item?.value ||
        item?.viewers ||
        item?.count ||
        item?.views
    ),
  }));
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
  data,
  color = '#4dd7ff',
  fill = true,
  height = 150,
}) {
  const points = normalizeData(data);
  const max = Math.max(
    1,
    ...points.map((point) => point.value)
  );

  const path = points
    .map((point, index) => {
      const x =
        points.length <= 1
          ? 50
          : (index / (points.length - 1)) * 100;
      const y = 94 - (point.value / max) * 78;

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const area =
    points.length > 1
      ? `${path} L 100 100 L 0 100 Z`
      : '';

  return (
    <div
      role="img"
      aria-label="Analytics chart"
      style={{
        ...styles.chart,
        height,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={styles.chartSvg}
      >
        <defs>
          <linearGradient
            id={`chart-gradient-${color.replace('#', '')}`}
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={color}
              stopOpacity=".34"
            />
            <stop
              offset="100%"
              stopColor={color}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

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

        {fill && area ? (
          <path
            d={area}
            fill={`url(#chart-gradient-${color.replace(
              '#',
              ''
            )})`}
          />
        ) : null}

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

      {points.length ? (
        <div style={styles.chartLabels}>
          <span>{points[0].label}</span>
          <span>
            {points[points.length - 1].label}
          </span>
        </div>
      ) : (
        <div style={styles.noChartData}>
          Analytics will appear here.
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value, icon: Icon }) {
  return (
    <div style={styles.statRow}>
      <span style={styles.statRowLabel}>
        <Icon size={14} />
        {label}
      </span>
      <strong>{formatNumber(value)}</strong>
    </div>
  );
}

export default function StoryAnalyticsDashboard({
  stories = [],
  analytics = {},
  selectedStory = null,
  timeRange = '7d',
  onChangeRange,
  onSelectStory,
  onClose,
}) {
  const [activeRange, setActiveRange] =
    useState(timeRange);
  const [activeStoryId, setActiveStoryId] =
    useState(storyId(selectedStory) || storyId(stories[0]));
  const [compareMode, setCompareMode] =
    useState(false);
  const [compareIds, setCompareIds] =
    useState([]);

  const selected = useMemo(
    () =>
      stories.find(
        (story) => storyId(story) === activeStoryId
      ) || selectedStory || stories[0] || null,
    [activeStoryId, selectedStory, stories]
  );

  const selectedAnalytics = useMemo(() => {
    const id = storyId(selected);

    if (id && analytics?.byStory?.[id]) {
      return {
        ...DEFAULT_ANALYTICS,
        ...analytics.byStory[id],
      };
    }

    return {
      ...DEFAULT_ANALYTICS,
      ...analytics,
    };
  }, [analytics, selected]);

  const retentionData = useMemo(
    () =>
      normalizeData(
        selectedAnalytics.retentionData
      ),
    [selectedAnalytics.retentionData]
  );

  const engagementData = useMemo(
    () =>
      normalizeData(
        selectedAnalytics.engagementData
      ),
    [selectedAnalytics.engagementData]
  );

  const audience = selectedAnalytics.audienceData || {};
  const navigation =
    selectedAnalytics.navigationData || {};

  const changeRange = (range) => {
    setActiveRange(range);
    onChangeRange?.(range);
  };

  const selectStory = (story) => {
    const id = storyId(story);
    setActiveStoryId(id);
    onSelectStory?.(story);
  };

  const toggleCompare = (story) => {
    const id = storyId(story);

    setCompareIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const insightCards = [
    'Your audience watched this story longer than usual.',
    'Most viewers exited near the end.',
    'This story performed best with close friends.',
    'Stories under 12 seconds performed better.',
    'Stories posted at 8 PM received more replies.',
  ];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close analytics dashboard"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Story Analytics</strong>
          <span>Creator performance insights</span>
        </div>

        <button
          type="button"
          aria-label="Analytics options"
          style={styles.iconButton}
        >
          <BarChart3 size={18} />
        </button>
      </header>

      <div style={styles.content}>
        <section style={styles.rangeRow}>
          <div style={styles.rangeTabs}>
            {RANGES.map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => changeRange(value)}
                aria-pressed={activeRange === value}
                style={{
                  ...styles.rangeButton,
                  ...(activeRange === value
                    ? styles.activeRangeButton
                    : {}),
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCompareMode((value) => !value)}
            aria-pressed={compareMode}
            style={styles.compareButton}
          >
            Compare
          </button>
        </section>

        <section style={styles.selector}>
          <div style={styles.selectorHeader}>
            <div>
              <strong>Selected story</strong>
              <span>
                {selected
                  ? storyTitle(selected)
                  : 'No story selected'}
              </span>
            </div>

            <ChevronDown size={16} />
          </div>

          <div style={styles.storyScroller}>
            {stories.length ? (
              stories.map((story) => {
                const active =
                  storyId(story) === activeStoryId;
                const compared = compareIds.includes(
                  storyId(story)
                );

                return (
                  <button
                    type="button"
                    key={storyId(story)}
                    onClick={() =>
                      compareMode
                        ? toggleCompare(story)
                        : selectStory(story)
                    }
                    aria-pressed={
                      compareMode ? compared : active
                    }
                    style={{
                      ...styles.storySelector,
                      ...(active || compared
                        ? styles.activeStorySelector
                        : {}),
                    }}
                  >
                    <span style={styles.storyThumb}>
                      {storyUrl(story) ? (
                        <img
                          src={storyUrl(story)}
                          alt=""
                          loading="lazy"
                          style={styles.storyThumbImage}
                        />
                      ) : (
                        <Play size={15} />
                      )}
                    </span>

                    <span style={styles.storySelectorText}>
                      <strong>
                        {storyTitle(story)}
                      </strong>
                      <small>
                        {formatNumber(
                          story?.views ||
                            story?.viewCount ||
                            0
                        )}{' '}
                        views
                      </small>
                    </span>

                    {compared ? (
                      <Check size={14} />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <span style={styles.muted}>
                No stories available.
              </span>
            )}
          </div>
        </section>

        <section style={styles.metricGrid}>
          <MetricCard
            label="Total Views"
            value={formatNumber(selectedAnalytics.views)}
            icon={Eye}
            accent="#4dd7ff"
          />
          <MetricCard
            label="Unique Viewers"
            value={formatNumber(
              selectedAnalytics.uniqueViews
            )}
            icon={Users}
            accent="#7c5cff"
          />
          <MetricCard
            label="Completion Rate"
            value={formatPercent(
              selectedAnalytics.completionRate
            )}
            icon={Check}
            accent="#82e9c1"
          />
          <MetricCard
            label="Avg Watch Time"
            value={formatDuration(
              selectedAnalytics.averageWatchTime
            )}
            icon={Clock3}
            accent="#ffd27d"
          />
          <MetricCard
            label="Replays"
            value={formatNumber(
              selectedAnalytics.replays
            )}
            icon={RotateIcon}
            accent="#ff4fd8"
          />
          <MetricCard
            label="Shares"
            value={formatNumber(
              selectedAnalytics.shares
            )}
            icon={Share2}
            accent="#9deeff"
          />
          <MetricCard
            label="Replies"
            value={formatNumber(
              selectedAnalytics.replies
            )}
            icon={MessageCircle}
            accent="#ff9f72"
          />
          <MetricCard
            label="Reactions"
            value={formatNumber(
              selectedAnalytics.reactions
            )}
            icon={Heart}
            accent="#ff5b84"
          />
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2>Audience retention</h2>
              <span>
                Viewers remaining across the story
              </span>
            </div>
            <Activity size={18} color="#4dd7ff" />
          </div>

          <MiniChart
            data={retentionData}
            color="#4dd7ff"
            height={170}
          />

          <div style={styles.legendRow}>
            <span>
              <i style={{ background: '#4dd7ff' }} />
              Completion trend
            </span>
            <span>
              {formatPercent(
                selectedAnalytics.completionRate
              )}{' '}
              completed
            </span>
          </div>
        </section>

        <section style={styles.twoColumn}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2>Watch time</h2>
                <span>Consumption quality</span>
              </div>
              <Clock3 size={18} color="#ffd27d" />
            </div>

            <StatRow
              label="Total watch time"
              value={formatDuration(
                selectedAnalytics.watchTime
              )}
              icon={Clock3}
            />
            <StatRow
              label="Average watch time"
              value={formatDuration(
                selectedAnalytics.averageWatchTime
              )}
              icon={Clock3}
            />
            <StatRow
              label="Median watch time"
              value={formatDuration(
                selectedAnalytics.medianWatchTime
              )}
              icon={Clock3}
            />
            <StatRow
              label="Replay watch time"
              value={formatDuration(
                selectedAnalytics.replayWatchTime
              )}
              icon={Play}
            />
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2>Navigation</h2>
                <span>How viewers moved</span>
              </div>
              <MousePointer2 size={18} color="#a895ff" />
            </div>

            <StatRow
              label="Tapped forward"
              value={navigation.tapForward || selectedAnalytics.tapForward}
              icon={ArrowUpRight}
            />
            <StatRow
              label="Tapped back"
              value={navigation.tapBack || selectedAnalytics.tapBack}
              icon={ArrowDownRight}
            />
            <StatRow
              label="Exits"
              value={navigation.exits || selectedAnalytics.exits}
              icon={X}
            />
            <StatRow
              label="Paused"
              value={navigation.paused}
              icon={PauseIcon}
            />
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2>Engagement timeline</h2>
              <span>Replies, reactions, and shares</span>
            </div>
            <MessageCircle size={18} color="#ff9f72" />
          </div>

          <MiniChart
            data={engagementData}
            color="#ff4fd8"
            height={145}
          />

          <div style={styles.engagementRow}>
            <span>
              Replies
              <strong>{formatNumber(selectedAnalytics.replies)}</strong>
            </span>
            <span>
              Reactions
              <strong>{formatNumber(selectedAnalytics.reactions)}</strong>
            </span>
            <span>
              Shares
              <strong>{formatNumber(selectedAnalytics.shares)}</strong>
            </span>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2>Audience insights</h2>
              <span>Audience composition foundation</span>
            </div>
            <Users size={18} color="#82e9c1" />
          </div>

          <div style={styles.audienceGrid}>
            <StatRow
              label="Returning viewers"
              value={audience.returningViewers}
              icon={Users}
            />
            <StatRow
              label="New viewers"
              value={audience.newViewers}
              icon={Users}
            />
            <StatRow
              label="Followers"
              value={audience.followers}
              icon={Users}
            />
            <StatRow
              label="Non-followers"
              value={audience.nonFollowers}
              icon={Users}
            />
            <StatRow
              label="Close Friends"
              value={audience.closeFriends}
              icon={Heart}
            />
            <StatRow
              label="Public viewers"
              value={audience.publicViewers}
              icon={Eye}
            />
          </div>

          <div style={styles.foundationGrid}>
            {[
              'Country',
              'City',
              'Language',
              'Device',
              'Platform',
              'Time zone',
              'Age',
              'Gender',
            ].map((label) => (
              <span key={label}>
                {label}
                <small>Foundation</small>
              </span>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2>AI creator insights</h2>
              <span>Recommendation foundation</span>
            </div>
            <SparkleIcon />
          </div>

          <div style={styles.insightList}>
            {insightCards.map((insight) => (
              <div key={insight} style={styles.insight}>
                <SparkleIcon />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.exportCard}>
          <div>
            <strong>Export analytics</strong>
            <span>
              PDF, CSV, image report, and sharing
              foundations are ready.
            </span>
          </div>

          <button
            type="button"
            onClick={() => {}}
            style={styles.exportButton}
          >
            Export
            <ChevronRight size={15} />
          </button>
        </section>
      </div>

      <style>{`
        @keyframes aarush-analytics-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-analytics-card:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 620px) {
          .aarush-analytics-two-column {
            grid-template-columns: 1fr !important;
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

function storyUrl(story) {
  return (
    story?.thumbnailUrl ||
    story?.thumbnail_url ||
    story?.mediaUrl ||
    story?.media_url ||
    ''
  );
}

function RotateIcon(props) {
  return (
    <svg
      width={props.size || 18}
      height={props.size || 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function PauseIcon(props) {
  return (
    <svg
      width={props.size || 18}
      height={props.size || 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <span style={styles.sparkleIcon}>
      <Activity size={15} />
    </span>
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
    width: 'min(100%, 1050px)',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.8rem',
  },

  rangeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
  },

  rangeTabs: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
  },

  rangeButton: {
    minHeight: '2.25rem',
    flexShrink: 0,
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  activeRangeButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  compareButton: {
    minHeight: '2.25rem',
    flexShrink: 0,
    padding: '0 .65rem',
    border: '1px solid rgba(77,215,255,.22)',
    borderRadius: '999px',
    color: '#9deeff',
    background: 'rgba(77,215,255,.08)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  selector: {
    padding: '.8rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1rem',
    background: 'rgba(15,19,30,.9)',
  },

  selectorHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.65rem',
  },

  selectorHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  selectorHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  storyScroller: {
    display: 'flex',
    gap: '.45rem',
    overflowX: 'auto',
  },

  storySelector: {
    minWidth: '11rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    flexShrink: 0,
    padding: '.45rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.04)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeStorySelector: {
    borderColor: 'rgba(124,92,255,.48)',
    background: 'rgba(124,92,255,.15)',
  },

  storyThumb: {
    width: '2.4rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: '.45rem',
    color: '#9deeff',
    background: '#192540',
  },

  storyThumbImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  storySelectorText: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
    flex: 1,
  },

  storySelectorTextSmall: {
    color: '#91a0bc',
    fontSize: '.58rem',
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
    animation: 'aarush-analytics-in 260ms ease both',
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
    fontSize: '1rem',
  },

  metricDetail: {
    color: '#82e9c1',
    fontSize: '.55rem',
  },

  card: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 18px 48px rgba(0,0,0,.18)',
    animation: 'aarush-analytics-in 280ms ease both',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.7rem',
  },

  cardHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  cardHeaderH2: {
    margin: 0,
    fontSize: '.82rem',
  },

  cardHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  chart: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: '.65rem',
    background: 'rgba(255,255,255,.02)',
  },

  chartSvg: {
    width: '100%',
    height: '100%',
    display: 'block',
  },

  chartLabels: {
    position: 'absolute',
    right: '.35rem',
    bottom: '.25rem',
    left: '.35rem',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#71809a',
    fontSize: '.52rem',
  },

  noChartData: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    color: '#71809a',
    fontSize: '.62rem',
  },

  legendRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginTop: '.55rem',
    color: '#91a0bc',
    fontSize: '.6rem',
  },

  legendRowSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
  },

  legendRowI: {
    width: '.45rem',
    height: '.45rem',
    display: 'inline-block',
    borderRadius: '999px',
  },

  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.8rem',
  },

  statRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.4rem',
    minHeight: '2rem',
    color: '#cbd6ec',
    fontSize: '.64rem',
  },

  statRowLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.35rem',
    color: '#91a0bc',
  },

  engagementRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
    marginTop: '.6rem',
  },

  engagementRowSpan: {
    display: 'grid',
    gap: '.2rem',
    color: '#91a0bc',
    fontSize: '.6rem',
    textAlign: 'center',
  },

  engagementRowStrong: {
    color: '#fff',
    fontSize: '.8rem',
  },

  audienceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.25rem 1rem',
  },

  foundationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
    marginTop: '.7rem',
    paddingTop: '.65rem',
    borderTop: '1px solid rgba(255,255,255,.07)',
  },

  foundationGridSpan: {
    display: 'grid',
    gap: '.15rem',
    color: '#aab6cf',
    fontSize: '.58rem',
  },

  foundationGridSmall: {
    color: '#687691',
    fontSize: '.52rem',
  },

  insightList: {
    display: 'grid',
    gap: '.4rem',
  },

  insight: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.6rem',
    border: '1px solid rgba(124,92,255,.16)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.63rem',
  },

  sparkleIcon: {
    width: '1.75rem',
    height: '1.75rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  exportCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.6rem',
    padding: '.8rem',
    border: '1px solid rgba(77,215,255,.18)',
    borderRadius: '1rem',
    background: 'rgba(77,215,255,.06)',
  },

  exportCardDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  exportCardSpan: {
    color: '#91a0bc',
    fontSize: '.6rem',
  },

  exportButton: {
    minHeight: '2.35rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .6rem',
    border: '1px solid rgba(77,215,255,.25)',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  muted: {
    color: '#91a0bc',
    fontSize: '.64rem',
  },
};