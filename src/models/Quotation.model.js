const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: String, required: true, unique: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    salesPerson: { type: String, required: true },

    metal: {
      purity: String,
      weight: Number,
      ratePerGram: Number,
      amount: Number,
    },
    diamond: {
      color: String,
      clarity: String,
      weight: Number,
      pieces: Number,
      ratePerCarat: Number,
      amount: Number,
    },
    stone: {
      type: String,
      size: String,
      weight: Number,
      pieces: Number,
      ratePerCarat: Number,
      amount: Number,
    },

    makingCharges: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["DRAFT", "SENT", "CONFIRMED", "REJECTED"],
      default: "DRAFT",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Quotation", quotationSchema);
