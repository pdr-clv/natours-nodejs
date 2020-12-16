const crypto = require('crypto');
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

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  //we define cookiOptions outside the cookie call. we want secure = true, but only if we are in productions, in development no problem to set it into false or null.
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  //we don't want to show password, we set user.password = undefined, before sending user to the res like new user.
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
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

  createSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if there is email and password in the body
  if (!email || !password) {
    return next(new AppError('Please provide email and password'));
  }

  // 2) check if user exists and password is correct
  //select('+password') this is to show one field is hiden by default (select:false)
  const user = await User.findOne({ email }).select('+password');
  //we will create a function, or in this case instant method in userModel, and we will use it here, to encrypt password, and compare with the encrypted password stores in database
  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3)if everything is OK, send token to client
  createSendToken(user, 200, res);
});

exports.logOut = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists token
  // token will be sent in the http header with the request.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
  res.locals.user = currentUser;
  req.user = currentUser;
  next();
});

//Similar to protect route. Only for conditional rendering pages, wether user is logged in or not. There is no error handling.
exports.isLoggedIn = async (req, res, next) => {
  // 1) Getting token and check if it exists in browser cookies
  if (req.cookies.jwt) {
    //for logging out, we don't want to catch error in errormiddleware when jwt.verify fails, so we create this try, and when jwt is loggedout, it will go to catch, and it will be next()
    try {
      // 1. verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // 2. Check if user exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      // 3. CHECK if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // Finally, if we reach this point, it means there is user logged in. We make it aceesible to our new template
      //This is like passing data from one template to another template
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

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
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}\nIf your didn't forget your password, please ignore this email!`;

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
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token.
  //We will get token from URL, we will encripted and we will compare with the encripted one in the database.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //it must accomplish two conditions. There is user with this token, and if passwordResetExpires is greater than now.
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2) If token is not expired and there is a user, then set a new password
  //3) Update changedPasswrodAt property for the user
  if (!user) {
    return next(new AppError('Token is not valid or it has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) Update changedPasswrodAt property for the user
  //we will use middleware to properly save passwordChangeAt automathically. In userModel, it will be a middleware that will run always (pre) before any save.

  //4) Log the user in, send JWT to the client.
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //console.log(req);
  //1) get the user from collection
  //user is coming in the req, because we run before protect middleware
  const userId = req.user._id;
  const user = await User.findById(userId).select('+password');
  //2) check if posted password is correct.
  const passwordRequested = req.body.password;
  if (!(await user.isCorrectPassword(passwordRequested, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }
  //3) if password is correct, update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  //console.log(user.password, user.passwordConfirm);
  user.save();

  //4) Log user in, send JWT
  createSendToken(user, 200, res);
});
