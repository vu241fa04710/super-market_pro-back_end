require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const sampleProducts = [
  { name: "Basmati Rice 1kg", category: "Groceries", price: 120, gst: 5, stock: 40 },
  { name: "Toor Dal 1kg", category: "Groceries", price: 95, gst: 5, stock: 35 },
  { name: "Sunflower Oil 1L", category: "Groceries", price: 150, gst: 5, stock: 30 },
  { name: "Amul Milk 500ml", category: "Dairy & Bakery", price: 28, gst: 0, stock: 60 },
  { name: "Bread Loaf", category: "Dairy & Bakery", price: 40, gst: 5, stock: 25 },
  { name: "Paneer 200g", category: "Dairy & Bakery", price: 80, gst: 5, stock: 20 },
  { name: "Tomato 1kg", category: "Fruits & Vegetables", price: 30, gst: 0, stock: 50 },
  { name: "Onion 1kg", category: "Fruits & Vegetables", price: 35, gst: 0, stock: 50 },
  { name: "Banana Dozen", category: "Fruits & Vegetables", price: 50, gst: 0, stock: 40 },
  { name: "Coca-Cola 750ml", category: "Beverages", price: 45, gst: 12, stock: 45 },
  { name: "Real Fruit Juice 1L", category: "Beverages", price: 110, gst: 12, stock: 30 },
  { name: "Lay's Chips 52g", category: "Snacks", price: 20, gst: 12, stock: 80 },
  { name: "Britannia Biscuits", category: "Snacks", price: 30, gst: 18, stock: 70 },
  { name: "Surf Excel 1kg", category: "Household", price: 135, gst: 18, stock: 25 },
  { name: "Dettol Handwash", category: "Household", price: 99, gst: 18, stock: 20 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`Products already exist (${existing}). Skipping seed. Delete them first if you want to reseed.`);
  } else {
    await Product.insertMany(sampleProducts);
    console.log(`Seeded ${sampleProducts.length} sample products.`);
  }
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
