import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Circle,
  Eraser,
  Minus,
  Pause,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Square,
  Trash2,
  Undo2,
  X,
  Zap,
} from 'lucide-react';

const TOOLS = [
  ['pen', 'Pen', Pencil],
  ['marker', 'Marker', Pencil],
  ['highlighter', 'Highlighter', Pencil],
  ['neon', 'Neon', Zap],
  ['brush', 'Brush', Circle],
  ['pencil', 'Pencil', Pencil],
  ['calligraphy', 'Calligraphy', Pencil],
  ['spray', 'Spray', Circle],
  ['eraser', 'Eraser', Eraser],
];

const SHAPES = [
  ['line', 'Line', Minus],
  ['arrow', 'Arrow', Zap],
  ['rectangle', 'Rectangle', Square],
  ['circle', 'Circle', Circle],
];

const COLORS = [
  '#ffffff',
  '#000000',
  '#7c5cff',
  '#4dd7ff',
  '#ff4fd8',
  '#ff5b84',
  '#ffd27d',
  '#82e9c1',
  '#9deeff',
  '#a895ff',
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function makeId(prefix = 'stroke') {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function normalizePoint(point) {
  return {
    x: clamp(Number(point.x) || 0, 0, 1),
    y: clamp(Number(point.y) || 0, 0, 1),
    pressure: clamp(Number(point.pressure) || 0.5, 0, 1),
    tiltX: Number(point.tiltX) || 0,
    tiltY: Number(point.tiltY) || 0,
    velocity: Number(point.velocity) || 0,
  };
}

function normalizeStroke(stroke) {
  return {
    id: stroke?.id || makeId(),
    tool: stroke?.tool || 'pen',
    color: stroke?.color || '#ffffff',
    size: Math.max(1, Number(stroke?.size) || 5),
    opacity: clamp(Number(stroke?.opacity) || 1, 0, 1),
    hardness: clamp(Number(stroke?.hardness) || 0.8, 0, 1),
    smoothing: clamp(Number(stroke?.smoothing) || 0.65, 0, 1),
    spacing: clamp(Number(stroke?.spacing) || 0.15, 0.01, 1),
    glow: Math.max(0, Number(stroke?.glow) || 0),
    layer: stroke?.layer || 'default',
    layerOpacity: clamp(
      Number(stroke?.layerOpacity) || 1,
      0,
      1
    ),
    type: stroke?.type || 'freehand',
    points: Array.isArray(stroke?.points)
      ? stroke.points.map(normalizePoint)
      : [],
    pressureData: Array.isArray(stroke?.pressureData)
      ? stroke.pressureData
      : [],
    timestamp: stroke?.timestamp || Date.now(),
  };
}

function midpoint(first, second) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function drawSmoothPath(context, points) {
  if (!points.length) return;

  if (points.length === 1) {
    context.beginPath();
    context.arc(
      points[0].x,
      points[0].y,
      context.lineWidth / 2,
      0,
      Math.PI * 2
    );
    context.fill();
    return;
  }

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length - 1; index += 1) {
    const middle = midpoint(
      points[index],
      points[index + 1]
    );

    context.quadraticCurveTo(
      points[index].x,
      points[index].y,
      middle.x,
      middle.y
    );
  }

  const last = points[points.length - 1];
  const previous = points[points.length - 2];

  context.quadraticCurveTo(
    previous.x,
    previous.y,
    last.x,
    last.y
  );

  context.stroke();
}

function drawShape(context, stroke) {
  const first = stroke.points[0];
  const last = stroke.points[stroke.points.length - 1];

  if (!first || !last) return;

  const width = last.x - first.x;
  const height = last.y - first.y;

  context.beginPath();

  if (stroke.type === 'line') {
    context.moveTo(first.x, first.y);
    context.lineTo(last.x, last.y);
  }

  if (stroke.type === 'arrow') {
    const angle = Math.atan2(height, width);
    const head = Math.max(10, stroke.size * 3);

    context.moveTo(first.x, first.y);
    context.lineTo(last.x, last.y);
    context.moveTo(
      last.x - head * Math.cos(angle - Math.PI / 6),
      last.y - head * Math.sin(angle - Math.PI / 6)
    );
    context.lineTo(last.x, last.y);
    context.lineTo(
      last.x - head * Math.cos(angle + Math.PI / 6),
      last.y - head * Math.sin(angle + Math.PI / 6)
    );
  }

  if (stroke.type === 'rectangle') {
    context.rect(first.x, first.y, width, height);
  }

  if (stroke.type === 'circle') {
    const radius = Math.sqrt(
      width * width + height * height
    );

    context.arc(
      first.x,
      first.y,
      radius,
      0,
      Math.PI * 2
    );
  }

  context.stroke();
}

function configureContext(context, stroke, scale) {
  const tool = stroke.tool;

  context.globalCompositeOperation =
    tool === 'eraser'
      ? 'destination-out'
      : 'source-over';

  context.globalAlpha =
    tool === 'highlighter'
      ? stroke.opacity * 0.28
      : tool === 'marker'
        ? stroke.opacity * 0.55
        : stroke.opacity;

  context.lineCap =
    tool === 'calligraphy' ? 'square' : 'round';
  context.lineJoin = 'round';

  let width = stroke.size * scale;

  if (tool === 'marker') width *= 2.3;
  if (tool === 'highlighter') width *= 3;
  if (tool === 'spray') width *= 1.5;
  if (tool === 'calligraphy') width *= 0.8;

  context.lineWidth = Math.max(1, width);
  context.strokeStyle = stroke.color;

  if (tool === 'neon') {
    context.shadowBlur = stroke.glow || width * 2;
    context.shadowColor = stroke.color;
  } else if (tool === 'brush') {
    context.shadowBlur = 2;
    context.shadowColor = stroke.color;
  } else {
    context.shadowBlur = 0;
  }
}

export default function StoryDrawCanvas({
  visible = false,
  mediaWidth = 1080,
  mediaHeight = 1920,
  initialStrokes = [],
  onChange,
  onClose,
  onClear,
  onExport,
}) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const frameRef = useRef(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef(null);
  const lastPointRef = useRef(null);
  const mountedRef = useRef(true);

  const [strokes, setStrokes] = useState(() =>
    Array.isArray(initialStrokes)
      ? initialStrokes.map(normalizeStroke)
      : []
  );
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] =
    useState([]);
  const [tool, setTool] = useState('pen');
  const [shape, setShape] = useState(null);
  const [color, setColor] = useState('#ffffff');
  const [size, setSize] = useState(5);
  const [opacity, setOpacity] = useState(1);
  const [hardness, setHardness] = useState(0.8);
  const [smoothing, setSmoothing] = useState(0.65);
  const [glow, setGlow] = useState(18);
  const [layer, setLayer] = useState('default');
  const [symmetry, setSymmetry] =
    useState('none');
  const [showTools, setShowTools] =
    useState(true);

  const dimensions = useMemo(
    () => ({
      width: Math.max(1, Number(mediaWidth) || 1080),
      height: Math.max(1, Number(mediaHeight) || 1920),
    }),
    [mediaHeight, mediaWidth]
  );

  const getCanvasPoint = useCallback(
    (event) => {
      const canvas = canvasRef.current;

      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();

      if (!rect.width || !rect.height) return null;

      return normalizePoint({
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
        pressure:
          event.pressure > 0
            ? event.pressure
            : 0.5,
        tiltX: event.tiltX,
        tiltY: event.tiltY,
      });
    },
    []
  );

  const emitChange = useCallback(
    (nextStrokes) => {
      onChange?.(
        nextStrokes.map((stroke) => ({
          ...stroke,
          points: stroke.points.map(normalizePoint),
        }))
      );
    },
    [onChange]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext('2d');

    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width
      ? dimensions.width / rect.width
      : 1;
    const scaleY = rect.height
      ? dimensions.height / rect.height
      : 1;
    const scale = Math.max(scaleX, scaleY);

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    strokes.forEach((stroke) => {
      if (!stroke.points.length) return;

      const points = stroke.points.map((point) => ({
        x: point.x * canvas.width,
        y: point.y * canvas.height,
      }));

      const scaledStroke = {
        ...stroke,
        points,
      };

      context.save();
      configureContext(context, stroke, scale);

      if (stroke.type === 'freehand') {
        drawSmoothPath(context, points);
      } else {
        drawShape(context, scaledStroke);
      }

      if (symmetry === 'vertical') {
        context.save();
        context.translate(canvas.width, 0);
        context.scale(-1, 1);

        if (stroke.type === 'freehand') {
          drawSmoothPath(context, points);
        } else {
          drawShape(context, scaledStroke);
        }

        context.restore();
      }

      if (symmetry === 'horizontal') {
        context.save();
        context.translate(0, canvas.height);
        context.scale(1, -1);

        if (stroke.type === 'freehand') {
          drawSmoothPath(context, points);
        } else {
          drawShape(context, scaledStroke);
        }

        context.restore();
      }

      context.restore();
    });

    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
    context.shadowBlur = 0;
  }, [dimensions, strokes, symmetry]);

  const scheduleRender = useCallback(() => {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      render();
    });
  }, [render]);

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
    if (!visible) return undefined;

    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) return undefined;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;

      canvas.width = Math.max(
        1,
        Math.floor(rect.width * ratio)
      );
      canvas.height = Math.max(
        1,
        Math.floor(rect.height * ratio)
      );
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      scheduleRender();
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, [scheduleRender, visible]);

  useEffect(() => {
    scheduleRender();
  }, [scheduleRender, strokes]);

  const commitStrokes = useCallback(
    (nextStrokes) => {
      setHistory((current) => [
        ...current,
        strokes,
      ]);
      setRedoHistory([]);
      setStrokes(nextStrokes);
      emitChange(nextStrokes);
    },
    [emitChange, strokes]
  );

  const handlePointerDown = useCallback(
    (event) => {
      if (event.button !== undefined && event.button !== 0) {
        return;
      }

      const point = getCanvasPoint(event);

      if (!point) return;

      drawingRef.current = true;
      lastPointRef.current = point;

      const isShape = Boolean(shape);

      currentStrokeRef.current = normalizeStroke({
        id: makeId(),
        tool,
        color,
        size,
        opacity,
        hardness,
        smoothing,
        glow: tool === 'neon' ? glow : 0,
        layer,
        type: isShape ? shape : 'freehand',
        points: [point],
        pressureData: [point.pressure],
        timestamp: Date.now(),
      });

      event.currentTarget.setPointerCapture?.(
        event.pointerId
      );
    },
    [
      color,
      getCanvasPoint,
      glow,
      hardness,
      layer,
      opacity,
      shape,
      size,
      smoothing,
      tool,
    ]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!drawingRef.current) return;

      const point = getCanvasPoint(event);

      if (!point || !currentStrokeRef.current) return;

      const previous = lastPointRef.current;
      const smoothingAmount = clamp(
        smoothing,
        0,
        0.95
      );

      const nextPoint = previous
        ? normalizePoint({
            ...point,
            x:
              previous.x * smoothingAmount +
              point.x * (1 - smoothingAmount),
            y:
              previous.y * smoothingAmount +
              point.y * (1 - smoothingAmount),
          })
        : point;

      const current = currentStrokeRef.current;

      currentStrokeRef.current = {
        ...current,
        points: [...current.points, nextPoint],
        pressureData: [
          ...current.pressureData,
          nextPoint.pressure,
        ],
      };

      lastPointRef.current = nextPoint;
      scheduleRender();
    },
    [getCanvasPoint, scheduleRender, smoothing]
  );

  const handlePointerUp = useCallback(() => {
    if (!drawingRef.current) return;

    drawingRef.current = false;
    lastPointRef.current = null;

    const stroke = currentStrokeRef.current;
    currentStrokeRef.current = null;

    if (!stroke || stroke.points.length === 0) {
      return;
    }

    const nextStrokes = [...strokes, stroke];
    commitStrokes(nextStrokes);
  }, [commitStrokes, strokes]);

  const undo = useCallback(() => {
    const previous = history.at(-1);

    if (!previous) return;

    setRedoHistory((current) => [
      ...current,
      strokes,
    ]);
    setHistory((current) => current.slice(0, -1));
    setStrokes(previous);
    emitChange(previous);
  }, [emitChange, history, strokes]);

  const redo = useCallback(() => {
    const next = redoHistory.at(-1);

    if (!next) return;

    setHistory((current) => [...current, strokes]);
    setRedoHistory((current) => current.slice(0, -1));
    setStrokes(next);
    emitChange(next);
  }, [emitChange, redoHistory, strokes]);

  const clear = useCallback(() => {
    setHistory((current) => [...current, strokes]);
    setRedoHistory([]);
    setStrokes([]);
    emitChange([]);
    onClear?.();
  }, [emitChange, onClear, strokes]);

  const exportDrawing = useCallback(() => {
    const canvas = canvasRef.current;

    const payload = {
      width: dimensions.width,
      height: dimensions.height,
      layers: [
        {
          id: 'default',
          visible: true,
          opacity: 1,
          strokes,
        },
      ],
      strokes,
      json: JSON.stringify({
        width: dimensions.width,
        height: dimensions.height,
        strokes,
      }),
      pngDataUrl: canvas?.toDataURL('image/png') || null,
      svg: createSvg(strokes, dimensions),
    };

    onExport?.(payload);
    return payload;
  }, [dimensions, onExport, strokes]);

  const selectTool = useCallback((nextTool) => {
    setTool(nextTool);
    setShape(null);
  }, []);

  const selectShape = useCallback((nextShape) => {
    setShape(nextShape);
    setTool('pen');
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onClose?.();
        return;
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'z'
      ) {
        event.preventDefault();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'y'
      ) {
        event.preventDefault();
        redo();
      }
    },
    [onClose, redo, undo]
  );

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Story drawing canvas"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={styles.backdrop}
    >
      <div ref={wrapperRef} style={styles.canvasArea}>
        <canvas
          ref={canvasRef}
          aria-label="Story drawing canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={styles.canvas}
        />

        {symmetry !== 'none' ? (
          <div
            aria-hidden="true"
            style={{
              ...styles.symmetryGuide,
              ...(symmetry === 'vertical'
                ? styles.verticalGuide
                : styles.horizontalGuide),
            }}
          />
        ) : null}
      </div>

      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close drawing canvas"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <strong style={styles.title}>
          Draw on Story
        </strong>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={undo}
            disabled={!history.length}
            aria-label="Undo stroke"
            style={styles.iconButton}
          >
            <Undo2 size={17} />
          </button>

          <button
            type="button"
            onClick={redo}
            disabled={!redoHistory.length}
            aria-label="Redo stroke"
            style={styles.iconButton}
          >
            <Redo2 size={17} />
          </button>

          <button
            type="button"
            onClick={exportDrawing}
            aria-label="Export drawing"
            style={styles.exportButton}
          >
            <Check size={15} />
            Done
          </button>
        </div>
      </header>

      <div
        style={{
          ...styles.toolbar,
          transform: showTools
            ? 'translateY(0)'
            : 'translateY(calc(100% - 3.4rem))',
        }}
      >
        <button
          type="button"
          onClick={() => setShowTools((value) => !value)}
          aria-label={
            showTools ? 'Hide drawing tools' : 'Show drawing tools'
          }
          style={styles.collapseButton}
        >
          {showTools ? (
            <ChevronDown size={16} />
          ) : (
            <Plus size={16} />
          )}
        </button>

        <div style={styles.toolScroller}>
          {TOOLS.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => selectTool(id)}
              aria-pressed={tool === id && !shape}
              aria-label={label}
              style={{
                ...styles.toolButton,
                ...(tool === id && !shape
                  ? styles.activeTool
                  : {}),
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div style={styles.shapeRow}>
          {SHAPES.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => selectShape(id)}
              aria-pressed={shape === id}
              aria-label={label}
              style={{
                ...styles.shapeButton,
                ...(shape === id
                  ? styles.activeTool
                  : {}),
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div style={styles.controlRow}>
          <div style={styles.colorPalette}>
            {COLORS.map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setColor(value)}
                aria-label={`Use color ${value}`}
                style={{
                  ...styles.colorButton,
                  background: value,
                  ...(color === value
                    ? styles.selectedColor
                    : {}),
                }}
              />
            ))}

            <input
              type="color"
              value={color}
              onChange={(event) =>
                setColor(event.target.value)
              }
              aria-label="Custom stroke color"
              style={styles.colorPicker}
            />
          </div>

          <label style={styles.compactControl}>
            <span>Size</span>
            <input
              type="range"
              min="1"
              max="80"
              value={size}
              onChange={(event) =>
                setSize(Number(event.target.value))
              }
            />
            <output>{size}</output>
          </label>

          <label style={styles.compactControl}>
            <span>Opacity</span>
            <input
              type="range"
              min="0"
              max="1"
              step=".01"
              value={opacity}
              onChange={(event) =>
                setOpacity(Number(event.target.value))
              }
            />
            <output>
              {Math.round(opacity * 100)}%
            </output>
          </label>

          <label style={styles.compactControl}>
            <span>Smoothing</span>
            <input
              type="range"
              min="0"
              max=".95"
              step=".05"
              value={smoothing}
              onChange={(event) =>
                setSmoothing(Number(event.target.value))
              }
            />
          </label>
        </div>

        <div style={styles.bottomActions}>
          <label style={styles.layerSelect}>
            Layer
            <select
              value={layer}
              onChange={(event) =>
                setLayer(event.target.value)
              }
              aria-label="Drawing layer"
            >
              <option value="default">Default</option>
              <option value="foreground">Foreground</option>
              <option value="background">Background</option>
            </select>
          </label>

          <label style={styles.layerSelect}>
            Symmetry
            <select
              value={symmetry}
              onChange={(event) =>
                setSymmetry(event.target.value)
              }
              aria-label="Symmetry mode"
            >
              <option value="none">Off</option>
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
              <option value="radial">Radial foundation</option>
            </select>
          </label>

          <button
            type="button"
            onClick={clear}
            aria-label="Clear drawing"
            style={styles.clearButton}
          >
            <Trash2 size={15} />
            Clear
          </button>
        </div>
      </div>

      <style>{`
        .aarush-story-draw-tool:hover,
        .aarush-story-draw-icon:hover {
          transform: translateY(-1px);
        }

        @keyframes aarush-draw-slide-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-draw-glow {
          0%, 100% {
            box-shadow: 0 0 14px rgba(124,92,255,.18);
          }
          50% {
            box-shadow: 0 0 24px rgba(77,215,255,.3);
          }
        }

        @media (max-width: 600px) {
          .aarush-story-draw-toolbar {
            max-height: 68vh !important;
          }

          .aarush-story-draw-tool span {
            display: none;
          }

          .aarush-story-draw-tool {
            min-width: 2.8rem !important;
          }

          .aarush-story-draw-control {
            grid-template-columns: 4.3rem 1fr 2.2rem !important;
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

function createSvg(strokes, dimensions) {
  const paths = strokes
    .filter((stroke) => stroke.points?.length)
    .map((stroke) => {
      const points = stroke.points.map((point) => ({
        x: point.x * dimensions.width,
        y: point.y * dimensions.height,
      }));

      const path = points
        .map((point, index) =>
          index === 0
            ? `M ${point.x} ${point.y}`
            : `L ${point.x} ${point.y}`
        )
        .join(' ');

      return `<path d="${path}" fill="none" stroke="${stroke.color}" stroke-width="${stroke.size}" stroke-opacity="${stroke.opacity}" stroke-linecap="round" stroke-linejoin="round" />`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}">${paths}</svg>`;
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'rgba(2,5,10,.82)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  canvasArea: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    background: 'transparent',
    touchAction: 'none',
  },

  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    touchAction: 'none',
    cursor: 'crosshair',
  },

  symmetryGuide: {
    position: 'absolute',
    zIndex: 1,
    pointerEvents: 'none',
    opacity: 0.28,
    background: '#4dd7ff',
  },

  verticalGuide: {
    top: 0,
    bottom: 0,
    left: '50%',
    width: '1px',
  },

  horizontalGuide: {
    top: '50%',
    right: 0,
    left: 0,
    height: '1px',
  },

  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 10,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.6rem',
    padding:
      'calc(.7rem + env(safe-area-inset-top)) .8rem .7rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.62)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  title: {
    color: '#f4f7ff',
    fontSize: '.92rem',
    fontWeight: 850,
    textAlign: 'center',
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
  },

  iconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.06)',
    cursor: 'pointer',
  },

  exportButton: {
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
    fontSize: '.64rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  toolbar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    maxHeight: '62vh',
    overflowY: 'auto',
    padding:
      '.65rem .7rem calc(.8rem + env(safe-area-inset-bottom))',
    borderTop: '1px solid rgba(255,255,255,.09)',
    borderRadius: '1.25rem 1.25rem 0 0',
    background:
      'linear-gradient(180deg,rgba(20,26,43,.9),rgba(7,10,18,.97))',
    boxShadow: '0 -20px 55px rgba(0,0,0,.42)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    transition: 'transform 220ms ease',
    animation: 'aarush-draw-slide-up 240ms ease both',
  },

  collapseButton: {
    position: 'absolute',
    top: '-1.9rem',
    left: '50%',
    width: '3rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.12)',
    borderBottom: 0,
    borderRadius: '.8rem .8rem 0 0',
    color: '#dce5f8',
    background: 'rgba(20,26,43,.9)',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
  },

  toolScroller: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    paddingBottom: '.45rem',
  },

  toolButton: {
    minWidth: '4rem',
    minHeight: '3rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.2rem',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#9aa7c1',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
    transition: 'transform 180ms ease, all 180ms ease',
  },

  activeTool: {
    borderColor: 'rgba(124,92,255,.5)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.28),rgba(77,215,255,.12))',
    boxShadow: '0 0 18px rgba(124,92,255,.2)',
  },

  shapeRow: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    padding: '.45rem 0',
    borderTop: '1px solid rgba(255,255,255,.07)',
  },

  shapeButton: {
    minHeight: '2.15rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    flexShrink: 0,
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  controlRow: {
    display: 'grid',
    gap: '.5rem',
    paddingTop: '.45rem',
    borderTop: '1px solid rgba(255,255,255,.07)',
  },

  colorPalette: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '.35rem',
  },

  colorButton: {
    width: '1.7rem',
    height: '1.7rem',
    border: '2px solid transparent',
    borderRadius: '999px',
    cursor: 'pointer',
  },

  selectedColor: {
    borderColor: '#fff',
    boxShadow: '0 0 0 2px #7c5cff',
  },

  colorPicker: {
    width: '1.9rem',
    height: '1.9rem',
    padding: 0,
    border: '1px solid rgba(255,255,255,.2)',
    borderRadius: '999px',
    overflow: 'hidden',
    cursor: 'pointer',
  },

  compactControl: {
    display: 'grid',
    gridTemplateColumns: '5rem 1fr 2.2rem',
    alignItems: 'center',
    gap: '.5rem',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  compactControlInput: {
    width: '100%',
    accentColor: '#7c5cff',
  },

  compactControlOutput: {
    color: '#9deeff',
    textAlign: 'right',
  },

  bottomActions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '.4rem',
    marginTop: '.55rem',
    paddingTop: '.55rem',
    borderTop: '1px solid rgba(255,255,255,.07)',
  },

  layerSelect: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  layerSelectSelect: {
    minHeight: '2.15rem',
    padding: '0 .45rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.55rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.62rem',
  },

  clearButton: {
    minHeight: '2.15rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    marginLeft: 'auto',
    padding: '0 .55rem',
    border: '1px solid rgba(255,91,132,.22)',
    borderRadius: '.6rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },
};