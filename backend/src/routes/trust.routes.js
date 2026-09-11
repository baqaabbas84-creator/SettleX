const express = require('express');
const router = express.Router();
const { User, Deal, TrustEvent } = require('../models');
const authenticate = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

router.use(authenticate);

// ── GET /api/trust/me ────────────────────────────────────────
router.get('/me', catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  // Calculate trust score from completed deals
  const completedDeals = await Deal.countDocuments({
    $or: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
    status: 'COMPLETED'
  });
  const totalDeals = await Deal.countDocuments({
    $or: [{ buyerId: req.user.id }, { sellerId: req.user.id }]
  });

  const trustProfile = {
    userId: user._id,
    name: user.name,
    role: user.role,
    trustScore: user.trustScore || 75,
    completedDeals,
    totalDeals,
    level: completedDeals >= 10 ? 'PLATINUM' : completedDeals >= 5 ? 'GOLD' : completedDeals >= 2 ? 'SILVER' : 'NEW',
  };

  ApiResponse.ok(res, 'Trust profile retrieved', { trustProfile });
}));

// ── GET /api/trust/analytics ─────────────────────────────────
router.get('/analytics', catchAsync(async (req, res) => {
  ApiResponse.ok(res, 'Trust analytics', { analytics: {} });
}));

// ── GET /api/trust/:userId ───────────────────────────────────
router.get('/:userId', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password');
  if (!user) return ApiResponse.ok(res, 'User not found', { trustProfile: null });

  const completedDeals = await Deal.countDocuments({
    $or: [{ buyerId: req.params.userId }, { sellerId: req.params.userId }],
    status: 'COMPLETED'
  });
  const totalDeals = await Deal.countDocuments({
    $or: [{ buyerId: req.params.userId }, { sellerId: req.params.userId }]
  });

  const trustProfile = {
    userId: user._id,
    name: user.name,
    role: user.role,
    trustScore: user.trustScore || 75,
    completedDeals,
    totalDeals,
    level: completedDeals >= 10 ? 'PLATINUM' : completedDeals >= 5 ? 'GOLD' : completedDeals >= 2 ? 'SILVER' : 'NEW',
  };

  ApiResponse.ok(res, 'Trust profile retrieved', { trustProfile });
}));

// ── GET /api/trust/:userId/events ────────────────────────────
router.get('/:userId/events', catchAsync(async (req, res) => {
  const events = await TrustEvent.find({ userId: req.params.userId }).sort('-createdAt').limit(50);
  ApiResponse.ok(res, 'Trust events retrieved', { events });
}));

module.exports = router;
