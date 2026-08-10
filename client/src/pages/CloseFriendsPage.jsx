import { useCallback, useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  Heart,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  addCloseFriend,
  getCloseFriends,
  getFollowing,
  removeCloseFriend,
  subscribeToBlockChanges,
} from "../utils/followEngine";

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

function CloseFriendAvatar({ profile }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={getDisplayName(profile)}
        className="close-friend-avatar"
      />
    );
  }

  return (
    <div className="close-friend-avatar close-friend-avatar-fallback">
      {getInitial(profile)}
    </div>
  );
}

function normalizeCloseFriend(row) {
  const profile =
    row?.profiles ||
    row?.profile ||
    row?.friend ||
    row;

  return {
    ...profile,
    close_friend_id: row?.id,
    friend_id:
      row?.friend_id ||
      profile?.id ||
      row?.id,
    created_at: row?.created_at,
  };
}

export default function CloseFriendsPage() {
  const navigate = useNavigate();

  const [closeFriends, setCloseFriends] =
    useState([]);
  const [following, setFollowing] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingFollowing, setLoadingFollowing] =
    useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [showPicker, setShowPicker] =
    useState(false);

  const loadCloseFriends = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError('');

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const rows = await getCloseFriends();
        setCloseFriends(
          (rows || []).map(normalizeCloseFriend)
        );
      } catch (loadError) {
        setError(
          loadError?.message ||
            'Unable to load close friends.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const loadFollowing = useCallback(async () => {
    try {
      setLoadingFollowing(true);

      const profiles = await getFollowing(
        undefined,
        {
          page: 0,
          pageSize: 100,
        }
      );

      setFollowing(profiles || []);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load people you follow.'
      );
    } finally {
      setLoadingFollowing(false);
    }
  }, []);

  useEffect(() => {
    loadCloseFriends();

    const unsubscribe = subscribeToBlockChanges(
      () => {
        loadCloseFriends({ refresh: true });
      }
    );

    return unsubscribe;
  }, [loadCloseFriends]);

  const openPicker = () => {
    setSearch('');
    setShowPicker(true);
    loadFollowing();
  };

  const closePicker = () => {
    if (savingId) {
      return;
    }

    setShowPicker(false);
    setSearch('');
  };

  const isCloseFriend = (profileId) =>
    closeFriends.some(
      (profile) => profile.friend_id === profileId
    );

  const handleAdd = async (profile) => {
    if (!profile?.id || savingId) {
      return;
    }

    try {
      setSavingId(profile.id);
      setError('');

      await addCloseFriend(profile.id);

      setCloseFriends((current) => [
        {
          ...profile,
          friend_id: profile.id,
        },
        ...current.filter(
          (item) => item.friend_id !== profile.id
        ),
      ]);
    } catch (actionError) {
      setError(
        actionError?.message ||
          'Unable to add this close friend.'
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleRemove = async (profile) => {
    const friendId =
      profile?.friend_id || profile?.id;

    if (!friendId || savingId) {
      return;
    }

    try {
      setSavingId(friendId);
      setError('');

      await removeCloseFriend(friendId);

      setCloseFriends((current) =>
        current.filter(
          (item) => item.friend_id !== friendId
        )
      );
    } catch (actionError) {
      setError(
        actionError?.message ||
          'Unable to remove this close friend.'
      );
    } finally {
      setSavingId(null);
    }
  };

  const openProfile = (profile) => {
    if (!profile?.username) {
      return;
    }

    setShowPicker(false);
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
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    }
  );

  return (
    <div className="social-page close-friends-page">
      <TopBar />

      <main className="social-page-content">
        <header className="social-page-header">
          <button
            type="button"
            className="social-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="social-eyebrow">
              Audience
            </p>
            <h1>Close friends</h1>
          </div>

          <button
            type="button"
            className="social-icon-button"
            onClick={() =>
              loadCloseFriends({ refresh: true })
            }
            disabled={refreshing}
            aria-label="Refresh close friends"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? 'social-spin'
                  : undefined
              }
            />
          </button>
        </header>

        <section className="close-friends-hero">
          <div className="close-friends-hero-icon">
            <Heart size={24} fill="currentColor" />
          </div>

          <div>
            <h2>Your private circle</h2>
            <p>
              Share selected stories and updates with
              people you trust.
            </p>
          </div>
        </section>

        {error ? (
          <div
            className="social-error"
            role="alert"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() =>
                loadCloseFriends({ refresh: true })
              }
            >
              Try again
            </button>
          </div>
        ) : null}

        <div className="close-friends-toolbar">
          <div>
            <strong>
              {closeFriends.length} close{' '}
              {closeFriends.length === 1
                ? 'friend'
                : 'friends'}
            </strong>
            <span>
              Only you can see this list
            </span>
          </div>

          <button
            type="button"
            className="social-primary-button close-friends-add-button"
            onClick={openPicker}
          >
            <Plus size={17} />
            Add
          </button>
        </div>

        {loading ? (
          <div className="close-friends-list">
            {[1, 2, 3].map((item) => (
              <div
                className="close-friend-card"
                key={item}
              >
                <div className="social-skeleton close-friend-skeleton-avatar" />
                <div className="close-friend-skeleton-copy">
                  <div className="social-skeleton close-friend-skeleton-line" />
                  <div className="social-skeleton close-friend-skeleton-short" />
                </div>
              </div>
            ))}
          </div>
        ) : closeFriends.length === 0 ? (
          <section className="social-empty-state">
            <div className="social-empty-icon">
              <Heart size={24} />
            </div>

            <h2>Your list is empty</h2>

            <p>
              Add people you trust to create your close
              friends circle.
            </p>

            <button
              type="button"
              className="social-primary-button"
              onClick={openPicker}
            >
              Add close friends
            </button>
          </section>
        ) : (
          <section className="close-friends-list">
            {closeFriends.map((profile) => (
              <article
                className="close-friend-card"
                key={
                  profile.friend_id ||
                  profile.close_friend_id
                }
              >
                <button
                  type="button"
                  className="close-friend-profile"
                  onClick={() =>
                    openProfile(profile)
                  }
                >
                  <CloseFriendAvatar profile={profile} />

                  <span className="close-friend-copy">
                    <strong>
                      {getDisplayName(profile)}
                    </strong>

                    <span>
                      {profile?.username
                        ? `@${profile.username}`
                        : 'Aarush member'}
                    </span>

                    <small>
                      Added to your private circle
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className="close-friend-remove"
                  onClick={() =>
                    handleRemove(profile)
                  }
                  disabled={
                    savingId === profile.friend_id
                  }
                  aria-label={`Remove ${getDisplayName(
                    profile
                  )}`}
                >
                  <X size={17} />
                </button>
              </article>
            ))}
          </section>
        )}
      </main>

      <BottomNav />

      {showPicker ? (
        <div
          className="close-friends-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePicker();
            }
          }}
        >
          <section
            className="close-friends-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="close-friends-modal-title"
          >
            <header className="close-friends-modal-header">
              <div>
                <p className="social-eyebrow">
                  Private circle
                </p>
                <h2 id="close-friends-modal-title">
                  Add close friends
                </h2>
              </div>

              <button
                type="button"
                className="social-icon-button"
                onClick={closePicker}
                disabled={Boolean(savingId)}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </header>

            <label className="close-friends-search">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search people you follow"
                autoFocus
              />
            </label>

            {loadingFollowing ? (
              <div className="picker-loading">
                Loading people you follow…
              </div>
            ) : filteredFollowing.length === 0 ? (
              <div className="picker-empty">
                <UserRound size={22} />
                <span>
                  No matching people found.
                </span>
              </div>
            ) : (
              <div className="close-friends-picker-list">
                {filteredFollowing.map((profile) => {
                  const selected = isCloseFriend(
                    profile.id
                  );
                  const busy =
                    savingId === profile.id;

                  return (
                    <div
                      className="picker-profile-row"
                      key={profile.id}
                    >
                      <button
                        type="button"
                        className="picker-profile-button"
                        onClick={() =>
                          openProfile(profile)
                        }
                      >
                        <CloseFriendAvatar
                          profile={profile}
                        />

                        <span>
                          <strong>
                            {getDisplayName(profile)}
                          </strong>
                          <small>
                            {profile?.username
                              ? `@${profile.username}`
                              : 'Aarush member'}
                          </small>
                        </span>
                      </button>

                      <button
                        type="button"
                        className={
                          selected
                            ? 'picker-selected-button'
                            : 'picker-add-button'
                        }
                        onClick={() =>
                          selected
                            ? handleRemove(profile)
                            : handleAdd(profile)
                        }
                        disabled={busy}
                      >
                        {selected ? (
                          <>
                            <Check size={15} />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus size={15} />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      ) : null}

      <style>{`
        .social-page {
          min-height: 100vh;
          color: #f4f7ff;
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(124, 92, 255, 0.2),
              transparent 35%
            ),
            radial-gradient(
              circle at 100% 18%,
              rgba(77, 215, 255, 0.11),
              transparent 30%
            ),
            #080b13;
        }

        .social-page-content {
          width: min(100%, 760px);
          margin: 0 auto;
          padding: 1.1rem 1rem 7rem;
        }

        .social-page-header {
          display: grid;
          grid-template-columns: 2.5rem 1fr 2.5rem;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.1rem;
        }

        .social-page-header h1 {
          margin: 0;
          font-size: 1.35rem;
          letter-spacing: -0.03em;
        }

        .social-eyebrow {
          margin: 0 0 0.2rem;
          color: #8d9abb;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .social-icon-button {
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

        .social-icon-button:last-child {
          justify-self: end;
        }

        .social-icon-button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .close-friends-hero,
        .close-friend-card,
        .social-empty-state,
        .social-error {
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(17,22,36,0.72);
          box-shadow: 0 20px 55px rgba(0,0,0,0.18);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .close-friends-hero {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 1.25rem;
        }

        .close-friends-hero-icon,
        .social-empty-icon {
          width: 3.1rem;
          height: 3.1rem;
          display: grid;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 1rem;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #ff4fd8 52%,
            #4dd7ff
          );
          box-shadow: 0 8px 25px rgba(124,92,255,0.24);
        }

        .close-friends-hero h2,
        .social-empty-state h2 {
          margin: 0;
          font-size: 0.98rem;
        }

        .close-friends-hero p,
        .social-empty-state p {
          margin: 0.3rem 0 0;
          color: #98a5c2;
          font-size: 0.8rem;
          line-height: 1.45;
        }

        .social-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding: 0.8rem 0.9rem;
          border-color: rgba(255,91,132,0.26);
          border-radius: 1rem;
          color: #ffc2d0;
          font-size: 0.78rem;
        }

        .social-error button {
          border: 0;
          color: #d9ceff;
          background: transparent;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
        }

        .close-friends-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin: 0.8rem 0;
          padding: 0.2rem;
        }

        .close-friends-toolbar div {
          display: grid;
          gap: 0.2rem;
        }

        .close-friends-toolbar strong {
          font-size: 0.82rem;
        }

        .close-friends-toolbar span {
          color: #7886a4;
          font-size: 0.7rem;
        }

        .social-primary-button,
        .picker-add-button,
        .picker-selected-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          min-height: 2.5rem;
          padding: 0.65rem 0.9rem;
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

        .social-primary-button:disabled,
        .picker-add-button:disabled,
        .picker-selected-button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .close-friends-list {
          display: grid;
          gap: 0.7rem;
        }

        .close-friend-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          min-height: 4.7rem;
          padding: 0.85rem;
          border-radius: 1.2rem;
        }

        .close-friend-profile,
        .picker-profile-button {
          min-width: 0;
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

        .close-friend-avatar {
          width: 3rem;
          height: 3rem;
          flex: 0 0 auto;
          border-radius: 1rem;
          object-fit: cover;
          background: #202a43;
        }

        .close-friend-avatar-fallback {
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #ff4fd8
          );
          font-weight: 900;
        }

        .close-friend-copy {
          min-width: 0;
          display: grid;
          gap: 0.16rem;
        }

        .close-friend-copy strong,
        .close-friend-copy span,
        .close-friend-copy small {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .close-friend-copy strong {
          font-size: 0.87rem;
        }

        .close-friend-copy span {
          color: #9ca9c4;
          font-size: 0.75rem;
        }

        .close-friend-copy small {
          color: #687590;
          font-size: 0.68rem;
        }

        .close-friend-remove {
          width: 2.35rem;
          height: 2.35rem;
          display: grid;
          flex: 0 0 auto;
          place-items: center;
          border: 1px solid rgba(255,91,132,0.2);
          border-radius: 0.8rem;
          color: #ffb6c8;
          background: rgba(255,91,132,0.08);
          cursor: pointer;
        }

        .close-friend-remove:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .social-empty-state {
          display: grid;
          justify-items: center;
          padding: 2.5rem 1.25rem;
          border-radius: 1.35rem;
          text-align: center;
        }

        .social-empty-icon {
          margin-bottom: 0.9rem;
        }

        .social-skeleton {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.06),
            rgba(255,255,255,0.12),
            rgba(255,255,255,0.06)
          );
          background-size: 220% 100%;
          animation: aarush-skeleton 1.4s infinite;
        }

        .close-friend-skeleton-avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 1rem;
        }

        .close-friend-skeleton-copy {
          flex: 1;
          display: grid;
          gap: 0.55rem;
        }

        .close-friend-skeleton-line {
          width: 42%;
          height: 0.7rem;
          border-radius: 999px;
        }

        .close-friend-skeleton-short {
          width: 25%;
          height: 0.55rem;
          border-radius: 999px;
        }

        .close-friends-modal-backdrop {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: grid;
          align-items: end;
          padding: 1rem;
          background: rgba(3,5,10,0.68);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .close-friends-modal {
          width: min(100%, 620px);
          max-height: min(75vh, 680px);
          overflow: auto;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 1.4rem;
          background: rgba(14,18,31,0.98);
          box-shadow: 0 -20px 70px rgba(0,0,0,0.42);
        }

        .close-friends-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .close-friends-modal-header h2 {
          margin: 0;
          font-size: 1.05rem;
        }

        .close-friends-search {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          min-height: 2.8rem;
          margin-bottom: 0.8rem;
          padding: 0 0.85rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.9rem;
          color: #8390ac;
          background: rgba(255,255,255,0.05);
        }

        .close-friends-search input {
          width: 100%;
          border: 0;
          outline: 0;
          color: #f4f7ff;
          background: transparent;
          font: inherit;
          font-size: 0.8rem;
        }

        .close-friends-search input::placeholder {
          color: #687590;
        }

        .close-friends-picker-list {
          display: grid;
          gap: 0.4rem;
        }

        .picker-profile-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.7rem;
          padding: 0.55rem;
          border-radius: 0.95rem;
          background: rgba(255,255,255,0.035);
        }

        .picker-profile-button {
          flex: 1;
        }

        .picker-profile-button span {
          min-width: 0;
          display: grid;
          gap: 0.15rem;
        }

        .picker-profile-button strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.8rem;
        }

        .picker-profile-button small {
          overflow: hidden;
          color: #8996b1;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.7rem;
        }

        .picker-selected-button {
          color: #d9fbff;
          background: rgba(77,215,255,0.14);
          border: 1px solid rgba(77,215,255,0.25);
        }

        .picker-empty,
        .picker-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 8rem;
          color: #8d9abb;
          font-size: 0.8rem;
          text-align: center;
        }

        .social-spin {
          animation: aarush-spin 0.9s linear infinite;
        }

        @keyframes aarush-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes aarush-skeleton {
          to {
            background-position: -220% 0;
          }
        }

        @media (max-width: 560px) {
          .close-friend-card {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}