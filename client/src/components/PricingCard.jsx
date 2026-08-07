import { Check, Crown, Sparkles } from 'lucide-react';

export default function PricingCard({
  name,
  monthly,
  annual,
  currency,
  features = [],
  description,
  selected = false,
  onSelect,
  creator = false,
}) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  });

  return (
    <article
      style={{
        position: 'relative',
        padding: '1rem',
        borderRadius: '1.2rem',
        background: selected
          ? 'linear-gradient(135deg, rgba(124,92,255,0.2), rgba(77,215,255,0.08))'
          : 'rgba(255,255,255,0.04)',
        border: selected
          ? '1px solid rgba(124,92,255,0.34)'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: selected
          ? '0 0 26px rgba(124,92,255,0.14)'
          : 'none',
      }}
    >
      {creator ? (
        <span
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.28rem 0.45rem',
            borderRadius: '999px',
            background: 'rgba(255,215,100,0.12)',
            color: '#ffe099',
            fontSize: '0.58rem',
            fontWeight: 850,
          }}
        >
          <Crown size={10} />
          Creator
        </span>
      ) : null}

      <Sparkles size={20} color="#b8aaff" />

      <h3
        style={{
          margin: '0.65rem 0 0',
          color: '#f4f7ff',
          fontSize: '1rem',
          fontWeight: 900,
        }}
      >
        {name}
      </h3>

      <p
        style={{
          margin: '0.3rem 0 0',
          color: '#8997b3',
          fontSize: '0.68rem',
          lineHeight: 1.4,
        }}
      >
        {description}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.25rem',
          marginTop: '0.85rem',
        }}
      >
        <strong
          style={{
            color: '#f7fbff',
            fontSize: '1.3rem',
            fontWeight: 900,
          }}
        >
          {formatter.format(monthly)}
        </strong>

        <span style={{ color: '#8997b3', fontSize: '0.65rem' }}>
          / month
        </span>
      </div>

      <span
        style={{
          display: 'block',
          marginTop: '0.2rem',
          color: '#83e9c1',
          fontSize: '0.65rem',
        }}
      >
        {formatter.format(annual)} / year
      </span>

      <div
        style={{
          display: 'grid',
          gap: '0.35rem',
          marginTop: '0.85rem',
        }}
      >
        {features.map((feature) => (
          <span
            key={feature}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: '#cbd6ea',
              fontSize: '0.66rem',
            }}
          >
            <Check size={12} color="#83e9c1" />
            {feature}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onSelect}
        style={{
          width: '100%',
          minHeight: '2.6rem',
          marginTop: '1rem',
          border: 0,
          borderRadius: '999px',
          background: selected
            ? 'linear-gradient(135deg, #7c5cff, #4dd7ff)'
            : 'rgba(255,255,255,0.07)',
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: 850,
          cursor: 'pointer',
        }}
      >
        {selected ? 'Selected' : 'Choose Plan'}
      </button>
    </article>
  );
}