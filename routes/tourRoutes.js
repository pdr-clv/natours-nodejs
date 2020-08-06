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
  aliasTopTours,
} = tourController;

const router = express.Router();

//this is an alias, in order to get a query selected with top 5 tours, we don't have to be filling those fiels, in that route we will find it automaticlly filtering req.query in middleware.
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
