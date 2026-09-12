const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/dispute.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);

// ── POST /api/disputes ───────────────────────────────────────
router.post('/', disputeController.createDispute);

// ── GET /api/disputes/deal/:dealId ───────────────────────────
router.get('/deal/:dealId', disputeController.listDisputes);

// ── GET /api/disputes/:id ────────────────────────────────────
router.get('/:id', disputeController.getDispute);

// ── PATCH /api/disputes/:id/respond ──────────────────────────
router.patch('/:id/respond', disputeController.respondToDispute);

// ── PATCH /api/disputes/:id/resolve ──────────────────────────
router.patch('/:id/resolve', authorize('ADMIN'), disputeController.resolveDispute);

module.exports = router;
