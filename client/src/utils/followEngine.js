import { supabase } from '../lib/supabase';
import { createNotification } from './notificationEngine';

const FOLLOWS_TABLE = 'follows';
const PROFILES_TABLE = 'profiles';
const BLOCKED_TABLE = 'blocked_users';
const MUTED_TABLE = 'muted_users';
const RESTRICTED_TABLE = 'restricted_users';

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
  show_followers,
  show_following,
  show_posts,
  show_stories,
  messaging_privacy,
  follow_request_mode,
  story_privacy,
  updated_at
`;

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
};

function isGuestMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.localStorage.getItem(GUEST_KEYS.isGuest) ===
      'true' &&
    window.localStorage.getItem(
      GUEST_KEYS.guestSession
    ) !== null
  );
}

async function requireUser() {
  if (isGuestMode()) {
    throw new Error(
      'Sign in to manage social relationships.'
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
      'Sign in to manage social relationships.'
    );
  }

  return user;
}

function assertDifferentUsers(firstId, secondId) {
  if (!firstId || !secondId) {
    throw new Error('Both user IDs are required.');
  }

  if (firstId === secondId) {
    throw new Error('You cannot perform this action on yourself.');
  }
}

async function notifyFollow({
  recipientId,
  actorId,
  title,
  body,
}) {
  try {
    await createNotification({
      recipientId,
      actorId,
      type: 'follow',
      entityId: actorId,
      entityType: 'profile',
      title,
      body,
    });
  } catch {
    // Relationship changes must not fail because notification delivery failed.
  }
}

export async function getProfile(profileId) {
  if (!profileId) {
    return null;
  }

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select(PROFILE_FIELDS)
    .eq('id', profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function sendFollowRequest(followingId) {
  const user = await requireUser();

  assertDifferentUsers(user.id, followingId);

  if (await isBlocked(user.id, followingId)) {
    throw new Error(
      'You cannot follow a blocked profile.'
    );
  }

  const targetProfile = await getProfile(followingId);

  if (!targetProfile) {
    throw new Error('Profile not found.');
  }

  const { data: existing, error: existingError } =
    await supabase
      .from(FOLLOWS_TABLE)
      .select(
        'id, follower_id, following_id, status, created_at'
      )
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing;
  }

  const status =
    targetProfile.follow_request_mode === 'auto_accept' ||
    !targetProfile.is_private
      ? 'accepted'
      : 'pending';

  const { data, error } = await supabase
    .from(FOLLOWS_TABLE)
    .insert({
      follower_id: user.id,
      following_id: followingId,
      status,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: duplicate } = await supabase
        .from(FOLLOWS_TABLE)
        .select(
          'id, follower_id, following_id, status, created_at'
        )
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .single();

      return duplicate;
    }

    throw error;
  }

  await notifyFollow({
    recipientId: followingId,
    actorId: user.id,
    title:
      status === 'pending'
        ? 'New follow request'
        : 'New follower',
    body:
      status === 'pending'
        ? 'Someone requested to follow you.'
        : 'Someone started following you.',
  });

  return data;
}

export async function followUser(followingId) {
  return sendFollowRequest(followingId);
}

export async function unfollowUser(followingId) {
  const user = await requireUser();

  assertDifferentUsers(user.id, followingId);

  const { error } = await supabase
    .from(FOLLOWS_TABLE)
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId);

  if (error) {
    throw error;
  }

  return true;
}

export async function cancelFollowRequest(followingId) {
  const user = await requireUser();

  assertDifferentUsers(user.id, followingId);

  const { error } = await supabase
    .from(FOLLOWS_TABLE)
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .eq('status', 'pending');

  if (error) {
    throw error;
  }

  return true;
}

export async function acceptFollowRequest(followerId) {
  const user = await requireUser();

  assertDifferentUsers(user.id, followerId);

  const { data, error } = await supabase
    .from(FOLLOWS_TABLE)
    .update({
      status: 'accepted',
    })
    .eq('follower_id', followerId)
    .eq('following_id', user.id)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    throw error;
  }

  await notifyFollow({
    recipientId: followerId,
    actorId: user.id,
    title: 'Follow request accepted',
    body: 'Your follow request was accepted.',
  });

  return data;
}

export async function rejectFollowRequest(followerId) {
  const user = await requireUser();

  assertDifferentUsers(user.id, followerId);

  const { error } = await supabase
    .from(FOLLOWS_TABLE)
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', user.id)
    .eq('status', 'pending');

  if (error) {
    throw error;
  }

  return true;
}

export async function getRelationship(viewerId, profileId) {
  if (!viewerId || !profileId) {
    return {
      state: 'not_following',
      following: false,
      requested: false,
      followBack: false,
      isOwnProfile: false,
    };
  }

  if (viewerId === profileId) {
    return {
      state: 'own_profile',
      following: false,
      requested: false,
      followBack: false,
      isOwnProfile: true,
    };
  }

  const [
    { data: outgoing, error: outgoingError },
    { data: incoming, error: incomingError },
  ] = await Promise.all([
    supabase
      .from(FOLLOWS_TABLE)
      .select('id, status')
      .eq('follower_id', viewerId)
      .eq('following_id', profileId)
      .maybeSingle(),

    supabase
      .from(FOLLOWS_TABLE)
      .select('id, status')
      .eq('follower_id', profileId)
      .eq('following_id', viewerId)
      .maybeSingle(),
  ]);

  if (outgoingError) {
    throw outgoingError;
  }

  if (incomingError) {
    throw incomingError;
  }

  return {
    state:
      outgoing?.status === 'accepted'
        ? 'following'
        : outgoing?.status === 'pending'
          ? 'requested'
          : 'not_following',
    following: outgoing?.status === 'accepted',
    requested: outgoing?.status === 'pending',
    followBack: incoming?.status === 'accepted',
    isOwnProfile: false,
  };
}

export async function isFollowing(followerId, followingId) {
  if (!followerId || !followingId) {
    return false;
  }

  const { data, error } = await supabase
    .from(FOLLOWS_TABLE)
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .eq('status', 'accepted')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function isFollowRequested(
  followerId,
  followingId
) {
  if (!followerId || !followingId) {
    return false;
  }

  const { data, error } = await supabase
    .from(FOLLOWS_TABLE)
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .eq('status', 'pending')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function getProfilesByIds(ids) {
  if (!ids.length) {
    return [];
  }

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select(PROFILE_FIELDS)
    .in('id', ids);

  if (error) {
    throw error;
  }

  const profileMap = new Map(
    (data || []).map((profile) => [
      profile.id,
      profile,
    ])
  );

  return ids
    .map((id) => profileMap.get(id))
    .filter(Boolean);
}

export async function getFollowers(
  profileId,
  { page = 0, pageSize = 30 } = {}
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(FOLLOWS_TABLE)
    .select(
      'id, follower_id, following_id, status, created_at'
    )
    .eq('following_id', profileId)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const ids = (data || []).map(
    (row) => row.follower_id
  );

  return getProfilesByIds(ids);
}

export async function getFollowing(
  profileId,
  { page = 0, pageSize = 30 } = {}
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(FOLLOWS_TABLE)
    .select(
      'id, follower_id, following_id, status, created_at'
    )
    .eq('follower_id', profileId)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const ids = (data || []).map(
    (row) => row.following_id
  );

  return getProfilesByIds(ids);
}

export async function getFollowerCount(profileId) {
  const { count, error } = await supabase
    .from(FOLLOWS_TABLE)
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('following_id', profileId)
    .eq('status', 'accepted');

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function getFollowingCount(profileId) {
  const { count, error } = await supabase
    .from(FOLLOWS_TABLE)
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('follower_id', profileId)
    .eq('status', 'accepted');

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function getMutualFollowers(
  firstUserId,
  secondUserId,
  { page = 0, pageSize = 30 } = {}
) {
  const [
    { data: firstRows, error: firstError },
    { data: secondRows, error: secondError },
  ] = await Promise.all([
    supabase
      .from(FOLLOWS_TABLE)
      .select('following_id')
      .eq('follower_id', firstUserId)
      .eq('status', 'accepted'),

    supabase
      .from(FOLLOWS_TABLE)
      .select('following_id')
      .eq('follower_id', secondUserId)
      .eq('status', 'accepted'),
  ]);

  if (firstError) {
    throw firstError;
  }

  if (secondError) {
    throw secondError;
  }

  const secondIds = new Set(
    (secondRows || []).map(
      (row) => row.following_id
    )
  );

  const mutualIds = (firstRows || [])
    .map((row) => row.following_id)
    .filter((id) => secondIds.has(id));

  const from = page * pageSize;
  const ids = mutualIds.slice(
    from,
    from + pageSize
  );

  return getProfilesByIds(ids);
}

export async function getIncomingFollowRequests(
  { page = 0, pageSize = 30 } = {}
) {
  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(FOLLOWS_TABLE)
    .select(
      'id, follower_id, following_id, status, created_at'
    )
    .eq('following_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const ids = (data || []).map(
    (row) => row.follower_id
  );

  const profiles = await getProfilesByIds(ids);
  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ])
  );

  return (data || [])
    .map((row) => ({
      ...profileMap.get(row.follower_id),
      request_id: row.id,
      requested_at: row.created_at,
      request_status: row.status,
    }))
    .filter((profile) => profile.id);
}

export async function blockUser(blockedId) {
  const user = await requireUser();

  assertDifferentUsers(user.id, blockedId);

  await supabase
    .from(FOLLOWS_TABLE)
    .delete()
    .or(
      `and(follower_id.eq.${user.id},following_id.eq.${blockedId}),and(follower_id.eq.${blockedId},following_id.eq.${user.id})`
    );

  const { data, error } = await supabase
    .from(BLOCKED_TABLE)
    .upsert(
      {
        blocker_id: user.id,
        blocked_id: blockedId,
      },
      {
        onConflict: 'blocker_id,blocked_id',
        ignoreDuplicates: true,
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function unblockUser(blockedId) {
  const user = await requireUser();

  const { error } = await supabase
    .from(BLOCKED_TABLE)
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', blockedId);

  if (error) {
    throw error;
  }

  return true;
}

export async function isBlocked(
  firstUserId,
  secondUserId
) {
  if (!firstUserId || !secondUserId) {
    return false;
  }

  const { data, error } = await supabase
    .from(BLOCKED_TABLE)
    .select('id')
    .or(
      `and(blocker_id.eq.${firstUserId},blocked_id.eq.${secondUserId}),and(blocker_id.eq.${secondUserId},blocked_id.eq.${firstUserId})`
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function getBlockedUsers(
  { page = 0, pageSize = 30 } = {}
) {
  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(BLOCKED_TABLE)
    .select(
      'id, blocker_id, blocked_id, created_at'
    )
    .eq('blocker_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const ids = (data || []).map(
    (row) => row.blocked_id
  );

  const profiles = await getProfilesByIds(ids);
  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ])
  );

  return (data || [])
    .map((row) => ({
      ...profileMap.get(row.blocked_id),
      block_id: row.id,
      blocked_at: row.created_at,
    }))
    .filter((profile) => profile.id);
}

export async function muteUser(mutedUserId) {
  const user = await requireUser();

  assertDifferentUsers(user.id, mutedUserId);

  const { data, error } = await supabase
    .from(MUTED_TABLE)
    .upsert(
      {
        user_id: user.id,
        muted_user_id: mutedUserId,
      },
      {
        onConflict: 'user_id,muted_user_id',
        ignoreDuplicates: true,
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function unmuteUser(mutedUserId) {
  const user = await requireUser();

  const { error } = await supabase
    .from(MUTED_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('muted_user_id', mutedUserId);

  if (error) {
    throw error;
  }

  return true;
}

export async function isMuted(
  ownerUserId,
  mutedUserId
) {
  if (!ownerUserId || !mutedUserId) {
    return false;
  }

  const { data, error } = await supabase
    .from(MUTED_TABLE)
    .select('id')
    .eq('user_id', ownerUserId)
    .eq('muted_user_id', mutedUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function getMutedUsers(
  { page = 0, pageSize = 30 } = {}
) {
  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(MUTED_TABLE)
    .select(
      'id, user_id, muted_user_id, created_at'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const ids = (data || []).map(
    (row) => row.muted_user_id
  );

  const profiles = await getProfilesByIds(ids);
  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ])
  );

  return (data || [])
    .map((row) => ({
      ...profileMap.get(row.muted_user_id),
      mute_id: row.id,
      muted_at: row.created_at,
    }))
    .filter((profile) => profile.id);
}

export async function restrictUser(
  restrictedUserId
) {
  const user = await requireUser();

  assertDifferentUsers(user.id, restrictedUserId);

  const { data, error } = await supabase
    .from(RESTRICTED_TABLE)
    .upsert(
      {
        user_id: user.id,
        restricted_user_id: restrictedUserId,
      },
      {
        onConflict: 'user_id,restricted_user_id',
        ignoreDuplicates: true,
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function unrestrictUser(
  restrictedUserId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(RESTRICTED_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('restricted_user_id', restrictedUserId);

  if (error) {
    throw error;
  }

  return true;
}

export async function isRestricted(
  ownerUserId,
  restrictedUserId
) {
  if (!ownerUserId || !restrictedUserId) {
    return false;
  }

  const { data, error } = await supabase
    .from(RESTRICTED_TABLE)
    .select('id')
    .eq('user_id', ownerUserId)
    .eq('restricted_user_id', restrictedUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function getRestrictedUsers(
  { page = 0, pageSize = 30 } = {}
) {
  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(RESTRICTED_TABLE)
    .select(
      'id, user_id, restricted_user_id, created_at'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const ids = (data || []).map(
    (row) => row.restricted_user_id
  );

  const profiles = await getProfilesByIds(ids);
  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ])
  );

  return (data || [])
    .map((row) => ({
      ...profileMap.get(row.restricted_user_id),
      restriction_id: row.id,
      restricted_at: row.created_at,
    }))
    .filter((profile) => profile.id);
}

export async function getCloseFriends(userId) {
  const ownerId = userId || (await requireUser()).id;

  const { data, error } = await supabase
    .from('close_friends')
    .select(`
      id,
      user_id,
      friend_id,
      created_at,
      profiles!close_friends_friend_id_fkey (
        ${PROFILE_FIELDS}
      )
    `)
    .eq('user_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function addCloseFriend(friendId) {
  const user = await requireUser();

  assertDifferentUsers(user.id, friendId);

  const { data, error } = await supabase
    .from('close_friends')
    .upsert(
      {
        user_id: user.id,
        friend_id: friendId,
      },
      {
        onConflict: 'user_id,friend_id',
        ignoreDuplicates: true,
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
  const user = await requireUser();

  const { error } = await supabase
    .from('close_friends')
    .delete()
    .eq('user_id', user.id)
    .eq('friend_id', friendId);

  if (error) {
    throw error;
  }

  return true;
}

export function subscribeToFollowChanges(callback) {
  const channel = supabase
    .channel('aarush-follow-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: FOLLOWS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToFollowRequests(callback) {
  return subscribeToFollowChanges(callback);
}

export function subscribeToBlockChanges(callback) {
  const channel = supabase
    .channel('aarush-block-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: BLOCKED_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: MUTED_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: RESTRICTED_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'close_friends',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToPrivacyChanges(callback) {
  return subscribeToBlockChanges(callback);
}