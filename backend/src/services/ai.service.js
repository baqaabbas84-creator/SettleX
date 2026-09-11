/**
 * AI Service — abstraction layer for all LLM interactions.
 *
 * IMPORTANT:
 * - AI output is ASSISTANCE only. It must NEVER authorise financial transitions.
 * - If the AI API is unavailable the escrow workflow continues unblocked.
 * - All public methods return { success, data?, error? }.
 */

const config = require('../config/env');
const { Evidence, Milestone } = require('../models');
const { EVIDENCE_STATUS } = require('../config/constants');

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
  
  // Dummy AI logic for hackathon purposes
  // In a real app, call OpenAI/Gemini vision API here.
  return {
    success: true,
    data: {
      extractedFields: {
        orderId: 'ORD-' + Math.floor(Math.random() * 10000),
        seller: 'Extracted Seller Name',
        quantity: 50,
        relevantDates: [new Date().toISOString()],
        documentType: 'INVOICE',
        summary: 'Invoice for 50 items delivered on time.'
      },
      confidence: 0.85,
      inconsistencies: [] // e.g. ["Amount mismatch", "Missing signature"]
    }
  };
};

/**
 * Processes evidence asynchronously, invoking AI and updating DB
 */
const processEvidence = async (evidenceId) => {
  try {
    const evidence = await Evidence.findById(evidenceId);
    if (!evidence) return;
    
    // Simulate processing
    evidence.status = EVIDENCE_STATUS.PROCESSING;
    await evidence.save();

    const aiResult = await analyseDocument(evidence.file.storagePath, evidence.file.mimeType);
    
    if (aiResult.success) {
      evidence.aiResult = {
        extractedFields: aiResult.data.extractedFields,
        confidence: aiResult.data.confidence,
        inconsistencies: aiResult.data.inconsistencies,
        processedAt: new Date(),
      };
      // If high confidence and no inconsistencies, maybe status = VERIFIED, else PENDING
      evidence.status = aiResult.data.inconsistencies.length === 0 ? EVIDENCE_STATUS.VERIFIED : EVIDENCE_STATUS.PENDING;
    } else {
      // Fallback
      evidence.aiResult = {
        extractedFields: null,
        confidence: null,
        inconsistencies: [aiResult.error],
        processedAt: new Date(),
      };
      evidence.status = EVIDENCE_STATUS.PENDING; // requires manual review
    }
    
    await evidence.save();

    // If verified, maybe auto-approve milestone?
    // "AI must NEVER release funds, bypass human review." -> So we don't automatically transition the milestone.
  } catch (error) {
    console.error('AI Processing Error:', error);
  }
};

/**
 * 3. Dispute Summarisation
 */
const summariseDispute = async (_buyerStatement, _sellerStatement, _evidenceList) => {
  if (!_isConfigured()) return _fallback('dispute summarisation');
  
  return {
    success: true,
    data: {
      summary: "Buyer claims goods were damaged. Seller claims they were perfect. AI suggests checking the delivery photos.",
      keyDiscrepancies: ["Condition on delivery"]
    }
  };
};

/**
 * 4. Trust Insights — explain contributing factors to a trust profile.
 */
const explainTrust = async (_trustEvents) => {
  if (!_isConfigured()) return _fallback('trust insights');
  return _fallback('not yet implemented');
};

module.exports = {
  suggestMilestones,
  analyseDocument,
  processEvidence,
  summariseDispute,
  explainTrust,
};
