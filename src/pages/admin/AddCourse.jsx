import React from 'react';
import { useNavigate } from 'react-router-dom';
import CourseForm from '../../components/CourseForm';
import { courseService } from '../../api/courseService';
import { useCourses } from '../../context/CourseContext';

export default function AddCourse() {
  const navigate = useNavigate();
  const { refresh } = useCourses();
  return (
    <>
      <header className="content-header"><div><h1>Create New Course</h1><p>Add a course so students can enroll.</p></div></header>
      <CourseForm submitLabel="Create course" onSubmit={async (data) => { await courseService.createCourse(data); await refresh(); navigate('/admin/courses'); }} />
    </>
  );
}
