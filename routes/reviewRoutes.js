const express = require('express');
const authController = require('../controllers/authController');

const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = authController;

//we add mergeParams true because we want to have access to the params that they are in the previous route that was call this route
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
