import apiClient from './api';

const adminService = {
  // Users
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/admin/users${query ? `?${query}` : ''}`);
  },

  getUser: (userId) =>
    apiClient.get(`/api/admin/users/${userId}`),

  // Deals overview
  getAllDeals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/admin/deals${query ? `?${query}` : ''}`);
  },

  // Escrow overview
  getEscrowOverview: () =>
    apiClient.get('/api/admin/escrow/overview'),

  // Disputes queue
  getDisputeQueue: () =>
    apiClient.get('/api/admin/disputes/queue'),

  // Evidence review queue
  getEvidenceQueue: () =>
    apiClient.get('/api/admin/evidence/queue'),

  // Analytics
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/admin/analytics${query ? `?${query}` : ''}`);
  },

  // Audit logs
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/admin/audit-logs${query ? `?${query}` : ''}`);
  },
};

export default adminService;
