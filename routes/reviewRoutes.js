const express = require('express');
const authController = require('../controllers/authController');

const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = authController;

//we add mergeParams true because we want to have access to the params that they are in the previous route that was call this route
const router = express.Router({ mergeParams: true });

//all reviews will be protected for anonimous users, they must be logged in.
router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview);
module.exports = router;
