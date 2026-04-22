const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { User } = require('../models/index');
const { sendSuccess, sendError } = require('../utils/response');

// Zod validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['user', 'admin']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    // Validate input
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.errors[0].message, 400);
    }

    const { name, email, password, role } = parsed.data;

    // Check duplicate email
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return sendError(res, 'Email already registered', 409);
    }

    // Create user (password hashed by model hook)
    const user = await User.create({ name, email, password, role });

    const token = generateToken(user.id);

    return sendSuccess(res, { user, token }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.errors[0].message, 400);
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user.id);

    return sendSuccess(res, { user, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/auth/me  (protected)
const getMe = async (req, res, next) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findByPk(req.user.id);
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user }, 'User fetched successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };