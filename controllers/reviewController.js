const Review = require('../models/reviewModel');
//const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filterTour = {};
  if (req.params.tourId) filterTour = { tour: req.params.tourId };

  const reviews = await Review.find(filterTour);

  res.status(200).json({
    status: 'sucess',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // -------Allow nested routes.------
  //if we don't expecify tour in the request, that means it will be in the url, and that means we will ccreateReview from the tour url endpoint
  if (!req.body.tour) req.body.tour = req.params.tourId;
  //idem, if there is no user in the req.body, we will get userId from the user logged in, information that comes from the protect middleware in req.user-id
  if (!req.body.user) req.body.user = req.user._id;

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'sucess',
    data: {
      review: newReview,
    },
  });
});
