import { useMemo, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  ChevronRight,
  Globe2,
  Languages,
  MapPin,
  MessageCircle,
  Network,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['map', 'World Map', Globe2],
  ['regions', 'Regions', MapPin],
  ['languages', 'Languages', Languages],
  ['communities', 'Communities', Users],
  ['discovery', 'Discover', Search],
  ['collabs', 'Collaborations', Network],
  ['trends', 'Worldwide Trends', TrendingUp],
  ['translation', 'Translation', Languages],
  ['distribution', 'Distribution', Zap],
];

const DEFAULT_REGIONS = [
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

const DEFAULT_LANGUAGES = [
  'English',
  'Hindi',
  'Hinglish',
  'Spanish',
  'French',
  'German',
  'Arabic',
  'Japanese',
  'Korean',
  'Portuguese',
  'Bengali',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Malayalam',
  'Kannada',
];

const DEFAULT_COMMUNITIES = [
  'Travel',
  'Food',
  'Fitness',
  'Fashion',
  'Tech',
  'Gaming',
  'Music',
  'Art',
  'Education',
  'Business',
  'Luxury',
  'Photography',
];

function numeric(value) {
  return Number(value) || 0;
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

function normalizeCreator(creator, index) {
  return {
    ...creator,
    id: creator?.id || `creator-${index}`,
    name: creator?.name || creator?.username || 'Creator',
    country: creator?.country || creator?.region || 'Global',
    languages: Array.isArray(creator?.languages)
      ? creator.languages
      : ['English'],
    niche: creator?.niche || creator?.category || 'Lifestyle',
    views: numeric(creator?.views || creator?.storyViews),
    engagement: numeric(creator?.engagement),
    matchScore: numeric(
      creator?.matchScore || creator?.compatibility
    ),
  };
}

function normalizeCommunity(community, index) {
  return {
    ...community,
    id: community?.id || `community-${index}`,
    name: community?.name || DEFAULT_COMMUNITIES[index],
    members: numeric(community?.members),
    activity: community?.activity || 'Active',
    niche: community?.niche || community?.name,
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

export default function StoryGlobalCreatorNetwork({
  creator = {},
  regions = [],
  languages = [],
  communities = [],
  creators = [],
  collaborations = [],
  trendingStories = [],
  translationSettings = {},
  onConnectCreator,
  onJoinCommunity,
  onTranslateStory,
  onOpenRegion,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('map');
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] =
    useState('India');
  const [primaryLanguage, setPrimaryLanguage] =
    useState(
      translationSettings.primaryLanguage || 'English'
    );
  const [secondaryLanguage, setSecondaryLanguage] =
    useState(
      translationSettings.secondaryLanguage || 'Hindi'
    );
  const [distribution, setDistribution] =
    useState('Worldwide audience');
  const [notice, setNotice] = useState('');
  const [translationText, setTranslationText] =
    useState('');

  const regionItems = useMemo(
    () =>
      regions.length
        ? regions
        : DEFAULT_REGIONS.map((name, index) => ({
            id: `region-${index}`,
            name,
            creators: index === 0 ? creators.length : 0,
            trend: index % 3 === 0 ? 'Rising' : 'Stable',
          })),
    [creators.length, regions]
  );

  const languageItems = useMemo(
    () => (languages.length ? languages : DEFAULT_LANGUAGES),
    [languages]
  );

  const communityItems = useMemo(
    () =>
      communities.length
        ? communities.map(normalizeCommunity)
        : DEFAULT_COMMUNITIES.map((name, index) => ({
            id: `community-${index}`,
            name,
            members: 0,
            activity: 'Active',
            niche: name,
          })),
    [communities]
  );

  const creatorItems = useMemo(
    () =>
      creators
        .map(normalizeCreator)
        .filter((item) => {
          if (!search) return true;

          return [
            item.name,
            item.country,
            item.niche,
            item.languages.join(' '),
          ]
            .join(' ')
            .toLowerCase()
            .includes(search.toLowerCase());
        }),
    [creators, search]
  );

  const globalCreators = useMemo(
    () =>
      regionItems.reduce(
        (sum, region) =>
          sum + numeric(region.creators || region.creatorCount),
        0
      ),
    [regionItems]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const translateStory = () => {
    if (!translationText.trim()) {
      showNotice('Enter text to translate.');
      return;
    }

    onTranslateStory?.({
      text: translationText,
      primaryLanguage,
      secondaryLanguage,
      culturalAdaptation: true,
      regionalToneOptimization: true,
    });

    showNotice('Translation request prepared.');
  };

  const renderMap = () => (
    <>
      <section style={styles.networkHero}>
        <div style={styles.globeOrb}>
          <Globe2 size={34} />
        </div>
        <div style={styles.networkCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Global creator intelligence
          </span>
          <h1>Worldwide network connected</h1>
          <p>
            Discover creators, communities, trends, and
            cross-region opportunities across languages and
            time zones.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Users size={13} />
              {formatCompact(globalCreators)} active creators
            </span>
            <span>
              <Network size={13} />
              {regionItems.length} regions monitored
            </span>
          </div>
        </div>
      </section>

      <section style={styles.mapPanel}>
        <SectionTitle
          title="World Map"
          subtitle="Interactive global distribution foundation."
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
              aria-label={`Open ${region.name} region`}
              style={{
                ...styles.mapPoint,
                left: `${12 + (index * 17) % 78}%`,
                top: `${25 + (index * 23) % 54}%`,
                background:
                  index % 3 === 0
                    ? '#82e9c1'
                    : '#4dd7ff',
              }}
            >
              <span>{region.name}</span>
            </button>
          ))}
          <div style={styles.mapCaption}>
            <Activity size={14} />
            Story distribution heatmap foundation
          </div>
        </div>

        <div style={styles.metricGrid}>
          <MetricCard
            label="Active creators"
            value={formatCompact(globalCreators)}
            icon={Users}
            color="#4dd7ff"
          />
          <MetricCard
            label="Trending regions"
            value={regionItems.filter(
              (region) => region.trend === 'Rising'
            ).length}
            icon={TrendingUp}
            color="#82e9c1"
          />
          <MetricCard
            label="Collaboration hotspots"
            value={collaborations.length}
            icon={Network}
            color="#a895ff"
          />
          <MetricCard
            label="Language clusters"
            value={languageItems.length}
            icon={Languages}
            color="#ffd27d"
          />
        </div>
      </section>
    </>
  );

  const renderRegions = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Regions"
        subtitle="Explore creator density and regional momentum."
        icon={MapPin}
      />

      <div style={styles.regionGrid}>
        {regionItems.map((region, index) => (
          <button
            type="button"
            key={region.id || region.name || index}
            onClick={() => {
              setSelectedRegion(region.name);
              onOpenRegion?.(region);
            }}
            style={{
              ...styles.regionCard,
              ...(selectedRegion === region.name
                ? styles.activeRegionCard
                : {}),
            }}
          >
            <MapPin size={16} />
            <strong>{region.name}</strong>
            <span>
              {formatCompact(
                region.creators || region.creatorCount
              )}{' '}
              creators
            </span>
            <small>
              {region.trend || 'Stable'} ·{' '}
              {region.summary || 'Trend summary foundation'}
            </small>
          </button>
        ))}
      </div>
    </section>
  );

  const renderLanguages = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Languages"
        subtitle="Prepare multilingual publishing and discovery."
        icon={Languages}
      />

      <div style={styles.languageSelectors}>
        <label style={styles.field}>
          Primary language
          <select
            value={primaryLanguage}
            onChange={(event) =>
              setPrimaryLanguage(event.target.value)
            }
            style={styles.select}
          >
            {languageItems.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </label>

        <label style={styles.field}>
          Secondary language
          <select
            value={secondaryLanguage}
            onChange={(event) =>
              setSecondaryLanguage(event.target.value)
            }
            style={styles.select}
          >
            {languageItems.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={styles.languageGrid}>
        {languageItems.map((language, index) => (
          <button
            type="button"
            key={language}
            onClick={() => setPrimaryLanguage(language)}
            style={styles.languageChip}
          >
            <Languages size={14} />
            {language}
            <small>{index % 3 === 0 ? 'Popular' : 'Ready'}</small>
          </button>
        ))}
      </div>
    </section>
  );

  const renderCommunities = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Communities"
        subtitle="Connect through global creator niches."
        icon={Users}
      />

      <div style={styles.communityGrid}>
        {communityItems.map((community) => (
          <div
            key={community.id}
            style={styles.communityCard}
          >
            <span style={styles.communityIcon}>
              <Users size={17} />
            </span>
            <strong>{community.name}</strong>
            <span>
              {formatCompact(community.members)} members
            </span>
            <small>{community.activity}</small>
            <button
              type="button"
              onClick={() => {
                onJoinCommunity?.(community);
                showNotice(
                  `Joined ${community.name} community.`
                );
              }}
              style={styles.joinButton}
            >
              Join community
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  const renderDiscovery = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Global Creator Discovery"
        subtitle="Find compatible creators across regions and niches."
        icon={Search}
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search creators, countries, languages, niches"
          aria-label="Search global creators"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.creatorGrid}>
        {creatorItems.length ? (
          creatorItems.map((item) => (
            <CreatorCard
              key={item.id}
              creator={item}
              onConnect={() => {
                onConnectCreator?.(item);
                showNotice(`Connection sent to ${item.name}.`);
              }}
            />
          ))
        ) : (
          <Empty label="No creators found." />
        )}
      </div>
    </section>
  );

  const renderCollabs = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Cross-Region Collaborations"
        subtitle="AI-matched international collaboration opportunities."
        icon={Network}
      />

      <div style={styles.collabList}>
        {(
          collaborations.length
            ? collaborations
            : [
                {
                  id: 'india-japan',
                  title: 'India ↔ Japan',
                  languages: 'English · Hindi · Japanese',
                  overlap: 78,
                  idea: 'Travel and visual culture series',
                },
                {
                  id: 'india-europe',
                  title: 'India ↔ Europe',
                  languages: 'English · Hindi · French',
                  overlap: 71,
                  idea: 'Food and city storytelling',
                },
                {
                  id: 'india-us',
                  title: 'India ↔ United States',
                  languages: 'English · Hinglish',
                  overlap: 84,
                  idea: 'Creator growth exchange',
                },
                {
                  id: 'india-middle-east',
                  title: 'India ↔ Middle East',
                  languages: 'English · Hindi · Arabic',
                  overlap: 69,
                  idea: 'Fashion and luxury content',
                },
              ]
        ).map((collab, index) => (
          <div
            key={collab.id || index}
            style={styles.collabRow}
          >
            <span style={styles.collabIcon}>
              <Network size={17} />
            </span>
            <div style={styles.collabCopy}>
              <strong>
                {collab.title ||
                  `${collab.from} ↔ ${collab.to}`}
              </strong>
              <span>
                {collab.languages ||
                  'Language compatibility foundation'}
              </span>
              <small>
                {collab.idea ||
                  'Collaboration concept foundation'}
              </small>
            </div>
            <span style={styles.matchScore}>
              {collab.overlap || collab.matchScore || 0}%
              match
            </span>
            <ChevronRight size={15} />
          </div>
        ))}
      </div>
    </section>
  );

  const renderTrends = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Trending Worldwide"
        subtitle="Global formats, sounds, and emerging markets."
        icon={TrendingUp}
      />

      <div style={styles.trendGrid}>
        {[
          ['Trending audio', trendsAudio(trendingStories), Video],
          ['Trending hashtags', '#travelstory #creatorworld', Target],
          ['Visual styles', 'Cinematic documentary', Sparkles],
          ['Trending challenges', 'Culture exchange', Zap],
          ['Emerging markets', 'Southeast Asia', Globe2],
          ['Fast-growing regions', 'Middle East', TrendingUp],
        ].map(([label, value, Icon]) => (
          <div
            key={label}
            style={styles.trendCard}
          >
            <Icon size={16} />
            <span>{label}</span>
            <strong>{value}</strong>
            <small>
              <TrendingUp size={11} />
              Rising
            </small>
          </div>
        ))}
      </div>
    </section>
  );

  const renderTranslation = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Translation"
        subtitle="Prepare captions, subtitles, and cultural adaptation."
        icon={Languages}
      />

      <div style={styles.translationHero}>
        <Sparkles size={21} />
        <div>
          <strong>
            {primaryLanguage} → {secondaryLanguage}
          </strong>
          <span>
            Regional tone optimization and sticker translation
            foundation included.
          </span>
        </div>
      </div>

      <label style={styles.field}>
        Caption or subtitle text
        <textarea
          value={translationText}
          onChange={(event) =>
            setTranslationText(event.target.value)
          }
          placeholder="Enter story caption or subtitle text"
          style={styles.textarea}
        />
      </label>

      <div style={styles.translationFeatures}>
        {[
          'Caption translation',
          'Subtitle translation',
          'Cultural adaptation',
          'Regional tone optimization',
          'Sticker translation foundation',
        ].map((feature) => (
          <span key={feature} style={styles.featureChip}>
            <Check size={13} />
            {feature}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={translateStory}
        style={styles.primaryButton}
      >
        <Languages size={16} />
        Prepare translation
      </button>
    </section>
  );

  const renderDistribution = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Distribution Network"
        subtitle="Route stories to the right audiences and time zones."
        icon={Zap}
      />

      <div style={styles.distributionGrid}>
        {[
          'Local audience',
          'Regional audience',
          'Worldwide audience',
          'Language-specific distribution',
          'Time-zone optimized publishing',
          'Region-specific scheduling',
        ].map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => setDistribution(option)}
            aria-pressed={distribution === option}
            style={{
              ...styles.distributionButton,
              ...(distribution === option
                ? styles.activeDistributionButton
                : {}),
            }}
          >
            <Globe2 size={15} />
            <span>{option}</span>
            {distribution === option ? (
              <Check
                size={14}
                style={{ marginLeft: 'auto' }}
              />
            ) : null}
          </button>
        ))}
      </div>

      <div style={styles.distributionMeta}>
        <span>Selected route</span>
        <strong>{distribution}</strong>
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'map') return renderMap();
    if (activeModule === 'regions') return renderRegions();
    if (activeModule === 'languages') return renderLanguages();
    if (activeModule === 'communities') return renderCommunities();
    if (activeModule === 'discovery') return renderDiscovery();
    if (activeModule === 'collabs') return renderCollabs();
    if (activeModule === 'trends') return renderTrends();
    if (activeModule === 'translation') return renderTranslation();
    if (activeModule === 'distribution') return renderDistribution();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close global creator network"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Global Creator Network</strong>
          <span>
            Discover beyond borders
          </span>
        </div>

        <button
          type="button"
          aria-label="Global network status"
          style={styles.iconButton}
        >
          <Globe2 size={18} />
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
        @keyframes aarush-network-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-network-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-network-card:hover,
        .aarush-network-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-network-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-network-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-network-creators,
          .aarush-network-communities {
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

function CreatorCard({ creator, onConnect }) {
  return (
    <article style={styles.creatorCard}>
      <Avatar item={creator} />
      <strong>{creator.name}</strong>
      <span>
        <MapPin size={12} />
        {creator.country}
      </span>
      <small>
        {creator.languages.join(' · ')}
      </small>
      <span>{creator.niche}</span>

      <div style={styles.creatorStats}>
        <span>
          <small>Views</small>
          <strong>{formatCompact(creator.views)}</strong>
        </span>
        <span>
          <small>Engagement</small>
          <strong>{creator.engagement}%</strong>
        </span>
        <span>
          <small>Match</small>
          <strong>{creator.matchScore}%</strong>
        </span>
      </div>

      <button
        type="button"
        onClick={onConnect}
        style={styles.connectButton}
      >
        <MessageCircle size={13} />
        Connect
      </button>
    </article>
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

function trendsAudio(stories) {
  const first = stories?.[0];

  return (
    first?.audio ||
    first?.sound ||
    'Global cinematic audio'
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Globe2 size={25} />
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
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-network-pulse 3s ease-in-out infinite',
  },

  globeOrb: {
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
    maxWidth: '40rem',
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
    animation: 'aarush-network-in 240ms ease both',
  },

  mapPanel: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
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

  worldMap: {
    position: 'relative',
    minHeight: '20rem',
    overflow: 'hidden',
    border: '1px solid rgba(77,215,255,.15)',
    borderRadius: '.9rem',
    background:
      'radial-gradient(ellipse at center,rgba(77,215,255,.15),rgba(124,92,255,.08) 40%,#0b1020 75%)',
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
    border: '2px solid rgba(255,255,255,.7)',
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

  mapCaption: {
    position: 'absolute',
    right: '.7rem',
    bottom: '.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.25rem',
    color: '#91a0bc',
    fontSize: '.55rem',
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

  regionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  regionCard: {
    display: 'grid',
    justifyItems: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeRegionCard: {
    borderColor: 'rgba(124,92,255,.45)',
    background: 'rgba(124,92,255,.14)',
  },

  regionCardSpan: {
    color: '#9deeff',
    fontSize: '.58rem',
  },

  regionCardSmall: {
    color: '#91a0bc',
    fontSize: '.54rem',
  },

  languageSelectors: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.5rem',
  },

  languageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  languageChip: {
    minHeight: '2.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .45rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.65rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.56rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  languageChipSmall: {
    marginLeft: 'auto',
    color: '#91a0bc',
    fontSize: '.48rem',
  },

  communityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  communityCard: {
    display: 'grid',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
  },

  communityIcon: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.55rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  communityCardSpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  communityCardSmall: {
    color: '#82e9c1',
    fontSize: '.54rem',
  },

  joinButton: {
    minHeight: '2.1rem',
    marginTop: '.2rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '.55rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.08)',
    fontSize: '.54rem',
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
  },

  avatar: {
    width: '2.75rem',
    height: '2.75rem',
    objectFit: 'cover',
    borderRadius: '999px',
  },

  avatarFallback: {
    width: '2.75rem',
    height: '2.75rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  creatorCardSpan: {
    display: 'flex',
    alignItems: 'center',
    gap: '.2rem',
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  creatorCardSmall: {
    color: '#9deeff',
    fontSize: '.55rem',
  },

  creatorStats: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.25rem',
    margin: '.2rem 0',
  },

  creatorStatsSpan: {
    display: 'grid',
    gap: '.14rem',
  },

  creatorStatsSmall: {
    color: '#91a0bc',
    fontSize: '.48rem',
  },

  creatorStatsStrong: {
    color: '#fff',
    fontSize: '.58rem',
  },

  connectButton: {
    width: '100%',
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.25rem',
    border: 0,
    borderRadius: '.6rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  collabList: {
    display: 'grid',
    gap: '.4rem',
  },

  collabRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  collabIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
  },

  collabCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  collabCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  collabCopySmall: {
    color: '#6f7d98',
    fontSize: '.54rem',
  },

  matchScore: {
    color: '#82e9c1',
    fontSize: '.56rem',
    fontWeight: 850,
  },

  trendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  trendCard: {
    display: 'grid',
    gap: '.23rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  trendCardSpan: {
    color: '#91a0bc',
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

  translationHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.75rem',
    border: '1px solid rgba(124,92,255,.18)',
    borderRadius: '.8rem',
    color: '#c9f9ff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.12),rgba(77,215,255,.05))',
  },

  translationHeroDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  translationHeroSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    marginTop: '.65rem',
    color: '#aab6cf',
    fontSize: '.62rem',
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

  textarea: {
    minHeight: '6rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    resize: 'vertical',
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.66rem',
    lineHeight: 1.45,
  },

  translationFeatures: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.6rem',
  },

  featureChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    padding: '.35rem .45rem',
    borderRadius: '999px',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.54rem',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    width: '100%',
    marginTop: '.7rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  distributionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  distributionButton: {
    minHeight: '2.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeDistributionButton: {
    borderColor: 'rgba(77,215,255,.35)',
    color: '#fff',
    background: 'rgba(77,215,255,.1)',
  },

  distributionMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginTop: '.7rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.59rem',
  },

  distributionMetaStrong: {
    color: '#c9f9ff',
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