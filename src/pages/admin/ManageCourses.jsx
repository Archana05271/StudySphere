import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { courseService } from '../../api/courseService';
import StatusMessage from '../../components/StatusMessage';
import { apiErrorMessage } from '../../utils/ui';

export default function ManageCourses() {
  const { courses, loading, error, refresh } = useCourses();
  const [actionError, setActionError] = useState('');

  const remove = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? Enrollments for this course will also be removed.`)) return;
    try { await courseService.deleteCourse(course._id); await refresh(); } catch (err) { setActionError(apiErrorMessage(err)); }
  };

  return (
    <>
      <header className="content-header">
        <div><h1>Manage Courses</h1><p>{courses.length} course(s) in the catalogue.</p></div>
        <Link to="/admin/add-course" className="btn btn-primary">+ Add course</Link>
      </header>
      {actionError && <div className="alert error" role="alert">{actionError}</div>}
      <StatusMessage loading={loading} error={error} empty={courses.length === 0} emptyText="No courses yet. Create the first one.">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Title</th><th>Department</th><th>Instructor</th><th>Lessons</th><th>Actions</th></tr></thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id}>
                  <td><Link to={`/admin/courses/${c._id}`}>{c.title}</Link></td>
                  <td>{c.department}</td>
                  <td>{c.instructor || '—'}</td>
                  <td>{c.totalLessons}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Link className="btn btn-secondary btn-sm" to={`/admin/courses/${c._id}/edit`}>Edit</Link>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Delete</button>
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
