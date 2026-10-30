import React from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import StatusMessage from '../../components/StatusMessage';

export default function MyCourses() {
  const { enrollments, loading, error } = useCourses();
  return (
    <>
      <header className="content-header">
        <div><h1>My Enrolled Courses</h1><p>Continue your ongoing learning paths and review completed courses.</p></div>
        <Link to="/student/browse" className="btn btn-primary">Find more courses</Link>
      </header>
      <StatusMessage loading={loading} error={error} empty={enrollments.length === 0} emptyText="You are not enrolled in any course yet. Browse courses to get started.">
        <div className="list">
          {enrollments.map((e) => (
            <div key={e.id} className="list-item row">
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3>{e.course.title}</h3>
                <div className={`progress-bar${e.progress.progressPercentage === 100 ? ' done' : ''}`}><div style={{ width: `${e.progress.progressPercentage}%` }} /></div>
                <p className="muted">Progress: {e.progress.progressPercentage}% ({e.progress.completedLessons}/{e.progress.totalLessons} lessons)</p>
              </div>
              <Link to={`/student/course/${e.course._id}`} className="btn btn-primary">{e.status === 'completed' ? 'Review' : 'Continue Learning'}</Link>
            </div>
          ))}
        </div>
      </StatusMessage>
    </>
  );
}
