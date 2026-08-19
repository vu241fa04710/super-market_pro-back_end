const express = require("express");
const Activity = require("../models/Activity");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/activity — admin only, most recent first
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const activity = await Activity.find().sort({ createdAt: -1 }).limit(300);
  res.json(activity);
});

module.exports = router;
