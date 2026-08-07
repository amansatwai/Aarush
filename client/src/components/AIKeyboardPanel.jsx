import { useState } from 'react';
import {
  Check,
  Languages,
  MessageCircle,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { writingStyles } from '../utils/localizationEngine';

const keyboardFeatures = [
  ['smartReplies', 'Smart Replies', 'Suggest context-aware replies.'],
  ['translation', 'AI Translation', 'Translate text before sending.'],
  ['grammar', 'AI Grammar Correction', 'Improve spelling and grammar.'],
  ['tone', 'AI Tone Adjustment', 'Adjust the emotional tone of writing.'],
  ['emoji', 'AI Emoji Suggestions', 'Suggest relevant emojis.'],
  ['multilingual', 'AI Multilingual Typing', 'Mix supported languages while typing.'],
  ['context', 'AI Context Suggestions', 'Suggest words based on conversation context.'],
  ['completion', 'AI Auto Completion', 'Complete phrases while composing.'],
  ['captions', 'AI Caption Assistance', 'Help write captions for posts and stories.'],
  ['hashtags', 'AI Hashtag Suggestions', 'Suggest relevant hashtags.'],
  ['rewrite', 'AI Message Rewrite', 'Rewrite text in the selected style.'],
];

export default function AIKeyboardPanel({
  preferences = {},
  onToggle,
  onStyleChange,
  onAction,
}) {
  const [style, setStyle] = useState(preferences.style || 'Friendly');

  const changeStyle = (value) => {
    setStyle(value);
    onStyleChange?.(value);
  };

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      {keyboardFeatures.map(([id, title, description]) => (
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
          <Sparkles size={15} color="#aebcda" />

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
            aria-checked={Boolean(preferences[id])}
            aria-label={`Toggle ${title}`}
            onClick={() => onToggle?.(id)}
            style={{
              width: '2.5rem',
              height: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: preferences[id] ? 'flex-end' : 'flex-start',
              padding: '0.15rem',
              border: 0,
              borderRadius: '999px',
              background: preferences[id]
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
              }}
            />
          </button>
        </div>
      ))}

      <label
        style={{
          display: 'grid',
          gap: '0.35rem',
          marginTop: '0.6rem',
          color: '#cbd6ea',
          fontSize: '0.7rem',
          fontWeight: 750,
        }}
      >
        Writing Style
        <select
          value={style}
          onChange={(event) => changeStyle(event.target.value)}
          style={{
            minHeight: '2.7rem',
            padding: '0 0.7rem',
            borderRadius: '0.8rem',
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#151b2b',
            color: '#edf3ff',
          }}
        >
          {writingStyles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.4rem',
          marginTop: '0.35rem',
        }}
      >
        {[
          ['Smart Reply', MessageCircle],
          ['Translate', Languages],
          ['Rewrite', WandSparkles],
        ].map(([title, Icon]) => (
          <button
            key={title}
            type="button"
            onClick={() => onAction?.(title)}
            style={{
              minHeight: '2.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              color: '#dce5f8',
              fontSize: '0.62rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <Icon size={13} />
            {title}
          </button>
        ))}
      </div>

      <p
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          margin: '0.25rem 0 0',
          color: '#74819c',
          fontSize: '0.63rem',
        }}
      >
        <Check size={12} color="#83e9c1" />
        AI processing can later use cloud or on-device language models.
      </p>
    </div>
  );
}