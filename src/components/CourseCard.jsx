import React from 'react';

export default function CourseCard({ course, enrolled = false, busy = false, onEnroll, children }) {
  return (
    <article className="course-card">
      <h3>{course.title}</h3>
      <span className="badge">{course.department || 'General'}</span>
      {course.instructor && <p className="muted" style={{ marginTop: '.5rem' }}>👤 {course.instructor}</p>}
      {course.duration && <p className="muted">⏱ {course.duration} · {course.totalLessons} lessons</p>}
      <p style={{ margin: '.75rem 0 1rem' }}>{course.description || 'No description provided.'}</p>
      {children}
      {onEnroll && (
        enrolled
          ? <span className="badge done">✔ Enrolled</span>
          : <button className="btn btn-primary" disabled={busy} onClick={() => onEnroll(course._id)}>{busy ? 'Enrolling…' : 'Enroll Now'}</button>
      )}
    </article>
  );
}
