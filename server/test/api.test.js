const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

let mongod;
let app;
let token;
let burger;
let fries;
let table;
let orderId;

const auth = () => ({ Authorization: `Bearer ${token}` });

before(async () => {
  // TEST_MONGO_URI points at a throwaway MongoDB; otherwise spin up an in-memory one.
  let uri = process.env.TEST_MONGO_URI;
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  }
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  app = require('../src/app');
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

test('health check', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('register creates restaurant + owner, rejects duplicates and bad input', async () => {
  const body = { restaurantName: 'Spice Hub', name: 'Asha', email: 'Asha@Example.com', password: 'secret123' };
  const res = await request(app).post('/api/auth/register').send(body);
  assert.equal(res.status, 201);
  assert.equal(res.body.restaurant.slug, 'spice-hub');
  assert.equal(res.body.user.role, 'owner');
  assert.equal(res.body.user.password, undefined);
  assert.equal((await request(app).post('/api/auth/register').send(body)).status, 409);
  assert.equal((await request(app).post('/api/auth/register').send({ name: 'x' })).status, 400);
});

test('login succeeds with right password, fails with wrong one', async () => {
  const bad = await request(app).post('/api/auth/login').send({ email: 'asha@example.com', password: 'nope' });
  assert.equal(bad.status, 401);
  const res = await request(app).post('/api/auth/login').send({ email: 'asha@example.com', password: 'secret123' });
  assert.equal(res.status, 200);
  token = res.body.token;
  assert.ok(token);
});

test('protected routes require a valid token', async () => {
  assert.equal((await request(app).get('/api/menu')).status, 401);
  assert.equal((await request(app).get('/api/auth/me').set('Authorization', 'Bearer junk')).status, 401);
  const me = await request(app).get('/api/auth/me').set(auth());
  assert.equal(me.status, 200);
  assert.equal(me.body.restaurant.slug, 'spice-hub');
});

test('owner can add staff; staff cannot write menu', async () => {
  const add = await request(app).post('/api/auth/staff').set(auth()).send({ name: 'Ravi', email: 'ravi@example.com', password: 'staffpass' });
  assert.equal(add.status, 201);
  assert.equal(add.body.user.role, 'staff');
  const login = await request(app).post('/api/auth/login').send({ email: 'ravi@example.com', password: 'staffpass' });
  const staffAuth = { Authorization: `Bearer ${login.body.token}` };
  const denied = await request(app).post('/api/menu').set(staffAuth).send({ name: 'X', category: 'Y', price: 1 });
  assert.equal(denied.status, 403);
  assert.equal((await request(app).get('/api/reports/summary').set(staffAuth)).status, 403);
});

test('menu CRUD and public menu hides unavailable items', async () => {
  burger = (await request(app).post('/api/menu').set(auth()).send({ name: 'Burger', category: 'Mains', price: 100 })).body;
  fries = (await request(app).post('/api/menu').set(auth()).send({ name: 'Fries', category: 'Sides', price: 50 })).body;
  const hidden = (await request(app).post('/api/menu').set(auth()).send({ name: 'Secret', category: 'Mains', price: 10, isAvailable: false })).body;
  assert.equal((await request(app).post('/api/menu').set(auth()).send({ name: 'NoPrice', category: 'Mains' })).status, 400);

  const upd = await request(app).put(`/api/menu/${fries._id}`).set(auth()).send({ price: 60 });
  assert.equal(upd.body.price, 60);
  fries.price = 60;

  const pub = await request(app).get('/api/menu/public/spice-hub');
  assert.equal(pub.status, 200);
  assert.deepEqual(Object.keys(pub.body.categories).sort(), ['Mains', 'Sides']);
  assert.ok(!JSON.stringify(pub.body).includes('Secret'));
  assert.equal((await request(app).get('/api/menu/public/nope')).status, 404);

  assert.equal((await request(app).delete(`/api/menu/${hidden._id}`).set(auth())).status, 200);
  assert.equal((await request(app).delete(`/api/menu/${hidden._id}`).set(auth())).status, 404);
});

test('tables: create, duplicate rejected, public lookup, QR', async () => {
  table = (await request(app).post('/api/tables').set(auth()).send({ number: 5, label: 'Window' })).body;
  assert.equal(table.number, 5);
  assert.equal((await request(app).post('/api/tables').set(auth()).send({ number: 5 })).status, 409);
  assert.equal((await request(app).post('/api/tables').set(auth()).send({ number: 'x' })).status, 400);

  const lookup = await request(app).get('/api/tables/public/spice-hub/5');
  assert.equal(lookup.status, 200);
  assert.equal((await request(app).get('/api/tables/public/spice-hub/99')).status, 404);

  const qr = await request(app).get(`/api/tables/${table._id}/qr`).set(auth());
  assert.equal(qr.status, 200);
  assert.match(qr.body.url, /\/r\/spice-hub\/t\/5$/);
  assert.match(qr.body.qr, /^data:image\/png;base64,/);
});

test('guest order: server computes total, ignores client price, validates input', async () => {
  const res = await request(app).post('/api/orders').send({
    slug: 'spice-hub',
    guestName: 'Moksh',
    tableNumber: 5,
    items: [
      { menuItem: burger._id, quantity: 2, price: 1 },
      { menuItem: fries._id, quantity: 1, note: 'extra salt' },
    ],
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.total, 260);
  assert.equal(res.body.status, 'placed');
  orderId = res.body._id;

  const base = { slug: 'spice-hub', guestName: 'G', tableNumber: 5 };
  assert.equal((await request(app).post('/api/orders').send({ ...base, items: [] })).status, 400);
  assert.equal((await request(app).post('/api/orders').send({ ...base, tableNumber: 42, items: [{ menuItem: burger._id, quantity: 1 }] })).status, 404);
  assert.equal((await request(app).post('/api/orders').send({ ...base, items: [{ menuItem: burger._id, quantity: 0 }] })).status, 400);
  assert.equal((await request(app).post('/api/orders').send({ ...base, items: [{ menuItem: new mongoose.Types.ObjectId(), quantity: 1 }] })).status, 400);

  const status = await request(app).get(`/api/orders/${orderId}`);
  assert.equal(status.status, 200);
  assert.equal(status.body.status, 'placed');
});

test('kitchen: board lists order, enforces status transitions', async () => {
  const board = await request(app).get('/api/kitchen').set(auth());
  assert.equal(board.body.length, 1);

  const skip = await request(app).patch(`/api/kitchen/${orderId}/status`).set(auth()).send({ status: 'served' });
  assert.equal(skip.status, 400);

  for (const status of ['preparing', 'ready', 'served']) {
    const r = await request(app).patch(`/api/kitchen/${orderId}/status`).set(auth()).send({ status });
    assert.equal(r.status, 200);
    assert.equal(r.body.status, status);
  }
  assert.equal((await request(app).get('/api/kitchen').set(auth())).body.length, 0);
  assert.equal((await request(app).patch(`/api/kitchen/${orderId}/status`).set(auth()).send({ status: 'placed' })).status, 400);
});

test('reports: revenue excludes cancelled orders', async () => {
  const cancelled = (await request(app).post('/api/orders').send({
    slug: 'spice-hub', guestName: 'G', tableNumber: 5, items: [{ menuItem: burger._id, quantity: 3 }],
  })).body;
  await request(app).patch(`/api/kitchen/${cancelled._id}/status`).set(auth()).send({ status: 'cancelled' });

  const res = await request(app).get('/api/reports/summary').set(auth());
  assert.equal(res.status, 200);
  assert.equal(res.body.orders, 1);
  assert.equal(res.body.revenue, 260);
  assert.equal(res.body.averageOrderValue, 260);
  assert.equal(res.body.topItems[0].name, 'Burger');
  assert.equal(res.body.topItems[0].quantity, 2);
  assert.equal(res.body.daily.length, 1);

  assert.equal((await request(app).get('/api/reports/summary?from=garbage').set(auth())).status, 400);
});

test('tenants are isolated from each other', async () => {
  const other = await request(app).post('/api/auth/register').send({ restaurantName: 'Other Cafe', name: 'Bo', email: 'bo@example.com', password: 'secret123' });
  const otherAuth = { Authorization: `Bearer ${other.body.token}` };
  assert.equal((await request(app).get('/api/menu').set(otherAuth)).body.length, 0);
  assert.equal((await request(app).put(`/api/menu/${burger._id}`).set(otherAuth).send({ price: 1 })).status, 404);
  assert.equal((await request(app).patch(`/api/kitchen/${orderId}/status`).set(otherAuth).send({ status: 'cancelled' })).status, 404);
});
