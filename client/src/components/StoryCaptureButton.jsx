import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const HOLD_DELAY = 260;
const DEFAULT_MAX_DURATION = 15000;

function browser() {
  return typeof window !== 'undefined';
}

function safeHaptic(pattern) {
  if (
    browser() &&
    typeof navigator.vibrate === 'function'
  ) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Haptics are optional and may be unavailable.
    }
  }
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export default function StoryCaptureButton({
  isRecording = false,
  disabled = false,
  progress,
  size = 88,
  onCapturePhoto,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  maxDuration = DEFAULT_MAX_DURATION,
  countdown = false,
}) {
  const buttonRef = useRef(null);
  const holdTimerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startedAtRef = useRef(0);
  const pointerIdRef = useRef(null);
  const longPressRef = useRef(false);
  const mountedRef = useRef(true);

  const [pressed, setPressed] = useState(false);
  const [recordingProgress, setRecordingProgress] =
    useState(0);
  const [captureFlash, setCaptureFlash] =
    useState(false);
  const [internalRecording, setInternalRecording] =
    useState(Boolean(isRecording));

  const recording =
    Boolean(isRecording) || internalRecording;

  const radius = Math.max(30, Number(size) / 2 - 8);
  const strokeWidth = Math.max(4, Number(size) * 0.075);
  const circumference = 2 * Math.PI * radius;

  const externalProgress =
    typeof progress === 'number'
      ? clamp(progress, 0, 1)
      : null;

  const visibleProgress =
    externalProgress === null
      ? recordingProgress
      : externalProgress;

  const dashOffset =
    circumference * (1 - visibleProgress);

  const buttonSize = Math.max(64, Number(size));
  const ringSize = buttonSize + 22;

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const stopProgressLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(
        animationFrameRef.current
      );
      animationFrameRef.current = null;
    }
  }, []);

  const runProgressLoop = useCallback(() => {
    stopProgressLoop();

    if (!mountedRef.current || !recording) {
      return;
    }

    const update = () => {
      if (!mountedRef.current) return;

      const elapsed = Date.now() - startedAtRef.current;
      const nextProgress = clamp(
        elapsed / Math.max(1, maxDuration),
        0,
        1
      );

      if (externalProgress === null) {
        setRecordingProgress(nextProgress);
      }

      if (nextProgress >= 1) {
        setInternalRecording(false);
        setPressed(false);
        safeHaptic([20, 35, 20]);
        onStopRecording?.();
        stopProgressLoop();
        return;
      }

      animationFrameRef.current =
        window.requestAnimationFrame(update);
    };

    animationFrameRef.current =
      window.requestAnimationFrame(update);
  }, [
    externalProgress,
    maxDuration,
    onStopRecording,
    recording,
    stopProgressLoop,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    setInternalRecording(Boolean(isRecording));

    return () => {
      mountedRef.current = false;
      clearHoldTimer();
      stopProgressLoop();
    };
  }, [clearHoldTimer, isRecording, stopProgressLoop]);

  useEffect(() => {
    if (recording) {
      runProgressLoop();
    } else {
      stopProgressLoop();

      if (externalProgress === null) {
        setRecordingProgress(0);
      }
    }

    return stopProgressLoop;
  }, [
    externalProgress,
    recording,
    runProgressLoop,
    stopProgressLoop,
  ]);

  const beginRecording = useCallback(() => {
    if (
      disabled ||
      recording ||
      longPressRef.current
    ) {
      return;
    }

    longPressRef.current = true;
    startedAtRef.current = Date.now();
    setInternalRecording(true);
    setRecordingProgress(0);
    safeHaptic(45);
    onStartRecording?.();
  }, [disabled, onStartRecording, recording]);

  const finishRecording = useCallback(() => {
    if (!recording) return;

    setInternalRecording(false);
    setPressed(false);
    setRecordingProgress(1);
    stopProgressLoop();
    safeHaptic([20, 35, 20]);
    onStopRecording?.();

    window.setTimeout(() => {
      if (mountedRef.current) {
        setRecordingProgress(0);
      }
    }, 180);
  }, [onStopRecording, recording, stopProgressLoop]);

  const cancelRecording = useCallback(() => {
    clearHoldTimer();
    stopProgressLoop();

    if (recording) {
      setInternalRecording(false);
      setRecordingProgress(0);
      setPressed(false);
      longPressRef.current = false;
      safeHaptic(20);
      onCancelRecording?.();
    }
  }, [
    clearHoldTimer,
    onCancelRecording,
    recording,
    stopProgressLoop,
  ]);

  const capturePhoto = useCallback(() => {
    if (disabled || recording) return;

    setCaptureFlash(true);
    setPressed(true);
    safeHaptic(12);
    onCapturePhoto?.();

    window.setTimeout(() => {
      if (mountedRef.current) {
        setCaptureFlash(false);
        setPressed(false);
      }
    }, 170);
  }, [disabled, onCapturePhoto, recording]);

  const handlePointerDown = useCallback(
    (event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      pointerIdRef.current = event.pointerId;
      longPressRef.current = false;
      setPressed(true);

      try {
        event.currentTarget.setPointerCapture(
          event.pointerId
        );
      } catch {
        // Pointer capture is optional.
      }

      clearHoldTimer();

      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = null;
        beginRecording();
      }, HOLD_DELAY);
    },
    [beginRecording, clearHoldTimer, disabled]
  );

  const handlePointerUp = useCallback(
    (event) => {
      if (disabled) return;

      clearHoldTimer();

      try {
        if (
          pointerIdRef.current !== null &&
          event.currentTarget.hasPointerCapture(
            pointerIdRef.current
          )
        ) {
          event.currentTarget.releasePointerCapture(
            pointerIdRef.current
          );
        }
      } catch {
        // Pointer capture cleanup is optional.
      }

      pointerIdRef.current = null;

      if (recording || longPressRef.current) {
        finishRecording();
        longPressRef.current = false;
        return;
      }

      capturePhoto();
    },
    [
      capturePhoto,
      clearHoldTimer,
      disabled,
      finishRecording,
      recording,
    ]
  );

  const handlePointerCancel = useCallback(() => {
    pointerIdRef.current = null;
    cancelRecording();
    longPressRef.current = false;
  }, [cancelRecording]);

  const handleKeyDown = useCallback(
    (event) => {
      if (
        disabled ||
        (event.key !== 'Enter' &&
          event.key !== ' ')
      ) {
        return;
      }

      event.preventDefault();

      if (event.repeat) return;

      setPressed(true);
      beginRecording();
    },
    [beginRecording, disabled]
  );

  const handleKeyUp = useCallback(
    (event) => {
      if (
        event.key !== 'Enter' &&
        event.key !== ' '
      ) {
        return;
      }

      event.preventDefault();

      if (recording || longPressRef.current) {
        finishRecording();
        longPressRef.current = false;
      } else {
        capturePhoto();
      }
    },
    [capturePhoto, finishRecording, recording]
  );

  const progressLabel = useMemo(() => {
    if (!recording || !countdown) return '';

    const remaining = Math.max(
      0,
      Math.ceil(
        (1 - visibleProgress) *
          (maxDuration / 1000)
      )
    );

    return `${remaining}s`;
  }, [
    countdown,
    maxDuration,
    recording,
    visibleProgress,
  ]);

  const buttonLabel = recording
    ? 'Release to stop story recording'
    : 'Tap to capture a photo, hold to record video';

  return (
    <div
      className={[
        'aarush-story-capture-wrap',
        recording
          ? 'aarush-story-capture-recording'
          : '',
        pressed
          ? 'aarush-story-capture-pressed'
          : '',
        disabled
          ? 'aarush-story-capture-disabled'
          : '',
      ].join(' ')}
      style={{
        width: ringSize,
        height: ringSize,
      }}
    >
      <span
        className="aarush-story-capture-glow"
        aria-hidden="true"
      />

      <svg
        className="aarush-story-capture-progress"
        width={ringSize}
        height={ringSize}
        viewBox={`0 0 ${ringSize} ${ringSize}`}
        aria-hidden="true"
      >
        <circle
          className="aarush-story-capture-track"
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />

        <circle
          className="aarush-story-capture-ring"
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          pathLength="1"
        />
      </svg>

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-label={buttonLabel}
        aria-pressed={recording}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={
          recording ? undefined : handlePointerCancel
        }
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className="aarush-story-capture-button"
        style={{
          width: buttonSize,
          height: buttonSize,
        }}
      >
        <span
          className="aarush-story-capture-inner"
          aria-hidden="true"
        />

        {recording ? (
          <span
            className="aarush-story-capture-record-dot"
            aria-hidden="true"
          />
        ) : null}

        {progressLabel ? (
          <span className="aarush-story-capture-countdown">
            {progressLabel}
          </span>
        ) : null}
      </button>

      {captureFlash ? (
        <span
          className="aarush-story-capture-flash"
          aria-hidden="true"
        />
      ) : null}

      <style>{`
        .aarush-story-capture-wrap {
          position: relative;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          isolation: isolate;
        }

        .aarush-story-capture-glow {
          position: absolute;
          inset: 5px;
          z-index: 0;
          border-radius: 999px;
          background:
            radial-gradient(
              circle,
              rgba(124,92,255,.34) 0%,
              rgba(77,215,255,.16) 42%,
              transparent 72%
            );
          filter: blur(8px);
          opacity: .72;
          transition:
            transform 180ms ease,
            opacity 180ms ease,
            filter 180ms ease;
        }

        .aarush-story-capture-progress {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: visible;
          transform: rotate(-90deg);
          pointer-events: none;
        }

        .aarush-story-capture-track {
          stroke: rgba(255,255,255,.22);
        }

        .aarush-story-capture-ring {
          stroke: #4dd7ff;
          stroke-linecap: round;
          transition:
            stroke-dashoffset 80ms linear,
            stroke 180ms ease;
          filter:
            drop-shadow(0 0 5px rgba(77,215,255,.62));
        }

        .aarush-story-capture-recording
          .aarush-story-capture-ring {
          stroke: #ff5b84;
          filter:
            drop-shadow(0 0 7px rgba(255,91,132,.75));
        }

        .aarush-story-capture-button {
          position: relative;
          z-index: 2;
          display: grid;
          place-items: center;
          padding: 0;
          border: 4px solid rgba(255,255,255,.96);
          border-radius: 999px;
          background: rgba(255,255,255,.1);
          box-shadow:
            0 0 0 5px rgba(255,255,255,.12),
            0 12px 34px rgba(0,0,0,.36);
          cursor: pointer;
          touch-action: none;
          transition:
            transform 145ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease,
            opacity 180ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .aarush-story-capture-button:hover {
          transform: scale(1.04);
        }

        .aarush-story-capture-button:active {
          transform: scale(.93);
        }

        .aarush-story-capture-button:focus-visible {
          outline: 3px solid #4dd7ff;
          outline-offset: 5px;
        }

        .aarush-story-capture-inner {
          width: 76%;
          height: 76%;
          border-radius: 999px;
          background:
            linear-gradient(145deg,#ffffff,#dce6fb);
          box-shadow:
            inset 0 1px 3px rgba(255,255,255,.9),
            0 2px 7px rgba(0,0,0,.2);
          transition:
            width 180ms ease,
            height 180ms ease,
            background 180ms ease,
            border-radius 180ms ease;
        }

        .aarush-story-capture-recording
          .aarush-story-capture-button {
          border-color: #ffb1c8;
          box-shadow:
            0 0 0 5px rgba(255,91,132,.2),
            0 0 28px rgba(255,91,132,.45),
            0 12px 34px rgba(0,0,0,.38);
          animation:
            aarush-story-capture-pulse 1.2s ease-in-out infinite;
        }

        .aarush-story-capture-recording
          .aarush-story-capture-inner {
          width: 48%;
          height: 48%;
          border-radius: .6rem;
          background:
            linear-gradient(145deg,#ff779a,#ff426f);
        }

        .aarush-story-capture-record-dot {
          position: absolute;
          z-index: 3;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #fff;
          box-shadow: 0 0 9px rgba(255,255,255,.9);
        }

        .aarush-story-capture-countdown {
          position: absolute;
          z-index: 4;
          color: #fff;
          font-size: .65rem;
          font-weight: 850;
          text-shadow: 0 1px 6px rgba(0,0,0,.55);
        }

        .aarush-story-capture-flash {
          position: absolute;
          inset: -10px;
          z-index: 5;
          border: 2px solid rgba(255,255,255,.9);
          border-radius: 999px;
          pointer-events: none;
          animation: aarush-story-capture-flash .17s ease-out both;
        }

        .aarush-story-capture-pressed
          .aarush-story-capture-glow {
          opacity: 1;
          transform: scale(1.08);
          filter: blur(11px);
        }

        .aarush-story-capture-disabled {
          opacity: .48;
          pointer-events: none;
        }

        @keyframes aarush-story-capture-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.045);
          }
        }

        @keyframes aarush-story-capture-flash {
          from {
            opacity: .95;
            transform: scale(.72);
          }
          to {
            opacity: 0;
            transform: scale(1.2);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-story-capture-button,
          .aarush-story-capture-glow,
          .aarush-story-capture-ring,
          .aarush-story-capture-inner {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}