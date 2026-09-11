const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/ApiResponse');

// ── GET /api/users ───────────────────────────────────────────
router.get('/', (_req, res) => {
  // TODO: list users (admin)
  ApiResponse.ok(res, 'List users endpoint — not yet implemented');
});

// ── GET /api/users/:id ───────────────────────────────────────
router.get('/:id', (_req, res) => {
  // TODO: get user by id
  ApiResponse.ok(res, 'Get user endpoint — not yet implemented');
});

// ── PATCH /api/users/:id ─────────────────────────────────────
router.patch('/:id', (_req, res) => {
  // TODO: update user profile
  ApiResponse.ok(res, 'Update user endpoint — not yet implemented');
});

module.exports = router;
