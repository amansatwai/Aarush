import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Archive,
  Ban,
  Camera,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  Copy,
  Edit3,
  FileText,
  Flag,
  Forward,
  Image as ImageIcon,
  Link2,
  LockKeyhole,
  MailPlus,
  Mic,
  MicOff,
  MoreHorizontal,
  MessageCircle,
  MessagesSquare,
  Phone,
  Pin,
  Reply,
  Search,
  Send,
  Settings2,
  Shield,
  Smile,
  Speaker,
  SquareSlash,
  Star,
  Sticker,
  Trash2,
  Video,
  Volume2,
  VolumeX,
  Wifi,
  X,
  Users,
  Sparkles,
  Bot,
  Eye,
  EyeOff,
  EllipsisVertical,
} from 'lucide-react';

const chatUsers = [
  {
    id: 'chat-1',
    username: 'arush.dev',
    verified: true,
    lastMessage: 'Ship the Home feed today?',
    lastMessageTime: '2m',
    unreadCount: 3,
    online: true,
    typing: true,
    pinned: true,
    archived: false,
    muted: false,
    avatarColor: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    isGroup: false,
    description: 'Developer account for Aarush project',
  },
  {
    id: 'chat-2',
    username: 'design.loop',
    verified: false,
    lastMessage: 'I sent the updated carousel mockups.',
    lastMessageTime: '18m',
    unreadCount: 0,
    online: false,
    typing: false,
    pinned: false,
    archived: false,
    muted: true,
    avatarColor: 'linear-gradient(135deg, #ff4fd8, #7c5cff)',
    isGroup: false,
    description: 'Product design and motion',
  },
  {
    id: 'chat-3',
    username: 'Aarush Team',
    verified: true,
    lastMessage: 'New build review at 8 PM.',
    lastMessageTime: '31m',
    unreadCount: 8,
    online: true,
    typing: false,
    pinned: false,
    archived: false,
    muted: false,
    avatarColor: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
    isGroup: true,
    description: 'Core team planning and build updates',
  },
  {
    id: 'chat-4',
    username: 'video.studio',
    verified: true,
    lastMessage: 'Can you test the reels preview screen?',
    lastMessageTime: '1h',
    unreadCount: 0,
    online: false,
    typing: false,
    pinned: false,
    archived: true,
    muted: false,
    avatarColor: 'linear-gradient(135deg, #ffb347, #ff4fd8)',
    isGroup: false,
    description: 'Video and short-form experiments',
  },
];

const conversationMap = {
  'chat-1': [
    {
      id: 'm1',
      sender: 'them',
      type: 'text',
      text: 'Ship the Home feed today?',
      time: '2:12 PM',
      sent: true,
      delivered: true,
      seen: true,
      reaction: '🔥',
    },
    {
      id: 'm2',
      sender: 'me',
      type: 'text',
      text: 'Yes, I am finishing the final pass on TopBar and BottomNav.',
      time: '2:13 PM',
      sent: true,
      delivered: true,
      seen: true,
      reaction: null,
    },
    {
      id: 'm3',
      sender: 'them',
      type: 'image',
      text: 'Preview screenshot attached.',
      time: '2:14 PM',
      sent: true,
      delivered: true,
      seen: false,
      image:
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'm4',
      sender: 'me',
      type: 'voice',
      text: 'Voice message',
      time: '2:16 PM',
      sent: true,
      delivered: true,
      seen: false,
      duration: '0:18',
    },
  ],
  'chat-2': [
    {
      id: 'd1',
      sender: 'them',
      type: 'text',
      text: 'I sent the updated carousel mockups.',
      time: '1:42 PM',
      sent: true,
      delivered: true,
      seen: true,
    },
    {
      id: 'd2',
      sender: 'me',
      type: 'text',
      text: 'Great, I will plug them into the Home screen after this pass.',
      time: '1:45 PM',
      sent: true,
      delivered: true,
      seen: true,
    },
  ],
  'chat-3': [
    {
      id: 'g1',
      sender: 'them',
      type: 'text',
      text: 'New build review at 8 PM.',
      time: '12:20 PM',
      sent: true,
      delivered: true,
      seen: true,
    },
    {
      id: 'g2',
      sender: 'me',
      type: 'text',
      text: '@team Please check the latest HomeFeed and Chats page structure.',
      time: '12:24 PM',
      sent: true,
      delivered: true,
      seen: true,
    },
  ],
  'chat-4': [
    {
      id: 'v1',
      sender: 'them',
      type: 'text',
      text: 'Can you test the reels preview screen?',
      time: '11:04 AM',
      sent: true,
      delivered: true,
      seen: true,
    },
    {
      id: 'v2',
      sender: 'me',
      type: 'file',
      text: 'ReelsPreviewNotes.pdf',
      time: '11:08 AM',
      sent: true,
      delivered: true,
      seen: false,
      fileSize: '2.4 MB',
    },
  ],
};

const quickCalls = [
  { label: 'Voice call', icon: Phone },
  { label: 'Video call', icon: Video },
  { label: 'Group call', icon: Users },
  { label: 'Call history', icon: Clock3 },
  { label: 'Screen share', icon: Sparkles },
  { label: 'Call link', icon: Link2 },
];

function Avatar({ user }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '3.05rem',
        height: '3.05rem',
        borderRadius: '999px',
        padding: '2.5px',
        background: user.avatarColor || 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
        boxShadow: '0 0 18px rgba(124,92,255,0.16)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: '0.95rem',
          background: 'linear-gradient(135deg, rgba(16,20,31,0.98), rgba(27,34,53,0.98))',
        }}
      >
        {user.isGroup ? 'G' : user.username?.[0]?.toUpperCase() || 'A'}
      </div>

      {user.online ? (
        <span
          style={{
            position: 'absolute',
            right: '0.1rem',
            bottom: '0.1rem',
            width: '0.72rem',
            height: '0.72rem',
            borderRadius: '999px',
            background: '#3df2a8',
            border: '2px solid #0c111b',
            boxShadow: '0 0 10px rgba(61,242,168,0.45)',
          }}
        />
      ) : null}
    </div>
  );
}

function MessageBubble({ message, isMe, onOpenMenu }) {
  return (
    <div style={{ display: 'grid', justifyItems: isMe ? 'end' : 'start', gap: '0.22rem' }}>
      <div
        style={{
          maxWidth: '78%',
          borderRadius: '1.15rem',
          padding: '0.82rem 0.9rem',
          background: isMe
            ? 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))'
            : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#f4f7ff',
          boxShadow: isMe ? '0 14px 28px rgba(124,92,255,0.14)' : 'none',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={() => onOpenMenu(message)}
          aria-label="Open message actions"
          style={{
            position: 'absolute',
            top: '0.35rem',
            right: isMe ? '0.35rem' : 'auto',
            left: isMe ? 'auto' : '0.35rem',
            width: '1.75rem',
            height: '1.75rem',
            border: '0',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <EllipsisVertical size={14} />
        </button>

        {message.type === 'text' ? (
          <p style={{ margin: 0, paddingTop: '0.35rem', lineHeight: 1.55, fontSize: '0.92rem' }}>{message.text}</p>
        ) : null}

        {message.type === 'image' ? (
          <div style={{ display: 'grid', gap: '0.45rem', paddingTop: '0.35rem' }}>
            <img
              src={message.image}
              alt="Shared media"
              style={{
                width: '100%',
                maxWidth: '18rem',
                aspectRatio: '4 / 3',
                objectFit: 'cover',
                borderRadius: '0.9rem',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
            <span style={{ fontSize: '0.88rem', color: '#dce5f8' }}>{message.text}</span>
          </div>
        ) : null}

        {message.type === 'video' ? (
          <div style={{ display: 'grid', gap: '0.45rem', paddingTop: '0.35rem' }}>
            <div
              style={{
                width: '100%',
                maxWidth: '18rem',
                aspectRatio: '4 / 3',
                borderRadius: '0.9rem',
                background: 'linear-gradient(135deg, rgba(16,20,31,1), rgba(27,34,53,1))',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Video size={24} />
            </div>
            <span style={{ fontSize: '0.88rem', color: '#dce5f8' }}>{message.text}</span>
          </div>
        ) : null}

        {message.type === 'voice' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.35rem' }}>
            <span
              style={{
                width: '2.2rem',
                height: '2.2rem',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Mic size={15} />
            </span>
            <div style={{ display: 'grid', gap: '0.15rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{message.text}</span>
              <span style={{ fontSize: '0.78rem', color: '#aab4cb' }}>{message.duration}</span>
            </div>
          </div>
        ) : null}

        {message.type === 'file' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingTop: '0.35rem' }}>
            <span
              style={{
                width: '2.35rem',
                height: '2.35rem',
                borderRadius: '0.85rem',
                background: 'rgba(255,255,255,0.08)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <FileText size={15} />
            </span>
            <div style={{ display: 'grid', gap: '0.12rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{message.text}</span>
              <span style={{ fontSize: '0.78rem', color: '#aab4cb' }}>{message.fileSize}</span>
            </div>
          </div>
        ) : null}

        {message.reaction ? (
          <div
            style={{
              position: 'absolute',
              bottom: '-0.6rem',
              right: isMe ? '0.8rem' : 'auto',
              left: isMe ? 'auto' : '0.8rem',
              width: '1.3rem',
              height: '1.3rem',
              borderRadius: '999px',
              background: 'rgba(0,0,0,0.72)',
              display: 'grid',
              placeItems: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {message.reaction}
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#95a0bc', fontSize: '0.74rem' }}>
        <span>{message.time}</span>
        {isMe ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            {message.sent ? <Check size={12} /> : <Clock3 size={12} />}
            {message.delivered ? <CheckCheck size={12} /> : null}
            {message.seen ? <CheckCheck size={12} color="#4dd7ff" /> : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ActionChip({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.05)',
        color: '#f3f6ff',
        borderRadius: '1rem',
        padding: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
        }}
      >
        <Icon size={14} />
      </span>
      <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>{label}</span>
    </button>
  );
}

export default function ChatsPage() {
  const navigate = useNavigate();
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [menuMessage, setMenuMessage] = useState(null);

  const activeUser = chatUsers.find((user) => user.id === activeChatId) || chatUsers[0];
  const messages = conversationMap[activeChatId] || [];

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return chatUsers;
    return chatUsers.filter((chat) => {
      const haystack = [
        chat.username,
        chat.lastMessage,
        chat.description,
        chat.isGroup ? 'group' : 'user',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [search]);

  const chatSettings = [
    { label: activeUser.pinned ? 'Unpin chat' : 'Pin chat', icon: Pin },
    { label: activeUser.archived ? 'Unarchive chat' : 'Archive chat', icon: Archive },
    { label: activeUser.muted ? 'Unmute notifications' : 'Mute notifications', icon: VolumeX },
    { label: 'Change chat wallpaper', icon: Sparkles },
    { label: 'Disappearing messages', icon: Clock3 },
    { label: 'Read receipts', icon: CheckCheck },
    { label: 'Typing indicator show/hide', icon: MessageCircle },
    { label: 'Online status show/hide', icon: Wifi },
    { label: 'Last seen show/hide', icon: Eye },
    { label: 'Block user', icon: Ban },
    { label: 'Report user', icon: Flag },
    { label: 'Export chat', icon: FileText },
    { label: 'Clear chat', icon: Trash2 },
    { label: 'Delete chat', icon: SquareSlash },
  ];

  const menuActions = [
    { label: 'Reply', icon: Reply },
    { label: 'Forward', icon: Forward },
    { label: 'Delete for everyone', icon: Trash2 },
    { label: 'Delete for me', icon: X },
    { label: 'Copy message', icon: Copy },
    { label: 'Edit message', icon: Edit3 },
    { label: 'Reactions', icon: Smile },
  ];

  const styles = {
    page: {
      minHeight: '100vh',
      background:
        'radial-gradient(circle at top, rgba(34, 43, 68, 0.45) 0%, rgba(10, 13, 20, 1) 38%, rgba(7, 9, 14, 1) 100%)',
      color: '#f4f7ff',
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      paddingBottom: '0',
    },
    topBar: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'rgba(9, 12, 19, 0.9)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    topInner: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0.8rem 0.9rem',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center',
      gap: '0.7rem',
    },
    iconBtn: {
      width: '2.75rem',
      height: '2.75rem',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
    },
    titleBlock: {
      minWidth: 0,
      display: 'grid',
      justifyItems: 'center',
      gap: '0.2rem',
    },
    title: {
      margin: 0,
      fontSize: '1rem',
      fontWeight: 900,
      letterSpacing: '0.01em',
    },
    subtitle: {
      margin: 0,
      color: '#94a0bb',
      fontSize: '0.78rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
    },
    layout: {
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto',
      padding: '0.9rem',
      display: 'grid',
      gridTemplateColumns: '1.05fr 1.6fr',
      gap: '0.9rem',
      minHeight: 'calc(100vh - 4.5rem)',
    },
    panel: {
      background: 'rgba(15, 19, 30, 0.9)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '1.35rem',
      boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      overflow: 'hidden',
    },
    leftPanel: {
      display: 'grid',
      gridTemplateRows: 'auto auto auto 1fr',
      minHeight: '0',
    },
    searchBox: {
      margin: '0.9rem',
      borderRadius: '1rem',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.55rem',
      padding: '0.8rem 0.9rem',
      color: '#98a4c2',
    },
    searchInput: {
      flex: 1,
      border: 0,
      outline: 0,
      background: 'transparent',
      color: '#fff',
      fontSize: '0.9rem',
    },
    list: {
      display: 'grid',
      gap: '0.45rem',
      padding: '0 0.9rem 0.9rem',
      overflowY: 'auto',
    },
    chatItem: (active) => ({
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: '0.75rem',
      alignItems: 'center',
      borderRadius: '1.1rem',
      padding: '0.8rem',
      border: '1px solid ' + (active ? 'rgba(124,92,255,0.24)' : 'rgba(255,255,255,0.06)'),
      background: active
        ? 'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(77,215,255,0.08))'
        : 'rgba(255,255,255,0.04)',
      cursor: 'pointer',
      transition: 'transform 180ms ease, background 180ms ease, border-color 180ms ease',
    }),
    itemText: {
      minWidth: 0,
      display: 'grid',
      gap: '0.22rem',
    },
    itemTop: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.45rem',
      minWidth: 0,
      flexWrap: 'wrap',
    },
    username: {
      fontSize: '0.92rem',
      fontWeight: 800,
      color: '#f6f8ff',
    },
    metaLine: {
      color: '#98a4c2',
      fontSize: '0.8rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    unreadBadge: {
      minWidth: '1.35rem',
      height: '1.35rem',
      borderRadius: '999px',
      background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
      color: '#fff',
      display: 'inline-grid',
      placeItems: 'center',
      fontSize: '0.72rem',
      fontWeight: 900,
      padding: '0 0.3rem',
    },
    rightPanel: {
      display: 'grid',
      gridTemplateRows: 'auto auto 1fr auto',
      minHeight: '0',
    },
    convoHeader: {
      padding: '0.9rem',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
    },
    convoInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      minWidth: 0,
    },
    convoMeta: {
      minWidth: 0,
      display: 'grid',
      gap: '0.18rem',
    },
    convoTitle: {
      fontSize: '0.95rem',
      fontWeight: 900,
      color: '#f6f8ff',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      flexWrap: 'wrap',
    },
    convoDesc: {
      margin: 0,
      color: '#95a0bc',
      fontSize: '0.8rem',
      lineHeight: 1.45,
    },
    convoActions: {
      display: 'flex',
      gap: '0.45rem',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
    convoBody: {
      padding: '0.9rem',
      overflowY: 'auto',
      display: 'grid',
      gap: '0.8rem',
      alignContent: 'start',
    },
    composer: {
      padding: '0.9rem',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'grid',
      gap: '0.7rem',
    },
    composerRow: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: '0.6rem',
      alignItems: 'center',
    },
    composerInput: {
      width: '100%',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#fff',
      outline: 'none',
      padding: '0.82rem 0.95rem',
      fontSize: '0.9rem',
    },
    sendBtn: {
      border: 0,
      borderRadius: '999px',
      width: '2.9rem',
      height: '2.9rem',
      background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      boxShadow: '0 10px 22px rgba(124,92,255,0.18)',
    },
    composerTools: {
      display: 'flex',
      gap: '0.45rem',
      flexWrap: 'wrap',
    },
    toolBtn: {
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#f4f7ff',
      borderRadius: '999px',
      padding: '0.6rem 0.8rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: 700,
    },
    infoBanner: {
      margin: '0.9rem',
      padding: '0.8rem 0.9rem',
      borderRadius: '1rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.06)',
      color: '#d9e2f4',
      fontSize: '0.84rem',
      lineHeight: 1.55,
    },
    menuOverlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 1200,
      background: 'rgba(2,5,10,0.64)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'grid',
      placeItems: 'center',
      padding: '1rem',
    },
    menuPanel: {
      width: 'min(100%, 420px)',
      borderRadius: '1.4rem',
      background: 'linear-gradient(180deg, rgba(15,19,30,0.98), rgba(11,15,24,0.98))',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
      padding: '0.9rem',
    },
    menuList: {
      display: 'grid',
      gap: '0.45rem',
      marginTop: '0.75rem',
    },
    menuItem: {
      width: '100%',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#f2f6ff',
      borderRadius: '1rem',
      padding: '0.88rem 0.95rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.7rem',
      textAlign: 'left',
      cursor: 'pointer',
      fontSize: '0.88rem',
      fontWeight: 700,
    },
    emptyState: {
      padding: '2rem 1rem',
      textAlign: 'center',
      color: '#9aa5be',
      fontSize: '0.92rem',
      lineHeight: 1.6,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.topInner}>
          <button type="button" onClick={() => navigate('/home')} style={styles.iconBtn} aria-label="Back to home">
            <ArrowLeft size={18} />
          </button>

          <div style={styles.titleBlock}>
            <h1 style={styles.title}>Chats</h1>
            <p style={styles.subtitle}>
              <LockKeyhole size={12} />
              End-to-end ready messaging space
            </p>
          </div>

          <button type="button" style={styles.iconBtn} aria-label="New chat">
            <MailPlus size={18} />
          </button>
        </div>
      </div>

      <div style={styles.layout}>
        <aside style={{ ...styles.panel, ...styles.leftPanel }}>
          <div style={styles.searchBox}>
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats, users, groups, messages"
              style={styles.searchInput}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              padding: '0 0.9rem 0.9rem',
            }}
          >
            <button type="button" onClick={() => setViewMode('list')} style={styles.toolBtn}>
              <MessagesSquare size={14} /> Chats
            </button>
            <button type="button" onClick={() => setViewMode('calls')} style={styles.toolBtn}>
              <Phone size={14} /> Calls
            </button>
            <button type="button" onClick={() => setViewMode('settings')} style={styles.toolBtn}>
              <Settings2 size={14} /> Settings
            </button>
          </div>

          <div style={styles.infoBanner}>
            Modern chat list with pinned, archived, muted, unread, typing, online, and group conversation support.
          </div>

          <div style={styles.list}>
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => {
                  setActiveChatId(chat.id);
                  setViewMode('conversation');
                }}
                style={styles.chatItem(activeChatId === chat.id)}
              >
                <Avatar user={chat} />

                <div style={styles.itemText}>
                  <div style={styles.itemTop}>
                    <span style={styles.username}>{chat.username}</span>
                    {chat.verified ? (
                      <span
                        style={{
                          width: '1.05rem',
                          height: '1.05rem',
                          borderRadius: '999px',
                          background: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
                          color: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 900,
                        }}
                      >
                        ✓
                      </span>
                    ) : null}
                    {chat.isGroup ? (
                      <span
                        style={{
                          padding: '0.2rem 0.45rem',
                          borderRadius: '999px',
                          background: 'rgba(124,92,255,0.16)',
                          color: '#d9e2ff',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                        }}
                      >
                        Group
                      </span>
                    ) : null}
                  </div>

                  <div style={styles.metaLine}>
                    {chat.typing ? 'Typing… ' : ''}
                    {chat.lastMessage}
                  </div>
                </div>

                <div style={{ display: 'grid', justifyItems: 'end', gap: '0.35rem' }}>
                  <span style={{ color: '#8ea0c2', fontSize: '0.75rem', fontWeight: 700 }}>{chat.lastMessageTime}</span>
                  {chat.unreadCount ? <span style={styles.unreadBadge}>{chat.unreadCount}</span> : null}
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', color: '#8ea0c2' }}>
                    {chat.pinned ? <Pin size={12} /> : null}
                    {chat.archived ? <Archive size={12} /> : null}
                    {chat.muted ? <VolumeX size={12} /> : null}
                    {chat.online ? <Wifi size={12} /> : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section style={{ ...styles.panel, ...styles.rightPanel }}>
          <div style={styles.convoHeader}>
            <div style={styles.convoInfo}>
              <Avatar user={activeUser} />
              <div style={styles.convoMeta}>
                <div style={styles.convoTitle}>
                  {activeUser.username}
                  {activeUser.verified ? (
                    <span
                      style={{
                        width: '1.05rem',
                        height: '1.05rem',
                        borderRadius: '999px',
                        background: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                  ) : null}
                  {activeUser.isGroup ? (
                    <span
                      style={{
                        padding: '0.22rem 0.45rem',
                        borderRadius: '999px',
                        background: 'rgba(124,92,255,0.16)',
                        color: '#d9e2ff',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                      }}
                    >
                      Admin badge
                    </span>
                  ) : null}
                </div>
                <p style={styles.convoDesc}>
                  {activeUser.isGroup
                    ? 'Group conversation with member controls, media, files, polls, and events.'
                    : '1:1 encrypted-ready chat with reactions, replies, and privacy controls.'}
                </p>
              </div>
            </div>

            <div style={styles.convoActions}>
              {quickCalls.map((call) => (
                <button key={call.label} type="button" style={styles.iconBtn} title={call.label} aria-label={call.label}>
                  <call.icon size={16} />
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: '0.8rem 0.9rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span
              style={{
                padding: '0.32rem 0.55rem',
                borderRadius: '999px',
                background: 'rgba(77,215,255,0.12)',
                color: '#d8f7ff',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <LockKeyhole size={12} /> E2E indicator
            </span>
            <span
              style={{
                padding: '0.32rem 0.55rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.06)',
                color: '#dfe7fb',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              {activeUser.online ? 'Online' : 'Last seen 12m ago'}
            </span>
            {activeUser.typing ? (
              <span
                style={{
                  padding: '0.32rem 0.55rem',
                  borderRadius: '999px',
                  background: 'rgba(124,92,255,0.16)',
                  color: '#d9e2ff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                }}
              >
                Typing indicator
              </span>
            ) : null}
            <span
              style={{
                padding: '0.32rem 0.55rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.06)',
                color: '#dfe7fb',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              Ghost mode placeholder
            </span>
          </div>

          {viewMode === 'settings' ? (
            <div style={{ padding: '0.9rem', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                <SectionTitle icon={Settings2} title="Chat settings" />
                <div style={{ display: 'grid', gap: '0.55rem' }}>
                  {chatSettings.map((item) => (
                    <button key={item.label} type="button" style={styles.menuItem}>
                      <item.icon size={16} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                </div>

                <SectionTitle icon={Phone} title="Calls" />
                <div style={{ display: 'grid', gap: '0.55rem' }}>
                  {quickCalls.map((call) => (
                    <button key={call.label} type="button" style={styles.menuItem}>
                      <call.icon size={16} />
                      <span style={{ flex: 1 }}>{call.label}</span>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === 'calls' ? (
            <div style={{ padding: '0.9rem', overflowY: 'auto' }}>
              <SectionTitle icon={Phone} title="Calls" />
              <div style={{ display: 'grid', gap: '0.55rem' }}>
                {quickCalls.map((call) => (
                  <button key={call.label} type="button" style={styles.menuItem}>
                    <call.icon size={16} />
                    <span style={{ flex: 1 }}>{call.label}</span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>

              <div style={{ marginTop: '0.9rem' }}>
                <SectionTitle icon={Users} title="Call placeholders" />
                <div style={{ display: 'grid', gap: '0.55rem' }}>
                  <button type="button" style={styles.menuItem}>
                    <Speaker size={16} />
                    <span style={{ flex: 1 }}>Speaker</span>
                  </button>
                  <button type="button" style={styles.menuItem}>
                    <Mic size={16} />
                    <span style={{ flex: 1 }}>Mute / unmute</span>
                  </button>
                  <button type="button" style={styles.menuItem}>
                    <Camera size={16} />
                    <span style={{ flex: 1 }}>Camera switch</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={styles.convoBody}>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isMe={message.sender === 'me'}
                    onOpenMenu={(msg) => setMenuMessage(msg)}
                  />
                ))}

                {activeUser.typing ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '999px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      width: 'fit-content',
                      color: '#d9e2f4',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: '0.55rem',
                        height: '0.55rem',
                        borderRadius: '999px',
                        background: '#4dd7ff',
                        boxShadow: '0 0 10px rgba(77,215,255,0.4)',
                      }}
                    />
                    Typing…
                  </div>
                ) : null}
              </div>

              <div style={styles.composer}>
                <div style={styles.composerTools}>
                  <button type="button" style={styles.toolBtn}>
                    <Smile size={14} /> Emoji
                  </button>
                  <button type="button" style={styles.toolBtn}>
                    <Sticker size={14} /> Sticker
                  </button>
                  <button type="button" style={styles.toolBtn}>
                    <ImageIcon size={14} /> Image
                  </button>
                  <button type="button" style={styles.toolBtn}>
                    <Video size={14} /> Video
                  </button>
                  <button type="button" style={styles.toolBtn}>
                    <FileText size={14} /> File
                  </button>
                  <button type="button" style={styles.toolBtn}>
                    <Mic size={14} /> Voice
                  </button>
                </div>

                <div style={styles.composerRow}>
                  <button type="button" style={styles.toolBtn} aria-label="Reply">
                    <Reply size={14} /> Reply
                  </button>
                  <input type="text" placeholder="Message…" style={styles.composerInput} />
                  <button type="button" style={styles.sendBtn} aria-label="Send message">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {menuMessage ? (
        <div
          style={styles.menuOverlay}
          onClick={() => setMenuMessage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Message actions"
        >
          <div style={styles.menuPanel} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Message actions</strong>
                <div style={{ color: '#92a0bf', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  {menuMessage.text || menuMessage.fileSize || 'Selected message'}
                </div>
              </div>
              <button type="button" onClick={() => setMenuMessage(null)} style={styles.iconBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.menuList}>
              {menuActions.map((item) => (
                <button key={item.label} type="button" style={styles.menuItem}>
                  <item.icon size={16} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
      <span
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon size={14} />
      </span>
      <strong style={{ fontSize: '0.92rem' }}>{title}</strong>
    </div>
  );
}