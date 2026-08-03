import React from "react";
export default function ChatScreen({ goBack }) {
  return (
    <div className="page-shell">
      <button onClick={goBack}>Back</button>
      <div className="page-title">Chat Screen</div>
    </div>
  );
}