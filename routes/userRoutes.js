const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const { protect } = authController;

const {
  singUp,
  logIn,
  forgotPassword,
  resetPassword,
  updatePassword,
} = authController;

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = userController;

const router = express.Router();

router.post('/signup', singUp);
router.post('/login', logIn);
router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);
router.patch('/updatepassword', protect, updatePassword);
router.patch('/updateme', protect, updateMe);
router.delete('/deleteme', protect, deleteMe);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
