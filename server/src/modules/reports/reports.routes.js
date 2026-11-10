const router = require('express').Router();
const ctrl = require('./reports.controller');
const { protect, restrictTo } = require('../../middleware/auth');

router.get('/summary', protect, restrictTo('owner'), ctrl.summary);

module.exports = router;
