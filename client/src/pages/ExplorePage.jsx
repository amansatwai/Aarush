import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Bookmark,
  ChevronRight,
  Heart,
  Play,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import {
  getExploreFeed,
  getHashtagFeed,
  getRecentlyPopularPosts,
  getRecentReels,
  getSuggestedCreators,
  getTrendingPosts,
  getTrendingReels,
  searchExplore,
  subscribeToExploreUpdates,
} from '../utils/exploreEngine';
import {
  followUser,
  isFollowing,
} from '../utils/followEngine';
const PAGE_SIZE = 18;
const CREATOR_PAGE_SIZE = 12;
const SEARCH_DELAY = 350;

function isGuestMode() {
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

function getDisplayName(profile) {
  return (
    profile?.full_name ||
    profile?.username ||
    'Aarush creator'
  );
}

function getInitial(profile) {
  return getDisplayName(profile)
    .charAt(0)
    .toUpperCase();
}

function getPostImage(post) {
  return (
    post.thumbnail_url ||
    post.image_url ||
    post.media_url ||
    post.video_url ||
    null
  );
}

function getPostText(post) {
  return (
    post.caption ||
    post.title ||
    post.description ||
    ''
  );
}

function formatCount(value) {
  const count = Number(value || 0);

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  return String(count);
}

function getLikeCount(post) {
  return (
    post.likes_count ||
    post.like_count ||
    post.likes ||
    0
  );
}

function getCommentCount(post) {
  return (
    post.comments_count ||
    post.comment_count ||
    post.comments ||
    0
  );
}

function Avatar({ profile, size = 'normal' }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={getDisplayName(profile)}
        className={`explore-avatar explore-avatar-${size}`}
      />
    );
  }

  return (
    <div
      className={`explore-avatar explore-avatar-${size} explore-avatar-fallback`}
    >
      {getInitial(profile)}
    </div>
  );
}

function SectionHeader({
  title,
  icon,
  onSeeAll,
}) {
  return (
    <div className="explore-section-header">
      <div className="explore-section-title">
        {icon}
        <h2>{title}</h2>
      </div>

      {onSeeAll ? (
        <button
          type="button"
          onClick={onSeeAll}
          className="explore-see-all"
        >
          See all
          <ChevronRight size={15} />
        </button>
      ) : null}
    </div>
  );
}

function PostTile({ post, onOpen }) {
  const image = getPostImage(post);
  const text = getPostText(post);

  return (
    <button
      type="button"
      className="explore-post-tile"
      onClick={() => onOpen(post)}
    >
      {image ? (
        <img
          src={image}
          alt={text || 'Explore post'}
          loading="lazy"
        />
      ) : (
        <div className="explore-post-placeholder">
          <Sparkles size={23} />
        </div>
      )}

      {post.is_reel ? (
        <span className="explore-reel-badge">
          <Play size={12} fill="currentColor" />
        </span>
      ) : null}

      <span className="explore-tile-overlay">
        <span>
          <Heart size={14} fill="currentColor" />
          {formatCount(getLikeCount(post))}
        </span>
        <span>
          {formatCount(getCommentCount(post))}
        </span>
      </span>
    </button>
  );
}

function ReelCard({ reel, onOpen }) {
  const image = getPostImage(reel);

  return (
    <button
      type="button"
      className="explore-reel-card"
      onClick={() => onOpen(reel)}
    >
      {image ? (
        <img
          src={image}
          alt={getPostText(reel) || 'Reel'}
          loading="lazy"
        />
      ) : (
        <div className="explore-reel-placeholder">
          <Play size={26} fill="currentColor" />
        </div>
      )}

      <span className="explore-reel-gradient" />

      <span className="explore-reel-play">
        <Play size={16} fill="currentColor" />
      </span>

      <span className="explore-reel-copy">
        <strong>
          {getPostText(reel) || 'Watch this reel'}
        </strong>
        <small>
          {formatCount(
            reel.views_count ||
              reel.view_count ||
              reel.views
          )}{' '}
          views
        </small>
      </span>
    </button>
  );
}

function CreatorCard({
  creator,
  following,
  onFollow,
  onOpen,
  busy,
}) {
  return (
    <article className="explore-creator-card">
      <button
        type="button"
        className="explore-creator-profile"
        onClick={() => onOpen(creator)}
      >
        <Avatar profile={creator} size="large" />

        <strong>{getDisplayName(creator)}</strong>

        <span>
          {creator?.username
            ? `@${creator.username}`
            : 'Aarush creator'}
        </span>
      </button>

      <button
        type="button"
        className={
          following
            ? 'explore-follow-button is-following'
            : 'explore-follow-button'
        }
        onClick={() => onFollow(creator)}
        disabled={busy || following}
      >
        {following ? (
          <>
            <Users size={14} />
            Following
          </>
        ) : (
          <>
            <UserPlus size={14} />
            Follow
          </>
        )}
      </button>
    </article>
  );
}

function SkeletonGrid({ count = 6 }) {
  return (
    <div className="explore-grid">
      {Array.from({ length: count }).map(
        (_, index) => (
          <div
            className="explore-skeleton-tile"
            key={index}
          />
        )
      )}
    </div>
  );
}

function SignInPrompt({ onClose, onSignIn }) {
  return (
    <div
      className="explore-prompt-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="explore-signin-prompt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="explore-signin-title"
      >
        <button
          type="button"
          className="explore-prompt-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="explore-prompt-icon">
          <Sparkles size={25} />
        </div>

        <h2 id="explore-signin-title">
          Make Explore yours
        </h2>

        <p>
          Sign in to like, save, follow creators, and
          join conversations on Aarush.
        </p>

        <button
          type="button"
          className="explore-primary-button"
          onClick={onSignIn}
        >
          Sign in to continue
        </button>
      </section>
    </div>
  );
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const guest = isGuestMode();
  const loadMoreRef = useRef(null);
  const searchTimerRef = useRef(null);

  const [explore, setExplore] = useState([]);
  const [trending, setTrending] = useState([]);
  const [reels, setReels] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recentReels, setRecentReels] =
    useState([]);
  const [creators, setCreators] = useState([]);
  const [hashtags, setHashtags] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] =
    useState(null);
  const [activeHashtag, setActiveHashtag] =
    useState('');

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] =
    useState(false);
  const [refreshing, setRefreshing] =
    useState(false);
  const [searching, setSearching] =
    useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showSignIn, setShowSignIn] =
    useState(false);
  const [followBusyId, setFollowBusyId] =
    useState(null);
  const [followedIds, setFollowedIds] =
    useState(new Set());

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadInitial = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError('');

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [
          exploreResult,
          trendingResult,
          reelsResult,
          creatorsResult,
          popularResult,
          recentReelsResult,
        ] = await Promise.all([
          getExploreFeed({
            page: 0,
            pageSize: PAGE_SIZE,
          }),
          getTrendingPosts({
            page: 0,
            pageSize: 8,
          }),
          getTrendingReels({
            page: 0,
            pageSize: 8,
          }),
          getSuggestedCreators({
            page: 0,
            pageSize: CREATOR_PAGE_SIZE,
          }),
          getRecentlyPopularPosts({
            page: 0,
            pageSize: 8,
          }),
          getRecentReels({
            page: 0,
            pageSize: 8,
          }),
        ]);

        setExplore(exploreResult.items || []);
        setTrending(trendingResult.items || []);
        setReels(reelsResult.items || []);
        setCreators(creatorsResult.items || []);
        setPopular(popularResult.items || []);
        setRecentReels(recentReelsResult.items || []);
        setPage(0);
        setHasMore(Boolean(exploreResult.hasMore));

        const discoveredTags = [
          ...new Set(
            [
              ...(exploreResult.items || []),
              ...(trendingResult.items || []),
            ].flatMap(
              (post) => post.hashtags || []
            )
          ),
        ].slice(0, 12);

        setHashtags(discoveredTags);
      } catch (loadError) {
        setError(
          loadError?.message ||
            'Unable to load Explore right now.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadInitial();

    const unsubscribe = subscribeToExploreUpdates(
      () => {
        loadInitial({ refresh: true });
      }
    );

    return unsubscribe;
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || searchResult) {
      return;
    }

    try {
      setLoadingMore(true);

      const nextPage = page + 1;
      const result = await getExploreFeed({
        page: nextPage,
        pageSize: PAGE_SIZE,
      });

      setExplore((current) => [
        ...current,
        ...(result.items || []),
      ]);
      setPage(nextPage);
      setHasMore(Boolean(result.hasMore));
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load more content.'
      );
    } finally {
      setLoadingMore(false);
    }
  }, [
    hasMore,
    loadingMore,
    page,
    searchResult,
  ]);

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: '500px',
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [loadMore]);

  const runSearch = useCallback(async (value) => {
    const term = value.trim();

    if (!term) {
      setSearchResult(null);
      setSearching(false);
      return;
    }

    try {
      setSearching(true);
      setError('');

      const result = await searchExplore(term, {
        page: 0,
        pageSize: PAGE_SIZE,
      });

      setSearchResult(result);
    } catch (searchError) {
      setError(
        searchError?.message ||
          'Unable to search Explore.'
      );
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(searchTimerRef.current);

    searchTimerRef.current = setTimeout(() => {
      runSearch(searchTerm);
    }, SEARCH_DELAY);

    return () => clearTimeout(searchTimerRef.current);
  }, [runSearch, searchTerm]);

  const openHashtag = async (tag) => {
    const cleanTag = tag.replace(/^#/, '');

    try {
      setActiveHashtag(cleanTag);
      setSearching(true);
      setError('');

      const result = await getHashtagFeed(cleanTag, {
        page: 0,
        pageSize: PAGE_SIZE,
      });

      setSearchResult({
        users: [],
        hashtags: [cleanTag],
        posts: (result.items || []).filter(
          (post) => !post.is_reel
        ),
        reels: (result.items || []).filter(
          (post) => post.is_reel
        ),
      });
    } catch (hashtagError) {
      setError(
        hashtagError?.message ||
          'Unable to load this hashtag.'
      );
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResult(null);
    setActiveHashtag('');
  };

  const requireSignIn = () => {
    if (guest) {
      setShowSignIn(true);
      return true;
    }

    return false;
  };

  const openPost = (post) => {
    if (!post?.id) {
      return;
    }

    if (post.is_reel) {
      navigate(`/reels?post=${post.id}`);
      return;
    }

    navigate(`/post/${post.id}`);
  };

  const openCreator = (creator) => {
    if (!creator?.username) {
      return;
    }

    navigate(`/profile/${creator.username}`);
  };

  const handleFollow = async (creator) => {
    if (requireSignIn()) {
      return;
    }

    if (!creator?.id || followBusyId) {
      return;
    }

    try {
      setFollowBusyId(creator.id);
      setNotice('');

      await followUser(creator.id);

      setFollowedIds((current) => {
        const next = new Set(current);
        next.add(creator.id);
        return next;
      });

      setNotice('Follow request sent.');
    } catch (followError) {
      setError(
        followError?.message ||
          'Unable to follow this creator.'
      );
    } finally {
      setFollowBusyId(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadFollowState = async () => {
      if (guest || !creators.length) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) {
        return;
      }

      const results = await Promise.all(
        creators.map(async (creator) => {
          try {
            return {
              id: creator.id,
              following: await isFollowing(
                user.id,
                creator.id
              ),
            };
          } catch {
            return {
              id: creator.id,
              following: false,
            };
          }
        })
      );

      if (!mounted) {
        return;
      }

      setFollowedIds(
        new Set(
          results
            .filter((result) => result.following)
            .map((result) => result.id)
        )
      );
    };

    loadFollowState();

    return () => {
      mounted = false;
    };
  }, [creators, guest]);

  const visiblePosts = useMemo(() => {
    if (!searchResult) {
      return explore;
    }

    return searchResult.posts || [];
  }, [explore, searchResult]);

  const visibleReels = useMemo(() => {
    if (!searchResult) {
      return reels;
    }

    return searchResult.reels || [];
  }, [reels, searchResult]);

  const hasSearchResults = Boolean(
    searchResult &&
      (
        searchResult.users?.length ||
        searchResult.hashtags?.length ||
        searchResult.posts?.length ||
        searchResult.reels?.length
      )
  );

  return (
    <div className="social-page explore-page">
      <TopBar />

      <main className="explore-content">
        <header className="explore-header">
          <div>
            <p className="explore-eyebrow">
              Discover
            </p>
            <h1>Explore</h1>
          </div>

          <button
            type="button"
            className="explore-refresh-button"
            onClick={() =>
              loadInitial({ refresh: true })
            }
            disabled={refreshing}
            aria-label="Refresh Explore"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? 'explore-spin'
                  : undefined
              }
            />
          </button>
        </header>

        <label className="explore-search">
          <Search size={18} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search people, posts, reels, hashtags"
          />

          {searchTerm ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          ) : null}
        </label>

        {guest ? (
          <div className="explore-guest-note">
            <Sparkles size={16} />
            <span>
              You are browsing as a guest. Sign in to
              interact with the community.
            </span>
          </div>
        ) : null}

        {error ? (
          <div
            className="explore-error"
            role="alert"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() =>
                loadInitial({ refresh: true })
              }
            >
              Try again
            </button>
          </div>
        ) : null}

        {notice ? (
          <div className="explore-notice" role="status">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice('')}
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>
          </div>
        ) : null}

        {loading ? (
          <SkeletonGrid count={12} />
        ) : searching ? (
          <div className="explore-searching">
            Searching Explore…
          </div>
        ) : searchResult ? (
          <>
            <section className="explore-section">
              <SectionHeader
                title={
                  activeHashtag
                    ? `#${activeHashtag}`
                    : 'Search results'
                }
                icon={<Search size={17} />}
              />

              {!hasSearchResults ? (
                <div className="explore-empty">
                  <Search size={25} />
                  <h2>No results found</h2>
                  <p>
                    Try another name, keyword, or
                    hashtag.
                  </p>
                </div>
              ) : (
                <>
                  {searchResult.users?.length ? (
                    <div className="explore-creators-row">
                      {searchResult.users.map(
                        (creator) => (
                          <CreatorCard
                            creator={creator}
                            following={followedIds.has(
                              creator.id
                            )}
                            onFollow={handleFollow}
                            onOpen={openCreator}
                            busy={
                              followBusyId ===
                              creator.id
                            }
                            key={creator.id}
                          />
                        )
                      )}
                    </div>
                  ) : null}

                  {searchResult.hashtags?.length ? (
                    <div className="explore-hashtags">
                      {searchResult.hashtags.map(
                        (tag) => (
                          <button
                            type="button"
                            className="explore-hashtag-chip"
                            key={tag}
                            onClick={() =>
                              openHashtag(tag)
                            }
                          >
                            #{tag}
                          </button>
                        )
                      )}
                    </div>
                  ) : null}

                  {searchResult.reels?.length ? (
                    <div className="explore-reels-row">
                      {searchResult.reels.map((reel) => (
                        <ReelCard
                          reel={reel}
                          onOpen={openPost}
                          key={reel.id}
                        />
                      ))}
                    </div>
                  ) : null}

                  {searchResult.posts?.length ? (
                    <div className="explore-grid">
                      {searchResult.posts.map((post) => (
                        <PostTile
                          post={post}
                          onOpen={openPost}
                          key={post.id}
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </>
        ) : (
          <>
            {hashtags.length ? (
              <section className="explore-section explore-hashtag-section">
                <SectionHeader
                  title="Explore topics"
                  icon={<Sparkles size={17} />}
                />

                <div className="explore-hashtags">
                  {hashtags.map((tag) => (
                    <button
                      type="button"
                      className="explore-hashtag-chip"
                      onClick={() =>
                        openHashtag(tag)
                      }
                      key={tag}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {reels.length ? (
              <section className="explore-section">
                <SectionHeader
                  title="Trending reels"
                  icon={<Play size={17} />}
                  onSeeAll={() =>
                    navigate('/reels')
                  }
                />

                <div className="explore-reels-row">
                  {reels.map((reel) => (
                    <ReelCard
                      reel={reel}
                      onOpen={openPost}
                      key={reel.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {creators.length ? (
              <section className="explore-section">
                <SectionHeader
                  title="Suggested creators"
                  icon={<Users size={17} />}
                />

                <div className="explore-creators-row">
                  {creators.map((creator) => (
                    <CreatorCard
                      creator={creator}
                      following={followedIds.has(
                        creator.id
                      )}
                      onFollow={handleFollow}
                      onOpen={openCreator}
                      busy={
                        followBusyId === creator.id
                      }
                      key={creator.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {trending.length ? (
              <section className="explore-section">
                <SectionHeader
                  title="Trending now"
                  icon={<Sparkles size={17} />}
                />

                <div className="explore-grid">
                  {trending.map((post) => (
                    <PostTile
                      post={post}
                      onOpen={openPost}
                      key={post.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {popular.length ? (
              <section className="explore-section">
                <SectionHeader
                  title="Popular this week"
                  icon={<Heart size={17} />}
                />

                <div className="explore-grid">
                  {popular.map((post) => (
                    <PostTile
                      post={post}
                      onOpen={openPost}
                      key={post.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {recentReels.length ? (
              <section className="explore-section">
                <SectionHeader
                  title="New & rising"
                  icon={<Share2 size={17} />}
                />

                <div className="explore-reels-row">
                  {recentReels.map((reel) => (
                    <ReelCard
                      reel={reel}
                      onOpen={openPost}
                      key={reel.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="explore-section">
              <SectionHeader
                title="More for you"
                icon={<Bookmark size={17} />}
              />

              {visiblePosts.length ? (
                <div className="explore-grid">
                  {visiblePosts.map((post) => (
                    <PostTile
                      post={post}
                      onOpen={openPost}
                      key={post.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="explore-empty">
                  <Sparkles size={25} />
                  <h2>Explore is warming up</h2>
                  <p>
                    New posts and creators will appear
                    here soon.
                  </p>
                </div>
              )}
            </section>

            <div
              ref={loadMoreRef}
              className="explore-load-more"
            >
              {loadingMore
                ? 'Loading more…'
                : hasMore
                  ? 'Scroll for more'
                  : 'You are all caught up'}
            </div>
          </>
        )}
      </main>

      <BottomNav />

      {showSignIn ? (
        <SignInPrompt
          onClose={() => setShowSignIn(false)}
          onSignIn={() =>
            navigate('/login')
          }
        />
      ) : null}

      <style>{`
        .explore-page {
          min-height: 100vh;
          color: #f4f7ff;
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(124,92,255,0.2),
              transparent 34%
            ),
            radial-gradient(
              circle at 100% 15%,
              rgba(77,215,255,0.1),
              transparent 28%
            ),
            #080b13;
        }

        .explore-content {
          width: min(100%, 1000px);
          margin: 0 auto;
          padding: 1rem 1rem 7rem;
        }

        .explore-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .explore-eyebrow {
          margin: 0 0 0.2rem;
          color: #8d9abb;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .explore-header h1 {
          margin: 0;
          font-size: 1.5rem;
          letter-spacing: -0.04em;
        }

        .explore-refresh-button {
          width: 2.5rem;
          height: 2.5rem;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.9rem;
          color: #eaf0ff;
          background: rgba(255,255,255,0.06);
          cursor: pointer;
        }

        .explore-refresh-button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .explore-search {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          min-height: 3rem;
          margin-bottom: 0.8rem;
          padding: 0 0.9rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1rem;
          color: #8491ad;
          background: rgba(17,22,36,0.72);
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .explore-search input {
          width: 100%;
          border: 0;
          outline: 0;
          color: #f4f7ff;
          background: transparent;
          font: inherit;
          font-size: 0.82rem;
        }

        .explore-search input::placeholder {
          color: #697691;
        }

        .explore-search button {
          display: grid;
          place-items: center;
          border: 0;
          color: #aab6d0;
          background: transparent;
          cursor: pointer;
        }

        .explore-guest-note,
        .explore-error,
        .explore-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.8rem;
          padding: 0.75rem 0.85rem;
          border-radius: 0.9rem;
          font-size: 0.75rem;
        }

        .explore-guest-note {
          color: #d9ceff;
          border: 1px solid rgba(124,92,255,0.2);
          background: rgba(124,92,255,0.1);
        }

        .explore-error {
          justify-content: space-between;
          color: #ffc2d0;
          border: 1px solid rgba(255,91,132,0.25);
          background: rgba(255,91,132,0.08);
        }

        .explore-error button {
          border: 0;
          color: #d9ceff;
          background: transparent;
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
        }

        .explore-notice {
          justify-content: space-between;
          color: #c9f9ff;
          border: 1px solid rgba(77,215,255,0.2);
          background: rgba(77,215,255,0.08);
        }

        .explore-notice button {
          display: grid;
          place-items: center;
          border: 0;
          color: inherit;
          background: transparent;
          cursor: pointer;
        }

        .explore-section {
          margin-top: 1.45rem;
        }

        .explore-hashtag-section {
          margin-top: 0.75rem;
        }

        .explore-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.7rem;
          margin-bottom: 0.65rem;
        }

        .explore-section-title {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: #b8a9ff;
        }

        .explore-section-title h2 {
          margin: 0;
          color: #edf2ff;
          font-size: 0.92rem;
        }

        .explore-see-all {
          display: inline-flex;
          align-items: center;
          gap: 0.15rem;
          border: 0;
          color: #a99aff;
          background: transparent;
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
        }

        .explore-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.45rem;
        }

        .explore-post-tile {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          padding: 0;
          border: 0;
          border-radius: 0.8rem;
          background: #171e32;
          cursor: pointer;
        }

        .explore-post-tile img,
        .explore-reel-card img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.25s ease;
        }

        .explore-post-tile:hover img,
        .explore-reel-card:hover img {
          transform: scale(1.04);
        }

        .explore-post-placeholder,
        .explore-reel-placeholder {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          color: #b8a9ff;
          background:
            linear-gradient(
              135deg,
              rgba(124,92,255,0.35),
              rgba(77,215,255,0.15)
            ),
            #171e32;
        }

        .explore-tile-overlay {
          position: absolute;
          right: 0.45rem;
          bottom: 0.4rem;
          left: 0.45rem;
          display: flex;
          justify-content: space-between;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          text-shadow: 0 1px 8px rgba(0,0,0,0.7);
        }

        .explore-tile-overlay span {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
        }

        .explore-reel-badge,
        .explore-reel-play {
          position: absolute;
          top: 0.45rem;
          right: 0.45rem;
          display: grid;
          place-items: center;
          width: 1.65rem;
          height: 1.65rem;
          border-radius: 50%;
          color: #fff;
          background: rgba(8,11,19,0.68);
          backdrop-filter: blur(8px);
        }

        .explore-reels-row,
        .explore-creators-row {
          display: flex;
          gap: 0.7rem;
          overflow-x: auto;
          padding: 0.1rem 0.05rem 0.45rem;
          scrollbar-width: none;
        }

        .explore-reels-row::-webkit-scrollbar,
        .explore-creators-row::-webkit-scrollbar {
          display: none;
        }

        .explore-reel-card {
          position: relative;
          width: 8.5rem;
          height: 12rem;
          flex: 0 0 auto;
          overflow: hidden;
          padding: 0;
          border: 0;
          border-radius: 1rem;
          background: #171e32;
          text-align: left;
          cursor: pointer;
        }

        .explore-reel-gradient {
          position: absolute;
          inset: 35% 0 0;
          background: linear-gradient(
            transparent,
            rgba(4,6,12,0.92)
          );
        }

        .explore-reel-play {
          top: 0.55rem;
          right: auto;
          left: 0.55rem;
        }

        .explore-reel-copy {
          position: absolute;
          right: 0.6rem;
          bottom: 0.6rem;
          left: 0.6rem;
          display: grid;
          gap: 0.25rem;
          color: #fff;
        }

        .explore-reel-copy strong {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          font-size: 0.72rem;
          line-height: 1.35;
        }

        .explore-reel-copy small {
          color: #b8c3da;
          font-size: 0.65rem;
        }

        .explore-creator-card {
          width: 9.5rem;
          flex: 0 0 auto;
          display: grid;
          justify-items: center;
          gap: 0.55rem;
          padding: 0.85rem 0.7rem;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 1.1rem;
          background: rgba(17,22,36,0.72);
          box-shadow: 0 14px 35px rgba(0,0,0,0.14);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .explore-creator-profile {
          display: grid;
          justify-items: center;
          gap: 0.22rem;
          width: 100%;
          padding: 0;
          border: 0;
          color: inherit;
          background: transparent;
          text-align: center;
          cursor: pointer;
        }

        .explore-creator-profile strong {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.76rem;
        }

        .explore-creator-profile span {
          max-width: 100%;
          overflow: hidden;
          color: #8996b1;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.65rem;
        }

        .explore-avatar {
          display: block;
          border-radius: 50%;
          object-fit: cover;
          background: #202a43;
        }

        .explore-avatar-normal {
          width: 2.7rem;
          height: 2.7rem;
        }

        .explore-avatar-large {
          width: 3.35rem;
          height: 3.35rem;
        }

        .explore-avatar-fallback {
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #4dd7ff
          );
          font-weight: 900;
        }

        .explore-follow-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          width: 100%;
          min-height: 2rem;
          border: 1px solid rgba(124,92,255,0.3);
          border-radius: 999px;
          color: #fff;
          background: rgba(124,92,255,0.16);
          font-size: 0.67rem;
          font-weight: 850;
          cursor: pointer;
        }

        .explore-follow-button.is-following {
          border-color: rgba(77,215,255,0.23);
          color: #c9f9ff;
          background: rgba(77,215,255,0.1);
        }

        .explore-follow-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .explore-hashtags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .explore-hashtag-chip {
          min-height: 2rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid rgba(124,92,255,0.25);
          border-radius: 999px;
          color: #dcd5ff;
          background: rgba(124,92,255,0.1);
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
        }

        .explore-hashtag-chip:hover {
          background: rgba(124,92,255,0.2);
        }

        .explore-empty,
        .explore-searching {
          display: grid;
          justify-items: center;
          gap: 0.45rem;
          padding: 2.6rem 1rem;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1.1rem;
          color: #8d9abb;
          background: rgba(17,22,36,0.6);
          text-align: center;
        }

        .explore-empty h2 {
          margin: 0.25rem 0 0;
          color: #edf2ff;
          font-size: 0.95rem;
        }

        .explore-empty p {
          margin: 0;
          font-size: 0.76rem;
        }

        .explore-load-more {
          min-height: 3rem;
          display: grid;
          place-items: center;
          color: #697691;
          font-size: 0.72rem;
        }

        .explore-skeleton-tile {
          aspect-ratio: 1;
          border-radius: 0.8rem;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.05),
            rgba(255,255,255,0.11),
            rgba(255,255,255,0.05)
          );
          background-size: 220% 100%;
          animation: explore-skeleton 1.4s infinite;
        }

        .explore-prompt-backdrop {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 1rem;
          background: rgba(3,5,10,0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .explore-signin-prompt {
          position: relative;
          width: min(100%, 380px);
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 1.4rem;
          background: rgba(14,18,31,0.98);
          box-shadow: 0 25px 80px rgba(0,0,0,0.45);
          text-align: center;
        }

        .explore-prompt-close {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          display: grid;
          place-items: center;
          border: 0;
          color: #98a5c2;
          background: transparent;
          cursor: pointer;
        }

        .explore-prompt-icon {
          width: 3.6rem;
          height: 3.6rem;
          display: grid;
          place-items: center;
          margin: 0 auto 0.8rem;
          border-radius: 1.15rem;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #4dd7ff
          );
        }

        .explore-signin-prompt h2 {
          margin: 0;
          font-size: 1.05rem;
        }

        .explore-signin-prompt p {
          margin: 0.55rem 0 1.2rem;
          color: #98a5c2;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        .explore-primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          min-height: 2.7rem;
          padding: 0.7rem 1rem;
          border: 0;
          border-radius: 999px;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #4dd7ff
          );
          font-size: 0.78rem;
          font-weight: 850;
          cursor: pointer;
        }

        .explore-spin {
          animation: explore-spin 0.9s linear infinite;
        }

        @keyframes explore-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes explore-skeleton {
          to {
            background-position: -220% 0;
          }
        }

        @media (max-width: 560px) {
          .explore-content {
            padding-right: 0.75rem;
            padding-left: 0.75rem;
          }

          .explore-grid {
            gap: 0.3rem;
          }

          .explore-reel-card {
            width: 7.9rem;
            height: 11.2rem;
          }

          .explore-creator-card {
            width: 8.9rem;
          }
        }
      `}</style>
    </div>
  );
}