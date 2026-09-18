const mongoose = require("mongoose");

const diamondColorSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true }, // "D", "E", "F"
    value: { type: String, required: true, unique: true }, // "D", "E", "F"
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DiamondColor", diamondColorSchema);
