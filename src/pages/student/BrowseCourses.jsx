import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import CourseCard from '../../components/CourseCard';
import StatusMessage from '../../components/StatusMessage';
import { apiErrorMessage } from '../../utils/ui';

export default function BrowseCourses() {
  const { courses, enrolledIds, loading, error, enroll } = useCourses();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState('');
  const [actionError, setActionError] = useState('');
  const [query, setQuery] = useState('');

  const handleEnroll = async (id) => {
    setBusyId(id);
    setActionError('');
    try {
      await enroll(id);
      navigate('/student/enrollment-success');
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not enroll.'));
    } finally {
      setBusyId('');
    }
  };

  const shown = courses.filter((c) => `${c.title} ${c.department} ${c.instructor}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <header className="content-header">
        <div><h1>Browse Available Courses</h1><p>Find a course and enroll with one click.</p></div>
        <input type="search" placeholder="Search courses…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search courses" style={{ padding: '.6rem', border: '1px solid #cbd5e1', borderRadius: 6, minWidth: 220 }} />
      </header>
      {actionError && <div className="alert error" role="alert">{actionError}</div>}
      <StatusMessage loading={loading} error={error} empty={shown.length === 0} emptyText="No courses found.">
        <div className="course-grid">
          {shown.map((c) => <CourseCard key={c._id} course={c} enrolled={enrolledIds.has(String(c._id))} busy={busyId === c._id} onEnroll={handleEnroll} />)}
        </div>
      </StatusMessage>
    </>
  );
}
