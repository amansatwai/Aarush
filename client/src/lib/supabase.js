import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase environment variables. Please define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// --------------------------------------------------
// Storage buckets
// --------------------------------------------------
export const AVATARS_BUCKET = 'avatars';
export const POSTS_BUCKET = 'posts';
export const CHAT_MEDIA_BUCKET = 'chat_media';

export const STORAGE = {
  avatars: AVATARS_BUCKET,
  posts: POSTS_BUCKET,
  chat_media: CHAT_MEDIA_BUCKET,
};

// --------------------------------------------------
// Database tables
// --------------------------------------------------
export const TABLES = {
  profiles: 'profiles',
  posts: 'posts',
  likes: 'post_likes',
  comments: 'comments',
  saved_posts: 'saved_posts',

  conversations: 'conversations',
  conversation_participants: 'conversation_participants',
  messages: 'messages',
  chat_media: 'chat_media',
};

// --------------------------------------------------
// Avatar helpers
// --------------------------------------------------
export function buildAvatarStoragePath(userId, file) {
  const ext = file?.name?.split('.').pop()?.toLowerCase() || 'jpg';
  return `${userId}/avatar-${Date.now()}.${ext}`;
}

// --------------------------------------------------
// Post helpers
// --------------------------------------------------
export function buildPostStoragePath(userId, file) {
  const ext = file?.name?.split('.').pop()?.toLowerCase() || 'jpg';

  const safeName = (file?.name || 'post')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-');

  return `${userId}/posts/${Date.now()}-${safeName}.${ext}`;
}

export function isValidPostImage(file) {
  if (!file) return false;

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10 MB

  return allowedTypes.includes(file.type) && file.size <= maxSize;
}

export function sanitizeCaption(value = '') {
  return value.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export async function uploadPostImage(userId, file) {
  const path = buildPostStoragePath(userId, file);

  const { error } = await supabase.storage.from(POSTS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(POSTS_BUCKET).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}

// --------------------------------------------------
// Chat helpers
// --------------------------------------------------
export function buildChatMediaPath(userId, file) {
  const ext = file?.name?.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = (file?.name || 'chat')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-');
  return `${userId}/chat/${Date.now()}-${safeName}.${ext}`;
}

export function isValidChatImage(file) {
  if (!file) return false;
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024;
  return allowedTypes.includes(file.type) && file.size <= maxSize;
}

export async function uploadChatImage(userId, file) {
  const path = buildChatMediaPath(userId, file);

  const { error } = await supabase.storage.from(CHAT_MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(CHAT_MEDIA_BUCKET).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}

export function normalizeConversationId(a, b) {
  return [a, b].sort().join('__');
}

export function formatChatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatChatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export function timeAgo(value) {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString();
}

// --------------------------------------------------
// Profile / Post / Comment mapping helpers
// --------------------------------------------------
export function mapProfileRow(row) {
  if (!row) {
    return {
      id: '',
      username: '',
      full_name: '',
      avatar_url: '',
    };
  }

  return {
    id: row.id || '',
    username: row.username || '',
    full_name: row.full_name || '',
    avatar_url: row.avatar_url || '',
  };
}

export function mapPostRow(row) {
  if (!row) return null;

  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    id: row.id,
    user_id: row.user_id,
    image_url: row.image_url,
    caption: row.caption || '',
    likes_count: row.likes_count || 0,
    comments_count: row.comments_count || 0,
    created_at: row.created_at,
    profile: mapProfileRow(profile),
  };
}

export function mapCommentRow(row) {
  if (!row) return null;

  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    text: row.text || '',
    created_at: row.created_at,
    profile: mapProfileRow(profile),
  };
}

export function mapMessageRow(row) {
  if (!row) return null;

  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const media = Array.isArray(row.chat_media) ? row.chat_media[0] : row.chat_media;

  return {
    id: row.id,
    conversation_id: row.conversation_id,
    sender_id: row.sender_id,
    receiver_id: row.receiver_id || '',
    message_type: row.message_type || 'text',
    content: row.content || '',
    reply_to: row.reply_to || null,
    is_deleted: !!row.is_deleted,
    is_read: !!row.is_read,
    created_at: row.created_at,
    updated_at: row.updated_at,
    profile: mapProfileRow(profile),
    media: media
      ? {
          id: media.id,
          file_url: media.file_url || '',
          file_type: media.file_type || '',
          file_size: media.file_size || 0,
        }
      : null,
  };
}

export function mapConversationRow(row, currentUserId) {
  if (!row) return null;

  const participants = row.conversation_participants || row.participants || [];
  const peer = participants.find((p) => p.user_id !== currentUserId) || participants[0] || null;

  return {
    id: row.id,
    type: row.type || 'direct',
    name: row.name || '',
    created_by: row.created_by || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_message_at: row.last_message_at || null,
    unread_count: row.unread_count || 0,
    peer: peer
      ? {
          user_id: peer.user_id,
          role: peer.role || 'member',
          last_read_at: peer.last_read_at || null,
          profile: mapProfileRow(peer.profiles || peer.profile),
        }
      : null,
    last_message: row.last_message
      ? {
          id: row.last_message.id,
          message_type: row.last_message.message_type || 'text',
          content: row.last_message.content || '',
          image_url: row.last_message.image_url || '',
          sender_id: row.last_message.sender_id || '',
          created_at: row.last_message.created_at || '',
          is_read: !!row.last_message.is_read,
        }
      : null,
  };
}