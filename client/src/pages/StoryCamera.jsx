import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  ChevronLeft,
  CircleHelp,
  FileVideo,
  Image as ImageIcon,
  Lightbulb,
  LoaderCircle,
  RefreshCw,
  Settings,
  Video,
  X,
  Zap,
  ZapOff,
} from 'lucide-react';

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const LONG_PRESS_DELAY = 260;
const RECORDING_TIMESLICE = 250;

const IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

const CAMERA_ERRORS = {
  denied: {
    title: 'Camera permission required',
    message:
      'Allow camera access in your browser settings to create an Aarush Story.',
  },
  unavailable: {
    title: 'Camera unavailable',
    message:
      'No compatible camera was found on this device.',
  },
  insecure: {
    title: 'Secure connection required',
    message:
      'Camera access requires HTTPS or localhost.',
  },
  failed: {
    title: 'Camera could not start',
    message:
      'Aarush could not access the camera. Close other camera apps and try again.',
  },
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function getCameraError(error) {
  if (!isBrowser()) {
    return CAMERA_ERRORS.failed;
  }

  if (!window.isSecureContext) {
    return CAMERA_ERRORS.insecure;
  }

  if (
    error?.name === 'NotAllowedError' ||
    error?.name === 'PermissionDeniedError'
  ) {
    return CAMERA_ERRORS.denied;
  }

  if (
    error?.name === 'NotFoundError' ||
    error?.name === 'DevicesNotFoundError'
  ) {
    return CAMERA_ERRORS.unavailable;
  }

  return CAMERA_ERRORS.failed;
}

function getSupportedRecordingMimeType() {
  if (
    typeof window === 'undefined' ||
    typeof window.MediaRecorder === 'undefined'
  ) {
    return '';
  }

  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];

  return (
    candidates.find((type) =>
      window.MediaRecorder.isTypeSupported(type)
    ) || ''
  );
}

function extensionForMimeType(type) {
  if (type.includes('mp4')) return 'mp4';
  if (type.includes('quicktime')) return 'mov';
  return 'webm';
}

function fileTypeFromInput(file) {
  if (!file) return null;

  const type = String(file.type || '').toLowerCase();
  const name = String(file.name || '').toLowerCase();

  if (
    IMAGE_TYPES.includes(type) ||
    /\.(jpe?g|png|webp)$/i.test(name)
  ) {
    return 'image';
  }

  if (
    VIDEO_TYPES.includes(type) ||
    /\.(mp4|mov|webm)$/i.test(name)
  ) {
    return 'video';
  }

  return null;
}

export default function StoryCamera() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const holdTimerRef = useRef(null);
  const isRecordingRef = useRef(false);
  const mountedRef = useRef(true);
  const currentDeviceIdRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraLoading, setCameraLoading] =
    useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] =
    useState('environment');
  const [flashEnabled, setFlashEnabled] =
    useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] =
    useState(0);
  const [capturePressed, setCapturePressed] =
    useState(false);
  const [switchingCamera, setSwitchingCamera] =
    useState(false);
  const [fileError, setFileError] = useState('');

  const recordingStartedAtRef = useRef(0);
  const recordingIntervalRef = useRef(null);

  const stopStream = useCallback(() => {
    const stream = streamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // A stopped track is safe to ignore.
        }
      });
    }

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const attachStream = useCallback(async (stream) => {
    if (!mountedRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    streamRef.current = stream;
    currentDeviceIdRef.current =
      stream.getVideoTracks()[0]?.getSettings?.()
        ?.deviceId || null;

    if (!videoRef.current) return;

    videoRef.current.srcObject = stream;

    try {
      await videoRef.current.play();
    } catch {
      // Autoplay can require a user gesture on some browsers.
    }

    if (mountedRef.current) {
      setCameraReady(true);
      setCameraLoading(false);
    }
  }, []);

  const initializeCamera = useCallback(
    async (nextFacingMode = facingMode) => {
      if (!isBrowser()) return;

      if (
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !==
          'function'
      ) {
        setCameraError(CAMERA_ERRORS.unavailable);
        setCameraLoading(false);
        return;
      }

      setCameraLoading(true);
      setCameraError(null);
      setCameraReady(false);

      stopStream();

      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: {
                ideal: nextFacingMode,
              },
              width: {
                ideal: 1920,
              },
              height: {
                ideal: 1080,
              },
            },
          });

        await attachStream(stream);
      } catch (firstError) {
        if (
          nextFacingMode !== 'user' &&
          mountedRef.current
        ) {
          try {
            const fallbackStream =
              await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: true,
              });

            await attachStream(fallbackStream);
            return;
          } catch (fallbackError) {
            if (mountedRef.current) {
              setCameraError(getCameraError(fallbackError));
              setCameraLoading(false);
            }
            return;
          }
        }

        if (mountedRef.current) {
          setCameraError(getCameraError(firstError));
          setCameraLoading(false);
        }
      }
    },
    [attachStream, facingMode, stopStream]
  );

  useEffect(() => {
    mountedRef.current = true;
    initializeCamera('environment');

    return () => {
      mountedRef.current = false;

      if (holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current);
      }

      if (recordingIntervalRef.current) {
        window.clearInterval(
          recordingIntervalRef.current
        );
      }

      if (
        recorderRef.current &&
        recorderRef.current.state !== 'inactive'
      ) {
        try {
          recorderRef.current.stop();
        } catch {
          // Recorder cleanup is best effort.
        }
      }

      stopStream();
    };
  }, [initializeCamera, stopStream]);

  const navigateToEditor = useCallback(
    (media) => {
      if (!media?.url || !mountedRef.current) return;

      stopStream();

      navigate('/story-editor', {
        state: {
          media,
        },
      });
    },
    [navigate, stopStream]
  );

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      !video ||
      !canvas ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      setFileError('Camera preview is not ready.');
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas is unavailable.');
      }

      if (facingMode === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob || !mountedRef.current) {
            setFileError('Photo capture failed.');
            return;
          }

          const url = URL.createObjectURL(blob);

          navigateToEditor({
            type: 'image',
            url,
            file: new File(
              [blob],
              `aarush-story-${Date.now()}.jpg`,
              {
                type: 'image/jpeg',
              }
            ),
          });
        },
        'image/jpeg',
        0.92
      );
    } catch {
      setFileError('Photo capture failed.');
    }
  }, [facingMode, navigateToEditor]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;

    if (!recorder) return;

    if (recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        setRecording(false);
        isRecordingRef.current = false;
      }
    }

    if (recordingIntervalRef.current) {
      window.clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;

    if (
      !stream ||
      typeof window.MediaRecorder === 'undefined'
    ) {
      setFileError(
        'Video recording is not supported in this browser.'
      );
      return;
    }

    const videoTracks = stream.getVideoTracks();

    if (!videoTracks.length) {
      setFileError('No camera track is available.');
      return;
    }

    const mimeType = getSupportedRecordingMimeType();

    try {
      const recorder = mimeType
        ? new window.MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 2500000,
          })
        : new window.MediaRecorder(stream);

      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          recordedChunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onerror = () => {
        if (mountedRef.current) {
          setRecording(false);
          isRecordingRef.current = false;
          setFileError('Video recording failed.');
        }
      };

      recorder.onstop = () => {
        const chunks = recordedChunksRef.current;
        const outputType =
          recorder.mimeType || mimeType || 'video/webm';

        if (!chunks.length) {
          if (mountedRef.current) {
            setFileError('No video was recorded.');
            setRecording(false);
            isRecordingRef.current = false;
          }
          return;
        }

        const blob = new Blob(chunks, {
          type: outputType,
        });

        const url = URL.createObjectURL(blob);
        const extension =
          extensionForMimeType(outputType);

        setRecording(false);
        isRecordingRef.current = false;
        setRecordingDuration(0);

        navigateToEditor({
          type: 'video',
          url,
          file: new File(
            [blob],
            `aarush-story-${Date.now()}.${extension}`,
            {
              type: outputType,
            }
          ),
        });
      };

      recorder.start(RECORDING_TIMESLICE);
      recorderRef.current = recorder;
      isRecordingRef.current = true;
      recordingStartedAtRef.current = Date.now();

      setRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current =
        window.setInterval(() => {
          if (!mountedRef.current) return;

          const seconds = Math.floor(
            (Date.now() - recordingStartedAtRef.current) /
              1000
          );

          setRecordingDuration(seconds);
        }, 250);
    } catch {
      setFileError('Video recording could not start.');
    }
  }, [navigateToEditor]);

  const handleCapturePointerDown = useCallback(() => {
    setFileError('');
    setCapturePressed(true);

    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null;
      startRecording();
    }, LONG_PRESS_DELAY);
  }, [startRecording]);

  const handleCapturePointerUp = useCallback(() => {
    setCapturePressed(false);

    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;

      if (!isRecordingRef.current) {
        capturePhoto();
      }
      return;
    }

    if (isRecordingRef.current) {
      stopRecording();
    }
  }, [capturePhoto, stopRecording]);

  const handleCapturePointerCancel = useCallback(() => {
    setCapturePressed(false);

    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (isRecordingRef.current) {
      stopRecording();
    }
  }, [stopRecording]);

  const switchCamera = useCallback(async () => {
    if (recording || switchingCamera) return;

    const nextMode =
      facingMode === 'environment' ? 'user' : 'environment';

    setSwitchingCamera(true);
    setFacingMode(nextMode);

    try {
      await initializeCamera(nextMode);
    } finally {
      if (mountedRef.current) {
        setSwitchingCamera(false);
      }
    }
  }, [
    facingMode,
    initializeCamera,
    recording,
    switchingCamera,
  ]);

  const validateFile = useCallback((file) => {
    const type = fileTypeFromInput(file);

    if (!type) {
      return {
        error:
          'Unsupported file. Use JPG, PNG, WEBP, MP4, MOV, or WEBM.',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        error:
          'This file is too large. Choose a file under 100 MB.',
      };
    }

    return {
      type,
    };
  }, []);

  const handleGalleryChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];

      event.target.value = '';

      if (!file) return;

      const result = validateFile(file);

      if (result.error) {
        setFileError(result.error);
        return;
      }

      try {
        const url = URL.createObjectURL(file);

        navigateToEditor({
          type: result.type,
          url,
          file,
        });
      } catch {
        setFileError('Gallery media could not be opened.');
      }
    },
    [navigateToEditor, validateFile]
  );

  const handleClose = useCallback(() => {
    stopStream();
    navigate(-1);
  }, [navigate, stopStream]);

  const retryCamera = useCallback(() => {
    initializeCamera(facingMode);
  }, [facingMode, initializeCamera]);

  const recordingTime = `${String(
    Math.floor(recordingDuration / 60)
  ).padStart(2, '0')}:${String(
    recordingDuration % 60
  ).padStart(2, '0')}`;

  return (
    <main style={styles.page}>
      <canvas
        ref={canvasRef}
        style={styles.hiddenCanvas}
        aria-hidden="true"
      />

      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        aria-label="Aarush camera preview"
        style={{
          ...styles.video,
          opacity: cameraReady ? 1 : 0,
          transform:
            facingMode === 'user'
              ? 'scaleX(-1)'
              : 'scaleX(1)',
        }}
      />

      <div style={styles.previewShade} />

      <header style={styles.topBar}>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close story camera"
          style={styles.topButton}
        >
          <X size={21} />
        </button>

        <strong style={styles.topTitle}>
          Aarush Story
        </strong>

        <div style={styles.topActions}>
          <button
            type="button"
            onClick={() =>
              setFlashEnabled((value) => !value)
            }
            aria-label={
              flashEnabled
                ? 'Disable flash'
                : 'Enable flash'
            }
            aria-pressed={flashEnabled}
            style={{
              ...styles.topButton,
              ...(flashEnabled
                ? styles.activeTopButton
                : {}),
            }}
          >
            {flashEnabled ? (
              <Zap size={19} />
            ) : (
              <ZapOff size={19} />
            )}
          </button>

          <button
            type="button"
            aria-label="Camera settings"
            onClick={() =>
              setFileError(
                'Camera settings are coming soon.'
              )
            }
            style={styles.topButton}
          >
            <Settings size={19} />
          </button>
        </div>
      </header>

      {cameraLoading ? (
        <div style={styles.centerState}>
          <LoaderCircle
            size={34}
            style={styles.spin}
          />
          <strong>Starting camera</strong>
          <span>Preparing your private story capture.</span>
        </div>
      ) : null}

      {cameraError ? (
        <div style={styles.centerState}>
          <div style={styles.errorIcon}>
            <Camera size={27} />
          </div>

          <strong>{cameraError.title}</strong>
          <span>{cameraError.message}</span>

          <button
            type="button"
            onClick={retryCamera}
            style={styles.retryButton}
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      ) : null}

      {fileError ? (
        <div role="alert" style={styles.fileError}>
          <span>{fileError}</span>
          <button
            type="button"
            onClick={() => setFileError('')}
            aria-label="Dismiss error"
            style={styles.dismissButton}
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      {recording ? (
        <div style={styles.recordingBadge}>
          <span style={styles.recordingDot} />
          {recordingTime}
        </div>
      ) : null}

      <footer style={styles.bottomControls}>
        <label
          htmlFor="aarush-story-gallery"
          style={styles.sideControl}
        >
          <span style={styles.controlIcon}>
            <ImageIcon size={21} />
          </span>
          <span>Gallery</span>

          <input
            id="aarush-story-gallery"
            type="file"
            accept={[
              ...IMAGE_TYPES,
              ...VIDEO_TYPES,
              '.jpg',
              '.jpeg',
              '.png',
              '.webp',
              '.mp4',
              '.mov',
              '.webm',
            ].join(',')}
            onChange={handleGalleryChange}
            style={styles.fileInput}
          />
        </label>

        <div style={styles.captureArea}>
          {recording ? (
            <span style={styles.recordingHint}>
              Release to finish
            </span>
          ) : (
            <span style={styles.captureHint}>
              Tap photo · Hold video
            </span>
          )}

          <button
            type="button"
            aria-label={
              recording
                ? 'Release to stop recording'
                : 'Tap to take photo or hold to record video'
            }
            aria-pressed={recording}
            onPointerDown={handleCapturePointerDown}
            onPointerUp={handleCapturePointerUp}
            onPointerCancel={handleCapturePointerCancel}
            onPointerLeave={
              recording
                ? undefined
                : handleCapturePointerCancel
            }
            style={{
              ...styles.captureButton,
              ...(capturePressed
                ? styles.capturePressed
                : {}),
              ...(recording
                ? styles.captureRecording
                : {}),
            }}
          >
            <span style={styles.captureInner} />
          </button>
        </div>

        <button
          type="button"
          onClick={switchCamera}
          disabled={switchingCamera || recording}
          aria-label="Switch front and rear camera"
          style={styles.sideControl}
        >
          <span
            style={{
              ...styles.controlIcon,
              ...(switchingCamera
                ? styles.switching
                : {}),
            }}
          >
            <RefreshCw size={21} />
          </span>
          <span>Switch</span>
        </button>
      </footer>

      <style>{`
        @keyframes aarush-camera-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes aarush-camera-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes aarush-camera-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(124,92,255,.24);
          }
          50% {
            box-shadow: 0 0 0 14px rgba(124,92,255,0);
          }
        }

        .aarush-story-camera-button:hover {
          transform: scale(1.04);
        }

        .aarush-story-camera-button:active {
          transform: scale(.94);
        }

        @media (max-height: 650px) {
          .aarush-story-bottom {
            padding-bottom: 1.1rem !important;
          }

          .aarush-story-capture {
            width: 4.6rem !important;
            height: 4.6rem !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-story-camera-button,
          .aarush-story-camera-spin {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    position: 'fixed',
    inset: 0,
    zIndex: 2000,
    overflow: 'hidden',
    color: '#f5f8ff',
    background: '#05070d',
    isolation: 'isolate',
  },

  video: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    background: '#05070d',
    transition: 'opacity 320ms ease, transform 260ms ease',
    animation: 'aarush-camera-fade 350ms ease',
  },

  hiddenCanvas: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: 'none',
  },

  previewShade: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
    background:
      'linear-gradient(180deg, rgba(3,5,12,.68) 0%, rgba(3,5,12,.05) 25%, rgba(3,5,12,.08) 55%, rgba(3,5,12,.86) 100%)',
  },

  topBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 3,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: '.5rem',
    padding:
      '.8rem .9rem calc(.8rem + env(safe-area-inset-top))',
  },

  topTitle: {
    color: '#fff',
    fontSize: '.95rem',
    fontWeight: 850,
    textAlign: 'center',
    textShadow: '0 2px 14px rgba(0,0,0,.45)',
  },

  topActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '.4rem',
  },

  topButton: {
    width: '2.65rem',
    height: '2.65rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,.18)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(5,8,18,.38)',
    boxShadow:
      '0 8px 24px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.1)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    cursor: 'pointer',
    transition: 'transform 180ms ease, background 180ms ease',
  },

  activeTopButton: {
    borderColor: 'rgba(124,92,255,.65)',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.48),rgba(77,215,255,.2))',
    boxShadow: '0 0 22px rgba(124,92,255,.3)',
  },

  centerState: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 4,
    width: 'min(84%, 340px)',
    display: 'grid',
    justifyItems: 'center',
    gap: '.55rem',
    padding: '1.25rem',
    border: '1px solid rgba(255,255,255,.12)',
    borderRadius: '1.25rem',
    color: '#f5f8ff',
    background: 'rgba(7,10,18,.72)',
    boxShadow: '0 24px 60px rgba(0,0,0,.35)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    textAlign: 'center',
    transform: 'translate(-50%, -50%)',
  },

  centerStateSpan: {
    color: '#a7b4cb',
    fontSize: '.72rem',
    lineHeight: 1.45,
  },

  errorIcon: {
    width: '3.25rem',
    height: '3.25rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '1rem',
    color: '#ffb1c8',
    background: 'rgba(255,79,122,.14)',
  },

  spin: {
    color: '#9d8aff',
    animation: 'aarush-camera-spin 900ms linear infinite',
  },

  retryButton: {
    minHeight: '2.55rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    marginTop: '.35rem',
    padding: '0 .9rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.72rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  fileError: {
    position: 'absolute',
    top: '5rem',
    right: '.8rem',
    left: '.8rem',
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.6rem',
    padding: '.7rem .8rem',
    border: '1px solid rgba(255,111,143,.3)',
    borderRadius: '.9rem',
    color: '#ffd3de',
    background: 'rgba(60,12,28,.78)',
    boxShadow: '0 12px 30px rgba(0,0,0,.25)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    fontSize: '.7rem',
  },

  dismissButton: {
    width: '1.8rem',
    height: '1.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: 0,
    borderRadius: '999px',
    color: '#ffd3de',
    background: 'rgba(255,255,255,.08)',
    cursor: 'pointer',
  },

  recordingBadge: {
    position: 'absolute',
    top: '5.2rem',
    left: '50%',
    zIndex: 4,
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    padding: '.38rem .6rem',
    border: '1px solid rgba(255,91,132,.4)',
    borderRadius: '999px',
    color: '#fff',
    background: 'rgba(54,8,24,.64)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    fontSize: '.68rem',
    fontWeight: 850,
    transform: 'translateX(-50%)',
  },

  recordingDot: {
    width: '.48rem',
    height: '.48rem',
    borderRadius: '999px',
    background: '#ff5b84',
    boxShadow: '0 0 12px #ff5b84',
  },

  bottomControls: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 3,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'end',
    gap: '.8rem',
    padding:
      '1rem 1.1rem calc(1.2rem + env(safe-area-inset-bottom))',
  },

  sideControl: {
    minWidth: '4.7rem',
    minHeight: '4.7rem',
    display: 'grid',
    justifyItems: 'center',
    alignContent: 'center',
    gap: '.35rem',
    border: 0,
    borderRadius: '1rem',
    color: '#fff',
    background: 'transparent',
    fontSize: '.65rem',
    fontWeight: 750,
    cursor: 'pointer',
    textShadow: '0 2px 12px rgba(0,0,0,.5)',
  },

  controlIcon: {
    width: '2.8rem',
    height: '2.8rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.2)',
    borderRadius: '999px',
    background: 'rgba(5,8,18,.38)',
    boxShadow: '0 8px 20px rgba(0,0,0,.2)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  },

  switching: {
    animation: 'aarush-camera-spin 700ms linear infinite',
  },

  captureArea: {
    display: 'grid',
    justifyItems: 'center',
    gap: '.35rem',
  },

  captureHint: {
    minHeight: '.95rem',
    color: 'rgba(255,255,255,.78)',
    fontSize: '.58rem',
    fontWeight: 700,
    textShadow: '0 2px 10px rgba(0,0,0,.5)',
  },

  recordingHint: {
    minHeight: '.95rem',
    color: '#ffbfd0',
    fontSize: '.58rem',
    fontWeight: 800,
    textShadow: '0 2px 10px rgba(0,0,0,.5)',
  },

  captureButton: {
    width: '5.5rem',
    height: '5.5rem',
    display: 'grid',
    placeItems: 'center',
    border: '4px solid rgba(255,255,255,.94)',
    borderRadius: '999px',
    padding: 0,
    background: 'rgba(255,255,255,.12)',
    boxShadow:
      '0 0 0 5px rgba(255,255,255,.15), 0 12px 32px rgba(0,0,0,.35)',
    cursor: 'pointer',
    transition:
      'transform 150ms ease, border-color 180ms ease, box-shadow 180ms ease',
    touchAction: 'none',
  },

  capturePressed: {
    transform: 'scale(.92)',
  },

  captureRecording: {
    borderColor: '#ff5b84',
    boxShadow:
      '0 0 0 5px rgba(255,91,132,.18), 0 0 28px rgba(255,91,132,.48)',
    animation: 'aarush-camera-pulse 1.2s ease-in-out infinite',
  },

  captureInner: {
    width: '4.45rem',
    height: '4.45rem',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg,#fff,#dfe8ff)',
  },

  fileInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
    pointerEvents: 'none',
  },
};