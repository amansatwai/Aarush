import { supabase } from '../lib/supabase';

const STREAMS_TABLE = 'live_streams';
const EVENTS_TABLE = 'live_stream_events';

const STATES = [
  'Scheduled',
  'Preparing',
  'Live',
  'Paused',
  'Ending',
  'Ended',
  'Archived',
  'Failed',
];

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
      'Sign in to manage live streams.'
    );
  }

  return user;
}

async function logEvent(
  streamId,
  eventType,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      stream_id: streamId,
      actor_id: user.id,
      event_type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeLiveStreaming() {
  return {
    enabled: true,
    guest: guestMode(),
    states: STATES,
    rtmp_ready: true,
    webrtc_ready: true,
    cdn_ready: true,
  };
}

export async function createLiveSession(
  metadata = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create live streams.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(STREAMS_TABLE)
    .insert({
      streamer_id: user.id,
      title: metadata.title || 'Live stream',
      description: metadata.description || null,
      category: metadata.category || null,
      status: 'Preparing',
      visibility: metadata.visibility || 'public',
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  await logEvent(data.id, 'session_created');
  return data;
}

export async function startLiveStream(
  streamId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(STREAMS_TABLE)
    .update({
      status: 'Live',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', streamId)
    .eq('streamer_id', user.id)
    .select()
    .single();

  if (error) throw error;

  await logEvent(streamId, 'stream_started');
  return data;
}

export async function stopLiveStream(
  streamId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(STREAMS_TABLE)
    .update({
      status: 'Ended',
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', streamId)
    .eq('streamer_id', user.id)
    .select()
    .single();

  if (error) throw error;

  await logEvent(streamId, 'stream_stopped');
  return data;
}

export async function pauseLiveStream(
  streamId
) {
  return updateStreamState(streamId, 'Paused');
}

export async function resumeLiveStream(
  streamId
) {
  return updateStreamState(streamId, 'Live');
}

async function updateStreamState(
  streamId,
  status
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(STREAMS_TABLE)
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', streamId)
    .eq('streamer_id', user.id)
    .select()
    .single();

  if (error) throw error;

  await logEvent(streamId, `stream_${status.toLowerCase()}`);
  return data;
}

export async function getLiveSession(
  streamId
) {
  const { data, error } = await supabase
    .from(STREAMS_TABLE)
    .select('*')
    .eq('id', streamId)
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function getActiveStreams({
  page = 0,
  pageSize = 24,
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(STREAMS_TABLE)
    .select(`
      *,
      profiles!live_streams_streamer_id_fkey (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('status', 'Live')
    .eq('visibility', 'public')
    .order('started_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function updateStreamMetadata(
  streamId,
  metadata
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(STREAMS_TABLE)
    .update({
      ...metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', streamId)
    .eq('streamer_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getStreamingHealth(
  streamId
) {
  const stream = await getLiveSession(streamId);

  return {
    stream_id: streamId,
    bitrate: stream?.bitrate || null,
    frame_rate: stream?.frame_rate || null,
    latency: stream?.latency || null,
    packet_loss: stream?.packet_loss || null,
    connection_quality:
      stream?.connection_quality || 'unknown',
    upload_stability:
      stream?.upload_stability || 'unknown',
    viewer_stability:
      stream?.viewer_stability || 'unknown',
    dropped_frames: stream?.dropped_frames || null,
  };
}

export async function getViewerCount(streamId) {
  const { count, error } = await supabase
    .from('live_viewers')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('stream_id', streamId)
    .eq('active', true);

  if (error) throw error;

  return count || 0;
}

export function subscribeToLiveEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-live-streaming')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: STREAMS_TABLE,
      },
      callback
    )
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
        table: 'live_viewers',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export { STATES as LIVE_STREAM_STATES };