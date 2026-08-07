import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  ChevronLeft,
  Clock3,
  Eye,
  Fingerprint,
  Lock,
  MapPin,
  Mic,
  MonitorSmartphone,
  RefreshCw,
  ScanFace,
  ScreenShare,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Video,
  Wifi,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import PrivacyCallPanel, {
  videoPrivacyOptions,
  voicePrivacyOptions,
} from '../components/PrivacyCallPanel';
import useCallPrivacy from '../hooks/useCallPrivacy';

const screenShareOptions = [
  ['protectedShare', 'Protected Screen Share', 'Apply call privacy controls before sharing.', ScreenShare],
  ['hideNotifications', 'Hide Notifications During Share', 'Prevent notification previews from appearing.', Bell],
  ['hideSensitiveApps', 'Hide Sensitive Apps', 'Prepare selected apps for exclusion.', Lock],
  ['hidePasswordFields', 'Hide Password Fields', 'Protect password inputs while sharing.', Lock],
  ['hideOtpMessages', 'Hide OTP Messages', 'Protect one-time codes during screen sharing.', ShieldAlert],
  ['blurSelectedAreas', 'Blur Selected Areas', 'Prepare privacy regions for visual masking.', Eye],
  ['aiSensitiveDetection', 'AI Sensitive Content Detection', 'Detect sensitive content during sharing.', Sparkles],
  ['stopOnRisk', 'Stop Share On Risk Detection', 'Stop sharing when a risk signal is detected.', ShieldAlert],
];

const privacyBubbleOptions = [
  ['blurSurroundings', 'Blur Surroundings', 'Reduce visibility of the environment around the call.', Eye],
  ['dimScreen', 'Dim Screen', 'Reduce brightness during sensitive calls.', Eye],
  ['hideUiElements', 'Hide UI Elements', 'Reduce visible call controls.', Shield],
  ['reduceViewingAngle', 'Reduce Viewing Angle', 'Prepare display privacy against side viewing.', Eye],
  ['lockOrientation', 'Lock Orientation', 'Keep a controlled call layout.', Lock],
  ['temporaryOverlay', 'Temporary Privacy Overlay', 'Show a temporary protected call layer.', ShieldCheck],
];

const shoulderSurfOptions = [
  ['blurChat', 'Auto Blur Chat During Call', 'Blur chat content while a call is active.', Eye],
  ['blurControls', 'Auto Blur Call Controls', 'Reduce visibility of call controls.', Eye],
  ['blurSharedContent', 'Auto Blur Shared Content', 'Protect shared content from nearby viewers.', ScreenShare],
  ['detectNearbyViewing', 'Detect Nearby Viewing', 'Prepare nearby-viewer detection.', Eye],
  ['emergencyBlur', 'Emergency Blur', 'Apply immediate visual protection.', ShieldAlert],
  ['oneTapHide', 'One-Tap Hide', 'Hide sensitive call content instantly.', Eye],
];

const proximityOptions = [
  ['lockWhenUserLeaves', 'Lock When User Leaves', 'Protect the call when the device leaves the user.', Lock],
  ['biometricOnReturn', 'Require Biometric On Return', 'Require verification when returning to the call.', Fingerprint],
  ['autoMute', 'Auto Mute Microphone', 'Mute when proximity risk increases.', Mic],
  ['autoPauseVideo', 'Auto Pause Video', 'Pause video when the user leaves.', Video],
  ['autoHideShare', 'Auto Hide Shared Screen', 'Hide shared content during proximity risk.', ScreenShare],
  ['resumeAfterVerification', 'Resume After Verification', 'Resume protected call features after verification.', Check],
];

const companionOptions = [
  ['newDeviceDetection', 'New Device Detection', 'Detect connected devices that were not previously known.', MonitorSmartphone],
  ['bluetoothAlert', 'Bluetooth Device Alert', 'Prepare Bluetooth privacy alerts.', Wifi],
  ['externalDisplayAlert', 'External Display Alert', 'Warn when an external display is connected.', MonitorSmartphone],
  ['screenMirroringDetection', 'Screen Mirroring Detection', 'Prepare screen-mirroring detection.', ScreenShare],
  ['recordingDeviceDetection', 'Recording Device Detection', 'Prepare recording-device risk detection.', Video],
  ['wearableAwareness', 'Wearable Device Awareness', 'Prepare smartwatch and wearable integration.', Smartphone],
];

const futureCallLab = [
  ['Holographic Calls', 'Explore future immersive call experiences.', Sparkles],
  ['AI Live Translation', 'Translate voice and video conversations in real time.', Mic],
  ['Emotion Privacy Filter', 'Reduce unintended emotional signals in calls.', Shield],
  ['Adaptive Audio Shield', 'Adjust audio privacy to the environment.', VolumeIcon],
  ['Quantum Call Encryption', 'Prepare future cryptographic call protection.', Lock],
  ['AI Presence Verification', 'Verify authorized live presence during a call.', ScanFace],
  ['Invisible Call Mode', 'Reduce visible call indicators.', Eye],
  ['Autonomous Call Protection', 'Allow privacy automation to respond to risk.', ShieldCheck],
];

const backgroundSystems = [
  ['Call Privacy Engine', 'Active', ShieldCheck],
  ['Voice Protection Engine', 'Active', Mic],
  ['Video Protection Engine', 'Active', Video],
  ['Screen Share Shield', 'Protected', ScreenShare],
  ['Shoulder Surf Detection', 'Syncing', Eye],
  ['Proximity Lock Engine', 'Active', Lock],
  ['Device Security Monitor', 'Active', MonitorSmartphone],
  ['AI Call Guardian', 'Learning', Sparkles],
  ['Deepfake Detection', 'Learning', ScanFace],
  ['Notification Protection', 'Active', Bell],
  ['Realtime Call Sync', 'Syncing', RefreshCw],
  ['Emergency Call Protection', 'Protected', ShieldAlert],
];

function VolumeIcon(props) {
  return <Mic {...props} />;
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

function SystemStatus({ status }) {
  const color =
    status === 'Active'
      ? '#83e9c1'
      : status === 'Protected'
        ? '#8edfff'
        : status === 'Syncing'
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
      {status === 'Syncing' ? <RefreshCw size={10} /> : <span>●</span>}
      {status}
    </span>
  );
}

export default function CallPrivacyCenter() {
  const navigate = useNavigate();
  const {
    state,
    score,
    level,
    message,
    timeline,
    toggle,
    recordEvent,
    activateShield,
    requestMicrophone,
    requestCamera,
    clearMessage,
  } = useCallPrivacy();

  const quickAction = (title, callback) => {
    callback?.();
    recordEvent(`${title} enabled`, 'Low', 'Protected');
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
        pageTitle="Call Privacy"
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
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '3.4rem',
                height: '3.4rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                color: '#fff',
              }}
            >
              <ShieldCheck size={27} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.35rem',
                  fontWeight: 900,
                }}
              >
                Voice &amp; Video Call Privacy
              </h1>

              <p
                style={{
                  margin: '0.4rem 0 0',
                  color: '#c1cce2',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                }}
              >
                Protect every voice call, video call, screen share, and device
                interaction with intelligent privacy security.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1.1rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: '5.8rem',
                height: '5.8rem',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '999px',
                background: `conic-gradient(#61e8b4 ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '4.8rem',
                  height: '4.8rem',
                  display: 'grid',
                  placeItems: 'center',
                  alignContent: 'center',
                  borderRadius: '999px',
                  background: '#111827',
                }}
              >
                <strong style={{ fontSize: '1.1rem' }}>{score}</strong>
                <span style={{ color: '#91a0bd', fontSize: '0.58rem' }}>
                  / 100
                </span>
              </div>
            </div>

            <div>
              <strong
                style={{
                  display: 'block',
                  color: '#83edc1',
                  fontSize: '0.8rem',
                }}
              >
                {level}
              </strong>

              <span
                style={{
                  display: 'block',
                  marginTop: '0.3rem',
                  color: '#aab7d0',
                  fontSize: '0.69rem',
                  lineHeight: 1.45,
                }}
              >
                Call privacy controls are prepared for browser, native, AI,
                wearable, and future device-security integrations.
              </span>
            </div>
          </div>
        </section>

        <GlassSection>
          <SectionHeader
            icon={ShieldAlert}
            title="Instant Call Protection"
            description="Apply common call privacy protections immediately."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {[
              ['Activate Call Shield', 'Enable selected voice, video, and sharing protections.', ShieldCheck, () => activateShield()],
              ['Enable Whisper Mode', 'Prepare private voice controls for sensitive calls.', Mic, () => toggle('voice', 'privateVoiceMode')],
              ['Secure Screen Share', 'Protect notifications, passwords, OTPs, and selected areas.', ScreenShare, () => toggle('screenShare', 'protectedShare')],
              ['Enable Privacy Bubble', 'Create a protected call environment.', Eye, () => toggle('privacyBubble', 'temporaryOverlay')],
              ['Open Device Security', 'Review device and session protection.', MonitorSmartphone, () => navigate('/security-center')],
              ['Open AI Call Protection', 'Review future AI call guardian modules.', Sparkles, () => recordEvent('AI call protection opened', 'Low', 'Protected')],
            ].map(([title, description, Icon, onClick]) => (
              <button
                key={title}
                type="button"
                onClick={() => quickAction(title, onClick)}
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
                  cursor: 'pointer',
                }}
              >
                <Icon size={18} color="#bdb2ff" />

                <span>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
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
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Mic}
            title="Voice Privacy"
            description="Protect microphone use, voice leakage, and audio security."
          />

          <PrivacyCallPanel
            section="voice"
            state={state}
            options={voicePrivacyOptions()}
            onToggle={toggle}
            onAction={(title) => {
              if (title === 'Voice Mask') {
                recordEvent('Voice mask enabled', 'Low', 'Protected');
              }
            }}
          />

          <button
            type="button"
            onClick={requestMicrophone}
            style={{
              width: '100%',
              minHeight: '2.7rem',
              marginTop: '0.65rem',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              color: '#dce5f8',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Verify Microphone Permission
          </button>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Camera}
            title="Video Privacy"
            description="Protect camera access, presence, backgrounds, and visual exposure."
          />

          <PrivacyCallPanel
            section="video"
            state={state}
            options={videoPrivacyOptions()}
            onToggle={toggle}
            onAction={(title) => {
              if (title === 'Face Presence Verification') {
                recordEvent('Face presence verification prepared', 'Low', 'Protected');
              }
            }}
          />

          <button
            type="button"
            onClick={requestCamera}
            style={{
              width: '100%',
              minHeight: '2.7rem',
              marginTop: '0.65rem',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              color: '#dce5f8',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Verify Camera Permission
          </button>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ScreenShare}
            title="Secure Screen Share"
            description="Protect shared screens from notification, password, OTP, and sensitive-content exposure."
          />

          <PrivacyCallPanel
            section="screenShare"
            state={state}
            options={screenShareOptions}
            onToggle={toggle}
            onAction={(title) =>
              recordEvent(`${title} configured`, 'Low', 'Protected')
            }
          />
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Eye}
            title="Privacy Bubble"
            description="Create a protected call environment."
          />

          <PrivacyCallPanel
            section="privacyBubble"
            state={state}
            options={privacyBubbleOptions}
            onToggle={toggle}
            onAction={(title) =>
              recordEvent(`${title} configured`, 'Low', 'Protected')
            }
          />
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ShieldAlert}
            title="Shoulder Surf Protection"
            description="Integrate visual privacy controls with the existing ShoulderSurf system."
          />

          <PrivacyCallPanel
            section="shoulderSurf"
            state={state}
            options={shoulderSurfOptions}
            onToggle={toggle}
            onAction={(title) =>
              recordEvent(`${title} enabled`, 'Low', 'Protected')
            }
          />

          <button
            type="button"
            onClick={() => navigate('/shoulder-surf')}
            style={{
              width: '100%',
              minHeight: '2.7rem',
              marginTop: '0.65rem',
              border: 0,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 850,
              cursor: 'pointer',
            }}
          >
            Open Shoulder Surf Protection
          </button>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Lock}
            title="Proximity Lock"
            description="Automatically protect the call when the device is moved away from the user."
          />

          <PrivacyCallPanel
            section="proximity"
            state={state}
            options={proximityOptions}
            onToggle={toggle}
            onAction={(title) =>
              recordEvent(`${title} configured`, 'Low', 'Protected')
            }
          />
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={MonitorSmartphone}
            title="Companion Device Alert"
            description="Detect other connected devices and protect call privacy."
          />

          <PrivacyCallPanel
            section="companion"
            state={state}
            options={companionOptions}
            onToggle={toggle}
            onAction={(title) =>
              recordEvent(`${title} configured`, 'Moderate', 'Review')
            }
          />
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Aarush AI Call Guardian"
            description="AI-powered protection modules for safer calls."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Scam Call Detection', 'Detect suspicious call patterns.'],
              ['Fraud Conversation Detection', 'Identify payment and impersonation risks.'],
              ['Voice Deepfake Detection', 'Prepare voice manipulation analysis.'],
              ['Suspicious Caller Analysis', 'Review caller risk signals.'],
              ['Call Risk Prediction', 'Predict call privacy risk.'],
              ['Identity Verification Assistance', 'Support identity verification during calls.'],
              ['AI Call Safety Score', 'Summarize the current call safety level.'],
            ].map(([title, description]) => (
              <div
                key={title}
                style={{
                  minHeight: '4.4rem',
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Sparkles size={15} color="#b8aaff" />

                <strong
                  style={{
                    display: 'block',
                    marginTop: '0.35rem',
                    color: '#eaf0ff',
                    fontSize: '0.69rem',
                  }}
                >
                  {title}
                </strong>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.2rem',
                    color: '#8997b3',
                    fontSize: '0.61rem',
                  }}
                >
                  {description}
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Clock3}
            title="Call Security Timeline"
            description="Review call privacy and security events."
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {timeline.map((item) => (
              <div
                key={item.id}
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
                      item.severity === 'Moderate' ? '#ffd07d' : '#72e9b8',
                    boxShadow:
                      item.severity === 'Moderate'
                        ? '0 0 9px #ffd07d'
                        : '0 0 9px #72e9b8',
                  }}
                />

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
                </span>

                <span
                  style={{
                    color: item.status === 'Protected' ? '#83e9c1' : '#ffd28d',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={RefreshCw}
            title="Background Call Protection Systems"
            description="Internal services prepared for realtime and AI-powered call security."
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
            title="Future Aarush Call Lab (Coming Soon)"
            description="Future call technologies are prepared as disabled architecture-ready modules."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {futureCallLab.map(([title, description, Icon]) => (
              <div
                key={title}
                style={{
                  minHeight: '4.8rem',
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
                    marginTop: '0.45rem',
                    color: '#e1e8f9',
                    fontSize: '0.73rem',
                  }}
                >
                  {title}
                </strong>

                <p
                  style={{
                    margin: '0.22rem 0 0',
                    color: '#8794b0',
                    fontSize: '0.64rem',
                    lineHeight: 1.4,
                  }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </GlassSection>

        {message ? (
          <div
            role="status"
            onClick={clearMessage}
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
              cursor: 'pointer',
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