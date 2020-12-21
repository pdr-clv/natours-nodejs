const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const {
  getCheckoutSession,
  getAllBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
} = bookingController;

const { protect, restrictTo } = authController;

//we add mergeParams true because we want to have access to the params that they are in the previous route that was call this route
const router = express.Router();
//all bookings will be protected from not logged in users.
router.use(protect);
//only this route will be accesible for normal user, to check what bookings he has
router.get('/checkout-session/:tourId', getCheckoutSession);
//the rest of routes are accessible only for admin or lead-guide
router.use(restrictTo('admin', 'lead-guide'));
router.route('/').get(getAllBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
