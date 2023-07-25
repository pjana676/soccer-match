class ApiError extends Error {
  constructor(message, code = 500, errors = {}, status = 'error') {
    super(message);

    this.name = 'ApiError';

    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

module.exports = ApiError;
