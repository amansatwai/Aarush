export default function CommentButton({ count, onClick, pending }) {
  return (
    <button
      type="button"
      className={`action-btn ${pending ? 'pending' : ''}`}
      onClick={onClick}
      disabled={pending}
      aria-label="Open comments"
    >
      <span>◌</span>
      <span className="action-count">{count}</span>
    </button>
  );
}