import apiClient from './api';

const evidenceService = {
  // Get evidence for a milestone
  getEvidence: (dealId, milestoneId) =>
    apiClient.get(`/api/deals/${dealId}/milestones/${milestoneId}/evidence`),

  // Upload evidence (seller)
  uploadEvidence: (dealId, milestoneId, formData) =>
    apiClient.post(`/api/deals/${dealId}/milestones/${milestoneId}/evidence`, formData),

  // Get AI verification results for evidence
  getAIVerification: (evidenceId) =>
    apiClient.get(`/api/evidence/${evidenceId}/verification`),

  // Request AI re-verification
  requestVerification: (evidenceId) =>
    apiClient.post(`/api/evidence/${evidenceId}/verify`),
};

export default evidenceService;
