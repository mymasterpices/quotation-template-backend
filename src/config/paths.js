const path = require("path");
const fs = require("fs");

// This file lives at server/src/config/paths.js
// ../../ => server/   so UPLOAD_DIR => server/uploads
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// Make sure the folder exists so multer never fails on a missing directory
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

module.exports = { UPLOAD_DIR };
