import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useAIGuardian from '../hooks/useAIGuardian';
import {
  explainGuardianDecision,
} from '../utils/aiGuardianEngine';

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
      className="guardian-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="guardian-action-icon">
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

export default function AIGuardianCenter() {
  const navigate = useNavigate();
  const {
    guardian,
    prediction,
    loading,
    error,
    refresh,
  } = useAIGuardian();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const applyRecommendation = async (
    recommendation
  ) => {
    try {
      setBusy(true);

      const explanation =
        await explainGuardianDecision(
          recommendation
        );

      if (
        recommendation.category ===
        'Account Takeover'
      ) {
        navigate('/session-security');
      } else if (
        recommendation.category ===
        'Privacy Exposure'
      ) {
        navigate('/social-privacy-settings');
      } else if (
        recommendation.category ===
        'Device Compromise'
      ) {
        navigate('/security-center');
      } else if (
        recommendation.category ===
        'Backup Failure'
      ) {
        navigate('/backup-center');
      } else {
        setNotice(explanation.suggested_action);
      }
    } catch (recommendationError) {
      setActionError(
        recommendationError?.message ||
          'Unable to apply recommendation.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="social-page guardian-page">
        <TopBar />

        <main className="guardian-content">
          <div className="guardian-loading-header" />
          <div className="guardian-loading-card" />
          <div className="guardian-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  const score = guardian?.score || 0;
  const warnings = guardian?.warnings || [];
  const actions = guardian?.actions || [];

  return (
    <div className="social-page guardian-page">
      <TopBar />

      <main className="guardian-content">
        <header className="guardian-header">
          <button
            type="button"
            className="guardian-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="guardian-eyebrow">
              Predictive protection
            </p>
            <h1>AI Guardian</h1>
          </div>

          <button
            type="button"
            className="guardian-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh Guardian"
          >
            <RefreshCw
              size={18}
              className={
                busy
                  ? 'guardian-spin'
                  : undefined
              }
            />
          </button>
        </header>

        {error || actionError ? (
          <div className="guardian-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="guardian-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="guardian-status-card">
          <div className="guardian-score-ring">
            <div
              style={{
                '--guardian-score': `${score * 3.6}deg`,
              }}
            >
              <strong>{score}</strong>
              <span>/100</span>
            </div>
          </div>

          <div className="guardian-status-copy">
            <p>Guardian status</p>
            <h2>{guardian?.level || 'Minimal'}</h2>
            <span>
              {guardian?.guest
                ? 'Guest mode provides basic information only.'
                : 'Predictive security analysis is active.'}
            </span>
          </div>

          <button
            type="button"
            className="guardian-primary-button"
            onClick={() => {
              refresh();
              setNotice('Guardian analysis refreshed.');
            }}
            disabled={busy}
          >
            <Sparkles size={15} />
            Analyze
          </button>
        </section>

        <section className="guardian-section">
          <div className="guardian-section-heading">
            <Shield size={17} />
            <div>
              <h2>System health</h2>
              <p>
                Current account, security, privacy, device, and session signals.
              </p>
            </div>
          </div>

          <div className="guardian-health-grid">
            {[
              ['Account', guardian?.insights?.account],
              ['Security', guardian?.insights?.security],
              ['Privacy', guardian?.insights?.privacy],
              ['Device', guardian?.insights?.device],
              ['Session', guardian?.insights?.session],
            ].map(([name, item]) => (
              <article
                className="guardian-health-card"
                key={name}
              >
                <span>{name} health</span>
                <strong>
                  {item?.healthy
                    ? 'Healthy'
                    : 'Review'}
                </strong>
                <small>
                  Confidence {item?.confidence || 0}%
                </small>
              </article>
            ))}
          </div>
        </section>

        <section className="guardian-section">
          <div className="guardian-section-heading">
            <AlertTriangle size={17} />
            <div>
              <h2>Threat forecast</h2>
              <p>
                Potential future risks and explainable signals.
              </p>
            </div>
          </div>

          <div className="guardian-card">
            {prediction?.predictions?.length === 0 ? (
              <div className="guardian-empty">
                <Check size={23} />
                <span>
                  No elevated future risks detected.
                </span>
              </div>
            ) : (
              prediction?.predictions?.map((item) => (
                <article
                  className="guardian-threat-row"
                  key={item.category}
                >
                  <div className="guardian-threat-icon">
                    <AlertTriangle size={17} />
                  </div>

                  <div>
                    <strong>{item.category}</strong>
                    <span>{item.reason}</span>
                    <small>
                      {item.level}
                      {' · '}
                      {item.confidence}% confidence
                    </small>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="guardian-section">
          <div className="guardian-section-heading">
            <Zap size={17} />
            <div>
              <h2>Preventive recommendations</h2>
              <p>
                Actions with explainable protection value.
              </p>
            </div>
          </div>

          <div className="guardian-card">
            {actions.length === 0 ? (
              <div className="guardian-empty">
                <Check size={23} />
                <span>
                  No preventive action is required.
                </span>
              </div>
            ) : (
              actions.map((item) => (
                <ActionRow
                  icon={<Sparkles size={18} />}
                  title={item.title}
                  description={`${item.why} · ${item.confidence}% confidence`}
                  onClick={() =>
                    applyRecommendation(item)
                  }
                  disabled={busy}
                  key={item.id || item.title}
                />
              ))
            )}
          </div>
        </section>

        <section className="guardian-section">
          <div className="guardian-section-heading">
            <Eye size={17} />
            <div>
              <h2>Autonomous protection</h2>
              <p>
                Prepare automatic responses for high-confidence risks.
              </p>
            </div>
          </div>

          <div className="guardian-card">
            <ActionRow
              icon={<Shield size={18} />}
              title="Enable autonomous protection"
              description="Prepare session locks, re-authentication, and device review."
              onClick={() =>
                setNotice(
                  'Autonomous protection preference is ready for confirmation.'
                )
              }
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Refresh forecast"
              description="Recalculate predictive threat signals."
              onClick={refresh}
              disabled={busy}
            />

            <ActionRow
              icon={<Zap size={18} />}
              title="View Guardian history"
              description="Review previous AI Guardian decisions."
              onClick={() =>
                navigate('/threat-center')
              }
              disabled={busy}
            />
          </div>
        </section>

        <p className="guardian-footer">
          AI Guardian provides explainable risk forecasts.
          Sensitive actions require explicit confirmation
          and server-side authorization.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .guardian-page {
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

  .guardian-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .guardian-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .guardian-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .guardian-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .guardian-icon-button {
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

  .guardian-icon-button:last-child {
    justify-self: end;
  }

  .guardian-icon-button:disabled,
  .guardian-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .guardian-error,
  .guardian-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .guardian-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .guardian-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .guardian-status-card,
  .guardian-card,
  .guardian-health-card {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .guardian-status-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .guardian-score-ring {
    width: 5.3rem;
    height: 5.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 50%;
    background: conic-gradient(
      #7c5cff var(--guardian-score),
      rgba(255,255,255,0.1) var(--guardian-score)
    );
  }

  .guardian-score-ring > div {
    width: 4.3rem;
    height: 4.3rem;
    display: grid;
    place-items: center;
    align-content: center;
    border-radius: 50%;
    background: #111626;
  }

  .guardian-score-ring strong {
    font-size: 1.25rem;
  }

  .guardian-score-ring span {
    color: #8491ad;
    font-size: 0.6rem;
  }

  .guardian-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .guardian-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .guardian-status-copy h2 {
    margin: 0;
    font-size: 1.08rem;
  }

  .guardian-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .guardian-primary-button {
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

  .guardian-section {
    margin-top: 1.3rem;
  }

  .guardian-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .guardian-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .guardian-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .guardian-health-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.55rem;
  }

  .guardian-health-card {
    display: grid;
    gap: 0.3rem;
    min-height: 6rem;
    padding: 0.7rem;
    border-radius: 0.9rem;
  }

  .guardian-health-card span,
  .guardian-health-card small {
    color: #8491ad;
    font-size: 0.64rem;
  }

  .guardian-health-card strong {
    color: #55e6a5;
    font-size: 0.76rem;
  }

  .guardian-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .guardian-threat-row,
  .guardian-action-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .guardian-threat-row + .guardian-threat-row,
  .guardian-action-row + .guardian-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .guardian-threat-icon,
  .guardian-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .guardian-threat-row > div:nth-child(2),
  .guardian-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .guardian-threat-row strong,
  .guardian-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .guardian-threat-row span,
  .guardian-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
    line-height: 1.4;
  }

  .guardian-threat-row small {
    color: #ffb6c8;
    font-size: 0.63rem;
  }

  .guardian-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .guardian-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .guardian-action-row > svg {
    color: #7483a1;
  }

  .guardian-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .guardian-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .guardian-loading-header,
  .guardian-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: guardian-skeleton 1.4s infinite;
  }

  .guardian-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .guardian-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  .guardian-spin {
    animation: guardian-spin 0.9s linear infinite;
  }

  @keyframes guardian-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes guardian-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 760px) {
    .guardian-health-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .guardian-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .guardian-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .guardian-primary-button {
      margin-left: auto;
    }
  }
`;