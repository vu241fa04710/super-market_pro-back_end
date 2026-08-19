const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Cashier = require("../models/Cashier");
const logActivity = require("../utils/logActivity");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function signToken(role, username) {
  return jwt.sign({ role, username }, process.env.JWT_SECRET, { expiresIn: "12h" });
}

// POST /api/auth/admin-login
router.post("/admin-login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    await logActivity(`Admin "${username}" logged in`, "login");
    return res.json({ token: signToken("admin", username), username });
  }
  await logActivity("Failed admin login attempt", "error");
  return res.status(401).json({ error: "Incorrect username or password. Please check your credentials and try again." });
});

// POST /api/auth/cashier-login
router.post("/cashier-login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  const cashier = await Cashier.findOne({ username });
  const totalCashiers = await Cashier.countDocuments();

  if (!cashier) {
    if (totalCashiers === 0) {
      return res.status(401).json({ error: "No cashier accounts exist yet. Please contact the admin below to get set up.", noCashiersYet: true });
    }
    await logActivity(`Failed cashier login attempt for "${username}"`, "error");
    return res.status(401).json({ error: "Incorrect username or password. Contact the admin if you've forgotten your details." });
  }

  const match = await bcrypt.compare(password, cashier.passwordHash);
  if (!match) {
    await logActivity(`Failed cashier login attempt for "${username}"`, "error");
    return res.status(401).json({ error: "Incorrect username or password. Contact the admin if you've forgotten your details." });
  }

  await logActivity(`Cashier "${username}" logged in`, "login");
  return res.json({ token: signToken("cashier", username), username });
});

// POST /api/auth/logout — just for the terminal log; the token itself is discarded client-side
router.post("/logout", requireAuth, async (req, res) => {
  const { role, username } = req.user;
  await logActivity(`${role === "admin" ? "Admin" : "Cashier"} "${username}" logged out`, "logout");
  res.json({ ok: true });
});

module.exports = router;
