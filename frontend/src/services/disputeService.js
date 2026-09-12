import apiClient from './api';

const disputeService = {
  // Get disputes for a deal — backend route: GET /api/disputes/deal/:dealId
  getDisputes: (params = {}) => {
    // If dealId is passed, use the correct backend route
    if (params.dealId) {
      return apiClient.get(`/api/disputes/deal/${params.dealId}`);
    }
    // Fallback: list all deals user is part of, then query disputes per deal
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/disputes${query ? `?${query}` : ''}`);
  },

  // Get disputes for a specific deal
  getDisputesByDeal: (dealId) =>
    apiClient.get(`/api/disputes/deal/${dealId}`),

  // Get a single dispute
  getDispute: (disputeId) =>
    apiClient.get(`/api/disputes/${disputeId}`),

  // Raise a dispute (buyer or seller)
  raiseDispute: (data) =>
    apiClient.post('/api/disputes', data),

  // Respond to a dispute (add statement) — backend: PATCH /api/disputes/:id/respond
  addStatement: (disputeId, data) =>
    apiClient.patch(`/api/disputes/${disputeId}/respond`, data),

  // Get AI dispute summary — AI summary is embedded in dispute object from respond endpoint
  // No separate endpoint; read from dispute.aiSummary field
  getAISummary: (disputeId) =>
    apiClient.get(`/api/disputes/${disputeId}`).then(res => ({
      data: { aiSummary: res?.data?.dispute?.aiSummary || null }
    })),

  // Resolve dispute (admin) — backend: PATCH /api/disputes/:id/resolve
  resolveDispute: (disputeId, resolution) =>
    apiClient.patch(`/api/disputes/${disputeId}/resolve`, resolution),
};

export default disputeService;
