import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Crop,
  FlipHorizontal,
  FlipVertical,
  Grid3X3,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Square,
  Target,
  X,
  Check,
} from 'lucide-react';

const RATIOS = [
  ['story', 'Story', 9 / 16],
  ['square', 'Square', 1],
  ['portrait', 'Portrait', 4 / 5],
  ['landscape', 'Landscape', 16 / 9],
  ['free', 'Free', null],
  ['original', 'Original', null],
];

const TOOLS = [
  ['crop', 'Crop', Crop],
  ['rotate', 'Rotate', RotateCw],
  ['flip', 'Flip', FlipHorizontal],
  ['straighten', 'Straighten', Target],
  ['perspective', 'Perspective', Grid3X3],
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeMedia(media) {
  if (typeof media === 'string') {
    return {
      url: media,
      type: 'image',
    };
  }

  return {
    ...(media || {}),
    url:
      media?.url ||
      media?.mediaUrl ||
      media?.media_url ||
      '',
    type:
      media?.type ||
      media?.mediaType ||
      media?.media_type ||
      'image',
  };
}

function normalizeCrop(crop) {
  return {
    x: clamp(Number(crop?.x) || 0.1, 0, 1),
    y: clamp(Number(crop?.y) || 0.1, 0, 1),
    width: clamp(Number(crop?.width) || 0.8, 0.05, 1),
    height: clamp(Number(crop?.height) || 0.8, 0.05, 1),
  };
}

function ratioFromCrop(crop) {
  if (!crop?.width || !crop?.height) return 1;
  return crop.width / crop.height;
}

export default function StoryCropRotateEditor({
  visible = false,
  media,
  initialCrop,
  initialRotation = 0,
  initialScale = 1,
  initialFlip,
  onChange,
  onClose,
  onReset,
  onApply,
}) {
  const stageRef = useRef(null);
  const gestureRef = useRef(null);
  const lastTapRef = useRef(0);
  const frameRef = useRef(null);
  const mountedRef = useRef(true);

  const source = useMemo(
    () => normalizeMedia(media),
    [media]
  );

  const [crop, setCrop] = useState(() =>
    normalizeCrop(initialCrop)
  );
  const [ratio, setRatio] = useState('story');
  const [rotation, setRotation] =
    useState(Number(initialRotation) || 0);
  const [scale, setScale] = useState(
    Math.max(1, Number(initialScale) || 1)
  );
  const [flipHorizontal, setFlipHorizontal] =
    useState(Boolean(initialFlip?.horizontal));
  const [flipVertical, setFlipVertical] =
    useState(Boolean(initialFlip?.vertical));
  const [straighten, setStraighten] = useState(0);
  const [perspectiveX, setPerspectiveX] =
    useState(0);
  const [perspectiveY, setPerspectiveY] =
    useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] =
    useState('crop');
  const [grid, setGrid] = useState(true);
  const [gridMode, setGridMode] =
    useState('thirds');
  const [error, setError] = useState('');

  const metadata = useMemo(
    () => ({
      cropX: crop.x,
      cropY: crop.y,
      cropWidth: crop.width,
      cropHeight: crop.height,
      ratio,
      rotation,
      scale,
      flipHorizontal,
      flipVertical,
      straighten,
      perspectiveX,
      perspectiveY,
      panX: pan.x,
      panY: pan.y,
    }),
    [
      crop,
      flipHorizontal,
      flipVertical,
      pan,
      perspectiveX,
      perspectiveY,
      ratio,
      rotation,
      scale,
      straighten,
    ]
  );

  const emitChange = useCallback(
    (nextMetadata = metadata) => {
      onChange?.(nextMetadata);
    },
    [metadata, onChange]
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!visible || !source.url) return;

    if (source.type !== 'image' && source.type !== 'video') {
      setError('Unsupported story media type.');
      return;
    }

    setError('');
  }, [source.type, source.url, visible]);

  useEffect(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(() => {
      if (mountedRef.current) {
        emitChange(metadata);
      }
    });

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [emitChange, metadata]);

  const reset = useCallback(() => {
    const nextCrop = normalizeCrop(initialCrop);

    setCrop(nextCrop);
    setRatio('story');
    setRotation(Number(initialRotation) || 0);
    setScale(Math.max(1, Number(initialScale) || 1));
    setFlipHorizontal(Boolean(initialFlip?.horizontal));
    setFlipVertical(Boolean(initialFlip?.vertical));
    setStraighten(0);
    setPerspectiveX(0);
    setPerspectiveY(0);
    setPan({ x: 0, y: 0 });
    setError('');
    onReset?.();
  }, [
    initialCrop,
    initialFlip?.horizontal,
    initialFlip?.vertical,
    initialRotation,
    initialScale,
    onReset,
  ]);

  const setCropRatio = useCallback(
    (nextRatio, nextLabel) => {
      setRatio(nextLabel);

      if (nextRatio === null) return;

      setCrop((current) => {
        const centerX = current.x + current.width / 2;
        const centerY = current.y + current.height / 2;
        let width = current.width;
        let height = width / nextRatio;

        if (height > 1) {
          height = 1;
          width = height * nextRatio;
        }

        if (width > 1) {
          width = 1;
          height = width / nextRatio;
        }

        return {
          x: clamp(centerX - width / 2, 0, 1 - width),
          y: clamp(centerY - height / 2, 0, 1 - height),
          width,
          height,
        };
      });
    },
    []
  );

  const updateCropFromPointer = useCallback(
    (event, mode) => {
      const stage = stageRef.current;
      const gesture = gestureRef.current;

      if (!stage || !gesture) return;

      const rect = stage.getBoundingClientRect();
      const deltaX =
        (event.clientX - gesture.startX) / rect.width;
      const deltaY =
        (event.clientY - gesture.startY) / rect.height;

      if (mode === 'pan') {
        setPan({
          x: gesture.panX + deltaX * 100,
          y: gesture.panY + deltaY * 100,
        });
        return;
      }

      if (mode === 'crop') {
        setCrop((current) => ({
          ...current,
          x: clamp(
            gesture.cropX + deltaX,
            0,
            1 - current.width
          ),
          y: clamp(
            gesture.cropY + deltaY,
            0,
            1 - current.height
          ),
        }));
        return;
      }

      if (mode === 'resize') {
        const nextWidth = clamp(
          gesture.cropWidth + deltaX,
          0.05,
          1 - gesture.cropX
        );
        const nextHeight = clamp(
          gesture.cropHeight + deltaY,
          0.05,
          1 - gesture.cropY
        );

        setCrop((current) => {
          if (ratio === 'free') {
            return {
              ...current,
              width: nextWidth,
              height: nextHeight,
            };
          }

          const selectedRatio =
            RATIOS.find(([id]) => id === ratio)?.[2] ||
            ratioFromCrop(current);

          const constrainedHeight =
            nextWidth / selectedRatio;

          return {
            ...current,
            width: nextWidth,
            height: Math.min(
              constrainedHeight,
              1 - current.y
            ),
          };
        });
      }
    },
    [ratio]
  );

  const handlePointerDown = useCallback(
    (event, mode = 'pan') => {
      const now = Date.now();

      if (now - lastTapRef.current < 280) {
        setScale((value) => (value > 1 ? 1 : 2));
        setPan({ x: 0, y: 0 });
      }

      lastTapRef.current = now;

      gestureRef.current = {
        mode,
        startX: event.clientX,
        startY: event.clientY,
        cropX: crop.x,
        cropY: crop.y,
        cropWidth: crop.width,
        cropHeight: crop.height,
        panX: pan.x,
        panY: pan.y,
      };

      event.currentTarget.setPointerCapture?.(
        event.pointerId
      );
    },
    [crop, pan]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!gestureRef.current) return;

      updateCropFromPointer(
        event,
        gestureRef.current.mode
      );
    },
    [updateCropFromPointer]
  );

  const handlePointerUp = useCallback(() => {
    gestureRef.current = null;

    setCrop((current) => ({
      ...current,
      x:
        Math.abs(current.x - 0.5) < 0.015
          ? 0.5 - current.width / 2
          : current.x,
      y:
        Math.abs(current.y - 0.5) < 0.015
          ? 0.5 - current.height / 2
          : current.y,
    }));
  }, []);

  const handleWheel = useCallback((event) => {
    event.preventDefault();

    setScale((value) =>
      clamp(value - event.deltaY * 0.001, 1, 5)
    );
  }, []);

  const rotateLeft = useCallback(() => {
    setRotation((value) => (value - 90 + 360) % 360);
  }, []);

  const rotateRight = useCallback(() => {
    setRotation((value) => (value + 90) % 360);
  }, []);

  const apply = useCallback(() => {
    if (!source.url) {
      setError('Story media is unavailable.');
      return;
    }

    onApply?.({
      ...metadata,
      media: source,
    });
  }, [metadata, onApply, source]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }

      if (event.key === 'Enter') {
        apply();
      }

      if (event.key === 'ArrowLeft') {
        rotateLeft();
      }

      if (event.key === 'ArrowRight') {
        rotateRight();
      }

      if (event.key === '+' || event.key === '=') {
        setScale((value) => clamp(value + 0.1, 1, 5));
      }

      if (event.key === '-') {
        setScale((value) => clamp(value - 0.1, 1, 5));
      }
    },
    [apply, onClose, rotateLeft, rotateRight]
  );

  if (!visible) return null;

  if (!source.url || error) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        style={styles.backdrop}
      >
        <div style={styles.errorState}>
          <Crop size={32} />
          <strong>
            {error || 'Media unavailable'}
          </strong>
          <span>
            Select a valid image or video to continue.
          </span>
          <button
            type="button"
            onClick={onClose}
            style={styles.primaryButton}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const transform = [
    `translate(${pan.x}%,${pan.y}%)`,
    `scale(${scale})`,
    `rotate(${rotation + straighten}deg)`,
    `scaleX(${flipHorizontal ? -1 : 1})`,
    `scaleY(${flipVertical ? -1 : 1})`,
  ].join(' ');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Story crop and rotate editor"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={styles.backdrop}
    >
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close crop editor"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <strong style={styles.title}>
          Crop & Transform
        </strong>

        <button
          type="button"
          onClick={apply}
          aria-label="Apply crop and transform"
          style={styles.applyButton}
        >
          <Check size={16} />
          Apply
        </button>
      </header>

      <main style={styles.content}>
        <section
          ref={stageRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          style={{
            ...styles.previewStage,
            aspectRatio:
              ratio === 'square'
                ? '1 / 1'
                : ratio === 'portrait'
                  ? '4 / 5'
                  : ratio === 'landscape'
                    ? '16 / 9'
                    : '9 / 16',
          }}
        >
          {source.type === 'video' ? (
            <video
              src={source.url}
              autoPlay
              muted
              loop
              playsInline
              style={{
                ...styles.media,
                transform,
              }}
            />
          ) : (
            <img
              src={source.url}
              alt="Story transform preview"
              style={{
                ...styles.media,
                transform,
              }}
            />
          )}

          {grid ? (
            <div
              aria-hidden="true"
              style={{
                ...styles.grid,
                ...(gridMode === 'fine'
                  ? styles.fineGrid
                  : {}),
                ...(gridMode === 'golden'
                  ? styles.goldenGrid
                  : {}),
              }}
            />
          ) : null}

          <div
            style={{
              ...styles.cropFrame,
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.width * 100}%`,
              height: `${crop.height * 100}%`,
            }}
            onPointerDown={(event) =>
              handlePointerDown(event, 'crop')
            }
          >
            <span
              style={{
                ...styles.resizeHandle,
                right: '-.45rem',
                bottom: '-.45rem',
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                handlePointerDown(event, 'resize');
              }}
            />

            <span
              style={{
                ...styles.resizeHandle,
                left: '-.45rem',
                top: '-.45rem',
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                handlePointerDown(event, 'resize');
              }}
            />
          </div>
        </section>

        {activeTool === 'crop' ? (
          <section style={styles.panel}>
            <div style={styles.ratioScroller}>
              {RATIOS.map(([id, label, value]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() =>
                    setCropRatio(value, id)
                  }
                  aria-pressed={ratio === id}
                  style={{
                    ...styles.ratioButton,
                    ...(ratio === id
                      ? styles.activeRatio
                      : {}),
                  }}
                >
                  <Square size={15} />
                  {label}
                </button>
              ))}
            </div>

            <div style={styles.controlRow}>
              <button
                type="button"
                onClick={() =>
                  setGrid((value) => !value)
                }
                aria-pressed={grid}
                style={styles.toolButton}
              >
                <Grid3X3 size={15} />
                Grid
              </button>

              <select
                value={gridMode}
                onChange={(event) =>
                  setGridMode(event.target.value)
                }
                aria-label="Grid type"
                style={styles.select}
              >
                <option value="thirds">
                  Rule of thirds
                </option>
                <option value="fine">Fine grid</option>
                <option value="golden">
                  Golden ratio
                </option>
              </select>

              <label style={styles.sliderLabel}>
                Zoom
                <input
                  type="range"
                  min="1"
                  max="5"
                  step=".05"
                  value={scale}
                  onChange={(event) =>
                    setScale(Number(event.target.value))
                  }
                />
                <output>
                  {scale.toFixed(2)}x
                </output>
              </label>
            </div>
          </section>
        ) : null}

        {activeTool === 'rotate' ? (
          <section style={styles.panel}>
            <div style={styles.controlRow}>
              <button
                type="button"
                onClick={rotateLeft}
                aria-label="Rotate left 90 degrees"
                style={styles.toolButton}
              >
                <RotateCcw size={16} />
                Left 90°
              </button>

              <button
                type="button"
                onClick={rotateRight}
                aria-label="Rotate right 90 degrees"
                style={styles.toolButton}
              >
                <RotateCw size={16} />
                Right 90°
              </button>
            </div>

            <label style={styles.sliderLabel}>
              Rotation
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(event) =>
                  setRotation(
                    Number(event.target.value)
                  )
                }
              />
              <output>{rotation}°</output>
            </label>

            <button
              type="button"
              onClick={() => setRotation(0)}
              style={styles.resetButton}
            >
              Reset rotation
            </button>
          </section>
        ) : null}

        {activeTool === 'flip' ? (
          <section style={styles.panel}>
            <div style={styles.controlRow}>
              <button
                type="button"
                onClick={() =>
                  setFlipHorizontal((value) => !value)
                }
                aria-pressed={flipHorizontal}
                style={{
                  ...styles.toolButton,
                  ...(flipHorizontal
                    ? styles.activeTool
                    : {}),
                }}
              >
                <FlipHorizontal size={16} />
                Horizontal
              </button>

              <button
                type="button"
                onClick={() =>
                  setFlipVertical((value) => !value)
                }
                aria-pressed={flipVertical}
                style={{
                  ...styles.toolButton,
                  ...(flipVertical
                    ? styles.activeTool
                    : {}),
                }}
              >
                <FlipVertical size={16} />
                Vertical
              </button>
            </div>
          </section>
        ) : null}

        {activeTool === 'straighten' ? (
          <section style={styles.panel}>
            <label style={styles.sliderLabel}>
              Straighten
              <input
                type="range"
                min="-45"
                max="45"
                step=".1"
                value={straighten}
                onChange={(event) =>
                  setStraighten(
                    Number(event.target.value)
                  )
                }
              />
              <output>{straighten.toFixed(1)}°</output>
            </label>

            <div style={styles.horizonGuide}>
              <span />
            </div>

            <button
              type="button"
              onClick={() => setStraighten(0)}
              style={styles.resetButton}
            >
              Reset straighten
            </button>
          </section>
        ) : null}

        {activeTool === 'perspective' ? (
          <section style={styles.panel}>
            <label style={styles.sliderLabel}>
              Horizontal perspective
              <input
                type="range"
                min="-45"
                max="45"
                value={perspectiveX}
                onChange={(event) =>
                  setPerspectiveX(
                    Number(event.target.value)
                  )
                }
              />
              <output>{perspectiveX}</output>
            </label>

            <label style={styles.sliderLabel}>
              Vertical perspective
              <input
                type="range"
                min="-45"
                max="45"
                value={perspectiveY}
                onChange={(event) =>
                  setPerspectiveY(
                    Number(event.target.value)
                  )
                }
              />
              <output>{perspectiveY}</output>
            </label>

            <span style={styles.foundationText}>
              Corner dragging and keystone correction are
              prepared for future transform rendering.
            </span>
          </section>
        ) : null}

        <footer style={styles.bottomToolbar}>
          {TOOLS.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTool(id)}
              aria-pressed={activeTool === id}
              style={{
                ...styles.bottomTool,
                ...(activeTool === id
                  ? styles.activeBottomTool
                  : {}),
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={reset}
            aria-label="Reset all transforms"
            style={styles.bottomTool}
          >
            <RotateCcw size={17} />
            <span>Reset</span>
          </button>
        </footer>
      </main>

      <style>{`
        .aarush-crop-button:hover {
          transform: translateY(-1px);
        }

        .aarush-crop-button:active {
          transform: scale(.94);
        }

        @keyframes aarush-crop-slide-up {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 520px) {
          .aarush-crop-bottom-tool span {
            display: none;
          }

          .aarush-crop-bottom-tool {
            min-width: 2.8rem !important;
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

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1350,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    color: '#f4f7ff',
    background: '#05070d',
  },

  header: {
    position: 'relative',
    zIndex: 10,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.6rem',
    padding:
      'calc(.7rem + env(safe-area-inset-top)) .75rem .7rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  title: {
    color: '#f4f7ff',
    fontSize: '.92rem',
    fontWeight: 850,
    textAlign: 'center',
  },

  iconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  applyButton: {
    minHeight: '2.45rem',
    display: 'inline-flex',
    alignItems: 'center',
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

  content: {
    width: '100%',
    maxWidth: '850px',
    minHeight: 0,
    margin: '0 auto',
    padding: '.85rem .85rem calc(6rem + env(safe-area-inset-bottom))',
    overflowY: 'auto',
    flex: 1,
  },

  previewStage: {
    position: 'relative',
    width: 'min(100%, 560px)',
    maxHeight: '62vh',
    margin: '0 auto',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '1.3rem',
    background: '#080b13',
    boxShadow: '0 20px 65px rgba(0,0,0,.4)',
    touchAction: 'none',
  },

  media: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
    transformOrigin: 'center',
    transition: 'transform 180ms ease',
  },

  grid: {
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    pointerEvents: 'none',
    opacity: .5,
    background:
      'linear-gradient(90deg,transparent 33%,rgba(255,255,255,.35) 33.2%,transparent 33.4%,transparent 66%,rgba(255,255,255,.35) 66.2%,transparent 66.4%),linear-gradient(0deg,transparent 33%,rgba(255,255,255,.35) 33.2%,transparent 33.4%,transparent 66%,rgba(255,255,255,.35) 66.2%,transparent 66.4%)',
    transition: 'opacity 180ms ease',
  },

  fineGrid: {
    backgroundSize: '10% 10%',
    backgroundImage:
      'linear-gradient(rgba(255,255,255,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.25) 1px,transparent 1px)',
  },

  goldenGrid: {
    background:
      'linear-gradient(38deg,transparent 48%,rgba(255,255,255,.4) 48.2%,transparent 48.4%),linear-gradient(142deg,transparent 48%,rgba(255,255,255,.4) 48.2%,transparent 48.4%)',
  },

  cropFrame: {
    position: 'absolute',
    zIndex: 4,
    border: '2px solid #fff',
    boxShadow:
      '0 0 0 9999px rgba(0,0,0,.38),0 0 18px rgba(77,215,255,.24)',
    touchAction: 'none',
    cursor: 'move',
  },

  resizeHandle: {
    position: 'absolute',
    width: '.85rem',
    height: '.85rem',
    border: '2px solid #fff',
    borderRadius: '.2rem',
    background: '#7c5cff',
    cursor: 'nwse-resize',
  },

  panel: {
    display: 'grid',
    gap: '.65rem',
    margin: '.8rem auto 0',
    padding: '.8rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    animation: 'aarush-crop-slide-up 220ms ease both',
  },

  ratioScroller: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    paddingBottom: '.2rem',
  },

  ratioButton: {
    minHeight: '2.35rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    flexShrink: 0,
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.65rem',
    color: '#9aa7c1',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  activeRatio: {
    borderColor: 'rgba(124,92,255,.48)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  controlRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '.4rem',
  },

  toolButton: {
    minHeight: '2.35rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.65rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  activeTool: {
    borderColor: 'rgba(124,92,255,.48)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  select: {
    minHeight: '2.35rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#cbd6ec',
    background: '#151c2c',
    fontSize: '.62rem',
  },

  sliderLabel: {
    display: 'grid',
    gridTemplateColumns: '7rem 1fr 3.2rem',
    alignItems: 'center',
    gap: '.5rem',
    color: '#aab6cf',
    fontSize: '.64rem',
  },

  sliderLabelInput: {
    width: '100%',
    accentColor: '#7c5cff',
  },

  sliderLabelOutput: {
    color: '#9deeff',
    textAlign: 'right',
  },

  horizonGuide: {
    position: 'relative',
    height: '2rem',
    overflow: 'hidden',
    borderRadius: '.6rem',
    background:
      'linear-gradient(180deg,transparent 48%,rgba(77,215,255,.35) 49%,transparent 51%)',
  },

  horizonGuideSpan: {
    position: 'absolute',
    top: '50%',
    right: '10%',
    left: '10%',
    height: '1px',
    background: '#4dd7ff',
  },

  resetButton: {
    minHeight: '2.3rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.65rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  foundationText: {
    color: '#8290ad',
    fontSize: '.62rem',
    lineHeight: 1.45,
  },

  bottomToolbar: {
    position: 'fixed',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.25rem',
    overflowX: 'auto',
    padding:
      '.55rem .65rem calc(.65rem + env(safe-area-inset-bottom))',
    borderTop: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.92)',
    boxShadow: '0 -12px 35px rgba(0,0,0,.3)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  bottomTool: {
    minWidth: '4rem',
    minHeight: '3rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.18rem',
    flexShrink: 0,
    border: 0,
    borderRadius: '.65rem',
    color: '#91a0bc',
    background: 'transparent',
    fontSize: '.57rem',
    fontWeight: 750,
    cursor: 'pointer',
  },

  activeBottomTool: {
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  errorState: {
    width: 'min(90%, 340px)',
    display: 'grid',
    justifyItems: 'center',
    gap: '.6rem',
    padding: '1.4rem',
    border: '1px solid rgba(255,91,132,.25)',
    borderRadius: '1.2rem',
    color: '#ffc2d0',
    background: 'rgba(255,91,132,.08)',
    textAlign: 'center',
  },

  primaryButton: {
    minHeight: '2.65rem',
    padding: '0 .9rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },
};