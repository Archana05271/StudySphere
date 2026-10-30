import apiClient from './apiClient';

export const session = {
  save({ token, user }) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('role', user.role);
    sessionStorage.setItem('user', JSON.stringify(user));
  },
  clear() {
    ['token', 'role', 'user'].forEach((k) => sessionStorage.removeItem(k));
  },
  read() {
    try {
      const token = sessionStorage.getItem('token');
      const user = JSON.parse(sessionStorage.getItem('user') || 'null');
      return token && user ? { token, user } : { token: null, user: null };
    } catch {
      return { token: null, user: null };
    }
  }
};

export const authApi = {
  async register(userData) {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },
  async login(credentials) {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },
  async me() {
    const { data } = await apiClient.get('/auth/me');
    return data.user;
  },
  async updateProfile(fields) {
    const { data } = await apiClient.put('/auth/me', fields);
    return data.user;
  }
};
