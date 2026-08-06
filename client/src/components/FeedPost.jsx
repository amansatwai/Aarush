import { useMemo, useRef, useState } from 'react';
import {
  Bell,
  BellOff,
  Bookmark,
  BookmarkCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Clock3,
  Copy,
  EyeOff,
  Flag,
  Heart,
  Link2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Send,
  Shield,
  UserRound,
  UserRoundCheck,
  VolumeX,
  Sparkles,
} from 'lucide-react';

const defaultPost = {
  id: 'post-1',
  username: 'arush.dev',
  verified: true,
  timeAgo: '2m',
  location: 'Ghaziabad, India',
  caption:
    'Building Aarush Home Feed v1.0 with a premium dark UI, modular architecture, and production-ready interactions for React + Vite + Supabase. #React #Supabase @teamaarush',
  images: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  ],
  video: false,
  likeCount: 1284,
  commentCount: 92,
  viewCount: 16840,
  saveCount: 211,
  isFollowing: true,
  notificationsEnabled: true,
};

const menuItems = [
  { key: 'save', label: 'Save', icon: Bookmark },
  { key: 'remove_saved', label: 'Remove from saved', icon: BookmarkCheck },
  { key: 'hide', label: 'Hide post', icon: EyeOff },
  { key: 'not_interested', label: 'Not interested', icon: CircleSlash },
  { key: 'report', label: 'Report', icon: Flag },
  { key: 'block_user', label: 'Block user', icon: Ban },
  { key: 'restrict_account', label: 'Restrict account', icon: Shield },
  { key: 'mute_user', label: 'Mute user', icon: VolumeX },
  { key: 'mute_posts', label: 'Mute posts', icon: EyeOff },
  { key: 'mute_stories', label: 'Mute stories', icon: BellOff },
  { key: 'copy_link', label: 'Copy link', icon: Copy },
  { key: 'share_external', label: 'Share externally', icon: Link2 },
  { key: 'view_profile', label: 'View profile', icon: UserRound },
  { key: 'follow_toggle', label: 'Follow / Unfollow', icon: UserRoundCheck },
  { key: 'notify_toggle', label: 'Turn notifications on/off', icon: Bell },
];

function formatCount(value) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function ActionButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        flex: '1 1 0',
        minWidth: 0,
        border: '0',
        borderRadius: '999px',
        padding: '0.72rem 0.65rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.35rem',
        background: active
          ? 'linear-gradient(135deg, rgba(124, 92, 255, 0.24), rgba(77, 215, 255, 0.14))'
          : 'rgba(255,255,255,0.05)',
        color: active ? '#ffffff' : '#dfe7fb',
        border: '1px solid ' + (active ? 'rgba(124, 92, 255, 0.28)' : 'rgba(255,255,255,0.08)'),
        cursor: 'pointer',
        transition: 'transform 180ms ease, background 180ms ease, box-shadow 180ms ease, color 180ms ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Icon size={17} strokeWidth={2.15} fill={active ? 'currentColor' : 'none'} />
      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{label}</span>
    </button>
  );
}

function Avatar({ username }) {
  return (
    <div
      style={{
        width: '2.85rem',
        height: '2.85rem',
        borderRadius: '999px',
        padding: '2.6px',
        background: 'linear-gradient(135deg, #7c5cff 0%, #ff4fd8 48%, #4dd7ff 100%)',
        boxShadow: '0 0 16px rgba(124, 92, 255, 0.18), 0 0 26px rgba(77, 215, 255, 0.08)',
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
          color: '#fff',
          fontWeight: 800,
          fontSize: '0.95rem',
          background: 'linear-gradient(135deg, #151a28, #1b2235)',
        }}
      >
        {username?.[0]?.toUpperCase() || 'A'}
      </div>
    </div>
  );
}

export default function FeedPost({ post = defaultPost }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(Boolean(post.isFollowing));
  const [notificationsEnabled, setNotificationsEnabled] = useState(Boolean(post.notificationsEnabled));
  const [doubleTapPulse, setDoubleTapPulse] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const lastTap = useRef(0);

  const media = useMemo(() => {
    if (Array.isArray(post.images) && post.images.length) return post.images;
    return [];
  }, [post.images]);

  const captionParts = useMemo(() => {
    const raw = post.caption || '';
    const hashtags = raw.match(/#[\w_]+/g) || [];
    const mentions = raw.match(/@[\w_.]+/g) || [];
    return { raw, hashtags, mentions };
  }, [post.caption]);

  const currentImage = media[activeIndex] || media[0] || null;
  const visibleCaption =
    expanded || captionParts.raw.length <= 170 ? captionParts.raw : `${captionParts.raw.slice(0, 170).trimEnd()}...`;

  const handleDoubleTapLike = () => {
    setLiked(true);
    setDoubleTapPulse(true);
    window.clearTimeout(handleDoubleTapLike._t);
    handleDoubleTapLike._t = window.setTimeout(() => setDoubleTapPulse(false), 550);
  };

  const handleMediaTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      handleDoubleTapLike();
    }
    lastTap.current = now;
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > 45 && media.length > 1) {
      if (delta > 0) setActiveIndex((i) => Math.min(i + 1, media.length - 1));
      else setActiveIndex((i) => Math.max(i - 1, 0));
    }
  };

  const executeMenuAction = (key) => {
    if (key === 'save') setSaved(true);
    if (key === 'remove_saved') setSaved(false);
    if (key === 'follow_toggle') setIsFollowing((v) => !v);
    if (key === 'notify_toggle') setNotificationsEnabled((v) => !v);
    if (key === 'copy_link' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(`https://aarush.app/post/${post.id}`);
    }
    if (key === 'view_profile') {
      window.dispatchEvent(new CustomEvent('aarush:navigate', { detail: { to: `/profile/${post.username}` } }));
    }
    setShowMenu(false);
  };

  const styles = {
    card: {
      position: 'relative',
      borderRadius: '1.35rem',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, rgba(15, 19, 30, 0.98), rgba(12, 15, 24, 0.98))',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.34)',
      marginBottom: '1rem',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      padding: '0.95rem 0.95rem 0.8rem',
    },
    userRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      minWidth: 0,
      flex: 1,
    },
    userMeta: {
      minWidth: 0,
      display: 'grid',
      gap: '0.2rem',
    },
    topLine: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.45rem',
      minWidth: 0,
      flexWrap: 'wrap',
    },
    username: {
      color: '#f7f9ff',
      fontSize: '0.95rem',
      fontWeight: 800,
      lineHeight: 1.05,
    },
    verified: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1.12rem',
      height: '1.12rem',
      borderRadius: '999px',
      background: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
      color: '#fff',
      boxShadow: '0 0 14px rgba(77, 215, 255, 0.22)',
      flexShrink: 0,
      fontSize: '0.75rem',
      fontWeight: 900,
    },
    metaRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.45rem',
      color: '#94a0bb',
      fontSize: '0.8rem',
      fontWeight: 600,
      flexWrap: 'wrap',
    },
    followBtn: {
      border: '0',
      borderRadius: '999px',
      padding: '0.58rem 0.82rem',
      background: isFollowing
        ? 'rgba(255,255,255,0.06)'
        : 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))',
      color: '#ffffff',
      fontSize: '0.8rem',
      fontWeight: 800,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
    menuBtn: {
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#f1f6ff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      flexShrink: 0,
    },
    mediaWrap: {
      position: 'relative',
      background: 'linear-gradient(180deg, rgba(10, 14, 24, 1), rgba(7, 10, 16, 1))',
    },
    media: {
      width: '100%',
      aspectRatio: '1 / 1',
      objectFit: 'cover',
      display: 'block',
      background: '#0b1020',
      userSelect: 'none',
      WebkitUserDrag: 'none',
    },
    videoPlaceholder: {
      width: '100%',
      aspectRatio: '1 / 1',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, rgba(16,20,31,1), rgba(27,34,53,1))',
      color: '#d7e0f7',
      fontSize: '0.92rem',
      fontWeight: 700,
    },
    carouselControls: {
      position: 'absolute',
      inset: 'auto 0.7rem 0.7rem 0.7rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem',
      pointerEvents: 'none',
    },
    arrowBtn: {
      width: '2.15rem',
      height: '2.15rem',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(10,14,24,0.5)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      pointerEvents: 'auto',
      cursor: 'pointer',
    },
    dots: {
      display: 'flex',
      gap: '0.35rem',
      justifyContent: 'center',
      alignItems: 'center',
      pointerEvents: 'none',
      flex: 1,
    },
    dot: (active) => ({
      width: active ? '1.2rem' : '0.42rem',
      height: '0.42rem',
      borderRadius: '999px',
      background: active ? 'linear-gradient(90deg, #7c5cff, #4dd7ff)' : 'rgba(255,255,255,0.22)',
      boxShadow: active ? '0 0 12px rgba(77,215,255,0.28)' : 'none',
      transition: 'all 180ms ease',
    }),
    doubleTapBurst: {
      position: 'absolute',
      inset: '50% auto auto 50%',
      transform: 'translate(-50%, -50%)',
      display: doubleTapPulse ? 'grid' : 'none',
      placeItems: 'center',
      width: '5.8rem',
      height: '5.8rem',
      borderRadius: '999px',
      background: 'radial-gradient(circle, rgba(255,79,216,0.42) 0%, rgba(124,92,255,0.2) 45%, rgba(77,215,255,0) 72%)',
      color: '#fff',
      pointerEvents: 'none',
      animation: 'aarush-pulse 550ms ease-out',
    },
    captionWrap: {
      padding: '0.9rem 0.95rem 0.35rem',
      display: 'grid',
      gap: '0.65rem',
    },
    caption: {
      color: '#e7ecfb',
      fontSize: '0.92rem',
      lineHeight: 1.55,
    },
    captionToggle: {
      marginLeft: '0.4rem',
      border: '0',
      background: 'transparent',
      color: '#89d7ff',
      fontSize: '0.82rem',
      fontWeight: 800,
      cursor: 'pointer',
      padding: 0,
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.45rem',
    },
    chip: {
      padding: '0.32rem 0.55rem',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.07)',
      color: '#cfd8ee',
      fontSize: '0.74rem',
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
    },
    actions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '0.5rem',
      padding: '0.8rem 0.95rem 0.95rem',
    },
    counts: {
      padding: '0 0.95rem 0.95rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '0.5rem',
      color: '#b6c0d7',
      fontSize: '0.78rem',
      fontWeight: 700,
    },
    countCard: {
      padding: '0.68rem 0.7rem',
      borderRadius: '0.95rem',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      textAlign: 'center',
    },
    footer: {
      padding: '0 0.95rem 0.95rem',
      display: 'grid',
      gap: '0.55rem',
    },
    commentsLink: {
      border: '0',
      background: 'transparent',
      color: '#89d7ff',
      fontWeight: 800,
      fontSize: '0.84rem',
      padding: 0,
      cursor: 'pointer',
      width: 'fit-content',
    },
    commentInput: {
      width: '100%',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#dce5f7',
      padding: '0.78rem 0.95rem',
      fontSize: '0.84rem',
      outline: 'none',
    },
    menuOverlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 1100,
      background: 'rgba(2, 5, 10, 0.58)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'grid',
      alignItems: 'end',
    },
    menuSheet: {
      width: '100%',
      maxHeight: '82vh',
      overflowY: 'auto',
      background: 'linear-gradient(180deg, rgba(15,19,30,0.98), rgba(11,15,24,0.98))',
      borderTopLeftRadius: '1.35rem',
      borderTopRightRadius: '1.35rem',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 -20px 60px rgba(0,0,0,0.4)',
      padding: '0.8rem',
    },
    menuHandle: {
      width: '3.2rem',
      height: '0.3rem',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.2)',
      margin: '0 auto 0.9rem',
    },
    menuGrid: {
      display: 'grid',
      gap: '0.5rem',
    },
    menuBtnItem: {
      width: '100%',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#f2f6ff',
      borderRadius: '1rem',
      padding: '0.9rem 0.95rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.7rem',
      fontSize: '0.9rem',
      fontWeight: 700,
      cursor: 'pointer',
    },
  };

  return (
    <article style={styles.card}>
      <header style={styles.header}>
        <div style={styles.userRow}>
          <Avatar username={post.username} />
          <div style={styles.userMeta}>
            <div style={styles.topLine}>
              <span style={styles.username}>{post.username}</span>
              {post.verified ? <span style={styles.verified}>✓</span> : null}
            </div>
            <div style={styles.metaRow}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock3 size={12} />
                {post.timeAgo}
              </span>
              {post.location ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={12} />
                  {post.location}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsFollowing((v) => !v)}
          style={styles.followBtn}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>

        <button
          type="button"
          aria-label="Open post menu"
          onClick={() => setShowMenu(true)}
          style={styles.menuBtn}
        >
          <MoreHorizontal size={18} strokeWidth={2.3} />
        </button>
      </header>

      <div style={styles.mediaWrap}>
        <div
          onClick={handleMediaTap}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ position: 'relative' }}
        >
          {post.video ? (
            <div style={styles.videoPlaceholder}>
              <div style={{ display: 'grid', gap: '0.45rem', justifyItems: 'center' }}>
                <div
                  style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '999px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.34), rgba(77,215,255,0.2))',
                    boxShadow: '0 0 24px rgba(124,92,255,0.18)',
                  }}
                >
                  <PlayIcon />
                </div>
                <div>Video placeholder</div>
              </div>
            </div>
          ) : (
            <>
              <img src={currentImage} alt="Feed media" style={styles.media} draggable="false" />
              {media.length > 1 ? (
                <div style={styles.carouselControls}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}
                    disabled={activeIndex === 0}
                    style={{
                      ...styles.arrowBtn,
                      opacity: activeIndex === 0 ? 0.45 : 1,
                      cursor: activeIndex === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div style={styles.dots}>
                    {media.map((_, index) => (
                      <span key={index} style={styles.dot(index === activeIndex)} />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveIndex((i) => Math.min(i + 1, media.length - 1))}
                    disabled={activeIndex === media.length - 1}
                    style={{
                      ...styles.arrowBtn,
                      opacity: activeIndex === media.length - 1 ? 0.45 : 1,
                      cursor: activeIndex === media.length - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : null}
            </>
          )}

          <div style={styles.doubleTapBurst}>
            <Heart size={34} fill="currentColor" />
          </div>
        </div>
      </div>

      <div style={styles.captionWrap}>
        <div style={styles.caption}>
          <span>{visibleCaption}</span>
          {captionParts.raw.length > 170 ? (
            <button type="button" onClick={() => setExpanded((v) => !v)} style={styles.captionToggle}>
              {expanded ? 'Show less' : 'View more'}
            </button>
          ) : null}
        </div>

        <div style={styles.chips}>
          {captionParts.hashtags.slice(0, 4).map((tag) => (
            <span key={tag} style={styles.chip}>
              <Sparkles size={12} /> {tag}
            </span>
          ))}
          {captionParts.mentions.slice(0, 3).map((tag) => (
            <span key={tag} style={styles.chip}>
              <UserRound size={12} /> {tag}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.actions}>
        <ActionButton icon={Heart} label={liked ? 'Liked' : 'Like'} active={liked} onClick={() => setLiked((v) => !v)} />
        <ActionButton icon={MessageCircle} label="Comment" active={false} onClick={() => {}} />
        <ActionButton icon={Send} label="Share" active={false} onClick={() => {}} />
        <ActionButton
          icon={saved ? BookmarkCheck : Bookmark}
          label={saved ? 'Saved' : 'Save'}
          active={saved}
          onClick={() => setSaved((v) => !v)}
        />
      </div>

      <div style={styles.counts}>
        <div style={styles.countCard}>{formatCount(post.likeCount + (liked ? 1 : 0))} likes</div>
        <div style={styles.countCard}>{formatCount(post.commentCount)} comments</div>
        <div style={styles.countCard}>{formatCount(post.viewCount)} views</div>
      </div>

      <div style={styles.footer}>
        <button type="button" style={styles.commentsLink}>
          View all comments
        </button>
        <input type="text" placeholder="Add a comment…" style={styles.commentInput} />
      </div>

      {showMenu ? (
        <div role="dialog" aria-modal="true" style={styles.menuOverlay} onClick={() => setShowMenu(false)}>
          <div style={styles.menuSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.menuHandle} />
            <div style={styles.menuGrid}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active =
                  (item.key === 'save' && saved) ||
                  (item.key === 'remove_saved' && !saved) ||
                  (item.key === 'follow_toggle' && isFollowing) ||
                  (item.key === 'notify_toggle' && notificationsEnabled);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => executeMenuAction(item.key)}
                    style={styles.menuBtnItem}
                  >
                    <Icon size={17} strokeWidth={2.1} fill={active ? 'currentColor' : 'none'} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <style>{`@keyframes aarush-pulse{0%{transform:translate(-50%,-50%) scale(.6);opacity:.2}40%{opacity:1}100%{transform:translate(-50%,-50%) scale(1.2);opacity:0}}`}</style>
    </article>
  );
}

function PlayIcon() {
  return <PlayTriangle />;
}

function PlayTriangle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}