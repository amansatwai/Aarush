import { useCallback, useEffect, useState } from 'react';
import {
  Ban,
  ChevronLeft,
  RefreshCw,
  ShieldOff,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  getBlockedUsers,
  unblockUser,
  subscribeToBlockChanges,
} from "../utils/followEngine";

const PAGE_SIZE = 30;

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

function formatBlockedDate(value) {
  if (!value) {
    return 'Recently blocked';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently blocked';
  }

  return `Blocked ${date.toLocaleDateString(
    undefined,
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  )}`;
}

function BlockedAvatar({ profile }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={getDisplayName(profile)}
        className="blocked-user-avatar"
      />
    );
  }

  return (
    <div className="blocked-user-avatar blocked-user-avatar-fallback">
      {getInitial(profile)}
    </div>
  );
}

export default function BlockedUsersPage() {
  const navigate = useNavigate();

  const [blockedUsers, setBlockedUsers] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [unblockingId, setUnblockingId] =
    useState(null);

  const loadBlockedUsers = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError('');

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const users = await getBlockedUsers({
          page: 0,
          pageSize: PAGE_SIZE,
        });

        setBlockedUsers(users || []);
      } catch (loadError) {
        setError(
          loadError?.message ||
            'Unable to load blocked users.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadBlockedUsers();

    const unsubscribe = subscribeToBlockChanges(
      () => {
        loadBlockedUsers({ refresh: true });
      }
    );

    return unsubscribe;
  }, [loadBlockedUsers]);

  const handleUnblock = async (profile) => {
    const blockedId =
      profile?.id || profile?.blocked_id;

    if (!blockedId || unblockingId) {
      return;
    }

    const name = getDisplayName(profile);
    const shouldUnblock = window.confirm(
      `Unblock ${name}? They may be able to find and interact with you again.`
    );

    if (!shouldUnblock) {
      return;
    }

    try {
      setUnblockingId(blockedId);
      setError('');

      await unblockUser(blockedId);

      setBlockedUsers((current) =>
        current.filter(
          (item) => item.id !== blockedId
        )
      );
    } catch (actionError) {
      setError(
        actionError?.message ||
          'Unable to unblock this profile.'
      );
    } finally {
      setUnblockingId(null);
    }
  };

  const openProfile = (profile) => {
    if (!profile?.username) {
      return;
    }

    navigate(`/profile/${profile.username}`);
  };

  return (
    <div className="social-page blocked-users-page">
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
              Safety
            </p>
            <h1>Blocked users</h1>
          </div>

          <button
            type="button"
            className="social-icon-button"
            onClick={() =>
              loadBlockedUsers({ refresh: true })
            }
            disabled={refreshing}
            aria-label="Refresh blocked users"
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

        <section className="blocked-hero-card">
          <div className="blocked-hero-icon">
            <Ban size={24} />
          </div>

          <div>
            <h2>Protect your space</h2>
            <p>
              Blocked profiles cannot follow, message,
              or interact with you through Aarush.
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
                loadBlockedUsers({ refresh: true })
              }
            >
              Try again
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="blocked-list">
            {[1, 2, 3].map((item) => (
              <div
                className="blocked-user-card"
                key={item}
              >
                <div className="social-skeleton blocked-skeleton-avatar" />
                <div className="blocked-skeleton-copy">
                  <div className="social-skeleton blocked-skeleton-line" />
                  <div className="social-skeleton blocked-skeleton-short" />
                </div>
                <div className="social-skeleton blocked-skeleton-button" />
              </div>
            ))}
          </div>
        ) : blockedUsers.length === 0 ? (
          <section className="social-empty-state">
            <div className="social-empty-icon">
              <ShieldOff size={24} />
            </div>

            <h2>No blocked users</h2>

            <p>
              Profiles you block will appear here so you
              can manage them later.
            </p>

            <button
              type="button"
              className="social-primary-button"
              onClick={() => navigate('/search')}
            >
              Discover people
            </button>
          </section>
        ) : (
          <section className="blocked-list">
            <div className="social-section-heading">
              <span>Blocked profiles</span>
              <span>{blockedUsers.length}</span>
            </div>

            {blockedUsers.map((profile) => {
              const blockedId = profile.id;
              const isUnblocking =
                unblockingId === blockedId;

              return (
                <article
                  className="blocked-user-card"
                  key={blockedId}
                >
                  <button
                    type="button"
                    className="blocked-user-profile"
                    onClick={() =>
                      openProfile(profile)
                    }
                  >
                    <BlockedAvatar profile={profile} />

                    <span className="blocked-user-copy">
                      <strong>
                        {getDisplayName(profile)}
                      </strong>

                      <span>
                        {profile?.username
                          ? `@${profile.username}`
                          : 'Aarush member'}
                      </span>

                      <small>
                        {formatBlockedDate(
                          profile.blocked_at
                        )}
                      </small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="unblock-button"
                    onClick={() =>
                      handleUnblock(profile)
                    }
                    disabled={isUnblocking}
                  >
                    <UserRound size={16} />
                    <span>
                      {isUnblocking
                        ? 'Removing…'
                        : 'Unblock'}
                    </span>
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <BottomNav />

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

        .blocked-hero-card,
        .blocked-user-card,
        .social-empty-state,
        .social-error {
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(17, 22, 36, 0.72);
          box-shadow: 0 20px 55px rgba(0,0,0,0.18);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .blocked-hero-card {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1.1rem;
          padding: 1rem;
          border-radius: 1.25rem;
        }

        .blocked-hero-icon,
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
            #4dd7ff
          );
          box-shadow: 0 8px 25px rgba(124,92,255,0.24);
        }

        .blocked-hero-card h2,
        .social-empty-state h2 {
          margin: 0;
          font-size: 0.98rem;
        }

        .blocked-hero-card p,
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
          border-color: rgba(255, 91, 132, 0.26);
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

        .blocked-list {
          display: grid;
          gap: 0.7rem;
        }

        .social-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.15rem 0.2rem 0.25rem;
          color: #aab6d0;
          font-size: 0.76rem;
          font-weight: 800;
        }

        .social-section-heading span:last-child {
          display: grid;
          min-width: 1.45rem;
          height: 1.45rem;
          place-items: center;
          border-radius: 999px;
          color: #fff;
          background: rgba(124,92,255,0.55);
          font-size: 0.7rem;
        }

        .blocked-user-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          min-height: 4.7rem;
          padding: 0.85rem;
          border-radius: 1.2rem;
        }

        .blocked-user-profile {
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

        .blocked-user-avatar {
          width: 3rem;
          height: 3rem;
          flex: 0 0 auto;
          border-radius: 1rem;
          object-fit: cover;
          background: #202a43;
        }

        .blocked-user-avatar-fallback {
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #4f91ff
          );
          font-weight: 900;
        }

        .blocked-user-copy {
          min-width: 0;
          display: grid;
          gap: 0.16rem;
        }

        .blocked-user-copy strong,
        .blocked-user-copy span,
        .blocked-user-copy small {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .blocked-user-copy strong {
          color: #f4f7ff;
          font-size: 0.87rem;
        }

        .blocked-user-copy span {
          color: #9ca9c4;
          font-size: 0.75rem;
        }

        .blocked-user-copy small {
          color: #687590;
          font-size: 0.68rem;
        }

        .unblock-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          flex: 0 0 auto;
          min-height: 2.35rem;
          padding: 0.55rem 0.75rem;
          border: 1px solid rgba(124,92,255,0.32);
          border-radius: 0.8rem;
          color: #e4dcff;
          background: rgba(124,92,255,0.12);
          font-size: 0.72rem;
          font-weight: 850;
          cursor: pointer;
        }

        .unblock-button:disabled {
          opacity: 0.52;
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

        .social-primary-button {
          margin-top: 1.15rem;
          min-height: 2.6rem;
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

        .blocked-skeleton-avatar {
          width: 3rem;
          height: 3rem;
          flex: 0 0 auto;
          border-radius: 1rem;
        }

        .blocked-skeleton-copy {
          flex: 1;
          display: grid;
          gap: 0.55rem;
        }

        .blocked-skeleton-line {
          width: 42%;
          height: 0.7rem;
          border-radius: 999px;
        }

        .blocked-skeleton-short {
          width: 25%;
          height: 0.55rem;
          border-radius: 999px;
        }

        .blocked-skeleton-button {
          width: 5rem;
          height: 2.25rem;
          border-radius: 0.8rem;
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
          .blocked-user-card {
            align-items: flex-start;
          }

          .unblock-button span {
            display: none;
          }

          .unblock-button {
            width: 2.35rem;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}