import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  Copy,
  Download,
  Edit3,
  FileVideo,
  Flag,
  Flame,
  Heart,
  Image as ImageIcon,
  Link2,
  LoaderCircle,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Share2,
  Shield,
  Sparkles,
  Sticker,
  Upload,
  UserRound,
  UserRoundCheck,
  Volume2,
  VolumeX,
  WandSparkles,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';

const initialReels = [
  {
    id: 'reel-1',
    username: 'arush.dev',
    verified: true,
    avatar: 'A',
    timeAgo: '12m',
    caption:
      'Building the Aarush Home system one production-ready component at a time. #React #Supabase #Aarush',
    hashtags: ['#React', '#Supabase', '#Aarush'],
    mentions: ['@teamaarush'],
    musicName: 'Original audio · arush.dev',
    isOriginalAudio: true,
    mediaUrl: null,
    likeCount: 12400,
    commentCount: 482,
    shareCount: 936,
    viewCount: 128400,
    saveCount: 1830,
    isFollowing: true,
    isSaved: false,
    isLiked: false,
    notificationsEnabled: true,
    gradient: 'linear-gradient(145deg, #15152d 0%, #40266b 42%, #0c6372 100%)',
  },
  {
    id: 'reel-2',
    username: 'motion.frame',
    verified: true,
    avatar: 'M',
    timeAgo: '28m',
    caption:
      'A cinematic product motion study with layered color, light, and smooth transitions. #Motion #Design',
    hashtags: ['#Motion', '#Design'],
    mentions: [],
    musicName: 'Night Drive · Aarush Sounds',
    isOriginalAudio: false,
    mediaUrl: null,
    likeCount: 8600,
    commentCount: 214,
    shareCount: 510,
    viewCount: 89400,
    saveCount: 1220,
    isFollowing: false,
    isSaved: true,
    isLiked: false,
    notificationsEnabled: false,
    gradient: 'linear-gradient(145deg, #30152d 0%, #872f5e 40%, #eb853f 100%)',
  },
  {
    id: 'reel-3',
    username: 'creator.lab',
    verified: false,
    avatar: 'C',
    timeAgo: '1h',
    caption:
      'Creator workflow ideas for short-form video, captions, templates, and fast publishing. #CreatorTools #Video',
    hashtags: ['#CreatorTools', '#Video'],
    mentions: ['@creator.lab'],
    musicName: 'Original audio · creator.lab',
    isOriginalAudio: true,
    mediaUrl: null,
    likeCount: 5320,
    commentCount: 126,
    shareCount: 244,
    viewCount: 47800,
    saveCount: 714,
    isFollowing: false,
    isSaved: false,
    isLiked: true,
    notificationsEnabled: false,
    gradient: 'linear-gradient(145deg, #101f38 0%, #164d69 46%, #7a3c82 100%)',
  },
];

const creationTools = [
  { label: 'Upload video', icon: Upload },
  { label: 'Camera', icon: Camera },
  { label: 'Trim video', icon: Edit3 },
  { label: 'Speed control', icon: RotateCcw },
  { label: 'Music selection', icon: Music2 },
  { label: 'Filters', icon: WandSparkles },
  { label: 'Effects', icon: Sparkles },
  { label: 'Text overlay', icon: Edit3 },
  { label: 'Stickers', icon: Sticker },
  { label: 'Voice effects', icon: Mic },
  { label: 'Green screen', icon: ImageIcon },
  { label: 'Templates', icon: FileVideo },
  { label: 'Remix', icon: RotateCcw },
  { label: 'Duet / Collaborate', icon: UserRoundCheck },
];

const reelMenuItems = [
  { key: 'save', label: 'Save Reel', icon: Bookmark },
  { key: 'removeSaved', label: 'Remove from Saved', icon: BookmarkCheck },
  { key: 'hide', label: 'Hide Reel', icon: VolumeX },
  { key: 'notInterested', label: 'Not Interested', icon: CircleAlert },
  { key: 'report', label: 'Report Reel', icon: Flag, danger: true },
  { key: 'block', label: 'Block User', icon: Shield, danger: true },
  { key: 'restrict', label: 'Restrict Account', icon: Shield },
  { key: 'mute', label: 'Mute User', icon: VolumeX },
  { key: 'copyLink', label: 'Copy Link', icon: Copy },
  { key: 'share', label: 'Share Externally', icon: Share2 },
  { key: 'profile', label: 'View Profile', icon: UserRound },
  { key: 'follow', label: 'Follow / Unfollow', icon: UserRoundCheck },
  { key: 'notifications', label: 'Turn Notifications On / Off', icon: BellIcon },
];

function BellIcon({ size = 18, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatCount(value) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function ReelAvatar({ reel }) {
  return (
    <div
      style={{
        width: '2.85rem',
        height: '2.85rem',
        borderRadius: '999px',
        padding: '2.5px',
        background: 'linear-gradient(135deg, #7c5cff, #ff4fd8 48%, #4dd7ff)',
        boxShadow: '0 0 16px rgba(124,92,255,0.24)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, #141a2a, #252d48)',
          color: '#fff',
          fontSize: '0.95rem',
          fontWeight: 900,
        }}
      >
        {reel.avatar}
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        border: 0,
        background: 'transparent',
        color: active ? '#ff83c7' : '#ffffff',
        display: 'grid',
        justifyItems: 'center',
        gap: '0.28rem',
        padding: '0.35rem',
        minWidth: '3.25rem',
        cursor: 'pointer',
        textShadow: active ? '0 0 18px rgba(255,79,216,0.65)' : '0 0 12px rgba(0,0,0,0.55)',
        transition: 'transform 180ms ease, color 180ms ease, filter 180ms ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span
        style={{
          width: '2.55rem',
          height: '2.55rem',
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          background: active
            ? 'linear-gradient(135deg, rgba(255,79,216,0.32), rgba(124,92,255,0.22))'
            : 'rgba(7,10,18,0.44)',
          border: '1px solid rgba(255,255,255,0.16)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: active ? '0 0 24px rgba(255,79,216,0.22)' : '0 8px 18px rgba(0,0,0,0.2)',
        }}
      >
        <Icon size={19} strokeWidth={2.2} fill={active ? 'currentColor' : 'none'} />
      </span>
      <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{count ?? label}</span>
    </button>
  );
}

function ReelMenu({ reel, onClose, onAction }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reel actions"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(2,5,10,0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '86vh',
          overflowY: 'auto',
          padding: '0.8rem 0.8rem calc(1rem + env(safe-area-inset-bottom))',
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          background: 'linear-gradient(180deg, rgba(17,22,35,0.99), rgba(9,13,22,0.99))',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -24px 70px rgba(0,0,0,0.5)',
          animation: 'aarush-reel-sheet-in 220ms ease-out',
        }}
      >
        <div
          style={{
            width: '3.2rem',
            height: '0.3rem',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.24)',
            margin: '0 auto 0.9rem',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0 0.25rem 0.75rem',
          }}
        >
          <div>
            <strong style={{ color: '#f5f8ff', fontSize: '0.98rem' }}>Reel actions</strong>
            <p style={{ margin: '0.25rem 0 0', color: '#96a3bf', fontSize: '0.78rem' }}>
              Manage this reel and its creator relationship.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reel actions"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={17} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {reelMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onAction(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  width: '100%',
                  minHeight: '3.25rem',
                  padding: '0.55rem 0.65rem',
                  borderRadius: '1rem',
                  border: `1px solid ${
                    item.danger ? 'rgba(255,79,122,0.18)' : 'rgba(255,255,255,0.08)'
                  }`,
                  background: item.danger
                    ? 'rgba(255,79,122,0.09)'
                    : 'rgba(255,255,255,0.05)',
                  color: item.danger ? '#ffb1c8' : '#f3f6ff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 750,
                }}
              >
                <span
                  style={{
                    width: '2.3rem',
                    height: '2.3rem',
                    borderRadius: '0.82rem',
                    display: 'grid',
                    placeItems: 'center',
                    color: item.danger ? '#ff9dbd' : '#dce8ff',
                    background: item.danger
                      ? 'rgba(255,79,122,0.14)'
                      : 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
                  }}
                >
                  <Icon size={17} />
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CreationPanel({ onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create a reel"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1250,
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        background: 'rgba(2,5,10,0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(100%, 540px)',
          maxHeight: '86vh',
          overflowY: 'auto',
          borderRadius: '1.4rem',
          padding: '1rem',
          background: 'linear-gradient(180deg, rgba(17,22,35,0.99), rgba(9,13,22,0.99))',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.9rem',
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: '#f5f8ff', fontSize: '1.05rem' }}>Create a Reel</h2>
            <p style={{ margin: '0.25rem 0 0', color: '#96a3bf', fontSize: '0.8rem' }}>
              Choose a production tool to start creating.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close creation panel"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={17} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '0.6rem',
          }}
        >
          {creationTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.label}
                type="button"
                onClick={onClose}
                style={{
                  minHeight: '4.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#f3f6ff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 750,
                }}
              >
                <span
                  style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    borderRadius: '0.8rem',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </span>
                {tool.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ReelsPage() {
  const navigate = useNavigate();
  const [reels, setReels] = useState(initialReels);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(36);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [showMenuFor, setShowMenuFor] = useState(null);
  const [showCreationPanel, setShowCreationPanel] = useState(false);
  const [touchStartY, setTouchStartY] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [watchSeconds, setWatchSeconds] = useState(0);
  const [commentCount, setCommentCount] = useState({});

  const activeReel = reels[activeIndex];

  const updateReel = useCallback((reelId, updates) => {
    setReels((current) =>
      current.map((reel) => (reel.id === reelId ? { ...reel, ...updates } : reel))
    );
  }, []);

  useEffect(() => {
    setProgress(36);
    setWatchSeconds(0);
    setIsPlaying(true);
  }, [activeIndex]);

  useEffect(() => {
    if (!isPlaying || isBuffering) return undefined;

    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 100 ? 0 : value + 1.2));
      setWatchSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isBuffering, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowDown') {
        setActiveIndex((current) => Math.min(current + 1, reels.length - 1));
      }

      if (event.key === 'ArrowUp') {
        setActiveIndex((current) => Math.max(current - 1, 0));
      }

      if (event.key === ' ') {
        event.preventDefault();
        setIsPlaying((current) => !current);
      }

      if (event.key === 'm') {
        setIsMuted((current) => !current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reels.length]);

  const loadMoreReels = useCallback(() => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);

    window.setTimeout(() => {
      const nextReels = initialReels.map((reel, index) => ({
        ...reel,
        id: `${reel.id}-page-${reels.length}-${index}`,
        timeAgo: `${reels.length + index + 1}h`,
        likeCount: reel.likeCount + reels.length * 100 + index * 15,
        commentCount: reel.commentCount + reels.length * 4 + index,
        viewCount: reel.viewCount + reels.length * 900 + index * 100,
        gradient:
          index % 2 === 0
            ? 'linear-gradient(145deg, #1b1538 0%, #5d2e79 48%, #116a74 100%)'
            : 'linear-gradient(145deg, #21152d 0%, #8b375d 45%, #d56f3f 100%)',
      }));

      setReels((current) => [...current, ...nextReels]);
      setIsLoadingMore(false);
    }, 700);
  }, [isLoadingMore, reels.length]);

  const handleWheel = useCallback(
    (event) => {
      if (event.deltaY > 35) {
        setActiveIndex((current) => {
          const next = Math.min(current + 1, reels.length - 1);
          if (next === reels.length - 1) loadMoreReels();
          return next;
        });
      }

      if (event.deltaY < -35) {
        setActiveIndex((current) => Math.max(current - 1, 0));
      }
    },
    [loadMoreReels, reels.length]
  );

  const handleTouchStart = (event) => {
    setTouchStartY(event.touches[0].clientY);
  };

  const handleTouchEnd = (event) => {
    if (touchStartY === null) return;

    const endY = event.changedTouches[0].clientY;
    const delta = touchStartY - endY;

    if (Math.abs(delta) > 55) {
      if (delta > 0) {
        setActiveIndex((current) => {
          const next = Math.min(current + 1, reels.length - 1);
          if (next === reels.length - 1) loadMoreReels();
          return next;
        });
      } else {
        setActiveIndex((current) => Math.max(current - 1, 0));
      }
    }

    setTouchStartY(null);
  };

  const toggleLike = (reel) => {
    const nextLiked = !reel.isLiked;
    updateReel(reel.id, {
      isLiked: nextLiked,
      likeCount: Math.max(0, reel.likeCount + (nextLiked ? 1 : -1)),
    });
  };

  const toggleSave = (reel) => {
    const nextSaved = !reel.isSaved;
    updateReel(reel.id, { isSaved: nextSaved });
  };

  const handleShare = async (reel) => {
    const url = `${window.location.origin}/reels/${reel.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reel by ${reel.username}`,
          text: reel.caption,
          url,
        });
      } catch (error) {
        if (error?.name !== 'AbortError') {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    }

    updateReel(reel.id, { shareCount: reel.shareCount + 1 });
  };

  const handleMenuAction = async (actionKey) => {
    const reel = reels.find((item) => item.id === showMenuFor);
    if (!reel) return;

    if (actionKey === 'save') toggleSave(reel);
    if (actionKey === 'removeSaved') toggleSave(reel);

    if (actionKey === 'follow') {
      updateReel(reel.id, { isFollowing: !reel.isFollowing });
    }

    if (actionKey === 'notifications') {
      updateReel(reel.id, { notificationsEnabled: !reel.notificationsEnabled });
    }

    if (actionKey === 'copyLink') {
      const url = `${window.location.origin}/reels/${reel.id}`;
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    }

    if (actionKey === 'share') {
      await handleShare(reel);
    }

    if (actionKey === 'profile') {
      navigate(`/profile/${reel.username}`);
    }

    setShowMenuFor(null);
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#070a10',
      color: '#ffffff',
      overflow: 'hidden',
    },
    stage: {
      position: 'relative',
      height: 'calc(100vh - 72px)',
      minHeight: '560px',
      overflow: 'hidden',
      touchAction: 'pan-y',
    },
    reelCanvas: {
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: activeReel.gradient,
      transition: 'background 400ms ease',
    },
    mediaLayer: {
      position: 'absolute',
      inset: 0,
      background: activeReel.mediaUrl
        ? `linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.7)), url(${activeReel.mediaUrl}) center/cover`
        : activeReel.gradient,
      transition: 'background 400ms ease',
    },
    topControls: {
      position: 'absolute',
      top: '0.85rem',
      left: '0.8rem',
      right: '0.8rem',
      zIndex: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
    },
    smallButton: {
      width: '2.6rem',
      height: '2.6rem',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.16)',
      background: 'rgba(5,8,15,0.38)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    },
    counter: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.62rem 0.8rem',
      borderRadius: '999px',
      background: 'rgba(5,8,15,0.38)',
      border: '1px solid rgba(255,255,255,0.14)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      fontSize: '0.78rem',
      fontWeight: 800,
    },
    pauseLayer: {
      position: 'absolute',
      inset: 0,
      zIndex: 2,
      display: isPlaying ? 'none' : 'grid',
      placeItems: 'center',
      pointerEvents: 'none',
    },
    pauseIcon: {
      width: '4.4rem',
      height: '4.4rem',
      borderRadius: '999px',
      display: 'grid',
      placeItems: 'center',
      background: 'rgba(5,8,15,0.5)',
      border: '1px solid rgba(255,255,255,0.18)',
      boxShadow: '0 0 32px rgba(0,0,0,0.24)',
    },
    rightRail: {
      position: 'absolute',
      right: '0.7rem',
      bottom: '6.7rem',
      zIndex: 5,
      display: 'grid',
      gap: '0.7rem',
      justifyItems: 'center',
    },
    bottomInfo: {
      position: 'absolute',
      left: '0.9rem',
      right: '5.2rem',
      bottom: '1.35rem',
      zIndex: 5,
      display: 'grid',
      gap: '0.7rem',
    },
    creatorRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      minWidth: 0,
    },
    creatorText: {
      minWidth: 0,
      display: 'grid',
      gap: '0.18rem',
    },
    usernameRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.42rem',
      flexWrap: 'wrap',
    },
    verified: {
      width: '1.05rem',
      height: '1.05rem',
      borderRadius: '999px',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
      color: '#fff',
      fontSize: '0.68rem',
      fontWeight: 900,
    },
    followButton: {
      border: '1px solid rgba(255,255,255,0.18)',
      borderRadius: '999px',
      padding: '0.5rem 0.75rem',
      background: activeReel.isFollowing
        ? 'rgba(255,255,255,0.1)'
        : 'linear-gradient(135deg, rgba(124,92,255,0.6), rgba(77,215,255,0.38))',
      color: '#fff',
      fontSize: '0.76rem',
      fontWeight: 850,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    caption: {
      maxWidth: '34rem',
      color: '#ffffff',
      fontSize: '0.9rem',
      lineHeight: 1.48,
      textShadow: '0 2px 14px rgba(0,0,0,0.42)',
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: showCaption ? 'unset' : 2,
      overflow: showCaption ? 'visible' : 'hidden',
    },
    musicRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.45rem',
      color: '#e7edff',
      fontSize: '0.78rem',
      fontWeight: 700,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    progressTrack: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '0.28rem',
      background: 'rgba(255,255,255,0.2)',
      zIndex: 8,
    },
    progressBar: {
      width: `${progress}%`,
      height: '100%',
      background: 'linear-gradient(90deg, #7c5cff, #ff4fd8, #4dd7ff)',
      boxShadow: '0 0 14px rgba(77,215,255,0.6)',
      transition: 'width 300ms linear',
    },
    buffer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 7,
      width: '3.2rem',
      height: '3.2rem',
      borderRadius: '999px',
      display: isBuffering ? 'grid' : 'none',
      placeItems: 'center',
      background: 'rgba(5,8,15,0.48)',
      border: '1px solid rgba(255,255,255,0.14)',
      backdropFilter: 'blur(10px)',
    },
    infoPill: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      width: 'fit-content',
      padding: '0.38rem 0.58rem',
      borderRadius: '999px',
      background: 'rgba(5,8,15,0.38)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#e5ebfb',
      fontSize: '0.72rem',
      fontWeight: 750,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    },
  };

  return (
    <div style={styles.page}>
      <TopBar pageTitle="Reels" notificationCount={3} />

      <main
        style={styles.stage}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={styles.reelCanvas}>
          <div style={styles.mediaLayer} />

          <div style={styles.topControls}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              style={styles.smallButton}
            >
              <ArrowLeft size={18} />
            </button>

            <div style={styles.counter}>
              <Flame size={14} color="#ff83c7" />
              <span>Reels {activeIndex + 1}/{reels.length}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowCreationPanel(true)}
              aria-label="Create reel"
              style={styles.smallButton}
            >
              <Plus size={19} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsPlaying((current) => !current)}
            aria-label={isPlaying ? 'Pause reel' : 'Play reel'}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              width: '100%',
              height: '100%',
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
            }}
          />

          <div style={styles.pauseLayer}>
            <span style={styles.pauseIcon}>{isPlaying ? <Play size={25} /> : <Pause size={25} />}</span>
          </div>

          <div style={styles.buffer}>
            <LoaderCircle size={23} className="aarush-spin" />
          </div>

          <div style={styles.rightRail}>
            <ActionButton
              icon={activeReel.isLiked ? Heart : Heart}
              label="Like"
              count={formatCount(activeReel.likeCount)}
              active={activeReel.isLiked}
              onClick={() => toggleLike(activeReel)}
            />
            <ActionButton
              icon={MessageCircle}
              label="Comment"
              count={formatCount(activeReel.commentCount + (commentCount[activeReel.id] || 0))}
              onClick={() =>
                setCommentCount((current) => ({
                  ...current,
                  [activeReel.id]: (current[activeReel.id] || 0) + 1,
                }))
              }
            />
            <ActionButton
              icon={Share2}
              label="Share"
              count={formatCount(activeReel.shareCount)}
              onClick={() => handleShare(activeReel)}
            />
            <ActionButton
              icon={activeReel.isSaved ? BookmarkCheck : Bookmark}
              label={activeReel.isSaved ? 'Saved' : 'Save'}
              active={activeReel.isSaved}
              onClick={() => toggleSave(activeReel)}
            />
            <ActionButton
              icon={RotateCcw}
              label="Remix"
              onClick={() => setShowCreationPanel(true)}
            />
            <ActionButton
              icon={UserRoundCheck}
              label="Duet"
              onClick={() => setShowCreationPanel(true)}
            />
            <ActionButton
              icon={MoreHorizontal}
              label="More"
              onClick={() => setShowMenuFor(activeReel.id)}
            />
          </div>

          <div style={styles.bottomInfo}>
            <div style={styles.creatorRow}>
              <ReelAvatar reel={activeReel} />

              <div style={styles.creatorText}>
                <div style={styles.usernameRow}>
                  <strong style={{ color: '#fff', fontSize: '0.94rem' }}>{activeReel.username}</strong>
                  {activeReel.verified ? <span style={styles.verified}>✓</span> : null}
                  <span style={{ color: '#c5d0e8', fontSize: '0.76rem', fontWeight: 700 }}>
                    {activeReel.timeAgo}
                  </span>
                </div>
                <div style={styles.musicRow}>
                  <Music2 size={13} />
                  <span>{activeReel.musicName}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateReel(activeReel.id, { isFollowing: !activeReel.isFollowing })}
                style={styles.followButton}
              >
                {activeReel.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCaption((current) => !current)}
              style={{
                ...styles.caption,
                border: 0,
                background: 'transparent',
                padding: 0,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {activeReel.caption}
            </button>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {activeReel.hashtags.map((tag) => (
                <span key={tag} style={styles.infoPill}>
                  {tag}
                </span>
              ))}
              {activeReel.mentions.map((mention) => (
                <span key={mention} style={styles.infoPill}>
                  {mention}
                </span>
              ))}
              <span style={styles.infoPill}>
                <Clock3 size={12} /> {watchSeconds}s watched
              </span>
              <span style={styles.infoPill}>
                <EyeIcon /> {formatCount(activeReel.viewCount)} views
              </span>
            </div>
          </div>

          <div style={styles.progressTrack} aria-label="Video progress">
            <div style={styles.progressBar} />
          </div>
        </div>
      </main>

      {isLoadingMore ? (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '1.2rem',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 0.8rem',
            borderRadius: '999px',
            background: 'rgba(8,11,18,0.76)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '0.76rem',
            fontWeight: 800,
            backdropFilter: 'blur(12px)',
          }}
        >
          <LoaderCircle size={14} className="aarush-spin" />
          Loading more reels
        </div>
      ) : null}

      {showMenuFor ? (
        <ReelMenu
          reel={reels.find((reel) => reel.id === showMenuFor) || activeReel}
          onClose={() => setShowMenuFor(null)}
          onAction={handleMenuAction}
        />
      ) : null}

      {showCreationPanel ? <CreationPanel onClose={() => setShowCreationPanel(false)} /> : null}

      <style>{`
        @keyframes aarush-reel-sheet-in {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .aarush-spin {
          animation: aarush-spin 900ms linear infinite;
        }

        button:hover {
          filter: brightness(1.08);
        }

        @media (min-width: 760px) {
          .aarush-reels-stage {
            max-width: 560px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}