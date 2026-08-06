import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  Activity,
  Award,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  Clock3,
  Download,
  FileBarChart,
  FileText,
  Flame,
  Globe2,
  Heart,
  Image as ImageIcon,
  LineChart,
  MapPin,
  MessageCircle,
  Play,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react';

const insightCards = [
  { label: 'Profile Visits', value: '12.8K', change: '+18.4%', icon: Users, tone: 'purple' },
  { label: 'Reach', value: '284K', change: '+24.7%', icon: Globe2, tone: 'blue' },
  { label: 'Impressions', value: '1.2M', change: '+31.2%', icon: EyeIcon, tone: 'pink' },
  { label: 'Engagement Rate', value: '8.4%', change: '+1.8%', icon: Heart, tone: 'green' },
  { label: 'Follower Growth', value: '+1,284', change: '+12.6%', icon: UserPlus, tone: 'orange' },
  { label: 'Total Followers', value: '18.4K', change: '+8.2%', icon: Users, tone: 'purple' },
];

const achievements = [
  ['12 Milestones', Trophy, '12 milestones completed'],
  ['Creator Level 4', Award, 'Current creator level'],
  ['Verified Status', Check, 'Account verification active'],
  ['Early Builder', Sparkles, 'Aarush early creator'],
  ['100K Views', Play, 'Reached 100K total views'],
  ['7-Day Streak', Flame, 'Created for 7 consecutive days'],
  ['30-Day Streak', Calendar, 'Maintained a 30-day streak'],
  ['Top Creator', Star, 'Top 10% in your category'],
  ['Community Favorite', Heart, 'High-quality community signals'],
  ['Viral Reel', TrendingUp, 'A reel crossed viral threshold'],
  ['Growth Champion', Target, 'Consistent audience growth'],
  ['Consistency Badge', Activity, 'Reliable publishing pattern'],
];

const analyticsSystems = [
  ['Analytics Collection', 'Active'],
  ['View Tracking', 'Active'],
  ['Engagement Tracking', 'Active'],
  ['Audience Segmentation', 'Syncing'],
  ['Creator Scoring', 'Active'],
  ['Realtime Analytics Sync', 'Syncing'],
  ['Impression Tracking', 'Active'],
  ['Reach Engine', 'Active'],
  ['Story Analytics', 'Active'],
  ['Reel Analytics', 'Active'],
  ['Achievement Engine', 'Active'],
  ['Growth Prediction Engine', 'Syncing'],
];

const chartData = {
  '7 Days': [24, 31, 28, 42, 48, 55, 62],
  '30 Days': [22, 28, 35, 31, 44, 51, 60, 58, 66, 72],
  '90 Days': [18, 24, 32, 39, 48, 54, 63, 71, 78, 88],
  '1 Year': [12, 19, 28, 34, 41, 52, 60, 67, 76, 92],
};

function EyeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function StatusBadge({ status }) {
  const config = {
    Active: {
      color: '#d7ffef',
      background: 'rgba(82,232,170,0.12)',
      border: 'rgba(82,232,170,0.18)',
    },
    Syncing: {
      color: '#dce5ff',
      background: 'rgba(124,92,255,0.14)',
      border: 'rgba(124,92,255,0.18)',
    },
    Inactive: {
      color: '#ffb1c8',
      background: 'rgba(255,79,122,0.1)',
      border: 'rgba(255,79,122,0.16)',
    },
  };

  const current = config[status] || config.Inactive;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.34rem 0.52rem',
        borderRadius: '999px',
        background: current.background,
        border: `1px solid ${current.border}`,
        color: current.color,
        fontSize: '0.68rem',
        fontWeight: 850,
        whiteSpace: 'nowrap',
      }}
    >
      {status === 'Syncing' ? <RefreshCw size={11} /> : <Check size={11} />}
      {status}
    </span>
  );
}

function Section({ title, description, icon: Icon, children, action }) {
  return (
    <section
      style={{
        padding: '0.95rem',
        borderRadius: '1.3rem',
        background: 'rgba(15,19,30,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
          <span
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.75rem',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
              color: '#dce8ff',
              flexShrink: 0,
            }}
          >
            <Icon size={15} />
          </span>

          <span>
            <h2 style={{ margin: 0, color: '#f5f8ff', fontSize: '0.98rem', fontWeight: 850 }}>
              {title}
            </h2>
            {description ? (
              <p style={{ margin: '0.25rem 0 0', color: '#8e9bb7', fontSize: '0.74rem', lineHeight: 1.45 }}>
                {description}
              </p>
            ) : null}
          </span>
        </div>

        {action || null}
      </div>

      <div style={{ display: 'grid', gap: '0.6rem' }}>{children}</div>
    </section>
  );
}

function InsightCard({ item }) {
  const Icon = item.icon;

  const colors = {
    purple: ['rgba(124,92,255,0.2)', '#d9d0ff'],
    blue: ['rgba(77,215,255,0.14)', '#c9f5ff'],
    pink: ['rgba(255,79,216,0.14)', '#ffd1ef'],
    green: ['rgba(82,232,170,0.12)', '#d7ffef'],
    orange: ['rgba(255,179,71,0.14)', '#ffdda4'],
  };

  return (
    <div
      style={{
        padding: '0.8rem',
        borderRadius: '1rem',
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.7rem',
          display: 'grid',
          placeItems: 'center',
          background: colors[item.tone][0],
          color: colors[item.tone][1],
        }}
      >
        <Icon size={15} />
      </span>

      <strong
        style={{
          display: 'block',
          marginTop: '0.5rem',
          color: '#f5f8ff',
          fontSize: '0.98rem',
        }}
      >
        {item.value}
      </strong>

      <span
        style={{
          display: 'block',
          marginTop: '0.15rem',
          color: '#8996b2',
          fontSize: '0.7rem',
        }}
      >
        {item.label}
      </span>

      <span
        style={{
          display: 'inline-flex',
          marginTop: '0.45rem',
          color: '#72f0bd',
          fontSize: '0.68rem',
          fontWeight: 800,
        }}
      >
        {item.change}
      </span>
    </div>
  );
}

function MetricRow({ label, value, icon: Icon = Activity }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.7rem',
        borderRadius: '0.9rem',
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.7rem',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, rgba(124,92,255,0.2), rgba(77,215,255,0.12))',
          color: '#dce8ff',
          flexShrink: 0,
        }}
      >
        <Icon size={14} />
      </span>

      <span style={{ flex: 1, color: '#aebbd2', fontSize: '0.78rem', fontWeight: 700 }}>
        {label}
      </span>

      <strong style={{ color: '#f5f8ff', fontSize: '0.82rem' }}>{value}</strong>
    </div>
  );
}

function ProgressBar({ value, color = 'linear-gradient(90deg, #7c5cff, #4dd7ff)' }) {
  return (
    <div
      style={{
        width: '100%',
        height: '0.45rem',
        overflow: 'hidden',
        borderRadius: '999px',
        background: 'rgba(255,255,255,0.12)',
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          borderRadius: '999px',
          background: color,
          boxShadow: '0 0 14px rgba(77,215,255,0.42)',
        }}
      />
    </div>
  );
}

function Chart({ values }) {
  const width = 600;
  const height = 190;
  const padding = 20;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);

  const points = values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Creator growth chart"
      style={{
        width: '100%',
        minHeight: '12rem',
        overflow: 'visible',
      }}
    >
      {[0, 1, 2, 3].map((line) => {
        const y = padding + (line / 3) * (height - padding * 2);

        return (
          <line
            key={line}
            x1={padding}
            y1={y}
            x2={width - padding}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="4 6"
          />
        );
      })}

      <polygon points={areaPoints} fill="rgba(124,92,255,0.16)" />
      <polyline
        points={points}
        fill="none"
        stroke="url(#aarushChartGradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {values.map((value, index) => {
        const x = padding + (index / (values.length - 1)) * (width - padding * 2);
        const y =
          height -
          padding -
          ((value - min) / range) * (height - padding * 2);

        return (
          <circle
            key={`${value}-${index}`}
            cx={x}
            cy={y}
            r="4"
            fill="#4dd7ff"
            stroke="#111827"
            strokeWidth="3"
          />
        );
      })}

      <defs>
        <linearGradient id="aarushChartGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c5cff" />
          <stop offset="50%" stopColor="#ff4fd8" />
          <stop offset="100%" stopColor="#4dd7ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function CreatorAnalytics() {
  const navigate = useNavigate();
  const [range, setRange] = useState('30 Days');
  const [message, setMessage] = useState('');
  const [showAudienceDetails, setShowAudienceDetails] = useState(false);

  const currentChartValues = chartData[range] || chartData['30 Days'];

  const chartData = {
    '7 Days': [24, 31, 28, 42, 48, 55, 62],
    '30 Days': [22, 28, 35, 31, 44, 51, 60, 58, 66, 72],
    '90 Days': [18, 24, 32, 39, 48, 54, 63, 71, 78, 88],
    '1 Year': [12, 19, 28, 34, 41, 52, 60, 67, 76, 92],
  };

  const styles = {
    page: {
      minHeight: '100vh',
      paddingBottom: '6.8rem',
      background:
        'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
      color: '#f4f7ff',
    },
    main: {
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0.9rem 0.9rem 0',
      display: 'grid',
      gap: '0.9rem',
    },
    topRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.7rem',
    },
    iconButton: {
      width: '2.65rem',
      height: '2.65rem',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
    },
    hero: {
      position: 'relative',
      overflow: 'hidden',
      padding: '1.25rem',
      borderRadius: '1.5rem',
      background:
        'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.1) 52%, rgba(255,79,216,0.08))',
      border: '1px solid rgba(124,92,255,0.24)',
      boxShadow: '0 24px 70px rgba(0,0,0,0.3), 0 0 34px rgba(124,92,255,0.12)',
    },
    heroContent: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    heroIcon: {
      width: '4.8rem',
      height: '4.8rem',
      borderRadius: '1.4rem',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
      color: '#fff',
      boxShadow: '0 0 30px rgba(77,215,255,0.22)',
      flexShrink: 0,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '0.55rem',
    },
    rangeRow: {
      display: 'flex',
      gap: '0.45rem',
      overflowX: 'auto',
      paddingBottom: '0.2rem',
    },
    rangeButton: (active) => ({
      flexShrink: 0,
      border: `1px solid ${active ? 'rgba(124,92,255,0.32)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '999px',
      padding: '0.58rem 0.75rem',
      background: active
        ? 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))'
        : 'rgba(255,255,255,0.05)',
      color: active ? '#fff' : '#9aa7c1',
      fontSize: '0.74rem',
      fontWeight: 800,
      cursor: 'pointer',
    }),
    list: {
      display: 'grid',
      gap: '0.55rem',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      padding: '0.72rem',
      borderRadius: '0.95rem',
      background: 'rgba(255,255,255,0.045)',
      border: '1px solid rgba(255,255,255,0.07)',
    },
    barRow: {
      display: 'grid',
      gridTemplateColumns: '7rem 1fr 3rem',
      alignItems: 'center',
      gap: '0.55rem',
    },
    barLabel: {
      color: '#aebbd2',
      fontSize: '0.72rem',
      fontWeight: 750,
    },
    barValue: {
      color: '#f5f8ff',
      fontSize: '0.72rem',
      fontWeight: 850,
      textAlign: 'right',
    },
    achievementGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '0.55rem',
    },
    achievement: {
      padding: '0.75rem',
      borderRadius: '1rem',
      background: 'linear-gradient(135deg, rgba(124,92,255,0.13), rgba(255,255,255,0.04))',
      border: '1px solid rgba(124,92,255,0.16)',
    },
    reportButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.4rem',
      flex: '1 1 10rem',
      padding: '0.72rem 0.65rem',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.045)',
      color: '#dce5f8',
      fontSize: '0.72rem',
      fontWeight: 800,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.page}>
      <TopBar pageTitle="Creator Analytics" notificationCount={3} />

      <main style={styles.main}>
        <div style={styles.topRow}>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            style={styles.iconButton}
            aria-label="Back to profile"
          >
            <ArrowLeft size={18} />
          </button>

          <span style={{ color: '#aab6cf', fontSize: '0.78rem', fontWeight: 750 }}>
            Creator intelligence
          </span>

          <button
            type="button"
            onClick={() => setMessage('Analytics data refreshed.')}
            style={styles.iconButton}
            aria-label="Refresh analytics"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <section style={styles.hero}>
          <div
            style={{
              position: 'absolute',
              right: '-3rem',
              bottom: '-3.5rem',
              width: '12rem',
              height: '12rem',
              borderRadius: '999px',
              background: 'rgba(77,215,255,0.12)',
              filter: 'blur(2.2rem)',
              pointerEvents: 'none',
            }}
          />

          <div style={styles.heroContent}>
            <div style={styles.heroIcon}>
              <BarChart3 size={34} />
            </div>

            <div>
              <h1 style={{ margin: 0, color: '#f7f9ff', fontSize: '1.25rem' }}>
                Creator Insights
              </h1>
              <p
                style={{
                  margin: '0.5rem 0 0',
                  color: '#d5e0f5',
                  fontSize: '0.84rem',
                  lineHeight: 1.55,
                }}
              >
                Track audience growth, content performance, and creator milestones.
              </p>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.42rem 0.6rem',
                borderRadius: '999px',
                background: 'rgba(82,232,170,0.12)',
                border: '1px solid rgba(82,232,170,0.18)',
                color: '#d7ffef',
                fontSize: '0.72rem',
                fontWeight: 850,
              }}
            >
              <Check size={13} />
              Analytics synced
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.42rem 0.6rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#dce5f8',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              <Clock3 size={13} />
              Updated 5 minutes ago
            </span>
          </div>
        </section>

        <Section title="Quick Insights" description="Your most important creator metrics at a glance." icon={Sparkles}>
          <div style={styles.grid}>
            {insightCards.map((item) => (
              <InsightCard key={item.label} item={item} />
            ))}
          </div>
        </Section>

        <Section title="Growth Overview" description="Compare profile visits, reach, followers, and engagement over time." icon={LineChart}>
          <div style={styles.rangeRow}>
            {Object.keys(chartData).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setRange(period)}
                style={styles.rangeButton(range === period)}
              >
                {period}
              </button>
            ))}
          </div>

          <div
            style={{
              padding: '0.7rem',
              borderRadius: '1rem',
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Chart values={currentChartValues} />
          </div>

          <div style={styles.grid}>
            <MetricRow label="Profile visits" value="12.8K" icon={EyeIcon} />
            <MetricRow label="Reach" value="284K" icon={Globe2} />
            <MetricRow label="Followers" value="18.4K" icon={Users} />
            <MetricRow label="Engagement" value="8.4%" icon={Heart} />
          </div>
        </Section>

        <Section title="Audience Insights" description="Shows demographic and behavioral information about your audience." icon={Users}>
          <MetricRow label="Top Active Hours" value="8:00 PM – 10:00 PM" icon={Clock3} />
          <MetricRow label="Top Active Days" value="Mon · Wed · Sat" icon={Calendar} />

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <strong style={{ color: '#dce5f8', fontSize: '0.8rem' }}>Top Locations</strong>
            {[
              ['India', '68%'],
              ['United States', '12%'],
              ['United Kingdom', '5%'],
              ['UAE', '4%'],
              ['Canada', '3%'],
            ].map(([label, value]) => (
              <div key={label} style={styles.barRow}>
                <span style={styles.barLabel}>{label}</span>
                <ProgressBar value={parseInt(value, 10)} />
                <span style={styles.barValue}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <strong style={{ color: '#dce5f8', fontSize: '0.8rem' }}>Top Age Groups</strong>
            {[
              ['18–24', '42%'],
              ['25–34', '33%'],
              ['35–44', '15%'],
              ['45+', '10%'],
            ].map(([label, value]) => (
              <div key={label} style={styles.barRow}>
                <span style={styles.barLabel}>{label}</span>
                <ProgressBar value={parseInt(value, 10)} color="linear-gradient(90deg, #ff4fd8, #7c5cff)" />
                <span style={styles.barValue}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <strong style={{ color: '#dce5f8', fontSize: '0.8rem' }}>Gender Distribution</strong>
            {[
              ['Male', '52%'],
              ['Female', '42%'],
              ['Other', '6%'],
            ].map(([label, value]) => (
              <div key={label} style={styles.barRow}>
                <span style={styles.barLabel}>{label}</span>
                <ProgressBar value={parseInt(value, 10)} color="linear-gradient(90deg, #4dd7ff, #7c5cff)" />
                <span style={styles.barValue}>{value}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAudienceDetails((current) => !current)}
            style={{
              width: '100%',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '999px',
              padding: '0.72rem',
              background: 'rgba(255,255,255,0.045)',
              color: '#dce5f8',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {showAudienceDetails ? 'Hide detailed audience insights' : 'View detailed audience insights'}
          </button>

          {showAudienceDetails ? (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '0.9rem',
                background: 'rgba(124,92,255,0.1)',
                border: '1px solid rgba(124,92,255,0.16)',
                color: '#cddaff',
                fontSize: '0.76rem',
                lineHeight: 1.55,
              }}
            >
              Your audience responds most strongly to development content,
              short-form tutorials, and creator workflow posts during evening
              hours.
            </div>
          ) : null}
        </Section>

        <Section title="Reel Performance" description="Analyzes views, watch time, and retention for reels." icon={Play}>
          <div style={styles.grid}>
            <InsightCard item={{ label: 'Average Reel Views', value: '89.4K', change: '+22%', icon: Play, tone: 'purple' }} />
            <InsightCard item={{ label: 'Average Watch Time', value: '18.6s', change: '+12%', icon: Clock3, tone: 'blue' }} />
            <InsightCard item={{ label: 'Completion Rate', value: '72%', change: '+8%', icon: Check, tone: 'green' }} />
            <InsightCard item={{ label: 'Reel Retention', value: '64%', change: '+6%', icon: TrendingUp, tone: 'pink' }} />
          </div>

          <div
            style={{
              padding: '0.8rem',
              borderRadius: '1rem',
              background: 'rgba(255,255,255,0.045)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <strong style={{ display: 'block', color: '#edf3ff', fontSize: '0.82rem' }}>
              Best Performing Reel
            </strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem', marginTop: '0.65rem' }}>
              {[
                ['Views', '128.4K'],
                ['Likes', '12.4K'],
                ['Comments', '482'],
                ['Shares', '936'],
                ['Saves', '1.8K'],
                ['Watch Time', '2.4K hours'],
              ].map(([label, value]) => (
                <div key={label}>
                  <span style={{ display: 'block', color: '#8996b2', fontSize: '0.68rem' }}>{label}</span>
                  <strong style={{ display: 'block', marginTop: '0.2rem', color: '#f5f8ff', fontSize: '0.78rem' }}>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Story Performance" description="Measures retention, replies, and interactive story activity." icon={Sparkles}>
          <div style={styles.grid}>
            {[
              ['Story Retention', '64%', Activity],
              ['Story Reach', '42.6K', EyeIcon],
              ['Story Exits', '8.2%', TrendingUp],
              ['Story Replies', '1.2K', MessageCircle],
              ['Story Shares', '680', Share2],
              ['Sticker Interactions', '4.8K', Sparkles],
              ['Poll Responses', '2.1K', Check],
              ['Question Responses', '840', MessageCircle],
            ].map(([label, value, Icon]) => (
              <InsightCard
                key={label}
                item={{
                  label,
                  value,
                  change: '+9%',
                  icon: Icon,
                  tone: 'blue',
                }}
              />
            ))}
          </div>
        </Section>

        <Section title="Content Performance" description="Compare performance across posts, reels, stories, and live sessions." icon={BarChart3}>
          {[
            ['Posts', ImageIcon, '42.8K', '31.4K', '7.8%', '1.2K', '640', '482'],
            ['Reels', Play, '128.4K', '96.8K', '12.4%', '1.8K', '936', '482'],
            ['Stories', Sparkles, '42.6K', '28.2K', '9.2%', '420', '680', '1.2K'],
            ['Live Sessions', Video, '18.4K', '14.6K', '6.8%', '210', '142', '96'],
          ].map(([name, Icon, views, reach, engagement, saves, shares, comments]) => (
            <div key={name} style={{ ...styles.item, display: 'grid', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span style={{ width: '2.1rem', height: '2.1rem', borderRadius: '0.7rem', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))', color: '#dce8ff' }}>
                  <Icon size={15} />
                </span>
                <strong style={{ color: '#edf3ff', fontSize: '0.84rem' }}>{name}</strong>
              </div>

              <div style={styles.grid}>
                {[
                  ['Views', views],
                  ['Reach', reach],
                  ['Engagement', engagement],
                  ['Saves', saves],
                  ['Shares', shares],
                  ['Comments', comments],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span style={{ display: 'block', color: '#8996b2', fontSize: '0.66rem' }}>{label}</span>
                    <strong style={{ display: 'block', marginTop: '0.2rem', color: '#dce5f8', fontSize: '0.74rem' }}>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Follower Analytics" description="Understand how followers discover, return to, and engage with your content." icon={Users}>
          <div style={styles.grid}>
            {[
              ['New Followers', '+1,624', UserPlus],
              ['Lost Followers', '-340', Users],
              ['Net Growth', '+1,284', TrendingUp],
              ['Returning Followers', '62%', Activity],
              ['Most Engaged Followers', '2.4K', Heart],
              ['Follower Source', 'Reels', Play],
            ].map(([label, value, Icon]) => (
              <MetricRow key={label} label={label} value={value} icon={Icon} />
            ))}
          </div>
        </Section>

        <Section title="Achievements" description="Displays creator milestones and progress." icon={Trophy}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.55rem' }}>
            {achievements.map(([label, Icon, description]) => (
              <div key={label} style={{ padding: '0.75rem', borderRadius: '1rem', background: 'linear-gradient(135deg, rgba(124,92,255,0.13), rgba(255,255,255,0.04))', border: '1px solid rgba(124,92,255,0.16)' }}>
                <span style={{ width: '2.1rem', height: '2.1rem', borderRadius: '0.7rem', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.08)', color: '#ffdda4' }}>
                  <Icon size={15} />
                </span>
                <strong style={{ display: 'block', marginTop: '0.5rem', color: '#edf3ff', fontSize: '0.76rem' }}>{label}</strong>
                <span style={{ display: 'block', marginTop: '0.2rem', color: '#8996b2', fontSize: '0.68rem', lineHeight: 1.35 }}>{description}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Creator Level System" description="Track XP, level requirements, and benefits unlocked." icon={Award}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.7rem' }}>
            <div>
              <span style={{ display: 'block', color: '#8996b2', fontSize: '0.72rem' }}>Current Level</span>
              <strong style={{ display: 'block', marginTop: '0.25rem', color: '#f5f8ff', fontSize: '1.4rem' }}>Level 4</strong>
            </div>
            <span style={{ width: '3.4rem', height: '3.4rem', borderRadius: '999px', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)', color: '#fff', fontWeight: 900 }}>4</span>
          </div>

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aebbd2', fontSize: '0.72rem', fontWeight: 750 }}>
              <span>XP progress</span>
              <span>7,420 / 10,000 XP</span>
            </div>
            <ProgressBar value={74} />
          </div>

          <MetricRow label="Next level requirement" value="2,580 XP" icon={Target} />
          <MetricRow label="Benefits unlocked" value="6 benefits" icon={Sparkles} />
        </Section>

        <Section title="Monetization Readiness" description="Review quality and trust signals for future creator monetization." icon={Sparkles}>
          <div style={styles.grid}>
            <MetricRow label="Audience Quality" value="Excellent" icon={Users} />
            <MetricRow label="Engagement Quality" value="Good" icon={Heart} />
            <MetricRow label="Creator Trust Score" value="92 / 100" icon={ShieldCheck} />
            <MetricRow label="Brand Collaboration" value="Ready" icon={Sparkles} />
            <MetricRow label="Sponsorship Readiness" value="82%" icon={Target} />
            <MetricRow label="Marketplace Eligibility" value="Eligible" icon={Check} />
          </div>
        </Section>

        <Section title="Reports" description="Export and share creator performance reports." icon={FileBarChart}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {[
              ['Export Analytics Report', Download],
              ['Download CSV', FileText],
              ['Download PDF', Download],
              ['Share Analytics', Send],
              ['Generate Weekly Report', Calendar],
              ['Generate Monthly Report', Calendar],
            ].map(([label, Icon]) => (
              <button
                key={label}
                type="button"
                onClick={() => setMessage(`${label} started.`)}
                style={styles.reportButton}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Analytics Systems Status" description="Live status of background creator analytics services." icon={SettingsIcon}>
          <div style={styles.list}>
            {analyticsSystems.map(([label, status]) => (
              <div key={label} style={styles.item}>
                <span style={{ width: '0.55rem', height: '0.55rem', borderRadius: '999px', background: status === 'Active' ? '#52e8aa' : status === 'Syncing' ? '#a378ff' : '#ff6f9d', boxShadow: status === 'Active' ? '0 0 10px rgba(82,232,170,0.5)' : status === 'Syncing' ? '0 0 10px rgba(163,120,255,0.5)' : '0 0 10px rgba(255,111,157,0.5)', flexShrink: 0 }} />
                <span style={{ flex: 1, color: '#dce5f8', fontSize: '0.78rem', fontWeight: 750 }}>{label}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </Section>

        <section
          style={{
            padding: '0.85rem',
            borderRadius: '1rem',
            background: 'rgba(77,215,255,0.07)',
            border: '1px solid rgba(77,215,255,0.13)',
            color: '#c9f5ff',
            fontSize: '0.76rem',
            lineHeight: 1.55,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={15} />
            Analytics architecture status
          </div>
          Creator analytics is structured for Supabase-backed event collection,
          watch-time tracking, reach aggregation, audience segmentation, creator
          scoring, realtime sync, growth prediction, achievement processing,
          and optimized analytics queries.
        </section>
      </main>

      <BottomNav />

      {message ? (
        <div
          role="status"
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '6.3rem',
            left: '1rem',
            zIndex: 1400,
            width: 'fit-content',
            maxWidth: 'calc(100% - 2rem)',
            margin: '0 auto',
            padding: '0.75rem 0.9rem',
            borderRadius: '999px',
            background: 'rgba(17,22,35,0.96)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#eaf0ff',
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            fontSize: '0.78rem',
            fontWeight: 750,
          }}
        >
          {message}
          <button
            type="button"
            onClick={() => setMessage('')}
            style={{
              marginLeft: '0.6rem',
              border: 0,
              background: 'transparent',
              color: '#aab6cf',
              cursor: 'pointer',
            }}
            aria-label="Dismiss message"
          >
            <X size={13} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SettingsIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4V19a2 2 0 1 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 1.6 11H2a2 2 0 1 1 0-4h.2a2 2 0 0 0 1.4-3.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 9.8 2H10a2 2 0 1 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A2 2 0 0 0 21.4 7h.2a2 2 0 1 1 0 4h-.2a2 2 0 0 0-1.4 3.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}