const express = require("express");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const logActivity = require("../utils/logActivity");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function round2(n) { return Math.round(n * 100) / 100; }

async function nextBillNumber() {
  const count = await Sale.countDocuments();
  return "SMP" + String(count + 1).padStart(6, "0");
}

// POST /api/sales — cashier only. Prices/GST are re-read from the DB, never trusted from the client.
router.post("/", requireAuth, requireRole("cashier"), async (req, res) => {
  const { items, paymentMethod, cashReceived } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty. Add items before checking out." });
  }
  if (!["QR Payment", "Cash"].includes(paymentMethod)) {
    return res.status(400).json({ error: "Choose a valid payment method." });
  }

  const productIds = items.map(i => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map(p => [String(p._id), p]));

  const saleItems = [];
  for (const line of items) {
    const product = productMap.get(String(line.productId));
    const qty = Number(line.qty);
    if (!product) return res.status(404).json({ error: "One of the items in your cart no longer exists." });
    if (!qty || qty <= 0) return res.status(400).json({ error: `Invalid quantity for "${product.name}".` });
    if (qty > product.stock) {
      return res.status(409).json({ error: `Only ${product.stock} unit(s) of "${product.name}" left in stock.` });
    }
    saleItems.push({
      productId: product._id, name: product.name, category: product.category,
      price: product.price, gst: product.gst, qty,
    });
  }

  const subtotal = round2(saleItems.reduce((a, l) => a + l.price * l.qty, 0));
  const gstTotal = round2(saleItems.reduce((a, l) => a + l.price * l.qty * (l.gst / 100), 0));
  const grandTotal = round2(subtotal + gstTotal);

  let change = 0;
  if (paymentMethod === "Cash") {
    const received = Number(cashReceived);
    if (!received || received < grandTotal) {
      return res.status(400).json({ error: `Insufficient cash. Please collect ₹${(grandTotal - (received || 0)).toFixed(2)} more.` });
    }
    change = round2(received - grandTotal);
  }

  for (const line of saleItems) {
    const result = await Product.updateOne(
      { _id: line.productId, stock: { $gte: line.qty } },
      { $inc: { stock: -line.qty } }
    );
    if (result.modifiedCount === 0) {
      return res.status(409).json({ error: `"${line.name}" just went out of stock. Please refresh the cart.` });
    }
  }

  const billNumber = await nextBillNumber();
  const sale = await Sale.create({
    billNumber,
    cashier: req.user.username,
    items: saleItems,
    subtotal, gstTotal, grandTotal,
    paymentMethod,
    cashReceived: paymentMethod === "Cash" ? Number(cashReceived) : undefined,
    change: paymentMethod === "Cash" ? change : undefined,
  });

  await logActivity(
    `Sale completed by "${req.user.username}" — ${billNumber} — ₹${grandTotal.toFixed(2)} via ${paymentMethod}`,
    "success"
  );

  res.status(201).json({
    billNumber,
    createdAt: sale.createdAt,
    cashier: req.user.username,
    items: saleItems,
    subtotal, gstTotal, grandTotal,
    paymentMethod,
    cashReceived: sale.cashReceived,
    change: sale.change,
  });
});

module.exports = router;
