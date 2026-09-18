const mongoose = require("mongoose");

const metalPuritySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true }, // "18K"
    value: { type: String, required: true, unique: true }, // "18K"
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MetalPurity", metalPuritySchema);
