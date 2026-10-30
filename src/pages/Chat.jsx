import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messageService } from '../api/messageService';
import { apiErrorMessage, formatTime } from '../utils/ui';

// Real-time 1-to-1 chat (Task 13). Shared by students and admins.
export default function Chat() {
  const { user } = useAuth();
  const { socketRef, onlineIds, connected } = useSocket();
  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [typing, setTyping] = useState(false);
  const logRef = useRef(null);
  const activeRef = useRef(null);
  activeRef.current = active;

  useEffect(() => {
    messageService.contacts().then(setContacts).catch((e) => setError(apiErrorMessage(e)));
  }, []);

  useEffect(() => {
    if (!active) return;
    setMessages([]);
    messageService.history(active.id).then(setMessages).catch((e) => setError(apiErrorMessage(e)));
  }, [active]);

  // Incoming messages (also echoes of my own, so every open tab stays in sync).
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;
    const onMessage = (m) => {
      const other = m.sender === user.id ? m.recipient : m.sender;
      if (activeRef.current?.id === other) setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
    };
    const onTyping = ({ from }) => {
      if (from === activeRef.current?.id) { setTyping(true); clearTimeout(onTyping.t); onTyping.t = setTimeout(() => setTyping(false), 1500); }
    };
    socket.on('receive_message', onMessage);
    socket.on('typing', onTyping);
    return () => { socket.off('receive_message', onMessage); socket.off('typing', onTyping); };
  }, [socketRef, connected, user.id]);

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [messages]);

  const send = (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !active) return;
    setError('');
    socketRef.current?.emit('send_message', { to: active.id, text: body }, (ack) => {
      if (!ack?.ok) setError(ack?.message || 'Message failed to send');
    });
    setText('');
  };

  return (
    <>
      <header className="content-header">
        <div><h1>Chat</h1><p><span className={`dot${connected ? ' on' : ''}`} />{connected ? 'Connected' : 'Disconnected — reconnecting…'}</p></div>
      </header>
      {error && <div className="alert error" role="alert">{error}</div>}
      <div className="chat">
        <div className="chat-contacts" role="list">
          {contacts.length === 0 && <p className="muted" style={{ padding: '1rem' }}>No other users yet.</p>}
          {contacts.map((c) => (
            <button key={c.id} role="listitem" className={`chat-contact${active?.id === c.id ? ' active' : ''}`} onClick={() => setActive(c)}>
              <span className={`dot${onlineIds.includes(c.id) ? ' on' : ''}`} />{c.name}
              <div className="muted" style={{ fontSize: '.75rem' }}>{c.role}{onlineIds.includes(c.id) ? ' · online' : ' · offline'}</div>
            </button>
          ))}
        </div>
        <div className="chat-pane">
          {!active ? <div className="status-box">Select someone to start chatting.</div> : (
            <>
              <div style={{ padding: '.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                <strong>{active.name}</strong> <span className="muted">{typing ? 'typing…' : onlineIds.includes(active.id) ? 'online' : 'offline'}</span>
              </div>
              <div className="chat-log" ref={logRef} aria-live="polite">
                {messages.length === 0 && <p className="muted" style={{ textAlign: 'center', marginTop: '2rem' }}>No messages yet. Say hello! 👋</p>}
                {messages.map((m) => (
                  <div key={m.id} className={`bubble${m.sender === user.id ? ' me' : ''}`}>{m.text}<small>{formatTime(m.createdAt)}</small></div>
                ))}
              </div>
              <form className="chat-form" onSubmit={send}>
                <input value={text} maxLength={2000} placeholder={`Message ${active.name}…`} aria-label="Message"
                  onChange={(e) => { setText(e.target.value); socketRef.current?.emit('typing', { to: active.id }); }} />
                <button className="btn btn-primary" type="submit" disabled={!text.trim() || !connected}>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
