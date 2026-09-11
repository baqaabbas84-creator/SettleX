const express = require('express');
const router = express.Router();
const { Transaction, Deal } = require('../models');
const authenticate = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

router.use(authenticate);

// ── GET /api/transactions/deal/:dealId ───────────────────────
router.get('/deal/:dealId', catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.dealId);
  if (!deal) return next(new AppError('Deal not found', 404));

  if (deal.buyerId.toString() !== req.user.id && deal.sellerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new AppError('Not authorized', 403));
  }

  const transactions = await Transaction.find({ dealId: req.params.dealId }).sort('-createdAt');
  ApiResponse.ok(res, 'Transactions retrieved', { transactions });
}));

// ── GET /api/transactions ────────────────────────────────────
// List all transactions for the current user's deals
router.get('/', catchAsync(async (req, res) => {
  const userId = req.user.id;
  const deals = await Deal.find({
    $or: [{ buyerId: userId }, { sellerId: userId }]
  }).select('_id');

  const dealIds = deals.map(d => d._id);
  const transactions = await Transaction.find({ dealId: { $in: dealIds } }).sort('-createdAt');
  ApiResponse.ok(res, 'Transactions retrieved', { transactions });
}));

module.exports = router;
