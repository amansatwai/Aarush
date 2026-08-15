import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Briefcase,
  Check,
  ChevronRight,
  Crown,
  Heart,
  Home,
  Lock,
  Moon,
  Plus,
  Search,
  Shield,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react';

const DEFAULT_CIRCLES = [
  {
    id: 'close-friends',
    name: 'Close Friends',
    color: '#82e9c1',
    icon: 'heart',
    builtIn: true,
    memberIds: [],
    privacy: {},
  },
  {
    id: 'family',
    name: 'Family',
    color: '#ff9f72',
    icon: 'home',
    builtIn: true,
    memberIds: [],
    privacy: {},
  },
  {
    id: 'trusted-contacts',
    name: 'Trusted Contacts',
    color: '#4dd7ff',
    icon: 'shield',
    builtIn: true,
    memberIds: [],
    privacy: {},
  },
  {
    id: 'work',
    name: 'Work',
    color: '#a895ff',
    icon: 'briefcase',
    builtIn: true,
    memberIds: [],
    privacy: {},
  },
  {
    id: 'favorites',
    name: 'Favorites',
    color: '#ff6d9a',
    icon: 'star',
    builtIn: true,
    memberIds: [],
    privacy: {},
  },
];

const COLORS = [
  '#82e9c1',
  '#7c5cff',
  '#4dd7ff',
  '#9deeff',
  '#ff4fd8',
  '#ff9f72',
  '#ffd27d',
  '#ff5b84',
  '#35c98b',
  '#a895ff',
];

const ICONS = [
  ['star', Star],
  ['heart', Heart],
  ['shield', Shield],
  ['crown', Crown],
  ['home', Home],
  ['briefcase', Briefcase],
  ['users', Users],
  ['sparkles', Sparkles],
  ['lock', Lock],
  ['moon', Moon],
];

const PRIVACY_DEFAULTS = {
  allowReplies: true,
  allowReactions: true,
  allowResharing: false,
  allowScreenshots: false,
  allowDownloads: false,
  hideViewerList: false,
  expiringMembership: false,
};

function normalizeCircle(circle, index) {
  return {
    ...circle,
    id: circle?.id || `circle-${index}`,
    name: circle?.name || 'Private Circle',
    color: circle?.color || COLORS[index % COLORS.length],
    icon: circle?.icon || 'users',
    builtIn: Boolean(circle?.builtIn),
    memberIds: Array.isArray(circle?.memberIds)
      ? circle.memberIds
      : Array.isArray(circle?.member_ids)
        ? circle.member_ids
        : [],
    privacy: {
      ...PRIVACY_DEFAULTS,
      ...(circle?.privacy || {}),
    },
  };
}

function normalizeContact(contact, index) {
  return {
    ...contact,
    id: contact?.id || `contact-${index}`,
    username: contact?.username || 'user',
    fullName:
      contact?.fullName ||
      contact?.full_name ||
      contact?.username ||
      'Aarush User',
    avatar:
      contact?.avatar ||
      contact?.avatarUrl ||
      contact?.avatar_url ||
      '',
  };
}

function iconFor(name) {
  return ICONS.find(([id]) => id === name)?.[1] || Users;
}

export default function StoryCloseFriendsManager({
  circles = [],
  contacts = [],
  selectedCircle = null,
  onCreateCircle,
  onRenameCircle,
  onDeleteCircle,
  onAddMembers,
  onRemoveMembers,
  onChangePrivacy,
  onClose,
}) {
  const normalizedCircles = useMemo(
    () => [
      ...DEFAULT_CIRCLES,
      ...circles.map(normalizeCircle),
    ],
    [circles]
  );

  const normalizedContacts = useMemo(
    () => contacts.map(normalizeContact),
    [contacts]
  );

  const [activeId, setActiveId] = useState(
    selectedCircle?.id ||
      normalizedCircles[0]?.id ||
      null
  );
  const [contactSearch, setContactSearch] =
    useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] =
    useState(COLORS[0]);
  const [newIcon, setNewIcon] = useState('heart');
  const [memberSelection, setMemberSelection] =
    useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] =
    useState('');
  const [deleteTarget, setDeleteTarget] =
    useState(null);
  const [notice, setNotice] = useState('');

  const activeCircle = useMemo(
    () =>
      normalizedCircles.find(
        (circle) => circle.id === activeId
      ) || null,
    [activeId, normalizedCircles]
  );

  const members = useMemo(() => {
    if (!activeCircle) return [];

    return normalizedContacts.filter((contact) =>
      activeCircle.memberIds.includes(contact.id)
    );
  }, [activeCircle, normalizedContacts]);

  const filteredContacts = useMemo(() => {
    const query = contactSearch.trim().toLowerCase();

    if (!query) return normalizedContacts;

    return normalizedContacts.filter((contact) =>
      [
        contact.username,
        contact.fullName,
        contact.phone,
        contact.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [contactSearch, normalizedContacts]);

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  }, []);

  const toggleMember = useCallback((id) => {
    setMemberSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }, []);

  const selectAllMembers = useCallback(() => {
    setMemberSelection(
      filteredContacts.map((contact) => contact.id)
    );
  }, [filteredContacts]);

  const clearMembers = useCallback(() => {
    setMemberSelection([]);
  }, []);

  const createCircle = useCallback(() => {
    const name = newName.trim();

    if (!name) {
      showNotice('Enter a circle name.');
      return;
    }

    const circle = {
      id: `circle-${Date.now()}`,
      name,
      color: newColor,
      icon: newIcon,
      memberIds: memberSelection,
      privacy: {
        ...PRIVACY_DEFAULTS,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      builtIn: false,
    };

    onCreateCircle?.(circle);
    setCreating(false);
    setNewName('');
    setMemberSelection([]);
    showNotice('Private circle created.');
  }, [
    memberSelection,
    newColor,
    newIcon,
    newName,
    onCreateCircle,
    showNotice,
  ]);

  const renameCircle = useCallback(() => {
    if (!activeCircle || activeCircle.builtIn) {
      return;
    }

    const name = editingName.trim();

    if (!name) {
      showNotice('Enter a circle name.');
      return;
    }

    onRenameCircle?.({
      ...activeCircle,
      name,
      updatedAt: new Date().toISOString(),
    });

    setEditingId(null);
    setEditingName('');
    showNotice('Circle renamed.');
  }, [
    activeCircle,
    editingName,
    onRenameCircle,
    showNotice,
  ]);

  const deleteCircle = useCallback(() => {
    if (!deleteTarget || deleteTarget.builtIn) {
      return;
    }

    onDeleteCircle?.(deleteTarget);
    setDeleteTarget(null);
    showNotice('Circle deleted.');
  }, [deleteTarget, onDeleteCircle, showNotice]);

  const updatePrivacy = useCallback(
    (key, value) => {
      if (!activeCircle) return;

      onChangePrivacy?.({
        circleId: activeCircle.id,
        privacy: {
          ...activeCircle.privacy,
          [key]: value,
        },
      });
    },
    [activeCircle, onChangePrivacy]
  );

  const addSelectedMembers = useCallback(() => {
    if (!activeCircle || !memberSelection.length) {
      showNotice('Select contacts first.');
      return;
    }

    onAddMembers?.({
      circleId: activeCircle.id,
      memberIds: memberSelection,
    });

    setMemberSelection([]);
    showNotice('Members added.');
  }, [
    activeCircle,
    memberSelection,
    onAddMembers,
    showNotice,
  ]);

  const removeMember = useCallback(
    (contact) => {
      if (!activeCircle) return;

      onRemoveMembers?.({
        circleId: activeCircle.id,
        memberIds: [contact.id],
      });

      showNotice('Member removed.');
    },
    [activeCircle, onRemoveMembers, showNotice]
  );

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close private circles manager"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Private Circles</strong>
          <span>Choose who sees your stories</span>
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          aria-label="Create private circle"
          style={styles.primaryIconButton}
        >
          <Plus size={18} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h1 style={styles.sectionTitle}>
                Your Private Circles
              </h1>
              <p style={styles.sectionSubtitle}>
                Create unlimited private story audiences.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreating(true)}
              style={styles.textButton}
            >
              <Plus size={15} />
              New
            </button>
          </div>

          <div style={styles.circleGrid}>
            {normalizedCircles.map((circle) => {
              const Icon = iconFor(circle.icon);
              const active = circle.id === activeId;

              return (
                <button
                  type="button"
                  key={circle.id}
                  onClick={() => setActiveId(circle.id)}
                  aria-pressed={active}
                  style={{
                    ...styles.circleCard,
                    ...(active
                      ? styles.activeCircleCard
                      : {}),
                  }}
                >
                  <span
                    style={{
                      ...styles.circleIcon,
                      background: circle.color,
                    }}
                  >
                    <Icon size={21} />
                  </span>

                  <strong>{circle.name}</strong>
                  <span>
                    {circle.memberIds.length} members
                  </span>

                  {circle.builtIn ? (
                    <small>Default</small>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        {activeCircle ? (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  {activeCircle.name}
                </h2>
                <p style={styles.sectionSubtitle}>
                  {members.length} trusted members
                </p>
              </div>

              <div style={styles.headerActions}>
                {!activeCircle.builtIn ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(activeCircle.id);
                        setEditingName(
                          activeCircle.name
                        );
                      }}
                      aria-label="Rename circle"
                      style={styles.iconButton}
                    >
                      <PencilIcon size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget(activeCircle)
                      }
                      aria-label="Delete circle"
                      style={styles.deleteIconButton}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {editingId === activeCircle.id ? (
              <div style={styles.inlineEdit}>
                <input
                  autoFocus
                  value={editingName}
                  onChange={(event) =>
                    setEditingName(event.target.value)
                  }
                  aria-label="Circle name"
                  style={styles.textInput}
                />

                <button
                  type="button"
                  onClick={renameCircle}
                  style={styles.primarySmall}
                >
                  <Check size={14} />
                  Save
                </button>
              </div>
            ) : null}

            <div style={styles.audienceCard}>
              <div style={styles.avatarStack}>
                {members.slice(0, 5).map((member) => (
                  <Avatar
                    key={member.id}
                    contact={member}
                  />
                ))}

                {!members.length ? (
                  <span style={styles.emptyAvatar}>
                    <UserRound size={20} />
                  </span>
                ) : null}
              </div>

              <div style={styles.audienceCopy}>
                <strong>Story audience preview</strong>
                <span>
                  Only members of this circle can see
                  private stories.
                </span>
              </div>

              <ChevronRight size={16} />
            </div>

            <div style={styles.memberHeader}>
              <strong>Members</strong>
              <span>{members.length} total</span>
            </div>

            <div style={styles.memberList}>
              {members.length ? (
                members.map((member) => (
                  <div
                    key={member.id}
                    style={styles.memberRow}
                  >
                    <Avatar
                      contact={member}
                      size="2.6rem"
                    />

                    <span style={styles.memberCopy}>
                      <strong>
                        {member.fullName}
                      </strong>
                      <span>
                        @{member.username}
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => removeMember(member)}
                      aria-label={`Remove ${member.fullName}`}
                      style={styles.removeButton}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <Users size={27} />
                  <span>
                    No members in this circle yet.
                  </span>
                </div>
              )}
            </div>

            <div style={styles.memberHeader}>
              <div>
                <strong>Add members</strong>
                <span style={styles.memberHeaderHint}>
                  Search by username, name, phone, or email
                </span>
              </div>

              <div style={styles.selectionActions}>
                <button
                  type="button"
                  onClick={selectAllMembers}
                  style={styles.smallTextButton}
                >
                  Select all
                </button>

                <button
                  type="button"
                  onClick={clearMembers}
                  style={styles.smallTextButton}
                >
                  Clear
                </button>
              </div>
            </div>

            <div style={styles.searchBox}>
              <Search size={16} />
              <input
                value={contactSearch}
                onChange={(event) =>
                  setContactSearch(event.target.value)
                }
                placeholder="Search contacts"
                aria-label="Search contacts"
                style={styles.searchInput}
              />
            </div>

            <div style={styles.contactList}>
              {filteredContacts.map((contact) => {
                const selected = memberSelection.includes(
                  contact.id
                );

                return (
                  <button
                    type="button"
                    key={contact.id}
                    onClick={() => toggleMember(contact.id)}
                    aria-pressed={selected}
                    style={{
                      ...styles.contactRow,
                      ...(selected
                        ? styles.selectedContact
                        : {}),
                    }}
                  >
                    <Avatar
                      contact={contact}
                      size="2.55rem"
                    />

                    <span style={styles.memberCopy}>
                      <strong>
                        {contact.fullName}
                      </strong>
                      <span>
                        @{contact.username}
                      </span>
                    </span>

                    <span
                      style={{
                        ...styles.checkbox,
                        ...(selected
                          ? styles.checkedBox
                          : {}),
                      }}
                    >
                      {selected ? <Check size={14} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!memberSelection.length}
              onClick={addSelectedMembers}
              style={styles.primaryButton}
            >
              <Plus size={16} />
              Add selected members
            </button>

            <section style={styles.settingsCard}>
              <div style={styles.settingsHeading}>
                <Shield size={16} />
                <strong>Circle Privacy</strong>
              </div>

              {[
                ['allowReplies', 'Allow replies'],
                ['allowReactions', 'Allow reactions'],
                ['allowResharing', 'Allow resharing'],
                [
                  'allowScreenshots',
                  'Allow screenshots foundation',
                ],
                [
                  'allowDownloads',
                  'Allow downloads foundation',
                ],
                [
                  'hideViewerList',
                  'Hide viewer list foundation',
                ],
                [
                  'expiringMembership',
                  'Expiring membership',
                ],
              ].map(([key, label]) => (
                <label
                  key={key}
                  style={styles.settingRow}
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(
                      activeCircle.privacy?.[key]
                    )}
                    onChange={(event) =>
                      updatePrivacy(
                        key,
                        event.target.checked
                      )
                    }
                  />
                </label>
              ))}
            </section>
          </section>
        ) : null}
      </div>

      {creating ? (
        <div style={styles.modalBackdrop}>
          <section style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong>Create Private Circle</strong>
              <button
                type="button"
                onClick={() => setCreating(false)}
                aria-label="Close create circle"
                style={styles.iconButton}
              >
                <X size={16} />
              </button>
            </div>

            <label style={styles.field}>
              Circle name
              <input
                autoFocus
                value={newName}
                onChange={(event) =>
                  setNewName(event.target.value)
                }
                placeholder="Best friends, Team, Family"
                style={styles.textInput}
              />
            </label>

            <div style={styles.field}>
              Circle color
              <div style={styles.colorRow}>
                {COLORS.map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-label={`Use circle color ${value}`}
                    onClick={() => setNewColor(value)}
                    style={{
                      ...styles.colorButton,
                      background: value,
                      ...(newColor === value
                        ? styles.selectedColor
                        : {}),
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={styles.field}>
              Circle icon
              <div style={styles.iconGrid}>
                {ICONS.map(([id, Icon]) => (
                  <button
                    type="button"
                    key={id}
                    aria-label={`Use ${id} icon`}
                    onClick={() => setNewIcon(id)}
                    style={{
                      ...styles.circleIconChoice,
                      ...(newIcon === id
                        ? styles.selectedIcon
                        : {}),
                    }}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setCreating(false)}
                style={styles.secondaryButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createCircle}
                style={styles.primaryButton}
              >
                <Check size={15} />
                Create Circle
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {deleteTarget ? (
        <div style={styles.modalBackdrop}>
          <section style={styles.confirmModal}>
            <Trash2 size={28} color="#ff9fba" />
            <strong>Delete private circle?</strong>
            <p>
              Members will no longer be grouped in this
              circle. Built-in circles cannot be deleted.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={styles.secondaryButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteCircle}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <style>{`
        @keyframes aarush-circles-slide {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-circle-card:hover,
        .aarush-contact-row:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 520px) {
          .aarush-circle-grid {
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-icon-grid {
            grid-template-columns: repeat(5,1fr) !important;
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

function Avatar({ contact, size = '3rem' }) {
  if (contact?.avatar) {
    return (
      <img
        src={contact.avatar}
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
      {(contact?.fullName || 'A').charAt(0).toUpperCase()}
    </span>
  );
}

function PencilIcon(props) {
  return <EditIcon {...props} />;
}

function EditIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
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

  section: {
    padding: '1rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.3rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 18px 52px rgba(0,0,0,.2)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.6rem',
    marginBottom: '.75rem',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '.95rem',
    fontWeight: 850,
  },

  sectionSubtitle: {
    margin: '.2rem 0 0',
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  circleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5,1fr)',
    gap: '.5rem',
  },

  circleCard: {
    minWidth: 0,
    display: 'grid',
    justifyItems: 'center',
    gap: '.3rem',
    padding: '.65rem .25rem',
    border: '1px solid transparent',
    borderRadius: '1rem',
    color: '#dce5f8',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'transform 180ms ease, background 180ms ease',
  },

  activeCircleCard: {
    borderColor: 'rgba(124,92,255,.38)',
    background: 'rgba(124,92,255,.1)',
  },

  circleIcon: {
    width: '3.4rem',
    height: '3.4rem',
    display: 'grid',
    placeItems: 'center',
    border: '3px solid rgba(255,255,255,.18)',
    borderRadius: '999px',
    color: '#fff',
    boxShadow: '0 0 22px rgba(124,92,255,.16)',
  },

  circleCardStrong: {
    maxWidth: '100%',
    overflow: 'hidden',
    fontSize: '.65rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  circleCardSpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  circleCardSmall: {
    color: '#82e9c1',
    fontSize: '.52rem',
    fontWeight: 800,
  },

  headerActions: {
    display: 'flex',
    gap: '.3rem',
  },

  deleteIconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,91,132,.2)',
    borderRadius: '999px',
    color: '#ffb1c8',
    background: 'rgba(255,91,132,.08)',
    cursor: 'pointer',
  },

  inlineEdit: {
    display: 'flex',
    gap: '.4rem',
    marginBottom: '.7rem',
  },

  textInput: {
    minWidth: 0,
    minHeight: '2.45rem',
    flex: 1,
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.7rem',
  },

  primarySmall: {
    minHeight: '2.35rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.3rem',
    padding: '0 .65rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.62rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  audienceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '.6rem',
    padding: '.75rem',
    border: '1px solid rgba(130,233,193,.18)',
    borderRadius: '.9rem',
    background: 'rgba(130,233,193,.06)',
  },

  avatarStack: {
    display: 'flex',
    minWidth: '4.2rem',
    paddingLeft: '.45rem',
  },

  avatar: {
    objectFit: 'cover',
    marginLeft: '-.45rem',
    border: '2px solid #111827',
    borderRadius: '999px',
  },

  avatarFallback: {
    display: 'grid',
    placeItems: 'center',
    marginLeft: '-.45rem',
    border: '2px solid #111827',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  emptyAvatar: {
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#9deeff',
    background: '#17233d',
  },

  audienceCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.2rem',
    flex: 1,
  },

  audienceCopySpan: {
    color: '#91a0bc',
    fontSize: '.62rem',
    lineHeight: 1.4,
  },

  memberHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginTop: '1rem',
    marginBottom: '.55rem',
    color: '#aab6cf',
    fontSize: '.65rem',
  },

  memberHeaderHint: {
    display: 'block',
    marginTop: '.2rem',
    color: '#71809a',
    fontSize: '.57rem',
  },

  selectionActions: {
    display: 'flex',
    gap: '.3rem',
  },

  smallTextButton: {
    border: 0,
    color: '#9deeff',
    background: 'transparent',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  memberList: {
    display: 'grid',
    gap: '.4rem',
  },

  memberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.5rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    background: 'rgba(255,255,255,.035)',
  },

  memberCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.15rem',
    flex: 1,
  },

  memberCopySpan: {
    color: '#91a0bc',
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

  contactList: {
    display: 'grid',
    gap: '.4rem',
    maxHeight: '17rem',
    overflowY: 'auto',
  },

  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.5rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  selectedContact: {
    borderColor: 'rgba(77,215,255,.38)',
    background: 'rgba(77,215,255,.08)',
  },

  checkbox: {
    width: '1.45rem',
    height: '1.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.24)',
    borderRadius: '.45rem',
    color: '#fff',
  },

  checkedBox: {
    borderColor: '#4dd7ff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.65rem',
    marginBottom: '.65rem',
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

  settingsCard: {
    display: 'grid',
    gap: '.65rem',
    marginTop: '.8rem',
    padding: '.75rem',
    border: '1px solid rgba(124,92,255,.18)',
    borderRadius: '.9rem',
    background: 'rgba(124,92,255,.06)',
  },

  settingsHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    color: '#dce5f8',
    fontSize: '.7rem',
  },

  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    color: '#aab6cf',
    fontSize: '.63rem',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.64rem',
  },

  colorRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.4rem',
  },

  colorButton: {
    width: '1.7rem',
    height: '1.7rem',
    border: '2px solid transparent',
    borderRadius: '999px',
    cursor: 'pointer',
  },

  selectedColor: {
    borderColor: '#fff',
    boxShadow: '0 0 0 2px #7c5cff',
  },

  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10,1fr)',
    gap: '.35rem',
  },

  circleIconChoice: {
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.6rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    cursor: 'pointer',
  },

  selectedIcon: {
    borderColor: '#4dd7ff',
    color: '#fff',
    background: 'rgba(77,215,255,.12)',
  },

  emptyState: {
    minHeight: '8rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.4rem',
    color: '#91a0bc',
    textAlign: 'center',
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
    width: 'min(100%, 460px)',
    display: 'grid',
    gap: '.75rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
  },

  confirmModal: {
    width: 'min(100%, 360px)',
    display: 'grid',
    justifyItems: 'center',
    gap: '.65rem',
    padding: '1.25rem',
    border: '1px solid rgba(255,91,132,.25)',
    borderRadius: '1.2rem',
    color: '#f4f7ff',
    background:
      'linear-gradient(180deg,#241722,#0e1320)',
    textAlign: 'center',
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '.4rem',
    marginTop: '.35rem',
  },

  primaryButton: {
    minHeight: '2.65rem',
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

  secondaryButton: {
    minHeight: '2.65rem',
    padding: '0 .8rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.68rem',
    cursor: 'pointer',
  },

  deleteButton: {
    minHeight: '2.65rem',
    padding: '0 .8rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background: '#d94b71',
    fontSize: '.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },
};