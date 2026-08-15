import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Cpu,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  Network,
  Pause,
  Play,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', LayoutDashboard],
  ['workspaces', 'Workspaces', Building2],
  ['agents', 'AI Agents', Bot],
  ['operations', 'Operations', Settings2],
  ['publishing', 'Publishing', Play],
  ['revenue', 'Revenue', WalletCards],
  ['brands', 'Brands', Target],
  ['analytics', 'Analytics', BarChart3],
  ['security', 'Security', ShieldCheck],
  ['command', 'AI Command', Sparkles],
];

const AGENT_TYPES = [
  'Story Creator Agent',
  'Publishing Agent',
  'Analytics Agent',
  'Monetization Agent',
  'Brand Agent',
  'CRM Agent',
  'Operations Agent',
  'Forecast Agent',
  'Security Agent',
];

const AGENT_STATUSES = [
  'Idle',
  'Working',
  'Publishing',
  'Optimizing',
  'Learning',
  'Coordinating',
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

function normalizeAgent(agent, index) {
  return {
    ...agent,
    id: agent?.id || `agent-${index}`,
    name: agent?.name || AGENT_TYPES[index % AGENT_TYPES.length],
    status: agent?.status || 'Idle',
    tasks: numeric(agent?.tasks),
    efficiency: numeric(agent?.efficiency),
  };
}

function normalizeWorkspace(workspace, index) {
  return {
    ...workspace,
    id: workspace?.id || `workspace-${index}`,
    name: workspace?.name || `Workspace ${index + 1}`,
    type: workspace?.type || 'Creator Workspace',
    members: numeric(workspace?.members),
    activity: workspace?.activity || 'Active',
    performance: numeric(workspace?.performance),
  };
}

function formatCompact(value) {
  const amount = numeric(value);

  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }

  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }

  return String(Math.round(amount));
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

export default function StoryCreatorEnterpriseOS({
  enterprise = {},
  workspaces = [],
  organizations = [],
  teams = [],
  creators = [],
  brands = [],
  campaigns = [],
  analytics = {},
  revenue = {},
  automation = {},
  agents = [],
  network = {},
  security = {},
  onOpenWorkspace,
  onLaunchAgent,
  onRunAutomation,
  onCreateWorkspace,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [workspaceModal, setWorkspaceModal] =
    useState(false);
  const [workspaceName, setWorkspaceName] =
    useState('');
  const [workspaceType, setWorkspaceType] =
    useState('Creator Workspace');

  const normalizedAgents = useMemo(
    () => agents.map(normalizeAgent),
    [agents]
  );

  const normalizedWorkspaces = useMemo(
    () => workspaces.map(normalizeWorkspace),
    [workspaces]
  );

  const activeAgents = useMemo(
    () =>
      normalizedAgents.filter(
        (agent) => agent.status !== 'Idle'
      ).length,
    [normalizedAgents]
  );

  const activeCampaigns = useMemo(
    () =>
      campaigns.filter(
        (campaign) =>
          campaign?.status === 'Active' ||
          campaign?.status === 'Running'
      ).length,
    [campaigns]
  );

  const globalReach =
    numeric(analytics.globalReach) ||
    numeric(analytics.reach);

  const monthlyRevenue =
    numeric(revenue.monthlyRevenue) ||
    numeric(revenue.totalRevenue);

  const automationEfficiency =
    numeric(automation.efficiency) ||
    numeric(analytics.automationEfficiency);

  const enterpriseHealth =
    numeric(enterprise.healthScore) ||
    numeric(analytics.enterpriseHealth) ||
    86;

  const filteredWorkspaces = normalizedWorkspaces.filter(
    (workspace) =>
      !search ||
      [
        workspace.name,
        workspace.type,
        workspace.activity,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const launchAgent = (agent) => {
    onLaunchAgent?.({
      agent,
      enterpriseId:
        enterprise.id || enterprise.enterpriseId,
      status: 'Working',
    });

    showNotice(`${agent.name} launch prepared.`);
  };

  const runCommand = (command) => {
    onRunAutomation?.({
      command,
      enterpriseId:
        enterprise.id || enterprise.enterpriseId,
      createdAt: new Date().toISOString(),
    });

    showNotice(`${command} initiated.`);
  };

  const createWorkspace = () => {
    if (!workspaceName.trim()) {
      showNotice('Enter a workspace name.');
      return;
    }

    onCreateWorkspace?.({
      id: `workspace-${Date.now()}`,
      name: workspaceName.trim(),
      type: workspaceType,
      enterpriseId:
        enterprise.id || enterprise.enterpriseId,
      status: 'Active',
    });

    setWorkspaceName('');
    setWorkspaceModal(false);
    showNotice('Workspace created.');
  };

  const renderOverview = () => (
    <>
      <section style={styles.enterpriseHero}>
        <div style={styles.enterpriseOrb}>
          <Cpu size={32} />
        </div>
        <div style={styles.enterpriseCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Enterprise control layer active
          </span>
          <h1>
            {enterprise.name || 'Creator Enterprise OS'}
          </h1>
          <p>
            Coordinate creators, workspaces, AI agents,
            publishing, revenue, and global operations from one
            intelligence layer.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Network size={13} />
              {organizations.length || 'Multi'} organizations
            </span>
            <span>
              <ShieldCheck size={13} />
              Security:{' '}
              {security.status || 'Monitoring'}
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Total Creators"
          value={formatCompact(creators.length)}
          icon={Users}
          color="#4dd7ff"
        />
        <MetricCard
          label="Active Workspaces"
          value={filteredWorkspaces.length}
          icon={Building2}
          color="#a895ff"
        />
        <MetricCard
          label="Active Campaigns"
          value={activeCampaigns}
          icon={Target}
          color="#82e9c1"
        />
        <MetricCard
          label="Monthly Revenue"
          value={money(monthlyRevenue)}
          icon={CircleDollarSign}
          color="#ffd27d"
        />
        <MetricCard
          label="Global Reach"
          value={formatCompact(globalReach)}
          icon={Globe2}
          color="#9deeff"
        />
        <MetricCard
          label="Active AI Agents"
          value={activeAgents}
          icon={Bot}
          color="#ff4fd8"
        />
        <MetricCard
          label="Automation Efficiency"
          value={`${automationEfficiency}%`}
          icon={Zap}
          color="#ff9f72"
        />
        <MetricCard
          label="Enterprise Health"
          value={`${enterpriseHealth}/100`}
          icon={ShieldCheck}
          color="#82e9c1"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Global Operating Pulse"
          subtitle="Enterprise-wide signals across your creator network."
          icon={Activity}
        />

        <div style={styles.pulseGrid}>
          <Pulse
            label="Publishing network"
            value={network.publishingStatus || 'Connected'}
            color="#4dd7ff"
          />
          <Pulse
            label="Revenue forecast"
            value={money(revenue.forecast)}
            color="#82e9c1"
          />
          <Pulse
            label="Threat monitoring"
            value={security.threatStatus || 'Clear'}
            color="#ffd27d"
          />
          <Pulse
            label="AI orchestration"
            value={
              automation.status || 'Coordinating'
            }
            color="#a895ff"
          />
        </div>
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="AI Command Center"
          subtitle="Execute enterprise actions from one control surface."
          icon={Sparkles}
        />

        <CommandGrid onCommand={runCommand} />
      </section>
    </>
  );

  const renderWorkspaces = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Workspaces"
        subtitle="Manage multiple creator and business environments."
        icon={Building2}
        action={
          <button
            type="button"
            onClick={() => setWorkspaceModal(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            New workspace
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
          placeholder="Search workspaces"
          aria-label="Search workspaces"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.workspaceGrid}>
        {filteredWorkspaces.length ? (
          filteredWorkspaces.map((workspace) => (
            <button
              type="button"
              key={workspace.id}
              onClick={() => onOpenWorkspace?.(workspace)}
              style={styles.workspaceCard}
            >
              <span style={styles.workspaceIcon}>
                <Building2 size={18} />
              </span>
              <strong>{workspace.name}</strong>
              <span>{workspace.type}</span>
              <small>
                {workspace.members} members ·{' '}
                {workspace.activity}
              </small>
              <div style={styles.performance}>
                <span>Performance</span>
                <strong>{workspace.performance}%</strong>
              </div>
            </button>
          ))
        ) : (
          <Empty label="No workspaces found." />
        )}
      </div>
    </section>
  );

  const renderAgents = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Agents"
        subtitle="Autonomous intelligence across the enterprise."
        icon={Bot}
      />

      <div style={styles.agentGrid}>
        {(normalizedAgents.length
          ? normalizedAgents
          : AGENT_TYPES.map((name, index) =>
              normalizeAgent({ name }, index)
            )
        ).map((agent) => (
          <div
            key={agent.id}
            style={styles.agentCard}
          >
            <div style={styles.agentTop}>
              <span style={styles.agentIcon}>
                <Bot size={17} />
              </span>
              <AgentStatus status={agent.status} />
            </div>
            <strong>{agent.name}</strong>
            <span>
              {agent.tasks} active tasks ·{' '}
              {agent.efficiency || 'Foundation'}% efficiency
            </span>
            <button
              type="button"
              onClick={() => launchAgent(agent)}
              style={styles.agentButton}
            >
              {agent.status === 'Idle' ? (
                <Play size={13} />
              ) : (
                <Pause size={13} />
              )}
              {agent.status === 'Idle'
                ? 'Launch agent'
                : 'Manage agent'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  const renderOperations = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Operations"
        subtitle="Enterprise workflows, resources, and automation."
        icon={Settings2}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Active workflows"
          value={numeric(automation.activeWorkflows)}
          icon={Network}
          color="#4dd7ff"
        />
        <MetricCard
          label="Resource allocation"
          value={`${numeric(
            automation.resourceAllocation
          )}%`}
          icon={Users}
          color="#a895ff"
        />
        <MetricCard
          label="Bottlenecks"
          value={numeric(automation.bottlenecks)}
          icon={Activity}
          color="#ff9f72"
        />
        <MetricCard
          label="Team efficiency"
          value={`${numeric(
            analytics.teamEfficiency
          )}%`}
          icon={Zap}
          color="#82e9c1"
        />
      </div>

      <div style={styles.operationList}>
        {[
          ['Operations manager', 'Coordinating'],
          ['Agency workspace', 'Connected'],
          ['Creator CRM', 'Synchronized'],
          ['Publishing network', 'Ready'],
          ['Predictive intelligence', 'Forecasting'],
        ].map(([label, status]) => (
          <div
            key={label}
            style={styles.operationRow}
          >
            <span>{label}</span>
            <strong>{status}</strong>
            <Check size={15} color="#82e9c1" />
          </div>
        ))}
      </div>
    </section>
  );

  const renderPublishing = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Publishing Network"
        subtitle="Cross-platform distribution and autonomous publishing."
        icon={Play}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Publishing queue"
          value={numeric(network.queue)}
          icon={Play}
          color="#4dd7ff"
        />
        <MetricCard
          label="Platform status"
          value={network.platformStatus || 'Connected'}
          icon={Network}
          color="#82e9c1"
        />
        <MetricCard
          label="Auto-publish jobs"
          value={numeric(network.autoPublishJobs)}
          icon={Zap}
          color="#a895ff"
        />
        <MetricCard
          label="Regional schedules"
          value={numeric(network.regionalSchedules)}
          icon={Globe2}
          color="#ffd27d"
        />
      </div>

      <div style={styles.networkMap}>
        <Globe2 size={34} />
        <div>
          <strong>Global distribution map foundation</strong>
          <span>
            Regional publishing, platform health, and
            audience routing are ready for expansion.
          </span>
        </div>
      </div>
    </section>
  );

  const renderRevenue = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Revenue Center"
        subtitle="Enterprise income, profitability, and forecasts."
        icon={WalletCards}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Total revenue"
          value={money(revenue.totalRevenue)}
          icon={CircleDollarSign}
          color="#82e9c1"
        />
        <MetricCard
          label="Brand income"
          value={money(revenue.brandIncome)}
          icon={Target}
          color="#a895ff"
        />
        <MetricCard
          label="Subscription income"
          value={money(revenue.subscriptionIncome)}
          icon={Users}
          color="#4dd7ff"
        />
        <MetricCard
          label="Forecast"
          value={money(revenue.forecast)}
          icon={BarChart3}
          color="#ffd27d"
        />
      </div>

      <div style={styles.revenueList}>
        {[
          ['Revenue by workspace', revenue.byWorkspace],
          ['Revenue by creator', revenue.byCreator],
          ['Revenue by region', revenue.byRegion],
          ['Profitability', revenue.profitability],
          ['Brand network income', revenue.brandIncome],
        ].map(([label, value]) => (
          <div
            key={label}
            style={styles.revenueRow}
          >
            <span>{label}</span>
            <strong>
              {typeof value === 'number'
                ? money(value)
                : value || 'Foundation'}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );

  const renderBrands = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Brand Network"
        subtitle="Enterprise brand ecosystem and contract pipeline."
        icon={Target}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Active brand partners"
          value={brands.length}
          icon={Target}
          color="#4dd7ff"
        />
        <MetricCard
          label="Enterprise campaigns"
          value={campaigns.length}
          icon={BarChart3}
          color="#a895ff"
        />
        <MetricCard
          label="Agency clients"
          value={numeric(analytics.agencyClients)}
          icon={Users}
          color="#82e9c1"
        />
        <MetricCard
          label="Global partners"
          value={numeric(analytics.globalPartners)}
          icon={Globe2}
          color="#ffd27d"
        />
      </div>

      <div style={styles.brandPanel}>
        <div>
          <span>Contract pipeline</span>
          <strong>
            {revenue.contractPipeline || 'Foundation ready'}
          </strong>
        </div>
        <div>
          <span>Brand reputation</span>
          <strong>
            {analytics.brandReputation || 'Monitoring'}
          </strong>
        </div>
      </div>
    </section>
  );

  const renderAnalytics = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Global Analytics"
        subtitle="Worldwide performance and predictive intelligence."
        icon={BarChart3}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Worldwide reach"
          value={formatCompact(globalReach)}
          icon={Globe2}
          color="#4dd7ff"
        />
        <MetricCard
          label="Regional performance"
          value={
            analytics.regionalPerformance || 'Foundation'
          }
          icon={BarChart3}
          color="#a895ff"
        />
        <MetricCard
          label="Audience intelligence"
          value={
            analytics.audienceIntelligence || 'Active'
          }
          icon={Users}
          color="#82e9c1"
        />
        <MetricCard
          label="Viral forecasts"
          value={numeric(analytics.viralForecasts)}
          icon={Zap}
          color="#ff4fd8"
        />
        <MetricCard
          label="Growth prediction"
          value={
            analytics.growthPrediction || 'Forecasting'
          }
          icon={Activity}
          color="#ffd27d"
        />
        <MetricCard
          label="Trend maps"
          value={analytics.trendMaps || 'Foundation'}
          icon={Network}
          color="#9deeff"
        />
      </div>
    </section>
  );

  const renderSecurity = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Security"
        subtitle="Enterprise protection and access intelligence."
        icon={ShieldCheck}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Active sessions"
          value={numeric(security.activeSessions)}
          icon={Users}
          color="#4dd7ff"
        />
        <MetricCard
          label="Workspace security"
          value={security.workspaceSecurity || 'Protected'}
          icon={LockKeyhole}
          color="#82e9c1"
        />
        <MetricCard
          label="AI permissions"
          value={security.aiAccess || 'Managed'}
          icon={Bot}
          color="#a895ff"
        />
        <MetricCard
          label="Device trust"
          value={security.deviceTrust || 'Verified'}
          icon={ShieldCheck}
          color="#ffd27d"
        />
        <MetricCard
          label="Threat alerts"
          value={numeric(security.threatAlerts)}
          icon={Bell}
          color="#ff7c9f"
        />
        <MetricCard
          label="Audit logs"
          value={security.auditLogs || 'Foundation'}
          icon={Activity}
          color="#9deeff"
        />
      </div>

      <div style={styles.securityNotice}>
        <ShieldCheck size={17} />
        <span>
          Security Center, Privacy Dashboard, Gaze Lock,
          One Tap Lock, and Emergency Privacy integration
          points are ready.
        </span>
      </div>
    </section>
  );

  const renderCommand = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Command Center"
        subtitle="Launch intelligence and coordinate the enterprise."
        icon={Sparkles}
      />

      <CommandGrid onCommand={runCommand} />

      <div style={styles.commandSearch}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search creators, brands, campaigns, revenue..."
          aria-label="Enterprise search"
          style={styles.searchInput}
        />
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'workspaces') return renderWorkspaces();
    if (activeModule === 'agents') return renderAgents();
    if (activeModule === 'operations') return renderOperations();
    if (activeModule === 'publishing') return renderPublishing();
    if (activeModule === 'revenue') return renderRevenue();
    if (activeModule === 'brands') return renderBrands();
    if (activeModule === 'analytics') return renderAnalytics();
    if (activeModule === 'security') return renderSecurity();
    if (activeModule === 'command') return renderCommand();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Creator Enterprise OS"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>
            {enterprise.name || 'Creator Enterprise OS'}
          </strong>
          <span>
            {enterprise.tagline ||
              'The operating system for creator businesses'}
          </span>
        </div>

        <button
          type="button"
          aria-label="Enterprise notifications"
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

      {workspaceModal ? (
        <Modal
          title="Create Workspace"
          onClose={() => setWorkspaceModal(false)}
        >
          <label style={styles.field}>
            Workspace name
            <input
              autoFocus
              value={workspaceName}
              onChange={(event) =>
                setWorkspaceName(event.target.value)
              }
              placeholder="Regional creator workspace"
              style={styles.textInput}
            />
          </label>

          <label style={styles.field}>
            Workspace type
            <select
              value={workspaceType}
              onChange={(event) =>
                setWorkspaceType(event.target.value)
              }
              style={styles.select}
            >
              <option>Personal Workspace</option>
              <option>Creator Workspace</option>
              <option>Agency Workspace</option>
              <option>Brand Workspace</option>
              <option>Enterprise Workspace</option>
              <option>Regional Workspace</option>
            </select>
          </label>

          <button
            type="button"
            onClick={createWorkspace}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create workspace
          </button>
        </Modal>
      ) : null}

      <style>{`
        @keyframes aarush-enterprise-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-enterprise-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 44px rgba(124,92,255,.48);
          }
        }

        .aarush-enterprise-card:hover,
        .aarush-enterprise-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-enterprise-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-enterprise-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-enterprise-workspaces {
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

function CommandGrid({ onCommand }) {
  const commands = [
    ['Launch Agent', Bot],
    ['Pause Agent', Pause],
    ['Run Global Optimization', Zap],
    ['Generate Executive Report', BarChart3],
    ['Predict Next Month', Activity],
    ['Optimize Revenue', CircleDollarSign],
    ['Optimize Publishing', Play],
    ['Analyze Brand Network', Target],
    ['Simulate Growth', TrendingIcon],
    ['Coordinate Teams', Users],
  ];

  return (
    <div style={styles.commandGrid}>
      {commands.map(([label, Icon]) => (
        <button
          type="button"
          key={label}
          onClick={() => onCommand(label)}
          style={styles.commandButton}
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

function AgentStatus({ status }) {
  return (
    <span
      style={{
        ...styles.agentStatus,
        color: agentColor(status),
      }}
    >
      {status}
    </span>
  );
}

function agentColor(status) {
  if (status === 'Publishing') return '#4dd7ff';
  if (status === 'Optimizing') return '#a895ff';
  if (status === 'Learning') return '#ffd27d';
  if (status === 'Coordinating') return '#82e9c1';
  if (status === 'Working') return '#9deeff';
  return '#91a0bc';
}

function TrendingIcon() {
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
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Building2 size={25} />
      <span>{label}</span>
    </div>
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
    width: 'min(100%, 1180px)',
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

  enterpriseHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.95rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.2),rgba(77,215,255,.06))',
    animation:
      'aarush-enterprise-pulse 3s ease-in-out infinite',
  },

  enterpriseOrb: {
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

  enterpriseCopy: {
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

  enterpriseCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  enterpriseCopyP: {
    maxWidth: '42rem',
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
    animation: 'aarush-enterprise-in 240ms ease both',
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
    animation: 'aarush-enterprise-in 240ms ease both',
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
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  pulse: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    gap: '.35rem',
    minHeight: '2.8rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.59rem',
  },

  pulseDot: {
    width: '.45rem',
    height: '.45rem',
    borderRadius: '999px',
  },

  pulseStrong: {
    gridColumn: '2',
    color: '#fff',
    fontSize: '.62rem',
  },

  commandGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  commandButton: {
    minHeight: '2.7rem',
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
    marginBottom: '.7rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.8rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
  },

  commandSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.7rem',
    marginTop: '.7rem',
    padding: '0 .7rem',
    border: '1px solid rgba(77,215,255,.15)',
    borderRadius: '.8rem',
    color: '#91a0bc',
    background: 'rgba(77,215,255,.05)',
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

  workspaceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.5rem',
  },

  workspaceCard: {
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

  workspaceIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  workspaceCardSpan: {
    color: '#82e9c1',
    fontSize: '.57rem',
  },

  workspaceCardSmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  performance: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.4rem',
    marginTop: '.15rem',
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  performanceStrong: {
    color: '#c9f9ff',
  },

  agentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.5rem',
  },

  agentCard: {
    display: 'grid',
    gap: '.3rem',
    padding: '.7rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.85rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
  },

  agentTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.4rem',
  },

  agentIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.6rem',
    color: '#c9f9ff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.12))',
  },

  agentStatus: {
    fontSize: '.54rem',
    fontWeight: 850,
  },

  agentCardSpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  agentButton: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.25rem',
    marginTop: '.2rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  operationList: {
    display: 'grid',
    gap: '.35rem',
    marginTop: '.7rem',
  },

  operationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.3rem',
    padding: '0 .55rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    color: '#aab6cf',
    fontSize: '.6rem',
  },

  operationRowStrong: {
    marginLeft: 'auto',
    color: '#c9f9ff',
  },

  networkMap: {
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
    marginTop: '.7rem',
    padding: '.8rem',
    border: '1px solid rgba(77,215,255,.17)',
    borderRadius: '.8rem',
    color: '#c9f9ff',
    background:
      'radial-gradient(circle at center,rgba(77,215,255,.12),rgba(124,92,255,.05))',
  },

  networkMapDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  networkMapSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  revenueList: {
    display: 'grid',
    gap: '.35rem',
    marginTop: '.7rem',
  },

  revenueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    minHeight: '2.25rem',
    padding: '0 .55rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    color: '#91a0bc',
    fontSize: '.6rem',
  },

  revenueRowStrong: {
    color: '#c7ffe4',
  },

  brandPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.5rem',
    marginTop: '.7rem',
  },

  brandPanelDiv: {
    display: 'grid',
    gap: '.2rem',
    padding: '.7rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.58rem',
  },

  brandPanelStrong: {
    color: '#fff',
    fontSize: '.66rem',
  },

  securityNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.06)',
    fontSize: '.6rem',
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