const DEFAULT_RESOLUTION = {
  width: 1080,
  height: 1920,
};

const QUALITY_SETTINGS = {
  standard: {
    quality: 0.78,
    label: 'Standard',
  },
  high: {
    quality: 0.9,
    label: 'High',
  },
  ultra: {
    quality: 0.98,
    label: 'Ultra',
  },
};

const RESOLUTIONS = {
  '720x1280': {
    width: 720,
    height: 1280,
  },
  '1080x1920': {
    width: 1080,
    height: 1920,
  },
  '1440x2560': {
    width: 1440,
    height: 2560,
  },
  '2160x3840': {
    width: 2160,
    height: 3840,
  },
};

const DEFAULT_AI = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  tint: 0,
  clarity: 0,
  sharpness: 0,
  noiseReduction: 0,
  skinSmoothing: 0,
  eyeEnhancement: 0,
  portraitLighting: 0,
  backgroundBlur: 0,
  skyEnhancement: 0,
  cinematicGrade: null,
};

const DEFAULT_MUSIC = {
  songId: null,
  audioUrl: null,
  songStart: 0,
  songEnd: 0,
  videoStart: 0,
  videoEnd: 0,
  fadeIn: 0,
  fadeOut: 0,
  musicVolume: 1,
  originalVolume: 1,
  beatSync: false,
};

function rendererError(message, code, details = null) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
}

function getMediaUrl(media) {
  if (typeof media === 'string') return media;

  return (
    media?.url ||
    media?.mediaUrl ||
    media?.media_url ||
    media?.src ||
    ''
  );
}

function getMediaType(media) {
  if (typeof media === 'string') return 'image';

  const value = String(
    media?.type ||
      media?.mediaType ||
      media?.media_type ||
      ''
  ).toLowerCase();

  return value.startsWith('video') ? 'video' : 'image';
}

function assertMedia(media) {
  const url = getMediaUrl(media);

  if (!url) {
    throw rendererError(
      'Story media is required.',
      'MEDIA_MISSING'
    );
  }

  const type = getMediaType(media);

  if (!['image', 'video'].includes(type)) {
    throw rendererError(
      'Unsupported story media type.',
      'MEDIA_UNSUPPORTED',
      { type }
    );
  }

  return {
    url,
    type,
  };
}

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeQuality(value) {
  const quality = String(value || 'high').toLowerCase();

  return QUALITY_SETTINGS[quality]
    ? quality
    : 'high';
}

function normalizeFormat(value, mediaType) {
  const format = String(
    value || (mediaType === 'video' ? 'webm' : 'jpeg')
  ).toLowerCase();

  const supported =
    mediaType === 'video'
      ? ['mp4', 'mov', 'webm']
      : ['jpeg', 'jpg', 'png', 'webp'];

  return supported.includes(format)
    ? format
    : mediaType === 'video'
      ? 'webm'
      : 'jpeg';
}

function normalizeResolution(value) {
  if (typeof value === 'object') {
    return {
      width: Math.max(
        1,
        Math.floor(finite(value.width, 1080))
      ),
      height: Math.max(
        1,
        Math.floor(finite(value.height, 1920))
      ),
    };
  }

  return (
    RESOLUTIONS[value] || {
      ...DEFAULT_RESOLUTION,
    }
  );
}

function normalizeAI(ai) {
  return {
    ...DEFAULT_AI,
    ...(ai || {}),
    exposure: finite(ai?.exposure),
    contrast: finite(ai?.contrast),
    saturation: finite(ai?.saturation),
    warmth: finite(ai?.warmth),
    tint: finite(ai?.tint),
    clarity: finite(ai?.clarity),
    sharpness: finite(ai?.sharpness),
    noiseReduction: finite(ai?.noiseReduction),
    skinSmoothing: finite(ai?.skinSmoothing),
    eyeEnhancement: finite(ai?.eyeEnhancement),
    portraitLighting: finite(ai?.portraitLighting),
    backgroundBlur: finite(ai?.backgroundBlur),
    skyEnhancement: finite(ai?.skyEnhancement),
  };
}

function normalizeMusic(music) {
  return {
    ...DEFAULT_MUSIC,
    ...(music || {}),
    songStart: Math.max(0, finite(music?.songStart)),
    songEnd: Math.max(0, finite(music?.songEnd)),
    videoStart: Math.max(0, finite(music?.videoStart)),
    videoEnd: Math.max(0, finite(music?.videoEnd)),
    fadeIn: Math.max(0, finite(music?.fadeIn)),
    fadeOut: Math.max(0, finite(music?.fadeOut)),
    musicVolume: clamp(
      finite(music?.musicVolume, 1),
      0,
      1
    ),
    originalVolume: clamp(
      finite(music?.originalVolume, 1),
      0,
      1
    ),
    beatSync: Boolean(music?.beatSync),
  };
}

function normalizeCrop(crop) {
  return {
    x: clamp(finite(crop?.x ?? crop?.cropX, 0), 0, 1),
    y: clamp(finite(crop?.y ?? crop?.cropY, 0), 0, 1),
    width: clamp(
      finite(crop?.width ?? crop?.cropWidth, 1),
      0.01,
      1
    ),
    height: clamp(
      finite(crop?.height ?? crop?.cropHeight, 1),
      0.01,
      1
    ),
    perspectiveX: finite(crop?.perspectiveX),
    perspectiveY: finite(crop?.perspectiveY),
  };
}

function normalizeWatermark(watermark) {
  if (!watermark) {
    return {
      mode: 'disabled',
      text: null,
      opacity: 0,
      position: 'bottom-right',
    };
  }

  return {
    mode: watermark.mode || 'subtle',
    text: watermark.text || 'Aarush',
    opacity: clamp(
      finite(watermark.opacity, 0.35),
      0,
      1
    ),
    position: watermark.position || 'bottom-right',
    color: watermark.color || '#ffffff',
    custom: watermark.custom || null,
  };
}

function normalizeExportOptions(
  options = {},
  mediaType
) {
  const quality = normalizeQuality(options.quality);
  const format = normalizeFormat(
    options.format,
    mediaType
  );

  return {
    quality,
    qualityLabel: QUALITY_SETTINGS[quality].label,
    resolution: normalizeResolution(
      options.resolution
    ),
    frameRate: Math.max(
      1,
      Math.floor(finite(options.frameRate, 30))
    ),
    format,
    compression: clamp(
      finite(options.compression, 0),
      0,
      1
    ),
    preserveMetadata:
      options.preserveMetadata !== false,
    optimizeUpload: options.optimizeUpload !== false,
    generateThumbnail:
      options.generateThumbnail !== false,
    includeAudio:
      options.includeAudio !== false,
    watermark: normalizeWatermark(
      options.watermark
    ),
  };
}

function cssFilterFromMetadata(filters = {}, ai = {}) {
  const filterValue =
    filters.cssFilter ||
    filters.filter ||
    '';

  const values = normalizeAI(ai);

  const brightness =
    1 +
    values.exposure / 100 +
    values.brightness / 100;

  const contrast = 1 + values.contrast / 100;
  const saturation =
    1 + values.saturation / 100;

  const parts = [
    filterValue,
    `brightness(${clamp(brightness, 0, 4)})`,
    `contrast(${clamp(contrast, 0, 4)})`,
    `saturate(${clamp(saturation, 0, 4)})`,
  ];

  if (values.warmth) {
    parts.push(
      `sepia(${clamp(
        Math.abs(values.warmth) / 180,
        0,
        0.7
      )})`
    );
  }

  if (values.tint) {
    parts.push(
      `hue-rotate(${clamp(values.tint, -180, 180)}deg)`
    );
  }

  if (values.backgroundBlur) {
    parts.push(
      `blur(${clamp(
        values.backgroundBlur / 20,
        0,
        12
      )}px)`
    );
  }

  return parts.filter(Boolean).join(' ');
}

export function applyFilterPipeline(
  filters = {},
  mediaType = 'image'
) {
  return {
    id: filters.id || filters.filterId || null,
    name: filters.name || null,
    cssFilter: cssFilterFromMetadata(
      filters,
      filters.adjustments || {}
    ),
    canvasFilter:
      filters.canvasFilter ||
      cssFilterFromMetadata(
        filters,
        filters.adjustments || {}
      ),
    supportsVideo:
      filters.supportsVideo !== false,
    mediaType,
    ready: true,
  };
}

export function applyAIEnhancements(
  aiEnhancements = {}
) {
  const ai = normalizeAI(aiEnhancements);

  return {
    ...ai,
    modelReady: false,
    processingReady: true,
    applied:
      Object.keys(ai).some(
        (key) =>
          key !== 'cinematicGrade' &&
          Number(ai[key]) !== 0
      ) || Boolean(ai.cinematicGrade),
  };
}

export function applyCropTransform(crop = {}) {
  const normalized = normalizeCrop(crop);

  return {
    ...normalized,
    cssTransform: {
      transformOrigin: 'center center',
      clipPath: `inset(${normalized.y * 100}% ${
        (1 -
          normalized.x -
          normalized.width) *
        100
      }% ${
        (1 -
          normalized.y -
          normalized.height) *
        100
      }% ${normalized.x * 100}%)`,
    },
  };
}

export function applyRotationTransform(
  rotation = 0,
  scale = 1,
  flipHorizontal = false,
  flipVertical = false
) {
  return {
    rotation: finite(rotation),
    scale: Math.max(0.01, finite(scale, 1)),
    flipHorizontal: Boolean(flipHorizontal),
    flipVertical: Boolean(flipVertical),
    cssTransform: [
      `rotate(${finite(rotation)}deg)`,
      `scale(${Math.max(0.01, finite(scale, 1))})`,
      `scaleX(${flipHorizontal ? -1 : 1})`,
      `scaleY(${flipVertical ? -1 : 1})`,
    ].join(' '),
  };
}

export function applyMusicTimeline(music = {}) {
  const normalized = normalizeMusic(music);

  return {
    ...normalized,
    synchronized:
      Boolean(normalized.audioUrl) &&
      normalized.songEnd > normalized.songStart &&
      normalized.videoEnd > normalized.videoStart,
    exportReady: false,
    engine: 'future-audio-renderer',
  };
}

function sortOverlays(items = []) {
  return [...(Array.isArray(items) ? items : [])].sort(
    (first, second) =>
      finite(first?.zIndex, 0) -
      finite(second?.zIndex, 0)
  );
}

export function renderTextLayers(
  textLayers = [],
  context = null,
  dimensions = DEFAULT_RESOLUTION
) {
  const layers = sortOverlays(textLayers);

  const metadata = layers.map((layer) => ({
    ...layer,
    type: 'text',
    x: finite(layer.x, 50),
    y: finite(layer.y, 50),
    scale: finite(layer.scale, 1),
    rotation: finite(layer.rotation),
    opacity: clamp(
      finite(layer.opacity, 1),
      0,
      1
    ),
  }));

  if (!context) {
    return metadata;
  }

  layers.forEach((layer) => {
    const x =
      (finite(layer.x, 50) / 100) *
      dimensions.width;
    const y =
      (finite(layer.y, 50) / 100) *
      dimensions.height;

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
        context.lineWidth = layer.outline.width;
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

export function renderStickers(
  stickers = [],
  context = null,
  dimensions = DEFAULT_RESOLUTION
) {
  const layers = sortOverlays(stickers);

  const metadata = layers.map((sticker) => ({
    ...sticker,
    type: sticker.type || 'sticker',
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
    const label =
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
    context.fillText(label, 0, 0);
    context.restore();
  });

  return metadata;
}

export function renderDrawings(
  drawings = [],
  context = null,
  dimensions = DEFAULT_RESOLUTION
) {
  const strokes = Array.isArray(drawings)
    ? drawings
    : drawings?.strokes || [];

  const metadata = strokes.map((stroke) => ({
    ...stroke,
    points: Array.isArray(stroke.points)
      ? stroke.points
      : [],
  }));

  if (!context) return metadata;

  metadata.forEach((stroke) => {
    if (stroke.points.length < 1) return;

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
        finite(point.x, 0) <= 1
          ? finite(point.x, 0) * dimensions.width
          : finite(point.x, 0);
      const y =
        finite(point.y, 0) <= 1
          ? finite(point.y, 0) * dimensions.height
          : finite(point.y, 0);

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });

    if (stroke.tool === 'eraser') {
      context.globalCompositeOperation =
        'destination-out';
    }

    context.stroke();
    context.restore();
  });

  return metadata;
}

export function applyCropAndTransformToCanvas(
  context,
  source,
  crop,
  transform,
  dimensions
) {
  if (!context || !source) {
    throw rendererError(
      'Canvas context and source are required.',
      'CANVAS_INPUT_MISSING'
    );
  }

  const normalizedCrop = normalizeCrop(crop);
  const rotation = applyRotationTransform(
    transform?.rotation,
    transform?.scale,
    transform?.flipHorizontal,
    transform?.flipVertical
  );

  context.save();
  context.clearRect(
    0,
    0,
    dimensions.width,
    dimensions.height
  );
  context.translate(
    dimensions.width / 2,
    dimensions.height / 2
  );
  context.transform(
    rotation.flipHorizontal ? -1 : 1,
    0,
    0,
    rotation.flipVertical ? -1 : 1,
    0,
    0
  );
  context.rotate(
    (rotation.rotation * Math.PI) / 180
  );
  context.scale(rotation.scale, rotation.scale);

  const sourceWidth =
    source.videoWidth || source.naturalWidth || source.width;
  const sourceHeight =
    source.videoHeight ||
    source.naturalHeight ||
    source.height;

  if (!sourceWidth || !sourceHeight) {
    context.restore();
    throw rendererError(
      'Source dimensions are unavailable.',
      'SOURCE_DIMENSIONS_MISSING'
    );
  }

  context.drawImage(
    source,
    normalizedCrop.x * sourceWidth,
    normalizedCrop.y * sourceHeight,
    normalizedCrop.width * sourceWidth,
    normalizedCrop.height * sourceHeight,
    -dimensions.width / 2,
    -dimensions.height / 2,
    dimensions.width,
    dimensions.height
  );

  context.restore();

  return context.canvas;
}

export function generateThumbnail(
  source,
  options = {}
) {
  assertMedia(source);

  return {
    sourceUrl: getMediaUrl(source),
    type: getMediaType(source),
    width: options.width || 360,
    height: options.height || 640,
    format: options.format || 'jpeg',
    quality: options.quality || 0.78,
    ready: false,
    generation: 'canvas-thumbnail-foundation',
  };
}

function estimateSize(
  width,
  height,
  format,
  quality,
  duration = 0
) {
  const pixels = width * height;

  if (format === 'png') {
    return Math.round(pixels * 2.2);
  }

  if (format === 'webp') {
    return Math.round(pixels * 0.34 * quality);
  }

  if (format === 'mp4' || format === 'mov' || format === 'webm') {
    return Math.round(
      Math.max(1, duration) *
        850000 *
        quality
    );
  }

  return Math.round(pixels * 0.42 * quality);
}

export async function renderImage(
  media,
  options = {}
) {
  const sourceData = assertMedia(media);

  if (sourceData.type !== 'image') {
    throw rendererError(
      'renderImage requires image media.',
      'IMAGE_REQUIRED'
    );
  }

  if (
    typeof window === 'undefined' ||
    typeof window.Image === 'undefined'
  ) {
    throw rendererError(
      'Image rendering is unavailable.',
      'IMAGE_API_UNAVAILABLE'
    );
  }

  const exportOptions = normalizeExportOptions(
    options.exportOptions,
    'image'
  );

  const image = new window.Image();
  image.crossOrigin = 'anonymous';

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () =>
      reject(
        rendererError(
          'Image could not be loaded.',
          'IMAGE_LOAD_FAILED'
        )
      );
    image.src = sourceData.url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = exportOptions.resolution.width;
  canvas.height = exportOptions.resolution.height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw rendererError(
      'Canvas context could not be created.',
      'CANVAS_FAILED'
    );
  }

  const pipeline = applyFilterPipeline(
    options.filters,
    'image'
  );

  context.filter = pipeline.canvasFilter;

  applyCropAndTransformToCanvas(
    context,
    image,
    options.crop,
    options.transform,
    exportOptions.resolution
  );

  renderTextLayers(
    options.textLayers,
    context,
    exportOptions.resolution
  );

  renderStickers(
    options.stickers,
    context,
    exportOptions.resolution
  );

  renderDrawings(
    options.drawings,
    context,
    exportOptions.resolution
  );

  const watermark = exportOptions.watermark;

  if (
    watermark.mode !== 'disabled' &&
    watermark.text
  ) {
    context.save();
    context.globalAlpha = watermark.opacity;
    context.fillStyle = watermark.color;
    context.font = '24px sans-serif';
    context.textAlign = 'right';
    context.fillText(
      watermark.text,
      exportOptions.resolution.width - 28,
      exportOptions.resolution.height - 28
    );
    context.restore();
  }

  const mimeType =
    exportOptions.format === 'png'
      ? 'image/png'
      : exportOptions.format === 'webp'
        ? 'image/webp'
        : 'image/jpeg';

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(
            rendererError(
              'Image export failed.',
              'IMAGE_EXPORT_FAILED'
            )
          );
          return;
        }

        resolve(result);
      },
      mimeType,
      QUALITY_SETTINGS[exportOptions.quality].quality
    );
  });

  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    mediaUrl: url,
    thumbnailUrl: url,
    width: canvas.width,
    height: canvas.height,
    duration: 0,
    format: exportOptions.format,
    mimeType,
    sizeEstimate: blob.size,
    filtersApplied: Boolean(options.filters),
    aiApplied: Boolean(
      applyAIEnhancements(options.aiEnhancements).applied
    ),
    overlaysApplied: Boolean(
      options.textLayers?.length ||
        options.stickers?.length ||
        options.drawings?.length
    ),
    musicApplied: false,
    exportQuality: exportOptions.qualityLabel,
    readyForUpload: true,
    metadata: prepareUploadPayload({
      mediaUrl: url,
      thumbnailUrl: url,
      width: canvas.width,
      height: canvas.height,
      duration: 0,
      format: exportOptions.format,
      sizeEstimate: blob.size,
      options,
    }),
  };
}

export async function renderVideo(
  media,
  options = {}
) {
  const sourceData = assertMedia(media);

  if (sourceData.type !== 'video') {
    throw rendererError(
      'renderVideo requires video media.',
      'VIDEO_REQUIRED'
    );
  }

  const exportOptions = normalizeExportOptions(
    options.exportOptions,
    'video'
  );

  return {
    sourceUrl: sourceData.url,
    mediaType: 'video',
    format: exportOptions.format,
    width: exportOptions.resolution.width,
    height: exportOptions.resolution.height,
    frameRate: exportOptions.frameRate,
    duration: finite(options.duration, 0),
    filters: applyFilterPipeline(
      options.filters,
      'video'
    ),
    aiEnhancements: applyAIEnhancements(
      options.aiEnhancements
    ),
    crop: applyCropTransform(options.crop),
    rotation: applyRotationTransform(
      options.transform?.rotation,
      options.transform?.scale,
      options.transform?.flipHorizontal,
      options.transform?.flipVertical
    ),
    textLayers: renderTextLayers(
      options.textLayers
    ),
    stickers: renderStickers(options.stickers),
    drawings: renderDrawings(options.drawings),
    music: applyMusicTimeline(options.music),
    watermark: exportOptions.watermark,
    audio: {
      includeAudio: exportOptions.includeAudio,
      readyForFutureRenderer: true,
    },
    renderer: {
      engine: 'future-video-renderer',
      ffmpegReady: false,
      webCodecsReady:
        typeof window !== 'undefined' &&
        typeof window.VideoEncoder !== 'undefined',
      workerReady: false,
      gpuReady: false,
      cancelled: false,
    },
    readyForUpload: false,
  };
}

export function generateExportPreview(
  media,
  options = {}
) {
  const source = assertMedia(media);
  const exportOptions = normalizeExportOptions(
    options.exportOptions,
    source.type
  );

  return {
    sourceUrl: source.url,
    mediaType: source.type,
    width: exportOptions.resolution.width,
    height: exportOptions.resolution.height,
    format: exportOptions.format,
    filter: applyFilterPipeline(
      options.filters,
      source.type
    ),
    ai: applyAIEnhancements(
      options.aiEnhancements
    ),
    crop: applyCropTransform(options.crop),
    rotation: applyRotationTransform(
      options.transform?.rotation,
      options.transform?.scale,
      options.transform?.flipHorizontal,
      options.transform?.flipVertical
    ),
    overlays: {
      text: renderTextLayers(options.textLayers),
      stickers: renderStickers(options.stickers),
      drawings: renderDrawings(options.drawings),
    },
    music: applyMusicTimeline(options.music),
    watermark: exportOptions.watermark,
    previewReady: true,
  };
}

export function prepareUploadPayload(input = {}) {
  const source = input.options || input;

  return {
    mediaUrl: input.mediaUrl || null,
    thumbnailUrl: input.thumbnailUrl || null,
    width: Math.max(
      1,
      Math.floor(finite(input.width, 1080))
    ),
    height: Math.max(
      1,
      Math.floor(finite(input.height, 1920))
    ),
    duration: Math.max(0, finite(input.duration)),
    format: input.format || 'jpeg',
    sizeEstimate: Math.max(
      0,
      finite(
        input.sizeEstimate,
        estimateSize(
          finite(input.width, 1080),
          finite(input.height, 1920),
          input.format || 'jpeg',
          QUALITY_SETTINGS[
            normalizeQuality(
              source?.exportOptions?.quality
            )
          ].quality,
          input.duration
        )
      )
    ),
    filtersApplied: Boolean(
      source?.filters ||
        source?.filterId ||
        source?.filter
    ),
    aiApplied: Boolean(source?.aiEnhancements),
    overlaysApplied: Boolean(
      source?.textLayers?.length ||
        source?.stickers?.length ||
        source?.drawings?.length
    ),
    musicApplied: Boolean(
      source?.music?.audioUrl ||
        source?.music?.songId
    ),
    exportQuality: QUALITY_SETTINGS[
      normalizeQuality(
        source?.exportOptions?.quality
      )
    ].label,
    readyForUpload: Boolean(
      input.mediaUrl || input.sourceUrl
    ),
    rendererVersion: 'aarush-story-export-s2.8',
    preserveMetadata:
      source?.exportOptions?.preserveMetadata !== false,
    optimizeUpload:
      source?.exportOptions?.optimizeUpload !== false,
  };
}

export async function renderStory(input = {}) {
  const source = assertMedia(input.media);
  const exportOptions = normalizeExportOptions(
    input.exportOptions,
    source.type
  );

  if (typeof input.onProgress === 'function') {
    input.onProgress(0);
  }

  if (input.signal?.aborted) {
    throw rendererError(
      'Story rendering was cancelled.',
      'RENDER_CANCELLED'
    );
  }

  let result;

  if (source.type === 'image') {
    result = await renderImage(
      input.media,
      input
    );
  } else {
    result = await renderVideo(
      input.media,
      input
    );
  }

  if (typeof input.onProgress === 'function') {
    input.onProgress(source.type === 'image' ? 1 : 0.25);
  }

  const preview = generateExportPreview(
    input.media,
    input
  );

  const payload = prepareUploadPayload({
    ...result,
    sourceUrl: source.url,
    options: {
      ...input,
      exportOptions,
    },
  });

  if (typeof input.onProgress === 'function') {
    input.onProgress(source.type === 'image' ? 1 : 0.35);
  }

  return {
    ...result,
    preview,
    payload,
    exportOptions,
    pipeline: [
      'load-media',
      'crop',
      'rotate',
      'perspective',
      'filters',
      'ai-enhancements',
      'text-overlays',
      'sticker-overlays',
      'drawing-overlays',
      'music-timeline',
      'watermark',
      'export',
    ],
    readyForUpload: payload.readyForUpload,
  };
}