const express = require('express');
const authController = require('../controllers/authController');

const {
  getAllReviews,
  createReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = authController;

const router = express.Router();

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
