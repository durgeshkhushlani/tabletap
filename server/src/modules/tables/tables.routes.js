const router = require('express').Router();
const ctrl = require('./tables.controller');
const { protect, restrictTo } = require('../../middleware/auth');

router.get('/public/:slug/:number', ctrl.publicLookup);

router.use(protect);
router.get('/', ctrl.list);
router.post('/', restrictTo('owner'), ctrl.create);
router.put('/:id', restrictTo('owner'), ctrl.update);
router.delete('/:id', restrictTo('owner'), ctrl.remove);
router.get('/:id/qr', ctrl.qr);

module.exports = router;
