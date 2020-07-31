
const express = require('express');
//we are going to create routers, it will replace app. using middleware, we will connect tourRouter with app.
const tourController = require('../controllers/tourController');
//we desectructure object controller. It has all functions of handlers of create, delete, etc.
const { getAllTours, 
  createTour, 
  getTour, 
  updateTour, 
  deleteTour, 
  checkID,
  checkBody } = tourController;

const router = express.Router();

//middleware for url params, in this case id. Also we can have access to a forth argument in a param middleware function.
// with this middleware we can handle the id checking is in getUser, deleteUser and updateUser.One test for the three, we can delete all those id checking.
router.param('id',checkID);
//with ths middleware we want to check if the data we received in req.body is valid to to the post method for creating Tour

router
  .route('/')
  .get(getAllTours)
  .post(checkBody , createTour);
// you can add previous functions before createTour, and this will be middleware previous to th function.
// very interesting to add previous validations before executing any code.
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;