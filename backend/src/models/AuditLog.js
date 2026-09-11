const mongoose = require('mongoose');
const { AUDIT_ACTIONS } = require('../config/constants');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
    },
    resourceType: {
      type: String,
      trim: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ip: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
