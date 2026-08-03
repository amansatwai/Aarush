export default function LikeButton({ liked, count, pending, onClick }) {
  return (
    <button
      type="button"
      className={`action-btn like-btn ${liked ? 'active' : ''} ${pending ? 'pending' : ''}`}
      onClick={onClick}
      disabled={pending}
      aria-label={liked ? 'Unlike post' : 'Like post'}
    >
      <span className={`like-icon ${liked ? 'liked' : ''}`}>♥</span>
      <span className="action-count">{count}</span>
    </button>
  );
}