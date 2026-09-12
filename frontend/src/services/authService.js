import apiClient from './api';

const authService = {
  /**
   * Log in user
   * POST /api/auth/login
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    return await apiClient.post('/api/auth/login', { email, password });
  },

  /**
   * Register a new user
   * POST /api/auth/register
   * @param {Object} data
   */
  register: async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'BUYER',
      businessName: data.businessName || data.company || '',
      company: data.company || data.businessName || '',
      phone: data.phone || '',
    };
    return await apiClient.post('/api/auth/register', payload);
  },

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  getMe: async () => {
    return await apiClient.get('/api/auth/me');
  },

  getProfile: async () => {
    return await apiClient.get('/api/auth/me');
  },

  updateProfile: async (data) => {
    return await apiClient.put('/api/auth/profile', data);
  },

  logout: async () => {
    try {
      return await apiClient.post('/api/auth/logout');
    } catch {
      return null;
    }
  },
};

export default authService;
