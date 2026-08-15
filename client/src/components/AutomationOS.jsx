import { useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  FileText,
  Filter,
  Globe2,
  Layers3,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Webhook,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', Activity],
  ['workflows', 'Workflows', Layers3],
  ['triggers', 'Triggers', Webhook],
  ['actions', 'Actions', Zap],
  ['builder', 'Builder', Target],
  ['schedules', 'Schedules', CalendarClock],
  ['integrations', 'Integrations', Globe2],
  ['ai', 'AI Automations', Sparkles],
  ['logs', 'Activity Logs', Clock3],
  ['templates', 'Templates', FileText],
];

const TRIGGERS = [
  'Story Published',
  'Story Viewed',
  'Story Reached X Views',
  'Message Received',
  'Mention Detected',
  'Payment Received',
  'Payment Failed',
  'Document Updated',
  'Task Completed',
  'Calendar Event Started',
  'File Uploaded',
  'Login Detected',
  'Security Alert',
  'AI Request Completed',
  'Custom Webhook',
];

const ACTIONS = [
  'Send Message',
  'Send Notification',
  'Create Story',
  'Schedule Story',
  'Save to Cloud',
  'Create Task',
  'Create Document',
  'Generate Invoice',
  'Transfer Wallet Funds',
  'Export Analytics',
  'Translate Content',
  'Summarize Document',
  'Trigger AI Agent',
  'Backup Files',
  'Lock Sensitive Content',
];

const TEMPLATES = [
  'Backup every night',
  'Save story assets automatically',
  'Create task from starred message',
  'Send invoice after order',
  'Notify team when document changes',
  'Archive old files',
  'Translate stories automatically',
  'Weekly analytics report',
  'Monthly business summary',
  'Security lockdown workflow',
];

function numeric(value) {
  return Number(value) || 0;
}

function formatDate(value) {
  if (!value) return 'Not set';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function normalizeWorkflow(workflow, index) {
  return {
    ...workflow,
    id: workflow?.id || `workflow-${index}`,
    name:
      workflow?.name ||
      workflow?.title ||
      'Automation workflow',
    trigger: workflow?.trigger || 'Story Published',
    actions: Array.isArray(workflow?.actions)
      ? workflow.actions
      : [],
    status: workflow?.status || 'Active',
    lastRun: workflow?.lastRun || null,
    nextRun: workflow?.nextRun || null,
    successRate: numeric(workflow?.successRate),
    aiOptimized: Boolean(workflow?.aiOptimized),
  };
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

export default function AutomationOS({
  user = {},
  workflows = [],
  triggers = [],
  actions = [],
  integrations = [],
  logs = [],
  schedules = [],
  templates = [],
  agents = [],
  onCreateWorkflow,
  onRunWorkflow,
  onToggleWorkflow,
  onDeleteWorkflow,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [workflowItems, setWorkflowItems] =
    useState(() => workflows.map(normalizeWorkflow));
  const [search, setSearch] = useState('');
  const [selectedTrigger, setSelectedTrigger] =
    useState('Story Published');
  const [selectedAction, setSelectedAction] =
    useState('Send Notification');
  const [builderNodes, setBuilderNodes] = useState([
    'Trigger',
    'Condition',
    'Action',
    'End',
  ]);
  const [notice, setNotice] = useState('');
  const [workflowModal, setWorkflowModal] =
    useState(false);
  const [workflowName, setWorkflowName] =
    useState('');

  const filteredWorkflows = useMemo(() => {
    if (!search) return workflowItems;

    return workflowItems.filter((workflow) =>
      [
        workflow.name,
        workflow.trigger,
        workflow.status,
        workflow.actions.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, workflowItems]);

  const activeWorkflows = workflowItems.filter(
    (workflow) => workflow.status === 'Active'
  ).length;

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const createWorkflow = () => {
    if (!workflowName.trim()) {
      showNotice('Enter a workflow name.');
      return;
    }

    const workflow = {
      id: `workflow-${Date.now()}`,
      name: workflowName.trim(),
      trigger: selectedTrigger,
      actions: [selectedAction],
      status: 'Active',
      successRate: 100,
      aiOptimized: false,
    };

    setWorkflowItems((current) => [
      workflow,
      ...current,
    ]);
    onCreateWorkflow?.(workflow);
    setWorkflowName('');
    setWorkflowModal(false);
    showNotice('Workflow created.');
  };

  const toggleWorkflow = (workflow) => {
    const nextStatus =
      workflow.status === 'Active' ? 'Paused' : 'Active';

    setWorkflowItems((current) =>
      current.map((item) =>
        item.id === workflow.id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    onToggleWorkflow?.({
      ...workflow,
      status: nextStatus,
    });

    showNotice(
      nextStatus === 'Active'
        ? 'Workflow enabled.'
        : 'Workflow paused.'
    );
  };

  const runWorkflow = (workflow) => {
    onRunWorkflow?.({
      workflow,
      trigger: workflow.trigger,
      startedAt: new Date().toISOString(),
    });

    showNotice(`${workflow.name} started.`);
  };

  const renderOverview = () => (
    <>
      <section style={styles.automationHero}>
        <div style={styles.automationOrb}>
          <Zap size={32} />
        </div>
        <div style={styles.automationCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Aarush AutomationOS
          </span>
          <h1>
            Automate the work that slows you down
          </h1>
          <p>
            Connect Stories, Messaging, Wallet, Workspace,
            Education, Business, Cloud Storage, Security, and
            AI through triggers, conditions, and actions.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Activity size={13} />
              {activeWorkflows} active workflows
            </span>
            <span>
              <Bot size={13} />
              {agents.length || 0} AI agents connected
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Active workflows"
          value={activeWorkflows}
          icon={Layers3}
          color="#4dd7ff"
        />
        <MetricCard
          label="Executed today"
          value={numeric(
            workflows.executedToday ||
              workflows.executionsToday
          )}
          icon={Play}
          color="#82e9c1"
        />
        <MetricCard
          label="Scheduled automations"
          value={schedules.length}
          icon={CalendarClock}
          color="#ffd27d"
        />
        <MetricCard
          label="AI automations"
          value={workflowItems.filter(
            (workflow) => workflow.aiOptimized
          ).length}
          icon={Sparkles}
          color="#a895ff"
        />
        <MetricCard
          label="Integrations"
          value={integrations.length}
          icon={Globe2}
          color="#9deeff"
        />
        <MetricCard
          label="Success rate"
          value={`${numeric(
            workflows.successRate || 94
          )}%`}
          icon={Check}
          color="#82e9c1"
        />
        <MetricCard
          label="Time saved"
          value={workflows.timeSaved || 'Foundation'}
          icon={Clock3}
          color="#ff4fd8"
        />
        <MetricCard
          label="Automation health"
          value={`${numeric(
            workflows.healthScore || 91
          )}/100`}
          icon={ShieldCheck}
          color="#ff9f72"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Quick Automation"
          subtitle="Build a workflow from a trigger and action."
          icon={Sparkles}
          action={
            <button
              type="button"
              onClick={() => setWorkflowModal(true)}
              style={styles.smallPrimary}
            >
              <Plus size={14} />
              New workflow
            </button>
          }
        />

        <div style={styles.quickBuilder}>
          <select
            value={selectedTrigger}
            onChange={(event) =>
              setSelectedTrigger(event.target.value)
            }
            style={styles.select}
            aria-label="Select trigger"
          >
            {TRIGGERS.map((trigger) => (
              <option key={trigger}>{trigger}</option>
            ))}
          </select>

          <ChevronRight size={16} color="#91a0bc" />

          <select
            value={selectedAction}
            onChange={(event) =>
              setSelectedAction(event.target.value)
            }
            style={styles.select}
            aria-label="Select action"
          >
            {ACTIONS.map((action) => (
              <option key={action}>{action}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setWorkflowModal(true)}
            style={styles.primaryButton}
          >
            <Zap size={15} />
            Create
          </button>
        </div>
      </section>
    </>
  );

  const renderWorkflows = () => (
    <section style={styles.section}>
      <SectionTitle
        title="My Workflows"
        subtitle="Manage automation rules across Aarush."
        icon={Layers3}
        action={
          <button
            type="button"
            onClick={() => setWorkflowModal(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            New workflow
          </button>
        }
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search workflows"
          aria-label="Search workflows"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.workflowList}>
        {filteredWorkflows.length ? (
          filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              style={styles.workflowCard}
            >
              <div style={styles.workflowTop}>
                <span style={styles.workflowIcon}>
                  <Zap size={17} />
                </span>
                <span style={styles.workflowTitle}>
                  <strong>{workflow.name}</strong>
                  <span>
                    When {workflow.trigger}
                  </span>
                </span>
                <span
                  style={{
                    ...styles.statusBadge,
                    color:
                      workflow.status === 'Active'
                        ? '#82e9c1'
                        : '#ffd27d',
                  }}
                >
                  {workflow.status}
                </span>
              </div>

              <div style={styles.workflowMeta}>
                <span>
                  {workflow.actions.length} actions
                </span>
                <span>
                  Last run {formatDate(workflow.lastRun)}
                </span>
                <span>
                  Next run {formatDate(workflow.nextRun)}
                </span>
                <span>
                  Success {workflow.successRate || 0}%
                </span>
              </div>

              <div style={styles.workflowActions}>
                <button
                  type="button"
                  onClick={() => toggleWorkflow(workflow)}
                  style={styles.workflowButton}
                >
                  {workflow.status === 'Active' ? (
                    <Pause size={13} />
                  ) : (
                    <Play size={13} />
                  )}
                  {workflow.status === 'Active'
                    ? 'Disable'
                    : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => runWorkflow(workflow)}
                  style={styles.workflowButton}
                >
                  <Play size={13} />
                  Run now
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showNotice('Workflow duplicate prepared.')
                  }
                  style={styles.workflowButton}
                >
                  <CopyIcon />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteWorkflow?.(workflow);
                    setWorkflowItems((current) =>
                      current.filter(
                        (item) => item.id !== workflow.id
                      )
                    );
                    showNotice('Workflow deleted.');
                  }}
                  style={styles.deleteButton}
                >
                  <TrashIcon />
                  Delete
                </button>
              </div>

              {workflow.aiOptimized ? (
                <span style={styles.aiBadgeSmall}>
                  <Sparkles size={11} />
                  AI optimized
                </span>
              ) : null}
            </div>
          ))
        ) : (
          <Empty label="No workflows found." />
        )}
      </div>
    </section>
  );

  const renderTriggers = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Triggers"
        subtitle="Events that start automated workflows."
        icon={Webhook}
      />

      <div style={styles.triggerGrid}>
        {TRIGGERS.map((trigger) => (
          <button
            type="button"
            key={trigger}
            onClick={() => {
              setSelectedTrigger(trigger);
              showNotice(`${trigger} selected.`);
            }}
            style={{
              ...styles.triggerCard,
              ...(selectedTrigger === trigger
                ? styles.selectedTriggerCard
                : {}),
            }}
          >
            <Webhook size={16} />
            <span>{trigger}</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>
    </section>
  );

  const renderActions = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Actions"
        subtitle="Operations that workflows can execute."
        icon={Zap}
      />

      <div style={styles.triggerGrid}>
        {ACTIONS.map((action) => (
          <button
            type="button"
            key={action}
            onClick={() => {
              setSelectedAction(action);
              showNotice(`${action} selected.`);
            }}
            style={{
              ...styles.triggerCard,
              ...(selectedAction === action
                ? styles.selectedTriggerCard
                : {}),
            }}
          >
            <Zap size={16} />
            <span>{action}</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>
    </section>
  );

  const renderBuilder = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Workflow Builder"
        subtitle="Visual workflow nodes with branching foundations."
        icon={Target}
      />

      <div style={styles.builderCanvas}>
        {builderNodes.map((node, index) => (
          <div key={`${node}-${index}`} style={styles.nodeWrap}>
            <button
              type="button"
              onClick={() =>
                showNotice(`${node} node selected.`)
              }
              style={styles.workflowNode}
            >
              <span style={styles.nodeNumber}>{index + 1}</span>
              <span>
                <strong>{node}</strong>
                <small>
                  {node === 'Trigger'
                    ? selectedTrigger
                    : node === 'Action'
                      ? selectedAction
                      : 'Configuration foundation'}
                </small>
              </span>
            </button>
            {index < builderNodes.length - 1 ? (
              <ChevronRight
                size={18}
                color="#4dd7ff"
              />
            ) : null}
          </div>
        ))}
      </div>

      <div style={styles.nodeTools}>
        {[
          'Trigger node',
          'Condition node',
          'Delay node',
          'Loop node',
          'Filter node',
          'AI node',
          'Action node',
          'End node',
        ].map((node) => (
          <button
            type="button"
            key={node}
            onClick={() => {
              setBuilderNodes((current) => [
                ...current,
                node.replace(' node', ''),
              ]);
              showNotice(`${node} added.`);
            }}
            style={styles.toolChip}
          >
            <Plus size={13} />
            {node}
          </button>
        ))}
      </div>

      <div style={styles.builderNote}>
        <Sparkles size={15} />
        Branching and parallel path foundations are ready for
        future workflow orchestration.
      </div>
    </section>
  );

  const renderSchedules = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Schedules"
        subtitle="Time-zone-aware automation schedules."
        icon={CalendarClock}
      />

      <div style={styles.scheduleGrid}>
        {[
          'Every Minute',
          'Every Hour',
          'Daily',
          'Weekly',
          'Monthly',
          'Custom Cron foundation',
          'Time Zone Aware',
          'Business Hours Only foundation',
        ].map((schedule) => (
          <button
            type="button"
            key={schedule}
            onClick={() =>
              showNotice(`${schedule} selected.`)
            }
            style={styles.scheduleCard}
          >
            <CalendarClock size={16} />
            <span>{schedule}</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>

      <div style={styles.scheduleNote}>
        <Clock3 size={16} />
        <span>
          Current time zone:{' '}
          {user.timeZone || 'Local time zone'}
        </span>
      </div>
    </section>
  );

  const renderIntegrations = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Integrations"
        subtitle="Connect Aarush services and future external APIs."
        icon={Globe2}
      />

      <div style={styles.integrationGrid}>
        {[
          'Stories',
          'Messaging',
          'Wallet',
          'Workspace',
          'Education',
          'Business',
          'Cloud Storage',
          'Security',
          'AI Assistant',
          'Future External APIs',
        ].map((integration) => {
          const connected = integrations.some(
            (item) =>
              item.name === integration ||
              item.type === integration
          );

          return (
            <div
              key={integration}
              style={styles.integrationCard}
            >
              <Globe2 size={17} />
              <strong>{integration}</strong>
              <span>
                {connected ? 'Connected' : 'Foundation'}
              </span>
              <button
                type="button"
                onClick={() =>
                  showNotice(
                    connected
                      ? `${integration} settings opened.`
                      : `${integration} connection prepared.`
                  )
                }
                style={styles.connectButton}
              >
                {connected ? 'Manage' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderAI = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Automations"
        subtitle="Autonomous workflows powered by Aarush Personal AI."
        icon={Sparkles}
      />

      <div style={styles.aiAutomationList}>
        {[
          'Auto Organize Files',
          'Auto Summarize Messages',
          'Auto Schedule Stories',
          'Auto Reply to Messages',
          'Auto Generate Reports',
          'Auto Backup Important Data',
          'Auto Detect Security Risks',
          'Auto Create Tasks from Conversations',
          'Auto Translate Incoming Messages',
          'Auto Optimize Creator Workflow',
        ].map((automation) => (
          <button
            type="button"
            key={automation}
            onClick={() =>
              showNotice(`${automation} prepared.`)
            }
            style={styles.aiAutomationRow}
          >
            <Sparkles size={15} />
            <span>{automation}</span>
            <span style={styles.readyBadge}>Ready</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>
    </section>
  );

  const renderLogs = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Activity Logs"
        subtitle="Workflow executions, results, errors, and retry status."
        icon={Clock3}
      />

      <div style={styles.logList}>
        {logs.length ? (
          logs.map((log, index) => (
            <div
              key={log.id || index}
              style={styles.logRow}
            >
              <span
                style={{
                  ...styles.logStatus,
                  color:
                    log.result === 'Success'
                      ? '#82e9c1'
                      : '#ff7c9f',
                }}
              >
                {log.result === 'Success' ? (
                  <Check size={15} />
                ) : (
                  <X size={15} />
                )}
              </span>
              <span style={styles.logCopy}>
                <strong>
                  {log.workflow || 'Workflow execution'}
                </strong>
                <span>
                  {log.trigger || 'Trigger'} ·{' '}
                  {formatDate(log.executionTime)}
                </span>
                <small>
                  Duration {log.duration || '—'} ·{' '}
                  {log.error || 'No errors'}
                </small>
              </span>
              <span style={styles.retry}>
                {log.retryStatus || 'No retry'}
              </span>
            </div>
          ))
        ) : (
          <Empty label="No automation logs yet." />
        )}
      </div>
    </section>
  );

  const renderTemplates = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Templates"
        subtitle="Ready-to-use automation blueprints."
        icon={FileText}
      />

      <div style={styles.templateGrid}>
        {TEMPLATES.map((template) => (
          <button
            type="button"
            key={template}
            onClick={() => {
              setWorkflowName(template);
              setWorkflowModal(true);
            }}
            style={styles.templateCard}
          >
            <FileText size={17} />
            <strong>{template}</strong>
            <span>Use template</span>
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'workflows') return renderWorkflows();
    if (activeModule === 'triggers') return renderTriggers();
    if (activeModule === 'actions') return renderActions();
    if (activeModule === 'builder') return renderBuilder();
    if (activeModule === 'schedules') return renderSchedules();
    if (activeModule === 'integrations') return renderIntegrations();
    if (activeModule === 'ai') return renderAI();
    if (activeModule === 'logs') return renderLogs();
    if (activeModule === 'templates') return renderTemplates();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AutomationOS"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>AutomationOS</strong>
          <span>
            Connect events, intelligence, and action
          </span>
        </div>

        <button
          type="button"
          aria-label="Automation settings"
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

      {workflowModal ? (
        <Modal
          title="Create Workflow"
          onClose={() => setWorkflowModal(false)}
        >
          <label style={styles.field}>
            Workflow name
            <input
              autoFocus
              value={workflowName}
              onChange={(event) =>
                setWorkflowName(event.target.value)
              }
              placeholder="Notify me when a story is published"
              style={styles.textInput}
            />
          </label>

          <label style={styles.field}>
            Trigger
            <select
              value={selectedTrigger}
              onChange={(event) =>
                setSelectedTrigger(event.target.value)
              }
              style={styles.select}
            >
              {TRIGGERS.map((trigger) => (
                <option key={trigger}>{trigger}</option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            Action
            <select
              value={selectedAction}
              onChange={(event) =>
                setSelectedAction(event.target.value)
              }
              style={styles.select}
            >
              {ACTIONS.map((action) => (
                <option key={action}>{action}</option>
              ))}
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
        @keyframes aarush-automation-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-automation-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-automation-card:hover,
        .aarush-automation-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-automation-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-automation-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-automation-triggers,
          .aarush-automation-actions {
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

function Pulse({ label, value, color }) {
  return (
    <div style={styles.pulse}>
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

function WorkflowModalPlaceholder() {
  return null;
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
      <Zap size={25} />
      <span>{label}</span>
    </div>
  );
}

function CopyIcon() {
  return (
    <span style={styles.customIcon}>
      <CopySvg />
    </span>
  );
}

function CopySvg() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="13" height="13" x="9" y="9" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <span style={styles.customIcon}>
      <TrashSvg />
    </span>
  );
}

function TrashSvg() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.58),#07090e 68%)',
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
    width: 'min(100%, 1160px)',
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

  automationHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-automation-pulse 3s ease-in-out infinite',
  },

  automationOrb: {
    width: '4.8rem',
    height: '4.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(77,215,255,.4)',
    borderRadius: '1.2rem',
    color: '#c9f9ff',
    background:
      'radial-gradient(circle,#3d6d8a,#262257 70%)',
  },

  automationCopy: {
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

  automationCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  automationCopyP: {
    maxWidth: '44rem',
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
    animation: 'aarush-automation-in 240ms ease both',
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
    animation: 'aarush-automation-in 240ms ease both',
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

  quickBuilder: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
  },

  select: {
    minHeight: '2.4rem',
    minWidth: 0,
    flex: 1,
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
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

  workflowList: {
    display: 'grid',
    gap: '.5rem',
  },

  workflowCard: {
    position: 'relative',
    display: 'grid',
    gap: '.5rem',
    padding: '.7rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.85rem',
    background: 'rgba(255,255,255,.035)',
  },

  workflowTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
  },

  workflowIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#c9f9ff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  workflowTitle: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  workflowTitleSpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  statusBadge: {
    fontSize: '.55rem',
    fontWeight: 850,
  },

  workflowMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.5rem',
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  workflowActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.3rem',
  },

  workflowButton: {
    minHeight: '2.15rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.22rem',
    padding: '0 .45rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.55rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.54rem',
    cursor: 'pointer',
  },

  deleteButton: {
    minHeight: '2.15rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.22rem',
    padding: '0 .45rem',
    border: '1px solid rgba(255,91,132,.2)',
    borderRadius: '.55rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    fontSize: '.54rem',
    cursor: 'pointer',
  },

  aiBadgeSmall: {
    position: 'absolute',
    top: '.7rem',
    right: '.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    color: '#c9f9ff',
    fontSize: '.5rem',
  },

  triggerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
  },

  triggerCard: {
    minHeight: '2.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  selectedTriggerCard: {
    borderColor: 'rgba(124,92,255,.4)',
    color: '#fff',
    background: 'rgba(124,92,255,.15)',
  },

  builderCanvas: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    overflowX: 'auto',
    padding: '.8rem',
    border: '1px solid rgba(77,215,255,.15)',
    borderRadius: '.8rem',
    background:
      'radial-gradient(circle at center,rgba(77,215,255,.1),rgba(124,92,255,.05))',
  },

  nodeWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    flexShrink: 0,
  },

  workflowNode: {
    minWidth: '9rem',
    minHeight: '4rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '.55rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.1)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  nodeNumber: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.55rem',
    fontWeight: 850,
  },

  workflowNodeSpan: {
    display: 'grid',
    gap: '.17rem',
  },

  workflowNodeSmall: {
    color: '#91a0bc',
    fontSize: '.53rem',
  },

  nodeTools: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.7rem',
  },

  toolChip: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.55rem',
    cursor: 'pointer',
  },

  builderNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    marginTop: '.7rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.58rem',
  },

  scheduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  scheduleCard: {
    minHeight: '3.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  scheduleNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.05)',
    fontSize: '.58rem',
  },

  integrationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  integrationCard: {
    display: 'grid',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  integrationCardSpan: {
    color: '#82e9c1',
  },

  connectButton: {
    minHeight: '2.1rem',
    marginTop: '.15rem',
    border: 0,
    borderRadius: '.55rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.54rem',
    cursor: 'pointer',
  },

  aiAutomationList: {
    display: 'grid',
    gap: '.4rem',
  },

  aiAutomationRow: {
    minHeight: '2.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .6rem',
    border: '1px solid rgba(124,92,255,.16)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  readyBadge: {
    padding: '.25rem .4rem',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '.51rem',
  },

  logList: {
    display: 'grid',
    gap: '.4rem',
  },

  logRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  logStatus: {
    width: '2.1rem',
    height: '2.1rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    background: 'rgba(255,255,255,.06)',
  },

  logCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  logCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  logCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  retry: {
    color: '#91a0bc',
    fontSize: '.53rem',
  },

  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  templateCard: {
    minHeight: '5.5rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  templateCardSpan: {
    color: '#82e9c1',
    fontSize: '.54rem',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    width: '100%',
    marginTop: '.6rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
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
};