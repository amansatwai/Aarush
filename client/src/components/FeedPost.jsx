import React, { useState } from "react";
import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
} from "lucide-react";
import PostActionSheet from "./PostActionSheet";
import "./FeedPost.css";

export default function FeedPost({ post, currentUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = currentUser?.id && post?.user_id && currentUser.id === post.user_id;

  return (
    <>
      <article className="feed-post">
        <div className="feed-post-header">
          <div className="feed-user">
            <img
              className="feed-avatar"
              src={post?.avatar_url || "https://via.placeholder.com/120"}
              alt=""
            />
            <div className="feed-user-meta">
              <div className="feed-username-row">
                <span className="feed-username">{post?.username || "user"}</span>
                {post?.verified && <span className="feed-verified-dot" title="Verified Account" />}
              </div>
              <div className="feed-time">{post?.time || "Just now"}</div>
            </div>
          </div>

          <button
            type="button"
            className="feed-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open post actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="feed-media">
          <img
            src={post?.image_url || "https://via.placeholder.com/900"}
            alt=""
          />
        </div>

        <div className="feed-actions">
          <div className="feed-actions-left">
            <button className="feed-action-btn" aria-label="Like">
              <Heart size={20} />
            </button>
            <button className="feed-action-btn" aria-label="Comment">
              <MessageCircle size={20} />
            </button>
            <button className="feed-action-btn" aria-label="Share">
              <Send size={20} />
            </button>
          </div>
          <button className="feed-action-btn" aria-label="Save">
            <Bookmark size={20} />
          </button>
        </div>

        <div className="feed-caption">
          <span className="feed-caption-user">{post?.username || "user"}</span>
          <span className="feed-caption-text">
            {post?.caption || "Premium Aarush post content goes here."}
          </span>
        </div>
      </article>

      <PostActionSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        isOwner={isOwner}
      />
    </>
  );
}