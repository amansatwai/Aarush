import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FastForward,
  Heart,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';

const DEFAULT_MUSIC_DURATION = 180;
const DEFAULT_VIDEO_DURATION = 15;
const MIN_SEGMENT_LENGTH = 0.25;
const SNAP_DISTANCE = 0.2;
const ZOOM_LEVELS = [1, 2, 5, 10];

const TRENDING_SONGS = [
  {
    id: 'song-neon-city',
    title: 'Neon City',
    artist: 'Aarush Sounds',
    album: 'Midnight Motion',
    duration: 31,
  },
  {
    id: 'song-afterglow',
    title: 'Afterglow',
    artist: 'Nova Lane',
    album: 'Electric Skies',
    duration: 28,
  },
  {
    id: 'song-night-drive',
    title: 'Night Drive',
    artist: 'The Horizon',
    album: 'Late Hours',
    duration: 42,
  },
  {
    id: 'song-blue-hour',
    title: 'Blue Hour',
    artist: 'Aarush Sounds',
    album: 'Cinematic',
    duration: 36,
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function snap(value, points, distance = SNAP_DISTANCE) {
  const nearest = points.reduce(
    (best, point) =>
      Math.abs(point - value) <
      Math.abs(best - value)
        ? point
        : best,
    value
  );

  return Math.abs(nearest - value) <= distance
    ? nearest
    : value;
}

function makeWaveform(length = 220) {
  return Array.from({ length }, (_, index) => {
    const waveA = Math.abs(
      Math.sin(index * 0.37)
    );
    const waveB = Math.abs(
      Math.cos(index * 0.13)
    );
    const waveC = Math.abs(
      Math.sin(index * 0.071 + 1.7)
    );

    return clamp(
      0.18 + waveA * 0.42 + waveB * 0.25 + waveC * 0.2,
      0.12,
      1
    );
  });
}

function formatTime(value) {
  const total = Math.max(0, Math.floor(value));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function getSongId(song) {
  return song?.id || song?.song_id || '';
}

function getSongTitle(song) {
  return (
    song?.title ||
    song?.song_title ||
    song?.name ||
    'Select music'
  );
}

function getSongArtist(song) {
  return song?.artist || 'Aarush Sounds';
}

function getSongAlbum(song) {
  return song?.album || 'Aarush Music';
}

function getAudioUrl(song) {
  return (
    song?.audio_url ||
    song?.audioUrl ||
    song?.preview_url ||
    song?.previewUrl ||
    ''
  );
}

export default function StoryMusicTimelineEditor({
  videoDuration = DEFAULT_VIDEO_DURATION,
  musicDuration = DEFAULT_MUSIC_DURATION,
  selectedSong = null,
  initialMusicStart = 0,
  initialMusicEnd,
  initialVideoStart = 0,
  initialVideoEnd,
  onChange,
  onClose,
  onApply,
}) {
  const audioRef = useRef(null);
  const playbackFrameRef = useRef(null);
  const playbackStartedRef = useRef(0);
  const dragRef = useRef(null);
  const timelineRef = useRef(null);

  const safeVideoDuration = Math.max(
    0.1,
    number(videoDuration, DEFAULT_VIDEO_DURATION)
  );

  const safeMusicDuration = Math.max(
    0.1,
    number(
      musicDuration ||
        selectedSong?.duration ||
        selectedSong?.duration_seconds,
      DEFAULT_MUSIC_DURATION
    )
  );

  const [song, setSong] = useState(selectedSong);
  const [musicStart, setMusicStart] = useState(
    clamp(
      number(initialMusicStart, 0),
      0,
      safeMusicDuration
    )
  );
  const [musicEnd, setMusicEnd] = useState(() =>
    clamp(
      number(
        initialMusicEnd,
        Math.min(safeMusicDuration, 15)
      ),
      0,
      safeMusicDuration
    )
  );
  const [videoStart, setVideoStart] = useState(
    clamp(
      number(initialVideoStart, 0),
      0,
      safeVideoDuration
    )
  );
  const [videoEnd, setVideoEnd] = useState(() =>
    clamp(
      number(
        initialVideoEnd,
        safeVideoDuration
      ),
      0,
      safeVideoDuration
    )
  );
  const [zoom, setZoom] = useState(1);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [musicVolume, setMusicVolume] =
    useState(100);
  const [originalVolume, setOriginalVolume] =
    useState(100);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [beatSync, setBeatSync] = useState(false);
  const [beatOffset, setBeatOffset] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsPosition, setLyricsPosition] =
    useState('bottom');
  const [musicPanelOpen, setMusicPanelOpen] =
    useState(false);
  const [musicSearch, setMusicSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] =
    useState(false);
  const [notice, setNotice] = useState('');

  const waveform = useMemo(
    () => makeWaveform(220),
    []
  );

  const musicSegmentLength = Math.max(
    MIN_SEGMENT_LENGTH,
    musicEnd - musicStart
  );

  const videoSegmentLength = Math.max(
    MIN_SEGMENT_LENGTH,
    videoEnd - videoStart
  );

  const effectiveMusicEnd = Math.min(
    safeMusicDuration,
    musicStart + musicSegmentLength
  );

  const effectiveVideoEnd = Math.min(
    safeVideoDuration,
    videoStart + videoSegmentLength
  );

  const emitChange = useCallback(() => {
    onChange?.({
      songId: getSongId(song),
      songTitle: getSongTitle(song),
      artist: getSongArtist(song),
      album: getSongAlbum(song),
      songStart: musicStart,
      songEnd: effectiveMusicEnd,
      videoStart,
      videoEnd: effectiveVideoEnd,
      fadeIn,
      fadeOut,
      musicVolume: musicVolume / 100,
      originalVolume: originalVolume / 100,
      beatSync,
      beatOffset,
      waveformData: waveform,
      showLyrics,
      lyricsPosition,
    });
  }, [
    beatOffset,
    beatSync,
    effectiveMusicEnd,
    effectiveVideoEnd,
    fadeIn,
    fadeOut,
    lyricsPosition,
    musicStart,
    musicVolume,
    originalVolume,
    onChange,
    showLyrics,
    song,
    videoEnd,
    videoStart,
    waveform,
  ]);

  useEffect(() => {
    emitChange();
  }, [emitChange]);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = musicVolume / 100;
  }, [musicVolume, song]);

  useEffect(() => {
    return () => {
      if (playbackFrameRef.current !== null) {
        window.cancelAnimationFrame(
          playbackFrameRef.current
        );
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const stopPlayback = useCallback(() => {
    setPlaying(false);

    if (playbackFrameRef.current !== null) {
      window.cancelAnimationFrame(
        playbackFrameRef.current
      );
      playbackFrameRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const updatePlayback = useCallback(() => {
    if (!playing) return;

    const elapsed =
      (Date.now() - playbackStartedRef.current) /
      1000;

    const nextPosition = videoStart + elapsed;

    if (nextPosition >= effectiveVideoEnd) {
      if (audioRef.current) {
        audioRef.current.currentTime = musicStart;
        audioRef.current.play().catch(() => {});
      }

      playbackStartedRef.current = Date.now();
      setPlayhead(videoStart);
    } else {
      setPlayhead(nextPosition);
    }

    playbackFrameRef.current =
      window.requestAnimationFrame(updatePlayback);
  }, [
    effectiveVideoEnd,
    musicStart,
    playing,
    videoStart,
  ]);

  useEffect(() => {
    if (playing) {
      playbackFrameRef.current =
        window.requestAnimationFrame(updatePlayback);
    }

    return () => {
      if (playbackFrameRef.current !== null) {
        window.cancelAnimationFrame(
          playbackFrameRef.current
        );
        playbackFrameRef.current = null;
      }
    };
  }, [playing, updatePlayback]);

  const startPlayback = useCallback(() => {
    if (!song) {
      setNotice('Select a song before previewing.');
      return;
    }

    const audio = audioRef.current;

    if (audio && getAudioUrl(song)) {
      audio.currentTime = musicStart;
      audio.volume = musicVolume / 100;
      audio.play().catch(() => {});
    }

    setPlayhead(videoStart);
    playbackStartedRef.current = Date.now();
    setPlaying(true);
  }, [musicStart, musicVolume, song, videoStart]);

  const togglePlayback = useCallback(() => {
    if (playing) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [playing, startPlayback, stopPlayback]);

  const seek = useCallback(
    (value) => {
      const next = clamp(
        number(value, videoStart),
        videoStart,
        effectiveVideoEnd
      );

      const ratio =
        videoSegmentLength > 0
          ? (next - videoStart) / videoSegmentLength
          : 0;

      const songPosition =
        musicStart + ratio * musicSegmentLength;

      setPlayhead(next);

      if (audioRef.current) {
        audioRef.current.currentTime = songPosition;
      }

      if (playing) {
        playbackStartedRef.current =
          Date.now() -
          (next - videoStart) * 1000;
      }
    },
    [
      effectiveVideoEnd,
      musicSegmentLength,
      musicStart,
      playing,
      videoSegmentLength,
      videoStart,
    ]
  );

  const positionFromPointer = useCallback(
    (event) => {
      const element = timelineRef.current;

      if (!element) return 0;

      const rect = element.getBoundingClientRect();
      const ratio = clamp(
        (event.clientX - rect.left) / rect.width,
        0,
        1
      );

      return ratio * safeMusicDuration;
    },
    [safeMusicDuration]
  );

  const handlePointerDown = useCallback(
    (event, type) => {
      event.preventDefault();

      dragRef.current = {
        type,
        startX: event.clientX,
        initialMusicStart: musicStart,
        initialMusicEnd: effectiveMusicEnd,
        initialVideoStart: videoStart,
        initialVideoEnd: effectiveVideoEnd,
      };

      event.currentTarget.setPointerCapture?.(
        event.pointerId
      );
    },
    [
      effectiveMusicEnd,
      effectiveVideoEnd,
      musicStart,
      videoStart,
    ]
  );

  const handlePointerMove = useCallback(
    (event) => {
      const drag = dragRef.current;

      if (!drag || !timelineRef.current) return;

      const rect =
        timelineRef.current.getBoundingClientRect();
      const secondsPerPixel =
        (safeMusicDuration / rect.width) / zoom;
      const delta =
        (event.clientX - drag.startX) *
        secondsPerPixel;

      const snapPoints = [
        0,
        safeMusicDuration,
        musicStart,
        effectiveMusicEnd,
      ];

      if (drag.type === 'music-start') {
        const next = snap(
          clamp(
            drag.initialMusicStart + delta,
            0,
            effectiveMusicEnd - MIN_SEGMENT_LENGTH
          ),
          snapPoints
        );

        setMusicStart(next);
        return;
      }

      if (drag.type === 'music-end') {
        const next = snap(
          clamp(
            drag.initialMusicEnd + delta,
            musicStart + MIN_SEGMENT_LENGTH,
            safeMusicDuration
          ),
          snapPoints
        );

        setMusicEnd(next);
        return;
      }

      if (drag.type === 'music-segment') {
        const length =
          drag.initialMusicEnd -
          drag.initialMusicStart;
        const nextStart = clamp(
          drag.initialMusicStart + delta,
          0,
          safeMusicDuration - length
        );

        setMusicStart(nextStart);
        setMusicEnd(nextStart + length);
      }
    },
    [
      effectiveMusicEnd,
      musicStart,
      safeMusicDuration,
      zoom,
    ]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const setMusicRange = useCallback(
    (start, end) => {
      const nextStart = clamp(start, 0, safeMusicDuration);
      const nextEnd = clamp(
        end,
        nextStart + MIN_SEGMENT_LENGTH,
        safeMusicDuration
      );

      setMusicStart(nextStart);
      setMusicEnd(nextEnd);
    },
    [safeMusicDuration]
  );

  const setVideoRange = useCallback(
    (start, end) => {
      const nextStart = clamp(start, 0, safeVideoDuration);
      const nextEnd = clamp(
        end,
        nextStart + MIN_SEGMENT_LENGTH,
        safeVideoDuration
      );

      setVideoStart(nextStart);
      setVideoEnd(nextEnd);
      setPlayhead(nextStart);
    },
    [safeVideoDuration]
  );

  const nudgePlayhead = useCallback(
    (direction) => {
      seek(playhead + direction * 0.1);
    },
    [playhead, seek]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        stopPlayback();
        onClose?.();
        return;
      }

      if (event.key === 'Enter') {
        onApply?.({
          songId: getSongId(song),
          songTitle: getSongTitle(song),
          artist: getSongArtist(song),
          album: getSongAlbum(song),
          songStart: musicStart,
          songEnd: effectiveMusicEnd,
          videoStart,
          videoEnd: effectiveVideoEnd,
          fadeIn,
          fadeOut,
          musicVolume: musicVolume / 100,
          originalVolume: originalVolume / 100,
          beatSync,
          beatOffset,
          waveformData: waveform,
          showLyrics,
          lyricsPosition,
        });
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        nudgePlayhead(-1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nudgePlayhead(1);
      }

      if (event.key === ' ') {
        event.preventDefault();
        togglePlayback();
      }
    },
    [
      beatOffset,
      beatSync,
      effectiveMusicEnd,
      effectiveVideoEnd,
      fadeIn,
      fadeOut,
      lyricsPosition,
      musicStart,
      musicVolume,
      nudgePlayhead,
      onApply,
      onClose,
      originalVolume,
      showLyrics,
      song,
      stopPlayback,
      togglePlayback,
      videoEnd,
      videoStart,
      waveform,
    ]
  );

  const applyTimeline = useCallback(() => {
    onApply?.({
      songId: getSongId(song),
      songTitle: getSongTitle(song),
      artist: getSongArtist(song),
      album: getSongAlbum(song),
      songStart: musicStart,
      songEnd: effectiveMusicEnd,
      videoStart,
      videoEnd: effectiveVideoEnd,
      fadeIn,
      fadeOut,
      musicVolume: musicVolume / 100,
      originalVolume: originalVolume / 100,
      beatSync,
      beatOffset,
      waveformData: waveform,
      showLyrics,
      lyricsPosition,
    });
  }, [
    beatOffset,
    beatSync,
    effectiveMusicEnd,
    effectiveVideoEnd,
    fadeIn,
    fadeOut,
    lyricsPosition,
    musicStart,
    musicVolume,
    onApply,
    originalVolume,
    showLyrics,
    song,
    videoEnd,
    videoStart,
    waveform,
  ]);

  const filteredSongs = TRENDING_SONGS.filter((item) =>
    `${item.title} ${item.artist}`
      .toLowerCase()
      .includes(musicSearch.toLowerCase())
  );

  const musicStartPercent =
    (musicStart / safeMusicDuration) * 100;
  const musicEndPercent =
    (effectiveMusicEnd / safeMusicDuration) * 100;
  const playheadPercent =
    ((playhead - videoStart) /
      Math.max(0.1, videoSegmentLength)) *
    100;

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label="Story music timeline editor"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={styles.page}
    >
      <audio
        ref={audioRef}
        src={getAudioUrl(song) || undefined}
        preload="metadata"
        onEnded={() => {
          if (playing) startPlayback();
        }}
      />

      <header style={styles.header}>
        <button
          type="button"
          onClick={() => {
            stopPlayback();
            onClose?.();
          }}
          aria-label="Close music timeline editor"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>Music Timeline</strong>
          <span>Sync sound to your story</span>
        </div>

        <button
          type="button"
          onClick={applyTimeline}
          aria-label="Apply music timeline"
          style={styles.applyButton}
        >
          <Check size={16} />
          Apply
        </button>
      </header>

      <main style={styles.content}>
        <section style={styles.previewCard}>
          <div style={styles.previewHeader}>
            <div>
              <strong>Story video</strong>
              <span>
                {formatTime(videoStart)} –{' '}
                {formatTime(effectiveVideoEnd)}
              </span>
            </div>

            <button
              type="button"
              onClick={togglePlayback}
              aria-label={
                playing ? 'Pause preview' : 'Play preview'
              }
              style={styles.playButton}
            >
              {playing ? (
                <Pause size={18} />
              ) : (
                <Play size={18} />
              )}
            </button>
          </div>

          <div style={styles.videoTimeline}>
            <span
              style={{
                ...styles.videoSelection,
                left: `${
                  (videoStart / safeVideoDuration) * 100
                }%`,
                width: `${
                  (videoSegmentLength /
                    safeVideoDuration) *
                  100
                }%`,
              }}
            />

            <span
              style={{
                ...styles.timelinePlayhead,
                left: `${
                  clamp(playheadPercent, 0, 100)
                }%`,
              }}
            />

            <div style={styles.ruler}>
              {[0, 25, 50, 75, 100].map((value) => (
                <span key={value}>
                  {formatTime(
                    (safeVideoDuration * value) /
                      100
                  )}
                </span>
              ))}
            </div>
          </div>

          <div style={styles.videoRangeControls}>
            <label>
              Video start
              <input
                type="range"
                min="0"
                max={Math.max(
                  0,
                  safeVideoDuration - MIN_SEGMENT_LENGTH
                )}
                step="0.05"
                value={videoStart}
                onChange={(event) =>
                  setVideoRange(
                    Number(event.target.value),
                    videoEnd
                  )
                }
              />
            </label>

            <label>
              Video end
              <input
                type="range"
                min={Math.min(
                  safeVideoDuration,
                  videoStart + MIN_SEGMENT_LENGTH
                )}
                max={safeVideoDuration}
                step="0.05"
                value={videoEnd}
                onChange={(event) =>
                  setVideoRange(
                    videoStart,
                    Number(event.target.value)
                  )
                }
              />
            </label>
          </div>
        </section>

        <section style={styles.timelineCard}>
          <div style={styles.timelineHeader}>
            <div style={styles.songIdentity}>
              <span style={styles.albumArt}>
                <Sparkles size={19} />
              </span>

              <div>
                <strong>
                  {getSongTitle(song)}
                </strong>
                <span>
                  {getSongArtist(song)} ·{' '}
                  {getSongAlbum(song)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMusicPanelOpen(true)}
              aria-label="Choose music"
              style={styles.changeButton}
            >
              <Search size={15} />
              Change
            </button>
          </div>

          <div style={styles.timelineToolbar}>
            <div style={styles.zoomControls}>
              <SlidersHorizontal size={15} />
              {ZOOM_LEVELS.map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setZoom(value)}
                  aria-pressed={zoom === value}
                  style={{
                    ...styles.zoomButton,
                    ...(zoom === value
                      ? styles.activeZoom
                      : {}),
                  }}
                >
                  {value}x
                </button>
              ))}
            </div>

            <span style={styles.segmentLabel}>
              {formatTime(musicStart)} –{' '}
              {formatTime(effectiveMusicEnd)}
            </span>
          </div>

          <div
            ref={timelineRef}
            style={styles.musicTimeline}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={(event) => {
              const position =
                positionFromPointer(event);
              setMusicRange(
                position,
                Math.min(
                  safeMusicDuration,
                  position + musicSegmentLength
                )
              );
            }}
          >
            <div style={styles.waveform}>
              {waveform.map((height, index) => {
                const position =
                  (index / waveform.length) * 100;
                const selected =
                  position >= musicStartPercent &&
                  position <= musicEndPercent;

                return (
                  <span
                    key={index}
                    style={{
                      ...styles.waveBar,
                      height: `${height * 100}%`,
                      opacity: selected ? 1 : 0.22,
                      background: selected
                        ? 'linear-gradient(180deg,#4dd7ff,#7c5cff)'
                        : '#8290ad',
                    }}
                  />
                );
              })}
            </div>

            <span
              style={{
                ...styles.musicSelection,
                left: `${musicStartPercent}%`,
                width: `${
                  musicEndPercent - musicStartPercent
                }%`,
              }}
              onPointerDown={(event) =>
                handlePointerDown(
                  event,
                  'music-segment'
                )
              }
            />

            <button
              type="button"
              aria-label="Move music segment start"
              onPointerDown={(event) =>
                handlePointerDown(
                  event,
                  'music-start'
                )
              }
              style={{
                ...styles.trimHandle,
                left: `${musicStartPercent}%`,
              }}
            />

            <button
              type="button"
              aria-label="Move music segment end"
              onPointerDown={(event) =>
                handlePointerDown(
                  event,
                  'music-end'
                )
              }
              style={{
                ...styles.trimHandle,
                left: `${musicEndPercent}%`,
              }}
            />

            <span
              style={{
                ...styles.musicPlayhead,
                left: `${musicStartPercent}%`,
              }}
            />

            <div style={styles.ruler}>
              {[0, 25, 50, 75, 100].map((value) => (
                <span key={value}>
                  {formatTime(
                    (safeMusicDuration * value) /
                      100
                  )}
                </span>
              ))}
            </div>
          </div>

          <div style={styles.nudgeControls}>
            <button
              type="button"
              onClick={() => nudgePlayhead(-1)}
              aria-label="Move playhead backward"
              style={styles.smallButton}
            >
              <ChevronLeft size={15} />
            </button>

            <span>
              Playhead {formatTime(playhead)}
            </span>

            <button
              type="button"
              onClick={() => nudgePlayhead(1)}
              aria-label="Move playhead forward"
              style={styles.smallButton}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </section>

        <section style={styles.controlsCard}>
          <div style={styles.sectionTitle}>
            <SlidersHorizontal size={16} />
            Audio controls
          </div>

          <label style={styles.sliderRow}>
            <span>
              <Volume2 size={14} />
              Music volume
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVolume}
              onChange={(event) =>
                setMusicVolume(
                  Number(event.target.value)
                )
              }
            />
            <output>{musicVolume}%</output>
          </label>

          <label style={styles.sliderRow}>
            <span>
              <VolumeX size={14} />
              Original video
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={originalVolume}
              onChange={(event) =>
                setOriginalVolume(
                  Number(event.target.value)
                )
              }
            />
            <output>{originalVolume}%</output>
          </label>

          <label style={styles.sliderRow}>
            <span>Fade in</span>
            <input
              type="range"
              min="0"
              max="5"
              step=".1"
              value={fadeIn}
              onChange={(event) =>
                setFadeIn(Number(event.target.value))
              }
            />
            <output>{fadeIn.toFixed(1)}s</output>
          </label>

          <label style={styles.sliderRow}>
            <span>Fade out</span>
            <input
              type="range"
              min="0"
              max="5"
              step=".1"
              value={fadeOut}
              onChange={(event) =>
                setFadeOut(Number(event.target.value))
              }
            />
            <output>{fadeOut.toFixed(1)}s</output>
          </label>
        </section>

        <section style={styles.featureCard}>
          <div style={styles.featureRow}>
            <div>
              <strong>Beat Sync</strong>
              <span>Prepare rhythm snapping</span>
            </div>

            <button
              type="button"
              onClick={() =>
                setBeatSync((value) => !value)
              }
              aria-pressed={beatSync}
              style={{
                ...styles.toggle,
                ...(beatSync
                  ? styles.toggleActive
                  : {}),
              }}
            >
              <span />
            </button>
          </div>

          {beatSync ? (
            <label style={styles.sliderRow}>
              <span>
                <Zap size={14} />
                Beat adjustment
              </span>
              <input
                type="range"
                min="-1"
                max="1"
                step=".05"
                value={beatOffset}
                onChange={(event) =>
                  setBeatOffset(
                    Number(event.target.value)
                  )
                }
              />
              <output>
                {beatOffset.toFixed(2)}s
              </output>
            </label>
          ) : null}

          <div style={styles.featureRow}>
            <div>
              <strong>Lyrics overlay</strong>
              <span>Karaoke timing foundation</span>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowLyrics((value) => !value)
              }
              aria-pressed={showLyrics}
              style={{
                ...styles.toggle,
                ...(showLyrics
                  ? styles.toggleActive
                  : {}),
              }}
            >
              <span />
            </button>
          </div>

          {showLyrics ? (
            <div style={styles.lyricsOptions}>
              {['top', 'center', 'bottom'].map(
                (position) => (
                  <button
                    type="button"
                    key={position}
                    onClick={() =>
                      setLyricsPosition(position)
                    }
                    style={{
                      ...styles.optionButton,
                      ...(lyricsPosition === position
                        ? styles.activeOption
                        : {}),
                    }}
                  >
                    {position}
                  </button>
                )
              )}
            </div>
          ) : null}
        </section>

        <button
          type="button"
          onClick={applyTimeline}
          style={styles.bottomApply}
        >
          <Check size={17} />
          Apply music to story
        </button>
      </main>

      {musicPanelOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          style={styles.overlay}
          onClick={() => setMusicPanelOpen(false)}
        >
          <section
            style={styles.musicPanel}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div style={styles.panelHeader}>
              <strong>Choose music</strong>

              <button
                type="button"
                onClick={() => setMusicPanelOpen(false)}
                aria-label="Close music panel"
                style={styles.iconButton}
              >
                <X size={17} />
              </button>
            </div>

            <div style={styles.searchBox}>
              <Search size={16} />
              <input
                value={musicSearch}
                onChange={(event) =>
                  setMusicSearch(event.target.value)
                }
                placeholder="Search songs or artists"
                aria-label="Search music"
              />
            </div>

            <div style={styles.musicTabs}>
              {[
                'Trending',
                'Recently used',
                'Favorites',
                'Recommended',
              ].map((label) => (
                <button
                  type="button"
                  key={label}
                  onClick={() =>
                    setFavoritesOnly(
                      label === 'Favorites'
                    )
                  }
                  style={styles.musicTab}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={styles.songList}>
              {filteredSongs
                .filter(
                  (item) =>
                    !favoritesOnly ||
                    item.id === 'song-neon-city'
                )
                .map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setSong(item);
                      setMusicStart(0);
                      setMusicEnd(
                        Math.min(
                          safeMusicDuration,
                          item.duration
                        )
                      );
                      setMusicPanelOpen(false);
                    }}
                    style={styles.songButton}
                  >
                    <span style={styles.songArt}>
                      <Play size={15} />
                    </span>

                    <span style={styles.songText}>
                      <strong>{item.title}</strong>
                      <span>
                        {item.artist} · {item.album}
                      </span>
                    </span>

                    {getSongId(song) === item.id ? (
                      <Check
                        size={16}
                        color="#82e9c1"
                      />
                    ) : null}
                  </button>
                ))}
            </div>
          </section>
        </div>
      ) : null}

      <style>{`
        @keyframes aarush-music-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes aarush-music-slide {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 600px) {
          .aarush-music-timeline {
            overflow-x: auto;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </section>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.5),#07090e 68%)',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.7rem',
    padding: '.75rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.86)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  iconButton: {
    width: '2.5rem',
    height: '2.5rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  heading: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  applyButton: {
    minHeight: '2.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .7rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  content: {
    width: 'min(100%, 840px)',
    margin: '0 auto',
    padding: '.85rem',
    display: 'grid',
    gap: '.8rem',
  },

  previewCard: {
    padding: '.85rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.2rem',
    background: 'rgba(15,19,30,.9)',
  },

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '.75rem',
  },

  previewHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  previewHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.65rem',
  },

  playButton: {
    width: '2.6rem',
    height: '2.6rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  videoTimeline: {
    position: 'relative',
    height: '3.2rem',
    overflow: 'hidden',
    borderRadius: '.7rem',
    background:
      'linear-gradient(180deg,rgba(124,92,255,.14),rgba(77,215,255,.06))',
  },

  videoSelection: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderLeft: '2px solid #4dd7ff',
    borderRight: '2px solid #4dd7ff',
    background: 'rgba(77,215,255,.1)',
  },

  timelinePlayhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 3,
    width: '2px',
    background: '#ff4fd8',
    boxShadow: '0 0 12px rgba(255,79,216,.7)',
    transition: 'left 80ms linear',
  },

  ruler: {
    position: 'absolute',
    right: '.35rem',
    bottom: '.25rem',
    left: '.35rem',
    zIndex: 4,
    display: 'flex',
    justifyContent: 'space-between',
    color: '#8290ad',
    fontSize: '.55rem',
    pointerEvents: 'none',
  },

  videoRangeControls: {
    display: 'grid',
    gap: '.5rem',
    marginTop: '.75rem',
  },

  timelineCard: {
    padding: '.85rem',
    border: '1px solid rgba(124,92,255,.22)',
    borderRadius: '1.2rem',
    background: 'rgba(15,19,30,.92)',
    boxShadow: '0 18px 50px rgba(0,0,0,.24)',
  },

  timelineHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.6rem',
  },

  songIdentity: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '.55rem',
  },

  albumArt: {
    width: '2.8rem',
    height: '2.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.7rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  songIdentityDiv: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
  },

  songIdentitySpan: {
    overflow: 'hidden',
    color: '#91a0bc',
    fontSize: '.63rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  changeButton: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .6rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '999px',
    color: '#c8bcff',
    background: 'rgba(124,92,255,.1)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  timelineToolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginTop: '.8rem',
  },

  zoomControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '.25rem',
    color: '#91a0bc',
  },

  zoomButton: {
    minWidth: '2rem',
    minHeight: '1.8rem',
    border: 0,
    borderRadius: '.45rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeZoom: {
    color: '#fff',
    background: 'rgba(124,92,255,.25)',
  },

  segmentLabel: {
    color: '#9deeff',
    fontSize: '.62rem',
    fontWeight: 750,
  },

  musicTimeline: {
    position: 'relative',
    height: '6.5rem',
    marginTop: '.7rem',
    overflow: 'hidden',
    border: '1px solid rgba(77,215,255,.15)',
    borderRadius: '.8rem',
    background: 'rgba(77,215,255,.04)',
    touchAction: 'none',
  },

  waveform: {
    position: 'absolute',
    inset: '1rem .4rem 1.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    pointerEvents: 'none',
  },

  waveBar: {
    minWidth: '2px',
    flex: 1,
    borderRadius: '999px',
    transition: 'opacity 120ms ease',
  },

  musicSelection: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 2,
    borderTop: '2px solid #4dd7ff',
    borderBottom: '2px solid #4dd7ff',
    background: 'rgba(124,92,255,.14)',
    cursor: 'grab',
  },

  trimHandle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 4,
    width: '.75rem',
    padding: 0,
    border: 0,
    borderRadius: '.35rem',
    background: '#4dd7ff',
    transform: 'translateX(-50%)',
    cursor: 'ew-resize',
  },

  musicPlayhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 5,
    width: '2px',
    background: '#ff4fd8',
    boxShadow: '0 0 14px rgba(255,79,216,.72)',
  },

  nudgeControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.55rem',
    marginTop: '.6rem',
    color: '#91a0bc',
    fontSize: '.63rem',
  },

  smallButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.05)',
    cursor: 'pointer',
  },

  controlsCard: {
    display: 'grid',
    gap: '.7rem',
    padding: '.85rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.88)',
  },

  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    color: '#dce5f8',
    fontSize: '.76rem',
    fontWeight: 850,
  },

  sliderRow: {
    display: 'grid',
    gridTemplateColumns: '7rem 1fr 3rem',
    alignItems: 'center',
    gap: '.55rem',
    color: '#aab6cf',
    fontSize: '.64rem',
  },

  sliderRowSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
  },

  sliderRowOutput: {
    color: '#9deeff',
    textAlign: 'right',
  },

  featureCard: {
    display: 'grid',
    gap: '.75rem',
    padding: '.85rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.88)',
  },

  featureRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.6rem',
  },

  featureRowDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  featureRowSpan: {
    color: '#91a0bc',
    fontSize: '.62rem',
  },

  toggle: {
    width: '2.65rem',
    height: '1.55rem',
    padding: '.18rem',
    border: 0,
    borderRadius: '999px',
    background: '#343c50',
    cursor: 'pointer',
    textAlign: 'left',
  },

  toggleActive: {
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  toggleSpan: {
    width: '1.2rem',
    height: '1.2rem',
    display: 'block',
    borderRadius: '999px',
    background: '#fff',
    transition: 'transform 180ms ease',
  },

  lyricsOptions: {
    display: 'flex',
    gap: '.35rem',
  },

  optionButton: {
    minHeight: '2rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.09)',
    borderRadius: '.55rem',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  activeOption: {
    color: '#fff',
    borderColor: 'rgba(124,92,255,.42)',
    background: 'rgba(124,92,255,.18)',
  },

  bottomApply: {
    minHeight: '2.8rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.72rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '.8rem',
    background: 'rgba(2,5,10,.72)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  musicPanel: {
    width: 'min(100%,560px)',
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.3rem',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
    animation: 'aarush-music-slide 220ms ease both',
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '.8rem',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.55rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.75rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
  },

  searchBoxInput: {
    minWidth: 0,
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.7rem',
  },

  musicTabs: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    margin: '.8rem 0',
  },

  musicTab: {
    minHeight: '2.1rem',
    flexShrink: 0,
    padding: '0 .6rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#9aa7c1',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  songList: {
    display: 'grid',
    gap: '.45rem',
  },

  songButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '.6rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.8rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.04)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  songArt: {
    width: '2.5rem',
    height: '2.5rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
  },

  songText: {
    minWidth: 0,
    display: 'grid',
    gap: '.18rem',
    flex: 1,
  },

  songTextSpan: {
    overflow: 'hidden',
    color: '#91a0bc',
    fontSize: '.62rem',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};