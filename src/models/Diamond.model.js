const mongoose = require("mongoose");

const diamondSchema = new mongoose.Schema(
  {
    color: { type: String, required: true }, // D, E, F ... Z
    clarity: { type: String, required: true }, // FL, IF, VVS1 ... I3
    shape: { type: String, default: "ROUND" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Diamond", diamondSchema);
