import { languages } from '../utils/localizationEngine';

export default function LanguageSelector({
  value = 'en',
  onChange,
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      aria-label="Select language"
      style={{
        width: '100%',
        minHeight: '2.8rem',
        padding: '0 0.7rem',
        borderRadius: '0.8rem',
        border: '1px solid rgba(255,255,255,0.1)',
        outline: 0,
        background: '#151b2b',
        color: '#edf3ff',
        fontSize: '0.76rem',
      }}
    >
      {languages.map(([code, nativeName, englishName, script, status]) => (
        <option key={code} value={code}>
          {nativeName} · {englishName} · {script} · {status}
        </option>
      ))}
    </select>
  );
}