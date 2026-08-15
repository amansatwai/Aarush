import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  CloudSun,
  Copy,
  ExternalLink,
  Film,
  Flame,
  Heart,
  Hash,
  Image,
  Link2,
  MapPin,
  Music,
  Palette,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Sticker,
  Tag,
  Trash2,
  Type,
  UserRound,
  X,
} from 'lucide-react';

const RECENT_KEY = 'aarush_story_recent_stickers';
const FAVORITES_KEY = 'aarush_story_favorite_stickers';

const CATEGORIES = [
  'Trending',
  'Recently Used',
  'Favorites',
  'Emoji',
  'GIF',
  'Location',
  'Mention',
  'Hashtag',
  'Poll',
  'Question',
  'Countdown',
  'Link',
  'Time',
  'Date',
  'Weather',
  'Mood',
  'Music',
  'Camera',
  'Frames',
  'Decorative',
];

const STICKERS = [
  { id: 'emoji', type: 'emoji', label: 'Emoji', icon: '😊', category: 'Emoji' },
  { id: 'gif', type: 'gif', label: 'GIF', icon: 'GIF', category: 'GIF' },
  { id: 'location', type: 'location', label: 'Location', icon: MapPin, category: 'Location' },
  { id: 'mention', type: 'mention', label: 'Mention', icon: UserRound, category: 'Mention' },
  { id: 'hashtag', type: 'hashtag', label: 'Hashtag', icon: Hash, category: 'Hashtag' },
  { id: 'poll', type: 'poll', label: 'Poll', icon: '📊', category: 'Poll' },
  { id: 'question', type: 'question', label: 'Question', icon: '❓', category: 'Question' },
  { id: 'countdown', type: 'countdown', label: 'Countdown', icon: Clock3, category: 'Countdown' },
  { id: 'link', type: 'link', label: 'Link', icon: Link2, category: 'Link' },
  { id: 'time', type: 'time', label: 'Time', icon: Clock3, category: 'Time' },
  { id: 'date', type: 'date', label: 'Date', icon: CalendarDays, category: 'Date' },
  { id: 'weather', type: 'weather', label: 'Weather', icon: CloudSun, category: 'Weather' },
  { id: 'mood', type: 'mood', label: 'Mood', icon: Flame, category: 'Mood' },
  { id: 'music', type: 'music', label: 'Music', icon: Music, category: 'Music' },
  { id: 'camera', type: 'camera', label: 'Camera', icon: Camera, category: 'Camera' },
  { id: 'frames', type: 'frames', label: 'Frames', icon: Image, category: 'Frames' },
  { id: 'decorative', type: 'decorative', label: 'Decorative', icon: Sparkles, category: 'Decorative' },
];

const EMOJIS = [
  '😀', '😂', '🥹', '😍', '🥳', '😎', '🤍', '❤️',
  '🔥', '✨', '💫', '🌈', '👏', '🙌', '💯', '🎉',
  '😮', '😢', '😡', '🤔', '👀', '💜', '💙', '💚',
];

const GIFS = [
  { id: 'gif-reaction', label: 'Reaction', icon: '😂' },
  { id: 'gif-love', label: 'Love', icon: '💖' },
  { id: 'gif-fire', label: 'Fire', icon: '🔥' },
  { id: 'gif-celebrate', label: 'Celebrate', icon: '🎉' },
  { id: 'gif-wow', label: 'Wow', icon: '😮' },
  { id: 'gif-vibes', label: 'Vibes', icon: '✨' },
];

function readStorage(key) {
  if (typeof window === 'undefined') return [];

  try {
    const value = window.localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch {
    // Persistence is optional.
  }
}

function resolveIcon(icon) {
  if (typeof icon === 'function') {
    const Icon = icon;
    return <Icon size={21} />;
  }

  return <span style={styles.emojiIcon}>{icon}</span>;
}

function createOverlay(sticker, data = {}) {
  return {
    id: `sticker-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    type: sticker.type,
    x: 50,
    y: 50,
    scale: 1,
    rotation: 0,
    zIndex: 1,
    opacity: 1,
    flipX: false,
    flipY: false,
    data: {
      label: sticker.label,
      ...data,
    },
  };
}

export default function StoryStickersPanel({
  visible = false,
  selectedSticker = null,
  onSelectSticker,
  onClose,
  onSearch,
  onAddSticker,
}) {
  const panelRef = useRef(null);
  const searchRef = useRef(null);

  const [category, setCategory] =
    useState('Trending');
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] =
    useState([]);
  const [recentIds, setRecentIds] = useState(() =>
    readStorage(RECENT_KEY)
  );
  const [favoriteIds, setFavoriteIds] =
    useState(() => readStorage(FAVORITES_KEY));
  const [emojiTone, setEmojiTone] = useState('default');
  const [editorType, setEditorType] = useState(null);
  const [editorData, setEditorData] =
    useState({});
  const [selectedOverlay, setSelectedOverlay] =
    useState(selectedSticker || null);
  const [gifQuery, setGifQuery] = useState('');

  useEffect(() => {
    if (!visible) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (editorType) {
          setEditorType(null);
        } else {
          onClose?.();
        }
      }

      if (
        event.key === '/' &&
        document.activeElement !== searchRef.current
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [editorType, onClose, visible]);

  useEffect(() => {
    setSelectedOverlay(selectedSticker || null);
  }, [selectedSticker]);

  const normalizedQuery = query.trim().toLowerCase();

  const recentStickers = useMemo(
    () =>
      recentIds
        .map((id) =>
          STICKERS.find((sticker) => sticker.id === id)
        )
        .filter(Boolean),
    [recentIds]
  );

  const favoriteStickers = useMemo(
    () =>
      favoriteIds
        .map((id) =>
          STICKERS.find((sticker) => sticker.id === id)
        )
        .filter(Boolean),
    [favoriteIds]
  );

  const filteredStickers = useMemo(() => {
    if (category === 'Recently Used') {
      return recentStickers;
    }

    if (category === 'Favorites') {
      return favoriteStickers;
    }

    let result = STICKERS;

    if (category !== 'Trending') {
      result = result.filter(
        (sticker) => sticker.category === category
      );
    }

    if (normalizedQuery) {
      result = result.filter((sticker) =>
        `${sticker.label} ${sticker.type}`
          .toLowerCase()
          .includes(normalizedQuery)
      );
    }

    return result;
  }, [
    category,
    favoriteStickers,
    normalizedQuery,
    recentStickers,
  ]);

  const addRecent = useCallback((sticker) => {
    const next = [
      sticker.id,
      ...recentIds.filter((id) => id !== sticker.id),
    ].slice(0, 10);

    setRecentIds(next);
    writeStorage(RECENT_KEY, next);
  }, [recentIds]);

  const toggleFavorite = useCallback((sticker) => {
    setFavoriteIds((current) => {
      const next = current.includes(sticker.id)
        ? current.filter((id) => id !== sticker.id)
        : [sticker.id, ...current];

      writeStorage(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const selectSticker = useCallback(
    (sticker, data = {}) => {
      addRecent(sticker);

      const overlay = createOverlay(sticker, data);

      setSelectedOverlay(overlay);
      onSelectSticker?.(sticker);
      onAddSticker?.(overlay);
      setEditorType(null);
    },
    [addRecent, onAddSticker, onSelectSticker]
  );

  const openSticker = useCallback((sticker) => {
    const editable = [
      'poll',
      'question',
      'countdown',
      'link',
      'mention',
      'hashtag',
      'location',
      'weather',
      'time',
      'date',
      'emoji',
      'gif',
    ];

    if (editable.includes(sticker.type)) {
      setEditorType(sticker.type);
      setEditorData({});
      return;
    }

    selectSticker(sticker);
  }, [selectSticker]);

  const changeSearch = useCallback(
    (event) => {
      const value = event.target.value;
      setQuery(value);
      onSearch?.(value);

      if (!value.trim()) return;

      const next = [
        value.trim(),
        ...recentSearches.filter(
          (item) =>
            item.toLowerCase() !==
            value.trim().toLowerCase()
        ),
      ].slice(0, 6);

      setRecentSearches(next);
    },
    [onSearch, recentSearches]
  );

  const updateEditorData = useCallback(
    (key, value) => {
      setEditorData((current) => ({
        ...current,
        [key]: value,
      }));
    },
    []
  );

  const confirmEditor = useCallback(() => {
    const sticker = STICKERS.find(
      (item) => item.type === editorType
    );

    if (!sticker) return;

    selectSticker(sticker, {
      ...editorData,
      skinTone: emojiTone,
    });
  }, [
    editorData,
    editorType,
    emojiTone,
    selectSticker,
  ]);

  const removeOverlay = useCallback(() => {
    if (!selectedOverlay) return;

    onAddSticker?.({
      ...selectedOverlay,
      deleted: true,
    });
    setSelectedOverlay(null);
  }, [onAddSticker, selectedOverlay]);

  const duplicateOverlay = useCallback(() => {
    if (!selectedOverlay) return;

    const duplicate = {
      ...selectedOverlay,
      id: `sticker-${Date.now()}`,
      x: Math.min(95, Number(selectedOverlay.x) + 5),
      y: Math.min(95, Number(selectedOverlay.y) + 5),
    };

    setSelectedOverlay(duplicate);
    onAddSticker?.(duplicate);
  }, [onAddSticker, selectedOverlay]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Story stickers"
      style={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        ref={panelRef}
        style={styles.panel}
        onClick={(event) => event.stopPropagation()}
      >
        <header style={styles.header}>
          <div>
            <strong style={styles.title}>
              Stickers
            </strong>
            <span style={styles.subtitle}>
              Add personality to your story
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sticker panel"
            style={styles.closeButton}
          >
            <X size={18} />
          </button>
        </header>

        <div style={styles.searchBox}>
          <Search size={16} />

          <input
            ref={searchRef}
            value={query}
            onChange={changeSearch}
            placeholder="Search stickers"
            aria-label="Search stickers"
            style={styles.searchInput}
          />

          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear sticker search"
              style={styles.clearButton}
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        <div
          style={styles.categoryScroller}
          className="aarush-stickers-category-scroller"
        >
          {CATEGORIES.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              style={{
                ...styles.categoryButton,
                ...(category === item
                  ? styles.activeCategory
                  : {}),
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {category === 'Emoji' ? (
          <div style={styles.emojiTools}>
            <span>Skin tone</span>

            {[
              ['default', '😊'],
              ['light', '🏻'],
              ['medium', '🏽'],
              ['dark', '🏿'],
            ].map(([id, icon]) => (
              <button
                type="button"
                key={id}
                onClick={() => setEmojiTone(id)}
                aria-label={`${id} skin tone`}
                style={{
                  ...styles.toneButton,
                  ...(emojiTone === id
                    ? styles.activeTone
                    : {}),
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        ) : null}

        {category === 'GIF' ? (
          <div style={styles.gifSearch}>
            <Search size={15} />
            <input
              value={gifQuery}
              onChange={(event) =>
                setGifQuery(event.target.value)
              }
              placeholder="Search GIFs"
              aria-label="Search GIFs"
              style={styles.searchInput}
            />
          </div>
        ) : null}

        {category === 'Emoji' ? (
          <div style={styles.emojiGrid}>
            {EMOJIS.filter((emoji) =>
              normalizedQuery
                ? emoji.includes(normalizedQuery)
                : true
            ).map((emoji, index) => (
              <button
                type="button"
                key={`${emoji}-${index}`}
                onClick={() =>
                  selectSticker(
                    STICKERS.find(
                      (sticker) => sticker.type === 'emoji'
                    ),
                    {
                      value: emoji,
                      skinTone: emojiTone,
                    }
                  )
                }
                aria-label={`Add ${emoji}`}
                style={styles.emojiButton}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : null}

        {category === 'GIF' ? (
          <div style={styles.gifGrid}>
            {GIFS.filter((gif) =>
              gif.label
                .toLowerCase()
                .includes(gifQuery.toLowerCase())
            ).map((gif) => (
              <button
                type="button"
                key={gif.id}
                onClick={() => {
                  const sticker = STICKERS.find(
                    (item) => item.type === 'gif'
                  );

                  selectSticker(sticker, {
                    gifId: gif.id,
                    label: gif.label,
                  });
                }}
                style={styles.gifCard}
              >
                <span>{gif.icon}</span>
                <small>{gif.label}</small>
              </button>
            ))}
          </div>
        ) : null}

        {category !== 'Emoji' && category !== 'GIF' ? (
          <div style={styles.stickerGrid}>
            {filteredStickers.map((sticker) => {
              const favorite = favoriteIds.includes(
                sticker.id
              );

              return (
                <button
                  type="button"
                  key={sticker.id}
                  onClick={() => openSticker(sticker)}
                  aria-label={`Add ${sticker.label} sticker`}
                  style={{
                    ...styles.stickerCard,
                    ...(selectedSticker?.type ===
                    sticker.type
                      ? styles.selectedSticker
                      : {}),
                  }}
                >
                  <span style={styles.stickerIcon}>
                    {resolveIcon(sticker.icon)}
                  </span>

                  <span style={styles.stickerLabel}>
                    {sticker.label}
                  </span>

                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={
                      favorite
                        ? `Remove ${sticker.label} from favorites`
                        : `Favorite ${sticker.label}`
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(sticker);
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' ||
                        event.key === ' '
                      ) {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleFavorite(sticker);
                      }
                    }}
                    style={{
                      ...styles.favoriteButton,
                      ...(favorite
                        ? styles.favoriteActive
                        : {}),
                    }}
                  >
                    <Heart
                      size={13}
                      fill={
                        favorite
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {selectedOverlay ? (
          <div style={styles.overlayTools}>
            <span style={styles.overlayToolsTitle}>
              Selected sticker
            </span>

            <button
              type="button"
              onClick={duplicateOverlay}
              aria-label="Duplicate sticker"
              style={styles.toolButton}
            >
              <Copy size={14} />
              Duplicate
            </button>

            <button
              type="button"
              onClick={() =>
                onAddSticker?.({
                  ...selectedOverlay,
                  zIndex:
                    Number(selectedOverlay.zIndex || 1) + 1,
                })
              }
              aria-label="Bring sticker forward"
              style={styles.toolButton}
            >
              <ChevronDown
                size={14}
                style={{ transform: 'rotate(180deg)' }}
              />
              Forward
            </button>

            <button
              type="button"
              onClick={removeOverlay}
              aria-label="Delete sticker"
              style={styles.deleteButton}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        ) : null}

        {editorType ? (
          <StickerEditor
            type={editorType}
            data={editorData}
            onChange={updateEditorData}
            onCancel={() => setEditorType(null)}
            onConfirm={confirmEditor}
          />
        ) : null}
      </section>

      <style>{`
        .aarush-stickers-category-scroller {
          scrollbar-width: none;
        }

        .aarush-stickers-category-scroller::-webkit-scrollbar {
          display: none;
        }

        .aarush-sticker-card:hover {
          transform: translateY(-2px);
        }

        .aarush-sticker-card:active {
          transform: scale(.96);
        }

        @keyframes aarush-stickers-slide-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-stickers-pop {
          0% {
            transform: scale(.8);
          }
          70% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </div>
  );
}

function StickerEditor({
  type,
  data,
  onChange,
  onCancel,
  onConfirm,
}) {
  const title = {
    poll: 'Create Poll',
    question: 'Ask a Question',
    countdown: 'Create Countdown',
    link: 'Add Link',
    mention: 'Mention Someone',
    hashtag: 'Add Hashtag',
    location: 'Add Location',
    weather: 'Weather Sticker',
    time: 'Time Sticker',
    date: 'Date Sticker',
    emoji: 'Choose Emoji',
    gif: 'Choose GIF',
  }[type] || 'Edit Sticker';

  return (
    <div style={styles.editorOverlay}>
      <div style={styles.editorPanel}>
        <div style={styles.editorHeader}>
          <strong>{title}</strong>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close sticker editor"
            style={styles.closeButton}
          >
            <X size={16} />
          </button>
        </div>

        {type === 'poll' ? (
          <>
            <label style={styles.field}>
              Question
              <input
                value={data.question || ''}
                onChange={(event) =>
                  onChange(
                    'question',
                    event.target.value
                  )
                }
                placeholder="Ask your audience"
              />
            </label>

            <label style={styles.field}>
              Option A
              <input
                value={data.optionA || ''}
                onChange={(event) =>
                  onChange(
                    'optionA',
                    event.target.value
                  )
                }
                placeholder="Yes"
              />
            </label>

            <label style={styles.field}>
              Option B
              <input
                value={data.optionB || ''}
                onChange={(event) =>
                  onChange(
                    'optionB',
                    event.target.value
                  )
                }
                placeholder="No"
              />
            </label>
          </>
        ) : null}

        {type === 'question' ? (
          <>
            <label style={styles.field}>
              Prompt
              <input
                value={data.prompt || ''}
                onChange={(event) =>
                  onChange(
                    'prompt',
                    event.target.value
                  )
                }
                placeholder="Ask me anything"
              />
            </label>

            <label style={styles.checkField}>
              <input
                type="checkbox"
                checked={Boolean(data.anonymous)}
                onChange={(event) =>
                  onChange(
                    'anonymous',
                    event.target.checked
                  )
                }
              />
              Anonymous responses
            </label>
          </>
        ) : null}

        {type === 'countdown' ? (
          <>
            <label style={styles.field}>
              Title
              <input
                value={data.title || ''}
                onChange={(event) =>
                  onChange('title', event.target.value)
                }
                placeholder="Countdown"
              />
            </label>

            <label style={styles.field}>
              Date and time
              <input
                type="datetime-local"
                value={data.date || ''}
                onChange={(event) =>
                  onChange('date', event.target.value)
                }
              />
            </label>
          </>
        ) : null}

        {type === 'link' ? (
          <>
            <label style={styles.field}>
              URL
              <input
                type="url"
                value={data.url || ''}
                onChange={(event) =>
                  onChange('url', event.target.value)
                }
                placeholder="https://"
              />
            </label>

            <label style={styles.field}>
              Display text
              <input
                value={data.displayText || ''}
                onChange={(event) =>
                  onChange(
                    'displayText',
                    event.target.value
                  )
                }
                placeholder="Open link"
              />
            </label>
          </>
        ) : null}

        {['mention', 'hashtag', 'location'].includes(type) ? (
          <label style={styles.field}>
            {type === 'mention'
              ? 'Username'
              : type === 'hashtag'
                ? 'Hashtag'
                : 'City or location'}
            <input
              value={data.value || ''}
              onChange={(event) =>
                onChange('value', event.target.value)
              }
              placeholder={
                type === 'mention'
                  ? '@username'
                  : type === 'hashtag'
                    ? '#aarush'
                    : 'New Delhi'
              }
            />
          </label>
        ) : null}

        {type === 'weather' ? (
          <>
            <label style={styles.field}>
              Temperature
              <input
                value={data.temperature || ''}
                onChange={(event) =>
                  onChange(
                    'temperature',
                    event.target.value
                  )
                }
                placeholder="24°C"
              />
            </label>

            <label style={styles.field}>
              Condition
              <input
                value={data.condition || ''}
                onChange={(event) =>
                  onChange(
                    'condition',
                    event.target.value
                  )
                }
                placeholder="Sunny"
              />
            </label>
          </>
        ) : null}

        {['emoji', 'gif', 'time', 'date'].includes(type) ? (
          <label style={styles.field}>
            Display
            <input
              value={data.value || ''}
              onChange={(event) =>
                onChange('value', event.target.value)
              }
              placeholder="Sticker content"
            />
          </label>
        ) : null}

        <button
          type="button"
          onClick={onConfirm}
          style={styles.confirmButton}
        >
          <Check size={15} />
          Add Sticker
        </button>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '.8rem',
    background: 'rgba(2,5,10,.72)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  panel: {
    width: 'min(100%, 620px)',
    maxHeight: '82vh',
    overflowY: 'auto',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.4rem',
    color: '#f4f7ff',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
    animation: 'aarush-stickers-slide-up 230ms ease both',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.7rem',
    marginBottom: '.8rem',
  },

  title: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 850,
  },

  subtitle: {
    display: 'block',
    marginTop: '.2rem',
    color: '#91a0bc',
    fontSize: '.65rem',
  },

  closeButton: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.06)',
    cursor: 'pointer',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.8rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.8rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
  },

  searchInput: {
    minWidth: 0,
    minHeight: '2.5rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.72rem',
  },

  clearButton: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#b8c5dc',
    background: 'rgba(255,255,255,.07)',
    cursor: 'pointer',
  },

  categoryScroller: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    margin: '.8rem 0',
    paddingBottom: '.2rem',
  },

  categoryButton: {
    minHeight: '2.2rem',
    flexShrink: 0,
    padding: '0 .62rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#9aa7c1',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.62rem',
    fontWeight: 750,
    cursor: 'pointer',
  },

  activeCategory: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.28),rgba(77,215,255,.12))',
  },

  emojiTools: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginBottom: '.7rem',
    color: '#91a0bc',
    fontSize: '.65rem',
  },

  toneButton: {
    width: '2rem',
    height: '2rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.05)',
    fontSize: '1rem',
    cursor: 'pointer',
  },

  activeTone: {
    borderColor: '#4dd7ff',
    background: 'rgba(77,215,255,.14)',
  },

  gifSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    marginBottom: '.7rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
  },

  stickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
  },

  stickerCard: {
    position: 'relative',
    minHeight: '5.6rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.35rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.045)',
    cursor: 'pointer',
    transition: 'transform 180ms ease, border-color 180ms ease',
  },

  selectedSticker: {
    borderColor: 'rgba(124,92,255,.55)',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.2),rgba(77,215,255,.08))',
    boxShadow: '0 0 20px rgba(124,92,255,.16)',
  },

  stickerIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.75rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.28),rgba(77,215,255,.12))',
  },

  emojiIcon: {
    fontSize: '1.3rem',
  },

  stickerLabel: {
    color: '#cbd6ec',
    fontSize: '.62rem',
    fontWeight: 750,
  },

  favoriteButton: {
    position: 'absolute',
    top: '.35rem',
    right: '.35rem',
    width: '1.45rem',
    height: '1.45rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#8290ad',
    background: 'rgba(0,0,0,.18)',
    cursor: 'pointer',
  },

  favoriteActive: {
    color: '#ff6d9a',
    background: 'rgba(255,79,122,.14)',
  },

  emojiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8,1fr)',
    gap: '.3rem',
  },

  emojiButton: {
    minHeight: '2.55rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '.6rem',
    background: 'rgba(255,255,255,.04)',
    fontSize: '1.25rem',
    cursor: 'pointer',
    animation: 'aarush-stickers-pop 180ms ease both',
  },

  gifGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.5rem',
  },

  gifCard: {
    minHeight: '5rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.25rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.85rem',
    color: '#dce5f8',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.16),rgba(77,215,255,.08))',
    cursor: 'pointer',
  },

  overlayTools: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.8rem',
    paddingTop: '.7rem',
    borderTop: '1px solid rgba(255,255,255,.08)',
  },

  overlayToolsTitle: {
    width: '100%',
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  toolButton: {
    minHeight: '2.1rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  deleteButton: {
    minHeight: '2.1rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,91,132,.2)',
    borderRadius: '.6rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  editorOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1300,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '.8rem',
    background: 'rgba(2,5,10,.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  editorPanel: {
    width: 'min(100%,520px)',
    display: 'grid',
    gap: '.65rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.25rem',
    color: '#f4f7ff',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
  },

  editorHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.64rem',
  },

  fieldInput: {
    minHeight: '2.45rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.7rem',
  },

  checkField: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    color: '#cbd6ec',
    fontSize: '.66rem',
  },

  confirmButton: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },
};