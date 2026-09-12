const mongoose = require('mongoose');
const { Deal, Milestone, User } = require('../models');
const { DEAL_STATUS, MILESTONE_STATUS, AUDIT_ACTIONS } = require('../config/constants');
const { log } = require('../services/audit.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

/**
 * Resolve seller ID coming from frontend.
 *
 * The frontend can send:
 * - Real MongoDB User ObjectId
 * - Demo seller IDs such as usr_seller_001
 * - Seller email
 * - Seller name / business name
 */
const resolveSellerId = async (sellerId, reqBody = {}) => {
  const demoSellerMap = {
    usr_seller_001: {
      email: 'priya.sharma@example.com',
      name: 'Priya Sharma',
      businessName: 'Sharma Furniture Works',
    },
    usr_seller_002: {
      email: 'rajesh.verma@example.com',
      name: 'Rajesh Verma',
      businessName: 'Verma Manufacturing',
    },
    usr_seller_003: {
      email: 'amit.gupta@example.com',
      name: 'Amit Gupta',
      businessName: 'Gupta Industries',
    },
  };

  // If it is already a valid MongoDB ObjectId,
  // verify that the user exists.
  if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
    const user = await User.findById(sellerId);

    if (user) {
      return user._id;
    }
  }

  // Convert known frontend demo seller ID
  // into an actual MongoDB user.
  const demoSeller = demoSellerMap[sellerId];

  if (demoSeller) {
    let user = await User.findOne({
      email: demoSeller.email,
    });

    if (!user) {
      user = await User.findOne({
        name: demoSeller.name,
        businessName: demoSeller.businessName,
      });
    }

    if (user) {
      return user._id;
    }
  }

  // Optional custom seller lookup
  const customSellerEmail = reqBody.sellerEmail?.trim();

  if (customSellerEmail) {
    const user = await User.findOne({
      email: customSellerEmail,
    });

    if (user) {
      return user._id;
    }
  }

  return null;
};


/**
 * Create Deal
 */
const createDeal = catchAsync(async (req, res, next) => {
  const {
    sellerId,
    title,
    description,
    totalAmount,
    milestones = [],
  } = req.body;

  if (!title || !title.trim()) {
    return next(new AppError('Deal title is required', 400, 'VALIDATION_ERROR'));
  }

  const parsedTotalAmount = Number(totalAmount);

  if (!Number.isFinite(parsedTotalAmount) || parsedTotalAmount <= 0) {
    return next(new AppError('Valid total amount is required', 400, 'VALIDATION_ERROR'));
  }

  if (!Array.isArray(milestones) || milestones.length === 0) {
    return next(
      new AppError(
        'At least one milestone is required',
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  // Resolve frontend seller ID to actual MongoDB User ID
  const resolvedSellerId = await resolveSellerId(sellerId, req.body);

  if (!resolvedSellerId) {
    return next(
      new AppError(
        'Seller could not be found',
        400,
        'SELLER_NOT_FOUND'
      )
    );
  }

  // Normalize and validate milestones
  const normalizedMilestones = [];

  for (const milestone of milestones) {
    const amount = Number(milestone.amount);

    if (!milestone.title || !milestone.title.trim()) {
      return next(
        new AppError(
          'Every milestone must have a title',
          400,
          'VALIDATION_ERROR'
        )
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return next(
        new AppError(
          `Invalid amount for milestone: ${milestone.title}`,
          400,
          'VALIDATION_ERROR'
        )
      );
    }

    normalizedMilestones.push({
      title: milestone.title.trim(),
      description: milestone.description || '',
      amount,
      dueDate: milestone.dueDate || null,
      conditions: milestone.conditions || '',
      status: MILESTONE_STATUS.CREATED,
    });
  }

  // Make sure milestone amounts exactly equal deal total
  const milestoneTotal = normalizedMilestones.reduce(
    (sum, milestone) => sum + milestone.amount,
    0
  );

  if (Math.abs(milestoneTotal - parsedTotalAmount) > 0.01) {
    return next(
      new AppError(
        `Milestone total (${milestoneTotal}) must equal deal total (${parsedTotalAmount})`,
        400,
        'MILESTONE_TOTAL_MISMATCH'
      )
    );
  }

  // Create deal
  const deal = await Deal.create({
    buyerId: req.user.id,
    sellerId: resolvedSellerId,
    title: title.trim(),
    description: description || '',
    totalAmount: parsedTotalAmount,
    status: DEAL_STATUS.PENDING_ACCEPTANCE,
    escrow: {
      locked: 0,
      released: 0,
      refunded: 0,
    },
  });

  try {
    // Create all milestones against the newly created deal
    const milestoneDocuments = normalizedMilestones.map((milestone) => ({
      ...milestone,
      dealId: deal._id,
    }));

    await Milestone.insertMany(milestoneDocuments);
  } catch (error) {
    // Cleanup deal if milestone creation fails
    await Deal.findByIdAndDelete(deal._id);
    throw error;
  }

  // Audit log
  await log({
    userId: req.user.id,
    action: AUDIT_ACTIONS.DEAL_CREATED,
    resourceType: 'Deal',
    resourceId: deal._id,
    ip: req.ip,
  });

  // Return complete populated deal
  const populatedDeal = await Deal.findById(deal._id)
    .populate('buyerId', 'name email businessName')
    .populate('sellerId', 'name email businessName')
    .populate('milestones');

  ApiResponse.created(
    res,
    'Deal created successfully',
    {
      deal: populatedDeal,
    }
  );
});


/**
 * List Deals
 */
const listDeals = catchAsync(async (req, res, next) => {
  const { id: userId, role } = req.user;

  const query =
    role === 'BUYER'
      ? { buyerId: userId }
      : role === 'SELLER'
        ? { sellerId: userId }
        : {};

  const deals = await Deal.find(query)
    .populate('buyerId', 'name email businessName')
    .populate('sellerId', 'name email businessName')
    .populate('milestones')
    .sort('-createdAt');

  ApiResponse.ok(res, 'Deals retrieved', { deals });
});


/**
 * Get Single Deal
 */
const getDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id)
    .populate('buyerId', 'name email businessName')
    .populate('sellerId', 'name email businessName')
    .populate('milestones');

  if (!deal) {
    return next(
      new AppError(
        'Deal not found',
        404,
        'DEAL_NOT_FOUND'
      )
    );
  }

  const buyerId = deal.buyerId?._id?.toString();
  const sellerId = deal.sellerId?._id?.toString();

  if (
    buyerId !== req.user.id &&
    sellerId !== req.user.id &&
    req.user.role !== 'ADMIN'
  ) {
    return next(
      new AppError(
        'Not authorized to view this deal',
        403,
        'FORBIDDEN'
      )
    );
  }

  ApiResponse.ok(res, 'Deal retrieved', { deal });
});


/**
 * Accept Deal
 */
const acceptDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    return next(
      new AppError(
        'Deal not found',
        404,
        'DEAL_NOT_FOUND'
      )
    );
  }

  if (deal.sellerId.toString() !== req.user.id) {
    return next(
      new AppError(
        'Only the assigned seller can accept this deal',
        403,
        'FORBIDDEN'
      )
    );
  }

  if (deal.status !== DEAL_STATUS.PENDING_ACCEPTANCE) {
    return next(
      new AppError(
        `Deal cannot be accepted from status: ${deal.status}`,
        400,
        'INVALID_STATE_TRANSITION'
      )
    );
  }

  deal.status = DEAL_STATUS.ACCEPTED;
  await deal.save();

  await log({
    userId: req.user.id,
    action: AUDIT_ACTIONS.DEAL_ACCEPTED,
    resourceType: 'Deal',
    resourceId: deal._id,
    ip: req.ip,
  });

  ApiResponse.ok(res, 'Deal accepted', { deal });
});


/**
 * Reject Deal
 */
const rejectDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    return next(
      new AppError(
        'Deal not found',
        404,
        'DEAL_NOT_FOUND'
      )
    );
  }

  if (deal.sellerId.toString() !== req.user.id) {
    return next(
      new AppError(
        'Only the assigned seller can reject this deal',
        403,
        'FORBIDDEN'
      )
    );
  }

  if (deal.status !== DEAL_STATUS.PENDING_ACCEPTANCE) {
    return next(
      new AppError(
        `Deal cannot be rejected from status: ${deal.status}`,
        400,
        'INVALID_STATE_TRANSITION'
      )
    );
  }

  deal.status = DEAL_STATUS.CANCELLED;
  await deal.save();

  await log({
    userId: req.user.id,
    action: AUDIT_ACTIONS.DEAL_REJECTED,
    resourceType: 'Deal',
    resourceId: deal._id,
    ip: req.ip,
  });

  ApiResponse.ok(res, 'Deal rejected', { deal });
});


/**
 * Get Escrow Status
 */
const getEscrowStatus = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    return next(
      new AppError(
        'Deal not found',
        404,
        'DEAL_NOT_FOUND'
      )
    );
  }

  if (
    deal.buyerId.toString() !== req.user.id &&
    deal.sellerId.toString() !== req.user.id &&
    req.user.role !== 'ADMIN'
  ) {
    return next(
      new AppError(
        'Not authorized to view this deal',
        403,
        'FORBIDDEN'
      )
    );
  }

  ApiResponse.ok(
    res,
    'Escrow status retrieved',
    {
      escrow: deal.escrow,
    }
  );
});


module.exports = {
  createDeal,
  listDeals,
  getDeal,
  acceptDeal,
  rejectDeal,
  getEscrowStatus,
};