# Super Market Pro — Full-Stack Edition (Node + Express + MongoDB)

A real database-backed point-of-sale and inventory system: Express API +
MongoDB on the backend, with an Admin console, Cashier counter, and Checkout
frontend. One Node process serves both the API and the static site.

**This zip comes pre-configured to work with a local MongoDB install** (the
`.env` file is already filled in with `mongodb://127.0.0.1:27017/supermarketpro`)
so you can get it running immediately without creating any config files
yourself.

## Fastest way to run it (Windows)

1. Make sure MongoDB Community Server is installed and running as a service
   (see below if you haven't done this yet).
2. Double-click **`start.bat`** in this folder.
3. Wait for it to say `MongoDB connected` and `server running on port 4000`.
4. Open **http://localhost:4000** in your browser.

If anything goes wrong, check **`TROUBLESHOOTING.md`** — it covers the exact
issues people usually hit (wrong folder, MongoDB not running, stale `.env`).

## Manual setup (any OS)

```bash
cd smp-fullstack
npm install
npm run seed     # loads sample products into MongoDB
npm start
```

Open **http://localhost:4000**.

## Admin login (fixed, from `.env`)

```
Username: Varshith@2025
Password: 9381803389
```

Cashier logins are created from inside the Admin panel once you're signed in.

## Don't have MongoDB yet?

1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer, choose "Complete" setup, keep "Install MongoDB as a
   Service" checked (default) — this makes it start automatically every time
   your PC turns on.
3. Optionally install MongoDB Compass too (offered in the same installer) —
   it's a free GUI for browsing your database.
4. That's it — this project's `.env` already points at
   `mongodb://127.0.0.1:27017/supermarketpro`, which is where a default local
   install lives.

## Want the database reachable from other devices (phone, another PC, deployed server)?

A local MongoDB install only exists on your machine. To share one database
across multiple devices, use **MongoDB Atlas** (free cloud-hosted MongoDB)
instead:

1. Create a free cluster at https://www.mongodb.com/cloud/atlas/register
2. Add a database user (Database Access) and allow network access from
   anywhere (`0.0.0.0/0`) to start.
3. Copy the connection string it gives you and replace the `MONGODB_URI` line
   in `.env` with it, e.g.:
   ```
   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/supermarketpro?retryWrites=true&w=majority
   ```
4. Restart the server. Every device that talks to this backend now shares the
   same Atlas database instead of your laptop's local one.

## What's in the database

| Collection | Holds |
|---|---|
| `products`  | name, category, price, GST %, stock |
| `cashiers`  | username + bcrypt-hashed password (never stored in plain text) |
| `messages`  | access requests cashiers send from the login page |
| `activities`| every login/logout/product change/sale — powers the admin Terminal |
| `sales`     | completed transactions/bills (bill number, items, totals, payment method) |

Prices, GST, and stock are always re-read from MongoDB at checkout — the
server never trusts numbers sent by the browser.

## API summary

```
POST   /api/auth/admin-login          { username, password } → { token }
POST   /api/auth/cashier-login        { username, password } → { token }
POST   /api/auth/logout               (auth) logs the logout event

GET    /api/products                  (auth)
POST   /api/products                  (admin) { name, category, price, gst, stock }
DELETE /api/products/:id              (admin)

GET    /api/cashiers                  (admin)
POST   /api/cashiers                  (admin) { username, password }
DELETE /api/cashiers/:username        (admin)

POST   /api/messages                  (public) { from, text }
GET    /api/messages                  (admin)
GET    /api/messages/unread-count     (admin)
PATCH  /api/messages/:id/resolve      (admin)

GET    /api/activity                  (admin) — terminal feed

POST   /api/sales                     (cashier) { items:[{productId,qty}], paymentMethod, cashReceived? }
```

## Deploying online

1. Push this folder to a GitHub repo.
2. On Render.com (or Railway/Fly.io): New → Web Service → connect the repo.
3. Build command: `npm install` · Start command: `npm start`
4. Add environment variables: `MONGODB_URI` (your Atlas string), `JWT_SECRET`,
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
5. Deploy — you'll get a public URL reachable from any device.

## Security notes

- Cashier passwords are hashed with bcrypt.
- `JWT_SECRET` in the included `.env` is a placeholder — change it before
  deploying anywhere real.
- The QR payment code encodes the amount only — it is **not** wired to a real
  UPI/payment gateway.

## File structure

```
smp-fullstack/
├── start.bat                  double-click to run everything (Windows)
├── server.js                  Express app entry point
├── config/db.js                MongoDB connection
├── middleware/auth.js         JWT verification + role guard
├── models/                    Product, Cashier, Message, Activity, Sale
├── routes/                    auth, products, cashiers, messages, activity, sales
├── utils/logActivity.js       writes to the terminal feed
├── utils/seed.js              loads sample products (npm run seed)
├── .env                       pre-filled for local MongoDB — edit as needed
├── TROUBLESHOOTING.md
└── public/                    frontend (served as static files by server.js)
    ├── index.html, admin-login.html, cashier-login.html
    ├── admin.html, menu.html, cart.html
    ├── css/style.css
    └── js/ (api.js, admin.js, menu.js, cart.js)
```
