const mongoose = require('mongoose');
const { DISPUTE_STATUS } = require('../config/constants');

const disputeSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      required: true,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Dispute reason is required'],
      trim: true,
      maxlength: 2000,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(DISPUTE_STATUS),
      default: DISPUTE_STATUS.OPEN,
    },
    buyerStatement: { type: String, trim: true },
    sellerStatement: { type: String, trim: true },
    evidence: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    aiSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    resolution: {
      decision: { type: String, trim: true },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolvedAt: Date,
      notes: String,
    },
  },
  {
    timestamps: true,
  },
);

disputeSchema.index({ dealId: 1, status: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);
