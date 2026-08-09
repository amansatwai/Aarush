import { supabase } from '../lib/supabase';

const FOLLOW_TABLE = 'follows';

function requireUser(userId) {
  if (!userId) {
    throw new Error('Authentication is required for this action.');
  }
}

function preventSelfFollow(followerId, followingId) {
  if (followerId === followingId) {
    throw new Error('You cannot follow yourself.');
  }
}

export async function followUser(followerId, followingId) {
  requireUser(followerId);
  preventSelfFollow(followerId, followingId);

  const { data: existingFollow, error: existingError } =
    await supabase
      .from(FOLLOW_TABLE)
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingFollow) {
    return {
      following: true,
      relationship: 'following',
      data: existingFollow,
    };
  }

  const { data, error } = await supabase
    .from(FOLLOW_TABLE)
    .insert({
      follower_id: followerId,
      following_id: followingId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return {
        following: true,
        relationship: 'following',
        data: null,
      };
    }

    throw error;
  }

  return {
    following: true,
    relationship: 'following',
    data,
  };
}

export async function unfollowUser(
  followerId,
  followingId
) {
  requireUser(followerId);
  preventSelfFollow(followerId, followingId);

  const { error } = await supabase
    .from(FOLLOW_TABLE)
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) {
    throw error;
  }

  return {
    following: false,
    relationship: 'not_following',
  };
}

export async function toggleFollow(
  followerId,
  followingId,
  currentlyFollowing
) {
  requireUser(followerId);
  preventSelfFollow(followerId, followingId);

  if (currentlyFollowing) {
    return unfollowUser(followerId, followingId);
  }

  return followUser(followerId, followingId);
}

export async function isFollowing(
  followerId,
  followingId
) {
  if (!followerId || !followingId) {
    return false;
  }

  if (followerId === followingId) {
    return false;
  }

  const { data, error } = await supabase
    .from(FOLLOW_TABLE)
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function getRelationship(
  viewerId,
  profileId
) {
  if (!viewerId || !profileId) {
    return {
      state: 'not_following',
      following: false,
      followBack: false,
      isOwnProfile: false,
    };
  }

  if (viewerId === profileId) {
    return {
      state: 'own_profile',
      following: false,
      followBack: false,
      isOwnProfile: true,
    };
  }

  const [
    { data: outgoingFollow, error: outgoingError },
    { data: incomingFollow, error: incomingError },
  ] = await Promise.all([
    supabase
      .from(FOLLOW_TABLE)
      .select('id')
      .eq('follower_id', viewerId)
      .eq('following_id', profileId)
      .maybeSingle(),

    supabase
      .from(FOLLOW_TABLE)
      .select('id')
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

  const following = Boolean(outgoingFollow);
  const followBack = Boolean(incomingFollow);

  return {
    state: following ? 'following' : 'not_following',
    following,
    followBack,
    isOwnProfile: false,
  };
}

export async function getFollowersCount(profileId) {
  if (!profileId) {
    return 0;
  }

  const { count, error } = await supabase
    .from(FOLLOW_TABLE)
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('following_id', profileId);

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function getFollowingCount(profileId) {
  if (!profileId) {
    return 0;
  }

  const { count, error } = await supabase
    .from(FOLLOW_TABLE)
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('follower_id', profileId);

  if (error) {
    throw error;
  }

  return count || 0;
}

async function getProfilesByIds(profileIds) {
  if (!profileIds.length) {
    return [];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, username, avatar_url, profession, bio'
    )
    .in('id', profileIds);

  if (error) {
    throw error;
  }

  const profileMap = new Map(
    (data || []).map((profile) => [profile.id, profile])
  );

  return profileIds.map((id) => profileMap.get(id)).filter(Boolean);
}

export async function getFollowers(profileId) {
  if (!profileId) {
    return [];
  }

  const { data, error } = await supabase
    .from(FOLLOW_TABLE)
    .select('id, follower_id, following_id, created_at')
    .eq('following_id', profileId)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const profileIds = (data || []).map(
    (follow) => follow.follower_id
  );

  const profiles = await getProfilesByIds(profileIds);

  return profiles.map((profile) => {
    const relationship = data.find(
      (follow) => follow.follower_id === profile.id
    );

    return {
      ...profile,
      follow_id: relationship?.id || null,
      followed_at: relationship?.created_at || null,
    };
  });
}

export async function getFollowing(profileId) {
  if (!profileId) {
    return [];
  }

  const { data, error } = await supabase
    .from(FOLLOW_TABLE)
    .select('id, follower_id, following_id, created_at')
    .eq('follower_id', profileId)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const profileIds = (data || []).map(
    (follow) => follow.following_id
  );

  const profiles = await getProfilesByIds(profileIds);

  return profiles.map((profile) => {
    const relationship = data.find(
      (follow) => follow.following_id === profile.id
    );

    return {
      ...profile,
      follow_id: relationship?.id || null,
      followed_at: relationship?.created_at || null,
    };
  });
}