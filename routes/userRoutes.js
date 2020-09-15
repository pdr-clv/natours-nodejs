const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const { singUp, logIn } = authController;

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = userController;

const router = express.Router();

router.post('/signup', singUp);
router.post('/login', logIn);

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
