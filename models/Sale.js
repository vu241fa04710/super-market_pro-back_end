const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  category: String,
  price: Number,
  gst: Number,
  qty: Number,
}, { _id: false });

const saleSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  cashier: { type: String, required: true },
  items: [saleItemSchema],
  subtotal: Number,
  gstTotal: Number,
  grandTotal: Number,
  paymentMethod: { type: String, enum: ["QR Payment", "Cash"], required: true },
  cashReceived: Number,
  change: Number,
}, { timestamps: true });

module.exports = mongoose.model("Sale", saleSchema);
