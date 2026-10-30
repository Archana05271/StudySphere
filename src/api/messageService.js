import apiClient from './apiClient';

export const messageService = {
  async contacts() { return (await apiClient.get('/messages/contacts')).data.contacts; },
  async history(userId) { return (await apiClient.get(`/messages/${userId}`)).data.messages; }
};
