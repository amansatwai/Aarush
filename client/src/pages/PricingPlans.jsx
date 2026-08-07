import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe2, ShieldCheck, Sparkles } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import PricingCard from '../components/PricingCard';
import useMonetization from '../hooks/useMonetization';
import { currencies } from '../utils/monetizationEngine';

export default function PricingPlans() {
  const navigate = useNavigate();
  const {
    state,
    updateTier,
    selectCurrency,
  } = useMonetization();

  const plans = [
    {
      id: 'plus',
      name: 'Aarush Plus',
      description: 'Premium privacy and communication features.',
      monthly: 149,
      annual: 1499,
      features: [
        'Advanced Privacy',
        'Premium Wallpapers',
        'AI communication tools',
        '5GB secure storage',
        'Enhanced security',
      ],
    },
    {
      id: 'pro',
      name: 'Aarush Pro',
      description: 'Advanced creator and analytics tools.',
      monthly: 399,
      annual: 3999,
      features: [
        'Everything in Plus',
        'Creator Insights',
        'Premium Analytics',
        'Unlimited AI generation',
        'Marketplace tools',
      ],
    },
    {
      id: 'creator',
      name: 'Aarush Creator Pro',
      description: 'Professional monetization for growing creators.',
      monthly: 999,
      annual: 9999,
      features: [
        'Everything in Pro',
        'Business Dashboard',
        'Team Collaboration',
        'Advanced Security',
        'Priority creator support',
      ],
      creator: true,
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '7rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.52), rgba(7,9,14,1) 62%)',
        color: '#f4f7ff',
      }}
    >
      <TopBar
        pageTitle="Pricing Plans"
        onChatClick={() => navigate('/chats')}
        onOneTapLock={() => navigate('/lock')}
      />

      <main
        style={{
          width: '100%',
          maxWidth: '760px',
          margin: '0 auto',
          padding: '0.9rem',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '0.8rem',
            padding: '0.35rem 0.55rem',
            border: 0,
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.05)',
            color: '#aebbd5',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={15} />
          Back
        </button>

        <section
          style={{
            padding: '1.2rem',
            borderRadius: '1.45rem',
            background:
              'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.1))',
            border: '1px solid rgba(124,92,255,0.24)',
          }}
        >
          <Sparkles size={28} color="#bdb2ff" />

          <h1
            style={{
              margin: '0.7rem 0 0',
              fontSize: '1.35rem',
              fontWeight: 900,
            }}
          >
            Aarush Premium Membership
          </h1>

          <p
            style={{
              margin: '0.4rem 0 0',
              color: '#c1cce2',
              fontSize: '0.78rem',
              lineHeight: 1.5,
            }}
          >
            Choose localized pricing for privacy, AI, creator, and business
            features.
          </p>
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <label
            style={{
              display: 'grid',
              gap: '0.35rem',
              color: '#cbd6ea',
              fontSize: '0.7rem',
              fontWeight: 750,
            }}
          >
            Country-based pricing currency
            <select
              value={state.currency}
              onChange={(event) => selectCurrency(event.target.value)}
              style={{
                minHeight: '2.7rem',
                padding: '0 0.7rem',
                borderRadius: '0.8rem',
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#151b2b',
                color: '#edf3ff',
              }}
            >
              {currencies.map(([code, country, currency, symbol]) => (
                <option key={code} value={currency}>
                  {country} · {currency} ({symbol})
                </option>
              ))}
            </select>
          </label>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '0.65rem',
            marginTop: '0.9rem',
          }}
        >
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              {...plan}
              currency={state.currency}
              selected={state.subscriptionTiers.some(
                (tier) => tier.name === plan.name && tier.enabled
              )}
              onSelect={() => {
                const tier = state.subscriptionTiers.find(
                  (item) => item.name === plan.name
                );

                if (tier) {
                  updateTier(tier.id, { enabled: true });
                }
              }}
            />
          ))}
        </section>

        <section
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Global Pricing System
          </h2>

          <p
            style={{
              margin: '0.35rem 0 0',
              color: '#8997b3',
              fontSize: '0.69rem',
              lineHeight: 1.5,
            }}
          >
            Aarush is prepared for country-specific pricing, purchasing-power
            adjustments, tax-ready pricing, subscription localization, and
            provider integrations including Stripe, Razorpay, PayPal, Apple
            Pay, Google Play Billing, UPI, local wallets, bank transfers, and
            future blockchain payments.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginTop: '0.7rem',
              color: '#83e9c1',
              fontSize: '0.65rem',
              fontWeight: 800,
            }}
          >
            <Globe2 size={13} />
            Country localization ready
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}