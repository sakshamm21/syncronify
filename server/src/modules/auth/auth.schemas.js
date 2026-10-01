const { z, email, password } = require('../../lib/schemas');

const register = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email,
  password,
});

const verifyEmail = z.object({
  email,
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

const emailOnly = z.object({ email });

const login = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

const resetPassword = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  password,
});

module.exports = { register, verifyEmail, emailOnly, login, resetPassword };
