// models/order.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const diamondSchema = new Schema(
  {
    shape: { type: String, required: true }, // e.g. 'Round'
    quality: { type: String, required: true }, // e.g. 'G-H_SI'
    weight: { type: Number, required: true },
    pieces: { type: Number, required: true },
  },
  { _id: false },
);

const stoneSchema = new Schema(
  {
    type: { type: String, required: true }, // e.g. 'EM'
    shape: { type: String, required: true }, // e.g. 'Emerald Cut'
    quality: { type: String, required: true }, // e.g. 'natural'
    weight: { type: Number, required: true },
    pieces: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    basicInfo: {
      customerName: { type: String, required: true, trim: true },
      phoneNumber: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      salesPerson: { type: String, required: true },
    },
    metal: {
      purity: { type: String, required: true }, // e.g. '14K'
      weight: { type: Number, required: true },
    },
    diamonds: [diamondSchema],
    stones: [stoneSchema],
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
  },
);

module.exports = mongoose.model("Order", orderSchema);
