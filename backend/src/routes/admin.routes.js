const express = require('express');
const router = express.Router();
const { User, Deal, Dispute, AuditLog, Evidence } = require('../models');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

router.use(authenticate);
router.use(authorize('ADMIN'));

// ── GET /api/admin/users ─────────────────────────────────────
router.get('/users', catchAsync(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  ApiResponse.ok(res, 'Users retrieved', { users });
}));

// ── GET /api/admin/users/:id ─────────────────────────────────
router.get('/users/:id', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return ApiResponse.error(res, 'User not found', 404);
  ApiResponse.ok(res, 'User retrieved', { user });
}));

// ── PATCH /api/admin/users/:id/verify ────────────────────────
router.patch('/users/:id/verify', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return ApiResponse.error(res, 'User not found', 404);
  user.verificationStatus = req.body.status || 'VERIFIED';
  await user.save();
  ApiResponse.ok(res, 'User verification updated', { user });
}));

// ── GET /api/admin/deals ─────────────────────────────────────
router.get('/deals', catchAsync(async (req, res) => {
  const deals = await Deal.find()
    .populate('buyerId', 'name email businessName')
    .populate('sellerId', 'name email businessName')
    .sort('-createdAt');
  ApiResponse.ok(res, 'All deals retrieved', { deals });
}));

// ── GET /api/admin/escrow ────────────────────────────────────
router.get('/escrow', catchAsync(async (req, res) => {
  const deals = await Deal.find().select('title totalAmount escrow status');
  const overview = {
    totalDeals: deals.length,
    totalLocked: deals.reduce((sum, d) => sum + (d.escrow?.locked || 0), 0),
    totalReleased: deals.reduce((sum, d) => sum + (d.escrow?.released || 0), 0),
    totalRefunded: deals.reduce((sum, d) => sum + (d.escrow?.refunded || 0), 0),
    deals: deals.map(d => ({
      id: d._id,
      title: d.title,
      totalAmount: d.totalAmount,
      escrow: d.escrow,
      status: d.status,
    })),
  };
  ApiResponse.ok(res, 'Escrow overview retrieved', { overview });
}));

// ── GET /api/admin/disputes ──────────────────────────────────
router.get('/disputes', catchAsync(async (req, res) => {
  const disputes = await Dispute.find()
    .populate('dealId', 'title totalAmount')
    .populate('raisedBy', 'name email')
    .sort('-createdAt');
  ApiResponse.ok(res, 'Disputes retrieved', { disputes });
}));

// ── GET /api/admin/trust ─────────────────────────────────────
router.get('/trust', catchAsync(async (req, res) => {
  // Basic trust stats
  const users = await User.find().select('name role trustScore');
  ApiResponse.ok(res, 'Trust analytics retrieved', { users });
}));

// ── GET /api/admin/audit-logs ────────────────────────────────
router.get('/audit-logs', catchAsync(async (req, res) => {
  const logs = await AuditLog.find()
    .populate('userId', 'name email')
    .sort('-createdAt')
    .limit(100);
  ApiResponse.ok(res, 'Audit logs retrieved', { logs });
}));

module.exports = router;
