export default function VerifiedBadge({ size = 16, title = 'Verified Account', className = '' }) {
  return (
    <span
      className={`verified-badge ${className}`.trim()}
      title={title}
      aria-label={title}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M9.2 16.2 5.6 12.6l1.8-1.8 1.8 1.8 7.2-7.2 1.8 1.8-9 9Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}