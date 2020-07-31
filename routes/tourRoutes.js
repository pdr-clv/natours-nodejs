
const express = require('express');
//we are going to create routers, it will replace app. using middleware, we will connect tourRouter with app.
const tourController = require('../controllers/tourController');
//we desectructure object controller. It has all functions of handlers of create, delete, etc.
const { getAllTours, createTour, getTour, updateTour, deleteTour } = tourController;

const router = express.Router();

//tourRouter in fact is a middleware. We created like a sub application
//in other words, application will run throught middleware stack, and by the momment it hits route 'api/v1/tours' it will create the tourRouter, it is like a sub application

//because tourRouter only runs in 'api/v1/tours, we can change route in following calls
//also we will perform the same for usersRouter

router
  .route('/')
  .get(getAllTours)
  .post(createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;