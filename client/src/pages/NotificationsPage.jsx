import React from "react";
export default function NotificationsPage({ goBack }) {
  return (
    <div className="page-shell">
      <button onClick={goBack}>Back</button>
      <div className="page-title">Notifications</div>
    </div>
  );
}