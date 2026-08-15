import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AudioLines,
  Check,
  ChevronRight,
  Clock3,
  Ear,
  Globe2,
  Languages,
  MessageCircle,
  Mic2,
  MicOff,
  Play,
  Radio,
  Save,
  Settings2,
  Sparkles,
  Subtitles,
  Users,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['monitor', 'Voice Monitor', AudioLines],
  ['bridge', 'Language Bridge', Languages],
  ['subtitles', 'Live Subtitles', Subtitles],
  ['dubbing', 'AI Dubbing', Volume2],
  ['guests', 'Guest Translation', Users],
  ['audience', 'Audience Languages', Globe2],
  ['analytics', 'Analytics', Activity],
  ['controls', 'Controls', Settings2],
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Hinglish',
  'Urdu',
  'Bengali',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Malayalam',
  'Kannada',
  'Spanish',
  'French',
  'German',
  'Arabic',
  'Japanese',
  'Korean',
  'Portuguese',
  'Russian',
];

const VOICE_STYLES = [
  'Natural voice',
  'Expressive voice',
  'Formal voice',
  'Friendly voice',
  'Creator voice profile',
  'Gender-neutral voice',
];

function numeric(value) {
  return Number(value) || 0;
}

function formatDuration(value) {
  const total = Math.max(0, Math.floor(numeric(value)));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color = '#4dd7ff',
}) {
  return (
    <article style={styles.metricCard}>
      <span
        style={{
          ...styles.metricIcon,
          color,
          background: `${color}18`,
        }}
      >
        <Icon size={17} />
      </span>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </article>
  );
}

function SectionTitle({ title, subtitle, icon: Icon, action }) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      {action || <Icon size={18} color="#4dd7ff" />}
    </div>
  );
}

export default function StoryLiveVoiceTranslationStudio({
  stream = {},
  speaker = {},
  guests = [],
  audience = {},
  sourceLanguage = 'English',
  targetLanguages = [],
  translationMode = 'Interpretation',
  voiceSettings = {},
  subtitleSettings = {},
  onStartTranslation,
  onStopTranslation,
  onSwitchLanguage,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('monitor');
  const [status, setStatus] = useState(
    stream.translationStatus || 'Listening'
  );
  const [isTranslating, setIsTranslating] =
    useState(Boolean(stream.translationActive));
  const [selectedSource, setSelectedSource] =
    useState(sourceLanguage);
  const [selectedTargets, setSelectedTargets] =
    useState(() =>
      targetLanguages.length
        ? targetLanguages
        : ['Hindi', 'Japanese', 'Spanish']
    );
  const [voiceStyle, setVoiceStyle] =
    useState(
      voiceSettings.style || 'Natural voice'
    );
  const [subtitlesEnabled, setSubtitlesEnabled] =
    useState(
      subtitleSettings.enabled !== false
    );
  const [dubbingEnabled, setDubbingEnabled] =
    useState(Boolean(voiceSettings.enabled));
  const [translatedChat, setTranslatedChat] =
    useState(false);
  const [guestAudio, setGuestAudio] =
    useState(true);
  const [globalBroadcast, setGlobalBroadcast] =
    useState(false);
  const [elapsed, setElapsed] = useState(
    numeric(stream.translationDuration)
  );
  const [notice, setNotice] = useState('');

  const confidence = useMemo(
    () =>
      Math.round(
        numeric(stream.confidence) ||
          numeric(voiceSettings.confidence) ||
          88
      ),
    [stream.confidence, voiceSettings.confidence]
  );

  const latency = useMemo(
    () =>
      numeric(stream.latency) ||
      numeric(voiceSettings.latency) ||
      420,
    [stream.latency, voiceSettings.latency]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  useEffect(() => {
    if (!isTranslating) return undefined;

    const timer = window.setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isTranslating]);

  const toggleTarget = (language) => {
    setSelectedTargets((current) =>
      current.includes(language)
        ? current.filter((item) => item !== language)
        : [...current, language]
    );
  };

  const startTranslation = async () => {
    setIsTranslating(true);
    setStatus('Detecting Language');

    await onStartTranslation?.({
      streamId: stream.id || stream.streamId,
      speakerId: speaker.id || speaker.speakerId,
      sourceLanguage: selectedSource,
      targetLanguages: selectedTargets,
      translationMode,
      voiceSettings: {
        ...voiceSettings,
        style: voiceStyle,
        enabled: dubbingEnabled,
      },
      subtitleSettings: {
        ...subtitleSettings,
        enabled: subtitlesEnabled,
      },
    });

    window.setTimeout(() => {
      setStatus('Translating');
    }, 350);

    showNotice('Live voice translation started.');
  };

  const stopTranslation = async () => {
    setIsTranslating(false);
    setStatus('Listening');

    await onStopTranslation?.({
      streamId: stream.id || stream.streamId,
      duration: elapsed,
      sourceLanguage: selectedSource,
      targetLanguages: selectedTargets,
      confidence,
      latency,
    });

    showNotice('Live voice translation stopped.');
  };

  const switchLanguage = (language) => {
    setSelectedSource(language);
    onSwitchLanguage?.({
      sourceLanguage: language,
      targetLanguages: selectedTargets,
    });
    showNotice(`Source language switched to ${language}.`);
  };

  const renderMonitor = () => (
    <>
      <section style={styles.monitorHero}>
        <VoicePulse active={isTranslating} />
        <div style={styles.monitorCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Live interpretation layer
          </span>
          <h1>{status}</h1>
          <p>
            Translate live speech across regions while
            preserving speaker context and broadcast timing.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Clock3 size={13} />
              {formatDuration(elapsed)}
            </span>
            <span>
              <Languages size={13} />
              {selectedTargets.length} target languages
            </span>
            <span>
              <Sparkles size={13} />
              {confidence}% confidence
            </span>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Live Voice Monitor"
          subtitle="Microphone activity, language detection, and confidence."
          icon={AudioLines}
        />

        <div style={styles.voiceWave}>
          {Array.from({ length: 32 }, (_, index) => (
            <span
              key={index}
              style={{
                height: `${
                  18 + ((index * 17) % 58)
                }%`,
                opacity: isTranslating ? 1 : .45,
              }}
            />
          ))}
        </div>

        <div style={styles.metricGrid}>
          <MetricCard
            label="Microphone"
            value={stream.micMuted ? 'Muted' : 'Active'}
            icon={stream.micMuted ? MicOff : Mic2}
            color="#4dd7ff"
          />
          <MetricCard
            label="Source language"
            value={selectedSource}
            icon={Globe2}
            color="#a895ff"
          />
          <MetricCard
            label="Confidence"
            value={`${confidence}%`}
            icon={Sparkles}
            color="#82e9c1"
          />
          <MetricCard
            label="Latency"
            value={`${latency} ms`}
            icon={Zap}
            color="#ffd27d"
          />
        </div>
      </section>
    </>
  );

  const renderBridge = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Language Bridge"
        subtitle="Route live interpretation to multiple audiences."
        icon={Languages}
      />

      <label style={styles.field}>
        Source language
        <select
          value={selectedSource}
          onChange={(event) =>
            switchLanguage(event.target.value)
          }
          style={styles.select}
        >
          {LANGUAGES.map((language) => (
            <option key={language}>{language}</option>
          ))}
        </select>
      </label>

      <div style={styles.targetHeader}>
        <span>Target languages</span>
        <strong>{selectedTargets.length} active</strong>
      </div>

      <div style={styles.languageGrid}>
        {LANGUAGES.map((language) => {
          const selected = selectedTargets.includes(language);

          return (
            <button
              type="button"
              key={language}
              onClick={() => toggleTarget(language)}
              aria-pressed={selected}
              style={{
                ...styles.languageButton,
                ...(selected
                  ? styles.activeLanguageButton
                  : {}),
              }}
            >
              <Languages size={14} />
              <span>{language}</span>
              {selected ? <Check size={14} /> : null}
            </button>
          );
        })}
      </div>

      <div style={styles.bridgeSummary}>
        <Globe2 size={17} />
        <span>
          {selectedSource} → {selectedTargets.join(', ')}
        </span>
      </div>
    </section>
  );

  const renderSubtitles = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Live Subtitles"
        subtitle="Real-time subtitles with timing and speaker metadata."
        icon={Subtitles}
      />

      <div style={styles.subtitlePreview}>
        <span style={styles.speakerLabel}>
          {speaker.name || 'Speaker'}
        </span>
        <p>
          {stream.transcript ||
            'Live translated subtitle preview will appear here.'}
        </p>
        <small>
          {selectedSource} · Karaoke timing foundation
        </small>
      </div>

      <div style={styles.optionGrid}>
        {[
          ['Speaker labels', true],
          ['Timing preservation', true],
          ['Karaoke metadata', true],
          ['Color-coded speakers', true],
          ['Position customization', true],
          ['Background opacity', true],
        ].map(([label]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} configured.`)
            }
            style={styles.optionButton}
          >
            <Check size={14} color="#82e9c1" />
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setSubtitlesEnabled((value) => !value)
        }
        style={styles.primaryButton}
      >
        <Subtitles size={16} />
        {subtitlesEnabled
          ? 'Disable live subtitles'
          : 'Enable live subtitles'}
      </button>
    </section>
  );

  const renderDubbing = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Dubbing"
        subtitle="Prepare translated voice output per language."
        icon={Volume2}
      />

      <div style={styles.voiceGrid}>
        {VOICE_STYLES.map((style) => (
          <button
            type="button"
            key={style}
            onClick={() => setVoiceStyle(style)}
            aria-pressed={voiceStyle === style}
            style={{
              ...styles.voiceButton,
              ...(voiceStyle === style
                ? styles.activeVoiceButton
                : {}),
            }}
          >
            <Volume2 size={15} />
            {style}
          </button>
        ))}
      </div>

      <div style={styles.dubbingRows}>
        {selectedTargets.map((language) => (
          <div
            key={language}
            style={styles.dubbingRow}
          >
            <Languages size={15} />
            <span>
              <strong>{language}</strong>
              <small>{voiceStyle}</small>
            </span>
            <span style={styles.readyBadge}>Ready</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setDubbingEnabled((value) => !value)
        }
        style={styles.primaryButton}
      >
        <Volume2 size={16} />
        {dubbingEnabled
          ? 'Disable AI dubbing'
          : 'Enable AI dubbing'}
      </button>
    </section>
  );

  const renderGuests = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Guest Translation"
        subtitle="Bridge multilingual conversations with live interpretation."
        icon={Users}
      />

      <div style={styles.guestList}>
        {guests.length ? (
          guests.map((guest, index) => (
            <div
              key={guest.id || index}
              style={styles.guestRow}
            >
              <Avatar item={guest} />
              <div style={styles.guestCopy}>
                <strong>
                  {guest.name || 'Guest speaker'}
                </strong>
                <span>
                  {guest.language || 'Language foundation'} ·{' '}
                  {selectedSource} →{' '}
                  {selectedTargets[0] || 'Target'}
                </span>
                <small>
                  {guest.transcript ||
                    'Live transcript foundation'}
                </small>
              </div>
              <span style={styles.readyBadge}>
                {guest.status || 'Interpreting'}
              </span>
            </div>
          ))
        ) : (
          <Empty label="Guest language bridges will appear here." />
        )}
      </div>

      <div style={styles.guestControls}>
        <button
          type="button"
          onClick={() => setGuestAudio((value) => !value)}
          style={styles.controlButton}
        >
          {guestAudio ? (
            <Volume2 size={15} />
          ) : (
            <VolumeX size={15} />
          )}
          {guestAudio
            ? 'Mute translated audio'
            : 'Enable translated audio'}
        </button>
        <button
          type="button"
          onClick={() =>
            showNotice('Original audio routing configured.')
          }
          style={styles.controlButton}
        >
          <AudioLines size={15} />
          Original audio
        </button>
      </div>
    </section>
  );

  const renderAudience = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Audience Languages"
        subtitle="Understand who is listening and how they receive translations."
        icon={Globe2}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Active listeners"
          value={numeric(audience.activeListeners)}
          icon={Users}
          color="#4dd7ff"
        />
        <MetricCard
          label="Subtitle viewers"
          value={numeric(audience.subtitleViewers)}
          icon={Subtitles}
          color="#a895ff"
        />
        <MetricCard
          label="Auto-translation"
          value={audience.autoTranslation || 'Enabled'}
          icon={Languages}
          color="#82e9c1"
        />
        <MetricCard
          label="Dubbed listeners"
          value={
            audience.dubbedListeners || 'Foundation'
          }
          icon={Volume2}
          color="#ffd27d"
        />
      </div>

      <div style={styles.audienceList}>
        {(audience.topLanguages || [
          ['English', 42],
          ['Hindi', 25],
          ['Japanese', 14],
          ['Spanish', 11],
        ]).map(([language, percentage]) => (
          <div
            key={language}
            style={styles.audienceRow}
          >
            <span>{language}</span>
            <div style={styles.audienceTrack}>
              <span
                style={{
                  ...styles.audienceFill,
                  width: `${percentage}%`,
                }}
              />
            </div>
            <strong>{percentage}%</strong>
          </div>
        ))}
      </div>
    </section>
  );

  const renderAnalytics = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Translation Analytics"
        subtitle="Monitor quality, latency, language use, and engagement."
        icon={Activity}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Translation latency"
          value={`${latency} ms`}
          icon={Zap}
          color="#4dd7ff"
        />
        <MetricCard
          label="Accuracy estimate"
          value={`${confidence}%`}
          icon={Check}
          color="#82e9c1"
        />
        <MetricCard
          label="Subtitle coverage"
          value={
            stream.subtitleCoverage
              ? `${stream.subtitleCoverage}%`
              : 'Foundation'
          }
          icon={Subtitles}
          color="#a895ff"
        />
        <MetricCard
          label="Language usage"
          value={selectedTargets.length}
          icon={Languages}
          color="#ffd27d"
        />
        <MetricCard
          label="Retention by language"
          value={
            audience.retentionByLanguage || 'Foundation'
          }
          icon={Users}
          color="#9deeff"
        />
        <MetricCard
          label="Engagement by language"
          value={
            audience.engagementByLanguage || 'Foundation'
          }
          icon={MessageCircle}
          color="#ff4fd8"
        />
      </div>
    </section>
  );

  const renderControls = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Broadcast Controls"
        subtitle="Configure the global voice translation session."
        icon={Settings2}
      />

      <div style={styles.controlGrid}>
        <Control
          label={isTranslating ? 'Stop Translation' : 'Start Translation'}
          icon={isTranslating ? MicOff : Mic2}
          active={isTranslating}
          onClick={
            isTranslating
              ? stopTranslation
              : startTranslation
          }
        />
        <Control
          label={
            subtitlesEnabled
              ? 'Disable Subtitles'
              : 'Enable Subtitles'
          }
          icon={Subtitles}
          active={subtitlesEnabled}
          onClick={() =>
            setSubtitlesEnabled((value) => !value)
          }
        />
        <Control
          label={
            dubbingEnabled
              ? 'Disable AI Dubbing'
              : 'Enable AI Dubbing'
          }
          icon={Volume2}
          active={dubbingEnabled}
          onClick={() =>
            setDubbingEnabled((value) => !value)
          }
        />
        <Control
          label="Translate Chat"
          icon={MessageCircle}
          active={translatedChat}
          onClick={() =>
            setTranslatedChat((value) => !value)
          }
        />
        <Control
          label="Translate Guest Audio"
          icon={Users}
          active={guestAudio}
          onClick={() =>
            setGuestAudio((value) => !value)
          }
        />
        <Control
          label="Global Audience"
          icon={Globe2}
          active={globalBroadcast}
          onClick={() =>
            setGlobalBroadcast((value) => !value)
          }
        />
        <Control
          label="Save Transcript"
          icon={Save}
          onClick={() =>
            showNotice('Transcript save foundation prepared.')
          }
        />
        <Control
          label="Stream Settings"
          icon={Settings2}
          onClick={() =>
            showNotice('Broadcast settings opened.')
          }
        />
      </div>

      <button
        type="button"
        onClick={
          isTranslating ? stopTranslation : startTranslation
        }
        style={{
          ...styles.primaryButton,
          ...(isTranslating ? styles.stopButton : {}),
        }}
      >
        {isTranslating ? <MicOff size={16} /> : <Play size={16} />}
        {isTranslating
          ? 'Stop translation'
          : 'Start translation'}
      </button>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'monitor') return renderMonitor();
    if (activeModule === 'bridge') return renderBridge();
    if (activeModule === 'subtitles') return renderSubtitles();
    if (activeModule === 'dubbing') return renderDubbing();
    if (activeModule === 'guests') return renderGuests();
    if (activeModule === 'audience') return renderAudience();
    if (activeModule === 'analytics') return renderAnalytics();
    if (activeModule === 'controls') return renderControls();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close live voice translation studio"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Live Voice Translation Studio</strong>
          <span>
            Speak once, connect everywhere
          </span>
        </div>

        <button
          type="button"
          aria-label="Translation studio settings"
          style={styles.iconButton}
        >
          <Settings2 size={18} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <nav style={styles.moduleNav}>
          {MODULES.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveModule(id)}
              aria-pressed={activeModule === id}
              style={{
                ...styles.moduleButton,
                ...(activeModule === id
                  ? styles.activeModuleButton
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {renderModule()}
      </div>

      <style>{`
        @keyframes aarush-voice-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-voice-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-voice-card:hover,
        .aarush-voice-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-voice-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-voice-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-voice-languages {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </main>
  );
}

function VoicePulse({ active }) {
  return (
    <div
      style={{
        ...styles.voicePulse,
        ...(active ? styles.activeVoicePulse : {}),
      }}
      aria-label={active ? 'Voice translation active' : 'Voice monitor idle'}
    >
      <Mic2 size={28} />
      <span />
      <span />
      <span />
    </div>
  );
}

function Control({
  label,
  icon: Icon,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        ...styles.controlButton,
        ...(active ? styles.activeControlButton : {}),
      }}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

function Avatar({ item }) {
  const source =
    item?.avatar || item?.image || item?.photo;

  if (source) {
    return (
      <img
        src={source}
        alt=""
        loading="lazy"
        style={styles.avatar}
      />
    );
  }

  return (
    <span style={styles.avatarFallback}>
      {String(item?.name || 'G')
        .charAt(0)
        .toUpperCase()}
    </span>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Languages size={25} />
      <span>{label}</span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.58),#07090e 68%)',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.65rem',
    padding: '.75rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  iconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.06)',
    cursor: 'pointer',
  },

  heading: {
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  content: {
    width: 'min(100%, 1100px)',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.8rem',
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    padding: '.65rem',
    border: '1px solid rgba(130,233,193,.22)',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.64rem',
  },

  moduleNav: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    paddingBottom: '.2rem',
  },

  moduleButton: {
    minWidth: '5.9rem',
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.28rem',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeModuleButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  monitorHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation: 'aarush-voice-pulse 3s ease-in-out infinite',
  },

  voicePulse: {
    width: '4.8rem',
    height: '4.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.16rem',
    flexShrink: 0,
    border: '1px solid rgba(77,215,255,.35)',
    borderRadius: '1.2rem',
    color: '#9deeff',
    background:
      'radial-gradient(circle,#3d6d8a,#262257 70%)',
  },

  activeVoicePulse: {
    animation: 'aarush-voice-pulse 1.5s ease-in-out infinite',
  },

  voicePulseSpan: {
    width: '.18rem',
    borderRadius: '.2rem',
    background: '#4dd7ff',
  },

  monitorCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.25rem',
  },

  aiBadge: {
    width: 'fit-content',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.56rem',
    fontWeight: 800,
  },

  monitorCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  monitorCopyP: {
    maxWidth: '40rem',
    margin: 0,
    color: '#91a0bc',
    fontSize: '.63rem',
    lineHeight: 1.45,
  },

  heroMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.55rem',
    marginTop: '.25rem',
    color: '#9deeff',
    fontSize: '.57rem',
  },

  heroMetaSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-voice-in 240ms ease both',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.7rem',
  },

  sectionHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  sectionHeaderH2: {
    margin: 0,
    fontSize: '.86rem',
  },

  sectionHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  smallPrimary: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.59rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  smallButton: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  voiceWave: {
    height: '5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.18rem',
    padding: '.6rem',
    borderRadius: '.8rem',
    background: 'rgba(77,215,255,.05)',
  },

  voiceWaveSpan: {
    width: '.22rem',
    minHeight: '.5rem',
    borderRadius: '.3rem',
    background:
      'linear-gradient(180deg,#4dd7ff,#7c5cff)',
    transition: 'height 180ms ease, opacity 180ms ease',
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
    marginTop: '.7rem',
  },

  metricCard: {
    minHeight: '6.4rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    background: 'rgba(15,19,30,.9)',
  },

  metricIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.6rem',
  },

  metricLabel: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  metricValue: {
    color: '#fff',
    fontSize: '.79rem',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    marginTop: '.65rem',
    color: '#aab6cf',
    fontSize: '.62rem',
  },

  select: {
    minHeight: '2.4rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
  },

  targetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    margin: '.75rem 0 .5rem',
    color: '#aab6cf',
    fontSize: '.61rem',
  },

  targetHeaderStrong: {
    color: '#9deeff',
  },

  languageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
  },

  languageButton: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .45rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.65rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.56rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeLanguageButton: {
    borderColor: 'rgba(77,215,255,.38)',
    color: '#fff',
    background: 'rgba(77,215,255,.12)',
  },

  languageButtonSpan: {
    flex: 1,
  },

  bridgeSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.6rem',
  },

  subtitlePreview: {
    display: 'grid',
    gap: '.25rem',
    minHeight: '8rem',
    padding: '.8rem',
    borderRadius: '.8rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.16),rgba(77,215,255,.06))',
  },

  speakerLabel: {
    width: 'fit-content',
    padding: '.25rem .4rem',
    borderRadius: '.4rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.54rem',
  },

  subtitlePreviewP: {
    margin: 0,
    color: '#fff',
    fontSize: '.78rem',
    lineHeight: 1.45,
  },

  subtitlePreviewSmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  optionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  optionButton: {
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.65rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  voiceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
  },

  voiceButton: {
    minHeight: '2.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeVoiceButton: {
    borderColor: 'rgba(124,92,255,.4)',
    color: '#fff',
    background: 'rgba(124,92,255,.15)',
  },

  dubbingRows: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  dubbingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
  },

  dubbingRowSpan: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  dubbingRowSmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  readyBadge: {
    padding: '.25rem .4rem',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '.53rem',
  },

  guestList: {
    display: 'grid',
    gap: '.4rem',
  },

  guestRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  avatar: {
    width: '2.45rem',
    height: '2.45rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '999px',
  },

  avatarFallback: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  guestCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  guestCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  guestCopySmall: {
    color: '#6f7d98',
    fontSize: '.54rem',
  },

  guestControls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.65rem',
  },

  controlButton: {
    minHeight: '2.35rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  audienceList: {
    display: 'grid',
    gap: '.5rem',
    marginTop: '.7rem',
  },

  audienceRow: {
    display: 'grid',
    gridTemplateColumns: '6rem 1fr 2.5rem',
    alignItems: 'center',
    gap: '.45rem',
    color: '#cbd6ec',
    fontSize: '.59rem',
  },

  audienceTrack: {
    height: '.35rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.09)',
  },

  audienceFill: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  audienceRowStrong: {
    color: '#9deeff',
    fontSize: '.57rem',
    textAlign: 'right',
  },

  controlGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
  },

  activeControlButton: {
    borderColor: 'rgba(77,215,255,.3)',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
  },

  stopButton: {
    background:
      'linear-gradient(135deg,#ff4f82,#ff9f72)',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    width: '100%',
    marginTop: '.7rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  empty: {
    minHeight: '6rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gridColumn: '1 / -1',
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.64rem',
    textAlign: 'center',
  },
};