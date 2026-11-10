const asyncHandler = require('../../middleware/asyncHandler');
const Order = require('../../models/Order');

const ACTIVE = ['placed', 'preparing', 'ready'];
const TRANSITIONS = {
  placed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['served'],
  served: [],
  cancelled: [],
};

// GET /api/kitchen?status=placed: active orders (oldest first) for the kitchen board.
exports.board = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const filter = { restaurant: req.user.restaurant, status: status ? status : { $in: ACTIVE } };
  res.json(await Order.find(filter).sort('createdAt'));
});

// PATCH /api/kitchen/:id/status
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findOne({ _id: req.params.id, restaurant: req.user.restaurant });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!TRANSITIONS[order.status].includes(status)) {
    res.status(400);
    throw new Error(`Cannot move order from ${order.status} to ${status}`);
  }
  order.status = status;
  await order.save();
  res.json(order);
});
