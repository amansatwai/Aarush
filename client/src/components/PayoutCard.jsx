import {
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  Wallet,
} from 'lucide-react';

export default function PayoutCard({
  title,
  description,
  icon: Icon = Wallet,
  status = 'Available',
  value,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: '5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.8rem',
        borderRadius: '1rem',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        color: '#f4f7ff',
        textAlign: 'left',
        cursor: 'pointer',
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
            fontSize: '0.64rem',
          }}
        >
          {description}
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginTop: '0.28rem',
            color: status === 'Available' ? '#83e9c1' : '#ffd28d',
            fontSize: '0.6rem',
            fontWeight: 800,
          }}
        >
          {status === 'Available' ? (
            <Check size={10} />
          ) : (
            <Clock3 size={10} />
          )}
          {status}
          {value ? ` · ${value}` : ''}
        </span>
      </span>

      <ChevronRight size={15} color="#7f8ca7" />
    </button>
  );
}