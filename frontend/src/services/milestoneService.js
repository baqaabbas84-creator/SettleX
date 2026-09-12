import apiClient from './api';

const milestoneService = {
  // Create a new milestone (buyer)
  createMilestone: (data) =>
    apiClient.post('/api/milestones', data),

  // Get milestones for a deal
  getMilestones: (dealId) =>
    apiClient.get(`/api/milestones/deal/${dealId}`),

  // Get a single milestone — backend only has list endpoint, so filter client-side
  getMilestone: (dealId, milestoneId) =>
    apiClient.get(`/api/milestones/deal/${dealId}`).then(res => {
      const milestones = res?.data?.milestones || [];
      const found = milestones.find(m => (m._id || m.id) === milestoneId);
      return found ? { data: { milestone: found } } : res;
    }),

  // Advance milestone state (backend validated transitions)
  // Backend expects { targetStatus } not { nextState }
  transitionMilestone: (milestoneId, targetStatus, idempotencyKey) =>
    apiClient.patch(`/api/milestones/${milestoneId}/transition`, {
      targetStatus,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    }),

  // Approve milestone (buyer) — backend releases escrow
  approveMilestone: (milestoneId) =>
    apiClient.patch(`/api/milestones/${milestoneId}/approve`),

  // Reject milestone (buyer) — transitions to DISPUTED
  rejectMilestone: (dealId, milestoneId, reason) =>
    apiClient.patch(`/api/milestones/${milestoneId}/transition`, {
      targetStatus: 'DISPUTED',
      reason,
    }),
};

export default milestoneService;
