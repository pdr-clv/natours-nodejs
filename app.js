const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

//we tell express, we will use pug like templates for views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//1. GLOBAL MIDDLEWARES. They will be applied to all routes and requests

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Set Security HTTP Headers. Add new headers with more security details, following up secure practices
app.use(helmet());

//Development logging
//morgan is third part middleware which provides a console.log with few details of info. It has several arguments, interesting the one is 'dev'
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//this is to limit 100 request per 45 minutes.
const limiter = rateLimit({
  max: 100,
  windowMs: 45 * 60 * 1000,
  message: 'Too many requests from this IP, try again in 45 minutes',
});

app.use('/api', limiter); //if we don't set /api, limiter will affecto to all routes, we want it for the route api, it could be in blank this field.
//Middleware will catch request before receiving inside the post callback, and it will transform request body into a json.

//Body parser, reading data from the body into req.body, we will make a limit of 10kg in the jason body request
app.use(express.json({ limit: '10kb' }));
//after getting json req.body we can sanitizate this data.
//Data sanitization agains NoSQL query injection
app.use(mongoSanitize()); //this middleware remove all dolar signs in the querries.
//Data sanitization agains XSS (Cross sites)
app.use(xss()); //this removes all HTML code injected in the user text box.
//cleaning http parameters polution, prevent if user or attacker input parameters in http address bar, like two sort & sort or something like this.
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//Some test middleware
//this middleware add date/time of request
//we define new property in request called req.requestTime
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
// 3. Mounting our routes
//only for certain routes, they will be applied middleware, in this case are the routes.
app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Pedro',
  });
});

app.get('/overview', (req, res) => {
  res.status(200).render('overview', {
    title: 'All Tours',
  });
});

app.get('/tour', (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
  });
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//if not any route was catched by tourRouter or userRouter, we will get this point, and we will handle error according to the route not chatched.
//all will catch any method post, get, etc. * will catch any route gets this point.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//we will use middelware function comming from moongose, the one that has 4 parameters, moongones already know it is a function to catch if and error happened

app.use(globalErrorHandler);

module.exports = app;
