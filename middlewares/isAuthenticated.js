const { createError } = require('../errors');
const __ = require('../helpers/locales');

module.exports = async (req, res, next) => {
  if (!req.user) {
    next(createError.Unauthorized(__.error_unauthorized));
    return;
  }

  next();
};
