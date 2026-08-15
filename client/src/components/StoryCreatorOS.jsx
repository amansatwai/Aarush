import {
  useMemo,
  useState,
} from 'react';
import {
  Archive,
  BarChart3,
  Bell,
  Briefcase,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  FolderOpen,
  Heart,
  Lightbulb,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Send,
  Settings,
  Sparkles,
  Star,
  Target,
  Users,
  Wallet,
  Wand2,
  X,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', Sparkles],
  ['stories', 'Stories', FileText],
  ['ai', 'AI Studio', Wand2],
  ['analytics', 'Analytics', BarChart3],
  ['money', 'Money', Wallet],
  ['brands', 'Brands', Briefcase],
  ['archive', 'Archive', Archive],
  ['highlights', 'Highlights', Star],
  ['memories', 'Memories', Heart],
  ['scheduler', 'Scheduler', CalendarClock],
  ['business', 'Business', Target],
  ['tasks', 'Tasks', Check],
];

function number(value) {
  return Number(value) || 0;
}

function money(value, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(number(value));
  } catch {
    return `${currency} ${Math.round(number(value))}`;
  }
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
        <span style={styles.metricDetail}>
          {detail}
        </span>
      ) : null}
    </article>
  );
}

export default function StoryCreatorOS({
  creator = {},
  stories = [],
  drafts = [],
  scheduledStories = [],
  analytics = {},
  earnings = {},
  campaigns = [],
  collaborations = [],
  archive = [],
  highlights = [],
  memories = [],
  notifications = [],
  tasks = [],
  onOpenEditor,
  onOpenAnalytics,
  onOpenMonetization,
  onOpenMarketplace,
  onOpenArchive,
  onOpenHighlights,
  onOpenAIGenerator,
  onOpenCollaboration,
  onOpenScheduler,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [notice, setNotice] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');

  const currency =
    earnings.currency ||
    creator.currency ||
    'INR';

  const overview = useMemo(
    () => ({
      views: number(
        analytics.totalViews ||
          analytics.views ||
          creator.totalStoryViews
      ),
      activeStories: number(
        stories.filter(
          (story) =>
            story.status === 'active' ||
            story.status === 'published'
        ).length
      ),
      scheduled: scheduledStories.length,
      drafts: drafts.length,
      earnings: number(
        earnings.month ||
          earnings.monthlyEarnings ||
          earnings.thisMonth
      ),
      campaigns: campaigns.filter(
        (campaign) =>
          campaign.status === 'Active' ||
          campaign.status === 'Accepted' ||
          campaign.status === 'Approved'
      ).length,
      subscribers: number(
        creator.subscribers ||
          analytics.activeSubscribers
      ),
      engagement: number(
        analytics.engagementRate ||
          creator.engagementRate
      ),
      growth: number(
        analytics.growth ||
          analytics.growthRate
      ),
    }),
    [
      analytics,
      campaigns,
      creator,
      drafts.length,
      earnings,
      scheduledStories.length,
      stories,
    ]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const quickActions = [
    ['Create Story', Plus, onOpenEditor],
    ['AI Generate Story', Wand2, onOpenAIGenerator],
    ['Open Editor', FileText, onOpenEditor],
    ['Schedule Story', CalendarClock, onOpenScheduler],
    ['View Analytics', BarChart3, onOpenAnalytics],
    ['Withdraw Earnings', DollarSign, onOpenMonetization],
    ['Create Highlight', Star, onOpenHighlights],
    ['Open Archive', Archive, onOpenArchive],
  ];

  const openAction = (handler, label) => {
    if (typeof handler === 'function') {
      handler();
      return;
    }

    showNotice(`${label} foundation opened.`);
  };

  const renderOverview = () => (
    <>
      <section style={styles.metricGrid}>
        <MetricCard
          label="Total Story Views"
          value={overview.views.toLocaleString()}
          icon={BarChart3}
          color="#4dd7ff"
        />
        <MetricCard
          label="Active Stories"
          value={overview.activeStories}
          icon={Sparkles}
          color="#82e9c1"
        />
        <MetricCard
          label="Scheduled"
          value={overview.scheduled}
          icon={CalendarClock}
          color="#ffd27d"
        />
        <MetricCard
          label="Drafts"
          value={overview.drafts}
          icon={FileText}
          color="#a895ff"
        />
        <MetricCard
          label="Monthly Earnings"
          value={money(overview.earnings, currency)}
          icon={DollarSign}
          color="#82e9c1"
        />
        <MetricCard
          label="Active Campaigns"
          value={overview.campaigns}
          icon={Briefcase}
          color="#ff9f72"
        />
        <MetricCard
          label="Subscribers"
          value={overview.subscribers.toLocaleString()}
          icon={Users}
          color="#ff4fd8"
        />
        <MetricCard
          label="Engagement Rate"
          value={`${overview.engagement}%`}
          icon={Heart}
          color="#ff5b84"
          detail={`Growth ${overview.growth}%`}
        />
      </section>

      <section style={styles.quickSection}>
        <div style={styles.sectionHeader}>
          <div>
            <h2>Quick Actions</h2>
            <span>One-tap creator workflows</span>
          </div>
          <Sparkles size={18} color="#4dd7ff" />
        </div>

        <div style={styles.quickGrid}>
          {quickActions.map(([label, Icon, handler]) => (
            <button
              type="button"
              key={label}
              onClick={() => openAction(handler, label)}
              style={styles.quickButton}
            >
              <span style={styles.quickIcon}>
                <Icon size={18} />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <div style={styles.twoColumn}>
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Story Studio</h2>
              <span>Manage your content pipeline</span>
            </div>
            <FileText size={18} color="#9deeff" />
          </div>

          <PipelineRow
            label="Drafts"
            value={drafts.length}
            onClick={onOpenEditor}
          />
          <PipelineRow
            label="Recent stories"
            value={stories.length}
            onClick={onOpenEditor}
          />
          <PipelineRow
            label="Scheduled stories"
            value={scheduledStories.length}
            onClick={onOpenScheduler}
          />
          <PipelineRow
            label="Published stories"
            value={overview.activeStories}
            onClick={onOpenAnalytics}
          />
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>AI Studio</h2>
              <span>Ideas, enhancement, and generation</span>
            </div>
            <Wand2 size={18} color="#a895ff" />
          </div>

          {[
            'AI Story Generator',
            'AI Assistant',
            'AI Enhancement',
            'Subtitle Generator',
          ].map((item) => (
            <PipelineRow
              key={item}
              label={item}
              value="Open"
              onClick={onOpenAIGenerator}
            />
          ))}
        </section>
      </div>

      <section style={styles.aiWorkspace}>
        <div style={styles.sectionHeader}>
          <div>
            <h2>AI Creator Workspace</h2>
            <span>
              Ask for ideas, deal advice, insights, or growth
              recommendations.
            </span>
          </div>
          <Sparkles size={19} color="#4dd7ff" />
        </div>

        <div style={styles.aiInputRow}>
          <input
            value={aiQuestion}
            onChange={(event) =>
              setAiQuestion(event.target.value)
            }
            placeholder="Ask AI about your next story..."
            aria-label="Ask creator AI"
            style={styles.aiInput}
          />

          <button
            type="button"
            onClick={() => {
              if (!aiQuestion.trim()) {
                showNotice('Ask the assistant a question.');
                return;
              }

              showNotice('AI recommendation prepared.');
              setAiQuestion('');
            }}
            aria-label="Ask AI"
            style={styles.sendButton}
          >
            <Send size={17} />
          </button>
        </div>

        <div style={styles.aiSuggestions}>
          {[
            'Give me three story ideas',
            'How can I improve retention?',
            'Should I accept this deal?',
            'What should I post tonight?',
          ].map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setAiQuestion(item)}
              style={styles.aiSuggestion}
            >
              <Sparkles size={13} />
              {item}
            </button>
          ))}
        </div>
      </section>
    </>
  );

  const renderStories = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Story Studio</h2>
          <span>Drafts, scheduled, and published stories</span>
        </div>
        <button
          type="button"
          onClick={() => openAction(onOpenEditor, 'Story Editor')}
          style={styles.smallPrimary}
        >
          <Plus size={14} />
          Create
        </button>
      </div>

      <div style={styles.storyList}>
        {[...drafts, ...scheduledStories, ...stories]
          .slice(0, 12)
          .map((story, index) => (
            <button
              type="button"
              key={story.id || index}
              onClick={() => onOpenEditor?.(story)}
              style={styles.storyRow}
            >
              <span style={styles.storyThumb}>
                {mediaUrl(story) ? (
                  <img
                    src={mediaUrl(story)}
                    alt=""
                    loading="lazy"
                    style={styles.storyThumbImage}
                  />
                ) : (
                  <FileText size={17} />
                )}
              </span>

              <span style={styles.storyCopy}>
                <strong>
                  {story.caption ||
                    story.title ||
                    'Untitled story'}
                </strong>
                <span>
                  {story.status || 'Published'} ·{' '}
                  {story.createdAt || 'Recently'}
                </span>
              </span>

              <ChevronRight size={15} />
            </button>
          ))}
      </div>
    </section>
  );

  const renderAnalytics = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Analytics Snapshot</h2>
          <span>Performance at a glance</span>
        </div>
        <BarChart3 size={18} color="#4dd7ff" />
      </div>

      <div style={styles.metricGrid}>
        <MetricCard
          label="Views"
          value={overview.views.toLocaleString()}
          icon={BarChart3}
          color="#4dd7ff"
        />
        <MetricCard
          label="Completion"
          value={`${analytics.completionRate || 0}%`}
          icon={Check}
          color="#82e9c1"
        />
        <MetricCard
          label="Watch Time"
          value={analytics.averageWatchTime || '—'}
          icon={Clock3}
          color="#ffd27d"
        />
        <MetricCard
          label="Best Posting Time"
          value={analytics.bestPostingTime || '8 PM'}
          icon={CalendarClock}
          color="#a895ff"
        />
      </div>

      <button
        type="button"
        onClick={() => openAction(onOpenAnalytics, 'Analytics')}
        style={styles.primaryButton}
      >
        Open full analytics
        <ChevronRight size={15} />
      </button>
    </section>
  );

  const renderMoney = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Monetization</h2>
          <span>Wallet, earnings, and business income</span>
        </div>
        <Wallet size={18} color="#82e9c1" />
      </div>

      <div style={styles.metricGrid}>
        <MetricCard
          label="Wallet Balance"
          value={money(earnings.balance, currency)}
          icon={Wallet}
          color="#82e9c1"
        />
        <MetricCard
          label="Pending"
          value={money(earnings.pending, currency)}
          icon={Clock3}
          color="#ffd27d"
        />
        <MetricCard
          label="Subscriptions"
          value={money(earnings.subscriptionRevenue, currency)}
          icon={Users}
          color="#ff4fd8"
        />
        <MetricCard
          label="Brand Revenue"
          value={money(earnings.brandRevenue, currency)}
          icon={Briefcase}
          color="#4dd7ff"
        />
      </div>

      <button
        type="button"
        onClick={() =>
          openAction(onOpenMonetization, 'Monetization')
        }
        style={styles.primaryButton}
      >
        Open monetization dashboard
        <ChevronRight size={15} />
      </button>
    </section>
  );

  const renderBrands = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Collaborations & Brands</h2>
          <span>Deals, campaigns, and opportunities</span>
        </div>
        <Briefcase size={18} color="#ffd27d" />
      </div>

      <div style={styles.metricGrid}>
        <MetricCard
          label="Active Deals"
          value={collaborations.length}
          icon={HandshakeIcon}
          color="#82e9c1"
        />
        <MetricCard
          label="Campaigns"
          value={campaigns.length}
          icon={Briefcase}
          color="#4dd7ff"
        />
        <MetricCard
          label="Approvals"
          value={campaigns.filter(
            (item) => item.status === 'Pending'
          ).length}
          icon={Clock3}
          color="#ffd27d"
        />
        <MetricCard
          label="New Opportunities"
          value={analytics.newOpportunities || 0}
          icon={Sparkles}
          color="#a895ff"
        />
      </div>

      <button
        type="button"
        onClick={() =>
          openAction(
            onOpenMarketplace,
            'Creator Marketplace'
          )
        }
        style={styles.primaryButton}
      >
        Open marketplace
        <ChevronRight size={15} />
      </button>

      <button
        type="button"
        onClick={() =>
          openAction(
            onOpenCollaboration,
            'Collaboration Studio'
          )
        }
        style={styles.outlineButton}
      >
        Open collaboration studio
        <ChevronRight size={15} />
      </button>
    </section>
  );

  const renderArchive = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Archive & Memories</h2>
          <span>Rediscover and organize your stories</span>
        </div>
        <Archive size={18} color="#9deeff" />
      </div>

      <div style={styles.metricGrid}>
        <MetricCard
          label="Archive"
          value={archive.length}
          icon={Archive}
          color="#9deeff"
        />
        <MetricCard
          label="Highlights"
          value={highlights.length}
          icon={Star}
          color="#ffd27d"
        />
        <MetricCard
          label="Smart Memories"
          value={memories.length}
          icon={Heart}
          color="#ff4fd8"
        />
        <MetricCard
          label="Recap Ideas"
          value={analytics.recapSuggestions || 0}
          icon={FilmIcon}
          color="#a895ff"
        />
      </div>

      <div style={styles.actionRow}>
        <button
          type="button"
          onClick={() => openAction(onOpenArchive, 'Archive')}
          style={styles.outlineButton}
        >
          Archive
          <ChevronRight size={15} />
        </button>

        <button
          type="button"
          onClick={() =>
            openAction(onOpenHighlights, 'Highlights')
          }
          style={styles.outlineButton}
        >
          Highlights
          <ChevronRight size={15} />
        </button>
      </div>
    </section>
  );

  const renderScheduler = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Scheduler</h2>
          <span>Plan your next publishing window</span>
        </div>
        <CalendarClock size={18} color="#ffd27d" />
      </div>

      <div style={styles.scheduleCard}>
        <span>Best AI posting window</span>
        <strong>
          {analytics.bestPostingTime || 'Today · 8:00 PM'}
        </strong>
        <small>
          {scheduledStories.length} upcoming stories
        </small>
      </div>

      {scheduledStories.slice(0, 5).map((story, index) => (
        <div
          key={story.id || index}
          style={styles.scheduleRow}
        >
          <Clock3 size={15} />
          <span>
            {story.title ||
              story.caption ||
              'Scheduled story'}
          </span>
          <strong>
            {formatDate(story.scheduledAt)}
          </strong>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          openAction(onOpenScheduler, 'Scheduler')
        }
        style={styles.primaryButton}
      >
        Open scheduler
        <ChevronRight size={15} />
      </button>
    </section>
  );

  const renderTasks = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Task Center</h2>
          <span>Keep your creator operations moving.</span>
        </div>
        <Check size={18} color="#82e9c1" />
      </div>

      <div style={styles.taskList}>
        {(tasks.length
          ? tasks
          : [
              'Publish scheduled story',
              'Review campaign',
              'Respond to brand',
              'Create recap',
              'Update highlight',
              'Generate subtitles',
              'Optimize posting time',
            ]
        ).map((task, index) => {
          const label =
            typeof task === 'string'
              ? task
              : task.title || task.label;

          return (
            <button
              type="button"
              key={task.id || index}
              onClick={() =>
                showNotice(`${label} opened.`)
              }
              style={styles.taskRow}
            >
              <span style={styles.taskCheck}>
                {task.completed ? <Check size={13} /> : null}
              </span>
              <span>{label}</span>
              <ChevronRight
                size={14}
                style={{ marginLeft: 'auto' }}
              />
            </button>
          );
        })}
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'stories') return renderStories();
    if (activeModule === 'analytics') return renderAnalytics();
    if (activeModule === 'money') return renderMoney();
    if (activeModule === 'brands') return renderBrands();
    if (activeModule === 'archive') return renderArchive();
    if (activeModule === 'scheduler') return renderScheduler();
    if (activeModule === 'tasks') return renderTasks();

    return renderOverview();
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Creator OS"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Creator OS</strong>
          <span>
            Your complete Aarush creator workspace
          </span>
        </div>

        <button
          type="button"
          aria-label="Workspace settings"
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
        @keyframes aarush-os-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-os-module:hover,
        .aarush-os-quick:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 600px) {
          .aarush-os-module-nav {
            grid-template-columns: repeat(4,1fr) !important;
          }

          .aarush-os-metrics {
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

function PipelineRow({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.pipelineRow}
    >
      <span>{label}</span>
      <strong>{value}</strong>
      <ChevronRight size={15} />
    </button>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
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
        <span style={styles.metricDetail}>
          {detail}
        </span>
      ) : null}
    </article>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <FolderOpen size={26} />
      <span>{label}</span>
    </div>
  );
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

function HandshakeIcon() {
  return (
    <span style={styles.customIcon}>
      <Briefcase size={16} />
    </span>
  );
}

function FilmIcon() {
  return (
    <span style={styles.customIcon}>
      <Sparkles size={16} />
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
    minWidth: '5.2rem',
    minHeight: '2.55rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.18rem',
    flexShrink: 0,
    padding: '0 .45rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
    transition: 'all 180ms ease',
  },

  activeModuleButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
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
    animation: 'aarush-os-in 250ms ease both',
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
    fontSize: '.95rem',
  },

  metricDetail: {
    color: '#82e9c1',
    fontSize: '.55rem',
  },

  quickSection: {
    padding: '.9rem',
    border: '1px solid rgba(124,92,255,.22)',
    borderRadius: '1.1rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.1),rgba(77,215,255,.04))',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-os-in 240ms ease both',
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

  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  quickButton: {
    minHeight: '4.4rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.3rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.8rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
    transition: 'transform 180ms ease',
  },

  quickIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.7rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.8rem',
  },

  pipelineRow: {
    width: '100%',
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.65rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  pipelineRowStrong: {
    marginLeft: 'auto',
    color: '#9deeff',
    fontSize: '.62rem',
  },

  aiWorkspace: {
    padding: '.9rem',
    border: '1px solid rgba(77,215,255,.2)',
    borderRadius: '1.1rem',
    background:
      'linear-gradient(135deg,rgba(77,215,255,.08),rgba(124,92,255,.06))',
  },

  aiInputRow: {
    display: 'flex',
    gap: '.4rem',
  },

  aiInput: {
    minWidth: 0,
    minHeight: '2.7rem',
    flex: 1,
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.75rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.68rem',
  },

  sendButton: {
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  aiSuggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.6rem',
  },

  aiSuggestion: {
    minHeight: '2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .5rem',
    border: '1px solid rgba(77,215,255,.18)',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  storyList: {
    display: 'grid',
    gap: '.4rem',
  },

  storyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.5rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  storyThumb: {
    width: '2.5rem',
    height: '3.1rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: '.45rem',
    color: '#9deeff',
    background: '#17233d',
  },

  storyThumbImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  storyCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  storyCopySpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  primaryButton: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    marginTop: '.6rem',
    padding: '0 .7rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.66rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  outlineButton: {
    minHeight: '2.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    marginTop: '.5rem',
    padding: '0 .65rem',
    border: '1px solid rgba(77,215,255,.22)',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.08)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  scheduleCard: {
    display: 'grid',
    gap: '.25rem',
    padding: '.7rem',
    border: '1px solid rgba(255,210,125,.16)',
    borderRadius: '.75rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.05)',
  },

  scheduleCardStrong: {
    color: '#fff',
    fontSize: '.9rem',
  },

  scheduleCardSmall: {
    color: '#91a0bc',
    fontSize: '.58rem',
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

  taskList: {
    display: 'grid',
    gap: '.4rem',
  },

  taskRow: {
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.65rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.63rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  taskCheck: {
    width: '1.35rem',
    height: '1.35rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(130,233,193,.28)',
    borderRadius: '.4rem',
    color: '#82e9c1',
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