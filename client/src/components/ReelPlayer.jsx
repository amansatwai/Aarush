import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Bookmark,
  Check,
  ChevronDown,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react';

function getDisplayName(profile) {
  return (
    profile?.full_name ||
    profile?.username ||
    'Aarush creator'
  );
}

function getInitial(profile) {
  return getDisplayName(profile)
    .charAt(0)
    .toUpperCase();
}

function formatCount(value) {
  const count = Number(value || 0);

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  return String(count);
}

function getLikeCount(reel) {
  return (
    reel?.likes_count ||
    reel?.like_count ||
    reel?.likes ||
    0
  );
}

function getCommentCount(reel) {
  return (
    reel?.comments_count ||
    reel?.comment_count ||
    reel?.comments ||
    0
  );
}

function getSaveCount(reel) {
  return (
    reel?.saves_count ||
    reel?.save_count ||
    reel?.saves ||
    0
  );
}

function getVideoUrl(reel) {
  return (
    reel?.video_url ||
    reel?.media_url ||
    reel?.media?.url ||
    reel?.media?.[0]?.url ||
    null
  );
}

function getPosterUrl(reel) {
  return (
    reel?.thumbnail_url ||
    reel?.cover_url ||
    reel?.poster_url ||
    reel?.preview_url ||
    reel?.image_url ||
    null
  );
}

function getHashtags(reel) {
  if (Array.isArray(reel?.hashtags)) {
    return reel.hashtags;
  }

  if (typeof reel?.hashtags === 'string') {
    return reel.hashtags
      .split(/[,\s]+/)
      .map((tag) => tag.replace(/^#/, ''))
      .filter(Boolean);
  }

  const caption =
    reel?.caption ||
    reel?.description ||
    '';

  return [...caption.matchAll(/#([a-zA-Z0-9_]+)/g)].map(
    (match) => match[1]
  );
}

function Avatar({ profile }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={getDisplayName(profile)}
        className="reel-player-avatar"
      />
    );
  }

  return (
    <div className="reel-player-avatar reel-player-avatar-fallback">
      {getInitial(profile)}
    </div>
  );
}

export default function ReelPlayer({
  reel,
  active = false,
  guest = false,
  following = false,
  liked = false,
  saved = false,
  onLike,
  onComment,
  onSave,
  onShare,
  onFollow,
  onMore,
  onCreatorPress,
  onHashtagPress,
  onPlaybackProgress,
  onEnded,
  onError,
  onRequireSignIn,
}) {
  const videoRef = useRef(null);
  const longPressTimer = useRef(null);
  const singleTapTimer = useRef(null);
  const lastTapTime = useRef(0);
  const progressTimer = useRef(null);

  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return (
      window.localStorage.getItem(
        'aarush_reels_muted'
      ) !== 'false'
    );
  });

  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showLikeBurst, setShowLikeBurst] =
    useState(false);
  const [showMore, setShowMore] = useState(false);

  const videoUrl = getVideoUrl(reel);
  const posterUrl = getPosterUrl(reel);
  const hashtags = getHashtags(reel);
  const profile = reel?.creator || reel?.profile;

  const playVideo = useCallback(async () => {
    const video = videoRef.current;

    if (!video || !videoUrl || !active) {
      return;
    }

    try {
      video.muted = muted;
      await video.play();
      setPaused(false);
      setFailed(false);
    } catch {
      setPaused(true);
    }
  }, [active, muted, videoUrl]);

  const pauseVideo = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.pause();
    setPaused(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    video.muted = muted;

    if (active) {
      playVideo();
    } else {
      video.pause();
      setPaused(true);
    }

    return undefined;
  }, [active, muted, playVideo]);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    progressTimer.current = window.setInterval(() => {
      const video = videoRef.current;

      if (!video || !video.duration) {
        return;
      }

      onPlaybackProgress?.({
        reel,
        currentTime: video.currentTime,
        duration: video.duration,
        progress:
          video.currentTime / video.duration,
      });
    }, 1000);

    return () => {
      window.clearInterval(progressTimer.current);
    };
  }, [active, onPlaybackProgress, reel]);

  useEffect(() => {
    return () => {
      window.clearTimeout(longPressTimer.current);
      window.clearTimeout(singleTapTimer.current);
      window.clearInterval(progressTimer.current);
    };
  }, []);

  const toggleMute = (event) => {
    event.stopPropagation();

    const nextMuted = !muted;
    setMuted(nextMuted);

    window.localStorage.setItem(
      'aarush_reels_muted',
      String(nextMuted)
    );

    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }

    if (active && nextMuted === false) {
      playVideo();
    }
  };

  const togglePause = useCallback(() => {
    if (paused) {
      playVideo();
    } else {
      pauseVideo();
    }
  }, [paused, pauseVideo, playVideo]);

  const handleLike = () => {
    if (guest) {
      onRequireSignIn?.();
      return;
    }

    onLike?.(reel);
  };

  const handleComment = () => {
    if (guest) {
      onRequireSignIn?.();
      return;
    }

    onComment?.(reel);
  };

  const handleSave = () => {
    if (guest) {
      onRequireSignIn?.();
      return;
    }

    onSave?.(reel);
  };

  const handleShare = async () => {
    if (guest) {
      onRequireSignIn?.();
      return;
    }

    onShare?.(reel);
  };

  const handleFollow = () => {
    if (guest) {
      onRequireSignIn?.();
      return;
    }

    onFollow?.(reel);
  };

  const handlePointerDown = () => {
    window.clearTimeout(longPressTimer.current);

    longPressTimer.current = window.setTimeout(() => {
      pauseVideo();
    }, 430);
  };

  const handlePointerUp = () => {
    window.clearTimeout(longPressTimer.current);
  };

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
    }

    setShowLikeBurst(true);

    window.setTimeout(() => {
      setShowLikeBurst(false);
    }, 750);
  };

  const handleVideoTap = (event) => {
    event.stopPropagation();

    const now = Date.now();
    const elapsed = now - lastTapTime.current;

    if (elapsed < 280) {
      window.clearTimeout(singleTapTimer.current);
      handleDoubleTap();
      lastTapTime.current = 0;
      return;
    }

    lastTapTime.current = now;

    singleTapTimer.current = window.setTimeout(() => {
      togglePause();
    }, 280);
  };

  const handleLoadedData = () => {
    setLoading(false);
    setBuffering(false);
    setFailed(false);

    if (active) {
      playVideo();
    }
  };

  const handleWaiting = () => {
    setBuffering(true);
  };

  const handlePlaying = () => {
    setLoading(false);
    setBuffering(false);
    setPaused(false);
  };

  const handleVideoError = () => {
    setLoading(false);
    setBuffering(false);
    setFailed(true);
    onError?.(reel);
  };

  const retry = (event) => {
    event.stopPropagation();

    const video = videoRef.current;

    if (!video) {
      return;
    }

    setFailed(false);
    setLoading(true);
    video.load();

    if (active) {
      playVideo();
    }
  };

  return (
    <article className="reel-player">
      {videoUrl ? (
        <video
          ref={videoRef}
          className="reel-player-video"
          src={videoUrl}
          poster={posterUrl || undefined}
          muted={muted}
          loop
          playsInline
          preload={active ? 'auto' : 'metadata'}
          onLoadedData={handleLoadedData}
          onCanPlay={handleLoadedData}
          onWaiting={handleWaiting}
          onStalled={handleWaiting}
          onPlaying={handlePlaying}
          onError={handleVideoError}
          onEnded={() => onEnded?.(reel)}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleVideoTap}
        />
      ) : (
        <div className="reel-player-no-video">
          <Play size={32} />
          <span>Video unavailable</span>
        </div>
      )}

      <div className="reel-player-vignette" />

      {loading && !failed ? (
        <div className="reel-player-loader">
          <span />
          <small>Loading reel</small>
        </div>
      ) : null}

      {buffering && !loading && !failed ? (
        <div className="reel-player-buffering">
          <span />
        </div>
      ) : null}

      {failed ? (
        <div className="reel-player-error">
          <span>Couldn’t load this reel.</span>
          <button
            type="button"
            onClick={retry}
          >
            Retry
          </button>
        </div>
      ) : null}

      {paused && !loading && !failed ? (
        <button
          type="button"
          className="reel-player-paused"
          onClick={togglePause}
          aria-label="Resume reel"
        >
          <Play size={30} fill="currentColor" />
        </button>
      ) : null}

      {showLikeBurst ? (
        <div className="reel-player-like-burst">
          <Heart size={75} fill="currentColor" />
        </div>
      ) : null}

      <div className="reel-player-top-actions">
        <button
          type="button"
          className="reel-player-round-button"
          onClick={toggleMute}
          aria-label={
            muted ? 'Unmute reel' : 'Mute reel'
          }
        >
          {muted ? (
            <VolumeX size={19} />
          ) : (
            <Volume2 size={19} />
          )}
        </button>

        <button
          type="button"
          className="reel-player-round-button"
          onClick={(event) => {
            event.stopPropagation();
            setShowMore((value) => !value);
          }}
          aria-label="More options"
        >
          <MoreHorizontal size={19} />
        </button>

        {showMore ? (
          <div className="reel-player-more-menu">
            <button
              type="button"
              onClick={() => {
                setShowMore(false);
                onMore?.(reel);
              }}
            >
              Not interested
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMore(false);
                onMore?.(reel, 'report');
              }}
            >
              Report reel
            </button>
          </div>
        ) : null}
      </div>

      <aside className="reel-player-side-actions">
        <button
          type="button"
          className={
            liked
              ? 'reel-player-action is-active'
              : 'reel-player-action'
          }
          onClick={handleLike}
          aria-label="Like reel"
        >
          <Heart
            size={27}
            fill={liked ? 'currentColor' : 'none'}
          />
          <span>{formatCount(getLikeCount(reel))}</span>
        </button>

        <button
          type="button"
          className="reel-player-action"
          onClick={handleComment}
          aria-label="Comment on reel"
        >
          <MessageCircle size={26} />
          <span>
            {formatCount(getCommentCount(reel))}
          </span>
        </button>

        <button
          type="button"
          className={
            saved
              ? 'reel-player-action is-active'
              : 'reel-player-action'
          }
          onClick={handleSave}
          aria-label="Save reel"
        >
          <Bookmark
            size={25}
            fill={saved ? 'currentColor' : 'none'}
          />
          <span>{formatCount(getSaveCount(reel))}</span>
        </button>

        <button
          type="button"
          className="reel-player-action"
          onClick={handleShare}
          aria-label="Share reel"
        >
          <Share2 size={24} />
          <span>Share</span>
        </button>
      </aside>

      <div className="reel-player-bottom-content">
        <div className="reel-player-creator-row">
          <button
            type="button"
            className="reel-player-creator"
            onClick={() => onCreatorPress?.(profile)}
          >
            <Avatar profile={profile} />
            <span>
              {profile?.username
                ? `@${profile.username}`
                : getDisplayName(profile)}
            </span>
          </button>

          <button
            type="button"
            className={
              following
                ? 'reel-player-follow is-following'
                : 'reel-player-follow'
            }
            onClick={handleFollow}
            disabled={following}
          >
            {following ? (
              <>
                <Check size={14} />
                Following
              </>
            ) : (
              'Follow'
            )}
          </button>
        </div>

        {reel?.caption ||
        reel?.description ||
        reel?.title ? (
          <p className="reel-player-caption">
            {reel.caption ||
              reel.description ||
              reel.title}
          </p>
        ) : null}

        {hashtags.length ? (
          <div className="reel-player-hashtags">
            {hashtags.slice(0, 8).map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() =>
                  onHashtagPress?.(tag)
                }
              >
                #{tag}
              </button>
            ))}
          </div>
        ) : null}

        {reel?.location ? (
          <span className="reel-player-location">
            {reel.location}
          </span>
        ) : null}

        <div className="reel-player-music">
          <span className="reel-player-music-disc">
            ♪
          </span>
          <span>
            {reel?.music_title ||
              reel?.audio_name ||
              'Original audio'}
          </span>
          <ChevronDown size={14} />
        </div>
      </div>

      <style>{`
        .reel-player {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          color: #fff;
          background: #05070d;
          isolation: isolate;
        }

        .reel-player-video,
        .reel-player-no-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #05070d;
        }

        .reel-player-no-video {
          display: grid;
          place-items: center;
          align-content: center;
          gap: 0.6rem;
          color: #9da9c3;
          font-size: 0.8rem;
        }

        .reel-player-vignette {
          position: absolute;
          z-index: 1;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0.43),
              transparent 23%,
              transparent 53%,
              rgba(0,0,0,0.82)
            ),
            linear-gradient(
              90deg,
              transparent 65%,
              rgba(0,0,0,0.25)
            );
        }

        .reel-player-top-actions,
        .reel-player-side-actions,
        .reel-player-bottom-content,
        .reel-player-loader,
        .reel-player-buffering,
        .reel-player-error,
        .reel-player-paused,
        .reel-player-like-burst {
          position: absolute;
          z-index: 3;
        }

        .reel-player-top-actions {
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.55rem;
        }

        .reel-player-round-button {
          width: 2.45rem;
          height: 2.45rem;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50%;
          color: #fff;
          background: rgba(8,11,19,0.5);
          backdrop-filter: blur(12px);
          cursor: pointer;
        }

        .reel-player-more-menu {
          position: absolute;
          top: 3rem;
          right: 0;
          width: 9rem;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 0.9rem;
          background: rgba(12,16,28,0.96);
          box-shadow: 0 15px 45px rgba(0,0,0,0.4);
        }

        .reel-player-more-menu button {
          width: 100%;
          padding: 0.7rem 0.75rem;
          border: 0;
          color: #e8edff;
          background: transparent;
          text-align: left;
          font-size: 0.72rem;
          cursor: pointer;
        }

        .reel-player-more-menu button + button {
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .reel-player-side-actions {
          right: 0.7rem;
          bottom: 9rem;
          display: grid;
          gap: 1rem;
          justify-items: center;
        }

        .reel-player-action {
          display: grid;
          justify-items: center;
          gap: 0.2rem;
          min-width: 3rem;
          padding: 0;
          border: 0;
          color: #fff;
          background: transparent;
          font-size: 0.64rem;
          font-weight: 800;
          text-shadow: 0 1px 8px rgba(0,0,0,0.7);
          cursor: pointer;
        }

        .reel-player-action.is-active {
          color: #ff77b7;
        }

        .reel-player-action:nth-child(3).is-active {
          color: #a996ff;
        }

        .reel-player-bottom-content {
          right: 4.4rem;
          bottom: 1rem;
          left: 1rem;
          max-width: min(76%, 32rem);
        }

        .reel-player-creator-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .reel-player-creator {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          min-width: 0;
          padding: 0;
          border: 0;
          color: #fff;
          background: transparent;
          font-size: 0.8rem;
          font-weight: 850;
          cursor: pointer;
        }

        .reel-player-avatar {
          width: 2.15rem;
          height: 2.15rem;
          flex: 0 0 auto;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 50%;
          object-fit: cover;
          background: #202a43;
        }

        .reel-player-avatar-fallback {
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #4dd7ff
          );
          font-weight: 900;
        }

        .reel-player-follow {
          min-height: 1.9rem;
          padding: 0.45rem 0.7rem;
          border: 1px solid rgba(77,215,255,0.3);
          border-radius: 999px;
          color: #dffcff;
          background: rgba(77,215,255,0.13);
          font-size: 0.68rem;
          font-weight: 850;
          cursor: pointer;
        }

        .reel-player-follow.is-following {
          border-color: rgba(255,255,255,0.2);
          color: #fff;
          background: rgba(255,255,255,0.12);
        }

        .reel-player-follow:disabled {
          cursor: default;
        }

        .reel-player-caption {
          margin: 0.65rem 0 0;
          color: #fff;
          font-size: 0.8rem;
          line-height: 1.4;
          text-shadow: 0 1px 8px rgba(0,0,0,0.7);
        }

        .reel-player-hashtags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.4rem;
        }

        .reel-player-hashtags button {
          padding: 0;
          border: 0;
          color: #c9c0ff;
          background: transparent;
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
        }

        .reel-player-location {
          display: block;
          margin-top: 0.35rem;
          color: #d0d8ea;
          font-size: 0.68rem;
        }

        .reel-player-music {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          max-width: 100%;
          margin-top: 0.55rem;
          color: #dfe6f7;
          font-size: 0.68rem;
        }

        .reel-player-music > span:nth-child(2) {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .reel-player-music-disc {
          width: 1.25rem;
          height: 1.25rem;
          display: grid;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 50%;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #4dd7ff
          );
          font-size: 0.8rem;
        }

        .reel-player-loader,
        .reel-player-buffering {
          top: 50%;
          left: 50%;
          display: grid;
          place-items: center;
          gap: 0.45rem;
          transform: translate(-50%, -50%);
        }

        .reel-player-loader span,
        .reel-player-buffering span {
          width: 2.4rem;
          height: 2.4rem;
          display: block;
          border: 3px solid rgba(255,255,255,0.22);
          border-top-color: #fff;
          border-radius: 50%;
          animation: reel-player-spin 0.8s linear infinite;
        }

        .reel-player-loader small {
          color: #dfe6f7;
          font-size: 0.68rem;
        }

        .reel-player-error {
          top: 50%;
          left: 50%;
          display: grid;
          gap: 0.7rem;
          transform: translate(-50%, -50%);
          padding: 1rem;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 1rem;
          color: #fff;
          background: rgba(8,11,19,0.86);
          text-align: center;
          font-size: 0.76rem;
        }

        .reel-player-error button {
          min-height: 2.1rem;
          border: 0;
          border-radius: 999px;
          color: #fff;
          background: linear-gradient(
            135deg,
            #7c5cff,
            #4dd7ff
          );
          font-size: 0.72rem;
          font-weight: 850;
          cursor: pointer;
        }

        .reel-player-paused {
          top: 50%;
          left: 50%;
          width: 4.2rem;
          height: 4.2rem;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 50%;
          color: #fff;
          background: rgba(8,11,19,0.52);
          transform: translate(-50%, -50%);
          cursor: pointer;
        }

        .reel-player-like-burst {
          top: 50%;
          left: 50%;
          color: #ff6fae;
          transform: translate(-50%, -50%);
          animation: reel-player-like 0.75s ease both;
          pointer-events: none;
        }

        @keyframes reel-player-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes reel-player-like {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.35);
          }
          35% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.15);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @media (max-width: 560px) {
          .reel-player-side-actions {
            right: 0.45rem;
            bottom: 8.1rem;
            gap: 0.85rem;
          }

          .reel-player-bottom-content {
            right: 3.7rem;
            bottom: 0.8rem;
            left: 0.75rem;
          }
        }
      `}</style>
    </article>
  );
}