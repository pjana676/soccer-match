const ApiError = require('./ApiError');

const createError = ({ message, code, errors, status }) => new ApiError(message, code, errors, status);

createError.BadRequest = (message = 'Bad Request', errors = {}) => new ApiError(message, 400, errors);
createError.Unauthorized = (message = 'Unauthorized', errors = {}) => new ApiError(message, 401, errors);
createError.Forbidden = (message = 'Forbidden', errors = {}) => new ApiError(message, 403, errors);
createError.NotFound = (message = 'Not Found', errors = {}) => new ApiError(message, 404, errors);
createError.MethodNotAllowed = (message = 'Method Not Allowed', errors = {}) => new ApiError(message, 405, errors);
createError.Conflict = (message = 'Conflict', errors = {}) => new ApiError(message, 409, errors);
createError.TooManyRequests = (message = 'We are processing your request, please try after few minutes', errors = {}) =>
  new ApiError(message, 429, errors);
createError.InternalServerError = (message = 'Internal Server Error', errors = {}) =>
  new ApiError(message, 500, errors);
createError.BadGateway = (message = 'Bad Gateway', errors = {}) => new ApiError(message, 502, errors);
createError.ServiceUnavailable = (message = 'Service Unavailable', errors = {}) => new ApiError(message, 503, errors);
createError.UnsupportedMediaType = (message = 'Unsupported Media Type', errors = {}) =>
  new ApiError(message, 415, errors);

module.exports = { ApiError, createError };
