import apiClient from './api';

const evidenceService = {
  // Get evidence for a milestone
  getEvidence: (milestoneId) =>
    apiClient.get(`/api/evidence/milestone/${milestoneId}`).catch(() => 
      apiClient.get(`/api/deals/any/milestones/${milestoneId}/evidence`)
    ),

  // Upload evidence (seller)
  uploadEvidence: (data) => {
    // If FormData or JSON
    return apiClient.post('/api/evidence', data);
  },

  // Get AI verification results for evidence
  getAIVerification: (evidenceId) =>
    apiClient.get(`/api/evidence/${evidenceId}/verification`),

  // Request AI re-verification
  requestVerification: (evidenceId) =>
    apiClient.post(`/api/evidence/${evidenceId}/verify`),
};

export default evidenceService;
