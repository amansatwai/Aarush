import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  ChevronLeft,
  Eye,
  Lock,
  Shield,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useNotifications from '../hooks/useNotifications';

const privacyOptions = [
  ['hideMessageContent', 'Hide Message Content', 'Hide message text from previews.'],
  ['hideSenderName', 'Hide Sender Name', 'Remove sender names from previews.'],
  ['hideGroupName', 'Hide Group Name', 'Hide group names from notifications.'],
  ['hideMediaPreview', 'Hide Media Preview', 'Hide image and video thumbnails.'],
  ['hideAiAlerts', 'Hide AI Alerts', 'Hide AI details from lock-screen previews.'],
  ['hideSecurityDetails', 'Hide Security Details', 'Use generic security notification text.'],
  ['genericNotificationMode', 'Generic Notification Mode', 'Show only generic Aarush notification text.'],
  ['lockScreenPrivacy', 'Lock Screen Privacy', 'Protect notification content while locked.'],
  ['notificationRedaction', 'Notification Redaction', 'Redact sensitive notification fields.'],
  ['privateNotificationMode', 'Private Notification Mode', 'Use privacy-first notification delivery.'],
  ['stealthNotificationMode', 'Stealth Notification Mode', 'Reduce visible notification signals.'],
];

const lockScreenModes = [
  'Show Nothing',
  'Show App Name Only',
  'Show Generic Text',
  'Show Count Only',
  'Show Full Content',
];

export default function NotificationPrivacy() {
  const navigate = useNavigate();
  const { state, toggleNested, update } = useNotifications();

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
        pageTitle="Notification Privacy"
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
          <Shield size={28} color="#9be8ff" />

          <h1
            style={{
              margin: '0.7rem 0 0',
              fontSize: '1.35rem',
              fontWeight: 900,
            }}
          >
            Notification Privacy
          </h1>

          <p
            style={{
              margin: '0.4rem 0 0',
              color: '#c1cce2',
              fontSize: '0.78rem',
              lineHeight: 1.5,
            }}
          >
            Protect notification content, sender identity, media previews, and
            lock-screen privacy.
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
            Notification Privacy Controls
          </h2>

          {privacyOptions.map(([id, title, description]) => (
            <div
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.68rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Eye size={15} color="#aebcda" />

              <span style={{ minWidth: 0, flex: 1 }}>
                <strong
                  style={{
                    display: 'block',
                    color: '#e9efff',
                    fontSize: '0.74rem',
                  }}
                >
                  {title}
                </strong>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.18rem',
                    color: '#8997b3',
                    fontSize: '0.64rem',
                  }}
                >
                  {description}
                </span>
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={Boolean(state.privacy[id])}
                aria-label={`Toggle ${title}`}
                onClick={() => toggleNested('privacy', id)}
                style={{
                  width: '2.5rem',
                  height: '1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: state.privacy[id]
                    ? 'flex-end'
                    : 'flex-start',
                  padding: '0.15rem',
                  border: 0,
                  borderRadius: '999px',
                  background: state.privacy[id]
                    ? 'linear-gradient(135deg, #7c5cff, #4dd7ff)'
                    : 'rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: '1.1rem',
                    height: '1.1rem',
                    borderRadius: '999px',
                    background: '#fff',
                  }}
                />
              </button>
            </div>
          ))}
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
            Lock Screen Protection
          </h2>

          <p
            style={{
              margin: '0.3rem 0 0.7rem',
              color: '#8997b3',
              fontSize: '0.68rem',
              lineHeight: 1.45,
            }}
          >
            Choose how much notification information is visible before
            unlocking the device.
          </p>

          <select
            value={state.lockScreenMode}
            onChange={(event) =>
              update({ lockScreenMode: event.target.value })
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
            {lockScreenModes.map((mode) => (
              <option key={mode}>{mode}</option>
            ))}
          </select>

          {[
            ['Require Unlock To Expand', 'Prevent full content expansion without authentication.'],
            ['Face Down Privacy', 'Hide notification content when the phone is face down.'],
            ['Public Place Privacy', 'Use stronger redaction in public environments.'],
          ].map(([title, description]) => (
            <div
              key={title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minHeight: '2.6rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.67rem',
              }}
            >
              <Lock size={14} color="#aebcda" />
              <span style={{ flex: 1 }}>
                <strong style={{ display: 'block' }}>{title}</strong>
                <span
                  style={{
                    display: 'block',
                    marginTop: '0.15rem',
                    color: '#8997b3',
                    fontSize: '0.6rem',
                  }}
                >
                  {description}
                </span>
              </span>
              <Check size={13} color="#83e9c1" />
            </div>
          ))}
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
      `}</style>
    </div>
  );
}