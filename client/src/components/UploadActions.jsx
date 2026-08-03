export default function UploadActions({
  onCancel,
  onUpload,
  disabled = false,
  uploading = false,
}) {
  return (
    <div className="actions">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onCancel}
        disabled={disabled || uploading}
      >
        Cancel
      </button>

      <button
        type="button"
        className="btn btn-primary"
        onClick={onUpload}
        disabled={disabled || uploading}
      >
        {uploading ? "Uploading..." : "Upload Post"}
      </button>
    </div>
  );
}