import { useState } from 'react';
import {
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  RefreshCw,
  Shield,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import usePersonalAI from '../hooks/usePersonalAI';

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
      className="platform-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="platform-action-icon">
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

export default function AIPlatformCenter() {
  const navigate = useNavigate();

  const {
    memorySummary,
    network,
    insight,
    recommendations,
    loading,
    error,
    refresh,
    analyzeEverything,
    resetMemory,
    exportPersonalMemory,
    importPersonalMemory,
  } = usePersonalAI();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const runAnalysis = async () => {
    try {
      setBusy(true);
      await analyzeEverything();
      setNotice('Unified intelligence refreshed.');
    } catch (analysisError) {
      setActionError(
        analysisError?.message ||
          'Unable to analyze intelligence.'
      );
    } finally {
      setBusy(false);
    }
  };

  const exportMemory = () => {
    const packageData = exportPersonalMemory();
    const blob = new Blob(
      [JSON.stringify(packageData, null, 2)],
      {
        type: 'application/json',
      }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download =
      'aarush-personal-ai-memory.json';
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice('Personal AI memory exported.');
  };

  const importMemory = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      try {
        const packageData = JSON.parse(
          await file.text()
        );

        importPersonalMemory(packageData);
        setNotice('Personal AI memory imported.');
      } catch (importError) {
        setActionError(
          importError?.message ||
            'Unable to import AI memory.'
        );
      }
    };

    input.click();
  };

  if (loading) {
    return (
      <div className="social-page ai-platform-page">
        <TopBar />

        <main className="platform-content">
          <div className="platform-loading-header" />
          <div className="platform-loading-card" />
          <div className="platform-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page ai-platform-page">
      <TopBar />

      <main className="platform-content">
        <header className="platform-header">
          <button
            type="button"
            className="platform-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="platform-eyebrow">
              Aarush intelligence
            </p>
            <h1>AI Platform</h1>
          </div>

          <button
            type="button"
            className="platform-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh AI platform"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="platform-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="platform-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="platform-status-card">
          <div className="platform-status-icon">
            <Brain size={28} />
          </div>

          <div className="platform-status-copy">
            <p>AI platform status</p>
            <h2>
              {network?.enabled
                ? 'Connected intelligence'
                : 'Local mode'}
            </h2>
            <span>
              {network?.local_first
                ? 'Local-first intelligence is ready.'
                : 'Personal AI is initializing.'}
            </span>
          </div>

          <button
            type="button"
            className="platform-primary-button"
            onClick={runAnalysis}
            disabled={busy}
          >
            <Sparkles size={15} />
            Analyze
          </button>
        </section>

        <section className="platform-metric-grid">
          <article className="platform-metric">
            <Brain size={18} />
            <span>Memory items</span>
            <strong>
              {(memorySummary?.preference_count || 0) +
                (memorySummary?.behavior_count || 0)}
            </strong>
          </article>

          <article className="platform-metric">
            <Shield size={18} />
            <span>Security memories</span>
            <strong>
              {memorySummary?.security_count || 0}
            </strong>
          </article>

          <article className="platform-metric">
            <Sparkles size={18} />
            <span>Recommendations</span>
            <strong>{recommendations.length}</strong>
          </article>

          <article className="platform-metric">
            <Clock3 size={18} />
            <span>Contexts</span>
            <strong>
              {memorySummary?.context_count || 0}
            </strong>
          </article>
        </section>

        <section className="platform-section">
          <div className="platform-section-heading">
            <Sparkles size={17} />
            <div>
              <h2>Unified intelligence</h2>
              <p>
                Cross-feature reasoning from security, privacy, backup, sync, and behavior.
              </p>
            </div>
          </div>

          <div className="platform-card">
            <div className="platform-insight">
              <strong>
                {insight?.title ||
                  'No unified insight yet'}
              </strong>
              <span>
                {insight?.summary ||
                  'Run analysis to coordinate Aarush intelligence.'}
              </span>
              <small>
                Confidence {insight?.confidence || 0}%
              </small>
            </div>

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Generate unified insight"
              description="Coordinate all connected intelligence systems."
              onClick={runAnalysis}
              disabled={busy}
            />
          </div>
        </section>

        <section className="platform-section">
          <div className="platform-section-heading">
            <Shield size={17} />
            <div>
              <h2>Cross-system recommendations</h2>
              <p>
                Explainable actions based on your personal AI context.
              </p>
            </div>
          </div>

          <div className="platform-card">
            {recommendations.length === 0 ? (
              <div className="platform-empty">
                <Check size={23} />
                <span>
                  No new recommendations right now.
                </span>
              </div>
            ) : (
              recommendations.map((item) => (
                <article
                  className="platform-recommendation"
                  key={item.id}
                >
                  <div className="platform-action-icon">
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.why}</span>
                    <small>
                      {item.confidence}% confidence
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      item.action &&
                      navigate(item.action)
                    }
                  >
                    Open
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="platform-section">
          <div className="platform-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Intelligence network</h2>
              <p>
                Connected Aarush systems prepared for coordination.
              </p>
            </div>
          </div>

          <div className="platform-network-grid">
            {[
              'Security',
              'Privacy',
              'Backup',
              'Sync',
              'Notifications',
              'Automation',
              'Behavior learning',
              'Threat prediction',
            ].map((item) => (
              <div
                className="platform-network-item"
                key={item}
              >
                <Check size={15} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="platform-section">
          <div className="platform-section-heading">
            <Brain size={17} />
            <div>
              <h2>Personal AI memory</h2>
              <p>
                Manage locally stored long-term preferences and context.
              </p>
            </div>
          </div>

          <div className="platform-card">
            <ActionRow
              icon={<Download size={18} />}
              title="Export AI memory"
              description="Download a portable memory package."
              onClick={exportMemory}
              disabled={busy}
            />

            <ActionRow
              icon={<Upload size={18} />}
              title="Import AI memory"
              description="Restore a previously exported package."
              onClick={importMemory}
              disabled={busy}
            />

            <ActionRow
              icon={<Trash2 size={18} />}
              title="Reset AI memory"
              description="Delete learned preferences and behavior context."
              onClick={() => {
                if (
                  window.confirm(
                    'Reset all personal AI memory?'
                  )
                ) {
                  resetMemory();
                  setNotice(
                    'Personal AI memory reset.'
                  );
                }
              }}
              disabled={busy}
            />
          </div>
        </section>

        <p className="platform-footer">
          Personal AI memory is local-first. AI
          recommendations are assistive and do not change
          security, privacy, or account settings without your
          explicit action.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .ai-platform-page {
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

  .platform-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .platform-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .platform-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .platform-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .platform-icon-button {
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

  .platform-icon-button:last-child {
    justify-self: end;
  }

  .platform-error,
  .platform-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .platform-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .platform-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .platform-status-card,
  .platform-card,
  .platform-metric,
  .platform-network-item {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .platform-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .platform-status-icon {
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

  .platform-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .platform-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .platform-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .platform-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .platform-primary-button {
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

  .platform-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .platform-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .platform-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .platform-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .platform-metric strong {
    color: #edf2ff;
    font-size: 0.95rem;
  }

  .platform-section {
    margin-top: 1.3rem;
  }

  .platform-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .platform-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .platform-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .platform-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .platform-insight {
    display: grid;
    gap: 0.35rem;
    padding: 0.9rem;
  }

  .platform-insight strong {
    color: #edf2ff;
    font-size: 0.82rem;
  }

  .platform-insight span {
    color: #98a5c2;
    font-size: 0.74rem;
    line-height: 1.45;
  }

  .platform-insight small {
    color: #b8a9ff;
    font-size: 0.65rem;
  }

  .platform-action-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
    border: 0;
    border-top: 1px solid rgba(255,255,255,0.07);
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .platform-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .platform-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .platform-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .platform-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .platform-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .platform-recommendation {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .platform-recommendation + .platform-recommendation {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .platform-recommendation > div:nth-child(2) {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .platform-recommendation strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .platform-recommendation span {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .platform-recommendation small {
    color: #b8a9ff;
    font-size: 0.63rem;
  }

  .platform-recommendation button {
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

  .platform-network-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
  }

  .platform-network-item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 3rem;
    padding: 0.7rem;
    border-radius: 0.9rem;
    color: #c9f9ff;
    font-size: 0.68rem;
  }

  .platform-network-item span {
    color: #dce5f7;
  }

  .platform-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .platform-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .platform-loading-header,
  .platform-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: platform-skeleton 1.4s infinite;
  }

  .platform-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .platform-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes platform-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 720px) {
    .platform-metric-grid,
    .platform-network-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .platform-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .platform-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .platform-primary-button {
      margin-left: auto;
    }
  }
`;