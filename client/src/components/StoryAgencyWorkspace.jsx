import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FolderOpen,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Sparkles,
  Target,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', LayoutDashboard],
  ['team', 'Team', Users],
  ['creators', 'Creators', UserPlus],
  ['campaigns', 'Campaigns', Target],
  ['calendar', 'Calendar', CalendarDays],
  ['tasks', 'Tasks', Check],
  ['assets', 'Assets', FolderOpen],
  ['approvals', 'Approvals', FileCheck2],
  ['revenue', 'Revenue', CircleDollarSign],
  ['assistant', 'AI Assistant', Sparkles],
];

const TASK_COLUMNS = [
  'Backlog',
  'Planned',
  'In Progress',
  'Review',
  'Approved',
  'Published',
];

const APPROVAL_STAGES = [
  'Draft',
  'Internal Review',
  'Brand Review',
  'Revisions',
  'Approved',
  'Scheduled',
  'Published',
];

const ASSET_CATEGORIES = [
  'Brand Logos',
  'Product Photos',
  'Videos',
  'Music',
  'Templates',
  'Stickers',
  'Fonts',
  'Contracts',
  'Invoices',
];

function valueOf(input) {
  return Number(input) || 0;
}

function formatMoney(input, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(valueOf(input));
  } catch {
    return `${currency} ${Math.round(valueOf(input))}`;
  }
}

function formatDate(input) {
  if (!input) return 'Not set';

  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizeTask(task, index) {
  return {
    ...task,
    id: task?.id || `task-${index}`,
    title: task?.title || task?.name || 'Workspace task',
    column: task?.column || task?.status || 'Backlog',
    priority: task?.priority || 'Medium',
    assignee: task?.assignee || task?.assignedTo || '',
    dueDate: task?.dueDate || task?.due_date || null,
  };
}

function normalizeCreator(creator, index) {
  return {
    ...creator,
    id: creator?.id || `creator-${index}`,
    name: creator?.name || creator?.username || 'Creator',
    views: valueOf(creator?.views || creator?.storyViews),
    engagement: valueOf(creator?.engagement),
    earnings: valueOf(creator?.earnings),
    activeCampaigns: valueOf(creator?.activeCampaigns),
    queue: valueOf(creator?.queue || creator?.contentQueue),
    status: creator?.status || 'Active',
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

export default function StoryAgencyWorkspace({
  workspace = {},
  teamMembers = [],
  creators = [],
  campaigns = [],
  tasks = [],
  calendar = [],
  assets = [],
  analytics = {},
  revenue = {},
  notifications = [],
  onInviteMember,
  onAssignTask,
  onOpenCreator,
  onOpenCampaign,
  onOpenCalendar,
  onClose,
}) {
  const [activeModule, setActiveModule] = useState('overview');
  const [search, setSearch] = useState('');
  const [assetCategory, setAssetCategory] =
    useState('All');
  const [taskColumn, setTaskColumn] =
    useState('Backlog');
  const [notice, setNotice] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] =
    useState('');

  const normalizedCreators = useMemo(
    () => creators.map(normalizeCreator),
    [creators]
  );

  const normalizedTasks = useMemo(
    () => tasks.map(normalizeTask),
    [tasks]
  );

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const category =
        asset?.category || 'Uncategorized';
      const searchable = [
        asset?.name,
        asset?.title,
        category,
        asset?.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (assetCategory === 'All' ||
          category === assetCategory) &&
        (!search ||
          searchable.includes(search.toLowerCase()))
      );
    });
  }, [assetCategory, assets, search]);

  const activeCampaigns = campaigns.filter(
    (campaign) =>
      campaign?.status === 'Active' ||
      campaign?.status === 'Running'
  );

  const pendingApprovals = campaigns.filter(
    (campaign) =>
      campaign?.approvalStatus &&
      !['Approved', 'Published'].includes(
        campaign.approvalStatus
      )
  );

  const monthlyRevenue =
    valueOf(revenue.monthlyRevenue) ||
    valueOf(analytics.monthlyRevenue);

  const totalRevenue =
    valueOf(revenue.totalRevenue) ||
    valueOf(analytics.totalRevenue);

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const inviteMember = () => {
    if (!memberEmail.trim()) {
      showNotice('Enter a team member email.');
      return;
    }

    onInviteMember?.({
      email: memberEmail.trim(),
      workspaceId: workspace.id || workspace.workspaceId,
      status: 'Invited',
    });

    setMemberEmail('');
    setInviteOpen(false);
    showNotice('Invitation prepared.');
  };

  const createTask = () => {
    if (!taskTitle.trim()) {
      showNotice('Enter a task title.');
      return;
    }

    onAssignTask?.({
      title: taskTitle.trim(),
      column: taskColumn,
      assignee: taskAssignee,
      priority: 'Medium',
      workspaceId: workspace.id || workspace.workspaceId,
    });

    setTaskTitle('');
    setTaskAssignee('');
    setTaskOpen(false);
    showNotice('Task created and assigned.');
  };

  const renderOverview = () => (
    <>
      <section style={styles.metricGrid}>
        <MetricCard
          label="Active Creators"
          value={normalizedCreators.length}
          icon={UserPlus}
          color="#4dd7ff"
        />
        <MetricCard
          label="Team Members"
          value={teamMembers.length}
          icon={Users}
          color="#a895ff"
        />
        <MetricCard
          label="Active Campaigns"
          value={activeCampaigns.length}
          icon={Target}
          color="#82e9c1"
        />
        <MetricCard
          label="Scheduled Stories"
          value={valueOf(
            analytics.scheduledStories
          )}
          icon={CalendarDays}
          color="#ffd27d"
        />
        <MetricCard
          label="Pending Approvals"
          value={pendingApprovals.length}
          icon={FileCheck2}
          color="#ff9f72"
        />
        <MetricCard
          label="Monthly Revenue"
          value={formatMoney(monthlyRevenue)}
          icon={CircleDollarSign}
          color="#82e9c1"
        />
        <MetricCard
          label="Workspace Growth"
          value={`${valueOf(
            analytics.workspaceGrowth
          )}%`}
          icon={Activity}
          color="#ff4fd8"
        />
        <MetricCard
          label="Client Satisfaction"
          value={
            analytics.clientSatisfaction
              ? `${analytics.clientSatisfaction}%`
              : 'Foundation'
          }
          icon={MessageSquare}
          color="#9deeff"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Workspace Pulse"
          subtitle="Current agency operations at a glance."
          icon={Activity}
        />

        <div style={styles.pulseGrid}>
          <PulseItem
            label="Content queue"
            value={`${normalizedCreators.reduce(
              (sum, creator) => sum + creator.queue,
              0
            )} stories`}
            color="#4dd7ff"
          />
          <PulseItem
            label="Open tasks"
            value={`${normalizedTasks.filter(
              (task) => task.column !== 'Published'
            ).length} tasks`}
            color="#a895ff"
          />
          <PulseItem
            label="Revenue forecast"
            value={formatMoney(
              revenue.forecast ||
                analytics.revenueForecast
            )}
            color="#82e9c1"
          />
        </div>
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="AI Workspace Assistant"
          subtitle="Operational recommendations for your team."
          icon={Sparkles}
        />

        <div style={styles.insightList}>
          <Insight
            text="Creator A should post tonight based on audience activity."
          />
          <Insight
            text="One campaign is behind schedule. Reassign editing capacity to reduce delays."
          />
          <Insight
            text="Your highest-ROI brand should receive an expanded budget proposal."
          />
          <Insight
            text="Move review tasks into the shared approval queue before tomorrow."
          />
        </div>
      </section>
    </>
  );

  const renderTeam = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Team"
        subtitle="Roles, capacity, and current activity."
        icon={Users}
        action={
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Invite
          </button>
        }
      />

      <div style={styles.memberList}>
        {teamMembers.length ? (
          teamMembers.map((member, index) => (
            <div
              key={member.id || index}
              style={styles.memberRow}
            >
              <Avatar item={member} />
              <div style={styles.memberCopy}>
                <strong>
                  {member.name || member.fullName || 'Team member'}
                </strong>
                <span>
                  {member.role || 'Creator'} ·{' '}
                  {member.status || 'Active'}
                </span>
                <small>
                  {valueOf(member.currentTasks)} current tasks ·
                  Last active {member.lastActive || 'Recently'}
                </small>
              </div>
              <StatusDot status={member.status} />
            </div>
          ))
        ) : (
          <Empty label="No team members yet." />
        )}
      </div>
    </section>
  );

  const renderCreators = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Creators"
        subtitle="Manage creator performance and capacity."
        icon={UserPlus}
      />

      <div style={styles.creatorGrid}>
        {normalizedCreators.length ? (
          normalizedCreators.map((creator) => (
            <button
              type="button"
              key={creator.id}
              onClick={() => onOpenCreator?.(creator)}
              style={styles.creatorCard}
            >
              <Avatar item={creator} />
              <strong>{creator.name}</strong>
              <span>{creator.status}</span>
              <div style={styles.creatorStats}>
                <Stat label="Views" value={creator.views} />
                <Stat
                  label="Engagement"
                  value={`${creator.engagement}%`}
                />
                <Stat
                  label="Earnings"
                  value={formatMoney(creator.earnings)}
                />
              </div>
              <small>
                {creator.activeCampaigns} campaigns ·{' '}
                {creator.queue} queued stories
              </small>
            </button>
          ))
        ) : (
          <Empty label="No creators connected yet." />
        )}
      </div>
    </section>
  );

  const renderCampaigns = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Campaigns"
        subtitle="Coordinate brands, creators, and deliverables."
        icon={Target}
      />

      <div style={styles.campaignList}>
        {campaigns.length ? (
          campaigns.map((campaign, index) => (
            <button
              type="button"
              key={campaign.id || index}
              onClick={() => onOpenCampaign?.(campaign)}
              style={styles.campaignRow}
            >
              <span style={styles.campaignIcon}>
                <Target size={17} />
              </span>
              <span style={styles.campaignCopy}>
                <strong>
                  {campaign.name ||
                    campaign.title ||
                    'Campaign'}
                </strong>
                <span>
                  {campaign.brand || 'Brand'} ·{' '}
                  {campaign.status || 'Planned'}
                </span>
                <small>
                  {valueOf(campaign.progress)}% progress ·{' '}
                  {valueOf(campaign.deliverablesCompleted)}/
                  {valueOf(campaign.deliverables)} deliverables
                </small>
              </span>
              <strong>
                {formatMoney(campaign.budget)}
              </strong>
              <ChevronRight size={15} />
            </button>
          ))
        ) : (
          <Empty label="No campaigns yet." />
        )}
      </div>
    </section>
  );

  const renderCalendar = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Content Calendar"
        subtitle="Multi-creator publishing and campaign timeline."
        icon={CalendarDays}
        action={
          <button
            type="button"
            onClick={() => onOpenCalendar?.(calendar)}
            style={styles.smallButton}
          >
            Open calendar
            <ChevronRight size={14} />
          </button>
        }
      />

      <div style={styles.calendarList}>
        {calendar.length ? (
          calendar.map((event, index) => (
            <button
              type="button"
              key={event.id || index}
              onClick={() => onOpenCalendar?.(event)}
              style={styles.calendarRow}
            >
              <span style={styles.dateBlock}>
                <strong>
                  {event.date
                    ? new Date(event.date).getDate()
                    : '—'}
                </strong>
                <small>
                  {event.date
                    ? new Date(event.date).toLocaleDateString(
                        undefined,
                        { month: 'short' }
                      )
                    : 'Date'}
                </small>
              </span>
              <span style={styles.calendarCopy}>
                <strong>
                  {event.title || event.name || 'Calendar event'}
                </strong>
                <span>
                  {event.type || 'Publishing window'} ·{' '}
                  {event.creator || 'Team'}
                </span>
              </span>
              <Clock3 size={15} />
            </button>
          ))
        ) : (
          <Empty label="No calendar events yet." />
        )}
      </div>
    </section>
  );

  const renderTasks = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Collaborative Tasks"
        subtitle="Assign work across the agency."
        icon={Check}
        action={
          <button
            type="button"
            onClick={() => setTaskOpen(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            New task
          </button>
        }
      />

      <div style={styles.stageTabs}>
        {TASK_COLUMNS.map((column) => (
          <button
            type="button"
            key={column}
            onClick={() => setTaskColumn(column)}
            aria-pressed={taskColumn === column}
            style={{
              ...styles.stageButton,
              ...(taskColumn === column
                ? styles.activeStageButton
                : {}),
            }}
          >
            {column}
          </button>
        ))}
      </div>

      <div style={styles.taskList}>
        {normalizedTasks
          .filter((task) => task.column === taskColumn)
          .map((task) => (
            <div key={task.id} style={styles.taskRow}>
              <span style={styles.taskCheck}>
                {task.column === 'Published' ? (
                  <Check size={13} />
                ) : null}
              </span>
              <span style={styles.taskCopy}>
                <strong>{task.title}</strong>
                <span>
                  {task.assignee || 'Unassigned'} ·{' '}
                  {task.priority}
                </span>
                <small>Due {formatDate(task.dueDate)}</small>
              </span>
              <MoreHorizontal size={15} />
            </div>
          ))}

        {!normalizedTasks.some(
          (task) => task.column === taskColumn
        ) ? (
          <Empty label={`No tasks in ${taskColumn}.`} />
        ) : null}
      </div>
    </section>
  );

  const renderAssets = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Shared Assets"
        subtitle="Centralized library for agency resources."
        icon={FolderOpen}
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search assets"
          aria-label="Search shared assets"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.categoryTabs}>
        {['All', ...ASSET_CATEGORIES].map((category) => (
          <button
            type="button"
            key={category}
            onClick={() => setAssetCategory(category)}
            aria-pressed={assetCategory === category}
            style={{
              ...styles.categoryButton,
              ...(assetCategory === category
                ? styles.activeCategoryButton
                : {}),
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div style={styles.assetGrid}>
        {filteredAssets.length ? (
          filteredAssets.map((asset, index) => (
            <div
              key={asset.id || index}
              style={styles.assetCard}
            >
              {asset.thumbnail || asset.url ? (
                <img
                  src={asset.thumbnail || asset.url}
                  alt={asset.name || 'Shared asset'}
                  loading="lazy"
                  style={styles.assetImage}
                />
              ) : (
                <div style={styles.assetPlaceholder}>
                  <ImageIcon size={23} />
                </div>
              )}
              <strong>
                {asset.name || asset.title || 'Untitled asset'}
              </strong>
              <span>
                {asset.category || 'Uncategorized'}
              </span>
            </div>
          ))
        ) : (
          <Empty label="No matching assets." />
        )}
      </div>
    </section>
  );

  const renderApprovals = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Approvals"
        subtitle="Move content from draft to published."
        icon={FileCheck2}
      />

      <div style={styles.approvalList}>
        {campaigns.length ? (
          campaigns.map((campaign, index) => {
            const stage =
              campaign.approvalStatus || 'Draft';

            return (
              <div
                key={campaign.id || index}
                style={styles.approvalRow}
              >
                <span style={styles.approvalIcon}>
                  <FileCheck2 size={16} />
                </span>
                <span style={styles.approvalCopy}>
                  <strong>
                    {campaign.name ||
                      campaign.title ||
                      'Campaign approval'}
                  </strong>
                  <span>
                    {campaign.approver || 'Approver foundation'} ·{' '}
                    {campaign.approvalUpdatedAt
                      ? formatDate(
                          campaign.approvalUpdatedAt
                        )
                      : 'Awaiting update'}
                  </span>
                </span>
                <span style={styles.approvalStatus}>
                  {APPROVAL_STAGES.includes(stage)
                    ? stage
                    : 'Draft'}
                </span>
              </div>
            );
          })
        ) : (
          <Empty label="No approval requests." />
        )}
      </div>
    </section>
  );

  const renderRevenue = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Revenue"
        subtitle="Agency financial performance foundation."
        icon={CircleDollarSign}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Total Revenue"
          value={formatMoney(totalRevenue)}
          icon={CircleDollarSign}
          color="#82e9c1"
        />
        <MetricCard
          label="Creator Payouts"
          value={formatMoney(revenue.creatorPayouts)}
          icon={Users}
          color="#a895ff"
        />
        <MetricCard
          label="Agency Commission"
          value={formatMoney(
            revenue.agencyCommission
          )}
          icon={BarChart3}
          color="#4dd7ff"
        />
        <MetricCard
          label="Pending Invoices"
          value={formatMoney(revenue.pendingInvoices)}
          icon={Clock3}
          color="#ffd27d"
        />
      </div>

      <div style={styles.revenuePanel}>
        <div>
          <span>Campaign profitability</span>
          <strong>
            {revenue.profitability || 'Foundation ready'}
          </strong>
        </div>
        <div>
          <span>Forecast</span>
          <strong>
            {formatMoney(revenue.forecast)}
          </strong>
        </div>
      </div>
    </section>
  );

  const renderAssistant = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Workspace Assistant"
        subtitle="Operational intelligence for your agency."
        icon={Sparkles}
      />

      <div style={styles.assistantHero}>
        <Sparkles size={21} />
        <div>
          <strong>
            Your workspace has optimization opportunities.
          </strong>
          <span>
            These recommendations are ready for future AI
            project management workflows.
          </span>
        </div>
      </div>

      <div style={styles.insightList}>
        <Insight text="Creator A should post tonight based on current audience activity." />
        <Insight text="Campaign X is behind schedule. Reassign editing work to the next available editor." />
        <Insight text="Brand Y has the highest ROI across recent campaigns." />
        <Insight text="Increase the budget proposal for Creator B's strongest content category." />
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'team') return renderTeam();
    if (activeModule === 'creators') return renderCreators();
    if (activeModule === 'campaigns') return renderCampaigns();
    if (activeModule === 'calendar') return renderCalendar();
    if (activeModule === 'tasks') return renderTasks();
    if (activeModule === 'assets') return renderAssets();
    if (activeModule === 'approvals') return renderApprovals();
    if (activeModule === 'revenue') return renderRevenue();
    if (activeModule === 'assistant') return renderAssistant();

    return <Empty label="Workspace module ready." />;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close agency workspace"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>
            {workspace.name || 'Agency Workspace'}
          </strong>
          <span>
            {workspace.description ||
              'Creators, campaigns, and operations'}
          </span>
        </div>

        <button
          type="button"
          aria-label="Workspace notifications"
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

      {inviteOpen ? (
        <Modal
          title="Invite Team Member"
          onClose={() => setInviteOpen(false)}
        >
          <label style={styles.field}>
            Email address
            <input
              autoFocus
              type="email"
              value={memberEmail}
              onChange={(event) =>
                setMemberEmail(event.target.value)
              }
              placeholder="member@agency.com"
              style={styles.textInput}
            />
          </label>

          <button
            type="button"
            onClick={inviteMember}
            style={styles.primaryButton}
          >
            <Send size={15} />
            Send invitation
          </button>
        </Modal>
      ) : null}

      {taskOpen ? (
        <Modal
          title="Create Team Task"
          onClose={() => setTaskOpen(false)}
        >
          <label style={styles.field}>
            Task title
            <input
              autoFocus
              value={taskTitle}
              onChange={(event) =>
                setTaskTitle(event.target.value)
              }
              placeholder="Review sponsored story"
              style={styles.textInput}
            />
          </label>

          <label style={styles.field}>
            Assign to
            <select
              value={taskAssignee}
              onChange={(event) =>
                setTaskAssignee(event.target.value)
              }
              style={styles.select}
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member, index) => (
                <option
                  key={member.id || index}
                  value={member.name || member.fullName}
                >
                  {member.name || member.fullName}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            Column
            <select
              value={taskColumn}
              onChange={(event) =>
                setTaskColumn(event.target.value)
              }
              style={styles.select}
            >
              {TASK_COLUMNS.map((column) => (
                <option key={column}>{column}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={createTask}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create task
          </button>
        </Modal>
      ) : null}

      <style>{`
        @keyframes aarush-agency-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-agency-module:hover,
        .aarush-agency-card:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-agency-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-agency-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-agency-quick {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-agency-creators {
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

function PulseItem({ label, value, color }) {
  return (
    <div style={styles.pulseItem}>
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

function Insight({ text }) {
  return (
    <div style={styles.insight}>
      <Sparkles size={15} />
      <span>{text}</span>
      <ChevronRight
        size={14}
        style={{ marginLeft: 'auto' }}
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <span style={styles.stat}>
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function StatusDot({ status }) {
  const active =
    !status ||
    ['Active', 'Online', 'Available'].includes(status);

  return (
    <span
      aria-label={active ? 'Active' : 'Inactive'}
      style={{
        ...styles.statusDot,
        background: active ? '#82e9c1' : '#91a0bc',
      }}
    />
  );
}

function Avatar({ item }) {
  if (item?.avatar || item?.image || item?.photo) {
    return (
      <img
        src={item.avatar || item.image || item.photo}
        alt=""
        loading="lazy"
        style={styles.avatar}
      />
    );
  }

  return (
    <span style={styles.avatarFallback}>
      {String(item?.name || item?.fullName || 'A')
        .charAt(0)
        .toUpperCase()}
    </span>
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
      <FolderOpen size={25} />
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

  heading: {
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  notificationDot: {
    position: 'absolute',
    top: '.4rem',
    right: '.42rem',
    width: '.4rem',
    height: '.4rem',
    borderRadius: '999px',
    background: '#ff4f82',
  },

  content: {
    width: 'min(100%, 1120px)',
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
    fontSize: '.59rem',
    cursor: 'pointer',
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
    minHeight: '6.5rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    background: 'rgba(15,19,30,.9)',
    animation: 'aarush-agency-in 240ms ease both',
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
    fontSize: '.82rem',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-agency-in 240ms ease both',
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
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  pulseItem: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.35rem',
    minHeight: '2.8rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.6rem',
  },

  pulseDot: {
    width: '.45rem',
    height: '.45rem',
    borderRadius: '999px',
  },

  pulseItemStrong: {
    color: '#fff',
    fontSize: '.62rem',
  },

  insightList: {
    display: 'grid',
    gap: '.4rem',
  },

  insight: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.6rem',
    padding: '0 .6rem',
    border: '1px solid rgba(124,92,255,.15)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.62rem',
  },

  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  quickButton: {
    minHeight: '4.2rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.3rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.8rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
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

  smallButton: {
    minHeight: '2.25rem',
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
    fontSize: '.6rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  memberList: {
    display: 'grid',
    gap: '.4rem',
  },

  memberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  memberCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  memberCopySpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  memberCopySmall: {
    color: '#6f7d98',
    fontSize: '.55rem',
  },

  avatar: {
    width: '2.55rem',
    height: '2.55rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '999px',
  },

  avatarFallback: {
    width: '2.55rem',
    height: '2.55rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  statusDot: {
    width: '.55rem',
    height: '.55rem',
    flexShrink: 0,
    borderRadius: '999px',
  },

  creatorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.5rem',
  },

  creatorCard: {
    display: 'grid',
    justifyItems: 'start',
    gap: '.25rem',
    padding: '.7rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.85rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  creatorCardSpan: {
    color: '#82e9c1',
    fontSize: '.57rem',
  },

  creatorCardSmall: {
    color: '#91a0bc',
    fontSize: '.56rem',
  },

  creatorStats: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.25rem',
    margin: '.2rem 0',
  },

  stat: {
    display: 'grid',
    gap: '.13rem',
  },

  statSmall: {
    color: '#91a0bc',
    fontSize: '.49rem',
  },

  statStrong: {
    color: '#fff',
    fontSize: '.58rem',
  },

  campaignList: {
    display: 'grid',
    gap: '.4rem',
  },

  campaignRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  campaignIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  campaignCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  campaignCopySpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  campaignCopySmall: {
    color: '#6f7d98',
    fontSize: '.55rem',
  },

  calendarList: {
    display: 'grid',
    gap: '.4rem',
  },

  calendarRow: {
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

  dateBlock: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  dateBlockSmall: {
    fontSize: '.5rem',
  },

  calendarCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  calendarCopySpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  stageTabs: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.3rem',
  },

  stageButton: {
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

  activeStageButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  taskList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  taskRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
  },

  taskCheck: {
    width: '1.45rem',
    height: '1.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(130,233,193,.25)',
    borderRadius: '.4rem',
    color: '#82e9c1',
  },

  taskCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  taskCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  taskCopySmall: {
    color: '#6f7d98',
    fontSize: '.55rem',
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

  categoryTabs: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.45rem',
  },

  categoryButton: {
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

  activeCategoryButton: {
    borderColor: 'rgba(77,215,255,.35)',
    color: '#fff',
    background: 'rgba(77,215,255,.12)',
  },

  assetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  assetCard: {
    display: 'grid',
    gap: '.22rem',
    padding: '.4rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  assetCardSpan: {
    color: '#91a0bc',
    fontSize: '.52rem',
  },

  assetImage: {
    width: '100%',
    height: '4.2rem',
    objectFit: 'cover',
    borderRadius: '.5rem',
  },

  assetPlaceholder: {
    height: '4.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.5rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.08)',
  },

  approvalList: {
    display: 'grid',
    gap: '.4rem',
  },

  approvalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  approvalIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.1)',
  },

  approvalCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  approvalCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  approvalStatus: {
    padding: '.25rem .4rem',
    borderRadius: '999px',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.53rem',
  },

  revenuePanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.5rem',
    marginTop: '.7rem',
  },

  revenuePanelDiv: {
    display: 'grid',
    gap: '.2rem',
    padding: '.7rem',
    border: '1px solid rgba(130,233,193,.15)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(130,233,193,.05)',
    fontSize: '.59rem',
  },

  revenuePanelStrong: {
    color: '#c7ffe4',
    fontSize: '.7rem',
  },

  assistantHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.75rem',
    border: '1px solid rgba(124,92,255,.2)',
    borderRadius: '.8rem',
    color: '#c9f9ff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.13),rgba(77,215,255,.06))',
  },

  assistantHeroDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  assistantHeroSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
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
    marginTop: '.6rem',
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
}; 