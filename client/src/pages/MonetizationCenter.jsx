import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ChevronLeft,
  CreditCard,
  DollarSign,
  Globe2,
  LineChart,
  Receipt,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Wallet,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import PayoutCard from '../components/PayoutCard';
import useMonetization from '../hooks/useMonetization';

const revenueSources = [
  ['Reel Revenue', 'Earn from eligible reel views and engagement.', VideoIcon],
  ['Post Revenue', 'Earn from eligible posts and sponsored content.', Receipt],
  ['Creator Subscriptions', 'Followers can subscribe monthly for exclusive content.', Users],
  ['Premium Content', 'Charge for exclusive posts, reels, chats, or media.', LockIcon],
  ['Marketplace Sales', 'Earn by selling products or services.', Store],
  ['Shop Revenue', 'Sell products through the Aarush shop.', Store],
  ['Brand Collaborations', 'Earn from brand partnerships and campaigns.', HandshakeIcon],
  ['Affiliate Earnings', 'Earn commission from affiliate links and promotions.', LinkIcon],
];

const paidFeatures = [
  'Advanced Privacy',
  'AI Pro Features',
  'Unlimited AI Generation',
  'Premium Analytics',
  'Advanced Security',
  'Custom Themes',
  'Premium Wallpapers',
  'Creator Insights',
  'Marketplace Tools',
  'Business Dashboard',
  'Team Collaboration',
  'Enterprise Security',
];

const analytics = [
  ['Revenue Trend', '↑ 18.4%', LineChart],
  ['Subscription Growth', '+124', Users],
  ['Marketplace Sales', '₹48,200', Store],
  ['Top Earning Content', 'Reel #18', Sparkles],
  ['Top Countries', 'India, US, UK', Globe2],
  ['Average Revenue / User', '₹284', BarChart3],
  ['Conversion Rate', '8.4%', CreditCard],
  ['Refund Rate', '1.2%', Receipt],
];

function VideoIcon(props) {
  return <Sparkles {...props} />;
}

function LockIcon(props) {
  return <ShieldCheck {...props} />;
}

function HandshakeIcon(props) {
  return <Users {...props} />;
}

function LinkIcon(props) {
  return <Globe2 {...props} />;
}

function GlassSection({ children }) {
  return (
    <section
      style={{
        marginTop: '0.9rem',
        padding: '1rem',
        borderRadius: '1.25rem',
        background: 'rgba(15,19,30,0.88)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.24)',
      }}
    >
      {children}
    </section>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.65rem',
        marginBottom: '0.8rem',
      }}
    >
      <span
        style={{
          width: '2rem',
          height: '2rem',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '0.75rem',
          background:
            'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
          color: '#dfe7ff',
        }}
      >
        <Icon size={16} />
      </span>

      <div>
        <h2
          style={{
            margin: 0,
            color: '#f4f7ff',
            fontSize: '0.98rem',
            fontWeight: 850,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: '0.25rem 0 0',
            color: '#8e9bb7',
            fontSize: '0.75rem',
            lineHeight: 1.45,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default function MonetizationCenter() {
  const navigate = useNavigate();
  const { state, formatMoney, toggleFeature } = useMonetization();
  const [message, setMessage] = useState('');

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

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
        pageTitle="Monetization Center"
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
              'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(77,215,255,0.1))',
            border: '1px solid rgba(124,92,255,0.24)',
          }}
        >
          <Wallet size={29} color="#9be8ff" />

          <h1
            style={{
              margin: '0.7rem 0 0',
              fontSize: '1.35rem',
              fontWeight: 900,
            }}
          >
            Creator Monetization &amp; Global Payments
          </h1>

          <p
            style={{
              margin: '0.4rem 0 0',
              color: '#c1cce2',
              fontSize: '0.78rem',
              lineHeight: 1.5,
            }}
          >
            Earn from reels, posts, subscriptions, marketplace sales,
            collaborations, and premium content worldwide.
          </p>
        </section>

        <GlassSection>
          <SectionHeader
            icon={DollarSign}
            title="Creator Earnings"
            description="A future-ready earnings dashboard for creator revenue and payouts."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Total Earnings', '₹184,620'],
              ['This Month', '₹28,450'],
              ['Last Month', '₹24,020'],
              ['Pending Payout', '₹12,800'],
              ['Available Balance', '₹15,650'],
              ['Next Payout', '12 Aug 2026'],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ color: '#8997b3', fontSize: '0.62rem' }}>
                  {label}
                </span>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.3rem',
                    color: '#edf2ff',
                    fontSize: '0.9rem',
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>

          <p
            style={{
              margin: '0.7rem 0 0',
              color: '#8997b3',
              fontSize: '0.67rem',
              lineHeight: 1.45,
            }}
          >
            Payout availability depends on identity verification, provider
            processing, country rules, taxes, refunds, and minimum thresholds.
          </p>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ShieldCheck}
            title="Monetization Eligibility"
            description="Track requirements before enabling creator earnings."
          />

          {[
            ['Verified account', 100],
            ['Minimum followers', 82],
            ['Minimum watch time', 74],
            ['Minimum content uploads', 90],
            ['Community guideline status', 100],
            ['Identity verification', 68],
            ['Payment account connected', 42],
          ].map(([label, progress]) => (
            <div
              key={label}
              style={{
                marginBottom: '0.65rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#cbd6ea',
                  fontSize: '0.68rem',
                }}
              >
                <span>{label}</span>
                <span>{progress}%</span>
              </div>

              <div
                style={{
                  height: '0.35rem',
                  marginTop: '0.3rem',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.08)',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    borderRadius: 'inherit',
                    background: 'linear-gradient(90deg, #7c5cff, #4dd7ff)',
                  }}
                />
              </div>
            </div>
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Revenue Sources"
            description="Ways creators can earn through Aarush."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {revenueSources.map(([title, description, Icon]) => (
              <button
                key={title}
                type="button"
                onClick={() =>
                  showMessage(`${title} is ready for revenue-provider integration.`)
                }
                style={{
                  minHeight: '5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem',
                  borderRadius: '0.95rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#edf2ff',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={17} color="#b8aaff" />

                <span>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.74rem',
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
                      lineHeight: 1.4,
                    }}
                  >
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Users}
            title="Creator Subscription Plans"
            description="Create Basic, Supporter, Premium, VIP, and Inner Circle subscription tiers."
          />

          {state.subscriptionTiers.map((tier) => (
            <div
              key={tier.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.7rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Sparkles size={15} color="#b8aaff" />

              <span style={{ minWidth: 0, flex: 1 }}>
                <strong
                  style={{
                    display: 'block',
                    color: '#eaf0ff',
                    fontSize: '0.74rem',
                  }}
                >
                  {tier.name}
                </strong>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.18rem',
                    color: '#8997b3',
                    fontSize: '0.63rem',
                  }}
                >
                  {tier.features.join(' · ')}
                </span>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.2rem',
                    color: '#83e9c1',
                    fontSize: '0.61rem',
                  }}
                >
                  {formatMoney(tier.monthly)} monthly ·{' '}
                  {formatMoney(tier.annual)} annual
                </span>
              </span>

              <button
                type="button"
                onClick={() =>
                  showMessage(`${tier.name} editor is ready for creator subscription integration.`)
                }
                style={{
                  minHeight: '2.25rem',
                  padding: '0 0.55rem',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '999px',
                  background: tier.enabled
                    ? 'rgba(82,232,170,0.1)'
                    : 'rgba(255,255,255,0.05)',
                  color: tier.enabled ? '#83e9c1' : '#dce5f8',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {tier.enabled ? 'Enabled' : 'Configure'}
              </button>
            </div>
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Globe2}
            title="Country-Based Pricing"
            description="Support local currencies, country-specific pricing, purchasing-power adjustments, taxes, and subscription localization."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.45rem',
            }}
          >
            {[
              ['India', 'INR ₹'],
              ['United States', 'USD $'],
              ['United Kingdom', 'GBP £'],
              ['European Union', 'EUR €'],
              ['Japan', 'JPY ¥'],
              ['UAE', 'AED د.إ'],
              ['Saudi Arabia', 'SAR ﷼'],
              ['Singapore', 'SGD S$'],
              ['Canada', 'CAD C$'],
              ['Australia', 'AUD A$'],
              ['Brazil', 'BRL R$'],
              ['South Africa', 'ZAR R'],
            ].map(([country, currency]) => (
              <div
                key={country}
                style={{
                  padding: '0.65rem',
                  borderRadius: '0.8rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#8997b3',
                    fontSize: '0.61rem',
                  }}
                >
                  {country}
                </span>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.25rem',
                    color: '#edf2ff',
                    fontSize: '0.7rem',
                  }}
                >
                  {currency}
                </strong>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={CreditCard}
            title="Paid Features"
            description="Individually unlock premium privacy, AI, creator, business, and security features."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.45rem',
            }}
          >
            {paidFeatures.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                style={{
                  minHeight: '2.6rem',
                  padding: '0.55rem',
                  borderRadius: '0.8rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: state.enabledPaidFeatures[feature]
                    ? 'rgba(82,232,170,0.1)'
                    : 'rgba(255,255,255,0.04)',
                  color: state.enabledPaidFeatures[feature]
                    ? '#83e9c1'
                    : '#dce5f8',
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {state.enabledPaidFeatures[feature] ? 'Enabled · ' : ''}
                {feature}
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Wallet}
            title="Payout Settings"
            description="Configure payout providers, thresholds, fees, currency, and tax status."
          />

          <PayoutCard
            title="Manage Payout Methods"
            description="Bank transfer, UPI, Stripe, Razorpay, PayPal, wallets, and international wire."
            icon={Wallet}
            status="Ready"
            onClick={() => navigate('/payout-settings')}
          />
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={BarChart3}
            title="Revenue Sharing"
            description="Transparent revenue calculations prepared for configurable platform rules."
          />

          {[
            ['Gross transaction', '100%'],
            ['Creator share', '70%'],
            ['Platform share', '20%'],
            ['Tax reserve', '5%'],
            ['Payment processing fee', '5%'],
            ['Referral commission', 'Configurable'],
            ['Collaboration split', 'Configurable'],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                color: '#cbd6ea',
                fontSize: '0.68rem',
              }}
            >
              <span>{label}</span>
              <strong style={{ color: '#edf2ff' }}>{value}</strong>
            </div>
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={BarChart3}
            title="Monetization Analytics"
            description="Track revenue, subscriptions, marketplace performance, and payout behavior."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {analytics.map(([label, value, Icon]) => (
              <div
                key={label}
                style={{
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Icon size={14} color="#aebcda" />

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.35rem',
                    color: '#8997b3',
                    fontSize: '0.61rem',
                  }}
                >
                  {label}
                </span>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.25rem',
                    color: '#edf2ff',
                    fontSize: '0.82rem',
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={RefreshCw}
            title="Background Monetization Systems"
            description="Internal systems prepared for global payments and creator economics."
          />

          {[
            'Global Pricing Engine',
            'Currency Conversion Engine',
            'Subscription Engine',
            'Creator Revenue Engine',
            'Marketplace Payment Engine',
            'Payout Engine',
            'Tax Compliance Engine',
            'Fraud Detection',
            'Payment Verification',
            'Revenue Analytics',
            'Invoice Generator',
            'Realtime Earnings Sync',
          ].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minHeight: '2.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.68rem',
              }}
            >
              <RefreshCw size={14} color="#a9b8d6" />
              <span style={{ flex: 1 }}>{item}</span>
              <span style={{ color: '#83e9c1', fontSize: '0.58rem' }}>
                Active
              </span>
            </div>
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Future Aarush Economy (Coming Soon)"
            description="Future creator-economy modules prepared for global expansion."
          />

          {[
            'Creator Investment Pool',
            'AI Revenue Optimization',
            'Cross-Country Pricing Intelligence',
            'Dynamic Regional Pricing',
            'Brand Marketplace AI',
            'Global Creator Exchange',
            'Tokenized Creator Rewards',
            'Autonomous Payout Optimization',
          ].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minHeight: '2.7rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: '#dce5f8',
                fontSize: '0.68rem',
                opacity: 0.68,
              }}
            >
              <Sparkles size={14} color="#b8aaff" />
              <span style={{ flex: 1 }}>{item}</span>
              <span style={{ color: '#9aa7c1', fontSize: '0.56rem' }}>
                Coming soon
              </span>
            </div>
          ))}
        </GlassSection>

        {message ? (
          <div
            role="status"
            style={{
              position: 'fixed',
              right: '1rem',
              bottom: '5.7rem',
              left: '1rem',
              zIndex: 1100,
              maxWidth: '520px',
              margin: '0 auto',
              padding: '0.75rem 0.9rem',
              borderRadius: '0.9rem',
              background: 'rgba(22,28,45,0.96)',
              border: '1px solid rgba(124,92,255,0.25)',
              color: '#dce6fa',
              fontSize: '0.74rem',
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}