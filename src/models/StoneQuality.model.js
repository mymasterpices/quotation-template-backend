const mongoose = require("mongoose");

const stoneQualitySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true }, // "AA", "AAA", "Natural"
    value: { type: String, required: true, unique: true }, // "AA", "AAA", "NATURAL"
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StoneQuality", stoneQualitySchema);
