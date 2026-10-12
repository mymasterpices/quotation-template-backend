require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");

const connectDB = require("./src/config/db");
const { UPLOAD_DIR } = require("./src/config/paths"); // single source of truth for uploads
const notFound = require("./src/middleware/notFound");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

// --- DB ---
connectDB();

// --- Core middleware ---
app.use(
  helmet({
    contentSecurityPolicy: false, // CSP off so Angular assets load cleanly in dev
    crossOriginResourcePolicy: { policy: "cross-origin" }, // lets <img> load /uploads from another origin
  }),
);
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// --- Uploaded images (served before the SPA fallback) ---
console.log("Serving uploads from:", UPLOAD_DIR);
console.log("Files found:", fs.readdirSync(UPLOAD_DIR).length); // remove once images load

app.use("/uploads", express.static(UPLOAD_DIR));

// --- API routes ---
app.use("/api/metal-purities", require("./src/routes/metalPurity.routes"));
app.use("/api/metal-rates", require("./src/routes/metalRate.routes"));
app.use("/api/c-numbers", require("./src/routes/cNumber.routes"));
app.use(
  "/api/stone-price-charts",
  require("./src/routes/stonePriceChart.routes"),
);
app.use("/api", require("./src/routes/order.routes"));

// --- Health check ---
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "API running" }),
);

// --- Serve Angular production build ---
const clientBuildPath = path.join(__dirname, "public", "browser");
app.use(express.static(clientBuildPath));

// SPA fallback: skip /api and /uploads so missing files return a real 404
app.get("/*splat", (req, res, next) => {
  if (
    req.originalUrl.startsWith("/api") ||
    req.originalUrl.startsWith("/uploads")
  ) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// --- Multer upload errors (must be BEFORE notFound / errorHandler) ---
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "Each image must be 5MB or smaller",
      LIMIT_FILE_COUNT: "Too many images (max 10)",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field",
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] || err.message,
    });
  }
  if (err.message === "Only JPG and PNG images are allowed") {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err); // everything else goes to your existing errorHandler
});

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5900;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
