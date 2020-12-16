const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  //console.log(value);
  const message = `Duplicate field value: "${value}" Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.properties.message);
  const message = `Invalid input data ${errors.join(', ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  //we check wether url begins with api/ or not, if it doesn't we know we are in view mode, and we will render an error html page/pug template
  //A. For API error handling, we sent this json
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //B. For RENDERED WEBSITE error handling. We render 'error' pug template
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiresError = () =>
  new AppError('Your token has expired, please log in again', 401);

const sendErrorProd = (err, req, res) => {
  //we check wether url begins with api/ or not, if it doesn't we know we are in view mode, and we will render an error html page/pug template
  //A. For API error handling, we sent this json
  if (req.originalUrl.startsWith('/api')) {
    //operational error, trusted error: send message to client.
    if (err.isOperacional) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //programming or other unknown error: don't leak error details in production.
    //first log error
    console.error('ERROR', err);
    //second generate message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
  //B. For RENDERED WEBSITE error handling. We render 'error' pug template
  //operational error, trusted error: send message to client.
  if (err.isOperacional) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  //programming or other unknown error: don't leak error details in production.
  //first log error
  console.error('ERROR', err);
  //second generate message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'It ocurred an error. Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { message: err.message, ...err };
    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiresError();
    //console.log(err);
    sendErrorProd(error, req, res);
  }
};
