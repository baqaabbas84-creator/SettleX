/**
 * AI Service — Gemini integration for SettleX.
 *
 * IMPORTANT:
 * - AI output is assistance only.
 * - AI NEVER authorizes financial transitions.
 * - If AI is unavailable, workflow falls back to manual review.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');
const { Evidence } = require('../models');
const { EVIDENCE_STATUS } = require('../config/constants');

const _isConfigured = () =>
  config.ai.provider === 'gemini' &&
  Boolean(config.ai.apiKey);

const _fallback = (context) => ({
  success: false,
  error: `AI service unavailable — ${context}. Manual review recommended.`,
});

/**
 * Create Gemini model.
 */
const _getModel = () => {
  if (!_isConfigured()) return null;

  const genAI = new GoogleGenerativeAI(config.ai.apiKey);

  return genAI.getGenerativeModel({
    model: config.ai.model || 'gemini-2.0-flash',
  });
};

/**
 * Safely parse JSON returned by Gemini.
 */
const _parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (_) {
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (_) {
      return null;
    }
  }
};

/**
 * 1. Agreement → Milestone Suggestions
 */
const suggestMilestones = async (agreementText) => {
  if (!_isConfigured()) {
    return _fallback('milestone suggestion');
  }

  try {
    const model = _getModel();

    const prompt = `
You are the AI planning assistant for SettleX, a digital escrow platform for MSME transactions.

Analyze the following business deal description and suggest practical escrow milestones.

IMPORTANT:
- You only suggest milestones.
- You MUST NOT authorize payment or release funds.
- Return ONLY valid JSON.
- Amounts should be suggested as percentages, not financial decisions.

Deal description:
${agreementText || 'No description provided.'}

Return exactly:
{
  "milestones": [
    {
      "title": "string",
      "description": "string",
      "conditions": "string",
      "suggestedPercentage": number
    }
  ],
  "summary": "string"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = _parseJson(text);

    if (!parsed || !Array.isArray(parsed.milestones)) {
      return _fallback('invalid milestone AI response');
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    console.error('Gemini milestone suggestion error:', error.message);

    return _fallback('milestone suggestion failed');
  }
};

/**
 * 2. Document Intelligence
 *
 * Extracts structured information from uploaded evidence.
 *
 * For PDFs/images, the stored file is passed to Gemini as inline data.
 */
const analyseDocument = async (filePathOrBuffer, mimeType) => {
  if (!_isConfigured()) {
    return _fallback('document analysis');
  }

  try {
    const model = _getModel();

    let filePart;

    if (Buffer.isBuffer(filePathOrBuffer)) {
      filePart = {
        inlineData: {
          data: filePathOrBuffer.toString('base64'),
          mimeType: mimeType || 'application/octet-stream',
        },
      };
    } else {
      const fs = require('fs');

      if (!filePathOrBuffer || !fs.existsSync(filePathOrBuffer)) {
        return _fallback('evidence file not found');
      }

      const buffer = fs.readFileSync(filePathOrBuffer);

      filePart = {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: mimeType || 'application/octet-stream',
        },
      };
    }

    const prompt = `
You are SettleX Document Intelligence AI.

Analyze this business evidence document.

Extract:
- order ID
- seller/business name
- quantity
- relevant dates
- document type
- short summary

Also identify obvious inconsistencies such as:
- quantity mismatch
- missing order ID
- missing signature
- suspicious/missing dates
- amount mismatch

IMPORTANT:
- This is analysis only.
- Do NOT authorize escrow release.
- Do NOT make payment decisions.
- If information cannot be verified, return null rather than inventing it.
- Return ONLY valid JSON.

Return exactly:
{
  "extractedFields": {
    "orderId": "string or null",
    "seller": "string or null",
    "quantity": "number or null",
    "relevantDates": ["ISO date strings"],
    "documentType": "string",
    "summary": "string"
  },
  "confidence": 0,
  "inconsistencies": ["string"]
}

Confidence must be a number between 0 and 1.
`;

    const result = await model.generateContent([
      prompt,
      filePart,
    ]);

    const text = result.response.text();
    const parsed = _parseJson(text);

    if (!parsed || !parsed.extractedFields) {
      return _fallback('invalid document AI response');
    }

    return {
      success: true,
      data: {
        extractedFields: parsed.extractedFields,
        confidence:
          typeof parsed.confidence === 'number'
            ? Math.max(0, Math.min(1, parsed.confidence))
            : 0,
        inconsistencies: Array.isArray(parsed.inconsistencies)
          ? parsed.inconsistencies
          : [],
      },
    };
  } catch (error) {
    console.error('Gemini document analysis error:', error.message);

    return _fallback('document analysis failed');
  }
};

/**
 * Processes evidence asynchronously.
 *
 * AI verification NEVER automatically approves/release funds.
 */
const processEvidence = async (evidenceId) => {
  try {
    const evidence = await Evidence.findById(evidenceId);

    if (!evidence) return;

    evidence.status = EVIDENCE_STATUS.PROCESSING;
    await evidence.save();

    const aiResult = await analyseDocument(
      evidence.file.storagePath,
      evidence.file.mimeType
    );

    if (aiResult.success) {
      evidence.aiResult = {
        extractedFields: aiResult.data.extractedFields,
        confidence: aiResult.data.confidence,
        inconsistencies: aiResult.data.inconsistencies,
        processedAt: new Date(),
      };

      evidence.status =
        aiResult.data.inconsistencies.length === 0
          ? EVIDENCE_STATUS.VERIFIED
          : EVIDENCE_STATUS.PENDING;
    } else {
      evidence.aiResult = {
        extractedFields: null,
        confidence: null,
        inconsistencies: [aiResult.error],
        processedAt: new Date(),
      };

      evidence.status = EVIDENCE_STATUS.PENDING;
    }

    await evidence.save();
  } catch (error) {
    console.error('AI Processing Error:', error);

    try {
      await Evidence.findByIdAndUpdate(evidenceId, {
        status: EVIDENCE_STATUS.PENDING,
        'aiResult.inconsistencies': [
          'AI processing failed. Manual review required.',
        ],
        'aiResult.processedAt': new Date(),
      });
    } catch (updateError) {
      console.error(
        'Failed to update AI fallback status:',
        updateError.message
      );
    }
  }
};

/**
 * 3. Dispute Summarisation
 */
const summariseDispute = async (
  buyerStatement,
  sellerStatement,
  evidenceList
) => {
  if (!_isConfigured()) {
    return _fallback('dispute summarisation');
  }

  try {
    const model = _getModel();

    const prompt = `
You are the dispute-analysis assistant for SettleX.

Summarize this MSME transaction dispute.

Buyer statement:
${buyerStatement || 'Not provided'}

Seller statement:
${sellerStatement || 'Not provided'}

Evidence:
${JSON.stringify(evidenceList || [])}

Return ONLY valid JSON:
{
  "summary": "string",
  "keyDiscrepancies": ["string"],
  "recommendedReviewPoints": ["string"]
}

Do not decide who should receive money.
Do not authorize release or refund.
`;

    const result = await model.generateContent(prompt);
    const parsed = _parseJson(result.response.text());

    if (!parsed) {
      return _fallback('invalid dispute AI response');
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    console.error('Gemini dispute summarisation error:', error.message);

    return _fallback('dispute summarisation failed');
  }
};

/**
 * 4. Trust Insights
 */
const explainTrust = async (trustEvents) => {
  if (!_isConfigured()) {
    return _fallback('trust insights');
  }

  try {
    const model = _getModel();

    const prompt = `
You are the trust-analysis assistant for SettleX.

Analyze these transaction trust events:
${JSON.stringify(trustEvents || [])}

Return ONLY valid JSON:
{
  "summary": "string",
  "positiveFactors": ["string"],
  "riskFactors": ["string"]
}

Do not make financial decisions.
`;

    const result = await model.generateContent(prompt);
    const parsed = _parseJson(result.response.text());

    if (!parsed) {
      return _fallback('invalid trust AI response');
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    console.error('Gemini trust insight error:', error.message);

    return _fallback('trust insights failed');
  }
};

module.exports = {
  suggestMilestones,
  analyseDocument,
  processEvidence,
  summariseDispute,
  explainTrust,
};