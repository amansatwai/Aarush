import { useState } from 'react';
import {
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Layers3,
  RefreshCw,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useEnterpriseIdentity from '../hooks/useEnterpriseIdentity';

import {
  createOrganization,
  createWorkspace,
  inviteMember,
} from '../utils/enterpriseIdentityEngine';

import { createRole } from '../utils/accessControlEngine';

function WorkspaceIcon() {
  return <Layers3 size={18} />;
}

export default function EnterpriseIdentityCenter() {
  const navigate = useNavigate();

  const {
    organization,
    workspaces = [],
    access,
    status,
    loading,
    error,
    refresh,
  } = useEnterpriseIdentity();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  const permissions = access?.permissions || [];
  const assignments = access?.assignments || [];
  const roles = access?.roles || [];

  const fallbackPermissions = [
    'posts',
    'stories',
    'reels',
    'chats',
    'security',
    'privacy',
    'payments',
    'analytics',
    'teams',
    'workspaces',
    'api_access',
    'admin_actions',
  ];

  const permissionItems = permissions.length
    ? permissions
    : fallbackPermissions;

  const runAction = async (action, successMessage) => {
    if (busy) return;

    setBusy(true);
    setNotice('');
    setActionError('');

    try {
      await action();
      await refresh?.();
      setNotice(successMessage);
    } catch (actionFailure) {
      setActionError(
        actionFailure?.message ||
          'The action could not be completed. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCreateOrganization = () =>
    runAction(
      () =>
        createOrganization({
          name: 'New Aarush organization',
          description: 'Enterprise workspace',
        }),
      'Organization created successfully.'
    );

  const handleCreateWorkspace = () => {
    if (!organization?.id) {
      setActionError(
        'Create or select an organization before creating a workspace.'
      );
      return;
    }

    runAction(
      () =>
        createWorkspace({
          organization_id: organization.id,
          name: 'New workspace',
          workspace_type: 'business',
        }),
      'Workspace created successfully.'
    );
  };

  const handleInviteMember = () => {
    if (!organization?.id) {
      setActionError(
        'An organization is required before inviting members.'
      );
      return;
    }

    const email = window.prompt('Enter the member email address:');

    if (email === null) return;

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setActionError('Enter a valid email address.');
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setActionError('Enter a valid email address.');
      return;
    }

    runAction(
      () =>
        inviteMember({
          organizationId: organization.id,
          email: normalizedEmail,
          role: 'Member',
        }),
      'Invitation sent successfully.'
    );
  };

  const handleCreateRole = () => {
    if (!organization?.id) {
      setActionError(
        'An organization is required before creating a role.'
      );
      return;
    }

    runAction(
      () =>
        createRole({
          organizationId: organization.id,
          name: 'Custom Manager',
          permissions: ['analytics', 'posts', 'teams'],
        }),
      'Custom role created successfully.'
    );
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <TopBar title="Enterprise Identity" />
        <main style={styles.container}>
          <div style={styles.loadingHero}>
            <span style={styles.loadingOrb}>
              <Shield size={24} />
            </span>
            <div>
              <h1 style={styles.loadingTitle}>
                Loading enterprise identity
              </h1>
              <p style={styles.loadingText}>
                Restoring organization and access context…
              </p>
            </div>
          </div>

          <div style={styles.metricGrid}>
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                style={styles.skeletonCard}
              />
            ))}
          </div>

          <div style={styles.skeletonPanel} />
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <TopBar title="Enterprise Identity" />

      <main style={styles.container}>
        <header style={styles.pageHeader}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={styles.iconButton}
          >
            <ChevronLeft size={19} />
          </button>

          <div style={styles.headerCopy}>
            <span style={styles.eyebrow}>
              Aarush Enterprise Access
            </span>
            <h1 style={styles.pageTitle}>
              Enterprise Identity Center
            </h1>
            <p style={styles.pageSubtitle}>
              Manage organizations, workspaces, roles, permissions,
              and identity infrastructure.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refresh?.()}
            disabled={busy}
            aria-label="Refresh enterprise identity"
            style={styles.iconButton}
          >
            <RefreshCw
              size={18}
              style={
                busy ? styles.spinningIcon : undefined
              }
            />
          </button>
        </header>

        {error ? (
          <div role="alert" style={styles.errorBox}>
            <Shield size={16} />
            <span>
              Enterprise identity could not be loaded. Please
              refresh and try again.
            </span>
          </div>
        ) : null}

        {actionError ? (
          <div role="alert" style={styles.errorBox}>
            <Shield size={16} />
            <span>{actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div role="status" style={styles.noticeBox}>
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section style={styles.identityCard}>
          <div style={styles.identityOrb}>
            <Shield size={28} />
          </div>

          <div style={styles.identityCopy}>
            <span style={styles.statusPill}>
              <span style={styles.statusDot} />
              {status || 'Enterprise identity active'}
            </span>

            <h2 style={styles.identityTitle}>
              {organization?.name || 'Aarush Enterprise'}
            </h2>

            <p style={styles.identityDescription}>
              Server-authorized enterprise identity and access
              management for your Aarush organization.
            </p>

            <div style={styles.identityMeta}>
              <span>
                {workspaces.length} workspaces
              </span>
              <span>
                {organization?.verified
                  ? 'Verified organization'
                  : 'Verification foundation'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateOrganization}
            disabled={busy}
            style={styles.primaryButton}
          >
            <PlusIcon />
            Create organization
          </button>
        </section>

        <section style={styles.metricGrid}>
          <MetricCard
            label="Workspaces"
            value={workspaces.length}
            icon={WorkspaceIcon}
            color="#2563eb"
          />
          <MetricCard
            label="Assignments"
            value={assignments.length}
            icon={Users}
            color="#7c5cff"
          />
          <MetricCard
            label="Roles"
            value={roles.length}
            icon={KeyRound}
            color="#16a34a"
          />
          <MetricCard
            label="Permissions"
            value={permissions.length || fallbackPermissions.length}
            icon={Shield}
            color="#d97706"
          />
        </section>

        <section style={styles.section}>
          <SectionHeader
            title="Workspaces"
            subtitle="Create and manage enterprise workspaces."
            icon={Layers3}
            action={
              <button
                type="button"
                onClick={handleCreateWorkspace}
                disabled={busy}
                style={styles.secondaryButton}
              >
                <PlusIcon />
                New workspace
              </button>
            }
          />

          <div style={styles.workspaceList}>
            {workspaces.length ? (
              workspaces.map((workspace) => (
                <button
                  type="button"
                  key={workspace.id}
                  onClick={() =>
                    navigate(
                      `/workspace/${workspace.id}`
                    )
                  }
                  style={styles.workspaceRow}
                >
                  <span style={styles.workspaceIcon}>
                    <WorkspaceIcon />
                  </span>

                  <span style={styles.workspaceCopy}>
                    <strong>
                      {workspace.name || 'Workspace'}
                    </strong>
                    <span>
                      {workspace.workspace_type ||
                        workspace.type ||
                        'Enterprise workspace'}
                    </span>
                    <small>
                      {workspace.status || 'Active'}
                    </small>
                  </span>

                  <ChevronRight
                    size={17}
                    color="#64748b"
                  />
                </button>
              ))
            ) : (
              <EmptyState text="No workspaces created yet." />
            )}
          </div>
        </section>

        <section style={styles.section}>
          <SectionHeader
            title="Team Access"
            subtitle="Invite members and manage team administration."
            icon={Users}
            action={
              <button
                type="button"
                onClick={handleInviteMember}
                disabled={busy}
                style={styles.secondaryButton}
              >
                <UserPlus size={15} />
                Invite member
              </button>
            }
          />

          <div style={styles.actionGrid}>
            <ActionCard
              icon={Users}
              title="Manage team"
              description="Review members and organization assignments."
              onClick={() => navigate('/business-team')}
            />
            <ActionCard
              icon={KeyRound}
              title="Create role"
              description="Add a custom role with controlled permissions."
              onClick={handleCreateRole}
            />
            <ActionCard
              icon={Shield}
              title="Security center"
              description="Review security controls and access signals."
              onClick={() => navigate('/security-center')}
            />
          </div>
        </section>

        <section style={styles.section}>
          <SectionHeader
            title="Roles & Permissions"
            subtitle="Current access capabilities for this organization."
            icon={KeyRound}
            action={
              <span style={styles.sectionBadge}>
                {roles.length} roles
              </span>
            }
          />

          <div style={styles.permissionGrid}>
            {permissionItems.map((permission) => (
              <div
                key={
                  typeof permission === 'string'
                    ? permission
                    : permission.id || permission.name
                }
                style={styles.permissionCard}
              >
                <span style={styles.permissionCheck}>
                  <Check size={13} />
                </span>
                <span>
                  {typeof permission === 'string'
                    ? permission
                    : permission.name || permission.key}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <SectionHeader
            title="SSO Preparation"
            subtitle="Enterprise identity providers ready for configuration."
            icon={Shield}
            action={
              <span style={styles.sectionBadge}>
                Configuration foundation
              </span>
            }
          />

          <div style={styles.ssoGrid}>
            {[
              'Google SSO',
              'Microsoft SSO',
              'Apple SSO',
              'GitHub SSO',
              'SAML',
              'OpenID Connect',
              'Domain-based login',
              'Enterprise providers',
            ].map((provider) => (
              <div
                key={provider}
                style={styles.ssoCard}
              >
                <Check size={15} color="#16a34a" />
                <span>
                  <strong>{provider}</strong>
                  <small>Ready for integration</small>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <SectionHeader
            title="Audit & Administration"
            subtitle="Review enterprise events and platform controls."
            icon={Shield}
          />

          <div style={styles.actionGrid}>
            <ActionCard
              icon={Shield}
              title="View audit logs"
              description="Inspect security and identity activity."
              onClick={() => navigate('/security-center')}
            />
            <ActionCard
              icon={KeyRound}
              title="Advanced access control"
              description="Manage platform-level access foundations."
              onClick={() => navigate('/developer-platform')}
            />
            <ActionCard
              icon={Layers3}
              title="Enterprise analytics"
              description="Review organization intelligence."
              onClick={() => navigate('/enterprise-analytics')}
            />
          </div>
        </section>

        <footer style={styles.footerNote}>
          <Shield size={14} />
          Enterprise identity actions are protected by
          authentication and server-side authorization.
        </footer>
      </main>

      <BottomNav />

      <style>{`
        @keyframes enterpriseIdentitySpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 720px) {
          .aarush-enterprise-identity-header {
            grid-template-columns: auto 1fr auto !important;
          }

          .aarush-enterprise-identity-card {
            grid-template-columns: auto 1fr !important;
          }

          .aarush-enterprise-identity-card > button {
            grid-column: 1 / -1;
            width: 100%;
          }

          .aarush-enterprise-identity-metrics {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .aarush-enterprise-identity-actions,
          .aarush-enterprise-identity-permissions,
          .aarush-enterprise-identity-sso {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}) {
  return (
    <div style={styles.sectionHeader}>
      <div style={styles.sectionHeading}>
        <span style={styles.sectionIcon}>
          <Icon size={16} />
        </span>
        <div>
          <h2 style={styles.sectionTitle}>{title}</h2>
          <p style={styles.sectionSubtitle}>{subtitle}</p>
        </div>
      </div>
      {action || null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}) {
  return (
    <div style={styles.metricCard}>
      <span
        style={{
          ...styles.metricIcon,
          color,
          background: `${color}16`,
        }}
      >
        <Icon size={18} />
      </span>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.actionCard}
    >
      <span style={styles.actionIcon}>
        <Icon size={17} />
      </span>
      <span style={styles.actionCopy}>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <ChevronRight size={16} color="#64748b" />
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div style={styles.emptyState}>
      <Layers3 size={21} />
      <span>{text}</span>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '5.5rem',
    color: '#1f2937',
    background:
      'radial-gradient(circle at top, rgba(124,92,255,.08), transparent 30rem), #f7f9fc',
  },

  container: {
    width: 'min(100%, 1120px)',
    margin: '0 auto',
    padding: '1rem',
    display: 'grid',
    gap: '1rem',
  },

  pageHeader: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.75rem',
  },

  iconButton: {
    width: '2.6rem',
    height: '2.6rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(15,23,42,.1)',
    borderRadius: '999px',
    color: '#334155',
    background: 'rgba(255,255,255,.9)',
    boxShadow: '0 4px 14px rgba(15,23,42,.06)',
    cursor: 'pointer',
  },

  spinningIcon: {
    animation:
      'enterpriseIdentitySpin 800ms linear infinite',
  },

  headerCopy: {
    minWidth: 0,
  },

  eyebrow: {
    color: '#7c5cff',
    fontSize: '.67rem',
    fontWeight: 800,
    letterSpacing: '.04em',
    textTransform: 'uppercase',
  },

  pageTitle: {
    margin: '.2rem 0',
    color: '#111827',
    fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
    lineHeight: 1.2,
  },

  pageSubtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '.78rem',
    lineHeight: 1.5,
  },

  loadingPage: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.8rem',
    color: '#111827',
    background:
      'radial-gradient(circle at top, #ffffff, #f1f4f9)',
  },

  loadingHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.75rem',
    minHeight: '6rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.14)',
    borderRadius: '1rem',
    background: '#ffffff',
    boxShadow: '0 10px 28px rgba(15,23,42,.07)',
  },

  loadingOrb: {
    width: '3.5rem',
    height: '3.5rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '1rem',
    color: '#7c5cff',
    background: '#f3f0ff',
  },

  loadingTitle: {
    margin: 0,
    fontSize: '1rem',
  },

  loadingText: {
    margin: '.2rem 0 0',
    color: '#64748b',
    fontSize: '.72rem',
  },

  loadingDot: {
    width: '.6rem',
    height: '.6rem',
    borderRadius: '999px',
    background: '#7c5cff',
    boxShadow: '0 0 18px rgba(124,92,255,.5)',
  },

  skeletonCard: {
    minHeight: '7rem',
    borderRadius: '1rem',
    background:
      'linear-gradient(90deg, #eef2f7 25%, #f8fafc 50%, #eef2f7 75%)',
    backgroundSize: '200% 100%',
    animation: 'enterpriseIdentityShimmer 1.4s infinite',
  },

  skeletonPanel: {
    minHeight: '18rem',
    borderRadius: '1rem',
    background:
      'linear-gradient(90deg, #eef2f7 25%, #f8fafc 50%, #eef2f7 75%)',
    backgroundSize: '200% 100%',
    animation: 'enterpriseIdentityShimmer 1.4s infinite',
  },

  identityCard: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.18)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg, rgba(255,255,255,.98), rgba(243,240,255,.92))',
    boxShadow: '0 16px 40px rgba(124,92,255,.1)',
  },

  identityOrb: {
    width: '4.2rem',
    height: '4.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '1.15rem',
    color: '#ffffff',
    background:
      'linear-gradient(135deg, #7c5cff, #2563eb)',
    boxShadow: '0 12px 25px rgba(124,92,255,.22)',
  },

  identityCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.35rem',
  },

  statusPill: {
    width: 'fit-content',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '.3rem .5rem',
    borderRadius: '999px',
    color: '#15803d',
    background: '#ecfdf3',
    fontSize: '.6rem',
    fontWeight: 800,
  },

  statusDot: {
    width: '.42rem',
    height: '.42rem',
    borderRadius: '999px',
    background: '#16a34a',
  },

  identityTitle: {
    margin: 0,
    color: '#111827',
    fontSize: '1.2rem',
  },

  identityDescription: {
    maxWidth: '42rem',
    margin: 0,
    color: '#64748b',
    fontSize: '.75rem',
    lineHeight: 1.5,
  },

  identityMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.5rem',
    color: '#475569',
    fontSize: '.65rem',
    fontWeight: 700,
  },

  primaryButton: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    padding: '0 .8rem',
    border: 0,
    borderRadius: '.7rem',
    color: '#ffffff',
    background:
      'linear-gradient(135deg, #7c5cff, #2563eb)',
    boxShadow: '0 8px 18px rgba(124,92,255,.18)',
    fontSize: '.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  secondaryButton: {
    minHeight: '2.4rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    padding: '0 .65rem',
    border: '1px solid rgba(124,92,255,.2)',
    borderRadius: '.65rem',
    color: '#5b3bd4',
    background: '#f3f0ff',
    fontSize: '.65rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '.65rem',
  },

  metricCard: {
    minHeight: '6.7rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.3rem',
    padding: '.75rem',
    border: '1px solid rgba(15,23,42,.08)',
    borderRadius: '1rem',
    background: '#ffffff',
    boxShadow: '0 6px 20px rgba(15,23,42,.05)',
  },

  metricIcon: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.65rem',
  },

  metricLabel: {
    color: '#64748b',
    fontSize: '.62rem',
  },

  metricValue: {
    overflow: 'hidden',
    color: '#111827',
    fontSize: '.82rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  section: {
    display: 'grid',
    gap: '.75rem',
    padding: '1rem',
    border: '1px solid rgba(15,23,42,.08)',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,.88)',
    boxShadow: '0 8px 25px rgba(15,23,42,.05)',
    backdropFilter: 'blur(12px)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.75rem',
  },

  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
    minWidth: 0,
  },

  sectionIcon: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.65rem',
    color: '#7c5cff',
    background: '#f3f0ff',
  },

  sectionTitle: {
    margin: 0,
    color: '#111827',
    fontSize: '.9rem',
  },

  sectionSubtitle: {
    margin: '.15rem 0 0',
    color: '#64748b',
    fontSize: '.68rem',
    lineHeight: 1.4,
  },

  sectionBadge: {
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#475569',
    background: '#f1f5f9',
    fontSize: '.56rem',
    fontWeight: 750,
  },

  workspaceList: {
    display: 'grid',
    gap: '.45rem',
  },

  workspaceRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '.6rem',
    padding: '.65rem',
    border: '1px solid rgba(15,23,42,.08)',
    borderRadius: '.75rem',
    color: '#1f2937',
    background: '#ffffff',
    textAlign: 'left',
    cursor: 'pointer',
  },

  workspaceIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.65rem',
    color: '#2563eb',
    background: '#eff6ff',
  },

  workspaceCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  workspaceCopySpan: {
    color: '#64748b',
    fontSize: '.62rem',
  },

  workspaceCopySmall: {
    color: '#16a34a',
    fontSize: '.58rem',
    fontWeight: 700,
  },

  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '.55rem',
  },

  actionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
    minHeight: '4.1rem',
    padding: '.65rem',
    border: '1px solid rgba(15,23,42,.08)',
    borderRadius: '.8rem',
    color: '#1f2937',
    background: '#ffffff',
    textAlign: 'left',
    cursor: 'pointer',
  },

  actionIcon: {
    width: '2.15rem',
    height: '2.15rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#7c5cff',
    background: '#f3f0ff',
  },

  actionCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  actionCopySmall: {
    color: '#64748b',
    fontSize: '.6rem',
    lineHeight: 1.35,
  },

  permissionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '.45rem',
  },

  permissionCard: {
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .5rem',
    border: '1px solid rgba(22,163,74,.14)',
    borderRadius: '.65rem',
    color: '#166534',
    background: '#f0fdf4',
    fontSize: '.6rem',
    fontWeight: 700,
  },

  permissionCheck: {
    width: '1.2rem',
    height: '1.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.35rem',
    color: '#16a34a',
    background: '#dcfce7',
  },

  ssoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '.45rem',
  },

  ssoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '3.4rem',
    padding: '.55rem',
    border: '1px solid rgba(15,23,42,.08)',
    borderRadius: '.7rem',
    background: '#ffffff',
  },

  ssoCardSpan: {
    minWidth: 0,
    display: 'grid',
    gap: '.12rem',
  },

  ssoCardSmall: {
    color: '#64748b',
    fontSize: '.52rem',
  },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '.7rem',
    border: '1px solid rgba(220,38,38,.2)',
    borderRadius: '.75rem',
    color: '#991b1b',
    background: '#fef2f2',
    fontSize: '.68rem',
  },

  noticeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '.7rem',
    border: '1px solid rgba(22,163,74,.18)',
    borderRadius: '.75rem',
    color: '#166534',
    background: '#f0fdf4',
    fontSize: '.68rem',
  },

  footerNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    padding: '.75rem',
    color: '#64748b',
    fontSize: '.63rem',
    textAlign: 'center',
  },

  emptyState: {
    minHeight: '5rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.35rem',
    color: '#64748b',
    fontSize: '.68rem',
    textAlign: 'center',
  },
};