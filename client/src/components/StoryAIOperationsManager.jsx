import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Gauge,
  Layers3,
  Network,
  Pause,
  Play,
  Plus,
  RotateCw,
  Settings2,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['status', 'Status', Activity],
  ['workflows', 'Workflows', Network],
  ['pipeline', 'Pipeline', Layers3],
  ['resources', 'Resources', Users],
  ['efficiency', 'Efficiency', Gauge],
  ['campaigns', 'Campaigns', Target],
  ['risks', 'Risk Monitor', AlertTriangle],
  ['revenue', 'Revenue Ops', CircleDollarSign],
  ['recommendations', 'AI Insights', Sparkles],
];

const PIPELINE_STAGES = [
  'Idea',
  'Draft',
  'Editing',
  'Review',
  'Approval',
  'Scheduled',
  'Published',
  'Archived',
];

const WORKFLOW_MODES = [
  'Manual',
  'Assisted',
  'Smart Automation',
  'Fully Autonomous',
];

const DEFAULT_AUTOMATIONS = [
  ['auto-editor', 'Auto assign editor', 'Assign task'],
  ['auto-schedule', 'Auto schedule stories', 'Schedule story'],
  ['auto-publish', 'Auto publish approved content', 'Publish story'],
  ['auto-approval', 'Auto request brand approval', 'Notify team'],
  ['auto-reports', 'Auto generate reports', 'Generate report'],
  ['auto-archive', 'Auto archive campaigns', 'Archive campaign'],
  ['auto-notify', 'Auto notify team', 'Notify team'],
];

const RISK_ITEMS = [
  ['Deadline risk', 'Campaign deadlines may need attention.', 'High'],
  ['Creator overload', 'Workload balancing is recommended.', 'Medium'],
  ['Asset missing', 'Some deliverables need asset verification.', 'Medium'],
  ['Approval blocked', 'Approval queue contains pending work.', 'High'],
  ['Brand response delay', 'Response-time monitoring is active.', 'Low'],
  ['Revenue delay', 'Payment tracking foundation is active.', 'Medium'],
  ['Publishing conflict', 'Schedule conflict detection is ready.', 'Low'],
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

function normalizeTask(task, index) {
  return {
    ...task,
    id: task?.id || `task-${index}`,
    title: task?.title || task?.name || 'Operations task',
    stage: task?.stage || task?.status || 'Idea',
    priority: task?.priority || 'Medium',
    assignee: task?.assignee || task?.assignedTo || '',
  };
}

function normalizeWorkflow(workflow, index) {
  return {
    ...workflow,
    id: workflow?.id || `workflow-${index}`,
    name: workflow?.name || workflow?.title || 'Automation workflow',
    enabled: workflow?.enabled !== false,
    mode: workflow?.mode || 'Assisted',
    trigger: workflow?.trigger || 'Story approved',
    action: workflow?.action || 'Notify team',
    runs: numeric(workflow?.runs),
  };
}

function formatDate(value) {
  if (!value) return 'Not set';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not set';

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

export default function StoryAIOperationsManager({
  workspace = {},
  teamMembers = [],
  creators = [],
  campaigns = [],
  tasks = [],
  calendar = [],
  assets = [],
  analytics = {},
  revenue = {},
  automationRules = [],
  onCreateAutomation,
  onRunOptimization,
  onApproveWorkflow,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('status');
  const [workflowMode, setWorkflowMode] =
    useState('Assisted');
  const [notice, setNotice] = useState('');
  const [workflowOpen, setWorkflowOpen] =
    useState(false);
  const [workflowName, setWorkflowName] =
    useState('');
  const [workflowTrigger, setWorkflowTrigger] =
    useState('Story approved');
  const [workflowAction, setWorkflowAction] =
    useState('Notify team');

  const normalizedTasks = useMemo(
    () => tasks.map(normalizeTask),
    [tasks]
  );

  const normalizedWorkflows = useMemo(
    () =>
      [...automationRules, ...DEFAULT_AUTOMATIONS].map(
        normalizeWorkflow
      ),
    [automationRules]
  );

  const activeWorkflows = useMemo(
    () =>
      normalizedWorkflows.filter(
        (workflow) => workflow.enabled
      ),
    [normalizedWorkflows]
  );

  const pipelineCounts = useMemo(() => {
    return PIPELINE_STAGES.reduce((result, stage) => {
      result[stage] = normalizedTasks.filter(
        (task) => task.stage === stage
      ).length;
      return result;
    }, {});
  }, [normalizedTasks]);

  const completedTasks = useMemo(
    () =>
      normalizedTasks.filter(
        (task) =>
          ['Published', 'Archived', 'Completed'].includes(
            task.stage
          )
      ).length,
    [normalizedTasks]
  );

  const bottlenecks = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => ({
      stage,
      count: pipelineCounts[stage] || 0,
      risk:
        (pipelineCounts[stage] || 0) >= 4
          ? 'High'
          : (pipelineCounts[stage] || 0) >= 2
            ? 'Medium'
            : 'Low',
    })).sort((a, b) => b.count - a.count);
  }, [pipelineCounts]);

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const runOptimization = async () => {
    await onRunOptimization?.({
      workspaceId: workspace.id || workspace.workspaceId,
      workflowMode,
      optimizationCycle: new Date().toISOString(),
      pipelineCounts,
      resourceAllocation: {
        teamMembers: teamMembers.length,
        creators: creators.length,
        tasks: normalizedTasks.length,
      },
    });

    showNotice('Optimization cycle started.');
  };

  const createWorkflow = () => {
    if (!workflowName.trim()) {
      showNotice('Enter a workflow name.');
      return;
    }

    onCreateAutomation?.({
      id: `automation-${Date.now()}`,
      name: workflowName.trim(),
      trigger: workflowTrigger,
      action: workflowAction,
      mode: workflowMode,
      enabled: true,
      workspaceId: workspace.id || workspace.workspaceId,
    });

    setWorkflowName('');
    setWorkflowOpen(false);
    showNotice('Automation workflow created.');
  };

  const renderStatus = () => (
    <>
      <section style={styles.statusHero}>
        <div style={styles.statusOrb}>
          <Bot size={30} />
        </div>
        <div style={styles.statusCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Aarush AI Operations
          </span>
          <h1>Operations intelligence active</h1>
          <p>
            Monitoring workflows, coordinating resources,
            and preparing optimization opportunities.
          </p>
          <div style={styles.statusMeta}>
            <span>
              <Activity size={13} />
              {activeWorkflows.length} active automations
            </span>
            <span>
              <RotateCw size={13} />
              Last cycle:{' '}
              {analytics.lastOptimization || 'Foundation'}
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Monitoring"
          value="Active"
          icon={Activity}
          color="#4dd7ff"
        />
        <MetricCard
          label="Optimizing"
          value="Ready"
          icon={Gauge}
          color="#a895ff"
        />
        <MetricCard
          label="Scheduling"
          value={`${numeric(
            analytics.scheduledStories
          )} queued`}
          icon={CalendarClock}
          color="#ffd27d"
        />
        <MetricCard
          label="Publishing"
          value="Coordinated"
          icon={Play}
          color="#82e9c1"
        />
        <MetricCard
          label="Coordinating"
          value={`${teamMembers.length} members`}
          icon={Users}
          color="#9deeff"
        />
        <MetricCard
          label="Predicting"
          value={`${numeric(
            analytics.forecastConfidence
          )}%`}
          icon={BarChart3}
          color="#ff4fd8"
        />
        <MetricCard
          label="Learning"
          value="Continuous"
          icon={Sparkles}
          color="#ff9f72"
        />
        <MetricCard
          label="Efficiency"
          value={`${numeric(
            analytics.efficiencyScore
          )}%`}
          icon={Zap}
          color="#82e9c1"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Operations Control"
          subtitle="Choose how much autonomy the workspace should use."
          icon={Settings2}
          action={
            <button
              type="button"
              onClick={runOptimization}
              style={styles.smallPrimary}
            >
              <RotateCw size={14} />
              Run optimization
            </button>
          }
        />

        <div style={styles.modeGrid}>
          {WORKFLOW_MODES.map((mode) => (
            <button
              type="button"
              key={mode}
              onClick={() => setWorkflowMode(mode)}
              aria-pressed={workflowMode === mode}
              style={{
                ...styles.modeButton,
                ...(workflowMode === mode
                  ? styles.activeModeButton
                  : {}),
              }}
            >
              <span>
                {mode === 'Fully Autonomous' ? (
                  <Zap size={16} />
                ) : (
                  <Settings2 size={16} />
                )}
              </span>
              {mode}
            </button>
          ))}
        </div>
      </section>
    </>
  );

  const renderWorkflows = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Autonomous Workflows"
        subtitle="Automation rules for repetitive operations."
        icon={Network}
        action={
          <button
            type="button"
            onClick={() => setWorkflowOpen(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            New workflow
          </button>
        }
      />

      <div style={styles.workflowList}>
        {normalizedWorkflows.map((workflow) => (
          <div
            key={workflow.id}
            style={styles.workflowRow}
          >
            <span style={styles.workflowIcon}>
              {workflow.enabled ? (
                <Play size={15} />
              ) : (
                <Pause size={15} />
              )}
            </span>
            <span style={styles.workflowCopy}>
              <strong>{workflow.name}</strong>
              <span>
                When {workflow.trigger} → {workflow.action}
              </span>
              <small>
                {workflow.mode} · {workflow.runs} runs
              </small>
            </span>
            <button
              type="button"
              onClick={() => {
                onApproveWorkflow?.(workflow);
                showNotice(
                  workflow.enabled
                    ? 'Workflow paused.'
                    : 'Workflow enabled.'
                );
              }}
              style={{
                ...styles.workflowToggle,
                ...(workflow.enabled
                  ? styles.enabledToggle
                  : {}),
              }}
              aria-label={`Toggle ${workflow.name}`}
            >
              {workflow.enabled ? 'On' : 'Off'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  const renderPipeline = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Publishing Pipeline"
        subtitle="Visualize content flow and bottlenecks."
        icon={Layers3}
      />

      <div style={styles.pipeline}>
        {PIPELINE_STAGES.map((stage) => {
          const count = pipelineCounts[stage] || 0;
          const bottleneck = bottlenecks.find(
            (item) => item.stage === stage
          );

          return (
            <div
              key={stage}
              style={styles.pipelineColumn}
            >
              <div style={styles.pipelineHeader}>
                <span>{stage}</span>
                <strong>{count}</strong>
              </div>
              <div style={styles.pipelineBar}>
                <span
                  style={{
                    ...styles.pipelineFill,
                    width: `${Math.min(100, count * 20)}%`,
                  }}
                />
              </div>
              <small>
                {bottleneck?.risk === 'High'
                  ? 'Bottleneck detected'
                  : count
                    ? 'On track'
                    : 'Ready for input'}
              </small>
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderResources = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Resource Allocation"
        subtitle="Balance creator and team workload."
        icon={Users}
      />

      <div style={styles.resourceList}>
        <ResourceRow
          label="Editor utilization"
          value={analytics.editorUtilization}
        />
        <ResourceRow
          label="Designer utilization"
          value={analytics.designerUtilization}
        />
        <ResourceRow
          label="Creator workload"
          value={analytics.creatorWorkload}
        />
        <ResourceRow
          label="Manager capacity"
          value={analytics.managerCapacity}
        />
        <ResourceRow
          label="Asset availability"
          value={analytics.assetAvailability}
        />
      </div>

      <div style={styles.suggestion}>
        <Sparkles size={16} />
        <span>
          AI suggestion: distribute review tasks across
          available managers to reduce approval delay.
        </span>
      </div>
    </section>
  );

  const renderEfficiency = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Team Efficiency"
        subtitle="Productivity and collaboration indicators."
        icon={Gauge}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Tasks completed"
          value={completedTasks}
          icon={Check}
          color="#82e9c1"
        />
        <MetricCard
          label="Avg turnaround"
          value={
            analytics.averageTurnaround || 'Foundation'
          }
          icon={Clock3}
          color="#4dd7ff"
        />
        <MetricCard
          label="Approval delay"
          value={analytics.approvalDelay || 'Foundation'}
          icon={FileCheck2}
          color="#ffd27d"
        />
        <MetricCard
          label="Publishing consistency"
          value={
            analytics.publishingConsistency
              ? `${analytics.publishingConsistency}%`
              : 'Foundation'
          }
          icon={CalendarClock}
          color="#a895ff"
        />
        <MetricCard
          label="Collaboration score"
          value={
            analytics.collaborationScore
              ? `${analytics.collaborationScore}%`
              : 'Foundation'
          }
          icon={Users}
          color="#9deeff"
        />
        <MetricCard
          label="AI efficiency score"
          value={
            analytics.efficiencyScore
              ? `${analytics.efficiencyScore}%`
              : 'Foundation'
          }
          icon={Sparkles}
          color="#ff4fd8"
        />
      </div>
    </section>
  );

  const renderCampaigns = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Campaign Automation"
        subtitle="Automate briefs, deliverables, approvals, and reports."
        icon={Target}
      />

      <div style={styles.campaignAutomation}>
        {[
          ['Assign creators', UserIcon],
          ['Generate briefs', FileIcon],
          ['Schedule deliverables', CalendarClock],
          ['Track approvals', FileCheck2],
          ['Trigger reminders', Bell],
          ['Generate invoices', CircleDollarSign],
          ['Generate reports', BarChart3],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} workflow prepared.`)
            }
            style={styles.automationAction}
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

  const renderRisks = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Risk Monitor"
        subtitle="Operational signals that may need attention."
        icon={AlertTriangle}
      />

      <div style={styles.riskList}>
        {RISK_ITEMS.map(([label, description, severity]) => (
          <div
            key={label}
            style={styles.riskRow}
          >
            <span
              style={{
                ...styles.riskIcon,
                color: riskColor(severity),
                background: `${riskColor(severity)}18`,
              }}
            >
              <AlertTriangle size={16} />
            </span>
            <span style={styles.riskCopy}>
              <strong>{label}</strong>
              <span>{description}</span>
            </span>
            <span
              style={{
                ...styles.severity,
                color: riskColor(severity),
              }}
            >
              {severity}
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderRevenue = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Revenue Operations"
        subtitle="Financial operations and forecast foundation."
        icon={CircleDollarSign}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Pending payouts"
          value={money(revenue.pendingPayouts)}
          icon={Users}
          color="#a895ff"
        />
        <MetricCard
          label="Pending invoices"
          value={money(revenue.pendingInvoices)}
          icon={FileCheck2}
          color="#ffd27d"
        />
        <MetricCard
          label="Campaign profitability"
          value={
            revenue.campaignProfitability ||
            'Foundation'
          }
          icon={BarChart3}
          color="#82e9c1"
        />
        <MetricCard
          label="Creator payouts"
          value={money(revenue.creatorPayouts)}
          icon={CircleDollarSign}
          color="#4dd7ff"
        />
        <MetricCard
          label="Agency commission"
          value={money(revenue.agencyCommission)}
          icon={Target}
          color="#ff4fd8"
        />
        <MetricCard
          label="Forecast variance"
          value={
            revenue.forecastVariance || 'Foundation'
          }
          icon={Activity}
          color="#ff9f72"
        />
      </div>
    </section>
  );

  const renderRecommendations = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Recommendations"
        subtitle="Suggested actions for the next operating cycle."
        icon={Sparkles}
      />

      <div style={styles.recommendationList}>
        {[
          'Reassign editing tasks to reduce delays.',
          'Schedule Creator A for evening publishing.',
          'Campaign X needs approval within 3 hours.',
          'Increase publishing frequency this week.',
          'Allocate more resources to travel content.',
        ].map((recommendation) => (
          <button
            type="button"
            key={recommendation}
            onClick={() => showNotice('Recommendation queued.')}
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
  );

  const renderModule = () => {
    if (activeModule === 'status') return renderStatus();
    if (activeModule === 'workflows') return renderWorkflows();
    if (activeModule === 'pipeline') return renderPipeline();
    if (activeModule === 'resources') return renderResources();
    if (activeModule === 'efficiency') return renderEfficiency();
    if (activeModule === 'campaigns') return renderCampaigns();
    if (activeModule === 'risks') return renderRisks();
    if (activeModule === 'revenue') return renderRevenue();
    if (activeModule === 'recommendations') {
      return renderRecommendations();
    }

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI operations manager"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>
            {workspace.name || 'AI Operations Manager'}
          </strong>
          <span>
            {workspace.description ||
              'The operating brain for your creator workspace'}
          </span>
        </div>

        <button
          type="button"
          aria-label="Operations notifications"
          style={styles.iconButton}
        >
          <Bell size={18} />
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

      {workflowOpen ? (
        <Modal
          title="Create Automation"
          onClose={() => setWorkflowOpen(false)}
        >
          <label style={styles.field}>
            Workflow name
            <input
              autoFocus
              value={workflowName}
              onChange={(event) =>
                setWorkflowName(event.target.value)
              }
              placeholder="Approve and schedule story"
              style={styles.textInput}
            />
          </label>

          <label style={styles.field}>
            Trigger
            <select
              value={workflowTrigger}
              onChange={(event) =>
                setWorkflowTrigger(event.target.value)
              }
              style={styles.select}
            >
              <option>Story approved</option>
              <option>Campaign created</option>
              <option>Deadline approaching</option>
              <option>Revenue received</option>
              <option>Creator inactive</option>
              <option>Asset uploaded</option>
              <option>Analytics threshold reached</option>
            </select>
          </label>

          <label style={styles.field}>
            Action
            <select
              value={workflowAction}
              onChange={(event) =>
                setWorkflowAction(event.target.value)
              }
              style={styles.select}
            >
              <option>Notify team</option>
              <option>Assign task</option>
              <option>Schedule story</option>
              <option>Publish story</option>
              <option>Generate report</option>
              <option>Archive campaign</option>
              <option>Create invoice foundation</option>
            </select>
          </label>

          <button
            type="button"
            onClick={createWorkflow}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create workflow
          </button>
        </Modal>
      ) : null}

      <style>{`
        @keyframes aarush-ops-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-ops-pulse {
          0%, 100% {
            box-shadow: 0 0 14px rgba(77,215,255,.25);
          }
          50% {
            box-shadow: 0 0 34px rgba(124,92,255,.55);
          }
        }

        .aarush-ops-module:hover,
        .aarush-ops-card:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-ops-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-ops-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-ops-modes {
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

function ResourceRow({ label, value }) {
  const numericValue = numeric(value);
  const display =
    value === undefined ||
    value === null ||
    value === ''
      ? 'Foundation'
      : `${numericValue}%`;

  return (
    <div style={styles.resourceRow}>
      <span>{label}</span>
      <div style={styles.resourceTrack}>
        <span
          style={{
            ...styles.resourceFill,
            width: `${Math.min(100, numericValue)}%`,
          }}
        />
      </div>
      <strong>{display}</strong>
    </div>
  );
}

function riskColor(severity) {
  if (severity === 'High') return '#ff7c9f';
  if (severity === 'Medium') return '#ffd27d';
  return '#82e9c1';
}

function UserIcon() {
  return <Users size={16} />;
}

function FileIcon() {
  return <FileCheck2 size={16} />;
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
    minWidth: '5.8rem',
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

  statusHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation: 'aarush-ops-pulse 3s ease-in-out infinite',
  },

  statusOrb: {
    width: '4.6rem',
    height: '4.6rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(77,215,255,.4)',
    borderRadius: '1.2rem',
    color: '#c9f9ff',
    background:
      'radial-gradient(circle,#3d6d8a,#262257 70%)',
  },

  statusCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.25rem',
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

  statusCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  statusCopyP: {
    margin: 0,
    color: '#91a0bc',
    fontSize: '.63rem',
    lineHeight: 1.45,
  },

  statusMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.55rem',
    marginTop: '.25rem',
    color: '#9deeff',
    fontSize: '.57rem',
  },

  statusMetaSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
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
    animation: 'aarush-ops-in 240ms ease both',
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
    fontSize: '.78rem',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-ops-in 240ms ease both',
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

  modeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
  },

  modeButton: {
    minHeight: '3.2rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.25rem',
    padding: '.4rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeModeButton: {
    borderColor: 'rgba(124,92,255,.48)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.23),rgba(77,215,255,.08))',
  },

  workflowList: {
    display: 'grid',
    gap: '.4rem',
  },

  workflowRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  workflowIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  workflowCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  workflowCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  workflowCopySmall: {
    color: '#6f7d98',
    fontSize: '.54rem',
  },

  workflowToggle: {
    minWidth: '2.6rem',
    minHeight: '2.1rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  enabledToggle: {
    borderColor: 'rgba(130,233,193,.26)',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.08)',
  },

  pipeline: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  pipelineColumn: {
    minHeight: '5.2rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  pipelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.35rem',
    color: '#dce5f8',
    fontSize: '.6rem',
  },

  pipelineBar: {
    height: '.35rem',
    overflow: 'hidden',
    margin: '.7rem 0 .45rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.09)',
  },

  pipelineFill: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  pipelineColumnSmall: {
    color: '#91a0bc',
    fontSize: '.53rem',
  },

  resourceList: {
    display: 'grid',
    gap: '.55rem',
  },

  resourceRow: {
    display: 'grid',
    gridTemplateColumns: '9rem 1fr 3.5rem',
    alignItems: 'center',
    gap: '.5rem',
    color: '#aab6cf',
    fontSize: '.6rem',
  },

  resourceTrack: {
    height: '.35rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.09)',
  },

  resourceFill: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  resourceRowStrong: {
    color: '#c9f9ff',
    fontSize: '.58rem',
    textAlign: 'right',
  },

  suggestion: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.75rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.6rem',
  },

  campaignAutomation: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  automationAction: {
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

  riskList: {
    display: 'grid',
    gap: '.4rem',
  },

  riskRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  riskIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
  },

  riskCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  riskCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  severity: {
    fontSize: '.56rem',
    fontWeight: 850,
  },

  recommendationList: {
    display: 'grid',
    gap: '.4rem',
  },

  recommendation: {
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