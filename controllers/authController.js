const { promisify } = require('util');
//utils is a built in repository from node, has the function promisify, it will transform an async function into a promise.
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.singUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if there is email and password in the body
  if (!email || !password) {
    return next(new AppError('Please provide email and password'));
  }

  // 2) cehck if user exists and password is correct
  //select('+password') this is to show one field is hiden by default (select:false)
  const user = await User.findOne({ email }).select('+password');
  //we will create a function, or in this case instant method in userModel, and we will use it here, to encrypt password, and compare with the encrypted password stores in database
  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3)if everything is OK, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists token
  // token will be sent in the http header with the request.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged In. Please loggin to get access', 401)
    );
  }
  // 2) VERIFICATION token.

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) CHECK if user still exists. Just in case was deleted.
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does not longer exists',
        401
      )
    );
  }
  // 4) CHECK if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The user has changed password recently, please Log in again',
        401
      )
    );
  }

  //Once is everything checked, now next, this GRANT ACCESS TO PROTECTED ROUTE.
  req.user = currentUser;
  next();
});

//we can't pass arguments in a middleware function. We have to wrap middleware function.
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array ['admin', 'lead-guide'] role = 'user' so user is not included in the array.
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

//when user forget password, he will send a post request to the end point forgotPassword, only with his e-mail address, and later he will send an emial with the instructions of reset password.
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user according to the email posted
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }
  //2) Generate the random reset token (this is not JWT)
  //we will use instant method createPasswordResetToken generated in userModel
  const resetToken = user.createPasswordResetToken();
  //because we created a new property passwordexpires, we have to save user now, but we will not run validators, like if we were creating a new user or sign up
  await user.save({ validateBeforeSave: false });

  // 3) send it to user's email
  const resetURL = `${req.protocol}:://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\nIf your didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});
exports.resetPassword = (req, res, next) => {
  console.log('resent password');
};
