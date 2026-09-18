const mongoose = require("mongoose");

const stoneRateSchema = new mongoose.Schema(
  {
    stoneType: { type: String, required: true }, // matches StoneType.value
    size: { type: String, required: true }, // matches StoneSize.value
    quality: { type: String, required: true }, // matches StoneQuality.value
    ratePerCarat: { type: Number, required: true },
    effectiveDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

stoneRateSchema.index({ stoneType: 1, size: 1, quality: 1, effectiveDate: -1 });

module.exports = mongoose.model("StoneRate", stoneRateSchema);
