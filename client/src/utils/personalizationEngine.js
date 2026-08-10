import { supabase } from '../lib/supabase';

const PROFILE_TABLE = 'personalization_profiles';
const EVENTS_TABLE = 'personalization_events';
const HISTORY_TABLE = 'reel_watch_history';
const SEARCH_TABLE = 'search_history';

const CACHE_TTL = 60000;
const cache = new Map();

export const INTEREST_CATEGORIES = [
  'Technology',
  'Programming',
  'Design',
  'Gaming',
  'Fitness',
  'Education',
  'Finance',
  'Business',
  'Travel',
  'Photography',
  'Fashion',
  'Music',
  'Sports',
  'Movies',
  'Food',
  'Health',
  'AI',
  'Startups',
];

const DEFAULT_INTERESTS = Object.fromEntries(
  INTEREST_CATEGORIES.map((category) => [
    category,
    0,
  ])
);

const DEFAULT_PREFERENCES = {
  content_types: {
    videos: true,
    images: true,
    reels: true,
    stories: true,
  },
  content_styles: {
    educational: true,
    entertainment: true,
    business: true,
    local: true,
  },
  preferred_reel_duration: 'any',
  preferred_posting_time: 'any',
  show_local_content: true,
  recommendation_transparency: true,
};

function cacheGet(key) {
  const item = cache.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() - item.time > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

function cacheSet(key, value) {
  cache.set(key, {
    value,
    time: Date.now(),
  });

  return value;
}

function clearCache() {
  cache.clear();
}

function guestMode() {
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
      'Sign in to manage personalization.'
    );
  }

  return user;
}

function cleanWeight(value) {
  return Math.max(
    -100,
    Math.min(100, Number(value || 0))
  );
}

function eventWeight(type, value = 1) {
  const weights = {
    view: 0.5,
    skip: -1,
    quick_exit: -2,
    like: 3,
    comment: 4,
    save: 5,
    share: 6,
    watch: 1,
    completion: 5,
    rewatch: 4,
    story_view: 1,
    search: 2,
    hashtag: 2,
    creator: 3,
    profile_visit: 2,
    follow: 5,
    hide: -5,
    mute: -8,
    block: -12,
    ignore_hashtag: -4,
  };

  return (weights[type] || 1) * Number(value || 1);
}

function normalizeProfile(row) {
  return {
    user_id: row?.user_id,
    interests: {
      ...DEFAULT_INTERESTS,
      ...(row?.interests || {}),
    },
    favorite_creators: row?.favorite_creators || [],
    watched_creators: row?.watched_creators || [],
    saved_creators: row?.saved_creators || [],
    hidden_creators: row?.hidden_creators || [],
    muted_creators: row?.muted_creators || [],
    blocked_creators: row?.blocked_creators || [],
    preferred_hashtags: row?.preferred_hashtags || {},
    ignored_hashtags: row?.ignored_hashtags || {},
    creator_scores: row?.creator_scores || {},
    content_type_scores:
      row?.content_type_scores || {},
    preferred_reel_duration:
      row?.preferred_reel_duration || 'any',
    preferred_posting_time:
      row?.preferred_posting_time || 'any',
    preferences: {
      ...DEFAULT_PREFERENCES,
      ...(row?.preferences || {}),
      content_types: {
        ...DEFAULT_PREFERENCES.content_types,
        ...(row?.preferences?.content_types || {}),
      },
      content_styles: {
        ...DEFAULT_PREFERENCES.content_styles,
        ...(row?.preferences?.content_styles || {}),
      },
    },
    updated_at: row?.updated_at,
  };
}

export async function initializePersonalization() {
  if (guestMode()) {
    return {
      ...normalizeProfile({}),
      guest: true,
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return cacheSet(
      `profile:${user.id}`,
      normalizeProfile(data)
    );
  }

  const initial = {
    user_id: user.id,
    interests: DEFAULT_INTERESTS,
    favorite_creators: [],
    watched_creators: [],
    saved_creators: [],
    hidden_creators: [],
    muted_creators: [],
    blocked_creators: [],
    preferred_hashtags: {},
    ignored_hashtags: {},
    creator_scores: {},
    content_type_scores: {},
    preferred_reel_duration: 'any',
    preferred_posting_time: 'any',
    preferences: DEFAULT_PREFERENCES,
  };

  const { data: created, error: createError } =
    await supabase
      .from(PROFILE_TABLE)
      .upsert(initial, {
        onConflict: 'user_id',
      })
      .select()
      .single();

  if (createError) {
    throw createError;
  }

  return cacheSet(
    `profile:${user.id}`,
    normalizeProfile(created)
  );
}

export async function getInterestProfile() {
  return initializePersonalization();
}

async function saveProfilePatch(patch) {
  if (guestMode()) {
    return null;
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .upsert(
      {
        user_id: user.id,
        ...patch,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  clearCache();

  return normalizeProfile(data);
}

export async function updateInterestProfile({
  category,
  amount = 1,
  interests,
} = {}) {
  const profile = await initializePersonalization();
  const next = {
    ...profile.interests,
  };

  if (interests) {
    Object.entries(interests).forEach(
      ([key, value]) => {
        next[key] = cleanWeight(value);
      }
    );
  }

  if (category) {
    next[category] = cleanWeight(
      (next[category] || 0) + amount
    );
  }

  return saveProfilePatch({
    interests: next,
  });
}

async function recordSignal({
  type,
  contentId,
  creatorId,
  hashtag,
  category,
  value = 1,
  metadata = {},
} = {}) {
  if (guestMode()) {
    return null;
  }

  const user = await requireUser();

  if (!type) {
    throw new Error('Personalization signal required.');
  }

  const row = {
    user_id: user.id,
    signal_type: type,
    content_id: contentId || null,
    creator_id: creatorId || null,
    hashtag: hashtag || null,
    category: category || null,
    value,
    weight: eventWeight(type, value),
    metadata,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert(row)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  const profile = await initializePersonalization();

  const patch = {
    interests: {
      ...profile.interests,
    },
    preferred_hashtags: {
      ...profile.preferred_hashtags,
    },
    ignored_hashtags: {
      ...profile.ignored_hashtags,
    },
    creator_scores: {
      ...profile.creator_scores,
    },
    content_type_scores: {
      ...profile.content_type_scores,
    },
  };

  const weight = eventWeight(type, value);

  if (category) {
    patch.interests[category] = cleanWeight(
      (patch.interests[category] || 0) + weight
    );
  }

  if (hashtag) {
    const tag = hashtag
      .replace(/^#/, '')
      .toLowerCase();

    const target =
      weight >= 0
        ? patch.preferred_hashtags
        : patch.ignored_hashtags;

    target[tag] = cleanWeight(
      (target[tag] || 0) + Math.abs(weight)
    );
  }

  if (creatorId) {
    patch.creator_scores[creatorId] = cleanWeight(
      (patch.creator_scores[creatorId] || 0) +
        weight
    );
  }

  await saveProfilePatch(patch);

  return data;
}

export async function recordFeedView(payload = {}) {
  return recordSignal({
    ...payload,
    type: 'view',
  });
}

export async function recordFeedSkip(payload = {}) {
  return recordSignal({
    ...payload,
    type: 'skip',
  });
}

export async function recordFeedLike(payload = {}) {
  return recordSignal({
    ...payload,
    type: 'like',
  });
}

export async function recordFeedComment(payload = {}) {
  return recordSignal({
    ...payload,
    type: 'comment',
  });
}

export async function recordFeedSave(payload = {}) {
  return recordSignal({
    ...payload,
    type: 'save',
  });
}

export async function recordFeedShare(payload = {}) {
  return recordSignal({
    ...payload,
    type: 'share',
  });
}

export async function recordReelWatch(payload = {}) {
  const result = await recordSignal({
    ...payload,
    type:
      Number(payload.completion || 0) >= 0.95
        ? 'completion'
        : payload.rewatch
          ? 'rewatch'
          : 'watch',
  });

  if (!guestMode() && payload.reelId) {
    await supabase
      .from(HISTORY_TABLE)
      .upsert(
        {
          user_id: (await requireUser()).id,
          reel_id: payload.reelId,
          progress: payload.completion || 0,
          duration: payload.duration || 0,
          last_watched_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,reel_id',
        }
      );
  }

  return result;
}

export async function recordStoryView(payload = {}) {
  return recordSignal({
    ...payload,
    type: 'story_view',
  });
}

export async function recordSearchInterest(
  searchTerm,
  metadata = {}
) {
  return recordSignal({
    type: 'search',
    value: 1,
    metadata: {
      ...metadata,
      search_term: searchTerm,
    },
  });
}

export async function recordHashtagInterest(
  hashtag,
  metadata = {}
) {
  return recordSignal({
    type: 'hashtag',
    hashtag,
    value: 1,
    metadata,
  });
}

export async function recordCreatorInterest(
  creatorId,
  metadata = {}
) {
  return recordSignal({
    type: 'creator',
    creatorId,
    value: 1,
    metadata,
  });
}

async function getContent({
  table = 'posts',
  page = 0,
  pageSize = 18,
  onlyReels = false,
  signals,
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(table)
    .select('*')
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = data || [];

  const creatorIds = [
    ...new Set(
      rows
        .map((row) => row.user_id || row.author_id)
        .filter(Boolean)
    ),
  ];

  let profiles = [];

  if (creatorIds.length) {
    const result = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        bio,
        location,
        is_private
      `)
      .in('id', creatorIds);

    profiles = result.data || [];
  }

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ])
  );

  const items = rows
    .map((row) => {
      const creatorId =
        row.user_id || row.author_id;

      const text = [
        row.caption,
        row.title,
        row.description,
        row.hashtags,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const creatorScore = Number(
        signals.creator_scores?.[creatorId] || 0
      );

      const hashtagScore = Object.keys(
        signals.preferred_hashtags || {}
      ).reduce((score, tag) => {
        return score + (text.includes(tag) ? 2 : 0);
      }, 0);

      const negativeScore = Object.keys(
        signals.ignored_hashtags || {}
      ).reduce((score, tag) => {
        return score + (text.includes(tag) ? 4 : 0);
      }, 0);

      const likes = Number(
        row.likes_count ||
          row.like_count ||
          row.likes ||
          0
      );

      const comments = Number(
        row.comments_count ||
          row.comment_count ||
          row.comments ||
          0
      );

      const saves = Number(
        row.saves_count ||
          row.save_count ||
          row.saves ||
          0
      );

      const created = new Date(
        row.created_at || Date.now()
      ).getTime();

      const hours = Math.max(
        1,
        (Date.now() - created) / 3600000
      );

      const freshness =
        1 / Math.pow(hours, 0.32);

      return {
        ...row,
        profile: profileMap.get(creatorId),
        creator: profileMap.get(creatorId),
        personalization_score:
          creatorScore * 0.3 +
          hashtagScore * 0.25 +
          (likes * 1.2 +
            comments * 2 +
            saves * 3) *
            0.25 +
          freshness * 0.2 -
          negativeScore,
      };
    })
    .filter((item) => {
      if (!onlyReels) {
        return true;
      }

      return (
        item.is_reel === true ||
        item.post_type === 'reel' ||
        item.content_type === 'reel' ||
        item.media_type === 'video'
      );
    })
    .sort(
      (first, second) =>
        second.personalization_score -
        first.personalization_score
    );

  return {
    items,
    page,
    pageSize,
    hasMore: rows.length === pageSize,
  };
}

export async function getPersonalizedExplore(
  options = {}
) {
  const user = await requireUser();
  const key = `explore:${user.id}:${JSON.stringify(
    options
  )}`;

  const cached = cacheGet(key);

  if (cached) {
    return cached;
  }

  const profile = await initializePersonalization();
  const result = await getContent({
    ...options,
    signals: profile,
  });

  return cacheSet(key, result);
}

export async function getPersonalizedReels(
  options = {}
) {
  const user = await requireUser();
  const profile = await initializePersonalization();

  return getContent({
    ...options,
    table: 'posts',
    onlyReels: true,
    signals: profile,
    userId: user.id,
  });
}

export async function getPersonalizedStories({
  page = 0,
  pageSize = 12,
} = {}) {
  const user = await requireUser();
  const profile = await initializePersonalization();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_active', true)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    throw error;
  }

  const items = (data || []).sort((first, second) => {
    const firstScore = Number(
      profile.creator_scores?.[first.user_id] || 0
    );

    const secondScore = Number(
      profile.creator_scores?.[second.user_id] || 0
    );

    return secondScore - firstScore;
  });

  return {
    items,
    page,
    pageSize,
    hasMore: items.length === pageSize,
  };
}

export async function getPersonalizedCreators({
  page = 0,
  pageSize = 12,
} = {}) {
  const user = await requireUser();
  const profile = await initializePersonalization();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      full_name,
      avatar_url,
      bio,
      profession,
      location,
      is_private
    `)
    .eq('is_private', false)
    .neq('id', user.id)
    .range(from, to);

  if (error) {
    throw error;
  }

  const items = (data || [])
    .map((creator) => ({
      ...creator,
      personalization_score: Number(
        profile.creator_scores?.[creator.id] || 0
      ),
    }))
    .sort(
      (first, second) =>
        second.personalization_score -
        first.personalization_score
    );

  return {
    items,
    page,
    pageSize,
    hasMore: items.length === pageSize,
  };
}

export async function resetPersonalization() {
  const user = await requireUser();

  await supabase
    .from(EVENTS_TABLE)
    .delete()
    .eq('user_id', user.id);

  const result = await saveProfilePatch({
    interests: DEFAULT_INTERESTS,
    favorite_creators: [],
    watched_creators: [],
    saved_creators: [],
    hidden_creators: [],
    preferred_hashtags: {},
    ignored_hashtags: {},
    creator_scores: {},
    content_type_scores: {},
    preferences: DEFAULT_PREFERENCES,
  });

  clearCache();

  return result;
}

export async function updatePersonalizationPreferences(
  preferences
) {
  const profile = await initializePersonalization();

  return saveProfilePatch({
    preferences: {
      ...profile.preferences,
      ...preferences,
      content_types: {
        ...profile.preferences.content_types,
        ...(preferences.content_types || {}),
      },
      content_styles: {
        ...profile.preferences.content_styles,
        ...(preferences.content_styles || {}),
      },
    },
  });
}

export function subscribeToPersonalization(
  callback
) {
  const channel = supabase
    .channel('aarush-personalization-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: PROFILE_TABLE,
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
        table: EVENTS_TABLE,
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

export function clearPersonalizationCache() {
  clearCache();
}