const mongoose = require("mongoose");

const priceMasterSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["METAL", "DIAMOND", "GEMSTONE"],
    },

    // Metal pricing
    metalType: { type: String }, // GOLD, SILVER, PLATINUM
    purity: { type: String }, // 14K, 18K, 22K
    ratePerGram: { type: Number },

    // Diamond pricing
    color: { type: String },
    clarity: { type: String },
    ratePerCarat: { type: Number },

    // Gemstone pricing
    stoneType: { type: String },
    size: { type: String },
    stoneRatePerCarat: { type: Number },

    effectiveDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PriceMaster", priceMasterSchema);
