import { supabase } from '../lib/supabase';

const POSTS_TABLE = 'posts';
const PROFILES_TABLE = 'profiles';
const FOLLOWS_TABLE = 'follows';
const SIGNALS_TABLE = 'recommendation_signals';
const STORIES_TABLE = 'stories';

const PAGE_SIZE = 18;
const CACHE_TTL = 45000;
const cache = new Map();

const INTEREST_CATEGORIES = [
  'tech',
  'design',
  'gaming',
  'fitness',
  'music',
  'education',
  'travel',
  'business',
  'photography',
  'fashion',
];

function getCache(key) {
  const item = cache.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() - item.createdAt > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

function setCache(key, value) {
  cache.set(key, {
    value,
    createdAt: Date.now(),
  });

  return value;
}

function clearCache() {
  cache.clear();
}

function isGuest() {
  if (typeof window === 'undefined') {
    return false;
  }

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

  if (error) {
    throw error;
  }

  return user || null;
}

async function requireUser() {
  const user = await getUser();

  if (!user) {
    throw new Error(
      'Sign in to personalize your feed.'
    );
  }

  return user;
}

function getRange(page, pageSize) {
  const from = page * pageSize;

  return {
    from,
    to: from + pageSize - 1,
  };
}

function getText(item) {
  return [
    item.caption,
    item.title,
    item.description,
    item.bio,
    item.profession,
    item.location,
    item.hashtags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getTags(item) {
  if (Array.isArray(item.hashtags)) {
    return item.hashtags.map((tag) =>
      String(tag).replace(/^#/, '').toLowerCase()
    );
  }

  return [
    ...getText(item).matchAll(/#([a-z0-9_]+)/gi),
  ].map((match) => match[1].toLowerCase());
}

function isReel(item) {
  const type = String(
    item.post_type ||
      item.content_type ||
      item.media_type ||
      ''
  ).toLowerCase();

  return (
    item.is_reel === true ||
    type === 'reel' ||
    type === 'video' ||
    type === 'short_video'
  );
}

function getMediaUrl(item) {
  return (
    item.thumbnail_url ||
    item.cover_url ||
    item.image_url ||
    item.media_url ||
    item.video_url ||
    item.media?.url ||
    item.media?.[0]?.url ||
    null
  );
}

function getScore(item, signals = {}) {
  const likes = Number(
    item.likes_count ||
      item.like_count ||
      item.likes ||
      0
  );

  const comments = Number(
    item.comments_count ||
      item.comment_count ||
      item.comments ||
      0
  );

  const saves = Number(
    item.saves_count ||
      item.save_count ||
      item.saves ||
      0
  );

  const shares = Number(
    item.shares_count ||
      item.share_count ||
      item.shares ||
      0
  );

  const views = Number(
    item.views_count ||
      item.view_count ||
      item.views ||
      0
  );

  const createdAt = new Date(
    item.created_at || Date.now()
  ).getTime();

  const ageHours = Math.max(
    1,
    (Date.now() - createdAt) / 3600000
  );

  const freshness = 1 / Math.pow(ageHours, 0.32);
  const popularity =
    likes * 1.3 +
    comments * 2.1 +
    saves * 2.7 +
    shares * 3 +
    views * 0.06;

  const affinity = Number(
    item.creator_affinity ||
      signals.creatorAffinity?.[item.user_id] ||
      0
  );

  const interestMatch = Number(
    item.interest_match ||
      signals.interestMatch ||
      0
  );

  const repetitionPenalty = Number(
    item.repetition_penalty || 0
  );

  const diversityPenalty = Number(
    item.diversity_penalty || 0
  );

  return (
    popularity * 0.34 +
    freshness * 0.16 +
    affinity * 0.2 +
    interestMatch * 0.2 -
    repetitionPenalty * 0.06 -
    diversityPenalty * 0.04
  );
}

function normalizeItem(item, profileMap) {
  const profile =
    item.profile ||
    item.profiles ||
    profileMap.get(item.user_id) ||
    profileMap.get(item.author_id) ||
    null;

  return {
    ...item,
    user_id: item.user_id || item.author_id,
    profile,
    creator: profile,
    media_url: getMediaUrl(item),
    thumbnail_url: getMediaUrl(item),
    is_reel: isReel(item),
    hashtags: getTags(item),
  };
}

async function hydrateProfiles(items) {
  const ids = [
    ...new Set(
      items
        .map((item) => item.user_id || item.author_id)
        .filter(Boolean)
    ),
  ];

  if (!ids.length) {
    return items.map((item) =>
      normalizeItem(item, new Map())
    );
  }

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select(`
      id,
      username,
      full_name,
      avatar_url,
      bio,
      profession,
      location,
      account_type,
      is_private,
      created_at
    `)
    .in('id', ids);

  if (error) {
    return items.map((item) =>
      normalizeItem(item, new Map())
    );
  }

  const profileMap = new Map(
    (data || []).map((profile) => [
      profile.id,
      profile,
    ])
  );

  return items.map((item) =>
    normalizeItem(item, profileMap)
  );
}

async function getFollowedIds(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from(FOLLOWS_TABLE)
    .select('following_id')
    .eq('follower_id', userId)
    .eq('status', 'accepted');

  if (error) {
    throw error;
  }

  return (data || []).map(
    (row) => row.following_id
  );
}

async function getUserSignals(userId) {
  if (!userId) {
    return {
      interests: [],
      creatorAffinity: {},
      hashtags: [],
    };
  }

  const { data, error } = await supabase
    .from(SIGNALS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false,
    })
    .limit(500);

  if (error) {
    return {
      interests: [],
      creatorAffinity: {},
      hashtags: [],
    };
  }

  const creatorAffinity = {};
  const tagScores = {};
  const categoryScores = {};

  (data || []).forEach((signal) => {
    const weight = Number(
      signal.weight || signal.score || 1
    );

    if (signal.creator_id) {
      creatorAffinity[signal.creator_id] =
        (creatorAffinity[signal.creator_id] || 0) +
        weight;
    }

    if (signal.hashtag) {
      const tag = signal.hashtag
        .replace(/^#/, '')
        .toLowerCase();

      tagScores[tag] =
        (tagScores[tag] || 0) + weight;
    }

    if (signal.category) {
      const category = signal.category.toLowerCase();

      categoryScores[category] =
        (categoryScores[category] || 0) + weight;
    }
  });

  return {
    interests: Object.entries(categoryScores)
      .sort((first, second) => second[1] - first[1])
      .map(([category]) => category)
      .slice(0, 10),
    creatorAffinity,
    hashtags: Object.entries(tagScores)
      .sort((first, second) => second[1] - first[1])
      .map(([tag]) => tag)
      .slice(0, 30),
  };
}

async function fetchPosts({
  page = 0,
  pageSize = PAGE_SIZE,
  userId,
  onlyReels = false,
  category,
  followedOnly = false,
} = {}) {
  const { from, to } = getRange(page, pageSize);
  const followedIds = followedOnly
    ? await getFollowedIds(userId)
    : [];

  let query = supabase
    .from(POSTS_TABLE)
    .select('*')
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (followedOnly) {
    if (!followedIds.length) {
      return [];
    }

    query = query.in('user_id', followedIds);
  }

  if (category) {
    query = query.or(
      `caption.ilike.%${category}%,title.ilike.%${category}%,description.ilike.%${category}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const normalized = await hydrateProfiles(data || []);

  return onlyReels
    ? normalized.filter((item) => item.is_reel)
    : normalized;
}

function applyDiversity(items, signals = {}) {
  const creatorCounts = new Map();
  const tagCounts = new Map();
  const seenContent = new Set();

  return items.filter((item) => {
    const creatorId =
      item.user_id || item.author_id || 'unknown';

    const tags = item.hashtags || [];
    const contentKey = [
      item.caption,
      item.title,
      tags.slice(0, 3).join(','),
    ]
      .filter(Boolean)
      .join('|')
      .toLowerCase();

    const creatorCount =
      creatorCounts.get(creatorId) || 0;

    const repeatedTags = tags.some(
      (tag) => (tagCounts.get(tag) || 0) >= 4
    );

    if (
      seenContent.has(contentKey) ||
      creatorCount >= 4 ||
      repeatedTags
    ) {
      return false;
    }

    creatorCounts.set(
      creatorId,
      creatorCount + 1
    );

    tags.forEach((tag) => {
      tagCounts.set(
        tag,
        (tagCounts.get(tag) || 0) + 1
      );
    });

    seenContent.add(contentKey);

    return true;
  });
}

function rankItems(items, signals) {
  return applyDiversity(
    items
      .map((item) => ({
        ...item,
        recommendation_score: getScore(
          item,
          signals
        ),
      }))
      .sort(
        (first, second) =>
          second.recommendation_score -
          first.recommendation_score
      ),
    signals
  );
}

export async function getPersonalizedFeed({
  page = 0,
  pageSize = PAGE_SIZE,
} = {}) {
  const user = await getUser();

  if (!user || isGuest()) {
    const items = await fetchPosts({
      page,
      pageSize,
    });

    return {
      items: rankItems(items, {}),
      personalized: false,
      page,
      pageSize,
      hasMore: items.length === pageSize,
    };
  }

  const key = `feed:${user.id}:${page}:${pageSize}`;
  const cached = getCache(key);

  if (cached) {
    return cached;
  }

  const signals = await getUserSignals(user.id);
  const items = await fetchPosts({
    page,
    pageSize,
    userId: user.id,
  });

  const interestItems = items.map((item) => ({
    ...item,
    interest_match: (item.hashtags || []).filter(
      (tag) => signals.hashtags.includes(tag)
    ).length,
  }));

  const result = {
    items: rankItems(interestItems, signals),
    personalized: true,
    interests: signals.interests,
    page,
    pageSize,
    hasMore: items.length === pageSize,
  };

  return setCache(key, result);
}

export async function getRecommendedReels({
  page = 0,
  pageSize = PAGE_SIZE,
} = {}) {
  const user = await getUser();
  const signals = user
    ? await getUserSignals(user.id)
    : {};

  const reels = await fetchPosts({
    page,
    pageSize: pageSize * 2,
    userId: user?.id,
    onlyReels: true,
  });

  const items = rankItems(reels, signals).slice(
    0,
    pageSize
  );

  return {
    items,
    personalized: Boolean(user && !isGuest()),
    page,
    pageSize,
    hasMore: reels.length > pageSize,
  };
}

export async function getRecommendedCreators({
  page = 0,
  pageSize = 12,
} = {}) {
  const user = await getUser();
  const signals = user
    ? await getUserSignals(user.id)
    : {};

  const { from, to } = getRange(page, pageSize);

  let query = supabase
    .from(PROFILES_TABLE)
    .select(`
      id,
      username,
      full_name,
      avatar_url,
      bio,
      profession,
      location,
      account_type,
      is_private,
      created_at
    `)
    .eq('is_private', false)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (user) {
    query = query.neq('id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const items = (data || [])
    .map((creator) => ({
      ...creator,
      recommendation_score:
        Number(
          signals.creatorAffinity?.[creator.id]
        ) || 0,
    }))
    .sort(
      (first, second) =>
        second.recommendation_score -
        first.recommendation_score
    );

  return {
    items,
    page,
    pageSize,
    hasMore: items.length === pageSize,
  };
}

export async function getRecommendedHashtags({
  page = 0,
  pageSize = 20,
} = {}) {
  const user = await getUser();
  const signals = user
    ? await getUserSignals(user.id)
    : {};

  const posts = await fetchPosts({
    page: 0,
    pageSize: 100,
  });

  const counts = new Map();

  posts.forEach((post) => {
    (post.hashtags || []).forEach((tag) => {
      counts.set(
        tag,
        (counts.get(tag) || 0) + 1
      );
    });
  });

  const items = [...counts.entries()]
    .map(([tag, count]) => ({
      tag,
      count,
      score:
        count +
        (signals.hashtags?.includes(tag) ? 20 : 0),
    }))
    .sort((first, second) => second.score - first.score)
    .slice(
      page * pageSize,
      page * pageSize + pageSize
    );

  return {
    items,
    page,
    pageSize,
    hasMore:
      counts.size > (page + 1) * pageSize,
  };
}

export async function getRecommendedStories({
  page = 0,
  pageSize = 12,
} = {}) {
  const user = await getUser();
  const followedIds = user
    ? await getFollowedIds(user.id)
    : [];

  const { from, to } = getRange(page, pageSize);

  let query = supabase
    .from(STORIES_TABLE)
    .select('*')
    .eq('is_active', true)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (followedIds.length) {
    query = query.in('user_id', followedIds);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const items = await hydrateProfiles(data || []);

  return {
    items,
    page,
    pageSize,
    hasMore: items.length === pageSize,
  };
}

export async function recordInteractionSignal({
  signalType,
  reelId,
  postId,
  creatorId,
  hashtag,
  category,
  value = 1,
  metadata = {},
} = {}) {
  if (isGuest()) {
    return null;
  }

  const user = await requireUser();

  if (!signalType) {
    throw new Error('Signal type is required.');
  }

  const { data, error } = await supabase
    .from(SIGNALS_TABLE)
    .insert({
      user_id: user.id,
      signal_type: signalType,
      reel_id: reelId || null,
      post_id: postId || null,
      creator_id: creatorId || null,
      hashtag: hashtag || null,
      category: category || null,
      value,
      weight: value,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  clearCache();

  return data;
}

export async function recordScrollSignal(
  metadata = {}
) {
  return recordInteractionSignal({
    signalType: 'scroll',
    value: 0.15,
    metadata,
  });
}

export async function recordWatchSignal({
  reelId,
  duration = 0,
  completion = 0,
  rewatch = false,
  metadata = {},
} = {}) {
  return recordInteractionSignal({
    signalType: rewatch
      ? 'rewatch'
      : 'watch',
    reelId,
    value:
      Number(duration || 0) +
      Number(completion || 0) * 5,
    metadata: {
      ...metadata,
      duration,
      completion,
    },
  });
}

export async function recordSearchSignal(
  searchTerm,
  metadata = {}
) {
  return recordInteractionSignal({
    signalType: 'search',
    value: 1,
    metadata: {
      ...metadata,
      search_term: searchTerm,
    },
  });
}

export async function recordFollowSignal(
  creatorId,
  metadata = {}
) {
  return recordInteractionSignal({
    signalType: 'follow',
    creatorId,
    value: 4,
    metadata,
  });
}

export async function getFeedRanking({
  items = [],
  userId,
} = {}) {
  const signals = userId
    ? await getUserSignals(userId)
    : {};

  return rankItems(items, signals);
}

export async function refreshRecommendations() {
  clearCache();

  const user = await getUser();

  if (user && !isGuest()) {
    await recordInteractionSignal({
      signalType: 'recommendation_refresh',
      value: 0.1,
    });
  }

  return true;
}

export function subscribeToRecommendationUpdates(
  callback
) {
  const channel = supabase
    .channel('aarush-recommendation-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: SIGNALS_TABLE,
      },
      (payload) => {
        clearCache();
        callback?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: POSTS_TABLE,
      },
      (payload) => {
        clearCache();
        callback?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: FOLLOWS_TABLE,
      },
      (payload) => {
        clearCache();
        callback?.(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export {
  INTEREST_CATEGORIES,
  clearCache as clearRecommendationCache,
};