import { useCallback, useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  Clock3,
  RefreshCw,
  UserRound,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  acceptFollowRequest,
  getIncomingFollowRequests,
  rejectFollowRequest,
  subscribeToFollowRequests,
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

function formatRequestDate(value) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  const seconds = Math.floor(
    (Date.now() - date.getTime()) / 1000
  );

  if (seconds < 60) {
    return 'Just now';
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  }

  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h ago`;
  }

  if (seconds < 604800) {
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function RequestAvatar({ profile }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={getDisplayName(profile)}
        className="follow-request-avatar"
      />
    );
  }

  return (
    <div className="follow-request-avatar follow-request-avatar-fallback">
      {getInitial(profile)}
    </div>
  );
}

export default function FollowRequestsPage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] =
    useState(null);

  const loadRequests = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError('');

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const nextRequests =
          await getIncomingFollowRequests({
            page: 0,
            pageSize: PAGE_SIZE,
          });

        setRequests(nextRequests || []);
      } catch (loadError) {
        setError(
          loadError?.message ||
            'Unable to load follow requests.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadRequests();

    const unsubscribe = subscribeToFollowRequests(
      () => {
        loadRequests({ refresh: true });
      }
    );

    return unsubscribe;
  }, [loadRequests]);

  const handleAccept = async (request) => {
    if (!request?.id || processingId) {
      return;
    }

    try {
      setProcessingId(request.id);
      setError('');

      await acceptFollowRequest(request.id);

      setRequests((current) =>
        current.filter(
          (item) => item.id !== request.id
        )
      );
    } catch (actionError) {
      setError(
        actionError?.message ||
          'Unable to accept this request.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request) => {
    if (!request?.id || processingId) {
      return;
    }

    try {
      setProcessingId(request.id);
      setError('');

      await rejectFollowRequest(request.id);

      setRequests((current) =>
        current.filter(
          (item) => item.id !== request.id
        )
      );
    } catch (actionError) {
      setError(
        actionError?.message ||
          'Unable to decline this request.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openProfile = (profile) => {
    if (!profile?.username) {
      return;
    }

    navigate(`/profile/${profile.username}`);
  };

  return (
    <div className="social-page follow-requests-page">
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
              Social
            </p>
            <h1>Follow requests</h1>
          </div>

          <button
            type="button"
            className="social-icon-button"
            onClick={() =>
              loadRequests({ refresh: true })
            }
            disabled={refreshing}
            aria-label="Refresh requests"
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

        <section className="social-hero-card">
          <div className="social-hero-icon">
            <UserRound size={24} />
          </div>

          <div>
            <h2>Choose who can follow you</h2>
            <p>
              Review requests before people become
              part of your followers.
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
                loadRequests({ refresh: true })
              }
            >
              Try again
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="social-list">
            {[1, 2, 3].map((item) => (
              <div
                className="follow-request-card is-loading"
                key={item}
              >
                <div className="social-skeleton social-skeleton-avatar" />
                <div className="follow-request-skeleton-copy">
                  <div className="social-skeleton social-skeleton-line" />
                  <div className="social-skeleton social-skeleton-short" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <section className="social-empty-state">
            <div className="social-empty-icon">
              <Clock3 size={24} />
            </div>
            <h2>No pending requests</h2>
            <p>
              New follow requests will appear here.
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
          <section className="social-list">
            <div className="social-section-heading">
              <span>Pending requests</span>
              <span>{requests.length}</span>
            </div>

            {requests.map((request) => {
              const busy =
                processingId === request.id;
              const profile = request;

              return (
                <article
                  className="follow-request-card"
                  key={request.id}
                >
                  <button
                    type="button"
                    className="follow-request-profile"
                    onClick={() =>
                      openProfile(profile)
                    }
                  >
                    <RequestAvatar profile={profile} />

                    <span className="follow-request-copy">
                      <strong>
                        {getDisplayName(profile)}
                      </strong>

                      <span>
                        {profile?.username
                          ? `@${profile.username}`
                          : 'Aarush member'}
                      </span>

                      <small>
                        {formatRequestDate(
                          request.requested_at ||
                            request.created_at
                        )}
                      </small>
                    </span>
                  </button>

                  <div className="follow-request-actions">
                    <button
                      type="button"
                      className="social-accept-button"
                      onClick={() =>
                        handleAccept(request)
                      }
                      disabled={busy}
                      aria-label={`Accept ${getDisplayName(
                        profile
                      )}`}
                    >
                      <Check size={17} />
                      <span>Accept</span>
                    </button>

                    <button
                      type="button"
                      className="social-reject-button"
                      onClick={() =>
                        handleReject(request)
                      }
                      disabled={busy}
                      aria-label={`Decline ${getDisplayName(
                        profile
                      )}`}
                    >
                      <X size={17} />
                      <span>Decline</span>
                    </button>
                  </div>
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

        .social-hero-card,
        .follow-request-card,
        .social-empty-state,
        .social-error {
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(17, 22, 36, 0.72);
          box-shadow: 0 20px 55px rgba(0,0,0,0.18);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .social-hero-card {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1.1rem;
          padding: 1rem;
          border-radius: 1.25rem;
        }

        .social-hero-icon,
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

        .social-hero-card h2,
        .social-empty-state h2 {
          margin: 0;
          font-size: 0.98rem;
        }

        .social-hero-card p,
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

        .social-list {
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

        .follow-request-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          padding: 0.85rem;
          border-radius: 1.2rem;
        }

        .follow-request-profile {
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

        .follow-request-avatar {
          width: 3rem;
          height: 3rem;
          flex: 0 0 auto;
          border-radius: 1rem;
          object-fit: cover;
          background: #202a43;
        }

        .follow-request-avatar-fallback {
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

        .follow-request-copy {
          min-width: 0;
          display: grid;
          gap: 0.16rem;
        }

        .follow-request-copy strong,
        .follow-request-copy span,
        .follow-request-copy small {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .follow-request-copy strong {
          color: #f4f7ff;
          font-size: 0.87rem;
        }

        .follow-request-copy span {
          color: #9ca9c4;
          font-size: 0.75rem;
        }

        .follow-request-copy small {
          color: #687590;
          font-size: 0.68rem;
        }

        .follow-request-actions {
          display: flex;
          flex: 0 0 auto;
          gap: 0.4rem;
        }

        .social-accept-button,
        .social-reject-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          min-height: 2.25rem;
          padding: 0.55rem 0.7rem;
          border-radius: 0.75rem;
          font-size: 0.71rem;
          font-weight: 850;
          cursor: pointer;
        }

        .social-accept-button {
          border: 1px solid rgba(77,215,255,0.24);
          color: #d9fbff;
          background: rgba(77,215,255,0.12);
        }

        .social-reject-button {
          border: 1px solid rgba(255,255,255,0.1);
          color: #c2ccdf;
          background: rgba(255,255,255,0.06);
        }

        .social-accept-button:disabled,
        .social-reject-button:disabled {
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

        .is-loading {
          min-height: 4.7rem;
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

        .social-skeleton-avatar {
          width: 3rem;
          height: 3rem;
          flex: 0 0 auto;
          border-radius: 1rem;
        }

        .follow-request-skeleton-copy {
          flex: 1;
          display: grid;
          gap: 0.55rem;
        }

        .social-skeleton-line {
          width: 42%;
          height: 0.7rem;
          border-radius: 999px;
        }

        .social-skeleton-short {
          width: 25%;
          height: 0.55rem;
          border-radius: 999px;
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
          .follow-request-card {
            align-items: flex-start;
          }

          .follow-request-actions {
            flex-direction: column;
          }

          .social-accept-button span,
          .social-reject-button span {
            display: none;
          }

          .social-accept-button,
          .social-reject-button {
            width: 2.25rem;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}