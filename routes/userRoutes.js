const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const { protect, restrictTo } = authController;

const {
  singUp,
  logIn,
  forgotPassword,
  resetPassword,
  updatePassword,
  logOut,
} = authController;

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
} = userController;

const router = express.Router();

//all these routes don't need authentication.
router.post('/signup', singUp);
router.post('/login', logIn);
router.get('/logout', logOut);
router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);

//we use middleware funciont protect, and all end points beyond this point, will need a user authenticated.
router.use(protect);

router.patch('/updatepassword', updatePassword);
router.patch('/updateme', uploadUserPhoto, updateMe);
router.delete('/deleteme', deleteMe);
router.get('/me', getMe, getUser);

//beyond this point, only administrator will be allowed to perform actions in these end points.
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
