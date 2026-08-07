import {
  Check,
  Clock3,
  Laptop,
  Smartphone,
} from 'lucide-react';

export default function MemoryTimelineCard({ item }) {
  const isMobile = item.device?.toLowerCase().includes('mobile');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.55rem',
        padding: '0.7rem',
        borderRadius: '0.9rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span
        style={{
          width: '2.1rem',
          height: '2.1rem',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '0.75rem',
          background: 'rgba(124,92,255,0.12)',
          color: '#c7bdff',
          flexShrink: 0,
        }}
      >
        <Clock3 size={15} />
      </span>

      <span style={{ minWidth: 0, flex: 1 }}>
        <strong
          style={{
            display: 'block',
            color: '#eaf0ff',
            fontSize: '0.73rem',
          }}
        >
          {item.event}
        </strong>

        <span
          style={{
            display: 'block',
            marginTop: '0.2rem',
            color: '#8997b3',
            fontSize: '0.63rem',
          }}
        >
          {item.date} · {item.time}
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            marginTop: '0.25rem',
            color: '#7f8ca7',
            fontSize: '0.6rem',
          }}
        >
          {isMobile ? <Smartphone size={10} /> : <Laptop size={10} />}
          {item.device}
        </span>
      </span>

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.2rem',
          color: item.status === 'Protected' ? '#83e9c1' : '#ffd28d',
          fontSize: '0.59rem',
          fontWeight: 800,
        }}
      >
        <Check size={10} />
        {item.status}
      </span>
    </div>
  );
}