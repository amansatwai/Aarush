import { useNavigate } from 'react-router-dom';
import {
  Accessibility,
  Check,
  ChevronLeft,
  Eye,
  Keyboard,
  Moon,
  Sparkles,
  Volume2,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useLocalization from '../hooks/useLocalization';
import { accessibilityOptions } from '../utils/localizationEngine';

export default function AccessibilitySettings() {
  const navigate = useNavigate();
  const { preferences, updateAccessibility } = useLocalization();

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '7rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.5), rgba(7,9,14,1) 62%)',
        color: '#f4f7ff',
      }}
    >
      <TopBar
        pageTitle="Accessibility"
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
              'linear-gradient(135deg, rgba(124,92,255,0.23), rgba(77,215,255,0.1))',
            border: '1px solid rgba(124,92,255,0.24)',
          }}
        >
          <Accessibility size={28} color="#bdb2ff" />

          <h1
            style={{
              margin: '0.7rem 0 0',
              fontSize: '1.35rem',
              fontWeight: 900,
            }}
          >
            Accessibility
          </h1>

          <p
            style={{
              margin: '0.4rem 0 0',
              color: '#c1cce2',
              fontSize: '0.78rem',
              lineHeight: 1.5,
            }}
          >
            Personalize Aarush for clearer reading, easier navigation, and
            more comfortable communication.
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
          <h2
            style={{
              margin: 0,
              color: '#f4f7ff',
              fontSize: '0.98rem',
            }}
          >
            Accessibility Controls
          </h2>

          {accessibilityOptions.map(([id, title, description]) => (
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
                aria-checked={Boolean(preferences.accessibility[id])}
                aria-label={`Toggle ${title}`}
                onClick={() =>
                  updateAccessibility(
                    id,
                    !preferences.accessibility[id]
                  )
                }
                style={{
                  width: '2.5rem',
                  height: '1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: preferences.accessibility[id]
                    ? 'flex-end'
                    : 'flex-start',
                  padding: '0.15rem',
                  border: 0,
                  borderRadius: '999px',
                  background: preferences.accessibility[id]
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
          <h2
            style={{
              margin: 0,
              color: '#f4f7ff',
              fontSize: '0.98rem',
            }}
          >
            Aarush AI Accessibility
          </h2>

          <p
            style={{
              margin: '0.3rem 0 0.8rem',
              color: '#8e9bb7',
              fontSize: '0.72rem',
            }}
          >
            Future-ready accessibility intelligence modules.
          </p>

          {[
            ['AI Voice Assistant', Volume2],
            ['AI Read Aloud', Volume2],
            ['AI Conversation Summaries', Sparkles],
            ['AI Caption Generation', Keyboard],
            ['AI Sign Language Support', Accessibility],
            ['AI Visual Description', Eye],
            ['AI Simplified Language', Check],
            ['AI Cognitive Assistance', Sparkles],
          ].map(([title, Icon]) => (
            <div
              key={title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                minHeight: '2.7rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.7rem',
                opacity: 0.68,
              }}
            >
              <Icon size={15} color="#b8aaff" />
              <span style={{ flex: 1 }}>{title}</span>
              <span style={{ color: '#9aa7c1', fontSize: '0.58rem' }}>
                Coming soon
              </span>
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

        button:not(:disabled):active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}