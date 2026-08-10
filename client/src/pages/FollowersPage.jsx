import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  CloudOff,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import {
  getFollowers,
  getRelationship,
  followUser,
  subscribeToFollowChanges,
  unfollowUser,
} from '../utils/followEngine';

const PAGE_SIZE = 30;

function isGuestMode() {
  return (
    localStorage.getItem('aarush_is_guest') === 'true' &&
    localStorage.getItem('aarush_guest_session') !== null
  );
}

function ProfileAvatar({ person }) {
  return person.avatar_url ? (
    <img
      src={person.avatar_url}
      alt=""
      style={styles.avatar}
    />
  ) : (
    <span style={styles.placeholderAvatar}>
      <UserRound size={20} />
    </span>
  );
}

function PersonCard({
  person,
  viewerId,
  relationship,
  loading,
  onOpen,
  onFollow,
  onUnfollow,
  onSignIn,
}) {
  const isFollowing = relationship?.following;
  const isRequested = relationship?.requested;

  return (
    <article style={styles.personCard}>
      <button
        type="button"
        onClick={() => onOpen(person)}
        style={styles.personMain}
      >
        <ProfileAvatar person={person} />

        <span style={styles.personCopy}>
          <strong>{person.full_name || 'Aarush User'}</strong>
          <span>
            @{person.username || 'user'}
          </span>
          {person.profession ? (
            <small>{person.profession}</small>
          ) : null}
        </span>
      </button>

      {viewerId === person.id ? (
        <span style={styles.youBadge}>You</span>
      ) : isFollowing ? (
        <button
          type="button"
          onClick={() => onUnfollow(person.id)}
          disabled={loading}
          style={styles.followingButton}
        >
          <Check size={13} />
          Following
        </button>
      ) : isRequested ? (
        <button
          type="button"
          onClick={() => onUnfollow(person.id)}
          disabled={loading}
          style={styles.requestedButton}
        >
          Requested
        </button>
      ) : (
        <button
          type="button"
          onClick={() =>
            isGuestMode()
              ? onSignIn()
              : onFollow(person.id)
          }
          disabled={loading}
          style={styles.followButton}
        >
          Follow back
        </button>
      )}
    </article>
  );
}

function Skeleton() {
  return (
    <div style={styles.personCard}>
      <span style={styles.skeletonAvatar} />
      <span style={styles.skeletonCopy}>
        <span style={styles.skeletonLine} />
        <span style={styles.skeletonSmallLine} />
      </span>
    </div>
  );
}

export default function FollowersPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [people, setPeople] = useState([]);
  const [relationships, setRelationships] =
    useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] =
    useState(false);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUser(user || null);
    return user || null;
  }, []);

  const loadPage = useCallback(
    async (pageNumber = 0, replace = false) => {
      if (loadingRef.current) {
        return;
      }

      if (!replace && !hasMore) {
        return;
      }

      loadingRef.current = true;
      setError('');
      replace ? setLoading(true) : setLoadingMore(true);

      try {
        const user = await loadUser();
        const targetId = userId || user?.id;

        if (!targetId) {
          throw new Error('Profile not found.');
        }

        const result = await getFollowers(targetId, {
          page: pageNumber,
          pageSize: PAGE_SIZE,
        });

        setPeople((current) => {
          const values = replace
            ? result
            : [...current, ...result];

          return [
            ...new Map(
              values.map((person) => [person.id, person])
            ).values(),
          ];
        });

        setPage(pageNumber);
        setHasMore(result.length === PAGE_SIZE);

        const entries = await Promise.all(
          result.map(async (person) => [
            person.id,
            await getRelationship(user?.id, person.id),
          ])
        );

        setRelationships((current) => ({
          ...current,
          ...Object.fromEntries(entries),
        }));
      } catch (loadError) {
        setError(
          loadError.message || 'Unable to load followers.'
        );
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [hasMore, loadUser, userId]
  );

  useEffect(() => {
    loadPage(0, true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current) {
          loadPage(page + 1);
        }
      },
      { rootMargin: '500px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [loadPage, page]);

  useEffect(() => {
    const cleanup = subscribeToFollowChanges(() => {
      loadPage(0, true);
    });

    return cleanup;
  }, [loadPage]);

  const visiblePeople = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return people;
    }

    return people.filter((person) =>
      [
        person.username,
        person.full_name,
        person.profession,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [people, search]);

  const changeFollow = async (personId, following) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setActionId(personId);

    setRelationships((current) => ({
      ...current,
      [personId]: {
        ...current[personId],
        following: !following,
        requested: false,
      },
    }));

    try {
      if (following) {
        await unfollowUser(personId);
      } else {
        await followUser(personId);
      }
    } catch (actionError) {
      setRelationships((current) => ({
        ...current,
        [personId]: {
          ...current[personId],
          following,
        },
      }));
      setError(actionError.message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div style={styles.page}>
      <TopBar pageTitle="Followers" showBackButton />

      <main style={styles.content}>
        <section style={styles.hero}>
          <Users size={24} />
          <div>
            <h1>Followers</h1>
            <p>People connected to this profile.</p>
          </div>
        </section>

        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search followers"
            style={styles.input}
          />
        </div>

        {error ? (
          <section style={styles.error}>
            <CloudOff size={25} />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => loadPage(0, true)}
              style={styles.primaryButton}
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </section>
        ) : loading ? (
          <div style={styles.list}>
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : !visiblePeople.length ? (
          <section style={styles.empty}>
            <Users size={28} />
            <h2>No followers yet</h2>
            <p>This profile does not have visible followers.</p>
          </section>
        ) : (
          <div style={styles.list}>
            {visiblePeople.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                viewerId={currentUser?.id}
                relationship={relationships[person.id]}
                loading={actionId === person.id}
                onOpen={(profile) =>
                  navigate(`/profile/${profile.username}`)
                }
                onFollow={(id) => changeFollow(id, false)}
                onUnfollow={(id) => changeFollow(id, true)}
                onSignIn={() => navigate('/login')}
              />
            ))}
          </div>
        )}

        {loadingMore ? (
          <div style={styles.loadingMore}>
            Loading more followers…
          </div>
        ) : null}

        <div ref={sentinelRef} style={styles.sentinel} />
      </main>

      <BottomNav />
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '6.5rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top, rgba(34,43,68,.45), #07090e 65%)',
  },
  content: {
    width: '100%',
    maxWidth: '720px',
    margin: '0 auto',
    padding: '0.9rem',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '1rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.2rem',
    background: 'rgba(15,19,30,.9)',
  },
  heroH1: {
    margin: 0,
    fontSize: '1rem',
  },
  heroP: {
    margin: '0.2rem 0 0',
    color: '#96a3bf',
    fontSize: '0.68rem',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    margin: '0.8rem 0',
    padding: '0.75rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '0.9rem',
    background: 'rgba(255,255,255,.05)',
    color: '#91a0ba',
  },
  input: {
    width: '100%',
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '0.74rem',
  },
  list: {
    display: 'grid',
    gap: '0.5rem',
  },
  personCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.7rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '1rem',
    background: 'rgba(15,19,30,.9)',
  },
  personMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    minWidth: 0,
    flex: 1,
    border: 0,
    color: '#fff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },
  avatar: {
    width: '2.8rem',
    height: '2.8rem',
    objectFit: 'cover',
    borderRadius: '999px',
    border: '2px solid rgba(124,92,255,.5)',
  },
  placeholderAvatar: {
    width: '2.8rem',
    height: '2.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#dce5f8',
    background: '#222b43',
  },
  personCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.16rem',
  },
  personCopyStrong: {
    overflow: 'hidden',
    fontSize: '0.74rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  personCopySpan: {
    color: '#96a3bf',
    fontSize: '0.63rem',
  },
  personCopySmall: {
    color: '#8290ad',
    fontSize: '0.6rem',
  },
  followButton: {
    minHeight: '2.1rem',
    padding: '0 0.65rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background: 'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '0.61rem',
    fontWeight: 800,
    cursor: 'pointer',
  },
  followingButton: {
    minHeight: '2.1rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0 0.55rem',
    border: '1px solid rgba(130,233,193,.25)',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },
  requestedButton: {
    minHeight: '2.1rem',
    padding: '0 0.55rem',
    border: '1px solid rgba(255,210,125,.24)',
    borderRadius: '999px',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.08)',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },
  youBadge: {
    color: '#9deeff',
    fontSize: '0.62rem',
    fontWeight: 800,
  },
  skeletonAvatar: {
    width: '2.8rem',
    height: '2.8rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.09)',
  },
  skeletonCopy: {
    display: 'grid',
    gap: '0.35rem',
    flex: 1,
  },
  skeletonLine: {
    width: '8rem',
    height: '0.6rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.1)',
  },
  skeletonSmallLine: {
    width: '5rem',
    height: '0.45rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.07)',
  },
  error: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.5rem',
    padding: '2rem 1rem',
    color: '#ffb1c8',
    textAlign: 'center',
  },
  empty: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.45rem',
    padding: '2.5rem 1rem',
    color: '#96a3bf',
    textAlign: 'center',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    minHeight: '2.4rem',
    padding: '0 0.75rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background: 'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '0.66rem',
    fontWeight: 800,
    cursor: 'pointer',
  },
  loadingMore: {
    padding: '1rem',
    color: '#9deeff',
    textAlign: 'center',
    fontSize: '0.68rem',
  },
  sentinel: {
    height: '1px',
  },
};