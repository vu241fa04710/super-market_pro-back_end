const express = require("express");
const Message = require("../models/Message");
const logActivity = require("../utils/logActivity");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// POST /api/messages — public: a cashier without a login can send this from the login page
router.post("/", async (req, res) => {
  const { from, text } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Please write a short message before sending." });
  }
  const message = await Message.create({ from: (from || "Unnamed cashier").trim(), text: text.trim() });
  await logActivity(`New message from "${message.from}" requesting login access`, "info");
  res.status(201).json({ ok: true, id: message._id });
});

// GET /api/messages — admin only
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

// GET /api/messages/unread-count — admin only, used for the sidebar badge
router.get("/unread-count", requireAuth, requireRole("admin"), async (req, res) => {
  const count = await Message.countDocuments({ resolved: false });
  res.json({ count });
});

// PATCH /api/messages/:id/resolve — admin only
router.patch("/:id/resolve", requireAuth, requireRole("admin"), async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, { resolved: true }, { new: true });
  if (!message) return res.status(404).json({ error: "Message not found." });
  res.json(message);
});

module.exports = router;
