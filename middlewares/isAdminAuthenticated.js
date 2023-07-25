const { createError } = require('../errors');
const __ = require('../helpers/locales');

module.exports = async (req, res, next) => {
  if (!req.user || !req.user.roles.includes('admin')) {
    next(createError.Unauthorized(__.error_unauthorized));
    return;
  }

  next();
};
