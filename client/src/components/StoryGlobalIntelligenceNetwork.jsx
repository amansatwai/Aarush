import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bot,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Globe2,
  Languages,
  LayoutDashboard,
  LiveIcon,
  LockKeyhole,
  Network,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', LayoutDashboard],
  ['map', 'World Map', Globe2],
  ['creators', 'Creators', Users],
  ['brands', 'Brands', Building2],
  ['trends', 'Trends', TrendingUp],
  ['live', 'Live', Play],
  ['commerce', 'Commerce', CircleDollarSign],
  ['privacy', 'Privacy', ShieldCheck],
  ['agents', 'AI Agents', Bot],
  ['command', 'Command', Sparkles],
];

const REGIONS = [
  'India',
  'United States',
  'Europe',
  'Middle East',
  'Southeast Asia',
  'Japan',
  'South Korea',
  'Latin America',
  'Africa',
  'Australia',
];

const AGENT_NAMES = [
  'Creator Agent',
  'Publishing Agent',
  'Trend Agent',
  'Brand Agent',
  'Commerce Agent',
  'Translation Agent',
  'Live Agent',
  'Privacy Agent',
  'Forecast Agent',
  'Operations Agent',
];

function numeric(value) {
  return Number(value) || 0;
}

function compact(value) {
  const amount = numeric(value);

  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }

  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }

  return String(Math.round(amount));
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
    name: agent?.name || AGENT_NAMES[index],
    region: agent?.region || 'Global',
    status: agent?.status || 'Ready',
    completed: numeric(
      agent?.completed || agent?.tasksCompleted
    ),
    score: numeric(
      agent?.score || agent?.optimizationScore
    ),
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

export default function StoryGlobalIntelligenceNetwork({
  network = {},
  regions = [],
  languages = [],
  creators = [],
  brands = [],
  campaigns = [],
  commerce = {},
  live = {},
  analytics = {},
  privacy = {},
  agents = [],
  forecast = {},
  security = {},
  onOpenRegion,
  onOpenCreator,
  onLaunchAgent,
  onRunGlobalOptimization,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [selectedRegion, setSelectedRegion] =
    useState('India');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');

  const agentItems = useMemo(
    () =>
      agents.length
        ? agents.map(normalizeAgent)
        : AGENT_NAMES.map((name, index) =>
            normalizeAgent({ name }, index)
          ),
    [agents]
  );

  const regionItems = useMemo(
    () =>
      regions.length
        ? regions
        : REGIONS.map((name, index) => ({
            id: `region-${index}`,
            name,
            creators: index === 0 ? creators.length : 0,
            trend: index % 3 === 0 ? 'Rising' : 'Stable',
          })),
    [creators.length, regions]
  );

  const filteredCreators = useMemo(() => {
    if (!search) return creators;

    return creators.filter((creator) =>
      [
        creator?.name,
        creator?.country,
        creator?.region,
        creator?.niche,
        creator?.language,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [creators, search]);

  const globalReach =
    numeric(analytics.globalStoryViews) ||
    numeric(analytics.globalReach);

  const intelligenceScore =
    numeric(network.intelligenceScore) ||
    numeric(analytics.intelligenceScore) ||
    88;

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const runCommand = async (command) => {
    await onRunGlobalOptimization?.({
      command,
      networkId: network.id || network.networkId,
      selectedRegion,
      search,
      createdAt: new Date().toISOString(),
    });

    showNotice(`${command} initiated.`);
  };

  const renderOverview = () => (
    <>
      <section style={styles.networkHero}>
        <div style={styles.networkOrb}>
          <Network size={34} />
        </div>
        <div style={styles.networkCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Aarush global intelligence layer
          </span>
          <h1>Worldwide intelligence online</h1>
          <p>
            Connect creators, brands, audiences, commerce,
            broadcasting, privacy, translation, and autonomous
            intelligence across the Aarush ecosystem.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Globe2 size={13} />
              {regionItems.length} active regions
            </span>
            <span>
              <Bot size={13} />
              {agentItems.length} AI agents
            </span>
            <span>
              <ShieldCheck size={13} />
              {security.status || 'Protected'}
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Active Creators"
          value={compact(creators.length)}
          icon={Users}
          color="#4dd7ff"
        />
        <MetricCard
          label="Active Regions"
          value={regionItems.length}
          icon={Globe2}
          color="#a895ff"
        />
        <MetricCard
          label="Languages Supported"
          value={languages.length}
          icon={Languages}
          color="#82e9c1"
        />
        <MetricCard
          label="Live Broadcasts"
          value={compact(live.activeBroadcasts)}
          icon={Play}
          color="#ff4fd8"
        />
        <MetricCard
          label="Global Story Views"
          value={compact(globalReach)}
          icon={BarChart3}
          color="#9deeff"
        />
        <MetricCard
          label="Brand Partners"
          value={compact(brands.length)}
          icon={Building2}
          color="#ffd27d"
        />
        <MetricCard
          label="Monthly Revenue"
          value={money(commerce.monthlyRevenue)}
          icon={CircleDollarSign}
          color="#82e9c1"
        />
        <MetricCard
          label="AI Agents Active"
          value={agentItems.filter(
            (agent) => agent.status !== 'Idle'
          ).length}
          icon={Bot}
          color="#ff9f72"
        />
        <MetricCard
          label="Intelligence Score"
          value={`${intelligenceScore}/100`}
          icon={Sparkles}
          color="#a895ff"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Executive Command Center"
          subtitle="Run intelligence actions across the network."
          icon={Sparkles}
        />
        <CommandGrid onCommand={runCommand} />
      </section>
    </>
  );

  const renderMap = () => (
    <section style={styles.section}>
      <SectionTitle
        title="World Intelligence Map"
        subtitle="Clusters, hotspots, routes, and regional activity."
        icon={Globe2}
      />

      <div style={styles.worldMap}>
        <div style={styles.mapGrid} />
        {regionItems.slice(0, 10).map((region, index) => (
          <button
            type="button"
            key={region.id || region.name || index}
            onClick={() => {
              setSelectedRegion(region.name);
              onOpenRegion?.(region);
            }}
            aria-label={`Open ${region.name} intelligence`}
            style={{
              ...styles.mapPoint,
              left: `${10 + (index * 18) % 80}%`,
              top: `${20 + (index * 25) % 58}%`,
              background:
                index % 2 ? '#4dd7ff' : '#82e9c1',
            }}
          >
            <span>{region.name}</span>
          </button>
        ))}
        <div style={styles.mapFooter}>
          <span>
            Selected region: <strong>{selectedRegion}</strong>
          </span>
          <span>Zoom and routing foundation ready</span>
        </div>
      </div>

      <div style={styles.mapSignals}>
        {[
          ['Creator clusters', Users, network.creatorClusters],
          ['Brand clusters', Building2, network.brandClusters],
          ['Trend hotspots', TrendingUp, network.trendHotspots],
          ['Live regions', Play, live.activeRegions],
          ['Commerce regions', CircleDollarSign, commerce.regions],
          ['Translation activity', Languages, network.translationActivity],
          ['AI activity', Bot, network.aiActivity],
        ].map(([label, Icon, value]) => (
          <div key={label} style={styles.mapSignal}>
            <Icon size={15} />
            <span>{label}</span>
            <strong>{value || 'Active'}</strong>
          </div>
        ))}
      </div>
    </section>
  );

  const renderCreators = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Creator Intelligence"
        subtitle="Worldwide creator growth and collaboration signals."
        icon={Users}
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search creators, regions, niches"
          aria-label="Search creators"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.creatorInsights}>
        <InsightCard
          label="Top creators by region"
          value={analytics.topCreatorsByRegion || 'Foundation'}
          icon={Target}
        />
        <InsightCard
          label="Fastest-growing creators"
          value={analytics.fastestGrowing || 'Foundation'}
          icon={TrendingUp}
        />
        <InsightCard
          label="Emerging creators"
          value={analytics.emergingCreators || 'Foundation'}
          icon={Sparkles}
        />
        <InsightCard
          label="Expansion potential"
          value={analytics.expansionPotential || 'High'}
          icon={Globe2}
        />
      </div>

      <div style={styles.creatorList}>
        {filteredCreators.length ? (
          filteredCreators.slice(0, 12).map((creator, index) => (
            <button
              type="button"
              key={creator.id || index}
              onClick={() => onOpenCreator?.(creator)}
              style={styles.creatorRow}
            >
              <Avatar item={creator} />
              <span style={styles.creatorCopy}>
                <strong>
                  {creator.name || 'Creator'}
                </strong>
                <span>
                  {creator.country ||
                    creator.region ||
                    'Global'}{' '}
                  · {creator.niche || 'Lifestyle'}
                </span>
                <small>
                  {creator.languages?.join?.(' · ') ||
                    creator.language ||
                    'Multilingual'}{' '}
                  · {creator.engagement || 0}% engagement
                </small>
              </span>
              <span style={styles.matchScore}>
                {creator.matchScore || creator.compatibility || 0}%
                match
              </span>
              <ChevronRight size={15} />
            </button>
          ))
        ) : (
          <Empty label="No creator intelligence results." />
        )}
      </div>
    </section>
  );

  const renderBrands = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Brand Intelligence"
        subtitle="Global ecosystem, demand, and market expansion signals."
        icon={Building2}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Active campaigns"
          value={campaigns.length}
          icon={Target}
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
          label="Brand demand"
          value={analytics.brandDemand || 'Rising'}
          icon={TrendingUp}
          color="#82e9c1"
        />
        <MetricCard
          label="Industry growth"
          value={analytics.industryGrowth || 'Foundation'}
          icon={Activity}
          color="#ffd27d"
        />
        <MetricCard
          label="Creator-brand matches"
          value={analytics.creatorBrandMatches || 'Ready'}
          icon={Users}
          color="#9deeff"
        />
        <MetricCard
          label="Market expansion"
          value={analytics.marketExpansion || 'Active'}
          icon={Globe2}
          color="#ff4fd8"
        />
      </div>

      <div style={styles.brandList}>
        {brands.slice(0, 8).map((brand, index) => (
          <div
            key={brand.id || index}
            style={styles.brandRow}
          >
            <span style={styles.brandIcon}>
              <Building2 size={16} />
            </span>
            <span>
              <strong>
                {brand.name || 'Brand partner'}
              </strong>
              <small>
                {brand.industry || 'Industry foundation'} ·{' '}
                {brand.region || 'Global'}
              </small>
            </span>
            <span style={styles.brandStatus}>
              {brand.status || 'Active'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderTrends = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Trend Intelligence"
        subtitle="Forecast global formats, audio, and cultural shifts."
        icon={TrendingUp}
      />

      <div style={styles.trendGrid}>
        {[
          ['Global trending audio', analytics.trendingAudio],
          ['Global hashtags', analytics.trendingHashtags],
          ['Regional viral patterns', forecast.regionalPatterns],
          ['Emerging formats', forecast.emergingFormats],
          ['AI-predicted trends', forecast.predictedTrends],
          ['Cultural trend shifts', forecast.culturalShifts],
        ].map(([label, value], index) => (
          <div key={label} style={styles.trendCard}>
            <span style={styles.trendIcon}>
              {index % 2 ? (
                <Target size={16} />
              ) : (
                <TrendingUp size={16} />
              )}
            </span>
            <span>{label}</span>
            <strong>{value || 'Foundation ready'}</strong>
            <small>
              <TrendingUp size={11} />
              {index % 3 === 0 ? 'Rising' : 'Monitoring'}
            </small>
          </div>
        ))}
      </div>
    </section>
  );

  const renderLive = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Live Intelligence"
        subtitle="Worldwide broadcast, language, and commerce activity."
        icon={Play}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Active broadcasts"
          value={compact(live.activeBroadcasts)}
          icon={Play}
          color="#4dd7ff"
        />
        <MetricCard
          label="Peak viewer regions"
          value={live.peakViewerRegions || 'Global'}
          icon={Globe2}
          color="#a895ff"
        />
        <MetricCard
          label="Language distribution"
          value={live.languageDistribution || 'Active'}
          icon={Languages}
          color="#82e9c1"
        />
        <MetricCard
          label="Guest network"
          value={live.guestCollaborations || 'Ready'}
          icon={Users}
          color="#ffd27d"
        />
        <MetricCard
          label="Translation activity"
          value={live.translationActivity || 'Active'}
          icon={Languages}
          color="#9deeff"
        />
        <MetricCard
          label="Live commerce"
          value={money(live.commerceRevenue)}
          icon={CircleDollarSign}
          color="#ff4fd8"
        />
      </div>

      <div style={styles.liveNetwork}>
        <Play size={21} />
        <div>
          <strong>Live network routing active</strong>
          <span>
            StoryLiveBroadcastStudio and LiveVoiceTranslation
            integration foundations are connected.
          </span>
        </div>
      </div>
    </section>
  );

  const renderCommerce = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Commerce Intelligence"
        subtitle="Global sales, affiliate, brand, and marketplace signals."
        icon={CircleDollarSign}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Story shopping"
          value={money(commerce.storyRevenue)}
          icon={Play}
          color="#4dd7ff"
        />
        <MetricCard
          label="Affiliate revenue"
          value={money(commerce.affiliateRevenue)}
          icon={Network}
          color="#a895ff"
        />
        <MetricCard
          label="Brand revenue"
          value={money(commerce.brandRevenue)}
          icon={Building2}
          color="#82e9c1"
        />
        <MetricCard
          label="Regional sales"
          value={money(commerce.regionalSales)}
          icon={Globe2}
          color="#ffd27d"
        />
        <MetricCard
          label="Top products"
          value={commerce.topProducts || 'Foundation'}
          icon={Target}
          color="#9deeff"
        />
        <MetricCard
          label="Conversion intelligence"
          value={
            commerce.conversionRate
              ? `${commerce.conversionRate}%`
              : 'Foundation'
          }
          icon={TrendingUp}
          color="#ff4fd8"
        />
      </div>

      <div style={styles.commercePanel}>
        <span>Marketplace performance</span>
        <strong>
          {commerce.marketplacePerformance || 'Monitoring'}
        </strong>
      </div>
    </section>
  );

  const renderPrivacy = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Privacy Intelligence"
        subtitle="Global protection, compliance, and security status."
        icon={ShieldCheck}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Protected stories"
          value={compact(privacy.protectedStories)}
          icon={ShieldCheck}
          color="#82e9c1"
        />
        <MetricCard
          label="AI privacy scans"
          value={compact(privacy.aiScans)}
          icon={Sparkles}
          color="#4dd7ff"
        />
        <MetricCard
          label="Sensitive detections"
          value={compact(privacy.sensitiveDetections)}
          icon={LockKeyhole}
          color="#ffd27d"
        />
        <MetricCard
          label="Compliance"
          value={privacy.complianceStatus || 'Monitoring'}
          icon={Check}
          color="#a895ff"
        />
        <MetricCard
          label="Regional policies"
          value={privacy.regionalPolicies || 'Foundation'}
          icon={Globe2}
          color="#9deeff"
        />
        <MetricCard
          label="Security alerts"
          value={numeric(privacy.securityAlerts)}
          icon={ShieldCheck}
          color="#ff7c9f"
        />
      </div>

      <div style={styles.securityNotice}>
        <ShieldCheck size={17} />
        <span>
          Privacy Guardian AI, Security Center, and Privacy
          Dashboard integration foundations are active.
        </span>
      </div>
    </section>
  );

  const renderAgents = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Agent Network"
        subtitle="Autonomous agents coordinating the Aarush ecosystem."
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
            <span>{agent.region}</span>
            <small>
              {agent.completed} tasks · {agent.score || '—'}%
              optimization
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

  const renderCommand = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Executive Command Center"
        subtitle="Coordinate intelligence across the global network."
        icon={Sparkles}
      />

      <CommandGrid onCommand={runCommand} />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search creators, brands, regions, agents..."
          aria-label="Search global intelligence"
          style={styles.searchInput}
        />
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'map') return renderMap();
    if (activeModule === 'creators') return renderCreators();
    if (activeModule === 'brands') return renderBrands();
    if (activeModule === 'trends') return renderTrends();
    if (activeModule === 'live') return renderLive();
    if (activeModule === 'commerce') return renderCommerce();
    if (activeModule === 'privacy') return renderPrivacy();
    if (activeModule === 'agents') return renderAgents();
    if (activeModule === 'command') return renderCommand();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close global intelligence network"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Global Intelligence Network</strong>
          <span>
            The worldwide AI layer for Aarush
          </span>
        </div>

        <button
          type="button"
          aria-label="Network status"
          style={styles.iconButton}
        >
          <Network size={18} />
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
        @keyframes aarush-global-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-global-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 46px rgba(124,92,255,.54);
          }
        }

        .aarush-global-card:hover,
        .aarush-global-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-global-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-global-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-global-agents {
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
    ['Global Trend Scan', TrendingUp],
    ['Worldwide Publishing Optimization', Play],
    ['Global Revenue Optimization', CircleDollarSign],
    ['Creator Expansion Analysis', Users],
    ['Brand Opportunity Scan', Target],
    ['Regional Performance Report', BarChart3],
    ['Launch Autonomous Campaign', Zap],
    ['Executive Intelligence Report', Sparkles],
    ['Simulate Global Growth', Activity],
    ['Coordinate AI Agents', Bot],
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

function InsightCard({ label, value, icon: Icon }) {
  return (
    <div style={styles.insightCard}>
      <span style={styles.insightIcon}>
        <Icon size={16} />
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Avatar({ item }) {
  const source =
    item?.avatar || item?.image || item?.photo;

  if (source) {
    return (
      <img
        src={source}
        alt=""
        loading="lazy"
        style={styles.avatar}
      />
    );
  }

  return (
    <span style={styles.avatarFallback}>
      {String(item?.name || 'A')
        .charAt(0)
        .toUpperCase()}
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

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Network size={25} />
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

  networkHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.95rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.2),rgba(77,215,255,.06))',
    animation:
      'aarush-global-pulse 3s ease-in-out infinite',
  },

  networkOrb: {
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

  networkCopy: {
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

  networkCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  networkCopyP: {
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

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-global-in 240ms ease both',
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
    minHeight: '6.4rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    background: 'rgba(15,19,30,.9)',
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

  worldMap: {
    position: 'relative',
    minHeight: '21rem',
    overflow: 'hidden',
    border: '1px solid rgba(77,215,255,.16)',
    borderRadius: '.9rem',
    background:
      'radial-gradient(ellipse at center,rgba(77,215,255,.16),rgba(124,92,255,.08) 42%,#0b1020 75%)',
  },

  mapGrid: {
    position: 'absolute',
    inset: 0,
    opacity: .35,
    backgroundImage:
      'linear-gradient(rgba(77,215,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(77,215,255,.12) 1px,transparent 1px)',
    backgroundSize: '2rem 2rem',
  },

  mapPoint: {
    position: 'absolute',
    width: '.7rem',
    height: '.7rem',
    padding: 0,
    border: '2px solid rgba(255,255,255,.75)',
    borderRadius: '999px',
    boxShadow: '0 0 18px currentColor',
    cursor: 'pointer',
  },

  mapPointSpan: {
    position: 'absolute',
    top: '.9rem',
    left: '-.8rem',
    width: '5rem',
    color: '#cbd6ec',
    fontSize: '.48rem',
    textAlign: 'left',
  },

  mapFooter: {
    position: 'absolute',
    right: '.7rem',
    bottom: '.6rem',
    left: '.7rem',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  mapFooterStrong: {
    color: '#c9f9ff',
  },

  mapSignals: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  mapSignal: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    gap: '.25rem',
    minHeight: '2.6rem',
    padding: '.45rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.65rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.54rem',
  },

  mapSignalStrong: {
    gridColumn: '2',
    color: '#9deeff',
    fontSize: '.58rem',
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

  creatorInsights: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
    marginBottom: '.7rem',
  },

  insightCard: {
    display: 'grid',
    gap: '.2rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.56rem',
  },

  insightIcon: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.55rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  insightCardStrong: {
    color: '#fff',
    fontSize: '.63rem',
  },

  creatorList: {
    display: 'grid',
    gap: '.4rem',
  },

  creatorRow: {
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

  avatar: {
    width: '2.45rem',
    height: '2.45rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '999px',
  },

  avatarFallback: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  creatorCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  creatorCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  creatorCopySmall: {
    color: '#6f7d98',
    fontSize: '.54rem',
  },

  matchScore: {
    color: '#82e9c1',
    fontSize: '.56rem',
    fontWeight: 850,
  },

  brandList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
  },

  brandIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  brandRowSpan: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  brandRowSmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  brandStatus: {
    color: '#82e9c1',
    fontSize: '.56rem',
  },

  trendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  trendCard: {
    display: 'grid',
    gap: '.22rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  trendIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.55rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  trendCardStrong: {
    color: '#fff',
    fontSize: '.63rem',
  },

  trendCardSmall: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    color: '#82e9c1',
    fontSize: '.53rem',
  },

  liveNetwork: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    marginTop: '.7rem',
    padding: '.75rem',
    border: '1px solid rgba(77,215,255,.16)',
    borderRadius: '.8rem',
    color: '#c9f9ff',
    background:
      'linear-gradient(135deg,rgba(77,215,255,.1),rgba(124,92,255,.05))',
  },

  liveNetworkDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  liveNetworkSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  commercePanel: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(130,233,193,.06)',
    fontSize: '.59rem',
  },

  commercePanelStrong: {
    color: '#c7ffe4',
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
    fontSize: '.59rem',
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