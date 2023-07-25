const Joi = require('joi');
const validate = require('../middlewares/validate-request');
const authService = require('../services/auth')


const registerCommonSchema = Joi.object({
  username: Joi.string()
    .trim()
    .required()
    .lowercase().label('username'),
  email: Joi.string()
    .trim()
    .email({
      minDomainSegments: 2,
      tlds: { allow: true },
    })
    .required()
    .lowercase()
    .label('Email'),
  password: Joi
    .string()
    .min(8)
    .max(100)
    .required()
    .label('Password'),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({
      minDomainSegments: 2,
      tlds: { allow: true },
    })
    .required()
    .lowercase()
    .label('Email'),
  password: Joi
    .string()
    .min(8)
    .max(100)
    .required()
    .label('Password'),
});


/**
 * user registration payload validation
 */
const registerUser = [
  validate(registerCommonSchema),
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const data = await authService.registerUser({ username, email, password })
      res.success({ data });
    } catch (error) {
      next(error)
    }
  }];

/**
 * user login to get authenticate
 */
const login = [
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password = '' } = req.body;

      const data = await authService.login({ email, password });
      res.success({ data });
    } catch (error) {
      next(error);
    }
  },
];


module.exports = {
  registerUser,
  login,
};