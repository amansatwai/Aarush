import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  AudioLines,
  Bot,
  Check,
  CheckCheck,
  Clock3,
  Copy,
  Edit3,
  EyeOff,
  FileText,
  Flag,
  Forward,
  Image as ImageIcon,
  Info,
  Languages,
  Link2,
  Lock,
  MapPin,
  Mic,
  MoreHorizontal,
  Pause,
  Play,
  Pin,
  Reply,
  Save,
  Shield,
  ShieldAlert,
  Smile,
  Sparkles,
  Sticker,
  Trash2,
  UserRound,
  Video,
  Volume2,
  Wand2,
  X,
} from 'lucide-react';

const LONG_PRESS_DURATION = 650;
const SWIPE_REPLY_THRESHOLD = 72;

const ACTIONS = [
  ['Reply', Reply],
  ['Reply Privately', UserRound],
  ['Forward', Forward],
  ['Copy', Copy],
  ['Edit', Edit3],
  ['Delete For Me', Trash2],
  ['Delete For Everyone', Trash2],
  ['Pin Message', Pin],
  ['Save To Vault', Save],
  ['Translate', Languages],
  ['AI Rewrite', Wand2],
  ['AI Summarize', Sparkles],
  ['Report', Flag],
  ['Message Info', Info],
  ['React', Smile],
];

function formatTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatRelativeTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 10) {
    return 'Just now';
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  return `${Math.floor(hours / 24)}d`;
}

function getMessageData(props) {
  const source = props.message || {};

  return {
    id: props.id || source.id,
    type: String(props.type || source.type || 'text').toLowerCase(),
    text: props.text ?? source.text ?? '',
    timestamp:
      props.timestamp ||
      source.timestamp ||
      source.createdAt ||
      Date.now(),
    status: props.status || source.status || '',
    isOutgoing:
      props.isOutgoing ??
      props.isOwn ??
      source.isOutgoing ??
      source.senderId === 'me',
    isEdited:
      props.isEdited ??
      source.isEdited ??
      source.edited ??
      false,
    replyTo: props.replyTo || source.replyTo || null,
    reactions: props.reactions || source.reactions || [],
    media: props.media || source.media || source.attachment || null,
    voice: props.voice || source.voice || null,
    sender: props.sender || source.sender || null,
    isGroup:
      props.isGroup ??
      source.isGroup ??
      false,
    isPinned:
      props.isPinned ??
      source.isPinned ??
      source.pinned ??
      false,
    isDisappearing:
      props.isDisappearing ??
      source.isDisappearing ??
      false,
    expiresAt: props.expiresAt || source.expiresAt || null,
    aiState: props.aiState || source.aiState || '',
    encrypted:
      props.encrypted ??
      source.encrypted ??
      false,
    sensitive:
      props.sensitive ??
      source.sensitive ??
      false,
    deleted:
      props.deleted ??
      source.deleted ??
      false,
    system:
      props.system ??
      source.system ??
      false,
    scheduled:
      props.scheduled ??
      source.scheduled ??
      source.status === 'scheduled',
  };
}

function StatusIcon({ status }) {
  if (status === 'sending') {
    return <Clock3 size={13} aria-label="Sending" />;
  }

  if (status === 'sent') {
    return <Check size={13} aria-label="Sent" />;
  }

  if (status === 'delivered') {
    return <CheckCheck size={13} aria-label="Delivered" />;
  }

  if (status === 'read') {
    return (
      <CheckCheck
        size={13}
        color="#4dd7ff"
        aria-label="Read"
      />
    );
  }

  if (status === 'failed') {
    return (
      <ShieldAlert
        size={13}
        color="#ff9eb8"
        aria-label="Failed"
      />
    );
  }

  if (status === 'scheduled') {
    return (
      <Clock3
        size={13}
        color="#d7c6ff"
        aria-label="Scheduled"
      />
    );
  }

  if (status === 'expired') {
    return (
      <Clock3
        size={13}
        color="#ffcf8a"
        aria-label="Expired"
      />
    );
  }

  return null;
}

function getMediaLabel(type) {
  const labels = {
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    voice: 'Voice message',
    file: 'File',
    document: 'Document',
    contact: 'Contact',
    location: 'Location',
    gif: 'GIF',
    sticker: 'Sticker',
    link: 'Link',
  };

  return labels[type] || 'Attachment';
}

function getMediaIcon(type) {
  if (type === 'image') {
    return ImageIcon;
  }

  if (type === 'video') {
    return Video;
  }

  if (type === 'audio' || type === 'voice') {
    return AudioLines;
  }

  if (type === 'location') {
    return MapPin;
  }

  if (type === 'contact') {
    return UserRound;
  }

  if (type === 'link') {
    return Link2;
  }

  if (type === 'sticker') {
    return Sticker;
  }

  return FileText;
}

function VoiceContent({ voice, isOutgoing }) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const duration = voice?.duration || '0:18';

  return (
    <div style={styles.voiceContent}>
      <button
        type="button"
        onClick={() => setPlaying((value) => !value)}
        style={styles.voicePlayButton}
        aria-label={playing ? 'Pause voice message' : 'Play voice message'}
      >
        {playing ? <Pause size={15} /> : <Play size={15} />}
      </button>

      <div style={styles.voiceBody}>
        <div style={styles.waveform}>
          {Array.from({ length: 32 }).map((_, index) => (
            <span
              key={index}
              style={{
                ...styles.waveBar,
                height: `${7 + ((index * 11) % 19)}px`,
                opacity: playing ? 1 : 0.72,
              }}
            />
          ))}
        </div>

        <div style={styles.voiceMeta}>
          <span>{duration}</span>

          <button
            type="button"
            onClick={() =>
              setSpeed((value) => (value >= 2 ? 1 : value + 0.5))
            }
            style={styles.speedButton}
            aria-label="Change playback speed"
          >
            {speed}×
          </button>

          {voice?.transcription ? (
            <span style={styles.transcriptionBadge}>
              <Bot size={11} />
              AI transcription
            </span>
          ) : null}

          {voice?.noiseReduced ? (
            <span style={styles.voiceFeature}>
              <Volume2 size={11} />
              Noise reduced
            </span>
          ) : null}
        </div>
      </div>

      {isOutgoing ? (
        <StatusIcon status={voice?.status || 'read'} />
      ) : null}
    </div>
  );
}

function ReplyPreview({replyTo, onReplyClick}) {
  if (!replyTo) {
    return null;
  }

  const replyType = replyTo.type || 'text';
  const ReplyIcon = getMediaIcon(replyType);
  const sender =
    replyTo.senderName ||
    replyTo.sender?.displayName ||
    replyTo.sender?.username ||
    'Message';

  return (
    <button
      type="button"
      onClick={() => onReplyClick?.(replyTo.id)}
      style={styles.replyPreview}
      aria-label="Open replied message"
    >
      <span style={styles.replyAccent} />

      <span style={styles.replyBody}>
        <strong>{sender}</strong>

        <span>
          {replyType === 'text' ? (
            replyTo.text || 'Original message'
          ) : (
            <>
              <ReplyIcon size={12} />
              {getMediaLabel(replyType)}
            </>
          )}
        </span>
      </span>
    </button>
  );
}

function MediaContent({data, onOpenMedia}) {
  const { type, media, text } = data;

  if (type === 'image' && media?.url) {
    return (
      <button
        type="button"
        onClick={() => onOpenMedia?.(media)}
        style={styles.imageButton}
      >
        <img
          src={media.url}
          alt={media.alt || media.name || 'Shared image'}
          loading="lazy"
          decoding="async"
          style={styles.messageImage}
        />

        {text ? (
          <span style={styles.mediaCaption}>{text}</span>
        ) : null}
      </button>
    );
  }

  if (type === 'video' && media?.url) {
    return (
      <button
        type="button"
        onClick={() => onOpenMedia?.(media)}
        style={styles.videoButton}
      >
        <video
          src={media.url}
          muted
          playsInline
          preload="metadata"
          style={styles.messageVideo}
        />

        <span style={styles.videoOverlay}>
          <Play size={22} />
        </span>
      </button>
    );
  }

  const MediaIcon = getMediaIcon(type);
  const label = text || media?.name || getMediaLabel(type);

  if (type === 'link') {
    return (
      <div style={styles.linkPreview}>
        <span style={styles.linkIcon}>
          <Link2 size={18} />
        </span>

        <span style={styles.linkBody}>
          <strong>{media?.title || label}</strong>
          <small>{media?.description || 'Shared link preview'}</small>
        </span>
      </div>
    );
  }

  if (type === 'emoji') {
    return <span style={styles.emojiMessage}>{text || '😊'}</span>;
  }

  if (type === 'sticker' || type === 'gif') {
    return (
      <button
        type="button"
        onClick={() => onOpenMedia?.(media)}
        style={styles.stickerButton}
      >
        {media?.url ? (
          <img
            src={media.url}
            alt={label}
            loading="lazy"
            style={styles.stickerImage}
          />
        ) : (
          <>
            <MediaIcon size={22} />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpenMedia?.(media)}
      style={styles.fileContent}
    >
      <span style={styles.fileIcon}>
        <MediaIcon size={19} />
      </span>

      <span style={styles.fileText}>
        <strong>{label}</strong>
        <small>
          {media?.size || getMediaLabel(type)}
        </small>
      </span>
    </button>
  );
}

function ReactionList({reactions, onReact}) {
  if (!reactions || reactions.length === 0) {
    return null;
  }

  const normalized = Array.isArray(reactions)
    ? reactions
    : Object.entries(reactions).map(([emoji, value]) => ({
        emoji,
        count: typeof value === 'number' ? value : 1,
      }));

  return (
    <div style={styles.reactions}>
      {normalized.map((reaction, index) => {
        const emoji = reaction.emoji || reaction.reaction || '❤️';
        const count = reaction.count || reaction.total || 1;

        return (
          <button
            type="button"
            key={`${emoji}-${index}`}
            onClick={() => onReact?.(emoji)}
            style={styles.reaction}
            aria-label={`${count} reaction ${emoji}`}
          >
            <span>{emoji}</span>
            {count > 1 ? <small>{count}</small> : null}
          </button>
        );
      })}
    </div>
  );
}

function MessageBubble({
  id,
  message,
  type,
  text,
  isOutgoing,
  isOwn,
  timestamp,
  status,
  isEdited,
  replyTo,
  reactions,
  media,
  voice,
  sender,
  isGroup,
  isPinned,
  isDisappearing,
  expiresAt,
  aiState,
  encrypted,
  sensitive,
  deleted,
  system,
  scheduled,
  onReply,
  onReact,
  onLongPress,
  onOpenMedia,
  onActions,
  onPreview,
  onReplyClick,
  onAction,
  onPin,
  className = '',
  style = {},
}) {
  const bubbleRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const pointerStartRef = useRef(null);
  const pointerActiveRef = useRef(false);

  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [remaining, setRemaining] = useState(null);
  const [localReactions, setLocalReactions] = useState(
    reactions || message?.reactions || []
  );

  const data = useMemo(
    () => ({
      id: id || message?.id,
      type: String(type || message?.type || 'text').toLowerCase(),
      text: text ?? message?.text ?? '',
      isOutgoing:
        isOutgoing ??
        isOwn ??
        message?.isOutgoing ??
        message?.senderId === 'me',
      timestamp:
        timestamp ||
        message?.timestamp ||
        message?.createdAt ||
        Date.now(),
      status: status || message?.status || '',
      isEdited: isEdited ?? message?.isEdited ?? false,
      replyTo: replyTo || message?.replyTo || null,
      media: media || message?.media || message?.attachment || null,
      voice: voice || message?.voice || null,
      sender: sender || message?.sender || null,
      isGroup: isGroup ?? message?.isGroup ?? false,
      isPinned: isPinned ?? message?.isPinned ?? message?.pinned ?? false,
      isDisappearing:
        isDisappearing ??
        message?.isDisappearing ??
        false,
      expiresAt: expiresAt || message?.expiresAt || null,
      aiState: aiState || message?.aiState || '',
      encrypted: encrypted ?? message?.encrypted ?? false,
      sensitive: sensitive ?? message?.sensitive ?? false,
      deleted: deleted ?? message?.deleted ?? false,
      system: system ?? message?.system ?? false,
      scheduled:
        scheduled ??
        message?.scheduled ??
        message?.status === 'scheduled',
    }),
    [
      aiState,
      deleted,
      encrypted,
      expiresAt,
      id,
      isDisappearing,
      isEdited,
      isGroup,
      isOutgoing,
      isOwn,
      isPinned,
      media,
      message,
      replyTo,
      scheduled,
      sender,
      sensitive,
      status,
      system,
      text,
      timestamp,
      type,
      voice,
    ]
  );

  useEffect(() => {
    setLocalReactions(reactions || message?.reactions || []);
  }, [message?.reactions, reactions]);

  useEffect(() => {
    if (!data.isDisappearing || !data.expiresAt) {
      setRemaining(null);
      return undefined;
    }

    const updateRemaining = () => {
      const difference = Math.max(
        0,
        new Date(data.expiresAt).getTime() - Date.now()
      );

      setRemaining(difference);
    };

    updateRemaining();

    const interval = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(interval);
  }, [data.expiresAt, data.isDisappearing]);

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const openActions = () => {
    setActionSheetOpen(true);

    if (typeof onLongPress === 'function') {
      onLongPress(data);
    }

    if (typeof onActions === 'function') {
      onActions(data);
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
        openActions();
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
      -110,
      Math.min(110, deltaX)
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

    if (Math.abs(deltaX) >= SWIPE_REPLY_THRESHOLD) {
      if (typeof onReply === 'function') {
        onReply(data);
      }

      setSwipeOffset(0);
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

  const react = (emoji) => {
    setLocalReactions((current) => {
      const existing = current.find(
        (item) => (item.emoji || item.reaction) === emoji
      );

      if (existing) {
        return current.map((item) =>
          (item.emoji || item.reaction) === emoji
            ? {
                ...item,
                count: (item.count || 1) + 1,
              }
            : item
        );
      }

      return [...current, { emoji, count: 1 }];
    });

    onReact?.(data, emoji);
  };

  const handleAction = (label) => {
    setActionSheetOpen(false);

    if (label === 'Reply') {
      onReply?.(data);
      return;
    }

    if (label === 'React') {
      react('❤️');
      return;
    }

    if (label === 'Copy') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(data.text || '');
      }

      onAction?.(label, data);
      return;
    }

    onAction?.(label, data);
  };

  useEffect(() => {
    return () => clearLongPress();
  }, []);

  if (data.system) {
    return (
      <div
        className={className}
        style={{
          ...styles.systemMessage,
          ...style,
        }}
        role="status"
      >
        <Shield size={13} />
        <span>{data.text}</span>
        <small>{formatTime(data.timestamp)}</small>
      </div>
    );
  }

  const senderName =
    data.sender?.displayName ||
    data.sender?.username ||
    data.senderName ||
    '';

  const isAiMessage =
    data.type === 'ai' ||
    data.type === 'ai-summary' ||
    data.type === 'ai-suggestion' ||
    Boolean(data.aiState);

  const displayStatus =
    data.scheduled
      ? 'scheduled'
      : data.status || (data.encrypted ? 'encrypted' : '');

  const isExpired =
    data.type === 'expired' ||
    data.status === 'expired' ||
    (data.isDisappearing && remaining === 0);

  const bubbleContent = data.deleted ? (
    <span style={styles.deletedMessage}>
      <EyeOff size={14} />
      Message deleted
    </span>
  ) : isExpired ? (
    <span style={styles.deletedMessage}>
      <Clock3 size={14} />
      Message expired
    </span>
  ) : data.type === 'text' ||
    data.type === 'ai' ||
    data.type === 'ai-summary' ||
    data.type === 'ai-suggestion' ? (
    <p style={styles.textContent}>{data.text}</p>
  ) : data.type === 'voice' ? (
    <VoiceContent
      voice={{
        ...data.voice,
        duration: data.voice?.duration || message?.duration,
        status: data.status,
      }}
      isOutgoing={data.isOutgoing}
    />
  ) : (
    <MediaContent
      type={data.type}
      media={data.media}
      text={data.text}
      onOpenMedia={onOpenMedia || onPreview}
    />
  );

  return (
    <>
      <div
        ref={bubbleRef}
        className={`aarush-message-bubble ${className}`}
        style={{
          ...styles.messageGroup,
          justifyItems: data.isOutgoing ? 'end' : 'start',
          ...style,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        onContextMenu={(event) => {
          event.preventDefault();
          openActions();
        }}
        onDoubleClick={openActions}
      >
        <div
          style={{
            ...styles.bubble,
            ...(data.isOutgoing
              ? styles.outgoingBubble
              : styles.incomingBubble),
            ...(isAiMessage ? styles.aiBubble : {}),
            ...(data.sensitive ? styles.sensitiveBubble : {}),
            transform: `translateX(${swipeOffset}px)`,
          }}
          tabIndex={0}
          role="article"
          aria-label={`${data.isOutgoing ? 'Sent' : 'Received'} message`}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' ||
              event.key === ' ' ||
              event.key === 'ContextMenu'
            ) {
              event.preventDefault();
              openActions();
            }
          }}
        >
          {data.isGroup && !data.isOutgoing && senderName ? (
            <span style={styles.senderName}>
              {senderName}
            </span>
          ) : null}

          {isAiMessage ? (
            <span style={styles.aiLabel}>
              <Bot size={12} />
              {data.aiState || 'AI generated'}
            </span>
          ) : null}

          <ReplyPreview
            replyTo={data.replyTo}
            onReplyClick={onReplyClick || onReply}
          />

          {bubbleContent}

          <div style={styles.bubbleFooter}>
            {data.isEdited ? (
              <span style={styles.editedLabel}>Edited</span>
            ) : null}

            {data.encrypted ? (
              <span style={styles.encryptedLabel}>
                <Lock size={10} />
                Encrypted
              </span>
            ) : null}

            {data.isPinned ? (
              <Pin size={11} color="#d6c9ff" />
            ) : null}

            {data.isDisappearing ? (
              <span style={styles.disappearingLabel}>
                <Clock3 size={10} />
                {remaining === null
                  ? 'Disappearing'
                  : remaining > 0
                    ? `${Math.ceil(remaining / 1000)}s`
                    : 'Expired'}
              </span>
            ) : null}
          </div>
        </div>

        <div style={styles.messageMeta}>
          <span>{formatTime(data.timestamp)}</span>

          {data.isOutgoing ? (
            <span style={styles.statusGroup}>
              <StatusIcon status={displayStatus} />
            </span>
          ) : null}

          {data.isEdited ? (
            <span style={styles.metaEdited}>Edited</span>
          ) : null}

          {data.isDisappearing && remaining !== null ? (
            <span style={styles.remainingLabel}>
              {formatRelativeTime(data.expiresAt)}
            </span>
          ) : null}
        </div>

        <ReactionList
          reactions={localReactions}
          onReact={(emoji) => react(emoji)}
        />
      </div>

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
            aria-label="Message actions"
          >
            <div style={styles.sheetHandle} />

            <div style={styles.sheetHeader}>
              <div>
                <strong>Message actions</strong>
                <span>
                  {data.text ||
                    getMediaLabel(data.type) ||
                    'Selected message'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActionSheetOpen(false)}
                style={styles.closeButton}
                aria-label="Close message actions"
              >
                <X size={16} />
              </button>
            </div>

            <div style={styles.actionGrid}>
              {ACTIONS.map(([label, Icon]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => handleAction(label)}
                  style={{
                    ...styles.actionButton,
                    ...(label.includes('Delete')
                      ? styles.dangerAction
                      : {}),
                  }}
                >
                  <span style={styles.actionIcon}>
                    <Icon size={15} />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .aarush-message-bubble {
          transition: transform 180ms ease;
        }

        .aarush-message-bubble .aarush-message-bubble {
          outline: none;
        }

        .aarush-message-bubble [tabindex="0"]:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-message-bubble,
          .aarush-message-bubble * {
            animation: none !important;
            transition: none !important;
          }
        }

        @media (prefers-contrast: more) {
          .aarush-message-bubble [tabindex="0"] {
            border-color: rgba(255,255,255,0.45) !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  messageGroup: {
    position: 'relative',
    display: 'grid',
    gap: '0.2rem',
    width: '100%',
    animation: 'aarush-message-in 180ms ease both',
  },

  bubble: {
    position: 'relative',
    maxWidth: 'min(82%, 36rem)',
    minWidth: '2.8rem',
    padding: '0.72rem 0.82rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.15rem',
    boxShadow: '0 14px 32px rgba(0,0,0,0.16)',
    transition:
      'transform 180ms ease, filter 180ms ease, border-color 180ms ease',
  },

  outgoingBubble: {
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.95), rgba(37,142,216,0.9))',
    borderBottomRightRadius: '0.35rem',
    boxShadow: '0 15px 34px rgba(60,75,190,0.25)',
  },

  incomingBubble: {
    color: '#edf3ff',
    background:
      'linear-gradient(145deg, rgba(35,42,59,0.92), rgba(18,23,35,0.92))',
    borderBottomLeftRadius: '0.35rem',
  },

  aiBubble: {
    borderColor: 'rgba(255,79,216,0.22)',
    boxShadow: '0 15px 34px rgba(255,79,216,0.12)',
  },

  sensitiveBubble: {
    filter: 'blur(5px)',
  },

  senderName: {
    display: 'block',
    marginBottom: '0.35rem',
    color: '#b7adff',
    fontSize: '0.7rem',
    fontWeight: 850,
  },

  aiLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    marginBottom: '0.35rem',
    color: '#e6cfff',
    fontSize: '0.66rem',
    fontWeight: 850,
  },

  textContent: {
    margin: 0,
    color: 'inherit',
    fontSize: '0.9rem',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },

  deletedMessage: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#a1aec4',
    fontSize: '0.82rem',
    fontStyle: 'italic',
  },

  bubbleFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    flexWrap: 'wrap',
    marginTop: '0.45rem',
  },

  editedLabel: {
    color: '#d3ddf0',
    fontSize: '0.62rem',
    fontStyle: 'italic',
  },

  encryptedLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    color: '#a9edff',
    fontSize: '0.61rem',
    fontWeight: 750,
  },

  disappearingLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    color: '#ffcf8a',
    fontSize: '0.61rem',
    fontWeight: 750,
  },

  messageMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.32rem',
    color: '#8796b1',
    fontSize: '0.64rem',
  },

  statusGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
  },

  metaEdited: {
    color: '#9aa7bf',
    fontStyle: 'italic',
  },

  remainingLabel: {
    color: '#ffcf8a',
  },

  replyPreview: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '0.45rem',
    width: '100%',
    marginBottom: '0.5rem',
    padding: '0.4rem',
    border: 0,
    borderRadius: '0.55rem',
    color: '#dce6f8',
    background: 'rgba(0,0,0,0.16)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  replyAccent: {
    width: '0.2rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: '#4dd7ff',
  },

  replyBody: {
    display: 'grid',
    gap: '0.15rem',
    minWidth: 0,
    fontSize: '0.67rem',
  },

  voiceContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '14rem',
  },

  voicePlayButton: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    cursor: 'pointer',
  },

  voiceBody: {
    minWidth: 0,
    flex: 1,
  },

  waveform: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.12rem',
    height: '1.55rem',
  },

  waveBar: {
    width: '0.12rem',
    minHeight: '0.35rem',
    borderRadius: '999px',
    background: '#c8d5ff',
    transition: 'opacity 180ms ease',
  },

  voiceMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#b8c5db',
    fontSize: '0.62rem',
  },

  speedButton: {
    padding: '0.14rem 0.3rem',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.08)',
    fontSize: '0.61rem',
    cursor: 'pointer',
  },

  transcriptionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    color: '#d8caff',
  },

  voiceFeature: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    color: '#a9edff',
  },

  imageButton: {
    display: 'grid',
    gap: '0.4rem',
    padding: 0,
    border: 0,
    color: '#ffffff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  messageImage: {
    display: 'block',
    width: 'min(100%, 22rem)',
    maxHeight: '22rem',
    objectFit: 'cover',
    borderRadius: '0.85rem',
  },

  mediaCaption: {
    color: '#eef3ff',
    fontSize: '0.78rem',
  },

  videoButton: {
    position: 'relative',
    display: 'block',
    width: 'min(100%, 22rem)',
    padding: 0,
    overflow: 'hidden',
    border: 0,
    borderRadius: '0.85rem',
    background: '#101521',
    cursor: 'pointer',
  },

  messageVideo: {
    display: 'block',
    width: '100%',
    maxHeight: '22rem',
    objectFit: 'cover',
  },

  videoOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    color: '#ffffff',
    background: 'rgba(0,0,0,0.2)',
  },

  fileContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    minWidth: '13rem',
    padding: 0,
    border: 0,
    color: '#eef3ff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  fileIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.72rem',
    color: '#cfc6ff',
    background: 'rgba(124,92,255,0.18)',
  },

  fileText: {
    display: 'grid',
    gap: '0.14rem',
    minWidth: 0,
    fontSize: '0.78rem',
  },

  linkPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    minWidth: '13rem',
  },

  linkIcon: {
    width: '2.15rem',
    height: '2.15rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    color: '#a9edff',
    background: 'rgba(77,215,255,0.12)',
  },

  linkBody: {
    display: 'grid',
    gap: '0.15rem',
    minWidth: 0,
    color: '#eaf4ff',
    fontSize: '0.77rem',
  },

  emojiMessage: {
    display: 'block',
    fontSize: '2rem',
    lineHeight: 1.1,
  },

  stickerButton: {
    display: 'grid',
    placeItems: 'center',
    gap: '0.3rem',
    minWidth: '6rem',
    minHeight: '4rem',
    padding: '0.2rem',
    border: 0,
    color: '#ffffff',
    background: 'transparent',
    cursor: 'pointer',
  },

  stickerImage: {
    display: 'block',
    maxWidth: '9rem',
    maxHeight: '9rem',
    objectFit: 'contain',
  },

  reactions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    marginTop: '-0.55rem',
    zIndex: 2,
  },

  reaction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    minHeight: '1.35rem',
    padding: '0.16rem 0.35rem',
    border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(7,10,16,0.92)',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },

  systemMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    padding: '0.55rem',
    color: '#9daac2',
    fontSize: '0.68rem',
    textAlign: 'center',
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
    width: 'min(100%, 560px)',
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
    color: '#ffffff',
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

  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
    gap: '0.45rem',
  },

  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    minHeight: '2.7rem',
    padding: '0.55rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.8rem',
    color: '#e8eefb',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '0.7rem',
    fontWeight: 750,
    textAlign: 'left',
    cursor: 'pointer',
  },

  dangerAction: {
    color: '#ffb0c4',
    borderColor: 'rgba(255,79,122,0.18)',
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

export default memo(MessageBubble);