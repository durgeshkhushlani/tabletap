# Testing

## API tests
`server/test/api.test.js` runs the whole API (auth, roles, menu, tables/QR, guest orders, kitchen, reports, tenant isolation) with `supertest`.

```bash
cd server
npm test    # downloads an in-memory MongoDB on first run (large download)
```

To use an existing MongoDB instead (for example the Docker one), point the tests at a throwaway database:

```bash
docker run -d --name tabletap-test-mongo -p 27018:27017 mongo:7
TEST_MONGO_URI=mongodb://127.0.0.1:27018/tabletap_test npm test
```

The suite drops its database before and after running, so never point it at data you want to keep.

## Postman
Import everything in `postman/` (collections plus `tabletap.postman_environment.json`). Run in this order so the saved variables line up:
auth, menu, tables, orders, kitchen, reports.

## Manual smoke test
1. `npm run seed` in `server/`, then start the server and the client.
2. Open `http://localhost:5173/r/demo-diner/t/1`, enter a name, add items and place an order.
3. Log in at `/admin/login` as `owner@demo.com` / `demo1234` and move the order across the kitchen board.
4. Check the Reports tab.
