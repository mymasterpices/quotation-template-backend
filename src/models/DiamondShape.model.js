const mongoose = require("mongoose");

const diamondShapeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true }, // "Round", "Princess"
    value: { type: String, required: true, unique: true }, // "ROUND", "PRINCESS"
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DiamondShape", diamondShapeSchema);
