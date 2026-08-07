import { useState } from 'react';
import {
  Image,
  Palette,
  RefreshCw,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { wallpaperStyles } from '../utils/localizationEngine';

export default function AIWallpaperPanel({
  preferences = {},
  onWallpaperChange,
  onAction,
}) {
  const [prompt, setPrompt] = useState(
    'Dark purple galaxy with mountains and rain.'
  );
  const [style, setStyle] = useState(
    preferences.wallpaper || 'Dark Aesthetic'
  );

  const updateStyle = (value) => {
    setStyle(value);
    onWallpaperChange?.(value);
  };

  return (
    <div style={{ display: 'grid', gap: '0.65rem' }}>
      <label
        style={{
          display: 'grid',
          gap: '0.35rem',
          color: '#cbd6ea',
          fontSize: '0.7rem',
          fontWeight: 750,
        }}
      >
        Wallpaper Style
        <select
          value={style}
          onChange={(event) => updateStyle(event.target.value)}
          style={{
            minHeight: '2.7rem',
            padding: '0 0.7rem',
            borderRadius: '0.8rem',
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#151b2b',
            color: '#edf3ff',
          }}
        >
          {wallpaperStyles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label
        style={{
          display: 'grid',
          gap: '0.35rem',
          color: '#cbd6ea',
          fontSize: '0.7rem',
          fontWeight: 750,
        }}
      >
        Custom Prompt Wallpaper
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          placeholder="Describe your wallpaper..."
          style={{
            padding: '0.7rem',
            resize: 'vertical',
            borderRadius: '0.8rem',
            border: '1px solid rgba(255,255,255,0.1)',
            outline: 0,
            background: '#151b2b',
            color: '#edf3ff',
            fontSize: '0.74rem',
            lineHeight: 1.45,
          }}
        />
      </label>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.4rem',
        }}
      >
        {[
          ['Generate Wallpaper', Sparkles],
          ['Preview', Image],
          ['Regenerate', RefreshCw],
        ].map(([title, Icon]) => (
          <button
            key={title}
            type="button"
            onClick={() => onAction?.(title, prompt)}
            style={{
              minHeight: '2.6rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              border: title === 'Generate Wallpaper' ? 0 : '1px solid rgba(255,255,255,0.09)',
              borderRadius: '999px',
              background:
                title === 'Generate Wallpaper'
                  ? 'linear-gradient(135deg, #7c5cff, #4dd7ff)'
                  : 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: '0.6rem',
              fontWeight: 850,
              cursor: 'pointer',
            }}
          >
            <Icon size={13} />
            {title}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
          gap: '0.45rem',
          marginTop: '0.15rem',
        }}
      >
        {[
          ['Profile Wallpaper', Palette],
          ['Chat Wallpaper', Image],
          ['Lock Screen Wallpaper', WandSparkles],
          ['Dynamic Wallpaper', RefreshCw],
          ['Live Wallpaper', Sparkles],
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
              gap: '0.3rem',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.8rem',
              background: 'rgba(255,255,255,0.04)',
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
    </div>
  );
}