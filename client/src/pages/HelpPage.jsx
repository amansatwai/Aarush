import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  LifeBuoy,
  Mail,
  MessageCircle,
  Paperclip,
  Send,
  ShieldCheck,
  Smartphone,
  Upload,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';

const FAQ_ITEMS = [
  [
    'How do I create an account?',
    'Open Sign Up, enter your details, and follow the verification steps. You can also continue as a guest from Login.',
  ],
  [
    'How does Guest Mode work?',
    'Guest Mode creates a local session without Supabase authentication. Guests can browse supported public content, while account-only features require sign-in.',
  ],
  [
    'How do I protect my chats?',
    'Use App Lock, Gaze Lock, chat privacy controls, notification privacy, and trusted-device settings to protect conversations.',
  ],
  [
    'What is Gaze Lock?',
    'Gaze Lock helps protect sensitive content when you look away or when someone else may be viewing your device.',
  ],
  [
    'What is One Tap Lock?',
    'One Tap Lock quickly locks Aarush so protected content requires unlocking again.',
  ],
  [
    'How do I enable App Lock?',
    'Open App Lock Settings from Controls or Security Center and choose your preferred lock method.',
  ],
  [
    'How do I recover my account?',
    'Use Forgot Password on the Login page and follow the recovery instructions sent to your registered email.',
  ],
  [
    'How do I report abuse?',
    'Use Report a Problem, select the relevant category, and include enough detail for the issue to be investigated.',
  ],
];

const LEGAL_ITEMS = [
  'Privacy Policy',
  'Terms of Service',
  'Community Guidelines',
  'Data Protection',
  'Security Practices',
];

function getDeviceInfo() {
  if (typeof navigator === 'undefined') {
    return 'Unavailable';
  }

  return (
    navigator.userAgentData?.platform ||
    navigator.platform ||
    'Unknown device'
  );
}

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [message, setMessage] = useState('');
  const [connectionStatus, setConnectionStatus] =
    useState('Checking…');
  const [lastSyncTime, setLastSyncTime] = useState(
    () => new Date().toLocaleString()
  );

  const deviceInfo = useMemo(getDeviceInfo, []);

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      try {
        const { error } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        setConnectionStatus(
          error ? 'Connection unavailable' : 'Connected'
        );
        setLastSyncTime(new Date().toLocaleString());
      } catch {
        if (mounted) {
          setConnectionStatus('Connection unavailable');
          setLastSyncTime(new Date().toLocaleString());
        }
      }
    };

    checkConnection();

    return () => {
      mounted = false;
    };
  }, []);

  const submitReport = (event) => {
    event.preventDefault();

    if (!description.trim()) {
      setMessage(
        'Please describe the problem before submitting.'
      );
      return;
    }

    const report = {
      category,
      description: description.trim(),
      attachmentName: attachment?.name || null,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      'aarush_help_report',
      JSON.stringify(report)
    );

    setDescription('');
    setAttachment(null);
    setMessage(
      'Your problem report has been saved for support review.'
    );
  };

  const supportAction = (label) => {
    setMessage(`${label} support option selected.`);
  };

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Help Center"
        showBackButton
      />

      <main style={styles.content}>
        <section style={styles.hero}>
          <span style={styles.heroIcon}>
            <LifeBuoy size={23} />
          </span>

          <div>
            <h1 style={styles.title}>Help Center</h1>
            <p style={styles.subtitle}>
              Find answers, contact support, and keep Aarush secure.
            </p>
          </div>
        </section>

        <section style={styles.card}>
          <Heading
            icon={CircleHelp}
            title="Frequently Asked Questions"
            description="Quick answers to common Aarush questions."
          />

          <div style={styles.list}>
            {FAQ_ITEMS.map(([question, answer], index) => {
              const open = openFaq === index;

              return (
                <div key={question} style={styles.faqItem}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() =>
                      setOpenFaq(open ? null : index)
                    }
                    style={styles.faqButton}
                  >
                    <span>{question}</span>
                    <ChevronDown
                      size={17}
                      style={{
                        transform: open
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                        transition: 'transform 180ms ease',
                      }}
                    />
                  </button>

                  {open ? (
                    <p style={styles.faqAnswer}>{answer}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section style={styles.card}>
          <Heading
            icon={MessageCircle}
            title="Contact Support"
            description="Choose the support channel that works best for you."
          />

          <div style={styles.list}>
            <SupportButton
              icon={MessageCircle}
              label="Live Chat"
              description="Chat with the Aarush support team."
              onClick={() => supportAction('Live Chat')}
            />

            <SupportButton
              icon={Mail}
              label="Email Support"
              description="Send a detailed support request."
              onClick={() =>
                supportAction('Email Support')
              }
            />

            <SupportButton
              icon={MessageCircle}
              label="WhatsApp Support"
              description="Open WhatsApp support options."
              onClick={() =>
                supportAction('WhatsApp Support')
              }
            />

            <SupportButton
              icon={Send}
              label="Telegram Support"
              description="Open Telegram support options."
              onClick={() =>
                supportAction('Telegram Support')
              }
            />
          </div>
        </section>

        <section style={styles.card}>
          <Heading
            icon={ShieldCheck}
            title="Report a Problem"
            description="Tell us what happened so the issue can be investigated."
          />

          <form onSubmit={submitReport} style={styles.form}>
            <label style={styles.label}>
              Category

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                style={styles.input}
              >
                <option>General</option>
                <option>Account</option>
                <option>Login or Authentication</option>
                <option>Privacy or Security</option>
                <option>Messages or Calls</option>
                <option>Upload or Media</option>
                <option>Guest Mode</option>
                <option>Report Abuse</option>
              </select>
            </label>

            <label style={styles.label}>
              Description

              <textarea
                rows={5}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the problem…"
                style={{
                  ...styles.input,
                  minHeight: '7rem',
                  resize: 'vertical',
                }}
              />
            </label>

            <label style={styles.attachment}>
              <Paperclip size={16} />
              <span>
                {attachment
                  ? attachment.name
                  : 'Attach screenshot'}
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setAttachment(event.target.files?.[0] || null)
                }
                style={styles.hiddenInput}
              />
            </label>

            <button
              type="submit"
              style={styles.primaryButton}
            >
              <Upload size={16} />
              Submit Report
            </button>

            {message ? (
              <div role="status" style={styles.message}>
                {message}
              </div>
            ) : null}
          </form>
        </section>

        <section style={styles.card}>
          <Heading
            icon={FileText}
            title="Legal"
            description="Review Aarush policies and security information."
          />

          <div style={styles.list}>
            {LEGAL_ITEMS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMessage(`${item} opened.`)}
                style={styles.legalButton}
              >
                <span>{item}</span>
                <ChevronRight size={15} color="#8290ad" />
              </button>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <Heading
            icon={Smartphone}
            title="App Information"
            description="Technical details about this Aarush session."
          />

          <InfoRow label="Aarush version" value="v1.0" />
          <InfoRow label="Build number" value="100" />
          <InfoRow
            label="Device information"
            value={deviceInfo}
          />
          <InfoRow
            label="Supabase connection"
            value={connectionStatus}
            valueColor={
              connectionStatus === 'Connected'
                ? '#82e9c1'
                : '#ffcf8a'
            }
          />
          <InfoRow
            label="Last sync time"
            value={lastSyncTime}
          />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function Heading({ icon: Icon, title, description }) {
  return (
    <div style={styles.heading}>
      <span style={styles.sectionIcon}>
        <Icon size={17} />
      </span>

      <div>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <p style={styles.sectionDescription}>
          {description}
        </p>
      </div>
    </div>
  );
}

function SupportButton({
  icon: Icon,
  label,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.supportButton}
    >
      <span style={styles.supportIcon}>
        <Icon size={17} />
      </span>

      <span style={styles.supportCopy}>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>

      <ChevronRight size={16} color="#8290ad" />
    </button>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <strong
        style={{
          ...styles.infoValue,
          color: valueColor || '#dce5f8',
        }}
      >
        {value}
      </strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '6.8rem',
    background:
      'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
    color: '#f4f7ff',
  },

  content: {
    width: '100%',
    maxWidth: '820px',
    margin: '0 auto',
    padding: '1rem 0.9rem',
    display: 'grid',
    gap: '0.9rem',
  },

  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
  },

  heroIcon: {
    width: '2.8rem',
    height: '2.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.9rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.28), rgba(77,215,255,0.14))',
    color: '#dce8ff',
  },

  title: {
    margin: 0,
    color: '#f5f8ff',
    fontSize: '1.1rem',
    fontWeight: 850,
  },

  subtitle: {
    margin: '0.28rem 0 0',
    color: '#96a3bf',
    fontSize: '0.76rem',
    lineHeight: 1.5,
  },

  card: {
    padding: '1rem',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.22)',
  },

  heading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.8rem',
  },

  sectionIcon: {
    width: '2.15rem',
    height: '2.15rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))',
    color: '#dce8ff',
  },

  sectionTitle: {
    margin: 0,
    color: '#f5f8ff',
    fontSize: '0.92rem',
    fontWeight: 850,
  },

  sectionDescription: {
    margin: '0.18rem 0 0',
    color: '#96a3bf',
    fontSize: '0.7rem',
    lineHeight: 1.4,
  },

  list: {
    display: 'grid',
    gap: '0.5rem',
  },

  faqItem: {
    overflow: 'hidden',
    borderRadius: '0.9rem',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
  },

  faqButton: {
    width: '100%',
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    padding: '0.75rem 0.8rem',
    border: 0,
    background: 'transparent',
    color: '#f4f7ff',
    textAlign: 'left',
    fontSize: '0.76rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  faqAnswer: {
    margin: 0,
    padding: '0 0.8rem 0.8rem',
    color: '#96a3bf',
    fontSize: '0.71rem',
    lineHeight: 1.5,
  },

  supportButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.7rem',
    borderRadius: '0.95rem',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.045)',
    color: '#f4f7ff',
    textAlign: 'left',
    cursor: 'pointer',
  },

  supportIcon: {
    width: '2.15rem',
    height: '2.15rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))',
    color: '#dce8ff',
  },

  supportCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.18rem',
    flex: 1,
  },

  form: {
    display: 'grid',
    gap: '0.75rem',
  },

  label: {
    display: 'grid',
    gap: '0.35rem',
    color: '#dce5f8',
    fontSize: '0.74rem',
    fontWeight: 800,
  },

  input: {
    width: '100%',
    minHeight: '2.7rem',
    boxSizing: 'border-box',
    padding: '0.7rem 0.75rem',
    borderRadius: '0.8rem',
    border: '1px solid rgba(255,255,255,0.1)',
    outline: 0,
    background: 'rgba(255,255,255,0.045)',
    color: '#f4f7ff',
    fontSize: '0.76rem',
  },

  attachment: {
    position: 'relative',
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.7rem',
    borderRadius: '0.8rem',
    border: '1px dashed rgba(124,92,255,0.42)',
    background: 'rgba(124,92,255,0.08)',
    color: '#cbd8f2',
    fontSize: '0.74rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  hiddenInput: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },

  primaryButton: {
    minHeight: '2.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    border: 0,
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  message: {
    padding: '0.7rem 0.8rem',
    borderRadius: '0.8rem',
    background: 'rgba(77,215,255,0.08)',
    border: '1px solid rgba(77,215,255,0.18)',
    color: '#9deeff',
    fontSize: '0.72rem',
    lineHeight: 1.45,
  },

  legalButton: {
    width: '100%',
    minHeight: '2.45rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    padding: '0.6rem 0.7rem',
    border: 0,
    borderRadius: '0.7rem',
    background: 'rgba(255,255,255,0.04)',
    color: '#dce5f8',
    textAlign: 'left',
    fontSize: '0.74rem',
    fontWeight: 750,
    cursor: 'pointer',
  },

  infoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    padding: '0.65rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },

  infoLabel: {
    color: '#96a3bf',
    fontSize: '0.72rem',
  },

  infoValue: {
    maxWidth: '60%',
    overflow: 'hidden',
    color: '#dce5f8',
    fontSize: '0.7rem',
    textAlign: 'right',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};