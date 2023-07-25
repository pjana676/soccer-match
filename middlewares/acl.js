const ms = require('ms');
const LRU = require('lru-cache');
const { createError } = require('../errors');
const __ = require('../helpers/locales');
const { Verify } = require('../helpers/jwt-token');

module.exports = ({ validate }) => {
  const { JWT_SECRET, JWT_EXPIRY = '2h' } = process.env;
  const publicUserRoles = ['public']; // this is default roles assigned to req no roles is present for a req
  const superAdminRole = 'super-admin';
  const { cache } = core;

  const options = { max: 500 };
  const inMemoryLruCache = new LRU(options);
  inMemoryLruCache.psetex = (key, maxAge, value) => {
    inMemoryLruCache.set(key, value, maxAge);
  };
  let availableCache = inMemoryLruCache;

  const verifyJwtToken = Verify({ secret: JWT_SECRET, cache: availableCache, cacheTtlMs: ms(JWT_EXPIRY) });

  const checkPermission = async (req, res, next, object, action) => {
    try {
      let roles;

      // if already decoded
      if (req.user) {
        roles = req.user.roles;
      } else {
        const payload = await verifyJwtToken(req.headers.authorization).catch(() => null);
        if (payload) {
          req.user = payload;
          roles = payload.roles;
        }
      }

      // no acl object defined
      if (!object) {
        next();
        return;
      }

      // assign public roles if no roles available
      if (!roles) {
        roles = publicUserRoles;
      }

      // bypass super admin user
      if (roles.includes(superAdminRole)) {
        next();
        return;
      }

      // validate any one of the roles have permission to perform action on object
      const permission = await validate({ roles, object, action });
      if (!permission) {
        throw createError.Unauthorized(__.error_unauthorized);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  return (params = {}) => {
    const { name } = params; // name, method, policies
    const [object, action] = (name || '').split(':');

    return (req, res, next) => {
      checkPermission(req, res, next, object, action);
    };
  };
};
