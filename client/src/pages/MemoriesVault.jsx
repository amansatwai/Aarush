import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Camera,
  Check,
  ChevronLeft,
  Clock3,
  Cloud,
  Download,
  FileText,
  FolderLock,
  Image,
  Lock,
  Music,
  Plus,
  ScanSearch,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Video,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import VaultFolderCard from '../components/VaultFolderCard';
import MemoryTimelineCard from '../components/MemoryTimelineCard';
import useMemoriesVault from '../hooks/useMemoriesVault';
import { formatBytes } from '../utils/vaultEngine';

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

export default function MemoriesVault() {
  const navigate = useNavigate();
  const {
    state,
    storage,
    timeline,
    memoryItems,
    recordEvent,
    createFolder,
    showMessage,
    message,
  } = useMemoriesVault();

  const score = storage.percentage < 80 ? 99 : 92;
  const level =
    score >= 95
      ? 'Fully Protected'
      : score >= 80
        ? 'Strong'
        : score >= 60
          ? 'Moderate'
          : 'Exposed';

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
        pageTitle="Memories & Private Safe"
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
          <FolderLock size={29} color="#9be8ff" />

          <h1
            style={{
              margin: '0.7rem 0 0',
              fontSize: '1.35rem',
              fontWeight: 900,
            }}
          >
            Memories, Private Safe &amp; Encrypted Vault
          </h1>

          <p
            style={{
              margin: '0.4rem 0 0',
              color: '#c1cce2',
              fontSize: '0.78rem',
              lineHeight: 1.5,
            }}
          >
            Protect photos, videos, documents, chats, and personal memories
            inside a secure encrypted vault.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1rem',
              paddingTop: '0.9rem',
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
                  fontSize: '0.68rem',
                  lineHeight: 1.45,
                }}
              >
                Encryption foundation: {state.encryption}
                <br />
                Sync status: {state.syncStatus}
              </span>
            </div>
          </div>
        </section>

        <GlassSection>
          <SectionHeader
            icon={Sparkles}
            title="Instant Vault Actions"
            description="Quick actions for private storage and memory protection."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Open Private Safe', FolderLock],
              ['Lock Vault Now', Lock],
              ['Create Hidden Folder', Plus],
              ['Import From Gallery', Image],
              ['Export Encrypted Backup', Download],
              ['Run AI Privacy Scan', ScanSearch],
            ].map(([title, Icon]) => (
              <button
                key={title}
                type="button"
                onClick={() => showMessage(`${title} is ready for vault integration.`)}
                style={{
                  minHeight: '4.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dfe7f8',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={17} color="#b8aaff" />
                <span style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                  {title}
                </span>
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Image}
            title="Memories"
            description="Organize photos, videos, archives, documents, and saved content by timeline."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {memoryItems.map(([title, count, date, status]) => (
              <button
                key={title}
                type="button"
                onClick={() => recordEvent(`${title} opened`, status)}
                style={{
                  minHeight: '4.5rem',
                  padding: '0.7rem',
                  borderRadius: '0.9rem',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dfe7f8',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <strong
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                  }}
                >
                  {title}
                </strong>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.25rem',
                    color: '#8997b3',
                    fontSize: '0.61rem',
                  }}
                >
                  {count} · {date}
                </span>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.25rem',
                    color: '#83e9c1',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                  }}
                >
                  {status} · Encrypted
                </span>
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={FolderLock}
            title="Private Safe"
            description="This area is designed to require biometric, PIN, or pattern authentication."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              ['Hidden Photos', Image],
              ['Hidden Videos', VideoIcon],
              ['Hidden Documents', FileText],
              ['Hidden Audio', MusicIcon],
              ['Hidden Notes', FileText],
              ['Hidden Contacts', UsersIcon],
              ['Hidden Passwords', KeyIcon],
              ['Hidden Recovery Files', Shield],
            ].map(([title, Icon]) => (
              <button
                key={title}
                type="button"
                onClick={() => showMessage(`${title} requires AppLockGate verification.`)}
                style={{
                  minHeight: '3.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem',
                  borderRadius: '0.8rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dce5f8',
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Icon size={15} color="#b8aaff" />
                {title}
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ShieldCheck}
            title="Encrypted Vault"
            description="Private folders with storage, encryption, access, and trusted-device metadata."
          />

          <div
            style={{ display: 'grid', gap: '0.6rem' }}
          >
            {state.folders.map((folder) => (
              <VaultFolderCard
                key={folder.id}
                folder={folder}
                onOpen={() => showMessage(`${folder.name} requires secure verification.`)}
                onAction={(action) =>
                  showMessage(`${action} is ready for encrypted vault integration.`)
                }
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => createFolder('Custom Vault')}
            style={{
              width: '100%',
              minHeight: '2.7rem',
              marginTop: '0.7rem',
              border: 0,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 850,
              cursor: 'pointer',
            }}
          >
            Create Custom Vault
          </button>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Eye}
            title="Hidden Media"
            description="Control whether protected media appears in ordinary device surfaces."
          />

          {[
            'Hide From Gallery',
            'Hide From Recent Apps',
            'Hide From File Explorer',
            'Hide From Search',
            'Hide From Media Scanner',
            'Hide From Backup Preview',
            'Invisible Folder Mode',
            'Decoy Folder Mode',
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
              <Eye size={14} color="#aebcda" />
              <span style={{ flex: 1 }}>{item}</span>
              <Check size={13} color="#83e9c1" />
            </div>
          ))}
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Clock3}
            title="Automatic Data Expiry"
            description="Allow expiration for selected files and folders."
          />

          <select
            value={state.autoExpiry}
            onChange={(event) => update({ autoExpiry: event.target.value })}
            style={{
              width: '100%',
              minHeight: '2.7rem',
              padding: '0 0.7rem',
              borderRadius: '0.8rem',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#151b2b',
              color: '#edf3ff',
            }}
          >
            {[
              '1 hour',
              '24 hours',
              '3 days',
              '7 days',
              '30 days',
              '90 days',
              '1 year',
              'Never',
            ].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginTop: '0.7rem',
            }}
          >
            {[
              ['Expire automatically', Check],
              ['Move to secure trash', Trash2],
              ['Permanently delete', Trash2],
              ['Require confirmation', ShieldCheck],
              ['AI reminder before deletion', Sparkles],
            ].map(([title, Icon]) => (
              <button
                key={title}
                type="button"
                onClick={() => showMessage(`${title} is ready for lifecycle integration.`)}
                style={{
                  minHeight: '2.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '0.8rem',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dce5f8',
                  fontSize: '0.62rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={14} color="#aebcda" />
                {title}
              </button>
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={ScanSearch}
            title="Aarush AI Privacy Scan"
            description="Prepare AI scanning for sensitive documents, identities, financial records, and private media."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.45rem',
            }}
          >
            {[
              'Sensitive documents',
              'IDs',
              'Passports',
              'Payment cards',
              'Personal photos',
              'Private conversations',
              'OTP screenshots',
              'Password screenshots',
              'Financial records',
              'Medical records',
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => showMessage(`${item} scan is ready for AI privacy integration.`)}
                style={{
                  minHeight: '2.5rem',
                  padding: '0.55rem',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#dce5f8',
                  fontSize: '0.62rem',
                  cursor: 'pointer',
                }}
              >
                {item}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.35rem',
              marginTop: '0.7rem',
            }}
          >
            {['Move To Safe', 'Encrypt', 'Hide', 'Delete Securely', 'Ignore'].map(
              (action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => showMessage(`${action} is ready for AI vault integration.`)}
                  style={{
                    minHeight: '2.4rem',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#dce5f8',
                    fontSize: '0.54rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {action}
                </button>
              )
            )}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={Clock3}
            title="Memory Timeline"
            description="Chronological history of memory, vault, backup, recovery, expiry, and deletion events."
          />

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {timeline.map((item) => (
              <MemoryTimelineCard key={item.id} item={item} />
            ))}
          </div>
        </GlassSection>

        <GlassSection>
          <SectionHeader
            icon={RefreshCw}
            title="Background Vault Systems"
            description="Internal systems supporting encrypted memory protection and lifecycle management."
          />

          {[
            'Vault Encryption Engine',
            'Hidden Media Engine',
            'Secure Backup Engine',
            'Auto Expiry Engine',
            'Memory Timeline Engine',
            'AI Privacy Scanner',
            'Metadata Protection',
            'Gallery Isolation',
            'Device Sync',
            'Trusted Device Manager',
            'Secure Deletion Engine',
            'Realtime Vault Sync',
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
            title="Future Aarush Vault Lab (Coming Soon)"
            description="Future storage and memory technologies are prepared as disabled modules."
          />

          {[
            'Zero-Knowledge Encryption',
            'AI Memory Organization',
            'Secure Family Vault',
            'Quantum Vault Protection',
            'AI Sensitive Memory Detection',
            'Private Collaboration Vault',
            'Invisible Cloud Vault',
            'Autonomous Privacy Storage',
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

      <style>{`
        button {
          -webkit-tap-highlight-color: transparent;
          transition: transform 180ms ease, filter 180ms ease;
        }

        button:not(:disabled):hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }
      `}</style>
    </div>
  );
}

function VideoIcon(props) {
  return <Video {...props} />;
}

function MusicIcon(props) {
  return <Sparkles {...props} />;
}

function UsersIcon(props) {
  return <Shield {...props} />;
}

function KeyIcon(props) {
  return <Lock {...props} />;
}