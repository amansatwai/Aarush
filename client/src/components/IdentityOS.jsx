import { useMemo, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Eye,
  Fingerprint,
  Globe2,
  KeyRound,
  Laptop,
  LockKeyhole,
  Mail,
  MessageCircle,
  MonitorSmartphone,
  MoreHorizontal,
  Phone,
  QrCode,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', UserRound],
  ['id', 'Aarush ID', Fingerprint],
  ['verification', 'Verification', BadgeCheck],
  ['devices', 'Devices', MonitorSmartphone],
  ['sessions', 'Sessions', Activity],
  ['recovery', 'Recovery', KeyRound],
  ['permissions', 'Permissions', ShieldCheck],
  ['privacy', 'Privacy', Eye],
  ['security', 'Security', LockKeyhole],
  ['timeline', 'Timeline', Clock3],
];

const VERIFICATION_LEVELS = [
  'Basic',
  'Email Verified',
  'Phone Verified',
  'Government ID',
  'Face Verified',
  'Business Verified',
  'Creator Verified',
  'Enterprise Verified',
];

const PERMISSIONS = [
  ['Stories', 'Story publishing and identity profile'],
  ['Messaging', 'Messages and communication'],
  ['Wallet', 'Payments and financial identity'],
  ['Workspace', 'Teams, agencies, and projects'],
  ['Education', 'Learning profile and progress'],
  ['Business', 'Business identity foundation'],
  ['Commerce', 'Storefront and commerce profile'],
  ['AI Assistant', 'Personalized AI experiences'],
  ['Cloud Storage', 'Cloud files foundation'],
];

function numeric(value) {
  return Number(value) || 0;
}

function formatDate(value) {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color = '#4dd7ff',
}) {
  return (
    <article style={styles.metricCard}>
      <span
        style={{
          ...styles.metricIcon,
          color,
          background: `${color}18`,
        }}
      >
        <Icon size={17} />
      </span>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </article>
  );
}

function SectionTitle({ title, subtitle, icon: Icon, action }) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      {action || <Icon size={18} color="#4dd7ff" />}
    </div>
  );
}

export default function IdentityOS({
  user = {},
  devices = [],
  sessions = [],
  security = {},
  verification = {},
  trustedContacts = [],
  identitySettings = {},
  onUpdateIdentity,
  onVerifyIdentity,
  onAddDevice,
  onRemoveDevice,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [notice, setNotice] = useState('');
  const [showPrivateId, setShowPrivateId] =
    useState(false);
  const [permissionState, setPermissionState] =
    useState(() => identitySettings.permissions || {});
  const [privacyState, setPrivacyState] =
    useState(() => ({
      publicProfile:
        identitySettings.publicProfile !== false,
      discoverability:
        identitySettings.discoverability !== false,
      searchVisibility:
        identitySettings.searchVisibility !== false,
      crossServiceVisibility:
        identitySettings.crossServiceVisibility !== false,
      identitySharing:
        identitySettings.identitySharing !== false,
      creatorVisibility:
        identitySettings.creatorVisibility !== false,
      businessVisibility:
        identitySettings.businessVisibility !== false,
    }));

  const verificationIndex = useMemo(() => {
    const level =
      verification.level ||
      user.verificationLevel ||
      'Basic';

    const index = VERIFICATION_LEVELS.indexOf(level);

    return index >= 0 ? index : 0;
  }, [user.verificationLevel, verification.level]);

  const identityScore = useMemo(
    () =>
      Math.min(
        100,
        numeric(
          user.identityScore ||
            verification.identityScore ||
            security.identityScore
        ) || 72 + verificationIndex * 4
      ),
    [
      security.identityScore,
      user.identityScore,
      verification.identityScore,
      verificationIndex,
    ]
  );

  const currentLevel =
    verification.level ||
    user.verificationLevel ||
    VERIFICATION_LEVELS[verificationIndex];

  const publicId =
    user.aarushId ||
    user.publicId ||
    user.username ||
    'aarush-user';

  const privateId =
    user.privateIdentity ||
    user.identityId ||
    'Private identity protected';

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const copyId = async () => {
    try {
      await navigator.clipboard?.writeText(publicId);
      showNotice('Aarush ID copied.');
    } catch {
      showNotice('Aarush ID ready to copy.');
    }
  };

  const updatePermission = (name) => {
    const nextValue = !permissionState[name];

    setPermissionState((current) => ({
      ...current,
      [name]: nextValue,
    }));

    onUpdateIdentity?.({
      permissions: {
        ...permissionState,
        [name]: nextValue,
      },
    });

    showNotice(`${name} permission updated.`);
  };

  const updatePrivacy = (key) => {
    const nextValue = !privacyState[key];

    setPrivacyState((current) => ({
      ...current,
      [key]: nextValue,
    }));

    onUpdateIdentity?.({
      privacy: {
        ...privacyState,
        [key]: nextValue,
      },
    });

    showNotice('Privacy control updated.');
  };

  const renderOverview = () => (
    <>
      <section style={styles.identityHero}>
        <Avatar user={user} large />
        <div style={styles.identityCopy}>
          <span style={styles.aiBadge}>
            <ShieldCheck size={12} />
            Unified Aarush identity
          </span>
          <h1>
            {user.fullName ||
              user.name ||
              user.username ||
              'Aarush User'}
          </h1>
          <span>
            @{user.username || publicId} · {currentLevel}
          </span>
          <p>
            One secure identity across Stories, Messaging,
            Wallet, Workspace, Commerce, Education, and AI.
          </p>
        </div>
        <IdentityRing score={identityScore} />
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Verification level"
          value={currentLevel}
          icon={BadgeCheck}
          color="#82e9c1"
        />
        <MetricCard
          label="Identity score"
          value={`${identityScore}/100`}
          icon={Fingerprint}
          color="#4dd7ff"
        />
        <MetricCard
          label="Trusted devices"
          value={devices.length}
          icon={MonitorSmartphone}
          color="#a895ff"
        />
        <MetricCard
          label="Active sessions"
          value={sessions.length}
          icon={Activity}
          color="#ffd27d"
        />
        <MetricCard
          label="Recovery readiness"
          value={
            identitySettings.recoveryStatus ||
            'Foundation'
          }
          icon={KeyRound}
          color="#9deeff"
        />
        <MetricCard
          label="Security status"
          value={security.status || 'Protected'}
          icon={ShieldCheck}
          color="#82e9c1"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Identity Snapshot"
          subtitle="Your most important identity signals."
          icon={Fingerprint}
        />
        <SnapshotRow
          label="Aarush ID"
          value={publicId}
          action={copyId}
        />
        <SnapshotRow
          label="Account age"
          value={formatDate(user.createdAt)}
        />
        <SnapshotRow
          label="Last verified"
          value={formatDateTime(
            verification.lastVerifiedAt
          )}
        />
        <SnapshotRow
          label="Trusted contacts"
          value={trustedContacts.length || 'Foundation'}
        />
      </section>
    </>
  );

  const renderIdentity = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Universal Aarush ID"
        subtitle="Control your public, private, creator, and business identity."
        icon={Fingerprint}
      />

      <div style={styles.idCard}>
        <div style={styles.idCardTop}>
          <Fingerprint size={22} />
          <span>Universal identity</span>
          <BadgeCheck
            size={16}
            color="#82e9c1"
            style={{ marginLeft: 'auto' }}
          />
        </div>

        <strong style={styles.idValue}>{publicId}</strong>

        <div style={styles.idActions}>
          <button
            type="button"
            onClick={copyId}
            style={styles.smallButton}
          >
            <Copy size={14} />
            Copy ID
          </button>
          <button
            type="button"
            onClick={() => showNotice('Share card prepared.')}
            style={styles.smallButton}
          >
            <QrCode size={14} />
            Share ID
          </button>
          <button
            type="button"
            onClick={() =>
              showNotice('Public handle regeneration prepared.')
            }
            style={styles.smallButton}
          >
            <RefreshCw size={14} />
            Regenerate handle
          </button>
        </div>
      </div>

      <div style={styles.identityTypes}>
        <IdentityType
          label="Public identity"
          value={publicId}
          icon={Globe2}
        />
        <IdentityType
          label="Private identity"
          value={showPrivateId ? privateId : 'Hidden'}
          icon={LockKeyhole}
          action={() => setShowPrivateId((value) => !value)}
        />
        <IdentityType
          label="Creator identity"
          value={user.creatorId || 'Foundation'}
          icon={UserRound}
        />
        <IdentityType
          label="Business identity"
          value={user.businessId || 'Foundation'}
          icon={BuildingIcon}
        />
      </div>
    </section>
  );

  const renderVerification = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Verification Center"
        subtitle="Build trust across the Aarush ecosystem."
        icon={BadgeCheck}
      />

      <div style={styles.verificationProgress}>
        <div style={styles.progressTrack}>
          <span
            style={{
              ...styles.progressFill,
              width: `${((verificationIndex + 1) /
                VERIFICATION_LEVELS.length) *
                100}%`,
            }}
          />
        </div>
        <div style={styles.progressMeta}>
          <span>{currentLevel}</span>
          <strong>
            {verificationIndex + 1}/
            {VERIFICATION_LEVELS.length}
          </strong>
        </div>
      </div>

      <div style={styles.verificationList}>
        {VERIFICATION_LEVELS.map((level, index) => {
          const complete = index <= verificationIndex;
          const available = index === verificationIndex + 1;

          return (
            <button
              type="button"
              key={level}
              onClick={() => {
                if (available) {
                  onVerifyIdentity?.(level);
                  showNotice(`${level} verification started.`);
                }
              }}
              style={{
                ...styles.verificationRow,
                ...(complete
                  ? styles.completeVerification
                  : {}),
                ...(available
                  ? styles.availableVerification
                  : {}),
              }}
            >
              <span style={styles.verificationIcon}>
                {complete ? (
                  <Check size={14} />
                ) : (
                  <BadgeCheck size={14} />
                )}
              </span>
              <span>{level}</span>
              <small>
                {complete
                  ? 'Verified'
                  : available
                    ? 'Continue'
                    : 'Next level'}
              </small>
              <ChevronRight size={14} />
            </button>
          );
        })}
      </div>
    </section>
  );

  const renderDevices = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Trusted Devices"
        subtitle="Manage devices authorized to access your identity."
        icon={MonitorSmartphone}
        action={
          <button
            type="button"
            onClick={() => {
              onAddDevice?.();
              showNotice('Add device flow prepared.');
            }}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Add device
          </button>
        }
      />

      <div style={styles.deviceList}>
        {devices.length ? (
          devices.map((device, index) => (
            <div
              key={device.id || index}
              style={styles.deviceRow}
            >
              <span style={styles.deviceIcon}>
                {device.type === 'mobile' ? (
                  <Smartphone size={17} />
                ) : (
                  <Laptop size={17} />
                )}
              </span>
              <span style={styles.deviceCopy}>
                <strong>
                  {device.name || 'Trusted device'}
                  {device.current ? (
                    <em>Current</em>
                  ) : null}
                </strong>
                <span>
                  {device.os || 'Operating system'} ·{' '}
                  {device.browser || 'Browser'}
                </span>
                <small>
                  Last active:{' '}
                  {formatDateTime(device.lastActive)}
                </small>
              </span>
              <span style={styles.trustBadge}>
                {device.trustLevel || 'Trusted'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onRemoveDevice?.(device);
                  showNotice('Device removal prepared.');
                }}
                aria-label="Remove device"
                style={styles.tinyButton}
              >
                <X size={14} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="No trusted devices registered." />
        )}
      </div>
    </section>
  );

  const renderSessions = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Active Sessions"
        subtitle="Review and revoke access sessions."
        icon={Activity}
        action={
          <button
            type="button"
            onClick={() =>
              showNotice('All other sessions revoked.')
            }
            style={styles.smallButton}
          >
            End all others
          </button>
        }
      />

      <div style={styles.sessionList}>
        {sessions.length ? (
          sessions.map((session, index) => (
            <div
              key={session.id || index}
              style={styles.sessionRow}
            >
              <span style={styles.sessionIcon}>
                <Activity size={16} />
              </span>
              <span style={styles.sessionCopy}>
                <strong>
                  {session.device || 'Active device'}
                </strong>
                <span>
                  {session.location || 'Location foundation'} ·{' '}
                  {session.type || 'Web session'}
                </span>
                <small>
                  Login {formatDateTime(session.loginTime)} ·
                  Last activity{' '}
                  {formatDateTime(session.lastActivity)}
                </small>
              </span>
              <span style={styles.sessionStatus}>
                {session.securityStatus || 'Secure'}
              </span>
              <button
                type="button"
                onClick={() =>
                  showNotice('Session revoked.')
                }
                style={styles.tinyButton}
                aria-label="End session"
              >
                <X size={14} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="No active sessions." />
        )}
      </div>
    </section>
  );

  const renderRecovery = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Recovery"
        subtitle="Keep your identity recoverable and resilient."
        icon={KeyRound}
      />

      <div style={styles.recoveryGrid}>
        {[
          ['Email Recovery', Mail, user.email ? 'Ready' : 'Add email'],
          ['Phone Recovery', Phone, user.phone ? 'Ready' : 'Add phone'],
          ['Recovery Codes', KeyRound, 'Foundation'],
          ['Trusted Contact', UsersIcon, trustedContacts.length ? 'Ready' : 'Add contact'],
          ['Backup Device', MonitorSmartphone, devices.length ? 'Ready' : 'Add device'],
          ['Recovery Center', ShieldCheck, 'Foundation'],
        ].map(([label, Icon, state]) => (
          <button
            type="button"
            key={label}
            onClick={() => showNotice(`${label} opened.`)}
            style={styles.recoveryCard}
          >
            <Icon size={17} />
            <strong>{label}</strong>
            <span>{state}</span>
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
    </section>
  );

  const renderPermissions = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Identity Permissions"
        subtitle="Manage which Aarush services can use your identity."
        icon={ShieldCheck}
      />

      <div style={styles.permissionList}>
        {PERMISSIONS.map(([name, description]) => {
          const enabled = permissionState[name] !== false;

          return (
            <button
              type="button"
              key={name}
              onClick={() => updatePermission(name)}
              aria-pressed={enabled}
              style={{
                ...styles.permissionRow,
                ...(enabled
                  ? styles.enabledPermission
                  : {}),
              }}
            >
              <span style={styles.permissionCheck}>
                {enabled ? <Check size={14} /> : null}
              </span>
              <span style={styles.permissionCopy}>
                <strong>{name}</strong>
                <small>{description}</small>
              </span>
              <span style={styles.permissionStatus}>
                {enabled ? 'Allowed' : 'Blocked'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );

  const renderPrivacy = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Privacy Controls"
        subtitle="Control identity visibility across Aarush services."
        icon={Eye}
      />

      <div style={styles.privacyList}>
        {[
          ['publicProfile', 'Public profile'],
          ['discoverability', 'Discoverability'],
          ['searchVisibility', 'Search visibility'],
          ['crossServiceVisibility', 'Cross-service visibility'],
          ['identitySharing', 'Identity sharing'],
          ['creatorVisibility', 'Creator profile visibility'],
          ['businessVisibility', 'Business profile visibility'],
        ].map(([key, label]) => (
          <button
            type="button"
            key={key}
            onClick={() => updatePrivacy(key)}
            aria-pressed={privacyState[key]}
            style={styles.privacyRow}
          >
            <Eye size={15} />
            <span>{label}</span>
            <span
              style={{
                ...styles.toggle,
                ...(privacyState[key]
                  ? styles.activeToggle
                  : {}),
              }}
            >
              {privacyState[key] ? 'On' : 'Off'}
            </span>
          </button>
        ))}
      </div>

      <div style={styles.integrationNote}>
        <ShieldCheck size={16} />
        PrivacyDashboard integration foundation is active.
      </div>
    </section>
  );

  const renderSecurity = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Security Center"
        subtitle="Identity protection and access intelligence."
        icon={LockKeyhole}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Passkey"
          value={security.passkey || 'Foundation'}
          icon={KeyRound}
          color="#82e9c1"
        />
        <MetricCard
          label="Biometric"
          value={security.biometric || 'Foundation'}
          icon={Fingerprint}
          color="#4dd7ff"
        />
        <MetricCard
          label="PIN protection"
          value={security.pin || 'Protected'}
          icon={LockKeyhole}
          color="#a895ff"
        />
        <MetricCard
          label="Device security"
          value={security.deviceSecurity || 'Verified'}
          icon={MonitorSmartphone}
          color="#ffd27d"
        />
        <MetricCard
          label="Two-factor"
          value={security.twoFactor || 'Foundation'}
          icon={ShieldCheck}
          color="#9deeff"
        />
        <MetricCard
          label="Login alerts"
          value={security.loginAlerts || 'Enabled'}
          icon={Activity}
          color="#82e9c1"
        />
        <MetricCard
          label="Suspicious activity"
          value={security.suspiciousActivity || 'Clear'}
          icon={ShieldCheck}
          color="#ff7c9f"
        />
      </div>
    </section>
  );

  const renderTimeline = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Identity Timeline"
        subtitle="Important events across your identity lifecycle."
        icon={Clock3}
      />

      <div style={styles.timeline}>
        {(
          identitySettings.timeline || [
            ['Account created', user.createdAt],
            ['Email verified', verification.emailVerifiedAt],
            ['Phone verified', verification.phoneVerifiedAt],
            ['Device added', verification.deviceAddedAt],
            ['Password changed', security.passwordChangedAt],
            ['Security updated', security.updatedAt],
            ['Session revoked', security.sessionRevokedAt],
            ['Verification upgraded', verification.updatedAt],
          ]
        ).map(([label, date], index) => (
          <div
            key={`${label}-${index}`}
            style={styles.timelineRow}
          >
            <span style={styles.timelineDot}>
              <Check size={12} />
            </span>
            <span style={styles.timelineCopy}>
              <strong>{label}</strong>
              <small>{formatDateTime(date)}</small>
            </span>
            <ChevronRight size={14} />
          </div>
        ))}
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'id') return renderIdentity();
    if (activeModule === 'verification') {
      return renderVerification();
    }
    if (activeModule === 'devices') return renderDevices();
    if (activeModule === 'sessions') return renderSessions();
    if (activeModule === 'recovery') return renderRecovery();
    if (activeModule === 'permissions') {
      return renderPermissions();
    }
    if (activeModule === 'privacy') return renderPrivacy();
    if (activeModule === 'security') return renderSecurity();
    if (activeModule === 'timeline') return renderTimeline();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close IdentityOS"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>IdentityOS</strong>
          <span>
            One secure identity across Aarush
          </span>
        </div>

        <button
          type="button"
          aria-label="Identity settings"
          style={styles.iconButton}
        >
          <Settings2 size={18} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <nav style={styles.moduleNav}>
          {MODULES.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveModule(id)}
              aria-pressed={activeModule === id}
              style={{
                ...styles.moduleButton,
                ...(activeModule === id
                  ? styles.activeModuleButton
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {renderModule()}
      </div>

      <style>{`
        @keyframes aarush-identity-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-identity-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-identity-card:hover,
        .aarush-identity-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-identity-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-identity-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-identity-recovery,
          .aarush-identity-permissions {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </main>
  );
}

function Avatar({ user, large = false }) {
  const source =
    user?.avatar || user?.avatarUrl || user?.photo;

  if (source) {
    return (
      <img
        src={source}
        alt=""
        loading="lazy"
        style={{
          ...styles.avatar,
          ...(large ? styles.largeAvatar : {}),
        }}
      />
    );
  }

  return (
    <span
      style={{
        ...styles.avatarFallback,
        ...(large ? styles.largeAvatar : {}),
      }}
    >
      {String(user?.fullName || user?.name || 'A')
        .charAt(0)
        .toUpperCase()}
    </span>
  );
}

function IdentityRing({ score }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (score / 100) * circumference;

  return (
    <div style={styles.identityRing}>
      <svg
        viewBox="0 0 110 110"
        role="img"
        aria-label={`Identity score ${score} out of 100`}
        style={styles.identitySvg}
      >
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.1)"
          strokeWidth="8"
        />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="#4dd7ff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
        />
      </svg>
      <div style={styles.identityRingText}>
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
    </div>
  );
}

function SnapshotRow({ label, value, action }) {
  return (
    <div style={styles.snapshotRow}>
      <span>{label}</span>
      <strong>{value}</strong>
      {action ? (
        <button
          type="button"
          onClick={action}
          aria-label={`Copy ${label}`}
          style={styles.tinyButton}
        >
          <Copy size={14} />
        </button>
      ) : null}
    </div>
  );
}

function IdentityType({
  label,
  value,
  icon: Icon,
  action,
}) {
  return (
    <div style={styles.identityType}>
      <Icon size={16} />
      <span>
        <strong>{label}</strong>
        <small>{value}</small>
      </span>
      {action ? (
        <button
          type="button"
          onClick={action}
          style={styles.tinyButton}
          aria-label={`Toggle ${label}`}
        >
          <Eye size={14} />
        </button>
      ) : null}
    </div>
  );
}

function UsersIcon() {
  return <UserRound size={17} />;
}

function BuildingIcon() {
  return <Globe2 size={17} />;
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Fingerprint size={25} />
      <span>{label}</span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.58),#07090e 68%)',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.65rem',
    padding: '.75rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  iconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.06)',
    cursor: 'pointer',
  },

  heading: {
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  content: {
    width: 'min(100%, 1120px)',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.8rem',
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    padding: '.65rem',
    border: '1px solid rgba(130,233,193,.22)',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.64rem',
  },

  moduleNav: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    paddingBottom: '.2rem',
  },

  moduleButton: {
    minWidth: '5.9rem',
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.28rem',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeModuleButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  identityHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.85rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-identity-pulse 3s ease-in-out infinite',
  },

  identityCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.25rem',
    flex: 1,
  },

  aiBadge: {
    width: 'fit-content',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.56rem',
    fontWeight: 800,
  },

  identityCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  identityCopyP: {
    maxWidth: '35rem',
    margin: 0,
    color: '#91a0bc',
    fontSize: '.63rem',
    lineHeight: 1.45,
  },

  identityRing: {
    position: 'relative',
    width: '6.8rem',
    height: '6.8rem',
    flexShrink: 0,
  },

  identitySvg: {
    width: '100%',
    height: '100%',
  },

  identityRingText: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
  },

  identityRingTextStrong: {
    fontSize: '1.45rem',
  },

  identityRingTextSpan: {
    color: '#91a0bc',
    fontSize: '.56rem',
  },

  avatar: {
    width: '3.7rem',
    height: '3.7rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '1rem',
  },

  avatarFallback: {
    width: '3.7rem',
    height: '3.7rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '1rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '1.4rem',
    fontWeight: 850,
  },

  largeAvatar: {
    width: '4.5rem',
    height: '4.5rem',
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
  },

  metricCard: {
    minHeight: '6.4rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    background: 'rgba(15,19,30,.9)',
    animation: 'aarush-identity-in 240ms ease both',
  },

  metricIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.6rem',
  },

  metricLabel: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  metricValue: {
    color: '#fff',
    fontSize: '.79rem',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-identity-in 240ms ease both',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.7rem',
  },

  sectionHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  sectionHeaderH2: {
    margin: 0,
    fontSize: '.86rem',
  },

  sectionHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  snapshotRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    minHeight: '2.45rem',
    padding: '0 .55rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    color: '#91a0bc',
    fontSize: '.6rem',
  },

  snapshotRowStrong: {
    marginLeft: 'auto',
    color: '#dce5f8',
    textAlign: 'right',
  },

  tinyButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.5rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    cursor: 'pointer',
  },

  idCard: {
    padding: '.8rem',
    border: '1px solid rgba(77,215,255,.2)',
    borderRadius: '.85rem',
    background:
      'linear-gradient(135deg,rgba(77,215,255,.1),rgba(124,92,255,.08))',
  },

  idCardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    color: '#c9f9ff',
    fontSize: '.59rem',
  },

  idValue: {
    display: 'block',
    margin: '.7rem 0',
    color: '#fff',
    fontSize: '1.1rem',
    letterSpacing: '.04em',
  },

  idActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  smallButton: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  smallPrimary: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.59rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  identityTypes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.45rem',
    marginTop: '.7rem',
  },

  identityType: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#9deeff',
    background: 'rgba(255,255,255,.035)',
  },

  identityTypeSpan: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  identityTypeSmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  progressTrack: {
    height: '.45rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.09)',
  },

  progressFill: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  progressMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '.35rem 0 .7rem',
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  progressMetaStrong: {
    color: '#9deeff',
  },

  verificationList: {
    display: 'grid',
    gap: '.4rem',
  },

  verificationRow: {
    minHeight: '2.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  completeVerification: {
    borderColor: 'rgba(130,233,193,.18)',
    color: '#dfffee',
    background: 'rgba(130,233,193,.06)',
  },

  availableVerification: {
    borderColor: 'rgba(77,215,255,.25)',
    color: '#c9f9ff',
  },

  verificationIcon: {
    width: '1.65rem',
    height: '1.65rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.45rem',
    color: '#82e9c1',
  },

  verificationRowSmall: {
    marginLeft: 'auto',
    color: '#91a0bc',
    fontSize: '.53rem',
  },

  deviceList: {
    display: 'grid',
    gap: '.4rem',
  },

  deviceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  deviceIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  deviceCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  deviceCopyStrong: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
  },

  deviceCopyStrongEm: {
    padding: '.18rem .3rem',
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
    fontSize: '.48rem',
    fontStyle: 'normal',
  },

  deviceCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  deviceCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  trustBadge: {
    color: '#82e9c1',
    fontSize: '.54rem',
  },

  sessionList: {
    display: 'grid',
    gap: '.4rem',
  },

  sessionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  sessionIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  sessionCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  sessionCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  sessionCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  sessionStatus: {
    color: '#82e9c1',
    fontSize: '.54rem',
  },

  recoveryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  recoveryCard: {
    minHeight: '5.2rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  recoveryCardSpan: {
    color: '#82e9c1',
    fontSize: '.55rem',
  },

  recoveryCardSvg: {
    alignSelf: 'end',
    color: '#91a0bc',
  },

  permissionList: {
    display: 'grid',
    gap: '.4rem',
  },

  permissionRow: {
    minHeight: '3rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  enabledPermission: {
    borderColor: 'rgba(130,233,193,.18)',
    color: '#dfffee',
    background: 'rgba(130,233,193,.06)',
  },

  permissionCheck: {
    width: '1.45rem',
    height: '1.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: '.4rem',
    color: '#82e9c1',
  },

  permissionCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  permissionCopySmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  permissionStatus: {
    color: '#82e9c1',
    fontSize: '.54rem',
  },

  privacyList: {
    display: 'grid',
    gap: '.35rem',
  },

  privacyRow: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.65rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  toggle: {
    minWidth: '2.2rem',
    marginLeft: 'auto',
    padding: '.25rem .35rem',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.08)',
    fontSize: '.52rem',
    textAlign: 'center',
  },

  activeToggle: {
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.14)',
  },

  integrationNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.59rem',
  },

  securityNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.06)',
    fontSize: '.59rem',
  },

  timeline: {
    display: 'grid',
    gap: '.35rem',
  },

  timelineRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    minHeight: '2.7rem',
    padding: '.45rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
  },

  timelineDot: {
    width: '1.6rem',
    height: '1.6rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.12)',
  },

  timelineCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  timelineCopySmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  empty: {
    minHeight: '6rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.64rem',
    textAlign: 'center',
  },

  identityType: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#9deeff',
    background: 'rgba(255,255,255,.035)',
  },
};