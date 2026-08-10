import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Camera,
  Check,
  File,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Mic,
  Paperclip,
  Play,
  RotateCcw,
  Send,
  Trash2,
  UploadCloud,
  Video,
  X,
} from 'lucide-react';
import {
  getFileMetadata,
  uploadChatMedia,
  uploadVoiceNote,
  validateChatMedia,
} from '../utils/chatMediaEngine';

const IMAGE_ACCEPT = 'image/*';
const VIDEO_ACCEPT = 'video/*';
const FILE_ACCEPT = [
  'application/pdf',
  'text/*',
  'application/zip',
  'application/octet-stream',
].join(',');

function formatSize(bytes) {
  if (!bytes) {
    return '0 KB';
  }

  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mediaLabel(mediaType) {
  if (mediaType === 'image') {
    return 'Image';
  }

  if (mediaType === 'video') {
    return 'Video';
  }

  if (mediaType === 'audio') {
    return 'Audio';
  }

  return 'File';
}

function FileIcon({ mediaType }) {
  if (mediaType === 'image') {
    return <ImageIcon size={19} />;
  }

  if (mediaType === 'video') {
    return <Video size={19} />;
  }

  if (mediaType === 'audio') {
    return <Mic size={19} />;
  }

  return <File size={19} />;
}

function Preview({ file, previewUrl }) {
  if (!file || !previewUrl) {
    return null;
  }

  const mediaType = file.type?.startsWith('video/')
    ? 'video'
    : file.type?.startsWith('image/')
      ? 'image'
      : file.type?.startsWith('audio/')
        ? 'audio'
        : 'file';

  if (mediaType === 'image') {
    return (
      <img
        src={previewUrl}
        alt="Attachment preview"
        style={styles.previewMedia}
      />
    );
  }

  if (mediaType === 'video') {
    return (
      <div style={styles.previewVideo}>
        <video
          src={previewUrl}
          controls
          muted
          playsInline
          preload="metadata"
          style={styles.previewMedia}
        />

        <span style={styles.previewPlay}>
          <Play size={14} fill="currentColor" />
        </span>
      </div>
    );
  }

  if (mediaType === 'audio') {
    return (
      <div style={styles.audioPreview}>
        <Mic size={24} />
        <audio
          src={previewUrl}
          controls
          style={styles.audio}
        />
      </div>
    );
  }

  return (
    <div style={styles.filePreview}>
      <FileText size={25} />
      <span>{file.name || 'Selected file'}</span>
    </div>
  );
}

export default function ChatMediaPicker({
  conversationId,
  onUploaded,
  onClose,
  disabled = false,
}) {
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingStartedAtRef = useRef(null);

  const [selectedFile, setSelectedFile] =
    useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] =
    useState(null);
  const [recordingDuration, setRecordingDuration] =
    useState(0);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const mediaType = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    if (selectedFile.type?.startsWith('image/')) {
      return 'image';
    }

    if (selectedFile.type?.startsWith('video/')) {
      return 'video';
    }

    if (selectedFile.type?.startsWith('audio/')) {
      return 'audio';
    }

    return 'file';
  }, [selectedFile]);

  const clearPreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
  }, []);

  const clearSelection = useCallback(() => {
    clearPreviewUrl();

    setSelectedFile(null);
    setPreviewUrl('');
    setMetadata(null);
    setProgress(0);
    setRecordedBlob(null);
    setRecordingDuration(0);
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [clearPreviewUrl]);

  useEffect(() => {
    return () => {
      clearPreviewUrl();

      mediaStreamRef.current?.getTracks().forEach(
        (track) => track.stop()
      );
    };
  }, [clearPreviewUrl]);

  const selectFile = useCallback(
    async (file) => {
      if (!file || disabled) {
        return;
      }

      const validation = validateChatMedia(file);

      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      clearPreviewUrl();

      const nextPreviewUrl =
        URL.createObjectURL(file);

      previewUrlRef.current = nextPreviewUrl;

      setSelectedFile(file);
      setPreviewUrl(nextPreviewUrl);
      setProgress(0);
      setError('');

      try {
        const nextMetadata =
          await getFileMetadata(file);

        setMetadata(nextMetadata);
      } catch {
        setMetadata(null);
      }
    },
    [clearPreviewUrl, disabled]
  );

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];

      if (file) {
        selectFile(file);
      }
    },
    [selectFile]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragging(false);

      const file = event.dataTransfer.files?.[0];

      if (file) {
        selectFile(file);
      }
    },
    [selectFile]
  );

  const startRecording = useCallback(async () => {
    if (disabled || recording) {
      return;
    }

    if (
      typeof MediaRecorder === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError(
        'Voice recording is not supported in this browser.'
      );
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data?.size) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(
          recordedChunksRef.current,
          {
            type: recorder.mimeType || 'audio/webm',
          }
        );

        const file = new File(
          [blob],
          `voice-note-${Date.now()}.webm`,
          {
            type: blob.type,
            lastModified: Date.now(),
          }
        );

        const nextPreviewUrl =
          URL.createObjectURL(blob);

        clearPreviewUrl();
        previewUrlRef.current = nextPreviewUrl;

        setRecordedBlob(blob);
        setSelectedFile(file);
        setPreviewUrl(nextPreviewUrl);
        setRecording(false);
        setRecordingDuration(
          Math.max(
            0,
            Math.round(
              (Date.now() -
                recordingStartedAtRef.current) /
                1000
            )
          )
        );

        getFileMetadata(file)
          .then(setMetadata)
          .catch(() => setMetadata(null));

        stream.getTracks().forEach((track) => {
          track.stop();
        });

        mediaStreamRef.current = null;
      };

      recorder.start();
      setRecording(true);
      setError('');
    } catch (recordingError) {
      setError(
        recordingError.message ||
          'Microphone permission is required.'
      );
    }
  }, [
    clearPreviewUrl,
    disabled,
    recording,
  ]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      recording
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, [recording]);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== 'inactive') {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }

    mediaStreamRef.current?.getTracks().forEach(
      (track) => track.stop()
    );

    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    recordedChunksRef.current = [];
    setRecording(false);
    setRecordedBlob(null);
    clearSelection();
  }, [clearSelection]);

  const upload = useCallback(async () => {
    if (disabled || uploading) {
      return;
    }

    if (!selectedFile) {
      setError('Select an attachment first.');
      return;
    }

    const validation = validateChatMedia(
      selectedFile
    );

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      const uploaded =
        recordedBlob && mediaType === 'audio'
          ? await uploadVoiceNote({
              blob: recordedBlob,
              conversationId,
              fileName: selectedFile.name,
              onProgress: setProgress,
            })
          : await uploadChatMedia({
              file: selectedFile,
              conversationId,
              onProgress: setProgress,
            });

      onUploaded?.({
        ...uploaded,
        duration:
          metadata?.duration ||
          (recordingDuration || null),
      });

      setProgress(100);
      clearSelection();
      onClose?.();
    } catch (uploadError) {
      setError(
        uploadError.message ||
          'Unable to upload attachment.'
      );
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }, [
    clearSelection,
    conversationId,
    disabled,
    mediaType,
    metadata?.duration,
    onClose,
    onUploaded,
    recordedBlob,
    recordingDuration,
    selectedFile,
    uploading,
  ]);

  const retryUpload = useCallback(() => {
    upload();
  }, [upload]);

  return (
    <section
      style={styles.panel}
      onDrop={handleDrop}
      onDragOver={(event) => {
        event.preventDefault();

        if (!disabled && !uploading) {
          setDragging(true);
        }
      }}
      onDragLeave={() => setDragging(false)}
    >
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Share attachment</h2>
          <p style={styles.subtitle}>
            Images, videos, voice notes, and files.
          </p>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close attachment picker"
          >
            <X size={17} />
          </button>
        ) : null}
      </div>

      {error ? (
        <div role="alert" style={styles.error}>
          <span>{error}</span>

          {!uploading && selectedFile ? (
            <button
              type="button"
              onClick={retryUpload}
              style={styles.retryButton}
            >
              <RotateCcw size={13} />
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      {!selectedFile ? (
        <>
          <div
            style={{
              ...styles.dropZone,
              ...(dragging ? styles.dragging : {}),
              ...(disabled ? styles.disabled : {}),
            }}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(event) => {
              if (
                !disabled &&
                (event.key === 'Enter' ||
                  event.key === ' ')
              ) {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onClick={() => {
              if (!disabled) {
                fileInputRef.current?.click();
              }
            }}
          >
            <span style={styles.uploadIcon}>
              <UploadCloud size={25} />
            </span>

            <strong>Drop a file here</strong>
            <span>or choose one from your device</span>

            <small>
              Images, videos, audio, PDF, ZIP, and text files
            </small>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={[
              IMAGE_ACCEPT,
              VIDEO_ACCEPT,
              'audio/*',
              FILE_ACCEPT,
            ].join(',')}
            onChange={handleFileChange}
            disabled={disabled || uploading}
            style={styles.hiddenInput}
          />

          <div style={styles.optionsGrid}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              style={styles.optionButton}
            >
              <ImageIcon size={18} />
              <span>Gallery</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              style={styles.optionButton}
            >
              <Camera size={18} />
              <span>Camera</span>
              <small>Coming soon</small>
            </button>

            <button
              type="button"
              onClick={() => {
                if (recording) {
                  stopRecording();
                } else {
                  startRecording();
                }
              }}
              disabled={disabled || uploading}
              style={{
                ...styles.optionButton,
                ...(recording ? styles.recordingButton : {}),
              }}
            >
              <Mic size={18} />
              <span>{recording ? 'Stop' : 'Voice note'}</span>
              {recording ? (
                <small>Recording…</small>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              style={styles.optionButton}
            >
              <File size={18} />
              <span>Document</span>
            </button>
          </div>
        </>
      ) : (
        <div style={styles.selectedArea}>
          <div style={styles.previewBox}>
            <Preview
              file={selectedFile}
              previewUrl={previewUrl}
            />
          </div>

          <div style={styles.fileInfo}>
            <span style={styles.fileIcon}>
              <FileIcon mediaType={mediaType} />
            </span>

            <div style={styles.fileCopy}>
              <strong>{selectedFile.name}</strong>
              <span>
                {mediaLabel(mediaType)} ·{' '}
                {formatSize(selectedFile.size)}
              </span>

              {metadata?.duration ||
              recordingDuration ? (
                <small>
                  Duration:{' '}
                  {Math.round(
                    metadata?.duration ||
                      recordingDuration
                  )}
                  s
                </small>
              ) : null}
            </div>

            <button
              type="button"
              onClick={clearSelection}
              disabled={uploading}
              style={styles.removeButton}
              aria-label="Remove attachment"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {recording ? (
            <div style={styles.recordingControls}>
              <span style={styles.recordingDot} />
              Recording voice note…

              <button
                type="button"
                onClick={stopRecording}
                style={styles.stopButton}
              >
                Stop
              </button>

              <button
                type="button"
                onClick={cancelRecording}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          ) : null}

          {uploading ? (
            <div style={styles.progressSection}>
              <div style={styles.progressHeader}>
                <span>Uploading attachment…</span>
                <strong>{progress}%</strong>
              </div>

              <div
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={progress}
                style={styles.progressTrack}
              >
                <span
                  style={{
                    ...styles.progressFill,
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          <div style={styles.actionRow}>
            <button
              type="button"
              onClick={clearSelection}
              disabled={uploading}
              style={styles.secondaryButton}
            >
              <X size={14} />
              Remove
            </button>

            <button
              type="button"
              onClick={upload}
              disabled={disabled || uploading}
              style={styles.uploadButton}
            >
              {uploading ? (
                <LoaderCircle
                  size={15}
                  style={styles.spin}
                />
              ) : (
                <Send size={15} />
              )}
              {uploading ? 'Uploading…' : 'Send attachment'}
            </button>
          </div>
        </div>
      )}

      <div style={styles.securityNote}>
        <Check size={13} />
        Authenticated users only · Secure chat-media storage
      </div>

      <style>{`
        @keyframes aarush-chat-media-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes aarush-chat-media-recording {
          0%, 100% {
            opacity: 0.45;
          }

          50% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </section>
  );
}

const styles = {
  panel: {
    width: 'min(100%, 540px)',
    padding: '0.9rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1.25rem',
    color: '#f4f7ff',
    background:
      'linear-gradient(180deg, rgba(20,26,42,0.98), rgba(9,13,22,0.98))',
    boxShadow: '0 24px 70px rgba(0,0,0,0.42)',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.7rem',
    marginBottom: '0.8rem',
  },

  title: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 850,
  },

  subtitle: {
    margin: '0.22rem 0 0',
    color: '#96a3bf',
    fontSize: '0.67rem',
  },

  closeButton: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },

  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    marginBottom: '0.7rem',
    padding: '0.65rem',
    border: '1px solid rgba(255,79,122,0.22)',
    borderRadius: '0.7rem',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.08)',
    fontSize: '0.66rem',
  },

  retryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexShrink: 0,
    padding: '0.35rem 0.5rem',
    border: '1px solid rgba(255,159,186,0.24)',
    borderRadius: '999px',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.08)',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  dropZone: {
    minHeight: '10rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.4rem',
    padding: '1.2rem',
    border: '1px dashed rgba(124,92,255,0.4)',
    borderRadius: '1rem',
    color: '#dce5f8',
    background:
      'linear-gradient(145deg, rgba(124,92,255,0.12), rgba(77,215,255,0.05))',
    textAlign: 'center',
    cursor: 'pointer',
    transition:
      'background 180ms ease, border-color 180ms ease, transform 180ms ease',
  },

  dragging: {
    borderColor: '#4dd7ff',
    background:
      'linear-gradient(145deg, rgba(124,92,255,0.25), rgba(77,215,255,0.13))',
    transform: 'scale(1.01)',
  },

  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  uploadIcon: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    marginBottom: '0.2rem',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    boxShadow: '0 0 24px rgba(124,92,255,0.25)',
  },

  dropZoneStrong: {
    fontSize: '0.78rem',
  },

  dropZoneSpan: {
    color: '#96a3bf',
    fontSize: '0.67rem',
  },

  dropZoneSmall: {
    marginTop: '0.2rem',
    color: '#8290ad',
    fontSize: '0.6rem',
  },

  hiddenInput: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    opacity: 0,
    pointerEvents: 'none',
  },

  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '0.4rem',
    marginTop: '0.65rem',
  },

  optionButton: {
    minHeight: '4.1rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.25rem',
    padding: '0.35rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.8rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.6rem',
    fontWeight: 750,
    cursor: 'pointer',
  },

  optionButtonSmall: {
    color: '#8290ad',
    fontSize: '0.52rem',
    fontWeight: 600,
  },

  recordingButton: {
    borderColor: 'rgba(255,79,122,0.32)',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.1)',
  },

  selectedArea: {
    display: 'grid',
    gap: '0.7rem',
  },

  previewBox: {
    position: 'relative',
    minHeight: '9rem',
    overflow: 'hidden',
    borderRadius: '0.9rem',
    background: '#080b12',
  },

  previewMedia: {
    width: '100%',
    maxHeight: '18rem',
    display: 'block',
    objectFit: 'contain',
  },

  previewVideo: {
    position: 'relative',
  },

  previewPlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    transform: 'translate(-50%, -50%)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(0,0,0,0.48)',
    pointerEvents: 'none',
  },

  audioPreview: {
    minHeight: '9rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.65rem',
    padding: '1rem',
    color: '#9deeff',
    background:
      'linear-gradient(135deg, rgba(77,215,255,0.1), rgba(124,92,255,0.12))',
  },

  audio: {
    width: '100%',
    maxWidth: '20rem',
  },

  filePreview: {
    minHeight: '9rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.5rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.72rem',
  },

  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
  },

  fileIcon: {
    width: '2.4rem',
    height: '2.4rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.7rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,0.1)',
  },

  fileCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '0.2rem',
    flex: 1,
  },

  fileCopyStrong: {
    overflow: 'hidden',
    fontSize: '0.7rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  fileCopySpan: {
    color: '#96a3bf',
    fontSize: '0.62rem',
  },

  fileCopySmall: {
    color: '#8290ad',
    fontSize: '0.58rem',
  },

  removeButton: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,79,122,0.22)',
    borderRadius: '999px',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.08)',
    cursor: 'pointer',
  },

  recordingControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem',
    borderRadius: '0.75rem',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.09)',
    fontSize: '0.66rem',
    fontWeight: 750,
  },

  recordingDot: {
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '999px',
    background: '#ff4f7a',
    animation:
      'aarush-chat-media-recording 1s ease-in-out infinite',
  },

  stopButton: {
    marginLeft: 'auto',
    padding: '0.35rem 0.5rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background: '#ff4f7a',
    fontSize: '0.6rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  cancelButton: {
    padding: '0.35rem 0.5rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: '#cbd6ea',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.6rem',
    cursor: 'pointer',
  },

  progressSection: {
    display: 'grid',
    gap: '0.4rem',
  },

  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#aab6cf',
    fontSize: '0.64rem',
  },

  progressTrack: {
    height: '0.45rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
  },

  progressFill: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg, #7c5cff, #ff4fd8, #4dd7ff)',
    boxShadow: '0 0 14px rgba(77,215,255,0.42)',
    transition: 'width 220ms ease',
  },

  actionRow: {
    display: 'flex',
    gap: '0.45rem',
  },

  secondaryButton: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    flex: '1 1 7rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  uploadButton: {
    minHeight: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    flex: '1 1 12rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  spin: {
    animation:
      'aarush-chat-media-spin 850ms linear infinite',
  },

  securityNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    marginTop: '0.75rem',
    color: '#82e9c1',
    fontSize: '0.59rem',
    fontWeight: 700,
  },
};