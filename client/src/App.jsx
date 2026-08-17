import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Brain,
  Check,
  ChevronRight,
  CircleDollarSign,
  Cloud,
  Cpu,
  Globe2,
  KeyRound,
  Layers3,
  LockKeyhole,
  MessageCircle,
  Network,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Neural Overview', Brain],
  ['map', 'Ecosystem Map', Network],
  ['agents', 'AI Agents', Bot],
  ['memory', 'Memory Graph', Layers3],
  ['orchestration', 'Orchestration', Zap],
  ['predictions', 'Predictions', Target],
  ['security', 'Security', ShieldCheck],
  ['automation', 'Automation', Activity],
  ['global', 'Global Intelligence', Globe2],
  ['console', 'Command Console', Sparkles],
];

const ECOSYSTEM_NODES = [
  ['Identity', KeyRound],
  ['Stories', Play],
  ['Messaging', MessageCircle],
  ['Wallet', WalletCards],
  ['Workspace', Layers3],
  ['Education', Brain],
  ['Business', CircleDollarSign],
  ['Cloud', Cloud],
  ['Automation', Zap],
  ['Security', ShieldCheck],
  ['Live', Activity],
  ['Commerce', WalletCards],
  ['AI Assistant', Sparkles],
];

const AGENT_NAMES = [
  'Creator Agent',
  'Messaging Agent',
  'Wallet Agent',
  'Workspace Agent',
  'Education Agent',
  'Business Agent',
  'Cloud Agent',
  'Automation Agent',
  'Security Agent',
  'Global Intelligence Agent',
];

function numeric(value) {
  return Number(value) || 0;
}

function normalizeAgent(agent, index) {
  return {
    ...agent,
    id: agent?.id || `agent-${index}`,
    name: agent?.name || AGENT_NAMES[index],
    status: agent?.status || 'Ready',
    tasks: numeric(agent?.tasks || agent?.tasksCompleted),
    confidence: numeric(agent?.confidence) || 88,
    objective:
      agent?.objective || 'Monitoring ecosystem signals',
  };
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

export default function AarushNeuralCore({
  user = {},
  identity = {},
  modules = [],
  agents = [],
  memory = [],
  automation = {},
  analytics = {},
  security = {},
  notifications = [],
  onRunNeuralAction,
  onLaunchAgent,
  onOptimizeSystem,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [command, setCommand] = useState('');
  const [notice, setNotice] = useState('');
  const [memorySearch, setMemorySearch] =
    useState('');

  const agentItems = useMemo(
    () =>
      agents.length
        ? agents.map(normalizeAgent)
        : AGENT_NAMES.map((name, index) =>
            normalizeAgent({ name }, index)
          ),
    [agents]
  );

  const activeAgents = agentItems.filter(
    (agent) => agent.status !== 'Idle'
  ).length;

  const filteredMemory = useMemo(() => {
    if (!memorySearch) return memory;

    return memory.filter((item) =>
      [
        item?.title,
        item?.content,
        item?.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(memorySearch.toLowerCase())
    );
  }, [memory, memorySearch]);

  const intelligenceScore =
    numeric(analytics.ecosystemIntelligenceScore) ||
    numeric(analytics.intelligenceScore) ||
    89;

  const neuralConfidence =
    numeric(analytics.neuralConfidence) || 92;

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const runCommand = async (value = command) => {
    const text = value.trim();

    if (!text) {
      showNotice('Enter a neural command.');
      return;
    }

    await onRunNeuralAction?.({
      command: text,
      neuralCoreId:
        identity.neuralCoreId ||
        identity.identityId ||
        user.id,
      context: {
        user,
        identity,
        modules,
        agents: agentItems,
        memory,
        automation,
        analytics,
        security,
      },
      createdAt: new Date().toISOString(),
    });

    setCommand('');
    showNotice('Neural action initiated.');
  };

  const renderOverview = () => (
    <>
      <section style={styles.neuralHero}>
        <div style={styles.neuralOrb}>
          <Brain size={34} />
        </div>
        <div style={styles.neuralCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Aarush Neural Core
          </span>
          <h1>
            Ecosystem intelligence online
          </h1>
          <p>
            Orchestrate identity, creation, communication,
            finance, productivity, learning, business, security,
            and global intelligence through one neural layer.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Bot size={13} />
              {activeAgents} active AI agents
            </span>
            <span>
              <Network size={13} />
              {modules.length || ECOSYSTEM_NODES.length} modules connected
            </span>
            <span>
              <ShieldCheck size={13} />
              {security.status || 'Security monitoring'}
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Active AI agents"
          value={activeAgents}
          icon={Bot}
          color="#4dd7ff"
        />
        <MetricCard
          label="Modules connected"
          value={modules.length || ECOSYSTEM_NODES.length}
          icon={Network}
          color="#a895ff"
        />
        <MetricCard
          label="Automations running"
          value={numeric(automation.activeWorkflows)}
          icon={Zap}
          color="#82e9c1"
        />
        <MetricCard
          label="Predictions generated"
          value={numeric(analytics.predictionsGenerated)}
          icon={Target}
          color="#ffd27d"
        />
        <MetricCard
          label="Decisions optimized"
          value={numeric(analytics.decisionsOptimized)}
          icon={Check}
          color="#9deeff"
        />
        <MetricCard
          label="Security status"
          value={security.status || 'Protected'}
          icon={ShieldCheck}
          color="#82e9c1"
        />
        <MetricCard
          label="Neural confidence"
          value={`${neuralConfidence}%`}
          icon={Sparkles}
          color="#ff4fd8"
        />
        <MetricCard
          label="Intelligence score"
          value={`${intelligenceScore}/100`}
          icon={Brain}
          color="#ff9f72"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Neural Command Console"
          subtitle="Describe what you want Aarush to coordinate."
          icon={Sparkles}
        />

        <CommandComposer
          value={command}
          onChange={setCommand}
          onSubmit={() => runCommand()}
        />

        <div style={styles.commandSuggestions}>
          {[
            'Create a story and schedule it',
            'Summarize my workspace',
            'Plan my day',
            'Generate business report',
            'Backup important files',
            'Optimize all workflows',
            'Coordinate AI agents',
          ].map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => runCommand(suggestion)}
              style={styles.suggestionChip}
            >
              <Sparkles size={13} />
              {suggestion}
            </button>
          ))}
        </div>
      </section>
    </>
  );

  const renderMap = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Ecosystem Map"
        subtitle="Connected modules and data-flow foundations."
        icon={Network}
      />

      <div style={styles.ecosystemMap}>
        <div style={styles.mapLines} />
        <div style={styles.coreNode}>
          <Brain size={27} />
          <span>Neural Core</span>
        </div>

        {ECOSYSTEM_NODES.map(([label, Icon], index) => (
          <button
            type="button"
            key={label}
            onClick={() => showNotice(`${label} node selected.`)}
            style={{
              ...styles.ecosystemNode,
              left: `${8 + (index * 19) % 82}%`,
              top: `${10 + (index * 27) % 72}%`,
            }}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div style={styles.connectionLegend}>
        <span>
          <i style={{ background: '#82e9c1' }} />
          Connected
        </span>
        <span>
          <i style={{ background: '#4dd7ff' }} />
          Data flow foundation
        </span>
        <span>
          <i style={{ background: '#a895ff' }} />
          AI orchestration
        </span>
      </div>
    </section>
  );

  const renderAgents = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Agents"
        subtitle="Autonomous intelligence across Aarush services."
        icon={Bot}
      />

      <div style={styles.agentGrid}>
        {agentItems.map((agent) => (
          <div
            key={agent.id}
            style={styles.agentCard}
          >
            <div style={styles.agentTop}>
              <span style={styles.agentIcon}>
                <Bot size={17} />
              </span>
              <span
                style={{
                  ...styles.agentStatus,
                  color: agentColor(agent.status),
                }}
              >
                {agent.status}
              </span>
            </div>
            <strong>{agent.name}</strong>
            <span>{agent.objective}</span>
            <small>
              {agent.tasks} tasks · {agent.confidence}% confidence
            </small>
            <button
              type="button"
              onClick={() => {
                onLaunchAgent?.(agent);
                showNotice(`${agent.name} launch prepared.`);
              }}
              style={styles.agentButton}
            >
              <Play size={13} />
              Launch / manage
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  const renderMemory = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Memory Graph"
        subtitle="Organized context for personal, work, study, and creator intelligence."
        icon={Layers3}
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={memorySearch}
          onChange={(event) =>
            setMemorySearch(event.target.value)
          }
          placeholder="Search neural memory"
          aria-label="Search neural memory"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.memoryCategories}>
        {[
          'Personal',
          'Work',
          'Study',
          'Creator',
          'Business',
          'Financial',
          'Security',
          'Relationships',
        ].map((category) => (
          <button
            type="button"
            key={category}
            onClick={() =>
              showNotice(`${category} memory selected.`)
            }
            style={styles.memoryCategory}
          >
            <Layers3 size={14} />
            {category}
          </button>
        ))}
      </div>

      <div style={styles.memoryList}>
        {filteredMemory.length ? (
          filteredMemory.map((item, index) => (
            <div
              key={item.id || index}
              style={styles.memoryRow}
            >
              <span style={styles.memoryIcon}>
                <Sparkles size={15} />
              </span>
              <span style={styles.memoryCopy}>
                <strong>
                  {item.title ||
                    item.category ||
                    'Neural memory'}
                </strong>
                <span>
                  {item.content ||
                    'Context linking foundation'}
                </span>
                <small>
                  {item.category || 'Personal'} ·{' '}
                  {item.pinned ? 'Pinned' : 'Saved'}
                </small>
              </span>
              <button
                type="button"
                onClick={() =>
                  showNotice('Memory actions opened.')
                }
                style={styles.tinyButton}
                aria-label="Memory actions"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="No neural memories found." />
        )}
      </div>
    </section>
  );

  const renderOrchestration = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Orchestration Engine"
        subtitle="Cross-module workflows coordinated by the Neural Core."
        icon={Zap}
      />

      <div style={styles.orchestrationList}>
        {[
          ['Story → Analytics → AI → Brand', 'Coordinating'],
          ['Message → Task → Calendar', 'Ready'],
          ['Payment → Invoice → Accounting', 'Monitoring'],
          ['File → Workspace → AI Summary', 'Active'],
          ['Study → Notes → Quiz', 'Ready'],
          ['Security Alert → Lockdown', 'Protected'],
        ].map(([flow, status]) => (
          <div
            key={flow}
            style={styles.orchestrationRow}
          >
            <span style={styles.flowIcon}>
              <Network size={16} />
            </span>
            <span style={styles.flowCopy}>
              <strong>{flow}</strong>
              <small>{status} · Parallel paths foundation</small>
            </span>
            <span style={styles.readyBadge}>{status}</span>
            <ChevronRight size={14} />
          </div>
        ))}
      </div>
    </section>
  );

  const renderPredictions = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Predictions"
        subtitle="Forward-looking intelligence across your ecosystem."
        icon={Target}
      />

      <div style={styles.predictionGrid}>
        {[
          ['Best posting time', analytics.bestPostingTime],
          ['Revenue forecast', analytics.revenueForecast],
          ['Study performance', analytics.studyPerformance],
          ['Business growth', analytics.businessGrowth],
          ['Storage optimization', analytics.storageOptimization],
          ['Automation opportunities', analytics.automationOpportunities],
          ['Security risk forecast', analytics.securityRisk],
          ['Productivity forecast', analytics.productivityForecast],
        ].map(([label, value]) => (
          <button
            type="button"
            key={label}
            onClick={() => showNotice(`${label} opened.`)}
            style={styles.predictionCard}
          >
            <Target size={16} />
            <span>{label}</span>
            <strong>{value || 'Forecasting'}</strong>
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
    </section>
  );

  const renderSecurity = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Security Intelligence"
        subtitle="Threat, privacy, device, and recovery signals."
        icon={ShieldCheck}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Threat score"
          value={`${security.threatScore || 8}/100`}
          icon={ShieldCheck}
          color="#82e9c1"
        />
        <MetricCard
          label="Device trust"
          value={security.deviceTrust || 'Verified'}
          icon={KeyRound}
          color="#4dd7ff"
        />
        <MetricCard
          label="Session anomalies"
          value={numeric(security.sessionAnomalies)}
          icon={Activity}
          color="#ffd27d"
        />
        <MetricCard
          label="Privacy risks"
          value={numeric(security.privacyRisks)}
          icon={LockKeyhole}
          color="#ff7c9f"
        />
        <MetricCard
          label="Backup readiness"
          value={security.backupReadiness || 'Ready'}
          icon={CloudIcon}
          color="#9deeff"
        />
        <MetricCard
          label="AI recommendations"
          value={security.aiRecommendations || 'Ready'}
          icon={Sparkles}
          color="#a895ff"
        />
      </div>
    </section>
  );

  const renderAutomation = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Automation Intelligence"
        subtitle="Workflow health, autonomous actions, and savings."
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
          label="Failed workflows"
          value={numeric(automation.failedWorkflows)}
          icon={AlertIcon}
          color="#ff7c9f"
        />
        <MetricCard
          label="AI-created workflows"
          value={numeric(automation.aiCreatedWorkflows)}
          icon={Sparkles}
          color="#a895ff"
        />
        <MetricCard
          label="Time saved"
          value={automation.timeSaved || 'Foundation'}
          icon={Clock3}
          color="#82e9c1"
        />
        <MetricCard
          label="Autonomous actions"
          value={numeric(automation.autonomousActions)}
          icon={Bot}
          color="#ffd27d"
        />
        <MetricCard
          label="Optimization opportunities"
          value={numeric(automation.opportunities)}
          icon={Target}
          color="#9deeff"
        />
      </div>

      <div style={styles.insightNote}>
        <Sparkles size={16} />
        {automation.optimizationSuggestion ||
          'The Neural Core is ready to optimize your workflows.'}
      </div>
    </section>
  );

  const renderGlobal = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Global Intelligence"
        subtitle="Worldwide creator, live, commerce, language, and trend signals."
        icon={Globe2}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Active regions"
          value={numeric(analytics.activeRegions)}
          icon={Globe2}
          color="#4dd7ff"
        />
        <MetricCard
          label="Languages"
          value={numeric(analytics.languages)}
          icon={LanguagesIcon}
          color="#a895ff"
        />
        <MetricCard
          label="Creator activity"
          value={analytics.creatorActivity || 'Active'}
          icon={Users}
          color="#82e9c1"
        />
        <MetricCard
          label="Live broadcasts"
          value={numeric(analytics.liveBroadcasts)}
          icon={Play}
          color="#ff4fd8"
        />
        <MetricCard
          label="Commerce activity"
          value={analytics.commerceActivity || 'Monitoring'}
          icon={CircleDollarIcon}
          color="#ffd27d"
        />
        <MetricCard
          label="Translation activity"
          value={analytics.translationActivity || 'Active'}
          icon={LanguagesIcon}
          color="#9deeff"
        />
        <MetricCard
          label="Trend signals"
          value={numeric(analytics.trendSignals)}
          icon={TrendingUp}
          color="#ff9f72"
        />
      </div>
    </section>
  );

  const renderConsole = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Command Console"
        subtitle="Issue natural-language commands to the Neural Core."
        icon={Sparkles}
      />

      <div style={styles.commandBox}>
        <Sparkles size={17} />
        <input
          autoFocus
          value={command}
          onChange={(event) =>
            setCommand(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') runCommand();
          }}
          placeholder="Tell Aarush what to coordinate..."
          aria-label="Neural command"
          style={styles.commandInput}
        />
        <button
          type="button"
          onClick={() => runCommand()}
          style={styles.commandButton}
        >
          <Play size={15} />
          Run
        </button>
      </div>

      <div style={styles.commandHistory}>
        {(analytics.executionHistory || []).length ? (
          analytics.executionHistory.map((item, index) => (
            <div
              key={item.id || index}
              style={styles.historyRow}
            >
              <Check size={15} color="#82e9c1" />
              <span>
                <strong>{item.command}</strong>
                <small>
                  {item.result || 'Completed'} ·{' '}
                  {formatDate(item.createdAt)}
                </small>
              </span>
            </div>
          ))
        ) : (
          <Empty label="Command execution history foundation ready." />
        )}
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'map') return renderMap();
    if (activeModule === 'agents') return renderAgents();
    if (activeModule === 'memory') return renderMemory();
    if (activeModule === 'orchestration') {
      return renderOrchestration();
    }
    if (activeModule === 'predictions') {
      return renderPredictions();
    }
    if (activeModule === 'security') return renderSecurity();
    if (activeModule === 'automation') {
      return renderAutomation();
    }
    if (activeModule === 'global') return renderGlobal();
    if (activeModule === 'console') return renderConsole();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Aarush Neural Core"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Aarush Neural Core</strong>
          <span>
            The intelligence layer behind the ecosystem
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            onOptimizeSystem?.({
              neuralCoreId:
                identity.neuralCoreId ||
                identity.identityId ||
                user.id,
            });
            showNotice('Global optimization initiated.');
          }}
          aria-label="Optimize Aarush system"
          style={styles.optimizeButton}
        >
          <Zap size={17} />
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
        @keyframes aarush-neural-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-neural-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 48px rgba(124,92,255,.58);
          }
        }

        @keyframes aarush-neural-flow {
          from {
            transform: translateX(-2rem);
            opacity: .2;
          }
          to {
            transform: translateX(2rem);
            opacity: .8;
          }
        }

        .aarush-neural-card:hover,
        .aarush-neural-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-neural-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-neural-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-neural-agents,
          .aarush-neural-predictions {
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

function CommandComposer({ value, onChange, onSubmit }) {
  return (
    <div style={styles.commandBox}>
      <Sparkles size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit();
        }}
        placeholder="Create, optimize, summarize, plan..."
        aria-label="Neural command"
        style={styles.commandInput}
      />
      <button
        type="button"
        onClick={onSubmit}
        style={styles.commandButton}
      >
        <Play size={15} />
        Run
      </button>
    </div>
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

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Brain size={25} />
      <span>{label}</span>
    </div>
  );
}

function ActivityIcon() {
  return (
    <span style={styles.customIcon}>
      <Activity size={16} />
    </span>
  );
}

function AlertIcon() {
  return (
    <span style={styles.customIcon}>
      <AlertTriangle size={16} />
    </span>
  );
}

function CloudIcon() {
  return (
    <span style={styles.customIcon}>
      <Cloud size={16} />
    </span>
  );
}

function LanguagesIcon() {
  return (
    <span style={styles.customIcon}>
      <Globe2 size={16} />
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

function KeyRound() {
  return (
    <span style={styles.customIcon}>
      <KeyRoundSvg />
    </span>
  );
}

function KeyRoundSvg() {
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
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3" />
    </svg>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.62),#07090e 68%)',
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

  optimizeButton: {
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

  neuralHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.95rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.2),rgba(77,215,255,.06))',
    animation:
      'aarush-neural-pulse 3s ease-in-out infinite',
  },

  neuralOrb: {
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

  neuralCopy: {
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

  neuralCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  neuralCopyP: {
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
    animation: 'aarush-neural-in 240ms ease both',
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
    animation: 'aarush-neural-in 240ms ease both',
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

  commandBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '3rem',
    padding: '.35rem .45rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '.85rem',
    color: '#c9f9ff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.1),rgba(77,215,255,.05))',
  },

  commandInput: {
    minWidth: 0,
    minHeight: '2.35rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.67rem',
  },

  commandButton: {
    minHeight: '2.35rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .6rem',
    border: 0,
    borderRadius: '.6rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  commandSuggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.6rem',
  },

  suggestionChip: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.54rem',
    cursor: 'pointer',
  },

  ecosystemMap: {
    position: 'relative',
    minHeight: '24rem',
    overflow: 'hidden',
    border: '1px solid rgba(77,215,255,.17)',
    borderRadius: '.9rem',
    background:
      'radial-gradient(circle at center,rgba(124,92,255,.18),rgba(77,215,255,.07) 38%,#0b1020 74%)',
  },

  mapLines: {
    position: 'absolute',
    inset: 0,
    opacity: .35,
    backgroundImage:
      'linear-gradient(30deg,transparent 48%,rgba(77,215,255,.25) 49%,transparent 50%),linear-gradient(150deg,transparent 48%,rgba(124,92,255,.25) 49%,transparent 50%)',
    backgroundSize: '7rem 7rem',
    animation: 'aarush-neural-flow 4s linear infinite alternate',
  },

  coreNode: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 2,
    display: 'grid',
    placeItems: 'center',
    gap: '.25rem',
    width: '7rem',
    height: '7rem',
    border: '2px solid rgba(77,215,255,.55)',
    borderRadius: '999px',
    color: '#fff',
    background:
      'radial-gradient(circle,rgba(124,92,255,.75),rgba(17,27,52,.92))',
    boxShadow: '0 0 38px rgba(124,92,255,.5)',
    transform: 'translate(-50%,-50%)',
  },

  coreNodeSpan: {
    fontSize: '.55rem',
  },

  ecosystemNode: {
    position: 'absolute',
    zIndex: 3,
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .45rem',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(8,13,26,.82)',
    fontSize: '.53rem',
    cursor: 'pointer',
  },

  connectionLegend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.6rem',
    marginTop: '.6rem',
    color: '#91a0bc',
    fontSize: '.54rem',
  },

  connectionLegendSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
  },

  connectionLegendI: {
    width: '.45rem',
    height: '.45rem',
    borderRadius: '999px',
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

  agentCardSmall: {
    color: '#6f7d98',
    fontSize: '.54rem',
  },

  agentButton: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.25rem',
    marginTop: '.15rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.57rem',
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

  memoryCategories: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  memoryCategory: {
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

  memoryList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  memoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  memoryIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
  },

  memoryCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  memoryCopySpan: {
    color: '#cbd6ec',
    fontSize: '.59rem',
  },

  memoryCopySmall: {
    color: '#91a0bc',
    fontSize: '.54rem',
  },

  tinyButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.5rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    cursor: 'pointer',
  },

  orchestrationList: {
    display: 'grid',
    gap: '.4rem',
  },

  orchestrationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  flowIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  flowCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  flowCopySmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  readyBadge: {
    padding: '.25rem .4rem',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '.52rem',
  },

  predictionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  predictionCard: {
    minHeight: '5.4rem',
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

  predictionCardSpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  predictionCardStrong: {
    color: '#fff',
    fontSize: '.62rem',
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