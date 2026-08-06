import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Archive,
  Ban,
  Bell,
  BellOff,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  CircleSlash,
  Copy,
  EyeOff,
  Flag,
  Link2,
  MoreHorizontal,
  ShieldAlert,
  UserRound,
  UserRoundCheck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

const ACTION_GROUPS = [
  {
    id: 'content',
    items: [
      {
        key: 'save',
        label: 'Save Post',
        icon: Bookmark,
        tone: 'default',
      },
      {
        key: 'removeSaved',
        label: 'Remove from Saved',
        icon: BookmarkCheck,
        tone: 'default',
      },
      {
        key: 'hide',
        label: 'Hide Post',
        icon: EyeOff,
        tone: 'default',
      },
      {
        key: 'notInterested',
        label: 'Not Interested',
        icon: CircleSlash,
        tone: 'default',
      },
    ],
  },
  {
    id: 'privacy',
    items: [
      {
        key: 'muteUser',
        label: 'Mute User',
        icon: VolumeX,
        tone: 'default',
      },
      {
        key: 'mutePosts',
        label: 'Mute Posts',
        icon: VolumeX,
        tone: 'default',
      },
      {
        key: 'muteStories',
        label: 'Mute Stories',
        icon: VolumeX,
        tone: 'default',
      },
      {
        key: 'followToggle',
        label: 'Follow / Unfollow',
        icon: UserRoundCheck,
        tone: 'default',
      },
      {
        key: 'notificationOn',
        label: 'Turn Notifications On',
        icon: Bell,
        tone: 'default',
      },
      {
        key: 'notificationOff',
        label: 'Turn Notifications Off',
        icon: BellOff,
        tone: 'default',
      },
    ],
  },
  {
    id: 'sharing',
    items: [
      {
        key: 'copyLink',
        label: 'Copy Link',
        icon: Copy,
        tone: 'default',
      },
      {
        key: 'shareExternally',
        label: 'Share Externally',
        icon: Link2,
        tone: 'default',
      },
      {
        key: 'viewProfile',
        label: 'View Profile',
        icon: UserRound,
        tone: 'default',
      },
    ],
  },
  {
    id: 'safety',
    items: [
      {
        key: 'report',
        label: 'Report Post',
        icon: Flag,
        tone: 'danger',
      },
      {
        key: 'block',
        label: 'Block User',
        icon: Ban,
        tone: 'danger',
      },
      {
        key: 'restrict',
        label: 'Restrict Account',
        icon: ShieldAlert,
        tone: 'warning',
      },
    ],
  },
];

function getPostLink(post) {
  if (post?.url) return post.url;
  if (post?.id) return `${window.location.origin}/post/${post.id}`;
  return window.location.href;
}

function ActionIcon({ Icon, tone }) {
  const colors = {
    default: {
      color: '#dce8ff',
      background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.22), rgba(77, 215, 255, 0.12))',
      boxShadow: '0 0 18px rgba(124, 92, 255, 0.12)',
    },
    warning: {
      color: '#ffd58a',
      background: 'rgba(255, 179, 71, 0.14)',
      boxShadow: '0 0 18px rgba(255, 179, 71, 0.08)',
    },
    danger: {
      color: '#ff9dbd',
      background: 'rgba(255, 79, 122, 0.14)',
      boxShadow: '0 0 18px rgba(255, 79, 122, 0.08)',
    },
  };

  const style = colors[tone] || colors.default;

  return (
    <span
      style={{
        width: '2.35rem',
        height: '2.35rem',
        borderRadius: '0.85rem',
        display: 'grid',
        placeItems: 'center',
        color: style.color,
        background: style.background,
        boxShadow: style.boxShadow,
        flexShrink: 0,
      }}
    >
      <Icon size={17} strokeWidth={2.15} />
    </span>
  );
}

export default function PostActionSheet({
  post = null,
  isOpen = true,
  isSaved = false,
  isFollowing = false,
  notificationsEnabled = false,
  onClose,
  onSave,
  onRemoveSaved,
  onHide,
  onNotInterested,
  onReport,
  onBlock,
  onRestrict,
  onMuteUser,
  onMutePosts,
  onMuteStories,
  onCopyLink,
  onShareExternally,
  onViewProfile,
  onFollow,
  onUnfollow,
  onNotificationsOn,
  onNotificationsOff,
  onAction,
}) {
  const [savedState, setSavedState] = useState(Boolean(isSaved));
  const [followingState, setFollowingState] = useState(Boolean(isFollowing));
  const [notificationsState, setNotificationsState] = useState(Boolean(notificationsEnabled));
  const [closing, setClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    setSavedState(Boolean(isSaved));
  }, [isSaved]);

  useEffect(() => {
    setFollowingState(Boolean(isFollowing));
  }, [isFollowing]);

  useEffect(() => {
    setNotificationsState(Boolean(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        requestClose('escape');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const actionState = useMemo(
    () => ({
      saved: savedState,
      following: followingState,
      notificationsEnabled: notificationsState,
      post,
    }),
    [followingState, notificationsState, post, savedState]
  );

  const requestClose = (reason = 'close') => {
    if (closing) return;

    setClosing(true);
    setDragOffset(0);

    closeTimerRef.current = window.setTimeout(() => {
      if (typeof onClose === 'function') {
        onClose(reason);
      }
      setClosing(false);
    }, 220);
  };

  const emitAction = (key, payload = {}) => {
    if (typeof onAction === 'function') {
      onAction({
        key,
        post,
        ...actionState,
        ...payload,
      });
    }
  };

  const handleCopyLink = async () => {
    const link = getPostLink(post);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      }
    } catch {
      // Clipboard permissions may be unavailable in some browsers.
    }

    if (typeof onCopyLink === 'function') {
      onCopyLink(link, post);
    }

    emitAction('copyLink', { link });
    requestClose('copy-link');
  };

  const handleExternalShare = async () => {
    const link = getPostLink(post);
    const shareData = {
      title: post?.username ? `Post by ${post.username}` : 'Aarush post',
      text: post?.caption || 'Check out this post on Aarush.',
      url: link,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error?.name !== 'AbortError') {
          window.open(link, '_blank', 'noopener,noreferrer');
        }
      }
    } else {
      window.open(link, '_blank', 'noopener,noreferrer');
    }

    if (typeof onShareExternally === 'function') {
      onShareExternally(shareData, post);
    }

    emitAction('shareExternally', { shareData, link });
    requestClose('external-share');
  };

  const handleAction = (key) => {
    switch (key) {
      case 'save':
        setSavedState(true);
        if (typeof onSave === 'function') onSave(post);
        emitAction('save');
        requestClose('save');
        break;

      case 'removeSaved':
        setSavedState(false);
        if (typeof onRemoveSaved === 'function') onRemoveSaved(post);
        emitAction('removeSaved');
        requestClose('remove-saved');
        break;

      case 'hide':
        if (typeof onHide === 'function') onHide(post);
        emitAction('hide');
        requestClose('hide');
        break;

      case 'notInterested':
        if (typeof onNotInterested === 'function') onNotInterested(post);
        emitAction('notInterested');
        requestClose('not-interested');
        break;

      case 'report':
        if (typeof onReport === 'function') onReport(post);
        emitAction('report');
        requestClose('report');
        break;

      case 'block':
        if (typeof onBlock === 'function') onBlock(post);
        emitAction('block');
        requestClose('block');
        break;

      case 'restrict':
        if (typeof onRestrict === 'function') onRestrict(post);
        emitAction('restrict');
        requestClose('restrict');
        break;

      case 'muteUser':
        if (typeof onMuteUser === 'function') onMuteUser(post);
        emitAction('muteUser');
        requestClose('mute-user');
        break;

      case 'mutePosts':
        if (typeof onMutePosts === 'function') onMutePosts(post);
        emitAction('mutePosts');
        requestClose('mute-posts');
        break;

      case 'muteStories':
        if (typeof onMuteStories === 'function') onMuteStories(post);
        emitAction('muteStories');
        requestClose('mute-stories');
        break;

      case 'copyLink':
        handleCopyLink();
        break;

      case 'shareExternally':
        handleExternalShare();
        break;

      case 'viewProfile':
        if (typeof onViewProfile === 'function') onViewProfile(post);
        emitAction('viewProfile');
        requestClose('view-profile');
        break;

      case 'followToggle':
        if (followingState) {
          setFollowingState(false);
          if (typeof onUnfollow === 'function') onUnfollow(post);
          emitAction('unfollow');
        } else {
          setFollowingState(true);
          if (typeof onFollow === 'function') onFollow(post);
          emitAction('follow');
        }
        requestClose('follow-toggle');
        break;

      case 'notificationOn':
        setNotificationsState(true);
        if (typeof onNotificationsOn === 'function') onNotificationsOn(post);
        emitAction('notificationsOn');
        requestClose('notifications-on');
        break;

      case 'notificationOff':
        setNotificationsState(false);
        if (typeof onNotificationsOff === 'function') onNotificationsOff(post);
        emitAction('notificationsOff');
        requestClose('notifications-off');
        break;

      default:
        break;
    }
  };

  const handlePointerDown = (event) => {
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;
    startYRef.current = clientY;
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (startYRef.current === null) return;

    const clientY = event.touches?.[0]?.clientY ?? event.clientY;
    const delta = clientY - startYRef.current;

    if (delta > 0) {
      setDragOffset(Math.min(delta, 260));
    }
  };

  const handlePointerUp = () => {
    if (startYRef.current === null) return;

    if (dragOffset > 90) {
      requestClose('swipe-down');
    } else {
      setDragOffset(0);
    }

    startYRef.current = null;
    setIsDragging(false);
  };

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  const displayGroups = ACTION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.key === 'save' && savedState) return false;
      if (item.key === 'removeSaved' && !savedState) return false;
      if (item.key === 'followToggle' && followingState) return false;
      if (item.key === 'notificationOn' && notificationsState) return false;
      if (item.key === 'notificationOff' && !notificationsState) return false;
      return true;
    }),
  })).filter((group) => group.items.length > 0);

  const sheetTransform = closing
    ? 'translateY(100%)'
    : `translateY(${dragOffset}px)`;

  return createPortal(
    <div
      role="presentation"
      onClick={() => requestClose('outside')}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: closing ? 'rgba(2, 5, 10, 0)' : 'rgba(2, 5, 10, 0.68)',
        backdropFilter: 'blur(9px)',
        WebkitBackdropFilter: 'blur(9px)',
        transition: 'background 220ms ease',
        paddingTop: '1rem',
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="aarush-post-action-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: 'min(88vh, 760px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          background: 'linear-gradient(180deg, rgba(17, 22, 35, 0.98), rgba(9, 13, 22, 0.99))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '0',
          borderTopLeftRadius: '1.6rem',
          borderTopRightRadius: '1.6rem',
          boxShadow: '0 -24px 80px rgba(0, 0, 0, 0.48), 0 -1px 0 rgba(255,255,255,0.06) inset',
          transform: sheetTransform,
          opacity: closing ? 0.7 : 1,
          transition: isDragging ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease',
          touchAction: 'pan-y',
        }}
      >
        <div
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          style={{
            padding: '0.8rem 0.9rem 0.35rem',
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          <div
            style={{
              width: '3.2rem',
              height: '0.3rem',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.22)',
              margin: '0 auto',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.25rem 1rem 0.85rem',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2
              id="aarush-post-action-title"
              style={{
                margin: 0,
                color: '#f5f8ff',
                fontSize: '1rem',
                fontWeight: 850,
                letterSpacing: '0.01em',
              }}
            >
              Post actions
            </h2>
            <p
              style={{
                margin: '0.25rem 0 0',
                color: '#98a5c0',
                fontSize: '0.78rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {post?.username ? `Manage @${post.username}'s post` : 'Manage this post'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => requestClose('close-button')}
            aria-label="Close post actions"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.06)',
              color: '#f5f8ff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={17} strokeWidth={2.3} />
          </button>
        </div>

        <div style={{ padding: '0 0.8rem 1rem' }}>
          {displayGroups.map((group) => (
            <div
              key={group.id}
              style={{
                display: 'grid',
                gap: '0.45rem',
                marginTop: group.id === 'content' ? 0 : '0.8rem',
                paddingTop: group.id === 'content' ? 0 : '0.8rem',
                borderTop: group.id === 'content' ? '0' : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {group.items.map((item) => {
                const Icon = item.icon;
                const isDanger = item.tone === 'danger';
                const isWarning = item.tone === 'warning';

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleAction(item.key)}
                    style={{
                      width: '100%',
                      minHeight: '3.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.55rem 0.65rem',
                      borderRadius: '1rem',
                      border: `1px solid ${
                        isDanger
                          ? 'rgba(255, 79, 122, 0.18)'
                          : isWarning
                            ? 'rgba(255, 179, 71, 0.18)'
                            : 'rgba(255, 255, 255, 0.07)'
                      }`,
                      background: isDanger
                        ? 'linear-gradient(135deg, rgba(255, 79, 122, 0.1), rgba(255, 79, 122, 0.04))'
                        : isWarning
                          ? 'linear-gradient(135deg, rgba(255, 179, 71, 0.1), rgba(255, 179, 71, 0.04))'
                          : 'rgba(255, 255, 255, 0.045)',
                      color: isDanger ? '#ffb1c8' : isWarning ? '#ffdda4' : '#f2f6ff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'transform 160ms ease, background 160ms ease, border-color 160ms ease',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <ActionIcon Icon={Icon} tone={item.tone} />

                    <span
                      style={{
                        flex: 1,
                        fontSize: '0.88rem',
                        fontWeight: 750,
                        lineHeight: 1.2,
                      }}
                    >
                      {item.key === 'followToggle'
                        ? followingState
                          ? 'Unfollow'
                          : 'Follow'
                        : item.key === 'notificationOn'
                          ? 'Turn Notifications On'
                          : item.key === 'notificationOff'
                            ? 'Turn Notifications Off'
                            : item.label}
                    </span>

                    <ChevronRight size={16} color={isDanger ? '#ff9dbd' : '#8290ad'} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0 1rem calc(0.9rem + env(safe-area-inset-bottom))',
            color: '#75829d',
            fontSize: '0.72rem',
            fontWeight: 650,
          }}
        >
          <MoreHorizontal size={14} />
          Swipe down or tap outside to close
        </div>
      </section>
    </div>,
    document.body
  );
}