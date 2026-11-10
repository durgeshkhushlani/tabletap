const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('./auth.controller');
const { protect, restrictTo } = require('../../middleware/auth');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });

router.post('/register', authLimiter, ctrl.register);
router.post('/login', authLimiter, ctrl.login);
router.get('/me', protect, ctrl.me);
router.post('/staff', protect, restrictTo('owner'), ctrl.addStaff);

module.exports = router;
