const express = require('express');
const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1. Middlewares. They will be applied to all routes and requests

//app.use method is in order to use middleware
//morgan is third part middleware which provides a console.log with few details of info. It has several arguments, interesting the one is 'dev'
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Middleware will catch request before receiving inside the post callback, and it will transform request body into a json.
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//this middleware add date/time of request
//we define new property in request called req.requestTime
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
// 3. Mounting our routes
//only for certain routes, they will be applied middleware, in this case are the routes.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//if not any route was catched by tourRouter or userRouter, we will get this point, and we will handle error according to the route not chatched.
//all will catch any method post, get, etc. * will catch any route gets this point.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//we will use middelware function comming from moongose, the one that has 4 parameters, moongones already know it is a function to catch if and error happened

app.use(globalErrorHandler);

module.exports = app;
