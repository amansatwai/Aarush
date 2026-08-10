import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  Heart,
  Info,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  clearPersonalizationCache,
  getInterestProfile,
  initializePersonalization,
  INTEREST_CATEGORIES,
  resetPersonalization,
  updateInterestProfile,
  updatePersonalizationPreferences,
  subscribeToPersonalization,
} from '../utils/personalizationEngine';
import {
  clearWatchHistory,
} from '../utils/reelAnalyticsEngine';

function formatWeight(value) {
  const number = Number(value || 0);

  if (number > 0) {
    return `+${Math.round(number)}`;
  }

  return String(Math.round(number));
}

function InterestRow({
  category,
  value,
  onIncrease,
  onDecrease,
  onReset,
}) {
  const percentage = Math.min(
    100,
    Math.abs(Number(value || 0))
  );

  const positive = Number(value || 0) >= 0;

  return (
    <div className="personalization-interest-row">
      <div className="personalization-interest-copy">
        <strong>{category}</strong>
        <span>{formatWeight(value)} interest</span>
      </div>

      <div className="personalization-interest-meter">
        <span
          className={
            positive
              ? 'is-positive'
              : 'is-negative'
          }
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="personalization-interest-actions">
        <button
          type="button"
          onClick={onDecrease}
          aria-label={`See less ${category}`}
        >
          <TrendingDown size={15} />
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label={`Reset ${category}`}
        >
          <RotateCcw size={14} />
        </button>

        <button
          type="button"
          onClick={onIncrease}
          aria-label={`See more ${category}`}
        >
          <TrendingUp size={15} />
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="personalization-setting-row">
      <div className="personalization-setting-icon">
        {icon}
      </div>

      <div className="personalization-setting-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <button
        type="button"
        className={
          checked
            ? 'personalization-toggle is-on'
            : 'personalization-toggle'
        }
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span />
      </button>
    </div>
  );
}

export default function PersonalizationSettingsPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [categorySearch, setCategorySearch] =
    useState('');

  const loadProfile = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setError('');

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result =
          await initializePersonalization();

        setProfile(result);
      } catch (loadError) {
        setError(
          loadError?.message ||
            'Unable to load personalization settings.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadProfile();

    const unsubscribe = subscribeToPersonalization(
      () => {
        loadProfile({ refresh: true });
      }
    );

    return unsubscribe;
  }, [loadProfile]);

  const updateCategory = async (
    category,
    amount
  ) => {
    try {
      setSaving(true);
      setError('');

      const result = await updateInterestProfile({
        category,
        amount,
      });

      setProfile(result);
      setNotice(
        amount > 0
          ? `More ${category} content will appear.`
          : amount < 0
            ? `Less ${category} content will appear.`
            : `${category} preference reset.`
      );
    } catch (updateError) {
      setError(
        updateError?.message ||
          'Unable to update this interest.'
      );
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = async (
    key,
    value,
    nested = null
  ) => {
    try {
      setSaving(true);
      setError('');

      const preferences = nested
        ? {
            [nested]: {
              ...(profile?.preferences?.[nested] ||
                {}),
              [key]: value,
            },
          }
        : {
            [key]: value,
          };

      const result =
        await updatePersonalizationPreferences(
          preferences
        );

      setProfile((current) => ({
        ...current,
        preferences: result.preferences,
      }));

      setNotice('Preference updated.');
    } catch (updateError) {
      setError(
        updateError?.message ||
          'Unable to update this preference.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Reset all personalization signals and interests?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const result = await resetPersonalization();
      setProfile(result);
      clearPersonalizationCache();
      setNotice(
        'Recommendations have been reset.'
      );
    } catch (resetError) {
      setError(
        resetError?.message ||
          'Unable to reset personalization.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClearWatchHistory = async () => {
    const confirmed = window.confirm(
      'Clear your reel watch history?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      await clearWatchHistory();
      setNotice('Watch history cleared.');
    } catch (clearError) {
      setError(
        clearError?.message ||
          'Unable to clear watch history.'
      );
    } finally {
      setSaving(false);
    }
  };

  const visibleCategories = useMemo(() => {
    const search = categorySearch
      .trim()
      .toLowerCase();

    if (!search) {
      return INTEREST_CATEGORIES;
    }

    return INTEREST_CATEGORIES.filter((category) =>
      category.toLowerCase().includes(search)
    );
  }, [categorySearch]);

  const preferences =
    profile?.preferences || {};

  if (loading) {
    return (
      <div className="social-page personalization-page">
        <TopBar />

        <main className="personalization-content">
          <div className="personalization-loading-header" />
          <div className="personalization-loading-card" />
          <div className="personalization-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page personalization-page">
      <TopBar />

      <main className="personalization-content">
        <header className="personalization-header">
          <button
            type="button"
            className="personalization-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="personalization-eyebrow">
              Your experience
            </p>
            <h1>Personalization</h1>
          </div>

          <button
            type="button"
            className="personalization-icon-button"
            onClick={() =>
              loadProfile({ refresh: true })
            }
            disabled={refreshing}
            aria-label="Refresh personalization"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? 'personalization-spin'
                  : undefined
              }
            />
          </button>
        </header>

        {error ? (
          <div className="personalization-error">
            <span>{error}</span>
            <button
              type="button"
              onClick={() =>
                loadProfile({ refresh: true })
              }
            >
              Try again
            </button>
          </div>
        ) : null}

        {notice ? (
          <div className="personalization-notice">
            <Check size={16} />
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

        <section className="personalization-hero">
          <div className="personalization-hero-icon">
            <Brain size={25} />
          </div>

          <div>
            <h2>Shape your feed</h2>
            <p>
              Aarush learns from the content you enjoy
              and gives you control over what appears.
            </p>
          </div>
        </section>

        <section className="personalization-section">
          <div className="personalization-section-heading">
            <Sparkles size={17} />
            <div>
              <h2>Interest categories</h2>
              <p>
                Increase or decrease what you want to see.
              </p>
            </div>
          </div>

          <div className="personalization-card">
            <label className="personalization-search">
              <Search size={16} />
              <input
                type="search"
                value={categorySearch}
                onChange={(event) =>
                  setCategorySearch(event.target.value)
                }
                placeholder="Find an interest"
              />
            </label>

            <div className="personalization-interest-list">
              {visibleCategories.map((category) => (
                <InterestRow
                  category={category}
                  value={
                    profile?.interests?.[category] || 0
                  }
                  onDecrease={() =>
                    updateCategory(category, -2)
                  }
                  onIncrease={() =>
                    updateCategory(category, 2)
                  }
                  onReset={() =>
                    updateCategory(category, 0)
                  }
                  key={category}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="personalization-section">
          <div className="personalization-section-heading">
            <Heart size={17} />
            <div>
              <h2>Content preferences</h2>
              <p>
                Choose the formats and styles you prefer.
              </p>
            </div>
          </div>

          <div className="personalization-card">
            <ToggleRow
              icon={<Play size={17} />}
              title="Videos and reels"
              description="Show more short-form video content."
              checked={Boolean(
                preferences.content_types?.reels
              )}
              onChange={(value) =>
                updatePreference(
                  'reels',
                  value,
                  'content_types'
                )
              }
            />

            <ToggleRow
              icon={<Eye size={17} />}
              title="Images and posts"
              description="Show image-based posts in your recommendations."
              checked={Boolean(
                preferences.content_types?.images
              )}
              onChange={(value) =>
                updatePreference(
                  'images',
                  value,
                  'content_types'
                )
              }
            />

            <ToggleRow
              icon={<Sparkles size={17} />}
              title="Educational content"
              description="Include tutorials, explainers, and learning content."
              checked={Boolean(
                preferences.content_styles?.educational
              )}
              onChange={(value) =>
                updatePreference(
                  'educational',
                  value,
                  'content_styles'
                )
              }
            />

            <ToggleRow
              icon={<TrendingUp size={17} />}
              title="Business content"
              description="Include business, finance, and startup content."
              checked={Boolean(
                preferences.content_styles?.business
              )}
              onChange={(value) =>
                updatePreference(
                  'business',
                  value,
                  'content_styles'
                )
              }
            />

            <ToggleRow
              icon={<EyeOff size={17} />}
              title="Local content"
              description="Allow future local discovery recommendations."
              checked={Boolean(
                preferences.show_local_content
              )}
              onChange={(value) =>
                updatePreference(
                  'show_local_content',
                  value
                )
              }
            />
          </div>
        </section>

        <section className="personalization-section">
          <div className="personalization-section-heading">
            <Clock3 size={17} />
            <div>
              <h2>Feed controls</h2>
              <p>
                Manage your recommendation memory.
              </p>
            </div>
          </div>

          <div className="personalization-card">
            <button
              type="button"
              className="personalization-action-row"
              onClick={handleReset}
              disabled={saving}
            >
              <div className="personalization-setting-icon">
                <RotateCcw size={17} />
              </div>

              <span>
                <strong>Reset recommendations</strong>
                <small>
                  Start your interest profile again.
                </small>
              </span>

              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              className="personalization-action-row"
              onClick={handleClearWatchHistory}
              disabled={saving}
            >
              <div className="personalization-setting-icon">
                <Trash2 size={17} />
              </div>

              <span>
                <strong>Clear watch history</strong>
                <small>
                  Remove reel viewing memory from your account.
                </small>
              </span>

              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              className="personalization-action-row"
              onClick={() =>
                navigate('/reel-insights')
              }
            >
              <div className="personalization-setting-icon">
                <Eye size={17} />
              </div>

              <span>
                <strong>View feed memory</strong>
                <small>
                  Review your reel watch history and insights.
                </small>
              </span>

              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        <section className="personalization-section">
          <div className="personalization-section-heading">
            <Shield size={17} />
            <div>
              <h2>Privacy and transparency</h2>
              <p>
                Understand how personalization works.
              </p>
            </div>
          </div>

          <div className="personalization-card">
            <div className="personalization-info-row">
              <div className="personalization-setting-icon">
                <Info size={17} />
              </div>

              <div>
                <strong>What is stored</strong>
                <p>
                  Aarush stores weighted interests, interaction
                  signals, preferred hashtags, creator affinity,
                  and content preferences.
                </p>
              </div>
            </div>

            <div className="personalization-info-row">
              <div className="personalization-setting-icon">
                <Shield size={17} />
              </div>

              <div>
                <strong>What is not stored</strong>
                <p>
                  Aarush does not store private message content
                  or use your password for recommendations.
                </p>
              </div>
            </div>

            <div className="personalization-info-row">
              <div className="personalization-setting-icon">
                <Brain size={17} />
              </div>

              <div>
                <strong>Cloud personalization</strong>
                <p>
                  Your preference profile syncs securely with
                  your account so recommendations work across
                  devices.
                </p>
              </div>
            </div>

            <ToggleRow
              icon={<Eye size={17} />}
              title="Recommendation explanations"
              description="Show why content was recommended when supported."
              checked={Boolean(
                preferences.recommendation_transparency
              )}
              onChange={(value) =>
                updatePreference(
                  'recommendation_transparency',
                  value
                )
              }
            />
          </div>
        </section>

        <p className="personalization-footer">
          You can change these settings at any time.
          Guest browsing never stores personalization
          data.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .personalization-page {
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

  .personalization-content {
    width: min(100%, 820px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .personalization-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .personalization-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .personalization-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .personalization-icon-button {
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

  .personalization-icon-button:last-child {
    justify-self: end;
  }

  .personalization-icon-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .personalization-hero,
  .personalization-card {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .personalization-hero {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .personalization-hero-icon {
    width: 3.2rem;
    height: 3.2rem;
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
  }

  .personalization-hero h2 {
    margin: 0;
    font-size: 0.98rem;
  }

  .personalization-hero p {
    margin: 0.3rem 0 0;
    color: #98a5c2;
    font-size: 0.78rem;
    line-height: 1.5;
  }

  .personalization-error,
  .personalization-notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
    margin: 0.8rem 0;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .personalization-error {
    border: 1px solid rgba(255,91,132,0.25);
    color: #ffc2d0;
    background: rgba(255,91,132,0.08);
  }

  .personalization-notice {
    justify-content: flex-start;
    border: 1px solid rgba(77,215,255,0.2);
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
  }

  .personalization-error button,
  .personalization-notice button {
    border: 0;
    color: inherit;
    background: transparent;
    font-size: 0.7rem;
    font-weight: 850;
    cursor: pointer;
  }

  .personalization-section {
    margin-top: 1.35rem;
  }

  .personalization-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .personalization-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .personalization-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .personalization-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .personalization-search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.8rem;
    margin: 0.8rem;
    padding: 0 0.8rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.85rem;
    color: #8491ad;
    background: rgba(255,255,255,0.05);
  }

  .personalization-search input {
    width: 100%;
    border: 0;
    outline: 0;
    color: #f4f7ff;
    background: transparent;
    font: inherit;
    font-size: 0.76rem;
  }

  .personalization-search input::placeholder {
    color: #697691;
  }

  .personalization-interest-list {
    display: grid;
  }

  .personalization-interest-row {
    display: grid;
    grid-template-columns: 7.5rem 1fr auto;
    align-items: center;
    gap: 0.7rem;
    min-height: 3.6rem;
    padding: 0.65rem 0.85rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .personalization-interest-copy {
    display: grid;
    gap: 0.18rem;
  }

  .personalization-interest-copy strong {
    color: #edf2ff;
    font-size: 0.76rem;
  }

  .personalization-interest-copy span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .personalization-interest-meter {
    height: 0.4rem;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
  }

  .personalization-interest-meter span {
    display: block;
    height: 100%;
    min-width: 0.2rem;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      #7c5cff,
      #4dd7ff
    );
  }

  .personalization-interest-meter span.is-negative {
    background: linear-gradient(
      90deg,
      #ff5b84,
      #ff9b7c
    );
  }

  .personalization-interest-actions {
    display: flex;
    gap: 0.25rem;
  }

  .personalization-interest-actions button {
    width: 1.85rem;
    height: 1.85rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 0.6rem;
    color: #aeb9d0;
    background: rgba(255,255,255,0.05);
    cursor: pointer;
  }

  .personalization-interest-actions button:hover {
    color: #fff;
    background: rgba(124,92,255,0.2);
  }

  .personalization-setting-row,
  .personalization-action-row,
  .personalization-info-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .personalization-setting-row + .personalization-setting-row,
  .personalization-action-row + .personalization-action-row,
  .personalization-info-row + .personalization-info-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .personalization-setting-icon {
    width: 2.25rem;
    height: 2.25rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .personalization-setting-copy,
  .personalization-info-row > div:last-child,
  .personalization-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .personalization-setting-copy strong,
  .personalization-info-row strong,
  .personalization-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .personalization-setting-copy span,
  .personalization-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
    line-height: 1.4;
  }

  .personalization-toggle {
    width: 2.65rem;
    height: 1.5rem;
    flex: 0 0 auto;
    padding: 0.15rem;
    border: 0;
    border-radius: 999px;
    background: rgba(255,255,255,0.15);
    cursor: pointer;
  }

  .personalization-toggle span {
    display: block;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 50%;
    background: #a6b2ca;
    transition: transform 0.2s ease;
  }

  .personalization-toggle.is-on {
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
  }

  .personalization-toggle.is-on span {
    background: #fff;
    transform: translateX(1.15rem);
  }

  .personalization-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .personalization-action-row > svg {
    color: #7483a1;
  }

  .personalization-info-row {
    align-items: flex-start;
  }

  .personalization-info-row p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
    line-height: 1.5;
  }

  .personalization-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .personalization-loading-header,
  .personalization-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: personalization-skeleton 1.4s infinite;
  }

  .personalization-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .personalization-loading-card {
    height: 18rem;
    margin-top: 1rem;
  }

  .personalization-spin {
    animation: personalization-spin 0.9s linear infinite;
  }

  @keyframes personalization-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes personalization-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 620px) {
    .personalization-interest-row {
      grid-template-columns: 1fr auto;
    }

    .personalization-interest-meter {
      grid-column: 1 / -1;
      grid-row: 2;
    }
  }

  @media (max-width: 430px) {
    .personalization-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }
  }
`;