import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Fingerprint,
  Globe2,
  Link as LinkIcon,
  Lock,
  MapPin,
  MonitorSmartphone,
  RefreshCw,
  ScanFace,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Video,
  Wifi,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import AarushAIStatusCard from '../components/AarushAIStatusCard';
import useAarushAI from '../hooks/useAarushAI';

const behaviorFeatures = [
  ['Typing Pattern', 'Typing rhythm can support future behavior-based authentication.'],
  ['Touch Pattern', 'Touch interaction patterns can help identify trusted use.'],
  ['Device Movement Pattern', 'Device movement may provide additional context signals.'],
  ['Unlock Behavior', 'Unlock timing and method changes can improve risk analysis.'],
  ['Usage Pattern', 'Usage patterns can identify unusual account access.'],
  ['Location Pattern', 'Location consistency can support session risk decisions.'],
  ['Time-of-Day Pattern', 'Time-based behavior can identify anomalous activity.'],
];

const automaticFeatures = [
  ['autoLockHighRiskSessions', 'Auto Lock High-Risk Sessions', 'Lock sessions when AI detects elevated risk.', Lock],
  ['autoBlurSensitiveChats', 'Auto Blur Sensitive Chats', 'Blur sensitive conversations in risky contexts.', Eye],
  ['autoHideNotifications', 'Auto Hide Notifications', 'Hide notification details when risk increases.', Bell],
  ['autoRevokeSuspiciousDevices', 'Auto Revoke Suspicious Devices', 'Prepare to revoke devices with strong risk signals.', MonitorSmartphone],
  ['autoEnableEmergencyPrivacy', 'Auto Enable Emergency Privacy', 'Prepare emergency protection when a severe threat is detected.', ShieldAlert],
  ['autoScanNewFollowers', 'Auto Scan New Followers', 'Analyze new followers for suspicious patterns.', Users],
  ['autoScanLinks', 'Auto Scan Links', 'Analyze links for phishing and fraud signals.', LinkIcon],
  ['autoScanMedia', 'Auto Scan Media', 'Analyze media for manipulation and synthetic content.', Video],
];

const backgroundSystems = [
  ['AI Security Engine', 'Active', ShieldCheck],
  ['Device Analysis Engine', 'Active', MonitorSmartphone],
  ['Conversation Scanner', 'Active', Search],
  ['Fake Account Detector', 'Active', UserRound],
  ['Deepfake Detection Engine', 'Learning', ScanFace],
  ['Privacy Advisor Engine', 'Active', Sparkles],
  ['Risk Prediction Engine', 'Active', BarChart3],
  ['Behavioral Analysis Engine', 'Future', Fingerprint],
  ['Notification Analysis Engine', 'Active', Bell],
  ['Media Security Engine', 'Learning', Video],
  ['Threat Intelligence Engine', 'Syncing', ShieldAlert],
  ['Realtime AI Sync', 'Syncing', Wifi],
];

const futureEvolution = [
  ['AI Security Coach', 'Explain security decisions in simple language.', Sparkles],
  ['Autonomous Privacy Guardian', 'Continuously adapt privacy controls to context.', Shield],
  ['Predictive Threat Prevention', 'Prevent likely attacks before they occur.', ShieldAlert],
  ['AI Device Trust', 'Continuously assess device trust.', MonitorSmartphone],
  ['AI Relationship Privacy', 'Adapt privacy based on social relationships.', Users],
  ['AI Family Safety', 'Support future family privacy controls.', UserRound],
  ['AI Enterprise Security', 'Provide advanced organization security.', Globe2],
  ['AI Personal Identity Shield', 'Protect identity signals across Aarush.', Fingerprint],
];

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
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
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
          flexShrink: 0,
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

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      style={{
        width: '2.5rem',
        height: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        padding: '0.15rem',
        border: 0,
        borderRadius: '999px',
        background: checked
          ? 'linear-gradient(135deg, #7c5cff, #4dd7ff)'
          : 'rgba(255,255,255,0.12)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: '1.1rem',
          height: '1.1rem',
          borderRadius: '999px',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

function SystemStatus({ status }) {
  const color =
    status === 'Active'
      ? '#83e9c1'
      : status === 'Syncing'
        ? '#8edfff'
        : status === 'Learning'
          ? '#c8b8ff'
          : '#ffd28d';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        color,
        fontSize: '0.6rem',
        fontWeight: 800,
      }}
    >
      {status === 'Syncing' || status === 'Learning' ? (
        <RefreshCw size={10} />
      ) : (
        <span>●</span>
      )}
      {status}
    </span>
  );
}

export default function AarushAISecurity() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const {
    state,
    score,
    level,
    busy,
    lastResult,
    scanAccount,
    scanDevices,
    scanConversations,
    toggleAutomaticProtection,
    threatModules,
    fakeAccountSignals,
    scamSignals,
    mediaSignals,
    recommendations,
    timeline,
  } = useAarushAI();

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  };

  const runAction = (title, action) => {
    const result = action?.();

    if (result?.summary) {
      showMessage(result.summary);
    } else {
      showMessage(`${title} is ready for its AI service integration.`);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '7rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.52) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <TopBar
        pageTitle="Aarush AI Guardian"
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
            fontSize: '0.72rem',
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={15} />
          Back
        </button>

        <section
          style={{
            padding: '1.25rem',
            borderRadius: '1.5rem',
            background:
              'linear-gradient(135deg, rgba(124,92,255,0.25), rgba(77,215,255,0.1), rgba(255,79,216,0.08))',
            border: '1px solid rgba(124,92,255,0.25)',
            boxShadow:
              '0 24px 70px rgba(0,0,0,0.32), 0 0 32px rgba(124,92,255,0.12)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.8rem',
            }}
          >
            <div
              style={{
                width: '3.6rem',
                height: '3.6rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '1.15rem',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
                boxShadow: '0 0 30px rgba(77,215,255,0.25)',
                flexShrink: 0,
              }}
            >
              <Sparkles size={29} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  color: '#f8faff',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                }}
              >
                Aarush AI Security &amp; Privacy Guardian
              </h1>

              <p
                style={{
                  margin: '0.45rem 0 0',
                  color: '#c1cce2',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                }}
              >
                AI-powered protection for your account, chats, devices, and
                personal privacy.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1.2rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: '6.4rem',
                height: '6.4rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '999px',
                background: `conic-gradient(#61e8b4 ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '5.25rem',
                  height: '5.25rem',
                  display: 'grid',
                  placeItems: 'center',
                  alignContent: 'center',
                  borderRadius: '999px',
                  background: '#111827',
                  textAlign: 'center',
                }}
              >
                <strong
                  style={{
                    color: '#f7fbff',
                    fontSize: '1.15rem',
                    lineHeight: 1,
                  }}
                >
                  {score}
                </strong>

                <span
                  style={{
                    marginTop: '0.22rem',
                    color: '#91a0bd',
                    fontSize: '0.6rem',
                  }}
                >
                  / 100
                </span>
              </div>
            </div>

            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: '#83edc1',
                  fontSize: '0.8rem',
                  fontWeight: 850,
                }}
              >
                <ShieldCheck size={14} />
                {level}
              </span>

              <p
                style={{
                  margin: '0.38rem 0 0',
                  color: '#aab7d0',
                  fontSize: '0.72rem',
                  lineHeight: 1.5,
                }}
              >
                {state.lastScanAt
                  ? 'The latest account scan found no critical threats.'
                  : 'Run an account scan to establish a current AI protection baseline.'}
              </p>
            </div>
          </div>
        </section>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="AI Quick Actions"
            description="Run focused security and privacy analysis."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {[
              ['Scan My Account', 'Run an AI security scan of the account.', Sparkles, () => scanAccount()],
              ['Analyze Devices', 'Check active devices for suspicious activity.', MonitorSmartphone, () => scanDevices()],
              ['Review Privacy Settings', 'Suggest stronger privacy protection.', Shield, () => showMessage('Privacy recommendations are ready.')],
              ['Detect Fake Accounts', 'Identify suspicious followers and accounts.', UserRound, () => showMessage('Fake-account analysis is ready.')],
              ['Scan Conversations', 'Analyze messages for scams and fraud.', Search, () => scanConversations()],
              ['Open Security Center', 'Jump directly to Security Center.', ShieldCheck, () => navigate('/security-center')],
            ].map(([title, description, Icon, onClick]) => (
              <button
                key={title}
                type="button"
                onClick={() => runAction(title, onClick)}
                disabled={busy}
                style={{
                  minHeight: '5.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#edf2ff',
                  textAlign: 'left',
                  cursor: busy ? 'wait' : 'pointer',
                  opacity: busy ? 0.65 : 1,
                }}
              >
                <Icon size={18} color="#bdb2ff" />

                <span>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 850,
                    }}
                  >
                    {title}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.22rem',
                      color: '#8997b3',
                      fontSize: '0.65rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {lastResult?.summary ? (
            <p
              role="status"
              style={{
                margin: '0.75rem 0 0',
                color: '#83e9c1',
                fontSize: '0.68rem',
              }}
            >
              {lastResult.summary}
            </p>
          ) : null}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ShieldAlert}
            title="AI Threat Detection"
            description="Intelligent modules continuously review account and session risk."
          />

          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {threatModules.map((module) => (
              <AarushAIStatusCard
                key={module.id}
                title={module.title}
                description={`Status: ${module.status}`}
                status={module.status}
                risk={module.risk}
                lastAnalysis={module.lastAnalysis}
                recommendedAction={module.action}
                icon={ShieldAlert}
                onClick={() => showMessage(module.action)}
              />
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={UserRound}
            title="Fake Account Detection"
            description="AI analyzes authenticity, follower patterns, bot signals, spam, and impersonation."
          />

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            {fakeAccountSignals.map(([title, status, risk]) => (
              <AarushAIStatusCard
                key={title}
                title={title}
                description={status}
                risk={risk}
                icon={UserRound}
                onClick={() => showMessage(`${title} review is ready.`)}
              />
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.4rem',
              marginTop: '0.7rem',
            }}
          >
            {['View Suspicious Accounts', 'Block', 'Report', 'Ignore'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => showMessage(`${label} action is ready for AI moderation integration.`)}
                style={{
                  minHeight: '2.4rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dce5f8',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={AlertTriangle}
            title="Scam Conversation Detection"
            description="Analyze conversations for fraud, phishing, impersonation, and payment risks."
          />

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            {scamSignals.map(([title, status, risk]) => (
              <AarushAIStatusCard
                key={title}
                title={title}
                description={status}
                risk={risk}
                icon={AlertTriangle}
                onClick={() => showMessage(`${title} analysis is ready.`)}
              />
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.4rem',
              marginTop: '0.7rem',
            }}
          >
            {['Mark Safe', 'Block Sender', 'Report Scam', 'Learn Why'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => showMessage(`${label} action is ready for conversation safety integration.`)}
                style={{
                  minHeight: '2.4rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dce5f8',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Video}
            title="Deepfake & Media Protection"
            description="Analyze media for manipulation, synthetic identity, and deceptive edits."
          />

          <div style={{ display: 'grid', gap: '0.45rem' }}>
            {mediaSignals.map(([title, status, risk]) => (
              <AarushAIStatusCard
                key={title}
                title={title}
                description={status}
                risk={risk}
                icon={Video}
                onClick={() => showMessage(`${title} media analysis is ready.`)}
              />
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.4rem',
              marginTop: '0.7rem',
            }}
          >
            {['Verify Media', 'Mark Suspicious', 'Report'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => showMessage(`${label} action is ready for media security integration.`)}
                style={{
                  minHeight: '2.4rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dce5f8',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Shield}
            title="Aarush AI Privacy Advisor"
            description="Recommendations explain why a setting matters and how it improves security."
          />

          <div style={{ display: 'grid', gap: '0.55rem' }}>
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                style={{
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <strong
                  style={{
                    display: 'block',
                    color: '#edf2ff',
                    fontSize: '0.75rem',
                  }}
                >
                  {recommendation.title}
                </strong>

                <p
                  style={{
                    margin: '0.25rem 0',
                    color: '#8997b3',
                    fontSize: '0.65rem',
                    lineHeight: 1.4,
                  }}
                >
                  {recommendation.why}
                  <br />
                  Benefit: {recommendation.benefit}
                </p>

                <button
                  type="button"
                  onClick={() => showMessage(`${recommendation.title} is ready for one-tap application.`)}
                  style={{
                    minHeight: '2.2rem',
                    padding: '0 0.7rem',
                    border: 0,
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                    color: '#fff',
                    fontSize: '0.62rem',
                    fontWeight: 850,
                    cursor: 'pointer',
                  }}
                >
                  Apply Recommendation
                </button>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Fingerprint}
            title="Behavioral Authentication"
            description="Future behavior-based authentication signals are prepared for on-device AI."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {behaviorFeatures.map(([title, description]) => (
              <div
                key={title}
                style={{
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  opacity: 0.68,
                }}
              >
                <Fingerprint size={15} color="#b8aaff" />

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.4rem',
                    color: '#e1e8f9',
                    fontSize: '0.68rem',
                  }}
                >
                  {title}
                </strong>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.25rem',
                    color: '#8794b0',
                    fontSize: '0.61rem',
                    lineHeight: 1.4,
                  }}
                >
                  {description}
                </span>

                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.35rem',
                    color: '#c8b8ff',
                    fontSize: '0.56rem',
                    fontWeight: 800,
                  }}
                >
                  Coming soon
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={BarChart3}
            title="AI Risk Prediction"
            description="Current and predicted risk signals are summarized for review."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Current Risk', 'Low', 'Current activity is within the expected pattern.'],
              ['Predicted Risk', 'Low', 'No significant increase is predicted.'],
              ['High-Risk Devices', '1 review', 'An unknown iPhone session needs review.'],
              ['High-Risk Locations', 'None', 'No unusual location pattern detected.'],
              ['High-Risk Conversations', 'None', 'No high-confidence scam pattern detected.'],
              ['High-Risk Accounts', '1 review', 'One impersonation signal needs review.'],
            ].map(([title, value, explanation]) => (
              <div
                key={title}
                style={{
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
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
                  {title}
                </span>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.3rem',
                    color: '#edf2ff',
                    fontSize: '0.86rem',
                  }}
                >
                  {value}
                </strong>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.25rem',
                    color: '#8794b0',
                    fontSize: '0.6rem',
                    lineHeight: 1.4,
                  }}
                >
                  {explanation}
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ShieldCheck}
            title="Automatic Protection"
            description="AI-controlled protections can respond to elevated risk signals."
          />

          {automaticFeatures.map(([id, title, description, Icon]) => (
            <div
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.68rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Icon size={15} color="#aebcda" />

              <span style={{ minWidth: 0, flex: 1 }}>
                <strong
                  style={{
                    display: 'block',
                    color: '#e9efff',
                    fontSize: '0.74rem',
                  }}
                >
                  {title}
                </strong>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.18rem',
                    color: '#8997b3',
                    fontSize: '0.64rem',
                  }}
                >
                  {description}
                </span>
              </span>

              <Toggle
                checked={state.automaticProtection[id]}
                onChange={() => toggleAutomaticProtection(id)}
                label={`Toggle ${title}`}
              />
            </div>
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ActivityIcon}
            title="AI Security Timeline"
            description="Important AI-generated security and privacy events."
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {timeline.map(([title, time, severity, confidence]) => (
              <div
                key={title}
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
                    width: '0.55rem',
                    height: '0.55rem',
                    marginTop: '0.3rem',
                    borderRadius: '999px',
                    background:
                      severity === 'Low'
                        ? '#72e9b8'
                        : severity === 'Moderate'
                          ? '#ffd07d'
                          : '#c8b8ff',
                    boxShadow:
                      severity === 'Low'
                        ? '0 0 9px #72e9b8'
                        : severity === 'Moderate'
                          ? '0 0 9px #ffd07d'
                          : '0 0 9px #c8b8ff',
                  }}
                />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#eaf0ff',
                      fontSize: '0.74rem',
                    }}
                  >
                    {title}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.2rem',
                      color: '#8b99b5',
                      fontSize: '0.63rem',
                    }}
                  >
                    {time} · Severity: {severity}
                  </span>
                </span>

                <span
                  style={{
                    color: '#9ce8ff',
                    fontSize: '0.61rem',
                    fontWeight: 800,
                  }}
                >
                  {confidence}
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={RefreshCw}
            title="Background AI Systems"
            description="AI engines prepared for local, cloud, and realtime security analysis."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {backgroundSystems.map(([title, status, Icon]) => (
              <div
                key={title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  borderRadius: '0.85rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Icon size={15} color="#a9b8d6" />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      display: 'block',
                      color: '#dfe7fa',
                      fontSize: '0.67rem',
                    }}
                  >
                    {title}
                  </strong>

                  <span style={{ display: 'block', marginTop: '0.25rem' }}>
                    <SystemStatus status={status} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Future Aarush AI Evolution"
            description="Future AI capabilities are integrated as disabled architecture-ready modules."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {futureEvolution.map(([title, description, Icon]) => (
              <div
                key={title}
                style={{
                  minHeight: '5rem',
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  opacity: 0.68,
                }}
              >
                <Icon size={16} color="#b8aaff" />

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.5rem',
                    color: '#e1e8f9',
                    fontSize: '0.74rem',
                  }}
                >
                  {title}
                </strong>

                <p
                  style={{
                    margin: '0.25rem 0 0',
                    color: '#8794b0',
                    fontSize: '0.65rem',
                    lineHeight: 1.4,
                  }}
                >
                  {description}
                </p>

                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.35rem',
                    padding: '0.22rem 0.4rem',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.07)',
                    color: '#9aa7c1',
                    fontSize: '0.55rem',
                    fontWeight: 800,
                  }}
                >
                  Coming soon
                </span>
              </div>
            ))}
          </div>
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
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
              color: '#dce6fa',
              fontSize: '0.74rem',
              lineHeight: 1.45,
              textAlign: 'center',
            }}
          >
            {message}
          </div>
        ) : null}
      </main>

      <BottomNav />

      <style>{`
        button {
          -webkit-tap-highlight-color: transparent;
          transition: transform 180ms ease, filter 180ms ease, background 180ms ease;
        }

        button:not(:disabled):hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        button:not(:disabled):active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}

function ActivityIcon(props) {
  return <Radio {...props} />;
}