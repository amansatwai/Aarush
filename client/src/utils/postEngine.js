import { supabase } from '../lib/supabase';

const POSTS_BUCKET = 'posts';
const POSTS_TABLE = 'posts';
const LIKES_TABLE = 'likes';
const COMMENTS_TABLE = 'comments';
const SAVED_TABLE = 'saved_posts';

const PROFILE_FIELDS = `
  id,
  full_name,
  username,
  avatar_url,
  profession
`;

function normalizeHashtags(hashtags) {
  if (Array.isArray(hashtags)) {
    return hashtags
      .map((tag) => String(tag).trim().replace(/^#/, ''))
      .filter(Boolean);
  }

  return String(hashtags || '')
    .split(/[\s,]+/)
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);
}

function mediaTypeFromFile(file) {
  if (file?.type?.startsWith('video/')) {
    return 'video';
  }

  return 'image';
}

function getFileExtension(file) {
  const extension = file?.name?.split('.').pop()?.toLowerCase();

  if (extension) {
    return extension;
  }

  return mediaTypeFromFile(file) === 'video' ? 'mp4' : 'jpg';
}

function assertPostMedia(file) {
  if (!file) {
    throw new Error('Select an image or video first.');
  }

  if (
    !file.type?.startsWith('image/') &&
    !file.type?.startsWith('video/')
  ) {
    throw new Error('Only image and video files are supported.');
  }
}

async function getAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('Sign in to continue.');
  }

  return user;
}

function getStoragePathFromUrl(mediaUrl) {
  if (!mediaUrl) {
    return null;
  }

  try {
    const url = new URL(mediaUrl);
    const marker = `/storage/v1/object/public/${POSTS_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(
      url.pathname.slice(markerIndex + marker.length)
    );
  } catch {
    return null;
  }
}

export async function createPost({
  file,
  caption = '',
  location = '',
  hashtags = [],
  onProgress,
}) {
  const user = await getAuthenticatedUser();

  assertPostMedia(file);

  const extension = getFileExtension(file);
  const randomPart =
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const storagePath = `${user.id}/${Date.now()}-${randomPart}.${extension}`;
  const mediaType = mediaTypeFromFile(file);

  onProgress?.(10);

  const { error: uploadError } = await supabase.storage
    .from(POSTS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  onProgress?.(70);

  const { data: publicUrlData } = supabase.storage
    .from(POSTS_BUCKET)
    .getPublicUrl(storagePath);

  const mediaUrl = publicUrlData?.publicUrl;

  if (!mediaUrl) {
    await supabase.storage
      .from(POSTS_BUCKET)
      .remove([storagePath]);

    throw new Error('Unable to generate the post media URL.');
  }

  const { data, error: insertError } = await supabase
    .from(POSTS_TABLE)
    .insert({
      user_id: user.id,
      caption: caption.trim() || null,
      media_url: mediaUrl,
      media_type: mediaType,
      location: location.trim() || null,
      hashtags: normalizeHashtags(hashtags),
    })
    .select(`
      id,
      user_id,
      caption,
      media_url,
      media_type,
      location,
      hashtags,
      like_count,
      comment_count,
      created_at,
      updated_at,
      profiles!posts_user_id_fkey (${PROFILE_FIELDS})
    `)
    .single();

  if (insertError) {
    await supabase.storage
      .from(POSTS_BUCKET)
      .remove([storagePath]);

    throw insertError;
  }

  onProgress?.(100);

  return {
    ...data,
    storage_path: storagePath,
  };
}

export async function deletePost(postId) {
  const user = await getAuthenticatedUser();

  const { data: post, error: postError } = await supabase
    .from(POSTS_TABLE)
    .select('id, user_id, media_url')
    .eq('id', postId)
    .single();

  if (postError) {
    throw postError;
  }

  if (post.user_id !== user.id) {
    throw new Error('You can only delete your own posts.');
  }

  const { error: deleteError } = await supabase
    .from(POSTS_TABLE)
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id);

  if (deleteError) {
    throw deleteError;
  }

  const storagePath = getStoragePathFromUrl(post.media_url);

  if (storagePath) {
    await supabase.storage
      .from(POSTS_BUCKET)
      .remove([storagePath]);
  }

  return true;
}

export async function getFeedPosts({
  page = 0,
  pageSize = 10,
  userId = null,
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .select(`
      id,
      user_id,
      caption,
      media_url,
      media_type,
      location,
      hashtags,
      like_count,
      comment_count,
      created_at,
      updated_at,
      profiles!posts_user_id_fkey (${PROFILE_FIELDS})
    `)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    throw error;
  }

  const posts = data || [];

  if (!userId || !posts.length) {
    return posts.map((post) => ({
      ...post,
      is_liked: false,
      is_saved: false,
    }));
  }

  const postIds = posts.map((post) => post.id);

  const [
    { data: likes, error: likesError },
    { data: savedPosts, error: savedError },
  ] = await Promise.all([
    supabase
      .from(LIKES_TABLE)
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds),

    supabase
      .from(SAVED_TABLE)
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds),
  ]);

  if (likesError) {
    throw likesError;
  }

  if (savedError) {
    throw savedError;
  }

  const likedIds = new Set(
    (likes || []).map((like) => like.post_id)
  );

  const savedIds = new Set(
    (savedPosts || []).map((saved) => saved.post_id)
  );

  return posts.map((post) => ({
    ...post,
    is_liked: likedIds.has(post.id),
    is_saved: savedIds.has(post.id),
  }));
}

export async function getUserPosts(
  userId,
  { page = 0, pageSize = 12 } = {}
) {
  if (!userId) {
    return [];
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .select(`
      id,
      user_id,
      caption,
      media_url,
      media_type,
      location,
      hashtags,
      like_count,
      comment_count,
      created_at,
      updated_at,
      profiles!posts_user_id_fkey (${PROFILE_FIELDS})
    `)
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function toggleLike(
  postId,
  currentlyLiked = false
) {
  const user = await getAuthenticatedUser();

  if (!postId) {
    throw new Error('Post ID is required.');
  }

  if (currentlyLiked) {
    const { error } = await supabase
      .from(LIKES_TABLE)
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return {
      liked: false,
      postId,
    };
  }

  const { error } = await supabase
    .from(LIKES_TABLE)
    .upsert(
      {
        post_id: postId,
        user_id: user.id,
      },
      {
        onConflict: 'post_id,user_id',
        ignoreDuplicates: true,
      }
    );

  if (error) {
    throw error;
  }

  return {
    liked: true,
    postId,
  };
}

export async function isLiked(postId, userId) {
  if (!postId || !userId) {
    return false;
  }

  const { data, error } = await supabase
    .from(LIKES_TABLE)
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function getLikeCount(postId) {
  if (!postId) {
    return 0;
  }

  const { count, error } = await supabase
    .from(LIKES_TABLE)
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('post_id', postId);

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function addComment(postId, comment) {
  const user = await getAuthenticatedUser();
  const normalizedComment = String(comment || '').trim();

  if (!postId) {
    throw new Error('Post ID is required.');
  }

  if (!normalizedComment) {
    throw new Error('Comment cannot be empty.');
  }

  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .insert({
      post_id: postId,
      user_id: user.id,
      comment: normalizedComment,
    })
    .select(`
      id,
      post_id,
      user_id,
      comment,
      created_at,
      profiles!comments_user_id_fkey (${PROFILE_FIELDS})
    `)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getComments(
  postId,
  { page = 0, pageSize = 30 } = {}
) {
  if (!postId) {
    return [];
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .select(`
      id,
      post_id,
      user_id,
      comment,
      created_at,
      profiles!comments_user_id_fkey (${PROFILE_FIELDS})
    `)
    .eq('post_id', postId)
    .order('created_at', {
      ascending: true,
    })
    .range(from, to);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function deleteComment(commentId) {
  const user = await getAuthenticatedUser();

  if (!commentId) {
    throw new Error('Comment ID is required.');
  }

  const { error } = await supabase
    .from(COMMENTS_TABLE)
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  return true;
}

export async function toggleSavePost(
  postId,
  currentlySaved = false
) {
  const user = await getAuthenticatedUser();

  if (!postId) {
    throw new Error('Post ID is required.');
  }

  if (currentlySaved) {
    const { error } = await supabase
      .from(SAVED_TABLE)
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return {
      saved: false,
      postId,
    };
  }

  const { error } = await supabase
    .from(SAVED_TABLE)
    .upsert(
      {
        post_id: postId,
        user_id: user.id,
      },
      {
        onConflict: 'post_id,user_id',
        ignoreDuplicates: true,
      }
    );

  if (error) {
    throw error;
  }

  return {
    saved: true,
    postId,
  };
}

export async function isPostSaved(postId, userId) {
  if (!postId || !userId) {
    return false;
  }

  const { data, error } = await supabase
    .from(SAVED_TABLE)
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function getSavedPosts(
  userId,
  { page = 0, pageSize = 12 } = {}
) {
  if (!userId) {
    return [];
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(SAVED_TABLE)
    .select(`
      id,
      post_id,
      user_id,
      created_at,
      posts (
        id,
        user_id,
        caption,
        media_url,
        media_type,
        location,
        hashtags,
        like_count,
        comment_count,
        created_at,
        updated_at,
        profiles!posts_user_id_fkey (${PROFILE_FIELDS})
      )
    `)
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    throw error;
  }

  return (data || [])
    .map((row) => ({
      ...row.posts,
      saved_at: row.created_at,
      is_saved: true,
    }))
    .filter(Boolean);
}

export function subscribeToPosts(callback) {
  const channel = supabase
    .channel('aarush-posts')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: POSTS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: LIKES_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: COMMENTS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}