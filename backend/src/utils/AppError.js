/**
 * Custom application error.
 * Controllers / services throw this; the global error handler catches it.
 */
class AppError extends Error {
  /**
   * @param {string} message  Human-readable message
   * @param {number} statusCode  HTTP status code (default 500)
   * @param {string} [code]  Machine-readable error code (e.g. 'INVALID_STATE_TRANSITION')
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;          // distinguishes expected from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
