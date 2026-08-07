import { useState } from 'react';
import {
  Check,
  ChevronRight,
  Eye,
  Lock,
  Mic,
  ShieldCheck,
  Video,
} from 'lucide-react';

export default function PrivacyCallPanel({
  title,
  description,
  section,
  options,
  state,
  onToggle,
  onAction,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ display: 'grid', gap: '0.45rem' }}>
      {options.map(([id, label, meaning, Icon = ShieldCheck]) => (
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
          <Icon size={15} color="#aebcda" />

          <span style={{ minWidth: 0, flex: 1 }}>
            <strong
              style={{
                display: 'block',
                color: '#e9efff',
                fontSize: '0.74rem',
              }}
            >
              {label}
            </strong>

            <span
              style={{
                display: 'block',
                marginTop: '0.18rem',
                color: '#8997b3',
                fontSize: '0.64rem',
                lineHeight: 1.4,
              }}
            >
              {meaning}
            </span>
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={Boolean(state[section]?.[id])}
            aria-label={`Toggle ${label}`}
            onClick={() => onToggle(section, id)}
            style={{
              width: '2.5rem',
              height: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: state[section]?.[id]
                ? 'flex-end'
                : 'flex-start',
              padding: '0.15rem',
              border: 0,
              borderRadius: '999px',
              background: state[section]?.[id]
                ? 'linear-gradient(135deg, #7c5cff, #4dd7ff)'
                : 'rgba(255,255,255,0.12)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: '1.1rem',
                height: '1.1rem',
                borderRadius: '999px',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          setExpanded((current) => !current);
          onAction?.(title);
        }}
        style={{
          minHeight: '2.6rem',
          marginTop: '0.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.05)',
          color: '#dce5f8',
          fontSize: '0.68rem',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        {expanded ? <Check size={14} /> : <ChevronRight size={14} />}
        {expanded ? 'Enabled' : 'Configure'} {title}
      </button>
    </div>
  );
}

export function voicePrivacyOptions() {
  return [
    ['voiceMask', 'Voice Mask', 'AI can subtly modify your voice while keeping it natural.', Mic],
    ['noiseIsolation', 'Noise Isolation', 'Reduce background noise during calls.', ShieldCheck],
    ['privateVoiceMode', 'Private Voice Mode', 'Limit voice leakage to nearby people.', Lock],
    ['voiceEncryption', 'Voice Encryption', 'Protect call audio using an end-to-end encryption architecture.', ShieldCheck],
    ['aiVoiceProtection', 'AI Voice Protection', 'Detect suspicious voice recording attempts.', Mic],
  ];
}

export function videoPrivacyOptions() {
  return [
    ['facePresence', 'Face Presence Verification', 'Verify that a real person is present during a call.', Eye],
    ['cameraShield', 'Camera Privacy Shield', 'Protect against unauthorized camera access.', Video],
    ['backgroundPrivacy', 'Background Privacy', 'Automatically blur or replace the background.', Eye],
    ['lowVisibility', 'Low Visibility Mode', 'Reduce screen brightness and visibility during sensitive calls.', Eye],
    ['aiVideoProtection', 'AI Video Protection', 'Detect suspicious screen capture or recording behavior.', Video],
  ];
}