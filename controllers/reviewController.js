const Review = require('../models/reviewModel');
//const catchAsync = require('../utils/catchAsync');

const factory = require('./handlerFactory');

const { deleteOne, updateOne, createOne, getOne, getAll } = factory;

//we will add this function like middleware in the router, before creating, we will set Ids to create Review.
exports.setTourUserIds = (req, res, next) => {
  // -------Allow nested routes.------
  //if we don't expecify tour in the request, that means it will be in the url, and that means we will ccreateReview from the tour url endpoint
  if (!req.body.tour) req.body.tour = req.params.tourId;
  //idem, if there is no user in the req.body, we will get userId from the user logged in, information that comes from the protect middleware in req.user-id
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getAllReviews = getAll(Review);
exports.createReview = createOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
exports.getReview = getOne(Review);
