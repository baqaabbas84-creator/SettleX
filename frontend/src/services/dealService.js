import apiClient from './api';

const dealService = {
  // Get all deals for the current user
  getDeals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/deals${query ? `?${query}` : ''}`);
  },

  // Get a single deal by ID
  getDeal: (dealId) =>
    apiClient.get(`/api/deals/${dealId}`),

  // Create a new deal (buyer)
  createDeal: (data) =>
    apiClient.post('/api/deals', data),

  // Update a deal
  updateDeal: (dealId, data) =>
    apiClient.put(`/api/deals/${dealId}`, data),

  // Accept a deal (seller)
  acceptDeal: (dealId) =>
    apiClient.patch(`/api/deals/${dealId}/accept`),

  // Reject a deal (seller)
  rejectDeal: (dealId, reason) =>
    apiClient.patch(`/api/deals/${dealId}/reject`, { reason }),

  // Get escrow status for a deal
  getEscrow: (dealId) =>
    apiClient.get(`/api/deals/${dealId}/escrow`),

  // Cancel a deal (buyer)
  cancelDeal: (dealId, reason) =>
    apiClient.post(`/api/deals/${dealId}/cancel`, { reason }),

  // Get AI milestone suggestions
  suggestMilestones: (description) =>
    apiClient.post('/api/ai/suggest-milestones', { description }),
};

export default dealService;
