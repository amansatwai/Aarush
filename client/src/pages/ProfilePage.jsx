import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  Grid3X3,
  Image as ImageIcon,
  Link2,
  Lock,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Tag,
  Video,
  X,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';

const profile = {
  username: 'arush.dev',
  displayName: 'Aarush Developer',
  avatar: 'A',
  verified: true,
  bio: 'Building Aarush with React, Vite, Supabase, and modern social experiences.',
  website: 'aarush.dev',
  posts: '86',
  followers: '18.4K',
  following: '342',
  likes: '284K',
};

const menuItems = [
  ['Home', '/home', HomeIcon],
  ['Shoulder Surf', '/profile/shoulder-surf', EyeOff],
  ['Emergency Privacy Switch', '/profile/emergency-privacy', Shield],
  ['Privacy Dashboard', '/profile/privacy-dashboard', ShieldCheck],
  ['Creator Analytics', '/profile/creator-analytics', BarChart3],
  ['Profile Settings', '/profile/settings', Settings],
  ['Privacy', '/profile/privacy', Lock],
  ['Security', '/profile/security', ShieldCheck],
  ['Notifications', '/profile/notifications', Bell],
  ['Chats', '/profile/chats', MessageCircle],
  ['Controls', '/profile/controls', Settings],
  ['Help', '/profile/help', HelpIcon],
  ['Logout', 'logout', LogoutIcon],
];

const postImages = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
];

const reelImages = [
  'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
];

const taggedImages = [
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80',
];

const savedImages = [
  'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
];

function HomeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9.8 9a2.3 2.3 0 1 1 3.8 1.7c-1 .8-1.6 1.2-1.6 2.3M12 16h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function BookmarkIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17l-6-3-6 3V4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TagIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3.4 13.4a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.4 7a2 2 0 0 1 0 2.8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function PhoneIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h3l2 5-2 1.5a14 14 0 0 0 5.5 5.5L15 14l5 2v3a2 2 0 0 1-2 2C10.3 21 3 13.7 3 5a2 2 0 0 1 2-1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileStat({ label, value }) {
  return (
    <div style={{ display: 'grid', gap: '0.2rem', textAlign: 'center' }}>
      <strong style={{ color: '#f7f9ff', fontSize: '1rem' }}>{value}</strong>
      <span style={{ color: '#96a3bf', fontSize: '0.7rem', fontWeight: 750 }}>
        {label}
      </span>
    </div>
  );
}

function ProfileAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: '1 1 10rem',
        minHeight: '2.75rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        padding: '0.7rem 0.8rem',
        borderRadius: '999px',
        border: '1px solid rgba(124,92,255,0.3)',
        background: 'linear-gradient(135deg, rgba(124,92,255,0.27), rgba(77,215,255,0.12))',
        color: '#fff',
        fontSize: '0.78rem',
        fontWeight: 850,
        cursor: 'pointer',
      }}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function ContentSection({ title, description, icon: Icon, images, type, onOpen }) {
  return (
    <section
      style={{
        padding: '0.95rem',
        borderRadius: '1.25rem',
        background: 'rgba(15,19,30,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.7rem',
          marginBottom: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.7rem',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
              color: '#dce8ff',
            }}
          >
            <Icon size={15} />
          </span>

          <div>
            <h2
              style={{
                margin: 0,
                color: '#f5f8ff',
                fontSize: '0.98rem',
                fontWeight: 850,
              }}
            >
              {title}
            </h2>

            <p
              style={{
                margin: '0.22rem 0 0',
                color: '#8e9bb7',
                fontSize: '0.72rem',
              }}
            >
              {description}
            </p>
          </div>
        </div>

        <span style={{ color: '#8996b2', fontSize: '0.72rem', fontWeight: 750 }}>
          {type}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '0.45rem',
        }}
      >
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={onOpen}
            style={{
              position: 'relative',
              aspectRatio: '1 / 1.12',
              overflow: 'hidden',
              borderRadius: '0.8rem',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#111827',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <img
              src={image}
              alt={`${title} ${index + 1}`}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'cover',
              }}
            />

            <span
              style={{
                position: 'absolute',
                top: '0.4rem',
                right: '0.4rem',
                width: '1.7rem',
                height: '1.7rem',
                borderRadius: '999px',
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(5,8,15,0.62)',
                color: '#fff',
              }}
            >
              {type === 'Reels' ? (
                <PlayIcon />
              ) : type === 'Tagged' ? (
                <TagIcon size={12} />
              ) : type === 'Saved' ? (
                <BookmarkIcon size={12} />
              ) : index === 1 ? (
                '▧'
              ) : (
                <ImageIcon size={12} />
              )}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProfileMenu({ onClose, onNavigate, onLogout }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(2,5,10,0.68)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <aside
        onClick={(event) => event.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(90vw, 420px)',
          overflowY: 'auto',
          padding: '1rem',
          background: 'linear-gradient(180deg, rgba(17,22,35,0.99), rgba(9,13,22,0.99))',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '-24px 0 70px rgba(0,0,0,0.45)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.7rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: '#f5f8ff', fontSize: '1.05rem' }}>
              Profile Menu
            </h2>
            <p style={{ margin: '0.25rem 0 0', color: '#96a3bf', fontSize: '0.76rem' }}>
              Account, privacy, security, and creator tools.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '2.65rem',
              height: '2.65rem',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
            aria-label="Close profile menu"
          >
            <X size={17} />
          </button>
        </div>

        {menuItems.map(([label, route, Icon]) => (
          <button
            key={label}
            type="button"
            onClick={() => (route === 'logout' ? onLogout() : onNavigate(route))}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '0.5rem',
              padding: '0.8rem',
              borderRadius: '0.95rem',
              border: `1px solid ${
                label === 'Logout'
                  ? 'rgba(255,79,122,0.16)'
                  : 'rgba(255,255,255,0.07)'
              }`,
              background:
                label === 'Logout'
                  ? 'rgba(255,79,122,0.07)'
                  : 'rgba(255,255,255,0.045)',
              color: label === 'Logout' ? '#ffb1c8' : '#eaf0ff',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: '2.1rem',
                height: '2.1rem',
                borderRadius: '0.7rem',
                display: 'grid',
                placeItems: 'center',
                background:
                  label === 'Logout'
                    ? 'rgba(255,79,122,0.14)'
                    : 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
                color: label === 'Logout' ? '#ff9dbd' : '#dce8ff',
                flexShrink: 0,
              }}
            >
              <Icon size={15} />
            </span>

            <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 800 }}>
              {label}
            </span>

            <ChevronRight
              size={15}
              color={label === 'Logout' ? '#ff9dbd' : '#8190ad'}
            />
          </button>
        ))}
      </aside>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('grid');
  const [timeLimitedProfile, setTimeLimitedProfile] = useState(false);
  const [screenRecording, setScreenRecording] = useState(false);
  const [screenshotShield, setScreenshotShield] = useState(true);
  const [decoyVault, setDecoyVault] = useState(false);
  const [message, setMessage] = useState('');

  const logout = async () => {
    await supabase.auth.signOut();
    window.localStorage.removeItem('aarush_one_tap_lock_enabled');
    navigate('/welcome', { replace: true });
  };

  const showMessage = (value) => {
    setMessage(value);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: '6.8rem',
        background:
          'radial-gradient(circle at top, rgba(34,43,68,0.45) 0%, rgba(10,13,20,1) 38%, rgba(7,9,14,1) 100%)',
        color: '#f4f7ff',
      }}
    >
      <TopBar
        profileMode
        username={profile.username}
        timeLimitedProfile={timeLimitedProfile}
        screenRecording={screenRecording}
        screenshotShield={screenshotShield}
        decoyVault={decoyVault}
        onTimeLimitedProfile={(value) => {
          setTimeLimitedProfile(value);
          navigate('/profile/time-limited');
        }}
        onScreenRecording={(value) => {
          setScreenRecording(value);
          navigate('/profile/screen-recording');
        }}
        onScreenshotShield={(value) => {
          setScreenshotShield(value);
          navigate('/profile/screenshot-shield');
        }}
        onDecoyVault={(value) => {
          setDecoyVault(value);
          navigate('/profile/decoy-vault');
        }}
        onMenuClick={() => setShowMenu(true)}
      />

      <main
        style={{
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          padding: '1rem 0.9rem 0',
          display: 'grid',
          gap: '0.9rem',
        }}
      >
        <section
          style={{
            padding: '1rem',
            borderRadius: '1.35rem',
            background: 'rgba(15,19,30,0.92)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.28)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '6.7rem',
                height: '6.7rem',
                borderRadius: '999px',
                padding: '4px',
                background:
                  'linear-gradient(135deg, #7c5cff, #ff4fd8 48%, #4dd7ff)',
                boxShadow: '0 0 28px rgba(124,92,255,0.26)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #151a28, #252d48)',
                  color: '#fff',
                  fontSize: '2rem',
                  fontWeight: 900,
                }}
              >
                {profile.avatar}
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  flexWrap: 'wrap',
                }}
              >
                <strong style={{ color: '#f6f8ff', fontSize: '1.12rem' }}>
                  {profile.username}
                </strong>

                {profile.verified ? (
                  <span
                    style={{
                      width: '1.05rem',
                      height: '1.05rem',
                      borderRadius: '999px',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg, #4dd7ff, #7c5cff)',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </span>
                ) : null}
              </div>

              <strong style={{ color: '#cbd6ec', fontSize: '0.84rem' }}>
                {profile.displayName}
              </strong>

              <p
                style={{
                  margin: '0.3rem 0 0',
                  color: '#d5def1',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                }}
              >
                {profile.bio}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.45rem',
                  marginTop: '0.35rem',
                  color: '#91a0bc',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.28rem',
                  }}
                >
                  <Link2 size={12} />
                  {profile.website}
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.28rem',
                  }}
                >
                  <Eye size={12} />
                  Public profile
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '0.4rem',
              marginTop: '1rem',
              paddingTop: '0.9rem',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <ProfileStat label="Posts" value={profile.posts} />
            <ProfileStat label="Followers" value={profile.followers} />
            <ProfileStat label="Following" value={profile.following} />
            <ProfileStat label="Likes" value={profile.likes} />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '0.9rem',
            }}
          >
            <ProfileAction
              icon={Edit3}
              label="Edit Profile"
              onClick={() => navigate('/profile/settings')}
            />

            <ProfileAction
              icon={Send}
              label="Share Profile"
              onClick={() => showMessage('Profile link copied.')}
            />
          </div>
        </section>

        <section
          style={{
            padding: '0.95rem',
            borderRadius: '1.25rem',
            background: 'rgba(15,19,30,0.92)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              marginBottom: '0.8rem',
            }}
          >
            <ShieldCheck size={17} color="#72e3ff" />

            <div>
              <h2
                style={{
                  margin: 0,
                  color: '#f5f8ff',
                  fontSize: '0.98rem',
                  fontWeight: 850,
                }}
              >
                Story Highlights
              </h2>

              <p
                style={{
                  margin: '0.25rem 0 0',
                  color: '#8e9bb7',
                  fontSize: '0.74rem',
                }}
              >
                Organize important stories on your profile.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.8rem',
              overflowX: 'auto',
            }}
          >
            {['Aarush', 'Builds', 'Ideas', 'Travel'].map((title, index) => (
              <button
                key={title}
                type="button"
                onClick={() => showMessage(`${title} highlight opened.`)}
                style={{
                  minWidth: '4.7rem',
                  display: 'grid',
                  justifyItems: 'center',
                  gap: '0.4rem',
                  border: 0,
                  background: 'transparent',
                  color: '#dfe7fb',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: '4.1rem',
                    height: '4.1rem',
                    padding: '2.5px',
                    borderRadius: '999px',
                    background: [
                      'linear-gradient(135deg, #7c5cff, #4dd7ff)',
                      'linear-gradient(135deg, #ff4fd8, #7c5cff)',
                      'linear-gradient(135deg, #ffb347, #ff4fd8)',
                      'linear-gradient(135deg, #4dd7ff, #7c5cff)',
                    ][index],
                  }}
                >
                  <span
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '999px',
                      display: 'grid',
                      placeItems: 'center',
                      background: '#151a28',
                      color: '#fff',
                      fontWeight: 900,
                    }}
                  >
                    {title[0]}
                  </span>
                </span>

                <span style={{ fontSize: '0.7rem', fontWeight: 750 }}>
                  {title}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '0.3rem',
            padding: '0.3rem',
            borderRadius: '1rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {[
            ['grid', 'Posts', Grid3X3],
            ['reels', 'Reels', Video],
            ['tagged', 'Tagged', TagIcon],
          ].map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              style={{
                minHeight: '2.8rem',
                display: 'grid',
                placeItems: 'center',
                gap: '0.22rem',
                border: 0,
                borderRadius: '0.75rem',
                background:
                  activeTab === key
                    ? 'linear-gradient(135deg, rgba(124,92,255,0.24), rgba(77,215,255,0.12))'
                    : 'transparent',
                color: activeTab === key ? '#fff' : '#8f9cb8',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 850,
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </section>

        <ContentSection
          title={
            activeTab === 'grid'
              ? 'Posts'
              : activeTab === 'reels'
                ? 'Reels'
                : 'Tagged Content'
          }
          description={
            activeTab === 'grid'
              ? 'Your published photo and carousel posts.'
              : activeTab === 'reels'
                ? 'Your short-form videos and creator content.'
                : 'Posts and reels where your account is tagged.'
          }
          icon={activeTab === 'grid' ? Grid3X3 : activeTab === 'reels' ? Video : TagIcon}
          images={
            activeTab === 'grid'
              ? postImages
              : activeTab === 'reels'
                ? reelImages
                : taggedImages
          }
          type={activeTab === 'grid' ? 'Posts' : activeTab === 'reels' ? 'Reels' : 'Tagged'}
          onOpen={() => showMessage('Profile content opened.')}
        />

        <ContentSection
          title="Saved Content"
          description="Private posts and reels you saved for later."
          icon={Bookmark}
          images={savedImages}
          type="Saved"
          onOpen={() => showMessage('Saved content opened.')}
        />
      </main>

      <BottomNav />

      {showMenu ? (
        <ProfileMenu
          onClose={() => setShowMenu(false)}
          onNavigate={(route) => {
            setShowMenu(false);
            navigate(route);
          }}
          onLogout={logout}
        />
      ) : null}

      {message ? (
        <div
          role="status"
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '6.3rem',
            left: '1rem',
            zIndex: 1400,
            width: 'fit-content',
            maxWidth: 'calc(100% - 2rem)',
            margin: '0 auto',
            padding: '0.75rem 0.9rem',
            borderRadius: '999px',
            background: 'rgba(17,22,35,0.96)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#eaf0ff',
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            fontSize: '0.78rem',
            fontWeight: 750,
          }}
        >
          {message}

          <button
            type="button"
            onClick={() => setMessage('')}
            style={{
              marginLeft: '0.6rem',
              border: 0,
              background: 'transparent',
              color: '#aab6cf',
              cursor: 'pointer',
            }}
            aria-label="Dismiss message"
          >
            <X size={13} />
          </button>
        </div>
      ) : null}
    </div>
  );
}