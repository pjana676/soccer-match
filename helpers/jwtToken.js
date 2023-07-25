const jwt = require('jsonwebtoken');
const { createError } = require('../errors');
const __ = require('./locales');

const Sign =
  ({ secret, jwtOptions }) =>
  (payload, jwtOpt = jwtOptions) => {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, jwtOpt, (signErr, token) => {
        if (signErr) {
          reject(signErr);
          return;
        }

        resolve(token);
      });
    });
  };

const Verify =
  ({ secret, cache, cacheTtlMs }) =>
  async (header) => {
    // check Authorization token present
    if (!header) {
      throw createError.Unauthorized(__.error_unauthorized);
    }

    // we are expecting token in following format
    // Bearer {TOKEN}
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw createError.Unauthorized(__.error_unauthorized);
    }

    // Check this token into cache
    const cacheKey = `jwt:${token}`;
    const decodedString = await cache.get(cacheKey);

    if (decodedString) {
      // if previous verify resulted in invalid token
      if (decodedString === 'INVALID') {
        throw createError.Unauthorized(__.error_unauthorized);
      }

      return JSON.parse(decodedString);
    }

    // verify token
    try {
      const decoded = jwt.verify(token, secret, {});
      if (!decoded || !decoded._id) {
        cache.psetex(cacheKey, cacheTtlMs, 'INVALID');
        throw createError.Unauthorized(__.error_unauthorized);
      }

      /**
       * add this token into cache
       * cache TTL will be maximum of token expiry value
       */
      const ttl = decoded.exp ? Math.floor(decoded.exp * 1000 - Date.now()) : cacheTtlMs;
      cache.psetex(cacheKey, ttl, JSON.stringify(decoded));

      return decoded;
    } catch (error) {
      cache.psetex(cacheKey, cacheTtlMs, 'INVALID');
      throw createError.Unauthorized(__.error_unauthorized);
    }
  };

const Destroy =
  ({ secret, cache, cacheTtlMs }) =>
  async (header) => {
    // check Authorization token present
    if (!header) {
      throw createError.Unauthorized(__.error_unauthorized);
    }

    // we are expecting token in following format
    // Bearer {TOKEN}
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw createError.Unauthorized(__.error_unauthorized);
    }

    // Check this token into cache
    const cacheKey = `jwt:${token}`;
    const decodedString = await cache.get(cacheKey);

    if (decodedString) {
      // if previous verify resulted in invalid token
      if (decodedString === 'INVALID') {
        throw createError.Unauthorized(__.error_unauthorized);
      }

      return JSON.parse(decodedString);
    }

    // verify token
    try {
      const decoded = jwt.verify(token, secret, {});
      if (!decoded || !decoded._id) {
        cache.psetex(cacheKey, cacheTtlMs, 'INVALID');
        throw createError.Unauthorized(__.error_unauthorized);
      }

      cache.psetex(cacheKey, 0, null);

      return 'Destroyed';
    } catch (error) {
      cache.psetex(cacheKey, cacheTtlMs, 'INVALID');
      throw createError.Unauthorized(__.error_unauthorized);
    }
  };

module.exports = { Sign, Verify, Destroy };
