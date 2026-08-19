# Troubleshooting

Quick fixes for the exact problems people usually hit setting this up on Windows.

## "Missing script: seed/start" or `npm run` only shows "test"

This means PowerShell is not actually inside the `smp-fullstack` folder, or
`package.json` got overwritten (e.g. by accidentally running `npm init` in
that folder). Check both:

```powershell
# 1. Are you in the right folder? The prompt itself should show the path:
#    PS C:\Users\yourname\Desktop\smp-fullstack>
cd C:\path\to\smp-fullstack

# 2. Does package.json look right?
type package.json
```

`type package.json` should show `"name": "super-market-pro"` and a `scripts`
block with `start`, `dev`, and `seed`. If it shows something else (or is
missing), re-download/re-extract this zip into a clean folder and don't run
`npm init` inside it.

**Easiest fix on Windows:** just double-click `start.bat` in the project
folder. It runs the right commands from the right place automatically.

## "MongoDB connection failed" in the terminal

The Node server can't reach MongoDB. Check, in order:

1. **Is MongoDB actually running?**
   Press Windows key → type "Services" → find "MongoDB Server" → Status
   should say "Running". If not, right-click → Start.

2. **Does Compass connect?**
   Open MongoDB Compass, connect to `mongodb://localhost:27017`. If Compass
   can't connect either, the problem is MongoDB itself, not this project —
   reinstall MongoDB Community Server and make sure "Install as a Service"
   was checked.

3. **Does `.env` match?**
   Open `.env` in the project folder and confirm:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/supermarketpro
   ```

## Admin login says "Incorrect username or password"

- Confirm `.env` has exactly:
  ```
  ADMIN_USERNAME=Varshith@2025
  ADMIN_PASSWORD=9381803389
  ```
- If you edited `.env`, **stop the server (Ctrl+C) and restart it** —
  environment variables are only read once at startup.

## Admin login says "Something went wrong. Please try again."

This is different from a wrong-password error — it means the request never
got a proper answer from the server (the server crashed, isn't running, or
MongoDB isn't connected). Check the terminal running `npm start` for red
error text — that's the real error; the browser message is just a generic
fallback.

## Compass connects but no `supermarketpro` database appears

That's expected until you run the seed script — MongoDB only creates a
database once something is written to it:

```powershell
cd C:\path\to\smp-fullstack
npm run seed
```

You should see `Seeded 15 sample products.` Refresh Compass afterward (it
doesn't always auto-refresh the sidebar).

## Still stuck?

Copy the **exact, full text** of the error from the terminal (not a
paraphrase) — the exact wording almost always points straight at the fix.
