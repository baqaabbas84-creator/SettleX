const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/ApiResponse');

// ── GET /api/transactions/deal/:dealId ───────────────────────
router.get('/deal/:dealId', (_req, res) => {
  // TODO: list transactions for a deal
  ApiResponse.ok(res, 'List transactions endpoint — not yet implemented');
});

module.exports = router;
