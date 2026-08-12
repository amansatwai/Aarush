import { supabase } from '../lib/supabase';

const EVENTS_TABLE = 'video_streaming_events';

export const QUALITY_LEVELS = [
  '144p',
  '240p',
  '360p',
  '480p',
  '720p',
  '1080p',
  '1440p',
  '4K',
];

let selectedQuality = 'auto';
let streamingState = {
  status: 'idle',
  quality: 'auto',
  auto_quality: true,
};

function guestMode() {
  if (typeof window === 'undefined') return false;

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error(
      'Sign in to use cloud video infrastructure.'
    );
  }

  return user;
}

export async function initializeVideoInfrastructure() {
  return {
    enabled: true,
    guest: guestMode(),
    qualities: QUALITY_LEVELS,
    state: streamingState,
  };
}

export async function prepareVideoUpload(
  file,
  metadata = {}
) {
  if (guestMode()) {
    return {
      local_only: true,
      file,
      metadata,
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from('video_processing_queue')
    .insert({
      user_id: user.id,
      file_name: file?.name,
      file_size: file?.size,
      mime_type: file?.type,
      metadata,
      status: 'Pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function prepareVideoPlayback(
  video
) {
  const manifest = await getStreamingManifest(video);

  streamingState = {
    ...streamingState,
    status: 'ready',
    manifest,
  };

  return manifest;
}

export async function getStreamingManifest(video) {
  return {
    video_id: video?.id || null,
    source:
      video?.stream_url ||
      video?.video_url ||
      video?.media_url ||
      null,
    thumbnail:
      video?.thumbnail_url ||
      video?.poster_url ||
      null,
    qualities: QUALITY_LEVELS.map((quality) => ({
      quality,
      url:
        video?.renditions?.[quality] ||
        video?.stream_url ||
        null,
      available:
        Boolean(video?.renditions?.[quality]) ||
        quality === 'original',
    })),
    protocol: 'HLS-ready',
    cdn_ready: true,
  };
}

export function getAvailableQualities(video) {
  const manifest = video?.manifest || video;

  return QUALITY_LEVELS.filter(
    (quality) =>
      manifest?.renditions?.[quality] ||
      quality === 'original' ||
      !video
  );
}

export function getAdaptiveQuality({
  bandwidth = 0,
  battery = 100,
} = {}) {
  if (battery < 15) return '360p';
  if (bandwidth < 1) return '360p';
  if (bandwidth < 3) return '480p';
  if (bandwidth < 8) return '720p';
  if (bandwidth < 15) return '1080p';

  return '1440p';
}

export function selectQuality(quality) {
  if (!QUALITY_LEVELS.includes(quality)) {
    throw new Error('Unsupported quality level.');
  }

  selectedQuality = quality;

  streamingState = {
    ...streamingState,
    quality,
    auto_quality: false,
  };

  return quality;
}

export function enableAutoQuality() {
  selectedQuality = 'auto';

  streamingState = {
    ...streamingState,
    quality: 'auto',
    auto_quality: true,
  };

  return true;
}

export function disableAutoQuality() {
  streamingState = {
    ...streamingState,
    auto_quality: false,
  };

  return true;
}

export function getStreamingStatus() {
  return {
    ...streamingState,
    selected_quality: selectedQuality,
  };
}

export function getStreamingSessions() {
  return {
    status: streamingState.status,
    quality: selectedQuality,
    network_aware: true,
    battery_aware: true,
    cdn_ready: true,
  };
}

export function subscribeToStreamingEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-video-streaming')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: EVENTS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'video_processing_queue',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}