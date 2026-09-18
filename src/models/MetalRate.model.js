const mongoose = require("mongoose");

const metalRateSchema = new mongoose.Schema(
  {
    metalType: {
      type: String,
      required: true,
      enum: ["GOLD", "SILVER", "PLATINUM"],
      default: "GOLD",
    },
    purity: { type: String, required: true }, // "18K" — matches MetalPurity.value
    color: { type: String }, // optional — only if color affects rate
    ratePerGram: { type: Number, required: true },
    effectiveDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

metalRateSchema.index({ metalType: 1, purity: 1, color: 1, effectiveDate: -1 });

module.exports = mongoose.model("MetalRate", metalRateSchema);
