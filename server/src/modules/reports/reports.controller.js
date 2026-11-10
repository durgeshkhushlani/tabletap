const mongoose = require('mongoose');
const asyncHandler = require('../../middleware/asyncHandler');
const Order = require('../../models/Order');

// GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
// Cancelled orders are excluded from all sales figures.
exports.summary = asyncHandler(async (req, res) => {
  const match = { restaurant: new mongoose.Types.ObjectId(String(req.user.restaurant)), status: { $ne: 'cancelled' } };
  const { from, to } = req.query;
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lt = new Date(new Date(to).getTime() + 24 * 60 * 60 * 1000);
    if ((from && isNaN(match.createdAt.$gte)) || (to && isNaN(match.createdAt.$lt))) {
      res.status(400);
      throw new Error('from/to must be valid dates (YYYY-MM-DD)');
    }
  }

  const [totals, topItems, daily] = await Promise.all([
    Order.aggregate([{ $match: match }, { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: '$_id', quantity: 1, revenue: 1 } },
    ]),
    Order.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', revenue: 1, orders: 1 } },
    ]),
  ]);

  const { revenue = 0, orders = 0 } = totals[0] || {};
  res.json({
    revenue: Math.round(revenue * 100) / 100,
    orders,
    averageOrderValue: orders ? Math.round((revenue / orders) * 100) / 100 : 0,
    topItems,
    daily,
  });
});
