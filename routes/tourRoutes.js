const express = require('express');
//we are going to create routers, it will replace app. using middleware, we will connect tourRouter with app.
const tourController = require('../controllers/tourController');
//we desectructure object controller. It has all functions of handlers of create, delete, etc.
const authController = require('../controllers/authController');

const reviewRouter = require('./reviewRoutes');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} = tourController;
//we will add middleware protect function to getAll tours, and we will check if user has correct token
const { protect, restrictTo } = authController;

const router = express.Router();

//we will add middleware, if the route has tourid/reviews, that means we will directing to reviewrouter, where it is all reviewController.
router.use('/:tourId/reviews', reviewRouter);

//this is an alias, in order to get a query selected with top 5 tours, we don't have to be filling those fiels, in that route we will find it automaticlly filtering req.query in middleware.
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router
  .route(
    protect,
    restrictTo('admin', 'lead-guide', 'guide'),
    '/monthly-plan/:year'
  )
  .get(getMonthlyPlan);

//we will pass an url like /tours-within/233/center/-40,38/unit/mi
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

//we will calculate all tours included in the distance from one point. No need of distance param (radius)
router.route('/distances/:latlng/unit/:unit').get(getDistances);

//it will run first middle ware protect function. checking if there is valid token.
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

//this code will be removed, because from tour router, you have to create a review from review router
//router
//  .route('/:tourId/reviews')
//  .post(protect, restrictTo('user'), createReview);

module.exports = router;
