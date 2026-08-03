export default function CommentInput({ value, onChange, onSubmit, submitting }) {
  return (
    <form
      className="comment-input-row"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add a comment..."
        maxLength={500}
        disabled={submitting}
      />
      <button type="submit" className="btn-primary" disabled={submitting || !value.trim()}>
        {submitting ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}