const mongoose = require('mongoose');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  salt: String,
  roles: { type: [String], enum: ['registered', 'admin'], default: 'registered' },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  },
});

const generateUuid = () => {
  return uuidv4();
};

// pbkdf2 configurations
const iterationCount = 1000;
const keylen = 64;
const digest = 'sha512';

// pre hook to hash plain password
userSchema.pre('save', function savePreHook(next) {
  if (this.isModified('password') || this.isNew) {
    const user = this;

    // get a salt for password hashing
    const salt = generateUuid();

    crypto.pbkdf2(user.password, salt, iterationCount, keylen, digest, (cryptoErr, derivedKey) => {
      if (cryptoErr) {
        next(cryptoErr);
        return;
      }

      // assign generated key and salt to user
      user.password = derivedKey.toString('hex');
      user.salt = salt;

      // continue
      next();
    });
  } else {
    next();
  }
});

// check password
userSchema.methods.isValidPassword = function isValidPassword(passwordToCheck) {
  const { password, salt } = this;

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(passwordToCheck, salt, iterationCount, keylen, digest, (cryptoErr, derivedKey) => {
      if (cryptoErr) {
        reject(cryptoErr);
        return;
      }

      const passwordToCheckHash = derivedKey.toString('hex');
      resolve(password === passwordToCheckHash);
    });
  });
};

module.exports = mongoose.model('Users', userSchema, 'Users');