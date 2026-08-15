import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  Check,
  ChevronRight,
  Cloud,
  CreditCard,
  FileText,
  FolderKanban,
  Grid3X3,
  LayoutDashboard,
  ListTodo,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['stories', 'Stories', Play],
  ['messaging', 'Messaging', MessageCircle],
  ['wallet', 'Wallet', WalletCards],
  ['workspace', 'Workspace', LayoutDashboard],
  ['education', 'Education', BookOpen],
  ['business', 'Business', Briefcase],
  ['cloud', 'Cloud Storage', Cloud],
  ['automation', 'Automation', Zap],
  ['ai', 'AI Assistant', Sparkles],
  ['security', 'Security', ShieldCheck],
  ['privacy', 'Privacy', ShieldCheck],
  ['live', 'Live Studio', Activity],
  ['commerce', 'Commerce', CreditCard],
  ['analytics', 'Analytics', BarChart3],
];

const QUICK_ACTIONS = [
  ['Create Story', Play],
  ['Open Camera', Activity],
  ['Send Message', MessageCircle],
  ['Pay via UPI', WalletCards],
  ['Create Document', FileText],
  ['Create Task', ListTodo],
  ['Ask AI', Sparkles],
  ['Upload File', Upload],
  ['Start Live', Activity],
  ['Create Invoice', FileText],
  ['Start Study Session', BookOpen],
  ['Run Automation', Zap],
];

const NOTIFICATION_CATEGORIES = [
  'All',
  'Stories',
  'Messages',
  'Wallet',
  'Workspace',
  'Education',
  'Business',
  'Security',
  'AI',
  'System',
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
  if (!value) return 'Today';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
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

export default function SuperAppDashboard({
  user = {},
  dashboard = {},
  modules = [],
  notifications = [],
  analytics = {},
  wallet = {},
  workspace = {},
  education = {},
  business = {},
  automation = {},
  security = {},
  ai = {},
  onOpenModule,
  onRunQuickAction,
  onCustomizeDashboard,
  onClose,
}) {
  const [activeSection, setActiveSection] =
    useState('overview');
  const [notificationCategory, setNotificationCategory] =
    useState('All');
  const [notice, setNotice] = useState('');
  const [compactView, setCompactView] =
    useState(false);
  const [search, setSearch] = useState('');

  const filteredNotifications = useMemo(() => {
    const query = search.toLowerCase();

    return notifications.filter((notification) => {
      const matchesCategory =
        notificationCategory === 'All' ||
        notification.category === notificationCategory;

      const matchesSearch =
        !query ||
        [
          notification.title,
          notification.message,
          notification.category,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [notificationCategory, notifications, search]);

  const activeModuleCount = useMemo(
    () =>
      modules.filter(
        (module) =>
          module.status !== 'Disabled' &&
          module.enabled !== false
      ).length || MODULES.length,
    [modules]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const runQuickAction = (label) => {
    onRunQuickAction?.({
      action: label,
      dashboardId: dashboard.id || dashboard.dashboardId,
      context: {
        user,
        wallet,
        workspace,
        education,
        business,
        automation,
        security,
      },
    });

    showNotice(`${label} prepared.`);
  };

  const getModuleData = (id) =>
    modules.find(
      (module) =>
        module.id === id ||
        module.name?.toLowerCase() === id
    ) || {};

  const renderOverview = () => (
    <>
      <section style={styles.dashboardHero}>
        <div style={styles.dashboardOrb}>
          <Grid3X3 size={32} />
        </div>
        <div style={styles.dashboardCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Aarush Super App
          </span>
          <h1>
            Welcome back,{' '}
            {user.firstName ||
              user.name?.split?.(' ')?.[0] ||
              'there'}
          </h1>
          <p>
            Your intelligent command center for creation,
            communication, learning, business, finance, and
            personal productivity.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Activity size={13} />
              {activeModuleCount} modules active
            </span>
            <span>
              <Sparkles size={13} />
              AI score:{' '}
              {dashboard.aiProductivityScore || 89}%
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Stories published"
          value={numeric(analytics.storiesPublished)}
          icon={Play}
          color="#4dd7ff"
        />
        <MetricCard
          label="Messages received"
          value={numeric(analytics.messagesReceived)}
          icon={MessageCircle}
          color="#a895ff"
        />
        <MetricCard
          label="Wallet balance"
          value={money(wallet.balance)}
          icon={WalletCards}
          color="#82e9c1"
        />
        <MetricCard
          label="Active projects"
          value={numeric(workspace.activeProjects)}
          icon={FolderKanban}
          color="#ffd27d"
        />
        <MetricCard
          label="Courses in progress"
          value={numeric(education.coursesInProgress)}
          icon={BookOpen}
          color="#9deeff"
        />
        <MetricCard
          label="Business revenue"
          value={money(business.revenue)}
          icon={Briefcase}
          color="#ff4fd8"
        />
        <MetricCard
          label="Storage used"
          value={dashboard.storageUsed || 'Foundation'}
          icon={Cloud}
          color="#ff9f72"
        />
        <MetricCard
          label="Automations active"
          value={numeric(automation.activeWorkflows)}
          icon={Zap}
          color="#82e9c1"
        />
        <MetricCard
          label="Ecosystem health"
          value={`${dashboard.healthScore || 91}/100`}
          icon={ShieldCheck}
          color="#4dd7ff"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Quick Actions"
          subtitle="Jump into the work that matters now."
          icon={Zap}
        />

        <div style={styles.quickGrid}>
          {QUICK_ACTIONS.map(([label, Icon]) => (
            <button
              type="button"
              key={label}
              onClick={() => runQuickAction(label)}
              style={styles.quickAction}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );

  const renderModuleGrid = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Module Grid"
        subtitle="Open any Aarush service from one place."
        icon={Grid3X3}
        action={
          <button
            type="button"
            onClick={() => {
              onCustomizeDashboard?.();
              showNotice('Dashboard customization opened.');
            }}
            style={styles.smallButton}
          >
            <Settings2 size={14} />
            Customize
          </button>
        }
      />

      <div style={styles.moduleGrid}>
        {MODULES.map(([id, label, Icon]) => {
          const data = getModuleData(id);

          return (
            <button
              type="button"
              key={id}
              onClick={() => {
                onOpenModule?.(id);
                showNotice(`${label} opened.`);
              }}
              style={styles.moduleCard}
            >
              <span
                style={{
                  ...styles.moduleIcon,
                  color: data.color || '#9deeff',
                  background: `${data.color || '#4dd7ff'}18`,
                }}
              >
                <Icon size={19} />
              </span>
              <strong>{label}</strong>
              <span>
                {data.status || 'Connected'} ·{' '}
                {data.activity || 'Ready'}
              </span>
              <small>
                Health {data.health || 'Good'} ·{' '}
                {numeric(data.notifications)} alerts
              </small>
              <ChevronRight size={14} />
            </button>
          );
        })}
      </div>
    </section>
  );

  const renderToday = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Today"
        subtitle="Your personalized agenda and reminders."
        icon={CalendarDays}
      />

      <div style={styles.todayList}>
        {[
          ['Calendar events', dashboard.calendarEvents],
          ['Tasks due', dashboard.tasksDue],
          ['Meetings', dashboard.meetings],
          ['Story schedule', dashboard.storySchedule],
          ['Study sessions', dashboard.studySessions],
          ['Business reminders', dashboard.businessReminders],
          ['Payment reminders', dashboard.paymentReminders],
          ['AI recommendations', dashboard.aiRecommendations],
        ].map(([label, value]) => (
          <button
            type="button"
            key={label}
            onClick={() => showNotice(`${label} opened.`)}
            style={styles.todayRow}
          >
            <Clock3 size={15} />
            <span>{label}</span>
            <strong>{value || 'Ready'}</strong>
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
    </section>
  );

  const renderActivity = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Recent Activity"
        subtitle="One unified feed across the Aarush ecosystem."
        icon={Activity}
      />

      <div style={styles.activityList}>
        {(dashboard.recentActivity || []).length ? (
          dashboard.recentActivity.map((item, index) => (
            <div
              key={item.id || index}
              style={styles.activityRow}
            >
              <span style={styles.activityDot} />
              <span style={styles.activityCopy}>
                <strong>
                  {item.title || item.action || 'Activity'}
                </strong>
                <span>
                  {item.source || 'Aarush'} ·{' '}
                  {formatDate(item.timestamp)}
                </span>
              </span>
              <ChevronRight size={14} />
            </div>
          ))
        ) : (
          <Empty label="No recent activity." />
        )}
      </div>
    </section>
  );

  const renderInsights = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Insights"
        subtitle="AI-generated suggestions from your ecosystem context."
        icon={Sparkles}
      />

      <div style={styles.insightGrid}>
        {[
          [
            'Best posting time today',
            ai.bestPostingTime || 'Evening window',
          ],
          [
            'Wallet spending summary',
            ai.spendingSummary || 'Foundation ready',
          ],
          [
            'Productivity trend',
            ai.productivityTrend || 'Improving',
          ],
          [
            'Study performance',
            ai.studyPerformance || 'Foundation ready',
          ],
          [
            'Business opportunity',
            ai.businessOpportunity || 'Ready to analyze',
          ],
          [
            'Storage optimization',
            ai.storageOptimization || 'Ready to scan',
          ],
          [
            'Automation savings',
            ai.automationSavings || 'Foundation ready',
          ],
          [
            'Security insight',
            ai.securityInsight || 'No urgent risks',
          ],
        ].map(([label, value]) => (
          <button
            type="button"
            key={label}
            onClick={() => showNotice(`${label} opened.`)}
            style={styles.insightCard}
          >
            <Sparkles size={15} />
            <span>{label}</span>
            <strong>{value}</strong>
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
    </section>
  );

  const renderSecurity = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Security"
        subtitle="Identity, privacy, sessions, and backups."
        icon={ShieldCheck}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Active sessions"
          value={numeric(security.activeSessions)}
          icon={Activity}
          color="#4dd7ff"
        />
        <MetricCard
          label="Trusted devices"
          value={numeric(security.trustedDevices)}
          icon={ShieldCheck}
          color="#82e9c1"
        />
        <MetricCard
          label="Security score"
          value={`${security.securityScore || 91}/100`}
          icon={ShieldCheck}
          color="#a895ff"
        />
        <MetricCard
          label="Privacy score"
          value={`${security.privacyScore || 94}/100`}
          icon={LockKeyholeIcon}
          color="#ffd27d"
        />
        <MetricCard
          label="Recent alerts"
          value={numeric(security.recentAlerts)}
          icon={Bell}
          color="#ff7c9f"
        />
        <MetricCard
          label="Backup status"
          value={security.backupStatus || 'Ready'}
          icon={Cloud}
          color="#9deeff"
        />
        <MetricCard
          label="Recovery readiness"
          value={security.recoveryReadiness || 'Ready'}
          icon={ShieldCheck}
          color="#82e9c1"
        />
      </div>
    </section>
  );

  const renderProductivity = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Productivity"
        subtitle="Workspace activity and focus signals."
        icon={LayoutDashboard}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Open projects"
          value={numeric(workspace.openProjects)}
          icon={FolderKanban}
          color="#4dd7ff"
        />
        <MetricCard
          label="Pending tasks"
          value={numeric(workspace.pendingTasks)}
          icon={ListTodo}
          color="#ffd27d"
        />
        <MetricCard
          label="Documents edited"
          value={numeric(workspace.documentsEdited)}
          icon={FileText}
          color="#a895ff"
        />
        <MetricCard
          label="Team activity"
          value={workspace.teamActivity || 'Ready'}
          icon={Users}
          color="#82e9c1"
        />
        <MetricCard
          label="Workspace health"
          value={workspace.health || 'Good'}
          icon={ShieldCheck}
          color="#9deeff"
        />
      </div>
    </section>
  );

  const renderFinance = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Finance"
        subtitle="Wallet balance, income, payouts, and subscriptions."
        icon={WalletCards}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Balance"
          value={money(wallet.balance)}
          icon={WalletCards}
          color="#82e9c1"
        />
        <MetricCard
          label="Income"
          value={money(wallet.income)}
          icon={TrendingUp}
          color="#4dd7ff"
        />
        <MetricCard
          label="Expenses"
          value={money(wallet.expenses)}
          icon={ArrowUpIcon}
          color="#ff9f72"
        />
        <MetricCard
          label="Creator earnings"
          value={money(wallet.creatorEarnings)}
          icon={Sparkles}
          color="#a895ff"
        />
        <MetricCard
          label="Pending payouts"
          value={money(wallet.pendingPayouts)}
          icon={Clock3}
          color="#ffd27d"
        />
        <MetricCard
          label="Subscriptions"
          value={wallet.upcomingSubscriptions || 'Ready'}
          icon={CreditCard}
          color="#9deeff"
        />
      </div>
    </section>
  );

  const renderCreator = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Creator"
        subtitle="Story performance, deals, live activity, and growth."
        icon={Play}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Story views"
          value={numeric(analytics.storyViews)}
          icon={Play}
          color="#4dd7ff"
        />
        <MetricCard
          label="Engagement"
          value={
            analytics.engagement
              ? `${analytics.engagement}%`
              : 'Foundation'
          }
          icon={TrendingUp}
          color="#82e9c1"
        />
        <MetricCard
          label="Brand deals"
          value={numeric(analytics.brandDeals)}
          icon={Briefcase}
          color="#a895ff"
        />
        <MetricCard
          label="Live activity"
          value={analytics.liveActivity || 'Ready'}
          icon={Activity}
          color="#ff4fd8"
        />
        <MetricCard
          label="Content pipeline"
          value={analytics.contentPipeline || 'Ready'}
          icon={FolderKanban}
          color="#ffd27d"
        />
        <MetricCard
          label="AI growth forecast"
          value={analytics.growthForecast || 'Forecasting'}
          icon={Sparkles}
          color="#9deeff"
        />
      </div>
    </section>
  );

  const renderBusiness = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Business"
        subtitle="Sales, customers, orders, and growth intelligence."
        icon={Briefcase}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Revenue"
          value={money(business.revenue)}
          icon={CircleDollarIcon}
          color="#82e9c1"
        />
        <MetricCard
          label="Sales"
          value={business.sales || 'Ready'}
          icon={TrendingUp}
          color="#4dd7ff"
        />
        <MetricCard
          label="Customers"
          value={numeric(business.customers)}
          icon={Users}
          color="#a895ff"
        />
        <MetricCard
          label="Orders"
          value={numeric(business.orders)}
          icon={ClipboardIcon}
          color="#ffd27d"
        />
        <MetricCard
          label="Inventory alerts"
          value={numeric(business.inventoryAlerts)}
          icon={PackageIcon}
          color="#ff7c9f"
        />
        <MetricCard
          label="AI forecast"
          value={business.aiForecast || 'Ready'}
          icon={Sparkles}
          color="#9deeff"
        />
      </div>
    </section>
  );

  const renderEducation = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Education"
        subtitle="Study progress, exams, assignments, and learning AI."
        icon={BookOpen}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Study hours"
          value={education.studyHours || 0}
          icon={Clock3}
          color="#4dd7ff"
        />
        <MetricCard
          label="Streak"
          value={`${education.streak || 0} days`}
          icon={Activity}
          color="#ff9f72"
        />
        <MetricCard
          label="Upcoming exams"
          value={numeric(education.upcomingExams)}
          icon={Target}
          color="#ffd27d"
        />
        <MetricCard
          label="Assignments"
          value={numeric(education.pendingAssignments)}
          icon={ListTodo}
          color="#a895ff"
        />
        <MetricCard
          label="AI recommendations"
          value={education.aiRecommendations || 'Ready'}
          icon={Sparkles}
          color="#82e9c1"
        />
      </div>
    </section>
  );

  const renderCloud = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Cloud"
        subtitle="Storage, uploads, backups, sharing, and sync."
        icon={Cloud}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Storage used"
          value={dashboard.storageUsed || 'Foundation'}
          icon={Cloud}
          color="#4dd7ff"
        />
        <MetricCard
          label="Recent uploads"
          value={numeric(dashboard.recentUploads)}
          icon={Upload}
          color="#a895ff"
        />
        <MetricCard
          label="Backup status"
          value={dashboard.backupStatus || 'Ready'}
          icon={ShieldCheck}
          color="#82e9c1"
        />
        <MetricCard
          label="Shared files"
          value={numeric(dashboard.sharedFiles)}
          icon={ShareIcon}
          color="#ffd27d"
        />
        <MetricCard
          label="Sync status"
          value={dashboard.syncStatus || 'Synced'}
          icon={RefreshIcon}
          color="#9deeff"
        />
      </div>
    </section>
  );

  const renderAutomation = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Automation"
        subtitle="Workflow executions, savings, and AI suggestions."
        icon={Zap}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Active workflows"
          value={numeric(automation.activeWorkflows)}
          icon={Zap}
          color="#4dd7ff"
        />
        <MetricCard
          label="Executions today"
          value={numeric(automation.executionsToday)}
          icon={Play}
          color="#82e9c1"
        />
        <MetricCard
          label="Failed automations"
          value={numeric(automation.failed)}
          icon={ShieldCheck}
          color="#ff7c9f"
        />
        <MetricCard
          label="Time saved"
          value={automation.timeSaved || 'Foundation'}
          icon={Clock3}
          color="#ffd27d"
        />
      </div>

      <div style={styles.insightNote}>
        <Sparkles size={16} />
        {automation.aiSuggestion ||
          'AI workflow optimization is ready.'}
      </div>
    </section>
  );

  const renderNotifications = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Notifications"
        subtitle="Unified alerts from every Aarush service."
        icon={Bell}
      />

      <div style={styles.notificationFilters}>
        {NOTIFICATION_CATEGORIES.map((category) => (
          <button
            type="button"
            key={category}
            onClick={() =>
              setNotificationCategory(category)
            }
            aria-pressed={notificationCategory === category}
            style={{
              ...styles.filterButton,
              ...(notificationCategory === category
                ? styles.activeFilterButton
                : {}),
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div style={styles.notificationList}>
        {filteredNotifications.length ? (
          filteredNotifications.map((notification, index) => (
            <button
              type="button"
              key={notification.id || index}
              onClick={() =>
                showNotice('Notification opened.')
              }
              style={styles.notificationRow}
            >
              <span style={styles.notificationIcon}>
                <Bell size={15} />
              </span>
              <span style={styles.notificationCopy}>
                <strong>
                  {notification.title || 'Notification'}
                </strong>
                <span>
                  {notification.message || 'Aarush update'}
                </span>
                <small>
                  {notification.category || 'System'} ·{' '}
                  {formatDate(notification.createdAt)}
                </small>
              </span>
              <ChevronRight size={14} />
            </button>
          ))
        ) : (
          <Empty label="No notifications found." />
        )}
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeSection === 'overview') return renderOverview();
    if (activeSection === 'modules') return renderModuleGrid();
    if (activeSection === 'today') return renderToday();
    if (activeSection === 'activity') return renderActivity();
    if (activeSection === 'insights') return renderInsights();
    if (activeSection === 'security') return renderSecurity();
    if (activeSection === 'productivity') {
      return renderProductivity();
    }
    if (activeSection === 'finance') return renderFinance();
    if (activeSection === 'creator') return renderCreator();
    if (activeSection === 'business') return renderBusiness();
    if (activeSection === 'education') {
      return renderEducation();
    }
    if (activeSection === 'cloud') return renderCloud();
    if (activeSection === 'automation') {
      return renderAutomation();
    }
    if (activeSection === 'notifications') {
      return renderNotifications();
    }

    return renderOverview();
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Super App Dashboard"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Super App Dashboard</strong>
          <span>
            Your Aarush ecosystem command center
          </span>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('notifications')}
          aria-label="Open notifications"
          style={styles.iconButton}
        >
          <Bell size={18} />
          {notifications.length ? (
            <span style={styles.notificationDot} />
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

        <div style={styles.dashboardControls}>
          <div style={styles.controlTabs}>
            {[
              ['overview', 'Overview', LayoutDashboard],
              ['modules', 'Modules', Grid3X3],
              ['today', 'Today', CalendarDays],
              ['activity', 'Activity', Activity],
              ['insights', 'Insights', Sparkles],
              ['security', 'Security', ShieldCheck],
              ['notifications', 'Notifications', Bell],
            ].map(([id, label, Icon]) => (
              <button
                type="button"
                key={id}
                onClick={() => setActiveSection(id)}
                aria-pressed={activeSection === id}
                style={{
                  ...styles.controlTab,
                  ...(activeSection === id
                    ? styles.activeControlTab
                    : {}),
                }}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setCompactView((value) => !value)
            }
            style={styles.smallButton}
          >
            {compactView ? 'Expanded view' : 'Compact view'}
          </button>
        </div>

        {renderModule()}

        <section style={styles.section}>
          <SectionTitle
            title="Ecosystem Modules"
            subtitle="Productivity, finance, creator, business, and AI at a glance."
            icon={Grid3X3}
          />

          <div style={styles.ecosystemGrid}>
            {[
              ['Productivity', WorkspaceIcon, renderProductivity],
              ['Finance', WalletIcon, renderFinance],
              ['Creator', CreatorIcon, renderCreator],
              ['Business', BusinessIcon, renderBusiness],
              ['Education', BookIcon, renderEducation],
              ['Cloud', Cloud, renderCloud],
              ['Automation', Zap, renderAutomation],
            ].map(([label, Icon, renderer]) => (
              <button
                type="button"
                key={label}
                onClick={() => {
                  setActiveSection(label.toLowerCase());
                  renderer();
                }}
                style={styles.ecosystemCard}
              >
                <Icon size={18} />
                <strong>{label}</strong>
                <span>Open intelligence panel</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        @keyframes aarush-dashboard-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-dashboard-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 44px rgba(124,92,255,.54);
          }
        }

        .aarush-dashboard-card:hover,
        .aarush-dashboard-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-dashboard-controls {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .aarush-dashboard-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-dashboard-quick,
          .aarush-dashboard-ecosystem {
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

function WorkspaceIcon() {
  return (
    <span style={styles.customIcon}>
      <LayoutDashboard size={18} />
    </span>
  );
}

function WalletIcon() {
  return (
    <span style={styles.customIcon}>
      <WalletCards size={18} />
    </span>
  );
}

function CreatorIcon() {
  return (
    <span style={styles.customIcon}>
      <Play size={18} />
    </span>
  );
}

function BusinessIcon() {
  return (
    <span style={styles.customIcon}>
      <Briefcase size={18} />
    </span>
  );
}

function BookIcon() {
  return (
    <span style={styles.customIcon}>
      <BookOpen size={18} />
    </span>
  );
}

function RefreshIcon() {
  return (
    <span style={styles.customIcon}>
      <RefreshCw size={17} />
    </span>
  );
}

function ShareIcon() {
  return (
    <span style={styles.customIcon}>
      <ShareSvg />
    </span>
  );
}

function ShareSvg() {
  return (
    <svg
      width="16"
      height="16"
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
      <path d="m15.4 6.5 6.8-4" />
    </svg>
  );
}

function LockKeyholeIcon() {
  return (
    <span style={styles.customIcon}>
      <ShieldCheck size={16} />
    </span>
  );
}

function ArrowUpIcon() {
  return (
    <span style={styles.customIcon}>
      <TrendingUp size={16} />
    </span>
  );
}

function CircleDollarIcon() {
  return (
    <span style={styles.customIcon}>
      <CircleDollarSign size={16} />
    </span>
  );
}

function ClipboardIcon() {
  return (
    <span style={styles.customIcon}>
      <FileText size={16} />
    </span>
  );
}

function PackageIcon() {
  return (
    <span style={styles.customIcon}>
      <Cloud size={16} />
    </span>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.6),#07090e 68%)',
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

  notificationDot: {
    position: 'absolute',
    top: '.35rem',
    right: '.35rem',
    width: '.4rem',
    height: '.4rem',
    borderRadius: '999px',
    background: '#ff4f82',
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
    width: 'min(100%, 1200px)',
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

  dashboardControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
  },

  controlTabs: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.2rem',
  },

  controlTab: {
    minHeight: '2.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    flexShrink: 0,
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.55rem',
    cursor: 'pointer',
  },

  activeControlTab: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background: 'rgba(124,92,255,.16)',
  },

  dashboardHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.95rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.2),rgba(77,215,255,.06))',
    animation:
      'aarush-dashboard-pulse 3s ease-in-out infinite',
  },

  dashboardOrb: {
    width: '5rem',
    height: '5rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(77,215,255,.4)',
    borderRadius: '1.2rem',
    color: '#c9f9ff',
    background:
      'radial-gradient(circle,#3d6d8a,#262257 70%)',
  },

  dashboardCopy: {
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

  dashboardCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  dashboardCopyP: {
    maxWidth: '45rem',
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
    gridTemplateColumns: 'repeat(5,1fr)',
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
    animation: 'aarush-dashboard-in 240ms ease both',
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
    animation: 'aarush-dashboard-in 240ms ease both',
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
    gridTemplateColumns: 'repeat(6,1fr)',
    gap: '.45rem',
  },

  quickAction: {
    minHeight: '4rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.3rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.8rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  moduleCard: {
    minHeight: '7rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  moduleIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.6rem',
  },

  moduleCardSpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  moduleCardSmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  moduleCardSvg: {
    marginTop: 'auto',
    alignSelf: 'end',
    color: '#91a0bc',
  },

  todayList: {
    display: 'grid',
    gap: '.35rem',
  },

  todayRow: {
    minHeight: '2.65rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  todayRowStrong: {
    marginLeft: 'auto',
    color: '#9deeff',
  },

  activityList: {
    display: 'grid',
    gap: '.35rem',
  },

  activityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    minHeight: '2.65rem',
    padding: '0 .5rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
  },

  activityDot: {
    width: '.5rem',
    height: '.5rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: '#4dd7ff',
    boxShadow: '0 0 12px rgba(77,215,255,.7)',
  },

  activityCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  activityCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  insightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  insightCard: {
    minHeight: '6rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(124,92,255,.16)',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  insightCardSpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  insightCardStrong: {
    color: '#fff',
    fontSize: '.62rem',
  },

  insightCardSvg: {
    alignSelf: 'end',
    color: '#91a0bc',
  },

  ecosystemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  ecosystemCard: {
    minHeight: '5.5rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  ecosystemCardSpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  ecosystemCardSvg: {
    alignSelf: 'end',
    color: '#91a0bc',
  },

  insightNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(124,92,255,.08)',
    fontSize: '.59rem',
  },

  notificationFilters: {
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

  notificationList: {
    display: 'grid',
    gap: '.4rem',
  },

  notificationRow: {
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

  notificationIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.1)',
  },

  notificationCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  notificationCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  notificationCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
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
};