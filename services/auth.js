const User = require('../models/user');
const { createError } = require('../errors')
const { Sign } = require('../helpers/jwt-token');
const __ = require('../helpers/locales')

const { JWT_SECRET, JWT_EXPIRY = '9h' } = process.env;
const jwtOptions = { expiresIn: JWT_EXPIRY };
const signJwtToken = Sign({ secret: JWT_SECRET, jwtOptions });


const getJwtTokenPayload = (user) => {
  return {
    _id: user._id,
    email: user.email,
    username: user.username,
    roles: user.roles,
  };
};

/**
 * User registration to participant in soccer match  
 * @{password, username, email}
 * @{user payload}
 * */
const registerUser = async ({ password, username, email }) => {
  const user = await User.findOne({ email });
  if (user) {
    throw createError.BadRequest(__.error_email_already_exist);
  }
  const newUser = new User({
    email,
    username,
    password: password,
  });

  const saveObj = await newUser.save();

  const fetchedUserData = await User.findById(saveObj._id).exec();
  const payload = getJwtTokenPayload(fetchedUserData);
  const token = await signJwtToken(payload);

  return {
    token,
    user: payload,
  };
};

/**
 * Verify authentication
 * @param {*} email, password 
 * @returns {}
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createError.BadRequest(__.error_invalid_login_credentials);
  }

  const passwordIsValid = await user.isValidPassword(password);
  if (!passwordIsValid) {
    throw createError.BadRequest(__.error_invalid_login_credentials);
  }

  const payload = getJwtTokenPayload(user);

  const token = await signJwtToken(payload);

  return {
    token,
    user: payload,
  };
};

module.exports = {
  registerUser,
  login,
};
