import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Check,
  ChevronDown,
  Copy,
  Crown,
  Edit3,
  Eye,
  FileText,
  Link2,
  MessageCircle,
  Music,
  Palette,
  Plus,
  QrCode,
  Send,
  Shield,
  Sticker,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

const ROLES = [
  ['owner', 'Owner', 'Full control'],
  ['co_author', 'Co-Author', 'Edit and publish'],
  ['editor', 'Editor', 'Edit content'],
  ['contributor', 'Contributor', 'Add media'],
  ['viewer', 'Viewer', 'Preview only'],
];

const PERMISSION_ITEMS = [
  ['editMedia', 'Edit Media', ImageIcon],
  ['editText', 'Edit Text', FileText],
  ['editStickers', 'Edit Stickers', Sticker],
  ['editDrawings', 'Edit Drawings', Palette],
  ['editMusic', 'Edit Music', Music],
  ['editFilters', 'Edit Filters', Palette],
  ['editCrop', 'Edit Crop', Edit3],
  ['publishStory', 'Publish Story', Check],
  ['inviteOthers', 'Invite Others', UserPlus],
  ['removeCollaborators', 'Remove Collaborators', Trash2],
  ['deleteStory', 'Delete Story', Trash2],
];

const APPROVAL_ITEMS = [
  ['publish', 'Require approval before publish'],
  ['media', 'Require approval for media changes'],
  ['text', 'Require approval for text changes'],
  ['music', 'Require approval for music changes'],
];

function ImageIcon(props) {
  return (
    <svg
      width={props.size || 17}
      height={props.size || 17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function normalizeUser(user, index) {
  return {
    ...user,
    id: user?.id || `collaborator-${index}`,
    name:
      user?.name ||
      user?.fullName ||
      user?.full_name ||
      user?.username ||
      'Aarush User',
    username: user?.username || 'user',
    avatar:
      user?.avatar ||
      user?.avatarUrl ||
      user?.avatar_url ||
      '',
    role: user?.role || 'viewer',
    status: user?.status || 'active',
    lastActiveAt:
      user?.lastActiveAt ||
      user?.last_active_at ||
      null,
  };
}

function roleLabel(role) {
  return (
    ROLES.find(([id]) => id === role)?.[1] ||
    'Viewer'
  );
}

function roleDescription(role) {
  return (
    ROLES.find(([id]) => id === role)?.[2] ||
    'Preview only'
  );
}

function formatDate(value) {
  if (!value) return 'Recently';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function StoryCollaborationManager({
  story = null,
  collaborators = [],
  currentUser = null,
  pendingInvites = [],
  permissions = {},
  onInviteCollaborator,
  onRemoveCollaborator,
  onChangeRole,
  onApproveChanges,
  onRejectChanges,
  onGenerateInviteLink,
  onRevokeInvite,
  onClose,
}) {
  const normalizedCollaborators = useMemo(
    () => collaborators.map(normalizeUser),
    [collaborators]
  );

  const [activeSection, setActiveSection] =
    useState('overview');
  const [inviteSearch, setInviteSearch] =
    useState('');
  const [selectedInvitees, setSelectedInvitees] =
    useState([]);
  const [inviteRole, setInviteRole] =
    useState('editor');
  const [inviteLink, setInviteLink] =
    useState('');
  const [linkExpiry, setLinkExpiry] =
    useState('7d');
  const [oneTimeLink, setOneTimeLink] =
    useState(false);
  const [notice, setNotice] = useState('');
  const [localPermissions, setLocalPermissions] =
    useState(permissions || {});
  const [approvalSettings, setApprovalSettings] =
    useState({});
  const [invitePanelOpen, setInvitePanelOpen] =
    useState(false);

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  }, []);

  const filteredInvitees = useMemo(() => {
    const query = inviteSearch.toLowerCase().trim();

    if (!query) return [];

    return normalizedCollaborators.filter((person) =>
      [
        person.name,
        person.username,
        person.phone,
        person.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [inviteSearch, normalizedCollaborators]);

  const toggleInvitee = useCallback((id) => {
    setSelectedInvitees((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }, []);

  const invitePeople = useCallback(() => {
    if (!selectedInvitees.length) {
      showNotice('Select at least one collaborator.');
      return;
    }

    onInviteCollaborator?.({
      storyId: story?.id,
      collaboratorIds: selectedInvitees,
      role: inviteRole,
    });

    setSelectedInvitees([]);
    setInviteSearch('');
    setInvitePanelOpen(false);
    showNotice('Collaboration invitations sent.');
  }, [
    inviteRole,
    onInviteCollaborator,
    selectedInvitees,
    showNotice,
    story?.id,
  ]);

  const generateLink = useCallback(async () => {
    const result = await onGenerateInviteLink?.({
      storyId: story?.id,
      expiresIn: linkExpiry,
      oneTime: oneTimeLink,
    });

    if (typeof result === 'string') {
      setInviteLink(result);
    } else if (result?.url) {
      setInviteLink(result.url);
    } else {
      setInviteLink(
        `https://aarush.app/collaborate/${story?.id || 'story'}`
      );
    }

    showNotice('Collaboration link generated.');
  }, [
    linkExpiry,
    onGenerateInviteLink,
    oneTimeLink,
    showNotice,
    story?.id,
  ]);

  const copyLink = useCallback(async () => {
    if (!inviteLink) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteLink);
        showNotice('Invite link copied.');
      }
    } catch {
      showNotice('Could not copy invite link.');
    }
  }, [inviteLink, showNotice]);

  const updatePermission = useCallback(
    (key, value) => {
      const next = {
        ...localPermissions,
        [key]: value,
      };

      setLocalPermissions(next);
      onChangeRole?.({
        storyId: story?.id,
        permissions: next,
      });
    },
    [localPermissions, onChangeRole, story?.id]
  );

  const updateApproval = useCallback((key, value) => {
    setApprovalSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const sections = [
    ['overview', 'Overview', Users],
    ['collaborators', 'Collaborators', Users],
    ['invites', 'Pending Invites', Send],
    ['permissions', 'Permissions', Shield],
    ['approvals', 'Approvals', Check],
    ['activity', 'Activity', MessageCircle],
    ['history', 'Version History', FileText],
  ];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close collaboration manager"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Story Collaboration</strong>
          <span>Build together in real time</span>
        </div>

        <button
          type="button"
          onClick={() => setInvitePanelOpen(true)}
          aria-label="Invite collaborator"
          style={styles.primaryIconButton}
        >
          <UserPlus size={18} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <section style={styles.overviewCard}>
          <div style={styles.storyIdentity}>
            <span style={styles.storyIcon}>
              <SparkleIcon />
            </span>

            <div>
              <strong>
                {story?.title ||
                  story?.caption ||
                  'Aarush Story'}
              </strong>
              <span>
                {story?.status || 'Collaboration active'}
              </span>
            </div>
          </div>

          <div style={styles.syncStatus}>
            <span style={styles.onlineDot} />
            Synced
          </div>

          <div style={styles.overviewGrid}>
            <span>
              Collaborators
              <strong>
                {normalizedCollaborators.length}
              </strong>
            </span>
            <span>
              Pending approvals
              <strong>
                {pendingInvites.length}
              </strong>
            </span>
            <span>
              Last edited
              <strong>
                {formatDate(story?.updatedAt)}
              </strong>
            </span>
          </div>
        </section>

        <div style={styles.sectionTabs}>
          {sections.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveSection(id)}
              aria-pressed={activeSection === id}
              style={{
                ...styles.sectionTab,
                ...(activeSection === id
                  ? styles.activeSectionTab
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {activeSection === 'overview' ? (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2>Collaboration overview</h2>
                <span>
                  Everyone’s work stays organized and
                  attributable.
                </span>
              </div>
              <Users size={19} color="#4dd7ff" />
            </div>

            <div style={styles.avatarStack}>
              {normalizedCollaborators
                .slice(0, 7)
                .map((person) => (
                  <Avatar
                    key={person.id}
                    user={person}
                  />
                ))}
            </div>

            <div style={styles.roleSummary}>
              {ROLES.map(([role, label]) => {
                const count =
                  normalizedCollaborators.filter(
                    (person) => person.role === role
                  ).length;

                return (
                  <span key={role}>
                    {label}
                    <strong>{count}</strong>
                  </span>
                );
              })}
            </div>

            <div style={styles.liveFoundation}>
              <span style={styles.liveDot} />
              Live cursors, typing indicators, conflict
              resolution, and active editing states prepared.
            </div>
          </section>
        ) : null}

        {activeSection === 'collaborators' ? (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2>Active collaborators</h2>
                <span>
                  Manage roles and contributor access.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setInvitePanelOpen(true)}
                style={styles.smallPrimary}
              >
                <Plus size={14} />
                Invite
              </button>
            </div>

            <div style={styles.peopleList}>
              {normalizedCollaborators.map((person) => (
                <div
                  key={person.id}
                  style={styles.personRow}
                >
                  <Avatar user={person} />

                  <div style={styles.personCopy}>
                    <strong>{person.name}</strong>
                    <span>
                      @{person.username} ·{' '}
                      {person.status}
                    </span>
                  </div>

                  <select
                    value={person.role}
                    onChange={(event) =>
                      onChangeRole?.({
                        storyId: story?.id,
                        collaboratorId: person.id,
                        role: event.target.value,
                      })
                    }
                    aria-label={`Role for ${person.name}`}
                    style={styles.roleSelect}
                  >
                    {ROLES.map(([role, label]) => (
                      <option value={role} key={role}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {person.id !== currentUser?.id &&
                  person.role !== 'owner' ? (
                    <button
                      type="button"
                      onClick={() =>
                        onRemoveCollaborator?.(person)
                      }
                      aria-label={`Remove ${person.name}`}
                      style={styles.removeButton}
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'invites' ? (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2>Pending invites</h2>
                <span>
                  Invitations waiting for a response.
                </span>
              </div>
              <Send size={18} color="#a895ff" />
            </div>

            {pendingInvites.length ? (
              <div style={styles.peopleList}>
                {pendingInvites.map((invite, index) => (
                  <div
                    key={invite.id || index}
                    style={styles.inviteRow}
                  >
                    <Avatar user={invite} />

                    <div style={styles.personCopy}>
                      <strong>
                        {invite.name ||
                          invite.username ||
                          'Aarush User'}
                      </strong>
                      <span>
                        Invited as{' '}
                        {roleLabel(invite.role || 'viewer')}
                      </span>
                    </div>

                    <span style={styles.pendingBadge}>
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <Empty label="No pending invites." />
            )}
          </section>
        ) : null}

        {activeSection === 'permissions' ? (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2>Permissions</h2>
                <span>
                  Configure what collaborators can change.
                </span>
              </div>
              <Shield size={18} color="#82e9c1" />
            </div>

            <div style={styles.permissionList}>
              {PERMISSION_ITEMS.map(
                ([key, label, Icon]) => (
                  <label
                    key={key}
                    style={styles.permissionRow}
                  >
                    <span>
                      <Icon size={15} />
                      {label}
                    </span>

                    <input
                      type="checkbox"
                      checked={Boolean(
                        localPermissions[key]
                      )}
                      onChange={(event) =>
                        updatePermission(
                          key,
                          event.target.checked
                        )
                      }
                    />
                  </label>
                )
              )}
            </div>
          </section>
        ) : null}

        {activeSection === 'approvals' ? (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2>Approval workflow</h2>
                <span>
                  Protect important changes before publishing.
                </span>
              </div>
              <Check size={18} color="#82e9c1" />
            </div>

            <div style={styles.permissionList}>
              {APPROVAL_ITEMS.map(([key, label]) => (
                <label
                  key={key}
                  style={styles.permissionRow}
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(
                      approvalSettings[key]
                    )}
                    onChange={(event) =>
                      updateApproval(
                        key,
                        event.target.checked
                      )
                    }
                  />
                </label>
              ))}
            </div>

            <div style={styles.approvalList}>
              {(story?.pendingApprovals || []).map(
                (approval, index) => (
                  <div
                    key={approval.id || index}
                    style={styles.approvalCard}
                  >
                    <div>
                      <strong>
                        {approval.title ||
                          'Change requires approval'}
                      </strong>
                      <span>
                        By {approval.userName || 'Contributor'} ·{' '}
                        {formatDate(approval.createdAt)}
                      </span>
                    </div>

                    <div style={styles.approvalActions}>
                      <button
                        type="button"
                        onClick={() =>
                          onApproveChanges?.(approval)
                        }
                        style={styles.approveButton}
                      >
                        <Check size={14} />
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onRejectChanges?.(approval)
                        }
                        style={styles.rejectButton}
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        ) : null}

        {activeSection === 'activity' ? (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2>Activity feed</h2>
                <span>Recent collaboration events.</span>
              </div>
              <MessageCircle size={18} color="#ff9f72" />
            </div>

            <div style={styles.activityList}>
              {(story?.activity || []).length ? (
                story.activity.map((event, index) => (
                  <div
                    key={event.id || index}
                    style={styles.activityRow}
                  >
                    <span style={styles.activityDot} />
                    <div>
                      <strong>
                        {event.message ||
                          'Collaboration activity'}
                      </strong>
                      <span>
                        {formatDate(event.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <Empty label="No activity yet." />
              )}
            </div>
          </section>
        ) : null}

        {activeSection === 'history' ? (
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2>Version history</h2>
                <span>
                  Previous edits and restore foundation.
                </span>
              </div>
              <FileText size={18} color="#9deeff" />
            </div>

            <div style={styles.historyList}>
              {(story?.versions || []).length ? (
                story.versions.map((version, index) => (
                  <div
                    key={version.id || index}
                    style={styles.historyRow}
                  >
                    <span style={styles.versionNumber}>
                      v{version.version || index + 1}
                    </span>

                    <div style={styles.personCopy}>
                      <strong>
                        {version.summary ||
                          'Story updated'}
                      </strong>
                      <span>
                        {version.editorName ||
                          'Collaborator'}{' '}
                        · {formatDate(version.createdAt)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        showNotice(
                          'Version restore prepared.'
                        )
                      }
                      style={styles.restoreButton}
                    >
                      Restore
                    </button>
                  </div>
                ))
              ) : (
                <Empty label="No previous versions yet." />
              )}
            </div>
          </section>
        ) : null}

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2>Invite link</h2>
              <span>
                Share a controlled collaboration invitation.
              </span>
            </div>
            <Link2 size={18} color="#4dd7ff" />
          </div>

          {inviteLink ? (
            <div style={styles.linkRow}>
              <input
                readOnly
                value={inviteLink}
                aria-label="Collaboration invite link"
                style={styles.linkInput}
              />

              <button
                type="button"
                onClick={copyLink}
                aria-label="Copy invite link"
                style={styles.smallIconButton}
              >
                <CopyIcon />
              </button>

              <button
                type="button"
                onClick={() => {
                  onRevokeInvite?.(inviteLink);
                  setInviteLink('');
                  showNotice('Invite link revoked.');
                }}
                aria-label="Revoke invite link"
                style={styles.removeButton}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <div style={styles.linkControls}>
              <select
                value={linkExpiry}
                onChange={(event) =>
                  setLinkExpiry(event.target.value)
                }
                aria-label="Invite link expiry"
                style={styles.roleSelect}
              >
                <option value="1h">1 hour</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="never">Never</option>
              </select>

              <label style={styles.oneTimeOption}>
                <input
                  type="checkbox"
                  checked={oneTimeLink}
                  onChange={(event) =>
                    setOneTimeLink(
                      event.target.checked
                    )
                  }
                />
                One-time link
              </label>

              <button
                type="button"
                onClick={generateLink}
                style={styles.smallPrimary}
              >
                <Link2 size={14} />
                Generate
              </button>

              <button
                type="button"
                onClick={() =>
                  showNotice('QR code foundation ready.')
                }
                aria-label="Show QR code"
                style={styles.smallIconButton}
              >
                <QrCode size={15} />
              </button>
            </div>
          )}
        </section>
      </div>

      {invitePanelOpen ? (
        <div style={styles.modalBackdrop}>
          <section style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong>Invite Collaborators</strong>
              <button
                type="button"
                onClick={() => setInvitePanelOpen(false)}
                aria-label="Close invite panel"
                style={styles.iconButton}
              >
                <X size={16} />
              </button>
            </div>

            <div style={styles.searchBox}>
              <Search size={15} />
              <input
                autoFocus
                value={inviteSearch}
                onChange={(event) =>
                  setInviteSearch(event.target.value)
                }
                placeholder="Username, name, phone, email"
                aria-label="Search collaborators"
                style={styles.searchInput}
              />
            </div>

            <select
              value={inviteRole}
              onChange={(event) =>
                setInviteRole(event.target.value)
              }
              aria-label="Collaborator role"
              style={styles.select}
            >
              {ROLES.filter(
                ([role]) => role !== 'owner'
              ).map(([role, label]) => (
                <option value={role} key={role}>
                  Invite as {label}
                </option>
              ))}
            </select>

            <div style={styles.inviteResults}>
              {filteredInvitees.length ? (
                filteredInvitees.map((person) => {
                  const selected =
                    selectedInvitees.includes(person.id);

                  return (
                    <button
                      type="button"
                      key={person.id}
                      onClick={() =>
                        toggleInvitee(person.id)
                      }
                      aria-pressed={selected}
                      style={{
                        ...styles.personRow,
                        ...(selected
                          ? styles.selectedPerson
                          : {}),
                      }}
                    >
                      <Avatar
                        user={person}
                        size="2.5rem"
                      />

                      <div style={styles.personCopy}>
                        <strong>{person.name}</strong>
                        <span>
                          @{person.username}
                        </span>
                      </div>

                      <span
                        style={{
                          ...styles.checkbox,
                          ...(selected
                            ? styles.checkedBox
                            : {}),
                        }}
                      >
                        {selected ? (
                          <Check size={14} />
                        ) : null}
                      </span>
                    </button>
                  );
                })
              ) : (
                <Empty label="Search contacts to invite." />
              )}
            </div>

            <button
              type="button"
              onClick={invitePeople}
              disabled={!selectedInvitees.length}
              style={styles.primaryButton}
            >
              <Send size={15} />
              Send Invitations
            </button>
          </section>
        </div>
      ) : null}

      <style>{`
        @keyframes aarush-collab-slide {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-collab-tab:hover,
        .aarush-collab-person:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 560px) {
          .aarush-collab-tabs {
            grid-template-columns: repeat(3,1fr) !important;
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

function Avatar({ user, size = '2.9rem' }) {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt=""
        loading="lazy"
        style={{
          ...styles.avatar,
          width: size,
          height: size,
        }}
      />
    );
  }

  return (
    <span
      style={{
        ...styles.avatarFallback,
        width: size,
        height: size,
      }}
    >
      {String(user?.name || 'A')
        .charAt(0)
        .toUpperCase()}
    </span>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Users size={23} />
      <span>{label}</span>
    </div>
  );
}

function SparkleIcon() {
  return <SparklesIconSvg />;
}

function SparklesIconSvg() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5Z" />
      <path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7Z" />
    </svg>
  );
}

function CopyIcon() {
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
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.52),#07090e 68%)',
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

  heading: {
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
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

  primaryIconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  content: {
    width: 'min(100%, 900px)',
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

  overviewCard: {
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.24)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.14),rgba(77,215,255,.06))',
    boxShadow: '0 18px 52px rgba(0,0,0,.2)',
  },

  storyIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
  },

  storyIcon: {
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.8rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  storyIdentityDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  storyIdentitySpan: {
    color: '#91a0bc',
    fontSize: '.63rem',
  },

  syncStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    marginTop: '.7rem',
    color: '#82e9c1',
    fontSize: '.62rem',
  },

  onlineDot: {
    width: '.45rem',
    height: '.45rem',
    borderRadius: '999px',
    background: '#82e9c1',
    boxShadow: '0 0 10px #82e9c1',
  },

  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.5rem',
    marginTop: '.85rem',
    paddingTop: '.75rem',
    borderTop: '1px solid rgba(255,255,255,.09)',
  },

  overviewGridSpan: {
    display: 'grid',
    gap: '.2rem',
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  overviewGridStrong: {
    color: '#fff',
    fontSize: '.82rem',
  },

  sectionTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.35rem',
  },

  sectionTab: {
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
    transition: 'all 180ms ease',
  },

  activeSectionTab: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  card: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-collab-slide 240ms ease both',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.7rem',
  },

  cardHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  cardHeaderH2: {
    margin: 0,
    fontSize: '.85rem',
  },

  cardHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  smallPrimary: {
    minHeight: '2.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .6rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.62rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  avatarStack: {
    display: 'flex',
    paddingLeft: '.5rem',
  },

  avatar: {
    objectFit: 'cover',
    marginLeft: '-.5rem',
    border: '2px solid #111827',
    borderRadius: '999px',
  },

  avatarFallback: {
    display: 'grid',
    placeItems: 'center',
    marginLeft: '-.5rem',
    border: '2px solid #111827',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  roleSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5,1fr)',
    gap: '.35rem',
    marginTop: '.8rem',
  },

  roleSummarySpan: {
    display: 'grid',
    gap: '.18rem',
    color: '#91a0bc',
    fontSize: '.56rem',
    textAlign: 'center',
  },

  roleSummaryStrong: {
    color: '#fff',
    fontSize: '.78rem',
  },

  liveFoundation: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.8rem',
    padding: '.6rem',
    borderRadius: '.7rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.61rem',
  },

  liveDot: {
    width: '.45rem',
    height: '.45rem',
    borderRadius: '999px',
    background: '#4dd7ff',
    boxShadow: '0 0 10px #4dd7ff',
  },

  peopleList: {
    display: 'grid',
    gap: '.45rem',
  },

  personRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
  },

  selectedPerson: {
    borderColor: 'rgba(77,215,255,.35)',
    background: 'rgba(77,215,255,.07)',
  },

  personCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  personCopySpan: {
    color: '#91a0bc',
    fontSize: '.6rem',
  },

  roleSelect: {
    minHeight: '2.2rem',
    maxWidth: '7rem',
    padding: '0 .4rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    outline: 0,
    color: '#cbd6ec',
    background: '#151c2c',
    fontSize: '.6rem',
  },

  removeButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,91,132,.2)',
    borderRadius: '999px',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    cursor: 'pointer',
  },

  pendingBadge: {
    padding: '.3rem .4rem',
    borderRadius: '999px',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.1)',
    fontSize: '.55rem',
    fontWeight: 800,
  },

  permissionList: {
    display: 'grid',
    gap: '.35rem',
  },

  permissionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    minHeight: '2.4rem',
    padding: '0 .55rem',
    borderRadius: '.65rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.63rem',
  },

  permissionRowSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.35rem',
  },

  approvalList: {
    display: 'grid',
    gap: '.45rem',
    marginTop: '.75rem',
  },

  approvalCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.55rem',
    padding: '.65rem',
    border: '1px solid rgba(255,210,125,.18)',
    borderRadius: '.75rem',
    background: 'rgba(255,210,125,.06)',
  },

  approvalCardDiv: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
  },

  approvalCardSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  approvalActions: {
    display: 'flex',
    gap: '.3rem',
  },

  approveButton: {
    minHeight: '2.1rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    padding: '0 .45rem',
    border: 0,
    borderRadius: '.55rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.12)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  rejectButton: {
    minHeight: '2.1rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    padding: '0 .45rem',
    border: 0,
    borderRadius: '.55rem',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.1)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activityList: {
    display: 'grid',
    gap: '.5rem',
  },

  activityRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '.55rem',
    padding: '.5rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
  },

  activityDot: {
    width: '.5rem',
    height: '.5rem',
    marginTop: '.25rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: '#4dd7ff',
    boxShadow: '0 0 10px #4dd7ff',
  },

  activityRowDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  activityRowSpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  historyList: {
    display: 'grid',
    gap: '.4rem',
  },

  historyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  versionNumber: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.65rem',
    fontWeight: 800,
  },

  restoreButton: {
    minHeight: '2.1rem',
    padding: '0 .5rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '.55rem',
    color: '#c8bcff',
    background: 'rgba(124,92,255,.1)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  linkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
  },

  linkInput: {
    minWidth: 0,
    minHeight: '2.4rem',
    flex: 1,
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    outline: 0,
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.61rem',
  },

  linkControls: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '.4rem',
  },

  oneTimeOption: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.6rem',
  },

  smallIconButton: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.6rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.65rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.75rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
  },

  searchInput: {
    minWidth: 0,
    minHeight: '2.45rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.68rem',
  },

  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '.8rem',
    background: 'rgba(2,5,10,.72)',
    backdropFilter: 'blur(10px)',
  },

  modal: {
    width: 'min(100%, 470px)',
    display: 'grid',
    gap: '.7rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  inviteResults: {
    display: 'grid',
    gap: '.4rem',
    maxHeight: '17rem',
    overflowY: 'auto',
  },

  selectedContact: {
    borderColor: 'rgba(77,215,255,.38)',
    background: 'rgba(77,215,255,.08)',
  },

  checkbox: {
    width: '1.4rem',
    height: '1.4rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.2)',
    borderRadius: '.4rem',
    color: '#fff',
  },

  checkedBox: {
    borderColor: '#4dd7ff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  empty: {
    minHeight: '5rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.35rem',
    color: '#91a0bc',
    fontSize: '.64rem',
    textAlign: 'center',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    padding: '0 .8rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },
};