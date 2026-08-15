import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Archive,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Grid3X3,
  Image as ImageIcon,
  List,
  MoreHorizontal,
  Play,
  RotateCcw,
  Search,
  Share2,
  Trash2,
  Video,
  X,
} from 'lucide-react';

const VIEW_MODES = [
  ['grid', 'Grid', Grid3X3],
  ['timeline', 'Timeline', List],
  ['calendar', 'Calendar', CalendarDays],
  ['list', 'List', List],
];

const FILTERS = [
  ['all', 'All'],
  ['image', 'Images'],
  ['video', 'Videos'],
  ['favorites', 'Favorites'],
  ['downloaded', 'Downloaded'],
  ['shared', 'Shared'],
  ['public', 'Public'],
  ['followers', 'Followers'],
  ['close_friends', 'Close Friends'],
  ['private', 'Private'],
  ['week', 'This Week'],
  ['month', 'This Month'],
  ['year', 'This Year'],
];

const SORTS = [
  ['newest', 'Newest first'],
  ['oldest', 'Oldest first'],
  ['views', 'Most viewed'],
  ['shared', 'Most shared'],
  ['largest', 'Largest file'],
  ['smallest', 'Smallest file'],
];

function normalizeStory(story) {
  return {
    ...story,
    id: story?.id || `archive-${Date.now()}`,
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
    createdAt:
      story?.createdAt ||
      story?.created_at ||
      new Date().toISOString(),
    expiredAt:
      story?.expiredAt ||
      story?.expired_at ||
      null,
    viewCount: Number(
      story?.viewCount ||
        story?.view_count ||
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
    shareCount: Number(
      story?.shareCount ||
        story?.share_count ||
        0
    ),
    fileSize: Number(
      story?.fileSize ||
        story?.file_size ||
        0
    ),
    privacy: story?.privacy || 'public',
    favorite: Boolean(
      story?.favorite || story?.is_favorite
    ),
    downloaded: Boolean(
      story?.downloaded || story?.is_downloaded
    ),
    shared: Boolean(
      story?.shared || story?.is_shared
    ),
  };
}

function dateKey(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toISOString().slice(0, 10);
}

function monthKey(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown month';
  }

  return date.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
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

function isWithin(value, range) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const time = date.getTime();

  if (range === 'week') {
    return time >= now.getTime() - 7 * 86400000;
  }

  if (range === 'month') {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  if (range === 'year') {
    return date.getFullYear() === now.getFullYear();
  }

  return true;
}

function formatSize(bytes) {
  if (!bytes) return 'Size unavailable';
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function StoryArchiveManager({
  archivedStories = [],
  selectedStories = [],
  viewMode = 'grid',
  sortMode = 'newest',
  filterMode = 'all',
  onSelectStory,
  onDeleteStories,
  onRestoreStories,
  onDownloadStories,
  onMoveToHighlight,
  onClose,
}) {
  const [activeView, setActiveView] =
    useState(viewMode);
  const [activeSort, setActiveSort] =
    useState(sortMode);
  const [activeFilter, setActiveFilter] =
    useState(filterMode);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(
    Array.isArray(selectedStories)
      ? selectedStories
      : []
  );
  const [previewStory, setPreviewStory] =
    useState(null);
  const [selectedDate, setSelectedDate] =
    useState(null);
  const [filterOpen, setFilterOpen] =
    useState(false);
  const [notice, setNotice] = useState('');

  const stories = useMemo(
    () => archivedStories.map(normalizeStory),
    [archivedStories]
  );

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  }, []);

  const filteredStories = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = stories.filter((story) => {
      const matchesSearch =
        !query ||
        story.caption.toLowerCase().includes(query) ||
        story.location.toLowerCase().includes(query) ||
        story.hashtags.join(' ').toLowerCase().includes(query) ||
        formatDate(story.createdAt)
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'image' ||
              activeFilter === 'video'
            ? story.mediaType === activeFilter
            : ['week', 'month', 'year'].includes(
                  activeFilter
                )
              ? isWithin(story.createdAt, activeFilter)
              : activeFilter === 'favorites'
                ? story.favorite
                : activeFilter === 'downloaded'
                  ? story.downloaded
                  : activeFilter === 'shared'
                    ? story.shared
                    : story.privacy === activeFilter;

      const matchesDate =
        !selectedDate ||
        dateKey(story.createdAt) === selectedDate;

      return (
        matchesSearch &&
        matchesFilter &&
        matchesDate
      );
    });

    return result.sort((first, second) => {
      if (activeSort === 'oldest') {
        return (
          new Date(first.createdAt) -
          new Date(second.createdAt)
        );
      }

      if (activeSort === 'views') {
        return second.viewCount - first.viewCount;
      }

      if (activeSort === 'shared') {
        return second.shareCount - first.shareCount;
      }

      if (activeSort === 'largest') {
        return second.fileSize - first.fileSize;
      }

      if (activeSort === 'smallest') {
        return first.fileSize - second.fileSize;
      }

      return (
        new Date(second.createdAt) -
        new Date(first.createdAt)
      );
    });
  }, [
    activeFilter,
    activeSort,
    search,
    selectedDate,
    stories,
  ]);

  const groupedByMonth = useMemo(() => {
    return filteredStories.reduce((groups, story) => {
      const key = monthKey(story.createdAt);

      if (!groups[key]) groups[key] = [];
      groups[key].push(story);

      return groups;
    }, {});
  }, [filteredStories]);

  const groupedByDate = useMemo(() => {
    return filteredStories.reduce((groups, story) => {
      const key = dateKey(story.createdAt);

      if (!groups[key]) groups[key] = [];
      groups[key].push(story);

      return groups;
    }, {});
  }, [filteredStories]);

  const overview = useMemo(() => {
    const now = new Date();
    const thisMonth = stories.filter((story) => {
      const date = new Date(story.createdAt);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;

    const thisYear = stories.filter((story) => {
      const date = new Date(story.createdAt);
      return date.getFullYear() === now.getFullYear();
    }).length;

    return {
      total: stories.length,
      images: stories.filter(
        (story) => story.mediaType === 'image'
      ).length,
      videos: stories.filter(
        (story) => story.mediaType === 'video'
      ).length,
      thisMonth,
      thisYear,
      storage: stories.reduce(
        (total, story) => total + story.fileSize,
        0
      ),
    };
  }, [stories]);

  const toggleSelected = useCallback(
    (story) => {
      setSelectedIds((current) => {
        const next = current.includes(story.id)
          ? current.filter((id) => id !== story.id)
          : [...current, story.id];

        onSelectStory?.(story, next);
        return next;
      });
    },
    [onSelectStory]
  );

  const selectAll = useCallback(() => {
    const ids = filteredStories.map((story) => story.id);
    setSelectedIds(ids);
    onSelectStory?.(null, ids);
  }, [filteredStories, onSelectStory]);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
    onSelectStory?.(null, []);
  }, [onSelectStory]);

  const selectedObjects = useMemo(
    () =>
      stories.filter((story) =>
        selectedIds.includes(story.id)
      ),
    [selectedIds, stories]
  );

  const handleDelete = useCallback(() => {
    if (!selectedIds.length) {
      showNotice('Select stories first.');
      return;
    }

    onDeleteStories?.(selectedObjects);
    setSelectedIds([]);
    showNotice('Selected stories deleted.');
  }, [
    onDeleteStories,
    selectedIds.length,
    selectedObjects,
    showNotice,
  ]);

  const handleRestore = useCallback(() => {
    if (!selectedIds.length) {
      showNotice('Select stories first.');
      return;
    }

    onRestoreStories?.(selectedObjects);
    setSelectedIds([]);
    showNotice('Selected stories restored.');
  }, [
    onRestoreStories,
    selectedIds.length,
    selectedObjects,
    showNotice,
  ]);

  const handleDownload = useCallback(() => {
    if (!selectedIds.length) {
      showNotice('Select stories first.');
      return;
    }

    onDownloadStories?.(selectedObjects, {
      quality: 'high',
      zipFoundation: selectedObjects.length > 1,
    });
    showNotice('Download preparation started.');
  }, [
    onDownloadStories,
    selectedIds.length,
    selectedObjects,
    showNotice,
  ]);

  const handleHighlight = useCallback(() => {
    if (!selectedIds.length) {
      showNotice('Select stories first.');
      return;
    }

    onMoveToHighlight?.(selectedObjects);
    showNotice('Highlight selection prepared.');
  }, [
    onMoveToHighlight,
    selectedIds.length,
    selectedObjects,
    showNotice,
  ]);

  const renderStoryCard = (story) => {
    const selected = selectedIds.includes(story.id);

    return (
      <article
        key={story.id}
        style={{
          ...styles.storyCard,
          ...(selected ? styles.selectedCard : {}),
        }}
      >
        <button
          type="button"
          onClick={() => setPreviewStory(story)}
          aria-label="Preview archived story"
          style={styles.mediaButton}
        >
          {story.thumbnailUrl ? (
            story.mediaType === 'video' ? (
              <video
                src={story.thumbnailUrl}
                muted
                preload="metadata"
                style={styles.thumbnail}
              />
            ) : (
              <img
                src={story.thumbnailUrl}
                alt=""
                loading="lazy"
                style={styles.thumbnail}
              />
            )
          ) : (
            <span style={styles.thumbnailFallback}>
              {story.mediaType === 'video' ? (
                <Video size={24} />
              ) : (
                <ImageIcon size={24} />
              )}
            </span>
          )}

          {story.mediaType === 'video' ? (
            <span style={styles.videoBadge}>
              <Play size={12} />
            </span>
          ) : null}

          <span style={styles.selectionBadge}>
            {selected ? (
              <Check size={14} />
            ) : (
              <span />
            )}
          </span>
        </button>

        <div style={styles.cardFooter}>
          <span style={styles.cardDate}>
            {formatDate(story.createdAt)}
          </span>

          <button
            type="button"
            onClick={() => toggleSelected(story)}
            aria-label={
              selected
                ? 'Deselect story'
                : 'Select story'
            }
            aria-pressed={selected}
            style={styles.selectButton}
          >
            {selected ? 'Selected' : 'Select'}
          </button>
        </div>
      </article>
    );
  };

  const renderGrid = () => (
    <div style={styles.grid}>
      {filteredStories.map(renderStoryCard)}
    </div>
  );

  const renderList = () => (
    <div style={styles.list}>
      {filteredStories.map((story) => {
        const selected = selectedIds.includes(story.id);

        return (
          <article
            key={story.id}
            style={{
              ...styles.listRow,
              ...(selected ? styles.selectedCard : {}),
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewStory(story)}
              style={styles.listMediaButton}
              aria-label="Preview story"
            >
              {story.thumbnailUrl ? (
                <img
                  src={story.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  style={styles.listThumbnail}
                />
              ) : (
                <Archive size={19} />
              )}
            </button>

            <div style={styles.listCopy}>
              <strong>
                {story.caption || 'Archived story'}
              </strong>
              <span>
                {formatDate(story.createdAt)} ·{' '}
                {story.mediaType}
              </span>
              <small>
                {story.viewCount} views ·{' '}
                {story.replyCount} replies
              </small>
            </div>

            <button
              type="button"
              onClick={() => toggleSelected(story)}
              aria-label="Select story"
              style={styles.selectButton}
            >
              {selected ? (
                <Check size={15} />
              ) : (
                'Select'
              )}
            </button>
          </article>
        );
      })}
    </div>
  );

  const renderTimeline = () => (
    <div style={styles.timeline}>
      {Object.entries(groupedByMonth).map(
        ([month, monthStories]) => (
          <section key={month} style={styles.timelineMonth}>
            <h2 style={styles.dateHeading}>{month}</h2>

            {monthStories.map((story) => (
              <div
                key={story.id}
                style={styles.timelineRow}
              >
                <span style={styles.timelineDot} />

                <span style={styles.timelineDate}>
                  {formatDate(story.createdAt)}
                </span>

                <button
                  type="button"
                  onClick={() => setPreviewStory(story)}
                  style={styles.timelineStory}
                >
                  {story.thumbnailUrl ? (
                    <img
                      src={story.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      style={styles.timelineImage}
                    />
                  ) : (
                    <Archive size={18} />
                  )}
                  <span>
                    {story.caption || 'Archived story'}
                  </span>
                </button>
              </div>
            ))}
          </section>
        )
      )}
    </div>
  );

  const renderCalendar = () => (
    <div style={styles.calendar}>
      {Object.entries(groupedByDate).map(
        ([date, dateStories]) => (
          <button
            type="button"
            key={date}
            onClick={() =>
              setSelectedDate(
                selectedDate === date ? null : date
              )
            }
            aria-pressed={selectedDate === date}
            style={{
              ...styles.calendarDay,
              ...(selectedDate === date
                ? styles.activeCalendarDay
                : {}),
            }}
          >
            <strong>
              {new Date(date).getDate()}
            </strong>
            <span>
              {new Date(date).toLocaleDateString(
                undefined,
                { month: 'short' }
              )}
            </span>
            <small>
              {dateStories.length} stories
            </small>
          </button>
        )
      )}
    </div>
  );

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close archive manager"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Story Archive</strong>
          <span>Your complete story history</span>
        </div>

        <button
          type="button"
          aria-label="Archive options"
          style={styles.iconButton}
        >
          <MoreHorizontal size={19} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <section style={styles.overview}>
          <div>
            <span>Total archived</span>
            <strong>{overview.total}</strong>
          </div>
          <div>
            <span>Images</span>
            <strong>{overview.images}</strong>
          </div>
          <div>
            <span>Videos</span>
            <strong>{overview.videos}</strong>
          </div>
          <div>
            <span>This month</span>
            <strong>{overview.thisMonth}</strong>
          </div>
          <div>
            <span>This year</span>
            <strong>{overview.thisYear}</strong>
          </div>
        </section>

        <section style={styles.memoryCard}>
          <div style={styles.memoryIcon}>
            <Archive size={20} />
          </div>
          <div>
            <strong>AI Memories foundation</strong>
            <span>
              Today last year, travel, friends, sunsets,
              nights, portraits, and music collections.
            </span>
          </div>
          <ChevronRight size={17} />
        </section>

        <div style={styles.searchRow}>
          <div style={styles.searchBox}>
            <Search size={16} />
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search captions, hashtags, dates"
              aria-label="Search archived stories"
              style={styles.searchInput}
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterOpen((value) => !value)}
            aria-label="Open archive filters"
            style={styles.filterButton}
          >
            <Filter size={16} />
          </button>
        </div>

        {filterOpen ? (
          <section style={styles.filterPanel}>
            <div style={styles.filterHeader}>
              <strong>Filters</strong>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                style={styles.smallIconButton}
                aria-label="Close filters"
              >
                <X size={15} />
              </button>
            </div>

            <div style={styles.filterOptions}>
              {FILTERS.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  style={{
                    ...styles.filterOption,
                    ...(activeFilter === value
                      ? styles.activeFilterOption
                      : {}),
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <select
              value={activeSort}
              onChange={(event) =>
                setActiveSort(event.target.value)
              }
              aria-label="Sort archived stories"
              style={styles.select}
            >
              {SORTS.map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </section>
        ) : null}

        <div style={styles.viewRow}>
          <div style={styles.viewModes}>
            {VIEW_MODES.map(([value, label, Icon]) => (
              <button
                type="button"
                key={value}
                onClick={() => setActiveView(value)}
                aria-pressed={activeView === value}
                aria-label={`${label} view`}
                style={{
                  ...styles.viewButton,
                  ...(activeView === value
                    ? styles.activeViewButton
                    : {}),
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <span style={styles.resultCount}>
            {filteredStories.length} stories
          </span>
        </div>

        {activeView === 'grid' ? renderGrid() : null}
        {activeView === 'list' ? renderList() : null}
        {activeView === 'timeline'
          ? renderTimeline()
          : null}
        {activeView === 'calendar'
          ? renderCalendar()
          : null}

        {!filteredStories.length ? (
          <div style={styles.emptyState}>
            <Archive size={30} />
            <strong>No archived stories found</strong>
            <span>
              Try changing the search or filter settings.
            </span>
          </div>
        ) : null}
      </div>

      {selectedIds.length ? (
        <footer style={styles.bulkBar}>
          <span>
            {selectedIds.length} selected
          </span>

          <button
            type="button"
            onClick={selectAll}
            style={styles.bulkButton}
          >
            Select All
          </button>

          <button
            type="button"
            onClick={handleRestore}
            aria-label="Restore selected stories"
            style={styles.bulkButton}
          >
            <RotateCcw size={14} />
            Restore
          </button>

          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download selected stories"
            style={styles.bulkButton}
          >
            <Download size={14} />
            Download
          </button>

          <button
            type="button"
            onClick={handleHighlight}
            aria-label="Move selected stories to highlight"
            style={styles.bulkButton}
          >
            <Archive size={14} />
            Highlight
          </button>

          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete selected stories"
            style={styles.bulkDelete}
          >
            <Trash2 size={14} />
          </button>

          <button
            type="button"
            onClick={deselectAll}
            aria-label="Deselect all stories"
            style={styles.bulkClose}
          >
            <X size={15} />
          </button>
        </footer>
      ) : null}

      {previewStory ? (
        <div
          role="dialog"
          aria-modal="true"
          style={styles.previewBackdrop}
          onClick={() => setPreviewStory(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewStory(null)}
            aria-label="Close story preview"
            style={styles.previewClose}
          >
            <X size={20} />
          </button>

          {previewStory.mediaType === 'video' ? (
            <video
              src={previewStory.mediaUrl}
              autoPlay
              controls
              loop
              playsInline
              onClick={(event) =>
                event.stopPropagation()
              }
              style={styles.previewMedia}
            />
          ) : (
            <img
              src={previewStory.mediaUrl}
              alt="Archived story"
              onClick={(event) =>
                event.stopPropagation()
              }
              style={styles.previewMedia}
            />
          )}

          <div style={styles.previewMeta}>
            <strong>
              {previewStory.caption || 'Archived story'}
            </strong>
            <span>
              {formatDate(previewStory.createdAt)} ·{' '}
              {previewStory.viewCount} views ·{' '}
              {previewStory.replyCount} replies
            </span>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes aarush-archive-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-archive-story:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 520px) {
          .aarush-archive-overview {
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-archive-view-label {
            display: none;
          }

          .aarush-archive-bulk {
            gap: .25rem !important;
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
    paddingBottom: '5.5rem',
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
    width: 'min(100%, 1050px)',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.8rem',
  },

  overview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5,1fr)',
    gap: '.45rem',
    padding: '.8rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
  },

  overviewDiv: {
    display: 'grid',
    gap: '.25rem',
    textAlign: 'center',
  },

  overviewSpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  overviewStrong: {
    color: '#f4f7ff',
    fontSize: '1rem',
  },

  memoryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.6rem',
    padding: '.8rem',
    border: '1px solid rgba(124,92,255,.22)',
    borderRadius: '1rem',
    color: '#dce5f8',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.15),rgba(77,215,255,.06))',
  },

  memoryIcon: {
    width: '2.55rem',
    height: '2.55rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.8rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  memoryCardDiv: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
    flex: 1,
  },

  memoryCardSpan: {
    color: '#91a0bc',
    fontSize: '.62rem',
    lineHeight: 1.4,
  },

  searchRow: {
    display: 'flex',
    gap: '.45rem',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.7rem',
    flex: 1,
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.8rem',
    color: '#91a0bc',
    background: 'rgba(15,19,30,.88)',
  },

  searchInput: {
    minWidth: 0,
    minHeight: '2.5rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.68rem',
  },

  filterButton: {
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '.8rem',
    color: '#c8bcff',
    background: 'rgba(124,92,255,.1)',
    cursor: 'pointer',
  },

  filterPanel: {
    display: 'grid',
    gap: '.65rem',
    padding: '.8rem',
    border: '1px solid rgba(124,92,255,.2)',
    borderRadius: '1rem',
    background: 'rgba(15,19,30,.92)',
    animation: 'aarush-archive-in 180ms ease both',
  },

  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  filterOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  filterOption: {
    minHeight: '2.15rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#9aa7c1',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  activeFilterOption: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  select: {
    minHeight: '2.35rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
  },

  viewRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
  },

  viewModes: {
    display: 'flex',
    gap: '.3rem',
  },

  viewButton: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  activeViewButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.17)',
  },

  resultCount: {
    color: '#8290ad',
    fontSize: '.62rem',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5,1fr)',
    gap: '.5rem',
  },

  storyCard: {
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    background: 'rgba(15,19,30,.88)',
    transition: 'transform 180ms ease, border-color 180ms ease',
    animation: 'aarush-archive-in 220ms ease both',
  },

  selectedCard: {
    borderColor: 'rgba(77,215,255,.55)',
    boxShadow: '0 0 18px rgba(77,215,255,.16)',
  },

  mediaButton: {
    position: 'relative',
    width: '100%',
    aspectRatio: '9 / 14',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    padding: 0,
    border: 0,
    color: '#9deeff',
    background: '#17223b',
    cursor: 'pointer',
  },

  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  thumbnailFallback: {
    display: 'grid',
    placeItems: 'center',
  },

  videoBadge: {
    position: 'absolute',
    top: '.35rem',
    left: '.35rem',
    width: '1.45rem',
    height: '1.45rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(0,0,0,.55)',
  },

  selectionBadge: {
    position: 'absolute',
    top: '.35rem',
    right: '.35rem',
    width: '1.4rem',
    height: '1.4rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.6)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(0,0,0,.38)',
  },

  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.25rem',
    padding: '.45rem',
  },

  cardDate: {
    overflow: 'hidden',
    color: '#91a0bc',
    fontSize: '.57rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  selectButton: {
    minHeight: '1.8rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.2rem',
    padding: '0 .4rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '999px',
    color: '#c8bcff',
    background: 'rgba(124,92,255,.1)',
    fontSize: '.56rem',
    cursor: 'pointer',
  },

  list: {
    display: 'grid',
    gap: '.45rem',
  },

  listRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.8rem',
    background: 'rgba(15,19,30,.88)',
  },

  listMediaButton: {
    width: '3rem',
    height: '3.7rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    padding: 0,
    border: 0,
    borderRadius: '.55rem',
    color: '#9deeff',
    background: '#17223b',
    cursor: 'pointer',
  },

  listThumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  listCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  listCopySpan: {
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  listCopySmall: {
    color: '#6f7d98',
    fontSize: '.58rem',
  },

  timeline: {
    display: 'grid',
    gap: '1rem',
    padding: '.5rem 0',
  },

  timelineMonth: {
    display: 'grid',
    gap: '.45rem',
  },

  dateHeading: {
    margin: 0,
    color: '#cbd6ec',
    fontSize: '.78rem',
  },

  timelineRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
    minHeight: '3.4rem',
    paddingLeft: '.8rem',
    borderLeft: '1px solid rgba(124,92,255,.28)',
  },

  timelineDot: {
    position: 'absolute',
    left: '-.28rem',
    width: '.5rem',
    height: '.5rem',
    borderRadius: '999px',
    background: '#4dd7ff',
    boxShadow: '0 0 12px rgba(77,215,255,.5)',
  },

  timelineDate: {
    width: '4.7rem',
    flexShrink: 0,
    color: '#8290ad',
    fontSize: '.58rem',
  },

  timelineStory: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    flex: 1,
    padding: '.35rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.65rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.64rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  timelineImage: {
    width: '2rem',
    height: '2.5rem',
    objectFit: 'cover',
    borderRadius: '.4rem',
  },

  calendar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7,1fr)',
    gap: '.4rem',
  },

  calendarDay: {
    minHeight: '4.4rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.15rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.65rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.04)',
    cursor: 'pointer',
  },

  activeCalendarDay: {
    borderColor: 'rgba(124,92,255,.5)',
    background: 'rgba(124,92,255,.18)',
  },

  calendarDaySpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  calendarDaySmall: {
    color: '#4dd7ff',
    fontSize: '.52rem',
  },

  bulkBar: {
    position: 'fixed',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    overflowX: 'auto',
    padding: '.65rem .75rem calc(.7rem + env(safe-area-inset-bottom))',
    borderTop: '1px solid rgba(255,255,255,.1)',
    background: 'rgba(8,11,18,.94)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  bulkBarSpan: {
    flex: 1,
    color: '#cbd6ec',
    fontSize: '.64rem',
    whiteSpace: 'nowrap',
  },

  bulkButton: {
    minHeight: '2.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    flexShrink: 0,
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.06)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  bulkDelete: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,91,132,.22)',
    borderRadius: '.6rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    cursor: 'pointer',
  },

  bulkClose: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '.6rem',
    color: '#91a0bc',
    background: 'transparent',
    cursor: 'pointer',
  },

  emptyState: {
    minHeight: '14rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.45rem',
    padding: '1.2rem',
    color: '#91a0bc',
    textAlign: 'center',
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
    maxHeight: '82vh',
    objectFit: 'contain',
    borderRadius: '1rem',
  },

  previewMeta: {
    position: 'absolute',
    right: '1rem',
    bottom: '1rem',
    left: '1rem',
    display: 'grid',
    gap: '.25rem',
    padding: '.7rem',
    borderRadius: '.8rem',
    color: '#fff',
    background: 'rgba(0,0,0,.55)',
    fontSize: '.68rem',
  },

  previewMetaSpan: {
    color: '#aab6cf',
    fontSize: '.6rem',
  },
};