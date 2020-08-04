const express = require('express');
const morgan = require('morgan');

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

//this is our own middleware function, we have to use params req, res, y next is obligatory, otherwise, never will go next step of middleware stack
// if there is an response before middleware, never will be executed. it is better if they are on top.
app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});
//this middleare catch the url requested.
app.use((req, res, next) => {
  console.log('Current url requested: ', req.originalUrl);
  next();
});
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

module.exports = app;
