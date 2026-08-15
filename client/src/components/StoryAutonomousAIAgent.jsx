import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BarChart3,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  DollarSign,
  Edit3,
  Heart,
  Lightbulb,
  LoaderCircle,
  Megaphone,
  Play,
  RefreshCw,
  Rocket,
  Send,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wand2,
  X,
  Zap,
} from 'lucide-react';

const AUTONOMY_LEVELS = [
  ['manual', 'Manual', 'AI only suggests.'],
  ['assisted', 'Assisted', 'AI prepares drafts.'],
  ['smart', 'Smart', 'AI prepares and schedules.'],
  [
    'autonomous',
    'Autonomous',
    'AI creates, optimizes, schedules, and publishes after rules.',
  ],
];

const DAILY_PLAN = [
  ['Morning', 'Morning motivation story', '7:30 AM'],
  ['Afternoon', 'Behind-the-scenes story', '1:00 PM'],
  ['Evening', 'Engagement story', '7:30 PM'],
  ['Night', 'Night recap story', '10:00 PM'],
];

const GOALS = [
  ['views', 'Increase story views', BarChart3],
  ['engagement', 'Increase engagement', Heart],
  ['subscribers', 'Gain subscribers', Users],
  ['revenue', 'Earn revenue', DollarSign],
  ['brands', 'Grow brand deals', Megaphone],
  ['retention', 'Improve retention', TrendingUp],
  ['audience', 'Reach new audience', Target],
];

function number(value) {
  return Number(value) || 0;
}

function formatDate(value) {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function mediaUrl(item) {
  return (
    item?.thumbnailUrl ||
    item?.thumbnail_url ||
    item?.mediaUrl ||
    item?.media_url ||
    ''
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color = '#4dd7ff',
  detail,
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

      {detail ? (
        <span style={styles.metricDetail}>{detail}</span>
      ) : null}
    </article>
  );
}

function QueueCard({
  draft,
  onEdit,
  onApprove,
  onReject,
  onRegenerate,
  onSchedule,
  onPublish,
}) {
  return (
    <article style={styles.queueCard}>
      <span style={styles.queueThumbnail}>
        {mediaUrl(draft) ? (
          <img
            src={mediaUrl(draft)}
            alt=""
            loading="lazy"
            style={styles.queueImage}
          />
        ) : (
          <Sparkles size={22} />
        )}
      </span>

      <div style={styles.queueCopy}>
        <strong>
          {draft?.caption ||
            draft?.title ||
            'AI-generated story draft'}
        </strong>
        <span>
          {draft?.music || 'Music foundation'} ·{' '}
          {draft?.stickers?.length || 0} stickers
        </span>
        <small>
          Estimated engagement:{' '}
          {draft?.estimatedEngagement || 'High'} ·{' '}
          Confidence:{' '}
          {Math.round(
            number(draft?.aiConfidence) * 100
          ) || 86}
          %
        </small>
      </div>

      <div style={styles.queueActions}>
        <button
          type="button"
          onClick={() => onEdit?.(draft)}
          aria-label="Edit AI draft"
          style={styles.tinyButton}
        >
          <Edit3 size={14} />
        </button>

        <button
          type="button"
          onClick={() => onApprove?.(draft)}
          aria-label="Approve AI draft"
          style={styles.tinyApprove}
        >
          <Check size={14} />
        </button>

        <button
          type="button"
          onClick={() => onReject?.(draft)}
          aria-label="Reject AI draft"
          style={styles.tinyReject}
        >
          <X size={14} />
        </button>

        <button
          type="button"
          onClick={() => onRegenerate?.(draft)}
          aria-label="Regenerate AI draft"
          style={styles.tinyButton}
        >
          <RefreshCw size={14} />
        </button>

        <button
          type="button"
          onClick={() => onSchedule?.(draft)}
          aria-label="Schedule AI draft"
          style={styles.tinyButton}
        >
          <CalendarClock size={14} />
        </button>

        <button
          type="button"
          onClick={() => onPublish?.(draft)}
          aria-label="Publish AI draft"
          style={styles.tinyPublish}
        >
          <Send size={14} />
        </button>
      </div>
    </article>
  );
}

export default function StoryAutonomousAIAgent({
  creator = {},
  stories = [],
  drafts = [],
  analytics = {},
  schedule = [],
  campaigns = [],
  goals = [],
  preferences = {},
  onCreateDraft,
  onScheduleStory,
  onPublishStory,
  onGenerateInsights,
  onClose,
}) {
  const [autonomyLevel, setAutonomyLevel] =
    useState(
      preferences.autonomyLevel || 'assisted'
    );
  const [activeSection, setActiveSection] =
    useState('status');
  const [safePublishing, setSafePublishing] =
    useState(true);
  const [approvalRequired, setApprovalRequired] =
    useState(true);
  const [notice, setNotice] = useState('');
  const [learning, setLearning] = useState(false);
  const [localGoals, setLocalGoals] = useState(
    goals.length
      ? goals
      : GOALS.slice(0, 4).map(([id, title]) => ({
          id,
          title,
          progress: 0,
          target: 100,
        }))
  );

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  }, []);

  const activeTasks = useMemo(
    () =>
      schedule.filter(
        (item) =>
          item.status !== 'completed' &&
          item.status !== 'published'
      ).length,
    [schedule]
  );

  const revenueForecast = useMemo(() => {
    const current =
      number(creator.monthlyEarnings) ||
      number(analytics.monthlyEarnings);

    return {
      monthly: current ? current * 1.18 : 0,
      brandOpportunities: campaigns.length + 2,
      subscriberGrowth:
        number(creator.subscribers) * 0.12,
      affiliatePotential:
        number(analytics.affiliateRevenue) * 1.2,
    };
  }, [analytics, campaigns.length, creator]);

  const runAgentAction = useCallback(
    (action) => {
      if (action === 'generate') {
        onCreateDraft?.({
          source: 'autonomous-agent',
          mode: autonomyLevel,
        });
        showNotice('Today’s story generation started.');
      }

      if (action === 'optimize') {
        onGenerateInsights?.({
          type: 'optimize-all-drafts',
          drafts,
        });
        showNotice('Draft optimization started.');
      }

      if (action === 'schedule') {
        onScheduleStory?.({
          source: 'autonomous-agent',
          schedule,
        });
        showNotice('Weekly scheduling prepared.');
      }

      if (action === 'brands') {
        showNotice('Brand opportunity scan started.');
      }

      if (action === 'engagement') {
        onGenerateInsights?.({
          type: 'engagement-optimization',
          stories,
          analytics,
        });
        showNotice('Engagement analysis started.');
      }

      if (action === 'recap') {
        showNotice('Recap generation prepared.');
      }

      if (action === 'highlight') {
        showNotice('Highlight creation prepared.');
      }

      if (action === 'audience') {
        onGenerateInsights?.({
          type: 'audience-analysis',
          analytics,
        });
        showNotice('Audience analysis started.');
      }
    },
    [
      analytics,
      autonomyLevel,
      drafts,
      onCreateDraft,
      onGenerateInsights,
      onScheduleStory,
      schedule,
      showNotice,
      stories,
    ]
  );

  const runLearningCycle = async () => {
    setLearning(true);

    await new Promise((resolve) =>
      window.setTimeout(resolve, 500)
    );

    setLearning(false);
    showNotice('AI learning cycle completed.');
  };

  const sections = [
    ['status', 'AI Status', Sparkles],
    ['plan', 'Daily Plan', CalendarClock],
    ['queue', 'Story Queue', FileIcon],
    ['trends', 'Trend Radar', TrendingUp],
    ['schedule', 'Publishing', CalendarClock],
    ['insights', 'Insights', Lightbulb],
    ['revenue', 'Revenue Engine', DollarSign],
    ['goals', 'Creator Goals', Target],
    ['actions', 'AI Actions', Zap],
  ];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close autonomous AI agent"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Autonomous AI Creator Agent</strong>
          <span>Your always-on creator manager</span>
        </div>

        <button
          type="button"
          onClick={runLearningCycle}
          aria-label="Run AI learning cycle"
          style={styles.primaryIconButton}
        >
          {learning ? (
            <LoaderCircle
              size={17}
              style={styles.spinner}
            />
          ) : (
            <Sparkles size={17} />
          )}
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <section style={styles.agentCard}>
          <div style={styles.agentOrb}>
            {learning ? (
              <LoaderCircle
                size={30}
                style={styles.spinner}
              />
            ) : (
              <Sparkles size={30} />
            )}
          </div>

          <div style={styles.agentCopy}>
            <span style={styles.onlineBadge}>
              <span style={styles.onlineDot} />
              Online
            </span>
            <h1>
              {autonomyLevel === 'autonomous'
                ? 'Autonomous mode active'
                : 'Creator intelligence ready'}
            </h1>
            <p>
              Last activity:{' '}
              {formatDate(
                preferences.lastLearningCycle
              )}
            </p>
          </div>

          <span style={styles.agentPulse} />
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

        {activeSection === 'status' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Autonomous Mode</h2>
                <span>
                  Choose how much control the AI agent has.
                </span>
              </div>
              <Settings size={18} color="#4dd7ff" />
            </div>

            <div style={styles.modeGrid}>
              {AUTONOMY_LEVELS.map(([id, label, description]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setAutonomyLevel(id)}
                  aria-pressed={autonomyLevel === id}
                  style={{
                    ...styles.modeButton,
                    ...(autonomyLevel === id
                      ? styles.activeMode
                      : {}),
                  }}
                >
                  <strong>{label}</strong>
                  <span>{description}</span>
                </button>
              ))}
            </div>

            <div style={styles.safetyCard}>
              <ShieldIcon />
              <div>
                <strong>Safety controls</strong>
                <span>
                  Autonomous publishing remains gated by
                  your approval settings.
                </span>
              </div>
            </div>

            <label style={styles.settingRow}>
              <span>Require approval before publishing</span>
              <input
                type="checkbox"
                checked={approvalRequired}
                onChange={(event) =>
                  setApprovalRequired(
                    event.target.checked
                  )
                }
              />
            </label>

            <label style={styles.settingRow}>
              <span>Safe publishing mode</span>
              <input
                type="checkbox"
                checked={safePublishing}
                onChange={(event) =>
                  setSafePublishing(
                    event.target.checked
                  )
                }
              />
            </label>

            <div style={styles.metricGrid}>
              <MetricCard
                label="Active tasks"
                value={activeTasks}
                icon={Zap}
                color="#4dd7ff"
              />
              <MetricCard
                label="Queued stories"
                value={drafts.length}
                icon={FileIcon}
                color="#a895ff"
              />
              <MetricCard
                label="Trend signals"
                value={analytics.trendSignals || 0}
                icon={TrendingUp}
                color="#ffd27d"
              />
              <MetricCard
                label="Learning cycle"
                value={learning ? 'Running' : 'Ready'}
                icon={Sparkles}
                color="#82e9c1"
              />
            </div>
          </section>
        ) : null}

        {activeSection === 'plan' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Daily Content Plan"
              subtitle="AI-generated publishing rhythm."
              icon={CalendarClock}
            />

            <div style={styles.planList}>
              {[
                ['Morning', 'Morning motivation story', '7:30 AM'],
                ['Afternoon', 'Behind-the-scenes story', '1:00 PM'],
                ['Evening', 'Engagement story', '7:30 PM'],
                ['Night', 'Night recap story', '10:00 PM'],
              ].map(([time, title, slot]) => (
                <div key={time} style={styles.planRow}>
                  <span style={styles.planTime}>{time}</span>
                  <div style={styles.planCopy}>
                    <strong>{title}</strong>
                    <span>
                      {slot} · Estimated performance: High
                    </span>
                  </div>
                  <Check size={15} color="#82e9c1" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'queue' ? (
          <section style={styles.section}>
            <SectionTitle
              title="AI Story Queue"
              subtitle="Drafts prepared by your creator agent."
              icon={FileIcon}
            />

            <div style={styles.queueList}>
              {drafts.length ? (
                drafts.map((draft, index) => (
                  <QueueCard
                    key={draft.id || index}
                    draft={draft}
                    onEdit={onCreateDraft}
                    onApprove={(item) =>
                      showNotice('Draft approved.')
                    }
                    onReject={(item) =>
                      showNotice('Draft rejected.')
                    }
                    onRegenerate={(item) =>
                      onCreateDraft?.({
                        source: 'regenerate',
                        draft: item,
                      })
                    }
                    onSchedule={onScheduleStory}
                    onPublish={onPublishStory}
                  />
                ))
              ) : (
                <Empty label="No AI drafts in the queue." />
              )}
            </div>
          </section>
        ) : null}

        {activeSection === 'trends' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Trend Radar"
              subtitle="Signals prepared for your niche."
              icon={TrendingUp}
            />

            <div style={styles.trendGrid}>
              {[
                ['Trending audio', 'Cinematic electronic'],
                ['Trending hashtags', '#nightvibes #creatorlife'],
                ['Visual styles', 'Warm cinematic'],
                ['Posting times', '7–9 PM'],
                ['Niche opportunity', 'Behind-the-scenes'],
                ['Viral pattern', 'Short hook + question'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={styles.trendCard}
                >
                  <Sparkles size={15} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'schedule' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Publishing Schedule"
              subtitle="AI recommended timing and queue."
              icon={CalendarClock}
            />

            <div style={styles.scheduleHero}>
              <Clock3 size={22} />
              <div>
                <strong>
                  Best window: {analytics.bestPostingTime || '8:00 PM'}
                </strong>
                <span>
                  {schedule.length} scheduled stories · Time zone
                  foundation ready
                </span>
              </div>
            </div>

            {schedule.slice(0, 6).map((item, index) => (
              <div
                key={item.id || index}
                style={styles.scheduleRow}
              >
                <CalendarClock size={15} />
                <span>
                  {item.title ||
                    item.caption ||
                    'Scheduled story'}
                </span>
                <strong>
                  {formatDate(item.publishAt)}
                </strong>
              </div>
            ))}
          </section>
        ) : null}

        {activeSection === 'insights' ? (
          <section style={styles.section}>
            <SectionTitle
              title="AI Performance Insights"
              subtitle="What your audience is telling you."
              icon={Lightbulb}
            />

            <div style={styles.insightList}>
              {[
                'Your night stories outperform daytime stories.',
                'Cinematic stories retain viewers longer.',
                'Short captions increase completion rate.',
                'Travel content has the highest share rate.',
                'Posting between 7–9 PM is optimal.',
              ].map((insight) => (
                <div
                  key={insight}
                  style={styles.insight}
                >
                  <Sparkles size={15} />
                  {insight}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'revenue' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Revenue Engine"
              subtitle="Creator business opportunities."
              icon={DollarSign}
            />

            <div style={styles.metricGrid}>
              <MetricCard
                label="Monthly forecast"
                value={money(analytics.monthlyForecast)}
                icon={DollarSign}
                color="#82e9c1"
              />
              <MetricCard
                label="Brand opportunities"
                value={campaigns.length + 2}
                icon={Briefcase}
                color="#ffd27d"
              />
              <MetricCard
                label="Subscriber growth"
                value={`${number(
                  analytics.subscriberGrowth
                )}%`}
                icon={Users}
                color="#ff4fd8"
              />
              <MetricCard
                label="Affiliate potential"
                value={money(
                  analytics.affiliatePotential
                )}
                icon={Target}
                color="#4dd7ff"
              />
            </div>

            <div style={styles.insight}>
              <Sparkles size={15} />
              Increase sponsored story pricing after your next
              performance milestone.
            </div>
          </section>
        ) : null}

        {activeSection === 'goals' ? (
          <section style={styles.section}>
            <SectionTitle
              title="Creator Goals"
              subtitle="Track progress toward your operating plan."
              icon={Target}
            />

            <div style={styles.goalList}>
              {localGoals.map((goal, index) => {
                const progress = number(
                  goal.progress ||
                    analytics.goalProgress?.[goal.id]
                );

                return (
                  <div
                    key={goal.id || index}
                    style={styles.goalRow}
                  >
                    <span>{goal.title}</span>
                    <div style={styles.goalTrack}>
                      <span
                        style={{
                          ...styles.goalFill,
                          width: `${Math.min(
                            100,
                            progress
                          )}%`,
                        }}
                      />
                    </div>
                    <strong>
                      {Math.round(progress)}%
                    </strong>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {activeSection === 'actions' ? (
          <section style={styles.section}>
            <SectionTitle
              title="AI Actions"
              subtitle="Run one-tap creator workflows."
              icon={Zap}
            />

            <div style={styles.actionGrid}>
              {[
                ['Generate Today’s Stories', 'generate'],
                ['Optimize All Drafts', 'optimize'],
                ['Schedule This Week', 'schedule'],
                ['Find Brand Opportunities', 'brands'],
                ['Improve Engagement', 'engagement'],
                ['Generate Recap', 'recap'],
                ['Create Highlight', 'highlight'],
                ['Analyze Audience', 'audience'],
              ].map(([label, action]) => (
                <button
                  type="button"
                  key={action}
                  onClick={() => runAgentAction(action)}
                  style={styles.actionButton}
                >
                  <Sparkles size={16} />
                  {label}
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
        @keyframes aarush-agent-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-agent-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes aarush-agent-pulse {
          0%, 100% {
            opacity: .45;
            transform: scale(.92);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        .aarush-agent-tab:hover,
        .aarush-agent-action:hover,
        .aarush-agent-queue:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 600px) {
          .aarush-agent-tabs {
            grid-template-columns: repeat(4,1fr) !important;
          }

          .aarush-agent-metrics {
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

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Sparkles size={25} />
      <span>{label}</span>
    </div>
  );
}

function FileIcon() {
  return (
    <span style={styles.customIcon}>
      <FileText size={17} />
    </span>
  );
}

function ShieldIcon() {
  return (
    <span style={styles.customIcon}>
      <ShieldCheck size={17} />
    </span>
  );
}

function formatDate(value) {
  if (!value) return 'Not scheduled';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not scheduled';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function money(value, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return `${currency} ${Math.round(Number(value) || 0)}`;
  }
}

function number(value) {
  return Number(value) || 0;
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
    width: 'min(100%, 1000px)',
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

  agentCard: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '.7rem',
    overflow: 'hidden',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.07))',
    boxShadow: '0 20px 60px rgba(0,0,0,.25)',
    animation: 'aarush-agent-in 260ms ease both',
  },

  agentOrb: {
    width: '3.5rem',
    height: '3.5rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    boxShadow: '0 0 30px rgba(124,92,255,.35)',
  },

  agentCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
    flex: 1,
  },

  agentCopyH1: {
    margin: 0,
    fontSize: '1rem',
  },

  agentCopyP: {
    margin: 0,
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  onlineBadge: {
    width: 'fit-content',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    color: '#82e9c1',
    fontSize: '.58rem',
    fontWeight: 800,
  },

  onlineDot: {
    width: '.45rem',
    height: '.45rem',
    borderRadius: '999px',
    background: '#82e9c1',
    boxShadow: '0 0 10px #82e9c1',
  },

  agentPulse: {
    position: 'absolute',
    top: '-2rem',
    right: '-2rem',
    width: '7rem',
    height: '7rem',
    borderRadius: '999px',
    background: 'rgba(77,215,255,.16)',
    filter: 'blur(6px)',
    animation: 'aarush-agent-pulse 2.2s ease-in-out infinite',
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
    animation: 'aarush-agent-in 240ms ease both',
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

  modeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
  },

  modeButton: {
    minHeight: '5rem',
    display: 'grid',
    alignContent: 'center',
    gap: '.25rem',
    padding: '.5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.62rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  modeButtonSpan: {
    color: '#91a0bc',
    fontSize: '.56rem',
    lineHeight: 1.35,
  },

  activeMode: {
    borderColor: 'rgba(124,92,255,.48)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.22),rgba(77,215,255,.08))',
  },

  safetyCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    marginTop: '.7rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.61rem',
  },

  safetyCardDiv: {
    display: 'grid',
    gap: '.18rem',
  },

  safetyCardSpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    minHeight: '2.4rem',
    color: '#aab6cf',
    fontSize: '.63rem',
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
    marginTop: '.7rem',
  },

  metricCard: {
    minHeight: '6.4rem',
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
    fontSize: '.78rem',
  },

  metricDetail: {
    color: '#82e9c1',
    fontSize: '.54rem',
  },

  planList: {
    display: 'grid',
    gap: '.4rem',
  },

  planRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  planTime: {
    width: '4.5rem',
    color: '#9deeff',
    fontSize: '.6rem',
    fontWeight: 800,
  },

  planCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  planCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  queueList: {
    display: 'grid',
    gap: '.45rem',
  },

  queueCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    background: 'rgba(255,255,255,.035)',
    transition: 'transform 180ms ease',
  },

  queueThumbnail: {
    width: '3rem',
    height: '3.6rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: '.5rem',
    color: '#9deeff',
    background: '#17233d',
  },

  queueImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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

  queueCopySmall: {
    color: '#6f7d98',
    fontSize: '.55rem',
  },

  queueActions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: '.2rem',
  },

  tinyButton: {
    width: '1.85rem',
    height: '1.85rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.5rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  tinyApprove: {
    width: '1.85rem',
    height: '1.85rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '.5rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.1)',
    cursor: 'pointer',
  },

  tinyReject: {
    width: '1.85rem',
    height: '1.85rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '.5rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.1)',
    cursor: 'pointer',
  },

  tinyPublish: {
    width: '1.85rem',
    height: '1.85rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '.5rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  trendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.45rem',
  },

  trendCard: {
    display: 'grid',
    gap: '.22rem',
    padding: '.65rem',
    border: '1px solid rgba(77,215,255,.14)',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.05)',
    fontSize: '.58rem',
  },

  trendCardSpan: {
    color: '#91a0bc',
  },

  trendCardStrong: {
    color: '#fff',
    fontSize: '.66rem',
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
    minHeight: '2.45rem',
    padding: '0 .5rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    color: '#cbd6ec',
    fontSize: '.62rem',
  },

  scheduleRowStrong: {
    marginLeft: 'auto',
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  insightList: {
    display: 'grid',
    gap: '.4rem',
  },

  insight: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '.6rem',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.63rem',
  },

  goalList: {
    display: 'grid',
    gap: '.55rem',
  },

  goalRow: {
    display: 'grid',
    gridTemplateColumns: '8rem 1fr 2.5rem',
    alignItems: 'center',
    gap: '.5rem',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  goalTrack: {
    position: 'relative',
    height: '.3rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.1)',
  },

  goalFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  goalRowStrong: {
    color: '#9deeff',
    textAlign: 'right',
  },

  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  actionButton: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .6rem',
    border: '1px solid rgba(124,92,255,.16)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.61rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'transform 180ms ease',
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

  customIcon: {
    display: 'grid',
    placeItems: 'center',
  },
};