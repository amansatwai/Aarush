import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Flame,
  Hash,
  Heart,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Mic,
  Navigation,
  Play,
  Search as SearchIcon,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react';

const users = [
  {
    id: 'user-1',
    username: 'arush.dev',
    verified: true,
    bio: 'Building Aarush with React, Vite, Supabase, and modern social UX.',
    followers: 18400,
    mutualFollowers: 12,
    avatar: 'A',
    gradient: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
  },
  {
    id: 'user-2',
    username: 'design.loop',
    verified: true,
    bio: 'Product design, motion systems, and interface experiments.',
    followers: 92700,
    mutualFollowers: 8,
    avatar: 'D',
    gradient: 'linear-gradient(135deg, #ff4fd8, #7c5cff)',
  },
  {
    id: 'user-3',
    username: 'creator.lab',
    verified: false,
    bio: 'Creator tools, video workflows, and publishing experiments.',
    followers: 24600,
    mutualFollowers: 4,
    avatar: 'C',
    gradient: 'linear-gradient(135deg, #ffb347, #ff4fd8)',
  },
];

const posts = [
  {
    id: 'post-1',
    type: 'photo',
    username: 'arush.dev',
    title: 'Aarush Home Feed',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80',
    likes: 1284,
    comments: 92,
  },
  {
    id: 'post-2',
    type: 'photo',
    username: 'design.loop',
    title: 'Interface composition',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
    likes: 842,
    comments: 44,
  },
  {
    id: 'post-3',
    type: 'photo',
    username: 'pixel.hub',
    title: 'Creative workspace',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    likes: 631,
    comments: 28,
  },
  {
    id: 'post-4',
    type: 'reel',
    username: 'video.studio',
    title: 'Short-form video',
    image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=900&q=80',
    likes: 3510,
    comments: 189,
  },
  {
    id: 'post-5',
    type: 'photo',
    username: 'travel.frame',
    title: 'Weekend discovery',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    likes: 1920,
    comments: 77,
  },
  {
    id: 'post-6',
    type: 'reel',
    username: 'motion.frame',
    title: 'Motion study',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    likes: 8600,
    comments: 214,
  },
  {
    id: 'post-7',
    type: 'photo',
    username: 'food.story',
    title: 'Local food discovery',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    likes: 740,
    comments: 31,
  },
  {
    id: 'post-8',
    type: 'reel',
    username: 'creator.lab',
    title: 'Creator workflow',
    image: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=80',
    likes: 5320,
    comments: 126,
  },
];

const hashtags = [
  { id: 'tag-1', name: '#React', posts: '284K', trending: true },
  { id: 'tag-2', name: '#Supabase', posts: '92K', trending: true },
  { id: 'tag-3', name: '#Aarush', posts: '18K', trending: true },
  { id: 'tag-4', name: '#Frontend', posts: '1.2M', trending: false },
  { id: 'tag-5', name: '#Reels', posts: '8.4M', trending: true },
  { id: 'tag-6', name: '#CreatorTools', posts: '64K', trending: false },
];

const locations = [
  { id: 'place-1', name: 'Ghaziabad', city: 'Ghaziabad', country: 'India', posts: '84K', nearby: true },
  { id: 'place-2', name: 'Delhi NCR', city: 'New Delhi', country: 'India', posts: '1.8M', nearby: true },
  { id: 'place-3', name: 'Bengaluru Tech District', city: 'Bengaluru', country: 'India', posts: '642K', nearby: false },
];

const recentSearches = ['Aarush', '#React', 'design.loop', 'Ghaziabad'];

const filterItems = [
  { key: 'top', label: 'Top', icon: Sparkles },
  { key: 'accounts', label: 'Accounts', icon: Users },
  { key: 'reels', label: 'Reels', icon: Video },
  { key: 'posts', label: 'Posts', icon: ImageIcon },
  { key: 'hashtags', label: 'Hashtags', icon: Hash },
  { key: 'places', label: 'Places', icon: MapPin },
  { key: 'nearby', label: 'Nearby', icon: Navigation },
  { key: 'trending', label: 'Trending', icon: TrendingUp },
];

const categories = [
  { label: 'Trending', icon: Flame, color: '#ff83c7' },
  { label: 'Technology', icon: Sparkles, color: '#72e3ff' },
  { label: 'Music', icon: Play, color: '#c3a0ff' },
  { label: 'Gaming', icon: Compass, color: '#8cf0be' },
  { label: 'Sports', icon: TrendingUp, color: '#ffd27c' },
  { label: 'Fashion', icon: Users, color: '#ff9fbc' },
  { label: 'Travel', icon: Navigation, color: '#8fd8ff' },
  { label: 'Food', icon: Sparkles, color: '#ffbd81' },
  { label: 'Art', icon: ImageIcon, color: '#d0a5ff' },
  { label: 'Education', icon: Check, color: '#9ff0d0' },
];

function formatCount(value) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function Avatar({ user }) {
  return (
    <div
      style={{
        width: '3rem',
        height: '3rem',
        borderRadius: '999px',
        padding: '2.5px',
        background: user.gradient || 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
        boxShadow: '0 0 18px rgba(124,92,255,0.16)',
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
          background: 'linear-gradient(135deg, #141a2a, #252d48)',
          color: '#fff',
          fontWeight: 900,
        }}
      >
        {user.avatar}
      </div>
    </div>
  );
}

function FilterButton({ item, active, onClick }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.58rem 0.75rem',
        borderRadius: '999px',
        border: `1px solid ${active ? 'rgba(124,92,255,0.34)' : 'rgba(255,255,255,0.07)'}`,
        background: active
          ? 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))'
          : 'rgba(255,255,255,0.05)',
        color: active ? '#ffffff' : '#adb8d0',
        fontSize: '0.78rem',
        fontWeight: 800,
        cursor: 'pointer',
        transition: 'transform 180ms ease, background 180ms ease, color 180ms ease',
      }}
    >
      <Icon size={14} />
      {item.label}
    </button>
  );
}

function UserResult({ user, onFollow }) {
  const [following, setFollowing] = useState(false);

  const handleFollow = () => {
    setFollowing((current) => !current);
    if (typeof onFollow === 'function') onFollow(user);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem',
        borderRadius: '1.1rem',
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <Avatar user={user} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <strong style={{ color: '#f5f8ff', fontSize: '0.9rem' }}>{user.username}</strong>
          {user.verified ? (
            <span
              style={{
                width: '1rem',
                height: '1rem',
                borderRadius: '999px',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 900,
              }}
            >
              ✓
            </span>
          ) : null}
        </div>
        <p
          style={{
            margin: '0.25rem 0',
            color: '#9ca8c2',
            fontSize: '0.78rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.bio}
        </p>
        <span style={{ color: '#77849f', fontSize: '0.72rem', fontWeight: 700 }}>
          {formatCount(user.followers)} followers · {user.mutualFollowers} mutual followers
        </span>
      </div>

      <button
        type="button"
        onClick={handleFollow}
        style={{
          border: '0',
          borderRadius: '999px',
          padding: '0.58rem 0.78rem',
          background: following
            ? 'rgba(255,255,255,0.08)'
            : 'linear-gradient(135deg, rgba(124,92,255,0.28), rgba(77,215,255,0.14))',
          color: '#fff',
          fontSize: '0.76rem',
          fontWeight: 850,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

function ContentCard({ item }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <article
      style={{
        position: 'relative',
        aspectRatio: '1 / 1.12',
        overflow: 'hidden',
        borderRadius: '1rem',
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
      }}
    >
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          transition: 'transform 300ms ease',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 35%, rgba(0,0,0,0.78) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '0.55rem',
          left: '0.55rem',
          right: '0.55rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.4rem',
        }}
      >
        <span
          style={{
            padding: '0.35rem 0.5rem',
            borderRadius: '999px',
            background: 'rgba(5,8,15,0.52)',
            color: '#fff',
            fontSize: '0.68rem',
            fontWeight: 800,
            backdropFilter: 'blur(10px)',
          }}
        >
          @{item.username}
        </span>

        {item.type === 'reel' ? (
          <span
            style={{
              width: '1.9rem',
              height: '1.9rem',
              borderRadius: '999px',
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(5,8,15,0.52)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Play size={13} fill="currentColor" />
          </span>
        ) : null}
      </div>

      <div
        style={{
          position: 'absolute',
          left: '0.65rem',
          right: '0.65rem',
          bottom: '0.6rem',
          display: 'grid',
          gap: '0.5rem',
        }}
      >
        <strong style={{ color: '#fff', fontSize: '0.8rem', lineHeight: 1.25 }}>{item.title}</strong>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: '#eef3ff' }}>
          <button
            type="button"
            onClick={() => setLiked((current) => !current)}
            aria-label="Like content"
            style={{
              border: 0,
              background: 'transparent',
              color: liked ? '#ff83c7' : '#fff',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 800,
            }}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
            {formatCount(item.likes + (liked ? 1 : 0))}
          </button>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: 800 }}>
            <MessageCircle size={14} />
            {formatCount(item.comments)}
          </span>

          <button
            type="button"
            onClick={() => setSaved((current) => !current)}
            aria-label="Save content"
            style={{
              marginLeft: 'auto',
              border: 0,
              background: 'transparent',
              color: saved ? '#72e3ff' : '#fff',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </article>
  );
}

function HashtagResult({ tag }) {
  const [following, setFollowing] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        padding: '0.8rem',
        borderRadius: '1rem',
        background: 'rgba(255,255,255,0.045)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span
        style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '0.85rem',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
          color: '#dce8ff',
        }}
      >
        <Hash size={17} />
      </span>

      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', color: '#f5f8ff', fontSize: '0.88rem' }}>{tag.name}</strong>
        <span style={{ color: '#97a4c1', fontSize: '0.75rem' }}>
          {tag.posts} posts {tag.trending ? '· Trending now' : ''}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setFollowing((current) => !current)}
        style={{
          border: 0,
          borderRadius: '999px',
          padding: '0.55rem 0.72rem',
          background: following ? 'rgba(255,255,255,0.08)' : 'rgba(124,92,255,0.2)',
          color: '#fff',
          fontSize: '0.74rem',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

function PlaceResult({ place }) {
  return (
    <button
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        width: '100%',
        padding: '0.8rem',
        borderRadius: '1rem',
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.045)',
        color: '#fff',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '0.85rem',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, rgba(77,215,255,0.2), rgba(124,92,255,0.16))',
          color: '#d8f6ff',
        }}
      >
        <MapPin size={17} />
      </span>

      <span style={{ flex: 1 }}>
        <strong style={{ display: 'block', fontSize: '0.86rem' }}>{place.name}</strong>
        <span style={{ color: '#97a4c1', fontSize: '0.75rem' }}>
          {place.city}, {place.country} · {place.posts} posts
        </span>
      </span>

      {place.nearby ? (
        <span
          style={{
            padding: '0.3rem 0.45rem',
            borderRadius: '999px',
            background: 'rgba(77,215,255,0.12)',
            color: '#bff3ff',
            fontSize: '0.66rem',
            fontWeight: 800,
          }}
        >
          Nearby
        </span>
      ) : null}
    </button>
  );
}

function Section({ title, icon: Icon, children, action }) {
  return (
    <section
      style={{
        marginBottom: '0.95rem',
        padding: '0.95rem',
        borderRadius: '1.25rem',
        background: 'rgba(15,19,30,0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.26)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '1.9rem',
              height: '1.9rem',
              borderRadius: '999px',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.14))',
              color: '#fff',
            }}
          >
            <Icon size={14} />
          </span>
          <h2 style={{ margin: 0, color: '#f5f8ff', fontSize: '0.98rem', fontWeight: 850 }}>{title}</h2>
        </div>
        {action ? <span style={{ color: '#8e9bb7', fontSize: '0.78rem', fontWeight: 750 }}>{action}</span> : null}
      </div>
      {children}
    </section>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('top');
  const [showFilters, setShowFilters] = useState(false);
  const [recentItems, setRecentItems] = useState(recentSearches);
  const [resultPage, setResultPage] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const sentinelRef = useRef(null);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) return users;
    return users.filter((user) =>
      [user.username, user.bio].join(' ').toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const filteredHashtags = useMemo(() => {
    if (!normalizedQuery) return hashtags;
    return hashtags.filter((tag) => tag.name.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery]);

  const filteredPlaces = useMemo(() => {
    if (!normalizedQuery) return locations;
    return locations.filter((place) =>
      [place.name, place.city, place.country].join(' ').toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const filteredContent = useMemo(() => {
    if (!normalizedQuery) return posts;
    return posts.filter((post) =>
      [post.username, post.title].join(' ').toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const visibleContent = useMemo(() => {
    let content = filteredContent;

    if (activeFilter === 'reels') {
      content = content.filter((item) => item.type === 'reel');
    }

    if (activeFilter === 'posts') {
      content = content.filter((item) => item.type === 'photo');
    }

    if (activeFilter === 'trending') {
      content = [...content].sort((a, b) => b.likes - a.likes);
    }

    if (activeFilter === 'nearby') {
      content = content.slice(0, 4);
    }

    return Array.from({ length: resultPage }, () => content).flat();
  }, [activeFilter, filteredContent, resultPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setResultPage((current) => current + 1);
        }
      },
      { rootMargin: '500px 0px' }
    );

    const node = sentinelRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
      observer.disconnect();
    };
  }, []);

  const saveSearch = (value) => {
    const cleanValue = value.trim();
    if (!cleanValue) return;
    setRecentItems((current) => [cleanValue, ...current.filter((item) => item !== cleanValue)].slice(0, 8));
  };

  const clearSearch = () => {
    setQuery('');
    setActiveFilter('top');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    saveSearch(query);
  };

  const handleVoiceSearch = () => {
    setIsListening((current) => !current);
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background:
        'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
      color: '#f4f7ff',
      paddingBottom: '6.9rem',
    },
    main: {
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0.9rem 0.9rem 0',
    },
    backRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      marginBottom: '0.9rem',
    },
    iconButton: {
      width: '2.65rem',
      height: '2.65rem',
      borderRadius: '999px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.05)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
    },
    searchForm: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.55rem',
      padding: '0.7rem 0.75rem',
      borderRadius: '1.1rem',
      background: 'rgba(15,19,30,0.92)',
      border: '1px solid rgba(124,92,255,0.22)',
      boxShadow: '0 16px 45px rgba(0,0,0,0.25), 0 0 26px rgba(124,92,255,0.08)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 0,
      background: 'transparent',
      color: '#fff',
      fontSize: '0.95rem',
      fontWeight: 650,
    },
    searchButton: {
      width: '2.55rem',
      height: '2.55rem',
      border: 0,
      borderRadius: '999px',
      background: 'linear-gradient(135deg, #7c5cff, #4dd7ff)',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      flexShrink: 0,
    },
    filters: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      overflowX: 'auto',
      padding: '0.75rem 0 0.2rem',
      scrollbarWidth: 'none',
    },
    categories: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
      gap: '0.55rem',
    },
    category: {
      minHeight: '4.6rem',
      display: 'grid',
      justifyItems: 'center',
      alignContent: 'center',
      gap: '0.35rem',
      padding: '0.55rem 0.25rem',
      borderRadius: '1rem',
      border: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(255,255,255,0.04)',
      color: '#dce5fa',
      fontSize: '0.7rem',
      fontWeight: 800,
      cursor: 'pointer',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '0.7rem',
    },
    resultList: {
      display: 'grid',
      gap: '0.55rem',
    },
    empty: {
      padding: '1.4rem 0.8rem',
      textAlign: 'center',
      color: '#9aa7c1',
      fontSize: '0.86rem',
      lineHeight: 1.55,
    },
    sentinel: {
      height: '1px',
      opacity: 0,
    },
  };

  return (
    <div style={styles.page}>
      <TopBar pageTitle="Search" notificationCount={3} />

      <main style={styles.main}>
        <div style={styles.backRow}>
          <button type="button" onClick={() => navigate(-1)} style={styles.iconButton} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#aab6cf',
              fontSize: '0.78rem',
              fontWeight: 750,
            }}
          >
            <Compass size={14} />
            Explore & Discover
          </span>

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            style={styles.iconButton}
            aria-label="Toggle search filters"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <SearchIcon size={18} color="#8fa0c2" />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users, posts, reels, hashtags, places"
            style={styles.searchInput}
            aria-label="Search Aarush"
          />

          {query ? (
            <button type="button" onClick={clearSearch} style={styles.iconButton} aria-label="Clear search">
              <X size={16} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleVoiceSearch}
            style={{
              ...styles.iconButton,
              color: isListening ? '#ff83c7' : '#fff',
              boxShadow: isListening ? '0 0 20px rgba(255,79,216,0.24)' : 'none',
            }}
            aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
          >
            <Mic size={17} />
          </button>

          <button type="submit" style={styles.searchButton} aria-label="Submit search">
            <SearchIcon size={17} />
          </button>
        </form>

        {isListening ? (
          <div
            style={{
              marginTop: '0.55rem',
              padding: '0.7rem 0.8rem',
              borderRadius: '0.9rem',
              background: 'rgba(255,79,216,0.1)',
              border: '1px solid rgba(255,79,216,0.16)',
              color: '#ffd3eb',
              fontSize: '0.8rem',
              fontWeight: 750,
            }}
          >
            Voice search is ready for the future Aarush search service.
          </div>
        ) : null}

        {showFilters ? (
          <div style={styles.filters}>
            {filterItems.map((item) => (
              <FilterButton
                key={item.key}
                item={item}
                active={activeFilter === item.key}
                onClick={() => setActiveFilter(item.key)}
              />
            ))}
          </div>
        ) : null}

        {!query ? (
          <>
            <Section title="Recent searches" icon={Clock3} action="Clear">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {recentItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.55rem 0.7rem',
                      borderRadius: '999px',
                      border: '1px solid rgba(255,255,255,0.07)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#dce5fa',
                      fontSize: '0.78rem',
                      fontWeight: 750,
                      cursor: 'pointer',
                    }}
                  >
                    <Clock3 size={13} />
                    {item}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Explore categories" icon={Compass} action="Discover">
              <div style={styles.categories}>
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.label}
                      type="button"
                      onClick={() => setQuery(category.label)}
                      style={styles.category}
                    >
                      <Icon size={18} color={category.color} />
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Trending suggestions" icon={TrendingUp} action="Live">
              <div style={{ display: 'grid', gap: '0.55rem' }}>
                {hashtags.slice(0, 4).map((tag) => (
                  <HashtagResult key={tag.id} tag={tag} />
                ))}
              </div>
            </Section>
          </>
        ) : null}

        <Section title="Account results" icon={Users} action={`${filteredUsers.length} results`}>
          <div style={styles.resultList}>
            {filteredUsers.length ? (
              filteredUsers.map((user) => <UserResult key={user.id} user={user} onFollow={() => saveSearch(user.username)} />)
            ) : (
              <div style={styles.empty}>No account results found for “{query}”.</div>
            )}
          </div>
        </Section>

        <Section title="Hashtag results" icon={Hash} action={`${filteredHashtags.length} results`}>
          <div style={styles.resultList}>
            {filteredHashtags.length ? (
              filteredHashtags.map((tag) => <HashtagResult key={tag.id} tag={tag} />)
            ) : (
              <div style={styles.empty}>No hashtag results found for “{query}”.</div>
            )}
          </div>
        </Section>

        <Section title="Place results" icon={MapPin} action={`${filteredPlaces.length} results`}>
          <div style={styles.resultList}>
            {filteredPlaces.length ? (
              filteredPlaces.map((place) => <PlaceResult key={place.id} place={place} />)
            ) : (
              <div style={styles.empty}>No location results found for “{query}”.</div>
            )}
          </div>
        </Section>

        <Section title="Explore grid" icon={ImageIcon} action={`${activeFilter} results`}>
          {visibleContent.length ? (
            <div style={styles.grid}>
              {visibleContent.map((item, index) => (
                <ContentCard key={`${item.id}-${index}`} item={item} />
              ))}
            </div>
          ) : (
            <div style={styles.empty}>
              No posts or reels found. Try a suggested search, trending hashtag, creator, or nearby place.
            </div>
          )}
        </Section>

        <Section title="Nearby content" icon={Navigation} action="Location-aware">
          <div style={styles.resultList}>
            {locations
              .filter((place) => place.nearby)
              .map((place) => (
                <PlaceResult key={place.id} place={place} />
              ))}
          </div>
        </Section>

        <div ref={sentinelRef} style={styles.sentinel} aria-hidden="true" />

        <div
          style={{
            padding: '0.25rem 0 0.8rem',
            color: '#8491ac',
            fontSize: '0.78rem',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          Explore results are prepared for future Supabase indexing, full-text search, autocomplete, trending ranking,
          nearby ranking, caching, and realtime updates.
        </div>
      </main>

      <BottomNav />
    </div>
  );
}