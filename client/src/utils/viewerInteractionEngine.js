import { supabase } from '../lib/supabase';

const CHAT_TABLE = 'live_chat_messages';
const VIEWERS_TABLE = 'live_viewers';
const INTERACTIONS_TABLE = 'live_interactions';

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

async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user || null;
}

async function requireUser() {
  const user = await getUser();

  if (!user) {
    throw new Error(
      'Sign in to interact with live streams.'
    );
  }

  return user;
}

export async function initializeViewerInteraction() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    chat: true,
    reactions: true,
    moderation_ready: true,
  };
}

export async function sendLiveMessage(
  streamId,
  message
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot send live messages.'
    );
  }

  const user = await requireUser();

  if (!message?.trim()) {
    throw new Error('Message is required.');
  }

  const { data, error } = await supabase
    .from(CHAT_TABLE)
    .insert({
      stream_id: streamId,
      sender_id: user.id,
      message,
      status: 'visible',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function sendLiveReaction(
  streamId,
  reaction = 'heart'
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot send live reactions.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(INTERACTIONS_TABLE)
    .insert({
      stream_id: streamId,
      user_id: user.id,
      interaction_type: 'reaction',
      value: reaction,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function joinLiveSession(
  streamId
) {
  if (guestMode()) {
    return {
      guest: true,
      stream_id: streamId,
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(VIEWERS_TABLE)
    .upsert(
      {
        stream_id: streamId,
        viewer_id: user.id,
        active: true,
        joined_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: 'stream_id,viewer_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function leaveLiveSession(
  streamId
) {
  if (guestMode()) return true;

  const user = await requireUser();

  const { error } = await supabase
    .from(VIEWERS_TABLE)
    .update({
      active: false,
      left_at: new Date().toISOString(),
    })
    .eq('stream_id', streamId)
    .eq('viewer_id', user.id);

  if (error) throw error;

  return true;
}

export async function followStreamer(
  streamerId
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot follow streamers.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from('follows')
    .upsert(
      {
        follower_id: user.id,
        following_id: streamerId,
        status: 'accepted',
      },
      {
        onConflict: 'follower_id,following_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function reportLiveStream(
  streamId,
  reason = ''
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from('live_stream_reports')
    .insert({
      stream_id: streamId,
      reporter_id: user.id,
      reason,
      status: 'open',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function muteViewer(
  streamId,
  viewerId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from('live_moderation_actions')
    .insert({
      stream_id: streamId,
      moderator_id: user.id,
      viewer_id: viewerId,
      action: 'mute',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function blockViewer(
  streamId,
  viewerId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from('live_moderation_actions')
    .insert({
      stream_id: streamId,
      moderator_id: user.id,
      viewer_id: viewerId,
      action: 'block',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function pinMessage(
  messageId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(CHAT_TABLE)
    .update({
      pinned: true,
      pinned_by: user.id,
      pinned_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getLiveChat(
  streamId,
  { page = 0, pageSize = 50 } = {}
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(CHAT_TABLE)
    .select(`
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('stream_id', streamId)
    .eq('status', 'visible')
    .order('created_at', {
      ascending: true,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function getViewerList(
  streamId
) {
  const { data, error } = await supabase
    .from(VIEWERS_TABLE)
    .select(`
      *,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('stream_id', streamId)
    .eq('active', true)
    .order('joined_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function getInteractionAnalytics(
  streamId
) {
  const { data, error } = await supabase
    .from(INTERACTIONS_TABLE)
    .select('*')
    .eq('stream_id', streamId);

  if (error) throw error;

  const interactions = data || [];

  return {
    reactions: interactions.filter(
      (item) =>
        item.interaction_type === 'reaction'
    ).length,
    likes: interactions.filter(
      (item) => item.interaction_type === 'like'
    ).length,
    shares: interactions.filter(
      (item) => item.interaction_type === 'share'
    ).length,
    chat_messages: 0,
    follower_conversion: 0,
  };
}

export function subscribeToViewerInteractions(
  streamId,
  callback
) {
  const channel = supabase
    .channel(`aarush-viewer-interactions:${streamId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: CHAT_TABLE,
        filter: `stream_id=eq.${streamId}`,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: VIEWERS_TABLE,
        filter: `stream_id=eq.${streamId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}