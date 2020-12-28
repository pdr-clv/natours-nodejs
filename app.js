const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
//we need cookie-parser package to get access to cookie sent from server to the browser
const cookieParser = require('cookie-parser');
const compression = require('compression');
consst cors = require('cors');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
app.enable('trust proxy');

//we tell express, we will use pug like templates for views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//1. GLOBAL MIDDLEWARES. They will be applied to all routes and requests
app.use(cors());
app.options('*', cors());
//use(cors()) is to allow any Cross Origin request, options is a http method that includes patch and delete requests, we must allow cors to all routes.
//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Set Security HTTP Headers. Add new headers with more security details, following up secure practices
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://m.stripe.network',
          'https://*.cloudflare.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://m.stripe.network',
        ],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.stripe.com',
          'https://*.mapbox.com',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
          'ws://127.0.0.1:*/',
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);
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
//cookie parser is similar like body-parser, parses data from cookie
app.use(cookieParser());
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

//this middleware simply compress text included in requests, and it is smaller and very small file.
app.use(compression());

// 3. Mounting our routes
//only for certain routes, they will be applied middleware, in this case are the routes.

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//if not any route was catched by tourRouter or userRouter, we will get this point, and we will handle error according to the route not chatched.
//all will catch any method post, get, etc. * will catch any route gets this point.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//we will use middelware function comming from moongose, the one that has 4 parameters, moongones already know it is a function to catch if and error happened

app.use(globalErrorHandler);

module.exports = app;
