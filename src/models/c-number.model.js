const mongoose = require("mongoose");

const cNumberSchema = new mongoose.Schema(
  {
    india: {
      type: Number,
      required: true,
      default: 130,
    },
    restOfWorld: {
      type: Number,
      required: true,
      default: 150,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("CNumber", cNumberSchema);
