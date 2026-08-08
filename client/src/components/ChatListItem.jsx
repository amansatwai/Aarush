import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  Check,
  CheckCheck,
  Clock3,
  Copy,
  EyeOff,
  FileText,
  Flag,
  FolderLock,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Pin,
  Shield,
  Trash2,
  UserRound,
  Video,
  VolumeX,
  X,
} from 'lucide-react';

const LONG_PRESS_DURATION = 650;
const SWIPE_THRESHOLD = 72;

function formatTimestamp(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
  });
}

function getPreview(lastMessage, lastMessageType, draft, isTyping) {
  if (isTyping) {
    return {
      label: 'Typing…',
      icon: MessageCircle,
      color: '#4dd7ff',
      emphasis: true,
    };
  }

  if (draft) {
    return {
      label: `Draft: ${draft}`,
      icon: FileText,
      color: '#ffcf8a',
      emphasis: true,
    };
  }

  const type = String(lastMessageType || 'text').toLowerCase();

  if (type === 'image' || type === 'photo') {
    return {
      label: lastMessage || 'Sent a photo',
      icon: ImageIcon,
      color: '#aab7cf',
      emphasis: false,
    };
  }

  if (type === 'video') {
    return {
      label: lastMessage || 'Sent a video',
      icon: Video,
      color: '#aab7cf',
      emphasis: false,
    };
  }

  if (type === 'voice' || type === 'audio') {
    return {
      label: lastMessage || 'Voice message',
      icon: Mic,
      color: '#aab7cf',
      emphasis: false,
    };
  }

  if (
    type === 'file' ||
    type === 'document' ||
    type === 'contact'
  ) {
    return {
      label: lastMessage || 'Shared a document',
      icon: FileText,
      color: '#aab7cf',
      emphasis: false,
    };
  }

  if (type === 'link') {
    return {
      label: lastMessage || 'Shared a link',
      icon: Copy,
      color: '#a9edff',
      emphasis: false,
    };
  }

  if (type === 'sticker' || type === 'gif' || type === 'emoji') {
    return {
      label: lastMessage || 'Sent a reaction',
      icon: MessageCircle,
      color: '#d6c9ff',
      emphasis: false,
    };
  }

  return {
    label: lastMessage || 'No messages yet',
    icon: MessageCircle,
    color: '#aab7cf',
    emphasis: false,
  };
}

function StatusPreview({ status }) {
  if (!status) {
    return null;
  }

  if (status === 'sending') {
    return <Clock3 size={12} aria-label="Sending" />;
  }

  if (status === 'sent') {
    return <Check size={12} aria-label="Sent" />;
  }

  if (status === 'delivered') {
    return <CheckCheck size={12} aria-label="Delivered" />;
  }

  if (status === 'read') {
    return (
      <CheckCheck
        size={12}
        color="#4dd7ff"
        aria-label="Read"
      />
    );
  }

  if (status === 'failed') {
    return (
      <Shield
        size={12}
        color="#ff9eb8"
        aria-label="Failed"
      />
    );
  }

  return null;
}

function ChatListItem({
  chat,
  chatId: directChatId,
  displayName: directDisplayName,
  username: directUsername,
  avatar: directAvatar,
  avatarUrl: directAvatarUrl,
  lastMessage: directLastMessage,
  lastMessageType: directLastMessageType,
  timestamp: directTimestamp,
  lastMessageAt: directLastMessageAt,
  unreadCount: directUnreadCount,
  isOnline: directIsOnline,
  online: directOnline,
  isVerified: directIsVerified,
  verified: directVerified,
  isPinned: directIsPinned,
  pinned: directPinned,
  isMuted: directIsMuted,
  muted: directMuted,
  isArchived: directIsArchived,
  archived: directArchived,
  isLocked: directIsLocked,
  locked: directLocked,
  isInVault: directIsInVault,
  vaulted: directVaulted,
  isTyping: directIsTyping,
  typing: directTyping,
  hasStory: directHasStory,
  aiState: directAiState,
  draft: directDraft,
  messageStatus: directMessageStatus,
  status: directStatus,
  invisibleMode = false,
  ghostMode = false,
  stealthMode = false,
  onOpen,
  onLongPress,
  onAction,
  onSwipeAction,
  className = '',
  style = {},
}) {
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const pointerStartRef = useRef(null);
  const pointerActiveRef = useRef(false);

  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeRevealed, setSwipeRevealed] = useState(false);

  const normalizedChat = chat || {};

  const chatId = directChatId || normalizedChat.id;
  const displayName =
    directDisplayName ||
    normalizedChat.displayName ||
    normalizedChat.name ||
    normalizedChat.username ||
    'Unknown user';
  const username = String(
    directUsername ||
      normalizedChat.username ||
      'unknown.user'
  ).replace(/^@/, '');

  const avatar =
    directAvatar ||
    directAvatarUrl ||
    normalizedChat.avatar ||
    normalizedChat.avatarUrl ||
    `https://i.pravatar.cc/160?u=${username}`;

  const lastMessage =
    directLastMessage ??
    normalizedChat.lastMessage ??
    '';

  const lastMessageType =
    directLastMessageType ||
    normalizedChat.lastMessageType ||
    normalizedChat.type ||
    'text';

  const timestamp =
    directTimestamp ||
    directLastMessageAt ||
    normalizedChat.timestamp ||
    normalizedChat.lastMessageAt;

  const unreadCount = Number(
    directUnreadCount ?? normalizedChat.unreadCount ?? 0
  );

  const isOnline =
    directIsOnline ??
    directOnline ??
    normalizedChat.isOnline ??
    normalizedChat.online ??
    false;

  const isVerified =
    directIsVerified ??
    directVerified ??
    normalizedChat.isVerified ??
    normalizedChat.verified ??
    false;

  const isPinned =
    directIsPinned ??
    directPinned ??
    normalizedChat.isPinned ??
    normalizedChat.pinned ??
    false;

  const isMuted =
    directIsMuted ??
    directMuted ??
    normalizedChat.isMuted ??
    normalizedChat.muted ??
    false;

  const isArchived =
    directIsArchived ??
    directArchived ??
    normalizedChat.isArchived ??
    normalizedChat.archived ??
    false;

  const isLocked =
    directIsLocked ??
    directLocked ??
    normalizedChat.isLocked ??
    normalizedChat.locked ??
    false;

  const isInVault =
    directIsInVault ??
    directVaulted ??
    normalizedChat.isInVault ??
    normalizedChat.vaulted ??
    false;

  const isTyping =
    directIsTyping ??
    directTyping ??
    normalizedChat.isTyping ??
    normalizedChat.typing ??
    false;

  const hasStory =
    directHasStory ??
    normalizedChat.hasStory ??
    false;

  const aiState =
    directAiState ||
    normalizedChat.aiState ||
    '';

  const draft =
    directDraft ||
    normalizedChat.draft ||
    '';

  const messageStatus =
    directMessageStatus ||
    directStatus ||
    normalizedChat.messageStatus ||
    normalizedChat.status ||
    '';

  const preview = useMemo(
    () =>
      getPreview(
        lastMessage,
        lastMessageType,
        draft,
        isTyping
      ),
    [
      draft,
      isTyping,
      lastMessage,
      lastMessageType,
    ]
  );

  const PreviewIcon = preview.icon;

  const effectiveOnline = invisibleMode ? false : isOnline;

  const presenceText = invisibleMode
    ? 'Invisible mode'
    : effectiveOnline
      ? 'Active now'
      : normalizedChat.lastSeen
        ? `Last seen ${normalizedChat.lastSeen}`
        : 'Last seen recently';

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const openConversation = () => {
    if (typeof onOpen === 'function') {
      onOpen(chatId);
      return;
    }

    if (chatId) {
      navigate(`/chats/${chatId}`);
    }
  };

  const openActionSheet = () => {
    setActionSheetOpen(true);

    if (typeof onLongPress === 'function') {
      onLongPress({
        chatId,
        displayName,
        username,
      });
    }
  };

  const handlePointerDown = (event) => {
    pointerActiveRef.current = true;
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    clearLongPress();

    longPressTimerRef.current = window.setTimeout(() => {
      if (pointerActiveRef.current) {
        openActionSheet();
      }
    }, LONG_PRESS_DURATION);
  };

  const handlePointerMove = (event) => {
    if (!pointerStartRef.current) {
      return;
    }

    const deltaX = event.clientX - pointerStartRef.current.x;

    if (Math.abs(deltaX) < 8) {
      return;
    }

    clearLongPress();

    const boundedOffset = Math.max(
      -220,
      Math.min(220, deltaX)
    );

    setSwipeOffset(boundedOffset);
  };

  const handlePointerUp = (event) => {
    clearLongPress();
    pointerActiveRef.current = false;

    if (!pointerStartRef.current) {
      return;
    }

    const deltaX = event.clientX - pointerStartRef.current.x;
    pointerStartRef.current = null;

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      const action = deltaX < 0 ? 'archive' : 'pin';

      setSwipeRevealed(true);
      setSwipeOffset(0);

      if (typeof onSwipeAction === 'function') {
        onSwipeAction(action, chatId);
      } else if (typeof onAction === 'function') {
        onAction(action, chatId);
      }

      return;
    }

    setSwipeOffset(0);
  };

  const handlePointerCancel = () => {
    clearLongPress();
    pointerActiveRef.current = false;
    pointerStartRef.current = null;
    setSwipeOffset(0);
  };

  const handleAction = (action) => {
    setActionSheetOpen(false);
    setSwipeRevealed(false);

    if (typeof onAction === 'function') {
      onAction(action, chatId);
    }
  };

  useEffect(() => {
    return () => {
      clearLongPress();
    };
  }, []);

  const actionItems = [
    {
      key: isPinned ? 'unpin' : 'pin',
      label: isPinned ? 'Unpin Chat' : 'Pin Chat',
      icon: Pin,
    },
    {
      key: isArchived ? 'unarchive' : 'archive',
      label: isArchived ? 'Unarchive' : 'Archive',
      icon: Archive,
    },
    {
      key: isMuted ? 'unmute' : 'mute',
      label: isMuted ? 'Unmute' : 'Mute',
      icon: VolumeX,
    },
    {
      key: 'hide',
      label: 'Hide Chat',
      icon: EyeOff,
    },
    {
      key: 'lock',
      label: 'Lock Chat',
      icon: Lock,
    },
    {
      key: 'vault',
      label: 'Move to Vault',
      icon: FolderLock,
    },
    {
      key: unreadCount > 0 ? 'read' : 'unread',
      label: unreadCount > 0 ? 'Mark Read' : 'Mark Unread',
      icon: CheckCheck,
    },
    {
      key: 'profile',
      label: 'View Profile',
      icon: UserRound,
    },
    {
      key: 'delete',
      label: 'Delete Chat',
      icon: Trash2,
      danger: true,
    },
  ];

  return (
    <>
      <article
        ref={rowRef}
        className={className}
        style={{
          ...styles.rowShell,
          ...(swipeRevealed ? styles.rowShellRevealed : {}),
          ...style,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openConversation();
          }

          if (event.key === 'ContextMenu') {
            event.preventDefault();
            openActionSheet();
          }
        }}
        tabIndex={0}
        role="article"
        aria-label={`${displayName}, @${username}`}
      >
        <div
          style={{
            ...styles.swipeActions,
            ...(swipeRevealed
              ? styles.swipeActionsVisible
              : {}),
          }}
          aria-hidden={!swipeRevealed}
        >
          <button
            type="button"
            onClick={() => handleAction('pin')}
            style={styles.swipeActionButton}
            aria-label="Pin chat"
          >
            <Pin size={15} />
          </button>

          <button
            type="button"
            onClick={() => handleAction('archive')}
            style={styles.swipeActionButton}
            aria-label="Archive chat"
          >
            <Archive size={15} />
          </button>

          <button
            type="button"
            onClick={() => handleAction('mute')}
            style={styles.swipeActionButton}
            aria-label="Mute chat"
          >
            <VolumeX size={15} />
          </button>

          <button
            type="button"
            onClick={() => handleAction('vault')}
            style={styles.swipeActionButton}
            aria-label="Move chat to vault"
          >
            <FolderLock size={15} />
          </button>

          <button
            type="button"
            onClick={() => handleAction('delete')}
            style={styles.swipeActionDanger}
            aria-label="Delete chat"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <button
          type="button"
          onClick={openConversation}
          style={{
            ...styles.mainRow,
            transform: `translateX(${swipeOffset}px)`,
          }}
          aria-label={`Open chat with ${displayName}`}
        >
          <span
            style={{
              ...styles.avatarFrame,
              ...(hasStory ? styles.storyRing : {}),
            }}
          >
            <img
              src={avatar}
              alt={`${displayName} profile`}
              loading="lazy"
              decoding="async"
              style={styles.avatar}
            />

            {effectiveOnline ? (
              <span
                style={styles.onlineIndicator}
                aria-label="Online"
              />
            ) : null}

            {isLocked ? (
              <span
                style={styles.lockIndicator}
                aria-label="Locked chat"
              >
                <Lock size={9} />
              </span>
            ) : null}
          </span>

          <span style={styles.centerContent}>
            <span style={styles.identityLine}>
              <span style={styles.displayName}>{displayName}</span>

              {isVerified ? (
                <span
                  style={styles.verifiedBadge}
                  aria-label="Verified account"
                >
                  <Check size={10} />
                </span>
              ) : null}

              {aiState ? (
                <span
                  style={styles.aiBadge}
                  aria-label={`AI status: ${aiState}`}
                >
                  <SparkleIcon />
                </span>
              ) : null}
            </span>

            <span style={styles.usernameLine}>
              @{username}
            </span>

            <span
              style={{
                ...styles.previewLine,
                color: preview.color,
                fontWeight: preview.emphasis ? 800 : 600,
              }}
            >
              <PreviewIcon size={12} />
              <span>{preview.label}</span>
            </span>

            <span style={styles.presenceLine}>
              {presenceText}
            </span>
          </span>

          <span style={styles.metaColumn}>
            <span style={styles.time}>
              {formatTimestamp(timestamp)}
            </span>

            {unreadCount > 0 ? (
              <span
                style={styles.unreadBadge}
                aria-label={`${unreadCount} unread messages`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}

            <span style={styles.indicatorLine}>
              <StatusPreview status={messageStatus} />

              {isPinned ? (
                <Pin size={12} aria-label="Pinned" />
              ) : null}

              {isMuted ? (
                <VolumeX size={12} aria-label="Muted" />
              ) : null}

              {isArchived ? (
                <Archive size={12} aria-label="Archived" />
              ) : null}

              {isInVault ? (
                <FolderLock size={12} aria-label="In vault" />
              ) : null}
            </span>
          </span>

          <span
            style={styles.moreButton}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openActionSheet();
            }}
            role="button"
            tabIndex={0}
            aria-label="Open chat actions"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                openActionSheet();
              }
            }}
          >
            <MoreHorizontal size={15} />
          </span>
        </button>
      </article>

      {actionSheetOpen ? (
        <div
          style={styles.overlay}
          onClick={() => setActionSheetOpen(false)}
          role="presentation"
        >
          <div
            style={styles.actionSheet}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Actions for ${displayName}`}
          >
            <div style={styles.sheetHandle} />

            <div style={styles.sheetHeader}>
              <div style={styles.sheetIdentity}>
                <img
                  src={avatar}
                  alt=""
                  style={styles.sheetAvatar}
                />

                <span>
                  <strong>{displayName}</strong>
                  <small>@{username}</small>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActionSheetOpen(false)}
                style={styles.closeButton}
                aria-label="Close chat actions"
              >
                <X size={16} />
              </button>
            </div>

            <div style={styles.actionList}>
              {actionItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleAction(item.key)}
                    style={{
                      ...styles.actionItem,
                      ...(item.danger
                        ? styles.actionItemDanger
                        : {}),
                    }}
                  >
                    <span style={styles.actionIcon}>
                      <Icon size={15} />
                    </span>

                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .aarush-chat-list-item {
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease;
        }

        .aarush-chat-list-item:hover {
          border-color: rgba(124, 92, 255, 0.28);
          background: rgba(255, 255, 255, 0.065);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
        }

        .aarush-chat-list-item:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 3px;
        }

        .aarush-chat-list-item button:focus-visible,
        .aarush-chat-list-item [role="button"]:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-chat-list-item,
          .aarush-chat-list-item button {
            transition: none !important;
          }
        }

        @media (prefers-contrast: more) {
          .aarush-chat-list-item {
            border-color: rgba(255,255,255,0.3) !important;
          }

          .aarush-chat-list-item small,
          .aarush-chat-list-item span {
            color: #ffffff !important;
          }
        }
      `}</style>
    </>
  );
}

function SparkleIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.65rem',
      }}
    >
      ✦
    </span>
  );
}

const styles = {
  rowShell: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,0.045)',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'pan-y',
  },

  rowShellRevealed: {
    borderColor: 'rgba(124,92,255,0.3)',
  },

  mainRow: {
    position: 'relative',
    zIndex: 2,
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto auto',
    alignItems: 'center',
    gap: '0.65rem',
    width: '100%',
    minHeight: '4.65rem',
    padding: '0.62rem 0.65rem',
    border: 0,
    color: '#ffffff',
    background: 'rgba(11,15,25,0.82)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'transform 180ms ease',
  },

  avatarFrame: {
    position: 'relative',
    width: '3rem',
    height: '3rem',
    display: 'block',
    flexShrink: 0,
    padding: '2px',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.42), rgba(77,215,255,0.24))',
  },

  storyRing: {
    padding: '3px',
    background:
      'linear-gradient(135deg, #ff4fd8, #ffcf70, #7c5cff, #4dd7ff)',
  },

  avatar: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    border: '2px solid #101521',
    borderRadius: '999px',
    background: '#1b2233',
  },

  onlineIndicator: {
    position: 'absolute',
    right: '-0.04rem',
    bottom: '-0.02rem',
    width: '0.72rem',
    height: '0.72rem',
    border: '2px solid #101521',
    borderRadius: '999px',
    background: '#3df2a8',
    boxShadow: '0 0 10px rgba(61,242,168,0.55)',
  },

  lockIndicator: {
    position: 'absolute',
    top: '-0.18rem',
    right: '-0.18rem',
    width: '1.05rem',
    height: '1.05rem',
    display: 'grid',
    placeItems: 'center',
    border: '2px solid #101521',
    borderRadius: '999px',
    color: '#ffffff',
    background: '#7c5cff',
  },

  centerContent: {
    minWidth: 0,
    display: 'grid',
    gap: '0.12rem',
  },

  identityLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.28rem',
    minWidth: 0,
  },

  displayName: {
    overflow: 'hidden',
    color: '#f5f8ff',
    fontSize: '0.86rem',
    fontWeight: 850,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  verifiedBadge: {
    width: '0.95rem',
    height: '0.95rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
  },

  aiBadge: {
    width: '0.95rem',
    height: '0.95rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #ff4fd8, #7c5cff)',
    boxShadow: '0 0 10px rgba(255,79,216,0.25)',
  },

  usernameLine: {
    overflow: 'hidden',
    color: '#8f9db8',
    fontSize: '0.67rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  previewLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.28rem',
    minWidth: 0,
    overflow: 'hidden',
    fontSize: '0.73rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  presenceLine: {
    overflow: 'hidden',
    color: '#7f8da8',
    fontSize: '0.62rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  metaColumn: {
    display: 'grid',
    justifyItems: 'end',
    alignContent: 'center',
    gap: '0.32rem',
    minWidth: '2.65rem',
  },

  time: {
    color: '#8c9ab5',
    fontSize: '0.65rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  unreadBadge: {
    minWidth: '1.25rem',
    height: '1.25rem',
    display: 'grid',
    placeItems: 'center',
    padding: '0 0.26rem',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.61rem',
    fontWeight: 900,
  },

  indicatorLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.22rem',
    color: '#8795b0',
  },

  moreButton: {
    width: '1.55rem',
    height: '1.55rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#8492ae',
    background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer',
  },

  swipeActions: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0 0.55rem',
    opacity: 0,
    transform: 'translateX(0.5rem)',
    transition: 'opacity 180ms ease, transform 180ms ease',
    pointerEvents: 'none',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(77,215,255,0.1))',
  },

  swipeActionsVisible: {
    opacity: 1,
    transform: 'translateX(0)',
    pointerEvents: 'auto',
  },

  swipeActionButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: '#e7efff',
    background: 'rgba(255,255,255,0.09)',
    cursor: 'pointer',
  },

  swipeActionDanger: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,79,122,0.22)',
    borderRadius: '999px',
    color: '#ffb0c4',
    background: 'rgba(255,79,122,0.12)',
    cursor: 'pointer',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'grid',
    alignItems: 'end',
    justifyItems: 'center',
    padding: '1rem',
    background: 'rgba(0,0,0,0.66)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  actionSheet: {
    width: 'min(100%, 460px)',
    maxHeight: '84dvh',
    overflow: 'auto',
    padding: '0.85rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1.35rem',
    background: 'linear-gradient(180deg, #171d2d, #0e1320)',
    boxShadow: '0 28px 80px rgba(0,0,0,0.52)',
  },

  sheetHandle: {
    width: '2.4rem',
    height: '0.22rem',
    margin: '0 auto 0.8rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.2)',
  },

  sheetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    marginBottom: '0.75rem',
  },

  sheetIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    minWidth: 0,
    color: '#ffffff',
  },

  sheetAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    objectFit: 'cover',
    border: '2px solid rgba(124,92,255,0.35)',
    borderRadius: '999px',
  },

  sheetIdentitySpan: {
    display: 'grid',
    gap: '0.15rem',
    minWidth: 0,
  },

  sheetIdentitySmall: {
    color: '#94a1bb',
    fontSize: '0.68rem',
  },

  closeButton: {
    width: '2.1rem',
    height: '2.1rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  actionList: {
    display: 'grid',
    gap: '0.4rem',
  },

  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    width: '100%',
    minHeight: '2.65rem',
    padding: '0.58rem 0.62rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.78rem',
    color: '#e8eefb',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '0.74rem',
    fontWeight: 750,
    textAlign: 'left',
    cursor: 'pointer',
  },

  actionItemDanger: {
    color: '#ffb0c4',
    borderColor: 'rgba(255,79,122,0.16)',
    background: 'rgba(255,79,122,0.07)',
  },

  actionIcon: {
    width: '1.85rem',
    height: '1.85rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#d2caff',
    background: 'rgba(124,92,255,0.16)',
  },
};

export default memo(ChatListItem);