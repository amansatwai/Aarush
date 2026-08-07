import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SETTINGS_KEY = 'aarush_app_lock_settings';
const STATE_KEY = 'aarush_app_lock_state';
const LOG_KEY = 'aarush_app_lock_security_log';

const DEFAULT_SETTINGS = {
  enabled: false,
  method: 'pin',
  autoLock: 'immediately',
  requireBiometricAfterBackground: true,
  requirePinAfterFailedBiometric: true,
  sensitiveActions: true,
  failedAttemptsPerCycle: 3,
  lockoutDuration: '30',
};

const LOCKOUT_STEPS = [
  { label: '30 seconds', seconds: 30 },
  { label: '1 minute', seconds: 60 },
  { label: '5 minutes', seconds: 300 },
  { label: '15 minutes', seconds: 900 },
  { label: '30 minutes', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
  { label: 'Until verified', seconds: null },
];

function readJson(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function getAutoLockMilliseconds(value) {
  const durations = {
    immediately: 0,
    '5': 5000,
    '15': 15000,
    '30': 30000,
    '60': 60000,
    '300': 300000,
    '600': 600000,
    '1800': 1800000,
    '3600': 3600000,
  };

  return durations[value] ?? 0;
}

function getDeviceName() {
  if (typeof navigator === 'undefined') {
    return 'Unknown device';
  }

  return navigator.userAgent.includes('Mobile')
    ? 'Mobile device'
    : 'Desktop device';
}

export default function useAppLock({
  enabled: enabledOverride,
  autoStart = true,
  onLocked,
  onUnlocked,
} = {}) {
  const [settings, setSettingsState] = useState(() =>
    readJson(SETTINGS_KEY, DEFAULT_SETTINGS)
  );
  const [state, setState] = useState(() =>
    readJson(STATE_KEY, {
      locked: false,
      failedAttempts: 0,
      failedCycles: 0,
      lockoutUntil: null,
      requiresVerifiedRecovery: false,
    })
  );
  const [clock, setClock] = useState(Date.now());
  const timerRef = useRef(null);
  const backgroundAtRef = useRef(null);

  const enabled =
    typeof enabledOverride === 'boolean'
      ? enabledOverride
      : Boolean(settings.enabled);

  const lockoutStep = useMemo(() => {
    const cycleIndex = Math.min(
      state.failedCycles,
      LOCKOUT_STEPS.length - 1
    );

    return LOCKOUT_STEPS[cycleIndex];
  }, [state.failedCycles]);

  const isLockedOut =
    state.requiresVerifiedRecovery ||
    (typeof state.lockoutUntil === 'number' &&
      state.lockoutUntil > clock);

  const lockoutRemaining = useMemo(() => {
    if (state.lockoutUntil === Infinity) {
      return null;
    }

    if (typeof state.lockoutUntil !== 'number') {
      return 0;
    }

    return Math.max(0, state.lockoutUntil - clock);
  }, [clock, state.lockoutUntil]);

  const persistState = useCallback((nextState) => {
    setState(nextState);
    writeJson(STATE_KEY, nextState);
  }, []);

  const clearAutoLockTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const lock = useCallback(() => {
    clearAutoLockTimer();

    setState((current) => {
      const nextState = {
        ...current,
        locked: true,
      };

      writeJson(STATE_KEY, nextState);
      return nextState;
    });

    onLocked?.();
  }, [clearAutoLockTimer, onLocked]);

  const unlock = useCallback(() => {
    clearAutoLockTimer();

    const nextState = {
      locked: false,
      failedAttempts: 0,
      failedCycles: 0,
      lockoutUntil: null,
      requiresVerifiedRecovery: false,
    };

    persistState(nextState);
    onUnlocked?.();
  }, [clearAutoLockTimer, onUnlocked, persistState]);

  const completeVerifiedRecovery = useCallback(() => {
    unlock();
  }, [unlock]);

  const updateSettings = useCallback((updates) => {
    setSettingsState((current) => {
      const nextSettings = {
        ...current,
        ...updates,
      };

      writeJson(SETTINGS_KEY, nextSettings);
      return nextSettings;
    });
  }, []);

  const recordSecurityLog = useCallback(
    (entry) => {
      const existing = readJson(LOG_KEY, []);

      writeJson(LOG_KEY, [
        {
          id: `lockout-${Date.now()}`,
          time: new Date().toISOString(),
          date: new Date().toLocaleDateString(),
          device: getDeviceName(),
          ...entry,
        },
        ...existing,
      ]);
    },
    []
  );

  const recordFailedAttempt = useCallback(
    (method = settings.method) => {
      if (isLockedOut) {
        return {
          lockedOut: true,
          cycleCompleted: false,
          lockoutSeconds: null,
        };
      }

      const nextAttempts = state.failedAttempts + 1;

      if (nextAttempts < settings.failedAttemptsPerCycle) {
        const nextState = {
          ...state,
          failedAttempts: nextAttempts,
          locked: true,
        };

        persistState(nextState);

        return {
          lockedOut: false,
          cycleCompleted: false,
          failedAttempts: nextAttempts,
          lockoutSeconds: 0,
        };
      }

      const step = LOCKOUT_STEPS[
        Math.min(state.failedCycles, LOCKOUT_STEPS.length - 1)
      ];

      const nextCycle = state.failedCycles + 1;
      const requiresVerifiedRecovery = step.seconds === null;
      const lockoutUntil = requiresVerifiedRecovery
        ? Infinity
        : Date.now() + step.seconds * 1000;

      const nextState = {
        locked: true,
        failedAttempts: 0,
        failedCycles: nextCycle,
        lockoutUntil,
        requiresVerifiedRecovery,
      };

      persistState(nextState);

      recordSecurityLog({
        method,
        failedAttempts: settings.failedAttemptsPerCycle,
        lockoutDuration: step.label,
        cycle: nextCycle,
      });

      return {
        lockedOut: true,
        cycleCompleted: true,
        failedAttempts: 0,
        lockoutSeconds: step.seconds,
        lockoutLabel: step.label,
        cycle: nextCycle,
      };
    },
    [
      isLockedOut,
      persistState,
      recordSecurityLog,
      settings.failedAttemptsPerCycle,
      settings.method,
      state,
    ]
  );

  const resetActivityTimer = useCallback(() => {
    if (!enabled || state.locked || isLockedOut) {
      return;
    }

    clearAutoLockTimer();

    const duration = getAutoLockMilliseconds(settings.autoLock);

    if (duration > 0) {
      timerRef.current = window.setTimeout(lock, duration);
    }
  }, [
    clearAutoLockTimer,
    enabled,
    isLockedOut,
    lock,
    settings.autoLock,
    state.locked,
  ]);

  useEffect(() => {
    if (!isLockedOut && state.lockoutUntil !== null) {
      persistState({
        ...state,
        lockoutUntil: null,
        failedAttempts: 0,
      });
    }
  }, [isLockedOut, persistState, state]);

  useEffect(() => {
    if (!enabled || !autoStart) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setClock(Date.now());
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        backgroundAtRef.current = Date.now();
        return;
      }

      if (document.visibilityState === 'visible') {
        const elapsed = backgroundAtRef.current
          ? Date.now() - backgroundAtRef.current
          : 0;

        backgroundAtRef.current = null;

        if (
          settings.requireBiometricAfterBackground ||
          elapsed >= getAutoLockMilliseconds(settings.autoLock)
        ) {
          lock();
        } else {
          resetActivityTimer();
        }
      }
    };

    const handleActivity = () => {
      if (!state.locked && !isLockedOut) {
        resetActivityTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity);

    resetActivityTimer();

    return () => {
      window.clearInterval(interval);
      clearAutoLockTimer();
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [
    autoStart,
    clearAutoLockTimer,
    enabled,
    isLockedOut,
    lock,
    resetActivityTimer,
    settings.autoLock,
    settings.requireBiometricAfterBackground,
    state.locked,
  ]);

  return {
    enabled,
    locked: enabled && state.locked,
    settings,
    failedAttempts: state.failedAttempts,
    failedCycles: state.failedCycles,
    lockoutUntil: state.lockoutUntil,
    lockoutRemaining,
    lockoutStep,
    isLockedOut,
    requiresVerifiedRecovery: state.requiresVerifiedRecovery,
    lock,
    unlock,
    completeVerifiedRecovery,
    updateSettings,
    recordFailedAttempt,
    resetActivityTimer,
  };
}