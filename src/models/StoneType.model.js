const mongoose = require("mongoose");

const stoneTypeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true }, // "Ruby", "Emerald"
    value: { type: String, required: true, unique: true }, // "RUBY", "EMERALD"
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StoneType", stoneTypeSchema);
