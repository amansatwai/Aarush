import { useState } from 'react';
import {
  Check,
  EyeOff,
  FolderLock,
  Lock,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export default function StealthChatPanel({
  settings,
  onToggle,
  onOpenVault,
}) {
  const [duration, setDuration] = useState('1 hour');

  const options = [
    [
      'hiddenChats',
      'Hidden Chats',
      'Chats visible only after authentication.',
      Lock,
    ],
    [
      'invisibleChats',
      'Invisible Chats',
      'Chats that disappear from the main conversation list.',
      EyeOff,
    ],
    [
      'autoHideSensitiveChats',
      'Auto Hide Sensitive Chats',
      'AI automatically hides selected conversations.',
      ShieldCheck,
    ],
    [
      'temporaryHiddenChat',
      'Temporary Hidden Chat',
      'Hide a conversation for a chosen duration.',
      MessageSquare,
    ],
    [
      'secretChatFolder',
      'Secret Chat Folder',
      'Encrypted hidden conversation storage.',
      FolderLock,
    ],
    [
      'hiddenChatNotifications',
      'Hidden Chat Notifications',
      'Receive generic notifications without revealing chat identity.',
      EyeOff,
    ],
  ];

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      {options.map(([id, title, description, Icon]) => (
        <div
          key={id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.7rem 0',
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
              {title}
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
              {description}
            </span>

            {id === 'temporaryHiddenChat' && settings[id] ? (
              <select
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                style={{
                  minHeight: '2rem',
                  marginTop: '0.4rem',
                  padding: '0 0.45rem',
                  borderRadius: '0.55rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#151b2b',
                  color: '#dce5f8',
                  fontSize: '0.64rem',
                }}
              >
                <option>15 minutes</option>
                <option>1 hour</option>
                <option>6 hours</option>
                <option>24 hours</option>
                <option>Until manually restored</option>
              </select>
            ) : null}
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={Boolean(settings[id])}
            aria-label={`Toggle ${title}`}
            onClick={() => onToggle(id)}
            style={{
              width: '2.5rem',
              height: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: settings[id] ? 'flex-end' : 'flex-start',
              padding: '0.15rem',
              border: 0,
              borderRadius: '999px',
              background: settings[id]
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
        onClick={onOpenVault}
        style={{
          minHeight: '2.8rem',
          marginTop: '0.65rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          border: 0,
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
          color: '#fff',
          fontSize: '0.74rem',
          fontWeight: 850,
          cursor: 'pointer',
        }}
      >
        <FolderLock size={15} />
        Open Hidden Vault
      </button>

      <p
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          margin: '0.25rem 0 0',
          color: '#74819c',
          fontSize: '0.63rem',
          lineHeight: 1.45,
        }}
      >
        <Check size={12} color="#83e9c1" />
        Hidden chat settings are prepared for encrypted Supabase storage.
      </p>
    </div>
  );
}