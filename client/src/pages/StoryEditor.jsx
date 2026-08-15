import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Circle,
  Eraser,
  Image as ImageIcon,
  Layers,
  Music,
  Pause,
  Pencil,
  Play,
  Plus,
  Redo2,
  RotateCw,
  Send,
  SlidersHorizontal,
  Sparkles,
  Square,
  Sticker,
  Type,
  Undo2,
  X,
} from 'lucide-react';
import {
  createStory,
  prepareStoryPayload,
  uploadStoryMedia,
} from '../utils/storyEngine';

const FILTERS = [
  ['Aarush', 'none'],
  ['Vivid', 'saturate(1.45) contrast(1.08)'],
  ['Moody', 'brightness(.78) contrast(1.2) saturate(.75)'],
  ['Retro', 'sepia(.35) saturate(1.25) contrast(.95)'],
  ['Black & White', 'grayscale(1) contrast(1.1)'],
  ['Neon', 'saturate(1.8) contrast(1.2) hue-rotate(18deg)'],
  ['Sunset', 'sepia(.22) saturate(1.5) hue-rotate(-12deg)'],
  ['Night', 'brightness(.62) contrast(1.28) saturate(.8)'],
  ['Cinematic', 'contrast(1.24) saturate(.86) sepia(.1)'],
];

const PRIVACY_OPTIONS = [
  ['public', 'Public'],
  ['followers', 'Followers'],
  ['close_friends', 'Close Friends'],
  ['only_me', 'Only Me'],
];

const STICKERS = [
  'Emoji',
  'GIF',
  'Location',
  'Mention',
  'Hashtag',
  'Poll',
  'Question',
  'Countdown',
  'Link',
  'Time',
  'Date',
  'Weather',
];

const DEFAULT_ADJUSTMENTS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  blur: 0,
  vignette: 0,
};

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function validMedia(media) {
  return Boolean(
    media &&
      media.url &&
      (media.type === 'image' || media.type === 'video')
  );
}

function filterStyle(filterValue, adjustments) {
  const warmth =
    adjustments.warmth > 0
      ? `sepia(${adjustments.warmth / 180})`
      : '';

  return [
    filterValue,
    `brightness(${adjustments.brightness}%)`,
    `contrast(${adjustments.contrast}%)`,
    `saturate(${adjustments.saturation}%)`,
    warmth,
    `blur(${adjustments.blur}px)`,
  ]
    .filter(Boolean)
    .join(' ');
}

export default function StoryEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const media = location.state?.media;
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const drawingRef = useRef(false);
  const textDragRef = useRef(null);

  const [filter, setFilter] = useState(FILTERS[0]);
  const [crop, setCrop] = useState('9:16');
  const [rotation, setRotation] = useState(0);
  const [adjustments, setAdjustments] = useState(
    DEFAULT_ADJUSTMENTS
  );
  const [activeTool, setActiveTool] = useState('filters');
  const [textLayers, setTextLayers] = useState([]);
  const [selectedTextId, setSelectedTextId] =
    useState(null);
  const [textValue, setTextValue] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textFont, setTextFont] = useState('Inter');
  const [textAlign, setTextAlign] = useState('center');
  const [drawMode, setDrawMode] = useState('pen');
  const [drawColor, setDrawColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [drawHistory, setDrawHistory] = useState([]);
  const [drawRedo, setDrawRedo] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [privacy, setPrivacy] = useState('public');
  const [musicSearch, setMusicSearch] = useState('');
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState('');
  const [notice, setNotice] = useState('');

  const isVideo = media?.type === 'video';

  const composedFilter = useMemo(
    () => filterStyle(filter[1], adjustments),
    [adjustments, filter]
  );

  const previewStyle = useMemo(
    () => ({
      ...styles.media,
      filter: composedFilter,
      transform: `rotate(${rotation}deg)`,
    }),
    [composedFilter, rotation]
  );

  useEffect(() => {
    if (!validMedia(media)) {
      setPostError('No valid story media was provided.');
    }
  }, [media]);

  useEffect(() => {
    return () => {
      if (media?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(media.url);
      }
    };
  }, [media?.url]);

  useEffect(() => {
    if (!selectedTextId) return;

    const selected = textLayers.find(
      (layer) => layer.id === selectedTextId
    );

    if (selected) {
      setTextValue(selected.text);
      setTextColor(selected.color);
      setTextFont(selected.font);
      setTextAlign(selected.align);
    }
  }, [selectedTextId, textLayers]);

  useEffect(() => {
    if (!canvasRef.current || !stageRef.current) {
      return undefined;
    }

    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const resize = () => {
      const rect = stage.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const ratio = window.devicePixelRatio || 1;

      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext('2d');
      context?.scale(ratio, ratio);
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [activeTool, previewOpen]);

  const updateAdjustment = useCallback((name, value) => {
    setAdjustments((current) => ({
      ...current,
      [name]: Number(value),
    }));
  }, []);

  const resetAdjustments = useCallback(() => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setRotation(0);
    setCrop('9:16');
    setFilter(FILTERS[0]);
  }, []);

  const toggleVideo = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const addText = useCallback(() => {
    const layer = {
      id: `text-${Date.now()}`,
      text: 'Aarush Story',
      color: '#ffffff',
      font: 'Inter',
      align: 'center',
      x: 50,
      y: 45,
      scale: 1,
      rotate: 0,
      background: false,
      shadow: true,
    };

    setTextLayers((current) => [...current, layer]);
    setSelectedTextId(layer.id);
    setTextValue(layer.text);
    setActiveTool('text');
  }, []);

  const updateSelectedText = useCallback(
    (changes) => {
      if (!selectedTextId) return;

      setTextLayers((current) =>
        current.map((layer) =>
          layer.id === selectedTextId
            ? { ...layer, ...changes }
            : layer
        )
      );
    },
    [selectedTextId]
  );

  const changeText = useCallback(
    (value) => {
      setTextValue(value);
      updateSelectedText({ text: value });
    },
    [updateSelectedText]
  );

  const handleTextPointerDown = useCallback(
    (event, layer) => {
      event.stopPropagation();
      setSelectedTextId(layer.id);
      textDragRef.current = {
        id: layer.id,
        startX: event.clientX,
        startY: event.clientY,
        originX: layer.x,
        originY: layer.y,
      };

      event.currentTarget.setPointerCapture?.(
        event.pointerId
      );
    },
    []
  );

  const handleTextPointerMove = useCallback((event) => {
    const drag = textDragRef.current;

    if (!drag || !stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    const deltaX =
      ((event.clientX - drag.startX) / rect.width) * 100;
    const deltaY =
      ((event.clientY - drag.startY) / rect.height) * 100;

    setTextLayers((current) =>
      current.map((layer) =>
        layer.id === drag.id
          ? {
              ...layer,
              x: clamp(drag.originX + deltaX, 5, 95),
              y: clamp(drag.originY + deltaY, 5, 95),
            }
          : layer
      )
    );
  }, []);

  const stopTextDrag = useCallback(() => {
    textDragRef.current = null;
  }, []);

  const drawPoint = useCallback(
    (event) => {
      if (!drawingRef.current || !canvasRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const context = canvas.getContext('2d');

      if (!context) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth =
        drawMode === 'marker'
          ? brushSize * 2.2
          : brushSize;
      context.globalAlpha =
        drawMode === 'highlighter' ? 0.3 : 1;
      context.globalCompositeOperation =
        drawMode === 'eraser'
          ? 'destination-out'
          : 'source-over';
      context.strokeStyle =
        drawMode === 'neon'
          ? '#4dd7ff'
          : drawColor;
      context.shadowBlur =
        drawMode === 'neon' ? 14 : 0;
      context.shadowColor =
        drawMode === 'neon' ? drawColor : 'transparent';

      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);
    },
    [brushSize, drawColor, drawMode]
  );

  const startDrawing = useCallback(
    (event) => {
      if (!canvasRef.current) return;

      drawingRef.current = true;

      const context = canvasRef.current.getContext('2d');
      const rect = canvasRef.current.getBoundingClientRect();

      if (!context) return;

      setDrawHistory((current) => [
        ...current,
        canvasRef.current.toDataURL(),
      ]);
      setDrawRedo([]);

      context.beginPath();
      context.moveTo(
        event.clientX - rect.left,
        event.clientY - rect.top
      );
    },
    []
  );

  const stopDrawing = useCallback(() => {
    drawingRef.current = false;

    const context = canvasRef.current?.getContext('2d');
    context?.beginPath();
  }, []);

  const undoDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    const previous = drawHistory.at(-1);

    if (!canvas || !previous) return;

    const current = canvas.toDataURL();
    const image = new Image();

    image.onload = () => {
      const context = canvas.getContext('2d');
      context?.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
      context?.drawImage(
        image,
        0,
        0,
        canvas.clientWidth,
        canvas.clientHeight
      );
    };

    image.src = previous;
    setDrawHistory((currentHistory) =>
      currentHistory.slice(0, -1)
    );
    setDrawRedo((currentRedo) => [...currentRedo, current]);
  }, [drawHistory]);

  const clearDrawing = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext('2d');
    context?.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
    setDrawHistory([]);
    setDrawRedo([]);
  }, []);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const publishStory = useCallback(async () => {
    if (!validMedia(media)) {
      setPostError('A valid image or video is required.');
      return;
    }

    setPosting(true);
    setPostError('');
    setPrivacyOpen(false);

    try {
      const payload = prepareStoryPayload({
        media,
        filter: filter[0],
        crop,
        rotation,
        adjustments,
        textLayers,
        privacy,
        music: {
          search: musicSearch,
          start: 0,
          end: 0,
          volume: 1,
          originalVolume: 1,
          beatSync: false,
          fadeIn: false,
          fadeOut: false,
        },
      });

      const uploaded = await uploadStoryMedia(
        media.file || media.blob || media
      );

      await createStory({
        ...payload,
        media: uploaded || payload.media,
      });

      if (mountedRef.current) {
        setPostSuccess(true);

        window.setTimeout(() => {
          navigate('/home', {
            replace: true,
            state: {
              storyPosted: true,
            },
          });
        }, 1400);
      }
    } catch (postError) {
      if (mountedRef.current) {
        setPostError(
          postError?.message ||
            'Story could not be posted.'
        );
      }
    } finally {
      if (mountedRef.current) {
        setPosting(false);
      }
    }
  }, [
    adjustments,
    crop,
    filter,
    media,
    musicSearch,
    navigate,
    privacy,
    rotation,
    textLayers,
  ]);

  if (!validMedia(media)) {
    return (
      <main style={styles.page}>
        <header style={styles.topBar}>
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            style={styles.iconButton}
          >
            <ArrowLeft size={19} />
          </button>

          <strong>Edit Story</strong>
          <span />
        </header>

        <section style={styles.emptyState}>
          <ImageIcon size={34} />
          <h1>Media unavailable</h1>
          <p>
            Select a photo or video to continue editing
            your story.
          </p>

          <button
            type="button"
            onClick={() => navigate('/story-camera')}
            style={styles.primaryButton}
          >
            Open Story Camera
          </button>
        </section>
      </main>
    );
  }

  if (postSuccess) {
    return (
      <main style={styles.successPage}>
        <div style={styles.successIcon}>
          <Check size={34} />
        </div>
        <h1>Story posted</h1>
        <p>Your story is now ready for Aarush.</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.topBar}>
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          style={styles.iconButton}
        >
          <ArrowLeft size={19} />
        </button>

        <strong>Edit Story</strong>

        <div style={styles.topActions}>
          <button
            type="button"
            aria-label="Undo"
            onClick={undoDrawing}
            style={styles.iconButton}
          >
            <Undo2 size={17} />
          </button>

          <button
            type="button"
            aria-label="Redo"
            style={styles.iconButton}
          >
            <Redo2 size={17} />
          </button>
        </div>
      </header>

      <section
        ref={stageRef}
        style={{
          ...styles.preview,
          aspectRatio:
            crop === '1:1'
              ? '1 / 1'
              : crop === '4:5'
                ? '4 / 5'
                : '9 / 16',
        }}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={media.url}
            loop
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            style={previewStyle}
          />
        ) : (
          <img
            src={media.url}
            alt="Story preview"
            style={previewStyle}
          />
        )}

        {isVideo ? (
          <button
            type="button"
            onClick={toggleVideo}
            aria-label={
              playing ? 'Pause video' : 'Play video'
            }
            style={styles.playButton}
          >
            {playing ? (
              <Pause size={22} />
            ) : (
              <Play size={22} />
            )}
          </button>
        ) : null}

        <div
          style={{
            ...styles.vignette,
            opacity: adjustments.vignette / 100,
          }}
        />

        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={drawPoint}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          style={{
            ...styles.drawCanvas,
            display:
              activeTool === 'draw' ? 'block' : 'none',
          }}
        />

        {textLayers.map((layer) => (
          <button
            type="button"
            key={layer.id}
            onPointerDown={(event) =>
              handleTextPointerDown(event, layer)
            }
            onPointerMove={handleTextPointerMove}
            onPointerUp={stopTextDrag}
            style={{
              ...styles.textLayer,
              left: `${layer.x}%`,
              top: `${layer.y}%`,
              color: layer.color,
              fontFamily: layer.font,
              textAlign: layer.align,
              transform: `translate(-50%, -50%) rotate(${layer.rotate}deg) scale(${layer.scale})`,
              background: layer.background
                ? 'rgba(0,0,0,.42)'
                : 'transparent',
              textShadow: layer.shadow
                ? '0 2px 9px rgba(0,0,0,.72)'
                : 'none',
              outline:
                selectedTextId === layer.id
                  ? '1px dashed rgba(255,255,255,.75)'
                  : 'none',
            }}
          >
            {layer.text}
          </button>
        ))}
      </section>

      {postError ? (
        <div role="alert" style={styles.error}>
          <span>{postError}</span>
          <button
            type="button"
            onClick={() => setPostError('')}
            style={styles.closeError}
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      {notice ? (
        <div role="status" style={styles.notice}>
          {notice}
        </div>
      ) : null}

      <section style={styles.toolPanel}>
        <div style={styles.toolTabs}>
          {[
            ['filters', Sparkles, 'Filters'],
            ['adjust', SlidersHorizontal, 'Adjust'],
            ['text', Type, 'Text'],
            ['draw', Pencil, 'Draw'],
            ['stickers', Sticker, 'Stickers'],
            ['music', Music, 'Music'],
          ].map(([id, Icon, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => {
                if (id === 'stickers') {
                  setStickerOpen(true);
                  return;
                }

                if (id === 'music') {
                  setMusicOpen(true);
                  return;
                }

                setActiveTool(id);
              }}
              style={{
                ...styles.toolTab,
                ...(activeTool === id
                  ? styles.activeToolTab
                  : {}),
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {activeTool === 'filters' ? (
          <div style={styles.filterScroller}>
            {FILTERS.map(([name, value]) => (
              <button
                type="button"
                key={name}
                onClick={() => setFilter([name, value])}
                style={{
                  ...styles.filterButton,
                  ...(filter[0] === name
                    ? styles.activeFilter
                    : {}),
                }}
              >
                <span
                  style={{
                    ...styles.filterPreview,
                    filter: value,
                  }}
                >
                  {isVideo ? (
                    <Video size={16} />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                </span>
                <span>{name}</span>
              </button>
            ))}
          </div>
        ) : null}

        {activeTool === 'adjust' ? (
          <div style={styles.adjustPanel}>
            <div style={styles.adjustHeader}>
              <div style={styles.cropGroup}>
                {['9:16', '1:1', '4:5', 'Free'].map(
                  (value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setCrop(value)}
                      style={{
                        ...styles.cropButton,
                        ...(crop === value
                          ? styles.activeCrop
                          : {}),
                      }}
                    >
                      {value}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setRotation((value) => (value + 90) % 360)
                }
                style={styles.smallAction}
              >
                <RotateCw size={15} />
                Rotate
              </button>

              <button
                type="button"
                onClick={resetAdjustments}
                style={styles.smallAction}
              >
                Reset
              </button>
            </div>

            {[
              ['brightness', 'Brightness', 40, 180],
              ['contrast', 'Contrast', 40, 180],
              ['saturation', 'Saturation', 0, 200],
              ['warmth', 'Warmth', -100, 100],
              ['blur', 'Blur', 0, 12],
              ['vignette', 'Vignette', 0, 100],
            ].map(([id, label, min, max]) => (
              <label key={id} style={styles.sliderRow}>
                <span>{label}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={adjustments[id]}
                  onChange={(event) =>
                    updateAdjustment(
                      id,
                      event.target.value
                    )
                  }
                />
              </label>
            ))}
          </div>
        ) : null}

        {activeTool === 'text' ? (
          <div style={styles.editorPanel}>
            <button
              type="button"
              onClick={addText}
              style={styles.primarySmall}
            >
              <Plus size={15} />
              Add Text
            </button>

            {selectedTextId ? (
              <>
                <input
                  value={textValue}
                  onChange={(event) =>
                    changeText(event.target.value)
                  }
                  placeholder="Type your story text"
                  style={styles.textInput}
                />

                <div style={styles.optionRow}>
                  {['Inter', 'serif', 'monospace'].map(
                    (font) => (
                      <button
                        type="button"
                        key={font}
                        onClick={() => {
                          setTextFont(font);
                          updateSelectedText({
                            font,
                          });
                        }}
                        style={{
                          ...styles.optionButton,
                          ...(textFont === font
                            ? styles.selectedOption
                            : {}),
                        }}
                      >
                        {font}
                      </button>
                    )
                  )}
                </div>

                <div style={styles.optionRow}>
                  {[
                    '#ffffff',
                    '#000000',
                    '#ff4fd8',
                    '#4dd7ff',
                    '#ffd27d',
                    '#82e9c1',
                  ].map((color) => (
                    <button
                      type="button"
                      key={color}
                      aria-label={`Text color ${color}`}
                      onClick={() => {
                        setTextColor(color);
                        updateSelectedText({
                          color,
                        });
                      }}
                      style={{
                        ...styles.colorButton,
                        background: color,
                        ...(textColor === color
                          ? styles.selectedColor
                          : {}),
                      }}
                    />
                  ))}
                </div>

                <div style={styles.optionRow}>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedText({
                        background: true,
                      })
                    }
                    style={styles.optionButton}
                  >
                    Highlight
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedText({
                        shadow: true,
                      })
                    }
                    style={styles.optionButton}
                  >
                    Shadow
                  </button>

                  {['left', 'center', 'right'].map(
                    (align) => (
                      <button
                        type="button"
                        key={align}
                        onClick={() => {
                          setTextAlign(align);
                          updateSelectedText({
                            align,
                          });
                        }}
                        style={{
                          ...styles.optionButton,
                          ...(textAlign === align
                            ? styles.selectedOption
                            : {}),
                        }}
                      >
                        {align}
                      </button>
                    )
                  )}
                </div>
              </>
            ) : (
              <span style={styles.helperText}>
                Add a text layer, then select it to edit.
              </span>
            )}
          </div>
        ) : null}

        {activeTool === 'draw' ? (
          <div style={styles.editorPanel}>
            <div style={styles.optionRow}>
              {['pen', 'marker', 'highlighter', 'neon', 'eraser'].map(
                (mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setDrawMode(mode)}
                    style={{
                      ...styles.optionButton,
                      ...(drawMode === mode
                        ? styles.selectedOption
                        : {}),
                    }}
                  >
                    {mode}
                  </button>
                )
              )}
            </div>

            <label style={styles.sliderRow}>
              <span>Brush size</span>
              <input
                type="range"
                min="1"
                max="32"
                value={brushSize}
                onChange={(event) =>
                  setBrushSize(Number(event.target.value))
                }
              />
            </label>

            <div style={styles.optionRow}>
              {[
                '#ffffff',
                '#000000',
                '#ff4fd8',
                '#4dd7ff',
                '#ffd27d',
                '#82e9c1',
              ].map((color) => (
                <button
                  type="button"
                  key={color}
                  aria-label={`Brush color ${color}`}
                  onClick={() => setDrawColor(color)}
                  style={{
                    ...styles.colorButton,
                    background: color,
                    ...(drawColor === color
                      ? styles.selectedColor
                      : {}),
                  }}
                />
              ))}

              <button
                type="button"
                onClick={clearDrawing}
                style={styles.smallAction}
              >
                <Eraser size={15} />
                Clear
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <footer style={styles.bottomBar}>
        <button
          type="button"
          onClick={() => setPrivacyOpen(true)}
          style={styles.privacyButton}
        >
          <span>Post to</span>
          <strong>
            {PRIVACY_OPTIONS.find(
              ([id]) => id === privacy
            )?.[1] || 'Public'}
          </strong>
          <ChevronDown size={15} />
        </button>

        <button
          type="button"
          disabled={posting}
          onClick={publishStory}
          style={styles.postButton}
        >
          {posting ? (
            <Circle
              size={16}
              style={styles.loadingIcon}
            />
          ) : (
            <Send size={16} />
          )}
          {posting ? 'Posting…' : 'Post Story'}
        </button>
      </footer>

      {stickerOpen ? (
        <Overlay
          title="Stickers"
          onClose={() => setStickerOpen(false)}
        >
          <div style={styles.stickerGrid}>
            {STICKERS.map((sticker) => (
              <button
                type="button"
                key={sticker}
                onClick={() => {
                  setStickerOpen(false);
                  setNotice(`${sticker} foundation ready.`);
                }}
                style={styles.stickerButton}
              >
                <Sticker size={17} />
                {sticker}
              </button>
            ))}
          </div>
        </Overlay>
      ) : null}

      {musicOpen ? (
        <Overlay
          title="Add Music"
          onClose={() => setMusicOpen(false)}
        >
          <input
            value={musicSearch}
            onChange={(event) =>
              setMusicSearch(event.target.value)
            }
            placeholder="Search music"
            style={styles.textInput}
          />

          <h3 style={styles.subheading}>
            Trending music
          </h3>

          <div style={styles.musicPlaceholder}>
            <Music size={23} />
            <span>
              Music timeline, waveform, beat sync, fade in,
              fade out, and segment selection are ready for
              future integration.
            </span>
          </div>

          <h3 style={styles.subheading}>
            Recently used
          </h3>
        </Overlay>
      ) : null}

      {privacyOpen ? (
        <Overlay
          title="Story privacy"
          onClose={() => setPrivacyOpen(false)}
        >
          <div style={styles.privacyList}>
            {PRIVACY_OPTIONS.map(([id, label]) => (
              <button
                type="button"
                key={id}
                onClick={() => {
                  setPrivacy(id);
                  setPrivacyOpen(false);
                }}
                style={{
                  ...styles.privacyOption,
                  ...(privacy === id
                    ? styles.selectedPrivacy
                    : {}),
                }}
              >
                <span>{label}</span>
                {privacy === id ? (
                  <Check size={17} />
                ) : null}
              </button>
            ))}
          </div>
        </Overlay>
      ) : null}

      {previewOpen ? (
        <div style={styles.fullPreview}>
          <button
            type="button"
            onClick={() => setPreviewOpen(false)}
            aria-label="Exit preview"
            style={styles.previewClose}
          >
            <X size={20} />
          </button>

          {isVideo ? (
            <video
              src={media.url}
              autoPlay
              loop
              controls
              playsInline
              style={previewStyle}
            />
          ) : (
            <img
              src={media.url}
              alt="Full story preview"
              style={previewStyle}
            />
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        aria-label="Preview story"
        style={styles.previewToggle}
      >
        <Play size={15} />
        Preview
      </button>

      <style>{`
        @keyframes aarush-editor-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes aarush-editor-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .aarush-editor-filter:hover,
        .aarush-editor-tool:hover,
        .aarush-editor-action:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        .aarush-editor-range {
          accent-color: #7c5cff;
        }

        @media (max-width: 480px) {
          .aarush-editor-tool-label {
            display: none;
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

function Overlay({ title, onClose, children }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={styles.overlay}
      onClick={onClose}
    >
      <section
        style={styles.sheet}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={styles.sheetHeader}>
          <strong>{title}</strong>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            style={styles.iconButton}
          >
            <X size={17} />
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '7rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.52),#07090e 65%)',
  },

  topBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    minHeight: '3.7rem',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem .8rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.84)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  topActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '.35rem',
  },

  iconButton: {
    width: '2.35rem',
    height: '2.35rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  preview: {
    position: 'relative',
    width: 'min(100%, 530px)',
    maxHeight: '62vh',
    margin: '.85rem auto 0',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '1.35rem',
    background: '#080b13',
    boxShadow: '0 20px 65px rgba(0,0,0,.35)',
    transition: 'aspect-ratio 220ms ease',
  },

  media: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
    transition: 'filter 220ms ease, transform 220ms ease',
  },

  vignette: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'radial-gradient(circle,transparent 42%,rgba(0,0,0,.78) 100%)',
  },

  drawCanvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    touchAction: 'none',
    cursor: 'crosshair',
  },

  textLayer: {
    position: 'absolute',
    zIndex: 3,
    maxWidth: '90%',
    padding: '.25rem .45rem',
    border: 0,
    borderRadius: '.25rem',
    fontSize: '1.55rem',
    fontWeight: 800,
    whiteSpace: 'pre-wrap',
    cursor: 'move',
    userSelect: 'none',
  },

  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 4,
    width: '3.4rem',
    height: '3.4rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.2)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(0,0,0,.42)',
    transform: 'translate(-50%,-50%)',
    cursor: 'pointer',
  },

  toolPanel: {
    width: 'min(100%, 760px)',
    margin: '.85rem auto 0',
    padding: '.75rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.15rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.2)',
  },

  toolTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6,1fr)',
    gap: '.25rem',
  },

  toolTab: {
    minHeight: '2.55rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.18rem',
    border: 0,
    borderRadius: '.7rem',
    color: '#8491ad',
    background: 'transparent',
    fontSize: '.58rem',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 180ms ease',
  },

  activeToolTab: {
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.12))',
  },

  filterScroller: {
    display: 'flex',
    gap: '.5rem',
    overflowX: 'auto',
    padding: '.75rem .1rem .1rem',
  },

  filterButton: {
    minWidth: '4.2rem',
    display: 'grid',
    justifyItems: 'center',
    gap: '.3rem',
    padding: 0,
    border: 0,
    color: '#9aa7c1',
    background: 'transparent',
    fontSize: '.58rem',
    cursor: 'pointer',
    transition: 'transform 180ms ease',
  },

  activeFilter: {
    color: '#fff',
  },

  filterPreview: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.16)',
    borderRadius: '.8rem',
    color: '#dce5f8',
    background:
      'linear-gradient(135deg,#18213a,#39244b)',
  },

  adjustPanel: {
    display: 'grid',
    gap: '.6rem',
    padding: '.75rem .1rem .1rem',
    animation: 'aarush-editor-in 180ms ease',
  },

  adjustHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '.4rem',
  },

  cropGroup: {
    display: 'flex',
    gap: '.25rem',
    flex: 1,
  },

  cropButton: {
    minHeight: '2rem',
    padding: '0 .45rem',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: '.55rem',
    color: '#9aa7c1',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  activeCrop: {
    color: '#fff',
    borderColor: 'rgba(124,92,255,.45)',
    background: 'rgba(124,92,255,.16)',
  },

  smallAction: {
    minHeight: '2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: '.55rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  sliderRow: {
    display: 'grid',
    gridTemplateColumns: '6rem 1fr',
    alignItems: 'center',
    gap: '.55rem',
    color: '#aab6cf',
    fontSize: '.65rem',
  },

  editorPanel: {
    display: 'grid',
    gap: '.6rem',
    padding: '.75rem .1rem .1rem',
    animation: 'aarush-editor-in 180ms ease',
  },

  primarySmall: {
    width: 'fit-content',
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .7rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  textInput: {
    width: '100%',
    minHeight: '2.45rem',
    boxSizing: 'border-box',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 'none',
    color: '#fff',
    background: 'rgba(255,255,255,.06)',
    fontSize: '.72rem',
  },

  optionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  optionButton: {
    minHeight: '2rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: '.55rem',
    color: '#b9c5db',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  selectedOption: {
    color: '#fff',
    borderColor: 'rgba(124,92,255,.45)',
    background: 'rgba(124,92,255,.18)',
  },

  colorButton: {
    width: '1.55rem',
    height: '1.55rem',
    border: '2px solid transparent',
    borderRadius: '999px',
    cursor: 'pointer',
  },

  selectedColor: {
    borderColor: '#fff',
    boxShadow: '0 0 0 2px #7c5cff',
  },

  helperText: {
    color: '#8491ad',
    fontSize: '.68rem',
  },

  bottomBar: {
    position: 'fixed',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.65rem',
    padding: '.7rem .85rem calc(.8rem + env(safe-area-inset-bottom))',
    borderTop: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  privacyButton: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: '.75rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  privacyButtonStrong: {
    color: '#fff',
  },

  postButton: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
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

  loadingIcon: {
    animation: 'aarush-editor-spin 800ms linear infinite',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '.8rem',
    background: 'rgba(2,5,10,.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  sheet: {
    width: 'min(100%, 560px)',
    maxHeight: '78vh',
    overflowY: 'auto',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.28)',
    borderRadius: '1.35rem',
    color: '#f4f7ff',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
    animation: 'aarush-editor-in 220ms ease',
  },

  sheetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '.8rem',
  },

  stickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  stickerButton: {
    minHeight: '2.55rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  musicPlaceholder: {
    display: 'grid',
    justifyItems: 'center',
    gap: '.5rem',
    padding: '1.5rem',
    border: '1px dashed rgba(124,92,255,.35)',
    borderRadius: '1rem',
    color: '#9aa7c1',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.7rem',
    lineHeight: 1.5,
    textAlign: 'center',
  },

  subheading: {
    margin: '1rem 0 .45rem',
    color: '#dce5f8',
    fontSize: '.75rem',
  },

  privacyList: {
    display: 'grid',
    gap: '.45rem',
  },

  privacyOption: {
    minHeight: '2.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 .75rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.72rem',
    cursor: 'pointer',
  },

  selectedPrivacy: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.2),rgba(77,215,255,.08))',
  },

  fullPreview: {
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
    width: '2.6rem',
    height: '2.6rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.15)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(255,255,255,.08)',
    cursor: 'pointer',
  },

  previewToggle: {
    position: 'fixed',
    right: '1rem',
    bottom: '5.4rem',
    zIndex: 35,
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.07)',
    fontSize: '.65rem',
    cursor: 'pointer',
  },

  error: {
    width: 'min(100% - 1.6rem, 760px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    margin: '.7rem auto 0',
    padding: '.7rem',
    border: '1px solid rgba(255,79,122,.25)',
    borderRadius: '.8rem',
    color: '#ffc2d0',
    background: 'rgba(255,79,122,.08)',
    fontSize: '.68rem',
  },

  closeError: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#ffc2d0',
    background: 'rgba(255,255,255,.08)',
    cursor: 'pointer',
  },

  notice: {
    position: 'fixed',
    top: '4.4rem',
    left: '50%',
    zIndex: 80,
    padding: '.65rem .8rem',
    border: '1px solid rgba(77,215,255,.25)',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(8,22,34,.9)',
    fontSize: '.68rem',
    transform: 'translateX(-50%)',
  },

  emptyState: {
    minHeight: '70vh',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.65rem',
    padding: '1.5rem',
    color: '#9aa7c1',
    textAlign: 'center',
  },

  successPage: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.6rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at center,rgba(124,92,255,.3),#07090e 62%)',
    textAlign: 'center',
  },

  successIcon: {
    width: '4.5rem',
    height: '4.5rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    boxShadow: '0 0 35px rgba(124,92,255,.4)',
  },
};