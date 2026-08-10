import { supabase } from '../lib/supabase';

const NOTIFICATIONS_TABLE = 'notifications';
const PAGE_SIZE = 25;

const NOTIFICATION_TYPES = [
  'like',
  'comment',
  'follow',
  'story_view',
  'story_reply',
  'message',
  'mention',
  'tag',
  'security',
  'system',
];

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
};

function isGuestMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem(GUEST_KEYS.isGuest) === 'true' &&
    window.localStorage.getItem(
      GUEST_KEYS.guestSession
    ) !== null
  );
}

async function getAuthenticatedUser() {
  if (isGuestMode()) {
    throw new Error(
      'Notifications are unavailable in Guest Mode.'
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      'Sign in to access notifications.'
    );
  }

  return user;
}

function validateNotificationType(type) {
  if (!NOTIFICATION_TYPES.includes(type)) {
    throw new Error(
      `Unsupported notification type: ${type}`
    );
  }
}

export async function createNotification({
  recipientId,
  actorId = null,
  type,
  entityId = null,
  entityType = null,
  title,
  body = '',
  imageUrl = null,
}) {
  const currentUser = await getAuthenticatedUser();

  if (!recipientId) {
    throw new Error('Notification recipient is required.');
  }

  if (!title?.trim()) {
    throw new Error('Notification title is required.');
  }

  validateNotificationType(type);

  const resolvedActorId =
    actorId === undefined ? currentUser.id : actorId;

  if (
    resolvedActorId &&
    resolvedActorId !== currentUser.id
  ) {
    throw new Error(
      'The notification actor must be the authenticated user.'
    );
  }

  const { data, error } = await supabase
    .from(NOTIFICATIONS_TABLE)
    .insert({
      recipient_id: recipientId,
      actor_id: resolvedActorId,
      type,
      entity_id: entityId,
      entity_type: entityType,
      title: title.trim(),
      body: body?.trim() || null,
      image_url: imageUrl,
      read: false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getNotifications({
  page = 0,
  pageSize = PAGE_SIZE,
  unreadOnly = false,
} = {}) {
  await getAuthenticatedUser();

  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(NOTIFICATIONS_TABLE)
    .select(`
      id,
      recipient_id,
      actor_id,
      type,
      entity_id,
      entity_type,
      title,
      body,
      image_url,
      read,
      created_at,
      actor:profiles!notifications_actor_id_fkey (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getUnreadCount() {
  await getAuthenticatedUser();

  const { count, error } = await supabase
    .from(NOTIFICATIONS_TABLE)
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('read', false);

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function markAsRead(notificationId) {
  await getAuthenticatedUser();

  if (!notificationId) {
    throw new Error('Notification ID is required.');
  }

  const { data, error } = await supabase
    .from(NOTIFICATIONS_TABLE)
    .update({
      read: true,
    })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function markAllAsRead() {
  await getAuthenticatedUser();

  const { error } = await supabase
    .from(NOTIFICATIONS_TABLE)
    .update({
      read: true,
    })
    .eq('read', false);

  if (error) {
    throw error;
  }

  return true;
}

export async function deleteNotification(
  notificationId
) {
  await getAuthenticatedUser();

  if (!notificationId) {
    throw new Error('Notification ID is required.');
  }

  const { error } = await supabase
    .from(NOTIFICATIONS_TABLE)
    .delete()
    .eq('id', notificationId);

  if (error) {
    throw error;
  }

  return true;
}

export function subscribeToNotifications(callback) {
  if (isGuestMode()) {
    return () => {};
  }

  const channel = supabase
    .channel('aarush-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: NOTIFICATIONS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: NOTIFICATIONS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: NOTIFICATIONS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function isNotificationType(type) {
  return NOTIFICATION_TYPES.includes(type);
}

export function getNotificationTypeLabel(type) {
  const labels = {
    like: 'Like',
    comment: 'Comment',
    follow: 'Follow',
    story_view: 'Story view',
    story_reply: 'Story reply',
    message: 'Message',
    mention: 'Mention',
    tag: 'Tag',
    security: 'Security',
    system: 'System',
  };

  return labels[type] || 'Notification';
}