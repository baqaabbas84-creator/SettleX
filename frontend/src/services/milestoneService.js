import apiClient from './api';

const milestoneService = {
  // Get milestones for a deal
  getMilestones: (dealId) =>
    apiClient.get(`/api/deals/${dealId}/milestones`),

  // Get a single milestone
  getMilestone: (dealId, milestoneId) =>
    apiClient.get(`/api/deals/${dealId}/milestones/${milestoneId}`),

  // Update milestone status (backend validates role and state)
  updateMilestoneStatus: (dealId, milestoneId, action) =>
    apiClient.post(`/api/deals/${dealId}/milestones/${milestoneId}/action`, { action }),

  // Approve milestone (buyer) — backend releases escrow
  approveMilestone: (dealId, milestoneId) =>
    apiClient.post(`/api/deals/${dealId}/milestones/${milestoneId}/approve`),

  // Reject milestone (buyer)
  rejectMilestone: (dealId, milestoneId, reason) =>
    apiClient.post(`/api/deals/${dealId}/milestones/${milestoneId}/reject`, { reason }),
};

export default milestoneService;
