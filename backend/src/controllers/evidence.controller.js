const { Evidence, Milestone, Deal } = require('../models');
const { MILESTONE_STATUS, EVIDENCE_STATUS, EVIDENCE_TYPES, AUDIT_ACTIONS } = require('../config/constants');
const { log } = require('../services/audit.service');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const aiService = require('../services/ai.service');

const submitEvidence = catchAsync(async (req, res, next) => {
  const { milestoneId, type } = req.body;
  const file = req.file;

  if (!file) {
    return next(new AppError('Evidence file is required', 400));
  }

  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) return next(new AppError('Milestone not found', 404));

  const deal = await Deal.findById(milestone.dealId);
  if (!deal) return next(new AppError('Deal not found', 404));

  if (deal.sellerId.toString() !== req.user.id) {
    return next(new AppError('Only seller can submit evidence', 403));
  }

  if (milestone.status !== MILESTONE_STATUS.MILESTONE_IN_PROGRESS) {
    return next(new AppError('Evidence can only be submitted when milestone is in progress', 400));
  }

  const evidence = await Evidence.create({
    milestoneId,
    uploadedBy: req.user.id,
    file: {
      originalName: file.originalname,
      storagePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
    },
    type: type || EVIDENCE_TYPES.OTHER,
    status: EVIDENCE_STATUS.PENDING,
  });

  milestone.status = MILESTONE_STATUS.EVIDENCE_SUBMITTED;
  await milestone.save();

  await log({
    userId: req.user.id,
    action: AUDIT_ACTIONS.EVIDENCE_SUBMITTED,
    resourceType: 'Evidence',
    resourceId: evidence._id,
    ip: req.ip,
  });

  // Trigger AI processing in background
  aiService.processEvidence(evidence._id).catch(console.error);

  ApiResponse.created(res, 'Evidence submitted successfully', { evidence });
});

const listMilestoneEvidence = catchAsync(async (req, res, next) => {
  const { milestoneId } = req.params;

  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) return next(new AppError('Milestone not found', 404));

  const deal = await Deal.findById(milestone.dealId);
  if (deal.buyerId.toString() !== req.user.id && deal.sellerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new AppError('Not authorized', 403));
  }

  const evidence = await Evidence.find({ milestoneId }).sort('-createdAt');
  ApiResponse.ok(res, 'Evidence retrieved', { evidence });
});

const getEvidence = catchAsync(async (req, res, next) => {
  const evidence = await Evidence.findById(req.params.id);
  if (!evidence) return next(new AppError('Evidence not found', 404));

  const milestone = await Milestone.findById(evidence.milestoneId);
  const deal = await Deal.findById(milestone.dealId);
  
  if (deal.buyerId.toString() !== req.user.id && deal.sellerId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new AppError('Not authorized', 403));
  }

  ApiResponse.ok(res, 'Evidence retrieved', { evidence });
});

module.exports = {
  submitEvidence,
  listMilestoneEvidence,
  getEvidence
};
