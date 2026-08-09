import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  Bell,
  Camera,
  ChevronRight,
  CircleUserRound,
  CloudDownload,
  Eye,
  EyeOff,
  FileDown,
  Filter,
  Fingerprint,
  Globe2,
  History,
  KeyRound,
  Link2,
  Lock,
  LockKeyhole,
  MessageCircle,
  Mic,
  MonitorDown,
  MoreHorizontal,
  Phone,
  Search,
  Send,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Users,
  Video,
  Wifi,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const PRIVACY_KEYS = {
  privateAccount: 'aarush_private_account',
  hideOnline: 'aarush_hide_online_status',
  hideLastSeen: 'aarush_hide_last_seen',
  hideReadReceipts: 'aarush_hide_read_receipts',
  hideTyping: 'aarush_hide_typing_indicator',
  allowStoryReplies: 'aarush_allow_story_replies',
  allowStorySharing: 'aarush_allow_story_sharing',
  allowStoryMentions: 'aarush_allow_story_mentions',
  archiveStories: 'aarush_archive_stories',
  appearSearch: 'aarush_appear_in_search',
  appearSuggestions: 'aarush_appear_in_suggestions',
  mutualConnections: 'aarush_show_mutual_connections',
  activityStatus: 'aarush_show_activity_status',
  recentlyActive: 'aarush_show_recently_active',
  contactSync: 'aarush_allow_contact_sync',
  screenshotShield: 'aarush_screenshot_shield_enabled',
  recordingProtection: 'aarush_screen_recording_enabled',
  shoulderSurf: 'aarush_shoulder_surf_enabled',
  gazeLock: 'aarush_gaze_lock_enabled',
  oneTapLock: 'aarush_one_tap_lock_enabled',
  emergencyPrivacy: 'aarush_emergency_privacy_enabled',
  appLock: 'aarush_app_lock_enabled',
  decoyVault: 'aarush_decoy_vault_enabled',
  antiPeek: 'aarush_anti_peek_shield_enabled',
};

const PRIVACY_SYSTEMS = [
  ['Profile Privacy Engine', 'Active'],
  ['Story Privacy Engine', 'Active'],
  ['Message Privacy Engine', 'Active'],
  ['Discoverability Engine', 'Active'],
  ['Permission Sync', 'Syncing'],
  ['Realtime Privacy Monitor', 'Active'],
  ['Screenshot Detection', 'Active'],
  ['Recording Detection', 'Active'],
  ['Privacy Analytics', 'Active'],
  ['Data Protection Layer', 'Active'],
];

const PRIVACY_ACTIVITY = [
  ['Profile viewed', 'Today', '08:32 AM', 'Allowed'],
  ['Story viewed', 'Today', '07:18 AM', 'Protected'],
  ['Data downloaded', 'Yesterday', '09:40 PM', 'Completed'],
  ['Login detected', 'Yesterday', '08:12 PM', 'Reviewed'],
  ['Screenshot attempt', 'May 18, 2026', '06:20 PM', 'Blocked'],
  ['Screen recording attempt', 'May 17, 2026', '04:12 PM', 'Blocked'],
  ['Privacy setting changed', 'May 16, 2026', '11:42 AM', 'Saved'],
  ['Account visibility changed', 'May 15, 2026', '03:08 PM', 'Saved'],
];

function readBoolean(key, fallback = false) {
  const value = localStorage.getItem(key);

  if (value === null) {
    return fallback;
  }

  return value === 'true';
}

function Section({ title, icon: Icon, children }) {
  return (
    <section style={styles.card}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionIcon}>
          <Icon size={17} />
        </span>
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  value,
  onChange,
}) {
  return (
    <label style={styles.row}>
      <span style={styles.rowIcon}>
        <Icon size={17} />
      </span>

      <span style={styles.rowCopy}>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        style={styles.checkbox}
      />
    </label>
  );
}

function SelectRow({
  icon: Icon,
  title,
  description,
  value,
  onChange,
  options,
}) {
  return (
    <div style={styles.row}>
      <span style={styles.rowIcon}>
        <Icon size={17} />
      </span>

      <span style={styles.rowCopy}>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={styles.select}
        aria-label={title}
      >
        {options.map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.actionButton}
    >
      <Icon size={16} />
      <span>{label}</span>
      <ChevronRight size={15} />
    </button>
  );
}

function StatusRow({ name, status }) {
  return (
    <div style={styles.systemRow}>
      <span
        style={{
          ...styles.statusDot,
          background:
            status === 'Syncing' ? '#ffd27d' : '#82e9c1',
          boxShadow:
            status === 'Syncing'
              ? '0 0 9px rgba(255,210,125,0.7)'
              : '0 0 9px rgba(130,233,193,0.7)',
        }}
      />

      <span style={styles.systemName}>{name}</span>

      <span
        style={{
          ...styles.systemStatus,
          color:
            status === 'Syncing' ? '#ffd27d' : '#82e9c1',
        }}
      >
        {status}
      </span>
    </div>
  );
}

export default function PrivacyCenter() {
  const navigate = useNavigate();

  const [toast, setToast] = useState('');
  const [profileVisibility, setProfileVisibility] =
    useState('private');
  const [storyVisibility, setStoryVisibility] =
    useState('followers');
  const [commentPermission, setCommentPermission] =
    useState('followers');
  const [tagPermission, setTagPermission] =
    useState('followers');
  const [mentionPermission, setMentionPermission] =
    useState('everyone');
  const [remixPermission, setRemixPermission] =
    useState('followers');
  const [downloadPermission, setDownloadPermission] =
    useState('nobody');
  const [sharePermission, setSharePermission] =
    useState('followers');
  const [messagePermission, setMessagePermission] =
    useState('followers');
  const [messageRequests, setMessageRequests] =
    useState('allow');
  const [callPermission, setCallPermission] =
    useState('followers');
  const [videoPermission, setVideoPermission] =
    useState('followers');
  const [groupPermission, setGroupPermission] =
    useState('followers');
  const [linkPreview, setLinkPreview] =
    useState('enabled');

  const [values, setValues] = useState(() => ({
    privateAccount: readBoolean(
      PRIVACY_KEYS.privateAccount,
      true
    ),
    hideOnline: readBoolean(PRIVACY_KEYS.hideOnline, true),
    hideLastSeen: readBoolean(PRIVACY_KEYS.hideLastSeen, true),
    hideReadReceipts: readBoolean(
      PRIVACY_KEYS.hideReadReceipts,
      true
    ),
    hideTyping: readBoolean(PRIVACY_KEYS.hideTyping, false),
    allowStoryReplies: readBoolean(
      PRIVACY_KEYS.allowStoryReplies,
      true
    ),
    allowStorySharing: readBoolean(
      PRIVACY_KEYS.allowStorySharing,
      false
    ),
    allowStoryMentions: readBoolean(
      PRIVACY_KEYS.allowStoryMentions,
      true
    ),
    archiveStories: readBoolean(
      PRIVACY_KEYS.archiveStories,
      true
    ),
    appearSearch: readBoolean(PRIVACY_KEYS.appearSearch, true),
    appearSuggestions: readBoolean(
      PRIVACY_KEYS.appearSuggestions,
      true
    ),
    mutualConnections: readBoolean(
      PRIVACY_KEYS.mutualConnections,
      true
    ),
    activityStatus: readBoolean(
      PRIVACY_KEYS.activityStatus,
      false
    ),
    recentlyActive: readBoolean(
      PRIVACY_KEYS.recentlyActive,
      false
    ),
    contactSync: readBoolean(
      PRIVACY_KEYS.contactSync,
      false
    ),
    screenshotShield: readBoolean(
      PRIVACY_KEYS.screenshotShield,
      true
    ),
    recordingProtection: readBoolean(
      PRIVACY_KEYS.recordingProtection,
      true
    ),
    shoulderSurf: readBoolean(
      PRIVACY_KEYS.shoulderSurf,
      false
    ),
    gazeLock: readBoolean(PRIVACY_KEYS.gazeLock, true),
    oneTapLock: readBoolean(PRIVACY_KEYS.oneTapLock, false),
    emergencyPrivacy: readBoolean(
      PRIVACY_KEYS.emergencyPrivacy,
      false
    ),
    appLock: readBoolean(PRIVACY_KEYS.appLock, false),
    decoyVault: readBoolean(PRIVACY_KEYS.decoyVault, false),
    antiPeek: readBoolean(PRIVACY_KEYS.antiPeek, false),
  }));

  const privacyScore = useMemo(() => {
    const enabled = Object.values(values).filter(Boolean).length;
    return Math.min(100, 62 + enabled * 3);
  }, [values]);

  const updateValue = (key, value) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));

    localStorage.setItem(PRIVACY_KEYS[key], String(value));
  };

  const showToast = (value) => {
    setToast(value);
    window.setTimeout(() => setToast(''), 2600);
  };

  const openRoute = (route) => {
    navigate(route);
  };

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Privacy Center"
        showBackButton
        initialGazeLock={values.gazeLock}
        onGazeLockChange={(value) =>
          updateValue('gazeLock', value)
        }
      />

      <main style={styles.content}>
        <section style={styles.hero}>
          <span style={styles.heroIcon}>
            <ShieldCheck size={28} />
          </span>

          <div style={styles.heroCopy}>
            <h1 style={styles.title}>Privacy Center</h1>
            <p style={styles.subtitle}>
              Control who can see your profile, stories, activity,
              and personal information.
            </p>
          </div>

          <span style={styles.statusBadge}>Protected</span>
        </section>

        <section style={styles.scoreCard}>
          <div
            style={{
              ...styles.scoreCircle,
              background: `conic-gradient(#7c5cff ${privacyScore}%, rgba(255,255,255,0.08) ${privacyScore}% 100%)`,
            }}
          >
            <div style={styles.scoreInner}>
              <strong>{privacyScore}</strong>
              <span>/ 100</span>
            </div>
          </div>

          <div>
            <h2 style={styles.scoreTitle}>Strong privacy</h2>
            <p style={styles.scoreText}>
              Your privacy controls are configured with strong
              protection. Review discoverability and message
              permissions regularly.
            </p>
          </div>
        </section>

        <Section title="Profile Privacy" icon={CircleUserRound}>
          <SelectRow
            icon={Eye}
            title="Profile Visibility"
            description="Choose who can view your profile."
            value={profileVisibility}
            onChange={setProfileVisibility}
            options={[
              ['private', 'Private Account'],
              ['public', 'Public Account'],
              ['followers', 'Followers Only'],
              ['close-friends', 'Close Friends Only'],
            ]}
          />

          <ToggleRow
            icon={EyeOff}
            title="Hide Online Status"
            description="Hide when you are currently online."
            value={values.hideOnline}
            onChange={(value) =>
              updateValue('hideOnline', value)
            }
          />

          <ToggleRow
            icon={History}
            title="Hide Last Seen"
            description="Hide your last active time."
            value={values.hideLastSeen}
            onChange={(value) =>
              updateValue('hideLastSeen', value)
            }
          />

          <ToggleRow
            icon={MessageCircle}
            title="Hide Read Receipts"
            description="Do not show when you read messages."
            value={values.hideReadReceipts}
            onChange={(value) =>
              updateValue('hideReadReceipts', value)
            }
          />

          <ToggleRow
            icon={MessageCircle}
            title="Hide Typing Indicator"
            description="Hide typing activity in chats."
            value={values.hideTyping}
            onChange={(value) =>
              updateValue('hideTyping', value)
            }
          />
        </Section>

        <Section title="Story Privacy" icon={Archive}>
          <SelectRow
            icon={Eye}
            title="Story Visibility"
            description="Choose who can see your stories."
            value={storyVisibility}
            onChange={setStoryVisibility}
            options={[
              ['public', 'Public'],
              ['followers', 'Followers'],
              ['close-friends', 'Close Friends'],
              ['only-me', 'Only Me'],
            ]}
          />

          <ToggleRow
            icon={MessageCircle}
            title="Allow Story Replies"
            description="Allow viewers to reply to your stories."
            value={values.allowStoryReplies}
            onChange={(value) =>
              updateValue('allowStoryReplies', value)
            }
          />

          <ToggleRow
            icon={Send}
            title="Allow Story Sharing"
            description="Allow viewers to share your stories."
            value={values.allowStorySharing}
            onChange={(value) =>
              updateValue('allowStorySharing', value)
            }
          />

          <ToggleRow
            icon={Users}
            title="Allow Story Mentions"
            description="Allow people to mention you in stories."
            value={values.allowStoryMentions}
            onChange={(value) =>
              updateValue('allowStoryMentions', value)
            }
          />

          <ToggleRow
            icon={Archive}
            title="Archive Stories Automatically"
            description="Keep expired stories in your archive."
            value={values.archiveStories}
            onChange={(value) =>
              updateValue('archiveStories', value)
            }
          />
        </Section>

        <Section title="Post Privacy" icon={FileIcon}>
          <SelectRow
            icon={MessageCircle}
            title="Who Can Comment"
            description="Control comments on your posts."
            value={commentPermission}
            onChange={setCommentPermission}
            options={[
              ['everyone', 'Everyone'],
              ['followers', 'Followers'],
              ['close-friends', 'Close Friends'],
              ['nobody', 'Nobody'],
            ]}
          />

          <SelectRow
            icon={UserCheck}
            title="Who Can Tag You"
            description="Control who can tag your account."
            value={tagPermission}
            onChange={setTagPermission}
            options={[
              ['everyone', 'Everyone'],
              ['followers', 'Followers'],
              ['nobody', 'Nobody'],
            ]}
          />

          <SelectRow
            icon={AtIcon}
            title="Who Can Mention You"
            description="Control mentions in posts and comments."
            value={mentionPermission}
            onChange={setMentionPermission}
            options={[
              ['everyone', 'Everyone'],
              ['followers', 'Followers'],
              ['nobody', 'Nobody'],
            ]}
          />

          <SelectRow
            icon={RefreshIcon}
            title="Who Can Remix Your Reels"
            description="Control remix permissions."
            value={remixPermission}
            onChange={setRemixPermission}
            options={[
              ['everyone', 'Everyone'],
              ['followers', 'Followers'],
              ['nobody', 'Nobody'],
            ]}
          />

          <SelectRow
            icon={CloudDownload}
            title="Who Can Download Your Content"
            description="Control downloads of your content."
            value={downloadPermission}
            onChange={setDownloadPermission}
            options={[
              ['everyone', 'Everyone'],
              ['followers', 'Followers'],
              ['nobody', 'Nobody'],
            ]}
          />

          <SelectRow
            icon={Send}
            title="Who Can Share Your Posts"
            description="Control external sharing."
            value={sharePermission}
            onChange={setSharePermission}
            options={[
              ['everyone', 'Everyone'],
              ['followers', 'Followers'],
              ['nobody', 'Nobody'],
            ]}
          />
        </Section>

        <Section title="Message Privacy" icon={MessageCircle}>
          <SelectRow
            icon={MessageCircle}
            title="Who Can Message You"
            description="Control new direct messages."
            value={messagePermission}
            onChange={setMessagePermission}
            options={[
              ['everyone', 'Everyone'],
              ['followers', 'Followers'],
              ['nobody', 'Nobody'],
            ]}
          />

          <SelectRow
            icon={Bell}
            title="Message Requests"
            description="Choose how new requests are handled."
            value={messageRequests}
            onChange={setMessageRequests}
            options={[
              ['allow', 'Allow'],
              ['filter', 'Filter'],
              ['block', 'Block'],
            ]}
          />

          <SelectRow
            icon={Phone}
            title="Voice Call Permissions"
            description="Control who can voice call you."
            value={callPermission}
            onChange={setCallPermission}
            options={[
              ['everyone', 'Everyone'],
              ['followers', 'Followers'],
              ['nobody', 'Nobody'],
            ]}
          />

          <SelectRow
            icon={Video}
            title="Video Call Permissions"
            description="Control who can video call you."
            value={videoPermission}
            onChange={setVideoPermission}
            options={[
              ['everyone', 'Everyone'],
              ['followers', 'Followers'],
              ['nobody', 'Nobody'],
            ]}
          />

          <SelectRow
            icon={Users}
            title="Group Invitation Permissions"
            description="Control who can add you to groups."
            value={groupPermission}
            onChange={setGroupPermission}
            options={[
              ['everyone', 'Everyone'],
              ['followers', 'Followers'],
              ['nobody', 'Nobody'],
            ]}
          />

          <SelectRow
            icon={Link2}
            title="Link Preview Control"
            description="Control previews for shared links."
            value={linkPreview}
            onChange={setLinkPreview}
            options={[
              ['enabled', 'Enabled'],
              ['ask', 'Ask Each Time'],
              ['disabled', 'Disabled'],
            ]}
          />
        </Section>

        <Section title="Discoverability" icon={Search}>
          <ToggleRow
            icon={Search}
            title="Appear in Search"
            description="Allow your profile to appear in search."
            value={values.appearSearch}
            onChange={(value) =>
              updateValue('appearSearch', value)
            }
          />

          <ToggleRow
            icon={Users}
            title="Appear in Suggestions"
            description="Allow Aarush to suggest your profile."
            value={values.appearSuggestions}
            onChange={(value) =>
              updateValue('appearSuggestions', value)
            }
          />

          <ToggleRow
            icon={Users}
            title="Show Mutual Connections"
            description="Show shared connections on your profile."
            value={values.mutualConnections}
            onChange={(value) =>
              updateValue('mutualConnections', value)
            }
          />

          <ToggleRow
            icon={Eye}
            title="Show Activity Status"
            description="Show when you are active."
            value={values.activityStatus}
            onChange={(value) =>
              updateValue('activityStatus', value)
            }
          />

          <ToggleRow
            icon={ClockIcon}
            title="Show Recently Active"
            description="Show your recent activity indicator."
            value={values.recentlyActive}
            onChange={(value) =>
              updateValue('recentlyActive', value)
            }
          />

          <ToggleRow
            icon={Smartphone}
            title="Allow Contact Sync"
            description="Use contacts to improve discovery."
            value={values.contactSync}
            onChange={(value) =>
              updateValue('contactSync', value)
            }
          />
        </Section>

        <Section title="Block & Restrict" icon={ShieldAlert}>
          {[
            ['Blocked Accounts', Users],
            ['Restricted Accounts', UserCheck],
            ['Hidden Accounts', EyeOff],
            ['Muted Accounts', Bell],
            ['Hidden Words', Filter],
            ['Sensitive Content Filter', Shield],
          ].map(([label, Icon]) => (
            <ActionButton
              key={label}
              icon={Icon}
              label={label}
              onClick={() => showToast(`${label} opened.`)}
            />
          ))}
        </Section>

        <Section title="Data & Permissions" icon={Settings2}>
          {[
            ['Download My Data', CloudDownload],
            ['Delete Search History', History],
            ['Clear Watch History', History],
            ['Clear Cache', Archive],
            ['Manage Connected Apps', Link2],
            ['Manage Permissions', Settings2],
            ['Camera Permission', Camera],
            ['Microphone Permission', MicIcon],
            ['Storage Permission', Archive],
            ['Notification Permission', Bell],
          ].map(([label, Icon]) => (
            <ActionButton
              key={label}
              icon={Icon}
              label={label}
              onClick={() => showToast(`${label} opened.`)}
            />
          ))}
        </Section>

        <Section title="Advanced Privacy" icon={ShieldCheck}>
          <ToggleRow
            icon={Camera}
            title="Screenshot Shield"
            description="Protect sensitive screens from screenshots."
            value={values.screenshotShield}
            onChange={(value) =>
              updateValue('screenshotShield', value)
            }
          />

          <ToggleRow
            icon={MonitorDown}
            title="Screen Recording Protection"
            description="Protect sensitive content while recording."
            value={values.recordingProtection}
            onChange={(value) =>
              updateValue('recordingProtection', value)
            }
          />

          <ToggleRow
            icon={EyeOff}
            title="Shoulder Surf Protection"
            description="Blur private content around you."
            value={values.shoulderSurf}
            onChange={(value) =>
              updateValue('shoulderSurf', value)
            }
          />

          <ToggleRow
            icon={ShieldCheck}
            title="Gaze Lock"
            description="Protect content when you look away."
            value={values.gazeLock}
            onChange={(value) =>
              updateValue('gazeLock', value)
            }
          />

          <ToggleRow
            icon={LockKeyhole}
            title="One Tap Lock"
            description="Lock Aarush immediately."
            value={values.oneTapLock}
            onChange={(value) =>
              updateValue('oneTapLock', value)
            }
          />

          <ToggleRow
            icon={ShieldAlert}
            title="Emergency Privacy"
            description="Enable fast emergency protection."
            value={values.emergencyPrivacy}
            onChange={(value) =>
              updateValue('emergencyPrivacy', value)
            }
          />

          <ToggleRow
            icon={Lock}
            title="App Lock"
            description="Require verification before access."
            value={values.appLock}
            onChange={(value) =>
              updateValue('appLock', value)
            }
          />

          <ToggleRow
            icon={Archive}
            title="Decoy Vault"
            description="Protect hidden secure storage."
            value={values.decoyVault}
            onChange={(value) =>
              updateValue('decoyVault', value)
            }
          />

          <ToggleRow
            icon={Shield}
            title="Anti-Peek Shield"
            description="Reduce exposure of sensitive content."
            value={values.antiPeek}
            onChange={(value) =>
              updateValue('antiPeek', value)
            }
          />
        </Section>

        <Section title="Privacy Activity" icon={History}>
          <div style={styles.activityList}>
            {PRIVACY_ACTIVITY.map(
              ([title, date, time, status]) => (
                <div key={`${title}-${date}-${time}`} style={styles.activityRow}>
                  <span style={styles.activityDot} />

                  <div style={styles.activityCopy}>
                    <strong>{title}</strong>
                    <small>
                      {time} · {date} · {status}
                    </small>
                  </div>
                </div>
              )
            )}
          </div>
        </Section>

        <Section title="Privacy Systems" icon={Shield}>
          <div style={styles.systemGrid}>
            {PRIVACY_SYSTEMS.map(([name, status]) => (
              <StatusRow
                key={name}
                name={name}
                status={status}
              />
            ))}
          </div>
        </Section>

        <Section title="Quick Privacy Actions" icon={ZapIcon}>
          <ActionButton
            icon={ShieldCheck}
            label="Open Security Center"
            onClick={() => openRoute('/security-center')}
          />

          <ActionButton
            icon={GaugeIcon}
            label="Open Privacy Dashboard"
            onClick={() => openRoute('/privacy-dashboard')}
          />

          <ActionButton
            icon={ShieldAlert}
            label="Open Emergency Privacy"
            onClick={() => openRoute('/emergency-privacy')}
          />

          <ActionButton
            icon={EyeOff}
            label="Open Shoulder Surf"
            onClick={() => openRoute('/shoulder-surf')}
          />

          <ActionButton
            icon={LockKeyhole}
            label="Open App Lock Settings"
            onClick={() => openRoute('/app-lock-settings')}
          />

          <ActionButton
            icon={FileDown}
            label="Export Privacy Report"
            onClick={() =>
              showToast('Privacy report export prepared.')
            }
          />
        </Section>
      </main>

      <BottomNav />

      {toast ? (
        <div role="status" style={styles.toast}>
          {toast}

          <button
            type="button"
            onClick={() => setToast('')}
            style={styles.toastClose}
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FileIcon(props) {
  return <Archive {...props} />;
}

function AtIcon(props) {
  return <CircleUserRound {...props} />;
}

function RefreshIcon(props) {
  return <RefreshCw {...props} />;
}

function ClockIcon(props) {
  return <History {...props} />;
}

function MicIcon(props) {
  return <Mic {...props} />;
}

function ZapIcon(props) {
  return <ShieldCheck {...props} />;
}

function GaugeIcon(props) {
  return <Shield {...props} />;
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '6.8rem',
    background:
      'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
    color: '#f4f7ff',
  },

  content: {
    width: '100%',
    maxWidth: '860px',
    margin: '0 auto',
    padding: '1rem 0.9rem',
    display: 'grid',
    gap: '0.9rem',
  },

  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '1rem',
    borderRadius: '1.3rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
  },

  heroIcon: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '1rem',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
    boxShadow: '0 0 24px rgba(124,92,255,0.24)',
  },

  heroCopy: {
    minWidth: 0,
    flex: 1,
  },

  title: {
    margin: 0,
    color: '#f5f8ff',
    fontSize: '1.08rem',
    fontWeight: 850,
  },

  subtitle: {
    margin: '0.25rem 0 0',
    color: '#96a3bf',
    fontSize: '0.74rem',
    lineHeight: 1.5,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    padding: '0.35rem 0.5rem',
    borderRadius: '999px',
    background: 'rgba(130,233,193,0.12)',
    color: '#82e9c1',
    fontSize: '0.6rem',
    fontWeight: 850,
  },

  scoreCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(15,19,30,0.94))',
    border: '1px solid rgba(124,92,255,0.24)',
  },

  scoreCircle: {
    width: '6.4rem',
    height: '6.4rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    padding: '0.45rem',
    borderRadius: '999px',
  },

  scoreInner: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    borderRadius: '999px',
    background: '#101624',
  },

  scoreTitle: {
    margin: 0,
    color: '#f5f8ff',
    fontSize: '0.98rem',
  },

  scoreText: {
    margin: '0.35rem 0 0',
    color: '#96a3bf',
    fontSize: '0.73rem',
    lineHeight: 1.5,
  },

  card: {
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.2)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    marginBottom: '0.8rem',
  },

  sectionIcon: {
    width: '2.15rem',
    height: '2.15rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))',
    color: '#dce8ff',
  },

  sectionTitle: {
    margin: 0,
    color: '#f5f8ff',
    fontSize: '0.92rem',
    fontWeight: 850,
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '0.75rem',
    borderRadius: '0.9rem',
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.04)',
  },

  rowIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.1))',
    color: '#dce8ff',
  },

  rowCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.18rem',
    flex: 1,
  },

  checkbox: {
    width: '1.15rem',
    height: '1.15rem',
    flexShrink: 0,
    accentColor: '#7c5cff',
  },

  select: {
    maxWidth: '8rem',
    minHeight: '2.2rem',
    padding: '0 0.45rem',
    borderRadius: '0.65rem',
    border: '1px solid rgba(255,255,255,0.1)',
    background: '#171d2c',
    color: '#eaf0ff',
    fontSize: '0.65rem',
    fontWeight: 750,
  },

  actionButton: {
    width: '100%',
    minHeight: '2.55rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.65rem 0.7rem',
    borderRadius: '0.8rem',
    border: '1px solid rgba(124,92,255,0.25)',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(77,215,255,0.08))',
    color: '#eaf0ff',
    textAlign: 'left',
    fontSize: '0.7rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  activityList: {
    display: 'grid',
    gap: '0.15rem',
  },

  activityRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.55rem',
    padding: '0.65rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },

  activityDot: {
    width: '0.5rem',
    height: '0.5rem',
    marginTop: '0.32rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: '#82e9c1',
    boxShadow: '0 0 9px rgba(130,233,193,0.65)',
  },

  activityCopy: {
    display: 'grid',
    gap: '0.18rem',
  },

  systemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.45rem',
  },

  systemRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.55rem',
    borderRadius: '0.7rem',
    background: 'rgba(255,255,255,0.04)',
  },

  statusDot: {
    width: '0.5rem',
    height: '0.5rem',
    flexShrink: 0,
    borderRadius: '999px',
  },

  systemName: {
    minWidth: 0,
    overflow: 'hidden',
    flex: 1,
    color: '#cbd6ec',
    fontSize: '0.59rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  systemStatus: {
    fontSize: '0.53rem',
    fontWeight: 850,
  },

  toast: {
    position: 'fixed',
    right: '1rem',
    bottom: '6.2rem',
    left: '1rem',
    zIndex: 1200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    width: 'fit-content',
    maxWidth: 'calc(100% - 2rem)',
    margin: '0 auto',
    padding: '0.75rem 0.9rem',
    borderRadius: '999px',
    background: 'rgba(17,22,35,0.97)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
    color: '#eaf0ff',
    fontSize: '0.72rem',
    fontWeight: 750,
  },

  toastClose: {
    width: '1.6rem',
    height: '1.6rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    color: '#aab6cf',
    cursor: 'pointer',
  },
};