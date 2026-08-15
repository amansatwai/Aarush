import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ChevronDown,
  Grid3X3,
  Lightbulb,
  Settings,
  Timer,
  X,
  Zap,
  ZapOff,
} from 'lucide-react';

const FLASH_MODES = ['auto', 'on', 'off'];
const TIMER_MODES = ['off', '3s', '5s', '10s'];

function normalizeFlashMode(value) {
  const mode = String(value || 'auto').toLowerCase();
  return FLASH_MODES.includes(mode) ? mode : 'auto';
}

function normalizeTimerValue(value) {
  const normalized = String(value || 'off').toLowerCase();

  if (TIMER_MODES.includes(normalized)) {
    return normalized;
  }

  if (normalized === '0' || normalized === 'none') {
    return 'off';
  }

  return 'off';
}

function flashLabel(mode) {
  if (mode === 'on') return 'Flash on';
  if (mode === 'off') return 'Flash off';
  return 'Flash automatic';
}

function timerLabel(value) {
  return value === 'off'
    ? 'Timer off'
    : `Timer ${value}`;
}

export default function StoryTopBar({
  title = 'Aarush Story',
  showFlash = true,
  showTimer = true,
  showGrid = false,
  showSettings = true,
  flashEnabled = 'auto',
  gridEnabled = false,
  timerValue = 'off',
  onClose,
  onFlashToggle,
  onGridToggle,
  onTimerChange,
  onSettings,
}) {
  const [flashMode, setFlashMode] = useState(
    normalizeFlashMode(flashEnabled)
  );
  const [gridActive, setGridActive] =
    useState(Boolean(gridEnabled));
  const [timerMode, setTimerMode] = useState(
    normalizeTimerValue(timerValue)
  );
  const [timerMenuOpen, setTimerMenuOpen] =
    useState(false);

  useEffect(() => {
    setFlashMode(normalizeFlashMode(flashEnabled));
  }, [flashEnabled]);

  useEffect(() => {
    setGridActive(Boolean(gridEnabled));
  }, [gridEnabled]);

  useEffect(() => {
    setTimerMode(normalizeTimerValue(timerValue));
  }, [timerValue]);

  const flashIcon = useMemo(() => {
    if (flashMode === 'off') {
      return <ZapOff size={18} />;
    }

    return <Zap size={18} />;
  }, [flashMode]);

  const handleFlashToggle = useCallback(() => {
    const currentIndex = FLASH_MODES.indexOf(
      flashMode
    );
    const nextMode =
      FLASH_MODES[
        (currentIndex + 1) % FLASH_MODES.length
      ];

    setFlashMode(nextMode);
    onFlashToggle?.(nextMode);
  }, [flashMode, onFlashToggle]);

  const handleGridToggle = useCallback(() => {
    const nextValue = !gridActive;

    setGridActive(nextValue);
    onGridToggle?.(nextValue);
  }, [gridActive, onGridToggle]);

  const handleTimerSelect = useCallback(
    (value) => {
      const nextValue = normalizeTimerValue(value);

      setTimerMode(nextValue);
      setTimerMenuOpen(false);
      onTimerChange?.(nextValue);
    },
    [onTimerChange]
  );

  return (
    <>
      <header className="aarush-story-topbar">
        <div className="aarush-story-topbar-inner">
          <div className="aarush-story-topbar-side aarush-story-topbar-left">
            {typeof onClose === 'function' ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close story"
                className="aarush-story-topbar-button"
              >
                <X size={20} />
              </button>
            ) : (
              <span
                aria-hidden="true"
                className="aarush-story-topbar-spacer"
              />
            )}
          </div>

          <div
            className="aarush-story-topbar-title"
            aria-live="polite"
          >
            {title || 'Aarush Story'}
          </div>

          <div className="aarush-story-topbar-side aarush-story-topbar-right">
            {showFlash ? (
              <button
                type="button"
                onClick={handleFlashToggle}
                aria-label={`${flashLabel(flashMode)}. Tap to change.`}
                aria-pressed={flashMode !== 'off'}
                className={[
                  'aarush-story-topbar-button',
                  flashMode !== 'auto'
                    ? 'aarush-story-topbar-button-active'
                    : '',
                ].join(' ')}
              >
                {flashIcon}
                <span className="aarush-story-topbar-status">
                  {flashMode === 'auto'
                    ? 'A'
                    : flashMode === 'on'
                      ? 'On'
                      : 'Off'}
                </span>
              </button>
            ) : null}

            {showTimer ? (
              <div className="aarush-story-topbar-menu-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setTimerMenuOpen((value) => !value)
                  }
                  aria-label={`${timerLabel(timerMode)}. Tap to change.`}
                  aria-expanded={timerMenuOpen}
                  className={[
                    'aarush-story-topbar-button',
                    timerMode !== 'off'
                      ? 'aarush-story-topbar-button-active'
                      : '',
                  ].join(' ')}
                >
                  <Timer size={18} />
                  {timerMode !== 'off' ? (
                    <span className="aarush-story-topbar-status">
                      {timerMode}
                    </span>
                  ) : null}
                </button>

                {timerMenuOpen ? (
                  <div
                    role="menu"
                    aria-label="Story timer options"
                    className="aarush-story-topbar-menu"
                  >
                    {TIMER_MODES.map((value) => (
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={timerMode === value}
                        key={value}
                        onClick={() =>
                          handleTimerSelect(value)
                        }
                        className={[
                          'aarush-story-topbar-menu-item',
                          timerMode === value
                            ? 'aarush-story-topbar-menu-item-active'
                            : '',
                        ].join(' ')}
                      >
                        {value === 'off'
                          ? 'Off'
                          : value}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {showGrid ? (
              <button
                type="button"
                onClick={handleGridToggle}
                aria-label={
                  gridActive
                    ? 'Hide camera grid'
                    : 'Show camera grid'
                }
                aria-pressed={gridActive}
                className={[
                  'aarush-story-topbar-button',
                  gridActive
                    ? 'aarush-story-topbar-button-active'
                    : '',
                ].join(' ')}
              >
                <Grid3X3 size={18} />
              </button>
            ) : null}

            {showSettings ? (
              <button
                type="button"
                onClick={onSettings}
                aria-label="Open story camera settings"
                className="aarush-story-topbar-button"
              >
                <Settings size={18} />
              </button>
            ) : null}
          </div>
        </div>

        <div
          className={[
            'aarush-story-topbar-underline',
            gridActive
              ? 'aarush-story-topbar-underline-active'
              : '',
          ].join(' ')}
          aria-hidden="true"
        />

        <style>{`
          .aarush-story-topbar {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            z-index: 20;
            width: 100%;
            padding:
              calc(0.65rem + env(safe-area-inset-top))
              0.75rem
              0.65rem;
            pointer-events: none;
            animation: aarush-story-topbar-in 240ms ease both;
          }

          .aarush-story-topbar-inner {
            position: relative;
            width: 100%;
            max-width: 1120px;
            min-height: 2.7rem;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            gap: 0.5rem;
          }

          .aarush-story-topbar-side {
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 0.35rem;
            pointer-events: auto;
          }

          .aarush-story-topbar-left {
            justify-content: flex-start;
          }

          .aarush-story-topbar-right {
            justify-content: flex-end;
          }

          .aarush-story-topbar-title {
            min-width: 0;
            max-width: min(46vw, 18rem);
            overflow: hidden;
            color: #f7f9ff;
            font-size: 0.94rem;
            font-weight: 850;
            line-height: 1.15;
            text-align: center;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-shadow: 0 2px 15px rgba(0,0,0,0.45);
            pointer-events: none;
          }

          .aarush-story-topbar-button {
            position: relative;
            width: 2.65rem;
            height: 2.65rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            gap: 0.15rem;
            padding: 0;
            border: 1px solid rgba(255,255,255,0.16);
            border-radius: 999px;
            color: #ffffff;
            background:
              linear-gradient(
                145deg,
                rgba(255,255,255,0.14),
                rgba(255,255,255,0.045)
              );
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.1),
              0 8px 24px rgba(0,0,0,0.24);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            cursor: pointer;
            pointer-events: auto;
            transition:
              transform 180ms ease,
              background 180ms ease,
              border-color 180ms ease,
              box-shadow 180ms ease;
            -webkit-tap-highlight-color: transparent;
          }

          .aarush-story-topbar-button:hover {
            transform: translateY(-1px);
            background:
              linear-gradient(
                135deg,
                rgba(124,92,255,0.28),
                rgba(77,215,255,0.14)
              );
          }

          .aarush-story-topbar-button:active {
            transform: scale(0.93);
          }

          .aarush-story-topbar-button:focus-visible {
            outline: 2px solid #4dd7ff;
            outline-offset: 3px;
          }

          .aarush-story-topbar-button-active {
            border-color: rgba(124,92,255,0.58);
            background:
              linear-gradient(
                135deg,
                rgba(124,92,255,0.4),
                rgba(77,215,255,0.18)
              );
            box-shadow:
              0 0 22px rgba(124,92,255,0.26),
              0 0 12px rgba(77,215,255,0.12);
            animation: aarush-story-active-glow 2s ease-in-out infinite;
          }

          .aarush-story-topbar-status {
            max-width: 1.15rem;
            overflow: hidden;
            font-size: 0.55rem;
            font-weight: 850;
            line-height: 1;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .aarush-story-topbar-spacer {
            width: 2.65rem;
            height: 2.65rem;
            display: block;
          }

          .aarush-story-topbar-menu-wrap {
            position: relative;
            pointer-events: auto;
          }

          .aarush-story-topbar-menu {
            position: absolute;
            top: calc(100% + 0.55rem);
            right: 0;
            min-width: 6.8rem;
            padding: 0.35rem;
            border: 1px solid rgba(124,92,255,0.3);
            border-radius: 0.9rem;
            background:
              linear-gradient(
                145deg,
                rgba(22,27,44,0.98),
                rgba(8,12,21,0.98)
              );
            box-shadow: 0 18px 45px rgba(0,0,0,0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            animation: aarush-story-menu-in 160ms ease both;
          }

          .aarush-story-topbar-menu-item {
            width: 100%;
            min-height: 2.15rem;
            border: 0;
            border-radius: 0.55rem;
            color: #cbd6ec;
            background: transparent;
            font-size: 0.68rem;
            font-weight: 750;
            text-align: center;
            cursor: pointer;
          }

          .aarush-story-topbar-menu-item:hover,
          .aarush-story-topbar-menu-item:focus-visible {
            color: #ffffff;
            background: rgba(124,92,255,0.18);
            outline: none;
          }

          .aarush-story-topbar-menu-item-active {
            color: #ffffff;
            background:
              linear-gradient(
                135deg,
                rgba(124,92,255,0.28),
                rgba(77,215,255,0.12)
              );
          }

          .aarush-story-topbar-underline {
            width: min(18rem, 42%);
            height: 1px;
            margin: 0.55rem auto 0;
            border-radius: 999px;
            background:
              linear-gradient(
                90deg,
                transparent,
                rgba(255,255,255,0.2),
                transparent
              );
            opacity: 0.7;
            pointer-events: none;
          }

          .aarush-story-topbar-underline-active {
            background:
              linear-gradient(
                90deg,
                transparent,
                #7c5cff,
                #4dd7ff,
                transparent
              );
            box-shadow: 0 0 14px rgba(77,215,255,0.35);
          }

          @keyframes aarush-story-topbar-in {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes aarush-story-menu-in {
            from {
              opacity: 0;
              transform: translateY(-5px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes aarush-story-active-glow {
            0%, 100% {
              box-shadow:
                0 0 18px rgba(124,92,255,0.2),
                0 0 10px rgba(77,215,255,0.08);
            }
            50% {
              box-shadow:
                0 0 25px rgba(124,92,255,0.32),
                0 0 15px rgba(77,215,255,0.16);
            }
          }

          @media (max-width: 420px) {
            .aarush-story-topbar {
              padding-right: 0.5rem;
              padding-left: 0.5rem;
            }

            .aarush-story-topbar-inner {
              gap: 0.25rem;
            }

            .aarush-story-topbar-side {
              gap: 0.2rem;
            }

            .aarush-story-topbar-button,
            .aarush-story-topbar-spacer {
              width: 2.4rem;
              height: 2.4rem;
            }

            .aarush-story-topbar-title {
              max-width: 36vw;
              font-size: 0.86rem;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .aarush-story-topbar,
            .aarush-story-topbar-button,
            .aarush-story-topbar-menu,
            .aarush-story-topbar-button-active {
              animation: none !important;
              transition: none !important;
            }
          }
        `}</style>
      </header>
    </>
  );
}