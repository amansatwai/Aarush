import { memo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  Bot,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  FolderLock,
  History,
  Image as ImageIcon,
  Link2,
  Lock,
  Mic,
  MoreHorizontal,
  Pin,
  Search,
  Shield,
  Star,
  UserRound,
  Users,
  Video,
  Volume2,
  X,
} from 'lucide-react';

const DEFAULT_FILTERS = [
  { key: 'all', label: 'All', icon: Search },
  { key: 'unread', label: 'Unread', icon: CheckCircle2 },
  { key: 'groups', label: 'Groups', icon: Users },
  { key: 'archived', label: 'Archived', icon: Archive },
  { key: 'hidden', label: 'Hidden', icon: Shield },
  { key: 'locked', label: 'Locked', icon: Lock },
  { key: 'vault', label: 'Vault', icon: FolderLock },
  { key: 'ai', label: 'AI', icon: Bot },
  { key: 'favorites', label: 'Favorites', icon: Star },
  { key: 'online', label: 'Online', icon: CheckCircle2 },
  { key: 'verified', label: 'Verified', icon: Check },
  { key: 'recent', label: 'Recent', icon: Clock3 },
  { key: 'media', label: 'Media', icon: ImageIcon },
  { key: 'files', label: 'Files', icon: FileText },
  { key: 'links', label: 'Links', icon: Link2 },
  { key: 'voice', label: 'Voice', icon: Mic },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'photos', label: 'Photos', icon: ImageIcon },
  { key: 'videos', label: 'Videos', icon: Video },
];

const SEARCH_STORAGE_KEY = 'aarush_chat_search_history_v2';
const SAVED_STORAGE_KEY = 'aarush_chat_saved_searches_v2';

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
    // Search persistence is best effort.
  }
}

function formatSearchTime(value) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
  });
}

function ResultAvatar({ result }) {
  const avatar =
    result.avatar ||
    result.avatarUrl ||
    `https://i.pravatar.cc/120?u=${result.id || result.username}`;

  return (
    <span style={styles.avatarWrapper}>
      <img
        src={avatar}
        alt=""
        loading="lazy"
        decoding="async"
        style={styles.avatar}
      />

      {result.online || result.isOnline ? (
        <span style={styles.onlineDot} />
      ) : null}
    </span>
  );
}

function VerifiedBadge() {
  return (
    <span style={styles.verifiedBadge} aria-label="Verified">
      <Check size={10} />
    </span>
  );
}

function SearchResultRow({ result, onSelect }) {
  const username = String(
    result.username || 'unknown.user'
  ).replace(/^@/, '');

  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      style={styles.resultRow}
      aria-label={`Open ${result.displayName || username}`}
    >
      <ResultAvatar result={result} />

      <span style={styles.resultContent}>
        <span style={styles.resultTitle}>
          <strong>
            {result.displayName || result.name || username}
          </strong>

          {result.verified || result.isVerified ? (
            <VerifiedBadge />
          ) : null}
        </span>

        <span style={styles.resultUsername}>@{username}</span>

        <span style={styles.resultMessage}>
          {result.lastMessage ||
            result.preview ||
            'Open conversation'}
        </span>
      </span>

      <span style={styles.resultMeta}>
        <span>{formatSearchTime(result.timestamp || result.updatedAt)}</span>

        {result.unreadCount > 0 ? (
          <b style={styles.unreadBadge}>
            {result.unreadCount > 99
              ? '99+'
              : result.unreadCount}
          </b>
        ) : null}

        {result.verified || result.isVerified ? (
          <VerifiedBadge />
        ) : null}
      </span>
    </button>
  );
}

function HistoryRow({
  item,
  onSelect,
  onRemove,
  onPin,
  pinned,
  saved,
}) {
  const value = typeof item === 'string' ? item : item.value;
  const label = typeof item === 'string' ? item : item.label || item.value;

  return (
    <div style={styles.historyRow}>
      <button
        type="button"
        onClick={() => onSelect(value)}
        style={styles.historyMain}
      >
        {saved ? <Star size={14} /> : <History size={14} />}
        <span>{label}</span>
      </button>

      <button
        type="button"
        onClick={() => onPin(value)}
        style={{
          ...styles.historyAction,
          ...(pinned ? styles.historyActionActive : {}),
        }}
        aria-label={pinned ? 'Unpin search' : 'Pin search'}
      >
        <Pin size={13} />
      </button>

      <button
        type="button"
        onClick={() => onRemove(value)}
        style={styles.historyAction}
        aria-label="Remove search"
      >
        <X size={13} />
      </button>
    </div>
  );
}

function FilterSheet({filters, activeFilters, onToggle, onClose}) {
  return (
    <div
      style={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={styles.filterSheet}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search filters"
      >
        <div style={styles.sheetHandle} />

        <div style={styles.sheetHeader}>
          <div>
            <strong>Search filters</strong>
            <span>Refine chats, people, and media</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close filters"
          >
            <X size={16} />
          </button>
        </div>

        <div style={styles.filterGrid}>
          {filters.map((filter) => {
            const Icon = filter.icon;
            const active = activeFilters.includes(filter.key);

            return (
              <button
                type="button"
                key={filter.key}
                onClick={() => onToggle(filter.key)}
                style={{
                  ...styles.filterButton,
                  ...(active ? styles.activeFilterButton : {}),
                }}
              >
                <Icon size={15} />
                {filter.label}
                {active ? <Check size={13} /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChatSearchBar({
  value = '',
  onChange,
  onClear,
  onSelectResult,
  onOpenFilter,
  recentSearches,
  savedSearches,
  suggestions = [],
  results = [],
  isSearching = false,
  filters = DEFAULT_FILTERS,
  selectedFilters = [],
  onFiltersChange,
  debounceMs = 250,
  className = '',
  style = {},
}) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const [query, setQuery] = useState(value);
  const [focused, setFocused] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(
    selectedFilters
  );
  const [history, setHistory] = useState(() =>
    recentSearches || readStorage(SEARCH_STORAGE_KEY, [])
  );
  const [saved, setSaved] = useState(() =>
    savedSearches || readStorage(SAVED_STORAGE_KEY, [])
  );
  const [pinnedSearches, setPinnedSearches] = useState([]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (recentSearches) {
      setHistory(recentSearches);
    }
  }, [recentSearches]);

  useEffect(() => {
    if (savedSearches) {
      setSaved(savedSearches);
    }
  }, [savedSearches]);

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const emitQuery = (nextValue) => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      onChange?.(nextValue);
    }, debounceMs);
  };

  const updateQuery = (nextValue) => {
    setQuery(nextValue);
    emitQuery(nextValue);

    const normalized = nextValue.trim();

    if (normalized) {
      setHistory((current) => {
        const next = [
          normalized,
          ...current.filter((item) => {
            const value =
              typeof item === 'string' ? item : item.value;
            return value !== normalized;
          }),
        ].slice(0, 12);

        writeStorage(SEARCH_STORAGE_KEY, next);
        return next;
      });
    }
  };

  const clearSearch = () => {
    setQuery('');
    onClear?.();
    onChange?.('');
    inputRef.current?.focus();
  };

  const selectResult = (result) => {
    const id = result.id || result.chatId;

    if (typeof onSelectResult === 'function') {
      onSelectResult(result);
      return;
    }

    if (id) {
      navigate(`/chats/${id}`);
    }
  };

  const selectHistory = (searchValue) => {
    setQuery(searchValue);
    onChange?.(searchValue);
    inputRef.current?.focus();
  };

  const removeHistoryItem = (searchValue) => {
    setHistory((current) => {
      const next = current.filter((item) => {
        const value =
          typeof item === 'string' ? item : item.value;
        return value !== searchValue;
      });

      writeStorage(SEARCH_STORAGE_KEY, next);
      return next;
    });
  };

  const clearAllHistory = () => {
    setHistory([]);
    writeStorage(SEARCH_STORAGE_KEY, []);
  };

  const togglePinnedSearch = (searchValue) => {
    setPinnedSearches((current) =>
      current.includes(searchValue)
        ? current.filter((item) => item !== searchValue)
        : [...current, searchValue]
    );
  };

  const saveCurrentSearch = () => {
    const normalized = query.trim();

    if (!normalized) {
      return;
    }

    setSaved((current) => {
      const exists = current.some((item) => {
        const value =
          typeof item === 'string' ? item : item.value;
        return value === normalized;
      });

      if (exists) {
        return current;
      }

      const next = [
        ...current,
        {
          value: normalized,
          label: normalized,
          createdAt: Date.now(),
        },
      ];

      writeStorage(SAVED_STORAGE_KEY, next);
      return next;
    });
  };

  const removeSavedSearch = (searchValue) => {
    setSaved((current) => {
      const next = current.filter((item) => {
        const value =
          typeof item === 'string' ? item : item.value;
        return value !== searchValue;
      });

      writeStorage(SAVED_STORAGE_KEY, next);
      return next;
    });
  };

  const toggleFilter = (filterKey) => {
    setActiveFilters((current) => {
      const next = current.includes(filterKey)
        ? current.filter((item) => item !== filterKey)
        : [...current, filterKey];

      onFiltersChange?.(next);
      return next;
    });
  };

  const hasQuery = query.trim().length > 0;
  const shouldShowPanel =
    focused &&
    (hasQuery ||
      history.length > 0 ||
      saved.length > 0 ||
      suggestions.length > 0);

  const visibleSuggestions = hasQuery
    ? suggestions.slice(0, 8)
    : [];

  return (
    <>
      <div
        className={className}
        style={{
          ...styles.wrapper,
          ...style,
        }}
      >
        <div
          style={{
            ...styles.searchContainer,
            ...(focused ? styles.searchContainerFocused : {}),
          }}
        >
          <Search size={17} color="#9aa8c1" />

          <input
            ref={inputRef}
            value={query}
            onFocus={() => setFocused(true)}
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setFocused(false);
                inputRef.current?.blur();
              }

              if (event.key === 'Enter' && results[0]) {
                event.preventDefault();
                selectResult(results[0]);
              }
            }}
            placeholder="Search chats, usernames, or messages"
            style={styles.input}
            aria-label="Search chats, usernames, or messages"
            autoComplete="off"
            spellCheck="false"
          />

          {isSearching ? (
            <span style={styles.searchingLabel}>Searching</span>
          ) : null}

          {hasQuery ? (
            <button
              type="button"
              onClick={clearSearch}
              style={styles.iconButton}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              style={{
                ...styles.iconButton,
                ...(activeFilters.length > 0
                  ? styles.activeIconButton
                  : {}),
              }}
              aria-label="Open search filters"
            >
              <Filter size={16} />
              {activeFilters.length > 0 ? (
                <span style={styles.filterCount}>
                  {activeFilters.length}
                </span>
              ) : null}
            </button>
          )}
        </div>

        {activeFilters.length > 0 ? (
          <div style={styles.activeFilters}>
            {activeFilters.map((filterKey) => {
              const filter = filters.find(
                (item) => item.key === filterKey
              );

              return (
                <button
                  type="button"
                  key={filterKey}
                  onClick={() => toggleFilter(filterKey)}
                  style={styles.activeFilterChip}
                >
                  {filter?.label || filterKey}
                  <X size={11} />
                </button>
              );
            })}
          </div>
        ) : null}

        {shouldShowPanel ? (
          <div
            style={styles.resultsPanel}
            onMouseDown={(event) => event.preventDefault()}
          >
            <div style={styles.panelHeader}>
              <span>
                {hasQuery ? 'Search results' : 'Quick search'}
              </span>

              <div style={styles.panelHeaderActions}>
                {hasQuery ? (
                  <button
                    type="button"
                    onClick={saveCurrentSearch}
                    style={styles.panelTextButton}
                  >
                    Save search
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setFocused(false)}
                  style={styles.closePanelButton}
                  aria-label="Close search suggestions"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {hasQuery && visibleSuggestions.length > 0 ? (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>
                  <SparklesIcon />
                  AI smart suggestions
                </div>

                <div style={styles.suggestionList}>
                  {visibleSuggestions.map((suggestion, index) => {
                    const item =
                      typeof suggestion === 'string'
                        ? {
                            label: suggestion,
                            type: 'suggestion',
                          }
                        : suggestion;

                    return (
                      <button
                        type="button"
                        key={`${item.label}-${index}`}
                        onClick={() =>
                          item.id
                            ? selectResult(item)
                            : selectHistory(item.label)
                        }
                        style={styles.suggestionButton}
                      >
                        {item.type === 'group' ? (
                          <UsersIcon />
                        ) : item.type === 'ai' ? (
                          <Bot size={14} />
                        ) : (
                          <Search size={14} />
                        )}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {hasQuery && results.length > 0 ? (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>
                  <Search size={13} />
                  People, groups, and conversations
                </div>

                <div style={styles.resultList}>
                  {results.slice(0, 12).map((result) => (
                    <SearchResultRow
                      key={result.id || result.chatId || result.username}
                      result={result}
                      onSelect={selectResult}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {hasQuery &&
            !isSearching &&
            results.length === 0 &&
            visibleSuggestions.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <Search size={22} />
                </div>

                <strong>No results found</strong>

                <span>
                  Try a username, display name, group, user ID, or
                  message.
                </span>
              </div>
            ) : null}

            {!hasQuery && history.length > 0 ? (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionLabel}>
                    <History size={13} />
                    Recent searches
                  </span>

                  <button
                    type="button"
                    onClick={clearAllHistory}
                    style={styles.panelTextButton}
                  >
                    Clear all
                  </button>
                </div>

                <div style={styles.historyList}>
                  {history.slice(0, 8).map((item) => {
                    const value =
                      typeof item === 'string'
                        ? item
                        : item.value;

                    return (
                      <HistoryRow
                        key={value}
                        item={item}
                        onSelect={selectHistory}
                        onRemove={removeHistoryItem}
                        onPin={togglePinnedSearch}
                        pinned={pinnedSearches.includes(value)}
                        saved={false}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}

            {!hasQuery && saved.length > 0 ? (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <span style={styles.sectionLabel}>
                    <Star size={13} />
                    Saved searches
                  </span>
                </div>

                <div style={styles.historyList}>
                  {saved.map((item) => {
                    const value =
                      typeof item === 'string'
                        ? item
                        : item.value;

                    return (
                      <HistoryRow
                        key={value}
                        item={item}
                        onSelect={selectHistory}
                        onRemove={removeSavedSearch}
                        onPin={togglePinnedSearch}
                        pinned={pinnedSearches.includes(value)}
                        saved
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}

            {!hasQuery &&
            history.length === 0 &&
            saved.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <UserRound size={22} />
                </div>

                <strong>Search your Aarush network</strong>

                <span>
                  Find recent chats, groups, verified users, media,
                  files, and AI conversations.
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {filterOpen ? (
        <FilterSheet
          filters={filters}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          onClose={() => setFilterOpen(false)}
        />
      ) : null}

      <style>{`
        .aarush-chat-search-bar {
          position: relative;
          z-index: 40;
        }

        .aarush-chat-search-bar input:focus-visible,
        .aarush-chat-search-bar button:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-chat-search-bar,
          .aarush-chat-search-bar * {
            transition: none !important;
            animation: none !important;
          }
        }

        @media (prefers-contrast: more) {
          .aarush-chat-search-bar .aarush-search-container {
            border-color: rgba(255,255,255,0.4) !important;
          }
        }
      `}</style>
    </>
  );
}

function SparklesIcon() {
  return <Sparkles size={13} />;
}

function UsersIcon() {
  return <Users size={14} />;
}

const styles = {
  wrapper: {
    position: 'relative',
    width: '100%',
  },

  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: '2.85rem',
    padding: '0.42rem 0.55rem 0.42rem 0.8rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,0.06)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.16)',
    transition:
      'border-color 180ms ease, box-shadow 180ms ease, background 180ms ease',
  },

  searchContainerFocused: {
    borderColor: 'rgba(124,92,255,0.48)',
    background: 'rgba(255,255,255,0.075)',
    boxShadow:
      '0 0 0 3px rgba(124,92,255,0.11), 0 16px 36px rgba(0,0,0,0.2)',
  },

  input: {
    flex: 1,
    minWidth: 0,
    border: 0,
    outline: 0,
    color: '#ffffff',
    background: 'transparent',
    fontFamily: 'inherit',
    fontSize: '0.84rem',
  },

  searchingLabel: {
    color: '#9c8cff',
    fontSize: '0.62rem',
    fontWeight: 800,
  },

  iconButton: {
    position: 'relative',
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    color: '#dce6f7',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  activeIconButton: {
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },

  filterCount: {
    position: 'absolute',
    top: '-0.2rem',
    right: '-0.2rem',
    minWidth: '0.9rem',
    height: '0.9rem',
    display: 'grid',
    placeItems: 'center',
    border: '2px solid #111622',
    borderRadius: '999px',
    color: '#ffffff',
    background: '#ff4fd8',
    fontSize: '0.52rem',
    fontWeight: 900,
  },

  activeFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
    marginTop: '0.45rem',
  },

  activeFilterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.3rem 0.45rem',
    border: '1px solid rgba(124,92,255,0.25)',
    borderRadius: '999px',
    color: '#dcd4ff',
    background: 'rgba(124,92,255,0.12)',
    fontSize: '0.62rem',
    cursor: 'pointer',
  },

  resultsPanel: {
    position: 'absolute',
    top: 'calc(100% + 0.45rem)',
    right: 0,
    left: 0,
    maxHeight: 'min(72vh, 560px)',
    overflowY: 'auto',
    padding: '0.7rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1.1rem',
    background: 'rgba(15,20,32,0.98)',
    boxShadow: '0 24px 65px rgba(0,0,0,0.44)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    color: '#dce6f8',
    fontSize: '0.72rem',
    fontWeight: 850,
  },

  panelHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },

  panelTextButton: {
    border: 0,
    color: '#a9edff',
    background: 'transparent',
    fontSize: '0.64rem',
    fontWeight: 750,
    cursor: 'pointer',
  },

  closePanelButton: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#c7d2e5',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  section: {
    marginTop: '0.75rem',
    paddingTop: '0.65rem',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },

  sectionLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    color: '#94a2bc',
    fontSize: '0.64rem',
    fontWeight: 800,
  },

  suggestionList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginTop: '0.5rem',
  },

  suggestionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.45rem 0.55rem',
    border: '1px solid rgba(124,92,255,0.18)',
    borderRadius: '999px',
    color: '#ded8ff',
    background: 'rgba(124,92,255,0.09)',
    fontSize: '0.66rem',
    cursor: 'pointer',
  },

  resultList: {
    display: 'grid',
    gap: '0.38rem',
    marginTop: '0.5rem',
  },

  resultRow: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '0.55rem',
    width: '100%',
    padding: '0.5rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.75rem',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.045)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  avatarWrapper: {
    position: 'relative',
    width: '2.45rem',
    height: '2.45rem',
    flexShrink: 0,
  },

  avatar: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    border: '2px solid rgba(124,92,255,0.3)',
    borderRadius: '999px',
  },

  onlineDot: {
    position: 'absolute',
    right: '-0.02rem',
    bottom: '-0.02rem',
    width: '0.62rem',
    height: '0.62rem',
    border: '2px solid #111622',
    borderRadius: '999px',
    background: '#3df2a8',
  },

  resultContent: {
    display: 'grid',
    gap: '0.12rem',
    minWidth: 0,
  },

  resultTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.28rem',
    minWidth: 0,
    color: '#f4f7ff',
    fontSize: '0.76rem',
  },

  resultUsername: {
    overflow: 'hidden',
    color: '#8f9db6',
    fontSize: '0.63rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  resultMessage: {
    overflow: 'hidden',
    color: '#aab6cc',
    fontSize: '0.68rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  resultMeta: {
    display: 'grid',
    justifyItems: 'end',
    gap: '0.3rem',
    color: '#8f9db6',
    fontSize: '0.6rem',
  },

  verifiedBadge: {
    width: '0.9rem',
    height: '0.9rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
  },

  unreadBadge: {
    minWidth: '1.15rem',
    height: '1.15rem',
    display: 'grid',
    placeItems: 'center',
    padding: '0 0.22rem',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.58rem',
    fontWeight: 900,
  },

  historyList: {
    display: 'grid',
    gap: '0.3rem',
    marginTop: '0.45rem',
  },

  historyRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    alignItems: 'center',
    gap: '0.25rem',
  },

  historyMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    minWidth: 0,
    padding: '0.48rem',
    border: 0,
    borderRadius: '0.6rem',
    color: '#d8e2f4',
    background: 'rgba(255,255,255,0.04)',
    textAlign: 'left',
    fontSize: '0.68rem',
    cursor: 'pointer',
  },

  historyAction: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#92a0ba',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },

  historyActionActive: {
    color: '#d9cfff',
    background: 'rgba(124,92,255,0.17)',
  },

  emptyState: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.4rem',
    padding: '1.8rem 1rem',
    color: '#a2afc5',
    fontSize: '0.72rem',
    textAlign: 'center',
  },

  emptyIcon: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    marginBottom: '0.25rem',
    borderRadius: '1rem',
    color: '#d8d0ff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(77,215,255,0.12))',
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

  filterSheet: {
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

  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
    gap: '0.45rem',
  },

  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.38rem',
    minHeight: '2.55rem',
    padding: '0.52rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.7rem',
    color: '#dce5f7',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '0.68rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeFilterButton: {
    color: '#ffffff',
    borderColor: 'rgba(124,92,255,0.38)',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },
};

export default memo(ChatSearchBar);