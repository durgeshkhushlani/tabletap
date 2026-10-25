const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { clientUrl } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(helmet());
app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'TableTap' }));

// Durgesh: restaurant management
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/menu', require('./modules/menu/menu.routes'));
app.use('/api/tables', require('./modules/tables/tables.routes'));
app.use('/api/kitchen', require('./modules/kitchen/kitchen.routes'));
app.use('/api/reports', require('./modules/reports/reports.routes'));

// Moksh: guest ordering
app.use('/api/orders', require('./modules/orders/orders.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
