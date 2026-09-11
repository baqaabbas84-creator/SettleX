const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/ApiResponse');

// All admin routes will be protected by authenticate + authorize('ADMIN')

// ── GET /api/admin/users ─────────────────────────────────────
router.get('/users', (_req, res) => {
  // TODO: list all users with filters
  ApiResponse.ok(res, 'Admin list users — not yet implemented');
});

// ── PATCH /api/admin/users/:id/verify ────────────────────────
router.patch('/users/:id/verify', (_req, res) => {
  // TODO: change verification status
  ApiResponse.ok(res, 'Admin verify user — not yet implemented');
});

// ── GET /api/admin/deals ─────────────────────────────────────
router.get('/deals', (_req, res) => {
  // TODO: list all deals with filters
  ApiResponse.ok(res, 'Admin list deals — not yet implemented');
});

// ── GET /api/admin/escrow ────────────────────────────────────
router.get('/escrow', (_req, res) => {
  // TODO: escrow overview
  ApiResponse.ok(res, 'Admin escrow overview — not yet implemented');
});

// ── GET /api/admin/disputes ──────────────────────────────────
router.get('/disputes', (_req, res) => {
  // TODO: dispute queue
  ApiResponse.ok(res, 'Admin dispute queue — not yet implemented');
});

// ── GET /api/admin/trust ─────────────────────────────────────
router.get('/trust', (_req, res) => {
  // TODO: trust analytics
  ApiResponse.ok(res, 'Admin trust analytics — not yet implemented');
});

// ── GET /api/admin/audit-logs ────────────────────────────────
router.get('/audit-logs', (_req, res) => {
  // TODO: audit log viewer
  ApiResponse.ok(res, 'Admin audit logs — not yet implemented');
});

module.exports = router;
