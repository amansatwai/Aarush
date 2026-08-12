import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  updated_at,
  verified
`;

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  session: 'aarush_guest_session',
  profile: 'aarush_guest_profile',
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function isGuestMode() {
  if (!isBrowser()) return false;

  try {
    return (
      window.localStorage.getItem(GUEST_KEYS.isGuest) ===
        'true' &&
      window.localStorage.getItem(GUEST_KEYS.session) !==
        null
    );
  } catch {
    return false;
  }
}

function normalizeUsername(value) {
  return String(value || '')
    .trim()
    .replace(/^@/, '');
}

function getGuestProfile() {
  const fallback = {
    id: 'guest',
    full_name: 'Guest User',
    username: 'guest',
    bio: 'Sign in to access your real profile.',
    account_type: 'Guest',
    avatar_url: '',
    is_private: false,
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
    stories_count: 0,
    highlights_count: 0,
  };

  if (!isBrowser()) return fallback;

  try {
    const value = window.localStorage.getItem(
      GUEST_KEYS.profile
    );

    if (!value) return fallback;

    return {
      ...fallback,
      ...JSON.parse(value),
    };
  } catch {
    return fallback;
  }
}

function formatCount(value) {
  const number = Number(value) || 0;

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return String(number);
}

function Avatar({ profile, size = '5.8rem' }) {
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
      aria-label="Profile avatar placeholder"
      style={{
        ...styles.placeholderAvatar,
        width: size,
        height: size,
      }}
    >
      <UserRound size={32} />
    </span>
  );
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

function RelationshipActions({
  ownProfile,
  guest,
  relationship,
  request,
  loading,
  onFollow,
  onUnfollow,
  onAccept,
  onReject,
  onLogin,
}) {
  if (ownProfile) return null;

  if (request) {
    return (
      <div style={styles.requestActions}>
        <button
          type="button"
          disabled={loading}
          onClick={onAccept}
          style={styles.primaryButton}
        >
          <Check size={15} />
          Accept
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onReject}
          style={styles.secondaryButton}
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
        onClick={onLogin}
        style={styles.primaryButton}
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
        disabled={loading}
        onClick={onUnfollow}
        style={styles.followingButton}
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
        disabled={loading}
        onClick={onUnfollow}
        style={styles.requestedButton}
      >
        Requested
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onFollow}
      style={styles.primaryButton}
    >
      <UserPlus size={15} />
      {relationship?.followBack
        ? 'Follow back'
        : 'Follow'}
    </button>
  );
}

function MutualFollowersSheet({
  people,
  onClose,
  onOpen,
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mutual followers"
      onClick={onClose}
      style={styles.sheetBackdrop}
    >
      <section
        onClick={(event) => event.stopPropagation()}
        style={styles.sheet}
      >
        <div style={styles.sheetHeader}>
          <strong>Mutual Followers</strong>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close mutual followers"
            style={styles.iconAction}
          >
            <X size={16} />
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
                <Avatar
                  profile={person}
                  size="2.5rem"
                />

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
          <p style={styles.emptyText}>
            No mutual followers.
          </p>
        )}
      </section>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams();
  const mountedRef = useRef(true);
  const noticeTimerRef = useRef(null);

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
  const [peopleSheetOpen, setPeopleSheetOpen] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const profileUsername = useMemo(
    () => normalizeUsername(profile?.username),
    [profile?.username]
  );

  const displayName = profile?.full_name || 'Aarush User';

  const ownProfile = Boolean(
    user?.id &&
      profile?.id &&
      user.id === profile.id
  );

  const showNotice = useCallback((message) => {
    if (!mountedRef.current) return;

    setNotice(message);

    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        setNotice('');
      }
      noticeTimerRef.current = null;
    }, 2600);
  }, []);

  const loadCounts = useCallback(async (profileId) => {
    if (!profileId || profileId === 'guest') return;

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

    if (!mountedRef.current) return;

    setFollowersCount(Number(followers) || 0);
    setFollowingCount(Number(following) || 0);
    setPostsCount(Number(posts?.count) || 0);
    setStoriesCount(Number(stories?.count) || 0);
    setHighlightsCount(Number(highlights?.count) || 0);
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (isGuestMode()) {
        const guestData = getGuestProfile();

        setGuest(true);
        setUser(null);
        setProfile(guestData);
        setRelationship(null);
        setIncomingRequest(null);
        setMutualFollowers([]);
        setFollowersCount(
          Number(guestData.followers_count) || 0
        );
        setFollowingCount(
          Number(guestData.following_count) || 0
        );
        setPostsCount(
          Number(guestData.posts_count) || 0
        );
        setStoriesCount(
          Number(guestData.stories_count) || 0
        );
        setHighlightsCount(
          Number(guestData.highlights_count) || 0
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

      if (profileError) throw profileError;

      if (!profileRow) {
        throw new Error('Profile not found.');
      }

      const nextRelationship =
        await getRelationship(
          currentUser.id,
          profileRow.id
        );

      const { data: pendingRequest } = await supabase
        .from('follows')
        .select('id, follower_id, following_id, status')
        .eq('follower_id', profileRow.id)
        .eq('following_id', currentUser.id)
        .eq('status', 'pending')
        .maybeSingle();

      setGuest(false);
      setUser(currentUser);
      setProfile(profileRow);
      setRelationship(nextRelationship || null);
      setIncomingRequest(pendingRequest || null);

      await loadCounts(profileRow.id);

      if (
        currentUser.id !== profileRow.id
      ) {
        try {
          const result = await getMutualFollowers(
            currentUser.id,
            profileRow.id
          );

          setMutualFollowers(
            Array.isArray(result) ? result : []
          );
        } catch {
          setMutualFollowers([]);
        }
      } else {
        setMutualFollowers([]);
      }
    } catch (loadError) {
      if (mountedRef.current) {
        setError(
          loadError?.message ||
            'Unable to load profile.'
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [loadCounts, navigate, routeUsername]);

  useEffect(() => {
    mountedRef.current = true;
    loadProfile();

    return () => {
      mountedRef.current = false;

      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, [loadProfile]);

  useEffect(() => {
    if (
      guest ||
      !profile?.id ||
      !user?.id
    ) {
      return undefined;
    }

    let active = true;

    const cleanup = subscribeToFollowChanges(
      async () => {
        if (!active || !profile?.id) return;

        try {
          await loadCounts(profile.id);

          const nextRelationship =
            await getRelationship(
              user.id,
              profile.id
            );

          if (active) {
            setRelationship(
              nextRelationship || null
            );
          }
        } catch {
          // Realtime refresh is best effort.
        }
      }
    );

    return () => {
      active = false;

      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [
    guest,
    loadCounts,
    profile?.id,
    user?.id,
  ]);

  const handleFollow = useCallback(async () => {
    if (guest) {
      showNotice('Sign in to follow this profile.');
      return;
    }

    if (!profile || ownProfile) return;

    setActionLoading(true);

    try {
      const result = await followUser(profile.id);

      const status = result?.status;

      setRelationship((current) => ({
        ...(current || {}),
        following: status === 'accepted',
        requested: status === 'pending',
        state: status,
      }));

      if (status === 'accepted') {
        setFollowersCount((value) => value + 1);
      }

      showNotice(
        status === 'pending'
          ? 'Follow request sent.'
          : 'Profile followed.'
      );
    } catch (followError) {
      showNotice(
        followError?.message ||
          'Unable to follow profile.'
      );
    } finally {
      setActionLoading(false);
    }
  }, [
    guest,
    ownProfile,
    profile,
    showNotice,
  ]);

  const handleUnfollow = useCallback(async () => {
    if (guest || !profile) return;

    const wasFollowing = Boolean(
      relationship?.following
    );

    setActionLoading(true);

    try {
      await unfollowUser(profile.id);

      setRelationship((current) => ({
        ...(current || {}),
        following: false,
        requested: false,
        state: 'not_following',
      }));

      if (wasFollowing) {
        setFollowersCount((value) =>
          Math.max(0, value - 1)
        );
      }

      showNotice('Follow removed.');
    } catch (followError) {
      showNotice(
        followError?.message ||
          'Unable to update follow.'
      );
    } finally {
      setActionLoading(false);
    }
  }, [
    guest,
    profile,
    relationship?.following,
    showNotice,
  ]);

  const handleAccept = useCallback(async () => {
    if (!incomingRequest) return;

    setActionLoading(true);

    try {
      await acceptFollowRequest(
        incomingRequest.follower_id
      );

      setIncomingRequest(null);
      showNotice('Follow request accepted.');

      if (profile?.id) {
        await loadCounts(profile.id);
      }
    } catch (requestError) {
      showNotice(
        requestError?.message ||
          'Unable to accept request.'
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
    if (!incomingRequest) return;

    setActionLoading(true);

    try {
      await rejectFollowRequest(
        incomingRequest.follower_id
      );

      setIncomingRequest(null);
      showNotice('Follow request rejected.');
    } catch (requestError) {
      showNotice(
        requestError?.message ||
          'Unable to reject request.'
      );
    } finally {
      setActionLoading(false);
    }
  }, [incomingRequest, showNotice]);

  const handleShare = useCallback(async () => {
    if (
      !isBrowser() ||
      !profileUsername
    ) {
      return;
    }

    const url = `${window.location.origin}/profile/${profileUsername}`;

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: displayName,
          text: `View ${displayName}'s Aarush profile.`,
          url,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showNotice('Profile link copied.');
        return;
      }

      showNotice(url);
    } catch {
      showNotice('Profile sharing cancelled.');
    }
  }, [
    displayName,
    profileUsername,
    showNotice,
  ]);

  const openPeople = useCallback(
    (type) => {
      if (!profile?.id) return;
      navigate(`/${type}/${profile.id}`);
    },
    [navigate, profile?.id]
  );

  const topBar = (
    <TopBar
      profileMode
      username={`@${profileUsername || 'username'}`}
    />
  );

  if (loading) {
    return (
      <div style={styles.page}>
        {topBar}
        <main style={styles.center}>
          Loading profile…
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={styles.page}>
        {topBar}
        <main style={styles.center}>
          <ShieldCheck size={30} />
          <h1>Unable to load profile</h1>
          <p>{error || 'Profile unavailable.'}</p>

          <button
            type="button"
            onClick={loadProfile}
            style={styles.primaryButton}
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
      {topBar}

      <main style={styles.content}>
        {guest ? (
          <div style={styles.notice}>
            <UserRound size={15} />
            Guest Mode · Sign in to use protected actions.
          </div>
        ) : null}

        {notice ? (
          <div role="status" style={styles.notice}>
            {notice}
          </div>
        ) : null}

        <section style={styles.card}>
          <div style={styles.profileRow}>
            <Avatar profile={profile} />

            <div style={styles.identity}>
              <div style={styles.usernameRow}>
                <strong>
                  @{profileUsername || 'user'}
                </strong>

                {profile.verified ? (
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
                {profile.account_type || 'Personal'}
              </span>

              <p style={styles.bio}>
                {profile.bio || 'No bio yet.'}
              </p>

              <div style={styles.meta}>
                <span>
                  <Link2 size={13} />
                  {profile.website || 'No website'}
                </span>

                <span>
                  <MapPin size={13} />
                  {profile.location || 'No location'}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.visibility}>
            {profile.is_private ? (
              <EyeOff size={13} />
            ) : (
              <Eye size={13} />
            )}
            {profile.is_private
              ? 'Private profile'
              : 'Public profile'}
          </div>

          {mutualFollowers.length ? (
            <button
              type="button"
              onClick={() => setPeopleSheetOpen(true)}
              style={styles.mutualButton}
            >
              {mutualFollowers.length} mutual followers
            </button>
          ) : null}

          <div style={styles.stats}>
            <ProfileStat
              label="Posts"
              value={postsCount}
            />

            <ProfileStat
              label="Followers"
              value={followersCount}
              onClick={() => openPeople('followers')}
            />

            <ProfileStat
              label="Following"
              value={followingCount}
              onClick={() => openPeople('following')}
            />

            <ProfileStat
              label="Stories"
              value={storiesCount}
            />

            <ProfileStat
              label="Highlights"
              value={highlightsCount}
            />
          </div>

          <div style={styles.actions}>
            {ownProfile ? (
              <button
                type="button"
                onClick={() =>
                  navigate('/profile-settings')
                }
                style={styles.primaryButton}
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            ) : (
              <RelationshipActions
                ownProfile={ownProfile}
                guest={guest}
                relationship={relationship}
                request={incomingRequest}
                loading={actionLoading}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                onAccept={handleAccept}
                onReject={handleReject}
                onLogin={() => navigate('/login')}
              />
            )}

            {!ownProfile ? (
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
                style={styles.secondaryButton}
              >
                <MessageCircle size={15} />
                Message
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleShare}
              aria-label="Share profile"
              style={styles.iconAction}
            >
              <Share2 size={16} />
            </button>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeading}>
            <Users size={17} />

            <div>
              <h2 style={styles.sectionTitle}>
                Connections
              </h2>
              <p style={styles.sectionSubtitle}>
                Explore this profile’s social graph.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openPeople('followers')}
            style={styles.connectionButton}
          >
            Followers
            <ChevronRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => openPeople('following')}
            style={styles.connectionButton}
          >
            Following
            <ChevronRight size={15} />
          </button>
        </section>
      </main>

      <BottomNav />

      {peopleSheetOpen ? (
        <MutualFollowersSheet
          people={mutualFollowers}
          onClose={() => setPeopleSheetOpen(false)}
          onOpen={(person) => {
            setPeopleSheetOpen(false);
            navigate(
              `/profile/${normalizeUsername(
                person.username
              )}`
            );
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
      'radial-gradient(circle at top,rgba(34,43,68,.45),#07090e 65%)',
  },

  content: {
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.85rem',
  },

  card: {
    padding: '1rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.35rem',
    background: 'rgba(15,19,30,.92)',
    boxShadow: '0 20px 60px rgba(0,0,0,.28)',
  },

  profileRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '.9rem',
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
    gap: '.3rem',
    fontSize: '1rem',
  },

  fullName: {
    display: 'block',
    marginTop: '.2rem',
    color: '#cbd6ec',
    fontSize: '.82rem',
  },

  accountType: {
    display: 'inline-block',
    marginTop: '.35rem',
    padding: '.2rem .4rem',
    borderRadius: '999px',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.58rem',
    fontWeight: 800,
  },

  bio: {
    margin: '.45rem 0 0',
    color: '#d5def1',
    fontSize: '.77rem',
    lineHeight: 1.5,
  },

  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.45rem',
    marginTop: '.45rem',
    color: '#91a0bc',
    fontSize: '.65rem',
  },

  visibility: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    marginTop: '.85rem',
    padding: '.3rem .5rem',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '.62rem',
    fontWeight: 800,
  },

  mutualButton: {
    marginTop: '.5rem',
    border: 0,
    color: '#9deeff',
    background: 'transparent',
    fontSize: '.65rem',
    cursor: 'pointer',
  },

  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5,minmax(0,1fr))',
    gap: '.25rem',
    marginTop: '1rem',
    paddingTop: '.85rem',
    borderTop: '1px solid rgba(255,255,255,.07)',
  },

  statButton: {
    display: 'grid',
    gap: '.18rem',
    padding: '.2rem',
    border: 0,
    color: '#f4f7ff',
    background: 'transparent',
    textAlign: 'center',
    cursor: 'pointer',
  },

  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.45rem',
    marginTop: '.9rem',
  },

  primaryButton: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    flex: '1 1 9rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  secondaryButton: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    flex: '1 1 8rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '999px',
    color: '#eaf0ff',
    background: 'rgba(124,92,255,.1)',
    fontSize: '.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  followingButton: {
    minHeight: '2.65rem',
    flex: '1 1 9rem',
    border: '1px solid rgba(130,233,193,.25)',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    cursor: 'pointer',
  },

  requestedButton: {
    minHeight: '2.65rem',
    flex: '1 1 9rem',
    border: '1px solid rgba(255,210,125,.25)',
    borderRadius: '999px',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.08)',
    cursor: 'pointer',
  },

  requestActions: {
    display: 'flex',
    gap: '.4rem',
    flex: '1 1 15rem',
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

  notice: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '.7rem',
    border: '1px solid rgba(77,215,255,.18)',
    borderRadius: '.8rem',
    color: '#b8f4ff',
    background: 'rgba(77,215,255,.07)',
    fontSize: '.68rem',
  },

  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
    color: '#dce8ff',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '.9rem',
  },

  sectionSubtitle: {
    margin: '.2rem 0 0',
    color: '#96a3bf',
    fontSize: '.66rem',
  },

  connectionButton: {
    width: '100%',
    minHeight: '2.55rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '.45rem',
    padding: '0 .65rem',
    border: '1px solid rgba(124,92,255,.18)',
    borderRadius: '.8rem',
    color: '#dce5f8',
    background: 'rgba(124,92,255,.07)',
    fontSize: '.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  center: {
    minHeight: '60vh',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.5rem',
    padding: '1rem',
    color: '#9deeff',
    textAlign: 'center',
  },

  sheetBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '.8rem',
    background: 'rgba(2,5,10,.7)',
    backdropFilter: 'blur(10px)',
  },

  sheet: {
    width: 'min(100%,540px)',
    maxHeight: '75vh',
    overflowY: 'auto',
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '1.3rem',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
  },

  sheetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '.7rem',
    color: '#f4f7ff',
  },

  peopleList: {
    display: 'grid',
    gap: '.45rem',
  },

  personRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.8rem',
    color: '#fff',
    background: 'rgba(255,255,255,.04)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  personCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  emptyText: {
    color: '#96a3bf',
    textAlign: 'center',
  },
};