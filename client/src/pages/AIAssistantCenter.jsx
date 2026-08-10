import { useState } from 'react';
import {
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageCircle,
  Play,
  RefreshCw,
  Shield,
  Sparkles,
  Trash2,
  WandSparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useAIAssistant from '../hooks/useAIAssistant';
import {
  createAutomationRule,
  executeAutomationRule,
  testAutomationRule,
} from '../utils/automationEngine';

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

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
      className="ai-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="ai-action-icon">
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

export default function AIAssistantCenter() {
  const navigate = useNavigate();

  const {
    status,
    messages,
    suggestions,
    rules,
    loading,
    error,
    ask,
    clearHistory,
    refresh,
  } = useAIAssistant();

  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const askQuestion = async () => {
    if (!question.trim()) {
      return;
    }

    try {
      setBusy(true);
      setActionError('');

      await ask(question.trim(), {
        source: 'ai-center',
      });

      setQuestion('');
    } catch (askError) {
      setActionError(
        askError?.message ||
          'Unable to ask the assistant.'
      );
    } finally {
      setBusy(false);
    }
  };

  const createRule = async () => {
    try {
      setBusy(true);

      await createAutomationRule({
        name: 'Suspicious activity protection',
        trigger: 'suspicious_activity',
        action: 'run_security_scan',
      });

      setNotice('Automation rule created.');
      await refresh();
    } catch (ruleError) {
      setActionError(
        ruleError?.message ||
          'Unable to create automation rule.'
      );
    } finally {
      setBusy(false);
    }
  };

  const runRule = async (rule) => {
    try {
      setBusy(true);

      await testAutomationRule(rule, {
        source: 'ai-center',
      });

      await executeAutomationRule(rule, {
        source: 'ai-center',
      });

      setNotice('Automation rule executed.');
    } catch (ruleError) {
      setActionError(
        ruleError?.message ||
          'Unable to execute automation rule.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="social-page ai-center-page">
        <TopBar />

        <main className="ai-content">
          <div className="ai-loading-header" />
          <div className="ai-loading-card" />
          <div className="ai-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page ai-center-page">
      <TopBar />

      <main className="ai-content">
        <header className="ai-header">
          <button
            type="button"
            className="ai-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="ai-eyebrow">
              Aarush intelligence
            </p>
            <h1>AI Assistant</h1>
          </div>

          <button
            type="button"
            className="ai-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh AI assistant"
          >
            <RefreshCw
              size={18}
              className={
                busy ? 'ai-spin' : undefined
              }
            />
          </button>
        </header>

        {error || actionError ? (
          <div className="ai-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="ai-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="ai-status-card">
          <div className="ai-status-icon">
            <Bot size={28} />
          </div>

          <div className="ai-status-copy">
            <p>Assistant status</p>
            <h2>
              {status?.enabled
                ? status?.guest
                  ? 'Basic help'
                  : 'Context-aware'
                : 'Unavailable'}
            </h2>
            <span>
              {status?.guest
                ? 'Guest mode does not use personalized insights.'
                : 'Ready to explain features and suggest actions.'}
            </span>
          </div>
        </section>

        <section className="ai-section">
          <div className="ai-section-heading">
            <MessageCircle size={17} />
            <div>
              <h2>Ask Aarush</h2>
              <p>
                Get help with privacy, security, sync, and personalization.
              </p>
            </div>
          </div>

          <div className="ai-chat-card">
            <div className="ai-message-list">
              {messages.length === 0 ? (
                <div className="ai-empty-message">
                  <Sparkles size={22} />
                  <span>
                    Ask “How can I improve my security?”
                  </span>
                </div>
              ) : (
                messages.slice(-8).map((message) => (
                  <article
                    className={
                      message.role === 'user'
                        ? 'ai-message is-user'
                        : 'ai-message'
                    }
                    key={
                      message.id ||
                      `${message.created_at}-${message.content}`
                    }
                  >
                    <span>{message.content}</span>
                    <small>
                      {formatDate(message.created_at)}
                    </small>
                  </article>
                ))
              )}
            </div>

            <div className="ai-input-row">
              <input
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    askQuestion();
                  }
                }}
                placeholder="Ask the Aarush assistant"
                disabled={busy}
              />

              <button
                type="button"
                className="ai-send-button"
                onClick={askQuestion}
                disabled={
                  busy || !question.trim()
                }
              >
                Ask
              </button>
            </div>
          </div>

          <div className="ai-chat-actions">
            <button
              type="button"
              onClick={() => {
                setQuestion(
                  'How can I improve my account security?'
                );
              }}
            >
              Security help
            </button>

            <button
              type="button"
              onClick={() => {
                setQuestion(
                  'Explain my privacy options.'
                );
              }}
            >
              Privacy help
            </button>

            <button
              type="button"
              onClick={async () => {
                await clearHistory();
                setNotice(
                  'Conversation history cleared.'
                );
              }}
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>
        </section>

        <section className="ai-section">
          <div className="ai-section-heading">
            <WandSparkles size={17} />
            <div>
              <h2>Smart suggestions</h2>
              <p>
                Context-aware actions that may improve your Aarush experience.
              </p>
            </div>
          </div>

          <div className="ai-suggestion-grid">
            {suggestions.map((suggestion) => (
              <button
                type="button"
                className="ai-suggestion-card"
                onClick={() =>
                  suggestion.action &&
                  navigate(suggestion.action)
                }
                key={suggestion.id}
              >
                <Sparkles size={17} />
                <strong>{suggestion.title}</strong>
                <span>
                  {suggestion.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="ai-section">
          <div className="ai-section-heading">
            <Shield size={17} />
            <div>
              <h2>Insights</h2>
              <p>
                Open dedicated areas for deeper context.
              </p>
            </div>
          </div>

          <div className="ai-card">
            <ActionRow
              icon={<Shield size={18} />}
              title="Security insights"
              description="Review devices, sessions, threats, and trust."
              onClick={() =>
                navigate('/security-center')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<LockIcon />}
              title="Privacy insights"
              description="Review social privacy and interaction controls."
              onClick={() =>
                navigate('/social-privacy-settings')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Personalization insights"
              description="Improve feed and Explore recommendations."
              onClick={() =>
                navigate('/personalization-settings')
              }
              disabled={busy}
            />
          </div>
        </section>

        <section className="ai-section">
          <div className="ai-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Automation rules</h2>
              <p>
                Prepare smart actions for recurring situations.
              </p>
            </div>
          </div>

          <div className="ai-card">
            <ActionRow
              icon={<Play size={18} />}
              title="Create automation"
              description="Add a suspicious-activity security rule."
              onClick={createRule}
              disabled={busy}
            />

            {rules.length === 0 ? (
              <div className="ai-empty-row">
                No automation rules created yet.
              </div>
            ) : (
              rules.map((rule) => (
                <article
                  className="ai-rule-row"
                  key={rule.id}
                >
                  <div>
                    <strong>
                      {rule.name || rule.trigger}
                    </strong>
                    <span>
                      {rule.trigger}
                      {' → '}
                      {rule.action}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="ai-run-button"
                    onClick={() => runRule(rule)}
                    disabled={busy || !rule.enabled}
                  >
                    Run
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <p className="ai-footer">
          AI suggestions are assistive guidance. Sensitive
          security, privacy, recovery, and account actions
          still require explicit user authorization.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

function LockIcon() {
  return <Shield size={18} />;
}

const styles = `
  .ai-center-page {
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

  .ai-content {
    width: min(100%, 820px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .ai-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .ai-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .ai-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .ai-icon-button {
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

  .ai-icon-button:last-child {
    justify-self: end;
  }

  .ai-icon-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .ai-error,
  .ai-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .ai-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .ai-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .ai-status-card,
  .ai-card,
  .ai-chat-card,
  .ai-suggestion-card {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .ai-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .ai-status-icon {
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

  .ai-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .ai-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .ai-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .ai-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .ai-section {
    margin-top: 1.3rem;
  }

  .ai-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .ai-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .ai-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .ai-chat-card,
  .ai-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .ai-message-list {
    display: grid;
    gap: 0.55rem;
    max-height: 20rem;
    overflow: auto;
    padding: 0.9rem;
  }

  .ai-message {
    display: grid;
    gap: 0.25rem;
    max-width: 88%;
    padding: 0.7rem;
    border-radius: 0.9rem;
    color: #dfe8fb;
    background: rgba(124,92,255,0.14);
    font-size: 0.76rem;
    line-height: 1.45;
  }

  .ai-message.is-user {
    justify-self: end;
    background: rgba(77,215,255,0.1);
  }

  .ai-message small {
    color: #71809c;
    font-size: 0.62rem;
  }

  .ai-empty-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 6rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .ai-input-row {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .ai-input-row input {
    min-width: 0;
    flex: 1;
    min-height: 2.6rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.75rem;
    outline: 0;
    color: #f4f7ff;
    background: rgba(255,255,255,0.05);
    font: inherit;
    font-size: 0.76rem;
  }

  .ai-send-button,
  .ai-run-button {
    min-height: 2.6rem;
    padding: 0.65rem 0.8rem;
    border: 0;
    border-radius: 0.75rem;
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

  .ai-send-button:disabled,
  .ai-run-button:disabled {
    opacity: 0.5;
    cursor: wait;
  }

  .ai-chat-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }

  .ai-chat-actions button {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 2rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid rgba(124,92,255,0.25);
    border-radius: 999px;
    color: #dcd5ff;
    background: rgba(124,92,255,0.1);
    font-size: 0.67rem;
    font-weight: 800;
    cursor: pointer;
  }

  .ai-suggestion-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }

  .ai-suggestion-card {
    display: grid;
    justify-items: start;
    gap: 0.35rem;
    min-height: 7rem;
    padding: 0.85rem;
    border-radius: 1rem;
    color: #b8a9ff;
    text-align: left;
    cursor: pointer;
  }

  .ai-suggestion-card strong {
    color: #edf2ff;
    font-size: 0.76rem;
  }

  .ai-suggestion-card span {
    color: #8491ad;
    font-size: 0.68rem;
    line-height: 1.4;
  }

  .ai-action-row,
  .ai-rule-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
  }

  .ai-action-row + .ai-action-row,
  .ai-rule-row + .ai-rule-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .ai-action-row {
    width: 100%;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .ai-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .ai-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .ai-action-row > span,
  .ai-rule-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .ai-action-row strong,
  .ai-rule-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .ai-action-row small,
  .ai-rule-row span {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .ai-action-row > svg {
    color: #7483a1;
  }

  .ai-empty-row {
    padding: 1rem;
    color: #8491ad;
    font-size: 0.74rem;
    text-align: center;
  }

  .ai-run-button {
    min-height: 2.1rem;
    padding: 0.5rem 0.65rem;
  }

  .ai-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .ai-loading-header,
  .ai-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: ai-skeleton 1.4s infinite;
  }

  .ai-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .ai-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  .ai-spin {
    animation: ai-spin 0.9s linear infinite;
  }

  @keyframes ai-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes ai-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 560px) {
    .ai-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .ai-suggestion-grid {
      grid-template-columns: 1fr;
    }
  }
`;