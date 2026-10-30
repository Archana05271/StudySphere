import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { formatDate, formatTime } from '../../utils/ui';

// Notifications arrive over Socket.IO and are saved in MongoDB, so history survives refreshes.
export default function NotificationsStudent() {
  const { notifications, unread, markRead, markAllRead, connected } = useSocket();
  return (
    <>
      <header className="content-header">
        <div>
          <h1>Notifications</h1>
          <p><span className={`dot${connected ? ' on' : ''}`} />{connected ? 'Live — new notifications appear instantly' : 'Offline — reconnecting…'} · {unread} unread</p>
        </div>
        {unread > 0 && <button className="btn btn-secondary" onClick={markAllRead}>Mark all as read</button>}
      </header>
      {notifications.length === 0 ? <div className="status-box">No notifications yet.</div> : (
        <div className="list">
          {notifications.map((n) => (
            <div key={n.id} className={`note ${n.type}${n.isRead ? '' : ' unread'}`} onClick={() => !n.isRead && markRead(n.id)} style={{ cursor: n.isRead ? 'default' : 'pointer' }}>
              <div className="row"><strong>{n.title}</strong><span className="muted">{formatDate(n.createdAt)} {formatTime(n.createdAt)}</span></div>
              <p className="muted" style={{ marginTop: '.25rem' }}>{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
