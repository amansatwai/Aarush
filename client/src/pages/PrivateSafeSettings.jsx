import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  Cloud,
  Database,
  Download,
  KeyRound,
  Lock,
  Shield,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useMemoriesVault from '../hooks/useMemoriesVault';

const expiryOptions = [
  '1 hour',
  '24 hours',
  '3 days',
  '7 days',
  '30 days',
  '90 days',
  '1 year',
  'Never',
];

export default function PrivateSafeSettings() {
  const navigate = useNavigate();
  const { state, update, showMessage } = useMemoriesVault();
  const [backupPassword, setBackupPassword] = useState('');

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '7rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.52), rgba(7,9,14,1) 62%)',
        color: '#f4f7ff',
      }}
    >
      <TopBar
        pageTitle="Private Safe Settings"
        onChatClick={() => navigate('/chats')}
        onOneTapLock={() => navigate('/lock')}
      />

      <main
        style={{
          width: '100%',
          maxWidth: '760px',
          margin: '0 auto',
          padding: '0.9rem',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '0.8rem',
            padding: '0.35rem 0.55rem',
            border: 0,
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.05)',
            color: '#aebbd5',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={15} />
          Back
        </button>

        <section
          style={{
            padding: '1.2rem',
            borderRadius: '1.45rem',
            background:
              'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.1))',
            border: '1px solid rgba(124,92,255,0.24)',
          }}
        >
          <ShieldCheck size={28} color="#9be8ff" />

          <h1
            style={{
              margin: '0.7rem 0 0',
              fontSize: '1.35rem',
              fontWeight: 900,
            }}
          >
            Private Safe Settings
          </h1>

          <p
            style={{
              margin: '0.4rem 0 0',
              color: '#c1cce2',
              fontSize: '0.78rem',
              lineHeight: 1.5,
            }}
          >
            Configure encrypted storage, expiry, backup, recovery,
            and secure deletion preferences.
          </p>
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Automatic Data Expiry
          </h2>

          <p
            style={{
              margin: '0.3rem 0 0.7rem',
              color: '#8997b3',
              fontSize: '0.68rem',
              lineHeight: 1.45,
            }}
          >
            Expired content can move to secure trash or be permanently
            deleted after confirmation.
          </p>

          <select
            value={state.autoExpiry}
            onChange={(event) =>
              update({ autoExpiry: event.target.value })
            }
            style={{
              width: '100%',
              minHeight: '2.7rem',
              padding: '0 0.7rem',
              borderRadius: '0.8rem',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#151b2b',
              color: '#edf3ff',
            }}
          >
            {expiryOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <div
            style={{
              display: 'grid',
              gap: '0.45rem',
              marginTop: '0.7rem',
            }}
          >
            {[
              ['Expire automatically', true],
              [
                'Move to secure trash',
                state.expiryBehavior === 'Move to secure trash',
              ],
              [
                'Permanently delete',
                state.expiryBehavior === 'Permanently delete',
              ],
              ['Require confirmation', state.requireConfirmation],
              ['AI reminder before deletion', state.aiReminder],
            ].map(([label, checked]) => (
              <label
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#cbd6ea',
                  fontSize: '0.68rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(checked)}
                  onChange={() =>
                    label === 'Require confirmation'
                      ? update({
                          requireConfirmation:
                            !state.requireConfirmation,
                        })
                      : label ===
                          'AI reminder before deletion'
                        ? update({
                            aiReminder: !state.aiReminder,
                          })
                        : null
                  }
                  readOnly={
                    label !== 'Require confirmation' &&
                    label !== 'AI reminder before deletion'
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Secure Backup
          </h2>

          <div
            style={{
              display: 'grid',
              gap: '0.45rem',
              marginTop: '0.7rem',
            }}
          >
            {[
              ['Encrypted Cloud Backup', Cloud],
              ['Local Encrypted Backup', Database],
              ['External Drive Backup', Download],
              ['Backup Verification', ShieldCheck],
              ['Recovery Key', KeyRound],
              ['Emergency Recovery Contact', Shield],
              ['Backup Schedule', Database],
            ].map(([title, Icon]) => (
              <button
                key={title}
                type="button"
                onClick={() =>
                  showMessage(
                    `${title} is ready for secure vault integration.`
                  )
                }
                style={{
                  minHeight: '2.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '0.85rem',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dce5f8',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={15} color="#aebcda" />
                <span style={{ flex: 1 }}>{title}</span>
                <Check size={13} color="#83e9c1" />
              </button>
            ))}
          </div>

          <input
            type="password"
            value={backupPassword}
            onChange={(event) =>
              setBackupPassword(event.target.value)
            }
            placeholder="Set backup password"
            style={{
              width: '100%',
              minHeight: '2.7rem',
              marginTop: '0.7rem',
              padding: '0 0.7rem',
              borderRadius: '0.8rem',
              border: '1px solid rgba(255,255,255,0.1)',
              outline: 0,
              background: '#151b2b',
              color: '#fff',
            }}
          />
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Secure Deletion
          </h2>

          <p
            style={{
              margin: '0.35rem 0 0.8rem',
              color: '#8997b3',
              fontSize: '0.68rem',
              lineHeight: 1.45,
            }}
          >
            Future secure deletion will coordinate metadata removal,
            thumbnail cleanup, cache cleanup, backup cleanup,
            clipboard cleanup, recovery prevention, and secure wipe
            operations.
          </p>

          <button
            type="button"
            onClick={() =>
              showMessage(
                'Secure deletion controls are ready for encrypted-storage integration.'
              )
            }
            style={{
              width: '100%',
              minHeight: '2.7rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              border: '1px solid rgba(255,79,122,0.2)',
              borderRadius: '999px',
              background: 'rgba(255,79,122,0.08)',
              color: '#ffadc4',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} />
            Open Secure Deletion Controls
          </button>
        </section>
      </main>

      <BottomNav />

      <style>{`
        button {
          -webkit-tap-highlight-color: transparent;
          transition: transform 180ms ease, filter 180ms ease;
        }

        button:not(:disabled):hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        button:not(:disabled):active {
          transform: scale(0.98);
        }

        button:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}