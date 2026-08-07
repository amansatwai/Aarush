import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Fingerprint,
  Globe2,
  Lock,
  MessageSquare,
  Radio,
  RefreshCw,
  ScanFace,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Video,
  Wifi,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import StealthChatPanel from '../components/StealthChatPanel';
import useStealthPrivacy from '../hooks/useStealthPrivacy';

const hiddenIdentityOptions = [
  ['secretIdentityMode', 'Secret Identity Mode', 'Use a protected identity profile inside Aarush.', Fingerprint],
  ['aliasDisplayName', 'Alias Display Name', 'Show an alternate display name.', UserRound],
  ['hiddenProfileVisibility', 'Hidden Profile Visibility', 'Control who can discover the account.', EyeOff],
  ['anonymousCollaboration', 'Anonymous Collaboration', 'Collaborate without exposing the primary identity.', Users],
  ['identityMasking', 'Identity Masking', 'Hide selected profile information.', Shield],
];

const relationshipOptions = [
  ['hideFollowers', 'Hide Followers', 'Hide follower relationships from other people.'],
  ['hideFollowing', 'Hide Following', 'Hide accounts you follow.'],
  ['hideMutualFriends', 'Hide Mutual Friends', 'Hide shared connections.'],
  ['hideCloseFriends', 'Hide Close Friends', 'Protect private-circle membership.'],
  ['hideStoryAudience', 'Hide Story Audience', 'Hide who can view selected stories.'],
  ['hideInteractionHistory', 'Hide Interaction History', 'Reduce visibility of social interactions.'],
  ['hideSharedActivity', 'Hide Shared Activity', 'Hide shared actions and relationship activity.'],
  ['hideRelationshipIndicators', 'Hide Relationship Indicators', 'Remove visible relationship signals.'],
  ['hideTaggedPhotos', 'Hide Tagged Photos', 'Restrict tagged media visibility.'],
  ['hideMentions', 'Hide Mentions', 'Control who can see profile mentions.'],
];

const invisibleOptions = [
  ['hideOnlineStatus', 'Hide Online Status', 'Appear offline while continuing to use Aarush.'],
  ['hideLastSeen', 'Hide Last Seen', 'Hide the last time you were active.'],
  ['hideTypingIndicator', 'Hide Typing Indicator', 'Do not reveal when you are typing.'],
  ['hideReadReceipts', 'Hide Read Receipts', 'Control message read signals.'],
  ['hideActiveDevice', 'Hide Active Device', 'Hide which device is currently active.'],
  ['hideCallAvailability', 'Hide Call Availability', 'Reduce visible call presence.'],
  ['appearOfflineWhileActive', 'Appear Offline While Active', 'Continue using Aarush while appearing offline.'],
  ['scheduleInvisibleHours', 'Schedule Invisible Hours', 'Set recurring invisible privacy periods.'],
];

const notificationOptions = [
  ['hideSenderName', 'Hide Sender Name', 'Remove sender identity from notification previews.'],
  ['hideMessageContent', 'Hide Message Content', 'Hide message text from notifications.'],
  ['hideChatIdentity', 'Hide Chat Identity', 'Prevent chat names from appearing.'],
  ['genericNotificationMode', 'Generic Notification Mode', 'Show a generic Aarush notification.'],
  ['silentStealthNotifications', 'Silent Stealth Notifications', 'Receive protected notifications without sound.'],
  ['lockedNotificationPreview', 'Locked Notification Preview', 'Protect previews while the device is locked.'],
  ['aiSmartFiltering', 'AI Smart Notification Filtering', 'Filter sensitive notification details intelligently.'],
];

const audienceOptions = [
  ['Public', 'Anyone can discover and view permitted content.'],
  ['Friends', 'Only accepted friends can view it.'],
  ['Family', 'Only the family audience can view it.'],
  ['Work', 'Only the work audience can view it.'],
  ['Close Friends', 'Only the private close-friends circle can view it.'],
  ['Custom List', 'Use a custom audience list.'],
  ['Only Specific People', 'Choose individual people.'],
  ['Hidden Audience', 'Hide audience information from viewers.'],
  ['Secret Circle', 'Use an invite-only private circle.'],
];

const backgroundSystems = [
  ['Stealth Chat Engine', 'Active', MessageSquare],
  ['Hidden Identity Engine', 'Protected', Fingerprint],
  ['Split Persona Engine', 'Active', Users],
  ['Relationship Privacy Engine', 'Active', Shield],
  ['Audience Ring Engine', 'Active', Radio],
  ['Identity Shield Engine', 'Protected', ShieldCheck],
  ['Notification Privacy Engine', 'Active', Bell],
  ['AI Identity Analysis', 'Syncing', Sparkles],
  ['Encrypted Hidden Storage', 'Protected', Lock],
  ['Persona Synchronization', 'Syncing', RefreshCw],
  ['Privacy Automation', 'Active', RefreshCw],
  ['Realtime Stealth Sync', 'Syncing', Wifi],
];

const futureIdentityFeatures = [
  ['Adaptive Identity Protection', 'Adapt identity protection to context.', Shield],
  ['AI Persona Management', 'Manage private personas intelligently.', Users],
  ['Intelligent Relationship Shield', 'Protect relationship information automatically.', ShieldCheck],
  ['Predictive Privacy Control', 'Predict and prevent privacy exposure.', Sparkles],
  ['AI Audience Optimization', 'Recommend safer audiences for each post.', Radio],
  ['Autonomous Identity Guardian', 'Continuously protect identity signals.', Fingerprint],
  ['Invisible Collaboration', 'Collaborate without exposing primary identity.', UserRound],
  ['AI Reputation Protection', 'Protect identity reputation across Aarush.', ShieldAlert],
];

function GlassSection({ children }) {
  return (
    <section
      style={{
        marginTop: '0.9rem',
        padding: '1rem',
        borderRadius: '1.25rem',
        background: 'rgba(15,19,30,0.88)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.24)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {children}
    </section>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
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
          display: 'grid',
          placeItems: 'center',
          borderRadius: '0.75rem',
          background:
            'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
          color: '#dfe7ff',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </span>

      <div>
        <h2
          style={{
            margin: 0,
            color: '#f4f7ff',
            fontSize: '0.98rem',
            fontWeight: 850,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: '0.25rem 0 0',
            color: '#8e9bb7',
            fontSize: '0.75rem',
            lineHeight: 1.45,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function ToggleRow({ id, title, description, icon: Icon, checked, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.68rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Icon size={15} color="#aebcda" />

      <span style={{ minWidth: 0, flex: 1 }}>
        <strong
          style={{
            display: 'block',
            color: '#e9efff',
            fontSize: '0.74rem',
          }}
        >
          {title}
        </strong>

        <span
          style={{
            display: 'block',
            marginTop: '0.18rem',
            color: '#8997b3',
            fontSize: '0.64rem',
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle ${title}`}
        onClick={() => onChange(id)}
        style={{
          width: '2.5rem',
          height: '1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: checked ? 'flex-end' : 'flex-start',
          padding: '0.15rem',
          border: 0,
          borderRadius: '999px',
          background: checked
            ? 'linear-gradient(135deg, #7c5cff, #4dd7ff)'
            : 'rgba(255,255,255,0.12)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: '1.1rem',
            height: '1.1rem',
            borderRadius: '999px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        />
      </button>
    </div>
  );
}

function SystemStatus({ status }) {
  const color =
    status === 'Active'
      ? '#83e9c1'
      : status === 'Protected'
        ? '#8edfff'
        : status === 'Syncing'
          ? '#c8b8ff'
          : '#ffd28d';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        color,
        fontSize: '0.6rem',
        fontWeight: 800,
      }}
    >
      {status === 'Syncing' ? <RefreshCw size={10} /> : <span>●</span>}
      {status}
    </span>
  );
}

export default function StealthPrivacy() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [activePersonaId, setActivePersonaId] = useState('persona-primary');
  const [audience, setAudience] = useState('Close Friends');

  const {
    state,
    active,
    personas,
    scanResult,
    toggleSetting,
    activate,
    deactivate,
    changeAudienceRing,
    scanIdentity,
    addPersona,
    editPersona,
    removePersona,
    identityRisks,
  } = useStealthPrivacy();

  const score = active ? 99 : state.stealthScore;
  const level =
    score >= 95 ? 'Invisible' : score >= 80 ? 'Protected' : score >= 60 ? 'Moderate' : 'Exposed';

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

  const handleActivate = () => {
    activate();
    showMessage('Stealth mode is now active.');
  };

  const handleCreatePersona = () => {
    const next = addPersona({
      name: `Persona ${personas.length + 1}`,
      displayName: 'Private Identity',
      username: `@private.${personas.length + 1}`,
      audience: 'Custom List',
    });

    setActivePersonaId(next[next.length - 1].id);
    showMessage('Private persona created.');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '7rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.52) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <TopBar
        pageTitle="Stealth Privacy"
        onChatClick={() => navigate('/chats')}
        onOneTapLock={() => navigate('/lock')}
      />

      <main
        style={{
          width: '100%',
          maxWidth: '760px',
          margin: '0 auto',
          padding: '0.9rem',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '0.8rem',
            padding: '0.35rem 0.55rem',
            border: 0,
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.05)',
            color: '#aebbd5',
            fontSize: '0.72rem',
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={15} />
          Back
        </button>

        <section
          style={{
            padding: '1.25rem',
            borderRadius: '1.5rem',
            background:
              'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(77,215,255,0.1), rgba(255,79,216,0.08))',
            border: '1px solid rgba(124,92,255,0.25)',
            boxShadow:
              '0 24px 70px rgba(0,0,0,0.32), 0 0 32px rgba(124,92,255,0.12)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.8rem',
            }}
          >
            <div
              style={{
                width: '3.6rem',
                height: '3.6rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '1.15rem',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
                boxShadow: '0 0 30px rgba(77,215,255,0.25)',
                flexShrink: 0,
              }}
            >
              <EyeOff size={29} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  color: '#f8faff',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                }}
              >
                Stealth Privacy &amp; Hidden Identity
              </h1>

              <p
                style={{
                  margin: '0.45rem 0 0',
                  color: '#c1cce2',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                }}
              >
                Hide conversations, protect relationships, control visibility,
                and secure your identity with intelligent privacy protection.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1.2rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: '6.4rem',
                height: '6.4rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '999px',
                background: `conic-gradient(#61e8b4 ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '5.25rem',
                  height: '5.25rem',
                  display: 'grid',
                  placeItems: 'center',
                  alignContent: 'center',
                  borderRadius: '999px',
                  background: '#111827',
                  textAlign: 'center',
                }}
              >
                <strong
                  style={{
                    color: '#f7fbff',
                    fontSize: '1.15rem',
                    lineHeight: 1,
                  }}
                >
                  {score}
                </strong>

                <span
                  style={{
                    marginTop: '0.22rem',
                    color: '#91a0bd',
                    fontSize: '0.6rem',
                  }}
                >
                  / 100
                </span>
              </div>
            </div>

            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: '#83edc1',
                  fontSize: '0.8rem',
                  fontWeight: 850,
                }}
              >
                <ShieldCheck size={14} />
                {level}
              </span>

              <p
                style={{
                  margin: '0.38rem 0 0',
                  color: '#aab7d0',
                  fontSize: '0.72rem',
                  lineHeight: 1.5,
                }}
              >
                {active
                  ? 'Stealth mode is actively reducing identity, relationship, and presence exposure.'
                  : 'Activate stealth mode to apply your selected hidden-identity protections.'}
              </p>
            </div>
          </div>
        </section>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Instant Stealth Actions"
            description="Apply common stealth protections immediately."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {[
              ['Activate Stealth Mode', 'Hide selected chats, activity, and identity indicators immediately.', Shield, handleActivate],
              ['Hide Sensitive Conversations', 'Move selected chats into a hidden encrypted space.', MessageSquare, () => toggleSetting('stealthChat', 'hiddenChats')],
              ['Enable Invisible Online Mode', 'Appear offline while continuing to use the app.', EyeOff, () => toggleSetting('invisibleMode', 'appearOfflineWhileActive')],
              ['Hide Relationship Data', 'Protect followers, following, close friends, and interaction history.', Users, () => toggleSetting('relationshipPrivacy', 'hideInteractionHistory')],
              ['Open Hidden Vault', 'Access encrypted hidden conversations and media.', Lock, () => showMessage('Hidden vault is ready for encrypted storage integration.')],
              ['Open AI Identity Shield', 'Launch identity protection analysis.', Sparkles, () => {
                const result = scanIdentity();
                showMessage(result.summary);
              }],
            ].map(([title, description, Icon, onClick]) => (
              <button
                key={title}
                type="button"
                onClick={onClick}
                style={{
                  minHeight: '5.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#edf2ff',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={18} color="#bdb2ff" />

                <span>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 850,
                    }}
                  >
                    {title}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.22rem',
                      color: '#8997b3',
                      fontSize: '0.65rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={MessageSquare}
            title="Stealth Chat"
            description="Protect conversations and hide sensitive chat identity."
          />

          <StealthChatPanel
            settings={state.stealthChat}
            onToggle={(id) => toggleSetting('stealthChat', id)}
            onOpenVault={() =>
              showMessage('Hidden vault is prepared for encrypted stealth storage.')
            }
          />
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Fingerprint}
            title="Hidden Identity"
            description="Control the identity information shown inside Aarush."
          />

          {hiddenIdentityOptions.map(([id, title, description, Icon]) => (
            <ToggleRow
              key={id}
              id={id}
              title={title}
              description={description}
              icon={Icon}
              checked={state.hiddenIdentity[id]}
              onChange={() => toggleSetting('hiddenIdentity', id)}
            />
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Users}
            title="Split Persona"
            description="Use multiple private personas inside the same account."
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {personas.map((persona) => (
              <div
                key={persona.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem',
                  borderRadius: '0.95rem',
                  border:
                    activePersonaId === persona.id
                      ? '1px solid rgba(124,92,255,0.3)'
                      : '1px solid rgba(255,255,255,0.07)',
                  background:
                    activePersonaId === persona.id
                      ? 'rgba(124,92,255,0.12)'
                      : 'rgba(255,255,255,0.04)',
                }}
              >
                <img
                  src={persona.photo}
                  alt={`${persona.displayName} persona`}
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '999px',
                    objectFit: 'cover',
                    border: '2px solid rgba(124,92,255,0.4)',
                  }}
                />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#edf2ff',
                      fontSize: '0.74rem',
                    }}
                  >
                    {persona.displayName}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.18rem',
                      color: '#8997b3',
                      fontSize: '0.63rem',
                    }}
                  >
                    {persona.username} · {persona.audience}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => setActivePersonaId(persona.id)}
                  style={{
                    minHeight: '2.2rem',
                    padding: '0 0.55rem',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '999px',
                    background:
                      activePersonaId === persona.id
                        ? 'rgba(82,232,170,0.1)'
                        : 'rgba(255,255,255,0.05)',
                    color:
                      activePersonaId === persona.id
                        ? '#83e9c1'
                        : '#dce5f8',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {activePersonaId === persona.id ? 'Active' : 'Switch'}
                </button>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              marginTop: '0.7rem',
            }}
          >
            <button
              type="button"
              onClick={handleCreatePersona}
              style={{
                minHeight: '2.5rem',
                padding: '0 0.75rem',
                border: 0,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
                fontSize: '0.66rem',
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              Create Persona
            </button>

            <button
              type="button"
              onClick={() => showMessage('Persona locking is ready for AppLockGate integration.')}
              style={{
                minHeight: '2.5rem',
                padding: '0 0.75rem',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.66rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Lock Persona
            </button>

            <button
              type="button"
              onClick={() => {
                if (personas.length <= 1) {
                  showMessage('The primary persona cannot be deleted.');
                  return;
                }

                removePersona(activePersonaId);
                setActivePersonaId('persona-primary');
                showMessage('Persona deleted.');
              }}
              style={{
                minHeight: '2.5rem',
                padding: '0 0.75rem',
                border: '1px solid rgba(255,79,122,0.2)',
                borderRadius: '999px',
                background: 'rgba(255,79,122,0.08)',
                color: '#ffadc4',
                fontSize: '0.66rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Delete Persona
            </button>
          </div>

          <p
            style={{
              margin: '0.7rem 0 0',
              color: '#8997b3',
              fontSize: '0.65rem',
              lineHeight: 1.45,
            }}
          >
            Each persona can later have its own display name, photo, bio,
            audience, close friends, story audience, chat identity, and
            notification behavior.
          </p>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Shield}
            title="Relationship Privacy Mode"
            description="Protect relationship signals, audience data, and interaction history."
          />

          {relationshipOptions.map(([id, title, description]) => (
            <ToggleRow
              key={id}
              id={id}
              title={title}
              description={description}
              icon={Users}
              checked={state.relationshipPrivacy[id]}
              onChange={() => toggleSetting('relationshipPrivacy', id)}
            />
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={EyeOff}
            title="Invisible Online Mode"
            description="Appear offline while continuing to use Aarush."
          />

          {invisibleOptions.map(([id, title, description]) => (
            <ToggleRow
              key={id}
              id={id}
              title={title}
              description={description}
              icon={EyeOff}
              checked={state.invisibleMode[id]}
              onChange={() => toggleSetting('invisibleMode', id)}
            />
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Radio}
            title="Audience Ring"
            description="Choose the default audience for posts, stories, reels, and messages."
          />

          <select
            value={audience}
            onChange={(event) => {
              setAudience(event.target.value);
              changeAudienceRing(event.target.value);
            }}
            style={{
              width: '100%',
              minHeight: '2.8rem',
              padding: '0 0.75rem',
              borderRadius: '0.8rem',
              border: '1px solid rgba(255,255,255,0.1)',
              outline: 0,
              background: '#151b2b',
              color: '#edf3ff',
              fontSize: '0.76rem',
            }}
          >
            {audienceOptions.map(([name, description]) => (
              <option key={name} value={name}>
                {name} — {description}
              </option>
            ))}
          </select>

          <p
            style={{
              margin: '0.6rem 0 0',
              color: '#8997b3',
              fontSize: '0.66rem',
              lineHeight: 1.45,
            }}
          >
            AI recommendations for audience selection can be connected later
            through the Aarush identity analysis engine.
          </p>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Users}
            title="Private Circle Feed"
            description="Create invite-only circles for private social activity."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Private posts', Shield],
              ['Private stories', Eye],
              ['Private reels', Video],
              ['Private comments', MessageSquare],
              ['Private reactions', Check],
              ['Private live sessions', Radio],
              ['Private collaboration', Users],
              ['Invite-only membership', Lock],
            ].map(([title, Icon]) => (
              <div
                key={title}
                style={{
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#dfe7f8',
                  fontSize: '0.67rem',
                  fontWeight: 800,
                }}
              >
                <Icon size={15} color="#aebcda" />
                <span style={{ display: 'block', marginTop: '0.4rem' }}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ShieldCheck}
            title="AI Identity Shield"
            description="Aarush AI reviews identity and relationship exposure risks."
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {identityRisks.map((risk) => (
              <div
                key={risk.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.55rem',
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <ShieldAlert size={15} color={risk.risk === 'Moderate' ? '#ffd28d' : '#83e9c1'} />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#eaf0ff',
                      fontSize: '0.74rem',
                    }}
                  >
                    {risk.title}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.2rem',
                      color: '#8997b3',
                      fontSize: '0.63rem',
                    }}
                  >
                    {risk.status} · {risk.recommendation}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => showMessage(`${risk.title} action is ready for identity-shield integration.`)}
                  style={{
                    minHeight: '2.2rem',
                    padding: '0 0.5rem',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#dce5f8',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Review
                </button>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              marginTop: '0.7rem',
            }}
          >
            {['Scan Identity', 'View Risks', 'Protect Identity', 'Report Impersonation'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  const result = scanIdentity();
                  showMessage(result.summary);
                }}
                style={{
                  minHeight: '2.5rem',
                  padding: '0 0.7rem',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#dce5f8',
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {scanResult ? (
            <p
              role="status"
              style={{
                margin: '0.7rem 0 0',
                color: '#83e9c1',
                fontSize: '0.66rem',
              }}
            >
              Last scan completed at{' '}
              {new Date(scanResult.completedAt).toLocaleTimeString()}.
            </p>
          ) : null}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Bell}
            title="Stealth Notifications"
            description="Prevent notification content from revealing identity or conversation context."
          />

          {notificationOptions.map(([id, title, description]) => (
            <ToggleRow
              key={id}
              id={id}
              title={title}
              description={description}
              icon={Bell}
              checked={state.notifications[id]}
              onChange={() => toggleSetting('notifications', id)}
            />
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={RefreshCw}
            title="Background Stealth Systems"
            description="Internal services that continuously protect identity and relationship privacy."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {backgroundSystems.map(([title, status, Icon]) => (
              <div
                key={title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  borderRadius: '0.85rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Icon size={15} color="#a9b8d6" />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#dfe7fa',
                      fontSize: '0.67rem',
                    }}
                  >
                    {title}
                  </strong>

                  <span style={{ display: 'block', marginTop: '0.25rem' }}>
                    <SystemStatus status={status} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Future Aarush AI Identity (Coming Soon)"
            description="Future AI-powered identity protection modules are prepared for the stealth architecture."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {futureIdentityFeatures.map(([title, description, Icon]) => (
              <div
                key={title}
                style={{
                  minHeight: '5rem',
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  opacity: 0.68,
                }}
              >
                <Icon size={16} color="#b8aaff" />

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.5rem',
                    color: '#e1e8f9',
                    fontSize: '0.74rem',
                  }}
                >
                  {title}
                </strong>

                <p
                  style={{
                    margin: '0.25rem 0 0',
                    color: '#8794b0',
                    fontSize: '0.65rem',
                    lineHeight: 1.4,
                  }}
                >
                  {description}
                </p>

                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.35rem',
                    padding: '0.22rem 0.4rem',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.07)',
                    color: '#9aa7c1',
                    fontSize: '0.55rem',
                    fontWeight: 800,
                  }}
                >
                  Coming soon
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        {message ? (
          <div
            role="status"
            style={{
              position: 'fixed',
              right: '1rem',
              bottom: '5.7rem',
              left: '1rem',
              zIndex: 1100,
              maxWidth: '520px',
              margin: '0 auto',
              padding: '0.75rem 0.9rem',
              borderRadius: '0.9rem',
              background: 'rgba(22,28,45,0.96)',
              border: '1px solid rgba(124,92,255,0.25)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
              color: '#dce6fa',
              fontSize: '0.74rem',
              lineHeight: 1.45,
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        ) : null}
      </main>

      <BottomNav />

      <style>{`
        button {
          -webkit-tap-highlight-color: transparent;
          transition: transform 180ms ease, filter 180ms ease, background 180ms ease;
        }

        button:not(:disabled):hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        button:not(:disabled):active {
          transform: scale(0.98);
        }

        select option {
          background: #151b2b;
          color: #edf3ff;
        }
      `}</style>
    </div>
  );
}