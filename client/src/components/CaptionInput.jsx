export default function CaptionInput({
  value,
  onChange,
  maxLength = 2200,
  disabled = false,
}) {
  return (
    <div className="field">
      <label htmlFor="caption">Caption</label>
      <textarea
        id="caption"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a caption..."
        rows={4}
        maxLength={maxLength}
        disabled={disabled}
      />
      <div className="field-help">
        {value.length}/{maxLength}
      </div>
    </div>
  );
}