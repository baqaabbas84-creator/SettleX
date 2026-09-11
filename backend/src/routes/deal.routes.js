const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const dealController = require('../controllers/deal.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate); // Protect all deal routes

// ── POST /api/deals ──────────────────────────────────────────
router.post(
  '/',
  authorize('BUYER'),
  [
    body('sellerId').isMongoId().withMessage('Valid sellerId is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  ],
  validate,
  dealController.createDeal
);

// ── GET /api/deals ───────────────────────────────────────────
router.get('/', dealController.listDeals);

// ── GET /api/deals/:id ───────────────────────────────────────
router.get('/:id', dealController.getDeal);

// ── PATCH /api/deals/:id/accept ──────────────────────────────
router.patch('/:id/accept', authorize('SELLER'), dealController.acceptDeal);

// ── PATCH /api/deals/:id/reject ──────────────────────────────
router.patch('/:id/reject', authorize('SELLER'), dealController.rejectDeal);

// ── GET /api/deals/:id/escrow ────────────────────────────────
router.get('/:id/escrow', dealController.getEscrowStatus);

module.exports = router;
