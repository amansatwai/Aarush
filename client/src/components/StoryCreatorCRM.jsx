import {
  useMemo,
  useState,
} from 'react';
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  Filter,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Star,
  Tag,
  Target,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

const MODULES = [
  ['dashboard', 'Dashboard'],
  ['contacts', 'Contacts'],
  ['brands', 'Brands'],
  ['deals', 'Deals'],
  ['campaigns', 'Campaigns'],
  ['tasks', 'Tasks'],
  ['calendar', 'Calendar'],
  ['notes', 'Notes'],
  ['invoices', 'Invoices'],
  ['insights', 'AI Insights'],
];

const DEAL_STAGES = [
  'Lead',
  'Contacted',
  'Proposal Sent',
  'Negotiating',
  'Contract',
  'Scheduled',
  'Active',
  'Completed',
  'Lost',
];

const INVOICE_STATUSES = [
  'Draft',
  'Sent',
  'Viewed',
  'Paid',
  'Overdue',
  'Cancelled',
];

function number(value) {
  return Number(value) || 0;
}

function money(value, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(number(value));
  } catch {
    return `${currency} ${Math.round(number(value))}`;
  }
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

function normalizeContact(contact, index) {
  return {
    ...contact,
    id: contact?.id || `contact-${index}`,
    name:
      contact?.name ||
      contact?.fullName ||
      contact?.full_name ||
      'Creator Contact',
    type: contact?.type || 'Brand',
    company: contact?.company || '',
    email: contact?.email || '',
    country: contact?.country || '',
    status: contact?.status || 'Active',
    tags: Array.isArray(contact?.tags)
      ? contact.tags
      : [],
    lastInteraction:
      contact?.lastInteraction ||
      contact?.last_interaction ||
      null,
  };
}

function normalizeDeal(deal, index) {
  return {
    ...deal,
    id: deal?.id || `deal-${index}`,
    title: deal?.title || 'Creator Deal',
    brand: deal?.brand || deal?.brandName || 'Brand',
    stage: deal?.stage || 'Lead',
    value: number(deal?.value || deal?.budget),
    currency: deal?.currency || 'INR',
    priority: deal?.priority || 'Medium',
    deadline: deal?.deadline || null,
    campaign: deal?.campaign || '',
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

export default function StoryCreatorCRM({
  contacts = [],
  brands = [],
  clients = [],
  deals = [],
  campaigns = [],
  tasks = [],
  notes = [],
  invoices = [],
  analytics = {},
  onCreateContact,
  onCreateDeal,
  onCreateTask,
  onOpenBrand,
  onOpenDeal,
  onClose,
}) {
  const normalizedContacts = useMemo(
    () =>
      [...contacts, ...clients].map(normalizeContact),
    [clients, contacts]
  );

  const normalizedDeals = useMemo(
    () => deals.map(normalizeDeal),
    [deals]
  );

  const [activeModule, setActiveModule] =
    useState('dashboard');
  const [search, setSearch] = useState('');
  const [dealStage, setDealStage] =
    useState('Lead');
  const [notice, setNotice] = useState('');
  const [contactModal, setContactModal] =
    useState(false);
  const [dealModal, setDealModal] =
    useState(false);
  const [taskModal, setTaskModal] =
    useState(false);
  const [contactName, setContactName] =
    useState('');
  const [contactType, setContactType] =
    useState('Brand');
  const [dealTitle, setDealTitle] =
    useState('');
  const [dealValue, setDealValue] =
    useState('');
  const [taskTitle, setTaskTitle] =
    useState('');

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const activeDeals = normalizedDeals.filter(
    (deal) =>
      !['Completed', 'Lost'].includes(deal.stage)
  );

  const pipelineValue = normalizedDeals.reduce(
    (total, deal) => total + deal.value,
    0
  );

  const filteredContacts = normalizedContacts.filter(
    (contact) =>
      !search ||
      [
        contact.name,
        contact.company,
        contact.email,
        contact.country,
        contact.type,
        contact.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const createContact = () => {
    if (!contactName.trim()) {
      showNotice('Enter a contact name.');
      return;
    }

    onCreateContact?.({
      id: `contact-${Date.now()}`,
      name: contactName.trim(),
      type: contactType,
      status: 'Active',
      createdAt: new Date().toISOString(),
    });

    setContactName('');
    setContactModal(false);
    showNotice('Contact created.');
  };

  const createDeal = () => {
    if (!dealTitle.trim()) {
      showNotice('Enter a deal title.');
      return;
    }

    onCreateDeal?.({
      id: `deal-${Date.now()}`,
      title: dealTitle.trim(),
      value: Number(dealValue) || 0,
      stage: dealStage,
      createdAt: new Date().toISOString(),
    });

    setDealTitle('');
    setDealValue('');
    setDealModal(false);
    showNotice('Deal created.');
  };

  const createTask = () => {
    if (!taskTitle.trim()) {
      showNotice('Enter a task title.');
      return;
    }

    onCreateTask?.({
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      priority: 'Medium',
      status: 'Open',
      createdAt: new Date().toISOString(),
    });

    setTaskTitle('');
    setTaskModal(false);
    showNotice('Task created.');
  };

  const renderDashboard = () => (
    <>
      <section style={styles.metricGrid}>
        <MetricCard
          label="Active Brands"
          value={brands.length}
          icon={Briefcase}
          color="#4dd7ff"
        />
        <MetricCard
          label="Active Deals"
          value={activeDeals.length}
          icon={Target}
          color="#a895ff"
        />
        <MetricCard
          label="Pipeline Value"
          value={money(pipelineValue)}
          icon={DollarSign}
          color="#82e9c1"
        />
        <MetricCard
          label="Monthly Revenue"
          value={money(analytics.monthlyRevenue)}
          icon={BarChart3}
          color="#ffd27d"
        />
        <MetricCard
          label="Pending Invoices"
          value={invoices.filter(
            (invoice) =>
              invoice.status !== 'Paid'
          ).length}
          icon={FileText}
          color="#ff9f72"
        />
        <MetricCard
          label="Follow-ups Today"
          value={tasks.filter(
            (task) => task.dueToday
          ).length}
          icon={Clock3}
          color="#ff4fd8"
        />
        <MetricCard
          label="Campaigns Running"
          value={campaigns.filter(
            (campaign) =>
              campaign.status === 'Active'
          ).length}
          icon={CalendarDays}
          color="#9deeff"
        />
        <MetricCard
          label="Conversion Rate"
          value={`${number(
            analytics.conversionRate
          )}%`}
          icon={Check}
          color="#82e9c1"
        />
      </section>

      <section style={styles.quickSection}>
        <div style={styles.sectionHeader}>
          <div>
            <h2>Quick Actions</h2>
            <span>Move your creator business forward.</span>
          </div>
          <SparkleIcon />
        </div>

        <div style={styles.quickGrid}>
          <QuickAction
            label="Add Contact"
            icon={UserPlus}
            onClick={() => setContactModal(true)}
          />
          <QuickAction
            label="Create Deal"
            icon={Target}
            onClick={() => setDealModal(true)}
          />
          <QuickAction
            label="Create Task"
            icon={Check}
            onClick={() => setTaskModal(true)}
          />
          <QuickAction
            label="Open Calendar"
            icon={CalendarDays}
            onClick={() => setActiveModule('calendar')}
          />
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2>Deal Pipeline</h2>
            <span>Track every opportunity from lead to completion.</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModule('deals')}
            style={styles.smallButton}
          >
            Full pipeline
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={styles.pipeline}>
          {DEAL_STAGES.slice(0, 6).map((stage) => {
            const stageDeals = normalizedDeals.filter(
              (deal) => deal.stage === stage
            );

            return (
              <div
                key={stage}
                style={styles.pipelineColumn}
              >
                <div style={styles.pipelineHeader}>
                  <span>{stage}</span>
                  <strong>{stageDeals.length}</strong>
                </div>

                {stageDeals.slice(0, 3).map((deal) => (
                  <button
                    type="button"
                    key={deal.id}
                    onClick={() => onOpenDeal?.(deal)}
                    style={styles.pipelineDeal}
                  >
                    <strong>{deal.title}</strong>
                    <span>{deal.brand}</span>
                    <small>
                      {money(deal.value, deal.currency)}
                    </small>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );

  const renderContacts = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Contacts</h2>
          <span>Manage your creator relationships.</span>
        </div>
        <button
          type="button"
          onClick={() => setContactModal(true)}
          style={styles.smallPrimary}
        >
          <Plus size={14} />
          Add contact
        </button>
      </div>

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search contacts, brands, tags"
          aria-label="Search contacts"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.contactList}>
        {filteredContacts.length ? (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              style={styles.contactRow}
            >
              <Avatar contact={contact} />

              <div style={styles.contactCopy}>
                <strong>{contact.name}</strong>
                <span>
                  {contact.company || contact.type} ·{' '}
                  {contact.status}
                </span>
                <small>
                  Last interaction:{' '}
                  {formatDate(contact.lastInteraction)}
                </small>
              </div>

              <button
                type="button"
                onClick={() => showNotice('Contact notes opened.')}
                aria-label="Open contact notes"
                style={styles.tinyButton}
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="No contacts found." />
        )}
      </div>
    </section>
  );

  const renderDeals = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Deal Pipeline</h2>
          <span>Drag-and-drop foundation for opportunities.</span>
        </div>
        <button
          type="button"
          onClick={() => setDealModal(true)}
          style={styles.smallPrimary}
        >
          <Plus size={14} />
          New deal
        </button>
      </div>

      <div style={styles.stageSelector}>
        {DEAL_STAGES.map((stage) => (
          <button
            type="button"
            key={stage}
            onClick={() => setDealStage(stage)}
            aria-pressed={dealStage === stage}
            style={{
              ...styles.stageButton,
              ...(dealStage === stage
                ? styles.activeStageButton
                : {}),
            }}
          >
            {stage}
          </button>
        ))}
      </div>

      <div style={styles.dealList}>
        {normalizedDeals
          .filter((deal) => deal.stage === dealStage)
          .map((deal) => (
            <button
              type="button"
              key={deal.id}
              onClick={() => onOpenDeal?.(deal)}
              style={styles.dealRow}
            >
              <span style={styles.dealIcon}>
                <Target size={16} />
              </span>
              <span style={styles.dealCopy}>
                <strong>{deal.title}</strong>
                <span>
                  {deal.brand} · Due{' '}
                  {formatDate(deal.deadline)}
                </span>
              </span>
              <strong>
                {money(deal.value, deal.currency)}
              </strong>
              <ChevronRight size={15} />
            </button>
          ))}

        {!normalizedDeals.filter(
          (deal) => deal.stage === dealStage
        ).length ? (
          <Empty label={`No deals in ${dealStage}.`} />
        ) : null}
      </div>
    </section>
  );

  const renderTasks = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Tasks</h2>
          <span>Follow-ups and creator operations.</span>
        </div>
        <button
          type="button"
          onClick={() => setTaskModal(true)}
          style={styles.smallPrimary}
        >
          <Plus size={14} />
          New task
        </button>
      </div>

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
                  {task.title || task.label}
                </strong>
                <small>
                  {task.priority || 'Medium'} · Due{' '}
                  {formatDate(task.dueDate)}
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

  const renderBrands = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Brands</h2>
          <span>Profiles and long-term relationships.</span>
        </div>
        <Briefcase size={18} color="#ffd27d" />
      </div>

      <div style={styles.brandList}>
        {brands.length ? (
          brands.map((brand, index) => (
            <button
              type="button"
              key={brand.id || index}
              onClick={() => onOpenBrand?.(brand)}
              style={styles.brandRow}
            >
              <span style={styles.brandLogo}>
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt=""
                    loading="lazy"
                    style={styles.logoImage}
                  />
                ) : (
                  <Briefcase size={18} />
                )}
              </span>

              <span style={styles.brandCopy}>
                <strong>
                  {brand.name || 'Brand partner'}
                </strong>
                <span>
                  {brand.industry || 'Industry foundation'} ·{' '}
                  {brand.country || 'Global'}
                </span>
                <small>
                  Avg deal {money(brand.averageDealValue)}
                </small>
              </span>

              <ChevronRight size={15} />
            </button>
          ))
        ) : (
          <Empty label="No brands yet." />
        )}
      </div>
    </section>
  );

  const renderInvoices = () => (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Invoices</h2>
          <span>Track creator payments and due dates.</span>
        </div>
        <FileText size={18} color="#82e9c1" />
      </div>

      <div style={styles.invoiceList}>
        {invoices.length ? (
          invoices.map((invoice, index) => (
            <div
              key={invoice.id || index}
              style={styles.invoiceRow}
            >
              <span style={styles.invoiceIcon}>
                <DollarSign size={16} />
              </span>
              <span style={styles.invoiceCopy}>
                <strong>
                  {invoice.number || `INV-${index + 1}`}
                </strong>
                <span>
                  {invoice.brand || 'Brand'} · Due{' '}
                  {formatDate(invoice.dueDate)}
                </span>
              </span>
              <strong>
                {money(invoice.amount, invoice.currency)}
              </strong>
              <span style={styles.invoiceStatus}>
                {invoice.status || 'Draft'}
              </span>
            </div>
          ))
        ) : (
          <Empty label="No invoices yet." />
        )}
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'dashboard') return renderDashboard();
    if (activeModule === 'contacts') return renderContacts();
    if (activeModule === 'deals') return renderDeals();
    if (activeModule === 'tasks') return renderTasks();
    if (activeModule === 'brands') return renderBrands();
    if (activeModule === 'invoices') return renderInvoices();

    return (
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2>
              {MODULES.find(
                ([id]) => id === activeModule
              )?.[1] || 'CRM Module'}
            </h2>
            <span>
              This creator CRM workspace is ready for
              integration.
            </span>
          </div>
          <SparkleIcon />
        </div>

        <Empty label="Module foundation ready." />
      </section>
    );
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Creator CRM"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Creator CRM</strong>
          <span>Relationships, deals, and follow-ups</span>
        </div>

        <button
          type="button"
          aria-label="CRM settings"
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
          {MODULES.map(([id, label]) => (
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
              {label}
            </button>
          ))}
        </nav>

        {renderModule()}
      </div>

      {contactModal ? (
        <Modal
          title="Create Contact"
          onClose={() => setContactModal(false)}
        >
          <label style={styles.field}>
            Name
            <input
              autoFocus
              value={contactName}
              onChange={(event) =>
                setContactName(event.target.value)
              }
              placeholder="Brand or collaborator name"
              style={styles.textInput}
            />
          </label>

          <label style={styles.field}>
            Contact type
            <select
              value={contactType}
              onChange={(event) =>
                setContactType(event.target.value)
              }
              style={styles.select}
            >
              <option>Brand</option>
              <option>Agency</option>
              <option>Sponsor</option>
              <option>Client</option>
              <option>Collaborator</option>
              <option>Subscriber</option>
            </select>
          </label>

          <button
            type="button"
            onClick={createContact}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create Contact
          </button>
        </Modal>
      ) : null}

      {dealModal ? (
        <Modal
          title="Create Deal"
          onClose={() => setDealModal(false)}
        >
          <label style={styles.field}>
            Deal title
            <input
              autoFocus
              value={dealTitle}
              onChange={(event) =>
                setDealTitle(event.target.value)
              }
              placeholder="Summer campaign"
              style={styles.textInput}
            />
          </label>

          <label style={styles.field}>
            Deal value
            <input
              type="number"
              min="0"
              value={dealValue}
              onChange={(event) =>
                setDealValue(event.target.value)
              }
              placeholder="Enter value"
              style={styles.textInput}
            />
          </label>

          <label style={styles.field}>
            Pipeline stage
            <select
              value={dealStage}
              onChange={(event) =>
                setDealStage(event.target.value)
              }
              style={styles.select}
            >
              {DEAL_STAGES.map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={createDeal}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create Deal
          </button>
        </Modal>
      ) : null}

      {taskModal ? (
        <Modal
          title="Create Task"
          onClose={() => setTaskModal(false)}
        >
          <label style={styles.field}>
            Task
            <input
              autoFocus
              value={taskTitle}
              onChange={(event) =>
                setTaskTitle(event.target.value)
              }
              placeholder="Follow up with brand"
              style={styles.textInput}
            />
          </label>

          <button
            type="button"
            onClick={createTask}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create Task
          </button>
        </Modal>
      ) : null}

      <style>{`
        @keyframes aarush-crm-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .aarush-crm-module:hover,
        .aarush-crm-quick:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 600px) {
          .aarush-crm-module-nav {
            grid-template-columns: repeat(4,1fr) !important;
          }

          .aarush-crm-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-crm-pipeline {
            grid-template-columns: repeat(3, 13rem) !important;
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
      style={styles.quickButton}
    >
      <span style={styles.quickIcon}>
        <Icon size={17} />
      </span>
      {label}
    </button>
  );
}

function PipelineRow({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.pipelineRow}
    >
      <span>{label}</span>
      <strong>{value}</strong>
      <ChevronRight size={15} />
    </button>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <article style={styles.metricCard}>
      <span
        style={{
          ...styles.metricIcon,
          color,
          background: `${color}18`,
        }}
      >
        <Icon size={16} />
      </span>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </article>
  );
}

function Avatar({ contact }) {
  if (contact?.avatar) {
    return (
      <img
        src={contact.avatar}
        alt=""
        loading="lazy"
        style={styles.avatar}
      />
    );
  }

  return (
    <span style={styles.avatarFallback}>
      {String(contact?.name || 'A')
        .charAt(0)
        .toUpperCase()}
    </span>
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
      <Briefcase size={25} />
      <span>{label}</span>
    </div>
  );
}

function SparkleIcon() {
  return (
    <span style={styles.customIcon}>
      <Sparkles size={18} />
    </span>
  );
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
  });
}

const DEAL_STAGES = [
  'Lead',
  'Contacted',
  'Proposal Sent',
  'Negotiating',
  'Contract',
  'Scheduled',
  'Active',
  'Completed',
  'Lost',
];

const MODULES = [
  ['dashboard', 'Dashboard'],
  ['contacts', 'Contacts'],
  ['brands', 'Brands'],
  ['deals', 'Deals'],
  ['campaigns', 'Campaigns'],
  ['tasks', 'Tasks'],
  ['calendar', 'Calendar'],
  ['notes', 'Notes'],
  ['invoices', 'Invoices'],
  ['insights', 'AI Insights'],
];

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
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
    width: 'min(100%, 1100px)',
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
    minWidth: '5rem',
    minHeight: '2.45rem',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.59rem',
    cursor: 'pointer',
  },

  activeModuleButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
  },

  metricCard: {
    minHeight: '6.5rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    background: 'rgba(15,19,30,.9)',
    animation: 'aarush-crm-in 240ms ease both',
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
    fontSize: '.58rem',
  },

  metricValue: {
    color: '#fff',
    fontSize: '.82rem',
  },

  quickSection: {
    padding: '.9rem',
    border: '1px solid rgba(124,92,255,.22)',
    borderRadius: '1.1rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.1),rgba(77,215,255,.04))',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-crm-in 240ms ease both',
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

  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  quickButton: {
    minHeight: '4.2rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.3rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.8rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.6rem',
    cursor: 'pointer',
  },

  quickIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.7rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.8rem',
  },

  pipeline: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(12rem,1fr))',
    gap: '.45rem',
    overflowX: 'auto',
    paddingBottom: '.25rem',
  },

  pipelineColumn: {
    minHeight: '10rem',
    padding: '.5rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  pipelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '.4rem',
    color: '#aab6cf',
    fontSize: '.6rem',
  },

  pipelineDeal: {
    width: '100%',
    display: 'grid',
    gap: '.18rem',
    marginBottom: '.35rem',
    padding: '.45rem',
    border: '1px solid rgba(124,92,255,.14)',
    borderRadius: '.55rem',
    color: '#dce5f8',
    background: 'rgba(124,92,255,.05)',
    fontSize: '.58rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  pipelineDealSpan: {
    color: '#91a0bc',
  },

  pipelineDealSmall: {
    color: '#82e9c1',
    fontSize: '.54rem',
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

  contactList: {
    display: 'grid',
    gap: '.4rem',
  },

  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  avatar: {
    width: '2.6rem',
    height: '2.6rem',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '999px',
  },

  avatarFallback: {
    width: '2.6rem',
    height: '2.6rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  contactCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  contactCopySpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  contactCopySmall: {
    color: '#6f7d98',
    fontSize: '.55rem',
  },

  tinyButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.5rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.05)',
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
    fontSize: '.6rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  stageSelector: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.3rem',
  },

  stageButton: {
    minHeight: '2.2rem',
    flexShrink: 0,
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeStageButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background: 'rgba(124,92,255,.18)',
  },

  dealList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  dealRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  dealIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  dealCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  dealCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
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
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
  },

  taskCheck: {
    width: '1.4rem',
    height: '1.4rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(130,233,193,.25)',
    borderRadius: '.4rem',
    color: '#82e9c1',
  },

  taskCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  taskCopySmall: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  brandList: {
    display: 'grid',
    gap: '.4rem',
  },

  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  brandLogo: {
    width: '2.5rem',
    height: '2.5rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '.6rem',
  },

  brandCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  brandCopySpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  brandCopySmall: {
    color: '#6f7d98',
    fontSize: '.55rem',
  },

  invoiceList: {
    display: 'grid',
    gap: '.4rem',
  },

  invoiceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  invoiceIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#82e9c1',
    background: 'rgba(130,233,193,.1)',
  },

  invoiceCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  invoiceCopySpan: {
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  invoiceStatus: {
    padding: '.25rem .4rem',
    borderRadius: '999px',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.1)',
    fontSize: '.54rem',
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
    marginTop: '.6rem',
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