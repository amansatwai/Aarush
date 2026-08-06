import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Camera,
  Check,
  ChevronDown,
  Contrast,
  Crop,
  FileVideo,
  FlipHorizontal,
  FolderOpen,
  Gauge,
  Globe2,
  GripVertical,
  Image as ImageIcon,
  Lock,
  MapPin,
  Mic,
  Music2,
  Palette,
  Play,
  Plus,
  RefreshCcw,
  RotateCw,
  Save,
  Scissors,
  Send,
  Share2,
  Shield,
  Smile,
  Sparkles,
  Sticker,
  Sun,
  Tags,
  Trash2,
  Type,
  Upload,
  UserRound,
  Users,
  Video,
  WandSparkles,
  X,
} from 'lucide-react';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const audienceOptions = [
  {
    key: 'public',
    label: 'Public',
    description: 'Anyone can view this content.',
    icon: Globe2,
  },
  {
    key: 'followers',
    label: 'Followers',
    description: 'Only your followers can view this content.',
    icon: Users,
  },
  {
    key: 'closeFriends',
    label: 'Close Friends',
    description: 'Share with your trusted audience.',
    icon: UserRound,
  },
  {
    key: 'private',
    label: 'Private',
    description: 'Only you can view this content.',
    icon: Lock,
  },
];

const editingTools = [
  { key: 'crop', label: 'Crop', icon: Crop },
  { key: 'rotate', label: 'Rotate', icon: RotateCw },
  { key: 'flip', label: 'Flip', icon: FlipHorizontal },
  { key: 'brightness', label: 'Brightness', icon: Sun },
  { key: 'contrast', label: 'Contrast', icon: Contrast },
  { key: 'saturation', label: 'Saturation', icon: Palette },
  { key: 'filter', label: 'Filters', icon: WandSparkles },
  { key: 'trim', label: 'Trim', icon: Scissors },
  { key: 'speed', label: 'Speed', icon: Gauge },
  { key: 'text', label: 'Text overlay', icon: Type },
  { key: 'sticker', label: 'Stickers', icon: Sticker },
  { key: 'gif', label: 'GIFs', icon: Sparkles },
  { key: 'emoji', label: 'Emojis', icon: Smile },
  { key: 'voice', label: 'Voice effect', icon: Mic },
  { key: 'greenScreen', label: 'Green screen', icon: ImageIcon },
  { key: 'template', label: 'Templates', icon: FileVideo },
];

const hashtagSuggestions = [
  '#Aarush',
  '#React',
  '#Supabase',
  '#Reels',
  '#CreatorTools',
  '#Frontend',
];

const mentionSuggestions = [
  '@arush.dev',
  '@design.loop',
  '@creator.lab',
  '@teamaarush',
];

const locationSuggestions = [
  'Ghaziabad, India',
  'Noida, India',
  'Delhi NCR',
  'Bengaluru, India',
];

function formatBytes(bytes) {
  if (!bytes) return '0 KB';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getFileType(file) {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  return 'other';
}

function createMediaItem(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
    file,
    name: file.name,
    size: file.size,
    type: getFileType(file),
    previewUrl: URL.createObjectURL(file),
  };
}

function ToolButton({ tool, active, onClick, disabled }) {
  const Icon = tool.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'grid',
        justifyItems: 'center',
        gap: '0.35rem',
        minWidth: '4.25rem',
        padding: '0.65rem 0.45rem',
        borderRadius: '0.95rem',
        border: `1px solid ${
          active ? 'rgba(124,92,255,0.34)' : 'rgba(255,255,255,0.07)'
        }`,
        background: active
          ? 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))'
          : 'rgba(255,255,255,0.045)',
        color: disabled ? '#64708b' : active ? '#ffffff' : '#c6d0e5',
        fontSize: '0.7rem',
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.58 : 1,
      }}
    >
      <span
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '0.7rem',
          display: 'grid',
          placeItems: 'center',
          background: active
            ? 'linear-gradient(135deg, rgba(124,92,255,0.28), rgba(77,215,255,0.16))'
            : 'rgba(255,255,255,0.06)',
        }}
      >
        <Icon size={16} />
      </span>
      <span>{tool.label}</span>
    </button>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <section
      style={{
        padding: '0.95rem',
        borderRadius: '1.25rem',
        background: 'rgba(15,19,30,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span
            style={{
              width: '1.9rem',
              height: '1.9rem',
              borderRadius: '999px',
              display: 'grid',
              placeItems: 'center',
              background:
                'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
              color: '#fff',
            }}
          >
            <Icon size={14} />
          </span>
          <h2
            style={{
              margin: 0,
              color: '#f5f8ff',
              fontSize: '0.98rem',
              fontWeight: 850,
            }}
          >
            {title}
          </h2>
        </div>
        {action || null}
      </div>
      {children}
    </section>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        color: '#dce5f8',
        fontSize: '0.84rem',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      <span>{label}</span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <span
        style={{
          width: '2.8rem',
          height: '1.55rem',
          borderRadius: '999px',
          padding: '0.18rem',
          display: 'flex',
          justifyContent: checked ? 'flex-end' : 'flex-start',
          background: checked
            ? 'linear-gradient(90deg, #7c5cff, #4dd7ff)'
            : 'rgba(255,255,255,0.12)',
          transition: 'background 180ms ease',
        }}
      >
        <span
          style={{
            width: '1.2rem',
            height: '1.2rem',
            borderRadius: '999px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.24)',
          }}
        />
      </span>
    </label>
  );
}

function MediaPreview({
  item,
  active,
  onSelect,
  onRemove,
  onMoveLeft,
  onMoveRight,
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '8rem',
        height: '9rem',
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: '1rem',
        border: `2px solid ${
          active ? '#7c5cff' : 'rgba(255,255,255,0.08)'
        }`,
        background: '#111827',
        boxShadow: active ? '0 0 24px rgba(124,92,255,0.22)' : 'none',
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Select ${item.name}`}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          width: '100%',
          height: '100%',
          border: 0,
          padding: 0,
          background: 'transparent',
          cursor: 'pointer',
        }}
      />

      {item.type === 'image' ? (
        <img
          src={item.previewUrl}
          alt={item.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <video
          src={item.previewUrl}
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          top: '0.45rem',
          left: '0.45rem',
          right: '0.45rem',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.3rem',
        }}
      >
        <button
          type="button"
          onClick={onMoveLeft}
          aria-label="Move media left"
          style={{
            width: '1.7rem',
            height: '1.7rem',
            borderRadius: '999px',
            border: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(5,8,15,0.56)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <ChevronDown size={12} style={{ transform: 'rotate(90deg)' }} />
        </button>

        <button
          type="button"
          onClick={onMoveRight}
          aria-label="Move media right"
          style={{
            width: '1.7rem',
            height: '1.7rem',
            borderRadius: '999px',
            border: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(5,8,15,0.56)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '0.45rem',
          right: '0.45rem',
          bottom: '0.45rem',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.35rem',
        }}
      >
        <span
          style={{
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: '999px',
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(5,8,15,0.58)',
            color: '#fff',
          }}
        >
          {item.type === 'video' ? (
            <Play size={12} fill="currentColor" />
          ) : (
            <ImageIcon size={12} />
          )}
        </span>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name}`}
          style={{
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: '999px',
            border: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(255,79,122,0.82)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [contentType, setContentType] = useState('post');
  const [media, setMedia] = useState([]);
  const [activeMediaId, setActiveMediaId] = useState(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [audience, setAudience] = useState('public');
  const [activeTool, setActiveTool] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpandedCaption, setIsExpandedCaption] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [allowShares, setAllowShares] = useState(true);
  const [allowDownloads, setAllowDownloads] = useState(false);
  const [saveToDevice, setSaveToDevice] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const activeMedia = useMemo(
    () => media.find((item) => item.id === activeMediaId) || media[0] || null,
    [activeMediaId, media]
  );

  const hashtagMatches = useMemo(
    () => caption.match(/#[\w]+/g) || [],
    [caption]
  );

  const mentionMatches = useMemo(
    () => caption.match(/@[\w.]+/g) || [],
    [caption]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (caption || media.length || location || tags.length) {
        setDraftSaved(true);
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [caption, location, media.length, tags.length]);

  const validateFiles = (files) => {
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        errors.push(`${file.name} is not an image or video.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} exceeds the 100 MB limit.`);
        return;
      }

      validFiles.push(file);
    });

    if (media.length + validFiles.length > MAX_FILES) {
      errors.push(`You can select up to ${MAX_FILES} media files.`);
    }

    return {
      files: validFiles.slice(0, Math.max(0, MAX_FILES - media.length)),
      errors,
    };
  };

  const addFiles = (fileList) => {
    const result = validateFiles(Array.from(fileList || {}));

    if (result.errors.length) {
      setErrorMessage(result.errors.join(' '));
    } else {
      setErrorMessage('');
    }

    const nextItems = result.files.map(createMediaItem);

    setMedia((current) => {
      const next = [...current, ...nextItems];

      if (!activeMediaId && next[0]) {
        setActiveMediaId(next[0].id);
      }

      return next;
    });
  };

  const handleInputChange = (event) => {
    addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const removeMedia = (id) => {
    setMedia((current) => {
      const target = current.find((item) => item.id === id);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      const next = current.filter((item) => item.id !== id);

      if (activeMediaId === id) {
        setActiveMediaId(next[0]?.id || null);
      }

      return next;
    });
  };

  const moveMedia = (id, direction) => {
    setMedia((current) => {
      const index = current.findIndex((item) => item.id === id);

      if (index < 0) return current;

      const targetIndex = direction === 'left' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(index, 1);

      next.splice(targetIndex, 0, item);

      return next;
    });
  };

  const handleTool = (key) => {
    setActiveTool((current) => (current === key ? null : key));
  };

  const addTag = () => {
    const cleanTag = tagInput.trim().replace(/^@/, '');

    if (!cleanTag || tags.includes(cleanTag)) return;

    setTags((current) => [...current, cleanTag]);
    setTagInput('');
  };

  const removeTag = (tag) => {
    setTags((current) => current.filter((item) => item !== tag));
  };

  const simulateUpload = () => {
    if (!media.length) {
      setErrorMessage('Select at least one image or video before publishing.');
      setUploadState('error');
      return;
    }

    if (!caption.trim() && contentType !== 'story') {
      setErrorMessage('Add a caption before publishing this content.');
      setUploadState('error');
      return;
    }

    setErrorMessage('');
    setUploadState('uploading');
    setUploadProgress(0);

    let progress = 0;

    const timer = window.setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        window.clearInterval(timer);
        setUploadState(scheduleEnabled ? 'scheduled' : 'success');
      }
    }, 140);
  };

  const cancelUpload = () => {
    setUploadState('idle');
    setUploadProgress(0);
  };

  const retryUpload = () => {
    setUploadState('idle');
    setUploadProgress(0);
    window.setTimeout(simulateUpload, 100);
  };

  const saveDraft = () => {
    setDraftSaved(true);
    setUploadState('draft');
  };

  const clearComposer = () => {
    media.forEach((item) => URL.revokeObjectURL(item.previewUrl));

    setMedia([]);
    setActiveMediaId(null);
    setCaption('');
    setLocation('');
    setTags([]);
    setTagInput('');
    setErrorMessage('');
    setUploadState('idle');
    setUploadProgress(0);
    setDraftSaved(false);
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background:
        'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
      color: '#f4f7ff',
      paddingBottom: '6.9rem',
    },
    main: {
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0.9rem 0.9rem 0',
      display: 'grid',
      gap: '0.9rem',
    },
    topRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
    },
    iconButton: {
      width: '2.65rem',
      height: '2.65rem',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
    },
    typeTabs: {
      display: 'flex',
      gap: '0.45rem',
      overflowX: 'auto',
      paddingBottom: '0.15rem',
    },
    typeTab: (active) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      flexShrink: 0,
      padding: '0.62rem 0.85rem',
      borderRadius: '999px',
      border: `1px solid ${
        active ? 'rgba(124,92,255,0.34)' : 'rgba(255,255,255,0.07)'
      }`,
      background: active
        ? 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))'
        : 'rgba(255,255,255,0.05)',
      color: active ? '#fff' : '#aeb9d0',
      fontSize: '0.8rem',
      fontWeight: 850,
      cursor: 'pointer',
    }),
    picker: {
      position: 'relative',
      minHeight: '14rem',
      display: 'grid',
      placeItems: 'center',
      padding: '1.1rem',
      borderRadius: '1.25rem',
      border: `1px dashed ${
        dragActive ? '#4dd7ff' : 'rgba(124,92,255,0.34)'
      }`,
      background: dragActive
        ? 'linear-gradient(135deg, rgba(77,215,255,0.14), rgba(124,92,255,0.12))'
        : 'linear-gradient(135deg, rgba(124,92,255,0.1), rgba(77,215,255,0.06))',
    },
    pickerContent: {
      display: 'grid',
      justifyItems: 'center',
      gap: '0.7rem',
      textAlign: 'center',
    },
    pickerIcon: {
      width: '4.2rem',
      height: '4.2rem',
      borderRadius: '1.35rem',
      display: 'grid',
      placeItems: 'center',
      background:
        'linear-gradient(135deg, rgba(124,92,255,0.3), rgba(77,215,255,0.18))',
      color: '#fff',
      boxShadow: '0 0 28px rgba(124,92,255,0.18)',
    },
    primaryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.45rem',
      border: 0,
      borderRadius: '999px',
      padding: '0.78rem 1rem',
      background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
      color: '#fff',
      fontSize: '0.84rem',
      fontWeight: 850,
      cursor: 'pointer',
      boxShadow: '0 12px 24px rgba(124,92,255,0.18)',
    },
    secondaryButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.45rem',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '999px',
      padding: '0.75rem 0.95rem',
      background: 'rgba(255,255,255,0.05)',
      color: '#eaf0ff',
      fontSize: '0.82rem',
      fontWeight: 800,
      cursor: 'pointer',
    },
    previewRail: {
      display: 'flex',
      gap: '0.7rem',
      overflowX: 'auto',
      paddingBottom: '0.15rem',
    },
    toolRail: {
      display: 'flex',
      gap: '0.55rem',
      overflowX: 'auto',
      paddingBottom: '0.15rem',
    },
    textarea: {
      width: '100%',
      minHeight: isExpandedCaption ? '10rem' : '6.5rem',
      resize: 'vertical',
      borderRadius: '1rem',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.045)',
      color: '#f4f7ff',
      padding: '0.85rem',
      outline: 'none',
      fontSize: '0.92rem',
      lineHeight: 1.55,
    },
    input: {
      width: '100%',
      borderRadius: '0.95rem',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.045)',
      color: '#f4f7ff',
      padding: '0.8rem 0.85rem',
      outline: 'none',
      fontSize: '0.86rem',
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.45rem',
      marginTop: '0.65rem',
    },
    chip: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '0.4rem 0.55rem',
      borderRadius: '999px',
      background: 'rgba(124,92,255,0.14)',
      border: '1px solid rgba(124,92,255,0.18)',
      color: '#dce5ff',
      fontSize: '0.74rem',
      fontWeight: 750,
    },
    optionGrid: {
      display: 'grid',
      gap: '0.55rem',
    },
    audienceOption: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.7rem',
      padding: '0.75rem',
      borderRadius: '1rem',
      border: `1px solid ${
        active ? 'rgba(124,92,255,0.32)' : 'rgba(255,255,255,0.07)'
      }`,
      background: active
        ? 'linear-gradient(135deg, rgba(124,92,255,0.18), rgba(77,215,255,0.08))'
        : 'rgba(255,255,255,0.04)',
      color: '#f1f5ff',
      cursor: 'pointer',
      textAlign: 'left',
    }),
    status: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.55rem',
      padding: '0.8rem 0.85rem',
      borderRadius: '1rem',
      background: 'rgba(77,215,255,0.08)',
      border: '1px solid rgba(77,215,255,0.16)',
      color: '#d5f8ff',
      fontSize: '0.82rem',
      fontWeight: 750,
    },
  };

  return (
    <div style={styles.page}>
      <TopBar pageTitle="Create" notificationCount={3} />

      <main style={styles.main}>
        <div style={styles.topRow}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={styles.iconButton}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <span style={{ color: '#aab6cf', fontSize: '0.78rem', fontWeight: 750 }}>
            {draftSaved ? 'Draft autosaved' : 'New content'}
          </span>

          <button
            type="button"
            onClick={saveDraft}
            style={styles.iconButton}
            aria-label="Save draft"
          >
            <Save size={17} />
          </button>
        </div>

        <div style={styles.typeTabs}>
          <button
            type="button"
            onClick={() => setContentType('post')}
            style={styles.typeTab(contentType === 'post')}
          >
            <ImageIcon size={15} />
            Post
          </button>

          <button
            type="button"
            onClick={() => setContentType('reel')}
            style={styles.typeTab(contentType === 'reel')}
          >
            <Video size={15} />
            Reel
          </button>

          <button
            type="button"
            onClick={() => setContentType('story')}
            style={styles.typeTab(contentType === 'story')}
          >
            <Sparkles size={15} />
            Story
          </button>
        </div>

        <SectionCard title="Media picker" icon={Upload} action="Up to 10 files">
          <div
            style={styles.picker}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
          >
            <div style={styles.pickerContent}>
              <span style={styles.pickerIcon}>
                {contentType === 'reel' ? (
                  <Video size={30} />
                ) : contentType === 'story' ? (
                  <Sparkles size={30} />
                ) : (
                  <ImageIcon size={30} />
                )}
              </span>

              <div>
                <strong
                  style={{
                    display: 'block',
                    color: '#f5f8ff',
                    fontSize: '0.98rem',
                  }}
                >
                  {dragActive ? 'Drop media here' : 'Add photos and videos'}
                </strong>

                <span
                  style={{
                    display: 'block',
                    marginTop: '0.3rem',
                    color: '#95a3c1',
                    fontSize: '0.8rem',
                  }}
                >
                  Drag and drop, open your gallery, or use the camera.
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={styles.primaryButton}
                >
                  <FolderOpen size={16} />
                  Choose from gallery
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setErrorMessage('Camera capture is ready for device integration.')
                  }
                  style={styles.secondaryButton}
                >
                  <Camera size={16} />
                  Camera
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleInputChange}
                style={{ display: 'none' }}
              />

              <span style={{ color: '#7785a1', fontSize: '0.72rem' }}>
                Images and videos up to 100 MB each
              </span>
            </div>
          </div>
        </SectionCard>

        {media.length > 0 ? (
          <SectionCard title="Media preview" icon={ImageIcon} action={`${media.length} selected`}>
            <div style={styles.previewRail}>
              {media.map((item) => (
                <MediaPreview
                  key={item.id}
                  item={item}
                  active={item.id === activeMedia?.id}
                  onSelect={() => setActiveMediaId(item.id)}
                  onRemove={() => removeMedia(item.id)}
                  onMoveLeft={() => moveMedia(item.id, 'left')}
                  onMoveRight={() => moveMedia(item.id, 'right')}
                />
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                marginTop: '0.7rem',
                color: '#8e9bb7',
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
            >
              <GripVertical size={14} />
              Reorder media, select a cover, and swipe the preview rail.
              {activeMedia
                ? ` · ${activeMedia.name} · ${formatBytes(activeMedia.size)}`
                : ''}
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          title="Editing tools"
          icon={WandSparkles}
          action={activeTool ? `Active: ${activeTool}` : 'Customize'}
        >
          <div style={styles.toolRail}>
            {editingTools.map((tool) => (
              <ToolButton
                key={tool.key}
                tool={tool}
                active={activeTool === tool.key}
                onClick={() => handleTool(tool.key)}
                disabled={
                  !media.length &&
                  !['text', 'sticker', 'gif', 'emoji', 'template'].includes(tool.key)
                }
              />
            ))}
          </div>

          {activeTool ? (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                borderRadius: '0.95rem',
                background: 'rgba(124,92,255,0.1)',
                border: '1px solid rgba(124,92,255,0.14)',
                color: '#dce5ff',
                fontSize: '0.8rem',
                lineHeight: 1.5,
              }}
            >
              {activeTool === 'trim'
                ? 'Video trim controls are active for timeline integration.'
                : activeTool === 'speed'
                  ? 'Speed control supports 0.5x, 1x, 1.5x, and 2x playback modes.'
                  : `${activeTool} editing mode is active for the selected media.`}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Caption and tags" icon={Type} action={`${caption.length}/2,200`}>
          <div style={{ position: 'relative' }}>
            <textarea
              value={caption}
              onChange={(event) =>
                setCaption(event.target.value.slice(0, 2200))
              }
              placeholder={
                contentType === 'story'
                  ? 'Add story text…'
                  : contentType === 'reel'
                    ? 'Write a reel caption…'
                    : 'Write a caption…'
              }
              style={styles.textarea}
            />

            <button
              type="button"
              onClick={() => setIsExpandedCaption((current) => !current)}
              aria-label="Expand caption input"
              style={{
                position: 'absolute',
                right: '0.65rem',
                bottom: '0.65rem',
                width: '2.1rem',
                height: '2.1rem',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(8,11,18,0.68)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronDown
                size={15}
                style={{
                  transform: isExpandedCaption ? 'rotate(180deg)' : 'none',
                }}
              />
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              marginTop: '0.7rem',
            }}
          >
            {hashtagSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setCaption((current) => `${current}${current ? ' ' : ''}${tag}`)
                }
                style={{
                  border: '1px solid rgba(124,92,255,0.16)',
                  borderRadius: '999px',
                  background: 'rgba(124,92,255,0.1)',
                  color: '#cddaff',
                  padding: '0.42rem 0.58rem',
                  fontSize: '0.72rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <div style={styles.chips}>
            {hashtagMatches.map((tag) => (
              <span key={tag} style={styles.chip}>
                {tag}
              </span>
            ))}

            {mentionMatches.map((mention) => (
              <span key={mention} style={styles.chip}>
                {mention}
              </span>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gap: '0.55rem',
              marginTop: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Tag people or mention users"
                style={styles.input}
              />

              <button
                type="button"
                onClick={addTag}
                style={styles.secondaryButton}
              >
                <Tags size={15} />
                Add
              </button>
            </div>

            {tags.length > 0 ? (
              <div style={styles.chips}>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={styles.chip}
                  >
                    @{tag}
                    <X size={12} />
                  </button>
                ))}
              </div>
            ) : null}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.45rem',
              }}
            >
              {mentionSuggestions.map((mention) => (
                <button
                  key={mention}
                  type="button"
                  onClick={() =>
                    setCaption((current) => `${current}${current ? ' ' : ''}${mention}`)
                  }
                  style={{
                    border: '1px solid rgba(77,215,255,0.15)',
                    borderRadius: '999px',
                    background: 'rgba(77,215,255,0.08)',
                    color: '#c9f5ff',
                    padding: '0.4rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                  }}
                >
                  {mention}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Location" icon={MapPin} action="Optional">
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Add location or search nearby places"
                style={styles.input}
              />

              <button
                type="button"
                onClick={() => setLocation('Ghaziabad, India')}
                style={styles.secondaryButton}
              >
                <MapPin size={15} />
                Nearby
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.45rem',
                overflowX: 'auto',
              }}
            >
              {locationSuggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLocation(item)}
                  style={{
                    flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#dce5f8',
                    padding: '0.48rem 0.62rem',
                    fontSize: '0.72rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Audience" icon={Users} action="Privacy controls">
          <div style={styles.optionGrid}>
            {audienceOptions.map((option) => {
              const Icon = option.icon;
              const active = audience === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setAudience(option.key)}
                  style={styles.audienceOption(active)}
                >
                  <span
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '0.8rem',
                      display: 'grid',
                      placeItems: 'center',
                      background: active
                        ? 'linear-gradient(135deg, rgba(124,92,255,0.28), rgba(77,215,255,0.14))'
                        : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Icon size={16} />
                  </span>

                  <span style={{ flex: 1 }}>
                    <strong
                      style={{
                        display: 'block',
                        fontSize: '0.84rem',
                      }}
                    >
                      {option.label}
                    </strong>
                    <span
                      style={{
                        display: 'block',
                        marginTop: '0.2rem',
                        color: '#8f9cb8',
                        fontSize: '0.74rem',
                      }}
                    >
                      {option.description}
                    </span>
                  </span>

                  {active ? <Check size={17} color="#72e3ff" /> : null}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Post options" icon={Shield}>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            <Toggle
              checked={allowComments}
              onChange={setAllowComments}
              label="Allow comments"
            />

            <Toggle
              checked={allowShares}
              onChange={setAllowShares}
              label="Allow shares"
            />

            <Toggle
              checked={allowDownloads}
              onChange={setAllowDownloads}
              label="Allow downloads"
            />

            <Toggle
              checked={saveToDevice}
              onChange={setSaveToDevice}
              label="Save to device"
            />

            <Toggle
              checked={scheduleEnabled}
              onChange={setScheduleEnabled}
              label="Schedule publishing"
            />

            <button
              type="button"
              style={{
                ...styles.secondaryButton,
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <Share2 size={15} />
                Cross-post
              </span>
              <span style={{ color: '#8f9cb8', fontSize: '0.72rem' }}>
                Coming next
              </span>
            </button>

            {scheduleEnabled ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                }}
              >
                <CalendarClock size={16} color="#8fd8ff" />

                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(event) => setScheduleDate(event.target.value)}
                  style={styles.input}
                />
              </div>
            ) : null}
          </div>
        </SectionCard>

        {contentType === 'reel' ? (
          <SectionCard title="Reel creation" icon={Video} action="Short video">
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              <button
                type="button"
                style={{
                  ...styles.secondaryButton,
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <Music2 size={15} />
                  Select music
                </span>
                <span style={{ color: '#8f9cb8', fontSize: '0.72rem' }}>
                  Placeholder
                </span>
              </button>

              <button
                type="button"
                style={{
                  ...styles.secondaryButton,
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <ImageIcon size={15} />
                  Select cover
                </span>
                <span style={{ color: '#8f9cb8', fontSize: '0.72rem' }}>
                  Choose frame
                </span>
              </button>

              <div style={{ display: 'flex', gap: '0.55rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTool('remix')}
                  style={{ ...styles.secondaryButton, flex: 1 }}
                >
                  <RefreshCcw size={15} />
                  Remix
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool('duet')}
                  style={{ ...styles.secondaryButton, flex: 1 }}
                >
                  <Users size={15} />
                  Duet
                </button>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {contentType === 'story' ? (
          <SectionCard title="Story creation" icon={Sparkles} action="24-hour content">
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setActiveTool('story stickers')}
                style={{
                  ...styles.secondaryButton,
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <Sticker size={15} />
                  Story stickers
                </span>
                <ChevronDown size={15} />
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('story poll')}
                style={{
                  ...styles.secondaryButton,
                  justifyContent: 'space-between',
                }}
              >
                <span>Poll, question, countdown</span>
                <ChevronDown size={15} />
              </button>

              <Toggle
                checked={audience === 'closeFriends'}
                onChange={(checked) =>
                  setAudience(checked ? 'closeFriends' : 'public')
                }
                label="Close Friends story"
              />

              <button
                type="button"
                onClick={() => setActiveTool('story music')}
                style={{
                  ...styles.secondaryButton,
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <Music2 size={15} />
                  Story music
                </span>
                <span style={{ color: '#8f9cb8', fontSize: '0.72rem' }}>
                  Placeholder
                </span>
              </button>
            </div>
          </SectionCard>
        ) : null}

        {uploadState === 'uploading' ? (
          <section style={styles.status}>
            <Upload size={16} />

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: '0.45rem',
                }}
              >
                <span>Uploading and processing media</span>
                <span>{uploadProgress}%</span>
              </div>

              <div
                style={{
                  height: '0.45rem',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.12)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, #7c5cff, #4dd7ff)',
                    transition: 'width 140ms linear',
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={cancelUpload}
              style={styles.iconButton}
              aria-label="Cancel upload"
            >
              <X size={15} />
            </button>
          </section>
        ) : null}

        {uploadState === 'success' ||
        uploadState === 'scheduled' ||
        uploadState === 'draft' ? (
          <section style={styles.status}>
            <Check size={17} color="#72f0bd" />

            <span style={{ flex: 1 }}>
              {uploadState === 'scheduled'
                ? 'Your content has been scheduled successfully.'
                : uploadState === 'draft'
                  ? 'Your draft has been saved.'
                  : 'Your content has been published successfully.'}
            </span>

            <button
              type="button"
              onClick={clearComposer}
              style={styles.secondaryButton}
            >
              Create another
            </button>
          </section>
        ) : null}

        {errorMessage ? (
          <section
            style={{
              ...styles.status,
              background: 'rgba(255,79,122,0.1)',
              borderColor: 'rgba(255,79,122,0.18)',
              color: '#ffb1c8',
            }}
          >
            <AlertCircle size={17} />

            <span style={{ flex: 1 }}>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage('')}
              style={styles.iconButton}
              aria-label="Dismiss error"
            >
              <X size={15} />
            </button>
          </section>
        ) : null}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem',
            justifyContent: 'flex-end',
            paddingBottom: '0.4rem',
          }}
        >
          {uploadState === 'error' ? (
            <button
              type="button"
              onClick={retryUpload}
              style={styles.secondaryButton}
            >
              <RefreshCcw size={15} />
              Retry upload
            </button>
          ) : null}

          <button
            type="button"
            onClick={saveDraft}
            style={styles.secondaryButton}
          >
            <Save size={15} />
            Save draft
          </button>

          <button
            type="button"
            onClick={simulateUpload}
            disabled={
              uploadState === 'uploading' ||
              uploadState === 'success' ||
              uploadState === 'scheduled'
            }
            style={{
              ...styles.primaryButton,
              opacity: uploadState === 'uploading' ? 0.6 : 1,
              cursor: uploadState === 'uploading' ? 'not-allowed' : 'pointer',
            }}
          >
            {scheduleEnabled ? <CalendarClock size={16} /> : <Send size={16} />}
            {scheduleEnabled
              ? 'Schedule post'
              : contentType === 'story'
                ? 'Share story'
                : 'Publish'}
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}