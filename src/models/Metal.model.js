const mongoose = require("mongoose");

const metalSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["GOLD", "SILVER", "PLATINUM"],
      default: "GOLD",
    },
    color: {
      type: String,
      required: true,
      enum: ["YELLOW", "WHITE", "ROSE"],
      default: "YELLOW",
    },
    purity: {
      type: String,
      required: true,
    }, // 14K, 18K, 22K
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Metal", metalSchema);
