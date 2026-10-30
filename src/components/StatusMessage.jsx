import React from 'react';

// Standard loading / error / empty states used by every data-driven page.
export default function StatusMessage({ loading, error, empty, emptyText = 'Nothing to show yet.', children }) {
  if (loading) return <div className="status-box" role="status">Loading…</div>;
  if (error) return <div className="status-box error" role="alert">{error}</div>;
  if (empty) return <div className="status-box">{emptyText}</div>;
  return <>{children}</>;
}
