import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  Pause,
  Play,
  RefreshCw,
  Radio,
  Shield,
  Square,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useLiveStreaming from '../hooks/useLiveStreaming';
import {
  createLiveSession,
  pauseLiveStream,
  resumeLiveStream,
  startLiveStream,
  stopLiveStream,
} from '../utils/liveStreamingEngine';
import {
  getLiveChat,
  sendLiveMessage,
  sendLiveReaction,
} from '../utils/viewerInteractionEngine';

function isGuestMode() {
  if (typeof window === 'undefined') return false;

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
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
      className="live-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="live-action-icon">
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

export default function LiveStreamingCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const [activeStream, setActiveStream] =
    useState(null);
  const [chat, setChat] = useState([]);
  const [chatMessage, setChatMessage] =
    useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const {
    streams,
    viewerCount,
    health,
    analytics,
    loading,
    error,
    refresh,
  } = useLiveStreaming(activeStream?.id);

  const runAction = async (
    action,
    message
  ) => {
    try {
      setBusy(true);
      setActionError('');
      const result = await action();
      setNotice(message);
      await refresh();
      return result;
    } catch (actionException) {
      setActionError(
        actionException?.message ||
          'Unable to complete streaming action.'
      );
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleStart = async () => {
    if (guest) {
      navigate('/login');
      return;
    }

    const result = await runAction(
      async () => {
        const session = await createLiveSession({
          title: 'Aarush live stream',
          visibility: 'public',
        });

        await startLiveStream(session.id);
        return session;
      },
      'Live stream started.'
    );

    if (result) {
      setActiveStream(result);
    }
  };

  const handleChat = async () => {
    if (!activeStream || !chatMessage.trim()) {
      return;
    }

    try {
      setBusy(true);

      await sendLiveMessage(
        activeStream.id,
        chatMessage.trim()
      );

      setChatMessage('');
      setChat(
        await getLiveChat(activeStream.id)
      );
    } catch (chatError) {
      setActionError(
        chatError?.message ||
          'Unable to send live message.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="social-page live-page">
        <TopBar />

        <main className="live-content">
          <div className="live-loading-header" />
          <div className="live-loading-card" />
          <div className="live-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page live-page">
      <TopBar />

      <main className="live-content">
        <header className="live-header">
          <button
            type="button"
            className="live-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="live-eyebrow">
              Real-time broadcasting
            </p>
            <h1>Live Streaming</h1>
          </div>

          <button
            type="button"
            className="live-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh live data"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="live-error" role="alert">
            <AlertTriangle size={16} />
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="live-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="live-status-card">
          <div className="live-status-icon">
            <Radio size={27} />
          </div>

          <div className="live-status-copy">
            <p>Streaming status</p>
            <h2>
              {activeStream?.status || 'Ready'}
            </h2>
            <span>
              {streams.length} public streams active
            </span>
          </div>

          <button
            type="button"
            className="live-primary-button"
            onClick={handleStart}
            disabled={guest || busy}
          >
            <Play size={15} />
            Start live
          </button>
        </section>

        <section className="live-metric-grid">
          <article className="live-metric">
            <Users size={18} />
            <span>Viewers</span>
            <strong>{viewerCount}</strong>
          </article>

          <article className="live-metric">
            <MessageCircle size={18} />
            <span>Chat activity</span>
            <strong>
              {analytics?.chat_messages || 0}
            </strong>
          </article>

          <article className="live-metric">
            <Eye size={18} />
            <span>Reactions</span>
            <strong>
              {analytics?.reactions || 0}
            </strong>
          </article>

          <article className="live-metric">
            <Radio size={18} />
            <span>Health</span>
            <strong>
              {health?.connection_quality ||
                'Unknown'}
            </strong>
          </article>
        </section>

        {activeStream ? (
          <section className="live-section">
            <div className="live-section-heading">
              <Radio size={17} />
              <div>
                <h2>Live session</h2>
                <p>
                  Manage your current broadcast session.
                </p>
              </div>
            </div>

            <div className="live-card">
              <ActionRow
                icon={<Pause size={18} />}
                title="Pause stream"
                description="Temporarily pause viewer delivery."
                onClick={() =>
                  runAction(
                    () =>
                      pauseLiveStream(
                        activeStream.id
                      ),
                    'Stream paused.'
                  )
                }
                disabled={busy}
              />

              <ActionRow
                icon={<Play size={18} />}
                title="Resume stream"
                description="Resume the current broadcast."
                onClick={() =>
                  runAction(
                    () =>
                      resumeLiveStream(
                        activeStream.id
                      ),
                    'Stream resumed.'
                  )
                }
                disabled={busy}
              />

              <ActionRow
                icon={<Square size={18} />}
                title="Stop stream"
                description="End and archive the broadcast."
                onClick={() =>
                  runAction(
                    () =>
                      stopLiveStream(
                        activeStream.id
                      ),
                    'Stream stopped.'
                  )
                }
                disabled={busy}
              />
            </div>
          </section>
        ) : null}

        <section className="live-section">
          <div className="live-section-heading">
            <Radio size={17} />
            <div>
              <h2>Active streams</h2>
              <p>
                Browse public broadcasts from Aarush creators.
              </p>
            </div>
          </div>

          <div className="live-card">
            {streams.length === 0 ? (
              <div className="live-empty">
                <Radio size={23} />
                <span>No public streams are live.</span>
              </div>
            ) : (
              streams.map((stream) => (
                <article
                  className="live-stream-row"
                  key={stream.id}
                >
                  <div className="live-stream-icon">
                    <Radio size={17} />
                  </div>

                  <div>
                    <strong>
                      {stream.title || 'Live stream'}
                    </strong>
                    <span>
                      {stream.profiles?.full_name ||
                        stream.profiles?.username ||
                        'Aarush creator'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="live-view-button"
                    onClick={() => {
                      setActiveStream(stream);
                      navigate(
                        `/live/${stream.id}`
                      );
                    }}
                  >
                    Watch
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="live-section">
          <div className="live-section-heading">
            <MessageCircle size={17} />
            <div>
              <h2>Live chat</h2>
              <p>
                Real-time viewer messages and reactions.
              </p>
            </div>
          </div>

          <div className="live-card live-chat-card">
            {activeStream ? (
              <>
                <div className="live-chat-list">
                  {chat.length === 0 ? (
                    <div className="live-empty">
                      <MessageCircle size={22} />
                      <span>No messages yet.</span>
                    </div>
                  ) : (
                    chat.slice(-20).map((message) => (
                      <div
                        className="live-chat-message"
                        key={message.id}
                      >
                        <strong>
                          {message.profiles?.username ||
                            'Viewer'}
                        </strong>
                        <span>{message.message}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="live-chat-input">
                  <input
                    value={chatMessage}
                    onChange={(event) =>
                      setChatMessage(
                        event.target.value
                      )
                    }
                    placeholder="Send a message"
                    disabled={guest || busy}
                  />

                  <button
                    type="button"
                    onClick={handleChat}
                    disabled={
                      guest ||
                      busy ||
                      !chatMessage.trim()
                    }
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="live-empty">
                <MessageCircle size={22} />
                <span>
                  Start or join a stream to open live chat.
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="live-section">
          <div className="live-section-heading">
            <Shield size={17} />
            <div>
              <h2>Moderation</h2>
              <p>
                Prepare filtering, slow mode, reports, mute, and block controls.
              </p>
            </div>
          </div>

          <div className="live-card">
            <ActionRow
              icon={<Shield size={18} />}
              title="Moderate chat"
              description="Open message filtering and viewer controls."
              onClick={() =>
                setNotice(
                  'Moderation controls are prepared for integration.'
                )
              }
              disabled={busy || guest}
            />

            <ActionRow
              icon={<Users size={18} />}
              title="Viewer management"
              description="Review join, leave, mute, and block events."
              onClick={() =>
                setNotice(
                  'Viewer management is ready for integration.'
                )
              }
              disabled={busy || guest}
            />

            <ActionRow
              icon={<Eye size={18} />}
              title="View analytics"
              description="Review watch time, retention, conversion, and engagement."
              onClick={() =>
                navigate('/live-analytics')
              }
              disabled={busy}
            />
          </div>
        </section>

        <p className="live-footer">
          Live streaming is prepared for RTMP, WebRTC,
          CDN delivery, moderation, and server-side stream
          analytics integrations.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .live-page {
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

  .live-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .live-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .live-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .live-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .live-icon-button {
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

  .live-icon-button:last-child {
    justify-self: end;
  }

  .live-error,
  .live-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .live-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .live-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .live-status-card,
  .live-card,
  .live-metric {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .live-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .live-status-icon {
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

  .live-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .live-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .live-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .live-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .live-primary-button {
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

  .live-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .live-section {
    margin-top: 1.3rem;
  }

  .live-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .live-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .live-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .live-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .live-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .live-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .live-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .live-metric strong {
    color: #edf2ff;
    font-size: 0.9rem;
    text-transform: capitalize;
  }

  .live-action-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .live-action-row + .live-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .live-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .live-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .live-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .live-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .live-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .live-action-row > svg {
    color: #7483a1;
  }

  .live-stream-row,
  .live-chat-message {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 4rem;
    padding: 0.75rem 0.9rem;
  }

  .live-stream-row + .live-stream-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .live-stream-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    place-items: center;
    border-radius: 0.75rem;
    color: #ff9bb4;
    background: rgba(255,91,132,0.12);
  }

  .live-stream-row > div:nth-child(2) {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .live-stream-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .live-stream-row span {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .live-view-button {
    min-height: 2.1rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid rgba(77,215,255,0.2);
    border-radius: 0.65rem;
    color: #c9f9ff;
    background: rgba(77,215,255,0.08);
    font-size: 0.66rem;
    font-weight: 850;
    cursor: pointer;
  }

  .live-chat-list {
    max-height: 16rem;
    overflow-y: auto;
  }

  .live-chat-message {
    align-items: flex-start;
    display: grid;
    gap: 0.15rem;
    min-height: auto;
    color: #c8bfff;
  }

  .live-chat-message strong {
    font-size: 0.68rem;
  }

  .live-chat-message span {
    color: #dce5f7;
    font-size: 0.72rem;
  }

  .live-chat-input {
    display: flex;
    gap: 0.45rem;
    padding: 0.75rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .live-chat-input input {
    min-width: 0;
    flex: 1;
    min-height: 2.5rem;
    padding: 0.6rem 0.7rem;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.7rem;
    outline: 0;
    color: #edf2ff;
    background: rgba(255,255,255,0.05);
    font: inherit;
    font-size: 0.72rem;
  }

  .live-chat-input button {
    min-height: 2.5rem;
    padding: 0.6rem 0.75rem;
    border: 0;
    border-radius: 0.7rem;
    color: #fff;
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
    font-size: 0.68rem;
    font-weight: 850;
    cursor: pointer;
  }

  .live-chat-input button:disabled {
    opacity: 0.5;
    cursor: wait;
  }

  .live-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 5rem;
    color: #8491ad;
    font-size: 0.75rem;
  }

  .live-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .live-loading-header,
  .live-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: live-skeleton 1.4s infinite;
  }

  .live-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .live-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes live-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .live-metric-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .live-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .live-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .live-primary-button {
      margin-left: auto;
    }
  }
`;