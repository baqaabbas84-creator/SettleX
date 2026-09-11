import apiClient from './api';

const authService = {
  login: (email, password) =>
    apiClient.post('/api/auth/login', { email, password }),

  register: (data) =>
    apiClient.post('/api/auth/register', data),

  getProfile: () =>
    apiClient.get('/api/auth/profile'),

  updateProfile: (data) =>
    apiClient.put('/api/auth/profile', data),

  logout: () =>
    apiClient.post('/api/auth/logout'),
};

export default authService;
