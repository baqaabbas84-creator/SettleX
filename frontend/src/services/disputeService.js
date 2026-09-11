import apiClient from './api';

const disputeService = {
  // Get disputes for current user
  getDisputes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/disputes${query ? `?${query}` : ''}`);
  },

  // Get a single dispute
  getDispute: (disputeId) =>
    apiClient.get(`/api/disputes/${disputeId}`),

  // Raise a dispute (buyer or seller)
  raiseDispute: (data) =>
    apiClient.post('/api/disputes', data),

  // Add statement / response to a dispute
  addStatement: (disputeId, data) =>
    apiClient.post(`/api/disputes/${disputeId}/statements`, data),

  // Get AI dispute summary
  getAISummary: (disputeId) =>
    apiClient.get(`/api/disputes/${disputeId}/ai-summary`),

  // Resolve dispute (admin)
  resolveDispute: (disputeId, resolution) =>
    apiClient.post(`/api/disputes/${disputeId}/resolve`, resolution),
};

export default disputeService;
