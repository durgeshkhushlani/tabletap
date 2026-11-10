const router = require('express').Router();
const ctrl = require('./kitchen.controller');
const { protect } = require('../../middleware/auth');

router.use(protect);
router.get('/', ctrl.board);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;
