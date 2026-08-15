import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Check,
  ChevronDown,
  Eye,
  Moon,
  Palette,
  RotateCcw,
  Sparkles,
  Sun,
  UserRound,
  Wand2,
  X,
  Zap,
} from 'lucide-react';

const DEFAULT_ENHANCEMENT = Object.freeze({
  presetId: null,
  presetName: 'Custom AI Enhancement',
  exposure: 0,
  contrast: 0,
  saturation: 0,
  vibrance: 0,
  warmth: 0,
  tint: 0,
  clarity: 0,
  sharpness: 0,
  noiseReduction: 0,
  skinSmoothing: 0,
  eyeEnhancement: 0,
  eyeBrightness: 0,
  teethWhitening: 0,
  portraitLighting: 0,
  backgroundBlur: 0,
  skyEnhancement: 0,
  cinematicGrade: null,
  aiConfidence: 0.85,
});

const PRESETS = [
  {
    id: 'instagram-clean',
    name: 'Instagram Clean',
    icon: Sparkles,
    values: {
      exposure: 6,
      contrast: 5,
      saturation: 4,
      vibrance: 8,
      clarity: 8,
      sharpness: 6,
    },
  },
  {
    id: 'snapchat-glow',
    name: 'Snapchat Glow',
    icon: Wand2,
    values: {
      exposure: 8,
      warmth: 12,
      saturation: 8,
      vibrance: 12,
      portraitLighting: 10,
      cinematicGrade: 'soft-glow',
    },
  },
  {
    id: 'tiktok-vivid',
    name: 'TikTok Vivid',
    icon: Zap,
    values: {
      contrast: 12,
      saturation: 18,
      vibrance: 24,
      clarity: 12,
      sharpness: 10,
    },
  },
  {
    id: 'cinematic-travel',
    name: 'Cinematic Travel',
    icon: Sun,
    values: {
      exposure: 4,
      contrast: 14,
      warmth: 10,
      clarity: 16,
      sharpness: 8,
      cinematicGrade: 'travel-cinematic',
    },
  },
  {
    id: 'moody-night',
    name: 'Moody Night',
    icon: Moon,
    values: {
      exposure: 4,
      contrast: 18,
      saturation: -8,
      shadows: 18,
      noiseReduction: 24,
      cinematicGrade: 'moody',
    },
  },
  {
    id: 'luxury-portrait',
    name: 'Luxury Portrait',
    icon: UserRound,
    values: {
      exposure: 5,
      contrast: 4,
      warmth: 8,
      skinSmoothing: 14,
      eyeEnhancement: 12,
      portraitLighting: 18,
      backgroundBlur: 20,
      cinematicGrade: 'luxury',
    },
  },
  {
    id: 'soft-aesthetic',
    name: 'Soft Aesthetic',
    icon: Palette,
    values: {
      exposure: 6,
      contrast: -8,
      saturation: -4,
      warmth: 8,
      skinSmoothing: 8,
      cinematicGrade: 'soft',
    },
  },
  {
    id: 'gaming-neon',
    name: 'Gaming Neon',
    icon: Zap,
    values: {
      contrast: 18,
      saturation: 24,
      vibrance: 30,
      clarity: 20,
      sharpness: 16,
      cinematicGrade: 'neon-night',
    },
  },
  {
    id: 'documentary',
    name: 'Documentary',
    icon: Eye,
    values: {
      contrast: 10,
      saturation: -8,
      clarity: 20,
      sharpness: 12,
      noiseReduction: 8,
      cinematicGrade: 'documentary',
    },
  },
  {
    id: 'vintage-film',
    name: 'Vintage Film',
    icon: Palette,
    values: {
      contrast: -4,
      saturation: -6,
      warmth: 22,
      tint: -4,
      cinematicGrade: 'vintage-film',
    },
  },
  {
    id: 'creator-pro',
    name: 'Creator Pro',
    icon: Wand2,
    values: {
      exposure: 5,
      contrast: 8,
      saturation: 6,
      vibrance: 14,
      clarity: 14,
      sharpness: 12,
      noiseReduction: 8,
    },
  },
];

const SUGGESTIONS = [
  ['Improve lighting', 'exposure', 8, Sun],
  ['Enhance portrait', 'skinSmoothing', 12, UserRound],
  ['Recover shadows', 'noiseReduction', 16, Moon],
  ['Boost sunset colors', 'warmth', 18, Sun],
  ['Add cinematic depth', 'cinematicGrade', 'travel-cinematic', Sparkles],
  ['Sharpen subject', 'sharpness', 14, Wand2],
  ['Reduce noise', 'noiseReduction', 24, Moon],
  ['Increase clarity', 'clarity', 18, Eye],
];

function normalizeValues(values = {}) {
  return {
    ...DEFAULT_ENHANCEMENT,
    ...values,
  };
}

export default function StoryAIEnhancePanel({
  visible = false,
  media = null,
  currentAdjustments = {},
  onApplyPreset,
  onApplyEnhancement,
  onPreview,
  onClose,
  onReset,
}) {
  const [values, setValues] = useState(() =>
    normalizeValues(currentAdjustments)
  );
  const [activeSection, setActiveSection] =
    useState('one-tap');
  const [processing, setProcessing] =
    useState(false);
  const [previewMode, setPreviewMode] =
    useState('after');
  const [previewing, setPreviewing] =
    useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setValues(normalizeValues(currentAdjustments));
  }, [currentAdjustments]);

  useEffect(() => {
    if (!visible) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }

      if (event.key === 'Enter' && event.metaKey) {
        onApplyEnhancement?.(values);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [onApplyEnhancement, onClose, values, visible]);

  const metadata = useMemo(
    () => ({
      ...normalizeValues(values),
      mediaType:
        media?.type ||
        media?.mediaType ||
        media?.media_type ||
        null,
      source: 'aarush-ai-enhancement-studio',
      aiReady: false,
      generatedAt: new Date().toISOString(),
    }),
    [media, values]
  );

  const updateValue = useCallback((key, value) => {
    setValues((current) => ({
      ...current,
      [key]: value,
      presetId: null,
      presetName: 'Custom AI Enhancement',
    }));
  }, []);

  const applyPreset = useCallback(
    (preset) => {
      const next = normalizeValues({
        ...DEFAULT_ENHANCEMENT,
        ...preset.values,
        presetId: preset.id,
        presetName: preset.name,
        aiConfidence: 0.9,
      });

      setValues(next);
      onApplyPreset?.(next);
      onPreview?.(next);
      setNotice(`${preset.name} prepared.`);
    },
    [onApplyPreset, onPreview]
  );

  const enhanceOnce = useCallback(async () => {
    setProcessing(true);
    setNotice('');

    const next = normalizeValues({
      ...values,
      presetId: 'one-tap-enhance',
      presetName: 'One-Tap Enhance',
      exposure: Math.max(values.exposure, 6),
      contrast: Math.max(values.contrast, 7),
      saturation: Math.max(values.saturation, 4),
      vibrance: Math.max(values.vibrance, 10),
      clarity: Math.max(values.clarity, 10),
      sharpness: Math.max(values.sharpness, 8),
      noiseReduction: Math.max(
        values.noiseReduction,
        10
      ),
      aiConfidence: 0.94,
    });

    await new Promise((resolve) =>
      window.setTimeout(resolve, 420)
    );

    setValues(next);
    setProcessing(false);
    onApplyEnhancement?.(next);
    onPreview?.(next);
    setNotice('AI enhancement prepared.');
  }, [onApplyEnhancement, onPreview, values]);

  const applySuggestion = useCallback(
    (suggestion) => {
      const [, key, suggestionValue] = suggestion;

      updateValue(key, suggestionValue);
      onPreview?.({
        ...values,
        [key]: suggestionValue,
        presetId: null,
        presetName: 'AI Suggestion',
      });
      setNotice(`${suggestion[0]} prepared.`);
    },
    [onPreview, updateValue, values]
  );

  const reset = useCallback(() => {
    const next = normalizeValues(
      currentAdjustments
    );

    setValues(next);
    setNotice('AI adjustments reset.');
    onReset?.();
    onPreview?.(next);
  }, [currentAdjustments, onPreview, onReset]);

  const togglePreview = useCallback(() => {
    const nextMode =
      previewMode === 'after' ? 'before' : 'after';

    setPreviewMode(nextMode);
    onPreview?.(
      nextMode === 'before'
        ? normalizeValues({})
        : metadata
    );
  }, [metadata, onPreview, previewMode]);

  const sections = [
    ['one-tap', 'One-Tap Enhance', Sparkles],
    ['portrait', 'Portrait AI', UserRound],
    ['night', 'Night AI', Moon],
    ['cinematic', 'Cinematic AI', FilmIcon],
    ['color', 'Color AI', Palette],
    ['background', 'Background AI', LayersIcon],
    ['sky', 'Sky AI', Sun],
    ['suggestions', 'AI Suggestions', Wand2],
  ];

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aarush AI enhancement studio"
      style={styles.backdrop}
    >
      <section style={styles.panel}>
        <header style={styles.header}>
          <div>
            <strong style={styles.title}>
              AI Enhancement Studio
            </strong>
            <span style={styles.subtitle}>
              Natural creator-grade improvements
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI enhancement studio"
            style={styles.closeButton}
          >
            <X size={18} />
          </button>
        </header>

        <div style={styles.previewBar}>
          <div style={styles.previewInfo}>
            <Sparkles size={16} />
            <span>
              {previewMode === 'before'
                ? 'Original preview'
                : 'Enhanced preview'}
            </span>
          </div>

          <button
            type="button"
            onClick={togglePreview}
            aria-pressed={previewMode === 'after'}
            style={styles.previewButton}
          >
            {previewMode === 'after' ? 'Before' : 'After'}
          </button>
        </div>

        <div style={styles.sectionList}>
          {sections.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveSection(id)}
              aria-pressed={activeSection === id}
              style={{
                ...styles.sectionButton,
                ...(activeSection === id
                  ? styles.activeSectionButton
                  : {}),
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
              <ChevronDown
                size={14}
                style={{
                  marginLeft: 'auto',
                  transform:
                    activeSection === id
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                }}
              />
            </button>
          ))}
        </div>

        {activeSection === 'one-tap' ? (
          <section style={styles.sectionContent}>
            <div style={styles.aiHero}>
              <span style={styles.aiOrb}>
                <Sparkles size={28} />
              </span>

              <div>
                <strong>One-Tap Enhance</strong>
                <p>
                  Balance exposure, white balance, contrast,
                  clarity, sharpness, and dynamic range.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={enhanceOnce}
              disabled={processing}
              style={styles.primaryButton}
            >
              {processing ? (
                <span style={styles.spinner} />
              ) : (
                <Wand2 size={18} />
              )}
              {processing
                ? 'Preparing enhancement…'
                : 'Enhance automatically'}
            </button>

            <div style={styles.metadataGrid}>
              <span>
                Exposure
                <strong>{values.exposure}</strong>
              </span>
              <span>
                Clarity
                <strong>{values.clarity}</strong>
              </span>
              <span>
                Sharpness
                <strong>{values.sharpness}</strong>
              </span>
              <span>
                Confidence
                <strong>
                  {Math.round(
                    values.aiConfidence * 100
                  )}
                  %
                </strong>
              </span>
            </div>
          </section>
        ) : null}

        {activeSection === 'portrait' ? (
          <section style={styles.sectionContent}>
            <div style={styles.sectionIntro}>
              <UserRound size={20} />
              <span>
                Natural portrait refinement foundation.
              </span>
            </div>

            <EnhancementSlider
              label="Face enhancement"
              value={values.skinSmoothing}
              onChange={(value) =>
                updateValue('skinSmoothing', value)
              }
            />

            <EnhancementSlider
              label="Skin smoothing"
              value={values.skinSmoothing}
              onChange={(value) =>
                updateValue('skinSmoothing', value)
              }
            />

            <EnhancementSlider
              label="Eye brightness"
              value={values.eyeBrightness}
              onChange={(value) =>
                updateValue('eyeBrightness', value)
              }
            />

            <EnhancementSlider
              label="Eye enhancement"
              value={values.eyeEnhancement}
              onChange={(value) =>
                updateValue('eyeEnhancement', value)
              }
            />

            <EnhancementSlider
              label="Teeth whitening"
              value={values.teethWhitening}
              onChange={(value) =>
                updateValue('teethWhitening', value)
              }
            />

            <EnhancementSlider
              label="Portrait lighting"
              value={values.portraitLighting}
              onChange={(value) =>
                updateValue('portraitLighting', value)
              }
            />
          </section>
        ) : null}

        {activeSection === 'night' ? (
          <section style={styles.sectionContent}>
            <div style={styles.sectionIntro}>
              <Moon size={20} />
              <span>
                Recover detail while preserving natural colors.
              </span>
            </div>

            {[
              ['Low-light boost', 'exposure'],
              ['Noise reduction', 'noiseReduction'],
              ['Shadow recovery', 'shadows'],
              ['Color preservation', 'saturation'],
              ['Detail recovery', 'sharpness'],
              ['Clarity enhancement', 'clarity'],
            ].map(([label, key]) => (
              <EnhancementSlider
                key={key}
                label={label}
                value={values[key] || 0}
                onChange={(value) =>
                  updateValue(key, value)
                }
              />
            ))}
          </section>
        ) : null}

        {activeSection === 'cinematic' ? (
          <section style={styles.sectionContent}>
            <div style={styles.presetGrid}>
              {[
                'Film look',
                'Teal & Orange',
                'Moody',
                'Luxury',
                'Documentary',
                'Vintage film',
                'Noir',
                'Neon night',
                'Travel cinematic',
                'Portrait cinematic',
              ].map((label) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => {
                    updateValue(
                      'cinematicGrade',
                      label
                    );
                    setNotice(
                      `${label} grade prepared.`
                    );
                  }}
                  style={styles.presetButton}
                >
                  <Sparkles size={15} />
                  {label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'color' ? (
          <section style={styles.sectionContent}>
            <div style={styles.aiCards}>
              {[
                ['Auto white balance', 'warmth'],
                ['Skin tone correction', 'tint'],
                ['Vibrance optimization', 'vibrance'],
                ['Color harmony', 'saturation'],
                ['Temperature correction', 'warmth'],
                ['Tint correction', 'tint'],
              ].map(([label, key]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => {
                    updateValue(key, 12);
                    setNotice(`${label} prepared.`);
                  }}
                  style={styles.aiCard}
                >
                  <Palette size={17} />
                  <span>{label}</span>
                  <Check size={14} />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'background' ? (
          <section style={styles.sectionContent}>
            <div style={styles.aiCards}>
              {[
                'Background blur',
                'Subject separation',
                'Background replacement',
                'Depth estimation',
                'Portrait cutout',
                'Object cleanup',
                'Remove unwanted object',
                'Remove person',
                'Remove text',
                'Remove wires',
                'Remove blemishes',
                'Remove dust',
              ].map((label) => (
                <button
                  type="button"
                  key={label}
                  onClick={() =>
                    setNotice(
                      `${label} foundation prepared.`
                    )
                  }
                  style={styles.aiCard}
                >
                  <Wand2 size={17} />
                  <span>{label}</span>
                  <Check size={14} />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'sky' ? (
          <section style={styles.sectionContent}>
            <div style={styles.presetGrid}>
              {[
                'Sky enhancement',
                'Sunset enhancement',
                'Blue sky recovery',
                'Dramatic clouds',
                'Golden hour boost',
                'Aurora foundation',
                'Night sky enhancement',
              ].map((label) => (
                <button
                  type="button"
                  key={label}
                  onClick={() =>
                    setNotice(
                      `${label} foundation prepared.`
                    )
                  }
                  style={styles.presetButton}
                >
                  <Sun size={15} />
                  {label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'suggestions' ? (
          <section style={styles.sectionContent}>
            <div style={styles.sectionIntro}>
              <Wand2 size={20} />
              <span>
                Suggestions are prepared from media metadata
                and can be connected to AI models later.
              </span>
            </div>

            <div style={styles.suggestionList}>
              {[
                ['Improve lighting', 'exposure', 8],
                ['Enhance portrait', 'skinSmoothing', 12],
                ['Recover shadows', 'shadows', 16],
                ['Boost sunset colors', 'warmth', 18],
                ['Add cinematic depth', 'clarity', 16],
                ['Sharpen subject', 'sharpness', 14],
                ['Reduce noise', 'noiseReduction', 20],
                ['Increase clarity', 'clarity', 18],
              ].map(([label, key, value]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => {
                    updateValue(key, value);
                    onPreview?.({
                      ...metadata,
                      [key]: value,
                    });
                  }}
                  style={styles.suggestion}
                >
                  <Sparkles size={15} />
                  <span>{label}</span>
                  <ChevronDown
                    size={14}
                    style={{
                      marginLeft: 'auto',
                      transform: 'rotate(-90deg)',
                    }}
                  />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section style={styles.presetSection}>
          <div style={styles.presetHeader}>
            <strong>Creator Presets</strong>
            <span>One-tap profiles</span>
          </div>

          <div style={styles.presetGrid}>
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const active =
                values.presetId === preset.id;

              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  style={{
                    ...styles.presetButton,
                    ...(active
                      ? styles.activePreset
                      : {}),
                  }}
                >
                  <Icon size={15} />
                  {preset.name}
                  {active ? (
                    <Check size={13} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={reset}
            style={styles.resetButton}
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            type="button"
            onClick={() => {
              onApplyEnhancement?.(metadata);
              onPreview?.(metadata);
              setNotice('Enhancement applied.');
            }}
            style={styles.applyButton}
          >
            <Check size={16} />
            Apply Enhancement
          </button>
        </div>

        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}
      </section>

      <style>{`
        @keyframes aarush-ai-slide-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-ai-glow {
          0%, 100% {
            box-shadow: 0 0 16px rgba(124,92,255,.16);
          }
          50% {
            box-shadow: 0 0 28px rgba(77,215,255,.28);
          }
        }

        @keyframes aarush-ai-spin {
          to { transform: rotate(360deg); }
        }

        .aarush-ai-panel button:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .aarush-ai-preset-grid {
            grid-template-columns: repeat(2, 1fr) !important;
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

function EnhancementSlider({
  label,
  value,
  onChange,
}) {
  return (
    <label style={styles.sliderRow}>
      <span>{label}</span>
      <input
        type="range"
        min="-100"
        max="100"
        value={Number(value) || 0}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
      />
      <output>{Math.round(Number(value) || 0)}</output>
    </label>
  );
}

function FilmIcon(props) {
  return <Sparkles {...props} />;
}

function LayersIcon(props) {
  return <Wand2 {...props} />;
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
    width: 'min(100%, 650px)',
    maxHeight: '88vh',
    overflowY: 'auto',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.32)',
    borderRadius: '1.4rem',
    color: '#f4f7ff',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 75px rgba(0,0,0,.52)',
    animation: 'aarush-ai-slide-up 230ms ease both',
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

  previewBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginTop: '.8rem',
    padding: '.65rem',
    border: '1px solid rgba(77,215,255,.16)',
    borderRadius: '.8rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.07)',
  },

  previewInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    fontSize: '.65rem',
  },

  previewButton: {
    minHeight: '2rem',
    padding: '0 .6rem',
    border: '1px solid rgba(77,215,255,.25)',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  sectionList: {
    display: 'grid',
    gap: '.35rem',
    marginTop: '.8rem',
  },

  sectionButton: {
    minHeight: '2.45rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#b7c3d9',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.68rem',
    fontWeight: 750,
    cursor: 'pointer',
  },

  activeSectionButton: {
    borderColor: 'rgba(124,92,255,.4)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.2),rgba(77,215,255,.08))',
  },

  sectionContent: {
    display: 'grid',
    gap: '.65rem',
    marginTop: '.65rem',
    padding: '.8rem',
    border: '1px solid rgba(124,92,255,.18)',
    borderRadius: '1rem',
    background: 'rgba(124,92,255,.055)',
  },

  aiHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.7rem',
  },

  aiOrb: {
    width: '3.3rem',
    height: '3.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    boxShadow: '0 0 28px rgba(124,92,255,.3)',
    animation: 'aarush-ai-glow 2s ease-in-out infinite',
  },

  aiHeroP: {
    margin: '.25rem 0 0',
    color: '#91a0bc',
    fontSize: '.65rem',
    lineHeight: 1.45,
  },

  primaryButton: {
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
    width: '1rem',
    height: '1rem',
    border: '2px solid rgba(255,255,255,.28)',
    borderTopColor: '#fff',
    borderRadius: '999px',
    animation: 'aarush-ai-spin 700ms linear infinite',
  },

  metadataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
  },

  metadataGridSpan: {
    display: 'grid',
    gap: '.2rem',
    color: '#91a0bc',
    fontSize: '.58rem',
    textAlign: 'center',
  },

  metadataGridStrong: {
    color: '#fff',
    fontSize: '.8rem',
  },

  sectionIntro: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    color: '#c9f9ff',
    fontSize: '.65rem',
    lineHeight: 1.45,
  },

  sliderRow: {
    display: 'grid',
    gridTemplateColumns: '7.4rem 1fr 2.4rem',
    alignItems: 'center',
    gap: '.5rem',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  sliderRowInput: {
    width: '100%',
    accentColor: '#7c5cff',
  },

  sliderRowOutput: {
    color: '#9deeff',
    textAlign: 'right',
  },

  presetSection: {
    marginTop: '.8rem',
    paddingTop: '.8rem',
    borderTop: '1px solid rgba(255,255,255,.08)',
  },

  presetHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: '.55rem',
  },

  presetHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
  },

  presetButton: {
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activePreset: {
    borderColor: 'rgba(124,92,255,.5)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.24),rgba(77,215,255,.1))',
  },

  aiCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  aiCard: {
    minHeight: '2.55rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  aiCardSpan: {
    flex: 1,
  },

  suggestionList: {
    display: 'grid',
    gap: '.35rem',
  },

  suggestion: {
    minHeight: '2.45rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.65rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  footer: {
    display: 'flex',
    gap: '.45rem',
    marginTop: '.85rem',
  },

  resetButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    flex: '0 0 6rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.68rem',
    cursor: 'pointer',
  },

  applyButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    flex: 1,
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.7rem',
    fontWeight: 850,
    cursor: 'pointer',
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