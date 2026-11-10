const router = require('express').Router();
const ctrl = require('./menu.controller');
const { protect, restrictTo } = require('../../middleware/auth');

router.get('/public/:slug', ctrl.publicMenu);

router.use(protect);
router.get('/', ctrl.list);
router.post('/', restrictTo('owner'), ctrl.create);
router.put('/:id', restrictTo('owner'), ctrl.update);
router.delete('/:id', restrictTo('owner'), ctrl.remove);

module.exports = router;
