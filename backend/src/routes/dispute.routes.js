const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/ApiResponse');

// ── POST /api/disputes ───────────────────────────────────────
router.post('/', (_req, res) => {
  // TODO: raise dispute (buyer)
  ApiResponse.ok(res, 'Create dispute endpoint — not yet implemented');
});

// ── GET /api/disputes/deal/:dealId ───────────────────────────
router.get('/deal/:dealId', (_req, res) => {
  // TODO: list disputes for a deal
  ApiResponse.ok(res, 'List disputes endpoint — not yet implemented');
});

// ── PATCH /api/disputes/:id/respond ──────────────────────────
router.patch('/:id/respond', (_req, res) => {
  // TODO: seller responds to dispute
  ApiResponse.ok(res, 'Dispute response endpoint — not yet implemented');
});

// ── PATCH /api/disputes/:id/resolve ──────────────────────────
router.patch('/:id/resolve', (_req, res) => {
  // TODO: resolve dispute (admin)
  ApiResponse.ok(res, 'Resolve dispute endpoint — not yet implemented');
});

module.exports = router;
