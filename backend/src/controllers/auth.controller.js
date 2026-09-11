const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { log } = require('../services/audit.service');
const { AUDIT_ACTIONS } = require('../config/constants');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const config = require('../config/env');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, businessName, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already in use', 400, 'EMAIL_IN_USE'));
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    businessName,
    role,
  });

  const token = signToken(user._id, user.role);

  await log({
    userId: user._id,
    action: AUDIT_ACTIONS.REGISTER,
    ip: req.ip,
  });

  // Remove password from output
  user.password = undefined;

  ApiResponse.created(res, 'User registered successfully', {
    user,
    token,
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400, 'MISSING_CREDENTIALS'));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401, 'INVALID_CREDENTIALS'));
  }

  const token = signToken(user._id, user.role);

  await log({
    userId: user._id,
    action: AUDIT_ACTIONS.LOGIN,
    ip: req.ip,
  });

  user.password = undefined;

  ApiResponse.ok(res, 'Login successful', {
    user,
    token,
  });
});

const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  ApiResponse.ok(res, 'Current user retrieved', { user });
});

module.exports = {
  register,
  login,
  getMe,
};
