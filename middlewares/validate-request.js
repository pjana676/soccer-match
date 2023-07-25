const Joi = require('joi');
const { createError } = require('../errors');
const __ = require('../helpers/locales');

/**
 * Validate request body against a schema
 * there are 2 ways to provide schema
 * 1. static schema
 * 2. a function which returns a schema at runtime,
 *    this function can use request object to decide schema
 */
module.exports = (schemaOrFunc) => {
  const isSchema = Joi.isSchema(schemaOrFunc);
  if (!isSchema && typeof schemaOrFunc !== 'function') {
    throw new Error('Invalid Joi schema');
  }

  return async (req, res, next) => {
    try {
      let schema;
      if (isSchema) {
        schema = schemaOrFunc;
      } else {
        schema = await schemaOrFunc(req);
      }

      const { value, error } = schema.validate(req.body, {
        abortEarly: false,
        errors: {
          wrap: { label: '' },
        },
        messages: {
          'string.pattern.base': __.error_label_not_valid,
        },
      });

      if (error) {
        const errors = {};
        error.details.forEach((err) => {
          errors[err.path.join('.') || 'errorSummary'] = err.message;
        });
        
        next(createError.BadRequest(__.error_bad_request, errors));
        return;
      }

      // attach converted values to request
      req.body = value;

      next();
    } catch (error) {
      next(error);
    }
  };
};
