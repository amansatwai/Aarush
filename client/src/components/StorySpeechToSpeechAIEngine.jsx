import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AudioLines,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FileAudio,
  FileText,
  Globe2,
  HeartPulse,
  Languages,
  Mic2,
  Pause,
  Play,
  Radio,
  Settings2,
  Sparkles,
  UserRound,
  Volume2,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['engine', 'Live Voice Engine', AudioLines],
  ['source', 'Source Language', Globe2],
  ['target', 'Target Language', Languages],
  ['voice', 'Voice Profile', UserRound],
  ['dubbing', 'AI Dubbing', Volume2],
  ['emotion', 'Emotion', HeartPulse],
  ['bridge', 'Conversation Bridge', Radio],
  ['export', 'Export', Download],
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

const VOICE_PROFILES = [
  'Original Voice',
  'Natural AI Voice',
  'Masculine AI Voice',
  'Feminine AI Voice',
  'Neutral AI Voice',
  'Friendly AI Voice',
  'Professional AI Voice',
  'Creator Voice Clone foundation',
];

const EMOTIONS = [
  'Happy',
  'Sad',
  'Excited',
  'Calm',
  'Serious',
  'Motivational',
  'Storytelling',
  'Cinematic',
];

function numeric(value) {
  return Number(value) || 0;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(numeric(seconds)));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    remaining
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

export default function StorySpeechToSpeechAIEngine({
  speaker = {},
  audioInput = {},
  transcript = '',
  sourceLanguage = 'English',
  targetLanguage = 'Hindi',
  voiceProfile = 'Natural AI Voice',
  translationSettings = {},
  onStartEngine,
  onStopEngine,
  onPlayTranslation,
  onExportAudio,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('engine');
  const [status, setStatus] = useState(
    audioInput.status || 'Idle'
  );
  const [isRunning, setIsRunning] = useState(
    Boolean(audioInput.active)
  );
  const [selectedSource, setSelectedSource] =
    useState(sourceLanguage);
  const [selectedTarget, setSelectedTarget] =
    useState(targetLanguage);
  const [selectedVoice, setSelectedVoice] =
    useState(voiceProfile);
  const [emotion, setEmotion] = useState(
    translationSettings.emotion || 'Natural'
  );
  const [speechSpeed, setSpeechSpeed] = useState(
    numeric(translationSettings.speechSpeed) || 1
  );
  const [emotionConfidence, setEmotionConfidence] =
    useState(
      numeric(translationSettings.emotionConfidence) || 86
    );
  const [elapsed, setElapsed] = useState(
    numeric(audioInput.duration)
  );
  const [notice, setNotice] = useState('');

  const confidence = useMemo(
    () =>
      Math.round(
        numeric(translationSettings.confidence) || 89
      ),
    [translationSettings.confidence]
  );

  const latency = useMemo(
    () =>
      numeric(translationSettings.latency) || 380,
    [translationSettings.latency]
  );

  const sourceText = useMemo(
    () =>
      transcript ||
      audioInput.transcript ||
      'Voice transcript preview will appear here.',
    [audioInput.transcript, transcript]
  );

  const translatedText = useMemo(() => {
    if (!sourceText) return '';
    if (sourceText.includes('preview')) {
      return 'Translated speech preview will appear here.';
    }

    return `${sourceText} · ${selectedTarget} voice output`;
  }, [selectedTarget, sourceText]);

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  useEffect(() => {
    if (!isRunning) return undefined;

    const timer = window.setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  const startEngine = async () => {
    setIsRunning(true);
    setStatus('Listening');

    await onStartEngine?.({
      speakerId: speaker.id || speaker.speakerId,
      sourceLanguage: selectedSource,
      targetLanguage: selectedTarget,
      voiceProfile: selectedVoice,
      emotion,
      speechSpeed,
      translationSettings,
    });

    window.setTimeout(() => {
      setStatus('Detecting Language');
    }, 300);

    window.setTimeout(() => {
      setStatus('Transcribing');
    }, 650);

    window.setTimeout(() => {
      setStatus('Translating');
    }, 1000);

    showNotice('Speech-to-speech engine started.');
  };

  const stopEngine = async () => {
    setIsRunning(false);
    setStatus('Complete');

    await onStopEngine?.({
      speakerId: speaker.id || speaker.speakerId,
      sourceLanguage: selectedSource,
      targetLanguage: selectedTarget,
      duration: elapsed,
      confidence,
      latency,
    });

    showNotice('Engine processing completed.');
  };

  const playTranslation = () => {
    onPlayTranslation?.({
      sourceLanguage: selectedSource,
      targetLanguage: selectedTarget,
      translatedTranscript: translatedText,
      voiceProfile: selectedVoice,
      emotion,
      speechSpeed,
    });

    showNotice('Translated voice playback prepared.');
  };

  const exportAudio = (format) => {
    onExportAudio?.({
      format,
      speakerId: speaker.id || speaker.speakerId,
      sourceLanguage: selectedSource,
      targetLanguage: selectedTarget,
      transcript: sourceText,
      translatedTranscript: translatedText,
      voiceProfile: selectedVoice,
      emotion,
      latency,
      confidence,
    });

    showNotice(`${format} export prepared.`);
  };

  const renderEngine = () => (
    <>
      <section style={styles.engineHero}>
        <VoicePulse active={isRunning} />
        <div style={styles.engineCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Speech-to-speech intelligence
          </span>
          <h1>{status}</h1>
          <p>
            Translate spoken language while preserving voice
            timing, emotional intent, and natural pacing.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Clock3 size={13} />
              {formatDuration(elapsed)}
            </span>
            <span>
              <Languages size={13} />
              {selectedSource} → {selectedTarget}
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
          title="Live Voice Engine"
          subtitle="Monitor audio input, transcription, and voice generation."
          icon={AudioLines}
          action={
            <button
              type="button"
              onClick={isRunning ? stopEngine : startEngine}
              style={styles.smallPrimary}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              {isRunning ? 'Stop' : 'Start'}
            </button>
          }
        />

        <Waveform active={isRunning} />

        <div style={styles.metricGrid}>
          <MetricCard
            label="Input"
            value={audioInput.connected ? 'Connected' : 'Ready'}
            icon={Mic2}
            color="#4dd7ff"
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
          <MetricCard
            label="Voice output"
            value={selectedVoice}
            icon={Volume2}
            color="#a895ff"
          />
        </div>
      </section>
    </>
  );

  const renderSource = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Source Language"
        subtitle="Select or prepare automatic language detection."
        icon={Globe2}
      />

      <label style={styles.field}>
        Spoken source language
        <select
          value={selectedSource}
          onChange={(event) =>
            setSelectedSource(event.target.value)
          }
          style={styles.select}
        >
          {LANGUAGES.map((language) => (
            <option key={language}>{language}</option>
          ))}
        </select>
      </label>

      <div style={styles.detectionCard}>
        <Sparkles size={17} />
        <div>
          <strong>Automatic detection confidence</strong>
          <span>{confidence}% · Source language ready</span>
        </div>
      </div>
    </section>
  );

  const renderTarget = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Target Language"
        subtitle="Choose the spoken output language."
        icon={Languages}
      />

      <div style={styles.languageGrid}>
        {LANGUAGES.map((language) => (
          <button
            type="button"
            key={language}
            onClick={() => setSelectedTarget(language)}
            aria-pressed={selectedTarget === language}
            style={{
              ...styles.languageButton,
              ...(selectedTarget === language
                ? styles.activeLanguageButton
                : {}),
            }}
          >
            <Languages size={14} />
            <span>{language}</span>
            {selectedTarget === language ? (
              <Check size={14} />
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );

  const renderVoice = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Voice Profile"
        subtitle="Prepare voice identity and output style."
        icon={UserRound}
      />

      <div style={styles.voiceGrid}>
        {VOICE_PROFILES.map((profile) => (
          <button
            type="button"
            key={profile}
            onClick={() => setSelectedVoice(profile)}
            aria-pressed={selectedVoice === profile}
            style={{
              ...styles.voiceButton,
              ...(selectedVoice === profile
                ? styles.activeVoiceButton
                : {}),
            }}
          >
            <Volume2 size={15} />
            <span>{profile}</span>
            {selectedVoice === profile ? (
              <Check size={14} />
            ) : null}
          </button>
        ))}
      </div>

      <div style={styles.voiceProfileCard}>
        <UserRound size={19} />
        <div>
          <strong>{selectedVoice}</strong>
          <span>
            Per-language voice selection and creator voice clone
            foundation ready.
          </span>
        </div>
      </div>
    </section>
  );

  const renderDubbing = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Dubbing"
        subtitle="Preserve natural speech timing and delivery."
        icon={Volume2}
      />

      <div style={styles.dubbingGrid}>
        {[
          'Lip-sync metadata foundation',
          'Timing preservation',
          'Pause preservation',
          'Breathing preservation foundation',
          'Natural pacing',
        ].map((item) => (
          <button
            type="button"
            key={item}
            onClick={() =>
              showNotice(`${item} configured.`)
            }
            style={styles.optionButton}
          >
            <Check size={14} color="#82e9c1" />
            {item}
          </button>
        ))}
      </div>

      <label style={styles.field}>
        Speech speed
        <div style={styles.rangeRow}>
          <input
            type="range"
            min="0.6"
            max="1.5"
            step="0.1"
            value={speechSpeed}
            onChange={(event) =>
              setSpeechSpeed(Number(event.target.value))
            }
            style={styles.range}
          />
          <output>{speechSpeed.toFixed(1)}x</output>
        </div>
      </label>
    </section>
  );

  const renderEmotion = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Emotion Preservation"
        subtitle="Keep the speaker's delivery style in translation."
        icon={HeartPulse}
      />

      <div style={styles.emotionGrid}>
        {['Natural', ...EMOTIONS].map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setEmotion(item)}
            aria-pressed={emotion === item}
            style={{
              ...styles.emotionButton,
              ...(emotion === item
                ? styles.activeEmotionButton
                : {}),
            }}
          >
            <HeartPulse size={15} />
            {item}
          </button>
        ))}
      </div>

      <div style={styles.confidenceCard}>
        <Sparkles size={17} />
        <span>Emotion confidence</span>
        <strong>{emotionConfidence}%</strong>
      </div>
    </section>
  );

  const renderBridge = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Conversation Bridge"
        subtitle="Prepare two-way multilingual conversations."
        icon={Radio}
      />

      <div style={styles.conversationList}>
        <ConversationRow
          label="Speaker A"
          language={selectedSource}
          transcript={sourceText}
        />
        <ConversationRow
          label="Speaker B"
          language={selectedTarget}
          transcript={translatedText}
        />
      </div>

      <div style={styles.metricGrid}>
        <MetricCard
          label="Conversation latency"
          value={`${latency} ms`}
          icon={Clock3}
          color="#4dd7ff"
        />
        <MetricCard
          label="AI interpretation"
          value={isRunning ? 'Active' : 'Ready'}
          icon={Sparkles}
          color="#a895ff"
        />
        <MetricCard
          label="Original audio"
          value="Available"
          icon={AudioLines}
          color="#82e9c1"
        />
        <MetricCard
          label="Voice output"
          value="Prepared"
          icon={Volume2}
          color="#ffd27d"
        />
      </div>
    </section>
  );

  const renderExport = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Export"
        subtitle="Prepare audio, transcript, subtitles, and metadata."
        icon={Download}
      />

      <div style={styles.exportGrid}>
        {[
          ['MP3', FileAudio],
          ['WAV', FileAudio],
          ['AAC', FileAudio],
          ['Transcript', FileText],
          ['Subtitle File', SubtitlesIcon],
          ['Voice Metadata', Settings2],
          ['Translation Report', FileText],
        ].map(([format, Icon]) => (
          <button
            type="button"
            key={format}
            onClick={() => exportAudio(format)}
            style={styles.exportButton}
          >
            <Icon size={16} />
            <span>{format}</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>

      <div style={styles.metadataCard}>
        <strong>Speech metadata</strong>
        <span>
          speakerId · sourceLanguage · targetLanguage ·
          transcript · translatedTranscript · voiceProfile ·
          emotion · latency · confidence
        </span>
      </div>

      <button
        type="button"
        onClick={playTranslation}
        style={styles.primaryButton}
      >
        <Play size={16} />
        Play translated voice
      </button>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'engine') return renderEngine();
    if (activeModule === 'source') return renderSource();
    if (activeModule === 'target') return renderTarget();
    if (activeModule === 'voice') return renderVoice();
    if (activeModule === 'dubbing') return renderDubbing();
    if (activeModule === 'emotion') return renderEmotion();
    if (activeModule === 'bridge') return renderBridge();
    if (activeModule === 'export') return renderExport();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close speech-to-speech AI engine"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Speech-to-Speech AI Engine</strong>
          <span>
            Preserve voice, emotion, and meaning across languages
          </span>
        </div>

        <button
          type="button"
          aria-label="Voice engine settings"
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
        @keyframes aarush-speech-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-speech-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-speech-card:hover,
        .aarush-speech-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-speech-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-speech-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-speech-languages {
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
      aria-label={active ? 'Voice engine active' : 'Voice engine idle'}
    >
      <Mic2 size={28} />
      <span />
      <span />
      <span />
    </div>
  );
}

function Waveform({ active }) {
  return (
    <div style={styles.waveform}>
      {Array.from({ length: 36 }, (_, index) => (
        <span
          key={index}
          style={{
            height: `${18 + ((index * 19) % 62)}%`,
            opacity: active ? 1 : .45,
          }}
        />
      ))}
    </div>
  );
}

function ConversationRow({ label, language, transcript }) {
  return (
    <div style={styles.conversationRow}>
      <span style={styles.speakerIcon}>
        <UserRound size={16} />
      </span>
      <div style={styles.conversationCopy}>
        <strong>{label}</strong>
        <span>{language}</span>
        <small>{transcript}</small>
      </div>
      <Volume2 size={15} color="#82e9c1" />
    </div>
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
      {String(item?.name || 'S')
        .charAt(0)
        .toUpperCase()}
    </span>
  );
}

function SubtitlesIcon() {
  return <FileText size={16} />;
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

  engineHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation: 'aarush-speech-pulse 3s ease-in-out infinite',
  },

  voicePulse: {
    width: '4.8rem',
    height: '4.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.15rem',
    flexShrink: 0,
    border: '1px solid rgba(77,215,255,.35)',
    borderRadius: '1.2rem',
    color: '#9deeff',
    background:
      'radial-gradient(circle,#3d6d8a,#262257 70%)',
  },

  activeVoicePulse: {
    animation: 'aarush-speech-pulse 1.5s ease-in-out infinite',
  },

  voicePulseSpan: {
    width: '.18rem',
    borderRadius: '.2rem',
    background: '#4dd7ff',
  },

  engineCopy: {
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

  engineCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  engineCopyP: {
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
    animation: 'aarush-speech-in 240ms ease both',
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

  waveform: {
    height: '5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.16rem',
    padding: '.6rem',
    borderRadius: '.8rem',
    background: 'rgba(77,215,255,.05)',
  },

  waveformSpan: {
    width: '.2rem',
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

  detectionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
  },

  detectionCardDiv: {
    display: 'grid',
    gap: '.17rem',
  },

  detectionCardSpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
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

  voiceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  voiceButton: {
    minHeight: '2.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
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

  voiceButtonSpan: {
    flex: 1,
  },

  voiceProfileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
  },

  voiceProfileCardDiv: {
    display: 'grid',
    gap: '.17rem',
  },

  voiceProfileCardSpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  dubbingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  optionButton: {
    minHeight: '2.6rem',
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

  rangeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
  },

  range: {
    flex: 1,
    accentColor: '#7c5cff',
  },

  rangeRowOutput: {
    minWidth: '2.3rem',
    color: '#9deeff',
    fontSize: '.58rem',
    textAlign: 'right',
  },

  emotionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
  },

  emotionButton: {
    minHeight: '2.6rem',
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

  activeEmotionButton: {
    borderColor: 'rgba(255,159,114,.36)',
    color: '#fff',
    background: 'rgba(255,159,114,.12)',
  },

  confidenceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(124,92,255,.08)',
    fontSize: '.6rem',
  },

  confidenceCardStrong: {
    marginLeft: 'auto',
    color: '#82e9c1',
  },

  conversationList: {
    display: 'grid',
    gap: '.4rem',
  },

  conversationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  speakerIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  conversationCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  conversationCopySpan: {
    color: '#9deeff',
    fontSize: '.57rem',
  },

  conversationCopySmall: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  exportGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  exportButton: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  metadataCard: {
    display: 'grid',
    gap: '.25rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.6rem',
  },

  metadataCardSpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
    lineHeight: 1.45,
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

  avatar: {
    width: '2.25rem',
    height: '2.25rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '999px',
  },

  avatarFallback: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },
};