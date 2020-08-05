const express = require('express');
//we are going to create routers, it will replace app. using middleware, we will connect tourRouter with app.
const tourController = require('../controllers/tourController');
//we desectructure object controller. It has all functions of handlers of create, delete, etc.
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = tourController;

const router = express.Router();

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
