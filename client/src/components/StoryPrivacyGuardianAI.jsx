import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  CircleAlert,
  Eye,
  FileWarning,
  Fingerprint,
  Focus,
  Globe2,
  Image as ImageIcon,
  LockKeyhole,
  Mail,
  MapPin,
  Maximize2,
  Minus,
  Move,
  Phone,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  UserRound,
  X,
  ZoomIn,
} from 'lucide-react';

const MODULES = [
  ['scan', 'Privacy Scan', ScanLine],
  ['detected', 'Detected Items', Focus],
  ['protection', 'AI Protection', ShieldCheck],
  ['rules', 'Privacy Rules', LockKeyhole],
  ['preview', 'Before / After', Eye],
  ['publish', 'Safe Publish', Check],
];

const DETECTION_TYPES = [
  ['face', 'Faces', UserRound],
  ['children', 'Children', UserRound],
  ['plate', 'License Plates', Square],
  ['vehicle', 'Vehicle Numbers', Square],
  ['id', 'ID Cards', FileWarning],
  ['passport', 'Passports', FileWarning],
  ['license', 'Driver Licenses', FileWarning],
  ['card', 'Credit Cards', LockKeyhole],
  ['document', 'Documents', FileWarning],
  ['screen', 'Screens', ImageIcon],
  ['phone', 'Phone Numbers', Phone],
  ['email', 'Email Addresses', Mail],
  ['address', 'Home Addresses', MapPin],
  ['qr', 'QR Codes', QrCode],
  ['barcode', 'Barcodes', ScanLine],
  ['gps', 'GPS Coordinates', Globe2],
  ['signature', 'Signatures', Fingerprint],
  ['bank', 'Bank Information', LockKeyhole],
];

const PROTECTION_TYPES = [
  'Blur',
  'Pixelate',
  'Black Box',
  'Glass Blur',
  'AI Object Removal',
  'Smart Redaction',
  'Dynamic Blur',
];

const RULES = [
  ['blurUnknownFaces', 'Blur Unknown Faces'],
  ['blurAllFaces', 'Blur All Faces'],
  ['blurChildren', 'Blur Children'],
  ['blurLicensePlates', 'Blur License Plates'],
  ['hideDocuments', 'Hide Documents'],
  ['hideAddresses', 'Hide Addresses'],
  ['hidePhoneNumbers', 'Hide Phone Numbers'],
  ['hideEmails', 'Hide Emails'],
  ['hideQrCodes', 'Hide QR Codes'],
  ['hideScreens', 'Hide Screens'],
  ['hideGpsMetadata', 'Hide GPS Metadata'],
];

function numeric(value) {
  return Number(value) || 0;
}

function normalizeDetection(item, index) {
  return {
    ...item,
    id: item?.id || `detection-${index}`,
    type: item?.type || 'face',
    label: item?.label || 'Sensitive item',
    confidence: numeric(item?.confidence) || 88,
    boundingBox: item?.boundingBox || {
      x: 18 + (index % 4) * 18,
      y: 16 + (index % 3) * 22,
      width: 18,
      height: 14,
    },
    protectionType:
      item?.protectionType || 'Smart Redaction',
    intensity: numeric(item?.intensity) || 72,
    approved: item?.approved !== false,
  };
}

function categoryName(type) {
  return (
    DETECTION_TYPES.find(([id]) => id === type)?.[1] ||
    type ||
    'Sensitive item'
  );
}

function formatType(type) {
  return type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (letter) => letter.toUpperCase());
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

export default function StoryPrivacyGuardianAI({
  media = null,
  detections = [],
  privacyMode = 'Balanced',
  sensitivity = 'Balanced',
  onApplyProtection,
  onRemoveProtection,
  onScanMedia,
  onApprove,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('scan');
  const [scanState, setScanState] =
    useState(detections.length ? 'Complete' : 'Ready');
  const [scanProgress, setScanProgress] =
    useState(detections.length ? 100 : 0);
  const [selectedSensitivity, setSelectedSensitivity] =
    useState(sensitivity);
  const [selectedProtection, setSelectedProtection] =
    useState('Smart Redaction');
  const [showProtected, setShowProtected] =
    useState(true);
  const [previewMode, setPreviewMode] =
    useState('After');
  const [zoom, setZoom] = useState(1);
  const [notice, setNotice] = useState('');
  const [ruleState, setRuleState] = useState(() => ({
    blurUnknownFaces: true,
    blurAllFaces: false,
    blurChildren: true,
    blurLicensePlates: true,
    hideDocuments: true,
    hideAddresses: true,
    hidePhoneNumbers: true,
    hideEmails: true,
    hideQrCodes: true,
    hideScreens: true,
    hideGpsMetadata: true,
  }));

  const normalizedDetections = useMemo(
    () => detections.map(normalizeDetection),
    [detections]
  );

  const protectedCount = useMemo(
    () =>
      normalizedDetections.filter(
        (item) => item.approved !== false
      ).length,
    [normalizedDetections]
  );

  const averageConfidence = useMemo(() => {
    if (!normalizedDetections.length) return 0;

    return Math.round(
      normalizedDetections.reduce(
        (sum, item) => sum + item.confidence,
        0
      ) / normalizedDetections.length
    );
  }, [normalizedDetections]);

  const safetyScore = useMemo(() => {
    if (!normalizedDetections.length) return 100;

    const unprotected = normalizedDetections.filter(
      (item) => item.approved === false
    ).length;

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(
          96 -
            unprotected * 14 -
            (selectedSensitivity === 'Low' ? 5 : 0)
        )
      )
    );
  }, [normalizedDetections, selectedSensitivity]);

  const status = useMemo(() => {
    if (safetyScore >= 90) return 'Safe to Publish';
    if (safetyScore >= 75) return 'Minor Privacy Risk';
    if (safetyScore >= 55) return 'Moderate Privacy Risk';
    if (safetyScore >= 30) return 'High Privacy Risk';
    return 'Critical';
  }, [safetyScore]);

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const scanMedia = async () => {
    setScanState('Scanning');
    setScanProgress(20);

    const phases = [
      ['Detecting', 48],
      ['Masking', 76],
      ['Complete', 100],
    ];

    for (const [phase, progress] of phases) {
      await new Promise((resolve) =>
        window.setTimeout(resolve, 300)
      );
      setScanState(phase);
      setScanProgress(progress);
    }

    await onScanMedia?.({
      media,
      sensitivity: selectedSensitivity,
      rules: ruleState,
    });

    showNotice('Privacy scan complete.');
  };

  const applyProtection = (item) => {
    onApplyProtection?.({
      ...item,
      protectionType: selectedProtection,
      sensitivity: selectedSensitivity,
      intensity: item.intensity || 72,
      approved: true,
    });

    showNotice(`${categoryName(item.type)} protected.`);
  };

  const removeProtection = (item) => {
    onRemoveProtection?.(item);
    showNotice('Protection removal prepared.');
  };

  const toggleRule = (key) => {
    setRuleState((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const renderScan = () => (
    <>
      <section style={styles.scanHero}>
        <div style={styles.scanOrb}>
          <ScanLine size={31} />
        </div>
        <div style={styles.scanCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Privacy Guardian AI
          </span>
          <h1>{scanState}</h1>
          <p>
            Detect and protect sensitive information before
            publishing. Computer vision integration is prepared
            for future batches.
          </p>
          <div style={styles.scanMeta}>
            <span>
              <ShieldCheck size={13} />
              {protectedCount} items protected
            </span>
            <span>
              <Focus size={13} />
              {averageConfidence || '—'}% confidence
            </span>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Privacy Scan"
          subtitle="Scan media for faces, documents, contact details, and metadata."
          icon={ScanLine}
          action={
            <button
              type="button"
              onClick={scanMedia}
              style={styles.smallPrimary}
            >
              <ScanLine size={14} />
              Scan media
            </button>
          }
        />

        <div style={styles.progressTrack}>
          <span
            style={{
              ...styles.progressFill,
              width: `${scanProgress}%`,
            }}
          />
        </div>

        <div style={styles.progressMeta}>
          <span>{scanState}</span>
          <strong>{scanProgress}%</strong>
        </div>

        <div style={styles.metricGrid}>
          <MetricCard
            label="Detected items"
            value={normalizedDetections.length}
            icon={Focus}
            color="#4dd7ff"
          />
          <MetricCard
            label="Protected items"
            value={protectedCount}
            icon={ShieldCheck}
            color="#82e9c1"
          />
          <MetricCard
            label="Confidence"
            value={`${averageConfidence || 0}%`}
            icon={Sparkles}
            color="#a895ff"
          />
          <MetricCard
            label="Sensitivity"
            value={selectedSensitivity}
            icon={LockKeyhole}
            color="#ffd27d"
          />
        </div>
      </section>
    </>
  );

  const renderDetected = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Detected Items"
        subtitle="Review categories, bounding boxes, and confidence scores."
        icon={Focus}
      />

      <div style={styles.detectionList}>
        {normalizedDetections.length ? (
          normalizedDetections.map((item) => (
            <div
              key={item.id}
              style={styles.detectionRow}
            >
              <span style={styles.detectionIcon}>
                <DetectionIcon type={item.type} />
              </span>
              <div style={styles.detectionCopy}>
                <strong>
                  {item.label || categoryName(item.type)}
                </strong>
                <span>
                  {categoryName(item.type)} · Bounding box
                  foundation
                </span>
                <small>
                  Confidence {Math.round(item.confidence)}%
                </small>
              </div>
              <span
                style={{
                  ...styles.protectionBadge,
                  color: item.approved
                    ? '#82e9c1'
                    : '#ff7c9f',
                }}
              >
                {item.approved ? 'Protected' : 'Review'}
              </span>
              <button
                type="button"
                onClick={() =>
                  item.approved
                    ? removeProtection(item)
                    : applyProtection(item)
                }
                style={styles.tinyButton}
                aria-label={
                  item.approved
                    ? 'Remove protection'
                    : 'Apply protection'
                }
              >
                {item.approved ? (
                  <Minus size={14} />
                ) : (
                  <Check size={14} />
                )}
              </button>
            </div>
          ))
        ) : (
          <Empty label="No sensitive items detected yet." />
        )}
      </div>
    </section>
  );

  const renderProtection = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Protection"
        subtitle="Choose a protection method for detected items."
        icon={ShieldCheck}
      />

      <div style={styles.protectionGrid}>
        {PROTECTION_TYPES.map((method) => (
          <button
            type="button"
            key={method}
            onClick={() => setSelectedProtection(method)}
            aria-pressed={selectedProtection === method}
            style={{
              ...styles.protectionButton,
              ...(selectedProtection === method
                ? styles.activeProtectionButton
                : {}),
            }}
          >
            <ShieldCheck size={16} />
            <span>{method}</span>
            {selectedProtection === method ? (
              <Check size={14} />
            ) : null}
          </button>
        ))}
      </div>

      <div style={styles.protectionPreview}>
        <Sparkles size={19} />
        <div>
          <strong>{selectedProtection}</strong>
          <span>
            Applied to {protectedCount} detected items with{' '}
            {selectedSensitivity.toLowerCase()} sensitivity.
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          normalizedDetections.forEach(applyProtection);
          showNotice('Protection applied to all detections.');
        }}
        style={styles.primaryButton}
      >
        <ShieldCheck size={16} />
        Protect all detected items
      </button>
    </section>
  );

  const renderRules = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Privacy Rules"
        subtitle="Automatically protect common sensitive categories."
        icon={LockKeyhole}
      />

      <div style={styles.sensitivityTabs}>
        {['Low', 'Balanced', 'High', 'Maximum Privacy'].map(
          (level) => (
            <button
              type="button"
              key={level}
              onClick={() => setSelectedSensitivity(level)}
              aria-pressed={selectedSensitivity === level}
              style={{
                ...styles.sensitivityButton,
                ...(selectedSensitivity === level
                  ? styles.activeSensitivityButton
                  : {}),
              }}
            >
              {level}
            </button>
          )
        )}
      </div>

      <div style={styles.ruleList}>
        {RULES.map(([key, label]) => (
          <button
            type="button"
            key={key}
            onClick={() => toggleRule(key)}
            aria-pressed={ruleState[key]}
            style={{
              ...styles.ruleRow,
              ...(ruleState[key]
                ? styles.activeRuleRow
                : {}),
            }}
          >
            <span style={styles.ruleCheck}>
              {ruleState[key] ? <Check size={14} /> : null}
            </span>
            <span>{label}</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>
    </section>
  );

  const renderPreview = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Before / After Preview"
        subtitle="Review protection placement before approval."
        icon={Eye}
        action={
          <button
            type="button"
            onClick={() =>
              setZoom((current) =>
                current >= 2 ? 1 : current + 0.5
              )
            }
            style={styles.smallButton}
          >
            <ZoomIn size={14} />
            {zoom}x
          </button>
        }
      />

      <div style={styles.previewTabs}>
        {['Before', 'After'].map((mode) => (
          <button
            type="button"
            key={mode}
            onClick={() => setPreviewMode(mode)}
            aria-pressed={previewMode === mode}
            style={{
              ...styles.previewTab,
              ...(previewMode === mode
                ? styles.activePreviewTab
                : {}),
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div
        style={{
          ...styles.mediaPreview,
          transform: `scale(${zoom})`,
        }}
      >
        {media?.url || media?.previewUrl ? (
          <img
            src={media.url || media.previewUrl}
            alt={`${previewMode} privacy preview`}
            loading="lazy"
            style={styles.mediaImage}
          />
        ) : (
          <div style={styles.mediaPlaceholder}>
            <ImageIcon size={32} />
            <span>{previewMode} preview foundation</span>
          </div>
        )}

        {previewMode === 'After' && showProtected
          ? normalizedDetections.map((item) => (
              <span
                key={item.id}
                style={{
                  ...styles.detectionBox,
                  left: `${item.boundingBox.x}%`,
                  top: `${item.boundingBox.y}%`,
                  width: `${item.boundingBox.width}%`,
                  height: `${item.boundingBox.height}%`,
                }}
                aria-label={`${categoryName(
                  item.type
                )} protected region`}
              >
                <span>
                  {item.protectionType || selectedProtection}
                </span>
              </span>
            ))
          : null}
      </div>

      <div style={styles.manualTools}>
        <button
          type="button"
          onClick={() =>
            showNotice('Blur region tool enabled.')
          }
          style={styles.toolButton}
        >
          <Focus size={15} />
          Add blur region
        </button>
        <button
          type="button"
          onClick={() =>
            showNotice('Move and resize foundation enabled.')
          }
          style={styles.toolButton}
        >
          <Move size={15} />
          Move / resize
        </button>
        <button
          type="button"
          onClick={() =>
            showNotice('Mask intensity control opened.')
          }
          style={styles.toolButton}
        >
          <Maximize2 size={15} />
          Intensity
        </button>
      </div>
    </section>
  );

  const renderPublish = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Safe Publish"
        subtitle="Final privacy review before your story goes live."
        icon={Check}
      />

      <div style={styles.safetyHero}>
        <SafetyRing score={safetyScore} />
        <div>
          <span style={styles.aiBadge}>
            <ShieldCheck size={12} />
            Privacy assessment
          </span>
          <h2>{status}</h2>
          <p>
            {safetyScore >= 90
              ? 'Sensitive detections are protected and no major privacy risks remain.'
              : 'Review remaining detections and protection decisions before publishing.'}
          </p>
        </div>
      </div>

      <div style={styles.metricGrid}>
        <MetricCard
          label="Items protected"
          value={`${protectedCount}/${normalizedDetections.length}`}
          icon={ShieldCheck}
          color="#82e9c1"
        />
        <MetricCard
          label="Remaining risks"
          value={normalizedDetections.filter(
            (item) => !item.approved
          ).length}
          icon={AlertTriangle}
          color="#ff7c9f"
        />
        <MetricCard
          label="Sensitivity"
          value={selectedSensitivity}
          icon={LockKeyhole}
          color="#a895ff"
        />
        <MetricCard
          label="Scan confidence"
          value={`${averageConfidence || 0}%`}
          icon={Focus}
          color="#4dd7ff"
        />
      </div>

      <div style={styles.publishExplanation}>
        <CircleAlert size={16} />
        <span>
          Privacy metadata includes detection IDs, types,
          confidence, bounding boxes, protection methods,
          intensity, approval status, and sensitivity.
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          onApprove?.({
            media,
            safetyScore,
            status,
            detections: normalizedDetections,
            sensitivity: selectedSensitivity,
          });
          showNotice('Privacy approval submitted.');
        }}
        style={styles.primaryButton}
      >
        <Check size={16} />
        Approve safe publish
      </button>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'scan') return renderScan();
    if (activeModule === 'detected') return renderDetected();
    if (activeModule === 'protection') return renderProtection();
    if (activeModule === 'rules') return renderRules();
    if (activeModule === 'preview') return renderPreview();
    if (activeModule === 'publish') return renderPublish();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close privacy guardian"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Privacy Guardian AI</strong>
          <span>
            Protect sensitive information before publishing
          </span>
        </div>

        <button
          type="button"
          aria-label="Privacy security status"
          style={styles.iconButton}
        >
          <ShieldCheck size={18} />
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
        @keyframes aarush-privacy-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-privacy-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.5);
          }
        }

        .aarush-privacy-card:hover,
        .aarush-privacy-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-privacy-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-privacy-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-privacy-detection,
          .aarush-privacy-protection {
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

function DetectionIcon({ type }) {
  const Icon =
    DETECTION_TYPES.find(([id]) => id === type)?.[2] ||
    Focus;

  return <Icon size={17} />;
}

function SafetyRing({ score }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (score / 100) * circumference;

  return (
    <div style={styles.safetyRing}>
      <svg
        viewBox="0 0 110 110"
        role="img"
        aria-label={`Privacy safety score ${score} out of 100`}
        style={styles.safetySvg}
      >
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.1)"
          strokeWidth="8"
        />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke={score >= 80 ? '#82e9c1' : '#ffd27d'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
        />
      </svg>
      <div style={styles.safetyText}>
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
    </div>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <ShieldCheck size={25} />
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
      'radial-gradient(circle at top,rgba(34,43,68,.56),#07090e 68%)',
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

  scanHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-privacy-pulse 3s ease-in-out infinite',
  },

  scanOrb: {
    width: '4.7rem',
    height: '4.7rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(77,215,255,.4)',
    borderRadius: '1.2rem',
    color: '#c9f9ff',
    background:
      'radial-gradient(circle,#3d6d8a,#262257 70%)',
  },

  scanCopy: {
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

  scanCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  scanCopyP: {
    maxWidth: '40rem',
    margin: 0,
    color: '#91a0bc',
    fontSize: '.63rem',
    lineHeight: 1.45,
  },

  scanMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.55rem',
    marginTop: '.25rem',
    color: '#9deeff',
    fontSize: '.57rem',
  },

  scanMetaSpan: {
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
    animation: 'aarush-privacy-in 240ms ease both',
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

  progressTrack: {
    height: '.45rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.09)',
  },

  progressFill: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
    transition: 'width 240ms ease',
  },

  progressMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '.35rem 0 .7rem',
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
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

  detectionList: {
    display: 'grid',
    gap: '.4rem',
  },

  detectionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  detectionIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  detectionCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  detectionCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  detectionCopySmall: {
    color: '#6f7d98',
    fontSize: '.54rem',
  },

  protectionBadge: {
    fontSize: '.55rem',
    fontWeight: 850,
  },

  tinyButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.5rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    cursor: 'pointer',
  },

  protectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
  },

  protectionButton: {
    minHeight: '3rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeProtectionButton: {
    borderColor: 'rgba(124,92,255,.4)',
    color: '#fff',
    background: 'rgba(124,92,255,.15)',
  },

  protectionPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
  },

  protectionPreviewDiv: {
    display: 'grid',
    gap: '.18rem',
  },

  protectionPreviewSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  sensitivityTabs: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.45rem',
  },

  sensitivityButton: {
    minHeight: '2.2rem',
    flexShrink: 0,
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  activeSensitivityButton: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background: 'rgba(124,92,255,.16)',
  },

  ruleList: {
    display: 'grid',
    gap: '.35rem',
  },

  ruleRow: {
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.65rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  activeRuleRow: {
    borderColor: 'rgba(130,233,193,.2)',
    color: '#dfffee',
    background: 'rgba(130,233,193,.06)',
  },

  ruleCheck: {
    width: '1.35rem',
    height: '1.35rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: '.4rem',
    color: '#82e9c1',
  },

  previewTabs: {
    display: 'flex',
    gap: '.3rem',
    marginBottom: '.6rem',
  },

  previewTab: {
    minHeight: '2.2rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activePreviewTab: {
    borderColor: 'rgba(77,215,255,.35)',
    color: '#fff',
    background: 'rgba(77,215,255,.12)',
  },

  mediaPreview: {
    position: 'relative',
    minHeight: '18rem',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    borderRadius: '.9rem',
    background:
      'linear-gradient(135deg,#24204e,#10283c)',
    transformOrigin: 'center',
    transition: 'transform 180ms ease',
  },

  mediaImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  mediaPlaceholder: {
    display: 'grid',
    placeItems: 'center',
    gap: '.4rem',
    color: '#9deeff',
    fontSize: '.62rem',
  },

  detectionBox: {
    position: 'absolute',
    display: 'grid',
    placeItems: 'center',
    border: '2px solid rgba(130,233,193,.9)',
    borderRadius: '.25rem',
    background: 'rgba(20,20,30,.68)',
    boxShadow: '0 0 18px rgba(130,233,193,.28)',
  },

  detectionBoxSpan: {
    padding: '.2rem',
    color: '#c7ffe4',
    fontSize: '.47rem',
    textAlign: 'center',
  },

  manualTools: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.6rem',
  },

  toolButton: {
    minHeight: '2.3rem',
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

  safetyHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.8rem',
    padding: '.8rem',
    border: '1px solid rgba(130,233,193,.2)',
    borderRadius: '.9rem',
    background:
      'linear-gradient(135deg,rgba(130,233,193,.1),rgba(77,215,255,.05))',
  },

  safetyRing: {
    position: 'relative',
    width: '6rem',
    height: '6rem',
    flexShrink: 0,
  },

  safetySvg: {
    width: '100%',
    height: '100%',
  },

  safetyText: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
  },

  safetyTextStrong: {
    fontSize: '1.35rem',
  },

  safetyTextSpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  safetyHeroH2: {
    margin: '.35rem 0 .2rem',
    fontSize: '.9rem',
  },

  safetyHeroP: {
    maxWidth: '35rem',
    margin: 0,
    color: '#91a0bc',
    fontSize: '.6rem',
    lineHeight: 1.45,
  },

  publishExplanation: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.06)',
    fontSize: '.59rem',
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