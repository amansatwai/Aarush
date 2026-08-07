import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  Globe2,
  Languages,
  RefreshCw,
  Sparkles,
  Wallpaper,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import LanguageSelector from '../components/LanguageSelector';
import CountrySelector from '../components/CountrySelector';
import AIKeyboardPanel from '../components/AIKeyboardPanel';
import AIWallpaperPanel from '../components/AIWallpaperPanel';
import useLocalization from '../hooks/useLocalization';
import {
  languages,
  translationModules,
  formatCurrency,
} from '../utils/localizationEngine';

const backgroundSystems = [
  ['Language Engine', 'Active'],
  ['Translation Engine', 'Active'],
  ['Regional Formatting', 'Active'],
  ['Country Sync', 'Syncing'],
  ['AI Keyboard Engine', 'Active'],
  ['AI Wallpaper Engine', 'Active'],
  ['Accessibility Engine', 'Active'],
  ['Theme Synchronization', 'Active'],
  ['Font Rendering', 'Active'],
  ['Voice Language Detection', 'Future'],
  ['Offline Language Manager', 'Downloading'],
  ['Realtime Localization Sync', 'Syncing'],
];

const futureGlobalAI = [
  'Universal Real-Time Translation',
  'AI Accent Adaptation',
  'AI Cultural Context',
  'AI Regional Recommendations',
  'AI Multilingual Voice Calls',
  'AI Global Collaboration',
  'AI Language Learning',
  'AI Universal Communication Layer',
];

function GlassSection({ children }) {
  return (
    <section
      style={{
        marginTop: '0.9rem',
        padding: '1rem',
        borderRadius: '1.25rem',
        background: 'rgba(15,19,30,0.88)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.24)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {children}
    </section>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.65rem',
        marginBottom: '0.8rem',
      }}
    >
      <span
        style={{
          width: '2rem',
          height: '2rem',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '0.75rem',
          background:
            'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
          color: '#dfe7ff',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </span>

      <div>
        <h2
          style={{
            margin: 0,
            color: '#f4f7ff',
            fontSize: '0.98rem',
            fontWeight: 850,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: '0.25rem 0 0',
            color: '#8e9bb7',
            fontSize: '0.75rem',
            lineHeight: 1.45,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function SystemStatus({ status }) {
  const color =
    status === 'Active'
      ? '#83e9c1'
      : status === 'Syncing'
        ? '#8edfff'
        : status === 'Downloading'
          ? '#c8b8ff'
          : '#ffd28d';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        color,
        fontSize: '0.6rem',
        fontWeight: 800,
      }}
    >
      {status === 'Syncing' || status === 'Downloading' ? (
        <RefreshCw size={10} />
      ) : (
        <span>●</span>
      )}
      {status}
    </span>
  );
}

export default function LanguageSettings() {
  const navigate = useNavigate();
  const {
    preferences,
    language,
    country,
    update,
  } = useLocalization();
  const [message, setMessage] = useState('');

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

  const readiness = language[4] === 'Active' ? 100 : 86;

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
        pageTitle="Language & Accessibility"
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
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '3.4rem',
                height: '3.4rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
              }}
            >
              <Globe2 size={27} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.35rem',
                  fontWeight: 900,
                }}
              >
                Global Language &amp; Accessibility
              </h1>

              <p
                style={{
                  margin: '0.4rem 0 0',
                  color: '#c1cce2',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                }}
              >
                Use Aarush in your language, your country, and your preferred
                communication style.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1.1rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: '5.8rem',
                height: '5.8rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '999px',
                background: `conic-gradient(#61e8b4 ${readiness * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '4.8rem',
                  height: '4.8rem',
                  display: 'grid',
                  placeItems: 'center',
                  alignContent: 'center',
                  borderRadius: '999px',
                  background: '#111827',
                }}
              >
                <strong style={{ fontSize: '1.1rem' }}>
                  {readiness}
                </strong>
                <span style={{ color: '#91a0bd', fontSize: '0.58rem' }}>
                  / 100
                </span>
              </div>
            </div>

            <div>
              <strong
                style={{
                  display: 'block',
                  color: '#83edc1',
                  fontSize: '0.8rem',
                }}
              >
                {readiness >= 95 ? 'Fully Global' : 'Multilingual'}
              </strong>

              <span
                style={{
                  display: 'block',
                  marginTop: '0.3rem',
                  color: '#aab7d0',
                  fontSize: '0.69rem',
                  lineHeight: 1.45,
                }}
              >
                {language[2]} is active with {language[3]} script support.
              </span>
            </div>
          </div>
        </section>

        <GlassSection>
          <SectionHeader
            icon={Languages}
            title="Language Settings"
            description="Choose from major world languages and additional global language packs."
          />

          <LanguageSelector
            value={preferences.language}
            onChange={(value) => {
              update({ language: value });
              showMessage('Language preference saved.');
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
              gap: '0.45rem',
              marginTop: '0.7rem',
            }}
          >
            {languages.map(
              ([code, nativeName, englishName, script, status]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => update({ language: code })}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '0.8rem',
                    border:
                      preferences.language === code
                        ? '1px solid rgba(124,92,255,0.3)'
                        : '1px solid rgba(255,255,255,0.06)',
                    background:
                      preferences.language === code
                        ? 'rgba(124,92,255,0.12)'
                        : 'rgba(255,255,255,0.04)',
                    color: '#e4ebfa',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.72rem',
                    }}
                  >
                    {nativeName}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.18rem',
                      color: '#8997b3',
                      fontSize: '0.61rem',
                    }}
                  >
                    {englishName} · {script}
                  </span>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.25rem',
                      color: '#83e9c1',
                      fontSize: '0.58rem',
                      fontWeight: 800,
                    }}
                  >
                    {status}
                  </span>
                </button>
              )
            )}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Globe2}
            title="Country & Region"
            description="Regional formatting includes flags, codes, time zones, currencies, numbers, dates, measurements, and week-start preferences."
          />

          <CountrySelector
            value={preferences.country}
            onChange={(value) => {
              update({ country: value });
              showMessage('Country and regional preferences saved.');
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.5rem',
              marginTop: '0.7rem',
            }}
          >
            {[
              ['Country', `${country[1]} ${country[2]}`],
              ['Country Code', country[0]],
              ['Time Zone', country[4]],
              ['Currency', country[5]],
              ['Measurements', country[6]],
              ['Week Starts', country[7]],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: '0.7rem',
                  borderRadius: '0.85rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#8997b3',
                    fontSize: '0.61rem',
                  }}
                >
                  {label}
                </span>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.3rem',
                    color: '#edf2ff',
                    fontSize: '0.7rem',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>

          <p
            style={{
              margin: '0.7rem 0 0',
              color: '#8997b3',
              fontSize: '0.66rem',
              lineHeight: 1.45,
            }}
          >
            Example regional currency: {formatCurrency(1250, country[5])}.
          </p>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Aarush AI Keyboard"
            description="AI-powered writing assistance across the entire app."
          />

          <AIKeyboardPanel
            preferences={{
              ...preferences,
              smartReplies: true,
              translation: true,
              grammar: true,
              tone: false,
              emoji: true,
              multilingual: true,
              context: true,
              completion: true,
              captions: true,
              hashtags: true,
              rewrite: true,
            }}
            onToggle={(id) =>
              showMessage(`${id} preference is ready for persistence.`)
            }
            onStyleChange={(style) => update({ style })}
            onAction={(action) =>
              showMessage(`${action} is ready for AI communication integration.`)
            }
          />
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Languages}
            title="Real-Time Translation"
            description="Future live translation for text, voice, images, camera input, and offline language packs."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {translationModules.map((item) => (
              <div
                key={item}
                style={{
                  minHeight: '3.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem',
                  borderRadius: '0.85rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#dce5f8',
                  fontSize: '0.67rem',
                  opacity: 0.72,
                }}
              >
                <Languages size={15} color="#b8aaff" />
                <span style={{ flex: 1 }}>{item}</span>
                <span style={{ color: '#9aa7c1', fontSize: '0.55rem' }}>
                  Future
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Wallpaper}
            title="Aarush AI Wallpapers"
            description="Generate wallpapers using Aarush AI and text prompts."
          />

          <AIWallpaperPanel
            preferences={preferences}
            onWallpaperChange={(wallpaper) => update({ wallpaper })}
            onAction={(action, prompt) =>
              showMessage(
                `${action} is prepared for AI wallpaper integration${prompt ? `: ${prompt}` : '.'}`
              )
            }
          />
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Wallpaper}
            title="Conversation Wallpapers"
            description="Customize wallpaper and visual treatment for every conversation."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              'Different wallpaper for each chat',
              'Group wallpaper',
              'AI wallpaper per conversation',
              'Blur intensity',
              'Brightness',
              'Color overlay',
              'Motion effect',
              'Auto theme sync',
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => showMessage(`${item} is ready for chat-theme integration.`)}
                style={{
                  minHeight: '2.7rem',
                  padding: '0.6rem',
                  borderRadius: '0.8rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dce5f8',
                  fontSize: '0.63rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={RefreshCw}
            title="Background Localization Systems"
            description="Internal systems supporting global communication and accessibility."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {backgroundSystems.map(([title, status]) => (
              <div
                key={title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  borderRadius: '0.85rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <RefreshCw size={15} color="#a9b8d6" />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#dfe7fa',
                      fontSize: '0.67rem',
                    }}
                  >
                    {title}
                  </strong>

                  <span style={{ display: 'block', marginTop: '0.25rem' }}>
                    <SystemStatus status={status} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Future Aarush Global AI (Coming Soon)"
            description="Future communication systems prepared for cloud, offline, voice, and cultural intelligence."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {futureGlobalAI.map((item) => (
              <div
                key={item}
                style={{
                  minHeight: '3.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#dfe7f8',
                  fontSize: '0.68rem',
                  opacity: 0.68,
                }}
              >
                <Sparkles size={15} color="#b8aaff" />
                <span style={{ flex: 1 }}>{item}</span>
                <span
                  style={{
                    color: '#9aa7c1',
                    fontSize: '0.55rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Coming soon
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        {message ? (
          <div
            role="status"
            style={{
              position: 'fixed',
              right: '1rem',
              bottom: '5.7rem',
              left: '1rem',
              zIndex: 1100,
              maxWidth: '520px',
              margin: '0 auto',
              padding: '0.75rem 0.9rem',
              borderRadius: '0.9rem',
              background: 'rgba(22,28,45,0.96)',
              border: '1px solid rgba(124,92,255,0.25)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
              color: '#dce6fa',
              fontSize: '0.74rem',
              lineHeight: 1.45,
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        ) : null}
      </main>

      <BottomNav />

      <style>{`
        button {
          -webkit-tap-highlight-color: transparent;
          transition: transform 180ms ease, filter 180ms ease, background 180ms ease;
        }

        button:not(:disabled):hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        button:not(:disabled):active {
          transform: scale(0.98);
        }

        select option {
          background: #151b2b;
          color: #edf3ff;
        }
      `}</style>
    </div>
  );
}