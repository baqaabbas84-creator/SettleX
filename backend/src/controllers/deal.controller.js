const { Deal } = require('../models');
const { DEAL_STATUS, AUDIT_ACTIONS } = require('../config/constants');
const { log } = require('../services/audit.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

const createDeal = catchAsync(async (req, res, next) => {
  const { sellerId, title, description, totalAmount } = req.body;

  // A buyer creates a deal and proposes it to a seller
  const deal = await Deal.create({
    buyerId: req.user.id,
    sellerId,
    title,
    description,
    totalAmount,
    status: DEAL_STATUS.PENDING_ACCEPTANCE,
  });

  await log({
    userId: req.user.id,
    action: AUDIT_ACTIONS.DEAL_CREATED,
    resourceType: 'Deal',
    resourceId: deal._id,
    ip: req.ip,
  });

  ApiResponse.created(res, 'Deal created successfully', { deal });
});

const listDeals = catchAsync(async (req, res, next) => {
  const { id: userId, role } = req.user;

  // Buyers see deals they created; sellers see deals offered to them
  const query = role === 'BUYER' ? { buyerId: userId } : { sellerId: userId };
  
  const deals = await Deal.find(query)
    .populate('buyerId', 'name email businessName')
    .populate('sellerId', 'name email businessName')
    .sort('-createdAt');

  ApiResponse.ok(res, 'Deals retrieved', { deals });
});

const getDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id)
    .populate('buyerId', 'name email businessName')
    .populate('sellerId', 'name email businessName')
    .populate('milestones');

  if (!deal) {
    return next(new AppError('Deal not found', 404, 'DEAL_NOT_FOUND'));
  }

  // Ensure user is authorized to view this deal
  if (deal.buyerId._id.toString() !== req.user.id && deal.sellerId._id.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new AppError('Not authorized to view this deal', 403, 'FORBIDDEN'));
  }

  ApiResponse.ok(res, 'Deal retrieved', { deal });
});

const acceptDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    return next(new AppError('Deal not found', 404, 'DEAL_NOT_FOUND'));
  }

  if (deal.sellerId.toString() !== req.user.id) {
    return next(new AppError('Only the assigned seller can accept this deal', 403, 'FORBIDDEN'));
  }

  if (deal.status !== DEAL_STATUS.PENDING_ACCEPTANCE) {
    return next(new AppError(`Deal cannot be accepted from status: ${deal.status}`, 400, 'INVALID_STATE_TRANSITION'));
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

const rejectDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    return next(new AppError('Deal not found', 404, 'DEAL_NOT_FOUND'));
  }

  if (deal.sellerId.toString() !== req.user.id) {
    return next(new AppError('Only the assigned seller can reject this deal', 403, 'FORBIDDEN'));
  }

  if (deal.status !== DEAL_STATUS.PENDING_ACCEPTANCE) {
    return next(new AppError(`Deal cannot be rejected from status: ${deal.status}`, 400, 'INVALID_STATE_TRANSITION'));
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

const getEscrowStatus = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);
  
  if (!deal) {
    return next(new AppError('Deal not found', 404, 'DEAL_NOT_FOUND'));
  }

  if (deal.buyerId.toString() !== req.user.id && deal.sellerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new AppError('Not authorized to view this deal', 403, 'FORBIDDEN'));
  }

  ApiResponse.ok(res, 'Escrow status retrieved', { escrow: deal.escrow });
});

module.exports = {
  createDeal,
  listDeals,
  getDeal,
  acceptDeal,
  rejectDeal,
  getEscrowStatus,
};
