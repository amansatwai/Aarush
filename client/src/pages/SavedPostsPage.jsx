import { useEffect, useState } from 'react';
import { supabase, TABLES, mapPostRow } from '../lib/supabase';
import TopBar from '../components/TopBar';
import FeedPost from '../components/FeedPost';
import BottomNav from '../components/BottomNav';

export default function SavedPostsPage({ session, navigate, route }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = session?.user;

  const loadSaved = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: queryError } = await supabase
        .from(TABLES.savedPosts)
        .select(
          `
            post_id,
            posts:posts (
              id,
              user_id,
              image_url,
              caption,
              likes_count,
              comments_count,
              created_at,
              profiles:profiles (
                id,
                username,
                full_name,
                avatar_url
              )
            )
          `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      const mapped = (data || [])
        .map((row) => mapPostRow(row.posts))
        .filter(Boolean);

      setPosts(mapped);
    } catch (err) {
      setError(err?.message || 'Failed to load saved posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  return (
    <div className="screen-shell">
      <TopBar onSearch={() => navigate('search')} onMessages={() => navigate('notifications')} />
      <main className="content-shell">
        <div className="section-header">
          <div>
            <h2>Saved</h2>
            <p>Your bookmarked posts.</p>
          </div>
        </div>

        {loading ? (
          <div className="state-card">Loading saved posts...</div>
        ) : error ? (
          <div className="state-card state-error">
            <h3>Couldn’t load saved posts</h3>
            <p>{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="state-card">
            <h3>No saved posts yet</h3>
            <p>Tap the bookmark icon on a post to save it here.</p>
          </div>
        ) : (
          <section className="feed-list">
            {posts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                user={user}
                onLocalPostChange={(id, patch) => {
                  setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
                }}
              />
            ))}
          </section>
        )}
      </main>
      <BottomNav active={route} onNavigate={navigate} />
    </div>
  );
}