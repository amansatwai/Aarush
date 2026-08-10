import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ChevronLeft,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import ReelPlayer from '../components/ReelPlayer';
import {
  getRecentReels,
  getTrendingReels,
  subscribeToExploreUpdates,
} from '../utils/exploreEngine';
import {
  followUser,
  isFollowing,
} from '../engine/followEngine';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 10;
const LOAD_AHEAD = 3;

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

function SignInPrompt({ onClose, onSignIn }) {
  return (
    <div
      className="reels-signin-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="reels-signin-prompt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reels-signin-title"
      >
        <button
          type="button"
          className="reels-signin-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="reels-signin-icon">
          <Sparkles size={25} />
        </div>

        <h2 id="reels-signin-title">
          Join the Aarush community
        </h2>

        <p>
          Sign in to like, comment, save, and follow
          creators while watching reels.
        </p>

        <button
          type="button"
          className="reels-signin-button"
          onClick={onSignIn}
        >
          Sign in to continue
        </button>
      </section>
    </div>
  );
}

function ReelSkeleton() {
  return (
    <div className="reel-viewer-skeleton">
      <div className="reel-viewer-skeleton-spinner" />
      <span>Preparing reels…</span>
    </div>
  );
}

export default function ReelsViewerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const guest = isGuestMode();
  const viewerRef = useRef(null);
  const itemRefs = useRef(new Map());
  const touchStartRef = useRef(null);
  const touchCurrentRef = useRef(null);
  const loadingRef = useRef(false);

  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] =
    useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] =
    useState(false);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [showSignIn, setShowSignIn] =
    useState(false);
  const [notice, setNotice] = useState('');
  const [likedIds, setLikedIds] = useState(
    new Set()
  );
  const [savedIds, setSavedIds] = useState(
    new Set()
  );
  const [followedIds, setFollowedIds] =
    useState(new Set());
  const [followingId, setFollowingId] =
    useState(null);

  const requestedReelId =
    searchParams.get('post') ||
    searchParams.get('reel');

  const registerItemRef = useCallback(
    (index, node) => {
      if (node) {
        itemRefs.current.set(index, node);
      } else {
        itemRefs.current.delete(index);
      }
    },
    []
  );

  const loadInitial = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError('');

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [trending, recent] =
          await Promise.all([
            getTrendingReels({
              page: 0,
              pageSize: PAGE_SIZE,
            }),
            getRecentReels({
              page: 0,
              pageSize: PAGE_SIZE,
            }),
          ]);

        const merged = [
          ...(trending.items || []),
          ...(recent.items || []),
        ];

        const unique = [
          ...new Map(
            merged.map((reel) => [
              reel.id,
              reel,
            ])
          ).values(),
        ];

        setReels(unique);
        setPage(0);
        setHasMore(
          Boolean(trending.hasMore || recent.hasMore)
        );

        if (requestedReelId) {
          const requestedIndex = unique.findIndex(
            (reel) => reel.id === requestedReelId
          );

          if (requestedIndex >= 0) {
            setActiveIndex(requestedIndex);

            window.setTimeout(() => {
              itemRefs.current
                .get(requestedIndex)
                ?.scrollIntoView({
                  behavior: 'instant',
                  block: 'center',
                });
            }, 100);
          }
        }
      } catch (loadError) {
        setError(
          loadError?.message ||
            'Unable to load reels right now.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [requestedReelId]
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
    if (
      loadingRef.current ||
      !hasMore ||
      !reels.length
    ) {
      return;
    }

    loadingRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const result = await getTrendingReels({
        page: nextPage,
        pageSize: PAGE_SIZE,
      });

      const nextItems = result.items || [];

      setReels((current) => {
        const merged = [
          ...current,
          ...nextItems,
        ];

        return [
          ...new Map(
            merged.map((reel) => [
              reel.id,
              reel,
            ])
          ).values(),
        ];
      });

      setPage(nextPage);
      setHasMore(Boolean(result.hasMore));
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load more reels.'
      );
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, page, reels.length]);

  useEffect(() => {
    if (activeIndex >= reels.length - LOAD_AHEAD) {
      loadMore();
    }
  }, [activeIndex, loadMore, reels.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const index = Number(
            entry.target.dataset.reelIndex
          );

          if (!Number.isNaN(index)) {
            setActiveIndex(index);
          }
        });
      },
      {
        root: viewerRef.current,
        threshold: 0.72,
      }
    );

    itemRefs.current.forEach((node) => {
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [reels.length]);

  useEffect(() => {
    let mounted = true;

    const loadFollowState = async () => {
      if (guest || !reels.length) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) {
        return;
      }

      const creatorIds = [
        ...new Set(
          reels
            .map(
              (reel) =>
                reel.user_id ||
                reel.author_id ||
                reel.creator?.id ||
                reel.profile?.id
            )
            .filter(Boolean)
        ),
      ];

      const results = await Promise.all(
        creatorIds.map(async (creatorId) => {
          try {
            return {
              id: creatorId,
              following: await isFollowing(
                user.id,
                creatorId
              ),
            };
          } catch {
            return {
              id: creatorId,
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
            .filter((item) => item.following)
            .map((item) => item.id)
        )
      );
    };

    loadFollowState();

    return () => {
      mounted = false;
    };
  }, [guest, reels]);

  const requireSignIn = useCallback(() => {
    if (guest) {
      setShowSignIn(true);
      return true;
    }

    return false;
  }, [guest]);

  const updateLike = useCallback(
    (reel) => {
      if (requireSignIn()) {
        return;
      }

      setLikedIds((current) => {
        const next = new Set(current);

        if (next.has(reel.id)) {
          next.delete(reel.id);
        } else {
          next.add(reel.id);
        }

        return next;
      });

      setReels((current) =>
        current.map((item) => {
          if (item.id !== reel.id) {
            return item;
          }

          const currentLikes = Number(
            item.likes_count ||
              item.like_count ||
              item.likes ||
              0
          );

          const isLiked = likedIds.has(item.id);

          return {
            ...item,
            likes_count: Math.max(
              0,
              currentLikes + (isLiked ? -1 : 1)
            ),
          };
        })
      );

      setNotice('Like updated.');
    },
    [likedIds, requireSignIn]
  );

  const updateSave = useCallback(
    (reel) => {
      if (requireSignIn()) {
        return;
      }

      setSavedIds((current) => {
        const next = new Set(current);

        if (next.has(reel.id)) {
          next.delete(reel.id);
          setNotice('Removed from saved reels.');
        } else {
          next.add(reel.id);
          setNotice('Saved to your reels.');
        }

        return next;
      });
    },
    [requireSignIn]
  );

  const handleFollow = useCallback(
    async (reel) => {
      if (requireSignIn()) {
        return;
      }

      const creatorId =
        reel?.user_id ||
        reel?.author_id ||
        reel?.creator?.id ||
        reel?.profile?.id;

      if (!creatorId || followingId) {
        return;
      }

      try {
        setFollowingId(creatorId);
        await followUser(creatorId);

        setFollowedIds((current) => {
          const next = new Set(current);
          next.add(creatorId);
          return next;
        });

        setNotice('Follow request sent.');
      } catch (followError) {
        setError(
          followError?.message ||
            'Unable to follow this creator.'
        );
      } finally {
        setFollowingId(null);
      }
    },
    [followingId, requireSignIn]
  );

  const handleComment = useCallback(
    (reel) => {
      if (requireSignIn()) {
        return;
      }

      navigate(`/post/${reel.id}?comments=1`);
    },
    [navigate, requireSignIn]
  );

  const handleShare = useCallback(
    async (reel) => {
      if (requireSignIn()) {
        return;
      }

      const shareUrl = `${window.location.origin}/reels?post=${reel.id}`;

      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Watch this reel on Aarush',
            url: shareUrl,
          });
        } else {
          await navigator.clipboard.writeText(
            shareUrl
          );
          setNotice('Reel link copied.');
        }
      } catch {
        // User cancelled the native share sheet.
      }
    },
    [requireSignIn]
  );

  const handleCreatorPress = useCallback(
    (profile) => {
      if (!profile?.username) {
        return;
      }

      navigate(`/profile/${profile.username}`);
    },
    [navigate]
  );

  const handleHashtagPress = useCallback(
    (tag) => {
      navigate(`/search?q=${encodeURIComponent(tag)}`);
    },
    [navigate]
  );

  const handleTouchStart = (event) => {
    const touch = event.touches[0];

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    touchCurrentRef.current = touchStartRef.current;
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];

    touchCurrentRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = () => {
    const start = touchStartRef.current;
    const current = touchCurrentRef.current;

    if (!start || !current) {
      return;
    }

    const deltaY = current.y - start.y;
    const duration = Math.max(
      1,
      current.time - start.time
    );

    const velocity = Math.abs(deltaY) / duration;

    if (
      Math.abs(deltaY) < 45 &&
      velocity < 0.2
    ) {
      return;
    }

    if (deltaY < -55 || (deltaY < 0 && velocity > 0.5)) {
      setActiveIndex((index) =>
        Math.min(index + 1, reels.length - 1)
      );
    } else if (
      deltaY > 55 ||
      (deltaY > 0 && velocity > 0.5)
    ) {
      setActiveIndex((index) =>
        Math.max(index - 1, 0)
      );
    }

    const nextIndex =
      deltaY < 0
        ? Math.min(activeIndex + 1, reels.length - 1)
        : Math.max(activeIndex - 1, 0);

    itemRefs.current.get(nextIndex)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const handleWheel = (event) => {
    if (Math.abs(event.deltaY) < 25) {
      return;
    }

    const direction = event.deltaY > 0 ? 1 : -1;
    const nextIndex = Math.max(
      0,
      Math.min(
        activeIndex + direction,
        reels.length - 1
      )
    );

    if (nextIndex === activeIndex) {
      return;
    }

    setActiveIndex(nextIndex);
    itemRefs.current.get(nextIndex)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const activeReel = useMemo(
    () => reels[activeIndex],
    [activeIndex, reels]
  );

  return (
    <div className="reels-viewer-page">
      <TopBar />

      <main
        ref={viewerRef}
        className="reels-viewer-scroll"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div className="reels-viewer-header">
          <button
            type="button"
            className="reels-viewer-back"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <span>Reels</span>

          <button
            type="button"
            className="reels-viewer-refresh"
            onClick={() =>
              loadInitial({ refresh: true })
            }
            disabled={refreshing}
            aria-label="Refresh reels"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? 'reels-viewer-spin'
                  : undefined
              }
            />
          </button>
        </div>

        {error ? (
          <div className="reels-viewer-error">
            <span>{error}</span>
            <button
              type="button"
              onClick={() =>
                loadInitial({ refresh: true })
              }
            >
              Retry
            </button>
          </div>
        ) : null}

        {notice ? (
          <div className="reels-viewer-notice">
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
          <ReelSkeleton />
        ) : reels.length === 0 ? (
          <div className="reels-viewer-empty">
            <Sparkles size={32} />
            <h1>No reels yet</h1>
            <p>
              New vertical videos will appear here as
              creators share them.
            </p>
            <button
              type="button"
              onClick={() => navigate('/explore')}
            >
              Explore Aarush
            </button>
          </div>
        ) : (
          <div className="reels-viewer-list">
            {reels.map((reel, index) => {
              const creatorId =
                reel?.user_id ||
                reel?.author_id ||
                reel?.creator?.id ||
                reel?.profile?.id;

              const shouldRender =
                Math.abs(index - activeIndex) <= 2;

              return (
                <section
                  key={reel.id}
                  ref={(node) =>
                    registerItemRef(index, node)
                  }
                  data-reel-index={index}
                  className="reels-viewer-item"
                >
                  {shouldRender ? (
                    <ReelPlayer
                      reel={reel}
                      active={index === activeIndex}
                      guest={guest}
                      liked={likedIds.has(reel.id)}
                      saved={savedIds.has(reel.id)}
                      following={followedIds.has(
                        creatorId
                      )}
                      onLike={updateLike}
                      onComment={handleComment}
                      onSave={updateSave}
                      onShare={handleShare}
                      onFollow={handleFollow}
                      onCreatorPress={
                        handleCreatorPress
                      }
                      onHashtagPress={
                        handleHashtagPress
                      }
                      onRequireSignIn={() =>
                        setShowSignIn(true)
                      }
                    />
                  ) : (
                    <div className="reels-viewer-unloaded">
                      <span>Loading next reel…</span>
                    </div>
                  )}
                </section>
              );
            })}

            {loadingMore ? (
              <div className="reels-viewer-loading-more">
                Loading more reels…
              </div>
            ) : null}
          </div>
        )}
      </main>

      <BottomNav />

      {showSignIn ? (
        <SignInPrompt
          onClose={() => setShowSignIn(false)}
          onSignIn={() => navigate('/login')}
        />
      ) : null}

      <style>{`
        .reels-viewer-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          color: #fff;
          background: #05070d;
        }

        .reels-viewer-scroll {
          position: relative;
          height: calc(100vh - 7rem);
          overflow-y: auto;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
          overscroll-behavior-y: contain;
          touch-action: pan-y;
          background: #05070d;
        }

        .reels-viewer-scroll::-webkit-scrollbar {
          display: none;
        }

        .reels-viewer-header {
          position: fixed;
          z-index: 10;
          top: 0.75rem;
          right: 0.9rem;
          left: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: none;
        }

        .reels-viewer-header span {
          position: absolute;
          left: 50%;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 850;
          transform: translateX(-50%);
          text-shadow: 0 1px 8px rgba(0,0,0,0.7);
        }

        .reels-viewer-back,
        .reels-viewer-refresh {
          width: 2.5rem;
          height: 2.5rem;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 50%;
          color: #fff;
          background: rgba(8,11,19,0.45);
          backdrop-filter: blur(12px);
          pointer-events: auto;
          cursor: pointer;
        }

        .reels-viewer-refresh {
          margin-left: auto;
        }

        .reels-viewer-back:disabled,
        .reels-viewer-refresh:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .reels-viewer-list {
          min-height: 100%;
        }

        .reels-viewer-item {
          position: relative;
          height: calc(100vh - 7rem);
          min-height: 31rem;
          scroll-snap-align: center;
          scroll-snap-stop: always;
        }

        .reels-viewer-unloaded {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          color: #8794af;
          background:
            radial-gradient(
              circle at 50% 35%,
              rgba(124,92,255,0.15),
              transparent 35%
            ),
            #05070d;
          font-size: 0.76rem;
        }

        .reels-viewer-skeleton {
          height: calc(100vh - 7rem);
          min-height: 31rem;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 0.65rem;
          color: #98a5c2;
          background:
            linear-gradient(
              120deg,
              rgba(124,92,255,0.12),
              rgba(77,215,255,0.08),
              rgba(5,7,13,1)
            );
          font-size: 0.75rem;
        }

        .reel-viewer-skeleton-spinner {
          width: 2.6rem;
          height: 2.6rem;
          border: 3px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: reels-viewer-spin 0.8s linear infinite;
        }

        .reels-viewer-error,
        .reels-viewer-notice {
          position: fixed;
          z-index: 20;
          top: 4.4rem;
          right: 1rem;
          left: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.7rem;
          padding: 0.75rem 0.85rem;
          border-radius: 0.85rem;
          font-size: 0.74rem;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .reels-viewer-error {
          border: 1px solid rgba(255,91,132,0.3);
          color: #ffc2d0;
          background: rgba(55,17,33,0.86);
        }

        .reels-viewer-notice {
          border: 1px solid rgba(77,215,255,0.25);
          color: #c9f9ff;
          background: rgba(12,45,55,0.86);
        }

        .reels-viewer-error button,
        .reels-viewer-notice button {
          border: 0;
          color: inherit;
          background: transparent;
          font-weight: 850;
          cursor: pointer;
        }

        .reels-viewer-empty {
          height: calc(100vh - 7rem);
          display: grid;
          place-items: center;
          align-content: center;
          gap: 0.55rem;
          padding: 2rem;
          color: #a996ff;
          text-align: center;
        }

        .reels-viewer-empty h1 {
          margin: 0.2rem 0 0;
          color: #f4f7ff;
          font-size: 1.15rem;
        }

        .reels-viewer-empty p {
          max-width: 20rem;
          margin: 0;
          color: #8e9bb7;
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .reels-viewer-empty button {
          min-height: 2.6rem;
          margin-top: 0.7rem;
          padding: 0.7rem 1rem;
          border: 0;
          border-radius: 999px;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #4dd7ff
          );
          font-size: 0.76rem;
          font-weight: 850;
          cursor: pointer;
        }

        .reels-viewer-loading-more {
          min-height: 4rem;
          display: grid;
          place-items: center;
          color: #7886a4;
          background: #05070d;
          font-size: 0.72rem;
        }

        .reels-signin-backdrop {
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

        .reels-signin-prompt {
          position: relative;
          width: min(100%, 380px);
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 1.4rem;
          background: rgba(14,18,31,0.98);
          box-shadow: 0 25px 80px rgba(0,0,0,0.45);
          text-align: center;
        }

        .reels-signin-close {
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

        .reels-signin-icon {
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

        .reels-signin-prompt h2 {
          margin: 0;
          font-size: 1.05rem;
        }

        .reels-signin-prompt p {
          margin: 0.55rem 0 1.2rem;
          color: #98a5c2;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        .reels-signin-button {
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

        .reels-viewer-spin {
          animation: reels-viewer-spin 0.9s linear infinite;
        }

        @keyframes reels-viewer-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 560px) {
          .reels-viewer-scroll,
          .reels-viewer-item,
          .reels-viewer-skeleton {
            height: calc(100vh - 6rem);
          }

          .reels-viewer-item {
            min-height: 30rem;
          }
        }
      `}</style>
    </div>
  );
}