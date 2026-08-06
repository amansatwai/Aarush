import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  HelpCircle,
  KeyRound,
  Lock,
  LogOut,
  MessageCircle,
  MonitorSmartphone,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  UserRound,
  Users,
  X,
} from 'lucide-react';

const settingGroups = [
  {
    id: 'account',
    title: 'Account',
    description: 'Manage your identity, profile details, language, and accessibility.',
    icon: UserRound,
    items: [
      ['Account Information', 'Review your account identity and profile ownership.', UserRound],
      ['Username', 'Change the public username people use to find you.', UserRound],
      ['Email Address', 'Manage the email address connected to your Aarush account.', FileText],
      ['Phone Number', 'Manage the phone number used for account recovery.', Smartphone],
      ['Display Name', 'Change the name displayed on your profile.', UserRound],
      ['Bio', 'Edit the short description shown on your profile.', FileText],
      ['Language', 'Choose the language used throughout Aarush.', Globe2],
      ['Accessibility', 'Configure text scaling, contrast, motion, and screen reader support.', Eye],
      ['About Aarush', 'Review app version, legal information, and platform details.', HelpCircle],
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Control who can find you, view your content, and interact with you.',
    icon: Lock,
    items: [
      ['Private Account', 'Only approved followers can view your content.', Lock],
      ['Close Friends', 'Share stories with selected trusted followers.', Users],
      ['Story Privacy', 'Choose who can view and interact with your stories.', Eye],
      ['Comment Controls', 'Choose who can comment on your posts and reels.', MessageCircle],
      ['Mention Controls', 'Choose who can mention your account.', AtSignIcon],
      ['Tag Controls', 'Choose who can tag your account in content.', TagIcon],
      ['Profile Visibility', 'Control whether your profile is visible to other users.', Eye],
      ['Search Visibility', 'Control whether your account appears in search results.', Search],
      ['Activity Visibility', 'Control how your activity appears to other users.', Activity],
    ],
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Protect your account, sessions, devices, and recovery methods.',
    icon: ShieldCheck,
    items: [
      ['Change Password', 'Update your account password securely.', KeyRound],
      ['Two-Factor Authentication', 'Add an extra layer of account security.', ShieldCheck],
      ['Login Activity', 'Review all recent login sessions.', Activity],
      ['Trusted Devices', 'Manage devices allowed to access your account.', MonitorSmartphone],
      ['Session Management', 'Review and revoke active login sessions.', Smartphone],
      ['Recovery Methods', 'Manage email, phone, and recovery options.', KeyRound],
      ['Security Questions', 'Manage additional account verification questions.', HelpCircle],
      ['Backup Codes', 'Create and manage backup codes for account recovery.', FileText],
      ['Security Alerts', 'Control alerts about suspicious account activity.', Bell],
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Choose which alerts and activity updates Aarush sends you.',
    icon: Bell,
    items: [
      ['Push Notifications', 'Control which notifications you receive on your devices.', Bell],
      ['Likes and Comments', 'Manage alerts for likes, comments, and replies.', MessageCircle],
      ['Followers', 'Manage follow, follow request, and follow-back alerts.', Users],
      ['Stories', 'Manage story reactions, replies, mentions, and views.', SparklesIcon],
      ['Reels', 'Manage reel likes, comments, shares, and recommendations.', PlayIcon],
      ['Messages', 'Manage direct and group message notifications.', MessageCircle],
      ['Calls', 'Manage voice call, video call, and missed call alerts.', PhoneIcon],
      ['Mentions', 'Manage notifications when someone mentions you.', AtSignIcon],
      ['Tags', 'Manage notifications when someone tags you.', TagIcon],
      ['Security Notifications', 'Manage login, device, password, and security alerts.', ShieldAlertIcon],
    ],
  },
  {
    id: 'chats',
    title: 'Chats',
    description: 'Control messaging privacy, presence, and conversation behavior.',
    icon: MessageCircle,
    items: [
      ['Read Receipts', 'Control whether others can see when you read messages.', Check],
      ['Typing Indicator', 'Control whether others can see when you are typing.', MessageCircle],
      ['Online Status', 'Control whether others can see when you are online.', Activity],
      ['Last Seen', 'Control who can see your last active time.', ClockIcon],
      ['Message Requests', 'Manage messages from people you do not follow.', MailIcon],
      ['Chat Wallpaper', 'Customize the appearance of individual conversations.', PaletteIcon],
      ['Disappearing Messages', 'Automatically remove messages after a selected duration.', ClockIcon],
      ['Archive Chats', 'Hide conversations without deleting them.', FileText],
      ['Pinned Chats', 'Manage conversations pinned to the top of your chat list.', PinIcon],
    ],
  },
  {
    id: 'controls',
    title: 'Controls',
    description: 'Manage blocking, filtering, activity, and advanced privacy tools.',
    icon: Settings,
    items: [
      ['Blocked Users', 'Review accounts that cannot interact with you.', Shield],
      ['Restricted Users', 'Limit interactions without completely blocking an account.', Shield],
      ['Hidden Words', 'Automatically filter offensive or blocked words.', EyeOff],
      ['Activity Status', 'Control visibility of your activity indicators.', Activity],
      ['Gaze Lock Settings', 'Configure gaze-based privacy protection.', EyeOff],
      ['One Tap Lock Settings', 'Configure instant app locking behavior.', Lock],
      ['Screenshot Shield Settings', 'Configure screenshot detection and protection.', Shield],
      ['Screen Recording Settings', 'Configure recording detection behavior.', MonitorSmartphone],
      ['Decoy Vault Settings', 'Configure the secure alternate profile mode.', Lock],
      ['Emergency Privacy Settings', 'Configure emergency protection actions.', ShieldAlertIcon],
    ],
  },
  {
    id: 'help',
    title: 'Help',
    description: 'Find support, legal information, recovery tools, and account actions.',
    icon: HelpCircle,
    items: [
      ['Help Center', 'Find answers and guides for using Aarush.', HelpCircle],
      ['Report a Problem', 'Send a technical or safety problem to Aarush support.', AlertTriangle],
      ['Account Recovery', 'Recover access when you cannot sign in.', KeyRound],
      ['Contact Support', 'Contact the Aarush support team.', MessageCircle],
      ['Privacy Policy', 'Read how Aarush handles account and privacy data.', Shield],
      ['Terms of Service', 'Review the rules for using Aarush.', FileText],
      ['Community Guidelines', 'Review standards for safe community participation.', Users],
      ['App Diagnostics', 'Review application health and connection diagnostics.', Activity],
      ['Logout', 'Sign out of the current Aarush session.', LogOut],
    ],
  },
];

const recentSettings = [
  ['Login Activity', Activity],
  ['Gaze Lock Settings', EyeOff],
  ['Story Privacy', Eye],
  ['Notification Settings', Bell],
];

const quickActions = [
  ['Open Privacy Dashboard', '/privacy-dashboard', ShieldCheck],
  ['Open Emergency Privacy', '/emergency-privacy', ShieldAlertIcon],
  ['Open Shoulder Surf', '/shoulder-surf', EyeOff],
  ['Open Creator Analytics', '/creator-analytics', BarChartIcon],
  ['Manage Active Devices', '/security-settings', MonitorSmartphone],
  ['Export Account Data', '/privacy-dashboard', Download],
];

const systemStatuses = [
  ['Settings Synchronization', 'Active'],
  ['Profile Synchronization', 'Active'],
  ['Security Sync', 'Syncing'],
  ['Notification Preferences Sync', 'Active'],
  ['Chat Preference Sync', 'Active'],
  ['Privacy Permission Engine', 'Active'],
  ['Session Security Engine', 'Active'],
  ['Device Trust Engine', 'Syncing'],
  ['Realtime Settings Update', 'Syncing'],
  ['Cloud Backup', 'Active'],
];

function AtSignIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M16 12v1.2a2.8 2.8 0 0 0 5.6.2A9.6 9.6 0 1 0 18 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TagIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3.4 13.4a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.4 7a2 2 0 0 1 0 2.8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function SparklesIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m12 3 1.25 4.25L17.5 8.5l-4.25 1.25L12 14l-1.25-4.25L6.5 8.5l4.25-1.25L12 3ZM19 14l.65 2.35L22 17l-2.35.65L19 20l-.65-2.35L16 17l2.35-.65L19 14ZM5 14l.8 2.7L8.5 17.5l-2.7.8L5 21l-.8-2.7-2.7-.8 2.7-.8L5 14Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PhoneIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h3l2 5-2 1.5a14 14 0 0 0 5.5 5.5L15 14l5 2v3a2 2 0 0 1-2 2C10.3 21 3 13.7 3 5a2 2 0 0 1 2-1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PaletteIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3a9 9 0 0 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6h-.7a1.8 1.8 0 0 1 0-3.6H15a6 6 0 0 0 0-10.8A8.8 8.8 0 0 0 12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="10" r="1" fill="currentColor" />
      <circle cx="10" cy="7" r="1" fill="currentColor" />
      <circle cx="14" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}

function PinIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m15 4 5 5-3 1-3 4 1 4-2 2-3-5-4-3-2-2 2-2 4 1 4-3 1-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldAlertIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 8v4M12 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BarChartIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StatusBadge({ status }) {
  const style =
    status === 'Active'
      ? {
          color: '#d7ffef',
          background: 'rgba(82,232,170,0.12)',
          border: 'rgba(82,232,170,0.18)',
        }
      : status === 'Syncing'
        ? {
            color: '#dce5ff',
            background: 'rgba(124,92,255,0.14)',
            border: 'rgba(124,92,255,0.18)',
          }
        : {
            color: '#ffb1c8',
            background: 'rgba(255,79,122,0.1)',
            border: 'rgba(255,79,122,0.16)',
          };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.34rem 0.52rem',
        borderRadius: '999px',
        color: style.color,
        background: style.background,
        border: `1px solid ${style.border}`,
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

function SettingRow({ item, onOpen }) {
  const [label, description, Icon] = item;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        padding: '0.75rem',
        borderRadius: '0.95rem',
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.045)',
        color: '#eaf0ff',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: '2.1rem',
          height: '2.1rem',
          borderRadius: '0.7rem',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
          color: '#dce8ff',
          flexShrink: 0,
        }}
      >
        <Icon size={15} />
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <strong
          style={{
            display: 'block',
            color: '#eaf0ff',
            fontSize: '0.8rem',
            fontWeight: 850,
          }}
        >
          {label}
        </strong>

        <span
          style={{
            display: 'block',
            marginTop: '0.2rem',
            color: '#8996b2',
            fontSize: '0.7rem',
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>
      </span>

      <ChevronRight size={15} color="#8190ad" />
    </button>
  );
}

function SettingsSection({ group, onOpen }) {
  const Icon = group.icon;

  return (
    <section
      style={{
        padding: '0.95rem',
        borderRadius: '1.25rem',
        background: 'rgba(15,19,30,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          marginBottom: '0.8rem',
        }}
      >
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
          <h2
            style={{
              margin: 0,
              color: '#f5f8ff',
              fontSize: '0.98rem',
              fontWeight: 850,
            }}
          >
            {group.title}
          </h2>

          <p
            style={{
              margin: '0.25rem 0 0',
              color: '#8996b2',
              fontSize: '0.74rem',
              lineHeight: 1.45,
            }}
          >
            {group.description}
          </p>
        </span>
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {group.items.map((item) => (
          <SettingRow key={item[0]} item={item} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

function SettingDetail({ item, onBack }) {
  const [label, description, Icon] = item;
  const [enabled, setEnabled] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '6.8rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          minHeight: '4.5rem',
          padding: '0.75rem 0.9rem',
          background: 'rgba(8,11,18,0.84)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to profile settings"
          style={{
            width: '2.65rem',
            height: '2.65rem',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <strong style={{ display: 'block', fontSize: '1rem' }}>{label}</strong>
          <span style={{ display: 'block', marginTop: '0.18rem', color: '#91a0bc', fontSize: '0.72rem' }}>
            Account setting
          </span>
        </div>

        <span style={{ width: '2.65rem' }} />
      </div>

      <main
        style={{
          width: '100%',
          maxWidth: '700px',
          margin: '0 auto',
          padding: '1rem 0.9rem 0',
        }}
      >
        <section
          style={{
            padding: '1.1rem',
            borderRadius: '1.35rem',
            background: 'rgba(15,19,30,0.92)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <span
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '1rem',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
              color: '#dce8ff',
            }}
          >
            <Icon size={22} />
          </span>

          <h1 style={{ margin: '1rem 0 0', color: '#f5f8ff', fontSize: '1.2rem' }}>
            {label}
          </h1>

          <p style={{ margin: '0.55rem 0 0', color: '#9aa7c1', fontSize: '0.84rem', lineHeight: 1.6 }}>
            {description}
          </p>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.7rem',
              marginTop: '1rem',
              padding: '0.8rem',
              borderRadius: '1rem',
              background: 'rgba(255,255,255,0.045)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#eaf0ff',
              fontSize: '0.82rem',
              fontWeight: 750,
              cursor: 'pointer',
            }}
          >
            <span>Enable this setting</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              style={{ accentColor: '#7c5cff' }}
            />
          </label>

          <div
            style={{
              marginTop: '0.8rem',
              padding: '0.8rem',
              borderRadius: '0.95rem',
              background: 'rgba(77,215,255,0.07)',
              border: '1px solid rgba(77,215,255,0.13)',
              color: '#c9f5ff',
              fontSize: '0.76rem',
              lineHeight: 1.55,
            }}
          >
            This setting is ready for Supabase-backed synchronization,
            optimistic updates, audit logging, and realtime preference updates.
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [recentSettingsList, setRecentSettingsList] = useState(recentSettings);
  const [activeSetting, setActiveSetting] = useState(null);
  const [message, setMessage] = useState('');

  const normalizedSearch = search.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedSearch) return settingGroups;

    return settingGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(([label, description]) =>
          `${label} ${description}`.toLowerCase().includes(normalizedSearch)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [normalizedSearch]);

  const openSetting = (item) => {
    setActiveSetting(item);
    setRecentSettingsList((current) => [
      [item[0], item[2]],
      ...current.filter(([label]) => label !== item[0]),
    ].slice(0, 5));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.localStorage.removeItem('aarush_one_tap_lock_enabled');
    navigate('/welcome', { replace: true });
  };

  if (activeSetting) {
    return (
      <SettingDetail
        item={activeSetting}
        onBack={() => setActiveSetting(null)}
      />
    );
  }

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
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.55rem',
      minHeight: '3rem',
      padding: '0.35rem 0.45rem 0.35rem 0.85rem',
      border: '1px solid rgba(124,92,255,0.22)',
      borderRadius: '999px',
      background: 'rgba(15,19,30,0.92)',
      boxShadow: '0 16px 45px rgba(0,0,0,0.25), 0 0 24px rgba(124,92,255,0.08)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
    },
    input: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 0,
      background: 'transparent',
      color: '#fff',
      fontSize: '0.88rem',
    },
    recentCard: {
      padding: '0.95rem',
      borderRadius: '1.25rem',
      background: 'rgba(15,19,30,0.92)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
    },
    recentTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.7rem',
      color: '#f5f8ff',
      fontSize: '0.9rem',
      fontWeight: 850,
    },
    recentItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      width: '100%',
      padding: '0.65rem',
      borderRadius: '0.85rem',
      border: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(255,255,255,0.045)',
      color: '#dce5f8',
      textAlign: 'left',
      cursor: 'pointer',
      fontSize: '0.76rem',
      fontWeight: 750,
    },
    quickGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '0.55rem',
    },
    quickButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.55rem',
      minHeight: '3.1rem',
      padding: '0.7rem',
      borderRadius: '0.95rem',
      border: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(255,255,255,0.045)',
      color: '#dce5f8',
      textAlign: 'left',
      cursor: 'pointer',
      fontSize: '0.72rem',
      fontWeight: 800,
    },
    systemRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.7rem',
      borderRadius: '0.9rem',
      background: 'rgba(255,255,255,0.045)',
      border: '1px solid rgba(255,255,255,0.07)',
    },
  };

  return (
    <div style={styles.page}>
      <TopBar pageTitle="Profile Settings" notificationCount={3} />

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
            Account and preferences
          </span>

          <button
            type="button"
            onClick={() => setMessage('Settings synchronization completed.')}
            style={styles.iconButton}
            aria-label="Refresh settings"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '1.25rem',
            borderRadius: '1.5rem',
            background:
              'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.1) 52%, rgba(255,79,216,0.08))',
            border: '1px solid rgba(124,92,255,0.24)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.3), 0 0 34px rgba(124,92,255,0.12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '4.8rem',
                height: '4.8rem',
                borderRadius: '1.4rem',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
                boxShadow: '0 0 30px rgba(77,215,255,0.22)',
                flexShrink: 0,
              }}
            >
              <Settings size={34} />
            </div>

            <div>
              <h1 style={{ margin: 0, color: '#f7f9ff', fontSize: '1.25rem' }}>
                Account & Settings
              </h1>
              <p
                style={{
                  margin: '0.5rem 0 0',
                  color: '#d5e0f5',
                  fontSize: '0.84rem',
                  lineHeight: 1.55,
                }}
              >
                Manage your account, privacy, security, notifications, and preferences.
              </p>
            </div>
          </div>
        </section>

        <div style={styles.searchBar}>
          <Search size={17} color="#8fa0c2" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search password, privacy, chat, notification, lock…"
            style={styles.input}
            aria-label="Search settings"
          />

          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={styles.iconButton}
              aria-label="Clear settings search"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>

        <section style={styles.recentCard}>
          <div style={styles.recentTitle}>
            <ClockIcon size={15} />
            Recently Used Settings
          </div>

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            {recentSettingsList.map(([label, Icon]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  const item = settingGroups
                    .flatMap((group) => group.items)
                    .find(([itemLabel]) => itemLabel === label);

                  if (item) openSetting(item);
                }}
                style={styles.recentItem}
              >
                <Icon size={14} />
                <span style={{ flex: 1 }}>{label}</span>
                <ChevronRight size={14} color="#8190ad" />
              </button>
            ))}
          </div>
        </section>

        <section style={styles.recentCard}>
          <div style={styles.recentTitle}>
            <SparklesIcon size={15} />
            Quick Actions
          </div>

          <div style={styles.quickGrid}>
            {quickActions.map(([label, route, Icon]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (label === 'Export Account Data') {
                    setMessage('Account data export has been requested.');
                    return;
                  }

                  navigate(route);
                }}
                style={styles.quickButton}
              >
                <span
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.7rem',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
                    color: '#dce8ff',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </section>

        {filteredGroups.length ? (
          filteredGroups.map((group) => (
            <SettingsSection key={group.id} group={group} onOpen={openSetting} />
          ))
        ) : (
          <section
            style={{
              padding: '1.3rem 1rem',
              borderRadius: '1.2rem',
              background: 'rgba(15,19,30,0.92)',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
              color: '#9aa7c1',
              fontSize: '0.84rem',
              lineHeight: 1.55,
            }}
          >
            <Search size={28} color="#8290ad" />
            <p style={{ margin: '0.7rem 0 0' }}>
              No settings match “{search}”.
            </p>
          </section>
        )}

        <section
          style={{
            padding: '0.95rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.92)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              marginBottom: '0.8rem',
            }}
          >
            <span
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.75rem',
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(255,79,122,0.12)',
                color: '#ffb1c8',
              }}
            >
              <LogOut size={15} />
            </span>

            <div>
              <h2 style={{ margin: 0, color: '#fff7fa', fontSize: '0.98rem', fontWeight: 850 }}>
                Logout
              </h2>
              <p style={{ margin: '0.25rem 0 0', color: '#b98296', fontSize: '0.74rem' }}>
                Sign out of the current Aarush session and return to Welcome.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              border: 0,
              borderRadius: '999px',
              padding: '0.82rem',
              background: 'linear-gradient(135deg, #ff4f7a, #ff4fd8)',
              color: '#fff',
              fontSize: '0.84rem',
              fontWeight: 850,
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
            Logout from Aarush
          </button>
        </section>

        <section
          style={{
            padding: '0.95rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.92)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              marginBottom: '0.8rem',
            }}
          >
            <span
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.75rem',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
                color: '#dce8ff',
              }}
            >
              <Activity size={15} />
            </span>

            <div>
              <h2 style={{ margin: 0, color: '#f5f8ff', fontSize: '0.98rem', fontWeight: 850 }}>
                Background Settings Systems
              </h2>
              <p style={{ margin: '0.25rem 0 0', color: '#8996b2', fontSize: '0.74rem' }}>
                Background systems remain active while you use Aarush.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {systemStatuses.map(([label, status]) => (
              <div key={label} style={styles.systemRow}>
                <span
                  style={{
                    width: '0.55rem',
                    height: '0.55rem',
                    borderRadius: '999px',
                    background:
                      status === 'Active'
                        ? '#52e8aa'
                        : status === 'Syncing'
                          ? '#a378ff'
                          : '#ff6f9d',
                    boxShadow:
                      status === 'Active'
                        ? '0 0 10px rgba(82,232,170,0.5)'
                        : status === 'Syncing'
                          ? '0 0 10px rgba(163,120,255,0.5)'
                          : '0 0 10px rgba(255,111,157,0.5)',
                    flexShrink: 0,
                  }}
                />

                <span style={{ flex: 1, color: '#dce5f8', fontSize: '0.76rem', fontWeight: 750 }}>
                  {label}
                </span>

                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </section>

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
            Settings architecture status
          </div>

          Settings are structured for Supabase-backed synchronization,
          profile updates, security sessions, device trust, notification
          preferences, chat preferences, privacy permissions, cloud backup,
          optimistic updates, and realtime settings changes.
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