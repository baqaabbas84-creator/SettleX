const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Middleware that checks express-validator results
 * and returns a 400 with all error details when invalid.
 *
 * Place AFTER the validation chain in the route definition:
 *   router.post('/login', [...validators], validate, controller);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));

    return ApiResponse.send(res, 400, {
      success: false,
      message: 'Validation failed',
      data: messages,
    });
  }

  next();
};

module.exports = validate;
