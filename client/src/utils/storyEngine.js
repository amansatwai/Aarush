import { supabase } from '../lib/supabase';

const STORY_BUCKET = 'stories';
const STORY_TABLE = 'stories';
const VIEW_TABLE = 'story_views';
const CLOSE_FRIEND_TABLE = 'close_friends';
const HIGHLIGHT_TABLE = 'story_highlights';
const HIGHLIGHT_ITEM_TABLE = 'story_highlight_items';

const PROFILE_FIELDS = `
  id,
  full_name,
  username,
  avatar_url,
  profession
`;

function getExtension(file) {
  const extension = file.name
    ?.split('.')
    .pop()
    ?.toLowerCase();

  if (extension) {
    return extension;
  }

  return file.type === 'video/mp4' ? 'mp4' : 'jpg';
}

function getMediaType(file) {
  return file.type?.startsWith('video/')
    ? 'video'
    : 'image';
}

function normalizeStoryPrivacy(privacy) {
  const allowed = [
    'public',
    'followers',
    'close_friends',
    'only_me',
  ];

  return allowed.includes(privacy) ? privacy : 'public';
}

function groupStories(rows) {
  const grouped = new Map();

  for (const row of rows || []) {
    const owner = row.profiles || {};
    const ownerId = row.user_id;

    if (!grouped.has(ownerId)) {
      grouped.set(ownerId, {
        id: ownerId,
        user_id: ownerId,
        username: owner.username || 'user',
        displayName: owner.full_name || 'Aarush User',
        avatar: owner.avatar_url || '',
        profession: owner.profession || '',
        stories: [],
        seen: true,
        latestCreatedAt: row.created_at,
      });
    }

    const group = grouped.get(ownerId);

    group.stories.push({
      id: row.id,
      user_id: row.user_id,
      media_url: row.media_url,
      media_type: row.media_type,
      caption: row.caption || '',
      privacy: row.privacy,
      expires_at: row.expires_at,
      created_at: row.created_at,
      viewed: Boolean(row.viewed),
      viewed_at: row.viewed_at || null,
    });

    if (!row.viewed) {
      group.seen = false;
    }

    if (
      new Date(row.created_at) >
      new Date(group.latestCreatedAt)
    ) {
      group.latestCreatedAt = row.created_at;
    }
  }

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      stories: group.stories.sort(
        (first, second) =>
          new Date(first.created_at) -
          new Date(second.created_at)
      ),
    }))
    .sort(
      (first, second) =>
        new Date(second.latestCreatedAt) -
        new Date(first.latestCreatedAt)
    );
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user || null;
}

export async function uploadStory({
  file,
  caption = '',
  privacy = 'public',
  onProgress,
}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Sign in to upload a story.');
  }

  if (!file) {
    throw new Error('Select an image or video first.');
  }

  if (
    !file.type?.startsWith('image/') &&
    !file.type?.startsWith('video/')
  ) {
    throw new Error('Only image and video stories are supported.');
  }

  const extension = getExtension(file);
  const randomPart = crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

  const filePath = `${user.id}/${Date.now()}-${randomPart}.${extension}`;
  const mediaType = getMediaType(file);

  onProgress?.(10);

  const { error: uploadError } = await supabase.storage
    .from(STORY_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  onProgress?.(70);

  const { data: publicUrlData } = supabase.storage
    .from(STORY_BUCKET)
    .getPublicUrl(filePath);

  const mediaUrl = publicUrlData?.publicUrl;

  if (!mediaUrl) {
    throw new Error('Unable to create the story media URL.');
  }

  const createdAt = new Date();
  const expiresAt = new Date(
    createdAt.getTime() + 24 * 60 * 60 * 1000
  );

  const { data, error: insertError } = await supabase
    .from(STORY_TABLE)
    .insert({
      user_id: user.id,
      media_url: mediaUrl,
      media_type: mediaType,
      caption: caption.trim() || null,
      privacy: normalizeStoryPrivacy(privacy),
      created_at: createdAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage
      .from(STORY_BUCKET)
      .remove([filePath]);

    throw insertError;
  }

  onProgress?.(100);

  return {
    ...data,
    storage_path: filePath,
  };
}

export async function getActiveStories({
  viewerId = null,
} = {}) {
  const now = new Date().toISOString();

  let query = supabase
    .from(STORY_TABLE)
    .select(`
      id,
      user_id,
      media_url,
      media_type,
      caption,
      privacy,
      expires_at,
      created_at,
      profiles!stories_user_id_fkey (${PROFILE_FIELDS})
    `)
    .gt('expires_at', now)
    .order('created_at', {
      ascending: false,
    });

  const { data: rows, error } = await query;

  if (error) {
    throw error;
  }

  if (!rows?.length) {
    return [];
  }

  let viewedIds = new Set();

  if (viewerId) {
    const storyIds = rows.map((story) => story.id);

    const { data: views, error: viewsError } =
      await supabase
        .from(VIEW_TABLE)
        .select('story_id, viewed_at')
        .eq('viewer_id', viewerId)
        .in('story_id', storyIds);

    if (viewsError) {
      throw viewsError;
    }

    viewedIds = new Set(
      (views || []).map((view) => view.story_id)
    );

    rows.forEach((story) => {
      story.viewed = viewedIds.has(story.id);
      story.viewed_at =
        views?.find((view) => view.story_id === story.id)
          ?.viewed_at || null;
    });
  }

  return groupStories(rows);
}

export async function getStoriesForUser(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from(STORY_TABLE)
    .select(`
      id,
      user_id,
      media_url,
      media_type,
      caption,
      privacy,
      expires_at,
      created_at,
      profiles!stories_user_id_fkey (${PROFILE_FIELDS})
    `)
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return groupStories(data || []);
}

export async function getArchivedStories(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from(STORY_TABLE)
    .select(`
      id,
      user_id,
      media_url,
      media_type,
      caption,
      privacy,
      expires_at,
      created_at
    `)
    .eq('user_id', userId)
    .lte('expires_at', new Date().toISOString())
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function recordStoryView(storyId) {
  const user = await getCurrentUser();

  if (!user || !storyId) {
    return {
      viewed: false,
      guest: !user,
    };
  }

  const { error } = await supabase
    .from(VIEW_TABLE)
    .upsert(
      {
        story_id: storyId,
        viewer_id: user.id,
        viewed_at: new Date().toISOString(),
      },
      {
        onConflict: 'story_id,viewer_id',
        ignoreDuplicates: true,
      }
    );

  if (error) {
    throw error;
  }

  return {
    viewed: true,
    guest: false,
  };
}

export async function getStoryViewers(storyId) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Sign in to view story viewers.');
  }

  const { data: story, error: storyError } =
    await supabase
      .from(STORY_TABLE)
      .select('user_id')
      .eq('id', storyId)
      .single();

  if (storyError) {
    throw storyError;
  }

  if (story.user_id !== user.id) {
    throw new Error(
      'Only the story owner can view story viewers.'
    );
  }

  const { data, error } = await supabase
    .from(VIEW_TABLE)
    .select(`
      id,
      viewer_id,
      viewed_at,
      profiles!story_views_viewer_id_fkey (
        ${PROFILE_FIELDS}
      )
    `)
    .eq('story_id', storyId)
    .order('viewed_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getStoryViewerCount(storyId) {
  if (!storyId) {
    return 0;
  }

  const { count, error } = await supabase
    .from(VIEW_TABLE)
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('story_id', storyId);

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function getCloseFriends(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from(CLOSE_FRIEND_TABLE)
    .select(`
      id,
      user_id,
      friend_id,
      created_at,
      profiles!close_friends_friend_id_fkey (${PROFILE_FIELDS})
    `)
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function addCloseFriend(friendId) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Sign in to manage Close Friends.');
  }

  if (!friendId || friendId === user.id) {
    throw new Error('Invalid Close Friend profile.');
  }

  const { data, error } = await supabase
    .from(CLOSE_FRIEND_TABLE)
    .upsert(
      {
        user_id: user.id,
        friend_id: friendId,
      },
      {
        onConflict: 'user_id,friend_id',
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeCloseFriend(friendId) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Sign in to manage Close Friends.');
  }

  const { error } = await supabase
    .from(CLOSE_FRIEND_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('friend_id', friendId);

  if (error) {
    throw error;
  }

  return true;
}

export async function createHighlight({
  title,
  coverUrl = null,
}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Sign in to create highlights.');
  }

  if (!title?.trim()) {
    throw new Error('Highlight title is required.');
  }

  const { data, error } = await supabase
    .from(HIGHLIGHT_TABLE)
    .insert({
      user_id: user.id,
      title: title.trim(),
      cover_url: coverUrl,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function renameHighlight(
  highlightId,
  title
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Sign in to rename highlights.');
  }

  const { data, error } = await supabase
    .from(HIGHLIGHT_TABLE)
    .update({
      title: title.trim(),
    })
    .eq('id', highlightId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteHighlight(highlightId) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Sign in to delete highlights.');
  }

  const { error } = await supabase
    .from(HIGHLIGHT_TABLE)
    .delete()
    .eq('id', highlightId)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  return true;
}

export async function addStoryToHighlight(
  highlightId,
  storyId
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Sign in to manage highlights.');
  }

  const { data: highlight, error: highlightError } =
    await supabase
      .from(HIGHLIGHT_TABLE)
      .select('id')
      .eq('id', highlightId)
      .eq('user_id', user.id)
      .single();

  if (highlightError) {
    throw highlightError;
  }

  const { data: story, error: storyError } =
    await supabase
      .from(STORY_TABLE)
      .select('id, user_id, expires_at')
      .eq('id', storyId)
      .single();

  if (storyError) {
    throw storyError;
  }

  if (story.user_id !== user.id) {
    throw new Error(
      'Only your own stories can be added to highlights.'
    );
  }

  const { data, error } = await supabase
    .from(HIGHLIGHT_ITEM_TABLE)
    .upsert(
      {
        highlight_id: highlight.id,
        story_id: story.id,
      },
      {
        onConflict: 'highlight_id,story_id',
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeStoryFromHighlight(
  highlightId,
  storyId
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Sign in to manage highlights.');
  }

  const { data: highlight, error: highlightError } =
    await supabase
      .from(HIGHLIGHT_TABLE)
      .select('id')
      .eq('id', highlightId)
      .eq('user_id', user.id)
      .single();

  if (highlightError) {
    throw highlightError;
  }

  const { error } = await supabase
    .from(HIGHLIGHT_ITEM_TABLE)
    .delete()
    .eq('highlight_id', highlight.id)
    .eq('story_id', storyId);

  if (error) {
    throw error;
  }

  return true;
}

export async function getProfileHighlights(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from(HIGHLIGHT_TABLE)
    .select(`
      id,
      user_id,
      title,
      cover_url,
      created_at,
      story_highlight_items (
        id,
        story_id,
        stories (
          id,
          user_id,
          media_url,
          media_type,
          caption,
          privacy,
          expires_at,
          created_at
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function subscribeToStories(
  callback
) {
  const channel = supabase
    .channel('aarush-stories')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: STORY_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function deleteStory(storyId) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Sign in to delete stories.');
  }

  const { data: story, error: storyError } =
    await supabase
      .from(STORY_TABLE)
      .select('id, user_id, media_url')
      .eq('id', storyId)
      .single();

  if (storyError) {
    throw storyError;
  }

  if (story.user_id !== user.id) {
    throw new Error('Only the story owner can delete stories.');
  }

  const { error } = await supabase
    .from(STORY_TABLE)
    .delete()
    .eq('id', storyId)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  return true;
}