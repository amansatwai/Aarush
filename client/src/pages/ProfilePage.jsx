// src/pages/ProfilePage.jsx
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
  Edit3,
  Eye,
  EyeOff,
  Link2,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  Share2,
  ShieldCheck,
  UserPlus,
  UserRound,
  X,
  Video,
  Clock3,
  Camera,
} from 'lucide-react';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import {
  acceptFollowRequest,
  followUser,
  getFollowerCount,
  getFollowingCount,
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

const HIGHLIGHTS = [
  { id: 'new', label: 'New', color: '#7c5cff' },
  { id: 'travel', label: 'Travel', color: '#4dd7ff' },
  { id: 'friends', label: 'Friends', color: '#ff4fd8' },
  { id: 'work', label: 'Work', color: '#82e9c1' },
  { id: 'add', label: 'Add', color: '#8d99b2' },
];

function isBrowser() {
  return typeof window !== 'undefined';
}

function isGuestMode() {
  if (!isBrowser()) return false;

  try {
    return (
      window.localStorage.getItem(GUEST_KEYS.isGuest) === 'true' &&
      window.localStorage.getItem(GUEST_KEYS.session) !== null
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
    reels_count: 0,
    tagged_count: 0,
  };

  if (!isBrowser()) return fallback;

  try {
    return {
      ...fallback,
      ...JSON.parse(
        window.localStorage.getItem(GUEST_KEYS.profile) || '{}'
      ),
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
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: '999px',
          border: '3px solid #7c5cff',
          boxShadow: '0 0 24px rgba(124,92,255,0.28)',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '999px',
        border: '3px solid #7c5cff',
        color: '#dce8ff',
        background:
          'linear-gradient(135deg,#18213a,#2b2048)',
      }}
    >
      <UserRound size={32} />
    </div>
  );
}

function Stat({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'grid',
        gap: '.18rem',
        padding: '.25rem',
        border: 0,
        background: 'transparent',
        color: '#f4f7ff',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <strong>{formatCount(value)}</strong>
      <span>{label}</span>
    </button>
  );
}

function FollowActions({
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
      <div style={{ display: 'flex', gap: '.4rem', flex: '1 1 15rem' }}>
        <button
          type="button"
          disabled={loading}
          onClick={onAccept}
          style={buttonStyles.primary}
        >
          <Check size={15} />
          Accept
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onReject}
          style={buttonStyles.secondary}
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
        style={buttonStyles.primary}
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
        style={buttonStyles.following}
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
        style={buttonStyles.requested}
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
      style={buttonStyles.primary}
    >
      <UserPlus size={15} />
      {relationship?.followBack ? 'Follow back' : 'Follow'}
    </button>
  );
}

const buttonStyles = {
  primary: {
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
    fontSize: '.72rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  secondary: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    flex: '1 1 8rem',
    padding: '0 .8rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '999px',
    color: '#eaf0ff',
    background: 'rgba(124,92,255,.1)',
    fontSize: '.72rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  following: {
    minHeight: '2.65rem',
    flex: '1 1 9rem',
    border: '1px solid rgba(130,233,193,.25)',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    cursor: 'pointer',
  },

  requested: {
    minHeight: '2.65rem',
    flex: '1 1 9rem',
    border: '1px solid rgba(255,210,125,.25)',
    borderRadius: '999px',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.08)',
    cursor: 'pointer',
  },
};

// PART 1 END — Continue with Part 2// PART 2 START

export default function ProfilePage() {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams();
  const mountedRef = useRef(true);
  const noticeTimerRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);
  const [relationship, setRelationship] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [reelsCount, setReelsCount] = useState(0);
  const [taggedCount, setTaggedCount] = useState(0);

  const [activeTab, setActiveTab] = useState("Posts");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const profileUsername = useMemo(
    () => normalizeUsername(profile?.username),
    [profile?.username]
  );

  const displayName = profile?.full_name || "Aarush User";

  const ownProfile = Boolean(
    user?.id && profile?.id && user.id === profile.id
  );

  const showNotice = useCallback((message) => {
    if (!mountedRef.current) return;

    setNotice(message);

    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = window.setTimeout(() => {
      if (mountedRef.current) setNotice("");
    }, 2600);
  }, []);

  const loadCounts = useCallback(async (profileId) => {
    if (!profileId || profileId === "guest") return;

    const [followers, following] = await Promise.all([
      getFollowerCount(profileId),
      getFollowingCount(profileId),
    ]);

    if (!mountedRef.current) return;

    setFollowersCount(Number(followers) || 0);
    setFollowingCount(Number(following) || 0);

    // Demo values until real tables are connected
    setPostsCount(12);
    setReelsCount(8);
    setTaggedCount(3);
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (isGuestMode()) {
        const guestData = getGuestProfile();

        setGuest(true);
        setUser(null);
        setProfile(guestData);
        setRelationship(null);
        setIncomingRequest(null);

        setFollowersCount(Number(guestData.followers_count) || 0);
        setFollowingCount(Number(guestData.following_count) || 0);
        setPostsCount(Number(guestData.posts_count) || 0);
        setReelsCount(Number(guestData.reels_count) || 0);
        setTaggedCount(Number(guestData.tagged_count) || 0);

        return;
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }

      let query = supabase
        .from("profiles")
        .select(PROFILE_FIELDS);

      query = routeUsername
        ? query.eq("username", normalizeUsername(routeUsername))
        : query.eq("id", currentUser.id);

      const { data: profileRow, error: profileError } =
        await query.maybeSingle();

      if (profileError) throw profileError;
      if (!profileRow) throw new Error("Profile not found.");

      const nextRelationship = await getRelationship(
        currentUser.id,
        profileRow.id
      );

      if (!mountedRef.current) return;

      setGuest(false);
      setUser(currentUser);
      setProfile(profileRow);
      setRelationship(nextRelationship || null);

      await loadCounts(profileRow.id);
    } catch (err) {
      if (mountedRef.current) {
        setError(err?.message || "Unable to load profile.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
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
    if (guest || !user?.id || !profile?.id) {
      return undefined;
    }

    let active = true;

    const cleanup = subscribeToFollowChanges(async () => {
      if (!active || !profile?.id) return;

      try {
        await loadCounts(profile.id);

        const nextRelationship = await getRelationship(
          user.id,
          profile.id
        );

        if (active) {
          setRelationship(nextRelationship || null);
        }
      } catch {
        // best effort
      }
    });

    return () => {
      active = false;

      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [guest, loadCounts, profile?.id, user?.id]);

  const handleFollow = useCallback(async () => {
    if (guest) {
      showNotice("Sign in to follow this profile.");
      return;
    }

    if (!profile || ownProfile) return;

    setActionLoading(true);

    try {
      const result = await followUser(profile.id);

      const status = result?.status;

      setRelationship((current) => ({
        ...(current || {}),
        following: status === "accepted",
        requested: status === "pending",
        state: status,
      }));

      if (status === "accepted") {
        setFollowersCount((v) => v + 1);
      }

      showNotice(
        status === "pending"
          ? "Follow request sent."
          : "Profile followed."
      );
    } catch (err) {
      showNotice(err?.message || "Unable to follow profile.");
    } finally {
      setActionLoading(false);
    }
  }, [guest, ownProfile, profile, showNotice]);

  const handleUnfollow = useCallback(async () => {
    if (guest || !profile) return;

    const wasFollowing = Boolean(relationship?.following);

    setActionLoading(true);

    try {
      await unfollowUser(profile.id);

      setRelationship((current) => ({
        ...(current || {}),
        following: false,
        requested: false,
        state: "not_following",
      }));

      if (wasFollowing) {
        setFollowersCount((v) => Math.max(0, v - 1));
      }

      showNotice("Follow removed.");
    } catch (err) {
      showNotice(err?.message || "Unable to update follow.");
    } finally {
      setActionLoading(false);
    }
  }, [guest, profile, relationship?.following, showNotice]);

  const handleShare = useCallback(async () => {
    if (!isBrowser() || !profileUsername) return;

    const url = `${window.location.origin}/profile/${profileUsername}`;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: displayName,
          text: `View ${displayName}'s Aarush profile.`,
          url,
        });

        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showNotice("Profile link copied.");
        return;
      }

      showNotice(url);
    } catch {
      showNotice("Profile sharing cancelled.");
    }
  }, [displayName, profileUsername, showNotice]);

  const handleContact = useCallback(() => {
    if (guest) {
      showNotice("Sign in to contact this profile.");
      return;
    }

    if (!profile?.id) return;

    navigate(`/chat/${profile.id}`);
  }, [guest, navigate, profile?.id, showNotice]);

  const topBar = (
    <TopBar
      profileMode
      username={`@${profileUsername || "username"}`}
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
          <p>{error || "Profile unavailable."}</p>

          <button
            type="button"
            onClick={loadProfile}
            style={buttonStyles.primary}
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
          <div style={styles.guestNotice}>
            <UserRound size={15} />
            Guest Mode · Sign in to use protected actions.
          </div>
        ) : null}

        {notice ? (
          <div role="status" style={styles.notice}>
            {notice}
          </div>
        ) : null}

        {/* Continue in Part 3 */}// PART 3 START

        <section style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <Avatar profile={profile} />

            <div style={styles.identity}>
              <div style={styles.usernameRow}>
                <strong>
                  @{profileUsername || "user"}
                </strong>

                {profile.verified ? (
                  <BadgeCheck
                    size={16}
                    color="#72e3ff"
                  />
                ) : null}
              </div>

              <strong style={styles.displayName}>
                {displayName}
              </strong>

              <span style={styles.accountType}>
                {profile.account_type || "Personal"}
              </span>
            </div>
          </div>

          <p style={styles.bio}>
            {profile.bio || "No bio yet."}
          </p>

          <div style={styles.meta}>
            {profile.website ? (
              <span>
                <Link2 size={13} />
                {profile.website}
              </span>
            ) : null}

            {profile.location ? (
              <span>
                <MapPin size={13} />
                {profile.location}
              </span>
            ) : null}
          </div>

          <div
            style={{
              ...styles.visibility,
              ...(profile.is_private
                ? styles.privateVisibility
                : styles.publicVisibility),
            }}
          >
            {profile.is_private ? (
              <EyeOff size={13} />
            ) : (
              <Eye size={13} />
            )}

            {profile.is_private
              ? "Private profile"
              : "Public profile"}
          </div>

          {/* Instagram-style stats row */}
          <div style={styles.stats}>
            <Stat label="Posts" value={postsCount} />

            <Stat
              label="Followers"
              value={followersCount}
              onClick={() =>
                navigate(`/followers/${profile.id}`)
              }
            />

            <Stat
              label="Following"
              value={followingCount}
              onClick={() =>
                navigate(`/following/${profile.id}`)
              }
            />

            <Stat
              label="Reels"
              value={reelsCount}
              onClick={() =>
                navigate(
                  `/profile/${profileUsername}/reels`
                )
              }
            />

            <Stat
              label="Tags"
              value={taggedCount}
              onClick={() =>
                navigate(
                  `/profile/${profileUsername}/tagged`
                )
              }
            />
          </div>

          {/* Profile actions */}
          <div style={styles.actions}>
            {ownProfile ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    navigate("/profile-settings")
                  }
                  style={buttonStyles.primary}
                >
                  <Edit3 size={15} />
                  Edit Profile
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  style={buttonStyles.secondary}
                >
                  <Share2 size={15} />
                  Share Profile
                </button>

                <button
                  type="button"
                  onClick={() =>
                    showNotice(
                      "Contact options opened."
                    )
                  }
                  style={buttonStyles.secondary}
                >
                  <MessageCircle size={15} />
                  Contact
                </button>

                <button
                  type="button"
                  onClick={() =>
                    showNotice("Add Link opened.")}
                  style={buttonStyles.secondary}
                >
                  <Link2 size={15} />
                  Add Link
                </button>

                {!profile.bio ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/profile-settings")
                    }
                    style={buttonStyles.secondary}
                  >
                    Add Bio
                  </button>
                ) : null}
              </>
            ) : (
              <>
                <FollowActions
                  ownProfile={ownProfile}
                  guest={guest}
                  relationship={relationship}
                  request={incomingRequest}
                  loading={actionLoading}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                  onAccept={() => {}}
                  onReject={() => {}}
                  onLogin={() => navigate("/login")}
                />

                <button
                  type="button"
                  onClick={handleContact}
                  style={buttonStyles.secondary}
                >
                  <MessageCircle size={15} />
                  Message
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  style={styles.iconAction}
                >
                  <Share2 size={16} />
                </button>
              </>
            )}
          </div>
        </section>

        {/* Instagram-style Highlights strip */}
        <section style={styles.highlightsSection}>
          <div style={styles.sectionHeading}>
            <strong>Highlights</strong>
            <span>Moments worth keeping</span>
          </div>

          <div style={styles.highlightScroller}>
            {HIGHLIGHTS.map((highlight) => (
              <button
                type="button"
                key={highlight.id}
                onClick={() =>
                  showNotice(
                    highlight.id === "add"
                      ? "Add Highlight opened."
                      : `${highlight.label} opened.`
                  )
                }
                style={styles.highlightButton}
              >
                <span
                  style={{
                    ...styles.highlightCircle,
                    borderColor: highlight.color,
                    color: highlight.color,
                  }}
                >
                  {highlight.id === "add" ? (
                    <Plus size={20} />
                  ) : (
                    <Eye size={18} />
                  )}
                </span>

                <span style={styles.highlightLabel}>
                  {highlight.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Continue in Part 4 */}// PART 4 START

        {/* Instagram-style content tabs */}
        <section style={styles.tabsSection}>
          <div style={styles.tabs}>
            {[
              "Posts",
              "Reels",
              "Tagged",
            ].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab
                    ? styles.activeTab
                    : {}),
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={styles.tabContent}>
            <EmptyTab tab={activeTab} />
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function EmptyTab({ tab }) {
  return (
    <div style={styles.emptyTab}>
      <div style={styles.emptyIcon}>
        {tab === "Posts" ? (
          <Edit3 size={23} />
        ) : (
          <UserRound size={23} />
        )}
      </div>

      <strong>
        {tab === "Posts"
          ? "No posts yet"
          : `No ${tab.toLowerCase()} yet`}
      </strong>

      <span>
        Content from this profile will appear here.
      </span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    paddingBottom: "6.8rem",
    color: "#f4f7ff",
    background:
      "radial-gradient(circle at top, rgba(34,43,68,.45), #07090e 65%)",
  },

  content: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    padding: ".9rem",
    display: "grid",
    gap: ".85rem",
  },

  profileCard: {
    padding: "1rem",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "1.35rem",
    background: "rgba(15,19,30,.92)",
    boxShadow: "0 20px 60px rgba(0,0,0,.28)",
  },

  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  identity: {
    display: "grid",
    gap: ".28rem",
  },

  usernameRow: {
    display: "flex",
    alignItems: "center",
    gap: ".3rem",
    color: "#f5f8ff",
    fontSize: "1rem",
  },

  displayName: {
    color: "#cbd6ec",
    fontSize: ".82rem",
  },

  accountType: {
    width: "fit-content",
    padding: ".2rem .4rem",
    borderRadius: "999px",
    color: "#9deeff",
    background: "rgba(77,215,255,.1)",
    fontSize: ".58rem",
    fontWeight: 800,
  },

  bio: {
    margin: "1rem 0 .4rem",
    color: "#d5def1",
    fontSize: ".78rem",
    lineHeight: 1.5,
  },

  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: ".5rem",
    color: "#91a0bc",
    fontSize: ".66rem",
  },

  visibility: {
    width: "fit-content",
    display: "inline-flex",
    alignItems: "center",
    gap: ".3rem",
    marginTop: ".75rem",
    padding: ".3rem .5rem",
    borderRadius: "999px",
    fontSize: ".62rem",
    fontWeight: 800,
  },

  publicVisibility: {
    color: "#82e9c1",
    background: "rgba(130,233,193,.1)",
  },

  privateVisibility: {
    color: "#ffd27d",
    background: "rgba(255,210,125,.1)",
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(0,1fr))",
    gap: ".25rem",
    marginTop: "1rem",
    padding: ".85rem 0",
    borderTop: "1px solid rgba(255,255,255,.07)",
    borderBottom:
      "1px solid rgba(255,255,255,.07)",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: ".45rem",
    marginTop: ".9rem",
  },

  highlightsSection: {
    padding: "1rem",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "1.25rem",
    background: "rgba(15,19,30,.9)",
  },

  sectionHeading: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: ".5rem",
    marginBottom: ".8rem",
  },

  highlightScroller: {
    display: "flex",
    gap: ".8rem",
    overflowX: "auto",
    padding: ".2rem 0 .35rem",
  },

  highlightButton: {
    minWidth: "4.25rem",
    display: "grid",
    justifyItems: "center",
    gap: ".35rem",
    border: 0,
    background: "transparent",
    color: "#dce5f8",
    cursor: "pointer",
  },

  highlightCircle: {
    width: "3.35rem",
    height: "3.35rem",
    display: "grid",
    placeItems: "center",
    border: "2px solid",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(124,92,255,.18), rgba(77,215,255,.08))",
  },

  highlightLabel: {
    color: "#b6c2da",
    fontSize: ".62rem",
    textAlign: "center",
  },

  tabsSection: {
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "1.25rem",
    background: "rgba(15,19,30,.9)",
  },

  tabs: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    borderBottom:
      "1px solid rgba(255,255,255,.08)",
  },

  tab: {
    minHeight: "2.85rem",
    border: 0,
    borderBottom: "2px solid transparent",
    color: "#8491ad",
    background: "transparent",
    fontWeight: 800,
    cursor: "pointer",
  },

  activeTab: {
    borderBottomColor: "#7c5cff",
    color: "#fff",
  },

  tabContent: {
    minHeight: "15rem",
  },

  emptyTab: {
    minHeight: "15rem",
    display: "grid",
    placeItems: "center",
    gap: ".45rem",
    color: "#8491ad",
    textAlign: "center",
  },

  emptyIcon: {
    width: "3rem",
    height: "3rem",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(124,92,255,.24)",
    borderRadius: "1rem",
    color: "#a895ff",
  },

  guestNotice: {
    padding: ".7rem",
    border: "1px solid rgba(255,210,125,.2)",
    borderRadius: ".8rem",
    color: "#ffd27d",
    background: "rgba(255,210,125,.08)",
  },

  notice: {
    padding: ".7rem",
    border: "1px solid rgba(77,215,255,.18)",
    borderRadius: ".8rem",
    color: "#b8f4ff",
    background: "rgba(77,215,255,.07)",
  },

  center: {
    minHeight: "60vh",
    display: "grid",
    placeItems: "center",
    gap: ".5rem",
    color: "#9deeff",
    textAlign: "center",
  },

  iconAction: {
    width: "2.65rem",
    height: "2.65rem",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: "999px",
    color: "#eaf0ff",
    background: "rgba(255,255,255,.05)",
  },
};

// PART 4 END// PART 5 START

function ProfileMenuDrawer({
  open,
  onClose,
  navigate,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const items = [
    { label: "Edit Profile", path: "/profile-settings" },
    { label: "Share Profile", path: "/profile/share" },
    { label: "QR Code", path: "/profile/qr" },
    { label: "Security Center", path: "/security-center" },
    { label: "Privacy Dashboard", path: "/privacy-dashboard" },
    { label: "Social Privacy Settings", path: "/social-privacy" },
    { label: "Close Friends", path: "/close-friends" },
    { label: "Blocked Users", path: "/blocked-users" },
    { label: "Follow Requests", path: "/follow-requests" },
    { label: "Account Switch", path: "/account-switch" },
    { label: "Logout Sessions", path: "/logout-sessions" },
    { label: "App Lock", path: "/app-lock" },
    { label: "Settings", path: "/settings" },
    { label: "Help & Support", path: "/help" },
    { label: "About Aarush", path: "/about" },
  ];

  return (
    <div style={drawerStyles.overlay} onClick={onClose}>
      <aside
        style={drawerStyles.drawer}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={drawerStyles.header}>
          <strong>Profile Menu</strong>

          <button
            type="button"
            onClick={onClose}
            style={drawerStyles.closeButton}
          >
            <X size={18} />
          </button>
        </div>

        <div style={drawerStyles.list}>
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              style={drawerStyles.item}
              onClick={() => {
                onClose();
                navigate(item.path);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

const drawerStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(0,0,0,.45)",
    display: "flex",
    justifyContent: "flex-end",
  },

  drawer: {
    width: "min(24rem, 88vw)",
    height: "100%",
    background: "#0f1320",
    borderLeft: "1px solid rgba(255,255,255,.08)",
    boxShadow: "-10px 0 30px rgba(0,0,0,.35)",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    padding: "1rem",
    borderBottom: "1px solid rgba(255,255,255,.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#f4f7ff",
  },

  closeButton: {
    width: "2.25rem",
    height: "2.25rem",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "999px",
    color: "#eaf0ff",
    background: "rgba(255,255,255,.04)",
    cursor: "pointer",
  },

  list: {
    padding: ".75rem",
    display: "grid",
    gap: ".4rem",
    overflowY: "auto",
  },

  item: {
    padding: ".85rem .9rem",
    border: "1px solid rgba(255,255,255,.06)",
    borderRadius: ".9rem",
    color: "#eaf0ff",
    background: "rgba(255,255,255,.03)",
    textAlign: "left",
    cursor: "pointer",
  },
};

// PART 5 END