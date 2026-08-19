const express = require("express");
const bcrypt = require("bcryptjs");
const Cashier = require("../models/Cashier");
const logActivity = require("../utils/logActivity");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/cashiers — admin only (passwords never sent back)
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const cashiers = await Cashier.find().select("username createdAt").sort({ createdAt: -1 });
  res.json(cashiers);
});

// POST /api/cashiers — admin creates a cashier login
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are both required." });
  }
  const existing = await Cashier.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: "That username already exists." });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await Cashier.create({ username, passwordHash });
  await logActivity(`Admin created cashier account: "${username}"`, "success");
  res.status(201).json({ ok: true, username });
});

// DELETE /api/cashiers/:username — admin only
router.delete("/:username", requireAuth, requireRole("admin"), async (req, res) => {
  const result = await Cashier.findOneAndDelete({ username: req.params.username });
  if (!result) return res.status(404).json({ error: "Cashier not found." });
  await logActivity(`Cashier account removed: "${req.params.username}"`, "warning");
  res.json({ ok: true });
});

module.exports = router;
