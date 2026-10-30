import React, { useEffect, useState } from 'react';
import FormField from '../../components/FormField';
import StatusMessage from '../../components/StatusMessage';
import { notificationService } from '../../api/notificationService';
import { enrollmentService } from '../../api/enrollmentService';
import { apiErrorMessage, formatDate } from '../../utils/ui';

// Admin sends real-time announcements to all students and sees recent enrollment activity.
export default function Notifications() {
  const [form, setForm] = useState({ title: '', message: '' });
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [sending, setSending] = useState(false);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { enrollmentService.all().then(setActivity).catch(() => {}).finally(() => setLoading(false)); }, []);

  const send = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return setFeedback({ type: 'error', text: 'Message is required' });
    setSending(true);
    try {
      const res = await notificationService.broadcast({ title: form.title.trim() || 'Announcement', message: form.message.trim() });
      setFeedback({ type: 'success', text: res.message });
      setForm({ title: '', message: '' });
    } catch (err) { setFeedback({ type: 'error', text: apiErrorMessage(err) }); }
    finally { setSending(false); }
  };

  return (
    <>
      <header className="content-header"><div><h1>Announcements</h1><p>Send a real-time notification to every student, and review enrollment activity.</p></div></header>
      <form className="workspace-main" onSubmit={send} noValidate style={{ maxWidth: 640, marginBottom: '2rem' }}>
        {feedback.text && <div className={`alert ${feedback.type}`} role="status">{feedback.text}</div>}
        <FormField label="Title" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement" maxLength={120} />
        <FormField as="textarea" rows="3" label="Message" name="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={500} />
        <button className="btn btn-primary" disabled={sending}>{sending ? 'Sending…' : '📣 Send to all students'}</button>
      </form>
      <h3 style={{ marginBottom: '1rem' }}>Recent enrollments</h3>
      <StatusMessage loading={loading} empty={activity.length === 0} emptyText="No enrollments yet.">
        <div className="table-wrap"><table className="data"><thead><tr><th>Student</th><th>Course</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>{activity.slice(0, 20).map((a) => <tr key={a._id}><td>{a.student?.name || '—'}</td><td>{a.course?.title || '—'}</td><td><span className={`badge${a.status === 'completed' ? ' done' : ''}`}>{a.status}</span></td><td>{formatDate(a.enrolledAt)}</td></tr>)}</tbody></table></div>
      </StatusMessage>
    </>
  );
}
