import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await apiClient.get(`/courses/${id}`);
        setCourse(res.data.course || res.data);
      } catch (err) {
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourseDetails();
  }, [id]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading course details...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#ef4444' }}>{error}</div>;
  if (!course) return <div style={{ padding: '2rem' }}>Course not found.</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>{course.title}</h1>
          <p style={{ color: '#64748b' }}>Department: {course.department}</p>
        </div>
        <Link to={`/admin/edit-course/${course._id || course.id}`} style={{ padding: '0.75rem 1.25rem', background: '#0f172a', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
          Edit Parameters
        </Link>
      </header>

      <div className="workspace-main" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3>Course Description</h3>
        <p style={{ color: '#475569', marginTop: '0.5rem', lineHeight: '1.6' }}>
          {course.description || "No description provided for this track."}
        </p>
      </div>
    </div>
  );
};

export default CourseDetails;