const QUALITY_LEVELS = [
  '144p',
  '240p',
  '360p',
  '480p',
  '720p',
  '1080p',
  '1440p',
  '4K',
];

let streamingState = {
  quality: 'auto',
  data_saver: false,
  battery_saver: false,
};

function connection() {
  if (typeof navigator === 'undefined') {
    return {};
  }

  const value =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  return {
    bandwidth: Number(value?.downlink || 0),
    latency: Number(value?.rtt || 0),
    save_data: Boolean(value?.saveData),
    effective_type: value?.effectiveType || null,
  };
}

export function initializeAdaptiveStreaming() {
  return {
    enabled: true,
    qualities: QUALITY_LEVELS,
    state: streamingState,
    network: connection(),
  };
}

export function analyzeBandwidth() {
  return {
    bandwidth: connection().bandwidth || 0,
    unit: 'Mbps',
  };
}

export function analyzeLatency() {
  return {
    latency: connection().latency || null,
    unit: 'ms',
  };
}

export function analyzePacketLoss() {
  return {
    packet_loss: null,
    placeholder: true,
  };
}

export function analyzeBufferHealth(video) {
  if (!video) {
    return {
      buffered_seconds: null,
      health: 'unknown',
    };
  }

  const current = video.currentTime;
  let buffered = 0;

  for (let index = 0; index < video.buffered.length; index += 1) {
    if (
      video.currentTime >= video.buffered.start(index) &&
      video.currentTime <= video.buffered.end(index)
    ) {
      buffered =
        video.buffered.end(index) - current;
      break;
    }
  }

  return {
    buffered_seconds: buffered,
    health:
      buffered >= 10
        ? 'healthy'
        : buffered >= 3
          ? 'moderate'
          : 'low',
  };
}

export function predictOptimalQuality({
  bandwidth = connection().bandwidth,
  latency = connection().latency,
  bufferHealth = 'healthy',
  battery = 100,
  devicePerformance = 'normal',
} = {}) {
  if (
    streamingState.data_saver ||
    streamingState.battery_saver
  ) {
    return '360p';
  }

  if (battery < 15) return '360p';
  if (devicePerformance === 'low') return '480p';
  if (bufferHealth === 'low') return '360p';
  if (bandwidth < 1 || latency > 500) return '360p';
  if (bandwidth < 3 || latency > 250) return '480p';
  if (bandwidth < 8) return '720p';
  if (bandwidth < 15) return '1080p';

  return '1440p';
}

export function switchQuality(quality) {
  if (!QUALITY_LEVELS.includes(quality)) {
    throw new Error('Unsupported streaming quality.');
  }

  streamingState = {
    ...streamingState,
    quality,
  };

  return streamingState;
}

export function enableDataSaver() {
  streamingState = {
    ...streamingState,
    data_saver: true,
    quality: '360p',
  };

  return streamingState;
}

export function disableDataSaver() {
  streamingState = {
    ...streamingState,
    data_saver: false,
  };

  return streamingState;
}

export function enableBatterySaverStreaming() {
  streamingState = {
    ...streamingState,
    battery_saver: true,
    quality: '360p',
  };

  return streamingState;
}

export function disableBatterySaverStreaming() {
  streamingState = {
    ...streamingState,
    battery_saver: false,
  };

  return streamingState;
}

export function getStreamingIntelligenceStatus() {
  return {
    ...streamingState,
    network: connection(),
    predicted_quality:
      streamingState.quality === 'auto'
        ? predictOptimalQuality({})
        : streamingState.quality,
    qualities: QUALITY_LEVELS,
  };
}

export { QUALITY_LEVELS };