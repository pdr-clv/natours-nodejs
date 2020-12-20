const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const { getCheckoutSession } = bookingController;

const { protect } = authController;

//we add mergeParams true because we want to have access to the params that they are in the previous route that was call this route
const router = express.Router();

//all reviews will be protected for anonimous users, they must be logged in.
router.get('/checkout-session/:tourId', protect, getCheckoutSession);

module.exports = router;
