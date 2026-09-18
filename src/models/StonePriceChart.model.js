const mongoose = require("mongoose");

const rateBandSchema = new mongoose.Schema(
  {
    sizeMin: { type: Number, required: true }, // carat, inclusive
    sizeMax: { type: Number, required: true }, // carat, inclusive

    // Used when pricingModel = 'GRADE_BANDED' (diamonds) and/or stones priced by "Natural" column
    gradeRates: {
      "G-H_SI": Number,
      "G-H_VS-SI": Number,
      "I-J_SI": Number,
      "G-H_VS": Number,
      "I-J_VS-SI": Number,
      natural: Number,
      enhanced: Number,
    },

    // Used when pricingModel = 'SIZE_BANDED_FLAT' or 'SINGLE_FLAT'
    flatRate: Number,
  },
  { _id: false },
);

const stonePriceChartSchema = new mongoose.Schema(
  {
    stoneType: { type: String, required: true }, // "Diamond White"
    stoneCode: { type: String, required: true }, // "DW"

    pricingModel: {
      type: String,
      required: true,
      enum: ["GRADE_BANDED", "SIZE_BANDED_FLAT", "SINGLE_FLAT"],
    },

    shape: { type: String },
    shapeCode: { type: String },

    bands: [rateBandSchema],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StonePriceChart", stonePriceChartSchema);
