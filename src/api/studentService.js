import apiClient from './apiClient';

export const studentService = {
  async list() { return (await apiClient.get('/students')).data.students; },
  async get(id) { return (await apiClient.get(`/students/${id}`)).data.student; },
  async update(id, fields) { return (await apiClient.put(`/students/${id}`, fields)).data.student; },
  async remove(id) { return (await apiClient.delete(`/students/${id}`)).data; }
};
