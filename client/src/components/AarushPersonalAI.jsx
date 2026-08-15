import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  ListTodo,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Paperclip,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  Target,
  UserRound,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';

const MODULES = [
  ['overview', 'AI Overview', Sparkles],
  ['chat', 'Chat', MessageCircle],
  ['memory', 'Memory', BookOpen],
  ['tasks', 'Tasks', ListTodo],
  ['calendar', 'Calendar', CalendarDays],
  ['workspace', 'Workspace', LayoutDashboard],
  ['wallet', 'Wallet', WalletCards],
  ['education', 'Education', BookOpen],
  ['business', 'Business', Briefcase],
  ['actions', 'AI Actions', Zap],
];

const DEFAULT_ACTIONS = [
  ['Create Story', ImageIcon],
  ['Schedule Story', CalendarDays],
  ['Summarize Chat', MessageCircle],
  ['Create Task', ListTodo],
  ['Schedule Meeting', CalendarDays],
  ['Translate Text', Sparkles],
  ['Analyze Analytics', Activity],
  ['Open Workspace', LayoutDashboard],
  ['Open Wallet', WalletCards],
  ['Open Security Center', Target],
  ['Generate Report', FileText],
  ['Plan My Day', Clock3],
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

function formatMoney(value, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numeric(value));
  } catch {
    return `${currency} ${Math.round(numeric(value))}`;
  }
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

export default function AarushPersonalAI({
  user = {},
  conversations = [],
  memory = [],
  tasks = [],
  calendar = [],
  wallet = {},
  workspace = {},
  education = {},
  business = {},
  notifications = [],
  onSendMessage,
  onExecuteAction,
  onCreateTask,
  onScheduleEvent,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [messages, setMessages] = useState(() =>
    normalizeMessages(conversations)
  );
  const [messageInput, setMessageInput] = useState('');
  const [memorySearch, setMemorySearch] =
    useState('');
  const [notice, setNotice] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] =
    useState('Medium');
  const [taskModal, setTaskModal] = useState(false);
  const [typing, setTyping] = useState(false);
  const inputRef = useRef(null);

  const pendingTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          !task.completed &&
          task.status !== 'Completed'
      ),
    [tasks]
  );

  const eventsToday = useMemo(
    () =>
      calendar.filter((event) => {
        if (!event?.date) return Boolean(event?.today);

        const today = new Date();
        const date = new Date(event.date);

        return (
          today.toDateString() === date.toDateString()
        );
      }),
    [calendar]
  );

  const filteredMemory = useMemo(
    () =>
      memory.filter((item) => {
        if (!memorySearch) return true;

        return [
          item?.title,
          item?.content,
          item?.category,
          item?.text,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(memorySearch.toLowerCase());
      }),
    [memory, memorySearch]
  );

  const aiContext = useMemo(
    () => ({
      currentScreen: activeModule,
      activeConversation:
        messages[messages.length - 1] || null,
      recentStories: user.recentStories || [],
      pendingTasks: pendingTasks.length,
      upcomingEvents: calendar.slice(0, 5),
      workspaceDocuments: workspace.documents || [],
      walletActivity: wallet.recentPayments || [],
      creatorAnalytics: user.analytics || {},
    }),
    [
      activeModule,
      calendar,
      messages,
      pendingTasks.length,
      user.analytics,
      user.recentStories,
      wallet.recentPayments,
      workspace.documents,
    ]
  );

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeModule]);

  const sendMessage = async () => {
    const text = messageInput.trim();

    if (!text || typing) return;

    const userMessage = {
      id: `message-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setMessageInput('');
    setTyping(true);

    await onSendMessage?.({
      message: text,
      context: aiContext,
      conversationId:
        conversations?.[0]?.conversationId ||
        conversations?.[0]?.id,
    });

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: getAssistantReply(text),
          createdAt: new Date().toISOString(),
        },
      ]);
      setTyping(false);
    }, 450);
  };

  const createTask = () => {
    if (!taskTitle.trim()) {
      showNotice('Enter a task title.');
      return;
    }

    onCreateTask?.({
      title: taskTitle.trim(),
      priority: taskPriority,
      status: 'Open',
      aiGenerated: true,
      context: aiContext,
    });

    setTaskTitle('');
    setTaskModal(false);
    showNotice('Task created.');
  };

  const executeAction = (label) => {
    onExecuteAction?.({
      action: label,
      context: aiContext,
      executionTime: new Date().toISOString(),
    });

    showNotice(`${label} prepared.`);
  };

  const renderOverview = () => (
    <>
      <section style={styles.aiHero}>
        <div style={styles.aiOrb}>
          <Sparkles size={32} />
        </div>
        <div style={styles.aiCopy}>
          <span style={styles.aiBadge}>
            <Zap size={12} />
            Aarush Personal AI
          </span>
          <h1>
            Good day,{' '}
            {user.firstName ||
              user.name?.split?.(' ')?.[0] ||
              'there'}
          </h1>
          <p>
            Your cross-service AI companion is ready across
            Stories, Messaging, Wallet, Workspace, Education,
            Business, Commerce, and Security.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Activity size={13} />
              Status: {user.aiStatus || 'Ready'}
            </span>
            <span>
              <Sparkles size={13} />
              Confidence: {user.aiConfidence || 91}%
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Conversations"
          value={conversations.length}
          icon={MessageCircle}
          color="#4dd7ff"
        />
        <MetricCard
          label="Memory items"
          value={memory.length}
          icon={BookOpen}
          color="#a895ff"
        />
        <MetricCard
          label="Tasks pending"
          value={pendingTasks.length}
          icon={ListTodo}
          color="#ffd27d"
        />
        <MetricCard
          label="Events today"
          value={eventsToday.length}
          icon={CalendarDays}
          color="#82e9c1"
        />
        <MetricCard
          label="Wallet balance"
          value={formatMoney(wallet.balance)}
          icon={WalletCards}
          color="#9deeff"
        />
        <MetricCard
          label="Workspace activity"
          value={workspace.activity || 'Ready'}
          icon={LayoutDashboard}
          color="#ff4fd8"
        />
        <MetricCard
          label="Notifications"
          value={notifications.length}
          icon={Bell}
          color="#ff9f72"
        />
        <MetricCard
          label="AI confidence"
          value={`${user.aiConfidence || 91}%`}
          icon={Sparkles}
          color="#82e9c1"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Ask Aarush AI"
          subtitle="Chat with context from your entire ecosystem."
          icon={MessageCircle}
        />
        <ChatComposer
          inputRef={inputRef}
          value={messageInput}
          onChange={setMessageInput}
          onSend={sendMessage}
          onVoice={() =>
            showNotice('Voice input foundation ready.')
          }
          onAttach={() =>
            showNotice('File understanding foundation ready.')
          }
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="AI Actions"
          subtitle="One-tap actions for your day."
          icon={Zap}
        />
        <ActionGrid
          actions={DEFAULT_ACTIONS.slice(0, 6)}
          onAction={executeAction}
        />
      </section>
    </>
  );

  const renderChat = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Chat"
        subtitle="Long conversations with context awareness."
        icon={MessageCircle}
        action={
          <button
            type="button"
            onClick={() => setMessages([])}
            style={styles.smallButton}
          >
            New chat
          </button>
        }
      />

      <div style={styles.chatList} aria-live="polite">
        {messages.length ? (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.messageRow,
                ...(message.role === 'user'
                  ? styles.userMessageRow
                  : {}),
              }}
            >
              <span
                style={{
                  ...styles.messageAvatar,
                  ...(message.role === 'user'
                    ? styles.userAvatar
                    : {}),
                }}
              >
                {message.role === 'user' ? (
                  <UserRound size={15} />
                ) : (
                  <Sparkles size={15} />
                )}
              </span>
              <div style={styles.messageBubble}>
                <small>
                  {message.role === 'user'
                    ? 'You'
                    : 'Aarush AI'}
                </small>
                <p>{message.content}</p>
              </div>
            </div>
          ))
        ) : (
          <Empty label="Start a conversation with Aarush AI." />
        )}

        {typing ? (
          <div style={styles.typing}>
            <Sparkles size={15} />
            <span>Thinking</span>
            <i />
            <i />
            <i />
          </div>
        ) : null}
      </div>

      <ChatComposer
        inputRef={inputRef}
        value={messageInput}
        onChange={setMessageInput}
        onSend={sendMessage}
        onVoice={() =>
          showNotice('Voice input foundation ready.')
        }
        onAttach={() =>
          showNotice('File understanding foundation ready.')
        }
      />
    </section>
  );

  const renderMemory = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Memory"
        subtitle="Review what Aarush remembers and why."
        icon={BookOpen}
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={memorySearch}
          onChange={(event) =>
            setMemorySearch(event.target.value)
          }
          placeholder="Search AI memory"
          aria-label="Search AI memory"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.memoryCategories}>
        {[
          'Personal',
          'Work',
          'Study',
          'Creator',
          'Business',
          'Preferences',
          'Important People',
          'Important Places',
        ].map((category) => (
          <button
            type="button"
            key={category}
            onClick={() =>
              showNotice(`${category} memory selected.`)
            }
            style={styles.categoryButton}
          >
            <BookOpen size={14} />
            {category}
          </button>
        ))}
      </div>

      <div style={styles.memoryList}>
        {filteredMemory.length ? (
          filteredMemory.map((item, index) => (
            <div
              key={item.id || index}
              style={styles.memoryRow}
            >
              <span style={styles.memoryIcon}>
                <Sparkles size={15} />
              </span>
              <span style={styles.memoryCopy}>
                <strong>
                  {item.title ||
                    item.category ||
                    'Remembered detail'}
                </strong>
                <span>
                  {item.content ||
                    item.text ||
                    'Memory content foundation'}
                </span>
                <small>
                  {item.category || 'Personal'} ·{' '}
                  {item.pinned ? 'Pinned' : 'Saved'}
                </small>
              </span>
              <button
                type="button"
                onClick={() =>
                  showNotice('Memory options opened.')
                }
                style={styles.tinyButton}
                aria-label="Memory options"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="No matching memories." />
        )}
      </div>

      <div style={styles.memoryActions}>
        <button
          type="button"
          onClick={() => showNotice('Remember flow opened.')}
          style={styles.smallPrimary}
        >
          <Plus size={14} />
          Remember something
        </button>
        <button
          type="button"
          onClick={() => showNotice('Forget flow opened.')}
          style={styles.smallButton}
        >
          Forget memory
        </button>
      </div>
    </section>
  );

  const renderTasks = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Tasks"
        subtitle="AI-assisted tasks across your personal and work life."
        icon={ListTodo}
        action={
          <button
            type="button"
            onClick={() => setTaskModal(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            Create task
          </button>
        }
      />

      <div style={styles.taskList}>
        {tasks.length ? (
          tasks.map((task, index) => (
            <div
              key={task.id || index}
              style={styles.taskRow}
            >
              <span style={styles.taskCheck}>
                {task.completed ? <Check size={13} /> : null}
              </span>
              <span style={styles.taskCopy}>
                <strong>
                  {task.title || task.name || 'Task'}
                </strong>
                <span>
                  {task.priority || 'Medium'} ·{' '}
                  {task.type || 'Personal task'}
                </span>
                <small>
                  Due {formatDate(task.deadline || task.dueDate)}
                </small>
              </span>
              <ChevronRight size={15} />
            </div>
          ))
        ) : (
          <Empty label="No tasks yet." />
        )}
      </div>
    </section>
  );

  const renderCalendar = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Calendar"
        subtitle="AI scheduling across creator, study, and business events."
        icon={CalendarDays}
        action={
          <button
            type="button"
            onClick={() =>
              showNotice('AI time suggestions generated.')
            }
            style={styles.smallButton}
          >
            <Sparkles size={14} />
            Suggest time
          </button>
        }
      />

      <div style={styles.calendarFilters}>
        {['Today', 'This week', 'Meetings', 'Story schedule', 'Business events', 'Study schedule'].map(
          (filter) => (
            <button
              type="button"
              key={filter}
              onClick={() =>
                showNotice(`${filter} calendar selected.`)
              }
              style={styles.categoryButton}
            >
              <CalendarDays size={14} />
              {filter}
            </button>
          )
        )}
      </div>

      <div style={styles.eventList}>
        {calendar.length ? (
          calendar.map((event, index) => (
            <div
              key={event.id || index}
              style={styles.eventRow}
            >
              <span style={styles.eventTime}>
                {event.time || '—'}
              </span>
              <span style={styles.eventCopy}>
                <strong>
                  {event.title || event.name || 'Calendar event'}
                </strong>
                <span>
                  {event.type || 'Scheduled event'} ·{' '}
                  {event.location || 'Aarush'}
                </span>
              </span>
              <ChevronRight size={15} />
            </div>
          ))
        ) : (
          <Empty label="No upcoming events." />
        )}
      </div>
    </section>
  );

  const renderWorkspace = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Workspace"
        subtitle="AI summaries for projects, notes, files, and documents."
        icon={LayoutDashboard}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Notes"
          value={numeric(workspace.notes)}
          icon={FileText}
          color="#4dd7ff"
        />
        <MetricCard
          label="Documents"
          value={numeric(workspace.documents?.length)}
          icon={FileText}
          color="#a895ff"
        />
        <MetricCard
          label="Projects"
          value={numeric(workspace.projects)}
          icon={Target}
          color="#82e9c1"
        />
        <MetricCard
          label="Recent work"
          value={workspace.recentWork || 'Ready'}
          icon={Activity}
          color="#ffd27d"
        />
      </div>

      <div style={styles.workspaceNote}>
        <Sparkles size={16} />
        <span>
          AI workspace summaries and cross-module document
          context are ready for integration.
        </span>
      </div>
    </section>
  );

  const renderWallet = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Wallet"
        subtitle="Financial context and creator earnings foundation."
        icon={WalletCards}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Balance"
          value={formatMoney(wallet.balance)}
          icon={WalletCards}
          color="#82e9c1"
        />
        <MetricCard
          label="Recent payments"
          value={numeric(wallet.recentPayments?.length)}
          icon={CircleDollarSign}
          color="#4dd7ff"
        />
        <MetricCard
          label="Pending payments"
          value={formatMoney(wallet.pendingPayments)}
          icon={Clock3}
          color="#ffd27d"
        />
        <MetricCard
          label="Creator earnings"
          value={formatMoney(wallet.creatorEarnings)}
          icon={Sparkles}
          color="#a895ff"
        />
      </div>

      <div style={styles.walletNote}>
        <CircleDollarSign size={16} />
        Subscription reminders and spending insights foundation
        are ready.
      </div>
    </section>
  );

  const renderEducation = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Education"
        subtitle="Personalized learning assistance."
        icon={BookOpen}
      />

      <div style={styles.educationGrid}>
        {[
          'Ask study questions',
          'Explain concepts',
          'Solve problems',
          'Create quizzes',
          'Summarize notes',
          'Plan study schedule',
          'Exam preparation',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={() => executeAction(label)}
            style={styles.actionButton}
          >
            <BookOpen size={15} />
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

  const renderBusiness = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Business"
        subtitle="Creator business and brand operations assistance."
        icon={Briefcase}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Brand negotiations"
          value={business.negotiations || 'Ready'}
          icon={MessageCircle}
          color="#4dd7ff"
        />
        <MetricCard
          label="Revenue analysis"
          value={business.revenueAnalysis || 'Ready'}
          icon={BarChartIcon}
          color="#82e9c1"
        />
        <MetricCard
          label="CRM insights"
          value={business.crmInsights || 'Ready'}
          icon={UsersIcon}
          color="#a895ff"
        />
        <MetricCard
          label="Campaign planning"
          value={business.campaignPlanning || 'Ready'}
          icon={Target}
          color="#ffd27d"
        />
      </div>

      <div style={styles.educationGrid}>
        {[
          'Brand negotiation',
          'Proposal writing',
          'Invoice assistance',
          'Revenue analysis',
          'CRM insights',
          'Campaign planning',
          'Creator strategy',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={() => executeAction(label)}
            style={styles.actionButton}
          >
            <Briefcase size={15} />
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

  const renderActions = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Actions"
        subtitle="Execute common tasks with one tap."
        icon={Zap}
      />
      <ActionGrid
        actions={DEFAULT_ACTIONS}
        onAction={executeAction}
      />
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'chat') return renderChat();
    if (activeModule === 'memory') return renderMemory();
    if (activeModule === 'tasks') return renderTasks();
    if (activeModule === 'calendar') return renderCalendar();
    if (activeModule === 'workspace') return renderWorkspace();
    if (activeModule === 'wallet') return renderWallet();
    if (activeModule === 'education') return renderEducation();
    if (activeModule === 'business') return renderBusiness();
    if (activeModule === 'actions') return renderActions();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Aarush Personal AI"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Aarush Personal AI</strong>
          <span>
            Your intelligence layer across Aarush
          </span>
        </div>

        <button
          type="button"
          aria-label="AI settings"
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

      {taskModal ? (
        <Modal
          title="Create AI Task"
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
              placeholder="Plan my next story"
              style={styles.textInput}
            />
          </label>

          <label style={styles.field}>
            Priority
            <select
              value={taskPriority}
              onChange={(event) =>
                setTaskPriority(event.target.value)
              }
              style={styles.select}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
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
        @keyframes aarush-ai-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-ai-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 44px rgba(124,92,255,.52);
          }
        }

        .aarush-ai-card:hover,
        .aarush-ai-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-ai-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-ai-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-ai-actions {
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

function ChatComposer({
  inputRef,
  value,
  onChange,
  onSend,
  onVoice,
  onAttach,
}) {
  return (
    <div style={styles.composer}>
      <button
        type="button"
        onClick={onAttach}
        aria-label="Attach file"
        style={styles.composerButton}
      >
        <Paperclip size={16} />
      </button>
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSend();
        }}
        placeholder="Ask Aarush anything..."
        aria-label="Message Aarush AI"
        style={styles.composerInput}
      />
      <button
        type="button"
        onClick={onVoice}
        aria-label="Voice input"
        style={styles.composerButton}
      >
        <Mic size={16} />
      </button>
      <button
        type="button"
        onClick={onSend}
        aria-label="Send message"
        style={styles.sendButton}
      >
        <Send size={16} />
      </button>
    </div>
  );
}

function ActionGrid({ actions, onAction }) {
  return (
    <div style={styles.actionGrid}>
      {actions.map(([label, Icon]) => (
        <button
          type="button"
          key={label}
          onClick={() => onAction(label)}
          style={styles.actionButton}
        >
          <Icon size={15} />
          <span>{label}</span>
          <ChevronRight
            size={14}
            style={{ marginLeft: 'auto' }}
          />
        </button>
      ))}
    </div>
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
      <Sparkles size={25} />
      <span>{label}</span>
    </div>
  );
}

function normalizeMessages(items) {
  return items.map((item, index) => ({
    ...item,
    id: item?.id || `conversation-${index}`,
    role: item?.role || 'assistant',
    content:
      item?.content ||
      item?.text ||
      item?.message ||
      '',
  }));
}

function getAssistantReply(text) {
  const normalized = text.toLowerCase();

  if (normalized.includes('task')) {
    return 'I can turn that into a task with a priority and deadline.';
  }

  if (normalized.includes('calendar') || normalized.includes('meeting')) {
    return 'I can help find a suitable time and prepare a calendar event.';
  }

  if (normalized.includes('story')) {
    return 'I can help plan, create, translate, or schedule your next story.';
  }

  return 'I understand. I can use your Aarush context to help plan the next step.';
}

function BarChartIcon() {
  return (
    <span style={styles.customIcon}>
      <BarChartSvg />
    </span>
  );
}

function BarChartSvg() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function UsersIcon() {
  return <Users size={17} />;
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.6),#07090e 68%)',
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

  aiHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.2),rgba(77,215,255,.06))',
    animation: 'aarush-ai-pulse 3s ease-in-out infinite',
  },

  aiOrb: {
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

  aiCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.25rem',
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

  aiCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  aiCopyP: {
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
    animation: 'aarush-ai-in 240ms ease both',
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
    animation: 'aarush-ai-in 240ms ease both',
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

  composer: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.35rem',
    border: '1px solid rgba(124,92,255,.2)',
    borderRadius: '.85rem',
    background: 'rgba(124,92,255,.06)',
  },

  composerButton: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '.6rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  composerInput: {
    minWidth: 0,
    minHeight: '2.35rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.67rem',
  },

  sendButton: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '.6rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.4rem',
  },

  actionButton: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(124,92,255,.15)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  chatList: {
    maxHeight: '30rem',
    display: 'grid',
    gap: '.5rem',
    overflowY: 'auto',
    padding: '.2rem',
  },

  messageRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '.45rem',
  },

  userMessageRow: {
    flexDirection: 'row-reverse',
  },

  messageAvatar: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.12)',
  },

  userAvatar: {
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  messageBubble: {
    maxWidth: '80%',
    padding: '.55rem .65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
  },

  messageBubbleSmall: {
    color: '#91a0bc',
    fontSize: '.52rem',
  },

  messageBubbleP: {
    margin: '.25rem 0 0',
    fontSize: '.65rem',
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap',
  },

  typing: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '.5rem',
    color: '#9deeff',
    fontSize: '.58rem',
  },

  typingI: {
    width: '.3rem',
    height: '.3rem',
    borderRadius: '999px',
    background: '#4dd7ff',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.7rem',
    marginBottom: '.7rem',
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

  memoryCategories: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  categoryButton: {
    minHeight: '2.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.56rem',
    cursor: 'pointer',
  },

  memoryList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  memoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  memoryIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
  },

  memoryCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  memoryCopySpan: {
    color: '#cbd6ec',
    fontSize: '.59rem',
  },

  memoryCopySmall: {
    color: '#91a0bc',
    fontSize: '.54rem',
  },

  memoryActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.7rem',
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

  calendarFilters: {
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

  eventTime: {
    minWidth: '3.7rem',
    color: '#9deeff',
    fontSize: '.57rem',
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

  workspaceNote: {
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

  walletNote: {
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

  educationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    marginTop: '.65rem',
    color: '#aab6cf',
    fontSize: '.62rem',
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
    marginTop: '.7rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
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
};