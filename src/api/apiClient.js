
import axios from 'axios';

export const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000
});

// Attach JWT token to requests.
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle expired tokens on protected API requests.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';

    const isAuthCall = /\/(login|register)(\/|$)/.test(requestUrl);

    if (
      error.response?.status === 401 &&
      !isAuthCall &&
      sessionStorage.getItem('token')
    ) {
      ['token', 'role', 'user'].forEach((key) => {
        sessionStorage.removeItem(key);
      });

      window.dispatchEvent(new Event('auth:expired'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
