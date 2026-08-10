// src/pages/DiscoverPeople.jsx
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  CloudOff,
  RefreshCw,
  Search,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import {
  getRelationship,
  followUser,
  unfollowUser,
} from '../utils/followEngine';
import {
  getNewOnAarush,
  getSuggestedForYou,
  getTrendingCreators,
  searchDiscoverPeople,
  subscribeToDiscoverChanges,
} from '../utils/discoverEngine';

const PAGE_SIZE = 20;

function isGuestMode() {
  return (
    localStorage.getItem('aarush_is_guest') === 'true' &&
    localStorage.getItem('aarush_guest_session') !== null
  );
}

function Avatar({ person }) {
  return person.avatar_url ? (
    <img
      src={person.avatar_url}
      alt=""
      loading="lazy"
      style={styles.avatar}
    />
  ) : (
    <span style={styles.placeholderAvatar}>
      <UserRound size={20} />
    </span>
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

function PersonCard({
  person,
  relationship,
  actionId,
  onOpen,
  onFollow,
  onUnfollow,
  onSignIn,
}) {
  const following = relationship?.following;
  const requested = relationship?.requested;

  return (
    <article style={styles.personCard}>
      <button
        type="button"
        onClick={() => onOpen(person)}
        style={styles.personMain}
      >
        <Avatar person={person} />

        <span style={styles.personCopy}>
          <strong>
            {person.full_name || 'Aarush User'}
          </strong>

          <span>@{person.username || 'user'}</span>

          {person.profession ? (
            <small>{person.profession}</small>
          ) : null}

          {person.mutual_count > 0 ? (
            <small style={styles.mutual}>
              {person.mutual_count} mutual connection
              {person.mutual_count === 1 ? '' : 's'}
            </small>
          ) : null}
        </span>
      </button>

      <button
        type="button"
        disabled={actionId === person.id}
        onClick={() => {
          if (isGuestMode()) {
            onSignIn();
            return;
          }

          if (following || requested) {
            onUnfollow(person.id);
          } else {
            onFollow(person.id);
          }
        }}
        style={
          following
            ? styles.followingButton
            : requested
              ? styles.requestedButton
              : styles.followButton
        }
      >
        {following ? (
          <>
            <Check size={13} />
            Following
          </>
        ) : requested ? (
          'Requested'
        ) : (
          <>
            <UserPlus size={13} />
            Follow
          </>
        )}
      </button>
    </article>
  );
}

function Section({
  title,
  people,
  relationships,
  actionId,
  onOpen,
  onFollow,
  onUnfollow,
  onSignIn,
}) {
  if (!people.length) {
    return null;
  }

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionIcon}>
          <Users size={16} />
        </span>
        <h2>{title}</h2>
      </div>

      <div style={styles.list}>
        {people.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            relationship={relationships[person.id]}
            actionId={actionId}
            onOpen={onOpen}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onSignIn={onSignIn}
          />
        ))}
      </div>
    </section>
  );
}

export default function DiscoverPeople() {
  const navigate = useNavigate();
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] =
    useState([]);
  const [suggested, setSuggested] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [relationships, setRelationships] =
    useState({});
  const [searchPage, setSearchPage] = useState(0);
  const [hasMoreSearch, setHasMoreSearch] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] =
    useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const searchMode = Boolean(search.trim());

  const loadRelationshipMap = useCallback(
    async (people) => {
      if (!user?.id || !people.length) {
        return;
      }

      const entries = await Promise.all(
        people.map(async (person) => [
          person.id,
          await getRelationship(user.id, person.id),
        ])
      );

      setRelationships((current) => ({
        ...current,
        ...Object.fromEntries(entries),
      }));
    },
    [user?.id]
  );

  const loadDiscovery = useCallback(
    async ({ refresh = false } = {}) => {
      if (loadingRef.current && !refresh) {
        return;
      }

      loadingRef.current = true;
      setError('');

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        setUser(currentUser || null);

        const [
          suggestedUsers,
          trendingUsers,
          freshUsers,
        ] = await Promise.all([
          getSuggestedForYou({
            userId: currentUser?.id,
            limit: PAGE_SIZE,
          }),
          getTrendingCreators({
            userId: currentUser?.id,
            limit: PAGE_SIZE,
          }),
          getNewOnAarush({
            userId: currentUser?.id,
            limit: PAGE_SIZE,
          }),
        ]);

        setSuggested(suggestedUsers);
        setTrending(trendingUsers);
        setNewUsers(freshUsers);

        await loadRelationshipMap([
          ...suggestedUsers,
          ...trendingUsers,
          ...freshUsers,
        ]);
      } catch (loadError) {
        setError(
          loadError.message ||
            'Unable to load discover content.'
        );
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loadRelationshipMap]
  );

  const loadSearch = useCallback(
    async (pageNumber = 0, replace = false) => {
      if (!search.trim()) {
        return;
      }

      if (loadingRef.current && !replace) {
        return;
      }

      loadingRef.current = true;
      replace ? setLoading(true) : setLoadingMore(true);
      setError('');

      try {
        const result = await searchDiscoverPeople(
          search,
          {
            page: pageNumber,
            pageSize: PAGE_SIZE,
            userId: user?.id,
          }
        );

        setSearchResults((current) => {
          const values = replace
            ? result
            : [...current, ...result];

          return [
            ...new Map(
              values.map((person) => [person.id, person])
            ).values(),
          ];
        });

        setSearchPage(pageNumber);
        setHasMoreSearch(result.length === PAGE_SIZE);
        await loadRelationshipMap(result);
      } catch (loadError) {
        setError(
          loadError.message || 'Unable to search people.'
        );
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [loadRelationshipMap, search, user?.id]
  );

  useEffect(() => {
    loadDiscovery();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchMode) {
        loadSearch(0, true);
      } else {
        setSearchResults([]);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [loadSearch, searchMode]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          !entry.isIntersecting ||
          loadingRef.current ||
          !searchMode ||
          !hasMoreSearch
        ) {
          return;
        }

        loadSearch(searchPage + 1);
      },
      { rootMargin: '500px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [
    hasMoreSearch,
    loadSearch,
    searchMode,
    searchPage,
  ]);

  useEffect(() => {
    const cleanup = subscribeToDiscoverChanges(() => {
      loadDiscovery({ refresh: true });
    });

    return cleanup;
  }, [loadDiscovery]);

  const visibleSearchResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return searchResults;
    }

    return searchResults.filter((person) =>
      [
        person.username,
        person.full_name,
        person.profession,
        person.bio,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [search, searchResults]);

  const changeFollow = async (personId, shouldUnfollow) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setActionId(personId);

    const previous = relationships[personId];

    setRelationships((current) => ({
      ...current,
      [personId]: {
        ...previous,
        following: !shouldUnfollow,
        requested: false,
      },
    }));

    try {
      if (shouldUnfollow) {
        await unfollowUser(personId);
      } else {
        await followUser(personId);
      }
    } catch (followError) {
      setRelationships((current) => ({
        ...current,
        [personId]: previous,
      }));

      setError(
        followError.message ||
          'Unable to update follow status.'
      );
    } finally {
      setActionId(null);
    }
  };

  const updateFollow = (personId, isUnfollow) =>
    changeFollow(personId, isUnfollow);

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Discover People"
        showBackButton
      />

      <main style={styles.content}>
        <section style={styles.hero}>
          <span style={styles.heroIcon}>
            <Users size={24} />
          </span>

          <div>
            <h1>Discover People</h1>
            <p>
              Find creators and build your Aarush circle.
            </p>
          </div>
        </section>

        <div style={styles.searchBox}>
          <Search size={16} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search username, name, profession, or bio"
            style={styles.input}
          />

          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={styles.clearButton}
            >
              ×
            </button>
          ) : null}
        </div>

        {error ? (
          <section style={styles.error}>
            <CloudOff size={26} />
            <span>{error}</span>
            <button
              type="button"
              onClick={() =>
                searchMode
                  ? loadSearch(0, true)
                  : loadDiscovery({ refresh: true })
              }
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
        ) : searchMode ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>
                <Search size={16} />
              </span>
              <h2>Search results</h2>
            </div>

            {visibleSearchResults.length ? (
              <div style={styles.list}>
                {visibleSearchResults.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    relationship={relationships[person.id]}
                    actionId={actionId}
                    onOpen={(profile) =>
                      navigate(
                        `/profile/${profile.username}`
                      )
                    }
                    onFollow={(id) =>
                      updateFollow(id, false)
                    }
                    onUnfollow={(id) =>
                      updateFollow(id, true)
                    }
                    onSignIn={() => navigate('/login')}
                  />
                ))}
              </div>
            ) : (
              <div style={styles.empty}>
                <Search size={27} />
                <h2>No people found</h2>
                <p>Try another search.</p>
              </div>
            )}
          </section>
        ) : (
          <>
            <Section
              title="Suggested For You"
              people={suggested}
              relationships={relationships}
              actionId={actionId}
              onOpen={(person) =>
                navigate(`/profile/${person.username}`)
              }
              onFollow={(id) =>
                updateFollow(id, false)
              }
              onUnfollow={(id) =>
                updateFollow(id, true)
              }
              onSignIn={() => navigate('/login')}
            />

            <Section
              title="Trending Creators"
              people={trending}
              relationships={relationships}
              actionId={actionId}
              onOpen={(person) =>
                navigate(`/profile/${person.username}`)
              }
              onFollow={(id) =>
                updateFollow(id, false)
              }
              onUnfollow={(id) =>
                updateFollow(id, true)
              }
              onSignIn={() => navigate('/login')}
            />

            <Section
              title="New on Aarush"
              people={newUsers}
              relationships={relationships}
              actionId={actionId}
              onOpen={(person) =>
                navigate(`/profile/${person.username}`)
              }
              onFollow={(id) =>
                updateFollow(id, false)
              }
              onUnfollow={(id) =>
                updateFollow(id, true)
              }
              onSignIn={() => navigate('/login')}
            />

            {!suggested.length &&
            !trending.length &&
            !newUsers.length ? (
              <div style={styles.empty}>
                <Users size={28} />
                <h2>No suggestions yet</h2>
                <p>Check back soon for new people.</p>
              </div>
            ) : null}
          </>
        )}

        {loadingMore ? (
          <div style={styles.loadingMore}>
            Loading more people…
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
    maxWidth: '760px',
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

  heroIcon: {
    width: '2.6rem',
    height: '2.6rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '0.8rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
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
    color: '#91a0ba',
    background: 'rgba(255,255,255,.05)',
  },

  input: {
    width: '100%',
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '0.74rem',
  },

  clearButton: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.08)',
    cursor: 'pointer',
  },

  section: {
    marginBottom: '0.75rem',
    padding: '0.85rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.15rem',
    background: 'rgba(15,19,30,.9)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.65rem',
  },

  sectionIcon: {
    width: '1.95rem',
    height: '1.95rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '0.65rem',
    color: '#dce8ff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.24),rgba(77,215,255,.12))',
  },

  sectionHeaderH2: {
    margin: 0,
    fontSize: '0.88rem',
  },

  list: {
    display: 'grid',
    gap: '0.45rem',
  },

  personCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    padding: '0.65rem',
    border: '1px solid rgba(255,255,255,.06)',
    borderRadius: '0.9rem',
    background: 'rgba(255,255,255,.035)',
  },

  personMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    minWidth: 0,
    flex: 1,
    border: 0,
    color: '#fff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  avatar: {
    width: '2.7rem',
    height: '2.7rem',
    objectFit: 'cover',
    flexShrink: 0,
    border: '2px solid rgba(124,92,255,.5)',
    borderRadius: '999px',
  },

  placeholderAvatar: {
    width: '2.7rem',
    height: '2.7rem',
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
    gap: '0.15rem',
  },

  personCopyStrong: {
    overflow: 'hidden',
    fontSize: '0.73rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  personCopySpan: {
    color: '#96a3bf',
    fontSize: '0.62rem',
  },

  personCopySmall: {
    color: '#8290ad',
    fontSize: '0.59rem',
  },

  mutual: {
    color: '#9deeff',
  },

  followButton: {
    minHeight: '2.05rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0 0.6rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background: 'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  followingButton: {
    minHeight: '2.05rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0 0.5rem',
    border: '1px solid rgba(130,233,193,.25)',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '0.59rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  requestedButton: {
    minHeight: '2.05rem',
    padding: '0 0.5rem',
    border: '1px solid rgba(255,210,125,.25)',
    borderRadius: '999px',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.08)',
    fontSize: '0.59rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  skeletonAvatar: {
    width: '2.7rem',
    height: '2.7rem',
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