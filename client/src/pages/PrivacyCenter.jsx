import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Ban,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  Globe2,
  Heart,
  KeyRound,
  Link2,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Navigation,
  Plus,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Video,
  VolumeX,
  X,
} from 'lucide-react';

const initialPrivacyState = {
  accountPrivate: false,
  approveFollowers: true,
  hideFromSearch: false,
  hideSuggestions: false,
  hideActivityFromNonFollowers: false,
  showOnlineStatus: true,
  showLastSeen: true,
  showTypingIndicator: true,
  showReadReceipts: true,
  hideActiveNow: false,
  invisibleMode: false,
  allowStoryReplies: true,
  allowStoryMentions: true,
  allowStorySharing: true,
  allowStoryDownloads: false,
  storyArchive: true,
  reviewTaggedPosts: true,
  approveMentionsManually: true,
  hiddenMentions: false,
  mentionRequests: true,
  messageRequests: true,
  groupInvites: true,
  callPermissions: true,
  videoCallPermissions: true,
  voiceCallPermissions: true,
  forwardingPermissions: true,
  filterOffensiveWords: true,
  spamFilter: true,
  linkFilter: true,
  emojiFilter: false,
  disableLocationSharing: false,
  approximateLocation: true,
  preciseLocation: false,
  nearbyPermission: true,
  backgroundLocation: false,
  profileVisibility: true,
  followersVisibility: true,
  followingVisibility: true,
  likesVisibility: true,
  savedVisibility: false,
  reelsVisibility: true,
  storyVisibility: true,
  taggedVisibility: true,
};

const initialPrivacyChoices = {
  storyAudience: 'Followers',
  commentPermission: 'Everyone',
  likePermission: 'Everyone',
  sharePermission: 'Followers',
  savePermission: 'Everyone',
  downloadPermission: 'Nobody',
  remixPermission: 'Followers',
  duetPermission: 'Followers',
  collaborationPermission: 'Followers',
  mentionPermission: 'Everyone',
  tagPermission: 'Followers',
  messagePermission: 'Followers',
  locationMode: 'Approximate location',
  callPermission: 'Followers',
};

const initialLists = {
  closeFriends: ['design.loop', 'arush.team', 'creator.lab'],
  blocked: ['spam.account'],
  restricted: ['unknown.user'],
  muted: ['noisy.creator'],
  hiddenWords: ['spoiler', 'spam'],
};

const sections = [
  {
    id: 'account',
    title: 'Account Privacy',
    icon: Lock,
    description: 'Control how people discover and interact with your account.',
  },
  {
    id: 'activity',
    title: 'Activity Status',
    icon: Activity,
    description: 'Control presence, active status, typing, and read visibility.',
  },
  {
    id: 'story',
    title: 'Story Privacy',
    icon: Sparkles,
    description: 'Choose who can view and interact with your stories.',
  },
  {
    id: 'post',
    title: 'Post Privacy',
    icon: ImageIcon,
    description: 'Control engagement, downloads, remixing, and sharing.',
  },
  {
    id: 'mentions',
    title: 'Mentions & Tags',
    icon: Tag,
    description: 'Review mentions and tagged content before it appears.',
  },
  {
    id: 'messaging',
    title: 'Messaging Privacy',
    icon: MessageCircle,
    description: 'Manage messages, group invitations, and call permissions.',
  },
  {
    id: 'block',
    title: 'Block & Restrict',
    icon: Ban,
    description: 'Manage blocked, restricted, muted, and hidden accounts.',
  },
  {
    id: 'words',
    title: 'Hidden Words',
    icon: EyeOff,
    description: 'Filter offensive content, spam, links, and custom words.',
  },
  {
    id: 'friends',
    title: 'Close Friends',
    icon: Users,
    description: 'Manage trusted audiences and priority story visibility.',
  },
  {
    id: 'location',
    title: 'Location Privacy',
    icon: MapPin,
    description: 'Control precise, approximate, nearby, and background location.',
  },
  {
    id: 'visibility',
    title: 'Data & Visibility',
    icon: Eye,
    description: 'Choose which parts of your account are publicly visible.',
  },
];

function Toggle({ label, description, checked, onChange, danger = false }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.78rem',
        borderRadius: '0.95rem',
        background: danger ? 'rgba(255,79,122,0.07)' : 'rgba(255,255,255,0.045)',
        border: `1px solid ${danger ? 'rgba(255,79,122,0.14)' : 'rgba(255,255,255,0.07)'}`,
        color: '#dce5f8',
        cursor: 'pointer',
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: 'block', color: danger ? '#ffb1c8' : '#eaf0ff', fontSize: '0.82rem' }}>
          {label}
        </strong>
        {description ? (
          <span style={{ display: 'block', marginTop: '0.22rem', color: '#8996b2', fontSize: '0.73rem', lineHeight: 1.4 }}>
            {description}
          </span>
        ) : null}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />

      <span
        style={{
          width: '2.75rem',
          height: '1.5rem',
          borderRadius: '999px',
          padding: '0.16rem',
          display: 'flex',
          justifyContent: checked ? 'flex-end' : 'flex-start',
          background: checked
            ? 'linear-gradient(90deg, #7c5cff, #4dd7ff)'
            : 'rgba(255,255,255,0.13)',
          transition: 'background 180ms ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: '1.18rem',
            height: '1.18rem',
            borderRadius: '999px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.24)',
          }}
        />
      </span>
    </label>
  );
}

function SelectRow({ label, value, options, onChange, description }) {
  return (
    <label
      style={{
        display: 'grid',
        gap: '0.42rem',
        padding: '0.78rem',
        borderRadius: '0.95rem',
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span style={{ color: '#eaf0ff', fontSize: '0.82rem', fontWeight: 800 }}>{label}</span>
      {description ? <span style={{ color: '#8996b2', fontSize: '0.73rem' }}>{description}</span> : null}
      <span style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          style={{
            width: '100%',
            appearance: 'none',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem',
            background: 'rgba(255,255,255,0.05)',
            color: '#f4f7ff',
            padding: '0.68rem 2rem 0.68rem 0.72rem',
            outline: 0,
            fontSize: '0.8rem',
            fontWeight: 750,
          }}
        >
          {options.map((option) => (
            <option key={option} value={option} style={{ background: '#111724', color: '#fff' }}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          style={{
            position: 'absolute',
            right: '0.65rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#91a0bc',
          }}
        />
      </span>
    </label>
  );
}

function RowButton({ icon: Icon, label, description, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        padding: '0.78rem',
        borderRadius: '0.95rem',
        border: `1px solid ${danger ? 'rgba(255,79,122,0.16)' : 'rgba(255,255,255,0.07)'}`,
        background: danger ? 'rgba(255,79,122,0.07)' : 'rgba(255,255,255,0.045)',
        color: danger ? '#ffb1c8' : '#eaf0ff',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.7rem',
          display: 'grid',
          placeItems: 'center',
          background: danger
            ? 'rgba(255,79,122,0.14)'
            : 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
          flexShrink: 0,
        }}
      >
        <Icon size={14} />
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: 'block', fontSize: '0.82rem' }}>{label}</strong>
        {description ? (
          <span style={{ display: 'block', marginTop: '0.2rem', color: '#8996b2', fontSize: '0.73rem' }}>
            {description}
          </span>
        ) : null}
      </span>

      <ChevronRight size={15} color={danger ? '#ff9dbd' : '#8190ad'} />
    </button>
  );
}

function SectionCard({ section, expanded, onToggle, children }) {
  const Icon = section.icon;

  return (
    <section
      style={{
        padding: '0.95rem',
        borderRadius: '1.25rem',
        background: 'rgba(15,19,30,0.92)',
        border: `1px solid ${expanded ? 'rgba(124,92,255,0.24)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          border: 0,
          background: 'transparent',
          color: '#f5f8ff',
          textAlign: 'left',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <span
          style={{
            width: '2.15rem',
            height: '2.15rem',
            borderRadius: '0.8rem',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
            color: '#dce8ff',
            flexShrink: 0,
          }}
        >
          <Icon size={16} />
        </span>

        <span style={{ flex: 1 }}>
          <strong style={{ display: 'block', fontSize: '0.9rem' }}>{section.title}</strong>
          <span style={{ display: 'block', marginTop: '0.22rem', color: '#8996b2', fontSize: '0.74rem', lineHeight: 1.4 }}>
            {section.description}
          </span>
        </span>

        <ChevronDown
          size={17}
          color="#91a0bc"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 180ms ease',
            flexShrink: 0,
          }}
        />
      </button>

      {expanded ? (
        <div
          style={{
            display: 'grid',
            gap: '0.55rem',
            marginTop: '0.85rem',
            paddingTop: '0.8rem',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

function ListManager({ title, items, onAdd, onRemove, placeholder }) {
  const [value, setValue] = useState('');

  const addItem = () => {
    const cleanValue = value.trim();
    if (!cleanValue || items.includes(cleanValue)) return;
    onAdd(cleanValue);
    setValue('');
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: '0.65rem',
        padding: '0.8rem',
        borderRadius: '1rem',
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <strong style={{ color: '#eaf0ff', fontSize: '0.82rem' }}>{title}</strong>

      <div style={{ display: 'flex', gap: '0.45rem' }}>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            padding: '0.68rem',
            outline: 0,
            fontSize: '0.8rem',
          }}
        />
        <button
          type="button"
          onClick={addItem}
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.75rem',
            border: 0,
            background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Plus size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onRemove(item)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.42rem 0.55rem',
              borderRadius: '999px',
              border: '1px solid rgba(124,92,255,0.16)',
              background: 'rgba(124,92,255,0.1)',
              color: '#dce5ff',
              fontSize: '0.72rem',
              fontWeight: 750,
              cursor: 'pointer',
            }}
          >
            {item}
            <X size={11} />
          </button>
        ))}
      </div>
    </div>
  );
}

function DashboardCard({ icon: Icon, label, value, tone = 'default' }) {
  const colors = {
    default: ['rgba(124,92,255,0.2)', '#dce5ff'],
    warning: ['rgba(255,179,71,0.16)', '#ffdda4'],
    danger: ['rgba(255,79,122,0.14)', '#ffb1c8'],
    success: ['rgba(77,215,255,0.14)', '#c9f5ff'],
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
          background: colors[tone][0],
          color: colors[tone][1],
        }}
      >
        <Icon size={15} />
      </span>
      <strong style={{ display: 'block', marginTop: '0.55rem', color: colors[tone][1], fontSize: '0.9rem' }}>
        {value}
      </strong>
      <span style={{ display: 'block', marginTop: '0.18rem', color: '#8996b2', fontSize: '0.72rem', lineHeight: 1.35 }}>
        {label}
      </span>
    </div>
  );
}

export default function PrivacyCenter() {
  const navigate = useNavigate();
  const [privacy, setPrivacy] = useState(initialPrivacyState);
  const [choices, setChoices] = useState(initialPrivacyChoices);
  const [lists, setLists] = useState(initialLists);
  const [expandedSection, setExpandedSection] = useState('account');
  const [showDashboard, setShowDashboard] = useState(true);
  const [showConnectedApps, setShowConnectedApps] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [recentChange, setRecentChange] = useState('No changes yet');

  const updatePrivacy = (key, value) => {
    setPrivacy((current) => ({ ...current, [key]: value }));
    setRecentChange(`${key} was updated just now`);
  };

  const updateChoice = (key, value) => {
    setChoices((current) => ({ ...current, [key]: value }));
    setRecentChange(`${key} was updated just now`);
  };

  const addToList = (listName, value) => {
    setLists((current) => ({
      ...current,
      [listName]: [...current[listName], value],
    }));
    setRecentChange(`${value} was added to ${listName}`);
  };

  const removeFromList = (listName, value) => {
    setLists((current) => ({
      ...current,
      [listName]: current[listName].filter((item) => item !== value),
    }));
    setRecentChange(`${value} was removed from ${listName}`);
  };

  const privacyScore = useMemo(() => {
    const keys = Object.keys(privacy);
    const enabled = keys.filter((key) => privacy[key]).length;
    return Math.min(98, Math.max(42, Math.round((enabled / keys.length) * 100)));
  }, [privacy]);

  const styles = {
    page: {
      minHeight: '100vh',
      background:
        'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
      color: '#f4f7ff',
      paddingBottom: '6.9rem',
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
    dashboard: {
      padding: '1rem',
      borderRadius: '1.35rem',
      background: 'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(77,215,255,0.08))',
      border: '1px solid rgba(124,92,255,0.2)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
    },
    scoreRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
    },
    scoreCircle: {
      width: '5rem',
      height: '5rem',
      borderRadius: '999px',
      display: 'grid',
      placeItems: 'center',
      background: `conic-gradient(#4dd7ff ${privacyScore}%, rgba(255,255,255,0.12) ${privacyScore}% 100%)`,
      flexShrink: 0,
    },
    scoreInner: {
      width: '4.15rem',
      height: '4.15rem',
      borderRadius: '999px',
      display: 'grid',
      placeItems: 'center',
      background: '#111827',
      color: '#fff',
      fontSize: '1.08rem',
      fontWeight: 900,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '0.55rem',
    },
    notice: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.55rem',
      padding: '0.75rem',
      borderRadius: '0.95rem',
      background: 'rgba(255,179,71,0.08)',
      border: '1px solid rgba(255,179,71,0.14)',
      color: '#ffdda4',
      fontSize: '0.76rem',
      lineHeight: 1.5,
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 1300,
      display: 'grid',
      placeItems: 'center',
      padding: '1rem',
      background: 'rgba(2,5,10,0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    },
    modal: {
      width: 'min(100%, 520px)',
      maxHeight: '86vh',
      overflowY: 'auto',
      padding: '1rem',
      borderRadius: '1.35rem',
      background: 'linear-gradient(180deg, rgba(17,22,35,0.99), rgba(9,13,22,0.99))',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
    },
  };

  return (
    <div style={styles.page}>
      <TopBar pageTitle="Privacy Center" notificationCount={3} />

      <main style={styles.main}>
        <div style={styles.topRow}>
          <button type="button" onClick={() => navigate(-1)} style={styles.iconButton} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>

          <span style={{ color: '#aab6cf', fontSize: '0.78rem', fontWeight: 750 }}>
            Your privacy, your control
          </span>

          <button
            type="button"
            onClick={() => setShowDashboard((current) => !current)}
            style={styles.iconButton}
            aria-label="Toggle privacy dashboard"
          >
            <ShieldCheck size={17} />
          </button>
        </div>

        {showDashboard ? (
          <section style={styles.dashboard}>
            <div style={styles.scoreRow}>
              <div style={styles.scoreCircle}>
                <div style={styles.scoreInner}>{privacyScore}%</div>
              </div>

              <div style={{ flex: 1 }}>
                <h1 style={{ margin: 0, color: '#f5f8ff', fontSize: '1.05rem' }}>Privacy Dashboard</h1>
                <p style={{ margin: '0.32rem 0 0', color: '#cdd8ed', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Your current privacy score is based on visibility, audience, activity, messaging, location, and
                  safety controls.
                </p>
              </div>
            </div>

            <div style={{ ...styles.grid, marginTop: '0.85rem' }}>
              <DashboardCard icon={ShieldCheck} label="Current privacy score" value={`${privacyScore}/100`} tone="success" />
              <DashboardCard icon={AlertTriangle} label="Privacy warnings" value={privacyScore < 70 ? '3' : '1'} tone="warning" />
              <DashboardCard icon={Lock} label="Protected controls" value="24" tone="default" />
              <DashboardCard icon={Clock3} label="Recent privacy changes" value="1" tone="success" />
            </div>

            <div style={{ ...styles.notice, marginTop: '0.8rem' }}>
              <AlertTriangle size={16} />
              <span>
                Review activity status, location sharing, public profile visibility, and message permissions regularly.
              </span>
            </div>
          </section>
        ) : null}

        <SectionCard
          section={sections[0]}
          expanded={expandedSection === 'account'}
          onToggle={() => setExpandedSection(expandedSection === 'account' ? null : 'account')}
        >
          <Toggle
            label="Public / Private account"
            description={privacy.accountPrivate ? 'Your account is private.' : 'Your profile is visible publicly.'}
            checked={privacy.accountPrivate}
            onChange={(value) => updatePrivacy('accountPrivate', value)}
          />
          <Toggle
            label="Approve followers manually"
            description="Review follow requests before accepting them."
            checked={privacy.approveFollowers}
            onChange={(value) => updatePrivacy('approveFollowers', value)}
          />
          <Toggle
            label="Hide account from search"
            description="Prevent your account from appearing in search results."
            checked={privacy.hideFromSearch}
            onChange={(value) => updatePrivacy('hideFromSearch', value)}
          />
          <Toggle
            label="Hide profile suggestions"
            description="Reduce recommendations of your profile to other users."
            checked={privacy.hideSuggestions}
            onChange={(value) => updatePrivacy('hideSuggestions', value)}
          />
          <Toggle
            label="Hide activity from non-followers"
            checked={privacy.hideActivityFromNonFollowers}
            onChange={(value) => updatePrivacy('hideActivityFromNonFollowers', value)}
          />
        </SectionCard>

        <SectionCard
          section={sections[1]}
          expanded={expandedSection === 'activity'}
          onToggle={() => setExpandedSection(expandedSection === 'activity' ? null : 'activity')}
        >
          <Toggle label="Show online status" checked={privacy.showOnlineStatus} onChange={(value) => updatePrivacy('showOnlineStatus', value)} />
          <Toggle label="Show last seen" checked={privacy.showLastSeen} onChange={(value) => updatePrivacy('showLastSeen', value)} />
          <Toggle label="Show typing indicator" checked={privacy.showTypingIndicator} onChange={(value) => updatePrivacy('showTypingIndicator', value)} />
          <Toggle label="Show read receipts" checked={privacy.showReadReceipts} onChange={(value) => updatePrivacy('showReadReceipts', value)} />
          <Toggle label="Hide active now" checked={privacy.hideActiveNow} onChange={(value) => updatePrivacy('hideActiveNow', value)} />
          <Toggle label="Invisible mode" description="Reduce presence signals across Aarush." checked={privacy.invisibleMode} onChange={(value) => updatePrivacy('invisibleMode', value)} />
        </SectionCard>

        <SectionCard
          section={sections[2]}
          expanded={expandedSection === 'story'}
          onToggle={() => setExpandedSection(expandedSection === 'story' ? null : 'story')}
        >
          <SelectRow
            label="Default story audience"
            value={choices.storyAudience}
            options={['Everyone', 'Followers', 'Close Friends', 'Custom list']}
            onChange={(value) => updateChoice('storyAudience', value)}
          />
          <RowButton icon={EyeOff} label="Hide story from selected users" onClick={() => setShowMessage(true)} />
          <Toggle label="Allow story replies" checked={privacy.allowStoryReplies} onChange={(value) => updatePrivacy('allowStoryReplies', value)} />
          <Toggle label="Allow story mentions" checked={privacy.allowStoryMentions} onChange={(value) => updatePrivacy('allowStoryMentions', value)} />
          <Toggle label="Allow story sharing" checked={privacy.allowStorySharing} onChange={(value) => updatePrivacy('allowStorySharing', value)} />
          <Toggle label="Allow story downloads" checked={privacy.allowStoryDownloads} onChange={(value) => updatePrivacy('allowStoryDownloads', value)} />
          <Toggle label="Story archive" description="Keep expired stories private in your archive." checked={privacy.storyArchive} onChange={(value) => updatePrivacy('storyArchive', value)} />
          <RowButton icon={Users} label="Custom story audience" onClick={() => setShowMessage(true)} />
        </SectionCard>

        <SectionCard
          section={sections[3]}
          expanded={expandedSection === 'post'}
          onToggle={() => setExpandedSection(expandedSection === 'post' ? null : 'post')}
        >
          <SelectRow label="Who can comment" value={choices.commentPermission} options={['Everyone', 'Followers', 'Nobody']} onChange={(value) => updateChoice('commentPermission', value)} />
          <SelectRow label="Who can like" value={choices.likePermission} options={['Everyone', 'Followers', 'Nobody']} onChange={(value) => updateChoice('likePermission', value)} />
          <SelectRow label="Who can share" value={choices.sharePermission} options={['Everyone', 'Followers', 'Nobody']} onChange={(value) => updateChoice('sharePermission', value)} />
          <SelectRow label="Who can save" value={choices.savePermission} options={['Everyone', 'Followers', 'Nobody']} onChange={(value) => updateChoice('savePermission', value)} />
          <SelectRow label="Who can download" value={choices.downloadPermission} options={['Everyone', 'Followers', 'Nobody']} onChange={(value) => updateChoice('downloadPermission', value)} />
          <Toggle label="Allow remix" checked={privacy.remixPermission !== false} onChange={(value) => updatePrivacy('remixPermission', value)} />
          <Toggle label="Allow duet" checked={privacy.duetPermission !== false} onChange={(value) => updatePrivacy('duetPermission', value)} />
          <Toggle label="Allow collaboration" checked={privacy.collaborationPermission !== false} onChange={(value) => updatePrivacy('collaborationPermission', value)} />
        </SectionCard>

        <SectionCard
          section={sections[4]}
          expanded={expandedSection === 'mentions'}
          onToggle={() => setExpandedSection(expandedSection === 'mentions' ? null : 'mentions')}
        >
          <SelectRow label="Who can mention you" value={choices.mentionPermission} options={['Everyone', 'Followers', 'Nobody']} onChange={(value) => updateChoice('mentionPermission', value)} />
          <SelectRow label="Who can tag you" value={choices.tagPermission} options={['Everyone', 'Followers', 'Nobody']} onChange={(value) => updateChoice('tagPermission', value)} />
          <Toggle label="Review tagged posts" checked={privacy.reviewTaggedPosts} onChange={(value) => updatePrivacy('reviewTaggedPosts', value)} />
          <Toggle label="Approve mentions manually" checked={privacy.approveMentionsManually} onChange={(value) => updatePrivacy('approveMentionsManually', value)} />
          <Toggle label="Hidden mentions" checked={privacy.hiddenMentions} onChange={(value) => updatePrivacy('hiddenMentions', value)} />
          <Toggle label="Mention requests" checked={privacy.mentionRequests} onChange={(value) => updatePrivacy('mentionRequests', value)} />
          <RowButton icon={Tag} label="Review pending tags and mentions" onClick={() => setShowMessage(true)} />
        </SectionCard>

        <SectionCard
          section={sections[5]}
          expanded={expandedSection === 'messaging'}
          onToggle={() => setExpandedSection(expandedSection === 'messaging' ? null : 'messaging')}
        >
          <SelectRow label="Who can message you" value={choices.messagePermission} options={['Everyone', 'Followers', 'Nobody']} onChange={(value) => updateChoice('messagePermission', value)} />
          <Toggle label="Message requests" checked={privacy.messageRequests} onChange={(value) => updatePrivacy('messageRequests', value)} />
          <Toggle label="Group invite permissions" checked={privacy.groupInvites} onChange={(value) => updatePrivacy('groupInvites', value)} />
          <Toggle label="Call permissions" checked={privacy.callPermissions} onChange={(value) => updatePrivacy('callPermissions', value)} />
          <Toggle label="Video call permissions" checked={privacy.videoCallPermissions} onChange={(value) => updatePrivacy('videoCallPermissions', value)} />
          <Toggle label="Voice call permissions" checked={privacy.voiceCallPermissions} onChange={(value) => updatePrivacy('voiceCallPermissions', value)} />
          <Toggle label="Message forwarding permissions" checked={privacy.forwardingPermissions} onChange={(value) => updatePrivacy('forwardingPermissions', value)} />
        </SectionCard>

        <SectionCard
          section={sections[6]}
          expanded={expandedSection === 'block'}
          onToggle={() => setExpandedSection(expandedSection === 'block' ? null : 'block')}
        >
          <ListManager
            title="Blocked users list"
            items={lists.blocked}
            placeholder="Add username to block"
            onAdd={(value) => addToList('blocked', value)}
            onRemove={(value) => removeFromList('blocked', value)}
          />
          <ListManager
            title="Restricted users list"
            items={lists.restricted}
            placeholder="Add username to restrict"
            onAdd={(value) => addToList('restricted', value)}
            onRemove={(value) => removeFromList('restricted', value)}
          />
          <ListManager
            title="Muted users list"
            items={lists.muted}
            placeholder="Add username to mute"
            onAdd={(value) => addToList('muted', value)}
            onRemove={(value) => removeFromList('muted', value)}
          />
          <RowButton icon={UserCheck} label="Remove follower" onClick={() => setShowMessage(true)} />
          <RowButton icon={Ban} label="Temporary block" onClick={() => setShowMessage(true)} danger />
          <RowButton icon={Ban} label="Permanent block" onClick={() => setShowMessage(true)} danger />
        </SectionCard>

        <SectionCard
          section={sections[7]}
          expanded={expandedSection === 'words'}
          onToggle={() => setExpandedSection(expandedSection === 'words' ? null : 'words')}
        >
          <Toggle label="Filter offensive words" checked={privacy.filterOffensiveWords} onChange={(value) => updatePrivacy('filterOffensiveWords', value)} />
          <Toggle label="Spam filter" checked={privacy.spamFilter} onChange={(value) => updatePrivacy('spamFilter', value)} />
          <Toggle label="Link filter" checked={privacy.linkFilter} onChange={(value) => updatePrivacy('linkFilter', value)} />
          <Toggle label="Emoji filter" checked={privacy.emojiFilter} onChange={(value) => updatePrivacy('emojiFilter', value)} />
          <ListManager
            title="Custom blocked words"
            items={lists.hiddenWords}
            placeholder="Add a word or phrase"
            onAdd={(value) => addToList('hiddenWords', value)}
            onRemove={(value) => removeFromList('hiddenWords', value)}
          />
          <RowButton icon={Sparkles} label="AI moderation controls" description="Configure automated safety suggestions and filtering." onClick={() => setShowMessage(true)} />
        </SectionCard>

        <SectionCard
          section={sections[8]}
          expanded={expandedSection === 'friends'}
          onToggle={() => setExpandedSection(expandedSection === 'friends' ? null : 'friends')}
        >
          <ListManager
            title="Manage Close Friends"
            items={lists.closeFriends}
            placeholder="Add username"
            onAdd={(value) => addToList('closeFriends', value)}
            onRemove={(value) => removeFromList('closeFriends', value)}
          />
          <RowButton icon={Plus} label="Add friends" onClick={() => setShowMessage(true)} />
          <RowButton icon={Trash2} label="Remove friends" onClick={() => setShowMessage(true)} />
          <Toggle label="View Close Friends stories" checked={true} onChange={() => setShowMessage(true)} />
          <Toggle label="Story priority" description="Prioritize Close Friends stories in your story rail." checked={true} onChange={() => setShowMessage(true)} />
        </SectionCard>

        <SectionCard
          section={sections[9]}
          expanded={expandedSection === 'location'}
          onToggle={() => setExpandedSection(expandedSection === 'location' ? null : 'location')}
        >
          <Toggle label="Disable location sharing" checked={privacy.disableLocationSharing} onChange={(value) => updatePrivacy('disableLocationSharing', value)} />
          <SelectRow label="Location precision" value={choices.locationMode} options={['Approximate location', 'Precise location', 'Disabled']} onChange={(value) => updateChoice('locationMode', value)} />
          <Toggle label="Approximate location" checked={privacy.approximateLocation} onChange={(value) => updatePrivacy('approximateLocation', value)} />
          <Toggle label="Precise location" checked={privacy.preciseLocation} onChange={(value) => updatePrivacy('preciseLocation', value)} />
          <Toggle label="Nearby content permission" checked={privacy.nearbyPermission} onChange={(value) => updatePrivacy('nearbyPermission', value)} />
          <Toggle label="Background location access" checked={privacy.backgroundLocation} onChange={(value) => updatePrivacy('backgroundLocation', value)} />
          <RowButton icon={MapPin} label="Location history" description="Review or clear location history." onClick={() => setShowMessage(true)} />
        </SectionCard>

        <SectionCard
          section={sections[10]}
          expanded={expandedSection === 'visibility'}
          onToggle={() => setExpandedSection(expandedSection === 'visibility' ? null : 'visibility')}
        >
          <Toggle label="Profile visibility" checked={privacy.profileVisibility} onChange={(value) => updatePrivacy('profileVisibility', value)} />
          <Toggle label="Followers visibility" checked={privacy.followersVisibility} onChange={(value) => updatePrivacy('followersVisibility', value)} />
          <Toggle label="Following visibility" checked={privacy.followingVisibility} onChange={(value) => updatePrivacy('followingVisibility', value)} />
          <Toggle label="Likes visibility" checked={privacy.likesVisibility} onChange={(value) => updatePrivacy('likesVisibility', value)} />
          <Toggle label="Saved posts visibility" checked={privacy.savedVisibility} onChange={(value) => updatePrivacy('savedVisibility', value)} />
          <Toggle label="Reels visibility" checked={privacy.reelsVisibility} onChange={(value) => updatePrivacy('reelsVisibility', value)} />
          <Toggle label="Story visibility" checked={privacy.storyVisibility} onChange={(value) => updatePrivacy('storyVisibility', value)} />
          <Toggle label="Tagged content visibility" checked={privacy.taggedVisibility} onChange={(value) => updatePrivacy('taggedVisibility', value)} />
        </SectionCard>

        <section
          style={{
            padding: '0.9rem',
            borderRadius: '1.15rem',
            background: 'rgba(77,215,255,0.07)',
            border: '1px solid rgba(77,215,255,0.14)',
            color: '#c9f5ff',
            fontSize: '0.78rem',
            lineHeight: 1.55,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={15} />
            Privacy system status
          </div>
          Privacy permission rules, visibility evaluation, story audiences, mention filtering, tag approval, message
          permissions, block synchronization, hidden words, location management, audit logging, session-aware visibility,
          and optimistic updates are ready for Supabase integration.
          <div style={{ marginTop: '0.55rem', color: '#8fa1bd', fontSize: '0.72rem' }}>
            Recent change: {recentChange}
          </div>
        </section>
      </main>

      <BottomNav />

      {showMessage ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowMessage(false)}
          style={styles.modalOverlay}
        >
          <div onClick={(event) => event.stopPropagation()} style={styles.modal}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBottom: '0.85rem',
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: '#f5f8ff', fontSize: '1rem' }}>Privacy control</h2>
                <p style={{ margin: '0.25rem 0 0', color: '#96a3bf', fontSize: '0.78rem' }}>
                  This control is ready for a Supabase-backed settings workflow.
                </p>
              </div>
              <button type="button" onClick={() => setShowMessage(false)} style={styles.iconButton} aria-label="Close dialog">
                <X size={17} />
              </button>
            </div>

            <div
              style={{
                padding: '0.9rem',
                borderRadius: '1rem',
                background: 'rgba(124,92,255,0.1)',
                border: '1px solid rgba(124,92,255,0.16)',
                color: '#dce5ff',
                fontSize: '0.82rem',
                lineHeight: 1.55,
              }}
            >
              Your preference has been updated locally. Production persistence will synchronize this value through the
              privacy permission engine and audit log.
            </div>

            <button
              type="button"
              onClick={() => setShowMessage(false)}
              style={{
                width: '100%',
                marginTop: '0.8rem',
                border: 0,
                borderRadius: '999px',
                padding: '0.78rem',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ImageIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="8.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="m3 17 5-5 3.5 3.5 2.5-2.5 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

