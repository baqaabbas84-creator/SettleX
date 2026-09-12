import apiClient from './api';

const evidenceService = {
  // Get evidence for a milestone — backend: GET /api/evidence/milestone/:milestoneId
  getEvidence: (milestoneId) =>
    apiClient.get(`/api/evidence/milestone/${milestoneId}`),

  // Upload evidence (seller) — backend: POST /api/evidence (multipart or JSON)
  uploadEvidence: (data) => {
    // If FormData (file upload), use as-is
    if (data instanceof FormData) {
      return apiClient.post('/api/evidence', data);
    }
    // If plain object (no actual file), send as JSON
    return apiClient.post('/api/evidence', data);
  },

  // Get a single evidence item — backend: GET /api/evidence/:id
  getEvidenceById: (evidenceId) =>
    apiClient.get(`/api/evidence/${evidenceId}`),

  // Get AI verification results — embedded in evidence.aiResult, no separate endpoint
  getAIVerification: (evidenceId) =>
    apiClient.get(`/api/evidence/${evidenceId}`).then(res => ({
      data: { aiResult: res?.data?.evidence?.aiResult || null }
    })),

  // Request AI re-verification — not implemented yet, graceful fallback
  requestVerification: (evidenceId) =>
    Promise.resolve({ data: { message: 'Re-verification not yet available' } }),
};

export default evidenceService;
