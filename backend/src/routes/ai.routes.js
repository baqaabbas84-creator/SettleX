const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/ApiResponse');

// ── POST /api/ai/suggest-milestones ──────────────────────────
router.post('/suggest-milestones', (_req, res) => {
  // TODO: call ai.service.suggestMilestones
  ApiResponse.ok(res, 'AI suggest milestones — not yet implemented');
});

// ── POST /api/ai/analyse-document ────────────────────────────
router.post('/analyse-document', (_req, res) => {
  // TODO: call ai.service.analyseDocument
  ApiResponse.ok(res, 'AI analyse document — not yet implemented');
});

// ── POST /api/ai/summarise-dispute ───────────────────────────
router.post('/summarise-dispute', (_req, res) => {
  // TODO: call ai.service.summariseDispute
  ApiResponse.ok(res, 'AI summarise dispute — not yet implemented');
});

// ── POST /api/ai/trust-insights ──────────────────────────────
router.post('/trust-insights', (_req, res) => {
  // TODO: call ai.service.explainTrust
  ApiResponse.ok(res, 'AI trust insights — not yet implemented');
});

module.exports = router;
