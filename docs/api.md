# API reference

Base URL: `http://localhost:5000/api`. Protected routes need `Authorization: Bearer <token>` from `/auth/login`.
Errors are returned as `{ "message": "..." }` with a 4xx/5xx status.

## Auth
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/auth/register` | public | `{ restaurantName, name, email, password }` creates the restaurant and its owner |
| POST | `/auth/login` | public | `{ email, password }` returns `{ token, user }` |
| GET | `/auth/me` | staff/owner | current user and restaurant |
| POST | `/auth/staff` | owner | `{ name, email, password }` adds a staff account |

Register and login are rate-limited (50 requests / 15 min).

## Menu
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/menu/public/:slug` | public | available items grouped by category |
| GET | `/menu` | staff/owner | all items, including hidden ones |
| POST | `/menu` | owner | `{ name, category, price, description?, imageUrl?, isVeg?, isAvailable? }` |
| PUT | `/menu/:id` | owner | partial update |
| DELETE | `/menu/:id` | owner | |

## Tables
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/tables/public/:slug/:number` | public | validates the table behind a scanned QR |
| GET | `/tables` | staff/owner | |
| POST | `/tables` | owner | `{ number, label? }`, unique per restaurant |
| PUT | `/tables/:id` | owner | `{ label?, isActive? }` |
| DELETE | `/tables/:id` | owner | |
| GET | `/tables/:id/qr` | staff/owner | `{ url, qr }`, `qr` is a PNG data URL for `/r/<slug>/t/<number>` |

## Orders (guests, no account)
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/orders` | public | `{ slug, guestName, tableNumber, items: [{ menuItem, quantity, note? }] }` |
| GET | `/orders/:id` | public | poll status with the id returned at checkout |

Prices are always read from the database; the client cannot set them. `total` includes the restaurant's `taxPercent`.
Order creation is rate-limited (20 requests / minute per IP).

## Kitchen
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/kitchen?status=` | staff/owner | active orders (placed, preparing, ready), oldest first |
| PATCH | `/kitchen/:id/status` | staff/owner | `{ status }` |

Allowed transitions: `placed -> preparing -> ready -> served`; `placed` and `preparing` can also go to `cancelled`.

## Reports
| Method | Path | Access | Notes |
|--------|------|--------|-------|
| GET | `/reports/summary?from=&to=` | owner | `{ revenue, orders, averageOrderValue, topItems, daily }`; cancelled orders excluded |
