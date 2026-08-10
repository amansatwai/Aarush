import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  RefreshCw,
  Search,
  UserMinus,
  UserRound,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { getFollowing, unfollowUser } from "../utils/followEngine";

const PAGE_SIZE = 30;

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
    'Aarush user'
  );
}

function getInitial(profile) {
  return getDisplayName(profile)
    .charAt(0)
    .toUpperCase();
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function FollowingAvatar({ profile }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={getDisplayName(profile)}
        className="following-avatar"
      />
    );
  }

  return (
    <div className="following-avatar following-avatar-fallback">
      {getInitial(profile)}
    </div>
  );
}

function SignInPrompt({ onSignIn }) {
  return (
    <section className="following-signin-card">
      <div className="following-signin-icon">
        <UserRound size={26} />
      </div>

      <h2>Sign in to see your following</h2>

      <p>
        Create or sign in to your Aarush account to
        manage the people you follow.
      </p>

      <button
        type="button"
        className="following-primary-button"
        onClick={onSignIn}
      >
        Sign in to continue
      </button>
    </section>
  );
}

function LoadingCard() {
  return (
    <div className="following-user-card following-loading-card">
      <div className="following-skeleton following-skeleton-avatar" />

      <div className="following-skeleton-copy">
        <div className="following-skeleton following-skeleton-name" />
        <div className="following-skeleton following-skeleton-username" />
      </div>

      <div className="following-skeleton following-skeleton-button" />
    </div>
  );
}

export default function FollowingPage() {
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);
  const isLoadingMoreRef = useRef(false);
  const touchStartYRef = useRef(null);

  const guest = isGuestMode();

  const [following, setFollowing] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(!guest);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [unfollowingId, setUnfollowingId] =
    useState(null);

  const loadFollowing = useCallback(
    async ({ refresh = false } = {}) => {
      if (guest) {
        setLoading(false);
        return;
      }

      try {
        setError('');

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const profiles = await getFollowing(
          undefined,
          {
            page: 0,
            pageSize: PAGE_SIZE,
          }
        );

        setFollowing(profiles || []);
        setPage(0);
        setHasMore(
          (profiles || []).length === PAGE_SIZE
        );
      } catch (loadError) {
        setError(
          loadError?.message ||
            'Unable to load following.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [guest]
  );

  const loadMore = useCallback(async () => {
    if (
      guest ||
      isLoadingMoreRef.current ||
      loadingMore ||
      !hasMore
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;

      const profiles = await getFollowing(
        undefined,
        {
          page: nextPage,
          pageSize: PAGE_SIZE,
        }
      );

      const nextProfiles = profiles || [];

      setFollowing((current) => {
        const existingIds = new Set(
          current.map((profile) => profile.id)
        );

        return [
          ...current,
          ...nextProfiles.filter(
            (profile) =>
              !existingIds.has(profile.id)
          ),
        ];
      });

      setPage(nextPage);
      setHasMore(
        nextProfiles.length === PAGE_SIZE
      );
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load more following.'
      );
    } finally {
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [
    guest,
    hasMore,
    loadingMore,
    page,
  ]);

  useEffect(() => {
    loadFollowing();
  }, [loadFollowing]);

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node || guest) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: '360px',
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [guest, loadMore]);

  const handleTouchStart = (event) => {
    touchStartYRef.current =
      event.touches[0]?.clientY || null;
  };

  const handleTouchEnd = (event) => {
    const startY = touchStartYRef.current;
    const endY = event.changedTouches[0]?.clientY;

    touchStartYRef.current = null;

    if (
      startY === null ||
      endY === undefined ||
      startY > 100 ||
      endY - startY < 90 ||
      refreshing ||
      loading
    ) {
      return;
    }

    loadFollowing({ refresh: true });
  };

  const handleUnfollow = async (profile) => {
    if (!profile?.id || unfollowingId) {
      return;
    }

    const name = getDisplayName(profile);
    const confirmed = window.confirm(
      `Unfollow ${name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUnfollowingId(profile.id);
      setError('');

      await unfollowUser(profile.id);

      setFollowing((current) =>
        current.filter(
          (item) => item.id !== profile.id
        )
      );
    } catch (unfollowError) {
      setError(
        unfollowError?.message ||
          'Unable to unfollow this account.'
      );
    } finally {
      setUnfollowingId(null);
    }
  };

  const openProfile = (profile) => {
    if (!profile?.username) {
      return;
    }

    navigate(`/profile/${profile.username}`);
  };

  const normalizedSearch = search
    .trim()
    .toLowerCase();

  const filteredFollowing = following.filter(
    (profile) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        profile?.full_name,
        profile?.username,
        profile?.profession,
        profile?.location,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    }
  );

  return (
    <div
      className="social-page following-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <TopBar />

      <main className="following-content">
        <header className="following-header">
          <button
            type="button"
            className="following-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="following-eyebrow">
              Social
            </p>
            <h1>Following</h1>
          </div>

          <button
            type="button"
            className="following-icon-button"
            onClick={() =>
              loadFollowing({ refresh: true })
            }
            disabled={refreshing || guest}
            aria-label="Refresh following"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? 'following-spin'
                  : undefined
              }
            />
          </button>
        </header>

        {guest ? (
          <SignInPrompt
            onSignIn={() => navigate('/login')}
          />
        ) : (
          <>
            <label className="following-search">
              <Search size={17} />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search following"
                aria-label="Search following"
              />

              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              ) : null}
            </label>

            {refreshing ? (
              <div className="following-refresh-indicator">
                <RefreshCw
                  size={14}
                  className="following-spin"
                />
                Refreshing…
              </div>
            ) : null}

            {error ? (
              <div
                className="following-error"
                role="alert"
              >
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() =>
                    loadFollowing({ refresh: true })
                  }
                >
                  Try again
                </button>
              </div>
            ) : null}

            <div className="following-summary">
              <div>
                <strong>
                  {filteredFollowing.length}
                </strong>
                <span>
                  {search
                    ? 'matching accounts'
                    : 'accounts you follow'}
                </span>
              </div>

              <span className="following-summary-hint">
                Pull down to refresh
              </span>
            </div>

            {loading ? (
              <div className="following-list">
                {[1, 2, 3, 4].map((item) => (
                  <LoadingCard key={item} />
                ))}
              </div>
            ) : filteredFollowing.length === 0 ? (
              <section className="following-empty">
                <div className="following-empty-icon">
                  {search ? (
                    <Search size={24} />
                  ) : (
                    <UserRound size={24} />
                  )}
                </div>

                <h2>
                  {search
                    ? 'No accounts found'
                    : 'Not following anyone yet'}
                </h2>

                <p>
                  {search
                    ? 'Try another name or username.'
                    : 'Discover creators and people to follow on Aarush.'}
                </p>

                <button
                  type="button"
                  className="following-primary-button"
                  onClick={() =>
                    navigate('/search')
                  }
                >
                  Discover people
                </button>
              </section>
            ) : (
              <section className="following-list">
                {filteredFollowing.map((profile) => {
                  const isUnfollowing =
                    unfollowingId === profile.id;

                  return (
                    <article
                      className="following-user-card"
                      key={profile.id}
                    >
                      <button
                        type="button"
                        className="following-profile-button"
                        onClick={() =>
                          openProfile(profile)
                        }
                      >
                        <FollowingAvatar
                          profile={profile}
                        />

                        <span className="following-profile-copy">
                          <strong>
                            {getDisplayName(profile)}
                          </strong>

                          <span>
                            {profile?.username
                              ? `@${profile.username}`
                              : 'Aarush member'}
                          </span>

                          {profile?.profession ||
                          profile?.location ? (
                            <small>
                              {[
                                profile.profession,
                                profile.location,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </small>
                          ) : profile?.created_at ? (
                            <small>
                              On Aarush since{' '}
                              {formatDate(
                                profile.created_at
                              )}
                            </small>
                          ) : null}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="following-unfollow-button"
                        onClick={() =>
                          handleUnfollow(profile)
                        }
                        disabled={isUnfollowing}
                      >
                        <UserMinus size={16} />
                        <span>
                          {isUnfollowing
                            ? 'Removing…'
                            : 'Following'}
                        </span>
                      </button>
                    </article>
                  );
                })}

                <div
                  ref={loadMoreRef}
                  className="following-load-more"
                >
                  {loadingMore
                    ? 'Loading more…'
                    : hasMore
                      ? 'Scroll for more'
                      : 'You are all caught up'}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <BottomNav />

      <style>{`
        .following-page {
          min-height: 100vh;
          color: #f4f7ff;
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(124,92,255,0.2),
              transparent 35%
            ),
            radial-gradient(
              circle at 100% 18%,
              rgba(77,215,255,0.1),
              transparent 30%
            ),
            #080b13;
        }

        .following-content {
          width: min(100%, 760px);
          margin: 0 auto;
          padding: 1rem 1rem 7rem;
        }

        .following-header {
          display: grid;
          grid-template-columns: 2.5rem 1fr 2.5rem;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .following-header h1 {
          margin: 0;
          font-size: 1.35rem;
          letter-spacing: -0.03em;
        }

        .following-eyebrow {
          margin: 0 0 0.2rem;
          color: #8d9abb;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .following-icon-button {
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

        .following-icon-button:last-child {
          justify-self: end;
        }

        .following-icon-button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .following-search {
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

        .following-search input {
          width: 100%;
          border: 0;
          outline: 0;
          color: #f4f7ff;
          background: transparent;
          font: inherit;
          font-size: 0.8rem;
        }

        .following-search input::placeholder {
          color: #697691;
        }

        .following-search button {
          display: grid;
          place-items: center;
          border: 0;
          color: #aab6d0;
          background: transparent;
          cursor: pointer;
        }

        .following-refresh-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          margin: 0.1rem 0 0.7rem;
          color: #9f92ff;
          font-size: 0.7rem;
        }

        .following-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.8rem;
          padding: 0.75rem 0.85rem;
          border: 1px solid rgba(255,91,132,0.25);
          border-radius: 0.9rem;
          color: #ffc2d0;
          background: rgba(255,91,132,0.08);
          font-size: 0.75rem;
        }

        .following-error button {
          border: 0;
          color: #e2d9ff;
          background: transparent;
          font-size: 0.7rem;
          font-weight: 850;
          cursor: pointer;
        }

        .following-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin: 0.35rem 0 0.65rem;
          padding: 0.2rem;
        }

        .following-summary > div {
          display: grid;
          gap: 0.2rem;
        }

        .following-summary strong {
          color: #edf2ff;
          font-size: 0.82rem;
        }

        .following-summary span {
          color: #7f8ca8;
          font-size: 0.68rem;
        }

        .following-summary-hint {
          text-align: right;
        }

        .following-list {
          display: grid;
          gap: 0.65rem;
        }

        .following-user-card,
        .following-empty,
        .following-signin-card {
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(17,22,36,0.72);
          box-shadow: 0 18px 50px rgba(0,0,0,0.16);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .following-user-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          min-height: 4.9rem;
          padding: 0.85rem;
          border-radius: 1.15rem;
        }

        .following-profile-button {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0;
          border: 0;
          color: inherit;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .following-avatar {
          width: 3rem;
          height: 3rem;
          flex: 0 0 auto;
          border-radius: 1rem;
          object-fit: cover;
          background: #202a43;
        }

        .following-avatar-fallback {
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

        .following-profile-copy {
          min-width: 0;
          display: grid;
          gap: 0.16rem;
        }

        .following-profile-copy strong,
        .following-profile-copy span,
        .following-profile-copy small {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .following-profile-copy strong {
          color: #f4f7ff;
          font-size: 0.86rem;
        }

        .following-profile-copy span {
          color: #9ca9c4;
          font-size: 0.74rem;
        }

        .following-profile-copy small {
          color: #687590;
          font-size: 0.66rem;
        }

        .following-unfollow-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          flex: 0 0 auto;
          min-height: 2.3rem;
          padding: 0.55rem 0.7rem;
          border: 1px solid rgba(124,92,255,0.3);
          border-radius: 0.8rem;
          color: #e4dcff;
          background: rgba(124,92,255,0.12);
          font-size: 0.7rem;
          font-weight: 850;
          cursor: pointer;
        }

        .following-unfollow-button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .following-load-more {
          min-height: 3.5rem;
          display: grid;
          place-items: center;
          color: #697691;
          font-size: 0.7rem;
        }

        .following-empty,
        .following-signin-card {
          display: grid;
          justify-items: center;
          padding: 2.5rem 1.25rem;
          border-radius: 1.3rem;
          text-align: center;
        }

        .following-empty-icon,
        .following-signin-icon {
          width: 3.4rem;
          height: 3.4rem;
          display: grid;
          place-items: center;
          margin-bottom: 0.9rem;
          border-radius: 1.1rem;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #4dd7ff
          );
        }

        .following-empty h2,
        .following-signin-card h2 {
          margin: 0;
          font-size: 1rem;
        }

        .following-empty p,
        .following-signin-card p {
          max-width: 23rem;
          margin: 0.45rem 0 0;
          color: #98a5c2;
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .following-primary-button {
          min-height: 2.65rem;
          margin-top: 1.1rem;
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

        .following-loading-card {
          min-height: 4.9rem;
        }

        .following-skeleton {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.05),
            rgba(255,255,255,0.12),
            rgba(255,255,255,0.05)
          );
          background-size: 220% 100%;
          animation: following-skeleton 1.4s infinite;
        }

        .following-skeleton-avatar {
          width: 3rem;
          height: 3rem;
          flex: 0 0 auto;
          border-radius: 1rem;
        }

        .following-skeleton-copy {
          flex: 1;
          display: grid;
          gap: 0.5rem;
        }

        .following-skeleton-name {
          width: 42%;
          height: 0.7rem;
          border-radius: 999px;
        }

        .following-skeleton-username {
          width: 28%;
          height: 0.55rem;
          border-radius: 999px;
        }

        .following-skeleton-button {
          width: 5.4rem;
          height: 2.3rem;
          border-radius: 0.8rem;
        }

        .following-spin {
          animation: following-spin 0.9s linear infinite;
        }

        @keyframes following-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes following-skeleton {
          to {
            background-position: -220% 0;
          }
        }

        @media (max-width: 560px) {
          .following-content {
            padding-right: 0.75rem;
            padding-left: 0.75rem;
          }

          .following-user-card {
            align-items: flex-start;
          }

          .following-unfollow-button span {
            display: none;
          }

          .following-unfollow-button {
            width: 2.3rem;
            padding: 0;
          }

          .following-summary-hint {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}