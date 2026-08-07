import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Stories from '../components/Stories';
import FeedPost from '../components/FeedPost';
import BottomNav from '../components/BottomNav';
import {
  ChevronRight,
  Compass,
  Flame,
  MapPin,
  Sparkles,
  Users,
  TrendingUp,
  Play,
  Hash,
} from 'lucide-react';

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

const trendingHashtags = [
  '#React',
  '#Supabase',
  '#Reels',
  '#Explore',
  '#Aarush',
  '#Frontend',
  '#CreatorMode',
];

const nearbyContent = [
  {
    id: 'nearby-1',
    username: 'noida.creative',
    verified: true,
    timeAgo: '12m',
    location: 'Noida, India',
    caption:
      'Nearby content placeholder for local discovery. This post is meant to appear in the location-aware section of Home.',
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
      'Another nearby discovery card for future geolocation-based ranking and social recommendation logic.',
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

function FeedModeTab({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: '0',
        borderRadius: '999px',
        padding: '0.62rem 0.9rem',
        background: active
          ? 'linear-gradient(135deg, rgba(124, 92, 255, 0.24), rgba(77, 215, 255, 0.12))'
          : 'rgba(255,255,255,0.05)',
        color: active ? '#ffffff' : '#b0bad0',
        fontSize: '0.8rem',
        fontWeight: 800,
        cursor: 'pointer',
        transition:
          'transform 180ms ease, background 180ms ease, color 180ms ease',
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
    <section
      style={{
        background: 'rgba(15, 19, 30, 0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1.25rem',
        padding: '0.95rem',
        boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        marginBottom: '0.95rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            minWidth: 0,
          }}
        >
          {Icon ? (
            <span
              style={{
                width: '1.9rem',
                height: '1.9rem',
                borderRadius: '999px',
                display: 'grid',
                placeItems: 'center',
                background:
                  'linear-gradient(135deg, rgba(124,92,255,0.2), rgba(77,215,255,0.14))',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <Icon size={14} />
            </span>
          ) : null}

          <h2
            style={{
              margin: 0,
              color: '#f4f7ff',
              fontSize: '0.98rem',
              fontWeight: 800,
            }}
          >
            {title}
          </h2>
        </div>

        {actionText ? (
          <span
            style={{
              color: '#8ea0c2',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            {actionText}
          </span>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function Chips({ items, icon: Icon }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.1rem',
        scrollbarWidth: 'none',
      }}
    >
      {items.map((item) => (
        <span
          key={item}
          style={{
            flexShrink: 0,
            padding: '0.55rem 0.75rem',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#dfe7fb',
            fontSize: '0.78rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          {Icon ? <Icon size={13} /> : null}
          {item}
        </span>
      ))}
    </div>
  );
}

function ExploreShortcut() {
  return (
    <NavLink
      to="/search"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        borderRadius: '1.15rem',
        padding: '1rem',
        textDecoration: 'none',
        color: '#fff',
        background:
          'linear-gradient(135deg, rgba(124,92,255,0.22) 0%, rgba(255,79,216,0.16) 45%, rgba(77,215,255,0.16) 100%)',
        border: '1px solid rgba(124, 92, 255, 0.22)',
        boxShadow: '0 12px 30px rgba(124, 92, 255, 0.12)',
      }}
    >
      <div style={{ display: 'grid', gap: '0.35rem' }}>
        <strong style={{ fontSize: '0.98rem' }}>Open Explore</strong>

        <span
          style={{
            color: '#e4eaf8',
            fontSize: '0.82rem',
            lineHeight: 1.5,
          }}
        >
          Discover creators, hashtags, reels, and nearby content.
        </span>
      </div>

      <span
        style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '999px',
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(255,255,255,0.12)',
          flexShrink: 0,
        }}
      >
        <ChevronRight size={16} />
      </span>
    </NavLink>
  );
}

export default function HomeFeed() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('personalized');
  const [posts, setPosts] = useState(basePosts);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef(null);

  const visiblePosts = useMemo(() => {
    if (mode === 'following') {
      return posts.filter((post) => post.isFollowing);
    }

    if (mode === 'trending') {
      return [...posts].sort((a, b) => b.likeCount - a.likeCount);
    }

    return posts;
  }, [posts, mode]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setPage((current) => current + 1);
        }
      },
      { rootMargin: '600px 0px' }
    );

    const node = sentinelRef.current;

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }

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

  const styles = {
    page: {
      minHeight: '100vh',
      background:
        'radial-gradient(circle at top, rgba(34, 43, 68, 0.45) 0%, rgba(10, 13, 20, 1) 38%, rgba(7, 9, 14, 1) 100%)',
      color: '#f4f7ff',
      paddingBottom: '6.8rem',
    },
    main: {
      width: '100%',
      maxWidth: '760px',
      margin: '0 auto',
      padding: '0.9rem 0.9rem 0',
    },
    tabsRow: {
      display: 'flex',
      gap: '0.55rem',
      overflowX: 'auto',
      paddingBottom: '0.2rem',
      marginBottom: '0.95rem',
      scrollbarWidth: 'none',
    },
    feedStack: {
      display: 'grid',
      gap: 0,
    },
    loadMore: {
      height: '1px',
      opacity: 0,
    },
    nearbyGrid: {
      display: 'grid',
      gap: '0.7rem',
    },
    nearbyItem: {
      padding: '0.85rem',
      borderRadius: '1rem',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
    },
    subtitle: {
      margin: 0,
      color: '#97a4c2',
      fontSize: '0.84rem',
      lineHeight: 1.5,
    },
    sectionTitleRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      margin: '0.9rem 0 0.7rem',
    },
    badge: {
      padding: '0.32rem 0.55rem',
      borderRadius: '999px',
      background: 'rgba(124, 92, 255, 0.16)',
      color: '#d9e2ff',
      border: '1px solid rgba(124, 92, 255, 0.18)',
      fontSize: '0.72rem',
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
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
        <Stories />

        <div style={styles.tabsRow}>
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

        <SectionCard
          title="Suggested posts"
          icon={Sparkles}
          actionText="Discovery"
        >
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {suggestedPosts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        </SectionCard>

        <div style={styles.sectionTitleRow}>
          <h2 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>
            Trending hashtags
          </h2>

          <span style={styles.badge}>
            <TrendingUp size={13} />
            Live
          </span>
        </div>

        <SectionCard
          title="Trending hashtags"
          icon={Flame}
          actionText="Popular"
        >
          <Chips items={trendingHashtags} icon={Hash} />
        </SectionCard>

        <div style={styles.sectionTitleRow}>
          <h2 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>
            Home feed
          </h2>

          <span
            style={{
              color: '#8ea0c2',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            {mode === 'trending'
              ? 'Trending'
              : mode === 'following'
                ? 'Following'
                : 'Personalized'}
          </span>
        </div>

        <div style={styles.feedStack}>
          {visiblePosts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </div>

        <SectionCard
          title="Nearby content"
          icon={MapPin}
          actionText="Location-based"
        >
          <div style={styles.nearbyGrid}>
            {nearbyContent.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}

            <div style={styles.nearbyItem}>
              <strong
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                Nearby discovery
              </strong>

              <p style={styles.subtitle}>
                This section is prepared for location-based stories, reels, and
                posts in future Supabase integration.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Explore shortcut"
          icon={Compass}
          actionText="Open"
        >
          <ExploreShortcut />
        </SectionCard>

        <SectionCard
          title="Trending reels"
          icon={Play}
          actionText="Preview"
        >
          <div style={styles.nearbyGrid}>
            <div style={styles.nearbyItem}>
              <strong
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                Reel preview 1
              </strong>

              <p style={styles.subtitle}>
                Short-form video placeholder for future reels and creator
                discovery.
              </p>
            </div>

            <div style={styles.nearbyItem}>
              <strong
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                Reel preview 2
              </strong>

              <p style={styles.subtitle}>
                Built to scale into autoplay, ranking, and watch-time analytics
                later.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Suggested creators"
          icon={Users}
          actionText="Follow"
        >
          <div style={styles.nearbyGrid}>
            <div style={styles.nearbyItem}>
              <strong
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                creator.network
              </strong>

              <p style={styles.subtitle}>
                Design systems, product UI, and motion.
              </p>
            </div>

            <div style={styles.nearbyItem}>
              <strong
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                frame.motion
              </strong>

              <p style={styles.subtitle}>
                Reels, short videos, and creative experiments.
              </p>
            </div>
          </div>
        </SectionCard>

        <div ref={sentinelRef} style={styles.loadMore} aria-hidden="true" />
      </main>

      <BottomNav />
    </div>
  );
}