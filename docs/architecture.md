# Architecture notes

## Guest flow
1. Each table has a QR code encoding `https://<host>/r/<restaurantSlug>/t/<tableNumber>` (opens the app via deep link if installed, else the web).
2. Guest enters name + table number (no account) and places an order.
3. The order appears on the kitchen board; staff move it through `placed -> preparing -> ready -> served`.

## Multi-tenant
Every document carries a `restaurant` ObjectId so the product can ship to any restaurant.

## Auth
Owner/staff use JWT (Bearer). Guests are unauthenticated; guest order routes are public and should be rate-limited.
