const asyncHandler = require('../../middleware/asyncHandler');
const Order = require('../../models/Order');
const MenuItem = require('../../models/MenuItem');
const Restaurant = require('../../models/Restaurant');
const Table = require('../../models/Table');

const fail = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

// POST /api/orders (guests, no auth): prices are always taken from the DB, never from the client.
exports.create = asyncHandler(async (req, res) => {
  const { slug, guestName, tableNumber, items } = req.body;
  if (!slug || !guestName || !String(guestName).trim() || !tableNumber) fail(res, 400, 'slug, guestName and tableNumber are required');
  if (!Array.isArray(items) || items.length === 0) fail(res, 400, 'items must be a non-empty array');

  const restaurant = await Restaurant.findOne({ slug: String(slug).toLowerCase() });
  if (!restaurant) fail(res, 404, 'Restaurant not found');
  const table = await Table.findOne({ restaurant: restaurant._id, number: Number(tableNumber), isActive: true });
  if (!table) fail(res, 404, `Table ${tableNumber} not found`);

  const ids = items.map((i) => i.menuItem);
  const menu = await MenuItem.find({ _id: { $in: ids }, restaurant: restaurant._id, isAvailable: true });
  const byId = new Map(menu.map((m) => [String(m._id), m]));

  let subtotal = 0;
  const lines = items.map((i) => {
    const m = byId.get(String(i.menuItem));
    const quantity = Number(i.quantity);
    if (!m) fail(res, 400, 'One or more items are unavailable');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) fail(res, 400, 'quantity must be an integer from 1 to 50');
    subtotal += m.price * quantity;
    return { menuItem: m._id, name: m.name, price: m.price, quantity, note: i.note || '' };
  });

  const total = Math.round(subtotal * (1 + restaurant.taxPercent / 100) * 100) / 100;
  const order = await Order.create({
    restaurant: restaurant._id,
    guestName: String(guestName).trim(),
    tableNumber: table.number,
    items: lines,
    total,
  });
  res.status(201).json(order);
});

// GET /api/orders/:id (guests): poll order status using the id returned at checkout.
exports.status = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).select('guestName tableNumber items total status createdAt updatedAt');
  if (!order) fail(res, 404, 'Order not found');
  res.json(order);
});
