// src/utils/discoverEngine.js
import { supabase } from '../lib/supabase';

const PROFILE_FIELDS = `
  id,
  username,
  full_name,
  avatar_url,
  bio,
  profession,
  location,
  account_type,
  is_private,
  updated_at
`;

const PAGE_SIZE = 20;

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

async function getExcludedIds(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
    .in('status', ['accepted', 'pending']);

  if (error) {
    throw error;
  }

  return [
    userId,
    ...(data || []).map((row) => row.following_id),
  ];
}

async function attachDiscoveryMetrics(
  profiles,
  currentUserId
) {
  if (!profiles.length) {
    return [];
  }

  const ids = profiles.map((profile) => profile.id);

  const [
    { data: followerRows, error: followerError },
    { data: postRows, error: postError },
    { data: storyRows, error: storyError },
  ] = await Promise.all([
    supabase
      .from('follows')
      .select('following_id')
      .in('following_id', ids)
      .eq('status', 'accepted'),

    supabase
      .from('posts')
      .select('user_id, like_count, comment_count, created_at')
      .in('user_id', ids)
      .order('created_at', {
        ascending: false,
      })
      .limit(500),

    supabase
      .from('stories')
      .select('user_id, created_at')
      .in('user_id', ids)
      .gt('expires_at', new Date().toISOString())
      .limit(500),
  ]);

  if (followerError) {
    throw followerError;
  }

  if (postError) {
    throw postError;
  }

  if (storyError) {
    throw storyError;
  }

  const followerCounts = new Map();
  const postMetrics = new Map();
  const storyCounts = new Map();

  (followerRows || []).forEach((row) => {
    followerCounts.set(
      row.following_id,
      (followerCounts.get(row.following_id) || 0) + 1
    );
  });

  (postRows || []).forEach((post) => {
    const current = postMetrics.get(post.user_id) || {
      posts: 0,
      engagement: 0,
      latestPost: null,
    };

    current.posts += 1;
    current.engagement +=
      Number(post.like_count || 0) +
      Number(post.comment_count || 0);

    if (
      !current.latestPost ||
      new Date(post.created_at) >
        new Date(current.latestPost)
    ) {
      current.latestPost = post.created_at;
    }

    postMetrics.set(post.user_id, current);
  });

  (storyRows || []).forEach((story) => {
    storyCounts.set(
      story.user_id,
      (storyCounts.get(story.user_id) || 0) + 1
    );
  });

  return profiles.map((profile) => {
    const metrics = postMetrics.get(profile.id) || {};
    const followers = followerCounts.get(profile.id) || 0;
    const stories = storyCounts.get(profile.id) || 0;

    const completeness = [
      profile.avatar_url,
      profile.full_name,
      profile.username,
      profile.bio,
      profile.profession,
      profile.location,
    ].filter(Boolean).length;

    return {
      ...profile,
      follower_count: followers,
      post_count: metrics.posts || 0,
      engagement_score: metrics.engagement || 0,
      story_count: stories,
      profile_completeness: completeness,
      mutual_count: 0,
      current_user_id: currentUserId,
    };
  });
}

export async function searchDiscoverPeople(
  query,
  {
    page = 0,
    pageSize = PAGE_SIZE,
    userId = null,
  } = {}
) {
  const normalizedQuery = String(query || '').trim();

  if (!normalizedQuery) {
    return [];
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  const pattern = `%${normalizedQuery}%`;

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .or(
      [
        `username.ilike.${pattern}`,
        `full_name.ilike.${pattern}`,
        `profession.ilike.${pattern}`,
        `bio.ilike.${pattern}`,
      ].join(',')
    )
    .order('full_name', {
      ascending: true,
      nullsFirst: false,
    })
    .range(from, to);

  if (error) {
    throw error;
  }

  return attachDiscoveryMetrics(data || [], userId);
}

export async function getSuggestedForYou({
  userId,
  limit = PAGE_SIZE,
} = {}) {
  const excludedIds = await getExcludedIds(userId);

  let query = supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .order('updated_at', {
      ascending: false,
      nullsFirst: false,
    })
    .limit(limit * 3);

  if (excludedIds.length) {
    query = query.not(
      'id',
      'in',
      `(${excludedIds.join(',')})`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const scored = await attachDiscoveryMetrics(
    data || [],
    userId
  );

  return scored
    .map((profile) => ({
      ...profile,
      discovery_score:
        profile.mutual_count * 10 +
        profile.profile_completeness * 2 +
        profile.engagement_score * 0.01 +
        profile.post_count * 2 +
        profile.story_count,
    }))
    .sort(
      (first, second) =>
        second.discovery_score - first.discovery_score
    )
    .slice(0, limit);
}

export async function getTrendingCreators({
  userId,
  limit = PAGE_SIZE,
} = {}) {
  const excludedIds = await getExcludedIds(userId);

  let query = supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .order('updated_at', {
      ascending: false,
      nullsFirst: false,
    })
    .limit(limit * 3);

  if (excludedIds.length) {
    query = query.not(
      'id',
      'in',
      `(${excludedIds.join(',')})`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const creators = await attachDiscoveryMetrics(
    data || [],
    userId
  );

  return creators
    .map((profile) => ({
      ...profile,
      trending_score:
        profile.engagement_score +
        profile.post_count * 10 +
        profile.story_count * 5 +
        profile.follower_count * 0.5,
    }))
    .sort(
      (first, second) =>
        second.trending_score - first.trending_score
    )
    .slice(0, limit);
}

export async function getNewOnAarush({
  userId,
  limit = PAGE_SIZE,
} = {}) {
  const excludedIds = await getExcludedIds(userId);

  let query = supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .order('updated_at', {
      ascending: false,
      nullsFirst: false,
    })
    .limit(limit * 2);

  if (excludedIds.length) {
    query = query.not(
      'id',
      'in',
      `(${excludedIds.join(',')})`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return attachDiscoveryMetrics(
    data || [],
    userId
  );
}

export async function getPopularNearby({
  userId,
  location,
  limit = PAGE_SIZE,
} = {}) {
  if (!location?.trim()) {
    return [];
  }

  const excludedIds = await getExcludedIds(userId);
  const pattern = `%${location.trim()}%`;

  let query = supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .ilike('location', pattern)
    .order('updated_at', {
      ascending: false,
      nullsFirst: false,
    })
    .limit(limit * 2);

  if (excludedIds.length) {
    query = query.not(
      'id',
      'in',
      `(${excludedIds.join(',')})`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return attachDiscoveryMetrics(
    data || [],
    userId
  );
}

export function subscribeToDiscoverChanges(callback) {
  const channel = supabase
    .channel('aarush-discover-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'follows',
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'posts',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}