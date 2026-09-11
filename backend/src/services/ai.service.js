/**
 * AI Service — abstraction layer for all LLM interactions.
 *
 * IMPORTANT:
 * - AI output is ASSISTANCE only. It must NEVER authorise financial transitions.
 * - If the AI API is unavailable the escrow workflow continues unblocked.
 * - All public methods return { success, data?, error? }.
 */

const config = require('../config/env');

// ── Private helpers ──────────────────────────────────────────

const _isConfigured = () => Boolean(config.ai.apiKey);

const _fallback = (context) => ({
  success: false,
  error: `AI service unavailable — ${context}. Manual review recommended.`,
});

// ── Public API ───────────────────────────────────────────────

/**
 * 1. Agreement → Milestone Suggestions
 */
const suggestMilestones = async (_agreementText) => {
  if (!_isConfigured()) return _fallback('milestone suggestion');
  // TODO: Implement LLM call with structured output
  return _fallback('not yet implemented');
};

/**
 * 2. Document Intelligence — extract structured fields from evidence.
 */
const analyseDocument = async (_filePathOrBuffer, _mimeType) => {
  if (!_isConfigured()) return _fallback('document analysis');
  // TODO: Implement LLM call with structured output
  return _fallback('not yet implemented');
};

/**
 * 3. Dispute Summarisation
 */
const summariseDispute = async (_buyerStatement, _sellerStatement, _evidenceList) => {
  if (!_isConfigured()) return _fallback('dispute summarisation');
  // TODO: Implement LLM call with structured output
  return _fallback('not yet implemented');
};

/**
 * 4. Trust Insights — explain contributing factors to a trust profile.
 */
const explainTrust = async (_trustEvents) => {
  if (!_isConfigured()) return _fallback('trust insights');
  // TODO: Implement LLM call with structured output
  return _fallback('not yet implemented');
};

module.exports = {
  suggestMilestones,
  analyseDocument,
  summariseDispute,
  explainTrust,
};
