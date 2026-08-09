import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  Link2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import {
  getFollowers,
  getFollowersCount,
  getFollowing,
  getFollowingCount,
  getRelationship,
  toggleFollow,
} from '../utils/followEngine';

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
  guestProfile: 'aarush_guest_profile',
};

const PROFILE_SELECT = `
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

function isGuestMode() {
  return (
    localStorage.getItem(GUEST_KEYS.isGuest) === 'true' &&
    localStorage.getItem(GUEST_KEYS.guestSession) !== null
  );
}

function getGuestProfile() {
  try {
    const savedProfile = localStorage.getItem(
      GUEST_KEYS.guestProfile
    );

    return savedProfile
      ? JSON.parse(savedProfile)
      : {
          full_name: 'Guest User',
          username: 'guest',
          bio: 'Sign in to access your real profile.',
          account_type: 'Guest',
          avatar_url: '',
        };
  } catch {
    return {
      full_name: 'Guest User',
      username: 'guest',
      bio: 'Sign in to access your real profile.',
      account_type: 'Guest',
      avatar_url: '',
    };
  }
}

function normalizeUsername(username) {
  if (!username) {
    return '';
  }

  return username.startsWith('@')
    ? username.slice(1)
    : username;
}

function formatCount(value) {
  if (typeof value !== 'number') {
    return '—';
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return String(value);
}

function getDisplayName(profile) {
  return (
    profile?.full_name ||
    profile?.displayName ||
    'Aarush User'
  );
}

function getProfileUsername(profile) {
  return normalizeUsername(
    profile?.username || profile?.user_name || 'user'
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

function RelationshipButton({
  relationship,
  onClick,
  loading,
  disabled,
}) {
  if (relationship?.isOwnProfile) {
    return null;
  }

  const isFollowing = relationship?.following;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        ...styles.followButton,
        ...(isFollowing ? styles.followingButton : {}),
        ...(loading || disabled ? styles.disabledButton : {}),
      }}
    >
      {loading ? (
        'Updating…'
      ) : isFollowing ? (
        <>
          <Check size={15} />
          Following
        </>
      ) : (
        <>
          <Users size={15} />
          Follow
        </>
      )}
    </button>
  );
}

function PersonRow({
  person,
  viewerId,
  isFollowingPerson,
  actionLoading,
  onFollow,
  onUnfollow,
}) {
  const displayName =
    person.full_name || 'Aarush User';
  const username = normalizeUsername(person.username);

  return (
    <div style={styles.personRow}>
      {person.avatar_url ? (
        <img
          src={person.avatar_url}
          alt={`${displayName} avatar`}
          style={styles.personAvatar}
        />
      ) : (
        <span style={styles.personPlaceholder}>
          <UserRound size={19} />
        </span>
      )}

      <div style={styles.personCopy}>
        <strong>{displayName}</strong>
        <span>@{username || 'user'}</span>
      </div>

      {viewerId && viewerId !== person.id ? (
        <button
          type="button"
          disabled={actionLoading}
          onClick={() =>
            isFollowingPerson
              ? onUnfollow(person.id)
              : onFollow(person.id)
          }
          style={{
            ...styles.personAction,
            ...(isFollowingPerson
              ? styles.personFollowingAction
              : {}),
          }}
        >
          {actionLoading
            ? '…'
            : isFollowingPerson
              ? 'Following'
              : 'Follow'}
        </button>
      ) : null}
    </div>
  );
}

function PeopleSheet({
  type,
  people,
  viewerId,
  loading,
  onClose,
  onFollow,
  onUnfollow,
  relationshipMap,
  actionTarget,
}) {
  const title = type === 'followers'
    ? 'Followers'
    : 'Following';

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
        <div style={styles.sheetHandle} />

        <div style={styles.sheetHeader}>
          <div>
            <h2>{title}</h2>
            <p>
              {type === 'followers'
                ? 'People who follow this profile.'
                : 'Profiles followed by this account.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close list"
          >
            <X size={17} />
          </button>
        </div>

        {loading ? (
          <div style={styles.sheetLoading}>
            Loading {title.toLowerCase()}…
          </div>
        ) : people.length ? (
          <div style={styles.peopleList}>
            {people.map((person) => (
              <PersonRow
                key={person.id}
                person={person}
                viewerId={viewerId}
                isFollowingPerson={Boolean(
                  relationshipMap[person.id]
                )}
                actionLoading={actionTarget === person.id}
                onFollow={onFollow}
                onUnfollow={onUnfollow}
              />
            ))}
          </div>
        ) : (
          <div style={styles.emptyPeople}>
            <Users size={26} />
            <span>
              {type === 'followers'
                ? 'No followers yet.'
                : 'Not following anyone yet.'}
            </span>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relationship, setRelationship] = useState(null);
  const [relationshipLoading, setRelationshipLoading] =
    useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(null);
  const [sheetType, setSheetType] = useState(null);
  const [people, setPeople] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleRelationshipMap, setPeopleRelationshipMap] =
    useState({});
  const [peopleActionTarget, setPeopleActionTarget] =
    useState(null);
  const [toast, setToast] = useState('');

  const isOwnProfile = useMemo(() => {
    if (guest || !user || !profile) {
      return false;
    }

    return user.id === profile.id;
  }, [guest, profile, user]);

  const profileUsername = getProfileUsername(profile);
  const displayName = getDisplayName(profile);
  const isPrivate = Boolean(
    profile?.is_private ?? profile?.isPrivate
  );

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

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
        setFollowersCount(
          Number(guestProfile.followers_count || 0)
        );
        setFollowingCount(
          Number(guestProfile.following_count || 0)
        );
        setPostsCount(
          guestProfile.posts_count ?? null
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

      let profileQuery = supabase
        .from('profiles')
        .select(PROFILE_SELECT);

      if (routeUsername) {
        profileQuery = profileQuery.eq(
          'username',
          normalizeUsername(routeUsername)
        );
      } else {
        profileQuery = profileQuery.eq(
          'id',
          currentUser.id
        );
      }

      const { data: profileRow, error: profileError } =
        await profileQuery.maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profileRow) {
        throw new Error('Profile not found.');
      }

      const [
        relationshipData,
        followersTotal,
        followingTotal,
      ] = await Promise.all([
        getRelationship(
          currentUser.id,
          profileRow.id
        ),
        getFollowersCount(profileRow.id),
        getFollowingCount(profileRow.id),
      ]);

      setGuest(false);
      setUser(currentUser);
      setProfile(profileRow);
      setRelationship(relationshipData);
      setFollowersCount(followersTotal);
      setFollowingCount(followingTotal);

      if (typeof profileRow.posts_count === 'number') {
        setPostsCount(profileRow.posts_count);
      } else {
        setPostsCount(null);
      }
    } catch (loadError) {
      setError(
        loadError.message || 'Unable to load profile.'
      );
    } finally {
      setLoading(false);
    }
  }, [navigate, routeUsername]);

  useEffect(() => {
    loadProfile();

    const handleFocus = () => {
      loadProfile();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadProfile]);

  const handleFollowToggle = async () => {
    if (guest) {
      showToast('Sign in to follow profiles.');
      return;
    }

    if (!user || !profile || isOwnProfile) {
      return;
    }

    const previousRelationship = relationship;
    const wasFollowing = Boolean(
      relationship?.following
    );

    setRelationshipLoading(true);

    setRelationship({
      ...relationship,
      state: wasFollowing
        ? 'not_following'
        : 'following',
      following: !wasFollowing,
      followBack: relationship?.followBack || false,
      isOwnProfile: false,
    });

    setFollowersCount((count) =>
      wasFollowing ? Math.max(0, count - 1) : count + 1
    );

    try {
      const nextRelationship = await toggleFollow(
        user.id,
        profile.id,
        wasFollowing
      );

      setRelationship((current) => ({
        ...current,
        ...nextRelationship,
      }));
    } catch (followError) {
      setRelationship(previousRelationship);
      setFollowersCount((count) =>
        wasFollowing ? count + 1 : Math.max(0, count - 1)
      );

      showToast(
        followError.message || 'Unable to update follow status.'
      );
    } finally {
      setRelationshipLoading(false);
    }
  };

  const openPeopleSheet = async (type) => {
    if (guest) {
      showToast(
        'Sign in to access the complete follower list.'
      );
      return;
    }

    if (!profile?.id) {
      return;
    }

    setSheetType(type);
    setPeople([]);
    setPeopleLoading(true);
    setPeopleRelationshipMap({});

    try {
      const result =
        type === 'followers'
          ? await getFollowers(profile.id)
          : await getFollowing(profile.id);

      setPeople(result);

      if (user?.id && result.length) {
        const relationshipEntries = await Promise.all(
          result.map(async (person) => {
            if (person.id === user.id) {
              return [person.id, false];
            }

            const relationshipResult = await getRelationship(
              user.id,
              person.id
            );

            return [
              person.id,
              Boolean(relationshipResult.following),
            ];
          })
        );

        setPeopleRelationshipMap(
          Object.fromEntries(relationshipEntries)
        );
      }
    } catch (peopleError) {
      showToast(
        peopleError.message || 'Unable to load profiles.'
      );
    } finally {
      setPeopleLoading(false);
    }
  };

  const handlePeopleFollow = async (personId) => {
    if (guest) {
      showToast('Sign in to follow profiles.');
      return;
    }

    if (!user) {
      return;
    }

    setPeopleActionTarget(personId);

    setPeopleRelationshipMap((current) => ({
      ...current,
      [personId]: true,
    }));

    try {
      await toggleFollow(user.id, personId, false);
    } catch (followError) {
      setPeopleRelationshipMap((current) => ({
        ...current,
        [personId]: false,
      }));

      showToast(
        followError.message || 'Unable to follow profile.'
      );
    } finally {
      setPeopleActionTarget(null);
    }
  };

  const handlePeopleUnfollow = async (personId) => {
    if (guest) {
      showToast('Sign in to unfollow profiles.');
      return;
    }

    if (!user) {
      return;
    }

    setPeopleActionTarget(personId);

    setPeopleRelationshipMap((current) => ({
      ...current,
      [personId]: false,
    }));

    try {
      await toggleFollow(user.id, personId, true);
    } catch (followError) {
      setPeopleRelationshipMap((current) => ({
        ...current,
        [personId]: true,
      }));

      showToast(
        followError.message || 'Unable to unfollow profile.'
      );
    } finally {
      setPeopleActionTarget(null);
    }
  };

  const shareProfile = async () => {
    const publicUsername =
      profileUsername || 'user';

    const profileUrl = `${window.location.origin}/profile/${publicUsername}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: displayName,
          text: `View ${displayName}'s Aarush profile.`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        showToast('Profile link copied.');
      }
    } catch {
      showToast('Profile sharing cancelled.');
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <TopBar pageTitle="Profile" />

        <main style={styles.loadingState}>
          <div style={styles.loadingAvatar} />
          <div style={styles.loadingLineLarge} />
          <div style={styles.loadingLineSmall} />
          <div style={styles.loadingCard} />
        </main>

        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <TopBar pageTitle="Profile" />

        <main style={styles.errorState}>
          <ShieldCheck size={32} color="#ff9fba" />
          <h1>Unable to load profile</h1>
          <p>{error}</p>

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
      <TopBar
        profileMode
        pageTitle={displayName}
        username={`@${profileUsername}`}
      />

      <main style={styles.content}>
        {guest ? (
          <div style={styles.guestNotice}>
            <UserRound size={17} />
            <span>
              Guest Mode · Sign in to access your real profile.
            </span>
          </div>
        ) : null}

        <section style={styles.profileCard}>
          <div style={styles.profileTop}>
            <div style={styles.avatarWrapper}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`${displayName} avatar`}
                  style={styles.avatar}
                />
              ) : (
                <span style={styles.placeholderAvatar}>
                  <UserRound size={38} />
                </span>
              )}
            </div>

            <div style={styles.identity}>
              <div style={styles.usernameRow}>
                <strong>@{profileUsername}</strong>

                {profile?.verified ? (
                  <BadgeCheck
                    size={17}
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

            <button
              type="button"
              onClick={() => showToast('More actions coming soon.')}
              style={styles.moreButton}
              aria-label="More profile actions"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div style={styles.profileStatus}>
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

            {guest ? (
              <span style={styles.guestBadge}>
                Guest Mode
              </span>
            ) : null}
          </div>

          <div style={styles.statsGrid}>
            <ProfileStat
              label="Posts"
              value={postsCount}
              onClick={() => navigate('/home')}
            />

            <ProfileStat
              label="Followers"
              value={followersCount}
              onClick={() => openPeopleSheet('followers')}
            />

            <ProfileStat
              label="Following"
              value={followingCount}
              onClick={() => openPeopleSheet('following')}
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
                loading={relationshipLoading}
                disabled={guest}
                onClick={handleFollowToggle}
              />
            )}

            <button
              type="button"
              onClick={shareProfile}
              style={styles.secondaryAction}
            >
              <Share2 size={15} />
              Share
            </button>

            {!isOwnProfile && !guest ? (
              <button
                type="button"
                onClick={() =>
                  showToast('Message composer coming soon.')
                }
                style={styles.iconAction}
                aria-label="Message profile"
              >
                <MessageCircle size={16} />
              </button>
            ) : null}
          </div>

          {guest ? (
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={styles.signInButton}
            >
              Sign in to access your real profile
              <ChevronRight size={15} />
            </button>
          ) : null}
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>
              <ShieldCheck size={16} />
            </span>

            <div>
              <h2 style={styles.sectionTitle}>
                Profile Details
              </h2>

              <p style={styles.sectionDescription}>
                Information shared by this profile.
              </p>
            </div>
          </div>

          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span>Profession</span>
              <strong>
                {profile?.profession || 'Profession not set'}
              </strong>
            </div>

            <div style={styles.detailItem}>
              <span>Account type</span>
              <strong>
                {profile?.account_type || 'Personal'}
              </strong>
            </div>

            <div style={styles.detailItem}>
              <span>Website</span>
              <strong>
                {profile?.website || 'Add your website'}
              </strong>
            </div>

            <div style={styles.detailItem}>
              <span>Location</span>
              <strong>
                {profile?.location || 'Location not set'}
              </strong>
            </div>
          </div>
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

              <p style={styles.sectionDescription}>
                Manage this profile’s follower relationships.
              </p>
            </div>
          </div>

          <div style={styles.connectionButtons}>
            <button
              type="button"
              onClick={() => openPeopleSheet('followers')}
              style={styles.connectionButton}
            >
              <Users size={15} />
              View Followers
              <ChevronRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => openPeopleSheet('following')}
              style={styles.connectionButton}
            >
              <Users size={15} />
              View Following
              <ChevronRight size={15} />
            </button>
          </div>
        </section>
      </main>

      <BottomNav />

      {sheetType ? (
        <PeopleSheet
          type={sheetType}
          people={people}
          viewerId={user?.id}
          loading={peopleLoading}
          relationshipMap={peopleRelationshipMap}
          actionTarget={peopleActionTarget}
          onClose={() => setSheetType(null)}
          onFollow={handlePeopleFollow}
          onUnfollow={handlePeopleUnfollow}
        />
      ) : null}

      {toast ? (
        <div role="status" style={styles.toast}>
          {toast}

          <button
            type="button"
            onClick={() => setToast('')}
            style={styles.toastClose}
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '6.8rem',
    background:
      'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
    color: '#f4f7ff',
  },

  content: {
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '1rem 0.9rem',
    display: 'grid',
    gap: '0.9rem',
  },

  loadingState: {
    minHeight: '70vh',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.8rem',
  },

  loadingAvatar: {
    width: '6rem',
    height: '6rem',
    borderRadius: '999px',
    background: 'rgba(124,92,255,0.2)',
    animation:
      'aarush-profile-loading 1.4s ease-in-out infinite',
  },

  loadingLineLarge: {
    width: '13rem',
    height: '0.8rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.1)',
  },

  loadingLineSmall: {
    width: '8rem',
    height: '0.6rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
  },

  loadingCard: {
    width: 'min(100%, 32rem)',
    height: '12rem',
    borderRadius: '1.25rem',
    background: 'rgba(255,255,255,0.06)',
  },

  errorState: {
    minHeight: '70vh',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.7rem',
    padding: '1rem',
    textAlign: 'center',
  },

  guestNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 0.8rem',
    borderRadius: '0.85rem',
    background: 'rgba(255,210,125,0.08)',
    border: '1px solid rgba(255,210,125,0.2)',
    color: '#ffd27d',
    fontSize: '0.72rem',
    fontWeight: 750,
  },

  profileCard: {
    padding: '1rem',
    borderRadius: '1.35rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
  },

  profileTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },

  avatarWrapper: {
    flexShrink: 0,
  },

  avatar: {
    width: '6.4rem',
    height: '6.4rem',
    objectFit: 'cover',
    borderRadius: '999px',
    border: '3px solid #7c5cff',
    boxShadow: '0 0 28px rgba(124,92,255,0.28)',
  },

  placeholderAvatar: {
    width: '6.4rem',
    height: '6.4rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    border: '3px solid #7c5cff',
    background:
      'linear-gradient(135deg, #18213a, #2b2048)',
    color: '#dce8ff',
    boxShadow: '0 0 28px rgba(124,92,255,0.28)',
  },

  identity: {
    minWidth: 0,
    flex: 1,
  },

  usernameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
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
    background: 'rgba(77,215,255,0.1)',
    color: '#9deeff',
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

  moreButton: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.04)',
    color: '#cbd6ec',
    cursor: 'pointer',
  },

  profileStatus: {
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
    background: 'rgba(130,233,193,0.12)',
    color: '#82e9c1',
  },

  privateBadge: {
    background: 'rgba(255,210,125,0.12)',
    color: '#ffd27d',
  },

  guestBadge: {
    padding: '0.3rem 0.45rem',
    borderRadius: '999px',
    background: 'rgba(124,92,255,0.14)',
    color: '#c8bcff',
    fontSize: '0.6rem',
    fontWeight: 800,
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '0.4rem',
    marginTop: '1rem',
    paddingTop: '0.9rem',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },

  statButton: {
    display: 'grid',
    gap: '0.2rem',
    padding: '0.2rem',
    border: 0,
    background: 'transparent',
    color: '#f4f7ff',
    textAlign: 'center',
    cursor: 'pointer',
  },

  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.9rem',
  },

  primaryAction: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    flex: '1 1 10rem',
    border: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
    fontSize: '0.76rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  followButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    flex: '1 1 10rem',
    border: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
    fontSize: '0.76rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  followingButton: {
    border: '1px solid rgba(130,233,193,0.28)',
    background: 'rgba(130,233,193,0.1)',
    color: '#82e9c1',
  },

  secondaryAction: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    flex: '1 1 7rem',
    border: '1px solid rgba(124,92,255,0.28)',
    borderRadius: '999px',
    background: 'rgba(124,92,255,0.1)',
    color: '#eaf0ff',
    fontSize: '0.76rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  iconAction: {
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.05)',
    color: '#eaf0ff',
    cursor: 'pointer',
  },

  disabledButton: {
    opacity: 0.55,
    cursor: 'not-allowed',
  },

  signInButton: {
    width: '100%',
    minHeight: '2.6rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    marginTop: '0.65rem',
    border: '1px solid rgba(255,210,125,0.24)',
    borderRadius: '999px',
    background: 'rgba(255,210,125,0.08)',
    color: '#ffd27d',
    fontSize: '0.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  section: {
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    marginBottom: '0.8rem',
  },

  sectionIcon: {
    width: '2.15rem',
    height: '2.15rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))',
    color: '#dce8ff',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '0.92rem',
    fontWeight: 850,
  },

  sectionDescription: {
    margin: '0.2rem 0 0',
    color: '#96a3bf',
    fontSize: '0.7rem',
  },

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.5rem',
  },

  detailItem: {
    display: 'grid',
    gap: '0.3rem',
    minHeight: '3.2rem',
    padding: '0.7rem',
    borderRadius: '0.8rem',
    background: 'rgba(255,255,255,0.04)',
  },

  detailItemSpan: {
    color: '#96a3bf',
    fontSize: '0.64rem',
  },

  detailItemStrong: {
    color: '#dce5f8',
    fontSize: '0.7rem',
  },

  connectionButtons: {
    display: 'grid',
    gap: '0.45rem',
  },

  connectionButton: {
    minHeight: '2.65rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0 0.7rem',
    border: '1px solid rgba(124,92,255,0.22)',
    borderRadius: '0.8rem',
    background: 'rgba(124,92,255,0.08)',
    color: '#dce5f8',
    fontSize: '0.7rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  connectionButtonChevron: {
    marginLeft: 'auto',
  },

  sheetBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0.8rem',
    background: 'rgba(2,5,10,0.68)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  sheet: {
    width: 'min(100%, 540px)',
    maxHeight: '82vh',
    overflowY: 'auto',
    padding: '0.9rem',
    borderRadius: '1.35rem 1.35rem 1rem 1rem',
    background:
      'linear-gradient(180deg, rgba(20,26,42,0.99), rgba(9,13,22,0.99))',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 -20px 70px rgba(0,0,0,0.45)',
  },

  sheetHandle: {
    width: '2.8rem',
    height: '0.25rem',
    margin: '0 auto 0.8rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.2)',
  },

  sheetHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.6rem',
    marginBottom: '0.8rem',
  },

  sheetHeaderH2: {
    margin: 0,
    fontSize: '1rem',
  },

  sheetHeaderP: {
    margin: '0.25rem 0 0',
    color: '#96a3bf',
    fontSize: '0.7rem',
  },

  closeButton: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    cursor: 'pointer',
  },

  peopleList: {
    display: 'grid',
    gap: '0.45rem',
  },

  personRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.65rem',
    borderRadius: '0.9rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
  },

  personAvatar: {
    width: '2.6rem',
    height: '2.6rem',
    objectFit: 'cover',
    borderRadius: '999px',
    border: '1px solid rgba(124,92,255,0.5)',
  },

  personPlaceholder: {
    width: '2.6rem',
    height: '2.6rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    background: '#222b43',
    color: '#cbd6ec',
  },

  personCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.15rem',
    flex: 1,
  },

  personCopyStrong: {
    overflow: 'hidden',
    color: '#eaf0ff',
    fontSize: '0.72rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  personCopySpan: {
    color: '#8f9cb8',
    fontSize: '0.64rem',
  },

  personAction: {
    minWidth: '4.9rem',
    minHeight: '2.1rem',
    border: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
    fontSize: '0.63rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  personFollowingAction: {
    border: '1px solid rgba(130,233,193,0.25)',
    background: 'rgba(130,233,193,0.1)',
    color: '#82e9c1',
  },

  sheetLoading: {
    padding: '2rem 0',
    color: '#9deeff',
    textAlign: 'center',
    fontSize: '0.74rem',
  },

  emptyPeople: {
    display: 'grid',
    placeItems: 'center',
    gap: '0.5rem',
    padding: '2rem 0',
    color: '#96a3bf',
    fontSize: '0.74rem',
  },

  toast: {
    position: 'fixed',
    right: '1rem',
    bottom: '6.2rem',
    left: '1rem',
    zIndex: 1400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    width: 'fit-content',
    maxWidth: 'calc(100% - 2rem)',
    margin: '0 auto',
    padding: '0.75rem 0.9rem',
    borderRadius: '999px',
    background: 'rgba(17,22,35,0.97)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#eaf0ff',
    fontSize: '0.72rem',
    fontWeight: 750,
  },

  toastClose: {
    width: '1.6rem',
    height: '1.6rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    color: '#aab6cf',
    cursor: 'pointer',
  },
};