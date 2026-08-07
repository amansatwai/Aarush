import { ChevronRight, Lock, Sparkles } from 'lucide-react';

export default function PrivacyInnovationCard({
  title,
  description,
  icon: Icon = Sparkles,
  status,
  risk,
  onClick,
  disabled = false,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        minHeight: '5.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.8rem',
        borderRadius: '1rem',
        border: '1px solid rgba(255,255,255,0.08)',
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

        {status ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '0.3rem',
              color:
                status === 'Protected'
                  ? '#83e9c1'
                  : status === 'Syncing'
                    ? '#8edfff'
                    : '#ffd28d',
              fontSize: '0.6rem',
              fontWeight: 800,
            }}
          >
            <span>●</span>
            {status}
          </span>
        ) : null}

        {risk ? (
          <span
            style={{
              display: 'block',
              marginTop: '0.25rem',
              color: '#9aa7c1',
              fontSize: '0.6rem',
            }}
          >
            {risk}
          </span>
        ) : null}

        {children}
      </span>

      {disabled ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            color: '#8997b3',
            fontSize: '0.56rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          <Lock size={10} />
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