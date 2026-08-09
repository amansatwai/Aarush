import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Ellipsis,
  Heart,
  MapPin,
  MessageCircle,
  Play,
  Send,
  Share2,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import {
  addComment,
  deleteComment,
  getComments,
  toggleLike,
  toggleSavePost,
} from '../utils/postEngine';
import { supabase } from '../lib/supabase';

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

function getProfile(post) {
  return post?.profile || post?.profiles || {};
}

function getUsername(profile) {
  const username =
    profile?.username ||
    profile?.user_name ||
    'user';

  return username.startsWith('@')
    ? username.slice(1)
    : username;
}

function getDisplayName(profile) {
  return (
    profile?.full_name ||
    profile?.displayName ||
    'Aarush User'
  );
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

function getTimeAgo(dateValue) {
  if (!dateValue) {
    return 'Just now';
  }

  const createdAt = new Date(dateValue).getTime();

  if (Number.isNaN(createdAt)) {
    return 'Just now';
  }

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - createdAt) / 1000)
  );

  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d`;
  }

  return new Date(dateValue).toLocaleDateString();
}

function getHashtags(post) {
  if (Array.isArray(post?.hashtags)) {
    return post.hashtags;
  }

  if (typeof post?.hashtags === 'string') {
    return post.hashtags
      .split(/[\s,]+/)
      .map((tag) => tag.replace(/^#/, '').trim())
      .filter(Boolean);
  }

  return [];
}

function PlaceholderAvatar({ size = '2.55rem' }) {
  return (
    <span
      aria-hidden="true"
      style={{
        ...styles.placeholderAvatar,
        width: size,
        height: size,
      }}
    >
      <UserRound size={18} />
    </span>
  );
}

function Avatar({ profile, size = '2.55rem' }) {
  if (!profile?.avatar_url) {
    return <PlaceholderAvatar size={size} />;
  }

  return (
    <img
      src={profile.avatar_url}
      alt=""
      loading="lazy"
      style={{
        ...styles.avatar,
        width: size,
        height: size,
      }}
    />
  );
}

function CommentRow({
  comment,
  currentUserId,
  onDelete,
  deleting,
}) {
  const profile = comment.profile || comment.profiles || {};
  const username = getUsername(profile);

  return (
    <div style={styles.commentRow}>
      <Avatar profile={profile} size="2.2rem" />

      <div style={styles.commentBody}>
        <div style={styles.commentMeta}>
          <strong>@{username}</strong>
          <span>{getTimeAgo(comment.created_at)}</span>
        </div>

        <p style={styles.commentText}>{comment.comment}</p>
      </div>

      {currentUserId === comment.user_id ? (
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          disabled={deleting === comment.id}
          style={styles.commentDeleteButton}
          aria-label="Delete comment"
        >
          {deleting === comment.id ? (
            '…'
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      ) : null}
    </div>
  );
}

function CommentSheet({
  post,
  comments,
  loading,
  currentUserId,
  commentText,
  submitting,
  deleting,
  onClose,
  onChange,
  onSubmit,
  onDelete,
}) {
  const profile = getProfile(post);
  const username = getUsername(profile);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Post comments"
      onClick={onClose}
      style={styles.sheetBackdrop}
    >
      <section
        onClick={(event) => event.stopPropagation()}
        style={styles.commentSheet}
      >
        <div style={styles.sheetHandle} />

        <div style={styles.sheetHeader}>
          <div>
            <h2 style={styles.sheetTitle}>Comments</h2>
            <p style={styles.sheetSubtitle}>
              Join the conversation on @{username}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close comments"
          >
            <X size={17} />
          </button>
        </div>

        <div style={styles.commentsList}>
          {loading ? (
            <div style={styles.commentsLoading}>
              Loading comments…
            </div>
          ) : comments.length ? (
            comments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                deleting={deleting}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div style={styles.emptyComments}>
              <MessageCircle size={25} />
              <span>Be the first to comment.</span>
            </div>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          style={styles.commentComposer}
        >
          <input
            ref={inputRef}
            value={commentText}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Write a comment…"
            maxLength={1000}
            style={styles.commentInput}
            aria-label="Write a comment"
          />

          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            style={{
              ...styles.sendCommentButton,
              opacity:
                submitting || !commentText.trim() ? 0.45 : 1,
            }}
            aria-label="Post comment"
          >
            <Send size={15} />
          </button>
        </form>
      </section>
    </div>
  );
}

const MediaFallback = forwardRef(function MediaFallback(
  { mediaType, onRetry },
  ref
) {
  return (
    <div ref={ref} style={styles.mediaFallback}>
      <span>
        Unable to load this {mediaType || 'media'}.
      </span>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          style={styles.retryButton}
        >
          Retry
        </button>
      ) : null}
    </div>
  );
});

function PostCard({
  post,
  onPostUpdated,
  onRestrictedAction,
}) {
  const profile = useMemo(
    () => getProfile(post),
    [post]
  );

  const username = useMemo(
    () => getUsername(profile),
    [profile]
  );

  const displayName = useMemo(
    () => getDisplayName(profile),
    [profile]
  );

  const hashtags = useMemo(
    () => getHashtags(post),
    [post]
  );

  const [liked, setLiked] = useState(
    Boolean(post?.is_liked || post?.liked)
  );

  const [likeCount, setLikeCount] = useState(
    Number(post?.like_count || 0)
  );

  const [saved, setSaved] = useState(
    Boolean(post?.is_saved || post?.saved)
  );

  const [commentCount, setCommentCount] = useState(
    Number(post?.comment_count || 0)
  );

  const [likePending, setLikePending] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [captionExpanded, setCaptionExpanded] =
    useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] =
    useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] =
    useState(false);
  const [deletingCommentId, setDeletingCommentId] =
    useState(null);
  const [heartVisible, setHeartVisible] = useState(false);
  const [notice, setNotice] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const videoRef = useRef(null);
  const heartTimerRef = useRef(null);
  const noticeTimerRef = useRef(null);
  const mediaTapRef = useRef(null);

  const guest = useMemo(() => isGuestMode(), []);

  useEffect(() => {
    setLiked(Boolean(post?.is_liked || post?.liked));
    setLikeCount(Number(post?.like_count || 0));
    setSaved(Boolean(post?.is_saved || post?.saved));
    setCommentCount(Number(post?.comment_count || 0));
  }, [
    post?.id,
    post?.is_liked,
    post?.liked,
    post?.like_count,
    post?.is_saved,
    post?.saved,
    post?.comment_count,
  ]);

  useEffect(() => {
    return () => {
      if (heartTimerRef.current) {
        window.clearTimeout(heartTimerRef.current);
      }

      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const showNotice = useCallback((message) => {
    setNotice(message);

    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = window.setTimeout(() => {
      setNotice('');
    }, 2600);
  }, []);

  const showHeart = useCallback(() => {
    setHeartVisible(true);

    if (heartTimerRef.current) {
      window.clearTimeout(heartTimerRef.current);
    }

    heartTimerRef.current = window.setTimeout(() => {
      setHeartVisible(false);
    }, 850);
  }, []);

  const requireAuth = useCallback(() => {
    if (!guest) {
      return true;
    }

    if (typeof onRestrictedAction === 'function') {
      onRestrictedAction('Sign in to interact with posts.');
    } else {
      showNotice('Sign in to interact with posts.');
    }

    return false;
  }, [guest, onRestrictedAction, showNotice]);

  const handleLike = useCallback(
    async (event) => {
      event?.stopPropagation();

      if (!requireAuth() || likePending) {
        return;
      }

      const previousLiked = liked;
      const previousCount = likeCount;
      const nextLiked = !previousLiked;

      setLikePending(true);
      setLiked(nextLiked);
      setLikeCount((count) =>
        nextLiked ? count + 1 : Math.max(0, count - 1)
      );

      if (nextLiked) {
        showHeart();
      }

      onPostUpdated?.(post.id, {
        is_liked: nextLiked,
        like_count: nextLiked
          ? previousCount + 1
          : Math.max(0, previousCount - 1),
      });

      try {
        await toggleLike(post.id, previousLiked);
      } catch (error) {
        setLiked(previousLiked);
        setLikeCount(previousCount);

        onPostUpdated?.(post.id, {
          is_liked: previousLiked,
          like_count: previousCount,
        });

        showNotice(
          error.message || 'Unable to update like.'
        );
      } finally {
        setLikePending(false);
      }
    },
    [
      likeCount,
      likePending,
      liked,
      onPostUpdated,
      post.id,
      requireAuth,
      showHeart,
      showNotice,
    ]
  );

  const handleMediaDoubleTap = useCallback(
    (event) => {
      if (event.detail !== 2) {
        return;
      }

      event.preventDefault();

      if (!liked) {
        handleLike(event);
      } else {
        showHeart();
      }
    },
    [handleLike, liked, showHeart]
  );

  const handleMediaPointerUp = useCallback(
    (event) => {
      if (event.pointerType === 'mouse') {
        return;
      }

      const now = Date.now();

      if (
        mediaTapRef.current &&
        now - mediaTapRef.current < 320
      ) {
        mediaTapRef.current = null;

        if (!liked) {
          handleLike(event);
        } else {
          showHeart();
        }
      } else {
        mediaTapRef.current = now;

        window.setTimeout(() => {
          mediaTapRef.current = null;
        }, 330);
      }
    },
    [handleLike, liked, showHeart]
  );

  const handleSave = useCallback(async () => {
    if (!requireAuth() || savePending) {
      return;
    }

    const previousSaved = saved;
    const nextSaved = !previousSaved;

    setSavePending(true);
    setSaved(nextSaved);

    onPostUpdated?.(post.id, {
      is_saved: nextSaved,
    });

    try {
      await toggleSavePost(post.id, previousSaved);
      showNotice(
        nextSaved ? 'Post saved.' : 'Post removed from saved.'
      );
    } catch (error) {
      setSaved(previousSaved);

      onPostUpdated?.(post.id, {
        is_saved: previousSaved,
      });

      showNotice(
        error.message || 'Unable to update saved post.'
      );
    } finally {
      setSavePending(false);
    }
  }, [
    onPostUpdated,
    post.id,
    requireAuth,
    savePending,
    saved,
    showNotice,
  ]);

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);

    try {
      const nextComments = await getComments(post.id);
      setComments(nextComments);
    } catch (error) {
      showNotice(
        error.message || 'Unable to load comments.'
      );
    } finally {
      setCommentsLoading(false);
    }
  }, [post.id, showNotice]);

  const handleOpenComments = useCallback(() => {
    if (guest) {
      if (typeof onRestrictedAction === 'function') {
        onRestrictedAction('Sign in to comment on posts.');
      } else {
        showNotice('Sign in to comment on posts.');
      }

      return;
    }

    setCommentsOpen(true);
    loadComments();
  }, [
    guest,
    loadComments,
    onRestrictedAction,
    showNotice,
  ]);

  const handleSubmitComment = useCallback(
    async (event) => {
      event.preventDefault();

      if (!requireAuth() || !commentText.trim()) {
        return;
      }

      const text = commentText.trim();
      setCommentSubmitting(true);

      try {
        const {
          data: {
            user: currentUser,
          },
        } = await supabase.auth.getUser();

        const optimisticComment = {
          id: `optimistic-${Date.now()}`,
          post_id: post.id,
          user_id: currentUser?.id,
          comment: text,
          created_at: new Date().toISOString(),
          profile: {
            username:
              currentUser?.user_metadata?.username ||
              currentUser?.email?.split('@')[0] ||
              'you',
            full_name:
              currentUser?.user_metadata?.full_name ||
              'You',
            avatar_url:
              currentUser?.user_metadata?.avatar_url ||
              '',
          },
        };

        setComments((current) => [
          ...current,
          optimisticComment,
        ]);
        setCommentText('');
        setCommentCount((count) => count + 1);

        onPostUpdated?.(post.id, {
          comment_count: commentCount + 1,
        });

        const createdComment = await addComment(
          post.id,
          text
        );

        setComments((current) =>
          current.map((comment) =>
            comment.id === optimisticComment.id
              ? createdComment
              : comment
          )
        );
      } catch (error) {
        setComments((current) =>
          current.filter(
            (comment) =>
              !comment.id.startsWith('optimistic-')
          )
        );
        setCommentCount((count) => Math.max(0, count - 1));

        showNotice(
          error.message || 'Unable to add comment.'
        );
      } finally {
        setCommentSubmitting(false);
      }
    },
    [
      commentCount,
      commentText,
      onPostUpdated,
      post.id,
      requireAuth,
      showNotice,
    ]
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      const previousComments = comments;
      const previousCount = commentCount;

      setDeletingCommentId(commentId);
      setComments((current) =>
        current.filter((comment) => comment.id !== commentId)
      );
      setCommentCount((count) => Math.max(0, count - 1));

      try {
        await deleteComment(commentId);

        onPostUpdated?.(post.id, {
          comment_count: Math.max(0, previousCount - 1),
        });
      } catch (error) {
        setComments(previousComments);
        setCommentCount(previousCount);

        showNotice(
          error.message || 'Unable to delete comment.'
        );
      } finally {
        setDeletingCommentId(null);
      }
    },
    [
      commentCount,
      comments,
      onPostUpdated,
      post.id,
      showNotice,
    ]
  );

  const handleShare = useCallback(async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${displayName} on Aarush`,
          text: post.caption || 'View this post on Aarush.',
          url: postUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(postUrl);
      showNotice('Post link copied.');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        showNotice('Unable to share this post.');
      }
    }
  }, [displayName, post.caption, post.id, showNotice]);

  const toggleVideo = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      video.play().catch(() => {});
      setVideoPlaying(true);
    } else {
      video.pause();
      setVideoPlaying(false);
    }
  }, []);

  const handleMediaLoad = useCallback(() => {
    setMediaLoading(false);
    setMediaError(false);
  }, []);

  const handleMediaError = useCallback(() => {
    setMediaLoading(false);
    setMediaError(true);
  }, []);

  const visibleCaption =
    post.caption?.length > 180 && !captionExpanded
      ? `${post.caption.slice(0, 180)}…`
      : post.caption;

  return (
    <article style={styles.card}>
      <div style={styles.header}>
        <Avatar profile={profile} />

        <div style={styles.headerIdentity}>
          <div style={styles.usernameLine}>
            <strong>@{username}</strong>

            {profile?.is_private ? (
              <span
                title="Private profile"
                style={styles.privateBadge}
              >
                Private
              </span>
            ) : null}
          </div>

          <span style={styles.fullName}>{displayName}</span>
        </div>

        <span style={styles.time}>{getTimeAgo(post.created_at)}</span>

        <button
          type="button"
          onClick={() => setShowMenu((value) => !value)}
          style={styles.moreButton}
          aria-label={`More options for @${username}`}
          aria-expanded={showMenu}
        >
          <Ellipsis size={18} />
        </button>

        {showMenu ? (
          <div style={styles.moreMenu}>
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                navigator.clipboard
                  ?.writeText(
                    `${window.location.origin}/post/${post.id}`
                  )
                  .then(() => showNotice('Post link copied.'))
                  .catch(() => showNotice('Unable to copy link.'));
              }}
              style={styles.menuItem}
            >
              <Copy size={14} />
              Copy post link
            </button>

            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                showNotice('Post reported for review.');
              }}
              style={styles.menuItem}
            >
              Report post
            </button>
          </div>
        ) : null}
      </div>

      {post.location ? (
        <div style={styles.location}>
          <MapPin size={13} />
          {post.location}
        </div>
      ) : null}

      <div
        style={styles.mediaFrame}
        onDoubleClick={handleMediaDoubleTap}
        onPointerUp={handleMediaPointerUp}
        onClick={
          post.media_type === 'video'
            ? toggleVideo
            : undefined
        }
        role={
          post.media_type === 'video'
            ? 'button'
            : undefined
        }
        tabIndex={post.media_type === 'video' ? 0 : undefined}
        aria-label={
          post.media_type === 'video'
            ? videoPlaying
              ? 'Pause video'
              : 'Play video'
            : undefined
        }
        onKeyDown={(event) => {
          if (
            post.media_type === 'video' &&
            (event.key === 'Enter' || event.key === ' ')
          ) {
            event.preventDefault();
            toggleVideo();
          }
        }}
      >
        {mediaLoading ? (
          <div style={styles.mediaPlaceholder}>
            Loading media…
          </div>
        ) : null}

        {mediaError ? (
          <MediaFallback
            mediaType={post.media_type}
            onRetry={() => {
              setMediaError(false);
              setMediaLoading(true);
            }}
          />
        ) : post.media_type === 'video' ? (
          <video
            ref={videoRef}
            src={post.media_url}
            muted
            playsInline
            preload="metadata"
            onLoadedData={handleMediaLoad}
            onError={handleMediaError}
            style={{
              ...styles.media,
              opacity: mediaLoading ? 0 : 1,
            }}
          />
        ) : (
          <img
            src={post.media_url}
            alt={post.caption || `Post by ${displayName}`}
            loading="lazy"
            onLoad={handleMediaLoad}
            onError={handleMediaError}
            style={{
              ...styles.media,
              opacity: mediaLoading ? 0 : 1,
            }}
          />
        )}

        {post.media_type === 'video' && !videoPlaying ? (
          <span style={styles.playIndicator}>
            <Play size={23} fill="currentColor" />
          </span>
        ) : null}

        {heartVisible ? (
          <span
            aria-hidden="true"
            style={styles.heartOverlay}
          >
            <Heart size={78} fill="currentColor" />
          </span>
        ) : null}
      </div>

      {post.caption || hashtags.length ? (
        <div style={styles.captionBlock}>
          {post.caption ? (
            <p style={styles.caption}>
              <strong>@{username}</strong>{' '}
              {visibleCaption}
            </p>
          ) : null}

          {post.caption?.length > 180 ? (
            <button
              type="button"
              onClick={() =>
                setCaptionExpanded((value) => !value)
              }
              style={styles.expandButton}
            >
              {captionExpanded ? (
                <>
                  Show less <ChevronUp size={13} />
                </>
              ) : (
                <>
                  Show more <ChevronDown size={13} />
                </>
              )}
            </button>
          ) : null}

          {hashtags.length ? (
            <div style={styles.hashtags}>
              {hashtags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => showNotice(`#${tag} selected.`)}
                  style={styles.hashtag}
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={styles.actions}>
        <button
          type="button"
          onClick={handleLike}
          disabled={likePending}
          style={{
            ...styles.actionButton,
            color: liked ? '#ff6f9d' : '#dce5f8',
          }}
          aria-label={liked ? 'Unlike post' : 'Like post'}
          aria-pressed={liked}
        >
          <Heart
            size={19}
            fill={liked ? 'currentColor' : 'none'}
          />
          <span>{formatCount(likeCount)}</span>
        </button>

        <button
          type="button"
          onClick={handleOpenComments}
          style={styles.actionButton}
          aria-label="Open comments"
        >
          <MessageCircle size={19} />
          <span>{formatCount(commentCount)}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          style={styles.actionButton}
          aria-label="Share post"
        >
          <Share2 size={19} />
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={savePending}
          style={{
            ...styles.actionButton,
            marginLeft: 'auto',
            color: saved ? '#9deeff' : '#dce5f8',
          }}
          aria-label={saved ? 'Unsave post' : 'Save post'}
          aria-pressed={saved}
        >
          <Bookmark
            size={19}
            fill={saved ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {notice ? (
        <div role="status" style={styles.notice}>
          {notice}
        </div>
      ) : null}

      {commentsOpen ? (
        <CommentSheet
          post={post}
          comments={comments}
          loading={commentsLoading}
          currentUserId={null}
          commentText={commentText}
          submitting={commentSubmitting}
          deleting={deletingCommentId}
          onClose={() => setCommentsOpen(false)}
          onChange={setCommentText}
          onSubmit={handleSubmitComment}
          onDelete={handleDeleteComment}
        />
      ) : null}
    </article>
  );
}

export default memo(PostCard);

const styles = {
  card: {
    position: 'relative',
    marginBottom: '0.85rem',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.92)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
  },

  header: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.8rem',
  },

  avatar: {
    objectFit: 'cover',
    flexShrink: 0,
    border: '2px solid rgba(124,92,255,0.7)',
    borderRadius: '999px',
    boxShadow: '0 0 16px rgba(124,92,255,0.18)',
  },

  placeholderAvatar: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '2px solid rgba(124,92,255,0.55)',
    borderRadius: '999px',
    color: '#dce8ff',
    background:
      'linear-gradient(135deg, #1d2740, #342258)',
  },

  headerIdentity: {
    minWidth: 0,
    display: 'grid',
    gap: '0.12rem',
    flex: 1,
  },

  usernameLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    minWidth: 0,
  },

  fullName: {
    overflow: 'hidden',
    color: '#96a3bf',
    fontSize: '0.65rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  privateBadge: {
    padding: '0.18rem 0.32rem',
    borderRadius: '999px',
    color: '#ffd27d',
    background: 'rgba(255,210,125,0.12)',
    fontSize: '0.55rem',
    fontWeight: 800,
  },

  time: {
    flexShrink: 0,
    color: '#8290ad',
    fontSize: '0.62rem',
  },

  moreButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  },

  moreMenu: {
    position: 'absolute',
    top: '3.2rem',
    right: '0.7rem',
    zIndex: 10,
    minWidth: '9rem',
    padding: '0.35rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.8rem',
    background: 'rgba(20,26,42,0.98)',
    boxShadow: '0 16px 35px rgba(0,0,0,0.4)',
  },

  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.55rem',
    border: 0,
    borderRadius: '0.55rem',
    color: '#dce5f8',
    background: 'transparent',
    fontSize: '0.68rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0 0.8rem 0.65rem',
    color: '#91a0ba',
    fontSize: '0.66rem',
    fontWeight: 700,
  },

  mediaFrame: {
    position: 'relative',
    width: '100%',
    minHeight: '14rem',
    overflow: 'hidden',
    background: '#080b12',
    cursor: 'pointer',
    outline: 0,
  },

  media: {
    width: '100%',
    maxHeight: '38rem',
    display: 'block',
    objectFit: 'cover',
    transition: 'opacity 180ms ease',
  },

  mediaPlaceholder: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    display: 'grid',
    placeItems: 'center',
    color: '#91a0ba',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.12), rgba(77,215,255,0.06))',
    fontSize: '0.72rem',
  },

  mediaFallback: {
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.5rem',
    color: '#ffb1c8',
    background: '#111625',
    fontSize: '0.72rem',
  },

  retryButton: {
    padding: '0.4rem 0.65rem',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,0.06)',
    fontSize: '0.65rem',
    cursor: 'pointer',
  },

  playIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 2,
    width: '3.1rem',
    height: '3.1rem',
    display: 'grid',
    placeItems: 'center',
    transform: 'translate(-50%, -50%)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(5,8,15,0.55)',
    pointerEvents: 'none',
  },

  heartOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 3,
    display: 'grid',
    placeItems: 'center',
    transform: 'translate(-50%, -50%) scale(1)',
    color: '#ff6f9d',
    filter: 'drop-shadow(0 0 18px rgba(255,111,157,0.75))',
    animation: 'aarush-post-heart 850ms ease-out forwards',
    pointerEvents: 'none',
  },

  captionBlock: {
    padding: '0.7rem 0.8rem 0.25rem',
  },

  caption: {
    margin: 0,
    color: '#dce5f8',
    fontSize: '0.76rem',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
  },

  expandButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.18rem',
    padding: 0,
    border: 0,
    color: '#9deeff',
    background: 'transparent',
    fontSize: '0.66rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  hashtags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
    marginTop: '0.4rem',
  },

  hashtag: {
    padding: 0,
    border: 0,
    color: '#9deeff',
    background: 'transparent',
    fontSize: '0.68rem',
    cursor: 'pointer',
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0.45rem 0.65rem 0.7rem',
  },

  actionButton: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0 0.4rem',
    border: 0,
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'transparent',
    fontSize: '0.68rem',
    fontWeight: 800,
    cursor: 'pointer',
  },

  notice: {
    position: 'absolute',
    right: '0.75rem',
    bottom: '3.2rem',
    left: '0.75rem',
    zIndex: 20,
    padding: '0.65rem 0.75rem',
    border: '1px solid rgba(77,215,255,0.2)',
    borderRadius: '0.7rem',
    color: '#dff9ff',
    background: 'rgba(12,24,38,0.96)',
    fontSize: '0.68rem',
    textAlign: 'center',
  },

  sheetBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0.7rem',
    background: 'rgba(2,5,10,0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  commentSheet: {
    width: 'min(100%, 560px)',
    maxHeight: '82vh',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    overflow: 'hidden',
    padding: '0.85rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1.35rem 1.35rem 1rem 1rem',
    background:
      'linear-gradient(180deg, rgba(20,26,42,0.99), rgba(9,13,22,0.99))',
    boxShadow: '0 -20px 70px rgba(0,0,0,0.45)',
  },

  sheetHandle: {
    width: '2.8rem',
    height: '0.23rem',
    margin: '0 auto 0.7rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.2)',
  },

  sheetHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.7rem',
    paddingBottom: '0.65rem',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },

  sheetTitle: {
    margin: 0,
    fontSize: '0.95rem',
  },

  sheetSubtitle: {
    margin: '0.2rem 0 0',
    color: '#96a3bf',
    fontSize: '0.66rem',
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

  commentsList: {
    minHeight: '9rem',
    overflowY: 'auto',
    padding: '0.65rem 0',
  },

  commentsLoading: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '8rem',
    color: '#9deeff',
    fontSize: '0.72rem',
  },

  emptyComments: {
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '0.45rem',
    minHeight: '8rem',
    color: '#96a3bf',
    fontSize: '0.72rem',
  },

  commentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.55rem',
    padding: '0.55rem 0',
  },

  commentBody: {
    minWidth: 0,
    flex: 1,
  },

  commentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
  },

  commentMetaSpan: {
    color: '#8290ad',
    fontSize: '0.61rem',
  },

  commentText: {
    margin: '0.25rem 0 0',
    color: '#dce5f8',
    fontSize: '0.72rem',
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap',
  },

  commentDeleteButton: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,0.08)',
    cursor: 'pointer',
  },

  commentComposer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    paddingTop: '0.65rem',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },

  commentInput: {
    minWidth: 0,
    flex: 1,
    minHeight: '2.55rem',
    padding: '0 0.75rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '999px',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.72rem',
  },

  sendCommentButton: {
    width: '2.55rem',
    height: '2.55rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    cursor: 'pointer',
  },
};

if (typeof document !== 'undefined') {
  const styleId = 'aarush-post-card-animations';

  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes aarush-post-heart {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.35);
        }

        30% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.12);
        }

        75% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(0.98);
        }

        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(1.28);
        }
      }

      .aarush-post-card button:focus-visible,
      .aarush-post-card input:focus-visible,
      [role="button"]:focus-visible {
        outline: 2px solid #4dd7ff;
        outline-offset: 2px;
      }

      @media (prefers-reduced-motion: reduce) {
        .aarush-post-card * {
          animation-duration: 1ms !important;
          transition-duration: 1ms !important;
        }
      }
    `;

    document.head.appendChild(style);
  }
}