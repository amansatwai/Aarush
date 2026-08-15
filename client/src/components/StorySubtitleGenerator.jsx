import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Film,
  Image as ImageIcon,
  LoaderCircle,
  Music,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';

const TEMPLATES = [
  ['travel', 'Travel'],
  ['birthday', 'Birthday'],
  ['celebration', 'Celebration'],
  ['night-drive', 'Night Drive'],
  ['coffee', 'Coffee'],
  ['workout', 'Workout'],
  ['study', 'Study'],
  ['romantic', 'Romantic'],
  ['adventure', 'Adventure'],
  ['festival', 'Festival'],
  ['luxury', 'Luxury'],
  ['cinematic', 'Cinematic'],
  ['documentary', 'Documentary'],
  ['aesthetic', 'Aesthetic'],
  ['vlog', 'Vlog'],
];

const STORY_TYPES = [
  'Single Story',
  'Multi-Story Sequence',
  'Cinematic Montage',
  'Photo Slideshow',
  'Video Story',
  'Mixed Story',
];

const VISUAL_STYLES = [
  'Realistic',
  'Cinematic',
  'Aesthetic',
  'Luxury',
  'Vintage',
  'Neon',
  'Documentary',
  'Anime foundation',
  'Dream',
  'HDR',
  'Soft Portrait',
  'Travel Film',
];

const MUSIC_STYLES = [
  'Trending',
  'Cinematic',
  'Emotional',
  'Travel',
  'Electronic',
  'Lo-Fi',
  'Piano',
  'Orchestral',
  'Hip-Hop',
  'Chill',
  'Luxury',
  'Documentary',
];

const FILTERS = [
  'Cinematic',
  'Moody',
  'Portrait',
  'Sunset',
  'Night',
  'Neon',
  'Documentary',
];

const STICKERS = [
  'Location',
  'Weather',
  'Time',
  'Poll',
  'Question',
  'Emoji',
  'Music',
  'Hashtag',
];

const EXAMPLES = [
  'Sunset at Goa beach',
  'Late night drive in Delhi',
  'Birthday celebration with friends',
  'Cinematic travel montage',
  'Minimal aesthetic coffee story',
  'Motivational morning story',
  'Luxury lifestyle reel',
  'Study with me',
  'Gym transformation',
  'Monsoon vibes',
];

function makeScene(number, prompt, duration, style) {
  return {
    id: `scene-${Date.now()}-${number}`,
    number,
    duration,
    visualDescription:
      prompt ||
      `A ${style.toLowerCase()} story scene`,
    cameraMovement:
      number % 2 === 0 ? 'Slow push in' : 'Cinematic pan',
    transition:
      number === 1 ? 'Fade' : 'Crossfade',
    captionSuggestion:
      number === 1
        ? 'Every moment tells a story.'
        : 'Keep this moment close.',
    musicCue:
      number === 1 ? 'Opening beat' : 'Beat continuation',
    stickerSuggestion:
      number === 1 ? 'Location' : 'Emoji',
    textOverlaySuggestion:
      number === 1 ? 'Aarush Stories' : '',
    thumbnail: '',
  };
}

function normalizeDraft(draft) {
  return {
    title: draft?.title || 'Untitled AI Story',
    prompt: draft?.prompt || '',
    scenes: Array.isArray(draft?.scenes)
      ? draft.scenes
      : [],
    captions: Array.isArray(draft?.captions)
      ? draft.captions
      : [],
    hashtags: Array.isArray(draft?.hashtags)
      ? draft.hashtags
      : [],
    music: draft?.music || null,
    filters: Array.isArray(draft?.filters)
      ? draft.filters
      : [],
    stickers: Array.isArray(draft?.stickers)
      ? draft.stickers
      : [],
    textLayers: Array.isArray(draft?.textLayers)
      ? draft.textLayers
      : [],
    transitions: Array.isArray(draft?.transitions)
      ? draft.transitions
      : [],
    estimatedDuration:
      Number(draft?.estimatedDuration) || 0,
    aiConfidence: Number(draft?.aiConfidence) || 0,
  };
}

export default function StoryAIGeneratorStudio({
  initialPrompt = '',
  currentMedia = null,
  currentCaption = '',
  selectedStyle = 'Cinematic',
  selectedDuration = 15,
  onGenerate,
  onApplyDraft,
  onSaveDraft,
  onClose,
}) {
  const [prompt, setPrompt] =
    useState(initialPrompt);
  const [template, setTemplate] =
    useState('cinematic');
  const [storyType, setStoryType] =
    useState('Single Story');
  const [style, setStyle] =
    useState(selectedStyle);
  const [musicStyle, setMusicStyle] =
    useState('Cinematic');
  const [duration, setDuration] =
    useState(Number(selectedDuration) || 15);
  const [scenes, setScenes] = useState([]);
  const [draft, setDraft] = useState(null);
  const [activePanel, setActivePanel] =
    useState('prompt');
  const [generating, setGenerating] =
    useState(false);
  const [notice, setNotice] = useState('');
  const [captionStyle, setCaptionStyle] =
    useState('Short');
  const [customTitle, setCustomTitle] =
    useState('');

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  }, []);

  const generatedScenes = useMemo(() => {
    if (scenes.length) return scenes;

    const count =
      storyType === 'Single Story'
        ? 1
        : storyType === 'Photo Slideshow'
          ? 4
          : 5;

    const sceneDuration = Math.max(
      2,
      Math.round(duration / count)
    );

    return Array.from({ length: count }, (_, index) =>
      makeScene(
        index + 1,
        prompt.trim(),
        sceneDuration,
        style
      )
    );
  }, [duration, prompt, scenes, storyType, style]);

  const generatedDraft = useMemo(
    () =>
      normalizeDraft({
        title:
          customTitle.trim() ||
          prompt.trim() ||
          'Aarush AI Story',
        prompt,
        scenes: generatedScenes,
        captions: generatedScenes.map(
          (scene) => scene.captionSuggestion
        ),
        hashtags: [
          '#AarushStories',
          '#CreatorLife',
          `#${template.replace('-', '')}`,
          `#${style.replace(/\s+/g, '')}`,
        ],
        music: {
          songId: null,
          songTitle: `${musicStyle} story soundtrack`,
          artist: 'Aarush Music Foundation',
          album: 'AI Story Studio',
          songStart: 0,
          songEnd: duration,
          videoStart: 0,
          videoEnd: duration,
          musicVolume: 1,
          originalVolume: 0.6,
          beatSync: false,
        },
        filters: [style, ...FILTERS.slice(0, 2)],
        stickers: ['Location', 'Time'],
        textLayers: generatedScenes
          .filter(
            (scene) => scene.textOverlaySuggestion
          )
          .map((scene) => ({
            id: scene.id,
            text: scene.textOverlaySuggestion,
            x: 50,
            y: 82,
            scale: 1,
            rotation: 0,
            fontFamily: 'Inter',
            color: '#ffffff',
            animation: 'Cinematic Fade',
          })),
        transitions: generatedScenes.map(
          (scene) => scene.transition
        ),
        estimatedDuration: generatedScenes.reduce(
          (total, scene) => total + scene.duration,
          0
        ),
        aiConfidence: 0.88,
      }),
    [
      customTitle,
      duration,
      generatedScenes,
      musicStyle,
      prompt,
      style,
      template,
    ]
  );

  const generate = useCallback(async () => {
    if (!prompt.trim() && !currentMedia) {
      showNotice('Describe the story you want to create.');
      return;
    }

    setGenerating(true);

    await new Promise((resolve) =>
      window.setTimeout(resolve, 650)
    );

    const nextScenes = generatedScenes.map(
      (scene, index) => ({
        ...scene,
        id: `scene-${Date.now()}-${index}`,
      })
    );

    setScenes(nextScenes);
    setDraft({
      ...generatedDraft,
      scenes: nextScenes,
      estimatedDuration: nextScenes.reduce(
        (total, scene) => total + scene.duration,
        0
      ),
    });
    setGenerating(false);
    onGenerate?.({
      ...generatedDraft,
      scenes: nextScenes,
    });
    showNotice('AI story draft generated.');
  }, [
    currentMedia,
    generatedDraft,
    generatedScenes,
    onGenerate,
    prompt,
    showNotice,
  ]);

  const applyDraft = useCallback(() => {
    const nextDraft = draft || generatedDraft;

    onApplyDraft?.(nextDraft);
    showNotice('Draft exported to Story Editor.');
  }, [draft, generatedDraft, onApplyDraft, showNotice]);

  const saveDraft = useCallback(() => {
    const nextDraft = draft || generatedDraft;

    onSaveDraft?.(nextDraft);
    showNotice('Story draft saved.');
  }, [draft, generatedDraft, onSaveDraft, showNotice]);

  const removeScene = useCallback((sceneId) => {
    setScenes((current) =>
      current.filter((scene) => scene.id !== sceneId)
    );
  }, []);

  const duplicateScene = useCallback((scene) => {
    const duplicate = {
      ...scene,
      id: `scene-${Date.now()}`,
      number: scene.number + 1,
    };

    setScenes((current) => [
      ...current,
      duplicate,
    ]);
  }, []);

  const regenerateScene = useCallback(
    (scene) => {
      setScenes((current) =>
        current.map((item) =>
          item.id === scene.id
            ? {
                ...item,
                visualDescription:
                  `${prompt || 'A cinematic moment'} with a fresh perspective`,
                cameraMovement:
                  item.cameraMovement === 'Slow push in'
                    ? 'Cinematic pan'
                    : 'Slow push in',
                captionSuggestion:
                  item.captionSuggestion ===
                  'Every moment tells a story.'
                    ? 'Make this moment unforgettable.'
                    : 'Every moment tells a story.',
              }
            : item
        )
      );

      showNotice('Scene regenerated.');
    },
    [prompt, showNotice]
  );

  const panels = [
    ['prompt', 'Prompt', Sparkles],
    ['templates', 'Templates', Wand2],
    ['storyboard', 'Storyboard', Film],
    ['music', 'Music', Music],
    ['style', 'Style', ImageIcon],
    ['preview', 'Preview', Play],
  ];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI generation studio"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>AI Generation Studio</strong>
          <span>Build a complete story draft</span>
        </div>

        <button
          type="button"
          onClick={saveDraft}
          aria-label="Save story draft"
          style={styles.primaryIconButton}
        >
          <Check size={17} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <div style={styles.panelTabs}>
          {panels.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActivePanel(id)}
              aria-pressed={activePanel === id}
              style={{
                ...styles.panelTab,
                ...(activePanel === id
                  ? styles.activePanelTab
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {activePanel === 'prompt' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Prompt Composer</h2>
                <span>
                  Describe the story you want to create.
                </span>
              </div>
              <Sparkles size={18} color="#4dd7ff" />
            </div>

            <textarea
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              placeholder="Example: a cinematic sunset at Goa beach with warm film colors"
              aria-label="AI story prompt"
              style={styles.textarea}
            />

            <div style={styles.exampleRow}>
              {EXAMPLES.map((example) => (
                <button
                  type="button"
                  key={example}
                  onClick={() => setPrompt(example)}
                  style={styles.exampleButton}
                >
                  {example}
                </button>
              ))}
            </div>

            <label style={styles.field}>
              Story title
              <input
                value={customTitle}
                onChange={(event) =>
                  setCustomTitle(event.target.value)
                }
                placeholder="Auto-generated title"
                style={styles.input}
              />
            </label>

            <div style={styles.settingGrid}>
              <label style={styles.field}>
                Story type
                <select
                  value={storyType}
                  onChange={(event) =>
                    setStoryType(event.target.value)
                  }
                  style={styles.select}
                >
                  {STORY_TYPES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label style={styles.field}>
                Duration
                <select
                  value={duration}
                  onChange={(event) =>
                    setDuration(
                      Number(event.target.value)
                    )
                  }
                  style={styles.select}
                >
                  {[5, 10, 15, 30, 45, 60].map(
                    (value) => (
                      <option value={value} key={value}>
                        {value} seconds
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={generating}
              style={styles.generateButton}
            >
              {generating ? (
                <LoaderCircle
                  size={18}
                  style={styles.spinner}
                />
              ) : (
                <Wand2 size={18} />
              )}
              {generating
                ? 'Generating story…'
                : 'Generate AI Story'}
            </button>
          </section>
        ) : null}

        {activePanel === 'templates' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>AI Templates</h2>
                <span>Start with a proven story structure.</span>
              </div>
            </div>

            <div style={styles.templateGrid}>
              {TEMPLATES.map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => {
                    setTemplate(id);
                    setPrompt(
                      `Create a ${label.toLowerCase()} story`
                    );
                  }}
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
        ) : null}

        {activePanel === 'storyboard' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>AI Storyboard</h2>
                <span>
                  Arrange scenes before sending them to the
                  editor.
                </span>
              </div>

              <span style={styles.confidence}>
                {Math.round(
                  (draft?.aiConfidence ||
                    generatedDraft.aiConfidence) * 100
                )}
                %
              </span>
            </div>

            <div style={styles.sceneList}>
              {(draft?.scenes || generatedScenes).map(
                (scene, index) => (
                  <article
                    key={scene.id}
                    style={styles.sceneCard}
                  >
                    <span style={styles.sceneNumber}>
                      {index + 1}
                    </span>

                    <div style={styles.sceneVisual}>
                      {scene.thumbnail ? (
                        <img
                          src={scene.thumbnail}
                          alt=""
                          loading="lazy"
                          style={styles.sceneImage}
                        />
                      ) : (
                        <Film size={20} />
                      )}
                    </div>

                    <div style={styles.sceneCopy}>
                      <strong>
                        {scene.visualDescription}
                      </strong>
                      <span>
                        {scene.duration}s ·{' '}
                        {scene.cameraMovement}
                      </span>
                      <small>
                        {scene.transition} ·{' '}
                        {scene.musicCue}
                      </small>
                    </div>

                    <div style={styles.sceneActions}>
                      <button
                        type="button"
                        onClick={() =>
                          regenerateScene(scene)
                        }
                        aria-label="Regenerate scene"
                        style={styles.tinyButton}
                      >
                        <RefreshCw size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          duplicateScene(scene)
                        }
                        aria-label="Duplicate scene"
                        style={styles.tinyButton}
                      >
                        <CopyIcon />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeScene(scene.id)
                        }
                        aria-label="Remove scene"
                        style={styles.tinyDelete}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>

            {!scenes.length ? (
              <button
                type="button"
                onClick={generate}
                style={styles.outlineButton}
              >
                <Wand2 size={15} />
                Generate storyboard
              </button>
            ) : null}
          </section>
        ) : null}

        {activePanel === 'music' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Music Style</h2>
                <span>
                  Compatible with music library and timeline
                  editor.
                </span>
              </div>
              <Music size={18} color="#4dd7ff" />
            </div>

            <div style={styles.chipGrid}>
              {MUSIC_STYLES.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setMusicStyle(item)}
                  aria-pressed={musicStyle === item}
                  style={{
                    ...styles.chip,
                    ...(musicStyle === item
                      ? styles.activeChip
                      : {}),
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                showNotice(
                  'Music Library and Timeline Editor ready.'
                )
              }
              style={styles.outlineButton}
            >
              <Music size={15} />
              Open music tools
              <ChevronRight size={15} />
            </button>
          </section>
        ) : null}

        {activePanel === 'style' ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2>Visual Style</h2>
                <span>
                  Define the look of the generated story.
                </span>
              </div>
              <ImageIcon size={18} color="#a895ff" />
            </div>

            <div style={styles.styleGrid}>
              {VISUAL_STYLES.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setStyle(item)}
                  aria-pressed={style === item}
                  style={{
                    ...styles.styleButton,
                    ...(style === item
                      ? styles.activeStyle
                      : {}),
                  }}
                >
                  <span
                    style={{
                      ...styles.styleSwatch,
                      background:
                        styleColor(item),
                    }}
                  />
                  {item}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {activePanel === 'preview' ? (
          <section style={styles.section}>
            <div style={styles.previewHeader}>
              <div>
                <h2>AI Draft Preview</h2>
                <span>
                  {generatedDraft.title} ·{' '}
                  {generatedDraft.estimatedDuration}s
                </span>
              </div>

              <button
                type="button"
                onClick={applyDraft}
                style={styles.applyButton}
              >
                <Check size={15} />
                Export to Editor
              </button>
            </div>

            <div style={styles.previewFrame}>
              {currentMedia?.url ||
              currentMedia?.mediaUrl ? (
                <img
                  src={
                    currentMedia.url ||
                    currentMedia.mediaUrl
                  }
                  alt=""
                  style={styles.previewImage}
                />
              ) : (
                <div style={styles.previewPlaceholder}>
                  <Film size={34} />
                  <span>
                    Your generated story preview will
                    appear here.
                  </span>
                </div>
              )}

              <div style={styles.previewOverlay}>
                <strong>{generatedDraft.title}</strong>
                <span>
                  {generatedDraft.scenes.length} scenes ·{' '}
                  {style}
                </span>
              </div>
            </div>

            <div style={styles.metadataGrid}>
              <span>
                Scenes
                <strong>
                  {generatedDraft.scenes.length}
                </strong>
              </span>
              <span>
                Hashtags
                <strong>
                  {generatedDraft.hashtags.length}
                </strong>
              </span>
              <span>
                Stickers
                <strong>
                  {generatedDraft.stickers.length}
                </strong>
              </span>
              <span>
                Confidence
                <strong>
                  {Math.round(
                    generatedDraft.aiConfidence * 100
                  )}
                  %
                </strong>
              </span>
            </div>

            <div style={styles.optionRow}>
              <button
                type="button"
                onClick={() => setCaptionStyle('Short')}
                style={styles.chip}
              >
                Short caption
              </button>
              <button
                type="button"
                onClick={() => setCaptionStyle('Viral')}
                style={styles.chip}
              >
                Viral caption
              </button>
              <button
                type="button"
                onClick={() =>
                  showNotice(
                    'AI stickers and filters prepared.'
                  )
                }
                style={styles.chip}
              >
                AI overlays
              </button>
            </div>

            <p style={styles.captionPreview}>
              {captionStyle} caption: {currentCaption ||
                generatedDraft.captions[0] ||
                'A story worth remembering.'}
            </p>
          </section>
        ) : null}

        <section style={styles.footerActions}>
          <button
            type="button"
            onClick={saveDraft}
            style={styles.outlineButton}
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={applyDraft}
            style={styles.generateButton}
          >
            <Check size={17} />
            Export to Story Editor
          </button>
        </section>
      </div>

      <style>{`
        @keyframes aarush-generator-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-generator-spin {
          to { transform: rotate(360deg); }
        }

        .aarush-generator-button:hover,
        .aarush-generator-template:hover,
        .aarush-generator-scene:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 560px) {
          .aarush-generator-panel-tabs {
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-generator-template-grid {
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

function storyUrl(story) {
  return (
    story?.thumbnailUrl ||
    story?.mediaUrl ||
    story?.url ||
    ''
  );
}

function styleColor(style) {
  const colors = {
    Realistic: '#82e9c1',
    Cinematic: '#7c5cff',
    Aesthetic: '#ff4fd8',
    Luxury: '#ffd27d',
    Vintage: '#d89162',
    Neon: '#4dd7ff',
    Documentary: '#9aa7c1',
    'Anime foundation': '#ff9acb',
    Dream: '#a895ff',
    HDR: '#c9f9ff',
    'Soft Portrait': '#ffb997',
    'Travel Film': '#4dd7ff',
  };

  return colors[style] || '#7c5cff';
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
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

  panelTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.35rem',
  },

  panelTab: {
    minHeight: '2.55rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  activePanelTab: {
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
    animation: 'aarush-generator-in 240ms ease both',
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

  textarea: {
    width: '100%',
    minHeight: '7rem',
    boxSizing: 'border-box',
    padding: '.7rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '.8rem',
    outline: 0,
    resize: 'vertical',
    color: '#fff',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.72rem',
    lineHeight: 1.5,
  },

  exampleRow: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    padding: '.5rem 0',
  },

  exampleButton: {
    minHeight: '2rem',
    flexShrink: 0,
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  input: {
    minHeight: '2.5rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.7rem',
  },

  settingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.5rem',
  },

  select: {
    minHeight: '2.45rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
  },

  generateButton: {
    minHeight: '2.8rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
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
    animation: 'aarush-generator-spin 800ms linear infinite',
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
    transition: 'transform 180ms ease',
  },

  activeTemplate: {
    borderColor: 'rgba(124,92,255,.48)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  confidence: {
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '.58rem',
    fontWeight: 800,
  },

  sceneList: {
    display: 'grid',
    gap: '.45rem',
  },

  sceneCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    background: 'rgba(255,255,255,.035)',
    transition: 'transform 180ms ease',
  },

  sceneNumber: {
    width: '1.55rem',
    height: '1.55rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.58rem',
    fontWeight: 800,
  },

  sceneVisual: {
    width: '3rem',
    height: '3.5rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: '.5rem',
    color: '#9deeff',
    background: '#17233d',
  },

  sceneImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  sceneCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  sceneCopySpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  sceneCopySmall: {
    color: '#6f7d98',
    fontSize: '.56rem',
  },

  sceneActions: {
    display: 'flex',
    gap: '.2rem',
  },

  tinyButton: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.5rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  tinyDelete: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,91,132,.2)',
    borderRadius: '.5rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    cursor: 'pointer',
  },

  outlineButton: {
    minHeight: '2.55rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    padding: '0 .7rem',
    border: '1px solid rgba(77,215,255,.22)',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.08)',
    fontSize: '.64rem',
    cursor: 'pointer',
  },

  chipGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  chip: {
    minHeight: '2.2rem',
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

  styleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
  },

  styleButton: {
    minHeight: '2.65rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  activeStyle: {
    borderColor: 'rgba(124,92,255,.48)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  styleSwatch: {
    width: '1rem',
    height: '1rem',
    flexShrink: 0,
    borderRadius: '999px',
  },

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.7rem',
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

  applyButton: {
    minHeight: '2.45rem',
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

  previewFrame: {
    position: 'relative',
    minHeight: '16rem',
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

  previewPlaceholder: {
    display: 'grid',
    justifyItems: 'center',
    gap: '.5rem',
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  previewOverlay: {
    position: 'absolute',
    right: '.8rem',
    bottom: '.7rem',
    left: '.8rem',
    zIndex: 1,
    display: 'grid',
    gap: '.2rem',
    color: '#fff',
    textShadow: '0 2px 12px rgba(0,0,0,.7)',
  },

  previewOverlaySpan: {
    color: '#cbd6ec',
    fontSize: '.62rem',
  },

  metadataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  metadataGridSpan: {
    display: 'grid',
    gap: '.18rem',
    color: '#91a0bc',
    fontSize: '.58rem',
    textAlign: 'center',
  },

  metadataGridStrong: {
    color: '#fff',
    fontSize: '.78rem',
  },

  optionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.65rem',
  },

  captionPreview: {
    margin: '.65rem 0 0',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.64rem',
    lineHeight: 1.45,
  },

  footerActions: {
    display: 'flex',
    gap: '.45rem',
  },
};