import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Copy,
  Italic,
  Layers,
  Minus,
  Plus,
  RotateCw,
  Trash2,
  Type,
  Underline,
  X,
} from 'lucide-react';

const FONT_GROUPS = {
  Sans: ['Inter', 'Arial', 'Helvetica'],
  Serif: ['Georgia', 'Times New Roman', 'serif'],
  Display: ['Impact', 'Trebuchet MS', 'Arial Black'],
  Handwritten: ['cursive', 'Comic Sans MS'],
  Monospace: ['monospace', 'Courier New'],
  Bold: ['Arial Black', 'Impact'],
  Minimal: ['Inter', 'Helvetica'],
  Cinematic: ['Georgia', 'serif'],
  Neon: ['monospace', 'Courier New'],
  Luxury: ['Georgia', 'Times New Roman'],
  Retro: ['Trebuchet MS', 'Georgia'],
  Futuristic: ['monospace', 'Arial'],
};

const COLORS = [
  '#ffffff',
  '#000000',
  '#7c5cff',
  '#4dd7ff',
  '#ff4fd8',
  '#ff6b5f',
  '#ffd27d',
  '#82e9c1',
  '#a895ff',
  '#c9f9ff',
];

const GRADIENTS = {
  None: '',
  Purple: 'linear-gradient(135deg,#7c5cff,#a895ff)',
  Blue: 'linear-gradient(135deg,#2563eb,#4dd7ff)',
  Cyan: 'linear-gradient(135deg,#4dd7ff,#c9f9ff)',
  Sunset: 'linear-gradient(135deg,#ff6b5f,#ffd27d)',
  Neon: 'linear-gradient(135deg,#ff4fd8,#4dd7ff)',
  Gold: 'linear-gradient(135deg,#ffd27d,#fff2b2)',
  Pink: 'linear-gradient(135deg,#ff4fd8,#ff9acb)',
  Aurora: 'linear-gradient(135deg,#7c5cff,#4dd7ff,#82e9c1)',
  Ocean: 'linear-gradient(135deg,#075985,#4dd7ff)',
  Fire: 'linear-gradient(135deg,#ff4d4d,#ff9f43)',
  Emerald: 'linear-gradient(135deg,#087f5b,#82e9c1)',
  Lavender: 'linear-gradient(135deg,#7c5cff,#e0c3fc)',
};

const BACKGROUNDS = [
  ['none', 'None'],
  ['solid', 'Solid'],
  ['pill', 'Rounded pill'],
  ['rectangle', 'Rounded rectangle'],
  ['glass', 'Glass'],
  ['blur', 'Blur'],
  ['gradient', 'Gradient'],
  ['neon', 'Neon glow'],
];

const ANIMATIONS = [
  'None',
  'Fade',
  'Slide Up',
  'Slide Down',
  'Slide Left',
  'Slide Right',
  'Pop',
  'Bounce',
  'Typewriter',
  'Pulse',
  'Glow Pulse',
  'Zoom',
  'Cinematic Fade',
];

const TEMPLATES = [
  ['Good Morning', 'Good morning ✨'],
  ['Good Night', 'Good night 🌙'],
  ['Weekend', 'Weekend mode'],
  ['Travel', 'Take the scenic route'],
  ['Mood', 'Current mood'],
  ['Vibes', 'Good vibes only'],
  ['Birthday', 'Make a wish 🎂'],
  ['Celebration', 'Let’s celebrate 🎉'],
  ['Love', 'Love this moment ❤️'],
  ['Music', 'Turn it up 🎶'],
  ['Workout', 'No excuses'],
  ['Study', 'Focus mode'],
  ['Cinematic Quote', 'Every moment tells a story.'],
  ['Minimal Quote', 'Less, but better.'],
];

function createLayer(text = 'Aarush Story') {
  return {
    id: `text-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    text,
    x: 50,
    y: 50,
    scale: 1,
    rotation: 0,
    fontFamily: 'Inter',
    fontWeight: 700,
    fontStyle: 'normal',
    color: '#ffffff',
    gradient: '',
    background: 'none',
    backgroundColor: 'rgba(0,0,0,.35)',
    outline: {
      width: 0,
      color: '#000000',
      opacity: 1,
    },
    shadow: {
      x: 0,
      y: 2,
      blur: 10,
      opacity: 0.55,
      color: '#000000',
    },
    glow: {
      enabled: false,
      color: '#4dd7ff',
      intensity: 18,
    },
    opacity: 1,
    animation: 'None',
    alignment: 'center',
    letterSpacing: 0,
    lineHeight: 1.2,
    fontSize: 34,
    zIndex: 1,
    curved: {
      enabled: false,
      arc: 0,
      radius: 120,
      direction: 'up',
    },
  };
}

function mergeLayer(layer) {
  const base = createLayer();

  return {
    ...base,
    ...(layer || {}),
    outline: {
      ...base.outline,
      ...(layer?.outline || {}),
    },
    shadow: {
      ...base.shadow,
      ...(layer?.shadow || {}),
    },
    glow: {
      ...base.glow,
      ...(layer?.glow || {}),
    },
    curved: {
      ...base.curved,
      ...(layer?.curved || {}),
    },
  };
}

export default function StoryTextEditor({
  visible = false,
  textLayers = [],
  selectedLayer = null,
  onChange,
  onClose,
  onAddLayer,
  onDeleteLayer,
  onSelectLayer,
}) {
  const [layers, setLayers] = useState(() =>
    textLayers.map(mergeLayer)
  );
  const [selectedId, setSelectedId] = useState(
    selectedLayer?.id || textLayers[0]?.id || null
  );
  const [fontGroup, setFontGroup] =
    useState('Sans');
  const [colorTab, setColorTab] =
    useState('solid');
  const [fontOpen, setFontOpen] = useState(false);
  const [templateOpen, setTemplateOpen] =
    useState(false);
  const [recentColors, setRecentColors] =
    useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const normalized = Array.isArray(textLayers)
      ? textLayers.map(mergeLayer)
      : [];

    setLayers(normalized);

    if (
      selectedLayer?.id &&
      normalized.some(
        (layer) => layer.id === selectedLayer.id
      )
    ) {
      setSelectedId(selectedLayer.id);
    }
  }, [selectedLayer, textLayers]);

  const selected = useMemo(
    () =>
      layers.find((layer) => layer.id === selectedId) ||
      null,
    [layers, selectedId]
  );

  const updateLayers = useCallback(
    (nextLayers) => {
      setLayers(nextLayers);
      onChange?.(nextLayers);
    },
    [onChange]
  );

  const updateSelected = useCallback(
    (changes) => {
      if (!selected) return;

      const nextLayers = layers.map((layer) =>
        layer.id === selected.id
          ? mergeLayer({
              ...layer,
              ...changes,
            })
          : layer
      );

      updateLayers(nextLayers);
    },
    [layers, selected, updateLayers]
  );

  const addText = useCallback(
    (text = 'Aarush Story') => {
      const layer = createLayer(text);
      const nextLayers = [...layers, layer];

      updateLayers(nextLayers);
      setSelectedId(layer.id);
      onSelectLayer?.(layer);
      onAddLayer?.(layer);
    },
    [layers, onAddLayer, onSelectLayer, updateLayers]
  );

  const selectLayer = useCallback(
    (layer) => {
      setSelectedId(layer.id);
      onSelectLayer?.(layer);
    },
    [onSelectLayer]
  );

  const deleteLayer = useCallback(() => {
    if (!selected) return;

    const nextLayers = layers.filter(
      (layer) => layer.id !== selected.id
    );

    updateLayers(nextLayers);
    onDeleteLayer?.(selected);
    setSelectedId(nextLayers[0]?.id || null);
  }, [
    layers,
    onDeleteLayer,
    selected,
    updateLayers,
  ]);

  const duplicateLayer = useCallback(() => {
    if (!selected) return;

    const duplicate = mergeLayer({
      ...selected,
      id: `text-${Date.now()}`,
      x: Math.min(95, Number(selected.x) + 5),
      y: Math.min(95, Number(selected.y) + 5),
      zIndex: Number(selected.zIndex || 1) + 1,
    });

    updateLayers([...layers, duplicate]);
    setSelectedId(duplicate.id);
    onAddLayer?.(duplicate);
  }, [layers, onAddLayer, selected, updateLayers]);

  const changeColor = useCallback(
    (color) => {
      updateSelected({
        color,
        gradient: '',
      });

      setRecentColors((current) =>
        [color, ...current.filter((item) => item !== color)]
          .slice(0, 8)
      );
    },
    [updateSelected]
  );

  const changeGradient = useCallback(
    (gradient) => {
      updateSelected({
        gradient,
      });
    },
    [updateSelected]
  );

  const applyTemplate = useCallback(
    (text) => {
      addText(text);
      setTemplateOpen(false);
    },
    [addText]
  );

  const moveLayer = useCallback(
    (direction) => {
      if (!selected) return;

      const nextLayers = layers.map((layer) =>
        layer.id === selected.id
          ? {
              ...layer,
              zIndex: Math.max(
                0,
                Number(layer.zIndex || 1) + direction
              ),
            }
          : layer
      );

      updateLayers(nextLayers);
    },
    [layers, selected, updateLayers]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onClose?.();
        return;
      }

      if (event.key === 'Enter' && event.metaKey) {
        onClose?.();
      }

      if (!selected) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        updateSelected({
          x: Math.max(0, Number(selected.x) - 1),
        });
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        updateSelected({
          x: Math.min(100, Number(selected.x) + 1),
        });
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        updateSelected({
          y: Math.max(0, Number(selected.y) - 1),
        });
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        updateSelected({
          y: Math.min(100, Number(selected.y) + 1),
        });
      }
    },
    [onClose, selected, updateSelected]
  );

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Story text editor"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={styles.backdrop}
    >
      <section style={styles.panel}>
        <header style={styles.header}>
          <div>
            <strong style={styles.title}>
              Text Editor
            </strong>
            <span style={styles.subtitle}>
              Create expressive story typography
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close text editor"
            style={styles.iconButton}
          >
            <X size={18} />
          </button>
        </header>

        <div style={styles.layerBar}>
          <div style={styles.layerHeading}>
            <Layers size={15} />
            <span>Layers</span>
          </div>

          <button
            type="button"
            onClick={() => addText()}
            aria-label="Add text layer"
            style={styles.primarySmall}
          >
            <Plus size={15} />
            Add Text
          </button>
        </div>

        {layers.length ? (
          <div style={styles.layerScroller}>
            {layers.map((layer) => (
              <button
                type="button"
                key={layer.id}
                onClick={() => selectLayer(layer)}
                style={{
                  ...styles.layerChip,
                  ...(selectedId === layer.id
                    ? styles.activeLayerChip
                    : {}),
                }}
              >
                <Type size={13} />
                {layer.text || 'Empty text'}
              </button>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <Type size={25} />
            <span>Add a text layer to begin.</span>
            <button
              type="button"
              onClick={() => addText()}
              style={styles.primarySmall}
            >
              <Plus size={15} />
              Add Text
            </button>
          </div>
        )}

        {selected ? (
          <>
            <div style={styles.textEditor}>
              <textarea
                value={selected.text}
                onChange={(event) =>
                  updateSelected({
                    text: event.target.value,
                  })
                }
                aria-label="Text content"
                maxLength={500}
                placeholder="Type your story text"
                style={styles.textarea}
              />

              <span style={styles.counter}>
                {String(selected.text || '').length}/500
              </span>
            </div>

            <div style={styles.actionRow}>
              <button
                type="button"
                onClick={duplicateLayer}
                style={styles.toolButton}
              >
                <Copy size={14} />
                Duplicate
              </button>

              <button
                type="button"
                onClick={() => moveLayer(1)}
                style={styles.toolButton}
              >
                Bring Forward
              </button>

              <button
                type="button"
                onClick={() => moveLayer(-1)}
                style={styles.toolButton}
              >
                Send Back
              </button>

              <button
                type="button"
                onClick={deleteLayer}
                style={styles.deleteButton}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>

            <div style={styles.controlSection}>
              <button
                type="button"
                onClick={() =>
                  setFontOpen((value) => !value)
                }
                style={styles.sectionButton}
              >
                <span>
                  <Type size={15} />
                  Font
                </span>
                <ChevronDown size={15} />
              </button>

              {fontOpen ? (
                <div style={styles.fontPanel}>
                  <div style={styles.fontCategories}>
                    {Object.keys(FONT_GROUPS).map(
                      (group) => (
                        <button
                          type="button"
                          key={group}
                          onClick={() =>
                            setFontGroup(group)
                          }
                          style={{
                            ...styles.categoryButton,
                            ...(fontGroup === group
                              ? styles.activeCategory
                              : {}),
                          }}
                        >
                          {group}
                        </button>
                      )
                    )}
                  </div>

                  <div style={styles.fontList}>
                    {FONT_GROUPS[fontGroup].map(
                      (font) => (
                        <button
                          type="button"
                          key={font}
                          onClick={() =>
                            updateSelected({
                              fontFamily: font,
                            })
                          }
                          style={{
                            ...styles.fontButton,
                            fontFamily: font,
                            ...(selected.fontFamily ===
                            font
                              ? styles.selectedFont
                              : {}),
                          }}
                        >
                          Aa · {font}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div style={styles.controlSection}>
              <div style={styles.sectionLabel}>
                Typography
              </div>

              <div style={styles.optionRow}>
                <button
                  type="button"
                  onClick={() =>
                    updateSelected({
                      fontWeight:
                        Number(selected.fontWeight) >= 700
                          ? 400
                          : 700,
                    })
                  }
                  aria-pressed={
                    Number(selected.fontWeight) >= 700
                  }
                  style={{
                    ...styles.iconTool,
                    ...(Number(selected.fontWeight) >=
                    700
                      ? styles.activeTool
                      : {}),
                  }}
                >
                  <Bold size={16} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateSelected({
                      fontStyle:
                        selected.fontStyle === 'italic'
                          ? 'normal'
                          : 'italic',
                    })
                  }
                  aria-pressed={
                    selected.fontStyle === 'italic'
                  }
                  style={{
                    ...styles.iconTool,
                    ...(selected.fontStyle === 'italic'
                      ? styles.activeTool
                      : {}),
                  }}
                >
                  <Italic size={16} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateSelected({
                      underline:
                        !selected.underline,
                    })
                  }
                  aria-pressed={Boolean(selected.underline)}
                  style={{
                    ...styles.iconTool,
                    ...(selected.underline
                      ? styles.activeTool
                      : {}),
                  }}
                >
                  <Underline size={16} />
                </button>

                {[
                  ['left', AlignLeft],
                  ['center', AlignCenter],
                  ['right', AlignRight],
                ].map(([alignment, Icon]) => (
                  <button
                    type="button"
                    key={alignment}
                    onClick={() =>
                      updateSelected({ alignment })
                    }
                    aria-label={`Align ${alignment}`}
                    style={{
                      ...styles.iconTool,
                      ...(selected.alignment ===
                      alignment
                        ? styles.activeTool
                        : {}),
                    }}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>

              <label style={styles.sliderRow}>
                <span>Font size</span>
                <input
                  type="range"
                  min="12"
                  max="120"
                  value={selected.fontSize}
                  onChange={(event) =>
                    updateSelected({
                      fontSize: Number(
                        event.target.value
                      ),
                    })
                  }
                />
                <output>{selected.fontSize}</output>
              </label>

              <label style={styles.sliderRow}>
                <span>Scale</span>
                <input
                  type="range"
                  min=".4"
                  max="3"
                  step=".05"
                  value={selected.scale}
                  onChange={(event) =>
                    updateSelected({
                      scale: Number(
                        event.target.value
                      ),
                    })
                  }
                />
                <output>
                  {Number(selected.scale).toFixed(2)}
                </output>
              </label>

              <label style={styles.sliderRow}>
                <span>Rotation</span>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={selected.rotation}
                  onChange={(event) =>
                    updateSelected({
                      rotation: Number(
                        event.target.value
                      ),
                    })
                  }
                />
                <output>{selected.rotation}°</output>
              </label>

              <label style={styles.sliderRow}>
                <span>Letter spacing</span>
                <input
                  type="range"
                  min="-4"
                  max="16"
                  step=".5"
                  value={selected.letterSpacing}
                  onChange={(event) =>
                    updateSelected({
                      letterSpacing: Number(
                        event.target.value
                      ),
                    })
                  }
                />
                <output>
                  {selected.letterSpacing}
                </output>
              </label>

              <label style={styles.sliderRow}>
                <span>Line height</span>
                <input
                  type="range"
                  min=".7"
                  max="2.4"
                  step=".05"
                  value={selected.lineHeight}
                  onChange={(event) =>
                    updateSelected({
                      lineHeight: Number(
                        event.target.value
                      ),
                    })
                  }
                />
                <output>
                  {Number(selected.lineHeight).toFixed(2)}
                </output>
              </label>

              <label style={styles.sliderRow}>
                <span>Opacity</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step=".01"
                  value={selected.opacity}
                  onChange={(event) =>
                    updateSelected({
                      opacity: Number(
                        event.target.value
                      ),
                    })
                  }
                />
                <output>
                  {Math.round(selected.opacity * 100)}%
                </output>
              </label>
            </div>

            <div style={styles.controlSection}>
              <div style={styles.sectionLabel}>
                Colors and gradients
              </div>

              <div style={styles.tabRow}>
                {['solid', 'gradient'].map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setColorTab(tab)}
                    style={{
                      ...styles.tabButton,
                      ...(colorTab === tab
                        ? styles.activeTab
                        : {}),
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {colorTab === 'solid' ? (
                <>
                  <div style={styles.colorGrid}>
                    {[...new Set([
                      ...COLORS,
                      ...recentColors,
                    ])].map((color) => (
                      <button
                        type="button"
                        key={color}
                        aria-label={`Use color ${color}`}
                        onClick={() => changeColor(color)}
                        style={{
                          ...styles.colorButton,
                          background: color,
                          ...(selected.color === color
                            ? styles.selectedColor
                            : {}),
                        }}
                      />
                    ))}
                  </div>

                  <label style={styles.colorPickerRow}>
                    Custom color
                    <input
                      type="color"
                      value={selected.color}
                      onChange={(event) =>
                        changeColor(event.target.value)
                      }
                    />
                  </label>
                </>
              ) : (
                <div style={styles.gradientGrid}>
                  {Object.entries(GRADIENTS).map(
                    ([name, gradient]) => (
                      <button
                        type="button"
                        key={name}
                        onClick={() =>
                          updateSelected({
                            gradient,
                          })
                        }
                        style={{
                          ...styles.gradientButton,
                          background:
                            gradient ||
                            'rgba(255,255,255,.08)',
                          ...(selected.gradient ===
                          gradient
                            ? styles.selectedGradient
                            : {}),
                        }}
                      >
                        {name}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <div style={styles.controlSection}>
              <div style={styles.sectionLabel}>
                Background
              </div>

              <div style={styles.backgroundGrid}>
                {BACKGROUNDS.map(([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() =>
                      updateSelected({
                        background: id,
                      })
                    }
                    style={{
                      ...styles.backgroundButton,
                      ...(selected.background === id
                        ? styles.activeBackground
                        : {}),
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.controlSection}>
              <div style={styles.sectionLabel}>
                Outline and shadow
              </div>

              <label style={styles.sliderRow}>
                <span>Outline</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={selected.outline.width}
                  onChange={(event) =>
                    updateSelected({
                      outline: {
                        ...selected.outline,
                        width: Number(
                          event.target.value
                        ),
                      },
                    })
                  }
                />
                <output>
                  {selected.outline.width}
                </output>
              </label>

              <label style={styles.sliderRow}>
                <span>Shadow blur</span>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={selected.shadow.blur}
                  onChange={(event) =>
                    updateSelected({
                      shadow: {
                        ...selected.shadow,
                        blur: Number(
                          event.target.value
                        ),
                      },
                    })
                  }
                />
                <output>
                  {selected.shadow.blur}
                </output>
              </label>

              <label style={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={Boolean(selected.glow.enabled)}
                  onChange={(event) =>
                    updateSelected({
                      glow: {
                        ...selected.glow,
                        enabled: event.target.checked,
                      },
                    })
                  }
                />
                Outer glow
              </label>
            </div>

            <div style={styles.controlSection}>
              <div style={styles.sectionLabel}>
                Curved text foundation
              </div>

              <label style={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={Boolean(
                    selected.curved.enabled
                  )}
                  onChange={(event) =>
                    updateSelected({
                      curved: {
                        ...selected.curved,
                        enabled: event.target.checked,
                      },
                    })
                  }
                />
                Enable curved text
              </label>

              {selected.curved.enabled ? (
                <label style={styles.sliderRow}>
                  <span>Arc amount</span>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={selected.curved.arc}
                    onChange={(event) =>
                      updateSelected({
                        curved: {
                          ...selected.curved,
                          arc: Number(
                            event.target.value
                          ),
                        },
                      })
                    }
                  />
                  <output>
                    {selected.curved.arc}°
                  </output>
                </label>
              ) : null}
            </div>

            <div style={styles.controlSection}>
              <div style={styles.sectionLabel}>
                Animation
              </div>

              <select
                value={selected.animation}
                onChange={(event) =>
                  updateSelected({
                    animation: event.target.value,
                  })
                }
                aria-label="Text animation"
                style={styles.select}
              >
                {ANIMATIONS.map((animation) => (
                  <option
                    value={animation}
                    key={animation}
                  >
                    {animation}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : null}

        <div style={styles.templateSection}>
          <button
            type="button"
            onClick={() =>
              setTemplateOpen((value) => !value)
            }
            style={styles.sectionButton}
          >
            <span>
              <Sparkles size={15} />
              Templates
            </span>
            <ChevronDown size={15} />
          </button>

          {templateOpen ? (
            <div style={styles.templateGrid}>
              {TEMPLATES.map(([name, text]) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => applyTemplate(text)}
                  style={styles.templateButton}
                >
                  <strong>{name}</strong>
                  <span>{text}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}
      </section>

      <style>{`
        .aarush-text-editor-range {
          accent-color: #7c5cff;
        }

        .aarush-text-editor-button:hover {
          transform: translateY(-1px);
        }

        @keyframes aarush-text-editor-slide {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 520px) {
          .aarush-text-editor-panel {
            max-height: 88vh;
          }

          .aarush-text-editor-font-categories {
            grid-template-columns: repeat(3, 1fr) !important;
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

const GRADIENTS = {
  None: '',
  Purple: 'linear-gradient(135deg,#7c5cff,#a895ff)',
  Blue: 'linear-gradient(135deg,#2563eb,#4dd7ff)',
  Cyan: 'linear-gradient(135deg,#4dd7ff,#c9f9ff)',
  Sunset: 'linear-gradient(135deg,#ff6b5f,#ffd27d)',
  Neon: 'linear-gradient(135deg,#ff4fd8,#4dd7ff)',
  Gold: 'linear-gradient(135deg,#ffd27d,#fff2b2)',
  Pink: 'linear-gradient(135deg,#ff4fd8,#ff9acb)',
  Aurora: 'linear-gradient(135deg,#7c5cff,#4dd7ff,#82e9c1)',
  Ocean: 'linear-gradient(135deg,#075985,#4dd7ff)',
  Fire: 'linear-gradient(135deg,#ff4d4d,#ff9f43)',
  Emerald: 'linear-gradient(135deg,#087f5b,#82e9c1)',
  Lavender: 'linear-gradient(135deg,#7c5cff,#e0c3fc)',
};

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
    width: 'min(100%, 640px)',
    maxHeight: '88vh',
    overflowY: 'auto',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.4rem',
    color: '#f4f7ff',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
    animation: 'aarush-text-editor-slide 230ms ease both',
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

  iconButton: {
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

  layerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
  },

  layerHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    color: '#cbd6ec',
    fontSize: '.7rem',
    fontWeight: 800,
  },

  primarySmall: {
    minHeight: '2.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    padding: '0 .7rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.66rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  layerScroller: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    margin: '.6rem 0',
    paddingBottom: '.2rem',
  },

  layerChip: {
    minHeight: '2.15rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    flexShrink: 0,
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    color: '#9aa7c1',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  activeLayerChip: {
    borderColor: 'rgba(124,92,255,.48)',
    color: '#fff',
    background: 'rgba(124,92,255,.17)',
  },

  emptyState: {
    display: 'grid',
    justifyItems: 'center',
    gap: '.55rem',
    padding: '1.4rem',
    color: '#91a0bc',
    textAlign: 'center',
  },

  textEditor: {
    position: 'relative',
    marginTop: '.7rem',
  },

  textarea: {
    width: '100%',
    minHeight: '5.2rem',
    boxSizing: 'border-box',
    padding: '.7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.8rem',
    outline: 0,
    resize: 'vertical',
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.78rem',
    lineHeight: 1.45,
  },

  counter: {
    position: 'absolute',
    right: '.55rem',
    bottom: '.45rem',
    color: '#8290ad',
    fontSize: '.58rem',
  },

  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.55rem',
  },

  toolButton: {
    minHeight: '2.15rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  deleteButton: {
    minHeight: '2.15rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,91,132,.22)',
    borderRadius: '.6rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  controlSection: {
    display: 'grid',
    gap: '.6rem',
    marginTop: '.8rem',
    paddingTop: '.75rem',
    borderTop: '1px solid rgba(255,255,255,.08)',
  },

  sectionButton: {
    width: '100%',
    minHeight: '2.45rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.045)',
    fontSize: '.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  sectionButtonSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.35rem',
  },

  sectionLabel: {
    color: '#cbd6ec',
    fontSize: '.68rem',
    fontWeight: 850,
  },

  fontPanel: {
    display: 'grid',
    gap: '.55rem',
  },

  fontCategories: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.3rem',
  },

  categoryButton: {
    minHeight: '2rem',
    padding: '0 .3rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.55rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  activeCategory: {
    borderColor: 'rgba(124,92,255,.4)',
    color: '#fff',
    background: 'rgba(124,92,255,.17)',
  },

  fontList: {
    display: 'grid',
    gap: '.3rem',
  },

  fontButton: {
    minHeight: '2.45rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.65rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.8rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  selectedFont: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.16)',
  },

  optionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  iconTool: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    cursor: 'pointer',
  },

  activeTool: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  sliderRow: {
    display: 'grid',
    gridTemplateColumns: '6.2rem 1fr 3rem',
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

  tabRow: {
    display: 'flex',
    gap: '.35rem',
  },

  tabButton: {
    minHeight: '2.1rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  activeTab: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  colorGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.4rem',
  },

  colorButton: {
    width: '1.75rem',
    height: '1.75rem',
    border: '2px solid transparent',
    borderRadius: '999px',
    cursor: 'pointer',
  },

  selectedColor: {
    borderColor: '#fff',
    boxShadow: '0 0 0 2px #7c5cff',
  },

  colorPickerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  gradientGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.35rem',
  },

  gradientButton: {
    minHeight: '2.4rem',
    border: '2px solid transparent',
    borderRadius: '.65rem',
    color: '#fff',
    fontSize: '.58rem',
    fontWeight: 750,
    textShadow: '0 1px 4px rgba(0,0,0,.5)',
    cursor: 'pointer',
  },

  selectedGradient: {
    borderColor: '#fff',
    boxShadow: '0 0 0 2px #7c5cff',
  },

  backgroundGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.35rem',
  },

  backgroundButton: {
    minHeight: '2.2rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeBackground: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    color: '#cbd6ec',
    fontSize: '.65rem',
  },

  select: {
    minHeight: '2.4rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    outline: 0,
    color: '#dce5f8',
    background: '#171d2d',
    fontSize: '.68rem',
  },

  templateSection: {
    display: 'grid',
    gap: '.55rem',
    marginTop: '.8rem',
    paddingTop: '.75rem',
    borderTop: '1px solid rgba(255,255,255,.08)',
  },

  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  templateButton: {
    minHeight: '3.25rem',
    display: 'grid',
    alignContent: 'center',
    gap: '.2rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  templateButtonSpan: {
    overflow: 'hidden',
    color: '#91a0bc',
    fontSize: '.6rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    padding: '.65rem',
    border: '1px solid rgba(130,233,193,.2)',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.65rem',
  },
};