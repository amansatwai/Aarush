import {
  useMemo,
  useState,
} from 'react';
import {
  Activity,
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  Hash,
  Image as ImageIcon,
  MessageCircle,
  Music,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';

const WINDOWS = [
  ['today', 'Today', '8:15 PM', 88],
  ['tomorrow', 'Tomorrow', '7:45 PM', 82],
  ['week', 'This Week', 'Friday · 8:00 PM', 91],
  ['weekend', 'Weekend', 'Saturday · 7:30 PM', 86],
  ['night', 'Night Window', '8–10 PM', 90],
  ['morning', 'Morning Window', '7–9 AM', 68],
];

const STORY_TYPES = [
  ['Photo Story', ImageIcon, 62],
  ['Video Story', Video, 78],
  ['Multi-story Sequence', Activity, 84],
  ['Cinematic Story', Sparkles, 89],
  ['AI-generated Story', Zap, 86],
  ['Interactive Story', MessageCircle, 81],
  ['Sponsored Story', Target, 72],
];

function number(value) {
  return Number(value) || 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(number(value));
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

function MiniChart({
  data = [],
  color = '#4dd7ff',
  height = 150,
}) {
  const values = Array.isArray(data) ? data : [];
  const maximum = Math.max(
    1,
    ...values.map((item) => number(item?.value))
  );

  const path = values
    .map((item, index) => {
      const x =
        values.length <= 1
          ? 50
          : (index / (values.length - 1)) * 100;
      const y =
        94 - (number(item?.value) / maximum) * 78;

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div style={{ ...styles.chart, height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={styles.chartSvg}
        role="img"
        aria-label="Prediction chart"
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

      {!values.length ? (
        <span style={styles.noChartData}>
          Forecast data foundation ready.
        </span>
      ) : null}
    </div>
  );
}

export default function StoryTrendPredictionEngine({
  creator = {},
  stories = [],
  analytics = {},
  audience = {},
  schedule = [],
  trendingData = {},
  competitorSignals = {},
  onApplyRecommendation,
  onScheduleRecommended,
  onClose,
}) {
  const [activeSection, setActiveSection] =
    useState('viral');
  const [selectedWindow, setSelectedWindow] =
    useState('today');
  const [storyLength, setStoryLength] =
    useState(12);
  const [captionLength, setCaptionLength] =
    useState('short');
  const [musicStyle, setMusicStyle] =
    useState('cinematic');
  const [filterStyle, setFilterStyle] =
    useState('cinematic');
  const [audienceType, setAudienceType] =
    useState('followers');
  const [storyType, setStoryType] =
    useState('video');
  const [notice, setNotice] = useState('');

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const simulationBoost = useMemo(() => {
    let boost = 0;

    if (storyLength <= 12) boost += 7;
    if (captionLength === 'short') boost += 4;
    if (musicStyle === 'cinematic') boost += 5;
    if (filterStyle === 'cinematic') boost += 5;
    if (audienceType === 'close_friends') boost += 3;
    if (storyType === 'cinematic') boost += 7;

    return boost;
  }, [
    audienceType,
    captionLength,
    filterStyle,
    musicStyle,
    storyLength,
    storyType,
  ]);

  const prediction = useMemo(() => {
    const baseScore =
      number(analytics.viralScore) ||
      number(trendingData.viralScore) ||
      72;

    const viralScore = Math.round(
      clamp(baseScore + simulationBoost, 0, 100)
    );

    const currentViews =
      number(analytics.storyViews) ||
      number(analytics.views) ||
      number(creator.storyViews) ||
      1000;

    const forecastViews = Math.round(
      currentViews * (1 + viralScore / 120)
    );

    const forecastReach = Math.round(
      forecastViews * 0.82
    );

    const forecastEngagement = clamp(
      number(
        analytics.engagementRate ||
          creator.engagementRate
      ) +
        simulationBoost * 0.35,
      0,
      100
    );

    return {
      viralScore,
      trendScore: Math.round(
        number(trendingData.trendScore) || 78
      ),
      forecastViews,
      forecastReach,
      forecastEngagement,
      completionRate: clamp(
        number(analytics.completionRate) +
          simulationBoost * 0.3,
        0,
        100
      ),
      replies: Math.round(
        forecastViews * 0.012
      ),
      shares: Math.round(
        forecastViews * 0.018
      ),
      followerGain: Math.round(
        forecastViews * 0.006
      ),
      confidence: clamp(
        0.68 + simulationBoost / 100,
        0,
        0.98
      ),
    };
  }, [
    analytics,
    creator,
    simulationBoost,
    trendingData,
  ]);

  const forecastData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        label: `${index + 1}h`,
        value: Math.round(
          prediction.forecastViews *
            (0.28 + index * 0.065)
        ),
      })),
    [prediction.forecastViews]
  );

  const opportunitySignals = [
    ['Travel content rising', 88, TrendingUp],
    ['Night cinematics increasing', 84, Sparkles],
    ['Minimal captions trending', 79, Hash],
    ['Documentary style growing', 76, Video],
    ['Interactive polls underused', 72, MessageCircle],
    ['AI-generated stories emerging', 81, Zap],
  ];

  const recommendations = [
    'Post at 8:15 PM tonight.',
    'Use a cinematic filter.',
    'Add music with a slower tempo.',
    'Keep the story under 12 seconds.',
    'Add a poll sticker.',
    'Use a location sticker.',
    'Publish before Friday evening.',
  ];

  const sections = [
    ['viral', 'Viral Score', Zap],
    ['radar', 'Trend Radar', TrendingUp],
    ['posting', 'Best Posting Time', CalendarClock],
    ['opportunity', 'Opportunity Map', Target],
    ['competitors', 'Competitor Signals', Users],
    ['audience', 'Audience Prediction', BarChart3],
    ['forecast', 'Content Forecast', Activity],
    ['recommendations', 'AI Recommendations', Sparkles],
  ];

  const applyRecommendation = (recommendation) => {
    onApplyRecommendation?.({
      recommendation,
      prediction,
      selectedWindow,
      storyLength,
      musicStyle,
      filterStyle,
      audienceType,
      storyType,
    });

    showNotice('Recommendation applied.');
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close trend prediction engine"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Trend Prediction Engine</strong>
          <span>Publish before the moment peaks</span>
        </div>

        <button
          type="button"
          aria-label="Trend intelligence status"
          style={styles.primaryIconButton}
        >
          <Sparkles size={17} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Zap size={14} />
            {notice}
          </div>
        ) : null}

        <section style={styles.scoreCard}>
          <div>
            <span style={styles.aiBadge}>
              <Sparkles size={12} />
              Forecast foundation
            </span>
            <h1>{prediction.viralScore} / 100</h1>
            <strong style={styles.scoreStatus}>
              {prediction.viralScore >= 85
                ? 'High Viral Potential'
                : prediction.viralScore >= 70
                  ? 'Strong Growth'
                  : 'Moderate Opportunity'}
            </strong>
            <p>
              Score based on trend velocity, audience activity,
              story format, timing, and creator performance.
            </p>
          </div>

          <ScoreRing score={prediction.viralScore} />
        </section>

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

        {activeSection === 'viral' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Viral Score"
              subtitle="Performance probability foundation."
              icon={Zap}
            />

            <div style={styles.metricGrid}>
              <MetricCard
                label="Trend score"
                value={`${prediction.trendScore}/100`}
                icon={TrendingUp}
                color="#4dd7ff"
              />
              <MetricCard
                label="Confidence"
                value={`${Math.round(
                  prediction.confidence * 100
                )}%`}
                icon={Sparkles}
                color="#a895ff"
              />
              <MetricCard
                label="Forecast views"
                value={formatNumber(
                  prediction.forecastViews
                )}
                icon={BarChart3}
                color="#82e9c1"
              />
              <MetricCard
                label="Follower gain"
                value={`+${formatNumber(
                  prediction.followerGain
                )}`}
                icon={Users}
                color="#ffd27d"
              />
            </div>

            <MiniChart
              data={forecastData}
              color="#7c5cff"
            />
          </section>
        ) : null}

        {activeSection === 'radar' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Trend Radar"
              subtitle="Emerging signals for your niche."
              icon={TrendingUp}
            />

            <div style={styles.radarGrid}>
              {[
                ['Trending audio', trendingData.audio || 'Cinematic electronic', Music],
                ['Trending hashtags', trendingData.hashtags || '#nightvibes #creatorlife', Hash],
                ['Story formats', trendingData.formats || 'Short cinematic', Video],
                ['Visual styles', trendingData.visualStyles || 'Warm film', Sparkles],
                ['Sticker usage', trendingData.stickers || 'Polls and questions', MessageCircle],
                ['Text styles', trendingData.textStyles || 'Minimal captions', TypeIcon],
              ].map(([label, value, Icon]) => (
                <div
                  key={label}
                  style={styles.radarCard}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>
                    <TrendingUp size={11} />
                    Rising
                  </small>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'posting' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Best Posting Time"
              subtitle="Predicted audience activity windows."
              icon={CalendarClock}
            />

            <div style={styles.windowList}>
              {WINDOWS.map(([id, label, time, confidence]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setSelectedWindow(id)}
                  aria-pressed={selectedWindow === id}
                  style={{
                    ...styles.windowRow,
                    ...(selectedWindow === id
                      ? styles.activeWindow
                      : {}),
                  }}
                >
                  <CalendarClock size={16} />
                  <span>
                    <strong>{label}</strong>
                    <small>{time}</small>
                  </span>
                  <b>{confidence}%</b>
                  {selectedWindow === id ? (
                    <Check size={15} />
                  ) : null}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                onScheduleRecommended?.({
                  window: selectedWindow,
                  prediction,
                })
              }
              style={styles.primaryButton}
            >
              <CalendarClock size={16} />
              Schedule recommended time
            </button>
          </section>
        ) : null}

        {activeSection === 'opportunity' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Opportunity Map"
              subtitle="Underused content opportunities."
              icon={Target}
            />

            <div style={styles.opportunityList}>
              {opportunitySignals.map(
                ([label, score, Icon]) => (
                  <div
                    key={label}
                    style={styles.opportunityRow}
                  >
                    <span style={styles.opportunityIcon}>
                      <Icon size={15} />
                    </span>
                    <span>{label}</span>
                    <div style={styles.matchTrack}>
                      <span
                        style={{
                          ...styles.matchFill,
                          width: `${score}%`,
                        }}
                      />
                    </div>
                    <strong>{score}</strong>
                  </div>
                )
              )}
            </div>
          </section>
        ) : null}

        {activeSection === 'competitors' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Competitor Signals"
              subtitle="Intelligence foundation without live scraping."
              icon={Users}
            />

            <MetricRow
              label="Top-performing format"
              value={
                competitorSignals.topFormat ||
                'Short cinematic video'
              }
            />
            <MetricRow
              label="Posting frequency"
              value={
                competitorSignals.postingFrequency ||
                'Foundation'
              }
            />
            <MetricRow
              label="Engagement trend"
              value={
                competitorSignals.engagementTrend ||
                'Rising'
              }
            />
            <MetricRow
              label="Audience overlap"
              value={`${number(
                competitorSignals.audienceOverlap
              )}%`}
            />
            <MetricRow
              label="Growth velocity"
              value={
                competitorSignals.growthVelocity ||
                'Moderate'
              }
            />
          </section>
        ) : null}

        {activeSection === 'audience' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Audience Prediction"
              subtitle="Expected outcomes for the current simulation."
              icon={Users}
            />

            <div style={styles.metricGrid}>
              <MetricCard
                label="Expected views"
                value={formatNumber(
                  prediction.forecastViews
                )}
                icon={EyeIcon}
                color="#4dd7ff"
              />
              <MetricCard
                label="Expected reach"
                value={formatNumber(
                  prediction.forecastReach
                )}
                icon={Users}
                color="#7c5cff"
              />
              <MetricCard
                label="Completion"
                value={`${Math.round(
                  prediction.completionRate
                )}%`}
                icon={Check}
                color="#82e9c1"
              />
              <MetricCard
                label="Expected replies"
                value={formatNumber(
                  prediction.replies
                )}
                icon={MessageCircle}
                color="#ff9f72"
              />
              <MetricCard
                label="Expected shares"
                value={formatNumber(
                  prediction.shares
                )}
                icon={ShareIcon}
                color="#ff4fd8"
              />
              <MetricCard
                label="Follower gain"
                value={`+${formatNumber(
                  prediction.followerGain
                )}`}
                icon={Users}
                color="#ffd27d"
              />
            </div>
          </section>
        ) : null}

        {activeSection === 'forecast' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Content Forecast"
              subtitle="Compare formats before publishing."
              icon={BarChart3}
            />

            <div style={styles.forecastList}>
              {STORY_TYPES.map(([label, Icon, base]) => {
                const value = clamp(
                  base + simulationBoost(
                    storyLength,
                    musicStyle,
                    filterStyle,
                    storyType
                  ),
                  0,
                  100
                );

                return (
                  <div
                    key={label}
                    style={styles.forecastRow}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                    <div style={styles.matchTrack}>
                      <span
                        style={{
                          ...styles.matchFill,
                          width: `${value}%`,
                        }}
                      />
                    </div>
                    <strong>{value}</strong>
                  </div>
                );
              })}
            </div>

            <div style={styles.simulator}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2>Scenario Simulation</h2>
                  <span>Adjust inputs for a live forecast.</span>
                </div>
              </div>

              <label style={styles.field}>
                Story length
                <input
                  type="range"
                  min="3"
                  max="60"
                  value={storyLength}
                  onChange={(event) =>
                    setStoryLength(
                      Number(event.target.value)
                    )
                  }
                />
                <output>{storyLength}s</output>
              </label>

              <label style={styles.field}>
                Music style
                <select
                  value={musicStyle}
                  onChange={(event) =>
                    setMusicStyle(event.target.value)
                  }
                  style={styles.select}
                >
                  <option value="cinematic">Cinematic</option>
                  <option value="slow">Slow tempo</option>
                  <option value="electronic">Electronic</option>
                  <option value="lofi">Lo-Fi</option>
                </select>
              </label>

              <label style={styles.field}>
                Filter style
                <select
                  value={filterStyle}
                  onChange={(event) =>
                    setFilterStyle(event.target.value)
                  }
                  style={styles.select}
                >
                  <option value="cinematic">Cinematic</option>
                  <option value="moody">Moody</option>
                  <option value="neon">Neon</option>
                  <option value="sunset">Sunset</option>
                  <option value="documentary">Documentary</option>
                </select>
              </label>

              <label style={styles.field}>
                Audience
                <select
                  value={audienceType}
                  onChange={(event) =>
                    setAudienceType(event.target.value)
                  }
                  style={styles.select}
                >
                  <option value="followers">Followers</option>
                  <option value="public">Public</option>
                  <option value="close_friends">
                    Close Friends
                  </option>
                  <option value="new">New audience</option>
                </select>
              </label>
            </div>
          </section>
        ) : null}

        {activeSection === 'recommendations' ? (
          <section style={styles.section}>
            <SectionTitle
              title="AI Recommendations"
              subtitle="Actionable ways to improve the next story."
              icon={Sparkles}
            />

            <div style={styles.recommendationList}>
              {[
                'Post at 8:15 PM tonight.',
                'Use a cinematic filter.',
                'Add music with a slower tempo.',
                'Keep the story under 12 seconds.',
                'Add a poll sticker.',
                'Use a location sticker.',
                'Publish before Friday evening.',
              ].map((recommendation) => (
                <button
                  type="button"
                  key={recommendation}
                  onClick={() => {
                    onApplyRecommendation?.({
                      recommendation,
                      prediction,
                    });
                    showNotice('Recommendation applied.');
                  }}
                  style={styles.recommendation}
                >
                  <Sparkles size={15} />
                  <span>{recommendation}</span>
                  <ChevronRight
                    size={14}
                    style={{ marginLeft: 'auto' }}
                  />
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <style>{`
        @keyframes aarush-trend-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-trend-pulse {
          0%, 100% {
            transform: scale(.95);
            opacity: .5;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        .aarush-trend-tab:hover,
        .aarush-trend-opportunity:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 600px) {
          .aarush-trend-tabs {
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-trend-metrics {
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

function simulationBoost(
  length,
  music,
  filter,
  type
) {
  let score = 0;

  if (length <= 12) score += 7;
  if (music === 'cinematic' || music === 'slow') {
    score += 4;
  }
  if (filter === 'cinematic' || filter === 'sunset') {
    score += 4;
  }
  if (type === 'cinematic') score += 5;

  return score;
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

function MetricRow({ label, value }) {
  return (
    <div style={styles.metricRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ScoreRing({ score }) {
  const circumference = 2 * Math.PI * 45;
  const offset =
    circumference - (score / 100) * circumference;

  return (
    <div style={styles.scoreWrap}>
      <svg
        viewBox="0 0 110 110"
        style={styles.scoreSvg}
        role="img"
        aria-label={`Viral score ${score} out of 100`}
      >
        <circle
          cx="55"
          cy="55"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,.1)"
          strokeWidth="8"
        />
        <circle
          cx="55"
          cy="55"
          r="45"
          fill="none"
          stroke="#4dd7ff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
        />
      </svg>
      <div style={styles.scoreText}>
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
    </div>
  );
}

function MiniChart({ data, color }) {
  const points = Array.isArray(data) ? data : [];
  const maximum = Math.max(
    1,
    ...points.map((point) => Number(point.value) || 0)
  );

  const path = points
    .map((point, index) => {
      const x =
        points.length <= 1
          ? 50
          : (index / (points.length - 1)) * 100;
      const y =
        94 -
        ((Number(point.value) || 0) / maximum) * 78;

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
        aria-label="Trend forecast chart"
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
    </div>
  );
}

function EyeIcon(props) {
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
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ShareIcon(props) {
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
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4" />
      <path d="m15.4 6.5-6.8 4" />
    </svg>
  );
}

function TypeIcon() {
  return (
    <span style={styles.customIcon}>
      <MessageCircle size={16} />
    </span>
  );
}

function AlertIcon() {
  return (
    <span style={styles.alertIcon}>
      <AlertTriangle />
    </span>
  );
}

function AlertTriangle() {
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
      <path d="m21.7 18-8.4-14a1.5 1.5 0 0 0-2.6 0L2.3 18a1.5 1.5 0 0 0 1.3 2.2h16.8a1.5 1.5 0 0 0 1.3-2.2Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

const WINDOWS = [
  ['today', 'Today', '8:15 PM', 88],
  ['tomorrow', 'Tomorrow', '7:45 PM', 82],
  ['week', 'This Week', 'Friday · 8:00 PM', 91],
  ['weekend', 'Weekend', 'Saturday · 7:30 PM', 86],
  ['night', 'Night Window', '8–10 PM', 90],
  ['morning', 'Morning Window', '7–9 AM', 68],
];

const STORY_TYPES = [
  ['Photo Story', ImageIcon, 62],
  ['Video Story', VideoIcon, 78],
  ['Multi-story Sequence', ActivityIcon, 84],
  ['Cinematic Story', Sparkles, 89],
  ['AI-generated Story', Zap, 86],
  ['Interactive Story', MessageCircle, 81],
  ['Sponsored Story', Target, 72],
];

function VideoIcon(props) {
  return <FilmIconSvg {...props} />;
}

function FilmIconSvg({ size = 17 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m8 3 4 4-4 4" />
      <path d="m16 14-4 4 4 4" />
    </svg>
  );
}

function ActivityIcon(props) {
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
      <path d="M3 12h4l2-8 4 16 2-8h6" />
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

  scoreCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.8rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.17),rgba(77,215,255,.06))',
    boxShadow: '0 20px 60px rgba(0,0,0,.25)',
  },

  scoreCardH1: {
    margin: '.5rem 0 .2rem',
    fontSize: '1.35rem',
  },

  scoreStatus: {
    color: '#82e9c1',
    fontSize: '.78rem',
  },

  scoreCardP: {
    maxWidth: '27rem',
    margin: '.45rem 0 0',
    color: '#91a0bc',
    fontSize: '.65rem',
    lineHeight: 1.45,
  },

  aiBadge: {
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

  scoreWrap: {
    position: 'relative',
    width: '7rem',
    height: '7rem',
    flexShrink: 0,
  },

  scoreSvg: {
    width: '100%',
    height: '100%',
  },

  scoreText: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    color: '#fff',
  },

  scoreTextStrong: {
    fontSize: '1.55rem',
  },

  scoreTextSpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  tabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
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
    animation: 'aarush-trend-in 240ms ease both',
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

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
  },

  metricCard: {
    minHeight: '6.5rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    background: 'rgba(255,255,255,.035)',
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
    fontSize: '.58rem',
  },

  metricValue: {
    color: '#fff',
    fontSize: '.8rem',
  },

  radarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.45rem',
  },

  radarCard: {
    display: 'grid',
    gap: '.22rem',
    padding: '.65rem',
    border: '1px solid rgba(77,215,255,.15)',
    borderRadius: '.75rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.05)',
    fontSize: '.58rem',
  },

  radarCardSpan: {
    color: '#91a0bc',
  },

  radarCardStrong: {
    color: '#fff',
    fontSize: '.66rem',
  },

  radarCardSmall: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    color: '#82e9c1',
    fontSize: '.54rem',
  },

  windowList: {
    display: 'grid',
    gap: '.4rem',
  },

  windowRow: {
    minHeight: '2.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeWindow: {
    borderColor: 'rgba(124,92,255,.48)',
    color: '#fff',
    background: 'rgba(124,92,255,.15)',
  },

  windowRowSpan: {
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  windowRowSmall: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  windowRowB: {
    color: '#82e9c1',
    fontSize: '.66rem',
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

  opportunityList: {
    display: 'grid',
    gap: '.45rem',
  },

  opportunityRow: {
    display: 'grid',
    gridTemplateColumns: '2rem 8rem 1fr 2rem',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.3rem',
    color: '#cbd6ec',
    fontSize: '.61rem',
  },

  opportunityIcon: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.55rem',
    color: '#4dd7ff',
    background: 'rgba(77,215,255,.1)',
  },

  matchTrack: {
    position: 'relative',
    height: '.3rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.1)',
  },

  matchFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  opportunityRowStrong: {
    color: '#9deeff',
    textAlign: 'right',
  },

  metricRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    minHeight: '2.35rem',
    padding: '0 .55rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  metricRowStrong: {
    color: '#dce5f8',
    textAlign: 'right',
  },

  forecastList: {
    display: 'grid',
    gap: '.45rem',
  },

  forecastRow: {
    display: 'grid',
    gridTemplateColumns: '9rem 1fr 2rem',
    alignItems: 'center',
    gap: '.5rem',
    minHeight: '2.35rem',
    color: '#cbd6ec',
    fontSize: '.62rem',
  },

  simulator: {
    display: 'grid',
    gap: '.55rem',
    marginTop: '.8rem',
    paddingTop: '.75rem',
    borderTop: '1px solid rgba(255,255,255,.07)',
  },

  field: {
    display: 'grid',
    gridTemplateColumns: '8rem 1fr auto',
    alignItems: 'center',
    gap: '.5rem',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  fieldInput: {
    width: '100%',
    accentColor: '#7c5cff',
  },

  fieldOutput: {
    color: '#9deeff',
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

  recommendationList: {
    display: 'grid',
    gap: '.4rem',
  },

  recommendation: {
    minHeight: '2.55rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .65rem',
    border: '1px solid rgba(124,92,255,.15)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.63rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  chart: {
    position: 'relative',
    height: '150px',
    overflow: 'hidden',
    marginTop: '.7rem',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.02)',
  },

  chartSvg: {
    width: '100%',
    height: '100%',
    display: 'block',
  },

  customIcon: {
    display: 'grid',
    placeItems: 'center',
  },

  alertIcon: {
    color: '#ffd27d',
  },
};