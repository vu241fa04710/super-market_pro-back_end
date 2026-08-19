const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ["info", "success", "warning", "error", "login", "logout"], default: "info" },
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
