import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ChevronRight,
  CloudOff,
  Heart,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  UploadCloud,
  UserRound,
  Users,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import PostCard from '../components/PostCard';
import {
  getFeedPosts,
  subscribeToPosts,
} from '../utils/postEngine';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 10;


const FALLBACK_STORIES = [
  {
    id: 'story-your',
    label: 'Your Story',
    avatar: '',
    own: true,
  },
  {
    id: 'story-community',
    label: 'Community',
    avatar: '',
  },
  {
    id: 'story-creators',
    label: 'Creators',
    avatar: '',
  },
  {
    id: 'story-trending',
    label: 'Trending',
    avatar: '',
  },
];


function SkeletonPost() {
  return (
    <article style={styles.skeletonCard}>
      <div style={styles.skeletonHeader}>
        <span style={styles.skeletonAvatar} />

        <div style={styles.skeletonIdentity}>
          <span style={styles.skeletonLine} />
          <span style={styles.skeletonSmallLine} />
        </div>
      </div>

      <span style={styles.skeletonMedia} />

      <div style={styles.skeletonBody}>
        <span style={styles.skeletonLine} />
        <span style={styles.skeletonSmallLine} />
        <span style={styles.skeletonActions} />
      </div>
    </article>
  );
}

function StoryRail({ onRestrictedAction, onCreate }) {
  const handleStoryClick = (story) => {
    

    if (story.own) {
      onCreate();
      return;
    }

    onRestrictedAction(
      'Story viewing will be available when the live story system is connected.'
    );
  };

  return (
    <section style={styles.storyCard}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionHeading}>
          <span style={styles.sectionIcon}>
            <Sparkles size={15} />
          </span>

          <div>
            <h2 style={styles.sectionTitle}>Stories</h2>
            <p style={styles.sectionSubtitle}>
              Moments from your Aarush circle.
            </p>
          </div>
        </div>

        <span style={styles.liveBadge}>Live-ready</span>
      </div>

      <div style={styles.storyScroller}>
        {FALLBACK_STORIES.map((story) => (
          <button
            key={story.id}
            type="button"
            onClick={() => handleStoryClick(story)}
            style={styles.storyButton}
            aria-label={story.label}
          >
            <span
              style={{
                ...styles.storyRing,
                ...(story.own ? styles.ownStoryRing : {}),
              }}
            >
              {story.avatar ? (
                <img
                  src={story.avatar}
                  alt=""
                  style={styles.storyAvatar}
                />
              ) : (
                <span style={styles.storyPlaceholder}>
                  {story.own ? (
                    <Plus size={19} />
                  ) : (
                    <UserRound size={19} />
                  )}
                </span>
              )}
            </span>

            <span style={styles.storyLabel}>{story.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function FeedFilter({
  label,
  icon: Icon,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.filterButton,
        ...(active ? styles.activeFilterButton : {}),
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function EmptyState({ onCreate }) {
  return (
    <section style={styles.emptyState}>
      <span style={styles.emptyIcon}>
        <MessageCircle size={27} />
      </span>

      <h1>No posts yet</h1>

      <p>
        Be the first to share something with the Aarush
        community.
      </p>

      <button
        type="button"
        onClick={onCreate}
        style={styles.primaryButton}
      >
        <UploadCloud size={16} />
        Create your first post
      </button>
    </section>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <section style={styles.errorState}>
      <span style={styles.errorIcon}>
        <CloudOff size={28} />
      </span>

      <h1>Feed unavailable</h1>

      <p>
        We could not load the latest posts. Check your
        connection and try again.
      </p>

      {error ? (
        <small style={styles.errorDetails}>{error}</small>
      ) : null}

      <button
        type="button"
        onClick={onRetry}
        style={styles.primaryButton}
      >
        <RefreshCw size={16} />
        Retry
      </button>
    </section>
  );
}

export default function HomeFeed() {
  const navigate = useNavigate();
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const refreshStartRef = useRef(null);

  const [user, setUser] = useState(null);
  // guest mode removed
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] =
    useState('for_you');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] =
    useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pullDistance, setPullDistance] = useState(0);

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2800);
  }, []);

  const loadAuthenticatedUser = useCallback(async () => {
  const {
    data: { user: currentUser },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  setUser(currentUser || null);
  return currentUser || null;
}, []);

  const loadPage = useCallback(
    async ({
      pageNumber = 0,
      replace = false,
      isRefresh = false,
    } = {}) => {
      if (loadingRef.current && !isRefresh) {
        return;
      }

      if (!replace && !hasMore) {
        return;
      }

      loadingRef.current = true;

      if (replace) {
        setInitialLoading(!isRefresh);
        setRefreshing(isRefresh);
      } else {
        setLoadingMore(true);
      }

      setError('');

      try {
        const currentUser = await loadAuthenticatedUser();

        const nextPosts = await getFeedPosts({
          page: pageNumber,
          pageSize: PAGE_SIZE,
          userId: currentUser?.id || null,
        });

        if (!mountedRef.current) {
          return;
        }

        setPosts((currentPosts) => {
          const combined = replace
            ? nextPosts
            : [...currentPosts, ...nextPosts];

          const uniquePosts = new Map();

          combined.forEach((post) => {
            uniquePosts.set(post.id, post);
          });

          return [...uniquePosts.values()];
        });

        setPage(pageNumber);
        setHasMore(nextPosts.length === PAGE_SIZE);
      } catch (loadError) {
        if (mountedRef.current) {
          setError(
            loadError.message || 'Unable to load the feed.'
          );
        }
      } finally {
        loadingRef.current = false;
        setInitialLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [hasMore, loadAuthenticatedUser]
  );

  const refreshFeed = useCallback(async () => {
    await loadPage({
      pageNumber: 0,
      replace: true,
      isRefresh: true,
    });
  }, [loadPage]);

  useEffect(() => {
    mountedRef.current = true;

    loadPage({
      pageNumber: 0,
      replace: true,
    });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMore &&
          !loadingRef.current
        ) {
          loadPage({
            pageNumber: page + 1,
            replace: false,
          });
        }
      },
      {
        rootMargin: '700px 0px',
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadPage, page]);

  useEffect(() => {
    const cleanupSubscription = subscribeToPosts(
      (payload) => {
        if (!mountedRef.current) {
          return;
        }

        if (payload.table === 'posts') {
          if (payload.eventType === 'INSERT') {
            const newPost = payload.new;

            setPosts((currentPosts) => {
              if (
                currentPosts.some(
                  (post) => post.id === newPost.id
                )
              ) {
                return currentPosts;
              }

              return [
                {
                  ...newPost,
                  profile: newPost.profile || {},
                  is_liked: false,
                  is_saved: false,
                },
                ...currentPosts,
              ];
            });

            showNotice('New post added to your feed.');
          }

          if (payload.eventType === 'UPDATE') {
            setPosts((currentPosts) =>
              currentPosts.map((post) =>
                post.id === payload.new.id
                  ? {
                      ...post,
                      ...payload.new,
                    }
                  : post
              )
            );
          }

          if (payload.eventType === 'DELETE') {
            setPosts((currentPosts) =>
              currentPosts.filter(
                (post) => post.id !== payload.old.id
              )
            );
          }
        }

        if (
          payload.table === 'likes' ||
          payload.table === 'comments'
        ) {
          const postId =
            payload.new?.post_id || payload.old?.post_id;

          if (!postId) {
            return;
          }

          setPosts((currentPosts) =>
            currentPosts.map((post) => {
              if (post.id !== postId) {
                return post;
              }

              if (payload.table === 'likes') {
                return {
                  ...post,
                  like_count: Math.max(
                    0,
                    Number(post.like_count || 0) +
                      (payload.eventType === 'INSERT' ? 1 : -1)
                  ),
                };
              }

              return {
                ...post,
                comment_count: Math.max(
                  0,
                  Number(post.comment_count || 0) +
                    (payload.eventType === 'INSERT' ? 1 : -1)
                ),
              };
            })
          );
        }
      }
    );

    return () => {
      Promise.resolve(cleanupSubscription).then((cleanup) => {
        cleanup?.();
      });
    };
  }, [showNotice]);

  const handlePostUpdated = useCallback(
    (postId, changes) => {
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                ...changes,
              }
            : post
        )
      );
    },
    []
  );

  const handleRestrictedAction = useCallback(
    (message) => {
      showNotice(message);
    },
    [showNotice]
  );

  const handlePullStart = useCallback((event) => {
    if (window.scrollY > 0 || refreshing) {
      return;
    }

    refreshStartRef.current = event.touches[0].clientY;
  }, [refreshing]);

  const handlePullMove = useCallback((event) => {
    if (
      refreshStartRef.current === null ||
      window.scrollY > 0 ||
      refreshing
    ) {
      return;
    }

    const distance =
      event.touches[0].clientY - refreshStartRef.current;

    if (distance > 0) {
      setPullDistance(Math.min(90, distance * 0.45));
    }
  }, [refreshing]);

  const handlePullEnd = useCallback(() => {
    if (refreshStartRef.current === null) {
      return;
    }

    refreshStartRef.current = null;

    if (pullDistance >= 55) {
      setPullDistance(0);
      refreshFeed();
      return;
    }

    setPullDistance(0);
  }, [pullDistance, refreshFeed]);

  const visiblePosts = useMemo(() => {
    if (activeFilter === 'following') {
      return posts.filter((post) => post.is_following);
    }

    if (activeFilter === 'trending') {
      return [...posts].sort(
        (first, second) =>
          Number(second.like_count || 0) -
          Number(first.like_count || 0)
      );
    }

    return posts;
  }, [activeFilter, posts]);

  return (
    <div
      style={styles.page}
      onTouchStart={handlePullStart}
      onTouchMove={handlePullMove}
      onTouchEnd={handlePullEnd}
    >
      <TopBar
        pageTitle="Aarush"
        notificationCount={0}
        onSecretAccess={() => navigate('/account-switch')}
      />

      {pullDistance > 0 ? (
        <div
          style={{
            ...styles.pullIndicator,
            height: `${pullDistance}px`,
          }}
          aria-live="polite"
        >
          <RefreshCw
            size={16}
            style={{
              transform: `rotate(${pullDistance * 4}deg)`,
            }}
          />
          {pullDistance >= 55
            ? 'Release to refresh'
            : 'Pull to refresh'}
        </div>
      ) : null}

      <main style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <AlertCircle size={15} />
            {notice}
          </div>
        ) : null}

        <StoryRail
  onRestrictedAction={handleRestrictedAction}
  onCreate={() => navigate('/story-camera')}
/>

        <div style={styles.filterBar}>
          <FeedFilter
            label="For You"
            icon={Sparkles}
            active={activeFilter === 'for_you'}
            onClick={() => setActiveFilter('for_you')}
          />

          <FeedFilter
            label="Following"
            icon={Users}
            active={activeFilter === 'following'}
            onClick={() => {
              setActiveFilter('following');
              showNotice(
                'Following feed ranking is coming in Step 1.6.'
              );
            }}
          />

          <FeedFilter
            label="Trending"
            icon={TrendingUp}
            active={activeFilter === 'trending'}
            onClick={() => setActiveFilter('trending')}
          />
        </div>

        {initialLoading ? (
          <div style={styles.feedStack}>
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </div>
        ) : error && !posts.length ? (
          <ErrorState
            error={error}
            onRetry={() =>
              loadPage({
                pageNumber: 0,
                replace: true,
              })
            }
          />
        ) : !visiblePosts.length ? (
          activeFilter === 'following' ? (
            <section style={styles.emptyState}>
              <span style={styles.emptyIcon}>
                <Users size={27} />
              </span>

              <h1>No posts from followed accounts</h1>

              <p>
                Follow more people to build your Following feed.
              </p>

              <button
                type="button"
                onClick={() => setActiveFilter('for_you')}
                style={styles.primaryButton}
              >
                View For You
                <ChevronRight size={16} />
              </button>
            </section>
          ) : (
            <EmptyState
              onCreate={() => navigate('/upload')}
            />
          )
        ) : (
          <section style={styles.feedSection}>
            <div style={styles.feedHeader}>
              <div>
                <h1 style={styles.feedTitle}>
                  {activeFilter === 'trending'
                    ? 'Trending posts'
                    : activeFilter === 'following'
                      ? 'Following'
                      : 'For You'}
                </h1>

                <p style={styles.feedSubtitle}>
                  'Fresh posts from your Aarush community.'
                    
                    
                </p>
              </div>

              <button
                type="button"
                onClick={refreshFeed}
                disabled={refreshing}
                style={styles.refreshButton}
                aria-label="Refresh feed"
              >
                <RefreshCw
                  size={16}
                  style={{
                    animation: refreshing
                      ? 'aarush-feed-spin 900ms linear infinite'
                      : 'none',
                  }}
                />
              </button>
            </div>

            <div style={styles.feedStack}>
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostUpdated={handlePostUpdated}
                  onRestrictedAction={handleRestrictedAction}
                />
              ))}
            </div>

            {loadingMore ? (
              <div style={styles.loadingMore}>
                <RefreshCw size={16} />
                Loading more posts…
              </div>
            ) : null}

            {!hasMore && posts.length ? (
              <div style={styles.endOfFeed}>
                You’re all caught up.
              </div>
            ) : null}

            <div
              ref={sentinelRef}
              style={styles.sentinel}
              aria-hidden="true"
            />
          </section>
        )}
      </main>

      <BottomNav />

      <style>{`
        @keyframes aarush-feed-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes aarush-skeleton-pulse {
          0%, 100% {
            opacity: 0.42;
          }

          50% {
            opacity: 0.9;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '6.8rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
  },

  content: {
    width: '100%',
    maxWidth: '760px',
    margin: '0 auto',
    padding: '0.9rem',
    boxSizing: 'border-box',
  },

  pullIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    overflow: 'hidden',
    color: '#9deeff',
    background: 'rgba(77,215,255,0.06)',
    fontSize: '0.68rem',
    fontWeight: 800,
    transition: 'height 160ms ease',
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.75rem',
    padding: '0.7rem 0.75rem',
    border: '1px solid rgba(77,215,255,0.18)',
    borderRadius: '0.8rem',
    color: '#b8f4ff',
    background: 'rgba(77,215,255,0.07)',
    fontSize: '0.68rem',
    lineHeight: 1.4,
  },

  storyCard: {
    marginBottom: '0.85rem',
    padding: '0.9rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(145deg, rgba(21,26,44,0.94), rgba(10,14,23,0.94))',
    boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    marginBottom: '0.75rem',
  },

  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  sectionIcon: {
    width: '1.95rem',
    height: '1.95rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(77,215,255,0.15))',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 850,
  },

  sectionSubtitle: {
    margin: '0.2rem 0 0',
    color: '#91a0ba',
    fontSize: '0.68rem',
  },

  liveBadge: {
    padding: '0.28rem 0.42rem',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,0.1)',
    fontSize: '0.58rem',
    fontWeight: 850,
  },

  storyScroller: {
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },

  storyButton: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.3rem',
    flexShrink: 0,
    padding: 0,
    border: 0,
    color: '#dce5f8',
    background: 'transparent',
    cursor: 'pointer',
  },

  storyRing: {
    width: '3.9rem',
    height: '3.9rem',
    display: 'grid',
    placeItems: 'center',
    padding: '3px',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #7c5cff, #ff4fd8, #4dd7ff)',
  },

  ownStoryRing: {
    background:
      'linear-gradient(135deg, #4dd7ff, #7c5cff)',
  },

  storyAvatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    border: '3px solid #101521',
    borderRadius: '999px',
  },

  storyPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    border: '3px solid #101521',
    borderRadius: '999px',
    color: '#dce5f8',
    background: '#20283b',
  },

  storyLabel: {
    maxWidth: '4.7rem',
    overflow: 'hidden',
    color: '#dce5f8',
    fontSize: '0.63rem',
    fontWeight: 750,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  filterBar: {
    display: 'flex',
    gap: '0.45rem',
    overflowX: 'auto',
    marginBottom: '0.85rem',
    scrollbarWidth: 'none',
  },

  filterButton: {
    minHeight: '2.35rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    flexShrink: 0,
    padding: '0 0.75rem',
    border: 0,
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  activeFilterButton: {
    color: '#fff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.3), rgba(77,215,255,0.15))',
    boxShadow: '0 0 18px rgba(124,92,255,0.12)',
  },

  feedSection: {
    display: 'grid',
    gap: '0.3rem',
  },

  feedHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    marginBottom: '0.5rem',
  },

  feedTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 900,
  },

  feedSubtitle: {
    margin: '0.22rem 0 0',
    color: '#91a0ba',
    fontSize: '0.68rem',
  },

  refreshButton: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },

  feedStack: {
    display: 'grid',
    gap: '0.1rem',
  },

  skeletonCard: {
    display: 'grid',
    gap: '0.75rem',
    marginBottom: '0.8rem',
    padding: '0.8rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.9)',
    animation:
      'aarush-skeleton-pulse 1.4s ease-in-out infinite',
  },

  skeletonHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
  },

  skeletonAvatar: {
    width: '2.55rem',
    height: '2.55rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.1)',
  },

  skeletonIdentity: {
    display: 'grid',
    gap: '0.35rem',
    flex: 1,
  },

  skeletonLine: {
    width: '8rem',
    height: '0.65rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.1)',
  },

  skeletonSmallLine: {
    width: '5rem',
    height: '0.5rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.07)',
  },

  skeletonMedia: {
    width: '100%',
    height: '20rem',
    borderRadius: '0.85rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(77,215,255,0.06))',
  },

  skeletonBody: {
    display: 'grid',
    gap: '0.45rem',
  },

  skeletonActions: {
    width: '55%',
    height: '1.3rem',
    marginTop: '0.3rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.07)',
  },

  loadingMore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '1rem',
    color: '#9deeff',
    fontSize: '0.7rem',
    fontWeight: 750,
  },

  endOfFeed: {
    padding: '1.2rem',
    color: '#8290ad',
    fontSize: '0.68rem',
    textAlign: 'center',
  },

  sentinel: {
    height: '1px',
    opacity: 0,
  },

  emptyState: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.6rem',
    padding: '3rem 1.2rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.3rem',
    background: 'rgba(15,19,30,0.9)',
    textAlign: 'center',
  },

  emptyIcon: {
    width: '3.7rem',
    height: '3.7rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    boxShadow: '0 0 24px rgba(124,92,255,0.22)',
  },

  emptyStateH1: {
    margin: 0,
    fontSize: '1rem',
  },

  emptyStateP: {
    maxWidth: '20rem',
    margin: 0,
    color: '#96a3bf',
    fontSize: '0.74rem',
    lineHeight: 1.5,
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    marginTop: '0.3rem',
    padding: '0 0.9rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.72rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  errorState: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.6rem',
    padding: '3rem 1.2rem',
    border: '1px solid rgba(255,79,122,0.16)',
    borderRadius: '1.3rem',
    background: 'rgba(255,79,122,0.05)',
    textAlign: 'center',
  },

  errorIcon: {
    width: '3.7rem',
    height: '3.7rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.12)',
  },

  errorStateH1: {
    margin: 0,
    fontSize: '1rem',
  },

  errorStateP: {
    maxWidth: '22rem',
    margin: 0,
    color: '#c9a4b2',
    fontSize: '0.74rem',
    lineHeight: 1.5,
  },

  errorDetails: {
    maxWidth: '22rem',
    overflow: 'hidden',
    color: '#ff9fba',
    fontSize: '0.62rem',
    textOverflow: 'ellipsis',
  },
};