import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  ChevronLeft,
  FileVideo,
  Image as ImageIcon,
  MapPin,
  Play,
  RotateCcw,
  Send,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { createPost } from '../utils/postEngine';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

const GUEST_KEYS = {
  isGuest: 'aarush_is_guest',
  guestSession: 'aarush_guest_session',
};

function isGuestMode() {
  return (
    window.localStorage.getItem(GUEST_KEYS.isGuest) === 'true' &&
    window.localStorage.getItem(GUEST_KEYS.guestSession) !== null
  );
}

function formatFileSize(bytes) {
  if (!bytes) {
    return '0 KB';
  }

  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMediaType(file) {
  return file?.type?.startsWith('video/')
    ? 'video'
    : 'image';
}

function validateFile(file) {
  if (!file) {
    return 'Please select an image or video.';
  }

  const isImage = IMAGE_TYPES.includes(file.type);
  const isVideo = VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return 'Unsupported file type. Use JPG, JPEG, PNG, WEBP, MP4, MOV, or WEBM.';
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return 'Images must be 10 MB or smaller.';
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return 'Videos must be 100 MB or smaller.';
  }

  return '';
}

function getStatusLabel(progress, uploading) {
  if (!uploading) {
    return 'Ready to publish';
  }

  if (progress < 15) {
    return 'Preparing upload…';
  }

  if (progress < 75) {
    return 'Uploading media…';
  }

  if (progress < 96) {
    return 'Processing post…';
  }

  return 'Finalizing post…';
}

function PreviewMedia({ file, previewUrl, onLoad }) {
  if (!file || !previewUrl) {
    return null;
  }

  if (getMediaType(file) === 'video') {
    return (
      <div style={styles.previewMediaWrapper}>
        <video
          src={previewUrl}
          controls
          muted
          playsInline
          preload="metadata"
          onLoadedMetadata={onLoad}
          style={styles.previewMedia}
        />

        <span style={styles.mediaTypeBadge}>
          <FileVideo size={13} />
          Video
        </span>

        <span style={styles.playBadge}>
          <Play size={15} fill="currentColor" />
        </span>
      </div>
    );
  }

  return (
    <div style={styles.previewMediaWrapper}>
      <img
        src={previewUrl}
        alt="Selected post preview"
        loading="lazy"
        onLoad={onLoad}
        style={styles.previewMedia}
      />

      <span style={styles.mediaTypeBadge}>
        <ImageIcon size={13} />
        Image
      </span>
    </div>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const cancelRef = useRef(false);
  const previewUrlRef = useRef('');

  const [guest] = useState(() => isGuestMode());
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [fileReady, setFileReady] = useState(false);

  const mediaType = useMemo(
    () => getMediaType(file),
    [file]
  );

  const statusLabel = useMemo(
    () => getStatusLabel(progress, uploading),
    [progress, uploading]
  );

  const resetPreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
  }, []);

  const clearForm = useCallback(() => {
    resetPreviewUrl();

    setFile(null);
    setPreviewUrl('');
    setCaption('');
    setLocation('');
    setHashtags('');
    setProgress(0);
    setUploading(false);
    setSuccess(false);
    setError('');
    setFileReady(false);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [resetPreviewUrl]);

  const selectFile = useCallback(
    (selectedFile) => {
      if (guest) {
        setError(
          'Posting is not available in Guest Mode. Sign in to upload content.'
        );
        return;
      }

      const validationError = validateFile(selectedFile);

      if (validationError) {
        setFile(null);
        setPreviewUrl('');
        setFileReady(false);
        setError(validationError);
        return;
      }

      resetPreviewUrl();

      const nextPreviewUrl =
        URL.createObjectURL(selectedFile);

      previewUrlRef.current = nextPreviewUrl;

      setFile(selectedFile);
      setPreviewUrl(nextPreviewUrl);
      setFileReady(false);
      setError('');
      setSuccess(false);
      setProgress(0);
    },
    [guest, resetPreviewUrl]
  );

  const handleFileChange = useCallback(
    (event) => {
      const selectedFile = event.target.files?.[0];

      if (selectedFile) {
        selectFile(selectedFile);
      }
    },
    [selectFile]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragging(false);

      const droppedFile = event.dataTransfer.files?.[0];

      if (droppedFile) {
        selectFile(droppedFile);
      }
    },
    [selectFile]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();

    if (!guest && !uploading) {
      setDragging(true);
    }
  }, [guest, uploading]);

  const handleDragLeave = useCallback((event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDragging(false);
    }
  }, []);

  const handleUpload = useCallback(
    async (event) => {
      event.preventDefault();

      if (guest) {
        setError(
          'Posting is not available in Guest Mode. Sign in to upload content.'
        );
        return;
      }

      if (!file) {
        setError('Select an image or video before publishing.');
        return;
      }

      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      if (!caption.trim()) {
        setError('Add a caption before publishing.');
        return;
      }

      cancelRef.current = false;
      setUploading(true);
      setSuccess(false);
      setError('');
      setProgress(2);

      try {
        await createPost({
          file,
          caption,
          location,
          hashtags,
          onProgress: (nextProgress) => {
            if (!cancelRef.current) {
              setProgress(Math.min(100, nextProgress));
            }
          },
        });

        if (cancelRef.current) {
          return;
        }

        setProgress(100);
        setUploading(false);
        setSuccess(true);

        window.setTimeout(() => {
          navigate('/home');
        }, 900);
      } catch (uploadError) {
        if (cancelRef.current) {
          return;
        }

        setUploading(false);
        setProgress(0);
        setError(
          uploadError.message ||
            'Unable to publish your post. Please try again.'
        );
      }
    },
    [
      caption,
      file,
      guest,
      hashtags,
      location,
      navigate,
    ]
  );

  const cancelUpload = useCallback(() => {
    cancelRef.current = true;
    setUploading(false);
    setProgress(0);
    setError('Upload cancelled.');
  }, []);

  const retryUpload = useCallback(() => {
    setError('');
    setProgress(0);

    if (file) {
      handleUpload({
        preventDefault: () => {},
      });
    }
  }, [file, handleUpload]);

  const canPublish =
    Boolean(file) &&
    Boolean(caption.trim()) &&
    !uploading &&
    !success &&
    !guest;

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Create Post"
        showBackButton
        onBack={() => navigate(-1)}
      />

      <main style={styles.content}>
        {guest ? (
          <div style={styles.guestNotice} role="status">
            <AlertCircle size={17} />
            <span>
              Posting is not available in Guest Mode. Sign in to
              upload content.
            </span>
          </div>
        ) : null}

        {error ? (
          <div role="alert" style={styles.errorNotice}>
            <AlertCircle size={17} />

            <span>{error}</span>

            {file && !uploading && !success ? (
              <button
                type="button"
                onClick={retryUpload}
                style={styles.retryButton}
              >
                <RotateCcw size={14} />
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        {success ? (
          <div role="status" style={styles.successNotice}>
            <span style={styles.successIcon}>
              <Check size={17} />
            </span>

            <div>
              <strong>Post published successfully.</strong>
              <span>Taking you back to your feed…</span>
            </div>
          </div>
        ) : null}

        <section style={styles.hero}>
          <span style={styles.heroIcon}>
            <UploadCloud size={23} />
          </span>

          <div>
            <h1 style={styles.title}>Create a Post</h1>
            <p style={styles.subtitle}>
              Share a moment with your Aarush community.
            </p>
          </div>
        </section>

        <form onSubmit={handleUpload} style={styles.form}>
          <section
            style={{
              ...styles.dropZone,
              ...(dragging ? styles.draggingDropZone : {}),
              ...(file ? styles.hasFileDropZone : {}),
              ...(guest ? styles.disabledDropZone : {}),
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            tabIndex={guest ? -1 : 0}
            onKeyDown={(event) => {
              if (
                !guest &&
                !uploading &&
                (event.key === 'Enter' ||
                  event.key === ' ')
              ) {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
            aria-label="Upload post media"
          >
            {file && previewUrl ? (
              <PreviewMedia
                file={file}
                previewUrl={previewUrl}
                onLoad={() => setFileReady(true)}
              />
            ) : (
              <div style={styles.dropContent}>
                <span style={styles.uploadIcon}>
                  <UploadCloud size={28} />
                </span>

                <strong>Drop your media here</strong>

                <span>
                  or choose an image or video from your device
                </span>

                <div style={styles.fileActions}>
                  <button
                    type="button"
                    disabled={guest || uploading}
                    onClick={() => inputRef.current?.click()}
                    style={styles.chooseButton}
                  >
                    <ImageIcon size={15} />
                    Choose Media
                  </button>

                  <label
                    style={{
                      ...styles.cameraButton,
                      opacity: guest || uploading ? 0.45 : 1,
                    }}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept={[
                        ...IMAGE_TYPES,
                        ...VIDEO_TYPES,
                      ].join(',')}
                      capture="environment"
                      onChange={handleFileChange}
                      disabled={guest || uploading}
                      style={styles.hiddenInput}
                    />
                    <ImageIcon size={15} />
                    Camera
                  </label>
                </div>

                <small>
                  Images up to 10 MB · Videos up to 100 MB
                </small>
              </div>
            )}

            {file ? (
              <div style={styles.selectedFileBar}>
                <div style={styles.fileDetails}>
                  {mediaType === 'video' ? (
                    <FileVideo size={16} />
                  ) : (
                    <ImageIcon size={16} />
                  )}

                  <span>{file.name}</span>
                  <small>{formatFileSize(file.size)}</small>
                </div>

                <button
                  type="button"
                  onClick={clearForm}
                  disabled={uploading}
                  style={styles.removeButton}
                  aria-label="Remove selected media"
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>
            ) : null}
          </section>

          <input
            ref={inputRef}
            type="file"
            accept={[
              ...IMAGE_TYPES,
              ...VIDEO_TYPES,
            ].join(',')}
            onChange={handleFileChange}
            disabled={guest || uploading}
            style={styles.hiddenInput}
            tabIndex={-1}
            aria-hidden="true"
          />

          <section style={styles.card}>
            <label style={styles.field}>
              <span>Caption</span>
              <textarea
                value={caption}
                onChange={(event) =>
                  setCaption(event.target.value)
                }
                placeholder="Write something about this post…"
                maxLength={2200}
                disabled={guest || uploading}
                style={{
                  ...styles.textarea,
                  ...(guest ? styles.disabledInput : {}),
                }}
              />
              <small style={styles.characterCount}>
                {caption.length}/2200
              </small>
            </label>

            <label style={styles.field}>
              <span>
                <MapPin size={14} />
                Location
              </span>

              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="Add a location"
                maxLength={120}
                disabled={guest || uploading}
                style={{
                  ...styles.input,
                  ...(guest ? styles.disabledInput : {}),
                }}
              />
            </label>

            <label style={styles.field}>
              <span># Hashtags</span>

              <input
                type="text"
                value={hashtags}
                onChange={(event) =>
                  setHashtags(event.target.value)
                }
                placeholder="#aarush #design #travel"
                maxLength={500}
                disabled={guest || uploading}
                style={{
                  ...styles.input,
                  ...(guest ? styles.disabledInput : {}),
                }}
              />

              <small style={styles.helpText}>
                Separate hashtags with spaces or commas.
              </small>
            </label>
          </section>

          {uploading ? (
            <section style={styles.progressCard}>
              <div style={styles.progressHeader}>
                <div>
                  <strong>{statusLabel}</strong>
                  <span>
                    {fileReady
                      ? 'Media preview is ready.'
                      : 'Please keep this page open.'}
                  </span>
                </div>

                <strong style={styles.progressValue}>
                  {progress}%
                </strong>
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

              <button
                type="button"
                onClick={cancelUpload}
                style={styles.cancelButton}
              >
                <X size={14} />
                Cancel upload
              </button>
            </section>
          ) : null}

          {!success ? (
            <div style={styles.bottomActions}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={uploading}
                style={styles.secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canPublish}
                style={{
                  ...styles.publishButton,
                  opacity: canPublish ? 1 : 0.45,
                }}
              >
                <Send size={16} />
                Publish Post
              </button>
            </div>
          ) : null}
        </form>
      </main>

      <BottomNav />
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '6.8rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
  },

  content: {
    width: '100%',
    maxWidth: '760px',
    margin: '0 auto',
    padding: '0.95rem',
    boxSizing: 'border-box',
  },

  guestNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.8rem',
    padding: '0.75rem 0.8rem',
    border: '1px solid rgba(255,210,125,0.2)',
    borderRadius: '0.85rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,0.08)',
    fontSize: '0.72rem',
    fontWeight: 750,
    lineHeight: 1.45,
  },

  errorNotice: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.45rem',
    marginBottom: '0.8rem',
    padding: '0.75rem 0.8rem',
    border: '1px solid rgba(255,79,122,0.22)',
    borderRadius: '0.85rem',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.08)',
    fontSize: '0.72rem',
    lineHeight: 1.45,
  },

  successNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginBottom: '0.8rem',
    padding: '0.8rem',
    border: '1px solid rgba(130,233,193,0.2)',
    borderRadius: '0.85rem',
    color: '#82e9c1',
    background: 'rgba(130,233,193,0.08)',
    fontSize: '0.72rem',
  },

  successNoticeDiv: {
    display: 'grid',
    gap: '0.2rem',
  },

  successNoticeSpan: {
    color: '#9acbb8',
    fontSize: '0.65rem',
  },

  successIcon: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#07120e',
    background: '#82e9c1',
  },

  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    marginBottom: '0.9rem',
    padding: '0.95rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.9)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
  },

  heroIcon: {
    width: '2.85rem',
    height: '2.85rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.9rem',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },

  title: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 900,
  },

  subtitle: {
    margin: '0.25rem 0 0',
    color: '#96a3bf',
    fontSize: '0.72rem',
  },

  form: {
    display: 'grid',
    gap: '0.85rem',
  },

  dropZone: {
    position: 'relative',
    minHeight: '19rem',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    border: '1px dashed rgba(124,92,255,0.38)',
    borderRadius: '1.25rem',
    color: '#dce5f8',
    background:
      'linear-gradient(145deg, rgba(124,92,255,0.1), rgba(77,215,255,0.04))',
    outline: 0,
    transition:
      'border-color 180ms ease, background 180ms ease, transform 180ms ease',
  },

  draggingDropZone: {
    borderColor: '#4dd7ff',
    background:
      'linear-gradient(145deg, rgba(124,92,255,0.25), rgba(77,215,255,0.13))',
    transform: 'scale(1.01)',
  },

  hasFileDropZone: {
    minHeight: 'auto',
  },

  disabledDropZone: {
    opacity: 0.55,
    cursor: 'not-allowed',
  },

  dropContent: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.5rem',
    padding: '2rem 1rem',
    textAlign: 'center',
  },

  uploadIcon: {
    width: '3.5rem',
    height: '3.5rem',
    display: 'grid',
    placeItems: 'center',
    marginBottom: '0.25rem',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.8), rgba(77,215,255,0.72))',
    boxShadow: '0 0 26px rgba(124,92,255,0.25)',
  },

  dropContentStrong: {
    fontSize: '0.9rem',
  },

  dropContentSpan: {
    color: '#96a3bf',
    fontSize: '0.7rem',
  },

  dropContentSmall: {
    marginTop: '0.25rem',
    color: '#8290ad',
    fontSize: '0.62rem',
  },

  fileActions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.45rem',
    marginTop: '0.3rem',
  },

  chooseButton: {
    minHeight: '2.45rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0 0.8rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  cameraButton: {
    position: 'relative',
    minHeight: '2.45rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0 0.8rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.06)',
    fontSize: '0.7rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  hiddenInput: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    opacity: 0,
    pointerEvents: 'none',
  },

  previewMediaWrapper: {
    position: 'relative',
    width: '100%',
    maxHeight: '32rem',
    overflow: 'hidden',
    background: '#080b12',
  },

  previewMedia: {
    width: '100%',
    maxHeight: '32rem',
    display: 'block',
    objectFit: 'contain',
  },

  mediaTypeBadge: {
    position: 'absolute',
    top: '0.65rem',
    left: '0.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.28rem',
    padding: '0.35rem 0.48rem',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(5,8,15,0.62)',
    fontSize: '0.62rem',
    fontWeight: 800,
  },

  playBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    transform: 'translate(-50%, -50%)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(5,8,15,0.55)',
    pointerEvents: 'none',
  },

  selectedFileBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.65rem 0.75rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(7,10,17,0.72)',
  },

  fileDetails: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#dce5f8',
    fontSize: '0.68rem',
  },

  fileDetailsSpan: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  fileDetailsSmall: {
    flexShrink: 0,
    color: '#8290ad',
  },

  removeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    flexShrink: 0,
    padding: '0.4rem 0.55rem',
    border: '1px solid rgba(255,79,122,0.2)',
    borderRadius: '999px',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.08)',
    fontSize: '0.62rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  card: {
    display: 'grid',
    gap: '0.8rem',
    padding: '0.95rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.9)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
  },

  field: {
    position: 'relative',
    display: 'grid',
    gap: '0.35rem',
    color: '#dce5f8',
    fontSize: '0.72rem',
    fontWeight: 800,
  },

  fieldSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
  },

  input: {
    width: '100%',
    minHeight: '2.7rem',
    boxSizing: 'border-box',
    padding: '0 0.75rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.8rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.74rem',
  },

  textarea: {
    width: '100%',
    minHeight: '7rem',
    boxSizing: 'border-box',
    resize: 'vertical',
    padding: '0.7rem 0.75rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.8rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,0.05)',
    fontFamily: 'inherit',
    fontSize: '0.74rem',
    lineHeight: 1.5,
  },

  disabledInput: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  characterCount: {
    justifySelf: 'end',
    marginTop: '-0.15rem',
    color: '#8290ad',
    fontSize: '0.61rem',
    fontWeight: 600,
  },

  helpText: {
    color: '#8290ad',
    fontSize: '0.62rem',
    fontWeight: 600,
  },

  progressCard: {
    display: 'grid',
    gap: '0.7rem',
    padding: '0.9rem',
    border: '1px solid rgba(77,215,255,0.18)',
    borderRadius: '1.1rem',
    background:
      'linear-gradient(145deg, rgba(77,215,255,0.08), rgba(124,92,255,0.08))',
  },

  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
  },

  progressHeaderDiv: {
    display: 'grid',
    gap: '0.2rem',
  },

  progressHeaderSpan: {
    color: '#96a3bf',
    fontSize: '0.64rem',
  },

  progressValue: {
    color: '#9deeff',
    fontSize: '0.9rem',
  },

  progressTrack: {
    height: '0.55rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
  },

  progressFill: {
    position: 'relative',
    display: 'block',
    height: '100%',
    overflow: 'hidden',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg, #7c5cff, #ff4fd8, #4dd7ff)',
    boxShadow: '0 0 16px rgba(77,215,255,0.42)',
    transition: 'width 220ms ease',
  },

  cancelButton: {
    justifySelf: 'start',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: 0,
    border: 0,
    color: '#ffb1c8',
    background: 'transparent',
    fontSize: '0.66rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  bottomActions: {
    display: 'flex',
    gap: '0.55rem',
  },

  secondaryButton: {
    minHeight: '2.8rem',
    flex: '1 1 8rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.76rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  publishButton: {
    minHeight: '2.8rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    flex: '1 1 12rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.76rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  retryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.35rem 0.5rem',
    border: '1px solid rgba(255,159,186,0.25)',
    borderRadius: '999px',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.08)',
    fontSize: '0.62rem',
    fontWeight: 800,
    cursor: 'pointer',
  },
};