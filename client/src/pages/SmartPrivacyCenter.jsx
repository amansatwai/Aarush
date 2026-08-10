import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  RefreshCw,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useSmartPrivacy from '../hooks/useSmartPrivacy';

function ActionRow({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className="smart-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="smart-action-icon">
        {icon}
      </div>

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <ChevronRight size={18} />
    </button>
  );
}

export default function SmartPrivacyCenter() {
  const navigate = useNavigate();
  const {
    status,
    profile,
    insights,
    privacyRecommendations,
    securityRecommendations,
    loading,
    error,
    analyze,
    refresh,
    resetLearning,
  } = useSmartPrivacy();

  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const deviationCount = useMemo(
    () => profile?.deviations?.length || 0,
    [profile]
  );

  const applyRecommendation = (item) => {
    if (item?.action) {
      navigate(item.action);
      return;
    }

    setNotice('Recommendation opened.');
  };

  if (loading) {
    return (
      <div className="social-page smart-privacy-page">
        <TopBar />

        <main className="smart-content">
          <div className="smart-loading-header" />
          <div className="smart-loading-card" />
          <div className="smart-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page smart-privacy-page">
      <TopBar />

      <main className="smart-content">
        <header className="smart-header">
          <button
            type="button"
            className="smart-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="smart-eyebrow">
              Local intelligence
            </p>
            <h1>Smart Privacy</h1>
          </div>

          <button
            type="button"
            className="smart-icon-button"
            onClick={refresh}
            aria-label="Refresh intelligence"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="smart-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="smart-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="smart-status-card">
          <div className="smart-status-icon">
            <Brain size={28} />
          </div>

          <div className="smart-status-copy">
            <p>Intelligence status</p>
            <h2>
              {status?.enabled
                ? 'Active on this device'
                : 'Unavailable'}
            </h2>
            <span>
              {status?.guest
                ? 'Guest mode uses basic local insights only.'
                : 'Behavioral analysis is processed locally where possible.'}
            </span>
          </div>

          <button
            type="button"
            className="smart-primary-button"
            onClick={() => {
              analyze();
              setNotice('Behavior analysis refreshed.');
            }}
          >
            <RefreshCw size={15} />
            Analyze
          </button>
        </section>

        <section className="smart-metric-grid">
          <article className="smart-metric">
            <Brain size={18} />
            <span>Confidence</span>
            <strong>
              {status?.confidence || 0}%
            </strong>
          </article>

          <article className="smart-metric">
            <Shield size={18} />
            <span>Privacy confidence</span>
            <strong>
              {Math.min(
                100,
                Object.keys(profile?.privacy || {})
                  .length * 12
              )}%
            </strong>
          </article>

          <article className="smart-metric">
            <TrendingUp size={18} />
            <span>Security signals</span>
            <strong>
              {Object.keys(profile?.security || {})
                .length}
            </strong>
          </article>

          <article className="smart-metric">
            <AlertTriangle size={18} />
            <span>Deviations</span>
            <strong>{deviationCount}</strong>
          </article>
        </section>

        <section className="smart-section">
          <div className="smart-section-heading">
            <Sparkles size={17} />
            <div>
              <h2>Smart recommendations</h2>
              <p>
                Suggestions based on local behavior signals.
              </p>
            </div>
          </div>

          <div className="smart-card">
            {insights.length === 0 ? (
              <div className="smart-empty">
                <Check size={23} />
                <span>
                  No new recommendations right now.
                </span>
              </div>
            ) : (
              insights.map((item) => (
                <article
                  className="smart-recommendation-row"
                  key={item.id}
                >
                  <div className="smart-recommendation-icon">
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <strong>{item.title}</strong>
                    <span>
                      {item.description}
                    </span>
                    <small>{item.level}</small>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      applyRecommendation(item)
                    }
                  >
                    Apply
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="smart-section">
          <div className="smart-section-heading">
            <Shield size={17} />
            <div>
              <h2>Privacy automation</h2>
              <p>
                Adaptive suggestions for privacy protection.
              </p>
            </div>
          </div>

          <div className="smart-card">
            {privacyRecommendations.length === 0 ? (
              <div className="smart-empty">
                <Shield size={23} />
                <span>
                  Privacy preferences are up to date.
                </span>
              </div>
            ) : (
              privacyRecommendations.map((item) => (
                <ActionRow
                  icon={<Shield size={18} />}
                  title={item.title}
                  description={item.description}
                  onClick={() =>
                    applyRecommendation(item)
                  }
                  key={item.id}
                />
              ))
            )}
          </div>
        </section>

        <section className="smart-section">
          <div className="smart-section-heading">
            <AlertTriangle size={17} />
            <div>
              <h2>Security recommendations</h2>
              <p>
                Local signals that may improve account protection.
              </p>
            </div>
          </div>

          <div className="smart-card">
            {securityRecommendations.length === 0 ? (
              <div className="smart-empty">
                <Check size={23} />
                <span>
                  No security recommendations right now.
                </span>
              </div>
            ) : (
              securityRecommendations.map((item) => (
                <ActionRow
                  icon={<Shield size={18} />}
                  title={item.title}
                  description={item.description}
                  onClick={() =>
                    applyRecommendation(item)
                  }
                  key={item.id}
                />
              ))
            )}
          </div>
        </section>

        <section className="smart-section">
          <div className="smart-section-heading">
            <Clock3 size={17} />
            <div>
              <h2>Behavior deviations</h2>
              <p>
                Activity that differs from learned local patterns.
              </p>
            </div>
          </div>

          <div className="smart-card">
            {deviationCount === 0 ? (
              <div className="smart-empty">
                <Check size={23} />
                <span>
                  No unusual behavior patterns detected.
                </span>
              </div>
            ) : (
              profile.deviations
                .slice(0, 8)
                .map((deviation) => (
                  <article
                    className="smart-deviation-row"
                    key={deviation.detected_at}
                  >
                    <AlertTriangle size={17} />
                    <div>
                      <strong>
                        {deviation.category}
                      </strong>
                      <span>
                        Observed value differs from the usual
                        pattern.
                      </span>
                    </div>
                  </article>
                ))
            )}
          </div>
        </section>

        <section className="smart-section">
          <div className="smart-section-heading">
            <Eye size={17} />
            <div>
              <h2>Local AI status</h2>
              <p>
                Your behavior profile remains under your control.
              </p>
            </div>
          </div>

          <div className="smart-card">
            <ActionRow
              icon={<Brain size={18} />}
              title="Refresh local insights"
              description="Recalculate recommendations from local signals."
              onClick={() => {
                analyze();
                setNotice('Insights refreshed.');
              }}
            />

            <ActionRow
              icon={<Trash2 size={18} />}
              title="Reset behavioral learning"
              description="Remove locally learned behavior preferences."
              onClick={() => {
                if (
                  window.confirm(
                    'Reset all local behavioral learning?'
                  )
                ) {
                  resetLearning();
                  setNotice(
                    'Behavioral learning reset.'
                  );
                }
              }}
            />
          </div>
        </section>

        <p className="smart-footer">
          Smart Privacy uses local-first behavioral signals.
          It does not make decisions or change security
          settings without your explicit action.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .smart-privacy-page {
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

  .smart-content {
    width: min(100%, 820px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .smart-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .smart-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .smart-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .smart-icon-button {
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

  .smart-icon-button:last-child {
    justify-self: end;
  }

  .smart-error,
  .smart-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .smart-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .smart-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .smart-status-card,
  .smart-card,
  .smart-metric,
  .smart-suggestion-card {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .smart-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .smart-status-icon {
    width: 3.3rem;
    height: 3.3rem;
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

  .smart-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .smart-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .smart-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .smart-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .smart-primary-button {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    min-height: 2.35rem;
    padding: 0.55rem 0.75rem;
    border: 0;
    border-radius: 999px;
    color: #fff;
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
    font-size: 0.7rem;
    font-weight: 850;
    cursor: pointer;
  }

  .smart-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .smart-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .smart-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .smart-metric strong {
    color: #edf2ff;
    font-size: 0.95rem;
  }

  .smart-section {
    margin-top: 1.3rem;
  }

  .smart-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .smart-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .smart-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .smart-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .smart-recommendation-row,
  .smart-action-row,
  .smart-deviation-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .smart-recommendation-row + .smart-recommendation-row,
  .smart-action-row + .smart-action-row,
  .smart-deviation-row + .smart-deviation-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .smart-recommendation-icon,
  .smart-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .smart-recommendation-row > div:nth-child(2),
  .smart-action-row > span,
  .smart-deviation-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .smart-recommendation-row strong,
  .smart-action-row strong,
  .smart-deviation-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .smart-recommendation-row span,
  .smart-action-row small,
  .smart-deviation-row span {
    color: #8491ad;
    font-size: 0.68rem;
    line-height: 1.4;
  }

  .smart-recommendation-row small {
    color: #b8a9ff;
    font-size: 0.63rem;
  }

  .smart-recommendation-row button {
    min-height: 2.1rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid rgba(77,215,255,0.22);
    border-radius: 0.65rem;
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
    font-size: 0.66rem;
    font-weight: 850;
    cursor: pointer;
  }

  .smart-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .smart-action-row > svg {
    color: #7483a1;
  }

  .smart-deviation-row {
    align-items: flex-start;
    color: #ffb6c8;
  }

  .smart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .smart-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .smart-loading-header,
  .smart-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: smart-skeleton 1.4s infinite;
  }

  .smart-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .smart-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes smart-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .smart-metric-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .smart-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .smart-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .smart-primary-button {
      margin-left: auto;
    }
  }
`;