import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseForm from '../../components/CourseForm';
import StatusMessage from '../../components/StatusMessage';
import { courseService } from '../../api/courseService';
import { useCourses } from '../../context/CourseContext';
import { apiErrorMessage } from '../../utils/ui';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useCourses();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { courseService.getCourseById(id).then(setCourse).catch((e) => setError(apiErrorMessage(e, 'Failed to load course'))); }, [id]);

  return (
    <>
      <header className="content-header"><div><h1>Edit Course</h1><p>Update course details.</p></div></header>
      <StatusMessage loading={!course && !error} error={error}>
        {course && <CourseForm initial={course} submitLabel="Save changes" onSubmit={async (data) => { await courseService.updateCourse(id, data); await refresh(); navigate('/admin/courses'); }} />}
      </StatusMessage>
    </>
  );
}
