# Architecture notes

## Guest flow
1. Each table has a QR code encoding `https://<host>/r/<restaurantSlug>/t/<tableNumber>` (opens the app via deep link if installed, else the web).
2. Guest enters name + table number (no account) and places an order.
3. The order appears on the kitchen board; staff move it through `placed -> preparing -> ready -> served`.

## Multi-tenant
Every document carries a `restaurant` ObjectId so the product can ship to any restaurant.

## Auth
Owner/staff use JWT (Bearer). Guests are unauthenticated; guest order routes are public and should be rate-limited.

## Implementation notes
- **Pricing:** guest orders carry only item ids and quantities; the server looks up prices, snapshots name/price into the order, and adds the restaurant's `taxPercent`.
- **Kitchen board:** the web client polls `/api/kitchen` every 5s and guests poll `/api/orders/:id` every 4s until the order is served or cancelled. Websockets are a possible later upgrade.
- **Tenant isolation:** every staff query filters on `req.user.restaurant`; guest routes resolve the restaurant from the slug in the URL.
- **Roles:** `owner` can edit menu/tables, add staff and view reports; `staff` can view menu/tables and run the kitchen board.
- **Errors:** Mongoose validation and cast errors map to 400; unknown ids within another tenant map to 404.
