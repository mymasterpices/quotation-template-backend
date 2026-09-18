require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./src/config/db");
const notFound = require("./src/middleware/notFound");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

// --- DB ---
connectDB();

// --- Core middleware ---
app.use(helmet({ contentSecurityPolicy: false })); // CSP off so Angular assets load cleanly in dev
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// --- API routes ---
app.use("/api/metals", require("./src/routes/metal.routes"));
app.use("/api/diamonds", require("./src/routes/diamond.routes"));
app.use("/api/gemstones", require("./src/routes/gemstone.routes"));
app.use("/api/prices", require("./src/routes/price.routes"));
app.use("/api/customers", require("./src/routes/customer.routes"));
app.use("/api/quotations", require("./src/routes/quotation.routes"));
app.use("/api/metal-purities", require("./src/routes/metalPurity.routes"));

app.use("/api/diamond-colors", require("./src/routes/diamondColor.routes"));
app.use(
  "/api/diamond-clarities",
  require("./src/routes/diamondClarity.routes"),
);
app.use("/api/diamond-shapes", require("./src/routes/diamondShape.routes"));

app.use("/api/stone-types", require("./src/routes/stoneType.routes"));
app.use("/api/stone-sizes", require("./src/routes/stoneSize.routes"));
app.use("/api/stone-qualities", require("./src/routes/stoneQuality.routes"));

app.use("/api/metal-rates", require("./src/routes/metalRate.routes"));
app.use("/api/diamond-rates", require("./src/routes/diamondRate.routes"));
app.use("/api/stone-rates", require("./src/routes/stoneRate.routes"));

app.use(
  "/api/stone-price-charts",
  require("./src/routes/stonePriceChart.routes"),
);

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "API running" }),
);

// --- Serve Angular production build ---
// ng build now outputs into public/browser (relative to this file), e.g.
// via a custom outputPath in angular.json — not the client/dist/... path
// Angular 17's default new-build layout produces.
const clientBuildPath = path.join(__dirname, "public", "browser");
app.use(express.static(clientBuildPath));

// SPA fallback — anything not matched by /api routes goes to Angular's index.html
app.get("/*splat", (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) return next();
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
