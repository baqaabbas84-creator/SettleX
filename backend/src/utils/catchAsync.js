/**
 * Wraps an async route handler so thrown errors reach the global error handler
 * instead of crashing the process.
 *
 * Usage:
 *   router.get('/deals', catchAsync(async (req, res) => { … }));
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
