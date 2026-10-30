import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { courseService } from '../api/courseService';
import { enrollmentService } from '../api/enrollmentService';
import { useAuth } from './AuthContext';
import { apiErrorMessage } from '../utils/ui';

const CourseContext = createContext(null);

// Central store for course catalogue + the logged-in student's enrollments/progress.
export function CourseProvider({ children }) {
  const { isAuthenticated, role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!isAuthenticated) { setCourses([]); setEnrollments([]); return; }
    setLoading(true);
    setError('');
    try {
      const [courseList, enrolled] = await Promise.all([
        courseService.getAllCourses(),
        role === 'student' ? enrollmentService.mine() : Promise.resolve([])
      ]);
      setCourses(courseList);
      setEnrollments(enrolled);
    } catch (err) {
      setError(apiErrorMessage(err, 'Failed to load courses.'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, role]);

  useEffect(() => { refresh(); }, [refresh]);

  const enroll = useCallback(async (courseId) => { await enrollmentService.enroll(courseId); await refresh(); }, [refresh]);
  const unenroll = useCallback(async (courseId) => { await enrollmentService.unenroll(courseId); await refresh(); }, [refresh]);
  const updateProgress = useCallback(async (courseId, completedLessons) => {
    const result = await enrollmentService.updateProgress(courseId, completedLessons);
    await refresh();
    return result;
  }, [refresh]);

  const value = useMemo(() => ({
    courses, enrollments, loading, error, refresh, enroll, unenroll, updateProgress,
    enrolledIds: new Set(enrollments.map((e) => String(e.course?._id)))
  }), [courses, enrollments, loading, error, refresh, enroll, unenroll, updateProgress]);

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export const useCourses = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used inside <CourseProvider>');
  return ctx;
};
