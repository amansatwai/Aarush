import React from "react";
export default function SearchPage({ goBack }) {
  return (
    <div className="page-shell">
      <button onClick={goBack}>Back</button>
      <div className="page-title">Search</div>
    </div>
  );
}