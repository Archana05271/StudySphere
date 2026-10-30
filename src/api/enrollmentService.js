import apiClient from './apiClient';

export const enrollmentService = {
  async mine() { return (await apiClient.get('/enrollments/me')).data.enrollments; },
  async enroll(courseId) { return (await apiClient.post('/enrollments', { courseId })).data; },
  async unenroll(courseId) { return (await apiClient.delete(`/enrollments/${courseId}`)).data; },
  async updateProgress(courseId, completedLessons) { return (await apiClient.patch(`/enrollments/${courseId}/progress`, { completedLessons })).data; },
  async all() { return (await apiClient.get('/enrollments')).data.enrollments; }
};
