const authRoutes        = require('./auth.routes');
const userRoutes        = require('./user.routes');
const dealRoutes        = require('./deal.routes');
const milestoneRoutes   = require('./milestone.routes');
const transactionRoutes = require('./transaction.routes');
const evidenceRoutes    = require('./evidence.routes');
const disputeRoutes     = require('./dispute.routes');
const trustRoutes       = require('./trust.routes');
const adminRoutes       = require('./admin.routes');
const aiRoutes          = require('./ai.routes');

/**
 * Mount all route groups on the Express app.
 * @param {import('express').Application} app
 */
const mountRoutes = (app) => {
  app.use('/api/auth',         authRoutes);
  app.use('/api/users',        userRoutes);
  app.use('/api/deals',        dealRoutes);
  app.use('/api/milestones',   milestoneRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/evidence',     evidenceRoutes);
  app.use('/api/disputes',     disputeRoutes);
  app.use('/api/trust',        trustRoutes);
  app.use('/api/admin',        adminRoutes);
  app.use('/api/ai',           aiRoutes);
};

module.exports = mountRoutes;
