export default function ImagePreview({ file, previewUrl, onRemove }) {
  if (!file && !previewUrl) {
    return (
      <div className="upload-placeholder">
        <div className="upload-icon">＋</div>
        <p>Pick an image to upload</p>
      </div>
    );
  }

  return (
    <div className="image-preview-card">
      <div className="image-preview-wrap">
        <img src={previewUrl} alt={file?.name || 'Selected preview'} className="image-preview" />
      </div>

      <div className="image-preview-meta">
        <div>
          <strong>{file?.name || 'Selected image'}</strong>
          <span>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ''}</span>
        </div>

        <button type="button" className="btn-secondary" onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}