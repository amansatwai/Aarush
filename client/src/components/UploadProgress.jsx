export default function UploadProgress({ stage, progress, error, success }) {
  if (!stage && !error && !success) return null;

  return (
    <div className={`upload-progress ${error ? 'error' : success ? 'success' : ''}`}>
      <div className="upload-progress-row">
        <span>{stage || (success ? 'Upload complete' : 'Uploading...')}</span>
        {!error && !success ? <span>{progress}%</span> : null}
      </div>

      {!error && !success ? (
        <div className="upload-progress-track">
          <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      {error ? <div className="field-error">{error}</div> : null}
      {success ? <div className="success-text">{success}</div> : null}
    </div>
  );
}