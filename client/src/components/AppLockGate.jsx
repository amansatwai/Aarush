import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Fingerprint,
  KeyRound,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import useAppLock from '../hooks/useAppLock';
import { requestBiometricAuthentication } from '../utils/deviceBiometric';

export default function AppLockGate({
  children,
  enabled,
  method = 'pin',
  pin,
  pattern,
  password,
  verify,
  onUnlock,
  fallback,
}) {
  const appLock = useAppLock({ enabled });
  const [credential, setCredential] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [busy, setBusy] = useState(false);

  const activeMethod = method || appLock.settings.method;
  const locked = Boolean(enabled && appLock.locked);

  useEffect(() => {
    if (locked && activeMethod === 'biometric') {
      authenticateBiometric();
    }
  }, [locked, activeMethod]);

  async function authenticateBiometric() {
    if (busy || appLock.isLockedOut) {
      return;
    }

    setBusy(true);
    setError('');

    const result = await requestBiometricAuthentication();

    if (result.success) {
      appLock.unlock();
      onUnlock?.();
    } else {
      const lockout = appLock.recordFailedAttempt('biometric');

      if (lockout.cycleCompleted) {
        setWarning(
          `Security warning: 3 biometric failures triggered a ${lockout.lockoutLabel} lockout.`
        );
      }

      setError(result.error || 'Biometric verification failed.');
    }

    setBusy(false);
  }

  async function handleCredentialSubmit(event) {
    event.preventDefault();

    if (appLock.isLockedOut) {
      setError(
        appLock.requiresVerifiedRecovery
          ? 'Verified recovery is required before another attempt.'
          : 'Aarush is temporarily locked. Please wait before trying again.'
      );
      return;
    }

    if (!credential) {
      setError('Enter your unlock credential.');
      return;
    }

    let valid = false;

    if (typeof verify === 'function') {
      valid = await verify(credential, activeMethod);
    } else if (activeMethod === 'pin') {
      valid = Boolean(pin && credential === pin);
    } else if (activeMethod === 'pattern') {
      valid = Boolean(pattern && credential === pattern);
    } else if (activeMethod === 'password') {
      valid = Boolean(password && credential === password);
    }

    if (valid) {
      setCredential('');
      setError('');
      setWarning('');
      appLock.unlock();
      onUnlock?.();
      return;
    }

    const lockout = appLock.recordFailedAttempt(activeMethod);
    setCredential('');
    setError('The credential is incorrect.');

    if (lockout.cycleCompleted) {
      setWarning(
        `Security warning: 3 failed attempts triggered a ${lockout.lockoutLabel} lockout.`
      );
    }
  }

  if (!locked) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  const lockoutText = appLock.requiresVerifiedRecovery
    ? 'Verified recovery is required.'
    : appLock.isLockedOut
      ? `Try again in ${Math.ceil(
          appLock.lockoutRemaining / 1000
        )} seconds.`
      : `${appLock.failedAttempts} of 3 attempts used in this cycle.`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Unlock Aarush"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.58), rgba(7,9,14,1) 68%)',
        color: '#f4f7ff',
      }}
    >
      <main
        style={{
          width: 'min(100%, 400px)',
          padding: '1.4rem',
          borderRadius: '1.5rem',
          background: 'rgba(15,19,30,0.95)',
          border: '1px solid rgba(124,92,255,0.24)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
          textAlign: 'center',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        <div
          style={{
            width: '4.2rem',
            height: '4.2rem',
            margin: '0 auto',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
            color: '#fff',
            boxShadow: '0 0 30px rgba(77,215,255,0.24)',
          }}
        >
          {activeMethod === 'biometric' ? (
            <Fingerprint size={28} />
          ) : (
            <Lock size={28} />
          )}
        </div>

        <h1
          style={{
            margin: '1rem 0 0',
            fontSize: '1.25rem',
            fontWeight: 900,
          }}
        >
          Aarush is locked
        </h1>

        <p
          style={{
            margin: '0.45rem 0 1rem',
            color: '#9aa7c1',
            fontSize: '0.8rem',
            lineHeight: 1.5,
          }}
        >
          Verify your identity to continue.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            marginBottom: '0.8rem',
            color: '#aab8d2',
            fontSize: '0.68rem',
          }}
        >
          <ShieldCheck size={13} />
          {lockoutText}
        </div>

        {activeMethod === 'biometric' ? (
          <button
            type="button"
            onClick={authenticateBiometric}
            disabled={busy || appLock.isLockedOut}
            style={{
              width: '100%',
              minHeight: '2.9rem',
              border: 0,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 850,
              cursor: busy || appLock.isLockedOut ? 'not-allowed' : 'pointer',
              opacity: busy || appLock.isLockedOut ? 0.55 : 1,
            }}
          >
            <Fingerprint
              size={16}
              style={{ verticalAlign: 'middle', marginRight: '0.35rem' }}
            />
            {busy ? 'Verifying…' : 'Unlock with Biometrics'}
          </button>
        ) : (
          <form onSubmit={handleCredentialSubmit}>
            <label
              style={{
                display: 'block',
                color: '#aebbd5',
                fontSize: '0.72rem',
                fontWeight: 750,
                textAlign: 'left',
              }}
            >
              {activeMethod === 'pattern'
                ? 'Enter pattern'
                : activeMethod === 'password'
                  ? 'Enter password'
                  : 'Enter PIN'}

              <input
                type={activeMethod === 'password' ? 'password' : 'text'}
                inputMode={activeMethod === 'password' ? 'text' : 'numeric'}
                autoComplete="current-password"
                value={credential}
                onChange={(event) => setCredential(event.target.value)}
                autoFocus
                disabled={appLock.isLockedOut}
                style={{
                  width: '100%',
                  minHeight: '2.9rem',
                  marginTop: '0.4rem',
                  padding: '0 0.8rem',
                  borderRadius: '0.8rem',
                  border: '1px solid rgba(255,255,255,0.12)',
                  outline: 0,
                  background: '#111827',
                  color: '#fff',
                  fontSize: '1rem',
                  letterSpacing: activeMethod === 'password' ? 'normal' : '0.2em',
                }}
              />
            </label>

            <button
              type="submit"
              disabled={appLock.isLockedOut}
              style={{
                width: '100%',
                minHeight: '2.9rem',
                marginTop: '0.7rem',
                border: 0,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 850,
                cursor: appLock.isLockedOut ? 'not-allowed' : 'pointer',
                opacity: appLock.isLockedOut ? 0.55 : 1,
              }}
            >
              Unlock Aarush
            </button>
          </form>
        )}

        {error ? (
          <p
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              margin: '0.75rem 0 0',
              color: '#ffadc4',
              fontSize: '0.7rem',
              lineHeight: 1.4,
              textAlign: 'left',
            }}
          >
            <AlertTriangle size={13} />
            {error}
          </p>
        ) : null}

        {warning ? (
          <p
            role="status"
            style={{
              margin: '0.75rem 0 0',
              padding: '0.65rem',
              borderRadius: '0.75rem',
              background: 'rgba(255,179,71,0.09)',
              border: '1px solid rgba(255,179,71,0.16)',
              color: '#ffd28d',
              fontSize: '0.68rem',
              lineHeight: 1.45,
              textAlign: 'left',
            }}
          >
            {warning}
          </p>
        ) : null}

        <p
          style={{
            margin: '1rem 0 0',
            color: '#74819c',
            fontSize: '0.64rem',
            lineHeight: 1.45,
          }}
        >
          Future native Android and iOS biometric APIs can be connected through
          the same verification boundary.
        </p>
      </main>
    </div>
  );
}