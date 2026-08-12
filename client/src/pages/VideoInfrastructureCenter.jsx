import { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Film,
  Image,
  RefreshCw,
  Settings2,
  Sparkles,
  Upload,
  Video,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useVideoInfrastructure from '../hooks/useVideoInfrastructure';
import {
  compressVideo,
  estimateProcessingTime,
  extractMetadata,
  generateThumbnail,
  optimizeVideo,
  processVideo,
} from '../utils/mediaProcessingEngine';
import {
  enableAutoQuality,
  selectQuality,
} from '../utils/videoInfrastructureEngine';

function ActionRow({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className="video-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="video-action-icon">
        {icon}
      </div>

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <ChevronRight size={18} />
    </button>
  );
}

export default function VideoInfrastructureCenter() {
  const navigate = useNavigate();
  const {
    streaming,
    processing,
    loading,
    error,
    refresh,
  } = useVideoInfrastructure();

  const [file, setFile] = useState(null);
  const [metadata, setMetadata] =
    useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const handleFile = (event) => {
    const selected = event.target.files?.[0];

    if (selected) {
      setFile(selected);
      setNotice('Video selected for local analysis.');
    }
  };

  const runAction = async (
    action,
    message
  ) => {
    if (!file) {
      setActionError('Select a video file first.');
      return;
    }

    try {
      setBusy(true);
      setActionError('');
      await action(file);
      setNotice(message);
      await refresh();
    } catch (actionException) {
      setActionError(
        actionException?.message ||
          'Unable to process video.'
      );
    } finally {
      setBusy(false);
    }
  };

  const analyzeVideo = async () => {
    if (!file) {
      setActionError('Select a video file first.');
      return;
    }

    try {
      setBusy(true);
      setActionError('');

      const result = await extractMetadata(file);
      setMetadata(result);
      setNotice('Video metadata extracted.');
    } catch (metadataError) {
      setActionError(
        metadataError?.message ||
          'Unable to analyze video.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="social-page video-page">
        <TopBar />

        <main className="video-content">
          <div className="video-loading-header" />
          <div className="video-loading-card" />
          <div className="video-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page video-page">
      <TopBar />

      <main className="video-content">
        <header className="video-header">
          <button
            type="button"
            className="video-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="video-eyebrow">
              Media infrastructure
            </p>
            <h1>Video Infrastructure</h1>
          </div>

          <button
            type="button"
            className="video-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh media status"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="video-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="video-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="video-status-card">
          <div className="video-status-icon">
            <Video size={27} />
          </div>

          <div className="video-status-copy">
            <p>Streaming status</p>
            <h2>
              {streaming?.status || 'Ready'}
            </h2>
            <span>
              {streaming?.auto_quality
                ? 'Adaptive quality enabled'
                : `Manual quality: ${
                    streaming?.quality || 'auto'
                  }`}
            </span>
          </div>

          <button
            type="button"
            className="video-primary-button"
            onClick={refresh}
            disabled={busy}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </section>

        <section className="video-section">
          <div className="video-section-heading">
            <Upload size={17} />
            <div>
              <h2>Media processing</h2>
              <p>
                Analyze, optimize, compress, and generate thumbnails locally.
              </p>
            </div>
          </div>

          <div className="video-card">
            <label className="video-file-picker">
              <Upload size={18} />
              <span>
                {file
                  ? file.name
                  : 'Choose a video file'}
              </span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFile}
              />
            </label>

            <ActionRow
              icon={<Settings2 size={18} />}
              title="Analyze video"
              description="Extract duration, resolution, format, and orientation."
              onClick={analyzeVideo}
              disabled={busy || !file}
            />

            <ActionRow
              icon={<Sparkles size={18} />}
              title="Process video"
              description="Prepare metadata and thumbnail processing."
              onClick={() =>
                runAction(
                  (selected) =>
                    processVideo(selected),
                  'Video processing completed.'
                )
              }
              disabled={busy || !file}
            />

            <ActionRow
              icon={<Sparkles size={18} />}
              title="Optimize video"
              description="Prepare adaptive, CDN, and transcoding outputs."
              onClick={() =>
                runAction(
                  (selected) =>
                    optimizeVideo(selected),
                  'Video optimization prepared.'
                )
              }
              disabled={busy || !file}
            />

            <ActionRow
              icon={<Film size={18} />}
              title="Compress video"
              description="Estimate an optimized quality rendition."
              onClick={() =>
                runAction(
                  (selected) =>
                    compressVideo(selected),
                  'Video compression prepared.'
                )
              }
              disabled={busy || !file}
            />

            <ActionRow
              icon={<Image size={18} />}
              title="Generate thumbnail"
              description="Create a preview image from the selected video."
              onClick={() =>
                runAction(
                  (selected) =>
                    generateThumbnail(selected),
                  'Thumbnail generated.'
                )
              }
              disabled={busy || !file}
            />
          </div>
        </section>

        {metadata ? (
          <section className="video-section">
            <div className="video-section-heading">
              <Settings2 size={17} />
              <div>
                <h2>Video metadata</h2>
                <p>
                  Extracted locally from the selected file.
                </p>
              </div>
            </div>

            <div className="video-metadata-grid">
              {[
                ['Duration', `${Math.round(metadata.duration)}s`],
                ['Resolution', `${metadata.width}×${metadata.height}`],
                ['Format', metadata.mime_type],
                ['Aspect ratio', metadata.aspect_ratio?.toFixed(2)],
                ['Orientation', metadata.orientation],
                ['File size', `${Math.round(metadata.file_size / 1024 / 1024)} MB`],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value || 'Unknown'}</strong>
                </div>
              ))}
            </div>

            <p className="video-processing-time">
              Estimated processing time:{' '}
              {estimateProcessingTime(file).seconds}s
            </p>
          </section>
        ) : null}

        <section className="video-section">
          <div className="video-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Adaptive quality</h2>
              <p>
                Network-aware and battery-aware playback preparation.
              </p>
            </div>
          </div>

          <div className="video-card">
            <div className="video-quality-row">
              {[
                '144p',
                '240p',
                '360p',
                '480p',
                '720p',
                '1080p',
                '1440p',
                '4K',
              ].map((quality) => (
                <button
                  type="button"
                  onClick={() => {
                    selectQuality(quality);
                    setNotice(
                      `Quality selected: ${quality}`
                    );
                  }}
                  key={quality}
                >
                  {quality}
                </button>
              ))}
            </div>

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Enable auto quality"
              description="Switch quality based on network and device conditions."
              onClick={() => {
                enableAutoQuality();
                setNotice('Auto quality enabled.');
              }}
              disabled={busy}
            />
          </div>
        </section>

        <section className="video-section">
          <div className="video-section-heading">
            <DatabaseIcon />
            <div>
              <h2>Processing queue</h2>
              <p>
                Media processing pipeline status.
              </p>
            </div>
          </div>

          <div className="video-queue-grid">
            {[
              ['Pending', 'Ready'],
              ['Processing', processing?.status || 'Idle'],
              ['Optimizing', 'Prepared'],
              ['Compressing', 'Prepared'],
              ['Thumbnail', 'Available'],
              ['Completed', 'Ready'],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <p className="video-footer">
          Browser processing is prepared for local analysis.
          Production transcoding, CDN delivery, media storage,
          and large-scale processing should run server-side.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

function DatabaseIcon() {
  return <Film size={17} />;
}

const styles = `
  .video-page {
    min-height: 100vh;
    color: #f4f7ff;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(124,92,255,0.2),
        transparent 35%
      ),
      radial-gradient(
        circle at 100% 18%,
        rgba(77,215,255,0.1),
        transparent 30%
      ),
      #080b13;
  }

  .video-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .video-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .video-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .video-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .video-icon-button {
    width: 2.5rem;
    height: 2.5rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0.9rem;
    color: #eaf0ff;
    background: rgba(255,255,255,0.06);
    cursor: pointer;
  }

  .video-icon-button:last-child {
    justify-self: end;
  }

  .video-error,
  .video-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .video-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .video-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .video-status-card,
  .video-card,
  .video-metadata-grid > div,
  .video-queue-grid > div {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .video-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .video-status-icon {
    width: 3.3rem;
    height: 3.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 1rem;
    color: #fff;
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
  }

  .video-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .video-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .video-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .video-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .video-primary-button {
    min-height: 2.35rem;
    padding: 0.55rem 0.75rem;
    border: 0;
    border-radius: 999px;
    color: #fff;
    background: linear-gradient(
      135deg,
      #7c5cff,
      #4dd7ff
    );
    font-size: 0.7rem;
    font-weight: 850;
    cursor: pointer;
  }

  .video-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .video-section {
    margin-top: 1.3rem;
  }

  .video-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .video-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .video-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .video-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .video-file-picker {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 3rem;
    margin: 0.85rem;
    padding: 0 0.75rem;
    border: 1px dashed rgba(124,92,255,0.4);
    border-radius: 0.8rem;
    color: #c9c0ff;
    font-size: 0.72rem;
    cursor: pointer;
  }

  .video-file-picker span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .video-file-picker input {
    display: none;
  }

  .video-action-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    min-height: 4.3rem;
    padding: 0.8rem 0.9rem;
    border: 0;
    border-top: 1px solid rgba(255,255,255,0.07);
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .video-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .video-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .video-action-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .video-action-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .video-action-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .video-action-row > svg {
    color: #7483a1;
  }

  .video-metadata-grid,
  .video-queue-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
  }

  .video-metadata-grid > div,
  .video-queue-grid > div {
    display: grid;
    gap: 0.25rem;
    padding: 0.7rem;
    border-radius: 0.85rem;
  }

  .video-metadata-grid span,
  .video-queue-grid span {
    color: #8491ad;
    font-size: 0.63rem;
  }

  .video-metadata-grid strong,
  .video-queue-grid strong {
    overflow: hidden;
    color: #edf2ff;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.72rem;
  }

  .video-processing-time {
    margin: 0.65rem 0 0;
    color: #8491ad;
    font-size: 0.68rem;
  }

  .video-quality-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    padding: 0.85rem;
  }

  .video-quality-row button {
    min-height: 2rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid rgba(124,92,255,0.28);
    border-radius: 999px;
    color: #dcd5ff;
    background: rgba(124,92,255,0.1);
    font-size: 0.66rem;
    font-weight: 800;
    cursor: pointer;
  }

  .video-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .video-loading-header,
  .video-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: video-skeleton 1.4s infinite;
  }

  .video-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .video-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes video-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .video-metadata-grid,
    .video-queue-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .video-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .video-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .video-primary-button {
      margin-left: auto;
    }
  }
`;liveStreamingEngine.js