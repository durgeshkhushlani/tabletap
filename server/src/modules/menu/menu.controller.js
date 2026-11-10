const asyncHandler = require('../../middleware/asyncHandler');
const MenuItem = require('../../models/MenuItem');
const Restaurant = require('../../models/Restaurant');

const FIELDS = ['name', 'description', 'category', 'price', 'imageUrl', 'isVeg', 'isAvailable'];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

// GET /api/menu/public/:slug (guests): available items only, grouped by category.
exports.publicMenu = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ slug: req.params.slug.toLowerCase() });
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }
  const items = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true }).sort('category name');
  const categories = {};
  items.forEach((i) => (categories[i.category] = [...(categories[i.category] || []), i]));
  res.json({
    restaurant: { name: restaurant.name, slug: restaurant.slug, currency: restaurant.currency },
    categories,
  });
});

// GET /api/menu (staff): all items including unavailable ones.
exports.list = asyncHandler(async (req, res) => {
  res.json(await MenuItem.find({ restaurant: req.user.restaurant }).sort('category name'));
});

// POST /api/menu
exports.create = asyncHandler(async (req, res) => {
  const item = await MenuItem.create({ ...pick(req.body), restaurant: req.user.restaurant });
  res.status(201).json(item);
});

// PUT /api/menu/:id
exports.update = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOneAndUpdate(
    { _id: req.params.id, restaurant: req.user.restaurant },
    pick(req.body),
    { new: true, runValidators: true }
  );
  if (!item) {
    res.status(404);
    throw new Error('Menu item not found');
  }
  res.json(item);
});

// DELETE /api/menu/:id
exports.remove = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOneAndDelete({ _id: req.params.id, restaurant: req.user.restaurant });
  if (!item) {
    res.status(404);
    throw new Error('Menu item not found');
  }
  res.json({ message: 'Deleted' });
});
