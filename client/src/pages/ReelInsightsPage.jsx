import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bookmark,
  ChevronLeft,
  Clock3,
  Eye,
  Heart,
  MessageCircle,
  Play,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  clearWatchHistory,
  getContinueWatching,
  getCreatorReelAnalytics,
  getWatchHistory,
  removeFromWatchHistory,
  subscribeToReelAnalytics,
} from '../utils/reelAnalyticsEngine';

function formatNumber(value) {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return String(Math.round(number));
}

function formatDuration(seconds) {
  const value = Math.max(0, Number(seconds || 0));

  if (value < 60) {
    return `${Math.round(value)}s`;
  }

  return `${Math.floor(value / 60)}m ${Math.round(value % 60)}s`;
}

function formatPercentage(value) {
  const number = Number(value || 0);

  return `${Math.round(
    number <= 1 ? number * 100 : number
  )}%`;
}

function getReelImage(reel) {
  return (
    reel?.thumbnail_url ||
    reel?.cover_url ||
    reel?.poster_url ||
    reel?.image_url ||
    reel?.media_url ||
    null
  );
}

function getReelTitle(reel) {
  return (
    reel?.caption ||
    reel?.title ||
    reel?.description ||
    'Untitled reel'
  );
}

function MetricCard({
  icon,
  label,
  value,
  accent = 'purple',
}) {
  return (
    <article className={`insight-metric-card ${accent}`}>
      <div className="insight-metric-icon">
        {icon}
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function TrendCard({ title, value, subtitle }) {
  return (
    <article className="insight-trend-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{subtitle}</small>
    </article>
  );
}

function ReelRow({ item, onOpen, onRemove }) {
  const reel = item.reel || item;
  const image = getReelImage(reel);

  return (
    <article className="insight-reel-row">
      <button
        type="button"
        className="insight-reel-preview"
        onClick={() => onOpen(reel)}
      >
        {image ? (
          <img
            src={image}
            alt={getReelTitle(reel)}
            loading="lazy"
          />
        ) : (
          <span>
            <Play size={22} fill="currentColor" />
          </span>
        )}

        <i>
          <Play size={12} fill="currentColor" />
        </i>
      </button>

      <button
        type="button"
        className="insight-reel-copy"
        onClick={() => onOpen(reel)}
      >
        <strong>{getReelTitle(reel)}</strong>

        {item.progress !== undefined ? (
          <span>
            {item.is_complete
              ? 'Fully watched'
              : `${Math.round(
                  Number(item.progress || 0) * 100
                )}% watched`}
          </span>
        ) : (
          <span>
            {formatNumber(
              item.views || item.unique_viewers
            )}{' '}
            views
          </span>
        )}
      </button>

      {onRemove ? (
        <button
          type="button"
          className="insight-remove-button"
          onClick={() => onRemove(reel)}
          aria-label="Remove from watch history"
        >
          <Trash2 size={17} />
        </button>
      ) : null}
    </article>
  );
}

export default function ReelInsightsPage() {
  const navigate = useNavigate();

  const [overview, setOverview] =
    useState(null);
  const [performance, setPerformance] =
    useState([]);
  const [history, setHistory] = useState([]);
  const [continueWatching, setContinueWatching] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState('overview');
  const [historySearch, setHistorySearch] =
    useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [loadingHistory, setLoadingHistory] =
    useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadInsights = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError('');

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [
          analyticsResult,
          historyResult,
          continueResult,
        ] = await Promise.all([
          getCreatorReelAnalytics(undefined, {
            page: 0,
            pageSize: 50,
          }),
          getWatchHistory({
            page: 0,
            pageSize: 30,
          }),
          getContinueWatching({
            page: 0,
            pageSize: 12,
          }),
        ]);

        setOverview(
          analyticsResult?.overview || null
        );
        setPerformance(
          analyticsResult?.items || []
        );
        setHistory(historyResult || []);
        setContinueWatching(
          continueResult || []
        );
      } catch (loadError) {
        setError(
          loadError?.message ||
            'Unable to load reel insights.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadInsights();

    const unsubscribe = subscribeToReelAnalytics(
      () => {
        loadInsights({ refresh: true });
      }
    );

    return unsubscribe;
  }, [loadInsights]);

  const filteredHistory = useMemo(() => {
    const query = historySearch
      .trim()
      .toLowerCase();

    if (!query) {
      return history;
    }

    return history.filter((item) => {
      const reel = item.reel || item;

      return [
        reel?.caption,
        reel?.title,
        reel?.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [history, historySearch]);

  const bestReel = useMemo(
    () =>
      [...performance].sort(
        (first, second) =>
          Number(second.engagement_score || 0) -
          Number(first.engagement_score || 0)
      )[0],
    [performance]
  );

  const mostSavedReel = useMemo(
    () =>
      [...performance].sort(
        (first, second) =>
          Number(second.saves || 0) -
          Number(first.saves || 0)
      )[0],
    [performance]
  );

  const mostSharedReel = useMemo(
    () =>
      [...performance].sort(
        (first, second) =>
          Number(second.shares || 0) -
          Number(first.shares || 0)
      )[0],
    [performance]
  );

  const handleRemoveHistory = async (reel) => {
    if (!reel?.id) {
      return;
    }

    try {
      await removeFromWatchHistory(reel.id);

      setHistory((current) =>
        current.filter(
          (item) =>
            (item.reel?.id || item.id) !== reel.id
        )
      );

      setContinueWatching((current) =>
        current.filter(
          (item) =>
            (item.reel?.id || item.id) !== reel.id
        )
      );

      setNotice('Removed from watch history.');
    } catch (removeError) {
      setError(
        removeError?.message ||
          'Unable to remove this reel.'
      );
    }
  };

  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      'Clear your complete reel watch history?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const {
        clearWatchHistory,
      } = await import(
        '../utils/reelAnalyticsEngine'
      );

      await clearWatchHistory();
      setHistory([]);
      setContinueWatching([]);
      setNotice('Watch history cleared.');
    } catch (clearError) {
      setError(
        clearError?.message ||
          'Unable to clear watch history.'
      );
    }
  };

  const openReel = (reel) => {
    if (!reel?.id) {
      return;
    }

    navigate(`/reels?post=${reel.id}`);
  };

  if (loading) {
    return (
      <div className="social-page reel-insights-page">
        <TopBar />

        <main className="insights-content">
          <div className="insights-loading-header" />
          <div className="insights-loading-grid">
            {[1, 2, 3, 4].map((item) => (
              <div
                className="insights-loading-card"
                key={item}
              />
            ))}
          </div>
          <div className="insights-loading-large" />
        </main>

        <BottomNav />

        <style>{insightsStyles}</style>
      </div>
    );
  }

  return (
    <div className="social-page reel-insights-page">
      <TopBar />

      <main className="insights-content">
        <header className="insights-header">
          <button
            type="button"
            className="insights-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="insights-eyebrow">
              Creator tools
            </p>
            <h1>Reel insights</h1>
          </div>

          <button
            type="button"
            className="insights-icon-button"
            onClick={() =>
              loadInsights({ refresh: true })
            }
            disabled={refreshing}
            aria-label="Refresh insights"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? 'insights-spin'
                  : undefined
              }
            />
          </button>
        </header>

        {error ? (
          <div className="insights-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() =>
                loadInsights({ refresh: true })
              }
            >
              Try again
            </button>
          </div>
        ) : null}

        {notice ? (
          <div className="insights-notice" role="status">
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

        <nav className="insights-tabs">
          <button
            type="button"
            className={
              activeTab === 'overview'
                ? 'is-active'
                : undefined
            }
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>

          <button
            type="button"
            className={
              activeTab === 'performance'
                ? 'is-active'
                : undefined
            }
            onClick={() =>
              setActiveTab('performance')
            }
          >
            Performance
          </button>

          <button
            type="button"
            className={
              activeTab === 'history'
                ? 'is-active'
                : undefined
            }
            onClick={() => setActiveTab('history')}
          >
            Watch history
          </button>
        </nav>

        {activeTab === 'overview' ? (
          <>
            <section className="insights-metric-grid">
              <MetricCard
                icon={<Eye size={18} />}
                label="Total views"
                value={formatNumber(
                  overview?.views
                )}
              />

              <MetricCard
                icon={<Clock3 size={18} />}
                label="Watch time"
                value={formatDuration(
                  overview?.total_watch_time
                )}
                accent="blue"
              />

              <MetricCard
                icon={<Play size={18} />}
                label="Avg. duration"
                value={formatDuration(
                  overview?.average_watch_duration
                )}
                accent="pink"
              />

              <MetricCard
                icon={<TrendingUp size={18} />}
                label="Completion"
                value={formatPercentage(
                  overview?.completion_rate
                )}
                accent="green"
              />

              <MetricCard
                icon={<Users size={18} />}
                label="Unique viewers"
                value={formatNumber(
                  overview?.unique_viewers
                )}
                accent="blue"
              />

              <MetricCard
                icon={<Heart size={18} />}
                label="Engagement"
                value={formatNumber(
                  overview?.engagement_score
                )}
                accent="pink"
              />

              <MetricCard
                icon={<UserPlusIcon />}
                label="Followers gained"
                value={formatNumber(
                  overview?.followers_gained
                )}
                accent="green"
              />

              <MetricCard
                icon={<RefreshCw size={18} />}
                label="Rewatches"
                value={formatNumber(
                  overview?.rewatch_count
                )}
              />
            </section>

            <section className="insights-section">
              <div className="insights-section-heading">
                <BarChart3 size={17} />
                <div>
                  <h2>Performance highlights</h2>
                  <p>
                    Discover what your audience responds
                    to most.
                  </p>
                </div>
              </div>

              <div className="insights-trend-grid">
                <TrendCard
                  title="Best performing reel"
                  value={
                    bestReel
                      ? formatNumber(
                          bestReel.engagement_score
                        )
                      : '—'
                  }
                  subtitle="Engagement score"
                />

                <TrendCard
                  title="Most saved reel"
                  value={
                    mostSavedReel
                      ? formatNumber(
                          mostSavedReel.saves
                        )
                      : '—'
                  }
                  subtitle="Saves"
                />

                <TrendCard
                  title="Most shared reel"
                  value={
                    mostSharedReel
                      ? formatNumber(
                          mostSharedReel.shares
                        )
                      : '—'
                  }
                  subtitle="Shares"
                />

                <TrendCard
                  title="Peak viewing hour"
                  value={
                    overview?.peak_viewing_hour ===
                    null
                      ? '—'
                      : `${overview?.peak_viewing_hour}:00`
                  }
                  subtitle="Local audience time"
                />
              </div>
            </section>

            {continueWatching.length ? (
              <section className="insights-section">
                <div className="insights-section-heading">
                  <Play size={17} />
                  <div>
                    <h2>Continue watching</h2>
                    <p>
                      Pick up where you left off.
                    </p>
                  </div>
                </div>

                <div className="insights-list">
                  {continueWatching
                    .slice(0, 6)
                    .map((item) => (
                      <ReelRow
                        item={item}
                        onOpen={openReel}
                        onRemove={
                          handleRemoveHistory
                        }
                        key={
                          item.reel?.id ||
                          item.reel_id
                        }
                      />
                    ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {activeTab === 'performance' ? (
          <section className="insights-section">
            <div className="insights-section-heading">
              <BarChart3 size={17} />
              <div>
                <h2>Reel performance</h2>
                <p>
                  Compare views and engagement across
                  your reels.
                </p>
              </div>
            </div>

            {performance.length === 0 ? (
              <div className="insights-empty">
                <BarChart3 size={26} />
                <h2>No analytics yet</h2>
                <p>
                  Publish reels and your performance
                  data will appear here.
                </p>
              </div>
            ) : (
              <div className="performance-list">
                {performance.map((item) => (
                  <article
                    className="performance-row"
                    key={item.reel_id}
                  >
                    <button
                      type="button"
                      className="performance-preview"
                      onClick={() =>
                        openReel({
                          id: item.reel_id,
                        })
                      }
                    >
                      <Play
                        size={17}
                        fill="currentColor"
                      />
                    </button>

                    <div className="performance-copy">
                      <strong>
                        Reel {item.reel_id.slice(0, 8)}
                      </strong>

                      <span>
                        {formatNumber(item.views)} views
                        {' · '}
                        {formatPercentage(
                          item.completion_rate
                        )}{' '}
                        completion
                      </span>
                    </div>

                    <div className="performance-metrics">
                      <span>
                        <Heart size={13} />
                        {formatNumber(item.likes)}
                      </span>
                      <span>
                        <MessageCircle size={13} />
                        {formatNumber(item.comments)}
                      </span>
                      <span>
                        <Bookmark size={13} />
                        {formatNumber(item.saves)}
                      </span>
                      <span>
                        <Share2 size={13} />
                        {formatNumber(item.shares)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === 'history' ? (
          <section className="insights-section">
            <div className="history-heading">
              <div className="insights-section-heading">
                <Clock3 size={17} />
                <div>
                  <h2>Watch history</h2>
                  <p>
                    Reels you recently watched.
                  </p>
                </div>
              </div>

              {history.length ? (
                <button
                  type="button"
                  className="clear-history-button"
                  onClick={handleClearHistory}
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <label className="history-search">
              <Search size={17} />
              <input
                type="search"
                value={historySearch}
                onChange={(event) =>
                  setHistorySearch(event.target.value)
                }
                placeholder="Search watch history"
              />
            </label>

            {filteredHistory.length === 0 ? (
              <div className="insights-empty">
                <Clock3 size={26} />
                <h2>
                  {historySearch
                    ? 'No matching reels'
                    : 'No watch history'}
                </h2>
                <p>
                  Reels you watch while signed in will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="insights-list">
                {filteredHistory.map((item) => (
                  <ReelRow
                    item={item}
                    onOpen={openReel}
                    onRemove={
                      handleRemoveHistory
                    }
                    key={
                      item.reel?.id ||
                      item.reel_id ||
                      item.id
                    }
                  />
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>

      <BottomNav />

      <style>{insightsStyles}</style>
    </div>
  );
}

function UserPlusIcon() {
  return <Users size={18} />;
}

const insightsStyles = `
  .reel-insights-page {
    min-height: 100vh;
    color: #f4f7ff;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(124,92,255,0.2),
        transparent 34%
      ),
      radial-gradient(
        circle at 100% 16%,
        rgba(77,215,255,0.1),
        transparent 29%
      ),
      #080b13;
  }

  .insights-content {
    width: min(100%, 920px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .insights-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .insights-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .insights-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .insights-icon-button {
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

  .insights-icon-button:last-child {
    justify-self: end;
  }

  .insights-icon-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .insights-error,
  .insights-notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .insights-error {
    border: 1px solid rgba(255,91,132,0.25);
    color: #ffc2d0;
    background: rgba(255,91,132,0.08);
  }

  .insights-notice {
    border: 1px solid rgba(77,215,255,0.22);
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
  }

  .insights-error button,
  .insights-notice button {
    border: 0;
    color: inherit;
    background: transparent;
    font-weight: 850;
    cursor: pointer;
  }

  .insights-tabs {
    display: flex;
    gap: 0.3rem;
    overflow-x: auto;
    margin-bottom: 1.1rem;
    padding-bottom: 0.2rem;
    scrollbar-width: none;
  }

  .insights-tabs::-webkit-scrollbar {
    display: none;
  }

  .insights-tabs button {
    min-height: 2.2rem;
    padding: 0.6rem 0.85rem;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 999px;
    color: #8996b1;
    background: rgba(255,255,255,0.04);
    font-size: 0.72rem;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
  }

  .insights-tabs button.is-active {
    border-color: rgba(124,92,255,0.35);
    color: #fff;
    background: linear-gradient(
      135deg,
      rgba(124,92,255,0.65),
      rgba(77,215,255,0.3)
    );
  }

  .insights-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .insight-metric-card,
  .insight-trend-card,
  .performance-row,
  .insight-reel-row,
  .insights-empty,
  .privacy-loading-card {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 18px 50px rgba(0,0,0,0.14);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .insight-metric-card {
    display: grid;
    gap: 0.3rem;
    min-height: 8.2rem;
    padding: 0.85rem;
    border-radius: 1.1rem;
  }

  .insight-metric-icon {
    width: 2.2rem;
    height: 2.2rem;
    display: grid;
    place-items: center;
    margin-bottom: 0.25rem;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.14);
  }

  .insight-metric-card.blue .insight-metric-icon {
    color: #bff8ff;
    background: rgba(77,215,255,0.12);
  }

  .insight-metric-card.pink .insight-metric-icon {
    color: #ffc2df;
    background: rgba(255,79,216,0.12);
  }

  .insight-metric-card.green .insight-metric-icon {
    color: #caffdc;
    background: rgba(77,255,151,0.11);
  }

  .insight-metric-card span,
  .insight-trend-card span {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .insight-metric-card strong {
    color: #f4f7ff;
    font-size: 1.18rem;
    letter-spacing: -0.03em;
  }

  .insights-section {
    margin-top: 1.35rem;
  }

  .insights-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.65rem 0.2rem;
    color: #b8a9ff;
  }

  .insights-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .insights-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .insights-trend-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .insight-trend-card {
    display: grid;
    gap: 0.3rem;
    min-height: 6.7rem;
    padding: 0.85rem;
    border-radius: 1rem;
  }

  .insight-trend-card strong {
    color: #fff;
    font-size: 1.15rem;
  }

  .insight-trend-card small {
    color: #71809c;
    font-size: 0.65rem;
  }

  .insights-list,
  .performance-list {
    display: grid;
    gap: 0.55rem;
  }

  .insight-reel-row,
  .performance-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.4rem;
    padding: 0.6rem;
    border-radius: 1rem;
  }

  .insight-reel-preview,
  .performance-preview {
    position: relative;
    width: 3rem;
    height: 3.4rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    overflow: hidden;
    padding: 0;
    border: 0;
    border-radius: 0.75rem;
    color: #fff;
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
    cursor: pointer;
  }

  .insight-reel-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .insight-reel-preview i {
    position: absolute;
    right: 0.25rem;
    bottom: 0.25rem;
    display: grid;
    place-items: center;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 50%;
    background: rgba(0,0,0,0.65);
  }

  .insight-reel-copy,
  .performance-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.25rem;
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .insight-reel-copy strong,
  .performance-copy strong {
    overflow: hidden;
    color: #edf2ff;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.78rem;
  }

  .insight-reel-copy span,
  .performance-copy span {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .insight-remove-button {
    width: 2.2rem;
    height: 2.2rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid rgba(255,91,132,0.2);
    border-radius: 0.7rem;
    color: #ffb6c8;
    background: rgba(255,91,132,0.08);
    cursor: pointer;
  }

  .performance-preview {
    width: 2.8rem;
    height: 2.8rem;
  }

  .performance-metrics {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #8996b1;
    font-size: 0.65rem;
  }

  .performance-metrics span {
    display: inline-flex;
    align-items: center;
    gap: 0.18rem;
  }

  .history-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .clear-history-button {
    min-height: 2rem;
    padding: 0.5rem 0.7rem;
    border: 1px solid rgba(255,91,132,0.22);
    border-radius: 0.7rem;
    color: #ffb6c8;
    background: rgba(255,91,132,0.08);
    font-size: 0.68rem;
    font-weight: 850;
    cursor: pointer;
  }

  .history-search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.7rem;
    margin-bottom: 0.7rem;
    padding: 0 0.8rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.85rem;
    color: #8491ad;
    background: rgba(255,255,255,0.05);
  }

  .history-search input {
    width: 100%;
    border: 0;
    outline: 0;
    color: #f4f7ff;
    background: transparent;
    font: inherit;
    font-size: 0.75rem;
  }

  .history-search input::placeholder {
    color: #697691;
  }

  .insights-empty {
    display: grid;
    justify-items: center;
    gap: 0.4rem;
    padding: 2.5rem 1rem;
    border-radius: 1.15rem;
    color: #a996ff;
    text-align: center;
  }

  .insights-empty h2 {
    margin: 0.25rem 0 0;
    color: #edf2ff;
    font-size: 0.92rem;
  }

  .insights-empty p {
    max-width: 20rem;
    margin: 0;
    color: #8491ad;
    font-size: 0.74rem;
    line-height: 1.5;
  }

  .insights-loading-header,
  .insights-loading-card,
  .insights-loading-large {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: insights-skeleton 1.4s infinite;
  }

  .insights-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1.1rem;
  }

  .insights-loading-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.65rem;
  }

  .insights-loading-card {
    height: 8rem;
  }

  .insights-loading-large {
    height: 16rem;
    margin-top: 1.3rem;
  }

  .insights-spin {
    animation: insights-spin 0.9s linear infinite;
  }

  @keyframes insights-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes insights-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 720px) {
    .insights-metric-grid,
    .insights-trend-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .performance-metrics {
      display: none;
    }
  }

  @media (max-width: 430px) {
    .insights-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .insights-metric-grid {
      gap: 0.45rem;
    }

    .insight-metric-card {
      min-height: 7.4rem;
      padding: 0.7rem;
    }

    .insight-metric-card strong {
      font-size: 1rem;
    }
  }
`;