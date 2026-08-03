export default function ShareButton({ onClick, pending }) {
  return (
    <button
      type="button"
      className={`action-btn ${pending ? 'pending' : ''}`}
      onClick={onClick}
      disabled={pending}
      aria-label="Share post"
    >
      <span>↗</span>
    </button>
  );
}