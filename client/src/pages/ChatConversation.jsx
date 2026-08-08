import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  AudioLines,
  Bot,
  CalendarClock,
  Camera,
  Check,
  CheckCheck,
  Clock3,
  Copy,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Flag,
  Forward,
  Image as ImageIcon,
  Info,
  Languages,
  Link2,
  ListFilter,
  Lock,
  MapPin,
  Mic,
  MoreHorizontal,
  Pause,
  Phone,
  Pin,
  Play,
  Plus,
  Reply,
  Save,
  Search,
  Send,
  Settings2,
  Shield,
  ShieldAlert,
  Smile,
  Sparkles,
  Star,
  Sticker,
  Trash2,
  UserRound,
  Video,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from 'lucide-react';

const CHAT_STATE_KEY = 'aarush_chat_conversation_state_v2';
const MESSAGE_STATE_KEY = 'aarush_chat_messages_v2';
const DRAFT_STATE_KEY = 'aarush_chat_drafts_v2';

const DEFAULT_CHATS = [
  {
    id: '123',
    username: 'aman.satwai',
    displayName: 'Aman Satwai',
    avatarUrl: 'https://i.pravatar.cc/160?u=aman.satwai',
    verified: true,
    online: true,
    lastSeen: 'recently',
  },
  {
    id: '124',
    username: 'aarush.team',
    displayName: 'Aarush Team',
    avatarUrl: 'https://i.pravatar.cc/160?u=aarush.team',
    verified: true,
    online: true,
    lastSeen: 'active now',
    isGroup: true,
  },
  {
    id: '125',
    username: 'design.loop',
    displayName: 'Design Loop',
    avatarUrl: 'https://i.pravatar.cc/160?u=design.loop',
    verified: false,
    online: false,
    lastSeen: '18 minutes ago',
  },
  {
    id: '126',
    username: 'creator.lab',
    displayName: 'Creator Lab',
    avatarUrl: 'https://i.pravatar.cc/160?u=creator.lab',
    verified: true,
    online: false,
    lastSeen: 'Yesterday',
  },
];

const DEFAULT_MESSAGES = {
  '123': [
    {
      id: 'message-123-1',
      senderId: 'remote-user',
      type: 'text',
      text: 'Let us review the new build.',
      createdAt: Date.now() - 3600000,
      status: 'read',
    },
    {
      id: 'message-123-2',
      senderId: 'me',
      type: 'text',
      text: 'Absolutely. I am checking the privacy flows now.',
      createdAt: Date.now() - 3300000,
      status: 'read',
    },
    {
      id: 'message-123-3',
      senderId: 'remote-user',
      type: 'image',
      text: 'Sent a photo',
      createdAt: Date.now() - 3000000,
      status: 'delivered',
      attachment: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=85',
        name: 'Build preview',
      },
    },
    {
      id: 'message-123-4',
      senderId: 'me',
      type: 'voice',
      text: 'Voice message',
      createdAt: Date.now() - 2400000,
      status: 'read',
      duration: '0:18',
    },
    {
      id: 'message-123-5',
      senderId: 'remote-user',
      type: 'text',
      text: 'The new chat layout feels much cleaner.',
      createdAt: Date.now() - 180000,
      status: 'delivered',
    },
  ],
  '124': [
    {
      id: 'message-124-1',
      senderId: 'remote-user',
      type: 'text',
      text: 'Build review at 8 PM.',
      createdAt: Date.now() - 7200000,
      status: 'read',
    },
  ],
  '125': [
    {
      id: 'message-125-1',
      senderId: 'remote-user',
      type: 'text',
      text: 'The mockups are ready.',
      createdAt: Date.now() - 5400000,
      status: 'read',
    },
  ],
  '126': [
    {
      id: 'message-126-1',
      senderId: 'remote-user',
      type: 'voice',
      text: 'Voice message',
      createdAt: Date.now() - 9000000,
      status: 'delivered',
      duration: '0:24',
    },
  ],
};

const MENU_ITEMS = [
  ['Search in Conversation', Search],
  ['View Profile', UserRound],
  ['Media, Links & Files', FileText],
  ['Mute Notifications', VolumeX],
  ['Archive Chat', Archive],
  ['Pin Chat', Pin],
  ['Hide Chat', EyeOff],
  ['Lock Chat', Lock],
  ['Move to Vault', Shield],
  ['Disappearing Messages', Clock3],
  ['Chat Wallpaper', Sparkles],
  ['Export Chat', Download],
  ['Report User', Flag],
  ['Block User', ShieldAlert],
  ['Delete Chat', Trash2],
  ['Privacy Settings', Settings2],
  ['Ghost Mode', EyeOff],
  ['Stealth Mode', ShieldAlert],
  ['Screenshot Protection', Camera],
  ['Screen Recording Protection', Video],
  ['AI Chat Assistant', Bot],
  ['Translate Messages', Languages],
  ['Schedule Message', CalendarClock],
  ['Clear Chat', Trash2],
  ['Chat Info', Info],
];

const MESSAGE_ACTIONS = [
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
  ['Report', Flag],
  ['Message Info', Info],
];

const WALLPAPERS = [
  { key: 'default', label: 'Default', value: 'default' },
  { key: 'solid', label: 'Solid colors', value: '#111827' },
  {
    key: 'gradient',
    label: 'Gradient',
    value: 'linear-gradient(135deg, #171432, #0b2634)',
  },
  {
    key: 'blur',
    label: 'Blur wallpaper',
    value: 'radial-gradient(circle at 20% 10%, #573f9b, #0b101a 65%)',
  },
  { key: 'dark', label: 'Dark wallpaper', value: '#090b10' },
  { key: 'amoled', label: 'AMOLED wallpaper', value: '#000000' },
];

const DISAPPEARING_TIMERS = [
  'Off',
  '30 sec',
  '1 min',
  '5 min',
  '1 hour',
  '24 hours',
  '7 days',
  '30 days',
];

function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
}

function getChat(chatId) {
  const chats = readStorage('aarush_chat_list_v2', DEFAULT_CHATS);
  return (
    chats.find((chat) => String(chat.id) === String(chatId)) ||
    DEFAULT_CHATS.find((chat) => String(chat.id) === String(chatId)) ||
    {
      id: chatId || 'unknown',
      username: 'unknown.user',
      displayName: 'Unknown User',
      avatarUrl: 'https://i.pravatar.cc/160?u=unknown-user',
      verified: false,
      online: false,
      lastSeen: 'recently',
    }
  );
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  return date.toLocaleDateString([], {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

function isSameDay(firstTimestamp, secondTimestamp) {
  return (
    new Date(firstTimestamp).toDateString() ===
    new Date(secondTimestamp).toDateString()
  );
}

function getWallpaperStyle(value) {
  if (value === 'default') {
    return {
      background:
        'radial-gradient(circle at top, rgba(43,34,88,0.42), rgba(8,11,18,1) 60%)',
    };
  }

  return {
    background: value,
  };
}

function StatusIcon({ status }) {
  if (status === 'sending') {
    return <Clock3 size={13} />;
  }

  if (status === 'failed') {
    return <ShieldAlert size={13} color="#ff9eb8" />;
  }

  if (status === 'sent') {
    return <Check size={13} />;
  }

  if (status === 'delivered') {
    return <CheckCheck size={13} />;
  }

  if (status === 'read') {
    return <CheckCheck size={13} color="#4dd7ff" />;
  }

  if (status === 'scheduled') {
    return <CalendarClock size={13} color="#d6b9ff" />;
  }

  if (status === 'expired') {
    return <Clock3 size={13} color="#ffcf8a" />;
  }

  return <Shield size={13} color="#9faeff" />;
}

function VoiceMessage({ message, isOwn }) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  return (
    <div style={styles.voiceMessage}>
      <button
        type="button"
        onClick={() => setPlaying((value) => !value)}
        style={styles.voicePlayButton}
        aria-label={playing ? 'Pause voice message' : 'Play voice message'}
      >
        {playing ? <Pause size={15} /> : <Play size={15} />}
      </button>

      <div style={styles.voiceTrackArea}>
        <div style={styles.waveform}>
          {Array.from({ length: 30 }).map((_, index) => (
            <span
              key={index}
              style={{
                ...styles.waveBar,
                height: `${8 + ((index * 13) % 20)}px`,
                opacity: playing ? 1 : 0.72,
              }}
            />
          ))}
        </div>

        <div style={styles.voiceMeta}>
          <span>{message.duration || '0:18'}</span>

          <button
            type="button"
            onClick={() => setSpeed((value) => (value === 2 ? 1 : value + 0.5))}
            style={styles.speedButton}
          >
            {speed}×
          </button>

          <span>Noise reduction</span>
        </div>
      </div>

      {isOwn ? <StatusIcon status={message.status} /> : null}
    </div>
  );
}

function AttachmentPreview({ message, onOpen }) {
  const attachment = message.attachment;

  if (message.type === 'image' && attachment?.url) {
    return (
      <button
        type="button"
        onClick={() => onOpen(attachment)}
        style={styles.imageAttachmentButton}
      >
        <img
          src={attachment.url}
          alt={attachment.name || 'Shared image'}
          style={styles.imageAttachment}
        />
        <span style={styles.attachmentCaption}>
          {message.text || attachment.name || 'Shared image'}
        </span>
      </button>
    );
  }

  if (message.type === 'video') {
    return (
      <button
        type="button"
        onClick={() => onOpen(attachment || { type: 'video' })}
        style={styles.mediaAttachment}
      >
        <Video size={24} />
        <span>{message.text || 'Shared video'}</span>
      </button>
    );
  }

  if (message.type === 'audio') {
    return (
      <div style={styles.fileAttachment}>
        <AudioLines size={20} />
        <span>{message.text || 'Audio file'}</span>
      </div>
    );
  }

  if (message.type === 'location') {
    return (
      <div style={styles.fileAttachment}>
        <MapPin size={20} />
        <span>{message.text || 'Shared location'}</span>
      </div>
    );
  }

  if (message.type === 'link') {
    return (
      <div style={styles.linkAttachment}>
        <Link2 size={18} />
        <span>{message.text || 'Shared link'}</span>
      </div>
    );
  }

  if (
    ['file', 'document', 'contact', 'gif', 'sticker'].includes(
      message.type
    )
  ) {
    return (
      <div style={styles.fileAttachment}>
        {message.type === 'contact' ? (
          <UserRound size={20} />
        ) : message.type === 'sticker' ? (
          <Sticker size={20} />
        ) : (
          <FileText size={20} />
        )}

        <span>{message.text || 'Shared attachment'}</span>
      </div>
    );
  }

  return null;
}

function MessageBubble({ message, isOwn, onActions, onPreview }) {
  return (
    <div
      style={{
        ...styles.messageGroup,
        justifyItems: isOwn ? 'end' : 'start',
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onActions(message);
      }}
      onDoubleClick={() => onActions(message)}
    >
      <div
        style={{
          ...styles.messageBubble,
          ...(isOwn ? styles.outgoingBubble : styles.incomingBubble),
        }}
      >
        {message.type === 'text' ? (
          <p style={styles.messageText}>{message.text}</p>
        ) : null}

        {message.type === 'voice' ? (
          <VoiceMessage message={message} isOwn={isOwn} />
        ) : null}

        {message.type !== 'text' && message.type !== 'voice' ? (
          <AttachmentPreview
            message={message}
            onOpen={(attachment) => onPreview(attachment)}
          />
        ) : null}

        {message.reaction ? (
          <span style={styles.reactionBadge}>{message.reaction}</span>
        ) : null}
      </div>

      <div style={styles.messageMeta}>
        <span>{formatTime(message.createdAt)}</span>

        {isOwn ? (
          <span style={styles.statusGroup}>
            <StatusIcon status={message.status} />
            {message.encrypted ? (
              <Lock size={11} color="#a9edff" />
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function MediaPreview({media, onClose}) {
  if (!media) {
    return null;
  }

  return (
    <div
      style={styles.previewOverlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={styles.previewPanel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Media preview"
      >
        <div style={styles.previewHeader}>
          <strong>{media.name || 'Media preview'}</strong>

          <button
            type="button"
            onClick={onClose}
            style={styles.modalCloseButton}
            aria-label="Close preview"
          >
            <X size={17} />
          </button>
        </div>

        {media.type === 'image' && media.url ? (
          <img
            src={media.url}
            alt={media.name || 'Preview'}
            style={styles.fullscreenImage}
          />
        ) : media.type === 'video' && media.url ? (
          <video
            controls
            src={media.url}
            style={styles.fullscreenVideo}
          />
        ) : (
          <div style={styles.genericPreview}>
            <FileText size={42} />
            <span>{media.name || 'Attachment preview'}</span>
          </div>
        )}

        {media.url ? (
          <a
            href={media.url}
            download
            style={styles.downloadLink}
          >
            <Download size={15} />
            Download
          </a>
        ) : null}
      </div>
    </div>
  );
}

function ActionSheet({message, onClose, onAction}) {
  if (!message) {
    return null;
  }

  return (
    <div
      style={styles.sheetOverlay}
      onClick={onClose}
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
              {message.text || message.type || 'Selected message'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={styles.modalCloseButton}
            aria-label="Close message actions"
          >
            <X size={17} />
          </button>
        </div>

        <div style={styles.actionGrid}>
          {MESSAGE_ACTIONS.map(([label, Icon]) => (
            <button
              type="button"
              key={label}
              onClick={() => onAction(label)}
              style={styles.actionButton}
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
  );
}

function ConversationMenu({
  onClose,
  onAction,
}) {
  return (
    <div
      style={styles.sheetOverlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={styles.conversationMenu}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Conversation options"
      >
        <div style={styles.sheetHandle} />

        <div style={styles.sheetHeader}>
          <div>
            <strong>Conversation options</strong>
            <span>Privacy, media, AI, and chat controls</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={styles.modalCloseButton}
            aria-label="Close conversation menu"
          >
            <X size={17} />
          </button>
        </div>

        <div style={styles.menuList}>
          {MENU_ITEMS.map(([label, Icon]) => (
            <button
              type="button"
              key={label}
              onClick={() => onAction(label)}
              style={styles.menuItem}
            >
              <Icon size={16} />
              <span>{label}</span>
              <span style={styles.menuArrow}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  onAttachment,
  onVoice,
  onSchedule,
}) {
  const [showAttachments, setShowAttachments] = useState(false);
  const [recording, setRecording] = useState(false);

  const send = () => {
    if (!value.trim()) {
      return;
    }

    onSend({
      type: 'text',
      text: value.trim(),
    });
  };

  return (
    <div style={styles.composer}>
      {showAttachments ? (
        <div style={styles.attachmentToolbar}>
          <button
            type="button"
            onClick={() => onAttachment('image')}
            style={styles.composerTool}
          >
            <ImageIcon size={15} />
            Gallery
          </button>

          <button
            type="button"
            onClick={() => onAttachment('video')}
            style={styles.composerTool}
          >
            <Video size={15} />
            Video
          </button>

          <button
            type="button"
            onClick={() => onAttachment('file')}
            style={styles.composerTool}
          >
            <FileText size={15} />
            File
          </button>

          <button
            type="button"
            onClick={() => onAttachment('location')}
            style={styles.composerTool}
          >
            <MapPin size={15} />
            Location
          </button>

          <button
            type="button"
            onClick={() => onAttachment('contact')}
            style={styles.composerTool}
          >
            <UserRound size={15} />
            Contact
          </button>

          <button
            type="button"
            onClick={() => onAttachment('sticker')}
            style={styles.composerTool}
          >
            <Sticker size={15} />
            Sticker
          </button>
        </div>
      ) : null}

      <div style={styles.composerRow}>
        <button
          type="button"
          onClick={() => setShowAttachments((value) => !value)}
          style={styles.composerIconButton}
          aria-label="Open attachments"
        >
          {showAttachments ? <X size={18} /> : <Plus size={18} />}
        </button>

        <button
          type="button"
          onClick={() => onAttachment('camera')}
          style={styles.composerIconButton}
          aria-label="Open camera"
        >
          <Camera size={17} />
        </button>

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          placeholder="Message…"
          style={styles.composerInput}
          aria-label="Message"
        />

        <button
          type="button"
          onClick={() =>
            onChange((value || '') + ' 😊')
          }
          style={styles.composerIconButton}
          aria-label="Add emoji"
        >
          <Smile size={17} />
        </button>

        <button
          type="button"
          onPointerDown={() => {
            setRecording(true);
            onVoice({type: 'voice', recording: true});
          }}
          onPointerUp={() => setRecording(false)}
          onPointerLeave={() => setRecording(false)}
          style={{
            ...styles.composerIconButton,
            ...(recording ? styles.recordingButton : {}),
          }}
          aria-label="Hold to record voice message"
        >
          <Mic size={17} />
        </button>

        {value.trim() ? (
          <button
            type="button"
            onClick={send}
            style={styles.sendButton}
            aria-label="Send message"
          >
            <Send size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSchedule}
            style={styles.composerIconButton}
            aria-label="Schedule message"
          >
            <CalendarClock size={17} />
          </button>
        )}
      </div>
    </div>
  );
}

function BackgroundSystems() {
  const systems = [
    'Chat Engine',
    'Realtime Messaging',
    'Presence Engine',
    'Typing Engine',
    'Voice Engine',
    'Media Engine',
    'Notification Sync',
    'Vault Integration',
    'AI Chat Assistant',
    'Privacy Shield',
  ];

  return (
    <section style={styles.infoSection}>
      <div style={styles.infoSectionHeader}>
        <div>
          <h2 style={styles.infoTitle}>Background Chat Systems</h2>
          <p style={styles.infoSubtitle}>
            Messaging services and privacy boundaries.
          </p>
        </div>

        <Settings2 size={18} color="#8ea0c4" />
      </div>

      <div style={styles.systemGrid}>
        {systems.map((system, index) => {
          const status =
            index === 1
              ? 'Syncing'
              : index > 7
                ? 'Protected'
                : 'Active';

          return (
            <div key={system} style={styles.systemCard}>
              <span>{system}</span>
              <small style={styles.systemStatus(status)}>
                {status}
              </small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FutureMessagingLab() {
  return (
    <section style={styles.infoSection}>
      <div style={styles.infoSectionHeader}>
        <div>
          <h2 style={styles.infoTitle}>
            Future Messaging Lab (Coming Soon)
          </h2>
          <p style={styles.infoSubtitle}>
            Future-ready messaging capabilities.
          </p>
        </div>

        <Sparkles size={18} color="#9d8cff" />
      </div>

      <div style={styles.systemGrid}>
        {[
          'End-to-End Encryption',
          'Secret Chats',
          'Multi-Device Encryption',
          'AI Live Translation',
          'Voice Clone Protection',
          'Quantum Messaging',
          'Cross-App Secure Bridge',
          'Autonomous Conversation Assistant',
        ].map((feature) => (
          <div key={feature} style={styles.futureCard}>
            <span>{feature}</span>
            <small>Future ready</small>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ChatConversation() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const messageEndRef = useRef(null);

  const chat = useMemo(() => getChat(chatId), [chatId]);

  const [messages, setMessages] = useState(() => {
    const stored = readStorage(MESSAGE_STATE_KEY, DEFAULT_MESSAGES);
    return stored[chatId] || DEFAULT_MESSAGES[chatId] || [];
  });

  const [draft, setDraft] = useState(() => {
    const drafts = readStorage(DRAFT_STATE_KEY, {});
    return drafts[chatId] || '';
  });

  const [messageActions, setMessageActions] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [conversationMenuOpen, setConversationMenuOpen] =
    useState(false);
  const [activeDialog, setActiveDialog] = useState(null);
  const [wallpaper, setWallpaper] = useState(() => {
    const state = readStorage(CHAT_STATE_KEY, {});
    return state[chatId]?.wallpaper || 'default';
  });
  const [disappearingTimer, setDisappearingTimer] = useState(() => {
    const state = readStorage(CHAT_STATE_KEY, {});
    return state[chatId]?.disappearingTimer || 'Off';
  });
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const stored = readStorage(MESSAGE_STATE_KEY, {});
    writeStorage(MESSAGE_STATE_KEY, {
      ...stored,
      [chatId]: messages,
    });
  }, [chatId, messages]);

  useEffect(() => {
    const drafts = readStorage(DRAFT_STATE_KEY, {});
    writeStorage(DRAFT_STATE_KEY, {
      ...drafts,
      [chatId]: draft,
    });
  }, [chatId, draft]);

  useEffect(() => {
    const state = readStorage(CHAT_STATE_KEY, {});
    writeStorage(CHAT_STATE_KEY, {
      ...state,
      [chatId]: {
        ...(state[chatId] || {}),
        wallpaper,
        disappearingTimer,
      },
    });
  }, [chatId, disappearingTimer, wallpaper]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages.length]);

  const sendMessage = (payload) => {
    const text = payload?.text || '';

    if (payload?.type === 'text' && !text.trim()) {
      return;
    }

    const nextMessage = {
      id: `message-${Date.now()}`,
      senderId: 'me',
      type: payload.type || 'text',
      text: text.trim() || payload.label || '',
      createdAt: Date.now(),
      status: payload.scheduled ? 'scheduled' : 'sent',
      encrypted: false,
      attachment: payload.attachment,
      duration: payload.duration,
    };

    setMessages((current) => [...current, nextMessage]);
    setDraft('');
  };

  const handleAttachment = (type) => {
    const attachment = {
      type,
      name:
        type === 'image'
          ? 'Shared photo'
          : type === 'video'
            ? 'Shared video'
            : type === 'file'
              ? 'Shared document'
              : type === 'location'
                ? 'Shared location'
                : type === 'contact'
                  ? 'Shared contact'
                  : 'Shared sticker',
    };

    sendMessage({
      type,
      label: attachment.name,
      attachment,
    });
  };

  const handleVoice = (payload) => {
    if (payload?.recording) {
      setRecording(true);
      return;
    }

    setRecording(false);

    sendMessage({
      type: 'voice',
      text: 'Voice message',
      duration: '0:18',
    });
  };

  const handleConversationAction = (label) => {
    setConversationMenuOpen(false);

    if (label === 'Search in Conversation') {
      setActiveDialog('search');
      return;
    }

    if (label === 'Chat Wallpaper') {
      setActiveDialog('wallpaper');
      return;
    }

    if (label === 'Disappearing Messages') {
      setActiveDialog('disappearing');
      return;
    }

    if (label === 'AI Chat Assistant') {
      setActiveDialog('ai');
      return;
    }

    if (label === 'Lock Chat') {
      setActiveDialog('lock');
      return;
    }

    if (label === 'Move to Vault') {
      setActiveDialog('vault');
      return;
    }

    if (label === 'Clear Chat') {
      setMessages([]);
      return;
    }

    if (label === 'Delete Chat') {
      navigate('/chats');
      return;
    }

    if (label === 'Export Chat') {
      const exportData = JSON.stringify(messages, null, 2);
      const blob = new Blob([exportData], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${chat.username}-chat-export.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleMessageAction = (label) => {
    const selectedMessage = messageActions;
    setMessageActions(null);

    if (!selectedMessage) {
      return;
    }

    if (label === 'Copy') {
      navigator.clipboard?.writeText(selectedMessage.text || '');
      return;
    }

    if (
      label === 'Delete For Me' ||
      label === 'Delete For Everyone'
    ) {
      setMessages((current) =>
        current.filter((message) => message.id !== selectedMessage.id)
      );
      return;
    }

    if (label === 'Pin Message') {
      setMessages((current) =>
        current.map((message) =>
          message.id === selectedMessage.id
            ? { ...message, pinned: !message.pinned }
            : message
        )
      );
    }
  };

  const handleScheduleMessage = () => {
    if (!draft.trim()) {
      setActiveDialog('schedule');
      return;
    }

    sendMessage({
      type: 'text',
      text: draft,
      scheduled: true,
    });
  };

  const wallpaperStyle = getWallpaperStyle(wallpaper);

  let lastMessageTimestamp = null;

  return (
    <div style={{ ...styles.page, ...wallpaperStyle }}>
      <header style={styles.conversationHeader}>
        <button
          type="button"
          onClick={() => navigate('/chats')}
          style={styles.headerButton}
          aria-label="Back to chats"
        >
          <ArrowLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent('aarush:view-profile', {
                detail: { userId: chat.id },
              })
            )
          }
          style={styles.profileHeaderButton}
        >
          <span style={styles.headerAvatarWrapper}>
            <img
              src={chat.avatarUrl}
              alt={`${chat.displayName} profile`}
              style={styles.headerAvatar}
            />

            {chat.online ? <span style={styles.headerOnlineDot} /> : null}
          </span>

          <span style={styles.headerProfileText}>
            <strong>{chat.displayName}</strong>
            <small>
              @{chat.username} ·{' '}
              {chat.online ? 'Online' : `Last seen ${chat.lastSeen}`}
            </small>
          </span>
        </button>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('aarush:call', {
                  detail: { chatId: chat.id, type: 'voice' },
                })
              )
            }
            style={styles.headerButton}
            aria-label={`Voice call ${chat.displayName}`}
          >
            <Phone size={17} />
          </button>

          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('aarush:call', {
                  detail: { chatId: chat.id, type: 'video' },
                })
              )
            }
            style={styles.headerButton}
            aria-label={`Video call ${chat.displayName}`}
          >
            <Video size={17} />
          </button>

          <button
            type="button"
            onClick={() => setConversationMenuOpen(true)}
            style={styles.headerButton}
            aria-label="Open conversation menu"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.securityBanner}>
          <span style={styles.securityIcon}>
            <Lock size={13} />
          </span>

          <span>
            Private chat space · Encryption architecture ready
          </span>

          <button
            type="button"
            onClick={() => setActiveDialog('security')}
            style={styles.securityInfoButton}
            aria-label="Open security information"
          >
            <Info size={14} />
          </button>
        </div>

        <div style={styles.presenceRow}>
          <span style={styles.presenceBadge}>
            <span style={styles.presenceDot} />
            {chat.online ? 'Active now' : `Last seen ${chat.lastSeen}`}
          </span>

          {typing ? (
            <span style={styles.typingBadge}>
              <MessageCircle size={12} />
              Typing…
            </span>
          ) : null}

          {recording ? (
            <span style={styles.recordingBadge}>
              <Mic size={12} />
              Recording…
            </span>
          ) : null}

          {disappearingTimer !== 'Off' ? (
            <span style={styles.expiryBadge}>
              <Clock3 size={12} />
              {disappearingTimer}
            </span>
          ) : null}
        </div>

        <section style={styles.messageThread}>
          {messages.length === 0 ? (
            <div style={styles.emptyThread}>
              <div style={styles.emptyThreadIcon}>
                <MessageCircle size={25} />
              </div>

              <h2>Start a private conversation</h2>

              <p>
                Send a message, photo, voice note, file, location, or
                AI-assisted reply.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const showDate =
                !lastMessageTimestamp ||
                !isSameDay(
                  lastMessageTimestamp,
                  message.createdAt
                );

              lastMessageTimestamp = message.createdAt;

              return (
                <div key={message.id}>
                  {showDate ? (
                    <div style={styles.dateSeparator}>
                      <span>{formatDate(message.createdAt)}</span>
                    </div>
                  ) : null}

                  <MessageBubble
                    message={message}
                    isOwn={message.senderId === 'me'}
                    onActions={setMessageActions}
                    onPreview={setPreviewMedia}
                  />
                </div>
              );
            })
          )}

          <div ref={messageEndRef} />
        </section>

        <BackgroundSystems />
        <FutureMessagingLab />
      </main>

      <Composer
        value={draft}
        onChange={(value) => {
          setDraft(value);
          setTyping(Boolean(value));
        }}
        onSend={sendMessage}
        onAttachment={handleAttachment}
        onVoice={handleVoice}
        onSchedule={handleScheduleMessage}
      />

      {conversationMenuOpen ? (
        <ConversationMenu
          onClose={() => setConversationMenuOpen(false)}
          onAction={handleConversationAction}
        />
      ) : null}

      <ActionSheet
        message={messageActions}
        onClose={() => setMessageActions(null)}
        onAction={handleMessageAction}
      />

      <MediaPreview
        media={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />

      {activeDialog === 'wallpaper' ? (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialog}>
            <DialogHeader
              title="Chat Wallpaper"
              onClose={() => setActiveDialog(null)}
            />

            <div style={styles.wallpaperGrid}>
              {WALLPAPERS.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => {
                    setWallpaper(item.value);
                    setActiveDialog(null);
                  }}
                  style={{
                    ...styles.wallpaperChoice,
                    background:
                      item.value === 'default'
                        ? 'radial-gradient(circle at top, #392d75, #0b101a)'
                        : item.value,
                  }}
                >
                  <span>{item.label}</span>
                  {wallpaper === item.value ? (
                    <Check size={15} />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeDialog === 'disappearing' ? (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialog}>
            <DialogHeader
              title="Disappearing Messages"
              onClose={() => setActiveDialog(null)}
            />

            <div style={styles.dialogList}>
              {DISAPPEARING_TIMERS.map((timer) => (
                <button
                  type="button"
                  key={timer}
                  onClick={() => {
                    setDisappearingTimer(timer);
                    setActiveDialog(null);
                  }}
                  style={styles.dialogListItem}
                >
                  <Clock3 size={16} />
                  <span>{timer}</span>
                  {timer === disappearingTimer ? (
                    <Check size={15} color="#4dd7ff" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeDialog === 'ai' ? (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialog}>
            <DialogHeader
              title="AI Chat Assistant"
              onClose={() => setActiveDialog(null)}
            />

            <div style={styles.aiActionGrid}>
              {[
                'Summarize Conversation',
                'Rewrite Message',
                'Translate Message',
                'Change Tone',
                'Generate Reply',
                'Detect Scam',
                'Detect Spam',
                'Detect Sensitive Information',
                'Suggest Privacy Actions',
              ].map((action) => (
                <button
                  type="button"
                  key={action}
                  onClick={() => {
                    setActiveDialog(null);
                    window.dispatchEvent(
                      new CustomEvent('aarush:ai-chat-action', {
                        detail: {
                          action,
                          chatId: chat.id,
                        },
                      })
                    );
                  }}
                  style={styles.aiActionButton}
                >
                  <Sparkles size={15} />
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeDialog === 'search' ? (
        <ConversationSearchDialog
          messages={messages}
          onClose={() => setActiveDialog(null)}
        />
      ) : null}

      {activeDialog === 'security' ? (
        <SimpleDialog
          title="Chat Security"
          text="This conversation respects Aarush privacy, lock, vault, stealth, screenshot, and screen-recording protection boundaries."
          onClose={() => setActiveDialog(null)}
        />
      ) : null}

      {activeDialog === 'lock' ? (
        <SimpleDialog
          title="Lock Chat"
          text="Chat locking is delegated to the existing Aarush App Lock and device-security flows."
          onClose={() => {
            setActiveDialog(null);
            navigate('/app-lock-settings');
          }}
        />
      ) : null}

      {activeDialog === 'vault' ? (
        <SimpleDialog
          title="Move to Vault"
          text="This conversation can be routed through the existing Memories Vault and secure-storage flows."
          onClose={() => {
            setActiveDialog(null);
            navigate('/memories-vault');
          }}
        />
      ) : null}

      {activeDialog === 'schedule' ? (
        <SimpleDialog
          title="Schedule Message"
          text="Enter a message first, then use the calendar action to schedule it for this conversation."
          onClose={() => setActiveDialog(null)}
        />
      ) : null}
    </div>
  );
}

function DialogHeader({title, onClose}) {
  return (
    <div style={styles.dialogHeader}>
      <strong>{title}</strong>

      <button
        type="button"
        onClick={onClose}
        style={styles.modalCloseButton}
        aria-label={`Close ${title}`}
      >
        <X size={17} />
      </button>
    </div>
  );
}

function SimpleDialog({title, text, onClose}) {
  return (
    <div style={styles.dialogOverlay}>
      <div style={styles.dialog}>
        <DialogHeader title={title} onClose={onClose} />

        <p style={styles.dialogText}>{text}</p>

        <button
          type="button"
          onClick={onClose}
          style={styles.dialogPrimaryButton}
        >
          Done
        </button>
      </div>
    </div>
  );
}

function ConversationSearchDialog({messages, onClose}) {
  const [query, setQuery] = useState('');

  const results = messages.filter((message) =>
    String(message.text || '')
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div style={styles.dialogOverlay}>
      <div style={styles.dialog}>
        <DialogHeader
          title="Search in Conversation"
          onClose={onClose}
        />

        <div style={styles.dialogSearch}>
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search messages"
            autoFocus
            style={styles.dialogSearchInput}
          />
        </div>

        <div style={styles.searchResults}>
          {query && results.length === 0 ? (
            <span style={styles.noResults}>No messages found.</span>
          ) : null}

          {results.map((message) => (
            <button
              type="button"
              key={message.id}
              onClick={onClose}
              style={styles.searchResult}
            >
              <span>{message.text || message.type}</span>
              <small>{formatTime(message.createdAt)}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100dvh',
    paddingBottom: '5.5rem',
    color: '#f4f7ff',
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    transition: 'background 220ms ease',
  },

  conversationHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.7rem 0.8rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(7,10,16,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  headerButton: {
    width: '2.55rem',
    height: '2.55rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#f4f7ff',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  profileHeaderButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    minWidth: 0,
    padding: 0,
    border: 0,
    color: '#ffffff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  headerAvatarWrapper: {
    position: 'relative',
    width: '2.55rem',
    height: '2.55rem',
    flexShrink: 0,
  },

  headerAvatar: {
    width: '2.55rem',
    height: '2.55rem',
    objectFit: 'cover',
    borderRadius: '999px',
    border: '2px solid rgba(124,92,255,0.42)',
  },

  headerOnlineDot: {
    position: 'absolute',
    right: '-0.02rem',
    bottom: '-0.02rem',
    width: '0.68rem',
    height: '0.68rem',
    border: '2px solid #111622',
    borderRadius: '999px',
    background: '#3df2a8',
  },

  headerProfileText: {
    minWidth: 0,
    display: 'grid',
    gap: '0.12rem',
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.32rem',
  },

  main: {
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0.75rem 0.85rem 1rem',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },

  securityBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.42rem',
    padding: '0.55rem 0.65rem',
    border: '1px solid rgba(77,215,255,0.12)',
    borderRadius: '0.8rem',
    color: '#c5edf8',
    background: 'rgba(77,215,255,0.06)',
    fontSize: '0.7rem',
    fontWeight: 750,
  },

  securityIcon: {
    width: '1.45rem',
    height: '1.45rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#a9edff',
    background: 'rgba(77,215,255,0.12)',
  },

  securityInfoButton: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'grid',
    placeItems: 'center',
    marginLeft: 'auto',
    border: 0,
    borderRadius: '999px',
    color: '#a9edff',
    background: 'transparent',
    cursor: 'pointer',
  },

  presenceRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    margin: '0.65rem 0 0.8rem',
  },

  presenceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.55rem',
    borderRadius: '999px',
    color: '#c9f8e4',
    background: 'rgba(61,242,168,0.1)',
    fontSize: '0.68rem',
    fontWeight: 800,
  },

  presenceDot: {
    width: '0.45rem',
    height: '0.45rem',
    borderRadius: '999px',
    background: '#3df2a8',
    boxShadow: '0 0 9px rgba(61,242,168,0.5)',
  },

  typingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.55rem',
    borderRadius: '999px',
    color: '#b7efff',
    background: 'rgba(77,215,255,0.1)',
    fontSize: '0.68rem',
    fontWeight: 800,
  },

  recordingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.55rem',
    borderRadius: '999px',
    color: '#ffb4c9',
    background: 'rgba(255,79,122,0.11)',
    fontSize: '0.68rem',
    fontWeight: 800,
  },

  expiryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.55rem',
    borderRadius: '999px',
    color: '#e4d6ff',
    background: 'rgba(124,92,255,0.14)',
    fontSize: '0.68rem',
    fontWeight: 800,
  },

  messageThread: {
    display: 'grid',
    gap: '0.7rem',
    alignContent: 'start',
    minHeight: '20rem',
  },

  dateSeparator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    margin: '0.4rem 0',
    color: '#8d9bb6',
    fontSize: '0.68rem',
    fontWeight: 800,
    textAlign: 'center',
  },

  messageGroup: {
    display: 'grid',
    gap: '0.22rem',
  },

  messageBubble: {
    position: 'relative',
    maxWidth: 'min(82%, 34rem)',
    padding: '0.72rem 0.82rem',
    borderRadius: '1.15rem',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.16)',
  },

  outgoingBubble: {
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.94), rgba(37,142,216,0.9))',
    borderBottomRightRadius: '0.35rem',
    boxShadow: '0 14px 28px rgba(62,80,190,0.22)',
  },

  incomingBubble: {
    color: '#eef3ff',
    background: 'rgba(255,255,255,0.075)',
    borderBottomLeftRadius: '0.35rem',
  },

  messageText: {
    margin: 0,
    fontSize: '0.9rem',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },

  messageMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#8796b1',
    fontSize: '0.66rem',
  },

  statusGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
  },

  reactionBadge: {
    position: 'absolute',
    right: '0.55rem',
    bottom: '-0.65rem',
    width: '1.35rem',
    height: '1.35rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '999px',
    background: 'rgba(7,10,16,0.9)',
    fontSize: '0.75rem',
  },

  voiceMessage: {
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

  voiceTrackArea: {
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
    background: '#bcd0ff',
    transition: 'opacity 180ms ease',
  },

  voiceMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#bac6dc',
    fontSize: '0.64rem',
  },

  speedButton: {
    padding: '0.15rem 0.3rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.08)',
    fontSize: '0.62rem',
    cursor: 'pointer',
  },

  imageAttachmentButton: {
    display: 'grid',
    gap: '0.4rem',
    padding: 0,
    border: 0,
    color: '#ffffff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  imageAttachment: {
    display: 'block',
    width: 'min(100%, 20rem)',
    maxHeight: '20rem',
    objectFit: 'cover',
    borderRadius: '0.85rem',
  },

  attachmentCaption: {
    fontSize: '0.8rem',
  },

  mediaAttachment: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    minWidth: '12rem',
    padding: '0.35rem',
    border: 0,
    color: '#ffffff',
    background: 'transparent',
    fontSize: '0.82rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  fileAttachment: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    minWidth: '12rem',
    color: '#e5ecfb',
    fontSize: '0.82rem',
  },

  linkAttachment: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#a9edff',
    fontSize: '0.82rem',
    textDecoration: 'underline',
  },

  emptyThread: {
    display: 'grid',
    justifyItems: 'center',
    alignContent: 'center',
    minHeight: '18rem',
    padding: '2rem 1rem',
    textAlign: 'center',
  },

  emptyThreadIcon: {
    width: '3.7rem',
    height: '3.7rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '1.2rem',
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.28), rgba(77,215,255,0.16))',
  },

  emptyThreadH2: {
    margin: '0.75rem 0 0',
    color: '#f4f7ff',
    fontSize: '1rem',
  },

  emptyThreadP: {
    maxWidth: '25rem',
    margin: '0.45rem 0 0',
    color: '#94a2bc',
    fontSize: '0.8rem',
    lineHeight: 1.55,
  },

  composer: {
    position: 'sticky',
    bottom: 0,
    zIndex: 40,
    padding: '0.65rem 0.75rem calc(0.65rem + env(safe-area-inset-bottom))',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(7,10,16,0.94)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  attachmentToolbar: {
    display: 'flex',
    gap: '0.35rem',
    overflowX: 'auto',
    marginBottom: '0.55rem',
    paddingBottom: '0.15rem',
  },

  composerTool: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    flexShrink: 0,
    padding: '0.45rem 0.58rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#dbe5f8',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.68rem',
    cursor: 'pointer',
  },

  composerRow: {
    display: 'grid',
    gridTemplateColumns: 'auto auto minmax(0, 1fr) auto auto auto',
    gap: '0.35rem',
    alignItems: 'center',
  },

  composerIconButton: {
    width: '2.4rem',
    height: '2.4rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#dce5f7',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  recordingButton: {
    color: '#ffffff',
    background: '#ff4f7a',
    borderColor: '#ff4f7a',
  },

  composerInput: {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    padding: '0.73rem 0.85rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    outline: 0,
    color: '#ffffff',
    background: 'rgba(255,255,255,0.065)',
    fontSize: '0.84rem',
  },

  sendButton: {
    width: '2.4rem',
    height: '2.4rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    cursor: 'pointer',
  },

  infoSection: {
    marginTop: '1rem',
    padding: '0.9rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '1.15rem',
    background: 'rgba(255,255,255,0.04)',
  },

  infoSectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.65rem',
  },

  infoTitle: {
    margin: 0,
    color: '#f1f5ff',
    fontSize: '0.9rem',
    fontWeight: 900,
  },

  infoSubtitle: {
    margin: '0.25rem 0 0',
    color: '#8f9db8',
    fontSize: '0.7rem',
  },

  systemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.45rem',
    marginTop: '0.75rem',
  },

  systemCard: {
    display: 'grid',
    gap: '0.35rem',
    minHeight: '3.7rem',
    alignContent: 'space-between',
    padding: '0.62rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.8rem',
    color: '#dce5f5',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '0.7rem',
    fontWeight: 750,
  },

  systemStatus: (status) => ({
    width: 'fit-content',
    padding: '0.22rem 0.4rem',
    borderRadius: '999px',
    color: '#ffffff',
    background:
      status === 'Active'
        ? 'rgba(61,242,168,0.14)'
        : status === 'Protected'
          ? 'rgba(124,92,255,0.17)'
          : 'rgba(77,215,255,0.14)',
    fontSize: '0.61rem',
    fontWeight: 850,
  }),

  futureCard: {
    display: 'grid',
    gap: '0.35rem',
    minHeight: '3.7rem',
    alignContent: 'space-between',
    padding: '0.62rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.8rem',
    color: '#c7d2e6',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))',
    fontSize: '0.7rem',
    fontWeight: 750,
  },

  previewOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'grid',
    placeItems: 'center',
    padding: '1rem',
    background: 'rgba(0,0,0,0.86)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  },

  previewPanel: {
    width: 'min(100%, 720px)',
    maxHeight: '90dvh',
    overflow: 'auto',
    padding: '0.85rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1.25rem',
    background: '#111827',
    boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
  },

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    color: '#ffffff',
  },

  modalCloseButton: {
    width: '2.1rem',
    height: '2.1rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  fullscreenImage: {
    display: 'block',
    width: '100%',
    maxHeight: '72dvh',
    marginTop: '0.8rem',
    objectFit: 'contain',
    borderRadius: '0.9rem',
  },

  fullscreenVideo: {
    display: 'block',
    width: '100%',
    maxHeight: '72dvh',
    marginTop: '0.8rem',
    borderRadius: '0.9rem',
  },

  genericPreview: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.6rem',
    padding: '4rem 1rem',
    color: '#b9c5da',
    textAlign: 'center',
  },

  downloadLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    marginTop: '0.8rem',
    color: '#a9edff',
    fontSize: '0.78rem',
    textDecoration: 'none',
  },

  sheetOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 90,
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
    maxHeight: '82dvh',
    overflow: 'auto',
    padding: '0.85rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1.35rem',
    background: 'linear-gradient(180deg, #171d2d, #0e1320)',
    boxShadow: '0 28px 80px rgba(0,0,0,0.52)',
  },

  conversationMenu: {
    width: 'min(100%, 520px)',
    maxHeight: '84dvh',
    overflow: 'auto',
    padding: '0.85rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1.35rem',
    background: 'linear-gradient(180deg, #171d2d, #0e1320)',
    boxShadow: '0 28px 80px rgba(0,0,0,0.52)',
  },

  sheetHandle: {
    width: '2.5rem',
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

  sheetHeaderSpan: {
    display: 'block',
    marginTop: '0.22rem',
    color: '#8f9db8',
    fontSize: '0.7rem',
  },

  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
    color: '#e5ebf8',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '0.7rem',
    fontWeight: 750,
    textAlign: 'left',
    cursor: 'pointer',
  },

  actionIcon: {
    width: '1.85rem',
    height: '1.85rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#cfc6ff',
    background: 'rgba(124,92,255,0.16)',
  },

  menuList: {
    display: 'grid',
    gap: '0.38rem',
  },

  menuItem: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '0.6rem',
    minHeight: '2.65rem',
    padding: '0.58rem 0.62rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.75rem',
    color: '#e8eefb',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '0.73rem',
    fontWeight: 750,
    textAlign: 'left',
    cursor: 'pointer',
  },

  menuArrow: {
    color: '#8290aa',
    fontSize: '1.1rem',
  },

  dialogOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 95,
    display: 'grid',
    placeItems: 'center',
    padding: '1rem',
    background: 'rgba(0,0,0,0.68)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  dialog: {
    width: 'min(100%, 500px)',
    maxHeight: '86dvh',
    overflow: 'auto',
    padding: '0.9rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1.25rem',
    background: 'linear-gradient(180deg, #171d2d, #0e1320)',
    boxShadow: '0 28px 80px rgba(0,0,0,0.52)',
  },

  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    marginBottom: '0.8rem',
    color: '#ffffff',
  },

  dialogList: {
    display: 'grid',
    gap: '0.4rem',
  },

  dialogListItem: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '0.55rem',
    padding: '0.7rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.75rem',
    color: '#e6edf9',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '0.78rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  wallpaperGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.55rem',
  },

  wallpaperChoice: {
    minHeight: '5.2rem',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: '0.65rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.9rem',
    color: '#ffffff',
    textAlign: 'left',
    fontSize: '0.72rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  aiActionGrid: {
    display: 'grid',
    gap: '0.45rem',
  },

  aiActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.7rem',
    border: '1px solid rgba(124,92,255,0.17)',
    borderRadius: '0.75rem',
    color: '#e8e2ff',
    background: 'rgba(124,92,255,0.08)',
    fontSize: '0.76rem',
    fontWeight: 750,
    textAlign: 'left',
    cursor: 'pointer',
  },

  dialogText: {
    margin: 0,
    color: '#aebbd0',
    fontSize: '0.82rem',
    lineHeight: 1.6,
  },

  dialogPrimaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '1rem',
    padding: '0.7rem',
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontWeight: 850,
    cursor: 'pointer',
  },

  dialogSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.62rem 0.7rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.8rem',
    color: '#aab8cf',
    background: 'rgba(255,255,255,0.05)',
  },

  dialogSearchInput: {
    flex: 1,
    border: 0,
    outline: 0,
    color: '#ffffff',
    background: 'transparent',
    fontSize: '0.78rem',
  },

  searchResults: {
    display: 'grid',
    gap: '0.4rem',
    marginTop: '0.7rem',
  },

  searchResult: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    padding: '0.62rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.7rem',
    color: '#e4ebf8',
    background: 'rgba(255,255,255,0.04)',
    fontSize: '0.75rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  noResults: {
    padding: '1rem',
    color: '#8e9bb4',
    fontSize: '0.78rem',
    textAlign: 'center',
  },
};