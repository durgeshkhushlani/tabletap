// Usage: npm run seed   (creates a demo restaurant, owner, tables and menu)
const connectDB = require('./config/db');
const Restaurant = require('./models/Restaurant');
const User = require('./models/User');
const Table = require('./models/Table');
const MenuItem = require('./models/MenuItem');

const MENU = [
  ['Paneer Tikka', 'Starters', 220, true],
  ['Veg Spring Rolls', 'Starters', 160, true],
  ['Chicken Wings', 'Starters', 260, false],
  ['Butter Chicken', 'Mains', 340, false],
  ['Dal Makhani', 'Mains', 240, true],
  ['Veg Biryani', 'Mains', 260, true],
  ['Garlic Naan', 'Breads', 60, true],
  ['Masala Chai', 'Drinks', 40, true],
  ['Fresh Lime Soda', 'Drinks', 70, true],
  ['Gulab Jamun', 'Desserts', 90, true],
];

(async () => {
  await connectDB();
  await Promise.all([Restaurant, User, Table, MenuItem].map((m) => m.deleteMany({})));

  const restaurant = await Restaurant.create({ name: 'Demo Diner', slug: 'demo-diner', taxPercent: 5 });
  await User.create({ restaurant: restaurant._id, name: 'Demo Owner', email: 'owner@demo.com', password: 'demo1234', role: 'owner' });
  await User.create({ restaurant: restaurant._id, name: 'Demo Staff', email: 'staff@demo.com', password: 'demo1234', role: 'staff' });
  await Table.insertMany([1, 2, 3, 4, 5, 6].map((number) => ({ restaurant: restaurant._id, number })));
  await MenuItem.insertMany(MENU.map(([name, category, price, isVeg]) => ({ restaurant: restaurant._id, name, category, price, isVeg })));

  console.log('Seeded. Login: owner@demo.com / demo1234 (staff@demo.com for staff). Guest URL: /r/demo-diner/t/1');
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
