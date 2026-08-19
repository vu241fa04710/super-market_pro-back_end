const express = require("express");
const Product = require("../models/Product");
const logActivity = require("../utils/logActivity");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/products — admin or cashier
router.get("/", requireAuth, async (req, res) => {
  const products = await Product.find().sort({ category: 1, name: 1 });
  res.json(products);
});

// POST /api/products — admin only
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, category, price, gst, stock } = req.body || {};
  if (!name || !category || price === undefined || gst === undefined || stock === undefined) {
    return res.status(400).json({ error: "Please fill in every field before adding a product." });
  }
  if (Number(price) < 0 || Number(stock) < 0 || Number(gst) < 0) {
    return res.status(400).json({ error: "Price, GST and stock cannot be negative." });
  }
  const product = await Product.create({ name, category, price, gst, stock });
  await logActivity(`Product added: "${name}" (${category}) — ₹${Number(price).toFixed(2)}`, "success");
  res.status(201).json(product);
});

// DELETE /api/products/:id — admin only
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found." });
  await logActivity(`Product removed: "${product.name}"`, "warning");
  res.json({ ok: true });
});

module.exports = router;
