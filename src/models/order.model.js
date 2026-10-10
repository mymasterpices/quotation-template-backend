const mongoose = require("mongoose");
const { Schema } = mongoose;

const diamondSchema = new Schema(
  {
    shape: { type: String, required: true },
    quality: { type: String, required: true },
    weight: { type: Number, required: true },
    pieces: { type: Number, required: true },
  },
  { _id: false },
);

const stoneSchema = new Schema(
  {
    type: { type: String, required: true },
    shape: { type: String }, // optional: the price calc allows a null shape
    quality: { type: String, required: true },
    weight: { type: Number, required: true },
    pieces: { type: Number, required: true },
  },
  { _id: false },
);

const imageSchema = new Schema(
  {
    name: String, // original file name
    filename: String, // name on disk
    url: { type: String, required: true }, // e.g. /uploads/171234-123.png
    size: Number,
    mimeType: String,
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    category: {
      type: String,
      enum: ["necklace", "ring", "earrings", "bracelet", "bangles", "other"],
      default: "necklace",
    },
    basicInfo: {
      customerName: { type: String, required: true, trim: true },
      phoneNumber: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      salesPerson: { type: String, required: true },
    },
    metal: {
      purity: { type: String, required: true },
      weight: { type: Number, required: true },
    },
    diamonds: [diamondSchema],
    stones: [stoneSchema],
    images: [imageSchema],

    // snapshot of the estimate shown to the customer
    estimate: {
      makingChargePerGram: Number,
      country: { type: String, enum: ["india", "restOfWorld"] },
      countryFactor: Number,
      baseCost: Number,
      total: Number,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
