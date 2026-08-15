import { useMemo, useState } from 'react';
import {
  AudioLines,
  BadgeCheck,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  FileText,
  Globe2,
  Languages,
  MessageCircle,
  Mic2,
  Play,
  Plus,
  Save,
  Search,
  Settings2,
  Sparkles,
  Subtitles,
  TextQuote,
  Volume2,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['live', 'Live Translation', Languages],
  ['languages', 'Languages', Globe2],
  ['localization', 'Localization', Sparkles],
  ['subtitles', 'Subtitles', Subtitles],
  ['captions', 'Captions', TextQuote],
  ['culture', 'Cultural Adaptation', Globe2],
  ['memory', 'Translation Memory', Save],
  ['preview', 'Global Preview', Play],
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Hinglish',
  'Urdu',
  'Bengali',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Malayalam',
  'Kannada',
  'Spanish',
  'French',
  'German',
  'Arabic',
  'Japanese',
  'Korean',
  'Portuguese',
  'Russian',
  'Indonesian',
  'Turkish',
];

const LOCALIZATION_ITEMS = [
  ['Story title', FileText],
  ['Story text', TextQuote],
  ['Text overlays', Sparkles],
  ['Stickers', BadgeCheck],
  ['Hashtags foundation', HashIcon],
  ['Location labels foundation', MapIcon],
  ['CTA buttons foundation', Zap],
];

function numeric(value) {
  return Number(value) || 0;
}

function normalizeLanguage(value) {
  if (typeof value === 'string') return value;
  return value?.name || value?.language || '';
}

function formatConfidence(value) {
  return `${Math.round(numeric(value) || 88)}%`;
}

function SectionTitle({ title, subtitle, icon: Icon, action }) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      {action || <Icon size={18} color="#4dd7ff" />}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color = '#4dd7ff',
}) {
  return (
    <article style={styles.metricCard}>
      <span
        style={{
          ...styles.metricIcon,
          color,
          background: `${color}18`,
        }}
      >
        <Icon size={17} />
      </span>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </article>
  );
}

export default function StoryRealtimeTranslationEngine({
  story = {},
  captions = {},
  subtitles = [],
  stickers = [],
  voiceTranscript = '',
  sourceLanguage = 'English',
  targetLanguages = [],
  translationSettings = {},
  onApplyTranslation,
  onExportTranslations,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('live');
  const [status, setStatus] = useState('Ready');
  const [progress, setProgress] = useState(0);
  const [selectedSource, setSelectedSource] =
    useState(sourceLanguage);
  const [selectedTargets, setSelectedTargets] =
    useState(() =>
      targetLanguages.length
        ? targetLanguages.map(normalizeLanguage)
        : ['Hindi', 'Japanese', 'Spanish']
    );
  const [captionMode, setCaptionMode] =
    useState('Direct translation');
  const [previewLanguage, setPreviewLanguage] =
    useState('English');
  const [tone, setTone] =
    useState('Natural');
  const [translationText, setTranslationText] =
    useState('');
  const [notice, setNotice] = useState('');

  const sourceText = useMemo(
    () =>
      translationText ||
      captions.text ||
      captions.caption ||
      story.text ||
      story.caption ||
      voiceTranscript ||
      'Your story translation preview will appear here.',
    [
      captions.caption,
      captions.text,
      story.caption,
      story.text,
      translationText,
      voiceTranscript,
    ]
  );

  const translatedCount = useMemo(
    () => selectedTargets.length,
    [selectedTargets]
  );

  const confidence = useMemo(
    () =>
      Math.min(
        99,
        Math.round(
          numeric(translationSettings.confidence) || 88
        )
      ),
    [translationSettings.confidence]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const toggleTarget = (language) => {
    setSelectedTargets((current) =>
      current.includes(language)
        ? current.filter((item) => item !== language)
        : [...current, language]
    );
  };

  const runTranslation = async () => {
    setStatus('Detecting Language');
    setProgress(18);

    const phases = [
      ['Translating', 48],
      ['Localizing', 76],
      ['Complete', 100],
    ];

    for (const [nextStatus, nextProgress] of phases) {
      await new Promise((resolve) =>
        window.setTimeout(resolve, 300)
      );
      setStatus(nextStatus);
      setProgress(nextProgress);
    }

    showNotice('Translation complete.');
  };

  const applyTranslation = () => {
    onApplyTranslation?.({
      sourceLanguage: selectedSource,
      targetLanguages: selectedTargets,
      sourceText,
      confidence,
      captionMode,
      tone,
      culturalAdaptation: true,
      preserveTiming: true,
      preserveSpeakerLabels: true,
      preserveKaraokeMetadata: true,
      preserveAnimations: true,
      preservePositions: true,
    });

    showNotice('Translation applied.');
  };

  const exportTranslations = () => {
    onExportTranslations?.({
      sourceLanguage: selectedSource,
      targetLanguages: selectedTargets,
      sourceText,
      confidence,
      captionMode,
      tone,
    });

    showNotice('Translation export prepared.');
  };

  const renderLive = () => (
    <>
      <section style={styles.translationHero}>
        <div style={styles.translationOrb}>
          <Languages size={31} />
        </div>
        <div style={styles.translationCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Aarush Realtime Translation
          </span>
          <h1>{status}</h1>
          <p>
            Translate captions, subtitles, voice transcripts,
            stickers, and story elements for global audiences.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Globe2 size={13} />
              {translatedCount} target languages
            </span>
            <span>
              <Sparkles size={13} />
              {confidence}% confidence
            </span>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Live Translation"
          subtitle="Translation progress and confidence."
          icon={Languages}
          action={
            <button
              type="button"
              onClick={runTranslation}
              style={styles.smallPrimary}
            >
              <Zap size={14} />
              Translate now
            </button>
          }
        />

        <div style={styles.progressTrack}>
          <span
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          />
        </div>

        <div style={styles.progressMeta}>
          <span>{status}</span>
          <strong>{progress}%</strong>
        </div>

        <div style={styles.metricGrid}>
          <MetricCard
            label="Source language"
            value={selectedSource}
            icon={Globe2}
            color="#4dd7ff"
          />
          <MetricCard
            label="Target languages"
            value={translatedCount}
            icon={Languages}
            color="#a895ff"
          />
          <MetricCard
            label="Confidence"
            value={`${confidence}%`}
            icon={Sparkles}
            color="#82e9c1"
          />
          <MetricCard
            label="Voice transcript"
            value={voiceTranscript ? 'Ready' : 'Foundation'}
            icon={Mic2}
            color="#ffd27d"
          />
        </div>
      </section>
    </>
  );

  const renderLanguages = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Language Selection"
        subtitle="Choose source and multiple target languages."
        icon={Globe2}
      />

      <label style={styles.field}>
        Source language
        <select
          value={selectedSource}
          onChange={(event) =>
            setSelectedSource(event.target.value)
          }
          style={styles.select}
        >
          {LANGUAGES.map((language) => (
            <option key={language}>{language}</option>
          ))}
        </select>
      </label>

      <div style={styles.targetHeader}>
        <span>Target languages</span>
        <strong>{selectedTargets.length} selected</strong>
      </div>

      <div style={styles.languageGrid}>
        {LANGUAGES.map((language) => {
          const selected = selectedTargets.includes(language);

          return (
            <button
              type="button"
              key={language}
              onClick={() => toggleTarget(language)}
              aria-pressed={selected}
              style={{
                ...styles.languageButton,
                ...(selected
                  ? styles.activeLanguageButton
                  : {}),
              }}
            >
              <Languages size={14} />
              <span>{language}</span>
              {selected ? <Check size={14} /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );

  const renderLocalization = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Story Localization"
        subtitle="Translate every story layer for each region."
        icon={Sparkles}
      />

      <div style={styles.localizationGrid}>
        {LOCALIZATION_ITEMS.map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} localization enabled.`)
            }
            style={styles.localizationButton}
          >
            <Icon size={16} />
            <span>{label}</span>
            <Check
              size={14}
              color="#82e9c1"
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>
    </section>
  );

  const renderSubtitles = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Subtitle Translation"
        subtitle="Preserve timing, speaker labels, and animation metadata."
        icon={Subtitles}
      />

      <div style={styles.preserveGrid}>
        {[
          'Preserve timing',
          'Preserve speaker labels',
          'Preserve karaoke metadata',
          'Preserve animations',
          'Preserve positions',
        ].map((item) => (
          <span key={item} style={styles.preserveChip}>
            <Check size={13} />
            {item}
          </span>
        ))}
      </div>

      <div style={styles.sourcePreview}>
        <Subtitles size={17} />
        <span>
          {subtitles.length
            ? `${subtitles.length} subtitle cues ready`
            : 'Subtitle timing foundation ready'}
        </span>
      </div>

      <button
        type="button"
        onClick={applyTranslation}
        style={styles.primaryButton}
      >
        <Subtitles size={16} />
        Prepare localized subtitles
      </button>
    </section>
  );

  const renderCaptions = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Caption Translation"
        subtitle="Adapt captions for different publishing goals."
        icon={TextQuote}
      />

      <div style={styles.modeGrid}>
        {[
          'Direct translation',
          'AI rewrite',
          'Short version',
          'Long version',
          'Viral version',
          'Platform-specific version',
        ].map((mode) => (
          <button
            type="button"
            key={mode}
            onClick={() => setCaptionMode(mode)}
            aria-pressed={captionMode === mode}
            style={{
              ...styles.modeButton,
              ...(captionMode === mode
                ? styles.activeModeButton
                : {}),
            }}
          >
            <TextQuote size={15} />
            {mode}
          </button>
        ))}
      </div>

      <label style={styles.field}>
        Caption source
        <textarea
          value={translationText}
          onChange={(event) =>
            setTranslationText(event.target.value)
          }
          placeholder="Enter a caption or voice transcript"
          style={styles.textarea}
        />
      </label>

      <button
        type="button"
        onClick={runTranslation}
        style={styles.primaryButton}
      >
        <Languages size={16} />
        Generate caption versions
      </button>
    </section>
  );

  const renderCulture = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Cultural Adaptation"
        subtitle="Tune language, references, tone, and calls to action."
        icon={Globe2}
      />

      <label style={styles.field}>
        Regional tone
        <select
          value={tone}
          onChange={(event) =>
            setTone(event.target.value)
          }
          style={styles.select}
        >
          <option>Natural</option>
          <option>Formal</option>
          <option>Informal</option>
          <option>Creator-native</option>
          <option>Brand-safe</option>
        </select>
      </label>

      <div style={styles.adaptationGrid}>
        {[
          'Regional slang',
          'Local expressions',
          'Cultural references',
          'Emoji adaptation',
          'CTA localization',
          'Date/time localization',
          'Currency localization foundation',
        ].map((item) => (
          <button
            type="button"
            key={item}
            onClick={() =>
              showNotice(`${item} enabled.`)
            }
            style={styles.adaptationButton}
          >
            <Sparkles size={15} />
            {item}
            <Check
              size={14}
              color="#82e9c1"
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>
    </section>
  );

  const renderMemory = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Translation Memory"
        subtitle="Reuse phrases, terminology, and creator glossary entries."
        icon={Save}
        action={
          <button
            type="button"
            onClick={() =>
              showNotice('Phrase saved to translation memory.')
            }
            style={styles.smallButton}
          >
            <Plus size={14} />
            Save phrase
          </button>
        }
      />

      <div style={styles.memoryList}>
        {[
          ['Frequently used phrases', 'Ready'],
          ['Saved translations', '12 entries'],
          ['Brand terminology', 'Foundation'],
          ['Creator terminology', '8 entries'],
          ['Custom glossary', 'Foundation'],
        ].map(([label, value]) => (
          <div key={label} style={styles.memoryRow}>
            <span style={styles.memoryIcon}>
              <Save size={15} />
            </span>
            <span>
              <strong>{label}</strong>
              <small>{value}</small>
            </span>
            <ChevronRight size={14} />
          </div>
        ))}
      </div>
    </section>
  );

  const renderPreview = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Global Preview"
        subtitle="Review how localized stories appear by language."
        icon={Play}
        action={
          <button
            type="button"
            onClick={exportTranslations}
            style={styles.smallPrimary}
          >
            <Copy size={14} />
            Export
          </button>
        }
      />

      <div style={styles.previewTabs}>
        {['English', 'Hindi', 'Japanese', 'Arabic', 'Korean', 'Spanish'].map(
          (language) => (
            <button
              type="button"
              key={language}
              onClick={() => setPreviewLanguage(language)}
              aria-pressed={previewLanguage === language}
              style={{
                ...styles.previewTab,
                ...(previewLanguage === language
                  ? styles.activePreviewTab
                  : {}),
              }}
            >
              {language}
            </button>
          )
        )}
      </div>

      <div style={styles.previewCard}>
        <div style={styles.previewTop}>
          <span>
            <Globe2 size={14} />
            {previewLanguage} preview
          </span>
          <span>
            <Sparkles size={13} />
            {confidence}% confidence
          </span>
        </div>
        <div style={styles.previewMedia}>
          {story?.previewUrl || story?.mediaUrl ? (
            <img
              src={story.previewUrl || story.mediaUrl}
              alt={`${previewLanguage} story preview`}
              loading="lazy"
              style={styles.previewImage}
            />
          ) : (
            <div style={styles.previewPlaceholder}>
              <Play size={28} />
              <span>Localized story preview foundation</span>
            </div>
          )}
        </div>
        <p style={styles.previewText}>
          {sourceText}
        </p>
        <div style={styles.previewFooter}>
          <span>
            {selectedSource} → {previewLanguage}
          </span>
          <span>{tone} tone</span>
        </div>
      </div>

      <button
        type="button"
        onClick={applyTranslation}
        style={styles.primaryButton}
      >
        <Check size={16} />
        Apply localized story
      </button>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'live') return renderLive();
    if (activeModule === 'languages') return renderLanguages();
    if (activeModule === 'localization') {
      return renderLocalization();
    }
    if (activeModule === 'subtitles') return renderSubtitles();
    if (activeModule === 'captions') return renderCaptions();
    if (activeModule === 'culture') return renderCulture();
    if (activeModule === 'memory') return renderMemory();
    if (activeModule === 'preview') return renderPreview();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close realtime translation engine"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Realtime Translation Engine</strong>
          <span>
            Publish every story in every language
          </span>
        </div>

        <button
          type="button"
          aria-label="Translation settings"
          style={styles.iconButton}
        >
          <Settings2 size={18} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <nav style={styles.moduleNav}>
          {MODULES.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveModule(id)}
              aria-pressed={activeModule === id}
              style={{
                ...styles.moduleButton,
                ...(activeModule === id
                  ? styles.activeModuleButton
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {renderModule()}
      </div>

      <style>{`
        @keyframes aarush-translation-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-translation-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.5);
          }
        }

        .aarush-translation-card:hover,
        .aarush-translation-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-translation-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-translation-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-translation-languages {
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

function HashIcon() {
  return (
    <span style={styles.customIcon}>
      #
    </span>
  );
}

function MapIcon() {
  return (
    <span style={styles.customIcon}>
      <Globe2 size={16} />
    </span>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.58),#07090e 68%)',
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
    width: 'min(100%, 1100px)',
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

  moduleNav: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    paddingBottom: '.2rem',
  },

  moduleButton: {
    minWidth: '5.9rem',
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.28rem',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeModuleButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  translationHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-translation-pulse 3s ease-in-out infinite',
  },

  translationOrb: {
    width: '4.8rem',
    height: '4.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(77,215,255,.4)',
    borderRadius: '1.2rem',
    color: '#c9f9ff',
    background:
      'radial-gradient(circle,#3d6d8a,#262257 70%)',
  },

  translationCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.25rem',
  },

  aiBadge: {
    width: 'fit-content',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.56rem',
    fontWeight: 800,
  },

  translationCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  translationCopyP: {
    maxWidth: '40rem',
    margin: 0,
    color: '#91a0bc',
    fontSize: '.63rem',
    lineHeight: 1.45,
  },

  heroMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.55rem',
    marginTop: '.25rem',
    color: '#9deeff',
    fontSize: '.57rem',
  },

  heroMetaSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-translation-in 240ms ease both',
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

  smallPrimary: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.59rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  smallButton: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  progressTrack: {
    height: '.45rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.09)',
  },

  progressFill: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
    transition: 'width 240ms ease',
  },

  progressMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '.35rem 0 .7rem',
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
  },

  metricCard: {
    minHeight: '6.4rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    background: 'rgba(15,19,30,.9)',
  },

  metricIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.6rem',
  },

  metricLabel: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  metricValue: {
    color: '#fff',
    fontSize: '.79rem',
  },

  targetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    margin: '.75rem 0 .5rem',
    color: '#aab6cf',
    fontSize: '.61rem',
  },

  targetHeaderStrong: {
    color: '#9deeff',
  },

  languageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
  },

  languageButton: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .45rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.65rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.56rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeLanguageButton: {
    borderColor: 'rgba(77,215,255,.38)',
    color: '#fff',
    background: 'rgba(77,215,255,.12)',
  },

  languageButtonSpan: {
    flex: 1,
  },

  localizationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  localizationButton: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  preserveGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  preserveChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    padding: '.35rem .45rem',
    borderRadius: '999px',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.54rem',
  },

  sourcePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.6rem',
  },

  modeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
  },

  modeButton: {
    minHeight: '2.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeModeButton: {
    borderColor: 'rgba(124,92,255,.4)',
    color: '#fff',
    background: 'rgba(124,92,255,.15)',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    marginTop: '.65rem',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  select: {
    minHeight: '2.4rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
  },

  textarea: {
    minHeight: '6rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    resize: 'vertical',
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.66rem',
    lineHeight: 1.45,
  },

  adaptationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  adaptationButton: {
    minHeight: '2.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.58rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  memoryList: {
    display: 'grid',
    gap: '.4rem',
  },

  memoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    minHeight: '2.7rem',
    padding: '.5rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
  },

  memoryIcon: {
    width: '2.15rem',
    height: '2.15rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.55rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  memoryRowSpan: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  memoryRowSmall: {
    color: '#91a0bc',
    fontSize: '.56rem',
  },

  previewTabs: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.45rem',
  },

  previewTab: {
    minHeight: '2.2rem',
    flexShrink: 0,
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  activePreviewTab: {
    borderColor: 'rgba(77,215,255,.35)',
    color: '#fff',
    background: 'rgba(77,215,255,.12)',
  },

  previewCard: {
    overflow: 'hidden',
    border: '1px solid rgba(124,92,255,.2)',
    borderRadius: '.9rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.1),rgba(77,215,255,.04))',
  },

  previewTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    padding: '.65rem',
    color: '#c9f9ff',
    fontSize: '.57rem',
  },

  previewTopSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
  },

  previewMedia: {
    minHeight: '15rem',
    display: 'grid',
    placeItems: 'center',
    background: '#10172a',
  },

  previewImage: {
    width: '100%',
    height: '15rem',
    objectFit: 'cover',
  },

  previewPlaceholder: {
    display: 'grid',
    placeItems: 'center',
    gap: '.35rem',
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  previewText: {
    margin: 0,
    padding: '.75rem',
    color: '#dce5f8',
    fontSize: '.66rem',
    lineHeight: 1.45,
  },

  previewFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    padding: '0 .75rem .7rem',
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    width: '100%',
    marginTop: '.7rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  customIcon: {
    display: 'grid',
    placeItems: 'center',
  },
};