const Activity = require("../models/Activity");

async function logActivity(text, type = "info") {
  try {
    await Activity.create({ text, type });
  } catch (err) {
    console.error("Failed to write activity log:", err.message);
  }
}

module.exports = logActivity;
