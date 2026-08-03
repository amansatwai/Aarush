export default function CommentItem({ comment, isMine, onDelete, deleting }) {
  return (
    <div className="comment-item">
      <img
        src={comment.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop'}
        alt={comment.username}
        className="comment-avatar"
      />
      <div className="comment-body">
        <div className="comment-topline">
          <div className="comment-author">{comment.username}</div>
          <div className="comment-time">
            {new Date(comment.created_at).toLocaleString()}
          </div>
        </div>
        <div className="comment-text">{comment.text}</div>
      </div>
      {isMine ? (
        <button
          type="button"
          className="comment-delete"
          onClick={() => onDelete(comment.id)}
          disabled={deleting}
        >
          Delete
        </button>
      ) : null}
    </div>
  );
}