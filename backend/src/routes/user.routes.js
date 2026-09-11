const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authenticate = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

router.use(authenticate);

// ── GET /api/users ───────────────────────────────────────────
router.get('/', catchAsync(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  ApiResponse.ok(res, 'Users retrieved', { users });
}));

// ── GET /api/users/:id ───────────────────────────────────────
router.get('/:id', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return ApiResponse.ok(res, 'User not found', { user: null });
  ApiResponse.ok(res, 'User retrieved', { user });
}));

// ── PATCH /api/users/:id ─────────────────────────────────────
router.patch('/:id', catchAsync(async (req, res) => {
  // Only allow users to update their own profile (or admin)
  if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
    return ApiResponse.error(res, 'Not authorized', 403);
  }
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.phone) updates.phone = req.body.phone;
  if (req.body.businessName) updates.businessName = req.body.businessName;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  ApiResponse.ok(res, 'User updated', { user });
}));

module.exports = router;
