const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/ApiResponse');

// ── GET /api/trust/:userId ───────────────────────────────────
router.get('/:userId', (_req, res) => {
  // TODO: get trust profile for a user
  ApiResponse.ok(res, 'Get trust profile endpoint — not yet implemented');
});

// ── GET /api/trust/:userId/events ────────────────────────────
router.get('/:userId/events', (_req, res) => {
  // TODO: list trust events for a user
  ApiResponse.ok(res, 'List trust events endpoint — not yet implemented');
});

module.exports = router;
