import apiClient from './apiClient';

export const notificationService = {
  async list() { return (await apiClient.get('/notifications')).data; },
  async markRead(id) { return (await apiClient.patch(`/notifications/${id}/read`)).data; },
  async markAllRead() { return (await apiClient.patch('/notifications/read-all')).data; },
  async broadcast(payload) { return (await apiClient.post('/notifications', payload)).data; }
};
