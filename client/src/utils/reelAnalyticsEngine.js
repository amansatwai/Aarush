import { supabase } from '../lib/supabase';

const EVENTS_TABLE = 'reel_analytics_events';
const HISTORY_TABLE = 'reel_watch_history';
const REELS_TABLE = 'posts';
const PROFILES_TABLE = 'profiles';

const EVENT_CACHE = new Map();
const CACHE_TTL = 30000;

function cacheKey(type, value = '') {
  return `${type}:${value}`;
}

function getCached(key) {
  const item = EVENT_CACHE.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() - item.createdAt > CACHE_TTL) {
    EVENT_CACHE.delete(key);
    return null;
  }

  return item.value;
}

function setCached(key, value) {
  EVENT_CACHE.set(key, {
    value,
    createdAt: Date.now(),
  });

  return value;
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      'Sign in to use reel analytics.'
    );
  }

  return user;
}

function getGuestMode() {
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

function assertReelId(reelId) {
  if (!reelId) {
    throw new Error('A reel ID is required.');
  }
}

function isGuest() {
  return getGuestMode();
}

async function insertEvent({
  reelId,
  eventType,
  duration = 0,
  progress = 0,
  metadata = {},
}) {
  if (isGuest()) {
    return null;
  }

  const user = await requireUser();

  assertReelId(reelId);

  const payload = {
    reel_id: reelId,
    user_id: user.id,
    event_type: eventType,
    watch_duration: Math.max(
      0,
      Number(duration || 0)
    ),
    progress: Math.min(
      1,
      Math.max(0, Number(progress || 0))
    ),
    metadata,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert(payload)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  EVENT_CACHE.clear();

  return data;
}

export async function recordReelView(
  reelId,
  metadata = {}
) {
  return insertEvent({
    reelId,
    eventType: 'view',
    metadata,
  });
}

export async function recordWatchProgress(
  reelId,
  {
    duration = 0,
    progress = 0,
    metadata = {},
  } = {}
) {
  if (isGuest()) {
    return null;
  }

  const user = await requireUser();

  assertReelId(reelId);

  const payload = {
    reel_id: reelId,
    user_id: user.id,
    duration: Math.max(
      0,
      Number(duration || 0)
    ),
    progress: Math.min(
      1,
      Math.max(0, Number(progress || 0))
    ),
    last_watched_at: new Date().toISOString(),
    metadata,
  };

  const { data, error } = await supabase
    .from(HISTORY_TABLE)
    .upsert(payload, {
      onConflict: 'user_id,reel_id',
    })
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function recordWatchCompletion(
  reelId,
  {
    duration = 0,
    metadata = {},
  } = {}
) {
  if (isGuest()) {
    return null;
  }

  const [event, history] = await Promise.all([
    insertEvent({
      reelId,
      eventType: 'completion',
      duration,
      progress: 1,
      metadata,
    }),

    recordWatchProgress(reelId, {
      duration,
      progress: 1,
      metadata: {
        ...metadata,
        completed: true,
      },
    }),
  ]);

  return {
    event,
    history,
  };
}

export async function recordLikeEvent(
  reelId,
  metadata = {}
) {
  return insertEvent({
    reelId,
    eventType: 'like',
    metadata,
  });
}

export async function recordCommentEvent(
  reelId,
  metadata = {}
) {
  return insertEvent({
    reelId,
    eventType: 'comment',
    metadata,
  });
}

export async function recordSaveEvent(
  reelId,
  metadata = {}
) {
  return insertEvent({
    reelId,
    eventType: 'save',
    metadata,
  });
}

export async function recordShareEvent(
  reelId,
  metadata = {}
) {
  return insertEvent({
    reelId,
    eventType: 'share',
    metadata,
  });
}

async function getCreatorReelIds(
  creatorId
) {
  const { data, error } = await supabase
    .from(REELS_TABLE)
    .select('id')
    .eq('user_id', creatorId)
    .or(
      'post_type.eq.reel,content_type.eq.reel,is_reel.eq.true'
    );

  if (error) {
    throw error;
  }

  return (data || []).map((row) => row.id);
}

function aggregateEvents(events) {
  const uniqueViewers = new Set();
  const returningViewers = new Set();
  const followerViewers = new Set();
  const hourCounts = new Map();

  let views = 0;
  let totalWatchTime = 0;
  let completions = 0;
  let rewatches = 0;
  let likes = 0;
  let comments = 0;
  let saves = 0;
  let shares = 0;

  events.forEach((event) => {
    const type = event.event_type;
    const userId = event.user_id;

    if (type === 'view') {
      views += 1;

      if (userId) {
        uniqueViewers.add(userId);
      }
    }

    if (type === 'completion') {
      completions += 1;
    }

    if (type === 'rewatch') {
      rewatches += 1;
    }

    if (type === 'like') {
      likes += 1;
    }

    if (type === 'comment') {
      comments += 1;
    }

    if (type === 'save') {
      saves += 1;
    }

    if (type === 'share') {
      shares += 1;
    }

    totalWatchTime += Number(
      event.watch_duration ||
        event.duration ||
        0
    );

    if (event.is_returning_viewer && userId) {
      returningViewers.add(userId);
    }

    if (event.is_follower && userId) {
      followerViewers.add(userId);
    }

    const hour = new Date(
      event.created_at
    ).getHours();

    hourCounts.set(
      hour,
      (hourCounts.get(hour) || 0) + 1
    );
  });

  const averageWatchDuration =
    views > 0 ? totalWatchTime / views : 0;

  const completionRate =
    views > 0 ? completions / views : 0;

  const engagementScore =
    likes * 1.4 +
    comments * 2.2 +
    saves * 2.8 +
    shares * 3.2 +
    completions * 1.5;

  const peakViewingHour =
    [...hourCounts.entries()].sort(
      (first, second) => second[1] - first[1]
    )[0]?.[0] ?? null;

  return {
    views,
    unique_viewers: uniqueViewers.size,
    total_watch_time: totalWatchTime,
    average_watch_duration: averageWatchDuration,
    completion_rate: completionRate,
    rewatch_count: rewatches,
    likes,
    comments,
    saves,
    shares,
    engagement_score: engagementScore,
    returning_viewers: returningViewers.size,
    follower_viewers: followerViewers.size,
    non_follower_viewers: Math.max(
      0,
      uniqueViewers.size - followerViewers.size
    ),
    peak_viewing_hour: peakViewingHour,
  };
}

async function fetchEventsForReels(
  reelIds,
  { from, to } = {}
) {
  if (!reelIds.length) {
    return [];
  }

  let query = supabase
    .from(EVENTS_TABLE)
    .select('*')
    .in('reel_id', reelIds)
    .order('created_at', {
      ascending: false,
    });

  if (from) {
    query = query.gte('created_at', from);
  }

  if (to) {
    query = query.lte('created_at', to);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getReelAnalytics(
  reelId,
  options = {}
) {
  assertReelId(reelId);

  const key = cacheKey(
    'reel-analytics',
    `${reelId}:${JSON.stringify(options)}`
  );

  const cached = getCached(key);

  if (cached) {
    return cached;
  }

  const events = await fetchEventsForReels(
    [reelId],
    options
  );

  const result = {
    reel_id: reelId,
    ...aggregateEvents(events),
  };

  return setCached(key, result);
}

export async function getCreatorReelAnalytics(
  creatorId,
  {
    page = 0,
    pageSize = 25,
    from,
    to,
  } = {}
) {
  const user = await requireUser();

  const resolvedCreatorId =
    creatorId || user.id;

  if (resolvedCreatorId !== user.id) {
    const { data: profile, error } =
      await supabase
        .from(PROFILES_TABLE)
        .select('id')
        .eq('id', resolvedCreatorId)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!profile) {
      throw new Error('Creator not found.');
    }
  }

  const reelIds = await getCreatorReelIds(
    resolvedCreatorId
  );

  const events = await fetchEventsForReels(
    reelIds,
    { from, to }
  );

  const byReel = new Map();

  reelIds.forEach((reelId) => {
    byReel.set(reelId, []);
  });

  events.forEach((event) => {
    if (!byReel.has(event.reel_id)) {
      byReel.set(event.reel_id, []);
    }

    byReel.get(event.reel_id).push(event);
  });

  const rows = [...byReel.entries()]
    .map(([reelId, reelEvents]) => ({
      reel_id: reelId,
      ...aggregateEvents(reelEvents),
    }))
    .sort(
      (first, second) =>
        second.engagement_score -
        first.engagement_score
    );

  const start = page * pageSize;
  const items = rows.slice(
    start,
    start + pageSize
  );

  const overview = aggregateEvents(events);

  return {
    overview: {
      ...overview,
      followers_gained: events.filter(
        (event) =>
          event.event_type === 'follow_conversion'
      ).length,
      engagement_rate:
        overview.unique_viewers > 0
          ? overview.engagement_score /
            overview.unique_viewers
          : 0,
    },
    items,
    page,
    pageSize,
    hasMore: rows.length > start + pageSize,
  };
}

async function fetchHistoryRows({
  page = 0,
  pageSize = 24,
  search = '',
  onlyPartial = false,
  onlyComplete = false,
} = {}) {
  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(HISTORY_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('last_watched_at', {
      ascending: false,
    })
    .range(from, to);

  if (onlyPartial) {
    query = query.lt('progress', 0.95);
  }

  if (onlyComplete) {
    query = query.gte('progress', 0.95);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = data || [];
  const reelIds = rows.map((row) => row.reel_id);

  if (!reelIds.length) {
    return [];
  }

  const { data: reels, error: reelsError } =
    await supabase
      .from(REELS_TABLE)
      .select('*')
      .in('id', reelIds);

  if (reelsError) {
    throw reelsError;
  }

  const filteredReels = (reels || []).filter(
    (reel) => {
      if (!search) {
        return true;
      }

      const text = [
        reel.caption,
        reel.title,
        reel.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return text.includes(search.toLowerCase());
    }
  );

  const reelMap = new Map(
    filteredReels.map((reel) => [
      reel.id,
      reel,
    ])
  );

  return rows
    .filter((row) => reelMap.has(row.reel_id))
    .map((row) => ({
      ...row,
      reel: reelMap.get(row.reel_id),
      is_complete: Number(row.progress || 0) >= 0.95,
      is_partial: Number(row.progress || 0) < 0.95,
    }));
}

export async function getWatchHistory(options = {}) {
  return fetchHistoryRows(options);
}

export async function getContinueWatching(
  options = {}
) {
  return fetchHistoryRows({
    ...options,
    onlyPartial: true,
  });
}

export async function getFullyWatched(
  options = {}
) {
  return fetchHistoryRows({
    ...options,
    onlyComplete: true,
  });
}

export async function getPartiallyWatched(
  options = {}
) {
  return fetchHistoryRows({
    ...options,
    onlyPartial: true,
  });
}

export async function clearWatchHistory() {
  const user = await requireUser();

  const { error } = await supabase
    .from(HISTORY_TABLE)
    .delete()
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  return true;
}

export async function removeFromWatchHistory(
  reelId
) {
  const user = await requireUser();

  assertReelId(reelId);

  const { error } = await supabase
    .from(HISTORY_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('reel_id', reelId);

  if (error) {
    throw error;
  }

  return true;
}

export async function getLikedReels({
  page = 0,
  pageSize = 24,
} = {}) {
  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .select('reel_id, created_at')
    .eq('user_id', user.id)
    .eq('event_type', 'like')
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    throw error;
  }

  const ids = [
    ...new Set(
      (data || []).map((row) => row.reel_id)
    ),
  ];

  if (!ids.length) {
    return [];
  }

  const { data: reels, error: reelsError } =
    await supabase
      .from(REELS_TABLE)
      .select('*')
      .in('id', ids);

  if (reelsError) {
    throw reelsError;
  }

  return reels || [];
}

export async function getSavedReels({
  page = 0,
  pageSize = 24,
} = {}) {
  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .select('reel_id, created_at')
    .eq('user_id', user.id)
    .eq('event_type', 'save')
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    throw error;
  }

  const ids = [
    ...new Set(
      (data || []).map((row) => row.reel_id)
    ),
  ];

  if (!ids.length) {
    return [];
  }

  const { data: reels, error: reelsError } =
    await supabase
      .from(REELS_TABLE)
      .select('*')
      .in('id', ids);

  if (reelsError) {
    throw reelsError;
  }

  return reels || [];
}

export function subscribeToReelAnalytics(
  callback,
  reelId = null
) {
  const channel = supabase
    .channel(
      reelId
        ? `reel-analytics:${reelId}`
        : 'reel-analytics:all'
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: EVENTS_TABLE,
        ...(reelId
          ? {
              filter: `reel_id=eq.${reelId}`,
            }
          : {}),
      },
      (payload) => {
        EVENT_CACHE.clear();
        callback?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: HISTORY_TABLE,
      },
      (payload) => {
        EVENT_CACHE.clear();
        callback?.(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function clearAnalyticsCache() {
  EVENT_CACHE.clear();
}