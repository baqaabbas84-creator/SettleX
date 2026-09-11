const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/ApiResponse');

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', (_req, res) => {
  // TODO: implement register controller
  ApiResponse.ok(res, 'Register endpoint — not yet implemented');
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', (_req, res) => {
  // TODO: implement login controller
  ApiResponse.ok(res, 'Login endpoint — not yet implemented');
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', (_req, res) => {
  // TODO: implement get-current-user controller (protected)
  ApiResponse.ok(res, 'Get current user endpoint — not yet implemented');
});

module.exports = router;
