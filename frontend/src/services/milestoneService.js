import apiClient from './api';

const milestoneService = {
  // Create a new milestone (buyer)
  createMilestone: (data) =>
    apiClient.post('/api/milestones', data),

  // Get milestones for a deal
  getMilestones: (dealId) =>
    apiClient.get(`/api/milestones/deal/${dealId}`),

  // Get a single milestone
  getMilestone: (dealId, milestoneId) =>
    apiClient.get(`/api/milestones/${milestoneId}`).catch(() => 
      apiClient.get(`/api/deals/${dealId}/milestones/${milestoneId}`)
    ),

  // Advance milestone state (backend validated transitions)
  // Transition: e.g. FUNDED, LOCKED, MILESTONE_IN_PROGRESS, EVIDENCE_SUBMITTED, UNDER_REVIEW, DISPUTED
  transitionMilestone: (milestoneId, nextState) =>
    apiClient.patch(`/api/milestones/${milestoneId}/transition`, { nextState }),

  // Approve milestone (buyer) — backend releases escrow
  approveMilestone: (milestoneId) =>
    apiClient.patch(`/api/milestones/${milestoneId}/approve`),

  // Reject milestone (buyer)
  rejectMilestone: (dealId, milestoneId, reason) =>
    apiClient.patch(`/api/milestones/${milestoneId}/transition`, { nextState: 'DISPUTED', reason }),
};

export default milestoneService;
