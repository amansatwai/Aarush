import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Archive,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FolderPlus,
  GripVertical,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';

const PRIVACY_OPTIONS = [
  ['public', 'Public'],
  ['followers', 'Followers'],
  ['close_friends', 'Close Friends'],
  ['private', 'Private'],
];

function normalizeStory(story) {
  return {
    ...story,
    id: story?.id || `story-${Date.now()}`,
    mediaUrl:
      story?.mediaUrl ||
      story?.media_url ||
      story?.thumbnailUrl ||
      story?.thumbnail_url ||
      '',
    mediaType:
      story?.mediaType ||
      story?.media_type ||
      'image',
    createdAt:
      story?.createdAt ||
      story?.created_at ||
      new Date().toISOString(),
  };
}

function normalizeHighlight(highlight, index) {
  return {
    id: highlight?.id || `highlight-${index}`,
    title: highlight?.title || 'Untitled',
    coverUrl:
      highlight?.coverUrl ||
      highlight?.cover_url ||
      '',
    storyIds: Array.isArray(highlight?.storyIds)
      ? highlight.storyIds
      : Array.isArray(highlight?.story_ids)
        ? highlight.story_ids
        : [],
    privacy: highlight?.privacy || 'public',
    createdAt:
      highlight?.createdAt ||
      highlight?.created_at ||
      new Date().toISOString(),
    updatedAt:
      highlight?.updatedAt ||
      highlight?.updated_at ||
      new Date().toISOString(),
    order: Number(highlight?.order) || index,
  };
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently updated';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function storyUrl(story) {
  return (
    story?.mediaUrl ||
    story?.media_url ||
    story?.thumbnailUrl ||
    story?.thumbnail_url ||
    ''
  );
}

export default function StoryHighlightsManager({
  highlights = [],
  stories = [],
  selectedHighlight = null,
  onCreateHighlight,
  onRenameHighlight,
  onDeleteHighlight,
  onAddStories,
  onRemoveStories,
  onReorderStories,
  onChangeCover,
  onClose,
}) {
  const normalizedStories = useMemo(
    () => stories.map(normalizeStory),
    [stories]
  );

  const normalizedHighlights = useMemo(
    () =>
      highlights
        .map(normalizeHighlight)
        .sort((first, second) => first.order - second.order),
    [highlights]
  );

  const storyMap = useMemo(
    () =>
      new Map(
        normalizedStories.map((story) => [
          story.id,
          story,
        ])
      ),
    [normalizedStories]
  );

  const [activeId, setActiveId] = useState(
    selectedHighlight?.id ||
      normalizedHighlights[0]?.id ||
      null
  );
  const [search, setSearch] = useState('');
  const [archiveSearch, setArchiveSearch] =
    useState('');
  const [selectedStoryIds, setSelectedStoryIds] =
    useState([]);
  const [selectedCoverId, setSelectedCoverId] =
    useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] =
    useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPrivacy, setNewPrivacy] =
    useState('public');
  const [showOnProfile, setShowOnProfile] =
    useState(true);
  const [allowSharing, setAllowSharing] =
    useState(true);
  const [allowDownloads, setAllowDownloads] =
    useState(false);
  const [coverMode, setCoverMode] =
    useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState(null);
  const [previewStory, setPreviewStory] =
    useState(null);
  const [notice, setNotice] = useState('');

  const activeHighlight = useMemo(
    () =>
      normalizedHighlights.find(
        (highlight) => highlight.id === activeId
      ) || null,
    [activeId, normalizedHighlights]
  );

  const activeStories = useMemo(() => {
    if (!activeHighlight) return [];

    return activeHighlight.storyIds
      .map((id) => storyMap.get(id))
      .filter(Boolean);
  }, [activeHighlight, storyMap]);

  const filteredHighlights = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return normalizedHighlights;

    return normalizedHighlights.filter((highlight) =>
      highlight.title.toLowerCase().includes(value)
    );
  }, [normalizedHighlights, search]);

  const availableStories = useMemo(() => {
    const value = archiveSearch.toLowerCase().trim();
    const activeIds = new Set(
      activeHighlight?.storyIds || []
    );

    return normalizedStories.filter((story) => {
      if (activeIds.has(story.id)) return false;

      if (!value) return true;

      return (
        story.caption?.toLowerCase().includes(value) ||
        story.createdAt.toLowerCase().includes(value)
      );
    });
  }, [
    activeHighlight,
    archiveSearch,
    normalizedStories,
  ]);

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  }, []);

  const toggleStory = useCallback((storyId) => {
    setSelectedStoryIds((current) =>
      current.includes(storyId)
        ? current.filter((id) => id !== storyId)
        : [...current, storyId]
    );
  }, []);

  const createHighlight = useCallback(() => {
    const title = newTitle.trim();

    if (!title) {
      showNotice('Enter a highlight name.');
      return;
    }

    const coverStory =
      normalizedStories.find(
        (story) => story.id === selectedCoverId
      ) ||
      normalizedStories.find(
        (story) => story.id === selectedStoryIds[0]
      );

    const payload = {
      id: `highlight-${Date.now()}`,
      title,
      coverUrl: storyUrl(coverStory),
      storyIds: selectedStoryIds,
      privacy: newPrivacy,
      showOnProfile,
      allowSharing,
      allowDownloads,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: normalizedHighlights.length,
    };

    onCreateHighlight?.(payload);
    setCreating(false);
    setNewTitle('');
    setNewPrivacy('public');
    setSelectedStoryIds([]);
    setSelectedCoverId(null);
    showNotice('Highlight created.');
  }, [
    allowDownloads,
    allowSharing,
    newPrivacy,
    newTitle,
    normalizedHighlights.length,
    normalizedStories,
    onCreateHighlight,
    selectedCoverId,
    selectedStoryIds,
    showOnProfile,
    showNotice,
  ]);

  const renameHighlight = useCallback(
    (highlight) => {
      const title = editingTitle.trim();

      if (!title) {
        showNotice('Enter a highlight name.');
        return;
      }

      onRenameHighlight?.({
        ...highlight,
        title,
        updatedAt: new Date().toISOString(),
      });

      setEditingId(null);
      setEditingTitle('');
      showNotice('Highlight renamed.');
    },
    [
      editingTitle,
      onRenameHighlight,
      showNotice,
    ]
  );

  const addStories = useCallback(() => {
    if (!activeHighlight || !selectedStoryIds.length) {
      showNotice('Select stories to add.');
      return;
    }

    onAddStories?.({
      highlightId: activeHighlight.id,
      storyIds: selectedStoryIds,
    });

    setSelectedStoryIds([]);
    showNotice('Stories added.');
  }, [
    activeHighlight,
    onAddStories,
    selectedStoryIds,
    showNotice,
  ]);

  const removeStory = useCallback(
    (storyId) => {
      if (!activeHighlight) return;

      onRemoveStories?.({
        highlightId: activeHighlight.id,
        storyIds: [storyId],
      });

      showNotice('Story removed.');
    },
    [activeHighlight, onRemoveStories, showNotice]
  );

  const moveStory = useCallback(
    (index, direction) => {
      if (!activeHighlight) return;

      const next = [...activeHighlight.storyIds];
      const target = index + direction;

      if (target < 0 || target >= next.length) {
        return;
      }

      [next[index], next[target]] = [
        next[target],
        next[index],
      ];

      onReorderStories?.({
        highlightId: activeHighlight.id,
        storyIds: next,
      });
    },
    [activeHighlight, onReorderStories]
  );

  const chooseCover = useCallback(
    (story) => {
      if (!activeHighlight) return;

      onChangeCover?.({
        highlightId: activeHighlight.id,
        coverUrl: storyUrl(story),
        storyId: story.id,
        crop: {
          x: 0.5,
          y: 0.5,
          scale: 1,
        },
      });

      setSelectedCoverId(story.id);
      setCoverMode(false);
      showNotice('Cover updated.');
    },
    [
      activeHighlight,
      onChangeCover,
      showNotice,
    ]
  );

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    onDeleteHighlight?.(deleteTarget);
    setDeleteTarget(null);

    if (activeId === deleteTarget.id) {
      setActiveId(
        normalizedHighlights.find(
          (highlight) => highlight.id !== deleteTarget.id
        )?.id || null
      );
    }

    showNotice('Highlight deleted.');
  }, [
    activeId,
    deleteTarget,
    normalizedHighlights,
    onDeleteHighlight,
    showNotice,
  ]);

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close highlights manager"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Story Highlights</strong>
          <span>Organize your Aarush memories</span>
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          aria-label="Create new highlight"
          style={styles.primaryIconButton}
        >
          <Plus size={18} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h1 style={styles.sectionTitle}>
                Your Highlights
              </h1>
              <p style={styles.sectionSubtitle}>
                Permanent collections from your story archive.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreating(true)}
              style={styles.textButton}
            >
              <FolderPlus size={15} />
              New
            </button>
          </div>

          <div style={styles.searchBox}>
            <Search size={16} />
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search highlights"
              aria-label="Search highlights"
              style={styles.searchInput}
            />
          </div>

          {filteredHighlights.length ? (
            <div style={styles.highlightGrid}>
              {filteredHighlights.map((highlight) => {
                const cover =
                  highlight.coverUrl ||
                  storyUrl(
                    storyMap.get(highlight.storyIds[0])
                  );

                return (
                  <button
                    type="button"
                    key={highlight.id}
                    onClick={() =>
                      setActiveId(highlight.id)
                    }
                    aria-pressed={
                      activeId === highlight.id
                    }
                    style={{
                      ...styles.highlightCard,
                      ...(activeId === highlight.id
                        ? styles.activeHighlightCard
                        : {}),
                    }}
                  >
                    <span style={styles.coverRing}>
                      {cover ? (
                        <img
                          src={cover}
                          alt=""
                          loading="lazy"
                          style={styles.coverImage}
                        />
                      ) : (
                        <span style={styles.coverFallback}>
                          <Archive size={22} />
                        </span>
                      )}
                    </span>

                    <strong>{highlight.title}</strong>
                    <span>
                      {highlight.storyIds.length} stories
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <Archive size={28} />
              <strong>No highlights yet</strong>
              <span>
                Create a collection from your archived stories.
              </span>
            </div>
          )}
        </section>

        {activeHighlight ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  {activeHighlight.title}
                </h2>
                <p style={styles.sectionSubtitle}>
                  Updated {formatDate(
                    activeHighlight.updatedAt
                  )}
                </p>
              </div>

              <div style={styles.headerActions}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(activeHighlight.id);
                    setEditingTitle(
                      activeHighlight.title
                    );
                  }}
                  aria-label="Rename highlight"
                  style={styles.iconButton}
                >
                  <Edit3 size={16} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget(activeHighlight)
                  }
                  aria-label="Delete highlight"
                  style={styles.deleteIconButton}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {editingId === activeHighlight.id ? (
              <div style={styles.inlineEdit}>
                <input
                  autoFocus
                  value={editingTitle}
                  onChange={(event) =>
                    setEditingTitle(event.target.value)
                  }
                  aria-label="Highlight name"
                  style={styles.textInput}
                />

                <button
                  type="button"
                  onClick={() =>
                    renameHighlight(activeHighlight)
                  }
                  style={styles.primarySmall}
                >
                  <Check size={14} />
                  Save
                </button>
              </div>
            ) : null}

            <div style={styles.storyManagementHeader}>
              <span>
                {activeStories.length} saved stories
              </span>

              <button
                type="button"
                onClick={() => setCoverMode((value) => !value)}
                style={styles.textButton}
              >
                <ImageIcon size={15} />
                Change cover
              </button>
            </div>

            {coverMode ? (
              <div style={styles.coverPicker}>
                {activeStories.map((story) => (
                  <button
                    type="button"
                    key={story.id}
                    onClick={() => chooseCover(story)}
                    style={styles.coverChoice}
                  >
                    <img
                      src={storyUrl(story)}
                      alt="Choose highlight cover"
                      loading="lazy"
                      style={styles.coverChoiceImage}
                    />
                    {selectedCoverId === story.id ? (
                      <span style={styles.coverCheck}>
                        <Check size={13} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}

            {activeStories.length ? (
              <div style={styles.storyList}>
                {activeStories.map((story, index) => (
                  <article
                    key={story.id}
                    style={styles.storyRow}
                  >
                    <span style={styles.dragHandle}>
                      <GripVertical size={17} />
                    </span>

                    <button
                      type="button"
                      onClick={() => setPreviewStory(story)}
                      aria-label="Preview archived story"
                      style={styles.storyPreview}
                    >
                      {storyUrl(story) ? (
                        <img
                          src={storyUrl(story)}
                          alt=""
                          loading="lazy"
                          style={styles.storyImage}
                        />
                      ) : (
                        <Archive size={18} />
                      )}
                    </button>

                    <span style={styles.storyCopy}>
                      <strong>
                        {story.caption || 'Archived story'}
                      </strong>
                      <span>
                        {formatDate(story.createdAt)}
                      </span>
                    </span>

                    <div style={styles.storyActions}>
                      <button
                        type="button"
                        onClick={() =>
                          moveStory(index, -1)
                        }
                        aria-label="Move story earlier"
                        style={styles.smallIconButton}
                      >
                        <ChevronLeft size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          moveStory(index, 1)
                        }
                        aria-label="Move story later"
                        style={styles.smallIconButton}
                      >
                        <ChevronRight size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeStory(story.id)
                        }
                        aria-label="Remove story"
                        style={styles.smallDeleteButton}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <Archive size={25} />
                <span>No stories in this highlight.</span>
              </div>
            )}

            <div style={styles.settingsCard}>
              <div style={styles.settingsHeading}>
                <Settings size={16} />
                <strong>Highlight Settings</strong>
              </div>

              <label style={styles.settingRow}>
                <span>Show on profile</span>
                <input
                  type="checkbox"
                  checked={showOnProfile}
                  onChange={(event) =>
                    setShowOnProfile(
                      event.target.checked
                    )
                  }
                />
              </label>

              <label style={styles.settingRow}>
                <span>Allow sharing</span>
                <input
                  type="checkbox"
                  checked={allowSharing}
                  onChange={(event) =>
                    setAllowSharing(
                      event.target.checked
                    )
                  }
                />
              </label>

              <label style={styles.settingRow}>
                <span>Allow downloads foundation</span>
                <input
                  type="checkbox"
                  checked={allowDownloads}
                  onChange={(event) =>
                    setAllowDownloads(
                      event.target.checked
                    )
                  }
                />
              </label>

              <label style={styles.settingRow}>
                <span>Privacy</span>
                <select
                  value={activeHighlight.privacy}
                  onChange={(event) =>
                    onRenameHighlight?.({
                      ...activeHighlight,
                      privacy: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  style={styles.select}
                >
                  {PRIVACY_OPTIONS.map(
                    ([value, label]) => (
                      <option
                        value={value}
                        key={value}
                      >
                        {label}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            <div style={styles.archiveHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Archived Stories
                </h2>
                <p style={styles.sectionSubtitle}>
                  Add saved stories to this collection.
                </p>
              </div>

              <button
                type="button"
                disabled={!selectedStoryIds.length}
                onClick={addStories}
                style={styles.primarySmall}
              >
                <Plus size={14} />
                Add Selected
              </button>
            </div>

            <div style={styles.searchBox}>
              <Search size={16} />
              <input
                value={archiveSearch}
                onChange={(event) =>
                  setArchiveSearch(event.target.value)
                }
                placeholder="Search archived stories"
                aria-label="Search archived stories"
                style={styles.searchInput}
              />
            </div>

            <div style={styles.archiveGrid}>
              {availableStories.map((story) => {
                const selected = selectedStoryIds.includes(
                  story.id
                );

                return (
                  <button
                    type="button"
                    key={story.id}
                    onClick={() => toggleStory(story.id)}
                    aria-pressed={selected}
                    style={{
                      ...styles.archiveItem,
                      ...(selected
                        ? styles.selectedArchiveItem
                        : {}),
                    }}
                  >
                    {storyUrl(story) ? (
                      <img
                        src={storyUrl(story)}
                        alt=""
                        loading="lazy"
                        style={styles.archiveImage}
                      />
                    ) : (
                      <Archive size={22} />
                    )}

                    <span style={styles.archiveOverlay}>
                      {selected ? (
                        <Check size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      {creating ? (
        <div style={styles.modalBackdrop}>
          <section style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong>Create Highlight</strong>
              <button
                type="button"
                onClick={() => setCreating(false)}
                aria-label="Close create highlight"
                style={styles.iconButton}
              >
                <X size={16} />
              </button>
            </div>

            <label style={styles.field}>
              Highlight name
              <input
                autoFocus
                value={newTitle}
                onChange={(event) =>
                  setNewTitle(event.target.value)
                }
                placeholder="Travel, Friends, Memories"
                style={styles.textInput}
              />
            </label>

            <label style={styles.field}>
              Privacy
              <select
                value={newPrivacy}
                onChange={(event) =>
                  setNewPrivacy(event.target.value)
                }
                style={styles.select}
              >
                {PRIVACY_OPTIONS.map(
                  ([value, label]) => (
                    <option
                      value={value}
                      key={value}
                    >
                      {label}
                    </option>
                  )
                )}
              </select>
            </label>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setCreating(false)}
                style={styles.secondaryButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createHighlight}
                style={styles.primaryButton}
              >
                <Check size={15} />
                Create
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {deleteTarget ? (
        <div style={styles.modalBackdrop}>
          <section style={styles.confirmModal}>
            <Trash2 size={28} color="#ff9fba" />
            <strong>Delete highlight?</strong>
            <p>
              This removes the collection but does not delete
              the archived stories.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={styles.secondaryButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </section>
        </div>
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

          {storyUrl(previewStory) ? (
            previewStory.mediaType === 'video' ? (
              <video
                src={storyUrl(previewStory)}
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
                src={storyUrl(previewStory)}
                alt="Archived story preview"
                onClick={(event) =>
                  event.stopPropagation()
                }
                style={styles.previewMedia}
              />
            )
          ) : null}
        </div>
      ) : null}

      <style>{`
        @keyframes aarush-highlights-slide {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-highlight-card:hover,
        .aarush-archive-item:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 520px) {
          .aarush-highlights-grid {
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-archive-grid {
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

  primaryIconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  content: {
    width: 'min(100%, 900px)',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.85rem',
  },

  section: {
    padding: '1rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.3rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 18px 52px rgba(0,0,0,.2)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.6rem',
    marginBottom: '.75rem',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '.95rem',
    fontWeight: 850,
  },

  sectionSubtitle: {
    margin: '.2rem 0 0',
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.65rem',
    marginBottom: '.7rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.75rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
  },

  searchInput: {
    minWidth: 0,
    flex: 1,
    minHeight: '2.5rem',
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.68rem',
  },

  textButton: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: 0,
    borderRadius: '999px',
    color: '#9deeff',
    background: 'rgba(77,215,255,.08)',
    fontSize: '.62rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  highlightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5,1fr)',
    gap: '.55rem',
  },

  highlightCard: {
    minWidth: 0,
    display: 'grid',
    justifyItems: 'center',
    gap: '.32rem',
    padding: '.55rem .2rem',
    border: '1px solid transparent',
    borderRadius: '1rem',
    color: '#dce5f8',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'transform 180ms ease, background 180ms ease',
  },

  activeHighlightCard: {
    borderColor: 'rgba(124,92,255,.35)',
    background: 'rgba(124,92,255,.1)',
  },

  coverRing: {
    width: '4rem',
    height: '4rem',
    display: 'grid',
    placeItems: 'center',
    padding: '3px',
    border: '2px solid #7c5cff',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    border: '3px solid #121827',
    borderRadius: '999px',
  },

  coverFallback: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    border: '3px solid #121827',
    borderRadius: '999px',
    color: '#9deeff',
    background: '#1a2440',
  },

  highlightCardStrong: {
    maxWidth: '100%',
    overflow: 'hidden',
    fontSize: '.67rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  highlightCardSpan: {
    color: '#8491ad',
    fontSize: '.58rem',
  },

  headerActions: {
    display: 'flex',
    gap: '.3rem',
  },

  deleteIconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,91,132,.2)',
    borderRadius: '999px',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    cursor: 'pointer',
  },

  inlineEdit: {
    display: 'flex',
    gap: '.4rem',
    marginBottom: '.7rem',
  },

  textInput: {
    minWidth: 0,
    minHeight: '2.45rem',
    flex: 1,
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.7rem',
  },

  primarySmall: {
    minHeight: '2.35rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
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

  storyManagementHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.65rem',
    color: '#aab6cf',
    fontSize: '.65rem',
  },

  coverPicker: {
    display: 'flex',
    gap: '.45rem',
    overflowX: 'auto',
    marginBottom: '.7rem',
    paddingBottom: '.2rem',
  },

  coverChoice: {
    position: 'relative',
    width: '3.4rem',
    height: '3.4rem',
    flexShrink: 0,
    padding: 0,
    border: '2px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    overflow: 'hidden',
    cursor: 'pointer',
  },

  coverChoiceImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  coverCheck: {
    position: 'absolute',
    right: '.15rem',
    bottom: '.15rem',
    width: '1.15rem',
    height: '1.15rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background: '#7c5cff',
  },

  storyList: {
    display: 'grid',
    gap: '.45rem',
  },

  storyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.5rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.8rem',
    background: 'rgba(255,255,255,.035)',
  },

  dragHandle: {
    color: '#697691',
  },

  storyPreview: {
    width: '2.8rem',
    height: '3.5rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    padding: 0,
    overflow: 'hidden',
    border: 0,
    borderRadius: '.5rem',
    color: '#9deeff',
    background: '#1a2440',
    cursor: 'pointer',
  },

  storyImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  storyCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
    flex: 1,
  },

  storyCopySpan: {
    color: '#91a0bc',
    fontSize: '.6rem',
  },

  storyActions: {
    display: 'flex',
    gap: '.2rem',
  },

  smallIconButton: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.55rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  smallDeleteButton: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,91,132,.2)',
    borderRadius: '.55rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    cursor: 'pointer',
  },

  settingsCard: {
    display: 'grid',
    gap: '.65rem',
    marginTop: '.8rem',
    padding: '.75rem',
    border: '1px solid rgba(124,92,255,.16)',
    borderRadius: '.9rem',
    background: 'rgba(124,92,255,.06)',
  },

  settingsHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    color: '#dce5f8',
    fontSize: '.7rem',
  },

  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    color: '#aab6cf',
    fontSize: '.64rem',
  },

  select: {
    minHeight: '2.2rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
  },

  archiveHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginTop: '1rem',
    marginBottom: '.65rem',
  },

  archiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5,1fr)',
    gap: '.45rem',
  },

  archiveItem: {
    position: 'relative',
    aspectRatio: '9 / 13',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.75rem',
    color: '#9deeff',
    background: '#1a2440',
    cursor: 'pointer',
    transition: 'transform 180ms ease, border-color 180ms ease',
  },

  selectedArchiveItem: {
    borderColor: '#4dd7ff',
    boxShadow: '0 0 18px rgba(77,215,255,.2)',
  },

  archiveImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  archiveOverlay: {
    position: 'absolute',
    right: '.3rem',
    bottom: '.3rem',
    width: '1.45rem',
    height: '1.45rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(0,0,0,.55)',
  },

  emptyState: {
    minHeight: '10rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.45rem',
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
    width: 'min(100%, 420px)',
    display: 'grid',
    gap: '.75rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
  },

  confirmModal: {
    width: 'min(100%, 360px)',
    display: 'grid',
    justifyItems: 'center',
    gap: '.65rem',
    padding: '1.25rem',
    border: '1px solid rgba(255,91,132,.25)',
    borderRadius: '1.2rem',
    color: '#f4f7ff',
    background:
      'linear-gradient(180deg,#241722,#0e1320)',
    textAlign: 'center',
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
    fontSize: '.64rem',
  },

  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '.4rem',
    marginTop: '.35rem',
  },

  secondaryButton: {
    minHeight: '2.55rem',
    padding: '0 .75rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.68rem',
    cursor: 'pointer',
  },

  deleteButton: {
    minHeight: '2.55rem',
    padding: '0 .75rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background: '#d94b71',
    fontSize: '.68rem',
    fontWeight: 800,
    cursor: 'pointer',
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
    maxHeight: '88vh',
    objectFit: 'contain',
    borderRadius: '1rem',
  },
};