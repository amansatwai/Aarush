import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Globe2,
  Image as ImageIcon,
  MessageCircle,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['score', 'Predictive Score', Sparkles],
  ['viral', 'Viral Forecast', Zap],
  ['audience', 'Audience Simulation', Users],
  ['growth', 'Growth Forecast', TrendingUp],
  ['revenue', 'Revenue Forecast', CircleDollarSign],
  ['strategy', 'Content Strategy', CalendarClock],
  ['opportunities', 'Opportunities', Target],
  ['actions', 'AI Action Plan', Check],
];

const HORIZONS = [
  ['7 days', 7],
  ['30 days', 30],
  ['90 days', 90],
  ['6 months', 180],
  ['1 year', 365],
];

const ACTIONS = [
  [
    'Immediate',
    'Publish a cinematic story in the next evening window.',
    92,
    28,
    8,
    14,
  ],
  [
    'This Week',
    'Increase interactive stickers in your strongest content niche.',
    84,
    42,
    13,
    9,
  ],
  [
    'This Month',
    'Build a repeatable travel content series.',
    78,
    56,
    21,
    17,
  ],
  [
    'Long-Term',
    'Develop a subscription offer around your best audience segment.',
    88,
    76,
    38,
    31,
  ],
];

const STRATEGIES = [
  'Publish 3 cinematic stories per week.',
  'Increase travel content frequency.',
  'Reduce story length by 20%.',
  'Add subtitles to all videos.',
  'Use evening publishing windows.',
  'Increase interactive sticker usage.',
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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

function LineChart({ data, color = '#4dd7ff' }) {
  const values = Array.isArray(data) ? data : [];
  const max = Math.max(1, ...values.map(numeric));

  const path = values
    .map((value, index) => {
      const x =
        values.length <= 1
          ? 50
          : (index / (values.length - 1)) * 100;
      const y = 92 - (numeric(value) / max) * 76;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div style={styles.chart}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        role="img"
        aria-label="Predictive forecast chart"
        style={styles.chartSvg}
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

export default function StoryPredictiveIntelligenceHub({
  creator = {},
  stories = [],
  analytics = {},
  audience = {},
  earnings = {},
  campaigns = [],
  trends = {},
  goals = {},
  onApplyStrategy,
  onGenerateForecast,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('score');
  const [horizon, setHorizon] = useState('30 days');
  const [postingFrequency, setPostingFrequency] =
    useState(3);
  const [storyDuration, setStoryDuration] =
    useState(12);
  const [aiContent, setAiContent] = useState(40);
  const [collaborationFrequency, setCollaborationFrequency] =
    useState(2);
  const [brandCampaigns, setBrandCampaigns] =
    useState(2);
  const [audienceTarget, setAudienceTarget] =
    useState('Followers');
  const [notice, setNotice] = useState('');

  const simulationBoost = useMemo(() => {
    let boost = 0;

    if (postingFrequency >= 3) boost += 5;
    if (storyDuration <= 15) boost += 5;
    if (aiContent >= 40) boost += 3;
    if (collaborationFrequency >= 2) boost += 4;
    if (brandCampaigns >= 2) boost += 3;
    if (audienceTarget === 'New regions') boost += 3;

    return boost;
  }, [
    audienceTarget,
    brandCampaigns,
    collaborationFrequency,
    aiContent,
    postingFrequency,
    storyDuration,
  ]);

  const forecast = useMemo(() => {
    const baseScore =
      numeric(analytics.predictiveScore) ||
      numeric(analytics.viralScore) ||
      82;

    const predictiveScore = Math.round(
      clamp(baseScore + simulationBoost, 0, 100)
    );

    const currentFollowers =
      numeric(audience.followers) ||
      numeric(creator.followers) ||
      10000;

    const currentViews =
      numeric(analytics.storyViews) ||
      numeric(analytics.views) ||
      5000;

    const currentRevenue =
      numeric(earnings.monthlyRevenue) ||
      numeric(earnings.total) ||
      25000;

    const growthMultiplier =
      1 + (predictiveScore / 100) * (horizon === '1 year' ? 2.4 : 0.9);

    return {
      predictiveScore,
      confidence: clamp(
        numeric(analytics.confidence) ||
          72 + simulationBoost * 0.8,
        0,
        98
      ),
      viralProbability: clamp(
        numeric(trends.viralProbability) ||
          61 + simulationBoost,
        0,
        99
      ),
      weeklyViral: clamp(
        42 + simulationBoost * 0.8,
        0,
        99
      ),
      monthlyViral: clamp(
        68 + simulationBoost * 0.6,
        0,
        99
      ),
      projectedFollowers: Math.round(
        currentFollowers * growthMultiplier
      ),
      projectedViews: Math.round(
        currentViews * growthMultiplier
      ),
      projectedRevenue: Math.round(
        currentRevenue * growthMultiplier
      ),
      completionRate: clamp(
        numeric(analytics.completionRate) +
          simulationBoost * 0.25,
        0,
        100
      ),
      engagement: clamp(
        numeric(analytics.engagementRate) ||
          7 + simulationBoost * 0.25,
        0,
        100
      ),
      retention: clamp(
        numeric(analytics.retention) ||
          62 + simulationBoost * 0.3,
        0,
        100
      ),
    };
  }, [
    analytics,
    audience,
    creator,
    earnings,
    horizon,
    simulationBoost,
    trends,
  ]);

  const growthData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) =>
        Math.round(
          forecast.projectedFollowers *
            (0.42 + index * 0.055)
        )
      ),
    [forecast.projectedFollowers]
  );

  const revenueData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) =>
        Math.round(
          forecast.projectedRevenue *
            (0.3 + index * 0.06)
        )
      ),
    [forecast.projectedRevenue]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const generateForecast = async () => {
    await onGenerateForecast?.({
      creator,
      horizon,
      predictiveScore: forecast.predictiveScore,
      viralProbability: forecast.viralProbability,
      growthForecast: forecast.projectedFollowers,
      revenueForecast: forecast.projectedRevenue,
      audienceSimulation: {
        projectedViews: forecast.projectedViews,
        completionRate: forecast.completionRate,
        engagement: forecast.engagement,
      },
      confidence: forecast.confidence,
    });

    showNotice('Forecast generated.');
  };

  const applyStrategy = (strategy) => {
    onApplyStrategy?.({
      strategy,
      forecast,
      horizon,
      simulation: {
        postingFrequency,
        storyDuration,
        aiContent,
        collaborationFrequency,
        brandCampaigns,
        audienceTarget,
      },
    });

    showNotice('Strategy applied.');
  };

  const renderScore = () => (
    <>
      <section style={styles.scoreHero}>
        <div>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Predictive intelligence
          </span>
          <h1>{forecast.predictiveScore} / 100</h1>
          <strong style={styles.scoreStatus}>
            {forecast.predictiveScore >= 90
              ? 'Exceptional Growth Potential'
              : forecast.predictiveScore >= 75
                ? 'Strong Growth'
                : forecast.predictiveScore >= 55
                  ? 'Stable'
                  : 'Declining'}
          </strong>
          <p>
            Forecast confidence is {Math.round(
              forecast.confidence
            )}%, based on content history, audience behavior,
            trend timing, and current creator signals.
          </p>
        </div>

        <ScoreRing score={forecast.predictiveScore} />
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Confidence"
          value={`${Math.round(forecast.confidence)}%`}
          icon={Sparkles}
          color="#a895ff"
        />
        <MetricCard
          label="Viral probability"
          value={`${Math.round(
            forecast.viralProbability
          )}%`}
          icon={Zap}
          color="#4dd7ff"
        />
        <MetricCard
          label="Projected followers"
          value={formatCompact(forecast.projectedFollowers)}
          icon={Users}
          color="#82e9c1"
        />
        <MetricCard
          label="Projected revenue"
          value={money(forecast.projectedRevenue)}
          icon={CircleDollarSign}
          color="#ffd27d"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Growth Curve"
          subtitle="Projected audience expansion across the selected horizon."
          icon={TrendingUp}
        />
        <LineChart data={growthData} color="#7c5cff" />
      </section>
    </>
  );

  const renderViral = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Viral Forecast"
        subtitle="Probability ranges for upcoming content."
        icon={Zap}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Next story"
          value={`${Math.round(
            forecast.viralProbability
          )}%`}
          icon={Play}
          color="#4dd7ff"
        />
        <MetricCard
          label="Weekly chance"
          value={`${Math.round(
            forecast.weeklyViral
          )}%`}
          icon={CalendarClock}
          color="#a895ff"
        />
        <MetricCard
          label="Monthly chance"
          value={`${Math.round(
            forecast.monthlyViral
          )}%`}
          icon={BarChart3}
          color="#ff4fd8"
        />
        <MetricCard
          label="Confidence range"
          value={`±${Math.max(
            4,
            Math.round(12 - simulationBoost / 3)
          )}%`}
          icon={Target}
          color="#82e9c1"
        />
      </div>

      <div style={styles.forecastNotice}>
        <TrendingUp size={16} />
        Best upcoming content type:{' '}
        <strong>
          {trends.bestContentType || 'Cinematic video story'}
        </strong>
      </div>

      <LineChart
        data={[
          38,
          44,
          48,
          55,
          61,
          58,
          69,
          73,
          78,
          81,
          86,
          forecast.viralProbability,
        ]}
        color="#4dd7ff"
      />
    </section>
  );

  const renderAudience = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Audience Simulation"
        subtitle="Predicted behavior under the current scenario."
        icon={Users}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Views"
          value={formatCompact(forecast.projectedViews)}
          icon={ImageIcon}
          color="#4dd7ff"
        />
        <MetricCard
          label="Reach"
          value={formatCompact(
            Math.round(forecast.projectedViews * 0.82)
          )}
          icon={Globe2}
          color="#a895ff"
        />
        <MetricCard
          label="Completion"
          value={`${Math.round(
            forecast.completionRate
          )}%`}
          icon={Check}
          color="#82e9c1"
        />
        <MetricCard
          label="Replies"
          value={formatCompact(
            Math.round(forecast.projectedViews * 0.011)
          )}
          icon={MessageCircle}
          color="#ff9f72"
        />
        <MetricCard
          label="Shares"
          value={formatCompact(
            Math.round(forecast.projectedViews * 0.017)
          )}
          icon={Zap}
          color="#ff4fd8"
        />
        <MetricCard
          label="Saves"
          value={formatCompact(
            Math.round(forecast.projectedViews * 0.009)
          )}
          icon={Target}
          color="#ffd27d"
        />
        <MetricCard
          label="Follower growth"
          value={`+${formatCompact(
            Math.round(forecast.projectedFollowers * 0.08)
          )}`}
          icon={Users}
          color="#9deeff"
        />
        <MetricCard
          label="Subscriber growth"
          value={`+${formatCompact(
            Math.round(forecast.projectedFollowers * 0.012)
          )}`}
          icon={Sparkles}
          color="#82e9c1"
        />
      </div>

      <div style={styles.scenarioRow}>
        <Scenario
          label="Conservative"
          value={`${Math.max(
            1,
            Math.round(forecast.viralProbability - 18)
          )}% viral chance`}
        />
        <Scenario
          label="Expected"
          value={`${Math.round(
            forecast.viralProbability
          )}% viral chance`}
        />
        <Scenario
          label="Best case"
          value={`${Math.min(
            99,
            Math.round(forecast.viralProbability + 17)
          )}% viral chance`}
        />
      </div>
    </section>
  );

  const renderGrowth = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Growth Forecast"
        subtitle="Projected creator growth over time."
        icon={TrendingUp}
      />

      <div style={styles.horizonTabs}>
        {HORIZONS.map(([label]) => (
          <button
            type="button"
            key={label}
            onClick={() => setHorizon(label)}
            aria-pressed={horizon === label}
            style={{
              ...styles.horizonButton,
              ...(horizon === label
                ? styles.activeHorizonButton
                : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={styles.metricGrid}>
        <MetricCard
          label="Followers"
          value={formatCompact(forecast.projectedFollowers)}
          icon={Users}
          color="#4dd7ff"
        />
        <MetricCard
          label="Story views"
          value={formatCompact(forecast.projectedViews)}
          icon={Video}
          color="#a895ff"
        />
        <MetricCard
          label="Engagement"
          value={`${forecast.engagement.toFixed(1)}%`}
          icon={Activity}
          color="#82e9c1"
        />
        <MetricCard
          label="Retention"
          value={`${Math.round(
            forecast.retention
          )}%`}
          icon={Clock3}
          color="#ffd27d"
        />
      </div>

      <LineChart data={growthData} color="#7c5cff" />
    </section>
  );

  const renderRevenue = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Revenue Forecast"
        subtitle="Projected earnings across creator income streams."
        icon={CircleDollarSign}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Story revenue"
          value={money(
            earnings.storyRevenue ||
              forecast.projectedRevenue * 0.22
          )}
          icon={Video}
          color="#4dd7ff"
        />
        <MetricCard
          label="Brand revenue"
          value={money(
            earnings.brandRevenue ||
              forecast.projectedRevenue * 0.5
          )}
          icon={Target}
          color="#a895ff"
        />
        <MetricCard
          label="Subscriptions"
          value={money(
            earnings.subscriptionRevenue ||
              forecast.projectedRevenue * 0.16
          )}
          icon={Users}
          color="#82e9c1"
        />
        <MetricCard
          label="Affiliate revenue"
          value={money(
            earnings.affiliateRevenue ||
              forecast.projectedRevenue * 0.12
          )}
          icon={BarChart3}
          color="#ffd27d"
        />
      </div>

      <div style={styles.revenueCases}>
        <RevenueCase
          label="Conservative case"
          value={forecast.projectedRevenue * 0.72}
          color="#91a0bc"
        />
        <RevenueCase
          label="Expected case"
          value={forecast.projectedRevenue}
          color="#4dd7ff"
        />
        <RevenueCase
          label="Best case"
          value={forecast.projectedRevenue * 1.42}
          color="#82e9c1"
        />
      </div>

      <LineChart data={revenueData} color="#82e9c1" />
    </section>
  );

  const renderStrategy = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Content Strategy"
        subtitle="AI-generated plans aligned with your forecast."
        icon={CalendarClock}
      />

      <div style={styles.strategyList}>
        {STRATEGIES.map((strategy) => (
          <button
            type="button"
            key={strategy}
            onClick={() => applyStrategy(strategy)}
            style={styles.strategyRow}
          >
            <Sparkles size={15} />
            <span>{strategy}</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>

      <div style={styles.roadmap}>
        <strong>Weekly content roadmap</strong>
        <span>
          3 cinematic stories · 1 interactive story · 1
          collaboration post
        </span>
      </div>
    </section>
  );

  const renderOpportunities = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Opportunity Intelligence"
        subtitle="Signals that may unlock future growth."
        icon={Target}
      />

      <div style={styles.opportunityGrid}>
        {[
          ['Emerging travel trend', 88, TrendingUp],
          ['New creator niche', 79, Sparkles],
          ['Brand category growth', 84, Target],
          ['Audience expansion region', 73, Globe2],
          ['Language opportunity', 69, MessageCircle],
          ['Collaboration opportunity', 82, Users],
          ['Product opportunity', 76, CircleDollarSign],
          ['Seasonal opportunity', 87, CalendarClock],
        ].map(([label, score, Icon]) => (
          <div
            key={label}
            style={styles.opportunityCard}
          >
            <Icon size={16} />
            <span>{label}</span>
            <div style={styles.opportunityTrack}>
              <span
                style={{
                  ...styles.opportunityFill,
                  width: `${score}%`,
                }}
              />
            </div>
            <strong>{score}</strong>
          </div>
        ))}
      </div>
    </section>
  );

  const renderActions = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Action Plan"
        subtitle="Prioritized moves with expected impact."
        icon={Check}
      />

      <div style={styles.actionList}>
        {ACTIONS.map(
          ([
            priority,
            text,
            impact,
            effort,
            growth,
            revenueIncrease,
          ]) => (
            <button
              type="button"
              key={text}
              onClick={() => applyStrategy(text)}
              style={styles.actionRow}
            >
              <span
                style={{
                  ...styles.priorityBadge,
                  color: priorityColor(priority),
                }}
              >
                {priority}
              </span>
              <span style={styles.actionCopy}>
                <strong>{text}</strong>
                <small>
                  Impact {impact} · Effort {effort} · Growth +
                  {growth}% · Revenue +{revenueIncrease}%
                </small>
              </span>
              <ChevronRight size={15} />
            </button>
          )
        )}
      </div>
    </section>
  );

  const renderSimulator = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Scenario Simulator"
        subtitle="Adjust assumptions and update forecasts live."
        icon={Activity}
      />

      <div style={styles.simulatorGrid}>
        <RangeField
          label="Posting frequency"
          value={postingFrequency}
          min={1}
          max={14}
          suffix="/week"
          onChange={setPostingFrequency}
        />
        <RangeField
          label="Story duration"
          value={storyDuration}
          min={3}
          max={60}
          suffix=" sec"
          onChange={setStoryDuration}
        />
        <RangeField
          label="AI-generated content"
          value={aiContent}
          min={0}
          max={100}
          suffix="%"
          onChange={setAiContent}
        />
        <RangeField
          label="Collaboration frequency"
          value={collaborationFrequency}
          min={0}
          max={10}
          suffix="/month"
          onChange={setCollaborationFrequency}
        />
        <RangeField
          label="Brand campaigns"
          value={brandCampaigns}
          min={0}
          max={12}
          suffix="/month"
          onChange={setBrandCampaigns}
        />

        <label style={styles.field}>
          Audience targeting
          <select
            value={audienceTarget}
            onChange={(event) =>
              setAudienceTarget(event.target.value)
            }
            style={styles.select}
          >
            <option>Followers</option>
            <option>New regions</option>
            <option>Subscribers</option>
            <option>Brand audiences</option>
          </select>
        </label>
      </div>

      <div style={styles.liveForecast}>
        <Sparkles size={16} />
        <span>
          Live predictive score:{' '}
          <strong>{forecast.predictiveScore}/100</strong>
        </span>
        <span>
          Viral chance:{' '}
          <strong>
            {Math.round(forecast.viralProbability)}%
          </strong>
        </span>
      </div>

      <button
        type="button"
        onClick={generateForecast}
        style={styles.primaryButton}
      >
        <BarChart3 size={16} />
        Generate forecast
      </button>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'score') {
      return (
        <>
          {renderScore()}
          {renderSimulator()}
        </>
      );
    }
    if (activeModule === 'viral') return renderViral();
    if (activeModule === 'audience') return renderAudience();
    if (activeModule === 'growth') return renderGrowth();
    if (activeModule === 'revenue') return renderRevenue();
    if (activeModule === 'strategy') return renderStrategy();
    if (activeModule === 'opportunities') {
      return renderOpportunities();
    }
    if (activeModule === 'actions') return renderActions();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close predictive intelligence hub"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Predictive Intelligence Hub</strong>
          <span>
            Forecast the next chapter of your creator business
          </span>
        </div>

        <button
          type="button"
          aria-label="Forecast settings"
          style={styles.iconButton}
        >
          <Target size={18} />
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
        @keyframes aarush-predictive-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-predictive-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.2);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.48);
          }
        }

        .aarush-predictive-card:hover,
        .aarush-predictive-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-predictive-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-predictive-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-predictive-opportunities {
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

function ScoreRing({ score }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (score / 100) * circumference;

  return (
    <div style={styles.scoreRing}>
      <svg
        viewBox="0 0 110 110"
        role="img"
        aria-label={`Predictive score ${score} out of 100`}
        style={styles.scoreSvg}
      >
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.1)"
          strokeWidth="8"
        />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="#4dd7ff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
        />
      </svg>
      <div style={styles.scoreRingText}>
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
    </div>
  );
}

function Scenario({ label, value }) {
  return (
    <div style={styles.scenario}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RevenueCase({ label, value, color }) {
  return (
    <div style={styles.revenueCase}>
      <span>{label}</span>
      <strong style={{ color }}>{money(value)}</strong>
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}) {
  return (
    <label style={styles.field}>
      <span style={styles.rangeLabel}>
        {label}
        <output>
          {value}
          {suffix}
        </output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        style={styles.range}
      />
    </label>
  );
}

function priorityColor(priority) {
  if (priority === 'Immediate') return '#ff7c9f';
  if (priority === 'This Week') return '#ffd27d';
  if (priority === 'This Month') return '#4dd7ff';
  return '#a895ff';
}

function formatCompact(value) {
  const numberValue = numeric(value);

  if (numberValue >= 1000000) {
    return `${(numberValue / 1000000).toFixed(1)}M`;
  }

  if (numberValue >= 1000) {
    return `${(numberValue / 1000).toFixed(1)}K`;
  }

  return String(Math.round(numberValue));
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

  scoreHero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-predictive-pulse 3s ease-in-out infinite',
  },

  scoreHeroH1: {
    margin: '.55rem 0 .2rem',
    fontSize: '1.5rem',
  },

  scoreHeroP: {
    maxWidth: '35rem',
    margin: '.5rem 0 0',
    color: '#91a0bc',
    fontSize: '.63rem',
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

  scoreStatus: {
    color: '#82e9c1',
    fontSize: '.78rem',
  },

  scoreRing: {
    position: 'relative',
    width: '7.5rem',
    height: '7.5rem',
    flexShrink: 0,
  },

  scoreSvg: {
    width: '100%',
    height: '100%',
  },

  scoreRingText: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
  },

  scoreRingTextStrong: {
    fontSize: '1.65rem',
  },

  scoreRingTextSpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
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
    animation: 'aarush-predictive-in 240ms ease both',
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
    animation: 'aarush-predictive-in 240ms ease both',
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

  chart: {
    position: 'relative',
    height: '150px',
    overflow: 'hidden',
    marginTop: '.75rem',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.025)',
  },

  chartSvg: {
    width: '100%',
    height: '100%',
    display: 'block',
  },

  forecastNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    marginTop: '.7rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.61rem',
  },

  scenarioRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
    marginTop: '.7rem',
  },

  scenario: {
    display: 'grid',
    gap: '.2rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  scenarioStrong: {
    color: '#fff',
    fontSize: '.64rem',
  },

  horizonTabs: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.4rem',
  },

  horizonButton: {
    minHeight: '2.2rem',
    flexShrink: 0,
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeHorizonButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  revenueCases: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
    marginTop: '.7rem',
  },

  revenueCase: {
    display: 'grid',
    gap: '.2rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  revenueCaseStrong: {
    fontSize: '.68rem',
  },

  strategyList: {
    display: 'grid',
    gap: '.4rem',
  },

  strategyRow: {
    minHeight: '2.65rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .6rem',
    border: '1px solid rgba(124,92,255,.15)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.61rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  roadmap: {
    display: 'grid',
    gap: '.2rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.6rem',
  },

  roadmapSpan: {
    color: '#91a0bc',
  },

  opportunityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.45rem',
  },

  opportunityCard: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.35rem',
    minHeight: '3.2rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.58rem',
  },

  opportunityTrack: {
    gridColumn: '2 / 3',
    height: '.3rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.09)',
  },

  opportunityFill: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  opportunityCardStrong: {
    color: '#9deeff',
    fontSize: '.57rem',
  },

  actionList: {
    display: 'grid',
    gap: '.45rem',
  },

  actionRow: {
    minHeight: '3.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  priorityBadge: {
    minWidth: '4.2rem',
    fontSize: '.55rem',
    fontWeight: 850,
  },

  actionCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  actionCopySmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  simulatorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.65rem',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  rangeLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.4rem',
  },

  rangeLabelOutput: {
    color: '#9deeff',
  },

  range: {
    width: '100%',
    accentColor: '#7c5cff',
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

  liveForecast: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '.5rem',
    marginTop: '.7rem',
    padding: '.7rem',
    border: '1px solid rgba(124,92,255,.2)',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.1),rgba(77,215,255,.05))',
    fontSize: '.6rem',
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
};