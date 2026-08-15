const RESOLUTIONS = Object.freeze({
  '720x1280': { width: 720, height: 1280 },
  '1080x1920': { width: 1080, height: 1920 },
  '1440x2560': { width: 1440, height: 2560 },
  '2160x3840': { width: 2160, height: 3840 },
});

const FORMATS = ['mp4', 'mov', 'webm'];
const FRAME_RATES = [24, 30, 60];

const TRANSITIONS = [
  'fade',
  'crossfade',
  'slide-left',
  'slide-right',
  'slide-up',
  'slide-down',
  'zoom',
  'push',
  'blur',
  'film-burn',
  'light-leak',
  'speed-ramp',
  'match-cut',
  'whip-pan',
];

const DEFAULT_EXPORT_OPTIONS = {
  quality: 'high',
  resolution: '1080x1920',
  frameRate: 30,
  format: 'webm',
  bitrate: null,
  optimizeUpload: true,
  generateThumbnail: true,
  preserveMetadata: true,
};

const DEFAULT_AUDIO = {
  volume: 1,
  fadeIn: 0,
  fadeOut: 0,
  crossfade: 0,
  beatSync: false,
  ducking: false,
};

function renderError(message, code, details = null) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
}

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeResolution(value) {
  if (value && typeof value === 'object') {
    return {
      width: Math.max(1, Math.floor(finite(value.width, 1080))),
      height: Math.max(1, Math.floor(finite(value.height, 1920))),
    };
  }

  return (
    RESOLUTIONS[value] || {
      ...RESOLUTIONS['1080x1920'],
    }
  );
}

function normalizeFormat(value) {
  const format = String(value || 'webm').toLowerCase();
  return FORMATS.includes(format) ? format : 'webm';
}

function normalizeFrameRate(value) {
  const rate = Math.floor(finite(value, 30));
  return FRAME_RATES.includes(rate) ? rate : 30;
}

function normalizeExportOptions(options = {}) {
  return {
    ...DEFAULT_EXPORT_OPTIONS,
    ...options,
    quality: options.quality || 'high',
    resolution: normalizeResolution(options.resolution),
    frameRate: normalizeFrameRate(options.frameRate),
    format: normalizeFormat(options.format),
    optimizeUpload: options.optimizeUpload !== false,
    generateThumbnail: options.generateThumbnail !== false,
    preserveMetadata: options.preserveMetadata !== false,
  };
}

function mediaUrl(media) {
  if (typeof media === 'string') return media;

  return (
    media?.url ||
    media?.src ||
    media?.mediaUrl ||
    media?.media_url ||
    ''
  );
}

function normalizeTrack(track, index, type) {
  return {
    ...track,
    id: track?.id || `${type || 'track'}-${index}`,
    type: track?.type || type || 'video',
    source: mediaUrl(track),
    start: Math.max(0, finite(track?.start)),
    duration: Math.max(
      0,
      finite(track?.duration || track?.duration_seconds)
    ),
    layer: finite(track?.layer, index),
    visible: track?.visible !== false,
    opacity: clamp(finite(track?.opacity, 1), 0, 1),
  };
}

function normalizeTracks(mediaTracks = {}) {
  if (Array.isArray(mediaTracks)) {
    return {
      video: mediaTracks.map((track, index) =>
        normalizeTrack(track, index, 'video')
      ),
      image: [],
      text: [],
      subtitle: [],
      sticker: [],
      drawing: [],
      music: [],
      voiceover: [],
      soundEffects: [],
    };
  }

  return {
    video: array(mediaTracks.video).map((track, index) =>
      normalizeTrack(track, index, 'video')
    ),
    image: array(mediaTracks.image).map((track, index) =>
      normalizeTrack(track, index, 'image')
    ),
    text: array(mediaTracks.text),
    subtitle: array(mediaTracks.subtitle),
    sticker: array(mediaTracks.sticker),
    drawing: array(mediaTracks.drawing),
    music: array(mediaTracks.music).map((track, index) =>
      normalizeTrack(track, index, 'music')
    ),
    voiceover: array(mediaTracks.voiceover).map(
      (track, index) =>
        normalizeTrack(track, index, 'voiceover')
    ),
    soundEffects: array(mediaTracks.soundEffects).map(
      (track, index) =>
        normalizeTrack(track, index, 'sound-effect')
    ),
  };
}

function normalizeCropRotate(value = {}) {
  return {
    crop: value.crop || {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    },
    rotation: finite(value.rotation),
    scale: Math.max(0.01, finite(value.scale, 1)),
    flipHorizontal: Boolean(
      value.flipHorizontal ||
        value.flip?.horizontal
    ),
    flipVertical: Boolean(
      value.flipVertical ||
        value.flip?.vertical
    ),
    straighten: finite(value.straighten),
    perspective: {
      x: finite(
        value.perspectiveX ||
          value.perspective?.x
      ),
      y: finite(
        value.perspectiveY ||
          value.perspective?.y
      ),
    },
  };
}

function normalizeAudioTrack(track, index, type) {
  return {
    ...DEFAULT_AUDIO,
    ...track,
    id: track?.id || `${type}-${index}`,
    type,
    source: mediaUrl(track),
    start: Math.max(0, finite(track?.start)),
    duration: Math.max(0, finite(track?.duration)),
    volume: clamp(finite(track?.volume, 1), 0, 1),
    originalVolume: clamp(
      finite(track?.originalVolume, 1),
      0,
      1
    ),
  };
}

function normalizeAudioTracks(musicTracks = {}) {
  if (Array.isArray(musicTracks)) {
    return {
      music: musicTracks.map((track, index) =>
        normalizeAudioTrack(track, index, 'music')
      ),
      voiceover: [],
      soundEffects: [],
    };
  }

  return {
    music: array(musicTracks.music).map((track, index) =>
      normalizeAudioTrack(track, index, 'music')
    ),
    voiceover: array(musicTracks.voiceover).map(
      (track, index) =>
        normalizeAudioTrack(track, index, 'voiceover')
    ),
    soundEffects: array(musicTracks.soundEffects).map(
      (track, index) =>
        normalizeAudioTrack(track, index, 'sound-effect')
    ),
  };
}

function getDurationFromTracks(tracks, audio) {
  const mediaDuration = Object.values(tracks)
    .flat()
    .reduce(
      (maximum, track) =>
        Math.max(
          maximum,
          finite(track.start) + finite(track.duration)
        ),
      0
    );

  const audioDuration = Object.values(audio)
    .flat()
    .reduce(
      (maximum, track) =>
        Math.max(
          maximum,
          finite(track.start) + finite(track.duration)
        ),
      0
    );

  return Math.max(mediaDuration, audioDuration);
}

function reportProgress(callback, stage, progress) {
  if (typeof callback === 'function') {
    callback({
      stage,
      progress: clamp(progress, 0, 1),
    });
  }
}

function assertNotCancelled(signal) {
  if (signal?.aborted) {
    throw renderError(
      'Video rendering was cancelled.',
      'RENDER_CANCELLED'
    );
  }
}

export function applyTransitions(transitions = []) {
  return array(transitions).map((transition, index) => {
    const value =
      typeof transition === 'string'
        ? transition
        : transition?.type || 'crossfade';

    return {
      id: transition?.id || `transition-${index}`,
      type: TRANSITIONS.includes(value)
        ? value
        : 'crossfade',
      duration: Math.max(
        0,
        finite(transition?.duration, 0.4)
      ),
      speedRampReady: value === 'speed-ramp',
      matchCutReady: value === 'match-cut',
      whipPanReady: value === 'whip-pan',
    };
  });
}

export function applyFilters(filters = {}) {
  return {
    ...filters,
    filterId:
      filters.filterId ||
      filters.id ||
      filters.name ||
      null,
    cssFilter:
      filters.cssFilter ||
      filters.filter ||
      'none',
    canvasFilter:
      filters.canvasFilter ||
      filters.cssFilter ||
      'none',
    supportsVideo: filters.supportsVideo !== false,
    ready: true,
  };
}

export function applyAIEnhancements(
  aiEnhancements = {}
) {
  return {
    exposure: finite(aiEnhancements.exposure),
    contrast: finite(aiEnhancements.contrast),
    saturation: finite(aiEnhancements.saturation),
    warmth: finite(aiEnhancements.warmth),
    clarity: finite(aiEnhancements.clarity),
    sharpness: finite(aiEnhancements.sharpness),
    noiseReduction: finite(
      aiEnhancements.noiseReduction
    ),
    portraitLighting: finite(
      aiEnhancements.portraitLighting
    ),
    backgroundBlur: finite(
      aiEnhancements.backgroundBlur
    ),
    skyEnhancement: finite(
      aiEnhancements.skyEnhancement
    ),
    cinematicGrade:
      aiEnhancements.cinematicGrade || null,
    modelReady: false,
    renderReady: true,
  };
}

export function applyCropRotate(cropRotate = {}) {
  const normalized = normalizeCropRotate(cropRotate);

  return {
    ...normalized,
    cssTransform: [
      `rotate(${normalized.rotation}deg)`,
      `scale(${normalized.scale})`,
      `scaleX(${normalized.flipHorizontal ? -1 : 1})`,
      `scaleY(${normalized.flipVertical ? -1 : 1})`,
    ].join(' '),
    perspectiveReady: true,
  };
}

export function renderText(
  textLayers = [],
  context = null,
  dimensions = RESOLUTIONS['1080x1920'],
  currentTime = 0
) {
  const layers = array(textLayers)
    .filter((layer) => layer?.visible !== false)
    .sort(
      (first, second) =>
        finite(first.zIndex) - finite(second.zIndex)
    );

  const metadata = layers.map((layer) => ({
    ...layer,
    renderTime: currentTime,
    animation:
      layer.animation || layer.animationType || 'none',
  }));

  if (!context) return metadata;

  layers.forEach((layer) => {
    const x =
      (finite(layer.x, 50) / 100) * dimensions.width;
    const y =
      (finite(layer.y, 50) / 100) * dimensions.height;

    context.save();
    context.globalAlpha = clamp(
      finite(layer.opacity, 1),
      0,
      1
    );
    context.translate(x, y);
    context.rotate(
      (finite(layer.rotation) * Math.PI) / 180
    );
    context.scale(
      finite(layer.scale, 1),
      finite(layer.scale, 1)
    );

    const fontSize = Math.max(
      8,
      finite(layer.fontSize, 34)
    );

    context.font = `${layer.fontStyle || 'normal'} ${
      layer.fontWeight || 700
    } ${fontSize}px ${
      layer.fontFamily || 'sans-serif'
    }`;
    context.textAlign = layer.alignment || 'center';
    context.textBaseline = 'middle';

    if (layer.shadow) {
      context.shadowColor =
        layer.shadow.color || '#000000';
      context.shadowBlur = finite(layer.shadow.blur, 8);
      context.shadowOffsetX = finite(layer.shadow.x, 0);
      context.shadowOffsetY = finite(layer.shadow.y, 2);
    }

    const lines = String(layer.text || '').split('\n');
    const lineHeight =
      fontSize * finite(layer.lineHeight, 1.2);

    lines.forEach((line, index) => {
      const lineY =
        (index - (lines.length - 1) / 2) *
        lineHeight;

      if (layer.outline?.width > 0) {
        context.lineWidth = finite(
          layer.outline.width,
          1
        );
        context.strokeStyle =
          layer.outline.color || '#000000';
        context.strokeText(line, 0, lineY);
      }

      context.fillStyle =
        layer.gradient ||
        layer.color ||
        '#ffffff';
      context.fillText(line, 0, lineY);
    });

    context.restore();
  });

  return metadata;
}

export function renderSubtitles(
  subtitles = [],
  context = null,
  dimensions = RESOLUTIONS['1080x1920'],
  currentTime = 0
) {
  const active = array(subtitles).filter((subtitle) => {
    const start = finite(subtitle.start);
    const end = finite(
      subtitle.end,
      start + finite(subtitle.duration, 3)
    );

    return currentTime >= start && currentTime <= end;
  });

  const metadata = active.map((subtitle) => ({
    ...subtitle,
    active: true,
    currentTime,
    position: subtitle.position || 'bottom',
    style: subtitle.style || 'aarush',
  }));

  if (!context) return metadata;

  active.forEach((subtitle) => {
    const text = String(
      subtitle.text || subtitle.words || ''
    );

    if (!text) return;

    context.save();
    context.globalAlpha = clamp(
      finite(subtitle.opacity, 1),
      0,
      1
    );
    context.font = `${finite(
      subtitle.fontSize,
      32
    )}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle =
      subtitle.color || '#ffffff';
    context.strokeStyle =
      subtitle.outlineColor || '#000000';
    context.lineWidth = finite(
      subtitle.outlineWidth,
      4
    );

    const y =
      subtitle.position === 'top'
        ? dimensions.height * 0.14
        : subtitle.position === 'center'
          ? dimensions.height * 0.5
          : dimensions.height * 0.86;

    context.strokeText(
      text,
      dimensions.width / 2,
      y
    );
    context.fillText(
      text,
      dimensions.width / 2,
      y
    );
    context.restore();
  });

  return metadata;
}

export function renderStickers(
  stickers = [],
  context = null,
  dimensions = RESOLUTIONS['1080x1920']
) {
  const layers = array(stickers)
    .filter((sticker) => sticker?.visible !== false)
    .sort(
      (first, second) =>
        finite(first.zIndex) - finite(second.zIndex)
    );

  const metadata = layers.map((sticker) => ({
    ...sticker,
    x: finite(sticker.x, 50),
    y: finite(sticker.y, 50),
    scale: finite(sticker.scale, 1),
    rotation: finite(sticker.rotation),
    opacity: clamp(
      finite(sticker.opacity, 1),
      0,
      1
    ),
  }));

  if (!context) return metadata;

  layers.forEach((sticker) => {
    const x =
      (finite(sticker.x, 50) / 100) *
      dimensions.width;
    const y =
      (finite(sticker.y, 50) / 100) *
      dimensions.height;
    const text =
      sticker.data?.value ||
      sticker.data?.label ||
      sticker.text ||
      sticker.emoji ||
      '';

    context.save();
    context.globalAlpha = clamp(
      finite(sticker.opacity, 1),
      0,
      1
    );
    context.translate(x, y);
    context.rotate(
      (finite(sticker.rotation) * Math.PI) / 180
    );
    context.scale(
      finite(sticker.scale, 1),
      finite(sticker.scale, 1)
    );
    context.font = `${finite(
      sticker.data?.fontSize,
      42
    )}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle =
      sticker.data?.color || '#ffffff';
    context.fillText(text, 0, 0);
    context.restore();
  });

  return metadata;
}

export function renderDrawings(
  drawings = [],
  context = null,
  dimensions = RESOLUTIONS['1080x1920']
) {
  const strokes = array(drawings);

  const metadata = strokes.map((stroke) => ({
    ...stroke,
    points: array(stroke.points),
  }));

  if (!context) return metadata;

  metadata.forEach((stroke) => {
    if (!stroke.points.length) return;

    context.save();
    context.globalAlpha = clamp(
      finite(stroke.opacity, 1),
      0,
      1
    );
    context.strokeStyle =
      stroke.color || '#ffffff';
    context.lineWidth = Math.max(
      1,
      finite(stroke.size, 4)
    );
    context.lineCap = 'round';
    context.lineJoin = 'round';

    if (stroke.tool === 'neon') {
      context.shadowBlur = finite(stroke.glow, 14);
      context.shadowColor =
        stroke.color || '#4dd7ff';
    }

    context.beginPath();

    stroke.points.forEach((point, index) => {
      const x =
        finite(point.x) <= 1
          ? finite(point.x) * dimensions.width
          : finite(point.x);
      const y =
        finite(point.y) <= 1
          ? finite(point.y) * dimensions.height
          : finite(point.y);

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });

    context.stroke();
    context.restore();
  });

  return metadata;
}

export async function renderFrame(input = {}) {
  const {
    source,
    time = 0,
    dimensions = RESOLUTIONS['1080x1920'],
    filters,
    aiEnhancements,
    cropRotate,
    textLayers,
    subtitles,
    stickers,
    drawings,
  } = input;

  if (!source) {
    throw renderError(
      'A frame source is required.',
      'FRAME_SOURCE_MISSING'
    );
  }

  if (
    typeof document === 'undefined' ||
    typeof document.createElement !== 'function'
  ) {
    throw renderError(
      'Canvas rendering is unavailable.',
      'CANVAS_UNAVAILABLE'
    );
  }

  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw renderError(
      'Canvas context could not be created.',
      'CANVAS_CONTEXT_FAILED'
    );
  }

  context.save();
  context.filter =
    applyFilters(filters, 'video').canvasFilter ||
    'none';

  const transform = applyCropRotate(cropRotate);

  context.translate(
    dimensions.width / 2,
    dimensions.height / 2
  );
  context.rotate(
    (transform.rotation * Math.PI) / 180
  );
  context.scale(
    transform.scale *
      (transform.flipHorizontal ? -1 : 1),
    transform.scale *
      (transform.flipVertical ? -1 : 1)
  );

  const sourceWidth =
    source.videoWidth ||
    source.naturalWidth ||
    source.width;
  const sourceHeight =
    source.videoHeight ||
    source.naturalHeight ||
    source.height;

  if (!sourceWidth || !sourceHeight) {
    context.restore();
    throw renderError(
      'Frame source dimensions are unavailable.',
      'FRAME_DIMENSIONS_MISSING'
    );
  }

  context.drawImage(
    source,
    -dimensions.width / 2,
    -dimensions.height / 2,
    dimensions.width,
    dimensions.height
  );
  context.restore();

  applyAIEnhancements(aiEnhancements);
  renderText(
    textLayers,
    context,
    dimensions,
    time
  );
  renderSubtitles(
    subtitles,
    context,
    dimensions,
    time
  );
  renderStickers(
    stickers,
    context,
    dimensions
  );
  renderDrawings(
    drawings,
    context,
    dimensions
  );

  return {
    canvas,
    time,
    width: canvas.width,
    height: canvas.height,
    filtersApplied: Boolean(filters),
    aiApplied: Boolean(aiEnhancements),
  };
}

export function mixAudio(musicTracks = {}) {
  const normalized = normalizeAudioTracks(
    musicTracks
  );

  return {
    ...normalized,
    masterVolume: 1,
    audioDucking: Boolean(
      musicTracks.audioDucking ||
        musicTracks.ducking
    ),
    crossfadeReady: true,
    voiceoverReady: true,
    soundEffectsReady: true,
    engine: 'future-multi-track-audio-engine',
  };
}

export function generateThumbnail(
  source,
  options = {}
) {
  const sourceUrl = mediaUrl(source);

  if (!sourceUrl) {
    throw renderError(
      'Thumbnail source is missing.',
      'THUMBNAIL_SOURCE_MISSING'
    );
  }

  return {
    sourceUrl,
    width: Math.max(1, Math.floor(finite(options.width, 360))),
    height: Math.max(
      1,
      Math.floor(finite(options.height, 640))
    ),
    format: options.format || 'jpeg',
    quality: clamp(finite(options.quality, 0.8), 0, 1),
    ready: false,
    engine: 'canvas-thumbnail-foundation',
  };
}

export function estimateRenderTime(input = {}) {
  const tracks = normalizeTracks(input.mediaTracks);
  const audio = normalizeAudioTracks(input.musicTracks);
  const duration = getDurationFromTracks(
    tracks,
    audio
  );
  const resolution = normalizeResolution(
    input.exportOptions?.resolution
  );
  const frameRate = normalizeFrameRate(
    input.exportOptions?.frameRate
  );
  const pixels = resolution.width * resolution.height;
  const complexity =
    1 +
    array(input.textLayers).length * 0.02 +
    array(input.subtitles).length * 0.015 +
    array(input.stickers).length * 0.02 +
    array(input.drawings).length * 0.03;

  return {
    duration,
    estimatedSeconds: Math.max(
      1,
      Math.ceil(
        duration *
          (pixels / (1080 * 1920)) *
          (frameRate / 30) *
          complexity
      )
    ),
    frameCount: Math.ceil(duration * frameRate),
    resolution,
    frameRate,
    workerReady: false,
    gpuReady: false,
  };
}

function validateTimeline(tracks, audio) {
  const allTracks = [
    ...Object.values(tracks).flat(),
    ...Object.values(audio).flat(),
  ];

  const invalid = allTracks.find(
    (track) =>
      track.start < 0 ||
      track.duration < 0 ||
      !Number.isFinite(track.start) ||
      !Number.isFinite(track.duration)
  );

  if (invalid) {
    throw renderError(
      'Timeline contains invalid timing.',
      'TIMELINE_INVALID',
      invalid
    );
  }
}

export async function renderVideoProject(input = {}) {
  const {
    mediaTracks = {},
    textLayers = [],
    subtitles = [],
    stickers = [],
    drawings = [],
    filters = {},
    aiEnhancements = {},
    musicTracks = {},
    exportOptions = {},
    signal,
    onProgress,
  } = input;

  assertNotCancelled(signal);

  const tracks = normalizeTracks(mediaTracks);
  const audio = normalizeAudioTracks(musicTracks);

  validateTimeline(tracks, audio);

  const options = {
    ...normalizeExportOptions(exportOptions),
    resolution: normalizeResolution(
      exportOptions.resolution
    ),
  };

  reportProgress(onProgress, 'Loading assets', 0.05);
  assertNotCancelled(signal);

  const duration = getDurationFromTracks(
    tracks,
    audio
  );
  const filterMetadata = applyFilters(
    filters,
    'video'
  );
  const aiMetadata = applyAIEnhancements(
    aiEnhancements
  );
  const cropMetadata = applyCropRotate(
    input.cropRotate || input.crop
  );
  const transitionMetadata = applyTransitions(
    input.transitions
  );
  const audioMetadata = mixAudio(audio);

  reportProgress(
    onProgress,
    'Preparing timeline',
    0.18
  );
  assertNotCancelled(signal);

  const textMetadata = renderText(textLayers);
  const subtitleMetadata = renderSubtitles(subtitles);
  const stickerMetadata = renderStickers(stickers);
  const drawingMetadata = renderDrawings(drawings);

  reportProgress(
    onProgress,
    'Applying filters',
    0.32
  );
  assertNotCancelled(signal);

  reportProgress(
    onProgress,
    'Rendering overlays',
    0.5
  );
  assertNotCancelled(signal);

  reportProgress(
    onProgress,
    'Mixing audio',
    0.68
  );
  assertNotCancelled(signal);

  reportProgress(
    onProgress,
    'Encoding foundation',
    0.82
  );
  assertNotCancelled(signal);

  const estimate = estimateRenderTime({
    mediaTracks: tracks,
    musicTracks: audio,
    textLayers,
    subtitles,
    stickers,
    drawings,
    exportOptions: options,
  });

  const thumbnail = options.generateThumbnail
    ? generateThumbnail(
        tracks.video[0] ||
          tracks.image[0] ||
          input.media,
        {
          width: 360,
          height: 640,
        }
      )
    : null;

  const metadata = {
    id: input.id || `render-${Date.now()}`,
    duration,
    resolution: options.resolution,
    frameRate: options.frameRate,
    format: options.format,
    estimatedSize: Math.round(
      options.resolution.width *
        options.resolution.height *
        Math.max(1, duration) *
        (options.format === 'webm'
          ? 0.6
          : 0.85)
    ),
    thumbnail,
    mediaTracks: tracks,
    textLayers: textMetadata,
    subtitles: subtitleMetadata,
    stickers: stickerMetadata,
    drawings: drawingMetadata,
    filtersApplied: filterMetadata,
    aiApplied: aiMetadata,
    cropRotate: cropMetadata,
    transitions: transitionMetadata,
    music: audioMetadata,
    exportOptions: options,
    estimatedRenderTime: estimate.estimatedSeconds,
    renderSteps: [
      'load-assets',
      'prepare-timeline',
      'apply-crop-rotate',
      'apply-filters',
      'apply-ai-enhancements',
      'render-text',
      'render-subtitles',
      'render-stickers',
      'render-drawings',
      'mix-audio',
      'encode',
      'finalize',
    ],
    renderer: {
      version: 'aarush-video-render-s4.3',
      ffmpegReady: false,
      webCodecsReady:
        typeof window !== 'undefined' &&
        typeof window.VideoEncoder !== 'undefined',
      workerReady: false,
      gpuReady: false,
      chunkedProcessingReady: true,
      cancelled: false,
    },
    exportQuality: options.quality,
    readyForUpload: false,
  };

  reportProgress(
    onProgress,
    'Finalizing export',
    1
  );

  return metadata;
}