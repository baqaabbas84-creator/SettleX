const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/ApiResponse');

// ── POST /api/evidence ───────────────────────────────────────
router.post('/', (_req, res) => {
  // TODO: upload evidence for a milestone (seller)
  ApiResponse.ok(res, 'Upload evidence endpoint — not yet implemented');
});

// ── GET /api/evidence/milestone/:milestoneId ─────────────────
router.get('/milestone/:milestoneId', (_req, res) => {
  // TODO: list evidence for a milestone
  ApiResponse.ok(res, 'List evidence endpoint — not yet implemented');
});

// ── GET /api/evidence/:id/download ───────────────────────────
router.get('/:id/download', (_req, res) => {
  // TODO: secure file download (authenticated)
  ApiResponse.ok(res, 'Download evidence endpoint — not yet implemented');
});

module.exports = router;
