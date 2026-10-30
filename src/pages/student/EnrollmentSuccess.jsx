import React from 'react';
import { Link } from 'react-router-dom';

export default function EnrollmentSuccess() {
  return (
    <div className="workspace-main" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
      <h2>Enrollment Successful!</h2>
      <p className="muted" style={{ margin: '.5rem 0 1.5rem' }}>You are now registered for your selected course.</p>
      <Link to="/student/my-courses" className="btn btn-primary">Go to My Courses</Link>
    </div>
  );
}
