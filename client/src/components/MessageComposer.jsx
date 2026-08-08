import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  AudioLines,
  Bot,
  Camera,
  Check,
  ChevronDown,
  FileText,
  FolderLock,
  Image as ImageIcon,
  Languages,
  MapPin,
  Mic,
  MicOff,
  Paperclip,
  Pause,
  Play,
  Send,
  Shield,
  Smile,
  Sparkles,
  Sticker,
  Trash2,
  UploadCloud,
  Video,
  X,
  Zap,
} from 'lucide-react';

const MAX_MESSAGE_LENGTH = 4000;
const TYPING_DEBOUNCE = 650;
const MAX_TEXTAREA_HEIGHT = 150;

const EMOJI_GROUPS = {
  Recent: ['😊', '😂', '❤️', '🔥', '👍', '🙏', '🎉', '✨'],
  Smileys: ['😀', '😃', '😄', '😁', '😅', '🤣', '😊', '🙂', '🙃', '😉', '😍', '🥰', '😘', '😎', '🤔', '😭', '😡'],
  People: ['👋', '🤝', '👏', '🙌', '🙏', '💪', '👀', '🧠', '👨‍💻', '👩‍💻', '🫶', '🤍'],
  Animals: ['🐶', '🐱', '🐭', '🐹', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵'],
  Food: ['🍎', '🍕', '🍔', '🍟', '🌮', '🍜', '🍣', '🍩', '🍪', '☕', '🥤', '🍰'],
  Travel: ['🚗', '🚕', '🚌', '✈️', '🚀', '🏠', '🌍', '🏝️', '🏔️', '🌆', '🎡'],
  Activities: ['⚽', '🏀', '🏆', '🎮', '🎵', '🎬', '🎨', '📚', '🎯', '🏋️'],
  Objects: ['💡', '📱', '💻', '📷', '🎧', '⌚', '🔑', '🎁', '📌', '✏️', '📎'],
  Symbols: ['✅', '❌', '⚠️', '❗', '❓', '💯', '♻️', '🔒', '🔔', '❤️', '⭐'],
  Flags: ['🇮🇳', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇯🇵', '🇩🇪', '🇫🇷', '🇦🇪'],
};

const ATTACHMENT_TYPES = [
  { key: 'photo', label: 'Photos', icon: ImageIcon, accept: 'image/*' },
  { key: 'video', label: 'Videos', icon: Video, accept: 'video/*' },
  {
    key: 'document',
    label: 'Documents',
    icon: FileText,
    accept: '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx',
  },
  { key: 'audio', label: 'Audio', icon: AudioLines, accept: 'audio/*' },
  { key: 'contact', label: 'Contacts', icon: Zap },
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'vault', label: 'Memories Vault', icon: FolderLock },
  { key: 'cloud', label: 'Cloud Files', icon: UploadCloud },
  { key: 'workspace', label: 'Workspace Files', icon: Archive },
];

const AI_ACTIONS = [
  'Rewrite Message',
  'Correct Grammar',
  'Translate',
  'Change Tone',
  'Shorten',
  'Expand',
  'Summarize',
  'Generate Reply',
  'Detect Sensitive Information',
  'Privacy Warning',
  'Scam Warning',
];

function formatBytes(bytes) {
  if (!bytes) {
    return '';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resizeTextarea(element) {
  if (!element) {
    return;
  }

  element.style.height = 'auto';
  element.style.height = `${Math.min(
    element.scrollHeight,
    MAX_TEXTAREA_HEIGHT
  )}px`;
}

function ComposerButton({
  label,
  icon: Icon,
  onClick,
  active = false,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        ...styles.iconButton,
        ...(active ? styles.activeIconButton : {}),
        ...(danger ? styles.dangerIconButton : {}),
        ...(disabled ? styles.disabledButton : {}),
      }}
    >
      <Icon size={17} />
    </button>
  );
}

function PreviewCard({ item, onRemove }) {
  const isImage = item.file?.type?.startsWith('image/');
  const isVideo = item.file?.type?.startsWith('video/');
  const previewUrl = item.previewUrl;

  return (
    <div style={styles.previewCard}>
      <div style={styles.previewVisual}>
        {isImage && previewUrl ? (
          <img
            src={previewUrl}
            alt={item.file.name}
            style={styles.previewImage}
          />
        ) : isVideo && previewUrl ? (
          <video
            src={previewUrl}
            muted
            playsInline
            preload="metadata"
            style={styles.previewImage}
          />
        ) : (
          <FileText size={24} />
        )}

        {item.uploading ? (
          <span style={styles.uploadOverlay}>
            <UploadCloud size={16} />
            {item.progress}%
          </span>
        ) : null}
      </div>

      <div style={styles.previewDetails}>
        <strong>{item.file?.name || item.name}</strong>
        <small>
          {item.file ? formatBytes(item.file.size) : item.label}
        </small>
        {item.encryptionStatus ? (
          <small style={styles.encryptionLabel}>
            <Shield size={10} />
            {item.encryptionStatus}
          </small>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        style={styles.previewRemove}
        aria-label={`Remove ${item.file?.name || item.name}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function EmojiPicker({ onSelect, onClose }) {
  const [activeGroup, setActiveGroup] = useState('Recent');

  const emojis = EMOJI_GROUPS[activeGroup] || [];

  return (
    <div style={styles.emojiPicker} role="dialog" aria-label="Emoji picker">
      <div style={styles.pickerHeader}>
        <strong>Emoji</strong>

        <button
          type="button"
          onClick={onClose}
          style={styles.pickerClose}
          aria-label="Close emoji picker"
        >
          <X size={15} />
        </button>
      </div>

      <div style={styles.emojiTabs}>
        {Object.keys(EMOJI_GROUPS).map((group) => (
          <button
            type="button"
            key={group}
            onClick={() => setActiveGroup(group)}
            style={{
              ...styles.emojiTab,
              ...(activeGroup === group ? styles.activeEmojiTab : {}),
            }}
          >
            {group}
          </button>
        ))}
      </div>

      <div style={styles.emojiGrid}>
        {emojis.map((emoji, index) => (
          <button
            type="button"
            key={`${emoji}-${index}`}
            onClick={() => onSelect(emoji)}
            style={styles.emojiButton}
            aria-label={`Insert ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div style={styles.skinToneRow}>
        <span>Skin tone</span>
        {['🏻', '🏼', '🏽', '🏾', '🏿'].map((tone) => (
          <button
            type="button"
            key={tone}
            onClick={() => onSelect(tone)}
            style={styles.toneButton}
          >
            👋{tone}
          </button>
        ))}
      </div>
    </div>
  );
}

function AttachmentMenu({ onSelect, onClose }) {
  return (
    <div
      style={styles.popover}
      role="dialog"
      aria-label="Attachment options"
    >
      <div style={styles.pickerHeader}>
        <strong>Share with chat</strong>

        <button
          type="button"
          onClick={onClose}
          style={styles.pickerClose}
          aria-label="Close attachment menu"
        >
          <X size={15} />
        </button>
      </div>

      <div style={styles.attachmentGrid}>
        {ATTACHMENT_TYPES.map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.key}
              onClick={() => onSelect(item)}
              style={styles.attachmentOption}
            >
              <span style={styles.attachmentIcon}>
                <Icon size={17} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CameraPanel({ onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setCameraError('Camera access is not available in this browser.');
        return;
      }

      try {
        streamRef.current?.getTracks().forEach((track) => track.stop());

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setCameraError(
          'Camera permission was denied or the camera is unavailable.'
        );
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode]);

  const capture = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    if (flashEnabled) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      const file = new File([blob], `aarush-camera-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      onCapture?.(file);
      onClose();
    }, 'image/jpeg', 0.92);
  };

  return (
    <div style={styles.cameraPanel} role="dialog" aria-label="Camera">
      <div style={styles.cameraHeader}>
        <strong>Camera</strong>

        <button
          type="button"
          onClick={onClose}
          style={styles.pickerClose}
          aria-label="Close camera"
        >
          <X size={17} />
        </button>
      </div>

      {cameraError ? (
        <div style={styles.cameraError}>
          <Camera size={24} />
          <span>{cameraError}</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={styles.cameraVideo}
        />
      )}

      <div style={styles.cameraControls}>
        <button
          type="button"
          onClick={() => setFlashEnabled((value) => !value)}
          style={{
            ...styles.cameraControl,
            ...(flashEnabled ? styles.activeCameraControl : {}),
          }}
        >
          Flash
        </button>

        <button
          type="button"
          onClick={capture}
          style={styles.captureButton}
          aria-label="Capture photo"
        >
          <Camera size={21} />
        </button>

        <button
          type="button"
          onClick={() =>
            setFacingMode((value) =>
              value === 'environment' ? 'user' : 'environment'
            )
          }
          style={styles.cameraControl}
        >
          Flip
        </button>
      </div>
    </div>
  );
}

function VoiceRecorder({ onComplete, onCancel, onClose }) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(Date.now());

  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;

    if (recording && !paused) {
      interval = window.setInterval(() => {
        setDuration(
          Math.floor((Date.now() - startedAtRef.current) / 1000)
        );
      }, 500);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [paused, recording]);

  useEffect(() => {
    const startRecording = async () => {
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === 'undefined'
      ) {
        setError('Voice recording is not supported in this browser.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        startedAtRef.current = Date.now();

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());

          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });

          const file = new File(
            [blob],
            `aarush-voice-${Date.now()}.webm`,
            {
              type: blob.type,
            }
          );

          onComplete?.({
            file,
            duration,
            noiseReduction: true,
            echoReduction: true,
            autoGain: true,
            transcriptionPending: true,
          });
        };

        recorder.start();
        setRecording(true);
      } catch {
        setError(
          'Microphone permission was denied or recording is unavailable.'
        );
      }
    };

    startRecording();

    return () => {
      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
    };
  }, []);

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === 'inactive') {
      onCancel?.();
      return;
    }

    recorder.stop();
    setRecording(false);
  };

  const togglePause = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) {
      return;
    }

    if (recorder.state === 'recording') {
      recorder.pause();
      setPaused(true);
      return;
    }

    if (recorder.state === 'paused') {
      recorder.resume();
      setPaused(false);
    }
  };

  const seconds = String(duration % 60).padStart(2, '0');
  const minutes = Math.floor(duration / 60);

  return (
    <div style={styles.voiceRecorder} role="dialog" aria-label="Voice recorder">
      <div style={styles.voiceRecorderHeader}>
        <span style={styles.recordingIndicator}>
          <span />
          {error ? 'Recording unavailable' : 'Recording'}
        </span>

        <button
          type="button"
          onClick={() => {
            stopRecording();
            onClose?.();
          }}
          style={styles.pickerClose}
          aria-label="Close voice recorder"
        >
          <X size={16} />
        </button>
      </div>

      {error ? (
        <div style={styles.recordingError}>{error}</div>
      ) : (
        <>
          <div style={styles.recorderWaveform}>
            {Array.from({ length: 42 }).map((_, index) => (
              <span
                key={index}
                style={{
                  ...styles.recorderWaveBar,
                  height: `${10 + ((index * 17) % 28)}px`,
                }}
              />
            ))}
          </div>

          <div style={styles.recordingTime}>
            {minutes}:{seconds}
          </div>

          <div style={styles.recorderControls}>
            <button
              type="button"
              onClick={togglePause}
              style={styles.recorderButton}
              aria-label={paused ? 'Resume recording' : 'Pause recording'}
            >
              {paused ? <Play size={17} /> : <Pause size={17} />}
            </button>

            <button
              type="button"
              onClick={() => setLocked((value) => !value)}
              style={{
                ...styles.recorderButton,
                ...(locked ? styles.activeRecorderButton : {}),
              }}
              aria-label={locked ? 'Unlock recording' : 'Lock recording'}
            >
              <Shield size={17} />
            </button>

            <button
              type="button"
              onClick={() => {
                stopRecording();
                onCancel?.();
              }}
              style={styles.cancelRecorderButton}
            >
              <Trash2 size={16} />
              Cancel
            </button>

            <button
              type="button"
              onClick={stopRecording}
              style={styles.sendRecorderButton}
            >
              <Send size={16} />
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AIComposerMenu({ onAction, onClose }) {
  return (
    <div style={styles.aiMenu} role="dialog" aria-label="AI writing tools">
      <div style={styles.pickerHeader}>
        <strong>Aarush AI</strong>

        <button
          type="button"
          onClick={onClose}
          style={styles.pickerClose}
          aria-label="Close AI tools"
        >
          <X size={15} />
        </button>
      </div>

      <div style={styles.aiList}>
        {AI_ACTIONS.map((action) => (
          <button
            type="button"
            key={action}
            onClick={() => onAction(action)}
            style={styles.aiAction}
          >
            <Sparkles size={14} />
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageComposer({
  chatId,
  value: controlledValue,
  onChange,
  onSend,
  onRecord,
  onAttach,
  onOpenCamera,
  onOpenGallery,
  onOpenVault,
  onOpenAI,
  disabled = false,
  placeholder = 'Message',
  draftKey,
  className = '',
  style = {},
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const recentEmojiKey = `aarush_recent_emoji_${chatId || 'default'}`;

  const [internalValue, setInternalValue] = useState(
    controlledValue || ''
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [recentEmojis, setRecentEmojis] = useState(() => {
    if (typeof window === 'undefined') {
      return EMOJI_GROUPS.Recent;
    }

    try {
      return (
        JSON.parse(
          window.localStorage.getItem(recentEmojiKey)
        ) || EMOJI_GROUPS.Recent
      );
    } catch {
      return EMOJI_GROUPS.Recent;
    }
  });
  const [characterCount, setCharacterCount] = useState(
    String(controlledValue || '').length
  );
  const [isComposing, setIsComposing] = useState(false);

  const value =
    controlledValue !== undefined
      ? controlledValue
      : internalValue;

  const draftStorageKey =
    draftKey || `aarush_draft_${chatId || 'default'}`;

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
      setCharacterCount(String(controlledValue).length);

      window.requestAnimationFrame(() => {
        resizeTextarea(textareaRef.current);
      });
    }
  }, [controlledValue]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      controlledValue !== undefined
    ) {
      return undefined;
    }

    try {
      const savedDraft = window.localStorage.getItem(
        draftStorageKey
      );

      if (savedDraft) {
        setInternalValue(savedDraft);
        setCharacterCount(savedDraft.length);

        window.requestAnimationFrame(() => {
          resizeTextarea(textareaRef.current);
        });
      }
    } catch {
      // Draft restoration is best effort.
    }

    return undefined;
  }, [controlledValue, draftStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    try {
      window.localStorage.setItem(
        draftStorageKey,
        value || ''
      );
    } catch {
      // Draft persistence is best effort.
    }

    return undefined;
  }, [draftStorageKey, value]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current !== null) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const updateValue = useCallback(
    (nextValue) => {
      const safeValue = String(nextValue).slice(
        0,
        MAX_MESSAGE_LENGTH
      );

      setInternalValue(safeValue);
      setCharacterCount(safeValue.length);
      onChange?.(safeValue);

      resizeTextarea(textareaRef.current);

      onTyping?.({
        chatId,
        state: safeValue.trim() ? 'typing' : 'idle',
      });

      if (typingTimerRef.current !== null) {
        window.clearTimeout(typingTimerRef.current);
      }

      typingTimerRef.current = window.setTimeout(() => {
        onTyping?.({
          chatId,
          state: 'idle',
        });
      }, TYPING_DEBOUNCE);
    },
    [chatId, onChange, onTyping]
  );

  const insertText = useCallback(
    (text) => {
      const textarea = textareaRef.current;

      if (!textarea) {
        updateValue(`${value}${text}`);
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const nextValue =
        value.slice(0, start) +
        text +
        value.slice(end);

      updateValue(nextValue);

      window.requestAnimationFrame(() => {
        textarea.focus();
        const position = start + text.length;
        textarea.setSelectionRange(position, position);
      });
    },
    [updateValue, value]
  );

  const insertEmoji = useCallback(
    (emoji) => {
      insertText(emoji);

      setRecentEmojis((current) => {
        const next = [
          emoji,
          ...current.filter((item) => item !== emoji),
        ].slice(0, 12);

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(
              recentEmojiKey,
              JSON.stringify(next)
            );
          } catch {
            // Recent emoji persistence is best effort.
          }
        }

        return next;
      });
    },
    [insertText, recentEmojiKey]
  );

  const send = useCallback(() => {
    const trimmedValue = value.trim();

    if (!trimmedValue && attachments.length === 0) {
      return;
    }

    onSend?.({
      chatId,
      type: attachments.length > 0 ? 'mixed' : 'text',
      text: trimmedValue,
      attachments,
      optimistic: true,
      queuedOffline:
        typeof navigator !== 'undefined' &&
        navigator.onLine === false,
    });

    setInternalValue('');
    setCharacterCount(0);
    setAttachments([]);
    onChange?.('');
    onTyping?.({
      chatId,
      state: 'idle',
    });

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(draftStorageKey);
      } catch {
        // Draft cleanup is best effort.
      }
    }

    window.requestAnimationFrame(() => {
      resizeTextarea(textareaRef.current);
    });
  }, [
    attachments,
    chatId,
    draftStorageKey,
    onChange,
    onSend,
    onTyping,
    value,
  ]);

  const addFiles = useCallback(
    (fileList, source = 'gallery') => {
      const files = Array.from(fileList || []);

      if (files.length === 0) {
        return;
      }

      const nextAttachments = files.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()
          .toString(36)
          .slice(2)}`,
        file,
        source,
        progress: 0,
        uploading: false,
        encryptionStatus: 'Secure upload ready',
        previewUrl: file.type.startsWith('image/') ||
          file.type.startsWith('video/')
          ? URL.createObjectURL(file)
          : '',
      }));

      setAttachments((current) => [
        ...current,
        ...nextAttachments,
      ]);

      onAttach?.({
        chatId,
        files,
        source,
        stage: 'preview',
      });
    },
    [chatId, onAttach]
  );

  const handleFileInput = (event) => {
    addFiles(event.target.files, 'gallery');
    event.target.value = '';
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((current) => {
      const target = current.find(
        (item) => item.id === attachmentId
      );

      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((item) => item.id !== attachmentId);
    });
  };

  const handleAttachmentOption = (option) => {
    setShowAttachmentMenu(false);

    if (option.key === 'camera') {
      setShowCamera(true);
      onOpenCamera?.({ chatId });
      return;
    }

    if (option.key === 'gallery') {
      fileInputRef.current?.click();
      onOpenGallery?.({ chatId });
      return;
    }

    if (option.key === 'vault') {
      onOpenVault?.({ chatId });
      return;
    }

    if (
      option.key === 'contact' ||
      option.key === 'location' ||
      option.key === 'cloud' ||
      option.key === 'workspace'
    ) {
      onAttach?.({
        chatId,
        type: option.key,
        stage: 'select',
      });
      return;
    }

    fileInputRef.current?.click();
  };

  const handlePaste = (event) => {
    const clipboardItems = Array.from(
      event.clipboardData?.items || []
    );

    const files = clipboardItems
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter(Boolean);

    if (files.length > 0) {
      event.preventDefault();
      addFiles(files, 'paste');
    }
  };

  const handleCameraCapture = (file) => {
    if (!file) {
      return;
    }

    addFiles([file], 'camera');
    onOpenCamera?.({
      chatId,
      file,
      captured: true,
    });
  };

  const handleVoiceComplete = (payload) => {
    setShowVoiceRecorder(false);
    onRecord?.({
      chatId,
      ...payload,
      optimistic: true,
    });
  };

  const handleAIAction = (action) => {
    setShowAIMenu(false);

    onOpenAI?.({
      chatId,
      action,
      text: value,
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !isComposing) {
      event.preventDefault();
      send();
      return;
    }

    if (
      event.key === 'Enter' &&
      event.shiftKey
    ) {
      return;
    }

    if (
      (event.metaKey || event.ctrlKey) &&
      event.key.toLowerCase() === 'z'
    ) {
      return;
    }
  };

  const previewCount = attachments.length;
  const hasValue = Boolean(value.trim());
  const recentGroup = useMemo(
    () => ({
      ...EMOJI_GROUPS,
      Recent: recentEmojis,
    }),
    [recentEmojis]
  );

  return (
    <div
      className={className}
      style={{
        ...styles.wrapper,
        ...style,
      }}
    >
      {attachments.length > 0 ? (
        <div style={styles.previewStrip}>
          <div style={styles.previewHeader}>
            <span>
              Attachments ready
              {previewCount > 1 ? ` (${previewCount})` : ''}
            </span>

            <button
              type="button"
              onClick={() => {
                attachments.forEach((item) => {
                  if (item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl);
                  }
                });
                setAttachments([]);
              }}
              style={styles.clearPreviewButton}
            >
              Clear
            </button>
          </div>

          <div style={styles.previewList}>
            {attachments.map((item) => (
              <PreviewCard
                key={item.id}
                item={item}
                onRemove={removeAttachment}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div style={styles.composerShell}>
        {showEmojiPicker ? (
          <EmojiPicker
            onSelect={insertEmoji}
            onClose={() => setShowEmojiPicker(false)}
          />
        ) : null}

        {showAttachmentMenu ? (
          <AttachmentMenu
            onSelect={handleAttachmentOption}
            onClose={() => setShowAttachmentMenu(false)}
          />
        ) : null}

        {showAIMenu ? (
          <AIComposerMenu
            onAction={handleAIAction}
            onClose={() => setShowAIMenu(false)}
          />
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
          onChange={handleFileInput}
        />

        <div style={styles.toolRow}>
          <ComposerButton
            label="Emoji picker"
            icon={Smile}
            active={showEmojiPicker}
            onClick={() => {
              setShowEmojiPicker((value) => !value);
              setShowAttachmentMenu(false);
              setShowAIMenu(false);
            }}
            disabled={disabled}
          />

          <ComposerButton
            label="Attachments"
            icon={Paperclip}
            active={showAttachmentMenu}
            onClick={() => {
              setShowAttachmentMenu((value) => !value);
              setShowEmojiPicker(false);
              setShowAIMenu(false);
            }}
            disabled={disabled}
          />

          <ComposerButton
            label="Camera"
            icon={Camera}
            onClick={() => {
              setShowCamera(true);
              onOpenCamera?.({ chatId });
            }}
            disabled={disabled}
          />

          <ComposerButton
            label="Gallery"
            icon={ImageIcon}
            onClick={() => {
              fileInputRef.current?.click();
              onOpenGallery?.({ chatId });
            }}
            disabled={disabled}
          />

          <ComposerButton
            label="Memories Vault"
            icon={FolderLock}
            onClick={() => onOpenVault?.({ chatId })}
            disabled={disabled}
          />

          <ComposerButton
            label="Aarush AI"
            icon={Bot}
            active={showAIMenu}
            onClick={() => {
              setShowAIMenu((value) => !value);
              setShowEmojiPicker(false);
              setShowAttachmentMenu(false);
            }}
            disabled={disabled}
          />
        </div>

        <div style={styles.inputRow}>
          <textarea
            ref={textareaRef}
            value={value}
            disabled={disabled}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder={placeholder}
            onChange={(event) => updateValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            style={{
              ...styles.textarea,
              ...(disabled ? styles.disabledTextarea : {}),
            }}
            aria-label="Message"
          />

          <div style={styles.inputMeta}>
            {characterCount > 0 ? (
              <span
                style={{
                  ...styles.characterCount,
                  color:
                    characterCount > MAX_MESSAGE_LENGTH * 0.9
                      ? '#ffcf8a'
                      : '#8290aa',
                }}
              >
                {characterCount}/{MAX_MESSAGE_LENGTH}
              </span>
            ) : null}

            <span style={styles.inputHints}>
              Enter to send · Shift + Enter for new line
            </span>
          </div>
        </div>

        <div style={styles.bottomRow}>
          <div style={styles.utilityButtons}>
            <button
              type="button"
              onClick={() =>
                onAttach?.({
                  chatId,
                  type: 'location',
                  stage: 'select',
                })
              }
              style={styles.utilityButton}
              disabled={disabled}
            >
              <MapPin size={14} />
              Location
            </button>

            <button
              type="button"
              onClick={() =>
                onAttach?.({
                  chatId,
                  type: 'audio',
                  stage: 'select',
                })
              }
              style={styles.utilityButton}
              disabled={disabled}
            >
              <AudioLines size={14} />
              Audio
            </button>
          </div>

          <div style={styles.sendControls}>
            {!hasValue && attachments.length === 0 ? (
              <button
                type="button"
                onClick={() => setShowVoiceRecorder(true)}
                style={styles.voiceButton}
                disabled={disabled}
                aria-label="Hold to record voice message"
              >
                <Mic size={17} />
                <span>Voice</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={send}
                style={styles.sendButton}
                disabled={disabled}
                aria-label="Send message"
              >
                <Send size={17} />
                <span>Send</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showCamera ? (
        <div style={styles.overlay}>
          <CameraPanel
            onClose={() => setShowCamera(false)}
            onCapture={handleCameraCapture}
          />
        </div>
      ) : null}

      {showVoiceRecorder ? (
        <div style={styles.overlay}>
          <VoiceRecorder
            onComplete={handleVoiceComplete}
            onCancel={() => setShowVoiceRecorder(false)}
            onClose={() => setShowVoiceRecorder(false)}
          />
        </div>
      ) : null}

      <style>{`
        .aarush-message-composer {
          transition:
            background 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .aarush-message-composer textarea:focus {
          border-color: rgba(124, 92, 255, 0.54) !important;
          box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.12);
        }

        .aarush-message-composer button:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-message-composer,
          .aarush-message-composer * {
            transition: none !important;
            animation: none !important;
          }
        }

        @media (prefers-contrast: more) {
          .aarush-message-composer textarea,
          .aarush-message-composer button {
            border-color: rgba(255,255,255,0.38) !important;
          }
        }

        @media (max-width: 500px) {
          .aarush-message-composer .aarush-input-hints {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'sticky',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    padding: '0.55rem 0.7rem calc(0.6rem + env(safe-area-inset-bottom))',
    background: 'rgba(7,10,16,0.94)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  previewStrip: {
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto 0.55rem',
    padding: '0.55rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.9rem',
    background: 'rgba(255,255,255,0.045)',
  },

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#dbe5f8',
    fontSize: '0.7rem',
    fontWeight: 800,
  },

  clearPreviewButton: {
    border: 0,
    color: '#ffb0c4',
    background: 'transparent',
    fontSize: '0.68rem',
    cursor: 'pointer',
  },

  previewList: {
    display: 'flex',
    gap: '0.45rem',
    overflowX: 'auto',
    marginTop: '0.5rem',
  },

  previewCard: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.42rem',
    minWidth: '12rem',
    maxWidth: '15rem',
    padding: '0.42rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.75rem',
    background: 'rgba(255,255,255,0.045)',
  },

  previewVisual: {
    position: 'relative',
    width: '2.6rem',
    height: '2.6rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: '0.55rem',
    color: '#c9d4e8',
    background: 'rgba(124,92,255,0.16)',
  },

  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  uploadOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    color: '#ffffff',
    background: 'rgba(0,0,0,0.55)',
    fontSize: '0.56rem',
  },

  previewDetails: {
    display: 'grid',
    gap: '0.12rem',
    minWidth: 0,
    color: '#dfe7f6',
    fontSize: '0.68rem',
  },

  encryptionLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.18rem',
    color: '#a9edff',
  },

  previewRemove: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    marginLeft: 'auto',
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.08)',
    cursor: 'pointer',
  },

  composerShell: {
    position: 'relative',
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0.6rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(145deg, rgba(20,26,43,0.92), rgba(10,14,23,0.94))',
    boxShadow:
      '0 16px 40px rgba(0,0,0,0.28), 0 0 25px rgba(124,92,255,0.06)',
  },

  toolRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    overflowX: 'auto',
    marginBottom: '0.45rem',
    scrollbarWidth: 'none',
  },

  iconButton: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#cbd7eb',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition:
      'transform 180ms ease, background 180ms ease, border-color 180ms ease',
  },

  activeIconButton: {
    color: '#ffffff',
    borderColor: 'rgba(124,92,255,0.42)',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.34), rgba(77,215,255,0.16))',
  },

  dangerIconButton: {
    color: '#ffb0c4',
    borderColor: 'rgba(255,79,122,0.28)',
    background: 'rgba(255,79,122,0.1)',
  },

  disabledButton: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },

  inputRow: {
    display: 'grid',
    gap: '0.28rem',
  },

  textarea: {
    width: '100%',
    minHeight: '2.55rem',
    maxHeight: `${MAX_TEXTAREA_HEIGHT}px`,
    boxSizing: 'border-box',
    resize: 'none',
    overflowY: 'auto',
    padding: '0.68rem 0.78rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.9rem',
    outline: 0,
    color: '#ffffff',
    background: 'rgba(255,255,255,0.055)',
    fontFamily: 'inherit',
    fontSize: '0.86rem',
    lineHeight: 1.45,
    transition:
      'border-color 180ms ease, box-shadow 180ms ease',
  },

  disabledTextarea: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  inputMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    minHeight: '0.8rem',
    padding: '0 0.18rem',
  },

  characterCount: {
    fontSize: '0.61rem',
  },

  inputHints: {
    marginLeft: 'auto',
    color: '#71809b',
    fontSize: '0.59rem',
  },

  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    marginTop: '0.48rem',
  },

  utilityButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    overflowX: 'auto',
  },

  utilityButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexShrink: 0,
    padding: '0.38rem 0.5rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '999px',
    color: '#aab8cf',
    background: 'rgba(255,255,255,0.04)',
    fontSize: '0.62rem',
    cursor: 'pointer',
  },

  sendControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },

  voiceButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    minHeight: '2.3rem',
    padding: '0.5rem 0.72rem',
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  sendButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    minHeight: '2.3rem',
    padding: '0.5rem 0.72rem',
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  popover: {
    position: 'absolute',
    right: '0.55rem',
    bottom: 'calc(100% + 0.65rem)',
    zIndex: 10,
    width: 'min(22rem, calc(100vw - 1.5rem))',
    padding: '0.7rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1rem',
    background: 'rgba(15,20,32,0.98)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
    backdropFilter: 'blur(18px)',
  },

  aiMenu: {
    position: 'absolute',
    right: '0.55rem',
    bottom: 'calc(100% + 0.65rem)',
    zIndex: 10,
    width: 'min(22rem, calc(100vw - 1.5rem))',
    maxHeight: '70vh',
    overflowY: 'auto',
    padding: '0.7rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1rem',
    background: 'rgba(15,20,32,0.98)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
    backdropFilter: 'blur(18px)',
  },

  pickerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    marginBottom: '0.55rem',
    color: '#edf3ff',
    fontSize: '0.75rem',
  },

  pickerClose: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#cdd8e9',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  emojiTabs: {
    display: 'flex',
    gap: '0.28rem',
    overflowX: 'auto',
    paddingBottom: '0.35rem',
  },

  emojiTab: {
    flexShrink: 0,
    padding: '0.35rem 0.45rem',
    border: 0,
    borderRadius: '999px',
    color: '#9eabc2',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.62rem',
    cursor: 'pointer',
  },

  activeEmojiTab: {
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },

  emojiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '0.2rem',
    maxHeight: '12rem',
    overflowY: 'auto',
    marginTop: '0.45rem',
  },

  emojiButton: {
    minHeight: '2rem',
    border: 0,
    borderRadius: '0.45rem',
    background: 'transparent',
    fontSize: '1.25rem',
    cursor: 'pointer',
  },

  skinToneRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    color: '#8f9db6',
    fontSize: '0.62rem',
  },

  toneButton: {
    padding: '0.2rem',
    border: 0,
    borderRadius: '0.35rem',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },

  attachmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '0.4rem',
  },

  attachmentOption: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.28rem',
    minHeight: '4.2rem',
    padding: '0.45rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.7rem',
    color: '#dce5f7',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '0.62rem',
    cursor: 'pointer',
  },

  attachmentIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#cfc6ff',
    background: 'rgba(124,92,255,0.17)',
  },

  aiList: {
    display: 'grid',
    gap: '0.32rem',
  },

  aiAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem',
    border: '1px solid rgba(124,92,255,0.15)',
    borderRadius: '0.65rem',
    color: '#e7e0ff',
    background: 'rgba(124,92,255,0.08)',
    fontSize: '0.68rem',
    fontWeight: 750,
    textAlign: 'left',
    cursor: 'pointer',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'grid',
    placeItems: 'center',
    padding: '1rem',
    background: 'rgba(0,0,0,0.78)',
    backdropFilter: 'blur(12px)',
  },

  cameraPanel: {
    width: 'min(100%, 520px)',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1.2rem',
    background: '#111827',
    boxShadow: '0 28px 80px rgba(0,0,0,0.55)',
  },

  cameraHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.7rem',
    color: '#ffffff',
  },

  cameraVideo: {
    display: 'block',
    width: '100%',
    maxHeight: '65vh',
    objectFit: 'cover',
    background: '#05070b',
  },

  cameraError: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.65rem',
    padding: '5rem 1rem',
    color: '#aebbd0',
    fontSize: '0.78rem',
    textAlign: 'center',
  },

  cameraControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '0.8rem',
  },

  cameraControl: {
    minWidth: '4rem',
    padding: '0.5rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: '#dfe8f8',
    background: 'rgba(255,255,255,0.06)',
    fontSize: '0.68rem',
    cursor: 'pointer',
  },

  activeCameraControl: {
    color: '#ffffff',
    background: 'rgba(124,92,255,0.3)',
  },

  captureButton: {
    width: '3.5rem',
    height: '3.5rem',
    display: 'grid',
    placeItems: 'center',
    border: '4px solid rgba(255,255,255,0.76)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    cursor: 'pointer',
  },

  voiceRecorder: {
    width: 'min(100%, 480px)',
    padding: '1rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1.25rem',
    color: '#ffffff',
    background: 'linear-gradient(180deg, #171d2d, #0e1320)',
    boxShadow: '0 28px 80px rgba(0,0,0,0.55)',
  },

  voiceRecorderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  recordingIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#ffadc2',
    fontSize: '0.75rem',
    fontWeight: 850,
  },

  recordingIndicatorSpan: {
    width: '0.55rem',
    height: '0.55rem',
    borderRadius: '999px',
    background: '#ff4f7a',
    boxShadow: '0 0 12px rgba(255,79,122,0.65)',
  },

  recorderWaveform: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.14rem',
    height: '4rem',
    marginTop: '1.4rem',
  },

  recorderWaveBar: {
    width: '0.16rem',
    minHeight: '0.45rem',
    borderRadius: '999px',
    background: 'linear-gradient(180deg, #ff4fd8, #4dd7ff)',
  },

  recordingTime: {
    marginTop: '0.8rem',
    color: '#f4f7ff',
    fontSize: '1.5rem',
    fontWeight: 900,
    textAlign: 'center',
  },

  recorderControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    marginTop: '1rem',
  },

  recorderButton: {
    width: '2.5rem',
    height: '2.5rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.07)',
    cursor: 'pointer',
  },

  activeRecorderButton: {
    borderColor: 'rgba(124,92,255,0.42)',
    background: 'rgba(124,92,255,0.25)',
  },

  cancelRecorderButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    minHeight: '2.5rem',
    padding: '0.5rem 0.65rem',
    border: '1px solid rgba(255,79,122,0.2)',
    borderRadius: '999px',
    color: '#ffb0c4',
    background: 'rgba(255,79,122,0.09)',
    fontSize: '0.68rem',
    cursor: 'pointer',
  },

  sendRecorderButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    minHeight: '2.5rem',
    padding: '0.5rem 0.7rem',
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  recordingError: {
    padding: '2rem 1rem',
    color: '#ffb0c4',
    fontSize: '0.78rem',
    textAlign: 'center',
  },
};

export default memo(MessageComposer);