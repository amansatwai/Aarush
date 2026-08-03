import StoryAvatar from './StoryAvatar';

const fallbackStories = [
  {
    id: '1',
    username: 'your_story',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    username: 'design_lab',
    avatar_url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&h=200&fit=crop',
  },
  {
    id: '3',
    username: 'startup_daily',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  },
  {
    id: '4',
    username: 'aarush_team',
    avatar_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&h=200&fit=crop',
  },
];

export default function Stories({ stories = [], currentUser }) {
  const mergedStories = [
    currentUser
      ? {
          id: currentUser.id,
          username: currentUser.username || 'you',
          avatar_url:
            currentUser.avatar_url ||
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
          isCurrentUser: true,
        }
      : null,
    ...(stories.length ? stories : fallbackStories).map((story) => ({
      ...story,
      isCurrentUser: false,
    })),
  ].filter(Boolean);

  return (
    <section className="stories-shell">
      <div className="stories-scroll">
        {mergedStories.map((story) => (
          <StoryAvatar key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}