import { useMemo, useState } from 'react';
import {
  Archive,
  Check,
  ChevronRight,
  Cloud,
  Copy,
  Download,
  File,
  FileText,
  Folder,
  FolderOpen,
  Grid3X3,
  Image as ImageIcon,
  List,
  LockKeyhole,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', Cloud],
  ['drive', 'My Drive', FolderOpen],
  ['recent', 'Recent', RefreshCw],
  ['favorites', 'Favorites', Star],
  ['shared', 'Shared', Share2],
  ['photos', 'Photos', ImageIcon],
  ['videos', 'Videos', Video],
  ['documents', 'Documents', FileText],
  ['backups', 'Backups', Archive],
  ['sync', 'Sync', RefreshCw],
  ['assistant', 'AI Assistant', Sparkles],
];

function numeric(value) {
  return Number(value) || 0;
}

function bytes(value) {
  const amount = numeric(value);

  if (amount >= 1024 ** 3) {
    return `${(amount / 1024 ** 3).toFixed(1)} GB`;
  }

  if (amount >= 1024 ** 2) {
    return `${(amount / 1024 ** 2).toFixed(1)} MB`;
  }

  if (amount >= 1024) {
    return `${(amount / 1024).toFixed(1)} KB`;
  }

  return `${Math.round(amount)} B`;
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

function normalizeFile(file, index) {
  return {
    ...file,
    id: file?.id || `file-${index}`,
    name: file?.name || file?.title || 'Untitled file',
    type: file?.type || 'file',
    size: numeric(file?.size),
    location: file?.location || 'My Drive',
    updatedAt: file?.updatedAt || file?.lastOpened || null,
    shared: Boolean(file?.shared),
    favorite: Boolean(file?.favorite || file?.starred),
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

export default function CloudStorageOS({
  user = {},
  storage = {},
  folders = [],
  files = [],
  sharedFiles = [],
  recentFiles = [],
  favorites = [],
  backups = [],
  syncStatus = {},
  permissions = [],
  onUploadFile,
  onCreateFolder,
  onOpenFile,
  onShareFile,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [viewMode, setViewMode] = useState('Grid');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Recent');
  const [notice, setNotice] = useState('');

  const normalizedFiles = useMemo(
    () => files.map(normalizeFile),
    [files]
  );

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = normalizedFiles.filter((file) => {
      if (!query) return true;

      return [
        file.name,
        file.type,
        file.location,
        file.tags?.join?.(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });

    return [...result].sort((a, b) => {
      if (sort === 'Name') {
        return a.name.localeCompare(b.name);
      }

      if (sort === 'Size') {
        return b.size - a.size;
      }

      return (
        new Date(b.updatedAt || 0) -
        new Date(a.updatedAt || 0)
      );
    });
  }, [normalizedFiles, search, sort]);

  const usedStorage =
    numeric(storage.used) ||
    normalizedFiles.reduce(
      (total, file) => total + file.size,
      0
    );

  const totalStorage = numeric(storage.total);
  const availableStorage = Math.max(
    0,
    totalStorage - usedStorage
  );

  const storagePercent = totalStorage
    ? Math.min(100, (usedStorage / totalStorage) * 100)
    : 0;

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const uploadFile = () => {
    onUploadFile?.();
    showNotice('Upload flow opened.');
  };

  const createFolder = () => {
    onCreateFolder?.({
      name: 'New folder',
      parentId: storage.currentFolderId,
    });
    showNotice('Folder creation prepared.');
  };

  const renderOverview = () => (
    <>
      <section style={styles.storageHero}>
        <div style={styles.storageOrb}>
          <Cloud size={32} />
        </div>
        <div style={styles.storageCopy}>
          <span style={styles.aiBadge}>
            <ShieldCheck size={12} />
            Aarush CloudStorageOS
          </span>
          <h1>Everything, safely in one place</h1>
          <p>
            Store photos, videos, documents, story assets,
            workspace files, backups, and AI-understood content
            across the Aarush ecosystem.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Cloud size={13} />
              {syncStatus.status || 'Cloud connected'}
            </span>
            <span>
              <Sparkles size={13} />
              AI organization:{' '}
              {storage.aiOrganizationScore || 88}%
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Total storage"
          value={bytes(totalStorage)}
          icon={Cloud}
          color="#4dd7ff"
        />
        <MetricCard
          label="Used storage"
          value={bytes(usedStorage)}
          icon={FolderOpen}
          color="#a895ff"
        />
        <MetricCard
          label="Available"
          value={bytes(availableStorage)}
          icon={Check}
          color="#82e9c1"
        />
        <MetricCard
          label="Sync status"
          value={syncStatus.status || 'Ready'}
          icon={RefreshCw}
          color="#ffd27d"
        />
        <MetricCard
          label="Shared storage"
          value={bytes(storage.shared)}
          icon={Share2}
          color="#9deeff"
        />
        <MetricCard
          label="Backup status"
          value={storage.backupStatus || 'Ready'}
          icon={Archive}
          color="#ff4fd8"
        />
        <MetricCard
          label="AI organization"
          value={`${storage.aiOrganizationScore || 88}%`}
          icon={Sparkles}
          color="#82e9c1"
        />
        <MetricCard
          label="Storage health"
          value={`${storage.healthScore || 92}/100`}
          icon={ShieldCheck}
          color="#ff9f72"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Storage Usage"
          subtitle="Your cloud capacity at a glance."
          icon={BarIcon}
        />

        <div style={styles.storageBar}>
          <span
            style={{
              ...styles.storageFill,
              width: `${storagePercent}%`,
            }}
          />
        </div>

        <div style={styles.storageMeta}>
          <span>{bytes(usedStorage)} used</span>
          <strong>
            {totalStorage ? `${Math.round(storagePercent)}%` : 'Foundation'}
          </strong>
          <span>{bytes(totalStorage)} total</span>
        </div>
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Quick Actions"
          subtitle="Manage files and folders quickly."
          icon={Cloud}
        />

        <div style={styles.quickGrid}>
          <QuickAction
            label="Upload"
            icon={Upload}
            onClick={uploadFile}
          />
          <QuickAction
            label="New Folder"
            icon={Plus}
            onClick={createFolder}
          />
          <QuickAction
            label="Shared Files"
            icon={Share2}
            onClick={() => setActiveModule('shared')}
          />
          <QuickAction
            label="AI Assistant"
            icon={Sparkles}
            onClick={() => setActiveModule('assistant')}
          />
        </div>
      </section>
    </>
  );

  const renderDrive = () => (
    <section style={styles.section}>
      <SectionTitle
        title="My Drive"
        subtitle="Files, folders, breadcrumbs, and shared assets."
        icon={FolderOpen}
        action={
          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={uploadFile}
              style={styles.smallPrimary}
            >
              <Upload size={14} />
              Upload
            </button>
            <button
              type="button"
              onClick={createFolder}
              style={styles.smallButton}
            >
              <Plus size={14} />
              Folder
            </button>
          </div>
        }
      />

      <div style={styles.breadcrumb}>
        <FolderOpen size={14} />
        <span>My Drive</span>
        <ChevronRight size={13} />
        <strong>
          {storage.currentFolder || 'Root'}
        </strong>
      </div>

      <div style={styles.driveTools}>
        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search files and folders"
            aria-label="Search files and folders"
            style={styles.searchInput}
          />
        </div>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
          aria-label="Sort files"
          style={styles.select}
        >
          <option>Recent</option>
          <option>Name</option>
          <option>Size</option>
        </select>

        <button
          type="button"
          onClick={() =>
            setViewMode((value) =>
              value === 'Grid' ? 'List' : 'Grid'
            )
          }
          aria-label="Toggle file view"
          style={styles.iconButton}
        >
          {viewMode === 'Grid' ? (
            <List size={16} />
          ) : (
            <Grid3X3 size={16} />
          )}
        </button>
      </div>

      <div
        style={
          viewMode === 'Grid'
            ? styles.fileGrid
            : styles.fileList
        }
      >
        {folders.map((folder, index) => (
          <button
            type="button"
            key={folder.id || index}
            onClick={() => showNotice(`Opened ${folder.name}.`)}
            style={styles.folderCard}
          >
            <Folder size={23} />
            <strong>{folder.name || 'Folder'}</strong>
            <small>
              {folder.itemCount || 0} items
            </small>
          </button>
        ))}

        {filteredFiles.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            grid={viewMode === 'Grid'}
            onOpen={() => onOpenFile?.(file)}
            onShare={() => {
              onShareFile?.(file);
              showNotice('Share flow prepared.');
            }}
          />
        ))}

        {!folders.length && !filteredFiles.length ? (
          <Empty label="No files or folders found." />
        ) : null}
      </div>
    </section>
  );

  const renderRecent = () => (
    <FileCollection
      title="Recent"
      subtitle="Recently opened and updated files."
      icon={RefreshCw}
      files={recentFiles.length ? recentFiles : normalizedFiles}
      onOpen={onOpenFile}
      empty="No recent files."
    />
  );

  const renderFavorites = () => (
    <FileCollection
      title="Favorites"
      subtitle="Starred files and folders for quick access."
      icon={Star}
      files={favorites.length ? favorites : normalizedFiles.filter(
        (file) => file.favorite
      )}
      onOpen={onOpenFile}
      empty="No favorite files."
    />
  );

  const renderShared = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Shared"
        subtitle="Files shared with you, by you, and with teams."
        icon={Share2}
      />

      <div style={styles.sharedTabs}>
        {[
          ['Shared with Me', sharedFiles.filter(
            (file) => file.sharedWithMe
          )],
          ['Shared by Me', sharedFiles.filter(
            (file) => file.sharedByMe
          )],
          ['Team Shared', sharedFiles.filter(
            (file) => file.teamShared
          )],
        ].map(([label, items]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} selected.`)
            }
            style={styles.sharedTab}
          >
            <Share2 size={16} />
            <span>{label}</span>
            <strong>{items.length}</strong>
          </button>
        ))}
      </div>

      <div style={styles.fileList}>
        {sharedFiles.length ? (
          sharedFiles.map((file, index) => (
            <FileCard
              key={file.id || index}
              file={normalizeFile(file, index)}
              grid={false}
              onOpen={() => onOpenFile?.(file)}
              onShare={() => {
                onShareFile?.(file);
                showNotice('Permissions opened.');
              }}
            />
          ))
        ) : (
          <Empty label="No shared files." />
        )}
      </div>

      <div style={styles.foundationNote}>
        <LockKeyhole size={15} />
        Public links and permission management foundation ready.
      </div>
    </section>
  );

  const renderPhotos = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Photos"
        subtitle="Gallery, albums, memories, and AI search foundation."
        icon={ImageIcon}
      />

      <div style={styles.mediaTools}>
        {[
          'Albums',
          'Memories foundation',
          'AI search',
          'Face grouping foundation',
          'Date grouping',
          'Location grouping',
          'Favorites',
          'Archive',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} opened.`)
            }
            style={styles.toolChip}
          >
            <ImageIcon size={14} />
            {label}
          </button>
        ))}
      </div>

      <MediaGrid
        files={normalizedFiles.filter(
          (file) =>
            file.type === 'image' ||
            file.mimeType?.startsWith?.('image/')
        )}
        empty="No photos available."
        onOpen={onOpenFile}
      />
    </section>
  );

  const renderVideos = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Videos"
        subtitle="Story assets, workspace videos, and recordings."
        icon={Video}
      />

      <div style={styles.mediaTools}>
        {[
          'Preview foundation',
          'Story assets',
          'Workspace videos',
          'Live recordings foundation',
          'AI summaries',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} opened.`)
            }
            style={styles.toolChip}
          >
            <Video size={14} />
            {label}
          </button>
        ))}
      </div>

      <MediaGrid
        files={normalizedFiles.filter(
          (file) =>
            file.type === 'video' ||
            file.mimeType?.startsWith?.('video/')
        )}
        empty="No videos available."
        onOpen={onOpenFile}
      />
    </section>
  );

  const renderDocuments = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Documents"
        subtitle="Notes, docs, PDFs, presentations, and whiteboards."
        icon={FileText}
      />

      <div style={styles.documentTypes}>
        {[
          'Notes',
          'Docs',
          'PDFs',
          'Presentations',
          'Spreadsheets',
          'Whiteboards',
          'Templates',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} selected.`)
            }
            style={styles.documentType}
          >
            <FileText size={16} />
            {label}
          </button>
        ))}
      </div>

      <div style={styles.fileList}>
        {normalizedFiles.filter(
          (file) =>
            file.type === 'document' ||
            file.type === 'pdf' ||
            file.mimeType?.includes?.('document')
        ).length ? (
          normalizedFiles
            .filter(
              (file) =>
                file.type === 'document' ||
                file.type === 'pdf' ||
                file.mimeType?.includes?.('document')
            )
            .map((file) => (
              <FileCard
                key={file.id}
                file={file}
                grid={false}
                onOpen={() => onOpenFile?.(file)}
                onShare={() => {
                  onShareFile?.(file);
                  showNotice('Share flow prepared.');
                }}
              />
            ))
        ) : (
          <Empty label="No documents available." />
        )}
      </div>
    </section>
  );

  const renderBackups = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Backups"
        subtitle="Protect devices, stories, workspace files, and settings."
        icon={Archive}
      />

      <div style={styles.backupGrid}>
        {[
          ['Phone backup', backups.phone],
          ['Story backup', backups.stories],
          ['Workspace backup', backups.workspace],
          ['Photos backup', backups.photos],
          ['Videos backup', backups.videos],
          ['Contacts backup', backups.contacts],
          ['Settings backup', backups.settings],
        ].map(([label, value]) => (
          <div key={label} style={styles.backupCard}>
            <Archive size={17} />
            <strong>{label}</strong>
            <span>
              {value?.status || value || 'Foundation'}
            </span>
            <small>
              Last backup {formatDate(value?.lastBackup)}
            </small>
          </div>
        ))}
      </div>
    </section>
  );

  const renderSync = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Sync"
        subtitle="Synchronization across devices and Aarush services."
        icon={RefreshCw}
      />

      <div style={styles.syncHero}>
        <RefreshCw size={22} />
        <div>
          <strong>
            {syncStatus.status || 'Cloud sync ready'}
          </strong>
          <span>
            {syncStatus.lastSync
              ? `Last synced ${formatDate(syncStatus.lastSync)}`
              : 'Device, workspace, story, and messaging sync foundation ready.'}
          </span>
        </div>
      </div>

      <div style={styles.syncList}>
        {[
          ['Device sync', syncStatus.device],
          ['Workspace sync', syncStatus.workspace],
          ['Story sync', syncStatus.stories],
          ['Messaging media sync', syncStatus.messaging],
          ['Cloud sync', syncStatus.cloud],
          ['Pending uploads', syncStatus.pendingUploads],
          ['Conflicts foundation', syncStatus.conflicts],
        ].map(([label, value]) => (
          <div key={label} style={styles.syncRow}>
            <span>{label}</span>
            <strong>{value || 'Ready'}</strong>
            <Check size={14} color="#82e9c1" />
          </div>
        ))}
      </div>

      <div style={styles.syncActions}>
        {['Pause sync', 'Resume sync', 'Force sync', 'Offline mode foundation'].map(
          (label) => (
            <button
              type="button"
              key={label}
              onClick={() =>
                showNotice(`${label} selected.`)
              }
              style={styles.toolChip}
            >
              <RefreshCw size={14} />
              {label}
            </button>
          )
        )}
      </div>
    </section>
  );

  const renderAssistant = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI File Assistant"
        subtitle="Find, understand, organize, and tag your files."
        icon={Sparkles}
      />

      <div style={styles.aiActionGrid}>
        {[
          'Find File',
          'Summarize PDF',
          'Summarize Document',
          'Extract Text',
          'Organize Files',
          'Rename Files',
          'Detect Duplicates',
          'Create Folder Structure',
          'Search by Content',
          'Generate File Tags',
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
    if (activeModule === 'drive') return renderDrive();
    if (activeModule === 'recent') return renderRecent();
    if (activeModule === 'favorites') return renderFavorites();
    if (activeModule === 'shared') return renderShared();
    if (activeModule === 'photos') return renderPhotos();
    if (activeModule === 'videos') return renderVideos();
    if (activeModule === 'documents') return renderDocuments();
    if (activeModule === 'backups') return renderBackups();
    if (activeModule === 'sync') return renderSync();
    if (activeModule === 'assistant') return renderAssistant();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close CloudStorageOS"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>CloudStorageOS</strong>
          <span>
            Your files, everywhere and intelligently organized
          </span>
        </div>

        <button
          type="button"
          aria-label="Storage settings"
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
        @keyframes aarush-cloud-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-cloud-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-cloud-card:hover,
        .aarush-cloud-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-cloud-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-cloud-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-cloud-files {
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

function FileCollection({
  title,
  subtitle,
  icon: Icon,
  files,
  onOpen,
  empty,
}) {
  return (
    <section style={styles.section}>
      <SectionTitle
        title={title}
        subtitle={subtitle}
        icon={Icon}
      />
      <div style={styles.fileList}>
        {files.length ? (
          files.map((file, index) => (
            <FileCard
              key={file.id || index}
              file={normalizeFile(file, index)}
              grid={false}
              onOpen={() => onOpen?.(file)}
            />
          ))
        ) : (
          <Empty label={empty} />
        )}
      </div>
    </section>
  );
}

function FileCard({ file, grid, onOpen, onShare }) {
  const Icon =
    file.type === 'image'
      ? ImageIcon
      : file.type === 'video'
        ? Video
        : file.type === 'folder'
          ? Folder
          : FileText;

  if (grid) {
    return (
      <button
        type="button"
        onClick={onOpen}
        style={styles.fileCard}
      >
        <span style={styles.fileCardIcon}>
          <Icon size={25} />
        </span>
        <strong>{file.name}</strong>
        <span>{file.type} · {bytes(file.size)}</span>
        <small>{formatDate(file.updatedAt)}</small>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      style={styles.fileRow}
    >
      <span style={styles.fileRowIcon}>
        <Icon size={17} />
      </span>
      <span style={styles.fileRowCopy}>
        <strong>{file.name}</strong>
        <span>
          {file.type} · {bytes(file.size)} ·{' '}
          {file.location}
        </span>
        <small>
          {file.shared ? 'Shared' : 'Private'} ·{' '}
          {formatDate(file.updatedAt)}
        </small>
      </span>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onShare?.();
        }}
        aria-label="Share file"
        style={styles.tinyButton}
      >
        <ShareIcon />
      </button>
      <ChevronRight size={15} />
    </button>
  );
}

function MediaGrid({ files, empty, onOpen }) {
  return (
    <div style={styles.mediaGrid}>
      {files.length ? (
        files.map((file) => (
          <button
            type="button"
            key={file.id}
            onClick={() => onOpen?.(file)}
            style={styles.mediaCard}
          >
            {file.thumbnail || file.url ? (
              <img
                src={file.thumbnail || file.url}
                alt={file.name}
                loading="lazy"
                style={styles.mediaImage}
              />
            ) : (
              <div style={styles.mediaPlaceholder}>
                {file.type === 'video' ? (
                  <Video size={28} />
                ) : (
                  <ImageIcon size={28} />
                )}
              </div>
            )}
            <strong>{file.name}</strong>
            <small>{formatDate(file.updatedAt)}</small>
          </button>
        ))
      ) : (
        <Empty label={empty} />
      )}
    </div>
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

function ShareIcon() {
  return <Share2Icon />;
}

function Share2Icon() {
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
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4" />
      <path d="m15.4 6.5-6.8 4" />
    </svg>
  );
}

function BarIcon() {
  return (
    <span style={styles.customIcon}>
      <BarChart3 size={16} />
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

  storageHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-cloud-pulse 3s ease-in-out infinite',
  },

  storageOrb: {
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

  storageCopy: {
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

  storageCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  storageCopyP: {
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
    animation: 'aarush-cloud-in 240ms ease both',
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
    animation: 'aarush-cloud-in 240ms ease both',
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

  storageBar: {
    height: '.55rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.09)',
  },

  storageFill: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  storageMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginTop: '.35rem',
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  storageMetaStrong: {
    color: '#c9f9ff',
  },

  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  quickAction: {
    minHeight: '4rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.3rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.8rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.59rem',
    cursor: 'pointer',
  },

  headerActions: {
    display: 'flex',
    gap: '.35rem',
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

  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    marginBottom: '.6rem',
    color: '#91a0bc',
    fontSize: '.58rem',
  },

  breadcrumbStrong: {
    color: '#c9f9ff',
  },

  driveTools: {
    display: 'flex',
    alignItems: 'center',
    gap: '.45rem',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.7rem',
    flex: 1,
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

  fileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
    marginTop: '.7rem',
  },

  fileList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  folderCard: {
    minHeight: '7rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,210,125,.15)',
    borderRadius: '.75rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.05)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  folderCardSmall: {
    color: '#91a0bc',
    fontSize: '.54rem',
  },

  fileCard: {
    minHeight: '9rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  fileCardIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  fileCardSpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  fileCardSmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  fileRow: {
    width: '100%',
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

  fileRowIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  fileRowCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  fileRowCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  fileRowCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
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

  mediaTools: {
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

  mediaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
    marginTop: '.7rem',
  },

  mediaCard: {
    display: 'grid',
    gap: '.25rem',
    paddingBottom: '.45rem',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  mediaImage: {
    width: '100%',
    height: '7rem',
    objectFit: 'cover',
  },

  mediaPlaceholder: {
    height: '7rem',
    display: 'grid',
    placeItems: 'center',
    color: '#9deeff',
    background: 'rgba(77,215,255,.08)',
  },

  mediaCardStrong: {
    padding: '0 .5rem',
    fontSize: '.57rem',
  },

  mediaCardSmall: {
    padding: '0 .5rem',
    color: '#91a0bc',
    fontSize: '.53rem',
  },

  sharedTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  sharedTab: {
    minHeight: '4.5rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.2rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
    cursor: 'pointer',
  },

  sharedTabStrong: {
    color: '#9deeff',
  },

  foundationNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    marginTop: '.7rem',
    padding: '.65rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.05)',
    fontSize: '.58rem',
  },

  documentTypes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.4rem',
  },

  documentType: {
    minHeight: '3rem',
    display: 'grid',
    placeItems: 'center',
    gap: '.25rem',
    padding: '.4rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.65rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.55rem',
    cursor: 'pointer',
  },

  backupGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  backupCard: {
    minHeight: '6rem',
    display: 'grid',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    fontSize: '.57rem',
  },

  backupCardSpan: {
    color: '#82e9c1',
  },

  backupCardSmall: {
    color: '#91a0bc',
    fontSize: '.53rem',
  },

  syncHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.75rem',
    border: '1px solid rgba(77,215,255,.16)',
    borderRadius: '.8rem',
    color: '#c9f9ff',
    background:
      'linear-gradient(135deg,rgba(77,215,255,.1),rgba(124,92,255,.05))',
  },

  syncHeroDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  syncHeroSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  syncList: {
    display: 'grid',
    gap: '.35rem',
    marginTop: '.7rem',
  },

  syncRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.35rem',
    padding: '0 .55rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    color: '#aab6cf',
    fontSize: '.59rem',
  },

  syncRowStrong: {
    marginLeft: 'auto',
    color: '#9deeff',
  },

  syncActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.7rem',
  },

  aiActionGrid: {
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

  customIcon: {
    display: 'grid',
    placeItems: 'center',
  },
};