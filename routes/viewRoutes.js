const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

const {
  getOverview,
  getTour,
  getLoginForm,
  getSignupForm,
  getAccount,
  getMyTours,
  getForgotPasswordForm,
  getResetPasswordForm,
} = viewsController;

const { createBookingCheckOut } = bookingController;

//we will use protect for getAccount, it is more restrictive to get inside into user info
router.get('/me', authController.protect, getAccount);
router.get('/my-tours', authController.protect, getMyTours);

//for the rest of routes, we will simply check if user is loggedIn to display conditionally elements, like for instance header with log in or log out
router.use(authController.isLoggedIn);

router.get('/', createBookingCheckOut, getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);
router.get('/signup', getSignupForm);
router.get('/forgotpassword', getForgotPasswordForm);
router.get('/resetpassword', getResetPasswordForm);

module.exports = router;
