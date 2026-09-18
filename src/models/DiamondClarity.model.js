const mongoose = require("mongoose");

const diamondClaritySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true }, // "VVS1", "SI2"
    value: { type: String, required: true, unique: true }, // "VVS1", "SI2"
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DiamondClarity", diamondClaritySchema);
