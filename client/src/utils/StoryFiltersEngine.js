const DEFAULT_ADJUSTMENTS = Object.freeze({
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  vibrance: 0,
  tint: 0,
  gamma: 0,
  blur: 0,
  sharpen: 0,
  vignette: 0,
  grain: 0,
});

const AI_FOUNDATION = Object.freeze({
  portraitEnhancement: {
    id: 'ai-portrait-enhancement',
    ready: false,
    provider: null,
  },
  nightMode: {
    id: 'ai-night-mode',
    ready: false,
    provider: null,
  },
  cinematicGrading: {
    id: 'ai-cinematic-grading',
    ready: false,
    provider: null,
  },
  skinToneCorrection: {
    id: 'ai-skin-tone-correction',
    ready: false,
    provider: null,
  },
  colorMatching: {
    id: 'ai-color-matching',
    ready: false,
    provider: null,
  },
  sceneDetection: {
    id: 'ai-scene-detection',
    ready: false,
    provider: null,
  },
  filterRecommendation: {
    id: 'ai-filter-recommendation',
    ready: false,
    provider: null,
  },
});

const FILTERS = Object.freeze([
  {
    id: 'aarush',
    name: 'Aarush',
    category: 'signature',
    previewColor: '#7c5cff',
    cssFilter:
      'brightness(1.02) contrast(1.04) saturate(1.12)',
    canvasFilter:
      'brightness(102%) contrast(104%) saturate(112%)',
    adjustmentDefaults: {
      brightness: 2,
      contrast: 4,
      saturation: 12,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'vivid',
    name: 'Vivid',
    category: 'color',
    previewColor: '#ff4fd8',
    cssFilter:
      'brightness(1.04) contrast(1.12) saturate(1.5)',
    canvasFilter:
      'brightness(104%) contrast(112%) saturate(150%)',
    adjustmentDefaults: {
      brightness: 4,
      contrast: 12,
      saturation: 50,
      vibrance: 28,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'moody',
    name: 'Moody',
    category: 'cinematic',
    previewColor: '#3c496d',
    cssFilter:
      'brightness(.78) contrast(1.2) saturate(.78)',
    canvasFilter:
      'brightness(78%) contrast(120%) saturate(78%)',
    adjustmentDefaults: {
      brightness: -22,
      contrast: 20,
      saturation: -22,
      shadows: -8,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'retro',
    name: 'Retro',
    category: 'vintage',
    previewColor: '#d89162',
    cssFilter:
      'sepia(.28) saturate(1.2) contrast(.96)',
    canvasFilter:
      'sepia(28%) saturate(120%) contrast(96%)',
    adjustmentDefaults: {
      warmth: 22,
      saturation: 14,
      contrast: -4,
      grain: 12,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'black-white',
    name: 'Black & White',
    category: 'monochrome',
    previewColor: '#aab5ca',
    cssFilter: 'grayscale(1) contrast(1.08)',
    canvasFilter: 'grayscale(100%) contrast(108%)',
    adjustmentDefaults: {
      saturation: -100,
      contrast: 8,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'neon',
    name: 'Neon',
    category: 'creative',
    previewColor: '#4dd7ff',
    cssFilter:
      'saturate(1.7) contrast(1.16) hue-rotate(14deg)',
    canvasFilter:
      'saturate(170%) contrast(116%) hue-rotate(14deg)',
    adjustmentDefaults: {
      saturation: 70,
      contrast: 16,
      vibrance: 34,
      tint: 8,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    category: 'warm',
    previewColor: '#ff9c64',
    cssFilter:
      'sepia(.18) saturate(1.35) hue-rotate(-9deg)',
    canvasFilter:
      'sepia(18%) saturate(135%) hue-rotate(-9deg)',
    adjustmentDefaults: {
      warmth: 36,
      saturation: 20,
      highlights: 8,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'night',
    name: 'Night',
    category: 'low-light',
    previewColor: '#536fae',
    cssFilter:
      'brightness(.68) contrast(1.22) saturate(.88) hue-rotate(8deg)',
    canvasFilter:
      'brightness(68%) contrast(122%) saturate(88%) hue-rotate(8deg)',
    adjustmentDefaults: {
      brightness: -18,
      contrast: 22,
      shadows: 24,
      saturation: -12,
      tint: 8,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'portrait',
    name: 'Portrait',
    category: 'portrait',
    previewColor: '#e6a78e',
    cssFilter:
      'brightness(1.04) contrast(.98) saturate(1.04)',
    canvasFilter:
      'brightness(104%) contrast(98%) saturate(104%)',
    adjustmentDefaults: {
      brightness: 4,
      contrast: -2,
      saturation: 4,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
    portrait: true,
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    category: 'cinematic',
    previewColor: '#2f9da1',
    cssFilter:
      'contrast(1.18) saturate(.86) sepia(.08)',
    canvasFilter:
      'contrast(118%) saturate(86%) sepia(8%)',
    adjustmentDefaults: {
      contrast: 18,
      saturation: -14,
      warmth: 8,
      vignette: 18,
      grain: 8,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'hdr',
    name: 'HDR',
    category: 'dynamic',
    previewColor: '#a4d5b7',
    cssFilter:
      'contrast(1.2) saturate(1.18) brightness(1.03)',
    canvasFilter:
      'contrast(120%) saturate(118%) brightness(103%)',
    adjustmentDefaults: {
      contrast: 20,
      saturation: 18,
      highlights: -8,
      shadows: 14,
      vibrance: 18,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'dream',
    name: 'Dream',
    category: 'soft',
    previewColor: '#d8b6ef',
    cssFilter:
      'brightness(1.08) contrast(.9) saturate(1.05)',
    canvasFilter:
      'brightness(108%) contrast(90%) saturate(105%)',
    adjustmentDefaults: {
      brightness: 8,
      contrast: -10,
      saturation: 5,
      blur: 0.35,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'arctic',
    name: 'Arctic',
    category: 'cool',
    previewColor: '#91dcff',
    cssFilter:
      'brightness(1.03) contrast(1.06) saturate(.9) hue-rotate(8deg)',
    canvasFilter:
      'brightness(103%) contrast(106%) saturate(90%) hue-rotate(8deg)',
    adjustmentDefaults: {
      brightness: 3,
      contrast: 6,
      saturation: -10,
      tint: 12,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'ember',
    name: 'Ember',
    category: 'warm',
    previewColor: '#d9684e',
    cssFilter:
      'sepia(.2) saturate(1.32) hue-rotate(-16deg)',
    canvasFilter:
      'sepia(20%) saturate(132%) hue-rotate(-16deg)',
    adjustmentDefaults: {
      warmth: 42,
      saturation: 16,
      contrast: 8,
      tint: -8,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'noir',
    name: 'Noir',
    category: 'monochrome',
    previewColor: '#68738a',
    cssFilter: 'grayscale(1) contrast(1.32)',
    canvasFilter: 'grayscale(100%) contrast(132%)',
    adjustmentDefaults: {
      saturation: -100,
      contrast: 32,
      blacks: -16,
      vignette: 24,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'cool',
    previewColor: '#4daeca',
    cssFilter:
      'saturate(1.12) hue-rotate(12deg) contrast(1.04)',
    canvasFilter:
      'saturate(112%) hue-rotate(12deg) contrast(104%)',
    adjustmentDefaults: {
      saturation: 12,
      tint: 16,
      warmth: -18,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'forest',
    name: 'Forest',
    category: 'nature',
    previewColor: '#6dbb82',
    cssFilter:
      'saturate(1.18) hue-rotate(-8deg) contrast(1.04)',
    canvasFilter:
      'saturate(118%) hue-rotate(-8deg) contrast(104%)',
    adjustmentDefaults: {
      saturation: 18,
      tint: -16,
      contrast: 4,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'lavender',
    name: 'Lavender',
    category: 'creative',
    previewColor: '#a895ff',
    cssFilter:
      'saturate(1.08) hue-rotate(26deg) brightness(1.03)',
    canvasFilter:
      'saturate(108%) hue-rotate(26deg) brightness(103%)',
    adjustmentDefaults: {
      saturation: 8,
      tint: 20,
      warmth: -8,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
  {
    id: 'film-grain',
    name: 'Film Grain',
    category: 'vintage',
    previewColor: '#b89b79',
    cssFilter: 'contrast(1.08) saturate(.94)',
    canvasFilter: 'contrast(108%) saturate(94%)',
    adjustmentDefaults: {
      contrast: 8,
      saturation: -6,
      grain: 30,
      warmth: 6,
    },
    intensityRange: [0, 1],
    supportsVideo: true,
  },
]);

const customFilters = new Map();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeAdjustments(adjustments = {}) {
  const result = {};

  Object.keys(DEFAULT_ADJUSTMENTS).forEach((key) => {
    result[key] = finite(
      adjustments[key],
      DEFAULT_ADJUSTMENTS[key]
    );
  });

  return result;
}

function mergeAdjustments(
  defaults = {},
  adjustments = {},
  intensity = 1
) {
  const base = normalizeAdjustments(defaults);
  const next = normalizeAdjustments(adjustments);
  const amount = clamp(finite(intensity, 1), 0, 1);

  return Object.keys(DEFAULT_ADJUSTMENTS).reduce(
    (result, key) => {
      result[key] =
        base[key] + next[key] * amount;
      return result;
    },
    {}
  );
}

function adjustmentFilterValues(adjustments) {
  const values = normalizeAdjustments(adjustments);

  const brightness =
    1 + values.brightness / 100 + values.exposure / 120;

  const contrast =
    1 + values.contrast / 100 + values.whites / 180;

  const saturation =
    1 +
    values.saturation / 100 +
    values.vibrance / 160;

  const warmth = values.warmth;
  const tint = values.tint;
  const blur = Math.max(0, values.blur);

  return {
    brightness: clamp(brightness, 0, 4),
    contrast: clamp(contrast, 0, 4),
    saturation: clamp(saturation, 0, 4),
    warmth,
    tint,
    blur,
  };
}

function getFilterDefinition(filterId) {
  if (!filterId) return FILTERS[0];

  return (
    customFilters.get(filterId) ||
    FILTERS.find((filter) => filter.id === filterId) ||
    null
  );
}

function createStructuredError(
  message,
  code,
  details = null
) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
}

function assertMedia(media) {
  if (!media) {
    throw createStructuredError(
      'Media is required.',
      'MEDIA_MISSING'
    );
  }

  const type =
    media.type ||
    media.mediaType ||
    media.tagName?.toLowerCase();

  if (
    type &&
    !['image', 'video', 'img'].includes(
      String(type).toLowerCase()
    )
  ) {
    throw createStructuredError(
      'Unsupported media type.',
      'MEDIA_UNSUPPORTED',
      { type }
    );
  }
}

export function getAvailableFilters(options = {}) {
  const includeCustom = options.includeCustom !== false;

  return includeCustom
    ? [
        ...FILTERS,
        ...Array.from(customFilters.values()),
      ]
    : [...FILTERS];
}

export function getFilterById(filterId) {
  return getFilterDefinition(filterId);
}

export function resetAdjustments() {
  return { ...DEFAULT_ADJUSTMENTS };
}

export function generateFilterCSS(
  filterId = 'aarush',
  options = {}
) {
  const filter = getFilterDefinition(filterId);

  if (!filter) {
    throw createStructuredError(
      `Unknown filter: ${filterId}`,
      'FILTER_NOT_FOUND',
      { filterId }
    );
  }

  const intensity = clamp(
    finite(options.intensity, 1),
    0,
    1
  );

  const adjustments = mergeAdjustments(
    filter.adjustmentDefaults,
    options.adjustments,
    intensity
  );

  const values = adjustmentFilterValues(adjustments);
  const filterParts = [];

  if (filter.cssFilter && intensity > 0) {
    filterParts.push(
      intensity === 1
        ? filter.cssFilter
        : `opacity(${1 - intensity * 0.04}) ${filter.cssFilter}`
    );
  }

  filterParts.push(
    `brightness(${values.brightness})`,
    `contrast(${values.contrast})`,
    `saturate(${values.saturation})`
  );

  if (values.warmth > 0) {
    filterParts.push(
      `sepia(${clamp(values.warmth / 180, 0, 0.75)})`
    );
  }

  if (values.tint !== 0) {
    filterParts.push(
      `hue-rotate(${clamp(values.tint, -180, 180)}deg)`
    );
  }

  if (values.blur > 0) {
    filterParts.push(
      `blur(${clamp(values.blur, 0, 24)}px)`
    );
  }

  return filterParts.join(' ');
}

export function generateCanvasFilter(
  filterId = 'aarush',
  options = {}
) {
  const filter = getFilterDefinition(filterId);

  if (!filter) {
    throw createStructuredError(
      `Unknown filter: ${filterId}`,
      'FILTER_NOT_FOUND',
      { filterId }
    );
  }

  const intensity = clamp(
    finite(options.intensity, 1),
    0,
    1
  );

  const adjustments = mergeAdjustments(
    filter.adjustmentDefaults,
    options.adjustments,
    intensity
  );

  const values = adjustmentFilterValues(adjustments);
  const parts = [];

  if (filter.canvasFilter) {
    parts.push(filter.canvasFilter);
  }

  parts.push(
    `brightness(${Math.round(values.brightness * 100)}%)`,
    `contrast(${Math.round(values.contrast * 100)}%)`,
    `saturate(${Math.round(values.saturation * 100)}%)`
  );

  if (values.warmth > 0) {
    parts.push(
      `sepia(${Math.round(
        clamp(values.warmth / 180, 0, 0.75) * 100
      )}%)`
    );
  }

  if (values.tint !== 0) {
    parts.push(
      `hue-rotate(${Math.round(values.tint)}deg)`
    );
  }

  if (values.blur > 0) {
    parts.push(
      `blur(${Math.round(values.blur)}px)`
    );
  }

  return parts.join(' ');
}

export function applyAdjustments(
  media,
  adjustments = {},
  options = {}
) {
  assertMedia(media);

  const normalized = normalizeAdjustments(
    adjustments
  );

  return {
    media,
    adjustments: normalized,
    cssFilter: generateFilterCSS(
      options.filterId || 'aarush',
      {
        ...options,
        adjustments: normalized,
      }
    ),
    canvasFilter: generateCanvasFilter(
      options.filterId || 'aarush',
      {
        ...options,
        adjustments: normalized,
      }
    ),
    portrait: {
      skinSmoothing: clamp(
        finite(options.skinSmoothing, 0),
        0,
        100
      ),
      skinBrightness: clamp(
        finite(options.skinBrightness, 0),
        0,
        100
      ),
      eyeBrightness: clamp(
        finite(options.eyeBrightness, 0),
        0,
        100
      ),
      eyeSharpness: clamp(
        finite(options.eyeSharpness, 0),
        0,
        100
      ),
      teethWhitening: clamp(
        finite(options.teethWhitening, 0),
        0,
        100
      ),
      faceWarmth: clamp(
        finite(options.faceWarmth, 0),
        -100,
        100
      ),
      beauty: clamp(
        finite(options.beauty, 0),
        0,
        100
      ),
    },
    night: {
      lowLightBoost: clamp(
        finite(options.lowLightBoost, 0),
        0,
        100
      ),
      noiseReduction: clamp(
        finite(options.noiseReduction, 0),
        0,
        100
      ),
      shadowRecovery: clamp(
        finite(options.shadowRecovery, 0),
        0,
        100
      ),
      colorPreservation: clamp(
        finite(options.colorPreservation, 0),
        0,
        100
      ),
      clarity: clamp(
        finite(options.clarity, 0),
        0,
        100
      ),
    },
  };
}

export function applyFilter(
  media,
  filterId = 'aarush',
  options = {}
) {
  assertMedia(media);

  const filter = getFilterDefinition(filterId);

  if (!filter) {
    throw createStructuredError(
      `Unknown filter: ${filterId}`,
      'FILTER_NOT_FOUND',
      { filterId }
    );
  }

  const mediaType =
    media.type ||
    media.mediaType ||
    media.tagName?.toLowerCase();

  if (
    mediaType === 'video' &&
    filter.supportsVideo === false
  ) {
    throw createStructuredError(
      `${filter.name} does not support video.`,
      'VIDEO_FILTER_UNSUPPORTED',
      { filterId }
    );
  }

  return {
    media,
    filter: {
      ...filter,
      intensity: clamp(
        finite(options.intensity, 1),
        0,
        1
      ),
    },
    cssFilter: generateFilterCSS(
      filterId,
      options
    ),
    canvasFilter: generateCanvasFilter(
      filterId,
      options
    ),
    adjustments: normalizeAdjustments(
      options.adjustments
    ),
    renderMode:
      options.renderMode ||
      (mediaType === 'video'
        ? 'video-preview'
        : 'image-preview'),
  };
}

export function prepareExportFilters(options = {}) {
  const filterId = options.filterId || 'aarush';
  const filter = getFilterDefinition(filterId);

  if (!filter) {
    throw createStructuredError(
      `Unknown filter: ${filterId}`,
      'FILTER_NOT_FOUND',
      { filterId }
    );
  }

  const adjustments = normalizeAdjustments(
    options.adjustments
  );

  return {
    filterId,
    filterName: filter.name,
    intensity: clamp(
      finite(options.intensity, 1),
      0,
      1
    ),
    adjustments,
    cssFilter: generateFilterCSS(
      filterId,
      {
        ...options,
        adjustments,
      }
    ),
    canvasFilter: generateCanvasFilter(
      filterId,
      {
        ...options,
        adjustments,
      }
    ),
    cinematic: {
      lutId: options.lutId || null,
      tealOrangeBalance: finite(
        options.tealOrangeBalance,
        0
      ),
      filmContrast: finite(
        options.filmContrast,
        0
      ),
      blackLevel: finite(
        options.blackLevel,
        0
      ),
      highlightRolloff: finite(
        options.highlightRolloff,
        0
      ),
      vignette: finite(options.vignette, 0),
      grainIntensity: finite(
        options.grainIntensity,
        adjustments.grain
      ),
      bloom: finite(options.bloom, 0),
    },
    blur: {
      gaussian: finite(options.gaussianBlur, 0),
      portrait: finite(options.portraitBlur, 0),
      background: finite(options.backgroundBlur, 0),
      radial: finite(options.radialBlur, 0),
      motion: finite(options.motionBlur, 0),
    },
    curves: {
      red: options.curves?.red || null,
      green: options.curves?.green || null,
      blue: options.curves?.blue || null,
      luminance: options.curves?.luminance || null,
    },
    ai: {
      ...AI_FOUNDATION,
      requested: options.ai || null,
    },
    supportsVideo: filter.supportsVideo !== false,
    preparedAt: new Date().toISOString(),
  };
}

export function createCustomFilter(input = {}) {
  const id =
    input.id ||
    `custom-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

  const filter = {
    id,
    name: input.name || 'Custom Filter',
    category: input.category || 'custom',
    previewColor: input.previewColor || '#7c5cff',
    cssFilter: input.cssFilter || '',
    canvasFilter:
      input.canvasFilter || input.cssFilter || '',
    adjustmentDefaults: normalizeAdjustments(
      input.adjustmentDefaults
    ),
    intensityRange: input.intensityRange || [0, 1],
    supportsVideo: input.supportsVideo !== false,
    custom: true,
    source: input.source || 'user',
  };

  return Object.freeze(filter);
}

export function saveCustomFilter(filter) {
  const custom =
    filter?.custom
      ? filter
      : createCustomFilter(filter);

  customFilters.set(custom.id, custom);

  return custom;
}

export function deleteCustomFilter(filterId) {
  if (!filterId) return false;
  return customFilters.delete(filterId);
}

export function getPortraitEnhancementDefaults() {
  return {
    skinSmoothing: 0,
    skinBrightness: 0,
    eyeBrightness: 0,
    eyeSharpness: 0,
    teethWhitening: 0,
    faceWarmth: 0,
    beauty: 0,
  };
}

export function getNightEnhancementDefaults() {
  return {
    lowLightBoost: 0,
    noiseReduction: 0,
    shadowRecovery: 0,
    colorPreservation: 0,
    clarity: 0,
  };
}

export function getCinematicDefaults() {
  return {
    lutId: null,
    tealOrangeBalance: 0,
    filmContrast: 0,
    blackLevel: 0,
    highlightRolloff: 0,
    vignette: 0,
    grainIntensity: 0,
    bloom: 0,
  };
}

export function getAIFoundation() {
  return { ...AI_FOUNDATION };
}

export function createCanvasProcessor(options = {}) {
  const filterId = options.filterId || 'aarush';
  const canvasFilter = generateCanvasFilter(
    filterId,
    options
  );

  return {
    filterId,
    canvasFilter,

    process(context, width, height) {
      if (!context) {
        throw createStructuredError(
          'Canvas context is required.',
          'CANVAS_CONTEXT_MISSING'
        );
      }

      if (!width || !height) {
        throw createStructuredError(
          'Canvas dimensions are required.',
          'CANVAS_DIMENSIONS_MISSING'
        );
      }

      context.save();
      context.filter = canvasFilter;
      context.drawImage(
        context.canvas,
        0,
        0,
        width,
        height
      );
      context.restore();

      return context.canvas;
    },
  };
}

export function getDefaultAdjustments() {
  return { ...DEFAULT_ADJUSTMENTS };
}