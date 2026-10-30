import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { studentService } from '../../api/studentService';
import { enrollmentService } from '../../api/enrollmentService';
import StatusMessage from '../../components/StatusMessage';
import { apiErrorMessage } from '../../utils/ui';

export default function AdminDashboard() {
  const { courses, loading: coursesLoading } = useCourses();
  const [stats, setStats] = useState({ students: 0, enrollments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([studentService.list(), enrollmentService.all()])
      .then(([students, enrollments]) => setStats({ students: students.length, enrollments: enrollments.length }))
      .catch((err) => setError(apiErrorMessage(err, 'Failed to load dashboard statistics')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="content-header">
        <div><h1>Admin Command Console</h1><p>System statistics, enrollments and course status.</p></div>
        <Link to="/admin/courses" className="btn btn-primary">Manage Courses</Link>
      </header>
      <StatusMessage loading={loading || coursesLoading} error={error}>
        <section className="metrics-grid">
          <div className="metric-card"><div className="metric-icon">📚</div><div><span className="muted">Courses</span><h3>{courses.length}</h3></div></div>
          <div className="metric-card"><div className="metric-icon">👥</div><div><span className="muted">Students</span><h3>{stats.students}</h3></div></div>
          <div className="metric-card"><div className="metric-icon">🎓</div><div><span className="muted">Enrollments</span><h3>{stats.enrollments}</h3></div></div>
        </section>
      </StatusMessage>
    </>
  );
}
