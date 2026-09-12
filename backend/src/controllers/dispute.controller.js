const { Dispute, Milestone, Deal, Evidence } = require('../models');
const { DISPUTE_STATUS, MILESTONE_STATUS, AUDIT_ACTIONS } = require('../config/constants');
const { log } = require('../services/audit.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const aiService = require('../services/ai.service');

const createDispute = catchAsync(async (req, res, next) => {
  const { dealId, milestoneId, reason, amount, statement } = req.body;

  const deal = await Deal.findById(dealId);
  if (!deal) return next(new AppError('Deal not found', 404));

  // Verify authorization
  if (deal.buyerId.toString() !== req.user.id && deal.sellerId.toString() !== req.user.id) {
    return next(new AppError('Only deal participants can raise a dispute', 403));
  }

  // Ensure milestone is valid
  if (milestoneId) {
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) return next(new AppError('Milestone not found', 404));
    
    // Update milestone status to DISPUTED to lock funds implicitly and prevent releases
    if (milestone.status === MILESTONE_STATUS.RELEASED || milestone.status === MILESTONE_STATUS.REFUNDED) {
       return next(new AppError('Cannot dispute a closed milestone', 400));
    }
    milestone.status = MILESTONE_STATUS.DISPUTED;
    await milestone.save();
  }

  const dispute = await Dispute.create({
    dealId,
    milestoneId,
    raisedBy: req.user.id,
    reason,
    amount,
    buyerStatement: deal.buyerId.toString() === req.user.id ? statement : undefined,
    sellerStatement: deal.sellerId.toString() === req.user.id ? statement : undefined,
    status: DISPUTE_STATUS.OPEN,
  });

  await log({
    userId: req.user.id,
    action: AUDIT_ACTIONS.DISPUTE_CREATED,
    resourceType: 'Dispute',
    resourceId: dispute._id,
    ip: req.ip,
  });

  ApiResponse.created(res, 'Dispute created successfully', { dispute });
});

const listDisputes = catchAsync(async (req, res, next) => {
  const { dealId } = req.params;

  const deal = await Deal.findById(dealId);
  if (!deal) return next(new AppError('Deal not found', 404));

  if (deal.buyerId.toString() !== req.user.id && deal.sellerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new AppError('Not authorized', 403));
  }

  const disputes = await Dispute.find({ dealId }).sort('-createdAt');
  ApiResponse.ok(res, 'Disputes retrieved', { disputes });
});

const getDispute = catchAsync(async (req, res, next) => {
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) return next(new AppError('Dispute not found', 404));

  const deal = await Deal.findById(dispute.dealId);
  if (deal.buyerId.toString() !== req.user.id && deal.sellerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new AppError('Not authorized', 403));
  }

  ApiResponse.ok(res, 'Dispute retrieved', { dispute });
});

const respondToDispute = catchAsync(async (req, res, next) => {
  const { statement } = req.body;
  const dispute = await Dispute.findById(req.params.id);
  
  if (!dispute) return next(new AppError('Dispute not found', 404));
  if (dispute.status !== DISPUTE_STATUS.OPEN) return next(new AppError('Dispute is not open', 400));

  const deal = await Deal.findById(dispute.dealId);

  // Determine role
  if (deal.sellerId.toString() === req.user.id) {
    dispute.sellerStatement = statement;
  } else if (deal.buyerId.toString() === req.user.id) {
    dispute.buyerStatement = statement;
  } else {
    return next(new AppError('Not authorized', 403));
  }

  dispute.status = DISPUTE_STATUS.UNDER_REVIEW;
  
  // Trigger AI to summarize dispute
  try {
     const aiResult = await aiService.summariseDispute(dispute.buyerStatement, dispute.sellerStatement, []);
     if (aiResult.success) {
         dispute.aiSummary = aiResult.data;
     }
  } catch(e) {
     console.error('AI summary failed', e);
  }

  await dispute.save();

  ApiResponse.ok(res, 'Responded to dispute', { dispute });
});

const resolveDispute = catchAsync(async (req, res, next) => {
  const { decision, notes } = req.body;
  const dispute = await Dispute.findById(req.params.id);
  
  if (!dispute) return next(new AppError('Dispute not found', 404));
  if (dispute.status === DISPUTE_STATUS.RESOLVED) return next(new AppError('Dispute already resolved', 400));

  // Note: Only ADMIN could do this technically, controlled by routes middleware
  
  dispute.status = DISPUTE_STATUS.RESOLVED;
  dispute.resolution = {
    decision,
    notes,
    resolvedBy: req.user.id,
    resolvedAt: new Date()
  };

  await dispute.save();

  // Escrow changes need to happen via milestone transition
  // AI MUST NOT do this, only human admin

  await log({
    userId: req.user.id,
    action: AUDIT_ACTIONS.DISPUTE_RESOLVED,
    resourceType: 'Dispute',
    resourceId: dispute._id,
    ip: req.ip,
  });

  ApiResponse.ok(res, 'Dispute resolved', { dispute });
});

module.exports = {
  createDispute,
  listDisputes,
  getDispute,
  respondToDispute,
  resolveDispute
};
