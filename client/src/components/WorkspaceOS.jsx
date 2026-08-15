import { useMemo, useState } from 'react';
import {
  Archive,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Code2,
  Database,
  FileText,
  FolderKanban,
  Grid3X3,
  Image as ImageIcon,
  LayoutDashboard,
  ListTodo,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  StickyNote,
  Table2,
  Users,
  X,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', LayoutDashboard],
  ['documents', 'Documents', FileText],
  ['notes', 'Notes', StickyNote],
  ['projects', 'Projects', FolderKanban],
  ['tasks', 'Tasks', ListTodo],
  ['databases', 'Databases', Database],
  ['calendar', 'Calendar', CalendarDays],
  ['whiteboard', 'Whiteboard', Grid3X3],
  ['knowledge', 'Knowledge Base', BookOpen],
  ['assistant', 'AI Assistant', Sparkles],
];

const PROJECT_STATUSES = [
  'Planning',
  'Active',
  'Review',
  'Completed',
  'Archived',
];

const TASK_VIEWS = ['List', 'Kanban', 'Calendar', 'Timeline'];

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

function normalizeDocument(document, index) {
  return {
    ...document,
    id: document?.id || `document-${index}`,
    title:
      document?.title ||
      document?.name ||
      'Untitled document',
    author: document?.author || 'You',
    status: document?.status || 'Draft',
    lastEdited:
      document?.lastEdited ||
      document?.updatedAt ||
      null,
    tags: Array.isArray(document?.tags)
      ? document.tags
      : [],
  };
}

function normalizeTask(task, index) {
  return {
    ...task,
    id: task?.id || `task-${index}`,
    title: task?.title || task?.name || 'Workspace task',
    status: task?.status || 'Open',
    priority: task?.priority || 'Medium',
    assignee: task?.assignee || '',
    dueDate: task?.dueDate || task?.deadline || null,
  };
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

export default function WorkspaceOS({
  user = {},
  workspaces = [],
  documents = [],
  notes = [],
  projects = [],
  tasks = [],
  databases = [],
  calendar = [],
  files = [],
  collaborators = [],
  onCreateDocument,
  onCreateProject,
  onCreateTask,
  onOpenDocument,
  onOpenWorkspace,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [selectedWorkspace, setSelectedWorkspace] =
    useState(workspaces[0] || null);
  const [search, setSearch] = useState('');
  const [taskView, setTaskView] = useState('List');
  const [projectStatus, setProjectStatus] =
    useState('Active');
  const [notice, setNotice] = useState('');
  const [documentModal, setDocumentModal] =
    useState(false);
  const [projectModal, setProjectModal] =
    useState(false);
  const [taskModal, setTaskModal] =
    useState(false);
  const [documentTitle, setDocumentTitle] =
    useState('');
  const [projectTitle, setProjectTitle] =
    useState('');
  const [taskTitle, setTaskTitle] = useState('');

  const normalizedDocuments = useMemo(
    () => documents.map(normalizeDocument),
    [documents]
  );

  const normalizedTasks = useMemo(
    () => tasks.map(normalizeTask),
    [tasks]
  );

  const filteredDocuments = useMemo(() => {
    if (!search) return normalizedDocuments;

    return normalizedDocuments.filter((document) =>
      [
        document.title,
        document.author,
        document.workspace,
        document.tags.join(' '),
        document.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [normalizedDocuments, search]);

  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          !projectStatus ||
          project.status === projectStatus
      ),
    [projectStatus, projects]
  );

  const pendingTasks = useMemo(
    () =>
      normalizedTasks.filter(
        (task) =>
          !['Completed', 'Done'].includes(task.status)
      ),
    [normalizedTasks]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const createDocument = () => {
    if (!documentTitle.trim()) {
      showNotice('Enter a document title.');
      return;
    }

    onCreateDocument?.({
      id: `document-${Date.now()}`,
      title: documentTitle.trim(),
      workspaceId: selectedWorkspace?.id,
      authorId: user.id,
      status: 'Draft',
    });

    setDocumentTitle('');
    setDocumentModal(false);
    showNotice('Document created.');
  };

  const createProject = () => {
    if (!projectTitle.trim()) {
      showNotice('Enter a project name.');
      return;
    }

    onCreateProject?.({
      id: `project-${Date.now()}`,
      name: projectTitle.trim(),
      workspaceId: selectedWorkspace?.id,
      status: 'Planning',
      ownerId: user.id,
    });

    setProjectTitle('');
    setProjectModal(false);
    showNotice('Project created.');
  };

  const createTask = () => {
    if (!taskTitle.trim()) {
      showNotice('Enter a task title.');
      return;
    }

    onCreateTask?.({
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      workspaceId: selectedWorkspace?.id,
      status: 'Open',
      priority: 'Medium',
      assignee: user.name || user.username,
    });

    setTaskTitle('');
    setTaskModal(false);
    showNotice('Task created.');
  };

  const renderOverview = () => (
    <>
      <section style={styles.workspaceHero}>
        <div style={styles.workspaceOrb}>
          <LayoutDashboard size={31} />
        </div>
        <div style={styles.workspaceCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Aarush WorkspaceOS
          </span>
          <h1>
            {selectedWorkspace?.name ||
              'Your productivity workspace'}
          </h1>
          <p>
            Bring documents, notes, projects, tasks, databases,
            calendars, and knowledge into one intelligent
            workspace.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Users size={13} />
              {collaborators.length} collaborators
            </span>
            <span>
              <Sparkles size={13} />
              AI productivity:{' '}
              {selectedWorkspace?.aiScore || 88}%
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Active workspaces"
          value={workspaces.length}
          icon={LayoutDashboard}
          color="#4dd7ff"
        />
        <MetricCard
          label="Open documents"
          value={normalizedDocuments.length}
          icon={FileText}
          color="#a895ff"
        />
        <MetricCard
          label="Pending tasks"
          value={pendingTasks.length}
          icon={ListTodo}
          color="#ffd27d"
        />
        <MetricCard
          label="Active projects"
          value={projects.filter(
            (project) => project.status === 'Active'
          ).length}
          icon={FolderKanban}
          color="#82e9c1"
        />
        <MetricCard
          label="Team members"
          value={collaborators.length}
          icon={Users}
          color="#9deeff"
        />
        <MetricCard
          label="Calendar events"
          value={calendar.length}
          icon={CalendarDays}
          color="#ff4fd8"
        />
        <MetricCard
          label="AI productivity"
          value={`${selectedWorkspace?.aiScore || 88}%`}
          icon={Sparkles}
          color="#82e9c1"
        />
        <MetricCard
          label="Workspace health"
          value={`${selectedWorkspace?.healthScore || 91}/100`}
          icon={BarChart3}
          color="#ff9f72"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Workspace Switcher"
          subtitle="Move between personal, creator, agency, and business spaces."
          icon={LayoutDashboard}
          action={
            <button
              type="button"
              onClick={() =>
                onOpenWorkspace?.(selectedWorkspace)
              }
              style={styles.smallButton}
            >
              Open workspace
              <ChevronRight size={14} />
            </button>
          }
        />

        <div style={styles.workspaceGrid}>
          {workspaces.length ? (
            workspaces.map((workspace, index) => (
              <button
                type="button"
                key={workspace.id || index}
                onClick={() => {
                  setSelectedWorkspace(workspace);
                  onOpenWorkspace?.(workspace);
                }}
                style={{
                  ...styles.workspaceCard,
                  ...(selectedWorkspace?.id === workspace.id
                    ? styles.selectedWorkspaceCard
                    : {}),
                }}
              >
                <LayoutDashboard size={17} />
                <strong>
                  {workspace.name || 'Workspace'}
                </strong>
                <span>
                  {workspace.type || 'Personal'} ·{' '}
                  {workspace.members || collaborators.length} members
                </span>
              </button>
            ))
          ) : (
            <Empty label="No workspaces yet." />
          )}
        </div>
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="AI Workspace Assistant"
          subtitle="Intelligent actions for your documents and projects."
          icon={Sparkles}
        />

        <div style={styles.aiActions}>
          {[
            'Write Document',
            'Summarize Document',
            'Generate Project Plan',
            'Create Task List',
            'Organize Workspace',
            'Find Information',
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
    </>
  );

  const renderDocuments = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Documents"
        subtitle="Rich documents for writing, planning, and collaboration."
        icon={FileText}
        action={
          <button
            type="button"
            onClick={() => setDocumentModal(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            New document
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
          placeholder="Search documents, tags, authors"
          aria-label="Search documents"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.documentTools}>
        {[
          ['Headings', FileText],
          ['Lists', ListTodo],
          ['Tables', Table2],
          ['Images', ImageIcon],
          ['Code blocks', Code2],
          ['Checklists', Check],
          ['Callouts', CircleDot],
          ['Templates', Grid3X3],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} foundation enabled.`)
            }
            style={styles.toolChip}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div style={styles.documentList}>
        {filteredDocuments.length ? (
          filteredDocuments.map((document) => (
            <button
              type="button"
              key={document.id}
              onClick={() => onOpenDocument?.(document)}
              style={styles.documentRow}
            >
              <span style={styles.documentIcon}>
                <FileText size={17} />
              </span>
              <span style={styles.documentCopy}>
                <strong>{document.title}</strong>
                <span>
                  {document.author} ·{' '}
                  {document.workspace || 'Workspace'}
                </span>
                <small>
                  Edited {formatDate(document.lastEdited)} ·{' '}
                  {document.status}
                </small>
              </span>
              <ChevronRight size={15} />
            </button>
          ))
        ) : (
          <Empty label="No documents found." />
        )}
      </div>
    </section>
  );

  const renderNotes = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Notes"
        subtitle="Fast capture for ideas, calls, and important context."
        icon={StickyNote}
        action={
          <button
            type="button"
            onClick={() =>
              showNotice('Quick note editor opened.')
            }
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Quick note
          </button>
        }
      />

      <div style={styles.noteTools}>
        {[
          'Quick notes',
          'Voice note foundation',
          'Pinned notes',
          'Favorites',
          'AI summaries',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} selected.`)
            }
            style={styles.toolChip}
          >
            <StickyNote size={14} />
            {label}
          </button>
        ))}
      </div>

      <div style={styles.noteList}>
        {notes.length ? (
          notes.map((note, index) => (
            <div
              key={note.id || index}
              style={styles.noteCard}
            >
              <div style={styles.noteTop}>
                <StickyNote size={16} />
                <span>
                  {note.pinned ? 'Pinned' : 'Note'}
                </span>
              </div>
              <strong>
                {note.title || note.name || 'Untitled note'}
              </strong>
              <p>
                {note.content ||
                  note.text ||
                  'Note content foundation'}
              </p>
              <small>
                {note.tag || note.category || 'Personal'} ·{' '}
                {formatDate(note.updatedAt)}
              </small>
            </div>
          ))
        ) : (
          <Empty label="No notes yet." />
        )}
      </div>
    </section>
  );

  const renderProjects = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Projects"
        subtitle="Plan, execute, and review collaborative work."
        icon={FolderKanban}
        action={
          <button
            type="button"
            onClick={() => setProjectModal(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            New project
          </button>
        }
      />

      <div style={styles.filterRow}>
        {PROJECT_STATUSES.map((status) => (
          <button
            type="button"
            key={status}
            onClick={() => setProjectStatus(status)}
            aria-pressed={projectStatus === status}
            style={{
              ...styles.filterButton,
              ...(projectStatus === status
                ? styles.activeFilterButton
                : {}),
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <div style={styles.projectList}>
        {filteredProjects.length ? (
          filteredProjects.map((project, index) => (
            <div
              key={project.id || index}
              style={styles.projectRow}
            >
              <span style={styles.projectIcon}>
                <FolderKanban size={17} />
              </span>
              <span style={styles.projectCopy}>
                <strong>
                  {project.name ||
                    project.title ||
                    'Project'}
                </strong>
                <span>
                  Owner {project.owner || 'You'} ·{' '}
                  {project.priority || 'Medium'} priority
                </span>
                <small>
                  {numeric(project.progress)}% progress · Due{' '}
                  {formatDate(project.deadline)}
                </small>
              </span>
              <span style={styles.projectStatus}>
                {project.status || 'Planning'}
              </span>
              <ChevronRight size={15} />
            </div>
          ))
        ) : (
          <Empty label={`No ${projectStatus.toLowerCase()} projects.`} />
        )}
      </div>
    </section>
  );

  const renderTasks = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Tasks"
        subtitle="Smart tasks with priorities, deadlines, and assignees."
        icon={ListTodo}
        action={
          <button
            type="button"
            onClick={() => setTaskModal(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            New task
          </button>
        }
      />

      <div style={styles.viewTabs}>
        {TASK_VIEWS.map((view) => (
          <button
            type="button"
            key={view}
            onClick={() => setTaskView(view)}
            aria-pressed={taskView === view}
            style={{
              ...styles.viewButton,
              ...(taskView === view
                ? styles.activeViewButton
                : {}),
            }}
          >
            {view}
          </button>
        ))}
      </div>

      {taskView === 'Kanban' ? (
        <div style={styles.kanban}>
          {['Open', 'In Progress', 'Review', 'Completed'].map(
            (column) => (
              <div
                key={column}
                style={styles.kanbanColumn}
              >
                <div style={styles.kanbanHeader}>
                  <span>{column}</span>
                  <strong>
                    {normalizedTasks.filter(
                      (task) => task.status === column
                    ).length}
                  </strong>
                </div>
                {normalizedTasks
                  .filter((task) => task.status === column)
                  .slice(0, 5)
                  .map((task) => (
                    <div
                      key={task.id}
                      style={styles.kanbanCard}
                    >
                      <strong>{task.title}</strong>
                      <small>
                        {task.priority} ·{' '}
                        {formatDate(task.dueDate)}
                      </small>
                    </div>
                  ))}
              </div>
            )
          )}
        </div>
      ) : (
        <div style={styles.taskList}>
          {normalizedTasks.length ? (
            normalizedTasks.map((task) => (
              <div
                key={task.id}
                style={styles.taskRow}
              >
                <span style={styles.taskCheck}>
                  {task.status === 'Completed' ? (
                    <Check size={13} />
                  ) : null}
                </span>
                <span style={styles.taskCopy}>
                  <strong>{task.title}</strong>
                  <span>
                    {task.priority} ·{' '}
                    {task.assignee || 'Unassigned'}
                  </span>
                  <small>
                    Due {formatDate(task.dueDate)}
                  </small>
                </span>
                <ChevronRight size={15} />
              </div>
            ))
          ) : (
            <Empty label="No tasks yet." />
          )}
        </div>
      )}
    </section>
  );

  const renderDatabases = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Databases"
        subtitle="Structured data for brands, campaigns, content, and research."
        icon={Database}
      />

      <div style={styles.databaseGrid}>
        {[
          ['Clients', Users],
          ['Brands', BriefcaseIcon],
          ['Content', FileText],
          ['Products', PackageIcon],
          ['Campaigns', FolderKanban],
          ['Research', BookOpen],
          ['Inventory', Database],
          ['Knowledge', BookOpen],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} database opened.`)
            }
            style={styles.databaseCard}
          >
            <Icon size={18} />
            <strong>{label}</strong>
            <span>Properties · Filters · Views</span>
          </button>
        ))}
      </div>
    </section>
  );

  const renderCalendar = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Calendar"
        subtitle="Meetings, deadlines, publishing, and study schedules."
        icon={CalendarDays}
        action={
          <button
            type="button"
            onClick={() =>
              showNotice('AI scheduling suggestions generated.')
            }
            style={styles.smallButton}
          >
            <Sparkles size={14} />
            AI suggestions
          </button>
        }
      />

      <div style={styles.calendarTypes}>
        {[
          'Meetings',
          'Deadlines',
          'Story schedule',
          'Business events',
          'Study sessions',
          'Reminders',
        ].map((label) => (
          <span key={label} style={styles.toolChip}>
            <CalendarDays size={14} />
            {label}
          </span>
        ))}
      </div>

      <div style={styles.eventList}>
        {calendar.length ? (
          calendar.map((event, index) => (
            <div
              key={event.id || index}
              style={styles.eventRow}
            >
              <span style={styles.eventDate}>
                {event.date
                  ? new Date(event.date).getDate()
                  : '—'}
              </span>
              <span style={styles.eventCopy}>
                <strong>
                  {event.title || event.name || 'Calendar event'}
                </strong>
                <span>
                  {event.type || 'Scheduled'} ·{' '}
                  {event.time || 'Time foundation'}
                </span>
              </span>
              <ChevronRight size={15} />
            </div>
          ))
        ) : (
          <Empty label="No calendar events." />
        )}
      </div>
    </section>
  );

  const renderWhiteboard = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Whiteboard"
        subtitle="Visual collaboration and freeform thinking foundation."
        icon={Grid3X3}
      />

      <div style={styles.whiteboard}>
        <div style={styles.whiteboardGrid} />
        <span style={styles.stickyOne}>Idea</span>
        <span style={styles.stickyTwo}>Next step</span>
        <span style={styles.stickyThree}>Question</span>
        <div style={styles.whiteboardLabel}>
          Collaborative whiteboard foundation
        </div>
      </div>

      <div style={styles.whiteboardTools}>
        {[
          ['Sticky notes', StickyNote],
          ['Shapes', CircleDot],
          ['Connectors', ChevronRight],
          ['Images foundation', ImageIcon],
          ['Free drawing foundation', PencilIcon],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} selected.`)
            }
            style={styles.toolChip}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );

  const renderKnowledge = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Knowledge Base"
        subtitle="Link documents, topics, tags, and AI answers."
        icon={BookOpen}
      />

      <div style={styles.knowledgeGrid}>
        {[
          ['Linked documents', FileText],
          ['Topics', BookOpen],
          ['Tags', CircleDot],
          ['AI search', Search],
          ['AI answers', Sparkles],
          ['Knowledge graph foundation', NetworkIcon],
          ['Recent knowledge', Clock3],
          ['Favorites', StarIcon],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} opened.`)
            }
            style={styles.knowledgeCard}
          >
            <Icon size={16} />
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

  const renderAssistant = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Workspace Assistant"
        subtitle="Write, organize, summarize, and plan."
        icon={Sparkles}
      />

      <div style={styles.assistantHero}>
        <Sparkles size={21} />
        <div>
          <strong>
            Your workspace context is ready.
          </strong>
          <span>
            AI can use documents, tasks, projects, calendar,
            and knowledge metadata to help.
          </span>
        </div>
      </div>

      <div style={styles.aiActions}>
        {[
          'Write Document',
          'Summarize Document',
          'Rewrite',
          'Translate',
          'Create Meeting Notes',
          'Generate Project Plan',
          'Create Task List',
          'Explain Document',
          'Find Information',
          'Organize Workspace',
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
    if (activeModule === 'documents') return renderDocuments();
    if (activeModule === 'notes') return renderNotes();
    if (activeModule === 'projects') return renderProjects();
    if (activeModule === 'tasks') return renderTasks();
    if (activeModule === 'databases') return renderDatabases();
    if (activeModule === 'calendar') return renderCalendar();
    if (activeModule === 'whiteboard') return renderWhiteboard();
    if (activeModule === 'knowledge') return renderKnowledge();
    if (activeModule === 'assistant') return renderAssistant();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close WorkspaceOS"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>WorkspaceOS</strong>
          <span>
            Think, plan, build, and collaborate
          </span>
        </div>

        <button
          type="button"
          aria-label="Workspace settings"
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

      {documentModal ? (
        <Modal
          title="Create Document"
          onClose={() => setDocumentModal(false)}
        >
          <label style={styles.field}>
            Document title
            <input
              autoFocus
              value={documentTitle}
              onChange={(event) =>
                setDocumentTitle(event.target.value)
              }
              placeholder="Campaign brief"
              style={styles.textInput}
            />
          </label>

          <button
            type="button"
            onClick={createDocument}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create document
          </button>
        </Modal>
      ) : null}

      {projectModal ? (
        <Modal
          title="Create Project"
          onClose={() => setProjectModal(false)}
        >
          <label style={styles.field}>
            Project name
            <input
              autoFocus
              value={projectTitle}
              onChange={(event) =>
                setProjectTitle(event.target.value)
              }
              placeholder="Summer launch"
              style={styles.textInput}
            />
          </label>

          <button
            type="button"
            onClick={createProject}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create project
          </button>
        </Modal>
      ) : null}

      {taskModal ? (
        <Modal
          title="Create Task"
          onClose={() => setTaskModal(false)}
        >
          <label style={styles.field}>
            Task title
            <input
              autoFocus
              value={taskTitle}
              onChange={(event) =>
                setTaskTitle(event.target.value)
              }
              placeholder="Review campaign brief"
              style={styles.textInput}
            />
          </label>

          <button
            type="button"
            onClick={createTask}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create task
          </button>
        </Modal>
      ) : null}

      <style>{`
        @keyframes aarush-workspace-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-workspace-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-workspace-card:hover,
        .aarush-workspace-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-workspace-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-workspace-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-workspace-grid {
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

function QuickAction({ label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.quickAction}
    >
      <Icon size={17} />
      <span>{label}</span>
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.modalBackdrop}>
      <section style={styles.modal}>
        <div style={styles.modalHeader}>
          <strong>{title}</strong>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={styles.iconButton}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <LayoutDashboard size={25} />
      <span>{label}</span>
    </div>
  );
}

function PackageIcon() {
  return (
    <span style={styles.customIcon}>
      <Database size={16} />
    </span>
  );
}

function PencilIcon() {
  return (
    <span style={styles.customIcon}>
      <CircleDot size={16} />
    </span>
  );
}

function NetworkIcon() {
  return (
    <span style={styles.customIcon}>
      <Grid3X3 size={16} />
    </span>
  );
}

function StarIcon() {
  return (
    <span style={styles.customIcon}>
      <Sparkles size={16} />
    </span>
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

  workspaceHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-workspace-pulse 3s ease-in-out infinite',
  },

  workspaceOrb: {
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

  workspaceCopy: {
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

  workspaceCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  workspaceCopyP: {
    maxWidth: '40rem',
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
    animation: 'aarush-workspace-in 240ms ease both',
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
    animation: 'aarush-workspace-in 240ms ease both',
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

  workspaceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  workspaceCard: {
    minHeight: '5rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  selectedWorkspaceCard: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background: 'rgba(124,92,255,.14)',
  },

  workspaceCardSpan: {
    color: '#91a0bc',
    fontSize: '.56rem',
  },

  aiActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
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

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.7rem',
    marginBottom: '.65rem',
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

  documentTools: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginBottom: '.7rem',
  },

  noteTools: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  toolChip: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.55rem',
    cursor: 'pointer',
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

  noteList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
    marginTop: '.7rem',
  },

  noteCard: {
    minHeight: '8rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,210,125,.16)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,210,125,.05)',
  },

  noteTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '.25rem',
    color: '#ffd27d',
    fontSize: '.55rem',
  },

  noteCardP: {
    margin: 0,
    color: '#aab6cf',
    fontSize: '.57rem',
    lineHeight: 1.4,
  },

  noteCardSmall: {
    marginTop: 'auto',
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  filterRow: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.35rem',
  },

  filterButton: {
    minHeight: '2.1rem',
    flexShrink: 0,
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.55rem',
    cursor: 'pointer',
  },

  activeFilterButton: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background: 'rgba(124,92,255,.16)',
  },

  projectList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.65rem',
  },

  projectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  projectIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#a895ff',
    background: 'rgba(124,92,255,.12)',
  },

  projectCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  projectCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  projectCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  projectStatus: {
    color: '#82e9c1',
    fontSize: '.55rem',
  },

  viewTabs: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.35rem',
  },

  viewButton: {
    minHeight: '2.2rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  activeViewButton: {
    borderColor: 'rgba(77,215,255,.35)',
    color: '#fff',
    background: 'rgba(77,215,255,.12)',
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

  kanban: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
    overflowX: 'auto',
    paddingTop: '.4rem',
  },

  kanbanColumn: {
    minWidth: '12rem',
    minHeight: '10rem',
    padding: '.5rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  kanbanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.3rem',
    marginBottom: '.4rem',
    color: '#aab6cf',
    fontSize: '.59rem',
  },

  kanbanCard: {
    display: 'grid',
    gap: '.18rem',
    marginBottom: '.35rem',
    padding: '.5rem',
    border: '1px solid rgba(124,92,255,.15)',
    borderRadius: '.55rem',
    color: '#dce5f8',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.57rem',
  },

  kanbanCardSmall: {
    color: '#91a0bc',
    fontSize: '.53rem',
  },

  databaseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  databaseCard: {
    minHeight: '5.5rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  databaseCardSpan: {
    color: '#91a0bc',
    fontSize: '.54rem',
  },

  calendarTypes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  eventList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  eventRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  eventDate: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  eventCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  eventCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
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

  whiteboardTools: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.6rem',
  },

  knowledgeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  knowledgeCard: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.59rem',
    textAlign: 'left',
    cursor: 'pointer',
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
    width: 'min(100%, 430px)',
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

  field: {
    display: 'grid',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.63rem',
  },

  textInput: {
    minHeight: '2.5rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.68rem',
  },

  select: {
    minHeight: '2.4rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.65rem',
    outline: 0,
    color: '#dce5f8',
    background: '#151c2c',
    fontSize: '.64rem',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    width: '100%',
    marginTop: '.6rem',
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