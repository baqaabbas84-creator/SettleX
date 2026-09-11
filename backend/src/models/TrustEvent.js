const mongoose = require('mongoose');

const trustEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: String,
      required: true,
      trim: true,
    },
    scoreImpact: {
      type: Number,
      default: 0,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true, // createdAt serves as the event timestamp
  },
);

trustEventSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TrustEvent', trustEventSchema);
