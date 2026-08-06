import { useMemo, useState } from 'react';
import { Plus, X, Play, Heart, MessageCircle, Lock, Users } from 'lucide-react';

const mockStories = [
  {
    id: 'add-story',
    username: 'Add Story',
    avatar: null,
    mediaType: 'add',
    mediaUrl: null,
    viewed: false,
    timeAgo: '',
    isCloseFriend: false,
    isOwnStory: true,
  },
  {
    id: 'story-1',
    username: 'arush.dev',
    avatar: 'A',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    viewed: false,
    timeAgo: '2m',
    isCloseFriend: true,
    isOwnStory: false,
  },
  {
    id: 'story-2',
    username: 'pixel.hub',
    avatar: 'P',
    mediaType: 'video',
    mediaUrl: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1200&q=80',
    viewed: true,
    timeAgo: '12m',
    isCloseFriend: false,
    isOwnStory: false,
  },
  {
    id: 'story-3',
    username: 'design.studio',
    avatar: 'D',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    viewed: false,
    timeAgo: '30m',
    isCloseFriend: false,
    isOwnStory: false,
  },
  {
    id: 'story-4',
    username: 'video.lab',
    avatar: 'V',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    viewed: true,
    timeAgo: '1h',
    isCloseFriend: true,
    isOwnStory: false,
  },
];

function StoryAvatar({ story, onOpen }) {
  const isAddStory = story.mediaType === 'add';

  return (
    <button
      type="button"
      onClick={() => onOpen(story)}
      className="story-item"
      aria-label={isAddStory ? 'Add story' : `View story from ${story.username}`}
      style={{
        minWidth: '5.2rem',
        maxWidth: '5.2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.45rem',
        border: '0',
        background: 'transparent',
        color: '#edf2ff',
        cursor: 'pointer',
        padding: '0',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        style={{
          width: '4.15rem',
          height: '4.15rem',
          borderRadius: '999px',
          padding: '2.8px',
          background: isAddStory
            ? 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))'
            : story.viewed
              ? 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08))'
              : 'linear-gradient(135deg, #7c5cff 0%, #ff4fd8 48%, #4dd7ff 100%)',
          boxShadow: isAddStory
            ? 'inset 0 0 0 1px rgba(255,255,255,0.06)'
            : story.viewed
              ? 'inset 0 0 0 1px rgba(255,255,255,0.08)'
              : '0 0 16px rgba(124, 92, 255, 0.22), 0 0 28px rgba(77, 215, 255, 0.14)',
          position: 'relative',
          transition: 'transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '999px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(16,20,31,0.98), rgba(23,28,43,0.98))',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
          }}
        >
          {isAddStory ? (
            <Plus size={26} strokeWidth={2.4} color="#ffffff" />
          ) : (
            <>
              {story.avatar ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    background: story.mediaUrl
                      ? `linear-gradient(180deg, rgba(0,0,0,0.14), rgba(0,0,0,0.54)), url(${story.mediaUrl}) center/cover`
                      : 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                  }}
                >
                  {!story.mediaUrl ? story.avatar : null}
                </div>
              ) : null}
              {!story.viewed ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: '0.22rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    pointerEvents: 'none',
                  }}
                />
              ) : null}
            </>
          )}
        </div>
      </div>

      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          lineHeight: 1.15,
          color: isAddStory ? '#d8e2ff' : story.viewed ? '#aeb8d0' : '#f4f7ff',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
        }}
      >
        {story.username}
      </span>
    </button>
  );
}

export default function Stories({ stories = mockStories }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const data = useMemo(() => (Array.isArray(stories) && stories.length ? stories : mockStories), [stories]);

  const openStory = (story) => {
    if (story.mediaType === 'add') return;
    setSelectedStory(story);
  };

  const closeStory = () => setSelectedStory(null);

  return (
    <>
      <section
        className="stories-rail"
        aria-label="Stories"
        style={{
          padding: '0.6rem 0 0.95rem',
          marginBottom: '0.35rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            overflowX: 'auto',
            padding: '0.15rem 0.1rem 0.2rem',
            scrollSnapType: 'x proximity',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {data.map((story) => (
            <div key={story.id} style={{ scrollSnapAlign: 'start' }}>
              <StoryAvatar story={story} onOpen={openStory} />
            </div>
          ))}
        </div>
      </section>

      {selectedStory ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedStory.username} story preview`}
          onClick={closeStory}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            background: 'rgba(3, 6, 12, 0.82)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(100%, 460px)',
              borderRadius: '1.5rem',
              overflow: 'hidden',
              background: 'rgba(13, 17, 28, 0.96)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.48)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.35rem',
                  padding: '0.75rem 0.85rem 0',
                }}
              >
                <div style={{ height: '0.22rem', borderRadius: '999px', background: 'linear-gradient(90deg, #7c5cff, #4dd7ff)' }} />
                <div style={{ height: '0.22rem', borderRadius: '999px', background: 'rgba(255,255,255,0.14)' }} />
                <div style={{ height: '0.22rem', borderRadius: '999px', background: 'rgba(255,255,255,0.14)' }} />
              </div>

              <div style={{ padding: '0.85rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div
                      style={{
                        width: '2.85rem',
                        height: '2.85rem',
                        borderRadius: '999px',
                        padding: '2.5px',
                        background: selectedStory.viewed
                          ? 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))'
                          : 'linear-gradient(135deg, #7c5cff 0%, #ff4fd8 48%, #4dd7ff 100%)',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '999px',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#ffffff',
                          fontWeight: 800,
                          background: selectedStory.mediaUrl
                            ? `linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.58)), url(${selectedStory.mediaUrl}) center/cover`
                            : 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                        }}
                      >
                        {!selectedStory.mediaUrl ? selectedStory.avatar : null}
                      </div>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          minWidth: 0,
                          marginBottom: '0.15rem',
                        }}
                      >
                        <strong
                          style={{
                            color: '#f7f9ff',
                            fontSize: '0.95rem',
                            lineHeight: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {selectedStory.username}
                        </strong>
                        {selectedStory.isOwnStory ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.28rem 0.5rem',
                              borderRadius: '999px',
                              background: 'rgba(124, 92, 255, 0.16)',
                              color: '#d6ddff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            <Users size={12} /> You
                          </span>
                        ) : null}
                        {selectedStory.isCloseFriend ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.28rem 0.5rem',
                              borderRadius: '999px',
                              background: 'rgba(77, 215, 255, 0.12)',
                              color: '#d6f7ff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            <Lock size={12} /> Close Friends
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.28rem 0.5rem',
                              borderRadius: '999px',
                              background: 'rgba(255,255,255,0.08)',
                              color: '#d8e1f6',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            Public
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#8f98b3', fontSize: '0.8rem', fontWeight: 600 }}>
                        {selectedStory.timeAgo}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeStory}
                    aria-label="Close story viewer"
                    style={{
                      width: '2.4rem',
                      height: '2.4rem',
                      borderRadius: '999px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#f5f7ff',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <X size={16} strokeWidth={2.4} />
                  </button>
                </div>

                <div
                  style={{
                    width: '100%',
                    aspectRatio: '9 / 16',
                    borderRadius: '1.1rem',
                    overflow: 'hidden',
                    background: 'linear-gradient(180deg, rgba(18,24,38,1), rgba(10,14,24,1))',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    position: 'relative',
                  }}
                >
                  {selectedStory.mediaType === 'image' ? (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url(${selectedStory.mediaUrl}) center/cover`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'grid',
                        placeItems: 'center',
                        background: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.58)), url(${selectedStory.mediaUrl}) center/cover`,
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.8rem 1rem',
                          borderRadius: '999px',
                          background: 'rgba(10, 14, 24, 0.55)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          backdropFilter: 'blur(12px)',
                        }}
                      >
                        <Play size={18} fill="currentColor" strokeWidth={1.6} />
                        Video Story Placeholder
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      inset: 'auto 0 0 0',
                      padding: '0.85rem',
                      background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(4,7,13,0.82) 100%)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.7rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            border: '0',
                            borderRadius: '999px',
                            padding: '0.72rem 0.9rem',
                            background: 'rgba(255,255,255,0.08)',
                            color: '#fff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Heart size={16} fill="currentColor" />
                          React
                        </button>
                        <button
                          type="button"
                          style={{
                            border: '0',
                            borderRadius: '999px',
                            padding: '0.72rem 0.9rem',
                            background: 'rgba(255,255,255,0.08)',
                            color: '#fff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            cursor: 'pointer',
                          }}
                        >
                          <MessageCircle size={16} />
                          Reply
                        </button>
                      </div>

                      <span
                        style={{
                          color: '#afbacf',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Story viewer overlay
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}