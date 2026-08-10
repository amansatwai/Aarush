import {
  useMemo,
  useState,
} from 'react';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Clock3,
  Ellipsis,
  Search,
  UserRound,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import {
  getActiveSessionCount,
  isUserOnline,
} from '../hooks/usePresence';

function getProfile(participant) {
  return participant?.profiles || participant?.profile || {};
}

function getOtherParticipant(conversation, currentUserId) {
  const participants =
    conversation?.conversation_participants || [];

  return (
    participants.find(
      (participant) => participant.user_id !== currentUserId
    ) ||
    participants[0] ||
    null
  );
}

function getName(conversation, currentUserId) {
  const participant = getOtherParticipant(
    conversation,
    currentUserId
  );

  const profile = getProfile(participant);

  return profile.full_name || profile.username || 'Aarush User';
}

function getUsername(conversation, currentUserId) {
  const participant = getOtherParticipant(
    conversation,
    currentUserId
  );

  const profile = getProfile(participant);

  if (!profile.username) {
    return '';
  }

  return profile.username.startsWith('@')
    ? profile.username
    : `@${profile.username}`;
}

function getAvatar(conversation, currentUserId) {
  const participant = getOtherParticipant(
    conversation,
    currentUserId
  );

  return getProfile(participant).avatar_url || '';
}

export function formatLastSeen(value) {
  if (!value) {
    return 'Last seen unavailable';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Last seen unavailable';
  }

  const now = new Date();
  const difference = Math.max(
    0,
    now.getTime() - date.getTime()
  );

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) {
    return 'Last seen just now';
  }

  if (minutes < 60) {
    return `Last seen ${minutes} minute${
      minutes === 1 ? '' : 's'
    } ago`;
  }

  if (hours < 24) {
    return `Last seen ${hours} hour${
      hours === 1 ? '' : 's'
    } ago`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Last seen yesterday';
  }

  return `Last seen ${date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() === now.getFullYear()
        ? undefined
        : 'numeric',
  })}`;
}

function StatusLine({
  online,
  typing,
  lastSeen,
  sessionCount,
}) {
  if (typing) {
    return (
      <span style={styles.typingStatus}>
        <span style={styles.typingDot} />
        Typing…
      </span>
    );
  }

  if (online) {
    return (
      <span style={styles.onlineStatus}>
        <Wifi size={12} />
        Active now
        {sessionCount > 1
          ? ` · ${sessionCount} devices`
          : ''}
      </span>
    );
  }

  return (
    <span style={styles.offlineStatus}>
      <Clock3 size={12} />
      {formatLastSeen(lastSeen)}
    </span>
  );
}

export function ReadReceipt({
  status = 'sent',
  label = true,
}) {
  const normalizedStatus =
    status === 'seen' ||
    status === 'read'
      ? 'seen'
      : status === 'delivered'
        ? 'delivered'
        : 'sent';

  const icon =
    normalizedStatus === 'seen' ? (
      <CheckCheck
        size={14}
        color="#4dd7ff"
      />
    ) : normalizedStatus === 'delivered' ? (
      <CheckCheck size={14} />
    ) : (
      <Check size={14} />
    );

  const text =
    normalizedStatus === 'seen'
      ? 'Seen'
      : normalizedStatus === 'delivered'
        ? 'Delivered'
        : 'Sent';

  return (
    <span
      title={text}
      aria-label={text}
      style={styles.receipt}
    >
      {icon}
      {label ? <small>{text}</small> : null}
    </span>
  );
}

export default function ChatPresenceBar({
  conversation,
  currentUserId,
  presenceState = {},
  typingUsers = {},
  lastSeen,
  readStatus,
  onBack,
  onSearch,
  onMore,
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  const otherParticipantId = useMemo(() => {
    return getOtherParticipant(
      conversation,
      currentUserId
    )?.user_id;
  }, [conversation, currentUserId]);

  const name = useMemo(
    () => getName(conversation, currentUserId),
    [conversation, currentUserId]
  );

  const username = useMemo(
    () => getUsername(conversation, currentUserId),
    [conversation, currentUserId]
  );

  const avatar = useMemo(
    () => getAvatar(conversation, currentUserId),
    [conversation, currentUserId]
  );

  const online = useMemo(
    () =>
      isUserOnline(
        presenceState,
        otherParticipantId
      ),
    [otherParticipantId, presenceState]
  );

  const sessionCount = useMemo(
    () =>
      getActiveSessionCount(
        presenceState,
        otherParticipantId
      ),
    [otherParticipantId, presenceState]
  );

  const isTyping = useMemo(
    () =>
      Boolean(
        otherParticipantId &&
          typingUsers?.[otherParticipantId]
      ),
    [otherParticipantId, typingUsers]
  );

  return (
    <header style={styles.bar}>
      <button
        type="button"
        onClick={onBack}
        style={styles.iconButton}
        aria-label="Back to chats"
      >
        <ArrowLeft size={18} />
      </button>

      <div style={styles.identity}>
        {avatar ? (
          <img
            src={avatar}
            alt=""
            style={styles.avatar}
          />
        ) : (
          <span style={styles.placeholderAvatar}>
            <UserRound size={19} />
          </span>
        )}

        <div style={styles.copy}>
          <strong>{name}</strong>

          <span style={styles.username}>
            {username}
          </span>

          <StatusLine
            online={online}
            typing={isTyping}
            lastSeen={lastSeen}
            sessionCount={sessionCount}
          />
        </div>
      </div>

      <div style={styles.actions}>
        {readStatus ? (
          <ReadReceipt
            status={readStatus}
            label={false}
          />
        ) : null}

        <button
          type="button"
          onClick={onSearch}
          style={styles.iconButton}
          aria-label="Search conversation"
        >
          <Search size={17} />
        </button>

        <button
          type="button"
          onClick={() => {
            setMoreOpen((value) => !value);
            onMore?.();
          }}
          style={styles.iconButton}
          aria-label="More conversation options"
          aria-expanded={moreOpen}
        >
          <Ellipsis size={18} />
        </button>
      </div>

      {moreOpen ? (
        <div style={styles.moreMenu}>
          <button
            type="button"
            onClick={() => setMoreOpen(false)}
            style={styles.menuItem}
          >
            Conversation info
          </button>

          <button
            type="button"
            onClick={() => setMoreOpen(false)}
            style={styles.menuItem}
          >
            Mute notifications
          </button>

          <button
            type="button"
            onClick={() => setMoreOpen(false)}
            style={styles.menuItem}
          >
            Close
            <X size={13} />
          </button>
        </div>
      ) : null}

      <style>{`
        @keyframes aarush-presence-typing {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.42;
          }

          40% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </header>
  );
}

const styles = {
  bar: {
    position: 'relative',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.7rem 0.8rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    color: '#f4f7ff',
    background:
      'linear-gradient(180deg, rgba(7,10,16,0.97), rgba(7,10,16,0.88))',
    boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  },

  iconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#edf3ff',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },

  identity: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
  },

  avatar: {
    width: '2.65rem',
    height: '2.65rem',
    objectFit: 'cover',
    flexShrink: 0,
    border: '2px solid rgba(124,92,255,0.6)',
    borderRadius: '999px',
  },

  placeholderAvatar: {
    width: '2.65rem',
    height: '2.65rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '2px solid rgba(124,92,255,0.5)',
    borderRadius: '999px',
    color: '#dce5f8',
    background:
      'linear-gradient(135deg, #1c2740, #342258)',
  },

  copy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.13rem',
  },

  copyStrong: {
    overflow: 'hidden',
    fontSize: '0.78rem',
    fontWeight: 850,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  username: {
    overflow: 'hidden',
    color: '#8f9cb8',
    fontSize: '0.6rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  onlineStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.22rem',
    color: '#82e9c1',
    fontSize: '0.58rem',
    fontWeight: 750,
  },

  typingStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#9deeff',
    fontSize: '0.58rem',
    fontWeight: 800,
  },

  offlineStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.22rem',
    color: '#8290ad',
    fontSize: '0.58rem',
  },

  typingDot: {
    width: '0.38rem',
    height: '0.38rem',
    borderRadius: '999px',
    background: '#4dd7ff',
    animation:
      'aarush-presence-typing 1.1s ease-in-out infinite',
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },

  receipt: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
    color: '#aab6cf',
    fontSize: '0.58rem',
    fontWeight: 750,
  },

  moreMenu: {
    position: 'absolute',
    top: '4.1rem',
    right: '0.8rem',
    minWidth: '10rem',
    padding: '0.35rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.8rem',
    background: 'rgba(19,25,40,0.98)',
    boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
  },

  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.35rem',
    padding: '0.55rem',
    border: 0,
    borderRadius: '0.5rem',
    color: '#dce5f8',
    background: 'transparent',
    fontSize: '0.63rem',
    textAlign: 'left',
    cursor: 'pointer',
  },
};