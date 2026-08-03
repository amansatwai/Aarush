import { useEffect, useMemo, useState } from 'react';
import { supabase, TABLES, mapProfileRow } from '../lib/supabase';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

export default function CommentModal({ post, user, open, onClose, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const title = useMemo(() => `Comments`, []);

  useEffect(() => {
    if (!open || !post?.id) return;

    let active = true;

    async function loadComments() {
      setLoading(true);
      setError('');

      try {
        const { data, error: queryError } = await supabase
          .from(TABLES.comments)
          .select(
            `
              id,
              post_id,
              user_id,
              text,
              created_at,
              profiles:profiles (
                id,
                username,
                full_name,
                avatar_url
              )
            `
          )
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });

        if (queryError) throw queryError;

        const mapped = (data || []).map((row) => {
          const author = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          return {
            ...row,
            username: author?.username || 'user',
            avatar_url: author?.avatar_url || '',
          };
        });

        if (active) setComments(mapped);
      } catch (err) {
        if (active) setError(err?.message || 'Failed to load comments.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadComments();

    return () => {
      active = false;
    };
  }, [open, post?.id]);

  useEffect(() => {
    if (!open || !post?.id) return;

    const channel = supabase
      .channel(`comments-${post.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLES.comments, filter: `post_id=eq.${post.id}` },
        async () => {
          const { data } = await supabase
            .from(TABLES.comments)
            .select(
              `
                id,
                post_id,
                user_id,
                text,
                created_at,
                profiles:profiles (
                  id,
                  username,
                  full_name,
                  avatar_url
                )
              `
            )
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });

          const mapped = (data || []).map((row) => {
            const author = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
            return {
              ...row,
              username: author?.username || 'user',
              avatar_url: author?.avatar_url || '',
            };
          });

          setComments(mapped);
          onCountChange?.(mapped.length);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, post?.id, onCountChange]);

  const handleAdd = async () => {
    const value = text.trim();
    if (!value || !user?.id) return;

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from(TABLES.comments).insert({
        post_id: post.id,
        user_id: user.id,
        text: value,
      });

      if (insertError) throw insertError;

      setText('');
      const nextCount = (post.comments_count || 0) + 1;
      onCountChange?.(nextCount);
    } catch (err) {
      setError(err?.message || 'Could not add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    setDeletingId(commentId);
    try {
      const { error: deleteError } = await supabase
        .from(TABLES.comments)
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      const nextCount = Math.max(0, (post.comments_count || 0) - 1);
      onCountChange?.(nextCount);
    } catch (err) {
      setError(err?.message || 'Could not delete comment.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="comment-modal-backdrop" onClick={onClose}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal-header">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="comment-modal-body">
          {loading ? <div className="comments-state">Loading comments...</div> : null}
          {error ? <div className="comments-state error">{error}</div> : null}

          {!loading && !error && comments.length === 0 ? (
            <div className="comments-state">No comments yet. Be the first to comment.</div>
          ) : null}

          <div className="comments-list">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isMine={comment.user_id === user?.id}
                onDelete={handleDelete}
                deleting={deletingId === comment.id}
              />
            ))}
          </div>
        </div>

        <div className="comment-modal-footer">
          <CommentInput value={text} onChange={setText} onSubmit={handleAdd} submitting={submitting} />
        </div>
      </div>
    </div>
  );
}