const asyncHandler = require('../../middleware/asyncHandler');
const generateToken = require('../../utils/generateToken');
const Restaurant = require('../../models/Restaurant');
const User = require('../../models/User');

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, restaurant: u.restaurant });

// POST /api/auth/register: creates a restaurant and its owner account.
exports.register = asyncHandler(async (req, res) => {
  const { restaurantName, name, email, password } = req.body;
  if (!restaurantName || !name || !email || !password) {
    res.status(400);
    throw new Error('restaurantName, name, email and password are required');
  }
  if (await User.findOne({ email })) {
    res.status(409);
    throw new Error('Email already registered');
  }

  const slug = slugify(restaurantName);
  if (await Restaurant.findOne({ slug })) {
    res.status(409);
    throw new Error('A restaurant with this name already exists');
  }

  const restaurant = await Restaurant.create({ name: restaurantName, slug });
  const user = await User.create({ restaurant: restaurant._id, name, email, password, role: 'owner' });

  res.status(201).json({ token: generateToken(user._id), user: publicUser(user), restaurant });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = email && (await User.findOne({ email }));
  if (!user || !(await user.matchPassword(password || ''))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  res.json({ token: generateToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.user.restaurant);
  res.json({ user: publicUser(req.user), restaurant });
});

// POST /api/auth/staff (owner only): adds a staff account to the owner's restaurant.
exports.addStaff = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('name, email and password are required');
  }
  if (await User.findOne({ email })) {
    res.status(409);
    throw new Error('Email already registered');
  }
  const staff = await User.create({ restaurant: req.user.restaurant, name, email, password, role: 'staff' });
  res.status(201).json({ user: publicUser(staff) });
});
