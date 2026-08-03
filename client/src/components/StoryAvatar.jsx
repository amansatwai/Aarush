export default function StoryAvatar({ story }) {
  return (
    <button type="button" className="story-item" aria-label={story.username}>
      <div className="story-ring">
        <img
          src={story.avatar_url}
          alt={story.username}
          className="story-avatar"
          loading="lazy"
        />
      </div>
      <span className="story-name">{story.username}</span>
    </button>
  );
}