import apiClient from './api';

const trustService = {
  // Get trust profile for a user
  getTrustProfile: (userId) =>
    apiClient.get(`/api/trust/${userId}`),

  // Get own trust profile
  getMyTrustProfile: () =>
    apiClient.get('/api/trust/me'),

  // Get trust events / history
  getTrustEvents: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/trust/${userId}/events${query ? `?${query}` : ''}`);
  },

  // Get trust analytics (admin)
  getTrustAnalytics: () =>
    apiClient.get('/api/trust/analytics'),
};

export default trustService;
