const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const config = require('../config/env');

/**
 * Verify the JWT from the Authorization header.
 * Attaches decoded payload to req.user.
 */
const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please provide a valid token.', 401, 'AUTH_REQUIRED'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid token.', 401, 'INVALID_TOKEN'));
  }
};

module.exports = authenticate;
