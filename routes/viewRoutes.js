const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

const { getOverview, getTour } = viewsController;

router.get('/', getOverview);
router.get('/tour', getTour);

module.exports = router;
