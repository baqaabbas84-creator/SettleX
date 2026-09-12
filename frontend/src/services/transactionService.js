import apiClient from './api';

const transactionService = {
  // Get transactions for current user
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/transactions${query ? `?${query}` : ''}`);
  },

  // Get a single transaction
  getTransaction: (txnId) =>
    apiClient.get(`/api/transactions/${txnId}`),

  // Get escrow status for a deal
  getEscrowStatus: (dealId) =>
    apiClient.get(`/api/deals/${dealId}/escrow`),

  // Fund escrow (buyer) — backend validates and locks funds
  fundEscrow: (dealId) =>
    apiClient.post(`/api/deals/${dealId}/escrow/fund`),
};

export default transactionService;
