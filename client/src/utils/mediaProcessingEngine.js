const SUPPORTED_FORMATS = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
  'video/x-msvideo',
  'video/hevc',
  'video/av1',
];

const MAX_DURATION = 60 * 60;
let processingState = {
  status: 'idle',
  current_file: null,
};

function extension(file) {
  return file?.name?.split('.').pop()?.toLowerCase();
}

export function initializeMediaProcessing() {
  return {
    ready: typeof document !== 'undefined',
    supported_formats: SUPPORTED_FORMATS,
    status: processingState,
  };
}

export function validateVideoFormat(file) {
  const valid =
    SUPPORTED_FORMATS.includes(file?.type) ||
    ['mp4', 'mov', 'webm', 'mkv', 'avi', 'hevc', 'av1'].includes(
      extension(file)
    );

  return {
    valid,
    format: file?.type || extension(file) || null,
  };
}

export function validateVideoDuration(
  duration,
  maxDuration = MAX_DURATION
) {
  return {
    valid: Number(duration || 0) > 0 &&
      Number(duration || 0) <= maxDuration,
    duration: Number(duration || 0),
    max_duration: maxDuration,
  };
}

export async function extractMetadata(file) {
  if (!file) {
    throw new Error('Video file is required.');
  }

  const validation = validateVideoFormat(file);

  if (!validation.valid) {
    throw new Error('Unsupported video format.');
  }

  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');

    video.preload = 'metadata';
    video.src = url;

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);

      resolve({
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        aspect_ratio:
          video.videoWidth / video.videoHeight,
        orientation:
          video.videoWidth >= video.videoHeight
            ? 'landscape'
            : 'portrait',
        frame_rate: null,
        bitrate: null,
        codec: null,
        audio_tracks: null,
        creation_time: new Date(
          file.lastModified || Date.now()
        ).toISOString(),
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to read video metadata.'));
    };
  });
}

export async function generateThumbnail(
  file,
  time = 0
) {
  const metadata = await extractMetadata(file);
  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');

    video.preload = 'metadata';
    video.src = url;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(
        time,
        video.duration
      );
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (thumbnail) => {
          URL.revokeObjectURL(url);

          if (!thumbnail) {
            reject(
              new Error('Thumbnail generation failed.')
            );
            return;
          }

          resolve({
            file: thumbnail,
            width: metadata.width,
            height: metadata.height,
            time,
          });
        },
        'image/jpeg',
        0.82
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to generate thumbnail.'));
    };
  });
}

export async function optimizeVideo(
  file,
  options = {}
) {
  processingState = {
    status: 'optimizing',
    current_file: file?.name || null,
  };

  const metadata = await extractMetadata(file);

  return {
    file,
    metadata,
    strategy: options.strategy || 'adaptive',
    optimized: false,
    pipeline: 'cdn-transcoding-ready',
  };
}

export async function compressVideo(
  file,
  options = {}
) {
  processingState = {
    status: 'compressing',
    current_file: file?.name || null,
  };

  const metadata = await extractMetadata(file);

  return {
    file,
    metadata,
    target_quality: options.quality || '720p',
    compressed: false,
    pipeline: 'browser-or-cloud-encoder-ready',
  };
}

export function estimateUploadSize(
  file,
  quality = 'original'
) {
  const multipliers = {
    original: 1,
    '1080p': 0.8,
    '720p': 0.55,
    '480p': 0.35,
    '360p': 0.22,
  };

  return Math.round(
    Number(file?.size || 0) *
      (multipliers[quality] || 0.55)
  );
}

export function estimateProcessingTime(
  file,
  quality = '720p'
) {
  const sizeMb =
    Number(file?.size || 0) / 1024 / 1024;

  return {
    seconds: Math.max(
      5,
      Math.round(sizeMb * (quality === '4K' ? 1.5 : 0.6))
    ),
    quality,
  };
}

export function getMediaProcessingStatus() {
  return processingState;
}

export async function processVideo(
  file,
  options = {}
) {
  processingState = {
    status: 'processing',
    current_file: file?.name || null,
  };

  const metadata = await extractMetadata(file);

  const result = {
    file,
    metadata,
    thumbnail: null,
    optimized: false,
    compressed: false,
    status: 'completed',
  };

  if (options.thumbnail !== false) {
    result.thumbnail = await generateThumbnail(file);
  }

  processingState = {
    status: 'completed',
    current_file: file?.name || null,
  };

  return result;
}