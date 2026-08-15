import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Flame,
  Heart,
  Laugh,
  MoreHorizontal,
  Pause,
  Play,
  Send,
  Share2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

const IMAGE_DURATION = 5000;
const SWIPE_THRESHOLD = 72;
const REACTIONS = ['❤️', '🔥', '😂', '😮', '😢', '👏'];

function normalizeStories(value) {
  if (!Array.isArray(value)) return [];

  if (
    value.length === 1 &&
    Array.isArray(value[0]?.stories)
  ) {
    return value[0].stories;
  }

  return value;
}

function isExpired(story) {
  if (!story?.expires_at && !story?.expiresAt) {
    return false;
  }

  const expiry = new Date(
    story.expires_at || story.expiresAt
  ).getTime();

  return Number.isFinite(expiry) && expiry <= Date.now();
}

function storyMediaType(story) {
  const type = String(
    story?.media_type || story?.mediaType || ''
  ).toLowerCase();

  if (type === 'video' || type.startsWith('video')) {
    return 'video';
  }

  return 'image';
}

function storyMediaUrl(story) {
  return (
    story?.media_url ||
    story?.mediaUrl ||
    story?.url ||
    ''
  );
}

function timeAgo(value) {
  if (!value) return 'Just now';

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return 'Recently';
  }

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000)
  );

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h`;

  return `${Math.floor(hours / 24)}d`;
}

export default function StoryViewer({
  stories = [],
  initialIndex = 0,
  user = null,
  onClose,
  onStoryViewed,
  onReply,
  onReact,
  onShare,
  onNextUser,
  onPreviousUser,
}) {
  const normalizedStories = useMemo(
    () =>
      normalizeStories(stories).filter(
        (story) =>
          story &&
          storyMediaUrl(story) &&
          !isExpired(story)
      ),
    [stories]
  );

  const mediaRef = useRef(null);
  const timerRef = useRef(null);
  const progressFrameRef = useRef(null);
  const mountedRef = useRef(true);
  const touchStartRef = useRef(null);
  const touchMovedRef = useRef(false);
  const progressStartRef = useRef(0);
  const pausedRemainingRef = useRef(null);

  const [index, setIndex] = useState(() =>
    Math.min(
      Math.max(0, Number(initialIndex) || 0),
      Math.max(0, normalizedStories.length - 1)
    )
  );
  const [paused, setPaused] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [reaction, setReaction] = useState('');
  const [viewerPanelOpen, setViewerPanelOpen] =
    useState(false);
  const [closeOffset, setCloseOffset] = useState(0);

  const story = normalizedStories[index];
  const mediaType = storyMediaType(story);
  const mediaUrl = storyMediaUrl(story);

  const ownerId = story?.user_id || story?.userId;
  const viewerId = user?.id || user?.user_id;
  const isOwner = Boolean(
    ownerId && viewerId && ownerId === viewerId
  );

  const profile =
    story?.profile ||
    story?.user ||
    user ||
    {};

  const username =
    profile.username ||
    profile.user_name ||
    story?.username ||
    'Aarush User';

  const avatar =
    profile.avatar_url ||
    profile.avatarUrl ||
    story?.avatar_url ||
    '';

  const clearProgressTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (progressFrameRef.current !== null) {
      window.cancelAnimationFrame(
        progressFrameRef.current
      );
      progressFrameRef.current = null;
    }
  }, []);

  const closeViewer = useCallback(() => {
    clearProgressTimer();
    onClose?.();
  }, [clearProgressTimer, onClose]);

  const goNext = useCallback(() => {
    clearProgressTimer();

    if (index < normalizedStories.length - 1) {
      setIndex((value) => value + 1);
      setProgress(0);
      setPaused(false);
      setFailed(false);
      setBuffering(true);
      return;
    }

    if (typeof onNextUser === 'function') {
      onNextUser();
      return;
    }

    closeViewer();
  }, [
    clearProgressTimer,
    closeViewer,
    index,
    normalizedStories.length,
    onNextUser,
  ]);

  const goPrevious = useCallback(() => {
    clearProgressTimer();

    if (index > 0) {
      setIndex((value) => value - 1);
      setProgress(0);
      setPaused(false);
      setFailed(false);
      setBuffering(true);
      return;
    }

    if (typeof onPreviousUser === 'function') {
      onPreviousUser();
      return;
    }

    setProgress(0);
  }, [
    clearProgressTimer,
    index,
    onPreviousUser,
  ]);

  const markViewed = useCallback(() => {
    if (!story?.id) return;

    try {
      onStoryViewed?.(story);
    } catch {
      // Consumer callbacks must not break the viewer.
    }
  }, [onStoryViewed, story]);

  const scheduleImageProgress = useCallback(
    (duration = IMAGE_DURATION) => {
      clearProgressTimer();

      if (paused || failed || buffering) return;

      const startedAt =
        progressStartRef.current || Date.now();

      progressStartRef.current = startedAt;

      const update = () => {
        if (
          !mountedRef.current ||
          paused ||
          failed ||
          buffering
        ) {
          return;
        }

        const elapsed = Date.now() - startedAt;
        const next = Math.min(1, elapsed / duration);

        setProgress(next);

        if (next >= 1) {
          goNext();
          return;
        }

        progressFrameRef.current =
          window.requestAnimationFrame(update);
      };

      progressFrameRef.current =
        window.requestAnimationFrame(update);
    },
    [
      buffering,
      clearProgressTimer,
      failed,
      goNext,
      paused,
    ]
  );

  const scheduleVideoProgress = useCallback(() => {
    const video = mediaRef.current;

    if (!video || !Number.isFinite(video.duration)) {
      return;
    }

    clearProgressTimer();

    const update = () => {
      if (
        !mountedRef.current ||
        paused ||
        failed ||
        video.paused
      ) {
        return;
      }

      const next =
        video.duration > 0
          ? video.currentTime / video.duration
          : 0;

      setProgress(Math.min(1, next));

      progressFrameRef.current =
        window.requestAnimationFrame(update);
    };

    progressFrameRef.current =
      window.requestAnimationFrame(update);
  }, [
    clearProgressTimer,
    failed,
    paused,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    markViewed();

    return () => {
      mountedRef.current = false;
      clearProgressTimer();
    };
  }, [clearProgressTimer, markViewed]);

  useEffect(() => {
    clearProgressTimer();
    setProgress(0);
    setPaused(false);
    setFailed(false);
    setBuffering(true);
    progressStartRef.current = 0;
    pausedRemainingRef.current = null;

    const current = normalizedStories[index];
    const url = storyMediaUrl(current);

    if (!url) return undefined;

    const next = normalizedStories[index + 1];
    const previous = normalizedStories[index - 1];

    [next, previous].forEach((item) => {
      const adjacentUrl = storyMediaUrl(item);

      if (!adjacentUrl) return;

      if (storyMediaType(item) === 'image') {
        const image = new Image();
        image.src = adjacentUrl;
      } else {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = adjacentUrl;
      }
    });

    return clearProgressTimer;
  }, [
    clearProgressTimer,
    index,
    normalizedStories,
  ]);

  useEffect(() => {
    if (!story || buffering || failed || paused) {
      clearProgressTimer();
      return undefined;
    }

    if (mediaType === 'image') {
      scheduleImageProgress();
    } else {
      scheduleVideoProgress();
    }

    return clearProgressTimer;
  }, [
    buffering,
    clearProgressTimer,
    failed,
    mediaType,
    paused,
    scheduleImageProgress,
    scheduleVideoProgress,
    story,
  ]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeViewer();
      }

      if (event.key === 'ArrowRight') {
        goNext();
      }

      if (event.key === 'ArrowLeft') {
        goPrevious();
      }

      if (event.key === ' ') {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [closeViewer, goNext, goPrevious]);

  const handleMediaLoaded = useCallback(() => {
    setBuffering(false);
    setFailed(false);

    if (mediaType === 'video') {
      const video = mediaRef.current;

      if (video) {
        video.muted = muted;
        video.play().catch(() => {
          setPaused(true);
        });
      }
    }
  }, [mediaType, muted]);

  const handleVideoTimeUpdate = useCallback(() => {
    const video = mediaRef.current;

    if (!video || !Number.isFinite(video.duration)) {
      return;
    }

    setProgress(
      Math.min(1, video.currentTime / video.duration)
    );
  }, []);

  const togglePaused = useCallback(() => {
    const video = mediaRef.current;

    if (mediaType === 'video' && video) {
      if (video.paused) {
        video.play().catch(() => {});
        setPaused(false);
      } else {
        video.pause();
        setPaused(true);
      }
      return;
    }

    setPaused((value) => !value);
  }, [mediaType]);

  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0];

    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    touchMovedRef.current = false;
    setPaused(true);
  }, []);

  const handleTouchMove = useCallback((event) => {
    const start = touchStartRef.current;
    const touch = event.touches[0];

    if (!start || !touch) return;

    const distance = Math.abs(touch.clientY - start.y);

    if (distance > 10) {
      touchMovedRef.current = true;
      setCloseOffset(touch.clientY - start.y);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const start = touchStartRef.current;
    const offset = closeOffset;

    touchStartRef.current = null;
    setCloseOffset(0);

    if (Math.abs(offset) > SWIPE_THRESHOLD) {
      if (offset > 0) {
        closeViewer();
      } else {
        setReplyOpen(true);
      }
      return;
    }

    if (!touchMovedRef.current && start) {
      const midpoint = window.innerWidth / 2;

      if (start.x < midpoint) {
        goPrevious();
      } else {
        goNext();
      }
      return;
    }

    setPaused(false);
  }, [
    closeOffset,
    closeViewer,
    goNext,
    goPrevious,
  ]);

  const handleReply = useCallback(() => {
    const value = replyText.trim();

    if (!value || !story) return;

    onReply?.({
      story,
      text: value,
    });

    setReplyText('');
    setReplyOpen(false);
  }, [onReply, replyText, story]);

  const handleReaction = useCallback(
    (value) => {
      if (!story) return;

      setReaction(value);
      onReact?.({
        story,
        reaction: value,
      });

      window.setTimeout(() => {
        if (mountedRef.current) {
          setReaction('');
        }
      }, 900);
    },
    [onReact, story]
  );

  const handleShare = useCallback(() => {
    if (!story) return;

    onShare?.(story);
  }, [onShare, story]);

  const handleMute = useCallback(() => {
    const video = mediaRef.current;

    setMuted((value) => {
      const next = !value;

      if (video) {
        video.muted = next;
      }

      return next;
    });
  }, []);

  if (!normalizedStories.length) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        style={styles.emptyViewer}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close story viewer"
          style={styles.closeButton}
        >
          <X size={21} />
        </button>

        <div style={styles.emptyContent}>
          <Clock3 size={34} />
          <h1>No active stories</h1>
          <p>
            This story may have expired or is no longer
            available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Story viewer"
      style={{
        ...styles.viewer,
        transform: `translateY(${closeOffset}px)`,
        opacity: Math.max(
          0.35,
          1 - Math.abs(closeOffset) / 260
        ),
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {mediaType === 'video' ? (
        <video
          ref={mediaRef}
          src={mediaUrl}
          autoPlay
          loop={false}
          playsInline
          muted={muted}
          onLoadedMetadata={handleMediaLoaded}
          onCanPlay={handleMediaLoaded}
          onTimeUpdate={handleVideoTimeUpdate}
          onEnded={goNext}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => {
            setBuffering(false);
            setPaused(false);
          }}
          onError={() => {
            setBuffering(false);
            setFailed(true);
          }}
          style={styles.media}
        />
      ) : (
        <img
          src={mediaUrl}
          alt={`Story by ${username}`}
          onLoad={handleMediaLoaded}
          onError={() => {
            setBuffering(false);
            setFailed(true);
          }}
          style={styles.media}
        />
      )}

      <div style={styles.viewerShade} />

      <div style={styles.progressList}>
        {normalizedStories.map((item, itemIndex) => (
          <div
            key={item.id || itemIndex}
            style={styles.progressTrack}
            aria-label={`Story ${itemIndex + 1} of ${
              normalizedStories.length
            }`}
          >
            <span
              style={{
                ...styles.progressFill,
                width:
                  itemIndex < index
                    ? '100%'
                    : itemIndex > index
                      ? '0%'
                      : `${progress * 100}%`,
              }}
            />
          </div>
        ))}
      </div>

      <header style={styles.header}>
        <div style={styles.identity}>
          {avatar ? (
            <img
              src={avatar}
              alt=""
              style={styles.avatar}
            />
          ) : (
            <span style={styles.avatarPlaceholder}>
              {String(username).charAt(0).toUpperCase()}
            </span>
          )}

          <strong>@{String(username).replace(/^@/, '')}</strong>

          {profile.verified || story.verified ? (
            <Check size={14} color="#72e3ff" />
          ) : null}

          <span style={styles.time}>
            {timeAgo(
              story.created_at || story.createdAt
            )}
          </span>
        </div>

        <div style={styles.headerActions}>
          {story.privacy ? (
            <span style={styles.privacy}>
              {story.privacy}
            </span>
          ) : null}

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Open story menu"
            style={styles.controlButton}
          >
            <MoreHorizontal size={20} />
          </button>

          <button
            type="button"
            onClick={closeViewer}
            aria-label="Close story viewer"
            style={styles.controlButton}
          >
            <X size={20} />
          </button>
        </div>

        {menuOpen ? (
          <div style={styles.menu}>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              style={styles.menuItem}
            >
              Report
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              style={styles.menuItem}
            >
              Not interested
            </button>
          </div>
        ) : null}
      </header>

      <button
        type="button"
        onClick={goPrevious}
        aria-label="Previous story"
        style={styles.leftTapZone}
      />

      <button
        type="button"
        onClick={goNext}
        aria-label="Next story"
        style={styles.rightTapZone}
      />

      {buffering ? (
        <div style={styles.centerStatus}>
          <span style={styles.spinner} />
          <span>Loading story…</span>
        </div>
      ) : null}

      {failed ? (
        <div style={styles.centerStatus}>
          <strong>Story unavailable</strong>
          <span>This media could not be loaded.</span>

          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setBuffering(true);
              setProgress(0);
            }}
            style={styles.retryButton}
          >
            Try again
          </button>
        </div>
      ) : null}

      {paused && !buffering && !failed ? (
        <button
          type="button"
          onClick={togglePaused}
          aria-label="Resume story"
          style={styles.pauseIndicator}
        >
          <Play size={24} />
        </button>
      ) : null}

      {reaction ? (
        <div
          aria-live="polite"
          style={styles.reactionAnimation}
        >
          {reaction}
        </div>
      ) : null}

      {isOwner ? (
        <button
          type="button"
          onClick={() =>
            setViewerPanelOpen((value) => !value)
          }
          style={styles.ownerStats}
        >
          <Eye size={15} />
          {story.view_count || story.viewCount || 0}
        </button>
      ) : null}

      <footer style={styles.footer}>
        <div style={styles.reactionTray}>
          {REACTIONS.map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => handleReaction(value)}
              aria-label={`React ${value}`}
              style={styles.reactionButton}
            >
              {value}
            </button>
          ))}
        </div>

        <div style={styles.replyRow}>
          <button
            type="button"
            onClick={() => setReplyOpen(true)}
            aria-label="Reply to story"
            style={styles.replyInput}
          >
            Reply to story…
          </button>

          <button
            type="button"
            onClick={handleMute}
            aria-label={
              muted ? 'Unmute story' : 'Mute story'
            }
            style={styles.footerButton}
          >
            {muted ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share story"
            style={styles.footerButton}
          >
            <Share2 size={18} />
          </button>
        </div>
      </footer>

      {replyOpen ? (
        <div style={styles.replyPanel}>
          <div style={styles.replyPanelInner}>
            <input
              autoFocus
              value={replyText}
              onChange={(event) =>
                setReplyText(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleReply();
                }
              }}
              placeholder="Send a reply…"
              aria-label="Story reply"
              style={styles.replyField}
            />

            <button
              type="button"
              onClick={handleReply}
              disabled={!replyText.trim()}
              aria-label="Send reply"
              style={styles.sendButton}
            >
              <Send size={17} />
            </button>

            <button
              type="button"
              onClick={() => setReplyOpen(false)}
              aria-label="Close reply panel"
              style={styles.footerButton}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}

      {viewerPanelOpen && isOwner ? (
        <div style={styles.viewerPanel}>
          <div style={styles.viewerPanelHeader}>
            <strong>Story analytics</strong>

            <button
              type="button"
              onClick={() => setViewerPanelOpen(false)}
              aria-label="Close analytics"
              style={styles.footerButton}
            >
              <X size={17} />
            </button>
          </div>

          <div style={styles.analyticsGrid}>
            <span>
              Views
              <strong>
                {story.view_count ||
                  story.viewCount ||
                  0}
              </strong>
            </span>

            <span>
              Replies
              <strong>
                {story.reply_count ||
                  story.replyCount ||
                  0}
              </strong>
            </span>

            <span>
              Reactions
              <strong>
                {story.reaction_count ||
                  story.reactionCount ||
                  0}
              </strong>
            </span>

            <span>
              Shares
              <strong>
                {story.share_count ||
                  story.shareCount ||
                  0}
              </strong>
            </span>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes aarush-story-viewer-reaction {
          0% {
            opacity: 0;
            transform: translate(-50%, 20px) scale(.7);
          }
          25% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.15);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -90px) scale(1);
          }
        }

        @keyframes aarush-story-viewer-spin {
          to { transform: rotate(360deg); }
        }

        .aarush-story-viewer-button:hover {
          transform: translateY(-1px);
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  viewer: {
    position: 'fixed',
    inset: 0,
    zIndex: 2100,
    overflow: 'hidden',
    minHeight: '100dvh',
    color: '#f5f8ff',
    background: '#03050a',
    transition: 'transform 220ms ease, opacity 220ms ease',
    touchAction: 'none',
  },

  media: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
    background: '#03050a',
  },

  viewerShade: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
    background:
      'linear-gradient(180deg,rgba(0,0,0,.72),transparent 25%,transparent 67%,rgba(0,0,0,.82))',
  },

  progressList: {
    position: 'absolute',
    top: 'calc(.55rem + env(safe-area-inset-top))',
    right: '.75rem',
    left: '.75rem',
    zIndex: 5,
    display: 'flex',
    gap: '.25rem',
  },

  progressTrack: {
    position: 'relative',
    height: '.18rem',
    overflow: 'hidden',
    flex: 1,
    borderRadius: '999px',
    background: 'rgba(255,255,255,.3)',
  },

  progressFill: {
    position: 'absolute',
    inset: 0,
    display: 'block',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
    transition: 'width 80ms linear',
  },

  header: {
    position: 'absolute',
    top: '1.2rem',
    right: 0,
    left: 0,
    zIndex: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    padding: '1rem .8rem 0',
  },

  identity: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    textShadow: '0 2px 12px rgba(0,0,0,.5)',
  },

  avatar: {
    width: '2.25rem',
    height: '2.25rem',
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,.35)',
    borderRadius: '999px',
  },

  avatarPlaceholder: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.25)',
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontWeight: 850,
  },

  time: {
    color: 'rgba(255,255,255,.72)',
    fontSize: '.62rem',
  },

  headerActions: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
  },

  privacy: {
    padding: '.25rem .4rem',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.12)',
    fontSize: '.57rem',
    fontWeight: 750,
  },

  controlButton: {
    width: '2.4rem',
    height: '2.4rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.14)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(5,8,18,.38)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    cursor: 'pointer',
  },

  menu: {
    position: 'absolute',
    top: '2.8rem',
    right: 0,
    minWidth: '9rem',
    padding: '.35rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '.8rem',
    background: 'rgba(13,18,31,.96)',
    boxShadow: '0 18px 45px rgba(0,0,0,.4)',
    backdropFilter: 'blur(18px)',
  },

  menuItem: {
    width: '100%',
    minHeight: '2.35rem',
    border: 0,
    borderRadius: '.5rem',
    color: '#dce5f8',
    background: 'transparent',
    fontSize: '.68rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  leftTapZone: {
    position: 'absolute',
    top: '18%',
    bottom: '20%',
    left: 0,
    zIndex: 3,
    width: '35%',
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
  },

  rightTapZone: {
    position: 'absolute',
    top: '18%',
    right: 0,
    bottom: '20%',
    zIndex: 3,
    width: '35%',
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
  },

  centerStatus: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 8,
    display: 'grid',
    justifyItems: 'center',
    gap: '.5rem',
    padding: '1.2rem',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: '1rem',
    background: 'rgba(7,10,18,.72)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    textAlign: 'center',
    transform: 'translate(-50%,-50%)',
  },

  spinner: {
    width: '1.4rem',
    height: '1.4rem',
    border: '2px solid rgba(255,255,255,.24)',
    borderTopColor: '#4dd7ff',
    borderRadius: '999px',
    animation:
      'aarush-story-viewer-spin 800ms linear infinite',
  },

  retryButton: {
    minHeight: '2.35rem',
    padding: '0 .75rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  pauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 7,
    width: '3.6rem',
    height: '3.6rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.22)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(0,0,0,.4)',
    transform: 'translate(-50%,-50%)',
    cursor: 'pointer',
  },

  footer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 6,
    padding:
      '.7rem .8rem calc(.85rem + env(safe-area-inset-bottom))',
  },

  reactionTray: {
    display: 'flex',
    justifyContent: 'center',
    gap: '.25rem',
    marginBottom: '.5rem',
  },

  reactionButton: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: '999px',
    background: 'rgba(5,8,18,.42)',
    fontSize: '1rem',
    cursor: 'pointer',
  },

  replyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
  },

  replyInput: {
    minHeight: '2.7rem',
    minWidth: 0,
    flex: 1,
    padding: '0 .85rem',
    border: '1px solid rgba(255,255,255,.2)',
    borderRadius: '999px',
    color: 'rgba(255,255,255,.72)',
    background: 'rgba(5,8,18,.44)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    fontSize: '.7rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  footerButton: {
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.16)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(5,8,18,.42)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    cursor: 'pointer',
  },

  reactionAnimation: {
    position: 'absolute',
    bottom: '8rem',
    left: '50%',
    zIndex: 10,
    fontSize: '3rem',
    animation:
      'aarush-story-viewer-reaction 900ms ease both',
  },

  ownerStats: {
    position: 'absolute',
    right: '.8rem',
    bottom: '6.4rem',
    zIndex: 7,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.35rem',
    padding: '.45rem .6rem',
    border: '1px solid rgba(255,255,255,.14)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(5,8,18,.42)',
    fontSize: '.64rem',
    cursor: 'pointer',
  },

  replyPanel: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 12,
    padding:
      '.8rem .8rem calc(.9rem + env(safe-area-inset-bottom))',
    background: 'rgba(5,8,18,.74)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    animation: 'aarush-story-viewer-reaction 220ms ease reverse',
  },

  replyPanelInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
  },

  replyField: {
    minWidth: 0,
    minHeight: '2.7rem',
    flex: 1,
    padding: '0 .8rem',
    border: '1px solid rgba(255,255,255,.18)',
    borderRadius: '999px',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.08)',
    fontSize: '.72rem',
  },

  sendButton: {
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  viewerPanel: {
    position: 'absolute',
    right: '.8rem',
    bottom: '6.4rem',
    left: '.8rem',
    zIndex: 11,
    padding: '.9rem',
    border: '1px solid rgba(124,92,255,.28)',
    borderRadius: '1rem',
    background: 'rgba(10,14,25,.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  viewerPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
    marginTop: '.8rem',
  },

  analyticsGridItem: {
    display: 'grid',
    gap: '.25rem',
    color: '#96a3bf',
    fontSize: '.62rem',
    textAlign: 'center',
  },

  analyticsGridStrong: {
    color: '#fff',
    fontSize: '.9rem',
  },

  emptyViewer: {
    position: 'fixed',
    inset: 0,
    zIndex: 2100,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '1rem',
    color: '#f5f8ff',
    background: '#05070d',
    textAlign: 'center',
  },

  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    width: '2.7rem',
    height: '2.7rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.16)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(255,255,255,.08)',
    cursor: 'pointer',
  },

  emptyContent: {
    display: 'grid',
    justifyItems: 'center',
    gap: '.5rem',
    padding: '1.5rem',
  },
};