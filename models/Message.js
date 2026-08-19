const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true },
  resolved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
