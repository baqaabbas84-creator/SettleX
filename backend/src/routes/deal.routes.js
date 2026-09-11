const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/ApiResponse');

// ── POST /api/deals ──────────────────────────────────────────
router.post('/', (_req, res) => {
  // TODO: create deal (buyer)
  ApiResponse.ok(res, 'Create deal endpoint — not yet implemented');
});

// ── GET /api/deals ───────────────────────────────────────────
router.get('/', (_req, res) => {
  // TODO: list deals for current user
  ApiResponse.ok(res, 'List deals endpoint — not yet implemented');
});

// ── GET /api/deals/:id ───────────────────────────────────────
router.get('/:id', (_req, res) => {
  // TODO: get deal by id
  ApiResponse.ok(res, 'Get deal endpoint — not yet implemented');
});

// ── PATCH /api/deals/:id/accept ──────────────────────────────
router.patch('/:id/accept', (_req, res) => {
  // TODO: accept deal (seller)
  ApiResponse.ok(res, 'Accept deal endpoint — not yet implemented');
});

// ── PATCH /api/deals/:id/reject ──────────────────────────────
router.patch('/:id/reject', (_req, res) => {
  // TODO: reject deal (seller)
  ApiResponse.ok(res, 'Reject deal endpoint — not yet implemented');
});

// ── GET /api/deals/:id/escrow ────────────────────────────────
router.get('/:id/escrow', (_req, res) => {
  // TODO: get escrow status for deal
  ApiResponse.ok(res, 'Get escrow status endpoint — not yet implemented');
});

module.exports = router;
