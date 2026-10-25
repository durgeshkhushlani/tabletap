# TableTap

QR-based restaurant ordering. Guests scan a QR code at their table and order without signing up; only a name and table number are needed. The QR opens the mobile app if installed, otherwise the website.

IT645 MERN course project. Team: Durgesh, Moksh. Timeline: 2 months.

## Stack
- **Web:** MongoDB, Express, React (Vite), Node
- **Mobile:** React Native (tentative, only if time allows)
- **Later idea:** AI ordering assistant as an MCP server (not started)

## Structure
```
server/   Express API + Mongoose schemas
client/   React web app (guest ordering + restaurant dashboard)
mobile/   React Native app (placeholder)
docs/     Architecture, API notes
postman/  Postman collections (one per module)
```

## Ownership
| Area | Owner |
|------|-------|
| Restaurant management: owner/staff JWT auth, menu, tables + QR codes, kitchen board, sales reports | Durgesh |
| Guest ordering | Moksh |
| Shared: Express middleware, MongoDB schemas, deployment | Both |

Each member owns their module end to end: frontend, backend APIs, Postman tests.
Backend modules live in `server/src/modules/<name>/` (routes + controller per module).

## Getting started
```bash
# backend
cd server
cp .env.example .env     # set MONGO_URI and JWT_SECRET
npm install
npm run dev              # http://localhost:5000/api/health

# frontend
cd client
npm install
npm run dev              # http://localhost:5173
```
