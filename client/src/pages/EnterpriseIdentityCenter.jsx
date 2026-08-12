import { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  RefreshCw,
  Shield,
  UserPlus,
  Users,
  Workspace,
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
import {
  createRole,
} from '../utils/accessControlEngine';

function isGuestMode() {
  if (typeof window === 'undefined') return false;

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

function ActionRow({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className="enterprise-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="enterprise-action-icon">
        {icon}
      </div>

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <ChevronRight size={18} />
    </button>
  );
}

export default function EnterpriseIdentityCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    organization,
    workspaces,
    access,
    status,
    loading,
    error,
    refresh,
  } = useEnterpriseIdentity();

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const runAction = async (
    action,
    message
  ) => {
    try {
      setBusy(true);
      setActionError('');
      await action();
      setNotice(message);
      await refresh();
    } catch (actionException) {
      setActionError(
        actionException?.message ||
          'Unable to complete enterprise action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const createOrg = () => {
    if (guest) {
      navigate('/login');
      return;
    }

    runAction(
      () =>
        createOrganization({
          name: 'New Aarush organization',
          description: 'Enterprise workspace',
        }),
      'Organization created.'
    );
  };

  const createWork = () => {
    if (guest) {
      navigate('/login');
      return;
    }

    runAction(
      () =>
        createWorkspace({
          organization_id: organization?.id,
          name: 'New workspace',
          workspace_type: 'business',
        }),
      'Workspace created.'
    );
  };

  const invite = () => {
    if (guest) {
      navigate('/login');
      return;
    }

    const email = window.prompt(
      'Enter member email:'
    );

    if (!email) return;

    runAction(
      () =>
        inviteMember({
          organizationId: organization?.id,
          email,
          role: 'Member',
        }),
      'Member invitation created.'
    );
  };

  const role = () => {
    if (guest) {
      navigate('/login');
      return;
    }

    runAction(
      () =>
        createRole({
          organizationId: organization?.id,
          name: 'Custom Manager',
          permissions: [
            'analytics',
            'posts',
            'teams',
          ],
        }),
      'Custom role created.'
    );
  };

  if (loading) {
    return (
      <div className="social-page enterprise-page">
        <TopBar />

        <main className="enterprise-content">
          <div className="enterprise-loading-header" />
          <div className="enterprise-loading-card" />
          <div className="enterprise-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page enterprise-page">
      <TopBar />

      <main className="enterprise-content">
        <header className="enterprise-header">
          <button
            type="button"
            className="enterprise-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="enterprise-eyebrow">
              Enterprise identity
            </p>
            <h1>Identity Center</h1>
          </div>

          <button
            type="button"
            className="enterprise-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh identity"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="enterprise-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="enterprise-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="enterprise-status-card">
          <div className="enterprise-status-icon">
            <Shield size={27} />
          </div>

          <div className="enterprise-status-copy">
            <p>Organization overview</p>
            <h2>
              {organization?.name ||
                'Enterprise setup ready'}
            </h2>
            <span>
              {status?.workspaces || 0} workspaces
              {' · '}
              {status?.verified
                ? 'Verified'
                : 'Verification prepared'}
            </span>
          </div>

          <button
            type="button"
            className="enterprise-primary-button"
            onClick={createOrg}
            disabled={guest || busy}
          >
            <PlusIcon />
            Organization
          </button>
        </section>

        <section className="enterprise-metric-grid">
          <article className="enterprise-metric">
            <WorkspaceIcon />
            <span>Workspaces</span>
            <strong>{workspaces.length}</strong>
          </article>

          <article className="enterprise-metric">
            <Users size={18} />
            <span>Assignments</span>
            <strong>
              {access?.assignments?.length || 0}
            </strong>
          </article>

          <article className="enterprise-metric">
            <KeyRound size={18} />
            <span>Roles</span>
            <strong>{access?.roles?.length || 0}</strong>
          </article>

          <article className="enterprise-metric">
            <Shield size={18} />
            <span>Permissions</span>
            <strong>
              {access?.permissions?.length || 0}
            </strong>
          </article>
        </section>

        <section className="enterprise-section">
          <div className="enterprise-section-heading">
            <WorkspaceIcon />
            <div>
              <h2>Workspaces</h2>
              <p>
                Personal, business, creator, shared, and enterprise workspaces.
              </p>
            </div>
          </div>

          <div className="enterprise-card">
            <ActionRow
              icon={<PlusIcon />}
              title="Create workspace"
              description="Add a workspace to the organization."
              onClick={createWork}
              disabled={guest || busy}
            />

            {workspaces.map((workspace) => (
              <article
                className="enterprise-list-row"
                key={workspace.id}
              >
                <WorkspaceIcon />
                <div>
                  <strong>{workspace.name}</strong>
                  <span>
                    {workspace.workspace_type}
                    {' · '}
                    {workspace.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="enterprise-section">
          <div className="enterprise-section-heading">
            <Users size={17} />
            <div>
              <h2>Team members</h2>
              <p>
                Invite members and prepare granular access roles.
              </p>
            </div>
          </div>

          <div className="enterprise-card">
            <ActionRow
              icon={<UserPlus size={18} />}
              title="Invite member"
              description="Invite a team member by email."
              onClick={invite}
              disabled={guest || busy}
            />

            <ActionRow
              icon={<Users size={18} />}
              title="Manage team"
              description="Review members, roles, status, and workspaces."
              onClick={() =>
                navigate('/business-team')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<KeyRound size={18} />}
              title="Create role"
              description="Create a custom role with granular permissions."
              onClick={role}
              disabled={guest || busy}
            />
          </div>
        </section>

        <section className="enterprise-section">
          <div className="enterprise-section-heading">
            <Shield size={17} />
            <div>
              <h2>Roles and permissions</h2>
              <p>
                Owner, Admin, Manager, Developer, Analyst, Member, and Guest.
              </p>
            </div>
          </div>

          <div className="enterprise-permission-grid">
            {(access?.permissions || [
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
            ]).map((permission) => (
              <div
                className="enterprise-permission"
                key={permission}
              >
                <Check size={15} />
                <span>{permission}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="enterprise-section">
          <div className="enterprise-section-heading">
            <KeyRound size={17} />
            <div>
              <h2>SSO preparation</h2>
              <p>
                Prepare Google, Microsoft, Apple, GitHub, SAML, and OIDC identity providers.
              </p>
            </div>
          </div>

          <div className="enterprise-feature-grid">
            {[
              'Google SSO',
              'Microsoft SSO',
              'Apple SSO',
              'GitHub SSO',
              'SAML placeholder',
              'OpenID Connect',
              'Domain-based login',
              'Enterprise providers',
            ].map((feature) => (
              <div
                className="enterprise-feature"
                key={feature}
              >
                <Check size={15} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="enterprise-section">
          <div className="enterprise-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Audit and administration</h2>
              <p>
                Track identity, role, permission, API, integration, and admin events.
              </p>
            </div>
          </div>

          <div className="enterprise-card">
            <ActionRow
              icon={<Shield size={18} />}
              title="View audit logs"
              description="Review organization and access events."
              onClick={() =>
                navigate('/security-center')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<KeyRound size={18} />}
              title="Advanced access control"
              description="Manage API access, webhooks, admin actions, and service accounts."
              onClick={() =>
                navigate('/developer-platform')
              }
              disabled={busy}
            />

            <ActionRow
              icon={<Users size={18} />}
              title="Enterprise analytics"
              description="Review workspace, team, usage, and identity activity."
              onClick={() =>
                navigate('/business-analytics')
              }
              disabled={busy}
            />
          </div>
        </section>

        <p className="enterprise-footer">
          Guests can view enterprise identity information.
          Organizations, workspaces, members, roles,
          permissions, SSO, and admin actions require
          authentication and server-side authorization.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

function PlusIcon() {
  return <UserPlus size={17} />;
}

function WorkspaceIcon() {
  return <Workspace size={18} />;
}

const styles = `
  .enterprise-page {
    min-height: 100vh;
    color: #f4f7ff;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(124,92,255,0.2),
        transparent 35%
      ),
      radial-gradient(
        circle at 100% 18%,
        rgba(77,215,255,0.1),
        transparent 30%
      ),
      #080b13;
  }

  .enterprise-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .enterprise-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .enterprise-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .enterprise-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .enterprise-icon-button {
    width: 2.5rem;
    height: 2.5rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.9rem;
    color: #eaf0ff;
    background: rgba(255,255,255,0.06);
    cursor: pointer;
  }

  .enterprise-icon-button:last-child {
    justify-self: end;
  }

  .enterprise-error,
  .enterprise-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .enterprise-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .enterprise-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .enterprise-status-card,
  .enterprise-card,
  .enterprise-metric,
  .enterprise-permission,
  .enterprise-feature {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .enterprise-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .enterprise-status-icon {
    width: 3.3rem;
    height: 3.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 1rem;
    color: #fff;
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
  }

  .enterprise-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .enterprise-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .enterprise-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .enterprise-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .enterprise-primary-button {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    min-height: 2.35rem;
    padding: 0.55rem 0.75rem;
    border: 0;
    border-radius: 999px;
    color: #fff;
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
    font-size: 0.7rem;
    font-weight: 850;
    cursor: pointer;
  }

  .enterprise-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .enterprise-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-top: 0.7rem;
  }

  .enterprise-metric {
    display: grid;
    gap: 0.3rem;
    min-height: 6.5rem;
    padding: 0.75rem;
    border-radius: 1rem;
    color: #b8a9ff;
  }

  .enterprise-metric span {
    color: #8491ad;
    font-size: 0.65rem;
  }

  .enterprise-metric strong {
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .enterprise-section {
    margin-top: 1.3rem;
  }

  .enterprise-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .enterprise-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .enterprise-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .enterprise-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .enterprise-action-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
    border: 0;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .enterprise-action-row + .enterprise-action-row {
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .enterprise-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .enterprise-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .enterprise-action-row > span,
  .enterprise-list-row > div {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .enterprise-action-row strong,
  .enterprise-list-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .enterprise-action-row small,
  .enterprise-list-row span {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .enterprise-list-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 3.8rem;
    padding: 0.7rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
    color: #b8a9ff;
  }

  .enterprise-permission-grid,
  .enterprise-feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.55rem;
  }

  .enterprise-permission,
  .enterprise-feature {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 3rem;
    padding: 0.7rem;
    border-radius: 0.9rem;
    color: #c9f9ff;
    font-size: 0.68rem;
  }

  .enterprise-permission span,
  .enterprise-feature span {
    color: #dce5f7;
  }

  .enterprise-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .enterprise-loading-header,
  .enterprise-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: enterprise-skeleton 1.4s infinite;
  }

  .enterprise-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .enterprise-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes enterprise-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 720px) {
    .enterprise-metric-grid,
    .enterprise-permission-grid,
    .enterprise-feature-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .enterprise-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .enterprise-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .enterprise-primary-button {
      margin-left: auto;
    }
  }
`;