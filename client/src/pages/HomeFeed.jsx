import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import FeedPost from '../components/FeedPost';
import BottomNav from '../components/BottomNav';
import {
  Archive,
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileText,
  Flame,
  FolderLock,
  Hash,
  Image as ImageIcon,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  Shield,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  Video,
  X,
} from 'lucide-react';

const STORY_STORAGE_KEY = 'aarush_home_stories_v3';
const STORY_REPLY_STORAGE_KEY = 'aarush_home_story_replies_v3';
const STORY_PRIVACY_STORAGE_KEY = 'aarush_home_story_privacy_v3';


const basePosts = [
  {
    id: 'post-1',
    username: 'arush.dev',
    verified: true,
    timeAgo: '2m',
    location: 'Ghaziabad, India',
    caption:
      'Building Aarush Home Feed v1.0 with a premium dark UI, modular architecture, and production-ready interactions for React + Vite + Supabase. #React #Supabase @teamaarush',
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
    ],
    video: false,
    likeCount: 1284,
    commentCount: 92,
    viewCount: 16840,
    saveCount: 211,
    isFollowing: true,
    notificationsEnabled: true,
  },
  {
    id: 'post-2',
    username: 'pixel.hub',
    verified: false,
    timeAgo: '18m',
    location: 'New Delhi, India',
    caption:
      'Carousel feed card with swipe-ready interactions, premium visuals, and future Supabase integration. #Frontend #UIUX @aarush',
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    ],
    video: false,
    likeCount: 842,
    commentCount: 44,
    viewCount: 9200,
    saveCount: 103,
    isFollowing: false,
    notificationsEnabled: false,
  },
  {
    id: 'post-3',
    username: 'video.studio',
    verified: true,
    timeAgo: '1h',
    location: 'Mumbai, India',
    caption:
      'Short-form video placeholder support is ready for a future Reels pipeline. Smooth, lightweight, and scalable. #Reels #Video',
    images: [],
    video: true,
    likeCount: 3510,
    commentCount: 189,
    viewCount: 41200,
    saveCount: 603,
    isFollowing: true,
    notificationsEnabled: false,
  },
];

const suggestedPosts = [
  {
    id: 'suggested-1',
    username: 'design.loop',
    verified: true,
    timeAgo: '5h',
    location: 'Bengaluru, India',
    caption:
      'Suggested content block for discovery. This keeps the Home feed fresh and helps users find new creators. #Explore #Design',
    images: [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    ],
    video: false,
    likeCount: 620,
    commentCount: 23,
    viewCount: 5400,
    saveCount: 74,
    isFollowing: false,
    notificationsEnabled: false,
  },
  {
    id: 'suggested-2',
    username: 'frame.motion',
    verified: false,
    timeAgo: '7h',
    location: 'Pune, India',
    caption:
      'Trending placeholder for the feed ranking engine. Personalized later via watch time, engagement, and interests. #Trending #Motion',
    images: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80',
    ],
    video: false,
    likeCount: 980,
    commentCount: 61,
    viewCount: 10300,
    saveCount: 128,
    isFollowing: false,
    notificationsEnabled: false,
  },
];

const nearbyContent = [
  {
    id: 'nearby-1',
    username: 'noida.creative',
    verified: true,
    timeAgo: '12m',
    location: 'Noida, India',
    caption:
      'Nearby content placeholder for local discovery.',
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    ],
    video: false,
    likeCount: 280,
    commentCount: 19,
    viewCount: 3200,
    saveCount: 42,
    isFollowing: false,
    notificationsEnabled: false,
  },
  {
    id: 'nearby-2',
    username: 'delhi.frames',
    verified: false,
    timeAgo: '41m',
    location: 'Delhi NCR',
    caption:
      'Nearby discovery card for future geolocation-based ranking.',
    images: [],
    video: true,
    likeCount: 410,
    commentCount: 27,
    viewCount: 4100,
    saveCount: 55,
    isFollowing: false,
    notificationsEnabled: false,
  },
];

const trendingHashtags = [
  '#React',
  '#Supabase',
  '#Reels',
  '#Explore',
  '#Aarush',
  '#Frontend',
  '#CreatorMode',
];

const defaultStories = [
  {
    id: 'story-aman',
    username: 'aman.satwai',
    displayName: 'Aman Satwai',
    avatar: 'https://i.pravatar.cc/160?u=aman.satwai',
    verified: true,
    ring: 'verified',
    seen: false,
    privacy: 'Followers',
    stories: [
      {
        id: 'story-aman-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=90',
        text: 'Building something focused today.',
        time: '12m',
        duration: 5000,
      },
      {
        id: 'story-aman-2',
        type: 'text',
        text: 'Aarush v1.0 is getting closer.',
        time: '10m',
        duration: 5000,
        background: 'linear-gradient(135deg,#7c5cff,#4dd7ff)',
      },
    ],
  },
  {
    id: 'story-design',
    username: 'design.loop',
    displayName: 'Design Loop',
    avatar: 'https://i.pravatar.cc/160?u=design.loop',
    verified: false,
    ring: 'close',
    seen: false,
    privacy: 'Close Friends',
    stories: [
      {
        id: 'story-design-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=90',
        text: 'New visual system.',
        time: '24m',
        duration: 5000,
      },
    ],
  },
  {
    id: 'story-creator',
    username: 'creator.lab',
    displayName: 'Creator Lab',
    avatar: 'https://i.pravatar.cc/160?u=creator.lab',
    verified: true,
    ring: 'ai',
    seen: true,
    privacy: 'Public',
    stories: [
      {
        id: 'story-creator-1',
        type: 'video',
        url: 'https://cdn.coverr.co/videos/coverr-a-woman-working-on-a-laptop-1575/1080p.mp4',
        text: 'Creator workflow.',
        time: '1h',
        duration: 7000,
      },
    ],
  },
  {
    id: 'story-family',
    username: 'family.circle',
    displayName: 'Family Circle',
    avatar: 'https://i.pravatar.cc/160?u=family.circle',
    verified: false,
    ring: 'private',
    seen: true,
    privacy: 'Private Story',
    stories: [
      {
        id: 'story-family-1',
        type: 'text',
        text: 'See you tomorrow ❤️',
        time: '2h',
        duration: 5000,
        background: 'linear-gradient(135deg,#ff4fd8,#7c5cff)',
      },
    ],
  },
];

const defaultHighlights = [
  {
    id: 'highlight-travel',
    title: 'Travel',
    count: 8,
    cover:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'highlight-work',
    title: 'Work',
    count: 12,
    cover:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'highlight-friends',
    title: 'Friends',
    count: 6,
    cover:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'highlight-family',
    title: 'Family',
    count: 9,
    cover:
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'highlight-memories',
    title: 'Memories',
    count: 14,
    cover:
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'highlight-ai',
    title: 'AI',
    count: 5,
    cover:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'highlight-favorites',
    title: 'Favorites',
    count: 11,
    cover:
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=300&q=80',
  },
];

function readLocal(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local persistence is best effort.
  }
}

function FeedModeTab({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 0,
        borderRadius: '999px',
        padding: '0.62rem 0.9rem',
        background: active
          ? 'linear-gradient(135deg, rgba(124,92,255,0.28), rgba(77,215,255,0.14))'
          : 'rgba(255,255,255,0.05)',
        color: active ? '#ffffff' : '#b0bad0',
        fontSize: '0.8rem',
        fontWeight: 800,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, icon: Icon, children, actionText }) {
  return (
    <section style={styles.sectionCard}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionHeading}>
          {Icon ? (
            <span style={styles.sectionIcon}>
              <Icon size={14} />
            </span>
          ) : null}

          <h2 style={styles.sectionTitle}>{title}</h2>
        </div>

        {actionText ? (
          <span style={styles.sectionAction}>{actionText}</span>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function StoryRing({ story, onClick }) {
  const ringState = story.seen ? 'seen' : story.ring || 'unseen';

  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.storyItem}
      aria-label={`Open ${story.displayName}'s story`}
    >
      <span
        className={`aarush-story-ring ${ringState}`}
        style={styles.storyRing}
      >
        <img
          src={story.avatar}
          alt={`${story.displayName} profile`}
          style={styles.storyAvatar}
        />

        {story.verified ? (
          <span style={styles.verifiedBadge}>
            <Check size={9} />
          </span>
        ) : null}
      </span>

      <span style={styles.storyName}>{story.username}</span>
    </button>
  );
}

function StoryTray({ stories, onOpen, onAddStory }) {
  return (
    <section style={styles.storyTray}>
      <div style={styles.storyHeader}>
        <div>
          <h2 style={styles.storyTitle}>Stories</h2>
          <p style={styles.storySubtitle}>
            Moments from your Aarush circle.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddStory}
          style={styles.addStoryButton}
        >
          <Camera size={14} />
          Add story
        </button>
      </div>

      <div style={styles.storyScroller}>
        <button
          type="button"
          onClick={onAddStory}
          style={styles.yourStory}
          aria-label="Add your story"
        >
          <span style={styles.yourStoryRing}>
            <span style={styles.yourStoryAvatar}>
              <UserRound size={21} />
            </span>
            <span style={styles.addBadge}>
              <Plus size={12} />
            </span>
          </span>
          <span style={styles.storyName}>Your Story</span>
        </button>

        {stories.map((story) => (
          <StoryRing
            key={story.id}
            story={story}
            onClick={() => onOpen(story.id)}
          />
        ))}
      </div>
    </section>
  );
}

function StoryProgress({stories, index, progress, paused}) {
  return (
    <div style={styles.progressBar}>
      {stories.map((story, storyIndex) => (
        <span key={story.id} style={styles.progressTrack}>
          <span
            style={{
              ...styles.progressFill,
              width:
                storyIndex < index
                  ? '100%'
                  : storyIndex === index
                    ? `${progress}%`
                    : '0%',
              animationPlayState: paused ? 'paused' : 'running',
            }}
          />
        </span>
      ))}
    </div>
  );
}

function ViewerList({onClose}) {
  const [query, setQuery] = useState('');

  const viewers = [
    {
      id: 'viewer-1',
      name: 'Riya Sharma',
      username: 'riya.sharma',
      avatar: 'https://i.pravatar.cc/100?u=riya',
      time: '2m ago',
      reaction: '❤️',
      follow: true,
      mutual: true,
      closeFriend: true,
    },
    {
      id: 'viewer-2',
      name: 'Aarush Developer',
      username: 'arush.dev',
      avatar: 'https://i.pravatar.cc/100?u=arush',
      time: '8m ago',
      reaction: '🔥',
      follow: true,
      mutual: false,
      closeFriend: false,
    },
    {
      id: 'viewer-3',
      name: 'Creator Lab',
      username: 'creator.lab',
      avatar: 'https://i.pravatar.cc/100?u=creator',
      time: '14m ago',
      reaction: '',
      follow: false,
      mutual: true,
      closeFriend: false,
    },
  ];

  const filtered = viewers.filter((viewer) =>
    `${viewer.name} ${viewer.username}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div style={styles.viewerList}>
      <div style={styles.viewerListHeader}>
        <div>
          <strong>Story Viewers</strong>
          <span>Local viewer list</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={styles.closeButton}
          aria-label="Close viewer list"
        >
          <X size={17} />
        </button>
      </div>

      <div style={styles.viewerSearch}>
        <Search size={15} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search viewers"
          style={styles.viewerSearchInput}
        />
      </div>

      <div style={styles.viewerRows}>
        {filtered.map((viewer) => (
          <div key={viewer.id} style={styles.viewerRow}>
            <img
              src={viewer.avatar}
              alt=""
              style={styles.viewerAvatar}
            />

            <div style={styles.viewerIdentity}>
              <strong>{viewer.name}</strong>
              <span>@{viewer.username}</span>
              <small>
                {viewer.time}
                {viewer.mutual ? ' · Mutual connection' : ''}
              </small>
            </div>

            {viewer.closeFriend ? (
              <span style={styles.closeFriendBadge}>
                Close friend
              </span>
            ) : null}

            {viewer.reaction ? (
              <span style={styles.viewerReaction}>
                {viewer.reaction}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryViewer({story, onClose, onReact, onReply}) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [reply, setReply] = useState('');
  const startY = useRef(null);

  const current = story.stories[index];
  const duration = current.duration || 5000;

  useEffect(() => {
    if (paused || viewersOpen) {
      return undefined;
    }

    const startedAt = Date.now() - (progress / 100) * duration;

    const timer = window.setInterval(() => {
      const next =
        ((Date.now() - startedAt) / duration) * 100;

      if (next >= 100) {
        if (index < story.stories.length - 1) {
          setIndex((value) => value + 1);
          setProgress(0);
        } else {
          onClose();
        }
      } else {
        setProgress(next);
      }
    }, 60);

    return () => window.clearInterval(timer);
  }, [
    duration,
    index,
    onClose,
    paused,
    progress,
    story,
    viewersOpen,
  ]);

  useEffect(() => {
    setProgress(0);
  }, [index]);

  const previous = () => {
    if (index === 0) {
      onClose();
      return;
    }

    setIndex((value) => value - 1);
  };

  const next = () => {
    if (index >= story.stories.length - 1) {
      onClose();
      return;
    }

    setIndex((value) => value + 1);
  };

  const submitReply = () => {
    if (!reply.trim()) {
      return;
    }

    onReply({
      storyId: current.id,
      text: reply.trim(),
    });
    setReply('');
  };

  return (
    <div
      style={styles.viewerOverlay}
      onPointerDown={(event) => {
        startY.current = event.clientY;
      }}
      onPointerUp={(event) => {
        if (startY.current === null) {
          return;
        }

        const delta = event.clientY - startY.current;
        startY.current = null;

        if (delta > 90) {
          onClose();
        }

        if (delta < -90) {
          setViewersOpen(true);
        }
      }}
    >
      <div style={styles.viewerPanel}>
        <StoryProgress
          stories={story.stories}
          index={index}
          progress={progress}
          paused={paused}
        />

        <div style={styles.viewerHeader}>
          <div style={styles.viewerProfile}>
            <img
              src={story.avatar}
              alt=""
              style={styles.viewerAvatar}
            />

            <div style={styles.viewerIdentity}>
              <strong>{story.displayName}</strong>
              <span>
                @{story.username} · {current.time}
              </span>
            </div>

            {story.verified ? (
              <span style={styles.verifiedBadge}>
                <Check size={9} />
              </span>
            ) : null}
          </div>

          <div style={styles.viewerActions}>
            <span style={styles.privacyBadge}>
              <Lock size={10} />
              {story.privacy}
            </span>

            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              style={styles.viewerButton}
              aria-label={paused ? 'Resume story' : 'Pause story'}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={styles.viewerButton}
              aria-label="Close story viewer"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={previous}
          style={styles.leftTapZone}
          aria-label="Previous story"
        />

        <button
          type="button"
          onClick={next}
          style={styles.rightTapZone}
          aria-label="Next story"
        />

        <div
          style={{
            ...styles.storyCanvas,
            background:
              current.type === 'text'
                ? current.background ||
                  'linear-gradient(135deg,#7c5cff,#4dd7ff)'
                : '#080b12',
          }}
        >
          {current.type === 'video' ? (
            <video
              src={current.url}
              autoPlay
              muted
              playsInline
              style={styles.storyMedia}
            />
          ) : current.type === 'image' ? (
            <img
              src={current.url}
              alt={current.text || 'Story'}
              style={styles.storyMedia}
            />
          ) : (
            <div style={styles.textStory}>
              <Sparkles size={30} />
              <strong>{current.text}</strong>
            </div>
          )}

          {current.text && current.type !== 'text' ? (
            <div style={styles.storyCaption}>{current.text}</div>
          ) : null}
        </div>

        <div style={styles.reactions}>
          {['❤️', '🔥', '😍', '😂', '😮', '😢', '👏', '👍'].map(
            (reaction) => (
              <button
                type="button"
                key={reaction}
                onClick={() =>
                  onReact({
                    storyId: current.id,
                    reaction,
                  })
                }
                style={styles.reactionButton}
                aria-label={`React ${reaction}`}
              >
                {reaction}
              </button>
            )
          )}
        </div>

        <div style={styles.replyBar}>
          <input
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Reply privately"
            style={styles.replyInput}
            onFocus={() => setPaused(true)}
          />

          <button
            type="button"
            onClick={() => setReply((value) => `${value} 😊`)}
            style={styles.replyTool}
            aria-label="Add emoji"
          >
            😊
          </button>

          <button
            type="button"
            onClick={submitReply}
            style={styles.replySend}
            aria-label="Send reply"
          >
            <Send size={15} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setViewersOpen(true)}
          style={styles.viewerHint}
        >
          <Eye size={13} />
          Swipe up for viewers
        </button>

        {viewersOpen ? (
          <ViewerList onClose={() => setViewersOpen(false)} />
        ) : null}
      </div>
    </div>
  );
}

function StoryAnalytics() {
  const metrics = [
    ['Total Views', '248'],
    ['Unique Viewers', '214'],
    ['Completion Rate', '82%'],
    ['Reactions', '46'],
    ['Replies', '18'],
    ['Shares', '9'],
  ];

  return (
    <SectionCard
      title="Your Story Analytics"
      icon={TrendingUp}
      actionText="Local metrics"
    >
      <div style={styles.analyticsGrid}>
        {metrics.map(([label, value]) => (
          <div key={label} style={styles.analyticsCard}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div style={styles.comingSoon}>
        <Shield size={14} />
        Screenshot and screen recording detection: Coming Soon
        (Android Native Integration)
      </div>
    </SectionCard>
  );
}

function SystemsSection() {
  const systems = [
    'Story Engine',
    'Viewer Engine',
    'Privacy Engine',
    'Close Friends Engine',
    'Archive Engine',
    'Highlight Engine',
    'Analytics Engine',
    'AI Story Engine',
  ];

  return (
    <SectionCard
      title="Background Story Systems"
      icon={Settings2}
      actionText="Expandable status"
    >
      <details>
        <summary style={styles.systemSummary}>
          View local Story Engine status
        </summary>

        <div style={styles.systemGrid}>
          {systems.map((system, index) => {
            const status =
              index === 1
                ? 'Syncing'
                : index >= 6
                  ? 'Protected'
                  : 'Active';

            return (
              <div key={system} style={styles.systemCard}>
                <span>{system}</span>
                <small style={styles.systemStatus(status)}>
                  {status}
                </small>
              </div>
            );
          })}
        </div>
      </details>
    </SectionCard>
  );
}

export default function HomeFeed() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('personalized');
  const [posts, setPosts] = useState(basePosts);
  const [page, setPage] = useState(1);
  const [stories, setStories] = useState(() =>
    readLocal(STORY_STORAGE_KEY, defaultStories)
  );
  
  const [viewerId, setViewerId] = useState(null);
  const [privacy, setPrivacy] = useState(() =>
    readLocal(STORY_PRIVACY_STORAGE_KEY, 'Public')
  );
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    writeLocal(STORY_STORAGE_KEY, stories);
  }, [stories]);

  useEffect(() => {
    writeLocal(STORY_PRIVACY_STORAGE_KEY, privacy);
  }, [privacy]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setPage((value) => value + 1);
        }
      },
      { rootMargin: '600px 0px' }
    );

    const node = sentinelRef.current;

    if (node) {
      observer.observe(node);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (page === 1) {
      return;
    }

    const nextBatch = basePosts.map((post, index) => ({
      ...post,
      id: `${post.id}-page-${page}-${index}`,
      timeAgo: `${page * 3 + index}h`,
      likeCount: post.likeCount + page * 12 + index * 4,
      commentCount: post.commentCount + page * 3 + index,
      viewCount: post.viewCount + page * 950 + index * 120,
      saveCount: post.saveCount + page * 8 + index * 2,
    }));

    setPosts((current) => [...current, ...nextBatch]);
  }, [page]);

  const visiblePosts = useMemo(() => {
    if (mode === 'following') {
      return posts.filter((post) => post.isFollowing);
    }

    if (mode === 'trending') {
      return [...posts].sort(
        (first, second) =>
          second.likeCount - first.likeCount
      );
    }

    return posts;
  }, [mode, posts]);

  const viewerStory = stories.find(
    (story) => story.id === viewerId
  );

  const createLocalStory = (type) => {
    const newStory = {
      id: `story-me-${Date.now()}`,
      username: 'your.story',
      displayName: 'Your Story',
      avatar: 'https://i.pravatar.cc/160?u=aarush-current',
      verified: false,
      ring: 'unseen',
      seen: false,
      privacy,
      stories: [
        {
          id: `story-me-item-${Date.now()}`,
          type,
          text: 'Your new Aarush story',
          time: 'now',
          duration: 5000,
          background:
            'linear-gradient(135deg,#7c5cff,#ff4fd8,#4dd7ff)',
        },
      ],
    };

    setStories((current) => [
      newStory,
      ...current.filter((story) => story.id !== newStory.id),
    ]);
    setCreateOpen(false);
    setViewerId(newStory.id);
  };

  const saveReply = ({storyId, text}) => {
    const current = readLocal(STORY_REPLY_STORAGE_KEY, []);

    writeLocal(STORY_REPLY_STORAGE_KEY, [
      ...current,
      {
        id: `reply-${Date.now()}`,
        storyId,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);

    window.dispatchEvent(
      new CustomEvent('aarush:story-reply', {
        detail: {storyId, text},
      })
    );
  };

  const styles = {
    page: {
      minHeight: '100vh',
      paddingBottom: '6.8rem',
      color: '#f4f7ff',
      background:
        'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
    },

    main: {
      width: '100%',
      maxWidth: '760px',
      margin: '0 auto',
      padding: '0.9rem',
      boxSizing: 'border-box',
    },

    tabs: {
      display: 'flex',
      gap: '0.55rem',
      overflowX: 'auto',
      marginBottom: '0.95rem',
      scrollbarWidth: 'none',
    },

    feedStack: {
      display: 'grid',
      gap: 0,
    },

    sectionTitleRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      margin: '0.9rem 0 0.7rem',
    },

    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '0.32rem 0.55rem',
      border: '1px solid rgba(124,92,255,0.18)',
      borderRadius: '999px',
      color: '#d9e2ff',
      background: 'rgba(124,92,255,0.16)',
      fontSize: '0.72rem',
      fontWeight: 800,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.page}>
      <TopBar
        pageTitle="Aarush"
        notificationCount={3}
        onSecretAccess={() => navigate('/account-switch')}
      />

      <main style={styles.main}>
        <StoryTray
          stories={stories}
          onOpen={setViewerId}
          onAddStory={() => setCreateOpen(true)}
        />

        <div style={styles.tabs}>
          <FeedModeTab
            active={mode === 'personalized'}
            onClick={() => setMode('personalized')}
          >
            Personalized
          </FeedModeTab>

          <FeedModeTab
            active={mode === 'following'}
            onClick={() => setMode('following')}
          >
            Following
          </FeedModeTab>

          <FeedModeTab
            active={mode === 'trending'}
            onClick={() => setMode('trending')}
          >
            Trending
          </FeedModeTab>
        </div>

        <div style={styles.sectionTitleRow}>
          <h2 style={{margin: 0, fontSize: '0.98rem'}}>
            Story privacy
          </h2>

          <button
            type="button"
            onClick={() => setPrivacyOpen((value) => !value)}
            style={styles.badge}
          >
            <Lock size={13} />
            {privacy}
          </button>
        </div>

        {privacyOpen ? (
          <SectionCard
            title="Story Privacy"
            icon={Shield}
            actionText="Stored locally"
          >
            <div style={styles.privacyGrid}>
              {[
                'Public',
                'Followers',
                'Close Friends',
                'Custom',
                'Private Story',
                'Hidden From',
                'Only Me',
              ].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => {
                    setPrivacy(option);
                    setPrivacyOpen(false);
                  }}
                  style={{
                    ...styles.privacyButton,
                    ...(privacy === option
                      ? styles.activePrivacyButton
                      : {}),
                  }}
                >
                  {option}
                  {privacy === option ? <Check size={13} /> : null}
                </button>
              ))}
            </div>
          </SectionCard>
        ) : null}

        

        <StoryAnalytics />

        <SectionCard
          title="Suggested posts"
          icon={Sparkles}
          actionText="Discovery"
        >
          <div style={{display: 'grid', gap: '0.8rem'}}>
            {suggestedPosts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Trending hashtags"
          icon={Flame}
          actionText="Popular"
        >
          <div style={styles.chips}>
            {trendingHashtags.map((tag) => (
              <span key={tag} style={styles.chip}>
                <Hash size={13} />
                {tag}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Home feed"
          icon={TrendingUp}
          actionText={
            mode === 'trending'
              ? 'Trending'
              : mode === 'following'
                ? 'Following'
                : 'Personalized'
          }
        >
          <div style={styles.feedStack}>
            {visiblePosts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Nearby content"
          icon={MapPin}
          actionText="Location-based"
        >
          <div style={{display: 'grid', gap: '0.8rem'}}>
            {nearbyContent.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Explore shortcut"
          icon={Search}
          actionText="Open"
        >
          <NavLink to="/search" style={styles.exploreShortcut}>
            <div>
              <strong>Open Explore</strong>
              <p>
                Discover creators, hashtags, reels, and nearby content.
              </p>
            </div>

            <ChevronRight size={18} />
          </NavLink>
        </SectionCard>

        <SystemsSection />

        <SectionCard
          title="Future Story Lab"
          icon={Sparkles}
          actionText="Coming Soon"
        >
          <div style={styles.futureGrid}>
            {[
              'Collaborative Stories',
              'Story Communities',
              'Live Stories',
              'AR Stories',
              'AI Story Generator',
              'Story Translation',
              'Cross-Device Story Sync',
            ].map((feature) => (
              <div key={feature} style={styles.futureCard}>
                <span>{feature}</span>
                <small>Coming Soon</small>
              </div>
            ))}
          </div>
        </SectionCard>

        <div
          ref={sentinelRef}
          style={{height: '1px', opacity: 0}}
          aria-hidden="true"
        />
      </main>

      <BottomNav />

      {viewerStory ? (
        <StoryViewer
          story={viewerStory}
          onClose={() => setViewerId(null)}
          onReact={({storyId, reaction}) => {
            setStories((current) =>
              current.map((story) =>
                story.stories.some(
                  (item) => item.id === storyId
                )
                  ? {...story, reaction}
                  : story
              )
            );
          }}
          onReply={saveReply}
        />
      ) : null}

      {createOpen ? (
        <div style={styles.modalOverlay}>
          <div style={styles.createModal}>
            <div style={styles.modalHeader}>
              <div>
                <strong>Create Story</strong>
                <span>Local frontend story composer</span>
              </div>

              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                style={styles.closeButton}
                aria-label="Close story composer"
              >
                <X size={17} />
              </button>
            </div>

            <div style={styles.createGrid}>
              <button
                type="button"
                onClick={() => createLocalStory('image')}
                style={styles.createOption}
              >
                <ImageIcon size={18} />
                Image
              </button>

              <button
                type="button"
                onClick={() => createLocalStory('video')}
                style={styles.createOption}
              >
                <Video size={18} />
                Video
              </button>

              <button
                type="button"
                onClick={() => createLocalStory('text')}
                style={styles.createOption}
              >
                <FileText size={18} />
                Text
              </button>

              <button
                type="button"
                onClick={() => createLocalStory('ai')}
                style={styles.createOption}
              >
                <Sparkles size={18} />
                AI Story
              </button>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('aarush:story-camera')
                  )
                }
                style={styles.createOption}
              >
                <Camera size={18} />
                Camera
              </button>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('aarush:story-vault')
                  )
                }
                style={styles.createOption}
              >
                <FolderLock size={18} />
                Vault
              </button>
            </div>

            <div style={styles.privacyNotice}>
              <Shield size={14} />
              Privacy: {privacy}
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .aarush-story-ring {
          animation: aarush-ring-pulse 2.4s ease-in-out infinite;
        }

        .aarush-story-ring.seen {
          background: linear-gradient(135deg, #5b6579, #303747) !important;
          animation: none;
        }

        .aarush-story-ring.close {
          background: linear-gradient(135deg, #39e58c, #0b9c65) !important;
        }

        .aarush-story-ring.private {
          background: linear-gradient(135deg, #4dd7ff, #2469df) !important;
        }

        .aarush-story-ring.verified {
          background: linear-gradient(135deg, #ffdc73, #ff9f43, #7c5cff) !important;
        }

        .aarush-story-ring.ai {
          background: linear-gradient(135deg, #4dd7ff, #7c5cff, #ff4fd8) !important;
        }

        @keyframes aarush-ring-pulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }

          50% {
            transform: scale(1.04);
            filter: brightness(1.16);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aarush-story-ring {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  sectionCard: {
    marginBottom: '0.95rem',
    padding: '0.95rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.25rem',
    background: 'rgba(15,19,30,0.9)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
  },
  sectionIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '999px',
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.2), rgba(77,215,255,0.14))',
  },
  sectionTitle: {
    margin: 0,
    color: '#f4f7ff',
    fontSize: '0.98rem',
    fontWeight: 800,
  },
  sectionAction: {
    color: '#8ea0c2',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  storyTray: {
    marginBottom: '0.95rem',
    padding: '0.95rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.25rem',
    background:
      'linear-gradient(145deg, rgba(21,26,44,0.94), rgba(10,14,23,0.94))',
    boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
  },
  storyHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    marginBottom: '0.8rem',
  },
  storyTitle: {
    margin: 0,
    color: '#f5f8ff',
    fontSize: '1rem',
    fontWeight: 900,
  },
  storySubtitle: {
    margin: '0.25rem 0 0',
    color: '#91a0ba',
    fontSize: '0.72rem',
  },
  addStoryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.48rem 0.6rem',
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
    fontSize: '0.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },
  storyScroller: {
    display: 'flex',
    gap: '0.78rem',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  storyItem: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.35rem',
    flexShrink: 0,
    padding: 0,
    border: 0,
    color: '#ffffff',
    background: 'transparent',
    cursor: 'pointer',
  },
  storyRing: {
    position: 'relative',
    width: '4.05rem',
    height: '4.05rem',
    display: 'grid',
    placeItems: 'center',
    padding: '3px',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #ff4fd8, #7c5cff, #4dd7ff)',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    border: '3px solid #101521',
    borderRadius: '999px',
  },
  storyName: {
    maxWidth: '4.7rem',
    overflow: 'hidden',
    color: '#dce5f7',
    fontSize: '0.66rem',
    fontWeight: 750,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  yourStory: {
    display: 'grid',
    justifyItems: 'center',
    gap: '0.35rem',
    flexShrink: 0,
    padding: 0,
    border: 0,
    color: '#ffffff',
    background: 'transparent',
    cursor: 'pointer',
  },
  yourStoryRing: {
    position: 'relative',
    width: '4.05rem',
    height: '4.05rem',
    display: 'grid',
    placeItems: 'center',
    padding: '3px',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, #7c5cff, #ff4fd8, #4dd7ff)',
  },
  yourStoryAvatar: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    border: '3px solid #101521',
    borderRadius: '999px',
    color: '#dce5f7',
    background: '#20283b',
  },
  addBadge: {
    position: 'absolute',
    right: '-0.05rem',
    bottom: '-0.05rem',
    width: '1.3rem',
    height: '1.3rem',
    display: 'grid',
    placeItems: 'center',
    border: '2px solid #101521',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },
  verifiedBadge: {
    width: '0.95rem',
    height: '0.95rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
  },
  chips: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    flexShrink: 0,
    padding: '0.55rem 0.75rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '999px',
    color: '#dfe7fb',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.78rem',
    fontWeight: 800,
  },
  highlightsScroller: {
    display: 'flex',
    gap: '0.6rem',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  highlightCard: {
    position: 'relative',
    width: '5.4rem',
    height: '6.4rem',
    flexShrink: 0,
    overflow: 'hidden',
    padding: 0,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1rem',
    color: '#ffffff',
    background: '#151b2b',
    cursor: 'pointer',
  },
  highlightCover: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  highlightOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg, transparent 25%, rgba(0,0,0,0.82))',
  },
  highlightText: {
    position: 'absolute',
    right: '0.4rem',
    bottom: '0.4rem',
    left: '0.4rem',
    display: 'grid',
    gap: '0.1rem',
    textAlign: 'left',
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.45rem',
  },
  analyticsCard: {
    display: 'grid',
    gap: '0.22rem',
    padding: '0.6rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.75rem',
    background: 'rgba(255,255,255,0.04)',
  },
  comingSoon: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    marginTop: '0.65rem',
    padding: '0.55rem',
    borderRadius: '0.7rem',
    color: '#ffcf8a',
    background: 'rgba(255,207,138,0.08)',
    fontSize: '0.66rem',
  },
  systemSummary: {
    color: '#a9b6cd',
    fontSize: '0.72rem',
    cursor: 'pointer',
  },
  systemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
    gap: '0.45rem',
    marginTop: '0.7rem',
  },
  systemCard: {
    display: 'grid',
    gap: '0.35rem',
    minHeight: '3.7rem',
    alignContent: 'space-between',
    padding: '0.62rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.8rem',
    color: '#dce5f5',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '0.7rem',
    fontWeight: 750,
  },
  systemStatus: (status) => ({
    width: 'fit-content',
    padding: '0.22rem 0.4rem',
    borderRadius: '999px',
    color: '#ffffff',
    background:
      status === 'Active'
        ? 'rgba(61,242,168,0.14)'
        : status === 'Protected'
          ? 'rgba(124,92,255,0.17)'
          : 'rgba(77,215,255,0.14)',
    fontSize: '0.61rem',
    fontWeight: 850,
  }),
  futureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
    gap: '0.45rem',
  },
  futureCard: {
    display: 'grid',
    gap: '0.35rem',
    minHeight: '3.5rem',
    alignContent: 'space-between',
    padding: '0.62rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.8rem',
    color: '#c6d0e2',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))',
    fontSize: '0.7rem',
    fontWeight: 750,
  },
  exploreShortcut: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,0.22)',
    borderRadius: '1.15rem',
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(255,79,216,0.16), rgba(77,215,255,0.16))',
    textDecoration: 'none',
  },
  exploreShortcutP: {
    margin: '0.35rem 0 0',
    color: '#c8d2e4',
    fontSize: '0.78rem',
    lineHeight: 1.5,
  },
  privacyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.45rem',
  },
  privacyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.35rem',
    padding: '0.62rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.75rem',
    color: '#cbd7ea',
    background: 'rgba(255,255,255,0.04)',
    fontSize: '0.7rem',
    textAlign: 'left',
    cursor: 'pointer',
  },
  activePrivacyButton: {
    color: '#ffffff',
    borderColor: 'rgba(124,92,255,0.36)',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },
  viewerOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'grid',
    placeItems: 'center',
    background: '#05070c',
  },
  viewerPanel: {
    position: 'relative',
    width: '100%',
    maxWidth: '620px',
    height: '100dvh',
    overflow: 'hidden',
    background: '#080b12',
  },
  progressBar: {
    position: 'absolute',
    top: '0.65rem',
    right: '0.8rem',
    left: '0.8rem',
    zIndex: 4,
    display: 'flex',
    gap: '0.25rem',
  },
  progressTrack: {
    height: '0.2rem',
    flex: 1,
    overflow: 'hidden',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background: '#ffffff',
    transition: 'width 60ms linear',
  },
  viewerHeader: {
    position: 'absolute',
    top: '1.15rem',
    right: '0.8rem',
    left: '0.8rem',
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.55rem',
    paddingTop: '0.45rem',
  },
  viewerProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    minWidth: 0,
    color: '#ffffff',
  },
  viewerAvatar: {
    width: '2.2rem',
    height: '2.2rem',
    objectFit: 'cover',
    border: '2px solid rgba(255,255,255,0.32)',
    borderRadius: '999px',
  },
  viewerIdentity: {
    display: 'grid',
    gap: '0.1rem',
    minWidth: 0,
  },
  viewerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  privacyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0.3rem 0.4rem',
    borderRadius: '999px',
    color: '#e2d9ff',
    background: 'rgba(0,0,0,0.35)',
    fontSize: '0.6rem',
  },
  viewerButton: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(0,0,0,0.32)',
    cursor: 'pointer',
  },
  leftTapZone: {
    position: 'absolute',
    top: '5rem',
    bottom: '6rem',
    left: 0,
    zIndex: 3,
    width: '38%',
    border: 0,
    background: 'transparent',
  },
  rightTapZone: {
    position: 'absolute',
    top: '5rem',
    right: 0,
    bottom: '6rem',
    zIndex: 3,
    width: '62%',
    border: 0,
    background: 'transparent',
  },
  storyCanvas: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
  },
  storyMedia: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  textStory: {
    display: 'grid',
    justifyItems: 'center',
    gap: '1rem',
    maxWidth: '80%',
    color: '#ffffff',
    fontSize: '1.35rem',
    lineHeight: 1.35,
    textAlign: 'center',
  },
  storyCaption: {
    position: 'absolute',
    right: '1rem',
    bottom: '8rem',
    left: '1rem',
    padding: '0.7rem',
    borderRadius: '0.85rem',
    color: '#ffffff',
    background: 'rgba(0,0,0,0.34)',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  reactions: {
    position: 'absolute',
    right: '0.8rem',
    bottom: '4.7rem',
    left: '0.8rem',
    zIndex: 6,
    display: 'flex',
    gap: '0.2rem',
    overflowX: 'auto',
  },
  reactionButton: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '999px',
    background: 'rgba(0,0,0,0.38)',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  replyBar: {
    position: 'absolute',
    right: '0.8rem',
    bottom: '1rem',
    left: '0.8rem',
    zIndex: 6,
    display: 'flex',
    gap: '0.35rem',
    alignItems: 'center',
  },
  replyInput: {
    flex: 1,
    minWidth: 0,
    padding: '0.72rem 0.8rem',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '999px',
    outline: 0,
    color: '#ffffff',
    background: 'rgba(0,0,0,0.45)',
    fontSize: '0.76rem',
  },
  replyTool: {
    width: '2.3rem',
    height: '2.3rem',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '999px',
    background: 'rgba(0,0,0,0.4)',
    fontSize: '1rem',
  },
  replySend: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '999px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },
  viewerHint: {
    position: 'absolute',
    right: '1rem',
    bottom: '7.9rem',
    zIndex: 6,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    border: 0,
    color: 'rgba(255,255,255,0.68)',
    background: 'transparent',
    fontSize: '0.62rem',
    cursor: 'pointer',
  },
  viewerList: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 8,
    maxHeight: '70%',
    overflowY: 'auto',
    padding: '1rem',
    borderRadius: '1.35rem 1.35rem 0 0',
    background: 'rgba(15,20,32,0.98)',
    backdropFilter: 'blur(20px)',
  },
  viewerListHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.7rem',
    color: '#ffffff',
  },
  closeButton: {
    width: '2.1rem',
    height: '2.1rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '999px',
    color: '#ffffff',
    background: 'rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },
  viewerSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.6rem',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem',
    color: '#aab8ce',
    background: 'rgba(255,255,255,0.05)',
  },
  viewerSearchInput: {
    flex: 1,
    border: 0,
    outline: 0,
    color: '#ffffff',
    background: 'transparent',
    fontSize: '0.75rem',
  },
  viewerRows: {
    display: 'grid',
    gap: '0.5rem',
    marginTop: '0.7rem',
  },
  viewerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    borderRadius: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
  },
  viewerIdentity: {
    display: 'grid',
    gap: '0.12rem',
    minWidth: 0,
    flex: 1,
  },
  viewerReaction: {
    fontSize: '1.1rem',
  },
  closeFriendBadge: {
    padding: '0.25rem 0.35rem',
    borderRadius: '999px',
    color: '#a7f3c6',
    background: 'rgba(61,242,168,0.12)',
    fontSize: '0.58rem',
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.45rem',
  },
  analyticsCard: {
    display: 'grid',
    gap: '0.22rem',
    padding: '0.6rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.75rem',
    background: 'rgba(255,255,255,0.04)',
  },
  comingSoon: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    marginTop: '0.65rem',
    padding: '0.55rem',
    borderRadius: '0.7rem',
    color: '#ffcf8a',
    background: 'rgba(255,207,138,0.08)',
    fontSize: '0.66rem',
  },
  systemSummary: {
    color: '#a9b6cd',
    fontSize: '0.72rem',
    cursor: 'pointer',
  },
  systemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
    gap: '0.45rem',
    marginTop: '0.7rem',
  },
  systemCard: {
    display: 'grid',
    gap: '0.35rem',
    minHeight: '3.7rem',
    alignContent: 'space-between',
    padding: '0.62rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.8rem',
    color: '#dce5f5',
    background: 'rgba(255,255,255,0.045)',
    fontSize: '0.7rem',
    fontWeight: 750,
  },
  systemStatus: (status) => ({
    width: 'fit-content',
    padding: '0.22rem 0.4rem',
    borderRadius: '999px',
    color: '#ffffff',
    background:
      status === 'Active'
        ? 'rgba(61,242,168,0.14)'
        : status === 'Protected'
          ? 'rgba(124,92,255,0.17)'
          : 'rgba(77,215,255,0.14)',
    fontSize: '0.61rem',
    fontWeight: 850,
  }),
  futureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
    gap: '0.45rem',
  },
  futureCard: {
    display: 'grid',
    gap: '0.35rem',
    minHeight: '3.5rem',
    alignContent: 'space-between',
    padding: '0.62rem',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.8rem',
    color: '#c6d0e2',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))',
    fontSize: '0.7rem',
    fontWeight: 750,
  },
  exploreShortcut: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,0.22)',
    borderRadius: '1.15rem',
    color: '#ffffff',
    background:
      'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(255,79,216,0.16), rgba(77,215,255,0.16))',
    textDecoration: 'none',
  },
  exploreShortcutP: {
    margin: '0.35rem 0 0',
    color: '#c8d2e4',
    fontSize: '0.78rem',
    lineHeight: 1.5,
  },
  privacyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.45rem',
  },
  privacyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.35rem',
    padding: '0.62rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.75rem',
    color: '#cbd7ea',
    background: 'rgba(255,255,255,0.04)',
    fontSize: '0.7rem',
    textAlign: 'left',
    cursor: 'pointer',
  },
  activePrivacyButton: {
    color: '#ffffff',
    borderColor: 'rgba(124,92,255,0.36)',
    background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 900,
    display: 'grid',
    placeItems: 'center',
    padding: '1rem',
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(10px)',
  },
  createModal: {
    width: 'min(100%, 440px)',
    padding: '1rem',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '1.25rem',
    background: 'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 28px 80px rgba(0,0,0,0.52)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.7rem',
    marginBottom: '0.8rem',
    color: '#ffffff',
  },
  createGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  createOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    minHeight: '3rem',
    padding: '0.7rem',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.8rem',
    color: '#e7eefb',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '0.72rem',
    fontWeight: 750,
    cursor: 'pointer',
  },
  privacyNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    marginTop: '0.8rem',
    padding: '0.6rem',
    borderRadius: '0.7rem',
    color: '#a9edff',
    background: 'rgba(77,215,255,0.07)',
    fontSize: '0.68rem',
  },
};

