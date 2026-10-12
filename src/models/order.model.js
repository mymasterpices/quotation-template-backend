const mongoose = require("mongoose");
const { Schema } = mongoose;

// shared pricing snapshot for every priced line
const pricing = {
  rate: { type: Number, required: true, min: 0 }, // rate that applied (per ct)
  rateRange: { type: String }, // e.g. "0.01 - 0.04 ct"
  amount: { type: Number, required: true, min: 0 }, // final line amount in INR
};

const diamondSchema = new Schema(
  {
    shape: { type: String, required: true },
    quality: { type: String, required: true },
    weight: { type: Number, required: true },
    pieces: { type: Number, required: true },
    ...pricing,
  },
  { _id: false },
);

const stoneSchema = new Schema(
  {
    type: { type: String, required: true },
    label: { type: String },
    shape: { type: String },
    quality: { type: String, required: true },
    weight: { type: Number, required: true },
    pieces: { type: Number, required: true },
    ...pricing,
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
      rate: { type: Number }, // gold rate per gram used
      amount: { type: Number }, // metal value
    },
    diamonds: [diamondSchema],
    stones: [stoneSchema],
    images: [imageSchema],

    estimate: {
      makingChargePerGram: Number,
      makingCharge: Number, // makingChargePerGram * metal.weight
      diamondTotal: Number, // sum of diamonds[].amount
      stoneTotal: Number, // sum of stones[].amount
      country: { type: String, enum: ["india", "restOfWorld"] },
      countryFactor: Number,
      baseCost: Number,
      total: Number,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
