import React, { useCallback, useEffect, useState } from 'react';
import { studentService } from '../../api/studentService';
import StatusMessage from '../../components/StatusMessage';
import { apiErrorMessage, formatDate } from '../../utils/ui';

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // { id, name, department, phone }

  const load = useCallback(async () => {
    try { setStudents(await studentService.list()); setError(''); }
    catch (err) { setError(apiErrorMessage(err, 'Failed to load student records.')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    try { await studentService.update(editing.id, { name: editing.name, department: editing.department, phone: editing.phone }); setEditing(null); await load(); }
    catch (err) { setError(apiErrorMessage(err)); }
  };
  const remove = async (s) => {
    if (!window.confirm(`Delete student "${s.name}" and their enrollments?`)) return;
    try { await studentService.remove(s._id); await load(); } catch (err) { setError(apiErrorMessage(err)); }
  };
  const change = (e) => setEditing((v) => ({ ...v, [e.target.name]: e.target.value }));

  return (
    <>
      <header className="content-header"><div><h1>Student Directory</h1><p>{students.length} registered student(s). View, edit or remove records.</p></div></header>
      {error && !loading && <div className="alert error" role="alert">{error}</div>}
      <StatusMessage loading={loading} empty={!students.length && !error} emptyText="No students registered yet.">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Department</th><th>Registered</th><th>Actions</th></tr></thead>
            <tbody>
              {students.map((s) => editing?.id === s._id ? (
                <tr key={s._id}>
                  <td><input name="name" value={editing.name} onChange={change} aria-label="Name" /></td>
                  <td>{s.email}</td>
                  <td><input name="phone" value={editing.phone} onChange={change} aria-label="Phone" /></td>
                  <td><input name="department" value={editing.department} onChange={change} aria-label="Department" /></td>
                  <td>{formatDate(s.createdAt)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><button className="btn btn-primary btn-sm" onClick={save}>Save</button> <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancel</button></td>
                </tr>
              ) : (
                <tr key={s._id}>
                  <td><strong>{s.name}</strong></td><td>{s.email}</td><td>{s.phone || '—'}</td><td>{s.department || 'General'}</td><td>{formatDate(s.createdAt)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ id: s._id, name: s.name, department: s.department || '', phone: s.phone || '' })}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(s)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StatusMessage>
    </>
  );
}
