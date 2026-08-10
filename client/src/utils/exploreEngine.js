import { supabase } from '../lib/supabase';

const POSTS_TABLE = 'posts';
const PROFILES_TABLE = 'profiles';
const FOLLOWS_TABLE = 'follows';

const DEFAULT_PAGE_SIZE = 24;
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
  created_at
`;

const memoryCache = new Map();
const CACHE_TTL = 60 * 1000;

function getCache(key) {
  const item = memoryCache.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() - item.timestamp > CACHE_TTL) {
    memoryCache.delete(key);
    return null;
  }

  return item.value;
}

function setCache(key, value) {
  memoryCache.set(key, {
    value,
    timestamp: Date.now(),
  });

  return value;
}

function getRange(page = 0, pageSize = DEFAULT_PAGE_SIZE) {
  const from = Math.max(0, page) * pageSize;

  return {
    from,
    to: from + pageSize - 1,
  };
}

function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function getCurrentUserId() {
  return supabase.auth
    .getUser()
    .then(({ data, error }) => {
      if (error) {
        throw error;
      }

      return data?.user?.id || null;
    });
}

function getPostScore(post) {
  const likes = Number(
    post.likes_count ??
      post.like_count ??
      post.likes ??
      0
  );

  const comments = Number(
    post.comments_count ??
      post.comment_count ??
      post.comments ??
      0
  );

  const saves = Number(
    post.saves_count ??
      post.save_count ??
      post.saves ??
      0
  );

  const shares = Number(
    post.shares_count ??
      post.share_count ??
      post.shares ??
      0
  );

  const views = Number(
    post.views_count ??
      post.view_count ??
      post.views ??
      0
  );

  const watchTime = Number(
    post.watch_time ??
      post.watch_time_seconds ??
      0
  );

  const createdAt = new Date(
    post.created_at || Date.now()
  ).getTime();

  const ageHours = Math.max(
    1,
    (Date.now() - createdAt) / 3600000
  );

  const freshness = Math.max(
    0.1,
    1 / Math.pow(ageHours, 0.35)
  );

  const recentEngagement =
    likes * 1.4 +
    comments * 2.2 +
    saves * 2.8 +
    shares * 3.2 +
    views * 0.08 +
    watchTime * 0.04;

  const profileQuality = Number(
    post.profile_quality ??
      post.creator_quality ??
      0
  );

  return (
    recentEngagement * freshness +
    profileQuality +
    Number(post.follow_graph_score || 0)
  );
}

function getPostText(post) {
  return [
    post.caption,
    post.title,
    post.description,
    post.location,
    post.hashtags,
  ]
    .filter(Boolean)
    .join(' ');
}

function getPostHashtags(post) {
  if (Array.isArray(post.hashtags)) {
    return post.hashtags
      .map((tag) =>
        String(tag)
          .replace(/^#/, '')
          .trim()
      )
      .filter(Boolean);
  }

  if (typeof post.hashtags === 'string') {
    return post.hashtags
      .split(/[,\s]+/)
      .map((tag) =>
        tag.replace(/^#/, '').trim()
      )
      .filter(Boolean);
  }

  const text = getPostText(post);

  return [...text.matchAll(/#([a-zA-Z0-9_]+)/g)].map(
    (match) => match[1]
  );
}

function isReel(post) {
  const type = String(
    post.post_type ??
      post.content_type ??
      post.media_type ??
      ''
  ).toLowerCase();

  return (
    type === 'reel' ||
    type === 'video' ||
    type === 'short_video' ||
    Boolean(post.is_reel)
  );
}

function getPostMediaUrl(post) {
  return (
    post.media_url ||
    post.video_url ||
    post.image_url ||
    post.thumbnail_url ||
    post.media?.url ||
    post.media?.[0]?.url ||
    null
  );
}

function getPostThumbnail(post) {
  return (
    post.thumbnail_url ||
    post.cover_url ||
    post.preview_url ||
    post.image_url ||
    post.media?.thumbnail ||
    getPostMediaUrl(post)
  );
}

function normalizePost(post, profileMap = new Map()) {
  const profile =
    post.profile ||
    post.profiles ||
    profileMap.get(post.user_id) ||
    profileMap.get(post.author_id) ||
    null;

  return {
    ...post,
    id: post.id,
    user_id: post.user_id || post.author_id,
    profile,
    creator: profile,
    media_url: getPostMediaUrl(post),
    thumbnail_url: getPostThumbnail(post),
    is_reel: isReel(post),
    hashtags: getPostHashtags(post),
    explore_score: getPostScore(post),
  };
}

async function hydrateProfiles(posts) {
  const ids = [
    ...new Set(
      posts
        .map((post) => post.user_id || post.author_id)
        .filter(Boolean)
    ),
  ];

  if (!ids.length) {
    return posts.map((post) =>
      normalizePost(post)
    );
  }

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select(PROFILE_FIELDS)
    .in('id', ids);

  if (error) {
    return posts.map((post) =>
      normalizePost(post)
    );
  }

  const profileMap = new Map(
    (data || []).map((profile) => [
      profile.id,
      profile,
    ])
  );

  return posts.map((post) =>
    normalizePost(post, profileMap)
  );
}

async function fetchPosts({
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  orderBy = 'created_at',
  ascending = false,
  days,
  onlyReels = false,
  search,
  hashtag,
} = {}) {
  const { from, to } = getRange(page, pageSize);

  let query = supabase
    .from(POSTS_TABLE)
    .select('*')
    .order(orderBy, { ascending })
    .range(from, to);

  if (days) {
    query = query.gte(
      'created_at',
      getDateDaysAgo(days)
    );
  }

  if (search) {
    const safeSearch = search
      .trim()
      .replace(/[%_]/g, '');

    if (safeSearch) {
      query = query.or(
        `caption.ilike.%${safeSearch}%,title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`
      );
    }
  }

  if (hashtag) {
    const cleanHashtag = hashtag
      .replace(/^#/, '')
      .trim();

    if (cleanHashtag) {
      query = query.ilike(
        'caption',
        `%#${cleanHashtag}%`
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const normalized = await hydrateProfiles(data || []);

  return onlyReels
    ? normalized.filter((post) => post.is_reel)
    : normalized;
}

async function fetchAllForRanking({
  days,
  onlyReels = false,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const posts = await fetchPosts({
    page: 0,
    pageSize: Math.min(pageSize * 3, 100),
    days,
    onlyReels,
  });

  return posts
    .sort(
      (first, second) =>
        second.explore_score - first.explore_score
    )
    .slice(0, pageSize);
}

export async function getExploreFeed({
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const cacheKey = `explore:${page}:${pageSize}`;
  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const posts = await fetchPosts({
    page,
    pageSize,
    orderBy: 'created_at',
    ascending: false,
  });

  return setCache(cacheKey, {
    items: posts.sort(
      (first, second) =>
        second.explore_score - first.explore_score
    ),
    page,
    pageSize,
    hasMore: posts.length === pageSize,
  });
}

export async function getTrendingPosts({
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  if (page > 0) {
    const posts = await fetchPosts({
      page,
      pageSize,
      days: 7,
    });

    return {
      items: posts.sort(
        (first, second) =>
          second.explore_score - first.explore_score
      ),
      page,
      pageSize,
      hasMore: posts.length === pageSize,
    };
  }

  const items = await fetchAllForRanking({
    days: 7,
    pageSize,
  });

  return {
    items,
    page,
    pageSize,
    hasMore: items.length === pageSize,
  };
}

export async function getTrendingReels({
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const items = await fetchAllForRanking({
    days: 14,
    onlyReels: true,
    pageSize,
  });

  return {
    items: items.slice(
      page * pageSize,
      page * pageSize + pageSize
    ),
    page,
    pageSize,
    hasMore: items.length > (page + 1) * pageSize,
  };
}

export async function getRecentlyPopularPosts({
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const posts = await fetchPosts({
    page,
    pageSize,
    days: 7,
    orderBy: 'created_at',
    ascending: false,
  });

  return {
    items: posts.sort(
      (first, second) =>
        second.explore_score - first.explore_score
    ),
    page,
    pageSize,
    hasMore: posts.length === pageSize,
  };
}

export async function getRecentReels({
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const posts = await fetchPosts({
    page,
    pageSize,
    days: 30,
    onlyReels: true,
    orderBy: 'created_at',
    ascending: false,
  });

  return {
    items: posts,
    page,
    pageSize,
    hasMore: posts.length === pageSize,
  };
}

export async function getSuggestedCreators({
  page = 0,
  pageSize = 12,
} = {}) {
  const currentUserId = await getCurrentUserId();
  const { from, to } = getRange(page, pageSize);

  let query = supabase
    .from(PROFILES_TABLE)
    .select(PROFILE_FIELDS)
    .eq('is_private', false)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (currentUserId) {
    query = query.neq('id', currentUserId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return {
    items: data || [],
    page,
    pageSize,
    hasMore: (data || []).length === pageSize,
  };
}

export async function getHashtagFeed(
  hashtag,
  { page = 0, pageSize = DEFAULT_PAGE_SIZE } = {}
) {
  if (!hashtag) {
    return {
      items: [],
      page,
      pageSize,
      hasMore: false,
    };
  }

  const posts = await fetchPosts({
    page,
    pageSize,
    hashtag,
    orderBy: 'created_at',
    ascending: false,
  });

  return {
    items: posts,
    hashtag: hashtag.replace(/^#/, ''),
    page,
    pageSize,
    hasMore: posts.length === pageSize,
  };
}

export async function searchExplore(
  searchTerm,
  {
    page = 0,
    pageSize = DEFAULT_PAGE_SIZE,
  } = {}
) {
  const term = String(searchTerm || '').trim();

  if (!term) {
    return {
      users: [],
      hashtags: [],
      posts: [],
      reels: [],
      page,
      pageSize,
      hasMore: false,
    };
  }

  const cleanTerm = term.replace(/^#/, '');
  const [profilesResult, posts] =
    await Promise.all([
      supabase
        .from(PROFILES_TABLE)
        .select(PROFILE_FIELDS)
        .or(
          `username.ilike.%${cleanTerm}%,full_name.ilike.%${cleanTerm}%`
        )
        .limit(12),

      fetchPosts({
        page,
        pageSize,
        search: cleanTerm,
      }),
    ]);

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  const hashtags = [
    ...new Set(
      posts
        .flatMap((post) => post.hashtags || [])
        .filter((tag) =>
          tag
            .toLowerCase()
            .includes(cleanTerm.toLowerCase())
        )
    ),
  ].slice(0, 12);

  return {
    users: profilesResult.data || [],
    hashtags,
    posts: posts.filter((post) => !post.is_reel),
    reels: posts.filter((post) => post.is_reel),
    page,
    pageSize,
    hasMore: posts.length === pageSize,
  };
}

export function subscribeToExploreUpdates(
  callback
) {
  const channel = supabase
    .channel('aarush-explore-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: POSTS_TABLE,
      },
      (payload) => {
        memoryCache.clear();
        callback?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: PROFILES_TABLE,
      },
      (payload) => {
        memoryCache.clear();
        callback?.(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function clearExploreCache() {
  memoryCache.clear();
}