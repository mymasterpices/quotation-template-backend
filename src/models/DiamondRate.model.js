const mongoose = require("mongoose");

const diamondRateSchema = new mongoose.Schema(
  {
    color: { type: String, required: true }, // matches DiamondColor.value
    clarity: { type: String, required: true }, // matches DiamondClarity.value
    shape: { type: String }, // optional — only if shape affects rate
    ratePerCarat: { type: Number, required: true },
    effectiveDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

diamondRateSchema.index({ color: 1, clarity: 1, shape: 1, effectiveDate: -1 });

module.exports = mongoose.model("DiamondRate", diamondRateSchema);
