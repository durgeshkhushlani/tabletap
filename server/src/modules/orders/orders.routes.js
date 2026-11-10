const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('./orders.controller');

const orderLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post('/', orderLimiter, ctrl.create);
router.get('/:id', ctrl.status);

module.exports = router;
