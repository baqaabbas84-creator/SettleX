const mongoose = require('mongoose');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../config/constants');

const transactionSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
    },
    reference: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // provides timestamp via createdAt
  },
);

transactionSchema.index({ dealId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
