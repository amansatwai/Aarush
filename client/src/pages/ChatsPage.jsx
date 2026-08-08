import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  Bot,
  CheckCheck,
  ChevronDown,
  Clock3,
  Edit3,
  EyeOff,
  FileText,
  FolderLock,
  Heart,
  History,
  Image as ImageIcon,
  Lock,
  Mail,
  MessageCircle,
  MessageSquarePlus,
  Mic,
  MoreHorizontal,
  Pin,
  Plus,
  Search,
  Send,
  Settings2,
  Shield,
  Sparkles,
  Star,
  Trash2,
  UserPlus,
  Users,
  VolumeX,
  Wand2,
  X,
} from 'lucide-react';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const STORAGE_KEY = 'aarush_chat_list_v2';
const SEARCH_HISTORY_KEY = 'aarush_chat_search_history_v2';
const SAVED_SEARCHES_KEY = 'aarush_chat_saved_searches_v2';

const CHAT_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'groups', label: 'Groups' },
  { key: 'archived', label: 'Archived' },
  { key: 'requests', label: 'Requests' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'ai', label: 'AI' },
  { key: 'hidden', label: 'Hidden' },
];

const CHAT_CATEGORIES = [
  'Friends',
  'Family',
  'Work',
  'Creators',
  'Business',
  'AI',
  'Groups',
  'Favorites',
  'Hidden',
];

const FUTURE_LAB = [
  'End-to-End Encryption',
  'Secret Chats',
  'Multi-Device Encryption',
  'AI Live Translation',
  'Voice Clone Protection',
  'Quantum Messaging',
  'Cross-App Secure Bridge',
  'Autonomous Conversation Assistant',
];

const BACKGROUND_SYSTEMS = [
  'Chat Engine',
  'Realtime Messaging',
  'Search Index',
  'Presence Engine',
  'Notification Sync',
  'Vault Integration',
  'AI Suggestions',
  'Privacy Shield',
];

const INITIAL_CHATS = [
  {
    id: '123',
    username: 'aman.satwai',
    displayName: 'Aman Satwai',
    avatarUrl: 'https://i.pravatar.cc/160?u=aman.satwai',
    verified: true,
    online: true,
    lastSeen: 'recently',
    lastMessage: 'Let us review the new build.',
    lastMessageType: 'text',
    lastMessageAt: Date.now() - 120000,
    unreadCount: 2,
    typing: false,
    pinned: true,
    muted: false,
    archived: false,
    hidden: false,
    locked: false,
    vaulted: false,
    favorite: true,
    requested: false,
    ai: false,
    category: 'Friends',
  },
  {
    id: '124',
    username: 'aarush.team',
    displayName: 'Aarush Team',
    avatarUrl: 'https://i.pravatar.cc/160?u=aarush.team',
    verified: true,
    online: true,
    lastSeen: 'active now',
    lastMessage: 'Build review at 8 PM.',
    lastMessageType: 'text',
    lastMessageAt: Date.now() - 1800000,
    unreadCount: 8,
    typing: false,
    pinned: false,
    muted: false,
    archived: false,
    hidden: false,
    locked: false,
    vaulted: false,
    favorite: false,
    requested: false,
    ai: false,
    isGroup: true,
    category: 'Groups',
  },
  {
    id: '125',
    username: 'design.loop',
    displayName: 'Design Loop',
    avatarUrl: 'https://i.pravatar.cc/160?u=design.loop',
    verified: false,
    online: false,
    lastSeen: '18 minutes ago',
    lastMessage: 'Sent a photo',
    lastMessageType: 'image',
    lastMessageAt: Date.now() - 3600000,
    unreadCount: 0,
    typing: false,
    pinned: false,
    muted: true,
    archived: false,
    hidden: false,
    locked: false,
    vaulted: false,
    favorite: true,
    requested: false,
    ai: false,
    category: 'Creators',
  },
  {
    id: '126',
    username: 'creator.lab',
    displayName: 'Creator Lab',
    avatarUrl: 'https://i.pravatar.cc/160?u=creator.lab',
    verified: true,
    online: false,
    lastSeen: 'Yesterday',
    lastMessage: 'Voice message',
    lastMessageType: 'voice',
    lastMessageAt: Date.now() - 7200000,
    unreadCount: 0,
    typing: false,
    pinned: false,
    muted: false,
    archived: false,
    hidden: false,
    locked: false,
    vaulted: false,
    favorite: false,
    requested: false,
    ai: false,
    category: 'Work',
  },
  {
    id: '127',
    username: 'family.circle',
    displayName: 'Family Circle',
    avatarUrl: 'https://i.pravatar.cc/160?u=family.circle',
    verified: false,
    online: false,
    lastSeen: '2 hours ago',
    lastMessage: 'Draft: See you tomorrow',
    lastMessageType: 'draft',
    lastMessageAt: Date.now() - 9000000,
    unreadCount: 0,
    typing: false,
    pinned: false,
    muted: false,
    archived: false,
    hidden: false,
    locked: false,
    vaulted: false,
    favorite: true,
    requested: false,
    ai: false,
    isGroup: true,
    category: 'Family',
  },
  {
    id: '128',
    username: 'aarush.ai',
    displayName: 'Aarush AI',
    avatarUrl: 'https://i.pravatar.cc/160?u=aarush.ai',
    verified: true,
    online: true,
    lastSeen: 'active now',
    lastMessage: 'I prepared three reply suggestions.',
    lastMessageType: 'ai',
    lastMessageAt: Date.now() - 14400000,
    unreadCount: 1,
    typing: false,
    pinned: false,
    muted: false,
    archived: false,
    hidden: false,
    locked: false,
    vaulted: false,
    favorite: false,
    requested: false,
    ai: true,
    category: 'AI',
  },
  {
    id: '129',
    username: 'private.safe',
    displayName: 'Private Safe',
    avatarUrl: 'https://i.pravatar.cc/160?u=private.safe',
    verified: false,
    online: false,
    lastSeen: '3 days ago',
    lastMessage: 'Locked conversation',
    lastMessageType: 'locked',
    lastMessageAt: Date.now() - 86400000,
    unreadCount: 0,
    typing: false,
    pinned: false,
    muted: false,
    archived: false,
    hidden: true,
    locked: true,
    vaulted: true,
    favorite: false,
    requested: false,
    ai: false,
    category: 'Hidden',
  },
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

function formatChatTime(timestamp) {
  const date = new Date(timestamp);
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

function getPreview(chat) {
  if (chat.typing) {
    return {
      label: 'Typing…',
      color: '#4dd7ff',
      icon: MessageCircle,
    };
  }

  if (chat.lastMessageType === 'image') {
    return {
      label: chat.lastMessage || 'Sent a photo',
      color: '#aab6cf',
      icon: ImageIcon,
    };
  }

  if (chat.lastMessageType === 'video') {
    return {
      label: chat.lastMessage || 'Sent a video',
      color: '#aab6cf',
      icon: ImageIcon,
    };
  }

  if (chat.lastMessageType === 'voice') {
    return {
      label: chat.lastMessage || 'Voice message',
      color: '#aab6cf',
      icon: Mic,
    };
  }

  if (chat.lastMessageType === 'file') {
    return {
      label: chat.lastMessage || 'Shared a file',
      color: '#aab6cf',
      icon: FileText,
    };
  }

  if (chat.lastMessageType === 'draft') {
    return {
      label: chat.lastMessage || 'Draft: See you tomorrow',
      color: '#ffcf8a',
      icon: Edit3,
    };
  }

  if (chat.lastMessageType === 'locked') {
    return {
      label: chat.lastMessage || 'Locked conversation',
      color: '#c2b9ff',
      icon: Lock,
    };
  }

  if (chat.lastMessageType === 'ai') {
    return {
      label: chat.lastMessage || 'AI suggestion ready',
      color: '#a9edff',
      icon: Bot,
    };
  }

  return {
    label: chat.lastMessage || 'No messages yet',
    color: '#aab6cf',
    icon: MessageCircle,
  };
}

function Avatar({ chat }) {
  return (
    <div style={styles.avatarWrapper}>
      <img
        src={chat.avatarUrl}
        alt={`${chat.displayName} profile`}
        style={styles.avatar}
      />

      {chat.online ? <span style={styles.onlineDot} /> : null}

      {chat.locked ? (
        <span style={styles.lockedBadge}>
          <Lock size={9} />
        </span>
      ) : null}
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span style={styles.verifiedBadge} aria-label="Verified">
      ✓
    </span>
  );
}

function ChatRow({ chat, onOpen, onAction }) {
  const preview = getPreview(chat);
  const PreviewIcon = preview.icon;

  return (
    <article
      style={styles.chatRow}
      onContextMenu={(event) => {
        event.preventDefault();
        onAction('menu');
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        style={styles.chatRowButton}
        aria-label={`Open conversation with ${chat.displayName}`}
      >
        <Avatar chat={chat} />

        <span style={styles.chatContent}>
          <span style={styles.nameLine}>
            <span style={styles.displayName}>{chat.displayName}</span>

            {chat.verified ? <VerifiedBadge /> : null}

            {chat.isGroup ? (
              <span style={styles.groupBadge}>Group</span>
            ) : null}
          </span>

          <span style={styles.usernameLine}>@{chat.username}</span>

          <span
            style={{
              ...styles.messagePreview,
              color: preview.color,
            }}
          >
            <PreviewIcon size={12} />
            <span>{preview.label}</span>
          </span>
        </span>

        <span style={styles.chatMeta}>
          <span style={styles.chatTime}>
            {formatChatTime(chat.lastMessageAt)}
          </span>

          {chat.unreadCount > 0 ? (
            <span style={styles.unreadBadge}>
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          ) : null}

          <span style={styles.rowIndicators}>
            {chat.pinned ? <Pin size={12} /> : null}
            {chat.muted ? <VolumeX size={12} /> : null}
            {chat.archived ? <Archive size={12} /> : null}
            {chat.vaulted ? <FolderLock size={12} /> : null}
          </span>
        </span>
      </button>

      <div style={styles.rowActions} aria-label="Chat actions">
        <button
          type="button"
          onClick={() => onAction(chat.pinned ? 'unpin' : 'pin')}
          style={styles.rowActionButton}
          aria-label={chat.pinned ? 'Unpin chat' : 'Pin chat'}
        >
          <Pin size={13} />
        </button>

        <button
          type="button"
          onClick={() => onAction(chat.archived ? 'unarchive' : 'archive')}
          style={styles.rowActionButton}
          aria-label={chat.archived ? 'Unarchive chat' : 'Archive chat'}
        >
          <Archive size={13} />
        </button>

        <button
          type="button"
          onClick={() => onAction(chat.muted ? 'unmute' : 'mute')}
          style={styles.rowActionButton}
          aria-label={chat.muted ? 'Unmute chat' : 'Mute chat'}
        >
          <VolumeX size={13} />
        </button>

        <button
          type="button"
          onClick={() => onAction('hide')}
          style={styles.rowActionButton}
          aria-label="Hide chat"
        >
          <EyeOff size={13} />
        </button>

        <button
          type="button"
          onClick={() => onAction('vault')}
          style={styles.rowActionButton}
          aria-label="Move chat to vault"
        >
          <FolderLock size={13} />
        </button>

        <button
          type="button"
          onClick={() =>
            onAction(chat.unreadCount > 0 ? 'read' : 'unread')
          }
          style={styles.rowActionButton}
          aria-label={
            chat.unreadCount > 0 ? 'Mark chat read' : 'Mark chat unread'
          }
        >
          <CheckCheck size={13} />
        </button>

        <button
          type="button"
          onClick={() => onAction('delete')}
          style={styles.rowActionButtonDanger}
          aria-label="Delete chat"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </article>
  );
}

function SearchPanel({
  query,
  onQueryChange,
  searchHistory,
  savedSearches,
  onSelectSearch,
  onClearHistory,
  onRemoveSavedSearch,
}) {
  const [showPanel, setShowPanel] = useState(false);

  const suggestions = [
    'Unread messages',
    'Groups',
    'Photos',
    'Voice messages',
    'Aarush AI',
  ];

  return (
    <section style={styles.searchSection}>
      <div style={styles.searchBar}>
        <Search size={17} color="#9aa8c1" />

        <input
          value={query}
          onFocus={() => setShowPanel(true)}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search chats, people, groups, messages"
          style={styles.searchInput}
          aria-label="Search chats"
        />

        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            style={styles.searchIconButton}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setShowPanel((value) => !value)}
          style={styles.searchIconButton}
          aria-label="Toggle recent and saved searches"
        >
          <History size={16} />
        </button>
      </div>

      {showPanel ? (
        <div style={styles.searchPanel}>
          <div style={styles.searchPanelHeader}>
            <span>Search suggestions</span>

            <button
              type="button"
              onClick={() => setShowPanel(false)}
              style={styles.closeSearchButton}
              aria-label="Close search suggestions"
            >
              <X size={15} />
            </button>
          </div>

          <div style={styles.suggestionList}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  onQueryChange(suggestion);
                  setShowPanel(false);
                }}
                style={styles.suggestionButton}
              >
                <Sparkles size={14} />
                {suggestion}
              </button>
            ))}
          </div>

          {searchHistory.length > 0 ? (
            <div style={styles.searchGroup}>
              <div style={styles.searchGroupHeader}>
                <span>Recent searches</span>

                <button
                  type="button"
                  onClick={onClearHistory}
                  style={styles.clearTextButton}
                >
                  Clear all
                </button>
              </div>

              {searchHistory.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    onQueryChange(item);
                    setShowPanel(false);
                  }}
                  style={styles.historyButton}
                >
                  <History size={14} />
                  {item}
                </button>
              ))}
            </div>
          ) : null}

          {savedSearches.length > 0 ? (
            <div style={styles.searchGroup}>
              <div style={styles.searchGroupHeader}>
                <span>Saved searches</span>
              </div>

              {savedSearches.map((item) => (
                <div key={item} style={styles.savedSearchRow}>
                  <button
                    type="button"
                    onClick={() => {
                      onQueryChange(item);
                      setShowPanel(false);
                    }}
                    style={styles.historyButton}
                  >
                    <Star size={14} />
                    {item}
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveSavedSearch(item)}
                    style={styles.removeSavedButton}
                    aria-label={`Remove saved search ${item}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function FloatingActionMenu({ onClose, onAction }) {
  return (
    <div style={styles.floatingMenu}>
      <button
        type="button"
        onClick={() => onAction('user')}
        style={styles.floatingMenuItem}
      >
        <UserPlus size={16} />
        Search users
      </button>

      <button
        type="button"
        onClick={() => onAction('group')}
        style={styles.floatingMenuItem}
      >
        <Users size={16} />
        New group
      </button>

      <button
        type="button"
        onClick={() => onAction('ai')}
        style={styles.floatingMenuItem}
      >
        <Bot size={16} />
        AI chat
      </button>

      <button
        type="button"
        onClick={() => onAction('secret')}
        style={styles.floatingMenuItem}
      >
        <Shield size={16} />
        Secret chat
      </button>

      <button
        type="button"
        onClick={onClose}
        style={styles.floatingMenuClose}
      >
        <X size={15} />
        Close
      </button>
    </div>
  );
}

export default function ChatsPage() {
  const navigate = useNavigate();

  const [chats, setChats] = useState(() =>
    readStorage(STORAGE_KEY, INITIAL_CHATS)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchHistory, setSearchHistory] = useState(() =>
    readStorage(SEARCH_HISTORY_KEY, [])
  );
  const [savedSearches, setSavedSearches] = useState(() =>
    readStorage(SAVED_SEARCHES_KEY, [])
  );
  const [floatingMenuOpen, setFloatingMenuOpen] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  useEffect(() => {
    writeStorage(STORAGE_KEY, chats);
  }, [chats]);

  useEffect(() => {
    writeStorage(SEARCH_HISTORY_KEY, searchHistory);
  }, [searchHistory]);

  useEffect(() => {
    writeStorage(SAVED_SEARCHES_KEY, savedSearches);
  }, [savedSearches]);

  const updateSearch = (value) => {
    setSearchQuery(value);

    const normalized = value.trim();

    if (!normalized) {
      return;
    }

    setSearchHistory((current) => {
      const next = [
        normalized,
        ...current.filter((item) => item !== normalized),
      ];

      return next.slice(0, 8);
    });
  };

  const updateChat = (chatId, updater) => {
    setChats((current) =>
      current.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }

        return typeof updater === 'function'
          ? updater(chat)
          : { ...chat, ...updater };
      })
    );
  };

  const handleChatAction = (chatId, action) => {
    if (action === 'menu') {
      return;
    }

    if (action === 'delete') {
      setChats((current) =>
        current.filter((chat) => chat.id !== chatId)
      );
      return;
    }

    if (action === 'read') {
      updateChat(chatId, { unreadCount: 0 });
      return;
    }

    if (action === 'unread') {
      updateChat(chatId, (chat) => ({
        ...chat,
        unreadCount: chat.unreadCount || 1,
      }));
      return;
    }

    const fieldMap = {
      pin: 'pinned',
      unpin: 'pinned',
      archive: 'archived',
      unarchive: 'archived',
      mute: 'muted',
      unmute: 'muted',
      hide: 'hidden',
      vault: 'vaulted',
    };

    const field = fieldMap[action];

    if (!field) {
      return;
    }

    updateChat(chatId, {
      [field]: !['unpin', 'unarchive', 'unmute'].includes(action),
    });
  };

  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = chats.filter((chat) => {
      if (activeTab === 'unread') {
        return chat.unreadCount > 0;
      }

      if (activeTab === 'groups') {
        return chat.isGroup;
      }

      if (activeTab === 'archived') {
        return chat.archived;
      }

      if (activeTab === 'requests') {
        return chat.requested;
      }

      if (activeTab === 'favorites') {
        return chat.favorite;
      }

      if (activeTab === 'ai') {
        return chat.ai;
      }

      if (activeTab === 'hidden') {
        return chat.hidden || chat.locked || chat.vaulted;
      }

      return !chat.archived && !chat.hidden;
    });

    if (activeCategory !== 'All') {
      result = result.filter((chat) => {
        if (activeCategory === 'Groups') {
          return chat.isGroup;
        }

        if (activeCategory === 'Favorites') {
          return chat.favorite;
        }

        if (activeCategory === 'Hidden') {
          return chat.hidden || chat.locked || chat.vaulted;
        }

        return chat.category === activeCategory;
      });
    }

    if (query) {
      result = result.filter((chat) => {
        const haystack = [
          chat.id,
          chat.username,
          chat.displayName,
          chat.lastMessage,
          chat.category,
          chat.isGroup ? 'group' : 'person',
          chat.lastMessageType,
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(query);
      });
    }

    return [...result].sort((first, second) => {
      if (first.pinned !== second.pinned) {
        return Number(second.pinned) - Number(first.pinned);
      }

      return (
        new Date(second.lastMessageAt).getTime() -
        new Date(first.lastMessageAt).getTime()
      );
    });
  }, [activeCategory, activeTab, chats, searchQuery]);

  const handleOpenChat = (chatId) => {
    navigate(`/chats/${chatId}`);
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleFloatingAction = (action) => {
    setFloatingMenuOpen(false);

    if (action === 'ai') {
      navigate('/aarush-ai');
      return;
    }

    if (action === 'secret') {
      navigate('/stealth-privacy');
      return;
    }

    window.dispatchEvent(
      new CustomEvent('aarush:new-chat', {
        detail: { type: action },
      })
    );
  };

  const removeSavedSearch = (value) => {
    setSavedSearches((current) =>
      current.filter((item) => item !== value)
    );
  };

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Chats"
        onChatClick={() => navigate('/chats')}
        onOneTapLock={() => navigate('/lock')}
      />

      <header style={styles.pageHeader}>
        <button
          type="button"
          onClick={handleBack}
          style={styles.headerIconButton}
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
        </button>

        <div style={styles.headerTitle}>
          <h1 style={styles.title}>Chats</h1>
          <span style={styles.headerSubtitle}>
            <Shield size={12} />
            Private messaging space
          </span>
        </div>

        <button
          type="button"
          onClick={() => setFloatingMenuOpen((value) => !value)}
          style={styles.headerIconButton}
          aria-label="New message"
        >
          <MessageSquarePlus size={18} />
        </button>
      </header>

      <main style={styles.main}>
        <section style={styles.heroCard}>
          <div style={styles.heroIcon}>
            <MessageCircle size={24} />
          </div>

          <div style={styles.heroContent}>
            <div style={styles.heroHeadingRow}>
              <h2 style={styles.heroTitle}>Messages</h2>

              <span style={styles.connectionBadge}>
                <span style={styles.connectionDot} />
                Connected
              </span>
            </div>

            <p style={styles.heroSubtitle}>
              Private, secure, and intelligent conversations across all your
              devices.
            </p>

            <div style={styles.privacySignals}>
              <span>
                <Lock size={12} />
                Privacy Shield
              </span>

              <span>
                <CheckCheck size={12} />
                Sync ready
              </span>

              <span>
                <Sparkles size={12} />
                AI available
              </span>
            </div>
          </div>
        </section>

        <SearchPanel
          query={searchQuery}
          onQueryChange={updateSearch}
          searchHistory={searchHistory}
          savedSearches={savedSearches}
          onSelectSearch={updateSearch}
          onClearHistory={() => setSearchHistory([])}
          onRemoveSavedSearch={removeSavedSearch}
        />

        <section style={styles.tabsSection}>
          <div style={styles.tabScroller}>
            {CHAT_TABS.map((tab) => (
              <button
                type="button"
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === tab.key
                    ? styles.activeTabButton
                    : {}),
                }}
              >
                {tab.label}

                {tab.key === 'unread' &&
                chats.reduce(
                  (total, chat) => total + chat.unreadCount,
                  0
                ) > 0 ? (
                  <span style={styles.tabCount}>
                    {chats.reduce(
                      (total, chat) => total + chat.unreadCount,
                      0
                    )}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </section>

        <section style={styles.categorySection}>
          <button
            type="button"
            onClick={() => setShowCategoryMenu((value) => !value)}
            style={styles.categoryButton}
          >
            <span>
              <Heart size={14} />
              {activeCategory}
            </span>
            <ChevronDown size={15} />
          </button>

          {showCategoryMenu ? (
            <div style={styles.categoryMenu}>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setShowCategoryMenu(false);
                }}
                style={styles.categoryMenuItem}
              >
                All categories
              </button>

              {CHAT_CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setShowCategoryMenu(false);
                  }}
                  style={{
                    ...styles.categoryMenuItem,
                    ...(activeCategory === category
                      ? styles.categoryMenuItemActive
                      : {}),
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section style={styles.chatSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Recent chats</h2>
              <span style={styles.sectionMeta}>
                {filteredChats.length} conversation
                {filteredChats.length === 1 ? '' : 's'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/search')}
              style={styles.smartSearchButton}
            >
              <Wand2 size={14} />
              Smart search
            </button>
          </div>

          {filteredChats.length > 0 ? (
            <div style={styles.chatList}>
              {filteredChats.map((chat) => (
                <ChatRow
                  key={chat.id}
                  chat={chat}
                  onOpen={() => handleOpenChat(chat.id)}
                  onAction={(action) =>
                    handleChatAction(chat.id, action)
                  }
                />
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIllustration}>
                <Mail size={28} />
                <span style={styles.emptySparkle}>
                  <Sparkles size={13} />
                </span>
              </div>

              <h2 style={styles.emptyTitle}>No conversations yet</h2>

              <p style={styles.emptyText}>
                Start a private conversation with someone from your Aarush
                network.
              </p>

              <button
                type="button"
                onClick={() => handleFloatingAction('user')}
                style={styles.startChatButton}
              >
                <Plus size={16} />
                Start Chat
              </button>
            </div>
          )}
        </section>

        <section style={styles.featurePanel}>
          <div style={styles.panelHeading}>
            <div>
              <h2 style={styles.panelTitle}>AI Chat Suggestions</h2>
              <p style={styles.panelSubtitle}>
                Helpful shortcuts based on your recent interactions.
              </p>
            </div>

            <Bot size={20} color="#9e8cff" />
          </div>

          <div style={styles.aiSuggestionGrid}>
            <button
              type="button"
              style={styles.aiSuggestion}
              onClick={() => navigate('/aarush-ai')}
            >
              <Sparkles size={15} />
              Suggested contacts
            </button>

            <button
              type="button"
              style={styles.aiSuggestion}
              onClick={() => navigate('/aarush-ai')}
            >
              <Wand2 size={15} />
              Conversation prediction
            </button>

            <button
              type="button"
              style={styles.aiSuggestion}
              onClick={() => navigate('/aarush-ai')}
            >
              <MessageCircle size={15} />
              Recent AI interactions
            </button>
          </div>
        </section>

        <section style={styles.featurePanel}>
          <div style={styles.panelHeading}>
            <div>
              <h2 style={styles.panelTitle}>Background Chat Systems</h2>
              <p style={styles.panelSubtitle}>
                Current status of Aarush messaging services.
              </p>
            </div>

            <Settings2 size={19} color="#8ea0c4" />
          </div>

          <div style={styles.systemGrid}>
            {BACKGROUND_SYSTEMS.map((system, index) => {
              const state =
                index === 1
                  ? 'Syncing'
                  : index >= 6
                    ? 'Protected'
                    : 'Active';

              return (
                <div key={system} style={styles.systemCard}>
                  <span style={styles.systemName}>{system}</span>
                  <span style={styles.systemState(state)}>
                    {state}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section style={styles.featurePanel}>
          <div style={styles.panelHeading}>
            <div>
              <h2 style={styles.panelTitle}>
                Future Messaging Lab (Coming Soon)
              </h2>
              <p style={styles.panelSubtitle}>
                Future-ready messaging capabilities for Aarush.
              </p>
            </div>

            <Shield size={19} color="#8ea0c4" />
          </div>

          <div style={styles.futureGrid}>
            {FUTURE_LAB.map((feature) => (
              <div key={feature} style={styles.futureCard}>
                <span>{feature}</span>
                <small>Future ready</small>
              </div>
            ))}
          </div>
        </section>
      </main>

      {floatingMenuOpen ? (
        <FloatingActionMenu
          onClose={() => setFloatingMenuOpen(false)}
          onAction={handleFloatingAction}
        />
      ) : null}

      <button
        type="button"
        onClick={() => setFloatingMenuOpen((value) => !value)}
        style={styles.floatingButton}
        aria-label="New chat"
      >
        {floatingMenuOpen ? <X size={22} /> : <Plus size={22} />}
      </button>

      <BottomNav />
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100dvh',
    paddingBottom: '6rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top, rgba(38,34,82,0.62) 0%, rgba(11,14,23,1) 42%, rgba(7,9,14,1) 100%)',
  },

  pageHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '0.7rem 0.9rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(7,10,16,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  headerIconButton: {
    width: '2.65rem',
    height: '2.65rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#f4f7ff',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  headerTitle: {
    minWidth: 0,
    display: 'grid',
    justifyItems: 'center',
    gap: '0.15rem',
  },

  title: {
    margin: 0,
    color: '#f7f9ff',
    fontSize: '1rem',
    fontWeight: 900,
  },

  headerSubtitle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#9aa8c1',
    fontSize: '0.68rem',
    fontWeight: 700,
  },

  main: {
    width: '100%',
    maxWidth: '760px',
    margin: '0 auto',
    padding: '0.85rem',
    boxSizing: 'border-box',
  },

  heroCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '1rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.35rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.08))',
    boxShadow: '0 22px 55px rgba(0,0,0,0.24)',
  },

  heroIcon: {
    width: '3.25rem',
    height: '3.25rem',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '1.1rem',
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.45), rgba(77,215,255,0.22))',
    boxShadow: '0 0 25px rgba(124,92,255,0.2)',
  },

  heroContent: {
    minWidth: 0,
    flex: 1,
  },

  heroHeadingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
  },

  heroTitle: {
    margin: 0,
    color: '#f7f9ff',
    fontSize: '1.28rem',
    fontWeight: 950,
  },

  heroSubtitle: {
    margin: '0.42rem 0 0',
    color: '#9ba8c0',
    fontSize: '0.84rem',
    lineHeight: 1.55,
  },

  connectionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.3rem 0.5rem',
    borderRadius: '999px',
    color: '#c8f9e2',
    background: 'rgba(61,242,168,0.1)',
    fontSize: '0.62rem',
    fontWeight: 850,
    whiteSpace: 'nowrap',
  },

  connectionDot: {
    width: '0.45rem',
    height: '0.45rem',
    borderRadius: '999px',
    background: '#3df2a8',
    boxShadow: '0 0 10px rgba(61,242,168,0.6)',
  },

  privacySignals: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginTop: '0.7rem',
  },

  privacySignalsSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },

  searchSection: {
    position: 'relative',
    zIndex: 30,
    marginTop: '0.85rem',
  },

  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    minHeight: '2.9rem',
    padding: '0.45rem 0.65rem 0.45rem 0.85rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,0.06)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 0,
    outline: 0,
    color: '#ffffff',
    background: 'transparent',
    fontSize: '0.84rem',
  },

  searchIconButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#dce5f7',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  searchPanel: {
    position: 'absolute',
    top: 'calc(100% + 0.45rem)',
    right: 0,
    left: 0,
    padding: '0.75rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,31,0.98)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.42)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  searchPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#dce5f7',
    fontSize: '0.75rem',
    fontWeight: 850,
  },

  closeSearchButton: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#dce5f7',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  suggestionList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginTop: '0.65rem',
  },

  suggestionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.42rem 0.55rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#dce5f7',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.68rem',
    cursor: 'pointer',
  },

  searchGroup: {
    marginTop: '0.8rem',
    paddingTop: '0.7rem',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },

  searchGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#96a4be',
    fontSize: '0.68rem',
    fontWeight: 800,
  },

  clearTextButton: {
    border: 0,
    color: '#8edfff',
    background: 'transparent',
    fontSize: '0.68rem',
    cursor: 'pointer',
  },

  historyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    width: '100%',
    marginTop: '0.35rem',
    padding: '0.45rem',
    border: 0,
    borderRadius: '0.6rem',
    color: '#dce5f7',
    background: 'rgba(255,255,255,0.04)',
    textAlign: 'left',
    fontSize: '0.72rem',
    cursor: 'pointer',
  },

  savedSearchRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '0.3rem',
    alignItems: 'center',
  },

  removeSavedButton: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#aab7cf',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },

  tabsSection: {
    marginTop: '0.8rem',
  },

  tabScroller: {
    display: 'flex',
    gap: '0.4rem',
    overflowX: 'auto',
    paddingBottom: '0.15rem',
    scrollbarWidth: 'none',
  },

  tabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    flexShrink: 0,
    minHeight: '2rem',
    padding: '0.45rem 0.7rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#aab6cc',
    background: 'rgba(255,255,255,0.04)',
    fontSize: '0.7rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  activeTabButton: {
    color: '#ffffff',
    borderColor: 'rgba(124,92,255,0.38)',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    boxShadow: '0 8px 18px rgba(124,92,255,0.18)',
  },

  tabCount: {
    minWidth: '1.1rem',
    padding: '0.12rem 0.28rem',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(0,0,0,0.2)',
    fontSize: '0.6rem',
    textAlign: 'center',
  },

  categorySection: {
    position: 'relative',
    zIndex: 20,
    marginTop: '0.65rem',
  },

  categoryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.55rem',
    minWidth: '8.6rem',
    padding: '0.48rem 0.65rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem',
    color: '#dce5f7',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.72rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  categoryButtonSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
  },

  categoryMenu: {
    position: 'absolute',
    top: 'calc(100% + 0.4rem)',
    left: 0,
    display: 'grid',
    width: 'min(14rem, 90vw)',
    padding: '0.45rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '0.9rem',
    background: 'rgba(15,19,31,0.98)',
    boxShadow: '0 20px 55px rgba(0,0,0,0.4)',
  },

  categoryMenuItem: {
    padding: '0.55rem 0.65rem',
    border: 0,
    borderRadius: '0.55rem',
    color: '#c6d1e6',
    background: 'transparent',
    textAlign: 'left',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },

  categoryMenuItemActive: {
    color: '#ffffff',
    background: 'rgba(124,92,255,0.2)',
  },

  chatSection: {
    marginTop: '0.9rem',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.65rem',
    marginBottom: '0.55rem',
  },

  sectionTitle: {
    margin: 0,
    color: '#f4f7ff',
    fontSize: '0.95rem',
    fontWeight: 900,
  },

  sectionMeta: {
    display: 'block',
    marginTop: '0.18rem',
    color: '#8e9cb6',
    fontSize: '0.68rem',
  },

  smartSearchButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.42rem 0.55rem',
    border: '1px solid rgba(124,92,255,0.24)',
    borderRadius: '999px',
    color: '#c9c0ff',
    background: 'rgba(124,92,255,0.1)',
    fontSize: '0.66rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  chatList: {
    display: 'grid',
    gap: '0.45rem',
  },

  chatRow: {
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,0.045)',
    transition:
      'transform 180ms ease, border-color 180ms ease, background 180ms ease',
  },

  chatRowButton: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '0.7rem',
    width: '100%',
    padding: '0.65rem',
    border: 0,
    color: '#ffffff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  avatarWrapper: {
    position: 'relative',
    width: '3rem',
    height: '3rem',
    flexShrink: 0,
  },

  avatar: {
    width: '3rem',
    height: '3rem',
    display: 'block',
    objectFit: 'cover',
    borderRadius: '999px',
    border: '2px solid rgba(124,92,255,0.4)',
    background: '#1a2031',
  },

  onlineDot: {
    position: 'absolute',
    right: '-0.02rem',
    bottom: '-0.02rem',
    width: '0.72rem',
    height: '0.72rem',
    borderRadius: '999px',
    border: '2px solid #101521',
    background: '#3df2a8',
    boxShadow: '0 0 10px rgba(61,242,168,0.55)',
  },

  lockedBadge: {
    position: 'absolute',
    top: '-0.18rem',
    right: '-0.18rem',
    width: '1.1rem',
    height: '1.1rem',
    display: 'grid',
    placeItems: 'center',
    border: '2px solid #111622',
    borderRadius: '999px',
    color: '#ffffff',
    background: '#7c5cff',
  },

  chatContent: {
    minWidth: 0,
    display: 'grid',
    gap: '0.15rem',
  },

  nameLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.32rem',
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
    fontSize: '0.62rem',
    fontWeight: 900,
  },

  groupBadge: {
    padding: '0.16rem 0.35rem',
    borderRadius: '999px',
    color: '#d9e2ff',
    background: 'rgba(124,92,255,0.16)',
    fontSize: '0.58rem',
    fontWeight: 850,
  },

  usernameLine: {
    overflow: 'hidden',
    color: '#8f9db8',
    fontSize: '0.68rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  messagePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    overflow: 'hidden',
    fontSize: '0.73rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  chatMeta: {
    display: 'grid',
    justifyItems: 'end',
    alignContent: 'center',
    gap: '0.32rem',
    minWidth: '2.5rem',
  },

  chatTime: {
    color: '#91a0bc',
    fontSize: '0.66rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  unreadBadge: {
    minWidth: '1.25rem',
    height: '1.25rem',
    display: 'grid',
    placeItems: 'center',
    padding: '0 0.25rem',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.62rem',
    fontWeight: 900,
  },

  rowIndicators: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#8492ae',
  },

  rowActions: {
    display: 'flex',
    gap: '0.28rem',
    padding: '0 0.65rem 0.6rem',
    overflowX: 'auto',
  },

  rowActionButton: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#c8d4e9',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },

  rowActionButtonDanger: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,79,122,0.2)',
    borderRadius: '999px',
    color: '#ff9eb8',
    background: 'rgba(255,79,122,0.08)',
    cursor: 'pointer',
  },

  emptyState: {
    display: 'grid',
    justifyItems: 'center',
    padding: '2.4rem 1rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '1.2rem',
    background: 'rgba(255,255,255,0.035)',
    textAlign: 'center',
  },

  emptyIllustration: {
    position: 'relative',
    width: '4.3rem',
    height: '4.3rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '1.4rem',
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.36), rgba(77,215,255,0.18))',
    boxShadow: '0 0 30px rgba(124,92,255,0.2)',
  },

  emptySparkle: {
    position: 'absolute',
    top: '-0.45rem',
    right: '-0.45rem',
    width: '1.45rem',
    height: '1.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '2px solid #111622',
    borderRadius: '999px',
    color: '#ffffff',
    background: '#ff4fd8',
  },

  emptyTitle: {
    margin: '0.85rem 0 0',
    color: '#f5f8ff',
    fontSize: '1rem',
    fontWeight: 900,
  },

  emptyText: {
    maxWidth: '24rem',
    margin: '0.45rem 0 0',
    color: '#9aa7bf',
    fontSize: '0.8rem',
    lineHeight: 1.55,
  },

  startChatButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    marginTop: '0.9rem',
    padding: '0.62rem 0.85rem',
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.75rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  featurePanel: {
    marginTop: '1rem',
    padding: '0.9rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '1.2rem',
    background: 'rgba(255,255,255,0.04)',
  },

  panelHeading: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.7rem',
  },

  panelTitle: {
    margin: 0,
    color: '#f2f6ff',
    fontSize: '0.92rem',
    fontWeight: 900,
  },

  panelSubtitle: {
    margin: '0.28rem 0 0',
    color: '#8997b2',
    fontSize: '0.72rem',
    lineHeight: 1.45,
  },

  aiSuggestionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.45rem',
    marginTop: '0.75rem',
  },

  aiSuggestion: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    minHeight: '2.6rem',
    padding: '0.55rem',
    border: '1px solid rgba(124,92,255,0.18)',
    borderRadius: '0.8rem',
    color: '#d7d0ff',
    background: 'rgba(124,92,255,0.08)',
    fontSize: '0.7rem',
    fontWeight: 750,
    textAlign: 'left',
    cursor: 'pointer',
  },

  systemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.45rem',
    marginTop: '0.75rem',
  },

  systemCard: {
    display: 'grid',
    gap: '0.4rem',
    minHeight: '3.8rem',
    alignContent: 'space-between',
    padding: '0.62rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.85rem',
    background: 'rgba(255,255,255,0.045)',
  },

  systemName: {
    color: '#d6e0f1',
    fontSize: '0.72rem',
    lineHeight: 1.3,
    fontWeight: 750,
  },

  systemState: (state) => ({
    display: 'inline-flex',
    width: 'fit-content',
    padding: '0.23rem 0.42rem',
    borderRadius: '999px',
    color: '#ffffff',
    background:
      state === 'Active'
        ? 'rgba(61,242,168,0.13)'
        : state === 'Protected'
          ? 'rgba(124,92,255,0.17)'
          : state === 'Syncing'
            ? 'rgba(77,215,255,0.14)'
            : 'rgba(255,255,255,0.08)',
    fontSize: '0.62rem',
    fontWeight: 850,
  }),

  futureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.45rem',
    marginTop: '0.75rem',
  },

  futureCard: {
    display: 'grid',
    gap: '0.35rem',
    minHeight: '3.6rem',
    alignContent: 'space-between',
    padding: '0.62rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.85rem',
    color: '#c4cee2',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))',
    fontSize: '0.72rem',
    fontWeight: 750,
  },

  futureCardSmall: {
    color: '#8b98b1',
    fontSize: '0.62rem',
    fontWeight: 700,
  },

  floatingButton: {
    position: 'fixed',
    right: '1rem',
    bottom: '6.4rem',
    zIndex: 60,
    width: '3.5rem',
    height: '3.5rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    boxShadow:
      '0 16px 34px rgba(0,0,0,0.35), 0 0 24px rgba(124,92,255,0.28)',
    cursor: 'pointer',
  },

  floatingMenu: {
    position: 'fixed',
    right: '1rem',
    bottom: '10.35rem',
    zIndex: 59,
    display: 'grid',
    gap: '0.4rem',
    width: 'min(15rem, calc(100vw - 2rem))',
    padding: '0.55rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1rem',
    background: 'rgba(15,19,31,0.98)',
    boxShadow: '0 24px 65px rgba(0,0,0,0.48)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  },

  floatingMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    width: '100%',
    padding: '0.65rem',
    border: 0,
    borderRadius: '0.65rem',
    color: '#eef3ff',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.75rem',
    fontWeight: 750,
    textAlign: 'left',
    cursor: 'pointer',
  },

  floatingMenuClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    width: '100%',
    padding: '0.55rem',
    border: 0,
    borderRadius: '0.65rem',
    color: '#9eabc3',
    background: 'transparent',
    fontSize: '0.72rem',
    cursor: 'pointer',
  },
};