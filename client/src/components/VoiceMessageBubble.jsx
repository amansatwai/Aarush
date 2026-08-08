import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCheck,
  Clock3,
  Copy,
  Download,
  FileText,
  Flag,
  Forward,
  Languages,
  Pause,
  Play,
  Save,
  Shield,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';

const SPEED_STORAGE_KEY = 'aarush_voice_playback_speed';
const LONG_PRESS_DURATION = 650;

const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 1.75, 2];

const ACTIONS = [
  ['Reply', Forward],
  ['Forward', Forward],
  ['Copy Transcript', Copy],
  ['Translate', Languages],
  ['AI Summarize', Sparkles],
  ['Save To Vault', Save],
  ['Export Audio', Download],
  ['Download', Download],
  ['Delete For Me', Trash2],
  ['Delete For Everyone', Trash2],
  ['Report', Flag],
  ['Message Info', FileText],
];

function formatTime(seconds) {
  const safeSeconds = Math.max(
    0,
    Number.isFinite(seconds) ? Math.floor(seconds) : 0
  );

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = String(safeSeconds % 60).padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
}

function readSpeed() {
  if (typeof window === 'undefined') {
    return 1;
  }

  try {
    const value = Number(
      window.localStorage.getItem(SPEED_STORAGE_KEY)
    );

    return PLAYBACK_SPEEDS.includes(value) ? value : 1;
  } catch {
    return 1;
  }
}

function writeSpeed(value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      SPEED_STORAGE_KEY,
      String(value)
    );
  } catch {
    // Playback preference persistence is best effort.
  }
}

function StatusIcon({ status }) {
  if (status === 'sending') {
    return <Clock3 size={12} aria-label="Sending" />;
  }

  if (status === 'sent') {
    return <Check size={12} aria-label="Sent" />;
  }

  if (status === 'delivered') {
    return <CheckCheck size={12} aria-label="Delivered" />;
  }

  if (status === 'read') {
    return (
      <CheckCheck
        size={12}
        color="#4dd7ff"
        aria-label="Read"
      />
    );
  }

  if (status === 'failed') {
    return (
      <Shield
        size={12}
        color="#ff9eb8"
        aria-label="Failed"
      />
    );
  }

  if (status === 'scheduled') {
    return (
      <Clock3
        size={12}
        color="#d7c6ff"
        aria-label="Scheduled"
      />
    );
  }

  if (status === 'expired') {
    return (
      <Clock3
        size={12}
        color="#ffcf8a"
        aria-label="Expired"
      />
    );
  }

  return null;
}

function createWaveform(input) {
  if (Array.isArray(input) && input.length > 0) {
    return input.map((value) => {
      const number = Number(value);

      if (!Number.isFinite(number)) {
        return 0.45;
      }

      return Math.max(0.12, Math.min(1, number));
    });
  }

  return Array.from({ length: 48 }, (_, index) => {
    const pattern = Math.sin(index * 1.45) * 0.28;
    const variation = ((index * 17) % 29) / 100;

    return Math.max(
      0.18,
      Math.min(1, 0.52 + pattern + variation)
    );
  });
}

function VoiceMessageBubble({
  id,
  audioUrl,
  duration: durationProp,
  waveform: waveformProp,
  isOutgoing = false,
  timestamp,
  status = '',
  transcription = '',
  aiState = '',
  isDisappearing = false,
  expiresAt,
  sensitive = false,
  hidden = false,
  locked = false,
  isAI = false,
  onPlay,
  onPause,
  onSeek,
  onLongPress,
  onAction,
  onDownload,
  onTranscribe,
  className = '',
  style = {},
}) {
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const pointerActiveRef = useRef(false);
  const isMountedRef = useRef(true);

  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(
    Number(durationProp) || 0
  );
  const [speed, setSpeed] = useState(readSpeed);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [transcriptionOpen, setTranscriptionOpen] =
    useState(Boolean(transcription));
  const [remaining, setRemaining] = useState(null);

  const waveform = useMemo(
    () => createWaveform(waveformProp),
    [waveformProp]
  );

  const totalDuration =
    audioDuration || Number(durationProp) || 0;

  const progress =
    totalDuration > 0
      ? Math.min(1, currentTime / totalDuration)
      : 0;

  const effectiveHidden = hidden || locked;
  const displayTranscription = transcription || '';

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    writeSpeed(speed);

    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  useEffect(() => {
    if (!isDisappearing || !expiresAt) {
      setRemaining(null);
      return undefined;
    }

    const updateRemaining = () => {
      const difference = Math.max(
        0,
        new Date(expiresAt).getTime() - Date.now()
      );

      setRemaining(difference);
    };

    updateRemaining();

    const interval = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(interval);
  }, [expiresAt, isDisappearing]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !audioUrl) {
      return undefined;
    }

    const handleLoadedMetadata = () => {
      if (!Number.isFinite(audio.duration)) {
        return;
      }

      setAudioDuration(audio.duration);
      setLoaded(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setPlaying(true);
    };

    const handlePause = () => {
      setPlaying(false);
    };

    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener(
      'loadedmetadata',
      handleLoadedMetadata
    );
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener(
        'loadedmetadata',
        handleLoadedMetadata
      );
      audio.removeEventListener(
        'timeupdate',
        handleTimeUpdate
      );
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const play = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      onPlay?.({ id, audioUrl });
      return;
    }

    try {
      audio.playbackRate = speed;
      await audio.play();
      onPlay?.({
        id,
        audioUrl,
        currentTime: audio.currentTime,
        speed,
      });
    } catch {
      onPlay?.({
        id,
        audioUrl,
        failed: true,
      });
    }
  }, [audioUrl, id, onPlay, speed]);

  const pause = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
    }

    onPause?.({
      id,
      audioUrl,
      currentTime: audio?.currentTime || currentTime,
    });
  }, [audioUrl, currentTime, id, onPause]);

  const togglePlayback = () => {
    if (playing) {
      pause();
      return;
    }

    play();
  };

  const seekTo = useCallback(
    (clientX) => {
      const waveformElement = waveformRef.current;

      if (!waveformElement) {
        return;
      }

      const bounds = waveformElement.getBoundingClientRect();
      const offset = Math.max(
        0,
        Math.min(bounds.width, clientX - bounds.left)
      );
      const ratio = bounds.width > 0 ? offset / bounds.width : 0;
      const nextTime = ratio * totalDuration;

      if (audioRef.current) {
        audioRef.current.currentTime = nextTime;
      }

      setCurrentTime(nextTime);

      onSeek?.({
        id,
        audioUrl,
        currentTime: nextTime,
        progress: ratio,
      });
    },
    [audioUrl, id, onSeek, totalDuration]
  );

  const handleWaveformPointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    seekTo(event.clientX);
  };

  const handleWaveformPointerMove = (event) => {
    if (event.buttons === 0) {
      return;
    }

    seekTo(event.clientX);
  };

  const handleSpeedChange = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(speed);
    const nextSpeed =
      PLAYBACK_SPEEDS[
        (currentIndex + 1) % PLAYBACK_SPEEDS.length
      ];

    setSpeed(nextSpeed);
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const openActionSheet = () => {
    setActionSheetOpen(true);

    onLongPress?.({
      id,
      audioUrl,
      duration: totalDuration,
      transcription,
    });
  };

  const handlePointerDown = () => {
    pointerActiveRef.current = true;
    clearLongPress();

    longPressTimerRef.current = window.setTimeout(() => {
      if (pointerActiveRef.current) {
        openActionSheet();
      }
    }, LONG_PRESS_DURATION);
  };

  const handlePointerUp = () => {
    clearLongPress();
    pointerActiveRef.current = false;
  };

  const handlePointerCancel = () => {
    clearLongPress();
    pointerActiveRef.current = false;
  };

  const handleAction = (label) => {
    setActionSheetOpen(false);

    if (label === 'Download') {
      if (onDownload) {
        onDownload({
          id,
          audioUrl,
          duration: totalDuration,
        });
        return;
      }

      if (audioUrl && typeof document !== 'undefined') {
        const anchor = document.createElement('a');
        anchor.href = audioUrl;
        anchor.download = `aarush-voice-${id || Date.now()}.webm`;
        anchor.click();
      }

      return;
    }

    if (label === 'Copy Transcript') {
      if (
        displayTranscription &&
        typeof navigator !== 'undefined' &&
        navigator.clipboard
      ) {
        navigator.clipboard.writeText(displayTranscription);
      }
    }

    onAction?.(label, {
      id,
      audioUrl,
      duration: totalDuration,
      transcription: displayTranscription,
    });
  };

  const displayTime =
    timestamp
      ? new Date(timestamp).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })
      : '';

  const isExpired =
    status === 'expired' ||
    (isDisappearing && remaining !== null && remaining === 0);

  return (
    <>
      <div
        className={className}
        style={{
          ...styles.messageGroup,
          justifyItems: isOutgoing ? 'end' : 'start',
          ...style,
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        onContextMenu={(event) => {
          event.preventDefault();
          openActionSheet();
        }}
      >
        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          preload="metadata"
          style={styles.hiddenAudio}
          onLoadedMetadata={() => setLoaded(true)}
        />

        <div
          style={{
            ...styles.bubble,
            ...(isOutgoing
              ? styles.outgoingBubble
              : styles.incomingBubble),
            ...(isAI ? styles.aiBubble : {}),
            ...(effectiveHidden ? styles.hiddenBubble : {}),
          }}
          tabIndex={0}
          role="group"
          aria-label="Voice message"
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              togglePlayback();
            }

            if (event.key === 'ArrowRight') {
              seekTo(
                (waveformRef.current?.getBoundingClientRect()
                  .left || 0) +
                  (progress + 0.05) *
                    (waveformRef.current?.getBoundingClientRect()
                      .width || 0)
              );
            }

            if (event.key === 'ArrowLeft') {
              seekTo(
                (waveformRef.current?.getBoundingClientRect()
                  .left || 0) +
                  (progress - 0.05) *
                    (waveformRef.current?.getBoundingClientRect()
                      .width || 0)
              );
            }
          }}
        >
          {isAI || aiState ? (
            <div style={styles.aiLabel}>
              <Sparkles size={12} />
              {aiState || 'AI voice message'}
            </div>
          ) : null}

          {effectiveHidden ? (
            <div style={styles.hiddenContent}>
              <Shield size={21} />
              <span>
                {locked
                  ? 'Locked voice message'
                  : 'Voice message hidden by privacy settings'}
              </span>
            </div>
          ) : isExpired ? (
            <div style={styles.hiddenContent}>
              <Clock3 size={21} />
              <span>Voice message expired</span>
            </div>
          ) : (
            <div style={styles.playerRow}>
              <button
                type="button"
                onClick={togglePlayback}
                style={styles.playButton}
                aria-label={
                  playing
                    ? 'Pause voice message'
                    : 'Play voice message'
                }
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>

              <div style={styles.playerBody}>
                <div
                  ref={waveformRef}
                  style={styles.waveform}
                  role="slider"
                  tabIndex={0}
                  aria-label="Voice message progress"
                  aria-valuemin="0"
                  aria-valuemax={Math.round(totalDuration)}
                  aria-valuenow={Math.round(currentTime)}
                  onPointerDown={handleWaveformPointerDown}
                  onPointerMove={handleWaveformPointerMove}
                >
                  {waveform.map((height, index) => {
                    const barProgress =
                      waveform.length > 1
                        ? index / (waveform.length - 1)
                        : 0;

                    return (
                      <span
                        key={`${id || 'voice'}-${index}`}
                        style={{
                          ...styles.waveBar,
                          height: `${8 + height * 22}px`,
                          background:
                            barProgress <= progress
                              ? 'linear-gradient(180deg, #ffffff, #a9edff)'
                              : isOutgoing
                                ? 'rgba(255,255,255,0.45)'
                                : 'rgba(164,182,219,0.65)',
                          boxShadow:
                            playing && barProgress <= progress
                              ? '0 0 6px rgba(169,237,255,0.5)'
                              : 'none',
                        }}
                      />
                    );
                  })}

                  <span
                    style={{
                      ...styles.progressLine,
                      left: `${progress * 100}%`,
                    }}
                  />
                </div>

                <div style={styles.playerMeta}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(totalDuration)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSpeedChange}
                style={styles.speedButton}
                aria-label={`Playback speed ${speed} times`}
              >
                {speed}×
              </button>
            </div>
          )}

          <div style={styles.footer}>
            <span>{displayTime}</span>

            {loaded && !isExpired ? (
              <span style={styles.loadedLabel}>Ready</span>
            ) : null}

            {isDisappearing ? (
              <span style={styles.expiringLabel}>
                <Clock3 size={10} />
                {remaining === null
                  ? 'Disappearing'
                  : remaining > 0
                    ? `${Math.ceil(remaining / 1000)}s`
                    : 'Expired'}
              </span>
            ) : null}

            {transcription ? (
              <button
                type="button"
                onClick={() =>
                  setTranscriptionOpen((value) => !value)
                }
                style={styles.transcriptionButton}
              >
                <FileText size={11} />
                AI transcript
              </button>
            ) : null}

            {isOutgoing ? (
              <StatusIcon status={status} />
            ) : null}

            {status === 'scheduled' ? (
              <Clock3 size={12} color="#d7c6ff" />
            ) : null}
          </div>

          {transcription && transcriptionOpen ? (
            <div style={styles.transcription}>
              <div style={styles.transcriptionHeader}>
                <span>
                  <FileText size={12} />
                  Transcription
                </span>

                <button
                  type="button"
                  onClick={() => setTranscriptionOpen(false)}
                  style={styles.transcriptionClose}
                  aria-label="Hide transcription"
                >
                  <X size={12} />
                </button>
              </div>

              <p>{transcription}</p>

              {aiState ? (
                <small>
                  <Languages size={11} />
                  {aiState}
                </small>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {actionSheetOpen ? (
        <div
          style={styles.overlay}
          onClick={() => setActionSheetOpen(false)}
          role="presentation"
        >
          <div
            style={styles.actionSheet}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Voice message actions"
          >
            <div style={styles.sheetHandle} />

            <div style={styles.sheetHeader}>
              <div>
                <strong>Voice message actions</strong>
                <span>
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActionSheetOpen(false)}
                style={styles.closeButton}
                aria-label="Close voice message actions"
              >
                <X size={16} />
              </button>
            </div>

            <div style={styles.actionGrid}>
              {ACTIONS.map(([label, Icon]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => handleAction(label)}
                  style={{
                    ...styles.actionButton,
                    ...(label.includes('Delete')
                      ? styles.dangerAction
                      : {}),
                  }}
                >
                  <span style={styles.actionIcon}>
                    <Icon size={15} />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .aarush-voice-message {
          animation: aarush-voice-message-in 180ms ease both;
        }

        .aarush-voice-message:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 3px;
        }

        @keyframes aarush-voice-message-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-voice-message,
          .aarush-voice-message * {
            animation: none !important;
            transition: none !important;
          }
        }

        @media (prefers-contrast: more) {
          .aarush-voice-message {
            border-color: rgba(255,255,255,0.38) !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  messageGroup: {
    display: 'grid',
    gap: '0.22rem',
    width: '100%',
    animation: 'aarush-voice-message-in 180ms ease both',
  },

  hiddenAudio: {
    display: 'none',
  },

  bubble: {
    maxWidth: 'min(86%, 34rem)',
    minWidth: '16rem',
    padding: '0.7rem 0.78rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.15rem',
    boxShadow: '0 15px 32px rgba(0,0,0,0.17)',
    transition:
      'filter 180ms ease, border-color 180ms ease, background 180ms ease',
  },

  outgoingBubble: {
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.94), rgba(37,142,216,0.9))',
    borderBottomRightRadius: '0.35rem',
    boxShadow: '0 15px 34px rgba(60,75,190,0.25)',
  },

  incomingBubble: {
    color: '#edf3ff',
    background:
      'linear-gradient(145deg, rgba(35,42,59,0.94), rgba(18,23,35,0.94))',
    borderBottomLeftRadius: '0.35rem',
  },

  aiBubble: {
    borderColor: 'rgba(255,79,216,0.22)',
    boxShadow: '0 15px 34px rgba(255,79,216,0.12)',
  },

  hiddenBubble: {
    filter: 'blur(3px)',
  },

  playerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.52rem',
  },

  playButton: {
    width: '2.35rem',
    height: '2.35rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    cursor: 'pointer',
  },

  playerBody: {
    minWidth: 0,
    flex: 1,
  },

  waveform: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.13rem',
    height: '2.1rem',
    overflow: 'hidden',
    cursor: 'pointer',
    touchAction: 'none',
  },

  waveBar: {
    width: '0.14rem',
    minHeight: '0.35rem',
    flexShrink: 0,
    borderRadius: '999px',
    transition:
      'background 180ms ease, box-shadow 180ms ease, height 180ms ease',
  },

  progressLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '1px',
    borderRadius: '999px',
    background: '#ffffff',
    boxShadow: '0 0 8px rgba(255,255,255,0.65)',
    pointerEvents: 'none',
  },

  playerMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '0.1rem',
    color: '#b9c6dc',
    fontSize: '0.62rem',
  },

  speedButton: {
    minWidth: '2.25rem',
    padding: '0.32rem 0.38rem',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.09)',
    fontSize: '0.64rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.32rem',
    marginTop: '0.38rem',
    color: '#8998b3',
    fontSize: '0.62rem',
  },

  loadedLabel: {
    color: '#a9edff',
  },

  expiringLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.18rem',
    color: '#ffcf8a',
  },

  transcriptionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.18rem',
    padding: 0,
    border: 0,
    color: '#d7c6ff',
    background: 'transparent',
    fontSize: '0.62rem',
    cursor: 'pointer',
  },

  aiLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginBottom: '0.35rem',
    color: '#e6cfff',
    fontSize: '0.65rem',
    fontWeight: 850,
  },

  hiddenContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    minHeight: '3rem',
    color: '#aebbd0',
    fontSize: '0.75rem',
    textAlign: 'center',
  },

  transcription: {
    marginTop: '0.6rem',
    padding: '0.55rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '0.7rem',
    background: 'rgba(0,0,0,0.14)',
  },

  transcriptionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.4rem',
    color: '#dce5f8',
    fontSize: '0.68rem',
    fontWeight: 800,
  },

  transcriptionHeaderSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.22rem',
  },

  transcriptionClose: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#c4d0e4',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  transcriptionP: {
    margin: '0.42rem 0',
    color: '#b9c6dc',
    fontSize: '0.72rem',
    lineHeight: 1.5,
  },

  transcriptionSmall: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    color: '#a9edff',
    fontSize: '0.61rem',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'grid',
    alignItems: 'end',
    justifyItems: 'center',
    padding: '1rem',
    background: 'rgba(0,0,0,0.66)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  actionSheet: {
    width: 'min(100%, 560px)',
    maxHeight: '84dvh',
    overflow: 'auto',
    padding: '0.85rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1.35rem',
    background: 'linear-gradient(180deg, #171d2d, #0e1320)',
    boxShadow: '0 28px 80px rgba(0,0,0,0.52)',
  },

  sheetHandle: {
    width: '2.4rem',
    height: '0.22rem',
    margin: '0 auto 0.8rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.2)',
  },

  sheetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    marginBottom: '0.75rem',
    color: '#ffffff',
  },

  sheetHeaderSpan: {
    display: 'block',
    marginTop: '0.2rem',
    color: '#8f9db8',
    fontSize: '0.68rem',
  },

  closeButton: {
    width: '2.1rem',
    height: '2.1rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
    gap: '0.45rem',
  },

  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    minHeight: '2.7rem',
    padding: '0.55rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.8rem',
    color: '#e8eefb',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '0.7rem',
    fontWeight: 750,
    textAlign: 'left',
    cursor: 'pointer',
  },

  dangerAction: {
    color: '#ffb0c4',
    borderColor: 'rgba(255,79,122,0.18)',
    background: 'rgba(255,79,122,0.07)',
  },

  actionIcon: {
    width: '1.85rem',
    height: '1.85rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#d2caff',
    background: 'rgba(124,92,255,0.16)',
  },
};

export default memo(VoiceMessageBubble);