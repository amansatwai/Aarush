export default function ScreenHeader({
  title,
  onBack,
  rightAction,
  rightLabel = '',
}) {
  return (
    <header className="screen-header">
      <div className="screen-header-left">
        <button
          type="button"
          className="back-btn"
          onClick={onBack}
          aria-label="Back"
          title="Back"
        >
          ←
        </button>
      </div>

      <div className="screen-header-center">
        <h1 className="screen-header-title">{title}</h1>
      </div>

      <div className="screen-header-right">
        {rightAction ? (
          <button
            type="button"
            className="header-action-btn"
            onClick={rightAction}
            aria-label={rightLabel || 'Action'}
            title={rightLabel || 'Action'}
          >
            ⋯
          </button>
        ) : (
          <span className="screen-header-spacer" />
        )}
      </div>
    </header>
  );
}