import { useRef } from 'react';

export default function ImagePicker({ onPick, disabled, error, processing }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (disabled || processing) return;
    inputRef.current?.click();
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) onPick(file);
    event.target.value = '';
  };

  return (
    <div className="image-picker">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden-input"
        onChange={handleChange}
      />

      <button type="button" className="btn-secondary" onClick={handleClick} disabled={disabled || processing}>
        {processing ? 'Processing...' : 'Choose image'}
      </button>

      {error ? <div className="field-error">{error}</div> : null}
    </div>
  );
}