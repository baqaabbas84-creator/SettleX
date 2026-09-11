const mongoose = require('mongoose');
const { EVIDENCE_TYPES, EVIDENCE_STATUS } = require('../config/constants');

const evidenceSchema = new mongoose.Schema(
  {
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    file: {
      originalName: String,
      storagePath: String,   // server-side path — never exposed to client directly
      mimeType: String,
      size: Number,
    },
    type: {
      type: String,
      enum: Object.values(EVIDENCE_TYPES),
      default: EVIDENCE_TYPES.OTHER,
    },
    aiResult: {
      extractedFields: { type: mongoose.Schema.Types.Mixed, default: null },
      confidence: { type: Number, default: null },
      inconsistencies: [String],
      processedAt: Date,
    },
    status: {
      type: String,
      enum: Object.values(EVIDENCE_STATUS),
      default: EVIDENCE_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

evidenceSchema.index({ milestoneId: 1 });

module.exports = mongoose.model('Evidence', evidenceSchema);
