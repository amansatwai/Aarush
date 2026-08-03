export default function SaveButton({ saved, onClick, pending }) {
  return (
    <button
      type="button"
      className={`action-btn save-btn ${saved ? 'active' : ''} ${pending ? 'pending' : ''}`}
      onClick={onClick}
      disabled={pending}
      aria-label={saved ? 'Unsave post' : 'Save post'}
    >
      <span>{saved ? '⟡' : '⊡'}</span>
    </button>
  );
}