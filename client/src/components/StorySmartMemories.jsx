import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Archive,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  Image as ImageIcon,
  MapPin,
  Music,
  Play,
  Search,
  Share2,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';

const COLLECTIONS = [
  ['today', 'Today Last Year', 'time'],
  ['month', 'This Month Memories', 'time'],
  ['year', 'This Year Memories', 'time'],
  ['travel', 'Travel Memories', 'location'],
  ['people', 'People Memories', 'people'],
  ['sunset', 'Sunset Collection', 'visual'],
  ['night', 'Night Collection', 'mood'],
  ['food', 'Food Collection', 'visual'],
  ['music', 'Music Collection', 'music'],
  ['best', 'AI Best Moments', 'ai'],
  ['suggested', 'Suggested Highlights', 'ai'],
  ['recent', 'Recently Rediscovered', 'recent'],
];

const FILTERS = [
  ['all', 'All'],
  ['image', 'Images'],
  ['video', 'Videos'],
  ['travel', 'Travel'],
  ['people', 'People'],
  ['food', 'Food'],
  ['nature', 'Nature'],
  ['music', 'Music'],
  ['favorites', 'Favorites'],
];

function normalizeStory(story, index) {
  return {
    ...story,
    id: story?.id || `memory-story-${index}`,
    mediaUrl:
      story?.mediaUrl ||
      story?.media_url ||
      '',
    thumbnailUrl:
      story?.thumbnailUrl ||
      story?.thumbnail_url ||
      story?.mediaUrl ||
      story?.media_url ||
      '',
    mediaType:
      story?.mediaType ||
      story?.media_type ||
      'image',
    caption: story?.caption || '',
    location: story?.location || '',
    hashtags: Array.isArray(story?.hashtags)
      ? story.hashtags
      : [],
    people: Array.isArray(story?.people)
      ? story.people
      : [],
    mood: story?.mood || '',
    createdAt:
      story?.createdAt ||
      story?.created_at ||
      new Date().toISOString(),
    favorite: Boolean(
      story?.favorite || story?.is_favorite
    ),
    viewCount: Number(
      story?.viewCount ||
        story?.view_count ||
        0
    ),
    shareCount: Number(
      story?.shareCount ||
        story?.share_count ||
        0
    ),
    replyCount: Number(
      story?.replyCount ||
        story?.reply_count ||
        0
    ),
    reactionCount: Number(
      story?.reactionCount ||
        story?.reaction_count ||
        0
    ),
  };
}

function dateValue(story) {
  return new Date(story.createdAt).getTime();
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function storyUrl(story) {
  return (
    story?.thumbnailUrl ||
    story?.mediaUrl ||
    ''
  );
}

function titleForCollection(id) {
  return (
    COLLECTIONS.find(([value]) => value === id)?.[1] ||
    'Smart Memories'
  );
}

function classifyStory(story) {
  const text = [
    story.caption,
    story.location,
    story.mood,
    ...story.hashtags,
  ]
    .join(' ')
    .toLowerCase();

  if (
    /travel|trip|goa|beach|mountain|journey|holiday/.test(
      text
    )
  ) {
    return 'travel';
  }

  if (
    /food|coffee|dinner|lunch|breakfast|restaurant/.test(
      text
    )
  ) {
    return 'food';
  }

  if (
    /music|concert|song|dance|playlist/.test(text)
  ) {
    return 'music';
  }

  if (
    /sunset|sunrise|sky|golden hour/.test(text)
  ) {
    return 'sunset';
  }

  if (/night|neon|drive|city lights/.test(text)) {
    return 'night';
  }

  if (
    story.people.length ||
    /family|friends|rashi|people/.test(text)
  ) {
    return 'people';
  }

  return 'recent';
}

function collectionStories(id, stories) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  if (id === 'today') {
    return stories.filter((story) => {
      const date = new Date(story.createdAt);

      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === currentYear - 1
      );
    });
  }

  if (id === 'month') {
    return stories.filter((story) => {
      const date = new Date(story.createdAt);

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });
  }

  if (id === 'year') {
    return stories.filter(
      (story) =>
        new Date(story.createdAt).getFullYear() ===
        currentYear
    );
  }

  if (id === 'best') {
    return [...stories]
      .sort(
        (first, second) =>
          second.viewCount +
          second.shareCount * 2 +
          second.reactionCount -
          (first.viewCount +
            first.shareCount * 2 +
            first.reactionCount)
      )
      .slice(0, 12);
  }

  if (id === 'suggested') {
    return stories.filter(
      (story) =>
        story.favorite ||
        story.shareCount > 0 ||
        story.reactionCount > 0
    );
  }

  if (id === 'recent') {
    return [...stories]
      .sort((first, second) => dateValue(second) - dateValue(first))
      .slice(0, 12);
  }

  return stories.filter(
    (story) => classifyStory(story) === id
  );
}

export default function StorySmartMemories({
  archivedStories = [],
  highlights = [],
  currentUser = null,
  memories = [],
  onCreateMemory,
  onSaveAsHighlight,
  onShareMemory,
  onDeleteMemory,
  onClose,
}) {
  const stories = useMemo(
    () => archivedStories.map(normalizeStory),
    [archivedStories]
  );

  const [activeCollection, setActiveCollection] =
    useState('best');
  const [activeFilter, setActiveFilter] =
    useState('all');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [notice, setNotice] = useState('');

  const filteredStories = useMemo(() => {
    const query = search.toLowerCase().trim();

    return stories.filter((story) => {
      const matchesSearch =
        !query ||
        [
          story.caption,
          story.location,
          story.mood,
          story.hashtags.join(' '),
          story.people.join(' '),
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);

      const category = classifyStory(story);

      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'image' ||
              activeFilter === 'video'
            ? story.mediaType === activeFilter
            : activeFilter === 'favorites'
              ? story.favorite
              : activeFilter === category;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, search, stories]);

  const collectionItems = useMemo(
    () =>
      collectionStories(
        activeCollection,
        filteredStories
      ),
    [activeCollection, filteredStories]
  );

  const generatedMemories = useMemo(() => {
    if (Array.isArray(memories) && memories.length) {
      return memories;
    }

    return COLLECTIONS.map(([id, title, type]) => {
      const items = collectionStories(id, stories);
      const first = items[0];

      return {
        id: `memory-${id}`,
        title,
        type,
        coverUrl: storyUrl(first),
        storyIds: items.map((story) => story.id),
        storyCount: items.length,
        dateRange: items.length
          ? `${formatDate(
              items[items.length - 1].createdAt
            )} – ${formatDate(items[0].createdAt)}`
          : 'No stories yet',
        location: first?.location || '',
        people: first?.people || [],
        mood: first?.mood || '',
        aiConfidence: items.length ? 0.86 : 0.42,
      };
    });
  }, [memories, stories]);

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  }, []);

  const saveMemory = useCallback(
    (memory) => {
      const selected = stories.filter((story) =>
        memory.storyIds?.includes(story.id)
      );

      onSaveAsHighlight?.({
        ...memory,
        storyIds: selected.map((story) => story.id),
        createdAt: new Date().toISOString(),
      });

      setSavedIds((current) => [
        ...current,
        memory.id,
      ]);
      showNotice('Memory saved as highlight.');
    },
    [onSaveAsHighlight, showNotice, stories]
  );

  const activeMemory = generatedMemories.find(
    (memory) =>
      memory.id === `memory-${activeCollection}`
  );

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close smart memories"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Smart Memories</strong>
          <span>Your story history, thoughtfully organized</span>
        </div>

        <button
          type="button"
          aria-label="Memory settings"
          style={styles.iconButton}
        >
          <Sparkles size={18} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <section style={styles.hero}>
          <div style={styles.heroIcon}>
            <Sparkles size={25} />
          </div>

          <div>
            <h1>Moments worth rediscovering</h1>
            <p>
              Aarush organizes your archived stories into
              meaningful memories.
            </p>
          </div>
        </section>

        <section style={styles.searchPanel}>
          <Search size={16} />
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search memories, places, people"
            aria-label="Search memories"
            style={styles.searchInput}
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear memory search"
              style={styles.clearButton}
            >
              <X size={14} />
            </button>
          ) : null}
        </section>

        <div style={styles.filterRow}>
          {FILTERS.map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveFilter(id)}
              aria-pressed={activeFilter === id}
              style={{
                ...styles.filterButton,
                ...(activeFilter === id
                  ? styles.activeFilterButton
                  : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <section style={styles.collectionSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Memory Collections</h2>
              <span>
                Curated from your story archive.
              </span>
            </div>
          </div>

          <div style={styles.collectionScroller}>
            {generatedMemories.map((memory) => {
              const active =
                activeCollection ===
                memory.id.replace('memory-', '');

              return (
                <button
                  type="button"
                  key={memory.id}
                  onClick={() =>
                    setActiveCollection(
                      memory.id.replace('memory-', '')
                    )
                  }
                  aria-pressed={active}
                  style={{
                    ...styles.collectionCard,
                    ...(active
                      ? styles.activeCollectionCard
                      : {}),
                  }}
                >
                  <span style={styles.collectionCover}>
                    {memory.coverUrl ? (
                      <img
                        src={memory.coverUrl}
                        alt=""
                        loading="lazy"
                        style={styles.coverImage}
                      />
                    ) : (
                      <Archive size={24} />
                    )}
                  </span>

                  <strong>{memory.title}</strong>
                  <span>
                    {memory.storyCount || 0} stories
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {activeMemory ? (
          <section style={styles.featuredMemory}>
            <div style={styles.featuredMedia}>
              {activeMemory.coverUrl ? (
                <img
                  src={activeMemory.coverUrl}
                  alt=""
                  loading="lazy"
                  style={styles.featuredImage}
                />
              ) : (
                <Archive size={35} />
              )}

              <div style={styles.featuredOverlay} />
              <div style={styles.featuredContent}>
                <span style={styles.aiBadge}>
                  <Sparkles size={12} />
                  {Math.round(
                    activeMemory.aiConfidence * 100
                  )}
                  % AI confidence
                </span>

                <h2>{activeMemory.title}</h2>
                <span>
                  {activeMemory.storyCount || 0} stories ·{' '}
                  {activeMemory.dateRange}
                </span>

                <div style={styles.featuredActions}>
                  <button
                    type="button"
                    onClick={() =>
                      setPreview({
                        title: activeMemory.title,
                        stories: collectionItems,
                        index: 0,
                      })
                    }
                    style={styles.lightButton}
                  >
                    <Play size={15} />
                    Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => saveMemory(activeMemory)}
                    style={styles.gradientButton}
                  >
                    {savedIds.includes(activeMemory.id) ? (
                      <Check size={15} />
                    ) : (
                      <Star size={15} />
                    )}
                    {savedIds.includes(activeMemory.id)
                      ? 'Saved'
                      : 'Save Highlight'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onShareMemory?.(activeMemory);
                      showNotice('Memory sharing prepared.');
                    }}
                    aria-label="Share memory"
                    style={styles.roundButton}
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>AI Best Moments</h2>
              <span>
                High-engagement and memorable story moments.
              </span>
            </div>
            <ActivityIcon />
          </div>

          <div style={styles.bestGrid}>
            {collectionStories('best', filteredStories)
              .slice(0, 6)
              .map((story) => (
                <button
                  type="button"
                  key={story.id}
                  onClick={() =>
                    setPreview({
                      title: story.caption || 'Best moment',
                      stories: [story],
                      index: 0,
                    })
                  }
                  style={styles.momentCard}
                >
                  {storyUrl(story) ? (
                    <img
                      src={storyUrl(story)}
                      alt=""
                      loading="lazy"
                      style={styles.momentImage}
                    />
                  ) : (
                    <Archive size={22} />
                  )}

                  <span style={styles.momentOverlay}>
                    <strong>
                      {story.viewCount} views
                    </strong>
                    <small>
                      {story.shareCount} shares
                    </small>
                  </span>
                </button>
              ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Memory Timeline</h2>
              <span>Chronological story rediscovery.</span>
            </div>
            <CalendarDays size={18} color="#4dd7ff" />
          </div>

          <div style={styles.timeline}>
            {collectionItems.slice(0, 20).map((story) => (
              <button
                type="button"
                key={story.id}
                onClick={() =>
                  setPreview({
                    title: story.caption || 'Memory',
                    stories: [story],
                    index: 0,
                  })
                }
                style={styles.timelineRow}
              >
                <span style={styles.timelineDate}>
                  {formatDate(story.createdAt)}
                </span>

                <span style={styles.timelineThumb}>
                  {storyUrl(story) ? (
                    <img
                      src={storyUrl(story)}
                      alt=""
                      loading="lazy"
                      style={styles.timelineImage}
                    />
                  ) : (
                    <Archive size={16} />
                  )}
                </span>

                <span style={styles.timelineCopy}>
                  <strong>
                    {story.caption || 'Archived story'}
                  </strong>
                  <small>
                    {story.location ||
                      story.mood ||
                      story.mediaType}
                  </small>
                </span>

                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Suggested Highlights</h2>
              <span>One-tap collections for your profile.</span>
            </div>
            <Star size={18} color="#ffd27d" />
          </div>

          <div style={styles.suggestionList}>
            {[
              'Goa Trip',
              '2026 Recap',
              'Coffee Diaries',
              'Night Drives',
              'Family Time',
              'Creative Work',
              'Concert Nights',
            ].map((title) => {
              const memory = generatedMemories.find(
                (item) => item.title === title
              );

              return (
                <button
                  type="button"
                  key={title}
                  onClick={() => {
                    if (memory) {
                      saveMemory(memory);
                    } else {
                      onCreateMemory?.({
                        title,
                        storyIds: [],
                        type: 'suggested',
                      });
                      showNotice(
                        `${title} suggestion prepared.`
                      );
                    }
                  }}
                  style={styles.suggestion}
                >
                  <Sparkles size={15} />
                  <span>{title}</span>
                  <ChevronRight
                    size={15}
                    style={{ marginLeft: 'auto' }}
                  />
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {preview ? (
        <MemoryPreview
          memory={preview}
          onClose={() => setPreview(null)}
          onSave={() => {
            const current = generatedMemories.find(
              (item) => item.title === preview.title
            );

            if (current) saveMemory(current);
          }}
        />
      ) : null}

      <style>{`
        @keyframes aarush-memories-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-memory-card:hover,
        .aarush-memory-moment:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 560px) {
          .aarush-memory-collection-grid {
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-memory-best-grid {
            grid-template-columns: repeat(3,1fr) !important;
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

function MemoryPreview({ memory, onClose, onSave }) {
  const story = memory.stories?.[memory.index || 0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={styles.previewBackdrop}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close memory preview"
        style={styles.previewClose}
      >
        <X size={20} />
      </button>

      {story?.mediaType === 'video' ? (
        <video
          src={storyUrl(story)}
          autoPlay
          controls
          loop
          playsInline
          onClick={(event) =>
            event.stopPropagation()
          }
          style={styles.previewMedia}
        />
      ) : storyUrl(story) ? (
        <img
          src={storyUrl(story)}
          alt={memory.title}
          onClick={(event) =>
            event.stopPropagation()
          }
          style={styles.previewMedia}
        />
      ) : (
        <Archive size={40} color="#9deeff" />
      )}

      <div style={styles.previewFooter}>
        <div>
          <strong>{memory.title}</strong>
          <span>
            {memory.stories?.length || 0} stories
          </span>
        </div>

        <button
          type="button"
          onClick={onSave}
          style={styles.gradientButton}
        >
          <Star size={15} />
          Save Highlight
        </button>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return (
    <span style={styles.activityIcon}>
      <Heart size={15} />
    </span>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.52),#07090e 68%)',
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

  heading: {
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
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

  content: {
    width: 'min(100%, 950px)',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.85rem',
  },

  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.7rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.24)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.16),rgba(77,215,255,.06))',
  },

  heroIcon: {
    width: '3.1rem',
    height: '3.1rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '1rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  heroDiv: {
    display: 'grid',
    gap: '.25rem',
  },

  heroH1: {
    margin: 0,
    fontSize: '1rem',
  },

  heroP: {
    margin: 0,
    color: '#91a0bc',
    fontSize: '.65rem',
    lineHeight: 1.45,
  },

  searchPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.75rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.8rem',
    color: '#91a0bc',
    background: 'rgba(15,19,30,.88)',
  },

  searchInput: {
    minWidth: 0,
    minHeight: '2.6rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.68rem',
  },

  clearButton: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.07)',
    cursor: 'pointer',
  },

  filterRow: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
  },

  filterButton: {
    minHeight: '2.2rem',
    flexShrink: 0,
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  activeFilterButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  collectionSection: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
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

  collectionScroller: {
    display: 'flex',
    gap: '.55rem',
    overflowX: 'auto',
  },

  collectionCard: {
    minWidth: '7.3rem',
    display: 'grid',
    justifyItems: 'center',
    gap: '.3rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.9rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    cursor: 'pointer',
    transition: 'transform 180ms ease, border-color 180ms ease',
  },

  activeCollectionCard: {
    borderColor: 'rgba(124,92,255,.5)',
    background: 'rgba(124,92,255,.13)',
  },

  collectionCover: {
    width: '4.2rem',
    height: '5rem',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    borderRadius: '.75rem',
    color: '#9deeff',
    background: '#17233d',
  },

  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  collectionCardStrong: {
    maxWidth: '100%',
    overflow: 'hidden',
    fontSize: '.62rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  collectionCardSpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  featuredMemory: {
    overflow: 'hidden',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '1.25rem',
    background: '#0d1320',
    boxShadow: '0 20px 60px rgba(0,0,0,.3)',
  },

  featuredMedia: {
    position: 'relative',
    minHeight: '18rem',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
    color: '#9deeff',
    background: '#17233d',
  },

  featuredImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  featuredOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg,transparent 22%,rgba(0,0,0,.8))',
  },

  featuredContent: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    display: 'grid',
    gap: '.35rem',
    padding: '1rem',
    color: '#fff',
  },

  featuredContentH2: {
    margin: 0,
    fontSize: '1.2rem',
  },

  featuredContentSpan: {
    color: '#cbd6ec',
    fontSize: '.65rem',
  },

  aiBadge: {
    width: 'fit-content',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '.28rem .4rem',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.14)',
    fontSize: '.56rem',
    fontWeight: 800,
  },

  featuredActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.4rem',
    marginTop: '.5rem',
  },

  lightButton: {
    minHeight: '2.4rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.22)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(255,255,255,.1)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  gradientButton: {
    minHeight: '2.4rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .65rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.62rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  roundButton: {
    width: '2.4rem',
    height: '2.4rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.22)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(255,255,255,.1)',
    cursor: 'pointer',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
  },

  activityIcon: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#ff9fba',
    background: 'rgba(255,91,132,.1)',
  },

  bestGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6,1fr)',
    gap: '.45rem',
  },

  momentCard: {
    position: 'relative',
    aspectRatio: '9 / 13',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    border: 0,
    borderRadius: '.7rem',
    color: '#9deeff',
    background: '#17233d',
    cursor: 'pointer',
    transition: 'transform 180ms ease',
  },

  momentImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  momentOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    display: 'grid',
    gap: '.15rem',
    padding: '.4rem',
    background: 'linear-gradient(transparent,rgba(0,0,0,.7))',
    color: '#fff',
    fontSize: '.55rem',
    textAlign: 'left',
  },

  momentOverlaySmall: {
    color: '#cbd6ec',
  },

  timeline: {
    display: 'grid',
    gap: '.4rem',
  },

  timelineRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.45rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  timelineDate: {
    width: '4.2rem',
    flexShrink: 0,
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  timelineThumb: {
    width: '2.4rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    borderRadius: '.45rem',
    color: '#9deeff',
    background: '#17233d',
  },

  timelineImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  timelineCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
    flex: 1,
  },

  timelineCopySmall: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  suggestionList: {
    display: 'grid',
    gap: '.4rem',
  },

  suggestion: {
    minHeight: '2.55rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .65rem',
    border: '1px solid rgba(124,92,255,.15)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.64rem',
    textAlign: 'left',
    cursor: 'pointer',
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

  previewBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    display: 'grid',
    placeItems: 'center',
    padding: '1rem',
    background: '#03050a',
  },

  previewClose: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    zIndex: 2,
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.16)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(255,255,255,.08)',
    cursor: 'pointer',
  },

  previewMedia: {
    width: 'min(100%, 520px)',
    maxHeight: '78vh',
    objectFit: 'contain',
    borderRadius: '1rem',
  },

  previewFooter: {
    position: 'absolute',
    right: '1rem',
    bottom: '1rem',
    left: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    padding: '.7rem',
    borderRadius: '.8rem',
    color: '#fff',
    background: 'rgba(0,0,0,.58)',
  },

  previewFooterDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  previewFooterSpan: {
    color: '#aab6cf',
    fontSize: '.6rem',
  },
};