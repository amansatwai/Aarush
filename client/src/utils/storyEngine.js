import { supabase } from '../lib/supabase';

const STORY_TABLE = 'stories';
const STORY_VIEWS_TABLE = 'story_views';
const STORY_REPLIES_TABLE = 'story_replies';
const STORY_BUCKET = 'stories';
const STORY_DURATION_MS = 24 * 60 * 60 * 1000;

const IMAGE_TYPES = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const VIDEO_TYPES = Object.freeze([
  'video/mp4',
  'video/quicktime',
  'video/webm',
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const musicKeys = [
  'song_id',
  'song_title',
  'artist',
  'album',
  'audio_url',
  'song_start',
  'song_end',
  'video_start',
  'video_end',
  'fade_in',
  'fade_out',
  'music_volume',
  'original_volume',
  'beat_sync',
  'waveform_data',
];

function createStoryError(
  message,
  code = 'STORY_ERROR',
  details = null
) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
}

function normalizeMediaType(type, file) {
  const value = String(type || file?.type || '')
    .toLowerCase();

  if (value.startsWith('image/')) return 'image';
  if (value.startsWith('video/')) return 'video';

  return null;
}

function getFileExtension(file) {
  const fileName = String(file?.name || '');
  const extension = fileName.split('.').pop();

  return extension
    ? extension.toLowerCase().replace(/[^a-z0-9]/g, '')
    : '';
}

function getMimeType(file, mediaType) {
  if (file?.type) return file.type;

  if (mediaType === 'image') {
    return 'image/jpeg';
  }

  if (mediaType === 'video') {
    return 'video/webm';
  }

  return 'application/octet-stream';
}

function getMaxFileSize(mediaType) {
  return mediaType === 'video'
    ? MAX_VIDEO_SIZE
    : MAX_IMAGE_SIZE;
}

function assertSupabase() {
  if (!supabase) {
    throw createStoryError(
      'Supabase is unavailable.',
      'SUPABASE_UNAVAILABLE'
    );
  }
}

function assertFile(file) {
  if (!file) {
    throw createStoryError(
      'Story media is required.',
      'MEDIA_MISSING'
    );
  }

  if (
    typeof file.arrayBuffer !== 'function' &&
    typeof file.size !== 'number'
  ) {
    throw createStoryError(
      'Invalid story media.',
      'MEDIA_INVALID'
    );
  }
}

export function validateStoryMedia(file, mediaType) {
  assertFile(file);

  const normalizedType = normalizeMediaType(
    mediaType,
    file
  );
  const mimeType = getMimeType(file, normalizedType);
  const extension = getFileExtension(file);
  const validType =
    normalizedType === 'image'
      ? IMAGE_TYPES.includes(mimeType) ||
        ['jpg', 'jpeg', 'png', 'webp'].includes(
          extension
        )
      : normalizedType === 'video'
        ? VIDEO_TYPES.includes(mimeType) ||
          ['mp4', 'mov', 'webm'].includes(extension)
        : false;

  if (!normalizedType || !validType) {
    throw createStoryError(
      'Unsupported story media format.',
      'MEDIA_UNSUPPORTED',
      {
        mimeType,
        extension,
        supportedImages: IMAGE_TYPES,
        supportedVideos: VIDEO_TYPES,
      }
    );
  }

  const maxSize = getMaxFileSize(normalizedType);

  if (Number(file.size) > maxSize) {
    throw createStoryError(
      normalizedType === 'video'
        ? 'Video must be smaller than 100 MB.'
        : 'Image must be smaller than 10 MB.',
      'MEDIA_TOO_LARGE',
      {
        size: file.size,
        maxSize,
      }
    );
  }

  return {
    mediaType: normalizedType,
    mimeType,
    extension:
      extension ||
      (normalizedType === 'image' ? 'jpg' : 'webm'),
    size: Number(file.size) || 0,
  };
}

function normalizePrivacy(value) {
  const allowed = [
    'public',
    'followers',
    'close_friends',
    'private',
    'only_me',
  ];

  return allowed.includes(value) ? value : 'public';
}

function normalizeArray(value) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : [];
}

function normalizeMusicMetadata(music) {
  const source =
    music && typeof music === 'object' ? music : {};

  return musicKeys.reduce((result, key) => {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
    return result;
  }, {});
}

function normalizeOverlayMetadata(overlays) {
  if (!overlays || typeof overlays !== 'object') {
    return {
      text: [],
      drawings: [],
      stickers: [],
      gifs: [],
      polls: [],
      mentions: [],
      hashtags: [],
      links: [],
      locations: [],
      emojis: [],
    };
  }

  return {
    text: normalizeArray(
      overlays.text || overlays.textLayers
    ),
    drawings: normalizeArray(
      overlays.drawings || overlays.drawingLayers
    ),
    stickers: normalizeArray(overlays.stickers),
    gifs: normalizeArray(overlays.gifs),
    polls: normalizeArray(overlays.polls),
    mentions: normalizeArray(overlays.mentions),
    hashtags: normalizeArray(overlays.hashtags),
    links: normalizeArray(overlays.links),
    locations: normalizeArray(overlays.locations),
    emojis: normalizeArray(overlays.emojis),
  };
}

export function getStoryExpiry(createdAt = new Date()) {
  const date = new Date(createdAt);
  const validDate = Number.isNaN(date.getTime())
    ? new Date()
    : date;

  return new Date(
    validDate.getTime() + STORY_DURATION_MS
  ).toISOString();
}

export function isStoryExpired(story) {
  if (!story) return true;

  const expiry = new Date(story.expires_at);

  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  return expiry.getTime() <= Date.now();
}

export function getRemainingStoryTime(story) {
  if (!story) return 0;

  const expiry = new Date(story.expires_at);

  if (Number.isNaN(expiry.getTime())) {
    return STORY_DURATION_MS;
  }

  return Math.max(0, expiry.getTime() - Date.now());
}

export function filterExpiredStories(stories) {
  return normalizeArray(stories).filter(
    (story) => !isStoryExpired(story)
  );
}

export function prepareStoryPayload(input = {}) {
  const source =
    input && typeof input === 'object' ? input : {};

  const media = source.media || {};
  const createdAt =
    source.created_at || new Date().toISOString();

  return {
    media_url:
      source.media_url ||
      media.publicUrl ||
      media.url ||
      null,
    media_type:
      source.media_type ||
      media.mediaType ||
      media.type ||
      'image',
    thumbnail_url:
      source.thumbnail_url ||
      media.thumbnailUrl ||
      null,
    caption: String(source.caption || '').trim(),
    privacy: normalizePrivacy(source.privacy),
    music_metadata: normalizeMusicMetadata(
      source.music_metadata || source.music
    ),
    overlay_metadata: normalizeOverlayMetadata(
      source.overlay_metadata || source.overlays
    ),
    location: source.location || null,
    hashtags: normalizeArray(source.hashtags),
    duration: Number(source.duration) || 0,
    created_at: createdAt,
    expires_at:
      source.expires_at || getStoryExpiry(createdAt),
    updated_at:
      source.updated_at || new Date().toISOString(),
  };
}

async function getCurrentUser() {
  assertSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw createStoryError(
      error.message || 'Unable to read current user.',
      'AUTH_ERROR',
      error
    );
  }

  if (!user) {
    throw createStoryError(
      'You must be signed in to create a story.',
      'USER_MISSING'
    );
  }

  return user;
}

function makeStoragePath(userId, file, mediaType) {
  const extension =
    getFileExtension(file) ||
    (mediaType === 'image' ? 'jpg' : 'webm');

  const safeExtension = extension
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  return `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${safeExtension}`;
}

export async function uploadStoryMedia(
  file,
  options = {}
) {
  assertSupabase();
  assertFile(file);

  const user = await getCurrentUser();
  const validation = validateStoryMedia(
    file,
    options.mediaType
  );
  const path = makeStoragePath(
    user.id,
    file,
    validation.mediaType
  );

  const onProgress =
    typeof options.onProgress === 'function'
      ? options.onProgress
      : null;

  onProgress?.(0);

  const { error: uploadError } =
    await supabase.storage
      .from(STORY_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        contentType: validation.mimeType,
        upsert: false,
      });

  if (uploadError) {
    throw createStoryError(
      uploadError.message ||
        'Story media upload failed.',
      'UPLOAD_FAILED',
      uploadError
    );
  }

  onProgress?.(0.8);

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(STORY_BUCKET)
    .getPublicUrl(path);

  const publicUrl = publicUrlData?.publicUrl || '';

  if (!publicUrl) {
    throw createStoryError(
      'Story media URL could not be generated.',
      'PUBLIC_URL_FAILED'
    );
  }

  onProgress?.(1);

  return {
    path,
    publicUrl,
    mediaUrl: publicUrl,
    mediaType: validation.mediaType,
    mimeType: validation.mimeType,
    size: validation.size,
    thumbnailUrl: null,
    metadata: {
      bucket: STORY_BUCKET,
      path,
      name: file.name || null,
      lastModified: file.lastModified || null,
    },
  };
}

export async function createStory(input = {}) {
  assertSupabase();

  const user = await getCurrentUser();
  const source =
    input && typeof input === 'object' ? input : {};

  let uploadedMedia = source.uploadedMedia;

  if (
    !uploadedMedia &&
    source.file
  ) {
    uploadedMedia = await uploadStoryMedia(
      source.file,
      {
        mediaType: source.mediaType,
        onProgress: source.onProgress,
      }
    );
  }

  const payload = prepareStoryPayload({
    ...source,
    media: uploadedMedia || source.media,
    media_url:
      source.media_url || uploadedMedia?.publicUrl,
    media_type:
      source.media_type || uploadedMedia?.mediaType,
    thumbnail_url:
      source.thumbnail_url ||
      uploadedMedia?.thumbnailUrl,
  });

  if (!payload.media_url) {
    throw createStoryError(
      'Uploaded story media is missing.',
      'MEDIA_URL_MISSING'
    );
  }

  const { data, error } = await supabase
    .from(STORY_TABLE)
    .insert({
      ...payload,
      user_id: user.id,
    })
    .select('*')
    .single();

  if (error) {
    throw createStoryError(
      error.message || 'Story creation failed.',
      'CREATE_FAILED',
      error
    );
  }

  return data;
}

export async function getStoryFeed(options = {}) {
  assertSupabase();

  const user = await getCurrentUser();
  const limit = Number(options.limit) || 100;

  const { data, error } = await supabase
    .from(STORY_TABLE)
    .select(`
      *,
      profile:profiles(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw createStoryError(
      error.message || 'Unable to load story feed.',
      'FEED_FAILED',
      error
    );
  }

  const stories = filterExpiredStories(data || []);
  const viewedIds = new Set(
    normalizeArray(options.viewedStoryIds)
  );

  const grouped = new Map();

  stories.forEach((story) => {
    const userId = story.user_id;

    if (!grouped.has(userId)) {
      grouped.set(userId, {
        user: story.profile || {
          id: userId,
        },
        stories: [],
        unread: true,
        latestStory: story,
      });
    }

    const group = grouped.get(userId);

    group.stories.push(story);

    if (
      viewedIds.has(story.id) ||
      story.viewed === true
    ) {
      group.unread = false;
    }

    if (
      new Date(story.created_at).getTime() >
      new Date(group.latestStory.created_at).getTime()
    ) {
      group.latestStory = story;
    }
  });

  const result = [...grouped.values()];

  result.forEach((group) => {
    group.stories.sort(
      (first, second) =>
        new Date(first.created_at).getTime() -
        new Date(second.created_at).getTime()
    );
  });

  return result.sort(
    (first, second) =>
      new Date(second.latestStory.created_at).getTime() -
      new Date(first.latestStory.created_at).getTime()
  );
}

export async function getUserStories(userId) {
  assertSupabase();

  if (!userId) {
    throw createStoryError(
      'A user id is required.',
      'USER_ID_MISSING'
    );
  }

  const { data, error } = await supabase
    .from(STORY_TABLE)
    .select(`
      *,
      profile:profiles(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', {
      ascending: true,
    });

  if (error) {
    throw createStoryError(
      error.message || 'Unable to load user stories.',
      'USER_STORIES_FAILED',
      error
    );
  }

  return filterExpiredStories(data || []);
}

export async function getStoryById(storyId) {
  assertSupabase();

  if (!storyId) {
    throw createStoryError(
      'A story id is required.',
      'STORY_ID_MISSING'
    );
  }

  const { data, error } = await supabase
    .from(STORY_TABLE)
    .select(`
      *,
      profile:profiles(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('id', storyId)
    .maybeSingle();

  if (error) {
    throw createStoryError(
      error.message || 'Unable to load story.',
      'STORY_FETCH_FAILED',
      error
    );
  }

  if (!data || isStoryExpired(data)) {
    return null;
  }

  return data;
}

export function getStoryPreview(story) {
  if (!story || isStoryExpired(story)) {
    return null;
  }

  return {
    id: story.id,
    userId: story.user_id,
    mediaUrl: story.media_url,
    thumbnailUrl: story.thumbnail_url || story.media_url,
    mediaType: story.media_type,
    caption: story.caption || '',
    createdAt: story.created_at,
    expiresAt: story.expires_at,
    remainingTime: getRemainingStoryTime(story),
    privacy: story.privacy || 'public',
    profile: story.profile || null,
  };
}

export async function markStoryViewed(storyId) {
  assertSupabase();

  const user = await getCurrentUser();

  if (!storyId) {
    throw createStoryError(
      'A story id is required.',
      'STORY_ID_MISSING'
    );
  }

  const { data: existing } = await supabase
    .from(STORY_VIEWS_TABLE)
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    return {
      viewed: true,
      duplicate: true,
      view: existing,
    };
  }

  const { data, error } = await supabase
    .from(STORY_VIEWS_TABLE)
    .insert({
      story_id: storyId,
      user_id: user.id,
      viewed_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    if (
      error.code === '23505' ||
      /duplicate|unique/i.test(error.message || '')
    ) {
      return {
        viewed: true,
        duplicate: true,
      };
    }

    throw createStoryError(
      error.message || 'Unable to mark story viewed.',
      'VIEW_FAILED',
      error
    );
  }

  return {
    viewed: true,
    duplicate: false,
    view: data,
  };
}

export async function getStoryViews(storyId) {
  assertSupabase();

  if (!storyId) {
    throw createStoryError(
      'A story id is required.',
      'STORY_ID_MISSING'
    );
  }

  const { data, error } = await supabase
    .from(STORY_VIEWS_TABLE)
    .select(`
      id,
      story_id,
      user_id,
      viewed_at,
      profile:profiles(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('story_id', storyId)
    .order('viewed_at', {
      ascending: false,
    });

  if (error) {
    throw createStoryError(
      error.message || 'Unable to load story views.',
      'VIEWS_FAILED',
      error
    );
  }

  return {
    total: data?.length || 0,
    views: data || [],
    viewers: data || [],
  };
}

export async function replyToStory(input = {}) {
  assertSupabase();

  const user = await getCurrentUser();
  const storyId = input.storyId;

  if (!storyId) {
    throw createStoryError(
      'A story id is required.',
      'STORY_ID_MISSING'
    );
  }

  const payload = {
    story_id: storyId,
    user_id: user.id,
    text: String(input.text || '').trim() || null,
    reaction: input.reaction || null,
    media_url: input.mediaUrl || null,
    media_type: input.mediaType || null,
  };

  if (
    !payload.text &&
    !payload.reaction &&
    !payload.media_url
  ) {
    throw createStoryError(
      'A reply message, reaction, or media is required.',
      'REPLY_EMPTY'
    );
  }

  const { data, error } = await supabase
    .from(STORY_REPLIES_TABLE)
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw createStoryError(
      error.message || 'Unable to reply to story.',
      'REPLY_FAILED',
      error
    );
  }

  return data;
}

export async function deleteStory(storyId) {
  assertSupabase();

  const user = await getCurrentUser();
  const story = await getStoryById(storyId);

  if (!story) {
    throw createStoryError(
      'Story not found.',
      'STORY_NOT_FOUND'
    );
  }

  if (story.user_id !== user.id) {
    throw createStoryError(
      'You cannot delete this story.',
      'PERMISSION_DENIED'
    );
  }

  const storagePath =
    story.storage_path ||
    story.media_path ||
    null;

  if (storagePath) {
    const { error: storageError } =
      await supabase.storage
        .from(STORY_BUCKET)
        .remove([storagePath]);

    if (storageError) {
      throw createStoryError(
        storageError.message ||
          'Story media deletion failed.',
        'STORAGE_DELETE_FAILED',
        storageError
      );
    }
  }

  const { error } = await supabase
    .from(STORY_TABLE)
    .delete()
    .eq('id', storyId)
    .eq('user_id', user.id);

  if (error) {
    throw createStoryError(
      error.message || 'Story deletion failed.',
      'DELETE_FAILED',
      error
    );
  }

  return {
    deleted: true,
    id: storyId,
  };
}

export async function canViewStory(
  story,
  viewer = null
) {
  if (!story || isStoryExpired(story)) {
    return false;
  }

  const viewerId =
    viewer?.id || viewer?.user_id || null;

  if (story.user_id === viewerId) {
    return true;
  }

  const privacy = normalizePrivacy(story.privacy);

  if (privacy === 'public') return true;
  if (privacy === 'private') return false;
  if (privacy === 'only_me') return false;
  if (!viewerId) return false;

  if (privacy === 'followers') {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', viewerId)
      .eq('following_id', story.user_id)
      .eq('status', 'accepted')
      .maybeSingle();

    return Boolean(data);
  }

  if (privacy === 'close_friends') {
    const { data } = await supabase
      .from('close_friends')
      .select('id')
      .eq('user_id', story.user_id)
      .eq('friend_id', viewerId)
      .maybeSingle();

    return Boolean(data);
  }

  return false;
}

export async function canReplyToStory(
  story,
  viewer = null
) {
  return canViewStory(story, viewer);
}

export async function canShareStory(
  story,
  viewer = null
) {
  if (!(await canViewStory(story, viewer))) {
    return false;
  }

  return normalizePrivacy(story?.privacy) === 'public';
}

export function subscribeToStories(
  callback,
  options = {}
) {
  if (!supabase || typeof callback !== 'function') {
    return () => {};
  }

  const channelName =
    options.channelName ||
    `aarush-stories-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: STORY_TABLE,
      },
      (payload) => {
        try {
          callback({
            ...payload,
            table: STORY_TABLE,
          });
        } catch {
          // Consumer errors must not break realtime.
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: STORY_VIEWS_TABLE,
      },
      (payload) => {
        try {
          callback({
            ...payload,
            table: STORY_VIEWS_TABLE,
          });
        } catch {
          // Consumer errors must not break realtime.
        }
      }
    )
    .subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' && options.onError) {
        options.onError(error);
      }
    });

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch {
      try {
        channel.unsubscribe();
      } catch {
        // Realtime cleanup is best effort.
      }
    }
  };
}

export async function getStorySyncState() {
  assertSupabase();

  const stories = await getStoryFeed();

  return {
    syncedAt: new Date().toISOString(),
    stories,
    activeCount: stories.reduce(
      (total, group) =>
        total + group.stories.length,
      0
    ),
  };
}