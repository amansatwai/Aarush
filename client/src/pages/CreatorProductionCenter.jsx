import { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Film,
  Image,
  Play,
  RefreshCw,
  Sparkles,
  Upload,
  Video,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import useVideoEditor from '../hooks/useVideoEditor';
import {
  createProject,
  exportVideo,
  saveProject,
} from '../utils/videoEditingEngine';
import {
  enhanceVideoQuality,
  generateAutoCaptions,
  generateThumbnail,
  stabilizeVideo,
} from '../utils/aiMediaEnhancementEngine';

function isGuestMode() {
  if (typeof window === 'undefined') return false;

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

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
      className="production-action-row"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="production-action-icon">
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

export default function CreatorProductionCenter() {
  const navigate = useNavigate();
  const guest = isGuestMode();

  const {
    projects,
    editor,
    enhancement,
    rendering,
    loading,
    error,
    refresh,
  } = useVideoEditor();

  const [file, setFile] = useState(null);
  const [activeProject, setActiveProject] =
    useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] =
    useState('');

  const runAction = async (
    action,
    message
  ) => {
    try {
      setBusy(true);
      setActionError('');
      await action();
      setNotice(message);
      await refresh();
    } catch (actionException) {
      setActionError(
        actionException?.message ||
          'Unable to complete production action.'
      );
    } finally {
      setBusy(false);
    }
  };

  const createNewProject = () => {
    runAction(
      async () => {
        const project = await createProject({
          name: 'New creator project',
          settings: {
            preset: 'Reel',
            aspect_ratio: '9:16',
            resolution: '1080p',
            frame_rate: 30,
          },
        });

        setActiveProject(project);
      },
      'Production project created.'
    );
  };

  const handleFile = (event) => {
    const selected = event.target.files?.[0];

    if (selected) {
      setFile(selected);
      setNotice('Media selected for production.');
    }
  };

  const enhance = () => {
    if (!file) {
      setActionError('Select a video first.');
      return;
    }

    runAction(
      () => enhanceVideoQuality(file),
      'AI enhancement prepared.'
    );
  };

  const captions = () => {
    if (!file) {
      setActionError('Select a video first.');
      return;
    }

    runAction(
      () => generateAutoCaptions(file),
      'Auto captions prepared.'
    );
  };

  const stabilize = () => {
    if (!file) {
      setActionError('Select a video first.');
      return;
    }

    runAction(
      () => stabilizeVideo(file),
      'Video stabilization prepared.'
    );
  };

  const thumbnail = () => {
    if (!file) {
      setActionError('Select a video first.');
      return;
    }

    runAction(
      () => generateThumbnail(file),
      'Thumbnail generated.'
    );
  };

  const exportProject = () => {
    if (!activeProject) {
      setActionError('Create or open a project first.');
      return;
    }

    if (guest) {
      setActionError(
        'Guests can create local projects but cannot cloud-render exports.'
      );
      return;
    }

    runAction(
      () =>
        exportVideo(activeProject.id, {
          preset: 'Reel',
          resolution: '1080p',
          bitrate: 'adaptive',
          audio_quality: 'high',
          watermark: false,
        }),
      'Video export queued.'
    );
  };

  if (loading) {
    return (
      <div className="social-page production-page">
        <TopBar />

        <main className="production-content">
          <div className="production-loading-header" />
          <div className="production-loading-card" />
          <div className="production-loading-card" />
        </main>

        <BottomNav />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="social-page production-page">
      <TopBar />

      <main className="production-content">
        <header className="production-header">
          <button
            type="button"
            className="production-icon-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>

          <div>
            <p className="production-eyebrow">
              Creator tools
            </p>
            <h1>Production Center</h1>
          </div>

          <button
            type="button"
            className="production-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="Refresh projects"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        {error || actionError ? (
          <div className="production-error" role="alert">
            <span>{error || actionError}</span>
          </div>
        ) : null}

        {notice ? (
          <div className="production-notice" role="status">
            <Check size={16} />
            <span>{notice}</span>
          </div>
        ) : null}

        <section className="production-status-card">
          <div className="production-status-icon">
            <Film size={27} />
          </div>

          <div className="production-status-copy">
            <p>Editing status</p>
            <h2>
              {editor?.enabled
                ? 'Production ready'
                : 'Initializing'}
            </h2>
            <span>
              {projects.length} projects
              {' · '}
              Render {rendering?.status || 'idle'}
            </span>
          </div>

          <button
            type="button"
            className="production-primary-button"
            onClick={createNewProject}
            disabled={busy}
          >
            <PlusIcon />
            New project
          </button>
        </section>

        <section className="production-section">
          <div className="production-section-heading">
            <Film size={17} />
            <div>
              <h2>Editing projects</h2>
              <p>
                Prepare timeline, clips, tracks, overlays, filters, and effects.
              </p>
            </div>
          </div>

          <div className="production-card">
            <label className="production-file-picker">
              <Upload size={18} />
              <span>
                {file
                  ? file.name
                  : 'Choose media for local editing'}
              </span>
              <input
                type="file"
                accept="video/*,audio/*,image/*"
                onChange={handleFile}
              />
            </label>

            <ActionRow
              icon={<PlusIcon />}
              title="New project"
              description="Create a local or cloud editing project."
              onClick={createNewProject}
              disabled={busy}
            />

            {projects.slice(0, 8).map((project) => (
              <button
                type="button"
                className="production-project-row"
                onClick={() =>
                  setActiveProject(project)
                }
                key={project.id}
              >
                <Film size={17} />
                <span>
                  <strong>{project.name}</strong>
                  <small>
                    {project.status}
                    {' · '}
                    {project.settings?.preset ||
                      'Reel'}
                  </small>
                </span>
                <ChevronRight size={17} />
              </button>
            ))}

            <ActionRow
              icon={<Play size={18} />}
              title="Export video"
              description={
                guest
                  ? 'Cloud rendering requires sign in.'
                  : 'Queue the current project for rendering.'
              }
              onClick={exportProject}
              disabled={busy || !activeProject}
            />
          </div>
        </section>

        <section className="production-section">
          <div className="production-section-heading">
            <Sparkles size={17} />
            <div>
              <h2>AI enhancements</h2>
              <p>
                Prepare quality, stabilization, captions, and thumbnails.
              </p>
            </div>
          </div>

          <div className="production-card">
            <ActionRow
              icon={<Sparkles size={18} />}
              title="Auto enhance"
              description="Improve quality, color, contrast, and sharpness."
              onClick={enhance}
              disabled={busy || !file}
            />

            <ActionRow
              icon={<RefreshCw size={18} />}
              title="Stabilize video"
              description="Prepare motion stabilization processing."
              onClick={stabilize}
              disabled={busy || !file}
            />

            <ActionRow
              icon={<Sparkles size={18} />}
              title="Generate captions"
              description="Prepare local or cloud transcription."
              onClick={captions}
              disabled={busy || !file}
            />

            <ActionRow
              icon={<Image size={18} />}
              title="Generate thumbnail"
              description="Create a preview image for the video."
              onClick={thumbnail}
              disabled={busy || !file}
            />
          </div>
        </section>

        <section className="production-section">
          <div className="production-section-heading">
            <SettingsIcon />
            <div>
              <h2>Production tools</h2>
              <p>
                Timeline editing and creator workflow preparation.
              </p>
            </div>
          </div>

          <div className="production-card">
            {[
              'Timeline editor',
              'Multi-track editing',
              'Transitions and effects',
              'Text and sticker overlays',
              'Color correction',
              'Audio normalization',
              'Speed and reverse',
              'Export presets',
            ].map((tool) => (
              <div
                className="production-feature"
                key={tool}
              >
                <Check size={15} />
                <span>{tool}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="production-section">
          <div className="production-section-heading">
            <RefreshCw size={17} />
            <div>
              <h2>Rendering queue</h2>
              <p>
                Track pending, rendering, encoding, upload, and failed jobs.
              </p>
            </div>
          </div>

          <div className="production-queue-grid">
            {[
              ['Pending', 'Ready'],
              ['Rendering', 'Prepared'],
              ['Encoding', 'Prepared'],
              ['Uploading', 'Prepared'],
              ['Completed', rendering?.status || 'Idle'],
              ['Failed', 'Monitored'],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <p className="production-footer">
          Browser processing is prepared for local editing.
          Production rendering, transcoding, AI models,
          storage, and export delivery should run through
          trusted server-side infrastructure.
        </p>
      </main>

      <BottomNav />

      <style>{styles}</style>
    </div>
  );
}

function PlusIcon() {
  return <Plus size={17} />;
}

function SettingsIcon() {
  return <Settings2 size={17} />;
}

const styles = `
  .production-page {
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

  .production-content {
    width: min(100%, 900px);
    margin: 0 auto;
    padding: 1rem 1rem 7rem;
  }

  .production-header {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2.5rem;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .production-header h1 {
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.03em;
  }

  .production-eyebrow {
    margin: 0 0 0.2rem;
    color: #8d9abb;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .production-icon-button {
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

  .production-icon-button:last-child {
    justify-self: end;
  }

  .production-error,
  .production-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
    font-size: 0.75rem;
  }

  .production-error {
    color: #ffc2d0;
    border: 1px solid rgba(255,91,132,0.25);
    background: rgba(255,91,132,0.08);
  }

  .production-notice {
    color: #c9f9ff;
    border: 1px solid rgba(77,215,255,0.2);
    background: rgba(77,215,255,0.08);
  }

  .production-status-card,
  .production-card,
  .production-queue-grid > div {
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(17,22,36,0.72);
    box-shadow: 0 20px 55px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .production-status-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .production-status-icon {
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

  .production-status-copy {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .production-status-copy p {
    margin: 0;
    color: #8491ad;
    font-size: 0.7rem;
  }

  .production-status-copy h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .production-status-copy span {
    color: #98a5c2;
    font-size: 0.7rem;
  }

  .production-primary-button {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
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

  .production-primary-button:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .production-section {
    margin-top: 1.3rem;
  }

  .production-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0 0 0.6rem 0.2rem;
    color: #b8a9ff;
  }

  .production-section-heading h2 {
    margin: 0;
    color: #edf2ff;
    font-size: 0.9rem;
  }

  .production-section-heading p {
    margin: 0.2rem 0 0;
    color: #75829e;
    font-size: 0.7rem;
  }

  .production-card {
    overflow: hidden;
    border-radius: 1.2rem;
  }

  .production-file-picker {
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

  .production-file-picker span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .production-file-picker input {
    display: none;
  }

  .production-action-row,
  .production-project-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    min-height: 4.1rem;
    padding: 0.8rem 0.9rem;
    border: 0;
    border-top: 1px solid rgba(255,255,255,0.07);
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .production-action-row:disabled {
    opacity: 0.55;
    cursor: wait;
  }

  .production-action-icon {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.75rem;
    color: #c8bfff;
    background: rgba(124,92,255,0.13);
  }

  .production-action-row > span,
  .production-project-row > span {
    min-width: 0;
    flex: 1;
    display: grid;
    gap: 0.2rem;
  }

  .production-action-row strong,
  .production-project-row strong {
    color: #edf2ff;
    font-size: 0.78rem;
  }

  .production-action-row small,
  .production-project-row small {
    color: #8491ad;
    font-size: 0.68rem;
  }

  .production-project-row > svg {
    color: #b8a9ff;
  }

  .production-feature {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 3rem;
    padding: 0.7rem 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.07);
    color: #dce5f7;
    font-size: 0.7rem;
  }

  .production-feature svg {
    color: #55e6a5;
  }

  .production-queue-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
  }

  .production-queue-grid > div {
    display: grid;
    gap: 0.25rem;
    padding: 0.7rem;
    border-radius: 0.85rem;
  }

  .production-queue-grid span {
    color: #8491ad;
    font-size: 0.63rem;
  }

  .production-queue-grid strong {
    color: #edf2ff;
    font-size: 0.72rem;
  }

  .production-footer {
    margin: 1.25rem 0 0;
    color: #697691;
    font-size: 0.7rem;
    line-height: 1.5;
    text-align: center;
  }

  .production-loading-header,
  .production-loading-card {
    border-radius: 1rem;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.11),
      rgba(255,255,255,0.05)
    );
    background-size: 220% 100%;
    animation: production-skeleton 1.4s infinite;
  }

  .production-loading-header {
    width: 14rem;
    height: 2.8rem;
    margin-bottom: 1rem;
  }

  .production-loading-card {
    height: 17rem;
    margin-top: 1rem;
  }

  @keyframes production-skeleton {
    to {
      background-position: -220% 0;
    }
  }

  @media (max-width: 700px) {
    .production-queue-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 560px) {
    .production-content {
      padding-right: 0.75rem;
      padding-left: 0.75rem;
    }

    .production-status-card {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .production-primary-button {
      margin-left: auto;
    }
  }
`;