import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  AudioLines,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileArchive,
  FileText,
  FolderLock,
  Globe2,
  Image as ImageIcon,
  Info,
  Languages,
  Link2,
  Lock,
  MapPin,
  Maximize,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  Save,
  Search,
  Send,
  Share2,
  Shield,
  Sparkles,
  Trash2,
  UploadCloud,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

const DOWNLOAD_STEPS = [
  'Download Original',
  'Download Compressed',
  'Save To Device',
  'Save To Vault',
  'Save To Cloud',
  'Save To Workspace',
];

const LONG_PRESS_DURATION = 650;

function formatBytes(value) {
  if (!value) {
    return '';
  }

  const bytes = Number(value);

  if (!Number.isFinite(bytes)) {
    return String(value);
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDuration(value) {
  if (!value) {
    return '0:00';
  }

  if (typeof value === 'string') {
    return value;
  }

  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
}

function getType(type, url, fileName) {
  const normalized = String(type || '').toLowerCase();

  if (normalized) {
    return normalized;
  }

  const name = String(fileName || url || '').toLowerCase();

  if (/\.(jpg|jpeg|png|webp|avif|heic)$/i.test(name)) {
    return 'image';
  }

  if (/\.(gif)$/i.test(name)) {
    return 'gif';
  }

  if (/\.(mp4|webm|mov|m4v|avi)$/i.test(name)) {
    return 'video';
  }

  if (/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(name)) {
    return 'audio';
  }

  if (/\.(pdf)$/i.test(name)) {
    return 'pdf';
  }

  if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) {
    return 'archive';
  }

  if (/^https?:\/\//i.test(String(url || ''))) {
    return 'link';
  }

  return 'document';
}

function getTypeIcon(type) {
  if (type === 'audio' || type === 'voice') {
    return AudioLines;
  }

  if (type === 'pdf' || type === 'document') {
    return FileText;
  }

  if (type === 'archive') {
    return FileArchive;
  }

  if (type === 'contact') {
    return MessageCircle;
  }

  if (type === 'location') {
    return MapPin;
  }

  if (type === 'link') {
    return Link2;
  }

  if (type === 'vault') {
    return FolderLock;
  }

  if (type === 'cloud' || type === 'workspace') {
    return UploadCloud;
  }

  return ImageIcon;
}

function FileDetails({ fileName, fileSize, metadata }) {
  const details = [
    fileName ? ['File name', fileName] : null,
    fileSize ? ['File size', formatBytes(fileSize)] : null,
    metadata?.fileType ? ['File type', metadata.fileType] : null,
    metadata?.resolution ? ['Resolution', metadata.resolution] : null,
    metadata?.duration
      ? ['Duration', formatDuration(metadata.duration)]
      : null,
    metadata?.date ? ['Date', metadata.date] : null,
    metadata?.sender ? ['Sender', metadata.sender] : null,
    metadata?.storageLocation
      ? ['Storage', metadata.storageLocation]
      : null,
    metadata?.encryptionStatus
      ? ['Encryption', metadata.encryptionStatus]
      : null,
  ].filter(Boolean);

  if (details.length === 0) {
    return null;
  }

  return (
    <div style={styles.detailsGrid}>
      {details.map(([label, value]) => (
        <div key={label} style={styles.detailRow}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function AudioPreview({
  url,
  duration,
  onDownload,
  isFullscreen = false,
}) {
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(
    Number(duration) || 0
  );
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (Number.isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (playing) {
      audio.pause();
      return;
    }

    try {
      audio.playbackRate = speed;
      await audio.play();
    } catch {
      setPlaying(false);
    }
  };

  const seek = (event) => {
    if (!waveformRef.current || !audioRef.current) {
      return;
    }

    const bounds = waveformRef.current.getBoundingClientRect();
    const offset = Math.max(
      0,
      Math.min(bounds.width, event.clientX - bounds.left)
    );
    const ratio = bounds.width > 0 ? offset / bounds.width : 0;

    audioRef.current.currentTime = ratio * totalDuration;
    setCurrentTime(audioRef.current.currentTime);
  };

  const progress =
    totalDuration > 0
      ? Math.min(1, currentTime / totalDuration)
      : 0;

  return (
    <div
      style={{
        ...styles.audioPlayer,
        ...(isFullscreen ? styles.audioPlayerFullscreen : {}),
      }}
    >
      <audio
        ref={audioRef}
        src={url || undefined}
        preload="metadata"
        style={styles.hiddenAudio}
      />

      <button
        type="button"
        onClick={togglePlayback}
        style={styles.audioPlayButton}
        aria-label={playing ? 'Pause audio' : 'Play audio'}
      >
        {playing ? <Pause size={17} /> : <Play size={17} />}
      </button>

      <div style={styles.audioBody}>
        <div
          ref={waveformRef}
          style={styles.audioWaveform}
          onClick={seek}
          role="slider"
          tabIndex={0}
          aria-label="Audio progress"
          aria-valuemin="0"
          aria-valuemax={Math.floor(totalDuration)}
          aria-valuenow={Math.floor(currentTime)}
        >
          {Array.from({ length: 42 }).map((_, index) => {
            const barPosition =
              index / Math.max(1, 41);

            return (
              <span
                key={index}
                style={{
                  ...styles.audioBar,
                  height: `${8 + ((index * 17) % 20)}px`,
                  background:
                    barPosition <= progress
                      ? 'linear-gradient(180deg, #ffffff, #a9edff)'
                      : 'rgba(160,181,222,0.58)',
                }}
              />
            );
          })}
        </div>

        <div style={styles.audioMeta}>
          <span>
            {formatDuration(currentTime)} /{' '}
            {formatDuration(totalDuration)}
          </span>

          <button
            type="button"
            onClick={() =>
              setSpeed((value) => (value >= 2 ? 0.5 : value + 0.5))
            }
            style={styles.speedButton}
          >
            {speed}×
          </button>
        </div>
      </div>

      {onDownload ? (
        <button
          type="button"
          onClick={onDownload}
          style={styles.smallIconButton}
          aria-label="Download audio"
        >
          <Download size={15} />
        </button>
      ) : null}
    </div>
  );
}

function InlinePreview({
  type,
  url,
  thumbnail,
  fileName,
  fileSize,
  duration,
  metadata,
  onOpen,
  isSensitive,
}) {
  const Icon = getTypeIcon(type);

  if (type === 'image' || type === 'gif' || type === 'sticker') {
    return (
      <button
        type="button"
        onClick={onOpen}
        style={styles.imagePreviewButton}
        aria-label={`Open ${type} preview`}
      >
        {url || thumbnail ? (
          <img
            src={thumbnail || url}
            alt={fileName || `${type} preview`}
            loading="lazy"
            decoding="async"
            style={{
              ...styles.inlineImage,
              ...(isSensitive ? styles.sensitiveMedia : {}),
            }}
          />
        ) : (
          <div style={styles.mediaPlaceholder}>
            <Icon size={24} />
            <span>{fileName || `${type} preview`}</span>
          </div>
        )}

        <span style={styles.fullscreenHint}>
          <Maximize size={13} />
          Open
        </span>
      </button>
    );
  }

  if (type === 'video') {
    return (
      <button
        type="button"
        onClick={onOpen}
        style={styles.videoPreviewButton}
        aria-label="Open video preview"
      >
        {thumbnail || url ? (
          <video
            src={url || undefined}
            poster={thumbnail || undefined}
            muted
            playsInline
            preload="metadata"
            style={styles.inlineVideo}
          />
        ) : (
          <div style={styles.mediaPlaceholder}>
            <VideoIcon />
            <span>{fileName || 'Video'}</span>
          </div>
        )}

        <span style={styles.videoPlay}>
          <Play size={22} />
        </span>

        {duration ? (
          <span style={styles.durationBadge}>
            {formatDuration(duration)}
          </span>
        ) : null}
      </button>
    );
  }

  if (type === 'audio' || type === 'voice') {
    return (
      <AudioPreview
        url={url}
        duration={duration}
        onDownload={() => onOpen?.({mode: 'audio-download'})}
      />
    );
  }

  if (type === 'link') {
    return (
      <button
        type="button"
        onClick={onOpen}
        style={styles.linkPreview}
      >
        <span style={styles.linkIcon}>
          <Globe2 size={19} />
        </span>

        <span style={styles.linkBody}>
          <strong>{metadata?.title || fileName || 'Shared link'}</strong>
          <small>
            {metadata?.description || metadata?.domain || url}
          </small>
          {metadata?.domain ? (
            <em>{metadata.domain}</em>
          ) : null}
        </span>
      </button>
    );
  }

  if (type === 'location') {
    return (
      <button
        type="button"
        onClick={onOpen}
        style={styles.locationPreview}
      >
        <span style={styles.mapPlaceholder}>
          <MapPin size={25} />
        </span>

        <span style={styles.locationBody}>
          <strong>{metadata?.placeName || 'Shared location'}</strong>
          <small>{metadata?.address || 'Open map location'}</small>
          {metadata?.distance ? (
            <em>{metadata.distance}</em>
          ) : null}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      style={styles.filePreview}
    >
      <span style={styles.fileIcon}>
        <Icon size={22} />
      </span>

      <span style={styles.fileBody}>
        <strong>{fileName || 'Shared document'}</strong>
        <small>
          {metadata?.fileType ||
            (type === 'pdf' ? 'PDF document' : 'File')}
          {fileSize ? ` · ${formatBytes(fileSize)}` : ''}
        </small>
        {metadata?.pageCount ? (
          <em>{metadata.pageCount} pages</em>
        ) : null}
      </span>

      <ChevronRight size={16} />
    </button>
  );
}

function VideoIcon() {
  return <Play size={22} />;
}

function FullscreenViewer({
  type,
  url,
  thumbnail,
  fileName,
  fileSize,
  duration,
  metadata,
  onClose,
  onDownload,
  onShare,
  onSaveToVault,
  isSensitive,
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [viewerMenuOpen, setViewerMenuOpen] = useState(false);

  const isAudio = type === 'audio' || type === 'voice';
  const isVideo = type === 'video';
  const isImage =
    type === 'image' ||
    type === 'gif' ||
    type === 'sticker';

  return (
    <div
      style={styles.fullscreenOverlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={styles.fullscreenPanel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${type} viewer`}
      >
        <header style={styles.viewerHeader}>
          <div style={styles.viewerTitle}>
            <strong>{fileName || `${type} preview`}</strong>
            <small>
              {fileSize ? formatBytes(fileSize) : ''}
              {duration ? ` · ${formatDuration(duration)}` : ''}
            </small>
          </div>

          <div style={styles.viewerHeaderActions}>
            <button
              type="button"
              onClick={() => setViewerMenuOpen((value) => !value)}
              style={styles.viewerButton}
              aria-label="More media options"
            >
              <MoreHorizontal size={18} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={styles.viewerButton}
              aria-label="Close fullscreen preview"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div style={styles.viewerContent}>
          {isImage ? (
            <div style={styles.imageViewer}>
              {url || thumbnail ? (
                <img
                  src={url || thumbnail}
                  alt={fileName || 'Media'}
                  style={{
                    ...styles.fullscreenImage,
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    ...(isSensitive ? styles.sensitiveMedia : {}),
                  }}
                />
              ) : (
                <div style={styles.viewerPlaceholder}>
                  <ImageIcon size={44} />
                  <span>Media unavailable</span>
                </div>
              )}
            </div>
          ) : null}

          {isVideo ? (
            <video
              src={url || undefined}
              poster={thumbnail || undefined}
              controls
              autoPlay
              playsInline
              style={styles.fullscreenVideo}
            />
          ) : null}

          {isAudio ? (
            <AudioPreview
              url={url}
              duration={duration}
              isFullscreen
              onDownload={onDownload}
            />
          ) : null}

          {!isImage && !isVideo && !isAudio ? (
            <div style={styles.documentViewer}>
              <FileText size={48} />
              <strong>{fileName || 'Document preview'}</strong>
              <small>
                {metadata?.fileType || 'Preview available for download'}
              </small>
            </div>
          ) : null}
        </div>

        {isImage ? (
          <div style={styles.imageControls}>
            <button
              type="button"
              onClick={() =>
                setZoom((value) => Math.max(0.75, value - 0.25))
              }
              style={styles.viewerButton}
              aria-label="Zoom out"
            >
              <ZoomOut size={17} />
            </button>

            <button
              type="button"
              onClick={() =>
                setZoom((value) => Math.min(3, value + 0.25))
              }
              style={styles.viewerButton}
              aria-label="Zoom in"
            >
              <ZoomIn size={17} />
            </button>

            <button
              type="button"
              onClick={() =>
                setRotation((value) => (value + 90) % 360)
              }
              style={styles.viewerButton}
              aria-label="Rotate image"
            >
              <RotateCcw size={17} />
            </button>
          </div>
        ) : null}

        <footer style={styles.viewerFooter}>
          <button
            type="button"
            onClick={onDownload}
            style={styles.viewerFooterButton}
          >
            <Download size={15} />
            Download
          </button>

          <button
            type="button"
            onClick={onShare}
            style={styles.viewerFooterButton}
          >
            <Share2 size={15} />
            Share
          </button>

          <button
            type="button"
            onClick={onSaveToVault}
            style={styles.viewerFooterButton}
          >
            <FolderLockIcon />
            Vault
          </button>
        </footer>

        {viewerMenuOpen ? (
          <div style={styles.viewerMenu}>
            <button type="button" style={styles.viewerMenuItem}>
              <Sparkles size={15} />
              AI Analyze
            </button>

            <button type="button" style={styles.viewerMenuItem}>
              <Languages size={15} />
              Translate
            </button>

            <button type="button" style={styles.viewerMenuItem}>
              <Shield size={15} />
              Sensitive Content Detection
            </button>

            <button type="button" style={styles.viewerMenuItem}>
              <Info size={15} />
              Message Info
            </button>

            <button type="button" style={styles.viewerMenuItemDanger}>
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FolderLockIcon() {
  return <FolderLock size={15} />;
}

function ChatMediaPreview({
  type,
  url,
  thumbnail,
  fileName,
  fileSize,
  duration,
  metadata = {},
  isOutgoing = false,
  aiState = '',
  isSensitive = false,
  hidden = false,
  locked = false,
  onOpen,
  onClose,
  onDownload,
  onShare,
  onSaveToVault,
  onAction,
  className = '',
  style = {},
}) {
  const normalizedType = getType(type, url, fileName);
  const [fullscreen, setFullscreen] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] =
    useState(false);

  const longPressTimerRef = useRef(null);
  const pointerActiveRef = useRef(false);

  const effectiveHidden = hidden || locked;

  const media = useMemo(
    () => ({
      type: normalizedType,
      url,
      thumbnail,
      fileName,
      fileSize,
      duration,
      metadata,
    }),
    [
      duration,
      fileName,
      fileSize,
      metadata,
      normalizedType,
      thumbnail,
      url,
    ]
  );

  useEffect(() => {
    if (
      normalizedType === 'image' ||
      normalizedType === 'gif' ||
      normalizedType === 'sticker'
    ) {
      const imageUrl = url || thumbnail;

      if (imageUrl) {
        const image = new Image();
        image.src = imageUrl;
      }
    }
  }, [normalizedType, thumbnail, url]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const openFullscreen = () => {
    setFullscreen(true);
    onOpen?.({
      ...media,
      mode: 'fullscreen',
    });
  };

  const closeFullscreen = () => {
    setFullscreen(false);
    onClose?.();
  };

  const startDownload = (mode) => {
    setDownloadMenuOpen(false);
    setDownloadComplete(false);
    setDownloadProgress(0);

    let progress = 0;

    const interval = window.setInterval(() => {
      progress += 20;
      setDownloadProgress(progress);

      if (progress >= 100) {
        window.clearInterval(interval);
        setDownloadComplete(true);

        onDownload?.({
          ...media,
          mode,
        });

        if (url && typeof document !== 'undefined') {
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = fileName || `aarush-media-${Date.now()}`;
          anchor.click();
        }
      }
    }, 120);
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerDown = () => {
    pointerActiveRef.current = true;

    clearLongPress();

    longPressTimerRef.current = window.setTimeout(() => {
      if (pointerActiveRef.current) {
        onAction?.('Media Actions', media);
      }
    }, 650);
  };

  const handlePointerUp = () => {
    clearLongPress();
    pointerActiveRef.current = false;
  };

  const handlePointerCancel = () => {
    clearLongPress();
    pointerActiveRef.current = false;
  };

  const renderInlineContent = () => {
    if (effectiveHidden) {
      return (
        <div style={styles.hiddenPreview}>
          <Shield size={24} />
          <span>
            {locked
              ? 'Locked media'
              : 'Media hidden by privacy settings'}
          </span>
        </div>
      );
    }

    return (
      <InlinePreview
        type={normalizedType}
        url={url}
        thumbnail={thumbnail}
        fileName={fileName}
        fileSize={fileSize}
        duration={duration}
        metadata={metadata}
        onOpen={openFullscreen}
        isSensitive={isSensitive}
      />
    );
  };

  return (
    <>
      <div
        className={className}
        style={{
          ...styles.previewWrapper,
          ...(isOutgoing ? styles.outgoingWrapper : {}),
          ...style,
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        onContextMenu={(event) => {
          event.preventDefault();
          onAction?.('Media Actions', media);
        }}
      >
        <div style={styles.previewHeader}>
          <span style={styles.mediaTypeLabel}>
            {normalizedType === 'vault' ? (
              <FolderLock size={13} />
            ) : normalizedType === 'cloud' ? (
              <UploadCloud size={13} />
            ) : (
              <FileText size={13} />
            )}
            {metadata?.storageLocation ||
              (normalizedType === 'vault'
                ? 'Memories Vault'
                : 'Shared media')}
          </span>

          {aiState ? (
            <span style={styles.aiState}>
              <Sparkles size={12} />
              {aiState}
            </span>
          ) : null}
        </div>

        {renderInlineContent()}

        <div style={styles.previewFooter}>
          <span style={styles.metadataLine}>
            {fileName || getTypeLabel(normalizedType)}
            {fileSize ? ` · ${formatBytes(fileSize)}` : ''}
          </span>

          <button
            type="button"
            onClick={() => setDownloadMenuOpen((value) => !value)}
            style={styles.previewActionButton}
            aria-label="Media download options"
          >
            <Download size={14} />
          </button>

          <button
            type="button"
            onClick={() =>
              onShare?.({
                ...media,
                mode: 'share',
              })
            }
            style={styles.previewActionButton}
            aria-label="Share media"
          >
            <Share2 size={14} />
          </button>
        </div>

        {downloadProgress > 0 ? (
          <div style={styles.downloadStatus}>
            <div style={styles.downloadProgressTrack}>
              <span
                style={{
                  ...styles.downloadProgressBar,
                  width: `${downloadProgress}%`,
                }}
              />
            </div>

            <span>
              {downloadComplete
                ? 'Saved'
                : `Downloading ${downloadProgress}%`}
            </span>

            {downloadComplete ? <Check size={13} /> : null}
          </div>
        ) : null}

        {downloadMenuOpen ? (
          <div style={styles.downloadMenu}>
            {[
              'Download Original',
              'Download Compressed',
              'Save To Device',
              'Save To Vault',
              'Save To Cloud',
              'Save To Workspace',
            ].map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => startDownload(item)}
                style={styles.downloadMenuItem}
              >
                {item.includes('Vault') ? (
                  <FolderLock size={14} />
                ) : item.includes('Cloud') ||
                  item.includes('Workspace') ? (
                  <UploadCloud size={14} />
                ) : (
                  <Download size={14} />
                )}
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {fullscreen ? (
        <FullscreenViewer
          type={normalizedType}
          url={url}
          thumbnail={thumbnail}
          fileName={fileName}
          fileSize={fileSize}
          duration={duration}
          metadata={metadata}
          onClose={closeFullscreen}
          onDownload={() => startDownload('Download Original')}
          onShare={() =>
            onShare?.({
              ...media,
              mode: 'share',
            })
          }
          onSaveToVault={() =>
            onSaveToVault?.({
              ...media,
              mode: 'vault',
            })
          }
          isSensitive={isSensitive}
        />
      ) : null}

      <style>{`
        .aarush-chat-media-preview {
          animation: aarush-media-in 180ms ease both;
        }

        .aarush-chat-media-preview button:focus-visible {
          outline: 2px solid #4dd7ff;
          outline-offset: 2px;
        }

        @keyframes aarush-media-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-chat-media-preview,
          .aarush-chat-media-preview * {
            animation: none !important;
            transition: none !important;
          }
        }

        @media (prefers-contrast: more) {
          .aarush-chat-media-preview {
            border-color: rgba(255,255,255,0.38) !important;
          }
        }
      `}</style>
    </>
  );
}

function getTypeLabel(type) {
  const labels = {
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    voice: 'Voice message',
    pdf: 'PDF',
    document: 'Document',
    archive: 'Archive',
    contact: 'Contact',
    location: 'Location',
    link: 'Link',
    gif: 'GIF',
    sticker: 'Sticker',
    vault: 'Vault file',
    cloud: 'Cloud file',
    workspace: 'Workspace file',
  };

  return labels[type] || 'Attachment';
}

const styles = {
  previewWrapper: {
    position: 'relative',
    width: 'min(100%, 25rem)',
    padding: '0.6rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1rem',
    color: '#eaf1ff',
    background:
      'linear-gradient(145deg, rgba(35,42,59,0.9), rgba(16,21,32,0.92))',
    boxShadow: '0 14px 34px rgba(0,0,0,0.18)',
  },

  outgoingWrapper: {
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.8), rgba(37,142,216,0.82))',
    boxShadow: '0 15px 34px rgba(60,75,190,0.22)',
  },

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    marginBottom: '0.45rem',
  },

  mediaTypeLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.28rem',
    color: '#b9c8df',
    fontSize: '0.64rem',
    fontWeight: 800,
  },

  aiState: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    color: '#e5d9ff',
    fontSize: '0.62rem',
    fontWeight: 800,
  },

  imagePreviewButton: {
    position: 'relative',
    display: 'block',
    width: '100%',
    minHeight: '5rem',
    padding: 0,
    overflow: 'hidden',
    border: 0,
    borderRadius: '0.78rem',
    color: '#ffffff',
    background: 'rgba(0,0,0,0.18)',
    cursor: 'pointer',
  },

  inlineImage: {
    display: 'block',
    width: '100%',
    maxHeight: '18rem',
    objectFit: 'cover',
    borderRadius: '0.78rem',
  },

  sensitiveMedia: {
    filter: 'blur(13px)',
  },

  fullscreenHint: {
    position: 'absolute',
    right: '0.5rem',
    bottom: '0.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.22rem',
    padding: '0.3rem 0.42rem',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(0,0,0,0.58)',
    fontSize: '0.61rem',
    fontWeight: 800,
  },

  videoPreviewButton: {
    position: 'relative',
    display: 'block',
    width: '100%',
    minHeight: '7rem',
    padding: 0,
    overflow: 'hidden',
    border: 0,
    borderRadius: '0.78rem',
    color: '#ffffff',
    background: '#0c111b',
    cursor: 'pointer',
  },

  inlineVideo: {
    display: 'block',
    width: '100%',
    maxHeight: '18rem',
    objectFit: 'cover',
  },

  videoPlay: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    color: '#ffffff',
    background: 'rgba(0,0,0,0.18)',
  },

  durationBadge: {
    position: 'absolute',
    right: '0.45rem',
    bottom: '0.45rem',
    padding: '0.26rem 0.4rem',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(0,0,0,0.65)',
    fontSize: '0.62rem',
    fontWeight: 800,
  },

  mediaPlaceholder: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.35rem',
    minHeight: '6rem',
    placeItems: 'center',
    color: '#b9c7df',
    fontSize: '0.7rem',
  },

  audioPlayer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '15rem',
  },

  audioPlayerFullscreen: {
    width: 'min(100%, 36rem)',
    padding: '1rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,0.06)',
  },

  hiddenAudio: {
    display: 'none',
  },

  audioPlayButton: {
    width: '2.35rem',
    height: '2.35rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    cursor: 'pointer',
  },

  audioBody: {
    minWidth: 0,
    flex: 1,
  },

  audioWaveform: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.13rem',
    height: '2rem',
    overflow: 'hidden',
    cursor: 'pointer',
  },

  audioBar: {
    width: '0.13rem',
    minHeight: '0.35rem',
    flexShrink: 0,
    borderRadius: '999px',
    transition: 'background 180ms ease',
  },

  audioMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.35rem',
    color: '#b9c7dd',
    fontSize: '0.62rem',
  },

  speedButton: {
    padding: '0.2rem 0.32rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.08)',
    fontSize: '0.62rem',
    cursor: 'pointer',
  },

  smallIconButton: {
    width: '1.85rem',
    height: '1.85rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#dce6f8',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  linkPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    width: '100%',
    padding: '0.3rem',
    border: 0,
    color: '#eaf4ff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  linkIcon: {
    width: '2.4rem',
    height: '2.4rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.72rem',
    color: '#a9edff',
    background: 'rgba(77,215,255,0.12)',
  },

  linkBody: {
    display: 'grid',
    gap: '0.15rem',
    minWidth: 0,
    fontSize: '0.73rem',
  },

  locationPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    width: '100%',
    padding: '0.3rem',
    border: 0,
    color: '#eaf4ff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  mapPlaceholder: {
    width: '3rem',
    height: '3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.75rem',
    color: '#ffb0c4',
    background:
      'linear-gradient(135deg, rgba(255,79,122,0.24), rgba(124,92,255,0.16))',
  },

  locationBody: {
    display: 'grid',
    gap: '0.16rem',
    minWidth: 0,
    fontSize: '0.73rem',
  },

  filePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    width: '100%',
    padding: '0.3rem',
    border: 0,
    color: '#eaf4ff',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },

  fileIcon: {
    width: '2.5rem',
    height: '2.5rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '0.72rem',
    color: '#d1c8ff',
    background: 'rgba(124,92,255,0.17)',
  },

  fileBody: {
    display: 'grid',
    gap: '0.15rem',
    minWidth: 0,
    flex: 1,
    fontSize: '0.73rem',
  },

  previewFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.28rem',
    marginTop: '0.45rem',
  },

  metadataLine: {
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
    color: '#a9b7ce',
    fontSize: '0.62rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  previewActionButton: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px',
    color: '#dce6f8',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  downloadStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    marginTop: '0.45rem',
    color: '#a9edff',
    fontSize: '0.62rem',
  },

  downloadProgressTrack: {
    flex: 1,
    height: '0.25rem',
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.1)',
  },

  downloadProgressBar: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background: 'linear-gradient(90deg, #7c5cff, #4dd7ff)',
    transition: 'width 120ms ease',
  },

  downloadMenu: {
    position: 'absolute',
    right: '0.55rem',
    bottom: '2.9rem',
    zIndex: 5,
    display: 'grid',
    gap: '0.3rem',
    width: 'min(14rem, calc(100vw - 2rem))',
    padding: '0.45rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '0.85rem',
    background: 'rgba(15,20,32,0.98)',
    boxShadow: '0 22px 55px rgba(0,0,0,0.42)',
  },

  downloadMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.55rem',
    border: 0,
    borderRadius: '0.55rem',
    color: '#e2eaf8',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.68rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  hiddenPreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    minHeight: '5rem',
    color: '#aebbd0',
    fontSize: '0.72rem',
    textAlign: 'center',
  },

  fullscreenOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'grid',
    placeItems: 'center',
    padding: '1rem',
    background: 'rgba(0,0,0,0.9)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
  },

  fullscreenPanel: {
    position: 'relative',
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    width: 'min(100%, 1000px)',
    height: 'min(94dvh, 900px)',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1.25rem',
    background: '#090d16',
    boxShadow: '0 30px 100px rgba(0,0,0,0.65)',
  },

  viewerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    padding: '0.7rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    color: '#ffffff',
  },

  viewerTitle: {
    display: 'grid',
    gap: '0.18rem',
    minWidth: 0,
    fontSize: '0.76rem',
  },

  viewerHeaderActions: {
    display: 'flex',
    gap: '0.35rem',
  },

  viewerButton: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },

  viewerContent: {
    display: 'grid',
    placeItems: 'center',
    minHeight: 0,
    overflow: 'auto',
    padding: '1rem',
  },

  imageViewer: {
    display: 'grid',
    placeItems: 'center',
    width: '100%',
    height: '100%',
    overflow: 'auto',
  },

  fullscreenImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    transition: 'transform 180ms ease',
    userSelect: 'none',
  },

  fullscreenVideo: {
    width: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },

  documentViewer: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.55rem',
    color: '#c5d1e4',
    textAlign: 'center',
  },

  viewerPlaceholder: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.6rem',
    color: '#9aa8c1',
  },

  imageControls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.55rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },

  viewerFooter: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.65rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },

  viewerFooterButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.5rem 0.65rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#dce6f8',
    background: 'rgba(255,255,255,0.06)',
    fontSize: '0.67rem',
    cursor: 'pointer',
  },

  viewerMenu: {
    position: 'absolute',
    top: '4rem',
    right: '0.7rem',
    zIndex: 3,
    display: 'grid',
    gap: '0.3rem',
    width: 'min(17rem, calc(100% - 1.4rem))',
    padding: '0.45rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '0.85rem',
    background: 'rgba(15,20,32,0.98)',
    boxShadow: '0 22px 55px rgba(0,0,0,0.45)',
  },

  viewerMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.58rem',
    border: 0,
    borderRadius: '0.55rem',
    color: '#e4ecfa',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.7rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  viewerMenuItemDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.58rem',
    border: 0,
    borderRadius: '0.55rem',
    color: '#ffb0c4',
    background: 'rgba(255,79,122,0.08)',
    fontSize: '0.7rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  detailsGrid: {
    display: 'grid',
    gap: '0.35rem',
  },

  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.8rem',
    color: '#8e9cb7',
    fontSize: '0.68rem',
  },
};

export default memo(ChatMediaPreview);