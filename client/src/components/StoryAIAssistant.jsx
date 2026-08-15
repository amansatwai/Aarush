import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CalendarClock,
  Check,
  ChevronDown,
  Clock3,
  Hash,
  Lightbulb,
  Music,
  RefreshCw,
  Send,
  Sparkles,
  Subtitles,
  Translate,
  Wand2,
  X,
} from 'lucide-react';

const SECTIONS = [
  ['caption', 'AI Caption', Sparkles],
  ['hashtags', 'AI Hashtags', Hash],
  ['music', 'AI Music', Music],
  ['posting', 'AI Posting Time', CalendarClock],
  ['ideas', 'AI Story Ideas', Lightbulb],
  ['rewrite', 'AI Rewrite', Wand2],
  ['translation', 'AI Translation', Translate],
  ['cta', 'AI CTA', Send],
  ['optimization', 'AI Optimization', Check],
];

const CAPTION_STYLES = [
  ['Short', 'A little moment worth keeping ✨'],
  ['Casual', 'Just here, making memories.'],
  ['Funny', 'No context, just vibes.'],
  ['Romantic', 'Some moments feel like forever.'],
  ['Motivational', 'Small steps. Big energy.'],
  ['Travel', 'Collecting places, not things.'],
  ['Aesthetic', 'Soft light and slower moments.'],
  ['Cinematic', 'Every frame tells a story.'],
  ['Luxury', 'Quietly becoming the best version.'],
  ['Creator', 'Behind the frame, inside the moment.'],
  ['Minimal', 'This moment.'],
  ['Viral', 'You had to be there for this one.'],
];

const IDEA_TYPES = [
  'Travel',
  'Food',
  'Workout',
  'Study',
  'Night drive',
  'Sunset',
  'Coffee',
  'Gaming',
  'Celebration',
  'Behind the scenes',
  'Product showcase',
  'Daily vlog',
];

const CTA_OPTIONS = [
  'Reply to this story',
  'Guess where I am',
  'Tap for more',
  'Vote in the poll',
  'Send this to a friend',
  'What do you think?',
  'Rate this',
];

const SONGS = [
  {
    id: 'ai-neon-city',
    title: 'Neon City',
    artist: 'Aarush Sounds',
    album: 'Midnight Motion',
    duration: 31,
    genre: 'Electronic',
    mood: 'Night',
    audioUrl: '',
  },
  {
    id: 'ai-blue-hour',
    title: 'Blue Hour',
    artist: 'Aarush Sounds',
    album: 'Cinematic',
    duration: 36,
    genre: 'Cinematic',
    mood: 'Travel',
    audioUrl: '',
  },
  {
    id: 'ai-afterglow',
    title: 'Afterglow',
    artist: 'Nova Lane',
    album: 'Electric Skies',
    duration: 28,
    genre: 'Pop',
    mood: 'Emotional',
    audioUrl: '',
  },
];

function mediaType(media) {
  return (
    media?.type ||
    media?.mediaType ||
    media?.media_type ||
    'image'
  );
}

function normalizeHashtags(value) {
  if (Array.isArray(value)) return value;

  return String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((item) =>
      item.startsWith('#') ? item : `#${item}`
    );
}

function buildCaption(style, inputCaption, location) {
  const base = style[1];

  if (inputCaption?.trim()) {
    return `${inputCaption.trim()} · ${base}`;
  }

  if (location) {
    return `${base} ${location} ✨`;
  }

  return base;
}

function buildHashtags(media, location) {
  const type = mediaType(media);
  const base =
    type === 'video'
      ? ['#AarushStories', '#StoryTime', '#VideoStory']
      : ['#AarushStories', '#PhotoDump', '#DailyMoment'];

  if (location) {
    base.push(
      `#${String(location).replace(
        /[^a-zA-Z0-9]/g,
        ''
      )}`
    );
  }

  return [
    ...base,
    '#GoodVibes',
    '#CreatorLife',
    '#Memories',
  ];
}

export default function StoryAIAssistant({
  visible = false,
  media = null,
  caption = '',
  hashtags = [],
  location = '',
  selectedSong = null,
  audience = null,
  analytics = null,
  onApplyCaption,
  onApplyHashtags,
  onApplySong,
  onApplyPostingTime,
  onClose,
}) {
  const [section, setSection] =
    useState('caption');
  const [captionStyle, setCaptionStyle] =
    useState('Short');
  const [generatedCaption, setGeneratedCaption] =
    useState('');
  const [generatedHashtags, setGeneratedHashtags] =
    useState([]);
  const [rewriteTone, setRewriteTone] =
    useState('More engaging');
  const [translationLanguage, setTranslationLanguage] =
    useState('Hinglish');
  const [selectedIdea, setSelectedIdea] =
    useState('Travel');
  const [selectedCta, setSelectedCta] =
    useState(CTA_OPTIONS[0]);
  const [generating, setGenerating] =
    useState(false);
  const [notice, setNotice] = useState('');
  const [history, setHistory] = useState([]);

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  }, []);

  const currentHashtags = useMemo(
    () =>
      generatedHashtags.length
        ? generatedHashtags
        : normalizeHashtags(hashtags),
    [generatedHashtags, hashtags]
  );

  const generateCaption = useCallback(() => {
    const style =
      CAPTION_STYLES.find(
        ([name]) => name === captionStyle
      ) || CAPTION_STYLES[0];

    const result = buildCaption(
      style,
      caption,
      location
    );

    setGeneratedCaption(result);
    setHistory((current) => [
      {
        type: 'caption',
        value: result,
        createdAt: Date.now(),
      },
      ...current,
    ].slice(0, 12));
  }, [caption, captionStyle, location]);

  const generateHashtags = useCallback(() => {
    const result = buildHashtags(media, location);

    setGeneratedHashtags(result);
    setHistory((current) => [
      {
        type: 'hashtags',
        value: result.join(' '),
        createdAt: Date.now(),
      },
      ...current,
    ].slice(0, 12));
  }, [location, media]);

  const generate = useCallback(async () => {
    setGenerating(true);

    await new Promise((resolve) =>
      window.setTimeout(resolve, 300)
    );

    if (section === 'caption') {
      generateCaption();
    }

    if (section === 'hashtags') {
      generateHashtags();
    }

    if (section === 'ideas') {
      setNotice(`${selectedIdea} idea prepared.`);
    }

    if (section === 'rewrite') {
      setGeneratedCaption(
        `${caption || 'Your story'} — ${rewriteTone.toLowerCase()}`
      );
    }

    if (section === 'translation') {
      setGeneratedCaption(
        caption
          ? `${caption} · ${translationLanguage}`
          : `Translation foundation · ${translationLanguage}`
      );
    }

    setGenerating(false);
  }, [
    caption,
    generateCaption,
    generateHashtags,
    rewriteTone,
    section,
    selectedIdea,
    translationLanguage,
  ]);

  const applyCaption = useCallback(() => {
    if (!generatedCaption) {
      generateCaption();
      return;
    }

    onApplyCaption?.(generatedCaption);
    showNotice('Caption applied.');
  }, [
    generateCaption,
    generatedCaption,
    onApplyCaption,
    showNotice,
  ]);

  const applyHashtags = useCallback(() => {
    if (!generatedHashtags.length) {
      generateHashtags();
      return;
    }

    onApplyHashtags?.(generatedHashtags);
    showNotice('Hashtags applied.');
  }, [
    generateHashtags,
    generatedHashtags,
    onApplyHashtags,
    showNotice,
  ]);

  const postingRecommendation = useMemo(
    () => ({
      bestTimeToday: '8:00 PM',
      bestTimeThisWeek: 'Friday · 8:00 PM',
      audienceWindow: audience?.activeWindow || '7–10 PM',
      confidence: analytics ? 0.86 : 0.72,
    }),
    [analytics, audience]
  );

  const optimizationSuggestions = useMemo(
    () => [
      'Add music for better retention',
      'Increase brightness slightly',
      'Use a shorter caption',
      'Add a location sticker',
      'Add a poll sticker',
      'Post around 8 PM',
      'Add a cinematic filter',
    ],
    []
  );

  const renderCaptionSection = () => (
    <section style={styles.contentSection}>
      <div style={styles.sectionIntro}>
        <Sparkles size={20} />
        <span>
          Generate captions that match your story mood and
          creator style.
        </span>
      </div>

      <div style={styles.chipGrid}>
        {CAPTION_STYLES.map(([name]) => (
          <button
            type="button"
            key={name}
            onClick={() => setCaptionStyle(name)}
            aria-pressed={captionStyle === name}
            style={{
              ...styles.chip,
              ...(captionStyle === name
                ? styles.activeChip
                : {}),
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {generatedCaption ? (
        <SuggestionCard
          title="Generated caption"
          value={generatedCaption}
          onApply={applyCaption}
          onRegenerate={generateCaption}
        />
      ) : null}

      <button
        type="button"
        onClick={generate}
        disabled={generating}
        style={styles.primaryButton}
      >
        {generating ? (
          <span style={styles.spinner} />
        ) : (
          <Wand2 size={17} />
        )}
        {generating ? 'Generating…' : 'Generate caption'}
      </button>
    </section>
  );

  const renderHashtagSection = () => (
    <section style={styles.contentSection}>
      <div style={styles.sectionIntro}>
        <Hash size={20} />
        <span>
          Build a balanced set of trending and niche
          hashtags.
        </span>
      </div>

      <div style={styles.chipGrid}>
        {[
          'Trending',
          'Niche',
          'Local',
          'Music',
          'Travel',
          'Fashion',
          'Fitness',
          'Tech',
          'Art',
          'Lifestyle',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={generateHashtags}
            style={styles.chip}
          >
            {label}
          </button>
        ))}
      </div>

      {currentHashtags.length ? (
        <SuggestionCard
          title="Suggested hashtags"
          value={currentHashtags.join(' ')}
          onApply={applyHashtags}
          onRegenerate={generateHashtags}
        />
      ) : null}

      <button
        type="button"
        onClick={generateHashtags}
        disabled={generating}
        style={styles.primaryButton}
      >
        <Hash size={17} />
        Generate hashtags
      </button>
    </section>
  );

  const renderMusicSection = () => (
    <section style={styles.contentSection}>
      <div style={styles.sectionIntro}>
        <Music size={20} />
        <span>
          Recommendations based on mood, media type, and
          story duration.
        </span>
      </div>

      <div style={styles.songList}>
        {SONGS.map((song) => {
          const active =
            selectedSong?.id === song.id;

          return (
            <button
              type="button"
              key={song.id}
              onClick={() => {
                onApplySong?.({
                  ...song,
                  waveformData: [],
                });
                showNotice(`${song.title} selected.`);
              }}
              style={{
                ...styles.songCard,
                ...(active ? styles.activeSong : {}),
              }}
            >
              <span style={styles.songArt}>
                <Music size={17} />
              </span>

              <span style={styles.songCopy}>
                <strong>{song.title}</strong>
                <span>
                  {song.artist} · {song.genre} ·{' '}
                  {song.mood}
                </span>
              </span>

              {active ? <Check size={15} /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );

  const renderPostingSection = () => (
    <section style={styles.contentSection}>
      <div style={styles.recommendationCard}>
        <CalendarClock size={23} />
        <div>
          <strong>
            Best time today ·{' '}
            {postingRecommendation.bestTimeToday}
          </strong>
          <span>
            Audience active window:{' '}
            {postingRecommendation.audienceWindow}
          </span>
        </div>
        <span style={styles.confidence}>
          {Math.round(
            postingRecommendation.confidence * 100
          )}
          %
        </span>
      </div>

      <div style={styles.infoRows}>
        <span>
          Best this week
          <strong>
            {postingRecommendation.bestTimeThisWeek}
          </strong>
        </span>
        <span>
          Confidence
          <strong>
            {Math.round(
              postingRecommendation.confidence * 100
            )}
            %
          </strong>
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          onApplyPostingTime?.(
            postingRecommendation
          );
          showNotice('Posting time applied.');
        }}
        style={styles.primaryButton}
      >
        <Check size={16} />
        Use recommendation
      </button>
    </section>
  );

  const renderIdeasSection = () => (
    <section style={styles.contentSection}>
      <div style={styles.chipGrid}>
        {IDEA_TYPES.map((idea) => (
          <button
            type="button"
            key={idea}
            onClick={() => setSelectedIdea(idea)}
            aria-pressed={selectedIdea === idea}
            style={{
              ...styles.chip,
              ...(selectedIdea === idea
                ? styles.activeChip
                : {}),
            }}
          >
            {idea}
          </button>
        ))}
      </div>

      <SuggestionCard
        title={`${selectedIdea} story idea`}
        value={`Create a ${selectedIdea.toLowerCase()} story with a strong opening frame, one behind-the-scenes moment, and a simple audience question.`}
        onApply={() =>
          showNotice('Story idea saved.')
        }
        onRegenerate={generate}
      />
    </section>
  );

  const renderRewriteSection = () => (
    <section style={styles.contentSection}>
      <select
        value={rewriteTone}
        onChange={(event) =>
          setRewriteTone(event.target.value)
        }
        style={styles.select}
        aria-label="Rewrite tone"
      >
        {[
          'More engaging',
          'More viral',
          'More emotional',
          'More professional',
          'More humorous',
          'More aesthetic',
          'More luxurious',
          'More minimal',
        ].map((tone) => (
          <option key={tone}>{tone}</option>
        ))}
      </select>

      {generatedCaption ? (
        <SuggestionCard
          title={rewriteTone}
          value={generatedCaption}
          onApply={applyCaption}
          onRegenerate={generate}
        />
      ) : null}

      <button
        type="button"
        onClick={generate}
        style={styles.primaryButton}
      >
        <Wand2 size={17} />
        Rewrite caption
      </button>
    </section>
  );

  const renderTranslationSection = () => (
    <section style={styles.contentSection}>
      <select
        value={translationLanguage}
        onChange={(event) =>
          setTranslationLanguage(event.target.value)
        }
        style={styles.select}
        aria-label="Translation language"
      >
        {[
          'English',
          'Hindi',
          'Hinglish',
          'Spanish',
          'French',
          'German',
          'Japanese',
          'Korean',
        ].map((language) => (
          <option key={language}>{language}</option>
        ))}
      </select>

      {generatedCaption ? (
        <SuggestionCard
          title={`Translation · ${translationLanguage}`}
          value={generatedCaption}
          onApply={applyCaption}
          onRegenerate={generate}
        />
      ) : null}

      <button
        type="button"
        onClick={generate}
        style={styles.primaryButton}
      >
        <Translate size={17} />
        Prepare translation
      </button>
    </section>
  );

  const renderCTASection = () => (
    <section style={styles.contentSection}>
      <div style={styles.suggestionList}>
        {CTA_OPTIONS.map((cta) => (
          <button
            type="button"
            key={cta}
            onClick={() => {
              setSelectedCta(cta);
              showNotice('CTA selected.');
            }}
            style={{
              ...styles.ctaButton,
              ...(selectedCta === cta
                ? styles.activeCTA
                : {}),
            }}
          >
            <Send size={15} />
            {cta}
            {selectedCta === cta ? (
              <Check size={14} />
            ) : null}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          onApplyCaption?.(
            `${caption || 'Your story'} · ${selectedCta}`
          )
        }
        style={styles.primaryButton}
      >
        <Check size={16} />
        Add CTA to caption
      </button>
    </section>
  );

  const renderOptimizationSection = () => (
    <section style={styles.contentSection}>
      <div style={styles.suggestionList}>
        {optimizationSuggestions.map((suggestion) => (
          <div key={suggestion} style={styles.optimization}>
            <Sparkles size={15} />
            <span>{suggestion}</span>
            <ChevronDown
              size={14}
              style={{
                marginLeft: 'auto',
                transform: 'rotate(-90deg)',
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );

  const renderSection = () => {
    if (section === 'caption') {
      return renderCaptionSection();
    }

    if (section === 'hashtags') {
      return renderHashtagSection();
    }

    if (section === 'music') {
      return renderMusicSection();
    }

    if (section === 'posting') {
      return renderPostingSection();
    }

    if (section === 'ideas') {
      return renderIdeasSection();
    }

    if (section === 'rewrite') {
      return renderRewriteSection();
    }

    if (section === 'translation') {
      return renderTranslationSection();
    }

    if (section === 'cta') {
      return renderCTASection();
    }

    return renderOptimizationSection();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aarush AI story assistant"
      style={styles.backdrop}
    >
      <section style={styles.panel}>
        <header style={styles.header}>
          <div>
            <strong style={styles.title}>
              AI Story Assistant
            </strong>
            <span style={styles.subtitle}>
              Create with more clarity and confidence
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI story assistant"
            style={styles.closeButton}
          >
            <X size={18} />
          </button>
        </header>

        <div style={styles.sectionTabs}>
          {SECTIONS.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setSection(id)}
              aria-pressed={section === id}
              style={{
                ...styles.sectionTab,
                ...(section === id
                  ? styles.activeSectionTab
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {renderSection()}

        <section style={styles.contextCard}>
          <span style={styles.contextIcon}>
            <Sparkles size={16} />
          </span>
          <div>
            <strong>Assistant context</strong>
            <span>
              {mediaType(media)} ·{' '}
              {location || 'No location'} ·{' '}
              {selectedSong?.title || 'No music selected'}
            </span>
          </div>
        </section>

        {history.length ? (
          <section style={styles.history}>
            <div style={styles.historyHeader}>
              <strong>Recent generations</strong>
              <span>{history.length}</span>
            </div>

            {history.slice(0, 3).map((item, index) => (
              <div
                key={`${item.createdAt}-${index}`}
                style={styles.historyItem}
              >
                <span>{item.type}</span>
                <small>{item.value}</small>
              </div>
            ))}
          </section>
        ) : null}

        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}
      </section>

      <style>{`
        @keyframes aarush-assistant-slide {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-assistant-spin {
          to { transform: rotate(360deg); }
        }

        .aarush-assistant-tab:hover,
        .aarush-assistant-card:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 520px) {
          .aarush-assistant-tabs {
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
    </div>
  );
}

function SuggestionCard({
  title,
  value,
  onApply,
  onRegenerate,
}) {
  return (
    <article style={styles.suggestionCard}>
      <div style={styles.suggestionHeader}>
        <div>
          <strong>{title}</strong>
          <span>AI suggestion foundation</span>
        </div>

        <span style={styles.confidence}>
          90%
        </span>
      </div>

      <p style={styles.suggestionText}>
        {value}
      </p>

      <div style={styles.suggestionActions}>
        <button
          type="button"
          onClick={onApply}
          style={styles.applySmall}
        >
          <Check size={14} />
          Apply
        </button>

        <button
          type="button"
          onClick={onRegenerate}
          style={styles.regenerateButton}
        >
          <RefreshCw size={14} />
          Regenerate
        </button>
      </div>
    </article>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1300,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '.8rem',
    background: 'rgba(2,5,10,.74)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  panel: {
    width: 'min(100%, 680px)',
    maxHeight: '88vh',
    overflowY: 'auto',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.4rem',
    color: '#f4f7ff',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 75px rgba(0,0,0,.52)',
    animation: 'aarush-assistant-slide 230ms ease both',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.7rem',
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
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.06)',
    cursor: 'pointer',
  },

  sectionTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.35rem',
    marginTop: '.8rem',
  },

  sectionTab: {
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
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 180ms ease',
  },

  activeSectionTab: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  contentSection: {
    display: 'grid',
    gap: '.65rem',
    marginTop: '.7rem',
    padding: '.8rem',
    border: '1px solid rgba(124,92,255,.18)',
    borderRadius: '1rem',
    background: 'rgba(124,92,255,.055)',
  },

  sectionIntro: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    color: '#c9f9ff',
    fontSize: '.65rem',
    lineHeight: 1.45,
  },

  chipGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  chip: {
    minHeight: '2.15rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.61rem',
    cursor: 'pointer',
  },

  activeChip: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  primaryButton: {
    minHeight: '2.75rem',
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
    width: '1rem',
    height: '1rem',
    border: '2px solid rgba(255,255,255,.28)',
    borderTopColor: '#fff',
    borderRadius: '999px',
    animation: 'aarush-assistant-spin 700ms linear infinite',
  },

  suggestionCard: {
    padding: '.75rem',
    border: '1px solid rgba(77,215,255,.2)',
    borderRadius: '.85rem',
    background:
      'linear-gradient(135deg,rgba(77,215,255,.08),rgba(124,92,255,.08))',
  },

  suggestionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
  },

  suggestionHeaderDiv: {
    display: 'grid',
    gap: '.18rem',
  },

  suggestionHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  confidence: {
    padding: '.25rem .4rem',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '.57rem',
    fontWeight: 800,
  },

  suggestionText: {
    margin: '.65rem 0',
    color: '#dce5f8',
    fontSize: '.72rem',
    lineHeight: 1.5,
  },

  suggestionActions: {
    display: 'flex',
    gap: '.35rem',
  },

  applySmall: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .6rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.62rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  regenerateButton: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  songList: {
    display: 'grid',
    gap: '.4rem',
  },

  songCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeSong: {
    borderColor: 'rgba(77,215,255,.45)',
    background: 'rgba(77,215,255,.08)',
  },

  songArt: {
    width: '2.5rem',
    height: '2.5rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  songCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  songCopySpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  recommendationCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
    padding: '.75rem',
    border: '1px solid rgba(130,233,193,.18)',
    borderRadius: '.8rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.07)',
  },

  recommendationCardDiv: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
    flex: 1,
  },

  recommendationCardSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  infoRows: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.45rem',
  },

  infoRowsSpan: {
    display: 'grid',
    gap: '.2rem',
    color: '#91a0bc',
    fontSize: '.6rem',
  },

  infoRowsStrong: {
    color: '#fff',
    fontSize: '.75rem',
  },

  select: {
    minHeight: '2.5rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.68rem',
  },

  ctaButton: {
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.65rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeCTA: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  optimization: {
    minHeight: '2.45rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .6rem',
    border: '1px solid rgba(124,92,255,.15)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.64rem',
  },

  contextCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    marginTop: '.75rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.8rem',
    background: 'rgba(255,255,255,.035)',
  },

  contextIcon: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  contextCardDiv: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
  },

  contextCardSpan: {
    overflow: 'hidden',
    color: '#91a0bc',
    fontSize: '.6rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  history: {
    display: 'grid',
    gap: '.35rem',
    marginTop: '.75rem',
    paddingTop: '.75rem',
    borderTop: '1px solid rgba(255,255,255,.08)',
  },

  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  historyItem: {
    display: 'flex',
    gap: '.4rem',
    padding: '.4rem',
    borderRadius: '.55rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.58rem',
  },

  historyItemSmall: {
    overflow: 'hidden',
    color: '#91a0bc',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    marginTop: '.65rem',
    padding: '.65rem',
    border: '1px solid rgba(130,233,193,.22)',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.64rem',
  },
};