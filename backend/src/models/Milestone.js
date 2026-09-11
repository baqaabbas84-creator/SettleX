const mongoose = require('mongoose');
const { MILESTONE_STATUS } = require('../config/constants');

const milestoneSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    amount: {
      type: Number,
      required: [true, 'Milestone amount is required'],
      min: [1, 'Amount must be positive'],
    },
    dueDate: {
      type: Date,
    },
    conditions: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: Object.values(MILESTONE_STATUS),
      default: MILESTONE_STATUS.CREATED,
    },
    // Idempotency key to prevent double release / double refund
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true, // allow null/undefined values
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index for fast deal-scoped queries
milestoneSchema.index({ dealId: 1, status: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);
