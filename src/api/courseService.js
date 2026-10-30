import apiClient from './apiClient';
export const courseService = {
  async getAllCourses() {
    const { data } = await apiClient.get('/courses');
    return data.courses || [];
  },
  async getCourseById(id) {
    const { data } = await apiClient.get(`/courses/${id}`);
    return data.course;
  },
  async createCourse(courseData) {
    const { data } = await apiClient.post('/courses', courseData);
    return data.course;
  },
  async updateCourse(id, courseData) {
    const { data } = await apiClient.put(`/courses/${id}`, courseData);
    return data.course;
  },
  async deleteCourse(id) {
    const { data } = await apiClient.delete(`/courses/${id}`);
    return data;
  }
};
