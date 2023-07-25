const ms = require('ms');
const _ = require('lodash');
const LRU = require('lru-cache');
const { createError } = require('../errors');
const __ = require('../helpers/locales');
const { Verify } = require('../helpers/jwtToken');

const { JWT_SECRET, JWT_EXPIRY = '2h' } = process.env;

const options = { max: 500 };
const inMemoryLruCache = new LRU(options);
inMemoryLruCache.psetex = (key, maxAge, value) => {
  inMemoryLruCache.set(key, value, maxAge);
};
let availableCache = inMemoryLruCache;

const verifyJwtToken = Verify({ secret: JWT_SECRET, cache: availableCache, cacheTtlMs: ms(JWT_EXPIRY) });

module.exports = async (req, res, next) => {
  try {
    const payload = await verifyJwtToken(req.headers.authorization);
    if (_.isEmpty(payload)) {
      throw createError.Unauthorized(__.error_unauthorized);
    } else {
      req.user = payload;
      next();
    }
  } catch (error) {
    next(error);
  }
};
