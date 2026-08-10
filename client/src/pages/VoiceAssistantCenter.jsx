import { useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  Clock3,
  Mic,
  MicOff,
  RefreshCw,
  Shield,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useVoiceAssistant from '../hooks/useVoiceAssistant';
import {
  clearCommandHistory,
} from '../utils/naturalLanguageEngine';
import {
  getSupportedLanguages,
  getAvailableVoices,
} from '../utils/voiceAssistantEngine';

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
      className="voice-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="voice-action-icon">
        {icon}
      </div>

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </button>
  );
}

export default function VoiceAssistantCenter() {
  const navigate = useNavigate();

  const {
    status,
    transcript,
    response,
    history,
    error,
    start,
    stop,
    speak,
    mute,
    unmute,
    setLanguage,
    setVoice,
    setSpeechRate,
    setSpeechPitch,
    refresh,
  } = useVoiceAssistant(navigate);

  const [notice, setNotice] = useState('');
  const [selectedLanguage, setSelectedLanguage] =
    useState(status.language || 'en-IN');
  const [selectedVoice, setSelectedVoice] =
    useState(status.voice || '');
  const [rate, setRate] = useState(
    status.speechRate || 1
  );
  const [pitch, setPitch] = useState(
    status.speechPitch || 1
  );

  const voices = useMemo(
    () => getAvailableVoices(),
    []
  );

  const testVoice = () => {
    speak('Hello. Aarush voice assistant is ready.');
    setNotice('Voice test completed.');
  };

  const handleLanguage = (value) => {
    setSelectedLanguage(value);
    setLanguage(value);
    setNotice('Voice language updated.');
  };

  const handleVoice = (value) => {
    setSelectedVoice(value);
    setVoice(value);
    setNotice('Assistant voice updated.');
  };

  const handleRate = (value) => {
    setRate(value);
    setSpeechRate(value);
  };

  const handlePitch = (value) => {
    setPitch(value);
    setSpeechPitch(value);
  };

  return (
    <div className="social-page voice-center-page">
      <TopBar />

      <main className="voice-content">
        <header className="voice-header">
          <button
            type="button"
            className="voice-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="voice-eyebrow">
              Hands-free control
            </p>
            <h1>Voice Assistant</h1>
          </div>

          <button
            type="button"
            className="voice-icon-button"
            onClick={refresh}
            aria-label="Refresh voice status"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error ? (
          <div className="voice-error" role="alert">
            <MicOff size={16} />
            <span>{error}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="voice-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice('')}
            >
              <X size={15} />
            </button>
          </div>
        ) : null}

        <section className="voice-status-card">
          <div
            className={
              status.listening
                ? 'voice-status-icon is-listening'
                : 'voice-status-icon'
            }
          >
            {status.listening ? (
              <Mic size={28} />
            ) : (
              <MicOff size={28} />
            )}
          </div>

          <div className="voice-status-copy">
            <p>Voice status</p>
            <h2>
              {status.listening
                ? 'Listening'
                : status.supported
                  ? 'Ready'
                  : 'Unavailable'}
            </h2>
            <span>
              {status.supported
                ? `${status.language} · ${
                    status.muted
                      ? 'Muted'
                      : 'Voice enabled'
                  }`
                : 'This browser does not support speech recognition.'}
            </span>
          </div>

          <button
            type="button"
            className="voice-primary-button"
            onClick={
              status.listening ? stop : start
            }
            disabled={!status.supported}
          >
            {status.listening ? (
              <>
                <MicOff size={15} />
                Stop
              </>
            ) : (
              <>
                <Mic size={15} />
                Listen
              </>
            )}
          </button>
        </section>

        <section className="voice-section">
          <div className="voice-section-heading">
            <Mic size={17} />
            <div>
              <h2>Voice controls</h2>
              <p>
                Use natural language to control Aarush.
              </p>
            </div>
          </div>

          <div className="voice-card">
            <div className="voice-transcript">
              <span>Latest command</span>
              <strong>
                {transcript || 'No command yet'}
              </strong>
            </div>

            <div className="voice-response">
              <span>Assistant response</span>
              <strong>
                {response ||
                  'Ask me to open chats, security, privacy, or settings.'}
              </strong>
            </div>

            <ActionRow
              icon={<Volume2 size={18} />}
              title="Test voice"
              description="Play a short assistant response."
              onClick={testVoice}
            />

            <ActionRow
              icon={
                status.muted ? (
                  <Volume2 size={18} />
                ) : (
                  <VolumeX size={18} />
                )
              }
              title={
                status.muted
                  ? 'Unmute assistant'
                  : 'Mute assistant'
              }
              description="Control spoken assistant responses."
              onClick={() => {
                if (status.muted) {
                  unmute();
                } else {
                  mute();
                }

                refresh();
              }}
            />
          </div>
        </section>

        <section className="voice-section">
          <div className="voice-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Voice settings</h2>
              <p>
                Choose language, voice, speed, and pitch.
              </p>
            </div>
          </div>

          <div className="voice-card voice-settings-card">
            <label>
              <span>Language</span>
              <select
                value={selectedLanguage}
                onChange={(event) =>
                  handleLanguage(event.target.value)
                }
              >
                {getSupportedLanguages().map(
                  (item) => (
                    <option
                      value={item.code}
                      key={item.code}
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              <span>Voice</span>
              <select
                value={selectedVoice}
                onChange={(event) =>
                  handleVoice(event.target.value)
                }
              >
                <option value="">
                  System default
                </option>

                {voices.map((voice) => (
                  <option
                    value={voice.name}
                    key={voice.name}
                  >
                    {voice.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>
                Speech rate
                <b>{rate.toFixed(1)}</b>
              </span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(event) =>
                  handleRate(
                    Number(event.target.value)
                  )
                }
              />
            </label>

            <label>
              <span>
                Speech pitch
                <b>{pitch.toFixed(1)}</b>
              </span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(event) =>
                  handlePitch(
                    Number(event.target.value)
                  )
                }
              />
            </label>
          </div>
        </section>

        <section className="voice-section">
          <div className="voice-section-heading">
            <Shield size={17} />
            <div>
              <h2>Privacy and security commands</h2>
              <p>
                Sensitive actions should require confirmation.
              </p>
            </div>
          </div>

          <div className="voice-command-grid">
            {[
              'Open security center',
              'Open privacy dashboard',
              'Run security scan',
              'Enable app lock',
              'Open chats',
              'Show notifications',
            ].map((command) => (
              <button
                type="button"
                className="voice-command-chip"
                onClick={() => {
                  speak(command);
                  setNotice(
                    `Say: “${command}”`
                  );
                }}
                key={command}
              >
                {command}
              </button>
            ))}
          </div>
        </section>

        <section className="voice-section">
          <div className="voice-section-heading">
            <Clock3 size={17} />
            <div>
              <h2>Recent commands</h2>
              <p>
                Voice history is stored locally by default.
              </p>
            </div>
          </div>

          <div className="voice-card">
            {history.length === 0 ? (
              <div className="voice-empty">
                <Clock3 size={22} />
                <span>No voice commands yet.</span>
              </div>
            ) : (
              history
                .slice(-10)
                .reverse()
                .map((item) => (
                  <article
                    className="voice-history-row"
                    key={
                      item.created_at +
                      item.text
                    }
                  >
                    <Mic size={16} />
                    <div>
                      <strong>{item.text}</strong>
                      <small>
                        {item.intent}
                        {' · '}
                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleTimeString()
                          : ''}
                      </small>
                    </div>
                  </article>
                ))
            )}

            {history.length ? (
              <button
                type="button"
                className="voice-clear-button"
                onClick={() => {
                  window.localStorage.removeItem(
                    'aarush_voice_command_history'
                  );
                  setNotice(
                    'Voice command history cleared.'
                  );
                  refresh();
                }}
              >
                Clear command history
              </button>
            ) : null}
          </div>
        </section>

        <p className="voice-footer">
          Voice commands are processed locally where
          possible. Sensitive actions should always display
          confirmation before execution.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .voice-center-page {
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

  .voice-content {
    width: min(100%, 820px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .voice-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .voice-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .voice-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .voice-icon-button {
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

  .voice-icon-button:last-child {
    justify-self: end;
  }

  .voice-error,
  .voice-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .voice-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .voice-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .voice-notice button {
    margin-left: auto;
    border: 0;
    color: inherit;
    background: transparent;
    cursor: pointer;
  }

  .voice-status-card,
  .voice-card,
  .voice-command-chip {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .voice-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .voice-status-icon {
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

  .voice-status-icon.is-listening {
    animation: voice-pulse 1.3s ease-in-out infinite;
  }

  .voice-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .voice-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .voice-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .voice-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .voice-primary-button {
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

  .voice-primary-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .voice-section {
    margin-top: 1.3rem;
  }

  .voice-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .voice-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .voice-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .voice-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .voice-transcript,
  .voice-response {
    display: grid;
    gap: 0.25rem;
    padding: 0.9rem;
  }

  .voice-response {
    border-top: 1px solid rgba(255,255,255,0.07);
    background: rgba(124,92,255,0.06);
  }

  .voice-transcript span,
  .voice-response span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .voice-transcript strong,
  .voice-response strong {
    color: #edf2ff;
    font-size: 0.78rem;
    line-height: 1.45;
  }

  .voice-action-row {
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

  .voice-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .voice-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .voice-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .voice-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .voice-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .voice-settings-card {
    display: grid;
    gap: 0.85rem;
    padding: 0.9rem;
  }

  .voice-settings-card label {
    display: grid;
    gap: 0.4rem;
  }

  .voice-settings-card label > span {
    display: flex;
    justify-content: space-between;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .voice-settings-card b {
    color: #c9f9ff;
  }

  .voice-settings-card select,
  .voice-settings-card input {
    width: 100%;
  }

  .voice-settings-card select {
    min-height: 2.5rem;
    padding: 0.55rem 0.65rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.7rem;
    outline: 0;
    color: #edf2ff;
    background: #171d30;
    font-size: 0.74rem;
  }

  .voice-command-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .voice-command-chip {
    min-height: 2.25rem;
    padding: 0.6rem 0.7rem;
    border-radius: 999px;
    color: #dcd5ff;
    font-size: 0.68rem;
    font-weight: 800;
    cursor: pointer;
  }

  .voice-history-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 3.7rem;
    padding: 0.7rem 0.9rem;
    color: #b8a9ff;
  }

  .voice-history-row + .voice-history-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .voice-history-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .voice-history-row strong {
    overflow: hidden;
    color: #edf2ff;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.76rem;
  }

  .voice-history-row small {
    color: #8491ad;
    font-size: 0.64rem;
  }

  .voice-clear-button {
    width: 100%;
    min-height: 2.5rem;
    border: 0;
    border-top: 1px solid rgba(255,255,255,0.07);
    color: #ffb6c8;
    background: rgba(255,91,132,0.06);
    font-size: 0.7rem;
    font-weight: 850;
    cursor: pointer;
  }

  .voice-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .voice-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .voice-spin {
    animation: voice-spin 0.9s linear infinite;
  }

  @keyframes voice-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes voice-pulse {
    0%, 100% {
      box-shadow: 0 0 0 rgba(124,92,255,0);
    }

    50% {
      box-shadow: 0 0 28px rgba(124,92,255,0.65);
    }
  }

  @media (max-width: 560px) {
    .voice-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .voice-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .voice-primary-button {
      margin-left: auto;
    }
  }
`;