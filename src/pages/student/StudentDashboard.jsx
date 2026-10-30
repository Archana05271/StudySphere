import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import StatusMessage from '../../components/StatusMessage';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { courses, enrollments, loading, error } = useCourses();
  const completed = enrollments.filter((e) => e.status === 'completed').length;
  const available = courses.filter((c) => !enrollments.some((e) => e.course?._id === c._id)).slice(0, 3);

  return (
    <>
      <header className="content-header">
        <div>
          <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
          <p>Track your active courses, learning progress, and overall statistics.</p>
        </div>
        <Link to="/student/browse" className="btn btn-primary">Explore Courses</Link>
      </header>

      <section className="workspace-main" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '.5rem' }}>Student information</h3>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Department:</strong> {user.department || '—'}</p>
        {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
      </section>

      <StatusMessage loading={loading} error={error}>
        <section className="metrics-grid" style={{ marginBottom: '2rem' }}>
          <div className="metric-card"><div className="metric-icon">📖</div><div><span className="muted">Enrolled courses</span><h3>{enrollments.length}</h3></div></div>
          <div className="metric-card"><div className="metric-icon">🏆</div><div><span className="muted">Completed</span><h3>{completed}</h3></div></div>
          <div className="metric-card"><div className="metric-icon">📚</div><div><span className="muted">Available courses</span><h3>{courses.length}</h3></div></div>
        </section>

        <h3 style={{ marginBottom: '1rem' }}>My enrollment status</h3>
        {enrollments.length === 0 ? <p className="muted" style={{ marginBottom: '1.5rem' }}>You have not enrolled in any course yet.</p> : (
          <div className="list" style={{ marginBottom: '2rem' }}>
            {enrollments.map((e) => (
              <div className="list-item row" key={e.id}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <strong>{e.course.title}</strong> <span className={`badge${e.status === 'completed' ? ' done' : ''}`}>{e.status}</span>
                  <div className={`progress-bar${e.progress.progressPercentage === 100 ? ' done' : ''}`}><div style={{ width: `${e.progress.progressPercentage}%` }} /></div>
                  <span className="muted">{e.progress.completedLessons}/{e.progress.totalLessons} lessons · {e.progress.progressPercentage}%</span>
                </div>
                <Link className="btn btn-secondary btn-sm" to={`/student/course/${e.course._id}`}>Open</Link>
              </div>
            ))}
          </div>
        )}

        {available.length > 0 && (
          <>
            <h3 style={{ marginBottom: '1rem' }}>Available courses</h3>
            <div className="course-grid">
              {available.map((c) => (
                <div className="course-card" key={c._id}><h3>{c.title}</h3><span className="badge">{c.department}</span><p>{c.description}</p><Link to="/student/browse" className="btn btn-primary btn-sm">View &amp; enroll</Link></div>
              ))}
            </div>
          </>
        )}
      </StatusMessage>
    </>
  );
}
