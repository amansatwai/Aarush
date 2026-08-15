import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  Edit3,
  File,
  Image as ImageIcon,
  Info,
  LockKeyhole,
  MessageCircle,
  MessageSquarePlus,
  Mic,
  MoreHorizontal,
  Phone,
  Pin,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Smile,
  Star,
  Trash2,
  Users,
  Video,
  VolumeX,
  X,
} from 'lucide-react';

const MODULES = [
  ['inbox', 'Inbox', MessageCircle],
  ['direct', 'Direct Messages', Send],
  ['groups', 'Groups', Users],
  ['channels', 'Channels', RadioIcon],
  ['communities', 'Communities', GlobeIcon],
  ['calls', 'Calls', Phone],
  ['ai', 'AI Chats', SparkleIcon],
  ['business', 'Business Chats', BriefcaseIcon],
  ['archive', 'Archive', Archive],
];

function numeric(value) {
  return Number(value) || 0;
}

function normalizeChat(chat, index) {
  return {
    ...chat,
    id: chat?.id || `chat-${index}`,
    name:
      chat?.name ||
      chat?.title ||
      chat?.username ||
      'Conversation',
    lastMessage:
      chat?.lastMessage ||
      chat?.last_message ||
      'No messages yet',
    timestamp: chat?.timestamp || chat?.updatedAt || '',
    unread: numeric(chat?.unread || chat?.unreadCount),
    pinned: Boolean(chat?.pinned),
    muted: Boolean(chat?.muted),
    online: Boolean(chat?.online),
    type: chat?.type || 'direct',
  };
}

function normalizeMessage(message, index) {
  return {
    ...message,
    id: message?.id || `message-${index}`,
    text:
      message?.text ||
      message?.content ||
      message?.message ||
      '',
    sender:
      message?.sender ||
      message?.senderName ||
      'Contact',
    mine: Boolean(
      message?.mine ||
        message?.isMine ||
        message?.senderId === message?.currentUserId
    ),
    timestamp: message?.timestamp || message?.createdAt || '',
    status: message?.status || 'read',
  };
}

function formatTime(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function SectionTitle({ title, subtitle, icon: Icon, action }) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      {action || <Icon size={18} color="#4dd7ff" />}
    </div>
  );
}

export default function MessagingHub({
  currentUser = {},
  chats = [],
  messages = [],
  groups = [],
  channels = [],
  calls = [],
  contacts = [],
  notifications = [],
  searchResults = [],
  onOpenChat,
  onSendMessage,
  onStartCall,
  onCreateGroup,
  onCreateChannel,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('inbox');
  const [selectedChat, setSelectedChat] =
    useState(null);
  const [search, setSearch] = useState('');
  const [messageInput, setMessageInput] =
    useState('');
  const [localMessages, setLocalMessages] =
    useState([]);
  const [notice, setNotice] = useState('');
  const [typing, setTyping] = useState(false);
  const [disappearingTimer, setDisappearingTimer] =
    useState('Off');
  const [readReceipts, setReadReceipts] =
    useState(true);
  const [lastSeen, setLastSeen] = useState(true);
  const [composerMode, setComposerMode] =
    useState('message');
  const messageEndRef = useRef(null);

  const normalizedChats = useMemo(
    () => chats.map(normalizeChat),
    [chats]
  );

  const visibleChats = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return normalizedChats;

    return normalizedChats.filter((chat) =>
      [
        chat.name,
        chat.lastMessage,
        chat.type,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [normalizedChats, search]);

  const selectedMessages = useMemo(() => {
    const sourceId = selectedChat?.id;

    return [
      ...messages
        .filter(
          (message) =>
            !sourceId ||
            message.chatId === sourceId ||
            message.conversationId === sourceId
        )
        .map(normalizeMessage),
      ...localMessages.filter(
        (message) =>
          !sourceId || message.chatId === sourceId
      ),
    ];
  }, [localMessages, messages, selectedChat?.id]);

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [selectedMessages.length]);

  const openChat = (chat) => {
    setSelectedChat(chat);
    onOpenChat?.(chat);
  };

  const sendMessage = async () => {
    const text = messageInput.trim();

    if (!text || !selectedChat) return;

    const outgoing = {
      id: `local-${Date.now()}`,
      chatId: selectedChat.id,
      sender:
        currentUser.name ||
        currentUser.username ||
        'You',
      senderId: currentUser.id,
      text,
      mine: true,
      status: 'sent',
      timestamp: new Date().toISOString(),
    };

    setLocalMessages((current) => [
      ...current,
      outgoing,
    ]);
    setMessageInput('');

    await onSendMessage?.({
      chatId: selectedChat.id,
      message: text,
      status: 'sent',
      encryption: 'foundation',
      disappearingTimer,
      translation: composerMode === 'translate',
    });

    showNotice('Message sent.');
  };

  const createGroup = () => {
    onCreateGroup?.({
      name: 'New Aarush Group',
      createdBy: currentUser.id,
      permissions: 'standard',
    });
    showNotice('Group creation prepared.');
  };

  const createChannel = () => {
    onCreateChannel?.({
      name: 'New Aarush Channel',
      createdBy: currentUser.id,
      mode: 'broadcast',
    });
    showNotice('Channel creation prepared.');
  };

  const renderInbox = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Inbox"
        subtitle="Unified conversations across Aarush."
        icon={MessageCircle}
        action={
          <button
            type="button"
            onClick={() => showNotice('New message flow opened.')}
            style={styles.smallPrimary}
          >
            <MessageSquarePlus size={14} />
            New message
          </button>
        }
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search chats and messages"
          aria-label="Search chats and messages"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.chatList}>
        {visibleChats.length ? (
          visibleChats.map((chat) => (
            <ChatRow
              key={chat.id}
              chat={chat}
              selected={selectedChat?.id === chat.id}
              onClick={() => openChat(chat)}
              onAction={(action) =>
                showNotice(`${action} prepared.`)
              }
            />
          ))
        ) : (
          <Empty label="No conversations found." />
        )}
      </div>
    </section>
  );

  const renderConversation = () => {
    if (!selectedChat) {
      return (
        <section style={styles.section}>
          <Empty label="Select a conversation to start messaging." />
        </section>
      );
    }

    return (
      <section style={styles.conversation}>
        <div style={styles.conversationHeader}>
          <button
            type="button"
            onClick={() => setSelectedChat(null)}
            aria-label="Back to conversations"
            style={styles.iconButton}
          >
            <ChevronLeft size={18} />
          </button>

          <Avatar item={selectedChat} />

          <div style={styles.conversationTitle}>
            <strong>{selectedChat.name}</strong>
            <span>
              {selectedChat.online ? 'Online' : 'Last seen foundation'}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              onStartCall?.({
                chatId: selectedChat.id,
                type: 'voice',
              })
            }
            aria-label="Start voice call"
            style={styles.iconButton}
          >
            <Phone size={17} />
          </button>

          <button
            type="button"
            onClick={() =>
              onStartCall?.({
                chatId: selectedChat.id,
                type: 'video',
              })
            }
            aria-label="Start video call"
            style={styles.iconButton}
          >
            <Video size={17} />
          </button>
        </div>

        <div
          style={styles.messageList}
          aria-live="polite"
        >
          {selectedMessages.length ? (
            selectedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onAction={(action) =>
                  showNotice(`${action} prepared.`)
                }
              />
            ))
          ) : (
            <Empty label="No messages yet." />
          )}

          {typing ? (
            <div style={styles.typing}>
              <SparkleIcon />
              <span>Typing</span>
              <i />
              <i />
              <i />
            </div>
          ) : null}

          <div ref={messageEndRef} />
        </div>

        <div style={styles.composerTools}>
          <button
            type="button"
            onClick={() => setComposerMode('message')}
            aria-pressed={composerMode === 'message'}
            style={styles.toolButton}
          >
            Message
          </button>
          <button
            type="button"
            onClick={() => setComposerMode('translate')}
            aria-pressed={composerMode === 'translate'}
            style={styles.toolButton}
          >
            Translate
          </button>
          <button
            type="button"
            onClick={() =>
              showNotice('Voice message foundation ready.')
            }
            style={styles.toolButton}
          >
            <Mic size={13} />
            Voice
          </button>
        </div>

        <div style={styles.composer}>
          <button
            type="button"
            onClick={() =>
              showNotice('Media picker foundation ready.')
            }
            aria-label="Attach media"
            style={styles.composerButton}
          >
            <Plus size={16} />
          </button>
          <input
            value={messageInput}
            onChange={(event) =>
              setMessageInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') sendMessage();
            }}
            placeholder={
              composerMode === 'translate'
                ? 'Write a message to translate...'
                : 'Write a message...'
            }
            aria-label="Message input"
            style={styles.composerInput}
          />
          <button
            type="button"
            onClick={() =>
              showNotice('Emoji picker foundation ready.')
            }
            aria-label="Add emoji"
            style={styles.composerButton}
          >
            <SmileIcon />
          </button>
          <button
            type="button"
            onClick={sendMessage}
            aria-label="Send message"
            style={styles.sendButton}
          >
            <Send size={16} />
          </button>
        </div>
      </section>
    );
  };

  const renderGroups = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Groups"
        subtitle="Advanced group conversations and permissions."
        icon={Users}
        action={
          <button
            type="button"
            onClick={createGroup}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Create group
          </button>
        }
      />

      <div style={styles.featureGrid}>
        {[
          ['Admin roles', ShieldIcon],
          ['Member roles', Users],
          ['Group permissions', LockIcon],
          ['Join requests', UserPlusIcon],
          ['Group links', LinkIcon],
          ['Announcements', Bell],
          ['Polls', PollIcon],
          ['Events foundation', CalendarDays],
          ['Shared media', ImageIcon],
          ['Shared files', File],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} opened.`)
            }
            style={styles.featureButton}
          >
            <Icon size={15} />
            <span>{label}</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>

      <div style={styles.entityList}>
        {groups.length ? (
          groups.map((group, index) => (
            <EntityRow
              key={group.id || index}
              item={group}
              fallback="Group"
              icon={Users}
              onClick={() => openChat(group)}
            />
          ))
        ) : (
          <Empty label="No groups yet." />
        )}
      </div>
    </section>
  );

  const renderChannels = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Channels"
        subtitle="Broadcast channels for creators, brands, and communities."
        icon={RadioIcon}
        action={
          <button
            type="button"
            onClick={createChannel}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Create channel
          </button>
        }
      />

      <div style={styles.channelFeatures}>
        {[
          'Creator channels',
          'Brand channels',
          'News channels',
          'Community channels',
          'Read-only mode',
          'Scheduled posts',
          'View counts',
          'Reactions',
          'Comments foundation',
        ].map((label) => (
          <span key={label} style={styles.featureChip}>
            <Check size={13} />
            {label}
          </span>
        ))}
      </div>

      <div style={styles.entityList}>
        {channels.length ? (
          channels.map((channel, index) => (
            <EntityRow
              key={channel.id || index}
              item={channel}
              fallback="Channel"
              icon={RadioIcon}
              onClick={() => openChat(channel)}
            />
          ))
        ) : (
          <Empty label="No channels yet." />
        )}
      </div>
    </section>
  );

  const renderCommunities = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Communities"
        subtitle="Large spaces, topic rooms, and moderation foundations."
        icon={GlobeIcon}
      />

      <div style={styles.communityGrid}>
        {[
          ['Community spaces', GlobeIcon],
          ['Topic rooms', MessageCircle],
          ['Subgroups', Users],
          ['Events', CalendarDays],
          ['Moderation', ShieldIcon],
          ['Member directory', Users],
          ['Community analytics', Activity],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} prepared.`)
            }
            style={styles.communityCard}
          >
            <Icon size={17} />
            <strong>{label}</strong>
            <span>Foundation ready</span>
          </button>
        ))}
      </div>
    </section>
  );

  const renderCalls = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Calls"
        subtitle="Voice, video, group, and scheduled call foundations."
        icon={Phone}
      />

      <div style={styles.callGrid}>
        {[
          ['Voice Call', Phone],
          ['Video Call', Video],
          ['Group Voice Call', Users],
          ['Group Video Call', Video],
          ['Screen Share foundation', ImageIcon],
          ['Scheduled Calls foundation', CalendarDays],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() => {
              onStartCall?.({
                type: label,
                chatId: selectedChat?.id,
              });
              showNotice(`${label} prepared.`);
            }}
            style={styles.callButton}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div style={styles.callList}>
        {calls.length ? (
          calls.map((call, index) => (
            <div
              key={call.id || index}
              style={styles.callRow}
            >
              <span style={styles.callIcon}>
                {call.type === 'video' ? (
                  <Video size={16} />
                ) : (
                  <Phone size={16} />
                )}
              </span>
              <span style={styles.callCopy}>
                <strong>
                  {call.name || call.contact || 'Call'}
                </strong>
                <small>
                  {call.status || 'Call history foundation'} ·{' '}
                  {formatTime(call.timestamp)}
                </small>
              </span>
              <ChevronRight size={15} />
            </div>
          ))
        ) : (
          <Empty label="No recent calls." />
        )}
      </div>
    </section>
  );

  const renderAI = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Chats"
        subtitle="Aarush intelligence for every kind of conversation."
        icon={SparkleIcon}
      />

      <div style={styles.aiChatGrid}>
        {[
          ['Aarush AI', 'Personal context assistant'],
          ['Creator AI', 'Stories and creator strategy'],
          ['Business AI', 'Brands, CRM, and proposals'],
          ['Translation AI', 'Real-time multilingual chat'],
          ['Writing AI', 'Captions and long-form writing'],
          ['Study AI', 'Questions, notes, and quizzes'],
          ['Productivity AI', 'Tasks, schedules, and focus'],
        ].map(([name, description]) => (
          <button
            type="button"
            key={name}
            onClick={() => {
              setActiveModule('chat');
              showNotice(`${name} conversation opened.`);
            }}
            style={styles.aiChatCard}
          >
            <span style={styles.aiChatIcon}>
              <SparkleIcon />
            </span>
            <strong>{name}</strong>
            <span>{description}</span>
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
    </section>
  );

  const renderBusiness = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Business Chats"
        subtitle="Verified business communication and commerce foundations."
        icon={BriefcaseIcon}
      />

      <div style={styles.businessGrid}>
        {[
          ['Verified business accounts', ShieldIcon],
          ['Quick replies', MessageCircle],
          ['Catalog foundation', File],
          ['Orders foundation', ShoppingIcon],
          ['Payments foundation', WalletIcon],
          ['Support tickets', TicketIcon],
          ['CRM integration', BriefcaseIcon],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} opened.`)
            }
            style={styles.featureButton}
          >
            <Icon size={15} />
            <span>{label}</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>
    </section>
  );

  const renderArchive = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Archive"
        subtitle="Archived chats, groups, and channels."
        icon={Archive}
      />

      <div style={styles.archiveList}>
        {[
          ['Archived chats', chats.filter(
            (chat) => chat.archived
          ).length],
          ['Archived groups', groups.filter(
            (group) => group.archived
          ).length],
          ['Archived channels', channels.filter(
            (channel) => channel.archived
          ).length],
        ].map(([label, count]) => (
          <button
            type="button"
            key={label}
            onClick={() => showNotice(`${label} opened.`)}
            style={styles.archiveRow}
          >
            <Archive size={16} />
            <span>{label}</span>
            <strong>{count || '—'}</strong>
            <ChevronRight size={15} />
          </button>
        ))}
      </div>

      <div style={styles.archiveTools}>
        <Search size={15} />
        <span>Search within archive</span>
        <ChevronRight size={14} />
      </div>
    </section>
  );

  const renderSearch = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Search"
        subtitle="Search messages, chats, files, media, and contacts."
        icon={Search}
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          autoFocus
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search across Aarush messaging"
          aria-label="Search messaging"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.searchCategories}>
        {[
          'Messages',
          'Chats',
          'Groups',
          'Channels',
          'Contacts',
          'Files',
          'Media',
          'Links foundation',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={() => showNotice(`${label} search selected.`)}
            style={styles.categoryButton}
          >
            <Search size={13} />
            {label}
          </button>
        ))}
      </div>

      <div style={styles.entityList}>
        {searchResults.length ? (
          searchResults.map((result, index) => (
            <EntityRow
              key={result.id || index}
              item={result}
              fallback="Search result"
              icon={Search}
              onClick={() => openChat(result)}
            />
          ))
        ) : (
          <Empty label="Search results will appear here." />
        )}
      </div>
    </section>
  );

  const renderSettings = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Messaging Settings"
        subtitle="Privacy, encryption, presence, and message controls."
        icon={Settings2}
      />

      <div style={styles.settingsList}>
        <SettingRow
          label="Disappearing Messages"
          value={disappearingTimer}
          onClick={() =>
            setDisappearingTimer(
              disappearingTimer === 'Off'
                ? '24 hours'
                : 'Off'
            )
          }
        />
        <SettingRow
          label="Read Receipts"
          value={readReceipts ? 'On' : 'Off'}
          onClick={() =>
            setReadReceipts((value) => !value)
          }
        />
        <SettingRow
          label="Last Seen"
          value={lastSeen ? 'On' : 'Off'}
          onClick={() =>
            setLastSeen((value) => !value)
          }
        />
        <SettingRow
          label="End-to-End Encryption"
          value="Foundation"
          onClick={() =>
            showNotice('Encryption details opened.')
          }
        />
        <SettingRow
          label="Screenshot Detection"
          value="Foundation"
          onClick={() =>
            showNotice('Screenshot detection opened.')
          }
        />
        <SettingRow
          label="Multi-Device Sync"
          value="Ready"
          onClick={() =>
            showNotice('Device sync opened.')
          }
        />
      </div>
    </section>
  );

  const renderModule = () => {
    if (selectedChat && activeModule === 'inbox') {
      return renderConversation();
    }

    if (activeModule === 'inbox') return renderInbox();
    if (activeModule === 'direct') return renderInbox();
    if (activeModule === 'groups') return renderGroups();
    if (activeModule === 'channels') return renderChannels();
    if (activeModule === 'communities') {
      return renderCommunities();
    }
    if (activeModule === 'calls') return renderCalls();
    if (activeModule === 'ai') return renderAI();
    if (activeModule === 'business') return renderBusiness();
    if (activeModule === 'archive') return renderArchive();
    if (activeModule === 'search') return renderSearch();
    if (activeModule === 'settings') return renderSettings();

    return renderInbox();
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Messaging Hub"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Messaging Hub</strong>
          <span>
            Every conversation, one Aarush inbox
          </span>
        </div>

        <button
          type="button"
          onClick={() => setActiveModule('settings')}
          aria-label="Messaging settings"
          style={styles.iconButton}
        >
          <Settings2 size={18} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <nav style={styles.moduleNav}>
          {MODULES.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => {
                setActiveModule(id);
                setSelectedChat(null);
              }}
              aria-pressed={activeModule === id}
              style={{
                ...styles.moduleButton,
                ...(activeModule === id
                  ? styles.activeModuleButton
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {renderModule()}
      </div>

      <style>{`
        @keyframes aarush-messaging-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-messaging-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-messaging-card:hover,
        .aarush-messaging-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-messaging-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-messaging-features,
          .aarush-messaging-actions {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </main>
  );
}

function ChatRow({
  chat,
  selected,
  onClick,
  onAction,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        ...styles.chatRow,
        ...(selected ? styles.selectedChatRow : {}),
      }}
    >
      <Avatar item={chat} />
      <span style={styles.chatCopy}>
        <strong>
          {chat.name}
          {chat.pinned ? <Pin size={12} /> : null}
          {chat.muted ? <VolumeX size={12} /> : null}
        </strong>
        <span>{chat.lastMessage}</span>
        <small>{formatTime(chat.timestamp)}</small>
      </span>
      <span style={styles.chatMeta}>
        {chat.online ? <Circle size={9} fill="#82e9c1" /> : null}
        {chat.unread ? (
          <b style={styles.unread}>{chat.unread}</b>
        ) : null}
      </span>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAction('Conversation options');
        }}
        aria-label="Conversation options"
        style={styles.tinyButton}
      >
        <MoreHorizontal size={15} />
      </button>
    </button>
  );
}

function MessageBubble({ message, onAction }) {
  return (
    <div
      style={{
        ...styles.messageRow,
        ...(message.mine ? styles.userMessageRow : {}),
      }}
    >
      <span
        style={{
          ...styles.messageAvatar,
          ...(message.mine ? styles.userAvatar : {}),
        }}
      >
        {message.mine ? (
          <UserIcon />
        ) : (
          <MessageCircle size={15} />
        )}
      </span>
      <div style={styles.messageBubble}>
        <small>{message.mine ? 'You' : message.sender}</small>
        <p>{message.text}</p>
        <div style={styles.messageFooter}>
          <span>{formatTime(message.timestamp)}</span>
          {message.mine ? (
            <Check size={12} color="#82e9c1" />
          ) : null}
          <button
            type="button"
            onClick={() => onAction('Message options')}
            aria-label="Message options"
            style={styles.messageOption}
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EntityRow({
  item,
  fallback,
  icon: Icon,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.entityRow}
    >
      <span style={styles.entityIcon}>
        <Icon size={16} />
      </span>
      <span style={styles.entityCopy}>
        <strong>
          {item.name || item.title || fallback}
        </strong>
        <small>
          {item.description ||
            item.lastMessage ||
            'Messaging foundation ready'}
        </small>
      </span>
      <ChevronRight size={15} />
    </button>
  );
}

function Avatar({ item }) {
  const source =
    item?.avatar || item?.image || item?.photo;

  if (source) {
    return (
      <img
        src={source}
        alt=""
        loading="lazy"
        style={styles.avatar}
      />
    );
  }

  return (
    <span style={styles.avatarFallback}>
      {String(item?.name || 'A')
        .charAt(0)
        .toUpperCase()}
    </span>
  );
}

function SettingRow({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.settingRow}
    >
      <span>{label}</span>
      <strong>{value}</strong>
      <ChevronRight size={14} />
    </button>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <MessageCircle size={25} />
      <span>{label}</span>
    </div>
  );
}

function RadioIcon() {
  return (
    <span style={styles.customIcon}>
      <Play size={15} />
    </span>
  );
}

function GlobeIcon() {
  return (
    <span style={styles.customIcon}>
      <Users size={15} />
    </span>
  );
}

function SparkleIcon() {
  return (
    <span style={styles.customIcon}>
      <Sparkles size={15} />
    </span>
  );
}

function BriefcaseIcon() {
  return (
    <span style={styles.customIcon}>
      <Briefcase size={15} />
    </span>
  );
}

function ShieldIcon() {
  return (
    <span style={styles.customIcon}>
      <ShieldCheck size={15} />
    </span>
  );
}

function LockIcon() {
  return (
    <span style={styles.customIcon}>
      <LockKeyhole size={15} />
    </span>
  );
}

function UserPlusIcon() {
  return (
    <span style={styles.customIcon}>
      <Users size={15} />
    </span>
  );
}

function LinkIcon() {
  return (
    <span style={styles.customIcon}>
      <Copy size={15} />
    </span>
  );
}

function PollIcon() {
  return (
    <span style={styles.customIcon}>
      <ListIcon />
    </span>
  );
}

function ListIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  );
}

function UserIcon() {
  return <UserRound size={15} />;
}

function ShoppingIcon() {
  return <PackageIcon />;
}

function PackageIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m16.5 9.4-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <span style={styles.customIcon}>
      <WalletCards size={15} />
    </span>
  );
}

function TicketIcon() {
  return (
    <span style={styles.customIcon}>
      <Star size={15} />
    </span>
  );
}

function SmileIcon() {
  return (
    <span style={styles.customIcon}>
      <SmileSvg />
    </span>
  );
}

function SmileSvg() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.58),#07090e 68%)',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.65rem',
    padding: '.75rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  iconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.06)',
    cursor: 'pointer',
  },

  heading: {
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  content: {
    width: 'min(100%, 1100px)',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.8rem',
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    padding: '.65rem',
    border: '1px solid rgba(130,233,193,.22)',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.64rem',
  },

  moduleNav: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    paddingBottom: '.2rem',
  },

  moduleButton: {
    minWidth: '5.9rem',
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.28rem',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeModuleButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-messaging-in 240ms ease both',
  },

  conversation: {
    minHeight: '30rem',
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto auto',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    animation: 'aarush-messaging-in 240ms ease both',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.7rem',
  },

  sectionHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  sectionHeaderH2: {
    margin: 0,
    fontSize: '.86rem',
  },

  sectionHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  smallPrimary: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.59rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  smallButton: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.7rem',
    marginBottom: '.7rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.8rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
  },

  searchInput: {
    minWidth: 0,
    minHeight: '2.55rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.68rem',
  },

  chatList: {
    display: 'grid',
    gap: '.4rem',
  },

  chatRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  selectedChatRow: {
    borderColor: 'rgba(124,92,255,.4)',
    background: 'rgba(124,92,255,.14)',
  },

  avatar: {
    width: '2.7rem',
    height: '2.7rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '999px',
  },

  avatarFallback: {
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  chatCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  chatCopyStrong: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
  },

  chatCopySpan: {
    overflow: 'hidden',
    color: '#91a0bc',
    fontSize: '.59rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  chatCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  chatMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
  },

  unread: {
    minWidth: '1.2rem',
    height: '1.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background: '#7c5cff',
    fontSize: '.52rem',
  },

  tinyButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.5rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    cursor: 'pointer',
  },

  conversationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.65rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
  },

  conversationTitle: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  conversationTitleSpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  messageList: {
    minHeight: '18rem',
    maxHeight: '32rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.5rem',
    overflowY: 'auto',
    padding: '.8rem',
  },

  messageRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '.4rem',
  },

  userMessageRow: {
    flexDirection: 'row-reverse',
  },

  messageAvatar: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.12)',
  },

  userAvatar: {
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  messageBubble: {
    maxWidth: '78%',
    padding: '.55rem .65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
  },

  messageBubbleSmall: {
    color: '#91a0bc',
    fontSize: '.52rem',
  },

  messageBubbleP: {
    margin: '.25rem 0',
    fontSize: '.65rem',
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap',
  },

  messageFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '.25rem',
    color: '#6f7d98',
    fontSize: '.51rem',
  },

  messageOption: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'grid',
    placeItems: 'center',
    marginLeft: 'auto',
    border: 0,
    color: '#91a0bc',
    background: 'transparent',
    cursor: 'pointer',
  },

  typing: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    color: '#9deeff',
    fontSize: '.57rem',
  },

  typingI: {
    width: '.3rem',
    height: '.3rem',
    borderRadius: '999px',
    background: '#4dd7ff',
  },

  composerTools: {
    display: 'flex',
    gap: '.3rem',
    padding: '0 .65rem .35rem',
  },

  toolButton: {
    minHeight: '2rem',
    padding: '0 .45rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.54rem',
    cursor: 'pointer',
  },

  composer: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '.45rem .65rem .65rem',
    borderTop: '1px solid rgba(255,255,255,.08)',
  },

  composerButton: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    cursor: 'pointer',
  },

  composerInput: {
    minWidth: 0,
    minHeight: '2.3rem',
    flex: 1,
    padding: '0 .5rem',
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.66rem',
  },

  sendButton: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '.6rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  featureButton: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  entityList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  entityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  entityIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  entityCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  entityCopySmall: {
    color: '#91a0bc',
    fontSize: '.56rem',
  },

  channelFeatures: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  featureChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    padding: '.35rem .45rem',
    borderRadius: '999px',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.53rem',
  },

  communityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  communityCard: {
    minHeight: '5rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  communityCardSpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  callGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  callButton: {
    minHeight: '4rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.25rem',
    padding: '.45rem',
    border: '1px solid rgba(77,215,255,.15)',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  callList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  callRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  callIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.6rem',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
  },

  callCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  callCopySmall: {
    color: '#91a0bc',
    fontSize: '.56rem',
  },

  aiChatGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  aiChatCard: {
    minHeight: '6.2rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(124,92,255,.16)',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  aiChatIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.55rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
  },

  aiChatCardSpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  aiChatCardSvg: {
    alignSelf: 'end',
    color: '#91a0bc',
  },

  businessGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  archiveList: {
    display: 'grid',
    gap: '.4rem',
  },

  archiveRow: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  archiveRowStrong: {
    marginLeft: 'auto',
    color: '#9deeff',
  },

  archiveTools: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.59rem',
  },

  searchCategories: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  categoryButton: {
    minHeight: '2.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.56rem',
    cursor: 'pointer',
  },

  settingsList: {
    display: 'grid',
    gap: '.4rem',
  },

  settingRow: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  settingRowStrong: {
    marginLeft: 'auto',
    color: '#82e9c1',
    fontSize: '.56rem',
  },

  customIcon: {
    display: 'grid',
    placeItems: 'center',
  },

  empty: {
    minHeight: '6rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gridColumn: '1 / -1',
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.64rem',
    textAlign: 'center',
  },

  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '.8rem',
    background: 'rgba(2,5,10,.72)',
    backdropFilter: 'blur(10px)',
  },

  modal: {
    width: 'min(100%, 430px)',
    display: 'grid',
    gap: '.7rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.63rem',
  },

  textInput: {
    minHeight: '2.5rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.68rem',
  },

  select: {
    minHeight: '2.4rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    width: '100%',
    marginTop: '.6rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },
};