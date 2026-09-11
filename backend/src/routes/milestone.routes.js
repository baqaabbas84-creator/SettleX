const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/ApiResponse');

// ── POST /api/milestones ─────────────────────────────────────
router.post('/', (_req, res) => {
  // TODO: create milestone for a deal (buyer)
  ApiResponse.ok(res, 'Create milestone endpoint — not yet implemented');
});

// ── GET /api/milestones/deal/:dealId ─────────────────────────
router.get('/deal/:dealId', (_req, res) => {
  // TODO: list milestones for a deal
  ApiResponse.ok(res, 'List milestones endpoint — not yet implemented');
});

// ── PATCH /api/milestones/:id/transition ─────────────────────
router.patch('/:id/transition', (_req, res) => {
  // TODO: advance milestone state (backend validated)
  ApiResponse.ok(res, 'Milestone transition endpoint — not yet implemented');
});

// ── PATCH /api/milestones/:id/approve ────────────────────────
router.patch('/:id/approve', (_req, res) => {
  // TODO: approve milestone (buyer)
  ApiResponse.ok(res, 'Approve milestone endpoint — not yet implemented');
});

module.exports = router;
