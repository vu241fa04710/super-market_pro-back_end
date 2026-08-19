require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cashierRoutes = require("./routes/cashiers");
const messageRoutes = require("./routes/messages");
const activityRoutes = require("./routes/activity");
const saleRoutes = require("./routes/sales");

const app = express();

app.use(cors());
app.use(express.json());

// ---- API routes ----
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cashiers", cashierRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/sales", saleRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ---- Static frontend ----
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---- Fallback error handler (keeps errors JSON, never a blank crash page) ----
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON request. Use double quotes around property names and string values." });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server. Please try again." });
});

const PORT = Number(process.env.PORT) || 4000;

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Super Market Pro server running on port ${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Retrying on ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error("Server failed to start:", err);
    process.exit(1);
  });
}

connectDB().then(() => {
  startServer(PORT);
});
