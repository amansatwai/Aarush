import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Film,
  Image as ImageIcon,
  LoaderCircle,
  Music,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';

const TEMPLATES = [
  ['year', 'Year in Review'],
  ['month', 'Monthly Recap'],
  ['weekend', 'Weekend Memories'],
  ['travel', 'Travel Story'],
  ['best', 'Best Moments'],
  ['night', 'Night Vibes'],
  ['family', 'Friends & Family'],
  ['creator', 'Creator Highlights'],
  ['aesthetic', 'Aesthetic Reel'],
  ['journey', 'Cinematic Journey'],
  ['adventure', 'Adventure Reel'],
  ['documentary', 'Minimal Documentary'],
];

const RANGES = [
  ['7d', 'Last 7 Days'],
  ['30d', 'Last 30 Days'],
  ['3m', 'Last 3 Months'],
  ['6m', 'Last 6 Months'],
  ['year', 'This Year'],
  ['last-year', 'Last Year'],
  ['custom', 'Custom Range'],
];

const STYLES = [
  'Cinematic',
  'Warm Film',
  'Cool Documentary',
  'Vintage',
  'Luxury',
  'Neon Night',
  'Soft Aesthetic',
  'Adventure',
  'Minimal',
  'Dream',
  'HDR',
  'Black & White',
];

const MUSIC_CATEGORIES = [
  'Trending',
  'Cinematic',
  'Emotional',
  'Travel',
  'Documentary',
  'Instrumental',
  'Lo-Fi',
  'Electronic',
  'Epic orchestral',
];

const TRANSITIONS = [
  'Fade',
  'Crossfade',
  'Slide',
  'Zoom',
  'Push',
  'Blur',
  'Film burn',
  'Light leak',
];

const QUALITY_OPTIONS = [
  ['standard', 'Standard'],
  ['high', 'High'],
  ['ultra', 'Ultra'],
];

function normalizeStory(story, index) {
  return {
    ...story,
    id: story?.id || `recap-story-${index}`,
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
    createdAt:
      story?.createdAt ||
      story?.created_at ||
      new Date().toISOString(),
    duration: Number(
      story?.duration ||
        story?.duration_seconds ||
        3
    ),
    views: Number(
      story?.views ||
        story?.viewCount ||
        story?.view_count ||
        0
    ),
    shares: Number(
      story?.shares ||
        story?.shareCount ||
        story?.share_count ||
        0
    ),
    replies: Number(
      story?.replies ||
        story?.replyCount ||
        story?.reply_count ||
        0
    ),
    watchTime: Number(
      story?.watchTime ||
        story?.watch_time ||
        0
    ),
  };
}

function storyUrl(story) {
  return (
    story?.thumbnailUrl ||
    story?.mediaUrl ||
    ''
  );
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

function scoreStory(story) {
  const engagement =
    story.views * 0.35 +
    story.shares * 8 +
    story.replies * 6;

  const watchScore = story.watchTime * 0.3;
  const mediaScore =
    story.mediaType === 'video' ? 12 : 6;

  return {
    score: Math.round(
      Math.min(100, engagement / 10 + watchScore + mediaScore)
    ),
    reasons: [
      story.views ? 'High views' : null,
      story.watchTime ? 'Strong watch time' : null,
      story.shares ? 'Shared frequently' : null,
      story.replies ? 'High replies' : null,
      story.mediaType === 'video'
        ? 'Cinematic video'
        : 'Strong visual',
    ].filter(Boolean),
  };
}

export default function StoryCinematicRecapGenerator({
  archivedStories = [],
  highlights = [],
  currentUser = null,
  selectedStories = [],
  onGenerateRecap,
  onSaveRecap,
  onExportRecap,
  onShareRecap,
  onClose,
}) {
  const normalizedStories = useMemo(
    () => archivedStories.map(normalizeStory),
    [archivedStories]
  );

  const [template, setTemplate] =
    useState('year');
  const [range, setRange] = useState('year');
  const [style, setStyle] =
    useState('Cinematic');
  const [musicCategory, setMusicCategory] =
    useState('Cinematic');
  const [transition, setTransition] =
    useState('Crossfade');
  const [quality, setQuality] = useState('high');
  const [aspectRatio, setAspectRatio] =
    useState('9:16');
  const [selectedIds, setSelectedIds] = useState(
    selectedStories
  );
  const [clips, setClips] = useState([]);
  const [title, setTitle] =
    useState('My Cinematic Recap');
  const [captionsEnabled, setCaptionsEnabled] =
    useState(true);
  const [chaptersEnabled, setChaptersEnabled] =
    useState(true);
  const [playing, setPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] =
    useState(0);
  const [generating, setGenerating] =
    useState(false);
  const [exporting, setExporting] =
    useState(false);
  const [notice, setNotice] = useState('');
  const frameRef = useRef(null);
  const startedAtRef = useRef(0);

  const rankedStories = useMemo(
    () =>
      [...normalizedStories]
        .map((story) => ({
          story,
          score: scoreStory(story),
        }))
        .sort(
          (first, second) =>
            second.score.score - first.score.score
        ),
    [normalizedStories]
  );

  const selectedStoriesData = useMemo(
    () =>
      normalizedStories.filter((story) =>
        selectedIds.includes(story.id)
      ),
    [normalizedStories, selectedIds]
  );

  const timeline = useMemo(
    () =>
      clips.length
        ? clips
        : selectedStoriesData.map((story, index) => ({
            id: `clip-${story.id}-${index}`,
            storyId: story.id,
            start: index * 3,
            duration: Math.max(2, story.duration),
            trimStart: 0,
            trimEnd: story.duration,
          })),
    [clips, selectedStoriesData]
  );

  const recapDuration = useMemo(
    () =>
      timeline.reduce(
        (total, clip) => total + clip.duration,
        0
      ),
    [timeline]
  );

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  }, []);

  const toggleStory = useCallback((storyId) => {
    setSelectedIds((current) =>
      current.includes(storyId)
        ? current.filter((id) => id !== storyId)
        : [...current, storyId]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(
      normalizedStories.map((story) => story.id)
    );
  }, [normalizedStories]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setClips([]);
  }, []);

  const autoSelect = useCallback(() => {
    const ids = rankedStories
      .slice(0, 12)
      .map(({ story }) => story.id);

    setSelectedIds(ids);
    showNotice('AI selected your best moments.');
  }, [rankedStories, showNotice]);

  const generateRecap = useCallback(async () => {
    if (!selectedIds.length) {
      showNotice('Select at least one story.');
      return;
    }

    setGenerating(true);

    const generatedClips =
      selectedStoriesData.map((story, index) => ({
        id: `clip-${story.id}-${Date.now()}-${index}`,
        storyId: story.id,
        start: index * 3,
        duration: Math.max(2, story.duration),
        trimStart: 0,
        trimEnd: story.duration,
        score: scoreStory(story).score,
      }));

    await new Promise((resolve) =>
      window.setTimeout(resolve, 650)
    );

    setClips(generatedClips);
    setGenerating(false);
    onGenerateRecap?.({
      template,
      style,
      range,
      storyIds: selectedIds,
      timeline: generatedClips,
    });
    showNotice('Cinematic recap prepared.');
  }, [
    onGenerateRecap,
    range,
    selectedIds,
    selectedStoriesData,
    showNotice,
    style,
    template,
  ]);

  const togglePlayback = useCallback(() => {
    if (!recapDuration) {
      showNotice('Generate a recap first.');
      return;
    }

    if (playing) {
      setPlaying(false);
      return;
    }

    startedAtRef.current =
      Date.now() - previewProgress * recapDuration * 1000;
    setPlaying(true);
  }, [
    playing,
    previewProgress,
    recapDuration,
    showNotice,
  ]);

  useEffect(() => {
    if (!playing || !recapDuration) {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      return undefined;
    }

    const update = () => {
      const elapsed =
        (Date.now() - startedAtRef.current) / 1000;
      const next = elapsed / recapDuration;

      if (next >= 1) {
        setPreviewProgress(0);
        setPlaying(false);
        return;
      }

      setPreviewProgress(next);
      frameRef.current =
        window.requestAnimationFrame(update);
    };

    frameRef.current =
      window.requestAnimationFrame(update);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [playing, recapDuration]);

  const removeClip = useCallback((clipId) => {
    setClips((current) =>
      current.filter((clip) => clip.id !== clipId)
    );
  }, []);

  const moveClip = useCallback((index, direction) => {
    setClips((current) => {
      const next = [...current];
      const target = index + direction;

      if (target < 0 || target >= next.length) {
        return current;
      }

      [next[index], next[target]] = [
        next[target],
        next[index],
      ];

      return next.map((clip, clipIndex) => ({
        ...clip,
        start: next
          .slice(0, clipIndex)
          .reduce(
            (total, item) => total + item.duration,
            0
          ),
      }));
    });
  }, []);

  const exportRecap = useCallback(() => {
    const metadata = {
      id: `recap-${Date.now()}`,
      title,
      template,
      style,
      music: {
        category: musicCategory,
        providerReady: false,
      },
      storyIds: selectedIds,
      timeline,
      transitions: {
        type: transition,
        speedRampReady: false,
        matchCutReady: false,
      },
      captions: {
        enabled: captionsEnabled,
        chapters: chaptersEnabled,
        title,
      },
      duration: recapDuration,
      resolution: aspectRatio,
      exportQuality: quality,
      aiSelection: rankedStories
        .filter(({ story }) =>
          selectedIds.includes(story.id)
        )
        .map(({ story, score }) => ({
          storyId: story.id,
          confidence: score.score,
          reasons: score.reasons,
        })),
    };

    onSaveRecap?.(metadata);
    onExportRecap?.(metadata);
    showNotice('Recap export prepared.');
  }, [
    aspectRatio,
    captionsEnabled,
    chaptersEnabled,
    musicCategory,
    onExportRecap,
    onSaveRecap,
    quality,
    rankedStories,
    recapDuration,
    selectedIds,
    style,
    timeline,
    title,
    transition,
    showNotice,
  ]);

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close recap generator"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Cinematic Recap</strong>
          <span>Turn your memories into a story</span>
        </div>

        <button
          type="button"
          onClick={exportRecap}
          aria-label="Export recap"
          style={styles.primaryIconButton}
        >
          <Send size={17} />
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
            {generating ? (
              <LoaderCircle
                size={27}
                style={styles.spinner}
              />
            ) : (
              <Film size={27} />
            )}
          </div>

          <div>
            <h1>AI Cinematic Recap</h1>
            <p>
              Select the moments that made your story worth
              remembering.
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>AI Recap Templates</h2>
              <span>Choose a visual story structure.</span>
            </div>
          </div>

          <div style={styles.templateGrid}>
            {TEMPLATES.map(([id, label]) => (
              <button
                type="button"
                key={id}
                onClick={() => setTemplate(id)}
                aria-pressed={template === id}
                style={{
                  ...styles.templateButton,
                  ...(template === id
                    ? styles.activeTemplate
                    : {}),
                }}
              >
                <Sparkles size={15} />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Time Range</h2>
              <span>Focus the recap on a period.</span>
            </div>
          </div>

          <div style={styles.chipRow}>
            {[
              ['7d', 'Last 7 Days'],
              ['30d', 'Last 30 Days'],
              ['3m', 'Last 3 Months'],
              ['6m', 'Last 6 Months'],
              ['year', 'This Year'],
              ['last-year', 'Last Year'],
              ['custom', 'Custom Range'],
            ].map(([id, label]) => (
              <button
                type="button"
                key={id}
                onClick={() => setRange(id)}
                aria-pressed={range === id}
                style={{
                  ...styles.chip,
                  ...(range === id
                    ? styles.activeChip
                    : {}),
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Story Selection</h2>
              <span>
                {selectedIds.length} stories selected
              </span>
            </div>

            <div style={styles.selectionActions}>
              <button
                type="button"
                onClick={autoSelect}
                style={styles.smallButton}
              >
                <Wand2 size={14} />
                AI Select
              </button>

              <button
                type="button"
                onClick={selectAll}
                style={styles.smallButton}
              >
                Select all
              </button>

              <button
                type="button"
                onClick={clearSelection}
                style={styles.smallButton}
              >
                Clear
              </button>
            </div>
          </div>

          <div style={styles.storyGrid}>
            {rankedStories.map(({ story, score }) => {
              const selected = selectedIds.includes(
                story.id
              );

              return (
                <button
                  type="button"
                  key={story.id}
                  onClick={() => toggleStory(story.id)}
                  aria-pressed={selected}
                  style={{
                    ...styles.storyCard,
                    ...(selected
                      ? styles.selectedStoryCard
                      : {}),
                  }}
                >
                  {storyUrl(story) ? (
                    <img
                      src={storyUrl(story)}
                      alt=""
                      loading="lazy"
                      style={styles.storyImage}
                    />
                  ) : (
                    <ImageIcon size={22} />
                  )}

                  <span style={styles.storyBadge}>
                    {score.score}%
                  </span>

                  <span style={styles.storyCheck}>
                    {selected ? <Check size={14} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section style={styles.previewCard}>
          <div style={styles.previewHeader}>
            <div>
              <h2>Preview</h2>
              <span>
                {timeline.length} clips ·{' '}
                {Math.round(recapDuration)} seconds
              </span>
            </div>

            <button
              type="button"
              onClick={togglePlayback}
              aria-label={
                playing ? 'Pause recap' : 'Play recap'
              }
              style={styles.playButton}
            >
              {playing ? (
                <Pause size={19} />
              ) : (
                <Play size={19} />
              )}
            </button>
          </div>

          <div style={styles.previewFrame}>
            {timeline[0] &&
            storyUrl(
              normalizedStories.find(
                (story) =>
                  story.id === timeline[0].storyId
              )
            ) ? (
              <img
                src={storyUrl(
                  normalizedStories.find(
                    (story) =>
                      story.id === timeline[0].storyId
                  )
                )}
                alt=""
                style={styles.previewImage}
              />
            ) : (
              <div style={styles.previewEmpty}>
                <Film size={32} />
                <span>Generate a recap to preview it.</span>
              </div>
            )}

            <div style={styles.previewShade} />

            <span style={styles.previewTitle}>
              {title}
            </span>
          </div>

          <div style={styles.progressTrack}>
            <span
              style={{
                ...styles.progressFill,
                width: `${previewProgress * 100}%`,
              }}
            />
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Recap Title & Captions</h2>
              <span>Prepare title and chapter metadata.</span>
            </div>
          </div>

          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            aria-label="Recap title"
            style={styles.textInput}
          />

          <label style={styles.settingRow}>
            <span>Auto-generate title</span>
            <input
              type="checkbox"
              checked
              readOnly
            />
          </label>

          <label style={styles.settingRow}>
            <span>Auto subtitles foundation</span>
            <input
              type="checkbox"
              checked={captionsEnabled}
              onChange={(event) =>
                setCaptionsEnabled(
                  event.target.checked
                )
              }
            />
          </label>

          <label style={styles.settingRow}>
            <span>Chapter markers</span>
            <input
              type="checkbox"
              checked={chaptersEnabled}
              onChange={(event) =>
                setChaptersEnabled(
                  event.target.checked
                )
              }
            />
          </label>
        </section>

        <section style={styles.twoColumn}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Music</h2>
                <span>{musicCategory}</span>
              </div>
              <Music size={18} color="#4dd7ff" />
            </div>

            <select
              value={musicCategory}
              onChange={(event) =>
                setMusicCategory(event.target.value)
              }
              aria-label="Recap music category"
              style={styles.select}
            >
              {[
                'Trending',
                'Cinematic',
                'Emotional',
                'Travel',
                'Documentary',
                'Instrumental',
                'Lo-Fi',
                'Electronic',
                'Epic orchestral',
              ].map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() =>
                showNotice(
                  'Music Library and Timeline Editor ready.'
                )
              }
              style={styles.outlineButton}
            >
              Open music tools
              <ChevronRight size={15} />
            </button>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>AI Style</h2>
                <span>{style}</span>
              </div>
              <Sparkles size={18} color="#a895ff" />
            </div>

            <select
              value={style}
              onChange={(event) =>
                setStyle(event.target.value)
              }
              aria-label="Recap visual style"
              style={styles.select}
            >
              {STYLES.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={transition}
              onChange={(event) =>
                setTransition(event.target.value)
              }
              aria-label="Recap transition"
              style={styles.select}
            >
              {TRANSITIONS.map((item) => (
                <option value={item} key={item}>
                  {item} transition
                </option>
              ))}
            </select>
          </div>
        </section>

        <section style={styles.timelineSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Cinematic Timeline</h2>
              <span>Reorder and refine your clips.</span>
            </div>
            <span style={styles.timelineCount}>
              {timeline.length} clips
            </span>
          </div>

          <div style={styles.timeline}>
            {timeline.map((clip, index) => {
              const story = normalizedStories.find(
                (item) => item.id === clip.storyId
              );

              return (
                <article
                  key={clip.id}
                  style={styles.timelineClip}
                >
                  <span style={styles.clipNumber}>
                    {index + 1}
                  </span>

                  <span style={styles.clipThumb}>
                    {storyUrl(story) ? (
                      <img
                        src={storyUrl(story)}
                        alt=""
                        loading="lazy"
                        style={styles.clipImage}
                      />
                    ) : (
                      <ImageIcon size={17} />
                    )}
                  </span>

                  <div style={styles.clipCopy}>
                    <strong>
                      {story?.caption ||
                        `Clip ${index + 1}`}
                    </strong>
                    <span>
                      {clip.duration.toFixed(1)}s ·{' '}
                      {formatDate(story?.createdAt)}
                    </span>
                  </div>

                  <div style={styles.clipActions}>
                    <button
                      type="button"
                      onClick={() =>
                        moveClip(index, -1)
                      }
                      aria-label="Move clip earlier"
                      style={styles.tinyButton}
                    >
                      <ChevronDown
                        size={14}
                        style={{ transform: 'rotate(180deg)' }}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moveClip(index, 1)
                      }
                      aria-label="Move clip later"
                      style={styles.tinyButton}
                    >
                      <ChevronDown size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeClip(clip.id)
                      }
                      aria-label="Remove clip"
                      style={styles.tinyDelete}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section style={styles.exportSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2>Export</h2>
              <span>Prepare a high-quality recap.</span>
            </div>
          </div>

          <div style={styles.chipRow}>
            {['9:16', '1:1', '16:9'].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setAspectRatio(value)}
                aria-pressed={aspectRatio === value}
                style={{
                  ...styles.chip,
                  ...(aspectRatio === value
                    ? styles.activeChip
                    : {}),
                }}
              >
                {value === '9:16'
                  ? 'Story / Reel'
                  : value === '1:1'
                    ? 'Square'
                    : 'Landscape'}
              </button>
            ))}
          </div>

          <div style={styles.chipRow}>
            {QUALITY_OPTIONS.map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setQuality(value)}
                aria-pressed={quality === value}
                style={{
                  ...styles.chip,
                  ...(quality === value
                    ? styles.activeChip
                    : {}),
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={exportRecap}
            disabled={exporting || generating}
            style={styles.exportButton}
          >
            {exporting ? (
              <LoaderCircle
                size={17}
                style={styles.spinner}
              />
            ) : (
              <Send size={17} />
            )}
            {exporting
              ? 'Preparing export…'
              : 'Export Cinematic Recap'}
          </button>

          <button
            type="button"
            onClick={() => {
              onShareRecap?.({
                title,
                storyIds: selectedIds,
              });
              showNotice('Recap sharing prepared.');
            }}
            style={styles.outlineButton}
          >
            Share recap
            <ChevronRight size={15} />
          </button>
        </section>
      </div>

      <style>{`
        @keyframes aarush-recap-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-recap-spin {
          to { transform: rotate(360deg); }
        }

        .aarush-recap-story:hover,
        .aarush-recap-template:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 600px) {
          .aarush-recap-two-column {
            grid-template-columns: 1fr !important;
          }

          .aarush-recap-story-grid {
            grid-template-columns: repeat(4,1fr) !important;
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

function storyUrl(story) {
  return (
    story?.thumbnailUrl ||
    story?.mediaUrl ||
    ''
  );
}

function formatDate(value) {
  if (!value) return 'Unknown date';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
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
    width: 'min(100%, 940px)',
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
    width: '3.2rem',
    height: '3.2rem',
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
    gap: '.2rem',
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

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-recap-in 240ms ease both',
  },

  previewCard: {
    padding: '.9rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '1.15rem',
    background: 'rgba(15,19,30,.92)',
  },

  exportSection: {
    display: 'grid',
    gap: '.6rem',
    padding: '.9rem',
    border: '1px solid rgba(77,215,255,.2)',
    borderRadius: '1.1rem',
    background: 'rgba(77,215,255,.055)',
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

  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
  },

  templateButton: {
    minHeight: '2.55rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeTemplate: {
    borderColor: 'rgba(124,92,255,.48)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  chip: {
    minHeight: '2.25rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  activeChip: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  selectionActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.3rem',
  },

  smallButton: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  storyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6,1fr)',
    gap: '.45rem',
  },

  storyCard: {
    position: 'relative',
    aspectRatio: '9 / 13',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#9deeff',
    background: '#17233d',
    cursor: 'pointer',
    transition: 'transform 180ms ease, border-color 180ms ease',
  },

  selectedStoryCard: {
    borderColor: '#4dd7ff',
    boxShadow: '0 0 18px rgba(77,215,255,.2)',
  },

  storyImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  storyBadge: {
    position: 'absolute',
    top: '.3rem',
    left: '.3rem',
    padding: '.2rem .28rem',
    borderRadius: '999px',
    color: '#c7ffe4',
    background: 'rgba(0,0,0,.55)',
    fontSize: '.52rem',
    fontWeight: 800,
  },

  storyCheck: {
    position: 'absolute',
    top: '.3rem',
    right: '.3rem',
    width: '1.35rem',
    height: '1.35rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.5)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(0,0,0,.45)',
  },

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '.65rem',
  },

  previewHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  previewHeaderH2: {
    margin: 0,
    fontSize: '.86rem',
  },

  previewHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  playButton: {
    width: '2.6rem',
    height: '2.6rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  previewFrame: {
    position: 'relative',
    minHeight: '15rem',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    borderRadius: '1rem',
    color: '#9deeff',
    background: '#17233d',
  },

  previewImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  previewShade: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg,transparent 35%,rgba(0,0,0,.8))',
  },

  previewEmpty: {
    display: 'grid',
    justifyItems: 'center',
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  previewTitle: {
    position: 'absolute',
    right: '.8rem',
    bottom: '.7rem',
    left: '.8rem',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 850,
    textShadow: '0 2px 12px rgba(0,0,0,.6)',
  },

  progressTrack: {
    position: 'relative',
    height: '.25rem',
    overflow: 'hidden',
    marginTop: '.65rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.1)',
  },

  progressFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
    transition: 'width 100ms linear',
  },

  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    minHeight: '2.45rem',
    color: '#aab6cf',
    fontSize: '.64rem',
  },

  textInput: {
    minHeight: '2.55rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.7rem',
  },

  select: {
    minHeight: '2.45rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
  },

  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.8rem',
  },

  outlineButton: {
    minHeight: '2.45rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    border: '1px solid rgba(77,215,255,.22)',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.08)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  timelineSection: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
  },

  timelineCount: {
    color: '#9deeff',
    fontSize: '.6rem',
  },

  timeline: {
    display: 'grid',
    gap: '.4rem',
  },

  timelineClip: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.5rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  clipNumber: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.58rem',
    fontWeight: 800,
  },

  clipThumb: {
    width: '2.4rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: '.45rem',
    color: '#9deeff',
    background: '#17233d',
  },

  clipImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  clipCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
    flex: 1,
  },

  clipCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  clipActions: {
    display: 'flex',
    gap: '.2rem',
  },

  tinyButton: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.5rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  tinyDelete: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,91,132,.2)',
    borderRadius: '.5rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    cursor: 'pointer',
  },

  exportButton: {
    minHeight: '2.8rem',
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

  spinner: {
    animation: 'aarush-recap-spin 800ms linear infinite',
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
};