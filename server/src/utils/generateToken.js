const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

module.exports = (id) => jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
