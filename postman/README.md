# Postman collections

One collection per module, exported as JSON into this folder:

- `auth.postman_collection.json` (Durgesh)
- `menu.postman_collection.json` (Durgesh)
- `tables.postman_collection.json` (Durgesh)
- `kitchen.postman_collection.json` (Durgesh)
- `reports.postman_collection.json` (Durgesh)
- `orders.postman_collection.json` (Moksh)

Use a shared environment with `baseUrl` (e.g. `http://localhost:5000/api`) and `token`.

Import `tabletap.postman_environment.json` as the shared environment. Run collections in this order: auth, menu, tables, orders, kitchen, reports (later ones reuse `token`, `menuItemId`, `tableId` and `orderId` saved by earlier ones).
