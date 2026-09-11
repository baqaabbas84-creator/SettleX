/**
 * Helper to build consistent JSON API responses.
 */
class ApiResponse {
  /**
   * @param {boolean} success
   * @param {string}  message
   * @param {*}       [data]
   * @param {object}  [meta]  pagination, counts, etc.
   */
  static send(res, statusCode, { success, message, data, meta }) {
    const body = { success, message };
    if (data !== undefined) body.data = data;
    if (meta !== undefined) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static ok(res, message = 'Success', data, meta) {
    return ApiResponse.send(res, 200, { success: true, message, data, meta });
  }

  static created(res, message = 'Created', data) {
    return ApiResponse.send(res, 201, { success: true, message, data });
  }

  static badRequest(res, message = 'Bad request') {
    return ApiResponse.send(res, 400, { success: false, message });
  }

  static unauthorized(res, message = 'Unauthorized') {
    return ApiResponse.send(res, 401, { success: false, message });
  }

  static forbidden(res, message = 'Forbidden') {
    return ApiResponse.send(res, 403, { success: false, message });
  }

  static notFound(res, message = 'Resource not found') {
    return ApiResponse.send(res, 404, { success: false, message });
  }

  static conflict(res, message = 'Conflict') {
    return ApiResponse.send(res, 409, { success: false, message });
  }
}

module.exports = ApiResponse;
