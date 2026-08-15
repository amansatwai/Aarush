import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Check,
  ChevronRight,
  Clock3,
  Heart,
  Pause,
  Play,
  Search,
  X,
} from 'lucide-react';

const FAVORITES_KEY = 'aarush_story_music_favorites';
const RECENTS_KEY = 'aarush_story_music_recent';
const MAX_RECENTS = 8;

const SONGS = [
  {
    id: 'neon-city',
    title: 'Neon City',
    artist: 'Aarush Sounds',
    album: 'Midnight Motion',
    artwork: '',
    duration: 31,
    audioUrl: '',
    bpm: 124,
    genre: 'Electronic',
    mood: 'Night',
    trendingScore: 98,
    categories: ['Trending Now', 'Electronic', 'Night'],
  },
  {
    id: 'afterglow',
    title: 'Afterglow',
    artist: 'Nova Lane',
    album: 'Electric Skies',
    artwork: '',
    duration: 28,
    audioUrl: '',
    bpm: 112,
    genre: 'Pop',
    mood: 'Emotional',
    trendingScore: 95,
    categories: ['Viral Reels', 'Pop', 'Emotional'],
  },
  {
    id: 'night-drive',
    title: 'Night Drive',
    artist: 'The Horizon',
    album: 'Late Hours',
    artwork: '',
    duration: 42,
    audioUrl: '',
    bpm: 108,
    genre: 'Lo-Fi',
    mood: 'Chill',
    trendingScore: 91,
    categories: ['Recently Used', 'Lo-Fi', 'Chill', 'Night'],
  },
  {
    id: 'blue-hour',
    title: 'Blue Hour',
    artist: 'Aarush Sounds',
    album: 'Cinematic',
    artwork: '',
    duration: 36,
    audioUrl: '',
    bpm: 92,
    genre: 'Cinematic',
    mood: 'Travel',
    trendingScore: 88,
    categories: ['New Releases', 'Cinematic', 'Travel'],
  },
  {
    id: 'slow-morning',
    title: 'Slow Morning',
    artist: 'Mira Vale',
    album: 'Soft Focus',
    artwork: '',
    duration: 27,
    audioUrl: '',
    bpm: 84,
    genre: 'Indie',
    mood: 'Chill',
    trendingScore: 82,
    categories: ['Recommended For You', 'Indie', 'Chill'],
  },
  {
    id: 'golden-road',
    title: 'Golden Road',
    artist: 'Atlas Bloom',
    album: 'Open Skies',
    artwork: '',
    duration: 39,
    audioUrl: '',
    bpm: 118,
    genre: 'Pop',
    mood: 'Travel',
    trendingScore: 79,
    categories: ['Travel', 'Pop', 'Workout'],
  },
  {
    id: 'velvet-room',
    title: 'Velvet Room',
    artist: 'Luna Grey',
    album: 'Private Hours',
    artwork: '',
    duration: 34,
    audioUrl: '',
    bpm: 76,
    genre: 'Emotional',
    mood: 'Romance',
    trendingScore: 76,
    categories: ['Emotional', 'Romance'],
  },
  {
    id: 'pixel-run',
    title: 'Pixel Run',
    artist: 'Level Zero',
    album: 'Arcade Dreams',
    artwork: '',
    duration: 25,
    audioUrl: '',
    bpm: 140,
    genre: 'Electronic',
    mood: 'Gaming',
    trendingScore: 73,
    categories: ['Gaming', 'Electronic', 'Workout'],
  },
  {
    id: 'raw-edges',
    title: 'Raw Edges',
    artist: 'Kairo',
    album: 'Concrete Bloom',
    artwork: '',
    duration: 30,
    audioUrl: '',
    bpm: 96,
    genre: 'Hip-Hop',
    mood: 'Night',
    trendingScore: 70,
    categories: ['Hip-Hop', 'Viral Reels'],
  },
  {
    id: 'quiet-lines',
    title: 'Quiet Lines',
    artist: 'Mellow Keys',
    album: 'Stillness',
    artwork: '',
    duration: 44,
    audioUrl: '',
    bpm: 68,
    genre: 'Instrumental',
    mood: 'Chill',
    trendingScore: 66,
    categories: ['Instrumental', 'Lo-Fi', 'Chill'],
  },
];

const CATEGORY_TABS = [
  'All',
  'Trending',
  'Pop',
  'Electronic',
  'Hip-Hop',
  'Indie',
  'Lo-Fi',
  'Cinematic',
];

const SECTIONS = [
  'Trending Now',
  'Viral Reels',
  'New Releases',
  'Recommended For You',
  'Recently Used',
  'Favorites',
  'Instrumental',
  'Cinematic',
  'Emotional',
  'Electronic',
  'Hip-Hop',
  'Pop',
  'Indie',
  'Lo-Fi',
  'Chill',
  'Gaming',
  'Workout',
  'Travel',
  'Night',
  'Romance',
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
    // Local persistence is an optional foundation.
  }
}

function formatDuration(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  return `${Math.floor(seconds / 60)}:${String(
    seconds % 60
  ).padStart(2, '0')}`;
}

function makeArtwork(song) {
  const colors = [
    '#7c5cff',
    '#4dd7ff',
    '#ff4fd8',
    '#ff7b72',
    '#82e9c1',
  ];

  const color =
    colors[
      Math.abs(
        String(song.id || '')
          .split('')
          .reduce(
            (total, character) =>
              total + character.charCodeAt(0),
            0
          )
      ) % colors.length
    ];

  return {
    ...styles.artwork,
    background: `linear-gradient(135deg,${color},#101827)`,
  };
}

function waveformForSong(song) {
  const seed = String(song.id || 'song')
    .split('')
    .reduce(
      (total, character) =>
        total + character.charCodeAt(0),
      0
    );

  return Array.from({ length: 26 }, (_, index) => {
    const value = Math.abs(
      Math.sin((seed + index) * 0.31)
    );

    return `${Math.max(18, Math.round(value * 80))}%`;
  });
}

export default function StoryMusicLibrary({
  selectedSong = null,
  onSelectSong,
  onPreviewSong,
  onClose,
  onOpenTimelineEditor,
}) {
  const audioRef = useRef(null);
  const previewFrameRef = useRef(null);
  const mountedRef = useRef(true);

  const [favorites, setFavorites] = useState(() =>
    readStorage(FAVORITES_KEY)
  );
  const [recentIds, setRecentIds] = useState(() =>
    readStorage(RECENTS_KEY)
  );
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [playingId, setPlayingId] = useState(null);
  const [previewProgress, setPreviewProgress] =
    useState(0);
  const [recentSearches, setRecentSearches] =
    useState([]);
  const [searchFocused, setSearchFocused] =
    useState(false);
  const [notice, setNotice] = useState('');

  const songMap = useMemo(
    () =>
      new Map(
        SONGS.map((song) => [song.id, song])
      ),
    []
  );

  const recentSongs = useMemo(
    () =>
      recentIds
        .map((id) => songMap.get(id))
        .filter(Boolean),
    [recentIds, songMap]
  );

  const favoriteSongs = useMemo(
    () =>
      favorites
        .map((id) => songMap.get(id))
        .filter(Boolean),
    [favorites, songMap]
  );

  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return SONGS.filter((song) =>
      [
        song.title,
        song.artist,
        song.album,
        song.genre,
        song.mood,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const filteredSongs = useMemo(() => {
    if (category === 'All') return SONGS;

    return SONGS.filter((song) => {
      if (category === 'Trending') {
        return song.trendingScore >= 85;
      }

      return (
        song.genre === category ||
        song.categories.includes(category)
      );
    });
  }, [category]);

  const clearAudio = useCallback(() => {
    if (previewFrameRef.current !== null) {
      window.cancelAnimationFrame(
        previewFrameRef.current
      );
      previewFrameRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPlayingId(null);
    setPreviewProgress(0);
  }, []);

  const addRecent = useCallback((song) => {
    const next = [
      song.id,
      ...recentIds.filter((id) => id !== song.id),
    ].slice(0, 8);

    setRecentIds(next);
    writeStorage(RECENTS_KEY, next);
  }, [recentIds]);

  const toggleFavorite = useCallback((song) => {
    setFavorites((current) => {
      const next = current.includes(song.id)
        ? current.filter((id) => id !== song.id)
        : [song.id, ...current];

      writeStorage(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const updatePreviewProgress = useCallback(() => {
    const audio = audioRef.current;

    if (
      !audio ||
      !mountedRef.current ||
      audio.paused
    ) {
      return;
    }

    const next =
      audio.duration > 0
        ? audio.currentTime / audio.duration
        : 0;

    setPreviewProgress(Math.min(1, next));

    previewFrameRef.current =
      window.requestAnimationFrame(
        updatePreviewProgress
      );
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      clearAudio();
    };
  }, [clearAudio]);

  const previewSong = useCallback(
    (song) => {
      if (!song) return;

      addRecent(song);
      onPreviewSong?.(song);

      if (
        playingId === song.id &&
        audioRef.current
      ) {
        clearAudio();
        return;
      }

      clearAudio();
      setPlayingId(song.id);

      if (!song.audioUrl) {
        setNotice(
          'Audio preview is ready for provider integration.'
        );
        return;
      }

      const audio = audioRef.current;

      if (!audio) return;

      audio.src = song.audioUrl;
      audio.currentTime = 0;
      audio.play().catch(() => {
        setNotice('Audio preview could not start.');
        setPlayingId(null);
      });

      previewFrameRef.current =
        window.requestAnimationFrame(
          updatePreviewProgress
        );
    },
    [
      addRecent,
      clearAudio,
      onPreviewSong,
      playingId,
      updatePreviewProgress,
    ]
  );

  const selectSong = useCallback(
    (song) => {
      if (!song) return;

      addRecent(song);
      onSelectSong?.({
        ...song,
        waveformData: waveformForSong(song),
      });
      setNotice(`${song.title} selected.`);
    },
    [addRecent, onSelectSong]
  );

  const handleSearchChange = useCallback(
    (event) => {
      const value = event.target.value;
      setQuery(value);

      if (!value.trim()) return;

      const nextSearches = [
        value.trim(),
        ...recentSearches.filter(
          (item) =>
            item.toLowerCase() !==
            value.trim().toLowerCase()
        ),
      ].slice(0, 5);

      setRecentSearches(nextSearches);
    },
    [recentSearches]
  );

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        setQuery('');
        setSearchFocused(false);
      }

      if (event.key === 'Enter' && searchResults[0]) {
        selectSong(searchResults[0]);
      }
    },
    [searchResults, selectSong]
  );

  const openTimeline = useCallback(() => {
    if (!selectedSong) return;

    onOpenTimelineEditor?.({
      ...selectedSong,
      waveformData:
        selectedSong.waveformData ||
        waveformForSong(selectedSong),
    });
  }, [onOpenTimelineEditor, selectedSong]);

  const renderSong = (song) => {
    const selected =
      selectedSong?.id === song.id;
    const favorite = favorites.includes(song.id);
    const playing = playingId === song.id;

    return (
      <article
        key={song.id}
        style={{
          ...styles.songCard,
          ...(selected ? styles.selectedSong : {}),
        }}
      >
        <button
          type="button"
          onClick={() => selectSong(song)}
          aria-label={`Select ${song.title} by ${song.artist}`}
          style={styles.songSelect}
        >
          {song.artwork ? (
            <img
              src={song.artwork}
              alt=""
              loading="lazy"
              style={styles.artworkImage}
            />
          ) : (
            <span style={makeArtwork(song)}>
              <Sparkles size={19} />
            </span>
          )}

          <span style={styles.songCopy}>
            <strong>{song.title}</strong>
            <span>
              {song.artist} · {song.album}
            </span>
            <small>
              {formatDuration(song.duration)}
              {song.trendingScore >= 90
                ? ' · Trending'
                : ''}
            </small>
          </span>
        </button>

        <div style={styles.songActions}>
          <button
            type="button"
            onClick={() => toggleFavorite(song)}
            aria-label={
              favorite
                ? `Remove ${song.title} from favorites`
                : `Add ${song.title} to favorites`
            }
            aria-pressed={favorite}
            style={{
              ...styles.actionButton,
              ...(favorite
                ? styles.favoriteActive
                : {}),
            }}
          >
            <Heart
              size={16}
              fill={favorite ? 'currentColor' : 'none'}
            />
          </button>

          <button
            type="button"
            onClick={() => previewSong(song)}
            aria-label={
              playing
                ? `Pause ${song.title}`
                : `Preview ${song.title}`
            }
            style={{
              ...styles.actionButton,
              ...(playing
                ? styles.previewActive
                : {}),
            }}
          >
            {playing ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </button>
        </div>

        {selected ? (
          <span
            aria-label="Selected song"
            style={styles.selectedMark}
          >
            <Check size={13} />
          </span>
        ) : null}
      </article>
    );
  };

  const renderSection = (title, songs) => {
    if (!songs.length) return null;

    return (
      <section style={styles.section} key={title}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              {title}
            </h2>
            <p style={styles.sectionSubtitle}>
              Curated for your next story.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCategory(
                CATEGORY_TABS.includes(title)
                  ? title
                  : 'All'
              );
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }}
            aria-label={`View more ${title}`}
            style={styles.moreButton}
          >
            More
            <ChevronRight size={15} />
          </button>
        </div>

        <div
          style={styles.horizontalList}
          className="aarush-music-horizontal-list"
        >
          {songs.map(renderSong)}
        </div>
      </section>
    );
  };

  const sections = useMemo(() => {
    if (normalizedQuery) {
      return [
        {
          title: 'Search results',
          songs: searchResults,
        },
      ];
    }

    const byCategory = (name) =>
      SONGS.filter((song) =>
        song.categories.includes(name)
      );

    return [
      { title: 'Trending Now', songs: byCategory('Trending Now') },
      { title: 'Viral Reels', songs: byCategory('Viral Reels') },
      { title: 'New Releases', songs: byCategory('New Releases') },
      {
        title: 'Recommended For You',
        songs: byCategory('Recommended For You'),
      },
      { title: 'Recently Used', songs: recentSongs },
      { title: 'Favorites', songs: favoriteSongs },
      ...[
        'Instrumental',
        'Cinematic',
        'Emotional',
        'Electronic',
        'Hip-Hop',
        'Pop',
        'Indie',
        'Lo-Fi',
        'Chill',
        'Gaming',
        'Workout',
        'Travel',
        'Night',
        'Romance',
      ].map((title) => ({
        title,
        songs: byCategory(title),
      })),
    ];
  }, [
    favoriteSongs,
    normalizedQuery,
    recentSongs,
    searchResults,
  ]);

  return (
    <main style={styles.page}>
      <audio
        ref={audioRef}
        onEnded={() => {
          setPlayingId(null);
          setPreviewProgress(0);
        }}
      />

      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close music library"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Story Music</strong>
          <span>Find the sound for your moment</span>
        </div>

        <span style={styles.headerBadge}>
          v2.1
        </span>
      </header>

      <div style={styles.content}>
        <section
          style={{
            ...styles.searchPanel,
            ...(searchFocused
              ? styles.searchPanelFocused
              : {}),
          }}
        >
          <Search size={18} />

          <input
            value={query}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search songs, artists, moods"
            aria-label="Search story music"
            style={styles.searchInput}
          />

          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear music search"
              style={styles.clearSearch}
            >
              <X size={15} />
            </button>
          ) : null}
        </section>

        {searchFocused && !query && recentSearches.length ? (
          <section style={styles.searchSuggestions}>
            <div style={styles.suggestionHeader}>
              <span>Recent searches</span>
              <Clock3 size={14} />
            </div>

            {recentSearches.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => {
                  setQuery(item);
                  setSearchFocused(false);
                }}
                style={styles.suggestion}
              >
                <Search size={14} />
                {item}
              </button>
            ))}
          </section>
        ) : null}

        <div
          style={styles.categoryTabs}
          className="aarush-music-category-tabs"
        >
          {CATEGORY_TABS.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              style={{
                ...styles.categoryTab,
                ...(category === item
                  ? styles.activeCategoryTab
                  : {}),
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {normalizedQuery && !searchResults.length ? (
          <section style={styles.emptyState}>
            <Search size={27} />
            <strong>No music found</strong>
            <span>
              Try another song, artist, or mood.
            </span>
          </section>
        ) : null}

        {!normalizedQuery &&
          category !== 'All' &&
          renderSection(
            category,
            filteredSongs
          )}

        {!normalizedQuery && category === 'All'
          ? sections.map((section) =>
              renderSection(
                section.title,
                section.songs
              )
            )
          : null}

        {normalizedQuery
          ? sections.map((section) =>
              renderSection(
                section.title,
                section.songs
              )
            )
          : null}
      </div>

      {notice ? (
        <div role="status" style={styles.notice}>
          {notice}
        </div>
      ) : null}

      {selectedSong ? (
        <footer style={styles.footer}>
          <div style={styles.selectedInfo}>
            <span
              style={makeArtwork(selectedSong)}
            >
              <Sparkles size={16} />
            </span>

            <span>
              <strong>
                {getSongTitle(selectedSong)}
              </strong>
              <small>
                {getSongArtist(selectedSong)}
              </small>
            </span>
          </div>

          <div style={styles.playerControls}>
            <button
              type="button"
              onClick={() =>
                previewSong(selectedSong)
              }
              aria-label={
                playingId === selectedSong.id
                  ? 'Pause selected song'
                  : 'Preview selected song'
              }
              style={styles.playerPlay}
            >
              {playingId === selectedSong.id ? (
                <Pause size={17} />
              ) : (
                <Play size={17} />
              )}
            </button>

            <div style={styles.playerProgress}>
              <span
                style={{
                  ...styles.playerProgressFill,
                  width: `${previewProgress * 100}%`,
                }}
              />
            </div>

            <span style={styles.playerTime}>
              {formatDuration(
                selectedSong.duration *
                  previewProgress
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={openTimeline}
            aria-label="Edit selected song timeline"
            style={styles.timelineButton}
          >
            Edit Timeline
            <ChevronRight size={15} />
          </button>
        </footer>
      ) : null}

      <style>{`
        .aarush-music-horizontal-list {
          scrollbar-width: none;
        }

        .aarush-music-horizontal-list::-webkit-scrollbar,
        .aarush-music-category-tabs::-webkit-scrollbar {
          display: none;
        }

        .aarush-music-category-tabs {
          scrollbar-width: none;
        }

        .aarush-music-card:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 600px) {
          .aarush-music-footer {
            flex-wrap: wrap;
          }

          .aarush-music-timeline-button {
            width: 100%;
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

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '7rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.52),#07090e 68%)',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.7rem',
    padding: '.75rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  iconButton: {
    width: '2.5rem',
    height: '2.5rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.05)',
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

  headerBadge: {
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.58rem',
    fontWeight: 800,
  },

  content: {
    width: 'min(100%, 1100px)',
    margin: '0 auto',
    padding: '.85rem',
  },

  searchPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    minHeight: '3rem',
    padding: '0 .8rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '1rem',
    color: '#91a0bc',
    background: 'rgba(15,19,30,.84)',
    boxShadow: '0 14px 35px rgba(0,0,0,.2)',
    transition: 'all 180ms ease',
  },

  searchPanelFocused: {
    borderColor: 'rgba(124,92,255,.48)',
    boxShadow: '0 0 24px rgba(124,92,255,.16)',
  },

  searchInput: {
    minWidth: 0,
    minHeight: '2.8rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.74rem',
  },

  clearSearch: {
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

  searchSuggestions: {
    marginTop: '.45rem',
    padding: '.65rem',
    border: '1px solid rgba(124,92,255,.2)',
    borderRadius: '1rem',
    background: 'rgba(15,19,30,.94)',
  },

  suggestionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '.35rem',
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  suggestion: {
    width: '100%',
    minHeight: '2.3rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    border: 0,
    borderRadius: '.55rem',
    color: '#dce5f8',
    background: 'transparent',
    fontSize: '.68rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  categoryTabs: {
    display: 'flex',
    gap: '.4rem',
    overflowX: 'auto',
    margin: '.8rem 0',
  },

  categoryTab: {
    minHeight: '2.25rem',
    flexShrink: 0,
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#9aa7c1',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.64rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  activeCategoryTab: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.28),rgba(77,215,255,.12))',
  },

  section: {
    marginTop: '1.15rem',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.6rem',
    marginBottom: '.65rem',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '.92rem',
    fontWeight: 850,
  },

  sectionSubtitle: {
    margin: '.2rem 0 0',
    color: '#8491ad',
    fontSize: '.63rem',
  },

  moreButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    border: 0,
    color: '#9deeff',
    background: 'transparent',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  horizontalList: {
    display: 'flex',
    gap: '.55rem',
    overflowX: 'auto',
    paddingBottom: '.25rem',
  },

  songCard: {
    position: 'relative',
    minWidth: '15.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.95rem',
    background: 'rgba(15,19,30,.82)',
    boxShadow: '0 10px 28px rgba(0,0,0,.18)',
    transition: 'transform 180ms ease, border-color 180ms ease',
  },

  selectedSong: {
    borderColor: 'rgba(124,92,255,.5)',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.16),rgba(77,215,255,.06))',
    boxShadow: '0 0 22px rgba(124,92,255,.15)',
  },

  songSelect: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
    flex: 1,
    padding: 0,
    border: 0,
    color: '#fff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  artwork: {
    width: '3.15rem',
    height: '3.15rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.75rem',
    color: '#fff',
  },

  artworkImage: {
    width: '3.15rem',
    height: '3.15rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '.75rem',
  },

  songCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
  },

  songCopySpan: {
    overflow: 'hidden',
    color: '#9aa7c1',
    fontSize: '.63rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  songCopySmall: {
    color: '#6f7d98',
    fontSize: '.58rem',
  },

  songActions: {
    display: 'flex',
    gap: '.2rem',
  },

  actionButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#9aa7c1',
    background: 'rgba(255,255,255,.06)',
    cursor: 'pointer',
  },

  favoriteActive: {
    color: '#ff6d9a',
    background: 'rgba(255,79,122,.12)',
  },

  previewActive: {
    color: '#9deeff',
    background: 'rgba(77,215,255,.12)',
  },

  selectedMark: {
    position: 'absolute',
    top: '.35rem',
    right: '.35rem',
    width: '1.25rem',
    height: '1.25rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  emptyState: {
    minHeight: '16rem',
    display: 'grid',
    justifyItems: 'center',
    alignContent: 'center',
    gap: '.55rem',
    color: '#91a0bc',
    textAlign: 'center',
  },

  footer: {
    position: 'fixed',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 30,
    display: 'flex',
    alignItems: 'center',
    gap: '.7rem',
    padding: '.7rem .85rem calc(.8rem + env(safe-area-inset-bottom))',
    borderTop: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.92)',
    boxShadow: '0 -12px 35px rgba(0,0,0,.3)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  selectedInfo: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    flex: '0 1 14rem',
  },

  selectedInfoSpan: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
  },

  selectedInfoSmall: {
    overflow: 'hidden',
    color: '#91a0bc',
    fontSize: '.6rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  playerControls: {
    minWidth: '8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    flex: 1,
  },

  playerPlay: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  playerProgress: {
    position: 'relative',
    height: '.25rem',
    overflow: 'hidden',
    flex: 1,
    borderRadius: '999px',
    background: 'rgba(255,255,255,.12)',
  },

  playerProgressFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
    transition: 'width 100ms linear',
  },

  playerTime: {
    minWidth: '2rem',
    color: '#91a0bc',
    fontSize: '.58rem',
    textAlign: 'right',
  },

  timelineButton: {
    minHeight: '2.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    flexShrink: 0,
    padding: '0 .7rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.64rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  notice: {
    position: 'fixed',
    top: '4.5rem',
    left: '50%',
    zIndex: 50,
    padding: '.65rem .85rem',
    border: '1px solid rgba(77,215,255,.25)',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(8,22,34,.92)',
    fontSize: '.66rem',
    transform: 'translateX(-50%)',
  },
};