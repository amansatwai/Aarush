import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  ChevronLeft,
  CreditCard,
  Globe2,
  Landmark,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import PayoutCard from '../components/PayoutCard';
import useMonetization from '../hooks/useMonetization';

const payoutMethods = [
  ['Bank Transfer', 'Receive payouts directly into a bank account.', Landmark],
  ['UPI', 'Use a supported Indian UPI payout account.', Wallet],
  ['PayPal', 'Connect a supported PayPal account.', Globe2],
  ['Stripe', 'Connect Stripe for supported regions.', CreditCard],
  ['Razorpay', 'Connect Razorpay for supported regions.', Banknote],
  ['Apple Pay', 'Prepare supported wallet payouts.', Wallet],
  ['Google Pay', 'Prepare supported wallet payouts.', Wallet],
  ['Debit Card', 'Use a supported debit card.', CreditCard],
  ['Credit Card', 'Use a supported credit card.', CreditCard],
  ['Local Wallets', 'Use supported regional wallets.', Wallet],
  ['International Wire', 'Receive international bank transfers.', Landmark],
];

export default function PayoutSettings() {
  const navigate = useNavigate();
  const { state, update } = useMonetization();
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
        pageTitle="Payout Settings"
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
          <ShieldCheck size={28} color="#9be8ff" />

          <h1
            style={{
              margin: '0.7rem 0 0',
              fontSize: '1.35rem',
              fontWeight: 900,
            }}
          >
            Payout Settings
          </h1>

          <p
            style={{
              margin: '0.4rem 0 0',
              color: '#c1cce2',
              fontSize: '0.78rem',
              lineHeight: 1.5,
            }}
          >
            Configure payout methods, thresholds, currency, tax status, and
            future payment-provider connections.
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
          <h2 style={{ margin: 0, fontSize: '0.98rem' }}>
            Payout Preferences
          </h2>

          {[
            ['Minimum payout amount', '₹1,000'],
            ['Processing time', '2–7 business days'],
            ['Estimated fees', 'Provider and region dependent'],
            ['Currency', state.currency],
            ['Tax status', 'Verification required'],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.7rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                fontSize: '0.7rem',
              }}
            >
              <span style={{ color: '#8997b3' }}>{label}</span>
              <strong style={{ color: '#eaf0ff' }}>{value}</strong>
            </div>
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
            Payout Methods
          </h2>

          <div
            style={{
              display: 'grid',
              gap: '0.5rem',
              marginTop: '0.75rem',
            }}
          >
            {payoutMethods.map(([title, description, Icon]) => (
              <PayoutCard
                key={title}
                title={title}
                description={description}
                icon={Icon}
                status={
                  state.connectedPaymentMethod === title
                    ? 'Available'
                    : 'Not connected'
                }
                onClick={() => {
                  update({ connectedPaymentMethod: title });
                  showMessage(
                    `${title} is prepared for secure provider integration.`
                  );
                }}
              />
            ))}
          </div>
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
            Taxes &amp; Compliance
          </h2>

          <p
            style={{
              margin: '0.35rem 0 0.8rem',
              color: '#8997b3',
              fontSize: '0.7rem',
              lineHeight: 1.45,
            }}
          >
            Country-based tax rules, GST, VAT, sales tax, creator forms,
            identity verification, business verification, invoices, payment
            history, and tax reports are prepared for backend integration.
          </p>

          <button
            type="button"
            onClick={() =>
              showMessage('Identity and business verification are ready for provider integration.')
            }
            style={{
              width: '100%',
              minHeight: '2.7rem',
              border: 0,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 850,
              cursor: 'pointer',
            }}
          >
            Begin Verification
          </button>
        </section>

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