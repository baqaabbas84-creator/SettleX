const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const milestoneController = require('../controllers/milestone.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { MILESTONE_STATUS } = require('../config/constants');

router.use(authenticate);

// ── POST /api/milestones ─────────────────────────────────────
router.post(
  '/',
  authorize('BUYER'),
  [
    body('dealId').isMongoId().withMessage('Valid dealId is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('dueDate').optional().isISO8601().withMessage('Valid date is required'),
  ],
  validate,
  milestoneController.createMilestone
);

// ── GET /api/milestones/deal/:dealId ─────────────────────────
router.get('/deal/:dealId', milestoneController.listMilestones);

// ── PATCH /api/milestones/:id/transition ─────────────────────
router.patch(
  '/:id/transition',
  [
    body('targetStatus').isIn(Object.values(MILESTONE_STATUS)).withMessage('Invalid targetStatus'),
    body('idempotencyKey').optional().isString(),
  ],
  validate,
  milestoneController.transitionMilestone
);

// ── PATCH /api/milestones/:id/approve ────────────────────────
router.patch(
  '/:id/approve',
  authorize('BUYER'),
  milestoneController.approveMilestone
);

module.exports = router;
