const QRCode = require('qrcode');
const asyncHandler = require('../../middleware/asyncHandler');
const Table = require('../../models/Table');
const Restaurant = require('../../models/Restaurant');
const { clientUrl } = require('../../config/env');

const notFound = (res, what = 'Table') => {
  res.status(404);
  throw new Error(`${what} not found`);
};

// GET /api/tables/public/:slug/:number (guests): checks the table behind a scanned QR.
exports.publicLookup = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ slug: req.params.slug.toLowerCase() });
  if (!restaurant) notFound(res, 'Restaurant');
  const table = await Table.findOne({ restaurant: restaurant._id, number: Number(req.params.number), isActive: true });
  if (!table) notFound(res);
  res.json({ restaurant: { name: restaurant.name, slug: restaurant.slug }, table: { number: table.number, label: table.label } });
});

exports.list = asyncHandler(async (req, res) => {
  res.json(await Table.find({ restaurant: req.user.restaurant }).sort('number'));
});

exports.create = asyncHandler(async (req, res) => {
  const { number, label } = req.body;
  if (!Number.isInteger(number) || number < 1) {
    res.status(400);
    throw new Error('number must be a positive integer');
  }
  if (await Table.findOne({ restaurant: req.user.restaurant, number })) {
    res.status(409);
    throw new Error(`Table ${number} already exists`);
  }
  res.status(201).json(await Table.create({ restaurant: req.user.restaurant, number, label }));
});

exports.update = asyncHandler(async (req, res) => {
  const { label, isActive } = req.body;
  const patch = {};
  if (label !== undefined) patch.label = label;
  if (isActive !== undefined) patch.isActive = isActive;
  const table = await Table.findOneAndUpdate({ _id: req.params.id, restaurant: req.user.restaurant }, patch, { new: true });
  if (!table) notFound(res);
  res.json(table);
});

exports.remove = asyncHandler(async (req, res) => {
  const table = await Table.findOneAndDelete({ _id: req.params.id, restaurant: req.user.restaurant });
  if (!table) notFound(res);
  res.json({ message: 'Deleted' });
});

// GET /api/tables/:id/qr: PNG data URL for the table's QR code.
exports.qr = asyncHandler(async (req, res) => {
  const table = await Table.findOne({ _id: req.params.id, restaurant: req.user.restaurant });
  if (!table) notFound(res);
  const restaurant = await Restaurant.findById(req.user.restaurant);
  const url = `${clientUrl}/r/${restaurant.slug}/t/${table.number}`;
  res.json({ url, qr: await QRCode.toDataURL(url, { margin: 1, width: 320 }) });
});
