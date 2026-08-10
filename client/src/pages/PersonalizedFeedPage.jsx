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
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  getPersonalizedFeed,
  getRecommendedCreators,
  getRecommendedHashtags,
  getRecommendedReels,
  getRecommendedStories,
  recordSearchSignal,
  recordScrollSignal,
  subscribeToRecommendationUpdates,
} from '../utils/recommendationEngine';
import { followUser } from '../engine/followEngine';

const PAGE_SIZE = 18;

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

function getImage(item) {
  return (
    item?.thumbnail_url ||
    item?.cover_url ||
    item?.image_url ||
    item?.media_url ||
    item?.video_url ||
    null
  );
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

function Avatar({ profile }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={getDisplayName(profile)}
        className="personalized-avatar"
      />
    );
  }

  return (
    <div className="personalized-avatar personalized-avatar-fallback">
      {getInitial(profile)}
    </div>
  );
}

function SectionHeader({ title, icon }) {
  return (
    <div className="personalized-section-header">
      <div>
        {icon}
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function ContentTile({ item, onOpen }) {
  const image = getImage(item);
  const title =
    item?.caption ||
    item?.title ||
    item?.description ||
    'Recommended for you';

  return (
    <button
      type="button"
      className="personalized-content-tile"
      onClick={() => onOpen(item)}
    >
      {image ? (
        <img
          src={image}
          alt={title}
          loading="lazy"
        />
      ) : (
        <span className="personalized-content-placeholder">
          <Sparkles size={24} />
        </span>
      )}

      <span className="personalized-content-overlay">
        <span>
          <Heart size={13} fill="currentColor" />
          {formatCount(
            item?.likes_count ||
              item?.like_count ||
              item?.likes
          )}
        </span>

        {item?.is_reel ? (
          <Play size={14} fill="currentColor" />
        ) : null}
      </span>
    </button>
  );
}

function CreatorCard({
  creator,
  followed,
  busy,
  onFollow,
  onOpen,
}) {
  return (
    <article className="personalized-creator-card">
      <button
        type="button"
        className="personalized-creator-profile"
        onClick={() => onOpen(creator)}
      >
        <Avatar profile={creator} />
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
          followed
            ? 'personalized-follow-button is-following'
            : 'personalized-follow-button'
        }
        onClick={() => onFollow(creator)}
        disabled={busy || followed}
      >
        {followed ? (
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

function StoryCard({ story, onOpen }) {
  return (
    <button
      type="button"
      className="personalized-story-card"
      onClick={() => onOpen(story)}
    >
      <Avatar
        profile={story?.profile || story?.creator}
      />
      <span>
        {getDisplayName(
          story?.profile || story?.creator
        )}
      </span>
    </button>
  );
}

function SkeletonGrid({ count = 6 }) {
  return (
    <div className="personalized-grid">
      {Array.from({ length: count }).map(
        (_, index) => (
          <div
            className="personalized-skeleton-tile"
            key={index}
          />
        )
      )}
    </div>
  );
}

export default function PersonalizedFeedPage() {
  const navigate = useNavigate();
  const guest = isGuestMode();
  const loadMoreRef = useRef(null);
  const loadingRef = useRef(false);
  const searchTimerRef = useRef(null);

  const [feed, setFeed] = useState([]);
  const [reels, setReels] = useState([]);
  const [creators, setCreators] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [stories, setStories] = useState([]);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] =
    useState(false);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [followBusyId, setFollowBusyId] =
    useState(null);
  const [followedIds, setFollowedIds] =
    useState(new Set());

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
          feedResult,
          reelResult,
          creatorResult,
          hashtagResult,
          storyResult,
        ] = await Promise.all([
          getPersonalizedFeed({
            page: 0,
            pageSize: PAGE_SIZE,
          }),
          getRecommendedReels({
            page: 0,
            pageSize: 8,
          }),
          getRecommendedCreators({
            page: 0,
            pageSize: 10,
          }),
          getRecommendedHashtags({
            page: 0,
            pageSize: 16,
          }),
          getRecommendedStories({
            page: 0,
            pageSize: 10,
          }),
        ]);

        setFeed(feedResult.items || []);
        setReels(reelResult.items || []);
        setCreators(creatorResult.items || []);
        setHashtags(
          (hashtagResult.items || []).map(
            (item) => item.tag || item
          )
        );
        setStories(storyResult.items || []);
        setPage(0);
        setHasMore(Boolean(feedResult.hasMore));

        if (feedResult.personalized) {
          setNotice(
            feedResult.interests?.length
              ? `Personalized for ${feedResult.interests
                  .slice(0, 3)
                  .join(', ')}`
              : 'Your recommendations are ready.'
          );
        }
      } catch (loadError) {
        setError(
          loadError?.message ||
            'Unable to load your recommendations.'
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

    const unsubscribe =
      subscribeToRecommendationUpdates(() => {
        loadInitial({ refresh: true });
      });

    return unsubscribe;
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (
      loadingRef.current ||
      loadingMore ||
      !hasMore
    ) {
      return;
    }

    loadingRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const result = await getPersonalizedFeed({
        page: nextPage,
        pageSize: PAGE_SIZE,
      });

      setFeed((current) => [
        ...current,
        ...(result.items || []),
      ]);
      setPage(nextPage);
      setHasMore(Boolean(result.hasMore));

      recordScrollSignal({
        page: nextPage,
        source: 'personalized-feed',
      }).catch(() => {});
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load more recommendations.'
      );
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, page]);

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

  useEffect(() => {
    clearTimeout(searchTimerRef.current);

    if (!search.trim()) {
      return undefined;
    }

    searchTimerRef.current = setTimeout(() => {
      recordSearchSignal(search.trim()).catch(
        () => {}
      );
    }, 500);

    return () => clearTimeout(searchTimerRef.current);
  }, [search]);

  const handleFollow = async (creator) => {
    if (guest) {
      navigate('/login');
      return;
    }

    if (!creator?.id || followBusyId) {
      return;
    }

    try {
      setFollowBusyId(creator.id);

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

  const openCreator = (creator) => {
    if (!creator?.username) {
      return;
    }

    navigate(`/profile/${creator.username}`);
  };

  const openContent = (item) => {
    if (!item?.id) {
      return;
    }

    if (item.is_reel) {
      navigate(`/reels?post=${item.id}`);
    } else {
      navigate(`/post/${item.id}`);
    }
  };

  const openStory = (story) => {
    if (!story?.id) {
      return;
    }

    navigate(`/stories?story=${story.id}`);
  };

  const filteredFeed = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return feed;
    }

    return feed.filter((item) =>
      [
        item.caption,
        item.title,
        item.description,
        item.location,
        ...(item.hashtags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [feed, search]);

  return (
    <div className="social-page personalized-feed-page">
      <TopBar />

      <main className="personalized-content">
        <header className="personalized-header">
          <div>
            <p className="personalized-eyebrow">
              Your space
            </p>
            <h1>For you</h1>
          </div>

          <button
            type="button"
            className="personalized-refresh"
            onClick={() =>
              loadInitial({ refresh: true })
            }
            disabled={refreshing}
            aria-label="Refresh recommendations"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? 'personalized-spin'
                  : undefined
              }
            />
          </button>
        </header>

        <label className="personalized-search">
          <Search size={17} />
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search your recommendations"
          />
        </label>

        {guest ? (
          <div className="personalized-guest-note">
            <Sparkles size={16} />
            <span>
              Guest mode shows trending content. Sign in
              to unlock recommendations based on your
              interests.
            </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          </div>
        ) : null}

        {error ? (
          <div
            className="personalized-error"
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
          <div className="personalized-notice">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice('')}
            >
              ×
            </button>
          </div>
        ) : null}

        {loading ? (
          <SkeletonGrid count={12} />
        ) : (
          <>
            {stories.length ? (
              <section className="personalized-section">
                <SectionHeader
                  title="Suggested stories"
                  icon={<Sparkles size={17} />}
                />

                <div className="personalized-stories">
                  {stories.map((story) => (
                    <StoryCard
                      story={story}
                      onOpen={openStory}
                      key={story.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {reels.length ? (
              <section className="personalized-section">
                <SectionHeader
                  title="Recommended reels"
                  icon={<Play size={17} />}
                />

                <div className="personalized-reels">
                  {reels.map((reel) => (
                    <ContentTile
                      item={reel}
                      onOpen={openContent}
                      key={reel.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {creators.length ? (
              <section className="personalized-section">
                <SectionHeader
                  title={
                    guest
                      ? 'Popular creators'
                      : 'Similar creators'
                  }
                  icon={<Users size={17} />}
                />

                <div className="personalized-creators">
                  {creators.map((creator) => (
                    <CreatorCard
                      creator={creator}
                      followed={followedIds.has(
                        creator.id
                      )}
                      busy={
                        followBusyId === creator.id
                      }
                      onFollow={handleFollow}
                      onOpen={openCreator}
                      key={creator.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {hashtags.length ? (
              <section className="personalized-section">
                <SectionHeader
                  title="Trending in your interests"
                  icon={<Sparkles size={17} />}
                />

                <div className="personalized-hashtags">
                  {hashtags.map((tag) => (
                    <button
                      type="button"
                      className="personalized-hashtag"
                      onClick={() =>
                        setSearch(tag)
                      }
                      key={tag}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="personalized-section">
              <SectionHeader
                title={
                  guest
                    ? 'Trending for everyone'
                    : 'Recommended for you'
                }
                icon={<Heart size={17} />}
              />

              {filteredFeed.length ? (
                <div className="personalized-grid">
                  {filteredFeed.map((item) => (
                    <ContentTile
                      item={item}
                      onOpen={openContent}
                      key={item.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="personalized-empty">
                  <Sparkles size={27} />
                  <h2>
                    {search
                      ? 'No matching recommendations'
                      : 'Your feed is warming up'}
                  </h2>
                  <p>
                    Interact with posts, reels, and
                    creators to improve your recommendations.
                  </p>
                </div>
              )}
            </section>

            <div
              ref={loadMoreRef}
              className="personalized-load-more"
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

      <style>{`
        .personalized-feed-page {
          min-height: 100vh;
          color: #f4f7ff;
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(124,92,255,0.2),
              transparent 34%
            ),
            radial-gradient(
              circle at 100% 18%,
              rgba(77,215,255,0.1),
              transparent 30%
            ),
            #080b13;
        }

        .personalized-content {
          width: min(100%, 1000px);
          margin: 0 auto;
          padding: 1rem 1rem 7rem;
        }

        .personalized-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .personalized-eyebrow {
          margin: 0 0 0.2rem;
          color: #8d9abb;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .personalized-header h1 {
          margin: 0;
          font-size: 1.5rem;
          letter-spacing: -0.04em;
        }

        .personalized-refresh {
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

        .personalized-refresh:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .personalized-search {
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
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .personalized-search input {
          width: 100%;
          border: 0;
          outline: 0;
          color: #f4f7ff;
          background: transparent;
          font: inherit;
          font-size: 0.8rem;
        }

        .personalized-search input::placeholder {
          color: #697691;
        }

        .personalized-guest-note,
        .personalized-error,
        .personalized-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.8rem;
          padding: 0.75rem 0.85rem;
          border-radius: 0.9rem;
          font-size: 0.74rem;
        }

        .personalized-guest-note {
          color: #d9ceff;
          border: 1px solid rgba(124,92,255,0.22);
          background: rgba(124,92,255,0.1);
        }

        .personalized-guest-note span {
          flex: 1;
        }

        .personalized-guest-note button,
        .personalized-error button,
        .personalized-notice button {
          border: 0;
          color: inherit;
          background: transparent;
          font-size: 0.7rem;
          font-weight: 850;
          cursor: pointer;
        }

        .personalized-error {
          justify-content: space-between;
          color: #ffc2d0;
          border: 1px solid rgba(255,91,132,0.25);
          background: rgba(255,91,132,0.08);
        }

        .personalized-notice {
          justify-content: space-between;
          color: #c9f9ff;
          border: 1px solid rgba(77,215,255,0.2);
          background: rgba(77,215,255,0.08);
        }

        .personalized-section {
          margin-top: 1.4rem;
        }

        .personalized-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.65rem;
        }

        .personalized-section-header > div {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: #b8a9ff;
        }

        .personalized-section-header h2 {
          margin: 0;
          color: #edf2ff;
          font-size: 0.92rem;
        }

        .personalized-stories,
        .personalized-creators,
        .personalized-reels {
          display: flex;
          gap: 0.65rem;
          overflow-x: auto;
          padding: 0.1rem 0.05rem 0.45rem;
          scrollbar-width: none;
        }

        .personalized-stories::-webkit-scrollbar,
        .personalized-creators::-webkit-scrollbar,
        .personalized-reels::-webkit-scrollbar {
          display: none;
        }

        .personalized-story-card {
          display: grid;
          flex: 0 0 4.5rem;
          justify-items: center;
          gap: 0.35rem;
          padding: 0;
          border: 0;
          color: #eaf0ff;
          background: transparent;
          text-align: center;
          cursor: pointer;
        }

        .personalized-story-card span {
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.64rem;
        }

        .personalized-avatar {
          width: 3.3rem;
          height: 3.3rem;
          display: block;
          border: 2px solid #9b7cff;
          border-radius: 50%;
          object-fit: cover;
          background: #202a43;
        }

        .personalized-avatar-fallback {
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

        .personalized-creator-card {
          width: 9.6rem;
          flex: 0 0 auto;
          display: grid;
          justify-items: center;
          gap: 0.55rem;
          padding: 0.85rem 0.7rem;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 1.1rem;
          background: rgba(17,22,36,0.72);
          box-shadow: 0 15px 35px rgba(0,0,0,0.14);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .personalized-creator-profile {
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

        .personalized-creator-profile strong,
        .personalized-creator-profile span {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .personalized-creator-profile strong {
          font-size: 0.76rem;
        }

        .personalized-creator-profile span {
          color: #8996b1;
          font-size: 0.65rem;
        }

        .personalized-follow-button {
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

        .personalized-follow-button.is-following {
          border-color: rgba(77,215,255,0.24);
          color: #c9f9ff;
          background: rgba(77,215,255,0.1);
        }

        .personalized-follow-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .personalized-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.45rem;
        }

        .personalized-content-tile {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          padding: 0;
          border: 0;
          border-radius: 0.8rem;
          background: #171e32;
          cursor: pointer;
        }

        .personalized-content-tile img,
        .personalized-content-placeholder {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          object-fit: cover;
        }

        .personalized-content-placeholder {
          color: #b8a9ff;
          background: linear-gradient(
            135deg,
            rgba(124,92,255,0.35),
            rgba(77,215,255,0.15)
          );
        }

        .personalized-content-overlay {
          position: absolute;
          right: 0.4rem;
          bottom: 0.35rem;
          left: 0.4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #fff;
          font-size: 0.64rem;
          font-weight: 800;
          text-shadow: 0 1px 8px rgba(0,0,0,0.8);
        }

        .personalized-content-overlay span {
          display: inline-flex;
          align-items: center;
          gap: 0.18rem;
        }

        .personalized-hashtags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .personalized-hashtag {
          min-height: 2rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid rgba(124,92,255,0.26);
          border-radius: 999px;
          color: #dcd5ff;
          background: rgba(124,92,255,0.1);
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
        }

        .personalized-empty {
          display: grid;
          justify-items: center;
          gap: 0.45rem;
          padding: 2.5rem 1rem;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1.1rem;
          color: #a996ff;
          background: rgba(17,22,36,0.6);
          text-align: center;
        }

        .personalized-empty h2 {
          margin: 0.2rem 0 0;
          color: #edf2ff;
          font-size: 0.95rem;
        }

        .personalized-empty p {
          max-width: 22rem;
          margin: 0;
          color: #8491ad;
          font-size: 0.74rem;
          line-height: 1.5;
        }

        .personalized-load-more {
          min-height: 3.5rem;
          display: grid;
          place-items: center;
          color: #697691;
          font-size: 0.72rem;
        }

        .personalized-skeleton-tile {
          aspect-ratio: 1;
          border-radius: 0.8rem;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.05),
            rgba(255,255,255,0.11),
            rgba(255,255,255,0.05)
          );
          background-size: 220% 100%;
          animation: personalized-skeleton 1.4s infinite;
        }

        .personalized-spin {
          animation: personalized-spin 0.9s linear infinite;
        }

        @keyframes personalized-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes personalized-skeleton {
          to {
            background-position: -220% 0;
          }
        }

        @media (max-width: 560px) {
          .personalized-content {
            padding-right: 0.75rem;
            padding-left: 0.75rem;
          }

          .personalized-grid {
            gap: 0.3rem;
          }

          .personalized-creator-card {
            width: 8.9rem;
          }
        }
      `}</style>
    </div>
  );
}