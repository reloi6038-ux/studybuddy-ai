const User = require('../models/User');
const { signToken } = require('../services/tokenService');
const asyncHandler = require('../utils/asyncHandler');

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, gradeLevel, subjects } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.statusCode = 409;
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    gradeLevel,
    subjects,
  });

  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    message: 'Account created successfully',
    token,
    user: user.toSafeJSON(),
  });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    res.statusCode = 401;
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.statusCode = 401;
    throw new Error('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully',
    token,
    user: user.toSafeJSON(),
  });
});

// @route GET /api/auth/me (protected)
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    user: req.user.toSafeJSON(),
  });
});

module.exports = { register, login, getMe };