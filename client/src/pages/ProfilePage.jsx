import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  Link2,
  MapPin,
  MessageCircle,
  Search,
  Share2,
  ShieldCheck,
  UserPlus,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import {
  acceptFollowRequest,
  cancelFollowRequest,
  followUser,
  getFollowerCount,
  getFollowingCount,
  getMutualFollowers,
  getRelationship,
  rejectFollowRequest,
  subscribeToFollowChanges,
  unfollowUser,
} from '../utils/followEngine';

const PROFILE_FIELDS = `
  id,
  full_name,
  username,
  bio,
  website,
  location,
  profession,
  account_type,
  is_private,
  avatar_url,
  updated_at
`;

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
  guestProfile: 'aarush_guest_profile',
};

function isGuestMode() {
  return (
    localStorage.getItem(GUEST_KEYS.isGuest) === 'true' &&
    localStorage.getItem(GUEST_KEYS.guestSession) !== null
  );
}

function normalizeUsername(value) {
  if (!value) {
    return '';
  }

  return value.startsWith('@')
    ? value.slice(1)
    : value;
}

function getGuestProfile() {
  try {
    const stored = localStorage.getItem(
      GUEST_KEYS.guestProfile
    );

    return stored
      ? JSON.parse(stored)
      : {
          id: 'guest',
          full_name: 'Guest User',
          username: 'guest',
          bio: 'Sign in to access your real profile.',
          account_type: 'Guest',
          avatar_url: '',
          is_private: false,
        };
  } catch {
    return {
      id: 'guest',
      full_name: 'Guest User',
      username: 'guest',
      bio: 'Sign in to access your real profile.',
      account_type: 'Guest',
      avatar_url: '',
      is_private: false,
    };
  }
}

function formatCount(value) {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return String(number);
}

function ProfileStat({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.statButton}
    >
      <strong>{formatCount(value)}</strong>
      <span>{label}</span>
    </button>
  );
}

function Avatar({ profile, size = '6.2rem' }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={`${profile.full_name || 'Profile'} avatar`}
        style={{
          ...styles.avatar,
          width: size,
          height: size,
        }}
      />
    );
  }

  return (
    <span
      style={{
        ...styles.placeholderAvatar,
        width: size,
        height: size,
      }}
    >
      <UserRound size={35} />
    </span>
  );
}

function RelationshipButton({
  relationship,
  incomingRequest,
  loading,
  guest,
  onFollow,
  onUnfollow,
  onAccept,
  onReject,
  onSignIn,
}) {
  if (relationship?.isOwnProfile) {
    return null;
  }

  if (incomingRequest) {
    return (
      <div style={styles.requestActions}>
        <button
          type="button"
          onClick={onAccept}
          disabled={loading}
          style={styles.primaryAction}
        >
          <Check size={15} />
          Accept
        </button>

        <button
          type="button"
          onClick={onReject}
          disabled={loading}
          style={styles.secondaryAction}
        >
          <X size={15} />
          Reject
        </button>
      </div>
    );
  }

  if (guest) {
    return (
      <button
        type="button"
        onClick={onSignIn}
        style={styles.primaryAction}
      >
        <UserPlus size={15} />
        Follow
      </button>
    );
  }

  if (relationship?.following) {
    return (
      <button
        type="button"
        onClick={onUnfollow}
        disabled={loading}
        style={styles.followingAction}
      >
        <Check size={15} />
        Following
      </button>
    );
  }

  if (relationship?.requested) {
    return (
      <button
        type="button"
        onClick={onUnfollow}
        disabled={loading}
        style={styles.requestedAction}
      >
        Requested
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onFollow}
      disabled={loading}
      style={styles.primaryAction}
    >
      <UserPlus size={15} />
      {relationship?.followBack ? 'Follow back' : 'Follow'}
    </button>
  );
}

function PeopleSheet({
  title,
  people,
  onClose,
  onOpen,
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={styles.sheetBackdrop}
    >
      <section
        onClick={(event) => event.stopPropagation()}
        style={styles.sheet}
      >
        <div style={styles.sheetHeader}>
          <h2>{title}</h2>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close list"
          >
            <X size={17} />
          </button>
        </div>

        {people.length ? (
          <div style={styles.peopleList}>
            {people.map((person) => (
              <button
                type="button"
                key={person.id}
                onClick={() => onOpen(person)}
                style={styles.personRow}
              >
                <Avatar profile={person} size="2.6rem" />

                <span style={styles.personCopy}>
                  <strong>
                    {person.full_name || 'Aarush User'}
                  </strong>
                  <span>
                    @{person.username || 'user'}
                  </span>
                </span>

                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        ) : (
          <div style={styles.emptyPeople}>
            <Users size={25} />
            <span>No profiles to show.</span>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);
  const [relationship, setRelationship] =
    useState(null);
  const [incomingRequest, setIncomingRequest] =
    useState(null);
  const [followersCount, setFollowersCount] =
    useState(0);
  const [followingCount, setFollowingCount] =
    useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);
  const [highlightsCount, setHighlightsCount] =
    useState(0);
  const [mutualFollowers, setMutualFollowers] =
    useState([]);
  const [peopleSheet, setPeopleSheet] =
    useState(null);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const profileUsername = normalizeUsername(
    profile?.username
  );

  const displayName =
    profile?.full_name || 'Aarush User';

  const isPrivate = Boolean(profile?.is_private);

  const isOwnProfile = useMemo(
    () => Boolean(user && profile && user.id === profile.id),
    [profile, user]
  );

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2600);
  }, []);

  const loadCounts = useCallback(async (profileId) => {
    const [
      followers,
      following,
      posts,
      stories,
      highlights,
    ] = await Promise.all([
      getFollowerCount(profileId),
      getFollowingCount(profileId),

      supabase
        .from('posts')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('user_id', profileId),

      supabase
        .from('stories')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('user_id', profileId)
        .gt('expires_at', new Date().toISOString()),

      supabase
        .from('story_highlights')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('user_id', profileId),
    ]);

    setFollowersCount(followers);
    setFollowingCount(following);
    setPostsCount(posts.count || 0);
    setStoriesCount(stories.count || 0);
    setHighlightsCount(highlights.count || 0);
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const guestMode = isGuestMode();

      if (guestMode) {
        const guestProfile = getGuestProfile();

        setGuest(true);
        setUser(null);
        setProfile(guestProfile);
        setRelationship(null);
        setIncomingRequest(null);
        setFollowersCount(
          Number(guestProfile.followers_count || 0)
        );
        setFollowingCount(
          Number(guestProfile.following_count || 0)
        );
        setPostsCount(
          Number(guestProfile.posts_count || 0)
        );
        setStoriesCount(
          Number(guestProfile.stories_count || 0)
        );
        setHighlightsCount(
          Number(guestProfile.highlights_count || 0)
        );
        return;
      }

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        navigate('/login', { replace: true });
        return;
      }

      let query = supabase
        .from('profiles')
        .select(PROFILE_FIELDS);

      query = routeUsername
        ? query.eq(
            'username',
            normalizeUsername(routeUsername)
          )
        : query.eq('id', currentUser.id);

      const { data: profileRow, error: profileError } =
        await query.maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profileRow) {
        throw new Error('Profile not found.');
      }

      const [
        nextRelationship,
        counts,
      ] = await Promise.all([
        getRelationship(
          currentUser.id,
          profileRow.id
        ),
        loadCounts(profileRow.id),
      ]);

      const { data: pendingRequest } =
        await supabase
          .from('follows')
          .select('id, follower_id, following_id, status')
          .eq('follower_id', profileRow.id)
          .eq('following_id', currentUser.id)
          .eq('status', 'pending')
          .maybeSingle();

      setGuest(false);
      setUser(currentUser);
      setProfile(profileRow);
      setRelationship(nextRelationship);
      setIncomingRequest(pendingRequest || null);

      void counts;
    } catch (loadError) {
      setError(
        loadError.message || 'Unable to load profile.'
      );
    } finally {
      setLoading(false);
    }
  }, [loadCounts, navigate, routeUsername]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const cleanup = subscribeToFollowChanges(
      async (payload) => {
        const targetProfileId = profile?.id;

        if (!targetProfileId) {
          return;
        }

        const followerId =
          payload.new?.follower_id ||
          payload.old?.follower_id;

        const followingId =
          payload.new?.following_id ||
          payload.old?.following_id;

        if (
          followerId !== targetProfileId &&
          followingId !== targetProfileId
        ) {
          return;
        }

        await loadCounts(targetProfileId);

        if (user && !guest) {
          const nextRelationship =
            await getRelationship(
              user.id,
              targetProfileId
            );

          setRelationship(nextRelationship);

          const { data: nextRequest } =
            await supabase
              .from('follows')
              .select(
                'id, follower_id, following_id, status'
              )
              .eq('follower_id', targetProfileId)
              .eq('following_id', user.id)
              .eq('status', 'pending')
              .maybeSingle();

          setIncomingRequest(nextRequest || null);
        }
      }
    );

    return cleanup;
  }, [
    guest,
    loadCounts,
    profile?.id,
    user,
  ]);

  const handleFollow = useCallback(async () => {
    if (guest) {
      showNotice('Sign in to follow this profile.');
      return;
    }

    if (!user || !profile || isOwnProfile) {
      return;
    }

    const previous = relationship;
    setActionLoading(true);

    setRelationship((current) => ({
      ...current,
      following: !profile.is_private,
      requested: Boolean(profile.is_private),
      state: profile.is_private
        ? 'requested'
        : 'following',
    }));

    setFollowersCount((count) =>
      profile.is_private ? count : count + 1
    );

    try {
      const result = await followUser(profile.id);

      setRelationship((current) => ({
        ...current,
        following: result.status === 'accepted',
        requested: result.status === 'pending',
        state: result.status,
      }));

      if (result.status === 'accepted') {
        setFollowersCount((count) => count);
      }
    } catch (followError) {
      setRelationship(previous);
      setFollowersCount((count) =>
        profile.is_private
          ? count
          : Math.max(0, count - 1)
      );
      showNotice(
        followError.message || 'Unable to follow profile.'
      );
    } finally {
      setActionLoading(false);
    }
  }, [
    guest,
    isOwnProfile,
    profile,
    relationship,
    showNotice,
    user,
  ]);

  const handleUnfollow = useCallback(async () => {
    if (guest) {
      showNotice('Sign in to manage follows.');
      return;
    }

    if (!profile) {
      return;
    }

    const previous = relationship;
    const wasFollowing = Boolean(
      relationship?.following
    );

    setActionLoading(true);
    setRelationship({
      ...relationship,
      following: false,
      requested: false,
      state: 'not_following',
    });

    if (wasFollowing) {
      setFollowersCount((count) =>
        Math.max(0, count - 1)
      );
    }

    try {
      await unfollowUser(profile.id);
    } catch (followError) {
      setRelationship(previous);

      if (wasFollowing) {
        setFollowersCount((count) => count + 1);
      }

      showNotice(
        followError.message || 'Unable to update follow.'
      );
    } finally {
      setActionLoading(false);
    }
  }, [guest, profile, relationship, showNotice]);

  const handleAccept = useCallback(async () => {
    if (!incomingRequest) {
      return;
    }

    setActionLoading(true);

    try {
      await acceptFollowRequest(
        incomingRequest.follower_id
      );
      setIncomingRequest(null);
      showNotice('Follow request accepted.');
      await loadCounts(profile.id);
    } catch (acceptError) {
      showNotice(
        acceptError.message ||
          'Unable to accept follow request.'
      );
    } finally {
      setActionLoading(false);
    }
  }, [
    incomingRequest,
    loadCounts,
    profile?.id,
    showNotice,
  ]);

  const handleReject = useCallback(async () => {
    if (!incomingRequest) {
      return;
    }

    setActionLoading(true);

    try {
      await rejectFollowRequest(
        incomingRequest.follower_id
      );
      setIncomingRequest(null);
      showNotice('Follow request rejected.');
    } catch (rejectError) {
      showNotice(
        rejectError.message ||
          'Unable to reject follow request.'
      );
    } finally {
      setActionLoading(false);
    }
  }, [incomingRequest, showNotice]);

  const openFollowers = async () => {
    navigate(`/followers/${profile.id}`);
  };

  const openFollowing = async () => {
    navigate(`/following/${profile.id}`);
  };

  const openMutualFollowers = async () => {
    if (!user || !profile) {
      return;
    }

    try {
      const result = await getMutualFollowers(
        user.id,
        profile.id
      );

      setPeople(result);
      setPeopleSheet('Mutual Followers');
    } catch (mutualError) {
      showNotice(
        mutualError.message ||
          'Unable to load mutual followers.'
      );
    }
  };

  const shareProfile = async () => {
    const url = `${window.location.origin}/profile/${profileUsername}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: displayName,
          text: `View ${displayName}'s Aarush profile.`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        showNotice('Profile link copied.');
      }
    } catch {
      showNotice('Profile sharing cancelled.');
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <TopBar pageTitle="Profile" />
        <main style={styles.loading}>
          Loading profile…
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <TopBar pageTitle="Profile" />
        <main style={styles.error}>
          <ShieldCheck size={30} />
          <h1>Unable to load profile</h1>
          <p>{error}</p>
          <button
            type="button"
            onClick={loadProfile}
            style={styles.primaryAction}
          >
            Retry
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle={displayName}
        profileMode
        username={`@${profileUsername}`}
      />

      <main style={styles.content}>
        {guest ? (
          <div style={styles.guestNotice}>
            <UserRound size={16} />
            Guest Mode · Sign in to follow profiles.
          </div>
        ) : null}

        {notice ? (
          <div role="status" style={styles.notice}>
            {notice}
          </div>
        ) : null}

        <section style={styles.profileCard}>
          <div style={styles.profileTop}>
            <Avatar profile={profile} />

            <div style={styles.identity}>
              <div style={styles.usernameRow}>
                <strong>@{profileUsername}</strong>

                {profile?.verified ? (
                  <BadgeCheck
                    size={16}
                    color="#72e3ff"
                  />
                ) : null}
              </div>

              <span style={styles.fullName}>
                {displayName}
              </span>

              <span style={styles.accountType}>
                {profile?.account_type || 'Personal'}
              </span>

              <p style={styles.bio}>
                {profile?.bio || 'No bio yet.'}
              </p>

              <div style={styles.metaList}>
                <span>
                  <Link2 size={13} />
                  {profile?.website || 'Add your website'}
                </span>

                <span>
                  <MapPin size={13} />
                  {profile?.location || 'Location not set'}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.statusRow}>
            <span
              style={{
                ...styles.visibilityBadge,
                ...(isPrivate
                  ? styles.privateBadge
                  : styles.publicBadge),
              }}
            >
              {isPrivate ? (
                <EyeOff size={12} />
              ) : (
                <Eye size={12} />
              )}
              {isPrivate
                ? 'Private profile'
                : 'Public profile'}
            </span>

            {mutualFollowers.length > 0 ? (
              <button
                type="button"
                onClick={openMutualFollowers}
                style={styles.mutualButton}
              >
                {mutualFollowers.length} mutual
              </button>
            ) : null}
          </div>

          <div style={styles.statsGrid}>
            <ProfileStat
              label="Posts"
              value={postsCount}
              onClick={() =>
                navigate(`/profile/${profileUsername}`)
              }
            />

            <ProfileStat
              label="Followers"
              value={followersCount}
              onClick={openFollowers}
            />

            <ProfileStat
              label="Following"
              value={followingCount}
              onClick={openFollowing}
            />

            <ProfileStat
              label="Stories"
              value={storiesCount}
              onClick={() =>
                showNotice('Stories opened.')
              }
            />

            <ProfileStat
              label="Highlights"
              value={highlightsCount}
              onClick={() =>
                showNotice('Highlights opened.')
              }
            />
          </div>

          <div style={styles.actionRow}>
            {isOwnProfile ? (
              <button
                type="button"
                onClick={() =>
                  navigate('/profile-settings')
                }
                style={styles.primaryAction}
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            ) : (
              <RelationshipButton
                relationship={relationship}
                incomingRequest={incomingRequest}
                loading={actionLoading}
                guest={guest}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                onAccept={handleAccept}
                onReject={handleReject}
                onSignIn={() => navigate('/login')}
              />
            )}

            {!isOwnProfile ? (
              <button
                type="button"
                onClick={() => {
                  if (guest) {
                    showNotice(
                      'Sign in to message this profile.'
                    );
                    return;
                  }

                  navigate(`/chat/${profile.id}`);
                }}
                style={styles.secondaryAction}
              >
                <MessageCircle size={15} />
                Message
              </button>
            ) : null}

            <button
              type="button"
              onClick={shareProfile}
              style={styles.iconAction}
              aria-label="Share profile"
            >
              <Share2 size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/discover')}
            style={styles.discoverButton}
          >
            <Search size={15} />
            Discover People
            <ChevronRight size={15} />
          </button>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>
              <Users size={16} />
            </span>

            <div>
              <h2 style={styles.sectionTitle}>
                Connections
              </h2>
              <p style={styles.sectionSubtitle}>
                Explore this profile’s social graph.
              </p>
            </div>
          </div>

          <div style={styles.connectionGrid}>
            <button
              type="button"
              onClick={openFollowers}
              style={styles.connectionButton}
            >
              <Users size={15} />
              Followers
              <ChevronRight size={15} />
            </button>

            <button
              type="button"
              onClick={openFollowing}
              style={styles.connectionButton}
            >
              <Users size={15} />
              Following
              <ChevronRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/discover')}
              style={styles.connectionButton}
            >
              <UserPlus size={15} />
              Discover People
              <ChevronRight size={15} />
            </button>
          </div>
        </section>
      </main>

      <BottomNav />

      {peopleSheet ? (
        <PeopleSheet
          title={peopleSheet}
          people={people}
          onClose={() => setPeopleSheet(null)}
          onOpen={(person) => {
            setPeopleSheet(null);
            navigate(`/profile/${person.username}`);
          }}
        />
      ) : null}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '6.8rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top, rgba(34,43,68,.45), #07090e 65%)',
  },

  content: {
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0.9rem',
    display: 'grid',
    gap: '0.85rem',
  },

  profileCard: {
    padding: '1rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.35rem',
    background: 'rgba(15,19,30,.92)',
    boxShadow: '0 20px 60px rgba(0,0,0,.28)',
  },

  profileTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.9rem',
  },

  avatar: {
    objectFit: 'cover',
    flexShrink: 0,
    border: '3px solid #7c5cff',
    borderRadius: '999px',
    boxShadow: '0 0 25px rgba(124,92,255,.25)',
  },

  placeholderAvatar: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '3px solid #7c5cff',
    borderRadius: '999px',
    color: '#dce8ff',
    background:
      'linear-gradient(135deg,#18213a,#2b2048)',
  },

  identity: {
    minWidth: 0,
    flex: 1,
  },

  usernameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },

  fullName: {
    display: 'block',
    marginTop: '0.2rem',
    color: '#cbd6ec',
    fontSize: '0.82rem',
    fontWeight: 750,
  },

  accountType: {
    display: 'inline-block',
    marginTop: '0.35rem',
    padding: '0.2rem 0.4rem',
    borderRadius: '999px',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '0.58rem',
    fontWeight: 800,
  },

  bio: {
    margin: '0.45rem 0 0',
    color: '#d5def1',
    fontSize: '0.77rem',
    lineHeight: 1.5,
  },

  metaList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.45rem',
    marginTop: '0.45rem',
    color: '#91a0bc',
    fontSize: '0.65rem',
    fontWeight: 700,
  },

  statusRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginTop: '0.85rem',
  },

  visibilityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.3rem 0.45rem',
    borderRadius: '999px',
    fontSize: '0.6rem',
    fontWeight: 800,
  },

  publicBadge: {
    color: '#82e9c1',
    background: 'rgba(130,233,193,.12)',
  },

  privateBadge: {
    color: '#ffd27d',
    background: 'rgba(255,210,125,.12)',
  },

  mutualButton: {
    padding: '0.3rem 0.45rem',
    border: 0,
    borderRadius: '999px',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(5, minmax(0, 1fr))',
    gap: '0.25rem',
    marginTop: '1rem',
    paddingTop: '0.85rem',
    borderTop: '1px solid rgba(255,255,255,.07)',
  },

  statButton: {
    display: 'grid',
    gap: '0.18rem',
    padding: '0.2rem',
    border: 0,
    color: '#f4f7ff',
    background: 'transparent',
    textAlign: 'center',
    cursor: 'pointer',
  },

  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.45rem',
    marginTop: '0.9rem',
  },

  primaryAction: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    flex: '1 1 9rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '0.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  secondaryAction: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    flex: '1 1 8rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '999px',
    color: '#eaf0ff',
    background: 'rgba(124,92,255,.1)',
    fontSize: '0.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  followingAction: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    flex: '1 1 9rem',
    border: '1px solid rgba(130,233,193,.25)',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '0.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  requestedAction: {
    minHeight: '2.65rem',
    flex: '1 1 9rem',
    border: '1px solid rgba(255,210,125,.25)',
    borderRadius: '999px',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.08)',
    fontSize: '0.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  iconAction: {
    width: '2.65rem',
    height: '2.65rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#eaf0ff',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  requestActions: {
    display: 'flex',
    gap: '0.4rem',
    flex: '1 1 15rem',
  },

  discoverButton: {
    width: '100%',
    minHeight: '2.55rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    marginTop: '0.55rem',
    border: '1px solid rgba(124,92,255,.22)',
    borderRadius: '0.8rem',
    color: '#c8bcff',
    background: 'rgba(124,92,255,.08)',
    fontSize: '0.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  section: {
    padding: '1rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,.9)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    marginBottom: '0.75rem',
  },

  sectionIcon: {
    width: '2.1rem',
    height: '2.1rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '0.7rem',
    color: '#dce8ff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.24),rgba(77,215,255,.12))',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '0.9rem',
  },

  sectionSubtitle: {
    margin: '0.2rem 0 0',
    color: '#96a3bf',
    fontSize: '0.66rem',
  },

  connectionGrid: {
    display: 'grid',
    gap: '0.45rem',
  },

  connectionButton: {
    minHeight: '2.55rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0 0.65rem',
    border: '1px solid rgba(124,92,255,.18)',
    borderRadius: '0.8rem',
    color: '#dce5f8',
    background: 'rgba(124,92,255,.07)',
    fontSize: '0.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  guestNotice: {
    padding: '0.7rem',
    border: '1px solid rgba(255,210,125,.2)',
    borderRadius: '0.8rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.08)',
    fontSize: '0.68rem',
  },

  notice: {
    padding: '0.7rem',
    border: '1px solid rgba(77,215,255,.18)',
    borderRadius: '0.8rem',
    color: '#b8f4ff',
    background: 'rgba(77,215,255,.07)',
    fontSize: '0.68rem',
  },

  loading: {
    minHeight: '60vh',
    display: 'grid',
    placeItems: 'center',
    color: '#9deeff',
  },

  error: {
    minHeight: '60vh',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.5rem',
    padding: '1rem',
    color: '#ffb1c8',
    textAlign: 'center',
  },

  sheetBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0.8rem',
    background: 'rgba(2,5,10,.7)',
    backdropFilter: 'blur(10px)',
  },

  sheet: {
    width: 'min(100%, 540px)',
    maxHeight: '75vh',
    overflowY: 'auto',
    padding: '0.9rem',
    borderRadius: '1.3rem 1.3rem 1rem 1rem',
    border: '1px solid rgba(255,255,255,.1)',
    background: 'linear-gradient(180deg,#171d2d,#0e1320)',
  },

  sheetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.7rem',
  },

  closeButton: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  peopleList: {
    display: 'grid',
    gap: '0.45rem',
  },

  personRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    padding: '0.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '0.8rem',
    color: '#fff',
    background: 'rgba(255,255,255,.04)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  personCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.15rem',
    flex: 1,
  },

  emptyPeople: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.45rem',
    padding: '2rem',
    color: '#96a3bf',
  },
};