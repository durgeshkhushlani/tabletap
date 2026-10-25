const router = require('express').Router();
const ctrl = require('./kitchen.controller');

// TODO (Durgesh): implement
router.get('/', ctrl.placeholder);

module.exports = router;
