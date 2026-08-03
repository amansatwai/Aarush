import React from "react";
export default function ReelsPage({ goBack }) {
  return (
    <div className="page-shell">
      <button onClick={goBack}>Back</button>
      <div className="page-title">Reels</div>
    </div>
  );
}