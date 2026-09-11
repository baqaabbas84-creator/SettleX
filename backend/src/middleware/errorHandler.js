const AppError = require('../utils/AppError');

/**
 * Global error handler (must be registered LAST in the middleware stack).
 *
 * - Operational errors (AppError) → send known status + message.
 * - Programming errors → log stack and send generic 500.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    return res.status(409).json({
      success: false,
      message: `Duplicate value for: ${field}`,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Known operational error
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  // Unknown / programming error
  console.error('UNHANDLED ERROR:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

module.exports = errorHandler;
