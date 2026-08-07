import {
  AlertTriangle,
  Check,
  ChevronRight,
  Loader,
  ShieldCheck,
} from 'lucide-react';

export default function AarushAIStatusCard({
  title,
  description,
  status = 'Protected',
  risk = 'Low',
  lastAnalysis,
  recommendedAction,
  icon: Icon = ShieldCheck,
  onClick,
  disabled = false,
}) {
  const riskColor =
    risk === 'Low'
      ? '#83e9c1'
      : risk === 'Moderate'
        ? '#ffd28d'
        : risk === 'High'
          ? '#ff9eb8'
          : '#8edfff';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        minHeight: '5.3rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.8rem',
        borderRadius: '1rem',
        border: disabled
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid rgba(255,255,255,0.08)',
        background: disabled
          ? 'rgba(255,255,255,0.025)'
          : 'rgba(255,255,255,0.045)',
        color: '#f4f7ff',
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.62 : 1,
      }}
    >
      <span
        style={{
          width: '2.35rem',
          height: '2.35rem',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '0.8rem',
          background:
            'linear-gradient(135deg, rgba(124,92,255,0.2), rgba(77,215,255,0.12))',
          color: '#dce6ff',
          flexShrink: 0,
        }}
      >
        <Icon size={17} />
      </span>

      <span style={{ minWidth: 0, flex: 1 }}>
        <strong
          style={{
            display: 'block',
            color: '#edf2ff',
            fontSize: '0.75rem',
            fontWeight: 850,
          }}
        >
          {title}
        </strong>

        <span
          style={{
            display: 'block',
            marginTop: '0.2rem',
            color: '#8997b3',
            fontSize: '0.65rem',
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>

        <span
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.45rem',
            marginTop: '0.3rem',
            fontSize: '0.6rem',
          }}
        >
          <span style={{ color: riskColor, fontWeight: 800 }}>
            {risk === 'Low' ? <Check size={10} /> : <AlertTriangle size={10} />}
            {risk} risk
          </span>

          {lastAnalysis ? (
            <span style={{ color: '#74819c' }}>
              Last analysis: {lastAnalysis}
            </span>
          ) : null}
        </span>

        {recommendedAction ? (
          <span
            style={{
              display: 'block',
              marginTop: '0.25rem',
              color: '#aebbd5',
              fontSize: '0.61rem',
            }}
          >
            Recommended: {recommendedAction}
          </span>
        ) : null}
      </span>

      {disabled ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            color: '#8997b3',
            fontSize: '0.58rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          <Loader size={10} />
          Coming soon
        </span>
      ) : (
        <ChevronRight
          size={15}
          color="#7f8ca7"
          style={{ flexShrink: 0 }}
        />
      )}
    </button>
  );
}