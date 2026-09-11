const mongoose = require('mongoose');
const { DEAL_STATUS } = require('../config/constants');

const dealSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Deal title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [1, 'Amount must be positive'],
    },
    status: {
      type: String,
      enum: Object.values(DEAL_STATUS),
      default: DEAL_STATUS.DRAFT,
    },
    // Simulated escrow ledger summary (authoritative aggregates)
    escrow: {
      locked: { type: Number, default: 0 },
      released: { type: Number, default: 0 },
      refunded: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual: milestones for this deal
dealSchema.virtual('milestones', {
  ref: 'Milestone',
  localField: '_id',
  foreignField: 'dealId',
});

module.exports = mongoose.model('Deal', dealSchema);
