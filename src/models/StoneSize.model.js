const mongoose = require("mongoose");

const stoneSizeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true }, // "Small", "Medium"
    value: { type: String, required: true, unique: true }, // "SMALL", "MEDIUM"
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StoneSize", stoneSizeSchema);
