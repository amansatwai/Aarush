import React from "react";
import TopBar from "../components/TopBar";
import FeedPost from "../components/FeedPost";
import "./HomeFeed.css";

export default function HomeFeed(props) {
  const posts = [
    {
      id: 1,
      username: "aman",
      time: "2m ago",
      caption: "Premium Aarush glassmorphism feed.",
      image_url: "https://via.placeholder.com/900",
      avatar_url: "https://via.placeholder.com/120",
      verified: true,
      user_id: 1,
    },
  ];

  const stories = ["You", "Riya", "Kabir", "Sara", "Aman"];

  return (
    <div className="home-feed">
      <TopBar
        profile={props.profile}
        onOpenGazeLock={() => props.setGazeLockEnabled(true)}
        onOpenOneTapLock={() => props.setOneTapLockEnabled(true)}
        onOpenNotifications={() => props.setNotificationsOpen(true)}
        onOpenChats={() => props.setChatsOpen(true)}
        dataSaverEnabled={props.dataSaverEnabled}
        setDataSaverEnabled={props.setDataSaverEnabled}
      />

      <main className="home-content">
        <section className="stories-section">
          <div className="stories-scroll">
            {stories.map((s) => (
              <div className="story-card" key={s}>
                <div className="story-ring">
                  <img src={`https://via.placeholder.com/120?text=${s[0]}`} alt={s} />
                </div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="feed-container">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} currentUser={props.currentUser} />
          ))}
        </section>
      </main>
    </div>
  );
}