const { AuditLog } = require('../models');

/**
 * Record an audit log entry.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.action     One of AUDIT_ACTIONS
 * @param {string} [params.resourceType]
 * @param {string} [params.resourceId]
 * @param {object} [params.details]
 * @param {string} [params.ip]
 */
const log = async ({ userId, action, resourceType, resourceId, details, ip }) => {
  try {
    await AuditLog.create({ userId, action, resourceType, resourceId, details, ip });
  } catch (err) {
    // Audit failures must never break the business flow
    console.error('Audit log write failed:', err.message);
  }
};

module.exports = { log };
