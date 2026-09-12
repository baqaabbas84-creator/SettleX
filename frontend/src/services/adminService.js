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

  // Escrow overview — backend: GET /api/admin/escrow (not /escrow/overview)
  getEscrowOverview: () =>
    apiClient.get('/api/admin/escrow'),

  // Disputes queue — backend: GET /api/admin/disputes (not /disputes/queue)
  getDisputeQueue: () =>
    apiClient.get('/api/admin/disputes'),

  // Evidence review queue — no specific backend endpoint, use disputes
  getEvidenceQueue: () =>
    apiClient.get('/api/admin/disputes'),

  // Analytics — not yet implemented on backend
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/admin/deals${query ? `?${query}` : ''}`);
  },

  // Audit logs — backend: GET /api/admin/audit-logs
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/admin/audit-logs${query ? `?${query}` : ''}`);
  },
};

export default adminService;
