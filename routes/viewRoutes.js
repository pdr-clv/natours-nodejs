const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

const { getOverview, getTour } = viewsController;

router.get('/', getOverview);
router.get('/tour/:slug', getTour);

module.exports = router;
