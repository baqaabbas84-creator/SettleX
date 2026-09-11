const AppError = require('../utils/AppError');

/**
 * Factory that returns middleware restricting access to specific roles.
 *
 * Usage:
 *   router.post('/deals', authenticate, authorize('BUYER'), createDeal);
 *
 * @param  {...string} allowedRoles
 */
const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'AUTH_REQUIRED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this resource.`,
          403,
          'FORBIDDEN',
        ),
      );
    }

    next();
  };
};

module.exports = authorize;
