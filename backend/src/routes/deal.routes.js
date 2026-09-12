const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const dealController = require('../controllers/deal.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.post(
  '/',
  authorize('BUYER'),
  [
    body('sellerId')
      .trim()
      .notEmpty()
      .withMessage('Seller is required'),

    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required'),

    body('totalAmount')
      .isNumeric()
      .withMessage('Total amount must be a number'),
  ],
  validate,
  dealController.createDeal
);

router.get(
  '/',
  dealController.listDeals
);

router.get(
  '/:id',
  dealController.getDeal
);

router.patch(
  '/:id/accept',
  authorize('SELLER'),
  dealController.acceptDeal
);

router.patch(
  '/:id/reject',
  authorize('SELLER'),
  dealController.rejectDeal
);

router.get(
  '/:id/escrow',
  dealController.getEscrowStatus
);

module.exports = router;
