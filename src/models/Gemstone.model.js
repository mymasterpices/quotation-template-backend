const mongoose = require("mongoose");

const gemstoneSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    size: { type: String, required: true },
    quality: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Gemstone", gemstoneSchema);
