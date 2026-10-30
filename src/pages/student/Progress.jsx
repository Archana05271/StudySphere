import React from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import StatusMessage from '../../components/StatusMessage';

export default function Progress() {
  const { enrollments, loading, error } = useCourses();
  return (
    <>
      <header className="content-header">
        <div><h1>Learning Achievements &amp; Progress</h1><p>Track your courses and claim completion certificates.</p></div>
      </header>
      <StatusMessage loading={loading} error={error} empty={enrollments.length === 0} emptyText="No progress yet — enroll in a course first.">
        <div className="list">
          {enrollments.map((e) => {
            const done = e.status === 'completed';
            return (
              <div className="list-item row" key={e.id}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3>{e.course.title}</h3>
                  <div className={`progress-bar${done ? ' done' : ''}`}><div style={{ width: `${e.progress.progressPercentage}%` }} /></div>
                  <span style={{ color: done ? '#10b981' : undefined, fontWeight: 600 }}>{e.progress.progressPercentage}% {done ? 'Completed' : 'in progress'}</span>
                </div>
                {done
                  ? <Link className="btn btn-secondary" to={`/student/certificate?course=${encodeURIComponent(e.course.title)}`}>View Certificate</Link>
                  : <Link className="btn btn-primary" to={`/student/course/${e.course._id}`}>Continue</Link>}
              </div>
            );
          })}
        </div>
      </StatusMessage>
    </>
  );
}
