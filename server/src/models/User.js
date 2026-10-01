const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { ROLES, USER_STATUS, CATEGORY_VALUES } = require('../constants');

// Hashing is deliberately slow; tests use the minimum cost to stay fast.
const BCRYPT_ROUNDS = env.isTest ? 4 : 12;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.MEMBER, index: true },
    status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE, index: true },

    emailVerified: { type: Boolean, default: false },
    emailVerification: {
      type: { codeHash: String, expiresAt: Date, attempts: { type: Number, default: 0 }, sentAt: Date },
      select: false,
    },
    passwordReset: {
      type: { tokenHash: String, expiresAt: Date },
      select: false,
    },
    // Tokens issued before this instant are rejected (password change / reset).
    passwordChangedAt: { type: Date, select: false },

    bio: { type: String, trim: true, maxlength: 500, default: '' },
    avatarUrl: { type: String, trim: true, default: '' },
    organization: { type: String, trim: true, maxlength: 120, default: '' },
    interests: [{ type: String, enum: CATEGORY_VALUES }],
    preferences: {
      emailNotifications: { type: Boolean, default: true },
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.passwordHash;
        delete ret.emailVerification;
        delete ret.passwordReset;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
  }
);

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, BCRYPT_ROUNDS);
};

userSchema.methods.checkPassword = function checkPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

/** `issuedAt` is a JWT `iat` (seconds since epoch). */
userSchema.methods.tokenIssuedBeforePasswordChange = function tokenIssuedBeforePasswordChange(issuedAt) {
  if (!this.passwordChangedAt) return false;
  return issuedAt < Math.floor(this.passwordChangedAt.getTime() / 1000);
};

/** Minimal public shape used when embedding a user in other resources. */
userSchema.methods.toSummary = function toSummary() {
  return { id: this.id, name: this.name, avatarUrl: this.avatarUrl, organization: this.organization, role: this.role };
};

module.exports = mongoose.model('User', userSchema);
