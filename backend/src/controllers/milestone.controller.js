const { Milestone, Deal, Transaction } = require('../models');
const { MILESTONE_STATUS, TRANSACTION_TYPES, AUDIT_ACTIONS } = require('../config/constants');
const { validateTransition } = require('../services/escrow.service');
const { log } = require('../services/audit.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const { v4: uuidv4 } = require('uuid');

const createMilestone = catchAsync(async (req, res, next) => {
  const { dealId, title, description, amount, dueDate, conditions } = req.body;

  const deal = await Deal.findById(dealId);
  if (!deal) {
    return next(new AppError('Deal not found', 404, 'DEAL_NOT_FOUND'));
  }

  // Only buyer can create milestones, and only before the deal is completely started/finished
  if (deal.buyerId.toString() !== req.user.id) {
    return next(new AppError('Only the buyer can create milestones', 403, 'FORBIDDEN'));
  }

  const milestone = await Milestone.create({
    dealId,
    title,
    description,
    amount,
    dueDate,
    conditions,
    status: MILESTONE_STATUS.CREATED,
  });

  await log({
    userId: req.user.id,
    action: AUDIT_ACTIONS.MILESTONE_CREATED,
    resourceType: 'Milestone',
    resourceId: milestone._id,
    ip: req.ip,
  });

  ApiResponse.created(res, 'Milestone created', { milestone });
});

const listMilestones = catchAsync(async (req, res, next) => {
  const { dealId } = req.params;
  const milestones = await Milestone.find({ dealId }).sort('createdAt');
  ApiResponse.ok(res, 'Milestones retrieved', { milestones });
});

/**
 * Escrow Engine: Handles state transitions and simulated ledger updates.
 */
const transitionMilestone = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { targetStatus, idempotencyKey } = req.body;

  const milestone = await Milestone.findById(id);
  if (!milestone) return next(new AppError('Milestone not found', 404, 'MILESTONE_NOT_FOUND'));

  const deal = await Deal.findById(milestone.dealId);
  if (!deal) return next(new AppError('Deal not found', 404, 'DEAL_NOT_FOUND'));

  // Ensure authorized (buyer/seller involved in the deal)
  if (deal.buyerId.toString() !== req.user.id && deal.sellerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new AppError('Not authorized', 403, 'FORBIDDEN'));
  }

  // 1. Validate state transition using Escrow Service
  validateTransition(milestone.status, targetStatus);

  // 2. Check Idempotency for financial transitions
  if (idempotencyKey) {
    if (milestone.idempotencyKey === idempotencyKey) {
       return ApiResponse.ok(res, 'Transition already processed (idempotency match)', { milestone });
    }
  }

  // 3. Process Escrow Ledger Updates
  try {
    if (targetStatus === MILESTONE_STATUS.FUNDED) {
      // Move money into LOCKED state
      deal.escrow.locked += milestone.amount;
      await deal.save();
      await Transaction.create({
        dealId: deal._id,
        milestoneId: milestone._id,
        type: TRANSACTION_TYPES.FUND,
        amount: milestone.amount,
        status: 'COMPLETED',
        reference: `Funding milestone: ${milestone.title}`
      });
    } 
    else if (targetStatus === MILESTONE_STATUS.RELEASED) {
      // Move money from LOCKED to RELEASED
      if (deal.escrow.locked < milestone.amount) {
        throw new AppError('Insufficient locked funds', 400, 'INSUFFICIENT_FUNDS');
      }
      deal.escrow.locked -= milestone.amount;
      deal.escrow.released += milestone.amount;
      await deal.save();
      await Transaction.create({
        dealId: deal._id,
        milestoneId: milestone._id,
        type: TRANSACTION_TYPES.RELEASE,
        amount: milestone.amount,
        status: 'COMPLETED',
        reference: `Releasing milestone: ${milestone.title}`
      });
    }
    else if (targetStatus === MILESTONE_STATUS.REFUNDED) {
      // Move money from LOCKED to REFUNDED
      if (deal.escrow.locked < milestone.amount) {
        throw new AppError('Insufficient locked funds', 400, 'INSUFFICIENT_FUNDS');
      }
      deal.escrow.locked -= milestone.amount;
      deal.escrow.refunded += milestone.amount;
      await deal.save();
      await Transaction.create({
        dealId: deal._id,
        milestoneId: milestone._id,
        type: TRANSACTION_TYPES.REFUND,
        amount: milestone.amount,
        status: 'COMPLETED',
        reference: `Refunding milestone: ${milestone.title}`
      });
    }

    milestone.status = targetStatus;
    if (idempotencyKey) milestone.idempotencyKey = idempotencyKey;
    
    await milestone.save();
  } catch (err) {
    throw err;
  }

  // Log action
  const action = targetStatus === MILESTONE_STATUS.RELEASED ? AUDIT_ACTIONS.MILESTONE_RELEASED :
                 targetStatus === MILESTONE_STATUS.REFUNDED ? AUDIT_ACTIONS.MILESTONE_REFUNDED :
                 targetStatus === MILESTONE_STATUS.APPROVED ? AUDIT_ACTIONS.MILESTONE_APPROVED :
                 null;
                 
  if (action) {
    await log({
      userId: req.user.id,
      action: action,
      resourceType: 'Milestone',
      resourceId: milestone._id,
      details: { targetStatus },
      ip: req.ip,
    });
  }

  ApiResponse.ok(res, `Milestone transitioned to ${targetStatus}`, { milestone });
});

const approveMilestone = catchAsync(async (req, res, next) => {
  // Syntactic sugar: Buyer calls this to move from UNDER_REVIEW to APPROVED.
  // We can just proxy to transition.
  req.body.targetStatus = MILESTONE_STATUS.APPROVED;
  return transitionMilestone(req, res, next);
});

module.exports = {
  createMilestone,
  listMilestones,
  transitionMilestone,
  approveMilestone,
};
