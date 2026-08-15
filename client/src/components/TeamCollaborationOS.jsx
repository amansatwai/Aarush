import { useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  FolderOpen,
  Grid3X3,
  Hash,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Send,
  Sparkles,
  Target,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', Users],
  ['channels', 'Channels', Hash],
  ['documents', 'Documents', FileText],
  ['tasks', 'Tasks', Target],
  ['meetings', 'Meetings', Video],
  ['whiteboards', 'Whiteboards', Grid3X3],
  ['files', 'Files', FolderOpen],
  ['approvals', 'Approvals', Check],
  ['activity', 'Activity', Activity],
  ['assistant', 'AI Assistant', Sparkles],
];

const TASK_STATUSES = [
  'Backlog',
  'Todo',
  'In Progress',
  'Review',
  'Done',
];

const APPROVAL_STAGES = [
  'Draft',
  'Review',
  'Approved',
  'Rejected',
  'Published',
];

function numeric(value) {
  return Number(value) || 0;
}

function formatDate(value) {
  if (!value) return 'Not set';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizeTask(task, index) {
  return {
    ...task,
    id: task?.id || `task-${index}`,
    title: task?.title || task?.name || 'Team task',
    status: task?.status || 'Todo',
    priority: task?.priority || 'Medium',
    assignee: task?.assignee || task?.assignedTo || '',
    dueDate: task?.dueDate || task?.deadline || null,
  };
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

export default function TeamCollaborationOS({
  workspace = {},
  team = [],
  channels = [],
  documents = [],
  tasks = [],
  meetings = [],
  whiteboards = [],
  files = [],
  approvals = [],
  activity = [],
  onOpenChannel,
  onOpenDocument,
  onOpenTask,
  onCreateMeeting,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [search, setSearch] = useState('');
  const [taskStatus, setTaskStatus] = useState('Todo');
  const [approvalStage, setApprovalStage] =
    useState('Review');
  const [notice, setNotice] = useState('');

  const normalizedTasks = useMemo(
    () => tasks.map(normalizeTask),
    [tasks]
  );

  const filteredChannels = useMemo(() => {
    if (!search) return channels;

    return channels.filter((channel) =>
      [
        channel?.name,
        channel?.title,
        channel?.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [channels, search]);

  const filteredDocuments = useMemo(() => {
    if (!search) return documents;

    return documents.filter((document) =>
      [
        document?.title,
        document?.name,
        document?.workspace,
        document?.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [documents, search]);

  const filteredTasks = useMemo(
    () =>
      normalizedTasks.filter(
        (task) => task.status === taskStatus
      ),
    [normalizedTasks, taskStatus]
  );

  const filteredApprovals = useMemo(
    () =>
      approvals.filter(
        (approval) =>
          (approval.stage || approval.status || 'Review') ===
          approvalStage
      ),
    [approvalStage, approvals]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const renderOverview = () => (
    <>
      <section style={styles.teamHero}>
        <div style={styles.teamOrb}>
          <Users size={32} />
        </div>
        <div style={styles.teamCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Aarush Team Collaboration
          </span>
          <h1>
            {workspace.name || 'Team workspace'}
          </h1>
          <p>
            Coordinate conversations, documents, tasks,
            meetings, files, approvals, and AI-assisted work in
            one collaborative layer.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Users size={13} />
              {team.length} members
            </span>
            <span>
              <Activity size={13} />
              {workspace.status || 'Workspace active'}
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Team members"
          value={team.length}
          icon={Users}
          color="#4dd7ff"
        />
        <MetricCard
          label="Active channels"
          value={channels.length}
          icon={Hash}
          color="#a895ff"
        />
        <MetricCard
          label="Open documents"
          value={documents.length}
          icon={FileText}
          color="#82e9c1"
        />
        <MetricCard
          label="Pending tasks"
          value={normalizedTasks.filter(
            (task) => task.status !== 'Done'
          ).length}
          icon={Target}
          color="#ffd27d"
        />
        <MetricCard
          label="Meetings today"
          value={meetings.filter(
            (meeting) => meeting.today
          ).length}
          icon={Video}
          color="#9deeff"
        />
        <MetricCard
          label="Pending approvals"
          value={approvals.filter(
            (approval) =>
              !['Approved', 'Published'].includes(
                approval.stage || approval.status
              )
          ).length}
          icon={Check}
          color="#ff4fd8"
        />
        <MetricCard
          label="Collaboration score"
          value={`${workspace.collaborationScore || 88}%`}
          icon={Sparkles}
          color="#82e9c1"
        />
        <MetricCard
          label="Team productivity"
          value={`${workspace.productivityScore || 84}%`}
          icon={Activity}
          color="#ff9f72"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Team Presence"
          subtitle="Current collaboration and availability."
          icon={Users}
        />

        <div style={styles.memberGrid}>
          {team.slice(0, 8).map((member, index) => (
            <div
              key={member.id || index}
              style={styles.memberCard}
            >
              <Avatar item={member} />
              <strong>
                {member.name || member.fullName || 'Team member'}
              </strong>
              <span>
                {member.role || 'Collaborator'}
              </span>
              <small>
                {member.status || 'Available'}
              </small>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderChannels = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Channels"
        subtitle="Workspace conversations and team presence."
        icon={Hash}
        action={
          <button
            type="button"
            onClick={() =>
              showNotice('Create channel flow opened.')
            }
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            New channel
          </button>
        }
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search channels"
          aria-label="Search channels"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.channelList}>
        {filteredChannels.length ? (
          filteredChannels.map((channel, index) => (
            <button
              type="button"
              key={channel.id || index}
              onClick={() => onOpenChannel?.(channel)}
              style={styles.channelRow}
            >
              <span style={styles.channelIcon}>
                <Hash size={17} />
              </span>
              <span style={styles.channelCopy}>
                <strong>
                  {channel.name ||
                    channel.title ||
                    'Channel'}
                </strong>
                <span>
                  {channel.description ||
                    'Team conversation foundation'}
                </span>
                <small>
                  {numeric(channel.unread)} unread ·{' '}
                  {numeric(channel.mentions)} mentions
                </small>
              </span>
              <span style={styles.presence}>
                <span />
                {channel.onlineMembers || 0} online
              </span>
              <ChevronRight size={15} />
            </button>
          ))
        ) : (
          <Empty label="No channels found." />
        )}
      </div>
    </section>
  );

  const renderDocuments = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Shared Documents"
        subtitle="Collaborative editing, comments, versions, and AI summaries."
        icon={FileText}
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search shared documents"
          aria-label="Search shared documents"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.documentList}>
        {filteredDocuments.length ? (
          filteredDocuments.map((document, index) => (
            <button
              type="button"
              key={document.id || index}
              onClick={() => onOpenDocument?.(document)}
              style={styles.documentRow}
            >
              <span style={styles.documentIcon}>
                <FileText size={17} />
              </span>
              <span style={styles.documentCopy}>
                <strong>
                  {document.title ||
                    document.name ||
                    'Shared document'}
                </strong>
                <span>
                  {document.workspace || 'Workspace'} ·{' '}
                  {document.status || 'Editing'}
                </span>
                <small>
                  Last edited {formatDate(document.lastEdited || document.updatedAt)} ·{' '}
                  {document.activeCollaborators || 0} collaborators
                </small>
              </span>
              <ChevronRight size={15} />
            </button>
          ))
        ) : (
          <Empty label="No shared documents." />
        )}
      </div>

      <div style={styles.featureChips}>
        {[
          'Real-time collaboration',
          'Comments foundation',
          'Suggestions',
          'Mentions',
          'Version history',
          'AI summaries',
        ].map((item) => (
          <span key={item} style={styles.featureChip}>
            <Check size={13} />
            {item}
          </span>
        ))}
      </div>
    </section>
  );

  const renderTasks = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Team Tasks"
        subtitle="Assignments, priorities, deadlines, and dependencies."
        icon={Target}
      />

      <div style={styles.stageTabs}>
        {TASK_STATUSES.map((status) => (
          <button
            type="button"
            key={status}
            onClick={() => setTaskStatus(status)}
            aria-pressed={taskStatus === status}
            style={{
              ...styles.stageButton,
              ...(taskStatus === status
                ? styles.activeStageButton
                : {}),
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <div style={styles.taskList}>
        {filteredTasks.length ? (
          filteredTasks.map((task) => (
            <button
              type="button"
              key={task.id}
              onClick={() => onOpenTask?.(task)}
              style={styles.taskRow}
            >
              <span style={styles.taskCheck}>
                {task.status === 'Done' ? (
                  <Check size={13} />
                ) : null}
              </span>
              <span style={styles.taskCopy}>
                <strong>{task.title}</strong>
                <span>
                  {task.assignee || 'Unassigned'} ·{' '}
                  {task.priority}
                </span>
                <small>
                  Due {formatDate(task.dueDate)} ·{' '}
                  {task.label || 'No label'}
                </small>
              </span>
              <ChevronRight size={15} />
            </button>
          ))
        ) : (
          <Empty label={`No tasks in ${taskStatus}.`} />
        )}
      </div>
    </section>
  );

  const renderMeetings = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Meetings"
        subtitle="Schedule, join, prepare agendas, and track action items."
        icon={Video}
        action={
          <button
            type="button"
            onClick={() => {
              onCreateMeeting?.();
              showNotice('Create meeting flow opened.');
            }}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Schedule meeting
          </button>
        }
      />

      <div style={styles.meetingList}>
        {meetings.length ? (
          meetings.map((meeting, index) => (
            <div
              key={meeting.id || index}
              style={styles.meetingRow}
            >
              <span style={styles.meetingTime}>
                {meeting.time || '—'}
              </span>
              <span style={styles.meetingCopy}>
                <strong>
                  {meeting.title ||
                    meeting.name ||
                    'Team meeting'}
                </strong>
                <span>
                  {meeting.type || 'Meeting'} ·{' '}
                  {meeting.participants || 0} participants
                </span>
                <small>
                  {meeting.agenda || 'Agenda foundation'} ·{' '}
                  {meeting.aiSummary
                    ? 'AI summary ready'
                    : 'AI summary foundation'}
                </small>
              </span>
              <button
                type="button"
                onClick={() =>
                  showNotice('Join meeting foundation ready.')
                }
                style={styles.joinButton}
              >
                <Play size={13} />
                Join
              </button>
            </div>
          ))
        ) : (
          <Empty label="No meetings scheduled." />
        )}
      </div>

      <div style={styles.featureChips}>
        {[
          'Agenda',
          'Notes',
          'Recording foundation',
          'AI meeting summary',
          'Action items',
          'Calendar integration',
        ].map((item) => (
          <span key={item} style={styles.featureChip}>
            <Check size={13} />
            {item}
          </span>
        ))}
      </div>
    </section>
  );

  const renderWhiteboards = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Whiteboards"
        subtitle="Visual collaboration for ideas and team planning."
        icon={Grid3X3}
      />

      <div style={styles.whiteboard}>
        <div style={styles.whiteboardGrid} />
        <span style={styles.stickyOne}>Idea</span>
        <span style={styles.stickyTwo}>Decision</span>
        <span style={styles.stickyThree}>Next step</span>
        <span style={styles.whiteboardLabel}>
          Multi-user editing foundation
        </span>
      </div>

      <div style={styles.toolRow}>
        {[
          'Sticky notes',
          'Shapes',
          'Connectors',
          'Images foundation',
          'Free drawing foundation',
          'Presentation mode',
        ].map((item) => (
          <button
            type="button"
            key={item}
            onClick={() =>
              showNotice(`${item} selected.`)
            }
            style={styles.toolChip}
          >
            <Grid3X3 size={14} />
            {item}
          </button>
        ))}
      </div>
    </section>
  );

  const renderFiles = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Shared Files"
        subtitle="Upload, search, preview, share, and manage versions."
        icon={FolderOpen}
      />

      <div style={styles.fileTools}>
        <button
          type="button"
          onClick={() =>
            showNotice('Upload foundation opened.')
          }
          style={styles.smallPrimary}
        >
          <Plus size={14} />
          Upload
        </button>
        <div style={styles.searchBox}>
          <Search size={15} />
          <input
            placeholder="Search files"
            aria-label="Search files"
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.fileList}>
        {files.length ? (
          files.map((file, index) => (
            <div
              key={file.id || index}
              style={styles.fileRow}
            >
              <span style={styles.fileIcon}>
                <FolderOpen size={16} />
              </span>
              <span style={styles.fileCopy}>
                <strong>
                  {file.name || file.title || 'Shared file'}
                </strong>
                <span>
                  {file.folder || 'Shared folder'} ·{' '}
                  {file.size || 'Size foundation'}
                </span>
                <small>
                  {file.permissions || 'Permissions foundation'} ·{' '}
                  {formatDate(file.updatedAt)}
                </small>
              </span>
              <MoreHorizontal size={15} />
            </div>
          ))
        ) : (
          <Empty label="No shared files yet." />
        )}
      </div>
    </section>
  );

  const renderApprovals = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Approvals"
        subtitle="Track review, revision, and publishing workflows."
        icon={Check}
      />

      <div style={styles.stageTabs}>
        {APPROVAL_STAGES.map((stage) => (
          <button
            type="button"
            key={stage}
            onClick={() => setApprovalStage(stage)}
            aria-pressed={approvalStage === stage}
            style={{
              ...styles.stageButton,
              ...(approvalStage === stage
                ? styles.activeStageButton
                : {}),
            }}
          >
            {stage}
          </button>
        ))}
      </div>

      <div style={styles.approvalList}>
        {filteredApprovals.length ? (
          filteredApprovals.map((approval, index) => (
            <div
              key={approval.id || index}
              style={styles.approvalRow}
            >
              <span style={styles.approvalIcon}>
                <Check size={16} />
              </span>
              <span style={styles.approvalCopy}>
                <strong>
                  {approval.title ||
                    approval.name ||
                    'Approval request'}
                </strong>
                <span>
                  Approver {approval.approver || 'Assigned'} ·{' '}
                  {approval.comments || 0} comments
                </span>
                <small>
                  {approval.history || 'Approval history foundation'}
                </small>
              </span>
              <ChevronRight size={15} />
            </div>
          ))
        ) : (
          <Empty label={`No approvals in ${approvalStage}.`} />
        )}
      </div>
    </section>
  );

  const renderActivity = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Activity Feed"
        subtitle="Real-time workspace events and collaboration history."
        icon={Activity}
      />

      <div style={styles.activityList}>
        {activity.length ? (
          activity.map((item, index) => (
            <div
              key={item.id || index}
              style={styles.activityRow}
            >
              <span style={styles.activityDot} />
              <span style={styles.activityCopy}>
                <strong>
                  {item.title ||
                    item.action ||
                    'Workspace activity'}
                </strong>
                <span>
                  {item.actor || 'Team member'} ·{' '}
                  {formatDate(item.createdAt || item.timestamp)}
                </span>
              </span>
              <ChevronRight size={14} />
            </div>
          ))
        ) : (
          <Empty label="No workspace activity yet." />
        )}
      </div>
    </section>
  );

  const renderAssistant = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Team Assistant"
        subtitle="Summarize, prioritize, plan, and coordinate team work."
        icon={Sparkles}
      />

      <div style={styles.assistantHero}>
        <Sparkles size={21} />
        <div>
          <strong>
            Team context is ready for AI coordination.
          </strong>
          <span>
            Use channels, documents, tasks, meetings, files,
            and approvals as future context sources.
          </span>
        </div>
      </div>

      <div style={styles.aiActionGrid}>
        {[
          'Summarize Channel',
          'Summarize Meeting',
          'Generate Tasks',
          'Draft Announcement',
          'Write Document',
          'Translate Conversation',
          'Prioritize Work',
          'Find Files',
          'Explain Project',
          'Create Weekly Report',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} prepared.`)
            }
            style={styles.aiAction}
          >
            <Sparkles size={15} />
            <span>{label}</span>
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'channels') return renderChannels();
    if (activeModule === 'documents') return renderDocuments();
    if (activeModule === 'tasks') return renderTasks();
    if (activeModule === 'meetings') return renderMeetings();
    if (activeModule === 'whiteboards') return renderWhiteboards();
    if (activeModule === 'files') return renderFiles();
    if (activeModule === 'approvals') return renderApprovals();
    if (activeModule === 'activity') return renderActivity();
    if (activeModule === 'assistant') return renderAssistant();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Team Collaboration OS"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Team Collaboration OS</strong>
          <span>
            Work together with clarity
          </span>
        </div>

        <button
          type="button"
          aria-label="Collaboration settings"
          style={styles.iconButton}
        >
          <MoreHorizontal size={18} />
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
        @keyframes aarush-team-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-team-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-team-card:hover,
        .aarush-team-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-team-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-team-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-team-members,
          .aarush-team-channels {
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

function Avatar({ item }) {
  const source =
    item?.avatar || item?.image || item?.photo;

  if (source) {
    return (
      <img
        src={source}
        alt=""
        loading="lazy"
        style={styles.avatar}
      />
    );
  }

  return (
    <span style={styles.avatarFallback}>
      {String(item?.name || item?.fullName || 'T')
        .charAt(0)
        .toUpperCase()}
    </span>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <Users size={25} />
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
    width: 'min(100%, 1140px)',
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

  teamHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-team-pulse 3s ease-in-out infinite',
  },

  teamOrb: {
    width: '4.8rem',
    height: '4.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(77,215,255,.4)',
    borderRadius: '1.2rem',
    color: '#c9f9ff',
    background:
      'radial-gradient(circle,#3d6d8a,#262257 70%)',
  },

  teamCopy: {
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

  teamCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  teamCopyP: {
    maxWidth: '42rem',
    margin: 0,
    color: '#91a0bc',
    fontSize: '.63rem',
    lineHeight: 1.45,
  },

  heroMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.55rem',
    marginTop: '.25rem',
    color: '#9deeff',
    fontSize: '.57rem',
  },

  heroMetaSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
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
    animation: 'aarush-team-in 240ms ease both',
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
    animation: 'aarush-team-in 240ms ease both',
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

  memberGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  memberCard: {
    minHeight: '6rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.22rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.58rem',
  },

  memberCardSpan: {
    color: '#91a0bc',
  },

  memberCardSmall: {
    color: '#82e9c1',
    fontSize: '.53rem',
  },

  avatar: {
    width: '2.35rem',
    height: '2.35rem',
    objectFit: 'cover',
    borderRadius: '999px',
  },

  avatarFallback: {
    width: '2.35rem',
    height: '2.35rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.7rem',
    marginBottom: '.6rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.8rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
  },

  searchInput: {
    minWidth: 0,
    minHeight: '2.55rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.68rem',
  },

  channelList: {
    display: 'grid',
    gap: '.4rem',
  },

  channelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  channelIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  channelCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  channelCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  channelCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  presence: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    color: '#82e9c1',
    fontSize: '.54rem',
  },

  presenceSpan: {
    width: '.42rem',
    height: '.42rem',
    borderRadius: '999px',
    background: '#82e9c1',
  },

  documentList: {
    display: 'grid',
    gap: '.4rem',
  },

  documentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  documentIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  documentCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  documentCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  documentCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  featureChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.7rem',
  },

  featureChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    padding: '.35rem .45rem',
    borderRadius: '999px',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.53rem',
  },

  stageTabs: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.35rem',
  },

  stageButton: {
    minHeight: '2.2rem',
    flexShrink: 0,
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.56rem',
    cursor: 'pointer',
  },

  activeStageButton: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background: 'rgba(124,92,255,.16)',
  },

  taskList: {
    display: 'grid',
    gap: '.4rem',
  },

  taskRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  taskCheck: {
    width: '1.45rem',
    height: '1.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(130,233,193,.25)',
    borderRadius: '.4rem',
    color: '#82e9c1',
  },

  taskCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  taskCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  taskCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  meetingList: {
    display: 'grid',
    gap: '.4rem',
  },

  meetingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  meetingTime: {
    minWidth: '3.5rem',
    color: '#9deeff',
    fontSize: '.58rem',
  },

  meetingCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  meetingCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  meetingCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  joinButton: {
    minHeight: '2.1rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
    padding: '0 .45rem',
    border: 0,
    borderRadius: '.55rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.54rem',
    cursor: 'pointer',
  },

  whiteboard: {
    position: 'relative',
    minHeight: '18rem',
    overflow: 'hidden',
    border: '1px solid rgba(77,215,255,.16)',
    borderRadius: '.85rem',
    background: '#0d1423',
  },

  whiteboardGrid: {
    position: 'absolute',
    inset: 0,
    opacity: .3,
    backgroundImage:
      'linear-gradient(rgba(77,215,255,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(77,215,255,.16) 1px,transparent 1px)',
    backgroundSize: '2rem 2rem',
  },

  stickyOne: {
    position: 'absolute',
    top: '2rem',
    left: '18%',
    padding: '.8rem',
    color: '#402c00',
    background: '#ffd27d',
    transform: 'rotate(-5deg)',
  },

  stickyTwo: {
    position: 'absolute',
    top: '6rem',
    right: '18%',
    padding: '.8rem',
    color: '#092d2b',
    background: '#82e9c1',
    transform: 'rotate(4deg)',
  },

  stickyThree: {
    position: 'absolute',
    bottom: '3rem',
    left: '42%',
    padding: '.8rem',
    color: '#281753',
    background: '#a895ff',
    transform: 'rotate(-3deg)',
  },

  whiteboardLabel: {
    position: 'absolute',
    right: '.7rem',
    bottom: '.6rem',
    left: '.7rem',
    color: '#91a0bc',
    fontSize: '.56rem',
    textAlign: 'center',
  },

  toolRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.6rem',
  },

  fileTools: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
  },

  fileToolsSearch: {
    flex: 1,
    marginBottom: 0,
  },

  fileList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  fileIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  fileCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  fileCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  fileCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  approvalList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.6rem',
  },

  approvalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  approvalIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.1)',
  },

  approvalCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  approvalCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  approvalCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  activityList: {
    display: 'grid',
    gap: '.35rem',
  },

  activityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    minHeight: '2.65rem',
    padding: '0 .5rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
  },

  activityDot: {
    width: '.5rem',
    height: '.5rem',
    flexShrink: 0,
    borderRadius: '999px',
    background: '#4dd7ff',
    boxShadow: '0 0 12px rgba(77,215,255,.7)',
  },

  activityCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  activityCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  assistantHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.75rem',
    border: '1px solid rgba(124,92,255,.18)',
    borderRadius: '.8rem',
    color: '#c9f9ff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.12),rgba(77,215,255,.05))',
  },

  assistantHeroDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  assistantHeroSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  aiActionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  aiAction: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(124,92,255,.16)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  customIcon: {
    display: 'grid',
    placeItems: 'center',
  },

  empty: {
    minHeight: '6rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gridColumn: '1 / -1',
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.64rem',
    textAlign: 'center',
  },
};